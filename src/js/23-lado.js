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
    const R = { id: key, n, st, near: sm(near, 1), mid: sm(mid, 3), far: sm(far, 6), tile, urb, side: sd };
    // capa intermedia (cerros entre la cordillera y las laderas) para el escalonado de siluetas
    const inter = new Float32Array(n); for (let i = 0; i < n; i++) inter[i] = R.far[i] * .6 + R.mid[i] * .4 + Math.sin(i * .045) * 40 + Math.sin(i * .013 + 1) * 60; R.inter = sm(inter, 4);
    let lo = 1e9, hi = -1e9; for (let i = 0; i < n; i++) { lo = Math.min(lo, R.far[i], R.mid[i]); hi = Math.max(hi, R.far[i]); } R.lo = lo; R.hi = hi;
    return (this.cache[key] = R);
  },
  sample(arr, R, s) { const f = clamp(s / R.st, 0, R.n - 1.001), i = f | 0, k = f - i; return arr[i] * (1 - k) + arr[i + 1] * k; },
  mix(a, b, f) { return a.map((v, i) => v * (1 - f) + b[i] * f); },
  css(c, a = 1) { return 'rgba(' + c.map(v => Math.round(clamp(v, 0, 1) * 255)).join(',') + ',' + a + ')'; },
  /* laderas con barrios: casas de ladrillo que trepan desde el valle, monte arriba y luces de noche.
     Se pinta en una tira en caché (espacio de la capa) y se vuelve a pintar solo al salir del margen o cambiar la luz. */
  barrio(g, W, H, o, R, arr, par, yAt, col, sky, base, cx, k, dir, id) {
    const far = id === 'far' || id === 'inter', hw = Math.max(far ? 2 : 4, Math.round(k * (far ? 1.2 : 2.6))), rh = Math.max(2, Math.round(hw * .72)), U0 = o.s * k * par, umin = dir > 0 ? U0 - cx : U0 + cx - W;
    const yTop = Math.floor(base - H * (far ? .44 : .26)), yBot = Math.ceil(base + H * .05), bh = yBot - yTop, nq = Math.round(sky.night * 5), dq = Math.round(sky.day * 5);
    const key = [R.id, W, H, par, k.toFixed(3), nq, dq, R.n, R.st, col.map(v => (v * 40) | 0).join('.')].join(':'), C = (this._bc = this._bc || {})[id];
    let c = C && C.key === key && umin >= C.u0 && umin + W <= C.u0 + C.w ? C : null;
    if (!c) {
      const w = Math.ceil(W * 2), u0 = Math.floor(umin - W * .5), cv = (C && C.cv && C.cv.width === w && C.cv.height === bh) ? C.cv : mkCanvas(w, bh), q = cv.getContext('2d'); q.clearRect(0, 0, w, bh);
      // ruido de valor suave: manchas de barrio y quebradas verdes con bordes orgánicos
      const vn = (x, y, sd) => { const xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi, sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy), a = h2(xi, yi, sd), b2 = h2(xi + 1, yi, sd), c2 = h2(xi, yi + 1, sd), d = h2(xi + 1, yi + 1, sd); return (a * (1 - sx) + b2 * sx) * (1 - sy) + (c2 * (1 - sx) + d * sx) * sy; };
      const BR = [[.7, .34, .22], [.76, .42, .27], [.62, .3, .2], [.8, .52, .34], [.7, .34, .22], [.74, .38, .25], [.93, .9, .83], [.86, .8, .62], [.55, .7, .78], [.9, .7, .72], [.62, .78, .55]];
      const RF = [[.52, .26, .2], [.5, .5, .52], [.62, .6, .58], [.4, .22, .16]];
      const tint = far ? .66 : .3, night = sky.night, gdk = this.mix(this.mix(col, [.1, .26, .12], .5 * sky.day + .1), [0, 0, 0], night * .45), glt = this.mix(gdk, [.5, .66, .36], .25 * sky.day);
      for (let cc = Math.floor(u0 / hw) - 1; cc * hw < u0 + w + hw; cc++) {
        const u = cc * hw, s = (u + hw / 2) / (k * par), yr = yAt(s), x = u - u0;
        for (let r = 0, yy = yBot - rh; yy > yr + rh * .4; r++, yy -= rh) {
          const f = (yBot - yy) / Math.max(8, yBot - yr), hv = h2(cc, r, far ? 63 : 43), xo = ((r * 5) % 3) * hw / 3 - hw / 3, yo = (h2(cc, r, 47) - .5) * rh * .4;
          const n = vn(cc / (far ? 16 : 10), r / (far ? 9 : 6), far ? 71 : 73), hf = f < .3 ? 1 : f < .62 ? 1 - (f - .3) / .32 : 0, p = clamp((n - .32) * 2.6, 0, 1) * hf * (far ? .55 : .92);
          const X0 = x + xo, Y0 = yy - yTop + yo;
          if (hv < p) {
            const hc = BR[(hv * 997 | 0) % BR.length], cb = this.mix(this.mix(hc, col, tint), [0, 0, 0], night * .6), tall = h2(cc, r, 44) < .22 ? 1 + (h2(cc, r, 48) * 2 | 0) : 0, hh = rh * (1 + tall * .7);
            if (far) { if (night > .25) { q.fillStyle = this.css(cb); q.fillRect(X0, Y0 - (hh - rh), hw - 1, hh); } }
            else {
              q.fillStyle = this.css(cb); q.fillRect(X0, Y0 - (hh - rh), hw - 1.5, hh);
              q.fillStyle = this.css(this.mix(this.mix(RF[(hv * 31 | 0) % RF.length], col, tint), [0, 0, 0], night * .6)); q.fillRect(X0 - .5, Y0 - (hh - rh) - rh * .18, hw - .5, rh * .36);
              if (night < .3) { q.fillStyle = this.css(this.mix(cb, [0, 0, 0], .45)); q.fillRect(X0 + hw * .3, Y0 - (hh - rh) + rh * .45, Math.max(1, hw * .22), Math.max(1, rh * .3)); }
            }
            if (night > .15 && h2(cc, r, 45) < .55) { const lv = h2(cc, r, 46); q.fillStyle = 'rgba(255,' + (190 + (lv * 60 | 0)) + ',' + (100 + (lv * 60 | 0)) + ',' + Math.min(1, night * 1.15) + ')'; const d = Math.max(1, hw * (far ? .5 : .3)); q.fillRect(X0 + hw * .3, Y0 - (hh - rh) + rh * .35, d, d); if (tall && h2(cc, r, 49) < .6) q.fillRect(X0 + hw * .3, Y0 - (hh - rh) + rh * 1.05, d, d); }
          } else if (!far && f > .12 && hv < p + .55 * Math.min(1, f * 2)) { const rr = hw * (.5 + h2(cc, r, 50) * .35); q.fillStyle = this.css(gdk); q.beginPath(); q.arc(X0 + hw / 2, Y0 + rh * .5, rr, 0, TAU); q.fill(); if (sky.day > .3) { q.fillStyle = this.css(glt); q.beginPath(); q.arc(X0 + hw / 2 - rr * .25, Y0 + rh * .5 - rr * .3, rr * .45, 0, TAU); q.fill(); } }
        }
      }
      c = this._bc[id] = { key, u0, w, cv };
    }
    g.save(); if (dir > 0) g.drawImage(c.cv, cx - (U0 - c.u0), yTop); else { g.translate(cx + U0 - c.u0, yTop); g.scale(-1, 1); g.drawImage(c.cv, 0, 0); } g.restore();
  },
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
    const span = Math.max(300, R.hi - R.lo), layer = (arr, par, vs, off, col, opt = {}) => {
      const yAt = s => base - off - (this.sample(arr, R, s) - R.lo) / span * vs, pts = []; let top = H;
      for (let x = 0; x <= W + 4; x += 4) { const y = yAt(o.s + (x - cx) / (k * par) * dir); pts.push([x, y]); if (y < top) top = y; }
      // relleno con bruma hacia el valle (perspectiva atmosférica) y filo iluminado por el cielo
      const gf = g.createLinearGradient(0, top, 0, base + 30); gf.addColorStop(0, this.css(col)); gf.addColorStop(1, this.css(this.mix(col, sky.fog, opt.haze || .3)));
      g.fillStyle = gf; g.beginPath(); g.moveTo(0, H); for (const [x, y] of pts) g.lineTo(x, y); g.lineTo(W, H); g.closePath(); g.fill();
      g.strokeStyle = this.css(this.mix(col, [1, .96, .88], .16 * sky.day + .05), .85); g.lineWidth = Math.max(1, k * .45); g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y + .5) : g.moveTo(x, y + .5)); g.stroke();
      if (opt.barrio) this.barrio(g, W, H, o, R, arr, par, yAt, col, sky, base, cx, k, dir, opt.barrio);
      return pts;
    };
    // paleta por capas: de día cordillera azul de bruma, laderas verdes saturadas y suelo verde oscuro (estilo ilustración);
    // de noche se apagan hacia la tinta; al atardecer la luz cálida del cielo tiñe la bruma
    const D = sky.day, warm = clamp((sky.bot[0] - sky.bot[2]) * 2.2, 0, 1) * (1 - sky.night);
    const oFar = this.mix(this.mix(this.mix(sky.bot, sky.top, .45), [.3, .42, .5], .25 * D), ink, .26 + .22 * sky.night), oMid = this.mix(this.mix(oFar, [.2, .4, .24], .55 * D), ink, .3), oNear = this.mix(this.mix(oMid, [.36, .52, .32], .4 * D), ink, .22 + .3 * sky.night);
    const dFar = this.mix(this.mix(sky.top, [.5, .62, .76], .5), sky.bot, .18), dMid = this.mix([.25, .5, .3], dFar, .2), dNear = [.21, .4, .23], dd = clamp((D - .55) / .35, 0, 1) * (1 - warm * .8);
    let cFar = this.mix(oFar, dFar, dd), cMid = this.mix(oMid, dMid, dd), cNear = this.mix(oNear, dNear, dd);
    if (o.rain) { cFar = this.mix(cFar, sky.fog, .3); cMid = this.mix(cMid, [.4, .45, .45], .15); }
    layer(R.far, .18, H * .36, H * .06, cFar, { haze: .45, barrio: o.barrio === false ? 0 : 'far' });
    if (R.inter) layer(R.inter, .3, H * .3, H * .025, this.mix(cFar, cMid, .42), { haze: .38, barrio: o.barrio === false ? 0 : 'inter' });
    if (o.fog || sky.day < .6) { const fg = g.createLinearGradient(0, base - H * .3, 0, base); fg.addColorStop(0, this.css(sky.fog, 0)); fg.addColorStop(1, this.css(sky.fog, o.fog ? .7 : .35)); g.fillStyle = fg; g.fillRect(0, base - H * .3, W, H * .3); }
    layer(R.mid, .45, H * .26, -H * .02, cMid, { haze: .22, barrio: o.barrio === false ? 0 : 'mid' });
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
    { const fp = 1.25, fw = Math.max(24, Math.round(16 * k)), Uf = o.s * k * fp, um = dir > 0 ? Uf - cx : Uf + cx - W, tall = H > W * 1.2 ? (H - base) * .5 : 0;
      for (let cc = Math.floor(um / fw) - 1; cc * fw < um + W + fw; cc++) {
        const u = cc * fw, s = (u + fw / 2) / (k * fp), idx = clamp(Math.round(s / R.st), 0, R.n - 1);
        if (!R.urb[idx]) { // monte en primer plano: arbustos y árboles oscuros que dan profundidad sin tapar el tren
          const xa = cx + (u - Uf) * dir, x = (dir > 0 ? xa : xa - fw) + fw / 2, yg = Y(this.sample(R.near, R, s)) + 13 * k + tall * .25, hv = h2(cc, 9, 23), gc = this.mix(this.mix(cNear, [.12, .3, .14], .5 * sky.day), ink, .35 + .3 * sky.night);
          g.fillStyle = this.css(gc); g.fillRect(x - fw / 2 - 1, yg, fw + 2, H - yg);
          if (hv < .7) { const r = (4 + hv * 6) * k; g.fillStyle = this.css(this.mix(gc, [0, 0, 0], .2)); g.fillRect(x - .6 * k, yg - r, 1.2 * k, r); for (let q = 0; q < 3; q++) { g.beginPath(); g.arc(x + (q - 1) * r * .55, yg - r * (1.05 + (q % 2) * .3), r * (.62 + .1 * q), 0, TAU); g.fill(); } if (sky.day > .3) { g.fillStyle = this.css(this.mix(gc, [.45, .62, .3], .22 * sky.day)); g.beginPath(); g.arc(x - r * .3, yg - r * 1.45, r * .35, 0, TAU); g.fill(); } }
          continue; }
        const xa = cx + (u - Uf) * dir, x = dir > 0 ? xa : xa - fw, yTop = Y(this.sample(R.near, R, s)) + 11 * k; g.fillStyle = fgc; g.fillRect(x - 1, yTop, fw + 2, H - yTop);
        g.fillStyle = this.css(this.mix(cNear, [.62, .6, .55], .45)); g.fillRect(x - 1, yTop, fw + 2, 2.2 * k);
        const hv = h2(cc, 3, 17), bh = (14 + hv * 22) * k + tall * (.6 + .4 * h2(cc, 4, 17)), bw = fw - 4, top = H - bh;
        if (hv < .75) {
          const brick = hv < .35, fc = this.mix(fgb, brick ? [.72, .36, .24] : [.8, .78, .7], brick ? .4 : .18); g.fillStyle = this.css(fc); g.fillRect(x + 2, top, bw, bh);
          g.fillStyle = this.css(this.mix(fgb, [0, 0, 0], .3)); g.fillRect(x + 1, top, bw + 2, 2 * k);
          if (h2(cc, 5, 17) < .5) { g.fillStyle = this.css(this.mix(fgb, [.6, .66, .72], .3)); g.fillRect(x + bw * .2, top - 3.5 * k, bw * .22, 3.5 * k); }
          const ww = Math.max(3, bw * .16), wh = Math.max(3, 3.2 * k), rows = Math.min(14, Math.floor((bh - 8 * k) / (7 * k)));
          for (let rr = 0; rr < rows; rr++) for (let q = 0; q < 3; q++) { const lit = sky.night > .3 && h2(cc * 7 + q, rr, 5) < .45; g.fillStyle = lit ? 'rgba(255,214,120,' + (sky.night * .85) + ')' : 'rgba(20,30,40,.38)'; g.fillRect(x + 2 + bw * (.14 + q * .3), top + 5 * k + rr * 7 * k, ww, wh); }
          if (h2(cc, 6, 17) < .6) { const aw = ['#c43a26', '#1C5C9C', '#59AB42', '#E38835', '#743D90'][(hv * 50 | 0) % 5]; g.fillStyle = aw; g.globalAlpha = .55 + .35 * sky.day; g.fillRect(x + 2, H - 9 * k, bw, 1.6 * k); g.globalAlpha = 1; }
        } else if (hv < .9) { g.fillStyle = this.css(this.mix(fgb, [.2, .4, .22], .5)); g.beginPath(); g.arc(x + fw / 2, H - 8 * k - tall * .3, 9 * k, 0, TAU); g.fill(); g.fillRect(x + fw / 2 - k, H - 8 * k - tall * .3, 2 * k, 8 * k + tall * .3); }
      } }
    const carS = (g, x, y, L, c, dir, lit) => { g.fillStyle = '#141414'; g.fillRect(x - L / 2 - 1, y - L * .42 - 1, L + 2, L * .42 + 1); g.fillStyle = c; g.fillRect(x - L / 2, y - L * .4, L, L * .4); g.fillStyle = Art.shade(c, 1.15); g.fillRect(x - L * .3, y - L * .62, L * .55, L * .24); g.fillStyle = lit ? '#ffe7a0' : '#8fc4dc'; g.fillRect(x - L * .26 + (dir > 0 ? L * .3 : 0), y - L * .58, L * .22, L * .16); g.fillStyle = '#141414'; g.beginPath(); g.arc(x - L * .3, y, L * .12, 0, TAU); g.arc(x + L * .3, y, L * .12, 0, TAU); g.fill(); if (lit) { g.fillStyle = '#fff6c0'; g.fillRect(dir > 0 ? x + L / 2 - 2 : x - L / 2, y - L * .2, 2, 2); } };
    const microS = (g, x, y, k, kind, c, dir) => {
      g.save(); g.translate(x, y); if (dir < 0) g.scale(-1, 1);
      g.fillStyle = '#141414';
      if (kind === 'bici') { g.beginPath(); g.arc(-.6 * k, -.3 * k, .32 * k, 0, TAU); g.arc(.6 * k, -.3 * k, .32 * k, 0, TAU); g.fill(); g.strokeStyle = c || '#9bd341'; g.lineWidth = Math.max(1, .16 * k); g.beginPath(); g.moveTo(-.6 * k, -.3 * k); g.lineTo(0, -.75 * k); g.lineTo(.55 * k, -.3 * k); g.moveTo(0, -.75 * k); g.lineTo(-.25 * k, -.95 * k); g.moveTo(.45 * k, -.75 * k); g.lineTo(.58 * k, -1.05 * k); g.stroke(); }
      else if (kind === 'scooter' || kind === 'monopatin') { g.beginPath(); g.arc(-.48 * k, -.18 * k, .18 * k, 0, TAU); g.arc(.48 * k, -.18 * k, .18 * k, 0, TAU); g.fill(); g.fillStyle = c || '#29b6f6'; g.fillRect(-.48 * k, -.26 * k, .96 * k, .12 * k); g.fillStyle = '#1f242c'; g.fillRect(.38 * k, -1.1 * k, .1 * k, .88 * k); }
      else if (kind === 'skate') { g.beginPath(); g.arc(-.32 * k, -.12 * k, .12 * k, 0, TAU); g.arc(.32 * k, -.12 * k, .12 * k, 0, TAU); g.fill(); g.fillStyle = c || '#ff7043'; g.fillRect(-.46 * k, -.24 * k, .92 * k, .1 * k); }
      else { g.beginPath(); g.arc(-.18 * k, -.1 * k, .1 * k, 0, TAU); g.arc(.18 * k, -.1 * k, .1 * k, 0, TAU); g.fill(); g.fillStyle = c || '#ec407a'; g.fillRect(-.24 * k, -.38 * k, .48 * k, .24 * k); }
      g.restore();
    };
    this.vehS = microS;
    for (const lane of [1, -1]) for (let i = 0; i < 14; i++) { const spd = 9 + (i % 3) * 2, pos = ((o.t * spd + i * 97 + (lane > 0 ? 0 : 48)) % (R.n * R.st + 300)) - 150, s = lane > 0 ? pos : R.n * R.st - pos; if (s < s0 - 10 || s > s1 + 10) continue; const idx = clamp(Math.round(s / R.st), 0, R.n - 1); if (!R.urb[idx]) continue; carS(g, X(s), Y(this.sample(R.near, R, s)) + (lane > 0 ? 5 * k : 8.6 * k), (i % 4 === 0 ? 7 : 4.4) * k, i % 5 === 0 ? '#f2c400' : ['#c43a26', '#2a5a92', '#e9eef3', '#1d1f24', '#9aa7b8', '#3d6b3a', '#d98a3a'][i % 7], lane * (dir || 1), sky.night > .4); }
    for (let i = 0; i < 6; i++) { const mk = ['bici', 'scooter', 'monopatin', 'skate', 'patines'][i % 5], mc = ['#9bd341', '#29b6f6', '#66bb6a', '#ff7043', '#ec407a'][i % 5], pos = ((o.t * 4.5 + i * 113) % (R.n * R.st + 160)) - 80, s = i % 2 ? pos : R.n * R.st - pos; if (s < s0 || s > s1) continue; const idx = clamp(Math.round(s / R.st), 0, R.n - 1); if (!R.urb[idx]) continue; microS(g, X(s), Y(this.sample(R.near, R, s)) + 2.2 * k, Math.max(1.2, k * .85), mk, mc, (i % 2 ? 1 : -1) * (dir || 1)); }
    for (let i = 0; i < 10; i++) { const pos = ((o.t * 1.3 + i * 61) % (R.n * R.st + 100)) - 50, s = i % 2 ? pos : R.n * R.st - pos; if (s < s0 || s > s1) continue; const idx = clamp(Math.round(s / R.st), 0, R.n - 1); if (!R.urb[idx]) continue; Art.person(g, X(s), Y(this.sample(R.near, R, s)) + .2 * k, Math.max(1, k * .3), i * 13, true); }
    if (o.fg) o.fg(g, X, Y, cNear, sky);
    // título de estación (tipografía grande y translúcida)
    if (o.title) { g.save(); g.globalAlpha = o.title.a; g.fillStyle = sky.night > .5 ? '#f9e4a4' : PAL.negro; g.font = '700 ' + Math.round(Math.min(W, H) * .1) + 'px Titulos, sans-serif'; g.textAlign = 'center'; const ty = H * (W > H * 1.2 ? .36 : .2); g.fillText(o.title.t.toUpperCase(), W / 2, ty); g.font = '800 ' + Math.round(Math.min(W, H) * .028) + 'px Cuerpo, sans-serif'; g.fillText(o.title.sub || '', W / 2, ty + Math.min(W, H) * .05); g.restore(); }
    // clima
    if (o.rain) { g.strokeStyle = 'rgba(220,235,245,.4)'; g.lineWidth = 1; g.beginPath(); for (let i = 0; i < 110; i++) { const x = (h2(i, 3, 3) * W + o.t * 90) % W, y = (h2(i, 4, 3) * H + o.t * 700 * (1 + h2(i, 5, 3))) % H; g.moveTo(x, y); g.lineTo(x - 4, y + 13); } g.stroke(); }
    if (o.storm && (o.t % 7) < .12) { g.fillStyle = 'rgba(255,255,255,.55)'; g.fillRect(0, 0, W, H); }
    return { X, Y };
  }
};
