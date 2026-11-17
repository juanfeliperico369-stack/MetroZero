#!/usr/bin/env node
/* Auditoría del mapa: mide con el propio juego qué tan completo y limpio está el mapa del valle.
   Uso: node tools/auditoria-mapa.mjs [--json salida.json] [--img prefijo] [--sin-ajustes]
   - Sin opciones imprime las métricas: tipos de casilla, nombres de calle y barrios por municipio, estaciones,
     líneas, río (continuidad y pendiente), agua, escaleras, relieve y capa de ciudad.
   - --img docs/auditorias/img/AAAA-MM-DD dibuja además cuatro láminas: cobertura, estaciones, agua y escaleras, perfil del río.
   Las métricas son los criterios de aceptación de la hoja de ruta del mapa (docs/auditorias/). Compila antes con node tools/build.mjs */
import { createRequire } from 'node:module'; import fs from 'node:fs';
const { chromium } = createRequire(import.meta.url)('playwright');
const arg = k => process.argv.includes(k) ? process.argv[process.argv.indexOf(k) + 1] : null, JSON_OUT = arg('--json'), IMG = arg('--img');
const browser = await chromium.launch(), page = await browser.newPage({ viewport: { width: 800, height: 600 } }), errores = [];
page.on('pageerror', e => errores.push(e.message));
if (process.argv.includes('--sin-ajustes')) await page.addInitScript(() => { window.__sinAjustes = true; });
await page.goto('file://' + new URL('../dist/index.html', import.meta.url).pathname); await page.waitForFunction(() => window.EM && EM.ready, null, { timeout: 60000 });

