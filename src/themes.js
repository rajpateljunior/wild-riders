/* Extra trails beyond the 6 nature biomes: SEASONAL trails (one per month, plus Diwali) and the WORLD TOUR.
   Each one is its own "theme": an entry appended to BIOMES (palette, weather, music, throwable, scenery set) plus its
   trail(s) appended to TRACKS. Art for every theme lives in art_themes.js (sprites, BIOME_SCENERY, backgrounds).

   Extra theme fields (on top of the normal BIOMES fields):
     group:   "season" → only raceable between `season` dates (MMDD, inclusive; the device's own calendar, so it works
                         offline). Everyone can race it straight away. Its stars are shown but never count toward unlocks
                         (the trail goes away at the end of its dates), and it comes back the next year with its best time.
              "world"  → part of the World Tour card (unlocks at WORLD_UNLOCK stars).
     surf:    surface patches scattered on the trail (sand, mud, ice, water, lava); null = none
     bg:      parallax background: far [front, back colours], near colour, tree colour (or null), snow caps, extra (BG_EXTRA)
     aurora:  0 turns the northern lights off in a dark sky
     sunR:    sun / moon size (fraction of screen height)
     darkK:   how dark a `dark` theme is (1 = Aurora Tundra)
   Extra trail fields (also usable on the 12 nature trails):
     movers:  [{ id, n, amp, spd }] sprites that drift / walk / roll across the trail (ghosts, animals, rolling logs)
     wide:    road width multiplier (1 = normal)
   Extra plan-beat keys: ts (tunnel style: sprite ids `portal_<ts>` / `rib_<ts>`), g (an arch sprite over the trail every
   `ge` segments, open sky, e.g. torii gates). */

const WORLD_UNLOCK = 23;

// MMDD of a date (device calendar). window.WR_DATE (tests) can pretend it's another day.
function todayMMDD(d) {
  d = d || (window.WR_DATE ? new Date(window.WR_DATE) : new Date());
  return (d.getMonth() + 1) * 100 + d.getDate();
}
function seasonActive(b, d) {
  if (!b.season) return true;
  const md = todayMMDD(d), [a, z] = b.season;
  return a <= z ? md >= a && md <= z : md >= a || md <= z;      // a window may wrap over New Year
}
// whole days left including today (1 on the last day)
function seasonDaysLeft(b) {
  const d = window.WR_DATE ? new Date(window.WR_DATE) : new Date();
  const z = b.season[1];
  const at = (y) => { const m = Math.floor(z / 100) - 1; return new Date(y, m, Math.min(z % 100, new Date(y, m + 1, 0).getDate())); };   // Feb 29 → Feb 28 in other years
  let end = at(d.getFullYear());
  const day0 = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  if (end < day0) end = at(d.getFullYear() + 1);
  return Math.round((end - day0) / 864e5) + 1;
}
const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
function seasonLabel(b) {
  const [a, z] = b.season;
  const ma = Math.floor(a / 100), mz = Math.floor(z / 100);
  if (ma === mz && a % 100 === 1 && z % 100 >= 28) return MONTHS[ma - 1] + " ONLY";
  return MONTHS[ma - 1] + " " + (a % 100) + "–" + (ma === mz ? "" : MONTHS[mz - 1] + " ") + (z % 100);
}

function addTheme(theme, tracks) {
  const bi = BIOMES.push(theme) - 1;
  tracks.forEach((t) => TRACKS.push(Object.assign({ biome: bi }, t)));
  return bi;
}
const isSeasonTrack = (t) => BIOMES[t.biome].group === "season";
const isWorldTrack = (t) => BIOMES[t.biome].group === "world";

/* ======================= SEASONAL ======================= */

addTheme({ id: "halloween", name: "Halloween", sub: "Spooky night", group: "season", season: [1001, 1031], item: "pumpkin", unlock: 0,
  sky: ["#0d0820", "#33184a", "#7a3358"], fog: "#2d1f3c", sun: "#fff1c2", sunY: 0.17, sunX: 0.72, sunR: 0.075,
  road: ["#5d4634", "#53402f"], rut: "#3e2f23", edge: ["#2a1e26", "#c99a5e"], ground: ["#33401f", "#2c381b"],
  rock: ["#4c4560", "#6a6282"], chasm: ["#160f22", "#130d1d"], water: ["#35574a", "#47705f"], bridgeOver: "water", plank: ["#5a4636", "#4d3b2d"],
  weather: "bats", music: 7, dark: 1, darkK: 0.7, aurora: 0, surf: "mud",
  bg: { far: ["#2b1d40", "#211633"], near: "#160f22", tree: "#0e0a17", extra: "castle" },
  hazard: "Ghosts drift across the trail: touch one and it spooks you blind. Swamp mud slows you." }, [
  { id: "s10", name: "Haunted Hollow", seed: 9101, len: 3600, curvy: 0.9, hilly: 1.0, ramps: 6, splits: 2, pads: 8, haz: 0.8,
    movers: [{ id: "ghost", n: 10, amp: 1.05, spd: 0.55 }],
    blurb: "Moonlit pumpkin patch, a crooked graveyard, drifting ghosts and a ride through the haunted mansion.",
    plan: [
      { t: "S", n: 80, d: 4, z: "patch" }, { t: "T", dir: 1, c: 3, n: 180, d: 26, z: "patch" }, { t: "E", dir: -1, k: 3, c: 4, n: 220, d: 30, z: "woods" },
      { t: "S", n: 100, d: 8, z: "graveyard" }, { t: "T", dir: -1, c: 3, n: 160, d: 24, z: "graveyard" }, { t: "S", n: 70, d: 2, z: "swamp", f: "bridge" },
      { t: "X", n: 130, d: 40, z: "woods" }, { t: "T", dir: 1, c: 3.5, n: 170, d: 24, f: "tunnel", ts: "mansion" }, { t: "S", n: 90, d: 8, z: "manor" },
      { t: "H", dir: -1, d: 6, z: "woods" }, { t: "C", n: 120, d: 60, z: "woods" }, { t: "E", dir: 1, k: 3, c: 4, n: 200, d: 30, z: "graveyard" },
      { t: "T", dir: 1, c: 2.5, n: 150, d: 20, z: "swamp", f: "waterR" }, { t: "S", n: 110, d: 8, z: "patch" },
    ] },
]);

/* ======================= WORLD TOUR ======================= */
// World themes add: place (map label), lon/lat (pin), lab (label side: left / up / down)
const W_BASE = { group: "world", unlock: WORLD_UNLOCK, item: "snowglobe" };

