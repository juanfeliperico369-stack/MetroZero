#!/usr/bin/env node
/* =====================================================================
   RENDIMIENTO DEL CENITAL NUEVO (Fase 2): ¿empeora el p95 con la bandera?
   La misma escena de «📏 Medir mi celular» (96d-rendimiento.js): Ciudad Libre en San Antonio, en 3D cenital y en 2D, con el
   regulador fijo en «alta» (cal3d = 0) para comparar lo mismo; la cámara recorre el Centro a 40 m/s (rearma la ventana cercana
   como cuando uno maneja). Alterna apagada/encendida varias veces (A/B/A/B) y da la mediana, el p95 y el peor cuadro.
   En Chromium sin tarjeta gráfica (SwiftShader), el peor caso del proyecto: sirve para comparar, no como cifra de un celular.
   Uso: node tools/build.mjs && node tools/rendimiento-cenital.mjs [segundos=12] [rondas=2] [--cpu 4] [--json]
   ===================================================================== */
import { createRequire } from 'node:module'; const { chromium } = createRequire(import.meta.url)('playwright'); import path from 'node:path'; import { fileURLToPath } from 'node:url';
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..'), A = process.argv.slice(2), num = A.filter(a => /^\d+$/.test(a)).map(Number);
const SEG = num[0] || 12, RONDAS = num[1] || 2, CPU = A.includes('--cpu') ? +A[A.indexOf('--cpu') + 1] : 1, JSONOUT = A.includes('--json');
const browser = await chromium.launch({ args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader', '--ignore-gpu-blocklist'] });
const ctx = await browser.newContext({ viewport: { width: 412, height: 860 }, deviceScaleFactor: 2, hasTouch: true }), page = await ctx.newPage(), errores = [];
page.on('pageerror', e => errores.push(e.message));
await page.goto('file://' + path.join(root, 'dist', 'index.html')); await page.waitForFunction(() => window.EM && EM.ready, null, { timeout: 90000 }); await page.waitForFunction(() => EM.vcity && EM.vcity.on, null, { timeout: 90000 });
if (CPU > 1) { const s = await ctx.newCDPSession(page); await s.send('Emulation.setCPUThrottlingRate', { rate: CPU }); }
const pct = (a, p) => { const b = [...a].sort((x, y) => x - y); return b.length ? b[Math.min(b.length - 1, Math.floor(p * b.length))] : 0; };
async function medir(vista, flag) {
  await page.evaluate(([vista, flag]) => {
    EM.cenital.forzar = flag; const s = Save.d.settings; s.cal3d = 0; s.ciclo = 'dia'; s.q = 'alta'; EM.rendimiento && (EM.rendimiento.nivel = 0);
    EM.game.stop(); EM.game.start('libre', 'lb:San Antonio', { seed: 5 }); const L = EM.modes.libre, st = EM.game.st; L.vista(st, vista);
    st.camLibre = true; if (L._camLibre) L._camLibre(true); window.__cam0 = { x: st.cam.x, y: st.cam.y };
  }, [vista, flag]);
  await page.waitForTimeout(3000);   // calienta: arma la ventana y los trozos
  return page.evaluate(seg => new Promise(res => {
    const st = EM.game.st, c0 = window.__cam0, T = [], t0 = performance.now(); let prev = t0;
    const f = t => { T.push(t - prev); prev = t; const s = (t - t0) / 1000, d = s * 40; st.cam.x = c0.x + Math.cos(.6) * d; st.cam.y = c0.y + Math.sin(.6) * d - 300 * Math.sin(s * .5); if (t - t0 < seg * 1000) requestAnimationFrame(f); else res(T.slice(1)); };
    requestAnimationFrame(f);
  }), SEG);
}
const R = {};
for (const vista of ['cen3d', '2d']) for (let r = 0; r < RONDAS; r++) for (const flag of r % 2 ? [true, false] : [false, true]) {
  const T = await medir(vista, flag), k = vista + (flag ? ' · encendida' : ' · apagada'); (R[k] = R[k] || []).push(...T);
}
const filas = Object.entries(R).map(([k, T]) => ({ caso: k, cuadros: T.length, p50: +pct(T, .5).toFixed(1), p95: +pct(T, .95).toFixed(1), peor: +Math.max(...T).toFixed(1), cps: +(1000 / (T.reduce((a, b) => a + b, 0) / T.length)).toFixed(1) }));
const e = await page.evaluate(() => EM.errors.slice()); errores.push(...e); await browser.close();
if (JSONOUT) console.log(JSON.stringify({ segundos: SEG, rondas: RONDAS, cpu: CPU, filas, errores }, null, 1));
else { console.log(`Ciudad Libre · San Antonio → Centro a 40 m/s · ${SEG} s × ${RONDAS} rondas · CPU ×${CPU} · SwiftShader · 412 × 860 × 2`); console.log('caso                        cuadros   p50 ms   p95 ms   peor ms   cuadros/s'); for (const f of filas) console.log(f.caso.padEnd(26), String(f.cuadros).padStart(7), String(f.p50).padStart(8), String(f.p95).padStart(8), String(f.peor).padStart(9), String(f.cps).padStart(10)); if (errores.length) console.log('errores:', errores.slice(0, 3)); }
