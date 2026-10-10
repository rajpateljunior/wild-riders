/* Race simulation: riders, physics, combat, items, AI. Runs at a fixed 60 Hz step. */

const BASE_SPEED = 11000;
const GRAV = 5200;
const CENT = 0.42;
const STEP = 1 / 60;

function riderVariant(r, dup) {
  if (!dup) return r;
  return Object.assign({}, r, {
    id: r.id, vid: r.id + "-shadow", name: "Shadow " + r.name, full: "Shadow " + r.full,
    main: shade(r.main, -0.55), alt: r.main, paint: shade(r.paint, -0.5), paint2: r.paint, num: r.num + 10, shadow: 1,
  });
}

function makeRiderEntity(rdef, vdef, opts) {
  const upg = opts.upg || [0, 0, 0];
  const e = {
    type: "rider", rider: rdef, veh: vdef, human: !!opts.human, pIndex: opts.pIndex ?? -1, vpIndex: opts.pIndex ?? -1,
    netId: opts.netId ?? null, remote: !!opts.remote,
    z: 0, x: 0, vx: 0, h: 0, vh: 0, speed: 0, lean: 0, tilt: 0, camX: 0, bgX: 0, pedal: 0,
    maxSpd: BASE_SPEED * vdef.max * rdef.spd * (1 + 0.03 * upg[0]),
    accel: BASE_SPEED * 0.3 * vdef.acc * rdef.acc,
    handling: vdef.grip * rdef.hdl * (1 + 0.06 * upg[1]),
    grip: vdef.grip * (1 + 0.06 * upg[1]),
    armor: clamp(vdef.armor + 0.08 * upg[2], -0.2, 0.6),
    mass: vdef.mass * (rdef.id === "bruno" ? 1.25 : rdef.id === "yuki" ? 0.8 : 1),
    pow: rdef.pow, trickMul: vdef.trick,
    maxHp: rdef.hp, hp: rdef.hp, hpShow: rdef.hp,
    boost: 20, items: [rdef.item, rdef.item], boosting: false, padT: 0, drafting: false,
    hurtT: 0, meleeImm: 0, atkT: 0, atkCD: 0, atkSide: 1, atkKick: false, comboN: 0, comboT: 0,
    invuln: 0, flash: 0, wobble: 0, blindT: 0, burnT: 0, shake: 0, fovKick: 0, wipeT: 0,
    trick: null, chain: 0, trickPts: 0, takedowns: 0, wipes: 0,
    finished: false, finishTime: 0, place: 0, popups: [], lastSeg: 0, lastPad: -99,
    ai: opts.human ? null : { skill: opts.skill || 0.85, aggr: 0.5 + Math.random() * 0.5, t: 0, tx: 0, inp: {} },
    sprites: null, face: null,
  };
  return e;
}

function popup(e, txt, col, big, sub) {
  if (!e.human) return;
  e.popups.unshift({ txt, col, big, sub, t: 0, life: big ? 1.6 : 1.1 });
  if (e.popups.length > 3) e.popups.length = 3;
}

/* ---------------- Race setup ---------------- */
async function createRace(cfg, onProgress) {
  const def = TRACKS.find((t) => t.id === cfg.trackId);
  const track = buildTrack(def);
  const biome = track.biome;
  onProgress && onProgress(0.2);
  const assets = await buildWorldSprites(biome);
  onProgress && onProgress(0.5);

  const riders = [];
  const used = {};
  let localIdx = 0;
  cfg.humans.forEach((hm, i) => {
    const r = RIDERS.find((x) => x.id === hm.riderId);
    const dup = used[r.id];
    used[r.id] = (used[r.id] || 0) + 1;
    const e = makeRiderEntity(riderVariant(r, dup), VEHICLES.find((v) => v.id === hm.vehId), { human: !hm.remote, remote: hm.remote, pIndex: i, upg: hm.upg, netId: hm.netId });
    e.human = true; e.local = !hm.remote; e.pIndex = hm.remote ? i : localIdx++; e.mark = i;
    e.name = hm.name || (cfg.humans.length > 1 ? (cfg.online ? (hm.remote ? "Friend" : "You") : "P" + (i + 1)) : "You");
    riders.push(e);
  });
  const total = cfg.total || 8;
  const R = rng(def.seed * 7 + (cfg.botSeed || 0));
  const pool = RIDERS.map((r) => r.id).sort(() => R() - 0.5);
  pool.sort((a, b) => (used[a] || 0) - (used[b] || 0));
  const biomeIdx = def.biome;
  const diff = cfg.difficulty ?? 1;
  for (let i = 0; riders.length < total; i++) {
    const rid = pool[i % pool.length];
    const r = RIDERS.find((x) => x.id === rid);
    const dup = used[rid];
    used[rid] = (used[rid] || 0) + 1;
    const v = VEHICLES[(R() * VEHICLES.length) | 0];
    const lvl = Math.min(3, Math.floor(biomeIdx * 0.6 + R() * 1.2));
    const skill = clamp([0.72, 0.84, 0.95][diff] + biomeIdx * 0.012 + (R() - 0.5) * 0.08, 0.6, 1.02);
    const e = makeRiderEntity(riderVariant(r, dup), v, { skill, upg: [lvl, lvl, lvl] });
    e.name = (dup ? "Shadow " : "") + r.name;
    riders.push(e);
  }
  // start grid: humans in the middle rows
  const order = riders.slice();
  const humans = order.filter((e) => e.human), bots = order.filter((e) => !e.human);
  const grid = bots.slice(0, 2).concat(humans, bots.slice(2));
  grid.forEach((e, i) => {
    e.z = track.startZ - (Math.floor(i / 2)) * 420 - 200;
    e.x = (i % 2 ? 0.42 : -0.42) + (i % 4 > 1 ? 0.1 : -0.1);
    e.camX = e.x;
    e.lastSeg = Math.floor(e.z / SEG);
  });
  // sprites (prebuilt per rider+vehicle)
  for (const e of riders) {
    const key = e.rider.vid || e.rider.id;
    if (!riderSpriteCache[key + ":" + e.veh.id]) {
      const out = {};
      await Promise.all(RIDER_POSES.map(async (pose) => {
        const p = pose.startsWith("ride") ? "ride" : pose;
        out[pose] = await svgToCanvas(riderBackSVG(e.rider, e.veh.id, p, pose === "ride1" ? 1 : 0), SPRITE_W, SPRITE_H);
      }));
      riderSpriteCache[key + ":" + e.veh.id] = out;
    }
    e.sprites = riderSpriteCache[key + ":" + e.veh.id];
    if (e.human) e.face = await faceIcon(e.rider);
  }
  onProgress && onProgress(1);

  const race = {
    cfg, track, assets, riders, humans: riders.filter((e) => e.human && e.local),
    projs: [], fx: [], buckets: {}, time: 0, countdown: 3.99, lastBeep: 4,
    split: cfg.humans.filter((h) => !h.remote).length > 1, over: false, overT: 0, finishOrder: [],
    avalanche: def.avalanche ? { z: track.startZ - 7000, speed: BASE_SPEED * 0.8 } : null,
    storm: def.storm ? { t: 14, on: 0 } : null, stormFog: 0, stormWarn: 0,
    touch: IS_TOUCH, events: [],
  };
  return race;
}

