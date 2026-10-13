/* Pseudo-3D renderer: one call per viewport (split screen draws two). */

// CAM_LIFT raises the camera (0 = original low view). The horizon moves up by the same amount, so the rider stays
// at the same spot on screen while you look down on the road and the pack from higher up.
// ZOOM < 1 widens the view (everything a little smaller, more of the trail and the pack visible).
// PITCH: how much the camera tilts to follow the slope ahead (1 = road ahead looks flat, 0 = camera never tilts).
const RENDER = { drawDist: 150, CAM_LIFT: 0.6, ZOOM: 0.86, PITCH_DOWN: 0.82, PITCH_UP: 0.45 };

function projK(w, h) {
  // world→pixel factor at scale 1; tuned so the road spans ~75% of the view at the rider
  return Math.min(h * 0.42, w * (w > h * 1.2 ? 0.2 : 0.3));
}

function renderView(ctx, vp, race, me, tnow) {
  const { track, assets } = race;
  const biome = track.biome;
  const { w, h } = vp;
  ctx.save();
  ctx.beginPath(); ctx.rect(vp.x, vp.y, w, h); ctx.clip();
  ctx.translate(vp.x, vp.y);

  const shake = me.shake > 0 ? me.shake : 0;
  const K0 = projK(w, h);
  const K = K0 * RENDER.ZOOM * (1 - me.fovKick * 0.16);   // camera pulls back a little while boosting
  // keep the rider at the same spot on screen as before the zoom-out
  const hz = h * 0.38 + K0 * 0.97 - (1 + RENDER.CAM_LIFT) * K;
  const camZ = me.z - PLAYER_DIST;
  const baseIdx = Math.floor(camZ / SEG);
  const base = track.segs[clamp(baseIdx, 0, track.N - 1)];
  const basePct = (camZ - baseIdx * SEG) / SEG;
  // camera pitch: shear the world so the slope ahead reads as level (the camera "goes downhill with you")
  const pitch = me.pitch || 0;
  const camY = roadY(track, me.z) - pitch * PLAYER_DIST + CAM_H * (1 + RENDER.CAM_LIFT) + me.h * 0.55;
  const camX = me.camX * ROAD_W;

  // camera tilt + shake
  ctx.translate(w / 2 + (shake ? rnd(-shake, shake) : 0), h * 0.62 + (shake ? rnd(-shake, shake) : 0));
  ctx.rotate(me.tilt);
  const zoom = 1 + Math.abs(me.tilt) * 0.9;
  ctx.scale(zoom, zoom);
  ctx.translate(-w / 2, -h * 0.62);

  // ---- sky & parallax ----  (the true horizon rises when the camera tilts down)
  const tun = me.tunT || 0;
  const hzBg = hz + clamp(K * CAM_D * pitch * 0.55, -h * 0.2, h * 0.14);
  drawSky(ctx, w, h, hzBg, biome, tnow, me);
  drawLayer(ctx, assets.far, w, h, hzBg, me.bgX * 0.25, 0.62, biome);
  drawLayer(ctx, assets.near, w, h, hzBg, me.bgX * 0.55, 0.46, biome);
  ctx.fillStyle = biome.ground[1];
  ctx.fillRect(-w * 0.2, hzBg - 1, w * 1.4, h * 1.2);
  if (tun > 0.01) {
    // inside a tunnel the sky becomes rock ceiling
    const cg = ctx.createLinearGradient(0, 0, 0, hz + h * 0.1);
    const rc = biome.id === "tundra" ? "#0c1a2c" : shade(biome.rock[0], -0.55);
    cg.addColorStop(0, rgba(shade(rc, -0.3), tun)); cg.addColorStop(1, rgba(rc, tun));
    ctx.fillStyle = cg; ctx.fillRect(-w * 0.2, -h * 0.2, w * 1.4, hz + h * 0.4);
  }

  // ---- road ----
  const segs = track.segs;
  const dd = race.split ? Math.min(RENDER.drawDist, 110) : RENDER.drawDist;
  const fogC = race.stormFog > 0 ? mix(biome.fog, "#d9a868", race.stormFog) : biome.fog;
  const fogDensity = biome.dark ? 2.2 : 1.4 + race.stormFog * 5;
  let maxy = h;
  let x = 0, dx = -(base.curve * basePct);
  const drawn = [];
  for (let n = 0; n < dd; n++) {
    const i = base.i + n;
    if (i >= track.N) break;
    const s = segs[i];
    const z1 = i * SEG - camZ, z2 = (i + 1) * SEG - camZ;
    s.vis = false;
    if (z1 <= 1) { x += dx; dx += s.curve; continue; }
    const sc1 = CAM_D / z1, sc2 = CAM_D / z2;
    s.sc1 = sc1; s.sc2 = sc2;
    s.sx1 = w / 2 + sc1 * (x - camX) * K;  s.sy1 = hz - sc1 * (s.y1 - pitch * z1 - camY) * K;
    s.sx2 = w / 2 + sc2 * (x + dx - camX) * K; s.sy2 = hz - sc2 * (s.y2 - pitch * z2 - camY) * K;
    s.rw1 = sc1 * ROAD_W * K; s.rw2 = sc2 * ROAD_W * K;
    s.clip = maxy;
    s.fog = 1 - Math.exp(-((n / dd) ** 2) * fogDensity);
    x += dx; dx += s.curve;
    if (s.sy2 >= s.sy1 || s.sy2 >= maxy) { s.vis = true; drawn.push(s); continue; }
    s.vis = true; drawn.push(s);
    drawSegment(ctx, w, s, biome, tnow, maxy);
    if (s.fog > 0.02) { ctx.fillStyle = rgba(fogC, s.fog); ctx.fillRect(0, s.sy2 - 1, w, Math.min(maxy, s.sy1) - s.sy2 + 1); }   // 1px up: the next slice repaints the overlap, so no fog seam
    maxy = s.sy2;
  }

  // ---- sprites, riders, objects (far → near) ----
  const glows = [];
  const buckets = race.buckets;
  for (let k = drawn.length - 1; k >= 0; k--) {
    const s = drawn[k];
    const alpha = 1 - s.fog * 0.85;
    for (const sp of s.sprites) {
      const S = assets.sprites[sp.id];
      if (!S || sp.dead) continue;
      drawSprite(ctx, S, s.sx1 + s.sc1 * sp.x * ROAD_W * K, s.sy1, s.sc1 * K, s.clip, alpha, sp.flat);
      if (S.glow && (biome.dark || tun > 0.05)) glows.push([s.sx1 + s.sc1 * sp.x * ROAD_W * K, s.sy1 - S.wh * s.sc1 * K * 0.7, S.ww * s.sc1 * K * 1.2, S.glow]);
    }
    for (const o of s.objs) {
      let oa = alpha;
      if (o.taken > race.time) {
        // empty crate spot: riders in the back half still get an item here, so they see a faint outline
        if (o.kind !== "crate" || race.demo || !me.human || !inBackHalf(race, me) || (o.gotBy && o.gotBy.has(me))) continue;
        oa = alpha * 0.32;
      }
      const S = assets.sprites[o.kind];
      const bob = Math.sin(tnow * 4 + s.i) * 60;
      const sc = s.sc1 * K;
      drawSprite(ctx, S, s.sx1 + s.sc1 * o.x * ROAD_W * K, s.sy1 - (180 + bob) * sc, sc, s.clip, oa, false);
      if ((biome.dark || tun > 0.05) && oa === alpha) glows.push([s.sx1 + s.sc1 * o.x * ROAD_W * K, s.sy1 - 400 * sc, 700 * sc, S.glow]);
    }
    const list = buckets[s.i];
    if (list) {
      list.sort((a, b) => b.z - a.z);
      for (const e of list) drawEntity(ctx, e, s, K, me, race, glows, tnow);
    }
  }

  // ---- weather & lighting ----
  if (tun < 0.5) drawWeather(ctx, w, h, biome, race, me, tnow);
  if (biome.dark || tun > 0.05) drawDarkness(ctx, w, h, hz, glows, me, biome.dark ? 1 : tun * 0.85);
  if (tun > 0.05 && me.tunKind === "falls") drawFallsMist(ctx, w, h, tnow, tun);
  ctx.restore();

  // screen-space overlays (not tilted)
  ctx.save();
  ctx.beginPath(); ctx.rect(vp.x, vp.y, w, h); ctx.clip();
  ctx.translate(vp.x, vp.y);
  if (SAVAGE()) drawSavageGrade(ctx, w, h);
  if (!race.demo) { drawScreenFX(ctx, w, h, me, race, tnow); drawHUD(ctx, w, h, me, race, tnow); }
  ctx.restore();
}

