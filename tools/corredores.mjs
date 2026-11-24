#!/usr/bin/env node
/* Corredores que El Metro despeja en tiempo real (11-edificios.js · segsCelda y libre), tal como los arma el propio juego:
   las vías de src/data/vias.js (calles de carros con ancho/2 + 1,3 m; peatonales y escaleras con ancho/2 + 0,3 m), el carril del
   Metroplús (5,5 m) y la vía del tranvía (5 m) de NET.lines (12-red.js, con sus esquinas redondeadas), y las huellas de los hitos.
   Los usa tools/edificios_datos.py (--saneadas) para que ningún edificio exportado quede donde el juego lo recortaría.
   Uso: node tools/build.mjs && node tools/corredores.mjs [SALIDA.json]   (por defecto, tools/cache/corredores.json; no va a git) */
import { createRequire } from 'node:module'; const { chromium } = createRequire(import.meta.url)('playwright');
import { spawn } from 'node:child_process'; import path from 'node:path'; import fs from 'node:fs';
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const salida = path.resolve(process.argv[2] || path.join(root, 'tools', 'cache', 'corredores.json')); fs.mkdirSync(path.dirname(salida), { recursive: true });
if (!fs.existsSync(path.join(root, 'dist', 'index.html'))) { console.error('Primero: node tools/build.mjs'); process.exit(1); }
const PUERTO = 8771, srv = spawn(process.execPath, [path.join(root, 'tools/server.mjs'), String(PUERTO)], { stdio: 'ignore' }); await new Promise(r => setTimeout(r, 600));
const browser = await chromium.launch({ args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader', '--ignore-gpu-blocklist'] });
try {
  const page = await browser.newPage(); const err = []; page.on('pageerror', e => err.push(e.message));
  await page.goto(`http://localhost:${PUERTO}/`); await page.waitForFunction(() => window.EM && EM.ready && EM.vcity && EM.vcity.on && typeof NET !== 'undefined' && NET.lines && NET.lines.length, null, { timeout: 60000 });
  const d = await page.evaluate(() => {
    const VC = EM.vcity, lineas = [];
    for (const l of NET.lines) if (l.kind === 'brt' || l.kind === 'tram') lineas.push({ id: l.id, kind: l.kind, r: l.kind === 'brt' ? 5.5 : 5, pts: l.P.pts.map(p => [p.x, p.y]) });
    return { vias: VC.ch.length, lineas, hitos: (VC.HT || []).map(H => ({ id: H.id, n: H.n, P: H.P.map(Q => Array.from(Q)) })) };
  });
  if (err.length) throw new Error('errores en la página: ' + err.slice(0, 3).join(' · '));
  d.fecha = new Date().toISOString(); d.nota = 'Corredores de El Metro en tiempo real (tools/corredores.mjs): Metroplús y tranvía de NET.lines, y huellas de los hitos (VC.HT).';
  fs.writeFileSync(salida, JSON.stringify(d));
  console.log('corredores de El Metro →', salida, '·', d.vias, 'vías en el juego ·', d.lineas.length, 'líneas de Metroplús y tranvía ·', d.hitos.length, 'hitos');
} finally { await browser.close(); srv.kill(); }
