#!/usr/bin/env node
/* Eje real de las líneas A, B y del tranvía (T) → src/data/rieles.js
   Fuente: vías férreas de OpenStreetMap (© colaboradores de OpenStreetMap, ODbL), descargadas con Overpass:
     [out:json];way["railway"~"^(subway|light_rail|tram|rail)$"](6.14,-75.66,6.37,-75.50);out geom tags;
   Cada línea tiene dos rieles (uno por sentido) dibujados como vías aparte; el eje es el punto medio entre los dos,
   guiado por el trazado simplificado del mapa base (VALLE_META.metro), suavizado y simplificado a 0,35 m.
   Uso: node tools/rieles_datos.mjs RUTA_DEL_JSON_DE_OVERPASS */
import fs from 'node:fs'; import path from 'node:path';
const IN = process.argv[2]; if (!IN) { console.error('Uso: node tools/rieles_datos.mjs RUTA_DEL_JSON_DE_OVERPASS'); process.exit(1); }
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const VM = JSON.parse(fs.readFileSync(path.join(root, 'src/data/valle.js'), 'utf8').match(/const VALLE_META = (\{.*?\});\n/s)[1]);
const TM = VM.tile, P = (lat, lon) => [(lon - VM.lon0) * VM.kx * TM, (VM.latN - lat) * VM.ky * TM];
const osm = JSON.parse(fs.readFileSync(IN, 'utf8')).elements.filter(e => e.type === 'way' && !e.tags.service && e.geometry && e.geometry.length > 1);
const ways = osm.map(e => ({ id: e.id, rw: e.tags.railway, pts: e.geometry.map(g => P(g.lat, g.lon)) }));
const guia = id => { const p = VM.metro[id].p, out = []; for (let i = 0; i < p.length; i += 2) out.push([p[i] * TM / 4, p[i + 1] * TM / 4]); return out; };
const near = (pts, x, y) => { let bd = 1e18, bx = 0, by = 0, bt = 0; for (let i = 1; i < pts.length; i++) { const [ax, ay] = pts[i - 1], [cx, cy] = pts[i], dx = cx - ax, dy = cy - ay, L2 = dx * dx + dy * dy || 1, t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / L2)), px = ax + dx * t, py = ay + dy * t, d = (px - x) ** 2 + (py - y) ** 2; if (d < bd) { bd = d; bx = px; by = py; bt = Math.atan2(dy, dx); } } return { d: Math.sqrt(bd), x: bx, y: by, a: bt }; };
const remuestrea = (G, paso) => { const out = [G[0]]; let acc = 0; for (let i = 1; i < G.length; i++) { const [ax, ay] = G[i - 1], [bx, by] = G[i], L = Math.hypot(bx - ax, by - ay); let t = paso - acc; while (t <= L) { out.push([ax + (bx - ax) * t / L, ay + (by - ay) * t / L]); t += paso; } acc = (acc + L) % paso; } out.push(G[G.length - 1]); return out; };
const rdp = (Q, eps) => { const n = Q.length; if (n < 3) return Q; const keep = new Uint8Array(n); keep[0] = keep[n - 1] = 1; const st = [[0, n - 1]];
  while (st.length) { const [a, b] = st.pop(), [ax, ay] = Q[a], [bx, by] = Q[b], L = Math.hypot(bx - ax, by - ay) || 1; let md = -1, mi = -1; for (let i = a + 1; i < b; i++) { const d = Math.abs((bx - ax) * (ay - Q[i][1]) - (ax - Q[i][0]) * (by - ay)) / L; if (d > md) { md = d; mi = i; } } if (md > eps) { keep[mi] = 1; st.push([a, mi], [mi, b]); } }
  return Q.filter((_, i) => keep[i]); };
