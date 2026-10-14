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
