// Screenshots at chosen spots of a trail: jumps the player to each spot and lets the race run a moment.
// node tools/spots.js <outdir> <W> <H> <trackId> <spot,spot,...> [date]
//   spot = a feature name from the trail's plan (tunnel, bridge, cave, lake, falls, canyon, mtn, gate:<id>, zone:<z>,
//          mover, jump, fork) — the first one found — or a segment number. Optional date = YYYY-MM-DD (seasonal trails).
const { chromium } = require('/opt/npm-tools/node_modules/playwright');
const [out, W, H, tid, spotsArg, date] = [process.argv[2], +process.argv[3], +process.argv[4], process.argv[5], process.argv[6] || '200', process.argv[7]];
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  if (date) await p.addInitScript((d) => { window.WR_DATE = d + 'T12:00:00'; }, date);
  await require('./nospin')(p); await p.goto('http://localhost:8765/index.html'); await p.waitForTimeout(1500);
  await p.evaluate(async (t) => {
    App.save.seenHelp = true; App.mode = 'race';
    App.pick = { riders: ['kaito'], vehs: ['mtb'], track: t };
    window.__auto = true;
    await startRace();
    const r = App.race; r.humans.forEach((h) => (h.ai = { skill: 0.9, aggr: 0.8, t: 0, tx: 0, inp: {} }));
    window.readPlayer = (i) => { const h = App.race && App.race.humans[i]; return h ? Object.assign({}, aiThink(App.race, h, 1 / 60, h.z)) : {}; };
  }, tid);
  await p.waitForTimeout(4500);
  for (const sp of spotsArg.split(',')) {
    const idx = await p.evaluate((sp) => {
      const tr = App.race.track;
      let i = +sp;
      if (isNaN(i)) {
        const [k, v] = sp.split(':');
        const f = tr.segs.find((s) => (k === 'gate' ? s.gateId === v : k === 'zone' ? s.zone === v : k === 'mover' ? s.mover : k === 'jump' ? s.big : k === 'fork' ? s.split > 0.5 : s.feat === k || s.tun === k));
        i = f ? f.i - 14 : 300;
      }
      const me = App.race.humans[0];
      me.z = i * SEG; me.lastSeg = i; me.x = 0; me.speed = me.maxSpd * 0.8;
      for (const e of App.race.riders) if (e !== me) { e.z = me.z + 400 + Math.random() * 3000; e.lastSeg = Math.floor(e.z / SEG); }
      return i;
    }, sp);
    await p.waitForTimeout(1300);
    await p.screenshot({ path: `${out}/${tid}-${sp.replace(/[:]/g, '_')}-${W}x${H}.png` });
    console.log(sp, '-> seg', idx);
  }
  console.log(errs.join('\n') || 'no errors');
  await b.close();
})();
