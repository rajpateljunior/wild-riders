/* World art: scenery sprites per biome, track objects, projectiles and parallax backgrounds. */

const W = {}; // generators: id -> {w,h,svg(), ww (world width), solid, glow}

function conifer(w, h, col, snow, trunk = "#5a3a22", layers = 5) {
  let s = SV.rect(w / 2 - w * 0.06, h * 0.78, w * 0.12, h * 0.22, 3, trunk, 3);
  for (let i = 0; i < layers; i++) {
    const t = i / layers;
    const y0 = h * (0.04 + t * 0.66), y1 = y0 + h * 0.3;
    const hw = w * (0.18 + t * 0.32);
    s += SV.path(`M${w / 2} ${y0} L${w / 2 + hw} ${y1} Q${w / 2} ${y1 - h * 0.05} ${w / 2 - hw} ${y1}Z`, shade(col, -t * 0.15), 3);
    if (snow) s += `<path d="M${w / 2} ${y0 + 3} L${w / 2 + hw * 0.55} ${y0 + h * 0.15} Q${w / 2} ${y0 + h * 0.11} ${w / 2 - hw * 0.55} ${y0 + h * 0.15}Z" fill="${snow}"/>`;
  }
  return s;
}
function rock(w, h, col, top) {
  let s = SV.path(`M${w * 0.06} ${h * 0.96} L${w * 0.12} ${h * 0.45} L${w * 0.34} ${h * 0.12} L${w * 0.66} ${h * 0.08} L${w * 0.9} ${h * 0.38} L${w * 0.96} ${h * 0.96}Z`, col, 3);
  s += `<path d="M${w * 0.34} ${h * 0.12} L${w * 0.44} ${h * 0.6} L${w * 0.12} ${h * 0.45} M${w * 0.44} ${h * 0.6} L${w * 0.9} ${h * 0.38} M${w * 0.44} ${h * 0.6} L${w * 0.5} ${h * 0.96}" stroke="${shade(col, -0.3)}" stroke-width="2.5" fill="none"/>`;
  s += `<path d="M${w * 0.44} ${h * 0.6} L${w * 0.9} ${h * 0.38} L${w * 0.96} ${h * 0.96} L${w * 0.5} ${h * 0.96}Z" fill="${shade(col, -0.2)}" opacity=".6"/>`;
  if (top) s += `<path d="M${w * 0.14} ${h * 0.42} L${w * 0.34} ${h * 0.14} L${w * 0.66} ${h * 0.1} L${w * 0.88} ${h * 0.36} Q${w * 0.5} ${h * 0.3} ${w * 0.14} ${h * 0.42}Z" fill="${top}"/>`;
  return s;
}
const def = (id, w, h, ww, svg, o = {}) => { W[id] = Object.assign({ id, w, h, ww, svg }, o); };

/* ---- forest ---- */
def("redwood", 220, 560, 2000, () => {
  const w = 220, h = 560;
  let s = SV.path(`M${w * 0.4} ${h} L${w * 0.43} ${h * 0.2} L${w * 0.57} ${h * 0.2} L${w * 0.62} ${h}Z`, "#8a3f24", 3);
  for (let i = 0; i < 6; i++) s += `<path d="M${w * (0.45 + i * 0.025)} ${h * 0.25} L${w * (0.44 + i * 0.03)} ${h}" stroke="#5e2a17" stroke-width="2.5"/>`;
  const blob = (x, y, r, c) => SV.path(`M${x - r} ${y} Q${x - r} ${y - r * 0.9} ${x} ${y - r} Q${x + r} ${y - r * 0.9} ${x + r} ${y} Q${x + r * 0.6} ${y + r * 0.5} ${x} ${y + r * 0.4} Q${x - r * 0.6} ${y + r * 0.5} ${x - r} ${y}Z`, c, 3);
  s += blob(w * 0.5, h * 0.12, 60, "#2f6b2c") + blob(w * 0.3, h * 0.26, 52, "#2a6127") + blob(w * 0.72, h * 0.3, 54, "#2a6127") + blob(w * 0.5, h * 0.4, 64, "#306f2d") + blob(w * 0.28, h * 0.52, 44, "#2a6127") + blob(w * 0.74, h * 0.56, 40, "#2f6b2c");
  s += `<path d="M${w * 0.4} ${h * 0.06} q20 -10 40 0 M${w * 0.6} ${h * 0.36} q16 -8 32 0" stroke="#7fbf5a" stroke-width="4" fill="none" stroke-linecap="round"/>`;
  return s;
}, { solid: 1 });
def("pine", 170, 380, 1400, () => conifer(170, 380, "#2f6b33", null), { solid: 1 });
def("fern", 180, 100, 700, () => {
  let s = "";
  for (let i = 0; i < 7; i++) { const a = -2.6 + i * 0.36; const x2 = 90 + Math.cos(a) * 88, y2 = 96 + Math.sin(a) * 88; s += SV.path(`M90 98 Q${(90 + x2) / 2} ${(98 + y2) / 2 - 18} ${x2} ${y2} Q${(90 + x2) / 2 + 6} ${(98 + y2) / 2} 90 98Z`, i % 2 ? "#4f9b3c" : "#3f8a32", 2.5); }
  return s;
});
def("mossrock", 190, 130, 950, () => rock(190, 130, "#7d7f74", "#5aa046"), { solid: 1 });
def("mushroom", 130, 110, 420, () => SV.rect(40, 60, 16, 46, 6, "#f3e7cf", 2.5) + SV.path("M14 66 Q48 10 82 66Z", "#d9442b", 3) + SV.circ(36, 46, 5, "#fff", 0) + SV.circ(58, 54, 4, "#fff", 0) + SV.rect(86, 74, 12, 32, 5, "#f3e7cf", 2.5) + SV.path("M72 78 Q92 46 112 78Z", "#e8a33a", 3));
def("stump", 150, 110, 620, () => SV.path("M20 104 L28 40 L122 40 L130 104Z", "#7b4a2a", 3) + SV.ell(75, 40, 47, 14, "#d9a86a", 3) + `<ellipse cx="75" cy="40" rx="30" ry="8" fill="none" stroke="#9b6a3a" stroke-width="2"/><ellipse cx="75" cy="40" rx="14" ry="4" fill="none" stroke="#9b6a3a" stroke-width="2"/>`, { solid: 1 });
def("sign", 120, 160, 520, () => SV.rect(54, 50, 12, 108, 3, "#6b4423", 3) + SV.path("M10 20 L96 20 L114 44 L96 68 L10 68Z", "#e8b44a", 3) + `<text x="52" y="54" text-anchor="middle" font-family="${FONT}" font-weight="900" font-size="22" fill="${OL}">GO!</text>`);
def("log", 460, 110, 2800, () => {
  let s = SV.rect(10, 34, 440, 66, 32, "#7b4a2a", 3);
  for (let i = 0; i < 6; i++) s += `<path d="M${40 + i * 70} 40 Q${60 + i * 70} 66 ${42 + i * 70} 94" stroke="#5e3519" stroke-width="3" fill="none"/>`;
  s += SV.ell(30, 67, 22, 32, "#d9a86a", 3) + `<ellipse cx="30" cy="67" rx="12" ry="18" fill="none" stroke="#9b6a3a" stroke-width="2"/>`;
  s += `<path d="M120 36 q20 -18 40 -4 M300 34 q16 -14 34 -2" stroke="#4f9b3c" stroke-width="7" fill="none" stroke-linecap="round"/>`;
  return s;
}, { obstacle: "log" });

