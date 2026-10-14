/* Art for the seasonal and World Tour themes (themes.js): scenery sprites, BIOME_SCENERY sets, tunnel styles,
   background extras and throwables. Built after art_world.js, so it uses def(), W, SV, rock(), conifer(). */

const THEME_ITEMS = {};            // throwable art for new items: id -> () => svg body (64x64)
const BG_EXTRA = {};               // background silhouettes: name -> (layer, W, H, R) => svg
const KIT_EXTRA = {};              // tunnel styles: name -> (biome) => { portal_<name>: {...}, rib_<name>: {...} }

// Tunnel mouth (1600x900) and rib (560x400) share these openings with the stock kit, so any facade can frame the road.
const PORTAL_HOLE = "M592 900 L592 676 Q592 572 800 562 Q1008 572 1008 676 L1008 900 Z";
const RIB_HOLE = "M76 400 L76 176 Q76 74 280 64 Q484 74 484 176 L484 400 Z";

/* ======================= HALLOWEEN ======================= */
function jackFace(cx, cy, r, glow) {
  const e = r * 0.28;
  return `<path d="M${cx - r * 0.5} ${cy - r * 0.12} l${e} ${-e * 0.9} l${e * 0.6} ${e * 1.05}Z M${cx + r * 0.5} ${cy - r * 0.12} l${-e} ${-e * 0.9} l${-e * 0.6} ${e * 1.05}Z M${cx - r * 0.12} ${cy + r * 0.05} l${r * 0.12} ${-r * 0.18} l${r * 0.12} ${r * 0.18}Z" fill="${glow}"/>` +
    `<path d="M${cx - r * 0.6} ${cy + r * 0.28} Q${cx} ${cy + r * 0.72} ${cx + r * 0.6} ${cy + r * 0.28} L${cx + r * 0.38} ${cy + r * 0.42} L${cx + r * 0.24} ${cy + r * 0.3} L${cx + r * 0.08} ${cy + r * 0.46} L${cx - r * 0.08} ${cy + r * 0.32} L${cx - r * 0.24} ${cy + r * 0.48} L${cx - r * 0.4} ${cy + r * 0.36}Z" fill="${glow}"/>`;
}
function pumpkinSVG(cx, cy, rx, ry, face) {
  let s = SV.ell(cx - rx * 0.42, cy, rx * 0.55, ry, "#e86f12", 3) + SV.ell(cx + rx * 0.42, cy, rx * 0.55, ry, "#e86f12", 3) + SV.ell(cx, cy, rx * 0.6, ry * 1.02, "#ff8a1c", 3);
  s += SV.path(`M${cx - 4} ${cy - ry * 0.92} Q${cx - 6} ${cy - ry * 1.35} ${cx + 8} ${cy - ry * 1.45} L${cx + 10} ${cy - ry * 1.25} Q${cx + 2} ${cy - ry * 1.2} ${cx + 5} ${cy - ry * 0.92}Z`, "#4f7a2a", 2.5);
  if (face) s += jackFace(cx, cy, rx * 0.95, "#ffe27a");
  return s;
}
def("pumpkin", 150, 120, 640, () => pumpkinSVG(75, 70, 66, 44, true), { obstacle: "small", glow: "#ffb13b" });
def("pumpkins", 260, 140, 1300, () => pumpkinSVG(70, 92, 56, 38, true) + pumpkinSVG(170, 100, 44, 30, false) + pumpkinSVG(218, 66, 30, 22, true));
def("gravestone", 140, 170, 640, () => SV.path("M18 166 L18 70 Q18 14 70 14 Q122 14 122 70 L122 166Z", "#8a8698", 3) +
  `<path d="M40 70 L100 70 M40 92 L100 92 M40 114 L84 114" stroke="#5d5a6b" stroke-width="5" stroke-linecap="round"/><text x="70" y="58" text-anchor="middle" font-family="${FONT}" font-weight="900" font-size="22" fill="#5d5a6b">RIP</text>` +
  `<path d="M22 150 Q50 136 70 150 Q96 140 120 152 L122 166 L18 166Z" fill="#33401f"/>`, { solid: 1, obstacle: "rock" });
