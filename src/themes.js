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
  let end = new Date(d.getFullYear(), Math.floor(z / 100) - 1, z % 100);
  const day0 = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  if (end < day0) end = new Date(d.getFullYear() + 1, Math.floor(z / 100) - 1, z % 100);
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
