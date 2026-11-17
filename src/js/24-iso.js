/* =====================================================================
   MAQUETA 2:1 · el valle real en proyección dimétrica (la de las "ciudades isométricas")
   Pantalla: x = (u − v)·a ;  y = (u + v)·a/2 − (z − Z0)·a·kz, con (u, v) el mundo girado 0, 90, 180 o 270°.
   Se dibuja por columnas, de adelante hacia atrás, con un búfer de altura ("voxel space"): relieve real (80 m,
   bilineal), calles, río, parques y edificios con su altura. Se dibuja a resolución CSS y queda en caché:
   mientras se arrastra solo se mueve la imagen; al soltar se vuelve a dibujar.
   ===================================================================== */
const Iso = EM.iso = {
  kz: 1.35, Z0: 1500, rot: 0, cv: null, ms: 0,
  R(x, y) { switch (this.rot) { case 1: return [y, -x]; case 2: return [-x, -y]; case 3: return [-y, x]; default: return [x, y]; } },
  Ri(u, v) { switch (this.rot) { case 1: return [-v, u]; case 2: return [-u, -v]; case 3: return [v, -u]; default: return [u, v]; } },
  /* mundo (m) → pantalla, con la cámara c = { x, y, a } (a = px por metro) en un lienzo w × h */
  P(x, y, z, c, w, h) { const [u, v] = this.R(x, y), [U, V] = this.R(c.x, c.y); return { x: w / 2 + ((u - v) - (U - V)) * c.a, y: h / 2 + ((u + v) - (U + V)) * c.a / 2 - (z - this.Z0) * c.a * this.kz }; },
  /* pantalla → mundo, sobre el plano z = Z0 */
  Pi(sx, sy, c, w, h) { const [U, V] = this.R(c.x, c.y), p = (sx - w / 2) / c.a + (U - V), q = (sy - h / 2) * 2 / c.a + (U + V), [x, y] = this.Ri((p + q) / 2, (q - p) / 2); return { x, y }; },
  /* sombreado del relieve (luz del noroeste) y máximos por bloques de 640 m para saltar rápido lo que no asoma */
  prep() {
    const E = MAP.E, W = VM.eW, H = VM.eH, hs = new Float32Array(W * H), B = 8, bw = Math.ceil(W / B), bh = Math.ceil(H / B), bm = new Float32Array(bw * bh);
    let zmin = 1e9, zmax = -1e9;
    for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) { const k = j * W + i, e = E[k], nw = E[Math.max(0, j - 1) * W + Math.max(0, i - 1)]; hs[k] = clamp(1 + (nw - e) * .0068, .62, 1.3); zmin = Math.min(zmin, e); zmax = Math.max(zmax, e); const b = (j / B | 0) * bw + (i / B | 0); if (e > bm[b]) bm[b] = e; }
    this.hs = hs; this.bm = bm; this.bw = bw; this.zmin = zmin; this.zmax = zmax;
  },
  COL: (() => { const c = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
    return { 0: c('#6f9a4a'), 1: c('#3d6838'), 4: c('#4a4e57'), 5: c('#44484f'), 6: c('#cdc6b8'), 7: c('#408a60'), 8: c('#3a7a8e'), 9: c('#4a7878'), 10: c('#d9cdae'), 11: c('#96969a'), 12: c('#f4ecd0'), 13: c('#a99a7a'), 14: c('#3a3e45'), 15: c('#5ab0d0'), 16: c('#c6c0b4') }; })(),
  TECHO: [[154, 160, 166], [185, 181, 173], [167, 170, 168], [207, 200, 187], [176, 168, 150]], MURO: [[230, 220, 200], [216, 210, 196], [201, 206, 212], [239, 232, 216]],
  TEJA: [[180, 88, 58], [162, 75, 48], [196, 104, 63]], LADR: [[169, 83, 58], [184, 92, 62]],
  render(c, W, H) {
    if (!this.hs) this.prep();
    if (!this.cv || this.cv.width !== W || this.cv.height !== H) { this.cv = mkCanvas(W, H); this.cx = this.cv.getContext('2d'); this.im = this.cx.createImageData(W, H); this.d = new Uint32Array(this.im.data.buffer); }
    const t0 = performance.now(), d = this.d, a = c.a, kz = this.kz, Z0 = this.Z0, [U0, V0] = this.R(c.x, c.y), P0 = U0 - V0, Q0 = U0 + V0;
    const E = MAP.E, eW = VM.eW, eH = VM.eH, G = TM * ES, Tt = MAP.t, hs = this.hs, bm = this.bm, bw = this.bw, mW = MW * TM, mH = MH * TM;
    const [ax, ay] = this.Ri(1, 0), [bx, by] = this.Ri(0, 1), half = a / 2, kzA = a * kz, dq = 2 / a, zTop = this.zmax + 140;
    const qF = Q0 + H / a + 2 * kz * Math.max(0, zTop - Z0), qB = Q0 - H / a - 2 * kz * Math.max(0, zTop - this.zmin) - 8 / a;
    const pk = (r, g, b) => 0xff000000 | (b << 16) | (g << 8) | r, cielo = new Uint32Array(H);
    for (let y = 0; y < H; y++) { const t = y / H; cielo[y] = pk(159 + t * 70 | 0, 199 + t * 42 | 0, 230 + t * 15 | 0); }
    const COL = this.COL, TE = this.TECHO, MU = this.MURO, TJ = this.TEJA, LA = this.LADR, ventanas = a > 1.1;
    for (let i = 0; i < W; i++) {
      const p = (i + .5 - W / 2) / a + P0; let yb = H, dentro = false;
      for (let q = qF; q > qB && yb > 0; q -= dq) {
        const u = (p + q) * .5, v = (q - p) * .5, x = ax * u + bx * v, y = ay * u + by * v;
        if (x < 0 || y < 0 || x >= mW || y >= mH) { dentro = false; continue; }
        const gx = x / G, gy = y / G, ix = gx | 0, iy = gy | 0;
        // salto rápido: ni con lo más alto del bloque alcanzaría a asomar sobre lo ya dibujado
        if (H / 2 + (q - Q0) * half - (bm[(iy >> 3) * bw + (ix >> 3)] + 140 - Z0) * kzA >= yb) { dentro = true; continue; }
        const fx = gx - ix, fy = gy - iy, k = iy * eW + ix, k2 = Math.min(ix + 1, eW - 1) - ix, k3 = iy + 1 < eH ? eW : 0;
        const e = (E[k] * (1 - fx) + E[k + k2] * fx) * (1 - fy) + (E[k + k3] * (1 - fx) + E[k + k3 + k2] * fx) * fy;
        const tx = x / TM | 0, ty = y / TM | 0, tv = Tt[ty * MW + tx], s = hs[k];
        let bh = 0, top, wall = null;
        if (tv === 3) {   // edificio: bloques de 2 × 2 casillas con su altura y un callejón entre bloques
          const lx = x / TM - (tx & ~1), ly = y / TM - (ty & ~1);
          if (lx < .08 || ly < .08 || lx > 1.92 || ly > 1.92) top = COL[6];
          else { const hb = h2(tx >> 1, ty >> 1, 77); bh = MAP.bHeight((tx >> 1) * 40, (ty >> 1) * 40, tx * 7 + ty); top = TE[hb * TE.length | 0]; wall = MU[(hb * 97 | 0) % MU.length]; }
        } else if (tv === 2) { const hb = h2(tx, ty, 78); bh = 5 + hb * 4; top = hb < .45 ? TJ[(hb * 31 | 0) % 3] : TE[(hb * 13 | 0) % TE.length]; wall = LA[(hb * 7 | 0) & 1]; }
        else top = COL[tv] || COL[0];
        const z = e + bh, sy = H / 2 + (q - Q0) * half - (z - Z0) * kzA | 0;
        if (!dentro) {   // borde de la maqueta: el corte de tierra debajo de la primera casilla
          dentro = true;
          if (sy < yb) { const base = H / 2 + (q - Q0) * half - (this.zmin - 60 - Z0) * kzA | 0; for (let r = Math.max(sy + 1, 0), rb = Math.min(yb, base); r < rb; r++) d[r * W + i] = pk(92, 72, 52); yb = Math.max(0, Math.min(yb, sy + 1)); }
        }
        if (sy >= yb) continue;
        const r0 = sy < 0 ? 0 : sy, tr = top[0] * s, tg = top[1] * s, tb = top[2] * s, cTop = pk(Math.min(255, tr), Math.min(255, tg), Math.min(255, tb));
        if (wall) {   // el techo arriba (1–2 px) y la fachada debajo, con hileras de ventanas cuando hay zoom
          const cW = pk(wall[0] * .86 | 0, wall[1] * .86 | 0, wall[2] * .86 | 0), cV = pk(46, 70, 96);
          for (let r = r0; r < yb; r++) { const hp = bh - (r - sy) / kzA; d[r * W + i] = r - sy < 2 ? cTop : ventanas && hp > 1.5 && (hp % 3.2) < 1.3 ? cV : cW; }
        } else for (let r = r0; r < yb; r++) d[r * W + i] = cTop;
        yb = r0;
      }
      for (let r = 0; r < yb; r++) d[r * W + i] = cielo[r];
    }
    this.cx.putImageData(this.im, 0, 0); this.ms = performance.now() - t0;
    return this.cv;
  }
};
