// Full tap-through QA at a given size: menus by tapping, real touch race, pause, tricks, swipe-throw, results, garage, settings, save code, split flow.
const { chromium } = require('/opt/npm-tools/node_modules/playwright');
const W = +process.argv[2], H = +process.argv[3], out = process.argv[4];
const log = (...a) => console.log(`[${W}x${H}]`, ...a);
(async () => {
  const b = await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
  const ctx = await b.newContext({viewport:{width:W,height:H}, deviceScaleFactor:2, hasTouch:true, isMobile:true});
  const p = await ctx.newPage(); const errs=[]; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type()==='error') errs.push(m.text()); });
  const cdp = await ctx.newCDPSession(p);
  const T = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map(([x,y,id]) => ({x, y, id})) });
  const tap = async (sel) => { await p.tap(sel, { force: true }); await p.waitForTimeout(350); };
  const vis = (sel) => p.evaluate((s) => { const e = document.querySelector(s); if (!e) return 'missing'; const r = e.getBoundingClientRect(); return (r.width > 0 && r.right <= innerWidth + 1 && r.bottom <= innerHeight + 1 && r.left >= -1 && r.top >= -1) ? 'ok' : `offscreen ${Math.round(r.left)},${Math.round(r.top)},${Math.round(r.right)},${Math.round(r.bottom)}`; }, sel);
  await p.goto('http://localhost:8765/index.html'); await p.waitForTimeout(2200);
  for (const s of ['[data-act="race"]','[data-act="split"]','[data-act="online"]','[data-act="garage"]','[data-act="settings"]']) log('title btn', s, await vis(s));
  // single race via taps
  await tap('[data-act="race"]'); log('rider screen', await p.evaluate(() => App.screen), 'go', await vis('#rider-go'));
  await tap('#rider-go'); log('veh screen', await p.evaluate(() => App.screen), 'go', await vis('#veh-go'));
  await tap('#veh-go'); await p.waitForTimeout(800); log('track screen', await p.evaluate(() => App.screen), 'go', await vis('#track-go'));
  await tap('#track-go'); await p.waitForTimeout(2500);
  log('help shown', await p.evaluate(() => !$('#modal').classList.contains('hidden') && $('.mbox h3').textContent));
  await p.screenshot({ path: `${out}/qa-help-${W}.png` });
  await tap('#modal [data-a="ok"]');
  await p.waitForTimeout(4300); // countdown
  const L = await p.evaluate(() => Input.layout.players[0]);
  const pz = await p.evaluate(() => Input.layout.pause);
  // steer + boost with two fingers for 3s
  const s0 = await p.evaluate(() => ({ z: App.race.humans[0].z, x: App.race.humans[0].x }));
  await T('touchStart', [[L.ghost.x, L.ghost.y, 1]]); await T('touchMove', [[L.ghost.x - 60, L.ghost.y, 1]]);
  await T('touchStart', [[L.ghost.x - 60, L.ghost.y, 1], [L.bst.x, L.bst.y, 2]]);
  await p.waitForTimeout(1500);
  const s1 = await p.evaluate(() => ({ z: App.race.humans[0].z, x: App.race.humans[0].x, boosting: App.race.humans[0].boosting, steer: Input.players[0].steer }));
  await T('touchEnd', [[L.ghost.x - 60, L.ghost.y, 1]]); await T('touchEnd', []);
  log('moved', Math.round(s1.z - s0.z), 'steerLeft', s1.steer.toFixed(2), 'x', s0.x.toFixed(2), '->', s1.x.toFixed(2), 'boosting', s1.boosting);
  await p.screenshot({ path: `${out}/qa-race-${W}.png` });
  // drift
  await T('touchStart', [[L.brk.x, L.brk.y, 3]]); await p.waitForTimeout(200); log('drift held', await p.evaluate(() => Input.players[0].brake)); await T('touchEnd', []);
  // throw: tap atk with nobody near
  await p.evaluate(() => { const r = App.race, me = r.humans[0]; r.riders.forEach(o => { if (o !== me) o.z = me.z + 5000; }); me.items = ['shuriken','shuriken']; me.atkCD = 0; });
  await T('touchStart', [[L.atk.x, L.atk.y, 4]]); await T('touchEnd', []); await p.waitForTimeout(120);
  log('throw ahead -> projs', await p.evaluate(() => App.race.projs.filter(q => q.dir > 0).length), 'items left', await p.evaluate(() => App.race.humans[0].items.length));
  // swipe down = throw back
  await p.evaluate(() => { App.race.humans[0].atkCD = 0; });
  await T('touchStart', [[L.atk.x, L.atk.y - 40, 5]]); await T('touchMove', [[L.atk.x, L.atk.y + 30, 5]]); await T('touchEnd', []); await p.waitForTimeout(120);
  log('swipe-down -> back projs', await p.evaluate(() => App.race.projs.filter(q => q.dir < 0).length));
  // trick: put rider in the air and tap
  await p.evaluate(() => { const me = App.race.humans[0]; me.h = 600; me.vh = 2400; me.chain = 0; });
  await p.waitForTimeout(60);
  await T('touchStart', [[L.atk.x, L.atk.y, 6]]); await T('touchEnd', []); await p.waitForTimeout(80);
  log('trick started', await p.evaluate(() => App.race.humans[0].trick && App.race.humans[0].trick.def.name), 'button label shows TRICK while airborne');
  await p.waitForTimeout(1500);
  log('trick points', await p.evaluate(() => App.race.humans[0].trickPts));
  // pause via tap
  await T('touchStart', [[pz.x, pz.y, 7]]); await T('touchEnd', []); await p.waitForTimeout(300);
  log('paused', await p.evaluate(() => App.paused), await p.evaluate(() => $('.mbox h3') && $('.mbox h3').textContent));
  const zp = await p.evaluate(() => App.race.humans[0].z); await p.waitForTimeout(500);
  log('frozen while paused', (await p.evaluate(() => App.race.humans[0].z)) === zp);
  await tap('#modal [data-a="resume"]'); log('resumed', await p.evaluate(() => !App.paused));
  // finish race fast, check results
  await p.evaluate(() => { const r = App.race, me = r.humans[0]; me.ai = { skill: .9, aggr: .6, t: 0, tx: 0, inp: {} }; while (!r.over) { stepRace(r, [Object.assign({}, aiThink(r, me, STEP, me.z))], STEP); r.events.length = 0; } r.overT = 0; });
  await p.waitForTimeout(1500); log('results', await p.evaluate(() => App.screen), 'next', await vis('#res-next'), 'retry', await vis('[data-act="retry"]'));
  await p.screenshot({ path: `${out}/qa-results-${W}.png` });
  await tap('#scr-results [data-act="menu"]'); log('back to', await p.evaluate(() => App.screen));
  // garage: buy upgrade
  const c0 = await p.evaluate(() => App.save.coins);
  await tap('[data-act="garage"]'); await p.tap('#veh-upg .btn >> nth=0', { force: true }); await p.waitForTimeout(300);
  log('garage upgrade coins', c0, '->', await p.evaluate(() => App.save.coins), 'lvl', await p.evaluate(() => JSON.stringify(App.save.upg.mtb)));
  await tap('#veh-go');
  // settings toggles + save code
  await tap('[data-act="settings"]'); await p.tap('.seg[data-k="diff"] button >> nth=2', { force: true }); await p.waitForTimeout(200);
  log('difficulty set', await p.evaluate(() => App.save.settings.diff));
  await tap('#modal [data-a="code"]');
  const code = await p.evaluate(() => $('#sc-out').value); await p.fill('#sc-in', code);
  await tap('#modal [data-a="load"]'); await tap('#modal [data-a="load"]');
  log('save code roundtrip', await p.evaluate(() => App.save.settings.diff === 2 && App.screen));
  await p.evaluate(() => { App.save.settings.diff = 1; saveGame(); });
  // split flow by taps
  await tap('[data-act="split"]'); await tap('#rider-go'); await tap('#veh-go');
  log('P2 rider screen', await p.evaluate(() => $('#rider-h').textContent));
  await p.tap('#rider-cards .card >> nth=0', { force: true }); await p.waitForTimeout(120);
  await tap('#rider-go');
  log('after P2 rider-go', await p.evaluate(() => App.step + ' ' + App.screen), await p.evaluate(() => $('#rider-go').textContent + ' disabled=' + $('#rider-go').disabled));
  await p.screenshot({ path: `${out}/qa-p2-${W}.png` });
  await tap('#veh-go'); await p.waitForTimeout(600); await tap('#track-go'); await p.waitForTimeout(6500);
  const sp = await p.evaluate(() => ({ split: App.race.split, humans: App.race.humans.map(h => h.rider.name), pads: Input.layout.players.length }));
  log('split race', JSON.stringify(sp));
  // both players steer at once
  const LS = await p.evaluate(() => Input.layout.players);
  await T('touchStart', [[LS[0].ghost.x, LS[0].ghost.y, 1], [LS[1].ghost.x, LS[1].ghost.y, 2]]);
  await T('touchMove', [[LS[0].ghost.x + 50, LS[0].ghost.y, 1], [LS[1].ghost.x - 50, LS[1].ghost.y, 2]]);
  await p.waitForTimeout(300);
  log('split steer P1/P2', await p.evaluate(() => Input.players[0].steer.toFixed(2) + ' / ' + Input.players[1].steer.toFixed(2)));
  await T('touchEnd', []);
  await p.screenshot({ path: `${out}/qa-split-${W}.png` });
  log('ERRORS:', errs.length ? errs.join(' | ') : 'none');
  await b.close();
})();
