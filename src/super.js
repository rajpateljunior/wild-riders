/* Super moves, utility items (shield + mine), aimed throws and ground effect zones (release 2026.10.14).

   SUPER METER  e.sup 0..100. Fills from punches / kicks landed, item hits, takedowns, tricks and (a little) from being hit.
   When full, a SUPER button appears next to BOOST (keyboard: R for player 1, I for player 2). Bots fill slower and use
   theirs only sometimes. One unique move per rider (SUPERS below). Online: the owner sends {k:"super"}; the other phone
   plays the same move on its copy of that rider (visuals + zones), and every phone only ever damages riders it owns.

   ZONES  race.zones = ground patches left by supers: frost (Yuki), sand cloud (Zara), fire (Priya), paint slick (Rex).
   They hurt / slow riders who are not their owner. MINES  race.mines = dropped behind by the mine item.

   Every number here is a tuning knob. */

const SUP_GAIN = { punch: 6, kick: 9, itemHit: 8, takedown: 18, trickPer100: 1.5, hurt: 2, botMul: 0.55 };

const SUPERS = {
  kaito: { name: "TEMPEST", col: "#9fd4ff", desc: "Wind dash: a big burst of speed, and a fan of 5 shurikens ahead." },
  bruno: { name: "TIMBERFALL", col: "#ffb347", desc: "3.5 s juggernaut: can't be slowed, and smashes everyone he touches." },
  yuki: { name: "BLIZZARD STEP", col: "#bfefff", desc: "2.5 s ghost: rides through riders and hazards, leaving a frost trail that slows anyone behind." },
  zara: { name: "MIRAGE", col: "#e9c46a", desc: "Vanishes in a sand swirl for 3 s: can't be hit, rides faster, and the sand cloud blinds rivals." },
  priya: { name: "INFERNO TADKA", col: "#ff7a1f", desc: "4 s flaming trail: anyone who rides through it catches fire." },
  rex: { name: "RIOT", col: "#38e05a", desc: "Paint blast: blinds and slows everyone near him and leaves a slippery green puddle." },
};
function superDef(e) { return SUPERS[e.rider.id] || SUPERS.kaito; }

function addSuper(race, e, amt) {
  if (!e || e.remote || e.finished || race.demo) return;
  if (!e.human) amt *= SUP_GAIN.botMul;
  const was = e.sup || 0;
  e.sup = Math.min(100, was + amt);
  if (was < 100 && e.sup >= 100 && e.human) { popup(e, "SUPER READY!", superDef(e).col, true); race.events.push({ snd: "ready", e }); }
}

/* untargetable right now (Yuki's ghost, Zara's mirage) */
function ghosted(e) { return (e.ghostT || 0) > 0 || (e.mirT || 0) > 0; }

/* ---------- activation ---------- */
function trySuper(race, e) {
  if ((e.sup || 0) < 100 || e.finished || e.wipeT > 0 || race.countdown > 0) return;
  e.sup = 0;
  activateSuper(race, e, false);
  if (race.net && !e.remote) race.net.send({ t: "ev", k: "super", i: race.riders.indexOf(e) });
}

