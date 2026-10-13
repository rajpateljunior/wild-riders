/* Daily Spin: one free wheel spin per day, offered the first time the game is opened that day.
   Prizes: coins, or a one-race perk (start boost, shield, double coins, power throws).
   Save fields: save.spin = { last: "YYYY-MM-DD", streak: n, seen: ms }, save.perk = null | "boost" | "shield" | "double" | "power".
   All of it is optional: saves without these fields load fine and simply get a spin available.
   Clock guard: `seen` remembers the latest time this device has reported, so turning the phone clock BACK never
   creates a new day. (Turning it forward can't be stopped without a server; the game is offline by design.) */

const WHEEL = [
  { id: "c100",  label: "100",    kind: "coins", n: 100,  w: 22 },
  { id: "boost", label: "BOOST",  kind: "perk", perk: "boost",  w: 14, desc: "START BOOST: your next race begins with a full boost meter." },
  { id: "c250",  label: "250",    kind: "coins", n: 250,  w: 16 },
  { id: "shield", label: "SHIELD", kind: "perk", perk: "shield", w: 14, desc: "SHIELD: blocks the first hit you take in your next race." },
  { id: "c500",  label: "500",    kind: "coins", n: 500,  w: 8 },
  { id: "power", label: "POWER",  kind: "perk", perk: "power",  w: 12, desc: "POWER THROWS: you start with 3 throwables and they hit 40% harder for your next race." },
  { id: "c1500", label: "1500",   kind: "coins", n: 1500, w: 2, jackpot: true },
  { id: "double", label: "x2",    kind: "perk", perk: "double", w: 12, desc: "DOUBLE COINS: everything you earn in your next race is doubled." },
];
const PERK_NAMES = { boost: "START BOOST", shield: "SHIELD", power: "POWER THROWS", double: "DOUBLE COINS" };

function spinNow() {                                   // never earlier than the latest time we have seen (clock-rollback guard)
  const sp = App.save.spin || (App.save.spin = { last: "", streak: 0, seen: 0 });
  const t = Math.max(Date.now(), sp.seen || 0);
  sp.seen = t;
  return t;
}
function dayKey(ms) { const d = new Date(ms); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
function spinAvailable() { return (App.save.spin ? App.save.spin.last : "") !== dayKey(spinNow()); }
function msToNextSpin() { const t = spinNow(), d = new Date(t); const nx = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1).getTime(); return Math.max(0, nx - t); }
function fmtCountdown(ms) { const s = Math.ceil(ms / 1000), h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60; return h + ":" + String(m).padStart(2, "0") + ":" + String(x).padStart(2, "0"); }

// Streak after this spin: consecutive days continue it, a missed day restarts at 1. (After day 7 the stored streak is 0.)
function nextStreak() {
  const sp = App.save.spin || {};
  const d = new Date(spinNow());
  const yKey = dayKey(new Date(d.getFullYear(), d.getMonth(), d.getDate() - 1, 12).getTime());     // noon yesterday: safe across DST
  return sp.last === yKey ? (sp.streak || 0) + 1 : 1;
}

function pickWheel(streakDay) {
  const pool = streakDay >= 7 ? WHEEL.filter((s) => s.id === "c500" || s.id === "c1500") : WHEEL;      // 7th day: guaranteed 500+
  const weights = streakDay >= 7 ? pool.map((s) => (s.id === "c1500" ? 1 : 9)) : pool.map((s) => s.w);
  let r = Math.random() * weights.reduce((a, b) => a + b, 0);
  for (let i = 0; i < pool.length; i++) { r -= weights[i]; if (r <= 0) return pool[i]; }
  return pool[0];
}

/* Applies the stored perk to the local player's rider at the start of a race, then uses it up. */
function applyPerk(e) {
  const k = App.save.perk;
  if (!k) return;
  if (k === "boost") e.boost = 100;
  if (k === "shield") { e.shield = 1; e.shieldT = 1e9; }      // the perk shield waits all race for its one hit
  if (k === "double") e.coinMul = 2;
  if (k === "power") { e.items = [e.rider.item, e.rider.item, e.rider.item]; e.itemMul = 1.4; }
  App.save.perk = null;
  saveGame();
}