def("gravecross", 120, 190, 540, () => SV.rect(48, 20, 24, 166, 4, "#7d7a8c", 3) + SV.rect(16, 56, 88, 24, 4, "#7d7a8c", 3) + `<path d="M30 178 Q60 162 92 178 L92 188 L30 188Z" fill="#33401f"/>`, { solid: 1 });
def("spookytree", 260, 420, 1900, () => {
  const c = "#1a1222";
  let s = SV.path("M112 418 Q120 300 104 220 Q98 170 120 120 L138 124 Q122 180 134 230 Q150 320 150 418Z", c, 3);
  s += SV.poly([[120, 150], [70, 96], [40, 100], [18, 70]], 10, c) + SV.poly([[128, 130], [170, 70], [210, 66], [236, 30]], 10, c);
  s += SV.poly([[122, 210], [70, 190], [46, 150]], 8, c) + SV.poly([[134, 200], [190, 170], [222, 182]], 8, c) + SV.poly([[126, 124], [118, 60], [132, 20]], 8, c);
  s += SV.poly([[70, 96], [66, 60]], 5, c) + SV.poly([[170, 70], [160, 40]], 5, c);
  s += SV.ell(122, 286, 12, 16, "#ffd36b", 2);                    // a glowing knot-hole
  return s;
}, { solid: 1 });
def("scarecrow", 200, 300, 1100, () => SV.rect(94, 60, 12, 236, 3, "#6b4423", 3) + SV.rect(20, 100, 160, 12, 3, "#6b4423", 3) +
  SV.path("M60 104 L140 104 L150 210 L50 210Z", "#a8452c", 3) + `<path d="M76 120 L124 120 M70 150 L130 150 M64 180 L136 180" stroke="#7a2f1c" stroke-width="4"/>` +
  SV.path("M40 104 L28 140 L50 128 L60 104Z M160 104 L172 140 L150 128 L140 104Z", "#e8c45a", 2.5) +
  SV.circ(100, 70, 30, "#e9d39a", 3) + SV.path("M54 54 L146 54 L120 40 L112 4 L88 4 L80 40Z", "#3a2a24", 3) + SV.circ(90, 68, 5, OL, 0) + SV.circ(110, 68, 5, OL, 0) + `<path d="M86 84 Q100 94 114 84" stroke="${OL}" stroke-width="3" fill="none"/>`, { solid: 1 });
def("haybale", 200, 120, 1000, () => SV.rect(10, 20, 180, 96, 14, "#e2b64f", 3) + `<path d="M10 52 L190 52 M10 84 L190 84 M60 20 L60 116 M140 20 L140 116" stroke="#b38a2e" stroke-width="4"/>` + pumpkinSVG(150, 18, 26, 18, true), { solid: 1 });
def("cornstalk", 120, 260, 700, () => {
  let s = "";
  for (let i = 0; i < 3; i++) { const x = 30 + i * 30; s += `<path d="M${x} 258 Q${x + 6} 140 ${x - 4} 20" stroke="#b8963c" stroke-width="7" fill="none" stroke-linecap="round"/>`; s += SV.path(`M${x} ${150 - i * 20} Q${x + 40} ${130 - i * 20} ${x + 46} ${96 - i * 20} Q${x + 20} ${126 - i * 20} ${x} ${140 - i * 20}Z`, "#c9a648", 2); s += SV.path(`M${x} ${200 - i * 16} Q${x - 36} ${180 - i * 16} ${x - 40} ${150 - i * 16} Q${x - 16} ${178 - i * 16} ${x} ${190 - i * 16}Z`, "#b8963c", 2); }
  return s;
});
def("ironfence", 300, 150, 1800, () => {
  let s = SV.rect(6, 40, 288, 10, 2, "#2a2333", 2.5) + SV.rect(6, 110, 288, 10, 2, "#2a2333", 2.5);
  for (let x = 16; x < 296; x += 28) s += SV.rect(x - 4, 20, 8, 128, 2, "#2a2333", 2) + SV.path(`M${x - 8} 24 L${x} 6 L${x + 8} 24Z`, "#2a2333", 2);
  return s;
}, { solid: 1 });
def("crypt", 280, 260, 2300, () => SV.rect(30, 90, 220, 166, 4, "#6a6578", 3) + SV.path("M14 98 L140 20 L266 98Z", "#55506a", 3) +
  SV.path("M104 256 L104 160 Q140 124 176 160 L176 256Z", "#1a1222", 3) + SV.rect(50, 130, 30, 40, 3, "#ffd36b", 2.5) + SV.rect(200, 130, 30, 40, 3, "#ffd36b", 2.5) +
  `<path d="M140 30 L140 70 M126 46 L154 46" stroke="#3a3548" stroke-width="7" stroke-linecap="round"/>`, { solid: 1, glow: "#ffd36b" });
def("cauldron", 180, 150, 900, () => SV.path("M30 60 Q20 140 90 144 Q160 140 150 60Z", "#26202e", 3) + SV.ell(90, 60, 66, 16, "#3a3344", 3) + SV.ell(90, 58, 54, 11, "#5bff7a", 0) +
  SV.circ(70, 40, 9, "#8affa0", 2) + SV.circ(104, 30, 6, "#8affa0", 2) + `<path d="M40 148 L30 150 M140 148 L150 150" stroke="${OL}" stroke-width="6"/>`, { solid: 1, glow: "#5bff7a" });
// Ghost: drifts across the trail (a mover). Touching one doesn't crash you: it spooks you blind for a moment.
def("ghost", 170, 210, 820, () => `<g opacity=".82">` + SV.path("M18 200 L18 84 Q18 10 85 10 Q152 10 152 84 L152 200 L130 180 L108 202 L85 180 L62 202 L40 180Z", "#f1eefc", 3) + `</g>` +
  SV.ell(62, 82, 12, 18, OL, 0) + SV.ell(108, 82, 12, 18, OL, 0) + SV.ell(85, 128, 16, 20, OL, 0) +
  SV.path("M18 110 Q-6 120 4 140 Q14 126 22 124Z M152 110 Q176 120 166 140 Q156 126 148 124Z", "#f1eefc", 2.5), { obstacle: "ghost", glow: "#cfc6ff" });

