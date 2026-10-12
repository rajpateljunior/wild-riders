/* Menus, progression and screen flow. */

const SAVE_KEY = "wild-riders-save-v1";
function defaultSave() {
  return { v: 1, tl: 2, rl: 2, coins: 500, stars: {}, best: {}, riders: ["kaito", "bruno"], vehs: ["mtb", "bmx"], upg: {},
    last: { rider: "kaito", rider2: "bruno", veh: "mtb", veh2: "bmx", track: "f1" },
    settings: { music: true, sfx: true, diff: 1, gfx: "auto", tone: "arcade" }, seenHelp: false, races: 0 };
}
function loadSave() {
  try {
    const s = JSON.parse(localStorage.getItem(SAVE_KEY) || "null");
    if (s && s.v === 1) return migrateSave(Object.assign(defaultSave(), { tl: 1, rl: 1 }, s, { settings: Object.assign(defaultSave().settings, s.settings || {}), last: Object.assign(defaultSave().last, s.last || {}) }));
  } catch (_) {}
  return defaultSave();
}
// Still save format v1. Two one-time migrations, each tracked by a generation number in the save (so they never run twice):
//  `tl` = track-layout generation: the trails were redesigned in generation 2, so best times from older layouts are
//         cleared once (stars, coins, riders, rides and upgrades are kept).
//  `rl` = rider-lineup generation: generation 2 moved Priya to 5th place in the unlock order and made Bruno the free
//         second starter. Everyone's UNLOCKED RIDERS reset to Kaito + Bruno and every coin spent on a rider (at the OLD
//         price) is refunded. NOTHING ELSE is touched: stars, best times, coins, vehicles, upgrades, settings, races.
//         The untouched save is first copied to its own backup key, and a notice is queued for the next title screen.
const BACKUP_KEY = "wild-riders-save-v1-backup-rl1";
function migrateSave(s) {
  if ((s.tl || 1) < 2) { s.best = {}; s.tl = 2; }
  if ((s.rl || 1) < 2) migrateRiders(s);
  return s;
}
function migrateRiders(s) {
  try { if (!localStorage.getItem(BACKUP_KEY)) localStorage.setItem(BACKUP_KEY, JSON.stringify(s)); } catch (_) {}   // safety copy of the save as it was before this change
  const owned = Array.isArray(s.riders) ? s.riders : [];
  let refund = 0;
  const paid = [];
  owned.forEach((id) => {
    const c = OLD_RIDER_COST[id], r = RIDERS.find((x) => x.id === id);
    if (c > 0) { refund += c; if (r) paid.push(r.name); }
  });
  s.coins = (Number.isFinite(s.coins) ? s.coins : 0) + refund;
  s.riders = ["kaito", "bruno"];
  s.last = Object.assign({ rider: "kaito", rider2: "bruno" }, s.last || {});
  if (!s.riders.includes(s.last.rider)) s.last.rider = "kaito";
  if (!s.riders.includes(s.last.rider2)) s.last.rider2 = "bruno";
  s.rl = 2;
  s.note = { kind: "lineup", refund, paid };      // shown once on the title screen, then deleted
  return s;
}
function saveGame() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(App.save)); } catch (_) {} }
function totalStars() { return Object.values(App.save.stars).reduce((a, b) => a + b, 0); }
function biomeUnlocked(i) { return totalStars() >= BIOMES[i].unlock; }
// Riders and rides unlock strictly in order: only the first one you don't own yet can be bought.
function nextToUnlock(list, owned) { return list.find((x) => !owned.includes(x.id)) || null; }

/* Secret "cutie mode" switch: hold the 2 PLAYERS · ONE SCREEN button for 2 seconds. Stored outside the save
   (so it never travels in a save code). A tiny pink dot on that button is the only sign it's on. */
const CUTIE_KEY = "wr-cz";
function cutieOn() { try { return localStorage.getItem(CUTIE_KEY) === "1"; } catch (_) { return false; } }
function setCutie(on) { try { localStorage.setItem(CUTIE_KEY, on ? "1" : "0"); } catch (_) {} cutieMark(); }
function cutieMark() { const b = document.querySelector('[data-act="split"]'); if (b) b.classList.toggle("cz", cutieOn()); }
function wireCutieSwitch() {
  const b = document.querySelector('[data-act="split"]');
  if (!b) return;
  let timer = null;
  const start = () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      b.dataset.held = "1";
      setCutie(!cutieOn());
      const h = document.createElement("div");
      h.className = "czpop"; h.textContent = cutieOn() ? "♥" : "♡";
      const r = b.getBoundingClientRect();
      h.style.left = r.right - 30 + "px"; h.style.top = r.top - 4 + "px";
      document.body.appendChild(h); setTimeout(() => h.remove(), 900);
      if (navigator.vibrate) try { navigator.vibrate(20); } catch (_) {}
    }, 2000);
  };
  const cancel = () => { clearTimeout(timer); timer = null; };
  b.addEventListener("pointerdown", start);
  ["pointerup", "pointerleave", "pointercancel"].forEach((ev) => b.addEventListener(ev, cancel));
  b.addEventListener("contextmenu", (e) => e.preventDefault());
  cutieMark();
}
function encodeSave() { const c = Object.assign({}, App.save); delete c.note; return "WILDR1-" + btoa(unescape(encodeURIComponent(JSON.stringify(c)))); }      // (a pending one-time notice never travels in a code)
function decodeSave(code) {
  try {
    code = code.trim();
    if (!code.startsWith("WILDR1-")) return null;
    const s = JSON.parse(decodeURIComponent(escape(atob(code.slice(7)))));
    return s && s.v === 1 && typeof s.coins === "number" ? s : null;
  } catch (_) { return null; }
}

