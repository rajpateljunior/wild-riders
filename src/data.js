/* Game data: riders, vehicles, items, biomes, tracks, progression. */

const RIDERS = [
  { id: "kaito", name: "Kaito", full: "Kaito Arashi", tag: "The Storm", num: 7,
    blurb: "Calm, cocky, never brakes. Rides like the wind he's named after.",
    hp: 100, spd: 1.0, acc: 1.0, hdl: 1.0, pow: 1.0, item: "shuriken",
    skin: "#f2c6a0", hair: "#1d2a52", hair2: "#3b5bb5", eye: "#e2433b", main: "#e2433b", alt: "#f4f1ea", dark: "#2a1f33",
    paint: "#e2433b", paint2: "#1e1e28", cost: 0 },
  { id: "priya", name: "Priya", full: "Priya \"Spice\" Rao", tag: "Spice", num: 21,
    blurb: "Mumbai street racer. Fastest top speed, throws chili bombs that burn.",
    hp: 85, spd: 1.06, acc: 1.05, hdl: 0.96, pow: 0.9, item: "chili",
    skin: "#b8784f", hair: "#1b1012", hair2: "#4a2a2a", eye: "#6b3b1c", main: "#ff8a1c", alt: "#ffd23f", dark: "#3a1d14",
    paint: "#ff8a1c", paint2: "#2b1a14", cost: 0 },
  { id: "bruno", name: "Bruno", full: "Bruno Kessler", tag: "The Wall", num: 99,
    blurb: "Ex-lumberjack. Takes a beating, hits like a falling redwood.",
    hp: 140, spd: 0.95, acc: 0.9, hdl: 0.9, pow: 1.35, item: "boulder",
    skin: "#7a4a32", hair: "#20140f", hair2: "#4b3326", eye: "#3d7a3a", main: "#5d7f2f", alt: "#f0a531", dark: "#22281a",
    paint: "#4a6fa5", paint2: "#262b33", cost: 1200 },
  { id: "yuki", name: "Yuki", full: "Yuki Shirakawa", tag: "Snow Bunny", num: 3,
    blurb: "Tiny, twitchy and terrifying. Best acceleration, fragile frame.",
    hp: 70, spd: 1.04, acc: 1.12, hdl: 1.12, pow: 0.75, item: "snowburst",
    skin: "#fbe0d2", hair: "#e9ecf7", hair2: "#a9b4e0", eye: "#4fb3ff", main: "#ff79b0", alt: "#ffffff", dark: "#3b2440",
    paint: "#ff79b0", paint2: "#f7f3ff", cost: 1500 },
  { id: "zara", name: "Zara", full: "Zara Al-Rimal", tag: "Dune Ghost", num: 44,
    blurb: "Grew up surfing sand dunes. Precise, patient, deadly accurate throws.",
    hp: 95, spd: 1.0, acc: 1.0, hdl: 1.06, pow: 1.0, item: "sandbomb",
    skin: "#c99068", hair: "#2a1a10", hair2: "#5a3b22", eye: "#c9a227", main: "#13a89e", alt: "#e9c46a", dark: "#16302e",
    paint: "#e9c46a", paint2: "#13a89e", cost: 1800 },
  { id: "rex", name: "Rex", full: "Rex Vandal", tag: "Mayhem", num: 66,
    blurb: "Punk wrecking ball. Hits hard, laughs louder, paints everyone green.",
    hp: 115, spd: 0.98, acc: 0.98, hdl: 0.95, pow: 1.2, item: "paint",
    skin: "#efc0a0", hair: "#38e05a", hair2: "#16a33a", eye: "#8a4dff", main: "#1c1a22", alt: "#38e05a", dark: "#0f0e13",
    paint: "#38e05a", paint2: "#141318", cost: 2200 },
];

/* Vehicles, in unlock order (each one unlocks only after the one before it).
   w = hit width (world units), sw = drawn width of the 240px rider sprite (world units), so the rider is the same size on every ride.
   shove = pushes lighter riders aside on contact; regen = boost meter refill per second. */
