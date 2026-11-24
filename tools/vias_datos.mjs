#!/usr/bin/env node
/* Vías como vectores para dibujar la ciudad con curvas → src/data/vias.js
   Dos fuentes:
   · desde el Motor del Valle 1.3 (lo normal desde el 24-nov-2026):
       node tools/vias_datos.mjs --motor RUTA/motor-valle/salida/sanear
     Lee los ejes precisos de las vías (vias_m.bin de geo/build.py, sin simplificar ni redondear) y su rasante (rasante.bin de
     geo/rasante.py). Guarda los puntos en unidades de 0,5 m (antes 2,5 m) con Douglas-Peucker a 0,25 m, sin quitar los vértices
     que comparten dos vías (los cruces). Al final del binario, después de las vías, va el flujo «COTA» (la cota y la pendiente de
     cada vía), que el lector de hoy (11-ciudad2.js) no lee: VIAS.bytes sigue siendo el largo de las vías y VIAS.cota el del flujo.
   · desde vias.bin de Juega EnCicla 1.3 (la forma antigua, puntos de 2,5 m):
       node tools/vias_datos.mjs RUTA_DEL_REPO_DE_JUEGA_ENCICLA_1.3
   Fuente: © colaboradores de OpenStreetMap (ODbL) vía Overture Maps, con nomenclatura oficial de Medellín y ancho de la malla vial
   cuando existe (Alcaldía de Medellín); relieve SRTM (NASA, AWS Terrain Tiles).
   Guarda: tipo (1 calle, 2 avenida, 3 autopista, 4 carrera, 5 ciclorruta, 6 peatonal, 7 escalas; los senderos de monte no van), nombre
   (nomenclatura oficial o nombre de OSM), ancho en medios metros y puntos (delta + varint con signo + deflate).
   Flujo COTA (por vía, en el mismo orden): uvarint n · por nudo: uvarint ds (medios metros a lo largo de la vía), zigzag dz
   (decímetros; el primero absoluto), u8 (capa + 1) | rampa << 2, i8 pendiente hacia el nudo siguiente (medios por ciento). */
