#!/usr/bin/env node
/* Ajustes del mapa base → src/data/ajustes.js. Se calculan con el propio juego (Chromium + Playwright) sobre el mapa sin ajustes.
   Uso: node tools/build.mjs && node tools/mapa_ajustes.mjs [RUTA_DEL_REPO_DE_JUEGA_ENCICLA v1.2, de 20 m] [--sin-nombres] && node tools/build.mjs
   1) Nombres de calle y barrios donde la capa oficial de Medellín no llega: vías y barrios del mapa de Juega EnCicla
      (misma cuadrícula de 20 m; OpenStreetMap vía Overture, ODbL). Los barrios son aproximados: punto con nombre más cercano.
   2) Río Medellín continuo (puentes donde una vía corta el cauce) y relieve que siempre baja por el cauce (regresión isotónica).
   3) Escaleras sueltas que no conectan con ningún andén, plaza ni vía.
   4) Calle bajo el tranvía de Ayacucho (las casillas de casa que pisa la vía del tranvía pasan a calle).
   5) Patio-taller del Metro en Bello y talleres del antiguo Ferrocarril de Antioquia (polígonos de OpenStreetMap). */
import { createRequire } from 'node:module'; import fs from 'node:fs'; import path from 'node:path'; import zlib from 'node:zlib';
const { chromium } = createRequire(import.meta.url)('playwright');
const ENC = process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : null;   // sin repo de EnCicla: solo río, relieve, escaleras, tranvía y patio (el mapa v3 ya trae nombres y barrios)
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..'), rd = f => fs.readFileSync(path.join(ENC, f));
const vjson = ENC ? JSON.parse(rd('src/data/valle.json')) : null, versionE = ENC ? (String(rd('src/js/00-core.js')).match(/version: '([\d.]+)'/) || [])[1] || '?' : null;
const D = ENC ? { nombres: !process.argv.includes('--sin-nombres'), vias: rd('src/data/vias.bin').toString('base64'), valle: rd('src/data/valle.bin').toString('base64'), barrios: vjson.barrios, calles: vjson.calles, W: vjson.W, H: vjson.H, eW: vjson.eW, eH: vjson.eH, mW: vjson.mW, mH: vjson.mH } : null;
/* OpenStreetMap (© colaboradores, ODbL), consultado el 17-nov-2026: way 52513116 (landuse=railway), 52513115 (building) y 142453569 (landuse=railway) */
const OSM = {
  patio: [[6.33083, -75.55306], [6.33083, -75.55296], [6.32991, -75.55141], [6.32983, -75.55145], [6.32965, -75.55112], [6.32951, -75.55103], [6.32942, -75.55103], [6.3282, -75.55187], [6.32751, -75.55234], [6.32692, -75.55271], [6.32604, -75.55321], [6.325, -75.55382], [6.32443, -75.55411], [6.32399, -75.55428], [6.32338, -75.55444], [6.3216, -75.55473], [6.32107, -75.55483], [6.31968, -75.5552], [6.31924, -75.55535], [6.31995, -75.55547], [6.32059, -75.55549], [6.32069, -75.55557], [6.32166, -75.55563], [6.32208, -75.55565], [6.32245, -75.55559], [6.32336, -75.55546], [6.32415, -75.55533], [6.3252, -75.55517], [6.32669, -75.55494], [6.32781, -75.55468], [6.32858, -75.55437]],
  talleres: [[6.32891, -75.5538], [6.3288, -75.55346], [6.32863, -75.55352], [6.32844, -75.55293], [6.32755, -75.55321], [6.32763, -75.55347], [6.32695, -75.55369], [6.3271, -75.55415], [6.32741, -75.55405], [6.32747, -75.55426]],
  ferrocarril: [[6.33333, -75.55397], [6.33312, -75.55423], [6.3323, -75.55383], [6.33157, -75.55347], [6.33114, -75.55315], [6.33168, -75.55269], [6.33225, -75.55199], [6.33366, -75.55032], [6.33497, -75.55109], [6.33517, -75.55129], [6.33488, -75.55265], [6.33442, -75.55303], [6.33392, -75.55342]]
};

