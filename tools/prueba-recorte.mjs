#!/usr/bin/env node
/* PRUEBA DEL RECORTE EN TIEMPO REAL (Motor del Valle 1.3, Fase 1 del renacimiento cenital): con los datos saneados, la red de
   seguridad del juego (11-edificios.js · recorta, dentro de VC.region) no debe cortar ni quitar ningún edificio.
   No cambia el juego: lo carga en Chromium, llama a VC.region en las regiones de muestra y cuenta, en los edificios de cada región,
   los que el juego recortó (b.cut === 1) y los que quitó (b.rec === false: el centro en la calle o en un hito, o no cupo).
   Uso: node tools/build.mjs && node tools/prueba-recorte.mjs [--n 50] [--todas] [--url http://...] [--json SALIDA.json]
        --n N      regiones de muestra (por defecto 50: las 6 zonas piloto y las demás repartidas con semilla fija entre las que tienen casas)
        --todas    todas las regiones del mapa (unas 5.000; tarda varios minutos)
   Sale con 1 si el juego recorta o quita alguno. */
import { createRequire } from 'node:module'; const { chromium } = createRequire(import.meta.url)('playwright');
import { spawn } from 'node:child_process'; import path from 'node:path'; import fs from 'node:fs';
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..'), A = process.argv.slice(2), opt = k => { const i = A.indexOf(k); return i >= 0 ? A[i + 1] : null; };
const N = +(opt('--n') || 50), TODAS = A.includes('--todas'), salida = opt('--json');
let srv = null, url = opt('--url');
if (!url) { srv = spawn(process.execPath, [path.join(root, 'tools/server.mjs'), '8772'], { stdio: 'ignore' }); await new Promise(r => setTimeout(r, 600)); url = 'http://localhost:8772/'; }
// zonas piloto (las de la prueba de craqueo): Centro/La Candelaria, Laureles, El Poblado, ladera nororiental, río y viaducto, y rural
const PILOTO = { 'Centro · La Candelaria': [6.2505, -75.5665], 'Laureles': [6.2445, -75.5925], 'El Poblado': [6.2085, -75.5675], 'Ladera nororiental (Santo Domingo)': [6.2925, -75.5420], 'Río y viaducto (Industriales)': [6.2302, -75.5755], 'Rural (Santa Elena)': [6.2090, -75.4990] };
const browser = await chromium.launch({ args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader', '--ignore-gpu-blocklist'] });
let res;
try {
  const page = await browser.newPage(), err = []; page.on('pageerror', e => err.push(e.message));
  await page.goto(url); await page.waitForFunction(() => window.EM && EM.ready && EM.vcity && EM.vcity.on && EM.vcity.ED, null, { timeout: 90000 });
  res = await page.evaluate(async ({ N, TODAS, PILOTO }) => {
    const VC = EM.vcity, E = VC.ED, R = VC.R, VM = VALLE_META, TMm = 20, m = (la, lo) => [(lo - VM.lon0) * VM.kx * TMm, (VM.latN - la) * VM.ky * TMm];
    const conCasas = []; for (let ry = 0; ry < E.ny; ry++) for (let rx = 0; rx < E.nx; rx++) if (E.cnt[ry * E.nx + rx]) conCasas.push([rx, ry]);
    let regiones = [];
    if (TODAS) regiones = conCasas;
    else {
      const piloto = Object.entries(PILOTO).map(([n, [la, lo]]) => { const [x, y] = m(la, lo); return [Math.floor(x / R), Math.floor(y / R), n]; });
      regiones = piloto.slice(); let s = 12345; const rnd = () => (s = (s * 1103515245 + 12345) % 2147483648) / 2147483648;
      const resto = conCasas.filter(([rx, ry]) => !piloto.some(p => p[0] === rx && p[1] === ry));
      while (regiones.length < N && resto.length) regiones.push(resto.splice(Math.floor(rnd() * resto.length), 1)[0]);
    }
    const out = { regiones: regiones.length, edificios: 0, recortados: 0, quitados: 0, porRegion: [], muestras: [], ms: 0 }, t0 = performance.now();
    for (const [rx, ry, nombre] of regiones) {
      VC.reg.delete(rx * 4096 + ry); VC.region(rx, ry);
      let n = 0, c = 0, q = 0;
      for (const b of VC.edifDe(rx, ry)) { n++; if (b.cut === 1) { c++; if (out.muestras.length < 15) out.muestras.push({ x: +b.x.toFixed(1), y: +b.y.toFixed(1), que: 'recortado' }); } if (b.rec === false) { q++; if (out.muestras.length < 15) out.muestras.push({ x: +b.x.toFixed(1), y: +b.y.toFixed(1), que: 'quitado' }); } }
      out.edificios += n; out.recortados += c; out.quitados += q;
      if (nombre || c || q) out.porRegion.push({ rx, ry, zona: nombre || '', edificios: n, recortados: c, quitados: q });
      if (VC.reg.size > 40) for (const k of [...VC.reg.keys()].slice(0, 20)) VC.reg.delete(k);
    }
    out.ms = Math.round(performance.now() - t0); return out;
  }, { N, TODAS, PILOTO });
  res.erroresConsola = err; res.datos = await page.evaluate(() => ({ edificios_v: EDIFICIOS.v, edificios_n: EDIFICIOS.n, vias_v: VIAS.v || 1, vias_u: VIAS.u }));
} finally { await browser.close(); if (srv) srv.kill(); }
res.resultado = res.recortados === 0 && res.quitados === 0 && !res.erroresConsola.length ? 'BIEN' : 'FALLA';
if (salida) fs.writeFileSync(salida, JSON.stringify(res, null, 1));
console.log(JSON.stringify({ ...res, porRegion: res.porRegion.filter(r => r.zona || r.recortados || r.quitados).slice(0, 30) }, null, 1));
process.exit(res.resultado === 'BIEN' ? 0 : 1);
