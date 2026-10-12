// Bot test: an AI drives the human rider through every track; reports finish/place/time.
const { chromium } = require('/opt/npm-tools/node_modules/playwright');
const skill = +(process.argv[2] || 0.9), veh = process.argv[3] || 'mtb', rider = process.argv[4] || 'kaito', only = process.argv[5];
(async () => {
  const b = await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
  const p = await b.newPage({viewport:{width:844,height:390}});
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await require('./nospin')(p); await p.goto('http://localhost:8765/index.html'); await p.waitForTimeout(1200);
  const res = await p.evaluate(async ({skill, veh, rider, only}) => {
    stopDemo(); App.screen = null;
    const out = [];
    for (const t of TRACKS) {
      if (only && t.id !== only) continue;
      const race = await createRace({ trackId: t.id, humans: [{ riderId: rider, vehId: veh, upg: [0,0,0] }], total: 8, difficulty: 1 });
      const me = race.humans[0];
      me.ai = { skill, aggr: 0.6, t: 0, tx: 0, inp: {} };
      let steps = 0, crashes = 0, airs = 0, wasAir = false, minSpd = 1e9, stuck = 0, lastZ = 0;
      const evc = {};
      while (!race.over && steps < 60 * 400) {
        const inp = aiThink(race, me, STEP, me.z);
        stepRace(race, [Object.assign({}, inp)], STEP);
        for (const ev of race.events) if (ev.e === me) evc[ev.snd] = (evc[ev.snd]||0) + 1;
        race.events.length = 0;
        if (me.h > 0 && !wasAir) airs++; wasAir = me.h > 0;
        steps++;
        if (steps % 300 === 0) { if (me.z - lastZ < 2000 && race.countdown <= 0) stuck++; lastZ = me.z; }
      }
      const bots = race.riders.filter(r => !r.human);
      out.push({ id: t.id, fin: me.finished, time: +me.finishTime.toFixed(1), place: me.place, hp: Math.round(me.hp), td: me.takedowns, wipes: me.wipes, tricks: me.trickPts, airs, stuck,
        ev: evc, botsFin: bots.filter(r=>r.finished).length, botWipes: bots.reduce((a,r)=>a+r.wipes,0), botTd: bots.reduce((a,r)=>a+r.takedowns,0),
        segs: race.track.N, lead: Math.round(Math.min(...race.riders.filter(r=>r.finished).map(r=>r.finishTime))) });
    }
    return out;
  }, {skill, veh, rider, only});
  for (const r of res) console.log(JSON.stringify(r));
  console.log(errs.length ? errs.join('\n') : 'no errors');
  await b.close();
})();
