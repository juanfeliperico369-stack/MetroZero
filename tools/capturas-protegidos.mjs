#!/usr/bin/env node
/* =====================================================================
   REGRESIÓN VISUAL DE LOS MODOS PROTEGIDOS (renacimiento cenital, Fase 3)
   El cenital nuevo (97d-cenital.js) solo se enciende en Ciudad Libre y Bus. Esta herramienta captura los modos que NO deben
   cambiar (la cabina y la vista lateral de Conducir, el tranvía, el Volante, el viaje en Metrocable, la Carrera, Despacho,
   Alimentadores, Metroplús, el Metrocable, la guía de Ciudad Libre y la historia de Rosalba) en dos compilaciones y las compara
   píxel a píxel (de día, con la misma semilla y quietas):
     node tools/capturas-protegidos.mjs dist/index.html CARPETA_DESPUES
     node tools/capturas-protegidos.mjs OTRA/dist/index.html CARPETA_ANTES
     node tools/capturas-protegidos.mjs --comparar CARPETA_ANTES CARPETA_DESPUES [--json]
   Lo que se mueve solo (trenes, gente, nubes) cambia un poco aunque el render sea el mismo: se informa la fracción de píxeles
   que difieren más de 24 niveles y se deja la lámina para mirarla.
   ===================================================================== */
import { createRequire } from 'node:module'; import path from 'node:path'; import fs from 'node:fs';
const require = createRequire(import.meta.url), { chromium } = require('playwright'), A = process.argv.slice(2);
const CASOS = [['conduce', 'A:0-2', 'cab', 'conducir-cabina'], ['conduce', 'B:0-2', 'lado', 'conducir-lateral'], ['conduce', 'A:0-2', 'tps', 'conducir-tercera'], ['tranvia', 'T:0-2', 'top', 'tranvia'], ['volante', 'vo:MP1:0-4', 'tps', 'volante'], ['cableviaje', 'cv:K', 'lado', 'metrocable-viaje'], ['carrera', 'cr:A', null, 'carrera'], ['despacho', 'despacho3', null, 'despacho'], ['alim', 'alim3', null, 'alimentadores'], ['metroplus', 'mp3', null, 'metroplus'], ['cable', null, null, 'metrocable'], ['guia', null, null, 'guia'], ['historia', null, null, 'historia-rosalba']];
if (A[0] === '--comparar') {
  const [, a, b] = A, { execFileSync } = await import('node:child_process'), out = [];
  for (const [, , , n] of CASOS) { const fa = path.join(a, n + '.png'), fb = path.join(b, n + '.png'); if (!fs.existsSync(fa) || !fs.existsSync(fb)) { out.push({ caso: n, falta: true }); continue; }
    const r = execFileSync('python3', ['-I', '-c', 'import sys\nfrom PIL import Image, ImageChops\na=Image.open(sys.argv[1]).convert("RGB"); b=Image.open(sys.argv[2]).convert("RGB")\nif a.size!=b.size: print("tam"); sys.exit()\nd=ImageChops.difference(a,b).convert("L"); h=d.histogram(); n=sum(h); print(sum(h[25:])/n)', fa, fb]).toString().trim();
    out.push({ caso: n, difieren: r === 'tam' ? null : +(+r).toFixed(4) }); }
  if (A.includes('--json')) console.log(JSON.stringify(out, null, 1)); else for (const o of out) console.log(o.caso.padEnd(20), o.falta ? 'falta una captura' : o.difieren == null ? 'tamaños distintos' : (o.difieren * 100).toFixed(2) + ' % de los píxeles difieren');
  process.exit(0);
}
const [html, OUT] = A; if (!html || !OUT) { console.error('Uso: node tools/capturas-protegidos.mjs RUTA/dist/index.html CARPETA'); process.exit(1); }
fs.mkdirSync(OUT, { recursive: true });
const b = await chromium.launch({ args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader', '--ignore-gpu-blocklist'] }), page = await (await b.newContext({ viewport: { width: 412, height: 860 }, deviceScaleFactor: 1, hasTouch: true })).newPage(), err = [];
page.on('pageerror', e => err.push(e.message));
await page.goto('file://' + path.resolve(html)); await page.waitForFunction(() => window.EM && EM.ready, null, { timeout: 90000 }); await page.waitForFunction(() => EM.vcity && EM.vcity.on, null, { timeout: 90000 });
await page.evaluate(() => { Save.d.settings.ciclo = 'dia'; Save.d.settings.cal3d = 0; });
for (const [m, lv, v, n] of CASOS) {
  await page.evaluate(([m, lv, v]) => {
    if (EM.game.mode) EM.game.stop(); if (typeof UI !== 'undefined' && UI.close) UI.close();
    if (m === 'guia') { EM.guia.open(); return; }   // la guía (pantalla del menú)
    if (m === 'historia') { EM.story.open(0); EM.story.next(); EM.story.next(); return; }   // la historia de Rosalba, capítulo 1
    const M = EM.modes[m], L = lv && M.levels().find(l => l.id === lv) ? lv : M.levels()[0].id; EM.game.start(m, L, { seed: 5, view: v || undefined, auto: ['conduce', 'tranvia', 'volante', 'cableviaje', 'libre', 'bus', 'carrera'].includes(m) });
  }, [m, lv, v]);
  await page.waitForTimeout(2600); await page.evaluate(() => EM.game.mode && EM.game.freeze(true)); await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(OUT, n + '.png'), timeout: 60000 }); await page.evaluate(() => EM.game.mode && EM.game.freeze(false));
}
const e2 = await page.evaluate(() => EM.errors.slice()); await b.close();
console.log('capturas en', OUT, '·', CASOS.length, 'modos · errores:', err.length + e2.length, err.concat(e2).slice(0, 3));
process.exit(err.length + e2.length ? 1 : 0);
