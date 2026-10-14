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

/* ======================= WORLD TOUR ======================= */
THEME_ITEMS.snowglobe = () => SV.circ(32, 28, 20, "#bfe9ff", 3) + `<path d="M20 30 L32 16 L44 30Z" fill="#fff"/>` + SV.circ(26, 22, 2, "#fff", 0) + SV.circ(38, 34, 2, "#fff", 0) + SV.rect(16, 44, 32, 14, 4, "#c4562b", 3);

// ---- Valparaíso ----
const CASA = ["#ff5a7a", "#ffd23f", "#2bb6e8", "#6fd36a", "#b35cff", "#ff8a1c", "#38d0c0"];
function casaSVG(w, h, seed) {
  const R = rng(seed);
  let s = "", y = h;
  for (let k = 0; k < 3; k++) {
    const hh = h * (0.26 + R() * 0.08), x = 10 + R() * 20, ww = w - 20 - R() * 30, col = CASA[(R() * CASA.length) | 0];
    s += SV.rect(x, y - hh, ww, hh, 3, col, 3);
    for (let wx = x + 14; wx < x + ww - 24; wx += 34) s += SV.rect(wx, y - hh + 14, 18, 22, 2, "#fff6e0", 2);
    s += SV.rect(x - 4, y - hh - 8, ww + 8, 10, 2, shade(col, -0.25), 2.5);
    y -= hh + 8;
  }
  return s;
}
def("casa", 220, 380, 1700, () => casaSVG(220, 380, 3), { solid: 1 });
def("casa2", 220, 330, 1700, () => casaSVG(220, 330, 11), { solid: 1 });
KIT_EXTRA.casas = () => ({
  wall_casas: { w: 300, h: 420, ww: 3400, solid: 1, svg: () => {
    let s = "";
    const R = rng(5);
    for (let x = 0; x < 300; x += 100) { const col = CASA[(R() * CASA.length) | 0]; s += SV.rect(x, 40 + R() * 40, 100, 400, 0, col, 3); for (let y = 110; y < 400; y += 70) s += SV.rect(x + 22, y, 22, 30, 2, "#fff6e0", 2) + SV.rect(x + 58, y, 22, 30, 2, "#fff6e0", 2); }
    s += `<path d="M20 300 Q80 240 140 300 T260 300" stroke="#ffd23f" stroke-width="14" fill="none" opacity=".85"/><circle cx="210" cy="200" r="34" fill="#ff3d7f" opacity=".8"/>`;   // street murals
    return s;
  } },
});
def("ascensor", 300, 360, 2200, () => `<path d="M10 350 L290 40" stroke="#5a4a3a" stroke-width="14"/><path d="M30 350 L290 62" stroke="#8a7a6a" stroke-width="6"/>` +
  SV.path("M120 170 L210 108 L230 150 L140 214Z", "#e2433b", 3) + SV.rect(150, 140, 16, 16, 2, "#fff6e0", 2) + SV.rect(180, 120, 16, 16, 2, "#fff6e0", 2), { solid: 1 });
def("streetcart", 200, 170, 1000, () => SV.rect(20, 50, 150, 70, 6, "#ffd23f", 3) + SV.path("M14 52 L30 14 L160 14 L176 52Z", "#2b7de9", 3) + `<path d="M50 14 L46 52 M90 14 L90 52 M130 14 L134 52" stroke="#fff" stroke-width="8"/>` +
  SV.circ(50, 130, 22, "#3a3540", 3) + SV.circ(140, 130, 22, "#3a3540", 3) + SV.rect(170, 70, 26, 8, 3, "#6b4423", 2), { solid: 1 });
def("trashcan", 100, 120, 420, () => SV.rect(18, 26, 64, 90, 6, "#2bb673", 3) + SV.rect(12, 16, 76, 14, 4, "#1f8a55", 3) + `<path d="M36 40 L36 104 M50 40 L50 104 M64 40 L64 104" stroke="#1f8a55" stroke-width="4"/>`, { obstacle: "small" });
def("bench", 200, 100, 900, () => SV.rect(10, 30, 180, 16, 4, "#6b4423", 3) + SV.rect(10, 56, 180, 14, 4, "#6b4423", 3) + SV.rect(24, 70, 10, 28, 2, "#3a3540", 2) + SV.rect(166, 70, 10, 28, 2, "#3a3540", 2));
def("containers", 320, 220, 2600, () => SV.rect(10, 120, 300, 96, 4, "#e2433b", 3) + SV.rect(30, 24, 260, 96, 4, "#2b7de9", 3) + `<path d="M30 130 L30 210 M70 130 L70 210 M110 130 L110 210 M150 130 L150 210 M190 130 L190 210 M230 130 L230 210 M270 130 L270 210" stroke="#a32d2d" stroke-width="5"/><path d="M60 34 L60 114 M100 34 L100 114 M140 34 L140 114 M180 34 L180 114 M220 34 L220 114 M260 34 L260 114" stroke="#185fa5" stroke-width="5"/>`, { solid: 1 });
BG_EXTRA.harbor = (layer, Wd, H, R) => {
  if (layer === "far") {
    let s = `<rect x="0" y="${H - 150}" width="${Wd}" height="150" fill="#2b7de9"/>`;
    for (let i = 0; i < 5; i++) { const x = 120 + i * 420 + R() * 80; s += `<path d="M${x} ${H - 110} L${x + 140} ${H - 110} L${x + 120} ${H - 86} L${x + 16} ${H - 86}Z" fill="#e2e6ee"/><rect x="${x + 40}" y="${H - 140}" width="50" height="30" fill="#e2433b"/>`; }
    for (let i = 0; i < 3; i++) { const x = 300 + i * 650; s += `<path d="M${x} ${H - 40} L${x} ${H - 230} L${x + 160} ${H - 230} M${x} ${H - 200} L${x + 120} ${H - 230}" stroke="#ff8a1c" stroke-width="10" fill="none"/>`; }
    return s;
  }
  // near: the hills of colourful houses climbing behind
  let s = "";
  for (let x = 0; x < Wd; x += 34) { const h = 60 + R() * 120; s += `<rect x="${x}" y="${H - h}" width="34" height="${h}" fill="${CASA[(R() * CASA.length) | 0]}" opacity=".9"/>`; }
  return s;
};

