/* =====================================================================
   CORREDOR POR CICLOVÍAS (3.4 «Jugo y ciclovías», Claude, 23‑nov‑2026)
   Pedido del autor: «el endless runner solo en ciclovías: cambios de dirección, calles que cambian de anchas a estrechas,
   obstáculos, skate spots para paradas y trucos, parkour; y esas zonas también en el mundo abierto».
   Idea de Motor City 4.7 (motor-city/js/50-run.js), portada a los datos de El Metro: el camino y las salidas de cada cruce
   son solo ciclorruta, y si la ciclorruta se acaba la carrera termina (nunca sigue por la calle).
   Datos: las ciclorrutas reales del juego (VC.ch con k === 5: 234 tramos, 120 km, 58 cruces). Lo que pocos saben: la más larga
   del juego es la de la doble calzada Niquía – Hatillo, en Bello (18,9 km).
   - La red: los vértices de las ciclorrutas unidos a 3 m son nodos; los tramos seguidos, aristas.
   - La pista se arma por delante hasta el próximo cruce. Ahí eliges ↰ o ↱ deslizando hacia ese lado (si no eliges, sigues
     la salida más recta). Solo se ofrecen salidas que son ciclorruta.
   - Ancha o estrecha según el lugar real: junto a avenidas y autopistas, tres carriles; en puentes, ciclobandas, pasos cortos y
     obras, un solo carril entre barandas.
   - Zonas de skate (cada 0,6–1,1 km, con el nombre del barrio): rampas, barandas para grind y bancas; ahí los trucos valen doble.
   - Trucos: toca (o ▲) en el aire. Si aterrizas en pleno truco te caes del combo.
   - Parkour: a pie (🏃) las bancas se saltan con vault y bajo los avisos te agachas (desliza ▼ o la tecla ↓).
   ===================================================================== */