const App = { save: null, mode: "race", step: 0, pick: { riders: [], vehs: [], track: null }, race: null, demo: null, paused: false, screen: null };

function show(id) {
  $$(".screen").forEach((s) => s.classList.add("hidden"));
  if (id) $("#" + id).classList.remove("hidden");
  App.screen = id;
  $$(".coinv").forEach((c) => (c.textContent = App.save.coins.toLocaleString()));
}
function toast(msg) {
  const t = document.createElement("div");
  t.className = "toast"; t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 1800);
}
function modal(html, onMount) {
  const m = $("#modal");
  m.querySelector(".mbox").innerHTML = html;
  m.classList.remove("hidden");
  onMount && onMount(m.querySelector(".mbox"));
}
function closeModal() { $("#modal").classList.add("hidden"); }

/* ---------- title ---------- */
function renderTitle() {
  // Home screen art: the emblem (no characters) with dust kicking up below it. Redrawn when the tone changes.
  const cast = $("#cast");
  if (cast.dataset.tone !== TONE) {
    cast.dataset.tone = TONE;
    let dust = "";
    for (let i = 0; i < 9; i++) dust += `<i style="left:${8 + i * 10}%;animation-delay:${(i * 0.37) % 2.2}s;animation-duration:${1.8 + (i % 3) * 0.5}s"></i>`;
    cast.innerHTML = `<div class="emblem">${emblemSVG()}</div><div class="dust">${dust}</div>`;
  }
  show("scr-title");
  refreshTitleExtras();
}

/* ---------- rider select ---------- */
function statBars(rows) {
  return `<div class="stats">${rows.map(([n, v, up]) => `<span>${n}</span><div class="bar"><i class="${up ? "up" : ""}" style="width:${Math.round(clamp(v, 0.05, 1) * 100)}%"></i></div>`).join("")}</div>`;
}
function riderStats(r) {
  return [["HEALTH", (r.hp - 50) / 95], ["SPEED", (r.spd - 0.9) / 0.18], ["ACCEL", (r.acc - 0.85) / 0.3], ["HANDLING", (r.hdl - 0.85) / 0.3], ["POWER", (r.pow - 0.6) / 0.8]];
}
function openRider() {
  const p = App.step === "rider2" ? 1 : 0;
  $("#rider-h").textContent = App.mode === "split" ? `PLAYER ${p + 1} · CHOOSE RIDER` : App.mode === "online" ? (App.netRole === "host" ? "HOSTING · CHOOSE RIDER" : "JOINING · CHOOSE RIDER") : "CHOOSE YOUR RIDER";
  const cur = App.pick.riders[p] || (p ? App.save.last.rider2 : App.save.last.rider);
  App.pick.riders[p] = cur;
  const wrap = $("#rider-cards");
  wrap.innerHTML = "";
  const nextR = nextToUnlock(RIDERS, App.save.riders);
  RIDERS.forEach((r) => {
    const owned = App.save.riders.includes(r.id);
    const c = document.createElement("div");
    c.className = "card" + (r.id === cur ? " sel" : "");
    c.style.setProperty("--c1", r.main); c.style.setProperty("--c2", shade(r.main, -0.6));
    c.innerHTML = `<div class="art">${portraitSVG(r)}</div><div class="info"><div class="nm">${r.name}</div><div class="tg">${r.tag} · #${r.num}</div>${statBars(riderStats(r))}</div>` +
      (owned ? "" : r === nextR ? `<div class="lock">LOCKED<span class="coins"><i class="coin"></i>${r.cost.toLocaleString()}</span></div>`
        : `<div class="lock">LOCKED<span class="after">Unlock ${nextR.name} first</span></div>`) +
      (App.mode === "split" && p === 1 && App.pick.riders[0] === r.id ? `<div class="who" style="background:var(--teal)">P1</div>` : "");
    c.onclick = () => { SFX.play("click"); App.pick.riders[p] = r.id; openRider(); };
    wrap.appendChild(c);
  });
  const r = RIDERS.find((x) => x.id === cur);
  const owned = App.save.riders.includes(cur);
  $("#rider-desc").innerHTML = `<b>${r.full}</b> — ${r.blurb} Signature throw: <b>${ITEMS[r.item].name}</b>.`;
  const go = $("#rider-go");
  if (owned) { go.textContent = "NEXT ›"; go.disabled = false; go.style.setProperty("--c", "#ff3d7f"); }
  else if (r !== nextR) { go.textContent = "UNLOCK " + nextR.name.toUpperCase() + " FIRST"; go.disabled = true; go.style.setProperty("--c", "#6b6280"); }
  else { go.textContent = "BUY " + r.cost.toLocaleString(); go.disabled = App.save.coins < r.cost; go.style.setProperty("--c", "#ffb300"); }
  go.onclick = () => {
    if (!owned) {
      if (r !== nextR || App.save.coins < r.cost) return;
      App.save.coins -= r.cost; App.save.riders.push(r.id); saveGame(); SFX.play("unlock"); toast(r.name.toUpperCase() + " UNLOCKED!");
      return openRider();
    }
    SFX.play("click");
    if (p) App.save.last.rider2 = cur; else App.save.last.rider = cur;
    saveGame();
    App.step = p ? "veh2" : "veh";
    openVeh();
  };
  show("scr-rider");
  scrollSel(wrap);
}
function scrollSel(wrap) {
  // Scroll ONLY the card strip. (scrollIntoView also scrolls the whole screen sideways, which shoved the layout right.)
  requestAnimationFrame(() => {
    const s = wrap.querySelector(".sel");
    if (s) wrap.scrollTo({ left: Math.max(0, s.offsetLeft - (wrap.clientWidth - s.offsetWidth) / 2), behavior: "auto" });
    const scr = wrap.closest(".screen"); if (scr) { scr.scrollLeft = 0; scr.scrollTop = 0; }
  });
}

