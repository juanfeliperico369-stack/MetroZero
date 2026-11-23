#!/usr/bin/env node
/* Regresión aislada de «Un día de operación» · OpenAI GPT-6 / Eón */
import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const EM={modes:{}},NET={stations:['San Antonio','Niquía','Acevedo','Estadio','Poblado','Itagüí'].map((name,i)=>({name,x:i*150,y:i*60})),lines:[{kind:'metro',st:[]}]}; NET.lines[0].st=NET.stations.map(h=>({name:h.name,hub:h}));
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v)),h2=(i,t,s)=>(((i*103+t*11+s*37)%101)+101)%101/101;
vm.runInNewContext(fs.readFileSync(new URL('../src/js/48-operacion.js',import.meta.url),'utf8'),{EM,NET,clamp,h2,pad2:n=>String(n).padStart(2,'0'),TAU:Math.PI*2});
const M=EM.modes.operacion;assert.equal(M.levels()[0].id,'op:red');
const st=M.create('op:red',{seed:7,auto:true});assert.ok(st.links.length>=4);assert.equal(st.t,270);
M.act(st,{k:'refuerzo',i:0});assert.equal(st.credits,3);assert.equal(st.stations[0].boost,4);
assert.ok(M.peak(7.5)>M.peak(12));
let steps=0;while(!st.done&&steps<25000){const a=M.ai(st);if(a)M.act(st,a);M.step(st,1/30);steps++;}
assert.ok(st.done,'el bot debe acabar la partida');assert.ok(steps<25000);assert.ok(Number.isFinite(M.result(st).score));
const up=M.create('op:red',{seed:1});up.upgrade=true;up.t=1380;M.act(up,{k:'mejora',i:1});assert.equal(up.day,2);assert.equal(up.stations[0].cap,150);assert.equal(up.t,270);
const old=M.create('op:red',{seed:1});old.credits=0;M.act(old,{k:'refuerzo',i:0});assert.equal(old.stations[0].boost,0);
console.log('PASS GPT-6/Eón: modo operación, demanda pico, refuerzos, mejoras, bot y resultado tras '+steps+' cuadros');
