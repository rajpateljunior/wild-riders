# Wild Riders

Downhill bike & ATV racing for iPhone and iPad (landscape), in the spirit of PS2-era downhill racers.
Armored anime riders (Arcade or Savage style), punches and kicks, throwables, health that slows you down, boost pads, ramps, tricks,
six nature biomes, bots, two-player split screen, and online 2-player with room codes. Installable to the Home Screen and fully offline.

**Play:** https://rajpateljunior.github.io/wild-riders/ (open in Safari → Share → Add to Home Screen)

## How it's built
- One self-contained `index.html` — no frameworks, no image or audio files. All art is SVG drawn in code
  and rasterized to canvas; all sound is synthesized with WebAudio.
- Pseudo-3D (segment) road renderer in canvas 2D, fixed 60 Hz simulation, seeded track generation.
- PWA: `manifest.webmanifest`, `sw.js` (cache-first, cache name stamped from a content hash).

## Online 2-player
Direct phone-to-phone WebRTC via PeerJS (`peerjs.min.js`, v1.5.4, MIT). The free public PeerJS server only
introduces the two devices; race data flows directly between them. The host simulates bots; each player owns
their own rider's health (hits are sent to the victim's device). Some cellular networks block direct
connections — the fallback would be a relay (e.g. Firebase Realtime Database).
Test locally with `node tools/online.js <outdir>` against a local PeerServer on 127.0.0.1:9000.

## Editing
Source lives in `src/`. After editing, rebuild:

```
python3 tools/build.py
```

That writes `index.html` and stamps a new cache name into `sw.js` (so installed copies update).
Commit `src/`, `index.html` and `sw.js` together.

| File | What's in it |
|---|---|
| `src/data.js` | Riders, vehicles, items, biomes, tracks, prices |
| `src/art.js` | Rider sprites (back view), anime portraits, side-view vehicles |
| `src/art_world.js` | Scenery, track objects, backgrounds, projectiles |
| `src/track.js` | Track generation (layout, forks, ramps, pads, hazards, scenery) |
| `src/render.js` | Pseudo-3D renderer, weather, lighting, HUD |
| `src/game.js` | Physics, combat, items, health, tricks, AI |
| `src/input.js` | Touch + keyboard controls, on-screen buttons |
| `src/audio.js` | Synth SFX, engines, procedural music |
| `src/ui.js` | Menus, progression, saving + save migrations, results |
| `src/spin.js` | Daily Spin wheel, race perks, startup popups |
| `src/main.js` | Boot, main loop, PWA glue |

## Tests (Playwright, Chromium)
- `node tools/bot.js 0.85 mtb kaito` — an AI drives every track; checks all are finishable.
- `node tools/shots.js <outdir> 844 390 f1,d1 [split]` — gameplay screenshots.
- `node tools/menus.js <outdir> 844 390` — menu screenshots.
- `node tools/touch.js` — multi-touch steering/boost/punch check.
- `node tools/throttle.js` — auto-accelerate: the bike goes with no thumb down, the stick only steers left/right, releasing keeps it going.
- `node tools/offline.js` — service worker + offline race.
- `node tools/online.js <outdir>` — two browsers race each other online (needs a local PeerServer).
- `node tools/migrate_test.js` — old saves → new rider order: only riders reset, exact refund, nothing else changes.
- `node tools/spin_test.js` — Daily Spin: one per day, prize saved, clock-rollback guard, streaks, odds, perks.
- `node tools/icons.js` — re-render the app icons from the emblem.

(Serve the folder first: `python3 -m http.server 8765`.)
