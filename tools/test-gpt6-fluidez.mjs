#!/usr/bin/env node
/* Pruebas deterministas del módulo aditivo OpenAI GPT-6 (sin paquetes externos).
   Ejecutar desde la raíz: node tools/test-gpt6-fluidez.mjs */
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import assert from 'node:assert/strict';

const botones = [];
const tipos = {
  levels() { botones.length = 0; for (let i = 0; i < 12; i++) botones.push({classList: {
    has: true, remove(c) { if (c === 'lock') this.has = false; }
  }, dataset: { l: String(i) } }); },
  storyList() { botones.length = 0; for (let i = 0; i < 8; i++) botones.push({
    classList: { has: true, remove(c) { if (c === 'lock') this.has = false; } },
    dataset: { c: String(i) }, lastElementChild: { textContent: '🔒' }, onclick: () => { throw new Error('Guardia previa'); }
  }); }
};
let visitado = null;
const modos = {
  conduce: {key(st,k,on) { if (on && k === 'h') st.horn = true; }},
  volante: {key(st,k,on) { if (on && k === 'h') st.horn = true; }},
  carrera: {V() { return { spd: 20 }; }, step(st,dt) { st.v = Math.min(20 * (st.turbo > 0 ? 1.3 : 1), st.v + (st.turbo > 0 ? 4 : .12) * dt); st.s += st.v * dt; }}
};
const contexto = {
  EM: {modes:modos}, Menu: tipos, Snd: {init(){}}, Story: {open(i){ visitado = i; }},
  document: { querySelectorAll(selector) { return botones.filter(b => selector.includes('[data-l]') ? !!b.dataset.l : !!b.dataset.c); } },
  Number
};
runInNewContext(readFileSync(new URL('../src/js/98a-openai-gpt6-fluidez.js', import.meta.url), 'utf8'), contexto);

tipos.levels();
assert.equal(botones.length, 12);
assert.ok(botones.every(b => !b.classList.has), 'Todos los niveles sin candado');
tipos.storyList();
assert.ok(botones.every(b => !b.classList.has), 'Todos los capítulos sin candado');
assert.ok(botones.every(b => b.lastElementChild.textContent === '▶'));
botones[7].onclick();
assert.equal(visitado,7);

for (const [id,orden] of [
 ['conduce',['cab','tps','cine','lado','top','pan']],
 ['volante',['tps','cab','cine','top','pan']]
]) {
 const s = {view: orden[0]};
 for(let i=1;i<=orden.length;i++) { modos[id].key(s,'v',true); assert.equal(s.view,orden[i % orden.length]); }
 modos[id].key(s,'h',true); assert.equal(s.horn,true,'Delegación de controles restantes');
}

const e = {v:8,turbo:0,s:0};
for(let n=0;n<90;n++) modos.carrera.step(e,1/30);
assert.ok(e.v >= 19.95, `Ritmo arcade al llegar a tres segundos: ${e.v}`);
assert.ok(e.v<=20,'Tope sin turbo');
assert.ok(e.s > 30,'Recorrido avanza');
e.turbo=2;
for(let n=0;n<30;n++) modos.carrera.step(e,1/30);
assert.ok(e.v <=26,'Tope con turbo');
const congelado = {...e};
modos.carrera.step(e,0);
assert.equal(e.s,congelado.s,'Pausa no mueve el vehículo');
console.log('PASS GPT-6: desbloqueo de 12 niveles, 8 capítulos, 6+5 vistas, velocidad, turbo y pausa');
