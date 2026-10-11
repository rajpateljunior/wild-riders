/* Online 2-player over a direct phone-to-phone WebRTC link (PeerJS).
   A free public PeerJS server only introduces the two phones; race data then flows directly between them.
   Host: simulates the bots and its own rider.  Guest: simulates its own rider; bots follow the host.
   Each player is the authority for their own rider's health (hits are sent to the victim's device). */

const NET_PREFIX = "wildriders-v1-";
const CODE_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const NetCfg = (() => {
  // ?peerhost=localhost&peerport=9000 lets tests use a local PeerServer
  const q = new URLSearchParams(location.search);
  if (q.get("peerhost")) return { host: q.get("peerhost"), port: +(q.get("peerport") || 9000), path: q.get("peerpath") || "/", secure: false, debug: 1 };
  return { debug: 1 };
})();

function loadPeerLib() {
  if (window.Peer) return Promise.resolve();
  return new Promise((res, rej) => {
    const s = document.createElement("script");
    s.src = "peerjs.min.js";
    s.onload = () => res(); s.onerror = () => rej(new Error("lib"));
    document.head.appendChild(s);
  });
}

function openOnline() {
  modal(`<h3>2 PLAYERS · ONLINE</h3>
    <p>Race a friend on their own phone or iPad — anywhere, Wi-Fi or cellular. Both of you need internet. Bots fill the other 6 spots.</p>
    <p style="color:var(--mute);font-size:12.5px">One player hosts and gets a 4-letter code. The other taps JOIN and types it. Works best when both are on Wi-Fi; some cellular networks block direct connections.</p>
    <div class="acts"><button class="btn" style="--c:#2b9cff" data-a="host">HOST A RACE</button><button class="btn" style="--c:#ff8a1c" data-a="join">JOIN A RACE</button><button class="btn sm ghost" data-a="close">CANCEL</button></div>`, (box) => {
    box.querySelector('[data-a="close"]').onclick = () => { SFX.play("back"); closeModal(); };
    const go = (role) => { SFX.play("click"); closeModal(); App.mode = "online"; App.netRole = role; App.step = "rider"; App.pick = { riders: [], vehs: [], track: null }; openRider(); };
    box.querySelector('[data-a="host"]').onclick = () => go("host");
    box.querySelector('[data-a="join"]').onclick = () => go("guest");
  });
}

function netStatus(title, msg, extra = "", onCancel) {
  modal(`<h3>${title}</h3>${msg}${extra}<div class="acts"><button class="btn sm ghost" data-a="cancel">CANCEL</button></div>`, (box) => {
    box.querySelector('[data-a="cancel"]').onclick = () => { SFX.play("back"); netLeave(); closeModal(); onCancel && onCancel(); };
  });
}

function makeCode() { let c = ""; for (let i = 0; i < 4; i++) c += CODE_CHARS[(Math.random() * CODE_CHARS.length) | 0]; return c; }

function myHello() {
  return { t: "hello", ver: 1, cz: cutieOn() ? 1 : 0, rider: App.pick.riders[0] || App.save.last.rider, veh: App.pick.vehs[0] || App.save.last.veh, upg: App.save.upg[App.pick.vehs[0] || App.save.last.veh] || [0, 0, 0] };
}

/* ---------------- host ---------------- */
async function netHost() {
  netLeave();
  netStatus("CONNECTING…", "<p>Setting up your room.</p>");
  try { await loadPeerLib(); } catch (_) { return netFail("Couldn't load online play. Check your internet connection."); }
  const N = (App.net = { role: "host", code: makeCode(), conn: null, peer: null, ready: false, loaded: false, tries: 0 });
  const tryOpen = () => {
    const peer = new Peer(NET_PREFIX + N.code, NetCfg);
    N.peer = peer;
    peer.on("open", () => {
      netStatus("ROOM CODE", `<div class="codebox">${N.code}</div>
        <p>Tell your friend: open Wild Riders → <b>2 PLAYERS · ONLINE</b> → <b>JOIN</b> → type <b>${N.code}</b>.</p>
        <p style="color:var(--mute)">Waiting for your friend to join…</p>`);
    });
    peer.on("error", (err) => {
      if (err.type === "unavailable-id" && N.tries++ < 4) { peer.destroy(); N.code = makeCode(); return tryOpen(); }
      if (App.net !== N) return;
      netFail(err.type === "network" || err.type === "server-error" || err.type === "socket-error" ? "Couldn't reach the matchmaking server. Check your internet and try again." : "Online error: " + err.type);
    });
    peer.on("connection", (conn) => {
      if (N.conn) { conn.on("open", () => { conn.send({ t: "full" }); setTimeout(() => conn.close(), 300); }); return; }
      N.conn = conn;
      wireConn(N, conn);
    });
  };
  tryOpen();
}

