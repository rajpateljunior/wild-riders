"use strict";
/* Core helpers shared by every module. */
const TAU = Math.PI * 2;
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const lerp = (a, b, t) => a + (b - a) * t;
const sign = (v) => (v < 0 ? -1 : v > 0 ? 1 : 0);
const rnd = (a = 1, b) => (b === undefined ? Math.random() * a : a + Math.random() * (b - a));
const pick = (arr) => arr[(Math.random() * arr.length) | 0];
const easeOut = (t) => 1 - (1 - t) * (1 - t);
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

// Seeded RNG (mulberry32) so tracks are identical on every device (needed for online play).
function rng(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeCanvas(w, h) {
  const c = document.createElement("canvas");
  c.width = Math.max(1, Math.round(w));
  c.height = Math.max(1, Math.round(h));
  return c;
}

// Rasterize an SVG string into a canvas (async). Data-URL SVG images draw fine on iOS Safari.
function svgToCanvas(svg, w, h) {
  return new Promise((resolve) => {
    const img = new Image();
    const c = makeCanvas(w, h);
    img.onload = () => {
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      resolve(c);
    };
    img.onerror = () => resolve(c);
    img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  });
}

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function mix(h1, h2, t) {
  const a = hexToRgb(h1), b = hexToRgb(h2);
  const r = a.map((v, i) => Math.round(lerp(v, b[i], t)));
  return "#" + r.map((v) => v.toString(16).padStart(2, "0")).join("");
}
function shade(hex, amt) { return amt < 0 ? mix(hex, "#000000", -amt) : mix(hex, "#ffffff", amt); }
function rgba(hex, a) { const [r, g, b] = hexToRgb(hex); return `rgba(${r},${g},${b},${a})`; }

const IS_TOUCH = "ontouchstart" in window || navigator.maxTouchPoints > 0;
const now = () => performance.now() / 1000;
