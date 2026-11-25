#!/usr/bin/env node
/* Pruebas automáticas en Chromium (Playwright): carga el juego, ejecuta el bot interno
   (selfTest + N partidas), recorre la interfaz y cada modo, y reporta errores de consola.
   Uso: node tools/test.mjs [partidas=100] [--shots carpeta] [--url http://...] */
import { createRequire } from 'node:module'; const { chromium } = createRequire(import.meta.url)('playwright');
import { spawn } from 'node:child_process'; import path from 'node:path'; import fs from 'node:fs';
import { probarServidor } from './test-servidor.mjs';
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const N = +process.argv[2] || 100, shots = process.argv.includes('--shots') ? process.argv[process.argv.indexOf('--shots') + 1] : null;
const ext = process.argv.includes('--url') ? process.argv[process.argv.indexOf('--url') + 1] : null;
const srvT = ext ? { pruebas: 0, fallos: [] } : await probarServidor();
if (!ext) console.log(srvT.fallos.length ? 'servidor local: ' + srvT.fallos.length + ' fallos ' + JSON.stringify(srvT.fallos) : 'servidor local: OK, ' + srvT.pruebas + ' comprobaciones');
let srv = null, url = ext;
if (!url) { srv = spawn(process.execPath, [path.join(root, 'tools/server.mjs'), '8765'], { stdio: 'ignore' }); await new Promise(r => setTimeout(r, 600)); url = 'http://localhost:8765/'; }
const browser = await chromium.launch({ args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader', '--ignore-gpu-blocklist'] }), ctx = await browser.newContext({ viewport: { width: 412, height: 860 }, deviceScaleFactor: 1, hasTouch: true });
const page = await ctx.newPage(), cons = [];
page.on('console', m => { if (m.type() === 'error') cons.push(m.text()); }); page.on('pageerror', e => cons.push('pageerror: ' + e.message));
const t0 = Date.now(); await page.goto(url); await page.waitForFunction(() => window.EM && EM.ready, null, { timeout: 30000 });
console.log('carga:', Date.now() - t0, 'ms');
const self = await page.evaluate(() => EM.test.selfTest());
console.log('selfTest:', self.stats); console.log('  errores:', self.errors.length, self.errors.slice(0, 15)); console.log('  avisos:', self.warnings.length, self.warnings.slice(0, 8));
/* 3.10.1 · el guardián del sonido: también en el menú (antes solo se pausaba una partida) */
await page.mouse.click(5, 5); const son = await page.evaluate(async () => {   /* el guardián del sonido (00b-sonido-guardian.js): al salir de la app todo calla, nada vuelve a sonar aunque el juego lo pida y al volver sigue */
  const e = ms => new Promise(r => setTimeout(r, ms)), G = window.guardianSonido; if (!G) return { falta: true };
  const delJuego = G.contextos, A = new AudioContext(); for (let i = 0; i < 20 && A.state !== 'running'; i++) { A.resume(); await e(50); }
  const o = { delJuego, antes: A.state };
  document.dispatchEvent(new Event('pause')); await e(150); o.pausa = A.state; o.fuera = G.fuera;   /* lo que manda Capacitor al pausar la actividad */
  A.resume(); await e(150); o.pideSonar = A.state;
  document.dispatchEvent(new Event('resume')); await e(250); o.vuelve = A.state;
  window.dispatchEvent(new Event('app:pausa')); await e(150); o.appPausa = A.state;   /* lo que manda la actividad nativa */
  window.dispatchEvent(new Event('app:sigue')); await e(250); o.appSigue = A.state;
  A.close(); return o;
});
const sonMal = (s => s.antes === 'running' && s.pausa === 'suspended' && s.fuera && s.pideSonar === 'suspended' && s.vuelve === 'running' && s.appPausa === 'suspended' && s.appSigue === 'running')(son) ? 0 : 1; console.log('guardián del sonido:', sonMal ? 'FALLA' : 'bien', JSON.stringify(son));
const t1 = Date.now(); const mk = await page.evaluate(n => EM.test.monkey(n, 1234), N);
console.log(`monkey: ${mk.games} partidas, ${mk.steps} pasos, ${mk.wins} victorias, ${mk.errors.length} errores (${Date.now() - t1} ms)`, mk.errors.slice(0, 15));
// recorrido de interfaz
if (shots) fs.mkdirSync(shots, { recursive: true });
const shot = async n => { if (!shots) return; await page.evaluate(() => EM.game.freeze(true)); await page.waitForTimeout(150); try { await page.screenshot({ path: path.join(shots, n + '.png'), timeout: 20000 }); } catch (e) { try { await page.screenshot({ path: path.join(shots, n + '.png'), timeout: 60000 }); } catch (e2) { console.log('captura falló:', n); } } await page.evaluate(() => EM.game.freeze(false)); };
await shot('01-portada');
/* mundo abierto primero: ▶ Jugar entra directo a Ciudad Libre; los modos están en «Todos los modos» */
await page.click('#bPlay'); await page.waitForTimeout(1500); { const ok = await page.evaluate(() => EM.game.mode === EM.modes.libre); if (!ok) cons.push('mundo abierto primero: ▶ Jugar no entró directo a Ciudad Libre'); } await shot('02-ciudad-libre');
await page.evaluate(() => EM.game.exit()); await page.waitForTimeout(400); await page.click('#bModos'); await page.waitForTimeout(300); await shot('02b-modos');
for (const [m, lv, extra] of [['bus', 'bus:MP1:0-4'], ['bus', 'bus:AL-C6-001:0-3'], ['libre', 'lb:San Antonio'], ['libre', 'lb:Acevedo'], ['conduce', 'A:0-2'], ['conduce', 'A:0-2', 'tps'], ['conduce', 'B:0-2', 'lado'], ['tranvia', 'T:0-2', 'top'], ['volante', 'vo:MP1:0-4', 'tps'], ['volante', 'vo:AL-C6-001:0-3', 'top'], ['cableviaje', 'cv:K', 'lado'], ['cableviaje', 'cv:L', 'tps'], ['carrera', 'cr:A'], ['despacho', 'despacho3'], ['alim', 'alim3'], ['metroplus', 'mp3'], ['cable', null]]) {
  await page.evaluate(([m, lv, v]) => { const M = EM.modes[m]; const L = lv && M.levels().find(l => l.id === lv) ? lv : M.levels()[0].id; EM.game.start(m, L, { seed: 5, view: v || undefined, auto: ['conduce', 'tranvia', 'volante', 'cableviaje', 'libre', 'bus', 'carrera'].includes(m) }); }, [m, lv, extra]);
  await page.waitForTimeout(['conduce', 'tranvia', 'volante', 'cableviaje', 'libre', 'bus', 'carrera'].includes(m) ? 2800 : 3200);
  if (!['conduce', 'tranvia', 'volante', 'cableviaje', 'libre', 'bus', 'carrera'].includes(m)) for (let k = 0; k < 6; k++) await page.evaluate(() => { const a = EM.game.mode.ai(EM.game.st); if (a) EM.game.mode.act(EM.game.st, a); });
  await shot('03-' + m + (extra || '') + (lv ? lv.replace(/[^a-z0-9]/gi, '') : ''));
  await page.evaluate(() => { EM.game.stop(); document.querySelector('#modal').hidden = true; });
}
/* 3.4.0 · cámaras unificadas (3D Cenital, 1ª persona, Skatepark + Diario RPG) y formato horizontal 860×412 */
await page.evaluate(() => { EM.game.start('libre', 'lb:Exposiciones', { seed: 5 }); const z = EM.mundoRPG.zonas()[0]; EM.modes.libre.llevar(EM.game.st, z.x, z.y, false); EM.modes.libre.vista(EM.game.st, 'cen3d'); });
await page.waitForTimeout(1400); await shot('08-libre-cen3d-skatepark');
await page.evaluate(() => { EM.modes.libre.vista(EM.game.st, '1p'); });
await page.waitForTimeout(900); await shot('08b-libre-1p');
await page.evaluate(() => { EM.mundoRPG.abrir(EM.game.st, 'modos'); });
await page.waitForTimeout(400); await shot('08c-actividades-rpg');
await page.evaluate(() => { document.querySelector('#modal').hidden = true; EM.modes.libre.vista(EM.game.st, '3p'); });
await page.setViewportSize({ width: 860, height: 412 });
await page.waitForTimeout(900); await shot('09-horizontal-libre-3p');
await page.evaluate(() => { EM.game.stop(); EM.game.start('carrera', 'cr:A', { seed: 5, auto: true }); });
await page.waitForTimeout(1400); await shot('09b-horizontal-carrera');
await page.evaluate(() => EM.game.stop());
await page.setViewportSize({ width: 412, height: 860 });
await page.evaluate(() => EM.game.start('despacho', 'despacho2', { seed: 3, duel: true })); await page.waitForTimeout(1500); await shot('04-duelo'); await page.evaluate(() => EM.game.stop());
await page.evaluate(() => EM.red.open()); await page.waitForTimeout(1200); await shot('05-red');
await page.evaluate(() => EM.story.open(0)); await page.waitForTimeout(600); await page.click('#stNext'); await page.waitForTimeout(300); await shot('06-historia');
await page.evaluate(() => EM.multi.open()); await page.waitForTimeout(800); await shot('07-multi');
const errs = await page.evaluate(() => EM.errors);
console.log('errores capturados en el juego:', errs.length, errs.slice(0, 10));
console.log('errores de consola:', cons.length, cons.slice(0, 10));
await browser.close(); if (srv) srv.kill();
const bad = self.errors.length + mk.errors.length + errs.length + cons.length + srvT.fallos.length + sonMal;
console.log(bad ? 'RESULTADO: ' + bad + ' problemas' : 'RESULTADO: OK, 0 errores'); process.exit(bad ? 1 : 0);