/* ---------------- guest ---------------- */
function netJoinPrompt() {
  modal(`<h3>JOIN A RACE</h3><p>Type the 4-letter code shown on your friend's screen.</p>
    <input class="codein" id="join-code" maxlength="4" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="ABCD">
    <div class="acts"><button class="btn" style="--c:#2bd96a" data-a="join">JOIN</button><button class="btn sm ghost" data-a="cancel">CANCEL</button></div>`, (box) => {
    const inp = box.querySelector("#join-code");
    setTimeout(() => inp.focus(), 50);
    inp.addEventListener("input", () => (inp.value = inp.value.toUpperCase().replace(/[^A-Z0-9]/g, "")));
    const go = () => { const c = inp.value.trim().toUpperCase(); if (c.length !== 4) { toast("CODES ARE 4 LETTERS"); return; } SFX.play("click"); netJoin(c); };
    box.querySelector('[data-a="join"]').onclick = go;
    inp.addEventListener("keydown", (e) => { if (e.key === "Enter") go(); });
    box.querySelector('[data-a="cancel"]').onclick = () => { SFX.play("back"); closeModal(); };
  });
}

async function netJoin(code) {
  netLeave();
  netStatus("JOINING " + code + "…", "<p>Connecting to your friend's phone.</p>");
  try { await loadPeerLib(); } catch (_) { return netFail("Couldn't load online play. Check your internet connection."); }
  const N = (App.net = { role: "guest", code, conn: null, peer: null });
  const peer = new Peer(NetCfg);
  N.peer = peer;
  peer.on("open", () => {
    const conn = peer.connect(NET_PREFIX + code, { reliable: true, serialization: "json" });
    N.conn = conn;
    wireConn(N, conn);
    N.timer = setTimeout(() => { if (!N.opened && App.net === N) netFail("Couldn't connect to that room. Check the code — and try both phones on Wi-Fi."); }, 14000);
  });
  peer.on("error", (err) => {
    if (App.net !== N) return;
    netFail(err.type === "peer-unavailable" ? `No room called <b>${code}</b>. Check the code with your friend.` : err.type === "network" || err.type === "server-error" || err.type === "socket-error" ? "Couldn't reach the matchmaking server. Check your internet." : "Online error: " + err.type);
  });
}

function netFail(msg) {
  netLeave();
  modal(`<h3>OOPS</h3><p>${msg}</p><div class="acts"><button class="btn sm" style="--c:#2b9cff" data-a="ok">OK</button></div>`, (box) => {
    box.querySelector('[data-a="ok"]').onclick = () => { closeModal(); if (!App.race) { startDemo(); renderTitle(); } };
  });
}

/* ---------------- connection + protocol ---------------- */
function wireConn(N, conn) {
  conn.on("open", () => {
    N.opened = true;
    clearTimeout(N.timer);
    if (N.role === "guest") { conn.send(myHello()); netStatus("CONNECTED!", "<p>Waiting for the host to start the race…</p>"); }
  });
  conn.on("data", (m) => netOnMessage(N, m));
  conn.on("close", () => netLost(N));
  conn.on("error", () => netLost(N));
}

function netSend(m) { const N = App.net; if (N && N.conn && N.conn.open) { try { N.conn.send(m); } catch (_) {} } }