const faceCache = {};
async function faceIcon(r) {
  const key = r.vid || r.id;
  if (faceCache[key]) return faceCache[key];
  // crop the portrait head into a round icon
  const c = await svgToCanvas(portraitSVG(r), 150, 195);
  const out = makeCanvas(96, 96);
  const x = out.getContext("2d");
  x.beginPath(); x.arc(48, 48, 46, 0, TAU); x.fillStyle = r.main; x.fill(); x.save(); x.clip();
  x.drawImage(c, 75 - 62, 25 + 6, 124, 124, 0, 0, 96, 96); x.restore();
  x.lineWidth = 4; x.strokeStyle = "#fff"; x.beginPath(); x.arc(48, 48, 46, 0, TAU); x.stroke();
  faceCache[key] = out;
  return out;
}

/* ---------------- Simulation step ---------------- */
function stepRace(race, inputs, dt) {
  const tr = race.track;
  if (race.hold) { rebuildBuckets(race); return; }
  if (race.countdown > 0) {
    race.countdown -= dt;
    const n = Math.ceil(race.countdown);
    if (n < race.lastBeep) { race.lastBeep = n; race.events.push(n > 0 ? "beep" : "go"); }
    for (const e of race.riders) { e.hpShow = e.hp; updatePopups(e, dt); }
    rebuildBuckets(race);
    return;
  }
  race.time += dt;

  // hazards: avalanche & sandstorm
  if (race.avalanche) {
    const lead = Math.min(...race.riders.filter((e) => !e.finished).map((e) => e.z).concat([tr.finishZ]));
    race.avalanche.speed = BASE_SPEED * (0.7 + Math.min(0.12, race.time * 0.0012));
    race.avalanche.z += race.avalanche.speed * dt;
    race.avalanche.z = Math.max(race.avalanche.z, lead - 9000);
  }
  if (race.storm) {
    const s = race.storm;
    s.t -= dt;
    if (s.t <= 0) { s.on = !s.on; s.t = s.on ? 9 : 16 + Math.random() * 8; if (s.on) { race.stormWarn = 2; race.events.push("storm"); } }
    race.stormFog = lerp(race.stormFog, s.on ? 0.75 : 0, dt * 1.2);
    race.stormWarn = Math.max(0, race.stormWarn - dt);
  }

  // rubber-band reference = best local/remote human
  const humans = race.riders.filter((e) => e.human);
  const humanZ = humans.length ? Math.max(...humans.map((e) => e.z)) : 0;

  for (const e of race.riders) {
    if (e.remote) { remoteFollow(race, e, dt); continue; }
    let inp;
    if (e.human) inp = inputs[e.pIndex] || {};
    else inp = aiThink(race, e, dt, humanZ);
    if (e.finished && e.human) inp = Object.assign({}, aiThink(race, e, dt, humanZ), { attack: false, throwBack: false });
    updateRider(race, e, inp, dt);
  }
  riderCollisions(race);
  updateProjectiles(race, dt);
  updateFx(race, dt);
  // places
  const sorted = race.riders.slice().sort((a, b) => (a.finished && b.finished) ? a.finishTime - b.finishTime : a.finished ? -1 : b.finished ? 1 : b.z - a.z);
  sorted.forEach((e, i) => (e.place = i + 1));
  // end
  const localHumans = race.riders.filter((e) => e.human && e.local);
  if (!race.over && localHumans.length && localHumans.every((e) => e.finished)) { race.over = true; race.overT = 3.2; }
  if (race.over) race.overT -= dt;
  rebuildBuckets(race);
}

