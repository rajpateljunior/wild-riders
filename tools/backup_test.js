// Backup reminder test: not before 3 races; shows the save code (which loads back to the same progress); not again
// until 5 more races AND 3 days have passed.
const { chromium } = require('/opt/npm-tools/node_modules/playwright');
let fails = 0; const check = (c, m) => { if (!c) { fails++; console.log('FAIL', m); } };
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: true });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await require('./nospin')(p); await p.goto('http://localhost:8765/index.html'); await p.waitForTimeout(1500);
  const open = () => p.evaluate(() => !document.querySelector('#modal').classList.contains('hidden') && document.querySelector('.mbox h3').textContent);
  check(await p.evaluate(() => { App.save.races = 2; return backupDue(); }) === false, 'not due before 3 races');
  await p.evaluate(() => { App.save.races = 3; App.save.stars = { f1: 3, d1: 2 }; App.save.coins = 2500; maybeBackupReminder(); });
  await p.waitForTimeout(300);
  check(await open() === 'BACK UP YOUR PROGRESS', 'reminder shown at 3 races');
  await p.screenshot({ path: '/tmp/claude-0/shots/backup.png' });
  const code = await p.evaluate(() => document.querySelector('#bk-code').value);
  const back = await p.evaluate((c) => { const d = decodeSave(c); return d && JSON.stringify(d.stars) + ' ' + d.coins; }, code);
  check(back === '{"f1":3,"d1":2} 2500', 'code holds the progress: ' + back);
  await p.tap('#modal [data-a="done"]'); await p.waitForTimeout(300);
  check(await p.evaluate(() => { App.save.races = 9; return backupDue(); }) === false, 'not again within 3 days');
  check(await p.evaluate(() => { const r = Date.now; Date.now = () => r() + 4 * 864e5; App.save.races = 6; const a = backupDue(); Date.now = r; return a; }) === false, 'not again before 5 more races');
  check(await p.evaluate(() => { const r = Date.now; Date.now = () => r() + 4 * 864e5; App.save.races = 8; const a = backupDue(); Date.now = r; return a; }) === true, 'due after 5 races and 3 days');
  // shows after a real race finishes
  await p.evaluate(() => { localStorage.removeItem('wr-backup'); App.save.races = 2; App.save.seenHelp = true; });
  await p.evaluate(async () => { App.mode = 'race'; App.pick = { riders: ['kaito'], vehs: ['mtb'], track: 'f1' }; await startRace(); App.race.humans[0].finished = true; App.race.humans[0].place = 2; App.race.over = true; App.race.overT = 0; });
  await p.waitForTimeout(3000);
  check(await open() === 'BACK UP YOUR PROGRESS', 'shown on the results screen after the 3rd race, got ' + await open());
  check(errs.length === 0, 'errors ' + errs.join(';'));
  await b.close(); console.log(fails ? fails + ' FAILURES' : 'ALL BACKUP CHECKS PASSED'); process.exit(fails ? 1 : 0);
})();
