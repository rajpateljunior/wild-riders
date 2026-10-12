// Verifies auto-accelerate: the bike goes with no thumb on the screen, the stick only steers left / right (up/down does nothing),
// and releasing the stick keeps the bike going.
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
  await p.waitForTimeout(2500); out.noThumb = await st();                       // no finger: still accelerating
  await T('touchStart', [[150, 300, 1]]); await T('touchMove', [[150, 345, 1]]);  // finger pulled DOWN: must not brake
  await p.waitForTimeout(1200); out.pullDown = await st();
  await T('touchMove', [[150, 230, 1]]); await p.waitForTimeout(800); out.pushUp = await st();   // finger pushed UP: must not change anything
  await T('touchMove', [[230, 230, 1]]); await p.waitForTimeout(800); out.right = await st();    // sideways: steers right
  const gas = await p.evaluate(() => readPlayer(0));
  await T('touchEnd', []); await p.waitForTimeout(2500); out.released = await st();               // released: keeps going
  console.log(JSON.stringify(out), JSON.stringify({ throttle: gas.throttle, stop: gas.stop }));
  // speed varies with hills and curves, so the check is "never slows toward a stop" in every phase
  const ok = [out.noThumb, out.pullDown, out.pushUp, out.right, out.released].every((r) => r.spd > 5000) && out.right.x > out.pushUp.x && gas.throttle === 1 && !gas.stop;
  console.log(ok ? 'PASS' : 'FAIL');
  console.log(errs.join('\n') || 'no errors'); await b.close();
})();
