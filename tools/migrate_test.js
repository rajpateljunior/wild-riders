// Rider-lineup migration test: feeds realistic OLD saves (before Priya moved to 5th) into the game and checks that
// ONLY the riders reset, coins go up by exactly the refund, everything else is byte-identical, it runs once,
// a backup of the old save is kept, and old save codes get the same treatment.
const { chromium } = require('/opt/npm-tools/node_modules/playwright');
const OLD = { kaito: 0, priya: 0, bruno: 1200, yuki: 1500, zara: 1800, rex: 2200 };
const base = (o) => Object.assign({ v: 1, tl: 2, coins: 500, stars: {}, best: {}, riders: ['kaito', 'priya'], vehs: ['mtb', 'bmx'], upg: {},
  last: { rider: 'kaito', rider2: 'priya', veh: 'mtb', veh2: 'bmx', track: 'f1' }, settings: { music: true, sfx: false, diff: 2, gfx: 'smooth' }, seenHelp: true, races: 0 }, o);
const cases = {
  fresh: base({}),
  veteran: base({ coins: 3456, riders: ['kaito', 'priya', 'bruno', 'yuki', 'zara', 'rex'], vehs: ['mtb', 'bmx', 'ebike', 'dirt', 'atv'],
    stars: { f1: 3, f2: 3, d1: 2, d2: 3, g1: 1, g2: 3, m1: 3 }, best: { f1: 101.23, f2: 140.5, d1: 99.9 }, upg: { mtb: [3, 2, 1], dirt: [1, 1, 1] },
    last: { rider: 'rex', rider2: 'priya', veh: 'dirt', veh2: 'atv', track: 'm1' }, races: 87 }),
  midway: base({ coins: 12, riders: ['kaito', 'priya', 'bruno'], stars: { f1: 2 }, last: { rider: 'priya', rider2: 'bruno', veh: 'bmx', veh2: 'mtb', track: 'f1' }, races: 9 }),
  oldLayout: base({ tl: 1, coins: 800, riders: ['kaito', 'priya', 'bruno', 'yuki'], stars: { f1: 3, f2: 1 }, best: { f1: 120 }, races: 20 }),
};
const keepKeys = ['stars', 'best', 'vehs', 'upg', 'settings', 'seenHelp', 'races', 'tl'];
let fails = 0;
const check = (name, cond, msg) => { if (!cond) { fails++; console.log('FAIL', name, msg); } };
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  for (const [name, old] of Object.entries(cases)) {
    const ctx = await b.newContext({ viewport: { width: 844, height: 390 } });
    const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message));
    await p.addInitScript((s) => { if (!sessionStorage.getItem('seeded')) { localStorage.setItem('wild-riders-save-v1', JSON.stringify(s)); sessionStorage.setItem('seeded', '1'); } }, old);
    await p.goto('http://localhost:8765/index.html'); await p.waitForTimeout(1800);
    const r1 = await p.evaluate(() => ({ save: JSON.parse(localStorage.getItem('wild-riders-save-v1')), backup: JSON.parse(localStorage.getItem('wild-riders-save-v1-backup-rl1') || 'null'), modal: !document.querySelector('#modal').classList.contains('hidden') && document.querySelector('.mbox h3').textContent }));
    const s = r1.save;
    const refund = old.riders.reduce((a, id) => a + OLD[id], 0);
    check(name, JSON.stringify(s.riders) === '["kaito","bruno"]', 'riders ' + JSON.stringify(s.riders));
    check(name, s.coins === old.coins + refund, `coins ${s.coins} expected ${old.coins + refund}`);
    check(name, s.rl === 2, 'rl ' + s.rl);
    for (const k of keepKeys) {
      let want = old[k];
      if (k === 'tl') want = 2;
      if (k === 'best' && (old.tl || 1) < 2) want = {};                     // the older track-layout migration (already shipped) clears these
      if (k === 'settings') want = Object.assign({}, want, { tone: 'arcade' });
      check(name, JSON.stringify(s[k]) === JSON.stringify(want), `${k} changed: ${JSON.stringify(s[k])} vs ${JSON.stringify(want)}`);
    }
    check(name, s.last.veh === old.last.veh && s.last.veh2 === old.last.veh2 && s.last.track === old.last.track, 'last vehicle/track changed');
    check(name, s.riders.includes(s.last.rider) && s.riders.includes(s.last.rider2), 'selected riders not owned');
    check(name, r1.backup && JSON.stringify(r1.backup.riders) === JSON.stringify(old.riders) && r1.backup.coins === old.coins, 'backup missing or wrong');
    check(name, r1.modal === 'RIDER LINEUP UPDATED', 'notice not shown: ' + r1.modal);
    // dismiss and reload: must not run again
    await p.click('#modal [data-a="ok"]'); await p.waitForTimeout(400);
    await p.reload(); await p.waitForTimeout(1800);
    const s2 = await p.evaluate(() => JSON.parse(localStorage.getItem('wild-riders-save-v1')));
    check(name, s2.coins === s.coins && s2.rl === 2 && !s2.note, 'second load changed something: ' + JSON.stringify({ c: s2.coins, n: s2.note }));
    // buying after migration follows the new order
    const order = await p.evaluate(() => RIDERS.map((r) => r.id + ':' + r.cost).join(','));
    check(name, order === 'kaito:0,bruno:0,yuki:1200,zara:1500,priya:1800,rex:2200', 'order ' + order);
    // old save code path
    const code = 'WILDR1-' + Buffer.from(JSON.stringify(old)).toString('base64');
    const s3 = await p.evaluate((code) => { const d = decodeSave(code); return migrateSave(Object.assign(defaultSave(), { tl: 1, rl: 1 }, d)); }, code);
    check(name, JSON.stringify(s3.riders) === '["kaito","bruno"]' && s3.coins === old.coins + refund && JSON.stringify(s3.stars) === JSON.stringify(old.stars), 'save code migration wrong');
    // a NEW code from a migrated save does not re-migrate
    const s4 = await p.evaluate(() => { const d = decodeSave(encodeSave()); return migrateSave(Object.assign(defaultSave(), { tl: 1, rl: 1 }, d)); });
    check(name, s4.coins === s2.coins && !s4.note, 'new code re-migrated');
    check(name, errs.length === 0, 'page errors ' + errs.join(';'));
    console.log(name.padEnd(10), 'refund', refund, 'coins', old.coins, '->', s.coins, 'riders', JSON.stringify(old.riders), '->', JSON.stringify(s.riders));
    await ctx.close();
  }
  // brand-new player
  const ctx = await b.newContext({ viewport: { width: 844, height: 390 } }); const p = await ctx.newPage();
  await p.goto('http://localhost:8765/index.html'); await p.waitForTimeout(1500);
  const n = await p.evaluate(() => ({ s: App.save, modal: document.querySelector('.mbox h3') && !document.querySelector('#modal').classList.contains('hidden') ? document.querySelector('.mbox h3').textContent : null }));
  check('new', JSON.stringify(n.s.riders) === '["kaito","bruno"]' && n.s.coins === 500 && n.s.rl === 2 && !n.s.note, 'new save wrong');
  check('new', n.modal === 'DAILY SPIN', 'new player should see the spin, saw ' + n.modal);
  console.log('new player ', JSON.stringify(n.s.riders), n.s.coins, 'popup:', n.modal);
  await b.close();
  console.log(fails ? fails + ' FAILURES' : 'ALL MIGRATION CHECKS PASSED');
  process.exit(fails ? 1 : 0);
})();
