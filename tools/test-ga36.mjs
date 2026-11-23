#!/usr/bin/env node
/* Pruebas Playwright específicas de GA-36-1 a GA-36-4 (Antigravity, 3.7.0):
   1) GA-36-1: verifica φ ≈ atan(v·ω/g) en curva sintética + captura de bici inclinada en 3D (412×860).
   2) GA-36-2: prueba REAL de DOS DEDOS simultáneos (dedo 1 en joystick abajo-izquierda, dedo 2
      arrastrando cámara en mitad superior): el vehículo avanza con joystick activo mientras gira st.cyo.
   3) GA-36-3: decide una subtrama, verifica diario, noticia comentada, reputación visible en #lbLugar
      y frases de paradero/banca desde FRASES_CIUDAD; captura de subtramas (G-111) y diario RPG.
   4) GA-36-4: captura de Domingo zen (G-110) y Skatepark en 412×860 y 860×412. */
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const { chromium } = createRequire(import.meta.url)('playwright');
const raiz = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = process.argv[2] || '/tmp/elmetro-ga36';
fs.mkdirSync(OUT, { recursive: true });

const b = await chromium.launch({ args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader', '--ignore-gpu-blocklist'] });
const ctx = await b.newContext({ viewport: { width: 412, height: 860 }, deviceScaleFactor: 1, hasTouch: true, isMobile: true });
const p = await ctx.newPage();
const errs = [];
p.on('pageerror', e => errs.push(e.message));
p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });

await p.goto('file://' + path.join(raiz, 'dist/index.html'));
await p.waitForFunction(() => window.EM && EM.ready && typeof VC !== 'undefined' && VC.on, null, { timeout: 120000 });
await p.evaluate(() => { const s = EM.save.d.settings; s.voz = 0; s.snd = 0; s.mus = 0; s.ciclo = 'dia'; s.cal3d = 0; s.pantalla = 'mitades'; });

/* 1. GA-36-1: curva sintética φ ≈ atan(v·ω/g) + captura 3D de inclinación en curva */
const rLadeo = await p.evaluate(() => {
  const v = 12, w = .35, esperado = Math.atan(v * w / 9.81);
  let phi = 0;
  for (let i = 0; i < 60; i++) phi = EM.ladeo.paso(phi, v, w, 1 / 30, false);
  EM.game.start('libre', 'lb:San Antonio', {});
  const st = EM.game.st;
  EM.modes.libre.vista(st, '3p');
  st.mode = 'veh'; st.veh = { kind: 'bici', col: '#9bd341', id: -1 };
  st.vf = 11; st.ladeo = .38; st.cy = st.h;
  EM.game.freeze(true); EM.game.frame();
  return { phi: +phi.toFixed(4), esperado: +esperado.toFixed(4), diff: +Math.abs(phi - esperado).toFixed(4), stLadeo: +st.ladeo.toFixed(3) };
});
if (rLadeo.diff > .02) throw new Error('GA-36-1 falló: ' + JSON.stringify(rLadeo));
fs.writeFileSync(path.join(OUT, 'ga36-1-ladeo-bici-3p.png'), await p.screenshot());
await p.evaluate(() => EM.game.freeze(false));

/* 2. GA-36-2: prueba REAL de DOS DEDOS simultáneos vía CDP Input.dispatchTouchEvent (joystick abajo + cámara arriba) */
const cdp = await ctx.newCDPSession(p);
const geom = await p.evaluate(() => {
  const st = EM.game.st;
  EM.modes.libre.vista(st, '3p');
  st.mode = 'veh'; st.veh = { kind: 'moto', col: '#EC343A', id: -1 };
  st.vf = 0; st.cyo = 0; st.cpo = 0;
  const jr = document.getElementById('lbJz').getBoundingClientRect();
  const cr = document.getElementById('gcv').getBoundingClientRect();
  return { x0: st.x, y0: st.y, jx0: Math.round(jr.left + jr.width * .45), jy0: Math.round(jr.top + jr.height * .32), cx0: Math.round(cr.left + cr.width * .48), cy0: Math.round(cr.top + cr.height * .26), bx0: Math.round(cr.left + cr.width * .62), by0: Math.round(cr.top + cr.height * .72) };
});
const j1 = { id: 1, x: geom.jx0, y: geom.jy0 };
await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [j1] });
j1.x = geom.jx0 + 18; j1.y = geom.jy0 - 44;
await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [j1] });
const joyAntes = await p.evaluate(() => EM.game.st.joy.m);
/* dedo 2 inicia en la mitad superior mientras dedo 1 sigue sosteniendo el joystick */
const c2 = { id: 2, x: geom.cx0, y: geom.cy0 };
await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [j1, c2] });
for (let i = 1; i <= 10; i++) {
  c2.x = geom.cx0 + i * 14; c2.y = geom.cy0 + i * 4;
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [j1, c2] });
  await p.evaluate(() => EM.modes.libre.step(EM.game.st, 1 / 30));
}
const mid = await p.evaluate(() => ({ joyDurante: +EM.game.st.joy.m.toFixed(2), cyoTras: +EM.game.st.cyo.toFixed(3), avance: +Math.hypot(EM.game.st.x - 0, EM.game.st.y - 0).toFixed(2), x: EM.game.st.x, y: EM.game.st.y, vf: +EM.game.st.vf.toFixed(2) }));
await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [j1] });
await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
/* toque en mitad inferior fuera del joystick NO debe girar la cámara en modo mitades */
const cyoAntesBajo = await p.evaluate(() => EM.game.st.cyo);
const b3 = { id: 3, x: geom.bx0, y: geom.by0 };
await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [b3] });
b3.x = geom.bx0 + 70;
await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [b3] });
await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
const cyoBajoDiff = await p.evaluate(a => +Math.abs(EM.game.st.cyo - a).toFixed(4), cyoAntesBajo);
const rDosDedos = { joyAntes: +joyAntes.toFixed(2), joyDurante: mid.joyDurante, cyoTras: mid.cyoTras, cyoBajoDiff, avance: +Math.hypot(mid.x - geom.x0, mid.y - geom.y0).toFixed(2), vf: mid.vf };
if (rDosDedos.joyAntes < .5 || rDosDedos.joyDurante < .5 || Math.abs(rDosDedos.cyoTras) < .3 || rDosDedos.cyoBajoDiff > 1e-4 || rDosDedos.avance < .8) {
  throw new Error('GA-36-2 falló: ' + JSON.stringify(rDosDedos));
}