function rebuildBuckets(race) {
  const b = (race.buckets = {});
  const put = (e) => { const i = Math.floor(e.z / SEG); (b[i] || (b[i] = [])).push(e); };
  race.riders.forEach(put);
  race.projs.forEach(put);
  race.fx.forEach(put);
}

function updatePopups(e, dt) {
  for (const p of e.popups) { p.t += dt; p.life -= dt; }
  e.popups = e.popups.filter((p) => p.life > 0);
}

function updateRider(race, e, inp, dt) {
  const tr = race.track;
  // timers
  e.hurtT -= dt; e.atkT -= dt; e.atkCD -= dt; e.invuln -= dt; e.flash -= dt * 2; e.wobble -= dt;
  e.blindT -= dt; e.padT -= dt; e.meleeImm -= dt; e.shake = Math.max(0, e.shake - dt * 30); e.comboT -= dt;
  e.hpShow = lerp(e.hpShow, e.hp, Math.min(1, dt * 6));
  updatePopups(e, dt);
  if (e.burnT > 0) { e.burnT -= dt; damage(race, e, 5 * dt, null, "burn", true); }

  if (e.wipeT > 0) {
    e.wipeT -= dt;
    e.speed *= 1 - 1.8 * dt;
    e.z += e.speed * dt;
    e.h = Math.max(0, e.h - 2000 * dt);
    if (e.wipeT <= 0) respawn(race, e);
    camFollow(race, e, dt, { steer: 0 });
    return;
  }

  let seg = segAt(tr, e.z);
  const pct = e.speed / e.maxSpd;
  // ----- surfaces -----
  let surfMax = 1, slip = false;
  const sf = seg.surface;
  if (sf && e.h <= 0 && e.x >= sf.x0 && e.x <= sf.x1) {
    if (sf.type === "sand") { surfMax = 0.72; if (Math.random() < 0.3) spawnFx(race, e.z - 80, e.x + rnd(-0.1, 0.1), 40, "#f2cf91", 70, 0.6); }
    else if (sf.type === "mud") { surfMax = 0.68; if (Math.random() < 0.35) spawnFx(race, e.z - 60, e.x + rnd(-0.1, 0.1), 60, "#5a2e14", 60, 0.5); }
    else if (sf.type === "water") { surfMax = 0.76; if (Math.random() < 0.6) spawnFx(race, e.z - 40, e.x + rnd(-0.15, 0.15), 120, "#d8f1ff", 70, 0.5, 900); }
    else if (sf.type === "ice") slip = true;
    else if (sf.type === "lava") { damage(race, e, 14 * dt, null, "lava", true); e.burnT = Math.max(e.burnT, 0.8); spawnFx(race, e.z - 40, e.x, 60, "#ff7a1f", 60, 0.5, 600); }
  }
  const offroad = Math.abs(e.x) > seg.w + 0.03 || (seg.split > 0.4 && Math.abs(e.x) < 0.2 * seg.split);
  if (offroad && e.h <= 0) {
    surfMax *= 0.58;
    if (e.human) e.shake = Math.max(e.shake, 2 * pct);
    if (Math.random() < 0.4) spawnFx(race, e.z - 60, e.x + rnd(-0.1, 0.1), 50, tr.biome.ground[0], 80, 0.6);
  }
  e.wrongWay = offroad && Math.abs(e.x) > seg.w + 1.2 && e.human;

  // ----- speed -----
  let max = e.maxSpd * (0.72 + 0.28 * (e.hp / e.maxHp)) * surfMax;
  e.boosting = false;
  if (inp.boost && e.boost > 0.5 && !e.finished) { e.boosting = true; e.boost = Math.max(0, e.boost - 30 * dt); }
  const bonus = Math.max(e.boosting ? 0.28 : 0, e.padT > 0 ? 0.36 : 0) + (e.boosting && e.padT > 0 ? 0.06 : 0);
  max *= 1 + bonus;
  if (e.drafting) { max *= 1.04; e.boost = Math.min(100, e.boost + 8 * dt); }
  if (e.finished) max *= 0.7;
  let accel = e.accel * (e.boosting || e.padT > 0 ? 2.4 : 1);
  const drifting = !!inp.brake && Math.abs(inp.steer || 0) > 0.35 && pct > 0.4 && e.h <= 0;
  if (inp.brake) e.speed -= BASE_SPEED * (drifting ? 0.18 : 0.9) * dt;
  if (e.speed < max) e.speed = Math.min(max, e.speed + accel * dt * (1 - Math.min(0.8, pct * 0.35)));
  else e.speed -= (e.speed - max) * 2.2 * dt;
  if (e.speed < 0) e.speed = 0;
  if (drifting) {
    e.boost = Math.min(100, e.boost + 11 * dt);
    if (Math.random() < 0.5) spawnFx(race, e.z - 30, e.x + rnd(-0.08, 0.08), 30, "#ffd36b", 30, 0.25, 200);
  }
  e.fovKick = lerp(e.fovKick, e.boosting || e.padT > 0 ? 1 : 0, dt * 4);

  // ----- steering -----
  const steer = clamp(inp.steer || 0, -1, 1) * (e.blindT > 0 && !e.human ? 0.4 : 1);
  const rate = 2.15 * e.handling * (drifting ? 1.5 : 1) * (e.h > 0 ? 0.55 : 1) * (0.4 + 0.6 * Math.min(1, pct * 1.5));
  const gripK = e.h > 0 ? 2.5 : slip ? 1.2 : 9 * e.grip;
  e.vx += (steer * rate - e.vx) * Math.min(1, gripK * dt);
  e.x += e.vx * dt;
  if (e.h <= 0) e.x -= CENT * pct * pct * seg.curve * dt * (slip ? 1.35 : 1) * (drifting ? 0.5 : 1);
  e.x = clamp(e.x, -(seg.w + 2.4), seg.w + 2.4);
  e.lean = lerp(e.lean, steer * (drifting ? 1.25 : 0.8) + (e.vx - steer * rate) * 0.08, Math.min(1, dt * 8));

  // ----- air & tricks -----
  if (e.h > 0 || e.vh > 0) {
    e.vh -= GRAV * dt;
    e.h += e.vh * dt;
    if (inp.trick && !e.trick && e.h > 120) {
      const def = TRICKS[(inp.trick - 1) % TRICKS.length];
      e.trick = { def, t: 0, dur: def.dur / e.trickMul };
      race.events.push({ snd: "whoosh", e });
    }
    if (e.trick) {
      e.trick.t += dt;
      if (e.trick.t >= e.trick.dur) {
        const pts = Math.round(e.trick.def.pts * (1 + e.chain * 0.5));
        e.trickPts += pts; e.chain++;
        e.boost = Math.min(100, e.boost + pts / 9);
        popup(e, e.trick.def.name.toUpperCase() + (e.chain > 1 ? " x" + e.chain : ""), "#2bd9c5", false, "+" + pts);
        race.events.push({ snd: "trick", e });
        e.trick = null;
      }
    }
    if (e.h <= 0) land(race, e);
  }

  // ----- track features crossed this frame -----
  const prevSeg = e.lastSeg;
  e.z += e.speed * dt;
  e.pedal += dt * (2 + pct * 7);
  const curSeg = Math.floor(e.z / SEG);
  for (let i = prevSeg + 1; i <= curSeg; i++) {
    const s = tr.segs[i];
    if (!s) continue;
    if (e.h <= 0 && s.ramp) for (const r of s.ramp) if (Math.abs(e.x - r.x) < 0.3) { launch(race, e, 1700 + e.speed * 0.22); break; }
    if (e.h <= 0 && s.vent && Math.abs(e.x - s.vent.x) < 0.32) { launch(race, e, 3600); for (let k = 0; k < 14; k++) spawnFx(race, s.i * SEG, s.vent.x + rnd(-0.2, 0.2), 120 + Math.random() * 120, "#f0f0f0", 40 + k * 60, 1.2, 1400); }
    if (e.h < 380 && e.invuln <= 0) collideSprites(race, e, s);
    for (const o of s.objs) {
      if (o.taken > race.time || Math.abs(e.x - o.x) > 0.34 || e.h > 1100) continue;
      o.taken = race.time + 6;
      if (race.net && !e.remote) race.net.send({ t: "ev", k: "take", s: s.i, o: s.objs.indexOf(o) });
      if (o.kind === "crate") {
        if (e.items.length < 3) e.items.push(Math.random() < 0.25 ? e.rider.item : tr.biome.item);
        popup(e, "+ " + ITEMS[e.items[e.items.length - 1]].name.toUpperCase(), "#ffd23f");
        race.events.push({ snd: "pickup", e });
      } else {
        e.hp = Math.min(e.maxHp, e.hp + e.maxHp * 0.4);
        popup(e, "REPAIRED!", "#2bd96a");
        race.events.push({ snd: "repair", e });
      }
    }
  }
  seg = segAt(tr, e.z);
  const d = seg.decal;
  if (d && d.type === "boost" && e.h <= 0 && e.x >= d.x0 - 0.05 && e.x <= d.x1 + 0.05 && seg.i - d.k !== e.lastPad) {
    e.lastPad = seg.i - d.k; e.padT = 1.4; e.boost = Math.min(100, e.boost + 5);
    race.events.push({ snd: "pad", e });
  }
  e.lastSeg = curSeg;

  // ----- combat -----
  if (inp.attack && e.atkCD <= 0 && e.h <= 0 && !e.finished) attack(race, e);
  if (inp.throwBack && e.atkCD <= 0 && e.items.length && !e.finished) { throwItem(race, e, -1); e.atkCD = 0.4; }

  // ----- avalanche -----
  if (race.avalanche && e.z < race.avalanche.z + 250 && !e.finished) {
    damage(race, e, 18 * dt, null, "avalanche", true);
    e.speed = Math.min(e.speed, e.maxSpd * 0.6);
    if (Math.random() < 0.5) spawnFx(race, e.z - 100, e.x + rnd(-0.4, 0.4), 100, "#ffffff", 120, 0.6, 400);
  }

  // finish
  if (!e.finished && e.z >= tr.finishZ) {
    e.finished = true; e.finishTime = race.time; race.finishOrder.push(e);
    e.trick = null;
    race.events.push({ snd: "finish", e });
  }
  if (e.z > tr.length - SEG * 160) e.speed = Math.min(e.speed, e.maxSpd * 0.4);

  camFollow(race, e, dt, { steer });
}

