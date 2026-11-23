#!/usr/bin/env node
/* Regresión aislada de los tres fantasmas · OpenAI GPT-6 / Eón */
import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
let writes=0;const Save={d:{best:{}},write(){writes++}},NET={byId:{A:{P:{}}},at(_p,s){return {x:s,y:s*.5}}};
const create=(lv)=>({lv,line:'A',s:0,x:0,y:0,done:false}),step=(s,dt)=>{s.s+=dt*10;s.x=s.s;s.y=s.s*.5;if(s.s>=12)s.done=true;},result=s=>({done:s.done,win:s.done,score:200}),draw=()=>{};
const modes={conduce:{create,step,result,draw},bus:{create,step,result,draw},carrera:{create,step,result,draw,pos(s){return {x:s.s,y:s.s*.5}}}};
const EM={modes,headless:false},ctx={EM,Save,NET,clamp:(a,l,h)=>Math.max(l,Math.min(h,a)),pad2:n=>String(n).padStart(2,'0'),Date,Math,document:{},QR:{},UI:{},MAP:{elevM:()=>0},TAU:Math.PI*2};
vm.runInNewContext(fs.readFileSync(new URL('../src/js/48a-gpt6-eon-fantasma.js',import.meta.url),'utf8'),ctx);
for(const [id,M] of Object.entries(modes)){
 const st=M.create('a',{auto:false});for(let i=0;i<35;i++){M.step(st,.037);if(st.done)break;}assert.ok(M.result(st).win);const r=EM.reto.fantasma.get(id,'a');assert.ok(r&&r.frames.length>=9);let maxError=0;for(let k=0;k<r.frames.length;k++){const a=EM.reto.fantasma.at(r,k*.1),exact={x:k,y:k*.5};maxError=Math.max(maxError,Math.hypot(a.x-exact.x,a.y-exact.y));}assert.ok(maxError<.11,`${id} error ${maxError}`);
 const slow=M.create('a',{auto:false});for(let i=0;i<36;i++){M.step(slow,.037);if(slow.done)break;}M.result(slow);assert.ok(EM.reto.fantasma.get(id,'a').t<=slow._ghostTrial.t);
}
assert.ok(writes>=3);assert.equal(Object.keys(Save.d.best._retoFantasma).length,3);
console.log('PASS GPT-6/Eón: 3 fantasmas 0,1 s, mejor marca diaria, error métrico < 0,11 m y guardado v1');
