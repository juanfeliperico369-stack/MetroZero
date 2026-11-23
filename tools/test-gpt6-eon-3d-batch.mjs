#!/usr/bin/env node
/* Regresión aislada de lotes 3D · OpenAI GPT-6 / Eón */
import fs from 'node:fs'; import vm from 'node:vm'; import assert from 'node:assert/strict';
const gl = { ARRAY_BUFFER: 1, DYNAMIC_DRAW: 2, createBuffer: () => ({}), bindBuffer() {}, bufferData() { this.allocs = (this.allocs || 0) + 1; }, bufferSubData(_t, _p, a) { this.last = new Float32Array(a); this.uploads = (this.uploads || 0) + 1; } };
const M4 = { trs(x,y,z,_a,L,H,W) { return [L,0,0,0, 0,H,0,0, 0,0,W,0, x,y,z,1]; } };
class MB { box() {} done() { const a = new Float32Array(300); for (let i = 0; i < a.length; i += 10) { a[i]=1; a[i+3]=1; a[i+6]=1; } return [a]; } }
const G3 = { gl, nDraws: 0, nFallback: 0, box() { this.nFallback++; }, draw(cam, opts) { this._run = b => { this.nDraws++; this.lastVerts=b.n; }; opts.dyn?.(this); return 17; } };
vm.runInNewContext(fs.readFileSync(new URL('../src/js/22a-gpt6-eon-3d-batch.js', import.meta.url),'utf8'), { G3, M4, MB, Float32Array, performance: {now:()=>50} });
assert.equal(G3.draw({}, {dyn:g=>{g.box(2,3,4,0,2,4,6,[.2,.5,.8]);g.box(5,6,7,0,3,4,5,[1,0,0]);g.box(8,9,10,0,2,2,2,[1,1,1]);}}),17);
assert.equal(G3.nDraws,1,'tres cajas deben dibujarse en una sola llamada');
assert.equal(G3._eonBatchStats.cajas,3); assert.equal(G3._eonBatchStats.vertices,90);
assert.equal(gl.uploads,1); assert.equal(G3.lastVerts,90);
assert.equal(gl.last[0],4); assert.equal(gl.last[1],3); assert.equal(gl.last[2],4);
assert.ok(Math.abs(gl.last[6]-.2)<1e-6); assert.ok(Math.abs(gl.last[7]-.5)<1e-6);
G3.box(1,1,1,0,1,1,1,[1,1,1]); assert.equal(G3.nFallback,1,'llamadas fuera del cuadro no cambian');
G3.draw({}, {dyn:g=>g.box(0,0,0,0,1,1,1,[1,1,1])}); assert.equal(G3._eonBatchStats.cajas,1);
assert.equal(gl.allocs,1,'el búfer GPU se reutiliza');
console.log('PASS GPT-6/Eón: lotes dinámicos 3D, geometría, colores, reutilización y fallback');
