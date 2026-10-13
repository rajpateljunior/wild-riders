/* Touch + keyboard input. Builds per-player input snapshots and draws the on-screen controls. */

const Input = {
  players: [mkPlayerInput(), mkPlayerInput()],
  touches: {},
  layout: null,       // computed per frame from canvas size + mode
  keys: {},
  enabled: false,
  split: false,
  onPause: null,
};

function mkPlayerInput() {
  return { steer: 0, touchSteer: 0, brake: false, boost: false, attackQ: 0, backQ: 0, trickQ: 0, superQ: 0, supReady: false, steerTouch: null, anchor: null, knob: null, btn: {} };
}

function computeLayout(W, H, split, safe) {
  const L = { W, H, split, players: [] };
  const n = split ? 2 : 1;
  for (let p = 0; p < n; p++) {
    const x0 = split ? (p * W) / 2 : 0, w = split ? W / 2 : W;
    const R = clamp(Math.min(w * 0.085, H * 0.12), 30, 62);
    const pad = Math.max(14, R * 0.35);
    const sr = p === n - 1 ? safe.r : 0, sl = p === 0 ? safe.l : 0;
    const atk = { x: x0 + w - pad - R * 1.15 - sr, y: H - pad - R * 1.15 - safe.b, r: R * 1.15 };
    const bst = { x: atk.x - R * 0.35, y: atk.y - R * 2.55, r: R * 0.92 };
    const brk = { x: atk.x - R * 2.45, y: atk.y + R * 0.2, r: R * 0.85 };
    const sup = { x: bst.x - R * 2.2, y: bst.y + R * 0.15, r: R * 0.9 };   // SUPER: next to BOOST, above DRIFT (only shown when the meter is full)
    L.players.push({
      x0, w, R, atk, bst, brk, sup,
      steerZone: { x: x0 + sl, y: H * 0.22, w: w * 0.48, h: H * 0.78 },
      ghost: { x: x0 + sl + pad + R * 1.5, y: H - pad - R * 1.95 - safe.b },
      steerRange: R * 1.15,
    });
  }
  L.pause = split ? { x: W / 2, y: H - 26 - safe.b, r: 20 } : { x: W - 30 - safe.r, y: 26 + safe.t, r: 20 };
  return L;
}

function hitBtn(b, x, y, k = 1.3) { const dx = x - b.x, dy = y - b.y; return dx * dx + dy * dy < (b.r * k) * (b.r * k); }

function touchRole(x, y) {
  const L = Input.layout;
  if (!L) return null;
  if (hitBtn(L.pause, x, y, 1.6)) return { role: "pause" };
  for (let p = 0; p < L.players.length; p++) {
    const P = L.players[p];
    if (x < P.x0 || x > P.x0 + P.w) continue;
    if (hitBtn(P.atk, x, y)) return { role: "atk", p };
    if (hitBtn(P.bst, x, y)) return { role: "bst", p };
    if (hitBtn(P.brk, x, y)) return { role: "brk", p };
    if (Input.players[p].supReady && hitBtn(P.sup, x, y, 1.2)) return { role: "sup", p };
    const z = P.steerZone;
    if (x >= z.x && x <= z.x + z.w && y >= z.y) return { role: "steer", p };
    if (x > z.x + z.w) return { role: "swipe", p };
  }
  return null;
}