THEME_ITEMS.pumpkin = () => pumpkinSVG(32, 36, 26, 20, true);

KIT_EXTRA.mansion = () => ({
  portal_mansion: { w: 1600, h: 900, ww: 16000, svg: () => {
    // the haunted house you ride straight into: gabled roof, a tower, lit windows; the road goes in through the door
    let s = `<path fill-rule="evenodd" d="M120 900 L120 380 L800 120 L1480 380 L1480 900 Z ${PORTAL_HOLE}" fill="#3a3048" stroke="${OL}" stroke-width="4"/>` + SV.path("M60 400 L800 70 L1540 400 L1480 400 L800 130 L120 400Z", "#231c2e", 4);
    s += SV.path("M1150 420 L1150 140 L1250 40 L1350 140 L1350 420Z", "#3a3048", 4) + SV.path("M1130 150 L1250 20 L1370 150Z", "#231c2e", 4) + SV.rect(1215, 170, 70, 110, 30, "#ffd36b", 3);
    for (const [x, y] of [[230, 500], [400, 500], [1100, 500], [1270, 500], [300, 700], [1300, 700]]) s += SV.rect(x, y, 110, 140, 6, "#ffd36b", 4) + `<path d="M${x + 55} ${y} L${x + 55} ${y + 140} M${x} ${y + 70} L${x + 110} ${y + 70}" stroke="#231c2e" stroke-width="10"/>`;
    s += SV.ell(800, 300, 80, 80, "#ffd36b", 4) + `<path d="M800 220 L800 380 M720 300 L880 300" stroke="#231c2e" stroke-width="10"/>`;
    s += `<path fill-rule="evenodd" d="M520 900 L520 640 Q520 520 800 506 Q1080 520 1080 640 L1080 900 Z ${PORTAL_HOLE}" fill="#5a3a2a" stroke="${OL}" stroke-width="4"/>`;
    s += `<path d="M140 380 Q300 420 360 520 M1460 380 Q1300 430 1250 520" stroke="#cfc6e8" stroke-width="3" fill="none" opacity=".6"/>`;   // cobwebs
    return s;
  } },
  rib_mansion: { w: 560, h: 400, ww: 5600, svg: () => {
    // inside: a wallpapered hall with picture frames, candles and cobwebs
    let s = `<path fill-rule="evenodd" d="M0 400 L0 0 L560 0 L560 400 Z ${RIB_HOLE}" fill="#4a2f45" stroke="${OL}" stroke-width="3"/>`;
    for (let x = 14; x < 560; x += 36) s += `<path d="M${x} 0 L${x} 400" stroke="#5c3a55" stroke-width="8" opacity=".8"/>`;
    s += `<path fill-rule="evenodd" d="M0 400 L0 0 L560 0 L560 400 Z ${RIB_HOLE}" fill="none" stroke="${OL}" stroke-width="3"/>`;
    s += `<path d="M76 400 L76 176 Q76 74 280 64 Q484 74 484 176 L484 400" stroke="#8a5a32" stroke-width="14" fill="none"/>`;
    s += SV.rect(8, 150, 54, 70, 4, "#c9a227", 3) + SV.rect(16, 158, 38, 54, 2, "#2a1f33", 0) + SV.circ(35, 178, 8, "#f1eefc", 0);
    s += SV.rect(498, 150, 54, 70, 4, "#c9a227", 3) + SV.rect(506, 158, 38, 54, 2, "#2a1f33", 0);
    s += SV.rect(26, 260, 12, 40, 2, "#f3ead6", 2) + `<path d="M32 248 q-6 8 0 12 q6 -4 0 -12Z" fill="#ffd36b"/>` + SV.rect(522, 260, 12, 40, 2, "#f3ead6", 2) + `<path d="M528 248 q-6 8 0 12 q6 -4 0 -12Z" fill="#ffd36b"/>`;
    s += `<path d="M0 0 Q60 30 90 90 M0 40 Q40 50 60 80 M560 0 Q500 30 470 90 M560 40 Q520 50 500 80" stroke="#cfc6e8" stroke-width="2.5" fill="none" opacity=".7"/>`;
    return s;
  } },
});

BG_EXTRA.castle = (layer, Wd, H, R) => {
  if (layer !== "far") return "";
  // a crooked castle on a hill, far away under the moon
  let s = "";
  for (const x0 of [380, 1500]) {
    s += `<path d="M${x0 - 220} ${H} Q${x0} ${H - 230} ${x0 + 240} ${H}Z" fill="#1d1430"/>`;
    s += `<path d="M${x0 - 70} ${H - 150} L${x0 - 70} ${H - 250} L${x0 - 90} ${H - 250} L${x0 - 60} ${H - 300} L${x0 - 30} ${H - 250} L${x0 - 50} ${H - 250} L${x0 - 50} ${H - 200} L${x0 + 40} ${H - 200} L${x0 + 40} ${H - 280} L${x0 + 20} ${H - 280} L${x0 + 55} ${H - 340} L${x0 + 90} ${H - 280} L${x0 + 70} ${H - 280} L${x0 + 70} ${H - 150}Z" fill="#150e22"/>`;
    s += `<rect x="${x0 + 48}" y="${H - 262}" width="10" height="14" fill="#ffd36b"/><rect x="${x0 - 64}" y="${H - 236}" width="8" height="12" fill="#ffd36b"/><rect x="${x0 - 10}" y="${H - 184}" width="10" height="12" fill="#ffd36b"/>`;
  }
  return s;
};

