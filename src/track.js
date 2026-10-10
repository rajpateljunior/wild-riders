/* Track generation. Deterministic from the track seed so every device builds the identical course. */

const SEG = 200;          // segment length (world units)
const ROAD_W = 2000;      // road half-width (world units) — x = ±1 is the road edge
const CAM_H = 1000;       // camera height
const CAM_D = 0.84;       // focal factor (≈ 100° fov)
const PLAYER_DIST = CAM_H * CAM_D;

function buildTrack(def) {
  const biome = BIOMES[def.biome];
  const R = rng(def.seed);
  const segs = [];
  let y = 0;
  const add = (curve, dy, extra) => {
    const i = segs.length;
    const s = { i, y1: y, y2: y + dy, curve, w: 1, split: 0, dark: ((i / 3) | 0) % 2, sprites: [], decal: null, surface: null, ramp: null, vent: null, clip: 0, objs: [] };
    if (extra) Object.assign(s, extra);
    y += dy;
    segs.push(s);
    return s;
  };
  // eased section: enter, hold, leave counts; curve strength; total drop
  const section = (enter, hold, leave, curve, drop) => {
    const total = enter + hold + leave;
    const startY = y;
    for (let n = 0; n < total; n++) {
      let c;
      if (n < enter) c = curve * easeIn(n / enter);
      else if (n < enter + hold) c = curve;
      else c = curve * (1 - easeIn((n - enter - hold) / leave));
      const t0 = n / total, t1 = (n + 1) / total;
      const dy = (easeInOut(t1) - easeInOut(t0)) * drop;
      add(c, dy);
    }
    return startY;
  };
  function easeIn(t) { return t * t; }
  function easeInOut(t) { return -Math.cos(t * Math.PI) / 2 + 0.5; }

  // ---- 1. Layout ----
  section(0, 40, 0, 0, 0);                         // start straight
  const H = def.hilly, C = def.curvy;
  while (segs.length < def.len) {
    const r = R();
    const len = 40 + ((R() * 90) | 0);
    const dir = R() < 0.5 ? -1 : 1;
    const drop = -(SEG * (8 + R() * 34) * H);       // mostly downhill
    if (r < 0.38) section(14, len, 14, dir * (2 + R() * 4.5) * C, drop);
    else if (r < 0.55) { section(10, len / 2, 10, dir * (3 + R() * 3) * C, drop * 0.5); section(10, len / 2, 10, -dir * (3 + R() * 3) * C, drop * 0.5); }
    else if (r < 0.72) { section(12, 16, 12, 0, SEG * (6 + R() * 10) * H); section(10, len, 10, dir * R() * 2 * C, drop * 1.4); } // crest then plunge
    else if (r < 0.86) section(8, len, 8, dir * R() * 1.2 * C, drop * 1.6);                                                     // steep chute
    else section(10, len, 10, 0, -SEG * 4);                                                                                    // breather
  }
  const finishIdx = segs.length;
  section(0, 200, 0, 0, -SEG * 10);                // run-out after the finish
  const N = segs.length;

  // ---- 2. Features ----
  const freeAt = (i, span = 6) => { for (let k = i - span; k <= i + span; k++) { const s = segs[k]; if (!s || s.ramp || s.split || s.surface || s.vent || s.decal) return false; } return true; };
  const placeable = (i) => i > 70 && i < finishIdx - 60;

  // split sections (a fork with a median; the riskier side carries pads and a repair kit)
  for (let n = 0; n < def.splits; n++) {
    const i0 = 160 + (((finishIdx - 360) / def.splits) * (n + 0.35 + R() * 0.3)) | 0;
    const len = 90 + ((R() * 50) | 0);
    let ok = true;
    for (let k = i0 - 10; k < i0 + len + 10; k++) if (!segs[k] || segs[k].split || segs[k].ramp) ok = false;
    if (!ok) continue;
    const risky = R() < 0.5 ? -1 : 1;
    for (let k = 0; k < len; k++) {
      const s = segs[i0 + k];
      const t = k < 20 ? k / 20 : k > len - 20 ? (len - k) / 20 : 1;
      s.w = 1 + 0.75 * t;
      s.split = t;
      s.curve *= 0.5;
    }
    const med = BIOME_SCENERY[biome.id].obstacles[0];
    segs[i0 - 12].sprites.push({ id: "sign", x: 0 });
    for (let k = 14; k < len - 14; k += 7) segs[i0 + k].sprites.push({ id: k % 14 === 0 ? med : BIOME_SCENERY[biome.id].near[0][0], x: 0, median: 1 });
    // pads on the risky side, obstacles too
    for (let k = 26; k < len - 30; k += 34) {
      decal(i0 + k, 8, risky * 0.95, 0.4, "boost");
      segs[i0 + k + 16].sprites.push({ id: BIOME_SCENERY[biome.id].obstacles[0], x: risky * (0.95 + (R() < 0.5 ? -0.35 : 0.35)) });
    }
    segs[i0 + ((len / 2) | 0)].objs.push({ kind: "repair", x: risky * 0.95 });
  }

  function decal(i, len, x, hw, type) {
    for (let k = 0; k < len; k++) { const s = segs[i + k]; if (s) s.decal = { type, x0: x - hw, x1: x + hw, k, len }; }
  }

  // ramps (sometimes a pair) — after a ramp: a gap with no obstacles
  for (let n = 0; n < def.ramps; n++) {
    for (let tries = 0; tries < 20; tries++) {
      const i = 120 + ((R() * (finishIdx - 260)) | 0);
      if (!placeable(i) || !freeAt(i, 30)) continue;
      const pair = R() < 0.4;
      const xs = pair ? [-0.5, 0.5] : [pick3(R)];
      segs[i].ramp = xs.map((x) => ({ x }));
      xs.forEach((x) => segs[i].sprites.push({ id: "ramp", x, flat: 1 }));
      // crates high-reward line just after landing
      if (R() < 0.6) segs[i + 26].objs.push({ kind: "crate", x: xs[0] });
      break;
    }
  }
  function pick3(r) { const v = r(); return v < 0.33 ? -0.5 : v < 0.66 ? 0 : 0.5; }

  // boost pads
  for (let n = 0; n < def.pads; n++) {
    for (let tries = 0; tries < 20; tries++) {
      const i = 90 + ((R() * (finishIdx - 200)) | 0);
      if (!placeable(i) || !freeAt(i, 12)) continue;
      decal(i, 8, (R() * 1.2 - 0.6), 0.28, "boost");
      break;
    }
  }

  // biome surfaces
  const surf = { forest: null, desert: "sand", glacier: "ice", ghats: "mud", volcano: "lava", tundra: "ice" }[biome.id];
  if (surf) {
    const count = Math.round(6 * def.haz);
    for (let n = 0; n < count; n++) {
      for (let tries = 0; tries < 20; tries++) {
        const i = 110 + ((R() * (finishIdx - 230)) | 0);
        if (!placeable(i) || !freeAt(i, 18)) continue;
        const len = 18 + ((R() * 26) | 0);
        const hw = surf === "lava" ? 0.22 : 0.35 + R() * 0.35;
        const x = (R() * 2 - 1) * (1 - hw) * 0.9;
        for (let k = 0; k < len; k++) { const s = segs[i + k]; s.surface = { type: surf, x0: x - hw, x1: x + hw, k, len }; }
        break;
      }
    }
    if (biome.id === "ghats") {   // full-width river crossings
      for (let n = 0; n < 3; n++) for (let tries = 0; tries < 20; tries++) {
        const i = 200 + ((R() * (finishIdx - 320)) | 0);
        if (!placeable(i) || !freeAt(i, 16)) continue;
        for (let k = 0; k < 14; k++) segs[i + k].surface = { type: "water", x0: -2, x1: 2, k, len: 14 };
        break;
      }
    }
  }
  // volcano geysers act as natural launchers
  if (biome.id === "volcano") {
    for (let n = 0; n < 6; n++) for (let tries = 0; tries < 20; tries++) {
      const i = 140 + ((R() * (finishIdx - 260)) | 0);
      if (!placeable(i) || !freeAt(i, 20)) continue;
      const x = R() * 1.2 - 0.6;
      segs[i].vent = { x };
      segs[i].sprites.push({ id: "vent", x, flat: 1 });
      break;
    }
  }

  // on-road obstacles
  const obsIds = BIOME_SCENERY[biome.id].obstacles;
  const nObs = Math.round(26 * def.haz * (def.len / 3500));
  for (let n = 0; n < nObs; n++) {
    for (let tries = 0; tries < 20; tries++) {
      const i = 100 + ((R() * (finishIdx - 180)) | 0);
      const s = segs[i];
      if (!placeable(i) || s.ramp || s.vent || (segs[i - 1] && segs[i - 1].ramp)) continue;
      // keep landing zones after ramps clear
      let nearRamp = false;
      for (let k = i - 34; k < i; k++) if (segs[k] && (segs[k].ramp || segs[k].vent)) nearRamp = true;
      if (nearRamp) continue;
      if (biome.id === "forest" && R() < 0.35) { s.sprites.push({ id: "log", x: R() < 0.5 ? -0.55 : 0.55 }); break; }
      s.sprites.push({ id: pickW(obsIds, R), x: (R() * 1.6 - 0.8) * s.w });
      break;
    }
  }
  function pickW(arr, r) { return arr[(r() * arr.length) | 0]; }

  // crates: rows of three
  for (let i = 150; i < finishIdx - 80; i += 190 + ((R() * 80) | 0)) {
    if (segs[i].ramp || segs[i].split) continue;
    [-0.6, 0, 0.6].forEach((x) => segs[i].objs.push({ kind: "crate", x: x * segs[i].w }));
  }
  // repair kits near the tricky bits
  for (let n = 0; n < 4; n++) {
    const i = 300 + ((R() * (finishIdx - 450)) | 0);
    segs[i].objs.push({ kind: "repair", x: R() < 0.5 ? -0.8 : 0.8 });
  }

  // ---- 3. Scenery ----
  const set = BIOME_SCENERY[biome.id];
  const wsum = set.near.reduce((a, b) => a + b[1], 0);
  const pickNear = () => { let t = R() * wsum; for (const [id, w] of set.near) { if ((t -= w) <= 0) return id; } return set.near[0][0]; };
  for (let i = 0; i < N; i++) {
    const s = segs[i];
    const edge = s.w;
    if (R() < 0.62) s.sprites.push({ id: pickNear(), x: -(edge + 0.5 + R() * 1.5) });
    if (R() < 0.62) s.sprites.push({ id: pickNear(), x: edge + 0.5 + R() * 1.5 });
    if (i % 4 === 0) {
      const side = R() < 0.5 ? -1 : 1;
      s.sprites.push({ id: set.far[(R() * set.far.length) | 0], x: side * (edge + 2.4 + R() * 4) });
    }
    if (biome.id === "tundra" && i % 24 === 0) { s.sprites.push({ id: "lantern", x: -(edge + 0.22) }); s.sprites.push({ id: "lantern", x: edge + 0.22 }); }
    if (biome.id === "glacier" && i % 30 === 15) s.sprites.push({ id: "gate", x: (i % 60 < 30 ? -1 : 1) * (edge + 0.15) });
    if (i % 140 === 70 && set.special.includes("banner")) s.sprites.push({ id: "banner", x: (i % 280 < 140 ? -1 : 1) * (edge + 0.2) });
  }
  // start & finish dressing
  segs[16].sprites.push({ id: "startgate", x: 0, gate: 1 });
  segs[finishIdx].sprites.push({ id: "arch", x: 0, gate: 1 });
  for (const i of [6, 12, 22, finishIdx - 8, finishIdx - 2, finishIdx + 6]) {
    segs[i].sprites.push({ id: "crowd", x: -(segs[i].w + 0.9) }, { id: "crowd", x: segs[i].w + 0.9 });
  }
  return {
    def, biome, segs, N,
    length: N * SEG,
    finishZ: finishIdx * SEG,
    startZ: 22 * SEG,
  };
}

function segAt(track, z) { return track.segs[(Math.floor(z / SEG) % track.N + track.N) % track.N]; }
function roadY(track, z) {
  const s = segAt(track, z);
  const t = (z % SEG) / SEG;
  return lerp(s.y1, s.y2, t);
}
