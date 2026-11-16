/* =====================================================================
   MODO METROCABLE: arma la línea en la ladera girando las piezas
   (estaciones, cable, poleas y torres) hasta que todo quede conectado.
   Al cerrar la red, las cabinas empiezan a rodar. Puzles generados y siempre con solución.
   ===================================================================== */
const rotM = m => ((m << 1) | (m >> 3)) & 15;
const Cable = EM.modes.cable = {
  id: 'cable', name: 'Metrocable', sub: 'Arma la línea en la loma', music: 'puzzle',
  tip: 'Toca una pieza para girarla. Conecta todas las estaciones, cables y torres sin dejar puntas sueltas.',
  SIZES: [[4, 5, .8], [5, 6, .78], [5, 7, .8], [6, 8, .8], [7, 9, .82]],
  levels() {
    if (this._lv) return this._lv; const L = [];
    for (const line of NET.lines.filter(l => l.kind === 'cable')) for (let k = 0; k < this.SIZES.length; k++) { const a = line.st[Math.min(k, line.st.length - 2)], b = line.st[Math.min(k + 1, line.st.length - 1)]; L.push({ id: 'cb:' + line.id + ':' + k, line: line.id, k, name: line.name.replace('Metrocable ', '') + ' · ' + (k + 1), sub: a.name + ' → ' + b.name }); }
    if (!L.length) for (let k = 0; k < 5; k++) L.push({ id: 'cb:X:' + k, line: 'X', k, name: 'Cable ' + (k + 1), sub: '' });
    return (this._lv = L);
  },
  create(lv, opts) {
    const L = this.levels().find(l => l.id === lv) || this.levels()[0], [W, H, dens] = this.SIZES[L.k], rng = new RNG(hashStr(L.id) + 17);
    const n = W * H, inT = new Uint8Array(n), mask = new Uint8Array(n), I = (x, y) => y * W + x, front = [];
    const start = I(rng.i(0, W - 1), rng.i(0, H - 1)); inT[start] = 1; let count = 1;
    const addF = i => { const x = i % W, y = i / W | 0; for (const d of DIRS) { const [dx, dy] = DXY[d], nx = x + dx, ny = y + dy; if (nx >= 0 && ny >= 0 && nx < W && ny < H && !inT[I(nx, ny)]) front.push([i, I(nx, ny), d]); } };
    addF(start);
    while (front.length && count < n * dens) { const k = rng.i(0, front.length - 1), [a, b, d] = front.splice(k, 1)[0]; if (inT[b]) continue; inT[b] = 1; count++; mask[a] |= d; mask[b] |= OPP[d]; addF(b); }
    // algunos lazos extra (más torres)
    for (let i = 0; i < n; i++) { if (!inT[i]) continue; const x = i % W, y = i / W | 0; for (const d of [DE, DS]) { const [dx, dy] = DXY[d], j = I(x + dx, y + dy); if (x + dx < W && y + dy < H && inT[j] && !(mask[i] & d) && rng.f() < .08 + L.k * .02) { mask[i] |= d; mask[j] |= OPP[d]; } } }
    const sol = Array.from(mask), m = sol.slice(); let par = 0;
    for (let i = 0; i < n; i++) { if (!m[i] || m[i] === 15) continue; const r = rng.i(0, 3); for (let k = 0; k < r; k++) m[i] = rotM(m[i]); let q = m[i], c = 0; while (q !== sol[i] && c < 4) { q = rotM(q); c++; } par += c; }
    if (par === 0) { const i = sol.findIndex(v => v && v !== 15 && v !== 5 && v !== 10); if (i >= 0) { m[i] = rotM(m[i]); par = 3; } }
    return { lvId: L.id, line: L.line, k: L.k, W, H, m, sol, ra: new Array(n).fill(0), moves: 0, par, t: 0, done: false, win: false, solvedT: 0, fx: [] };
  },
  solved(st) { const { W, H, m } = st; for (let i = 0; i < m.length; i++) { const v = m[i]; if (!v) continue; const x = i % W, y = i / W | 0; for (const d of DIRS) if (v & d) { const [dx, dy] = DXY[d], nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= W || ny >= H) return false; if (!(m[ny * W + nx] & OPP[d])) return false; } } return true; },
  step(st, dt) {
    st.t += dt; for (let i = 0; i < st.ra.length; i++) if (st.ra[i]) { st.ra[i] *= Math.pow(.0005, dt); if (Math.abs(st.ra[i]) < .01) st.ra[i] = 0; }
    if (st.win && !st.done) { st.solvedT += dt; if (st.solvedT > 2.2) st.done = true; }
    for (const f of st.fx) f.t -= dt; st.fx = st.fx.filter(f => f.t > 0);
  },
  act(st, a) {
    if (!a || a.k !== 'rot' || st.win) return; const v = st.m[a.i]; if (!v || v === 15) return;
    st.m[a.i] = rotM(v); st.ra[a.i] = -Math.PI / 2; st.moves++; if (!EM.headless && (Game.st === st || Game.st2 === st)) Snd.play('rot');
    if (this.solved(st)) { st.win = true; st.solvedT = 0; if (!EM.headless && (Game.st === st || Game.st2 === st)) { Snd.play('win'); vib(60); } for (let k = 0; k < 40; k++) st.fx.push({ x: Math.random() * st.W, y: Math.random() * st.H * .5, vx: (Math.random() - .5) * 2, vy: Math.random() * 2 + 1, c: ROPA[k % ROPA.length], t: 2 }); }
  },
  result(st) {
    const line = NET.byId[st.line], score = st.win ? Math.max(100, 1000 - Math.max(0, st.moves - st.par) * 25) : 0, frac = st.par / Math.max(st.par, st.moves);
    const stn = line && line.st[Math.min(st.k + 1, line.st.length - 1)];
    return { done: st.done, win: st.win, score, stars: st.win ? (st.moves <= st.par * 1.25 + 1 ? 3 : st.moves <= st.par * 2 + 2 ? 2 : 1) : 0, lines: [['Giros', st.moves + ' (ideal ' + st.par + ')']], fact: stn ? (NET.fact(stn.name) || (line.facts || [])[st.k % Math.max(1, (line.facts || []).length)] || '') : '' };
  },
  hud(st) { return [['↻', st.moves], ['ideal', st.par]]; },
  geo(st, vp) { const m = Math.min(vp.w, vp.h) * .06, cs = Math.min((vp.w - 2 * m) / st.W, (vp.h - 2 * m - vp.h * .08) / st.H); return { cs, ox: (vp.w - cs * st.W) / 2, oy: (vp.h - cs * st.H) / 2 + vp.h * .04 }; },
  pointer(st, type, x, y, vp) { if (type !== 'down' || st.win) return null; const G = this.geo(st, vp), gx = Math.floor((x - G.ox) / G.cs), gy = Math.floor((y - G.oy) / G.cs); if (gx < 0 || gy < 0 || gx >= st.W || gy >= st.H) return null; const i = gy * st.W + gx; return st.m[i] ? { k: 'rot', i } : null; },
  draw(g, st, vp) {
    const G = this.geo(st, vp), cs = G.cs, line = NET.byId[st.line], col = line ? line.color : '#f2a900';
    // ladera: fondo mostaza, montaña, casas de ladrillo
    g.fillStyle = '#F6C538'; g.fillRect(0, 0, vp.w, vp.h);
    g.fillStyle = '#d9a52a'; g.beginPath(); g.moveTo(0, vp.h); for (let x = 0; x <= vp.w; x += 8) g.lineTo(x, vp.h * .25 + Math.sin(x * .01 + st.k) * vp.h * .06 + Math.sin(x * .031) * vp.h * .02); g.lineTo(vp.w, vp.h); g.fill();
    for (let y = 0; y < st.H; y++) for (let x = 0; x < st.W; x++) { const i = y * st.W + x, X0 = G.ox + x * cs, Y0 = G.oy + y * cs; if (!st.m[i]) { for (let k = 0; k < 4; k++) { const hh = h2(x * 4 + k, y, st.k); Art.building(g, X0 + cs * (.05 + (k % 2) * .48), Y0 + cs * (k < 2 ? .1 : .55), cs * .42, cs * (.25 + hh * .15), i * 4 + k, false, hh < .75); } } else { g.fillStyle = 'rgba(255,255,255,.12)'; g.fillRect(X0 + 1, Y0 + 1, cs - 2, cs - 2); } }
    const conn = this.solved(st) || st.win;
    for (let i = 0; i < st.m.length; i++) {
      const v = st.m[i]; if (!v) continue; const x = i % st.W, y = i / st.W | 0, cx = G.ox + (x + .5) * cs, cy = G.oy + (y + .5) * cs, b = bitsOf(v);
      g.save(); g.translate(cx, cy); g.rotate(st.ra[i]);
      const cab = st.win ? col : PAL.negro, w = Math.max(2, cs * .06);
      // cable (doble línea) hacia cada lado conectado
      for (const d of b) { const [dx, dy] = DXY[d]; g.strokeStyle = cab; g.lineWidth = w; g.beginPath(); g.moveTo(-dy * cs * .07, dx * cs * .07); g.lineTo(dx * cs * .5 - dy * cs * .07, dy * cs * .5 + dx * cs * .07); g.moveTo(dy * cs * .07, -dx * cs * .07); g.lineTo(dx * cs * .5 + dy * cs * .07, dy * cs * .5 - dx * cs * .07); g.stroke(); }
      if (b.length === 1) { // estación
        g.fillStyle = PAL.negro; g.fillRect(-cs * .3, -cs * .26, cs * .6, cs * .52); g.fillStyle = PAL.blanco; g.fillRect(-cs * .26, -cs * .22, cs * .52, cs * .44); g.fillStyle = col; g.fillRect(-cs * .3, -cs * .3, cs * .6, cs * .12); g.fillStyle = PAL.vidrio; g.fillRect(-cs * .18, -cs * .1, cs * .36, cs * .14);
      } else if (b.length >= 3) { // torre
        g.strokeStyle = PAL.negro; g.lineWidth = Math.max(1.5, cs * .04); g.strokeRect(-cs * .14, -cs * .14, cs * .28, cs * .28); g.beginPath(); g.moveTo(-cs * .14, -cs * .14); g.lineTo(cs * .14, cs * .14); g.moveTo(cs * .14, -cs * .14); g.lineTo(-cs * .14, cs * .14); g.stroke();
      } else if (b[0] !== OPP[b[1]]) { // polea en las curvas
        g.fillStyle = PAL.negro; g.beginPath(); g.arc(0, 0, cs * .14, 0, TAU); g.fill(); g.fillStyle = PAL.gris; g.beginPath(); g.arc(0, 0, cs * .08, 0, TAU); g.fill();
      }
      g.restore();
    }
    // cabinas rodando cuando la línea está completa
    if (st.win) for (let i = 0; i < st.m.length; i++) { const v = st.m[i]; if (!(v & DE) && !(v & DS)) continue; for (const d of [DE, DS]) { if (!(v & d)) continue; const x = i % st.W, y = i / st.W | 0, [dx, dy] = DXY[d], f = (st.t * .8 + h2(i, d, 1)) % 1; Art.cabin(g, G.ox + (x + .5 + dx * f) * cs, G.oy + (y + .5 + dy * f) * cs + cs * .1, Math.max(1, cs / 26), col); } }
    if (!EM.headless) Mundo.overlay(g, vp.w, vp.h, st.t, { soft: true });
    for (const f of st.fx) { g.fillStyle = f.c; g.fillRect(G.ox + (f.x + f.vx * (2 - f.t)) * cs, G.oy + (f.y + f.vy * (2 - f.t) * 2) * cs, cs * .12, cs * .2); }
    g.fillStyle = PAL.blanco; g.font = '700 ' + Math.max(18, vp.h * .05) + 'px Titulos, sans-serif'; g.fillText((line ? line.name : 'Metrocable').toUpperCase(), 12, Math.max(24, vp.h * .06));
    if (st.win) { g.fillStyle = PAL.negro; g.font = '700 ' + Math.max(26, vp.h * .08) + 'px Titulos, sans-serif'; g.textAlign = 'center'; g.fillText('¡LÍNEA EN SERVICIO!', vp.w / 2 + 2, vp.h * .5 + 2); g.fillStyle = PAL.blanco; g.fillText('¡LÍNEA EN SERVICIO!', vp.w / 2, vp.h * .5); g.textAlign = 'left'; }
  },
  ai(st) { if (st.win) return null; for (let i = 0; i < st.m.length; i++) if (st.m[i] && st.m[i] !== st.sol[i] && st.m[i] !== 15) return { k: 'rot', i }; return null; }
};