BIOME_SCENERY.halloween = {
  near: [["spookytree", 3], ["pumpkins", 3], ["gravestone", 2], ["haybale", 1], ["scarecrow", 0.6]], far: ["spookytree", "spookytree"],
  obstacles: ["gravestone", "pumpkin"], special: ["banner"],
  zones: {
    patch: { near: [["pumpkins", 5], ["haybale", 2], ["scarecrow", 1], ["cornstalk", 3]], dens: 0.7 },
    graveyard: { near: [["gravestone", 4], ["gravecross", 3], ["spookytree", 2], ["ironfence", 2], ["crypt", 0.6]], dens: 0.75 },
    woods: { near: [["spookytree", 5], ["mushroom", 1], ["gravestone", 0.5], ["pumpkins", 0.6]], dens: 0.8 },
    swamp: { near: [["reeds", 3], ["spookytree", 2], ["cauldron", 0.6]], dens: 0.55 },
    manor: { near: [["ironfence", 3], ["lantern", 2], ["pumpkins", 2]], dens: 0.65 },
  },
};

/* ======================= NATURE TRAIL REWORK (each of the 12 trails gets its own set piece and hazard) ======================= */
// generic big jumps (full-width launch ramps)
function bigRampSVG(w, top, side, stripe) {
  let s = SV.path(`M10 146 L${w * 0.16} 24 L${w * 0.84} 24 L${w - 10} 146Z`, side, 3);
  for (let i = 1; i < 6; i++) s += `<path d="M${10 + i * w * 0.026} ${146 - i * 20.3} L${w - 10 - i * w * 0.026} ${146 - i * 20.3}" stroke="${shade(side, -0.25)}" stroke-width="3"/>`;
  s += SV.rect(w * 0.15, 14, w * 0.7, 14, 5, top, 3);
  if (stripe) for (let x = w * 0.18; x < w * 0.82; x += 60) s += `<rect x="${x}" y="15" width="30" height="12" fill="${stripe}"/>`;
  return s;
}
def("bigramp", 640, 150, 4400, () => bigRampSVG(640, "#ffd23f", "#c8924f", OL));
def("sandramp", 640, 150, 4400, () => bigRampSVG(640, "#f6dca0", "#e0a865", null) + `<path d="M60 140 Q320 70 580 140" stroke="#f2cf91" stroke-width="10" fill="none" opacity=".7"/>`);
def("gapramp", 440, 150, 2900, () => bigRampSVG(440, "#bfe9ff", "#e8f0fa", "#2b7de9"));
def("skijump", 640, 150, 4400, () => bigRampSVG(640, "#ffffff", "#dbe6f4", "#e2433b") + `<path d="M120 60 L520 60" stroke="#e2433b" stroke-width="6"/>`);
def("stoneramp", 640, 150, 4400, () => bigRampSVG(640, "#c9c2a8", "#8f8a78", null));