// ---- Great Wall ----
def("rail_battlement", 90, 170, 520, () => SV.rect(6, 40, 78, 128, 2, "#9e927c", 3) + SV.rect(6, 6, 30, 40, 2, "#a89c86", 3) + SV.rect(54, 6, 30, 40, 2, "#a89c86", 3) + `<path d="M6 90 L84 90 M6 130 L84 130 M44 46 L44 90 M24 90 L24 130 M64 90 L64 130" stroke="#7a705e" stroke-width="3"/>`, { solid: 1 });
def("rubble", 180, 90, 820, () => SV.path("M10 86 L30 50 L60 60 L80 30 L110 46 L140 36 L170 86Z", "#9e927c", 3) + SV.rect(40, 60, 30, 18, 2, "#a89c86", 2.5) + SV.rect(100, 54, 34, 20, 2, "#8f8572", 2.5), { obstacle: "small" });
def("mtnpine", 150, 260, 900, () => conifer(150, 260, "#2f6b33", null));
KIT_EXTRA.tower = () => ({
  portal_tower: { w: 1600, h: 900, ww: 16000, svg: () => {
    let s = `<path fill-rule="evenodd" d="M300 900 L300 160 L1300 160 L1300 900 Z ${PORTAL_HOLE}" fill="#a89c86" stroke="${OL}" stroke-width="4"/>`;
    for (let x = 300; x < 1300; x += 125) s += SV.rect(x, 90, 70, 80, 2, "#a89c86", 4);
    for (let y = 230; y < 900; y += 70) s += `<path d="M300 ${y} L1300 ${y}" stroke="#8a7f6a" stroke-width="5"/>`;
    s += SV.rect(390, 300, 90, 140, 40, "#3a3028", 4) + SV.rect(1120, 300, 90, 140, 40, "#3a3028", 4);
    s += SV.circ(800, 280, 46, "#e2433b", 4) + `<path d="M800 230 L800 330" stroke="#ffd23f" stroke-width="8"/>`;
    s += `<path fill-rule="evenodd" d="M560 900 L560 660 Q560 530 800 518 Q1040 530 1040 660 L1040 900 Z ${PORTAL_HOLE}" fill="#8f8572" stroke="${OL}" stroke-width="3"/>`;
    return s;
  } },
  rib_tower: { w: 560, h: 400, ww: 5600, svg: () => `<path fill-rule="evenodd" d="M0 400 L0 0 L560 0 L560 400 Z ${RIB_HOLE}" fill="#8f8572" stroke="${OL}" stroke-width="3"/>` + `<path d="M0 80 L560 80 M0 160 L76 160 M484 160 L560 160 M0 240 L76 240 M484 240 L560 240" stroke="#7a705e" stroke-width="5"/>` },
});
BG_EXTRA.greatwall = (layer, Wd, H, R) => {
  if (layer !== "far") return "";
  // the wall snaking over the ridges, with towers
  let d = "", pts = [];
  for (let x = 0; x <= Wd; x += 32) { const y = H - 150 - 90 * Math.abs(Math.sin(x * 0.004)) - 30 * Math.sin(x * 0.011); pts.push([x, y]); }
  d = "M" + pts.map((p) => p[0] + " " + p[1].toFixed(0)).join(" L");
  let s = `<path d="${d}" stroke="#c9bfa8" stroke-width="12" fill="none" stroke-linejoin="round"/><path d="${d}" stroke="#a89c86" stroke-width="5" fill="none"/>`;
  pts.forEach((p, i) => { if (i % 9 === 4) s += `<rect x="${p[0] - 10}" y="${p[1] - 26}" width="20" height="26" fill="#c9bfa8"/><rect x="${p[0] - 13}" y="${p[1] - 31}" width="26" height="6" fill="#8f8572"/>`; });
  return s;
};