const res = await page.evaluate(async conImg => {
  const M = EM.map, t = M.t, VM = VALLE_META, W = VM.W, H = VM.H, TM = VM.tile, N = W * H, m = {}, img = {};
  const NOM = ['pasto', 'monte', 'casa', 'edificio', 'calle', 'avenida', 'andén', 'ciclorruta', 'agua', 'canal', 'plaza', 'puente', 'estación', 'lote', 'autopista', 'patio', 'escaleras'];
  const via = v => v === 4 || v === 5 || v === 14 || v === 11, casa = v => v === 2 || v === 3, agua = v => v === 8 || v === 9, km2 = n => Math.round(n * TM * TM / 1e4) / 100;

  // 1) tipos de casilla
  const tot = new Array(NOM.length).fill(0); for (let i = 0; i < N; i++) tot[t[i]]++;
  m.tipos = Object.fromEntries(NOM.map((n, i) => [n, tot[i]]));

  // 2) nombres de calle y barrios por municipio, y por cuadros de 320 m para la lámina de cobertura
  const conNombre = new Uint8Array(N); for (let y = 0; y < H; y++) for (let k = M.rRow[y]; k < M.rRow[y + 1]; k++) if (M.rN[k] || M.rP[k] || (M.rE && M.rE[k])) conNombre[y * W + M.rX[k]] = 1;
  const C = 16, GW = Math.ceil(W / C), GH = Math.ceil(H / C), cV = new Uint16Array(GW * GH), cN = new Uint16Array(GW * GH), cC = new Uint16Array(GW * GH), cB = new Uint16Array(GW * GH), mun = {};
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = y * W + x, v = t[i]; if (!via(v) && !casa(v) && !agua(v)) continue;
    const nm = M.muniAt(x * TM + 10, y * TM + 10) || '(fuera de los 10 municipios)', o = mun[nm] || (mun[nm] = { vias: 0, conNombre: 0, casas: 0, conBarrio: 0, agua: 0 }), c = (y / C | 0) * GW + (x / C | 0);
    if (via(v)) { o.vias++; cV[c]++; if (conNombre[i]) { o.conNombre++; cN[c]++; } }
    else if (casa(v)) { o.casas++; cC[c]++; if (M.barrioAt(x * TM + 10, y * TM + 10)) { o.conBarrio++; cB[c]++; } }
    else o.agua++;
  }
  m.municipios = Object.fromEntries(Object.entries(mun).map(([k, o]) => [k, { calles_con_nombre_pct: Math.round(o.conNombre / Math.max(1, o.vias) * 100), casas_con_barrio_pct: Math.round(o.conBarrio / Math.max(1, o.casas) * 100), agua_km2: km2(o.agua) }]));

  // 3) estaciones de metro, tranvía y cable: casillas de estación alrededor y suelo bajo el punto real
  const fija = l => l.kind === 'metro' || l.kind === 'tram' || l.kind === 'cable', fijas = NET.stations.filter(s => s.lines.some(fija));
  const suelo = s => t[(s.y / TM | 0) * W + (s.x / TM | 0)];
  const huella = s => { const tx = s.x / TM | 0, ty = s.y / TM | 0; let n = 0; for (let dy = -6; dy <= 6; dy++) for (let dx = -6; dx <= 6; dx++) if (t[(ty + dy) * W + tx + dx] === 12) n++; return n; };
  m.estaciones = { total: fijas.length, sin_huella: fijas.filter(s => !huella(s)).length, sin_huella_nombres: fijas.filter(s => !huella(s)).map(s => s.name), con_techo: (M.techos || []).length, sobre_casas: fijas.filter(s => casa(suelo(s))).map(s => s.name) };

  // 4) metro y tranvía: parte del trazo que pasa sobre casas (el viaducto y el tranvía van sobre vías, el río o espacio libre)
  m.lineas = {};
  for (const l of NET.lines) {
    if (l.kind !== 'metro' && l.kind !== 'tram') continue; const P = l.P.pts; let n = 0, sobre = 0;
    for (let i = 1; i < P.length; i++) { const a = P[i - 1], b = P[i], k = Math.max(1, Math.hypot(b.x - a.x, b.y - a.y) / 10 | 0); for (let j = 0; j < k; j++) { n++; if (casa(t[((a.y + (b.y - a.y) * j / k) / TM | 0) * W + ((a.x + (b.x - a.x) * j / k) / TM | 0)])) sobre++; } }
    m.lineas[l.id] = { tipo: l.kind, puntos_del_trazo: P.length, sobre_casas_pct: Math.round(sobre / n * 100) };
  }

  // 5) agua: cuerpos conectados, manchones de 1 a 4 casillas y superficie
  const comp = new Int32Array(N).fill(-1), tam = [];
  for (let i = 0; i < N; i++) {
    if (!agua(t[i]) || comp[i] >= 0) continue; const id = tam.length, pila = [i]; comp[i] = id; let n = 0;
    while (pila.length) { const j = pila.pop(); n++; const x = j % W; for (const q of [j - 1, j + 1, j - W, j + W]) if (q >= 0 && q < N && comp[q] < 0 && Math.abs(q % W - x) <= 1 && agua(t[q])) { comp[q] = id; pila.push(q); } }
    tam.push(n);
  }
  const manchon = i => comp[i] >= 0 && tam[comp[i]] <= 4;
  m.agua = { cuerpos: tam.length, manchones_1a4_casillas: tam.filter(n => n <= 4).length, rio_y_lagos_km2: km2(tot[8]), quebradas_km2: km2(tot[9]) };

  // 6) escaleras: casillas sueltas (sin otra escalera al lado)
  const suelta = i => t[i] === 16 && t[i - 1] !== 16 && t[i + 1] !== 16 && t[i - W] !== 16 && t[i + W] !== 16;
  let sueltas = 0; for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) if (suelta(y * W + x)) sueltas++;
  let aisladas = 0; for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) { const i = y * W + x; if (suelta(i) && ![t[i - 1], t[i + 1], t[i - W], t[i + W]].some(v => via(v) || v === 6 || v === 10 || v === 12 || v === 7)) aisladas++; }
  m.escaleras = { casillas: tot[16], sueltas, sin_conexion: aisladas };

  // 7) río Medellín: recorrido por el agua de Caldas a Barbosa con puntos de paso junto a la línea A.
  //    A* que prefiere el agua y cruza cada corte por lo más corto; los cortes son casillas del recorrido que no son agua ni puente.
  const cerca = (x, y, R) => { const tx = x / TM | 0, ty = y / TM | 0; let best = -1, bd = 1e9; for (let dy = -R; dy <= R; dy++) for (let dx = -R; dx <= R; dx++) { const i = (ty + dy) * W + tx + dx; if (t[i] === 8 && dx * dx + dy * dy < bd) { bd = dx * dx + dy * dy; best = i; } } return best; };
  const caldas = geoM(6.0905, -75.636), pasos = [cerca(caldas.x, caldas.y, 80)];
  for (const nm of ['La Estrella', 'Itagüí', 'Industriales', 'Caribe', 'Niquía']) { const s = NET.stations.find(q => q.name === nm); pasos.push(cerca(s.x, s.y, 40)); }
  let norte = -1; for (let i = 0; i < N; i++) if (t[i] === 8 && (norte < 0 || (i / W | 0) < (norte / W | 0)) && M.muniAt(i % W * TM, (i / W | 0) * TM) === 'Barbosa') norte = i; pasos.push(norte);
  const costo = v => v === 8 || v === 11 ? 1 : v === 9 ? 2.5 : via(v) ? 20 : 40, dist = new Float32Array(N), prev = new Int32Array(N), camino = [];
  for (let k = 1; k < pasos.length; k++) {
    const a = pasos[k - 1], z = pasos[k], zx = z % W, zy = z / W | 0, heap = [[0, a]]; dist.fill(1e9); prev.fill(-1); dist[a] = 0;
    const push = (d, i) => { heap.push([d, i]); let q = heap.length - 1; while (q > 0) { const pq = (q - 1) >> 1; if (heap[pq][0] <= heap[q][0]) break; [heap[pq], heap[q]] = [heap[q], heap[pq]]; q = pq; } };
    const pop = () => { const top = heap[0], last = heap.pop(); if (heap.length) { heap[0] = last; let q = 0; for (;;) { const l = 2 * q + 1, r = l + 1; let s = q; if (l < heap.length && heap[l][0] < heap[s][0]) s = l; if (r < heap.length && heap[r][0] < heap[s][0]) s = r; if (s === q) break; [heap[s], heap[q]] = [heap[q], heap[s]]; q = s; } } return top; };
    while (heap.length) { const j = pop()[1]; if (j === z) break; const x = j % W; for (const q of [j - 1, j + 1, j - W, j + W]) { if (q < 0 || q >= N || Math.abs(q % W - x) > 1) continue; const nd = dist[j] + costo(t[q]); if (nd < dist[q]) { dist[q] = nd; prev[q] = j; push(nd + Math.hypot(q % W - zx, (q / W | 0) - zy), q); } } }
    const tramo = []; for (let j = z; j >= 0 && j !== a; j = prev[j]) tramo.push(j); tramo.push(a); tramo.reverse(); if (camino.length) tramo.shift(); camino.push(...tramo);
  }
  let cortes = 0, cortadas = 0, dentro = false; const porTipo = {};
  for (const j of camino) { const v = t[j]; if (v === 8 || v === 9 || v === 11) { dentro = false; continue; } cortadas++; porTipo[NOM[v]] = (porTipo[NOM[v]] || 0) + 1; if (!dentro) { cortes++; dentro = true; } }
  // perfil: una muestra cada 200 m (distancia medida en cuerdas de 5 casillas para no contar la escalera de la cuadrícula)
  const perfil = []; let acc = 0, px = null, py = null, sig = 0;
  for (let q = 0; q < camino.length; q += 5) { const j = camino[q], x = j % W * TM + 10, y = (j / W | 0) * TM + 10; if (px !== null) acc += Math.hypot(x - px, y - py); px = x; py = y; if (acc >= sig) { perfil.push({ km: acc / 1000, z: M.elevM(x, y), mu: M.muniAt(x, y) }); sig += 200; } }
  // perfil corregido: regresión isotónica (la curva que siempre baja y más se parece al relieve), por fusión de vecinos que suben
  const bloques = []; for (const s of perfil) { bloques.push({ v: s.z, n: 1 }); while (bloques.length > 1 && bloques[bloques.length - 2].v < bloques[bloques.length - 1].v) { const b2 = bloques.pop(), b1 = bloques.pop(); bloques.push({ v: (b1.v * b1.n + b2.v * b2.n) / (b1.n + b2.n), n: b1.n + b2.n }); } }
  const corregido = []; for (const bl of bloques) for (let i = 0; i < bl.n; i++) corregido.push(bl.v);
  const subidas = []; let maxI = 1; for (let i = 1; i < perfil.length; i++) { const d = perfil[i].z - perfil[i - 1].z; if (d > 3) subidas.push(i); if (d > perfil[maxI].z - perfil[maxI - 1].z) maxI = i; }
  const maxSube = perfil[maxI].z - perfil[maxI - 1].z;
  m.rio = { largo_km: Math.round(acc / 100) / 10, altura_inicio_m: Math.round(perfil[0].z), altura_fin_m: Math.round(perfil[perfil.length - 1].z), inicio: perfil[0].mu, fin: perfil[perfil.length - 1].mu, cortes, casillas_cortadas: cortadas, cortes_por_tipo: porTipo, tramos_que_suben_mas_de_3m: subidas.length, subida_max_m: Math.round(maxSube), donde_sube_mas: perfil[maxI].mu + ', km ' + perfil[maxI].km.toFixed(1), correccion_max_m: Math.round(Math.max(...perfil.map((s, i) => Math.abs(s.z - corregido[i])))) };

  // 8) relieve
  const E = M.E; let zmin = 1e9, zmax = -1e9, empinadas = 0, celdas = 0;
  for (let j = 1; j < VM.eH; j++) for (let i = 1; i < VM.eW; i++) { const e = E[j * VM.eW + i]; zmin = Math.min(zmin, e); zmax = Math.max(zmax, e); celdas++; if (Math.hypot(e - E[j * VM.eW + i - 1], e - E[(j - 1) * VM.eW + i]) / (VM.es * TM) > .45) empinadas++; }
  m.relieve = { min_m: zmin, max_m: zmax, celda_m: VM.es * TM, pendiente_mayor_45_pct: Math.round(empinadas / celdas * 1000) / 10 };
  m.capa_ciudad = { casillas_corregidas: M.parcheN, barrios: CIUDAD.barrios.length, calles_con_nombre: CIUDAD.calles.length - 1, lugares: CIUDAD.lugares.length };
  if (!conImg) return { m, img };

  // ---------- láminas (colores de datos: rampa azul secuencial; rojo solo para marcar problemas) ----------
  await document.fonts.load('16px Cuerpo'); await document.fonts.load('700 16px Titulos');
  const SUP = '#fcfcfb', TX1 = '#0b0b0b', TX2 = '#52514e', REJ = '#e4e3df', TIERRA = '#efeeea', RAMPA = ['#cde2fb', '#86b6ef', '#3987e5', '#1c5cab', '#0d366b'], ROJO = '#d03b3b', AZUL = '#2a78d6', GRIS = '#8d8c87';
  const F = (s, w = 400) => `${w} ${s}px Cuerpo, sans-serif`, FT = s => `700 ${s}px Titulos, Cuerpo, sans-serif`;
  const lienzo = (w, h) => { const c = document.createElement('canvas'); c.width = w * 2; c.height = h * 2; const g = c.getContext('2d'); g.scale(2, 2); g.fillStyle = SUP; g.fillRect(0, 0, w, h); return [c, g]; };
  const halo = (g, txt, x, y) => { g.lineJoin = 'round'; g.strokeStyle = 'rgba(252,252,251,.92)'; g.lineWidth = 3.5; g.strokeText(txt, x, y); g.fillStyle = TX1; g.fillText(txt, x, y); };
  const encabezado = (g, titulo, sub) => { g.fillStyle = TX1; g.font = FT(19); g.fillText(titulo, 20, 28); g.fillStyle = TX2; g.font = F(12.5); g.fillText(sub, 20, 48); };
  const fuente = (g, h, extra = '') => { g.fillStyle = TX2; g.font = F(10.5); g.fillText('Fuente: mapa de El Metro v' + EM.version + ' (OpenStreetMap vía Overture, ODbL; capa oficial de Medellín)' + extra + '.', 20, h - 12); };
  const aro = (g, x, y, r, w = 2) => { g.lineWidth = w + 2; g.strokeStyle = SUP; g.beginPath(); g.arc(x, y, r, 0, 7); g.stroke(); g.lineWidth = w; g.strokeStyle = ROJO; g.stroke(); };

  { // (a) cobertura de nombres de calle y de barrios
    const px = 3, PW = GW * px, PH = GH * px, GAP = 28, TOP = 92, w = 40 + PW * 2 + GAP, h = TOP + PH + 92, [c, g] = lienzo(w, h);
    encabezado(g, '¿Dónde le faltan nombres al mapa?', 'Cada cuadro es de 320 × 320 m. Más oscuro = más completo. La cifra junto al nombre es el promedio del municipio.');
    const mu = M.mu, MW8 = VM.mW, MH8 = VM.mH, k8 = 8 / C * px;
    const ajuste = { 'Itagüí': [-22, 2], 'Sabaneta': [34, 26], 'La Estrella': [8, 8], 'Envigado': [16, 0], 'Copacabana': [-6, 0], 'Girardota': [0, 6] };
    const panel = (ox, titulo, tot, ok, minimo, clave) => {
      g.fillStyle = TX1; g.font = F(14, 700); g.fillText(titulo, ox, TOP - 10); const oy = TOP + 6;
      for (let j = 0; j < MH8; j++) for (let i = 0; i < MW8; i++) if (mu[j * MW8 + i]) { g.fillStyle = TIERRA; g.fillRect(ox + i * k8, oy + j * k8, k8 + .3, k8 + .3); }
      for (let j = 0; j < GH; j++) for (let i = 0; i < GW; i++) { const n = tot[j * GW + i]; if (n < minimo) continue; g.fillStyle = RAMPA[Math.min(4, ok[j * GW + i] / n * 5 | 0)]; g.fillRect(ox + i * px, oy + j * px, px, px); }
      g.fillStyle = 'rgba(82,81,78,.75)';
      for (let j = 0; j < MH8; j++) for (let i = 0; i < MW8; i++) { const a = mu[j * MW8 + i]; if (i + 1 < MW8 && mu[j * MW8 + i + 1] !== a) g.fillRect(ox + (i + 1) * k8 - .5, oy + j * k8, 1, k8 + .3); if (j + 1 < MH8 && mu[(j + 1) * MW8 + i] !== a) g.fillRect(ox + i * k8, oy + (j + 1) * k8 - .5, k8 + .3, 1); }
      const cen = {}; for (let j = 0; j < MH8; j++) for (let i = 0; i < MW8; i++) { const a = mu[j * MW8 + i]; if (!a) continue; const o = cen[a] || (cen[a] = [0, 0, 0]); o[0] += i; o[1] += j; o[2]++; }
      g.font = F(11.5, 700); g.textAlign = 'center';
      for (const [a, o] of Object.entries(cen)) { const nm = VM.munis[a - 1], s = m.municipios[nm]; if (!s) continue; const d = ajuste[nm] || [0, 0]; halo(g, nm + ' ' + s[clave] + ' %', ox + o[0] / o[2] * k8 + d[0], oy + o[1] / o[2] * k8 + d[1]); }
      g.textAlign = 'left';
    };
    panel(20, 'Calles con nombre', cV, cN, 4, 'calles_con_nombre_pct'); panel(20 + PW + GAP, 'Casas dentro de un barrio con nombre', cC, cB, 8, 'casas_con_barrio_pct');
    const ly = TOP + PH + 26; g.font = F(12); g.fillStyle = TX2; g.fillText('Cobertura del cuadro:', 20, ly + 10);
    ['0–20 %', '20–40 %', '40–60 %', '60–80 %', '80–100 %', 'sin calles ni casas'].forEach((s, i) => { const x = 152 + i * 92; g.fillStyle = i < 5 ? RAMPA[i] : TIERRA; g.fillRect(x, ly, 14, 14); g.fillStyle = TX1; g.fillText(s, x + 20, ly + 11); });
    fuente(g, h, '. Medido con tools/auditoria-mapa.mjs'); img.cobertura = c.toDataURL('image/png');
  }

  { // (b) estaciones: el punto real y lo que hay debajo
    const nombres = ['Alpujarra', 'Santo Domingo Savio', 'San Antonio'], CW = 300, GAP = 16, TOP = 64, w = 40 + CW * 3 + GAP * 2, h = TOP + CW + 78, k = .75, [c, g] = lienzo(w, h);
    encabezado(g, m.estaciones.sin_huella ? 'Las estaciones no tienen huella en el mapa' : 'Las estaciones ya tienen huella en el mapa', 'Mapa del juego, 400 m de lado. El aro rojo marca el punto real de la estación; ' + (m.estaciones.sin_huella ? 'debajo no hay andén ni edificio de estación.' : 'encima va su techo con la franja de cada línea.'));
    nombres.forEach((nm, n) => {
      const s = NET.stations.find(q => q.name === nm), ox = 20 + n * (CW + GAP), P = (x, y) => ({ x: CW / 2 + (x - s.x) * k, y: CW / 2 + (y - s.y) * k });
      g.save(); g.translate(ox, TOP); g.beginPath(); g.rect(0, 0, CW, CW); g.clip(); M.drawTop(g, CW, CW, s.x, s.y, k);
      for (const l of NET.lines) { if (!fija(l)) continue; g.lineJoin = g.lineCap = 'round'; for (const [col, lw] of [['#141414', 6], [l.color, 3.5]]) { g.strokeStyle = col; g.lineWidth = lw; g.beginPath(); l.P.pts.forEach((p, i) => { const q = P(p.x, p.y); i ? g.lineTo(q.x, q.y) : g.moveTo(q.x, q.y); }); g.stroke(); } }
      M.drawLabels(g, CW, CW, s.x, s.y, k, 1); aro(g, CW / 2, CW / 2, 15, 3); g.restore();
      g.strokeStyle = REJ; g.lineWidth = 1; g.strokeRect(ox + .5, TOP + .5, CW - 1, CW - 1);
      g.fillStyle = TX1; g.font = F(13.5, 700); g.fillText(nm + ' · ' + s.lines.filter(fija).map(l => l.id).join(', '), ox, TOP + CW + 20);
      g.fillStyle = TX2; g.font = F(12); g.fillText('Suelo bajo el aro: ' + NOM[suelo(s)], ox, TOP + CW + 38);
    });
    fuente(g, h); img.estaciones = c.toDataURL('image/webp', .82);
  }

  { // (c) manchones de agua y escaleras sueltas: la ventana de 960 m con más casos de cada uno
    const VEN = 48, mejor = f => { let best = null; for (let y = 0; y + VEN < H; y += 8) for (let x = 0; x + VEN < W; x += 8) { let n = 0, cons = 0; for (let j = y; j < y + VEN; j += 2) for (let i = x; i < x + VEN; i += 2) if (casa(t[j * W + i])) cons++; if (cons < 120) continue; for (let j = y + 1; j < y + VEN - 1; j++) for (let i = x + 1; i < x + VEN - 1; i++) if (f(j * W + i)) n++; if (!best || n > best.n) best = { x, y, n }; } return best; };
    const CW = 432, k = CW / (VEN * TM), GAP = 20, TOP = 64, w = 40 + CW * 2 + GAP, h = TOP + CW + 84, [c, g] = lienzo(w, h);
    encabezado(g, 'Agua en pedacitos y escaleras sueltas', 'Las dos zonas del valle con más casos (960 m de lado). Cada aro rojo es un caso.');
    const caja = (ox, f, titulo, sub) => {
      const win = mejor(f), mx = (win.x + VEN / 2) * TM, my = (win.y + VEN / 2) * TM, vistos = new Set();
      g.save(); g.translate(ox, TOP); g.beginPath(); g.rect(0, 0, CW, CW); g.clip(); M.drawTop(g, CW, CW, mx, my, k); M.drawLabels(g, CW, CW, mx, my, k, 1);
      for (let j = win.y + 1; j < win.y + VEN - 1; j++) for (let i = win.x + 1; i < win.x + VEN - 1; i++) { const q = j * W + i; if (!f(q)) continue; const key = t[q] === 16 ? 'e' + q : 'a' + comp[q]; if (vistos.has(key)) continue; vistos.add(key); aro(g, (i - win.x + .5) * TM * k, (j - win.y + .5) * TM * k, 7); }
      g.restore(); g.strokeStyle = REJ; g.lineWidth = 1; g.strokeRect(ox + .5, TOP + .5, CW - 1, CW - 1);
      const bar = M.barrioAt(mx, my);
      g.fillStyle = TX1; g.font = F(13.5, 700); g.fillText(titulo + ' · ' + vistos.size + ' casos', ox, TOP + CW + 20);
      g.fillStyle = TX2; g.font = F(12); g.fillText(sub + (bar ? bar[0] + ', ' : '') + M.muniAt(mx, my), ox, TOP + CW + 38);
    };
    caja(20, manchon, 'Manchones de agua de 1 a 4 casillas', 'Quebradas cortadas por calles · '); caja(20 + CW + GAP, suelta, 'Escaleras de una sola casilla', 'Tramos de escalera aislados · ');
    fuente(g, h); img['agua-escaleras'] = c.toDataURL('image/webp', .82);
  }

  { // (d) perfil del río: altura del relieve del juego a lo largo del cauce y perfil corregido propuesto
    const w = 1000, h = 470, L = 70, R = 24, T = 78, B = 96, PW = w - L - R, PH = h - T - B, [c, g] = lienzo(w, h);
    const zmin2 = Math.floor(Math.min(...perfil.map(s => s.z)) / 50) * 50, zmax2 = Math.ceil(Math.max(...perfil.map(s => s.z)) / 50) * 50, kmax = perfil[perfil.length - 1].km;
    const X = km => L + km / kmax * PW, Y = z => T + (1 - (z - zmin2) / (zmax2 - zmin2)) * PH;
    encabezado(g, subidas.length ? 'El río Medellín en el juego: debería bajar siempre' : 'El río Medellín en el juego: siempre baja', `Altura del relieve del juego a lo largo del cauce, de ${m.rio.inicio} a ${m.rio.fin} (${m.rio.largo_km.toLocaleString('es-CO')} km, una muestra cada 200 m).`);
    g.font = F(11.5); g.textAlign = 'right';
    for (let z = zmin2; z <= zmax2; z += 50) { const y = Math.round(Y(z)) + .5; g.strokeStyle = REJ; g.lineWidth = 1; g.beginPath(); g.moveTo(L, y); g.lineTo(L + PW, y); g.stroke(); g.fillStyle = TX2; g.fillText(z.toLocaleString('es-CO') + ' m', L - 8, y + 4); }
    g.textAlign = 'center'; for (let km = 0; km <= kmax; km += 10) { g.fillStyle = TX2; g.fillText(km + ' km', Math.round(X(km)) + .5, T + PH + 18); }
    let ini = 0; g.font = F(11.5, 700);
    for (let i = 1; i <= perfil.length; i++) if (i === perfil.length || perfil[i].mu !== perfil[ini].mu) { const a = perfil[ini].km, b = perfil[i - 1].km, nm = perfil[ini].mu; ini = i; if (!nm || b - a < 2.5) continue; const x0 = X(a) + 2, x1 = X(b) - 2; g.strokeStyle = TX2; g.lineWidth = 1; g.beginPath(); g.moveTo(x0, T + PH + 32); g.lineTo(x1, T + PH + 32); g.stroke(); g.fillStyle = TX1; g.fillText(nm, (x0 + x1) / 2, T + PH + 48); }
    g.lineJoin = g.lineCap = 'round';
    if (subidas.length) { g.strokeStyle = GRIS; g.lineWidth = 1.5; } else g.strokeStyle = 'transparent'; g.beginPath(); corregido.forEach((z, i) => { i ? g.lineTo(X(perfil[i].km), Y(z)) : g.moveTo(X(perfil[i].km), Y(z)); }); g.stroke();
    g.strokeStyle = AZUL; g.lineWidth = 2; g.beginPath(); perfil.forEach((s, i) => { i ? g.lineTo(X(s.km), Y(s.z)) : g.moveTo(X(s.km), Y(s.z)); }); g.stroke();
    for (const i of subidas) { const x = X(perfil[i].km), y = Y(perfil[i].z); g.fillStyle = SUP; g.beginPath(); g.arc(x, y, 6, 0, 7); g.fill(); g.fillStyle = ROJO; g.beginPath(); g.arc(x, y, 4, 0, 7); g.fill(); }
    g.textAlign = 'left'; g.font = F(12, 700); if (subidas.length) halo(g, `▲ sube ${Math.round(maxSube)} m en 200 m`, X(perfil[maxI].km) + 10, Y(perfil[maxI].z) - 10);
    const ly = h - 26; let lx = 20; g.font = F(12);
    const item = (dib, txt) => { dib(lx, ly); g.fillStyle = TX1; g.fillText(txt, lx + 26, ly + 4); lx += 52 + g.measureText(txt).width; };
    item((x, y) => { g.strokeStyle = AZUL; g.lineWidth = 2; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 18, y); g.stroke(); }, 'Altura del cauce en el juego (relieve SRTM)');
    if (subidas.length) { item((x, y) => { g.strokeStyle = GRIS; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 18, y); g.stroke(); }, 'Perfil corregido propuesto (siempre baja)'); item((x, y) => { g.fillStyle = ROJO; g.beginPath(); g.arc(x + 9, y, 4, 0, 7); g.fill(); }, `▲ Tramo que sube más de 3 m (${subidas.length})`); }
    else item(() => { }, 'Cero tramos que suben: el cauce está quemado en el relieve (src/data/ajustes.js)');
    img.rio = c.toDataURL('image/png');
  }
  return { m, img };
}, !!IMG);

if (IMG) for (const [k, v] of Object.entries(res.img)) { const ext = v.startsWith('data:image/webp') ? 'webp' : 'png', f = `${IMG}-${k}.${ext}`; fs.writeFileSync(f, Buffer.from(v.split(',')[1], 'base64')); console.log('lámina:', f); }
if (JSON_OUT) fs.writeFileSync(JSON_OUT, JSON.stringify(res.m, null, 1) + '\n');
console.log(JSON.stringify(res.m, null, 1));
if (errores.length) { console.error('errores en la página:', errores); process.exitCode = 1; }
await browser.close();
