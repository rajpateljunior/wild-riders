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
  atv:  { gl: [38, 140], gr: [202, 140], fl: [64, 226], fr: [176, 226], hipY: 188, shY: 114, head: [120, 82], pedal: 0 },
};

function backVehicleUnder(v, r) {
  // Parts that sit *behind* the rider (handlebars, front end).
  const g = VGEO[v];
  const p = r.paint, p2 = r.paint2;
  let s = "";
  if (v === "mtb" || v === "bmx") {
    s += SV.poly([g.gl, [g.gl[0] + 22, g.gl[1] - 6], [120, g.gl[1] - 10], [g.gr[0] - 22, g.gr[1] - 6], g.gr], 6, "#2b2b33");
    s += SV.line(120, g.gl[1] - 8, 120, g.gl[1] + 26, 8, "#3a3a44");
    // front tire peeking below handlebars
    s += SV.rect(112, g.gl[1] + 34, 16, v === "bmx" ? 60 : 72, 8, "#1e1e22", 3);
  } else if (v === "dirt") {
    s += SV.path(`M78 ${g.gl[1] + 8} Q120 ${g.gl[1] - 26} 162 ${g.gl[1] + 8} L150 ${g.gl[1] + 30} Q120 ${g.gl[1] + 14} 90 ${g.gl[1] + 30}Z`, p, 3); // number board
    s += SV.poly([g.gl, [g.gl[0] + 30, g.gl[1] - 10], [g.gr[0] - 30, g.gr[1] - 10], g.gr], 7, "#2b2b33");
    s += SV.rect(106, g.gl[1] + 30, 28, 66, 12, "#1c1c20", 3);
  } else {
    s += SV.poly([g.gl, [70, g.gl[1] - 12], [170, g.gr[1] - 12], g.gr], 7, "#2b2b33");
    s += SV.path(`M58 ${g.gl[1] + 18} Q120 ${g.gl[1] - 12} 182 ${g.gl[1] + 18} L170 ${g.gl[1] + 44} L70 ${g.gl[1] + 44}Z`, p, 3);
    s += SV.rect(30, 150, 44, 50, 14, "#1b1b20", 3) + SV.rect(166, 150, 44, 50, 14, "#1b1b20", 3); // front tires peeking
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
  } else {
    // ATV: two big rear tires, rack, tail light, fenders
    const tire = (x) => SV.rect(x, 214, 52, 80, 20, "#1b1b20", 3) + knobs(x - 2, 214, 294, 52) +
      `<rect x="${x + 10}" y="222" width="8" height="64" rx="4" fill="#3a3a44"/>`;
    s += tire(16) + tire(172);
    s += SV.rect(68, 238, 104, 14, 6, "#4a4a55", 3); // axle housing
    s += SV.path("M10 214 Q40 180 78 196 L82 226 L14 228Z", p, 3) + SV.path("M230 214 Q200 180 162 196 L158 226 L226 228Z", p, 3);
    s += SV.rect(70, 196, 100, 30, 8, p2, 3);
    s += SV.rect(80, 184, 80, 10, 3, "#8d929e", 2.5) + SV.line(84, 184, 84, 200, 3, "#8d929e") + SV.line(156, 184, 156, 200, 3, "#8d929e");
    s += SV.rect(100, 204, 40, 12, 4, "#ff2a2a", 2.5) + `<rect x="104" y="206" width="14" height="4" rx="2" fill="#ffd0d0"/>`;
    s += `<text x="120" y="238" text-anchor="middle" font-family="${FONT}" font-weight="900" font-size="11" fill="#fff">${r.num}</text>`;
  }
  return s;
}

