// Online test: two browser contexts race each other through a local PeerServer (node tools/peersrv).
const { chromium } = require('/opt/npm-tools/node_modules/playwright');
const URL = 'http://localhost:8765/index.html?peerhost=127.0.0.1&peerport=9000';
const out = process.argv[2];
(async () => {
  const b = await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
  const mk = async () => { const c = await b.newContext({viewport:{width:844,height:390}, deviceScaleFactor:1}); const p = await c.newPage(); p.errs = []; p.on('pageerror', e => p.errs.push(e.message)); p.on('console', m => { if (m.type()==='error') p.errs.push(m.text()); }); await require('./nospin')(p); await p.goto(URL); await p.waitForTimeout(1500); return p; };
  const H = await mk(), G = await mk();
  const auto = () => { window.readPlayer = (i) => { const h = App.race && App.race.humans[i]; if (!h) return {}; h.ai = h.ai || { skill: 0.9, aggr: 0.9, t: 0, tx: 0, inp: {} }; return Object.assign({}, aiThink(App.race, h, 1/60, h.z)); }; };
  await H.evaluate(auto); await G.evaluate(auto);
  await H.evaluate(() => { App.save.seenHelp = true; App.mode = 'online'; App.netRole = 'host'; App.pick = { riders: ['kaito'], vehs: ['mtb'], track: 'd1' }; netHost(); });
  await H.waitForFunction(() => App.net && App.net.peer && App.net.peer.open, null, { timeout: 15000 });
  const code = await H.evaluate(() => App.net.code);
  console.log('room', code);
  await G.evaluate((code) => { App.save.seenHelp = true; App.mode = 'online'; App.netRole = 'guest'; App.save.riders = RIDERS.map(r => r.id); App.pick = { riders: ['priya'], vehs: ['bmx'] }; netJoin(code); }, code);
  await H.waitForFunction(() => App.race && !App.race.hold, null, { timeout: 30000 });
  await G.waitForFunction(() => App.race && !App.race.hold, null, { timeout: 30000 });
  console.log('both racing');
  await H.waitForTimeout(12000);
  const snap = async (p) => p.evaluate(() => { const r = App.race; return { role: App.net && App.net.role, me: r.humans[0].rider.id, riders: r.riders.map(e => (e.remote ? 'R' : 'L') + (e.human ? 'H' : '') + ':' + e.rider.id + ':' + Math.round(e.z/100)) }; });
  const hs = await snap(H), gs = await snap(G);
  console.log('HOST ', JSON.stringify(hs)); console.log('GUEST', JSON.stringify(gs));
  // force a melee: host punches guest
  const hit = await H.evaluate(async () => { const r = App.race, me = r.humans[0], g = r.riders.find(e => e.human && e.remote); g.z = me.z + 40; g.x = me.x + 0.25; me.atkCD = 0; attack(r, me); return { target: r.riders.indexOf(g) }; });
  await G.waitForTimeout(500);
  const ghp = await G.evaluate(() => ({ hp: App.race.humans[0].hp, max: App.race.humans[0].maxHp }));
  console.log('guest hp after punch', JSON.stringify(ghp));
  // super moves + items over the network (release 2026.10.14)
  await H.evaluate(() => { const r = App.race, me = r.humans[0], g = r.riders.find(e => e.human && e.remote); g.z = me.z + 300; g.x = me.x; me.sup = 100; trySuper(r, me); });   // host = Kaito: TEMPEST
  await G.waitForTimeout(400);
  const gk = await G.evaluate(() => { const r = App.race, host = r.riders.find(e => e.human && e.remote); return { hostWind: host.windT > 0, shurikens: r.projs.filter(p => p.item === 'shuriken' && p.owner === host).length }; });
  console.log('guest sees host TEMPEST', JSON.stringify(gk));
  await G.evaluate(() => { const r = App.race, me = r.humans[0]; me.items = ['mine']; useUtil(r, me); });                        // guest drops a mine
  await H.waitForTimeout(400);
  const hm = await H.evaluate(() => ({ mines: (App.race.mines || []).length }));
  console.log('host sees guest mine', JSON.stringify(hm));
  await G.evaluate(() => { const r = App.race, me = r.humans[0], h = r.riders.find(e => e.human && e.remote); h.z = me.z + 200; h.x = me.x; me.sup = 100; trySuper(r, me); });   // guest = Priya: INFERNO TADKA
  await H.waitForTimeout(400);
  const hp2 = await H.evaluate(() => { const r = App.race, g = r.riders.find(e => e.human && e.remote); return { guestFire: g.fireT > 0, fireZones: (r.zones || []).filter(z => z.kind === 'fire').length }; });
  console.log('host sees guest INFERNO', JSON.stringify(hp2));
  const okNet = gk.hostWind && gk.shurikens >= 1 && hm.mines >= 1 && hp2.guestFire && hp2.fireZones > 0;
  console.log(okNet ? 'ONLINE SUPER/ITEM SYNC OK' : 'ONLINE SUPER/ITEM SYNC FAIL');
  await H.screenshot({ path: out + '/online-host.png' }); await G.screenshot({ path: out + '/online-guest.png' });
  // guest leaves → host continues with AI
  await G.evaluate(() => quitRace(false));
  await H.waitForTimeout(1500);
  const after = await H.evaluate(() => ({ net: !!App.race.net, friend: App.race.riders[1].name, remote: App.race.riders[1].remote }));
  console.log('after leave', JSON.stringify(after));
  console.log('host errs', H.errs.join(' | ') || 'none'); console.log('guest errs', G.errs.join(' | ') || 'none');
  await b.close();
})();
