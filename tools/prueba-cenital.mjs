#!/usr/bin/env node
/* =====================================================================
   PRUEBA DEL CENITAL NUEVO (97d-cenital.js · renacimiento cenital, Fase 2)
   En Chromium (SwiftShader), a 412 × 860, con la bandera apagada y encendida, en San Antonio y Acevedo (donde el techo de la
   estación tapaba al jugador) y en las 6 zonas piloto de la Fase 1:
     1. el jugador se ve: se viste de magenta y se cuentan sus píxeles alrededor de su punto en la pantalla 3D (el techo de
        San Antonio y Acevedo lo tapaba: con la bandera debe verse);
     2. ninguna caja de relleno en el anillo lejano (el contador de 97d debe quedar en 0) y sí edificios reales entre 700 y 1.100 m;
     3. 0 errores (consola y EM.errors).
   Con --huella compara además, con la bandera apagada, las mallas 3D (piso, edificios y red) contra otra compilación
   (--contra RUTA/dist/index.html): deben ser idénticas (en la red, salvo el k + 0,4 de los techos de las estaciones).
   Con --capturas CARPETA deja las capturas «antes» (apagada) y «después» (encendida) a 412 × 860 × 2.
   Uso: node tools/build.mjs && node tools/prueba-cenital.mjs [--capturas CARPETA] [--huella|--solo-huella --contra OTRO/dist/index.html] [--json]
   ===================================================================== */
