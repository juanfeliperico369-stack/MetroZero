/* =====================================================================
   MODO METROPLÚS (cruces con semáforos): toca cada cruce para dar el verde
   a la calle o a la avenida. Lleva los buses de Metroplús por su carril exclusivo
   sin choques ni trancones. Motos que se cuelan en amarillo, taxis amarillos, buses alimentadores.
   Unidad = ancho de un carril. Se conduce por la derecha.
   ===================================================================== */
const VTYPE = {
  car: { len: 1.5, wid: .78, v: 4.2, a: 3.2, p: 10 },
  taxi: { len: 1.4, wid: .76, v: 4.4, a: 3.4, p: 10 },
  moto: { len: .8, wid: .4, v: 5.2, a: 5, p: 8, sneak: .45 },
  feeder: { len: 2.3, wid: .9, v: 3.4, a: 2.2, p: 25 },
  mp: { len: 3.6, wid: .92, v: 3.9, a: 2, p: 100 }
};
const CARCOL = ['#c8201f', '#12446c', '#f4f1ea', '#5a6470', '#2f9b57', '#c3952f', '#1b8088', '#7a5cc4', '#141414', '#9aa0a6'];
const MPlus = EM.modes.metroplus = {
  id: 'metroplus', name: 'Metroplús', sub: 'Cruces y carril exclusivo', music: 'tension',
  tip: 'Toca un cruce para cambiar el verde entre la avenida y la calle. Los buses de Metroplús valen 100. Evita choques y trancones.',
  LV: [
    { n: 'Calle 30 · Belén', mp: 'h', hv: 1, vv: 1, goal: 6, rate: 2.6, mpr: 7, f: 'La Línea 1 de Metroplús va de la Universidad de Medellín (Belén) al Parque Aranjuez.' },
    { n: 'Parque Belén', mp: 'h', hv: 1, vv: 2, goal: 8, rate: 2.4, mpr: 6.5 },
    { n: 'Avenida Oriental', mp: 'v', hv: 2, vv: 1, goal: 8, rate: 2.3, mpr: 6, f: 'La Línea 2 de Metroplús recorre la Avenida Oriental por el centro de Medellín.' },
    { n: 'Carrera 45 · Manrique', mp: 'v', hv: 3, vv: 1, goal: 10, rate: 2.3, mpr: 6, f: 'En Manrique hay una estación de Metroplús llamada Gardel: Carlos Gardel murió en Medellín en 1935.' },
    { n: 'Avenida San Juan', mp: 'h', hv: 2, vv: 2, goal: 10, rate: 2.2, mpr: 6 },
    { n: 'La 80 · Línea O', mp: 'v', hv: 3, vv: 2, goal: 12, rate: 2.1, mpr: 5.5, f: 'La Línea O de buses eléctricos recorre la Avenida 80 entre Caribe y La Palma.' },
    { n: 'Industriales', mp: 'h', hv: 2, vv: 3, goal: 14, rate: 2, mpr: 5.5 },
    { n: 'Hora pico · Infinito', mp: 'v', hv: 3, vv: 2, goal: 25, rate: 1.7, mpr: 5, inf: 1 }
  ],
  levels() { return this.LV.map((l, i) => ({ id: 'mp' + i, name: l.n, sub: l.inf ? 'Sin final' : 'Lleva ' + l.goal + ' buses', i })); },
  create(lv, opts) {
    const idx = clamp(parseInt(String(lv).slice(2), 10) || 0, 0, this.LV.length - 1), P = this.LV[idx];
    // geometría: avenidas horizontales (filas) y calles verticales (columnas)
    const W = 6 + P.vv * 5, H = 9 + P.hv * 5, roads = [];
    const hy = [], vx = []; for (let k = 0; k < P.hv; k++) hy.push(Math.round((k + 1) * H / (P.hv + 1))); for (let k = 0; k < P.vv; k++) vx.push(Math.round((k + 1) * W / (P.vv + 1)));
    const mpH = P.mp === 'h' ? 0 : -1, mpV = P.mp === 'v' ? 0 : -1;
    // carriles: {ax:'h'|'v', d:+1|-1, c: coordenada transversal, bus: exclusivo}
    const lanes = [];
    hy.forEach((y, k) => { const mp = k === mpH; if (mp) { lanes.push({ ax: 'h', d: 1, c: y + .5, bus: 1 }, { ax: 'h', d: -1, c: y - .5, bus: 1 }, { ax: 'h', d: 1, c: y + 1.5 }, { ax: 'h', d: -1, c: y - 1.5 }); } else lanes.push({ ax: 'h', d: 1, c: y + .5 }, { ax: 'h', d: -1, c: y - .5 }); roads.push({ ax: 'h', c: y, hw: mp ? 2 : 1, mp }); });
    vx.forEach((x, k) => { const mp = k === mpV; if (mp) { lanes.push({ ax: 'v', d: 1, c: x - .5, bus: 1 }, { ax: 'v', d: -1, c: x + .5, bus: 1 }, { ax: 'v', d: 1, c: x - 1.5 }, { ax: 'v', d: -1, c: x + 1.5 }); } else lanes.push({ ax: 'v', d: 1, c: x - .5 }, { ax: 'v', d: -1, c: x + .5 }); roads.push({ ax: 'v', c: x, hw: mp ? 2 : 1, mp }); });
    lanes.forEach((l, i) => { l.i = i; l.len = l.ax === 'h' ? W : H; l.next = (opts.seed % 997 + i * 1.3) % 3; l.block = 0; });
    const X = []; for (const r1 of roads.filter(r => r.ax === 'h')) for (const r2 of roads.filter(r => r.ax === 'v')) X.push({ x: r2.c, y: r1.c, hw: r2.hw, hh: r1.hw, g: r1.mp ? 'h' : 'v', y0: 0, sw: 0 });
    // estaciones de Metroplús en el separador central (entre cruces)
    const stops = []; const mpRoad = roads.find(r => r.mp); if (mpRoad) { const cs = mpRoad.ax === 'h' ? vx : hy, L = mpRoad.ax === 'h' ? W : H, pts = [0, ...cs, L]; for (let k = 0; k < pts.length - 1; k++) if (pts[k + 1] - pts[k] > 4 && stops.length < 2) stops.push((pts[k] + pts[k + 1]) / 2); }
    return { idx, W, H, lanes, X, roads, stops, mpAx: P.mp, veh: [], nid: 1, t: 0, buses: 0, goal: P.goal, lives: 3, crashes: 0, jams: 0, score: 0, rate: P.rate, mpr: P.mpr, done: false, win: false, fx: [], rng: (opts.seed | 0) || 7, inf: !!P.inf };
  },
  rnd(st) { st.rng = (Math.imul(st.rng ^ (st.rng >>> 15), 2246822507) + 12345) >>> 0; return st.rng / 4294967296; },
  /* posición del vehículo en el tablero */
  vpos(st, v) { const L = st.lanes[v.l], s = L.d > 0 ? v.s : L.len - v.s; return L.ax === 'h' ? { x: s, y: L.c, a: L.d > 0 ? 0 : Math.PI } : { x: L.c, y: s, a: L.d > 0 ? Math.PI / 2 : -Math.PI / 2 }; },
  /* cruces en el carril: [inicio, fin] en coordenada s del carril */
  xOnLane(st, L) {
    if (L._x) return L._x;
    const out = []; for (const X of st.X) { const c = L.ax === 'h' ? X.x : X.y, hw = L.ax === 'h' ? X.hw : X.hh, onRoad = L.ax === 'h' ? Math.abs(L.c - X.y) < X.hh + .01 : Math.abs(L.c - X.x) < X.hw + .01; if (!onRoad) continue; const a = c - hw, b = c + hw; out.push(L.d > 0 ? { X, a, b } : { X, a: L.len - b, b: L.len - a }); }
    out.sort((p, q) => p.a - q.a); return (L._x = out);
  },
  green(X, ax) { return X.g === ax && X.y0 <= 0; },
  step(st, dt) {
    if (st.done) return; st.t += dt;
    for (const X of st.X) if (X.y0 > 0) { X.y0 -= dt; if (X.y0 <= 0) X.g = X.pend; }
    // aparición por carril
    for (const L of st.lanes) {
      L.next -= dt; if (L.next > 0) continue;
      const first = st.veh.filter(v => v.l === L.i).reduce((m, v) => Math.min(m, v.s - VTYPE[v.ty].len / 2), 99);
      if (first < 2.2) { L.block += dt; L.next = .25; if (L.block > 7) { L.block = 0; st.jams++; st.lives--; st.fx.push(Object.assign({ k: 'bad', t: 1.6, s: '¡Trancón!' }, this.edge(st, L))); this.sfx(st, 'bad'); st.veh = st.veh.filter(v => !(v.l === L.i && v.s < 6)); } continue; }
      L.block = 0;
      let ty; if (L.bus) ty = 'mp'; else { const r = this.rnd(st); ty = r < .5 ? 'car' : r < .66 ? 'taxi' : r < .88 ? 'moto' : 'feeder'; }
      st.veh.push({ id: st.nid++, l: L.i, s: -VTYPE[ty].len / 2, v: VTYPE[ty].v * .8, ty, col: ty === 'taxi' ? '#f2c400' : CARCOL[(this.rnd(st) * CARCOL.length) | 0], w: 0, dw: 0, sn: this.rnd(st) < (VTYPE[ty].sneak || 0) });
      const tl = st.t / 90; L.next = (L.bus ? st.mpr : st.rate) * (1 - .3 * Math.min(1, tl)) * (.7 + this.rnd(st) * .6) * (L.bus ? 1 : 1 + .25 * (st.lanes.filter(q => !q.bus).length / 4 - 1));
    }
    // movimiento
    const byLane = {}; for (const v of st.veh) (byLane[v.l] || (byLane[v.l] = [])).push(v);
    for (const k in byLane) byLane[k].sort((a, b) => b.s - a.s);
    for (const k in byLane) {
      const arr = byLane[k], L = st.lanes[k], xs = this.xOnLane(st, L);
      for (let i = 0; i < arr.length; i++) {
        const v = arr[i], T = VTYPE[v.ty], front = v.s + T.len / 2; let vmax = T.v;
        if (i > 0) { const ld = arr[i - 1], gap = (ld.s - VTYPE[ld.ty].len / 2) - front - .35; vmax = Math.min(vmax, Math.max(0, gap * 2.2)); }
        for (const x of xs) {
          if (front > x.a - .05) continue; const d = x.a - .25 - front;
          if (!this.green(x.X, L.ax)) { const stopD = v.v * v.v / (2 * T.a * 1.6); if (d > stopD - .15 || v.v < .3) { if (!(v.sn && x.X.y0 > 0)) vmax = Math.min(vmax, Math.max(0, Math.sqrt(Math.max(0, 2 * T.a * 1.4 * d)))); } }
          break;
        }
        // parada de Metroplús
        if (v.ty === 'mp') for (const sp of st.stops) { const ss = L.d > 0 ? sp : L.len - sp, d = ss - v.s; if (!v.done || !v.done.includes(sp)) { if (d > 0 && d < 3) vmax = Math.min(vmax, Math.sqrt(2 * T.a * d)); if (Math.abs(d) < .15) { v.dw += dt; vmax = 0; if (v.dw > 1.4) { (v.done || (v.done = [])).push(sp); v.dw = 0; st.score += 20; } } } }
        v.v = v.v < vmax ? Math.min(vmax, v.v + T.a * dt) : Math.max(vmax, v.v - T.a * 2.4 * dt);
        v.s += v.v * dt; v.w = v.v < .1 ? v.w + dt : Math.max(0, v.w - dt * 2);
        if (v.w > 12 && !v.honk) { v.honk = 1; st.fx.push(Object.assign({ k: 'honk', t: 1.2, s: '¡Piii!' }, this.vpos(st, v))); this.sfx(st, 'horn'); }
        if (v.s - T.len / 2 > L.len) { v.out = true; st.score += T.p; if (v.ty === 'mp') { st.buses++; st.fx.push(Object.assign({ k: 'pts', t: 1.2, s: '+100' }, this.vpos(st, v))); this.sfx(st, 'coin'); } }
      }
    }
    // choques dentro de los cruces (ejes distintos)
    for (const X of st.X) {
      const inX = st.veh.filter(v => { if (v.out || v.dead) return false; const p = this.vpos(st, v), T = VTYPE[v.ty], hx = (st.lanes[v.l].ax === 'h' ? T.len : T.wid) / 2, hy = (st.lanes[v.l].ax === 'h' ? T.wid : T.len) / 2; v._b = [p.x - hx, p.y - hy, p.x + hx, p.y + hy]; return v._b[2] > X.x - X.hw && v._b[0] < X.x + X.hw && v._b[3] > X.y - X.hh && v._b[1] < X.y + X.hh; });
      for (let a = 0; a < inX.length; a++) for (let b = a + 1; b < inX.length; b++) {
        const A = inX[a], B = inX[b]; if (st.lanes[A.l].ax === st.lanes[B.l].ax) continue;
        if (A._b[0] < B._b[2] && A._b[2] > B._b[0] && A._b[1] < B._b[3] && A._b[3] > B._b[1]) { A.dead = B.dead = true; st.crashes++; st.lives--; const p = this.vpos(st, A); st.fx.push({ k: 'boom', x: p.x, y: p.y, t: 1.2 }); this.sfx(st, 'crash'); if (Game.st === st) vib(160); }
      }
    }
    st.veh = st.veh.filter(v => !v.out && !v.dead);
    for (const f of st.fx) f.t -= dt; st.fx = st.fx.filter(f => f.t > 0);
    if (!st.inf && st.buses >= st.goal) { st.done = true; st.win = true; st.score += st.lives * 150; }
    if (st.lives <= 0) { st.done = true; st.win = st.inf && st.buses >= st.goal; }
  },
  edge(st, L) { return L.ax === 'h' ? { x: L.d > 0 ? 1 : st.W - 1, y: L.c } : { x: L.c, y: L.d > 0 ? 1 : st.H - 1 }; },
  sfx(st, k) { if (!EM.headless && (Game.st === st || Game.st2 === st)) Snd.play(k); },
  act(st, a) { if (!a || a.k !== 'x') return; const X = st.X[a.i]; if (!X || X.y0 > 0) return; X.pend = X.g === 'h' ? 'v' : 'h'; X.g = 'y'; X.y0 = .7; this.sfx(st, 'switch'); },
  result(st) { return { done: st.done, win: st.win, score: st.score, stars: st.win ? starsOf(st.lives / 3 * .9 + .1) : 0, lines: [['Buses Metroplús', st.buses + ' / ' + st.goal], ['Choques', st.crashes], ['Trancones', st.jams]], fact: this.LV[st.idx].f || '' }; },
  hud(st) { return [['🚌', st.buses + '/' + st.goal], ['♥', Math.max(0, st.lives)], ['★', fmt(st.score)]]; },
  geo(st, vp) { const cs = Math.min(vp.w / st.W, vp.h / st.H); return { cs, ox: (vp.w - cs * st.W) / 2, oy: (vp.h - cs * st.H) / 2 }; },
  pointer(st, type, x, y, vp) { if (type !== 'down' || st.done) return null; const G = this.geo(st, vp), gx = (x - G.ox) / G.cs, gy = (y - G.oy) / G.cs; let best = -1, bd = 4; st.X.forEach((X, i) => { const d = Math.hypot(X.x - gx, X.y - gy); if (d < bd) { bd = d; best = i; } }); return best < 0 ? null : { k: 'x', i: best }; },
  draw(g, st, vp) {
    const G = this.geo(st, vp), cs = G.cs, X = x => G.ox + x * cs, Y = y => G.oy + y * cs, mpc = (NET.byId.MP1 || NET.byId.MP2 || {}).color || '#7ab648';
    g.fillStyle = '#c8201f'; g.fillRect(0, 0, vp.w, vp.h);
    g.fillStyle = '#d9cdae'; g.fillRect(X(0), Y(0), cs * st.W, cs * st.H);
    // manzanas con techos
    for (let by = 0; by < st.H; by += 1) for (let bx = 0; bx < st.W; bx += 1) { const onRoad = st.roads.some(r => r.ax === 'h' ? Math.abs(by + .5 - r.c) < r.hw + .6 : Math.abs(bx + .5 - r.c) < r.hw + .6); if (onRoad) continue; const h = h2(bx, by, st.idx); if (h < .7) { g.fillStyle = PAL.negro; g.fillRect(X(bx) + 1, Y(by) + 1, cs - 2, cs - 2); g.fillStyle = h < .4 ? PAL.ladrillo : h < .55 ? '#8d97a4' : '#b8b0a0'; g.fillRect(X(bx) + 2, Y(by) + 2, cs - 4, cs - 4); g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(X(bx) + 2, Y(by) + cs * .55, cs - 4, cs * .45 - 2); } else { Art.tree(g, X(bx + .5), Y(by + .9), cs * .8, false); } }
    // vías
    for (const r of st.roads) {
      g.fillStyle = '#3f444d'; if (r.ax === 'h') g.fillRect(X(0), Y(r.c - r.hw), cs * st.W, cs * r.hw * 2); else g.fillRect(X(r.c - r.hw), Y(0), cs * r.hw * 2, cs * st.H);
      if (r.mp) { g.fillStyle = mpc + '55'; if (r.ax === 'h') g.fillRect(X(0), Y(r.c - 1), cs * st.W, cs * 2); else g.fillRect(X(r.c - 1), Y(0), cs * 2, cs * st.H); }
      g.fillStyle = PAL.mante; const L = r.ax === 'h' ? st.W : st.H;
      for (let s = 0; s < L; s += 1) { if (r.ax === 'h') { g.fillRect(X(s), Y(r.c) - 1, cs * .5, 2); if (r.mp) { g.fillStyle = '#fff'; g.fillRect(X(s), Y(r.c - 1) - 1, cs * .5, 2); g.fillRect(X(s), Y(r.c + 1) - 1, cs * .5, 2); g.fillStyle = PAL.mante; } } else { g.fillRect(X(r.c) - 1, Y(s), 2, cs * .5); if (r.mp) { g.fillStyle = '#fff'; g.fillRect(X(r.c - 1) - 1, Y(s), 2, cs * .5); g.fillRect(X(r.c + 1) - 1, Y(s), 2, cs * .5); g.fillStyle = PAL.mante; } } }
    }
    // estaciones de Metroplús (separador central)
    const mpRoad = st.roads.find(r => r.mp); if (mpRoad) for (const sp of st.stops) { g.fillStyle = PAL.negro; if (mpRoad.ax === 'h') { g.fillRect(X(sp - 1.6), Y(mpRoad.c) - cs * .22, cs * 3.2, cs * .44); g.fillStyle = mpc; g.fillRect(X(sp - 1.5), Y(mpRoad.c) - cs * .16, cs * 3, cs * .32); } else { g.fillRect(X(mpRoad.c) - cs * .22, Y(sp - 1.6), cs * .44, cs * 3.2); g.fillStyle = mpc; g.fillRect(X(mpRoad.c) - cs * .16, Y(sp - 1.5), cs * .32, cs * 3); } }
    // cruces: cebras y semáforo central tocable
    for (const [i, Xx] of st.X.entries()) {
      g.fillStyle = '#4a4f58'; g.fillRect(X(Xx.x - Xx.hw), Y(Xx.y - Xx.hh), cs * Xx.hw * 2, cs * Xx.hh * 2);
      g.fillStyle = 'rgba(255,255,255,.75)'; for (let k = -Xx.hw; k < Xx.hw; k += .5) { g.fillRect(X(Xx.x + k + .1), Y(Xx.y - Xx.hh - .55), cs * .25, cs * .45); g.fillRect(X(Xx.x + k + .1), Y(Xx.y + Xx.hh + .1), cs * .25, cs * .45); } for (let k = -Xx.hh; k < Xx.hh; k += .5) { g.fillRect(X(Xx.x - Xx.hw - .55), Y(Xx.y + k + .1), cs * .45, cs * .25); g.fillRect(X(Xx.x + Xx.hw + .1), Y(Xx.y + k + .1), cs * .45, cs * .25); }
      const r = cs * .62, cx = X(Xx.x), cy = Y(Xx.y);
      g.fillStyle = PAL.negro; g.beginPath(); g.arc(cx, cy, r + 3, 0, TAU); g.fill();
      g.fillStyle = Xx.g === 'y' ? '#ffc23a' : PAL.blanco; g.beginPath(); g.arc(cx, cy, r, 0, TAU); g.fill();
      g.strokeStyle = Xx.g === 'y' ? PAL.negro : '#2f9b57'; g.lineWidth = Math.max(3, cs * .14); g.lineCap = 'round'; g.beginPath(); if (Xx.g === 'h') { g.moveTo(cx - r * .6, cy); g.lineTo(cx + r * .6, cy); } else if (Xx.g === 'v') { g.moveTo(cx, cy - r * .6); g.lineTo(cx, cy + r * .6); } g.stroke();
      // luces pequeñas en las esquinas
      const lc = ax => Xx.g === ax ? '#38e07b' : Xx.g === 'y' ? '#ffc23a' : '#ff3b2f';
      for (const [dx, dy, ax] of [[-1, -1, 'v'], [1, 1, 'v'], [1, -1, 'h'], [-1, 1, 'h']]) { const lx = X(Xx.x + dx * (Xx.hw + .35)), ly = Y(Xx.y + dy * (Xx.hh + .35)); g.fillStyle = PAL.negro; g.fillRect(lx - cs * .14, ly - cs * .14, cs * .28, cs * .28); g.fillStyle = lc(ax); g.fillRect(lx - cs * .09, ly - cs * .09, cs * .18, cs * .18); }
    }
    // vehículos
    for (const v of st.veh) {
      const p = this.vpos(st, v), T = VTYPE[v.ty]; g.save(); g.translate(X(p.x), Y(p.y)); g.rotate(p.a); const L = T.len * cs, Wd = T.wid * cs;
      g.fillStyle = PAL.negro; g.fillRect(-L / 2 - 1.5, -Wd / 2 - 1.5, L + 3, Wd + 3);
      if (v.ty === 'mp') { g.fillStyle = mpc; g.fillRect(-L / 2, -Wd / 2, L * .48, Wd); g.fillRect(-L / 2 + L * .52, -Wd / 2, L * .48, Wd); g.fillStyle = '#f4f1ea'; g.fillRect(-L / 2 + 2, -Wd * .25, L * .44, Wd * .5); g.fillRect(-L / 2 + L * .54, -Wd * .25, L * .44, Wd * .5); g.fillStyle = PAL.negro; g.fillRect(-1, -Wd / 2, 2, Wd); }
      else if (v.ty === 'moto') { g.fillStyle = '#222'; g.fillRect(-L / 2, -Wd / 2, L, Wd); g.fillStyle = v.col; g.beginPath(); g.arc(0, 0, Wd * .55, 0, TAU); g.fill(); }
      else { g.fillStyle = v.ty === 'feeder' ? '#f4f1ea' : v.col; g.fillRect(-L / 2, -Wd / 2, L, Wd); g.fillStyle = v.ty === 'feeder' ? PAL.naranja : 'rgba(20,30,40,.55)'; g.fillRect(L * .12, -Wd / 2 + 2, L * .2, Wd - 4); if (v.ty === 'feeder') g.fillRect(-L / 2, -Wd * .12, L, Wd * .24); }
      g.fillStyle = '#fff6c0'; g.fillRect(L / 2 - 2, -Wd / 2 + 1, 2, 2); g.fillRect(L / 2 - 2, Wd / 2 - 3, 2, 2);
      g.restore();
    }
    // efectos
    g.textAlign = 'center';
    for (const f of st.fx) { const a = clamp(f.t, 0, 1); if (f.k === 'boom') { g.fillStyle = 'rgba(255,106,61,' + a + ')'; g.beginPath(); g.arc(X(f.x), Y(f.y), cs * (1.6 - a * .8), 0, TAU); g.fill(); } else { g.font = '700 ' + (cs * .7) + 'px Titulos, sans-serif'; g.fillStyle = PAL.negro; g.fillText(f.s, X(f.x) + 1, Y(f.y - (1.2 - a) * 1.5) + 1); g.fillStyle = f.k === 'bad' ? PAL.rojo : f.k === 'honk' ? PAL.mante : '#fff'; g.fillText(f.s, X(f.x), Y(f.y - (1.2 - a) * 1.5)); } }
    g.textAlign = 'left';
  },
  /* bot: da el verde al eje con más espera, con prioridad para Metroplús y sin cambiar si un vehículo está dentro */
  ai(st) {
    for (const [i, X] of st.X.entries()) {
      if (X.y0 > 0) continue; let wH = 0, wV = 0, busy = false;
      for (const v of st.veh) { const L = st.lanes[v.l], p = this.vpos(st, v), d = Math.hypot(p.x - X.x, p.y - X.y); if (d < Math.max(X.hw, X.hh) + .8 && v.v > .2) busy = true; if (d < 6) { const w = (v.w + .5) * (v.ty === 'mp' ? 3 : 1); if (L.ax === 'h') wH += w; else wV += w; } }
      if (busy) continue; const want = wH > wV * 1.4 ? 'h' : wV > wH * 1.4 ? 'v' : X.g; if (want !== X.g) return { k: 'x', i };
    }
    return null;
  }
};