addTheme(Object.assign({ id: "valpo", name: "Valparaíso", sub: "Chile", place: "VALPARAÍSO", lon: -71.6, lat: -33.05,
  sky: ["#3c9ae0", "#a8d8f2", "#ffeec4"], fog: "#d9e6ee", sun: "#fff8d8", sunY: 0.14, sunX: 0.3,
  road: ["#6f6b74", "#666270"], rut: "#55525c", edge: ["#ffd23f", "#2b7de9"], ground: ["#bfae96", "#b3a28a"],
  rock: ["#e2433b", "#ffd23f"], chasm: ["#1d5f9e", "#1a5690"], water: ["#2b7de9", "#4b97f0"], bridgeOver: "water", plank: ["#8a6a4a", "#7a5c3e"],
  weather: null, music: 0, surf: null, bg: { far: ["#2b7de9", "#2b6fc9"], near: "#d9c7a8", tree: null, extra: "harbor", amp: 60, jag: 0 } }, W_BASE), [
  { id: "w1", name: "Valparaíso Hill Bomb", seed: 7101, len: 3500, curvy: 0.95, hilly: 1.2, ramps: 6, splits: 1, pads: 8, haz: 0.8,
    movers: [{ id: "streetcart", n: 6, amp: 0.85, spd: 0.4 }], obs: ["trashcan", "streetcart"],
    blurb: "Bomb down colourful hillside streets and stairways above the harbour: rooftop jumps, street carts, and a leap over the cable car.",
    plan: [
      { t: "S", n: 70, d: 8, z: "barrio" }, { t: "E", dir: 1, k: 3, c: 4.5, n: 220, d: 40, z: "barrio", f: "canyon", ws: "casas" }, { t: "ST", k: 3, d: 18, z: "barrio" },
      { t: "T", dir: -1, c: 3.5, n: 160, d: 34, z: "plaza" }, { t: "X", n: 130, d: 50, z: "barrio", j: 1, jat: 0.12, jr: "stoneramp" }, { t: "H", dir: 1, d: 8, z: "barrio", f: "canyon", ws: "casas" },
      { t: "C", n: 130, d: 70, z: "ascensor", j: 1, jat: 0.3, jr: "bigramp" }, { t: "E", dir: -1, k: 4, c: 5, n: 240, d: 40, z: "barrio", f: "canyon", ws: "casas" }, { t: "ST", k: 4, d: 20, z: "plaza" },
      { t: "T", dir: 1, c: 3, n: 150, d: 30, z: "barrio" }, { t: "SW", dir: -1, k: 2, d: 14, z: "barrio", f: "canyon", ws: "casas" }, { t: "C", n: 120, d: 60, z: "port" },
      { t: "S", n: 120, d: 6, z: "port", f: "waterR" },
    ] },
]);

addTheme(Object.assign({ id: "greatwall", name: "Great Wall", sub: "China", place: "GREAT WALL", lon: 116.6, lat: 40.4, lab: "up",
  sky: ["#5f9fd9", "#b7d9ee", "#f1f0d8"], fog: "#c9d9d0", sun: "#fffbe0", sunY: 0.12, sunX: 0.62,
  road: ["#a89c86", "#9e927c"], rut: "#8a7f6a", edge: ["#7a705e", "#c9bfa8"], ground: ["#5e8a4a", "#557f43"],
  rock: ["#8f8572", "#a89c86"], chasm: ["#5f8a5a", "#567f52"], water: ["#4a8ab8", "#5a9ac8"], bridgeOver: "chasm", plank: ["#8f8572", "#857b68"],
  weather: null, music: 8, surf: null, bg: { far: ["#7aa58a", "#5f8f6f"], near: "#4f7a45", tree: "#3d6a38", extra: "greatwall" } }, W_BASE), [
  { id: "w2", name: "Great Wall Descent", seed: 7201, len: 3300, curvy: 0.85, hilly: 1.2, ramps: 5, splits: 0, pads: 9, haz: 0.75,
    obs: ["rubble"],
    blurb: "Race along the top of the Great Wall: stair drops, watchtower tunnels and crumbling sections with a long fall on both sides.",
    plan: [
      { t: "S", n: 80, d: 4, f: "ridge", rs: "battlement" }, { t: "T", dir: 1, c: 2.5, n: 170, d: 26, f: "ridge", rs: "battlement" }, { t: "S", n: 34, d: 2, f: "tunnel", ts: "tower" },
      { t: "ST", k: 4, d: 18, f: "ridge", rs: "battlement" }, { t: "T", dir: -1, c: 3, n: 160, d: 30, f: "ridge", rs: "battlement" }, { t: "S", n: 34, d: 2, f: "tunnel", ts: "tower" },
      { t: "X", n: 140, d: 50, f: "ridge", rs: "battlement" }, { t: "E", dir: 1, k: 3, c: 3.5, n: 210, d: 34, f: "ridge", rs: "battlement" }, { t: "S", n: 34, d: 2, f: "tunnel", ts: "tower" },
      { t: "ST", k: 5, d: 20, f: "ridge", rs: "battlement" }, { t: "T", dir: 1, c: 3.5, n: 160, d: 30, f: "ridge", rs: "battlement", cr: 1 }, { t: "S", n: 34, d: 2, f: "tunnel", ts: "tower" },
      { t: "C", n: 130, d: 60, f: "ridge", rs: "battlement" }, { t: "T", dir: -1, c: 2.5, n: 150, d: 20, f: "ridge", rs: "battlement" }, { t: "S", n: 34, d: 2, f: "tunnel", ts: "tower" },
      { t: "S", n: 90, d: 6, f: "ridge", rs: "battlement" },
    ] },
]);

addTheme(Object.assign({ id: "alps", name: "Swiss Alps", sub: "Switzerland", place: "SWISS ALPS", lon: 7.75, lat: 46.0,
  sky: ["#3f8ee0", "#a9d6f5", "#f2f8ff"], fog: "#d8ecf2", sun: "#ffffff", sunY: 0.12, sunX: 0.7,
  road: ["#8a7b66", "#80725e"], rut: "#6e6252", edge: ["#5a4a3a", "#f2ead8"], ground: ["#5fae48", "#56a141"],
  rock: ["#8c94a6", "#ffffff"], chasm: ["#3f7a4a", "#386e42"], water: ["#5ab0e0", "#6fc0ec"], bridgeOver: "water", plank: ["#9a6a3c", "#8a5c32"],
  weather: null, music: 9, surf: null, bg: { far: ["#9fb6d2", "#7f98b8"], near: "#4f9a3e", tree: "#2f6b33", snow: 1, extra: "matterhorn" } }, W_BASE), [
  { id: "w3", name: "Swiss Alps Express", seed: 7301, len: 3600, curvy: 0.85, hilly: 1.05, ramps: 6, splits: 2, pads: 8, haz: 0.7,
    movers: [{ id: "alpcow", n: 7, amp: 0.9, spd: 0.3 }], pacers: [{ id: "redtrain", x: 2.35, speed: 0.92 }],
    blurb: "Green alpine meadows under the Matterhorn: cowbell pastures, chalet villages, and a race with the red mountain train into its tunnel.",
    plan: [
      { t: "S", n: 80, d: 4, z: "meadow" }, { t: "T", dir: 1, c: 2.5, n: 180, d: 24, z: "meadow" }, { t: "E", dir: -1, k: 3, c: 3.5, n: 210, d: 30, z: "village" },
      { t: "S", n: 80, d: 4, z: "village", f: "bridge" }, { t: "T", dir: -1, c: 3, n: 170, d: 30, z: "pasture" }, { t: "X", n: 140, d: 44, z: "pasture" },
      { t: "SW", dir: 1, k: 2, d: 14, z: "meadow", f: "mtn" }, { t: "S", n: 260, d: 20, z: "railway", pace: 1 }, { t: "T", dir: 1, c: 2.5, n: 190, d: 26, f: "tunnel", ts: "rail" },
      { t: "E", dir: 1, k: 3, c: 4, n: 210, d: 34, z: "village" }, { t: "C", n: 120, d: 56, z: "meadow" }, { t: "T", dir: -1, c: 3, n: 160, d: 24, z: "pasture" },
      { t: "S", n: 100, d: 6, z: "village" },
    ] },
]);