// remote = true: replaying a move that another phone's rider started (visuals, zones, local victims only)
function activateSuper(race, e, remote) {
  const d = superDef(e), id = e.rider.id;
  e.supT = 0.9; e.supCol = d.col;                    // name banner + aura flash-in
  popup(e, d.name + "!", d.col, true);
  race.events.push({ snd: "super", e });
  for (let k = 0; k < 18; k++) spawnFx(race, e.z + rnd(-60, 60), e.x + rnd(-0.25, 0.25), 200 + Math.random() * 500, d.col, 50 + Math.random() * 40, 0.6, 600 + Math.random() * 900);
  if (id === "kaito") {
    e.windT = 1.6;
    if (!remote) {
      e.padT = Math.max(e.padT, 1.6); e.speed = Math.max(e.speed, e.maxSpd * 0.95);
      for (let k = 0; k < 5; k++) {
        const vx = aimVx(race, e, e.z, e.x, ITEMS.shuriken.spd) + (k - 2) * 0.45;
        spawnProjectiles(race, e, "shuriken", 1, e.z, e.x, e.speed, null, vx);
        if (race.net) race.net.send({ t: "ev", k: "throw", i: race.riders.indexOf(e), item: "shuriken", dir: 1, z: e.z, x: e.x, sp: e.speed, id: race.lastProjId, vx });
      }
    }
  } else if (id === "bruno") e.jugT = 3.5;
  else if (id === "yuki") e.ghostT = 2.5;
  else if (id === "zara") { e.mirT = 3; addZone(race, e, "sand", e.z - 200, e.x, 0.6, 3.5); }
  else if (id === "priya") e.fireT = 4;
  else if (id === "rex") {
    e.riotT = 0.7;                                    // the expanding paint shockwave (render.js)
    for (let k = 0; k < 34; k++) fxMove(race, e.z + rnd(-100, 900), e.x + rnd(-1, 1), 100 + Math.random() * 600, k % 3 ? "#38e05a" : "#a8ff7a", 60 + Math.random() * 60, 0.8, 300 + Math.random() * 900, e.speed * 0.85);
    for (const o of race.riders) {
      if (o === e || o.remote || o.wipeT > 0 || o.finished || ghosted(o)) continue;
      const dz = o.z - e.z, dx = Math.abs(o.x - e.x);
      if (dz > -900 && dz < 1600 && dx < 1.3) {
        damage(race, o, 10, e, "super");
        o.speed *= 0.7; o.blindT = Math.max(o.blindT, 2); o.blindCol = "#38e05a"; o.hurtT = Math.max(o.hurtT, 0.5); o.paintT = 3;
        if (o.human) o.shake = 8;
      }
    }
    for (let k = 0; k < 4; k++) addZone(race, e, "slick", e.z - 150 - k * 260, e.x + rnd(-0.3, 0.3), 0.55, 7);
  }
}

/* ---------- every frame, for every rider (also remote copies, so their trails appear on this phone) ---------- */
function superTick(race, e, dt) {
  e.supT = Math.max(0, (e.supT || 0) - dt);
  for (const k of ["windT", "jugT", "ghostT", "mirT", "fireT", "riotT"]) if (e[k] > 0) e[k] -= dt;
  if (e.shieldT !== undefined && e.shield > 0) { e.shieldT -= dt; if (e.shieldT <= 0) e.shield = 0; }
  e.zoneCD = (e.zoneCD || 0) - dt;
  if (e.ghostT > 0 && e.zoneCD <= 0) { e.zoneCD = 0.035; addZone(race, e, "frost", e.z - 120, e.x, 0.32, 4); }
  if (e.mirT > 0 && e.zoneCD <= 0 && e.mirT > 1.5) { e.zoneCD = 0.25; addZone(race, e, "sand", e.z - 180, e.x, 0.45, 2.5); }
  if (e.fireT > 0 && e.zoneCD <= 0) { e.zoneCD = 0.05; addZone(race, e, "fire", e.z - 60, e.x, 0.24, 3); }
  // looks (these particles travel with the rider, so you can see them from your own seat too)
  const vz = e.speed * 0.9;
  if (e.windT > 0 && Math.random() < 0.8) fxMove(race, e.z + rnd(-40, 120), e.x + rnd(-0.25, 0.25), 150 + Math.random() * 450, "#e8f4ff", 26, 0.35, 200, vz);
  if (e.jugT > 0) { fxMove(race, e.z + 10, e.x + rnd(-0.2, 0.2), 20 + Math.random() * 60, "#c9a27a", 55, 0.45, 300, vz * 0.9); if (Math.random() < 0.3) fxMove(race, e.z + 40, e.x + rnd(-0.15, 0.15), 300 + Math.random() * 300, "#ffb347", 30, 0.3, 300, vz); }
  if (e.mirT > 0 && Math.random() < 0.8) fxMove(race, e.z + rnd(-40, 80), e.x + rnd(-0.28, 0.28), 100 + Math.random() * 450, "#e9c46a", 44, 0.45, 300, vz);
  if (e.ghostT > 0 && Math.random() < 0.8) fxMove(race, e.z + 10, e.x + rnd(-0.12, 0.12), 20 + Math.random() * 120, "#d8f4ff", 34, 0.4, 250, vz * 0.85);
  if (e.fireT > 0) for (let k = 0; k < 2; k++) fxMove(race, e.z + 10, e.x + rnd(-0.09, 0.09), 30 + Math.random() * 140, Math.random() < 0.5 ? "#ff7a1f" : "#ffd23f", 46, 0.38, 600, vz * 0.82);
  // marks on riders hit by a move
  if (e.paintT > 0) e.paintT -= dt;
  if (e.frostVis > 0) { e.frostVis -= dt; if (Math.random() < 0.5) fxMove(race, e.z + 10, e.x + rnd(-0.12, 0.12), 60 + Math.random() * 300, "#d8f4ff", 26, 0.3, 200, e.speed * 0.9); }
  if (e.blindT > 0 && e.blindCol === "#e9c46a" && !e.human && Math.random() < 0.4) fxMove(race, e.z + 20, e.x + rnd(-0.15, 0.15), 450 + Math.random() * 150, "#e9c46a", 40, 0.35, 100, e.speed * 0.9);
}
function fxMove(race, z, x, h, col, size, life, vh, vz) {
  spawnFx(race, z, x, h, col, size, life, vh);
  const f = race.fx[race.fx.length - 1]; if (f && f.z === z) f.vz = vz;
}