function camFollow(race, e, dt, inp) {
  if (!e.human && !e.cam) return;
  const seg = segAt(race.track, e.z);
  e.camX = lerp(e.camX, e.x * 0.82, Math.min(1, dt * 7));
  e.tilt = lerp(e.tilt, -(inp.steer || 0) * 0.03 - seg.curve * 0.0045 * (e.speed / e.maxSpd), Math.min(1, dt * 3));
  e.bgX += seg.curve * (e.speed / BASE_SPEED) * dt * 160;
}

function launch(race, e, vh) {
  e.vh = vh; e.h = 1; e.chain = 0;
  race.events.push({ snd: "jump", e });
}

function land(race, e) {
  const fall = -e.vh;
  e.h = 0; e.vh = 0;
  if (e.trick) {
    const p = e.trick.t / e.trick.dur;
    e.trick = null;
    if (p < 0.72) {
      damage(race, e, 18, null, "crash");
      e.speed *= 0.4; e.hurtT = 0.9; e.wobble = 1; e.chain = 0;
      popup(e, "BAILED!", "#ff3b3b", true);
      race.events.push({ snd: "crash", e });
      return;
    }
    popup(e, "SKETCHY!", "#ffcf3a");
  }
  if (e.chain > 0) {
    popup(e, e.chain > 2 ? "INSANE COMBO!" : e.chain > 1 ? "CLEAN COMBO!" : "CLEAN LANDING!", "#ffd23f", e.chain > 1);
    e.padT = Math.max(e.padT, 0.5 + e.chain * 0.25);
    e.chain = 0;
  }
  if (e.human) e.shake = Math.min(10, fall / 400);
  race.events.push({ snd: "land", e });
}