addTheme(Object.assign({ id: "machu", name: "Machu Picchu", sub: "Peru", place: "MACHU PICCHU", lon: -72.5, lat: -13.2, lab: "left",
  sky: ["#6aa3c9", "#c2dbe6", "#eef2ea"], fog: "#d6e2dc", sun: "#fffbe8", sunY: 0.15, sunX: 0.65,
  road: ["#8c7a5e", "#837256"], rut: "#6e5f46", edge: ["#6f6656", "#b9b09a"], ground: ["#4f9a46", "#478f40"],
  rock: ["#8f8a78", "#4f9a46"], chasm: ["#3f6e4a", "#386544"], water: ["#5a9ab8", "#6aaac8"], bridgeOver: "chasm", plank: ["#8a6a4a", "#7a5c3e"],
  weather: "fog", fogK: 1.4, music: 1, surf: "mud", bg: { far: ["#6f9a7a", "#5a8a66"], near: "#3f7a3a", tree: "#2f6a30", extra: "picchu" } }, W_BASE), [
  { id: "w4", name: "Machu Picchu Trail", seed: 7401, len: 3600, curvy: 0.95, hilly: 1.15, ramps: 6, splits: 1, pads: 8, haz: 0.8,
    movers: [{ id: "llama", n: 7, amp: 0.85, spd: 0.35 }],
    blurb: "Stone terraces in the clouds high in the Andes: ancient ruins, llamas on the path, and a steep stone-stairway finale.",
    plan: [
      { t: "S", n: 80, d: 6, z: "terraces" }, { t: "T", dir: -1, c: 3, n: 170, d: 30, z: "terraces", f: "mtn" }, { t: "E", dir: 1, k: 3, c: 4, n: 210, d: 34, z: "ruins" },
      { t: "ST", k: 3, d: 16, z: "ruins" }, { t: "SW", dir: -1, k: 2, d: 14, z: "terraces", f: "mtn" }, { t: "T", dir: 1, c: 3, n: 150, d: 26, f: "tunnel", ts: "inca" },
      { t: "X", n: 130, d: 44, z: "terraces" }, { t: "E", dir: -1, k: 4, c: 4.5, n: 240, d: 40, z: "ruins" }, { t: "H", dir: 1, d: 8, z: "terraces", f: "mtn" },
      { t: "S", n: 90, d: 4, z: "cloud", f: "bridge", rs: "rope" }, { t: "T", dir: -1, c: 3.5, n: 160, d: 30, z: "ruins" }, { t: "ST", k: 5, d: 22, z: "ruins", j: 1, jat: 0.05, jr: "stoneramp" },
      { t: "S", n: 90, d: 8, z: "ruins" },
    ] },
]);

addTheme(Object.assign({ id: "moab", name: "Moab", sub: "Utah, USA", place: "MOAB", lon: -109.5, lat: 38.6,
  sky: ["#2f86d8", "#94cbef", "#ffe6c0"], fog: "#f0c9a0", sun: "#fffbe0", sunY: 0.12, sunX: 0.25,
  road: ["#d9895a", "#cf7f50"], rut: "#b86a40", edge: ["#9a4a26", "#f4d7b0"], ground: ["#e09a62", "#d68f58"],
  rock: ["#c4562b", "#e07a45"], chasm: ["#7a3518", "#6e2f15"], water: ["#3fa0c8", "#5cb6d8"], bridgeOver: "chasm", plank: ["#a8743f", "#966536"],
  weather: null, music: 1, surf: "sand", bg: { far: ["#d9784a", "#c4643a"], near: "#e8a06a", tree: null, extra: "buttes", amp: 140 } }, W_BASE), [
  { id: "w5", name: "Moab Red Rock", seed: 7501, len: 3600, curvy: 0.85, hilly: 1.1, ramps: 8, splits: 2, pads: 8, haz: 0.75, grip: 1.12, wide: 1.1,
    movers: [{ id: "tumbleroll", n: 8, amp: 1.05, spd: 0.9 }],
    blurb: "Grippy red slickrock in the desert: ride under giant stone arches, big air off the domes, and a jump at the canyon edge.",
    plan: [
      { t: "S", n: 90, d: 4, z: "slickrock", g: "rockarch", ge: 999 }, { t: "X", n: 150, d: 40, z: "slickrock" }, { t: "T", dir: 1, c: 3, n: 170, d: 26, z: "hoodoos" },
      { t: "E", dir: -1, k: 3, c: 4, n: 210, d: 30, z: "slickrock" }, { t: "S", n: 100, d: 6, z: "arches", g: "rockarch", ge: 999 }, { t: "X", n: 140, d: 44, z: "slickrock" },
      { t: "T", dir: -1, c: 3.5, n: 160, d: 30, f: "canyon" }, { t: "S", n: 120, d: 10, z: "rim", f: "cliffR" }, { t: "C", n: 140, d: 70, z: "rim", f: "cliffR", j: 1, jat: 0.1, jr: "sandramp" },
      { t: "E", dir: 1, k: 3, c: 4.5, n: 200, d: 30, z: "hoodoos" }, { t: "S", n: 90, d: 6, z: "arches", g: "rockarch", ge: 999 }, { t: "X", n: 140, d: 40, z: "slickrock" },
      { t: "T", dir: 1, c: 3, n: 150, d: 20, z: "slickrock" }, { t: "S", n: 100, d: 8, z: "arches" },
    ] },
]);

addTheme(Object.assign({ id: "fuji", name: "Mount Fuji", sub: "Japan", place: "FUJI", lon: 138.7, lat: 35.4,
  sky: ["#5aa6e6", "#c9e2f5", "#ffe9f0"], fog: "#f4e2ea", sun: "#fffaf0", sunY: 0.14, sunX: 0.3,
  road: ["#c9b8a0", "#bfae96"], rut: "#a8987f", edge: ["#7a6a5a", "#f4ece0"], ground: ["#6fae58", "#66a251"],
  rock: ["#8c94a6", "#ffffff"], chasm: ["#3f7a5a", "#386e52"], water: ["#4a9ad8", "#5aaae6"], bridgeOver: "water", plank: ["#c4362b", "#b32f25"],
  weather: "petals", music: 10, surf: null, bg: { far: ["#9fb8d8", "#86a3c8"], near: "#5f9e4a", tree: "#3f7a3a", extra: "fujisan" } }, W_BASE), [
  { id: "w6", name: "Fuji Blossom Run", seed: 7601, len: 3600, curvy: 0.9, hilly: 1.0, ramps: 6, splits: 2, pads: 8, haz: 0.7,
    movers: [{ id: "deer", n: 7, amp: 0.9, spd: 0.4 }],
    blurb: "Cherry blossoms under Mount Fuji: a red bridge over the pond, a five-storey pagoda, deer on the path and a tunnel of red torii gates.",
    plan: [
      { t: "S", n: 80, d: 4, z: "sakura" }, { t: "T", dir: 1, c: 3, n: 180, d: 26, z: "sakura" }, { t: "S", n: 80, d: 2, z: "pond", f: "bridge" },
      { t: "E", dir: -1, k: 3, c: 4, n: 210, d: 30, z: "temple" }, { t: "S", n: 130, d: 10, z: "shrine", g: "torii", ge: 5 }, { t: "T", dir: -1, c: 3, n: 160, d: 30, z: "sakura" },
      { t: "X", n: 130, d: 44, z: "sakura" }, { t: "SW", dir: 1, k: 2, d: 14, z: "temple", f: "mtn" }, { t: "E", dir: 1, k: 3, c: 4.5, n: 200, d: 34, z: "sakura" },
      { t: "T", dir: 1, c: 3, n: 150, d: 24, z: "shrine", g: "torii", ge: 5 }, { t: "C", n: 120, d: 56, z: "sakura" }, { t: "T", dir: -1, c: 2.5, n: 150, d: 20, z: "pond", f: "waterL" },
      { t: "S", n: 100, d: 8, z: "temple" },
    ] },
]);