/* ---- desert ---- */
def("saguaro", 170, 320, 1200, () => {
  const c = "#3f8f4a";
  let s = SV.path("M70 316 L70 60 Q85 30 100 60 L100 316Z", c, 3);
  s += SV.path("M70 190 L40 190 Q24 190 24 170 L24 110 Q32 92 44 110 L44 166 L70 166Z", c, 3);
  s += SV.path("M100 150 L130 150 Q146 150 146 130 L146 80 Q138 64 126 80 L126 128 L100 128Z", c, 3);
  for (const x of [78, 86, 94]) s += `<path d="M${x} 66 L${x} 312" stroke="${shade(c, -0.25)}" stroke-width="2"/>`;
  s += SV.circ(85, 46, 8, "#ff6fa8", 2.5);
  return s;
}, { solid: 1 });
def("mesa", 460, 400, 6000, () => SV.path("M10 398 L40 120 L80 90 L90 40 L380 40 L392 100 L430 130 L450 398Z", "#c4562b", 3) +
  `<path d="M40 160 L430 170 M30 240 L440 250 M20 320 L446 330" stroke="#a3431d" stroke-width="5"/><path d="M90 40 L380 40 L392 100 L80 90Z" fill="#e07a45"/>`);
def("deadtree", 200, 240, 1200, () => SV.poly([[100, 238], [100, 120], [60, 70], [40, 30]], 12, "#8a6a4a") + SV.poly([[100, 140], [146, 90], [170, 50]], 9, "#8a6a4a") + SV.poly([[100, 110], [110, 50]], 7, "#8a6a4a") + SV.poly([[62, 74], [90, 54]], 5, "#8a6a4a"));
def("tumbleweed", 130, 120, 560, () => {
  let s = SV.circ(65, 64, 50, "rgba(160,120,60,.25)", 3);
  for (let i = 0; i < 9; i++) s += `<path d="M${30 + i * 8} ${30 + (i % 3) * 20} Q65 ${64 + (i % 2 ? 40 : -40)} ${100 - i * 6} ${94 - (i % 3) * 14}" stroke="#a0783c" stroke-width="3" fill="none"/>`;
  return s;
}, { obstacle: "small" });
def("boulder", 190, 140, 950, () => rock(190, 140, "#b5643a", "#d98a5a"), { solid: 1, obstacle: "rock" });
def("skull", 120, 80, 420, () => SV.path("M20 50 Q10 20 50 16 Q90 12 100 40 L112 30 L114 48 L100 56 Q86 72 54 72 Q24 72 20 50Z", "#f3ead6", 3) + SV.circ(46, 40, 8, OL, 0) + SV.circ(74, 40, 8, OL, 0) + SV.path("M10 34 Q-4 10 18 4 M110 30 Q124 6 102 2", "none", 5));
def("smallcactus", 110, 110, 520, () => SV.ell(55, 70, 30, 38, "#4c9a4a", 3) + SV.ell(30, 52, 16, 20, "#4c9a4a", 3) + SV.circ(55, 32, 6, "#ffd23f", 2), { solid: 1 });

/* ---- glacier ---- */
def("snowpine", 180, 400, 1450, () => conifer(180, 400, "#2c5e4a", "#f4f8ff"), { solid: 1 });
def("serac", 170, 280, 1250, () => SV.path("M20 278 L50 90 L80 20 L110 70 L150 278Z", "#a8dcf5", 3) + `<path d="M80 20 L86 278 M50 90 L70 278" stroke="#7cc3e8" stroke-width="3"/><path d="M80 20 L110 70 L150 278 L86 278Z" fill="#7cc3e8" opacity=".6"/><path d="M60 80 L70 140" stroke="#fff" stroke-width="5" stroke-linecap="round"/>`, { solid: 1 });
def("snowrock", 190, 130, 950, () => rock(190, 130, "#7c8ba3", "#ffffff"), { solid: 1, obstacle: "rock" });
def("snowman", 130, 170, 650, () => SV.circ(65, 128, 38, "#fff", 3) + SV.circ(65, 74, 28, "#fff", 3) + SV.circ(65, 34, 20, "#fff", 3) + SV.path("M66 36 L94 42 L66 44Z", "#ff8a1c", 2) + SV.circ(58, 30, 3, OL, 0) + SV.circ(72, 30, 3, OL, 0) + SV.rect(40, 54, 50, 8, 3, "#e2433b", 2.5) + SV.rect(48, 6, 34, 12, 2, "#1c1a22", 2.5));
def("gate", 70, 170, 340, () => SV.rect(30, 20, 8, 148, 3, "#d9dde6", 2.5) + SV.path("M38 22 L66 34 L38 48Z", "#ff5a1f", 2.5));
def("iceblock", 210, 150, 1050, () => SV.path("M10 146 L20 40 L100 14 L196 36 L200 146Z", "#bfe8ff", 3) + `<path d="M100 14 L106 146 M20 40 L106 70 L196 36" stroke="#8fd0f0" stroke-width="3" fill="none"/><path d="M40 60 L54 110" stroke="#fff" stroke-width="6" stroke-linecap="round"/>`, { solid: 1, obstacle: "rock" });