/* speed bonus while a move runs (multiplies the top speed) */
function superSpeedMul(e) {
  return 1 + ((e.jugT || 0) > 0 ? 0.12 : 0) + ((e.ghostT || 0) > 0 ? 0.18 : 0) + ((e.mirT || 0) > 0 ? 0.18 : 0) + ((e.fireT || 0) > 0 ? 0.1 : 0);
}

/* Bruno's juggernaut: called from riderCollisions when he touches someone */
function juggernautHit(race, a, b) {
  if (b.remote || b.wipeT > 0 || b.finished || ghosted(b)) return;
  b.jugHitT = b.jugHitT || 0;
  if (b.jugHitT > race.time) return;
  b.jugHitT = race.time + 0.8;
  damage(race, b, 14, a, "super");
  b.speed *= 0.6; b.vx += sign(b.x - a.x || 1) * 3; b.hurtT = Math.max(b.hurtT, 0.6);
  if (b.human) b.shake = 10;
  for (let k = 0; k < 8; k++) spawnFx(race, b.z, b.x + rnd(-0.15, 0.15), 300 + Math.random() * 200, "#ffb347", 50, 0.4, 500);
  race.events.push({ snd: "kick", e: a, target: b });
}

/* ---------- zones ---------- */
let zoneSeq = 0;
function addZone(race, owner, type, z, x, w, life) {
  if (!race.zones) race.zones = [];
  if (race.zones.length > 160) race.zones.shift();
  race.zones.push({ type: "zone", kind: type, z, x, w, life, max: life, owner, id: ++zoneSeq, hit: new Set() });
}
function updateZones(race, dt) {
  if (!race.zones || !race.zones.length) return;
  for (const zn of race.zones) zn.life -= dt;
  race.zones = race.zones.filter((zn) => zn.life > 0);
}
/* effects of the ground zones on one rider this frame (only riders this phone owns) */
function zoneEffects(race, e, dt) {
  if (!race.zones || !race.zones.length || e.remote || e.h > 200 || e.wipeT > 0 || e.finished || ghosted(e)) return 1;
  let slow = 1;
  for (const zn of race.zones) {
    if (zn.owner === e || Math.abs(zn.z - e.z) > 220 || Math.abs(zn.x - e.x) > zn.w) continue;
    if (zn.kind === "frost") { slow = Math.min(slow, 0.72); e.frostVis = 0.6; if (!e.frostT || e.frostT < race.time) { e.frostT = race.time + 0.02; e.speed *= 1 - 1.4 * dt; } e.slick = 0.25; }
    else if (zn.kind === "slick") { slow = Math.min(slow, 0.8); e.slick = 0.4; e.speed *= 1 - 0.8 * dt; e.paintT = Math.max(e.paintT || 0, 1); if (!zn.hit.has(e)) { zn.hit.add(e); e.wobble = Math.max(e.wobble, 0.8); } }
    else if (zn.kind === "fire" && !zn.hit.has(e) && !(e.fireHitT > race.time)) {
      zn.hit.add(e); e.fireHitT = race.time + 1.2;
      damage(race, e, 5, zn.owner, "super"); e.burnT = Math.max(e.burnT, 1.8); e.speed *= 0.9;
    } else if (zn.kind === "sand" && !zn.hit.has(e)) {
      zn.hit.add(e); e.blindT = Math.max(e.blindT, 1.4); e.blindCol = "#e9c46a"; e.speed *= 0.85;
    }
  }
  return slow;
}