/* ---------- vehicle select / garage ---------- */
function vehStats(v, upg) {
  return [["TOP SPEED", (v.max * (1 + 0.03 * upg[0]) - 0.85) / 0.4, upg[0]], ["ACCEL", (v.acc - 0.8) / 0.45], ["GRIP", (v.grip * (1 + 0.06 * upg[1]) - 0.75) / 0.65, upg[1]],
    ["ARMOR", (v.armor + 0.08 * upg[2] + 0.15) / 0.7, upg[2]], ["TRICKS", (v.trick - 0.5) / 1.0]];
}
function openVeh() {
  const garage = App.mode === "garage";
  const p = App.step === "veh2" ? 1 : 0;
  $("#veh-h").textContent = garage ? "GARAGE" : App.mode === "split" ? `PLAYER ${p + 1} · CHOOSE RIDE` : "CHOOSE YOUR RIDE";
  const rider = RIDERS.find((r) => r.id === (App.pick.riders[p] || App.save.last.rider));
  const cur = App.pick.vehs[p] || (p ? App.save.last.veh2 : App.save.last.veh);
  App.pick.vehs[p] = cur;
  const wrap = $("#veh-cards");
  wrap.innerHTML = "";
  const nextV = nextToUnlock(VEHICLES, App.save.vehs);
  VEHICLES.forEach((v) => {
    const owned = App.save.vehs.includes(v.id);
    const upg = App.save.upg[v.id] || [0, 0, 0];
    const c = document.createElement("div");
    c.className = "card" + (v.id === cur ? " sel" : "");
    c.style.setProperty("--c1", "#3a2d55"); c.style.setProperty("--c2", "#1a1230");
    c.innerHTML = `<div class="art" style="padding:6px 8px 0">${vehicleSideSVG(v.id, rider)}</div><div class="info"><div class="nm">${v.name}</div><div class="tg">${v.short}</div>${statBars(vehStats(v, upg))}</div>` +
      (owned ? "" : v === nextV ? `<div class="lock">LOCKED<span class="coins"><i class="coin"></i>${v.cost.toLocaleString()}</span></div>`
        : `<div class="lock">LOCKED<span class="after">Unlock ${nextV.short} first</span></div>`);
    c.onclick = () => { SFX.play("click"); App.pick.vehs[p] = v.id; openVeh(); };
    wrap.appendChild(c);
  });
  const v = VEHICLES.find((x) => x.id === cur);
  const owned = App.save.vehs.includes(cur);
  $("#veh-desc").innerHTML = `<b>${v.name}</b> — ${v.blurb}`;
  // upgrades
  const up = $("#veh-upg");
  up.innerHTML = "";
  if (owned) {
    const lv = App.save.upg[v.id] || (App.save.upg[v.id] = [0, 0, 0]);
    UPGRADES.forEach((u, i) => {
      const row = document.createElement("div");
      row.className = "u";
      const cost = UPG_COST[lv[i]];
      row.innerHTML = `<span style="width:58px">${u.name}</span><span class="pips">${[0, 1, 2].map((k) => `<i class="${k < lv[i] ? "on" : ""}"></i>`).join("")}</span>`;
      const b = document.createElement("button");
      b.className = "btn sm"; b.style.cssText = "height:30px;font-size:15px;padding:0 10px;--c:#2bd96a";
      b.textContent = lv[i] >= 3 ? "MAX" : "+ " + cost;
      b.disabled = lv[i] >= 3 || App.save.coins < cost;
      b.title = u.desc;
      b.onclick = (ev) => { ev.stopPropagation(); if (lv[i] >= 3 || App.save.coins < cost) return; App.save.coins -= cost; lv[i]++; saveGame(); SFX.play("unlock"); toast(v.short + " " + u.name.toUpperCase() + " LV " + lv[i]); openVeh(); };
      row.appendChild(b);
      up.appendChild(row);
    });
  }
  const go = $("#veh-go");
  if (!owned && v !== nextV) { go.textContent = "UNLOCK " + nextV.short + " FIRST"; go.disabled = true; go.style.setProperty("--c", "#6b6280"); }
  else if (!owned) { go.textContent = "BUY " + v.cost.toLocaleString(); go.disabled = App.save.coins < v.cost; go.style.setProperty("--c", "#ffb300"); }
  else { go.textContent = garage ? "DONE" : "NEXT ›"; go.disabled = false; go.style.setProperty("--c", "#ff3d7f"); }
  go.onclick = () => {
    if (!owned) {
      if (v !== nextV || App.save.coins < v.cost) return;
      App.save.coins -= v.cost; App.save.vehs.push(v.id); saveGame(); SFX.play("unlock"); toast(v.name.toUpperCase() + " UNLOCKED!");
      return openVeh();
    }
    SFX.play("click");
    if (p) App.save.last.veh2 = cur; else App.save.last.veh = cur;
    saveGame();
    if (garage) return renderTitle();
    if (App.mode === "split" && p === 0) { App.step = "rider2"; return openRider(); }
    if (App.mode === "online" && App.netRole === "guest") return netJoinPrompt();
    App.step = "track";
    openTrack();
  };
  show("scr-veh");
  scrollSel(wrap);
}