/* Savage tone: darker, warmer, grittier picture (a multiply tint plus dark edges). The HUD is drawn after this, so it stays bright. */
function drawSavageGrade(ctx, w, h) {
  ctx.globalCompositeOperation = "multiply";
  ctx.fillStyle = "#b8a6a6"; ctx.fillRect(0, 0, w, h);
  ctx.globalCompositeOperation = "source-over";
  const g = ctx.createRadialGradient(w / 2, h / 2, h * 0.4, w / 2, h / 2, h * 1.05);
  g.addColorStop(0, "rgba(14,0,4,0)"); g.addColorStop(1, "rgba(14,0,4,.6)");
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
}

/* Savage tone: blood splats on the screen EDGES after a hard hit (never in the middle, so the road stays visible). */
function drawBloodSplats(ctx, w, h, me) {
  const a = clamp(me.bloodT / 0.6, 0, 1);
  const R = rng(me.bloodSeed || 1);
  const n = 4 + (me.bloodPow || 1) * 3;
  for (let i = 0; i < n; i++) {
    const ang = R() * TAU, rr = 0.9 + R() * 0.25;
    const x = w / 2 + Math.cos(ang) * w * 0.5 * rr, y = h / 2 + Math.sin(ang) * h * 0.55 * rr;
    const s = h * (0.035 + R() * 0.06);
    ctx.globalAlpha = a * 0.88;
    ctx.fillStyle = R() < 0.5 ? "#8f0f1a" : "#b3121f";
    ctx.beginPath(); ctx.arc(x, y, s, 0, TAU); ctx.fill();
    for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.arc(x + (R() - 0.5) * s * 3.2, y + (R() - 0.5) * s * 3.2, s * (0.2 + R() * 0.3), 0, TAU); ctx.fill(); }
    ctx.fillRect(x - s * 0.18, y, s * 0.36, s * (1.4 + R() * 2.2) * (1 - a * 0.4));      // drip
  }
  ctx.globalAlpha = 1;
}

function drawSky(ctx, w, h, hz, biome, t, me) {
  const g = ctx.createLinearGradient(0, -h * 0.1, 0, hz + h * 0.1);
  g.addColorStop(0, biome.sky[0]); g.addColorStop(0.6, biome.sky[1]); g.addColorStop(1, biome.sky[2]);
  ctx.fillStyle = g;
  ctx.fillRect(-w * 0.1, -h * 0.2, w * 1.2, h * 1.3);
  // sun / moon
  const sx = w * biome.sunX - me.bgX * 0.05 % w, sy = h * biome.sunY;
  const rg = ctx.createRadialGradient(sx, sy, 0, sx, sy, h * 0.35);
  rg.addColorStop(0, rgba(biome.sun, 0.9)); rg.addColorStop(0.12, rgba(biome.sun, 0.55)); rg.addColorStop(1, rgba(biome.sun, 0));
  ctx.fillStyle = rg; ctx.fillRect(sx - h * 0.4, sy - h * 0.4, h * 0.8, h * 0.8);
  ctx.fillStyle = biome.sun; ctx.beginPath(); ctx.arc(sx, sy, h * (biome.dark ? 0.04 : 0.055), 0, TAU); ctx.fill();
  if (biome.dark) {
    // stars
    ctx.fillStyle = "#fff";
    for (let i = 0; i < 60; i++) {
      const px = ((i * 137.5 + (-me.bgX * 0.02)) % w + w) % w, py = ((i * 61.3) % (hz * 0.9));
      ctx.globalAlpha = 0.35 + 0.65 * Math.abs(Math.sin(t * 1.3 + i));
      ctx.fillRect(px, py, 1.6, 1.6);
    }
    ctx.globalAlpha = 1;
    // aurora curtains
    ctx.globalCompositeOperation = "lighter";
    for (let b = 0; b < 3; b++) {
      const col = ["#3dffb0", "#38d0ff", "#b35cff"][b];
      ctx.beginPath();
      const y0 = hz * (0.18 + b * 0.12);
      ctx.moveTo(-10, y0);
      for (let px = 0; px <= w + 20; px += 20) ctx.lineTo(px, y0 + Math.sin(px * 0.006 + t * 0.6 + b * 2 - me.bgX * 0.0008) * hz * 0.12);
      for (let px = w + 20; px >= -10; px -= 20) ctx.lineTo(px, y0 + hz * 0.22 + Math.sin(px * 0.008 + t * 0.5 + b) * hz * 0.08);
      ctx.closePath();
      const ag = ctx.createLinearGradient(0, y0 - hz * 0.1, 0, y0 + hz * 0.3);
      ag.addColorStop(0, rgba(col, 0)); ag.addColorStop(0.5, rgba(col, 0.28)); ag.addColorStop(1, rgba(col, 0));
      ctx.fillStyle = ag; ctx.fill();
    }
    ctx.globalCompositeOperation = "source-over";
  }
  if (biome.id === "volcano") {
    ctx.fillStyle = "rgba(40,20,20,.25)";
    for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.ellipse(((i * 300 - me.bgX * 0.1 - t * 8) % (w + 400) + w + 400) % (w + 400) - 200, hz * (0.25 + i * 0.12), w * 0.3, hz * 0.06, 0, 0, TAU); ctx.fill(); }
  }
}

