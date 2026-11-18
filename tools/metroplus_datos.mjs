#!/usr/bin/env node
/* Corredores reales de Metroplús (líneas 1, 2 y O) → src/data/metroplus.js
   Fuente: src/data/valle.json de Juega EnCicla 1.3 o posterior (campo "mp": el recorrido de cada línea por su carril exclusivo,
   de OpenStreetMap, © colaboradores de OpenStreetMap, ODbL), en la misma proyección del valle (unidades de casilla/vq).
   Las esquinas se redondean (radio de ~8 m) para que el articulado gire sin quiebres.
   Uso: node tools/metroplus_datos.mjs RUTA_DEL_REPO_DE_JUEGA_ENCICLA_1.3 */
import fs from 'node:fs'; import path from 'node:path';
const ENC = process.argv[2]; if (!ENC) { console.error('Uso: node tools/metroplus_datos.mjs RUTA_DEL_REPO_DE_JUEGA_ENCICLA_1.3'); process.exit(1); }
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const meta = JSON.parse(fs.readFileSync(path.join(ENC, 'src/data/valle.json'), 'utf8'));
if (!meta.mp) throw new Error('el valle.json de Juega EnCicla no trae Metroplús (mp)');
const U = meta.tile / meta.vq;
// esquina redondeada: en cada giro de más de 15°, una curva de Bézier de hasta 8 m a cada lado del vértice
const redondea = Q => { const out = [Q[0]]; for (let i = 1; i < Q.length - 1; i++) { const [ax, ay] = Q[i - 1], [bx, by] = Q[i], [cx, cy] = Q[i + 1], L1 = Math.hypot(bx - ax, by - ay), L2 = Math.hypot(cx - bx, cy - by); let d = Math.abs(Math.atan2(cy - by, cx - bx) - Math.atan2(by - ay, bx - ax)); if (d > Math.PI) d = 2 * Math.PI - d; if (d < .26 || L1 < 1 || L2 < 1) { out.push(Q[i]); continue; }
  const r = Math.min(8, L1 * .45, L2 * .45), p0 = [bx - (bx - ax) / L1 * r, by - (by - ay) / L1 * r], p2 = [bx + (cx - bx) / L2 * r, by + (cy - by) / L2 * r]; for (let t = 0; t <= 1.001; t += .2) { const u = 1 - t; out.push([u * u * p0[0] + 2 * u * t * bx + t * t * p2[0], u * u * p0[1] + 2 * u * t * by + t * t * p2[1]]); } }
  out.push(Q[Q.length - 1]); return out; };
const OUT = {}, info = {};
for (const l of meta.mp) {
  const Q = []; for (let i = 0; i < l.p.length; i += 2) { const p = [l.p[i] * U, l.p[i + 1] * U], q = Q[Q.length - 1]; if (!q || Math.hypot(p[0] - q[0], p[1] - q[1]) > .5) Q.push(p); }
  const P = redondea(Q); OUT[l.id] = { p: P.flatMap(([x, y]) => [Math.round(x * 10) / 10, Math.round(y * 10) / 10]), st: l.st.map(([n, a, b]) => [n, Math.round(a * U * 10) / 10, Math.round(b * U * 10) / 10]) };
  let L = 0; for (let i = 1; i < P.length; i++) L += Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]); info[l.id] = { km: +(L / 1000).toFixed(2), puntos: P.length, estaciones: l.st.length };
}
const txt = `/* Corredores reales de Metroplús (líneas 1, 2 y O) con sus estaciones, en metros del mapa del valle: de Juega EnCicla ${meta.version || '1.3'}
   (© colaboradores de OpenStreetMap, ODbL), con las esquinas redondeadas. Generado por tools/metroplus_datos.mjs (no editar a mano). */
const METROPLUS = ${JSON.stringify(OUT)};
`;
fs.writeFileSync(path.join(root, 'src/data/metroplus.js'), txt);
console.log(JSON.stringify(info), '· src/data/metroplus.js', Math.round(txt.length / 1024), 'KB');