/* ---------- the wheel ---------- */
function wheelSVG() {
  const R = 150, cx = 160, cy = 160, n = WHEEL.length, a = 360 / n;
  const pt = (deg, r) => { const t = (deg - 90) * Math.PI / 180; return [cx + Math.cos(t) * r, cy + Math.sin(t) * r]; };
  const arc = ["#ff3d7f", "#ffb300", "#2b9cff", "#2bd96a", "#ff8a1c", "#8a4dff", "#ffd23f", "#13a89e"];
  const sav = ["#7a1620", "#3a2f2f", "#5a1c1c", "#2c2626", "#6b2216", "#352a2a", "#a8841c", "#4a1c24"];
  let s = `<svg viewBox="0 0 320 320" xmlns="http://www.w3.org/2000/svg"><g class="wheel-rot">`;
  s += `<circle cx="${cx}" cy="${cy}" r="${R + 8}" fill="#14101c"/>`;
  WHEEL.forEach((seg, i) => {
    const [x1, y1] = pt(i * a, R), [x2, y2] = pt((i + 1) * a, R);
    const fill = (SAVAGE() ? sav : arc)[i];
    s += `<path d="M${cx} ${cy} L${x1.toFixed(1)} ${y1.toFixed(1)} A${R} ${R} 0 0 1 ${x2.toFixed(1)} ${y2.toFixed(1)}Z" fill="${fill}" stroke="#14101c" stroke-width="3"/>`;
    const mid = i * a + a / 2, [tx, ty] = pt(mid, R * 0.64);
    const big = seg.kind === "coins";
    s += `<text x="${tx.toFixed(1)}" y="${ty.toFixed(1)}" transform="rotate(${mid} ${tx.toFixed(1)} ${ty.toFixed(1)})" text-anchor="middle" dominant-baseline="central" font-family="Bangers, Impact, sans-serif" font-size="${seg.label.length > 4 ? 25 : big ? 34 : 30}" fill="#fff" stroke="#14101c" stroke-width="4" paint-order="stroke">${seg.label}</text>`;
    if (seg.jackpot) { const [jx, jy] = pt(mid, R * 0.9); s += `<text x="${jx.toFixed(1)}" y="${jy.toFixed(1)}" transform="rotate(${mid} ${jx.toFixed(1)} ${jy.toFixed(1)})" text-anchor="middle" dominant-baseline="central" font-family="Bangers, Impact, sans-serif" font-size="13" fill="#fff6b0" stroke="#14101c" stroke-width="3" paint-order="stroke">JACKPOT</text>`; }
    if (seg.kind === "coins") { const [dx, dy] = pt(mid, R * 0.34); s += `<circle cx="${dx.toFixed(1)}" cy="${dy.toFixed(1)}" r="9" fill="#ffd23f" stroke="#b37b00" stroke-width="3"/>`; }
  });
  s += `<circle cx="${cx}" cy="${cy}" r="26" fill="#14101c"/><circle cx="${cx}" cy="${cy}" r="18" fill="${SAVAGE() ? "#8f0f1a" : "#ffd23f"}"/></g>`;
  s += `<path d="M${cx - 15} 4 L${cx + 15} 4 L${cx} 40Z" fill="#fff" stroke="#14101c" stroke-width="4" stroke-linejoin="round"/></svg>`;
  return s;
}