// ---- Swiss Alps ----
def("chalet", 260, 250, 2100, () => {
  let s = SV.rect(30, 110, 200, 136, 4, "#f2ead8", 3) + SV.rect(30, 110, 200, 40, 0, "#9a6a3c", 3);
  s += SV.path("M6 120 L130 30 L254 120Z", "#7a4a2a", 3);
  for (const x of [56, 112, 168]) s += SV.rect(x, 170, 36, 40, 3, "#bfe3ff", 2.5) + SV.rect(x - 6, 168, 8, 44, 1, "#2f6b33", 2) + SV.rect(x + 34, 168, 8, 44, 1, "#2f6b33", 2);
  s += SV.rect(40, 210, 180, 12, 2, "#9a6a3c", 2.5);
  for (let x = 48; x < 220; x += 18) s += SV.circ(x, 208, 6, x % 36 ? "#e2433b" : "#ffd23f", 1.5);     // window-box flowers
  s += SV.rect(196, 40, 18, 40, 2, "#8a8a92", 2.5) + `<rect x="120" y="60" width="20" height="20" fill="#e2433b"/><path d="M130 63 L130 77 M123 70 L137 70" stroke="#fff" stroke-width="4"/>`;
  return s;
}, { solid: 1 });
def("alpcow", 240, 170, 1250, () => {
  let s = SV.ell(110, 92, 74, 42, "#fbf6ee", 3) + SV.ell(80, 80, 22, 18, "#7a4a2a", 0) + SV.ell(146, 104, 18, 14, "#7a4a2a", 0) + SV.ell(110, 70, 14, 10, "#7a4a2a", 0);
  for (const x of [56, 80, 136, 160]) s += SV.rect(x, 118, 13, 46, 4, "#fbf6ee", 2.5);
  s += SV.ell(196, 76, 28, 24, "#7a4a2a", 3) + SV.ell(212, 88, 14, 10, "#f2b6a8", 2.5) + SV.circ(190, 70, 3.5, OL, 0) + `<path d="M180 56 Q172 40 184 42 M206 54 Q214 36 220 46" stroke="#e8d7b8" stroke-width="5" fill="none" stroke-linecap="round"/>`;
  s += SV.path("M178 104 L196 104 L200 128 L174 128Z", "#ffd23f", 2.5);     // the cowbell
  return s;
}, { solid: 1 });
def("railtrack", 300, 60, 2200, () => SV.rect(0, 26, 300, 10, 2, "#8a8a92", 2) + SV.rect(0, 44, 300, 8, 2, "#8a8a92", 2) + `<path d="M20 20 L20 58 M70 20 L70 58 M120 20 L120 58 M170 20 L170 58 M220 20 L220 58 M270 20 L270 58" stroke="#6b4423" stroke-width="9"/>`);
def("redtrain", 900, 260, 6200, () => {
  let s = "";
  for (let k = 0; k < 3; k++) { const x = 10 + k * 296; s += SV.rect(x, 40, 280, 170, 18, "#e2433b", 4) + SV.rect(x, 170, 280, 24, 0, "#f2ead8", 3); for (let wx = x + 20; wx < x + 260; wx += 64) s += SV.rect(wx, 64, 48, 60, 6, "#bfe3ff", 3); s += SV.circ(x + 50, 226, 22, "#3a3540", 3) + SV.circ(x + 230, 226, 22, "#3a3540", 3); }
  s += `<path d="M20 20 L880 20" stroke="#3a3540" stroke-width="5"/>` + SV.rect(40, 14, 14, 28, 2, "#3a3540", 2);
  return s;
});
KIT_EXTRA.rail = () => ({
  portal_rail: { w: 1600, h: 900, ww: 16000, svg: () => {
    let s = `<path fill-rule="evenodd" d="M0 900 L0 380 L260 220 L520 300 L800 90 L1080 260 L1340 180 L1600 330 L1600 900 Z ${PORTAL_HOLE}" fill="#8c94a6" stroke="${OL}" stroke-width="4"/>`;
    s += SV.path("M0 380 L260 220 L520 300 L800 90 L1080 260 L1340 180 L1600 330 L1600 380 Q1340 230 1080 300 Q800 140 520 340 Q260 260 0 430Z", "#ffffff", 3);
    s += `<path fill-rule="evenodd" d="M520 900 L520 640 Q520 500 800 488 Q1080 500 1080 640 L1080 900 Z ${PORTAL_HOLE}" fill="#a8a28e" stroke="${OL}" stroke-width="4"/>`;
    for (let a = 0; a < 9; a++) { const t = (a / 8) * Math.PI; s += `<path d="M${800 - Math.cos(t) * 270} ${640 - Math.sin(t) * 140} L${800 - Math.cos(t) * 230} ${650 - Math.sin(t) * 112}" stroke="#7a7564" stroke-width="6"/>`; }
    return s;
  } },
  rib_rail: { w: 560, h: 400, ww: 5600, svg: () => `<path fill-rule="evenodd" d="M0 400 L0 0 L560 0 L560 400 Z ${RIB_HOLE}" fill="#7d7f74" stroke="${OL}" stroke-width="3"/>` + SV.rect(36, 220, 24, 40, 3, "#ffd36b", 2) + SV.rect(500, 220, 24, 40, 3, "#ffd36b", 2) },
});
BG_EXTRA.matterhorn = (layer, Wd, H, R) => {
  if (layer !== "far") return "";
  let s = "";
  for (const x of [520, 1560]) s += `<path d="M${x - 260} ${H - 90} L${x - 40} ${H - 300} L${x} ${H - 390} L${x + 30} ${H - 330} L${x + 300} ${H - 90}Z" fill="#7f8aa0"/><path d="M${x - 40} ${H - 300} L${x} ${H - 390} L${x + 30} ${H - 330} L${x + 10} ${H - 300} L${x - 20} ${H - 280}Z" fill="#fff"/><path d="M${x} ${H - 390} L${x + 30} ${H - 330} L${x + 300} ${H - 90} L${x + 60} ${H - 90}Z" fill="#6a7590"/>`;
  return s;
};

