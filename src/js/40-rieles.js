/* =====================================================================
   MOTOR DE AGUJAS (rejilla): DESPACHO y ALIMENTADORES
   · Despacho (Puesto de Control): trenes por colores, toca las agujas para llevarlos a su andén. Choque = −1 vida.
   · Alimentadores: buses de los barrios a las estaciones; cada estación pide un color que cambia al llenarse.
   Celdas con conexiones N=1 E=2 S=4 O=8. Los cruces de 3 vías se clasifican solos (desvío o unión) por BFS.
   El estado es JSON puro: sirve para el cooperativo en red y para el bot.
   ===================================================================== */
const DN = 1, DE = 2, DS = 4, DW = 8, DIRS = [DN, DE, DS, DW], DXY = { 1: [0, -1], 2: [1, 0], 4: [0, 1], 8: [-1, 0] }, OPP = { 1: 4, 2: 8, 4: 1, 8: 2 };
const bitsOf = m => DIRS.filter(d => m & d);
const DALT = ['#0072B2', '#E69F00', '#009E73', '#F0E442', '#CC79A7', '#56B4E9', '#D55E00', '#000000'];
const LCOL = () => { if (Save.d && Save.d.settings.dalt) return DALT.map((c, i) => ({ c, l: ['A', 'B', 'T', 'K', 'P', 'H', 'J', 'M'][i] })); const ids = ['A', 'B', 'T', 'K', 'P', 'H', 'J', 'M']; return ids.map((id, i) => { const l = NET.byId[id]; return { c: l ? l.color : ['#1f63ad', '#f08a1c', '#2f9b57', '#f2a900', '#d14b9a', '#7a5cc4', '#e8641f', '#00a3a0'][i], l: id }; }); };
const Rail = {
  /* genera una red ramificada: troncos verticales desde arriba, desvíos, cruces y uniones */
  gen(p, seed) {
    const rng = new RNG(seed), W = p.W, H = p.H, occ = new Int8Array(W * H), mask = new Uint8Array(W * H), kind = new Uint8Array(W * H), I = (x, y) => y * W + x;
    const link = (a, b, d) => { mask[a] |= d; mask[b] |= OPP[d]; };
    const spawns = [], exits = [], sw = {};
    const xs = []; for (let s = 0; s < p.sp; s++) xs.push(clamp(Math.round((s + 1) * W / (p.sp + 1)) + rng.i(-1, 0), 0, W - 1));
    for (let s = 0; s < xs.length; s++) { if (xs.indexOf(xs[s]) !== s) xs[s] = clamp(xs[s] + 1, 0, W - 1); }
    for (const x of [...new Set(xs)]) {
      for (let y = 0; y < H - 1; y++) { link(I(x, y), I(x, y + 1), DS); occ[I(x, y)] = 1; }
      occ[I(x, 0)] = 5; occ[I(x, H - 1)] = 5; kind[I(x, 0)] = 2; kind[I(x, H - 1)] = 3; spawns.push(I(x, 0)); exits.push(I(x, H - 1));
    }
    let br = 0, mg = 0;
    for (let tries = 0; tries < 400 && br < p.br; tries++) {
      const x = rng.i(0, W - 1), r = rng.i(1, H - 3), i = I(x, r);
      if (occ[i] !== 1 || occ[I(x, r - 1)] === 3 || occ[I(x, r + 1)] === 3 || mask[i] !== (DN | DS)) continue;
      const d = rng.f() < .5 ? -1 : 1, wantMerge = p.mg && mg < p.mg && rng.f() < .45;
      let ok = false, x2 = x + d, cross = [];
      for (; x2 >= 0 && x2 < W; x2 += d) {
        const j = I(x2, r);
        if (wantMerge && occ[j] === 1 && mask[j] === (DN | DS) && Math.abs(x2 - x) > 1 && occ[I(x2, r - 1)] !== 3 && occ[I(x2, r + 1)] !== 3) { ok = 'm'; break; }
        if (occ[j] === 0) { let free = true; for (let y = r; y < H; y++) if (occ[I(x2, y)] !== 0) { free = false; break; } if (free && !(exits.some(e => Math.abs(e % W - x2) < 1))) { ok = 'b'; break; } continue; }
        if (p.cross && occ[j] === 1 && mask[j] === (DN | DS) && occ[I(x2, r - 1)] !== 3 && occ[I(x2, r + 1)] !== 3 && occ[I(x2, r - 1)] !== 4 && occ[I(x2, r + 1)] !== 4) { cross.push(j); continue; }
        break;
      }
      if (!ok) continue;
      // trazar
      for (let xx = x; xx !== x2; xx += d) link(I(xx, r), I(xx + d, r), d > 0 ? DE : DW);
      for (let xx = x + d; xx !== x2; xx += d) { const j = I(xx, r); occ[j] = cross.includes(j) ? 4 : 2; }
      occ[i] = 3; sw[i] = { trunk: DN, merge: false, opts: [DS, d > 0 ? DE : DW], s: 0 };
      if (ok === 'm') { occ[I(x2, r)] = 3; sw[I(x2, r)] = { trunk: DS, merge: true, opts: [], s: 0 }; mg++; }
      else { for (let y = r; y < H - 1; y++) { link(I(x2, y), I(x2, y + 1), DS); occ[I(x2, y)] = y === r ? 2 : 1; } occ[I(x2, H - 1)] = 5; kind[I(x2, H - 1)] = 3; exits.push(I(x2, H - 1)); br++; }
    }
    for (let k = 0; k < W * H; k++) if (mask[k] && !kind[k]) kind[k] = 1;
    return { W, H, mask: Array.from(mask), kind: Array.from(kind), spawns, exits, sw };
  },
  next(st, i, d) { const [dx, dy] = DXY[d], x = i % st.W + dx, y = (i / st.W | 0) + dy; return x < 0 || y < 0 || x >= st.W || y >= st.H ? -1 : y * st.W + x; },
  /* clasifica cada celda de 3 vías: desvío (una entrada) o unión (dos entradas) */
  classify(st) {
    if (st.sw && Object.keys(st.sw).length) { st.swl = Object.keys(st.sw).map(Number).filter(i => !st.sw[i].merge); return; }
    const seen = new Set(), inflow = {}, q = [];
    for (const s of st.spawns) { const out = bitsOf(st.mask[s])[0]; q.push([s, OPP[out]]); }
    while (q.length) {
      const [i, from] = q.shift(), key = i * 16 + from; if (seen.has(key)) continue; seen.add(key);
      const m = st.mask[i], b = bitsOf(m); let outs;
      if (b.length === 3) { (inflow[i] || (inflow[i] = new Set())).add(from); outs = b.filter(d => d !== from); }
      else if (b.length === 4) outs = [OPP[from]];
      else outs = b.filter(d => d !== from);
      if (st.kind[i] === 3 && i !== st.spawns.find(s => s === i)) continue;
      for (const d of outs) { const j = this.next(st, i, d); if (j >= 0 && (st.mask[j] & OPP[d])) q.push([j, OPP[d]]); }
    }
    st.sw = {}; st.swl = [];
    for (let i = 0; i < st.mask.length; i++) {
      const b = bitsOf(st.mask[i]); if (b.length !== 3) continue; const inf = inflow[i] ? [...inflow[i]] : [b[0]];
      if (inf.length >= 2) { const out = b.find(d => !inf.includes(d)) || b[0]; st.sw[i] = { trunk: out, merge: true, opts: [], s: 0 }; }
      else { const tr = inf[0], o = b.filter(d => d !== tr); st.sw[i] = { trunk: tr, merge: false, opts: o, s: 0 }; st.swl.push(i); }
    }
  },
  route(st, i, from) {
    const m = st.mask[i], b = bitsOf(m);
    if (b.length === 2) return b[0] === from ? b[1] : b[0];
    if (b.length === 4) return OPP[from];
    if (b.length === 3) { const w = st.sw[i]; if (!w) return b.find(d => d !== from); if (w.merge) return from === w.trunk ? b.find(d => d !== from) : w.trunk; return from === w.trunk ? w.opts[w.s] : w.trunk; }
    return b[0] || -1;
  },
  /* colores alcanzables desde una celda en una dirección (BFS por todas las ramas) */
  reach(st, i, from) {
    const out = new Set(), seen = new Set(), q = [[i, from]];
    while (q.length) {
      const [c, f] = q.shift(), key = c * 16 + f; if (seen.has(key)) continue; seen.add(key);
      if (st.kind[c] === 3) { out.add(c); continue; }
      const b = bitsOf(st.mask[c]); let outs;
      if (b.length === 3) { const w = st.sw[c]; outs = w && !w.merge && f === w.trunk ? w.opts : w ? [w.merge ? (f === w.trunk ? b.find(d => d !== f) : w.trunk) : w.trunk] : b.filter(d => d !== f); }
      else if (b.length === 4) outs = [OPP[f]]; else outs = b.filter(d => d !== f);
      for (const d of outs) { const j = this.next(st, c, d); if (j >= 0 && (st.mask[j] & OPP[d])) q.push([j, OPP[d]]); }
    }
    return out;
  },
  pos(st, e) {
    const x = e.i % st.W, y = e.i / st.W | 0, mid = d => d === DN ? [x + .5, y] : d === DE ? [x + 1, y + .5] : d === DS ? [x + .5, y + 1] : [x, y + .5];
    const a = mid(e.from), c = [x + .5, y + .5], b = e.to > 0 ? mid(e.to) : c, t = e.p, u = 1 - t;
    const px = u * u * a[0] + 2 * u * t * c[0] + t * t * b[0], py = u * u * a[1] + 2 * u * t * c[1] + t * t * b[1];
    const tx = 2 * u * (c[0] - a[0]) + 2 * t * (b[0] - c[0]), ty = 2 * u * (c[1] - a[1]) + 2 * t * (b[1] - c[1]);
    return { x: px, y: py, a: Math.atan2(ty, tx) };
  }
};
function railMode(cfg) {
  return {
    id: cfg.id, name: cfg.name, sub: cfg.sub, music: cfg.music, tip: cfg.tip, LV: cfg.LV,
    levels() { return this.LV.map((l, i) => ({ id: cfg.id + i, name: l.n, sub: l.s || '', i })); },
    create(lv, opts) {
      const idx = clamp(parseInt(String(lv).replace(cfg.id, ''), 10) || 0, 0, this.LV.length - 1), P = this.LV[idx], seed = P.seed || (hashStr(cfg.id + idx) & 0xffff);
      let g = Rail.gen(P, seed), tries = 0; while ((g.exits.length < P.ex || g.spawns.length < 1) && tries++ < 30) g = Rail.gen(P, seed + tries * 101);
      const C = LCOL(), st = Object.assign(g, { mode: cfg.id, idx, t: 0, ents: [], nid: 1, delivered: 0, goal: P.goal, lives: P.lives || 3, crashes: 0, wrong: 0, score: 0, combo: 0, done: false, win: false, speed: P.v, rate: P.r, rmin: P.rmin || P.r * .5, fx: [], seed: opts.seed | 0, infinite: !!P.inf });
      Rail.classify(st);
      const nc = Math.min(C.length, P.cols || st.exits.length);
      st.ex = st.exits.map((i, k) => ({ i, col: k % nc, got: 0, cap: P.cap || 0 }));
      st.pal = C.slice(0, nc).map(c => c.c); st.lab = C.slice(0, nc).map(c => c.l);
      st.sp = st.spawns.map((i, k) => ({ i, next: 1 + k * (P.r / st.spawns.length), q: [] }));
      st.rng = (opts.seed | 0) || 1;
      if (cfg.alim) for (const e of st.ex) e.col = this.rnd(st) % nc;
      return st;
    },
    rnd(st) { st.rng = (Math.imul(st.rng ^ (st.rng >>> 15), 2246822507) + 12345) >>> 0; return st.rng; },
    reachCols(st, sp) { const set = new Set(); const all = this.reachEx(st, sp.i); for (const ei of all) { const e = st.ex.find(x => x.i === ei); if (e) set.add(e.col); } return [...set]; },
    reachEx(st, i) {
      // todas las salidas alcanzables desde la celda de aparición sin importar las agujas
      const seen = new Set(), out = new Set(), q = [[i, OPP[bitsOf(st.mask[i])[0]]]];
      while (q.length) { const [c, f] = q.shift(), key = c * 16 + f; if (seen.has(key)) continue; seen.add(key); if (st.kind[c] === 3) { out.add(c); continue; } const b = bitsOf(st.mask[c]); const w = st.sw[c]; let outs = b.length === 4 ? [OPP[f]] : b.length === 3 ? (w && !w.merge && f === w.trunk ? w.opts : [Rail.route(st, c, f)]) : b.filter(d => d !== f); for (const d of outs) { const j = Rail.next(st, c, d); if (j >= 0 && (st.mask[j] & OPP[d])) q.push([j, OPP[d]]); } }
      return out;
    },
    step(st, dt) {
      if (st.done) return; st.t += dt;
      // aparición
      for (const sp of st.sp) {
        if (st.t < sp.next) continue;
        const busy = st.ents.some(e => e.i === sp.i || Rail.next(st, sp.i, bitsOf(st.mask[sp.i])[0]) === e.i && e.p < .4); if (busy) { sp.next = st.t + .3; continue; }
        let cols;
        if (cfg.alim) { const ex = [...this.reachEx(st, sp.i)].map(i => st.ex.find(e => e.i === i)).filter(Boolean); cols = ex.map(e => e.col); }
        else cols = this.reachCols(st, sp);
        if (!cols.length) { sp.next = st.t + 2; continue; }
        const col = cols[this.rnd(st) % cols.length], out = bitsOf(st.mask[sp.i])[0];
        st.ents.push({ id: st.nid++, i: sp.i, from: OPP[out], to: out, p: .5, col, w: 0 });
        const elapsed = st.t / 60; sp.next = st.t + Math.max(st.rmin, st.rate * (1 - .35 * Math.min(1, elapsed + st.delivered / Math.max(8, st.goal)))) * (cfg.alim ? .8 + (this.rnd(st) % 40) / 100 : 1);
      }
      // movimiento
      const v = st.speed * dt;
      for (const e of st.ents) {
        if (cfg.alim) { // cola: se detiene si hay otro bus justo delante
          const me = Rail.pos(st, e); let block = false;
          for (const o of st.ents) { if (o === e) continue; const q = Rail.pos(st, o), dx = q.x - me.x, dy = q.y - me.y, d2 = dx * dx + dy * dy; if (d2 < .5 && (dx * Math.cos(me.a) + dy * Math.sin(me.a)) > .05) { block = true; break; } }
          if (block) { e.w += dt; if (e.w < 2.5) continue; } else e.w = 0;
        }
        e.p += v;
        if (e.p < .35) e.to = Rail.route(st, e.i, e.from);
        while (e.p >= 1 && !e.gone) {
          const j = Rail.next(st, e.i, e.to);
          if (j < 0 || !(st.mask[j] & OPP[e.to])) { e.gone = true; this.crash(st, e, null); break; }
          e.i = j; e.from = OPP[e.to]; e.p -= 1;
          if (st.kind[j] === 3) { e.gone = true; this.arrive(st, e, j); break; }
          e.to = Rail.route(st, j, e.from);
        }
      }
      // choques (solo despacho)
      if (!cfg.alim) {
        const P = st.ents.filter(e => !e.gone).map(e => [e, Rail.pos(st, e)]);
        for (let a = 0; a < P.length; a++) for (let b = a + 1; b < P.length; b++) { const p = P[a][1], q = P[b][1]; if ((p.x - q.x) ** 2 + (p.y - q.y) ** 2 < .3 && !P[a][0].gone && !P[b][0].gone) { P[a][0].gone = P[b][0].gone = true; this.crash(st, P[a][0], P[b][0]); } }
      }
      st.ents = st.ents.filter(e => !e.gone);
      for (const f of st.fx) f.t -= dt; st.fx = st.fx.filter(f => f.t > 0);
      if (!st.infinite && st.delivered >= st.goal) { st.done = true; st.win = true; st.score += st.lives * 150; }
      if (st.lives <= 0) { st.done = true; st.win = st.infinite && st.delivered >= st.goal; }
    },
    arrive(st, e, j) {
      const ex = st.ex.find(x => x.i === j), p = Rail.pos(st, e), ok = ex && ex.col === e.col;
      if (ok) {
        st.delivered++; st.combo++; const pts = 100 + Math.min(10, st.combo) * 10; st.score += pts; st.fx.push({ k: 'pts', x: p.x, y: p.y, t: 1, s: '+' + pts }); this.sfx(st, 'coin');
        if (cfg.alim) { ex.got++; if (ex.got >= ex.cap) { ex.got = 0; st.score += 150; st.fx.push({ k: 'pts', x: p.x, y: p.y - .6, t: 1.4, s: '¡Tren lleno! +150' }); const n = st.pal.length; let c = this.rnd(st) % n; if (c === ex.col) c = (c + 1) % n; ex.col = c; this.sfx(st, 'star'); } }
      } else { st.wrong++; st.combo = 0; const fair = !cfg.alim || st.ex.some(x => x.col === e.col); if (fair) st.lives--; st.fx.push({ k: 'bad', x: p.x, y: p.y, t: 1.2, s: fair ? (cfg.alim ? 'Estación equivocada' : 'Andén equivocado') : 'Sin destino' }); this.sfx(st, 'bad'); }
    },
    crash(st, a, b) { const p = Rail.pos(st, a); st.crashes++; st.lives--; st.combo = 0; st.fx.push({ k: 'boom', x: p.x, y: p.y, t: 1 }); this.sfx(st, 'crash'); if (Game.st === st && !EM.headless) vib(150); },
    sfx(st, k) { if (!EM.headless && (Game.st === st || Game.st2 === st)) Snd.play(k); },
    act(st, a) { if (!a || a.k !== 'sw') return; const w = st.sw[a.i]; if (!w || w.merge) return; w.s = 1 - w.s; this.sfx(st, 'switch'); },
    result(st) { const frac = st.lives / (this.LV[st.idx].lives || 3); return { done: st.done, win: st.win, score: st.score, stars: st.win ? starsOf(frac * .9 + .1) : 0, lines: [[cfg.unit, st.delivered + ' / ' + st.goal], ['Vidas', '♥'.repeat(Math.max(0, st.lives))], ['Choques', st.crashes], ['Errores', st.wrong]], fact: this.LV[st.idx].f || '' }; },
    hud(st) { return [[cfg.icon, st.delivered + '/' + st.goal], ['♥', Math.max(0, st.lives)], ['★', fmt(st.score)]]; },
    /* ---------- vista ---------- */
    geo(st, vp) { const m = Math.min(vp.w, vp.h) * .05, cs = Math.min((vp.w - 2 * m) / st.W, (vp.h - 2 * m - vp.h * .06) / st.H); return { cs, ox: (vp.w - cs * st.W) / 2, oy: (vp.h - cs * st.H) / 2 + vp.h * .03 }; },
    pointer(st, type, x, y, vp) {
      if (type !== 'down' || st.done) return null; const G = this.geo(st, vp), gx = (x - G.ox) / G.cs, gy = (y - G.oy) / G.cs; let best = null, bd = .95;
      for (const i of st.swl) { const cx = i % st.W + .5, cy = (i / st.W | 0) + .5, d = Math.hypot(cx - gx, cy - gy); if (d < bd) { bd = d; best = i; } }
      return best == null ? null : { k: 'sw', i: best };
    },
    draw(g, st, vp) {
      const G = this.geo(st, vp), cs = G.cs, T = cfg.theme, X = x => G.ox + x * cs, Y = y => G.oy + y * cs;
      g.fillStyle = T.bg; g.fillRect(0, 0, vp.w, vp.h);
      // retícula de papel / planos
      g.strokeStyle = T.grid; g.lineWidth = 1; g.beginPath(); for (let x = 0; x <= st.W; x++) { g.moveTo(X(x), Y(0)); g.lineTo(X(x), Y(st.H)); } for (let y = 0; y <= st.H; y++) { g.moveTo(X(0), Y(y)); g.lineTo(X(st.W), Y(y)); } g.stroke();
      if (cfg.alim) for (let i = 0; i < st.mask.length; i++) if (!st.mask[i] && h2(i, st.idx, 5) < .5) { const x = i % st.W, y = i / st.W | 0; for (let k = 0; k < 3; k++) Art.building(g, X(x) + cs * (.1 + k * .3), Y(y) + cs * (.75 - h2(i, k, 2) * .45), cs * .25, cs * (.2 + h2(i, k, 2) * .45), i * 3 + k, false, h2(i, k, 7) < .6); }
      const mid = (x, y, d) => d === DN ? [X(x + .5), Y(y)] : d === DE ? [X(x + 1), Y(y + .5)] : d === DS ? [X(x + .5), Y(y + 1)] : [X(x), Y(y + .5)];
      const seg = (x, y, a, b, w, col) => { const p = mid(x, y, a), q = mid(x, y, b), c = [X(x + .5), Y(y + .5)]; g.strokeStyle = col; g.lineWidth = w; g.beginPath(); g.moveTo(p[0], p[1]); if (OPP[a] === b) g.lineTo(q[0], q[1]); else g.quadraticCurveTo(c[0], c[1], q[0], q[1]); g.stroke(); };
      g.lineCap = 'round';
      for (let pass = 0; pass < 2; pass++) for (let i = 0; i < st.mask.length; i++) {
        const m = st.mask[i]; if (!m) continue; const x = i % st.W, y = i / st.W | 0, b = bitsOf(m), w = pass ? cs * .1 : cs * .3, col = pass ? T.rail2 : T.rail;
        if (st.kind[i] === 2 || st.kind[i] === 3) { const d = b[0], p = mid(x, y, d); g.strokeStyle = col; g.lineWidth = w; g.beginPath(); g.moveTo(X(x + .5), Y(y + .5)); g.lineTo(p[0], p[1]); g.stroke(); continue; }
        if (b.length === 2) seg(x, y, b[0], b[1], w, col);
        else if (b.length === 4) { seg(x, y, DN, DS, w, col); seg(x, y, DE, DW, w, col); }
        else { const sw = st.sw[i]; if (sw && !sw.merge) { for (const o of sw.opts) seg(x, y, sw.trunk, o, w, pass && o !== sw.opts[sw.s] ? T.off : col); } else { const tr = sw ? sw.trunk : b[0]; for (const o of b) if (o !== tr) seg(x, y, o, tr, w, col); } }
      }
      // agujas (círculo con flecha hacia la rama activa)
      for (const i of st.swl) {
        const sw = st.sw[i], x = i % st.W, y = i / st.W | 0, c = [X(x + .5), Y(y + .5)], d = sw.opts[sw.s], [dx, dy] = DXY[d], r = cs * .27;
        const soon = st.ents.some(e => { const p = Rail.pos(st, e); return Math.hypot(p.x - x - .5, p.y - y - .5) < 1.6; });
        g.fillStyle = soon ? T.hot : T.sw; g.strokeStyle = PAL.negro; g.lineWidth = Math.max(2, cs * .05); g.beginPath(); g.arc(c[0], c[1], r * (soon ? 1 + .08 * Math.sin(st.t * 12) : 1), 0, TAU); g.fill(); g.stroke();
        g.strokeStyle = PAL.negro; g.lineWidth = Math.max(2, cs * .07); g.beginPath(); g.moveTo(c[0] - dx * r * .5, c[1] - dy * r * .5); g.lineTo(c[0] + dx * r * .8, c[1] + dy * r * .8); g.stroke();
        g.beginPath(); g.moveTo(c[0] + dx * r * .8 + dy * r * .4, c[1] + dy * r * .8 - dx * r * .4); g.lineTo(c[0] + dx * r * .8, c[1] + dy * r * .8); g.lineTo(c[0] + dx * r * .8 - dy * r * .4, c[1] + dy * r * .8 + dx * r * .4); g.stroke();
      }
      // salidas (andenes / estaciones) y entradas (túneles / barrios)
      g.textAlign = 'center'; g.textBaseline = 'middle';
      for (const ex of st.ex) { const x = ex.i % st.W, y = ex.i / st.W | 0, c = st.pal[ex.col]; g.fillStyle = PAL.negro; g.fillRect(X(x + .08), Y(y + .12), cs * .84, cs * .8); g.fillStyle = c; g.fillRect(X(x + .14), Y(y + .18), cs * .72, cs * .68); g.fillStyle = '#fff'; g.font = '700 ' + (cs * .4) + 'px Titulos, sans-serif'; g.fillText(st.lab[ex.col], X(x + .5), Y(y + .5)); if (cfg.alim) { for (let k = 0; k < ex.cap; k++) { g.fillStyle = k < ex.got ? '#fff' : 'rgba(0,0,0,.35)'; g.fillRect(X(x + .2 + k * .22), Y(y + .74), cs * .16, cs * .08); } } }
      for (const sp of st.sp) { const x = sp.i % st.W, y = sp.i / st.W | 0; g.fillStyle = PAL.negro; g.beginPath(); g.arc(X(x + .5), Y(y + .62), cs * .4, Math.PI, TAU); g.lineTo(X(x + .9), Y(y + .9)); g.lineTo(X(x + .1), Y(y + .9)); g.fill(); g.fillStyle = T.portal; g.beginPath(); g.arc(X(x + .5), Y(y + .66), cs * .28, Math.PI, TAU); g.lineTo(X(x + .78), Y(y + .9)); g.lineTo(X(x + .22), Y(y + .9)); g.fill(); }
      // vehículos
      for (const e of st.ents) { const p = Rail.pos(st, e), c = st.pal[e.col]; g.save(); g.translate(X(p.x), Y(p.y)); g.rotate(p.a); const L = cs * (cfg.alim ? .52 : .7), Wd = cs * (cfg.alim ? .34 : .36); g.fillStyle = PAL.negro; g.fillRect(-L / 2 - 2, -Wd / 2 - 2, L + 4, Wd + 4); g.fillStyle = cfg.alim ? '#f4f1ea' : c; g.fillRect(-L / 2, -Wd / 2, L, Wd); if (cfg.alim) { g.fillStyle = c; g.fillRect(-L / 2, -Wd * .18, L, Wd * .36); } else { g.fillStyle = 'rgba(255,255,255,.75)'; g.fillRect(L * .22, -Wd * .3, L * .16, Wd * .6); } g.restore(); g.fillStyle = cfg.alim ? PAL.negro : '#fff'; g.font = '700 ' + (cs * .24) + 'px Titulos, sans-serif'; g.fillText(st.lab[e.col], X(p.x), Y(p.y)); }
      // efectos
      for (const f of st.fx) { const a = clamp(f.t, 0, 1); if (f.k === 'boom') { g.fillStyle = 'rgba(255,106,61,' + a + ')'; g.beginPath(); g.arc(X(f.x), Y(f.y), cs * (1.2 - a * .6), 0, TAU); g.fill(); g.fillStyle = 'rgba(255,230,120,' + a + ')'; g.beginPath(); g.arc(X(f.x), Y(f.y), cs * (.7 - a * .4), 0, TAU); g.fill(); } else { g.fillStyle = f.k === 'bad' ? PAL.rojo : T.txt; g.font = '700 ' + (cs * .32) + 'px Titulos, sans-serif'; g.fillText(f.s, X(f.x), Y(f.y - (1 - a) * .8)); } }
      g.textAlign = 'left'; g.textBaseline = 'alphabetic';
      g.fillStyle = T.txt; g.font = '700 ' + Math.max(11, vp.h * .022) + 'px Cuerpo, sans-serif'; g.fillText(this.LV[st.idx].n.toUpperCase() + ' · ' + st.delivered + '/' + st.goal + '  ' + '♥'.repeat(Math.max(0, st.lives)), 10, Math.max(16, vp.h * .035));
    },
    /* bot: orienta cada aguja hacia el color del vehículo que se acerca */
    ai(st) {
      for (const i of st.swl) {
        const sw = st.sw[i]; let best = null, bd = 9;
        for (const e of st.ents) { const p = Rail.pos(st, e), d = Math.hypot(p.x - (i % st.W + .5), p.y - ((i / st.W | 0) + .5)); if (d < bd && d < 2.2) { const ahead = e.i === i ? e.p < .35 : Rail.next(st, e.i, e.to) === i; if (ahead) { bd = d; best = e; } } }
        if (!best) continue;
        const want = cfg.alim ? st.ex.filter(x => x.col === best.col).map(x => x.i) : st.ex.filter(x => x.col === best.col).map(x => x.i);
        const j = Rail.next(st, i, sw.opts[sw.s]), r = j >= 0 ? Rail.reach(st, j, OPP[sw.opts[sw.s]]) : new Set();
        if (![...r].some(x => want.includes(x))) { const j2 = Rail.next(st, i, sw.opts[1 - sw.s]), r2 = j2 >= 0 ? Rail.reach(st, j2, OPP[sw.opts[1 - sw.s]]) : new Set(); if ([...r2].some(x => want.includes(x))) return { k: 'sw', i }; }
      }
      return null;
    }
  };
}
EM.modes.despacho = railMode({
  id: 'despacho', name: 'Despacho', sub: 'Puesto de Control · agujas', music: 'tension', icon: '🚆', unit: 'Trenes',
  tip: 'Toca las agujas (círculos) para mandar cada tren al andén de su color y letra. Ojo con los cruces: dos trenes juntos chocan.',
  theme: { bg: '#f9e4a4', grid: 'rgba(20,20,20,.08)', rail: '#141414', rail2: '#f9e4a4', off: 'rgba(20,20,20,.25)', sw: '#fbf8ee', hot: '#ff6a3d', portal: '#12446c', txt: '#141414' },
  LV: [
    { n: 'Patio Bello', s: 'Taller de trenes', W: 5, H: 6, sp: 1, br: 1, ex: 2, goal: 6, v: 1.1, r: 3.4, f: 'Los trenes duermen en los talleres de Bello: allá los lavan, revisan y alistan antes de las 4:30 a. m.' },
    { n: 'Niquía', s: 'Cabecera norte', W: 6, H: 7, sp: 1, br: 2, ex: 3, goal: 8, v: 1.15, r: 3.1 },
    { n: 'Madera', W: 7, H: 8, sp: 1, br: 3, ex: 4, goal: 10, v: 1.2, r: 3 },
    { n: 'Acevedo', s: 'Metrocables K y P', W: 7, H: 8, sp: 2, br: 2, cross: 1, ex: 4, goal: 10, v: 1.2, r: 3.4 },
    { n: 'Caribe', W: 8, H: 9, sp: 2, br: 3, cross: 1, ex: 5, goal: 12, v: 1.25, r: 3.2 },
    { n: 'San Antonio', s: 'Transbordo A · B · T', W: 8, H: 10, sp: 2, br: 3, cross: 1, mg: 1, ex: 4, goal: 14, v: 1.25, r: 3.1 },
    { n: 'Cisneros', W: 9, H: 10, sp: 2, br: 4, cross: 1, mg: 1, ex: 5, goal: 16, v: 1.3, r: 3 },
    { n: 'Exposiciones', W: 9, H: 11, sp: 3, br: 3, cross: 1, ex: 5, goal: 16, v: 1.3, r: 3.6 },
    { n: 'Industriales', s: 'Conexión Metroplús', W: 9, H: 11, sp: 3, br: 4, cross: 1, mg: 1, ex: 6, goal: 18, v: 1.35, r: 3.4 },
    { n: 'Poblado', W: 10, H: 12, sp: 3, br: 5, cross: 1, mg: 1, ex: 6, goal: 20, v: 1.4, r: 3.3 },
    { n: 'Itagüí', W: 10, H: 12, sp: 3, br: 5, cross: 1, mg: 2, ex: 6, goal: 22, v: 1.45, r: 3.2 },
    { n: 'La Estrella · Infinito', s: 'Sin final: ¿cuántos despachas?', W: 10, H: 12, sp: 3, br: 5, cross: 1, mg: 2, ex: 6, goal: 30, v: 1.45, r: 3.2, rmin: 1.2, inf: 1 }
  ]
});
EM.modes.alim = railMode({
  id: 'alim', name: 'Alimentadores', sub: 'Barrios → Metro', music: 'puzzle', icon: '🚐', unit: 'Buses', alim: true,
  tip: 'Cada estación pide un color. Desvía los buses de los barrios para llenarla: al completar 3, sale el tren y pide otro color.',
  theme: { bg: '#1c4459', grid: 'rgba(255,255,255,.05)', rail: '#0c2533', rail2: '#ff6a3d', off: 'rgba(255,106,61,.25)', sw: '#f9e4a4', hot: '#ff6a3d', portal: '#b4583a', txt: '#f9e4a4' },
  LV: [
    { n: 'Santo Domingo', s: 'De la loma al cable', W: 5, H: 7, sp: 1, br: 1, ex: 2, goal: 8, v: .9, r: 2.2, cap: 3, cols: 2, lives: 4 },
    { n: 'Manrique', W: 6, H: 7, sp: 1, br: 2, ex: 3, goal: 12, v: .9, r: 2, cap: 3, cols: 3, lives: 4 },
    { n: 'Robledo', W: 7, H: 8, sp: 2, br: 2, ex: 3, goal: 15, v: .95, r: 2.4, cap: 3, cols: 3, lives: 4 },
    { n: 'Belén', W: 7, H: 9, sp: 2, br: 3, mg: 1, ex: 4, goal: 18, v: .95, r: 2.2, cap: 3, cols: 3, lives: 4 },
    { n: 'Envigado', W: 8, H: 9, sp: 2, br: 3, cross: 1, mg: 1, ex: 4, goal: 20, v: 1, r: 2.1, cap: 3, cols: 4, lives: 4 },
    { n: 'Itagüí', W: 8, H: 10, sp: 3, br: 3, cross: 1, mg: 1, ex: 5, goal: 24, v: 1, r: 2.3, cap: 3, cols: 4, lives: 4 },
    { n: 'Bello', W: 9, H: 10, sp: 3, br: 4, cross: 1, mg: 2, ex: 5, goal: 28, v: 1.05, r: 2.2, cap: 3, cols: 4, lives: 5 },
    { n: 'Sabaneta', W: 9, H: 11, sp: 3, br: 4, cross: 1, mg: 2, ex: 6, goal: 32, v: 1.05, r: 2.1, cap: 4, cols: 5, lives: 5 },
    { n: 'Valle · Infinito', s: 'Sin final', W: 10, H: 12, sp: 4, br: 4, cross: 1, mg: 2, ex: 6, goal: 40, v: 1.1, r: 2, rmin: .9, cap: 4, cols: 5, lives: 5, inf: 1 }
  ]
});