function collideSprites(race, e, s) {
  const assets = race.assets;
  const rHalf = (e.veh.w / ROAD_W) * 0.28;
  for (const sp of s.sprites) {
    if (sp.flat || sp.dead || sp.gate) continue;
    const S = assets.sprites[sp.id];
    if (!S || (!S.solid && !S.obstacle)) continue;
    const half = (S.ww / ROAD_W) * 0.5 * (S.obstacle === "log" ? 0.92 : 0.5);
    if (Math.abs(e.x - sp.x) > half + rHalf) continue;
    if (S.obstacle === "small") {
      sp.dead = true;
      damage(race, e, 5, null, "crash");
      e.speed *= 0.85;
      for (let k = 0; k < 8; k++) spawnFx(race, e.z + 100, sp.x + rnd(-0.15, 0.15), 60 + Math.random() * 100, "#a0783c", 60, 0.7, 700);
      race.events.push({ snd: "bump", e });
      continue;
    }
    damage(race, e, 10 + (e.speed / BASE_SPEED) * 8, null, "crash");
    e.speed *= 0.32;
    const dir = e.x < sp.x ? -1 : 1;
    e.x = sp.x + dir * (half + rHalf + 0.02);
    e.vx = dir * 2.2;
    e.hurtT = 0.7; e.wobble = 1; e.invuln = 0.7;
    if (e.human) e.shake = 12;
    for (let k = 0; k < 10; k++) spawnFx(race, e.z + 60, e.x + rnd(-0.2, 0.2), 80 + Math.random() * 200, "#d9c8a8", 60, 0.7, 900);
    race.events.push({ snd: "crash", e });
    return;
  }
}

function damage(race, e, amt, by, kind, silent) {
  if (e.wipeT > 0 || e.finished) return;
  if (e.remote) {
    // the owner of that rider applies damage on their own device
    if (race.net && (kind === "melee" || kind === "bump")) race.net.queueHit(e, amt, by, kind);
    return;
  }
  if (e.invuln > 0 && (kind === "melee" || kind === "item" || kind === "crash")) return;
  if (kind === "melee") { if (e.meleeImm > 0) return; e.meleeImm = 0.38; }
  // bots hit humans a bit softer (scaled by difficulty) so a good rider isn't ganged into constant wipeouts
  if (by && !by.human && e.human) amt *= [0.6, 0.78, 0.95][race.cfg.difficulty ?? 1];
  e.hp -= amt * (1 - e.armor);
  if (!silent) { e.flash = 1; e.hurtT = Math.max(e.hurtT, 0.35); e.wobble = Math.max(e.wobble, 0.5); }
  if (e.hp <= 0) {
    e.hp = 0; e.wipeT = 1.8; e.trick = null; e.wipes++; e.vh = 0;
    popup(e, "WIPEOUT!", "#ff3b3b", true);
    race.events.push({ snd: "wipe", e });
    if (by) {
      by.takedowns++;
      by.boost = Math.min(100, by.boost + 35);
      popup(by, "TAKEDOWN!", "#ff3d7f", true, "+40 coins");
    }
  }
}

