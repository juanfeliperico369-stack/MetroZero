/* =====================================================================
   ARTE: pixel art procedural con contornos definidos (sin imágenes externas)
   ===================================================================== */
const PAL = { papel: '#f1ece0', crema: '#faf6ec', mante: '#fbe7b0', tinta: '#154a80', petro: '#1C5C9C', teal: '#0E6F76', rojo: '#EC343A', mostaza: '#F6C538', gris: '#9aa1a8', noche: '#0f2a45', noche2: '#163a5c', naranja: '#E38835', negro: '#141414', blanco: '#fdfbf5', verde: '#59AB42', ladrillo: '#b4583a', ladrillo2: '#9a4630', plata: '#c9ced4', vidrio: '#9fd3e6' };
const SKIN = ['#f1c9a5', '#d9a77f', '#b07a52', '#8a5a3b', '#5e3b26'], ROPA = ['#c8201f', '#12446c', '#2f9b57', '#c3952f', '#ff6a3d', '#7a5cc4', '#f9e4a4', '#141414', '#1b8088'];
const Art = EM.art = {
  px(g, x, y, w, h, c) { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); },
  shade(hex, m) { const n = parseInt(hex.slice(1), 16); return 'rgb(' + clamp((n >> 16) * m, 0, 255) + ',' + clamp((n >> 8 & 255) * m, 0, 255) + ',' + clamp((n & 255) * m, 0, 255) + ')'; },
  /* persona pequeña (6 px de alto a escala 1) */
  person(g, x, y, s, seed, walk) {
    const r = h2(seed, 7, 1), c = ROPA[(r * ROPA.length) | 0], k = SKIN[(h2(seed, 3, 2) * SKIN.length) | 0], leg = walk ? (Math.floor(now() * 6 + seed) % 2) : 0;
    this.px(g, x - s, y - 6 * s, 2 * s, 2 * s, k); this.px(g, x - s, y - 4 * s, 2 * s, 2.5 * s, c);
    this.px(g, x - s, y - 1.5 * s, s * .9, 1.5 * s + (leg ? -.5 * s : 0), PAL.negro); this.px(g, x + .1 * s, y - 1.5 * s, s * .9, 1.5 * s + (leg ? 0 : -.5 * s), PAL.negro);
  },
  /* tren de lado (portada y escenas): carros con franja del color de la línea */
  trainSide(g, x, y, cars, col, s = 1, lit = false) {
    const cw = 46 * s, ch = 13 * s;
    for (let i = 0; i < cars; i++) {
      const cx = x + i * (cw + 2 * s);
      this.px(g, cx, y, cw, ch, PAL.negro); this.px(g, cx + s, y + s, cw - 2 * s, ch - 2 * s, PAL.plata);
      this.px(g, cx + s, y + ch - 4 * s, cw - 2 * s, 2 * s, col);
      for (let w = 0; w < 5; w++) this.px(g, cx + 4 * s + w * 8.4 * s, y + 3 * s, 6 * s, 4 * s, lit ? '#ffe9a6' : PAL.vidrio);
      this.px(g, cx + cw / 2 - 2 * s, y + 3 * s, 4 * s, 8 * s, PAL.gris);
      if (i === cars - 1) { this.px(g, cx + cw - 3 * s, y + 3 * s, 2 * s, 4 * s, PAL.tinta); this.px(g, cx + cw - 2 * s, y + ch - 6 * s, 2 * s, 2 * s, '#fff6c0'); }
    }
  },
  /* frente/atrás de tren o bus (vista en 3a persona y escenas) */
  vehicleBack(g, cx, by, w, col, kind, lights) {
    const h = kind === 'metro' ? w * .95 : kind === 'tram' ? w * .9 : w * .85, x = cx - w / 2, y = by - h, s = Math.max(1, w / 40);
    g.fillStyle = PAL.negro; g.fillRect(x - s, y - s, w + 2 * s, h + 2 * s);
    g.fillStyle = kind === 'brt' || kind === 'feeder' ? col : PAL.plata; g.fillRect(x, y, w, h);
    g.fillStyle = PAL.tinta; g.fillRect(x + w * .12, y + h * .12, w * .76, h * .38);           // ventana trasera
    g.fillStyle = 'rgba(255,255,255,.25)'; g.fillRect(x + w * .14, y + h * .14, w * .2, h * .1);
    g.fillStyle = kind === 'brt' || kind === 'feeder' ? PAL.blanco : col; g.fillRect(x, y + h * .62, w, h * .1);
    g.fillStyle = lights ? '#ff3b2f' : '#7a1d16'; g.fillRect(x + w * .06, y + h * .76, w * .14, h * .1); g.fillRect(x + w * .8, y + h * .76, w * .14, h * .1);
    g.fillStyle = PAL.negro; g.fillRect(x + w * .3, y + h * .8, w * .4, h * .12);
    if (kind === 'metro' || kind === 'tram') { g.fillStyle = PAL.negro; g.fillRect(cx - s, y - h * .35, 2 * s, h * .35); g.fillRect(cx - w * .25, y - h * .36, w * .5, s * 1.5); }   // pantógrafo
  },
  /* cabina de metrocable */
  cabin(g, x, y, s, col) {
    this.px(g, x - .5 * s, y - 6 * s, s, 6 * s, PAL.negro);
    this.px(g, x - 4 * s, y, 8 * s, 7 * s, PAL.negro); this.px(g, x - 3.5 * s, y + .5 * s, 7 * s, 6 * s, col);
    this.px(g, x - 3 * s, y + 1.5 * s, 6 * s, 2.5 * s, PAL.vidrio);
  },
  /* vehículo visto desde arriba (vista cenital), centrado, rotado */
  topVehicle(g, x, y, a, len, wid, col, kind) {
    g.save(); g.translate(x, y); g.rotate(a);
    g.fillStyle = PAL.negro; g.fillRect(-len / 2 - 1, -wid / 2 - 1, len + 2, wid + 2);
    g.fillStyle = kind === 'brt' || kind === 'feeder' || kind === 'car' ? col : PAL.plata; g.fillRect(-len / 2, -wid / 2, len, wid);
    if (kind === 'metro' || kind === 'tram') { g.fillStyle = col; g.fillRect(-len / 2, -wid * .15, len, wid * .3); const n = kind === 'metro' ? 3 : 5; g.fillStyle = PAL.negro; for (let i = 1; i < n; i++) g.fillRect(-len / 2 + len * i / n - .5, -wid / 2, 1, wid); }
    else { g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(len * .18, -wid / 2 + 1, len * .14, wid - 2); }
    g.fillStyle = '#fff6c0'; g.fillRect(len / 2 - 2, -wid / 2 + 1, 2, 2); g.fillRect(len / 2 - 2, wid / 2 - 3, 2, 2);
    g.restore();
  },
  /* edificio en vista 3D (cara frontal) con ventanas pixeladas */
  building(g, x, y, w, h, seed, night, brick) {
    const base = brick ? (h2(seed, 1, 9) < .5 ? PAL.ladrillo : PAL.ladrillo2) : ['#8d97a4', '#a3a9b0', '#7c8794', '#b8b0a0', '#d9cdae'][(h2(seed, 2, 9) * 5) | 0];
    g.fillStyle = PAL.negro; g.fillRect(x - 1, y - 1, w + 2, h + 1);
    g.fillStyle = night ? this.shade(base, .38) : base; g.fillRect(x, y, w, h);
    if (w < 4 || h < 4) return;
    const cw = Math.max(2, w / 6), chh = Math.max(2, h / (brick ? 4 : 9)), lit = night ? '#ffd96a' : (brick ? '#5b2b1e' : '#3a5468');
    for (let yy = y + chh * .6; yy < y + h - chh; yy += chh * 1.6) for (let xx = x + cw * .6; xx < x + w - cw; xx += cw * 1.7) {
      if (night && h2(xx | 0, yy | 0, seed) < .45) continue;
      g.fillStyle = lit; g.fillRect(xx, yy, cw * .8, chh * .8);
    }
    if (brick) { g.fillStyle = this.shade(base, .7); g.fillRect(x, y, w, Math.max(1, h * .06)); }
  },
  tree(g, x, y, s, night) { this.px(g, x - s * .15, y - s * .5, s * .3, s * .5, '#4a3020'); g.fillStyle = PAL.negro; g.beginPath(); g.arc(x, y - s * .9, s * .52, 0, TAU); g.fill(); g.fillStyle = night ? '#1f3b25' : '#3b7334'; g.beginPath(); g.arc(x, y - s * .9, s * .45, 0, TAU); g.fill(); },
  /* ---------- escena de portada: el valle al atardecer ---------- */
  cover(g, W, H, t, night) {
    g.imageSmoothingEnabled = false;
    const sky = night ? ['#0c2533', '#123447', '#1b4459', '#28536a'] : ['#12446c', '#1b8088', '#e9a25f', '#f9e4a4'];
    for (let i = 0; i < 4; i++) { g.fillStyle = sky[i]; g.fillRect(0, i * H * .14, W, H * .14 + 1); }
    g.fillStyle = sky[3]; g.fillRect(0, H * .56, W, H * .1);
    if (!night) { g.fillStyle = '#fbf3d0'; g.beginPath(); g.arc(W * .7, H * .5, H * .16, 0, TAU); g.fill(); }
    else for (let i = 0; i < 40; i++) { const sx = h2(i, 1, 4) * W, sy = h2(i, 2, 4) * H * .4; if ((t * 2 + i) % 7 > .4) this.px(g, sx, sy, 1, 1, '#f9e4a4'); }
    // montañas (dos capas) con luces de los barrios
    const ridge = (base, amp, f, col, seed, lights) => {
      g.fillStyle = col; g.beginPath(); g.moveTo(0, H);
      for (let x = 0; x <= W; x += 2) { const y = base - amp * (.55 * Math.sin(x * f + seed) + .3 * Math.sin(x * f * 2.3 + seed * 2) + .15 * Math.sin(x * f * 5.1 + seed)); g.lineTo(x, Math.round(y)); }
      g.lineTo(W, H); g.closePath(); g.fill();
      if (lights) for (let i = 0; i < 220; i++) { const x = h2(i, seed | 0, 5) * W, yb = base - amp * (.55 * Math.sin(x * f + seed) + .3 * Math.sin(x * f * 2.3 + seed * 2) + .15 * Math.sin(x * f * 5.1 + seed)), y = yb + h2(i, 9, seed | 0) * (H * .6 - yb); if (y > H * .72) continue; const on = night ? ((t * 1.5 + i * .37) % 5 > .3) : h2(i, 3, 1) < .5; this.px(g, x, y, 1.4, 1.4, night ? (on ? '#ffd96a' : '#8a6a3a') : (h2(i, 4, 1) < .6 ? PAL.ladrillo : '#d9cdae')); }
    };
    ridge(H * .5, H * .16, .021, night ? '#173a4c' : '#3d6f7d', 1.3, false);
    ridge(H * .62, H * .14, .03, night ? '#10303f' : '#2c5a52', 4.1, true);
    // metrocable cruzando la ladera
    const cx0 = W * .06, cy0 = H * .3, cx1 = W * .5, cy1 = H * .62;
    g.strokeStyle = PAL.negro; g.lineWidth = 1; g.beginPath(); g.moveTo(cx0, cy0); g.lineTo(cx1, cy1); g.stroke();
    for (let k = 0; k < 3; k++) { const f = ((t * .05 + k / 3) % 1), x = lerp(cx0, cx1, f), y = lerp(cy0, cy1, f) + 1; this.cabin(g, x, y + 5, 1, ['#f2a900', '#7cb342', '#d14b9a'][k]); }
    for (const f of [.33, .66]) { const x = lerp(cx0, cx1, f), y = lerp(cy0, cy1, f); this.px(g, x - 1, y, 2, H * .7 - y, PAL.negro); }
    // ciudad baja
    for (let i = 0; i < 26; i++) { const bw = 8 + h2(i, 1, 2) * 14, bx = h2(i, 2, 2) * W, bh = 10 + h2(i, 3, 2) * 34; this.building(g, bx, H * .78 - bh, bw, bh, i, night, h2(i, 4, 2) < .4); }
    // viaducto y tren de la línea A
    const vy = H * .74; this.px(g, 0, vy, W, 4, PAL.negro); this.px(g, 0, vy, W, 3, '#cfc6b0');
    for (let x = 6; x < W; x += 26) this.px(g, x, vy + 3, 4, H * .12, '#b8ae98');
    const tx = ((t * 34) % (W + 160)) - 150; this.trainSide(g, tx, vy - 13, 3, '#1f63ad', 1, night);
    // río Medellín
    g.fillStyle = night ? '#0f3a4a' : '#3a87a8'; g.fillRect(0, H * .88, W, H * .12);
    g.fillStyle = 'rgba(255,255,255,.25)'; for (let i = 0; i < 18; i++) { const x = (h2(i, 5, 5) * W + t * 9) % W; g.fillRect(x, H * .9 + (i % 4) * 4, 6, 1); }
    g.fillStyle = PAL.verde; g.fillRect(0, H * .86, W, 3);
  },
  /* ícono: frente de tren pixelado sobre petróleo (para íconos e instalador) */
  icon(g, S, maskable) {
    g.imageSmoothingEnabled = false; const u = S / 32, pad = maskable ? 5 * u : 2 * u;
    g.fillStyle = PAL.petro; g.fillRect(0, 0, S, S);
    if (!maskable) { g.fillStyle = PAL.mante; g.fillRect(u, u, S - 2 * u, S - 2 * u); g.fillStyle = PAL.petro; g.fillRect(2 * u, 2 * u, S - 4 * u, S - 4 * u); }
    const x = pad + 4 * u, y = pad + 3 * u, w = S - 2 * pad - 8 * u, h = S - 2 * pad - 7 * u, r = (a, b, c, d, col) => { g.fillStyle = col; g.fillRect(Math.round(a), Math.round(b), Math.round(c), Math.round(d)); };
    r(x - u, y - u, w + 2 * u, h + 2 * u, PAL.negro); r(x, y, w, h, PAL.plata);
    r(x + w * .12, y + h * .12, w * .76, h * .36, PAL.tinta); r(x + w * .16, y + h * .15, w * .2, h * .08, '#6fb5d8');
    r(x, y + h * .6, w, h * .1, '#1f63ad'); r(x + w * .08, y + h * .76, w * .16, h * .1, '#fff3b0'); r(x + w * .76, y + h * .76, w * .16, h * .1, '#fff3b0');
    r(x + w * .36, y + h * .76, w * .28, h * .12, PAL.negro);
    r(x + w / 2 - u * .6, y - 3 * u, u * 1.2, 2 * u, PAL.negro); r(x + w * .25, y - 3.2 * u, w * .5, u, PAL.negro);
    r(x - 2 * u, y + h + u, w + 4 * u, u, PAL.rojo);
  }
};