// Fernline: rolling logs and hollow giant redwoods you ride through
def("rlog", 300, 120, 1400, () => {
  let s = SV.rect(40, 30, 220, 80, 38, "#7b4a2a", 3);
  for (let i = 0; i < 4; i++) s += `<path d="M${80 + i * 45} 36 Q${96 + i * 45} 70 ${82 + i * 45} 104" stroke="#5e3519" stroke-width="3" fill="none"/>`;
  s += SV.ell(42, 70, 30, 40, "#d9a86a", 3) + `<ellipse cx="42" cy="70" rx="16" ry="22" fill="none" stroke="#9b6a3a" stroke-width="2.5"/><ellipse cx="42" cy="70" rx="6" ry="8" fill="none" stroke="#9b6a3a" stroke-width="2.5"/>`;
  return s;
}, { obstacle: "log" });
KIT_EXTRA.redwood = () => ({
  portal_redwood: { w: 1600, h: 900, ww: 16000, svg: () => {
    let s = `<path fill-rule="evenodd" d="M240 900 Q200 500 360 0 L1240 0 Q1400 500 1360 900 Z ${PORTAL_HOLE}" fill="#8a3f24" stroke="${OL}" stroke-width="4"/>`;
    for (let i = 0; i < 12; i++) { const x = 300 + i * 92; s += `<path d="M${x} 0 Q${x + (i % 2 ? 30 : -30)} 450 ${x + (x < 800 ? -40 : 40)} 900" stroke="#5e2a17" stroke-width="8" fill="none" opacity=".75"/>`; }
    s += `<path fill-rule="evenodd" d="M540 900 L540 650 Q540 500 800 486 Q1060 500 1060 650 L1060 900 Z ${PORTAL_HOLE}" fill="#d9a86a" stroke="${OL}" stroke-width="4"/>`;
    s += `<path d="M566 900 L566 664 Q566 524 800 512 Q1034 524 1034 664 L1034 900" stroke="#9b6a3a" stroke-width="5" fill="none"/>`;
    s += SV.path("M200 900 Q260 820 380 860 Q300 900 200 900Z M1400 900 Q1340 820 1220 860 Q1300 900 1400 900Z", "#5aa046", 3);
    s += SV.ell(500, 260, 120, 60, "#3f8a32", 3) + SV.ell(1120, 340, 110, 56, "#3f8a32", 3);
    return s;
  } },
  rib_redwood: { w: 560, h: 400, ww: 5600, svg: () => {
    let s = `<path fill-rule="evenodd" d="M0 400 L0 0 L560 0 L560 400 Z ${RIB_HOLE}" fill="#9b5a33" stroke="${OL}" stroke-width="3"/>`;
    for (let i = 0; i < 4; i++) s += `<path d="M${76 - i * 16} 400 L${76 - i * 16} ${176 - i * 6} Q${76 - i * 16} ${74 - i * 18} 280 ${64 - i * 16} Q${484 + i * 16} ${74 - i * 18} ${484 + i * 16} ${176 - i * 6} L${484 + i * 16} 400" stroke="${i % 2 ? "#c98a55" : "#7a3f22"}" stroke-width="7" fill="none"/>`;
    return s;
  } },
});
// Giant's Staircase: rope bridge rails and falling branches
def("rail_rope", 60, 130, 320, () => SV.rect(22, 30, 16, 98, 4, "#7b4a2a", 2.5) + `<path d="M-30 40 Q30 56 90 40 M-30 72 Q30 88 90 72" stroke="#d9b07a" stroke-width="5" fill="none"/>`);
def("branch", 340, 150, 1500, () => SV.poly([[20, 120], [140, 92], [320, 70]], 16, "#6b4423") + SV.poly([[140, 92], [200, 40]], 9, "#6b4423") +
  SV.ell(220, 34, 50, 26, "#3f8a32", 3) + SV.ell(300, 60, 40, 24, "#3f8a32", 3) + SV.ell(110, 70, 34, 20, "#4f9b3c", 3), { solid: 1, obstacle: "rock" });

// Fortress Drop: desert fort town, market, camels
KIT_EXTRA.fort = () => ({
  wall_fort: { w: 300, h: 420, ww: 3400, solid: 1, svg: () => {
    let s = SV.path("M0 420 L0 60 L40 60 L40 30 L80 30 L80 60 L120 60 L120 30 L160 30 L160 60 L200 60 L200 30 L240 30 L240 60 L300 60 L300 420Z", "#d9a26a", 3);
    for (let y = 100; y < 420; y += 40) s += `<path d="M0 ${y} L300 ${y}" stroke="#b9814a" stroke-width="3"/>` + `<path d="M${(y / 40) % 2 ? 60 : 20} ${y - 40} L${(y / 40) % 2 ? 60 : 20} ${y} M${(y / 40) % 2 ? 180 : 140} ${y - 40} L${(y / 40) % 2 ? 180 : 140} ${y} M${(y / 40) % 2 ? 280 : 250} ${y - 40} L${(y / 40) % 2 ? 280 : 250} ${y}" stroke="#b9814a" stroke-width="3"/>`;
    s += SV.path("M110 220 L110 170 Q130 146 150 170 L150 220Z", "#3a2a24", 2.5) + `<path d="M120 300 Q150 280 180 300" stroke="#c4562b" stroke-width="6" fill="none"/>`;
    return s;
  } },
});
def("fortgate", 1100, 620, 6600, () => {
  let s = `<path fill-rule="evenodd" d="M0 620 L0 90 L60 90 L60 50 L130 50 L130 90 L200 90 L200 50 L270 50 L270 90 L830 90 L830 50 L900 50 L900 90 L970 90 L970 50 L1040 50 L1040 90 L1100 90 L1100 620 Z M230 620 L230 330 Q230 170 550 156 Q870 170 870 330 L870 620 Z" fill="#d9a26a" stroke="${OL}" stroke-width="4"/>`;
  s += `<path d="M250 620 L250 336 Q250 192 550 178 Q850 192 850 336 L850 620" stroke="#c4562b" stroke-width="16" fill="none"/>`;
  s += SV.ell(550, 120, 70, 40, "#e8862f", 3) + SV.rect(70, 200, 70, 90, 30, "#3a2a24", 3) + SV.rect(960, 200, 70, 90, 30, "#3a2a24", 3);
  s += `<path d="M300 120 L800 120" stroke="#c4562b" stroke-width="8" stroke-dasharray="20 14"/>`;
  return s;
});
def("fortower", 220, 460, 1900, () => SV.rect(40, 120, 140, 336, 6, "#d9a26a", 3) + SV.path("M20 130 L110 40 L200 130Z", "#c4562b", 3) + SV.rect(104, 4, 8, 40, 2, "#6b4423", 2) + SV.path("M112 6 L150 16 L112 28Z", "#e2433b", 2) +
  SV.rect(90, 180, 40, 60, 18, "#3a2a24", 3) + SV.rect(90, 300, 40, 60, 18, "#3a2a24", 3) + `<path d="M40 260 L180 260 M40 400 L180 400" stroke="#b9814a" stroke-width="4"/>`, { solid: 1 });
