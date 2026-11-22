'use strict';
/* =====================================================================
   EL METRO · núcleo: utilidades, guardado, sonido, música, interfaz
   ===================================================================== */
const EM = window.EM = { version: '3.3.0', errors: [], headless: false, modes: {}, t0: Date.now() };
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const lerp = (a, b, t) => a + (b - a) * t;
const TAU = Math.PI * 2;
const dist = (ax, ay, bx, by) => Math.hypot(bx - ax, by - ay);
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const fmt = n => Math.round(n).toLocaleString('es-CO');
const pad2 = n => String(n).padStart(2, '0');
function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function h2(x, y, s = 0) { let h = Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(s | 0, 2246822519); h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
function hashStr(s) { let h = 2166136261 >>> 0; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
class RNG {
  constructor(seed) { this.seed = seed >>> 0; this.r = mulberry32(this.seed); }
  f() { return this.r(); }
  i(a, b) { return a + Math.floor(this.r() * (b - a + 1)); }
  range(a, b) { return a + this.r() * (b - a); }
  pick(a) { return a[Math.floor(this.r() * a.length)]; }
  shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(this.r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
}
const deep = o => JSON.parse(JSON.stringify(o));
const now = () => performance.now() / 1000;
function clockStr(d = new Date()) { return pad2(d.getHours()) + ':' + pad2(d.getMinutes()); }
/* festivos de Colombia: los fijos, los de la Ley Emiliani (se corren al lunes) y los de Semana Santa según la Pascua (de Juega EnCicla) */
const FESTIVOS = {};
function festivo(d = new Date()) {
  const y = d.getFullYear();
  if (!FESTIVOS[y]) {
    const F = FESTIVOS[y] = {}, D = (m, n) => new Date(y, m - 1, n), mas = (q, n) => new Date(q.getFullYear(), q.getMonth(), q.getDate() + n), lun = q => mas(q, (8 - q.getDay()) % 7), add = (q, n) => { F[q.getMonth() * 100 + q.getDate()] = n; };
    const a = y % 19, b = Math.floor(y / 100), c = y % 100, h = (19 * a + b - Math.floor(b / 4) - Math.floor((b - Math.floor((b + 8) / 25) + 1) / 3) + 15) % 30, l = (32 + 2 * (b % 4) + 2 * Math.floor(c / 4) - h - c % 4) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451), P = D(Math.floor((h + l - 7 * m + 114) / 31), (h + l - 7 * m + 114) % 31 + 1);
    add(D(1, 1), 'Año Nuevo'); add(D(5, 1), 'Día del Trabajo'); add(D(7, 20), 'Día de la Independencia'); add(D(8, 7), 'Batalla de Boyacá'); add(D(12, 8), 'Inmaculada Concepción'); add(D(12, 25), 'Navidad');
    add(lun(D(1, 6)), 'Reyes Magos'); add(lun(D(3, 19)), 'San José'); add(lun(D(6, 29)), 'San Pedro y San Pablo'); add(lun(D(8, 15)), 'La Asunción'); add(lun(D(10, 12)), 'Día de la Raza'); add(lun(D(11, 1)), 'Todos los Santos'); add(lun(D(11, 11)), 'Independencia de Cartagena');
    add(mas(P, -3), 'Jueves Santo'); add(mas(P, -2), 'Viernes Santo'); add(lun(mas(P, 39)), 'Ascensión del Señor'); add(lun(mas(P, 60)), 'Corpus Christi'); add(lun(mas(P, 68)), 'Sagrado Corazón');
  }
  return FESTIVOS[y][d.getMonth() * 100 + d.getDate()] || null;
}
function domingoOFestivo(d = new Date()) { return d.getDay() === 0 || !!festivo(d); }
/* horario del Metro: lunes a sábado de 4:30 a. m. a 11 p. m.; domingos y festivos de 5 a. m. a 10 p. m. */
function serviceOpen(d = new Date()) { const m = d.getHours() * 60 + d.getMinutes(); return domingoOFestivo(d) ? m >= 300 && m < 1320 : m >= 270 && m < 1380; }
function abreTxt(d = new Date()) { const m = d.getHours() * 60 + d.getMinutes(), dia = new Date(d.getFullYear(), d.getMonth(), d.getDate() + (m >= 1320 ? 1 : 0)); return domingoOFestivo(dia) ? '5:00 a. m.' : '4:30 a. m.'; }
/* EnCicla presta de lunes a viernes de 5:30 a. m. a 9 p. m., los sábados de 6:30 a. m. a 7 p. m. y los domingos y festivos de 8 a. m. a 3 p. m. */
function enciclaHorario(d = new Date()) { const m = d.getHours() * 60 + d.getMinutes(), t = domingoOFestivo(d) ? [480, 900, 'de 8 a. m. a 3 p. m.'] : d.getDay() === 6 ? [390, 1140, 'de 6:30 a. m. a 7 p. m.'] : [330, 1260, 'de 5:30 a. m. a 9 p. m.']; return { abierto: m >= t[0] && m < t[1], txt: 'hoy presta ' + t[2] }; }

/* ---------- guardado (localStorage + exportar a archivo) ---------- */
const KEY = 'elmetro.v1';
function newSave() {
  return { v: 1, created: Date.now(), name: 'Aprendiz', wallet: 0, stars: {}, best: {}, story: { ch: 0, seen: {} }, red: { lines: {}, last: Date.now(), pax: 0 }, libre: { x: 0, y: 0, h: 0, veh: null, visited: {}, jobs: 0, km: 0 }, stats: { games: 0, km: 0, pax: 0, wins: 0, crashes: 0 }, facts: {}, log: [], settings: { snd: 1, mus: 1, vib: 1, voz: 1, q: 'auto', tema: 'metro', dalt: 0, ciclo: 'rapido', angulo: 0, ritmo: 0, manejo: 'facil', asist: 1, vistaL: '2d', vehCr: 0, claro: 1, uiTam: 1, arcade: 1 }, perfil: { piel: 1, peinado: 0, colPelo: 0, camisa: 0, pantalon: 0, zapatos: 0, gorro: 0, colGorro: 0, accesorio: 0 }, gente: {}, fragsEncicla: {}, cronicas: {} };
}
const Save = EM.save = {
  d: null,
  load() {
    let d = null;
    try { d = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { d = null; }
    this.d = this.sanitize(d);
    return this.d;
  },
  sanitize(d) {
    const b = newSave();
    if (!d || typeof d !== 'object' || Array.isArray(d) || d.v !== 1) return b;
    d = JSON.parse(JSON.stringify(d), (k, v) => k === '__proto__' || k === 'constructor' || k === 'prototype' ? undefined : v);   // sin claves que cambien prototipos
    if (!d.settings || typeof d.settings !== 'object') d.settings = b.settings; if (!d.stats || typeof d.stats !== 'object') d.stats = b.stats;
    for (const k in b) if (d[k] == null || typeof d[k] !== typeof b[k]) d[k] = b[k];
    for (const k in b.settings) if (typeof d.settings[k] !== typeof b.settings[k]) d.settings[k] = b.settings[k];
    for (const k in b.stats) if (typeof d.stats[k] !== 'number' || !isFinite(d.stats[k])) d.stats[k] = 0;
    if (!isFinite(d.wallet) || d.wallet < 0) d.wallet = 0;
    if (!Array.isArray(d.log)) d.log = []; if (!d.libre || typeof d.libre !== 'object') d.libre = b.libre; if (!d.libre.visited || typeof d.libre.visited !== 'object') d.libre.visited = {};
    return d;
  },
  write() { if (EM.headless) return; try { localStorage.setItem(KEY, JSON.stringify(this.d)); } catch (e) { } },
  stars(mode, lv) { return ((this.d.stars[mode] || {})[lv]) | 0; },
  totalStars(mode) { const o = this.d.stars[mode] || {}; let t = 0; for (const k in o) t += o[k] | 0; return t; },
  record(mode, lv, r) {
    const d = this.d; d.stats.games++; if (r.win) d.stats.wins++;
    const st = d.stars[mode] || (d.stars[mode] = {}); if ((r.stars | 0) > (st[lv] | 0)) st[lv] = r.stars | 0;
    const be = d.best[mode] || (d.best[mode] = {}); if ((r.score | 0) > (be[lv] | 0)) be[lv] = r.score | 0;
    const earn = Math.max(0, Math.round((r.score || 0) / 10) + (r.stars | 0) * 5) * (EM.vida ? EM.vida.bonus() : 1); d.wallet += earn;
    d.log.unshift({ t: Date.now(), m: mode, l: lv, s: r.score | 0, e: r.stars | 0, w: !!r.win }); if (d.log.length > 60) d.log.length = 60;
    this.write(); return earn;
  },
  exportFile() {
    const d = Object.assign({ exportado: new Date().toISOString(), juego: 'El Metro ' + EM.version }, this.d), txt = JSON.stringify(d, null, 1);
    const name = 'el-metro-partidas-' + new Date().toISOString().slice(0, 10) + '.json';
    if (window.AndroidBridge && AndroidBridge.saveFile) { try { AndroidBridge.saveFile(name, 'application/json', txt); return; } catch (e) { } }
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([txt], { type: 'application/json' })); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
    UI.toast('Partidas exportadas: ' + name);
  },
  importFile(file) {
    const fr = new FileReader();
    fr.onload = () => { try { const d = JSON.parse(fr.result); delete d.exportado; delete d.juego; if (d.v !== 1) throw 0; this.d = this.sanitize(d); this.write(); UI.toast('Partidas importadas ✓'); UI.refresh(); } catch (e) { UI.toast('Ese archivo no es de El Metro'); } };
    fr.readAsText(file);
  }
};

/* ---------- vibración ---------- */
function vib(ms) { if (!Save.d || !Save.d.settings.vib) return; try { if (window.AndroidBridge && AndroidBridge.vibrate) AndroidBridge.vibrate(ms | 0); else if (navigator.vibrate) navigator.vibrate(ms); } catch (e) { } }

/* ---------- sonido sintetizado (sin archivos) ---------- */
const Snd = EM.snd = {
  ac: null, master: null, mus: null, sfxG: null,
  init() {
    if (this.ac || EM.headless) return; const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    try { this.ac = new AC(); } catch (e) { return; }
    this.master = this.ac.createGain(); this.master.gain.value = .8; this.master.connect(this.ac.destination);
    this.sfxG = this.ac.createGain(); this.sfxG.connect(this.master); this.mus = this.ac.createGain(); this.mus.gain.value = .32; this.mus.connect(this.master);
    this.apply();
  },
  apply() { if (!this.ac) return; const s = Save.d.settings; this.sfxG.gain.value = s.snd ? 1 : 0; this.mus.gain.value = s.mus ? .32 : 0; },
  resume() { if (this.ac && this.ac.state === 'suspended') this.ac.resume(); },
  tone(f, d, type = 'square', vol = .15, slide = 0, delay = 0, dest) {
    const ac = this.ac; if (!ac) return; const t = ac.currentTime + delay, o = ac.createOscillator(), g = ac.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, f + slide), t + d);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + .01); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(g); g.connect(dest || this.sfxG); o.start(t); o.stop(t + d + .02);
  },
  noise(d, vol = .2, f = 1200, delay = 0, q = 1) {
    const ac = this.ac; if (!ac) return; const t = ac.currentTime + delay, n = Math.floor(ac.sampleRate * d), b = ac.createBuffer(1, n, ac.sampleRate), ch = b.getChannelData(0);
    for (let i = 0; i < n; i++) ch[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const s = ac.createBufferSource(), fl = ac.createBiquadFilter(), g = ac.createGain(); s.buffer = b; fl.type = 'bandpass'; fl.frequency.value = f; fl.Q.value = q; g.gain.value = vol;
    s.connect(fl); fl.connect(g); g.connect(this.sfxG); s.start(t);
  },
  play(k) {
    if (!this.ac) return; this.resume();
    switch (k) {
      case 'tap': this.tone(660, .05, 'square', .06); break;
      case 'switch': this.tone(420, .04, 'square', .09); this.tone(840, .05, 'square', .06, 0, .04); this.noise(.04, .08, 3000, 0, 4); break;
      case 'rot': this.tone(300, .05, 'triangle', .12, 200); break;
      case 'ok': this.tone(523, .08, 'square', .1); this.tone(784, .12, 'square', .1, 0, .07); break;
      case 'bad': this.tone(220, .18, 'sawtooth', .12, -90); break;
      case 'crash': this.noise(.5, .5, 500, 0, .7); this.tone(90, .4, 'sawtooth', .2, -50); break;
      case 'coin': this.tone(988, .06, 'square', .08); this.tone(1319, .14, 'square', .08, 0, .06); break;
      case 'star': [784, 988, 1175, 1568].forEach((f, i) => this.tone(f, .14, 'triangle', .14, 0, i * .09)); break;
      case 'win': [523, 659, 784, 1047, 784, 1047].forEach((f, i) => this.tone(f, .16, 'square', .1, 0, i * .11)); break;
      case 'lose': [392, 330, 262, 196].forEach((f, i) => this.tone(f, .22, 'triangle', .14, 0, i * .16)); break;
      case 'door': this.noise(.7, .12, 900, 0, .8); this.tone(160, .5, 'sine', .05, -40); break;
      case 'bell': this.tone(1046, .25, 'sine', .14); this.tone(784, .4, 'sine', .14, 0, .28); break;   // timbre de cierre de puertas
      case 'horn': this.tone(311, .45, 'sawtooth', .11); this.tone(370, .45, 'sawtooth', .09); break;
      case 'beep': this.tone(1400, .07, 'square', .07); break;
      case 'warn': this.tone(880, .1, 'square', .1); this.tone(660, .1, 'square', .1, 0, .12); break;
      case 'whoosh': this.noise(.35, .15, 700, 0, .5); break;
      case 'brake': this.noise(.3, .07, 2400, 0, 6); break;
    }
  },
  /* anuncio por voz (voces del sistema; funcionan sin internet en la mayoría de celulares) */
  say(txt) {
    if (EM.headless || !Save.d.settings.voz || !window.speechSynthesis) return;
    try { const u = new SpeechSynthesisUtterance(txt); u.lang = 'es-CO'; const v = speechSynthesis.getVoices().find(v => /^es/i.test(v.lang)); if (v) u.voice = v; u.rate = 1; u.pitch = 1.05; speechSynthesis.cancel(); speechSynthesis.speak(u); } catch (e) { }
  }
};

