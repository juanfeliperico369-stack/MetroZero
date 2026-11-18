/* =====================================================================
   CASAS Y EDIFICIOS REALES (1.2.0): cada casa y cada edificio del valle con su huella real (src/data/edificios.js).
   · Forma, posición y orientación: huellas abiertas (Overture: OpenStreetMap, Microsoft ML Buildings y Google Open Buildings).
   · Pisos: los oficiales del Catastro de Medellín en Popular, El Poblado y Robledo; los de OpenStreetMap donde existen;
     en el resto, estimados por zona y tamaño con lo medido en esas tres comunas.
   · Materiales y techos por zona, como se ven desde el aire (ver docs/investigacion/medellin-desde-el-aire.md):
     laderas de ladrillo a la vista con techos de zinc, fibrocemento y plancha con tanque; Laureles de casas blancas y de
     ladrillo con teja y mucho árbol; El Poblado de torres de ladrillo entre el bosque; el Centro de fachadas ocres y de
     ladrillo con teja vieja y azoteas; las bodegas de lámina; los pueblos de casas blancas con teja de barro.
   · Suelos especiales: canchas, pistas atléticas, piscinas y campus universitarios con su prado.
   Si los datos faltan o fallan, el motor vuelve a generar las casas a lo largo de las calles (respaldo procedural).
   ===================================================================== */
