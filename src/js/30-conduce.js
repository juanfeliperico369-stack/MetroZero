/* =====================================================================
   MODO CONDUCE: maneja el tren, el tranvía o el bus por la vía real.
   Vistas: cabina (1a persona), persecución (3a persona), cenital y panorámica.
   Física: a = palanca·a_max − pendiente·g − resistencia. ATP: curvas y frenado a la estación.
   Puntaje por parada: precisión (m) + puntualidad (s); al final: confort y energía.
   ===================================================================== */
const SEG = 8, DRAW_D = 900;
const TRACKS = new Map();
function trackOf(line) {
  if (TRACKS.has(line.id)) return TRACKS.get(line.id);
  const P = line.P, K = line.K, n = Math.max(2, Math.ceil(P.len / SEG) + 1), x = new Float32Array(n), y = new Float32Array(n), an = new Float32Array(n), zt = new Float32Array(n), z = new Float32Array(n), lim = new Float32Array(n), gb = new Uint8Array(n * 6);
  for (let i = 0; i < n; i++) { const p = NET.at(P, i * SEG); x[i] = p.x; y[i] = p.y; an[i] = p.a; zt[i] = MAP.ready ? MAP.elevM(p.x, p.y) : 1480; }
  const W = K.deck ? 25 : 3;   // viaducto: perfil suave; calle: sigue el terreno
  for (let i = 0; i < n; i++) { let s = 0, c = 0; for (let j = Math.max(0, i - W); j <= Math.min(n - 1, i + W); j++) { s += zt[j]; c++; } z[i] = s / c + K.deck; }
  for (let i = 0; i < n; i++) {
    let da = 0; const j0 = Math.max(0, i - 5), j1 = Math.min(n - 1, i + 5); for (let j = j0; j < j1; j++) { let d = an[j + 1] - an[j]; if (d > Math.PI) d -= TAU; if (d < -Math.PI) d += TAU; da += Math.abs(d); }
    const R = da > 1e-4 ? ((j1 - j0) * SEG) / da : 1e5; lim[i] = Math.min(K.vmax, Math.floor(Math.sqrt(1.1 * R) * 3.6 / 5) * 5 / 3.6);
    if (lim[i] < 15 / 3.6) lim[i] = 15 / 3.6;
    const OFF = [-46, -26, -12, 12, 26, 46]; for (let k = 0; k < 6; k++) { const o = OFF[k], sx = x[i] - Math.sin(an[i]) * o, sy = y[i] + Math.cos(an[i]) * o; gb[i * 6 + k] = MAP.ready ? MAP.tileM(sx, sy) : 0; }
  }
  // paisaje: edificios y árboles reales a los lados (según el mapa)
  const sc = [];
  for (let s = 0; s < P.len; s += 16) {
    const i = Math.min(n - 1, Math.round(s / SEG));
    for (const side of [-1, 1]) for (const o0 of [16, 30, 46, 64]) {
      const o = side * (o0 + h2(s | 0, o0, 3) * 6), px = x[i] - Math.sin(an[i]) * o, py = y[i] + Math.cos(an[i]) * o, v = MAP.ready ? MAP.tileM(px, py) : TT.BRICK, r = h2(s | 0, o | 0, 11);
      if ((v === TT.BLDG || v === TT.BRICK) && r < .6) sc.push({ s, o, w: 9 + r * 10, h: MAP.ready ? MAP.bHeight(px, py, s | 0) : 10, b: v === TT.BRICK, seed: (s * 7 + o) | 0, k: 0, zg: zt[i] });
      else if ((v === TT.GRASS || v === TT.MOUNT) && r < .35) sc.push({ s, o, w: 5, h: 7 + r * 8, k: 1, zg: zt[i] });
    }
  }
  const T = { n, x, y, an, zt, z, lim, gb, sc, len: P.len };
  TRACKS.set(line.id, T); return T;
}
const Conduce = EM.modes.conduce = {
  id: 'conduce', name: 'Metro', sub: 'Metro y tranvía · vista panorámica y cabina', music: 'conduce', fullCanvas: true, camara: {}, tip: 'Palanca arriba: tracción; abajo: freno. Detén el frente del tren en la marca del andén, abre las puertas, espera el timbre y cierra. ↔ panorámica · 1ª cabina.',
  _lv: null,
  levels() {
    if (this._lv) return this._lv; const L = [];
    for (const line of NET.lines.filter(l => ['metro', 'tram'].includes(l.kind) || (l.kind === 'future' && !/cable/i.test(l.name + ' ' + (l.tech || ''))))) {
      const n = line.st.length; let k = 0;
      for (let a = 0; a < n - 1; a += 2) { const b = Math.min(n - 1, a + 2); L.push({ id: line.id + ':' + a + '-' + b, line: line.id, a, b, name: line.st[a].name + ' → ' + line.st[b].name, sub: line.name + (line.kind === 'future' ? ' · vista al futuro (' + line.status + ')' : ''), k: k++ }); }
      if (n > 3) L.push({ id: line.id + ':0-' + (n - 1), line: line.id, a: 0, b: n - 1, name: 'Recorrido completo', sub: line.name + ' · ' + line.st[0].name + ' → ' + line.st[n - 1].name, k: k++, full: true });
      const r = line.st; if (n > 2) L.push({ id: line.id + ':r' + (n - 1) + '-' + Math.max(0, n - 3), line: line.id, a: n - 1, b: Math.max(0, n - 3), name: r[n - 1].name + ' → ' + r[Math.max(0, n - 3)].name, sub: line.name + ' · sentido contrario', k: k++ });
    }
    return (this._lv = L);
  },
  create(lv, opts) {
    const L = this.levels().find(l => l.id === lv) || this.levels()[0], line = NET.byId[L.line], kd = line.kind === 'future' ? 'tram' : line.kind, K = KIND[kd], T = trackOf(line), rng = new RNG(opts.seed | 0);
    const dir = L.b > L.a ? 1 : -1, stops = []; for (let i = L.a; dir > 0 ? i <= L.b : i >= L.b; i += dir) stops.push(i);
    const tgt = i => clamp(line.st[i].s + dir * K.plat / 2, 1, T.len - 1);
    const hr = opts.hour != null ? opts.hour : new Date().getHours() + new Date().getMinutes() / 60, tod = opts.tod || (hr >= 6 && hr < 17 ? 'dia' : hr >= 17 && hr < 19 ? 'tarde' : 'noche');
    const st = { lvId: L.id, line: line.id, kind: kd, dir, stops, ni: 1, s: tgt(stops[0]), s0: tgt(stops[0]), v: 0, a: 0, lev: 0, eb: 0, ph: 'ready', t: 0, dwell: 0, doors: 0, board: 0, pax: 40 + rng.i(0, 60), score: 0, comfort: 100, energy: 0, ff: false, view: opts.view || (Save.d.settings.vistaMetro || 'lado'),
      rain: opts.hour != null ? rng.f() < .25 : Mundo.weather().rain, tod, hour: hr, fixH: opts.hour, paseo: !!opts.paseo, fest: EM.vida && EM.vida.has('alumbrados') ? 'alumbrados' : EM.vida && EM.vida.has('feria') ? 'feria' : '', arr: [], sched: [], over: 0, skipped: 0, sig: [], lights: [], trivia: null, msg: [], done: false, perf: [], seed: opts.seed | 0, cam: 0, keys: {}, holdDoor: -1, auto: !!opts.auto, lastA: 0, jerkT: 0, wait: 0 };
    st.tgt = stops.map(tgt);
    // eventos: señal en rojo (tren adelante), puertas retenidas, trivia en una parada
    for (let k = 1; k < stops.length; k++) { if (rng.f() < .35) { const a = st.tgt[k - 1], b = st.tgt[k]; st.sig.push({ s: lerp(a, b, rng.range(.35, .65)), k, on: false, t: rng.range(6, 12), seen: false, done: false }); } }
    if (stops.length > 2 && rng.f() < .5) st.holdDoor = rng.i(1, stops.length - 2);
    st.trivK = rng.i(1, Math.max(1, stops.length - 1));
    if (K.deck === 0 && line.kind !== 'cable') { // semáforos en la calle (tranvía y buses)
      const a = Math.min(st.tgt[0], st.tgt[stops.length - 1]), b = Math.max(st.tgt[0], st.tgt[stops.length - 1]);
      for (let s = a + 160; s < b - 60; s += rng.range(260, 480)) { if (st.tgt.some(t => Math.abs(t - s) < 90)) continue; st.lights.push({ s, off: rng.range(0, 30), per: 30, g: 15 }); }
    }
    // horario ideal (simulado con el piloto automático) + 8 % de margen
    const sim = this.simulate(line, st); let acc = 0; st.sched = [0]; for (let k = 1; k < stops.length; k++) { acc += sim[k - 1] * 1.08 + (k > 1 ? K.dwell : 0); st.sched.push(acc); }
    st.ideal = sim;
    return st;
  },
  /* tiempo ideal de cada tramo con el piloto (sin eventos) */
  simulate(line, st0) {
    const res = []; for (let k = 1; k < st0.stops.length; k++) {
      const st = { kind: st0.kind, line: st0.line, dir: st0.dir, s: st0.tgt[k - 1], v: 0, a: 0, lev: 0, eb: 0, tgt: st0.tgt, ni: k, sig: [], lights: [], rain: false, t: 0 };
      let t = 0; for (let i = 0; i < 20000; i++) { const a = this.pilot(st); st.lev = a; this.physics(st, .1); t += .1; if ((st.tgt[k] - st.s) * st.dir < .5 && st.v < .05) break; }
      res.push(t);
    }
    return res;
  },
  /* límite de velocidad en s (curvas) */
  limAt(st, s) { const T = TRACKS.get(st.line); return T.lim[clamp(Math.round(s / SEG), 0, T.n - 1)]; },
  zAt(st, s) { const T = TRACKS.get(st.line), f = clamp(s / SEG, 0, T.n - 1.001), i = f | 0, k = f - i; return T.z[i] * (1 - k) + T.z[i + 1] * k; },
  lightState(L, t) { const p = ((t + L.off) % L.per + L.per) % L.per; return p < L.g ? 'g' : p < L.g + 3 ? 'y' : 'r'; },
  /* distancia (sentido de marcha) al próximo punto de detención obligatorio */
  nextStop(st) {
    let d = (st.tgt[st.ni] - st.s) * st.dir, why = 'est';
    for (const g of st.sig) if (g.on && !g.done) { const dd = (g.s - st.s) * st.dir - 6; if (dd > -2 && dd < d) { d = dd; why = 'sig'; } }
    for (const L of st.lights) { const dd = (L.s - st.s) * st.dir - 4; if (dd > -1 && dd < d && this.lightState(L, st.t) !== 'g' && dd > st.v * st.v / (2 * 1.2) * .5) { d = dd; why = 'luz'; } }
    return { d, why };
  },
  pilot(st) {
    const K = KIND[st.kind], ns = this.nextStop(st), brk = K.brk * (st.rain ? .82 : 1) * .82;
    let target = Math.min(this.limAt(st, st.s), this.limAt(st, st.s + st.dir * 60), Math.sqrt(2 * brk * Math.max(0, ns.d)));
    if (ns.d < 30) { if (ns.d <= .15) return -1; const bm = K.brk * (st.rain ? .82 : 1), need = st.v * st.v / (2 * ns.d); if (need > bm * .45) return -clamp(need / bm, 0, 1); if (st.v < Math.min(3, Math.sqrt(ns.d) * 1.1)) return .3; return 0; }
    const e = target - st.v; return e > .8 ? clamp(e / 2, .3, 1) : e < -.3 ? clamp(e / 2, -1, -.15) : 0;
  },
  physics(st, dt) {
    const K = KIND[st.kind], T = TRACKS.get(st.line), i = clamp(Math.round(st.s / SEG), 0, T.n - 2), gr = clamp((T.z[i + 1] - T.z[i]) / SEG * st.dir, -.12, .12) * (st.kind === 'metro' ? .8 : .35);
    let a;
    if (st.eb > 0) { a = -K.emg; st.eb = st.v > .05 ? st.eb : 0; }
    else if (st.lev > 0) a = st.lev * K.acc * (1 - .35 * st.v / K.vmax);
    else a = st.lev * K.brk * (st.rain ? .82 : 1);
    if (st.v > .01 || a > 0) a += -9.81 * gr - .015 - .0003 * st.v * st.v;
    if (st.v <= .01 && a < 0) a = 0;
    st.v = Math.max(0, st.v + a * dt); st.s += st.dir * st.v * dt; st.s = clamp(st.s, 0, T.len); st.a = a;
    if (st.lev > 0) st.energy += st.lev * K.acc * st.v * dt / 3600 * 120;      // kWh aproximados
    else if (st.lev < 0) st.energy -= -st.lev * K.brk * st.v * dt / 3600 * 120 * .3;  // freno regenerativo
  },
  step(st, dt) {
    if (st.done) return;
    const K = KIND[st.kind], line = NET.byId[st.line], sub = st.ff && st.ph === 'run' ? 3 : st.ph === 'dwell' && st.doors === 1 ? 2 : 1;
    for (let k = 0; k < sub; k++) this.tick(st, dt, K, line);
    st.cam += (st.v - st.cam) * Math.min(1, dt * 3);
  },
  tick(st, dt, K, line) {
    st.t += dt; if (st.fixH == null && (st._wt = (st._wt || 0) + dt) > 2) { st._wt = 0; const h = Mundo.hour(), w = Mundo.weather(h); st.rain = w.rain; st.tod = h >= 6 && h < 17 ? 'dia' : h >= 17 && h < 19 ? 'tarde' : 'noche'; }
    if (st.auto) { if (st.ph === 'run' || st.ph === 'ready') st.lev = this.pilot(st); }
    else if (st.keys.up || st.keys.down) st.lev = clamp(st.lev + (st.keys.up ? 1 : -1) * dt * 1.2, -1, 1);
    if (st.ph === 'ready') { if (st.lev > .05) { st.ph = 'run'; st.ni = 1; this.say(st, 'Próxima estación: ' + line.st[st.stops[1]].name); } else return; }
    if (st.ph === 'dwell') {
      st.v = 0; st.dwell += dt;
      if (st.doors === 1) { st.board = Math.min(1, st.board + dt / st.bTime); if (st.board >= 1 && !st.bellDone) { st.bellDone = true; Snd.play('bell'); this.msg(st, 'Abordaje completo · cierra puertas', 'y'); } }
      if (st.auto) { if (st.doors === 0 && st.dwell > .5 && !st.opened) this.doors(st); else if (st.doors === 1 && st.board >= 1) this.doors(st); else if (st.doors === 2 && st.dwell > .3) { st.lev = .6; } if (st.trivia) this.answer(st, 0); }
      if (st.doors === 2 && st.lev > .05) { st.ph = 'run'; st.doors = 0; st.opened = false; st.bellDone = false; st.board = 0; if (st.ni < st.stops.length) this.say(st, 'Próxima estación: ' + line.st[st.stops[st.ni]].name); }
      return;
    }
    // señales en rojo: aparecen al acercarse y se despejan con el tiempo
    for (const g of st.sig) if (!g.done && g.k === st.ni) { const dd = (g.s - st.s) * st.dir; if (!g.seen && dd < 700) { g.seen = true; g.on = true; this.msg(st, 'Señal en rojo adelante: tren en la vía', 'r'); Snd.play('warn'); } if (g.on) { if (st.v < .3 || dd > 0) g.t -= dt; if (g.t <= 0) { g.on = false; g.done = true; this.msg(st, 'Vía libre: señal en verde', 'g'); } if (dd < -1 && g.on) { g.on = false; g.done = true; st.eb = 1; st.score -= 300; this.msg(st, '¡Pasaste una señal en rojo! Freno de emergencia', 'r'); Snd.play('crash'); vib(200); } } }
    for (const L of st.lights) { const prev = (L.s - (st.s - st.dir * st.v * dt)) * st.dir, dd = (L.s - st.s) * st.dir; if (prev > 0 && dd <= 0 && this.lightState(L, st.t) === 'r') { st.score -= 150; this.msg(st, '¡Semáforo en rojo! −150', 'r'); Snd.play('bad'); } }
    const lim = this.limAt(st, st.s), ns = this.nextStop(st), atp = Math.sqrt(2 * K.brk * .95 * Math.max(0, (st.tgt[st.ni] - st.s) * st.dir + 3));
    const vmaxNow = Math.min(lim, atp + 1.2);
    if (st.v > vmaxNow + 2 / 3.6) { st.over += dt; if (!st._warn) { st._warn = 1; Snd.play('warn'); this.msg(st, 'ATP: exceso de velocidad', 'y'); } st.score -= 12 * dt; if (st.v > vmaxNow + 9 / 3.6 && !st.eb) { st.eb = 1; st.score -= 200; this.msg(st, 'ATP: freno de emergencia −200', 'r'); Snd.play('crash'); vib(160); } } else st._warn = 0;
    this.physics(st, dt);
    const j = Math.abs(st.a - st.lastA) / dt; st.lastA = st.a; if (j > 3.2 && st.v > 1) { st.jerkT += dt; st.comfort = Math.max(0, st.comfort - dt * 18); }
    // llegada a la estación
    const d = (st.tgt[st.ni] - st.s) * st.dir;
    if (st.v < .05 && st.eb === 0 && Math.abs(d) <= 12 && st.lev <= 0) {
      st.ph = 'dwell'; st.dwell = 0; st.doors = 0; st.err = Math.abs(d);
      const late = st.t - st.sched[st.ni], pP = d === 0 ? 300 : st.err < .5 ? 300 : st.err < 1 ? 250 : st.err < 2 ? 200 : st.err < 4 ? 120 : st.err < 7 ? 60 : 20, pT = Math.abs(late) <= 6 ? 200 : Math.abs(late) <= 15 ? 120 : Math.abs(late) <= 30 ? 60 : 0;
      st.score += pP + pT; st.arr.push({ err: st.err, late, pP, pT }); Snd.play(pP >= 250 ? 'star' : 'ok');
      this.msg(st, (st.err < .5 ? '¡Perfecto! ' : st.err < 2 ? '¡Muy bien! ' : '') + st.err.toFixed(1) + ' m · ' + (late >= 0 ? '+' : '') + Math.round(late) + ' s', pP >= 200 ? 'g' : 'y');
      if (st.ni === st.trivK && !st.auto) { const q = NET.trivia(new RNG(st.seed + st.ni)); if (q) { const o = q.a.map((t, i) => ({ t, ok: i === 0 })); new RNG(st.seed * 3 + st.ni).shuffle(o); st.trivia = { q: q.q, o, x: q.x }; } }
      return;
    }
    if (d < -12 && st.v < .3) { // se pasó: la parada se pierde
      st.skipped++; st.score -= 200; this.msg(st, 'Te pasaste de la estación −200', 'r'); Snd.play('bad'); st.arr.push({ err: 99, late: 0, pP: 0, pT: 0 });
      if (st.ni < st.stops.length - 1) st.ni++; else this.finish(st);
    }
    if (st.s <= 0 || st.s >= TRACKS.get(st.line).len) this.finish(st);
  },
  doors(st) {
    if (st.ph !== 'dwell') return;
    if (st.doors === 0) {
      st.doors = 1; st.opened = true; Snd.play('door'); vib(20); const line = NET.byId[st.line], name = line.st[st.stops[st.ni]].name;
      const alight = Math.round(st.pax * (st.ni === st.stops.length - 1 ? 1 : .3)), board = st.ni === st.stops.length - 1 ? 0 : 15 + (hashStr(name) % 40);
      st.pax = st.pax - alight + board; st.bTime = 5 + (alight + board) / 10; st.board = 0; EM.save.d.stats.pax += board;
      if (st.ni === st.stops.length - 1) { st.bTime = 3; }
      const f = NET.fact(name); if (f) { this.msg(st, name + ': ' + f, 'b'); EM.save.d.facts[name] = 1; }
    } else if (st.doors === 1) {
      if (st.ni === st.holdDoor && !st.held) { st.held = true; Snd.play('warn'); this.msg(st, '“Por favor, libere las puertas” · inténtalo de nuevo', 'y'); st.board = Math.max(0, st.board - .3); st.bellDone = false; return; }
      if (st.board < 1) { st.score -= 50; this.msg(st, 'Cerraste antes de tiempo −50', 'r'); }
      st.doors = 2; Snd.play('door');
      if (st.ni === st.stops.length - 1) { this.finish(st); return; }
      st.ni++;
    }
  },
  answer(st, i) { const q = st.trivia; if (!q) return; st.trivia = null; const ok = q.o[i] && q.o[i].ok; if (ok) { st.score += 100; Snd.play('coin'); this.msg(st, '¡Correcto! +100 · ' + (q.x || ''), 'g'); } else { Snd.play('bad'); this.msg(st, 'Era: ' + q.o.find(o => o.ok).t, 'y'); } if (!EM.headless) this.renderTrivia(st); },
  finish(st) {
    if (st.done) return; st.done = true; st.ph = 'end';
    st.score += Math.round(st.comfort * 2); const kwh = Math.max(0, st.energy), eff = clamp(1 - kwh / (st.stops.length * 8), 0, 1); st.score += Math.round(eff * 100);
    st.score = Math.max(0, Math.round(st.score)); EM.save.d.stats.km += Math.abs(st.s - st.s0) / 1000;
  },
  result(st) {
    const n = st.stops.length - 1, max = n * 500 + 300, frac = st.score / max, line = NET.byId[st.line];
    const errs = st.arr.filter(a => a.err < 99), avg = errs.length ? errs.reduce((a, b) => a + b.err, 0) / errs.length : 0;
    return { done: st.done, win: st.done && st.skipped === 0, score: st.score, stars: st.done && st.skipped === 0 ? starsOf(frac) : 0, fact: line && (line.facts || [])[st.seed % Math.max(1, (line.facts || []).length)],
      lines: [['Paradas', (n - st.skipped) + ' / ' + n], ['Precisión media', avg.toFixed(1) + ' m'], ['Confort (tinto)', Math.round(st.comfort) + ' %'], ['Energía', Math.max(0, st.energy).toFixed(1) + ' kWh']] };
  },
  msg(st, t, c) { if (!EM.headless && Game.st === st) UI.gmsg(t, c); },
  say(st, t) { if (!st.auto && Game.st === st) Snd.say(t); },
  hud(st) {
    const line = NET.byId[st.line], nx = line.st[st.stops[Math.min(st.ni, st.stops.length - 1)]], d = (st.tgt[st.ni] - st.s) * st.dir, late = st.t - st.sched[Math.min(st.ni, st.sched.length - 1)];
    this.updCtl(st);
    return [['', Math.round(st.v * 3.6) + ' km/h'], ['→', nx.name], ['', st.ph === 'dwell' ? 'Andén' : Math.max(0, d) < 1000 ? Math.round(Math.max(0, d)) + ' m' : (d / 1000).toFixed(1) + ' km'], ['★', fmt(st.score)]];
  },
  /* ---------- controles (palanca, puertas, vistas) ---------- */
  mount(st, el) {
    el.innerHTML = `<div class="lever" id="cLev"><div class="lb" style="top:6px">TRACCIÓN</div><div class="lb" style="bottom:6px">FRENO</div><div class="kn" id="cKn">0</div></div>
      <div class="gbtns"><button class="btn sm mos" id="cDoor">⇆ Puertas</button><button class="btn sm" id="cFF">⏩ Crucero</button><button class="btn sm" id="cHorn">📯 Pito</button></div>
      <div class="vsel" id="cView"><button data-v="lado">↔</button><button data-v="cab">1ª</button><button data-v="tps">3ª</button><button data-v="cine">🎥</button><button data-v="top">▦</button><button data-v="pan">◎</button><button data-v="paseo">🎬</button></div><div id="cTriv"></div>`;
    const lev = $('#cLev'), kn = $('#cKn'), set = e => { const r = lev.getBoundingClientRect(), f = clamp((e.clientY - r.top) / r.height, 0, 1); let v = f < .42 ? (1 - f / .42) : f > .5 ? -((f - .5) / .5) : 0; st.lev = Math.round(v * 10) / 10; Snd.init(); };
    lev.addEventListener('pointerdown', e => { lev.setPointerCapture(e.pointerId); set(e); });
    lev.addEventListener('pointermove', e => { if (e.buttons || e.pointerType === 'touch') set(e); });
    $('#cDoor').onclick = () => this.doors(st); $('#cHorn').onclick = () => { Snd.play('horn'); vib(30); };
    $('#cFF').onclick = () => { st.ff = !st.ff; this.updCtl(st); };
    $$('#cView button').forEach(b => b.onclick = () => { if (b.dataset.v !== 'paseo') { Save.d.settings.vistaMetro = b.dataset.v; Save.write(); } if (b.dataset.v === 'paseo') { st.paseo = !st.paseo; st.auto = st.paseo; this.msg(st, st.paseo ? 'Modo paseo: el piloto maneja, tú disfrutas la vista' : 'Vuelves a manejar tú', 'b'); } else st.view = b.dataset.v; this.updCtl(st); });
    this.updCtl(st); this._kn = kn;
  },
  updCtl(st) {
    if (EM.headless || Game.st !== st) return; const kn = $('#cKn'), lev = $('#cLev'); if (!kn) return;
    const f = st.lev > 0 ? .42 * (1 - st.lev) : st.lev < 0 ? .5 + .5 * -st.lev : .46; kn.style.top = 'calc(' + (f * 100) + '% - 15px)'; kn.textContent = st.eb ? 'EMG' : st.lev > 0 ? 'T' + Math.round(st.lev * 10) : st.lev < 0 ? 'F' + Math.round(-st.lev * 10) : 'N';
    const d = $('#cDoor'); d.disabled = st.ph !== 'dwell'; d.textContent = st.doors === 1 ? (st.board >= 1 ? '🔔 Cerrar' : '⇆ Cerrar') : '⇆ Abrir';
    const ff = $('#cFF'), near = (st.tgt[st.ni] - st.s) * st.dir < 500; if (near && st.ff) st.ff = false; ff.disabled = near || st.ph !== 'run'; ff.style.background = st.ff ? 'var(--mante)' : '';
    $$('#cView button').forEach(b => b.classList.toggle('on', b.dataset.v === st.view || (b.dataset.v === 'paseo' && st.paseo)));
    if (st.paseo && (st._pv = (st._pv || 0) + .2) > 8) { st._pv = 0; const V = this.gl(Object.assign({}, st, { view: 'cab' })) ? ['cine', 'tps', 'cab', 'lado', 'cine', 'pan'] : ['lado', 'cab', 'top', 'pan']; st.view = V[(V.indexOf(st.view) + 1) % V.length]; }
    if (st.ph === 'ready' && !st._rt) { st._rt = 1; this.msg(st, 'Sube la palanca para salir de ' + NET.byId[st.line].st[st.stops[0]].name, 'b'); }
    if (st.trivia && !$('#cTriv').innerHTML) this.renderTrivia(st);
  },
  renderTrivia(st) {
    const el = $('#cTriv'); if (!el) return; const q = st.trivia;
    el.innerHTML = q ? `<div class="card" style="top:auto;bottom:calc(120px + var(--sab));left:50%;transform:translateX(-50%);width:min(92%,420px)"><div class="pag">Pregunta de la estación · +100</div><p style="font-weight:700;margin:6px 0 10px">${esc(q.q)}</p><div class="col">${q.o.map((o, i) => `<button class="btn sm" data-i="${i}">${esc(o.t)}</button>`).join('')}</div></div>` : '';
    $$('#cTriv button').forEach(b => b.onclick = () => this.answer(st, +b.dataset.i));
  },
  key(st, k, down) { if (k === 'ArrowUp' || k === 'w') st.keys.up = down; if (k === 'ArrowDown' || k === 's') st.keys.down = down; if (!down) return; if (k === ' ' || k === 'd') this.doors(st); if (k === 'v') { const V = ['cab', 'tps', 'cine', 'lado', 'top', 'pan']; st.view = V[(V.indexOf(st.view) + 1) % 4]; } if (k === 'h') Snd.play('horn'); if (k === 'x') st.lev = 0; },
  /* ======================= DIBUJO ======================= */
  gl(st) { return (st.view === 'cab' || st.view === 'tps' || st.view === 'cine') && Save.d.settings.q !== 'low' && G3.init(); },
  draw(g, st, vp) {
    const W = vp.w, H = vp.h;
    if (st.view === 'top' || st.view === 'pan') this.drawTop(g, st, W, H, st.view === 'pan');
    else if (st.view === 'lado') this.drawLado(g, st, W, H);
    else if (this.gl(st)) this.drawGL(g, st, W, H, st.view === 'tps');
    else this.draw3D(g, st, W, H, st.view !== 'cab');
    if (!EM.headless) { Mundo.overlay(g, W, H, st.t, { noNight: st.view !== 'top', noRain: true, noGrain: this.gl(st) }); if (st.view === 'top') MAP.lightsTop(g, Mundo.light().night, st.t); }
    this.drawStrip(g, st, W, H);
  },
  /* diagrama de la línea: estaciones del tramo y posición del tren */
  drawStrip(g, st, W, H) {
    const dpr = W / Math.max(1, ($('#gcv') || { clientWidth: W }).clientWidth || W), line = NET.byId[st.line], n = st.stops.length, x0 = 16 * dpr, x1 = W - 16 * dpr, y = (st.view === 'cab' ? 118 : 104) * dpr, a = st.tgt[0], b = st.tgt[n - 1];
    g.fillStyle = 'rgba(16,46,80,.82)'; g.fillRect(8 * dpr, y - 16 * dpr, W - 16 * dpr, 30 * dpr); g.strokeStyle = line.color; g.lineWidth = 4 * dpr; g.beginPath(); g.moveTo(x0, y); g.lineTo(x1, y); g.stroke();
    for (let i = 0; i < n; i++) { const f = n > 1 ? i / (n - 1) : 0, x = x0 + (x1 - x0) * f, done = i < st.ni || (i === st.ni && st.ph === 'dwell'); g.fillStyle = done ? '#fff' : 'rgba(255,255,255,.35)'; g.strokeStyle = PAL.negro; g.lineWidth = 1.5; g.beginPath(); g.arc(x, y, 4.5 * dpr, 0, TAU); g.fill(); g.stroke(); if (n <= 8 || i === 0 || i === n - 1 || i === st.ni) { g.fillStyle = i === st.ni ? PAL.mante : '#fff'; g.font = (i === st.ni ? '800 ' : '600 ') + (8.5 * dpr) + 'px Cuerpo, sans-serif'; g.textAlign = i === 0 ? 'left' : i === n - 1 ? 'right' : 'center'; g.fillText(line.st[st.stops[i]].name, x, y - 7 * dpr); } }
    const f = clamp((st.s - a) / ((b - a) || 1), 0, 1), tx = x0 + (x1 - x0) * f; g.fillStyle = PAL.mante; g.strokeStyle = PAL.negro; g.lineWidth = 1.5; g.beginPath(); g.moveTo(tx, y + 3 * dpr); g.lineTo(tx - 6 * dpr, y + 12 * dpr); g.lineTo(tx + 6 * dpr, y + 12 * dpr); g.closePath(); g.fill(); g.stroke(); g.textAlign = 'left';
  },
  hourOf(st) { return st.fixH != null ? st.fixH + st.t / 3600 : Mundo.hour(); },
  zLine(line, s) { return line.kind === 'metro' || line.kind === 'tram' || line.kind === 'future' ? G3.zOn(line, s) : MAP.elevM(NET.at(line.P, s).x, NET.at(line.P, s).y) + .3; },
  drawGL(g, st, W, H, tps) {
    G3.show(true); const line = NET.byId[st.line], K = KIND[st.kind], dir = st.dir, p = NET.at(line.P, st.s), a = p.a + (dir < 0 ? Math.PI : 0), z = this.zLine(line, st.s), col = rgb(line.color);
    let cam; if (st.view === 'cine') { if (!st._cine || (st._cine.s - st.s) * dir < -40) { const sa = st.s + dir * (150 + h2(st.t | 0, 1, 1) * 120), sd = h2(st.t | 0, 2, 1) < .5 ? -1 : 1, q0 = NET.at(line.P, sa, sd * (26 + h2(st.t | 0, 3, 1) * 22)), q = typeof VC !== 'undefined' && VC.camaraLibre ? VC.camaraLibre(q0.x, q0.y, p.x, p.y, MAP.elevM(q0.x, q0.y) + 2.6 + (st.kind === 'metro' ? 6 : 0)) : { x: q0.x, y: q0.y, z: MAP.elevM(q0.x, q0.y) + 2.6 }; st._cine = { s: sa, x: q.x, y: q.y, z: q.z }; } cam = { eye: [st._cine.x, st._cine.z, st._cine.y], at: [p.x, z + 3, p.y], fov: .9 }; }
    else if (tps) { const sb = st.s - dir * (K.len + 30), q = NET.at(line.P, sb, dir * 6); cam = { eye: [q.x, this.zLine(line, sb) + 12, q.y], at: [p.x + Math.cos(a) * 16, z + 2.5, p.y + Math.sin(a) * 16], fov: .95 }; }
    else { const q = NET.at(line.P, st.s + dir * 90); cam = { eye: [p.x, z + 2.9, p.y], at: [q.x, this.zLine(line, st.s + dir * 90) + 1.5, q.y], fov: 1.1 }; }
    G3.draw(cam, { hour: this.hourOf(st), rain: st.rain, dyn: G => {
      G3.traffic(cam, st.t + 1000, line); G3.people(cam, st.t);
      const carL = st.kind === 'metro' ? 22 : st.kind === 'tram' ? 19.5 : K.len, n = st.kind === 'metro' ? 3 : st.kind === 'tram' ? 2 : 1;
      if (tps || st.view === 'cine') for (let k = 0; k < n; k++) { const s = st.s - dir * (k * (carL + 1) + carL / 2), q = NET.at(line.P, s), zq = this.zLine(line, s), a = q.a + (dir < 0 ? Math.PI : 0);   // 3.0 · tu tren con la paleta de la línea (28-taller-sistema.js)
        if (!((st.kind === 'metro' || st.kind === 'tram') && EM.taller && EM.taller.dibujaSistema && EM.taller.dibujaSistema(st.kind === 'tram' ? 'tranvia' : 'metro', line.color, q.x, zq, q.y, a, { largo: carL, panto: k === 0, puntas: k === 0 ? [1] : k === n - 1 ? [-1] : [] }))) G3.vehicle(q.x, zq, q.y, a, carL, st.kind, col);
        else if (k === 0) { const u = st.kind === 'tram' ? carL * .1 - .2 : carL * .3 - .25; EM.taller.chispa(q.x + Math.cos(a) * u, zq + (st.kind === 'tram' ? 4.6 : 5.05), q.y + Math.sin(a) * u, a, st.t, Mundo.weather().rain); } }
      for (const sg of st.sig) { if (!sg.seen || sg.done) continue; const q = NET.at(line.P, sg.s, dir * 3.6), zq = this.zLine(line, sg.s); G.box(q.x, zq, q.y, 0, .35, .35, 5, [.2, .2, .22]); G.box(q.x, zq + 5, q.y, 0, .8, .8, 1.6, sg.on ? [1, .23, .18] : [.22, .9, .48]); }
      for (const L of st.lights) { const q = NET.at(line.P, L.s, dir * 6), zq = this.zLine(line, L.s), ls = this.lightState(L, st.t); G.box(q.x, zq, q.y, 0, .3, .3, 5, [.2, .2, .22]); G.box(q.x, zq + 5, q.y, 0, .7, .7, 1.4, ls === 'g' ? [.22, .9, .48] : ls === 'y' ? [1, .76, .23] : [1, .23, .18]); }
      const m = NET.at(line.P, st.tgt[st.ni], dir * 3); if (st.ph !== 'dwell') G.box(m.x, this.zLine(line, st.tgt[st.ni]), m.y, 0, .4, .4, 2.6 + .3 * Math.sin(st.t * 6), [.98, .88, .4]);
    } });
    g.textAlign = 'center'; for (const sI of line.st) { if (Math.abs(sI.s - st.s) > 900) continue; const q0 = NET.at(line.P, sI.s), q = G3.toScreen(q0.x, this.zLine(line, sI.s) + 8, q0.y, W, H); if (!q) continue; const fs = clamp(2400 / q.d, 10, 22) * (W / ($('#gcv').clientWidth || W)); g.font = '700 ' + fs + 'px Titulos, sans-serif'; const tw = g.measureText(sI.name).width; g.fillStyle = 'rgba(20,20,20,.85)'; g.fillRect(q.x - tw / 2 - 6, q.y - fs, tw + 12, fs * 1.3); g.fillStyle = line.color; g.fillRect(q.x - tw / 2 - 6, q.y - fs, 4, fs * 1.3); g.fillStyle = '#fff'; g.fillText(sI.name, q.x, q.y); }
    g.textAlign = 'left';
    if (st.rain) { g.strokeStyle = 'rgba(220,235,245,.4)'; g.lineWidth = 1; g.beginPath(); for (let i = 0; i < 80; i++) { const x = (h2(i, 3, 3) * W + st.t * 90) % W, y = (h2(i, 4, 3) * H + st.t * 800 * (1 + h2(i, 5, 3))) % H; g.moveTo(x, y); g.lineTo(x - 3, y + 12); } g.stroke(); }
    if (st.view === 'cab') this.drawCab(g, st, W, H, K, line, st.tod === 'noche'); else this.drawMiniHud(g, st, W, H, K);
  },
  /* tren de perfil: carrocería con livery del Metro, ventanas, puertas, cabina, pantógrafo */
  sideTrain(g, st, line, K, X, Y, k, s, dir, carL, n, col, sky, alpha, me) {
    g.save(); g.globalAlpha = alpha;
    for (let i = 0; i < n; i++) { const s1 = s - dir * i * (carL + 1), s2 = s1 - dir * carL, xa = X(s1), xb = X(s2), ya = Y(this.zLine(line, s1)), yb = Y(this.zLine(line, s2)), L = Math.hypot(xa - xb, ya - yb), an = Math.atan2(ya - yb, xa - xb), hh = (st.kind === 'metro' ? 3.7 : 3.3) * k, win = sky.night > .5 ? '#ffe7a0' : '#8fc4dc';
      g.save(); g.translate(xb, yb); g.rotate(an);
      g.fillStyle = '#141414'; g.fillRect(-1.2 * k, -hh * .35, L + 2.4 * k, hh * .35);   // bogies y bajos
      for (const bx of [L * .18, L * .82]) { g.fillStyle = '#2a2d31'; g.fillRect(bx - 1.6 * k, -hh * .3, 3.2 * k, hh * .3); g.fillStyle = '#4a4f55'; g.beginPath(); g.arc(bx - .9 * k, 0, .45 * k, 0, TAU); g.arc(bx + .9 * k, 0, .45 * k, 0, TAU); g.fill(); }
      g.fillStyle = '#141414'; g.fillRect(-1, -hh - 1, L + 2, hh * .72 + 1); g.fillStyle = st.kind === 'metro' ? '#eef1f3' : '#f3f5f1'; g.fillRect(0, -hh, L, hh * .72);
      g.fillStyle = col; g.fillRect(0, -hh * .62, L, hh * .16); g.fillStyle = Art.shade(col, .75); g.fillRect(0, -hh * .46, L, hh * .05);   // franja de la línea
      g.fillStyle = '#d4d8dc'; g.fillRect(0, -hh, L, hh * .08);   // techo
      const nw = st.kind === 'metro' ? 6 : 5, ww = L / nw; for (let w = 0; w < nw; w++) { const x = ww * w; if (w % 2 === 1) { g.fillStyle = '#b9bfc5'; g.fillRect(x + ww * .3, -hh * .92, ww * .4, hh * .64); g.fillStyle = '#141414'; g.fillRect(x + ww * .5 - .6, -hh * .92, 1.2, hh * .64); g.fillStyle = win; g.fillRect(x + ww * .34, -hh * .88, ww * .32, hh * .28); } else { g.fillStyle = win; g.fillRect(x + ww * .2, -hh * .88, ww * .6, hh * .3); } }
      const front = (dir > 0 && i === 0) || (dir < 0 && i === n - 1), back = (dir > 0 && i === n - 1) || (dir < 0 && i === 0), fx = dir > 0 ? L : 0;
      if (front || back) { const cx = (front ? (dir > 0 ? L : 0) : (dir > 0 ? 0 : L)); g.fillStyle = '#1f2e3d'; g.fillRect(cx - (cx ? 1.9 * k : 0), -hh * .9, 1.9 * k, hh * .32); g.fillStyle = front ? '#fff6c0' : '#ff3b2f'; g.fillRect(cx - (cx ? 1.2 * k : 0), -hh * .5, 1.2 * k, hh * .08); }
      if (st.kind === 'metro' || st.kind === 'tram') { g.fillStyle = '#141414'; g.fillRect(L * .45, -hh - 2.4 * k, .3 * k, 2.4 * k); g.fillRect(L * .33, -hh - 2.5 * k, L * .28, .25 * k); if (me && st.v > 3 && h2(st.t * 30 | 0, i, 1) < .12) { g.fillStyle = '#bfefff'; g.fillRect(L * .45 - 2, -hh - 2.9 * k, 4, 3); } }
      g.restore(); }
    g.restore();
  },
  /* vista lateral en capas: el tren de perfil sobre el viaducto real */
  drawLado(g, st, W, H) {
    if (G3.cv) G3.show(false); const line = NET.byId[st.line], K = KIND[st.kind], R = Lado.prof('line:' + line.id, line.P), dir = st.dir, k = Math.max(W, H * .7) / 230, col = line.color;
    const zc = this.zLine(line, st.s); st._lz = st._lz == null ? zc : st._lz + (zc - st._lz) * .06; const near = st.stops.map(i => line.st[i]).find(sI => Math.abs(sI.s - st.s) < 160);
    Lado.draw(g, W, H, { R, s: st.s - dir * K.len / 2, z: st._lz - 4, k, dir, hour: this.hourOf(st), t: st.t, rain: st.rain, fog: false, title: near ? { t: near.name, sub: line.name.toUpperCase(), a: clamp(1 - Math.abs(near.s - st.s) / 160, 0, 1) } : null, fg: (g, X, Y, cN, sky) => {
      const sA = st.s - W / k * 1.2, sB = st.s + W / k * 1.2, deck = st.kind === 'metro';
      // viaducto / vía
      g.fillStyle = Lado.css(Lado.mix(cN, [.82, .78, .7], .5 * sky.day + .15)); g.beginPath(); let f = true; for (let s = Math.max(0, sA); s <= Math.min(line.P.len, sB); s += 8) { const x = X(s), y = Y(this.zLine(line, s)); if (f) { g.moveTo(x, y); f = false; } else g.lineTo(x, y); } for (let s = Math.min(line.P.len, sB); s >= Math.max(0, sA); s -= 8) g.lineTo(X(s), Y(this.zLine(line, s)) + (deck ? 1.6 : .6) * k); g.closePath(); g.fill();
      for (let s = Math.ceil(Math.max(0, sA) / 36) * 36; deck && s <= Math.min(line.P.len, sB); s += 36) { const x = X(s), y = Y(this.zLine(line, s)) + 1.6 * k, yg = Y(Lado.sample(R.near, R, s)); g.fillRect(x - .9 * k, y, 1.8 * k, Math.max(0, yg - y)); }
      for (let s = Math.ceil(Math.max(0, sA) / 48) * 48; (st.kind === 'metro' || st.kind === 'tram') && s <= Math.min(line.P.len, sB); s += 48) { const x = X(s), y = Y(this.zLine(line, s)); g.fillStyle = Lado.css(Lado.mix(cN, [0, 0, 0], .3)); g.fillRect(x - .2 * k, y - 6.4 * k, .4 * k, 6.4 * k); }
      // estaciones
      for (const sI of line.st) { if (sI.s < sA - 100 || sI.s > sB + 100) continue; const x0 = Math.min(X(sI.s - K.plat / 2), X(sI.s + K.plat / 2)), pw = Math.abs(X(sI.s + K.plat / 2) - X(sI.s - K.plat / 2)), y = Y(this.zLine(line, sI.s)), wall = Lado.css(Lado.mix(cN, [.92, .88, .8], .65)), dark = Lado.css(Lado.mix(cN, [0, 0, 0], .35));
        g.fillStyle = dark; g.fillRect(x0 - .5 * k, y - 6.6 * k, pw + 1 * k, 7 * k * 0 + .5 * k); g.fillStyle = wall; g.fillRect(x0, y - 1.1 * k, pw, 1.3 * k); g.fillStyle = PAL.mante; g.fillRect(x0, y - 1.3 * k, pw, .3 * k);   // andén y línea amarilla
        for (let q = 0; q <= 6; q++) { const cx = x0 + pw * q / 6; g.fillStyle = dark; g.fillRect(cx - .25 * k, y - 6 * k, .5 * k, 5 * k); }
        g.fillStyle = Lado.css(Lado.mix(cN, [.85, .82, .76], .6)); g.beginPath(); g.moveTo(x0 - .8 * k, y - 6 * k); g.lineTo(x0 + pw * .5, y - 7.6 * k); g.lineTo(x0 + pw + .8 * k, y - 6 * k); g.lineTo(x0 + pw + .8 * k, y - 5.5 * k); g.lineTo(x0 + pw * .5, y - 7.1 * k); g.lineTo(x0 - .8 * k, y - 5.5 * k); g.fill();   // techo a dos aguas
        g.fillStyle = col; g.fillRect(x0 + pw * .5 - 7 * k, y - 9.6 * k, 14 * k, 1.8 * k); g.fillStyle = '#fff'; g.font = '700 ' + Math.max(8, 1.3 * k) + 'px Cuerpo, sans-serif'; g.textAlign = 'center'; g.fillText(sI.name.toUpperCase(), x0 + pw * .5, y - 8.3 * k); g.textAlign = 'left';
        for (let q = 0; q < 9; q++) if (h2(q, sI.i, 3) < .65) Art.person(g, x0 + pw * (q + .4) / 9, y - 1.2 * k, Math.max(1, k * .32), q + sI.i * 9, h2(q, sI.i, 8) < .3); }
      // otros trenes de la línea (ciudad viva)
      const carL = st.kind === 'metro' ? 22 : st.kind === 'tram' ? 19.5 : K.len, n = st.kind === 'metro' ? 3 : st.kind === 'tram' ? 2 : 1, L2 = line.P.len * 2;
      for (let q = 0; q < 4; q++) { const s0 = (st.t * K.vmax * .7 + q * L2 / 4 + 500) % L2, od = s0 < line.P.len ? 1 : -1, os = od > 0 ? s0 : L2 - s0; if (Math.abs(os - st.s) < 90 || os < sA - 80 || os > sB + 80) continue; this.sideTrain(g, st, line, K, X, Y, k, os, od, carL, n, col, sky, .85); }
      this.sideTrain(g, st, line, K, X, Y, k, st.s, dir, carL, n, col, sky, 1, true);
    } });
    this.drawMiniHud(g, st, W, H, K);
  },
  sky(st) { return st.tod === 'noche' ? ['#0b1e2b', '#12344a', '#1d4a5e'] : st.tod === 'tarde' ? ['#12446c', '#c8664a', '#f3c27a'] : ['#2f7fb0', '#7fbcd6', '#d7ecf0']; },
  /* silueta de montañas real (relieve del valle) por rayos desde la cámara */
  ridge(cx, cy, cz, th, W, focal, hor) {
    const key = (cx / 30 | 0) + ',' + (cy / 30 | 0) + ',' + (th * 40 | 0) + ',' + W; if (this._rk === key) return this._rd;
    const N = 72, near = new Float32Array(N + 1), far = new Float32Array(N + 1);
    for (let c = 0; c <= N; c++) {
      const sx = (c / N) * W - W / 2, ang = th + Math.atan2(sx, focal), dx = Math.cos(ang), dy = Math.sin(ang), cosf = Math.cos(ang - th); let mn = 1e9, mf = 1e9;
      for (let d = 120; d < 22000; d *= 1.09) { const e = MAP.elevM(cx + dx * d, cy + dy * d), y = hor - (e - cz) / (d * cosf) * focal; if (d < 2500) { if (y < mn) mn = y; } else if (y < mf) mf = y; }
      near[c] = mn; far[c] = Math.min(mf, mn);
    }
    this._rk = key; this._rd = { near, far, N }; return this._rd;
  },
  draw3D(g, st, W, H, tps) {
    const T = TRACKS.get(st.line), line = NET.byId[st.line], K = KIND[st.kind], night = st.tod === 'noche', dir = st.dir;
    const back = tps ? K.len + 16 : -1.5, sc = clamp(st.s - dir * back, 0, T.len), ci = clamp(sc / SEG, 0, T.n - 1.001), i0 = ci | 0, fk = ci - i0;
    const cx = lerp(T.x[i0], T.x[i0 + 1], fk), cy = lerp(T.y[i0], T.y[i0 + 1], fk);
    let th = Math.atan2(T.y[Math.min(T.n - 1, i0 + 3 * (dir > 0 ? 1 : 0))] - T.y[Math.max(0, i0 - 3 * (dir < 0 ? 1 : 0))], T.x[Math.min(T.n - 1, i0 + 3 * (dir > 0 ? 1 : 0))] - T.x[Math.max(0, i0 - 3 * (dir < 0 ? 1 : 0))]); if (dir < 0) th += Math.PI;
    const cz = this.zAt(st, sc) + (tps ? 6 : 2.6), hor = Math.round(H * (tps ? .42 : .44)), focal = W * .85 / Math.max(1, W / H * .62), cos = Math.cos(th), sin = Math.sin(th);
    const P = (x, y, z) => { const dx = x - cx, dy = y - cy, r = -dx * sin + dy * cos; let f = dx * cos + dy * sin; if (f < -20) return null; if (f < .8) f = .8; return { x: W / 2 + r / f * focal, y: hor - (z - cz) / f * focal, f, k: focal / f }; };
    // cielo
    const sk = this.sky(st), gr = g.createLinearGradient(0, 0, 0, hor); gr.addColorStop(0, sk[0]); gr.addColorStop(.7, sk[1]); gr.addColorStop(1, sk[2]); g.fillStyle = gr; g.fillRect(0, 0, W, hor + 2);
    if (night) for (let i = 0; i < 50; i++) { g.fillStyle = 'rgba(249,228,164,' + (.4 + .4 * Math.sin(st.t + i)) + ')'; g.fillRect(h2(i, 1, 2) * W, h2(i, 2, 2) * hor * .7, 2, 2); }
    // montañas: dos capas + luces de los barrios en la noche
    const R = MAP.ready ? this.ridge(cx, cy, cz, th, W, focal, hor) : null;
    if (R) {
      const lay = (arr, col) => { g.fillStyle = col; g.beginPath(); g.moveTo(0, hor + 1); for (let c = 0; c <= R.N; c++) g.lineTo(c / R.N * W, Math.min(hor + 1, arr[c])); g.lineTo(W, hor + 1); g.closePath(); g.fill(); };
      lay(R.far, night ? '#173a4c' : st.tod === 'tarde' ? '#7b6a7a' : '#7da3ad'); lay(R.near, night ? '#10303f' : st.tod === 'tarde' ? '#4f5a5e' : '#4f7f6a');
      const step = Math.max(3, W / 160);
      for (let x = 0; x < W; x += step) { const c = Math.round(x / W * R.N), top = R.near[c]; if (top >= hor) continue; for (let y = top + 3; y < hor; y += step) { const h = h2(x | 0, y | 0, 77); if (h < (night ? .32 : .16)) { g.fillStyle = night ? ((st.t * 2 + h * 50) % 6 > .5 ? '#ffd27a' : '#c98a3a') : (h < .08 ? PAL.ladrillo : '#d9cdae'); g.fillRect(x, y, night ? 2 : 3, night ? 2 : 2); } } }
    }
    g.fillStyle = night ? '#16232a' : '#6f8a5a'; g.fillRect(0, hor, W, H - hor);
    // muestras de vía delante (lejos → cerca)
    const nS = Math.round(DRAW_D / SEG), pts = [];
    for (let k = nS; k >= 0; k--) { const i = Math.round(ci) + dir * k; if (i < 0 || i >= T.n) continue; pts.push(i); }
    const proj = new Map(); const pr = (i, o, dz) => { const key = i + '|' + o + '|' + dz; let p = proj.get(key); if (p !== undefined) return p; const a = T.an[i], x = T.x[i] - Math.sin(a) * o, y = T.y[i] + Math.cos(a) * o; p = P(x, y, (dz === 'g' ? T.zt[i] : T.z[i]) + (typeof dz === 'number' ? dz : 0)); proj.set(key, p); return p; };
    const quad = (a, b, c, d, col) => { if (!a || !b || !c || !d) return; g.fillStyle = col; g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.lineTo(c.x, c.y); g.lineTo(d.x, d.y); g.closePath(); g.fill(); };
    const GOFF = [-70, -46, -26, -12, 12, 26, 46, 70], dim = night ? .42 : st.tod === 'tarde' ? .8 : 1;
    // suelo por bandas laterales (tipo de casilla real a cada lado)
    for (let q = 0; q < pts.length - 1; q++) {
      const i = pts[q], j = pts[q + 1];
      for (let b = 0; b < 7; b++) { const t = b < 3 ? T.gb[i * 6 + b] : b > 3 ? T.gb[i * 6 + b - 1] : (K.deck ? T.gb[i * 6 + 2] : TT.ROAD); const o1 = GOFF[b], o2 = GOFF[b + 1]; let col = TRGB[t] || TRGB[0]; const sh = dim * ((i >> 1) % 2 ? 1 : .94); quad(pr(i, o1, 'g'), pr(i, o2, 'g'), pr(j, o2, 'g'), pr(j, o1, 'g'), 'rgb(' + (col[0] * sh | 0) + ',' + (col[1] * sh | 0) + ',' + (col[2] * sh | 0) + ')'); }
    }
    // objetos ordenados por profundidad
    const items = [];
    const sMin = Math.min(sc, sc + dir * DRAW_D), sMax = Math.max(sc, sc + dir * DRAW_D), scn = T.sc;
    let lo = 0, hi = scn.length; while (lo < hi) { const m = (lo + hi) >> 1; if (scn[m].s < sMin) lo = m + 1; else hi = m; }
    for (let k = lo; k < scn.length && scn[k].s <= sMax; k++) { const o = scn[k], i = clamp(Math.round(o.s / SEG), 0, T.n - 1), a = T.an[i], p = P(T.x[i] - Math.sin(a) * o.o, T.y[i] + Math.cos(a) * o.o, o.zg); if (p) items.push({ f: p.f, d: 0, o, p }); }
    for (const sI of line.st) { if (sI.s < sMin - 80 || sI.s > sMax + 80) continue; const i = clamp(Math.round(sI.s / SEG), 0, T.n - 1), p = P(T.x[i], T.y[i], T.z[i]); if (p) items.push({ f: p.f, d: 1, st: sI, i }); }
    for (const sg of st.sig) { if (!sg.seen || sg.done) continue; const i = clamp(Math.round(sg.s / SEG), 0, T.n - 1), a = T.an[i], o = 3.6 * dir, p = P(T.x[i] - Math.sin(a) * o, T.y[i] + Math.cos(a) * o, T.z[i]); if (p) items.push({ f: p.f, d: 2, p, red: sg.on }); }
    for (const L of st.lights) { const i = clamp(Math.round(L.s / SEG), 0, T.n - 1), a = T.an[i], o = 6 * dir, p = P(T.x[i] - Math.sin(a) * o, T.y[i] + Math.cos(a) * o, T.z[i]); if (p) items.push({ f: p.f, d: 2, p, red: this.lightState(L, st.t) !== 'g', yel: this.lightState(L, st.t) === 'y' }); }
    // vía / viaducto / carril (lejos → cerca)
    const deckCol = night ? '#4a4c52' : '#bdb4a0', bal = night ? '#2b2b2e' : '#6c6a66', rail = night ? '#9aa0a6' : '#e8e8e8';
    for (let q = 0; q < pts.length - 1; q++) {
      const i = pts[q], j = pts[q + 1], hw = K.deck ? 3.4 : (st.kind === 'tram' ? 3 : 3.6);
      if (K.deck && i % 4 === 0) { const a = pr(i, 0), b = pr(i, 0, 'g'); if (a && b) { g.fillStyle = night ? '#3a3c40' : '#a99f8a'; const w = Math.max(1, 1.6 * a.k); g.fillRect(a.x - w / 2, a.y, w, b.y - a.y); } }
      if (K.deck) quad(pr(i, -hw * dir, -1.2), pr(i, hw * dir, -1.2), pr(j, hw * dir, -1.2), pr(j, -hw * dir, -1.2), night ? '#2e3034' : '#8f8676');
      quad(pr(i, -hw * dir), pr(i, hw * dir), pr(j, hw * dir), pr(j, -hw * dir), K.deck ? deckCol : (st.kind === 'tram' ? '#59606a' : '#3f444d'));
      if (st.kind === 'metro' || st.kind === 'tram') {
        quad(pr(i, -1.5), pr(i, 1.5), pr(j, 1.5), pr(j, -1.5), bal);
        if (i % 2 === 0) quad(pr(i, -1.3, .05), pr(i, 1.3, .05), pr(j, 1.3, .05), pr(j, -1.3, .05), night ? '#3b2f25' : '#5a4636');
        for (const o of [-.75, .75]) quad(pr(i, o - .06, .15), pr(i, o + .06, .15), pr(j, o + .06, .15), pr(j, o - .06, .15), rail);
        if (st.kind === 'tram') quad(pr(i, -.05, .12), pr(i, .05, .12), pr(j, .05, .12), pr(j, -.05, .12), rail);
      } else if (i % 6 < 3) quad(pr(i, -.12, .02), pr(i, .12, .02), pr(j, .12, .02), pr(j, -.12, .02), st.kind === 'brt' ? '#f2f2f2' : PAL.mante);
      // catenaria: postes cada 48 m
      if ((st.kind === 'metro' || st.kind === 'tram') && i % 6 === 0) { const a = pr(i, hw * dir), b = pr(i, hw * dir, 6.2); if (a && b) { g.fillStyle = night ? '#55595e' : '#5b6168'; const w = Math.max(1, .25 * a.k); g.fillRect(a.x - w / 2, b.y, w, a.y - b.y); const c = pr(i, 0, 5.6); if (c) g.fillRect(Math.min(b.x, c.x), b.y, Math.abs(c.x - b.x), Math.max(1, .1 * a.k)); if (night && st.fest === 'alumbrados') for (let q = 0; q < 5; q++) { g.fillStyle = ROPA[(i + q + (st.t * 3 | 0)) % ROPA.length]; const r = Math.max(1.5, .35 * a.k); g.fillRect(b.x + (a.x - b.x) * 0 - r / 2, b.y + (a.y - b.y) * q / 5, r, r); } } }
      // marca de parada (tablero) en el andén siguiente
    }
    // cable de contacto
    if (st.kind === 'metro' || st.kind === 'tram') { g.strokeStyle = night ? '#6d6f73' : '#333'; g.lineWidth = 1; g.beginPath(); let f = true; for (const i of pts) { const p = pr(i, 0, 5.6); if (!p) continue; if (f) { g.moveTo(p.x, p.y); f = false; } else g.lineTo(p.x, p.y); } g.stroke(); }
    items.sort((a, b) => b.f - a.f);
    for (const it of items) {
      if (it.d === 0) { const o = it.o, p = it.p, w = o.w * p.k, h = o.h * p.k; if (w < .6) continue; if (o.k === 0) Art.building(g, p.x - w / 2, p.y - h, w, h, o.seed, night, o.b); else Art.tree(g, p.x, p.y, h * .9, night); }
      else if (it.d === 1) this.drawStation(g, st, T, it.st, P, night, line, K);
      else if (it.d === 2) { const p = it.p, h = 5 * p.k, w = Math.max(2, .5 * p.k); g.fillStyle = PAL.negro; g.fillRect(p.x - w / 2, p.y - h, w, h); g.fillRect(p.x - w * 1.4, p.y - h - w * 3.4, w * 2.8, w * 3.6); g.fillStyle = it.yel ? '#ffc23a' : it.red ? '#ff3b2f' : '#38e07b'; g.beginPath(); g.arc(p.x, p.y - h - w * (it.red && !it.yel ? 2.6 : .8), w * .9, 0, TAU); g.fill(); }
    }
    // tren propio en 3a persona
    if (tps) this.drawVehicle3D(g, st, T, P, line, K, night);
    if (st.rain) { g.strokeStyle = 'rgba(220,235,245,.45)'; g.lineWidth = 1; g.beginPath(); for (let i = 0; i < 90; i++) { const x = (h2(i, 3, 3) * W + st.t * 140) % W, y = (h2(i, 4, 3) * H + st.t * 900 * (1 + h2(i, 5, 3))) % H; g.moveTo(x, y); g.lineTo(x - 3, y + 12); } g.stroke(); }
    if (!tps) this.drawCab(g, st, W, H, K, line, night);
    else this.drawMiniHud(g, st, W, H, K);
  },
  drawStation(g, st, T, sI, P, night, line, K) {
    const half = K.plat / 2, dir = st.dir, pw = K.deck ? 4 : 3, side = [1, -1];
    for (const sd of side) {
      const o1 = sd * (K.deck ? 3.6 : 4), o2 = sd * (K.deck ? 3.6 + pw : 4 + pw);
      let prev = null;
      for (let s = sI.s - half; s <= sI.s + half + .1; s += 8) {
        const i = clamp(Math.round(s / SEG), 0, T.n - 1), a = T.an[i], z = T.z[i] + .9, mk = o => P(T.x[i] - Math.sin(a) * o, T.y[i] + Math.cos(a) * o, z), cur = [mk(o1), mk(o2), P(T.x[i] - Math.sin(a) * o2, T.y[i] + Math.cos(a) * o2, z + 3.6)];
        if (prev && cur[0] && cur[1] && prev[0] && prev[1]) { g.fillStyle = night ? '#6b6457' : '#d9cdae'; g.beginPath(); g.moveTo(prev[0].x, prev[0].y); g.lineTo(cur[0].x, cur[0].y); g.lineTo(cur[1].x, cur[1].y); g.lineTo(prev[1].x, prev[1].y); g.fill(); g.fillStyle = PAL.mante; g.fillRect(Math.min(prev[0].x, cur[0].x), Math.min(prev[0].y, cur[0].y), Math.abs(cur[0].x - prev[0].x) + 1, Math.max(1, cur[0].k * .15)); }
        if (cur[2] && cur[1] && (Math.round(s) % 16 === 0)) { g.fillStyle = night ? '#2c3a44' : line.color; const w = Math.max(1, .3 * cur[1].k); g.fillRect(cur[1].x - w / 2, cur[2].y, w, cur[1].y - cur[2].y); }
        if (st.fest === 'feria' && cur[0] && h2(s | 0, sd, 9) < .5) { const p = cur[0], r = Math.max(1.5, p.k * .35); g.fillStyle = ROPA[(s | 0) % 5]; g.fillRect(p.x - r, p.y - r * 2, r * 2, r * 2); g.fillStyle = '#2f9b57'; g.fillRect(p.x - r / 3, p.y - r, r / 1.5, r); }
        if (cur[1] && h2(s | 0, sd, sI.i) < .55) { const p = cur[1], sz = Math.max(1, p.k * .3); for (let q = 0; q < 2; q++) Art.person(g, p.x + (q - .5) * sz * 4 * -sd, p.y, sz, (s | 0) + q + sI.i * 31, false); }
        prev = cur;
      }
      // techo
      const ra = P(...this.off(T, sI.s - half, o2 * .9), T.z[clamp(Math.round(sI.s / SEG), 0, T.n - 1)] + 5), rb = P(...this.off(T, sI.s + half, o2 * .9), T.z[clamp(Math.round(sI.s / SEG), 0, T.n - 1)] + 5);
      if (ra && rb) { g.fillStyle = night ? '#1f2e38' : '#e9e2cf'; g.fillRect(Math.min(ra.x, rb.x), Math.min(ra.y, rb.y) - Math.max(2, ra.k * .6), Math.abs(rb.x - ra.x) + 1, Math.max(2, Math.min(ra.k, rb.k) * .6)); }
    }
    // letrero con el nombre
    const i = clamp(Math.round(sI.s / SEG), 0, T.n - 1), p = P(T.x[i] - Math.sin(T.an[i]) * 5 * dir, T.y[i] + Math.cos(T.an[i]) * 5 * dir, T.z[i] + 4.2);
    if (p && p.k > 1.2) { const fs = clamp(p.k * 1.1, 6, 40); g.font = '700 ' + fs + 'px ' + 'Titulos, Arial Narrow, sans-serif'; const tw = g.measureText(sI.name).width; g.fillStyle = PAL.negro; g.fillRect(p.x - tw / 2 - fs * .4, p.y - fs, tw + fs * .8, fs * 1.25); g.fillStyle = line.color; g.fillRect(p.x - tw / 2 - fs * .4, p.y - fs, fs * .25, fs * 1.25); g.fillStyle = '#fff'; g.textAlign = 'center'; g.fillText(sI.name, p.x, p.y); g.textAlign = 'left'; }
    // marca de parada (para el frente del tren)
    if (sI.i === st.stops[Math.min(st.ni, st.stops.length - 1)] && st.ph !== 'dwell') { const s = st.tgt[st.ni], j = clamp(Math.round(s / SEG), 0, T.n - 1), a = T.an[j], m = P(T.x[j] - Math.sin(a) * 2.6 * dir, T.y[j] + Math.cos(a) * 2.6 * dir, T.z[j] + 1.8); if (m) { const w = Math.max(3, m.k * .9); g.fillStyle = PAL.negro; g.fillRect(m.x - w / 2 - 1, m.y - w - 1, w + 2, w * 1.6 + 2); g.fillStyle = PAL.mante; g.fillRect(m.x - w / 2, m.y - w, w, w * 1.6); g.fillStyle = PAL.rojo; g.fillRect(m.x - w / 2, m.y - w * .3, w, w * .3); } }
  },
  off(T, s, o) { const i = clamp(Math.round(s / SEG), 0, T.n - 1), a = T.an[i]; return [T.x[i] - Math.sin(a) * o, T.y[i] + Math.cos(a) * o]; },
  drawVehicle3D(g, st, T, P, line, K, night) {
    const dir = st.dir, len = K.len, w = st.kind === 'metro' ? 1.5 : 1.3, hgt = st.kind === 'metro' ? 3.8 : 3.4, segs = [];
    for (let d = 0; d <= len; d += 4) { const s = st.s - dir * d, i = clamp(s / SEG, 0, T.n - 1.001), i0 = i | 0, f = i - i0, x = lerp(T.x[i0], T.x[i0 + 1], f), y = lerp(T.y[i0], T.y[i0 + 1], f), a = T.an[i0], z = lerp(T.z[i0], T.z[i0 + 1], f) + .4, sx = -Math.sin(a), sy = Math.cos(a);
      segs.push([P(x + sx * w, y + sy * w, z), P(x - sx * w, y - sy * w, z), P(x + sx * w, y + sy * w, z + hgt), P(x - sx * w, y - sy * w, z + hgt)]); }
    const body = st.kind === 'brt' || st.kind === 'feeder' ? line.color : PAL.plata;
    for (let k = 0; k < segs.length - 1; k++) {
      const a = segs[k], b = segs[k + 1]; if (a.some(p => !p) || b.some(p => !p)) continue;
      const q = (p1, p2, p3, p4, c) => { g.fillStyle = c; g.beginPath(); g.moveTo(p1.x, p1.y); g.lineTo(p2.x, p2.y); g.lineTo(p3.x, p3.y); g.lineTo(p4.x, p4.y); g.fill(); };
      q(a[2], a[3], b[3], b[2], night ? '#7d8288' : '#dfe3e6');
      q(a[0], a[2], b[2], b[0], night ? '#5d6166' : Art.shade(body, .85)); q(a[1], a[3], b[3], b[1], night ? '#5d6166' : Art.shade(body, .78));
    }
    const r = segs[segs.length - 1]; if (r.every(p => p)) { const wpx = Math.abs(r[0].x - r[1].x), by = (r[0].y + r[1].y) / 2; Art.vehicleBack(g, (r[0].x + r[1].x) / 2, by, wpx, line.color, st.kind, st.lev < 0 || st.v < .1); }
  },
  /* cabina (1a persona): marco, tablero, velocímetro y el tinto que no debe regarse */
  drawCab(g, st, W, H, K, line, night) {
    const dpr = W / Math.max(1, ($('#gcv') || { clientWidth: W }).clientWidth || W), db = H - Math.min(H * .26, 150 * dpr), vmax = K.vmax * 3.6, lim = this.limAt(st, st.s) * 3.6, d = (st.tgt[st.ni] - st.s) * st.dir, late = st.t - st.sched[Math.min(st.ni, st.sched.length - 1)];
    // marco de la cabina: pilares, techo con pantalla, parabrisas con limpiaparabrisas si llueve
    g.fillStyle = '#121a21'; g.fillRect(0, 0, W, 8 * dpr); g.fillRect(0, 0, 10 * dpr, H); g.fillRect(W - 10 * dpr, 0, 10 * dpr, H);
    if (st.rain) { const a = Math.sin(st.t * 3.2) * .95; g.strokeStyle = '#141414'; g.lineWidth = 3 * dpr; g.beginPath(); g.moveTo(W * .32, db); g.lineTo(W * .32 + Math.sin(a) * H * .34, db - Math.cos(a) * H * .34); g.stroke(); }
    // consola
    g.fillStyle = '#1b262e'; g.beginPath(); g.moveTo(0, db + 16 * dpr); g.lineTo(W * .16, db); g.lineTo(W * .84, db); g.lineTo(W, db + 16 * dpr); g.lineTo(W, H); g.lineTo(0, H); g.fill();
    g.fillStyle = '#243039'; g.fillRect(W * .16, db + 4 * dpr, W * .68, 3 * dpr); g.fillStyle = line.color; g.fillRect(W * .16, db, W * .68, 3 * dpr);
    // panel LED: próxima estación / estado de puertas
    const zl = 136 * dpr, zr = W - 78 * dpr, px = (zl + zr) / 2, pw = Math.min(zr - zl - 8 * dpr, 300 * dpr), py = db + 12 * dpr, ph = 30 * dpr; g.fillStyle = '#060a0c'; g.fillRect(px - pw / 2, py, pw, ph); g.strokeStyle = '#3a4a55'; g.lineWidth = 1.5; g.strokeRect(px - pw / 2, py, pw, ph);
    const nx = line.st[st.stops[Math.min(st.ni, st.stops.length - 1)]]; g.textAlign = 'center'; g.fillStyle = '#ff9a2e'; g.font = '700 ' + (11 * dpr) + 'px ' + 'ui-monospace, Consolas, monospace';
    g.fillText(st.ph === 'dwell' ? (st.doors === 1 ? '▶ PUERTAS ABIERTAS · ' + Math.round(st.board * 100) + '% ◀' : st.doors === 2 ? 'PUERTAS CERRADAS · TRACCIÓN' : 'EN ANDÉN: ' + nx.name.toUpperCase()) : 'PRÓXIMA: ' + nx.name.toUpperCase() + '  ' + (Math.abs(d) < 100 ? d.toFixed(0) : Math.round(d)) + ' m', px, py + 13 * dpr);
    g.fillStyle = late > 15 ? '#ff6a3d' : '#7fe0a0'; g.font = '700 ' + (9 * dpr) + 'px ui-monospace, Consolas, monospace'; g.fillText((late >= 0 ? 'RETRASO +' : 'ADELANTO ') + Math.abs(Math.round(late)) + ' s   ·   ' + Mundo.chip() + (st.rain ? '   ·   LLUVIA' : ''), px, py + 25 * dpr);
    // velocímetro con arco ATP (verde permitido, rojo prohibido)
    const cx = px, R = Math.min((zr - zl) * .3, 60 * dpr), cy = H - 8 * dpr;
    g.fillStyle = '#0b1115'; g.beginPath(); g.arc(cx, cy, R + 4 * dpr, Math.PI, TAU); g.fill(); g.strokeStyle = '#3a4a55'; g.lineWidth = 2 * dpr; g.beginPath(); g.arc(cx, cy, R + 3 * dpr, Math.PI, TAU); g.stroke();
    const al = Math.PI + Math.PI * clamp(lim / vmax, 0, 1); g.lineWidth = 5 * dpr; g.strokeStyle = '#2f9b57'; g.beginPath(); g.arc(cx, cy, R - 3 * dpr, Math.PI, al); g.stroke(); g.strokeStyle = PAL.rojo; g.beginPath(); g.arc(cx, cy, R - 3 * dpr, al, TAU); g.stroke();
    g.fillStyle = '#c9d6dc'; g.font = '700 ' + (7 * dpr) + 'px Cuerpo, sans-serif'; for (let v = 0; v <= vmax; v += 20) { const a = Math.PI + Math.PI * v / vmax; g.fillRect(cx + Math.cos(a) * (R - 10 * dpr) - 1, cy + Math.sin(a) * (R - 10 * dpr) - 1, 2, 2); g.fillText(String(v), cx + Math.cos(a) * (R - 18 * dpr), cy + Math.sin(a) * (R - 18 * dpr) + 3); }
    const an = Math.PI + Math.PI * clamp(st.v * 3.6 / vmax, 0, 1); g.strokeStyle = '#fff'; g.lineWidth = 2.5 * dpr; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(an) * (R - 6 * dpr), cy + Math.sin(an) * (R - 6 * dpr)); g.stroke(); g.fillStyle = '#fff'; g.beginPath(); g.arc(cx, cy, 4 * dpr, 0, TAU); g.fill();
    g.fillStyle = '#fff'; g.font = '700 ' + (R * .34) + 'px Titulos, sans-serif'; g.fillText(Math.round(st.v * 3.6), cx, cy - R * .36); g.fillStyle = PAL.mante; g.font = '700 ' + (R * .13) + 'px Cuerpo, sans-serif'; g.fillText('KM/H · LÍMITE ' + Math.round(lim), cx, cy - R * .2);
    // lámparas: ATP, puertas izq/der, tracción/freno, tinto
    const lamp = (x, y, on, col, t) => { g.fillStyle = '#0b1115'; g.fillRect(x - 11 * dpr, y - 8 * dpr, 22 * dpr, 16 * dpr); g.fillStyle = on ? col : '#2a3238'; g.beginPath(); g.arc(x, y - 1 * dpr, 4.5 * dpr, 0, TAU); g.fill(); if (on) { g.fillStyle = col + '55'; g.beginPath(); g.arc(x, y - 1 * dpr, 8 * dpr, 0, TAU); g.fill(); } g.fillStyle = '#9fb0bb'; g.font = '700 ' + (6 * dpr) + 'px Cuerpo, sans-serif'; g.fillText(t, x, y + 6 * dpr); };
    const lx = px - R - 22 * dpr, ly = H - 40 * dpr; lamp(lx, ly, st.v > lim / 3.6 + .5, '#ff3b2f', 'ATP'); lamp(lx, ly - 24 * dpr, st.eb > 0, '#ff3b2f', 'EMERG'); lamp(lx, ly - 48 * dpr, st.lev > 0, '#38e07b', 'TRACC');
    const rx = px + R + 22 * dpr; lamp(rx, ly, st.doors === 1, '#ffc23a', 'PUERTAS'); lamp(rx, ly - 24 * dpr, st.ph === 'dwell' && st.board >= 1, '#38e07b', 'TIMBRE'); lamp(rx, ly - 48 * dpr, st.lev < 0, '#ff9a2e', 'FRENO');
    // tinto en la consola (confort)
    const tx = px + R + 22 * dpr, ty = db + 48 * dpr, sl = clamp(st.a * 4, -6, 6) * dpr; g.fillStyle = '#f3efe6'; g.fillRect(tx - 7 * dpr, ty, 14 * dpr, 12 * dpr); g.fillStyle = '#5a3417'; g.beginPath(); g.moveTo(tx - 6 * dpr, ty + 3 * dpr - sl); g.lineTo(tx + 6 * dpr, ty + 3 * dpr + sl); g.lineTo(tx + 6 * dpr, ty + 11 * dpr); g.lineTo(tx - 6 * dpr, ty + 11 * dpr); g.fill(); g.fillStyle = '#9fb0bb'; g.font = '700 ' + (6 * dpr) + 'px Cuerpo, sans-serif'; g.fillText('TINTO ' + Math.round(st.comfort) + '%', tx, ty + 20 * dpr);
    g.textAlign = 'left';
    if (st.eb) { g.fillStyle = 'rgba(200,32,31,' + (.22 + .18 * Math.sin(st.t * 12)) + ')'; g.fillRect(0, 0, W, H); }
  },
  drawMiniHud(g, st, W, H, K) { const u = W / Math.max(1, ($('#gcv') || { clientWidth: W }).clientWidth || W); g.fillStyle = 'rgba(16,46,80,.85)'; g.fillRect(8 * u, 58 * u, 104 * u, 30 * u); g.fillStyle = '#fff'; g.font = '700 ' + (17 * u) + 'px Titulos, sans-serif'; g.fillText(Math.round(st.v * 3.6) + ' km/h', 16 * u, 80 * u); },
  /* vista cenital (mapa pixelado) y panorámica (toda la línea) */
  drawTop(g, st, W, H, pan) {
    const T = TRACKS.get(st.line), line = NET.byId[st.line], K = KIND[st.kind], p = NET.at(line.P, st.s);
    let k = pan ? Math.min(W, H) / (Math.max(2000, Math.abs(st.tgt[st.tgt.length - 1] - st.tgt[0]) * 1.3)) : Math.min(W, H) / 420;
    let mx = p.x, my = p.y;
    if (pan) { const a = NET.at(line.P, st.tgt[0]), b = NET.at(line.P, st.tgt[st.tgt.length - 1]); mx = (a.x + b.x) / 2; my = (a.y + b.y) / 2; k = Math.min(W / (Math.abs(b.x - a.x) + 1500), H / (Math.abs(b.y - a.y) + 1500)); }
    { const co = CamUI.off(st); k *= CamUI.zoom(st); mx += co.x; my += co.y; st._k = k * (($('#gcv') || { clientWidth: W }).clientWidth || W) / W; }   // pellizco y cámara libre
    if (MAP.ready) { if (pan) { const m = MAP.mini(), s = k * MAP.miniK; g.imageSmoothingEnabled = false; g.drawImage(m, W / 2 - mx * k, H / 2 - my * k, m.width * s, m.height * s); } else MAP.drawTop(g, W, H, mx, my, k); }
    const S = (x, y) => ({ x: W / 2 + (x - mx) * k, y: H / 2 + (y - my) * k });
    for (const l of NET.lines) { if (!pan && l !== line) continue; g.strokeStyle = PAL.negro; g.lineWidth = Math.max(3, (pan ? 5 : 7) * Math.min(1, k * 2)); g.beginPath(); l.P.pts.forEach((q, i) => { const s = S(q.x, q.y); i ? g.lineTo(s.x, s.y) : g.moveTo(s.x, s.y); }); g.stroke(); g.strokeStyle = l.color; g.lineWidth = Math.max(2, (pan ? 3 : 4.5) * Math.min(1, k * 2)); g.stroke(); }
    for (const s of line.st) { const q = S(s.x, s.y); g.fillStyle = '#fff'; g.strokeStyle = PAL.negro; g.lineWidth = 2; g.beginPath(); g.arc(q.x, q.y, pan ? 4 : 7, 0, TAU); g.fill(); g.stroke(); if (pan || k > .4) { g.fillStyle = PAL.negro; g.font = '700 ' + (pan ? 11 : 13) + 'px Cuerpo, sans-serif'; g.fillText(s.name, q.x + 9, q.y - 6); } }
    for (const L of st.lights) { const q = NET.at(line.P, L.s), s = S(q.x, q.y); g.fillStyle = this.lightState(L, st.t) === 'g' ? '#38e07b' : '#ff3b2f'; g.fillRect(s.x - 3, s.y - 3, 6, 6); }
    const len = Math.max(pan ? 10 : 8, K.len * k), c = NET.at(line.P, st.s - st.dir * K.len / 2), sp = S(c.x, c.y);
    Art.topVehicle(g, sp.x, sp.y, c.a + (st.dir < 0 ? Math.PI : 0), len, Math.max(5, 3.2 * k), line.color, st.kind);
    if (pan) { g.strokeStyle = PAL.rojo; g.lineWidth = 2; g.beginPath(); g.arc(sp.x, sp.y, 12 + 4 * Math.sin(st.t * 5), 0, TAU); g.stroke(); }
    this.drawMiniHud(g, st, W, H, K);
  },
  ai(st) { return null; }
};