function initInput(canvas) {
  const pt = (t) => { const r = canvas.getBoundingClientRect(); return [t.clientX - r.left, t.clientY - r.top]; };
  const start = (e) => {
    if (!Input.enabled) return;
    e.preventDefault();
    SFX.unlock();
    for (const t of e.changedTouches) {
      const [x, y] = pt(t);
      const role = touchRole(x, y);
      if (!role) continue;
      Input.touches[t.identifier] = Object.assign(role, { sx: x, sy: y, x, y, t0: now() });
      const P = Input.players[role.p];
      if (role.role === "pause") Input.onPause && Input.onPause();
      if (role.role === "steer") { P.anchor = [x, y]; P.knob = [x, y]; P.steerTouch = t.identifier; }
      if (role.role === "bst") P.boost = true;
      if (role.role === "brk") P.brake = true;
      if (role.role === "atk") P.btn.atk = true;
      if (role.role === "sup") { P.superQ = 1; P.btn.sup = true; }
    }
  };
  const move = (e) => {
    if (!Input.enabled) return;
    e.preventDefault();
    for (const t of e.changedTouches) {
      const T = Input.touches[t.identifier];
      if (!T) continue;
      const [x, y] = pt(t);
      T.x = x; T.y = y;
      if (T.role === "steer") {
        const P = Input.players[T.p], range = Input.layout.players[T.p].steerRange;
        let dx = x - P.anchor[0];
        if (Math.abs(dx) > range * 1.4) { P.anchor[0] = x - sign(dx) * range * 1.4; dx = sign(dx) * range * 1.4; }
        P.knob = [x, P.anchor[1]];            // the knob only slides sideways
        P.touchSteer = clamp(dx / range, -1, 1);   // left / right only: the bike accelerates by itself
      }
    }
  };
  const end = (e) => {
    e.preventDefault();
    for (const t of e.changedTouches) {
      const T = Input.touches[t.identifier];
      if (!T) continue;
      delete Input.touches[t.identifier];
      const P = Input.players[T.p];
      if (!P) continue;
      if (T.role === "steer") { P.touchSteer = 0; P.anchor = null; P.knob = null; P.steerTouch = null; }
      if (T.role === "bst") P.boost = Object.values(Input.touches).some((o) => o.role === "bst" && o.p === T.p);
      if (T.role === "brk") P.brake = Object.values(Input.touches).some((o) => o.role === "brk" && o.p === T.p);
      if (T.role === "sup") P.btn.sup = false;
      if (T.role === "atk" || T.role === "swipe") {
        P.btn.atk = false;
        const dx = T.x - T.sx, dy = T.y - T.sy, dist = Math.hypot(dx, dy);
        const air = Input.airborne && Input.airborne[T.p];
        if (dist > 26) {
          // swipe: in the air picks a trick; on the ground a downward swipe throws backward
          let trick = Math.abs(dx) > Math.abs(dy) ? 3 : dy < 0 ? 2 : 4;
          if (air) P.trickQ = trick;
          else if (dy > 20 && Math.abs(dy) > Math.abs(dx)) P.backQ++;
          else if (T.role === "atk") P.attackQ++;
        } else if (T.role === "atk") {
          if (air) P.trickQ = 1; else P.attackQ++;
        } else if (air) P.trickQ = 1;
      }
    }
  };
  canvas.addEventListener("touchstart", start, { passive: false });
  canvas.addEventListener("touchmove", move, { passive: false });
  canvas.addEventListener("touchend", end, { passive: false });
  canvas.addEventListener("touchcancel", end, { passive: false });

  // keyboard (desktop / iPad keyboard)
  const KEYMAP = {
    // P1
    KeyA: [0, "left"], KeyD: [0, "right"], KeyW: [0, "up"], KeyS: [0, "stop"], KeyF: [0, "atk"], KeyG: [0, "boost"], KeyE: [0, "drift"], Space: [0, "atk"], ShiftLeft: [0, "boost"], KeyR: [0, "super"], KeyQ: [0, "super"],
    // P2 (or P1 in single player)
    ArrowLeft: [1, "left"], ArrowRight: [1, "right"], ArrowUp: [1, "up"], ArrowDown: [1, "stop"], KeyL: [1, "atk"], KeyK: [1, "boost"], KeyJ: [1, "drift"], Enter: [1, "atk"], ShiftRight: [1, "boost"], KeyI: [1, "super"],
  };
  window.addEventListener("keydown", (e) => {
    if (e.code === "Escape" || e.code === "KeyP") { Input.onPause && Input.enabled && Input.onPause(); return; }
    const m = KEYMAP[e.code];
    if (!m || !Input.enabled) return;
    e.preventDefault();
    SFX.unlock();
    const p = Input.split ? m[0] : 0;
    if (Input.keys[e.code]) return;
    Input.keys[e.code] = true;
    const P = Input.players[p];
    if (m[1] === "super") P.superQ = 1;
    if (m[1] === "atk") {
      const air = Input.airborne && Input.airborne[p];
      const k = Input.keys;
      const up = k.KeyW || k.ArrowUp, down = k.KeyS || k.ArrowDown, side = k.KeyA || k.KeyD || k.ArrowLeft || k.ArrowRight;
      if (air) P.trickQ = up ? 2 : down ? 4 : side ? 3 : 1;
      else if (down) P.backQ++;
      else P.attackQ++;
    }
  });
  window.addEventListener("keyup", (e) => { Input.keys[e.code] = false; });
}