def("stall", 280, 230, 1900, () => SV.rect(30, 120, 220, 106, 4, "#c8924f", 3) + SV.path("M10 120 L40 40 L240 40 L270 120Z", "#e2433b", 3) +
  `<path d="M60 40 L50 120 M110 40 L105 120 M170 40 L175 120 M220 40 L230 120" stroke="#fff3d6" stroke-width="12"/>` +
  SV.circ(80, 110, 14, "#ff8a1c", 2.5) + SV.circ(110, 112, 12, "#ffd23f", 2.5) + SV.circ(160, 110, 14, "#2bb673", 2.5) + SV.circ(196, 112, 12, "#e2433b", 2.5), { solid: 1 });
def("cart", 220, 150, 1100, () => SV.rect(20, 50, 180, 60, 6, "#a8743f", 3) + SV.circ(60, 118, 26, "#6b4423", 3) + SV.circ(160, 118, 26, "#6b4423", 3) +
  SV.circ(60, 46, 16, "#ff8a1c", 2) + SV.circ(94, 42, 16, "#ffd23f", 2) + SV.circ(128, 46, 16, "#e2433b", 2) + SV.circ(160, 42, 16, "#2bb673", 2), { solid: 1, obstacle: "rock" });
def("pots", 180, 110, 800, () => SV.path("M20 106 Q6 60 40 40 L60 40 Q94 60 80 106Z", "#c4562b", 3) + SV.path("M90 106 Q80 70 106 56 L124 56 Q150 70 140 106Z", "#d9772f", 3) + SV.path("M140 106 Q132 80 150 70 L162 70 Q178 80 172 106Z", "#c4562b", 3), { obstacle: "small" });
def("rug", 200, 220, 1100, () => SV.rect(20, 10, 8, 206, 2, "#6b4423", 2.5) + SV.rect(172, 10, 8, 206, 2, "#6b4423", 2.5) + SV.rect(14, 10, 172, 10, 2, "#6b4423", 2.5) +
  SV.rect(36, 22, 128, 150, 4, "#b3122f", 3) + `<rect x="50" y="36" width="100" height="122" fill="none" stroke="#ffd23f" stroke-width="5"/><path d="M100 50 L130 97 L100 144 L70 97Z" fill="#2b4ab3"/>`);
def("camel", 300, 260, 1600, () => {
  let s = "";
  for (const x of [80, 110, 200, 228]) s += SV.rect(x, 170, 16, 84, 6, "#c99560", 2.5);
  s += SV.path("M60 180 Q50 120 100 112 Q120 60 150 100 Q170 54 210 104 Q250 110 246 170 Q150 200 60 180Z", "#d9a86a", 3);
  s += SV.path("M240 140 Q262 120 262 70 L286 60 Q300 70 294 84 L276 86 Q278 132 252 168Z", "#d9a86a", 3) + SV.circ(284, 70, 3, OL, 0);
  s += SV.path("M110 120 L220 120 L214 150 L116 150Z", "#e2433b", 2.5) + `<path d="M120 135 L210 135" stroke="#ffd23f" stroke-width="4" stroke-dasharray="8 6"/>`;
  return s;
}, { solid: 1 });
// Sandstorm Alley: giant dunes
def("dune", 520, 170, 5200, () => SV.path("M0 168 Q140 20 300 60 Q420 90 520 168Z", "#efc07c", 3) + `<path d="M140 60 Q240 50 300 60 Q360 80 420 120" stroke="#f8dba6" stroke-width="8" fill="none" stroke-linecap="round"/><path d="M300 60 Q420 90 520 168 L300 168Z" fill="#d9a05e" opacity=".55"/>`);

