// Smoke test: load, screenshot title, start a race, screenshot gameplay.
const { chromium } = require('/opt/npm-tools/node_modules/playwright');
const out = process.argv[2] || '.';
const W = +(process.argv[3]||844), H = +(process.argv[4]||390);
(async () => {
  const b = await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
  const ctx = await b.newContext({viewport:{width:W,height:H}, deviceScaleFactor:2, hasTouch:true, isMobile:true});
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', e => errs.push('PAGEERR ' + e.message));
  p.on('console', m => { if (m.type()==='error') errs.push('CONSOLE ' + m.text()); });
  await require('./nospin')(p); await p.goto('http://localhost:8765/index.html');
  await p.waitForTimeout(2500);
  await p.screenshot({path: out + '/title.png'});
  await p.evaluate(() => { App.save.seenHelp = true; App.mode='race'; App.pick={riders:['kaito'],vehs:['mtb'],track:process_track()}; function process_track(){return new URLSearchParams(location.search).get('t')||'f1'} startRace(); });
  await p.waitForTimeout(3000);
  await p.screenshot({path: out + '/race0.png'});
  await p.waitForTimeout(4000);
  await p.screenshot({path: out + '/race1.png'});
  const st = await p.evaluate(() => { const h = App.race && App.race.humans[0]; return h ? {z:h.z, x:h.x, speed:h.speed, place:h.place, hp:h.hp} : null; });
  console.log(JSON.stringify(st));
  console.log(errs.join('\n') || 'no errors');
  await b.close();
})();