function readPlayer(p) {
  const P = Input.players[p];
  const k = Input.keys;
  // [left, right, drift, boost, (unused), brake] -- the bike always accelerates by itself, so there is no gas key
  const sets = Input.split ? [[["KeyA"], ["KeyD"], ["KeyE"], ["KeyG", "ShiftLeft"], ["KeyW"], ["KeyS"]], [["ArrowLeft"], ["ArrowRight"], ["KeyJ"], ["KeyK", "ShiftRight"], ["ArrowUp"], ["ArrowDown"]]][p]
    : [["KeyA", "ArrowLeft"], ["KeyD", "ArrowRight"], ["KeyE", "KeyJ"], ["KeyG", "KeyK", "ShiftLeft", "ShiftRight"], ["KeyW", "ArrowUp"], ["KeyS", "ArrowDown"]];
  const any = (arr) => arr.some((c) => k[c]);
  let ks = (any(sets[1]) ? 1 : 0) - (any(sets[0]) ? 1 : 0);
  if (ks) P.steer = clamp(P.steer + ks * 0.12, -1, 1); else if (!P.anchor) P.steer = 0;
  if (P.anchor) P.steer = P.touchSteer;
  const out = {
    steer: P.steer,
    brake: P.brake || any(sets[2]),
    boost: P.boost || any(sets[3]),
    throttle: 1,                       // auto-accelerate
    stop: any(sets[5]),                // desktop only: S / Down arrow brakes
    attack: P.attackQ > 0, throwBack: P.backQ > 0, trick: P.trickQ || 0, super: P.superQ > 0,
  };
  return out;
}
function consumeEdges(p) { const P = Input.players[p]; P.attackQ = Math.max(0, P.attackQ - 1); P.backQ = Math.max(0, P.backQ - 1); P.trickQ = 0; P.superQ = 0; }
function resetInput() {
  Input.players = [mkPlayerInput(), mkPlayerInput()];
  Input.touches = {};
  Input.keys = {};
}