const VEHICLES = [
  { id: "mtb", name: "Downhill MTB", short: "MTB", blurb: "Nimble full-suspension bike. Great at tricks and tight lines.",
    max: 1.0, acc: 1.0, grip: 1.1, armor: 0.0, trick: 1.15, mass: 1.0, w: 520, sw: 650, cost: 0 },
  { id: "bmx", name: "BMX", short: "BMX", blurb: "Tiny and twitchy. Biggest trick boost, lowest top speed.",
    max: 0.95, acc: 1.15, grip: 1.2, armor: -0.1, trick: 1.45, mass: 0.8, w: 460, sw: 600, cost: 0 },
  { id: "ebike", name: "Enduro E-Bike", short: "E-BIKE", blurb: "Electric kick off the line, and the battery slowly refills your boost. Light frame, so hits hurt.",
    max: 1.0, acc: 1.3, grip: 1.05, armor: -0.08, trick: 1.0, mass: 1.05, w: 540, sw: 660, regen: 2.4, cost: 1500 },
  { id: "dirt", name: "Dirt Bike", short: "DIRT", blurb: "Raw engine power. The fastest machine on the mountain.",
    max: 1.08, acc: 1.1, grip: 0.95, armor: 0.1, trick: 0.9, mass: 1.3, w: 600, sw: 740, cost: 2000 },
  { id: "atv", name: "ATV Quad", short: "ATV", blurb: "Four-wheeled tank. Shrugs off hits and shoves riders aside.",
    max: 1.03, acc: 0.9, grip: 0.86, armor: 0.3, trick: 0.6, mass: 1.8, w: 680, sw: 780, shove: 1, cost: 2600 },
  { id: "squad", name: "Sport Quad", short: "SPORT", blurb: "A race-tuned quad: lighter and faster than the ATV, still shoves bikes aside, but less armor.",
    max: 1.07, acc: 1.02, grip: 0.95, armor: 0.14, trick: 0.75, mass: 1.5, w: 650, sw: 760, shove: 1, cost: 3400 },
];

// Throwables. dmg = health damage, spd = forward speed bonus (units/s), slow = speed multiplier on hit.
const ITEMS = {
  pinecone:  { name: "Pinecone",      dmg: 12, spd: 5400, slow: 0.8,  col: "#8b5a2b" },
  pear:      { name: "Prickly Pear",  dmg: 13, spd: 5300, slow: 0.78, col: "#d1427a" },
  snowball:  { name: "Snowball",      dmg: 10, spd: 5700, slow: 0.75, col: "#eef6ff" },
  coconut:   { name: "Coconut",       dmg: 16, spd: 4900, slow: 0.78, col: "#6b4423" },
  magma:     { name: "Magma Rock",    dmg: 18, spd: 5100, slow: 0.8,  col: "#ff5a1f", burn: 1 },
  iceshard:  { name: "Ice Shard",     dmg: 14, spd: 6300, slow: 0.72, col: "#8fe9ff" },
  shuriken:  { name: "Wind Shuriken", dmg: 14, spd: 7200, slow: 0.82, col: "#cfe3ff", sig: 1 },
  chili:     { name: "Chili Bomb",    dmg: 16, spd: 5400, slow: 0.7,  col: "#ff2d2d", burn: 1, sig: 1 },
  boulder:   { name: "Medicine Ball", dmg: 24, spd: 4600, slow: 0.65, col: "#7a5236", sig: 1 },
  snowburst: { name: "Snow Burst",    dmg: 8,  spd: 6000, slow: 0.7, col: "#ffffff", spread: 3, sig: 1 },
  sandbomb:  { name: "Sand Bomb",     dmg: 13, spd: 5900, slow: 0.75, col: "#e9c46a", home: 1, blind: 1, sig: 1 },
  paint:     { name: "Paint Bomb",    dmg: 12, spd: 5500, slow: 0.78, col: "#38e05a", blind: 1, sig: 1 },
};