// ---- Machu Picchu ----
def("terrace", 360, 150, 2600, () => {
  let s = "";
  for (let k = 0; k < 3; k++) { const y = 20 + k * 44, x = k * 30; s += SV.rect(x, y, 360 - x, 44, 2, "#8f8a78", 3) + SV.rect(x, y - 10, 360 - x, 12, 2, "#4f9a46", 2.5); for (let bx = x + 20; bx < 350; bx += 46) s += `<path d="M${bx} ${y + 4} L${bx} ${y + 40}" stroke="#6f6a5c" stroke-width="3"/>`; }
  return s;
});
def("incahut", 240, 220, 1700, () => SV.rect(30, 90, 180, 126, 4, "#a8a28e", 3) + SV.path("M14 98 L120 14 L226 98Z", "#c9a648", 3) + `<path d="M40 90 L120 24 L200 90" stroke="#a88a36" stroke-width="4" fill="none"/>` +
  SV.path("M96 216 L102 140 L138 140 L144 216Z", "#3a3028", 3) + SV.path("M50 140 L56 116 L76 116 L82 140Z", "#3a3028", 2.5) + `<path d="M30 130 L210 130 M30 170 L210 170" stroke="#8f8a78" stroke-width="3"/>`, { solid: 1 });
def("llama", 200, 260, 1100, () => {
  let s = "";
  for (const x of [52, 74, 128, 148]) s += SV.rect(x, 176, 12, 78, 4, "#f4ecdc", 2.5);
  s += SV.ell(100, 160, 64, 34, "#f4ecdc", 3) + SV.path("M140 150 Q150 90 150 50 L176 44 Q186 54 178 66 L166 70 Q166 120 158 160Z", "#f4ecdc", 3);
  s += `<path d="M152 44 L148 22 M168 42 L172 20" stroke="${OL}" stroke-width="6" stroke-linecap="round"/>` + SV.circ(170, 56, 3, OL, 0);
  s += SV.path("M66 130 L134 130 L130 160 L70 160Z", "#e2433b", 2.5) + `<path d="M72 144 L128 144" stroke="#ffd23f" stroke-width="5" stroke-dasharray="8 6"/>` + SV.circ(158, 76, 6, "#ff3d7f", 2);
  return s;
}, { solid: 1 });
KIT_EXTRA.inca = () => ({
  portal_inca: { w: 1600, h: 900, ww: 16000, svg: () => {
    // a great stone gateway: the road goes through the standard opening, framed by an Inca trapezoid
    let s = `<path fill-rule="evenodd" d="M200 900 L260 200 L1340 200 L1400 900 Z ${PORTAL_HOLE}" fill="#a8a28e" stroke="${OL}" stroke-width="4"/>`;
    for (let y = 260; y < 900; y += 80) for (let x = 230 + ((y / 80) % 2) * 60; x < 1380; x += 120) if (!(x > 560 && x < 1020 && y > 540)) s += `<path d="M${x} ${y} L${x + 110} ${y}" stroke="#8f8a78" stroke-width="5"/>`;
    s += SV.path("M200 210 L1400 210 L1360 170 L240 170Z", "#4f9a46", 3);
    s += `<path d="M592 900 L640 600 L960 600 L1008 900" stroke="#6f6a5c" stroke-width="14" fill="none"/>`;
    return s;
  } },
  rib_inca: { w: 560, h: 400, ww: 5600, svg: () => `<path fill-rule="evenodd" d="M0 400 L0 0 L560 0 L560 400 Z ${RIB_HOLE}" fill="#8f8a78" stroke="${OL}" stroke-width="3"/>` + `<path d="M0 60 L560 60 M0 130 L76 130 M484 130 L560 130 M0 200 L76 200 M484 200 L560 200 M0 270 L76 270 M484 270 L560 270" stroke="#6f6a5c" stroke-width="5"/>` },
});
BG_EXTRA.picchu = (layer, Wd, H, R) => {
  if (layer !== "far") return "";
  let s = "";
  for (const x of [700, 1750]) s += `<path d="M${x - 160} ${H - 60} Q${x - 70} ${H - 300} ${x} ${H - 330} Q${x + 60} ${H - 300} ${x + 150} ${H - 60}Z" fill="#3f7a4a"/><path d="M${x - 40} ${H - 260} Q${x} ${H - 300} ${x + 40} ${H - 260}" stroke="#5aa060" stroke-width="10" fill="none"/>`;
  for (let i = 0; i < 6; i++) { const x = R() * Wd, y = H - 160 - R() * 120; s += `<ellipse cx="${x}" cy="${y}" rx="${120 + R() * 80}" ry="${18 + R() * 12}" fill="#ffffff" opacity=".7"/>`; }
  return s;
};