function netOnMessage(N, m) {
  if (App.net !== N || !m || !m.t) return;
  const race = App.race;
  switch (m.t) {
    case "full": netFail("That room already has two riders."); break;
    case "hello": // host receives guest's rider choice → start
      N.guest = m;
      netStartAsHost();
      break;
    case "start": netStartAsGuest(m.cfg); break;
    case "ready": N.ready = true; netMaybeGo(); break;
    case "go": if (race) { race.hold = false; closeModal(); } break;
    case "s": if (race) netApplyState(race, m); break;
    case "ev": if (race) netApplyEvent(race, m); break;
    case "rematch": if (N.role === "host") netStartAsHost(); break;
    case "bye": netLost(N, true); break;
  }
}

function netStartAsHost() {
  const N = App.net;
  const g = N.guest;
  const me = myHello();
  const cfg = {
    trackId: App.pick.track || App.save.last.track, total: 8, difficulty: App.save.settings.diff, botSeed: (Math.random() * 100000) | 0, online: true,
    fav: cutieOn() ? 1 : g.cz ? 0 : null,          // cutie mode on either phone: the OTHER phone's rider always wins
    humans: [{ riderId: me.rider, vehId: me.veh, upg: me.upg, netId: 0 }, { riderId: g.rider, vehId: g.veh, upg: g.upg, netId: 1, remote: true }],
  };
  N.ready = false; N.loaded = false;
  netSend({ t: "start", cfg });
  closeModal();
  netLaunch(cfg);
}

function netStartAsGuest(cfg) {
  // same race, but from the guest's side: rider 0 (host) is remote, rider 1 is us
  const mine = JSON.parse(JSON.stringify(cfg));
  mine.humans[0].remote = true; mine.humans[1].remote = false;
  closeModal();
  netLaunch(mine);
}

async function netLaunch(cfg) {
  const N = App.net;
  App.mode = "online";
  if (App.race) { SFX.enginesOff(); App.race = null; }
  show(null);
  $("#loading .tip").textContent = "TIP: Online hits land on your friend's phone — punch them off the trail!";
  $("#loading").classList.remove("hidden");
  stopDemo();
  App.lastCfg = cfg;
  await launchRace(cfg);
  const race = App.race;
  race.hold = true;
  race.net = { role: N.role, send: netSend, queueHit: (e, amt, by, kind) => netSendHit(race, e, amt, by, kind), hitInfo: null };
  if (N.role === "guest") race.riders.forEach((e) => { if (!e.human) e.remote = true; });
  N.sendT = 0;
  netStatus("GET READY", `<p>Waiting for ${N.role === "host" ? "your friend" : "the host"} to finish loading…</p>`);
  if (N.role === "guest") netSend({ t: "ready" });
  else { N.loaded = true; netMaybeGo(); }
}

function netMaybeGo() {
  const N = App.net;
  if (!N || N.role !== "host" || !N.loaded || !N.ready || !App.race) return;
  netSend({ t: "go" });
  App.race.hold = false;
  closeModal();
}