let spinBusy = false;
function openDaily() {
  const avail = spinAvailable();
  const streakNow = App.save.spin ? App.save.spin.streak || 0 : 0;
  const upcoming = avail ? nextStreak() : streakNow;
  const pips = [1, 2, 3, 4, 5, 6, 7].map((d) => `<i class="${avail ? (d < upcoming ? "on" : d === upcoming ? "now" : "") : (d <= streakNow ? "on" : "")}${d === 7 ? " last" : ""}"></i>`).join("");
  modal(`<div class="spinbox">
      <div class="wheelwrap">${wheelSVG()}</div>
      <div class="spininfo">
        <h3>DAILY SPIN</h3>
        <div class="streak"><span>${avail ? "Day " + upcoming + " of 7" : streakNow === 0 ? "7-day streak complete! A new one starts tomorrow" : "Streak: day " + streakNow + " of 7"}</span><div class="pips">${pips}</div></div>
        <p class="spinmsg" id="spin-msg">${avail ? "One free spin every day. Day 7 of a streak is a guaranteed 500+ coin prize." : "You already spun today. Next spin in <b id='spin-cd'>" + fmtCountdown(msToNextSpin()) + "</b>."}</p>
        <div class="acts"><button class="btn" style="--c:#ff3d7f" id="spin-go" ${avail ? "" : "disabled"}>SPIN!</button><button class="btn sm ghost" id="spin-close">${avail ? "LATER" : "CLOSE"}</button></div>
      </div>
    </div>`, (box) => {
    const wheel = box.querySelector(".wheel-rot");
    const msg = box.querySelector("#spin-msg"), go = box.querySelector("#spin-go"), close = box.querySelector("#spin-close");
    close.onclick = () => { if (spinBusy) return; SFX.play("back"); closeModal(); refreshTitleExtras(); };
    if (!avail) {
      const cd = box.querySelector("#spin-cd");
      const iv = setInterval(() => { if (!document.body.contains(cd)) return clearInterval(iv); cd.textContent = fmtCountdown(msToNextSpin()); }, 1000);
      return;
    }
    go.onclick = () => {
      if (spinBusy || !spinAvailable()) return;
      spinBusy = true; go.disabled = true; close.disabled = true;
      SFX.unlock(); SFX.play("click");
      // decide and SAVE the prize first, so closing the app mid-spin can never give a second spin or lose the prize
      const sp = App.save.spin || (App.save.spin = { last: "", streak: 0, seen: 0 });
      const day = nextStreak();
      const prize = pickWheel(day);
      sp.last = dayKey(spinNow()); sp.streak = day >= 7 ? 0 : day;
      if (prize.kind === "coins") App.save.coins += prize.n; else App.save.perk = prize.perk;
      saveGame();
      // animate: land the chosen slice under the pointer at the top
      const idx = WHEEL.indexOf(prize), a = 360 / WHEEL.length;
      const jitter = (Math.random() - 0.5) * a * 0.6;
      const finalDeg = 360 * 5 + (360 - (idx * a + a / 2 + jitter));
      wheel.style.transformOrigin = "160px 160px";
      wheel.style.transition = "transform 4.2s cubic-bezier(.12,.62,.1,1)";
      requestAnimationFrame(() => requestAnimationFrame(() => { wheel.style.transform = `rotate(${finalDeg}deg)`; }));
      let tick = 0; const tk = setInterval(() => { if (++tick < 22) SFX.play("click"); else clearInterval(tk); }, 170);
      setTimeout(() => {
        clearInterval(tk);
        SFX.play("unlock");
        $$(".coinv").forEach((c) => (c.textContent = App.save.coins.toLocaleString()));
        msg.innerHTML = prize.kind === "coins"
          ? `<b style="color:var(--sun);font:400 30px Bangers">${prize.jackpot ? "JACKPOT! " : ""}+${prize.n} COINS!</b>`
          : `<b style="color:var(--teal);font:400 26px Bangers">${PERK_NAMES[prize.perk]}!</b><br>${prize.desc.split(": ")[1]}`;
        box.querySelector(".streak span").textContent = (day >= 7 ? "Streak complete! Starts again tomorrow" : "Day " + day + " of 7 done. Come back tomorrow");
        close.disabled = false; close.textContent = "NICE!";
        spinBusy = false;
        refreshTitleExtras();
      }, 4400);
    };
  });
}