const browser = await chromium.launch(), page = await browser.newPage(), errores = [];
page.on('pageerror', e => errores.push(e.message));
await page.addInitScript(() => { window.__sinAjustes = true; });
await page.goto('file://' + path.join(root, 'dist/index.html')); await page.waitForFunction(() => window.EM && EM.ready, null, { timeout: 90000 });
const R = await page.evaluate(async ({ D, OSM }) => {
  const M = EM.map, t = M.t, VM = VALLE_META, W = VM.W, H = VM.H, TM = VM.tile, N = W * H, inf = {};
  if (D && (D.W !== W || D.H !== H)) throw new Error('el mapa de EnCicla no tiene la misma cuadrícula');
  const unz = async b64 => { const s = atob(b64), u = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i); return new Uint8Array(await new Response(new Blob([u]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer()); };
  const via = v => v === 4 || v === 5 || v === 14 || v === 11, casa = v => v === 2 || v === 3, varint = (a, v) => { while (v > 127) { a.push((v & 127) | 128); v = Math.floor(v / 128); } a.push(v); };

  const extras = async () => {
  // ---- 1a) nombres de calle de EnCicla por casilla (calle, carrera, avenida y autopista con nombre), ensanchados una casilla ----
  const vb = await unz(D.vias), dv = new DataView(vb.buffer); let o = 4; const nomE = new Uint16Array(N);
  for (let v = 0, nV = dv.getUint32(0, true); v < nV; v++) {
    const k = vb[o], cid = dv.getUint16(o + 1, true), n = dv.getUint16(o + 3, true); o += 5; let x = 0, y = 0, px = 0, py = 0;
    for (let i = 0; i < n; i++, o += 4) {
      x += dv.getInt16(o, true); y += dv.getInt16(o + 2, true); const ax = x / 8, ay = y / 8;
      if (i && cid && k >= 1 && k <= 4) { const L = Math.max(1, Math.ceil(Math.hypot(ax - px, ay - py) * 2)); for (let j = 0; j <= L; j++) { const qx = Math.floor(px + (ax - px) * j / L), qy = Math.floor(py + (ay - py) * j / L); if (qx >= 0 && qy >= 0 && qx < W && qy < H) nomE[qy * W + qx] = cid; } }
      px = ax; py = ay;
    }
  }
  const nomD = nomE.slice(); for (let i = 0; i < N; i++) if (!nomD[i]) { const x = i % W; for (const q of [i - 1, i + 1, i - W, i + W]) if (q >= 0 && q < N && Math.abs(q % W - x) <= 1 && nomE[q]) { nomD[i] = nomE[q]; break; } }
  const limpio = s => { s = String(s || '').replace(/\bsur\b/g, 'Sur').replace(/\bnorte\b/g, 'Norte').replace(/\s+/g, ' ').trim(); return /^\d/.test(s) || /^(Salida|Entrada|Acceso|Retorno|Conexión|Glorieta de salida)\b/i.test(s) ? '' : s; };
  const usadas = new Map(), calles = [], idDe = cid => { const s = limpio(D.calles[cid - 1]); if (!s) return 0; if (!usadas.has(s)) { usadas.set(s, calles.length + 1); calles.push(s); } return usadas.get(s); };
  // ---- 1b) un código por casilla de vía SIN nombre oficial, en el orden del juego: 0 izquierda · 1 arriba · 4 arriba-izquierda · 5 arriba-derecha · 2 sin nombre · 3 + varint ----
  const cod = []; let a = new Uint16Array(W), b = new Uint16Array(W), nuevas = 0;
  for (let y = 0; y < H; y++) {
    const z = a; a = b; b = z; b.fill(0);
    for (let k = M.rRow[y]; k < M.rRow[y + 1]; k++) {
      const x = M.rX[k]; if (M.rN[k] || M.rP[k]) continue; const id = nomD[y * W + x] ? idDe(nomD[y * W + x]) : 0; b[x] = id;
      if (!id) cod.push(2); else { nuevas++; if (x > 0 && b[x - 1] === id) cod.push(0); else if (a[x] === id) cod.push(1); else if (x > 0 && a[x - 1] === id) cod.push(4); else if (a[x + 1] === id) cod.push(5); else { cod.push(3); varint(cod, id); } }
    }
  }
  inf.calles = { nombres: calles.length, casillas_nuevas: nuevas };

  // ---- 1c) barrios de EnCicla (celdas de 160 m) solo donde la capa oficial (celdas de 80 m) no tiene barrio y hay casas ----
  const vv = await unz(D.valle), off = N + D.eW * D.eH * 2 + D.mW * D.mH * 2, C = CIUDAD, bg8 = new Uint16Array(D.mW * D.mH), bl = [], bUs = new Map(), acc = [];
  for (let cy = 0; cy < D.mH; cy++) for (let cx = 0; cx < D.mW; cx++) {
    const e = vv[off + 2 * (cy * D.mW + cx)] | vv[off + 2 * (cy * D.mW + cx) + 1] << 8; if (!e) continue;
    let ofi = false; for (let j = 0; j < 2 && !ofi; j++) for (let i = 0; i < 2; i++) { const gx = cx * 2 + i, gy = cy * 2 + j; if (gx < C.GW && gy < C.GH && M.bg[gy * C.GW + gx]) { ofi = true; break; } }
    if (ofi) continue; let cas = 0; for (let j = 0; j < 8; j++) for (let i = 0; i < 8; i++) { const yy = cy * 8 + j, xx = cx * 8 + i; if (yy < H && xx < W && casa(t[yy * W + xx])) cas++; } if (!cas) continue;
    const nm = D.barrios[e - 1]; if (!bUs.has(nm)) { bUs.set(nm, bl.length + 1); bl.push([nm, '', '', 0, 0, 0, 1]); acc.push({ x: 0, y: 0, n: 0, mu: {} }); }
    const id = bUs.get(nm), A = acc[id - 1], mu = M.muniAt((cx * 8 + 4) * TM, (cy * 8 + 4) * TM) || ''; bg8[cy * D.mW + cx] = id; A.x += cx; A.y += cy; A.n++; A.mu[mu] = (A.mu[mu] || 0) + 1;
  }
  bl.forEach((B, i) => { const A = acc[i], mu = Object.entries(A.mu).sort((p, q) => q[1] - p[1])[0][0]; B[1] = mu; B[2] = mu; B[3] = Math.round((A.x / A.n + .5) * 32); B[4] = Math.round((A.y / A.n + .5) * 32); B[5] = Math.round(A.n * 2.56); });
  inf.barrios = { nombres: bl.length, celdas: acc.reduce((s, A) => s + A.n, 0) };

    return { cod, calles, bl, bg8 };
  };
  const ex = D ? await extras() : { cod: [], calles: [], bl: [], bg8: new Uint16Array(0) }, { bl, bg8 } = ex, cod = D && D.nombres ? ex.cod : [], calles = D && D.nombres ? ex.calles : [];
  // ---- 2) río: recorrido por el agua de Caldas a Barbosa (puntos de paso junto a la línea A) ----
  const cerca = (x, y, Rr) => { const tx = x / TM | 0, ty = y / TM | 0; let best = -1, bd = 1e9; for (let dy = -Rr; dy <= Rr; dy++) for (let dx = -Rr; dx <= Rr; dx++) { const i = (ty + dy) * W + tx + dx; if (t[i] === 8 && dx * dx + dy * dy < bd) { bd = dx * dx + dy * dy; best = i; } } return best; };
  const c0 = geoM(6.0905, -75.636), pasos = [cerca(c0.x, c0.y, 80)];
  for (const nm of ['La Estrella', 'Itagüí', 'Industriales', 'Caribe', 'Niquía']) { const s = NET.stations.find(q => q.name === nm); pasos.push(cerca(s.x, s.y, 40)); }
  let norte = -1; for (let i = 0; i < N; i++) if (t[i] === 8 && (norte < 0 || (i / W | 0) < (norte / W | 0)) && M.muniAt(i % W * TM, (i / W | 0) * TM) === 'Barbosa') norte = i; pasos.push(norte);
  const costo = v => v === 8 || v === 11 ? 1 : v === 9 ? 2.5 : via(v) ? 20 : 40, dist = new Float32Array(N), prev = new Int32Array(N), camino = [];
  for (let k = 1; k < pasos.length; k++) {
    const s0 = pasos[k - 1], z = pasos[k], zx = z % W, zy = z / W | 0, heap = [[0, s0]]; dist.fill(1e9); prev.fill(-1); dist[s0] = 0;
    const push = (d, i) => { heap.push([d, i]); let q = heap.length - 1; while (q > 0) { const pq = (q - 1) >> 1; if (heap[pq][0] <= heap[q][0]) break; [heap[pq], heap[q]] = [heap[q], heap[pq]]; q = pq; } };
    const pop = () => { const top = heap[0], last = heap.pop(); if (heap.length) { heap[0] = last; let q = 0; for (;;) { const l = 2 * q + 1, r = l + 1; let s = q; if (l < heap.length && heap[l][0] < heap[s][0]) s = l; if (r < heap.length && heap[r][0] < heap[s][0]) s = r; if (s === q) break; [heap[s], heap[q]] = [heap[q], heap[s]]; q = s; } } return top; };
    while (heap.length) { const j = pop()[1]; if (j === z) break; const x = j % W; for (const q of [j - 1, j + 1, j - W, j + W]) { if (q < 0 || q >= N || Math.abs(q % W - x) > 1) continue; const nd = dist[j] + costo(t[q]); if (nd < dist[q]) { dist[q] = nd; prev[q] = j; push(nd + Math.hypot(q % W - zx, (q / W | 0) - zy), q); } } }
    const tramo = []; for (let j = z; j >= 0 && j !== s0; j = prev[j]) tramo.push(j); tramo.push(s0); tramo.reverse(); if (camino.length) tramo.shift(); camino.push(...tramo);
  }
  const puentes = [], agua = [];
  for (const j of camino) { const v = t[j]; if (v === 8 || v === 9 || v === 11) continue; if (via(v) || v === 7) puentes.push(j); else agua.push(j); }
  // relieve: las esquinas de 80 m que tocan el cauce, en orden, con regresión isotónica (siempre baja); luego se quitan los saltos que queden
  const es = VM.es, eW = VM.eW, E = Int16Array.from(M.E), g = TM * es;
  const esq = j => { const gx = (j % W * TM + 10) / g, gy = ((j / W | 0) * TM + 10) / g, i = Math.floor(gx), k = Math.floor(gy); return [k * eW + i, k * eW + i + 1, (k + 1) * eW + i, (k + 1) * eW + i + 1]; };
  const alto = j => { const gx = (j % W * TM + 10) / g, gy = ((j / W | 0) * TM + 10) / g, i = Math.floor(gx), k = Math.floor(gy), fx = gx - i, fy = gy - k, q = k * eW + i; return (E[q] * (1 - fx) + E[q + 1] * fx) * (1 - fy) + (E[q + eW] * (1 - fx) + E[q + eW + 1] * fx) * fy; };
  const isot = z => { const bl2 = []; for (const v of z) { bl2.push({ v, n: 1 }); while (bl2.length > 1 && bl2[bl2.length - 2].v < bl2[bl2.length - 1].v) { const q2 = bl2.pop(), q1 = bl2.pop(); bl2.push({ v: (q1.v * q1.n + q2.v * q2.n) / (q1.n + q2.n), n: q1.n + q2.n }); } } const r = []; for (const q of bl2) for (let i = 0; i < q.n; i++) r.push(q.v); return r; };
  const seq = [], vis = new Set(); for (const j of camino) for (const c of esq(j)) if (!vis.has(c)) { vis.add(c); seq.push(c); }
  const iz = isot(seq.map(c => E[c])); seq.forEach((c, i) => { E[c] = Math.min(E[c], Math.floor(iz[i])); });
  for (let ronda = 0; ronda < 8; ronda++) { let m = 1e9, cambios = 0; for (const j of camino) { const z = alto(j); if (z > m + .5) { for (const c of esq(j)) if (E[c] > m) { E[c] = Math.floor(m); cambios++; } } else m = Math.min(m, z); } if (!cambios) break; }
  const relieve = []; for (let i = 0; i < E.length; i++) if (E[i] !== M.E[i]) relieve.push(i, E[i]);
  inf.rio = { casillas: camino.length, puentes: puentes.length, agua: agua.length, esquinas_de_relieve: relieve.length / 2 };

  // ---- 3) escaleras sueltas que no tocan andén, plaza, vía, estación ni ciclorruta → el suelo vecino más común ----
  const conecta = v => via(v) || v === 6 || v === 10 || v === 12 || v === 7 || v === 16, escaleras = [];
  for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
    const i = y * W + x; if (t[i] !== 16) continue; const v4 = [t[i - 1], t[i + 1], t[i - W], t[i + W]]; if (v4.some(conecta)) continue;
    const cnt = {}; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const v = t[i + dy * W + dx]; if (v !== 16) cnt[v] = (cnt[v] || 0) + 1; }
    escaleras.push(i, +Object.entries(cnt).sort((p, q) => q[1] - p[1])[0][0]);
  }
  inf.escaleras = escaleras.length / 2;

  // ---- 4) calle bajo el tranvía de Ayacucho ----
  const T = NET.lines.find(l => l.id === 'T'), tranvia = new Set();
  for (let i = 1; i < T.P.pts.length; i++) { const p0 = T.P.pts[i - 1], p1 = T.P.pts[i], L = Math.ceil(Math.hypot(p1.x - p0.x, p1.y - p0.y) / 5); for (let j = 0; j <= L; j++) { const x = (p0.x + (p1.x - p0.x) * j / L) / TM | 0, y = (p0.y + (p1.y - p0.y) * j / L) / TM | 0, q = y * W + x; if (casa(t[q])) tranvia.add(q); } }
  inf.tranvia = tranvia.size;

  // ---- 5) patio-taller del Metro y talleres del Ferrocarril de Antioquia ----
  const poli = pts => { const P = pts.map(([la, lo]) => { const q = geoM(la, lo); return [q.x / TM, q.y / TM]; }), xs = P.map(p => p[0]), ys = P.map(p => p[1]), out = [];
    for (let y = Math.floor(Math.min(...ys)); y <= Math.ceil(Math.max(...ys)); y++) for (let x = Math.floor(Math.min(...xs)); x <= Math.ceil(Math.max(...xs)); x++) {
      let dentro = false; const px = x + .5, py = y + .5; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const [xi, yi] = P[i], [xj, yj] = P[j]; if ((yi > py) !== (yj > py) && px < (xj - xi) * (py - yi) / (yj - yi) + xi) dentro = !dentro; }
      if (dentro) out.push(y * W + x);
    } return out; };
  const cen = pts => { const q = pts.reduce((s, [la, lo]) => [s[0] + la / pts.length, s[1] + lo / pts.length], [0, 0]), m = geoM(q[0], q[1]); return [Math.round(m.x / TM * 4), Math.round(m.y / TM * 4)]; };
  const pa = poli(OSM.patio).filter(i => t[i] !== 8 && t[i] !== 9), ta = poli(OSM.talleres), patio = [];
  for (const i of pa) patio.push(i, 15); for (const i of ta) patio.push(i, 3);
  const lugares = [['Patio-taller del Metro', 'metro', ...cen(OSM.patio), Math.round(pa.length * .04)], ['Talleres del antiguo Ferrocarril de Antioquia', 'historia', ...cen(OSM.ferrocarril), 16]];
  inf.patio = pa.length;
  return { inf, cod, calles, bl, bg8: Array.from(bg8), puentes, agua, relieve, escaleras, tranvia: [...tranvia], patio, lugares, GW: D ? D.mW : 0, GH: D ? D.mH : 0 };
}, { D, OSM });
if (errores.length) { console.error('errores en la página:', errores); process.exit(1); }