function drawLayer(ctx, img, w, h, hz, off, frac, biome) {
  if (!img) return;
  const lh = h * frac;
  const lw = lh * (img.width / img.height);
  const y = hz - lh * 0.92;
  let x0 = -((off % lw) + lw) % lw - w * 0.1;
  for (let x = x0; x < w * 1.1; x += lw) ctx.drawImage(img, x, y, lw + 1, lh);
  // fill below the layer down to well under the horizon so hills never show sky gaps
  ctx.fillStyle = biome.ground[1];
}

function drawSegment(ctx, w, s, biome, t, maxy) {
  // Every slice is stretched 1px UP (towards the horizon). Slices are drawn near -> far, so the next slice paints over the
  // overlap; this removes the thin ground-coloured lines that used to show across the road between slices.
  const { sx1, sy1, sx2 } = s;
  const sy2 = s.sy2 - 1;
  const y1 = Math.min(sy1, maxy);
  // ground band: same height as the slice, shifted 1px up, so it never paints over the overlap of the slice in front
  // (that is where ground colour used to peek through as a line across the road)
  const gh = Math.max(0, y1 - sy2 - 1);
  const rw1 = s.rw1 * s.w, rw2 = s.rw2 * s.w;
  // ground band (each side can be river, lava, drop-off, rock or ice — see track features)
  if (s.gL || s.gR) {
    const mx = (sx1 + sx2) / 2;
    ctx.fillStyle = sideGround(s.gL, s, biome, t); ctx.fillRect(-w * 0.2, sy2, mx + w * 0.2, gh);
    ctx.fillStyle = sideGround(s.gR, s, biome, t); ctx.fillRect(mx, sy2, w * 1.2 - mx, gh);
  } else {
    ctx.fillStyle = biome.ground[s.dark];
    ctx.fillRect(-w * 0.2, sy2, w * 1.4, gh);
  }
  // rumble edges: two side strips only (nothing is painted under the road surface, so no curb colour can show as a line across it)
  const r1 = rw1 * 1.12, r2 = rw2 * 1.12, i1 = rw1 * 0.97, i2 = rw2 * 0.97, edgeCol = s.bridge ? "#3a2a20" : biome.edge[s.dark];
  quad(ctx, sx1 - r1, sy1, sx1 - i1, sy1, sx2 - i2, sy2, sx2 - r2, sy2, edgeCol);
  quad(ctx, sx1 + i1, sy1, sx1 + r1, sy1, sx2 + r2, sy2, sx2 + i2, sy2, edgeCol);
  // road (planks on bridges)
  quad(ctx, sx1 - rw1, sy1, sx1 + rw1, sy1, sx2 + rw2, sy2, sx2 - rw2, sy2, s.bridge ? biome.plank[0] : biome.road[0]);   // one flat colour: no stripes on the drivable surface
  // tire ruts
  if (s.rw1 > 6 && !s.bridge) {
    for (const rx of [-0.42, 0.42]) {
      const a1 = sx1 + rx * s.rw1, a2 = sx2 + rx * s.rw2;
      quad(ctx, a1 - s.rw1 * 0.06, sy1, a1 + s.rw1 * 0.06, sy1, a2 + s.rw2 * 0.06, sy2, a2 - s.rw2 * 0.06, sy2, biome.rut);
    }
  }
  // split median (fork)
  if (s.split > 0.01) {
    const m1 = s.rw1 * 0.22 * s.split, m2 = s.rw2 * 0.22 * s.split;
    quad(ctx, sx1 - m1 * 1.15, sy1, sx1 + m1 * 1.15, sy1, sx2 + m2 * 1.15, sy2, sx2 - m2 * 1.15, sy2, biome.edge[s.dark]);
    quad(ctx, sx1 - m1, sy1, sx1 + m1, sy1, sx2 + m2, sy2, sx2 - m2, sy2, biome.ground[s.dark]);
  }
  // surface patches
  const sf = s.surface;
  if (sf) {
    const col = { sand: "#f2cf91", ice: "#bfeaff", mud: "#5a2e14", water: "#3a8fd0", lava: "#ff5a1f" }[sf.type];
    const taper = Math.sin((sf.k + 0.5) / sf.len * Math.PI);
    const c = (sf.x0 + sf.x1) / 2, hw = (sf.x1 - sf.x0) / 2 * (sf.type === "water" ? 1.2 : 0.4 + 0.6 * taper);
    let col2 = col;
    if (sf.type === "water") col2 = (s.i + Math.floor(t * 8)) % 3 === 0 ? "#7cc6f2" : col;
    if (sf.type === "lava") col2 = (s.i + Math.floor(t * 6)) % 2 ? "#ff7a1f" : "#ffb347";
    if (sf.type === "ice") col2 = biome.dark ? "#7a9ac2" : "#b2e2fb";
    quad(ctx, sx1 + (c - hw) * s.rw1, sy1, sx1 + (c + hw) * s.rw1, sy1, sx2 + (c + hw) * s.rw2, sy2, sx2 + (c - hw) * s.rw2, sy2, col2);
    if (sf.type === "lava") { const hw2 = hw * 0.35; quad(ctx, sx1 + (c - hw2) * s.rw1, sy1, sx1 + (c + hw2) * s.rw1, sy1, sx2 + (c + hw2) * s.rw2, sy2, sx2 + (c - hw2) * s.rw2, sy2, "#ffe08a"); }
  }
  // boost pads (animated chevrons)
  const d = s.decal;
  if (d && d.type === "boost") {
    const on = ((d.k + Math.floor(t * 12)) % 4) < 2;
    const c = (d.x0 + d.x1) / 2, hw = (d.x1 - d.x0) / 2;
    quad(ctx, sx1 + (c - hw) * s.rw1, sy1, sx1 + (c + hw) * s.rw1, sy1, sx2 + (c + hw) * s.rw2, sy2, sx2 + (c - hw) * s.rw2, sy2, on ? "#2bd9c5" : "#fff35c");
    if (s.rw1 > 20) {
      ctx.fillStyle = on ? "#0d6e66" : "#c48a00";
      const cx1 = sx1 + c * s.rw1, cx2 = sx2 + c * s.rw2;
      ctx.beginPath(); ctx.moveTo(cx1 - hw * s.rw1 * 0.6, sy1); ctx.lineTo(cx2, sy2); ctx.lineTo(cx1 + hw * s.rw1 * 0.6, sy1); ctx.closePath(); ctx.fill();
    }
  }
}

