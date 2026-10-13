/* Character & vehicle art. Everything is SVG authored in code, rasterized to canvas for the race.
   Back-view sprites (what you see in the race) + front-view anime portraits (menus) + side-view vehicles. */

const OL = "#1b1426";           // ink outline
const FONT = "Arial Black,Impact,Helvetica,sans-serif";

const SV = {
  line(x1, y1, x2, y2, w, c, ol = OL) {
    const d = `M${x1.toFixed(1)} ${y1.toFixed(1)}L${x2.toFixed(1)} ${y2.toFixed(1)}`;
    return `<path d="${d}" stroke="${ol}" stroke-width="${w + 5}" stroke-linecap="round" fill="none"/>` +
      `<path d="${d}" stroke="${c}" stroke-width="${w}" stroke-linecap="round" fill="none"/>`;
  },
  poly(pts, w, c, ol = OL) {
    const d = "M" + pts.map((p) => p[0].toFixed(1) + " " + p[1].toFixed(1)).join("L");
    return `<path d="${d}" stroke="${ol}" stroke-width="${w + 5}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>` +
      `<path d="${d}" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
  },
  path(d, fill, sw = 3, extra = "") {
    return `<path d="${d}" fill="${fill}" stroke="${OL}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round" ${extra}/>`;
  },
  circ(x, y, r, fill, sw = 3) { return `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="${OL}" stroke-width="${sw}"/>`; },
  ell(x, y, rx, ry, fill, sw = 3, extra = "") { return `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${fill}" stroke="${OL}" stroke-width="${sw}" ${extra}/>`; },
  rect(x, y, w, h, rx, fill, sw = 3, extra = "") { return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" stroke="${OL}" stroke-width="${sw}" ${extra}/>`; },
  wrap(w, h, body, defs = "") {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><defs>${defs}</defs>${body}</svg>`;
  },
};

/* ---------------- Vehicle geometry for the back view (240 x 300 box, ground at y=294) ---------------- */
const VGEO = {
  mtb:  { gl: [58, 126], gr: [182, 126], fl: [92, 238], fr: [148, 238], hipY: 168, shY: 104, head: [120, 72], pedal: 1 },
  bmx:  { gl: [72, 142], gr: [168, 142], fl: [96, 252], fr: [144, 252], hipY: 184, shY: 122, head: [120, 90], pedal: 1 },
  dirt: { gl: [50, 122], gr: [190, 122], fl: [86, 234], fr: [154, 234], hipY: 166, shY: 102, head: [120, 70], pedal: 0 },
  atv:  { gl: [40, 142], gr: [200, 142], fl: [66, 226], fr: [174, 226], hipY: 186, shY: 114, head: [120, 82], pedal: 0 },
  ebike: { gl: [58, 124], gr: [182, 124], fl: [92, 236], fr: [148, 236], hipY: 166, shY: 102, head: [120, 70], pedal: 1 },
  squad: { gl: [44, 148], gr: [196, 148], fl: [64, 232], fr: [176, 232], hipY: 192, shY: 120, head: [120, 88], pedal: 0 },
};

function backVehicleUnder(v, r) {
  // Parts that sit *behind* the rider (handlebars, front end).
  const g = VGEO[v];
  const p = r.paint, p2 = r.paint2;
  let s = "";
  if (v === "mtb" || v === "bmx" || v === "ebike") {
    s += SV.poly([g.gl, [g.gl[0] + 22, g.gl[1] - 6], [120, g.gl[1] - 10], [g.gr[0] - 22, g.gr[1] - 6], g.gr], 6, "#2b2b33");
    s += SV.line(120, g.gl[1] - 8, 120, g.gl[1] + 26, 8, "#3a3a44");
    if (v === "ebike") s += SV.rect(110, g.gl[1] - 22, 20, 12, 4, "#1e1e24", 2.5) + `<rect x="113" y="${g.gl[1] - 19}" width="14" height="6" rx="2" fill="#2bd9ff"/>`; // display
    // front tire peeking below handlebars
    s += SV.rect(v === "ebike" ? 110 : 112, g.gl[1] + 34, v === "ebike" ? 20 : 16, v === "bmx" ? 60 : 72, 8, "#1e1e22", 3);
  } else if (v === "dirt") {
    s += SV.path(`M78 ${g.gl[1] + 8} Q120 ${g.gl[1] - 26} 162 ${g.gl[1] + 8} L150 ${g.gl[1] + 30} Q120 ${g.gl[1] + 14} 90 ${g.gl[1] + 30}Z`, p, 3); // number board
    s += SV.poly([g.gl, [g.gl[0] + 30, g.gl[1] - 10], [g.gr[0] - 30, g.gr[1] - 10], g.gr], 7, "#2b2b33");
    s += SV.rect(106, g.gl[1] + 30, 28, 66, 12, "#1c1c20", 3);
  } else if (v === "atv") {
    // front tires, sculpted hood with racing stripe, bars with hand guards
    s += SV.rect(30, 152, 42, 46, 14, "#17171b", 3) + SV.rect(168, 152, 42, 46, 14, "#17171b", 3);
    s += SV.path(`M50 ${g.gl[1] + 22} L76 ${g.gl[1] - 6} L164 ${g.gl[1] - 6} L190 ${g.gl[1] + 22} L172 ${g.gl[1] + 46} L68 ${g.gl[1] + 46}Z`, p, 3);
    s += `<path d="M108 ${g.gl[1] - 5} L104 ${g.gl[1] + 45} M132 ${g.gl[1] - 5} L136 ${g.gl[1] + 45}" stroke="${p2}" stroke-width="7"/>`;
    s += SV.poly([g.gl, [74, g.gl[1] - 14], [166, g.gr[1] - 14], g.gr], 7, "#2b2b33");
    s += SV.path(`M${g.gl[0] - 14} ${g.gl[1] - 12} L${g.gl[0] + 8} ${g.gl[1] - 18} L${g.gl[0] + 6} ${g.gl[1] + 4}Z`, p2, 2.5) + SV.path(`M${g.gr[0] + 14} ${g.gr[1] - 12} L${g.gr[0] - 8} ${g.gr[1] - 18} L${g.gr[0] - 6} ${g.gr[1] + 4}Z`, p2, 2.5);
  } else {
    // sport quad: low nose, slim front tires, flat bars
    s += SV.rect(36, 162, 36, 40, 12, "#17171b", 3) + SV.rect(168, 162, 36, 40, 12, "#17171b", 3);
    s += SV.path(`M60 ${g.gl[1] + 24} L84 ${g.gl[1] + 2} L156 ${g.gl[1] + 2} L180 ${g.gl[1] + 24} L164 ${g.gl[1] + 42} L76 ${g.gl[1] + 42}Z`, p2, 3);
    s += `<path d="M84 ${g.gl[1] + 4} L76 ${g.gl[1] + 40} M156 ${g.gl[1] + 4} L164 ${g.gl[1] + 40}" stroke="${p}" stroke-width="6"/>`;
    s += SV.poly([g.gl, [80, g.gl[1] - 8], [160, g.gr[1] - 8], g.gr], 6, "#2b2b33");
  }
  return s;
}

function backVehicleOver(v, r, f) {
  // Parts closer to the camera than the rider (rear wheel, fender, plate, exhaust, rack).
  const p = r.paint, p2 = r.paint2;
  let s = "";
  const knobs = (x, y0, y1, w) => {
    let k = "";
    for (let y = y0 + 6; y < y1 - 4; y += 11) {
      const o = ((y / 11) | 0) % 2 ? 0 : 3;
      k += `<rect x="${x - 3 + o * 0}" y="${y}" width="5" height="6" rx="1.5" fill="#111"/>`;
      k += `<rect x="${x + w - 2 - o * 0}" y="${y + 4}" width="5" height="6" rx="1.5" fill="#111"/>`;
    }
    return k;
  };
  if (v === "mtb") {
    s += SV.poly([[104, 250], [114, 194], [120, 186]], 5, p) + SV.poly([[136, 250], [126, 194], [120, 186]], 5, p);
    s += SV.rect(107, 196, 26, 98, 13, "#24242a", 3) + knobs(105, 196, 294, 26);
    s += `<rect x="112" y="202" width="5" height="84" rx="2.5" fill="#4a4a55"/>`;
    s += SV.ell(120, 248, 9, 9, "#9aa0ac", 2.5) + SV.ell(136, 248, 6, 14, "#c9ced8", 2.5); // hub + cassette
    s += SV.path("M104 200 Q120 186 136 200 L134 210 Q120 198 106 210Z", p2, 2.5); // mud guard
    s += SV.path("M108 176 Q120 168 132 176 L128 186 L112 186Z", "#222", 2.5); // saddle
    s += SV.ell(120, 214, 5, 3, "#ff3b3b", 1.5); // tail reflector
  } else if (v === "bmx") {
    s += SV.poly([[106, 262], [116, 214], [120, 206]], 5, p) + SV.poly([[134, 262], [124, 214], [120, 206]], 5, p);
    s += SV.rect(109, 232, 22, 62, 11, "#25252b", 3) + knobs(107, 232, 294, 22);
    s += SV.rect(90, 258, 18, 10, 4, "#c9ced8", 2.5) + SV.rect(132, 258, 18, 10, 4, "#c9ced8", 2.5); // pegs
    s += SV.ell(120, 263, 7, 7, "#9aa0ac", 2.5);
    s += SV.path("M110 196 Q120 189 130 196 L127 206 L113 206Z", "#222", 2.5);
  } else if (v === "dirt") {
    s += SV.rect(100, 204, 40, 90, 18, "#1c1c21", 3) + knobs(98, 204, 294, 40);
    s += `<rect x="108" y="212" width="7" height="72" rx="3" fill="#3d3d47"/>`;
    // exhaust
    s += SV.path("M146 196 L166 204 L170 236 L156 240 L148 210Z", "#c7ccd6", 3);
    s += SV.ell(162, 237, 8, 6, "#3a3a40", 2.5);
    // fender + plate
    s += SV.path("M90 186 Q120 150 150 186 L146 212 Q120 196 94 212Z", p, 3);
    s += SV.path("M96 176 Q120 154 144 176 L140 194 Q120 184 100 194Z", "#f7f7f2", 2.5);
    s += `<text x="120" y="190" text-anchor="middle" font-family="${FONT}" font-weight="900" font-size="17" fill="${OL}">${r.num}</text>`;
    s += SV.rect(112, 197, 16, 7, 3, "#ff3030", 2);
    s += SV.path("M82 172 L96 160 L104 176 L90 190Z", p2, 2.5) + SV.path("M158 172 L144 160 L136 176 L150 190Z", p2, 2.5); // side panels
  } else if (v === "ebike") {
    s += SV.poly([[104, 250], [114, 194], [120, 186]], 6, p) + SV.poly([[136, 250], [126, 194], [120, 186]], 6, p);
    s += SV.rect(104, 196, 32, 98, 15, "#202026", 3) + knobs(102, 196, 294, 32);    // plus-size tyre
    s += `<rect x="111" y="202" width="6" height="84" rx="3" fill="#4a4a55"/>`;
    s += SV.ell(120, 248, 13, 13, "#2b2b33", 2.5) + `<circle cx="120" cy="248" r="7" fill="none" stroke="#2bd9ff" stroke-width="2.5"/>`; // hub motor
    s += SV.path("M102 200 Q120 184 138 200 L136 210 Q120 196 104 210Z", p2, 2.5);
    s += SV.rect(108, 150, 24, 30, 6, "#2a2a32", 2.5) + `<rect x="112" y="156" width="4" height="4" fill="#2bd96a"/><rect x="118" y="156" width="4" height="4" fill="#2bd96a"/><rect x="124" y="156" width="4" height="4" fill="#2bd96a"/>`; // battery
    s += SV.path("M108 176 Q120 168 132 176 L128 186 L112 186Z", "#222", 2.5);
    s += SV.rect(112, 212, 16, 6, 3, "#ff3b3b", 1.5) + `<rect x="115" y="213" width="10" height="3" rx="1.5" fill="#ffd0d0"/>`;
  } else if (v === "atv") {
    // ATV: chunky chevron-tread rear tyres, sculpted fenders with stripes, LED tail bar, twin exhausts, chrome rack
    const tire = (x) => {
      let t = SV.rect(x, 212, 56, 82, 18, "#17171b", 3);
      for (let y = 220; y < 288; y += 10) t += `<path d="M${x + 6} ${y} L${x + 28} ${y + 6} L${x + 50} ${y}" stroke="#34343e" stroke-width="4" fill="none" stroke-linecap="round"/>`;
      return t + `<rect x="${x + 4}" y="216" width="6" height="72" rx="3" fill="#2c2c34"/>`;
    };
    s += tire(12) + tire(172);
    s += SV.rect(70, 240, 100, 14, 6, "#3a3a44", 3);                                          // axle housing
    s += SV.ell(100, 250, 9, 8, "#c7ccd6", 2.5) + SV.ell(140, 250, 9, 8, "#c7ccd6", 2.5) + SV.ell(100, 250, 4, 4, "#26262c", 0) + SV.ell(140, 250, 4, 4, "#26262c", 0); // twin exhausts
    const fender = (dir) => {
      const X = (x) => (dir < 0 ? x : 240 - x);
      return SV.path(`M${X(6)} 216 L${X(16)} 192 L${X(48)} 180 L${X(84)} 186 L${X(88)} 222 L${X(62)} 214 L${X(14)} 226Z`, p, 3) +
        `<path d="M${X(20)} 196 L${X(50)} 186 L${X(80)} 190" stroke="${p2}" stroke-width="6" fill="none" stroke-linecap="round"/>` +
        `<path d="M${X(18)} 206 L${X(46)} 196" stroke="#fff" stroke-width="3" opacity=".55" stroke-linecap="round"/>`;
    };
    s += fender(-1) + fender(1);
    s += SV.path("M78 194 L162 194 L168 232 L72 232Z", p2, 3);                                  // tail body
    s += SV.rect(80, 202, 80, 12, 5, "#1a1a20", 2.5) + `<rect x="84" y="205" width="24" height="6" rx="3" fill="#ff2a2a"/><rect x="132" y="205" width="24" height="6" rx="3" fill="#ff2a2a"/><rect x="112" y="205" width="16" height="6" rx="3" fill="#fff4d6"/>`;
    s += `<text x="120" y="229" text-anchor="middle" font-family="${FONT}" font-weight="900" font-size="12" fill="#fff" stroke="${OL}" stroke-width=".6">${r.num}</text>`;
    s += SV.poly([[78, 194], [82, 174], [158, 174], [162, 194]], 4, "#c9ced8") + SV.line(100, 174, 100, 192, 3, "#c9ced8") + SV.line(140, 174, 140, 192, 3, "#c9ced8"); // rack
  } else {
    // Sport Quad: slimmer tyres, angular tail cowl, single LED strip, side exhaust and a whip flag
    const tire = (x) => SV.rect(x, 222, 46, 72, 16, "#17171b", 3) + knobs(x - 2, 222, 294, 46);
    s += tire(22) + tire(172);
    s += SV.rect(68, 246, 104, 12, 5, "#3a3a44", 3);
    s += SV.path("M150 236 L176 226 L184 244 L160 252Z", "#c7ccd6", 3) + SV.ell(180, 236, 7, 9, "#26262c", 2);       // exhaust
    s += SV.path("M14 222 L30 198 L80 192 L86 226 L60 218 L20 232Z", p2, 3) + SV.path("M226 222 L210 198 L160 192 L154 226 L180 218 L220 232Z", p2, 3);
    s += `<path d="M28 204 L78 198 M212 204 L162 198" stroke="${p}" stroke-width="5" stroke-linecap="round"/>`;
    s += SV.path("M74 200 L120 186 L166 200 L160 236 L80 236Z", p, 3);                     // tail cowl
    s += SV.rect(86, 214, 68, 8, 4, "#1a1a20", 2) + `<rect x="90" y="216" width="60" height="4" rx="2" fill="#ff3b3b"/>`;
    s += `<text x="120" y="210" text-anchor="middle" font-family="${FONT}" font-weight="900" font-size="12" fill="#fff" stroke="${OL}" stroke-width=".6">${r.num}</text>`;
    s += `<path d="M196 230 L214 40" stroke="${OL}" stroke-width="5"/><path d="M196 230 L214 40" stroke="#d9dde6" stroke-width="2.5"/>`;
    s += SV.path(`M214 40 L${238 - f * 4} ${50 + f * 3} L214 66Z`, "#ff8a1c", 2.5);           // whip flag
  }
  return s;
}

/* ---------------- Gear: tougher look (v2) ----------------
   Every rider wears a full-face helmet, a dark visor with glowing eyes (front view) and body armor.
   ARCADE keeps it clean and glossy; SAVAGE adds scratches, dents, dirt, scuffed armor and blood. */
const GEAR = {
  kaito: { shell: "#e2433b", trim: "#f4f1ea", glow: "#ff4a3a" },
  bruno: { shell: "#7c828d", trim: "#f0a531", glow: "#5dff6a" },
  yuki:  { shell: "#f4f1ff", trim: "#ff79b0" },
  zara:  { shell: "#13a89e", trim: "#e9c46a" },
  priya: { shell: "#26222e", trim: "#ff8a1c", glow: "#ffb030" },
  rex:   { shell: "#1c1a22", trim: "#38e05a" },
};
const gearShell = (r) => (SAVAGE() ? mix(GEAR[r.id].shell, "#160c10", 0.4) : GEAR[r.id].shell);
// tiny seeded helper so damage marks are identical every time a sprite is drawn
function gRng(r, salt) { let h = salt || 1; for (const ch of r.id) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return rng(h); }
function scratchMarks(x, y, w, h, R, n, col = "#ffffff", op = 0.55) {
  let s = "";
  for (let i = 0; i < n; i++) {
    const sx = x + R() * w, sy = y + R() * h, dx = (R() - 0.3) * w * 0.35, dy = (R() - 0.5) * h * 0.25;
    s += `<path d="M${sx.toFixed(1)} ${sy.toFixed(1)} l${dx.toFixed(1)} ${dy.toFixed(1)}" stroke="${col}" stroke-opacity="${op}" stroke-width="1.8" stroke-linecap="round"/>`;
  }
  return s;
}
function bloodMarks(x, y, w, h, R, n) {
  let s = "";
  for (let i = 0; i < n; i++) {
    const bx = x + R() * w, by = y + R() * h, br = 2.5 + R() * 4.5;
    s += `<circle cx="${bx.toFixed(1)}" cy="${by.toFixed(1)}" r="${br.toFixed(1)}" fill="#a8101c"/>`;
    if (R() < 0.6) s += `<path d="M${bx.toFixed(1)} ${(by + br).toFixed(1)} l0 ${(5 + R() * 10).toFixed(1)}" stroke="#a8101c" stroke-width="${(br * 0.7).toFixed(1)}" stroke-linecap="round"/>`;
  }
  return s;
}

/* ---------------- Helmet (back view: what you see while racing) ---------------- */
function backHead(r, hx, hy, k, f) {
  const R = 24 * k, sv = SAVAGE(), g = GEAR[r.id], shell = gearShell(r), trim = g.trim;
  const dk = shade(shell, -0.3), fl = f % 2 ? 1 : -1, sk = r.skin;
  const rg = gRng(r, 7);
  let s = "";
  // neck
  s += SV.rect(hx - 9 * k, hy + R * 0.55, 18 * k, 16 * k, 6, shade(sk, -0.12), 2.5);
  // parts that stream out BEHIND the helmet
  switch (r.id) {
    case "kaito": {            // navy spikes poking out at the nape
      for (const d of [-1, 1]) s += SV.path(`M${hx + d * 20 * k} ${hy + 10 * k} L${hx + d * 46 * k} ${hy + (20 + fl * 3) * k} L${hx + d * 28 * k} ${hy + 2 * k} L${hx + d * 50 * k} ${hy - 8 * k} L${hx + d * 22 * k} ${hy - 6 * k}Z`, r.hair, 3);
      break;
    }
    case "priya": {            // braid whipping out behind
      const bx = hx + 6 * k * fl;
      s += SV.poly([[hx, hy + 18 * k], [hx + 4 * k, hy + 40 * k], [bx + 12 * k, hy + 62 * k], [bx + 26 * k, hy + 80 * k]], 13 * k, r.hair);
      for (let i = 0; i < 4; i++) { const t = i / 4; const px = lerp(hx + 2 * k, bx + 24 * k, t), py = lerp(hy + 24 * k, hy + 78 * k, t); s += `<path d="M${px - 6 * k} ${py} Q${px} ${py + 6 * k} ${px + 6 * k} ${py}" stroke="${r.hair2}" stroke-width="2.4" fill="none"/>`; }
      s += SV.rect(bx + 20 * k, hy + 74 * k, 10 * k, 7 * k, 2, "#ffd23f", 2);
      break;
    }
    case "yuki": {             // pigtails + a long ninja scarf streaming behind
      const pt = (dir) => SV.path(`M${hx + dir * 18 * k} ${hy + 8 * k} Q${hx + dir * 40 * k} ${hy + 10 * k + fl * 3} ${hx + dir * 54 * k} ${hy + 34 * k} Q${hx + dir * 44 * k} ${hy + 30 * k} ${hx + dir * 36 * k} ${hy + 36 * k} Q${hx + dir * 34 * k} ${hy + 20 * k} ${hx + dir * 16 * k} ${hy + 18 * k}Z`, r.hair, 3);
      s += pt(-1) + pt(1);
      s += SV.path(`M${hx - 4 * k} ${hy + 22 * k} Q${hx + 30 * k} ${hy + 36 * k + fl * 6} ${hx + 64 * k} ${hy + 26 * k - fl * 5} Q${hx + 86 * k} ${hy + 20 * k} ${hx + 100 * k} ${hy + 30 * k + fl * 6} L${hx + 90 * k} ${hy + 40 * k} Q${hx + 64 * k} ${hy + 38 * k} ${hx + 38 * k} ${hy + 46 * k + fl * 3} Q${hx + 14 * k} ${hy + 44 * k} ${hx - 6 * k} ${hy + 34 * k}Z`, g.trim, 3);
      break;
    }
    case "zara": {             // long fluttering scarf tail
      const tail = `M${hx + 10 * k} ${hy + 10 * k} Q${hx + 40 * k} ${hy + 18 * k + fl * 6} ${hx + 70 * k} ${hy + 8 * k - fl * 4} Q${hx + 90 * k} ${hy + 2 * k} ${hx + 104 * k} ${hy + 14 * k + fl * 6} L${hx + 96 * k} ${hy + 24 * k} Q${hx + 70 * k} ${hy + 22 * k} ${hx + 42 * k} ${hy + 34 * k + fl * 3} Q${hx + 20 * k} ${hy + 30 * k} ${hx + 2 * k} ${hy + 22 * k}Z`;
      s += SV.path(sv ? tail.replace(/Z$/, "Z") : tail, shade(r.main, sv ? -0.35 : -0.1), 3);
      s += `<path d="M${hx + 30 * k} ${hy + 22 * k + fl * 2} Q${hx + 60 * k} ${hy + 14 * k} ${hx + 92 * k} ${hy + 16 * k}" stroke="${r.alt}" stroke-width="2.5" fill="none"/>`;
      break;
    }
    case "rex": {              // chain looped from the helmet
      for (let i = 0; i < 5; i++) s += `<ellipse cx="${(hx - 26 * k - i * 4 * k).toFixed(1)}" cy="${(hy + 12 * k + i * 6 * k + fl * (i > 2 ? 2 : 0)).toFixed(1)}" rx="${4.4 * k}" ry="${3 * k}" fill="none" stroke="#d9dde6" stroke-width="2.4" transform="rotate(${i % 2 ? 60 : 10} ${(hx - 26 * k - i * 4 * k).toFixed(1)} ${(hy + 12 * k + i * 6 * k).toFixed(1)})"/>`;
      break;
    }
  }
  // spikes / fins that sit ON TOP of the shell but are drawn first so the shell overlaps their roots
  switch (r.id) {
    case "kaito": s += SV.path(`M${hx - 10 * k} ${hy - 26 * k} L${hx + 1 * k} ${hy - 62 * k + fl} L${hx + 10 * k} ${hy - 26 * k}Z`, "#2a1f33", 3); break;
    case "yuki": for (const d of [-1, 1]) s += SV.path(`M${hx + d * 8 * k} ${hy - 24 * k} Q${hx + d * 26 * k} ${hy - 62 * k} ${hx + d * (14 + fl) * k} ${hy - 76 * k} Q${hx + d * 2 * k} ${hy - 58 * k} ${hx + d * 0 * k} ${hy - 26 * k}Z`, shell, 3) + `<path d="M${hx + d * 8 * k} ${hy - 32 * k} Q${hx + d * 16 * k} ${hy - 56 * k} ${hx + d * 13 * k} ${hy - 68 * k}" stroke="${trim}" stroke-width="${4 * k}" stroke-linecap="round" fill="none"/>`; break;
    case "zara": s += SV.path(`M${hx - 8 * k} ${hy - 26 * k} Q${hx + 4 * k} ${hy - 60 * k} ${hx + 30 * k} ${hy - 54 * k + fl * 2} Q${hx + 12 * k} ${hy - 44 * k} ${hx + 8 * k} ${hy - 26 * k}Z`, trim, 3); break;
    case "priya": for (const [dx, dy, sc] of [[-12, 0, 0.8], [0, -4, 1.1], [12, 0, 0.8]]) s += SV.path(`M${hx + (dx - 7) * k} ${hy - 26 * k} Q${hx + (dx - 8) * k} ${hy - (44 + dy * -1) * sc * k} ${hx + (dx + 2 * fl) * k} ${hy - (62 + (sc - 0.8) * 20) * k} Q${hx + (dx + 8) * k} ${hy - 40 * k} ${hx + (dx + 7) * k} ${hy - 26 * k}Z`, g.trim, 2.8); break;
    case "rex": for (const [dx, h2] of [[-16, 38], [-8, 54], [0, 64], [8, 54], [16, 38]]) s += SV.path(`M${hx + (dx - 5) * k} ${hy - 24 * k} L${hx + (dx + (dx > 0 ? 3 : -3) + fl * (h2 > 50 ? 1 : 0)) * k} ${hy - (h2 + 22) * k} L${hx + (dx + 5) * k} ${hy - 24 * k}Z`, "#d9dde6", 3) + `<path d="M${hx + (dx - 2) * k} ${hy - (h2 + 8) * k} L${hx + (dx + (dx > 0 ? 3 : -3)) * k} ${hy - (h2 + 22) * k} L${hx + (dx + 2) * k} ${hy - (h2 + 8) * k}Z" fill="${trim}"/>`; break;
  }
  // the helmet shell
  const shellP = `M${hx - 29 * k} ${hy + 10 * k} Q${hx - 34 * k} ${hy - 30 * k} ${hx} ${hy - 34 * k} Q${hx + 34 * k} ${hy - 30 * k} ${hx + 29 * k} ${hy + 10 * k} L${hx + 24 * k} ${hy + 24 * k} Q${hx} ${hy + 31 * k} ${hx - 24 * k} ${hy + 24 * k}Z`;
  s += SV.path(shellP, shell, 3.2);
  // neck guard flare
  s += SV.path(`M${hx - 25 * k} ${hy + 20 * k} Q${hx} ${hy + 34 * k} ${hx + 25 * k} ${hy + 20 * k} L${hx + 21 * k} ${hy + 29 * k} Q${hx} ${hy + 38 * k} ${hx - 21 * k} ${hy + 29 * k}Z`, dk, 2.6);
  // centre stripe
  const stripe = r.id === "bruno" ? null : `M${hx - 4.5 * k} ${hy - 33 * k} L${hx + 4.5 * k} ${hy - 33 * k} L${hx + 5.5 * k} ${hy + 25 * k} L${hx - 5.5 * k} ${hy + 25 * k}Z`;
  if (stripe) s += `<path d="${stripe}" fill="${trim}" stroke="${OL}" stroke-width="2"/>`;
  // side vents
  for (const d of [-1, 1]) for (let i = 0; i < 3; i++) s += `<path d="M${hx + d * 25 * k} ${hy - 12 * k + i * 8 * k} l${-d * 10 * k} ${2.5 * k}" stroke="${OL}" stroke-width="2.6" stroke-linecap="round"/>`;
  // per-rider shell details
  switch (r.id) {
    case "bruno":
      s += `<path d="M${hx - 31 * k} ${hy - 6 * k} Q${hx} ${hy - 20 * k} ${hx + 31 * k} ${hy - 6 * k} L${hx + 30 * k} ${hy + 4 * k} Q${hx} ${hy - 10 * k} ${hx - 30 * k} ${hy + 4 * k}Z" fill="${trim}" stroke="${OL}" stroke-width="2.4"/>`;
      for (const [bx, by] of [[-20, -22], [20, -22], [-27, 8], [27, 8]]) s += SV.circ(hx + bx * k, hy + by * k, 3 * k, "#d9dde6", 1.8);
      s += `<path d="M${hx + 8 * k} ${hy - 30 * k} l8 18 l-6 6" stroke="${OL}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;        // axe nick
      break;
    case "yuki":
      for (const d of [-1, 1]) s += `<path d="M${hx + d * 24 * k} ${hy - 22 * k} Q${hx + d * 30 * k} ${hy - 2 * k} ${hx + d * 25 * k} ${hy + 14 * k}" stroke="${trim}" stroke-width="${5 * k}" stroke-linecap="round" fill="none"/>`;
      break;
    case "zara":
      for (let i = -3; i <= 3; i++) s += SV.circ(hx + i * 8.5 * k, hy + 18 * k - Math.abs(i) * 1.4, 2.6 * k, trim, 1.4);
      break;
    case "priya":
      for (const d of [-1, 1]) s += SV.path(`M${hx + d * 28 * k} ${hy + 8 * k} Q${hx + d * 20 * k} ${hy - 6 * k} ${hx + d * 24 * k} ${hy - 20 * k} Q${hx + d * 12 * k} ${hy - 8 * k} ${hx + d * 12 * k} ${hy + 10 * k}Z`, trim, 2.4);
      break;
    case "rex":
      s += `<path d="M${hx - 26 * k} ${hy - 4 * k} L${hx - 14 * k} ${hy - 10 * k} L${hx - 12 * k} ${hy - 2 * k}Z" fill="${trim}"/><path d="M${hx + 26 * k} ${hy - 4 * k} L${hx + 14 * k} ${hy - 10 * k} L${hx + 12 * k} ${hy - 2 * k}Z" fill="${trim}"/>`;
      s += SV.circ(hx - 29 * k, hy + 9 * k, 3 * k, "#d9dde6", 1.6) + SV.circ(hx + 29 * k, hy + 9 * k, 3 * k, "#d9dde6", 1.6);
      break;
  }
  // gloss
  s += `<path d="M${hx - 22 * k} ${hy - 20 * k} Q${hx - 14 * k} ${hy - 29 * k} ${hx - 3 * k} ${hy - 30 * k}" stroke="#fff" stroke-opacity="${sv ? 0.25 : 0.6}" stroke-width="3.2" stroke-linecap="round" fill="none"/>`;
  // savage: dirt, scratches, dents, blood
  if (sv) {
    s += `<path d="M${hx - 28 * k} ${hy + 6 * k} Q${hx} ${hy + 26 * k} ${hx + 28 * k} ${hy + 6 * k} L${hx + 24 * k} ${hy + 24 * k} Q${hx} ${hy + 31 * k} ${hx - 24 * k} ${hy + 24 * k}Z" fill="#000" fill-opacity=".28"/>`;
    s += scratchMarks(hx - 24 * k, hy - 28 * k, 48 * k, 36 * k, rg, 6, "#e8e0d8", 0.5);
    s += `<path d="M${hx - 20 * k} ${hy - 16 * k} l8 5 l-3 7" stroke="#000" stroke-opacity=".5" stroke-width="2.2" fill="none" stroke-linecap="round"/>`;
    s += bloodMarks(hx - 22 * k, hy - 14 * k, 44 * k, 30 * k, rg, 3);
  }
  return s;
}

/* Body armor seen from behind: big angular shoulder guards, a kidney belt and rib plates. Savage adds scuffs, a torn
   jersey and blood (a lot more of it right after a hit, in the "hurt" pose). */
function armorBack(r, k, shW, tY, bY, hipY, waist, pose) {
  const sv = SAVAGE(), g = GEAR[r.id], plate = sv ? "#2b262d" : shade(gearShell(r), r.id === "yuki" ? -0.18 : -0.1), trim = g.trim;
  const wide = r.id === "bruno" ? 1.12 : 1;
  let s = "";
  const pad = (d) => {
    const x0 = 120 + d * (shW + 7 * wide), x1 = 120 + d * (shW - 26 * wide), xm = 120 + d * (shW - 4);
    return SV.path(`M${x0} ${tY + 20} Q${x0 + d * 2} ${tY - 12} ${xm} ${tY - 10} L${x1} ${tY - 4} L${x1 + d * 2} ${tY + 20} Q${xm} ${tY + 28} ${x0} ${tY + 20}Z`, plate, 3) +
      `<path d="M${x0 - d * 3} ${tY + 8} Q${xm} ${tY - 1} ${x1 + d * 3} ${tY + 4}" stroke="${trim}" stroke-width="4" stroke-linecap="round" fill="none"/>` +
      SV.circ(xm - d * 4, tY + 14, 2.4, "#d9dde6", 1.4);
  };
  s += pad(-1) + pad(1);
  // kidney belt
  s += SV.path(`M${120 - waist - 5} ${bY - 10} Q120 ${bY - 4} ${120 + waist + 5} ${bY - 10} L${120 + waist + 4} ${bY + 4} Q120 ${bY + 10} ${120 - waist - 4} ${bY + 4}Z`, plate, 2.8);
  s += SV.rect(120 - 6, bY - 7, 12, 9, 2, trim, 2);
  // rib plates down both sides
  for (const d of [-1, 1]) for (let i = 0; i < 3; i++) s += `<path d="M${120 + d * (waist + 12 - i * 2)} ${tY + 24 + i * 9} l${d * 11} 1" stroke="${plate}" stroke-width="5" stroke-linecap="round"/><path d="M${120 + d * (waist + 12 - i * 2)} ${tY + 24 + i * 9} l${d * 11} 1" stroke="${OL}" stroke-width="1.2" stroke-linecap="round" stroke-opacity=".6"/>`;
  if (sv) {
    const rg = gRng(r, 11);
    s += scratchMarks(120 - shW, tY - 6, shW * 2, 40, rg, 9, "#cfc6bd", 0.4);
    s += `<path d="M${120 - 14} ${tY + 30} l9 6 l-4 8 l10 4" stroke="#14080a" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-opacity=".7"/>`;
    s += bloodMarks(120 - shW * 0.8, tY + 8, shW * 1.6, 34, rg, pose === "hurt" ? 8 : 3);
  }
  return s;
}


/* ---------------- Full back-view rider sprite ---------------- */
// pose: ride | punchL | punchR | kickL | kickR | hurt | nohand | super | cancan ; f = animation frame 0/1
function riderBackSVG(r, v, pose, f) {
  const g = VGEO[v];
  const k = r.id === "bruno" ? 1.16 : r.id === "yuki" ? 0.88 : 1.0;   // body build
  const lw = 15 * k;                                                // limb thickness
  const shW = 40 * k, waist = 21 * k;
  let shY = g.shY + (f ? 2 : 0), hipY = g.hipY;
  let head = [g.head[0], g.head[1] + (f ? 2 : 0)];
  let gl = g.gl.slice(), gr = g.gr.slice(), fl = g.fl.slice(), fr = g.fr.slice();
  if (g.pedal) { fl[1] += f ? -8 : 6; fr[1] += f ? 6 : -8; }
  const shL = [120 - shW + 6, shY + 6], shR = [120 + shW - 6, shY + 6];
  let handL = gl, handR = gr, elbowL = [gl[0] + 4, (shL[1] + gl[1]) / 2 + 14], elbowR = [gr[0] - 4, (shR[1] + gr[1]) / 2 + 14];
  let kneeL = [fl[0] - 8, (hipY + fl[1]) / 2 + 2], kneeR = [fr[0] + 8, (hipY + fr[1]) / 2 + 2];
  let footL = fl, footR = fr, tilt = 0, body = "";
  const hipL = [120 - waist + 6, hipY], hipR = [120 + waist - 6, hipY];
  switch (pose) {
    case "punchL": handL = [12, shY + 4]; elbowL = [52, shY + 10]; tilt = -6; break;
    case "punchR": handR = [228, shY + 4]; elbowR = [188, shY + 10]; tilt = 6; break;
    // overhand throw: arm cocked back above the shoulder, then whipped forward over the head
    case "windup": handR = [204, shY - 62]; elbowR = [206, shY - 16]; tilt = 9; break;
    case "hurl": handR = [132, shY - 84]; elbowR = [158, shY - 44]; handL = [60, shY + 30]; elbowL = [70, shY + 20]; tilt = -10; break;
    case "kickL": footL = [10, hipY + 26]; kneeL = [54, hipY + 10]; tilt = 5; break;
    case "kickR": footR = [230, hipY + 26]; kneeR = [186, hipY + 10]; tilt = -5; break;
    case "cancan": footL = [196, hipY + 40]; kneeL = [150, hipY + 6]; tilt = 4; break;
    case "nohand": handL = [70, shY - 72]; elbowL = [74, shY - 26]; handR = [170, shY - 72]; elbowR = [166, shY - 26]; break;
    case "hurt": handL = [44, shY - 40]; elbowL = [56, shY - 8]; handR = [204, shY - 20]; elbowR = [186, shY + 6]; tilt = 10; footR = [196, hipY + 46]; kneeR = [170, hipY + 20]; break;
    case "super":
      // legs fly up behind the rider toward the camera
      footL = [84, 26]; kneeL = [98, 92]; footR = [156, 26]; kneeR = [142, 92];
      shY += 18; head = [120, g.head[1] + 24]; break;
  }
  const sk = r.skin, glove = "#2a2730", boot = r.id === "rex" ? "#141318" : shade(r.dark, 0.1);
  const isMoto = v === "dirt" || v === "atv" || v === "squad";

  // arms (behind torso)
  const arm = (sh, el, ha) => SV.poly([sh, el, ha], lw, r.main) + SV.circ(ha[0], ha[1], 8.5 * k, glove, 2.5);
  // legs
  const legCol = isMoto ? r.dark : (r.id === "priya" ? "#2b2b3a" : r.dark);
  const leg = (hp, kn, ft, dir) => SV.poly([hp, kn, ft], lw + 3, legCol) +
    `<path d="M${kn[0]} ${kn[1]}" />` + SV.circ(kn[0], kn[1], (isMoto ? 9 : 7) * k, isMoto ? "#d9dde6" : shade(legCol, 0.15), 2.5) +
    SV.path(`M${ft[0] - 12 * dir} ${ft[1] - 7} Q${ft[0]} ${ft[1] - 14} ${ft[0] + 12 * dir} ${ft[1] - 4} L${ft[0] + 12 * dir} ${ft[1] + 5} L${ft[0] - 12 * dir} ${ft[1] + 5}Z`, boot, 2.5);

  body += backVehicleUnder(v, r);
  body += arm(shL, elbowL, handL) + arm(shR, elbowR, handR);
  body += leg(hipL, kneeL, footL, -1) + leg(hipR, kneeR, footR, 1);
  // shorts / pants seat
  body += SV.path(`M${120 - waist - 4} ${hipY - 18} Q120 ${hipY - 26} ${120 + waist + 4} ${hipY - 18} L${120 + waist + 2} ${hipY + 10} Q120 ${hipY + 20} ${120 - waist - 2} ${hipY + 10}Z`, legCol, 3);
  // torso (jersey) — trapezoid with rounded shoulders
  const tY = shY, bY = hipY - 14;
  const torso = `M${120 - shW} ${tY + 14} Q${120 - shW} ${tY - 2} ${120 - shW + 14} ${tY - 4} L${120 + shW - 14} ${tY - 4} Q${120 + shW} ${tY - 2} ${120 + shW} ${tY + 14} L${120 + waist + 4} ${bY} Q120 ${bY + 6} ${120 - waist - 4} ${bY}Z`;
  body += SV.path(torso, r.main, 3);
  // side panels / stripes
  body += `<path d="M${120 - shW + 6} ${tY + 10} L${120 - waist} ${bY - 2}" stroke="${r.alt}" stroke-width="${7 * k}" stroke-linecap="round"/>`;
  body += `<path d="M${120 + shW - 6} ${tY + 10} L${120 + waist} ${bY - 2}" stroke="${r.alt}" stroke-width="${7 * k}" stroke-linecap="round"/>`;
  if (r.id === "rex") {
    for (let i = 0; i < 5; i++) body += SV.circ(120 - shW + 10 + i * (shW * 2 - 20) / 4, tY + 4, 3, "#d9dde6", 1.5);
    body += `<path d="M${120 - 22} ${tY + 20} l10 10 l10 -10 l10 10 l10 -10" stroke="${r.alt}" stroke-width="3" fill="none"/>`;
  }
  // name + number on the back
  const midY = (tY + bY) / 2;
  if (v === "mtb") {
    body += SV.rect(120 - 24 * k, tY + 4, 48 * k, 46 * k, 12, "#2c2c34", 3);
    body += `<path d="M${120 - 16 * k} ${tY + 4} L${120 - 20 * k} ${tY - 6} M${120 + 16 * k} ${tY + 4} L${120 + 20 * k} ${tY - 6}" stroke="#2c2c34" stroke-width="6"/>`;
    body += SV.rect(120 - 14 * k, tY + 14, 28 * k, 8, 3, r.alt, 2);
    body += `<text x="120" y="${bY - 4}" text-anchor="middle" font-family="${FONT}" font-weight="900" font-size="13" fill="${r.alt}" stroke="${OL}" stroke-width="0.6">${r.num}</text>`;
  } else {
    body += `<text x="120" y="${tY + 14}" text-anchor="middle" font-family="${FONT}" font-weight="900" font-size="9" fill="${r.alt}" letter-spacing="1">${r.name.toUpperCase()}</text>`;
    body += `<text x="120" y="${midY + 14}" text-anchor="middle" font-family="${FONT}" font-weight="900" font-size="${26 * k}" fill="${r.alt}" stroke="${OL}" stroke-width="1.2">${r.num}</text>`;
  }
  body += armorBack(r, k, shW, tY, bY, hipY, waist, pose);
  // head + helmet
  body += backHead(r, head[0], head[1], k, f);
  body += backVehicleOver(v, r, f);
  const rot = tilt ? ` transform="rotate(${tilt} 120 290)"` : "";
  return SV.wrap(240, 300, `<g${rot}>${body}</g>`);
}

/* ---------------- Front-view anime portraits (menus) ---------------- */
function animeEyes(cx, cy, r, style) {
  // style: sharp | round | small | cat
  const ec = r.eye;
  const one = (x, dir) => {
    const w = style === "small" ? 15 : style === "round" ? 19 : 18;
    const h = style === "small" ? 12 : style === "round" ? 23 : style === "cat" ? 17 : 15;
    const slant = style === "sharp" || style === "cat" ? 6 : style === "small" ? 3 : 0;
    let s = "";
    s += `<path d="M${x - w * dir} ${cy + 2} Q${x} ${cy - h - 2} ${x + w * dir} ${cy - slant} Q${x + w * 0.4 * dir} ${cy + h * 0.9} ${x - w * dir} ${cy + 2}Z" fill="#fff"/>`;
    s += `<ellipse cx="${x + 1 * dir}" cy="${cy - 1}" rx="${w * 0.58}" ry="${h * 0.72}" fill="url(#iris-${r.id})"/>`;
    s += `<ellipse cx="${x + 1 * dir}" cy="${cy}" rx="${w * 0.26}" ry="${h * 0.36}" fill="${OL}"/>`;
    s += `<ellipse cx="${x - w * 0.22 * dir + 4}" cy="${cy - h * 0.3}" rx="${w * 0.2}" ry="${h * 0.17}" fill="#fff"/>`;
    s += `<circle cx="${x + w * 0.25 * dir}" cy="${cy + h * 0.25}" r="${w * 0.08 + 1}" fill="#fff" opacity=".85"/>`;
    s += `<path d="M${x - w * dir - 3 * dir} ${cy + 4} Q${x} ${cy - h - 6} ${x + w * dir + 4 * dir} ${cy - slant - 3}" stroke="${OL}" stroke-width="${style === "round" ? 4.5 : 5}" fill="none" stroke-linecap="round"/>`;
    if (style === "round" || style === "cat") s += `<path d="M${x + w * dir + 2 * dir} ${cy - slant - 3} l${6 * dir} -4" stroke="${OL}" stroke-width="3.5" stroke-linecap="round"/>`;
    s += `<path d="M${x - w * 0.6 * dir} ${cy + h * 0.8} Q${x + 2 * dir} ${cy + h * 0.95} ${x + w * 0.7 * dir} ${cy + h * 0.55}" stroke="${shade(r.skin, -0.45)}" stroke-width="2" fill="none" stroke-linecap="round"/>`;
    return s;
  };
  return one(cx - 30, -1) + one(cx + 30, 1);
}

/* Front-view gear for the portraits: full-face helmet with a dark visor and glowing angry eyes, cheek guards,
   per-rider decoration, and shoulder armor. Savage adds scratches, a cracked visor, scars and blood. */
function portraitGear(r, cx, cy) {
  const sv = SAVAGE(), g = GEAR[r.id], shell = gearShell(r), trim = g.trim;
  const dk = shade(shell, -0.35), hi = shade(shell, 0.28), rg = gRng(r, 3);
  const glow = sv ? "#ff2a2a" : (g.glow || r.eye);       // savage: every visor burns red
  let front = "", body = "";
  // ----- shoulder armor (drawn over the outfit) -----
  const plate = sv ? "#2b262d" : shade(shell, -0.12);
  const wide = r.id === "bruno" ? 1.1 : 1;
  const sp = (d) => {
    const m = (x) => (d < 0 ? x : 300 - x);
    let t = SV.path(`M${m(48)} 330 L${m(54)} 268 Q${m(66)} 244 ${m(112)} 246 L${m(106)} 298 Q${m(80)} 306 ${m(48)} 330Z`, plate, 3.2);
    t += `<path d="M${m(60)} 276 Q${m(84)} 258 ${m(106)} 264" stroke="${trim}" stroke-width="5" stroke-linecap="round" fill="none"/>`;
    t += SV.circ(m(80), 290, 3, "#d9dde6", 1.6) + SV.circ(m(96), 282, 3, "#d9dde6", 1.6);
    if (sv) t += scratchMarks(m(54) - (d < 0 ? 0 : 50), 256, 52, 44, rg, 4, "#cfc6bd", 0.45);
    return t;
  };
  body += `<g transform="translate(150 0) scale(${wide} 1) translate(-150 0)">${sp(-1)}${sp(1)}</g>`;
  if (sv) body += bloodMarks(110, 262, 80, 40, rg, 4);

  // ----- visor (under the dome so the dome's V-shaped brow overlaps it) -----
  const visorP = `M${cx - 62} ${cy - 26} L${cx} ${cy - 12} L${cx + 62} ${cy - 26} L${cx + 58} ${cy + 22} Q${cx} ${cy + 36} ${cx - 58} ${cy + 22}Z`;
  front += SV.path(visorP, sv ? "#0b0709" : "#14101c", 3.5);
  // glowing eyes: a soft halo, the slit itself, and a bright core
  const eye = (d) => {
    const m = (x) => cx + d * x;
    const pts = `${m(52)} ${cy - 8} ${m(12)} ${cy + 3} ${m(16)} ${cy + 15} ${m(48)} ${cy + 11}`;
    const core = `${m(44)} ${cy - 2} ${m(18)} ${cy + 5} ${m(21)} ${cy + 11} ${m(43)} ${cy + 8}`;
    return `<polygon points="${pts}" fill="${glow}" fill-opacity=".28" stroke="${glow}" stroke-opacity=".35" stroke-width="${sv ? 12 : 9}" stroke-linejoin="round"/>` +
      `<polygon points="${pts}" fill="${shade(glow, 0.15)}" stroke="${glow}" stroke-width="2.5" stroke-linejoin="round"/>` +
      `<polygon points="${core}" fill="${shade(glow, 0.7)}"/>`;
  };
  front += eye(-1) + eye(1);
  front += `<path d="M${cx - 40} ${cy - 20} L${cx - 22} ${cy - 14} L${cx - 36} ${cy + 22} L${cx - 50} ${cy + 20}Z" fill="#fff" fill-opacity="${sv ? 0.07 : 0.13}"/>`;

  // ----- cheek guards -----
  const cheek = (d) => {
    const m = (x) => cx + d * x;
    return SV.path(`M${m(72)} ${cy - 22} L${m(58)} ${cy - 24} L${m(56)} ${cy + 22} L${m(48)} ${cy + 50} Q${m(60)} ${cy + 52} ${m(70)} ${cy + 36} Q${m(76)} ${cy + 8} ${m(72)} ${cy - 22}Z`, shell, 3.2) +
      `<path d="M${m(66)} ${cy - 10} l-6 4 M${m(66)} ${cy + 2} l-6 4 M${m(65)} ${cy + 14} l-6 4" stroke="${OL}" stroke-width="2.4" stroke-linecap="round"/>`;
  };
  front += cheek(-1) + cheek(1);

  // ----- the dome -----
  const domeP = `M${cx - 72} ${cy - 20} Q${cx - 84} ${cy - 118} ${cx} ${cy - 126} Q${cx + 84} ${cy - 118} ${cx + 72} ${cy - 20} L${cx} ${cy - 8} Z`;
  // extras that sit behind the dome
  if (r.id === "yuki") for (const d of [-1, 1]) front += SV.path(`M${cx + d * 30} ${cy - 108} Q${cx + d * 56} ${cy - 168} ${cx + d * 40} ${cy - 196} Q${cx + d * 12} ${cy - 160} ${cx + d * 6} ${cy - 112}Z`, shell, 3.5) + `<path d="M${cx + d * 24} ${cy - 118} Q${cx + d * 42} ${cy - 160} ${cx + d * 38} ${cy - 184}" stroke="${trim}" stroke-width="8" stroke-linecap="round" fill="none"/>`;
  if (r.id === "kaito") front += SV.path(`M${cx - 16} ${cy - 118} L${cx + 2} ${cy - 176} L${cx + 16} ${cy - 118}Z`, "#2a1f33", 3.5) + `<path d="M${cx - 2} ${cy - 118} L${cx + 2} ${cy - 164}" stroke="${trim}" stroke-width="3" stroke-linecap="round"/>`;
  if (r.id === "zara") front += SV.path(`M${cx - 14} ${cy - 118} Q${cx + 6} ${cy - 168} ${cx + 52} ${cy - 150} Q${cx + 20} ${cy - 142} ${cx + 16} ${cy - 118}Z`, trim, 3.5);
  if (r.id === "priya") for (const [dx, hh] of [[-26, 46], [0, 62], [26, 46]]) front += SV.path(`M${cx + dx - 14} ${cy - 112} Q${cx + dx - 18} ${cy - 112 - hh * 0.6} ${cx + dx + 4} ${cy - 112 - hh} Q${cx + dx + 14} ${cy - 112 - hh * 0.4} ${cx + dx + 14} ${cy - 112}Z`, trim, 3.2);
  if (r.id === "rex") for (const [dx, hh] of [[-40, 34], [-20, 54], [0, 66], [20, 54], [40, 34]]) front += SV.path(`M${cx + dx - 9} ${cy - 108 + Math.abs(dx) * 0.25} L${cx + dx + (dx > 0 ? 4 : dx < 0 ? -4 : 0)} ${cy - 108 - hh} L${cx + dx + 9} ${cy - 108 + Math.abs(dx) * 0.25}Z`, "#d9dde6", 3.4) + `<path d="M${cx + dx - 3} ${cy - 108 - hh * 0.7} L${cx + dx + (dx > 0 ? 4 : dx < 0 ? -4 : 0)} ${cy - 108 - hh} L${cx + dx + 3} ${cy - 108 - hh * 0.7}Z" fill="${trim}"/>`;
  front += SV.path(domeP, shell, 3.8);
  // dome decoration
  switch (r.id) {
    case "kaito":
      front += `<path d="M${cx - 10} ${cy - 125} L${cx + 10} ${cy - 125} L${cx + 11} ${cy - 11} L${cx - 11} ${cy - 11}Z" fill="${trim}" stroke="${OL}" stroke-width="2.6"/>`;
      front += `<path d="M${cx - 64} ${cy - 64} l20 6 M${cx - 66} ${cy - 50} l22 6 M${cx + 64} ${cy - 64} l-20 6 M${cx + 66} ${cy - 50} l-22 6" stroke="${OL}" stroke-width="3" stroke-linecap="round"/>`;
      front += `<text x="${cx}" y="${cy - 44}" text-anchor="middle" font-family="${FONT}" font-weight="900" font-size="28" fill="#2a1f33" transform="rotate(0)">7</text>`;
      break;
    case "bruno":
      front += `<path d="M${cx - 76} ${cy - 54} Q${cx} ${cy - 84} ${cx + 76} ${cy - 54} L${cx + 73} ${cy - 36} Q${cx} ${cy - 66} ${cx - 73} ${cy - 36}Z" fill="${trim}" stroke="${OL}" stroke-width="3"/>`;
      for (const [bx, by] of [[-58, -92], [58, -92], [-66, -30], [66, -30]]) front += SV.circ(cx + bx, cy + by, 5, "#d9dde6", 2);
      front += `<path d="M${cx + 24} ${cy - 120} l12 30 l-8 8" stroke="${OL}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
      front += `<path d="M${cx - 70} ${cy - 22} L${cx} ${cy - 6} L${cx + 70} ${cy - 22} L${cx + 70} ${cy - 12} L${cx} ${cy + 4} L${cx - 70} ${cy - 12}Z" fill="${dk}" stroke="${OL}" stroke-width="2.6"/>`;     // heavy brow guard
      break;
    case "yuki":
      for (const d of [-1, 1]) front += `<path d="M${cx + d * 60} ${cy - 40} Q${cx + d * 70} ${cy - 90} ${cx + d * 38} ${cy - 118}" stroke="${trim}" stroke-width="9" stroke-linecap="round" fill="none"/>`;
      front += `<path d="M${cx - 8} ${cy - 124} L${cx + 8} ${cy - 124} L${cx + 6} ${cy - 40} L${cx - 6} ${cy - 40}Z" fill="${trim}" fill-opacity=".85" stroke="${OL}" stroke-width="2.4"/>`;
      break;
    case "zara":
      front += `<path d="M${cx - 76} ${cy - 44} Q${cx} ${cy - 84} ${cx + 76} ${cy - 44}" stroke="${trim}" stroke-width="9" stroke-linecap="round" fill="none"/>`;
      for (let i = -4; i <= 4; i++) front += SV.circ(cx + i * 15, cy - 62 + Math.abs(i) * 5 - (i === 0 ? 0 : 0), 4.4, trim, 1.6);
      front += `<path d="M${cx - 6} ${cy - 126} L${cx + 6} ${cy - 126} L${cx + 4} ${cy - 90} L${cx - 4} ${cy - 90}Z" fill="${trim}" stroke="${OL}" stroke-width="2"/>`;
      break;
    case "priya":
      for (const d of [-1, 1]) for (let i = 0; i < 2; i++) front += SV.path(`M${cx + d * (70 - i * 14)} ${cy - 24 - i * 16} Q${cx + d * (60 - i * 14)} ${cy - 54 - i * 12} ${cx + d * (66 - i * 14)} ${cy - 80 - i * 8} Q${cx + d * (44 - i * 14)} ${cy - 56 - i * 12} ${cx + d * (40 - i * 12)} ${cy - 26 - i * 14}Z`, trim, 2.8);
      front += `<path d="M${cx - 6} ${cy - 126} L${cx + 6} ${cy - 126} L${cx + 4} ${cy - 14} L${cx - 4} ${cy - 14}Z" fill="${trim}" fill-opacity=".9" stroke="${OL}" stroke-width="2.2"/>`;
      break;
    case "rex":
      front += `<path d="M${cx - 8} ${cy - 124} L${cx + 8} ${cy - 124} L${cx + 7} ${cy - 11} L${cx - 7} ${cy - 11}Z" fill="${trim}" stroke="${OL}" stroke-width="2.4"/>`;
      front += `<path d="M${cx - 70} ${cy - 56} l16 -10 l4 14z M${cx + 70} ${cy - 56} l-16 -10 l-4 14z" fill="${trim}" stroke="${OL}" stroke-width="2"/>`;
      for (const d of [-1, 1]) front += SV.circ(cx + d * 68, cy - 36, 4.5, "#d9dde6", 1.8);
      break;
  }
  // gloss on the dome
  front += `<path d="M${cx - 56} ${cy - 76} Q${cx - 44} ${cy - 104} ${cx - 14} ${cy - 112}" stroke="#fff" stroke-opacity="${sv ? 0.22 : 0.6}" stroke-width="7" stroke-linecap="round" fill="none"/>`;
  // ninja mask over Yuki's lower face
  if (r.id === "yuki") front += SV.path(`M${cx - 52} ${cy + 28} Q${cx} ${cy + 46} ${cx + 52} ${cy + 28} L${cx + 50} ${cy + 70} Q${cx} ${cy + 96} ${cx - 50} ${cy + 70}Z`, sv ? "#2a1f2e" : "#3b2c52", 3.2) + `<path d="M${cx - 40} ${cy + 52} Q${cx} ${cy + 68} ${cx + 40} ${cy + 52}" stroke="${trim}" stroke-width="3" stroke-dasharray="6 5" fill="none"/>`;

  // ----- SAVAGE damage -----
  if (sv) {
    front += scratchMarks(cx - 60, cy - 110, 120, 80, rg, 9, "#e8e0d8", 0.5);
    front += `<path d="M${cx - 30} ${cy - 80} l16 10 l-6 12 l18 8" stroke="#000" stroke-opacity=".55" stroke-width="3" fill="none" stroke-linecap="round"/>`;
    // cracked visor with light leaking through
    front += `<path d="M${cx - 6} ${cy - 14} L${cx + 6} ${cy + 4} L${cx - 4} ${cy + 14} L${cx + 8} ${cy + 30}" stroke="#ffd9d0" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-opacity=".9"/>`;
    front += `<path d="M${cx + 30} ${cy - 20} L${cx + 14} ${cy - 2}" stroke="#ffd9d0" stroke-width="1.8" stroke-linecap="round" stroke-opacity=".7"/>`;
    // blood: a smear on the cheek guard, drips from the helmet edge, a few splashes
    front += `<path d="M${cx + 62} ${cy + 6} q-4 22 -14 38 q-10 -4 -6 -16 q8 -10 20 -22z" fill="#a8101c" fill-opacity=".92"/>`;
    front += `<path d="M${cx - 44} ${cy + 24} l0 16 M${cx - 38} ${cy + 26} l0 10" stroke="#a8101c" stroke-width="4" stroke-linecap="round"/>`;
    front += bloodMarks(cx - 70, cy - 30, 140, 70, rg, 4);
  }
  return { front, body };
}

function portraitSVG(r) {
  const HG = `url(#hairg-${r.id})`;
  const cx = 150, cy = 150, sk = r.skin, skd = shade(sk, -0.16), h = r.hair, h2 = r.hair2;
  const defs = `<radialGradient id="iris-${r.id}" cx="50%" cy="35%" r="70%"><stop offset="0" stop-color="${shade(r.eye, 0.35)}"/><stop offset=".6" stop-color="${r.eye}"/><stop offset="1" stop-color="${shade(r.eye, -0.55)}"/></radialGradient>` +
    `<linearGradient id="hairg-${r.id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${h2}"/><stop offset="1" stop-color="${h}"/></linearGradient>`;
  let back = "", face = "", front = "", body = "";
  const eyeStyle = { kaito: "sharp", priya: "round", bruno: "small", yuki: "round", zara: "cat", rex: "sharp" }[r.id];
  // shoulders & outfit
  body += SV.path(`M40 340 Q46 262 108 246 L192 246 Q254 262 260 340Z`, r.main, 3.5);
  body += SV.path(`M128 238 L172 238 L170 262 Q150 274 130 262Z`, skd, 3);
  // face base
  const facePath = `M${cx - 58} ${cy - 30} Q${cx - 60} ${cy + 28} ${cx - 30} ${cy + 60} Q${cx - 10} ${cy + 80} ${cx} ${cy + 82} Q${cx + 10} ${cy + 80} ${cx + 30} ${cy + 60} Q${cx + 60} ${cy + 28} ${cx + 58} ${cy - 30} Q${cx + 56} ${cy - 92} ${cx} ${cy - 94} Q${cx - 56} ${cy - 92} ${cx - 58} ${cy - 30}Z`;
  const ears = SV.ell(cx - 60, cy + 6, 10, 16, sk, 3) + SV.ell(cx + 60, cy + 6, 10, 16, sk, 3);
  face += ears + SV.path(facePath, sk, 3.5);
  face += `<path d="M${cx - 58} ${cy - 6} Q${cx} ${cy - 36} ${cx + 58} ${cy - 6} L${cx + 58} ${cy - 30} L${cx - 58} ${cy - 30}Z" fill="${skd}" opacity=".35"/>`;
  face += animeEyes(cx, cy + 10, r, eyeStyle);
  face += `<path d="M${cx + 2} ${cy + 30} L${cx - 3} ${cy + 40} L${cx + 3} ${cy + 41}" stroke="${shade(sk, -0.4)}" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;
  const brow = (ang, thick = 5) =>
    `<path d="M${cx - 50} ${cy - 18 + ang} Q${cx - 30} ${cy - 28} ${cx - 12} ${cy - 18 - ang}" stroke="${shade(h, -0.2)}" stroke-width="${thick}" fill="none" stroke-linecap="round"/>` +
    `<path d="M${cx + 50} ${cy - 18 + ang} Q${cx + 30} ${cy - 28} ${cx + 12} ${cy - 18 - ang}" stroke="${shade(h, -0.2)}" stroke-width="${thick}" fill="none" stroke-linecap="round"/>`;
  const blush = `<ellipse cx="${cx - 38}" cy="${cy + 38}" rx="11" ry="5" fill="#ff7a8a" opacity=".45"/><ellipse cx="${cx + 38}" cy="${cy + 38}" rx="11" ry="5" fill="#ff7a8a" opacity=".45"/>`;

  switch (r.id) {
    case "kaito":
      back += SV.path(`M${cx - 70} ${cy + 20} L${cx - 96} ${cy - 10} L${cx - 72} ${cy - 30} L${cx - 100} ${cy - 66} L${cx - 60} ${cy - 76} L${cx - 70} ${cy - 118} L${cx - 26} ${cy - 102} L${cx - 10} ${cy - 140} L${cx + 18} ${cy - 104} L${cx + 56} ${cy - 128} L${cx + 58} ${cy - 84} L${cx + 102} ${cy - 76} L${cx + 76} ${cy - 40} L${cx + 98} ${cy - 8} L${cx + 70} ${cy + 18}Z`, HG, 3.5);
      body += SV.path(`M96 252 Q150 296 204 252 L214 280 Q150 318 86 280Z`, r.alt, 3); // high collar
      body += `<path d="M150 276 L150 340" stroke="${OL}" stroke-width="3"/>` + SV.rect(138, 290, 24, 10, 3, "#d9dde6", 2);
      face += brow(4, 6) + `<path d="M${cx - 16} ${cy + 56} Q${cx + 4} ${cy + 62} ${cx + 20} ${cy + 50}" stroke="${OL}" stroke-width="3.5" fill="none" stroke-linecap="round"/>`;
      face += `<path d="M${cx + 30} ${cy + 46} l10 -4" stroke="${shade(sk, -0.35)}" stroke-width="2" stroke-linecap="round"/>`; // tiny scar
      // goggles on forehead
      break;
    case "priya":
      back += SV.path(`M${cx - 66} ${cy + 40} Q${cx - 86} ${cy - 60} ${cx} ${cy - 104} Q${cx + 86} ${cy - 60} ${cx + 66} ${cy + 40} L${cx + 60} ${cy - 20} L${cx - 60} ${cy - 20}Z`, HG, 3.5);
      // braid over shoulder
      for (let i = 0; i < 6; i++) back += SV.ell(cx + 64 + i * 6, cy + 40 + i * 22, 13 - i * 0.6, 14, h, 3);
      back += SV.rect(cx + 88, cy + 166, 20, 12, 4, "#ffd23f", 2.5);
      body += SV.path(`M100 250 L150 300 L200 250 L214 262 L150 328 L86 262Z`, r.alt, 3); // jacket lapels
      body += `<path d="M60 300 L96 268 M240 300 L204 268" stroke="#fff" stroke-width="5"/>`;
      face += brow(-2, 5);
      face += SV.path(`M${cx - 18} ${cy + 52} Q${cx} ${cy + 70} ${cx + 18} ${cy + 52} Q${cx} ${cy + 58} ${cx - 18} ${cy + 52}Z`, "#8a2b3a", 3);
      face += `<path d="M${cx - 12} ${cy + 55} L${cx + 12} ${cy + 55}" stroke="#fff" stroke-width="3"/>`;
      face += SV.circ(cx, cy - 22, 4.5, "#e0193b", 1.5);                     // bindi
      face += SV.circ(cx + 10, cy + 38, 2.2, "#ffd23f", 1);                     // nose stud
      face += `<circle cx="${cx - 62}" cy="${cy + 30}" r="9" fill="none" stroke="#ffd23f" stroke-width="3.5"/><circle cx="${cx + 62}" cy="${cy + 30}" r="9" fill="none" stroke="#ffd23f" stroke-width="3.5"/>`;
      break;
    case "bruno":
      body = SV.path(`M20 340 Q24 254 100 240 L200 240 Q276 254 280 340Z`, r.main, 3.5);
      body += SV.path(`M30 300 Q40 250 96 244 L104 286 Q60 290 30 300Z`, "#8a8f99", 3) + SV.path(`M270 300 Q260 250 204 244 L196 286 Q240 290 270 300Z`, "#8a8f99", 3);
      body += SV.path(`M120 236 L180 236 L178 262 Q150 280 122 262Z`, skd, 3);
      body += `<path d="M118 250 Q150 270 182 250" stroke="${r.alt}" stroke-width="7" fill="none"/>`;
      face += brow(-4, 8) + `<path d="M${cx + 20} ${cy - 30} l12 18" stroke="${shade(sk, 0.25)}" stroke-width="3" stroke-linecap="round"/>`;
      face += SV.path(`M${cx - 50} ${cy + 20} Q${cx - 46} ${cy + 76} ${cx} ${cy + 86} Q${cx + 46} ${cy + 76} ${cx + 50} ${cy + 20} Q${cx + 30} ${cy + 46} ${cx} ${cy + 46} Q${cx - 30} ${cy + 46} ${cx - 50} ${cy + 20}Z`, h, 3);
      face += `<path d="M${cx - 18} ${cy + 58} L${cx + 18} ${cy + 58}" stroke="${shade(sk, -0.2)}" stroke-width="5" stroke-linecap="round"/>`;
      break;
    case "yuki":
      back += SV.path(`M${cx - 66} ${cy + 30} Q${cx - 120} ${cy + 40} ${cx - 120} ${cy + 130} Q${cx - 94} ${cy + 100} ${cx - 80} ${cy + 140} Q${cx - 76} ${cy + 60} ${cx - 50} ${cy + 24}Z`, HG, 3.5);
      back += SV.path(`M${cx + 66} ${cy + 30} Q${cx + 120} ${cy + 40} ${cx + 120} ${cy + 130} Q${cx + 94} ${cy + 100} ${cx + 80} ${cy + 140} Q${cx + 76} ${cy + 60} ${cx + 50} ${cy + 24}Z`, HG, 3.5);
      back += SV.path(`M${cx - 24} ${cy - 92} Q${cx - 50} ${cy - 200} ${cx - 36} ${cy - 206} Q${cx - 14} ${cy - 196} ${cx - 6} ${cy - 96}Z`, "#fff", 3.5);
      back += SV.path(`M${cx + 24} ${cy - 92} Q${cx + 54} ${cy - 196} ${cx + 40} ${cy - 202} Q${cx + 16} ${cy - 194} ${cx + 6} ${cy - 96}Z`, "#fff", 3.5);
      back += `<path d="M${cx - 18} ${cy - 104} Q${cx - 36} ${cy - 170} ${cx - 32} ${cy - 190}" stroke="#ffb3d1" stroke-width="9" stroke-linecap="round" fill="none"/><path d="M${cx + 18} ${cy - 104} Q${cx + 40} ${cy - 168} ${cx + 36} ${cy - 186}" stroke="#ffb3d1" stroke-width="9" stroke-linecap="round" fill="none"/>`;
      body += SV.path(`M84 262 Q150 230 216 262 Q232 280 210 296 Q150 270 90 296 Q68 280 84 262Z`, "#fff", 3); // fluffy collar
      face += brow(0, 4);
      face += SV.path(`M${cx - 12} ${cy + 54} Q${cx} ${cy + 68} ${cx + 12} ${cy + 54}Z`, "#c4405a", 3);
      break;
    case "zara":
      back += SV.path(`M${cx - 80} ${cy + 80} Q${cx - 96} ${cy - 110} ${cx} ${cy - 116} Q${cx + 96} ${cy - 110} ${cx + 80} ${cy + 80} Q${cx + 60} ${cy + 20} ${cx + 60} ${cy - 20} L${cx - 60} ${cy - 20} Q${cx - 60} ${cy + 20} ${cx - 80} ${cy + 80}Z`, r.main, 3.5);
      body += SV.path(`M70 280 Q150 250 230 280 L240 320 Q150 296 60 320Z`, shade(r.main, -0.1), 3); // scarf pulled down
      body += `<path d="M80 296 Q150 276 220 296" stroke="${r.alt}" stroke-width="4" fill="none"/>`;
      face += brow(3, 5);
      face += `<path d="M${cx - 64} ${cy + 8} l-10 -4 M${cx + 64} ${cy + 8} l10 -4" stroke="${OL}" stroke-width="4" stroke-linecap="round"/>`; // kohl wings
      face += `<path d="M${cx - 14} ${cy + 56} Q${cx + 2} ${cy + 60} ${cx + 16} ${cy + 54}" stroke="${OL}" stroke-width="3.5" fill="none" stroke-linecap="round"/>`;
      face += `<path d="M${cx - 40} ${cy + 40} l-6 10 M${cx - 32} ${cy + 42} l-6 10" stroke="${r.alt}" stroke-width="3" stroke-linecap="round"/>`; // face paint
      break;
    case "rex":
      body += SV.path(`M96 250 L150 290 L204 250 L230 270 L150 330 L70 270Z`, "#2a2730", 3);
      for (let i = 0; i < 7; i++) body += SV.circ(100 + i * 16.6, 262 + Math.abs(i - 3) * -4 + 10, 4, "#d9dde6", 1.5);
      body += `<path d="M52 316 l14 -24 l10 22 M248 316 l-14 -24 l-10 22" stroke="#d9dde6" stroke-width="4" fill="none"/>`;
      face += brow(6, 6);
      face += SV.path(`M${cx - 24} ${cy + 48} Q${cx} ${cy + 76} ${cx + 26} ${cy + 46} Q${cx} ${cy + 56} ${cx - 24} ${cy + 48}Z`, "#fff", 3);
      face += `<path d="M${cx + 10} ${cy + 50} l2 8 l3 -8" stroke="${OL}" stroke-width="1.5" fill="none"/>`;
      for (const [fx, fy] of [[-40, 30], [-46, 38], [-34, 40], [40, 30], [46, 38], [34, 40]]) face += `<circle cx="${cx + fx}" cy="${cy + fy}" r="2" fill="${shade(sk, -0.35)}"/>`;
      face += `<path d="M${cx + 14} ${cy - 2} L${cx + 52} ${cy + 26}" stroke="${r.eye}" stroke-width="5" stroke-linecap="round" opacity=".85"/>`; // war paint
      face += SV.circ(cx - 40, cy - 22, 3, "#d9dde6", 1.5) + SV.circ(cx - 32, cy - 26, 3, "#d9dde6", 1.5); // brow piercing
      face += `<circle cx="${cx + 66}" cy="${cy + 20}" r="6" fill="none" stroke="#d9dde6" stroke-width="3"/>`;
      break;
  }
  const G = portraitGear(r, cx, cy);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="390" viewBox="0 -50 300 390"><defs>${defs}</defs>${back + body + G.body + face + front + G.front}</svg>`;
}

/* ---------------- Side-view vehicles (garage) ---------------- */
function vehicleSideSVG(v, r) {
  const p = r ? r.paint : "#e2433b", p2 = r ? r.paint2 : "#1e1e28";
  let s = "";
  const wheel = (x, y, R, fat) => {
    let w = SV.circ(x, y, R, "#1b1b20", 3) + `<circle cx="${x}" cy="${y}" r="${R - fat}" fill="#d0d4dc" stroke="${OL}" stroke-width="2"/>`;
    for (let i = 0; i < 12; i++) { const a = (i / 12) * TAU; w += `<path d="M${x} ${y} L${(x + Math.cos(a) * (R - fat)).toFixed(1)} ${(y + Math.sin(a) * (R - fat)).toFixed(1)}" stroke="#7d828c" stroke-width="1.5"/>`; }
    for (let i = 0; i < 18; i++) { const a = (i / 18) * TAU; w += `<rect x="${(x + Math.cos(a) * R - 3).toFixed(1)}" y="${(y + Math.sin(a) * R - 3).toFixed(1)}" width="6" height="6" rx="1.5" fill="#111"/>`; }
    return w + SV.circ(x, y, 6, "#7d828c", 2);
  };
  if (v === "ebike") {
    const y = 150, x1 = 70, x2 = 236;
    s += wheel(x1, y, 52, 11) + wheel(x2, y, 52, 11);
    const bb = [150, y - 4], seat = [124, 72], head = [206, 66];
    s += SV.poly([[x1, y], bb, seat, [x1, y]], 10, p) + SV.poly([seat, head], 10, p);
    s += SV.path(`M${head[0] - 6} ${head[1] + 8} L${bb[0] + 14} ${bb[1] - 8} L${bb[0] - 2} ${bb[1] - 16} L${head[0] - 22} ${head[1] + 2}Z`, "#2a2a32", 3); // battery down tube
    for (let i = 0; i < 4; i++) s += `<rect x="${172 - i * 9}" y="${96 + i * 9}" width="5" height="5" fill="#2bd96a"/>`;
    s += SV.circ(bb[0], bb[1], 16, "#3a3a44", 3) + `<circle cx="${bb[0]}" cy="${bb[1]}" r="8" fill="none" stroke="#2bd9ff" stroke-width="3"/>`;  // mid motor
    s += SV.poly([head, [x2, y]], 9, "#c9ced8");
    s += SV.rect(120, 90, 30, 11, 5, "#2bd9ff", 2.5);
    s += SV.line(seat[0], seat[1], seat[0] - 8, seat[1] - 18, 6, "#2b2b33") + SV.path(`M${seat[0] - 30} ${seat[1] - 22} L${seat[0] + 14} ${seat[1] - 22} L${seat[0] + 6} ${seat[1] - 14} L${seat[0] - 26} ${seat[1] - 14}Z`, "#222", 2.5);
    s += SV.poly([head, [head[0] - 6, head[1] - 22], [head[0] - 22, head[1] - 26]], 6, "#2b2b33") + SV.rect(head[0] - 30, head[1] - 34, 16, 10, 3, "#1e1e24", 2);
    s += SV.rect(212, 70, 16, 10, 3, "#fff6c2", 2);
  } else if (v === "mtb" || v === "bmx") {
    const R = v === "bmx" ? 40 : 52, y = 150, x1 = v === "bmx" ? 80 : 70, x2 = v === "bmx" ? 220 : 236;
    s += wheel(x1, y, R, 7) + wheel(x2, y, R, 7);
    const bb = [150, y - 6], seat = [v === "bmx" ? 120 : 126, v === "bmx" ? 88 : 70], head = [v === "bmx" ? 196 : 206, v === "bmx" ? 82 : 66];
    s += SV.poly([[x1, y], bb, seat, [x1, y]], 9, p) + SV.poly([seat, head, bb], 10, p);
    s += SV.poly([head, [x2, y]], 8, "#c9ced8");                         // fork
    if (v === "mtb") s += SV.rect(118, 92, 34, 12, 5, "#f0c419", 2.5);  // rear shock
    s += SV.line(seat[0], seat[1], seat[0] - 8, seat[1] - 18, 6, "#2b2b33") + SV.path(`M${seat[0] - 30} ${seat[1] - 22} L${seat[0] + 14} ${seat[1] - 22} L${seat[0] + 6} ${seat[1] - 14} L${seat[0] - 26} ${seat[1] - 14}Z`, "#222", 2.5);
    s += SV.poly([head, [head[0] - 6, head[1] - 22], [head[0] - 22, head[1] - 26]], 6, "#2b2b33");
    s += SV.circ(bb[0], bb[1], 12, "#9aa0ac", 2.5) + SV.line(bb[0], bb[1], bb[0] + 16, bb[1] + 18, 5, "#2b2b33");
  } else if (v === "dirt") {
    const y = 150;
    s += wheel(66, y, 50, 12) + wheel(240, y, 54, 12);
    s += SV.path("M60 96 L120 86 L150 120 L200 120 L238 60 L252 66 L222 130 L150 146 L110 140 L70 110Z", p, 3);
    s += SV.path("M84 86 Q110 70 170 78 L176 92 L92 100Z", "#1e1e24", 3); // seat
    s += SV.path("M120 104 L176 104 L182 134 L126 138Z", "#9aa0ac", 3);  // engine
    for (let i = 0; i < 4; i++) s += `<path d="M${128 + i * 13} 108 L${130 + i * 13} 134" stroke="#5d626c" stroke-width="3"/>`;
    s += SV.path("M118 136 Q80 150 54 118 L60 110 Q84 132 116 124Z", "#c7ccd6", 3); // exhaust
    s += SV.poly([[230, 58], [240, 150]], 9, "#c9ced8") + SV.poly([[222, 46], [244, 40], [252, 30]], 6, "#2b2b33");
    s += SV.path("M196 64 Q238 44 268 70 L256 80 Q230 64 202 76Z", p2, 3); // front fender
    s += `<text x="168" y="102" font-family="${FONT}" font-weight="900" font-size="16" fill="#fff" stroke="${OL}" stroke-width=".8">${r ? r.num : 1}</text>`;
  } else if (v === "atv") {
    const y = 158;
    s += wheel(72, y, 44, 17) + wheel(236, y, 44, 17);
    s += SV.rect(124, 112, 66, 34, 6, "#7d828c", 3);                                          // engine
    s += SV.path("M24 126 L40 96 L96 88 L118 104 L192 104 L214 86 L272 94 L288 124 L272 132 L30 136Z", p, 3);   // fenders + body
    s += `<path d="M44 102 L94 94 M220 92 L268 100" stroke="${p2}" stroke-width="6" stroke-linecap="round"/>`;
    s += SV.path("M112 104 L196 104 L190 78 L122 78Z", "#1e1e24", 3);                         // seat
    s += SV.rect(14, 82, 68, 9, 4, "#c9ced8", 2.5) + SV.rect(226, 80, 62, 9, 4, "#c9ced8", 2.5); // racks
    s += SV.poly([[204, 80], [216, 52], [238, 46]], 7, "#2b2b33");
    s += SV.rect(278, 104, 18, 10, 3, "#fff6c2", 2.5) + `<rect x="284" y="96" width="14" height="5" rx="2" fill="#fff6c2"/>`;   // LED light bar
    s += SV.path("M118 136 L192 136 L184 150 L126 150Z", p2, 2.5);
    s += SV.path("M50 120 Q30 112 18 120 L22 128 Q34 122 50 128Z", "#c7ccd6", 2.5);            // exhaust
  } else {
    const y = 160;
    s += wheel(74, y, 40, 14) + wheel(234, y, 40, 14);
    s += SV.path("M22 128 L44 104 L104 100 L124 112 L190 112 L214 98 L270 102 L290 128 L276 136 L32 138Z", p, 3);
    s += `<path d="M48 110 L100 106 M218 104 L266 108" stroke="${p2}" stroke-width="6" stroke-linecap="round"/><path d="M40 122 L280 120" stroke="#fff" stroke-width="3" opacity=".6"/>`;
    s += SV.path("M118 112 L194 112 L188 90 L124 90Z", "#1e1e24", 3);
    s += SV.rect(126, 118, 60, 26, 6, "#7d828c", 3);
    s += SV.poly([[206, 92], [218, 66], [240, 62]], 7, "#2b2b33");
    s += SV.path("M40 112 Q20 104 10 112 L14 120 Q26 114 40 120Z", "#c7ccd6", 2.5);
    s += `<path d="M30 104 L18 10" stroke="${OL}" stroke-width="4"/>` + SV.path("M18 10 L44 18 L18 30Z", "#ff8a1c", 2.5);    // whip flag
    s += SV.rect(280, 112, 12, 8, 3, "#fff6c2", 2);
  }
  return SV.wrap(310, 210, s);
}

/* ---------------- Sprite cache ---------------- */
const RIDER_POSES = ["ride0", "ride1", "punchL", "punchR", "kickL", "kickR", "hurt", "nohand", "super", "cancan", "windup", "hurl"];
const SPRITE_W = 240, SPRITE_H = 300;
const riderSpriteCache = {};
async function buildRiderSprites(riderId, vehId) {
  const key = riderId + ":" + TONE + ":" + vehId;
  if (riderSpriteCache[key]) return riderSpriteCache[key];
  const r = RIDERS.find((x) => x.id === riderId);
  const out = {};
  await Promise.all(RIDER_POSES.map(async (pose) => {
    const p = pose.startsWith("ride") ? "ride" : pose;
    const f = pose === "ride1" ? 1 : 0;
    out[pose] = await svgToCanvas(riderBackSVG(r, vehId, p, f), SPRITE_W, SPRITE_H);
  }));
  riderSpriteCache[key] = out;
  return out;
}

/* ---------------- Emblem (home screen + app icon) ----------------
   A spiked tire inside a shield, torn by three claw slashes, with crossed lightning bolts behind it. No characters. */
function emblemSVG(opts = {}) {
  const sv = opts.savage ?? SAVAGE();
  const c1 = sv ? "#8f0f1a" : "#ff3d7f", c2 = sv ? "#e0a93a" : "#ffd23f", c3 = sv ? "#2b1316" : "#2a1240", rim = sv ? "#c9c2b8" : "#ffffff";
  const cx = 200, cy = 200;
  let s = `<defs>
    <linearGradient id="emb-sh" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sv ? "#3a1a1d" : "#4b2a7a"}"/><stop offset="1" stop-color="${c3}"/></linearGradient>
    <linearGradient id="emb-bolt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sv ? "#f2d27a" : "#fff6b0"}"/><stop offset="1" stop-color="${c2}"/></linearGradient>
    <radialGradient id="emb-glow" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="${c1}" stop-opacity=".55"/><stop offset="1" stop-color="${c1}" stop-opacity="0"/></radialGradient>
  </defs>`;
  if (!opts.noGlow) s += `<circle cx="${cx}" cy="${cy}" r="196" fill="url(#emb-glow)"/>`;
  // crossed bolts
  const bolt = (rot) => `<g transform="rotate(${rot} ${cx} ${cy})"><path d="M${cx - 14} 18 L${cx + 26} 18 L${cx + 6} 150 L${cx + 34} 150 L${cx - 22} 390 L${cx - 6} 236 L${cx - 34} 236Z" fill="url(#emb-bolt)" stroke="${OL}" stroke-width="7" stroke-linejoin="round"/></g>`;
  s += bolt(-38) + bolt(38);
  // shield
  const sh = `M${cx} 46 L${cx + 128} 92 Q${cx + 132} 250 ${cx} 352 Q${cx - 132} 250 ${cx - 128} 92Z`;
  s += `<path d="${sh}" fill="url(#emb-sh)" stroke="${OL}" stroke-width="10" stroke-linejoin="round"/>`;
  s += `<path d="M${cx} 64 L${cx + 112} 104 Q${cx + 114} 244 ${cx} 334 Q${cx - 114} 244 ${cx - 112} 104Z" fill="none" stroke="${c2}" stroke-width="5" stroke-linejoin="round"/>`;
  // spiked tire
  const R = 82, wy = cy + 8;
  let knobs = "";
  for (let i = 0; i < 16; i++) { const a = (i / 16) * TAU; const x = cx + Math.cos(a) * (R + 6), y = wy + Math.sin(a) * (R + 6); knobs += `<rect x="${(x - 10).toFixed(1)}" y="${(y - 8).toFixed(1)}" width="20" height="16" rx="3" fill="#15121a" stroke="${OL}" stroke-width="3" transform="rotate(${(a * 180 / Math.PI).toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)})"/>`; }
  s += `<g class="emb-wheel" style="transform-origin:${cx}px ${wy}px">${knobs}<circle cx="${cx}" cy="${wy}" r="${R}" fill="#1b1820" stroke="${OL}" stroke-width="6"/>`;
  s += `<circle cx="${cx}" cy="${wy}" r="${R - 20}" fill="${rim}" stroke="${OL}" stroke-width="5"/><circle cx="${cx}" cy="${wy}" r="${R - 30}" fill="${sv ? "#2a2226" : "#3a2d55"}" stroke="${OL}" stroke-width="3"/>`;
  for (let i = 0; i < 5; i++) { const a = (i / 5) * TAU - Math.PI / 2; s += `<path d="M${cx} ${wy} L${(cx + Math.cos(a) * (R - 30)).toFixed(1)} ${(wy + Math.sin(a) * (R - 30)).toFixed(1)}" stroke="${rim}" stroke-width="9" stroke-linecap="round"/>`; }
  s += `<circle cx="${cx}" cy="${wy}" r="16" fill="${c1}" stroke="${OL}" stroke-width="4"/></g>`;
  // claw slashes (tear through the tire)
  for (let i = 0; i < 3; i++) {
    const ox = (i - 1) * 34;
    const d = `M${cx - 70 + ox} ${wy - 96} Q${cx - 30 + ox} ${wy} ${cx + 40 + ox} ${wy + 102} L${cx + 26 + ox} ${wy + 104} Q${cx - 40 + ox} ${wy + 10} ${cx - 84 + ox} ${wy - 92}Z`;
    s += `<path d="${d}" fill="${OL}" transform="translate(5 5)" opacity=".55"/><path d="${d}" fill="${c1}" stroke="${OL}" stroke-width="4" stroke-linejoin="round"/>`;
    s += `<path d="M${cx - 72 + ox} ${wy - 88} Q${cx - 36 + ox} ${wy} ${cx + 28 + ox} ${wy + 96}" stroke="#fff" stroke-opacity="${sv ? 0.35 : 0.65}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  }
  if (sv) s += `<path d="M${cx + 30} ${wy + 100} l0 26 M${cx + 64} ${wy + 98} l0 18 M${cx - 4} ${wy + 102} l0 14" stroke="#a8101c" stroke-width="7" stroke-linecap="round"/>`;
  return opts.raw ? s : `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">${s}</svg>`;
}
