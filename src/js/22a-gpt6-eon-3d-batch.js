/* OpenAI GPT-6 / Eón · CX-36-1: geometría dinámica en un búfer por cuadro.
   Aditivo, después de 22-gl.js. Respeta la matriz M4 y el guardado elmetro.v1. */
(() => {
  if (typeof G3 === 'undefined' || typeof MB === 'undefined' || typeof M4 === 'undefined') return;
  const mesh = new MB();
  mesh.box(0, 0, 0, 0, 1, 1, 1, [1, 1, 1], [1, 1, 1]);
  const cube = mesh.done()[0], N = cube.length, oldBox = G3.box, oldDraw = G3.draw;
  G3._eonBatchStats = { cajas: 0, llamadas: 0, vertices: 0, tiempoCPU: 0 };
  const reserve = (g, size) => {
    if (!g._eonDynamicCPU || g._eonDynamicCPU.length < size)
      g._eonDynamicCPU = new Float32Array(Math.max(size, (g._eonDynamicCPU?.length || N * 64) * 2));
  };
  function flush(g) {
    const n = g._eonBatchPos || 0;
    if (!n || !g.gl || !g._run) return;
    const gl = g.gl;
    if (!g._eonDynamicGPU) g._eonDynamicGPU = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, g._eonDynamicGPU);
    if (!g._eonDynamicCapacity || g._eonDynamicCapacity < n) {
      g._eonDynamicCapacity = Math.max(n, (g._eonDynamicCapacity || 0) * 2);
      gl.bufferData(gl.ARRAY_BUFFER, g._eonDynamicCapacity * 4, gl.DYNAMIC_DRAW);
    }
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, g._eonDynamicCPU.subarray(0, n));
    g._eonDynamicGPU.n = n / 10;
    g._run(g._eonDynamicGPU);
    g._eonBatchStats.llamadas++;
    g._eonBatchStats.vertices += n / 10;
    g._eonBatchPos = 0;
  }
  G3.box = function (x, y, z, yaw, L, W, H, col, pitch = 0, roll = 0) {
    if (!this._eonCollect || !this.gl || !this._run || !col) return oldBox.apply(this, arguments);
    const m = M4.trs(x, y, z, -yaw, L, H, W, pitch, roll);
    reserve(this, (this._eonBatchPos || 0) + N);
    const a = this._eonDynamicCPU;
    let at = this._eonBatchPos || 0;
    for (let i = 0; i < N; i += 10) {
      const px = cube[i], py = cube[i + 1], pz = cube[i + 2];
      const nx = cube[i + 3], ny = cube[i + 4], nz = cube[i + 5];
      a[at++] = m[0]*px + m[4]*py + m[8]*pz + m[12];
      a[at++] = m[1]*px + m[5]*py + m[9]*pz + m[13];
      a[at++] = m[2]*px + m[6]*py + m[10]*pz + m[14];
      a[at++] = m[0]*nx + m[4]*ny + m[8]*nz;
      a[at++] = m[1]*nx + m[5]*ny + m[9]*nz;
      a[at++] = m[2]*nx + m[6]*ny + m[10]*nz;
      a[at++] = col[0]; a[at++] = col[1]; a[at++] = col[2];
      a[at++] = cube[i + 9];
    }
    this._eonBatchPos = at;
    this._eonBatchStats.cajas++;
    if (at >= 300000) flush(this);
  };
  G3.draw = function (cam, opts = {}) {
    if (!opts || typeof opts.dyn !== 'function' || !this.gl || this._eonCollect)
      return oldDraw.apply(this, arguments);
    const dyn = opts.dyn, t = typeof performance !== 'undefined' && performance.now ? performance.now() : 0;
    this._eonBatchStats.cajas = 0; this._eonBatchStats.llamadas = 0; this._eonBatchStats.vertices = 0;
    const next = Object.assign({}, opts, { dyn: g => {
      g._eonCollect = true; g._eonBatchPos = 0;
      try { dyn(g); } finally { g._eonCollect = false; flush(g); }
    } });
    const r = oldDraw.call(this, cam, next);
    if (t) this._eonBatchStats.tiempoCPU = Math.max(0, performance.now() - t);
    return r;
  };
})();