/* ---- monsoon ghats ---- */
def("palm", 260, 440, 1800, () => {
  let s = SV.path("M120 438 Q110 300 140 140 L152 142 Q128 300 140 438Z", "#8a6a3a", 3);
  for (let i = 0; i < 8; i++) s += `<path d="M${118 + i * 0.5} ${380 - i * 30} q10 -4 18 0" stroke="#6b4f2a" stroke-width="3" fill="none"/>`;
  const leaf = (a, l) => { const x = 146 + Math.cos(a) * l, y = 140 + Math.sin(a) * l * 0.7; return SV.path(`M146 140 Q${(146 + x) / 2} ${(140 + y) / 2 - 40} ${x} ${y} Q${(146 + x) / 2} ${(140 + y) / 2 - 10} 146 140Z`, "#3c9a3a", 3); };
  for (const [a, l] of [[-3.0, 120], [-2.4, 110], [-1.9, 90], [-1.2, 100], [-0.6, 115], [0.1, 120], [-1.55, 70]]) s += leaf(a, l);
  s += SV.circ(140, 152, 10, "#6b4423", 2.5) + SV.circ(156, 154, 10, "#6b4423", 2.5);
  return s;
}, { solid: 1 });
def("banana", 210, 230, 1050, () => {
  let s = SV.rect(98, 120, 14, 108, 5, "#6aa84f", 3);
  for (const [a, l] of [[-2.8, 100], [-2.2, 95], [-1.6, 80], [-1.0, 95], [-0.4, 100]]) { const x = 105 + Math.cos(a) * l, y = 120 + Math.sin(a) * l; s += SV.path(`M105 120 Q${x - 20} ${y + 30} ${x} ${y} Q${x + 10} ${y + 30} 105 120Z`, "#4fae46", 3); }
  return s;
});
def("teabush", 240, 100, 1300, () => SV.path("M6 98 Q4 40 50 30 Q90 4 130 26 Q190 10 230 46 Q240 80 234 98Z", "#2f8a3a", 3) + `<path d="M30 60 q10 -8 20 0 M90 40 q10 -8 20 0 M150 50 q10 -8 20 0 M200 62 q10 -8 20 0" stroke="#7fd05a" stroke-width="4" fill="none" stroke-linecap="round"/>`);
def("shrine", 210, 230, 1300, () => SV.rect(40, 120, 130, 106, 4, "#f2e3c6", 3) + SV.path("M30 124 L105 30 L180 124Z", "#e8862f", 3) + SV.path("M105 6 L105 32", "none", 4) + SV.path("M98 12 L118 18 L98 24Z", "#e0193b", 2) + SV.path("M80 226 L80 170 Q105 140 130 170 L130 226Z", "#3a2a24", 3) + SV.circ(105, 90, 10, "#ffd23f", 2.5) + `<path d="M40 140 L170 140" stroke="#e0193b" stroke-width="5" stroke-dasharray="8 6"/>`, { solid: 1 });
def("waterfall", 420, 440, 4600, () => {
  let s = SV.path("M10 438 L30 60 L120 10 L300 16 L400 70 L410 438Z", "#4d5b4a", 3);
  s += SV.path("M170 20 L250 20 L270 438 L150 438Z", "#bfe9ff", 3);
  for (let i = 0; i < 7; i++) s += `<path d="M${178 + i * 12} 30 L${168 + i * 15} 430" stroke="#fff" stroke-width="3" opacity=".8"/>`;
  s += `<path d="M30 60 L120 10 L170 20 L150 438 L10 438Z" fill="#3a8a3a" opacity=".55"/><path d="M250 20 L300 16 L400 70 L410 438 L270 438Z" fill="#3a8a3a" opacity=".55"/>`;
  s += SV.ell(210, 432, 90, 14, "#fff", 0, 'opacity=".8"');
  return s;
});
def("bunting", 240, 210, 1700, () => {
  let s = SV.rect(10, 20, 8, 188, 3, "#6b4423", 2.5) + SV.rect(222, 20, 8, 188, 3, "#6b4423", 2.5);
  s += `<path d="M14 30 Q120 80 226 30" stroke="${OL}" stroke-width="2" fill="none"/>`;
  const cols = ["#e0193b", "#ffd23f", "#2bb673", "#ff8a1c", "#2b7de9"];
  for (let i = 0; i < 9; i++) { const t = (i + 0.5) / 9, x = lerp(14, 226, t), y = 30 + Math.sin(t * Math.PI) * 50 * 0.5 * 2 * 0.5 + Math.sin(t * Math.PI) * 25; s += SV.path(`M${x - 9} ${y} L${x + 9} ${y} L${x} ${y + 22}Z`, cols[i % 5], 2); }
  return s;
});
def("cow", 220, 160, 1150, () => {
  let s = SV.ell(110, 92, 70, 40, "#fbf6ee", 3) + SV.ell(84, 82, 18, 14, "#4a3426", 0) + SV.ell(140, 100, 14, 12, "#4a3426", 0);
  for (const x of [60, 82, 136, 158]) s += SV.rect(x, 116, 12, 38, 4, "#fbf6ee", 2.5);
  s += SV.ell(186, 70, 26, 22, "#fbf6ee", 3) + SV.ell(198, 82, 14, 10, "#f2b6a8", 2.5) + SV.circ(182, 64, 3.5, OL, 0);
  s += SV.path("M172 52 Q166 34 178 36 M196 50 Q204 32 210 40", "none", 4) + `<path d="M172 52 Q166 34 178 36 M196 50 Q204 32 210 40" stroke="#e8d7b8" stroke-width="2" fill="none"/>`;
  s += SV.path("M110 54 L104 40 L118 46Z", "#e8862f", 2);  // garland bit
  return s;
}, { solid: 1 });
def("jrock", 190, 130, 950, () => rock(190, 130, "#6c6a5c", "#3c8a3c"), { solid: 1, obstacle: "rock" });

/* ---- volcano ---- */
def("charred", 170, 310, 1250, () => SV.poly([[85, 308], [85, 140], [55, 90], [44, 40]], 13, "#2a201c") + SV.poly([[85, 160], [126, 100], [140, 60]], 9, "#2a201c") + SV.poly([[85, 120], [92, 60]], 7, "#2a201c") + `<path d="M84 300 L86 180" stroke="#ff5a1f" stroke-width="2" opacity=".7"/>`);
def("spire", 190, 400, 1500, () => SV.path("M30 398 L60 200 L80 40 L100 10 L120 60 L140 220 L170 398Z", "#2e2626", 3) + `<path d="M100 10 L120 60 L140 220 L170 398 L104 398Z" fill="#1d1717"/><path d="M80 150 L96 260 L84 360" stroke="#ff5a1f" stroke-width="4" fill="none" stroke-linecap="round"/>`, { solid: 1 });
def("lavarock", 190, 130, 950, () => rock(190, 130, "#3a3030", null) + `<path d="M40 110 L80 70 L120 96 L150 60" stroke="#ff7a1f" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M40 110 L80 70 L120 96 L150 60" stroke="#ffd36b" stroke-width="2" fill="none"/>`, { solid: 1, obstacle: "rock", glow: "#ff5a1f" });
def("obsidian", 150, 190, 820, () => SV.path("M40 188 L30 90 L60 20 L80 100Z", "#4a2f6b", 3) + SV.path("M70 188 L76 60 L104 6 L122 120 L110 188Z", "#5e3a8a", 3) + `<path d="M84 60 L96 110" stroke="#c9a6ff" stroke-width="4" stroke-linecap="round"/>`);
def("vent", 220, 130, 1500, () => SV.ell(110, 104, 100, 24, "#3a2a2a", 3) + SV.ell(110, 100, 60, 13, "#ff7a1f", 3) + SV.ell(110, 99, 30, 6, "#ffe08a", 0));

/* ---- tundra ---- */
def("darkpine", 180, 400, 1450, () => conifer(180, 400, "#16303a", "#dbe8ff", "#2a1f1a"), { solid: 1 });
def("crystal", 150, 230, 850, () => SV.path("M30 228 L40 120 L60 40 L80 130Z", "#7fe9ff", 3) + SV.path("M70 228 L84 70 L104 10 L124 120 L112 228Z", "#a8f2ff", 3) + `<path d="M98 30 L106 120" stroke="#fff" stroke-width="4" stroke-linecap="round"/>`, { solid: 1, glow: "#7fe9ff" });
def("inukshuk", 150, 210, 850, () => SV.rect(40, 150, 26, 58, 4, "#8c94a6", 3) + SV.rect(84, 150, 26, 58, 4, "#8c94a6", 3) + SV.rect(26, 122, 98, 30, 6, "#7a8296", 3) + SV.rect(56, 82, 38, 42, 6, "#8c94a6", 3) + SV.rect(10, 62, 130, 22, 6, "#6c7488", 3) + SV.rect(56, 22, 38, 40, 8, "#8c94a6", 3), { solid: 1 });
def("lantern", 70, 230, 420, () => SV.rect(30, 50, 9, 178, 3, "#3a3a44", 2.5) + SV.rect(16, 18, 38, 40, 8, "#ffd36b", 3) + `<rect x="24" y="26" width="22" height="24" rx="5" fill="#fff6c2"/>`, { glow: "#ffd36b" });
def("tsnowrock", 190, 130, 950, () => rock(190, 130, "#4d5f7e", "#e9f3ff"), { solid: 1, obstacle: "rock" });