/* ---------- utility items ---------- */
function isUtil(id) { return !!(id && ITEMS[id] && ITEMS[id].util); }
/* random item from a ? crate: shield 12%, mine 12%, the rider's own throwable 22%, the biome's throwable 54% */
function crateItem(race, e, lucky) {
  const r = Math.random();
  if (lucky) return r < 0.6 ? e.rider.item : r < 0.8 ? "bubble" : race.track.biome.item;
  return r < 0.12 ? "bubble" : r < 0.24 ? "mine" : r < 0.46 ? e.rider.item : race.track.biome.item;
}
function useUtil(race, e) {
  const id = e.items.shift();
  if (id === "bubble") {
    e.shield = 1; e.shieldT = 15;
    popup(e, "SHIELD UP!", "#2bd9c5");
    race.events.push({ snd: "unlock", e });
  } else if (id === "mine") {
    const m = dropMine(race, e, e.z - 260, e.x, null);
    if (race.net) race.net.send({ t: "ev", k: "mine", i: race.riders.indexOf(e), z: m.z, x: m.x, id: m.id });
    popup(e, "MINE DROPPED", "#ff5a5a");
    race.events.push({ snd: "throw", e });
  }
}
let mineSeq = 0;
function dropMine(race, e, z, x, netId) {
  if (!race.mines) race.mines = [];
  const m = { type: "mine", z, x: clamp(x, -1.3, 1.3), owner: e, life: 25, id: netId || (race.net ? race.net.role + ":m" : "m") + (++mineSeq) };
  race.mines.push(m);
  return m;
}
function updateMines(race, dt) {
  if (!race.mines || !race.mines.length) return;
  const keep = [];
  for (const m of race.mines) {
    m.life -= dt;
    let boom = false;
    for (const o of race.riders) {
      if (o === m.owner || o.remote || o.wipeT > 0 || o.finished || o.h > 250 || ghosted(o)) continue;
      if (Math.abs(o.z - m.z) < 170 && Math.abs(o.x - m.x) < 0.26) {
        damage(race, o, 18, m.owner, "item");
        o.speed *= 0.5; o.vh = 900; o.h = Math.max(o.h, 1); o.hurtT = Math.max(o.hurtT, 0.8); o.wobble = 1;
        if (o.human) o.shake = 12;
        mineBoom(race, m);
        race.events.push({ snd: "crash", e: o, by: m.owner });
        if (m.owner && m.owner.human) popup(m.owner, "MINE HIT!", "#ff5a5a");
        addSuper(race, m.owner, SUP_GAIN.itemHit);
        if (race.net) race.net.send({ t: "ev", k: "boom", id: m.id });
        boom = true; break;
      }
    }
    if (!boom && m.life > 0) keep.push(m);
  }
  race.mines = keep;
}
function mineBoom(race, m) {
  for (let k = 0; k < 16; k++) spawnFx(race, m.z + rnd(-60, 60), m.x + rnd(-0.2, 0.2), 60 + Math.random() * 400, k % 2 ? "#ff7a1f" : "#ffd23f", 60 + Math.random() * 40, 0.6, 800 + Math.random() * 600);
}

/* ---------- aimed throws ----------
   A thrown item flies at the nearest rival ahead: it starts with the sideways speed needed to reach where they are,
   then curves gently toward them in flight. Not a lock-on: a quick dodge still makes it miss. */
function throwTarget(race, owner, z, x) {
  let best = null, bd = 1e9;
  for (const o of race.riders) {
    if (o === owner || o.wipeT > 0 || o.finished || ghosted(o)) continue;
    const dz = o.z - z, dx = Math.abs(o.x - x);
    if (dz < 250 || dz > 6500 || dx > 1.1) continue;
    const d = dz + dx * 3000;
    if (d < bd) { bd = d; best = o; }
  }
  return best;
}
function aimVx(race, owner, z, x, spd) {
  const t = throwTarget(race, owner, z, x);
  if (!t) return 0;
  const tl = (t.z - z) / Math.max(1500, owner.speed + spd * 1.15 - t.speed);
  return clamp((t.x - x) / Math.max(0.2, tl), -1.8, 1.8);
}
