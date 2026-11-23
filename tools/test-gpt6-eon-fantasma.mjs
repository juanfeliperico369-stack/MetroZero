#!/usr/bin/env node
/* Regresión aislada de los tres fantasmas · OpenAI GPT-6 / Eón
   3.9 (Claude): los recorridos viven en su propia clave (elmetro.v1.fantasmas), comprimidos; la partida no los lleva.
   Se prueba también que los de la 3.8.0 (dentro de Save.d.best._retoFantasma) se mudan solos. */
import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
let writes=0,lsWrites=0;const LSd={};const localStorage={getItem:k=>k in LSd?LSd[k]:null,setItem:(k,v)=>{lsWrites++;LSd[k]=String(v);}};
const hoy=(()=>{const d=new Date(),p=n=>String(n).padStart(2,'0');return d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate());})();
/* una marca vieja de la 3.8.0 dentro de la partida, de otro recorrido, para probar la mudanza */
const Save={d:{best:{_retoFantasma:{[hoy+'|bus|viejo']:{v:1,t:2,frames:[[0,0],[10,5],[20,10]],score:9}}}},write(){writes++}},NET={byId:{A:{P:{}}},at(_p,s){return {x:s,y:s*.5}}};
const create=(lv)=>({lv,line:'A',s:0,x:0,y:0,done:false}),step=(s,dt)=>{s.s+=dt*10;s.x=s.s;s.y=s.s*.5;if(s.s>=12)s.done=true;},result=s=>({done:s.done,win:s.done,score:200}),draw=()=>{};
const modes={conduce:{create,step,result,draw},bus:{create,step,result,draw},carrera:{create,step,result,draw,pos(s){return {x:s.s,y:s.s*.5}}}};
const EM={modes,headless:false},ctx={EM,Save,NET,localStorage,clamp:(a,l,h)=>Math.max(l,Math.min(h,a)),pad2:n=>String(n).padStart(2,'0'),Date,Math,JSON,String,Object,Array,parseInt,isFinite,Map,document:{},QR:{},UI:{},MAP:{elevM:()=>0},TAU:Math.PI*2};
vm.runInNewContext(fs.readFileSync(new URL('../src/js/48a-gpt6-eon-fantasma.js',import.meta.url),'utf8'),ctx);
const F=EM.reto.fantasma;
/* compresión: ida y vuelta exacta, con negativos */
const muestra=[[123456,-654321],[123470,-654300],[123470,-654300],[123400,-654390]];assert.equal(JSON.stringify(F.dec(F.cod(muestra))),JSON.stringify(muestra));
for(const [id,M] of Object.entries(modes)){
 const st=M.create('a',{auto:false});for(let i=0;i<35;i++){M.step(st,.037);if(st.done)break;}assert.ok(M.result(st).win);const r=F.get(id,'a');assert.ok(r&&r.frames.length>=9);let maxError=0;for(let k=0;k<r.frames.length;k++){const a=F.at(r,k*.1),exact={x:k,y:k*.5};maxError=Math.max(maxError,Math.hypot(a.x-exact.x,a.y-exact.y));}assert.ok(maxError<.11,`${id} error ${maxError}`);
 const slow=M.create('a',{auto:false});for(let i=0;i<36;i++){M.step(slow,.037);if(slow.done)break;}M.result(slow);assert.ok(F.get(id,'a').t<=slow._ghostTrial.t);
}
assert.equal(Save.d.best._retoFantasma,undefined,'la partida ya no lleva fantasmas');
const guardado=JSON.parse(LSd['elmetro.v1.fantasmas']||'{}');assert.equal(Object.keys(guardado).length,4,'3 recorridos de hoy + el mudado de la 3.8.0');
assert.ok(F.get('bus','viejo')&&F.get('bus','viejo').frames.length===3,'la marca de la 3.8.0 se mudó entera');
assert.ok(lsWrites>=4&&writes>=1);
console.log('PASS GPT-6/Eón + 3.9: 3 fantasmas 0,1 s, mejor marca diaria, error métrico < 0,11 m, almacén aparte comprimido y mudanza de la 3.8.0');
