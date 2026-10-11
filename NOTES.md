# Wild Riders: NOTES

Last reviewed: 2026-10-11 (updated after the vehicle-screen shift fix and camera raise). Build and test commands are in `README.md`; this file covers decisions, data and risks.

## What it is
A Downhill Domination–style bike and ATV racer for iPhone, iPad and desktop. Anime riders, punches and kicks, throwables, health that slows you down, boost pads, ramps, tricks, six biomes (12 tracks), bots, two-player split screen, and online 2-player with room codes.
Live: https://rajpateljunior.github.io/wild-riders/ · Repo: `rajpateljunior/wild-riders`

## Design decisions (Raj's)
- Landscape, fullscreen PWA (`manifest.webmanifest`: `display: fullscreen`, `orientation: landscape`).
- Pseudo-3D segment road renderer on canvas 2D, fixed 60 Hz simulation, seeded track generation.
- Combat with health: damage slows you down. Each biome has its own throwable.
- Stars per track: top 3 = ★, top 2 = ★★, win = ★★★. Biomes unlock by total stars.
- Online play: direct phone-to-phone WebRTC via PeerJS with room codes. Host simulates bots; each player owns their own health.
- No image or audio files: art is SVG drawn in code, sound is WebAudio.

## Architecture
- **Source of truth is `src/`.** `index.html` and `sw.js` are build outputs. After editing, run `python3 tools/build.py`, then commit `src/`, `index.html` and `sw.js` together. Never hand-edit `index.html`.
- `tools/build.py` inlines `src/style.css` and the JS files (order: core, data, art, art_world, audio, track, render, game, input, net, ui, main) into `src/shell.html`, and stamps `sw.js` with a cache name `wild-riders-<hash of assets>`. So the cache name bumps automatically on any asset change.
- Module map is in `README.md`.
- Vendored libs and assets: `peerjs.min.js` (v1.5.4), `fonts/` (Bangers, Chakra Petch), `icons/`.
- Service worker is cache-first with background refresh and ignores cross-origin requests.

## Data tables (`src/data.js`)
- `RIDERS`: kaito and priya (free), bruno 1200, yuki 1500, zara 1800, rex 2200 coins.
- `VEHICLES`: mtb and bmx (free), dirt bike 2000, ATV 2600.
- `ITEMS`: 12 throwables (pinecone, pear, snowball, coconut, magma, iceshard, shuriken, chili, boulder, snowburst, sandbomb, paint).
- `BIOMES` (stars to unlock): Redwood Run 0, Saffron Dunes 3, Glacier Peak 7, Monsoon Ghats 11, Ember Caldera 15, Aurora Tundra 19.
- `TRACKS`: 12 tracks, two per biome (`f1 f2 d1 d2 g1 g2 m1 m2 v1 v2 t1 t2`), seeded, with length, curviness, hills, ramps, forks, pads, hazards.
- `PAYOUT` (coins by place): 600, 420, 300, 220, 170, 130, 100, 80. `UPG_COST` per level: 400, 900, 1700. `UPGRADES`: gearing, tires, armor. `TRICKS`: 4.

## Save format
- `localStorage` key `wild-riders-save-v1`, object with `v: 1`: `{ v, coins, stars:{trackId:n}, best:{trackId:…}, riders:[ids], vehs:[ids], upg:{…}, last:{…}, settings:{music,sfx,diff,gfx}, seenHelp, races }`. Starts with 500 coins, riders kaito and priya, vehicles mtb and bmx.
- `loadSave()` merges onto `defaultSave()` but **only accepts `v === 1`**. Any save-format change must keep reading v1 saves, and if the version is bumped the loader must migrate rather than fall back to defaults (which would wipe progress).
- Copy-and-paste save code: prefix `WILDR1-` followed by base64 of the JSON (`encodeSave` / `decodeSave`, also require `v === 1`).
- Install hint dismissal: `localStorage` key `wr-install-dismissed`.

## Camera
`RENDER.CAM_LIFT` in `src/render.js` raises the camera (0 = original low view; now 0.6, Raj asked for "slightly higher, not bird's-eye"; was 0.3). The horizon moves up with it so the rider stays put on screen. Do not go much past ~0.8 without checking the sky strip and HUD.

## UI gotcha
Never use `scrollIntoView` inside a screen: on iOS/Chromium it also scrolls the `overflow:hidden` `.screen` sideways, which shifted the whole Choose Your Ride screen right (Dirt Bike selected). `scrollSel()` in `src/ui.js` scrolls only the card strip and resets the screen's scroll.

## Tests (Playwright, Chromium)
Listed in `README.md`: bot drives all tracks, screenshots, menus, touch, offline, online. Serve the folder first (`python3 -m http.server 8765`). Re-run this session: offline reload passes; a custom check confirmed the vehicle screen no longer shifts (852x393 and 1180x820) and that the old build did shift by 104px.

## Known issues / untested
- Not verified on a real iPhone or iPad by this session: touch feel, iOS audio, Home Screen fullscreen behavior. The latest commit fixed a landscape cut-off in the iOS Home Screen app; I did not re-test it.
- Online play: some cellular networks block direct WebRTC connections. The README names a relay (e.g. Firebase Realtime Database) as the fallback, not built. Depends on the free public PeerJS server staying available.
- Online play was tested only by `tools/online.js` against a local PeerServer, not over the real internet from this session.

## Ideas not yet done
- Relay fallback for online play (see above).
- Add Raj's wishlist here.