/* Biomes. Colors drive the road, ground, fog and sky; `item` is the throwable found in crates. */
const BIOMES = [
  { id: "forest", name: "Redwood Run", sub: "Ancient forest", item: "pinecone", unlock: 0,
    sky: ["#7fc4e8", "#cfe9d9", "#fbe9b7"], fog: "#b9d9c4", sun: "#fff3c4", sunY: 0.18, sunX: 0.72,
    road: ["#9b6a43", "#8c5e3a"], rut: "#6e4a2c", edge: ["#5c3d26", "#e8d7b8"], ground: ["#3f7d36", "#37722f"],
    rock: ["#6f6a5e", "#4f8a3a"], chasm: ["#2c4a3b", "#284434"], water: ["#3f8fb8", "#58a6cc"], bridgeOver: "water", plank: ["#9a6a3c", "#8a5c32"],
    weather: "shafts", music: 0,
    hazard: "Fallen logs and root gardens. Hit the side lines for shortcuts." },
  { id: "desert", name: "Saffron Dunes", sub: "Red-rock desert", item: "pear", unlock: 3,
    sky: ["#2f8fd8", "#8fd0f0", "#ffe2a8"], fog: "#f3cf9a", sun: "#fffbe0", sunY: 0.12, sunX: 0.3,
    road: ["#e0a865", "#d39b58"], rut: "#b9814a", edge: ["#a8562f", "#f6e2b8"], ground: ["#e9b46e", "#dfa962"],
    rock: ["#c4562b", "#e07a45"], chasm: ["#7a3518", "#6e2f15"], water: ["#3fa0c8", "#5cb6d8"], bridgeOver: "chasm", plank: ["#a8743f", "#966536"],
    weather: "sand", music: 1,
    hazard: "Soft sand drags you down. Sandstorms roll in without warning." },
  { id: "glacier", name: "Glacier Peak", sub: "High alpine snow", item: "snowball", unlock: 7,
    sky: ["#3d74c9", "#a8cdf2", "#eef6ff"], fog: "#e3eefb", sun: "#ffffff", sunY: 0.1, sunX: 0.62,
    road: ["#e8f0fa", "#dbe6f4"], rut: "#b9c9df", edge: ["#7aa3cf", "#ffffff"], ground: ["#f4f8ff", "#e9f1fc"],
    rock: ["#9fb8d6", "#ffffff"], chasm: ["#4f76a3", "#47699a"], water: ["#7fd0f0", "#9fdcf5"], bridgeOver: "chasm", plank: ["#8a6a4a", "#7a5c3e"],
    weather: "snow", music: 2,
    hazard: "Blue ice slides. On Avalanche! the mountain itself chases you." },
  { id: "ghats", name: "Monsoon Ghats", sub: "Rainforest & tea terraces", item: "coconut", unlock: 11,
    sky: ["#5f7f8c", "#9fb9b4", "#d8e4cf"], fog: "#a9c2b2", sun: "#f3f7e6", sunY: 0.2, sunX: 0.5,
    road: ["#a0522d", "#93491f"], rut: "#6f3518", edge: ["#5b2d15", "#e9dcb8"], ground: ["#2f8a3e", "#2a7e37"],
    rock: ["#5a5a4a", "#3c8a3c"], chasm: ["#21483a", "#1d4133"], water: ["#4a8a9a", "#62a0ae"], bridgeOver: "water", plank: ["#8f5b31", "#7f4f2a"],
    weather: "rain", music: 3,
    hazard: "Mud pits and river crossings. Monsoon rain never stops." },
  { id: "volcano", name: "Ember Caldera", sub: "Active volcano", item: "magma", unlock: 15,
    sky: ["#1a0f1f", "#6b2130", "#ff7a3d"], fog: "#5b2a2a", sun: "#ffb36b", sunY: 0.32, sunX: 0.5,
    road: ["#3d3434", "#332b2b"], rut: "#241e1e", edge: ["#ff5a1f", "#1b1515"], ground: ["#2a2222", "#231c1c"],
    rock: ["#3a2e2e", "#55403a"], chasm: ["#ff5a1f", "#ff7a2f"], water: ["#ff5a1f", "#ff8a2f"], bridgeOver: "chasm", plank: ["#4a4040", "#3e3535"], lavaSide: 1,
    weather: "ash", music: 4,
    hazard: "Lava cracks burn. Steam geysers launch you sky-high." },
  { id: "tundra", name: "Aurora Tundra", sub: "Arctic night", item: "iceshard", unlock: 19,
    sky: ["#050817", "#0d1b3d", "#1d3a5c"], fog: "#14284a", sun: "#e8f1ff", sunY: 0.16, sunX: 0.24,
    road: ["#c9d7ea", "#bccbe0"], rut: "#9fb0c9", edge: ["#4a6a96", "#e9f3ff"], ground: ["#8ea5c4", "#859cbb"],
    rock: ["#3a4a66", "#dbe8ff"], chasm: ["#0a1426", "#08101f"], water: ["#2a4a7a", "#35588a"], bridgeOver: "water", plank: ["#5a4a3e", "#4e4035"],
    weather: "aurora", music: 5, dark: 1,
    hazard: "Pitch-black stretches lit only by your headlamp. Frozen lakes slide." },
];