function sideGround(type, s, biome, t) {
  if (!type) return biome.ground[s.dark];
  if (type === "water") return (s.i + Math.floor(t * 5)) % 4 === 0 ? biome.water[1] : biome.water[0];
  if (type === "lava") return (s.i + Math.floor(t * 6)) % 3 === 0 ? "#ff8a2f" : "#ff5a1f";
  if (type === "chasm") return biome.chasm[s.dark];
  if (type === "ice") return biome.dark ? (s.dark ? "#4f6d96" : "#58779f") : (s.dark ? "#bfe0fb" : "#cfe8ff");
  if (type === "rock") return shade(biome.rock[0], s.dark ? -0.5 : -0.42);
  return biome.ground[s.dark];
}

function drawFallsMist(ctx, w, h, t, a) {
  ctx.strokeStyle = `rgba(230,245,255,${0.35 * a})`; ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = 0; i < 26; i++) { const x = ((i * 0.137 + t * 0.03) % 1) * w, y = ((t * 1.6 + i * 0.31) % 1) * h; ctx.moveTo(x, y); ctx.lineTo(x - 2, y + h * 0.12); }
  ctx.stroke();
  ctx.fillStyle = `rgba(120,190,220,${0.12 * a})`; ctx.fillRect(0, 0, w, h);
}

function quad(ctx, x1, y1, x2, y2, x3, y3, x4, y4, col) {
  ctx.fillStyle = col;
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.lineTo(x3, y3); ctx.lineTo(x4, y4); ctx.closePath(); ctx.fill();
}

function drawSprite(ctx, S, sx, sy, sc, clipY, alpha, flat) {
  const dw = S.ww * sc, dh = S.wh * sc;
  if (dw < 1.5 || dh < 1.5) return;
  const dx = sx - dw / 2, dy = sy - dh;
  if (dy >= clipY) return;
  const visH = Math.min(dh, clipY - dy);
  const srcH = S.c.height * (visH / dh);
  if (alpha < 0.98) ctx.globalAlpha = alpha;
  ctx.drawImage(S.c, 0, 0, S.c.width, srcH, dx, dy, dw, visH);
  if (alpha < 0.98) ctx.globalAlpha = 1;
}

/* Riders, projectiles, particles inside a segment */
function drawEntity(ctx, e, s, K, me, race, glows, t) {
  const pct = (e.z - s.i * SEG) / SEG;
  const sc = lerp(s.sc1, s.sc2, pct) * K;
  const cx = lerp(s.sx1, s.sx2, pct), cy = lerp(s.sy1, s.sy2, pct);
  const rw = lerp(s.rw1, s.rw2, pct);
  const px = cx + e.x * rw, py = cy;
  if (py - 10 > s.clip && !e.h) return;
  if (e.type === "rider") return drawRider(ctx, e, px, py, sc, s.clip, me, race, glows, t);
  if (e.type === "proj") {
    const img = race.assets.items[e.item];
    const size = 380 * sc * (e.big ? 1.6 : 1);
    const yy = py - e.h * sc;
    ctx.save(); ctx.translate(px, yy); ctx.rotate(t * 12);
    ctx.drawImage(img, -size / 2, -size / 2, size, size); ctx.restore();
    ctx.fillStyle = "rgba(0,0,0,.25)"; ctx.beginPath(); ctx.ellipse(px, py, size * 0.4, size * 0.12, 0, 0, TAU); ctx.fill();
    if (race.track.biome.dark) glows.push([px, yy, size * 1.4, ITEMS[e.item].col]);
    return;
  }
  if (e.type === "fx") {
    const r = Math.max(1, e.size * sc);
    ctx.globalAlpha = clamp(e.life / e.max, 0, 1);
    ctx.fillStyle = e.col;
    ctx.beginPath(); ctx.arc(px, py - e.h * sc, r, 0, TAU); ctx.fill();
    ctx.globalAlpha = 1;
  }
}

function riderPose(e, t) {
  if (e.wipeT > 0) return "hurt";
  if (e.trick) return e.trick.def.pose === "spin" ? "ride0" : e.trick.def.pose;
  if (e.atkT > 0) return (e.atkKick ? "kick" : "punch") + (e.atkSide < 0 ? "L" : "R");
  if (e.hurtT > 0) return "hurt";
  return Math.floor(e.pedal) % 2 ? "ride1" : "ride0";
}

