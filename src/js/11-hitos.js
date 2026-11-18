/* =====================================================================
   ARQUITECTURA ICÓNICA (1.1.0): los edificios que hacen reconocible a Medellín, con su huella real
   (src/data/hitos.js, de OpenStreetMap) y un dibujo propio en el mismo volumen de la ciudad:
   la aguja del Coltejer, las torres y la cúpula de la Basílica, el ajedrezado del Palacio de la Cultura,
   las graderías del Atanasio Girardot, las tres rocas de la Biblioteca España, el vidrio del Edificio EPM,
   los postes del Parque de las Luces, las esculturas de la Plaza Botero y la arena de los Pies Descalzos.
   Los edificios genéricos no se montan encima y se choca contra ellos (salvo las plazas y parques).
   ===================================================================== */
const HITO_LIBRE = new Set(['botero', 'pies', 'luces']);
Object.assign(VC, {
  HT: [],
  /* prepara los hitos: polígonos, caja, centro, área, eje principal y (en iglesias) el lado de la fachada */
  hitosInit() {
    if (typeof HITOS === 'undefined') return; const out = [];
    for (const o of HITOS) {
      const P = o.P.map(a => Float32Array.from(a)); let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9, sx = 0, sy = 0, n = 0, A = 0;
      for (const Q of P) { for (let i = 0; i < Q.length; i += 2) { const x = Q[i], y = Q[i + 1]; x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); sx += x; sy += y; n++; } A += Math.abs(this.area2(Q)) / 2; }
      const H = { id: o.id, n: o.n, k: o.k, h: o.h, P, x0, y0, x1, y1, cx: sx / n, cy: sy / n, A, libre: HITO_LIBRE.has(o.k), o };
      if (o.cancha) H.C = Float32Array.from(o.cancha);
      // eje principal (para naves de iglesia): dirección de mayor varianza de los vértices
      let xx = 0, yy = 0, xy = 0; for (const Q of P) for (let i = 0; i < Q.length; i += 2) { const dx = Q[i] - H.cx, dy = Q[i + 1] - H.cy; xx += dx * dx; yy += dy * dy; xy += dx * dy; }
      H.ang = .5 * Math.atan2(2 * xy, xx - yy); out.push(H);
    }
    this.HT = out;
  },
  area2(Q) { let a = 0; for (let i = 0, n = Q.length; i < n; i += 2) { const j = (i + 2) % n; a += Q[i] * Q[j + 1] - Q[j] * Q[i + 1]; } return a; },
  dentroP(Q, x, y) { let c = false; for (let i = 0, j = Q.length - 2; i < Q.length; j = i, i += 2) { const ax = Q[i], ay = Q[i + 1], bx = Q[j], by = Q[j + 1]; if ((ay > y) !== (by > y) && x < (bx - ax) * (y - ay) / (by - ay) + ax) c = !c; } return c; },
  dentroH(H, x, y) { if (x < H.x0 || x > H.x1 || y < H.y0 || y > H.y1) return false; for (const Q of H.P) if (this.dentroP(Q, x, y)) return true; return false; },
  hitosEn(x0, y0, x1, y1) { return this.HT.filter(H => H.x1 > x0 && H.x0 < x1 && H.y1 > y0 && H.y0 < y1); },
  /* ---------- dibujo ---------- */
  pol(g, Q, z) { const u = z * this.ob; g.moveTo(Q[0], Q[1] - u); for (let i = 2; i < Q.length; i += 2) g.lineTo(Q[i], Q[i + 1] - u); g.closePath(); },
  /* muros visibles de un prisma (cara con su normal hacia abajo de la pantalla), del más lejano al más cercano */
  muros(g, Q, z0, z1, col, det) {
    const n = Q.length, cw = this.area2(Q) > 0, ob = this.ob, F = [];
    for (let i = 0; i < n; i += 2) { const ax = Q[i], ay = Q[i + 1], bx = Q[(i + 2) % n], by = Q[(i + 3) % n]; let nx = by - ay, ny = -(bx - ax); if (!cw) { nx = -nx; ny = -ny; } const L = Math.hypot(nx, ny) || 1; if (ny / L < .03) continue; F.push([Math.max(ay, by), ax, ay, bx, by, nx / L]); }
    F.sort((p, q) => p[0] - q[0]);
    for (const [, ax, ay, bx, by, nx] of F) {
      g.fillStyle = Art.shade(col, .8 + .2 * nx); g.beginPath(); g.moveTo(ax, ay - z0 * ob); g.lineTo(bx, by - z0 * ob); g.lineTo(bx, by - z1 * ob); g.lineTo(ax, ay - z1 * ob); g.closePath(); g.fill();
      if (det) det(ax, ay, bx, by, z0, z1, nx);
    }
    return F;
  },
  techo(g, Q, z, col, borde) { g.fillStyle = col; g.beginPath(); this.pol(g, Q, z); g.fill(); if (borde) { g.strokeStyle = borde; g.lineWidth = .35; g.stroke(); } },
  /* pirámide (corona, cubierta de torre): del polígono a la altura z hasta un vértice a zt */
  piramide(g, Q, z, zt, cx, cy, col) {
    const ob = this.ob, n = Q.length, F = []; for (let i = 0; i < n; i += 2) { const ax = Q[i], ay = Q[i + 1], bx = Q[(i + 2) % n], by = Q[(i + 3) % n]; F.push([(ay + by) / 2, ax, ay, bx, by]); }
    F.sort((p, q) => p[0] - q[0]);
    for (const [, ax, ay, bx, by] of F) { const mx = (ax + bx) / 2 - cx, my = (ay + by) / 2 - cy, L = Math.hypot(mx, my) || 1; g.fillStyle = Art.shade(col, .82 + .22 * (mx / L) * -.6 + .12 * (my / L)); g.beginPath(); g.moveTo(ax, ay - z * ob); g.lineTo(bx, by - z * ob); g.lineTo(cx, cy - zt * ob); g.closePath(); g.fill(); }
  },
  /* pisos: líneas de ventanas a lo largo de una cara (punteadas si son ventanas sueltas) */
  ventanas(g, ax, ay, bx, by, z0, z1, piso, col, lw, dash) {
    const ob = this.ob; g.strokeStyle = col; g.lineWidth = lw; if (dash) g.setLineDash(dash); g.beginPath();
    for (let z = z0 + piso * .55; z < z1 - .8; z += piso) { g.moveTo(ax + (bx - ax) * .06, ay + (by - ay) * .06 - z * ob); g.lineTo(ax + (bx - ax) * .94, ay + (by - ay) * .94 - z * ob); }
    g.stroke(); if (dash) g.setLineDash([]);
  },
  cuadro(cx, cy, u, a, b, c, d) { const ux = Math.cos(u), uy = Math.sin(u); return Float32Array.from([[a, c], [b, c], [b, d], [a, d]].flatMap(([s, t]) => [cx + ux * s - uy * t, cy + uy * s + ux * t])); },
  cupula(g, cx, cy, z, r, col) {
    const ob = this.ob; g.fillStyle = Art.shade(col, .8); g.fillRect(cx - r, cy - (z + r * .35) * ob, r * 2, r * .35 * ob + .01);
    g.fillStyle = col; g.beginPath(); g.ellipse(cx, cy - (z + r * .35) * ob - r * .25, r, r * .95, 0, Math.PI, 0); g.lineTo(cx + r, cy - (z + r * .35) * ob); g.closePath(); g.fill();
    g.fillStyle = 'rgba(255,255,255,.28)'; g.beginPath(); g.ellipse(cx - r * .35, cy - (z + r * .35) * ob - r * .7, r * .3, r * .22, -.5, 0, TAU); g.fill();
    g.fillStyle = Art.shade(col, .7); g.fillRect(cx - r * .12, cy - (z + r * .35) * ob - r * 1.4, r * .24, r * .45);
  },
  sombra(g, H) { const sx = Math.min(16, H.h * .32 + 1), sy = Math.min(10, H.h * .2 + .5); for (const Q of H.P) { g.moveTo(Q[0] + sx, Q[1] + sy); for (let i = 2; i < Q.length; i += 2) g.lineTo(Q[i] + sx, Q[i + 1] + sy); g.closePath(); for (let i = 0; i < Q.length; i += 2) { g.moveTo(Q[i], Q[i + 1]); g.lineTo(Q[i] + sx, Q[i + 1] + sy); } } },
  /* suelo de las plazas y parques especiales (antes que los edificios) */
  hitoSuelo(g, H, lod, cv) {
    const ob = this.ob, Q = H.P[0], clip = () => { g.save(); g.beginPath(); for (const P of H.P) this.pol(g, P, 0); g.clip(); };
    if (H.k === 'botero') { this.techo(g, Q, 0, '#d9ccb0', '#b9a98a'); if (lod === 0) { clip(); g.strokeStyle = 'rgba(150,130,100,.35)'; g.lineWidth = .15; g.beginPath(); for (let x = Math.floor(H.x0 / 4) * 4; x < H.x1; x += 4) { g.moveTo(x, H.y0); g.lineTo(x, H.y1); } for (let y = Math.floor(H.y0 / 4) * 4; y < H.y1; y += 4) { g.moveTo(H.x0, y); g.lineTo(H.x1, y); } g.stroke(); g.restore(); } }
    else if (H.k === 'pies') {
      this.techo(g, Q, 0, '#e4d2a2', '#c8b07c'); clip(); const L = Math.max(H.x1 - H.x0, H.y1 - H.y0), u = H.ang, ux = Math.cos(u), uy = Math.sin(u);
      g.strokeStyle = '#5aa9d6'; g.lineWidth = 2.2; g.lineCap = 'round'; g.beginPath(); for (const o of [-14, 0, 14]) { g.moveTo(H.cx - ux * L - uy * o, H.cy - uy * L + ux * o); g.lineTo(H.cx + ux * L - uy * o, H.cy + uy * L + ux * o); } g.stroke();
      for (let i = 0; i < 70; i++) { const x = H.x0 + h2(i, 3, 61) * (H.x1 - H.x0), y = H.y0 + h2(i, 4, 61) * (H.y1 - H.y0); if (h2(i, 5, 61) < .45) { g.fillStyle = 'rgba(20,40,20,.3)'; g.beginPath(); g.arc(x + .8, y + .6, 1.6, 0, TAU); g.fill(); g.fillStyle = ['#4b7d35', '#5e9440', '#3e6d2e'][i % 3]; g.beginPath(); g.arc(x, y - 1.2, 1.5, 0, TAU); g.fill(); } }   // guaduales
      g.restore();
    } else if (H.k === 'luces') { this.techo(g, Q, 0, '#d9d6cf', '#b8b3a8'); if (lod === 0) { clip(); g.strokeStyle = 'rgba(120,116,108,.3)'; g.lineWidth = .15; g.beginPath(); for (let x = Math.floor(H.x0 / 7) * 7; x < H.x1; x += 7) { g.moveTo(x, H.y0); g.lineTo(x, H.y1); } for (let y = Math.floor(H.y0 / 7) * 7; y < H.y1; y += 7) { g.moveTo(H.x0, y); g.lineTo(H.x1, y); } g.stroke(); g.restore(); } }
  },
  /* el volumen de cada hito, en su turno del orden de pintura */
  hito(g, H, lod, cv) {
    const ob = this.ob, h = H.h, fino = lod === 0, L = cv.lights || (cv.lights = []), G = cv.glow || (cv.glow = []);
    const contorno = (Q, z) => { g.strokeStyle = 'rgba(20,26,38,.55)'; g.lineWidth = fino ? .32 : .8; g.beginPath(); this.pol(g, Q, z); g.stroke(); };
    switch (H.k) {
      case 'aguja': {   // Coltejer: torre de 150 m con su corona en punta de aguja (175 m)
        const Q = H.P[0], c = '#cfd3d6', zt = h + (H.o.corona || 25) * 1.5;
        this.muros(g, Q, 0, h, c, fino ? (ax, ay, bx, by) => { g.strokeStyle = 'rgba(40,60,80,.35)'; g.lineWidth = .25; g.beginPath(); for (let t = .1; t < 1; t += .1) { const x = ax + (bx - ax) * t, y = ay + (by - ay) * t; g.moveTo(x, y - 1); g.lineTo(x, y - h * ob); } g.stroke(); } : null);
        this.techo(g, Q, h, '#b8bdc2'); this.piramide(g, Q, h, zt, H.cx, H.cy, '#c9ced3');
        g.fillStyle = '#1d2733'; g.beginPath(); g.moveTo(H.cx - .5, H.cy + 1 - (h + 4) * ob); g.lineTo(H.cx + .5, H.cy + 1 - (h + 4) * ob); g.lineTo(H.cx, H.cy + 1 - (zt - 6) * ob); g.closePath(); g.fill();   // el ojo de la aguja
        contorno(Q, h); L.push([H.cx, H.cy - h * ob * .5, 8, h]); G.push([H.cx, H.cy - zt * ob, 3]); break;
      }
      case 'basilica': case 'iglesia': {   // nave, cubierta a dos aguas, torres de la fachada y cúpula
        const Q = H.P[0], bas = H.k === 'basilica', pared = bas ? '#9c4a33' : '#efe9dc', teja = bas ? '#7e3a28' : '#b9553a', u = H.ang, ux = Math.cos(u), uy = Math.sin(u);
        let a0 = 1e9, a1 = -1e9, b0 = 1e9, b1 = -1e9; for (let i = 0; i < Q.length; i += 2) { const dx = Q[i] - H.cx, dy = Q[i + 1] - H.cy, a = dx * ux + dy * uy, b = -dx * uy + dy * ux; a0 = Math.min(a0, a); a1 = Math.max(a1, a); b0 = Math.min(b0, b); b1 = Math.max(b1, b); }
        if (H.fr == null) { const calle = s => { let bd = 1e9; const x = H.cx + ux * s, y = H.cy + uy * s; for (const c of this.near(x - 40, y - 40, x + 40, y + 40)) { const P = c.P; for (let i = 2; i < P.length; i += 2) { const ax = P[i - 2], ay = P[i - 1], dx = P[i] - ax, dy = P[i + 1] - ay, t = clamp(((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy || 1), 0, 1); bd = Math.min(bd, Math.hypot(ax + dx * t - x, ay + dy * t - y)); } } return bd; }; H.fr = calle(a1) < calle(a0) ? 1 : -1; }
        this.muros(g, Q, 0, h, pared, fino ? (ax, ay, bx, by, z0, z1) => this.ventanas(g, ax, ay, bx, by, z0, z1, h / 2, 'rgba(40,30,30,.5)', .9, [1, 3]) : null);
        this.techo(g, Q, h, teja); if (fino) { g.save(); g.beginPath(); this.pol(g, Q, h); g.clip(); g.fillStyle = 'rgba(255,255,255,.12)'; g.beginPath(); const R = 400; g.moveTo(H.cx - ux * R, H.cy - uy * R - h * ob); g.lineTo(H.cx + ux * R, H.cy + uy * R - h * ob); g.lineTo(H.cx + ux * R - uy * R, H.cy + uy * R + ux * R - h * ob); g.lineTo(H.cx - ux * R - uy * R, H.cy - uy * R + ux * R - h * ob); g.closePath(); g.fill(); g.restore(); }
        contorno(Q, h); const fa = H.fr > 0 ? a1 : a0; let f0 = 1e9, f1 = -1e9; for (let i = 0; i < Q.length; i += 2) { const dx = Q[i] - H.cx, dy = Q[i + 1] - H.cy, a = dx * ux + dy * uy, b = -dx * uy + dy * ux; if (Math.abs(a - fa) < (a1 - a0) * .22) { f0 = Math.min(f0, b); f1 = Math.max(f1, b); } } if (!(f1 > f0)) { f0 = b0; f1 = b1; } b0 = f0; b1 = f1;
        const s = Math.min(9, (b1 - b0) * .3), nT = H.o.torres || 1, ht = h * (bas ? 2.1 : 1.9);
        const torres = nT === 2 ? [b0 + s / 2, b1 - s / 2] : [(b0 + b1) / 2];
        if (H.o.cupula) { const r = Math.min(10, (b1 - b0) * .3), ca = fa - H.fr * (a1 - a0) * .62; this.cupula(g, H.cx + ux * ca, H.cy + uy * ca, h, r, bas ? '#8a8f94' : '#d8d2c4'); }
        for (const tb of torres) { const T = this.cuadro(H.cx, H.cy, u, fa - H.fr * s, fa, tb - s / 2, tb + s / 2); this.muros(g, T, 0, ht, pared, fino ? (ax, ay, bx, by, z0, z1) => this.ventanas(g, ax, ay, bx, by, z0, z1, 6, 'rgba(30,20,20,.6)', .7, [.8, 2]) : null); this.techo(g, T, ht, Art.shade(pared, .9)); let tx = 0, ty = 0; for (let i = 0; i < 8; i += 2) { tx += T[i] / 4; ty += T[i + 1] / 4; } this.piramide(g, T, ht, ht + s * 1.3, tx, ty, teja); G.push([tx, ty - (ht + s * 1.3) * ob, 1.5]); }
        L.push([H.cx, H.cy - h * ob * .5, 10, h]); break;
      }
      case 'palacio': {   // Palacio de la Cultura: piedra en franjas blancas y negras, pináculos y cúpula central
        const Q = H.P[0];
        this.muros(g, Q, 0, h, '#f0ece2', (ax, ay, bx, by, z0, z1) => { g.strokeStyle = 'rgba(34,34,38,.8)'; g.lineWidth = .45; g.beginPath(); for (let z = 1.2; z < z1; z += 2.2) { g.moveTo(ax, ay - z * ob); g.lineTo(bx, by - z * ob); } g.stroke(); if (fino) this.ventanas(g, ax, ay, bx, by, z0, z1, 6, 'rgba(20,30,50,.55)', .8, [1, 2.6]); });
        this.techo(g, Q, h, '#6b6e75'); contorno(Q, h);
        for (let i = 0; i < Q.length; i += 2) { const x = Q[i], y = Q[i + 1], T = this.cuadro(x, y, 0, -.9, .9, -.9, .9); this.piramide(g, T, h, h + 5, x, y, '#3a3d44'); }
        this.cupula(g, H.cx, H.cy, h, 7, '#55595f'); L.push([H.cx, H.cy - h * ob * .5, 8, h]); break;
      }
      case 'estadio': {   // Atanasio Girardot: muro exterior, graderías en anillos que bajan hacia la cancha
        const O = H.P[0], C = H.C, sC = C ? Math.sqrt(Math.abs(this.area2(C)) / Math.abs(this.area2(O))) : .55, N = fino ? 6 : 3;
        this.muros(g, O, 0, h, '#c3c6c9', fino ? (ax, ay, bx, by, z0, z1) => this.ventanas(g, ax, ay, bx, by, z0, z1, 5.5, 'rgba(40,46,56,.5)', .6, [2, 2]) : null); contorno(O, h);
        for (let i = 0; i < N; i++) { const f = 1 - (1 - sC * 1.04) * i / N, z = h - (h - 2) * i / N, R = new Float32Array(O.length); for (let j = 0; j < O.length; j += 2) { R[j] = H.cx + (O[j] - H.cx) * f; R[j + 1] = H.cy + (O[j + 1] - H.cy) * f; } this.techo(g, R, z, i % 2 ? '#9aa3ad' : '#b4bcc5'); if (fino && i % 2 === 0) { g.strokeStyle = 'rgba(220,40,40,.35)'; g.lineWidth = .4; g.beginPath(); this.pol(g, R, z); g.stroke(); } }
        if (C) { this.techo(g, C, 0, '#4f9a3c', '#f4f4ee'); if (fino) { let sx = 0, sy = 0; for (let j = 0; j < C.length; j += 2) { sx += C[j]; sy += C[j + 1]; } const n = C.length / 2, cx = sx / n, cy = sy / n; g.save(); g.beginPath(); this.pol(g, C, 0); g.clip(); g.fillStyle = 'rgba(255,255,255,.07)'; for (let x = Math.floor(H.x0 / 6) * 6; x < H.x1; x += 12) g.fillRect(x, H.y0, 6, H.y1 - H.y0); g.restore(); g.strokeStyle = '#f4f4ee'; g.lineWidth = .35; g.beginPath(); g.arc(cx, cy, 9.15, 0, TAU); g.stroke(); } }
        for (let j = 0; j < O.length; j += 8) G.push([O[j], O[j + 1] - (h + 8) * ob, 4]); break;   // torres de luz
      }
      case 'rocas': {   // Biblioteca España: tres rocas negras talladas sobre la ladera
        H.P.forEach((Q, i) => { const z = h * [1, .82, .7][i % 3]; this.muros(g, Q, 0, z, '#2b2c31'); let cx = 0, cy = 0; for (let j = 0; j < Q.length; j += 2) { cx += Q[j] * 2 / Q.length; cy += Q[j + 1] * 2 / Q.length; }
          for (let j = 0; j < Q.length; j += 2) { g.fillStyle = (j / 2) % 2 ? '#43454d' : '#55575f'; g.beginPath(); g.moveTo(Q[j], Q[j + 1] - z * ob); g.lineTo(Q[(j + 2) % Q.length], Q[(j + 3) % Q.length] - z * ob); g.lineTo(cx, cy - (z + 3) * ob); g.closePath(); g.fill(); }
          contorno(Q, z); L.push([cx, cy - z * ob * .5, 4, z]); }); break;
      }
      case 'vidrio': {   // Edificio EPM: vidrio azul verdoso con montantes y reflejos
        const Q = H.P[0];
        this.muros(g, Q, 0, h, '#4f86a8', fino ? (ax, ay, bx, by, z0, z1) => { g.strokeStyle = 'rgba(210,230,240,.35)'; g.lineWidth = .2; g.beginPath(); const Lf = Math.hypot(bx - ax, by - ay); for (let t = 0; t < Lf; t += 3) { const x = ax + (bx - ax) * t / Lf, y = ay + (by - ay) * t / Lf; g.moveTo(x, y); g.lineTo(x, y - z1 * ob); } g.stroke(); this.ventanas(g, ax, ay, bx, by, z0, z1, 4.2, 'rgba(20,40,60,.4)', .25); g.fillStyle = 'rgba(255,255,255,.12)'; g.beginPath(); g.moveTo(ax, ay - z1 * ob * .2); g.lineTo(ax + (bx - ax) * .35, ay + (by - ay) * .35 - z1 * ob * .9); g.lineTo(ax + (bx - ax) * .5, ay + (by - ay) * .5 - z1 * ob * .9); g.lineTo(ax + (bx - ax) * .15, ay + (by - ay) * .15 - z1 * ob * .2); g.closePath(); g.fill(); } : null);
        this.techo(g, Q, h, '#7d8a93'); contorno(Q, h); L.push([H.cx, H.cy - h * ob * .5, 14, h]); L.push([H.cx + 8, H.cy - h * ob * .5, 14, h]); break;
      }
      case 'ladrillo': {   // Teatro Metropolitano, Biblioteca EPM y MAMM: ladrillo a la vista
        const Q = H.P[0]; this.muros(g, Q, 0, h, '#a5543a', fino ? (ax, ay, bx, by, z0, z1) => { g.strokeStyle = 'rgba(70,30,20,.28)'; g.lineWidth = .12; g.beginPath(); for (let z = .6; z < z1; z += .9) { g.moveTo(ax, ay - z * ob); g.lineTo(bx, by - z * ob); } g.stroke(); } : null);
        this.techo(g, Q, h, '#8f4630'); contorno(Q, h); L.push([H.cx, H.cy - h * ob * .5, 6, h]); break;
      }
      case 'republicano': {   // edificios republicanos del centro: color, cornisa y ventanas por piso
        const Q = H.P[0], col = H.o.col || '#d9c9a5'; this.muros(g, Q, 0, h, col, (ax, ay, bx, by, z0, z1) => { g.strokeStyle = Art.shade(col, .7); g.lineWidth = .8; g.beginPath(); g.moveTo(ax, ay - (z1 - .6) * ob); g.lineTo(bx, by - (z1 - .6) * ob); g.stroke(); if (fino) this.ventanas(g, ax, ay, bx, by, z0, z1 - 1, 4, 'rgba(50,40,30,.6)', 1.1, [.9, 1.6]); });
        this.techo(g, Q, h, Art.shade(col, .82)); contorno(Q, h); L.push([H.cx, H.cy - h * ob * .5, 8, h]); break;
      }
      case 'moderno': {   // La Alpujarra y otros: concreto con franjas de ventanas
        const Q = H.P[0]; this.muros(g, Q, 0, h, '#c4c8cc', fino ? (ax, ay, bx, by, z0, z1) => this.ventanas(g, ax, ay, bx, by, z0, z1, 3.6, 'rgba(40,58,80,.6)', 1) : null);
        this.techo(g, Q, h, '#a6aab0'); contorno(Q, h); const T = this.cuadro(H.cx, H.cy, H.ang, -4, 4, -3, 3); this.muros(g, T, h, h + 3, '#9aa0a6'); this.techo(g, T, h + 3, '#8c9298'); L.push([H.cx, H.cy - h * ob * .5, 12, h]); break;
      }
      case 'alpujarra': {   // Alcaldía, Gobernación y Palacio de Justicia: bloques de concreto blanco con fachada inclinada
        // (más anchos abajo), parteluces verticales y ventanas oscuras de bronce entre culatas macizas, como en las fotos aéreas
        const Q = H.P[0], n = Q.length / 2, cw = this.area2(Q) > 0, f = .88, T = new Float32Array(Q.length); let Lmax = 0;
        for (let i = 0; i < n; i++) { T[2 * i] = H.cx + (Q[2 * i] - H.cx) * f; T[2 * i + 1] = H.cy + (Q[2 * i + 1] - H.cy) * f; const j = (i + 1) % n; Lmax = Math.max(Lmax, Math.hypot(Q[2 * j] - Q[2 * i], Q[2 * j + 1] - Q[2 * i + 1])); }
        const F = []; for (let i = 0; i < n; i++) { const j = (i + 1) % n, ax = Q[2 * i], ay = Q[2 * i + 1], bx = Q[2 * j], by = Q[2 * j + 1]; let nx = by - ay, ny = -(bx - ax); if (!cw) { nx = -nx; ny = -ny; } const L = Math.hypot(nx, ny) || 1; if (ny / L < .03) continue; F.push([Math.max(ay, by), i, j, nx / L, Math.hypot(bx - ax, by - ay)]); }
        F.sort((p, q) => p[0] - q[0]); const u = h * ob;
        for (const [, i, j, nx, L] of F) {
          const ax = Q[2 * i], ay = Q[2 * i + 1], bx = Q[2 * j], by = Q[2 * j + 1], tx = T[2 * i], ty = T[2 * i + 1] - u, sx = T[2 * j], sy = T[2 * j + 1] - u, larga = L > Lmax * .45;
          g.fillStyle = Art.shade(larga ? '#8d9097' : '#eceae4', .84 + .18 * nx); g.beginPath(); g.moveTo(ax, ay); g.lineTo(bx, by); g.lineTo(sx, sy); g.lineTo(tx, ty); g.closePath(); g.fill();
          if (larga && fino) {   // parteluces blancos y franja alta
            g.strokeStyle = 'rgba(236,234,228,.9)'; g.lineWidth = .45; g.beginPath(); const m = Math.max(4, Math.round(L / 1.6));
            for (let q = 1; q < m; q++) { const t = q / m; g.moveTo(ax + (bx - ax) * t, ay + (by - ay) * t); g.lineTo(tx + (sx - tx) * t, ty + (sy - ty) * t); } g.stroke();
            g.strokeStyle = 'rgba(60,62,70,.55)'; g.lineWidth = .3; g.beginPath(); for (let z = 3.6; z < h - 3; z += 3.6) { const a = z / h; g.moveTo(ax + (tx - ax) * a, ay + (ty - ay) * a); g.lineTo(bx + (sx - bx) * a, by + (sy - by) * a); } g.stroke();
            g.fillStyle = '#eceae4'; const a = 1 - 2.4 / h; g.beginPath(); g.moveTo(ax + (tx - ax) * a, ay + (ty - ay) * a); g.lineTo(bx + (sx - bx) * a, by + (sy - by) * a); g.lineTo(sx, sy); g.lineTo(tx, ty); g.closePath(); g.fill();
          }
        }
        this.techo(g, T, h, '#d9d7d0', 'rgba(120,118,110,.6)'); contorno(T, h);
        const M = this.cuadro(H.cx, H.cy, H.ang, -5, 5, -3, 3); this.muros(g, M, h, h + 2.6, '#cfcdc6'); this.techo(g, M, h + 2.6, '#bdbab2');
        L.push([H.cx, H.cy - h * ob * .5, 14, h]); break;
      }
      case 'cupula': {   // Planetario: base clara y la gran cúpula
        const Q = H.P[0]; this.muros(g, Q, 0, h, '#e6e2d8'); this.techo(g, Q, h, '#cfcac0'); contorno(Q, h); this.cupula(g, H.cx, H.cy, h, Math.min(14, Math.sqrt(H.A / Math.PI) * .62), '#e9edf0'); break;
      }
      case 'cubos': {   // Parque Explora: las cajas rojas
        for (const Q of H.P) { this.muros(g, Q, 0, h, '#c1272d'); this.techo(g, Q, h, '#d9473e', '#f4f1ea'); }
        break;
      }
      case 'luces': {   // Parque de las Luces: postes de 24 m (de noche se encienden)
        if (lod > 0) break; const Q = H.P[0], tops = []; for (let y = Math.floor(H.y0 / 8) * 8 + 4; y < H.y1; y += 8) for (let x = Math.floor(H.x0 / 8) * 8 + 4; x < H.x1; x += 8) if (this.dentroP(Q, x, y)) tops.push(x, y);
        g.strokeStyle = 'rgba(30,34,40,.28)'; g.lineWidth = .4; g.beginPath(); for (let i = 0; i < tops.length; i += 2) { g.moveTo(tops[i], tops[i + 1]); g.lineTo(tops[i] + 7, tops[i + 1] + 4.5); } g.stroke();   // sombras
        g.strokeStyle = '#7e8288'; g.lineWidth = .7; g.beginPath(); for (let i = 0; i < tops.length; i += 2) { g.moveTo(tops[i], tops[i + 1]); g.lineTo(tops[i], tops[i + 1] - 24 * ob); } g.stroke();
        g.strokeStyle = '#f6f5f1'; g.lineWidth = .4; g.beginPath(); for (let i = 0; i < tops.length; i += 2) { g.moveTo(tops[i] - .1, tops[i + 1]); g.lineTo(tops[i] - .1, tops[i + 1] - 24 * ob); tops[i + 1] -= 24 * ob; } g.stroke(); g.fillStyle = '#ffffff'; for (let i = 0; i < tops.length; i += 2) { g.beginPath(); g.arc(tops[i], tops[i + 1], .45, 0, TAU); g.fill(); G.push([tops[i], tops[i + 1], 2.2]); } break;
      }
      case 'botero': {   // Plaza Botero: las esculturas de bronce
        const Q = H.P[0], S = []; for (let i = 0; i < 120 && S.length < 23; i++) { const x = H.x0 + 4 + h2(i, 1, 23) * (H.x1 - H.x0 - 8), y = H.y0 + 4 + h2(i, 2, 23) * (H.y1 - H.y0 - 8); if (this.dentroP(Q, x, y) && S.every(([a, b]) => Math.hypot(a - x, b - y) > 7)) S.push([x, y]); }
        S.sort((p, q) => p[1] - q[1]); for (const [x, y] of S) { const r = 1.9 + h2(x | 0, y | 0, 3) * .9; g.fillStyle = 'rgba(20,20,20,.3)'; g.beginPath(); g.ellipse(x + 1.2, y + .8, r * 1.1, r * .7, 0, 0, TAU); g.fill(); g.fillStyle = '#5a4630'; g.beginPath(); g.ellipse(x, y - 1.6 * ob - r * .5, r, r * 1.2, 0, 0, TAU); g.fill(); g.fillStyle = '#7a6040'; g.beginPath(); g.arc(x - r * .25, y - 3.4 * ob - r * 1.3, r * .5, 0, TAU); g.fill(); }
        break;
      }
    }
  },
  /* nombres de los hitos (de cerca), sobre su volumen */
  rotulosHitos(texto, S, k, kc, dpr, night) {
    if (kc < 1.1) return; for (const H of this.HT) { if (H.libre) continue; const [x, y] = S(H.cx, H.cy - Math.min(H.h, 60) * this.ob - 3); texto(H.n, x, y, 0, 'italic 700 ' + clamp(kc * 4.2, 9, 12) * dpr + 'px Cuerpo, sans-serif', night > .4 ? '#ffe2a8' : '#3a2a12', night > .4 ? 'rgba(10,16,26,.85)' : 'rgba(250,246,236,.92)', 3 * dpr); }
  }
});
