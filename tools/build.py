#!/usr/bin/env python3
"""Build Wild Riders: inline src/*.css + src/*.js into index.html and stamp sw.js.

Usage:  python3 tools/build.py
Edit files in src/, then run this. Commit both src/ and the built index.html + sw.js.
"""
import hashlib, pathlib, re

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / "src"

JS_ORDER = ["core.js", "data.js", "art.js", "art_world.js", "audio.js",
            "track.js", "render.js", "game.js", "input.js", "net.js", "ui.js", "spin.js", "main.js"]

def main():
    shell = (SRC / "shell.html").read_text()
    css = (SRC / "style.css").read_text()
    js = "\n".join(f"// ===== {n} =====\n" + (SRC / n).read_text() for n in JS_ORDER)
    html = shell.replace("/*@CSS*/", css).replace("/*@JS*/", js)
    (ROOT / "index.html").write_text(html)

    assets = ["index.html", "manifest.webmanifest", "peerjs.min.js",
              "fonts/bangers.woff2", "fonts/chakra-500.woff2", "fonts/chakra-700.woff2",
              "icons/icon-180.png", "icons/icon-192.png", "icons/icon-512.png",
              "icons/icon-maskable-512.png", "icons/favicon-64.png"]
    h = hashlib.sha256()
    for a in assets:
        p = ROOT / a
        if p.exists():
            h.update(p.read_bytes())
    cache = "wild-riders-" + h.hexdigest()[:10]
    sw = (SRC / "sw.template.js").read_text()
    sw = sw.replace("__CACHE__", cache).replace("__ASSETS__", ",\n  ".join(
        repr("./" if a == "index.html" else "./" + a) for a in assets))
    (ROOT / "sw.js").write_text(sw)
    print(f"built index.html ({len(html)//1024} KB), sw cache {cache}")

if __name__ == "__main__":
    main()