addTheme(Object.assign({ id: "ladakh", name: "Ladakh", sub: "Himalaya, India", place: "LADAKH", lon: 77.6, lat: 34.2, lab: "down",
  sky: ["#1f5fc4", "#79b3ea", "#e0ecf6"], fog: "#d6dde2", sun: "#ffffff", sunY: 0.1, sunX: 0.7,
  road: ["#5a5660", "#524e58"], rut: "#45424c", edge: ["#ffd23f", "#f2eee6"], ground: ["#b39a78", "#a88f6d"],
  rock: ["#9a8468", "#f2f4f8"], chasm: ["#7a6a58", "#6f604f"], water: ["#4ab0d8", "#62c0e4"], bridgeOver: "water", plank: ["#8a6a4a", "#7a5c3e"],
  weather: null, music: 3, surf: "sand", bg: { far: ["#a8b4c8", "#8e9cb4"], near: "#a08a6a", tree: null, snow: 1, extra: "himalaya", jag: 60 } }, W_BASE), [
  { id: "w7", name: "Ladakh Himalaya", seed: 7701, len: 3800, curvy: 0.95, hilly: 1.25, ramps: 5, splits: 1, pads: 9, haz: 0.8,
    movers: [{ id: "yak", n: 7, amp: 0.85, spd: 0.3 }],
    blurb: "Switchbacks down a high Himalayan pass under strings of prayer flags: white stupas, a cliffside monastery, and yaks on the road.",
    plan: [
      { t: "S", n: 80, d: 6, z: "pass", g: "prayerflags", ge: 9 }, { t: "SW", dir: 1, k: 3, d: 16, z: "pass", f: "mtn" }, { t: "T", dir: -1, c: 3, n: 170, d: 30, z: "stupas" },
      { t: "S", n: 100, d: 8, z: "stupas", g: "prayerflags", ge: 14 }, { t: "SW", dir: -1, k: 3, d: 16, z: "pass", f: "mtn" }, { t: "E", dir: 1, k: 3, c: 4, n: 210, d: 34, z: "valley" },
      { t: "S", n: 80, d: 4, z: "valley", f: "bridge", g: "prayerflags", ge: 20 }, { t: "T", dir: 1, c: 3.5, n: 160, d: 30, z: "monastery" }, { t: "SW", dir: 1, k: 2, d: 14, z: "monastery", f: "mtn" },
      { t: "X", n: 130, d: 44, z: "valley" }, { t: "E", dir: -1, k: 3, c: 4.5, n: 200, d: 30, z: "stupas" }, { t: "C", n: 120, d: 56, z: "pass" },
      { t: "T", dir: -1, c: 3, n: 150, d: 20, z: "village", g: "prayerflags", ge: 12 }, { t: "S", n: 100, d: 8, z: "village" },
    ] },
]);

addTheme(Object.assign({ id: "kili", name: "Kilimanjaro", sub: "Tanzania", place: "KILIMANJARO", lon: 37.35, lat: -3.07,
  sky: ["#3f94dc", "#a6d4f0", "#ffe7b8"], fog: "#efd9b0", sun: "#fff6d0", sunY: 0.14, sunX: 0.72,
  road: ["#b86a3a", "#ad6034"], rut: "#94512b", edge: ["#7a4222", "#f2d7a8"], ground: ["#c9b058", "#bea450"],
  rock: ["#7a6a5a", "#ffffff"], chasm: ["#7a5a3a", "#6f5034"], water: ["#4a9ab8", "#5aaac8"], bridgeOver: "water", plank: ["#8a6a4a", "#7a5c3e"],
  weather: null, music: 3, surf: "sand", bg: { far: ["#9ab0c4", "#7f96ac"], near: "#b39a50", tree: null, extra: "kilimanjaro" } }, W_BASE), [
  { id: "w8", name: "Kilimanjaro Safari", seed: 7801, len: 3800, curvy: 0.85, hilly: 1.15, ramps: 6, splits: 2, pads: 8, haz: 0.75,
    movers: [{ id: "zebra", n: 6, amp: 1.0, spd: 0.55, zone: "herd" }, { id: "giraffe", n: 4, amp: 0.9, spd: 0.35, zone: "herd" }],
    blurb: "From the snowy summit of Africa's highest mountain down into the savanna: acacia plains and a zebra and giraffe stampede.",
    plan: [
      { t: "S", n: 80, d: 8, z: "summit" }, { t: "C", n: 150, d: 80, z: "summit" }, { t: "SW", dir: -1, k: 2, d: 16, z: "moor", f: "mtn" },
      { t: "T", dir: 1, c: 3, n: 170, d: 34, z: "moor" }, { t: "E", dir: -1, k: 3, c: 4, n: 210, d: 40, z: "forest" }, { t: "X", n: 140, d: 44, z: "savanna" },
      { t: "S", n: 220, d: 10, z: "herd" }, { t: "T", dir: 1, c: 2.5, n: 180, d: 20, z: "herd" }, { t: "S", n: 80, d: 2, z: "savanna", f: "ford" },
      { t: "E", dir: 1, k: 3, c: 4, n: 200, d: 30, z: "savanna" }, { t: "S", n: 200, d: 10, z: "herd" }, { t: "T", dir: -1, c: 3, n: 160, d: 20, z: "savanna" },
      { t: "S", n: 100, d: 6, z: "savanna" },
    ] },
]);