/* ---------- track select ---------- */
const biomeThumbs = {};
async function biomeThumb(b) {
  if (biomeThumbs[b.id]) return biomeThumbs[b.id];
  const c = makeCanvas(360, 210), x = c.getContext("2d");
  const g = x.createLinearGradient(0, 0, 0, 120); g.addColorStop(0, b.sky[0]); g.addColorStop(0.7, b.sky[1]); g.addColorStop(1, b.sky[2]);
  x.fillStyle = g; x.fillRect(0, 0, 360, 210);
  x.fillStyle = b.sun; x.beginPath(); x.arc(360 * b.sunX, 210 * b.sunY, 12, 0, TAU); x.fill();
  const far = await svgToCanvas(bgSVG(b, "far"), 1024, 210), near = await svgToCanvas(bgSVG(b, "near"), 1024, 150);
  x.drawImage(far, 0, 0, 720, 148, 0, 4, 360 * 2, 148);
  x.drawImage(near, 0, 0, 720, 110, 0, 60, 360 * 2, 110);
  x.fillStyle = b.ground[0]; x.fillRect(0, 150, 360, 60);
  x.fillStyle = b.edge[1]; x.beginPath(); x.moveTo(168, 128); x.lineTo(192, 128); x.lineTo(330, 210); x.lineTo(30, 210); x.fill();
  x.fillStyle = b.road[0]; x.beginPath(); x.moveTo(171, 128); x.lineTo(189, 128); x.lineTo(310, 210); x.lineTo(50, 210); x.fill();
  const set = BIOME_SCENERY[b.id];
  const ids = [set.near[0][0], set.near[1][0], set.near[0][0]];
  const spots = [[40, 200, 1.0], [320, 196, 0.85], [110, 158, 0.45]];
  for (let i = 0; i < 3; i++) {
    const d = W[ids[i]]; const sc = (130 / d.h) * spots[i][2] * Math.min(1, 1.6 * d.h / d.w);
    const sp = await svgToCanvas(SV.wrap(d.w, d.h, d.svg()), d.w * sc * 1.5, d.h * sc * 1.5);
    x.drawImage(sp, spots[i][0] - (d.w * sc) / 2, spots[i][1] - d.h * sc, d.w * sc, d.h * sc);
  }
  if (b.dark) { x.fillStyle = "rgba(5,10,30,.35)"; x.fillRect(0, 0, 360, 210); }
  biomeThumbs[b.id] = c;
  return c;
}
function openTrack() {
  const wrap = $("#track-cards");
  wrap.innerHTML = "";
  const cur = App.pick.track || App.save.last.track;
  App.pick.track = cur;
  const stars = totalStars();
  BIOMES.forEach((b, bi) => {
    const unlocked = biomeUnlocked(bi);
    const c = document.createElement("div");
    c.className = "card biome" + (TRACKS.find((t) => t.id === cur).biome === bi ? " sel" : "");
    c.style.gridAutoColumns = "";
    c.innerHTML = `<div class="art"></div><div class="info" style="padding-bottom:0"><div class="nm">${b.name}</div><div class="tg">${b.sub}</div></div><div class="tracks"></div>` +
      (unlocked ? "" : `<div class="lock">★ ${b.unlock} TO UNLOCK<span style="font:700 12px Chakra Petch;color:#ccc">You have ${stars} ★</span></div>`);
    biomeThumb(b).then((cv) => { const cl = cv.cloneNode(); cl.getContext("2d").drawImage(cv, 0, 0); c.querySelector(".art").appendChild(cl); });
    const tl = c.querySelector(".tracks");
    TRACKS.filter((t) => t.biome === bi).forEach((t) => {
      const s = App.save.stars[t.id] || 0, best = App.save.best[t.id];
      const row = document.createElement("div");
      row.className = "trk" + (t.id === cur ? " sel" : "");
      row.innerHTML = `<div><div>${t.name}</div><div class="bt">${best ? "Best " + fmtTime(best) : t.avalanche ? "Avalanche chase" : t.storm ? "Sandstorms" : "Not raced"}</div></div><span class="st">${[1, 2, 3].map((k) => `<span class="${k <= s ? "" : "off"}">★</span>`).join("")}</span>`;
      row.onclick = (ev) => { ev.stopPropagation(); if (!unlocked) return; SFX.play("click"); App.pick.track = t.id; openTrack(); };
      tl.appendChild(row);
    });
    c.onclick = () => { if (!unlocked) return; SFX.play("click"); App.pick.track = TRACKS.find((t) => t.biome === bi).id; openTrack(); };
    wrap.appendChild(c);
  });
  wrap.style.gridAutoColumns = "minmax(210px, 1fr)";
  const t = TRACKS.find((x) => x.id === cur), b = BIOMES[t.biome];
  $("#track-desc").innerHTML = `<b>${t.name}</b> — ${t.blurb || b.hazard} <span style="color:var(--sun)">${STAR_RULE}</span>`;
  $("#track-go").onclick = () => { SFX.play("click"); App.save.last.track = cur; saveGame(); if (App.mode === "online") return netHost(); startRace(); };
  show("scr-track");
  scrollSel(wrap);
}