// ---- Moab ----
def("rockarch", 1300, 760, 9800, () => {
  let s = `<path fill-rule="evenodd" d="M0 760 L60 420 Q120 140 400 80 Q650 30 900 80 Q1180 140 1240 420 L1300 760 L1010 760 L990 470 Q960 260 650 240 Q340 260 310 470 L290 760 Z" fill="#c4562b" stroke="${OL}" stroke-width="5"/>`;
  s += `<path d="M120 400 Q200 160 400 120 M1180 400 Q1100 160 900 120" stroke="#e07a45" stroke-width="16" fill="none" opacity=".8"/><path d="M80 560 L280 560 M1020 560 L1220 560 M60 660 L280 660 M1020 660 L1240 660" stroke="#a3431d" stroke-width="8" opacity=".7"/>`;
  return s;
});
def("hoodoo", 140, 380, 1300, () => SV.path("M40 376 L46 220 Q30 160 52 110 L46 70 L94 70 L88 110 Q110 160 94 220 L100 376Z", "#d9784a", 3) + SV.ell(70, 64, 46, 20, "#a3431d", 3) + `<path d="M46 160 L94 160 M44 260 L96 260" stroke="#b8552c" stroke-width="5"/>`, { solid: 1 });
def("balrock", 220, 300, 1500, () => SV.path("M70 296 L80 150 L110 120 L140 150 L150 296Z", "#c4562b", 3) + SV.ell(110, 76, 90, 56, "#d9784a", 3) + `<path d="M40 70 Q110 40 180 70" stroke="#e8925a" stroke-width="10" fill="none"/>`, { solid: 1 });
def("juniper", 170, 130, 900, () => SV.path("M84 128 L88 70", "none", 8) + `<path d="M84 128 L88 70" stroke="#6b4423" stroke-width="10"/>` + SV.ell(86, 60, 70, 42, "#5f7a4a", 3) + SV.ell(60, 50, 30, 20, "#6f8a58", 0));
def("tumbleroll", 130, 120, 600, () => W.tumbleweed.svg(), { obstacle: "small" });
BG_EXTRA.buttes = (layer, Wd, H, R) => {
  if (layer !== "far") return "";
  let s = "";
  for (let i = 0; i < 4; i++) { const x = 100 + i * 520 + R() * 100, w = 140 + R() * 120, h = 160 + R() * 100; s += `<path d="M${x} ${H} L${x + 24} ${H - h} L${x + w - 24} ${H - h} L${x + w} ${H}Z" fill="#a8452a"/><path d="M${x + 24} ${H - h} L${x + w - 24} ${H - h} L${x + w - 18} ${H - h + 16} L${x + 30} ${H - h + 16}Z" fill="#e07a45"/>`; }
  s += `<path fill-rule="evenodd" d="M1300 ${H} L1310 ${H - 160} Q1400 ${H - 260} 1500 ${H - 160} L1510 ${H} L1470 ${H} L1468 ${H - 120} Q1405 ${H - 190} 1342 ${H - 120} L1340 ${H}Z" fill="#b8552c"/>`;   // a far-off arch
  return s;
};

// ---- Fuji ----
def("sakura", 280, 360, 1900, () => {
  let s = SV.path("M128 356 Q122 260 134 200 L148 200 Q156 260 152 356Z", "#5a3a2a", 3) + SV.poly([[138, 230], [90, 170]], 9, "#5a3a2a") + SV.poly([[144, 220], [196, 160]], 9, "#5a3a2a");
  for (const [x, y, r] of [[140, 120, 74], [80, 150, 56], [204, 146, 60], [120, 70, 50], [180, 84, 50], [56, 110, 40], [224, 106, 40]]) s += SV.circ(x, y, r, r > 60 ? "#ffb7d0" : "#ffc9dc", 3);
  for (let i = 0; i < 14; i++) s += SV.circ(40 + ((i * 53) % 210), 60 + ((i * 37) % 130), 6, "#ff8ab0", 0);
  return s;
}, { solid: 1 });
def("pagoda", 240, 460, 2300, () => {
  let s = "";
  for (let k = 0; k < 5; k++) { const y = 400 - k * 76, hw = 110 - k * 14; s += SV.rect(120 - hw * 0.55, y - 46, hw * 1.1, 50, 2, "#c4362b", 3) + SV.path(`M${120 - hw} ${y - 40} Q120 ${y - 70} ${120 + hw} ${y - 40} L${120 + hw * 0.7} ${y - 56} L${120 - hw * 0.7} ${y - 56}Z`, "#3a3540", 3); }
  s += `<path d="M120 20 L120 70" stroke="#c9a227" stroke-width="8"/>` + SV.rect(60, 404, 120, 52, 2, "#c4362b", 3);
  return s;
}, { solid: 1 });
def("torii", 1000, 640, 6000, () => {
  let s = SV.rect(150, 160, 70, 480, 6, "#e2332b", 4) + SV.rect(780, 160, 70, 480, 6, "#e2332b", 4);
  s += SV.path("M30 60 Q500 120 970 60 L960 120 Q500 170 40 120Z", "#1b1426", 4) + SV.rect(80, 170, 840, 50, 6, "#e2332b", 4) + SV.rect(470, 120, 60, 60, 4, "#e2332b", 4);
  s += SV.rect(130, 600, 110, 40, 4, "#1b1426", 3) + SV.rect(760, 600, 110, 40, 4, "#1b1426", 3);
  return s;
});
def("toro", 110, 200, 600, () => SV.rect(40, 120, 30, 76, 3, "#9e9a90", 3) + SV.rect(20, 92, 70, 32, 4, "#b8b4aa", 3) + SV.path("M10 96 L55 56 L100 96Z", "#8e8a80", 3) + SV.rect(32, 100, 46, 18, 2, "#ffd36b", 2) + SV.rect(14, 190, 82, 10, 2, "#8e8a80", 2), { solid: 1, glow: "#ffd36b" });
def("deer", 220, 230, 1100, () => {
  let s = "";
  for (const x of [56, 76, 140, 158]) s += SV.rect(x, 140, 11, 84, 4, "#b8794a", 2.5);
  s += SV.ell(108, 130, 66, 32, "#c98a55", 3) + SV.circ(84, 122, 5, "#f4e2c8", 0) + SV.circ(110, 116, 5, "#f4e2c8", 0) + SV.circ(132, 126, 5, "#f4e2c8", 0);
  s += SV.path("M162 118 Q178 80 180 56 L202 52 Q212 62 204 74 L190 78 Q186 104 176 130Z", "#c98a55", 3) + SV.circ(196, 64, 3, OL, 0);
  return s;
}, { solid: 1 });
BG_EXTRA.fujisan = (layer, Wd, H, R) => {
  if (layer !== "far") return "";
  const x = 1000;
  return `<path d="M${x - 520} ${H - 40} Q${x - 200} ${H - 250} ${x - 70} ${H - 360} L${x + 70} ${H - 360} Q${x + 200} ${H - 250} ${x + 520} ${H - 40}Z" fill="#5f7fb8"/>` +
    `<path d="M${x - 70} ${H - 360} L${x + 70} ${H - 360} Q${x + 120} ${H - 300} ${x + 150} ${H - 270} L${x + 100} ${H - 290} L${x + 60} ${H - 260} L${x + 20} ${H - 295} L${x - 30} ${H - 262} L${x - 80} ${H - 292} L${x - 150} ${H - 270} Q${x - 120} ${H - 300} ${x - 70} ${H - 360}Z" fill="#ffffff"/>`;
};

