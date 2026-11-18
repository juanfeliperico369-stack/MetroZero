#!/usr/bin/env node
/* Vías como vectores para dibujar la ciudad con curvas → src/data/vias.js
   Fuente: src/data/vias.bin y valle.json de Juega EnCicla 1.3.1 (misma proyección del valle; casillas de 10 m), con nomenclatura
   oficial de Medellín y ancho de la malla vial cuando existe (© colaboradores de OpenStreetMap, ODbL, vía Overture Maps; Alcaldía de Medellín).
   Uso: node tools/vias_datos.mjs RUTA_DEL_REPO_DE_JUEGA_ENCICLA_1.3
   Guarda: tipo (1 calle, 2 avenida, 3 autopista, 4 carrera, 5 ciclorruta, 6 peatonal, 7 escalas; los senderos de monte no van), nombre
   (nomenclatura oficial o nombre de OSM), ancho en medios metros y puntos en unidades de 2,5 m (delta + varint con signo + deflate). */
import fs from 'node:fs'; import path from 'node:path'; import zlib from 'node:zlib';
const ENC = process.argv[2]; if (!ENC) { console.error('Uso: node tools/vias_datos.mjs RUTA_DEL_REPO_DE_JUEGA_ENCICLA_1.3'); process.exit(1); }
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const meta = JSON.parse(fs.readFileSync(path.join(ENC, 'src/data/valle.json'), 'utf8'));
if (meta.v < 3) throw new Error('hace falta el formato v3 de Juega EnCicla 1.3 o posterior');
const vb = zlib.inflateRawSync(fs.readFileSync(path.join(ENC, 'src/data/vias.bin'))), dv = new DataView(vb.buffer, vb.byteOffset, vb.byteLength);
const U = meta.tile / meta.vq;   // metros por unidad de coordenada (10 m / 4 = 2,5 m)
const out = [], usados = new Map(), nombres = [], idNom = s => { if (!s) return 0; if (!usados.has(s)) { usados.set(s, nombres.length + 1); nombres.push(s); } return usados.get(s); };
const zz = v => v >= 0 ? v * 2 : -v * 2 - 1, varint = v => { while (v > 127) { out.push((v & 127) | 128); v = Math.floor(v / 128); } out.push(v); };
let n = dv.getUint32(0, true), o = 4, kept = 0, pts = 0; const cuenta = {};
const lote = [];
/* Ramer-Douglas-Peucker en unidades de coordenada (tolerancia 0,5 u = 1,25 m: invisible con calles de 7 m o más) */
const rdp = (P, eps) => {
  const n2 = P.length / 2; if (n2 < 3) return P; const keep = new Uint8Array(n2); keep[0] = keep[n2 - 1] = 1; const st = [[0, n2 - 1]];
  while (st.length) { const [a, b] = st.pop(); const ax = P[2 * a], ay = P[2 * a + 1], bx = P[2 * b], by = P[2 * b + 1], L = Math.hypot(bx - ax, by - ay) || 1; let md = -1, mi = -1;
    for (let i = a + 1; i < b; i++) { const d = Math.abs((bx - ax) * (ay - P[2 * i + 1]) - (ax - P[2 * i]) * (by - ay)) / L; if (d > md) { md = d; mi = i; } }
    if (md > eps) { keep[mi] = 1; st.push([a, mi], [mi, b]); } }
  const R = []; for (let i = 0; i < n2; i++) if (keep[i]) R.push(P[2 * i], P[2 * i + 1]); return R;
};
for (let i = 0; i < n; i++) {
  const k = dv.getUint8(o), nm = dv.getUint16(o + 1, true), nom = dv.getUint16(o + 3, true), w2 = dv.getUint8(o + 5), np = dv.getUint16(o + 6, true); o += 8;
  const P = []; let x = 0, y = 0; for (let j = 0; j < np; j++, o += 4) { x += dv.getInt16(o, true); y += dv.getInt16(o + 2, true); P.push(x, y); }
  if (k < 1 || k > 7 || P.length < 4) continue;
  lote.push({ k, name: (nom && meta.calles[nom - 1]) || (nm && meta.calles[nm - 1]) || '', w2, P: rdp(P, .5) });
}
// orden por tipo y, dentro del tipo, por celda de 640 m (el primer punto de cada vía se guarda respecto al anterior)
const celda = v => Math.floor(v.P[1] / 256) * 1000 + Math.floor(v.P[0] / 256);
lote.sort((a, b) => a.k - b.k || celda(a) - celda(b) || a.P[0] - b.P[0]);
const hdr = []; let px = 0, py = 0;   // el primer punto de cada vía va respecto al último de la anterior
for (const v of lote) {
  varint(v.k); varint(idNom(v.name)); varint(v.w2); varint(v.P.length / 2);
  for (let j = 0; j < v.P.length; j += 2) { varint(zz(v.P[j] - px)); varint(zz(v.P[j + 1] - py)); px = v.P[j]; py = v.P[j + 1]; }
  kept++; pts += v.P.length / 2; cuenta[v.k] = (cuenta[v.k] || 0) + 1;
}
const d = zlib.deflateRawSync(Buffer.from(out), { level: 9 }).toString('base64');
const txt = `/* Vías como vectores (calles con su curva y su ancho) de Juega EnCicla ${meta.version || '1.3'}: © colaboradores de OpenStreetMap (ODbL) vía Overture Maps;
   nomenclatura y ancho de la malla vial oficial de Medellín cuando existe. Generado por tools/vias_datos.mjs (no editar a mano).
   Formato: por vía, varint tipo, nombre, ancho (medios metros), puntos y, por punto, deltas con signo en unidades de ${U} m
   (el primero respecto al último punto de la vía anterior). */
const VIAS = ${JSON.stringify({ v: 1, u: U, n: kept, bytes: out.length, nombres, d })};
`;
fs.writeFileSync(path.join(root, 'src/data/vias.js'), txt);
console.log(kept, 'vías ·', pts, 'puntos ·', nombres.length, 'nombres · por tipo', JSON.stringify(cuenta), '· src/data/vias.js', Math.round(txt.length / 1024), 'KB');
