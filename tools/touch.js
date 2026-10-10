// Verifies touch controls: steer drag, boost hold, punch tap, with multi-touch.
const { chromium } = require('/opt/npm-tools/node_modules/playwright');
(async () => {
  const b = await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
  const ctx = await b.newContext({viewport:{width:844,height:390}, deviceScaleFactor:2, hasTouch:true, isMobile:true});
  const p = await ctx.newPage(); const errs=[]; p.on('pageerror', e => errs.push(e.message));
  await p.goto('http://localhost:8765/index.html'); await p.waitForTimeout(1500);
  await p.evaluate(async () => { App.save.seenHelp = true; App.mode='race'; App.pick={riders:['kaito'],vehs:['mtb'],track:'f1'}; await startRace(); App.race.countdown = 0; });
  const cdp = await ctx.newCDPSession(p);
  const L = await p.evaluate(() => Input.layout.players[0]);
  const T = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map(([x,y,id]) => ({x, y, id})) });
  const x0 = await p.evaluate(() => App.race.humans[0].x);
  // finger 1: steer right; finger 2: hold boost
  await T('touchStart', [[150, 300, 1]]);
  await T('touchMove', [[230, 300, 1]]);
  await T('touchStart', [[230, 300, 1], [L.bst.x, L.bst.y, 2]]);
  await p.waitForTimeout(800);
  const mid = await p.evaluate(() => ({ x: App.race.humans[0].x, steer: Input.players[0].touchSteer, boost: Input.players[0].boost, boosting: App.race.humans[0].boosting }));
  await T('touchEnd', [[230, 300, 1]]);
  await T('touchEnd', []);
  const x1 = await p.evaluate(() => App.race.humans[0].x);
  // punch tap with a rival placed beside us
  await p.evaluate(() => { const r = App.race, me = r.humans[0], o = r.riders.find(e => !e.human); o.z = me.z + 50; o.x = me.x + 0.3; o.hp = o.maxHp; window.__hp = r.riders.filter(e=>!e.human).reduce((a,e)=>a+e.hp,0); window.__o = o; me.atkCD = 0; });
  await T('touchStart', [[L.atk.x, L.atk.y, 3]]); await T('touchEnd', []);
  await p.waitForTimeout(100);
  const hit = await p.evaluate(() => ({ before: window.__hp, after: App.race.riders.filter(e=>!e.human).reduce((a,e)=>a+e.hp,0), atkT: App.race.humans[0].atkT, items: App.race.humans[0].items.length, projs: App.race.projs.length, dz: window.__o.z - App.race.humans[0].z, dx: window.__o.x - App.race.humans[0].x, imm: window.__o.meleeImm, inv: window.__o.invuln, wipe: window.__o.wipeT, fin: window.__o.finished }));
  console.log(JSON.stringify({ x0, mid, x1, hit }));
  console.log(errs.join('\n') || 'no errors'); await b.close();
})();