/* ---------- settings / help / save code ---------- */
function openSettings() {
  const s = App.save.settings;
  const seg = (key, opts) => `<span class="seg" data-k="${key}">${opts.map(([v, l]) => `<button data-v="${v}" class="${String(s[key]) === String(v) ? "on" : ""}">${l}</button>`).join("")}</span>`;
  modal(`<h3>SETTINGS</h3>
    <div class="setrow">Music ${seg("music", [[true, "ON"], [false, "OFF"]])}</div>
    <div class="setrow">Sound FX ${seg("sfx", [[true, "ON"], [false, "OFF"]])}</div>
    <div class="setrow">Rival difficulty ${seg("diff", [[0, "EASY"], [1, "NORMAL"], [2, "HARD"]])}</div>
    <div class="setrow">Graphics ${seg("gfx", [["auto", "AUTO"], ["smooth", "SMOOTH"], ["sharp", "SHARP"]])}</div>
    <div class="setrow">Style ${seg("tone", [["arcade", "ARCADE"], ["savage", "SAVAGE"]])}</div>
    <p style="font-size:12px;color:var(--mute)">${s.tone === "savage" ? "SAVAGE: dark, gritty, battle-scarred riders and cartoon blood." : "ARCADE: bright, anime-cool and kid friendly."} AUTO graphics lowers resolution if frames drop. iPhone: the silent switch mutes sound.</p>
    <div class="acts"><button class="btn sm" style="--c:#13a89e" data-a="help">HOW TO PLAY</button><button class="btn sm" style="--c:#2b9cff" data-a="code">SAVE CODE</button><button class="btn sm ghost" data-a="close">CLOSE</button></div>`, (box) => {
    $$(".seg", box).forEach((g) => g.querySelectorAll("button").forEach((b) => (b.onclick = () => {
      const k = g.dataset.k; let v = b.dataset.v;
      v = v === "true" ? true : v === "false" ? false : isNaN(+v) ? v : +v;
      s[k] = v; saveGame(); applySettings(); SFX.play("click"); openSettings();
    })));
    box.querySelector('[data-a="close"]').onclick = () => { SFX.play("back"); closeModal(); };
    box.querySelector('[data-a="help"]').onclick = () => openHelp(openSettings);
    box.querySelector('[data-a="code"]').onclick = openSaveCode;
  });
}
function applySettings() {
  const s = App.save.settings;
  SFX.setMusic(s.music); SFX.setSfx(s.sfx);
  const before = TONE;
  setTone(s.tone);
  if (TONE !== before && App.screen === "scr-title") { stopDemo(); startDemo(); }     // rebuild the title demo race in the new look
  resize();
}
function openHelp(after) {
  modal(`<h3>HOW TO RIDE</h3>
    <div class="ctl-help">
      <b>GO &amp; STEER</b><span>Put your left thumb anywhere on the left side. Push it UP to go (further up = faster), slide left or right to steer, pull DOWN to brake. Let go and you roll to a stop.</span>
      <b>PUNCH</b><span>Tap PUNCH when a rival is beside you. Every 3rd hit in a row is a big KICK.</span>
      <b>THROW</b><span>Holding an item with nobody beside you? PUNCH throws it ahead. Swipe DOWN on it to throw behind.</span>
      <b>TRICKS</b><span>In the air the button becomes TRICK. Tap or swipe up / down / sideways for different tricks. Land before it finishes and you bail!</span>
      <b>BOOST</b><span>Hold BOOST to burn your meter. Fill it with tricks, drifts, drafting and takedowns.</span>
      <b>DRIFT</b><span>Hold DRIFT while steering through corners to slide and charge boost. Ease off before hairpins (the yellow arrow signs).</span>
      <b>HEALTH</b><span>Hits and crashes drain health, and less health means a lower top speed. Grab green repair kits. At zero you wipe out.</span>
    </div>
    <p class="kbd-note" style="font-size:12px;color:var(--mute)">Keyboard: W / ↑ go, S / ↓ brake, A D / ← → steer, Space punch, Shift boost, E drift. Two players: P1 WASD + F punch, G boost, E drift · P2 arrows + L punch, K boost, J drift.</p>
    <div class="acts"><button class="btn" style="--c:#2bd96a" data-a="ok">LET'S RIDE</button></div>`, (box) => {
    box.querySelector('[data-a="ok"]').onclick = () => { SFX.play("click"); closeModal(); App.save.seenHelp = true; saveGame(); after && after(); };
  });
}
function openSaveCode() {
  modal(`<h3>SAVE CODE</h3><p>Copy this code to move your progress to another device or browser. Paste a code and tap Load to restore it.</p>
    <textarea id="sc-out" readonly>${encodeSave()}</textarea>
    <div class="acts"><button class="btn sm" style="--c:#2b9cff" data-a="copy">COPY</button></div>
    <textarea id="sc-in" placeholder="Paste a WILDR1- code here"></textarea>
    <div class="acts"><button class="btn sm" style="--c:#ff8a1c" data-a="load">LOAD CODE</button><button class="btn sm ghost" data-a="close">CLOSE</button></div>`, (box) => {
    box.querySelector('[data-a="copy"]').onclick = () => {
      const t = box.querySelector("#sc-out"); t.select();
      (navigator.clipboard ? navigator.clipboard.writeText(t.value) : Promise.reject()).then(() => toast("COPIED!")).catch(() => { document.execCommand("copy"); toast("COPIED!"); });
    };
    let armed = false;
    box.querySelector('[data-a="load"]').onclick = (ev) => {
      const s = decodeSave(box.querySelector("#sc-in").value);
      if (!s) { toast("THAT CODE DOESN'T WORK"); return; }
      if (!armed) { armed = true; ev.target.textContent = "TAP AGAIN TO REPLACE"; return; }
      App.save = migrateSave(Object.assign(defaultSave(), { tl: 1, rl: 1 }, s)); saveGame(); applySettings(); closeModal(); toast("PROGRESS LOADED!"); renderTitle(); setTimeout(startupPopups, 400);
    };
    box.querySelector('[data-a="close"]').onclick = () => { SFX.play("back"); closeModal(); };
  });
}

