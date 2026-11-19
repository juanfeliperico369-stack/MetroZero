#!/usr/bin/env node
/* Recorridos de bus (Metroplús y alimentadores) POR LAS CALLES dibujadas → src/data/rutas_calles.js
   Toma el trazado aproximado de cada ruta (src/data/rutas.js, RUTAS) y lo rehace sobre la red de calles vectoriales
   (src/data/vias.js, VIAS: calles, avenidas, autopistas y carreras): camino más corto entre puntos de paso cada ~250 m,
   con castigo por alejarse del trazado original (así sigue su corredor), sin lazos y con las esquinas redondeadas (radio ~6 m).
   Uso: node tools/rutas_calles.mjs */
import fs from 'node:fs'; import path from 'node:path'; import zlib from 'node:zlib';
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const VIAS = JSON.parse(fs.readFileSync(path.join(root, 'src/data/vias.js'), 'utf8').match(/const VIAS = (\{.*\});/s)[1]);
const RUTAS = JSON.parse(fs.readFileSync(path.join(root, 'src/data/rutas.js'), 'utf8').match(/const RUTAS = (\{.*?\});/s)[1]);
const RED = JSON.parse(fs.readFileSync(path.join(root, 'src/data/red.js'), 'utf8').match(/const RED = (\{[\s\S]*?\});\s*\n/)[1]);
const VM = JSON.parse(fs.readFileSync(path.join(root, 'src/data/valle.js'), 'utf8').match(/const VALLE_META = (\{.*?\});\n/s)[1]);
const TM = 20, U = VIAS.u, geo = (lat, lon) => [(lon - VM.lon0) * VM.kx * TM, (VM.latN - lat) * VM.ky * TM];
// Metroplús: cada parada en su andén real (src/data/metroplus_andenes.js, de tools/metroplus_andenes.py) cuando se conoce
const ANDENES = fs.existsSync(path.join(root, 'src/data/metroplus_andenes.js')) ? JSON.parse(fs.readFileSync(path.join(root, 'src/data/metroplus_andenes.js'), 'utf8').match(/const MP_ANDENES = (\{.*\});/s)[1]) : {};
const paradas = {}; for (const l of RED.lines) if (l.stations && (l.kind === 'brt' || l.kind === 'feeder')) paradas[l.id] = l.stations.map(([n, la, lo]) => (ANDENES[l.id] && ANDENES[l.id][n]) || geo(la, lo));
// ---------- 1. vías vehiculares en metros ----------
const b = zlib.inflateRawSync(Buffer.from(VIAS.d, 'base64')); let o = 0, px = 0, py = 0;
const rv = () => { let v = 0, sh = 0, c; do { c = b[o++]; v += (c & 127) * 2 ** sh; sh += 7; } while (c & 128); return v; }, uz = v => v % 2 ? -(v + 1) / 2 : v / 2;
const vias = []; for (let i = 0; i < VIAS.n; i++) { const k = rv(), nm = rv(), w2 = rv(), np = rv(), P = []; for (let j = 0; j < np; j++) { px += uz(rv()); py += uz(rv()); P.push([px, py]); } if (k >= 1 && k <= 4) vias.push({ k, P }); }
// ---------- 2. grafo: nodos por coordenada (unidades de 2,5 m), aristas entre vértices seguidos ----------
const nodes = [], idx = new Map(), adj = []; const nodo = (x, y) => { const key = x * 1e5 + y; let id = idx.get(key); if (id == null) { id = nodes.length; idx.set(key, id); nodes.push([x * U, y * U]); adj.push([]); } return id; };
const FACT = { 1: 1.15, 2: .85, 3: .8, 4: 1 };
const arista = (a, c, f) => { if (a === c) return; const L = Math.hypot(nodes[a][0] - nodes[c][0], nodes[a][1] - nodes[c][1]); adj[a].push([c, L * f]); adj[c].push([a, L * f]); };
// segmentos indexados en celdas de 40 m (para empalmar las puntas sueltas en T)
const segs = [], cel = new Map(), CK = 40; const addSeg = s => { const i = segs.length; segs.push(s); const [ax, ay] = nodes[s.a], [cx, cy] = nodes[s.c]; for (let gy = Math.floor(Math.min(ay, cy) / CK); gy <= Math.floor(Math.max(ay, cy) / CK); gy++) for (let gx = Math.floor(Math.min(ax, cx) / CK); gx <= Math.floor(Math.max(ax, cx) / CK); gx++) { const key = gx * 1e5 + gy; let l = cel.get(key); if (!l) cel.set(key, l = []); l.push(i); } };
const deg = new Map(); for (const v of vias) { const ids = v.P.map(([x, y]) => nodo(x, y)); for (let i = 1; i < ids.length; i++) addSeg({ a: ids[i - 1], c: ids[i], f: FACT[v.k], cortes: [] }); for (const e of [ids[0], ids[ids.length - 1]]) deg.set(e, (deg.get(e) || 0) + 1); }
// puntas que solo tocan una vía: si caen a menos de 3 m del interior de otro segmento, se parte ese segmento ahí
let empalmes = 0;
for (const [e, d] of deg) { if (d > 1) continue; const [x, y] = nodes[e]; let best = null, bd = 3;
  for (let gy = Math.floor((y - 3) / CK); gy <= Math.floor((y + 3) / CK); gy++) for (let gx = Math.floor((x - 3) / CK); gx <= Math.floor((x + 3) / CK); gx++) for (const i of cel.get(gx * 1e5 + gy) || []) { const s = segs[i]; if (s.a === e || s.c === e) continue; const [ax, ay] = nodes[s.a], [cx, cy] = nodes[s.c], dx = cx - ax, dy = cy - ay, L2 = dx * dx + dy * dy || 1, t = ((x - ax) * dx + (y - ay) * dy) / L2; if (t <= .02 || t >= .98) continue; const dd = Math.hypot(ax + dx * t - x, ay + dy * t - y); if (dd < bd) { bd = dd; best = [i, t]; } }
  if (best) { segs[best[0]].cortes.push([best[1], e]); empalmes++; } }
