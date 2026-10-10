# Wild Riders

Downhill bike & ATV racing for iPhone and iPad (landscape), in the spirit of PS2-era downhill racers.
Anime riders, punches and kicks, throwables, health that slows you down, boost pads, ramps, tricks,
six nature biomes, bots, and two-player split screen. Installable to the Home Screen and fully offline.

**Play:** https://rajpateljunior.github.io/wild-riders/ (open in Safari → Share → Add to Home Screen)

## How it's built
- One self-contained `index.html` — no frameworks, no image or audio files. All art is SVG drawn in code
  and rasterized to canvas; all sound is synthesized with WebAudio.
- Pseudo-3D (segment) road renderer in canvas 2D, fixed 60 Hz simulation, seeded track generation.
- PWA: `manifest.webmanifest`, `sw.js` (cache-first, cache name stamped from a content hash).

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
| `src/ui.js` | Menus, progression, saving, results |
| `src/main.js` | Boot, main loop, PWA glue |

## Tests (Playwright, Chromium)
- `node tools/bot.js 0.85 mtb kaito` — an AI drives every track; checks all are finishable.
- `node tools/shots.js <outdir> 844 390 f1,d1 [split]` — gameplay screenshots.
- `node tools/menus.js <outdir> 844 390` — menu screenshots.
- `node tools/touch.js` — multi-touch steering/boost/punch check.
- `node tools/offline.js` — service worker + offline race.

(Serve the folder first: `python3 -m http.server 8765`.)