/* ======================= SEASONAL: NOVEMBER & DECEMBER ======================= */
// Diwali moves every year (Nov 8 in 2026). Update `season` each year: about a week either side of Diwali.
addTheme({ id: "diwali", name: "Diwali", sub: "Festival of Lights", group: "season", season: [1101, 1114], item: "laddoo", unlock: 0,
  sky: ["#0a0820", "#26164a", "#5a2a5a"], fog: "#2a1838", sun: "#fff3c8", sunY: 0.14, sunX: 0.25, sunR: 0.03,
  road: ["#6a5446", "#5f4a3e"], rut: "#4a3a30", edge: ["#ff8a1c", "#ffd23f"], ground: ["#3f3a2a", "#383324"],
  rock: ["#8a5a3a", "#c9a227"], chasm: ["#1a1228", "#160f22"], water: ["#2a3a6a", "#344a7a"], bridgeOver: "water", plank: ["#8a5a3a", "#7a4f32"],
  weather: "fireworks", music: 11, dark: 1, darkK: 0.55, aurora: 0, surf: null,
  bg: { far: ["#2a1a40", "#201433"], near: "#1a1226", tree: null, extra: "diwalitown" },
  hazard: "Firework spinners erupt on the road. Lamps and lights everywhere." }, [
  { id: "s11a", name: "Festival of Lights", seed: 9111, len: 3600, curvy: 0.9, hilly: 0.95, ramps: 6, splits: 2, pads: 9, haz: 0.75,
    bursts: { n: 9, kind: "fire" }, obs: ["sweets", "diyastand"],
    blurb: "A lit-up town on Diwali night: rows of glowing diyas, rangoli, marigold gates, firework spinners on the road and fireworks overhead.",
    plan: [
      { t: "S", n: 80, d: 4, z: "lanes", g: "torana", ge: 999 }, { t: "T", dir: 1, c: 3, n: 170, d: 24, z: "lanes" }, { t: "E", dir: -1, k: 3, c: 4, n: 210, d: 30, z: "bazaar", f: "canyon", ws: "lights" },
      { t: "S", n: 120, d: 8, z: "bazaar", g: "torana", ge: 30 }, { t: "T", dir: -1, c: 3, n: 160, d: 24, z: "ghat", f: "waterR" }, { t: "S", n: 80, d: 2, z: "ghat", f: "bridge" },
      { t: "X", n: 130, d: 44, z: "lanes" }, { t: "T", dir: 1, c: 3.5, n: 160, d: 30, f: "tunnel", ts: "palace" }, { t: "E", dir: 1, k: 3, c: 4.5, n: 200, d: 34, z: "lanes" },
      { t: "H", dir: -1, d: 6, z: "temple" }, { t: "C", n: 120, d: 56, z: "lanes" }, { t: "E", dir: -1, k: 3, c: 4, n: 200, d: 30, z: "bazaar", f: "canyon", ws: "lights" },
      { t: "S", n: 130, d: 8, z: "bazaar", g: "torana", ge: 26 },
    ] },
]);

addTheme({ id: "harvest", name: "Thanksgiving", sub: "Harvest season", group: "season", season: [1115, 1130], item: "pie", unlock: 0,
  sky: ["#6aa8d8", "#f2c98a", "#ffd9a0"], fog: "#f0c890", sun: "#fff0c0", sunY: 0.28, sunX: 0.72,
  road: ["#9a7048", "#8f663f"], rut: "#7a5634", edge: ["#6b4423", "#f2dcae"], ground: ["#a8963c", "#9e8c36"],
  rock: ["#8a6a4a", "#c9a648"], chasm: ["#6b5a2a", "#615226"], water: ["#4a8ab8", "#5a9ac8"], bridgeOver: "water", plank: ["#9a6a3c", "#8a5c32"],
  weather: "leaves", music: 12, surf: "mud",
  bg: { far: ["#c98a4a", "#b8763a"], near: "#a8862e", tree: "#b8562c", extra: "farmhills" },
  hazard: "Turkeys run across the road. Muddy patches in the fields." }, [
  { id: "s11b", name: "Harvest Hayride", seed: 9112, len: 3600, curvy: 0.85, hilly: 1.0, ramps: 5, splits: 1, pads: 8, haz: 0.7,
    movers: [{ id: "turkey", n: 9, amp: 1.0, spd: 0.75 }], obs: ["haybale", "pumpkinpile"],
    blurb: "A golden autumn farm: red barns and maple trees, turkeys running across the road, hay-bale ramps and a shortcut through the corn maze.",
    plan: [
      { t: "S", n: 80, d: 4, z: "farm" }, { t: "T", dir: 1, c: 2.5, n: 170, d: 24, z: "farm" }, { t: "S", n: 120, d: 8, z: "orchard", j: 1, jat: 0.4, jr: "hayramp" },
      { t: "E", dir: -1, k: 3, c: 4, n: 210, d: 30, z: "maples" }, { t: "S", n: 160, d: 10, z: "corn", f: "canyon", ws: "corn", fork: 1 }, { t: "T", dir: -1, c: 3, n: 160, d: 24, z: "farm" },
      { t: "S", n: 80, d: 2, z: "creek", f: "bridge" }, { t: "X", n: 130, d: 40, z: "fields" }, { t: "T", dir: 1, c: 3.5, n: 150, d: 28, f: "tunnel", ts: "barn" },
      { t: "E", dir: 1, k: 3, c: 4, n: 200, d: 30, z: "maples" }, { t: "S", n: 120, d: 8, z: "fields", j: 1, jat: 0.4, jr: "hayramp" }, { t: "C", n: 110, d: 50, z: "orchard" },
      { t: "T", dir: -1, c: 2.5, n: 150, d: 20, z: "farm" }, { t: "S", n: 100, d: 6, z: "farm" },
    ] },
]);

addTheme({ id: "xmas", name: "Christmas", sub: "North Pole", group: "season", season: [1201, 1231], item: "giftbox", unlock: 0,
  sky: ["#050c22", "#13284a", "#2a4a6a"], fog: "#1a2c48", sun: "#fff6e0", sunY: 0.15, sunX: 0.7, sunR: 0.035,
  road: ["#e9f0f8", "#dde6f2"], rut: "#b9c9df", edge: ["#e2433b", "#ffffff"], ground: ["#f4f8ff", "#e9f1fc"],
  rock: ["#9fb8d6", "#ffffff"], chasm: ["#3a5a8a", "#335080"], water: ["#7fd0f0", "#9fdcf5"], bridgeOver: "chasm", plank: ["#8a5a3a", "#7a4f32"],
  weather: "snow", music: 13, dark: 1, darkK: 0.5, surf: "ice",
  bg: { far: ["#2a3f6a", "#20335a"], near: "#e6eefa", tree: "#2c5e4a", snow: 1, extra: "northpole" },
  hazard: "Presents fall off Santa's sleigh. Icy patches, reindeer on the road." }, [
  { id: "s12", name: "North Pole Express", seed: 9120, len: 3600, curvy: 0.9, hilly: 1.05, ramps: 6, splits: 2, pads: 9, haz: 0.75,
    movers: [{ id: "reindeer", n: 5, amp: 1.0, spd: 0.45 }], fallers: [{ id: "gift", n: 9 }], obs: ["presents", "snowrock"],
    blurb: "A Christmas village under the northern lights: candy-cane gates, gingerbread houses, falling presents and a ride through Santa's workshop.",
    plan: [
      { t: "S", n: 80, d: 4, z: "village", g: "candygate", ge: 999 }, { t: "T", dir: 1, c: 3, n: 170, d: 26, z: "village" }, { t: "S", n: 130, d: 8, z: "canes", g: "candygate", ge: 18 },
      { t: "E", dir: -1, k: 3, c: 4, n: 210, d: 34, z: "forest" }, { t: "X", n: 130, d: 44, z: "forest" }, { t: "T", dir: -1, c: 3, n: 180, d: 26, f: "tunnel", ts: "workshop" },
      { t: "S", n: 90, d: 6, z: "village" }, { t: "SW", dir: 1, k: 2, d: 14, z: "forest", f: "mtn" }, { t: "S", n: 90, d: 4, z: "lake", f: "lake" },
      { t: "E", dir: 1, k: 3, c: 4.5, n: 200, d: 34, z: "canes" }, { t: "C", n: 120, d: 56, z: "forest", j: 1, jat: 0.2, jr: "skijump" }, { t: "T", dir: -1, c: 3, n: 160, d: 24, z: "village" },
      { t: "S", n: 100, d: 6, z: "village", g: "candygate", ge: 30 },
    ] },
]);