// Frostbite Run: blue ice cave; Avalanche!: rolling snowballs
KIT_EXTRA.icecave = () => ({
  portal_icecave: { w: 1600, h: 900, ww: 16000, svg: () => {
    let s = `<path fill-rule="evenodd" d="M0 900 L0 420 L180 260 L330 330 L520 120 L700 220 L860 40 L1040 200 L1220 110 L1400 300 L1600 260 L1600 900 Z ${PORTAL_HOLE}" fill="#9fd6f2" stroke="${OL}" stroke-width="4"/>`;
    s += `<path d="M520 120 L560 600 M860 40 L840 520 M1220 110 L1160 640 M180 260 L260 760 M1400 300 L1380 820" stroke="#e6f7ff" stroke-width="10" opacity=".8"/>`;
    s += `<path fill-rule="evenodd" d="M560 900 L560 660 Q560 530 800 518 Q1040 530 1040 660 L1040 900 Z ${PORTAL_HOLE}" fill="#5aa9d8" stroke="${OL}" stroke-width="3"/>`;
    s += SV.path("M0 420 L180 260 L330 330 L520 120 L700 220 L860 40 L1040 200 L1220 110 L1400 300 L1600 260 L1600 300 Q1400 340 1220 150 Q1040 240 860 80 Q700 260 520 160 Q330 370 180 300 Q80 400 0 460Z", "#ffffff", 3);
    for (const x of [640, 760, 900, 980]) s += SV.path(`M${x} 540 L${x + 14} 600 L${x + 28} 540Z`, "#e6f7ff", 2);       // icicles over the mouth
    return s;
  } },
  rib_icecave: { w: 560, h: 400, ww: 5600, svg: () => {
    let s = `<path fill-rule="evenodd" d="M0 400 L0 0 L560 0 L560 400 Z ${RIB_HOLE}" fill="#7cc3e8" stroke="${OL}" stroke-width="3" opacity=".9"/>`;
    s += `<path d="M76 400 L76 176 Q76 74 280 64 Q484 74 484 176 L484 400" stroke="#d8f3ff" stroke-width="9" fill="none" opacity=".8"/>`;
    for (const [x, h] of [[120, 70], [200, 46], [300, 60], [400, 50]]) s += SV.path(`M${x} ${70 - h * 0.2} L${x + 12} ${70 + h} L${x + 24} ${70 - h * 0.2}Z`, "#e6f7ff", 2);
    return s;
  }, glow: null },
});
def("snowroll", 200, 200, 1100, () => SV.circ(100, 104, 90, "#f4f9ff", 3) + `<path d="M40 80 Q90 50 140 70 M30 130 Q100 110 170 140" stroke="#bcd6f0" stroke-width="6" fill="none"/>` + SV.rect(80, 16, 24, 30, 4, "#6b4423", 2.5), { obstacle: "log" });

// Waterfall Gauntlet: temple ruins hall, swinging vines
KIT_EXTRA.temple = () => ({
  portal_temple: { w: 1600, h: 900, ww: 16000, svg: () => {
    let s = `<path fill-rule="evenodd" d="M200 900 L200 420 L340 420 L340 300 L480 300 L480 180 L640 180 L640 60 L960 60 L960 180 L1120 180 L1120 300 L1260 300 L1260 420 L1400 420 L1400 900 Z ${PORTAL_HOLE}" fill="#8f8a78" stroke="${OL}" stroke-width="4"/>`;
    for (const y of [180, 300, 420]) s += `<path d="M200 ${y + 40} L1400 ${y + 40}" stroke="#6f6a5c" stroke-width="8"/>`;
    for (let x = 680; x < 960; x += 70) s += SV.circ(x + 20, 120, 22, "#a8a28e", 3);
    s += `<path fill-rule="evenodd" d="M548 900 L548 656 Q548 516 800 504 Q1052 516 1052 656 L1052 900 Z ${PORTAL_HOLE}" fill="#a8a28e" stroke="${OL}" stroke-width="4"/>`;
    s += `<path d="M260 420 Q300 620 260 900 M1340 420 Q1300 600 1340 900 M640 180 Q600 300 660 420" stroke="#3c8a3c" stroke-width="18" fill="none" stroke-linecap="round"/>`;
    s += SV.ell(300, 410, 70, 30, "#3c9a3a", 3) + SV.ell(1310, 400, 80, 30, "#3c9a3a", 3) + SV.ell(800, 50, 120, 36, "#3c9a3a", 3);
    return s;
  } },
  rib_temple: { w: 560, h: 400, ww: 5600, svg: () => {
    let s = `<path fill-rule="evenodd" d="M0 400 L0 0 L560 0 L560 400 Z ${RIB_HOLE}" fill="#7a7564" stroke="${OL}" stroke-width="3"/>`;
    s += SV.rect(30, 100, 46, 300, 4, "#a8a28e", 3) + SV.rect(484, 100, 46, 300, 4, "#a8a28e", 3);
    for (const y of [140, 220, 300]) s += `<path d="M36 ${y} L70 ${y} M490 ${y} L524 ${y}" stroke="#6f6a5c" stroke-width="5"/>` + SV.circ(53, y + 30, 8, "#ffd23f", 2) + SV.circ(507, y + 30, 8, "#ffd23f", 2);
    s += `<path d="M100 0 Q120 60 96 120 M460 0 Q440 70 470 130" stroke="#3c8a3c" stroke-width="9" fill="none" stroke-linecap="round"/>`;
    return s;
  } },
});
def("vine", 160, 420, 700, () => {
  let s = `<path d="M80 0 Q60 120 84 220 Q100 300 80 380" stroke="#3c7a2a" stroke-width="12" fill="none" stroke-linecap="round"/>`;
  for (let y = 40; y < 380; y += 46) s += SV.path(`M${80 + (y % 92 ? 10 : -10)} ${y} q${y % 92 ? 34 : -34} -6 ${y % 92 ? 44 : -44} 20 q${y % 92 ? -24 : 24} 8 ${y % 92 ? -44 : 44} -20Z`, "#4fae46", 2.5);
  return s;
}, { obstacle: "whack" });
def("ruin", 220, 300, 1300, () => SV.rect(40, 60, 70, 236, 4, "#a8a28e", 3) + SV.rect(30, 40, 90, 26, 4, "#8f8a78", 3) + SV.rect(130, 160, 70, 136, 4, "#a8a28e", 3) + SV.path("M130 160 L150 140 L180 156 L200 140 L200 160Z", "#8f8a78", 2.5) +
  `<path d="M60 100 Q70 180 52 260" stroke="#3c8a3c" stroke-width="10" fill="none" stroke-linecap="round"/>` + SV.ell(80, 44, 50, 18, "#3c9a3a", 2.5), { solid: 1 });

