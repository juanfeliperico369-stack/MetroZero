/* =====================================================================
   LA RED: Metro (A, B), Tranvía, Metrocables, Metroplús, alimentadores y proyectos.
   Geometría: A, B y T del mapa OSM; buses por calles reales (tools/rutas.mjs → RUTAS);
   cables en línea recta entre estaciones. Datos y datos curiosos: src/data/red.js (RED).
   ===================================================================== */
const KIND = {
  metro: { label: 'Metro', vmax: 80 / 3.6, acc: 1.0, brk: 1.1, emg: 1.4, len: 66, deck: 7, plat: 110, dwell: 20, icon: '🚇' },
  tram: { label: 'Tranvía', vmax: 50 / 3.6, acc: 1.1, brk: 1.25, emg: 1.6, len: 40, deck: 0, plat: 50, dwell: 15, icon: '🚋' },
  cable: { label: 'Metrocable', vmax: 5, acc: .5, brk: .6, emg: 1, len: 4, deck: 0, plat: 30, dwell: 10, icon: '🚡' },
  brt: { label: 'Metroplús', vmax: 60 / 3.6, acc: 1.0, brk: 1.4, emg: 2, len: 18, deck: 0, plat: 30, dwell: 12, icon: '🚌' },
  feeder: { label: 'Alimentador', vmax: 50 / 3.6, acc: 1.1, brk: 1.5, emg: 2.2, len: 12, deck: 0, plat: 16, dwell: 10, icon: '🚐' },
  escalator: { label: 'Escaleras', vmax: .6, acc: .3, brk: .3, emg: .5, len: 2, deck: 0, plat: 8, dwell: 4, icon: '↗' },
  future: { label: 'En proyecto', vmax: 70 / 3.6, acc: 1.0, brk: 1.2, emg: 1.5, len: 40, deck: 0, plat: 60, dwell: 15, icon: '🚧' }
};
/* datos mínimos si src/data/red.js no está (el juego sigue funcionando) */
const RED0 = {
  lines: [
    { id: 'A', name: 'Línea A', kind: 'metro', color: '#1f63ad', from: 'Niquía', to: 'La Estrella', open: '1995-11-30', km: 25.8, status: 'operativa', facts: ['Primera y única línea de metro en Colombia: abrió el 30 de noviembre de 1995.'] },
    { id: 'B', name: 'Línea B', kind: 'metro', color: '#f08a1c', from: 'San Antonio', to: 'San Javier', open: '1996-02-28', km: 5.6, status: 'operativa', facts: [] },
    { id: 'T', name: 'Tranvía de Ayacucho', kind: 'tram', color: '#2f9b57', from: 'San Antonio', to: 'Oriente', open: '2015-10-15', km: 4.3, status: 'operativa', facts: ['Rueda sobre llantas guiado por un riel central (tecnología Translohr).'] },
    { id: 'K', name: 'Metrocable K', kind: 'cable', color: '#f2a900', stations: [['Acevedo', 6.3000, -75.5583], ['Andalucía', 6.2958, -75.5520], ['Popular', 6.2952, -75.5482], ['Santo Domingo Savio', 6.2942, -75.5425]], facts: ['Fue el primer teleférico del mundo integrado a un metro como transporte público (2004).'] },
    { id: 'L', name: 'Metrocable L · Arví', kind: 'cable', color: '#7cb342', stations: [['Santo Domingo Savio', 6.2942, -75.5425], ['Parque Arví', 6.2826, -75.5030]], facts: [] },
    { id: 'P', name: 'Metrocable P', kind: 'cable', color: '#d14b9a', stations: [['Acevedo', 6.3000, -75.5583], ['SENA', 6.3048, -75.5658], ['Doce de Octubre', 6.3072, -75.5762], ['El Progreso', 6.3090, -75.5852]], facts: [] },
    { id: 'J', name: 'Metrocable J', kind: 'cable', color: '#e8641f', stations: [['San Javier', 6.2566, -75.6136], ['Juan XXIII', 6.2655, -75.6152], ['Vallejuelos', 6.2755, -75.6143], ['La Aurora', 6.2810, -75.6151]], facts: [] },
    { id: 'H', name: 'Metrocable H', kind: 'cable', color: '#7a5cc4', stations: [['Oriente', 6.2350, -75.5385], ['Las Torres', 6.2318, -75.5338], ['Villa Sierra', 6.2290, -75.5290]], facts: [] },
    { id: 'M', name: 'Metrocable M', kind: 'cable', color: '#00a3a0', stations: [['Miraflores', 6.2400, -75.5520], ['El Pinal', 6.2445, -75.5455], ['Trece de Noviembre', 6.2485, -75.5390]], facts: [] }
  ], stationFacts: {}, trivia: []
};
const LINE_META = typeof RED !== 'undefined' && RED && Array.isArray(RED.lines) ? RED : RED0;
if (!LINE_META.stationFacts) LINE_META.stationFacts = {};
if (!Array.isArray(LINE_META.trivia)) LINE_META.trivia = [];