/* ---------- race flow ---------- */
async function startRace() {
  const tips = ["Tricks fill your boost meter — but land before they finish!", "Every 3rd punch in a row is a heavy KICK.", "Low health = lower top speed. Repair kits are green.",
    "Forks hide boost pads on the riskier side.", "Your ride accelerates by itself — just steer left and right.", "Yellow arrow signs = hairpin. Ease off or drift!", "Draft right behind a rival to charge boost.", "Swipe down on PUNCH to throw an item backward.", "Quads shove lighter riders out of the way."];
  $("#loading .tip").textContent = "TIP: " + pick(tips);
  $("#loading .lb i").style.width = "5%";
  $("#loading").classList.remove("hidden");
  show(null);
  stopDemo();
  SFX.stopMusic();
  await new Promise((r) => setTimeout(r, 30));
  const humans = [{ riderId: App.pick.riders[0] || App.save.last.rider, vehId: App.pick.vehs[0] || App.save.last.veh, upg: App.save.upg[App.pick.vehs[0] || App.save.last.veh] }];
  if (App.mode === "split") humans.push({ riderId: App.pick.riders[1] || App.save.last.rider2, vehId: App.pick.vehs[1] || App.save.last.veh2, upg: App.save.upg[App.pick.vehs[1] || App.save.last.veh2] });
  const cfg = { trackId: App.pick.track || App.save.last.track, humans, total: 8, difficulty: App.save.settings.diff };
  if (App.mode === "split" && cutieOn()) cfg.fav = 1;           // secret switch: Player 2 always wins
  App.lastCfg = cfg;
  await launchRace(cfg);
}

