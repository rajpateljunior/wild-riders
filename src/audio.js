/* Synthesized audio: engine/wind, SFX and a procedural soundtrack per biome. No audio files. */

const SFX = (() => {
  let ac = null, master, musicBus, sfxBus, noiseBuf;
  let musicOn = true, sfxOn = true, musicVol = 0.45, sfxVol = 0.8;
  let unlocked = false;
  const engines = [];
  let seq = null;

  function init() {
    if (ac) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ac = new AC();
    master = ac.createGain(); master.gain.value = 0.9; master.connect(ac.destination);
    const comp = ac.createDynamicsCompressor(); comp.connect(master);
    musicBus = ac.createGain(); musicBus.gain.value = musicOn ? musicVol : 0; musicBus.connect(comp);
    sfxBus = ac.createGain(); sfxBus.gain.value = sfxOn ? sfxVol : 0; sfxBus.connect(comp);
    noiseBuf = ac.createBuffer(1, ac.sampleRate * 1.5, ac.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  function unlock() {
    init();
    if (!ac) return;
    if (ac.state === "suspended") ac.resume();
    if (!unlocked) {
      // iOS: play a silent buffer inside the gesture
      const b = ac.createBuffer(1, 1, 22050), s = ac.createBufferSource();
      s.buffer = b; s.connect(ac.destination); s.start(0);
      unlocked = true;
    }
  }
  const T = () => ac.currentTime;

  function tone(freq, dur, type = "square", vol = 0.2, bus = sfxBus, when = 0, slide = 0, attack = 0.005) {
    if (!ac) return;
    const t = T() + when;
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, freq * slide), t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + attack); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(bus); o.start(t); o.stop(t + dur + 0.05);
  }
  function noise(dur, vol = 0.3, f = 1200, q = 1, type = "bandpass", when = 0, bus = sfxBus, fSlide = 0) {
    if (!ac) return;
    const t = T() + when;
    const s = ac.createBufferSource(); s.buffer = noiseBuf;
    const fl = ac.createBiquadFilter(); fl.type = type; fl.frequency.setValueAtTime(f, t); fl.Q.value = q;
    if (fSlide) fl.frequency.exponentialRampToValueAtTime(Math.max(40, f * fSlide), t + dur);
    const g = ac.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(fl); fl.connect(g); g.connect(bus); s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.05);
  }

  const sounds = {
    click: () => { tone(880, 0.06, "square", 0.08); tone(1320, 0.05, "square", 0.05, sfxBus, 0.04); },
    back: () => tone(520, 0.08, "triangle", 0.1, sfxBus, 0, 0.6),
    beep: () => tone(660, 0.18, "square", 0.16),
    go: () => { tone(1320, 0.5, "square", 0.18); tone(990, 0.5, "square", 0.08); },
    punch: () => { noise(0.08, 0.5, 900, 0.8); tone(140, 0.12, "sine", 0.5, sfxBus, 0, 0.5); },
    kick: () => { noise(0.14, 0.6, 600, 0.7); tone(100, 0.2, "sine", 0.7, sfxBus, 0, 0.4); tone(300, 0.06, "square", 0.08); },
    swing: () => noise(0.12, 0.18, 2200, 2, "bandpass", 0, sfxBus, 0.4),
    throw: () => noise(0.22, 0.25, 600, 3, "bandpass", 0, sfxBus, 4),
    hit: () => { noise(0.18, 0.5, 400, 0.6); tone(220, 0.1, "square", 0.12, sfxBus, 0, 0.5); },
    pickup: () => { [784, 988, 1175, 1568].forEach((f, i) => tone(f, 0.09, "square", 0.08, sfxBus, i * 0.05)); },
    repair: () => { [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, 0.14, "triangle", 0.12, sfxBus, i * 0.06)); },
    pad: () => { tone(300, 0.35, "sawtooth", 0.12, sfxBus, 0, 4); noise(0.35, 0.2, 800, 2, "bandpass", 0, sfxBus, 5); },
    boost: () => noise(0.5, 0.25, 500, 2, "bandpass", 0, sfxBus, 6),
    jump: () => tone(220, 0.25, "triangle", 0.12, sfxBus, 0, 2.2),
    land: () => { noise(0.12, 0.4, 300, 0.7, "lowpass"); tone(80, 0.15, "sine", 0.4, sfxBus, 0, 0.5); },
    crash: () => { noise(0.5, 0.6, 700, 0.4, "lowpass", 0, sfxBus, 0.2); tone(90, 0.3, "sawtooth", 0.2, sfxBus, 0, 0.4); },
    bump: () => noise(0.08, 0.25, 500, 1),
    trick: () => { tone(1047, 0.12, "square", 0.1); tone(1568, 0.2, "square", 0.08, sfxBus, 0.08); },
    whoosh: () => noise(0.3, 0.2, 1500, 2, "bandpass", 0, sfxBus, 0.3),
    wipe: () => { noise(0.8, 0.6, 1200, 0.5, "lowpass", 0, sfxBus, 0.1); tone(400, 0.6, "sawtooth", 0.15, sfxBus, 0, 0.25); },
    finish: () => { [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) => tone(f, i === 6 ? 0.6 : 0.14, "square", 0.12, sfxBus, i * 0.11)); },
    storm: () => noise(1.6, 0.3, 300, 0.5, "lowpass", 0, sfxBus, 3),
    unlock: () => { [659, 784, 988, 1319].forEach((f, i) => tone(f, 0.2, "triangle", 0.14, sfxBus, i * 0.09)); },
  };
  function play(name) { if (!ac || !sfxOn) return; const f = sounds[name]; if (f) f(); }

  /* Engine voice per local human: motor (dirt/atv) or wind + freewheel (bikes) */
  function engineStart(i, vehId) {
    if (!ac) return;
    engineStop(i);
    const g = ac.createGain(); g.gain.value = 0; g.connect(sfxBus);
    const e = { g, vehId, osc: [], wind: null, lp: null };
    const wind = ac.createBufferSource(); wind.buffer = noiseBuf; wind.loop = true;
    const wf = ac.createBiquadFilter(); wf.type = "bandpass"; wf.frequency.value = 600; wf.Q.value = 0.6;
    const wg = ac.createGain(); wg.gain.value = 0;
    wind.connect(wf); wf.connect(wg); wg.connect(g); wind.start();
    e.wind = { src: wind, f: wf, g: wg };
    if (vehId === "dirt" || vehId === "atv") {
      const lp = ac.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 700; lp.Q.value = 4; lp.connect(g);
      const mg = ac.createGain(); mg.gain.value = 0.12; mg.connect(lp);
      for (const det of [0, 7]) { const o = ac.createOscillator(); o.type = "sawtooth"; o.frequency.value = 50; o.detune.value = det * 10; o.connect(mg); o.start(); e.osc.push(o); }
      e.lp = lp; e.mg = mg;
    } else {
      const o = ac.createOscillator(); o.type = "square"; o.frequency.value = 8;
      const tg = ac.createGain(); tg.gain.value = 0;
      const hp = ac.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 3000;
      o.connect(hp); hp.connect(tg); tg.connect(g); o.start();
      e.osc.push(o); e.tick = tg;
    }
    engines[i] = e;
  }
  function engineUpdate(i, speedPct, boosting, air, vol = 1) {
    const e = engines[i];
    if (!e || !ac) return;
    const t = T();
    e.g.gain.setTargetAtTime(sfxOn ? 0.5 * vol : 0, t, 0.1);
    e.wind.g.gain.setTargetAtTime(0.05 + speedPct * speedPct * 0.25, t, 0.1);
    e.wind.f.frequency.setTargetAtTime(400 + speedPct * 900 + (boosting ? 500 : 0), t, 0.1);
    if (e.lp) {
      const f = 45 + speedPct * 110 + (boosting ? 30 : 0) + (air ? 40 : 0);
      e.osc.forEach((o) => o.frequency.setTargetAtTime(f, t, 0.08));
      e.lp.frequency.setTargetAtTime(500 + speedPct * 1400, t, 0.1);
    } else {
      e.osc[0].frequency.setTargetAtTime(6 + speedPct * 22, t, 0.1);
      e.tick.gain.setTargetAtTime(air ? 0.04 : 0.015 + speedPct * 0.02, t, 0.1);
    }
  }
  function engineStop(i) {
    const e = engines[i];
    if (!e) return;
    try { e.osc.forEach((o) => o.stop()); e.wind.src.stop(); } catch (_) {}
    e.g.disconnect();
    engines[i] = null;
  }
  function enginesOff() { for (let i = 0; i < engines.length; i++) engineStop(i); }

  /* ---------- procedural music ---------- */
  const SONGS = [
    { bpm: 150, root: 45, scale: [0, 3, 5, 7, 10], prog: [0, 0, 5, 3], lead: "square", feel: "rock" },     // forest: A minor pentatonic
    { bpm: 138, root: 43, scale: [0, 1, 4, 5, 7, 8, 10], prog: [0, 1, 0, 6], lead: "sawtooth", feel: "desert" }, // G phrygian dominant
    { bpm: 164, root: 47, scale: [0, 2, 3, 5, 7, 8, 10], prog: [0, 5, 3, 6], lead: "square", feel: "dnb" }, // B minor
    { bpm: 142, root: 50, scale: [0, 2, 4, 7, 9], prog: [0, 3, 4, 3], lead: "triangle", feel: "dhol" },    // D major pentatonic, dhol groove
    { bpm: 156, root: 40, scale: [0, 1, 3, 5, 7, 8, 10], prog: [0, 1, 5, 6], lead: "sawtooth", feel: "metal" }, // E phrygian
    { bpm: 128, root: 42, scale: [0, 2, 3, 7, 8], prog: [0, 5, 3, 4], lead: "triangle", feel: "synth" },   // F# minor, dreamy
    { bpm: 120, root: 48, scale: [0, 2, 4, 7, 9], prog: [0, 5, 3, 4], lead: "square", feel: "menu" },
  ];
  const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
  function kick(t, v = 0.9) { const o = ac.createOscillator(), g = ac.createGain(); o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.12); g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.25); o.connect(g); g.connect(musicBus); o.start(t); o.stop(t + 0.3); }
  function snare(t, v = 0.35) { const s = ac.createBufferSource(); s.buffer = noiseBuf; const f = ac.createBiquadFilter(); f.type = "highpass"; f.frequency.value = 1500; const g = ac.createGain(); g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.16); s.connect(f); f.connect(g); g.connect(musicBus); s.start(t, Math.random()); s.stop(t + 0.2); const o = ac.createOscillator(), og = ac.createGain(); o.frequency.value = 190; og.gain.setValueAtTime(v * 0.5, t); og.gain.exponentialRampToValueAtTime(0.001, t + 0.08); o.connect(og); og.connect(musicBus); o.start(t); o.stop(t + 0.1); }
  function hat(t, v = 0.08, open) { const s = ac.createBufferSource(); s.buffer = noiseBuf; const f = ac.createBiquadFilter(); f.type = "highpass"; f.frequency.value = 7000; const g = ac.createGain(); g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.001, t + (open ? 0.18 : 0.04)); s.connect(f); f.connect(g); g.connect(musicBus); s.start(t, Math.random()); s.stop(t + 0.2); }
  function tom(t, f0, v = 0.4) { const o = ac.createOscillator(), g = ac.createGain(); o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f0 * 0.6, t + 0.2); g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.25); o.connect(g); g.connect(musicBus); o.start(t); o.stop(t + 0.3); }
  function note(t, m, dur, type, v, cutoff = 2400) {
    const o = ac.createOscillator(), g = ac.createGain(), f = ac.createBiquadFilter();
    o.type = type; o.frequency.value = mtof(m); f.type = "lowpass"; f.frequency.value = cutoff;
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(f); f.connect(g); g.connect(musicBus); o.start(t); o.stop(t + dur + 0.02);
  }
  function music(idx) {
    init();
    if (!ac) return;
    stopMusic();
    const S = SONGS[idx];
    const step = 60 / S.bpm / 4;
    let n = 0, nextT = T() + 0.08;
    const R = rng(idx * 31 + 5);
    const motif = Array.from({ length: 16 }, () => (R() < 0.55 ? (R() * S.scale.length) | 0 : -1));
    const motif2 = Array.from({ length: 16 }, () => (R() < 0.45 ? (R() * S.scale.length) | 0 : -1));
    const sc = (deg, oct = 0) => S.root + S.scale[((deg % S.scale.length) + S.scale.length) % S.scale.length] + 12 * (oct + Math.floor(deg / S.scale.length));
    seq = setInterval(() => {
      if (!ac || ac.state !== "running") return;
      while (nextT < T() + 0.15) {
        const s16 = n % 16, bar = Math.floor(n / 16), chord = S.prog[bar % 4];
        const sect = Math.floor(bar / 8) % 2; // A/B sections
        const t = nextT;
        // drums
        if (S.feel === "menu") { if (s16 % 8 === 0) kick(t, 0.6); if (s16 % 8 === 4) snare(t, 0.2); if (s16 % 2 === 0) hat(t, 0.04); }
        else if (S.feel === "dnb") { if (s16 === 0 || s16 === 10) kick(t); if (s16 === 4 || s16 === 12) snare(t, 0.4); hat(t, s16 % 2 ? 0.05 : 0.08); }
        else if (S.feel === "dhol") { if ([0, 3, 6, 10].includes(s16)) tom(t, 90, 0.55); if ([2, 8, 11, 14].includes(s16)) tom(t, 260, 0.25); if (s16 === 4 || s16 === 12) snare(t, 0.22); if (s16 % 2 === 0) hat(t, 0.05); }
        else if (S.feel === "metal") { if (s16 % 2 === 0) kick(t, 0.7); if (s16 === 4 || s16 === 12) snare(t, 0.42); if (s16 % 4 === 2) hat(t, 0.08, true); }
        else { if (s16 === 0 || s16 === 8 || (s16 === 11 && sect)) kick(t); if (s16 === 4 || s16 === 12) snare(t); if (s16 % 2 === 0) hat(t, 0.07, s16 === 14); }
        // bass
        const bassPat = S.feel === "metal" ? s16 % 2 === 0 : S.feel === "synth" ? s16 % 4 === 0 : [0, 3, 6, 8, 10, 14].includes(s16);
        if (bassPat) note(t, sc(chord) - 12 + (s16 === 14 ? 12 : 0), step * 1.8, "sawtooth", 0.16, 500);
        // pad on bar start
        if (s16 === 0 && S.feel !== "metal") [0, 2, 4].forEach((d) => note(t, sc(chord + d, 1), step * 15, "triangle", 0.035, 1500));
        // lead motif
        const m = (sect ? motif2 : motif)[s16];
        if (m >= 0 && bar % 8 !== 7) note(t, sc(chord + m, 2), step * (S.feel === "synth" ? 3 : 1.6), S.lead, S.lead === "sawtooth" ? 0.05 : 0.06, 3200);
        if (S.feel === "desert" && s16 % 4 === 0) note(t, sc(chord + 4, 2), step * 0.8, "triangle", 0.04);
        nextT += step; n++;
      }
    }, 30);
  }
  function stopMusic() { if (seq) { clearInterval(seq); seq = null; } }

  function setMusic(on) { musicOn = on; if (musicBus) musicBus.gain.setTargetAtTime(on ? musicVol : 0, T(), 0.05); }
  function setSfx(on) { sfxOn = on; if (sfxBus) sfxBus.gain.setTargetAtTime(on ? sfxVol : 0, T(), 0.05); }
  function suspend() { if (ac && ac.state === "running") ac.suspend(); }
  function resume() { if (ac && ac.state === "suspended") ac.resume(); }
  return { init, unlock, play, music, stopMusic, setMusic, setSfx, suspend, resume, engineStart, engineUpdate, engineStop, enginesOff, get on() { return { musicOn, sfxOn }; } };
})();
