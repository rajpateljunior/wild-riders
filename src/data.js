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

const VEHICLES = [
  { id: "mtb", name: "Downhill MTB", short: "MTB", blurb: "Nimble full-suspension bike. Great at tricks and tight lines.",
    max: 1.0, acc: 1.0, grip: 1.1, armor: 0.0, trick: 1.15, mass: 1.0, w: 520, h: 860, cost: 0 },
  { id: "bmx", name: "BMX", short: "BMX", blurb: "Tiny and twitchy. Biggest trick boost, lowest top speed.",
    max: 0.95, acc: 1.15, grip: 1.2, armor: -0.1, trick: 1.45, mass: 0.8, w: 460, h: 780, cost: 0 },
  { id: "dirt", name: "Dirt Bike", short: "DIRT", blurb: "Raw engine power. The fastest machine on the mountain.",
    max: 1.08, acc: 1.1, grip: 0.95, armor: 0.1, trick: 0.9, mass: 1.3, w: 600, h: 880, cost: 2000 },
  { id: "atv", name: "ATV Quad", short: "ATV", blurb: "Four-wheeled tank. Shrugs off hits and shoves riders aside.",
    max: 1.03, acc: 0.9, grip: 0.86, armor: 0.3, trick: 0.6, mass: 1.8, w: 900, h: 820, cost: 2600 },
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
    weather: "shafts", music: 0,
    hazard: "Fallen logs and root gardens. Hit the side lines for shortcuts." },
  { id: "desert", name: "Saffron Dunes", sub: "Red-rock desert", item: "pear", unlock: 3,
    sky: ["#2f8fd8", "#8fd0f0", "#ffe2a8"], fog: "#f3cf9a", sun: "#fffbe0", sunY: 0.12, sunX: 0.3,
    road: ["#e0a865", "#d39b58"], rut: "#b9814a", edge: ["#a8562f", "#f6e2b8"], ground: ["#e9b46e", "#dfa962"],
    weather: "sand", music: 1,
    hazard: "Soft sand drags you down. Sandstorms roll in without warning." },
  { id: "glacier", name: "Glacier Peak", sub: "High alpine snow", item: "snowball", unlock: 7,
    sky: ["#3d74c9", "#a8cdf2", "#eef6ff"], fog: "#e3eefb", sun: "#ffffff", sunY: 0.1, sunX: 0.62,
    road: ["#e8f0fa", "#dbe6f4"], rut: "#b9c9df", edge: ["#7aa3cf", "#ffffff"], ground: ["#f4f8ff", "#e9f1fc"],
    weather: "snow", music: 2,
    hazard: "Blue ice slides. On Avalanche! the mountain itself chases you." },
  { id: "ghats", name: "Monsoon Ghats", sub: "Rainforest & tea terraces", item: "coconut", unlock: 11,
    sky: ["#5f7f8c", "#9fb9b4", "#d8e4cf"], fog: "#a9c2b2", sun: "#f3f7e6", sunY: 0.2, sunX: 0.5,
    road: ["#a0522d", "#93491f"], rut: "#6f3518", edge: ["#5b2d15", "#e9dcb8"], ground: ["#2f8a3e", "#2a7e37"],
    weather: "rain", music: 3,
    hazard: "Mud pits and river crossings. Monsoon rain never stops." },
  { id: "volcano", name: "Ember Caldera", sub: "Active volcano", item: "magma", unlock: 15,
    sky: ["#1a0f1f", "#6b2130", "#ff7a3d"], fog: "#5b2a2a", sun: "#ffb36b", sunY: 0.32, sunX: 0.5,
    road: ["#3d3434", "#332b2b"], rut: "#241e1e", edge: ["#ff5a1f", "#1b1515"], ground: ["#2a2222", "#231c1c"],
    weather: "ash", music: 4,
    hazard: "Lava cracks burn. Steam geysers launch you sky-high." },
  { id: "tundra", name: "Aurora Tundra", sub: "Arctic night", item: "iceshard", unlock: 19,
    sky: ["#050817", "#0d1b3d", "#1d3a5c"], fog: "#14284a", sun: "#e8f1ff", sunY: 0.16, sunX: 0.24,
    road: ["#c9d7ea", "#bccbe0"], rut: "#9fb0c9", edge: ["#4a6a96", "#e9f3ff"], ground: ["#8ea5c4", "#859cbb"],
    weather: "aurora", music: 5, dark: 1,
    hazard: "Pitch-black stretches lit only by your headlamp. Frozen lakes slide." },
];

/* Tracks: 2 per biome. Section scripts are expanded by track.js. */
const TRACKS = [
  { id: "f1", biome: 0, name: "Fernline Descent", seed: 1101, len: 3300, curvy: 0.7, hilly: 0.8, ramps: 5, splits: 2, pads: 7, haz: 0.6 },
  { id: "f2", biome: 0, name: "Giant's Staircase", seed: 1102, len: 3700, curvy: 0.85, hilly: 1.2, ramps: 8, splits: 3, pads: 8, haz: 0.85 },
  { id: "d1", biome: 1, name: "Mesa Drop", seed: 2201, len: 3500, curvy: 0.6, hilly: 1.0, ramps: 6, splits: 2, pads: 8, haz: 0.7 },
  { id: "d2", biome: 1, name: "Sandstorm Alley", seed: 2202, len: 3800, curvy: 0.9, hilly: 0.9, ramps: 6, splits: 3, pads: 9, haz: 0.9, storm: 1 },
  { id: "g1", biome: 2, name: "Frostbite Run", seed: 3301, len: 3600, curvy: 0.8, hilly: 1.1, ramps: 7, splits: 2, pads: 8, haz: 0.8 },
  { id: "g2", biome: 2, name: "Avalanche!", seed: 3302, len: 3900, curvy: 0.75, hilly: 1.4, ramps: 8, splits: 2, pads: 10, haz: 0.9, avalanche: 1 },
  { id: "m1", biome: 3, name: "Tea Terrace Twist", seed: 4401, len: 3700, curvy: 1.0, hilly: 1.0, ramps: 6, splits: 3, pads: 8, haz: 0.85 },
  { id: "m2", biome: 3, name: "Waterfall Gauntlet", seed: 4402, len: 4000, curvy: 0.95, hilly: 1.3, ramps: 8, splits: 3, pads: 9, haz: 1.0 },
  { id: "v1", biome: 4, name: "Ashfall Chute", seed: 5501, len: 3800, curvy: 0.85, hilly: 1.2, ramps: 7, splits: 2, pads: 9, haz: 0.95 },
  { id: "v2", biome: 4, name: "Geyser Gorge", seed: 5502, len: 4100, curvy: 1.0, hilly: 1.4, ramps: 9, splits: 3, pads: 10, haz: 1.05 },
  { id: "t1", biome: 5, name: "Northern Lights", seed: 6601, len: 3900, curvy: 0.9, hilly: 1.1, ramps: 7, splits: 2, pads: 9, haz: 0.95 },
  { id: "t2", biome: 5, name: "Midnight Lake", seed: 6602, len: 4200, curvy: 1.05, hilly: 1.2, ramps: 8, splits: 3, pads: 10, haz: 1.1 },
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
