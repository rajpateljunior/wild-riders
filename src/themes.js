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