const KED = { casa: 0, edificio: 1, torre: 2, nave: 3, educativo: 4, salud: 5, iglesia: 6, civico: 7, comercio: 8, deporte: 9, techo: 10, invernadero: 11, tanque: 12, transporte: 13, parqueadero: 14, rural: 15 };
Object.assign(VC, {
  ED: null,
  // zona de cada comuna de Medellín (1 a 21, en el orden de VALLE_META.comunas) y de cada municipio (1 a 10)
  ZC: [null, 'ladera', 'ladera', 'ladera', 'mixto', 'mixto', 'ladera', 'mixto', 'ladera', 'ladera', 'centro', 'laureles', 'laureles', 'ladera', 'poblado', 'mixto', 'laureles', 'pueblo', 'mixto', 'pueblo', 'pueblo', 'pueblo'],
  ZM: [null, 'mixto', 'mixto', 'mixto', 'poblado', 'poblado', 'mixto', 'pueblo', 'mixto', 'pueblo', 'pueblo'],
  zona(x, y) {
    if (!MAP.co) return 'mixto'; const i = clamp(Math.floor(y / TM / 8), 0, VM.mH - 1) * VM.mW + clamp(Math.floor(x / TM / 8), 0, VM.mW - 1), c = MAP.co[i];
    return c ? this.ZC[c] || 'mixto' : this.ZM[MAP.mu[i]] || 'pueblo';
  },
  /* ---------- carga: índice por regiones de 640 m (los edificios se leen por región cuando hacen falta) ---------- */
  async edifInit() {
    if (typeof EDIFICIOS === 'undefined' || !EDIFICIOS.data) return;
    try {
      const E = EDIFICIOS, b = await MAP.unz(E.data, E.raw); if (!b || b.length < E.raw) return;
      const nR = E.nx * E.ny, cnt = new Int32Array(nR), i0 = new Int32Array(nR), p0 = new Int32Array(nR), q0 = new Int32Array(nR); let o = 0, ci = 0, cp = 0, cq = 0;
      const rv = () => { let v = 0, sh = 0, c; do { c = b[o++]; v += (c & 127) * 2 ** sh; sh += 7; } while (c & 128); return v; };
      for (let r = 0; r < nR; r++) { cnt[r] = rv(); const pb = rv(), qb = rv(); i0[r] = ci; p0[r] = cp; q0[r] = cq; ci += cnt[r]; cp += pb; cq += qb; }
      const Ls = E.len, oPos = Ls[0], oDim = oPos + Ls[1], oAng = oDim + Ls[2], oPis = oAng + Ls[3], oKin = oPis + Ls[4], oPol = oKin + Ls[5];
      if (ci !== E.n || o !== Ls[0]) throw new Error('índice de edificios inconsistente');
      this.ED = { b, nx: E.nx, ny: E.ny, R: E.R, Q: E.Q, cnt, i0, p0, q0, oPos, oDim, oAng, oPis, oKin, oPol, cache: new Map() };
    } catch (e) { this.ED = null; EM.errors.push('edificios: ' + e.message); console.error(e); }
    if (typeof SUELOS !== 'undefined') this.suelosInit();
  },
  /* altura en metros según el uso y los pisos (la teja suma su cumbrera aparte) */
  alto(k, pis) {
    switch (k) {
      case 3: return 4.5 + pis * 2.6; case 9: return 7 + pis * 2.2; case 10: return 3.2; case 11: return 3; case 6: return Math.max(8, pis * 3.4);
      case 0: case 15: return pis * 2.7 + .5; default: return pis * 3.05 + .6;
    }
  },
  /* los edificios de una región, leídos del binario (se guardan los últimos que se usaron) */
  edifDe(rx, ry) {
    const E = this.ED; if (!E || rx < 0 || ry < 0 || rx >= E.nx || ry >= E.ny) return [];
    const r = ry * E.nx + rx; let L = E.cache.get(r); if (L) { E.cache.delete(r); E.cache.set(r, L); return L; }
    const b = E.b, n = E.cnt[r], R = E.R, Q = E.Q, X0 = rx * R, Y0 = ry * R; L = [];
    let o = E.oPos + E.p0[r], q = E.oPol + E.q0[r], px = 0, py = 0, pa = 0;
    const rv = () => { let v = 0, sh = 0, c; do { c = b[o++]; v += (c & 127) * 2 ** sh; sh += 7; } while (c & 128); return v; };
    const rq = () => { let v = 0, sh = 0, c; do { c = b[q++]; v += (c & 127) * 2 ** sh; sh += 7; } while (c & 128); return v; };
    const uz = v => v % 2 ? -(v + 1) / 2 : v / 2;
    for (let j = 0; j < n; j++) {
      const i = E.i0[r] + j; px += uz(rv()); py += uz(rv());
      const hw = Math.max(.5, b[E.oDim + 2 * i] / Q), hd = Math.max(.5, b[E.oDim + 2 * i + 1] / Q); pa = (pa + b[E.oAng + i]) % 128;
      const an = (pa + .5) * Math.PI / 128, ux = Math.cos(an), uy = Math.sin(an), pis = b[E.oPis + i] || 1, kf = b[E.oKin + i], k = kf & 15, x = X0 + px / Q, y = Y0 + py / Q;
      let P = null, ym = y + Math.abs(uy) * hw + Math.abs(ux) * hd;
      if (kf & 16) {
        const nv = rq(); P = new Float32Array(nv * 2); let qx = px, qy = py, A = 0; ym = -1e9;
        for (let v = 0; v < nv; v++) { qx += uz(rq()); qy += uz(rq()); P[2 * v] = X0 + qx / Q; P[2 * v + 1] = Y0 + qy / Q; if (P[2 * v + 1] > ym) ym = P[2 * v + 1]; }
        for (let v = 0; v < nv; v++) { const w = (v + 1) % nv; A += P[2 * v] * P[2 * w + 1] - P[2 * w] * P[2 * v + 1]; }
        if (A < 0) { const Q2 = new Float32Array(nv * 2); for (let v = 0; v < nv; v++) { Q2[2 * v] = P[2 * (nv - 1 - v)]; Q2[2 * v + 1] = P[2 * (nv - 1 - v) + 1]; } P = Q2; }   // mismo sentido que las esquinas del rectángulo
      }
      L.push({ x, y, hw, hd, ux, uy, h: this.alto(k, pis), pis, k, P, ym, of: kf & 96, s: h2(x * 2 | 0, y * 2 | 0, 9), ed: k !== 0 && k !== 15 });
    }
    E.cache.set(r, L); while (E.cache.size > 60) E.cache.delete(E.cache.keys().next().value);
    return L;
  },
  /* ¿está (x, y) dentro del polígono P o a menos de r de su borde? */
  enPol(P, x, y, r = 0) {
    const n = P.length / 2; let dentro = false;
    for (let i = 0, j = n - 1; i < n; j = i++) { const xi = P[2 * i], yi = P[2 * i + 1], xj = P[2 * j], yj = P[2 * j + 1]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) dentro = !dentro; }
    if (dentro || r <= 0) return dentro;
    for (let i = 0, j = n - 1; i < n; j = i++) { const ax = P[2 * j], ay = P[2 * j + 1], dx = P[2 * i] - ax, dy = P[2 * i + 1] - ay, t = clamp(((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy || 1), 0, 1); if (Math.hypot(ax + dx * t - x, ay + dy * t - y) < r) return true; }
    return false;
  },
  /* tramos de calle que deben quedar libres (calles de carros con medio andén; peatonales y escaleras), por celda de 160 m */
  segsCelda(gx, gy) {
    const sc = this.sc || (this.sc = new Map()), key = gx * 4096 + gy; let S = sc.get(key); if (S) return S;
    const C = this.CG, x0 = gx * C, y0 = gy * C, x1 = x0 + C, y1 = y0 + C, out = [];
    for (const i of this.cg.get(key) || []) { const c = this.ch[i]; if (!(c.k <= 4 || c.k === 6 || c.k === 7)) continue; const r = Math.max(1, c.w / 2 + (c.k <= 4 ? 1.3 : .3)), P = c.P;
      for (let j = 2; j < P.length; j += 2) { const ax = P[j - 2], ay = P[j - 1], bx = P[j], by = P[j + 1]; if (Math.max(ax, bx) + r < x0 || Math.min(ax, bx) - r > x1 || Math.max(ay, by) + r < y0 || Math.min(ay, by) - r > y1) continue; out.push(ax, ay, bx, by, r); } }
    // el carril del Metroplús y el tranvía de Ayacucho van a ras de calle: también quedan libres
    if (!this.trSeg && typeof NET !== 'undefined' && NET.lines) { const T = this.trSeg = new Map(); for (const l of NET.lines) { if (l.kind !== 'brt' && l.kind !== 'tram') continue; const r = l.kind === 'brt' ? 5.5 : 5, Pt = l.P.pts;
      for (let j = 1; j < Pt.length; j++) { const a = Pt[j - 1], b = Pt[j]; for (let cy = Math.floor((Math.min(a.y, b.y) - r) / C); cy <= Math.floor((Math.max(a.y, b.y) + r) / C); cy++) for (let cx = Math.floor((Math.min(a.x, b.x) - r) / C); cx <= Math.floor((Math.max(a.x, b.x) + r) / C); cx++) { const k = cx * 4096 + cy; let L = T.get(k); if (!L) T.set(k, L = []); L.push(a.x, a.y, b.x, b.y, r); } } } }
    if (this.trSeg) for (const v of this.trSeg.get(key) || []) out.push(v);
    S = Float32Array.from(out); sc.set(key, S); while (sc.size > 600) sc.delete(sc.keys().next().value); return S;
  },
  /* los tramos que pasan a menos de R de (x, y) */
  segsCerca(x, y, R) {
    const C = this.CG, out = [];
    for (let gy = Math.floor((y - R) / C); gy <= Math.floor((y + R) / C); gy++) for (let gx = Math.floor((x - R) / C); gx <= Math.floor((x + R) / C); gx++) { const S = this.segsCelda(gx, gy);
      for (let i = 0; i < S.length; i += 5) { const r = S[i + 4] + R; if (Math.max(S[i], S[i + 2]) + r < x || Math.min(S[i], S[i + 2]) - r > x || Math.max(S[i + 1], S[i + 3]) + r < y || Math.min(S[i + 1], S[i + 3]) - r > y) continue; out.push(S[i], S[i + 1], S[i + 2], S[i + 3], S[i + 4]); } }
    return out;
  },
  enSegs(S, x, y) { for (let i = 0; i < S.length; i += 5) { const ax = S[i], ay = S[i + 1], dx = S[i + 2] - ax, dy = S[i + 3] - ay, t = clamp(((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy || 1), 0, 1), qx = ax + dx * t - x, qy = ay + dy * t - y; if (qx * qx + qy * qy < S[i + 4] * S[i + 4]) return true; } return false; },
  /* recorta el rectángulo de un edificio para que no pise la calle; si la calle lo atraviesa por dentro o queda muy chico, no va */
  recorta(b) {
    const ux = b.ux, uy = b.uy, bad = [], S = this.segsCerca(b.x, b.y, Math.hypot(b.hw, b.hd) + .5); if (!S.length) return true;
    const na = Math.max(1, Math.ceil(b.hw * 2)), nd = Math.max(1, Math.ceil(b.hd * 2));   // muestras cada metro o menos, bordes incluidos
    const muestrea = pol => { bad.length = 0; for (let i = 0; i <= na; i++) for (let j = 0; j <= nd; j++) { const a = -b.hw + 2 * b.hw * i / na, d = -b.hd + 2 * b.hd * j / nd, x = b.x + ux * a - uy * d, y = b.y + uy * a + ux * d; if (this.enSegs(S, x, y) && (!pol || this.enPol(b.P, x, y, .5))) bad.push(a, d); } };
    muestrea(!!b.P); if (!bad.length) return true;
    if (b.P) muestrea(false);   // un polígono recortado queda como rectángulo: se mide la calle contra el rectángulo entero
    let a0 = -b.hw, a1 = b.hw, d0 = -b.hd, d1 = b.hd;
    let n = 1;
    for (let it = 0; it < 400 && n; it++) {
      n = 0; let cA0 = 0, cA1 = 0, cD0 = 0, cD1 = 0;
      for (let i = 0; i < bad.length; i += 2) { const a = bad[i], d = bad[i + 1]; if (a < a0 - 1e-6 || a > a1 + 1e-6 || d < d0 - 1e-6 || d > d1 + 1e-6) continue; n++; if (a < a0 + 1.5) cA0++; if (a > a1 - 1.5) cA1++; if (d < d0 + 1.5) cD0++; if (d > d1 - 1.5) cD1++; }
      if (!n) break; const m = Math.max(cA0, cA1, cD0, cD1); if (!m) return false;
      if (m === cA0) a0 += 1; else if (m === cA1) a1 -= 1; else if (m === cD0) d0 += 1; else d1 -= 1;
      if (a1 - a0 < 2.4 || d1 - d0 < 2.4) return false;
    }
    if (n) return false;   // no alcanzó a despejar la calle
    // medio metro más en los lados recortados: la máscara de la calle va en celdas de 2 m
    if (a0 > -b.hw) a0 += .6; if (a1 < b.hw) a1 -= .6; if (d0 > -b.hd) d0 += .6; if (d1 < b.hd) d1 -= .6; if (a1 - a0 < 2 || d1 - d0 < 2) return false;
    const ca = (a0 + a1) / 2, cd = (d0 + d1) / 2; b.x += ux * ca - uy * cd; b.y += uy * ca + ux * cd; b.hw = (a1 - a0) / 2; b.hd = (d1 - d0) / 2; b.P = null; b.cut = 1;
    if (b.hw < b.hd) { const t = b.hw; b.hw = b.hd; b.hd = t; const ox = b.ux; b.ux = -b.uy; b.uy = ox; }   // el lado largo sigue siendo hw
    b.ym = b.y + Math.abs(b.uy) * b.hw + Math.abs(b.ux) * b.hd; return true;
  },
  /* pone en la región sus edificios reales y marca su ocupación; los de las regiones vecinas que entran en esta van a la física (ext) */
  edifRegion(rx, ry, X0, Y0, NG, RES, occ, bs, ext, asf) {
    if (!this.ED) return false;
    const R = this.R, occAt = (x, y) => { const gx = Math.floor((x - X0) / RES), gy = Math.floor((y - Y0) / RES); return gx < 0 || gy < 0 || gx >= NG || gy >= NG ? -1 : occ[gy * NG + gx]; };
    const marca = b => {
      const r = Math.hypot(b.hw, b.hd), gx0 = Math.max(0, Math.floor((b.x - r - X0) / RES)), gx1 = Math.min(NG - 1, Math.floor((b.x + r - X0) / RES)), gy0 = Math.max(0, Math.floor((b.y - r - Y0) / RES)), gy1 = Math.min(NG - 1, Math.floor((b.y + r - Y0) / RES));
      for (let gy = gy0; gy <= gy1; gy++) for (let gx = gx0; gx <= gx1; gx++) { const j = gy * NG + gx; if (occ[j]) continue; const px = X0 + (gx + .5) * RES, py = Y0 + (gy + .5) * RES, dx = px - b.x, dy = py - b.y, a = dx * b.ux + dy * b.uy, d = -dx * b.uy + dy * b.ux; if (Math.abs(a) <= b.hw + .4 && Math.abs(d) <= b.hd + .4 && (!b.P || this.enPol(b.P, px, py, .4))) occ[j] = 2; }
    };
    // huellas y vías vienen de fuentes distintas y se corren uno o dos metros: cada edificio se recorta contra la calle (asfalto
    // y medio andén, peatonales y escaleras) para que la calle quede siempre libre; si su centro cae en la calle o en un hito, no va
    // (la decisión no depende de la región: se mide contra los tramos de calle y los hitos, y se guarda en el edificio)
    const libre = b => { if (b.rec !== undefined) return b.rec; const S = this.segsCerca(b.x, b.y, 1); if (this.enSegs(S, b.x, b.y) || this.hitosEn(b.x, b.y, b.x, b.y).some(H => this.dentroH(H, b.x, b.y))) return (b.rec = false); return (b.rec = this.recorta(b)); };
    for (const b of this.edifDe(rx, ry)) if (libre(b)) { bs.push(b); if (b.k !== 10) marca(b); }
    for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) {
      if (!i && !j) continue;
      for (const b of this.edifDe(rx + i, ry + j)) { const r = b.hw + b.hd; if (b.x + r < rx * R || b.x - r > (rx + 1) * R || b.y + r < ry * R || b.y - r > (ry + 1) * R) continue; if (!libre(b)) continue; ext.push(b); if (b.k !== 10) marca(b); }
    }
    return true;
  },
  /* ---------- estilo: materiales y techos por zona y por uso, como en las fotos aéreas ---------- */
  PAL: {
    ladrillo: ['#b5593c', '#a9533a', '#c0654a', '#9c4a33', '#b86446', '#a65a3e', '#bd6a4c'],
    pintado: ['#7fb3d5', '#8fc79a', '#e98fae', '#f2d16b', '#f4f1ea', '#f0a35e', '#9b8fd1', '#6fc2b8', '#f6f3ea'],
    claro: ['#f4efe4', '#efe3c8', '#f2e6d0', '#ece6da', '#f7f1e6', '#e9e2d2'],
    ocre: ['#e8d9b5', '#d9c49a', '#e2cfa8', '#cfc3ad', '#e6d3b0', '#d6bd8f'],
    gris: ['#bfc0bb', '#a9aeb3', '#c9c6bd', '#b3b6b1'],
    torreLad: ['#b86a4a', '#c27552', '#a85d3f', '#c98b62', '#b5603f', '#a4583c'],
    vidrio: ['#5f88a8', '#4f7896', '#6c97b5', '#58809e'],
    teja: ['#b9553a', '#c6663f', '#a8462f', '#b4502f', '#bf5d3c'],
    plancha: ['#a8a49b', '#b3ada2', '#9d9a93', '#bdb6a8', '#aaa69f'],
    eternit: ['#b9bbb6', '#a9aca8', '#c4c5bf', '#b0b2ad'],
    zinc: ['#8a5a40', '#9b6b4b', '#7d6352', '#a7a9a6', '#94603f'],
    metal: ['#c5cbcf', '#dfe3e4', '#9fb1bd', '#b8c0c4', '#d2d6d4'],
  },
  estilo(b) {
    if (b.cw) return b;
    const z = b.z || (b.z = this.zona(b.x, b.y)), k = b.k, P = this.PAL, pk = (a, u) => a[Math.floor(u * a.length) % a.length];
    const u1 = h2(b.x * 7 | 0, b.y * 7 | 0, 31), u2 = h2(b.x * 5 | 0, b.y * 3 | 0, 32), u3 = h2(b.x * 3 | 0, b.y * 11 | 0, 33);
    let w, r, t;
    switch (k) {
      case 3: w = pk(P.gris, u1); r = pk(P.metal, u2); t = 'nave'; break;
      case 11: w = '#e3ebe4'; r = '#eef3ee'; t = 'inv'; break;
      case 12: w = '#d9dcd8'; r = '#c4c9c6'; t = 'plana'; break;
      case 10: w = '#8f8a82'; r = pk(P.metal.concat(P.eternit), u2); t = 'techo'; break;
      case 6: w = pk(['#efe6d2', '#f3eee2', '#e9dcc0', '#f1e4c6'], u1); r = pk(P.teja, u2); t = b.hw * b.hd < 900 ? 'teja' : 'tejaP'; break;
      case 5: w = pk(['#f3f4f2', '#eef0ee', '#e8ecef'], u1); r = pk(['#c9ccc9', '#bcc2c4'], u2); t = 'azotea'; break;
      case 4: w = u1 < .45 ? pk(P.ladrillo, u2) : pk(['#efe0c0', '#f2ead8', '#e7dcc4', '#f4f0e6'], u2); if (u3 < .4 && b.hw * b.hd < 110) { r = pk(P.teja, u1); t = 'teja'; } else { r = pk(P.plancha, u1); t = 'azotea'; } break;
      case 8: w = pk(['#e6e4de', '#ddd8cc', '#cfd4d8', '#ece9e2'], u1); r = pk(P.plancha.concat(P.metal), u2); t = 'azotea'; break;
      case 7: case 13: w = pk(['#d8d3c8', '#cfcac0', '#e2ddd2'], u1); r = pk(P.plancha, u2); t = 'azotea'; break;
      case 9: w = '#d5d2c9'; r = pk(['#9fb1bd', '#b8c0c4', '#c9ced1'], u2); t = 'nave'; break;
      case 14: w = '#b9b8b2'; r = '#a3a29d'; t = 'plana'; break;
      case 1: case 2: {
        const lad = z === 'poblado' ? .66 : z === 'laureles' ? .55 : z === 'centro' ? .36 : z === 'ladera' ? .7 : .5, vid = k === 2 ? (z === 'centro' || z === 'poblado' ? .16 : .07) : .02;
        w = u1 < vid ? pk(P.vidrio, u2) : u1 < vid + lad ? pk(z === 'poblado' ? P.torreLad : P.ladrillo, u2) : pk(z === 'centro' ? P.ocre.concat(P.gris) : P.claro.concat(P.ocre), u2);
        r = pk(P.plancha, u3); t = 'azotea'; if (k === 1 && z !== 'centro' && z !== 'ladera' && u3 < .42 && b.hw * b.hd < 150) { r = pk(P.teja, u1); t = 'teja'; } break;
      }
      case 15: w = pk(P.claro, u1); r = pk(P.teja, u2); t = 'teja'; break;
      default:   // casa: según la zona
        if (z === 'ladera') { w = u1 < .72 ? pk(P.ladrillo, u2) : pk(P.pintado, u2); if (u3 < .28) { r = pk(P.plancha, u1); t = 'plancha'; } else if (u3 < .5) { r = pk(P.eternit, u1); t = 'lamina'; } else if (u3 < .76) { r = pk(P.zinc, u1); t = 'lamina'; } else if (u3 < .93) { r = pk(P.teja.concat(P.ladrillo), u1); t = u3 < .86 ? 'teja' : 'plancha'; } else { r = '#dfe3e4'; t = 'lamina'; } }
        else if (z === 'laureles') { w = u1 < .42 ? pk(P.claro, u2) : u1 < .86 ? pk(P.ladrillo, u2) : pk(P.pintado, u2); if (u3 < .68) { r = pk(P.teja, u1); t = 'teja'; } else { r = pk(P.plancha, u1); t = 'plancha'; } }
        else if (z === 'poblado') { w = u1 < .6 ? pk(P.claro, u2) : pk(P.torreLad, u2); if (u3 < .62) { r = pk(P.teja, u1); t = 'teja'; } else { r = pk(P.plancha, u1); t = 'plancha'; } }
        else if (z === 'centro') { w = u1 < .45 ? pk(P.ocre, u2) : u1 < .8 ? pk(P.ladrillo, u2) : pk(P.gris, u2); if (u3 < .5) { r = pk(P.teja, u1); t = 'teja'; } else { r = pk(P.plancha, u1); t = 'plancha'; } }
        else if (z === 'pueblo') { w = u1 < .68 ? pk(P.claro, u2) : u1 < .84 ? pk(P.pintado, u2) : pk(P.ladrillo, u2); if (u3 < .78) { r = pk(P.teja, u1); t = 'teja'; } else { r = pk(P.eternit, u1); t = 'lamina'; } }
        else { w = u1 < .56 ? pk(P.ladrillo, u2) : u1 < .86 ? pk(P.claro, u2) : pk(P.pintado, u2); if (u3 < .34) { r = pk(P.plancha, u1); t = 'plancha'; } else if (u3 < .8) { r = pk(P.teja, u1); t = 'teja'; } else { r = pk(P.eternit, u1); t = 'lamina'; } }
    }
    if (b.P && t === 'teja') t = 'tejaP';   // en planta irregular la teja va sin cumbrera
    b.cw = w; b.cr = r; b.rt = t; b.cs = Art.shade(w, .8); return b;
  },
  /* esquinas del rectángulo orientado, en el mismo sentido que los polígonos (si u = (1, 0): arriba-izq, arriba-der, abajo-der, abajo-izq) */
  esqP(b) { const { x, y, ux, uy, hw, hd } = b; return [x - ux * hw + uy * hd, y - uy * hw - ux * hd, x + ux * hw + uy * hd, y + uy * hw - ux * hd, x + ux * hw - uy * hd, y + uy * hw + ux * hd, x - ux * hw - uy * hd, y - uy * hw + ux * hd]; },
  /* sombra (sol de la tarde, desde el noroeste): la huella barrida hacia el sureste */
  sombraEd(g, b, simple) {
    const P = b.P || this.esqP(b), n = P.length / 2, sx = Math.min(14, b.h * .32), sy = Math.min(9, b.h * .2);
    if (b.k === 12) { const r = (b.hw + b.hd) / 2; g.moveTo(b.x + sx + r, b.y + sy); g.arc(b.x + sx, b.y + sy, r, 0, TAU); return; }
    g.moveTo(P[0] + sx, P[1] + sy); for (let i = 1; i < n; i++) g.lineTo(P[2 * i] + sx, P[2 * i + 1] + sy); g.closePath(); if (simple) return;
    for (let i = 0; i < n; i++) { const j = (i + 1) % n, ax = P[2 * i], ay = P[2 * i + 1], bx = P[2 * j], by = P[2 * j + 1]; if ((bx - ax) * sy - (by - ay) * sx < 0) continue; g.moveTo(ax, ay); g.lineTo(bx, by); g.lineTo(bx + sx, by + sy); g.lineTo(ax + sx, ay + sy); g.closePath(); }
  },
  /* un edificio con su volumen (lod 0: de cerca, con ventanas, puertas, tanques y teja) */
  dibEd(g, b, sc) {
    this.estilo(b); const ob = this.ob, k = b.k, sh = Art.shade, up = b.h * ob, det = sc >= 1.9, fino = sc >= 3.5;
    if (k === 12) return this.dibTanque(g, b, det);
    const P = b.P || this.esqP(b), n = P.length / 2, s = b.s, techo = k === 10, out = sc >= 3.5 ? .3 : .45;
    // muros que miran hacia abajo de la pantalla (los que se ven), con la luz del oeste
    if (!techo) for (let e = 0; e < n; e++) {
      const f = (e + 1) % n, ax = P[2 * e], ay = P[2 * e + 1], bx = P[2 * f], by = P[2 * f + 1], nx = by - ay, ny = -(bx - ax), L = Math.hypot(nx, ny) || 1; if (ny / L < .04) continue;
      g.fillStyle = sh(b.cw, .76 + .2 * (nx / L)); g.beginPath(); g.moveTo(ax, ay); g.lineTo(bx, by); g.lineTo(bx, by - up); g.lineTo(ax, ay - up); g.closePath(); g.fill();
      if (det && up > 2 && L > 2.2) this.fachada(g, b, ax, ay, bx, by, L, up, fino);
    }
    // techo
    const T = this.techo2(g, b, P, n, up, det, fino);
    if (techo) {   // cubierta sin muros: postes en las esquinas de adelante
      g.strokeStyle = 'rgba(40,40,40,.6)'; g.lineWidth = .25; g.beginPath(); for (let i = 0; i < n; i++) { const x = P[2 * i], y = P[2 * i + 1]; g.moveTo(x, y); g.lineTo(x, y - up); } g.stroke();
    }
    // contorno oscuro del volumen
    g.strokeStyle = `rgba(20,26,38,${out})`; g.lineWidth = sc >= 3.5 ? .22 : .5; g.beginPath();
    if (!T) { g.moveTo(P[0], P[1] - up); for (let i = 1; i < n; i++) g.lineTo(P[2 * i], P[2 * i + 1] - up); g.closePath(); }
    if (!techo) for (let e = 0; e < n; e++) { const f = (e + 1) % n, ax = P[2 * e], ay = P[2 * e + 1], bx = P[2 * f], by = P[2 * f + 1]; if (-(bx - ax) <= 0) continue; g.moveTo(ax, ay); g.lineTo(ax, ay - up); g.moveTo(bx, by); g.lineTo(bx, by - up); g.moveTo(ax, ay); g.lineTo(bx, by); }
    g.stroke();
    // iglesia: campanario en el frente (el extremo del eje largo que mira hacia abajo)
    if (k === 6 && det) { const sd = b.uy >= 0 ? 1 : -1, tx = b.x + b.ux * (b.hw - 2.2) * sd, ty = b.y + b.uy * (b.hw - 2.2) * sd, th = b.h + 9; this.dibTorrecilla(g, tx, ty, 2.1, th, b.cw, b.cr); }
  },
  /* ventanas y puertas sobre un muro visible */
  fachada(g, b, ax, ay, bx, by, L, up, fino) {
    const ob = this.ob, k = b.k, fl = Math.max(1, b.pis), dz = up / fl, vid = b.cw && /^#[4-6]/.test(b.cw), torre = k === 1 || k === 2 || k === 5 || k === 7 || k === 8 || k === 13 || k === 4;
    const wpt = (t, z) => [ax + (bx - ax) * t, ay + (by - ay) * t - z];
    if (torre || vid) {   // franjas de ventanas por piso (y parteluces en el vidrio)
      g.strokeStyle = vid ? 'rgba(225,240,250,.5)' : 'rgba(30,48,70,.55)'; g.lineWidth = Math.min(.8, dz * .38); g.beginPath();
      for (let f = 0; f < fl; f++) { const z = f * dz + dz * .55, [x1, y1] = wpt(.08, z), [x2, y2] = wpt(.92, z); g.moveTo(x1, y1); g.lineTo(x2, y2); }
      g.stroke();
      if (fino && L > 6) { g.strokeStyle = vid ? 'rgba(20,40,60,.35)' : 'rgba(255,255,255,.18)'; g.lineWidth = .18; g.beginPath(); const nm = Math.floor(L / 2.6); for (let i = 1; i < nm; i++) { const [x1, y1] = wpt(i / nm, 0), [x2, y2] = wpt(i / nm, up - .3); g.moveTo(x1, y1); g.lineTo(x2, y2); } g.stroke(); }
      return;
    }
    if (k === 3 || k === 9 || k === 11 || k === 14) { if (fino && L > 8) { g.fillStyle = 'rgba(60,64,70,.55)'; const [x1, y1] = wpt(.4, 0), [x2, y2] = wpt(.6, 0); g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.lineTo(x2, y2 - Math.min(up * .7, 4.5 * ob)); g.lineTo(x1, y1 - Math.min(up * .7, 4.5 * ob)); g.closePath(); g.fill(); } return; }
    // casas: una ventana cada ~3 m por piso y la puerta abajo
    const nv = Math.max(1, Math.floor(L / 3.1)), ww = Math.min(.32, 1 / nv * .45), hz = dz * .42;
    g.fillStyle = 'rgba(38,44,58,.62)'; g.beginPath();
    for (let f = 0; f < fl; f++) for (let i = 0; i < nv; i++) {
      if (!f && i === (nv > 1 ? (b.s * nv | 0) : -1)) continue; const t = (i + .5) / nv, z = f * dz + dz * .38, [x1, y1] = wpt(t - ww / 2, z), [x2, y2] = wpt(t + ww / 2, z);
      g.moveTo(x1, y1); g.lineTo(x2, y2); g.lineTo(x2, y2 - hz); g.lineTo(x1, y1 - hz); g.closePath();
    }
    g.fill();
    { const i = nv > 1 ? (b.s * nv | 0) : 0, t = (i + .5) / nv, wd = Math.min(.22, .9 / L), [x1, y1] = wpt(t - wd / 2, 0), [x2, y2] = wpt(t + wd / 2, 0); g.fillStyle = b.s < .5 ? '#5a3a26' : '#3c4a5c'; g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.lineTo(x2, y2 - dz * .7); g.lineTo(x1, y1 - dz * .7); g.closePath(); g.fill(); }
  },
  /* techo según su tipo; devuelve true si ya dibujó su contorno */
  techo2(g, b, P, n, up, det, fino) {
    const sh = Art.shade, t = b.rt, ob = this.ob, s = b.s;
    const plano = (col) => { g.fillStyle = col; g.beginPath(); g.moveTo(P[0], P[1] - up); for (let i = 1; i < n; i++) g.lineTo(P[2 * i], P[2 * i + 1] - up); g.closePath(); g.fill(); };
    if (t === 'teja' && !b.P) {   // dos aguas: cumbrera a lo largo del lado largo
      const lu = b.hw >= b.hd, ax = lu ? b.ux : -b.uy, ay = lu ? b.uy : b.ux, la = lu ? b.hw : b.hd, ls = lu ? b.hd : b.hw, vx = ay, vy = -ax, rise = Math.min(ls * .62, 3.2) * ob, top = up + rise;
      const r1x = b.x - ax * la, r1y = b.y - ay * la - top, r2x = b.x + ax * la, r2y = b.y + ay * la - top;
      const lado = sd => { const c1x = b.x - ax * la + vx * ls * sd, c1y = b.y - ay * la + vy * ls * sd - up, c2x = b.x + ax * la + vx * ls * sd, c2y = b.y + ay * la + vy * ls * sd - up, luz = (vx * sd * -1 + vy * sd * -1) > 0;
        g.fillStyle = sh(b.cr, luz ? 1.06 : .8); g.beginPath(); g.moveTo(c1x, c1y); g.lineTo(c2x, c2y); g.lineTo(r2x, r2y); g.lineTo(r1x, r1y); g.closePath(); g.fill();
        if (det) { g.strokeStyle = sh(b.cr, .7); g.lineWidth = fino ? .14 : .25; g.beginPath(); const m = Math.max(2, Math.round(la * 2 / (fino ? 1.2 : 2.4))); for (let i = 1; i < m; i++) { const f = i / m; g.moveTo(c1x + (c2x - c1x) * f, c1y + (c2y - c1y) * f); g.lineTo(r1x + (r2x - r1x) * f, r1y + (r2y - r1y) * f); } g.stroke(); }
        return [c1x, c1y, c2x, c2y]; };
      const atras = vy * -1 > 0 ? 1 : -1;   // primero el faldón de atrás (el que mira hacia arriba de la pantalla)
      const A = lado(atras), B = lado(-atras);
      // hastiales: el triángulo de muro bajo la teja en los extremos que se ven
      for (const sd of [1, -1]) { const ex = ax * sd, ey = ay * sd; if (ey <= .04) continue; const px = b.x + ax * la * sd, py = b.y + ay * la * sd; g.fillStyle = sh(b.cw, .8 + .18 * ex); g.beginPath(); g.moveTo(px + vx * ls, py + vy * ls - up); g.lineTo(px - vx * ls, py - vy * ls - up); g.lineTo(px, py - top); g.closePath(); g.fill(); }
      g.strokeStyle = 'rgba(40,24,16,.55)'; g.lineWidth = fino ? .22 : .4; g.beginPath(); g.moveTo(r1x, r1y); g.lineTo(r2x, r2y); g.moveTo(A[0], A[1]); g.lineTo(A[2], A[3]); g.lineTo(r2x, r2y); g.lineTo(B[2], B[3]); g.lineTo(B[0], B[1]); g.lineTo(r1x, r1y); g.closePath(); g.stroke();
      return true;
    }
    plano(t === 'tejaP' ? b.cr : b.cr);
    if (!det) return false;
    const cx = b.x, cy = b.y - up, u = [b.ux, b.uy], v = [b.uy, -b.ux];
    if (t === 'tejaP' || t === 'lamina' || t === 'nave' || t === 'inv') {   // láminas, teja o naves: canales a lo largo
      const paso = t === 'nave' ? 2.2 : t === 'inv' ? 1.6 : fino ? .9 : 1.8, m = Math.floor(b.hw * 2 / paso); if (m > 1 && m < 160) {
        g.save(); g.beginPath(); g.moveTo(P[0], P[1] - up); for (let i = 1; i < n; i++) g.lineTo(P[2 * i], P[2 * i + 1] - up); g.closePath(); g.clip();
        g.strokeStyle = t === 'inv' ? 'rgba(150,170,160,.6)' : sh(b.cr, .78); g.lineWidth = t === 'nave' ? .3 : .16; g.beginPath();
        for (let i = 1; i < m; i++) { const a = -b.hw + i * paso, x = cx + u[0] * a, y = cy + u[1] * a; g.moveTo(x - v[0] * b.hd, y - v[1] * b.hd); g.lineTo(x + v[0] * b.hd, y + v[1] * b.hd); }
        g.stroke(); if (t === 'nave' && s < .45) { g.fillStyle = 'rgba(255,255,255,.18)'; for (let i = 0; i < m; i += 2) { const a = -b.hw + i * paso, x = cx + u[0] * a, y = cy + u[1] * a; g.beginPath(); g.moveTo(x - v[0] * b.hd, y - v[1] * b.hd); g.lineTo(x + v[0] * b.hd, y + v[1] * b.hd); g.lineTo(x + v[0] * b.hd + u[0] * paso, y + v[1] * b.hd + u[1] * paso); g.lineTo(x - v[0] * b.hd + u[0] * paso, y - v[1] * b.hd + u[1] * paso); g.closePath(); g.fill(); } }
        g.restore();
      }
      // en las laderas, piedras y llantas para que no se vuele la teja; y algunas láminas oxidadas a parches
      if (t === 'lamina' && fino && s > .55) { g.fillStyle = 'rgba(60,50,40,.5)'; for (let i = 0; i < 3; i++) { const a = (h2(cx | 0, i, 71) - .5) * b.hw * 1.4, d = (h2(cy | 0, i, 72) - .5) * b.hd * 1.4; g.beginPath(); g.arc(cx + u[0] * a + v[0] * d, cy + u[1] * a + v[1] * d, .35, 0, TAU); g.fill(); } }
      return false;
    }
    if (t === 'plancha') {   // losa: antepecho, tanque de agua (negro o azul) y en Laureles y El Poblado, matas en la terraza
      if (fino && b.hw > 2.5 && b.hd > 2.5) { g.strokeStyle = sh(b.cr, 1.12); g.lineWidth = .3; g.beginPath(); const k2 = .82; g.moveTo(cx + (P[0] - b.x) * k2, cy + (P[1] - b.y) * k2); for (let i = 1; i < n; i++) g.lineTo(cx + (P[2 * i] - b.x) * k2, cy + (P[2 * i + 1] - b.y) * k2); g.closePath(); g.stroke(); }
      const tx = cx + u[0] * b.hw * (s - .5) * 1.1 + v[0] * b.hd * .45, ty = cy + u[1] * b.hw * (s - .5) * 1.1 + v[1] * b.hd * .45;
      g.fillStyle = s > .72 ? '#2f5f9a' : '#262626'; g.beginPath(); g.arc(tx, ty - .45, .75, 0, TAU); g.fill(); g.fillStyle = 'rgba(255,255,255,.25)'; g.beginPath(); g.arc(tx - .2, ty - .7, .3, 0, TAU); g.fill();
      if ((b.z === 'laureles' || b.z === 'poblado') && s < .35) { g.fillStyle = '#4f8a45'; for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(cx - u[0] * b.hw * .5 + v[0] * (i - 1) * b.hd * .5, cy - u[1] * b.hw * .5 + v[1] * (i - 1) * b.hd * .5, .55, 0, TAU); g.fill(); } }
      return false;
    }
    if (t === 'azotea') {   // edificios: cuarto de máquinas, y en las torres altas a veces piscina o helipuerto
      const w = Math.min(b.hw, b.hd) * .5; g.save(); g.translate(cx, cy); g.rotate(Math.atan2(b.uy, b.ux));
      g.fillStyle = sh(b.cr, .86); g.fillRect(-w * .6, -w * .45, w * 1.2, w * .9);
      if (b.pis >= 8 && b.z === 'poblado' && s > .82 && b.hw > 9) { g.fillStyle = '#5ec8e0'; g.fillRect(b.hw * .25, -b.hd * .55, b.hw * .5, b.hd * .35); }
      if (b.pis >= 22 && s < .12) { g.strokeStyle = '#e8c64a'; g.lineWidth = .35; g.beginPath(); g.arc(-b.hw * .4, 0, Math.min(b.hd * .5, 4), 0, TAU); g.stroke(); }
      g.restore(); return false;
    }
    return false;
  },
  /* tanque redondo (acueducto, combustibles) */
  dibTanque(g, b, det) {
    const r = Math.max(2, (b.hw + b.hd) / 2), up = Math.max(4, r * 1.2) * this.ob; g.fillStyle = Art.shade(b.cw, .82); g.fillRect(b.x - r, b.y - up, r * 2, up);
    g.beginPath(); g.arc(b.x, b.y, r, 0, Math.PI); g.fill(); g.fillStyle = b.cr; g.beginPath(); g.arc(b.x, b.y - up, r, 0, TAU); g.fill();
    g.strokeStyle = 'rgba(20,26,38,.45)'; g.lineWidth = .3; g.stroke(); if (det) { g.strokeStyle = 'rgba(255,255,255,.3)'; g.beginPath(); g.arc(b.x, b.y - up, r * .6, 0, TAU); g.stroke(); }
  },
  /* campanario de iglesia */
  dibTorrecilla(g, x, y, r, h, cw, cr) {
    const up = h * this.ob, sh = Art.shade; g.fillStyle = sh(cw, .82); g.fillRect(x - r, y - up, r * 2, up); g.fillStyle = sh(cw, .96); g.fillRect(x - r, y - up - r * .2, r * 2, r * 1.2);
    g.fillStyle = 'rgba(40,30,20,.65)'; g.fillRect(x - r * .4, y - up + r * .9, r * .8, r * 1.1); g.fillStyle = sh(cr, .9); g.beginPath(); g.moveTo(x - r * 1.1, y - up - r * .2); g.lineTo(x, y - up - r * 2.2); g.lineTo(x + r * 1.1, y - up - r * .2); g.closePath(); g.fill();
    g.strokeStyle = 'rgba(20,26,38,.45)'; g.lineWidth = .25; g.strokeRect(x - r, y - up, r * 2, up);
  },
  /* de lejos (lod 1): las casas en lote por color (silueta y techo), los edificios y torres uno por uno */
  edifLejos(g, B, ob, cv) {
    const hull = (P, up) => { const n = P.length / 2, Pt = []; for (let i = 0; i < n; i++) { Pt.push([P[2 * i], P[2 * i + 1]], [P[2 * i], P[2 * i + 1] - up]); } Pt.sort((p, q) => p[0] - q[0] || p[1] - q[1]); const cr = (o, a, c) => (a[0] - o[0]) * (c[1] - o[1]) - (a[1] - o[1]) * (c[0] - o[0]), lo = [], hi = [];
      for (const p of Pt) { while (lo.length > 1 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); } for (let i = Pt.length - 1; i >= 0; i--) { const p = Pt[i]; while (hi.length > 1 && cr(hi[hi.length - 2], hi[hi.length - 1], p) <= 0) hi.pop(); hi.push(p); } return lo.slice(0, -1).concat(hi.slice(0, -1)); };
    const poly = (Pa, Q) => { Pa.moveTo(Q[0][0], Q[0][1]); for (let i = 1; i < Q.length; i++) Pa.lineTo(Q[i][0], Q[i][1]); Pa.closePath(); };
    const roof = (Pa, P, up) => { const n = P.length / 2; Pa.moveTo(P[0], P[1] - up); for (let i = 1; i < n; i++) Pa.lineTo(P[2 * i], P[2 * i + 1] - up); Pa.closePath(); };
    const muros = new Map(), techos = new Map(), get = (M, c) => { let p = M.get(c); if (!p) M.set(c, p = new Path2D()); return p; };
    for (const b of B) { if (b.hito || b.k === 1 || b.k === 2) continue; this.estilo(b); const P = b.P || this.esqP(b), up = b.h * ob; if (b.k !== 10) roof(get(muros, b.cs), P, 0); roof(get(techos, b.cr), P, up); }
    for (const [c, p] of muros) { g.fillStyle = c; g.fill(p); } for (const [c, p] of techos) { g.fillStyle = c; g.fill(p); }
    for (const b of B) { if (b.hito) { this.hito(g, b.hito, 1, cv); continue; } if (b.k !== 1 && b.k !== 2) continue; this.estilo(b); const P = b.P || this.esqP(b), up = b.h * ob; g.fillStyle = b.cs; g.beginPath(); poly(g, hull(P, up)); g.fill(); g.fillStyle = b.cr; g.beginPath(); roof(g, P, up); g.fill(); g.strokeStyle = 'rgba(20,26,38,.35)'; g.lineWidth = .8; g.stroke(); }
  },
  /* ---------- suelos especiales: canchas, pistas, piscinas y campus ---------- */
  suelosInit() {
    const S = SUELOS, G = this.SG = new Map(), C = 320, put = (o, x0, y0, x1, y1) => { for (let gy = Math.floor(y0 / C); gy <= Math.floor(y1 / C); gy++) for (let gx = Math.floor(x0 / C); gx <= Math.floor(x1 / C); gx++) { const k = gx * 4096 + gy; let a = G.get(k); if (!a) G.set(k, a = []); a.push(o); } };
    for (const t of ['cancha', 'pista', 'piscina']) for (const a of S[t] || []) { const [x, y, hw, hd, an] = a, r = hw + hd, o = { t, x, y, hw, hd, ux: Math.cos(an), uy: Math.sin(an), f: a[5] || 1 }; put(o, x - r, y - r, x + r, y + r); }
    this.campus = (S.campus || []).map(c => { const P = Float32Array.from(c.P); let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (let i = 0; i < P.length; i += 2) { x0 = Math.min(x0, P[i]); x1 = Math.max(x1, P[i]); y0 = Math.min(y0, P[i + 1]); y1 = Math.max(y1, P[i + 1]); } const o = { t: 'campus', n: c.n, x: c.x, y: c.y, P, x0, y0, x1, y1, A: (x1 - x0) * (y1 - y0) }; put(o, x0, y0, x1, y1); return o; });
  },
  suelosEn(x0, y0, x1, y1) { if (!this.SG) return []; const out = new Set(), C = 320; for (let gy = Math.floor(y0 / C); gy <= Math.floor(y1 / C); gy++) for (let gx = Math.floor(x0 / C); gx <= Math.floor(x1 / C); gx++) for (const o of this.SG.get(gx * 4096 + gy) || []) out.add(o); return [...out]; },
  /* ¿(x, y) cae en un campus? (para sembrar árboles en sus prados) */
  enCampus(x, y) { for (const o of this.suelosEn(x, y, x, y)) if (o.t === 'campus' && x >= o.x0 && x <= o.x1 && y >= o.y0 && y <= o.y1 && this.enPol(o.P, x, y)) return o; return null; },
  suelosEsp(g, X0, Y0, S, sc, lod) {
    const L = this.suelosEn(X0 - 20, Y0 - 20, X0 + S + 20, Y0 + S + 20); if (!L.length) return; const fino = sc >= 1.9;
    // campus: prado claro debajo de todo (los edificios, plazas y calles van encima)
    for (const o of L) { if (o.t !== 'campus') continue; g.fillStyle = 'rgba(150,196,120,.5)'; g.beginPath(); const P = o.P; g.moveTo(P[0], P[1]); for (let i = 2; i < P.length; i += 2) g.lineTo(P[i], P[i + 1]); g.closePath(); g.fill(); }
    const rect = (o, m, col) => { const hw = o.hw - m, hd = o.hd - m; if (hw <= 0 || hd <= 0) return; g.fillStyle = col; g.beginPath(); g.moveTo(o.x - o.ux * hw + o.uy * hd, o.y - o.uy * hw - o.ux * hd); g.lineTo(o.x + o.ux * hw + o.uy * hd, o.y + o.uy * hw - o.ux * hd); g.lineTo(o.x + o.ux * hw - o.uy * hd, o.y + o.uy * hw + o.ux * hd); g.lineTo(o.x - o.ux * hw - o.uy * hd, o.y - o.uy * hw + o.ux * hd); g.closePath(); g.fill(); };
    const lin = (o, ax, ad, bx, bd) => { g.moveTo(o.x + o.ux * ax - o.uy * ad, o.y + o.uy * ax + o.ux * ad); g.lineTo(o.x + o.ux * bx - o.uy * bd, o.y + o.uy * bx + o.ux * bd); };
    for (const o of L) {
      if (o.t === 'pista') { rect(o, 0, '#c4573a'); rect(o, Math.min(o.hd * .28, 9), '#5f9e4f'); continue; }
      if (o.t === 'piscina') { rect(o, 0, '#e9eef0'); rect(o, Math.min(.6, o.hd * .25), '#4fbcd8'); if (fino) { g.strokeStyle = 'rgba(255,255,255,.45)'; g.lineWidth = .2; g.beginPath(); lin(o, -o.hw * .6, 0, o.hw * .6, 0); g.stroke(); } continue; }
      if (o.t !== 'cancha') continue;
      const A = o.hw * o.hd * 4, grande = A > 2400, col = grande ? (h2(o.x | 0, o.y | 0, 3) < .25 ? '#4f9a6a' : '#5f9e4f') : ['#4f8f8a', '#3f7fb0', '#b45b46', '#6a8f4f', '#8a8f96'][Math.floor(h2(o.x | 0, o.y | 0, 4) * 5)];
      rect(o, 0, col);
      if (grande && fino) { g.fillStyle = 'rgba(255,255,255,.07)'; for (let i = 0; i < 10; i += 2) { const a = -o.hw + i * o.hw / 5; g.beginPath(); g.moveTo(o.x + o.ux * a + o.uy * o.hd, o.y + o.uy * a - o.ux * o.hd); g.lineTo(o.x + o.ux * (a + o.hw / 5) + o.uy * o.hd, o.y + o.uy * (a + o.hw / 5) - o.ux * o.hd); g.lineTo(o.x + o.ux * (a + o.hw / 5) - o.uy * o.hd, o.y + o.uy * (a + o.hw / 5) + o.ux * o.hd); g.lineTo(o.x + o.ux * a - o.uy * o.hd, o.y + o.uy * a + o.ux * o.hd); g.closePath(); g.fill(); } }
      if (!fino) continue;
      const m = Math.min(1.2, o.hd * .12), hw = o.hw - m, hd = o.hd - m; g.strokeStyle = 'rgba(250,250,245,.85)'; g.lineWidth = grande ? .18 : .12; g.beginPath();
      lin(o, -hw, -hd, hw, -hd); lin(o, hw, -hd, hw, hd); lin(o, hw, hd, -hw, hd); lin(o, -hw, hd, -hw, -hd); lin(o, 0, -hd, 0, hd); g.stroke();
      g.beginPath(); g.arc(o.x, o.y, Math.min(hd * .3, 9.15), 0, TAU); g.stroke();
      if (grande) { const aw = Math.min(16.5, hw * .3), ad = Math.min(20, hd * .55); g.beginPath(); lin(o, -hw, -ad, -hw + aw, -ad); lin(o, -hw + aw, -ad, -hw + aw, ad); lin(o, -hw + aw, ad, -hw, ad); lin(o, hw, -ad, hw - aw, -ad); lin(o, hw - aw, -ad, hw - aw, ad); lin(o, hw - aw, ad, hw, ad); g.stroke(); }
    }
  },
  /* rótulos de los campus universitarios (de cerca) */
  rotulosCampus(texto, S, k, kc, dpr, night) {
    if (kc < .7 || !this.campus) return;
    for (const o of this.campus) { if (o.A < (kc < 1.1 ? 150000 : 20000)) continue; const [x, y] = S(o.x, o.y); texto(o.n, x, y, 0, '700 ' + clamp(kc * 4.4, 10, 13) * dpr + 'px Cuerpo, sans-serif', night > .4 ? '#d8f0ff' : '#14365a', night > .4 ? 'rgba(10,16,26,.85)' : 'rgba(240,248,236,.92)', 3 * dpr); }
  }
});