/* ---- common track objects ---- */
def("ramp", 320, 150, 1900, () => {
  let s = SV.path("M14 146 L60 30 L260 30 L306 146Z", "#c8924f", 3);
  for (let i = 1; i < 6; i++) s += `<path d="M${14 + i * 7.6} ${146 - i * 19.3} L${306 - i * 7.6} ${146 - i * 19.3}" stroke="#8c5e2c" stroke-width="3"/>`;
  s += SV.rect(56, 22, 208, 12, 4, "#ffd23f", 3);
  s += `<path d="M90 28 l14 -10 l14 10 M150 28 l14 -10 l14 10 M210 28 l14 -10 l14 10" stroke="${OL}" stroke-width="3" fill="none"/>`;
  return s;
});
def("crate", 130, 130, 560, () => SV.rect(10, 10, 110, 110, 18, "#ffcf3a", 4) + SV.rect(22, 22, 86, 86, 12, "#ff8a1c", 3) + `<text x="65" y="92" text-anchor="middle" font-family="${FONT}" font-weight="900" font-size="66" fill="#fff" stroke="${OL}" stroke-width="3">?</text>`, { glow: "#ffd23f" });
def("repair", 130, 130, 560, () => SV.circ(65, 65, 56, "#2bd96a", 4) + SV.rect(53, 26, 24, 78, 6, "#fff", 3) + SV.rect(26, 53, 78, 24, 6, "#fff", 3) + `<rect x="55" y="28" width="20" height="74" fill="#fff"/>`, { glow: "#2bd96a" });
def("arch", 820, 520, 5200, () => {
  let s = SV.rect(20, 60, 50, 456, 6, "#2a2730", 3) + SV.rect(750, 60, 50, 456, 6, "#2a2730", 3);
  s += SV.rect(10, 30, 800, 110, 14, "#ff3d7f", 4);
  for (let i = 0; i < 16; i++) s += `<rect x="${24 + i * 49}" y="44" width="24" height="24" fill="${i % 2 ? "#fff" : OL}"/><rect x="${48 + i * 49}" y="68" width="24" height="24" fill="${i % 2 ? "#fff" : OL}"/>`;
  s += `<rect x="230" y="40" width="360" height="90" rx="10" fill="${OL}"/><text x="410" y="112" text-anchor="middle" font-family="${FONT}" font-weight="900" font-size="72" fill="#ffd23f">FINISH</text>`;
  return s;
});
def("startgate", 820, 520, 5200, () => {
  let s = SV.rect(20, 60, 50, 456, 6, "#2a2730", 3) + SV.rect(750, 60, 50, 456, 6, "#2a2730", 3);
  s += SV.rect(10, 30, 800, 110, 14, "#2bd9c5", 4);
  s += `<text x="410" y="112" text-anchor="middle" font-family="${FONT}" font-weight="900" font-size="72" fill="${OL}">WILD RIDERS</text>`;
  return s;
});
def("crowd", 340, 170, 2300, () => {
  let s = "";
  const cols = ["#e2433b", "#2b7de9", "#ffd23f", "#2bb673", "#ff79b0", "#ff8a1c", "#8a4dff"];
  const skins = ["#f2c6a0", "#b8784f", "#7a4a32", "#fbe0d2", "#c99068"];
  for (let i = 0; i < 9; i++) {
    const x = 22 + i * 37, y = 60 + (i % 2) * 18;
    s += SV.path(`M${x - 16} 168 L${x - 14} ${y + 30} Q${x} ${y + 18} ${x + 14} ${y + 30} L${x + 16} 168Z`, cols[i % 7], 2.5);
    s += SV.circ(x, y + 10, 13, skins[i % 5], 2.5);
    s += SV.poly([[x - 12, y + 34], [x - 22, y - 8]], 6, cols[(i + 3) % 7]) + SV.poly([[x + 12, y + 34], [x + 22, y - 8]], 6, cols[(i + 3) % 7]);
  }
  return s;
});
def("banner", 160, 260, 900, () => SV.rect(70, 10, 10, 248, 3, "#d9dde6", 2.5) + SV.path("M80 14 Q140 30 150 20 L144 150 Q120 160 80 144Z", "#ff3d7f", 3) + `<text x="114" y="96" text-anchor="middle" font-family="${FONT}" font-weight="900" font-size="28" fill="#fff" transform="rotate(4 114 90)">GO</text>`);