// ---- Ladakh ----
const FLAGS = ["#2b7de9", "#ffffff", "#e2433b", "#2bb673", "#ffd23f"];
def("prayerflags", 1100, 900, 6000, () => {
  // tall poles with a string of flags high over the road (the riders pass well underneath)
  let s = SV.rect(30, 40, 22, 860, 4, "#7b4a2a", 3) + SV.rect(1048, 40, 22, 860, 4, "#7b4a2a", 3);
  s += `<path d="M41 50 Q550 130 1059 50" stroke="${OL}" stroke-width="5" fill="none"/>`;
  for (let i = 0; i < 26; i++) { const t = (i + 0.5) / 26, x = 41 + t * 1018, y = 50 + Math.sin(t * Math.PI) * 78; s += SV.rect(x - 15, y, 30, 36, 2, FLAGS[i % 5], 2.5); }
  return s;
});
def("stupa", 180, 280, 1100, () => SV.rect(30, 200, 120, 76, 3, "#f4f2ec", 3) + SV.rect(46, 176, 88, 28, 3, "#f4f2ec", 3) + SV.path("M40 178 Q40 110 90 104 Q140 110 140 178Z", "#f4f2ec", 3) +
  SV.rect(80, 46, 20, 60, 2, "#e8d9b0", 2.5) + `<path d="M80 60 L100 60 M80 74 L100 74 M80 88 L100 88" stroke="#c9a227" stroke-width="4"/>` + SV.circ(90, 38, 10, "#c9a227", 2.5) + SV.rect(30, 200, 120, 10, 0, "#c4362b", 2), { solid: 1 });
def("gompa", 360, 300, 3200, () => {
  let s = SV.path("M0 296 L30 180 L120 150 L200 170 L300 140 L360 200 L360 296Z", "#9a8468", 3);
  s += SV.rect(60, 120, 120, 90, 2, "#f4f2ec", 3) + SV.rect(170, 80, 140, 120, 2, "#f4f2ec", 3) + SV.rect(60, 112, 120, 14, 0, "#8f2a2a", 2) + SV.rect(170, 72, 140, 14, 0, "#8f2a2a", 2);
  for (const [x, y] of [[80, 150], [120, 150], [190, 110], [230, 110], [270, 110], [200, 150], [260, 150]]) s += SV.rect(x, y, 18, 22, 2, "#3a2a24", 2);
  s += SV.rect(230, 50, 20, 24, 2, "#c9a227", 2);
  return s;
}, { solid: 1 });
def("mani", 180, 90, 820, () => SV.path("M10 86 L20 40 Q90 10 160 40 L170 86Z", "#9a9488", 3) + `<path d="M40 50 L140 50 M36 66 L144 66" stroke="#c4362b" stroke-width="4" stroke-dasharray="10 6"/>`, { solid: 1, obstacle: "rock" });
def("ldkhouse", 260, 190, 2000, () => SV.rect(20, 50, 220, 136, 3, "#f4f2ec", 3) + SV.rect(14, 40, 232, 18, 2, "#7b4a2a", 3) + SV.rect(60, 90, 30, 34, 3, "#3a2a24", 2.5) + SV.rect(170, 90, 30, 34, 3, "#3a2a24", 2.5) + SV.rect(112, 120, 36, 66, 3, "#8f2a2a", 2.5) +
  `<path d="M40 40 L40 10 M220 40 L220 6" stroke="#6b4423" stroke-width="4"/>` + SV.rect(222, 6, 18, 14, 1, "#2b7de9", 1.5) + SV.rect(42, 10, 18, 14, 1, "#ffd23f", 1.5), { solid: 1 });
