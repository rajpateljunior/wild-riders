/* Boot, main loop, resize, audio events, PWA glue. */

const canvas = $("#game");
const ctx = canvas.getContext("2d", { alpha: false });
let CW = 0, CH = 0, DPR = 1, autoCap = 2;
const perf = { acc: 0, n: 0, slow: 0 };
let SAFE = { l: 0, r: 0, t: 0, b: 0 };

let SAFE_PROBE = null;
function readSafe() {
  // One persistent probe element; its padding mirrors the live safe-area insets (notch, rounded corners, home bar).
  if (!SAFE_PROBE) {
    SAFE_PROBE = document.createElement("div");
    SAFE_PROBE.style.cssText = "position:fixed;left:0;top:0;width:0;height:0;box-sizing:content-box;padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);visibility:hidden;pointer-events:none";
    document.body.appendChild(SAFE_PROBE);
  }
  const cs = getComputedStyle(SAFE_PROBE);
  return { t: parseFloat(cs.paddingTop) || 0, r: parseFloat(cs.paddingRight) || 0, b: parseFloat(cs.paddingBottom) || 0, l: parseFloat(cs.paddingLeft) || 0 };
}

// The size actually on screen. iOS Home Screen apps can report a stale window.innerWidth/innerHeight for a moment
// after rotating, so measure the fixed-position canvas itself and only fall back to innerWidth/innerHeight.
function viewSize() {
  const r = canvas.getBoundingClientRect();
  if (r.width > 50 && r.height > 50) return [Math.round(r.width), Math.round(r.height)];
  return [window.innerWidth, window.innerHeight];
}

let viewKey = "";
function resize() {
  const s = readSafe();
  const [w, h] = viewSize();
  const g = App.save ? App.save.settings.gfx : "auto";
  const cap = g === "smooth" ? 1.2 : g === "sharp" ? 3 : autoCap;
  const dpr = Math.min(window.devicePixelRatio || 1, cap);
  const split = !!(App.race && App.race.split);
  const key = [w, h, s.t, s.r, s.b, s.l, dpr, split].join("|");
  if (key === viewKey) return;           // nothing changed — don't reallocate the canvas
  viewKey = key;
  SAFE = s; CW = w; CH = h; DPR = dpr;
  const bw = Math.round(CW * DPR), bh = Math.round(CH * DPR);
  if (canvas.width !== bw) canvas.width = bw;
  if (canvas.height !== bh) canvas.height = bh;
  Input.layout = computeLayout(CW, CH, split, SAFE);
}

// Re-measure several times after anything that can change the screen size, because iOS settles late.
let settleTimers = [];
function settleViewport() {
  settleTimers.forEach(clearTimeout);
  settleTimers = [0, 80, 250, 500, 900, 1600, 3000].map((ms) => setTimeout(resize, ms));
}

function processEvents(race) {
  if (race.demo) { race.events.length = 0; return; }
  const near = (e) => e && (e.human || race.humans.some((h) => Math.abs(h.z - e.z) < 1800));
  for (const ev of race.events) {
    if (typeof ev === "string") { SFX.play(ev); continue; }
    if (ev.e && (ev.e.human && ev.e.local || (ev.target && ev.target.human) || (ev.by && ev.by.human) || (near(ev.e) && ["punch", "kick", "crash", "wipe", "hit"].includes(ev.snd)))) SFX.play(ev.snd);
  }
  race.events.length = 0;
}

function frame(tms) {
  requestAnimationFrame(frame);
  const t = tms / 1000;
  let dt = App.lastT ? t - App.lastT : STEP;
  App.lastT = t;
  dt = Math.min(dt, 0.1);
  // safety net: if the screen size or notch insets changed without an event, catch it within a quarter second
  App.chkT = (App.chkT || 0) + dt;
  if (App.chkT > 0.25) { App.chkT = 0; resize(); }
  // performance governor (AUTO graphics): drop resolution if frames are slow
  perf.acc += dt; perf.n++;
  if (perf.acc > 2) {
    const avg = perf.acc / perf.n;
    if (App.save.settings.gfx === "auto" && (App.race || App.demo)) {
      if (avg > 1 / 45 && autoCap > 1) { autoCap = Math.max(1, autoCap - 0.25); resize(); }
      else if (avg < 1 / 58 && autoCap < 2) { autoCap = Math.min(2, autoCap + 0.25); resize(); }
    }
    perf.acc = 0; perf.n = 0;
  }
  const race = App.race || (App.screen === "scr-title" ? App.demo : null);
  if (!race) return;
  if (!App.paused) {
    App.acc = (App.acc || 0) + dt;
    let n = 0;
    while (App.acc >= STEP && n < 5) {
      const inputs = race.demo ? [] : race.humans.map((h, i) => readPlayer(i));
      Input.airborne = race.humans.map((h) => h.h > 120);
      if (App.net && App.mode === "online") netBeforeStep(race, inputs);
      stepRace(race, inputs, STEP);
      if (!race.demo) race.humans.forEach((h, i) => consumeEdges(i));
      App.acc -= STEP; n++;
    }
    if (n >= 5) App.acc = 0;
    if (App.net && App.mode === "online") netAfterFrame(race, dt);
    processEvents(race);
  }
  // ---- draw ----
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  race.safeL = SAFE.l; race.safeR = SAFE.r; race.safeT = Math.max(0, SAFE.t - 4);
  if (race.demo) {
    const cam = race.riders.find((e) => e.cam) || race.riders[0];
    renderView(ctx, { x: 0, y: 0, w: CW, h: CH }, race, cam, t);
  } else if (race.split) {
    const half = CW / 2;
    race.humans.forEach((h, i) => { h.vpIndex = i; renderView(ctx, { x: i * half, y: 0, w: half - (i ? 0 : 1.5), h: CH }, race, h, t); });
    ctx.fillStyle = "#14101c"; ctx.fillRect(half - 1.5, 0, 3, CH);
  } else if (race.humans[0]) {
    race.humans[0].vpIndex = 0;
    renderView(ctx, { x: 0, y: 0, w: CW, h: CH }, race, race.humans[0], t);
  }
  if (!race.demo) {
    drawControls(ctx, race);
    race.humans.forEach((h, i) => {
      SFX.engineUpdate(i, h.speed / BASE_SPEED, h.boosting || h.padT > 0, h.h > 0, race.split ? 0.6 : 1);
      if (h.boosting && !h.wasBoost) SFX.play("boost");
      h.wasBoost = h.boosting;
    });
    if (App.race && race.over && race.overT <= 0) finishRace();
  }
}