/* Tracks: 2 per biome. Each has its own hand-written `plan` (a list of beats that track.js expands), so every
   trail turns, drops and passes through places differently. Beat keys:
     t: S straight · T turn · E esses (k alternating bends) · H hairpin · SW switchbacks (k hairpins) · C steep chute
        X crest-then-plunge · ST staircase (k drop-and-flat steps)
     dir: -1 left / 1 right · c: bend strength · n: length in segments (scaled to fit `len`) · d: total drop (segments)
     z: scenery zone (BIOME_SCENERY[biome].zones) · f: feature — tunnel, falls (behind a waterfall), cave (crystal cave),
        bridge, canyon (rock walls both sides), mtn (mountain wall on the inside of the bend, drop-off outside),
        cliffL/cliffR (wall on that side, drop-off on the other), waterL/waterR, lavaL/lavaR (river beside the trail),
        lake (frozen lake both sides), ford (river across the trail)
   `look` tints the sky for the second trail of a biome (time of day). */
const TRACKS = [
  { id: "f1", biome: 0, name: "Fernline Descent", seed: 1101, len: 3300, curvy: 0.8, hilly: 0.8, ramps: 5, splits: 2, pads: 7, haz: 0.6,
    blurb: "Flowing forest bends, a sunny meadow and a wooden bridge over the river.",
    plan: [
      { t: "S", n: 80, d: 4, z: "deep" }, { t: "T", dir: 1, c: 3, n: 180, d: 30, z: "deep" }, { t: "T", dir: -1, c: 3.5, n: 160, d: 28, z: "deep" },
      { t: "S", n: 90, d: 10, z: "meadow" }, { t: "E", dir: -1, k: 3, c: 4, n: 210, d: 30, z: "meadow" }, { t: "T", dir: 1, c: 2.5, n: 130, d: 14, z: "river", f: "waterL" },
      { t: "S", n: 70, d: 2, z: "river", f: "bridge" }, { t: "T", dir: -1, c: 4.5, n: 150, d: 34, z: "deep" }, { t: "X", n: 130, d: 40, z: "deep" },
      { t: "T", dir: 1, c: 5, n: 130, d: 26, z: "camp" }, { t: "S", n: 90, d: 8, z: "camp" }, { t: "H", dir: -1, d: 6, z: "deep" },
      { t: "C", n: 120, d: 60, z: "deep" }, { t: "T", dir: 1, c: 3, n: 170, d: 34, z: "meadow" }, { t: "E", dir: -1, k: 2, c: 3.5, n: 150, d: 24, z: "deep" },
      { t: "T", dir: -1, c: 2, n: 150, d: 20, z: "river", f: "waterR" }, { t: "S", n: 100, d: 10, z: "deep" },
    ] },
  { id: "f2", biome: 0, name: "Giant's Staircase", seed: 1102, len: 3700, curvy: 0.9, hilly: 1.1, ramps: 7, splits: 2, pads: 8, haz: 0.85,
    blurb: "Switchbacks down a cliff face, rock tunnels and a logging camp. Golden hour.",
    look: { sky: ["#e98a4f", "#f6c08a", "#ffe6b0"], fog: "#e7c29a", sun: "#fff0c0", sunY: 0.3, sunX: 0.22 },
    plan: [
      { t: "S", n: 60, d: 6, z: "deep" }, { t: "T", dir: -1, c: 3, n: 140, d: 34, z: "deep", f: "mtn" }, { t: "SW", dir: 1, k: 3, d: 14, z: "deep", f: "mtn" },
      { t: "ST", k: 4, d: 16, z: "camp" }, { t: "T", dir: 1, c: 4, n: 120, d: 30, f: "tunnel" }, { t: "C", n: 110, d: 64, z: "deep" },
      { t: "SW", dir: -1, k: 2, d: 14, z: "deep", f: "mtn" }, { t: "T", dir: -1, c: 3, n: 140, d: 24, z: "camp" }, { t: "ST", k: 3, d: 18, z: "deep" },
      { t: "E", dir: 1, k: 3, c: 4.5, n: 200, d: 40, z: "deep" }, { t: "H", dir: 1, d: 8, z: "deep", f: "mtn" }, { t: "X", n: 120, d: 50, z: "meadow" },
      { t: "T", dir: -1, c: 5, n: 130, d: 30, f: "tunnel" }, { t: "S", n: 80, d: 12, z: "meadow" }, { t: "SW", dir: 1, k: 2, d: 16, z: "deep", f: "mtn" },
      { t: "C", n: 120, d: 70, z: "deep" }, { t: "S", n: 80, d: 8, z: "meadow" },
    ] },
  { id: "d1", biome: 1, name: "Mesa Drop", seed: 2201, len: 3500, curvy: 0.75, hilly: 1.0, ramps: 6, splits: 2, pads: 8, haz: 0.7,
    blurb: "Winding red-rock canyons, an adobe village and a plunge off the mesa edge.",
    plan: [
      { t: "S", n: 90, d: 4, z: "open" }, { t: "T", dir: 1, c: 2, n: 200, d: 20, z: "open" }, { t: "E", dir: -1, k: 4, c: 4.5, n: 260, d: 36, f: "canyon" },
      { t: "S", n: 100, d: 6, z: "pueblo" }, { t: "T", dir: -1, c: 3, n: 150, d: 20, z: "pueblo" }, { t: "X", n: 150, d: 60, z: "open" },
      { t: "C", n: 130, d: 74, z: "open", f: "cliffR" }, { t: "T", dir: 1, c: 3.5, n: 160, d: 30, z: "open" }, { t: "E", dir: 1, k: 3, c: 5, n: 200, d: 30, f: "canyon" },
      { t: "S", n: 120, d: 10, z: "oasis", f: "waterR" }, { t: "T", dir: -1, c: 2.5, n: 160, d: 20, z: "oasis" }, { t: "H", dir: 1, d: 6, f: "canyon" },
      { t: "S", n: 160, d: 12, z: "open" }, { t: "T", dir: -1, c: 4, n: 150, d: 34, z: "open" }, { t: "S", n: 100, d: 8, z: "pueblo" },
    ] },
  { id: "d2", biome: 1, name: "Sandstorm Alley", seed: 2202, len: 3800, curvy: 0.9, hilly: 0.9, ramps: 6, splits: 3, pads: 9, haz: 0.9, storm: 1,
    blurb: "Flat-out desert straights cut by hairpins and a dark slot canyon. Hazy sunset.",
    look: { sky: ["#c9653a", "#ee9f62", "#ffd49a"], fog: "#f0bb85", sun: "#fff3d0", sunY: 0.26, sunX: 0.7 },
    plan: [
      { t: "S", n: 200, d: 14, z: "open" }, { t: "H", dir: -1, d: 6, f: "canyon" }, { t: "S", n: 240, d: 20, z: "open" }, { t: "H", dir: 1, d: 6, f: "canyon" },
      { t: "S", n: 160, d: 12, z: "oasis", f: "waterL" }, { t: "T", dir: 1, c: 3, n: 140, d: 20, z: "oasis" }, { t: "S", n: 220, d: 22, z: "open" },
      { t: "T", dir: -1, c: 4, n: 120, d: 20, f: "tunnel" }, { t: "S", n: 200, d: 18, z: "open" }, { t: "SW", dir: -1, k: 2, d: 10, f: "canyon" },
      { t: "S", n: 240, d: 24, z: "pueblo" }, { t: "H", dir: 1, d: 6, f: "canyon" }, { t: "C", n: 140, d: 60, z: "open" }, { t: "S", n: 200, d: 14, z: "open" },
    ] },
  { id: "g1", biome: 2, name: "Frostbite Run", seed: 3301, len: 3600, curvy: 0.85, hilly: 1.1, ramps: 7, splits: 2, pads: 8, haz: 0.8,
    blurb: "Ski-resort slalom past the lodges, an ice tunnel and a bridge over a crevasse.",
    plan: [
      { t: "S", n: 80, d: 6, z: "resort" }, { t: "E", dir: 1, k: 4, c: 3.5, n: 260, d: 40, z: "resort" }, { t: "S", n: 100, d: 10, z: "resort" },
      { t: "T", dir: -1, c: 3, n: 160, d: 30, z: "bowl" }, { t: "X", n: 120, d: 40, z: "bowl" }, { t: "T", dir: 1, c: 4.5, n: 150, d: 30, f: "tunnel" },
      { t: "E", dir: -1, k: 3, c: 4, n: 210, d: 34, z: "icefall" }, { t: "S", n: 110, d: 14, z: "resort" }, { t: "H", dir: 1, d: 6, z: "icefall", f: "mtn" },
      { t: "C", n: 140, d: 70, z: "bowl" }, { t: "S", n: 80, d: 6, z: "icefall", f: "bridge" }, { t: "T", dir: -1, c: 3, n: 150, d: 24, z: "resort" },
      { t: "E", dir: 1, k: 3, c: 3.5, n: 200, d: 30, z: "resort" }, { t: "S", n: 120, d: 10, z: "resort" },
    ] },
  { id: "g2", biome: 2, name: "Avalanche!", seed: 3302, len: 3900, curvy: 0.75, hilly: 1.3, ramps: 8, splits: 2, pads: 10, haz: 0.9, avalanche: 1,
    blurb: "Steep chutes, cliff ledges and an avalanche shed, with the mountain right behind you. Grey storm sky.",
    look: { sky: ["#7489a8", "#bccadc", "#eef3fa"], fog: "#dfe7f2", sun: "#f4f7ff", sunY: 0.14, sunX: 0.4 },
    plan: [
      { t: "S", n: 60, d: 10, z: "bowl" }, { t: "C", n: 160, d: 90, z: "bowl" }, { t: "T", dir: -1, c: 3, n: 150, d: 50, z: "icefall", f: "mtn" },
      { t: "C", n: 140, d: 84, z: "bowl" }, { t: "T", dir: 1, c: 4, n: 140, d: 40, f: "tunnel" }, { t: "C", n: 150, d: 90, z: "bowl" },
      { t: "S", n: 80, d: 20, z: "icefall", f: "bridge" }, { t: "T", dir: -1, c: 4.5, n: 140, d: 50, z: "icefall", f: "mtn" }, { t: "X", n: 140, d: 70, z: "bowl" },
      { t: "E", dir: 1, k: 3, c: 4, n: 210, d: 70, z: "icefall" }, { t: "C", n: 160, d: 96, z: "bowl" }, { t: "T", dir: 1, c: 3, n: 150, d: 50, z: "icefall", f: "mtn" },
      { t: "S", n: 100, d: 20, z: "resort" },
    ] },
  { id: "m1", biome: 3, name: "Tea Terrace Twist", seed: 4401, len: 3700, curvy: 1.0, hilly: 1.0, ramps: 6, splits: 2, pads: 8, haz: 0.85,
    blurb: "Non-stop S-bends through tea terraces, a festival village and two river fords.",
    plan: [
      { t: "S", n: 70, d: 6, z: "terrace" }, { t: "E", dir: -1, k: 5, c: 4, n: 320, d: 40, z: "terrace" }, { t: "S", n: 90, d: 8, z: "village" },
      { t: "E", dir: 1, k: 3, c: 3.5, n: 200, d: 20, z: "village" }, { t: "T", dir: 1, c: 3, n: 140, d: 16, z: "terrace", f: "ford" },
      { t: "E", dir: -1, k: 4, c: 4.5, n: 260, d: 40, z: "terrace" }, { t: "H", dir: -1, d: 6, z: "jungle", f: "mtn" }, { t: "E", dir: 1, k: 4, c: 4, n: 260, d: 34, z: "jungle" },
      { t: "S", n: 90, d: 8, z: "village" }, { t: "E", dir: -1, k: 5, c: 4.5, n: 320, d: 44, z: "terrace" }, { t: "T", dir: -1, c: 3, n: 150, d: 20, z: "terrace", f: "ford" },
      { t: "S", n: 90, d: 8, z: "village" },
    ] },
  { id: "m2", biome: 3, name: "Waterfall Gauntlet", seed: 4402, len: 4000, curvy: 0.95, hilly: 1.2, ramps: 8, splits: 2, pads: 9, haz: 1.0,
    blurb: "Jungle gorge bridges, cliffside hairpins and two rides right behind the waterfalls. Misty morning.",
    look: { sky: ["#6f8d9c", "#b6cbc6", "#e9efdb"], fog: "#c3d3c7", sun: "#fbfbea", sunY: 0.16, sunX: 0.62 },
    plan: [
      { t: "S", n: 80, d: 8, z: "jungle" }, { t: "T", dir: 1, c: 3.5, n: 170, d: 36, z: "jungle", f: "waterR" }, { t: "S", n: 90, d: 4, z: "jungle", f: "bridge" },
      { t: "T", dir: -1, c: 4, n: 150, d: 34, z: "jungle", f: "mtn" }, { t: "SW", dir: 1, k: 2, d: 12, z: "jungle", f: "mtn" }, { t: "T", dir: -1, c: 3, n: 130, d: 20, f: "falls" },
      { t: "E", dir: 1, k: 3, c: 4.5, n: 210, d: 40, z: "jungle" }, { t: "S", n: 90, d: 4, z: "jungle", f: "bridge" }, { t: "X", n: 130, d: 50, z: "jungle" },
      { t: "H", dir: 1, d: 8, z: "jungle", f: "mtn" }, { t: "C", n: 130, d: 64, z: "jungle" }, { t: "T", dir: -1, c: 3, n: 150, d: 20, z: "village" },
      { t: "E", dir: 1, k: 3, c: 4, n: 210, d: 34, z: "terrace" }, { t: "T", dir: 1, c: 3, n: 140, d: 20, f: "falls" }, { t: "S", n: 100, d: 10, z: "village" },
    ] },
  { id: "v1", biome: 4, name: "Ashfall Chute", seed: 5501, len: 3800, curvy: 0.85, hilly: 1.1, ramps: 7, splits: 2, pads: 9, haz: 0.95,
    blurb: "Steep chutes beside lava rivers, big crest jumps and a glowing lava tube.",
    plan: [
      { t: "S", n: 70, d: 10, z: "ash" }, { t: "C", n: 180, d: 100, z: "ash" }, { t: "T", dir: -1, c: 3, n: 170, d: 40, z: "ash", f: "lavaR" },
      { t: "X", n: 130, d: 60, z: "ash" }, { t: "C", n: 160, d: 100, z: "obsidian" }, { t: "T", dir: 1, c: 4, n: 150, d: 44, f: "tunnel" },
      { t: "C", n: 150, d: 90, z: "ash", f: "lavaL" }, { t: "X", n: 130, d: 60, z: "obsidian" }, { t: "E", dir: -1, k: 3, c: 4, n: 200, d: 60, z: "obsidian" },
      { t: "C", n: 170, d: 100, z: "ash" }, { t: "T", dir: 1, c: 3, n: 150, d: 40, z: "ash", f: "lavaL" }, { t: "S", n: 100, d: 14, z: "ash" },
    ] },
  { id: "v2", biome: 4, name: "Geyser Gorge", seed: 5502, len: 4100, curvy: 1.0, hilly: 1.2, ramps: 8, splits: 2, pads: 10, haz: 1.05,
    blurb: "A narrow gorge, cliff switchbacks, an obsidian field and bridges over the lava lake. Violet night.",
    look: { sky: ["#0d0817", "#35173d", "#9c3636"], fog: "#3d1f33", sun: "#ffc08a", sunY: 0.36, sunX: 0.7 },
    plan: [
      { t: "S", n: 70, d: 8, z: "ash" }, { t: "E", dir: 1, k: 4, c: 4.5, n: 260, d: 44, f: "canyon" }, { t: "S", n: 90, d: 10, z: "ash", f: "bridge" },
      { t: "SW", dir: -1, k: 3, d: 12, z: "ash", f: "mtn" }, { t: "T", dir: 1, c: 4, n: 160, d: 30, f: "tunnel" }, { t: "S", n: 110, d: 14, z: "obsidian" },
      { t: "E", dir: -1, k: 3, c: 5, n: 220, d: 40, f: "canyon" }, { t: "H", dir: -1, d: 8, z: "ash", f: "mtn" }, { t: "X", n: 130, d: 50, z: "obsidian" },
      { t: "T", dir: 1, c: 3, n: 150, d: 24, z: "ash", f: "lavaR" }, { t: "S", n: 90, d: 8, z: "ash", f: "bridge" }, { t: "E", dir: 1, k: 4, c: 4.5, n: 260, d: 44, z: "ash" },
      { t: "SW", dir: 1, k: 2, d: 12, z: "obsidian", f: "mtn" }, { t: "S", n: 110, d: 10, z: "obsidian" },
    ] },
  { id: "t1", biome: 5, name: "Northern Lights", seed: 6601, len: 3900, curvy: 0.9, hilly: 1.0, ramps: 7, splits: 2, pads: 9, haz: 0.95,
    blurb: "Wide frozen plains, two crossings over a frozen lake and a lantern-lit igloo village.",
    plan: [
      { t: "S", n: 90, d: 6, z: "forest" }, { t: "T", dir: 1, c: 2.5, n: 220, d: 24, z: "plains" }, { t: "T", dir: -1, c: 2.5, n: 200, d: 24, z: "plains" },
      { t: "S", n: 140, d: 6, z: "lake", f: "lake" }, { t: "T", dir: 1, c: 3, n: 150, d: 16, z: "village" }, { t: "S", n: 90, d: 6, z: "village" },
      { t: "E", dir: -1, k: 4, c: 4, n: 260, d: 36, z: "forest" }, { t: "X", n: 130, d: 40, z: "plains" }, { t: "T", dir: -1, c: 3.5, n: 170, d: 30, z: "plains" },
      { t: "S", n: 140, d: 6, z: "lake", f: "lake" }, { t: "E", dir: 1, k: 3, c: 4, n: 210, d: 30, z: "forest" }, { t: "H", dir: 1, d: 6, z: "forest" },
      { t: "T", dir: -1, c: 3, n: 170, d: 20, z: "village" }, { t: "S", n: 110, d: 8, z: "village" },
    ] },
  { id: "t2", biome: 5, name: "Midnight Lake", seed: 6602, len: 4200, curvy: 1.0, hilly: 1.1, ramps: 8, splits: 2, pads: 10, haz: 1.1,
    blurb: "Along the lakeshore, through glowing crystal caves and down icy switchbacks.",
    look: { sky: ["#02060f", "#06182b", "#0f3846"], fog: "#0f2a3e" },
    plan: [
      { t: "S", n: 80, d: 6, z: "forest" }, { t: "T", dir: -1, c: 3, n: 200, d: 24, z: "forest", f: "waterL" }, { t: "T", dir: 1, c: 2.5, n: 180, d: 16, z: "village", f: "waterL" },
      { t: "T", dir: 1, c: 4, n: 160, d: 30, f: "cave" }, { t: "SW", dir: -1, k: 3, d: 12, z: "forest", f: "mtn" }, { t: "S", n: 100, d: 6, z: "lake", f: "bridge" },
      { t: "E", dir: 1, k: 3, c: 4.5, n: 210, d: 34, z: "forest" }, { t: "T", dir: -1, c: 3, n: 170, d: 20, z: "plains", f: "waterR" }, { t: "C", n: 140, d: 60, z: "forest" },
      { t: "T", dir: 1, c: 4, n: 160, d: 30, f: "cave" }, { t: "E", dir: -1, k: 4, c: 4, n: 260, d: 34, z: "forest" }, { t: "S", n: 120, d: 6, z: "lake", f: "lake" },
      { t: "H", dir: -1, d: 6, z: "forest" }, { t: "S", n: 110, d: 8, z: "village" },
    ] },
];

const PAYOUT = [600, 420, 300, 220, 170, 130, 100, 80];
const UPG_COST = [400, 900, 1700];        // per upgrade level
const UPGRADES = [
  { id: "eng", name: "Gearing", desc: "+3% top speed per level" },
  { id: "grip", name: "Tires", desc: "+6% grip & handling per level" },
  { id: "arm", name: "Armor", desc: "-8% damage taken per level" },
];
const STAR_RULE = "★ finish top 3 · ★★ finish top 2 · ★★★ win";
function starsForPlace(p) { return p === 1 ? 3 : p === 2 ? 2 : p === 3 ? 1 : 0; }

const TRICKS = [
  { id: "nohand", name: "No-Hander", dur: 0.55, pts: 150, pose: "nohand" },
  { id: "super", name: "Superman", dur: 0.7, pts: 220, pose: "super" },
  { id: "spin", name: "360 Spin", dur: 0.8, pts: 300, pose: "spin" },
  { id: "cancan", name: "Can-Can", dur: 0.5, pts: 130, pose: "cancan" },
];