const b64 = buf => zlib.deflateRawSync(Buffer.from(buf), { level: 9 }).toString('base64');
const bg = Buffer.alloc(R.bg8.length * 2); R.bg8.forEach((v, i) => bg.writeUInt16LE(v, i * 2));
const AJ = {
  v: 1, encicla: versionE,
  calles: R.cod.length ? { lista: R.calles, n: R.cod.length, d: b64(R.cod) } : null,
  barrios: R.bl.length ? { lista: R.bl, GW: R.GW, GH: R.GH, d: b64(bg) } : null,
  tiles: { puente: R.puentes, agua: R.agua, calle: R.tranvia, pares: [...R.escaleras, ...R.patio] },
  relieve: R.relieve, lugares: R.lugares
};
const txt = `/* Ajustes del mapa base, generados por tools/mapa_ajustes.mjs (no editar a mano).
   ${versionE ? `Nombres de calle y barrios fuera de la capa oficial: mapa de Juega EnCicla v${versionE} (© colaboradores de OpenStreetMap, ODbL, vía Overture Maps); barrios aproximados por el punto con nombre más cercano.` : 'Sobre el mapa v3, que ya trae nombres y barrios: solo río continuo, relieve del cauce, escaleras, calle del tranvía y patio-taller.'}
   Patio-taller del Metro y talleres del Ferrocarril de Antioquia: © colaboradores de OpenStreetMap (ODbL). Río y relieve: calculados sobre el propio mapa. */
const AJUSTES = ${JSON.stringify(AJ)};
`;
fs.writeFileSync(path.join(root, 'src/data/ajustes.js'), txt);
console.log(JSON.stringify(R.inf), '· src/data/ajustes.js', Math.round(txt.length / 1024), 'KB');
await browser.close();