import { createRequire } from 'node:module'; const { chromium } = createRequire(import.meta.url)('playwright'); import path from 'node:path'; import fs from 'node:fs'; import { fileURLToPath } from 'node:url';
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..'), A = process.argv.slice(2), opt = k => A.includes(k) ? A[A.indexOf(k) + 1] : null;
const CAP = opt('--capturas'), CONTRA = opt('--contra'), SOLO = A.includes('--solo-huella'), HUELLA = SOLO || A.includes('--huella'), JSONOUT = A.includes('--json');
const ZONAS = { 'centro-la-candelaria': [6.2503, -75.5675], 'laureles': [6.2445, -75.5925], 'el-poblado': [6.2087, -75.5677], 'ladera-santo-domingo': [6.2925, -75.5420], 'rio-y-viaducto-industriales': [6.2302, -75.5760], 'rural-santa-elena': [6.2094, -75.4995] };
const ARGS = { args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader', '--ignore-gpu-blocklist'] };
const browser = await chromium.launch(ARGS), errores = [], R = { visibilidad: [], ventanas: [], errores };
async function abrir(html, dpr = 1) {
  const page = await (await browser.newContext({ viewport: { width: 412, height: 860 }, deviceScaleFactor: dpr })).newPage();
  page.on('pageerror', e => errores.push('pageerror: ' + e.message)); page.on('console', m => { if (m.type() === 'error') errores.push(m.text()); });
  await page.goto('file://' + html); await page.waitForFunction(() => window.EM && EM.ready, null, { timeout: 90000 }); await page.waitForFunction(() => EM.vcity && EM.vcity.on, null, { timeout: 90000 });
  return page;
}
/* en la página: viste al jugador de magenta (y su silueta), y tras cada dibujo 3D cuenta sus píxeles alrededor de su punto */
const PREPARA = () => {
  Perfil.ped = () => ({ col: '#ff00ff', pants: '#ff00ff', skin: '#ff00ff', hair: '#ff00ff', gorro: 0 });
  if (EM.cenital) EM.cenital.colSil = [1, 0, 1];
  const d0 = G3.draw; window.__cuenta = null;
  G3.draw = function () { const r = d0.apply(this, arguments); if (window.__leer) { window.__leer = 0; const gl = this.gl, w = this.vw, h = this.vh, st = EM.game.st, z = EM.modes.libre.alto3(st) + .9, q = this.toScreen(st.x, z, st.y, w, h);
    if (!q) { window.__cuenta = { n: -1 }; return r; } const R = Math.round(h * .045), x0 = Math.max(0, Math.round(q.x) - R), y0 = Math.max(0, Math.round(h - q.y) - R), W = Math.min(w - x0, 2 * R + 1), H = Math.min(h - y0, 2 * R + 1), px = new Uint8Array(W * H * 4); gl.readPixels(x0, y0, W, H, gl.RGBA, gl.UNSIGNED_BYTE, px);
    let n = 0; for (let i = 0; i < px.length; i += 4) { const r2 = px[i], g2 = px[i + 1], b2 = px[i + 2]; if (r2 > 70 && b2 > 70 && g2 < .62 * Math.min(r2, b2)) n++; } window.__cuenta = { n, caja: W * H, q: [Math.round(q.x), Math.round(q.y)], w, h }; } return r; };
};
async function ir(page, donde, flag, vista) {
  return page.evaluate(([donde, flag, vista]) => {
    EM.cenital.forzar = flag; const L = EM.modes.libre, VM = VALLE_META;
    if (typeof donde === 'string') { EM.game.stop(); EM.game.start('libre', 'lb:' + donde, { seed: 5 }); }
    else { if (!EM.game.mode || EM.game.mode !== L) EM.game.start('libre', 'lb:San Antonio', { seed: 5 }); L.llevar(EM.game.st, (donde[1] - VM.lon0) * VM.kx * 20, (VM.latN - donde[0]) * VM.ky * 20, false); }
    Save.d.settings.cal3d = 0; Save.d.settings.ciclo = 'dia'; L.vista(EM.game.st, vista); EM.game.freeze(false); return true;
  }, [donde, flag, vista]);
}
async function cuenta(page) {
  await page.evaluate(() => EM.game.freeze(true));
  return page.evaluate(() => { window.__leer = 1; EM.game.frame(); const c = window.__cuenta, st = EM.game.st; return Object.assign({}, c, { modo: st.mode, cen: EM.cenital.n && JSON.parse(JSON.stringify(EM.cenital.n)), win: G3.win && !!G3.win.cen, errores: EM.errors.slice() }); });
}

const html = path.join(root, 'dist', 'index.html'), page = await abrir(html, CAP ? 2 : 1);
await page.evaluate(PREPARA);
if (CAP) fs.mkdirSync(CAP, { recursive: true });
const PUNTOS = SOLO ? [] : [['San Antonio', 'San Antonio'], ['Acevedo', 'Acevedo'], ...Object.entries(ZONAS)];
for (const [nom, donde] of PUNTOS) for (const flag of [false, true]) {
  await ir(page, donde, flag, 'cen3d'); await page.waitForTimeout(typeof donde === 'string' ? 3200 : 2600);
  const c = await cuenta(page); R.visibilidad.push({ punto: nom, bandera: flag, pixeles: c.n, caja: c.caja, modo: c.modo, ventanaCenital: c.win, contadores: c.cen });
  if (c.errores && c.errores.length) errores.push(...c.errores.map(e => nom + ': ' + e));
  if (CAP) await page.screenshot({ path: path.join(CAP, `${flag ? 'despues' : 'antes'}-${nom.toLowerCase().replace(/ /g, '-')}-cen3d.png`), timeout: 60000 });
  if (CAP && typeof donde !== 'string') for (const v of ['2d', ...(nom === 'centro-la-candelaria' || nom === 'ladera-santo-domingo' ? ['dron', '3p'] : [])]) {
    await ir(page, donde, flag, v); await page.waitForTimeout(v === '2d' ? 1800 : 2600); await page.evaluate(() => EM.game.freeze(true)); await page.waitForTimeout(150);
    await page.screenshot({ path: path.join(CAP, `${flag ? 'despues' : 'antes'}-${nom}-${v}.png`), timeout: 60000 });
  }
}
/* Bus (2D) con la bandera: que dibuje sin errores */
for (const flag of SOLO ? [] : [false, true]) { await page.evaluate(f => { EM.cenital.forzar = f; EM.game.stop(); const L = EM.modes.bus.levels(); EM.game.start('bus', L[0].id, { seed: 3 }); EM.game.freeze(false); }, flag); await page.waitForTimeout(2500); if (CAP) { await page.evaluate(() => EM.game.freeze(true)); await page.screenshot({ path: path.join(CAP, `${flag ? 'despues' : 'antes'}-bus.png`), timeout: 60000 }); } }
R.erroresJuego = await page.evaluate(() => EM.errors.slice()); errores.push(...R.erroresJuego);

/* las mallas con la bandera apagada, idénticas a las de otra compilación (la de antes de la Fase 2) */
const HUELLA_JS = async (pg) => pg.evaluate(() => {
  const h32 = (a, norm) => { const u = new Uint32Array(a.buffer, a.byteOffset, a.length); let h = 2166136261 >>> 0; const f = new Float32Array(1), fu = new Uint32Array(f.buffer); for (let i = 0; i < u.length; i++) { let v = u[i]; if (norm && i % 10 === 9) { const k = a[i], fr = k - Math.floor(k); if (Math.abs(fr - .4) < 1e-4) { f[0] = Math.round(k - .4); v = fu[0]; } } h = Math.imul(h ^ v, 16777619) >>> 0; } return h.toString(16); };
  if (EM.cenital) EM.cenital.forzar = false; G3.init(); const b0 = G3.buf, out = {}; let lista = null, norm = false;
  G3.buf = function (arr) { if (lista) lista.push(arr.length + ':' + h32(arr, norm)); return b0.apply(this, arguments); };
  for (const [x, z] of [[14000, 23000], [9000, 17000], [18500, 21500], [12000, 30000]]) { lista = []; G3.buildNear(x, z); out['ventana ' + x + ',' + z] = lista.join(' '); }
  lista = []; norm = true; G3.buildNet(); out.red = lista.join(' '); lista = null; G3.buf = b0; return out;
});
if (HUELLA) {
  const a = await HUELLA_JS(page); let b = null;
  if (CONTRA) { const p2 = await abrir(path.resolve(CONTRA)); b = await HUELLA_JS(p2); await p2.close(); }
  R.huella = Object.keys(a).map(k => ({ malla: k, partes: a[k].split(' ').length, igual: b ? a[k] === b[k] : null }));
}
await browser.close();

const vis = R.visibilidad, falta = [];
for (const v of vis) if (v.bandera && v.contadores && v.contadores.relleno) falta.push(v.punto + ': ' + v.contadores.relleno + ' ventanas con relleno');
for (const p of SOLO ? [] : ['San Antonio', 'Acevedo']) { const on = vis.find(v => v.punto === p && v.bandera); if (!on || !(on.pixeles >= 12)) falta.push(p + ': el jugador no se ve con la bandera (' + (on ? on.pixeles : '?') + ' píxeles)'); }
const algunaVentana = vis.filter(v => v.bandera).some(v => v.contadores && v.contadores.anillo > 0); if (!algunaVentana && !SOLO) falta.push('ninguna ventana con edificios reales en el anillo lejano');
if (R.huella) for (const h of R.huella) if (h.igual === false) falta.push('malla distinta con la bandera apagada: ' + h.malla);
if (errores.length) falta.push(errores.length + ' errores: ' + errores.slice(0, 3).join(' · '));
R.bien = !falta.length; R.falta = falta;
if (JSONOUT) console.log(JSON.stringify(R, null, 1));
else {
  console.log('punto                          bandera  píxeles del jugador  modo   anillo real  zócalos  sombras');
  for (const v of vis) console.log(v.punto.padEnd(30), (v.bandera ? 'sí' : 'no').padEnd(8), String(v.pixeles).padStart(8), '/', String(v.caja).padEnd(8), (v.modo || '').padEnd(6), v.contadores ? String(v.contadores.anillo).padStart(9) : '', v.contadores ? String(v.contadores.zocalos).padStart(9) : '', v.contadores ? String(v.contadores.sombras).padStart(8) : '');
  if (R.huella) for (const h of R.huella) console.log('huella', h.malla.padEnd(22), h.partes, 'partes', h.igual == null ? '(sin --contra)' : h.igual ? 'IGUAL' : 'DISTINTA');
  console.log(R.bien ? 'BIEN · el cenital nuevo pasa' : 'FALLA · ' + falta.join(' | '));
}
process.exit(R.bien ? 0 : 1);