function respawn(race, e) {
  const seg = segAt(race.track, e.z);
  e.hp = Math.round(e.maxHp * 0.65); e.invuln = 2; e.speed = e.maxSpd * 0.5;
  if (race.avalanche && race.avalanche.z > e.z - 2500) race.avalanche.z = e.z - 4000;
  e.x = clamp(e.x, -seg.w * 0.7, seg.w * 0.7); e.vx = 0; e.h = 0; e.vh = 0;
  if (seg.split > 0.3 && Math.abs(e.x) < 0.3) e.x = e.x < 0 ? -0.8 : 0.8;
}

function attack(race, e) {
  let best = null, bd = 1e9;
  for (const o of race.riders) {
    if (o === e || o.wipeT > 0 || o.finished || o.h > 500) continue;
    const dz = Math.abs(o.z - e.z), dx = Math.abs(o.x - e.x);
    if (dz < 320 && dx < 0.58) { const d = dz + dx * 500; if (d < bd) { bd = d; best = o; } }
  }
  if (best) {
    const side = best.x === e.x ? (Math.random() < 0.5 ? -1 : 1) : sign(best.x - e.x);
    e.comboN = e.comboT > 0 ? e.comboN + 1 : 1;
    e.comboT = 1.5;
    const kick = e.comboN % 3 === 0;
    e.atkSide = side; e.atkKick = kick; e.atkT = 0.3; e.atkCD = kick ? 0.6 : 0.42;
    if (race.net && best.remote) race.net.hitInfo = { slow: kick ? 0.72 : 0.9, push: side * (kick ? 3.2 : 1.4) * Math.min(2, e.mass / best.mass) };
    damage(race, best, (kick ? 17 : 9) * e.pow, e, "melee");
    best.speed *= kick ? 0.72 : 0.9;
    best.vx += side * (kick ? 3.2 : 1.4) * Math.min(2, e.mass / best.mass);
    best.hurtT = Math.max(best.hurtT, 0.45);
    if (best.human) best.shake = kick ? 10 : 5;
    for (let k = 0; k < 6; k++) spawnFx(race, best.z, best.x - side * 0.1 + rnd(-0.05, 0.05), 500 + Math.random() * 200, "#fff6a8", 40, 0.3, 300);
    race.events.push({ snd: kick ? "kick" : "punch", e, target: best });
    if (e.human) popup(e, kick ? "KICK!" : "POW!", kick ? "#ff8a1c" : "#fff");
  } else if (e.items.length) {
    throwItem(race, e, 1);
    e.atkT = 0.22; e.atkKick = false; e.atkSide = 1; e.atkCD = 0.4;
  } else {
    e.atkSide = -e.atkSide; e.atkKick = false; e.atkT = 0.25; e.atkCD = 0.35;
    race.events.push({ snd: "swing", e });
  }
}

let projSeq = 0;
function throwItem(race, e, dir) {
  const id = e.items.shift();
  spawnProjectiles(race, e, id, dir, e.z, e.x, e.speed, null);
  if (race.net) race.net.send({ t: "ev", k: "throw", i: race.riders.indexOf(e), item: id, dir, z: e.z, x: e.x, sp: e.speed, id: race.lastProjId });
}
function spawnProjectiles(race, e, id, dir, z, x, sp, netId) {
  const it = ITEMS[id];
  const n = it.spread || 1;
  const base = netId || (race.net ? race.net.role + ":" : "") + (++projSeq);
  race.lastProjId = base;
  for (let k = 0; k < n; k++) {
    race.projs.push({
      type: "proj", item: id, owner: e, z: z + dir * 160, x: x + (n > 1 ? (k - 1) * 0.3 : 0), h: 320, id: base + "/" + k,
      vz: dir > 0 ? sp + it.spd : sp * 0.35, vx: n > 1 ? (k - 1) * 0.5 : 0, life: dir > 0 ? 2.6 : 6, dir, big: id === "boulder",
    });
  }
  race.events.push({ snd: "throw", e });
}

