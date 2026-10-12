# Wild Riders: NOTES

Last reviewed: 2026-10-12 (corner event feed, Arcade/Savage style, tougher rider gear, emblem logo + icons, new rider order with save migration + refund, Daily Spin).

## What it is
A Downhill Domination–style bike and ATV racer for iPhone, iPad and desktop. Anime riders, punches and kicks, throwables, health that slows you down, boost pads, ramps, tricks, six biomes (12 tracks), bots, two-player split screen, and online 2-player with room codes.
Live: https://rajpateljunior.github.io/wild-riders/ · Repo: `rajpateljunior/wild-riders`

## Design decisions (Raj's)
- Landscape, fullscreen PWA (`manifest.webmanifest`: `display: fullscreen`, `orientation: landscape`).
- Pseudo-3D segment road renderer on canvas 2D, fixed 60 Hz simulation, seeded track generation.
- Combat with health: damage slows you down. Each biome has its own throwable.
- Stars per track: top 3 = ★, top 2 = ★★, win = ★★★. Biomes unlock by total stars.
- Controls (Raj reverted the push-up-to-go stick): the bike ALWAYS accelerates by itself. The left stick is a left/right slider only (the knob slides sideways; up/down does nothing). DRIFT button kept. Keyboard: A/D or ←/→ steer, E/J drift, S/↓ still brakes on desktop; there is no gas key. `throttle` is always 1 from `readPlayer` in `src/input.js`; `game.js` still treats it as a 0..1 knob.
- Riders and rides unlock strictly in order (only the first one you don't own can be bought). Already-owned out-of-order items are kept.
- ATV was far too big (its sprite was scaled by its hit width). Every vehicle now draws the rider at the same size (`sw` in VEHICLES); ATV redesigned.
- Road look (Raj's request): the drivable road is ONE flat colour (`biome.road[0]`, bridge planks `plank[0]`, ice patches one tone). Lines/stripes are fine only off the road (curbs, ground, water). The tire-rut diagonal streaks stay (he likes them).
- No flashing/pulsing light on riders (Raj's request): the Redwood "light shafts" beams were removed, the red low-health edge glow is steady (no pulse), and the grey low-health smoke circles above riders were removed (burning flames from magma/chili stay). Boost flame, hit flicker and dark-biome headlamp/rider glows are unchanged.
- Camera tilts down with the slope ahead (`RENDER.PITCH_DOWN`) and the view is zoomed out ~14% (`RENDER.ZOOM` 0.86).
- Every trail is hand-designed (`plan` in TRACKS) with its own bends, hairpins, switchbacks, tunnels, bridges, cliffs, rivers and scenery zones; the 2nd trail of each biome has its own sky (`look`).
- Secret cutie mode (Raj's request): hold the 2 PLAYERS · ONE SCREEN button for 2 s (tiny pink dot = on; hold again = off). In split screen Player 2 always wins; online, the OTHER phone's rider always wins (works whether Raj hosts or joins; her phone shows nothing). Raj can still place 2nd/3rd. Must not look like a glitch.
- Online play: direct phone-to-phone WebRTC via PeerJS with room codes. Host simulates bots; each player owns their own health.
- No image or audio files: art is SVG drawn in code, sound is WebAudio.
- On-screen text (Raj: it blocked the view): trick/hit/pickup messages are a small fading feed in the TOP-RIGHT corner under the timer (`drawHUD`, "event feed"); damage shows as a red "-N" next to the HP bar; hits flash red on the screen EDGES only; "STAY ON THE TRAIL!" sits under the progress bar. Only the countdown, GO! and the finish place still use the middle (Raj approved). Never draw gameplay text over the centre.
- Two styles, switched in Settings → Style (`save.settings.tone`, `TONE` / `SAVAGE()` in `core.js`): **ARCADE** (default, bright, anime-cool, kid friendly) and **SAVAGE** (Raj asked for grittier with "a little blood and gore"): darker colour grade (`drawSavageGrade`), red visors, scratched/cracked/bloodied gear, blood droplets on hits (`bloodBurst` in `game.js`) and blood splats on the screen edges (`drawBloodSplats`). Kept cartoon-level on purpose: no dismemberment or realistic gore. Style is per device and never changes the rules, so online players can differ. Art caches are keyed by tone.
- Riders look tougher (Raj): full-face helmets with dark visors and glowing eyes, cheek guards, shoulder armor and kidney belt (`GEAR`, `backHead`, `armorBack`, `portraitGear` in `art.js`). Signature looks: Kaito centre fin + #7, Bruno riveted brow guard, Yuki armored bunny ears + ninja mask + scarf, Zara gold crest + coin band + scarf, Priya flame fins + braid, Rex steel spikes + chain.
- Home screen shows the emblem (claw-slashed spiked wheel in a shield, crossed bolts, `emblemSVG()` in `art.js`) instead of rider portraits; the wordmark has three claw slashes; the attract-mode race plays behind. App icons are rendered from the same emblem (`node tools/icons.js`).
- Rider unlock order (Raj): Kaito, Bruno (free) → Yuki 1200 → Zara 1500 → Priya 1800 → Rex 2200. Bruno is the free 2nd starter (split screen needs two riders).
- Daily Spin (Raj chose a wheel): offered automatically the first time the game is opened each day (device midnight), plus a DAILY SPIN button top-left with a countdown. 8 slices: 100 / 250 / 500 / 1500 jackpot coins, or a one-race perk: START BOOST (full meter), SHIELD (blocks first hit), POWER THROWS (3 items, +40% throw damage), DOUBLE COINS. Weights in `WHEEL` (`src/spin.js`): jackpot 2%. 7 days in a row → day 7 is a guaranteed 500 or 1500. Perk waits in `save.perk`, shows as a chip on the home screen and in the race HUD, applies to Player 1's next race and is used up.

## Architecture
- **Source of truth is `src/`.** `index.html` and `sw.js` are build outputs. After editing, run `python3 tools/build.py`, then commit `src/`, `index.html` and `sw.js` together. Never hand-edit `index.html`.
- `tools/build.py` inlines `src/style.css` and the JS files (order: core, data, art, art_world, audio, track, render, game, input, net, ui, spin, main) into `src/shell.html`, and stamps `sw.js` with a cache name `wild-riders-<hash of assets>`. So the cache name bumps automatically on any asset change.
- Module map is in `README.md`.
- Vendored libs and assets: `peerjs.min.js` (v1.5.4), `fonts/` (Bangers, Chakra Petch), `icons/`.
- Service worker is cache-first with background refresh and ignores cross-origin requests.

## Cutie mode (how it works — keep it subtle)
- Flag lives in `localStorage` key `wr-cz` (not in the save, so it never travels in a save code). `cutieOn()` / `setCutie()` / `wireCutieSwitch()` in `src/ui.js`.
- Race config `cfg.fav` = index in `cfg.humans` of the favoured player (split: 1; online: set by the host from its own switch or the guest's `hello.cz`). Each device only adjusts riders it simulates (`cutieStep` in `src/game.js`):
  - her: catch-up top-speed bonus when behind (`assist`, up to ~16% late), softer knocks (damage ×0.55, crashes slow her less), luckier crates; bots mostly leave her alone.
  - everyone else: bots rubber-band to her; a soft top-speed squeeze (≤14%) when the lead is big for the distance left; in the last 30% a stronger pace-match; nobody may cross the line before her (held 160 units short). Per-race random winning margin (`czM`, ~0.3–1 s). Late in the race bots pick on the other human a bit more.
  - places: once she has finished she is always ranked 1st (covers online clock skew).
- Simulated (24 split races, weak and decent partner; 2 full online races both ways): she won every one; Raj usually 2nd. If she stops completely, everyone else waits just short of the line (accepted by Raj: "she should still win regardless").

## Data tables (`src/data.js`)
- `RIDERS` (array order = unlock order): kaito, bruno (free), yuki 1200, zara 1500, priya 1800, rex 2200. `OLD_RIDER_COST` keeps the pre-2026-10-12 prices (kaito/priya 0, bruno 1200, yuki 1500, zara 1800, rex 2200), used only for the refund.
- `WHEEL` / `PERK_NAMES` in `src/spin.js`: Daily Spin slices and weights.
- `VEHICLES` (unlock order): mtb, bmx (free), Enduro E-Bike 1500 (boost regen), dirt bike 2000, ATV 2600, Sport Quad 3400. Fields: `w` hit width, `sw` drawn width, `shove`, `regen`.
- `ITEMS`: 12 throwables (pinecone, pear, snowball, coconut, magma, iceshard, shuriken, chili, boulder, snowburst, sandbomb, paint).
- `BIOMES` (stars to unlock): Redwood Run 0, Saffron Dunes 3, Glacier Peak 7, Monsoon Ghats 11, Ember Caldera 15, Aurora Tundra 19.
- `TRACKS`: 12 tracks, two per biome (`f1 f2 d1 d2 g1 g2 m1 m2 v1 v2 t1 t2`). Each has a `plan` of beats (S straight, T turn, E esses, H hairpin, SW switchbacks, C chute, X crest, ST staircase) with zone `z` and feature `f` (tunnel, falls, cave, bridge, canyon, mtn, cliffL/R, waterL/R, lavaL/R, lake, ford). `track.js` scales beats to `len`; ramps, pads, forks, hazards are still seeded on top. Beat key reference is in the comment above TRACKS.
- `BIOMES` also carry `rock`, `chasm`, `water`, `bridgeOver`, `plank` colours; `BIOME_SCENERY[biome].zones` are the scenery sets; `biomeKit()` in `art_world.js` draws walls, tunnel ribs/mouths, rails, hairpin chevrons per biome.
- `PAYOUT` (coins by place): 600, 420, 300, 220, 170, 130, 100, 80. `UPG_COST` per level: 400, 900, 1700. `UPGRADES`: gearing, tires, armor. `TRICKS`: 4.

## Save format
- `localStorage` key `wild-riders-save-v1`, object with `v: 1`: `{ v, tl, rl, coins, stars:{trackId:n}, best:{trackId:…}, riders:[ids], vehs:[ids], upg:{…}, last:{…}, settings:{music,sfx,diff,gfx,tone}, seenHelp, races, spin:{last,streak,seen}, perk, note }`. Starts with 500 coins, riders kaito and bruno, vehicles mtb and bmx. `spin`, `perk`, `note`, `tone` are optional; older saves without them load fine.
- `loadSave()` merges onto `defaultSave()` but **only accepts `v === 1`**. Any save-format change must keep reading v1 saves, and if the version is bumped the loader must migrate rather than fall back to defaults (which would wipe progress).
- `tl` = trail-layout generation (2 since the redesign). `migrateSave()` clears `best` times once when `tl` < 2; everything else is kept. Old save codes still load.
- `rl` = rider-lineup generation (2 since 2026-10-12). Raj's rule: the rider order changes for EVERYONE, only riders reset, all other progress stays. `migrateRiders()` runs once when `rl` < 2: copies the untouched save to `localStorage` key `wild-riders-save-v1-backup-rl1` (only if that key is empty), sets `riders` to kaito+bruno, refunds every coin paid for riders at the OLD price, fixes `last.rider/rider2` if they're no longer owned, sets `rl: 2`, and queues `note` → the one-time "RIDER LINEUP UPDATED" popup. Nothing else is touched. `boot()` saves straight after loading so it can't run twice. Old `WILDR1-` codes go through the same migration when loaded; `encodeSave` strips `note`. Tested by `tools/migrate_test.js` (fresh, veteran with all riders, mid-way, older-layout saves, save codes, re-run). To undo for a player: copy the backup key back over the save key (riders, coins).
- Daily Spin clock guard: `spin.seen` remembers the latest time seen, so moving the phone clock BACK never gives another spin. Moving it FORWARD can't be prevented offline (accepted).
- Copy-and-paste save code: prefix `WILDR1-` followed by base64 of the JSON (`encodeSave` / `decodeSave`, also require `v === 1`).
- Install hint dismissal: `localStorage` key `wr-install-dismissed`.

## Camera
`RENDER.CAM_LIFT` in `src/render.js` raises the camera (0 = original low view; now 0.6, Raj asked for "slightly higher, not bird's-eye"; was 0.3). The horizon moves up with it so the rider stays put on screen. Do not go much past ~0.8 without checking the sky strip and HUD.
`RENDER.ZOOM` (0.86) widens the view; the horizon is offset so the rider stays at the same screen spot. Pitch: `camFollow` computes `e.pitch` from the slope 10–26 segments ahead; `renderView` shears world heights by `pitch × distance`, so downhill road fills the view and the backdrop rises. `PITCH_DOWN` 0.82 / `PITCH_UP` 0.45.

## Road renderer gotcha (seam lines)
Road slices are drawn near to far as separate shapes, and canvas anti-aliasing leaks whatever is painted underneath through the shared edges (it showed as thin ground-, curb- or fog-coloured lines across the road). In `drawSegment` / the fog fill in `renderView`: every slice is stretched 1px UP (the next slice repaints it), the ground band is shifted 1px up and never overshoots toward the camera, the curb is drawn as two side strips (never under the road), and the fog band extends 1px up. Do not add full-width fills that overshoot downward or put colour underneath the road quad.

## UI gotcha
Never use `scrollIntoView` inside a screen: on iOS/Chromium it also scrolls the `overflow:hidden` `.screen` sideways, which shifted the whole Choose Your Ride screen right (Dirt Bike selected). `scrollSel()` in `src/ui.js` scrolls only the card strip and resets the screen's scroll.

## Tests (Playwright, Chromium)
Listed in `README.md`: bot drives all tracks, screenshots, menus, touch, auto-accelerate check (`tools/throttle.js`), offline, online, save migration (`tools/migrate_test.js`), Daily Spin (`tools/spin_test.js`). Tests that load the game call `tools/nospin.js` first so today's spin popup doesn't cover the screen. Online test needs a local PeerServer on 127.0.0.1:9000 (npm `peer`, `PeerServer({port:9000, host:'127.0.0.1'})`). Serve the folder first (`python3 -m http.server 8765`). 2026-10-12 session: QA tap-through at 844x390 and 1180x820, all 12 trails finishable, throttle, touch, offline, online (local PeerServer), migration and spin tests all pass; screenshots checked in both styles and split screen. Previous session: all 12 trails finishable by the bot; auto-accelerate test passes; offline passes; screenshots at 844x390, 1180x820 and split screen show no seam lines. Online play and cutie mode were not re-run after this change (they do not touch the changed code).

## Known issues / untested
- 2026-10-12 changes not seen on a real iPhone yet: new Home Screen icon, wheel spin animation smoothness, Savage colour grade cost on older phones, corner-feed readability at arm's length. The rider migration was tested only on simulated saves, not Raj's real phone data (the backup key exists if anything looks wrong).
- Auto-accelerate stick (left/right slider) and hairpin difficulty not tried on a real iPhone yet. With the bike always at full speed, hairpins may feel harder: tuning knobs are hairpin strength `PIN` in `track.js` and `handling` in `src/data.js`. Not checked: whether Raj meant exactly these effects by "the flashing light" (see Design decisions); each is one small edit to restore.
- Not verified on a real iPhone or iPad by this session: touch feel, iOS audio, Home Screen fullscreen behavior. The latest commit fixed a landscape cut-off in the iOS Home Screen app; I did not re-test it.
- Online play: some cellular networks block direct WebRTC connections. The README names a relay (e.g. Firebase Realtime Database) as the fallback, not built. Depends on the free public PeerJS server staying available.
- Online play was tested only by `tools/online.js` against a local PeerServer, not over the real internet from this session.

## Ideas not yet done
- Relay fallback for online play (see above).
- Add Raj's wishlist here.
- Canyon walls on short hairpins only last ~1 s; could extend walls a little before/after.