def("yak", 280, 220, 1500, () => {
  let s = "";
  for (const x of [66, 90, 180, 204]) s += SV.rect(x, 146, 16, 66, 5, "#2a2224", 2.5);
  s += SV.path("M40 150 Q30 80 100 70 Q170 50 220 90 Q248 120 236 160 Q130 186 40 150Z", "#3a3034", 3);
  for (let x = 60; x < 230; x += 22) s += `<path d="M${x} 150 L${x - 4} 176" stroke="#3a3034" stroke-width="7" stroke-linecap="round"/>`;
  s += SV.ell(240, 110, 28, 26, "#3a3034", 3) + `<path d="M226 92 Q206 70 218 60 M254 92 Q274 70 262 60" stroke="#f2ead8" stroke-width="7" fill="none" stroke-linecap="round"/>` + SV.circ(246, 106, 3, "#fff", 0);
  s += SV.rect(90, 66, 90, 22, 4, "#e2433b", 2.5) + `<path d="M100 77 L170 77" stroke="#ffd23f" stroke-width="5" stroke-dasharray="10 6"/>`;
  return s;
}, { solid: 1 });
BG_EXTRA.himalaya = (layer, Wd, H, R) => {
  if (layer !== "far") return "";
  // the monastery on its cliff, far away
  return `<path d="M1200 ${H} L1240 ${H - 170} L1330 ${H - 200} L1400 ${H - 160} L1440 ${H}Z" fill="#9a8468"/><rect x="1270" y="${H - 240}" width="70" height="44" fill="#f4f2ec"/><rect x="1270" y="${H - 246}" width="70" height="8" fill="#8f2a2a"/><rect x="1330" y="${H - 214}" width="44" height="30" fill="#f4f2ec"/>`;
};

// ---- Kilimanjaro ----
def("acacia", 360, 300, 2300, () => SV.path("M168 296 Q170 220 150 170 L162 166 Q182 210 186 296Z", "#5a3a22", 3) + SV.poly([[160, 180], [110, 120]], 8, "#5a3a22") + SV.poly([[172, 178], [240, 116]], 8, "#5a3a22") +
  SV.path("M10 120 Q60 70 180 74 Q300 70 350 120 Q300 134 180 130 Q60 134 10 120Z", "#6f8a3a", 3) + `<path d="M40 112 Q180 96 320 112" stroke="#8faa4a" stroke-width="6" fill="none"/>`, { solid: 1 });
def("baobab", 300, 360, 2100, () => SV.path("M90 356 Q70 240 100 150 L200 150 Q230 240 210 356Z", "#9a7a5a", 3) + SV.poly([[110, 160], [70, 100], [50, 104]], 12, "#9a7a5a") + SV.poly([[150, 152], [150, 80]], 12, "#9a7a5a") + SV.poly([[190, 160], [232, 96], [256, 100]], 12, "#9a7a5a") +
  SV.ell(56, 92, 34, 18, "#6f8a3a", 3) + SV.ell(150, 70, 40, 20, "#6f8a3a", 3) + SV.ell(250, 88, 36, 18, "#6f8a3a", 3), { solid: 1 });
def("termite", 150, 200, 820, () => SV.path("M20 196 Q30 110 60 70 Q70 20 86 30 Q96 70 120 120 Q136 160 130 196Z", "#b86a3a", 3) + `<path d="M60 90 L70 180 M96 110 L100 186" stroke="#94512b" stroke-width="4"/>`, { solid: 1, obstacle: "rock" });
def("zebra", 260, 230, 1350, () => {
  let s = "";
  for (const x of [60, 82, 168, 190]) s += SV.rect(x, 140, 13, 84, 4, "#f4f2ec", 2.5);
  s += SV.ell(124, 124, 82, 38, "#f4f2ec", 3);
  for (let x = 60; x < 200; x += 18) s += `<path d="M${x} 92 Q${x + 8} 124 ${x - 2} 158" stroke="${OL}" stroke-width="7" fill="none"/>`;
  s += SV.path("M196 110 Q216 70 218 46 L244 42 Q254 54 246 66 L230 70 Q228 104 214 136Z", "#f4f2ec", 3) + `<path d="M206 70 L232 80 M204 90 L226 96 M220 50 L240 58" stroke="${OL}" stroke-width="6"/>` + SV.circ(238, 56, 3, OL, 0);
  return s;
}, { solid: 1 });
def("giraffe", 220, 420, 1300, () => {
  let s = "";
  for (const x of [50, 70, 140, 160]) s += SV.rect(x, 250, 12, 160, 4, "#e8b44a", 2.5);
  s += SV.ell(104, 240, 70, 36, "#e8b44a", 3) + SV.path("M150 226 Q162 140 168 50 L190 48 Q190 140 176 236Z", "#e8b44a", 3) + SV.ell(186, 40, 26, 16, "#e8b44a", 3);
  for (const [x, y] of [[70, 236], [100, 226], [130, 244], [90, 256], [160, 150], [170, 100], [166, 196]]) s += SV.ell(x, y, 9, 7, "#a8662a", 0);
  s += `<path d="M180 26 L178 10 M192 26 L196 10" stroke="#a8662a" stroke-width="5" stroke-linecap="round"/>` + SV.circ(196, 38, 3, OL, 0);
  return s;
}, { solid: 1 });
def("heather", 180, 90, 820, () => SV.path("M10 88 Q20 30 60 40 Q90 10 120 36 Q160 30 170 88Z", "#7a8a4a", 3) + SV.circ(60, 40, 6, "#c98ac9", 0) + SV.circ(110, 34, 6, "#c98ac9", 0));
BG_EXTRA.kilimanjaro = (layer, Wd, H, R) => {
  if (layer !== "far") return "";
  const x = 1100;
  return `<path d="M${x - 700} ${H - 30} Q${x - 300} ${H - 230} ${x - 160} ${H - 300} L${x + 180} ${H - 300} Q${x + 320} ${H - 230} ${x + 700} ${H - 30}Z" fill="#6f7f94"/>` +
    `<path d="M${x - 160} ${H - 300} L${x + 180} ${H - 300} Q${x + 220} ${H - 280} ${x + 250} ${H - 262} L${x + 160} ${H - 270} L${x + 90} ${H - 254} L${x} ${H - 272} L${x - 80} ${H - 256} L${x - 230} ${H - 262} Q${x - 200} ${H - 282} ${x - 160} ${H - 300}Z" fill="#ffffff"/>`;
};