function riderState(e) {
  return [Math.round(e.z), +e.x.toFixed(3), Math.round(e.h), Math.round(e.speed), +e.lean.toFixed(2), Math.round(e.hp * 10) / 10, Math.round(e.boost),
    (e.boosting ? 1 : 0) | (e.padT > 0 ? 2 : 0) | (e.finished ? 4 : 0) | (e.atkKick ? 8 : 0), +Math.max(0, e.wipeT).toFixed(2), +Math.max(0, e.atkT).toFixed(2), e.atkSide,
    e.trick ? TRICKS.indexOf(e.trick.def) : -1, e.trick ? +(e.trick.t / e.trick.dur).toFixed(2) : 0, +Math.max(0, e.hurtT).toFixed(2), +e.finishTime.toFixed(2)];
}
function netBeforeStep() {}
function netAfterFrame(race, dt) {
  const N = App.net;
  if (!N || !race.net || race.hold) return;
  N.sendT -= dt;
  if (N.sendT > 0) return;
  N.sendT = 1 / 20;
  const m = { t: "s", r: {} };
  race.riders.forEach((e, i) => { if (!e.remote) m.r[i] = riderState(e); });
  netSend(m);
}
function netApplyState(race, m) {
  for (const k in m.r) {
    const e = race.riders[+k];
    if (!e || !e.remote) continue;
    const a = m.r[k];
    const first = !e.net;
    e.net = { z: a[0], x: a[1], h: a[2], speed: a[3], lean: a[4], hp: a[5], boost: a[6], boosting: !!(a[7] & 1), padT: a[7] & 2 ? 0.5 : 0, finished: !!(a[7] & 4), atkKick: !!(a[7] & 8),
      wipeT: a[8], atkT: a[9], atkSide: a[10], trick: a[11] >= 0 ? TRICKS[a[11]].id : null, trickT: a[12], hurtT: a[13], finishTime: a[14], age: 0 };
    if (first) { e.z = a[0]; e.x = a[1]; }
    if (e.net.finished && !e.finished) race.finishOrder.push(e);
  }
}
function netApplyEvent(race, m) {
  if (m.k === "throw") {
    const e = race.riders[m.i];
    if (e) spawnProjectiles(race, e, m.item, m.dir, m.z, m.x, m.sp, m.id);
  } else if (m.k === "pop") {
    race.projs = race.projs.filter((p) => p.id !== m.id);
    const v = race.riders[m.v];
    if (v) for (let k = 0; k < 8; k++) spawnFx(race, v.z, v.x + rnd(-0.2, 0.2), 300 + rnd(-100, 100), "#fff6a8", 50, 0.5, 600);
  } else if (m.k === "take") {
    const s = race.track.segs[m.s];
    if (s && s.objs[m.o]) s.objs[m.o].taken = race.time + 6;
  } else if (m.k === "hit") {
    const e = race.riders[m.v], by = race.riders[m.by];
    if (!e || e.remote) return;
    damage(race, e, m.dmg, by || null, m.kind);
    if (m.slow) e.speed *= m.slow;
    if (m.push) e.vx += m.push;
    e.hurtT = Math.max(e.hurtT, 0.45);
    if (e.human) e.shake = m.kick ? 10 : 5;
    if (m.kind === "melee") race.events.push({ snd: m.dmg > 12 ? "kick" : "punch", e: by || e, target: e });
  }
}
function netSendHit(race, e, amt, by, kind) {
  const info = race.net.hitInfo || {};
  race.net.hitInfo = null;
  netSend({ t: "ev", k: "hit", v: race.riders.indexOf(e), by: race.riders.indexOf(by), dmg: +amt.toFixed(2), kind, slow: info.slow || 0, push: info.push || 0, kick: amt > 12 });
}

function netLost(N, bye) {
  if (App.net !== N || N.lost) return;
  N.lost = true;
  const race = App.race;
  if (race && race.net) {
    // keep racing: the friend's rider (and, for a guest, the bots) switch to computer control
    race.riders.forEach((e) => { if (e.remote) { e.remote = false; if (e.human) { e.human = false; e.name = (e.name || "") + " (left)"; } e.ai = e.ai || { skill: 0.85, aggr: 0.5, t: 0, tx: 0, inp: {} }; } });
    race.net = null;
    race.hold = false;
    race.cfg.fav = null; race.favE = null;
    closeModal();
    toast(bye ? "YOUR FRIEND LEFT" : "CONNECTION LOST");
  } else if (N.opened) {
    netFail(bye ? "Your friend left the room." : "The connection dropped.");
  }
}

function netLeave() {
  const N = App.net;
  if (!N) return;
  App.net = null;
  try { if (N.conn && N.conn.open) N.conn.send({ t: "bye" }); } catch (_) {}
  setTimeout(() => { try { N.conn && N.conn.close(); } catch (_) {} try { N.peer && N.peer.destroy(); } catch (_) {} }, 150);
  clearTimeout(N.timer);
}

function netRematch() {
  const N = App.net;
  if (!N || N.lost) { toast("NOT CONNECTED"); startDemo(); renderTitle(); return; }
  if (N.role === "host") netStartAsHost();
  else { netSend({ t: "rematch" }); netStatus("REMATCH", "<p>Asking the host to start another race…</p>"); }
}
