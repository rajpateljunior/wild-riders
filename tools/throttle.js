// Verifies the "push up to go" stick: no thumb = no movement, up = go, up-right = go + steer, down = brake, release = coast to a stop.
const { chromium } = require('/opt/npm-tools/node_modules/playwright');
(async () => {
  const b = await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
  const ctx = await b.newContext({viewport:{width:844,height:390}, deviceScaleFactor:2, hasTouch:true, isMobile:true});
  const p = await ctx.newPage(); const errs=[]; p.on('pageerror', e => errs.push(e.message));
  await p.goto('http://localhost:8765/index.html'); await p.waitForTimeout(1500);
  await p.evaluate(async () => { App.save.seenHelp = true; App.mode='race'; App.pick={riders:['kaito'],vehs:['mtb'],track:'f1'}; await startRace(); App.race.countdown = 0; });
  const cdp = await ctx.newCDPSession(p);
  const T = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map(([x,y,id]) => ({x, y, id})) });
  const st = () => p.evaluate(() => { const h = App.race.humans[0]; return { z: Math.round(h.z), spd: Math.round(h.speed), x: +h.x.toFixed(2) }; });
  const out = {};
  await p.waitForTimeout(1500); out.idle = await st();
  await T('touchStart', [[150, 300, 1]]); await T('touchMove', [[150, 230, 1]]);
  await p.waitForTimeout(2000); out.up = await st();
  await T('touchMove', [[200, 236, 1]]); await p.waitForTimeout(800); out.upRight = await st();
  await T('touchMove', [[150, 345, 1]]); await p.waitForTimeout(600); out.brake = await st();
  await T('touchMove', [[150, 230, 1]]); await p.waitForTimeout(1200); out.upAgain = await st();
  await T('touchEnd', []); await p.waitForTimeout(3500); out.released = await st();
  console.log(JSON.stringify(out));
  const ok = out.idle.spd === 0 && out.up.spd > 5000 && out.upRight.x > out.up.x && out.brake.spd < out.upRight.spd && out.released.spd < 500;
  console.log(ok ? 'PASS' : 'FAIL');
  console.log(errs.join('\n') || 'no errors'); await b.close();
})();