/* ---- zone scenery (villages, camps, meadows, lakeshores) ---- */
def("flowers", 200, 70, 900, () => {
  let s = "";
  for (let i = 0; i < 6; i++) s += SV.path(`M${20 + i * 30} 70 Q${14 + i * 30} 40 ${26 + i * 30} 24 Q${30 + i * 30} 44 ${34 + i * 30} 70Z`, "#4f9b3c", 2);
  const cols = ["#ff79b0", "#ffd23f", "#ffffff", "#b35cff", "#ff8a1c"];
  for (let i = 0; i < 9; i++) { const x = 18 + i * 20, y = 18 + (i % 3) * 12; s += SV.circ(x, y, 8, cols[i % 5], 2) + `<circle cx="${x}" cy="${y}" r="3" fill="#ffd23f"/>`; }
  return s;
});
def("bush", 180, 120, 950, () => SV.path("M10 118 Q2 70 40 58 Q52 18 96 24 Q140 14 152 56 Q182 66 172 118Z", "#3f8a32", 3) + `<path d="M40 70 q14 -10 28 0 M100 44 q14 -10 28 0 M120 84 q12 -8 24 0" stroke="#7fd05a" stroke-width="4" fill="none" stroke-linecap="round"/>` + SV.circ(70, 60, 6, "#e2433b", 2) + SV.circ(130, 74, 6, "#e2433b", 2), { solid: 1 });
def("cabin", 260, 220, 2300, () => {
  let s = SV.rect(30, 96, 200, 122, 4, "#8a5a32", 3);
  for (let y = 108; y < 214; y += 18) s += `<path d="M30 ${y} L230 ${y}" stroke="#6b4423" stroke-width="3"/>`;
  s += SV.path("M14 104 L130 22 L246 104Z", "#5a3a2a", 3) + `<path d="M40 92 L130 30 L220 92" stroke="#7a5038" stroke-width="5" fill="none"/>`;
  s += SV.rect(178, 30, 26, 50, 3, "#7d7f74", 3) + SV.rect(100, 140, 40, 78, 4, "#4a2f1f", 3);
  s += SV.rect(160, 128, 46, 38, 4, "#ffd36b", 3) + `<path d="M183 128 L183 166 M160 147 L206 147" stroke="#6b4423" stroke-width="3"/>`;
  s += SV.rect(42, 128, 40, 34, 4, "#ffd36b", 3);
  return s;
}, { solid: 1, glow: "#ffd36b" });
def("logpile", 240, 110, 1400, () => {
  let s = "";
  const pos = [[40, 86], [96, 86], [152, 86], [208, 86], [68, 40], [124, 40], [180, 40]];
  for (const [x, y] of pos) s += SV.circ(x, y, 26, "#d9a86a", 3) + `<circle cx="${x}" cy="${y}" r="15" fill="none" stroke="#9b6a3a" stroke-width="2"/><circle cx="${x}" cy="${y}" r="5" fill="none" stroke="#9b6a3a" stroke-width="2"/>`;
  return s;
}, { solid: 1 });
def("reeds", 120, 160, 650, () => {
  let s = "";
  for (let i = 0; i < 6; i++) { const x = 14 + i * 18; s += `<path d="M${x} 160 Q${x + (i % 2 ? 6 : -6)} 90 ${x + (i % 2 ? 2 : -2)} ${30 + (i % 3) * 14}" stroke="#4f8a3a" stroke-width="5" fill="none" stroke-linecap="round"/>`; if (i % 2 === 0) s += SV.rect(x - 6, 24 + (i % 3) * 14, 12, 30, 6, "#7b4a2a", 2); }
  return s;
});
def("adobe", 270, 210, 2300, () => {
  let s = SV.rect(20, 80, 230, 128, 6, "#e3b07a", 3) + SV.rect(70, 30, 140, 60, 6, "#d9a26a", 3);
  for (const x of [34, 84, 134, 184, 234]) s += SV.rect(x - 5, 86, 12, 9, 2, "#7b4a2a", 2);
  for (const x of [88, 140, 192]) s += SV.rect(x - 5, 36, 12, 9, 2, "#7b4a2a", 2);
  s += SV.path("M118 208 L118 146 Q135 128 152 146 L152 208Z", "#5a3420", 3) + SV.rect(48, 128, 30, 30, 3, "#3a2a24", 3) + SV.rect(196, 128, 30, 30, 3, "#3a2a24", 3);
  s += `<path d="M48 120 l30 0 M196 120 l30 0" stroke="#c4562b" stroke-width="4"/>`;
  s += SV.ell(232, 70, 16, 12, "#c4562b", 2.5) + `<path d="M224 60 q8 -14 16 0" stroke="#e2433b" stroke-width="5" fill="none"/>`;
  return s;
}, { solid: 1 });
def("lodge", 280, 270, 2500, () => {
  let s = SV.rect(46, 130, 188, 138, 4, "#8a5a32", 3);
  s += SV.path("M10 150 L140 12 L270 150Z", "#5a3a2a", 3) + SV.path("M10 150 L140 12 L270 150 L250 150 L140 34 L30 150Z", "#ffffff", 2.5);
  s += SV.path("M84 150 L140 70 L196 150Z", "#ffd36b", 3) + `<path d="M140 70 L140 150 M112 110 L168 110" stroke="#6b4423" stroke-width="4"/>`;
  s += SV.rect(118, 200, 44, 68, 4, "#4a2f1f", 3) + SV.rect(60, 180, 40, 34, 4, "#ffd36b", 3) + SV.rect(180, 180, 40, 34, 4, "#ffd36b", 3);
  s += SV.rect(20, 220, 30, 48, 3, "#e2433b", 2.5) + `<text x="35" y="250" text-anchor="middle" font-family="${FONT}" font-weight="900" font-size="14" fill="#fff">SKI</text>`;
  return s;
}, { solid: 1, glow: "#ffd36b" });
def("hut", 240, 210, 2000, () => {
  let s = "";
  for (const x of [50, 110, 170]) s += SV.rect(x, 150, 12, 58, 3, "#6b4423", 2.5);
  s += SV.rect(30, 110, 180, 50, 4, "#c8924f", 3) + `<path d="M30 126 L210 126 M30 142 L210 142" stroke="#8c5e2c" stroke-width="3"/>`;
  s += SV.path("M8 118 L120 30 L232 118 Q120 100 8 118Z", "#d9b25a", 3);
  for (let i = 0; i < 8; i++) s += `<path d="M${30 + i * 26} ${112 - Math.abs(i - 3.5) * 4} L${40 + i * 26} ${90 - Math.abs(i - 3.5) * 10}" stroke="#a8843a" stroke-width="3"/>`;
  s += SV.rect(100, 118, 34, 40, 4, "#3a2a24", 3) + SV.circ(184, 92, 9, "#e0193b", 2.5);
  return s;
}, { solid: 1 });
def("igloo", 220, 130, 1500, () => {
  let s = SV.path("M10 128 Q10 10 110 10 Q210 10 210 128Z", "#eef5ff", 3);
  s += `<path d="M22 90 Q110 70 198 90 M14 110 Q110 92 206 110 M40 50 Q110 34 180 50" stroke="#b8cde8" stroke-width="3" fill="none"/>`;
  s += SV.path("M80 128 L80 92 Q110 66 140 92 L140 128Z", "#cfe0f5", 3) + SV.path("M92 128 L92 100 Q110 84 128 100 L128 128Z", "#ffd36b", 2.5);
  return s;
}, { solid: 1, glow: "#ffd36b" });
def("snowcabin", 260, 230, 2300, () => {
  let s = SV.rect(30, 106, 200, 122, 4, "#6b4a36", 3);
  for (let y = 118; y < 224; y += 18) s += `<path d="M30 ${y} L230 ${y}" stroke="#4e3524" stroke-width="3"/>`;
  s += SV.path("M10 114 L130 26 L250 114Z", "#3a2a2a", 3) + SV.path("M10 114 L130 26 L250 114 Q130 96 10 114Z", "#f4f8ff", 2.5);
  s += SV.rect(100, 150, 40, 78, 4, "#2a1f1a", 3) + SV.rect(160, 138, 46, 38, 4, "#ffd36b", 3) + SV.rect(42, 138, 40, 34, 4, "#ffd36b", 3);
  return s;
}, { solid: 1, glow: "#ffd36b" });

