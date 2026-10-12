// Daily Spin test: spin once, prize saved, no second spin today, popup not shown again, rollback guard, streak logic, odds.
const { chromium } = require('/opt/npm-tools/node_modules/playwright');
let fails = 0; const check = (c, m) => { if (!c) { fails++; console.log('FAIL', m); } };
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: true });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.goto('http://localhost:8765/index.html'); await p.waitForTimeout(1500);
  check(await p.evaluate(() => document.querySelector('.mbox h3').textContent) === 'DAILY SPIN', 'spin popup on first open');
  const before = await p.evaluate(() => ({ c: App.save.coins, perk: App.save.perk }));
  await p.tap('#spin-go'); await p.waitForTimeout(800);
  const mid = await p.evaluate(() => JSON.parse(localStorage.getItem('wild-riders-save-v1')));
  check(mid.spin && mid.spin.last && (mid.coins > before.c || mid.perk), 'prize saved before animation ends');
  await p.waitForTimeout(4200);
  await p.screenshot({ path: '/tmp/claude-0/shots/spin-result.png' });
  const after = await p.evaluate(() => ({ c: App.save.coins, perk: App.save.perk, avail: spinAvailable(), msg: document.querySelector('#spin-msg').textContent, streak: App.save.spin.streak }));
  console.log('spin result:', after.msg, '| coins', before.c, '->', after.c, '| perk', after.perk, '| streak', after.streak);
  check(!after.avail, 'no second spin today');
  await p.reload(); await p.waitForTimeout(1500);
  check(await p.evaluate(() => document.querySelector('#modal').classList.contains('hidden')), 'popup not shown again today');
  check(await p.evaluate(() => document.querySelector('#spin-btn span').textContent.startsWith('SPIN IN')), 'countdown on button');
  // clock rollback: pretend the phone clock goes back 3 days -> still not available
  check(await p.evaluate(() => { const real = Date.now; Date.now = () => real() - 3 * 864e5; const a = spinAvailable(); Date.now = real; return !a; }), 'rollback guard');
  // tomorrow -> available, streak continues; skip a day -> streak resets
  const st = await p.evaluate(() => {
    const real = Date.now; const out = {};
    App.save.spin.seen = 0;
    Date.now = () => real() + 864e5; out.tomorrow = spinAvailable(); out.next = nextStreak();
    Date.now = () => real() + 3 * 864e5; out.gap = nextStreak();
    Date.now = real; App.save.spin.seen = real(); return out;
  });
  check(st.tomorrow && st.next === after.streak + 1 && st.gap === 1, 'streak logic ' + JSON.stringify(st));
  // odds over 100k spins; day 7 guarantee
  const odds = await p.evaluate(() => { const n = {}; for (let i = 0; i < 100000; i++) { const s = pickWheel(1).id; n[s] = (n[s] || 0) + 1; } let d7 = true; for (let i = 0; i < 2000; i++) if (!['c500', 'c1500'].includes(pickWheel(7).id)) d7 = false; return { n, d7 }; });
  console.log('odds per 100k:', JSON.stringify(odds.n));
  check(odds.d7, 'day 7 guaranteed 500+');
  check(Math.abs(odds.n.c1500 / 1000 - 2) < 0.4, 'jackpot ~2%');
  // perk applies in a race and is used up
  const perk = await p.evaluate(async () => { App.save.perk = 'double'; App.mode = 'race'; App.pick = { riders: ['kaito'], vehs: ['mtb'], track: 'f1' }; await startRace(); return { mul: App.race.humans[0].coinMul, left: App.save.perk }; });
  check(perk.mul === 2 && perk.left === null, 'perk applied & consumed ' + JSON.stringify(perk));
  check(errs.length === 0, 'errors ' + errs.join(';'));
  await b.close();
  console.log(fails ? fails + ' FAILURES' : 'ALL SPIN CHECKS PASSED'); process.exit(fails ? 1 : 0);
})();