const NET = EM.netw = {
  lines: [], byId: {}, stations: [],
  poly(pts) { const cum = [0]; for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + dist(pts[i - 1].x, pts[i - 1].y, pts[i].x, pts[i].y)); return { pts, cum, len: cum[cum.length - 1] || 0 }; },
  at(P, s, off = 0) {
    const c = P.cum, n = c.length; s = clamp(s, 0, P.len); let lo = 0, hi = n - 1;
    while (hi - lo > 1) { const m = (lo + hi) >> 1; if (c[m] <= s) lo = m; else hi = m; }
    const a = P.pts[lo], b = P.pts[Math.min(lo + 1, n - 1)], L = (c[lo + 1] - c[lo]) || 1, k = clamp((s - c[lo]) / L, 0, 1), ang = Math.atan2(b.y - a.y, b.x - a.x);
    return { x: a.x + (b.x - a.x) * k - Math.sin(ang) * off, y: a.y + (b.y - a.y) * k + Math.cos(ang) * off, a: ang };
  },
  /* dirección media de la línea entre s − d y s + d (orienta andenes sin el quiebre de un vértice) */
  dirAt(P, s, d = 30) { const a = this.at(P, s - d), b = this.at(P, s + d); return Math.atan2(b.y - a.y, b.x - a.x); },
  project(P, x, y) {
    let bd = 1e18, bs = 0;
    for (let i = 0; i < P.pts.length - 1; i++) { const a = P.pts[i], b = P.pts[i + 1], dx = b.x - a.x, dy = b.y - a.y, L2 = dx * dx + dy * dy || 1, t = clamp(((x - a.x) * dx + (y - a.y) * dy) / L2, 0, 1), px = a.x + dx * t, py = a.y + dy * t, d = (x - px) ** 2 + (y - py) ** 2; if (d < bd) { bd = d; bs = P.cum[i] + Math.sqrt(L2) * t; } }
    return { d: Math.sqrt(bd), s: bs };
  },
  build() {
    this.lines = []; this.byId = {};
    const q = a => { const r = []; for (let i = 0; i < a.length; i += 2) r.push({ x: a[i] * TM / 4, y: a[i + 1] * TM / 4 }); return r; };
    for (const L of LINE_META.lines) {
      const k = KIND[L.kind] ? L.kind : 'future', line = Object.assign({ facts: [], tech: '', status: 'operativa' }, L, { kind: k, K: KIND[k] });
      let pts = null, st = null;
      const osm = VM.metro && VM.metro[L.id === 'TA' ? 'T' : L.id];
      if (osm && (k === 'metro' || k === 'tram')) {
        // eje real entre los dos rieles de OpenStreetMap (src/data/rieles.js); si falta, el trazado simplificado del mapa base
        const R = typeof RIELES !== 'undefined' && RIELES[L.id === 'TA' ? 'T' : L.id];
        pts = R ? R.reduce((o, v, i) => (i % 2 ? o[o.length - 1].y = v : o.push({ x: v, y: 0 }), o), []) : q(osm.p); if (!L.stations) st = osm.st.map(([n, a, b]) => ({ name: n, x: a * TM / 4, y: b * TM / 4 }));
      }
      if (!st) st = (L.stations || []).map(([n, la, lo]) => Object.assign({ name: n }, geoM(la, lo)));
      // Metroplús: su corredor real por el carril exclusivo (src/data/metroplus.js)
      if (!pts && k === 'brt' && typeof METROPLUS !== 'undefined' && METROPLUS[L.id]) pts = METROPLUS[L.id].p.reduce((o, v, i) => (i % 2 ? o[o.length - 1].y = v : o.push({ x: v, y: 0 }), o), []);
      // buses: el recorrido rehecho sobre las calles dibujadas (src/data/rutas_calles.js); si falta, el de casillas (RUTAS)
      if (!pts && typeof RUTAS_CALLES !== 'undefined' && RUTAS_CALLES[L.id]) pts = RUTAS_CALLES[L.id].reduce((o, v, i) => (i % 2 ? o[o.length - 1].y = v : o.push({ x: v, y: 0 }), o), []);
      if (!pts && typeof RUTAS !== 'undefined' && RUTAS[L.id]) pts = q(RUTAS[L.id]);
      if (!pts) { const via = (L.via || []).map(([la, lo]) => geoM(la, lo)); pts = via.length && k !== "cable" ? this.orderAlong(st, via) : st.map(s => ({ x: s.x, y: s.y })); }
      if (pts.length < 2) continue;
      line.P = this.poly(pts);
      // una línea de metro que termina sobre otra (la B en San Antonio) llega hasta el borde del viaducto de la otra, no encima
      if (k === 'metro') for (const o of this.lines) if (o.kind === 'metro') for (const fin of [0, 1]) {
        const P = line.P, e = fin ? P.pts[P.pts.length - 1] : P.pts[0]; if (this.project(o.P, e.x, e.y).d > 12) continue;
        let c = 0; while (c < 60 && this.project(o.P, this.at(P, fin ? P.len - c : c).x, this.at(P, fin ? P.len - c : c).y).d < 14) c += 1;
        const a = fin ? 0 : c, b = fin ? P.len - c : P.len, q2 = [this.at(P, a)]; P.pts.forEach((p, i) => { if (P.cum[i] > a && P.cum[i] < b) q2.push(p); }); q2.push(this.at(P, b));
        line.P = this.poly(q2.map(p => ({ x: p.x, y: p.y })));
      }
      // cada estación queda SOBRE su línea (el andén se centra en la vía y los rieles entran y salen por sus extremos)
      line.st = st.map((s, i) => { const pr = this.project(line.P, s.x, s.y), on = k !== 'cable' && k !== 'future' ? this.at(line.P, pr.s) : s; return { name: s.name, x: on.x, y: on.y, ox: s.x, oy: s.y, s: pr.s, i, line }; }).sort((a, b) => a.s - b.s);
      line.st.forEach((s, i) => s.i = i);
      if (line.st.length < 2) continue;
      line.km = line.km || +(line.P.len / 1000).toFixed(1);
      this.lines.push(line); this.byId[line.id] = line;
    }
    // estaciones de transbordo (mismo nombre o a menos de 250 m)
    this.stations = [];
    for (const l of this.lines) for (const s of l.st) {
      let hub = this.stations.find(h => h.name === s.name || dist(h.x, h.y, s.x, s.y) < 140);
      if (!hub) { hub = { name: s.name, x: s.x, y: s.y, lines: [] }; this.stations.push(hub); }
      if (!hub.lines.includes(l)) hub.lines.push(l); s.hub = hub;
    }
  },
  /* ordena puntos intermedios a lo largo del recorrido entre estaciones */
  orderAlong(st, via) {
    const base = this.poly(st.map(s => ({ x: s.x, y: s.y }))), all = st.map(s => ({ x: s.x, y: s.y, s: this.project(base, s.x, s.y).s })).concat(via.map(v => ({ x: v.x, y: v.y, s: this.project(base, v.x, v.y).s })));
    return all.sort((a, b) => a.s - b.s).map(p => ({ x: p.x, y: p.y }));
  },
  fact(name) { return LINE_META.stationFacts[name] || ''; },
  trivia(rng) { const T = LINE_META.trivia; return T.length ? T[Math.floor(rng.f() * T.length)] : null; },
  kindLines(kinds) { return this.lines.filter(l => kinds.includes(l.kind)); }
};