/* PWA */
function setupPWA() {
  setupUpdates();                       // service worker + "update available" banner (src/update.js)
  if (location.search.indexOf("u=") >= 0) try { history.replaceState(null, "", location.pathname); } catch (_) {}
  const standalone = window.navigator.standalone || window.matchMedia("(display-mode: standalone)").matches;
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  let dismissed = false;
  try { dismissed = localStorage.getItem("wr-install-dismissed") === "1"; } catch (_) {}
  const box = $("#install");
  const close = () => { box.classList.add("hidden"); try { localStorage.setItem("wr-install-dismissed", "1"); } catch (_) {} };
  if (ios && !standalone && !dismissed) {
    box.innerHTML = `<span>Install: tap <b>Share</b> <span style="font-size:16px">⬆︎</span> then <b>Add to Home Screen</b> for full-screen play.</span><button>OK</button>`;
    box.classList.remove("hidden");
    box.querySelector("button").onclick = close;
    setTimeout(close, 12000);
  }
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    if (dismissed) return;
    box.innerHTML = `<span>Install Wild Riders as an app?</span><button data-i>INSTALL</button><button data-x>✕</button>`;
    box.classList.remove("hidden");
    box.querySelector("[data-i]").onclick = () => { e.prompt(); close(); };
    box.querySelector("[data-x]").onclick = close;
  });
  try { navigator.storage && navigator.storage.persist && navigator.storage.persist(); } catch (_) {}
}

async function boot() {
  App.save = loadSave();
  saveGame();                       // persist any one-time migration right away so it can never run twice
  setTone(App.save.settings.tone);
  resize();
  window.addEventListener("resize", settleViewport);
  window.addEventListener("orientationchange", settleViewport);
  window.addEventListener("pageshow", settleViewport);
  if (window.visualViewport) window.visualViewport.addEventListener("resize", settleViewport);
  if (window.screen && screen.orientation && screen.orientation.addEventListener) screen.orientation.addEventListener("change", settleViewport);
  initInput(canvas);
  wireMenus();
  SFX.setMusic(App.save.settings.music); SFX.setSfx(App.save.settings.sfx);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) { if (App.race && !App.paused && !App.pauseMenu) pauseRace(); SFX.suspend(); }
    else { SFX.resume(); settleViewport(); }
  });
  // iOS needs a user gesture before any sound
  const firstTouch = () => {
    SFX.unlock();
    if (!App.race) { SFX.setMusic(App.save.settings.music); SFX.music(6); }
    window.removeEventListener("pointerdown", firstTouch);
    window.removeEventListener("keydown", firstTouch);
  };
  window.addEventListener("pointerdown", firstTouch);
  window.addEventListener("keydown", firstTouch);
  // prevent iOS pinch/double-tap zoom
  document.addEventListener("gesturestart", (e) => e.preventDefault());
  let lastTap = 0;
  // block double-tap zoom on empty space only — never swallow quick taps on buttons, cards or fields
  document.addEventListener("touchend", (e) => {
    const n = Date.now();
    const interactive = e.target.closest && e.target.closest("button, .card, .trk, input, textarea, .seg, canvas");
    if (!interactive && n - lastTap < 300) e.preventDefault();
    lastTap = n;
  }, { passive: false });
  try { await document.fonts.load("30px Bangers"); } catch (_) {}
  renderTitle();
  setupPWA();
  requestAnimationFrame(frame);
  startDemo();
  refreshTitleExtras();
  setTimeout(startupPopups, 600);
}
boot();