function drawRider(ctx, e, px, py, sc, clipY, me, race, glows, t) {
  const spr = e.sprites[riderPose(e, t)];
  const vw = e.veh.sw || e.veh.w * 1.25, vh = vw * (SPRITE_H / SPRITE_W);
  const dw = vw * sc, dh = vh * sc;
  if (dw < 2) return;
  const lift = e.h * sc;
  // shadow
  const shs = clamp(1 - e.h / 3000, 0.3, 1);
  ctx.fillStyle = "rgba(0,0,0,.32)";
  ctx.beginPath(); ctx.ellipse(px, py, dw * 0.3 * shs * (e.veh.shove ? 1.4 : 1), dw * 0.07 * shs, 0, 0, TAU); ctx.fill();
  let rot = e.lean * 0.32 + (e.wobble > 0 ? Math.sin(t * 40) * 0.12 * e.wobble : 0);
  if (e.wipeT > 0) rot = e.wipeT * 9;
  if (e.trick && e.trick.def.pose === "spin") rot = (e.trick.t / e.trick.dur) * TAU;
  const y = py - lift;
  if (y - dh > clipY) return;
  ctx.save();
  ctx.translate(px, y - (e.wipeT > 0 ? dh * 0.3 : 0));
  ctx.rotate(rot);
  if (e.flash > 0 && Math.floor(t * 30) % 2) ctx.globalAlpha = 0.5;
  if (e.invuln > 0 && Math.floor(t * 16) % 2) ctx.globalAlpha = 0.55;
  ctx.drawImage(spr, -dw / 2, -dh * (e.wipeT > 0 ? 0.5 : 0.98), dw, dh);
  ctx.globalAlpha = 1;
  ctx.restore();
  // hit stars
  if (e.hurtT > 0 || e.wipeT > 0) {
    ctx.fillStyle = "#ffd23f";
    for (let i = 0; i < 3; i++) {
      const a = t * 6 + i * 2.1;
      star(ctx, px + Math.cos(a) * dw * 0.35, y - dh * 1.02 + Math.sin(a) * dh * 0.06, dw * 0.07);
    }
  }
  // burning flames (the grey low-health smoke circles above riders were removed: they read as a light blinking over the rider)
  if (e.burnT > 0) {
    ctx.fillStyle = "rgba(255,120,40,.55)";
    for (let i = 0; i < 3; i++) { const ph = (t * 1.5 + i / 3) % 1; ctx.beginPath(); ctx.arc(px + Math.sin(t * 3 + i) * dw * 0.1, y - dh * (0.5 + ph * 0.7), dw * (0.06 + ph * 0.1), 0, TAU); ctx.fill(); }
  }
  // boost flame
  if (e.boosting || e.padT > 0) {
    const fl = dw * (0.18 + Math.random() * 0.08);
    const g = ctx.createRadialGradient(px, y - dh * 0.12, 0, px, y - dh * 0.12, fl * 1.6);
    g.addColorStop(0, "rgba(255,255,220,.95)"); g.addColorStop(0.4, e.padT > 0 ? "rgba(43,217,197,.8)" : "rgba(255,140,30,.8)"); g.addColorStop(1, "rgba(255,60,0,0)");
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(px, y - dh * 0.12, fl * 1.6, 0, TAU); ctx.fill();
  }
  // markers above other humans / everyone in split mode
  if (e !== me && e.human) {
    ctx.fillStyle = e.pIndex === 0 ? "#2bd9c5" : "#ff3d7f";
    const my = y - dh * 1.1;
    ctx.beginPath(); ctx.moveTo(px - 10, my - 16); ctx.lineTo(px + 10, my - 16); ctx.lineTo(px, my - 2); ctx.closePath(); ctx.fill();
    ctx.font = "16px Bangers, sans-serif"; ctx.textAlign = "center"; ctx.fillText("P" + (e.pIndex + 1), px, my - 20);
  }
  if ((race.track.biome.dark || (me.tunT || 0) > 0.05) && e !== me) glows.push([px, y - dh * 0.85, Math.min(dw * 0.7, 90), "#fff2c0"]);
}

function star(ctx, x, y, r) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
  ctx.closePath(); ctx.fill();
}

/* Weather particles in screen space (per view) */
function drawWeather(ctx, w, h, biome, race, me, t) {
  const sp = me.speed / 11000;
  const P = me.weather || (me.weather = Array.from({ length: 70 }, () => [Math.random(), Math.random(), Math.random()]));
  const kind = biome.weather;
  if (kind === "rain") {
    ctx.strokeStyle = "rgba(200,225,255,.55)"; ctx.lineWidth = 1.5; ctx.beginPath();
    for (const p of P) {
      p[1] += 0.035 + sp * 0.02; p[0] -= 0.004 + me.lean * 0.01;
      if (p[1] > 1) { p[1] -= 1; p[0] = Math.random(); }
      const x = ((p[0] % 1) + 1) % 1 * w, y = p[1] * h;
      ctx.moveTo(x, y); ctx.lineTo(x - 4 - sp * 6, y + 18 + sp * 14);
    }
    ctx.stroke();
    ctx.fillStyle = "rgba(60,80,90,.12)"; ctx.fillRect(0, 0, w, h);
  } else if (kind === "snow" || kind === "aurora") {
    ctx.fillStyle = "rgba(255,255,255,.85)";
    for (const p of P) {
      p[1] += 0.004 + p[2] * 0.004 + sp * 0.006; p[0] += Math.sin(t + p[2] * 9) * 0.0015 - me.lean * 0.004;
      if (p[1] > 1) { p[1] -= 1; p[0] = Math.random(); }
      const x = ((p[0] % 1) + 1) % 1 * w, y = p[1] * h;
      ctx.beginPath(); ctx.arc(x, y, 1.2 + p[2] * 2.4, 0, TAU); ctx.fill();
    }
  } else if (kind === "ash") {
    for (const p of P) {
      p[1] += 0.003 + p[2] * 0.003; p[0] += 0.001 - me.lean * 0.003;
      if (p[1] > 1) { p[1] -= 1; p[0] = Math.random(); }
      const x = ((p[0] % 1) + 1) % 1 * w, y = p[1] * h;
      ctx.fillStyle = p[2] > 0.75 ? `rgba(255,${120 + p[2] * 100 | 0},40,${0.6 + Math.sin(t * 8 + p[2] * 20) * 0.3})` : "rgba(70,60,60,.7)";
      ctx.fillRect(x, y, 2 + p[2] * 2, 2 + p[2] * 2);
    }
    const g = ctx.createLinearGradient(0, h, 0, h * 0.5);
    g.addColorStop(0, "rgba(255,80,20,.18)"); g.addColorStop(1, "rgba(255,80,20,0)");
    ctx.fillStyle = g; ctx.fillRect(0, h * 0.5, w, h * 0.5);
  } else if (kind === "sand") {
    const a = 0.25 + race.stormFog * 0.6;
    ctx.fillStyle = `rgba(240,200,140,${a})`;
    for (const p of P) {
      p[0] -= 0.006 + p[2] * 0.01 + race.stormFog * 0.02; p[1] += 0.002;
      if (p[0] < 0) { p[0] += 1; p[1] = Math.random(); }
      if (p[1] > 1) p[1] -= 1;
      ctx.fillRect(p[0] * w, p[1] * h, 6 + p[2] * 10, 1.5);
    }
    if (race.stormFog > 0) { ctx.fillStyle = `rgba(214,160,96,${race.stormFog * 0.45})`; ctx.fillRect(0, 0, w, h); }
  } else if (kind === "shafts") {
    // (the drifting light beams were removed: they looked like a flashing light shining down on the riders)
    ctx.fillStyle = "#d9772f";
    for (let i = 0; i < 14; i++) {
      const p = P[i];
      p[1] += 0.002 + p[2] * 0.002; p[0] += Math.sin(t * 2 + i) * 0.002;
      if (p[1] > 1) { p[1] = 0; p[0] = Math.random(); }
      ctx.save(); ctx.translate(((p[0] % 1) + 1) % 1 * w, p[1] * h); ctx.rotate(t * 2 + i);
      ctx.fillRect(-4, -2, 8, 4); ctx.restore();
    }
  }
}