/* ---- per-biome kit: rock walls, tunnel ribs and mouths, rails, hairpin chevrons, waterfall curtain ---- */
function biomeKit(biome) {
  const [rc, top] = biome.rock;
  const dk = shade(rc, -0.3);
  const id = biome.id;
  const kit = {};
  kit.wall = { w: 300, h: 420, ww: 3400, solid: 1, svg: () => {
    let s = SV.path("M0 420 L0 64 L34 34 L72 46 L112 12 L160 30 L204 8 L252 34 L300 22 L300 420Z", rc, 3);
    for (let i = 0; i < 6; i++) s += `<path d="M0 ${110 + i * 52} Q150 ${96 + i * 52 + (i % 2 ? 14 : -10)} 300 ${112 + i * 52}" stroke="${dk}" stroke-width="4" fill="none" opacity=".7"/>`;
    s += `<path d="M90 60 L104 170 L84 260 M210 40 L196 150 L222 300 M150 200 L160 380" stroke="${shade(rc, -0.4)}" stroke-width="3" fill="none"/>`;
    s += `<path d="M150 0 L300 0 L300 420 L170 420Z" fill="${shade(rc, -0.25)}" opacity=".35"/>`;
    s += SV.path("M0 64 L34 34 L72 46 L112 12 L160 30 L204 8 L252 34 L300 22 L300 50 Q250 62 204 36 Q160 58 112 40 Q72 72 34 60 Q16 78 0 92Z", top, 2.5);
    if (id === "volcano") s += `<path d="M60 140 L90 200 L70 280 M230 120 L250 210" stroke="#ff5a1f" stroke-width="5" fill="none" stroke-linecap="round"/>`;
    if (id === "tundra" || id === "glacier") s += `<path d="M120 120 L130 180" stroke="#ffffff" stroke-width="6" stroke-linecap="round" opacity=".7"/>`;
    return s;
  } };
  const ribCol = id === "glacier" ? "#8fb6dd" : id === "tundra" ? "#2c3c5a" : shade(rc, -0.35);
  const timber = id === "forest" || id === "desert" || id === "ghats";
  kit.rib = { w: 560, h: 400, ww: 5600, svg: () => {
    let s = `<path fill-rule="evenodd" d="M0 400 L0 30 Q0 0 30 0 L530 0 Q560 0 560 30 L560 400 Z M76 400 L76 176 Q76 74 280 64 Q484 74 484 176 L484 400 Z" fill="${ribCol}" stroke="${OL}" stroke-width="3"/>`;
    s += `<path d="M76 400 L76 176 Q76 74 280 64 Q484 74 484 176 L484 400" stroke="${shade(ribCol, 0.25)}" stroke-width="6" fill="none" opacity=".6"/>`;
    if (timber) s += SV.rect(60, 70, 30, 330, 4, "#7b4a2a", 3) + SV.rect(470, 70, 30, 330, 4, "#7b4a2a", 3) + SV.rect(40, 48, 480, 34, 6, "#8a5a32", 3);
    if (id === "volcano") s += `<path d="M30 120 L50 220 L36 330 M530 100 L512 240" stroke="#ff5a1f" stroke-width="6" fill="none" stroke-linecap="round" opacity=".85"/>`;
    if (id === "tundra" || id === "glacier") s += `<path d="M120 40 L136 80 M260 20 L270 54 M420 36 L404 76" stroke="#bff3ff" stroke-width="7" stroke-linecap="round"/>`;
    return s;
  } };
  kit.portal = { w: 1600, h: 900, ww: 16000, svg: () => {
    let s = `<path fill-rule="evenodd" d="M0 900 L0 520 L120 380 L260 430 L420 200 L560 300 L700 90 L860 210 L1000 60 L1150 260 L1300 170 L1460 360 L1600 300 L1600 900 Z M592 900 L592 676 Q592 572 800 562 Q1008 572 1008 676 L1008 900 Z" fill="${rc}" stroke="${OL}" stroke-width="4"/>`;
    s += `<path d="M700 90 L860 210 L1000 60 L1150 260 L1300 170 L1460 360 L1600 300 L1600 900 L1100 900Z" fill="${shade(rc, -0.25)}" opacity=".4"/>`;
    for (let i = 0; i < 5; i++) s += `<path d="M0 ${560 + i * 70} Q400 ${540 + i * 70} 560 ${600 + i * 66} M1040 ${600 + i * 66} Q1300 ${540 + i * 70} 1600 ${560 + i * 70}" stroke="${dk}" stroke-width="5" fill="none" opacity=".6"/>`;
    s += `<path d="M560 900 L560 670 Q560 540 800 528 Q1040 540 1040 670 L1040 900 L1008 900 L1008 676 Q1008 572 800 562 Q592 572 592 676 L592 900Z" fill="${timber ? "#8a5a32" : ribCol}" stroke="${OL}" stroke-width="3"/>`;
    s += SV.path("M0 520 L120 380 L260 430 L420 200 L560 300 L700 90 L860 210 L1000 60 L1150 260 L1300 170 L1460 360 L1600 300 L1600 340 Q1460 400 1300 210 Q1150 300 1000 100 Q860 250 700 130 Q560 340 420 240 Q260 470 120 420 Q60 500 0 560Z", top, 3);
    if (id === "ghats") for (const x of [380, 1220]) s += `<path d="M${x} 300 L${x - 10} 900 L${x + 60} 900 L${x + 50} 300Z" fill="#bfe9ff" opacity=".85"/><path d="M${x + 10} 320 L${x + 4} 890 M${x + 30} 320 L${x + 30} 890" stroke="#fff" stroke-width="4" opacity=".8"/>`;
    if (id === "volcano") s += `<path d="M560 900 L560 670 Q560 540 800 528 Q1040 540 1040 670 L1040 900" stroke="#ff5a1f" stroke-width="8" fill="none" opacity=".7"/>`;
    return s;
  } };
  kit.curtain = { w: 560, h: 400, ww: 5600, svg: () => {
    let s = `<path d="M70 400 L70 170 Q70 64 280 56 Q490 64 490 170 L490 400Z" fill="#bfe9ff" opacity=".42"/>`;
    for (let i = 0; i < 16; i++) s += `<path d="M${84 + i * 26} ${120 - Math.abs(i - 7.5) * 6} L${80 + i * 26} 400" stroke="#ffffff" stroke-width="${i % 3 ? 3 : 6}" opacity=".7"/>`;
    return s;
  } };
  const metal = id === "glacier" || id === "tundra" || id === "volcano";
  kit.rail = { w: 60, h: 130, ww: 320, svg: () => metal
    ? SV.rect(22, 20, 16, 108, 4, "#c9ced8", 2.5) + SV.rect(16, 18, 28, 14, 4, "#e2433b", 2.5) + `<rect x="22" y="40" width="16" height="12" fill="#e2433b"/><rect x="22" y="68" width="16" height="12" fill="#e2433b"/>`
    : SV.rect(20, 18, 20, 110, 4, "#7b4a2a", 2.5) + SV.rect(16, 30, 28, 10, 3, "#ffd23f", 2) + `<path d="M24 60 L36 60 M24 90 L36 90" stroke="#5e3519" stroke-width="3"/>` };
  const chev = (dir) => () => {
    let s = SV.rect(72, 90, 16, 78, 3, "#3a3a44", 2.5) + SV.rect(6, 10, 148, 86, 10, "#ffd23f", 3.5);
    for (let i = 0; i < 3; i++) { const x = 30 + i * 40; s += dir > 0 ? `<path d="M${x} 24 L${x + 26} 53 L${x} 82 L${x + 12} 82 L${x + 38} 53 L${x + 12} 24Z" fill="${OL}"/>` : `<path d="M${x + 38} 24 L${x + 12} 53 L${x + 38} 82 L${x + 26} 82 L${x} 53 L${x + 26} 24Z" fill="${OL}"/>`; }
    return s;
  };
  kit.chevR = { w: 160, h: 170, ww: 950, svg: chev(1) };
  kit.chevL = { w: 160, h: 170, ww: 950, svg: chev(-1) };
  return kit;
}

/* Which scenery each biome scatters. weights: [id, weight, side-distance range]
   zones: the scenery sets a trail passes through (see each track's plan); dens = chance of a piece per side per segment */