(function () {
  const Cr = EM.modes.carrera; if (!Cr || typeof CR_OBS === 'undefined' || typeof VC === 'undefined') return;
  Object.assign(CR_OBS, {   // [largo (m), alto (m), color, 0 = se salta · 1 = se esquiva o se salta si es bajo]
    muro: [5, 1.15, '#aab0b7', 1], banca: [1.7, .5, '#8a5a2b', 1], baranda: [3.2, .45, '#d7dde3', 1], arco: [.4, 2.4, '#F6C538', 1], rampa: [2.8, .3, '#9a4630', 0]
  });
  if (!CR_VEH.some(v => v.id === 'pie')) CR_VEH.push({ id: 'pie', ico: '🏃', spd: 9.5, sal: 7.8, mesh: 'pie', pie: 0 });
  /* piezas del taller de arte para lo nuevo de la pista (en metros; x a lo largo del camino, z de lado) */
  const T = EM.taller;
  if (T && T.pista && T.Malla && !T.obstaculos.includes('banca')) {
    const pista0 = T.pista;
    T.pista = id => {
      if (!['muro', 'banca', 'baranda', 'arco'].includes(id)) return pista0(id);
      const m = new T.Malla(), b = (...a) => m.caja(...a), tubo = (...a) => m.barra(...a);
      if (id === 'banca') { b(0, .38, 0, 1.6, .07, .42, '#9a6a3a'); b(0, .52, .19, 1.6, .26, .05, '#86592f'); for (const x of [-.66, .66]) b(x, 0, 0, .1, .38, .42, '#6b6f75'); }
      else if (id === 'baranda') { tubo([-1.55, .42, 0], [1.55, .42, 0], .035, '#dfe4e9'); for (const x of [-1.4, 1.4]) { tubo([x, 0, 0], [x, .42, 0], .03, '#9aa0a6'); b(x, 0, 0, .22, .03, .22, '#6b6f75'); } }
      else if (id === 'muro') { for (const y of [.5, 1]) tubo([-2.5, y, 0], [2.5, y, 0], .035, '#cfd5db'); for (let x = -2.5; x <= 2.51; x += 1.25) tubo([x, 0, 0], [x, 1.05, 0], .045, '#8f959c'); b(0, 0, 0, 5, .08, .14, '#F6C538'); }
      else { for (const z of [-1.15, 1.15]) tubo([0, 0, z], [0, 2.3, z], .06, '#3b3f45'); b(0, 1.3, 0, .12, .5, 2.4, '#F6C538'); for (const z of [-.8, 0, .8]) b(.065, 1.36, z, .01, .38, .2, '#1d1f24'); }
      return m;
    };
    T.obstaculos.push('muro', 'banca', 'baranda', 'arco');
  }
  /* a pie (🏃): unos tenis como pieza (el taller no tiene vehículo «pie») y sin manubrio en primera persona */
  if (T && T.primera && !T._pie) { T._pie = 1; const pr0 = T.primera; T.primera = (g, id, ...r) => id === 'pie' ? undefined : pr0(g, id, ...r); }
  const malla0 = Cr.malla;
  Cr.malla = function (clave, hacer) { if (clave === 'v:pie') return malla0.call(this, clave, T => { const m = new T.Malla(); m.caja(.04, 0, -.11, .28, .09, .11, '#f1ece0'); m.caja(.04, 0, .11, .28, .09, .11, '#f1ece0'); return m; }); return malla0.apply(this, arguments); };
  const TRUCOS = ['Kickflip', 'Ollie 180', 'Shove-it', 'Heelflip', '360 flip', 'Manual', 'Tail grab', 'Nose grab'], PARKOUR = ['Vault', 'Speed vault', 'Kong', 'Lazy vault', 'Rodada'];
  const CARRIL = 1.5, PASO_ZONA = [600, 1100];
  const rnd = st => (st.rs = (Math.imul(st.rs | 0, 1664525) + 1013904223) >>> 0) / 4294967296;
  const jugo = (st, t, c) => { if (EM.jugo && !st.auto) EM.jugo.pop(st, t, c); };

  const Ci = EM.ciclo = {
    G: 3, red: null,
    /* la red de ciclorrutas: nodos (vértices unidos a 3 m) y aristas (tramos seguidos de una misma ciclorruta) */
    armar() {
      if (this.red) return this.red; if (!VC.on || !VC.ch) return null;
      const idx = new Map(), N = [], key = (x, y) => Math.round(x / this.G) * 100003 + Math.round(y / this.G);
      const nodo = (x, y) => { const k = key(x, y); let n = idx.get(k); if (n == null) { n = N.length; idx.set(k, n); N.push({ x, y, a: [] }); } return n; };
      for (const c of VC.ch) {
        if (c.k !== 5) continue; let prev = -1;
        for (let i = 0; i < c.P.length; i += 2) { const n = nodo(c.P[i], c.P[i + 1]); if (prev >= 0 && prev !== n && !N[prev].a.some(e => e.to === n)) { N[prev].a.push({ to: n, nm: c.nm }); N[n].a.push({ to: prev, nm: c.nm }); } prev = n; }
      }
      return (this.red = { N, idx, key });
    },
    TILDES: [[/Niquia/g, 'Niquía'], [/Jardin Botanico/g, 'Jardín Botánico'], [/Routa/g, 'Ruta'], [/ - Bicicleta$/, ''], [/ - /g, ' – '], [/Medellin/g, 'Medellín'], [/Bolivar/g, 'Bolívar'], [/Maturin/g, 'Maturín'], [/Palace/g, 'Palacé']],
    nombre(nm) { let n = (nm && typeof VIAS !== 'undefined' && VIAS.nombres[nm - 1]) || 'Ciclorruta'; for (const [a, b] of this.TILDES) n = n.replace(a, b); return n; },
    barrio(x, y) { if (!MAP.ready || !MAP.barrioAt) return ''; const B = MAP.barrioAt(x, y); return B ? B[0] : (MAP.muniAt ? MAP.muniAt(x, y) : ''); },
    /* el nodo de ciclorruta más cercano (con salida) a menos de rmax metros, o −1 */
    cercano(x, y, rmax = 1e9) { const R = this.armar(); if (!R) return -1; let b = -1, bd = rmax; for (let i = 0; i < R.N.length; i++) { const q = R.N[i]; if (!q.a.length) continue; const d = Math.hypot(q.x - x, q.y - y); if (d < bd) { bd = d; b = i; } } return b; },
    /* los niveles: las ciclorrutas con nombre más largas, desde una de sus puntas */
    niveles() {
      if (this._nv) return this._nv; const R = this.armar(); if (!R) return null; const L = new Map();
      for (const c of VC.ch) { if (c.k !== 5 || !c.nm) continue; let len = 0; for (let i = 2; i < c.P.length; i += 2) len += Math.hypot(c.P[i] - c.P[i - 2], c.P[i + 1] - c.P[i - 1]); const o = L.get(c.nm) || { nm: c.nm, len: 0, cs: [] }; o.len += len; o.cs.push(c); L.set(c.nm, o); }
      const out = [];
      for (const o of [...L.values()].filter(o => o.len >= 850).sort((a, b) => b.len - a.len).slice(0, 12)) {
        let ini = -1;
        for (const c of o.cs) { for (const j of [0, c.P.length - 2]) { const n = R.idx.get(R.key(c.P[j], c.P[j + 1])); if (n != null && R.N[n].a.length === 1) { ini = n; break; } } if (ini >= 0) break; }
        if (ini < 0) { const c = o.cs[0], n = R.idx.get(R.key(c.P[0], c.P[1])); ini = n == null ? -1 : n; }
        if (ini < 0) continue; const q = R.N[ini];
        out.push({ id: 'cr:c' + o.nm, nm: o.nm, n: ini, name: this.nombre(o.nm).replace(/^Ciclorruta\s+/, ''), km: o.len / 1000, barrio: this.barrio(q.x, q.y) });
      }
      return (this._nv = out);
    },
    /* de dónde sale la carrera: 'cr:c<nombre>' (nivel), 'cr:@x,y,h' (desde el mundo abierto) o 'cr:<línea>' (la ciclorruta más cercana a esa línea) */
    inicio(lv) {
      const R = this.armar(); if (!R) return null; const id = String(lv || '').slice(3);
      if (id[0] === 'c' && /^c\d+$/.test(id)) { const q = (this.niveles() || []).find(l => l.id === lv); return q ? { n: q.n, h: null, nm: q.nm } : null; }
      if (id[0] === '@') { const [x, y, h] = id.slice(1).split(',').map(Number); const n = this.cercano(x, y, 400); return n < 0 ? null : { n, h: isFinite(h) ? h : null }; }
      const l = NET.byId[id]; if (!l) return null; const e = l.st[Math.floor(l.st.length / 2)], n = this.cercano(e.x, e.y, 1500); return n < 0 ? null : { n, h: null };
    },
    /* un nodo más en la pista (con sus obstáculos) */
    paso(st, to, nm) {
      const K = st.cic, R = this.red, q = R.N[to], i = K.px.length - 1, s0 = K.cum[i], L = Math.hypot(q.x - K.px[i], q.y - K.py[i]);
      K.px.push(q.x); K.py.push(q.y); K.cum.push(s0 + L); K.nm.push(nm || K.nm[K.nm.length - 1] || 0); K.prev = K.cur; K.cur = to;
      this.poblar(st, s0, s0 + L, (K.px[i] + q.x) / 2, (K.py[i] + q.y) / 2, nm, L);
    },
    /* ¿ancha (3 carriles) o estrecha (1)? según lo que hay de verdad junto a la ciclorruta */
    ancho(x, y, nm, L) {
      const n = this.nombre(nm);
      if (/^Ciclobanda/i.test(n)) return 1;
      if (VC.puenteEn && VC.puenteEn(x, y, null, .5)) return 1;
      for (const c of VC.near(x - 16, y - 16, x + 16, y + 16)) if (c.k === 2 || c.k === 3) return 3;
      return 3;
    },
    /* obstáculos, pasajes, poderes, zonas de skate y tramos estrechos entre s0 y s1 */
    poblar(st, s0, s1, xm, ym, nm, L) {
      const K = st.cic, O = st.obs, an = this.ancho(xm, ym, nm, L), estrechos = [];
      if (an === 1) estrechos.push([s0 + 4, s1 - 2]);
      else if (L > 160 && rnd(st) < .28) { const a = s0 + 40 + rnd(st) * (L - 110); estrechos.push([a, a + 35 + rnd(st) * 25]); }   // obra en la vía: un tramo de un carril
      for (const [a, b] of estrechos) { if (b - a < 8) continue; K.avisos.push({ s: a - 40, t: '⚠ Se angosta: ve al centro' }); for (let s = a; s <= b; s += 5) O.push({ s, c: 0, k: 'muro' }, { s, c: 2, k: 'muro' }); }
      const estrecho = s => estrechos.some(([a, b]) => s >= a - 2 && s <= b + 2);
      for (let s = Math.max(s0 + 8, K.ult + 9); s < s1 - 2; s += 9 + rnd(st) * 15) {
        K.ult = s;
        if (s >= K.zona && !estrecho(s) && !estrecho(s + 70)) {   // zona de skate de 70 m
          const p = this.at(K, s), nom = this.barrio(p.x, p.y) || this.nombre(nm); K.zonas.push({ s0: s, s1: s + 70, nombre: nom });
          O.push({ s: s + 6, c: 1, k: 'rampa' }, { s: s + 20, c: 0, k: 'baranda' }, { s: s + 24, c: 2, k: 'baranda' }, { s: s + 34, c: 1, k: 'banca' }, { s: s + 44, c: 1, k: 'rampa' }, { s: s + 56, c: 0, k: 'baranda' }, { s: s + 56, c: 2, k: 'banca' }, { s: s + 64, c: 1, k: 'pasaje' });
          K.zona = s + 70 + PASO_ZONA[0] + rnd(st) * (PASO_ZONA[1] - PASO_ZONA[0]); K.ult = s + 70; s = s + 70; continue;
        }
        const r = rnd(st);
        if (estrecho(s)) { if (r < .35) O.push({ s, c: 1, k: rnd(st) < .5 ? 'hueco' : 'charco' }); else if (r < .5) O.push({ s, c: 1, k: 'arco' }); else O.push({ s, c: 1, k: 'pasaje' }); continue; }
        const c = (rnd(st) * 3) | 0;
        if (r < .5) O.push({ s, c, k: ['hueco', 'charco', 'cono', 'perro', 'chaza', 'moto', 'banca', 'banca', 'arco'][(rnd(st) * 9) | 0] });
        else if (r < .93) O.push({ s, c, k: 'pasaje' });
        else O.push({ s, c, k: ['iman', 'turbo', 'escudo'][(rnd(st) * 3) | 0] });
      }
      O.sort((a, b) => a.s - b.s);
    },
    /* arma la pista por delante hasta `hasta` o hasta el próximo cruce con elección */
    extender(st, hasta) {
      const K = st.cic, R = this.armar(); let g = 0;
      while (!K.fin && !K.cruce && K.cum[K.cum.length - 1] < hasta && g++ < 300) {
        const N = R.N[K.cur], ops = N.a.filter(e => e.to !== K.prev);
        if (!ops.length) { K.fin = true; break; }
        if (ops.length === 1) { this.paso(st, ops[0].to, ops[0].nm); continue; }
        const P = R.N[K.prev] || N, ain = Math.atan2(N.y - P.y, N.x - P.x), sal = ops.map(o => { const q = R.N[o.to]; let d = Math.atan2(q.y - N.y, q.x - N.x) - ain; d = Math.atan2(Math.sin(d), Math.cos(d)); return { to: o.to, nm: o.nm, giro: d }; });
        const recta = sal.slice().sort((a, b) => Math.abs(a.giro) - Math.abs(b.giro))[0], izq = sal.filter(o => o.giro < -.45).sort((a, b) => b.giro - a.giro)[0] || null, der = sal.filter(o => o.giro > .45).sort((a, b) => a.giro - b.giro)[0] || null;
        if (!izq && !der) { this.paso(st, recta.to, recta.nm); continue; }
        K.cruce = { s: K.cum[K.cum.length - 1], recta, izq, der }; K.quiere = 0;
      }
    },
    /* el corredor llegó al cruce: sale por donde eligió (o por la más recta) */
    decidir(st) {
      const K = st.cic, X = K.cruce; if (!X) return; let o = X.recta;
      if (K.quiere < 0 && X.izq) o = X.izq; else if (K.quiere > 0 && X.der) o = X.der; else if (st.auto) o = [X.izq, X.der, X.recta].filter(Boolean)[(rnd(st) * 3) | 0] || X.recta;
      K.cruce = null; K.cruces++; if (o !== X.recta) K.giros++; this.paso(st, o.to, o.nm);
      if (o.nm && o.nm !== K.nmAct) { K.nmAct = o.nm; st.dato = (o.giro < -.45 ? '↰ ' : o.giro > .45 ? '↱ ' : '↑ ') + this.nombre(o.nm); st.datoT = 3; }
      this.extender(st, st.s + 230);
    },
    /* punto de la pista a s metros, con las esquinas redondeadas (curva de Bézier en cada vértice) */
    at(K, s) {
      const C = K.cum, n = C.length; if (n < 2) return { x: K.px[0], y: K.py[0], a: 0 }; s = clamp(s, 0, C[n - 1]);
      let lo = 0, hi = n - 1; while (hi - lo > 1) { const m = (lo + hi) >> 1; if (C[m] <= s) lo = m; else hi = m; }
      for (const v of [lo, lo + 1]) {
        if (v <= 0 || v >= n - 1) continue; const r = Math.min(7, (C[v] - C[v - 1]) / 2, (C[v + 1] - C[v]) / 2); if (r < .5 || Math.abs(s - C[v]) >= r) continue;
        const f1 = (C[v] - r - C[v - 1]) / (C[v] - C[v - 1]), f2 = r / (C[v + 1] - C[v]);
        const ax = K.px[v - 1] + (K.px[v] - K.px[v - 1]) * f1, ay = K.py[v - 1] + (K.py[v] - K.py[v - 1]) * f1, bx = K.px[v] + (K.px[v + 1] - K.px[v]) * f2, by = K.py[v] + (K.py[v + 1] - K.py[v]) * f2;
        const t = (s - (C[v] - r)) / (2 * r), u = 1 - t, x = u * u * ax + 2 * u * t * K.px[v] + t * t * bx, y = u * u * ay + 2 * u * t * K.py[v] + t * t * by;
        const tx = 2 * u * (K.px[v] - ax) + 2 * t * (bx - K.px[v]), ty = 2 * u * (K.py[v] - ay) + 2 * t * (by - K.py[v]); return { x, y, a: Math.atan2(ty, tx) };
      }
      const L = C[lo + 1] - C[lo] || 1, f = (s - C[lo]) / L; return { x: K.px[lo] + (K.px[lo + 1] - K.px[lo]) * f, y: K.py[lo] + (K.py[lo + 1] - K.py[lo]) * f, a: Math.atan2(K.py[lo + 1] - K.py[lo], K.px[lo + 1] - K.px[lo]) };
    }
  };

  /* ---------- el modo Carrera sobre la ciclorruta ---------- */
  const create0 = Cr.create, levels0 = Cr.levels, step0 = Cr.step, pos0 = Cr.pos, act0 = Cr.act, key0 = Cr.key, mount0 = Cr.mount, marcador0 = Cr.marcador, result0 = Cr.result;
  Object.assign(Cr, { sub: 'Por las ciclorrutas reales del valle', tip: 'Por las ciclorrutas reales: desliza a los lados (◀ ▶) para cambiar de carril y, antes de un cruce, para elegir ↰ o ↱. Toca o ▲ para saltar y, en el aire, otra vez para un truco. Desliza ▼ para agacharte bajo los avisos. Donde se angosta, ve al centro. En las zonas de skate, las rampas te lanzan y las barandas dan grind. 🛹 cambia de vehículo (🏃 a pie: parkour).' });
  /* niveles: las ciclorrutas con nombre y, después, «cerca de» cada línea (la ciclorruta más cercana a su estación del medio;
     así siguen valiendo cr:A, cr:B… de la historia, las actividades y el bot, y la carrera sigue siendo solo por ciclovías) */
  const LINEAS = [['A', 'Cerca de la Línea A'], ['B', 'Cerca de la Línea B'], ['T', 'Cerca del tranvía'], ['MP1', 'Cerca del Metroplús 1'], ['MP2', 'Cerca del Metroplús 2'], ['MPO', 'Cerca de la Línea O']];
  Cr.levels = function () {
    if (Ci._lv) return Ci._lv; const L = Ci.niveles(); if (!L || !L.length) return levels0.call(this);
    const out = L.map(q => ({ id: q.id, name: q.name, sub: q.km.toFixed(1).replace('.', ',') + ' km de ciclorruta' + (q.barrio ? ' · desde ' + q.barrio : '') }));
    for (const [id, n] of LINEAS) { if (!NET.byId[id]) continue; const I = Ci.inicio('cr:' + id); if (!I) continue; const q = Ci.red.N[I.n]; out.push({ id: 'cr:' + id, name: n, sub: 'Por la ciclorruta ' + Ci.nombre((q.a[0] || {}).nm).replace(/^Ciclorruta\s+/, '') + (Ci.barrio(q.x, q.y) ? ' · ' + Ci.barrio(q.x, q.y) : '') }); }
    return (Ci._lv = out);
  };
  Cr.create = function (lv, opts = {}) {
    if (!Cr._aiCiclo) { Cr._aiCiclo = true; const ai1 = Cr.ai; Cr.ai = function (st) { return st && st.cic ? this.autoCiclo(st) : ai1.apply(this, arguments); }; }
    const st = create0.call(this, lv, opts), I = Ci.inicio(lv); if (!I) return st;
    const R = Ci.red, q = R.N[I.n];
    st.cic = { px: [q.x], py: [q.y], cum: [0], nm: [I.nm || 0], cur: I.n, prev: -1, cruce: null, quiere: 0, fin: false, zonas: [], avisos: [], ult: 55, zona: 300, cruces: 0, giros: 0, nmAct: I.nm || 0, ini: I.nm || (q.a[0] && q.a[0].nm) || 0 };
    st.obs = []; st._ci = 0; st.s = 0; st.v = 8; st.c = 1; st.cx = 1; st.off = 0; st.est = -1; st.rs = ((opts.seed | 0) * 2654435761 + I.n) >>> 0;
    Object.assign(st, { combo: 1, comboMax: 1, trucos: 0, grinds: 0, parkour: 0, agacha: 0, truco: null, vistos: {}, golpes: 0 });
    /* la primera salida: si hay dos, la que va hacia donde mirabas (desde el mundo abierto) o la más larga */
    const ops = q.a; if (ops.length) { let o = ops[0]; if (I.h != null) { let best = -2; for (const e of ops) { const p = R.N[e.to], d = Math.cos(Math.atan2(p.y - q.y, p.x - q.x) - I.h); if (d > best) { best = d; o = e; } } } else if (ops.length > 1 && I.nm) o = ops.find(e => e.nm === I.nm) || o; Ci.paso(st, o.to, o.nm); }
    Ci.extender(st, 230);
    const nm = Ci.nombre(st.cic.ini); st.dato = '🚲 ' + nm + (Ci.barrio(q.x, q.y) ? ' · ' + Ci.barrio(q.x, q.y) : ''); st.datoT = 4;
    return st;
  };
  Cr.pos = function (st, s, c) { if (!st.cic) return pos0.call(this, st, s, c); const p = Ci.at(st.cic, s), o = (c - 1) * CARRIL; return { x: p.x - Math.sin(p.a) * o, y: p.y + Math.cos(p.a) * o, a: p.a }; };
  Cr.step = function (st, dt) { if (!st.cic) return step0.call(this, st, dt); return this.stepCiclo(st, dt); };
  Cr.stepCiclo = function (st, dt) {
    if (st.done) return; const K = st.cic, V = this.V(st), top = V.spd * (st.turbo > 0 ? 1.3 : 1); st.t += dt;
    st.v = st.v > top ? Math.max(top, st.v - dt * 3) : Math.min(top, st.v + dt * (st.turbo > 0 ? 4 : .12));
    st.s += st.v * dt; st.cx += (st.c - st.cx) * Math.min(1, dt * 10);
    for (const k of ['inv', 'iman', 'turbo', 'agacha']) if (st[k] > 0) st[k] -= dt;
    if (st.y > 0 || st.vy > 0) { st.vy -= 22 * dt; st.y = Math.max(0, st.y + st.vy * dt); if (st.truco) st.truco.t -= dt; if (st.y === 0) { st.vy = 0; this.aterriza(st); } }
    Ci.extender(st, st.s + 230); if (K.cruce && st.s > K.cruce.s - 14) Ci.decidir(st);
    for (const a of K.avisos) if (!a.ya && st.s >= a.s) { a.ya = 1; st.dato = a.t; st.datoT = 2.5; }
    const z = K.zonas.find(q => st.s >= q.s0 && st.s <= q.s1) || null; if (z && st._zona !== z.s0) { st._zona = z.s0; st.dato = '🛹 Zona de skate · ' + z.nombre + ': rampas y barandas, los trucos valen doble'; st.datoT = 3; jugo(st, '🛹 Zona de skate', 'b'); } else if (!z) st._zona = null;
    if (st.auto && st.y > 1 && !st.truco && rnd(st) < .3) this.act(st, 'truco');
    for (const o of crVentana(st, st.s - 1.2, st.s + 7)) {
      if (o.hecho || o.s < st.s - 1.2 || o.s > st.s + (st.iman > 0 && o.k === 'pasaje' ? 7 : 1.2)) continue;
      if (Math.abs(o.c - st.cx) > (st.iman > 0 && o.k === 'pasaje' ? 2.5 : .5)) continue;
      if (o.k === 'pasaje') { o.hecho = 1; st.pasajes++; st.pts += 10; continue; }
      if (CR_POD[o.k]) { o.hecho = 1; st.poderes++; st.pts += 15; const P = CR_POD[o.k]; if (o.k === 'escudo') st.escudo = 1; else st[o.k] = P[2]; st.dato = P[0] + ' ' + P[1]; st.datoT = 3; jugo(st, P[0], 'y'); continue; }
      if (o.k === 'rampa') { o.hecho = 1; if (st.y < .2) { st.vy = Math.max(st.vy, V.sal * 1.35); st.y = Math.max(st.y, .05); jugo(st, '¡Rampa! Toca para un truco', 'g'); } continue; }
      if (o.k === 'baranda') { o.hecho = 1; if (st.y > .15) { const p = Math.round(30 * st.combo * (st._zona != null ? 2 : 1)); st.pts += p; st.grinds++; st.combo = Math.min(8, st.combo + 1); st.comboMax = Math.max(st.comboMax, st.combo); jugo(st, 'Grind +' + p, 'g'); } else st.v *= .94; continue; }
      if (o.k === 'arco' && st.agacha > 0) { o.hecho = 1; st.pts += 10; st.parkour++; jugo(st, '¡Por debajo! +10', 'g'); continue; }
      if (o.k === 'banca' && st.y > .5) { o.hecho = 1; const pie = V.id === 'pie', p = (pie ? 25 : 15) * (st._zona != null ? 2 : 1); st.pts += p; st.parkour++; jugo(st, (pie ? PARKOUR[(rnd(st) * PARKOUR.length) | 0] : 'Salto de banca') + ' +' + p, 'g'); continue; }
      const T = CR_OBS[o.k]; if (!T) continue;
      if (o.k !== 'arco' && o.k !== 'muro' && st.y > Math.max(.3, T[1])) continue;
      if (st.inv > 0) continue;
      o.hecho = 1; if (st.turbo > 0) { st.pts += 5; continue; }
      if (st.escudo) { st.escudo = 0; st.inv = 1; st.dato = '🛡 El escudo aguantó el golpe'; st.datoT = 2.5; continue; }
      st.vidas--; st.inv = 1.4; st.v = Math.max(7, st.v * .7); st.combo = 1; st.golpes++; st.truco = null; if (EM.jugo && !st.auto) EM.jugo.golpe(st);
      if (st.vidas <= 0) st.done = true;
    }
    /* lo que se aprende en el camino: el dato de cada estación cercana y el barrio por el que vas */
    if ((st._et = (st._et || 0) - dt) <= 0) { st._et = .6; const p = this.pos(st, st.s, 1);
      for (const h of NET.stations) { if (st.vistos[h.name] || Math.abs(h.x - p.x) > 160 || Math.abs(h.y - p.y) > 160) continue; st.vistos[h.name] = 1; st.est++; st.pts += 25; const f = NET.fact ? NET.fact(h.name) : ''; st.dato = '🚉 ' + h.name + (f ? ' · ' + f : ''); st.datoT = 6; break; }
      const b = Ci.barrio(p.x, p.y); if (b && b !== st._barrio) { if (st._barrio && st.datoT <= 0) { st.dato = '📍 ' + b; st.datoT = 2; } st._barrio = b; } }
    if (st.datoT > 0) st.datoT -= dt; st.pts += st.v * dt * .5;
    if (K.fin && st.s >= K.cum[K.cum.length - 1] - 6) { st.done = true; st.finCiclo = 1; st.pts += 200; st.dato = '🏁 Llegaste al final de la ciclorruta: +200'; st.datoT = 4; }
    if (st.auto) { const a = this.autoCiclo(st); if (a) this.act(st, a); }
  };
  /* el piloto de la ciclovía (bot y pruebas): salta para pasar el obstáculo en lo alto del salto, se agacha bajo los avisos,
     se cambia de carril si hay uno libre (las barandas de borde cuentan) y en los cruces elige al azar */
  Cr.autoCiclo = function (st) {
    if (st.t > 4 && !st._bv) { st._bv = 1; return 'vehiculo'; }
    const K = st.cic, V = this.V(st); if (K.cruce && K.cruce.s - st.s < 90 && K._aiq !== K.cruce.s) { K._aiq = K.cruce.s; K.quiere = [-1, 0, 1][(rnd(st) * 3) | 0]; }
    const malo = q => !q.hecho && CR_OBS[q.k] && q.k !== 'rampa' && q.k !== 'baranda', win = crVentana(st, st.s + .01, st.s + 32), o = win.find(q => malo(q) && q.c === st.c);
    if (!o || st.turbo > 0) return null; const d = o.s - st.s, T0 = CR_OBS[o.k], aire = 2 * V.sal / 22, dj = st.v * aire * .5 + .6;
    if (o.k === 'arco') return d < 6 && st.y === 0 && !(st.agacha > 0) ? 'agacha' : null;
    if ((T0[3] === 0 || T0[1] < .9)) return d <= dj && st.y === 0 && st.vy <= 0 ? 'salta' : null;
    if (d > Math.max(10, st.v * 1.15)) return null;
    const libres = [0, 1, 2].filter(c => Math.abs(c - st.c) === 1 && !win.some(q => malo(q) && q.c === c && q.s < st.s + Math.max(12, st.v * 1.3)));
    if (libres.length) return libres[0] < st.c ? 'izq' : 'der';
    return d <= dj && st.y === 0 ? 'salta' : null;
  };
  /* al tocar el piso: si el truco terminó, suma con el combo; si no, te caes del combo */
  Cr.aterriza = function (st) {
    const T = st.truco; st.truco = null; if (!T) return;
    if (T.t > .1) { st.combo = 1; st.v *= .82; st.dato = 'Te caíste del truco: aterriza antes'; st.datoT = 1.6; if (EM.jugo && !st.auto) EM.jugo.golpe(st, true); return; }
    const p = Math.round(T.p * st.combo * (st._zona != null ? 2 : 1)); st.pts += p; st.trucos++; st.combo = Math.min(8, st.combo + 1); st.comboMax = Math.max(st.comboMax, st.combo); jugo(st, T.n + ' ×' + (st.combo - 1) + ' +' + p, 'g');
  };
  Cr.act = function (st, a) {
    if (!st.cic) return act0.call(this, st, a); const K = st.cic;
    if ((a === 'izq' || a === 'der') && K.cruce && K.cruce.s - st.s < 120) { K.quiere = a === 'izq' ? -1 : 1; const o = a === 'izq' ? K.cruce.izq : K.cruce.der; if (o) { st.dato = (a === 'izq' ? '↰ ' : '↱ ') + Ci.nombre(o.nm); st.datoT = 1.6; } }
    if (a === 'agacha') { if (st.y === 0) { st.agacha = .9; if (!st.auto && typeof Snd !== 'undefined') Snd.play('tap'); } return; }
    if (a === 'salta' && st.agacha > 0) return;
    if (a === 'truco' || (a === 'salta' && (st.y > .35 || st.vy > 0))) { if ((st.y > .35 || st.vy > 2) && !st.truco) { const L = this.V(st).id === 'pie' ? PARKOUR : TRUCOS; st.truco = { n: L[(rnd(st) * L.length) | 0], t: .42, p: 30 }; } return; }
    return act0.call(this, st, a);
  };
  Cr.key = function (st, k, down) { if (down && st.cic && (k === 'ArrowDown' || k === 's')) { this.act(st, 'agacha'); return; } if (down && st.cic && (k === 'e' || k === 'Enter')) { this.act(st, 'truco'); return; } return key0.call(this, st, k, down); };
  Cr.mount = function (st, el) {
    const r = mount0.apply(this, arguments); if (!st.cic) return r;
    const box = el.querySelector('.crbtns'); if (box && !document.getElementById('crAg')) { const b = document.createElement('button'); b.id = 'crAg'; b.setAttribute('aria-label', 'Agacharse'); b.textContent = '▼'; b.onclick = () => this.act(st, 'agacha'); box.insertBefore(b, document.getElementById('crDe')); }
    const cv = $('#gcv'); if (cv && this._pu) { cv.removeEventListener('pointerup', this._pu); let p0 = null; cv.removeEventListener('pointerdown', this._pd);
      this._pd = e => { p0 = { x: e.clientX, y: e.clientY }; }; this._pu = e => { if (!p0) return; const dx = e.clientX - p0.x, dy = e.clientY - p0.y; p0 = null; if (Math.abs(dx) > 30 && Math.abs(dx) > Math.abs(dy)) this.act(st, dx < 0 ? 'izq' : 'der'); else if (dy < -30) this.act(st, 'salta'); else if (dy > 30) this.act(st, 'agacha'); else if (Math.hypot(dx, dy) < 18) this.act(st, 'salta'); };
      cv.addEventListener('pointerdown', this._pd); cv.addEventListener('pointerup', this._pu); }
    return r;
  };
  /* el marcador: además, la ciclorruta, el cruce que viene (↰ ↱), el combo y la zona */
  Cr.marcador = function (g, st, W, H) {
    marcador0.call(this, g, st, W, H); if (!st.cic) return; const K = st.cic, d = W / Math.max(1, ($('#gcv') || { clientWidth: W }).clientWidth || W), f = n => Math.round(n * d) + 'px Cuerpo, sans-serif';
    g.save(); g.textAlign = 'left'; g.font = '700 ' + f(11.5); g.fillStyle = 'rgba(15,34,56,.7)'; const t1 = '🚲 ' + Ci.nombre(K.nm[Math.max(0, K.cum.findIndex(c => c > st.s) - 1)] || K.ini).replace(/^Ciclorruta\s+/, '') + (st._barrio ? ' · ' + st._barrio : ''); g.fillRect(8 * d, 110 * d, Math.min(W - 16 * d, g.measureText(t1).width + 14 * d), 20 * d); g.fillStyle = '#fff'; g.fillText(t1, 15 * d, 124 * d);
    if (st.combo > 1) { g.font = '900 ' + f(20); g.fillStyle = '#F6C538'; g.textAlign = 'right'; g.fillText('×' + st.combo, W - 14 * d, 128 * d); }
    const X = K.cruce; if (X && X.s - st.s < 120 && X.s - st.s > -2) {
      const y = H * .3, dist = Math.max(0, Math.round(X.s - st.s)); g.textAlign = 'center'; g.font = '800 ' + f(12); g.fillStyle = 'rgba(15,34,56,.85)'; g.fillRect(W / 2 - 90 * d, y - 34 * d, 180 * d, 22 * d); g.fillStyle = '#fff'; g.fillText('Cruce en ' + dist + ' m · desliza para elegir', W / 2, y - 19 * d);
      const lado = (o, s) => { if (!o) return; const on = K.quiere === s, txt = (s < 0 ? '↰ ' : '') + Ci.nombre(o.nm).replace(/^Ciclorruta\s+/, '') + (s > 0 ? ' ↱' : ''); g.font = '900 ' + f(14); const w = g.measureText(txt).width + 18 * d, x = s < 0 ? 10 * d : W - 10 * d - w; g.fillStyle = on ? '#F6C538' : 'rgba(15,34,56,.85)'; g.fillRect(x, y, w, 30 * d); g.fillStyle = on ? '#0f2238' : '#fff'; g.textAlign = 'left'; g.fillText(txt, x + 9 * d, y + 20 * d); };
      lado(X.izq, -1); lado(X.der, 1);
    }
    g.restore();
  };
  Cr.result = function (st) {
    const r = result0.call(this, st); if (!st.cic) return r; const K = st.cic, km = (st.s / 1000).toFixed(2).replace('.', ',');
    r.win = st.done && st.vidas > 0; r.lines = [['Ciclorruta', Ci.nombre(K.ini).replace(/^Ciclorruta\s+/, '')], ['Recorrido', km + ' km'], ['Puntos', Math.round(st.pts)], ['Trucos', st.trucos + ' · combo ×' + st.comboMax], ['Grind y parkour', st.grinds + ' · ' + st.parkour], ['Cruces', K.cruces + ' (' + K.giros + ' giros)'], ['Pasajes', st.pasajes]].concat(st.finCiclo ? [['Meta', '🏁 llegaste al final']] : []);
    if (!r.fact || /^🚲/.test(r.fact)) r.fact = 'En el juego están las ciclorrutas reales del valle: 234 tramos y 120 km. La más larga es la de la doble calzada Niquía – Hatillo, en Bello.';
    return r;
  };
})();