// paradas y cabeceras sobre tramos rectos largos: parte el segmento vial más cercano para que la parada tenga nodo propio en el eje de la vía
const _ptsAncla = [...Object.values(paradas).flat()];
for (const flat of Object.values(RUTAS)) if (flat.length >= 4) _ptsAncla.push([flat[0] * TM / 4, flat[1] * TM / 4], [flat[flat.length - 2] * TM / 4, flat[flat.length - 1] * TM / 4]);
for (const [x, y] of _ptsAncla) {
  let best = null, bd = 35;
  for (let gy = Math.floor((y - 35) / CK); gy <= Math.floor((y + 35) / CK); gy++) for (let gx = Math.floor((x - 35) / CK); gx <= Math.floor((x + 35) / CK); gx++) for (const i of cel.get(gx * 1e5 + gy) || []) {
    const s = segs[i], [ax, ay] = nodes[s.a], [cx, cy] = nodes[s.c], dx = cx - ax, dy = cy - ay, L2 = dx * dx + dy * dy || 1, t = ((x - ax) * dx + (y - ay) * dy) / L2;
    if (t <= .02 || t >= .98) continue;
    const px = ax + dx * t, py = ay + dy * t, dd = Math.hypot(px - x, py - y);
    if (dd < bd) { bd = dd; best = [i, t, px, py]; }
  }
  if (best) { const [i, t, px, py] = best, e = nodo(Math.round(px / U), Math.round(py / U)); if (e !== segs[i].a && e !== segs[i].c) segs[i].cortes.push([t, e]); }
}
for (const s of segs) { if (!s.cortes.length) { arista(s.a, s.c, s.f); continue; } s.cortes.sort((p, q) => p[0] - q[0]); let prev = s.a; for (const [, e] of s.cortes) { arista(prev, e, s.f); prev = e; } arista(prev, s.c, s.f); }
// componente principal de la red (los puntos de paso solo se toman de ahí: nada de arrancar en un parqueadero aislado)
const comp = new Int32Array(nodes.length).fill(-1); let ncomp = 0, mayor = 0, tam = 0;
for (let i = 0; i < nodes.length; i++) { if (comp[i] >= 0 || !adj[i].length) continue; const pila = [i]; comp[i] = ncomp; let n = 0; while (pila.length) { const u = pila.pop(); n++; for (const [v] of adj[u]) if (comp[v] < 0) { comp[v] = ncomp; pila.push(v); } } if (n > tam) { tam = n; mayor = ncomp; } ncomp++; }
// índice de nodos por celda (puntos de paso)
const ncel = new Map(); nodes.forEach(([x, y], i) => { if (!adj[i].length || comp[i] !== mayor) return; const key = Math.floor(x / CK) * 1e5 + Math.floor(y / CK); let l = ncel.get(key); if (!l) ncel.set(key, l = []); l.push(i); });
const cercano = (x, y, R) => { let best = -1, bd = R; for (let gy = Math.floor((y - R) / CK); gy <= Math.floor((y + R) / CK); gy++) for (let gx = Math.floor((x - R) / CK); gx <= Math.floor((x + R) / CK); gx++) for (const i of ncel.get(gx * 1e5 + gy) || []) { const d = Math.hypot(nodes[i][0] - x, nodes[i][1] - y); if (d < bd) { bd = d; best = i; } } return best; };
// ---------- 3. A* con castigo por alejarse del corredor de la ruta ----------
const dPoli = (Q, x, y) => { let bd = 1e18; for (let i = 1; i < Q.length; i++) { const [ax, ay] = Q[i - 1], [cx, cy] = Q[i], dx = cx - ax, dy = cy - ay, t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy || 1))), d = (ax + dx * t - x) ** 2 + (ay + dy * t - y) ** 2; if (d < bd) bd = d; } return Math.sqrt(bd); };
const astar = (s, t, pen) => {
  const g = new Map([[s, 0]]), prev = new Map(), H = [[Math.hypot(nodes[s][0] - nodes[t][0], nodes[s][1] - nodes[t][1]) * .8, s]], done = new Set();
  const push = e => { H.push(e); let i = H.length - 1; while (i) { const p = (i - 1) >> 1; if (H[p][0] <= H[i][0]) break; [H[p], H[i]] = [H[i], H[p]]; i = p; } };
  const pop = () => { const top = H[0], last = H.pop(); if (H.length) { H[0] = last; let i = 0; for (;;) { const l = 2 * i + 1, r = l + 1; let m = i; if (l < H.length && H[l][0] < H[m][0]) m = l; if (r < H.length && H[r][0] < H[m][0]) m = r; if (m === i) break; [H[m], H[i]] = [H[i], H[m]]; i = m; } } return top; };
  let n = 0; while (H.length && n++ < 200000) { const [, u] = pop(); if (u === t) break; if (done.has(u)) continue; done.add(u);
    for (const [v, w] of adj[u]) { const c = g.get(u) + w * pen(v); if (c < (g.get(v) ?? Infinity)) { g.set(v, c); prev.set(v, u); push([c + Math.hypot(nodes[v][0] - nodes[t][0], nodes[v][1] - nodes[t][1]) * .8, v]); } } }
  if (!prev.has(t) && s !== t) return null; const out = [t]; let u = t; while (u !== s) { u = prev.get(u); out.push(u); } return out.reverse();
};
// ---------- 4. cada ruta ----------
const remuestrea = (Q, paso) => { const out = [Q[0]]; let acc = 0; for (let i = 1; i < Q.length; i++) { const [ax, ay] = Q[i - 1], [cx, cy] = Q[i], L = Math.hypot(cx - ax, cy - ay); let t = paso - acc; while (t <= L) { out.push([ax + (cx - ax) * t / L, ay + (cy - ay) * t / L]); t += paso; } acc = (acc + L) % paso; } const z = Q[Q.length - 1], w = out[out.length - 1]; if (Math.hypot(z[0] - w[0], z[1] - w[1]) > 1) out.push(z); return out; };
const rdp = (Q, eps) => { const n = Q.length; if (n < 3) return Q; const keep = new Uint8Array(n); keep[0] = keep[n - 1] = 1; const st = [[0, n - 1]]; while (st.length) { const [a, c] = st.pop(), [ax, ay] = Q[a], [cx, cy] = Q[c], L = Math.hypot(cx - ax, cy - ay) || 1; let md = -1, mi = -1; for (let i = a + 1; i < c; i++) { const d = Math.abs((cx - ax) * (ay - Q[i][1]) - (ax - Q[i][0]) * (cy - ay)) / L; if (d > md) { md = d; mi = i; } } if (md > eps) { keep[mi] = 1; st.push([a, mi], [mi, c]); } } return Q.filter((_, i) => keep[i]); };
// esquina redondeada: en cada giro de más de 20°, una curva de Bézier de hasta 6 m a cada lado del vértice
const redondea = Q => { const out = [Q[0]]; for (let i = 1; i < Q.length - 1; i++) { const [ax, ay] = Q[i - 1], [bx, by] = Q[i], [cx, cy] = Q[i + 1], L1 = Math.hypot(bx - ax, by - ay), L2 = Math.hypot(cx - bx, cy - by); let d = Math.abs(Math.atan2(cy - by, cx - bx) - Math.atan2(by - ay, bx - ax)); if (d > Math.PI) d = 2 * Math.PI - d; if (d < .35 || L1 < 1 || L2 < 1) { out.push(Q[i]); continue; }
  const r = Math.min(6, L1 * .45, L2 * .45), p0 = [bx - (bx - ax) / L1 * r, by - (by - ay) / L1 * r], p2 = [bx + (cx - bx) / L2 * r, by + (cy - by) / L2 * r]; for (let t = 0; t <= 1.001; t += .25) { const u = 1 - t; out.push([u * u * p0[0] + 2 * u * t * bx + t * t * p2[0], u * u * p0[1] + 2 * u * t * by + t * t * p2[1]]); } }
  out.push(Q[Q.length - 1]); return out; };