const BIOME_SCENERY = {
  forest: { near: [["redwood", 3], ["pine", 3], ["fern", 4], ["mossrock", 1.5], ["mushroom", 1.5], ["stump", 1]], far: ["redwood", "pine"], obstacles: ["mossrock", "stump"], special: ["sign", "banner"], zones: { deep: { near: [["redwood", 5], ["pine", 3], ["fern", 3], ["mossrock", 1], ["mushroom", 1]], dens: 0.78 }, meadow: { near: [["flowers", 5], ["fern", 2], ["bush", 3], ["mushroom", 1.5], ["stump", 1], ["pine", 0.8]], dens: 0.55 }, camp: { near: [["cabin", 1.2], ["logpile", 2], ["stump", 2], ["pine", 2], ["fern", 1]], dens: 0.55 }, river: { near: [["reeds", 4], ["fern", 3], ["mossrock", 2], ["pine", 1.5]], dens: 0.6 } } },
  desert: { near: [["saguaro", 3], ["smallcactus", 3], ["deadtree", 1.5], ["boulder", 1.5], ["skull", 1]], far: ["mesa", "saguaro"], obstacles: ["boulder", "tumbleweed"], special: ["banner"], zones: { open: { near: [["saguaro", 2], ["smallcactus", 3], ["deadtree", 1], ["skull", 1], ["boulder", 1]], dens: 0.35 }, pueblo: { near: [["adobe", 3], ["smallcactus", 2], ["saguaro", 1]], dens: 0.5 }, oasis: { near: [["palm", 4], ["reeds", 3], ["smallcactus", 1]], dens: 0.55 } } },
  glacier: { near: [["snowpine", 5], ["serac", 1.5], ["snowrock", 1.5], ["snowman", 0.5], ["gate", 2]], far: ["snowpine", "serac"], obstacles: ["snowrock", "iceblock"], special: ["gate", "banner"], zones: { resort: { near: [["snowpine", 4], ["lodge", 1], ["gate", 2], ["snowman", 1]], dens: 0.6 }, bowl: { near: [["snowrock", 1], ["serac", 1], ["snowpine", 0.6]], dens: 0.25 }, icefall: { near: [["serac", 4], ["iceblock", 1], ["snowrock", 1]], dens: 0.6 } } },
  ghats: { near: [["palm", 3], ["banana", 3], ["teabush", 4], ["shrine", 0.6], ["bunting", 0.8], ["cow", 0.5], ["jrock", 1]], far: ["palm", "waterfall"], obstacles: ["jrock"], special: ["bunting", "banner"], zones: { terrace: { near: [["teabush", 6], ["banana", 1], ["cow", 0.4]], dens: 0.72 }, village: { near: [["hut", 3], ["shrine", 0.8], ["bunting", 1.5], ["cow", 1], ["banana", 1], ["palm", 1]], dens: 0.6 }, jungle: { near: [["palm", 4], ["banana", 4], ["jrock", 1], ["fern", 2]], dens: 0.82 } } },
  volcano: { near: [["charred", 3], ["spire", 2], ["lavarock", 2], ["obsidian", 2]], far: ["spire", "charred"], obstacles: ["lavarock"], special: ["banner"], zones: { ash: { near: [["charred", 4], ["spire", 1.5], ["lavarock", 1]], dens: 0.55 }, obsidian: { near: [["obsidian", 4], ["spire", 1], ["lavarock", 1.5]], dens: 0.55 } } },
  tundra: { near: [["darkpine", 5], ["crystal", 2], ["inukshuk", 0.7], ["lantern", 1.5], ["tsnowrock", 1.2]], far: ["darkpine", "crystal"], obstacles: ["tsnowrock"], special: ["lantern"], zones: { forest: { near: [["darkpine", 5], ["lantern", 0.7], ["tsnowrock", 1]], dens: 0.7 }, plains: { near: [["inukshuk", 1], ["tsnowrock", 1.5], ["crystal", 0.8]], dens: 0.25 }, village: { near: [["igloo", 2.5], ["snowcabin", 1.2], ["lantern", 2], ["darkpine", 1]], dens: 0.55 }, lake: { near: [["crystal", 1], ["tsnowrock", 1]], dens: 0.15 } } },
};