/* ======================= SEASONAL: JANUARY – SEPTEMBER ======================= */
const S_NIGHT = { dark: 1, aurora: 0 };
addTheme(Object.assign({ id: "newyear", name: "New Year", sub: "Midnight countdown", group: "season", season: [101, 131], item: "popper", unlock: 0,
  sky: ["#040818", "#101c44", "#2a2a5a"], fog: "#1a2040", sun: "#f4f2ff", sunY: 0.12, sunX: 0.2, sunR: 0.03, darkK: 0.5,
  road: ["#4a4a58", "#43434f"], rut: "#383844", edge: ["#ffd23f", "#ffffff"], ground: ["#eef4fa", "#e2eaf4"],
  rock: ["#8c94a6", "#ffffff"], chasm: ["#2a3a5a", "#24324f"], water: ["#3a5a8a", "#4a6a9a"], bridgeOver: "water", plank: ["#7a5a3a", "#6b4f32"],
  weather: "fireworks", music: 9, surf: "ice", bg: { far: ["#1e2c50", "#18243f"], near: "#dbe6f4", tree: "#2c4e44", snow: 1, extra: "skyline" } }, S_NIGHT), [
  { id: "s01", name: "New Year Fireworks", seed: 9001, len: 3500, curvy: 0.9, hilly: 1.0, ramps: 6, splits: 2, pads: 9, haz: 0.7, bursts: { n: 8, kind: "fire" },
    blurb: "A snowy town at midnight on New Year's Eve: fireworks overhead, sparkling streets, and a finish under the big clock tower.",
    plan: [
      { t: "S", n: 80, d: 4, z: "town", g: "nygate", ge: 999 }, { t: "T", dir: 1, c: 3, n: 170, d: 26, z: "town" }, { t: "E", dir: -1, k: 3, c: 4, n: 210, d: 30, z: "park" },
      { t: "S", n: 90, d: 4, z: "river", f: "bridge" }, { t: "T", dir: -1, c: 3, n: 160, d: 24, z: "town" }, { t: "X", n: 130, d: 44, z: "park" },
      { t: "SW", dir: 1, k: 2, d: 14, z: "town", f: "mtn" }, { t: "E", dir: 1, k: 3, c: 4.5, n: 200, d: 34, z: "town" }, { t: "C", n: 120, d: 56, z: "park" },
      { t: "T", dir: -1, c: 3, n: 160, d: 24, z: "town" }, { t: "S", n: 160, d: 6, z: "square", g: "nygate", ge: 60 },
    ] },
]);
addTheme({ id: "lunar", name: "Lunar New Year", sub: "Lantern streets", group: "season", season: [201, 229], item: "firecracker", unlock: 0,
  sky: ["#3a1a4a", "#c2443a", "#ffb36b"], fog: "#c8705a", sun: "#ffe8b0", sunY: 0.3, sunX: 0.7,
  road: ["#5a4a48", "#524240"], rut: "#463836", edge: ["#c4362b", "#ffd23f"], ground: ["#7a5a4a", "#704f41"],
  rock: ["#8a3a2a", "#c9a227"], chasm: ["#3a2028", "#331c23"], water: ["#3a5a7a", "#4a6a8a"], bridgeOver: "water", plank: ["#c4362b", "#b32f25"],
  weather: null, music: 8, surf: null, bg: { far: ["#7a3040", "#6a2836"], near: "#5a2a2a", tree: null, extra: "pagodas" } }, [
  { id: "s02", name: "Lantern Festival", seed: 9002, len: 3500, curvy: 0.9, hilly: 0.95, ramps: 6, splits: 2, pads: 9, haz: 0.75,
    movers: [{ id: "dragon", n: 5, amp: 0.9, spd: 0.6 }], bursts: { n: 7, kind: "fire" },
    blurb: "Red lantern streets at sunset for Lunar New Year: a dancing dragon weaving across the road, firecrackers and golden gateways.",
    plan: [
      { t: "S", n: 80, d: 4, z: "street", g: "paifang", ge: 999 }, { t: "T", dir: 1, c: 3, n: 170, d: 26, z: "street", g: "lanterns", ge: 10 }, { t: "E", dir: -1, k: 3, c: 4, n: 210, d: 30, z: "market" },
      { t: "S", n: 90, d: 4, z: "garden", f: "bridge" }, { t: "T", dir: -1, c: 3, n: 160, d: 24, z: "street", g: "lanterns", ge: 10 }, { t: "X", n: 130, d: 44, z: "garden" },
      { t: "E", dir: 1, k: 3, c: 4.5, n: 200, d: 34, z: "market" }, { t: "S", n: 100, d: 6, z: "street", g: "paifang", ge: 999 }, { t: "H", dir: -1, d: 6, z: "garden" },
      { t: "C", n: 120, d: 56, z: "street", g: "lanterns", ge: 12 }, { t: "T", dir: 1, c: 3, n: 160, d: 24, z: "market" }, { t: "S", n: 100, d: 6, z: "street" },
    ] },
]);
addTheme({ id: "holi", name: "Holi", sub: "Festival of Colours", group: "season", season: [301, 331], item: "colorballoon", unlock: 0,
  sky: ["#4fa8f0", "#bfe2fa", "#fff1d0"], fog: "#f6dbe8", sun: "#fffbe8", sunY: 0.12, sunX: 0.3,
  road: ["#b8906a", "#ad8660"], rut: "#9a7652", edge: ["#ff3d7f", "#ffd23f"], ground: ["#8fc45a", "#86b952"],
  rock: ["#c98a55", "#ffd23f"], chasm: ["#4a6a3a", "#426034"], water: ["#4ab0d8", "#62c0e4"], bridgeOver: "water", plank: ["#8a6a4a", "#7a5c3e"],
  weather: "colorpuffs", music: 3, surf: null, bg: { far: ["#d98aa8", "#c8789a"], near: "#e8b85a", tree: "#3f8a32" } }, [
  { id: "s03", name: "Holi Color Rush", seed: 9003, len: 3500, curvy: 0.9, hilly: 0.95, ramps: 6, splits: 2, pads: 9, haz: 0.75, bursts: { n: 12, kind: "color" },
    blurb: "Holi in the streets: clouds of coloured powder burst up from the road, dhol drums, colour stalls, and everyone gets painted.",
    plan: [
      { t: "S", n: 80, d: 4, z: "street" }, { t: "T", dir: 1, c: 3, n: 170, d: 26, z: "street" }, { t: "E", dir: -1, k: 3, c: 4, n: 210, d: 30, z: "bazaar", f: "canyon", ws: "lights" },
      { t: "S", n: 120, d: 6, z: "square" }, { t: "T", dir: -1, c: 3, n: 160, d: 24, z: "park" }, { t: "X", n: 130, d: 44, z: "street" },
      { t: "S", n: 80, d: 2, z: "ghat", f: "bridge" }, { t: "E", dir: 1, k: 3, c: 4.5, n: 200, d: 34, z: "bazaar" }, { t: "H", dir: -1, d: 6, z: "park" },
      { t: "C", n: 120, d: 56, z: "street" }, { t: "T", dir: 1, c: 3, n: 160, d: 24, z: "square" }, { t: "S", n: 100, d: 6, z: "square" },
    ] },
]);
addTheme({ id: "easter", name: "Spring", sub: "Egg hunt", group: "season", season: [401, 430], item: "egg", unlock: 0,
  sky: ["#7ac4f2", "#d6eefa", "#fff6e0"], fog: "#e8f2e0", sun: "#fffbe8", sunY: 0.14, sunX: 0.7,
  road: ["#c9a882", "#bf9e78"], rut: "#a8886a", edge: ["#ff9ec8", "#fff6c2"], ground: ["#8fd46a", "#86c962"],
  rock: ["#a8a8b8", "#8fd46a"], chasm: ["#4f8a4a", "#477f43"], water: ["#7ac4f2", "#8fd0f6"], bridgeOver: "water", plank: ["#c98a55", "#b87a48"],
  weather: "petals", music: 9, surf: null, bg: { far: ["#a8d8b0", "#90c89a"], near: "#7ac45a", tree: "#4f9b3c" } }, [
  { id: "s04", name: "Spring Egg Hunt", seed: 9004, len: 3500, curvy: 0.85, hilly: 1.0, ramps: 4, splits: 2, pads: 8, haz: 0.65,
    movers: [{ id: "bunny", n: 8, amp: 1.0, spd: 0.9 }],
    blurb: "Pastel spring meadows: jump off giant painted eggs, dodge hopping bunnies, and hunt for the golden egg crates.",
    plan: [
      { t: "S", n: 80, d: 4, z: "meadow" }, { t: "T", dir: 1, c: 3, n: 170, d: 26, z: "meadow", j: 1, jat: 0.5, jr: "eggramp" }, { t: "E", dir: -1, k: 3, c: 4, n: 210, d: 30, z: "garden" },
      { t: "S", n: 80, d: 2, z: "pond", f: "bridge" }, { t: "X", n: 130, d: 40, z: "meadow", j: 1, jat: 0.15, jr: "eggramp" }, { t: "T", dir: -1, c: 3, n: 160, d: 24, z: "eggs" },
      { t: "E", dir: 1, k: 3, c: 4.5, n: 200, d: 30, z: "garden" }, { t: "S", n: 140, d: 6, z: "eggs", j: 1, jat: 0.4, jr: "eggramp" }, { t: "C", n: 120, d: 50, z: "meadow" },
      { t: "T", dir: 1, c: 3, n: 160, d: 24, z: "eggs" }, { t: "S", n: 100, d: 6, z: "garden" },
    ] },
]);
addTheme({ id: "tulips", name: "Tulip Festival", sub: "Windmills & canals", group: "season", season: [501, 531], item: "tulipbulb", unlock: 0,
  sky: ["#5aa6e6", "#c9e2f5", "#f4f8ff"], fog: "#dde9f0", sun: "#fffbe8", sunY: 0.14, sunX: 0.3,
  road: ["#b06a4a", "#a56044"], rut: "#8a5038", edge: ["#6b4423", "#f2ead8"], ground: ["#6fb84a", "#66ad43"],
  rock: ["#8c94a6", "#6fb84a"], chasm: ["#3a6a8a", "#335f7f"], water: ["#3a8ad0", "#4a9ae0"], bridgeOver: "water", plank: ["#f2ead8", "#e6ddc8"],
  weather: null, music: 9, surf: null, bg: { far: ["#9ab8d0", "#86a6c0"], near: "#5fa840", tree: null, extra: "windmills", amp: 30, jag: 0 } }, [
  { id: "s05", name: "Tulip Canal Run", seed: 9005, len: 3500, curvy: 0.85, hilly: 0.8, ramps: 6, splits: 2, pads: 9, haz: 0.65,
    movers: [{ id: "cheese", n: 7, amp: 1.0, spd: 1.0 }],
    blurb: "Flat-out through stripes of tulips: windmills, canal bridges, gabled houses and runaway cheese wheels rolling across the road.",
    plan: [
      { t: "S", n: 100, d: 4, z: "tulips" }, { t: "T", dir: 1, c: 2.5, n: 170, d: 20, z: "tulips" }, { t: "S", n: 80, d: 2, z: "canal", f: "bridge" },
      { t: "E", dir: -1, k: 3, c: 4, n: 210, d: 24, z: "town" }, { t: "S", n: 120, d: 6, z: "mills", f: "waterL" }, { t: "T", dir: -1, c: 3, n: 160, d: 20, z: "tulips" },
      { t: "S", n: 80, d: 2, z: "canal", f: "bridge" }, { t: "X", n: 130, d: 36, z: "tulips" }, { t: "E", dir: 1, k: 3, c: 4.5, n: 200, d: 28, z: "town" },
      { t: "S", n: 120, d: 6, z: "mills", f: "waterR" }, { t: "T", dir: 1, c: 3, n: 160, d: 20, z: "tulips" }, { t: "S", n: 80, d: 2, z: "canal", f: "bridge" },
      { t: "S", n: 100, d: 6, z: "town" },
    ] },
]);
addTheme({ id: "beach", name: "Summer", sub: "Beach bash", group: "season", season: [601, 630], item: "beachball", unlock: 0,
  sky: ["#2f9ae8", "#9ed8f6", "#fff4d0"], fog: "#e6f2f0", sun: "#ffffff", sunY: 0.1, sunX: 0.7,
  road: ["#c9a06a", "#bf9660"], rut: "#a8865a", edge: ["#ff8a1c", "#fff6e0"], ground: ["#f2d79a", "#ebcf90"],
  rock: ["#c9a882", "#f2d79a"], chasm: ["#1f8ad0", "#1c80c2"], water: ["#1f9ae0", "#3ab0ee"], bridgeOver: "water", plank: ["#c98a55", "#b87a48"],
  weather: null, music: 14, surf: "sand", bg: { far: ["#2b9cff", "#1f8ae6"], near: "#f2d79a", tree: null, extra: "ocean", amp: 20, jag: 0 } }, [
  { id: "s06", name: "Beach Bash", seed: 9006, len: 3500, curvy: 0.85, hilly: 0.85, ramps: 7, splits: 2, pads: 9, haz: 0.7,
    movers: [{ id: "beachball", n: 8, amp: 1.0, spd: 1.1 }], obs: ["sandcastle", "surfboard"],
    blurb: "Sun, sand and a boardwalk by the waves: smash through sandcastles, dodge bouncing beach balls, and jump the lifeguard dunes.",
    plan: [
      { t: "S", n: 80, d: 4, z: "beach", f: "waterR" }, { t: "T", dir: 1, c: 3, n: 170, d: 20, z: "beach", f: "waterR" }, { t: "S", n: 140, d: 4, z: "boardwalk", f: "bridge", rs: "rope" },
      { t: "E", dir: -1, k: 3, c: 4, n: 210, d: 26, z: "dunes" }, { t: "X", n: 130, d: 36, z: "beach", j: 1, jat: 0.15, jr: "sandramp" }, { t: "T", dir: -1, c: 3, n: 160, d: 20, z: "beach", f: "waterL" },
      { t: "S", n: 120, d: 4, z: "boardwalk", f: "bridge", rs: "rope" }, { t: "E", dir: 1, k: 3, c: 4.5, n: 200, d: 28, z: "dunes" }, { t: "C", n: 110, d: 44, z: "beach", f: "waterR" },
      { t: "T", dir: 1, c: 3, n: 160, d: 20, z: "beach", f: "waterR" }, { t: "S", n: 100, d: 6, z: "beach" },
    ] },
]);
addTheme(Object.assign({ id: "july4", name: "Fourth of July", sub: "Parade night", group: "season", season: [701, 731], item: "sparkler", unlock: 0,
  sky: ["#06102a", "#1a2a5a", "#3a3a6a"], fog: "#1c2448", sun: "#f4f2ff", sunY: 0.12, sunX: 0.75, sunR: 0.03, darkK: 0.5,
  road: ["#4a4a52", "#43434b"], rut: "#38383f", edge: ["#e2433b", "#ffffff"], ground: ["#3f6a3a", "#386034"],
  rock: ["#8a7a6a", "#3f6a3a"], chasm: ["#1a2a3a", "#162433"], water: ["#2a4a7a", "#344f80"], bridgeOver: "water", plank: ["#8a6a4a", "#7a5c3e"],
  weather: "fireworks", music: 0, surf: null, bg: { far: ["#1a2a4a", "#14223d"], near: "#2a4a30", tree: "#1f3a24" } }, S_NIGHT), [
  { id: "s07", name: "Fireworks Parade", seed: 9007, len: 3500, curvy: 0.85, hilly: 0.9, ramps: 6, splits: 2, pads: 9, haz: 0.7, bursts: { n: 9, kind: "fire" },
    movers: [{ id: "float", n: 4, amp: 0.7, spd: 0.25 }],
    blurb: "A small-town parade route on the Fourth of July: fireworks overhead, star-spangled banners, slow parade floats and sparklers on the road.",
    plan: [
      { t: "S", n: 80, d: 4, z: "main", g: "starbanner", ge: 999 }, { t: "T", dir: 1, c: 3, n: 170, d: 26, z: "main" }, { t: "E", dir: -1, k: 3, c: 4, n: 210, d: 30, z: "park" },
      { t: "S", n: 120, d: 6, z: "main", g: "starbanner", ge: 40 }, { t: "T", dir: -1, c: 3, n: 160, d: 24, z: "lake", f: "waterL" }, { t: "S", n: 80, d: 2, z: "lake", f: "bridge" },
      { t: "X", n: 130, d: 44, z: "park" }, { t: "E", dir: 1, k: 3, c: 4.5, n: 200, d: 34, z: "main" }, { t: "C", n: 120, d: 56, z: "park" },
      { t: "T", dir: 1, c: 3, n: 160, d: 24, z: "main" }, { t: "S", n: 120, d: 6, z: "main", g: "starbanner", ge: 50 },
    ] },
]);
addTheme({ id: "carnival", name: "Carnival", sub: "Summer fair", group: "season", season: [801, 831], item: "cottoncandy", unlock: 0,
  sky: ["#4a8ae0", "#f2b0c8", "#ffe0b0"], fog: "#f0c8c8", sun: "#fff4d8", sunY: 0.26, sunX: 0.3,
  road: ["#8a7a6a", "#80705f"], rut: "#6e6052", edge: ["#ff3d7f", "#ffffff"], ground: ["#6aaa4a", "#619f43"],
  rock: ["#8a7a6a", "#6aaa4a"], chasm: ["#4a6a3a", "#426034"], water: ["#4a9ad8", "#5aaae6"], bridgeOver: "chasm", plank: ["#e2433b", "#d63b33"],
  weather: null, music: 13, surf: null, bg: { far: ["#c87aa0", "#b86a90"], near: "#5a9a40", tree: "#3f7a32", extra: "fairground" } }, [
  { id: "s08", name: "Carnival Coaster", seed: 9008, len: 3500, curvy: 0.9, hilly: 1.15, ramps: 6, splits: 1, pads: 10, haz: 0.7,
    movers: [{ id: "balloons", n: 7, amp: 0.9, spd: 0.7 }],
    blurb: "A summer fair at sunset: past the Ferris wheel and game booths, drifting balloons, and a wild stretch riding on the roller-coaster track.",
    plan: [
      { t: "S", n: 80, d: 4, z: "midway" }, { t: "T", dir: 1, c: 3, n: 170, d: 26, z: "midway" }, { t: "E", dir: -1, k: 3, c: 4, n: 210, d: 30, z: "tents" },
      { t: "X", n: 130, d: 50, f: "ridge", rs: "coaster" }, { t: "T", dir: -1, c: 4, n: 160, d: 34, f: "ridge", rs: "coaster" }, { t: "X", n: 130, d: 56, f: "ridge", rs: "coaster" },
      { t: "C", n: 120, d: 60, f: "ridge", rs: "coaster" }, { t: "S", n: 100, d: 6, z: "midway" }, { t: "E", dir: 1, k: 3, c: 4.5, n: 200, d: 34, z: "tents" },
      { t: "T", dir: 1, c: 3, n: 160, d: 24, z: "midway" }, { t: "S", n: 100, d: 6, z: "midway" },
    ] },
]);
addTheme({ id: "autumn", name: "Autumn", sub: "Falling leaves", group: "season", season: [901, 930], item: "acorn", unlock: 0,
  sky: ["#5aa0d8", "#c9dcea", "#ffe2b8"], fog: "#e8d0b0", sun: "#fff2cc", sunY: 0.2, sunX: 0.7,
  road: ["#8a6a4a", "#80603f"], rut: "#6e5236", edge: ["#5a3a22", "#f2dcae"], ground: ["#a8862e", "#9e7c28"],
  rock: ["#7d7f74", "#c9761c"], chasm: ["#4a5a3a", "#425034"], water: ["#4a8ab8", "#5a9ac8"], bridgeOver: "water", plank: ["#9a4a2a", "#8a3f24"],
  weather: "leaves", music: 12, surf: "mud", bg: { far: ["#c9863e", "#b8762e"], near: "#a8562c", tree: "#c4562b" } }, [
  { id: "s09", name: "Autumn Leaf Rush", seed: 9009, len: 3500, curvy: 0.9, hilly: 1.05, ramps: 6, splits: 2, pads: 8, haz: 0.7,
    movers: [{ id: "squirrel", n: 8, amp: 1.0, spd: 1.0 }], fallers: [{ id: "branch", n: 5 }],
    blurb: "Through a red-and-gold forest in full autumn colour: covered wooden bridges, squirrels darting across, and falling branches.",
    plan: [
      { t: "S", n: 80, d: 4, z: "maples" }, { t: "T", dir: 1, c: 3, n: 170, d: 26, z: "maples" }, { t: "S", n: 90, d: 2, z: "creek", f: "bridge", g: "coveredbridge", ge: 4 },
      { t: "E", dir: -1, k: 3, c: 4, n: 210, d: 30, z: "gold" }, { t: "X", n: 130, d: 44, z: "maples" }, { t: "T", dir: -1, c: 3, n: 160, d: 24, z: "farm" },
      { t: "S", n: 90, d: 2, z: "creek", f: "bridge", g: "coveredbridge", ge: 4 }, { t: "E", dir: 1, k: 3, c: 4.5, n: 200, d: 34, z: "gold" }, { t: "SW", dir: -1, k: 2, d: 14, z: "maples", f: "mtn" },
      { t: "C", n: 120, d: 56, z: "gold" }, { t: "T", dir: 1, c: 3, n: 160, d: 24, z: "maples" }, { t: "S", n: 100, d: 6, z: "farm" },
    ] },
]);