/* ---------------- Hair / headwear (back view) ---------------- */
function backHead(r, hx, hy, k, f) {
  const R = 24 * k;
  const sk = r.skin, h = r.hair, h2 = r.hair2;
  const fl = f % 2 ? 1 : -1; // flutter
  let s = "";
  // neck & ears
  s += SV.rect(hx - 9 * k, hy + R * 0.55, 18 * k, 16 * k, 6, shade(sk, -0.12), 2.5);
  s += SV.ell(hx - R + 1, hy + 3, 5 * k, 8 * k, sk, 2.5) + SV.ell(hx + R - 1, hy + 3, 5 * k, 8 * k, sk, 2.5);
  switch (r.id) {
    case "kaito": {
      // spiky navy hair swept back by wind + red goggle strap
      let sp = "";
      const spikes = [[-26, -6, -46, 6], [-22, -18, -40, -16], [-12, -26, -24, -40], [2, -28, 0, -48], [14, -24, 26, -42], [22, -14, 44, -18], [26, -2, 46, 10]];
      sp += `M${hx - 24 * k} ${hy + 12 * k}`;
      spikes.forEach(([ax, ay, bx, by], i) => {
        sp += ` L${hx + bx * k + (i % 2 ? fl * 2 : 0)} ${hy + by * k} L${hx + ax * k} ${hy + ay * k}`;
      });
      sp += ` L${hx + 24 * k} ${hy + 12 * k} Q${hx} ${hy + 22 * k} ${hx - 24 * k} ${hy + 12 * k}Z`;
      s += SV.path(sp, h, 3);
      s += `<path d="M${hx - 10 * k} ${hy - 16 * k} L${hx - 18 * k} ${hy - 32 * k} M${hx + 8 * k} ${hy - 18 * k} L${hx + 16 * k} ${hy - 34 * k} M${hx - 2} ${hy - 6 * k} L${hx - 4} ${hy - 30 * k}" stroke="${h2}" stroke-width="3" stroke-linecap="round"/>`;
      s += SV.rect(hx - 25 * k, hy - 2 * k, 50 * k, 8 * k, 3, "#e2433b", 2.5);
      s += SV.rect(hx - 6 * k, hy - 4 * k, 12 * k, 12 * k, 3, "#2a2a30", 2);
      break;
    }
    case "priya": {
      // half-shell helmet + flying braid
      s += SV.path(`M${hx - 26 * k} ${hy + 8 * k} Q${hx - 26 * k} ${hy + 22 * k} ${hx} ${hy + 22 * k} Q${hx + 26 * k} ${hy + 22 * k} ${hx + 26 * k} ${hy + 8 * k}Z`, h, 3);
      const bx = hx + 6 * k * fl;
      s += SV.poly([[hx, hy + 18 * k], [hx + 4 * k, hy + 40 * k], [bx + 12 * k, hy + 62 * k], [bx + 26 * k, hy + 80 * k]], 13 * k, h);
      for (let i = 0; i < 4; i++) {
        const t = i / 4;
        const px = lerp(hx + 2 * k, bx + 24 * k, t), py = lerp(hy + 24 * k, hy + 78 * k, t);
        s += `<path d="M${px - 6 * k} ${py} Q${px} ${py + 6 * k} ${px + 6 * k} ${py}" stroke="${h2}" stroke-width="2.4" fill="none"/>`;
      }
      s += SV.rect(bx + 20 * k, hy + 74 * k, 10 * k, 7 * k, 2, "#ffd23f", 2);
      s += SV.path(`M${hx - 28 * k} ${hy + 8 * k} Q${hx - 28 * k} ${hy - 30 * k} ${hx} ${hy - 30 * k} Q${hx + 28 * k} ${hy - 30 * k} ${hx + 28 * k} ${hy + 8 * k} Z`, r.main, 3);
      s += `<path d="M${hx - 6 * k} ${hy - 29 * k} L${hx - 6 * k} ${hy + 6 * k} M${hx + 6 * k} ${hy - 29 * k} L${hx + 6 * k} ${hy + 6 * k}" stroke="#fff" stroke-width="${4 * k}"/>`;
      s += `<path d="M${hx - 18 * k} ${hy - 20 * k} Q${hx - 10 * k} ${hy - 26 * k} ${hx - 2 * k} ${hy - 27 * k}" stroke="#fff" stroke-opacity=".55" stroke-width="3" fill="none"/>`;
      break;
    }
    case "bruno": {
      // knit beanie with pom
      s += SV.path(`M${hx - 25 * k} ${hy + 12 * k} Q${hx} ${hy + 26 * k} ${hx + 25 * k} ${hy + 12 * k} L${hx + 25 * k} ${hy + 2 * k} L${hx - 25 * k} ${hy + 2 * k}Z`, h, 3);
      s += SV.path(`M${hx - 27 * k} ${hy + 6 * k} Q${hx - 28 * k} ${hy - 32 * k} ${hx} ${hy - 32 * k} Q${hx + 28 * k} ${hy - 32 * k} ${hx + 27 * k} ${hy + 6 * k}Z`, r.alt, 3);
      s += SV.rect(hx - 28 * k, hy - 2 * k, 56 * k, 12 * k, 5, shade(r.alt, -0.18), 3);
      for (let i = -3; i <= 3; i++) s += `<path d="M${hx + i * 7 * k} ${hy - 26 * k + Math.abs(i) * 2} L${hx + i * 7 * k} ${hy - 4 * k}" stroke="${shade(r.alt, -0.25)}" stroke-width="2"/>`;
      s += SV.circ(hx + fl * 2, hy - 36 * k, 9 * k, "#fff4e0", 2.5);
      break;
    }
    case "yuki": {
      // pigtails streaming + bunny-ear helmet
      const pt = (dir) => SV.path(`M${hx + dir * 18 * k} ${hy + 8 * k} Q${hx + dir * 40 * k} ${hy + 10 * k + fl * 3} ${hx + dir * 54 * k} ${hy + 34 * k} Q${hx + dir * 44 * k} ${hy + 30 * k} ${hx + dir * 36 * k} ${hy + 36 * k} Q${hx + dir * 34 * k} ${hy + 20 * k} ${hx + dir * 16 * k} ${hy + 18 * k}Z`, h, 3) +
        SV.circ(hx + dir * 20 * k, hy + 12 * k, 5 * k, "#ff79b0", 2);
      s += pt(-1) + pt(1);
      const ear = (dir) => SV.path(`M${hx + dir * 10 * k} ${hy - 22 * k} Q${hx + dir * 22 * k} ${hy - 64 * k} ${hx + dir * (16 + fl) * k} ${hy - 66 * k} Q${hx + dir * 4 * k} ${hy - 58 * k} ${hx + dir * 2 * k} ${hy - 24 * k}Z`, "#fff", 3) +
        `<path d="M${hx + dir * 8 * k} ${hy - 28 * k} Q${hx + dir * 15 * k} ${hy - 54 * k} ${hx + dir * 14 * k} ${hy - 58 * k}" stroke="#ffb3d1" stroke-width="${4 * k}" stroke-linecap="round" fill="none"/>`;
      s += ear(-1) + ear(1);
      s += SV.path(`M${hx - 27 * k} ${hy + 10 * k} Q${hx - 28 * k} ${hy - 30 * k} ${hx} ${hy - 30 * k} Q${hx + 28 * k} ${hy - 30 * k} ${hx + 27 * k} ${hy + 10 * k} Q${hx} ${hy + 18 * k} ${hx - 27 * k} ${hy + 10 * k}Z`, "#ff79b0", 3);
      s += `<path d="M${hx - 14 * k} ${hy - 18 * k} Q${hx} ${hy - 26 * k} ${hx + 14 * k} ${hy - 18 * k}" stroke="#fff" stroke-width="${5 * k}" stroke-linecap="round" fill="none"/>`;
      s += SV.path(`M${hx - 6 * k} ${hy - 4 * k} l${4 * k} ${-4 * k} l${4 * k} ${4 * k} l${4 * k} ${-4 * k} l${4 * k} ${4 * k}`, "none", 2.4);
      break;
    }
    case "zara": {
      // teal head wrap with a long fluttering scarf tail and gold coins
      const tail = `M${hx + 10 * k} ${hy + 10 * k} Q${hx + 40 * k} ${hy + 18 * k + fl * 6} ${hx + 70 * k} ${hy + 8 * k - fl * 4} Q${hx + 90 * k} ${hy + 2 * k} ${hx + 104 * k} ${hy + 14 * k + fl * 6} L${hx + 96 * k} ${hy + 24 * k} Q${hx + 70 * k} ${hy + 22 * k} ${hx + 42 * k} ${hy + 34 * k + fl * 3} Q${hx + 20 * k} ${hy + 30 * k} ${hx + 2 * k} ${hy + 22 * k}Z`;
      s += SV.path(tail, shade(r.main, -0.1), 3);
      s += `<path d="M${hx + 30 * k} ${hy + 22 * k + fl * 2} Q${hx + 60 * k} ${hy + 14 * k} ${hx + 92 * k} ${hy + 16 * k}" stroke="${r.alt}" stroke-width="2.5" fill="none"/>`;
      s += SV.path(`M${hx - 27 * k} ${hy + 12 * k} Q${hx - 30 * k} ${hy - 30 * k} ${hx} ${hy - 30 * k} Q${hx + 30 * k} ${hy - 30 * k} ${hx + 27 * k} ${hy + 12 * k} Q${hx} ${hy + 24 * k} ${hx - 27 * k} ${hy + 12 * k}Z`, r.main, 3);
      for (let i = 0; i < 4; i++) s += `<path d="M${hx - 26 * k} ${hy - 12 * k + i * 8 * k} Q${hx} ${hy - 22 * k + i * 10 * k} ${hx + 26 * k} ${hy - 12 * k + i * 8 * k}" stroke="${shade(r.main, -0.22)}" stroke-width="2" fill="none"/>`;
      for (let i = -2; i <= 2; i++) s += SV.circ(hx + i * 10 * k, hy + 14 * k + Math.abs(i) * -2, 3.4 * k, "#f5c542", 1.5);
      break;
    }
    case "rex": {
      // shaved sides, tall green mohawk
      s += SV.path(`M${hx - 24 * k} ${hy + 6 * k} Q${hx - 26 * k} ${hy - 24 * k} ${hx} ${hy - 25 * k} Q${hx + 26 * k} ${hy - 24 * k} ${hx + 24 * k} ${hy + 6 * k} Q${hx} ${hy + 22 * k} ${hx - 24 * k} ${hy + 6 * k}Z`, shade(r.skin, -0.06), 3);
      s += `<path d="M${hx - 18 * k} ${hy - 10 * k} Q${hx} ${hy - 4 * k} ${hx + 18 * k} ${hy - 10 * k}" stroke="${shade(r.skin, -0.25)}" stroke-width="2" stroke-dasharray="2 4" fill="none"/>`;
      let m = `M${hx - 8 * k} ${hy + 14 * k}`;
      const tips = [[-6, 2, -26 + fl], [-6, -14, -50], [-4, -24, -66 + fl * 2], [4, -24, -66 - fl], [6, -14, -50], [6, 2, -26]];
      tips.forEach(([dx, base, tip]) => { m += ` L${hx + dx * 3 * k} ${hy + tip * k} L${hx + dx * k} ${hy + base * k}`; });
      m += ` L${hx + 8 * k} ${hy + 14 * k}Z`;
      s += SV.path(m, h, 3);
      s += `<path d="M${hx - 2 * k} ${hy + 8 * k} L${hx - 6 * k} ${hy - 50 * k}" stroke="${r.hair2}" stroke-width="3" fill="none"/>`;
      s += SV.circ(hx - R + 1, hy + 9 * k, 2.6, "#d9dde6", 1.5) + SV.circ(hx + R - 1, hy + 9 * k, 2.6, "#d9dde6", 1.5);
      break;
    }
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
  const isMoto = v === "dirt" || v === "atv";

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
  if (r.id === "bruno") {
    body += SV.path(`M${120 - shW - 6} ${tY + 16} Q${120 - shW - 4} ${tY - 8} ${120 - shW + 22} ${tY - 6} L${120 - shW + 20} ${tY + 14}Z`, "#8a8f99", 3);
    body += SV.path(`M${120 + shW + 6} ${tY + 16} Q${120 + shW + 4} ${tY - 8} ${120 + shW - 22} ${tY - 6} L${120 + shW - 20} ${tY + 14}Z`, "#8a8f99", 3);
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
  // head + hair
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
      front += SV.path(`M${cx - 60} ${cy - 22} L${cx - 54} ${cy - 70} L${cx - 30} ${cy - 40} L${cx - 26} ${cy - 84} L${cx - 2} ${cy - 30} L${cx + 6} ${cy - 86} L${cx + 26} ${cy - 36} L${cx + 40} ${cy - 76} L${cx + 52} ${cy - 30} L${cx + 62} ${cy - 50} L${cx + 62} ${cy - 92} Q${cx} ${cy - 120} ${cx - 62} ${cy - 92}Z`, HG, 3.5);
      // goggles on forehead
      front += SV.rect(cx - 70, cy - 76, 140, 16, 6, "#e2433b", 3);
      front += SV.ell(cx - 30, cy - 70, 26, 18, "#2a2a30", 3) + SV.ell(cx + 30, cy - 70, 26, 18, "#2a2a30", 3);
      front += `<ellipse cx="${cx - 30}" cy="${cy - 70}" rx="19" ry="12" fill="#ff6b4a"/><ellipse cx="${cx + 30}" cy="${cy - 70}" rx="19" ry="12" fill="#ff6b4a"/>`;
      front += `<path d="M${cx - 42} ${cy - 74} l10 -4 M${cx + 18} ${cy - 74} l10 -4" stroke="#fff" stroke-width="4" stroke-linecap="round"/>`;
      break;
    case "priya":
      back += SV.path(`M${cx - 66} ${cy + 40} Q${cx - 86} ${cy - 60} ${cx} ${cy - 104} Q${cx + 86} ${cy - 60} ${cx + 66} ${cy + 40} L${cx + 60} ${cy - 20} L${cx - 60} ${cy - 20}Z`, HG, 3.5);
      // braid over shoulder
      for (let i = 0; i < 6; i++) back += SV.ell(cx + 64 + i * 6, cy + 40 + i * 22, 13 - i * 0.6, 14, h, 3);
      back += SV.rect(cx + 88, cy + 166, 20, 12, 4, "#ffd23f", 2.5);
      body += SV.path(`M100 250 L150 300 L200 250 L214 262 L150 328 L86 262Z`, r.alt, 3); // jacket lapels
      body += `<path d="M60 300 L96 268 M240 300 L204 268" stroke="#fff" stroke-width="5"/>`;
      face += brow(-2, 5) + blush;
      face += SV.path(`M${cx - 18} ${cy + 52} Q${cx} ${cy + 70} ${cx + 18} ${cy + 52} Q${cx} ${cy + 58} ${cx - 18} ${cy + 52}Z`, "#8a2b3a", 3);
      face += `<path d="M${cx - 12} ${cy + 55} L${cx + 12} ${cy + 55}" stroke="#fff" stroke-width="3"/>`;
      face += SV.circ(cx, cy - 22, 4.5, "#e0193b", 1.5);                     // bindi
      face += SV.circ(cx + 10, cy + 38, 2.2, "#ffd23f", 1);                     // nose stud
      face += `<circle cx="${cx - 62}" cy="${cy + 30}" r="9" fill="none" stroke="#ffd23f" stroke-width="3.5"/><circle cx="${cx + 62}" cy="${cy + 30}" r="9" fill="none" stroke="#ffd23f" stroke-width="3.5"/>`;
      front += SV.path(`M${cx - 62} ${cy - 10} Q${cx - 66} ${cy - 90} ${cx} ${cy - 98} Q${cx + 66} ${cy - 90} ${cx + 62} ${cy - 10} Q${cx + 44} ${cy - 56} ${cx + 4} ${cy - 62} Q${cx - 30} ${cy - 58} ${cx - 50} ${cy - 30} Q${cx - 56} ${cy - 20} ${cx - 62} ${cy - 10}Z`, HG, 3.5);
      front += `<path d="M${cx - 30} ${cy - 86} Q${cx - 10} ${cy - 96} ${cx + 14} ${cy - 92}" stroke="${h2}" stroke-width="5" fill="none" stroke-linecap="round"/>`;
      front += SV.path(`M${cx - 50} ${cy - 80} Q${cx} ${cy - 104} ${cx + 50} ${cy - 80} L${cx + 46} ${cy - 70} Q${cx} ${cy - 92} ${cx - 46} ${cy - 70}Z`, r.main, 2.5); // headband
      break;
    case "bruno":
      body = SV.path(`M20 340 Q24 254 100 240 L200 240 Q276 254 280 340Z`, r.main, 3.5);
      body += SV.path(`M30 300 Q40 250 96 244 L104 286 Q60 290 30 300Z`, "#8a8f99", 3) + SV.path(`M270 300 Q260 250 204 244 L196 286 Q240 290 270 300Z`, "#8a8f99", 3);
      body += SV.path(`M120 236 L180 236 L178 262 Q150 280 122 262Z`, skd, 3);
      body += `<path d="M118 250 Q150 270 182 250" stroke="${r.alt}" stroke-width="7" fill="none"/>`;
      face += brow(-4, 8) + `<path d="M${cx + 20} ${cy - 30} l12 18" stroke="${shade(sk, 0.25)}" stroke-width="3" stroke-linecap="round"/>`;
      face += SV.path(`M${cx - 50} ${cy + 20} Q${cx - 46} ${cy + 76} ${cx} ${cy + 86} Q${cx + 46} ${cy + 76} ${cx + 50} ${cy + 20} Q${cx + 30} ${cy + 46} ${cx} ${cy + 46} Q${cx - 30} ${cy + 46} ${cx - 50} ${cy + 20}Z`, h, 3);
      face += `<path d="M${cx - 18} ${cy + 58} L${cx + 18} ${cy + 58}" stroke="${shade(sk, -0.2)}" stroke-width="5" stroke-linecap="round"/>`;
      front += SV.path(`M${cx - 66} ${cy - 18} Q${cx - 72} ${cy - 120} ${cx} ${cy - 120} Q${cx + 72} ${cy - 120} ${cx + 66} ${cy - 18}Z`, r.alt, 3.5);
      front += SV.rect(cx - 70, cy - 38, 140, 24, 10, shade(r.alt, -0.18), 3.5);
      for (let i = -4; i <= 4; i++) front += `<path d="M${cx + i * 14} ${cy - 104 + Math.abs(i) * 2} L${cx + i * 14} ${cy - 42}" stroke="${shade(r.alt, -0.28)}" stroke-width="3"/>`;
      front += SV.circ(cx, cy - 124, 16, "#fff4e0", 3);
      break;
    case "yuki":
      back += SV.path(`M${cx - 66} ${cy + 30} Q${cx - 120} ${cy + 40} ${cx - 120} ${cy + 130} Q${cx - 94} ${cy + 100} ${cx - 80} ${cy + 140} Q${cx - 76} ${cy + 60} ${cx - 50} ${cy + 24}Z`, HG, 3.5);
      back += SV.path(`M${cx + 66} ${cy + 30} Q${cx + 120} ${cy + 40} ${cx + 120} ${cy + 130} Q${cx + 94} ${cy + 100} ${cx + 80} ${cy + 140} Q${cx + 76} ${cy + 60} ${cx + 50} ${cy + 24}Z`, HG, 3.5);
      back += SV.path(`M${cx - 24} ${cy - 92} Q${cx - 50} ${cy - 200} ${cx - 36} ${cy - 206} Q${cx - 14} ${cy - 196} ${cx - 6} ${cy - 96}Z`, "#fff", 3.5);
      back += SV.path(`M${cx + 24} ${cy - 92} Q${cx + 54} ${cy - 196} ${cx + 40} ${cy - 202} Q${cx + 16} ${cy - 194} ${cx + 6} ${cy - 96}Z`, "#fff", 3.5);
      back += `<path d="M${cx - 18} ${cy - 104} Q${cx - 36} ${cy - 170} ${cx - 32} ${cy - 190}" stroke="#ffb3d1" stroke-width="9" stroke-linecap="round" fill="none"/><path d="M${cx + 18} ${cy - 104} Q${cx + 40} ${cy - 168} ${cx + 36} ${cy - 186}" stroke="#ffb3d1" stroke-width="9" stroke-linecap="round" fill="none"/>`;
      body += SV.path(`M84 262 Q150 230 216 262 Q232 280 210 296 Q150 270 90 296 Q68 280 84 262Z`, "#fff", 3); // fluffy collar
      face += brow(0, 4) + blush;
      face += SV.path(`M${cx - 12} ${cy + 54} Q${cx} ${cy + 68} ${cx + 12} ${cy + 54}Z`, "#c4405a", 3);
      front += SV.path(`M${cx - 72} ${cy + 10} Q${cx - 80} ${cy - 104} ${cx} ${cy - 106} Q${cx + 80} ${cy - 104} ${cx + 72} ${cy + 10} L${cx + 58} ${cy - 30} L${cx + 46} ${cy - 10} L${cx + 34} ${cy - 46} L${cx + 14} ${cy - 22} L${cx} ${cy - 54} L${cx - 14} ${cy - 22} L${cx - 34} ${cy - 46} L${cx - 46} ${cy - 10} L${cx - 58} ${cy - 30}Z`, HG, 3.5);
      front += SV.path(`M${cx - 78} ${cy - 40} Q${cx - 82} ${cy - 118} ${cx} ${cy - 120} Q${cx + 82} ${cy - 118} ${cx + 78} ${cy - 40} Q${cx} ${cy - 84} ${cx - 78} ${cy - 40}Z`, "#ff79b0", 3.5);
      front += `<path d="M${cx - 40} ${cy - 100} Q${cx} ${cy - 112} ${cx + 40} ${cy - 100}" stroke="#fff" stroke-width="7" stroke-linecap="round" fill="none"/>`;
      front += `<path d="M${cx + 52} ${cy - 54} l5 -12 l5 12 l12 2 l-9 8 l3 12 l-11 -6 l-11 6 l3 -12 l-9 -8z" fill="#ffd23f" stroke="${OL}" stroke-width="2.5"/>`;
      break;
    case "zara":
      back += SV.path(`M${cx - 80} ${cy + 80} Q${cx - 96} ${cy - 110} ${cx} ${cy - 116} Q${cx + 96} ${cy - 110} ${cx + 80} ${cy + 80} Q${cx + 60} ${cy + 20} ${cx + 60} ${cy - 20} L${cx - 60} ${cy - 20} Q${cx - 60} ${cy + 20} ${cx - 80} ${cy + 80}Z`, r.main, 3.5);
      body += SV.path(`M70 280 Q150 250 230 280 L240 320 Q150 296 60 320Z`, shade(r.main, -0.1), 3); // scarf pulled down
      body += `<path d="M80 296 Q150 276 220 296" stroke="${r.alt}" stroke-width="4" fill="none"/>`;
      face += brow(3, 5);
      face += `<path d="M${cx - 64} ${cy + 8} l-10 -4 M${cx + 64} ${cy + 8} l10 -4" stroke="${OL}" stroke-width="4" stroke-linecap="round"/>`; // kohl wings
      face += `<path d="M${cx - 14} ${cy + 56} Q${cx + 2} ${cy + 60} ${cx + 16} ${cy + 54}" stroke="${OL}" stroke-width="3.5" fill="none" stroke-linecap="round"/>`;
      face += `<path d="M${cx - 40} ${cy + 40} l-6 10 M${cx - 32} ${cy + 42} l-6 10" stroke="${r.alt}" stroke-width="3" stroke-linecap="round"/>`; // face paint
      front += SV.path(`M${cx - 52} ${cy - 30} Q${cx - 40} ${cy - 64} ${cx} ${cy - 66} Q${cx + 40} ${cy - 64} ${cx + 52} ${cy - 30} Q${cx + 20} ${cy - 50} ${cx - 4} ${cy - 40} Q${cx - 30} ${cy - 50} ${cx - 52} ${cy - 30}Z`, HG, 3);
      front += SV.path(`M${cx - 74} ${cy - 30} Q${cx - 80} ${cy - 120} ${cx} ${cy - 122} Q${cx + 80} ${cy - 120} ${cx + 74} ${cy - 30} Q${cx} ${cy - 70} ${cx - 74} ${cy - 30}Z`, r.main, 3.5);
      for (let i = 0; i < 3; i++) front += `<path d="M${cx - 70} ${cy - 50 - i * 18} Q${cx} ${cy - 90 - i * 14} ${cx + 70} ${cy - 50 - i * 18}" stroke="${shade(r.main, -0.22)}" stroke-width="3" fill="none"/>`;
      for (let i = -3; i <= 3; i++) front += SV.circ(cx + i * 18, cy - 56 + Math.abs(i) * 4, 6, "#f5c542", 2);
      front += SV.rect(cx - 50, cy - 108, 100, 26, 10, "#c9a227", 3) + SV.ell(cx - 22, cy - 95, 18, 11, "#3a6b6b", 2.5) + SV.ell(cx + 22, cy - 95, 18, 11, "#3a6b6b", 2.5);
      front += `<path d="M${cx - 32} ${cy - 98} l8 -3 M${cx + 12} ${cy - 98} l8 -3" stroke="#bff" stroke-width="3" stroke-linecap="round"/>`;
      break;
    case "rex":
      back += SV.path(`M${cx - 20} ${cy - 90} L${cx - 54} ${cy - 160} L${cx - 14} ${cy - 120} L${cx - 20} ${cy - 196} L${cx + 6} ${cy - 128} L${cx + 26} ${cy - 200} L${cx + 26} ${cy - 120} L${cx + 64} ${cy - 164} L${cx + 26} ${cy - 88}Z`, HG, 3.5);
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
      front += SV.path(`M${cx - 58} ${cy - 40} Q${cx - 56} ${cy - 96} ${cx} ${cy - 98} Q${cx + 56} ${cy - 96} ${cx + 58} ${cy - 40} Q${cx + 40} ${cy - 76} ${cx} ${cy - 78} Q${cx - 40} ${cy - 76} ${cx - 58} ${cy - 40}Z`, shade(sk, -0.05), 3);
      front += `<path d="M${cx - 50} ${cy - 56} Q${cx} ${cy - 84} ${cx + 50} ${cy - 56}" stroke="${shade(sk, -0.25)}" stroke-width="3" stroke-dasharray="3 5" fill="none"/>`;
      front += SV.path(`M${cx - 22} ${cy - 84} L${cx - 30} ${cy - 30} L${cx - 8} ${cy - 60} L${cx + 6} ${cy - 22} L${cx + 14} ${cy - 66} L${cx + 26} ${cy - 40} L${cx + 24} ${cy - 92}Z`, HG, 3.5);
      break;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="390" viewBox="0 -50 300 390"><defs>${defs}</defs>${back + body + face + front}</svg>`;
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
  if (v === "mtb" || v === "bmx") {
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
  } else {
    const y = 156;
    s += wheel(70, y, 44, 16) + wheel(236, y, 44, 16);
    s += SV.path("M30 120 Q60 70 110 96 L196 96 Q240 70 276 120 L270 132 L30 132Z", p, 3);
    s += SV.path("M110 96 L196 96 L188 70 L118 70Z", "#1e1e24", 3);
    s += SV.rect(120, 108, 70, 34, 6, "#7d828c", 3);
    s += SV.rect(16, 92, 70, 10, 4, "#8d929e", 2.5) + SV.rect(222, 92, 64, 10, 4, "#8d929e", 2.5);
    s += SV.poly([[200, 72], [214, 46], [236, 42]], 7, "#2b2b33");
    s += SV.rect(270, 108, 14, 12, 4, "#fff6c2", 2.5);
    s += SV.path("M118 132 L190 132 L182 146 L126 146Z", p2, 2.5);
  }
  return SV.wrap(310, 210, s);
}

/* ---------------- Sprite cache ---------------- */
const RIDER_POSES = ["ride0", "ride1", "punchL", "punchR", "kickL", "kickR", "hurt", "nohand", "super", "cancan"];
const SPRITE_W = 240, SPRITE_H = 300;
const riderSpriteCache = {};
async function buildRiderSprites(riderId, vehId) {
  const key = riderId + ":" + vehId;
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
