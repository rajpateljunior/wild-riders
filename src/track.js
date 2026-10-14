/* Track generation. Deterministic from the track seed so every device builds the identical course. */

const SEG = 200;          // segment length (world units)
const ROAD_W = 2000;      // road half-width (world units) — x = ±1 is the road edge
const CAM_H = 1000;       // camera height
const CAM_D = 0.84;       // focal factor (≈ 100° fov)
const PLAYER_DIST = CAM_H * CAM_D;

function buildTrack(def) {
  const biome = Object.assign({}, BIOMES[def.biome], def.look || {});   // look = per-trail sky tint
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

  // ---- 1. Layout: expand this track's hand-written plan (see TRACKS in data.js) ----
  const H = def.hilly, C = def.curvy;
  const plan = def.plan;
  const PIN = 7.2;                                  // hairpin bend strength (you have to ease off to make it)
  const fixedLen = (b) => b.t === "H" ? 54 : b.t === "SW" ? b.k * 54 + (b.k - 1) * 30 : b.t === "ST" ? b.k * 44 : 0;
  let sumScal = 0, sumFixed = 40;
  plan.forEach((b) => { const f = fixedLen(b); if (f) sumFixed += f; else sumScal += b.n; });
  const scale = clamp((def.len - sumFixed) / sumScal, 0.5, 3);
  const dn = (v) => -SEG * v * H;                   // "d" (segments of drop) -> world dy (negative = downhill)
  const beats = [];
  section(0, 40, 0, 0, 0);                          // start straight
  for (let bi = 0, from = 0; bi < plan.length; bi++) {
    const b = plan[bi];
    if (bi === 0) from = 0; else from = segs.length;
    const cap = b.f === "bridge" ? 120 : b.f === "tunnel" || b.f === "falls" || b.f === "cave" ? 190 : b.f === "lake" ? 160 : 9999;
    const n = Math.min(cap, Math.max(24, Math.round((b.n || 0) * scale)));
    const d = (b.d || 0) * (fixedLen(b) ? 1 : scale);
    const flatF = b.f === "bridge" || b.f === "lake" || b.f === "ford";
    switch (b.t) {
      case "S": section(0, n, 0, flatF ? 0 : (R() - 0.5) * 0.7 * C, dn(d)); break;
      case "T": { const e = Math.min(18, Math.floor(n / 4)); section(e, n - 2 * e, e, b.dir * b.c * C, dn(d)); break; }
      case "E": {
        const per = Math.floor(n / b.k), e = Math.min(12, Math.floor(per / 4));
        for (let i = 0; i < b.k; i++) section(e, per - 2 * e, e, (b.dir || 1) * (i % 2 ? -1 : 1) * b.c * C * (0.85 + R() * 0.3), dn(d / b.k));
        break;
      }
      case "H": { const i0 = segs.length; section(10, 34, 10, b.dir * PIN, dn(d)); for (let k = i0; k < segs.length; k++) segs[k].pin = b.dir; break; }
      case "SW":
        for (let i = 0; i < b.k; i++) {
          const dir = b.dir * (i % 2 ? -1 : 1), i0 = segs.length;
          section(10, 34, 10, dir * PIN, dn(d));
          for (let k = i0; k < segs.length; k++) segs[k].pin = dir;
          if (i < b.k - 1) section(0, 30, 0, 0, dn(d * 0.9));
        }
        break;
      case "C": section(8, n - 16, 8, (R() < 0.5 ? -1 : 1) * R() * 1.0 * C, dn(d)); break;
      case "X": { section(12, 16, 12, 0, SEG * 7 * H); const rest = Math.max(40, n - 40); section(10, rest - 20, 10, (R() - 0.5) * 1.6 * C, dn(d)); break; }
      case "ST":
        for (let i = 0; i < b.k; i++) { section(5, 8, 5, 0, dn(d)); section(0, 26, 0, (R() - 0.5) * 1.2 * C, dn(1)); }
        break;
    }
    beats.push({ from, to: segs.length, b });
  }
  const finishIdx = segs.length;
  section(0, 200, 0, 0, -SEG * 10);                // run-out after the finish
  const N = segs.length;
  beats[beats.length - 1].to = N;

  // tag every segment with its scenery zone and feature
  for (const { from, to, b } of beats) {
    let side = b.dir || 1;
    for (let k = from; k < to; k++) {
      const s = segs[k];
      s.zone = b.z || null;
      s.feat = (b.f === "ford" ? null : b.f) || null;
      if (b.ts) s.ts = b.ts;                                  // tunnel style (portal_<ts> / rib_<ts>)
      if (b.g) { s.gateId = b.g; s.gateK = k - from; s.gateE = b.ge || 8; }   // arches over the trail (torii gates etc.)
      if (b.f === "mtn") { if (s.curve > 0.4) side = 1; else if (s.curve < -0.4) side = -1; s.fside = side; }
    }
    if (b.f === "ford") {
      const mid = ((from + to) / 2) | 0;
      for (let k = 0; k < 16; k++) { const s = segs[mid - 8 + k]; s.surface = { type: "water", x0: -2, x1: 2, k, len: 16 }; s.noObs = 1; }
    }
  }
  // road width for the whole trail (some trails are wide open, some are narrow ledges)
  if (def.wide) for (const s of segs) s.w = def.wide;
  // turn features into side ground, walls and limits.  gL/gR: what lies beside the trail; wl/wr: hard edge (x) or 0
  const sideType = (t) => (t === "chasm" && biome.lavaSide ? "lava" : t);
  for (let i = 0; i < N; i++) {
    const s = segs[i], f = s.feat;
    s.gL = s.gR = null; s.wl = s.wr = 0; s.wallL = s.wallR = 0; s.railL = s.railR = 0;
    if (!f) continue;
    if (f === "tunnel" || f === "falls" || f === "cave") { s.tun = f; s.gL = s.gR = "rock"; s.wl = s.wr = s.w + 0.32; s.wallL = s.wallR = 1; }
    else if (f === "bridge") { s.bridge = 1; s.gL = s.gR = sideType(biome.bridgeOver); s.wl = s.wr = s.w + 0.14; s.railL = s.railR = 1; }
    else if (f === "canyon") { s.wallL = s.wallR = 2; s.wl = s.wr = s.w + 0.55; }
    else if (f === "mtn" || f === "cliffL" || f === "cliffR") {
      const wall = f === "mtn" ? s.fside : f === "cliffL" ? -1 : 1;
      if (wall < 0) { s.wallL = 1; s.wl = s.w + 0.4; s.gR = sideType("chasm"); s.railR = 1; s.wr = s.w + 0.14; }
      else { s.wallR = 1; s.wr = s.w + 0.4; s.gL = sideType("chasm"); s.railL = 1; s.wl = s.w + 0.14; }
      if (biome.lavaSide) { if (s.gL === "lava") { s.railL = 1; } if (s.gR === "lava") { s.railR = 1; } }
    }
    else if (f === "waterL") s.gL = "water";
    else if (f === "waterR") s.gR = "water";
    else if (f === "lavaL") s.gL = "lava";
    else if (f === "lavaR") s.gR = "lava";
    else if (f === "lake") { s.gL = s.gR = "ice"; s.surface = { type: "ice", x0: -2.2, x1: 2.2, k: i, len: 9999 }; s.noObs = 1; }
  }
  const featBlocks = (s) => !!(s.feat && s.feat !== "waterL" && s.feat !== "waterR" && s.feat !== "lavaL" && s.feat !== "lavaR" && s.feat !== "canyon" && s.feat !== "mtn" && s.feat !== "cliffL" && s.feat !== "cliffR");

  // ---- 1b. Set pieces from plan-beat keys: j big jump, gap crevasse jumps, cr crumbling bridge, rs/ws rail/wall style ----
  const bigJump = (i, id, xs) => {
    const s = segs[i];
    if (!s) return;
    s.ramp = (xs || [-0.55, 0, 0.55]).map((x) => ({ x })); s.big = 1;
    s.sprites.push({ id: id || "bigramp", x: 0, flat: 1 });
    for (let k = i - 4; k < i + 70; k++) if (segs[k]) segs[k].noObs = 1;      // keep the run-up and landing clear
  };
  const crumbles = [];
  for (const { from, to, b } of beats) {
    if (b.j) bigJump(Math.max(from + 4, Math.min(to - 20, from + Math.round((to - from) * (b.jat ?? 0.4)))), b.jr);
    if (b.gap) for (let k = 0; k < b.gap; k++) {
      const i = from + Math.round((to - from) * (k + 0.5) / b.gap) - 6;
      bigJump(i, "gapramp", [-0.42, 0, 0.42]);                                   // the ramp covers the middle; ride the edge and you drop in
      for (let g = i + 7; g < i + 12; g++) if (segs[g]) segs[g].gap = 1;
    }
    for (let k = from; k < to; k++) {
      const s = segs[k];
      if (b.rs) s.rs = b.rs;
      if (b.ws) s.ws = b.ws;
      // crumbling bridge: every other 10-segment stretch has one side (left, then right) that collapses after the first rider
      const ch = ((k - from) / 10) | 0;
      if (b.cr && s.bridge && ch % 2 === 1) { s.crumble = 1; s.crSide = ((ch / 2) | 0) % 2 ? 1 : -1; crumbles.push(s); }
    }
  }

  // ---- 2. Features ----
  const freeAt = (i, span = 6) => { for (let k = i - span; k <= i + span; k++) { const s = segs[k]; if (!s || s.ramp || s.split || s.surface || s.vent || s.decal || s.pin || featBlocks(s)) return false; } return true; };
  const placeable = (i) => i > 70 && i < finishIdx - 60;

  // split sections (a fork with a median; the riskier side carries pads and a repair kit). A beat with `fork: 1` always
  // forks (e.g. the frozen lake cracking into two lanes); the rest are placed at random.
  const forced = beats.filter((x) => x.b.fork).map((x) => [Math.max(x.from + 8, 80), x.to - 8]);
  for (let n = 0; n < def.splits + forced.length; n++) {
    let i0 = -1;
    let len = 90 + ((R() * 50) | 0);
    if (n < forced.length) { i0 = forced[n][0]; len = Math.max(50, Math.min(len, forced[n][1] - i0)); }
    for (let tries = 0; tries < 40 && i0 < 0; tries++) {
      const c = 160 + (((finishIdx - 360) / def.splits) * (n - forced.length + 0.1 + R() * 0.8)) | 0;
      let ok = true;
      for (let k = c - 10; k < c + len + 10; k++) if (!segs[k] || segs[k].split || segs[k].ramp || segs[k].feat || segs[k].pin || segs[k].surface || Math.abs(segs[k].curve) > 3.2) { ok = false; break; }
      if (ok) i0 = c;
    }
    if (i0 < 0) continue;
    const risky = R() < 0.5 ? -1 : 1;
    for (let k = 0; k < len; k++) {
      const s = segs[i0 + k];
      const t = k < 20 ? k / 20 : k > len - 20 ? (len - k) / 20 : 1;
      s.w = (def.wide || 1) * (1 + 0.75 * t);
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
  const surf = biome.surf !== undefined ? biome.surf : { forest: null, desert: "sand", glacier: "ice", ghats: "mud", volcano: "lava", tundra: "ice" }[biome.id];
  if (surf) {
    const count = Math.round(6 * def.haz * (def.surfN || 1));
    for (let n = 0; n < count; n++) {
      for (let tries = 0; tries < 20; tries++) {
        const i = 110 + ((R() * (finishIdx - 230)) | 0);
        if (!placeable(i) || !freeAt(i, 18)) continue;
        const len = 18 + ((R() * 26) | 0);
        let clash = false;
        for (let k = 0; k < len; k++) { const s2 = segs[i + k]; if (!s2 || s2.surface || s2.feat === "bridge" || s2.tun) clash = true; }
        if (clash) continue;
        const hw = surf === "lava" ? 0.22 : 0.35 + R() * 0.35;
        const x = (R() * 2 - 1) * (1 - hw) * 0.9;
        for (let k = 0; k < len; k++) { const s = segs[i + k]; s.surface = { type: surf, x0: x - hw, x1: x + hw, k, len }; }
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
  const obsIds = def.obs || BIOME_SCENERY[biome.id].obstacles;
  const nObs = Math.round(26 * def.haz * (def.len / 3500));
  for (let n = 0; n < nObs; n++) {
    for (let tries = 0; tries < 20; tries++) {
      const i = 100 + ((R() * (finishIdx - 180)) | 0);
      const s = segs[i];
      if (!placeable(i) || s.ramp || s.vent || s.noObs || s.bridge || s.pin || s.split || (segs[i - 1] && segs[i - 1].ramp)) continue;
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

  // movers: ghosts, animals or rolling logs that sweep across the trail (x is updated every frame by moveMovers)
  const movers = [];
  for (const m of def.movers || []) {
    for (let n = 0; n < m.n; n++) {
      for (let tries = 0; tries < 30; tries++) {
        const i = 130 + ((R() * (finishIdx - 230)) | 0);
        const s = segs[i];
        if (!placeable(i) || s.tun || s.bridge || s.pin || s.split || s.ramp || s.vent || s.noObs) continue;
        let near = false;
        for (let k = i - 30; k < i + 10; k++) if (segs[k] && (segs[k].ramp || segs[k].vent || segs[k].mover)) near = true;
        if (near) continue;
        const sp = { id: m.id, x: 0, mv: { c: (R() - 0.5) * 0.3, a: (m.amp || 1) * s.w, w: (m.spd || 0.6) * (0.75 + R() * 0.5), p: R() * TAU } };
        s.sprites.push(sp); s.mover = 1; movers.push(sp);
        break;
      }
    }
  }

  // fallers: branches / rocks / bricks that drop onto the trail when a rider gets close (a shadow shows where)
  const fallers = [];
  for (const m of def.fallers || []) {
    for (let n = 0; n < m.n; n++) {
      for (let tries = 0; tries < 30; tries++) {
        const i = 140 + ((R() * (finishIdx - 240)) | 0);
        const s = segs[i];
        if (!placeable(i) || s.bridge || s.pin || s.split || s.ramp || s.vent || s.noObs || s.mover || s.faller) continue;
        const sp = { id: m.id, x: (R() * 1.4 - 0.7) * s.w, y: 0, fall: { z: i * SEG, t0: 0 } };
        s.sprites.push(sp); s.faller = 1; fallers.push(sp);
        break;
      }
    }
  }
  // bursts: spots on the trail that glow, then erupt (lava, Holi colour, fireworks); `kind` decides the effect
  const bursts = [];
  if (def.bursts) for (let n = 0; n < def.bursts.n; n++) {
    for (let tries = 0; tries < 30; tries++) {
      const i = 140 + ((R() * (finishIdx - 240)) | 0);
      const s = segs[i];
      if (!placeable(i) || !freeAt(i, 10) || s.noObs || s.mover) continue;
      s.burst = { x: (R() * 1.3 - 0.65) * s.w, ph: R() * 3.2, kind: def.bursts.kind, st: 0 };
      bursts.push(s);
      break;
    }
  }

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

  // ---- 3. Scenery: per-zone sets, walls, tunnels, rails and turn signs ----
  const set = BIOME_SCENERY[biome.id];
  const zonePickers = {};
  const picker = (zone) => {
    const key = zone || "_";
    if (zonePickers[key]) return zonePickers[key];
    const zd = (zone && set.zones && set.zones[zone]) || { near: set.near, dens: 0.62 };
    const wsum = zd.near.reduce((a, b) => a + b[1], 0);
    return (zonePickers[key] = { dens: zd.dens, pick: () => { let t = R() * wsum; for (const [id, w] of zd.near) { if ((t -= w) <= 0) return id; } return zd.near[0][0]; } });
  };
  let tunRun = 0;
  for (let i = 0; i < N; i++) {
    const s = segs[i];
    const edge = s.w;
    const zp = picker(s.zone);
    // tunnels: portal at each mouth, ribs every 2 segments, lights on the walls
    if (s.tun) {
      const prev = segs[i - 1], next = segs[i + 1];
      const pid = s.ts ? "portal_" + s.ts : "portal", rid = s.ts ? "rib_" + s.ts : "rib";
      if (!prev || !prev.tun) s.sprites.push({ id: pid, x: 0, gate: 1 });
      else if (!next || !next.tun) s.sprites.push({ id: pid, x: 0, gate: 1 });
      else if (i % 2 === 0) s.sprites.push({ id: rid, x: 0, gate: 1 });
      tunRun++;
      if (s.tun === "cave" && i % 5 === 0) s.sprites.push({ id: "crystal", x: (i % 10 ? -1 : 1) * (edge + 0.34) });
      else if (i % 14 === 0) s.sprites.push({ id: "lantern", x: (i % 28 ? -1 : 1) * (edge + 0.3) });
      if (s.tun === "falls" && (!prev || !prev.tun || !next || !next.tun)) s.sprites.push({ id: "curtain", x: 0, gate: 1 });
    } else tunRun = 0;
    for (const side of [-1, 1]) {
      const wall = side < 0 ? s.wallL : s.wallR, rail = side < 0 ? s.railL : s.railR, g = side < 0 ? s.gL : s.gR;
      if (wall) { s.sprites.push({ id: s.ws ? "wall_" + s.ws : "wall", x: side * (edge + (wall === 2 ? 1.25 : s.tun ? 0.85 : 0.95)) }); continue; }
      if (rail) { if (i % 2 === 0) s.sprites.push({ id: s.rs ? "rail_" + s.rs : "rail", x: side * (edge + 0.16) }); continue; }
      if (g) { if (g === "water" && set.zones && R() < 0.12) s.sprites.push({ id: "reeds", x: side * (edge + 0.32) }); continue; }
      if (R() < zp.dens) s.sprites.push({ id: zp.pick(), x: side * (edge + 0.5 + R() * 1.5) });
      if (i % 4 === 0 && R() < 0.5 + zp.dens * 0.5) s.sprites.push({ id: set.far[(R() * set.far.length) | 0], x: side * (edge + 2.4 + R() * 4) });
    }
    if (s.gateId && !s.tun && s.gateK % s.gateE === 0) s.sprites.push({ id: s.gateId, x: 0, gate: 1 });
    // hairpin chevrons on the outside of the bend
    if (s.pin && i % 6 === 0) s.sprites.push({ id: s.pin > 0 ? "chevR" : "chevL", x: -s.pin * (edge + 0.42) });
    const open = !s.feat;
    if (open && biome.id === "tundra" && i % 24 === 0 && s.zone !== "lake") { s.sprites.push({ id: "lantern", x: -(edge + 0.22) }); s.sprites.push({ id: "lantern", x: edge + 0.22 }); }
    if (open && biome.id === "glacier" && s.zone === "resort" && i % 30 === 15) s.sprites.push({ id: "gate", x: (i % 60 < 30 ? -1 : 1) * (edge + 0.15) });
    if (open && i % 140 === 70 && set.special.includes("banner")) s.sprites.push({ id: "banner", x: (i % 280 < 140 ? -1 : 1) * (edge + 0.2) });
  }
  // start & finish dressing
  segs[16].sprites.push({ id: "startgate", x: 0, gate: 1 });
  segs[finishIdx].sprites.push({ id: "arch", x: 0, gate: 1 });
  for (const i of [6, 12, 22, finishIdx - 8, finishIdx - 2, finishIdx + 6]) {
    segs[i].sprites.push({ id: "crowd", x: -(segs[i].w + 0.9) }, { id: "crowd", x: segs[i].w + 0.9 });
  }
  return {
    def, biome, segs, N, beats, movers, fallers, bursts, crumbles,
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