const OUT = {}, info = {};
for (const [id, flat] of Object.entries(RUTAS)) {
  const Q = []; for (let i = 0; i < flat.length; i += 2) Q.push([flat[i] * TM / 4, flat[i + 1] * TM / 4]); if (Q.length < 2) continue;
  // puntos de paso cada ~400 m, solo donde el trazado pasa sobre una calle real (a menos de 15 m de un nodo); los extremos siempre
  const A = remuestrea(Q, 400), memo = new Map(), pen = v => { let p = memo.get(v); if (p == null) { const d = dPoli(Q, nodes[v][0], nodes[v][1]); p = 1 + (d / 20) ** 2; memo.set(v, p); } return p; };
  // las paradas son puntos de paso obligatorios (ordenados a lo largo del trazado): la ruta pasa por todas
  const sAlong = ([x, y]) => { let bd = 1e18, bs = 0, acc = 0; for (let i = 1; i < Q.length; i++) { const [ax, ay] = Q[i - 1], [cx, cy] = Q[i], dx = cx - ax, dy = cy - ay, L = Math.hypot(dx, dy) || 1, t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / (L * L))), d = (ax + dx * t - x) ** 2 + (ay + dy * t - y) ** 2; if (d < bd) { bd = d; bs = acc + L * t; } acc += L; } return bs; };
  const pts = A.map((p, i) => ({ p, s: sAlong(p), r: i === 0 || i === A.length - 1 ? 45 : 15, ob: false })).concat((paradas[id] || []).map(p => ({ p, s: sAlong(p), r: 60, ob: true }))).sort((a, b) => a.s - b.s);
  const anc = [], obl = []; for (const q of pts) { const v = cercano(q.p[0], q.p[1], q.r); if (v < 0 || v === anc[anc.length - 1]) { if (q.ob && v >= 0) obl[obl.length - 1] = true; continue; } anc.push(v); obl.push(q.ob); }
  // de punto de paso en punto de paso desde el último nodo alcanzado (si uno no se alcanza, se salta: nunca hay saltos en línea recta)
  // un punto de paso que obliga a un rodeo (más de 2,5 veces la distancia directa) también se salta
  const largo = c => { let L = 0; for (let i = 1; i < c.length; i++) L += Math.hypot(nodes[c[i]][0] - nodes[c[i - 1]][0], nodes[c[i]][1] - nodes[c[i - 1]][1]); return L; };
  let camino = [anc[0]], fallos = 0; for (let i = 1; i < anc.length; i++) { const u = camino[camino.length - 1], c = astar(u, anc[i], pen); if (!c || (!obl[i] && largo(c) > 2.5 * Math.hypot(nodes[u][0] - nodes[anc[i]][0], nodes[u][1] - nodes[anc[i]][1]) + 80)) { fallos++; continue; } camino.push(...c.slice(1)); }
  // sin lazos: si un nodo se repite, se corta lo que hay entre las dos visitas (callejones de ida y vuelta)
  const pos = new Map(), lim = []; for (const v of camino) { if (pos.has(v)) { const j = pos.get(v); for (const w of lim.splice(j + 1)) pos.delete(w); continue; } pos.set(v, lim.length); lim.push(v); }
  // sin vueltas cortas: si el camino vuelve a pasar a menos de 8 m de un punto anterior tras un rodeo (glorieta, manzana), se corta el rodeo
  const C = remuestrea(lim.map(v => nodes[v]), 4), Z = []; for (let i = 0; i < C.length; i++) { Z.push(C[i]); let corte = -1; for (let j = i + 4; j < Math.min(C.length, i + 120); j++) if (Math.hypot(C[j][0] - C[i][0], C[j][1] - C[i][1]) < 8) corte = j; if (corte > 0) i = corte; }
  const P = redondea(rdp(Z, .4)); let L = 0; for (let i = 1; i < P.length; i++) L += Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]);
  let lejos = 0; for (const [x, y] of remuestrea(P, 20)) if (dPoli(Q, x, y) > 60) lejos++;
  OUT[id] = P.flatMap(([x, y]) => [Math.round(x * 10) / 10, Math.round(y * 10) / 10]);
  let L0 = 0; for (let i = 1; i < Q.length; i++) L0 += Math.hypot(Q[i][0] - Q[i - 1][0], Q[i][1] - Q[i - 1][1]);
  info[id] = { km: +(L / 1000).toFixed(2), km_antes: +(L0 / 1000).toFixed(2), puntos: P.length, fallos, lejos_60m: lejos };
}
const txt = `/* Recorridos de bus por las calles dibujadas (Metroplús y alimentadores), en metros del mapa del valle: el trazado de
   src/data/rutas.js rehecho sobre la red de calles de src/data/vias.js (© colaboradores de OpenStreetMap, ODbL, vía Overture Maps).
   Generado por tools/rutas_calles.mjs (no editar a mano). */
const RUTAS_CALLES = ${JSON.stringify(OUT)};
`;
fs.writeFileSync(path.join(root, 'src/data/rutas_calles.js'), txt);
console.log('nodos', nodes.length, 'empalmes en T', empalmes, 'red principal', tam, 'de', ncomp, 'piezas'); for (const [id, v] of Object.entries(info)) console.log(id, JSON.stringify(v)); console.log('src/data/rutas_calles.js', Math.round(txt.length / 1024), 'KB');