function updateProjectiles(race, dt) {
  const keep = [];
  for (const p of race.projs) {
    p.life -= dt;
    const it = ITEMS[p.item];
    if (it.home && p.dir > 0) {
      let tgt = null, bd = 4000;
      for (const o of race.riders) if (o !== p.owner && o.wipeT <= 0 && o.z > p.z && o.z - p.z < bd) { bd = o.z - p.z; tgt = o; }
      if (tgt) p.vx = lerp(p.vx, (tgt.x - p.x) * 2.5, dt * 4);
    }
    p.z += p.vz * dt; p.x += p.vx * dt;
    p.h = p.dir > 0 ? 300 + Math.sin(p.life * 6) * 40 : Math.max(120, p.h - 400 * dt);
    let hit = false;
    for (const o of race.riders) {
      if (o === p.owner || o.wipeT > 0 || o.finished || o.h > 700 || o.remote) continue;
      if (Math.abs(o.z - p.z) < 200 && Math.abs(o.x - p.x) < 0.3) {
        if (o.invuln > 0) { hit = true; break; }
        damage(race, o, it.dmg, p.owner, "item");
        o.speed *= it.slow; o.hurtT = Math.max(o.hurtT, 0.5);
        if (it.burn) o.burnT = 2.4;
        if (it.blind) { o.blindT = 1.6; o.blindCol = it.col; }
        if (o.human) o.shake = 7;
        for (let k = 0; k < 10; k++) spawnFx(race, p.z, p.x + rnd(-0.2, 0.2), p.h + rnd(-100, 100), it.col, 50, 0.5, 600);
        race.events.push({ snd: "hit", e: o, by: p.owner });
        if (p.owner.human) popup(p.owner, "DIRECT HIT!", "#ffd23f");
        if (race.net) race.net.send({ t: "ev", k: "pop", id: p.id, v: race.riders.indexOf(o) });
        hit = true; break;
      }
    }
    if (!hit && p.life > 0 && Math.abs(p.x) < 3 && p.z < race.track.length) keep.push(p);
  }
  race.projs = keep;
}

function riderCollisions(race) {
  const rs = race.riders;
  for (let i = 0; i < rs.length; i++) {
    const a = rs[i];
    if (a.wipeT > 0) { a.drafting = false; continue; }
    a.drafting = false;
    for (let j = 0; j < rs.length; j++) {
      if (i === j) continue;
      const b = rs[j];
      if (b.wipeT > 0) continue;
      const dz = b.z - a.z, dx = b.x - a.x;
      if (dz > 150 && dz < 1100 && Math.abs(dx) < 0.25 && a.h <= 0) a.drafting = true;
      if (j < i) continue;
      const minDx = ((a.veh.w + b.veh.w) / 2 / ROAD_W) * 0.38;
      if (Math.abs(dz) < 140 && Math.abs(dx) < minDx && Math.abs(a.h - b.h) < 300) {
        const ov = minDx - Math.abs(dx);
        const tot = a.mass + b.mass;
        const s = dx === 0 ? 1 : sign(dx);
        a.x -= s * ov * (b.mass / tot); b.x += s * ov * (a.mass / tot);
        a.vx -= s * 0.8 * (b.mass / tot); b.vx += s * 0.8 * (a.mass / tot);
        const back = dz > 0 ? a : b, front = dz > 0 ? b : a;
        if (back.speed > front.speed) back.speed = front.speed * 0.98;
        if (back.veh.id === "atv" && front.mass < back.mass) { front.speed *= 0.97; damage(race, front, 0.3, null, "bump", true); }
        if ((a.human || b.human) && Math.random() < 0.08) race.events.push({ snd: "bump", e: a.human ? a : b });
      }
    }
  }
}

function spawnFx(race, z, x, h, col, size, life, vh = 0) {
  if (race.fx.length > 220) return;
  race.fx.push({ type: "fx", z, x, h, col, size, life, max: life, vh, vx: rnd(-0.3, 0.3) });
}
function updateFx(race, dt) {
  for (const f of race.fx) { f.life -= dt; f.h += f.vh * dt; f.vh -= 1800 * dt; if (f.h < 0) { f.h = 0; f.vh = 0; } f.x += f.vx * dt; }
  race.fx = race.fx.filter((f) => f.life > 0);
}

/* ---------------- AI ---------------- */
function aiThink(race, e, dt, humanZ) {
  const ai = e.ai || (e.ai = { skill: 0.9, aggr: 0.5, t: 0, tx: 0, inp: {} });
  const inp = ai.inp;
  inp.attack = false; inp.trick = 0; inp.throwBack = false; inp.boost = false; inp.brake = false;
  const tr = race.track;
  const segI = Math.floor(e.z / SEG);
  const seg = tr.segs[segI] || tr.segs[tr.N - 1];
  // rubber band (bots only)
  if (!e.human && !race.cfg.noRubber) {
    const gap = e.z - humanZ;
    const rb = clamp(1 - gap / 28000, 0.88, 1.1);
    const base = BASE_SPEED * e.veh.max * e.rider.spd;
    e.maxSpd = base * (0.86 + 0.14 * ai.skill) * rb;
  }
  ai.t -= dt;
  if (ai.t <= 0) { ai.t = 0.16 + Math.random() * 0.12; ai.tx = chooseLine(race, e, segI); }
  const ahead = tr.segs[Math.min(tr.N - 1, segI + 10)];
  const pct = e.speed / e.maxSpd;
  let steer = (ai.tx - e.x) * 3.4 + ahead.curve * pct * pct * 0.07;
  inp.steer = clamp(steer, -1, 1);
  // brake into hard curves when wide
  const far = tr.segs[Math.min(tr.N - 1, segI + 22)];
  if (Math.abs(far.curve) > 4 && pct > 0.85 && sign(e.x) === -sign(far.curve) && Math.abs(e.x) > 0.6) inp.brake = Math.random() < 0.6;
  if (e.finished) return inp;
  // boost on straights
  if (e.boost > 55 && Math.abs(ahead.curve) < 2 && Math.random() < ai.skill * 0.08) ai.boosting = 1.4;
  if (ai.boosting > 0) { ai.boosting -= dt; inp.boost = e.boost > 2; }
  // combat — pick the nearest candidate (never biased toward humans)
  if (race.time > 3) {
    let mel = null, md = 1e9, ahead = null, ad = 1e9, behind = null, bd = 1e9;
    for (const o of race.riders) {
      if (o === e || o.wipeT > 0 || o.finished) continue;
      const dz = o.z - e.z, dx = Math.abs(o.x - e.x);
      if (Math.abs(dz) < 300 && dx < 0.55) { const d = Math.abs(dz) + dx * 400; if (d < md) { md = d; mel = o; } }
      else if (dz > 300 && dz < 2600 && dx < 0.3 && dz < ad) { ad = dz; ahead = o; }
      else if (dz < -200 && dz > -1200 && dx < 0.3 && -dz < bd) { bd = -dz; behind = o; }
    }
    if (mel && e.atkCD <= 0 && mel.meleeImm <= 0 && Math.random() < ai.aggr * dt * 2.4) inp.attack = true;
    else if (!mel && ahead && e.items.length && Math.random() < ai.skill * dt * 1.0) inp.attack = true;
    else if (behind && e.items.length && Math.random() < ai.skill * dt * 0.6) inp.throwBack = true;
  }
  // tricks in the air
  if (e.h > 150 && !e.trick && e.vh > 600 && Math.random() < ai.skill * 0.12) inp.trick = 1 + ((Math.random() * 4) | 0);
  return inp;
}