/* ---------- música generativa (secuenciador con anticipación) ---------- */
const Music = EM.music = {
  on: null, step: 0, next: 0, timer: null,
  SONGS: {
    // tempo, escala (semitonos), progresión (grados), patrón de bajo, densidad de melodía, timbre
    menu: { bpm: 96, root: 57, sc: [0, 2, 4, 5, 7, 9, 11], prog: [0, 5, 3, 4], bass: [1, 0, 0, 1, 0, 1, 0, 0], mel: .45, w: 'triangle' },      // tango-pop suave (Gardel murió en Medellín)
    conduce: { bpm: 112, root: 52, sc: [0, 2, 3, 5, 7, 8, 10], prog: [0, 6, 5, 6], bass: [1, 0, 1, 0, 1, 0, 1, 1], mel: .3, w: 'square' },
    puzzle: { bpm: 104, root: 60, sc: [0, 2, 4, 7, 9], prog: [0, 3, 1, 4], bass: [1, 0, 0, 0, 1, 0, 1, 0], mel: .5, w: 'triangle' },
    tension: { bpm: 132, root: 50, sc: [0, 1, 3, 5, 7, 8, 10], prog: [0, 0, 5, 6], bass: [1, 1, 0, 1, 1, 0, 1, 0], mel: .35, w: 'sawtooth' },
    story: { bpm: 72, root: 55, sc: [0, 2, 4, 5, 7, 9, 11], prog: [0, 4, 5, 3], bass: [1, 0, 0, 0, 0, 0, 1, 0], mel: .55, w: 'sine' }
  },
  play(k) {
    if (EM.headless || !Snd.ac) { this.on = k; return; }
    if (this.on === k && this.timer) return; this.stop(); this.on = k; const S = this.SONGS[k]; if (!S) return;
    this.step = 0; this.next = Snd.ac.currentTime + .1; this.rng = new RNG(hashStr(k) + 7);
    this.timer = setInterval(() => this.sched(S), 60);
  },
  stop() { if (this.timer) clearInterval(this.timer); this.timer = null; },
  sched(S) {
    const ac = Snd.ac; if (!ac) return; const dt = 60 / S.bpm / 2;
    while (this.next < ac.currentTime + .25) {
      const st = this.step, bar = Math.floor(st / 8) % S.prog.length, deg = S.prog[bar], sc = S.sc, t = this.next - ac.currentTime;
      const note = (d, oct) => S.root + sc[((d % sc.length) + sc.length) % sc.length] + 12 * (oct + Math.floor(d / sc.length));
      const hz = m => 440 * Math.pow(2, (m - 69) / 12);
      if (S.bass[st % 8]) Snd.tone(hz(note(deg, -1)), dt * 1.6, 'triangle', .16, 0, t, Snd.mus);
      if (st % 8 === 0) [0, 2, 4].forEach(k => Snd.tone(hz(note(deg + k, 0)), dt * 7, 'sine', .035, 0, t, Snd.mus));
      if (this.rng.f() < S.mel && st % 2 === 0) Snd.tone(hz(note(deg + this.rng.i(0, 6), 1)), dt * 1.4, S.w, .045, 0, t, Snd.mus);
      if (st % 4 === 2) Snd.noise(.05, .05, 6000, t, 3);
      this.step++; this.next += dt;
    }
  }
};