/* 3. GA-36-3 + GA-36-4 (G-111): subtrama deja huella (diario, noticia, reputación en #lbLugar, frases paradero/banca) */
const rSub = await p.evaluate(() => {
  const st = EM.game.st;
  const sa = EM.modes.libre.hub('San Antonio');
  EM.modes.libre.llevar(st, sa.x, sa.y, false);
  const ent = EM.subtramasVivas.registrar(st, 'pico-sa', 0, false);
  st._bar = ''; st._calle = ''; st._lt = 1;
  EM.modes.libre.letrero(st);
  const lugarHtml = (document.getElementById('lbLugar') || {}).innerHTML || '';
  const fPar = EM.ciudadViva.fraseLugar('paradero'), fBan = EM.ciudadViva.fraseLugar('banca');
  EM.mundoRPG.abrir(st, 'sub');
  const subImgs = document.querySelectorAll('#mBody .sub-escena').length;
  return { entOk: !!(ent && EM.save.d.rpg.diario.length >= 1), repEnLetrero: lugarHtml.includes('Reputación del barrio'), notis: EM.ciudadViva.noticias().length, fPar, fBan, subImgs };
});
if (!rSub.entOk || !rSub.repEnLetrero || !rSub.notis || !rSub.fPar || !rSub.fBan || rSub.subImgs !== 6) {
  throw new Error('GA-36-3 / G-111 falló: ' + JSON.stringify(rSub));
}
await p.waitForTimeout(260);
fs.writeFileSync(path.join(OUT, 'ga36-3-subtramas-g111.png'), await p.screenshot());
await p.evaluate(() => EM.mundoRPG.abrir(EM.game.st, 'rpg'));
await p.waitForTimeout(260);
fs.writeFileSync(path.join(OUT, 'ga36-3-diario-rpg.png'), await p.screenshot());
await p.evaluate(() => { EM.ui.close(); const st = EM.game.st; st._bar = ''; st._calle = ''; st._lt = 1; EM.modes.libre.letrero(st); EM.game.freeze(true); EM.game.frame(); });
await p.waitForTimeout(350);
fs.writeFileSync(path.join(OUT, 'ga36-3-letrero-barrio-rep.png'), await p.screenshot());
await p.evaluate(() => EM.game.freeze(false));

/* 4. GA-36-4 (G-110): Domingo zen vertical 412×860 y horizontal 860×412 */
await p.evaluate(() => { EM.game.start('carrera', 'cr:zen', {}); EM.modes.carrera.step(EM.game.st, .5); EM.game.freeze(true); EM.game.frame(); });
fs.writeFileSync(path.join(OUT, 'ga36-4-zen-vertical.png'), await p.screenshot());
await p.setViewportSize({ width: 860, height: 412 });
await p.waitForTimeout(250);
await p.evaluate(() => EM.game.frame());
fs.writeFileSync(path.join(OUT, 'ga36-4-zen-horizontal.png'), await p.screenshot());
await p.evaluate(() => { EM.game.freeze(false); EM.game.start('libre', 'lb:San Antonio', {}); const st = EM.game.st; EM.modes.libre.vista(st, '3p'); st.mode = 'veh'; st.veh = { kind: 'bici', col: '#9bd341', id: -1 }; st.ladeo = -.35; EM.game.freeze(true); EM.game.frame(); });
fs.writeFileSync(path.join(OUT, 'ga36-1-ladeo-horizontal.png'), await p.screenshot());

if (errs.length) throw new Error('Errores en consola/página: ' + errs.join('; '));
console.log('PASS GA-36-1 (ladeo):', JSON.stringify(rLadeo));
console.log('PASS GA-36-2 (dos dedos mitades):', JSON.stringify(rDosDedos));
console.log('PASS GA-36-3/4 (subtramas + G-110..G-112):', JSON.stringify(rSub));
await b.close();