/* scenery sets for the World Tour themes */
BIOME_SCENERY.valpo = { near: [["casa", 4], ["casa2", 3], ["palm", 1]], far: ["casa", "casa2"], obstacles: ["trashcan", "streetcart"], special: ["banner"],
  zones: { barrio: { near: [["casa", 4], ["casa2", 4], ["trashcan", 0.5]], dens: 0.85 }, plaza: { near: [["palm", 3], ["bench", 3], ["casa", 1]], dens: 0.6 },
    ascensor: { near: [["ascensor", 3], ["casa2", 2]], dens: 0.6 }, port: { near: [["containers", 3], ["bench", 1]], dens: 0.5 } } };
BIOME_SCENERY.greatwall = { near: [["mtnpine", 3]], far: ["mtnpine"], obstacles: ["rubble"], special: ["banner"], zones: {} };
BIOME_SCENERY.alps = { near: [["snowpine", 2], ["flowers", 3], ["chalet", 1], ["bush", 1]], far: ["snowpine", "pine"], obstacles: ["mossrock"], special: ["banner"],
  zones: { meadow: { near: [["flowers", 5], ["bush", 2], ["snowpine", 1.5]], dens: 0.6 }, village: { near: [["chalet", 4], ["flowers", 2], ["snowpine", 1]], dens: 0.7 },
    pasture: { near: [["flowers", 3], ["alpcow", 1], ["bush", 1], ["snowpine", 1]], dens: 0.55 }, railway: { near: [["railtrack", 6], ["flowers", 1]], dens: 0.9 } } };
BIOME_SCENERY.machu = { near: [["terrace", 3], ["incahut", 1], ["bush", 1]], far: ["terrace", "incahut"], obstacles: ["mossrock"], special: ["banner"],
  zones: { terraces: { near: [["terrace", 6], ["bush", 1]], dens: 0.75 }, ruins: { near: [["incahut", 3], ["terrace", 2], ["ruin", 1]], dens: 0.7 }, cloud: { near: [["bush", 1]], dens: 0.2 } } };
BIOME_SCENERY.moab = { near: [["hoodoo", 2], ["juniper", 3], ["balrock", 1], ["boulder", 1]], far: ["hoodoo", "balrock"], obstacles: ["boulder"], special: ["banner"],
  zones: { slickrock: { near: [["juniper", 3], ["boulder", 1], ["smallcactus", 1]], dens: 0.35 }, hoodoos: { near: [["hoodoo", 5], ["juniper", 1]], dens: 0.7 },
    arches: { near: [["balrock", 2], ["juniper", 2], ["hoodoo", 1]], dens: 0.5 }, rim: { near: [["juniper", 2]], dens: 0.3 } } };
BIOME_SCENERY.fuji = { near: [["sakura", 5], ["toro", 1.5], ["bush", 1]], far: ["sakura", "pagoda"], obstacles: ["mossrock"], special: ["banner"],
  zones: { sakura: { near: [["sakura", 6], ["toro", 1]], dens: 0.8 }, pond: { near: [["reeds", 3], ["sakura", 2], ["toro", 1]], dens: 0.6 },
    temple: { near: [["pagoda", 1], ["sakura", 3], ["toro", 2]], dens: 0.65 }, shrine: { near: [["toro", 4], ["sakura", 2]], dens: 0.7 } } };
BIOME_SCENERY.ladakh = { near: [["stupa", 2], ["mani", 1], ["tsnowrock", 1]], far: ["stupa", "gompa"], obstacles: ["mani"], special: ["banner"],
  zones: { pass: { near: [["mani", 2], ["snowrock", 2], ["stupa", 1]], dens: 0.35 }, stupas: { near: [["stupa", 5], ["mani", 2]], dens: 0.6 },
    valley: { near: [["stupa", 1], ["bush", 1], ["mani", 1]], dens: 0.35 }, monastery: { near: [["gompa", 2], ["stupa", 3]], dens: 0.55 }, village: { near: [["ldkhouse", 4], ["stupa", 2]], dens: 0.65 } } };
BIOME_SCENERY.kili = { near: [["acacia", 4], ["baobab", 1], ["termite", 1]], far: ["acacia", "baobab"], obstacles: ["termite"], special: ["banner"],
  zones: { summit: { near: [["snowrock", 3], ["serac", 1]], dens: 0.3, ground: ["#eef4fa", "#e2eaf4"], road: ["#9a9aa2", "#9090a0"] },
    moor: { near: [["heather", 4], ["snowrock", 1]], dens: 0.5, ground: ["#7a8a5a", "#718152"], road: ["#8a6a4a", "#80603f"] },
    forest: { near: [["palm", 3], ["banana", 3], ["fern", 2]], dens: 0.8, ground: ["#3f8a3a", "#388034"] },
    savanna: { near: [["acacia", 4], ["termite", 1.5], ["baobab", 0.8]], dens: 0.45 }, herd: { near: [["acacia", 3], ["termite", 1]], dens: 0.35 } } };