/* ---------- interfaz: pantallas, avisos, modales ---------- */
const UI = EM.ui = {
  cur: null, stack: [],
  show(id, push = true) {
    if (this.cur === id) return; if (push && this.cur) this.stack.push(this.cur);
    $$('.scr').forEach(s => s.classList.toggle('on', s.id === id)); const prev = this.cur; this.cur = id;
    if (this.onshow[id]) this.onshow[id](prev);
  },
  back() {
    if (!$('#modal').hidden) { this.close(); return true; }
    if (this.onback[this.cur] && this.onback[this.cur]() === true) return true;
    const p = this.stack.pop(); if (!p) return false; this.show(p, false); return true;
  },
  onshow: {}, onback: {},
  toast(m) { if (EM.headless) return; const d = document.createElement('div'); d.textContent = m; $('#toast').appendChild(d); setTimeout(() => d.remove(), 3000); },
  modal(html, onClose) { if (EM.headless) return; $('#mBody').innerHTML = html; $('#modal').hidden = false; this._onClose = onClose || null; const f = $('#mBody button'); if (f) setTimeout(() => f.focus(), 30); },
  close() { $('#modal').hidden = true; $('#mBody').innerHTML = ''; const f = this._onClose; this._onClose = null; if (f) f(); },
  refresh() { if (this.onshow[this.cur]) this.onshow[this.cur](this.cur); },
  gmsg(t, cls = '') { if (EM.headless) return; const d = document.createElement('div'); d.className = 'gm ' + cls; d.textContent = t; const g = $('#gmsg'); g.appendChild(d); while (g.children.length > 3) g.firstChild.remove(); setTimeout(() => d.remove(), 2700); }
};
EM.back = () => UI.back();

/* ---------- errores capturados (los lee el bot) ---------- */
window.addEventListener('error', e => { EM.errors.push(String(e.message || e) + (e.filename ? ' @' + e.lineno : '')); });
window.addEventListener('unhandledrejection', e => { EM.errors.push('promesa: ' + String(e.reason && e.reason.message || e.reason)); });

/* ---------- lienzo con alta densidad ---------- */
function fitCanvas(cv, maxDpr = 2) {
  const r = cv.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, maxDpr), w = Math.max(1, Math.round(r.width * dpr)), h = Math.max(1, Math.round(r.height * dpr));
  if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
  return { w, h, dpr };
}
function mkCanvas(w, h) { if (typeof OffscreenCanvas !== 'undefined' && EM.headless) return new OffscreenCanvas(w, h); const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