async function launchRace(cfg) {
  $("#install").classList.add("hidden");
  const race = await createRace(cfg, (p) => ($("#loading .lb i").style.width = Math.round(10 + p * 90) + "%"));
  App.race = race;
  App.paused = false;
  if (!race.demo && race.humans[0]) applyPerk(race.humans[0]);        // Daily Spin perk (used up by this race)
  resetInput();
  Input.split = race.split;
  Input.enabled = true;
  Input.onPause = pauseRace;
  $("#loading").classList.add("hidden");
  race.humans.forEach((h, i) => SFX.engineStart(i, h.veh.id));
  SFX.music(race.track.biome.music);
  resize();
  if (!App.save.seenHelp && !cfg.online) { App.paused = true; openHelp(() => { App.paused = false; }); }
}

function pauseRace() {
  if (!App.race || App.paused) return;
  const online = !!App.race.net;
  App.paused = !online;            // online races keep running for your friend
  if (online) App.pauseMenu = true;
  SFX.enginesOff();
  modal(`<h3>PAUSED</h3><p>${App.race.track.def.name} · ${App.race.track.biome.name}</p>
    <div class="acts"><button class="btn" style="--c:#2bd96a" data-a="resume">RESUME</button><button class="btn sm" style="--c:#ff8a1c" data-a="restart">RESTART</button><button class="btn sm" style="--c:#13a89e" data-a="help">CONTROLS</button><button class="btn sm ghost" data-a="quit">QUIT</button></div>
    <div class="setrow">Music <span class="seg"><button data-m="1" class="${App.save.settings.music ? "on" : ""}">ON</button><button data-m="0" class="${App.save.settings.music ? "" : "on"}">OFF</button></span></div>
    <div class="setrow">Sound FX <span class="seg"><button data-s="1" class="${App.save.settings.sfx ? "on" : ""}">ON</button><button data-s="0" class="${App.save.settings.sfx ? "" : "on"}">OFF</button></span></div>`, (box) => {
    box.querySelector('[data-a="resume"]').onclick = resumeRace;
    box.querySelector('[data-a="restart"]').onclick = () => { closeModal(); quitRace(true); };
    box.querySelector('[data-a="help"]').onclick = () => openHelp(() => { App.paused = false; pauseRace(); });
    if (online) box.querySelector('[data-a="restart"]').classList.add("hidden");
    box.querySelector('[data-a="quit"]').onclick = () => { closeModal(); quitRace(false); };
    $$("[data-m]", box).forEach((b) => (b.onclick = () => { App.save.settings.music = b.dataset.m === "1"; saveGame(); applySettings(); App.paused = false; pauseRace(); }));
    $$("[data-s]", box).forEach((b) => (b.onclick = () => { App.save.settings.sfx = b.dataset.s === "1"; saveGame(); applySettings(); App.paused = false; pauseRace(); }));
  });
}
function resumeRace() {
  closeModal();
  App.pauseMenu = false;
  if (!App.race) return;
  App.race.humans.forEach((h, i) => SFX.engineStart(i, h.veh.id));
  App.paused = false;
  App.lastT = 0;
}
function quitRace(restart) {
  SFX.enginesOff();
  Input.enabled = false;
  App.race = null;
  if (App.net && App.mode === "online") netLeave();
  if (restart) return launchRaceFromLast();
  startDemo();
  renderTitle();
  SFX.music(6);
}
async function launchRaceFromLast() {
  $("#loading").classList.remove("hidden");
  stopDemo();
  await launchRace(App.lastCfg);
}

