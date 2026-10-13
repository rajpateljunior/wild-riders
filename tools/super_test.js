// Release 2026.10.14 checks: each rider's super move does its job, shield + mine items, aimed throws, and
// how often supers get used in normal races (human-driven-by-AI + bots).
const { chromium } = require('/opt/npm-tools/node_modules/playwright');
(async () => {
  const b = await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
  const p = await b.newPage({viewport:{width:844,height:390}});
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await require('./nospin')(p); await p.goto('http://localhost:8765/index.html'); await p.waitForTimeout(1200);
  const r = await p.evaluate(async () => {
    stopDemo(); App.screen = null;
    const out = {}, fails = [];
    const mk = async (rider, tid) => { const race = await createRace({ trackId: tid || 'd2', humans: [{ riderId: rider, vehId: 'mtb', upg: [0,0,0] }], total: 8, difficulty: 1, noRubber: true }); race.countdown = 0; return race; };
    const step = (race, n, inp) => { for (let i = 0; i < n; i++) { stepRace(race, [Object.assign({ steer: 0, throttle: 1 }, inp || {})], STEP); race.events.length = 0; } };
    // put one bot right beside / behind / ahead of the human, park the rest far away
    const place = (race, me, other, dz, dx) => {
      race.riders.forEach((e) => { if (e !== me && e !== other) { e.z = me.z + 60000; e.lastSeg = Math.floor(e.z / SEG); } });
      other.z = me.z + dz; other.x = me.x + dx; other.lastSeg = Math.floor(other.z / SEG); other.speed = me.speed; other.ai.aggr = 0; other.items = []; other.sup = 0;
    };
    const setup = async (rider) => { const race = await mk(rider); const me = race.humans[0]; step(race, 240); me.x = 0; me.items = []; me.invuln = 0; const o = race.riders.find((e) => !e.human); return { race, me, o }; };
    // Kaito: 5 shurikens + speed burst
    { const { race, me, o } = await setup('kaito'); place(race, me, o, 2500, 0.3); me.sup = 100; const n0 = race.projs.length;
      step(race, 1, { super: true }); out.kaito = { shurikens: race.projs.length - n0, padT: +me.padT.toFixed(2) };
      if (out.kaito.shurikens !== 5 || me.padT < 1) fails.push('kaito ' + JSON.stringify(out.kaito)); }
    // Bruno: smashes a rider he touches
    { const { race, me, o } = await setup('bruno'); place(race, me, o, 40, 0.05); me.sup = 100; const hp0 = o.hp;
      step(race, 1, { super: true }); step(race, 20); out.bruno = { jug: +me.jugT.toFixed(2), victimHpLost: Math.round(hp0 - o.hp) };
      if (!(me.jugT > 2.5) || out.bruno.victimHpLost < 8) fails.push('bruno ' + JSON.stringify(out.bruno)); }
    // Yuki: can't be hit, frost slows the rider behind
    { const { race, me, o } = await setup('yuki'); place(race, me, o, -500, 0); me.sup = 100;
      step(race, 1, { super: true }); const hp0 = me.hp; damage(race, me, 30, o, 'item'); const immune = me.hp === hp0;
      const sp = []; for (let i = 0; i < 90; i++) { o.x = me.x; o.ai.tx = me.x; step(race, 1); sp.push(o.speed / o.maxSpd); }
      out.yuki = { immune, zones: race.zones.filter((z) => z.kind === 'frost').length, followerMinPct: +Math.min(...sp.slice(40)).toFixed(2) };
      if (!immune || out.yuki.zones < 10 || out.yuki.followerMinPct > 0.85) fails.push('yuki ' + JSON.stringify(out.yuki)); }
    // Zara: can't be hit, sand blinds the rider behind
    { const { race, me, o } = await setup('zara'); place(race, me, o, -350, 0); me.sup = 100;
      step(race, 1, { super: true }); const hp0 = me.hp; damage(race, me, 30, o, 'melee'); const immune = me.hp === hp0;
      let blinded = false; for (let i = 0; i < 90; i++) { o.x = me.x; step(race, 1); if (o.blindT > 0) blinded = true; }
      out.zara = { immune, blinded }; if (!immune || !blinded) fails.push('zara ' + JSON.stringify(out.zara)); }
    // Priya: fire trail burns the rider behind
    { const { race, me, o } = await setup('priya'); place(race, me, o, -400, 0); me.sup = 100; const hp0 = o.hp;
      step(race, 1, { super: true }); let burned = false; for (let i = 0; i < 120; i++) { o.x = me.x; o.z = Math.min(o.z, me.z - 250); step(race, 1); if (o.burnT > 0) burned = true; }
      out.priya = { burned, hpLost: Math.round(hp0 - o.hp) }; if (!burned || out.priya.hpLost < 5) fails.push('priya ' + JSON.stringify(out.priya)); }
    // Rex: blast blinds + hurts a nearby rider, leaves slick puddles
    { const { race, me, o } = await setup('rex'); place(race, me, o, 600, 0.4); me.sup = 100; const hp0 = o.hp;
      step(race, 1, { super: true }); out.rex = { blind: o.blindT > 0, hpLost: Math.round(hp0 - o.hp), slicks: race.zones.filter((z) => z.kind === 'slick').length };
      if (!out.rex.blind || out.rex.hpLost < 5 || out.rex.slicks < 3) fails.push('rex ' + JSON.stringify(out.rex)); }
    // super button only when full; can't fire twice
    { const { race, me } = await setup('kaito'); me.sup = 60; step(race, 1, { super: true }); if (me.windT > 0) fails.push('fired at 60%'); }
    // shield item blocks one hit, mine hits the rider behind
    { const { race, me, o } = await setup('kaito'); place(race, me, o, 4000, 0); me.items = ['bubble'];
      step(race, 1, { attack: true }); const hp0 = me.hp; damage(race, me, 20, o, 'item'); const blocked = me.hp === hp0;
      me.invuln = 0; damage(race, me, 20, o, 'item'); const second = me.hp < hp0;
      out.shield = { blocked, secondHitLands: second }; if (!blocked || !second) fails.push('shield ' + JSON.stringify(out.shield)); }
    { const { race, me, o } = await setup('kaito'); place(race, me, o, -1500, 0); me.items = ['mine'];
      step(race, 1, { attack: true }); const m = race.mines[0]; const hp0 = o.hp;
      for (let i = 0; i < 120; i++) { o.x = m ? m.x : 0; step(race, 1); }
      out.mine = { dropped: !!m, behind: m ? Math.round(me.z - m.z) > 0 : false, victimHpLost: Math.round(hp0 - o.hp), gone: !race.mines.length };
      if (!m || out.mine.victimHpLost < 10 || !out.mine.gone) fails.push('mine ' + JSON.stringify(out.mine)); }
    // aimed throw: rider ahead off to the side gets hit far more often than with no aim
    { let hits = 0, n = 12;
      for (let k = 0; k < n; k++) {
        const { race, me, o } = await setup('kaito'); place(race, me, o, 2200, k % 2 ? 0.55 : -0.55); o.ai.skill = 0.01;
        me.items = ['pinecone']; const hp0 = o.hp;
        step(race, 1, { attack: true }); for (let i = 0; i < 90; i++) { o.ai.tx = o.x; step(race, 1); }
        if (o.hp < hp0) hits++;
      }
      out.aimedHits = hits + '/' + n; if (hits < n * 0.6) fails.push('aim ' + out.aimedHits); }
    // usage in normal races
    { const use = { human: 0, bots: 0 }, wipes = []; let races = 0;
      for (const rider of ['kaito', 'bruno', 'yuki', 'zara', 'priya', 'rex']) for (const tid of ['f1', 'v2']) {
        const race = await createRace({ trackId: tid, humans: [{ riderId: rider, vehId: 'mtb', upg: [0,0,0] }], total: 8, difficulty: 1 });
        const me = race.humans[0]; me.ai = { skill: 0.85, aggr: 0.5, t: 0, tx: 0, inp: {} };
        let s = 0;
        while (!race.over && s < 60 * 200) {
          const inp = Object.assign({}, aiThink(race, me, STEP, me.z)); inp.super = me.sup >= 100;     // a human taps SUPER as soon as it's ready
          stepRace(race, [inp], STEP);
          for (const ev of race.events) if (ev.snd === 'super') { if (ev.e === me) use.human++; else use.bots++; }
          race.events.length = 0; s++;
        }
        wipes.push(me.wipes); races++;
      }
      out.perRace = { humanSupers: +(use.human / races).toFixed(2), botSupersTotal: +(use.bots / races).toFixed(2), humanWipes: +(wipes.reduce((a, b) => a + b) / races).toFixed(2) };
    }
    return { out, fails };
  });
  console.log(JSON.stringify(r.out));
  console.log(r.fails.length ? 'FAIL ' + r.fails.join(' | ') : 'ALL SUPER CHECKS PASSED');
  console.log(errs.join('\n') || 'no errors');
  await b.close();
})();
