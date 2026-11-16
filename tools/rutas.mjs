#!/usr/bin/env node
/* Traza por calles reales (A* sobre el mapa de casillas de 20 m) los recorridos de Metroplús,
   alimentadores y proyectos viales. Escribe src/data/rutas.js → const RUTAS = { id: [x4, y4, ...] } (casillas ×4). */
import fs from 'node:fs'; import path from 'node:path'; import zlib from 'node:zlib';
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const load = (f, name) => new Function(fs.readFileSync(path.join(root, 'src/data', f), 'utf8') + ';return ' + name)();
const VM = load('valle.js', 'VALLE_META'), BIN = load('valle.js', 'VALLE_BIN'), RED = load('red.js', 'RED');
const MW = VM.W, MH = VM.H, raw = zlib.inflateRawSync(Buffer.from(BIN, 'base64')), T = raw.subarray(0, MW * MH);
const geo = (lat, lon) => ({ x: (lon - VM.lon0) * VM.kx, y: (VM.latN - lat) * VM.ky });
// costo por tipo de casilla (Infinity = no transitable)
const COST = new Float32Array(17).fill(Infinity); COST[5] = 1; COST[14] = 1; COST[11] = 1; COST[4] = 1.25; COST[6] = 5; COST[10] = 5; COST[7] = 4; COST[16] = 9;
function nearest(x, y) { x = Math.round(x); y = Math.round(y); for (let r = 0; r < 25; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) { if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue; const X = x + dx, Y = y + dy; if (X < 0 || Y < 0 || X >= MW || Y >= MH) continue; const c = COST[T[Y * MW + X]]; if (c <= 1.25) return [X, Y]; } return [x, y]; }
function astar(a, b) {
  const [sx, sy] = a, [tx, ty] = b, pad = 120, x0 = Math.max(0, Math.min(sx, tx) - pad), y0 = Math.max(0, Math.min(sy, ty) - pad), x1 = Math.min(MW - 1, Math.max(sx, tx) + pad), y1 = Math.min(MH - 1, Math.max(sy, ty) + pad);
  const w = x1 - x0 + 1, h = y1 - y0 + 1, g = new Float32Array(w * h).fill(Infinity), par = new Int32Array(w * h).fill(-1), done = new Uint8Array(w * h);
  const heap = [], push = (f, i) => { heap.push([f, i]); let k = heap.length - 1; while (k > 0) { const p = (k - 1) >> 1; if (heap[p][0] <= heap[k][0]) break; [heap[p], heap[k]] = [heap[k], heap[p]]; k = p; } };
  const pop = () => { const top = heap[0], last = heap.pop(); if (heap.length) { heap[0] = last; let k = 0; for (;;) { const l = 2 * k + 1, r = l + 1; let m = k; if (l < heap.length && heap[l][0] < heap[m][0]) m = l; if (r < heap.length && heap[r][0] < heap[m][0]) m = r; if (m === k) break; [heap[m], heap[k]] = [heap[k], heap[m]]; k = m; } } return top; };
  const L = (x, y) => (y - y0) * w + (x - x0), si = L(sx, sy), ti = L(tx, ty); g[si] = 0; push(0, si); let n = 0;
  while (heap.length && n++ < 900000) {
    const [, i] = pop(); if (done[i]) continue; done[i] = 1; if (i === ti) break;
    const x = i % w + x0, y = (i / w | 0) + y0;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      if (!dx && !dy) continue; const X = x + dx, Y = y + dy; if (X < x0 || Y < y0 || X > x1 || Y > y1) continue;
      const c = COST[T[Y * MW + X]]; if (c === Infinity && !(X === tx && Y === ty)) continue;
      const j = L(X, Y), ng = g[i] + (dx && dy ? 1.414 : 1) * (c === Infinity ? 1 : c); if (ng < g[j]) { g[j] = ng; par[j] = i; push(ng + Math.hypot(tx - X, ty - Y), j); }
    }
  }
  if (par[ti] < 0) return null; const out = []; for (let i = ti; i >= 0; i = par[i]) { out.push([i % w + x0, (i / w | 0) + y0]); if (i === si) break; } return out.reverse();
}
function simplify(pts, eps) { if (pts.length < 3) return pts; let dm = 0, k = 0; const [a, b] = [pts[0], pts[pts.length - 1]], L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1; for (let i = 1; i < pts.length - 1; i++) { const d = Math.abs((b[1] - a[1]) * pts[i][0] - (b[0] - a[0]) * pts[i][1] + b[0] * a[1] - b[1] * a[0]) / L; if (d > dm) { dm = d; k = i; } } return dm > eps ? simplify(pts.slice(0, k + 1), eps).slice(0, -1).concat(simplify(pts.slice(k), eps)) : [a, b]; }
const RUTAS = {}; let ok = 0, bad = 0;
for (const L of RED.lines) {
  const road = L.kind === 'brt' || L.kind === 'feeder' || (L.kind === 'future' && /80|bus|brt|metroplús/i.test(L.id + ' ' + (L.name || '') + ' ' + (L.tech || '')));
  if (!road || !L.stations || L.stations.length < 2) continue;
  const pts = L.stations.map(([, la, lo]) => geo(la, lo)); let path = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const a = nearest(pts[i].x, pts[i].y), b = nearest(pts[i + 1].x, pts[i + 1].y), seg = astar(a, b);
    if (seg) { path = path.concat(path.length ? seg.slice(1) : seg); ok++; } else { path.push([pts[i].x, pts[i].y], [pts[i + 1].x, pts[i + 1].y]); bad++; }
  }
  const s = simplify(path, .7); RUTAS[L.id] = s.flatMap(([x, y]) => [Math.round(x * 4), Math.round(y * 4)]);
  console.log(L.id.padEnd(10), (L.name || '').slice(0, 36).padEnd(36), L.stations.length + ' est.', s.length + ' pts');
}
fs.writeFileSync(path.join(root, 'src/data/rutas.js'), '/* Recorridos por calles reales (A* sobre el mapa OSM), generados por tools/rutas.mjs */\nconst RUTAS = ' + JSON.stringify(RUTAS) + ';\n');
console.log(`tramos: ${ok} por calles, ${bad} en línea recta`);