import fs from 'node:fs'; import path from 'node:path'; import zlib from 'node:zlib';
const iM = process.argv.indexOf('--motor'), MOTOR = iM > 0 ? path.resolve(process.argv[iM + 1]) : null;
const iC = process.argv.indexOf('--cota'), COTA = iC > 0 ? path.resolve(process.argv[iC + 1]) : null;
const ENC = MOTOR || COTA ? null : process.argv[2]; if (!ENC && !MOTOR && !COTA) { console.error('Uso: node tools/vias_datos.mjs --cota RUTA/motor-valle/salida/sanear/cota-elmetro.bin  |  --motor RUTA/motor-valle/salida/sanear  |  RUTA_DEL_REPO_DE_JUEGA_ENCICLA_1.3'); process.exit(1); }
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
if (COTA) {
  /* ---------- solo la cota: las vías de hoy, intactas, y al final el flujo COTA de motor-valle/geo/rasante.py --elmetro ---------- */
  const f = path.join(root, 'src/data/vias.js'), s = fs.readFileSync(f, 'utf8'), V = JSON.parse(s.match(/const VIAS = (\{.*\});/s)[1]);
  const b = zlib.inflateRawSync(Buffer.from(V.d, 'base64')), vias = b.subarray(0, V.bytes), z = fs.readFileSync(COTA);
  if (z.toString('latin1', 0, 4) !== 'COTA') throw new Error('el archivo de cota no es del Motor del Valle (rasante.py --elmetro)');
  const d = zlib.deflateRawSync(Buffer.concat([vias, z]), { level: 9 }).toString('base64');
  const cab = s.slice(0, s.indexOf('const VIAS = ')).replace(/ \*\/\s*$/, '').replace(/\n   Después de las vías[\s\S]*$/, '').trimEnd().replace(/ \*\/$/, '');
  const txt = cab + `\n   Después de las vías (VIAS.bytes) va el flujo COTA del Motor del Valle 1.3 (motor-valle/geo/rasante.py, relieve SRTM de NASA vía AWS Terrain Tiles), de
   VIAS.cota bytes, que el lector de hoy (11-ciudad2.js) no lee. Por vía, en el mismo orden: uvarint nudos · por nudo: uvarint ds (metros a lo largo
   de la vía) y zigzag dz (cuartos de metro; el primero absoluto) · uvarint eventos · por evento: uvarint nudo y u8 (capa + 1) | rampa << 2.
   La pendiente de cada tramo entre nudos es Δz / Δs (con el tope por clase ya aplicado). */
const VIAS = ${JSON.stringify({ ...V, v: 2, bytes: vias.length, cota: z.length, d })};
`;
  fs.writeFileSync(f, txt);
  console.log('vias.js: las', V.n, 'vías de hoy (', vias.length, 'bytes) + cota', z.length, 'bytes →', Math.round(txt.length / 1024), 'KB (antes', Math.round(s.length / 1024), 'KB)');
  process.exit(0);
}
const out = [], usados = new Map(), nombres = [], idNom = s => { if (!s) return 0; if (!usados.has(s)) { usados.set(s, nombres.length + 1); nombres.push(s); } return usados.get(s); };
const zz = v => v >= 0 ? v * 2 : -v * 2 - 1, varint = (v, o = out) => { while (v > 127) { o.push((v & 127) | 128); v = Math.floor(v / 128); } o.push(v); };
let kept = 0, pts = 0; const cuenta = {};
const lote = [];
/* Ramer-Douglas-Peucker (fijos: vértices que no se pueden quitar) */
const rdp = (P, eps, fijos = null) => {
  const n2 = P.length / 2; if (n2 < 3) return P; const keep = new Uint8Array(n2); keep[0] = keep[n2 - 1] = 1; if (fijos) for (const i of fijos) keep[i] = 1;
  const st = []; let a0 = 0; for (let i = 1; i < n2; i++) if (keep[i]) { st.push([a0, i]); a0 = i; }
  while (st.length) { const [a, b] = st.pop(); const ax = P[2 * a], ay = P[2 * a + 1], bx = P[2 * b], by = P[2 * b + 1], L = Math.hypot(bx - ax, by - ay) || 1; let md = -1, mi = -1;
    for (let i = a + 1; i < b; i++) { const d = Math.abs((bx - ax) * (ay - P[2 * i + 1]) - (ax - P[2 * i]) * (by - ay)) / L; if (d > md) { md = d; mi = i; } }
    if (md > eps) { keep[mi] = 1; st.push([a, mi], [mi, b]); } }
  const R = []; for (let i = 0; i < n2; i++) if (keep[i]) R.push(P[2 * i], P[2 * i + 1]); return R;
};
let U, fuente, ras = null;
if (MOTOR) {
  /* ---------- Motor del Valle 1.3: ejes precisos (metros, float32) ---------- */
  U = +(process.env.VIAS_U || .5); const Q = 1 / U, EPS = +(process.env.VIAS_EPS || .25);
  const vm = zlib.inflateSync(fs.readFileSync(path.join(MOTOR, 'vias_m.bin'))), dv = new DataView(vm.buffer, vm.byteOffset, vm.byteLength), calles = JSON.parse(fs.readFileSync(path.join(MOTOR, 'vias_m.bin.json'), 'utf8')).calles;
  if (vm.toString('latin1', 0, 4) !== 'VIAM') throw new Error('vias_m.bin no es del Motor del Valle');
  const n = dv.getUint32(8, true); let o = 12; const V = [];
  for (let i = 0; i < n; i++) { const k = dv.getUint8(o), nm = dv.getUint16(o + 1, true), nom = dv.getUint16(o + 3, true), w2 = dv.getUint8(o + 5), np = dv.getUint32(o + 6, true); o += 10; const P = new Float64Array(np * 2); for (let j = 0; j < np * 2; j++) P[j] = dv.getFloat32(o + 4 * j, true); o += np * 8; V.push({ i, k, nm, nom, w2, P }); }
  // cruces: vértices que comparten dos o más vías (o una vía consigo misma), al centímetro
  const key = (x, y) => Math.round(x * 20) + ',' + Math.round(y * 20), veces = new Map();
  for (const v of V) for (let j = 0; j < v.P.length; j += 2) { const kk = key(v.P[j], v.P[j + 1]); veces.set(kk, (veces.get(kk) || 0) + 1); }
  for (const v of V) {
    if (v.k < 1 || v.k > 7 || v.P.length < 4) continue;
    const fijos = []; for (let j = 0; j < v.P.length; j += 2) if (veces.get(key(v.P[j], v.P[j + 1])) > 1) fijos.push(j / 2);
    const R = rdp(v.P, EPS, fijos), P = []; for (let j = 0; j < R.length; j += 2) { const x = Math.round(R[j] * Q), y = Math.round(R[j + 1] * Q); if (P.length && P[P.length - 2] === x && P[P.length - 1] === y) continue; P.push(x, y); }
    if (P.length < 4) continue;
    lote.push({ src: v.i, k: v.k, name: (v.nom && calles[v.nom - 1]) || (v.nm && calles[v.nm - 1]) || '', w2: v.w2, P });
  }
  fuente = 'del Motor del Valle 1.3 (ejes precisos de geo/build.py)';
  // rasante: nudos (x, y, z, s, capa, rampa) por eje preciso
  const rp = path.join(MOTOR, 'rasante.bin');
  if (fs.existsSync(rp)) {
    const rb = zlib.inflateSync(fs.readFileSync(rp)), rv = new DataView(rb.buffer, rb.byteOffset, rb.byteLength); if (rb.toString('latin1', 0, 4) !== 'RAS1') throw new Error('rasante.bin no es del Motor del Valle');
    const nr = rv.getUint32(8, true); let q = 12; ras = [];
    for (let i = 0; i < nr; i++) { const m = rv.getUint32(q, true); q += 4; const K = []; for (let j = 0; j < m; j++, q += 18) K.push({ x: rv.getFloat32(q, true), y: rv.getFloat32(q + 4, true), z: rv.getFloat32(q + 8, true), capa: rv.getInt8(q + 16), rampa: rv.getUint8(q + 17) }); ras.push(K); }
  }
} else {
  /* ---------- la forma antigua: vias.bin de Juega EnCicla (puntos de 2,5 m) ---------- */
  const meta = JSON.parse(fs.readFileSync(path.join(ENC, 'src/data/valle.json'), 'utf8'));
  if (meta.v < 3) throw new Error('hace falta el formato v3 de Juega EnCicla 1.3 o posterior');
  const vb = zlib.inflateRawSync(fs.readFileSync(path.join(ENC, 'src/data/vias.bin'))), dv = new DataView(vb.buffer, vb.byteOffset, vb.byteLength);
  U = meta.tile / meta.vq;   // metros por unidad de coordenada (10 m / 4 = 2,5 m)
  let n = dv.getUint32(0, true), o = 4;
  for (let i = 0; i < n; i++) {
    const k = dv.getUint8(o), nm = dv.getUint16(o + 1, true), nom = dv.getUint16(o + 3, true), w2 = dv.getUint8(o + 5), np = dv.getUint16(o + 6, true); o += 8;
    const P = []; let x = 0, y = 0; for (let j = 0; j < np; j++, o += 4) { x += dv.getInt16(o, true); y += dv.getInt16(o + 2, true); P.push(x, y); }
    if (k < 1 || k > 7 || P.length < 4) continue;
    lote.push({ k, name: (nom && meta.calles[nom - 1]) || (nm && meta.calles[nm - 1]) || '', w2, P: rdp(P, .5) });   // tolerancia 0,5 u = 1,25 m
  }
  fuente = 'de Juega EnCicla ' + (meta.version || '1.3');
}
// orden por tipo y, dentro del tipo, por celda de 640 m (el primer punto de cada vía se guarda respecto al anterior)
const C640 = 640 / U, celda = v => Math.floor(v.P[1] / C640) * 1000 + Math.floor(v.P[0] / C640);
lote.sort((a, b) => a.k - b.k || celda(a) - celda(b) || a.P[0] - b.P[0]);
let px = 0, py = 0;
for (const v of lote) {
  varint(v.k); varint(idNom(v.name)); varint(v.w2); varint(v.P.length / 2);
  for (let j = 0; j < v.P.length; j += 2) { varint(zz(v.P[j] - px)); varint(zz(v.P[j + 1] - py)); px = v.P[j]; py = v.P[j + 1]; }
  kept++; pts += v.P.length / 2; cuenta[v.k] = (cuenta[v.k] || 0) + 1;
}
const bytesVias = out.length; let cota = 0, nudos = 0;
if (ras) {
  /* flujo COTA: los nudos de la rasante proyectados sobre cada vía tal como queda guardada */
  const Z = [0x43, 0x4f, 0x54, 0x41, 1]; varint(lote.length, Z);
  for (const v of lote) {
    const K = ras[v.src] || [], P = v.P, cum = [0]; for (let j = 2; j < P.length; j += 2) cum.push(cum[cum.length - 1] + Math.hypot(P[j] - P[j - 2], P[j + 1] - P[j - 1]) * U);
    const proyecta = (x, y) => { let bd = 1e18, bs = 0; for (let j = 2; j < P.length; j += 2) { const ax = P[j - 2] * U, ay = P[j - 1] * U, dx = P[j] * U - ax, dy = P[j + 1] * U - ay, l2 = dx * dx + dy * dy || 1, t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / l2)), qx = ax + dx * t - x, qy = ay + dy * t - y, d = qx * qx + qy * qy; if (d < bd) { bd = d; bs = cum[j / 2 - 1] + Math.sqrt(l2) * t; } } return bs; };
    const N = K.map(k => ({ s: proyecta(k.x, k.y), z: k.z, capa: k.capa, rampa: k.rampa })).sort((a, b) => a.s - b.s);
    varint(N.length, Z); let ps = 0, pz = 0;
    for (let i = 0; i < N.length; i++) {
      const q = Math.round(N[i].s * 2); varint(Math.max(0, q - ps), Z); ps = Math.max(ps, q); const zd = Math.round(N[i].z * 10); varint(zz(zd - pz), Z); pz = zd;
      const g = i === N.length - 1 ? 0 : (N[i + 1].z - N[i].z) / Math.max(N[i + 1].s - N[i].s, .5);
      Z.push(((N[i].capa + 1) & 3) | (N[i].rampa ? 4 : 0)); Z.push((Math.max(-127, Math.min(127, Math.round(g * 200))) + 256) & 255);
    }
    nudos += N.length;
  }
  cota = Z.length; for (const b of Z) out.push(b);
}
const d = zlib.deflateRawSync(Buffer.from(out), { level: 9 }).toString('base64');
const txt = `/* Vías como vectores (calles con su curva y su ancho) ${fuente}: © colaboradores de OpenStreetMap (ODbL) vía Overture Maps;
   nomenclatura y ancho de la malla vial oficial de Medellín cuando existe${ras ? '; rasante con el relieve SRTM (NASA, AWS Terrain Tiles)' : ''}. Generado por tools/vias_datos.mjs (no editar a mano).
   Formato: por vía, varint tipo, nombre, ancho (medios metros), puntos y, por punto, deltas con signo en unidades de ${U} m
   (el primero respecto al último punto de la vía anterior).${ras ? ' Después de las vías (VIAS.bytes), el flujo COTA de VIAS.cota bytes: por vía, sus nudos de\n   rasante (distancia a lo largo de la vía en medios metros, cota en decímetros, capa y rampa, y la pendiente en medios por ciento).' : ''} */
const VIAS = ${JSON.stringify(ras ? { v: 2, u: U, n: kept, bytes: bytesVias, cota, nombres, d } : { v: 1, u: U, n: kept, bytes: out.length, nombres, d })};
`;
fs.writeFileSync(path.join(root, 'src/data/vias.js'), txt);
console.log(kept, 'vías ·', pts, 'puntos ·', nombres.length, 'nombres · por tipo', JSON.stringify(cuenta), ras ? `· cota: ${nudos} nudos, ${cota} bytes` : '', '· src/data/vias.js', Math.round(txt.length / 1024), 'KB');
