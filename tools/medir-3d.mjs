// Costo del 3D (Claude, 3.6): vértices y llamadas de dibujo por cuadro, y cuadros por segundo en cada escalón del regulador.
// Medido así se encontró que la red de transporte (830 mil vértices) se dibujaba entera en cada cuadro.
// Uso: node tools/medir-3d.mjs   (Ciudad Libre en San Antonio, vistas cen3d y 3p; escalones 0, 2, 3 y 4 de EM.rendimiento)
import { createRequire } from 'node:module'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const { chromium } = createRequire(import.meta.url)('playwright'), raiz = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 412, height: 860 } })).newPage();
await p.goto('file://' + path.join(raiz, 'dist/index.html')); await p.waitForFunction(() => window.EM && EM.ready && VC.on, null, { timeout: 120000 });
await p.evaluate(() => { const s = EM.save.d.settings; s.voz = 0; s.snd = 0; s.mus = 0; s.ciclo = 'dia'; });
const fps = () => p.evaluate(() => new Promise(r => { let n = 0; const t0 = performance.now(), f = () => { n++; if (performance.now() - t0 < 2500) requestAnimationFrame(f); else r(+(n / ((performance.now() - t0) / 1000)).toFixed(1)); }; requestAnimationFrame(f); }));
const cuadro = () => p.evaluate(() => new Promise(res => { const gl = G3.gl; let n = 0, v = 0, k = 0; const d0 = gl.drawArrays.bind(gl); gl.drawArrays = (m, f, c) => { n++; v += c; return d0(m, f, c); }; const f = () => { if (++k < 6) requestAnimationFrame(f); else { gl.drawArrays = d0; res({ llamadas: Math.round(n / 5), miles_de_vertices: Math.round(v / 5000) }); } }; requestAnimationFrame(() => { n = 0; v = 0; requestAnimationFrame(f); }); }));
for (const vista of ['cen3d', '3p']) for (const nv of [0, 2, 3, 4]) {
  await p.evaluate(([v, nv]) => { EM.save.d.settings.cal3d = nv; if (!EM.game.st || EM.game.mode !== EM.modes.libre) EM.game.start('libre', 'lb:San Antonio', {}); EM.modes.libre.vista(EM.game.st, v); }, [vista, nv]); await p.waitForTimeout(2000);
  console.log(vista, 'escalón', nv, JSON.stringify(await cuadro()), 'fps', await fps());
}
await b.close();