function drawDarkness(ctx, w, h, hz, glows, me, k = 1) {
  // dark overlay with a headlamp cone, then additive glows (k = strength; tunnels use a partial version)
  const g = ctx.createRadialGradient(w / 2, h * 0.68, h * 0.06, w / 2, h * 0.55, h * 0.95);
  g.addColorStop(0, "rgba(5,10,30,0)"); g.addColorStop(0.45, `rgba(5,10,30,${0.35 * k})`); g.addColorStop(1, `rgba(3,6,20,${0.82 * k})`);
  ctx.fillStyle = g; ctx.fillRect(-w * 0.2, -h * 0.2, w * 1.4, h * 1.4);
  ctx.globalCompositeOperation = "lighter";
  const beam = ctx.createLinearGradient(0, h * 0.85, 0, hz);
  beam.addColorStop(0, `rgba(255,240,190,${0.2 * k})`); beam.addColorStop(1, "rgba(255,240,190,0)");
  ctx.fillStyle = beam;
  ctx.beginPath(); ctx.moveTo(w * 0.45, h * 0.85); ctx.lineTo(w * 0.55, h * 0.85); ctx.lineTo(w * 0.78, hz + h * 0.02); ctx.lineTo(w * 0.22, hz + h * 0.02); ctx.closePath(); ctx.fill();
  for (let [x, y, r, c] of glows) {
    if (r < 2) continue;
    r = Math.min(r, h * 0.35);
    const gg = ctx.createRadialGradient(x, y, 0, x, y, r);
    gg.addColorStop(0, rgba(c, 0.45 * Math.min(1, k + 0.2))); gg.addColorStop(1, rgba(c, 0));
    ctx.fillStyle = gg; ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
  ctx.globalCompositeOperation = "source-over";
}

/* Speed streaks: thin white lines flowing outward along the far LEFT and RIGHT edges only (never over the road or the
   rider), when you're near top speed, and thicker on boost / boost pads / drift turbos. Each streak fades in and out
   smoothly, so nothing flashes. Strength eases in and out with me.streakK. */
function drawSpeedStreaks(ctx, w, h, me, t) {
  const pct = me.speed / (me.maxSpd || 1);
  const tgt = me.boosting || me.padT > 0 ? 1 : clamp((pct - 0.88) / 0.12, 0, 1) * 0.55;
  me.streakK = lerp(me.streakK || 0, me.wipeT > 0 || me.finished ? 0 : tgt, 0.08);
  const k = me.streakK;
  if (k < 0.03) return;
  const band = w * 0.15, thick = me.padT > 0 ? 3.2 : me.boosting ? 2.6 : 1.8;
  ctx.save();
  ctx.lineCap = "round"; ctx.strokeStyle = me.padT > 0 ? "#c8fff6" : "#ffffff"; ctx.lineWidth = thick;
  for (let side = -1; side <= 1; side += 2) {
    for (let i = 0; i < 12; i++) {
      const r1 = ((i * 97 + (side > 0 ? 31 : 0)) % 101) / 101, r2 = ((i * 53 + 17) % 89) / 89, r3 = ((i * 29 + 7) % 61) / 61;
      const ph = (t * (1.5 + r2 * 0.9) * (0.7 + 0.5 * k) + r1) % 1;
      const y = h * (0.3 + r3 * 0.62) + ph * h * 0.06;
      const len = band * (0.35 + 0.45 * ph);
      const xin = band * (1 - ph * 1.1);                       // inner end slides out toward the screen edge
      const x0 = side < 0 ? xin : w - xin, x1 = side < 0 ? xin - len : w - xin + len;
      ctx.globalAlpha = k * 0.42 * Math.sin(ph * Math.PI);
      ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y + len * 0.12); ctx.stroke();
    }
  }
  ctx.restore();
}

