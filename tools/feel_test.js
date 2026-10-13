// Release 2026.10.13 checks: perfect start (perfect / too early / no tap), drift mini-turbo tiers and burst,
// 3-2-1 after resume, crate respawn (4 s) + back-half catch-up, shared upgrades migration, Avalanche! start.
const { chromium } = require('/opt/npm-tools/node_modules/playwright');
(async () => {
  const b = await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
  const p = await b.newPage({viewport:{width:844,height:390}});
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await require('./nospin')(p); await p.goto('http://localhost:8765/index.html'); await p.waitForTimeout(1200);
  const r = await p.evaluate(async () => {
    stopDemo(); App.screen = null;
    const out = {}, fails = [];
    const mk = async (tid) => createRace({ trackId: tid || 'f1', humans: [{ riderId: 'kaito', vehId: 'mtb', upg: [0,0,0] }], total: 8, difficulty: 1 });
    // --- perfect start
    for (const mode of ['perfect', 'early', 'none']) {
      const race = await mk(); const me = race.humans[0];
      let steps = 0;
      while (race.countdown > 0 || steps < 36) {
        if (race.countdown <= 0) steps++;
        const press = mode === 'perfect' ? race.countdown < 0.35 && race.countdown > 0 : mode === 'early' ? race.countdown < 2 && race.countdown > 1.6 : false;
        stepRace(race, [{ steer: 0, throttle: 1, boost: press }], STEP); race.events.length = 0;
      }
      out[mode] = Math.round(me.speed);
      {
      }
      out[mode + 'Pop'] = (me.popups[0] || {}).txt || '';
    }
    if (!(out.perfect > out.none && out.none > out.early)) fails.push('start speeds ' + JSON.stringify(out));
    // --- drift mini-turbo
    {
      const race = await mk(); race.countdown = 0; const me = race.humans[0];
      for (let i = 0; i < 180; i++) { stepRace(race, [{ steer: 0, throttle: 1 }], STEP); race.events.length = 0; }
      const tiers = [];
      for (let i = 0; i < 170; i++) { stepRace(race, [{ steer: 0.6 * (Math.floor(i / 30) % 2 ? -1 : 1), throttle: 1, brake: true }], STEP); race.events.length = 0; tiers.push(me.driftTier); }
      const tierAtEnd = me.driftTier;
      for (let i = 0; i < 20; i++) { stepRace(race, [{ steer: 0, throttle: 1 }], STEP); race.events.length = 0; }
      out.drift = { tierAt1s: tiers[59], tierAt2s: tiers[119], tierAtEnd, burst: +me.padT.toFixed(2), pop: (me.popups[0] || {}).txt };
      if (!(tiers[59] === 1 && tiers[119] === 2 && tierAtEnd === 3 && me.padT > 1)) fails.push('drift ' + JSON.stringify(out.drift));
    }
    // --- crates: respawn time + catch-up
    {
      const race = await mk(); race.countdown = 0; const me = race.humans[0];
      const seg = race.track.segs.find((s) => s.i > 200 && s.objs.some((o) => o.kind === 'crate'));
      const o = seg.objs.find((o) => o.kind === 'crate');
      o.taken = race.time + RESPAWN_T;
      out.respawn = RESPAWN_T;
      me.items = []; me.z = seg.i * SEG - 300;
      race.riders.forEach((e) => { if (e !== me) { e.z = me.z + 3000; e.lastSeg = Math.floor(e.z / SEG); } });   // everyone ahead: we're last me.lastSeg = Math.floor(me.z / SEG); me.x = o.x; me.speed = 6000;
      for (let i = 0; i < 20; i++) { me.x = o.x; stepRace(race, [{ steer: 0, throttle: 1 }], STEP); race.events.length = 0; }
      out.catchUpBack = me.items.length;
      const race2 = await mk(); race2.countdown = 0; const m2 = race2.humans[0];
      const seg2 = race2.track.segs[seg.i], o2 = seg2.objs.find((x) => x.kind === 'crate');
      o2.taken = race2.time + RESPAWN_T;
      m2.items = []; m2.z = seg.i * SEG - 300; m2.lastSeg = Math.floor(m2.z / SEG); m2.speed = 6000;
      race2.riders.forEach((e) => { if (e !== m2) e.z = m2.z - 5000; });       // leader: no catch-up
      for (let i = 0; i < 20; i++) { m2.x = o2.x; stepRace(race2, [{ steer: 0, throttle: 1 }], STEP); race2.events.length = 0; }
      out.catchUpLeader = m2.items.length;
      if (RESPAWN_T !== 4 || out.catchUpBack !== 1 || out.catchUpLeader !== 0) fails.push('crates ' + JSON.stringify(out));
    }
    // --- shared upgrades migration
    {
      const old = { v: 1, tl: 2, rl: 2, coins: 50, upg: { mtb: [2, 0, 1], dirt: [1, 3, 0], bmx: [0, 1, 3] } };
      const m = migrateSave(Object.assign(defaultSave(), old));
      out.upgAll = m.upgAll;
      if (JSON.stringify(m.upgAll) !== '[2,3,3]') fails.push('upg merge ' + JSON.stringify(m.upgAll));
      const fresh = loadSave.call(null);
      const kept = migrateSave(Object.assign(defaultSave(), { upgAll: [1, 1, 1], upg: { mtb: [3, 3, 3] } }));
      if (JSON.stringify(kept.upgAll) !== '[1,1,1]') fails.push('upg rerun');
      const code = encodeSave(); const back = decodeSave(code);
      if (!back) fails.push('code');
    }
    // --- Avalanche! start: health after 6 s for a decent rider (bot), and that a stopped rider still gets caught
    {
      const hp = [], caught = [];
      for (let k = 0; k < 4; k++) {
        const race = await createRace({ trackId: 'g2', humans: [{ riderId: 'kaito', vehId: 'mtb', upg: [0,0,0] }], total: 8, difficulty: 1, botSeed: k * 7 });
        const me = race.humans[0]; me.ai = { skill: 0.85, aggr: 0.6, t: 0, tx: 0, inp: {} };
        let mg = 1e9;
        while (race.time < 8 || race.countdown > 0) { stepRace(race, [aiThink(race, me, STEP, me.z)], STEP); race.events.length = 0; mg = Math.min(mg, me.z - race.avalanche.z); }
        hp.push(Math.round(mg / 40));   // closest the avalanche got in the first 8 s (m)
        const race2 = await createRace({ trackId: 'g2', humans: [{ riderId: 'kaito', vehId: 'mtb', upg: [0,0,0] }], total: 8, difficulty: 1, botSeed: k * 7 });
        let t = 0;
        while ((race2.time < 25 || race2.countdown > 0)) { stepRace(race2, [{ steer: 0, throttle: 0, stop: true }], STEP); race2.events.length = 0; }
        caught.push(race2.humans[0].wipes > 0 || race2.humans[0].hp < 60);
      }
      out.avalancheMinGapFirst8s_m = hp; out.idleCaught = caught;
      if (hp.some((x) => x < 150) || caught.some((c) => !c)) fails.push('avalanche ' + JSON.stringify({ hp, caught }));
    }
    return { out, fails };
  });
  // --- resume countdown (real loop)
  await p.evaluate(async () => { App.save.seenHelp = true; App.mode = 'race'; App.pick = { riders: ['kaito'], vehs: ['mtb'], track: 'f1' }; await startRace(); App.race.countdown = 0; });
  await p.waitForTimeout(1500);
  await p.evaluate(() => pauseRace());
  const z0 = await p.evaluate(() => { resumeRace(); return App.race.humans[0].z; });
  await p.waitForTimeout(1500);
  const mid = await p.evaluate(() => ({ z: App.race.humans[0].z, t: +App.race.resumeT.toFixed(2) }));
  await p.waitForTimeout(2200);
  const z2 = await p.evaluate(() => App.race.humans[0].z);
  const resume = { frozenMid: mid.z === z0, resumeTMid: mid.t, movingAfter: z2 > z0 };
  if (!resume.frozenMid || !resume.movingAfter) r.fails.push('resume ' + JSON.stringify(resume));
  console.log(JSON.stringify(Object.assign(r.out, { resume })));
  console.log(r.fails.length ? 'FAIL ' + r.fails.join(' | ') : 'ALL FEEL CHECKS PASSED');
  console.log(errs.join('\n') || 'no errors');
  await b.close();
})();
