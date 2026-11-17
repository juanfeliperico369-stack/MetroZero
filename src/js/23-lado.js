/* =====================================================================
   VISTA LATERAL (estilo odisea en capas): el recorrido de perfil con el relieve real,
   montañas en capas con perspectiva atmosférica, cielo por hora, sol/luna, nubes,
   gallinazos, lluvia, niebla y relámpagos. Las luces de los barrios se encienden de noche.
   ===================================================================== */
const Lado = EM.lado = {
  /* perfil de una polilínea: suelo bajo el recorrido + colinas (0,4–1,6 km) + cordillera (1,6–7 km) al lado más alto */
  prof(key, P) {
    this.cache = this.cache || {}; if (this.cache[key]) return this.cache[key];
    const st = 20, n = Math.max(2, Math.ceil(P.len / st) + 1), near = new Float32Array(n), mid = new Float32Array(n), far = new Float32Array(n), tile = new Uint8Array(n), urb = new Uint8Array(n), URB = new Set([TT.BRICK, TT.BLDG, TT.ROAD, TT.AVE, TT.AUTO, TT.WALK, TT.PLAZA, TT.STATION, TT.BRIDGE, TT.CICLO]);
    let up = 0; for (let i = 0; i < n; i += 8) { const p = NET.at(P, i * st), sx = -Math.sin(p.a), sy = Math.cos(p.a); up += MAP.elevM(p.x + sx * 2500, p.y + sy * 2500) - MAP.elevM(p.x - sx * 2500, p.y - sy * 2500); }
    const sd = up >= 0 ? 1 : -1;
    for (let i = 0; i < n; i++) {
      const p = NET.at(P, i * st), sx = -Math.sin(p.a) * sd, sy = Math.cos(p.a) * sd; near[i] = MAP.elevM(p.x, p.y); tile[i] = MAP.tileM(p.x + sx * 30, p.y + sy * 30); urb[i] = URB.has(MAP.tileM(p.x - sx * 14, p.y - sy * 14)) || URB.has(MAP.tileM(p.x + sx * 14, p.y + sy * 14)) ? 1 : 0;
      let m = 0, f = 0; for (const d of [400, 700, 1000, 1300, 1600]) m = Math.max(m, MAP.elevM(p.x + sx * d, p.y + sy * d)); for (const d of [2000, 3000, 4200, 5600, 7000]) f = Math.max(f, MAP.elevM(p.x + sx * d, p.y + sy * d));
      mid[i] = m; far[i] = f;
    }
    // suavizado para siluetas limpias
    const sm = (a, r) => { const o = new Float32Array(a.length); for (let i = 0; i < a.length; i++) { let s = 0, c = 0; for (let j = Math.max(0, i - r); j <= Math.min(a.length - 1, i + r); j++) { s += a[j]; c++; } o[i] = s / c; } return o; };
    const R = { n, st, near: sm(near, 1), mid: sm(mid, 3), far: sm(far, 6), tile, urb, side: sd };
    let lo = 1e9, hi = -1e9; for (let i = 0; i < n; i++) { lo = Math.min(lo, R.far[i], R.mid[i]); hi = Math.max(hi, R.far[i]); } R.lo = lo; R.hi = hi;
    return (this.cache[key] = R);
  },
  sample(arr, R, s) { const f = clamp(s / R.st, 0, R.n - 1.001), i = f | 0, k = f - i; return arr[i] * (1 - k) + arr[i + 1] * k; },
  mix(a, b, f) { return a.map((v, i) => v * (1 - f) + b[i] * f); },
  css(c, a = 1) { return 'rgba(' + c.map(v => Math.round(clamp(v, 0, 1) * 255)).join(',') + ',' + a + ')'; },
  /* o: {R, s, z, k, hour, t, rain, fog, storm, fg(g, X, Y), title} */
  draw(g, W, H, o) {
    const R = o.R, sky = SKY.at(o.hour), ink = [.05, .07, .12], k = o.k, dir = o.dir || 1, cx = dir > 0 ? W * .38 : W * .62, base = H * .64;
    // cielo
    const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, this.css(sky.top)); gr.addColorStop(.7, this.css(sky.bot)); gr.addColorStop(1, this.css(sky.fog)); g.fillStyle = gr; g.fillRect(0, 0, W, H);
    if (sky.night > .3) for (let i = 0; i < 70; i++) { g.fillStyle = 'rgba(255,245,220,' + (sky.night * (.35 + .45 * Math.abs(Math.sin(o.t * .7 + i)))) + ')'; g.fillRect(h2(i, 3, 1) * W, h2(i, 4, 1) * H * .5, 1.6, 1.6); }
    // sol o luna (recorre el cielo según la hora)
    const sh = ((o.hour - 6) / 12), sx = W * (.1 + .8 * clamp(sh, 0, 1)), syy = H * (.62 - .5 * Math.sin(Math.PI * clamp(sh, 0, 1)));
    if (sh > -.05 && sh < 1.05) { g.fillStyle = this.css([1, .93, .78], .95); g.beginPath(); g.arc(sx, syy, Math.min(W, H) * .045, 0, TAU); g.fill(); g.fillStyle = this.css([1, .85, .6], .18); g.beginPath(); g.arc(sx, syy, Math.min(W, H) * .12, 0, TAU); g.fill(); }
    else { const mh = ((o.hour + 6) % 24 - 6) / 12, mx = W * (.1 + .8 * clamp(mh, 0, 1)), my = H * (.6 - .45 * Math.sin(Math.PI * clamp(mh, 0, 1))); g.fillStyle = 'rgba(240,240,225,.9)'; g.beginPath(); g.arc(mx, my, Math.min(W, H) * .03, 0, TAU); g.fill(); g.fillStyle = this.css(sky.top); g.beginPath(); g.arc(mx + Math.min(W, H) * .012, my - 3, Math.min(W, H) * .028, 0, TAU); g.fill(); }
    // nubes que derivan (parallax 0,08)
    if (!o.storm) for (let i = 0; i < 6; i++) { const x = ((h2(i, 1, 9) * W * 2 - o.s * k * .08 - o.t * 6 * (1 + i % 3)) % (W * 1.6) + W * 1.6) % (W * 1.6) - W * .3, y = H * (.08 + h2(i, 2, 9) * .25), r = 30 + h2(i, 3, 9) * 50; g.fillStyle = this.css(this.mix(sky.bot, [1, 1, 1], .5 * sky.day), .35 + .25 * sky.day); for (let q = 0; q < 4; q++) { g.beginPath(); g.ellipse(x + q * r * .55, y + (q % 2) * r * .12, r * .55, r * .28, 0, 0, TAU); g.fill(); } }
    // capas de montañas: cordillera y colinas (escala vertical comprimida), con perspectiva atmosférica
    const span = Math.max(300, R.hi - R.lo), layer = (arr, par, vs, off, col, lights) => {
      g.fillStyle = this.css(col); g.beginPath(); g.moveTo(0, H);
      const pts = []; for (let x = 0; x <= W + 4; x += 4) { const s = o.s + (x - cx) / (k * par) * dir, e = this.sample(arr, R, s), y = base - off - (e - R.lo) / span * vs; pts.push([x, y]); g.lineTo(x, y); }
      g.lineTo(W, H); g.closePath(); g.fill();
      if (lights && sky.night > .2) { for (const [x, y] of pts) { if (x % 8) continue; for (let q = 0; q < 6; q++) { const yy = y + 6 + q * 9; if (yy > base + 40) break; const hv = h2(x + Math.floor(o.s * k * par * dir / 4) * 4, yy | 0, 31); if (hv < .38) { g.fillStyle = 'rgba(255,' + (190 + (hv * 120 | 0)) + ',110,' + (sky.night * (.55 + .4 * Math.sin(o.t * 2 + hv * 40))) + ')'; g.fillRect(x + hv * 6, yy, 2, 2); } } } }
      return pts;
    };
    const cFar = this.mix(this.mix(sky.bot, sky.top, .3), ink, .18 + .25 * sky.night), cMid = this.mix(this.mix(cFar, [.3, .44, .36], .2 * sky.day), ink, .3), cNear = this.mix(this.mix(cMid, [.36, .52, .32], .4 * sky.day), ink, .22 + .3 * sky.night);
    layer(R.far, .18, H * .36, H * .06, cFar, false);
    if (o.fog || sky.day < .6) { const fg = g.createLinearGradient(0, base - H * .3, 0, base); fg.addColorStop(0, this.css(sky.fog, 0)); fg.addColorStop(1, this.css(sky.fog, o.fog ? .7 : .35)); g.fillStyle = fg; g.fillRect(0, base - H * .3, W, H * .3); }
    layer(R.mid, .45, H * .26, -H * .02, cMid, true);
    // gallinazos planeando
    for (let i = 0; i < 4; i++) { const bx = ((h2(i, 7, 1) * W + o.t * (14 + i * 3) - o.s * k * .3) % (W + 80) + W + 80) % (W + 80) - 40, by = H * (.15 + .12 * h2(i, 8, 1)) + Math.sin(o.t * .8 + i) * 8, wv = Math.sin(o.t * 3 + i) * 3; g.strokeStyle = this.css(ink, .7); g.lineWidth = 1.6; g.beginPath(); g.moveTo(bx - 7, by - 2 + wv); g.lineTo(bx, by); g.lineTo(bx + 7, by - 2 + wv); g.stroke(); }
    // suelo cercano (perfil real bajo el recorrido) con casas de ladrillo y árboles
    const Y = e => base - (e - o.z) * k, X = s => cx + (s - o.s) * k * dir;
    g.fillStyle = this.css(cNear); g.beginPath(); g.moveTo(0, H);
    const s0 = Math.min(o.s - cx / k * dir, o.s + (W - cx) / k * dir), s1 = Math.max(o.s - cx / k * dir, o.s + (W - cx) / k * dir);
    for (let x = 0; x <= W + 4; x += 3) { const s = o.s + (x - cx) / k * dir; g.lineTo(x, Y(this.sample(R.near, R, s))); } g.lineTo(W, H); g.closePath(); g.fill();
    const step = Math.max(6, 14 / Math.max(.2, k));
    for (let s = Math.floor(s0 / step) * step; s < s1; s += step) {
      const i = clamp(Math.round(s / R.st), 0, R.n - 1), tv = R.tile[i], e = this.sample(R.near, R, s), x = X(s), y = Y(e), hv = h2(s | 0, 7, 3);
      if (tv === TT.BRICK || tv === TT.BLDG) { const bw = (5 + hv * 6) * k, bh = (tv === TT.BLDG ? 12 + hv * 30 : 5 + hv * 6) * k; g.fillStyle = this.css(this.mix(cNear, tv === TT.BRICK ? [.62, .3, .2] : [.55, .58, .62], .45 * sky.day + .15)); g.fillRect(x - bw / 2, y - bh, bw, bh + 2); if (sky.night > .2 && bh > 4) { g.fillStyle = 'rgba(255,214,120,' + sky.night * .8 + ')'; for (let q = 0; q < 3; q++) if (h2(s | 0, q, 5) < .55) g.fillRect(x - bw / 4 + (q % 2) * bw / 3, y - bh * (.3 + q * .2), Math.max(1.5, bw * .14), Math.max(1.5, bw * .14)); } }
      else if ((tv === TT.GRASS || tv === TT.MOUNT) && hv < .6) { const r = (3 + hv * 4) * k; g.fillStyle = this.css(this.mix(cNear, [.15, .3, .18], .4 * sky.day)); g.beginPath(); g.arc(x, y - r * .9, r, 0, TAU); g.fill(); g.fillRect(x - r * .12, y - r * .3, r * .24, r * .4); }
      else if (tv === TT.WATER && hv < .5) { g.fillStyle = this.css([.6, .8, .9], .35 * sky.day + .1); g.fillRect(x - 6 * k, y - 1, 12 * k, 2); }
    }
    // calle de primer plano bajo el recorrido (en zonas urbanas): asfalto, andén, carros y peatones
    const asph = this.css(this.mix(cNear, [.26, .28, .31], .75)), walk = this.css(this.mix(cNear, [.78, .74, .64], .7)), st0 = Math.floor(s0 / R.st) * R.st;
    for (let s = st0; s < s1; s += R.st) { const i = clamp(Math.round(s / R.st), 0, R.n - 1); if (!R.urb[i]) continue; const x = X(s), x2 = X(s + R.st), y = Y(this.sample(R.near, R, s)); g.fillStyle = asph; g.fillRect(Math.min(x, x2), y + 1.5 * k, Math.abs(x2 - x) + 1, 9 * k); g.fillStyle = walk; g.fillRect(Math.min(x, x2), y, Math.abs(x2 - x) + 1, 1.6 * k); g.fillStyle = 'rgba(255,240,200,.45)'; if (((s / R.st) | 0) % 2 === 0) g.fillRect(Math.min(x, x2) + 2, y + 6 * k, Math.abs(x2 - x) * .5, Math.max(1, .25 * k)); }
    // primer plano urbano: explanada y fachadas cercanas (paralaje 1.25) que enmarcan la escena
    const fgc = this.css(this.mix(cNear, [.2, .21, .24], .7)), fgb = this.mix(cNear, ink, .55);
    for (let x = 0; x <= W + 40; x += 40) { const s = o.s + (x - cx) / (k * 1.25) * dir, idx = clamp(Math.round(s / R.st), 0, R.n - 1); if (!R.urb[idx]) continue; const yTop = Y(this.sample(R.near, R, s)) + 11 * k; g.fillStyle = fgc; g.fillRect(x - 1, yTop, 42, H - yTop); const hv = h2(Math.floor(s / 40), 3, 17), bh = (14 + hv * 22) * k, bw = 36; if (hv < .75) { g.fillStyle = this.css(this.mix(fgb, [.72, .36, .24], hv < .35 ? .4 : 0)); g.fillRect(x + 2, H - bh, bw, bh); g.fillStyle = this.css(this.mix(fgb, [0, 0, 0], .3)); g.fillRect(x + 2, H - bh, bw, 2 * k); if (sky.night > .3) { g.fillStyle = 'rgba(255,214,120,' + (sky.night * .8) + ')'; for (let q = 0; q < 4; q++) if (h2(x, q, 5) < .5) g.fillRect(x + 6 + (q % 2) * 16, H - bh + 6 * k + (q >> 1) * 7 * k, 5, 4); } else { g.fillStyle = 'rgba(20,30,40,.35)'; for (let q = 0; q < 4; q++) g.fillRect(x + 6 + (q % 2) * 16, H - bh + 6 * k + (q >> 1) * 7 * k, 5, 4); } } else if (hv < .9) { g.fillStyle = this.css(this.mix(fgb, [.2, .4, .22], .5)); g.beginPath(); g.arc(x + 20, H - 8 * k, 9 * k, 0, TAU); g.fill(); } }
    const carS = (g, x, y, L, c, dir, lit) => { g.fillStyle = '#141414'; g.fillRect(x - L / 2 - 1, y - L * .42 - 1, L + 2, L * .42 + 1); g.fillStyle = c; g.fillRect(x - L / 2, y - L * .4, L, L * .4); g.fillStyle = Art.shade(c, 1.15); g.fillRect(x - L * .3, y - L * .62, L * .55, L * .24); g.fillStyle = lit ? '#ffe7a0' : '#8fc4dc'; g.fillRect(x - L * .26 + (dir > 0 ? L * .3 : 0), y - L * .58, L * .22, L * .16); g.fillStyle = '#141414'; g.beginPath(); g.arc(x - L * .3, y, L * .12, 0, TAU); g.arc(x + L * .3, y, L * .12, 0, TAU); g.fill(); if (lit) { g.fillStyle = '#fff6c0'; g.fillRect(dir > 0 ? x + L / 2 - 2 : x - L / 2, y - L * .2, 2, 2); } };
    for (const lane of [1, -1]) for (let i = 0; i < 14; i++) { const spd = 9 + (i % 3) * 2, pos = ((o.t * spd + i * 97 + (lane > 0 ? 0 : 48)) % (R.n * R.st + 300)) - 150, s = lane > 0 ? pos : R.n * R.st - pos; if (s < s0 - 10 || s > s1 + 10) continue; const idx = clamp(Math.round(s / R.st), 0, R.n - 1); if (!R.urb[idx]) continue; carS(g, X(s), Y(this.sample(R.near, R, s)) + (lane > 0 ? 5 * k : 8.6 * k), (i % 4 === 0 ? 7 : 4.4) * k, i % 5 === 0 ? '#f2c400' : ['#c43a26', '#2a5a92', '#e9eef3', '#1d1f24', '#9aa7b8', '#3d6b3a', '#d98a3a'][i % 7], lane * (dir || 1), sky.night > .4); }
    for (let i = 0; i < 10; i++) { const pos = ((o.t * 1.3 + i * 61) % (R.n * R.st + 100)) - 50, s = i % 2 ? pos : R.n * R.st - pos; if (s < s0 || s > s1) continue; const idx = clamp(Math.round(s / R.st), 0, R.n - 1); if (!R.urb[idx]) continue; Art.person(g, X(s), Y(this.sample(R.near, R, s)) + .2 * k, Math.max(1, k * .3), i * 13, true); }
    if (o.fg) o.fg(g, X, Y, cNear, sky);
    // título de estación (tipografía grande y translúcida)
    if (o.title) { g.save(); g.globalAlpha = o.title.a; g.fillStyle = sky.night > .5 ? '#f9e4a4' : PAL.negro; g.font = '700 ' + Math.round(Math.min(W, H) * .1) + 'px Titulos, sans-serif'; g.textAlign = 'center'; g.fillText(o.title.t.toUpperCase(), W / 2, H * .2); g.font = '800 ' + Math.round(Math.min(W, H) * .028) + 'px Cuerpo, sans-serif'; g.fillText(o.title.sub || '', W / 2, H * .2 + Math.min(W, H) * .05); g.restore(); }
    // clima
    if (o.rain) { g.strokeStyle = 'rgba(220,235,245,.4)'; g.lineWidth = 1; g.beginPath(); for (let i = 0; i < 110; i++) { const x = (h2(i, 3, 3) * W + o.t * 90) % W, y = (h2(i, 4, 3) * H + o.t * 700 * (1 + h2(i, 5, 3))) % H; g.moveTo(x, y); g.lineTo(x - 4, y + 13); } g.stroke(); }
    if (o.storm && (o.t % 7) < .12) { g.fillStyle = 'rgba(255,255,255,.55)'; g.fillRect(0, 0, W, H); }
    return { X, Y };
  }
};