function drawScreenFX(ctx, w, h, me, race, t) {
  drawSpeedStreaks(ctx, w, h, me, t);
  // damage flash
  // (red glow on the screen edges only: the middle stays clear so you can still see the road)
  if (me.flash > 0) {
    const g = ctx.createRadialGradient(w / 2, h / 2, h * 0.5, w / 2, h / 2, h * 0.95);
    g.addColorStop(0, "rgba(255,40,40,0)"); g.addColorStop(1, `rgba(${SAVAGE() ? "170,10,20" : "255,30,30"},${me.flash * 0.62})`);
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  }
  if (SAVAGE() && me.bloodT > 0) drawBloodSplats(ctx, w, h, me);
  // paint / sand splat blind
  if (me.blindT > 0) {
    const a = clamp(me.blindT / 1.2, 0, 1);
    ctx.fillStyle = rgba(me.blindCol || "#38e05a", 0.75 * a);
    const R = rng(7);
    for (let i = 0; i < 7; i++) { ctx.beginPath(); ctx.arc(w * (0.15 + R() * 0.7), h * (0.15 + R() * 0.6), h * (0.08 + R() * 0.14), 0, TAU); ctx.fill(); }
  }
  // low health vignette
  if (me.hp / me.maxHp < 0.3 && me.wipeT <= 0) {
    const g = ctx.createRadialGradient(w / 2, h / 2, h * 0.3, w / 2, h / 2, h * 0.9);
    g.addColorStop(0, "rgba(255,0,0,0)"); g.addColorStop(1, `rgba(200,0,0,0.25)`);
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  }
  // avalanche behind you
  if (race.avalanche) {
    const d = me.z - race.avalanche.z;
    if (d < 5000) {
      const a = clamp(1 - d / 5000, 0, 1);
      const g = ctx.createLinearGradient(0, h, 0, h * (1 - 0.5 * a));
      g.addColorStop(0, `rgba(255,255,255,${0.95 * a})`); g.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = g; ctx.fillRect(0, h * 0.4, w, h * 0.6);
    }
  }
}

/* ---------------- HUD ---------------- */
function hudText(ctx, txt, x, y, size, col, align = "left", stroke = "#14101c") {
  ctx.font = `${size}px Bangers, Impact, sans-serif`;
  ctx.textAlign = align; ctx.textBaseline = "alphabetic";
  ctx.lineWidth = Math.max(3, size * 0.16); ctx.strokeStyle = stroke; ctx.lineJoin = "round";
  ctx.strokeText(txt, x, y); ctx.fillStyle = col; ctx.fillText(txt, x, y);
}
function ordinal(n) { return n + (n === 1 ? "st" : n === 2 ? "nd" : n === 3 ? "rd" : "th"); }