/* ---- parallax backgrounds (2048 wide, tileable) ---- */
function bgSVG(biome, layer) {
  const Wd = 2048, H = layer === "far" ? 420 : 300;
  const R = rng(biome.id.length * 97 + (layer === "far" ? 1 : 2));
  const ridge = (base, amp, step, jag) => {
    let d = `M0 ${H}`, y = base;
    const pts = [];
    for (let x = 0; x <= Wd; x += step) {
      y = base - amp * (0.4 + 0.6 * Math.abs(Math.sin(x * 0.0021 + R() * 0.2) * Math.cos(x * 0.0013))) - (jag ? R() * jag : 0);
      pts.push([x, y]);
    }
    pts[pts.length - 1][1] = pts[0][1]; // tileable
    pts.forEach(([x, y]) => (d += ` L${x} ${y.toFixed(1)}`));
    return { d: d + ` L${Wd} ${H}Z`, pts };
  };
  let s = "";
  const id = biome.id;
  if (layer === "far") {
    const cols = { forest: ["#6f9fb4", "#5d8aa0"], desert: ["#d98b5a", "#c4703f"], glacier: ["#c9dcf2", "#a9c4e6"], ghats: ["#6f9a8a", "#5b8574"], volcano: ["#3b1f26", "#2a161c"], tundra: ["#1e3354", "#162843"] }[id];
    const a = ridge(H - 120, 230, 64, id === "glacier" || id === "volcano" ? 50 : 18);
    s += `<path d="${a.d}" fill="${cols[0]}"/>`;
    if (id === "glacier" || id === "tundra") {
      // snow caps on peaks
      a.pts.forEach(([x, y], i) => { if (y < H - 260 && i % 1 === 0) s += `<path d="M${x - 40} ${y + 50} L${x} ${y} L${x + 40} ${y + 50} Q${x} ${y + 34} ${x - 40} ${y + 50}Z" fill="#fff" opacity=".9"/>`; });
    }
    if (id === "desert") {
      for (let i = 0; i < 5; i++) { const x = 150 + i * 420, w = 160 + R() * 120, h = 120 + R() * 90; s += `<path d="M${x} ${H} L${x + 20} ${H - h} L${x + w - 20} ${H - h} L${x + w} ${H}Z" fill="#b8552c"/><path d="M${x + 20} ${H - h} L${x + w - 20} ${H - h} L${x + w - 14} ${H - h + 14} L${x + 26} ${H - h + 14}Z" fill="#e8925a"/>`; }
    }
    if (id === "volcano") {
      s += `<path d="M700 ${H} L940 120 L1000 110 L1060 118 L1300 ${H}Z" fill="#1f1216"/><path d="M940 120 L1000 110 L1060 118 L1040 140 L960 140Z" fill="#ff6a2b"/><ellipse cx="1000" cy="116" rx="60" ry="12" fill="#ffb36b" opacity=".8"/>`;
      s += `<path d="M990 110 Q940 40 1010 0 L1060 0 Q1000 50 1030 110Z" fill="#3b2a2e" opacity=".75"/>`;
      s += `<path d="M960 140 Q930 220 900 ${H}" stroke="#ff5a1f" stroke-width="10" fill="none" opacity=".8"/>`;
    }
    if (id === "ghats") {
      for (let i = 0; i < 4; i++) { const x = 200 + i * 520; s += `<path d="M${x} ${H - 200} L${x + 8} ${H}" stroke="#e9f6ff" stroke-width="10" opacity=".75"/>`; }
    }
    const b = ridge(H - 40, 120, 48, 10);
    s += `<path d="${b.d}" fill="${cols[1]}"/>`;
  } else {
    const cols = { forest: "#2f5d36", desert: "#d9a05e", glacier: "#e6eefa", ghats: "#2f6e3e", volcano: "#1c1414", tundra: "#0f1f33" }[id];
    const a = ridge(H - 40, 70, 40, 6);
    s += `<path d="${a.d}" fill="${cols}"/>`;
    if (id === "forest" || id === "glacier" || id === "tundra" || id === "ghats") {
      const tc = { forest: "#244a2a", glacier: "#2c5248", tundra: "#0a1622", ghats: "#245a32" }[id];
      for (let x = 0; x < Wd; x += 26 + R() * 30) {
        const i = Math.min(a.pts.length - 1, Math.round(x / 40));
        const y = a.pts[i][1] + 10, h = 50 + R() * 60;
        if (id === "ghats" && R() < 0.5) { s += `<path d="M${x} ${y} L${x + 4} ${y - h}" stroke="#4a3a24" stroke-width="5"/><path d="M${x - 24} ${y - h + 10} Q${x + 4} ${y - h - 20} ${x + 30} ${y - h + 12}" stroke="${tc}" stroke-width="14" fill="none"/>`; continue; }
        s += `<path d="M${x - h * 0.22} ${y} L${x} ${y - h} L${x + h * 0.22} ${y}Z" fill="${tc}"/>`;
        if (id === "glacier" || id === "tundra") s += `<path d="M${x - h * 0.1} ${y - h * 0.55} L${x} ${y - h} L${x + h * 0.1} ${y - h * 0.55}Z" fill="#fff" opacity=".85"/>`;
      }
    }
    if (id === "desert") for (let i = 0; i < 6; i++) { const x = R() * Wd; s += `<path d="M${x - 200} ${H} Q${x} ${H - 90} ${x + 260} ${H}Z" fill="#e8b878"/>`; }
    if (id === "volcano") for (let i = 0; i < 4; i++) { const x = 200 + i * 500; s += `<path d="M${x} ${H} Q${x + 60} ${H - 40} ${x + 140} ${H - 30} T${x + 300} ${H}" stroke="#ff5a1f" stroke-width="6" fill="none" opacity=".7"/>`; }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${Wd}" height="${H}" viewBox="0 0 ${Wd} ${H}">${s}</svg>`;
}

/* ---- projectiles (64x64) ---- */
function itemSVG(id) {
  const it = ITEMS[id];
  let s = "";
  switch (id) {
    case "pinecone": s = SV.ell(32, 34, 16, 24, "#8b5a2b", 3) + `<path d="M18 26 Q32 34 46 26 M18 38 Q32 46 46 38 M20 48 Q32 54 44 48" stroke="#5e3519" stroke-width="2.5" fill="none"/>`; break;
    case "pear": s = SV.ell(32, 36, 20, 22, "#d1427a", 3) + `<path d="M24 26 l-3 -3 M38 30 l3 -3 M30 44 l-2 4" stroke="#fff" stroke-width="2"/>` + SV.rect(28, 8, 8, 10, 3, "#4c9a4a", 2); break;
    case "snowball": case "snowburst": s = SV.circ(32, 32, 20, "#f4f9ff", 3) + `<path d="M22 26 q6 -6 12 -4" stroke="#bcd6f0" stroke-width="3" fill="none"/>`; break;
    case "coconut": s = SV.circ(32, 34, 21, "#6b4423", 3) + SV.circ(26, 28, 3, OL, 0) + SV.circ(36, 28, 3, OL, 0) + SV.circ(31, 36, 3, OL, 0); break;
    case "magma": s = SV.path("M12 40 L18 18 L38 10 L54 26 L50 50 L28 56Z", "#3a2a2a", 3) + `<path d="M18 30 L32 34 L44 22 M28 48 L34 34" stroke="#ff7a1f" stroke-width="4" fill="none" stroke-linecap="round"/>`; break;
    case "iceshard": s = SV.path("M32 4 L44 30 L32 60 L20 30Z", "#8fe9ff", 3) + `<path d="M32 10 L36 30" stroke="#fff" stroke-width="3"/>`; break;
    case "shuriken": s = SV.path("M32 4 L38 26 L60 32 L38 38 L32 60 L26 38 L4 32 L26 26Z", "#cfe3ff", 3) + SV.circ(32, 32, 5, "#5d7fb5", 2); break;
    case "chili": s = SV.path("M14 20 Q40 14 50 40 Q52 56 40 54 Q34 34 14 30Z", "#ff2d2d", 3) + SV.path("M12 18 Q6 10 14 6 L18 22Z", "#2bb673", 2.5) + `<path d="M44 46 l6 -4" stroke="#ffd23f" stroke-width="3"/>`; break;
    case "boulder": s = SV.circ(32, 32, 24, "#a8683a", 3) + `<path d="M10 28 Q32 40 54 28 M32 8 L32 56" stroke="#5e3519" stroke-width="3" fill="none"/>`; break;
    case "sandbomb": s = SV.circ(32, 36, 20, "#e9c46a", 3) + SV.rect(26, 10, 12, 10, 3, "#8a6a3a", 2.5) + `<path d="M32 10 Q38 2 44 6" stroke="#ff8a1c" stroke-width="3" fill="none"/>`; break;
    case "paint": s = SV.circ(32, 36, 20, "#38e05a", 3) + SV.path("M18 30 Q32 20 46 30", "none", 3) + SV.circ(26, 30, 4, "#fff", 0); break;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">${s}</svg>`;
}

/* ---- build all world sprites for one biome (async) ---- */
const worldCache = {};
async function buildWorldSprites(biome) {
  if (worldCache[biome.id]) return worldCache[biome.id];
  const set = BIOME_SCENERY[biome.id];
  const ids = new Set(["ramp", "crate", "repair", "arch", "startgate", "crowd", "banner", "log", "vent"]);
  set.near.forEach(([id]) => ids.add(id));
  set.far.forEach((id) => ids.add(id));
  set.obstacles.forEach((id) => ids.add(id));
  set.special.forEach((id) => ids.add(id));
  ["lantern", "crystal", "reeds"].forEach((id) => ids.add(id));
  if (set.zones) Object.values(set.zones).forEach((z) => z.near.forEach(([id]) => ids.add(id)));
  const kit = biomeKit(biome);
  const out = { sprites: {}, items: {} };
  await Promise.all([...ids].map((id) => [id, W[id]]).concat(Object.entries(kit)).map(async ([id, d]) => {
    const scale = d.ww > 9000 ? 0.6 : 1;            // giant tunnel mouths don't need full resolution
    const c = await svgToCanvas(SV.wrap(d.w, d.h, d.svg()), d.w * scale, d.h * scale);
    out.sprites[id] = { c, ww: d.ww, wh: d.ww * d.h / d.w, solid: d.solid, obstacle: d.obstacle, glow: d.glow, id };
  }));
  await Promise.all(Object.keys(ITEMS).map(async (id) => { out.items[id] = await svgToCanvas(itemSVG(id), 64, 64); }));
  out.far = await svgToCanvas(bgSVG(biome, "far"), 2048, 420);
  out.near = await svgToCanvas(bgSVG(biome, "near"), 2048, 300);
  worldCache[biome.id] = out;
  return out;
}
