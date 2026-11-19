/* =====================================================================
   PUENTES Y NIVELES (1.3.0): el mundo tiene altura.
   · Los puentes reales del valle (src/data/puentes.js, de OpenStreetMap): tablero elevado con rampa en cada extremo,
     pilas, canto, barandas, sombra y su calle encima. Lo que va por debajo (el río, otra calle, el jugador) pasa abajo.
   · Física por nivel: al puente se sube por sus extremos, donde el tablero está bajo; por la mitad se pasa por debajo,
     entre las pilas. Encima, la baranda no deja caer y lo de abajo no estorba.
   · El viaducto del metro también: columnas sólidas cada 30 m y el edificio de acceso de cada estación es sólido.
   · Lo que va abajo se dibuja antes que lo que va arriba (ver Libre.draw): el jugador pasa por debajo del viaducto.
   ===================================================================== */
Object.assign(VC, {
  PU: null, PG: null,
  /* deprimidos y soterrados principales del valle (nivel z = -1, is_tunnel = true): rampas de entrada/salida y tramo cubierto */
  DEPRIMIDOS: [
    [0, -1, 14, 4.6, 14880, 23210, 14922, 23290, 14965, 23370],   // Deprimido de la Av. Oriental con La Playa
    [0, -1, 15, 4.8, 13915, 23685, 14030, 23680, 14145, 23675],   // Deprimido de San Juan (La Alpujarra / Ferrocarril)
    [0, -1, 18, 5.0, 13580, 23760, 13588, 23970, 13595, 24180],   // Soterrado de Parques del Río
    [0, -1, 14, 4.5, 11990, 24190, 12080, 24192, 12170, 24195],   // Deprimido de Bulerías (Av. 33)
    [0, -1, 14, 4.5, 14170, 20030, 14215, 20112, 14260, 20195]    // Deprimido de Terminal del Norte / Caribe
  ],
  puentesInit() {
    if (typeof PUENTES === 'undefined') return; const out = [], G = this.PG = new Map(), C = 160;
    for (const r of PUENTES.B.concat(this.DEPRIMIDOS)) {
      const pe = r[0], z = r[1], w = r[2], h = r[3], n = (r.length - 4) / 2, is_tunnel = z < 0; if (n < 2) continue;
      const P = new Float32Array(n * 2), cum = new Float32Array(n); let L = 0, x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
      for (let i = 0; i < n; i++) { const x = r[4 + 2 * i], y = r[5 + 2 * i]; P[2 * i] = x; P[2 * i + 1] = y; if (i) L += Math.hypot(x - P[2 * i - 2], y - P[2 * i - 1]); cum[i] = L; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
      const B = { pe, z, w, h, is_tunnel, P, cum, len: L, ramp: Math.min(L * .4, is_tunnel ? 26 : pe ? 9 : 22), x0: x0 - w, y0: y0 - w, x1: x1 + w, y1: y1 + w, i: out.length };
      // pilas cada ~24 m entre las rampas: a los lados del tablero (en los peatonales, al centro; los deprimidos llevan muros, sin pilas)
      const pil = []; if (!is_tunnel) for (let s = B.ramp + 3; s < L - B.ramp - 2; s += 24) { const q = this.puAt(B, s); if (pe) pil.push(q.x, q.y); else { const o = Math.max(.5, w / 2 - 1.3); pil.push(q.x - q.uy * o, q.y + q.ux * o, q.x + q.uy * o, q.y - q.ux * o); } }
      B.pil = Float32Array.from(pil); out.push(B);
      for (let gy = Math.floor(B.y0 / C); gy <= Math.floor(B.y1 / C); gy++) for (let gx = Math.floor(B.x0 / C); gx <= Math.floor(B.x1 / C); gx++) { const k = gx * 4096 + gy; let a = G.get(k); if (!a) G.set(k, a = []); a.push(B); }
    }
    this.PU = out;
    // tramos de las calles del juego que van sobre un puente: abajo no se dibujan ni cuentan como calle
    for (const [vi, seg, ta, tb, bi] of PUENTES.S) { const c = this.ch[vi]; if (c) (c.pz || (c.pz = new Map())).set(seg, [ta, tb, bi]); }
  },
  /* punto y dirección del puente a s metros de su comienzo */
  puAt(B, s) {
    const P = B.P, cum = B.cum, n = cum.length; s = clamp(s, 0, B.len); let i = 1; while (i < n - 1 && cum[i] < s) i++;
    const ax = P[2 * i - 2], ay = P[2 * i - 1], bx = P[2 * i], by = P[2 * i + 1], L = Math.hypot(bx - ax, by - ay) || 1, t = clamp((s - cum[i - 1]) / L, 0, 1);
    return { x: ax + (bx - ax) * t, y: ay + (by - ay) * t, ux: (bx - ax) / L, uy: (by - ay) / L };
  },
  /* alto (o profundidad si B.is_tunnel) del tablero a s metros del comienzo: rampa suave en cada extremo */
  puAlto(B, s) { const e = Math.min(s, B.len - s), t = clamp(e / (B.ramp || 1), 0, 1); return B.h * t * t * (3 - 2 * t); },
  puProy(B, x, y) {
    const P = B.P, n = P.length / 2; let bd = 1e18, bs = 0;
    for (let i = 1; i < n; i++) { const ax = P[2 * i - 2], ay = P[2 * i - 1], dx = P[2 * i] - ax, dy = P[2 * i + 1] - ay, L2 = dx * dx + dy * dy || 1, t = clamp(((x - ax) * dx + (y - ay) * dy) / L2, 0, 1), qx = ax + dx * t - x, qy = ay + dy * t - y, d = qx * qx + qy * qy; if (d < bd) { bd = d; bs = B.cum[i - 1] + t * Math.sqrt(L2); } }
    return { s: bs, d: Math.sqrt(bd) };
  },
  puentesEn(x0, y0, x1, y1) { if (!this.PG) return []; const out = new Set(), C = 160; for (let gy = Math.floor(y0 / C); gy <= Math.floor(y1 / C); gy++) for (let gx = Math.floor(x0 / C); gx <= Math.floor(x1 / C); gx++) for (const B of this.PG.get(gx * 4096 + gy) || []) if (B.x1 > x0 && B.x0 < x1 && B.y1 > y0 && B.y0 < y1) out.add(B); return [...out]; },
  /* el tablero o deprimido que pasa por (x, y), del nivel z si se pide (si no, el más alto o la rampa activa), con su alto ahí */
  puenteEn(x, y, z, m = 0) {
    if (!this.PG) return null; let best = null;
    for (const B of this.PG.get(Math.floor(x / 160) * 4096 + Math.floor(y / 160)) || []) {
      if (x < B.x0 || x > B.x1 || y < B.y0 || y > B.y1 || (z != null && B.z !== z)) continue; const pr = this.puProy(B, x, y); if (pr.d > B.w / 2 + m) continue;
      const h = this.puAlto(B, pr.s); if (!best || Math.abs(B.z) > Math.abs(best.B.z) || (B.z === best.B.z && h > best.h)) best = { B, s: pr.s, d: pr.d, h };
    }
    return best;
  },
  /* partes de una calle que van por el piso (sin los tramos sobre un puente) */
  partes(c) {
    if (!c.pz) return [c.P]; if (c.sub) return c.sub; const P = c.P, out = []; let cur = [P[0], P[1]];
    for (let i = 2; i < P.length; i += 2) { const q = c.pz.get(i / 2), ax = P[i - 2], ay = P[i - 1], bx = P[i], by = P[i + 1];
      if (!q) { cur.push(bx, by); continue; } const [ta, tb] = q;
      if (ta > 0) cur.push(ax + (bx - ax) * ta, ay + (by - ay) * ta); if (cur.length >= 4) out.push(Float32Array.from(cur));
      cur = tb < 1 ? [ax + (bx - ax) * tb, ay + (by - ay) * tb, bx, by] : [bx, by]; }
    if (cur.length >= 4) out.push(Float32Array.from(cur));
    return (c.sub = out);
  },
  /* ---------- lo sólido a ras de piso: pilas de puente, columnas del viaducto y edificios de acceso del metro ---------- */
  metroBase() {
    if (this.MB || typeof NET === 'undefined' || !NET.lines || !NET.lines.length) return this.MB; const G = new Map(), C = 160, put = (o, x, y, r) => { for (let gy = Math.floor((y - r) / C); gy <= Math.floor((y + r) / C); gy++) for (let gx = Math.floor((x - r) / C); gx <= Math.floor((x + r) / C); gx++) { const k = gx * 4096 + gy; let a = G.get(k); if (!a) G.set(k, a = []); a.push(o); } };
    for (const l of NET.lines) { if (l.kind !== 'metro') continue;
      // columnas: las mismas que se dibujan (cada 30 m), salvo las que caerían sobre una calle
      for (let t = 0; t <= l.P.len; t += 30) { const q = NET.at(l.P, t); if (this.enSegs(this.segsCerca(q.x, q.y, 1), q.x, q.y)) continue; put({ c: 1, x: q.x, y: q.y }, q.x, q.y, 2); }
      // edificio de acceso de cada estación (bajo el viaducto): las mismas piezas que se dibujan, sin las que caen en la calle
      for (const st of l.st) for (const H of this.hallPiezas(l, st)) { const n = Math.max(2, Math.ceil((H.b - H.a) / 8)), Q = [];
        for (let i = 0; i <= n; i++) { const q = NET.at(l.P, H.a + (H.b - H.a) * i / n, H.o0); Q.push(q.x, q.y); } for (let i = n; i >= 0; i--) { const q = NET.at(l.P, H.a + (H.b - H.a) * i / n, H.o1); Q.push(q.x, q.y); }
        const P = Float32Array.from(Q); let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (let i = 0; i < P.length; i += 2) { x0 = Math.min(x0, P[i]); x1 = Math.max(x1, P[i]); y0 = Math.min(y0, P[i + 1]); y1 = Math.max(y1, P[i + 1]); }
        const o = { c: 0, P, x0, y0, x1, y1 }; put(o, (x0 + x1) / 2, (y0 + y1) / 2, Math.max(x1 - x0, y1 - y0) / 2 + 2); } }
    return (this.MB = G);
  },
  /* piezas del edificio de acceso de una estación del metro, a ras de piso: el rectángulo bajo el andén (22 m de ancho)
     partido en franjas de 3 m y en tres fajas (los dos lados y el centro); lo que cae en una calle, un andén peatonal
     o el carril del Metroplús se quita, porque la calle sigue por debajo de la estación (así es en el Centro, sobre
     Bolívar, o en Floresta). Quedan los bloques de las escaleras a los lados. { a, b: tramo de la línea; o0, o1: fajas } */
  hallPiezas(l, st) {
    const pl = KIND.metro.plat, s0 = clamp(st.s - pl / 2, 0, Math.max(0, l.P.len - pl)), a0 = s0 + 22, a1 = s0 + pl - 22;
    if (a1 <= a0) return []; if (!this.on || !this.cg) return [{ a: a0, b: a1, o0: -11, o1: 11 }]; if (st._hp) return st._hp;
    const Z = [[-11, -4], [-4, 4], [4, 11]], n = Math.max(1, Math.round((a1 - a0) / 3)), d = (a1 - a0) / n, M = [], out = [];
    const calle = (t, o) => { const q = NET.at(l.P, t, o); return this.enSegs(this.segsCerca(q.x, q.y, 1), q.x, q.y); };
    for (let i = 0; i < n; i++) { const t = a0 + (i + .5) * d; let m = 0; for (let z = 0; z < 3; z++) { const [o0, o1] = Z[z]; if (!calle(t, o0 + (o1 - o0) * .25) && !calle(t, o0 + (o1 - o0) * .75)) m |= 1 << z; } M.push(m); }
    for (let z = 0; z < 3; z++) for (let i = 0; i < n;) { if (!(M[i] >> z & 1)) { i++; continue; } let j = i; while (j < n && (M[j] >> z & 1)) j++; if (j - i < 2) for (let q = i; q < j; q++) M[q] &= ~(1 << z); i = j; }   // sin astillas de menos de 6 m
    for (let i = 0; i < n;) { let j = i; while (j < n && M[j] === M[i]) j++; const m = M[i];
      for (let z = 0; z < 3;) { if (!(m >> z & 1)) { z++; continue; } let z2 = z; while (z2 < 3 && (m >> z2 & 1)) z2++; out.push({ a: a0 + i * d, b: a0 + j * d, o0: Z[z][0], o1: Z[z2 - 1][1] }); z = z2; }
      i = j; }
    return (st._hp = out);
  },
  /* pilas de un puente sin las que caerían en una calle de abajo, en el carril del Metroplús o en el tranvía: la calle
     de abajo sigue libre (los puentes reales apoyan a los lados o en el separador). Se filtran una vez, cuando ya está la red */
  pilas(B) {
    if (B.pf || !B.pil.length || typeof NET === 'undefined' || !NET.lines || !NET.lines.length || !this.on) return B.pil;
    const p = B.pil, out = []; for (let i = 0; i < p.length; i += 2) if (!this.calleAbajo(p[i], p[i + 1])) out.push(p[i], p[i + 1]);
    B.pf = 1; return (B.pil = Float32Array.from(out));
  },
  /* ¿(x, y) cae en una calle a ras de piso (sin sus tramos sobre un puente), en un peatonal o en el carril del Metroplús o del tranvía? */
  calleAbajo(x, y) {
    for (const c of this.near(x - 14, y - 14, x + 14, y + 14)) { if (!(c.k <= 4 || c.k === 6 || c.k === 7)) continue; const P = c.P, r = c.w / 2 + .6;
      for (let i = 2; i < P.length; i += 2) { if (c.pz && c.pz.has(i / 2)) continue; const ax = P[i - 2], ay = P[i - 1], dx = P[i] - ax, dy = P[i + 1] - ay, t = clamp(((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy || 1), 0, 1); if (Math.hypot(ax + dx * t - x, ay + dy * t - y) < r) return true; } }
    const gx = Math.floor(x / this.CG), gy = Math.floor(y / this.CG); if (!this.trSeg) this.segsCelda(gx, gy);   // la rejilla del Metroplús y el tranvía
    const T = this.trSeg && this.trSeg.get(gx * 4096 + gy); return !!(T && this.enSegs(T, x, y));
  },
  /* rumbo de la calle que pasa por (x, y), del lado más parecido a h (null si no hay calle): en el piso no cuentan los tramos
     que van sobre un puente; arriba (z > 0), solo esos. Para la asistencia al volante de Ciudad Libre */
  rumbo(x, y, h, z) {
    let best = null, bd = 1e9;
    for (const c of this.near(x - 12, y - 12, x + 12, y + 12)) { if (c.k > 4) continue; const P = c.P;
      for (let i = 2; i < P.length; i += 2) { const enP = !!(c.pz && c.pz.has(i / 2)); if (z ? !enP : enP) continue;
        const ax = P[i - 2], ay = P[i - 1], dx = P[i] - ax, dy = P[i + 1] - ay, L2 = dx * dx + dy * dy || 1, t = clamp(((x - ax) * dx + (y - ay) * dy) / L2, 0, 1), d = Math.hypot(ax + dx * t - x, ay + dy * t - y);
        if (d < c.w / 2 + .5 && d < bd) { bd = d; best = Math.atan2(dy, dx); } } }
    if (best == null) return null; const d = Math.atan2(Math.sin(best - h), Math.cos(best - h)); return Math.abs(d) > Math.PI / 2 ? best + Math.PI : best;
  },
  enBase(x, y, r) {
    const k = Math.floor(x / 160) * 4096 + Math.floor(y / 160);
    if (this.PG) for (const B of this.PG.get(k) || []) { if (x < B.x0 || x > B.x1 || y < B.y0 || y > B.y1) continue; const p = this.pilas(B), rr = (B.pe ? .45 : .8) + r; for (let i = 0; i < p.length; i += 2) { const dx = x - p[i], dy = y - p[i + 1]; if (dx * dx + dy * dy < rr * rr) return true; } }
    const G = this.metroBase(); if (G) for (const o of G.get(k) || []) { if (o.c) { const dx = x - o.x, dy = y - o.y, rr = 1.2 + r; if (dx * dx + dy * dy < rr * rr) return true; } else if (x > o.x0 - r && x < o.x1 + r && y > o.y0 - r && y < o.y1 + r && this.enPol(o.P, x, y, r)) return true; }
    return false;
  },
  /* ---------- dibujo de los puentes de un nivel: sombra y pilas abajo; canto, tablero, calle y barandas arriba ---------- */
  puentesDib(g, S, k, x0, y0, x1, y1, z) {
    const ob = this.ob, L = this.puentesEn(x0 - 40, y0 - 40, x1 + 40, y1 + 80); if (!L.length) return; L.sort((a, b) => a.y1 - b.y1);
    const T = (x, y, h) => S(x, y - h * ob);
    for (const B of L) {
      if (B.z !== z) continue; const st = Math.max(1.5, Math.min(6, 4 / k)), n = Math.max(2, Math.ceil(B.len / st) + 1), hw = B.w / 2, E = [];
      for (let i = 0; i < n; i++) { const s = Math.min(B.len, i * B.len / (n - 1)), q = this.puAt(B, s); q.h = this.puAlto(B, s); q.s = s; E.push(q); }
      if (B.is_tunnel) {
        // deprimido (z = -1): bocas en rampa con muros de contención en concreto y sombra profunda al entrar al tramo cubierto
        for (const r0 of [[0, B.ramp], [B.len - B.ramp, B.len]]) {
          const R = E.filter(q => q.s >= r0[0] - 2 && q.s <= r0[1] + 2); if (R.length < 2) continue;
          const p = (q, o) => S(q.x - q.uy * o, q.y + q.ux * o);
          g.beginPath(); R.forEach((q, i) => { const u = p(q, -hw); i ? g.lineTo(u.x, u.y) : g.moveTo(u.x, u.y); });
          for (let i = R.length - 1; i >= 0; i--) { const u = p(R[i], hw); g.lineTo(u.x, u.y); } g.closePath();
          g.fillStyle = '#2d3138'; g.fill();
          if (k > .6) for (const o of [-hw, hw]) { g.strokeStyle = '#928c80'; g.lineWidth = Math.max(1, 1.1 * k); g.beginPath(); R.forEach((q, i) => { const u = p(q, o); i ? g.lineTo(u.x, u.y) : g.moveTo(u.x, u.y); }); g.stroke(); }
          const portal = r0[0] === 0 ? R[R.length - 1] : R[0], a = p(portal, -hw - .6), b = p(portal, hw + .6);
          g.strokeStyle = '#c4beb0'; g.lineWidth = Math.max(1.5, 1.8 * k); g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke();
        }
        continue;
      }
      const lado = (q, o, dh = 0) => T(q.x - q.uy * o, q.y + q.ux * o, q.h + dh);
      // 1 · sombra en el piso, corrida según el alto
      g.fillStyle = 'rgba(16,22,34,.2)'; g.beginPath();
      E.forEach((q, i) => { const sx = q.h * .32, sy = q.h * .2, p = S(q.x - q.uy * hw + sx, q.y + q.ux * hw + sy); i ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y); });
      for (let i = n - 1; i >= 0; i--) { const q = E[i], sx = q.h * .32, sy = q.h * .2, p = S(q.x + q.uy * hw + sx, q.y - q.ux * hw + sy); g.lineTo(p.x, p.y); } g.closePath(); g.fill();
      // 2 · pilas, del piso al tablero
      const pl = this.pilas(B); if (pl.length && k > .35) { g.lineCap = 'butt'; for (let i = 0; i < pl.length; i += 2) { const x = pl[i], y = pl[i + 1], h = this.puAlto(B, this.puProy(B, x, y).s) - 1.1, a = S(x, y), b = T(x, y, Math.max(0, h)); g.strokeStyle = '#7e786e'; g.lineWidth = Math.max(1, (B.pe ? .7 : 1.4) * k); g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke(); } }
      // 3 · canto del tablero (la cara que mira hacia abajo de la pantalla)
      g.fillStyle = B.pe ? '#a39b8c' : '#8a847a';
      for (let i = 1; i < n; i++) { const a = E[i - 1], b = E[i], o = hw * (a.ux > 0 ? 1 : -1);   // el lado de desplazamiento +o tiene normal (−uy, ux): mira hacia abajo de la pantalla si ux > 0
        const p1 = lado(a, o), p2 = lado(b, o), p3 = lado(b, o, -1.1), p4 = lado(a, o, -1.1); if (Math.max(a.h, b.h) < .3) continue; g.beginPath(); g.moveTo(p1.x, p1.y); g.lineTo(p2.x, p2.y); g.lineTo(p3.x, p3.y); g.lineTo(p4.x, p4.y); g.closePath(); g.fill(); }
      // 4 · tablero: andenes o barandas a los lados y la calzada (o el piso del peatonal)
      const banda = (o0, o1) => { g.beginPath(); E.forEach((q, i) => { const p = lado(q, o0); i ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y); }); for (let i = n - 1; i >= 0; i--) { const p = lado(E[i], o1); g.lineTo(p.x, p.y); } g.closePath(); };
      if (B.pe) { banda(-hw, hw); g.fillStyle = '#d9d2c2'; g.fill(); if (k > 1.2) { g.strokeStyle = 'rgba(120,112,98,.5)'; g.lineWidth = Math.max(1, .12 * k); g.beginPath(); for (let i = 0; i < n; i += 1) { const a = lado(E[i], -hw), b = lado(E[i], hw); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); } g.stroke(); } }
      else { banda(-hw, hw); g.fillStyle = '#9a958a'; g.fill(); banda(-hw + .6, hw - .6); g.fillStyle = '#d9d4c8'; g.fill(); banda(-hw + 1.6, hw - 1.6); g.fillStyle = '#4d525a'; g.fill();
        if (k > .8 && hw > 3) { g.strokeStyle = 'rgba(239,237,229,.8)'; g.lineWidth = Math.max(1, .2 * k); g.setLineDash([3 * k, 5 * k]); g.beginPath(); E.forEach((q, i) => { const p = lado(q, 0); i ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y); }); g.stroke(); g.setLineDash([]); } }
      // 5 · barandas: dos líneas claras con su sombra, y los extremos del tablero
      if (k > .6) for (const o of [-hw + .15, hw - .15]) { g.strokeStyle = 'rgba(30,30,30,.45)'; g.lineWidth = Math.max(1, .35 * k); g.beginPath(); E.forEach((q, i) => { const p = lado(q, o); i ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y); }); g.stroke(); g.strokeStyle = B.pe ? '#3f7fb0' : '#e8e4da'; g.lineWidth = Math.max(1, .18 * k); g.beginPath(); E.forEach((q, i) => { const p = lado(q, o, .9); i ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y); }); g.stroke(); }
    }
  },
  /* ---------- ángulo de la cámara: qué tanto se ve de las fachadas (la proyección oblicua sube los techos ob × altura) ---------- */
  ANGULOS: [{ n: 'Clásica', ob: .45 }, { n: 'Más inclinada', ob: .72 }, { n: 'Casi cenital', ob: .14 }],
  angulo(i) { const A = this.ANGULOS[clamp(i | 0, 0, this.ANGULOS.length - 1)]; if (this.ob === A.ob) return A; this.ob = A.ob; for (const C of this.cache) C.clear(); if (typeof MAP !== 'undefined') MAP._vis = []; return A; },
  /* tramos de un carril de tráfico que van sobre un puente vehicular (para subir los carros al tablero) */
  carrilPuentes(L) {
    if (L._pu) return L._pu; const out = []; if (!this.PG) return (L._pu = out); let cur = null;
    for (let s = 0; s <= L.P.len; s += 3) { const q = NET.at(L.P, s, L.off), P = this.puenteEn(q.x, q.y, null, 1.2); let B = null;
      if (P && !P.B.pe) { const u = this.puAt(P.B, P.s); if (Math.abs(u.ux * Math.cos(q.a) + u.uy * Math.sin(q.a)) > .86) B = P.B; }
      if (B && cur && cur[2] === B) cur[1] = s; else if (B) { cur = [s, s, B]; out.push(cur); } else cur = null; }
    return (L._pu = out.filter(r => r[1] - r[0] >= 6));
  },
  /* alto de un carro del tráfico sobre su puente o deprimido (0 si va por el piso); deja su nivel en c.z */
  carAlto(c) { const I = c.L ? this.carrilPuentes(c.L) : null; if (I && I.length) for (const [s0, s1, B] of I) if (c.p >= s0 - 1 && c.p <= s1 + 1) { c.z = B.z; const h = this.puAlto(B, this.puProy(B, c.x, c.y).s); return B.is_tunnel ? -h : h; } c.z = 0; return 0; },
  /* ¿hay un tablero (de puente, deprimido o del viaducto) sobre (x, y)? para mostrar al jugador a través de él */
  tapado(x, y) { const P = this.puenteEn(x, y, null, .5); if (P && P.h > 2) return true; if (typeof NET === 'undefined') return false; for (const l of NET.lines) { if (l.kind !== 'metro') continue; const pr = NET.project(l.P, x, y); if (pr.d < 5.2) return true; } return false; }
});
