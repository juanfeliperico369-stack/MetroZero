#!/usr/bin/env node
/* =====================================================================
   PRUEBA DE LAS RUTAS A* CONTRA LOS EDIFICIOS SANEADOS (renacimiento cenital, Fase 3)
   Las rutas de bus por las calles (src/data/rutas_calles.js, hechas con A* sobre vias.js) no deben cruzar ningún edificio:
   se recorre cada ruta cada 2 m y se mira, con los mismos datos y funciones del juego (VC.edifDe, VC.enPol), si el bus
   (medio ancho de 1,25 m) tocaría una casa. Con la Fase 1 (edificios.js v2 con su guarda) debe dar 0.
   Uso: node tools/build.mjs && node tools/prueba-rutas.mjs [--margen 1.25] [--json]
   ===================================================================== */
import { createRequire } from 'node:module'; const { chromium } = createRequire(import.meta.url)('playwright'); import path from 'node:path'; import { fileURLToPath } from 'node:url';
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..'), A = process.argv.slice(2), MARGEN = A.includes('--margen') ? +A[A.indexOf('--margen') + 1] : 1.25, JSONOUT = A.includes('--json');
const b = await chromium.launch(), page = await (await b.newContext({ viewport: { width: 412, height: 860 } })).newPage(), errores = [];
page.on('pageerror', e => errores.push(e.message));
await page.goto('file://' + path.join(root, 'dist', 'index.html')); await page.waitForFunction(() => window.EM && EM.ready && EM.vcity && EM.vcity.ED, null, { timeout: 90000 });
const R = await page.evaluate(m => {
  const out = []; if (typeof RUTAS_CALLES === 'undefined') return { error: 'sin RUTAS_CALLES' };
  const toca = (b, x, y) => { if (b.P) return VC.enPol(b.P, x, y, m); const lx = (x - b.x) * b.ux + (y - b.y) * b.uy, ly = -(x - b.x) * b.uy + (y - b.y) * b.ux; return Math.abs(lx) < b.hw + m && Math.abs(ly) < b.hd + m; };
  for (const [id, P] of Object.entries(RUTAS_CALLES)) {
    let pts = 0, n = 0; const ej = [];
    for (let i = 2; i < P.length; i += 2) {
      const ax = P[i - 2], ay = P[i - 1], bx = P[i], by = P[i + 1], L = Math.hypot(bx - ax, by - ay), k = Math.max(1, Math.ceil(L / 2));
      for (let j = 0; j < k; j++) { const x = ax + (bx - ax) * j / k, y = ay + (by - ay) * j / k; pts++; let hit = null;
        for (let dy = -1; dy <= 1 && !hit; dy++) for (let dx = -1; dx <= 1 && !hit; dx++) for (const b of VC.edifDe(Math.floor(x / VC.R) + dx, Math.floor(y / VC.R) + dy)) { const rr = b.hw + b.hd + m + 1; if (Math.abs(b.x - x) > rr || Math.abs(b.y - y) > rr) continue; if (toca(b, x, y)) { hit = b; break; } }
        if (hit) { n++; if (ej.length < 4) ej.push([Math.round(x), Math.round(y)]); } }
    }
    out.push({ ruta: id, puntos: pts, tocan: n, ejemplos: ej });
  }
  return { rutas: out };
}, MARGEN);
await b.close();
if (R.error) { console.error(R.error); process.exit(1); }
const tot = R.rutas.reduce((a, r) => a + r.tocan, 0), pts = R.rutas.reduce((a, r) => a + r.puntos, 0);
if (JSONOUT) console.log(JSON.stringify({ margen: MARGEN, puntos: pts, tocan: tot, rutas: R.rutas, errores }, null, 1));
else { for (const r of R.rutas.filter(r => r.tocan)) console.log('  ✗', r.ruta, r.tocan, 'de', r.puntos, 'puntos tocan una casa · p. ej.', JSON.stringify(r.ejemplos)); console.log(`${R.rutas.length} rutas · ${pts} puntos cada 2 m · margen ${MARGEN} m: ${tot} tocan una casa · ${errores.length} errores`); console.log(tot || errores.length ? 'FALLA' : 'BIEN · ninguna ruta A* cruza un edificio saneado'); }
process.exit(tot || errores.length ? 1 : 0);