/* Title-screen extras: the Daily Spin button with its countdown, and a chip showing a waiting perk. */
function refreshTitleExtras() {
  const b = document.querySelector("#spin-btn"), chip = document.querySelector("#perk-chip");
  if (!b || !App.save) return;
  const avail = spinAvailable();
  b.classList.toggle("ready", avail);
  b.querySelector("span").textContent = avail ? "DAILY SPIN" : "SPIN IN " + fmtCountdown(msToNextSpin());
  b.querySelector(".tag").classList.toggle("hidden", !avail);
  if (chip) { chip.classList.toggle("hidden", !App.save.perk); chip.textContent = App.save.perk ? "NEXT RACE: " + PERK_NAMES[App.save.perk] : ""; }
}
setInterval(() => { if (typeof App !== "undefined" && App.save && App.screen === "scr-title") refreshTitleExtras(); }, 1000);

/* ---------- popups shown when the game opens ---------- */
function lineupNotice(after) {
  const n = App.save.note;
  const paid = n.paid && n.paid.length ? n.paid.join(", ") : "";
  modal(`<h3>RIDER LINEUP UPDATED</h3>
    <p>Riders now unlock in a new order: <b>Kaito and Bruno</b> are free, then Yuki, Zara, <b>Priya</b> and Rex. Your unlocked riders were reset to Kaito and Bruno.</p>
    ${n.refund > 0 ? `<p style="color:var(--sun);font-size:17px"><b>+${n.refund.toLocaleString()} coins refunded</b> for the riders you had bought${paid ? " (" + paid + ")" : ""}. Spend them to unlock riders in the new order.</p>` : ""}
    <p>Your stars, best times, rides, upgrades and settings were not touched.</p>
    <div class="acts"><button class="btn" style="--c:#2bd96a" data-a="ok">GOT IT</button></div>`, (box) => {
    box.querySelector('[data-a="ok"]').onclick = () => {
      SFX.play("click");
      delete App.save.note; saveGame(); closeModal();
      $$(".coinv").forEach((c) => (c.textContent = App.save.coins.toLocaleString()));
      after && after();
    };
  });
}

function restoreOffer(after) {
  const c = bestStoredCopy();
  const n = Object.values(c.stars || {}).reduce((a, b) => a + b, 0), now = Object.values(App.save.stars || {}).reduce((a, b) => a + b, 0);
  modal(`<h3>FOUND YOUR OLDER PROGRESS</h3>
    <p>This device has a saved copy with <b>${n} ★</b> and <b>${(c.vehs || []).length} rides</b>. Right now you have ${now} ★ and ${(App.save.vehs || []).length} rides.</p>
    <p>Restore it? Your stars, best times, rides, upgrades and coins come back (riders follow the new unlock order, with coins refunded).</p>
    <div class="acts"><button class="btn" style="--c:#2bd96a" data-a="yes">RESTORE</button><button class="btn sm ghost" data-a="no">NOT NOW</button></div>`, (box) => {
    box.querySelector('[data-a="yes"]').onclick = () => { App.save = restoreStoredCopy(c); saveGame(); applySettings(); closeModal(); toast("PROGRESS RESTORED!"); renderTitle(); after && after(); };
    box.querySelector('[data-a="no"]').onclick = () => { SFX.play("back"); closeModal(); after && after(); };
  });
}

function startupPopups() {
  if (App.screen !== "scr-title" || !App.save || App.race) return;
  const spinMaybe = () => { if (App.screen === "scr-title" && spinAvailable()) setTimeout(openDaily, 250); };
  if (bestStoredCopy() && !App.save.note) return restoreOffer(spinMaybe);
  if (whatsNewDue() && !App.save.note) return openWhatsNew(spinMaybe);
  if (App.save.note && App.save.note.kind === "lineup") return lineupNotice(spinMaybe);
  spinMaybe();
}