const lineas = { A: 'subway', B: 'subway', T: 'tram' }, G = {}, R = {}, info = {};
for (const id in lineas) G[id] = guia(id);
// cada vía se asigna a la línea cuyo trazado guía le queda más cerca (mediana de distancias < 40 m)
const asig = new Map(); for (const w of ways) { let best = null, bm = 40; for (const id in lineas) { if (lineas[id] !== w.rw) continue; const ds = w.pts.map(([x, y]) => near(G[id], x, y).d).sort((a, b) => a - b), m = ds[ds.length >> 1]; if (m < bm) { bm = m; best = id; } } if (best) asig.set(w, best); }
// eje: dos pasadas. 1) cada muestra del trazado guía se lleva al riel más cercano de su línea (hasta 150 m: el trazado
// simplificado se mete por el patio de Bello); 2) sobre ese resultado, punto medio entre los dos rieles (hasta 25 m)
const limpia = C => { const F = [C[0]]; for (let i = 1; i < C.length; i++) { const a = F[F.length - 1], b = C[i]; if (Math.hypot(b[0] - a[0], b[1] - a[1]) < 1.5) continue; if (F.length > 1) { const z = F[F.length - 2], dot = (a[0] - z[0]) * (b[0] - a[0]) + (a[1] - z[1]) * (b[1] - a[1]); if (dot < 0) continue; } F.push(b); } return F; };
const suave = (C, r) => C.map((p, i) => { if (i === 0 || i === C.length - 1) return p; let sx = 0, sy = 0, n = 0; for (let j = Math.max(0, i - r); j <= Math.min(C.length - 1, i + r); j++) { sx += C[j][0]; sy += C[j][1]; n++; } return [sx / n, sy / n]; });
for (const id in lineas) {
  const W = ways.filter(w => asig.get(w) === id); let dos = 0, uno = 0, nada = 0;
  const pasada = (guia, Rmax, medio) => { const S = remuestrea(guia, 6), C = []; dos = uno = nada = 0;
    S.forEach(([x, y], i) => {
      const c = W.map(w => near(w.pts, x, y)).filter(q => q.d < Rmax).sort((a, b) => a.d - b.d); if (!c.length) { nada++; if (i === 0 || i === S.length - 1) C.push([x, y]); return; }
      const p1 = c[0], p2 = medio && c.slice(1).find(q => { const s = Math.hypot(q.x - p1.x, q.y - p1.y); return s > 2.5 && s < 16 && Math.abs(Math.cos(q.a - p1.a)) > .9; });
      if (p2) { C.push([(p1.x + p2.x) / 2, (p1.y + p2.y) / 2]); dos++; } else { C.push([p1.x, p1.y]); uno++; }
    });
    return C; };
  const C1 = suave(limpia(pasada(G[id], 150, false)), 4), C2 = limpia(suave(limpia(pasada(C1, 25, true)), 3));
  const Z = rdp(C2, .35); R[id] = Z.flatMap(([x, y]) => [Math.round(x * 10) / 10, Math.round(y * 10) / 10]);
  let L = 0, giro = 0; for (let i = 1; i < Z.length; i++) { L += Math.hypot(Z[i][0] - Z[i - 1][0], Z[i][1] - Z[i - 1][1]); if (i > 1) { let d = Math.abs(Math.atan2(Z[i][1] - Z[i - 1][1], Z[i][0] - Z[i - 1][0]) - Math.atan2(Z[i - 1][1] - Z[i - 2][1], Z[i - 1][0] - Z[i - 2][0])); if (d > Math.PI) d = 2 * Math.PI - d; giro = Math.max(giro, d); } }
  info[id] = { vias: W.length, dos_rieles: dos, un_riel: uno, sin_dato: nada, puntos: Z.length, km: +(L / 1000).toFixed(2), giro_max: Math.round(giro * 180 / Math.PI) + '°' };
}
const txt = `/* Eje de las líneas A, B y del tranvía de Ayacucho (T), en metros del mapa del valle: punto medio entre los dos rieles de
   OpenStreetMap (© colaboradores de OpenStreetMap, ODbL), suavizado. Generado por tools/rieles_datos.mjs (no editar a mano). */
const RIELES = ${JSON.stringify(R)};
`;
fs.writeFileSync(path.join(root, 'src/data/rieles.js'), txt);
console.log(JSON.stringify(info), '· src/data/rieles.js', Math.round(txt.length / 1024), 'KB');