function finishRace() {
  const race = App.race;
  App.race = null;
  Input.enabled = false;
  SFX.enginesOff();
  const sorted = race.riders.slice().sort((a, b) => a.place - b.place);
  const list = $("#res-list");
  list.innerHTML = "";
  sorted.forEach((e) => {
    const row = document.createElement("div");
    row.className = "srow" + (e.human ? " me" : "");
    const tm = e.finished ? fmtTime(e.finishTime) : "+" + Math.max(1, Math.round((race.track.finishZ - e.z) / 2000)) + " s";
    row.innerHTML = `<span class="pl">${e.place}</span><canvas width="96" height="96"></canvas><span>${e.human ? e.name + " · " : ""}${e.rider.name}</span><span style="color:var(--mute);font-size:11px">${e.veh.short}</span><span class="tm">${e.takedowns ? "👊" + e.takedowns + "  " : ""}${tm}</span>`;
    faceIcon(e.rider).then((f) => row.querySelector("canvas").getContext("2d").drawImage(f, 0, 0));
    list.appendChild(row);
  });
  const rw = $("#res-reward");
  const tid = race.track.def.id;
  const starsBefore = totalStars();
  let html = "";
  let coins = 0;
  race.humans.forEach((h, i) => {
    const pay = PAYOUT[h.place - 1] || 50, td = h.takedowns * 40, tk = Math.floor(h.trickPts / 20);
    const mul = h.coinMul > 1 ? h.coinMul : 1;                 // Daily Spin "double coins" perk
    coins += (pay + td + tk) * mul;
    const st = starsForPlace(h.place);
    if (App.mode === "race") {
      App.save.stars[tid] = Math.max(App.save.stars[tid] || 0, st);
      if (h.finished && (!App.save.best[tid] || h.finishTime < App.save.best[tid])) { App.save.best[tid] = h.finishTime; html += `<div class="ln" style="color:var(--teal)"><span>NEW BEST TIME</span><span>${fmtTime(h.finishTime)}</span></div>`; }
    }
    html = `${race.humans.length > 1 ? `<div class="nm" style="font:400 22px Bangers;color:${i ? "var(--hot)" : "var(--teal)"}">PLAYER ${i + 1} — ${ordinal(h.place).toUpperCase()}</div>` : `<div class="big">${ordinal(h.place).toUpperCase()}</div><div class="stars">${[1, 2, 3].map((k) => `<span class="${k <= st ? "" : "off"}">★</span>`).join("")}</div>`}
      <div class="ln"><span>Finish</span><span>+${pay}</span></div><div class="ln"><span>Takedowns × ${h.takedowns}</span><span>+${td}</span></div><div class="ln"><span>Trick points ${h.trickPts}</span><span>+${tk}</span></div>` + (mul > 1 ? `<div class="ln" style="color:var(--sun)"><span>DOUBLE COINS (Daily Spin)</span><span>×2</span></div>` : "") + html;
  });
  App.save.coins += coins;
  App.save.races++;
  html += `<div class="ln" style="font-size:18px;color:var(--sun);border-top:1px solid var(--line);padding-top:6px"><span>COINS EARNED</span><span>+${coins}</span></div>`;
  const starsAfter = totalStars();
  BIOMES.forEach((b) => { if (starsBefore < b.unlock && starsAfter >= b.unlock) html += `<div class="ln" style="color:var(--good)"><span>NEW TRAIL UNLOCKED</span><span>${b.name}</span></div>`; });
  rw.innerHTML = html;
  saveGame();
  const win = race.humans.some((h) => h.place === 1);
  $("#res-h").textContent = win ? "VICTORY!" : race.humans.some((h) => h.place <= 3) ? "PODIUM!" : "RACE OVER";
  // next trail = next unlocked track
  const idx = TRACKS.findIndex((t) => t.id === tid);
  const nxt = TRACKS.slice(idx + 1).find((t) => biomeUnlocked(t.biome));
  const nb = $("#res-next");
  nb.classList.toggle("hidden", !nxt || App.mode === "online");
  nb.onclick = () => { SFX.play("click"); App.pick.track = nxt.id; App.save.last.track = nxt.id; saveGame(); startRace(); };
  $$("#scr-results [data-act]").forEach((b) => (b.onclick = () => {
    SFX.play("click");
    if (b.dataset.act === "menu") { if (App.mode === "online") netLeave(); startDemo(); renderTitle(); SFX.music(6); }
    else if (App.mode === "online") netRematch();
    else launchRaceFromLast();
  }));
  show("scr-results");
  SFX.music(6);
}

/* ---------- attract-mode demo race behind the title ---------- */
async function startDemo() {
  if (App.demo || App.race) return;
  const ids = ["f1", "d1", "g1", "m1", "v1", "t1"].filter((id, i) => biomeUnlocked(i));
  const tid = pick(ids.length ? ids : ["f1"]);
  App.demoLoading = true;
  const race = await createRace({ trackId: tid, humans: [], total: 6, difficulty: 2, botSeed: (Math.random() * 1000) | 0, noRubber: true });
  App.demoLoading = false;
  if (App.race || App.screen !== "scr-title") return;
  race.demo = true;
  race.countdown = 0;
  race.riders[2].cam = true;
  race.riders.forEach((e) => (e.z += 600));
  App.demo = race;
}
function stopDemo() { App.demo = null; }

/* ---------- menu wiring ---------- */
function wireMenus() {
  wireCutieSwitch();
  const sb = document.querySelector("#spin-btn");
  if (sb) sb.addEventListener("click", () => { SFX.unlock(); SFX.play("click"); openDaily(); });
  $$("[data-act]").forEach((b) => b.addEventListener("click", () => {
    if (b.dataset.held) { delete b.dataset.held; return; }      // that was the secret long-press, not a tap
    const a = b.dataset.act;
    SFX.unlock();
    if (a === "race" || a === "split") { App.mode = a; App.step = "rider"; App.pick = { riders: [], vehs: [], track: null }; SFX.play("click"); openRider(); }
    if (a === "garage") { App.mode = "garage"; App.step = "veh"; App.pick = { riders: [App.save.last.rider], vehs: [], track: null }; SFX.play("click"); openVeh(); }
    if (a === "settings") { SFX.play("click"); openSettings(); }
    if (a === "online") { SFX.play("click"); openOnline(); }
    if (a === "back") {
      SFX.play("back");
      const s = App.step;
      if (s === "rider") renderTitle();
      else if (s === "veh") { App.step = App.mode === "garage" ? null : "rider"; App.mode === "garage" ? renderTitle() : openRider(); }
      else if (s === "rider2") { App.step = "veh"; openVeh(); }
      else if (s === "veh2") { App.step = "rider2"; openRider(); }
      else if (s === "track") { App.step = App.mode === "split" ? "veh2" : "veh"; openVeh(); }
      else renderTitle();
    }
  }));
}