function drawHUD(ctx, w, h, me, race, t) {
  const u = Math.min(w, h * 1.6) / 100;      // HUD unit
  const pad = Math.max(10, u * 1.6) + (me.vpIndex === 0 ? race.safeL || 0 : 0);
  const padR = Math.max(10, u * 1.6) + (me.vpIndex === race.humans.length - 1 ? race.safeR || 0 : 0);
  const top = Math.max(8, u * 1.4) + (race.safeT || 0);
  // place
  hudText(ctx, String(me.place), pad, top + u * 7.4, u * 8.2, "#ffd23f");
  ctx.font = `${u * 3.4}px Bangers, Impact, sans-serif`;
  const pw = ctx.measureText(String(me.place)).width;
  hudText(ctx, ordinal(me.place).slice(-2) + " / " + race.riders.length, pad + pw + u * 4.5 + u * 0.6, top + u * 4.2, u * 3.2, "#fff");
  // health bar with portrait
  const bx = pad, by = top + u * 9.4, bw = u * 26, bh = u * 2.6;
  if (me.face) ctx.drawImage(me.face, bx, by - u * 0.6, u * 4.2, u * 4.2);
  const hx = bx + u * 4.8;
  ctx.fillStyle = "rgba(10,8,20,.6)"; roundRect(ctx, hx, by, bw, bh, bh / 2); ctx.fill();
  const hp = clamp(me.hpShow / me.maxHp, 0, 1);
  const hcol = hp > 0.55 ? "#2bd96a" : hp > 0.28 ? "#ffcf3a" : "#ff3b3b";
  ctx.fillStyle = hcol; roundRect(ctx, hx + 2, by + 2, (bw - 4) * hp, bh - 4, (bh - 4) / 2); ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,.35)"; ctx.fillRect(hx + bh / 2, by + 3, Math.max(0, (bw - 4) * hp - bh), (bh - 6) * 0.35);
  hudText(ctx, "HP", hx + bw + u * 0.8, by + bh * 0.9, u * 2.2, "#fff");
  // damage taken, shown on the health bar instead of floating over the rider
  if (me.dmgT > 0 && me.dmgAmt >= 1) {
    ctx.globalAlpha = clamp(me.dmgT / 0.5, 0, 1);
    hudText(ctx, "-" + Math.round(me.dmgAmt), hx + bw + u * 5.4, by + bh * 0.95, u * 2.6, "#ff5a5a");
    ctx.globalAlpha = 1;
  }
  // boost meter
  const my = by + bh + u * 1.1;
  ctx.fillStyle = "rgba(10,8,20,.6)"; roundRect(ctx, hx, my, bw, bh * 0.75, bh * 0.37); ctx.fill();
  const bm = clamp(me.boost / 100, 0, 1);
  const bg = ctx.createLinearGradient(hx, 0, hx + bw, 0); bg.addColorStop(0, "#2b9cff"); bg.addColorStop(1, me.boost >= 99 ? (Math.floor(t * 8) % 2 ? "#ffffff" : "#2bd9c5") : "#2bd9c5");
  ctx.fillStyle = bg; roundRect(ctx, hx + 2, my + 2, (bw - 4) * bm, bh * 0.75 - 4, (bh * 0.75 - 4) / 2); ctx.fill();
  hudText(ctx, "BOOST", hx + bw + u * 0.8, my + bh * 0.66, u * 1.8, "#bff6ff");
  // items
  const iy = my + bh + u * 1.0;
  for (let i = 0; i < 3; i++) {
    const ix = hx + i * u * 5.4;
    ctx.fillStyle = i < me.items.length ? "rgba(255,210,63,.25)" : "rgba(10,8,20,.45)";
    roundRect(ctx, ix, iy, u * 4.8, u * 4.8, u * 1.2); ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,.35)"; ctx.lineWidth = 1.5; ctx.stroke();
    if (me.items[i]) ctx.drawImage(race.assets.items[me.items[i]], ix + u * 0.4, iy + u * 0.4, u * 4, u * 4);
  }
  // Daily Spin perks that are active this race (small chips under the item slots)
  let cy2 = iy + u * 5.6;
  const chip = (txt, col) => { hudText(ctx, txt, hx, cy2, u * 2, col, "left"); cy2 += u * 2.3; };
  if (me.shield > 0) chip("SHIELD READY", "#2bd9c5");
  if (me.coinMul > 1) chip("DOUBLE COINS", "#ffd23f");
  if (me.itemMul > 1) chip("POWER THROWS", "#ff8a1c");
  // speed (bottom center-ish)
  const kmh = Math.round(me.speed / 11000 * 88);
  const sx = w / 2, sy = h - (race.touch ? u * 2.4 : u * 3);
  hudText(ctx, String(kmh), sx, sy, u * 6, me.boosting || me.padT > 0 ? "#2bd9c5" : "#fff", "center");
  hudText(ctx, "KM/H", sx + u * 6.2, sy, u * 2, "#ffd23f", "left");
  // progress bar (top center)
  const pbw = Math.min(w * 0.36, u * 46), pbx = w / 2 - pbw / 2, pby = top + u * 1.2;
  ctx.fillStyle = "rgba(10,8,20,.55)"; roundRect(ctx, pbx, pby, pbw, u * 1.4, u * 0.7); ctx.fill();
  const prog = (z) => clamp((z - race.track.startZ) / (race.track.finishZ - race.track.startZ), 0, 1);
  if (race.avalanche) { ctx.fillStyle = "#ffffff"; ctx.fillRect(pbx, pby, pbw * prog(race.avalanche.z), u * 1.4); }
  for (const r of race.riders) {
    if (r === me) continue;
    ctx.fillStyle = r.human ? (r.pIndex === 0 ? "#2bd9c5" : "#ff3d7f") : r.rider.main;
    ctx.beginPath(); ctx.arc(pbx + pbw * prog(r.z), pby + u * 0.7, u * 0.8, 0, TAU); ctx.fill();
  }
  ctx.fillStyle = "#fff"; ctx.strokeStyle = "#14101c"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(pbx + pbw * prog(me.z), pby + u * 0.7, u * 1.2, 0, TAU); ctx.fill(); ctx.stroke();
  hudText(ctx, "🏁", pbx + pbw + u * 1.2, pby + u * 1.5, u * 2.2, "#fff");
  // timer
  const tt = race.time;
  hudText(ctx, fmtTime(tt), w - padR - (race.touch && !race.split ? 46 : 0), top + u * 4.2, u * 3.4, "#fff", "right");
  if (race.avalanche) {
    const d = Math.max(0, Math.round((me.z - race.avalanche.z) / 40));
    hudText(ctx, "AVALANCHE " + d + "m", w / 2, pby + u * 5, u * 2.8, d < 60 ? (Math.floor(t * 6) % 2 ? "#ff3b3b" : "#fff") : "#d8ecff", "center");
  }
  if (race.stormWarn > 0) hudText(ctx, "SANDSTORM!", w / 2, pby + u * 5, u * 3.4, "#ffcf3a", "center");
  // incoming projectile warning (they come from behind the camera)
  for (const p of race.projs) {
    if (p.owner === me || p.dir < 0) continue;
    const dz = me.z - p.z;
    if (dz < 0 || dz > 3200 || Math.abs(p.x - me.x) > 0.7) continue;
    const ax = w / 2 + (p.x - me.camX) * w * 0.32, ay = h - u * 9 - (1 - dz / 3200) * u * 4;
    const a = 0.5 + 0.5 * Math.sin(t * 20);
    ctx.globalAlpha = 0.6 + a * 0.4;
    ctx.fillStyle = "#ff3b3b";
    ctx.beginPath(); ctx.moveTo(ax, ay - u * 3.4); ctx.lineTo(ax + u * 2.6, ay + u * 1.2); ctx.lineTo(ax - u * 2.6, ay + u * 1.2); ctx.closePath(); ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = "#fff"; ctx.stroke();
    hudText(ctx, "!", ax, ay + u * 0.6, u * 3, "#fff", "center", "#ff3b3b");
    ctx.globalAlpha = 1;
  }
  // event feed: tricks, hits, pickups. Small lines stacked in the top-right corner (under the timer) so nothing
  // ever covers the rider or the road in the middle of the screen. Newest line is on top and fades after ~1.2 s.
  let fy = top + u * 8.6;
  for (const p of me.popups) {
    const a = clamp(p.t / 0.18, 0, 1) * clamp(p.life / 0.4, 0, 1);
    const s = u * (p.big ? 3.1 : 2.3);
    ctx.globalAlpha = a;
    const fx = w - padR + (1 - clamp(p.t / 0.2, 0, 1)) * u * 4;
    hudText(ctx, p.txt, fx, fy, s, p.col || "#fff", "right");
    fy += s * 0.95;
    if (p.sub) { hudText(ctx, p.sub, fx, fy, s * 0.62, "#ffd23f", "right"); fy += s * 0.62; }
    ctx.globalAlpha = 1;
    fy += u * 0.5;
  }
  // countdown
  if (race.resumeT > 0) {
    const n = Math.ceil(race.resumeT), f = race.resumeT % 1;
    hudText(ctx, String(n), w / 2, h * 0.5, u * (12 + f * 6), ["#2bd96a", "#2bd96a", "#ffd23f", "#ff8a1c"][n] || "#fff", "center");
  } else if (race.countdown > 0) {
    const n = Math.ceil(race.countdown);
    const f = race.countdown % 1;
    hudText(ctx, String(n), w / 2, h * 0.5, u * (14 + f * 8), ["#2bd96a", "#ffd23f", "#ff8a1c", "#ff3b3b"][n] || "#fff", "center");
  } else if (race.time < 1) {
    hudText(ctx, "GO!", w / 2, h * 0.5, u * 16 * (1 + (1 - race.time) * 0.4), "#2bd96a", "center");
  }
  if (me.finished) {
    hudText(ctx, ordinal(me.place).toUpperCase() + " PLACE!", w / 2, h * 0.42, u * 9, me.place === 1 ? "#ffd23f" : "#fff", "center");
    hudText(ctx, fmtTime(me.finishTime), w / 2, h * 0.42 + u * 7, u * 4.2, "#bff6ff", "center");
  }
  // warning sits under the progress bar at the top, not over the road
  if (me.wrongWay) hudText(ctx, "STAY ON THE TRAIL!", w / 2, pby + u * (race.avalanche || race.stormWarn > 0 ? 9.2 : 5), u * 2.8, "#ff8a1c", "center");
}

function fmtTime(t) {
  const m = Math.floor(t / 60), s = t - m * 60;
  return m + ":" + (s < 10 ? "0" : "") + s.toFixed(2);
}
function roundRect(ctx, x, y, w, h, r) {
  r = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}