/* Draw the touch controls over the race */
function drawControls(ctx, race) {
  const L = Input.layout;
  if (!L || !race.touch) return;
  for (let p = 0; p < L.players.length; p++) {
    const P = L.players[p], I = Input.players[p];
    const me = race.humans[p];
    if (!me) continue;
    // steering slider (left / right only)
    const a = I.anchor || [P.ghost.x, P.ghost.y];
    const rr = P.steerRange, kr = P.R * 0.5;
    ctx.globalAlpha = I.anchor ? 0.55 : 0.28;
    ctx.strokeStyle = "#fff"; ctx.lineWidth = 3;
    roundRect(ctx, a[0] - rr - kr, a[1] - kr * 1.15, (rr + kr) * 2, kr * 2.3, kr * 1.15); ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,.12)"; ctx.fill();
    const kx = I.anchor ? a[0] + I.touchSteer * rr : a[0];
    ctx.globalAlpha = I.anchor ? 0.9 : 0.4;
    ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(kx, a[1], kr, 0, TAU); ctx.fill();
    ctx.fillStyle = "#14101c"; ctx.font = `${P.R * 0.45}px Bangers, sans-serif`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("◀ ▶", kx, a[1] + 1);
    ctx.globalAlpha = 1;
    // buttons
    const air = me.h > 120;
    const it0 = me.items[0];
    const label = air ? "TRICK" : (hasTarget(race, me) ? (me.comboN % 3 === 2 && me.comboT > 0 ? "KICK" : "PUNCH") : it0 === "bubble" ? "SHIELD" : it0 === "mine" ? "DROP" : it0 ? "THROW" : "PUNCH");
    btn(ctx, P.atk, label, air ? "#2bd9c5" : "#ff3d7f", I.btn.atk, me.items.length && !air ? race.assets.items[me.items[0]] : null, me.atkCD > 0 ? clamp(me.atkCD / 0.45, 0, 1) : 0);
    btn(ctx, P.bst, "BOOST", "#2b9cff", I.boost, null, 0, me.boost / 100);
    btn(ctx, P.brk, "DRIFT", "#ffcf3a", I.brake);
    I.supReady = (me.sup || 0) >= 100 && !me.finished;
    if (I.supReady) {
      const sd = superDef(me);
      btn(ctx, P.sup, "SUPER", sd.col, I.btn.sup, null, 0, 1);
      ctx.save(); ctx.font = `${P.R * 0.26}px Bangers, sans-serif`; ctx.textAlign = "center"; ctx.lineWidth = 3; ctx.strokeStyle = "#14101c";
      ctx.strokeText(sd.name, P.sup.x, P.sup.y - P.sup.r - 6); ctx.fillStyle = sd.col; ctx.fillText(sd.name, P.sup.x, P.sup.y - P.sup.r - 6); ctx.restore();
    }
  }
  // pause
  const pz = L.pause;
  ctx.fillStyle = "rgba(20,16,28,.55)"; ctx.beginPath(); ctx.arc(pz.x, pz.y, pz.r, 0, TAU); ctx.fill();
  ctx.fillStyle = "#fff"; ctx.fillRect(pz.x - 7, pz.y - 8, 5, 16); ctx.fillRect(pz.x + 2, pz.y - 8, 5, 16);
}

function hasTarget(race, e) {
  return race.riders.some((o) => o !== e && o.wipeT <= 0 && !ghosted(o) && Math.abs(o.z - e.z) < 320 && Math.abs(o.x - e.x) < 0.58);
}

function btn(ctx, b, label, col, down, icon, cd = 0, fill) {
  ctx.save();
  ctx.globalAlpha = down ? 0.95 : 0.72;
  ctx.fillStyle = "rgba(20,16,28,.55)";
  ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, TAU); ctx.fill();
  if (fill !== undefined) {
    ctx.save(); ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, TAU); ctx.clip();
    ctx.fillStyle = rgba(col, 0.55); ctx.fillRect(b.x - b.r, b.y + b.r - 2 * b.r * fill, 2 * b.r, 2 * b.r * fill);
    ctx.restore();
  }
  ctx.lineWidth = down ? 5 : 3; ctx.strokeStyle = col;
  ctx.beginPath(); ctx.arc(b.x, b.y, b.r - 2, 0, TAU); ctx.stroke();
  if (cd > 0) { ctx.fillStyle = "rgba(0,0,0,.35)"; ctx.beginPath(); ctx.moveTo(b.x, b.y); ctx.arc(b.x, b.y, b.r, -Math.PI / 2, -Math.PI / 2 + TAU * cd); ctx.closePath(); ctx.fill(); }
  if (icon) ctx.drawImage(icon, b.x - b.r * 0.42, b.y - b.r * 0.62, b.r * 0.84, b.r * 0.84);
  ctx.globalAlpha = 1;
  ctx.font = `${b.r * (icon ? 0.36 : 0.42)}px Bangers, sans-serif`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.lineWidth = 3; ctx.strokeStyle = "#14101c"; ctx.strokeText(label, b.x, b.y + (icon ? b.r * 0.42 : 0));
  ctx.fillStyle = "#fff"; ctx.fillText(label, b.x, b.y + (icon ? b.r * 0.42 : 0));
  ctx.restore();
}
