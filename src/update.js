/* Updates + backups.
   1) UPDATE BANNER: on open (and when the app comes back to the front) the game reads version.json from the internet.
      If it names a different build than this page's BUILD_ID, a banner says "New update available" with an UPDATE
      button (menus only, never during a race). Tapping it clears the app's cached files and reloads from the internet.
      Progress is never touched (it lives in localStorage, not in the app cache). No need to delete the app, ever.
   2) WHAT'S NEW: after an update, a popup lists the changes (APP_VERSION / WHATS_NEW below; edit them on every release).
   3) BACKUP REMINDER: every few races (at most every 3 days) a popup shows the save code with COPY / SHARE, so a copy
      of your progress lives outside the game (Notes, a text to yourself). Stored in localStorage "wr-backup". */

// ===== Edit these two on every release =====
const APP_VERSION = "2026.10.12b";
const WHATS_NEW = [
  "Update button: new versions now show an UPDATE banner. Tap it, no need to delete the app.",
  "Backup reminder: every few races the game shows your save code so you can keep a copy.",
  "Safety net: unreadable saves are kept, and older progress found on this device can be restored.",
  "Daily Spin wheel, Arcade / Savage style, armored riders, new logo, new rider order (from the last update).",
];
// ============================================

const BUILD_ID = "__BUILD__";            // stamped by tools/build.py; matches version.json of this build
const VERSION_KEY = "wr-version", BACKUP_INFO_KEY = "wr-backup";
const Upd = { reg: null, ready: false };

function setupUpdates() {
  if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost"))
    navigator.serviceWorker.register("sw.js", { updateViaCache: "none" }).catch(() => {});
  // Is there a newer version online? Checked on open, whenever the app comes back to the front, and every 30 min.
  const check = () => {
    if (Upd.ready || !navigator.onLine) return;
    fetch("version.json?t=" + Date.now(), { cache: "no-store" }).then((r) => (r.ok ? r.json() : null)).then((j) => {
      if (j && j.build && j.build !== BUILD_ID) markUpdateReady();
    }).catch(() => {});
  };
  setTimeout(check, 1500);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) check(); });
  window.addEventListener("online", check);
  setInterval(check, 30 * 60 * 1000);
}

function markUpdateReady() { Upd.ready = true; refreshUpdateBanner(); }
function refreshUpdateBanner() {
  const b = document.querySelector("#upd");
  if (!b) return;
  const onMenu = !App.race && document.querySelector("#loading").classList.contains("hidden");    // never during a race or loading
  b.classList.toggle("hidden", !(Upd.ready && onMenu));
}
setInterval(() => { if (typeof App !== "undefined" && App.save) refreshUpdateBanner(); }, 800);

/* UPDATE: throw away this app's cached copy of the game (NOT the save: progress lives in localStorage, a different
   place) and reload, so the newest files come straight from the internet. Then the offline copy is rebuilt. */
async function applyUpdate() {
  const b = document.querySelector("#upd button");
  if (b) { b.disabled = true; b.textContent = "UPDATING…"; }
  try { saveGame(); } catch (_) {}
  try {
    if (navigator.serviceWorker) { const regs = await navigator.serviceWorker.getRegistrations(); await Promise.all(regs.map((r) => r.unregister())); }
    if (window.caches) { const keys = await caches.keys(); await Promise.all(keys.filter((k) => k.startsWith("wild-riders-")).map((k) => caches.delete(k))); }
  } catch (_) {}
  location.replace(location.pathname + "?u=" + Date.now());
}

/* What's new: shown once after the game starts on a new APP_VERSION (not on a brand-new install). */
function whatsNewDue() {
  let seen = null; try { seen = localStorage.getItem(VERSION_KEY); } catch (_) {}
  if (seen === APP_VERSION) return false;
  if (!seen && !(App.save && App.save.races > 0)) { try { localStorage.setItem(VERSION_KEY, APP_VERSION); } catch (_) {} return false; }
  return true;
}
function openWhatsNew(after) {
  modal(`<h3>WHAT'S NEW</h3><ul class="wn">${WHATS_NEW.map((l) => `<li>${l}</li>`).join("")}</ul>
    <p style="font-size:12px;color:var(--mute)">Version ${APP_VERSION}. Your progress was kept.</p>
    <div class="acts"><button class="btn" style="--c:#2bd96a" data-a="ok">LET'S RIDE</button></div>`, (box) => {
    box.querySelector('[data-a="ok"]').onclick = () => { SFX.play("click"); try { localStorage.setItem(VERSION_KEY, APP_VERSION); } catch (_) {} closeModal(); after && after(); };
  });
}

/* Backup reminder: due after 3+ races, then again every 5 races but no more than once every 3 days. */
function backupInfo() { try { return JSON.parse(localStorage.getItem(BACKUP_INFO_KEY) || "null") || { at: 0, races: 0 }; } catch (_) { return { at: 0, races: 0 }; } }
function backupDue() {
  const s = App.save; if (!s || s.races < 3) return false;
  const b = backupInfo();
  if (!b.at) return true;
  return s.races - b.races >= 5 && Date.now() - b.at >= 3 * 864e5;
}
function openBackupReminder(after) {
  const code = encodeSave();
  const stars = totalStars();
  modal(`<h3>BACK UP YOUR PROGRESS</h3>
    <p>Keep a copy of this code somewhere safe, like your Notes app or a text to yourself. If your progress is ever lost (new phone, deleted app), paste it into <b>Settings → Save Code</b> and everything comes back.</p>
    <p style="color:var(--sun);font-weight:700">${stars} ★ · ${App.save.vehs.length} rides · ${App.save.coins.toLocaleString()} coins</p>
    <textarea readonly id="bk-code">${code}</textarea>
    <div class="acts">
      <button class="btn sm" style="--c:#2b9cff" data-a="copy">COPY CODE</button>
      ${navigator.share ? `<button class="btn sm" style="--c:#13a89e" data-a="share">SHARE / SAVE…</button>` : ""}
      <button class="btn sm ghost" data-a="done">DONE</button>
    </div>`, (box) => {
    const mark = () => { try { localStorage.setItem(BACKUP_INFO_KEY, JSON.stringify({ at: Date.now(), races: App.save.races })); } catch (_) {} };
    box.querySelector('[data-a="copy"]').onclick = () => {
      const t = box.querySelector("#bk-code"); t.select();
      (navigator.clipboard ? navigator.clipboard.writeText(code) : Promise.reject()).then(() => toast("COPIED! PASTE IT IN NOTES")).catch(() => { try { document.execCommand("copy"); toast("COPIED!"); } catch (_) {} });
      mark();
    };
    const sh = box.querySelector('[data-a="share"]');
    if (sh) sh.onclick = () => { navigator.share({ title: "Wild Riders save code", text: code }).then(mark).catch(() => {}); };
    box.querySelector('[data-a="done"]').onclick = () => { SFX.play("click"); mark(); closeModal(); after && after(); };
  });
}
function maybeBackupReminder() {
  if (!backupDue() || !document.querySelector("#modal").classList.contains("hidden")) return;
  openBackupReminder();
}