// Geyser Gorge: inside the crater; Ashfall Chute: falling rocks
KIT_EXTRA.crater = () => ({
  portal_crater: { w: 1600, h: 900, ww: 16000, svg: () => {
    let s = `<path fill-rule="evenodd" d="M0 900 L0 500 L200 380 L360 420 L560 240 L800 300 L1040 220 L1240 400 L1420 360 L1600 480 L1600 900 Z ${PORTAL_HOLE}" fill="#2e2626" stroke="${OL}" stroke-width="4"/>`;
    s += `<path d="M200 400 L260 640 L220 860 M560 260 L600 480 M1240 420 L1200 700 L1260 880 M1040 240 L1000 460" stroke="#ff5a1f" stroke-width="10" fill="none" stroke-linecap="round" opacity=".9"/>`;
    s += `<path d="M560 900 L560 670 Q560 540 800 528 Q1040 540 1040 670 L1040 900" stroke="#ff7a1f" stroke-width="14" fill="none" opacity=".85"/>`;
    return s;
  } },
  rib_crater: { w: 560, h: 400, ww: 5600, svg: () => {
    let s = `<path fill-rule="evenodd" d="M0 400 L0 0 L560 0 L560 400 Z ${RIB_HOLE}" fill="#241c1c" stroke="${OL}" stroke-width="3"/>`;
    s += `<path d="M30 60 L56 180 L36 320 M530 80 L504 220 L524 360 M200 20 L230 60 M360 16 L330 56" stroke="#ff5a1f" stroke-width="7" fill="none" stroke-linecap="round"/>`;
    return s;
  } },
});
def("fallrock", 200, 150, 1000, () => rock(200, 150, "#4a3a3a", null) + `<path d="M50 120 L90 80 L130 110" stroke="#ff7a1f" stroke-width="4" fill="none"/>`, { solid: 1, obstacle: "rock" });

// Aurora Pines: reindeer crossing
def("reindeer", 280, 280, 1500, () => {
  let s = "";
  for (const x of [70, 96, 180, 204]) s += SV.rect(x, 170, 14, 100, 5, "#8a5a3a", 2.5);
  s += SV.ell(140, 160, 90, 40, "#9b6a43", 3) + SV.ell(140, 176, 60, 18, "#e8d7b8", 0);
  s += SV.path("M210 140 Q230 100 232 70 L262 66 Q276 80 266 96 L246 100 Q240 130 226 160Z", "#9b6a43", 3) + SV.circ(268, 90, 8, "#e2433b", 2.5) + SV.circ(250, 78, 3, OL, 0);
  s += `<path d="M236 70 L224 30 L210 20 M224 30 L236 14 M250 66 L262 26 L276 16 M262 26 L252 10" stroke="#d9c8a8" stroke-width="6" fill="none" stroke-linecap="round"/>`;
  s += SV.rect(196, 128, 30, 10, 3, "#e2433b", 2) + SV.circ(212, 142, 6, "#ffd23f", 2);
  return s;
}, { solid: 1 });

// extra scenery zones for the reworked trails
Object.assign(BIOME_SCENERY.forest.zones, { giants: { near: [["redwood", 7], ["fern", 3], ["mossrock", 1]], dens: 0.85 }, fog: { near: [["pine", 4], ["fern", 3], ["mossrock", 1.5], ["stump", 1]], dens: 0.7 }, falls: { near: [["waterfall", 2], ["mossrock", 2], ["reeds", 2], ["fern", 2]], dens: 0.5 } });
Object.assign(BIOME_SCENERY.desert.zones, {
  fort: { near: [["fortower", 2], ["adobe", 2], ["palm", 1], ["pots", 1]], dens: 0.6 },
  market: { near: [["stall", 4], ["rug", 2], ["pots", 1.5], ["palm", 1]], dens: 0.8 },
  dunes: { near: [["dune", 5], ["smallcactus", 0.5], ["skull", 0.4]], dens: 0.5 },
});
Object.assign(BIOME_SCENERY.glacier.zones, { crevasse: { near: [["serac", 3], ["iceblock", 2], ["snowrock", 1]], dens: 0.5 } });
Object.assign(BIOME_SCENERY.ghats.zones, { ruins: { near: [["ruin", 4], ["banana", 2], ["palm", 1.5], ["jrock", 1]], dens: 0.75 } });
Object.assign(BIOME_SCENERY.volcano.zones, { crater: { near: [["spire", 3], ["obsidian", 2], ["lavarock", 2]], dens: 0.6 } });
Object.assign(BIOME_SCENERY.tundra.zones, { pines: { near: [["darkpine", 8], ["tsnowrock", 1], ["lantern", 0.4]], dens: 0.9 } });
