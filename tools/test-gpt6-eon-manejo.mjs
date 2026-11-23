/** Pruebas aisladas del módulo aditivo GPT-6/Eón. No sustituye Chromium/Android. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const script = fs.readFileSync(new URL('../src/js/98b-openai-gpt6-eon-manejo.js', import.meta.url), 'utf8');
let red = null, mapa = 4;
const volante = {
  tip: 'Conduce',
  step(st, dt) { st.t += dt; },
  pts(st) { return [[st.x, st.y], [st.x + 2, st.y], [st.x - 2, st.y]]; },
  redAhead() { return red; },
  msg() {},
  key(st, key, down) { st.ultimaTecla = [key, down]; }
};
const carrera = { ai() { return 'original'; } };
const b = { brt: { acc: 1 }, feeder: { acc: 1.2 } };
const context = {
  EM: { modes: { volante, carrera } },
  BUSES: b,
  NET: { byId: { MP1: { P: { len: 1000 } } }, at(_P, s, off = 0) { return { x: s, y: off, a: 0 }; } },
  MAP: { ready: true, tileM() { return mapa; } },
  TT: { MOUNT: 1, BRICK: 2, BLDG: 3, ROAD: 4, WATER: 8, CANAL: 9, LAND: 13 },
  CR_OBS: { cono: [.5, .8, '#fff', 1], moto: [2, 1.3, '#fff', 1], hueco: [1, .1, '#fff', 0] },
  crVentana(st, s0, s1) { return st.obs.filter(o => o.s >= s0 && o.s <= s1); },
  Math, Number, Set, Array
};
vm.runInNewContext(script, context, { filename: '98b-openai-gpt6-eon-manejo.js' });
function estado() { return { line: 'MP1', kind: 'brt', sR: 20, x: 20, y: 0, h: 0, h2: 0, v: 0, steer: 0, sin: 0, lev: 1, t: 0, ph: 'run', ni: 1, stopTgt: [0, 300], keys: { up: true } }; }
const st = estado();
for (let i = 0; i < 35; i++) volante.step(st, .1);
assert.ok(st._eonRecuperaciones === 1 && st.x > 20 && st.sR > 20, 'rescata bus detenido fuera de parada');
assert.equal(st.v, 0);
assert.ok(b.brt.acc >= 1.35 && b.feeder.acc >= 1.55, 'ajuste arcade moderado');
const nearRed = estado(); red = 10;
for (let i = 0; i < 45; i++) volante.step(nearRed, .1);
assert.equal(nearRed._eonRecuperaciones || 0, 0, 'no debe saltarse el semáforo');
red = null;
const nearStop = estado(); nearStop.stopTgt[1] = 35;
for (let i = 0; i < 45; i++) volante.step(nearStop, .1);
assert.equal(nearStop._eonRecuperaciones || 0, 0, 'no debe saltarse paradas');
const blocked = estado(); mapa = 3;
for (let i = 0; i < 45; i++) volante.step(blocked, .1);
assert.equal(blocked._eonRecuperaciones || 0, 0, 'no teletransportar dentro de edificios');
mapa = 4;
const watch = { s: 100, v: 20, t: 2, c: 1, y: 0, vy: 0, turbo: 0, obs: [{ s: 121, c: 1, k: 'moto' }] };
assert.ok(['izq', 'der'].includes(carrera.ai(watch)), 'el piloto reacciona con 21 metros anticipación a 20 m/s');
watch.turbo = 2;
assert.equal(carrera.ai(watch), null, 'no maniobra con turbo protector');
watch.turbo = 0;
watch.obs = [{ s: 116, c: 1, k: 'hueco' }];
assert.equal(carrera.ai(watch), 'salta', 'salta obstáculo bajo');
volante.key(st, 'h', true);
assert.equal(st.ultimaTecla[0], 'h', 'preserva los controles anteriores');
console.log('PASS GPT-6/Eón: rescate, semáforos, paradas, colisiones, aceleración, anticipación, salto y teclado');
