// Restore test: if the live save has less progress than a stored older copy (backup or rescue), the game offers it
// back and restoring brings stars, best times, rides, upgrades and races back (riders follow the new order).
const { chromium } = require('/opt/npm-tools/node_modules/playwright');
let fails = 0; const check = (c, m) => { if (!c) { fails++; console.log('FAIL', m); } };
const old = { v: 1, tl: 2, coins: 6300, stars: { f1: 3, f2: 2, d1: 3 }, best: { f1: 88.1 }, riders: ['kaito', 'priya', 'bruno', 'yuki'], vehs: ['mtb', 'bmx', 'ebike', 'dirt'], upg: { mtb: [2, 1, 0] }, last: { rider: 'kaito', rider2: 'priya', veh: 'dirt', veh2: 'bmx', track: 'f1' }, settings: { music: true, sfx: true, diff: 1, gfx: 'auto' }, seenHelp: true, races: 33 };
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  for (const kind of ['backup', 'rescue']) {
    const ctx = await b.newContext({ viewport: { width: 844, height: 390 } }); const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message));
    await p.addInitScript(({ old, kind }) => {
      if (sessionStorage.getItem('seeded')) return; sessionStorage.setItem('seeded', '1');
      if (kind === 'backup') { localStorage.setItem('wild-riders-save-v1-backup-rl1', JSON.stringify(old)); localStorage.setItem('wild-riders-save-v1', JSON.stringify({ v: 1, tl: 2, rl: 2, coins: 500, stars: {}, riders: ['kaito', 'bruno'], vehs: ['mtb', 'bmx'] })); }
      else localStorage.setItem('wild-riders-save-v1', '{broken json');
    }, { old, kind });
    await p.goto('http://localhost:8765/index.html'); await p.waitForTimeout(2000);
    if (kind === 'rescue') {
      // broken save: game starts fresh but parks the raw text; nothing to restore from a broken copy, so just check it was kept
      const k = await p.evaluate(() => localStorage.getItem('wild-riders-save-v1-rescue'));
      check(k === '{broken json', 'unreadable save parked, got ' + k);
      console.log('rescue: unreadable save kept under rescue key:', k === '{broken json');
    } else {
      const h = await p.evaluate(() => document.querySelector('.mbox h3') && document.querySelector('.mbox h3').textContent);
      check(h === 'FOUND YOUR OLDER PROGRESS', 'restore offer shown, got ' + h);
      await p.screenshot({ path: '/tmp/claude-0/shots/restore-offer.png' });
      await p.click('#modal [data-a="yes"]'); await p.waitForTimeout(500);
      const s = await p.evaluate(() => JSON.parse(localStorage.getItem('wild-riders-save-v1')));
      check(JSON.stringify(s.stars) === JSON.stringify(old.stars) && JSON.stringify(s.vehs) === JSON.stringify(old.vehs) && JSON.stringify(s.upg) === JSON.stringify(old.upg) && s.races === 33 && JSON.stringify(s.best) === JSON.stringify(old.best), 'progress restored ' + JSON.stringify(s));
      check(JSON.stringify(s.riders) === '["kaito","bruno"]' && s.coins === 6300 + 2700, 'riders/coins ' + s.coins);
      await p.reload(); await p.waitForTimeout(2000);
      const h2 = await p.evaluate(() => !document.querySelector('#modal').classList.contains('hidden') && document.querySelector('.mbox h3').textContent);
      check(h2 !== 'FOUND YOUR OLDER PROGRESS', 'offer not repeated after restore');
      console.log('backup: restored stars', JSON.stringify(s.stars), 'rides', s.vehs.length, 'coins', s.coins, 'races', s.races);
    }
    check(errs.length === 0, 'errors ' + errs.join(';'));
    await ctx.close();
  }
  await b.close(); console.log(fails ? fails + ' FAILURES' : 'ALL RESTORE CHECKS PASSED'); process.exit(fails ? 1 : 0);
})();
