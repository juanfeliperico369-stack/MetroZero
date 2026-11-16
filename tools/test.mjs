#!/usr/bin/env node
/* Pruebas automáticas en Chromium (Playwright): carga el juego, ejecuta el bot interno
   (selfTest + N partidas), recorre la interfaz y cada modo, y reporta errores de consola.
   Uso: node tools/test.mjs [partidas=100] [--shots carpeta] [--url http://...] */
import { createRequire } from 'node:module'; const { chromium } = createRequire(import.meta.url)('playwright');
import { spawn } from 'node:child_process'; import path from 'node:path'; import fs from 'node:fs';
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const N = +process.argv[2] || 100, shots = process.argv.includes('--shots') ? process.argv[process.argv.indexOf('--shots') + 1] : null;
const ext = process.argv.includes('--url') ? process.argv[process.argv.indexOf('--url') + 1] : null;
let srv = null, url = ext;
if (!url) { srv = spawn(process.execPath, [path.join(root, 'tools/server.mjs'), '8765'], { stdio: 'ignore' }); await new Promise(r => setTimeout(r, 600)); url = 'http://localhost:8765/'; }
const browser = await chromium.launch({ args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader', '--ignore-gpu-blocklist'] }), ctx = await browser.newContext({ viewport: { width: 412, height: 860 }, deviceScaleFactor: 1, hasTouch: true });
const page = await ctx.newPage(), cons = [];
page.on('console', m => { if (m.type() === 'error') cons.push(m.text()); }); page.on('pageerror', e => cons.push('pageerror: ' + e.message));
const t0 = Date.now(); await page.goto(url); await page.waitForFunction(() => window.EM && EM.ready, null, { timeout: 30000 });
console.log('carga:', Date.now() - t0, 'ms');
const self = await page.evaluate(() => EM.test.selfTest());
console.log('selfTest:', self.stats); console.log('  errores:', self.errors.length, self.errors.slice(0, 15)); console.log('  avisos:', self.warnings.length, self.warnings.slice(0, 8));
const t1 = Date.now(); const mk = await page.evaluate(n => EM.test.monkey(n, 1234), N);
console.log(`monkey: ${mk.games} partidas, ${mk.steps} pasos, ${mk.wins} victorias, ${mk.errors.length} errores (${Date.now() - t1} ms)`, mk.errors.slice(0, 15));
// recorrido de interfaz
if (shots) fs.mkdirSync(shots, { recursive: true });
const shot = async n => { if (shots) await page.screenshot({ path: path.join(shots, n + '.png') }); };
await shot('01-portada');
await page.click('#bPlay'); await page.waitForTimeout(300); await shot('02-modos');
for (const [m, lv, extra] of [['conduce', 'A:0-2'], ['conduce', 'A:0-2', 'tps'], ['conduce', 'B:0-2', 'lado'], ['conduce', 'T:0-2', 'top'], ['volante', 'vo:MP1:0-4', 'tps'], ['volante', 'vo:AL-C6-001:0-3', 'top'], ['cableviaje', 'cv:K', 'lado'], ['cableviaje', 'cv:L', 'tps'], ['despacho', 'despacho3'], ['alim', 'alim3'], ['metroplus', 'mp3'], ['cable', null]]) {
  await page.evaluate(([m, lv, v]) => { const M = EM.modes[m]; const L = lv && M.levels().find(l => l.id === lv) ? lv : M.levels()[0].id; EM.game.start(m, L, { seed: 5, view: v || undefined, auto: ['conduce', 'volante', 'cableviaje'].includes(m) }); }, [m, lv, extra]);
  await page.waitForTimeout(['conduce', 'volante', 'cableviaje'].includes(m) ? 3500 : 4000);
  if (!['conduce', 'volante', 'cableviaje'].includes(m)) for (let k = 0; k < 6; k++) await page.evaluate(() => { const a = EM.game.mode.ai(EM.game.st); if (a) EM.game.mode.act(EM.game.st, a); });
  await shot('03-' + m + (extra || '') + (lv ? lv.replace(/[^a-z0-9]/gi, '') : ''));
  await page.evaluate(() => { EM.game.stop(); document.querySelector('#modal').hidden = true; });
}
await page.evaluate(() => EM.game.start('despacho', 'despacho2', { seed: 3, duel: true })); await page.waitForTimeout(1500); await shot('04-duelo'); await page.evaluate(() => EM.game.stop());
await page.evaluate(() => EM.red.open()); await page.waitForTimeout(1200); await shot('05-red');
await page.evaluate(() => EM.story.open(0)); await page.waitForTimeout(600); await page.click('#stNext'); await page.waitForTimeout(300); await shot('06-historia');
await page.evaluate(() => EM.multi.open()); await page.waitForTimeout(800); await shot('07-multi');
const errs = await page.evaluate(() => EM.errors);
console.log('errores capturados en el juego:', errs.length, errs.slice(0, 10));
console.log('errores de consola:', cons.length, cons.slice(0, 10));
await browser.close(); if (srv) srv.kill();
const bad = self.errors.length + mk.errors.length + errs.length + cons.length;
console.log(bad ? 'RESULTADO: ' + bad + ' problemas' : 'RESULTADO: OK, 0 errores'); process.exit(bad ? 1 : 0);