function chooseLine(race, e, segI) {
  const tr = race.track, ai = e.ai, skill = ai.skill;
  const segs = tr.segs;
  const look = tr.segs[Math.min(tr.N - 1, segI + 14)];
  const w = look.w;
  const racing = sign(look.curve) * Math.min(0.5, Math.abs(look.curve) * 0.1);
  let bestX = e.x, bestC = 1e9;
  const rHalf = (e.veh.w / ROAD_W) * 0.28;
  for (let c = -4; c <= 4; c++) {
    const cx = (c / 4) * 0.82 * w;
    let cost = Math.abs(cx - racing) * 0.6 + Math.abs(cx - e.x) * 0.35;
    for (let i = segI + 2; i < segI + 34; i++) {
      const s = segs[i];
      if (!s) break;
      const near = 1 - (i - segI) / 36;
      if (s.split > 0.2 && Math.abs(cx) < 0.3 * s.split + rHalf) cost += 6 * near;
      for (const sp of s.sprites) {
        if (sp.flat || sp.dead || sp.gate) continue;
        const S = race.assets.sprites[sp.id];
        if (!S || (!S.solid && !S.obstacle)) continue;
        if (Math.abs(sp.x) > s.w + 0.4) continue;
        const half = (S.ww / ROAD_W) * 0.5 * (S.obstacle === "log" ? 0.92 : 0.5);
        if (Math.abs(cx - sp.x) < half + rHalf + 0.12) cost += 7 * near * (0.6 + skill * 0.4);
      }
      if (s.surface && cx >= s.surface.x0 && cx <= s.surface.x1) cost += (s.surface.type === "lava" ? 4 : 0.8) * near * skill;
      if (s.decal && s.decal.type === "boost" && cx >= s.decal.x0 && cx <= s.decal.x1) cost -= 1.4 * near * skill;
      if (s.ramp) for (const r of s.ramp) if (Math.abs(cx - r.x) < 0.25) cost -= 0.9 * near * skill;
      for (const o of s.objs) if (!(o.taken > race.time) && Math.abs(cx - o.x) < 0.3) cost -= (o.kind === "crate" ? (e.items.length < 3 ? 1 : 0) : (1 - e.hp / e.maxHp) * 3) * near * skill;
      if (Math.abs(cx) > s.w) cost += 3 * near;
    }
    // avoid riding right behind someone when holding no item (they might throw back) — light spacing
    cost += (Math.random() - 0.5) * (1.1 - skill) * 1.2;
    if (cost < bestC) { bestC = cost; bestX = cx; }
  }
  return bestX;
}

/* Remote riders (online): smoothly follow the last received network state. */
function remoteFollow(race, e, dt) {
  const n = e.net;
  if (!n) return;
  n.age += dt;
  const tz = n.z + n.speed * n.age;
  e.z = lerp(e.z, tz, Math.min(1, dt * 10));
  e.x = lerp(e.x, n.x, Math.min(1, dt * 10));
  e.h = n.h; e.speed = n.speed; e.lean = n.lean; e.hp = n.hp; e.boost = n.boost;
  e.boosting = n.boosting; e.padT = n.padT; e.wipeT = n.wipeT; e.atkT = n.atkT; e.atkSide = n.atkSide; e.atkKick = n.atkKick;
  e.trick = n.trick ? { def: TRICKS.find((t) => t.id === n.trick), t: n.trickT, dur: 1 } : null;
  e.hurtT = n.hurtT; e.finished = n.finished; e.finishTime = n.finishTime;
  e.pedal += dt * (2 + (e.speed / e.maxSpd) * 7);
  e.lastSeg = Math.floor(e.z / SEG);
}
