/* =====================================================================
   CIUDAD VECTORIAL (1.1.0): la ciudad se dibuja como se vive, sin cubos ni escalones.
   · Calles: vectores de src/data/vias.js con su curva y su ancho (sardinel, andén, asfalto, carriles, cebras en los semáforos).
   · Suelo: río, parques, montaña, plazas y manzanas con bordes suaves (máscara de casillas suavizada y umbral).
   · Estructuras (desde 1.2.0): las casas y los edificios REALES de src/data/edificios.js, recortados contra la calle
     (src/js/11-edificios.js); si faltan los datos, se generan a lo largo de cada calle como en 1.1.x. Volumen al estilo
     de las ciudades de vista cenital (techo desplazado, fachadas con ventanas, sombra y contorno).
   · Física: se choca contra esos edificios (rectángulo o polígono) y contra el agua fuera de los puentes; lo demás se anda.
   Se dibuja en trozos con nivel de detalle (160 m a 2 px/m, 640 m a 0,8 px/m y 2,5 km a 0,2 px/m).
   ===================================================================== */
const VC = EM.vcity = {
  on: false, sw: true, ch: [], cg: new Map(), CG: 160, reg: new Map(), R: 640, ob: .45,
  // niveles de detalle: trozos de 80 m a 4 px/m (pantallas densas, a pie), 160 m a 2 px/m, 640 m a 0,8 px/m y 2,5 km a 0,2 px/m
  L: [{ i: 0, d: 0, sc: 4, S: 80, max: 44, k: 2.6 }, { i: 1, d: 0, sc: 2, S: 160, max: 32, k: 1.1 }, { i: 2, d: 1, sc: .8, S: 640, max: 14, k: .32 }, { i: 3, d: 2, sc: .2, S: 2560, max: 8, k: 0 }],
  cache: [new Map(), new Map(), new Map(), new Map()],
  DEFW: { 1: 7, 2: 15, 3: 12, 4: 10, 5: 2.5, 6: 5, 7: 3 },
  /* ---------- carga: cadenas de vía en metros e índice por celdas de 160 m ---------- */
  async init() {
    if (typeof VIAS === 'undefined' || !MAP.ready) return; const b = await MAP.unz(VIAS.d, VIAS.bytes), U = VIAS.u; let o = 0, px = 0, py = 0;
    const rv = () => { let v = 0, sh = 0, c; do { c = b[o++]; v += (c & 127) * 2 ** sh; sh += 7; } while (c & 128); return v; }, uz = v => v % 2 ? -(v + 1) / 2 : v / 2;
    for (let i = 0; i < VIAS.n; i++) {
      const k = rv(), nm = rv(), w2 = rv(), np = rv(), P = new Float32Array(np * 2); let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
      for (let j = 0; j < np; j++) { px += uz(rv()); py += uz(rv()); const x = px * U, y = py * U; P[2 * j] = x; P[2 * j + 1] = y; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
      const c = { k, nm, w: w2 / 2 || this.DEFW[k] || 6, P, x0, y0, x1, y1, i }; this.ch.push(c);
      for (let gy = Math.floor(y0 / this.CG); gy <= Math.floor(y1 / this.CG); gy++) for (let gx = Math.floor(x0 / this.CG); gx <= Math.floor(x1 / this.CG); gx++) { const key = gx * 4096 + gy; let a = this.cg.get(key); if (!a) this.cg.set(key, a = []); a.push(i); }
    }
    if (this.hitosInit) this.hitosInit();
    if (this.puentesInit) this.puentesInit();
    if (this.edifInit) await this.edifInit();
    if (this.angulo && Save.d && Save.d.settings && Save.d.settings.angulo) this.angulo(Save.d.settings.angulo);   // ángulo de cámara guardado
    this.on = true;
  },
  near(x0, y0, x1, y1) { const out = new Set(); for (let gy = Math.floor(y0 / this.CG); gy <= Math.floor(y1 / this.CG); gy++) for (let gx = Math.floor(x0 / this.CG); gx <= Math.floor(x1 / this.CG); gx++) for (const i of this.cg.get(gx * 4096 + gy) || []) out.add(i); return [...out].map(i => this.ch[i]); },
  /* medio ancho del corredor de una vía (asfalto + andén) */
  hw(c) { return c.w / 2 + (c.k === 1 || c.k === 2 || c.k === 4 ? 2.6 : c.k === 3 ? 1.6 : .7); },
  /* ---------- región de 640 m: rejilla de ocupación de 2 m (1 vía o transporte, 2 edificio, 3 hito), edificios y árboles ----------
     Con datos (1.2.0), los edificios son los reales de la región (y los de las vecinas que entran, para la física).
     Sin datos, se generan A LO LARGO de cada calle (frente girado con ella, retirado del andén) y luego se llena el
     interior de las manzanas alineado con la calle más cercana. */
  region(rx, ry) {
    const key = rx * 4096 + ry; let Rg = this.reg.get(key); if (Rg) { this.reg.delete(key); this.reg.set(key, Rg); return Rg; }
    const R = this.R, M = 48, X0 = rx * R - M, Y0 = ry * R - M, SZ = R + 2 * M, RES = 2, NG = SZ / RES, bs = [], trees = []; let occ = new Uint8Array(NG * NG);
    const DR = 8, DN = SZ / DR, dirA = new Float32Array(DN * DN), dirD = new Float32Array(DN * DN).fill(1e9);
    const stampSeg = (ax, ay, bx, by, r, v) => {
      const gx0 = Math.max(0, Math.floor((Math.min(ax, bx) - r - X0) / RES)), gx1 = Math.min(NG - 1, Math.floor((Math.max(ax, bx) + r - X0) / RES)), gy0 = Math.max(0, Math.floor((Math.min(ay, by) - r - Y0) / RES)), gy1 = Math.min(NG - 1, Math.floor((Math.max(ay, by) + r - Y0) / RES));
      const dx = bx - ax, dy = by - ay, L2 = dx * dx + dy * dy || 1, r2 = r * r;
      for (let gy = gy0; gy <= gy1; gy++) for (let gx = gx0; gx <= gx1; gx++) { const px = X0 + (gx + .5) * RES, py = Y0 + (gy + .5) * RES, t = clamp(((px - ax) * dx + (py - ay) * dy) / L2, 0, 1), qx = ax + dx * t - px, qy = ay + dy * t - py; if (qx * qx + qy * qy <= r2) { const j = gy * NG + gx; if (occ[j] < v) occ[j] = v; } }
    };
    // campo de direcciones: en cada celda de 8 m, el rumbo de la calle más cercana (hasta 70 m), para alinear el interior de las manzanas
    const stampDir = (ax, ay, bx, by) => {
      const r = 70, gx0 = Math.max(0, Math.floor((Math.min(ax, bx) - r - X0) / DR)), gx1 = Math.min(DN - 1, Math.floor((Math.max(ax, bx) + r - X0) / DR)), gy0 = Math.max(0, Math.floor((Math.min(ay, by) - r - Y0) / DR)), gy1 = Math.min(DN - 1, Math.floor((Math.max(ay, by) + r - Y0) / DR));
      const dx = bx - ax, dy = by - ay, L2 = dx * dx + dy * dy || 1, an = Math.atan2(dy, dx);
      for (let gy = gy0; gy <= gy1; gy++) for (let gx = gx0; gx <= gx1; gx++) { const px = X0 + (gx + .5) * DR, py = Y0 + (gy + .5) * DR, t = clamp(((px - ax) * dx + (py - ay) * dy) / L2, 0, 1), d = Math.hypot(ax + dx * t - px, ay + dy * t - py), j = gy * DN + gx; if (d < dirD[j]) { dirD[j] = d; dirA[j] = an; } }
    };
    const cs = this.near(X0, Y0, X0 + SZ, Y0 + SZ), asf = new Uint8Array(NG * NG);
    for (const c of cs) { const r = this.hw(c), P = c.P; if (c.pz) for (const Q of this.partes(c)) for (let i = 2; i < Q.length; i += 2) stampSeg(Q[i - 2], Q[i - 1], Q[i], Q[i + 1], r, 1);
      for (let i = 2; i < P.length; i += 2) { if (!c.pz) stampSeg(P[i - 2], P[i - 1], P[i], P[i + 1], r, 1); if (c.k <= 4 || c.k === 6 || c.k === 7) { const o2 = occ; occ = asf; stampSeg(P[i - 2], P[i - 1], P[i], P[i + 1], Math.max(1, c.w / 2 + (c.k <= 4 ? 1.3 : .3)), c.k <= 4 ? 2 : 1); occ = o2; } if (c.k !== 3 && c.k !== 5 && !this.ED) stampDir(P[i - 2], P[i - 1], P[i], P[i + 1]); } }   // el campo de direcciones solo hace falta para generar casas
    // transporte: corredor del viaducto y del tranvía, el andén de cada estación y las estaciones de cable (los edificios no se montan encima)
    if (typeof NET !== 'undefined') for (const l of NET.lines) {
      if (l.kind === 'cable') { for (const s of l.st) if (s.x > X0 - 30 && s.x < X0 + SZ + 30 && s.y > Y0 - 30 && s.y < Y0 + SZ + 30) stampSeg(s.x - 1, s.y, s.x + 1, s.y, 19, 1); continue; }
      if (l.kind !== 'metro' && l.kind !== 'tram' && l.kind !== 'brt') continue; const r = l.kind === 'metro' ? 7 : l.kind === 'brt' ? 5 : 4.5, P = l.P.pts;   // el carril del Metroplús también queda libre
      for (let i = 1; i < P.length; i++) { const a = P[i - 1], b = P[i]; if (Math.max(a.x, b.x) < X0 - 20 || Math.min(a.x, b.x) > X0 + SZ + 20 || Math.max(a.y, b.y) < Y0 - 20 || Math.min(a.y, b.y) > Y0 + SZ + 20) continue; stampSeg(a.x, a.y, b.x, b.y, r, 1); }
      for (const s of l.st) { const pl = KIND[l.kind].plat; if (s.x < X0 - pl || s.x > X0 + SZ + pl || s.y < Y0 - pl || s.y > Y0 + SZ + pl) continue; const s0 = clamp(s.s - pl / 2, 0, Math.max(0, l.P.len - pl)); for (let t = s0; t < s0 + pl; t += 10) { const a = NET.at(l.P, t), b = NET.at(l.P, Math.min(t + 10, s0 + pl)); stampSeg(a.x, a.y, b.x, b.y, l.kind === 'metro' ? 13 : l.kind === 'brt' ? 7 : 8, 1); } }
    }
    // arquitectura icónica: su huella (con 1,5 m de margen) queda reservada; nada genérico se monta encima
    const hits = this.HT ? this.hitosEn(X0, Y0, X0 + SZ, Y0 + SZ) : [];
    for (const H of hits) { const gx0 = Math.max(0, Math.floor((H.x0 - 2 - X0) / RES)), gx1 = Math.min(NG - 1, Math.floor((H.x1 + 2 - X0) / RES)), gy0 = Math.max(0, Math.floor((H.y0 - 2 - Y0) / RES)), gy1 = Math.min(NG - 1, Math.floor((H.y1 + 2 - Y0) / RES));
      for (let gy = gy0; gy <= gy1; gy++) for (let gx = gx0; gx <= gx1; gx++) { const j = gy * NG + gx; if (occ[j]) continue; const px = X0 + (gx + .5) * RES, py = Y0 + (gy + .5) * RES; if (this.dentroH(H, px, py) || this.dentroH(H, px + 1.5, py) || this.dentroH(H, px - 1.5, py) || this.dentroH(H, px, py + 1.5) || this.dentroH(H, px, py - 1.5)) occ[j] = 3; } }
    // casas y edificios reales (src/data/edificios.js); sin datos, se generan a lo largo de las calles como antes
    const ext = [], reales = this.edifRegion ? this.edifRegion(rx, ry, X0, Y0, NG, RES, occ, bs, ext, asf) : false;
    const tileAt = (x, y) => MAP.tile(Math.floor(x / TM), Math.floor(y / TM));
    // suelo donde se puede construir: manzanas, y vías o andenes de la rejilla de 20 m que la calle vectorial no ocupa
    const okS = v => v === TT.BRICK || v === TT.BLDG || v === TT.ROAD || v === TT.AVE || v === TT.WALK || v === TT.CICLO || v === TT.STEPS;
    const occAt = (x, y) => { const gx = Math.floor((x - X0) / RES), gy = Math.floor((y - Y0) / RES); return gx < 0 || gy < 0 || gx >= NG || gy >= NG ? 1 : occ[gy * NG + gx]; };
    const cx0 = rx * R, cy0 = ry * R, dentro = (x, y) => x >= cx0 && x < cx0 + R && y >= cy0 && y < cy0 + R;
    // ¿cabe un rectángulo (centro, medio frente, medio fondo, eje)? sobre suelo construible, sin vías ni otros edificios, entero en la región
    const cabe = (x, y, hw, hd, ux, uy) => {
      const sa = Math.min(2, hw), sb = Math.min(2, hd);
      for (let a = -hw; a <= hw + .01; a += sa) for (let d = -hd; d <= hd + .01; d += sb) { const px = x + ux * a - uy * d, py = y + uy * a + ux * d; if (!dentro(px, py) || occAt(px, py) || !okS(tileAt(px, py))) return false; }
      return true;
    };
    const ocupa = (x, y, hw, hd, ux, uy) => { const r = Math.hypot(hw, hd), gx0 = Math.max(0, Math.floor((x - r - X0) / RES)), gx1 = Math.min(NG - 1, Math.floor((x + r - X0) / RES)), gy0 = Math.max(0, Math.floor((y - r - Y0) / RES)), gy1 = Math.min(NG - 1, Math.floor((y + r - Y0) / RES));
      for (let gy = gy0; gy <= gy1; gy++) for (let gx = gx0; gx <= gx1; gx++) { const px = X0 + (gx + .5) * RES - x, py = Y0 + (gy + .5) * RES - y, a = px * ux + py * uy, d = -px * uy + py * ux; if (Math.abs(a) <= hw + .6 && Math.abs(d) <= hd + .6 && !occ[gy * NG + gx]) occ[gy * NG + gx] = 2; } };
    // ¿edificio o casa? lo dicen las casillas de alrededor (edificio en BLDG, casa en BRICK) o los pisos reales de la zona
    const tipo = (x, y) => { let e = 0, c = 0; for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) { const v = tileAt(x + i * TM, y + j * TM); if (v === TT.BLDG) e++; else if (v === TT.BRICK) c++; } if (e || c) return e > c; return MAP.bHeight(x, y, 3) > 14; };
    const altura = (x, y, ed, i) => ed ? clamp(MAP.bHeight(x, y, i), 9, 140) : 3.1 * (1 + (h2(x | 0, y | 0, 7) * (MAP.hg ? 2.6 : 2.2) | 0));
    const pon = (X, Y, hw, hd, ux, uy, ed, i) => { ocupa(X, Y, hw, hd, ux, uy); const h = altura(X, Y, ed, i), pis = Math.max(1, Math.round(h / 3.05)); bs.push({ x: X, y: Y, hw, hd, ux, uy, h, ed, pis, k: ed ? (pis >= 10 ? 2 : 1) : 0, P: null, ym: Y + Math.abs(uy) * hw + Math.abs(ux) * hd, s: h2(X | 0, Y | 0, 9) }); };
    // 1 · frentes: a lo largo de cada tramo de calle, carrera, avenida, peatonal y escalera, a ambos lados
    for (const c of cs) {
      if (c.k === 3 || c.k === 5) continue; const P = c.P, off0 = this.hw(c);
      if (!reales) for (let i = 2; i < P.length; i += 2) {
        const ax = P[i - 2], ay = P[i - 1], bx = P[i], by = P[i + 1], L = Math.hypot(bx - ax, by - ay); if (L < 6) continue;
        if (Math.max(ax, bx) + 40 < cx0 || Math.min(ax, bx) - 40 > cx0 + R || Math.max(ay, by) + 40 < cy0 || Math.min(ay, by) - 40 > cy0 + R) continue;
        const ux = (bx - ax) / L, uy = (by - ay) / L;
        for (const sd of [1, -1]) {
          const nx = -uy * sd, ny = ux * sd; let t = 1.5 + h2(ax | 0, ay | 0, 11 + sd) * 2;
          while (t < L - 3) {
            const mx = ax + ux * t, my = ay + uy * t, px = mx + nx * (off0 + 5), py = my + ny * (off0 + 5); if (!dentro(px, py) || !okS(tileAt(px, py)) || occAt(px, py)) { t += 3; continue; }
            const ed = tipo(px, py), torre = ed && MAP.bHeight(px, py, i) > 28, r = h2(mx | 0, my | 0, 5);
            let fw = ed ? (torre ? 18 + r * 12 : 11 + r * 9) : 5.5 + r * 4, fd = ed ? (torre ? 16 + r * 10 : 12 + r * 8) : 8 + h2(mx | 0, my | 0, 6) * 6; fw = Math.min(fw, L - t - .5); if (fw < 4) break;
            const back = ed ? (torre ? 3 + r * 3 : .8 + r * 1.5) : .3; let ok = false, D = fd, X = 0, Y = 0;
            for (const f of [1, .7, .5]) { D = fd * f; X = mx + ux * fw / 2 + nx * (off0 + back + D / 2); Y = my + uy * fw / 2 + ny * (off0 + back + D / 2); if (D >= 5 && cabe(X, Y, fw / 2, D / 2, ux, uy)) { ok = true; break; } }
            if (ok) {
              pon(X, Y, fw / 2, D / 2, ux, uy, ed, i);
              const D2 = ed ? 12 + r * 8 : 7 + r * 5, g2 = ed ? 6 : 1, X2 = X + nx * (D / 2 + g2 + D2 / 2), Y2 = Y + ny * (D / 2 + g2 + D2 / 2);   // segunda fila (espalda con espalda)
              if (cabe(X2, Y2, fw / 2, D2 / 2, ux, uy)) pon(X2, Y2, fw / 2, D2 / 2, ux, uy, ed, i + 1);
            }
            t += fw + (ed ? 2 + r * 4 : .15);
          }
        }
      }
      // árboles de avenida a lado y lado, sobre el andén, y en el separador central cuando la avenida es ancha
      if (c.k === 2) for (let i = 2; i < P.length; i += 2) { const ax = P[i - 2], ay = P[i - 1], bx = P[i], by = P[i + 1], L = Math.hypot(bx - ax, by - ay); if (L < 8) continue; const ux = (bx - ax) / L, uy = (by - ay) / L; for (let t = 6; t < L - 4; t += 13) { for (const sd of [1, -1]) { const x = ax + ux * t - uy * (c.w / 2 + 1.3) * sd, y = ay + uy * t + ux * (c.w / 2 + 1.3) * sd; if (dentro(x, y) && occAt(x, y) !== 2 && asf[Math.floor((y - Y0) / RES) * NG + Math.floor((x - X0) / RES)] !== 2 && tileAt(x, y) !== TT.WATER) trees.push(x, y, 2.6 + h2(x | 0, y | 0, 3) * 1.6, h2(x | 0, y | 0, 4) < .12 ? 1 : 0); } if (c.w >= 14 && ((t / 13 | 0) % 2 === 0)) { const mx = ax + ux * t, my = ay + uy * t; if (dentro(mx, my) && occAt(mx, my) !== 2 && tileAt(mx, my) !== TT.WATER) trees.push(mx, my, 2.3 + h2(mx | 0, my | 0, 8) * 1.3, h2(mx | 0, my | 0, 9) < .18 ? 1 : 0); } } }
    }
    // 2 · interior de las manzanas: rejilla con desfase, alineada con la calle más cercana
    if (!reales) for (let y = cy0 + 3; y < cy0 + R; y += 7) for (let x = cx0 + 3; x < cx0 + R; x += 7) {
      const jx = x + (h2(x, y, 51) - .5) * 4, jy = y + (h2(x, y, 52) - .5) * 4; if (occAt(jx, jy) || !okS(tileAt(jx, jy))) continue;
      const di = clamp(Math.floor((jy - Y0) / DR), 0, DN - 1) * DN + clamp(Math.floor((jx - X0) / DR), 0, DN - 1); if (dirD[di] > 70) continue;
      const an = dirA[di], ux = Math.cos(an), uy = Math.sin(an), ed = tipo(jx, jy), r = h2(x, y, 53);
      for (const f of [1, .75, .55]) { const hw = (ed ? 7 + r * 6 : 3 + r * 2) * f, hd = (ed ? 6 + r * 5 : 4 + r * 2.5) * f; if (hw < 2.2 || hd < 2.2) break; if (cabe(jx, jy, hw, hd, ux, uy)) { pon(jx, jy, hw, hd, ux, uy, ed, 77); break; } }
    }
    // árboles en parques y zonas verdes de la ciudad (no en la montaña, que tiene su propio dosel)
    const DENS = { poblado: .34, laureles: .2, pueblo: .1, mixto: .05, ladera: .035, centro: .015 };
    for (let y = cy0 + 4; y < cy0 + R; y += 9) for (let x = cx0 + 4; x < cx0 + R; x += 9) { const v = tileAt(x, y); if (occAt(x, y)) continue; let p = v === TT.GRASS ? .5 : v === TT.PLAZA ? .12 : 0;
      if (reales && (v === TT.BRICK || v === TT.BLDG)) p = this.enCampus && this.enCampus(x, y) ? .42 : DENS[this.zona(x, y)] || .04;
      if (p && h2(x, y, 21) < p) { const jx = x + (h2(x, y, 22) - .5) * 6, jy = y + (h2(x, y, 23) - .5) * 6; if (occAt(jx, jy) === 2) continue; trees.push(jx, jy, 2.4 + h2(x, y, 24) * 2.2, h2(x, y, 25) < .08 ? 1 : 0); } }
    // índice de edificios por celdas de 40 m (choques)
    const fis = ext.length ? bs.concat(ext) : bs, bins = new Map(); fis.forEach((b, i) => { const r = Math.hypot(b.hw, b.hd); for (let gy = Math.floor((b.y - r) / 40); gy <= Math.floor((b.y + r) / 40); gy++) for (let gx = Math.floor((b.x - r) / 40); gx <= Math.floor((b.x + r) / 40); gx++) { const k = gx * 8192 + gy; let a = bins.get(k); if (!a) bins.set(k, a = []); a.push(i); } });
    Rg = { bs, fis, trees, bins, occ, X0, Y0, NG, RES, hitos: hits.filter(H => !H.libre) };
    this.reg.set(key, Rg); while (this.reg.size > 30) this.reg.delete(this.reg.keys().next().value);
    return Rg;
  },
  /* ---------- física ---------- */
  regionAt(x, y) { return this.region(Math.floor(x / this.R), Math.floor(y / this.R)); },
  /* ¿choca un círculo de radio r en (x, y)? contra edificios, y contra el agua fuera de vías y puentes */
  solid(x, y, r = .4) {
    const Rg = this.regionAt(x, y), k = Math.floor(x / 40) * 8192 + Math.floor(y / 40);
    for (const i of Rg.bins.get(k) || []) { const b = (Rg.fis || Rg.bs)[i], dx = x - b.x, dy = y - b.y, a = dx * b.ux + dy * b.uy, d = -dx * b.uy + dy * b.ux; if (b.k === 10) continue; if (Math.abs(a) < b.hw + r && Math.abs(d) < b.hd + r && (!b.P || this.enPol(b.P, x, y, r))) return true; }
    for (const H of Rg.hitos) if (this.dentroH(H, x, y)) return true;
    if (this.enBase && this.enBase(x, y, r)) return true;
    const v = MAP.tile(Math.floor(x / TM), Math.floor(y / TM)); if (v === TT.WATER || v === TT.CANAL) { const gx = Math.floor((x - Rg.X0) / Rg.RES), gy = Math.floor((y - Rg.Y0) / Rg.RES); return !(gx >= 0 && gy >= 0 && gx < Rg.NG && gy < Rg.NG && Rg.occ[gy * Rg.NG + gx] === 1); }
    return false;
  },
  /* agarre del suelo para vehículos: vía 1, andén y plaza .7, pasto .55, montaña .4 */
  agarre(x, y) {
    const Rg = this.regionAt(x, y), gx = Math.floor((x - Rg.X0) / Rg.RES), gy = Math.floor((y - Rg.Y0) / Rg.RES); if (gx >= 0 && gy >= 0 && gx < Rg.NG && gy < Rg.NG && Rg.occ[gy * Rg.NG + gx] === 1) return 1;
    const v = MAP.tile(Math.floor(x / TM), Math.floor(y / TM)); return v === TT.MOUNT || v === TT.LAND ? .4 : v === TT.GRASS ? .55 : .7;
  },
  /* punto libre más cercano (fuera de edificios y agua; con calle, sobre la calzada o el andén), para poner carros, bicis, gente y al jugador */
  despeja(x, y, r = .6, calle = false, R = 60) {
    const ok = (px, py) => !this.solid(px, py, r) && (!calle || this.agarre(px, py) === 1); if (ok(x, y)) return { x, y };
    for (let d = 2; d <= R; d += 2) { const n = Math.ceil(d * TAU / 2.5); for (let i = 0; i < n; i++) { const a = i / n * TAU, px = x + Math.cos(a) * d, py = y + Math.sin(a) * d; if (ok(px, py)) return { x: px, y: py }; } }
    return { x, y };
  },
  /* punto libre para una cámara 3D (modo cine o tercera persona): fuera de edificios con margen de 2,4 m, con línea de vista hacia (tx, ty)
     y, si ningún punto cercano está despejado, elevando la cámara por encima del techo del edificio que estorbe */
  camaraLibre(x0, y0, tx, ty, z0) {
    if (!this.on) return { x: x0, y: y0, z: z0 };
    const vis = (px, py) => !this.solid(lerp(px, tx, .25), lerp(py, ty, .25), 1.2) && !this.solid(lerp(px, tx, .5), lerp(py, ty, .5), 1.2) && !this.solid(lerp(px, tx, .75), lerp(py, ty, .75), .9);
    const busca = (calle, conVis, R) => {
      const ok = (px, py) => !this.solid(px, py, 2.4) && (!calle || this.agarre(px, py) === 1) && (!conVis || vis(px, py));
      if (ok(x0, y0)) return { x: x0, y: y0 };
      for (let d = 2.5; d <= R; d += 2.5) { const n = Math.ceil(d * TAU / 3); for (let i = 0; i < n; i++) { const a = i / n * TAU, px = x0 + Math.cos(a) * d, py = y0 + Math.sin(a) * d; if (ok(px, py)) return { x: px, y: py }; } }
      return null;
    };
    const q = busca(true, true, 45) || busca(false, true, 65) || busca(false, false, 80) || { x: x0, y: y0 };
    let z = Math.max(z0, MAP.elevM(q.x, q.y) + 2.2);
    const Rg = this.regionAt(q.x, q.y), k = Math.floor(q.x / 40) * 8192 + Math.floor(q.y / 40);
    for (const i of Rg.bins.get(k) || []) { const b = (Rg.fis || Rg.bs)[i], dx = q.x - b.x, dy = q.y - b.y, a = dx * b.ux + dy * b.uy, d = -dx * b.uy + dy * b.ux; if (b.k !== 10 && Math.abs(a) < b.hw + 2.2 && Math.abs(d) < b.hd + 2.2) z = Math.max(z, MAP.elevM(b.x, b.y) + b.h + 2.5); }
    return { x: q.x, y: q.y, z };
  },
  /* rótulos de calle sobre la vía dibujada: por celda de 320 m, un rótulo por nombre (en el tramo más largo), girado con la calle */
  rot: new Map(),
  rotulos(cx, cy) {
    const key = cx * 4096 + cy; let r = this.rot.get(key); if (r) return r; const R = 320, x0 = cx * R, y0 = cy * R, best = new Map();
    for (const c of this.near(x0, y0, x0 + R, y0 + R)) {
      if (!c.nm || c.k === 5 || c.k === 7) continue; const P = c.P; let L = 0; for (let i = 2; i < P.length; i += 2) L += Math.hypot(P[i] - P[i - 2], P[i + 1] - P[i - 1]); if (L < 45) continue;
      let h = L / 2, i = 2; for (; i < P.length - 2; i += 2) { const d = Math.hypot(P[i] - P[i - 2], P[i + 1] - P[i - 1]); if (h <= d) break; h -= d; }
      const ax = P[i - 2], ay = P[i - 1], dx = P[i] - ax, dy = P[i + 1] - ay, d = Math.hypot(dx, dy) || 1, x = ax + dx * h / d, y = ay + dy * h / d; if (x < x0 || x >= x0 + R || y < y0 || y >= y0 + R) continue;
      let a = Math.atan2(dy, dx); if (a > Math.PI / 2) a -= Math.PI; if (a < -Math.PI / 2) a += Math.PI;
      const t = VIAS.nombres[c.nm - 1], pri = c.k === 3 ? 3 : c.k === 2 || /^(Avenida|Autopista|Vía|Doble|Troncal|Circular|Diagonal|Transversal)/.test(t) ? 2 : 1, o = best.get(t);
      if (!o || L > o.len) best.set(t, { x, y, a, t, pri, len: L });
    }
    r = [...best.values()].sort((p, q) => q.pri - p.pri || q.len - p.len); this.rot.set(key, r); while (this.rot.size > 60) this.rot.delete(this.rot.keys().next().value); return r;
  },
  /* postes de luz por celda de 320 m: cada ~32 m en avenidas y autopistas, cada ~45 m en carreras y algunas calles, sobre el andén */
  pos: new Map(),
  postes(cx, cy) {
    const key = cx * 4096 + cy; let r = this.pos.get(key); if (r) return r; r = []; const R = 320, x0 = cx * R, y0 = cy * R;
    for (const c of this.near(x0, y0, x0 + R, y0 + R)) { if (c.k > 4 || (c.k === 1 && c.i % 3)) continue; for (const P of this.partes(c)) { const paso = c.k === 2 || c.k === 3 ? 32 : 45; let acc = h2(c.i, 1, 7) * paso, lado = 1;
      for (let i = 2; i < P.length; i += 2) { const ax = P[i - 2], ay = P[i - 1], dx = P[i] - ax, dy = P[i + 1] - ay, L = Math.hypot(dx, dy) || 1; for (let t = paso - acc; t < L; t += paso) { const o = (c.w / 2 + .8) * lado, x = ax + dx * t / L - dy / L * o, y = ay + dy * t / L + dx / L * o; if (x >= x0 && x < x0 + R && y >= y0 && y < y0 + R) r.push(x, y); lado = -lado; } acc = (acc + L) % paso; } } }
    this.pos.set(key, r); while (this.pos.size > 60) this.pos.delete(this.pos.keys().next().value); return r;
  },
  /* halo de luz cálida (una sola imagen que se reusa en cada poste) */
  halo() { if (this._halo) return this._halo; const c = mkCanvas(64, 64), g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,214,140,1)'); gr.addColorStop(.35, 'rgba(255,204,120,.45)'); gr.addColorStop(1, 'rgba(255,200,120,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); return (this._halo = c); },
  /* nombre de la calle vectorial más cercana (a menos de 14 m), para el letrero cuando la capa oficial no lo trae */
  calle(x, y) { let best = null, bd = 14; for (const c of this.near(x - 14, y - 14, x + 14, y + 14)) { if (!c.nm || c.k === 5) continue; const P = c.P; for (let i = 2; i < P.length; i += 2) { const ax = P[i - 2], ay = P[i - 1], dx = P[i] - ax, dy = P[i + 1] - ay, t = clamp(((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy || 1), 0, 1), d = Math.hypot(ax + dx * t - x, ay + dy * t - y) - c.w / 2; if (d < bd) { bd = d; best = c; } } } return best ? VIAS.nombres[best.nm - 1] : ''; },
  /* un punto de andén (o de calle peatonal) cerca de (x, y): para que la gente camine por las aceras dibujadas */
  acera(x, y, rnd) {
    let best = null, bd = 32; for (const c of this.near(x - 32, y - 32, x + 32, y + 32)) { if (c.k === 3 || c.k === 5 || c.k === 7) continue; const P = c.P; for (let i = 2; i < P.length; i += 2) { if (c.pz && c.pz.has(i / 2)) continue; const ax = P[i - 2], ay = P[i - 1], dx = P[i] - ax, dy = P[i + 1] - ay, t = clamp(((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy || 1), 0, 1), d = Math.hypot(ax + dx * t - x, ay + dy * t - y); if (d < bd) { bd = d; best = [c, i, t]; } } }
    if (!best) return null; const [c, i, t] = best, P = c.P, ax = P[i - 2], ay = P[i - 1], dx = P[i] - ax, dy = P[i + 1] - ay, L = Math.hypot(dx, dy) || 1, sd = rnd() < .5 ? -1 : 1, off = c.k === 6 ? (rnd() - .5) * c.w * .6 : (c.w / 2 + 1.25) * sd;
    const q = { x: ax + dx * t - dy / L * off, y: ay + dy * t + dx / L * off, a: Math.atan2(dy, dx) + (sd < 0 ? Math.PI : 0) }; return this.solid(q.x, q.y, .3) ? null : q;
  },
  /* trozos por adelantado con el tiempo que le sobra al cuadro: hacia donde va la cámara y el nivel siguiente si se está alejando */
  prefetch(W, H, mx, my, k, vx = 0, vy = 0) {
    if (!this.on || !MAP.prisa || now() > MAP.prisa - .003) return; const L = this.pick(k), hw = W / 2 / k, hh = H / 2 / k, ax = clamp(vx * 1.6, -hw, hw), ay = clamp(vy * 1.6, -hh, hh);
    const cand = []; const mira = (L2, x0, y0, x1, y1) => { const S = L2.S; for (let cy = Math.floor(y0 / S); cy <= Math.floor(y1 / S); cy++) for (let cx = Math.floor(x0 / S); cx <= Math.floor(x1 / S); cx++) if (!this.cache[L2.i].has(cx * 4096 + cy)) cand.push([L2, cx, cy, Math.hypot((cx + .5) * S - mx - ax, (cy + .5) * S - my - ay)]); };
    mira(L, mx - hw + Math.min(0, ax) - L.S * .5, my - hh + Math.min(0, ay) - L.S * .5, mx + hw + Math.max(0, ax) + L.S * .5, my + hh + Math.max(0, ay) + L.S * .5);
    const L2 = this.L[L.i + 1]; if (!cand.length && L2 && k < L.k * 1.25) mira(L2, mx - hw * 1.3, my - hh * 1.3, mx + hw * 1.3, my + hh * 1.3);
    if (!cand.length) return; cand.sort((a, b) => a[3] - b[3]); const [L3, cx, cy] = cand[0], C = this.cache[L3.i]; C.set(cx * 4096 + cy, this.trozo(L3, cx, cy)); while (C.size > L3.max) C.delete(C.keys().next().value);
  },
  /* ---------- dibujo ---------- */
  pick(k) { const low = Save.d && Save.d.settings && Save.d.settings.q === 'low'; for (const L of this.L) if (k >= L.k * (low ? 1.3 : 1)) return L; return this.L[3]; },
  drawTop(g, W, H, mx, my, k, night = 0) {
    const L = this.pick(k), S = L.S, n = Math.round(S * L.sc), s = k / L.sc, x0 = mx - W / 2 / k, y0 = my - H / 2 / k, x1 = mx + W / 2 / k, y1 = my + H / 2 / k, C = this.cache[L.i];
    g.imageSmoothingEnabled = s < 1.6; MAP._vis = [];
    // primero el trozo donde está el centro, luego los demás: así lo que se ve primero está completo
    const lista = []; for (let cy = Math.floor(y0 / S); cy <= Math.floor(y1 / S); cy++) for (let cx = Math.floor(x0 / S); cx <= Math.floor(x1 / S); cx++) lista.push([cx, cy, Math.hypot((cx + .5) * S - mx, (cy + .5) * S - my)]);
    lista.sort((a, b) => a[2] - b[2]);
    for (const [cx, cy] of lista) {
      const key = cx * 4096 + cy, sx = Math.round((cx * S - x0) * k), sy = Math.round((cy * S - y0) * k), sw = Math.round(((cx + 1) * S - x0) * k) - sx, sh = Math.round(((cy + 1) * S - y0) * k) - sy;
      let c = C.get(key);
      if (!c) {
        if (MAP.prisa && MAP._hechos > 0 && now() > MAP.prisa) { this.relleno(g, L, cx, cy, sx, sy, sw, sh); MAP.pend = 1; continue; }
        c = this.trozo(L, cx, cy); C.set(key, c); MAP._hechos = (MAP._hechos || 0) + 1; while (C.size > L.max) C.delete(C.keys().next().value);
      } else { C.delete(key); C.set(key, c); }
      g.drawImage(c, 1, 1, n, n, sx, sy, sw, sh); MAP._vis.push([c, sx, sy, sw, sh]);   // el trozo trae 1 px de margen: sin costuras al escalar
    }
  },
  /* mientras se arma un trozo: el de menos detalle si está, o el color del suelo */
  relleno(g, L, cx, cy, sx, sy, sw, sh) {
    for (let j = L.i + 1; j < this.L.length; j++) { const L2 = this.L[j], r = L2.S / L.S, kx = Math.floor(cx / r), ky = Math.floor(cy / r); let c = this.cache[j].get(kx * 4096 + ky);
      // si no hay nada armado, el nivel más lejano se arma al momento (imagen de casillas y avenidas: pocos ms) y se usa de relleno
      if (!c && j === this.L.length - 1) { c = this.trozo(L2, kx, ky); this.cache[j].set(kx * 4096 + ky, c); while (this.cache[j].size > L2.max) this.cache[j].delete(this.cache[j].keys().next().value); }
      if (c) { const n2 = (c.width - 2) / r; g.drawImage(c, 1 + (cx - kx * r) * n2, 1 + (cy - ky * r) * n2, n2, n2, sx, sy, sw, sh); return; } }
    g.fillStyle = '#d3cdc0'; g.fillRect(sx, sy, sw, sh);
  },
  /* un trozo con su nivel de detalle */
  trozo(L, cx, cy) {
    // el trozo se dibuja por CPU (miles de figuras pequeñas: más rápido y parejo que en la tarjeta gráfica) y se pega como imagen
    const S = L.S, sc = L.sc, n = Math.round(S * sc), c = mkCanvas(n + 2, n + 2), g = c.getContext('2d', { willReadFrequently: this.sw }), X0 = cx * S - 1 / sc, Y0 = cy * S - 1 / sc;   // 1 px de margen alrededor
    this.suelo(g, n + 2, X0, Y0, S + 2 / sc, sc, L.d, false);
    g.setTransform(sc, 0, 0, sc, -X0 * sc, -Y0 * sc);
    if (L.d < 2 && this.suelosEsp) this.suelosEsp(g, X0, Y0, S + 2 / sc, sc, L.d);
    this.calles(g, X0, Y0, S + 2 / sc, sc, L.d);
    if (L.d < 2 && this.PG) { const I = (x, y) => ({ x, y }); this.puentesDib(g, I, sc, X0, Y0, X0 + S + 2 / sc, Y0 + S + 2 / sc, -1); }
    if (L.d < 2) this.estructuras(g, X0, Y0, S + 2 / sc, sc, L.d, c);
    if (L.d < 2 && this.PG) { const I = (x, y) => ({ x, y }); for (const z of [1, 2, 3]) this.puentesDib(g, I, sc, X0, Y0, X0 + S + 2 / sc, Y0 + S + 2 / sc, z); }
    g.setTransform(1, 0, 0, 1, 0, 0);
    return c;
  },
  /* piso de las vistas 3D (1.4.0): suelo, suelos especiales y calles de un cuadro de S m desde (X0, Y0), a sc píxeles por metro,
     sin edificios ni árboles (en 3D los edificios son cajas de verdad). Se arma por CPU, una vez por ventana */
  piso3D(X0, Y0, S, sc) {
    const n = Math.round(S * sc), c = mkCanvas(n, n), g = c.getContext('2d', { willReadFrequently: this.sw });
    this.suelo(g, n, X0, Y0, S, sc, 1, true); g.setTransform(sc, 0, 0, sc, -X0 * sc, -Y0 * sc); if (this.suelosEsp) this.suelosEsp(g, X0, Y0, S, sc, 1); this.calles(g, X0, Y0, S, sc, 1);
    if (this.PG) { const I = (x, y) => ({ x, y }); this.puentesDib(g, I, sc, X0, Y0, X0 + S, Y0 + S, -1); }
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.globalCompositeOperation = 'multiply'; g.fillStyle = '#c4c1bb'; g.fillRect(0, 0, n, n); g.globalCompositeOperation = 'source-over';   // en 3D el sol aclara: el piso va con tono uniforme sin granulado
    return c;
  },
  /* suelo con bordes suaves y sin leer píxeles: cada clase se rellena con su contorno de cuadrados marchantes sobre los centros
     de las casillas (las escaleras de 20 m quedan como diagonales y esquinas biseladas). El agua y los parques llevan borde. */
  // cuadrados marchantes: por caso, los vértices del polígono interior (0 esq. sup. izq., 1 arriba, 2 esq. sup. der., 3 derecha, 4 esq. inf. der., 5 abajo, 6 esq. inf. izq., 7 izquierda)
  MS: [null, [7, 5, 6], [5, 3, 4], [7, 3, 4, 6], [1, 2, 3], [1, 2, 3, 5, 6, 7], [1, 2, 4, 5], [1, 2, 4, 6, 7], [0, 1, 7], [0, 1, 5, 6], [0, 1, 3, 4, 5, 7], [0, 1, 3, 4, 6], [0, 2, 3, 7], [0, 2, 3, 5, 6], [0, 2, 4, 5, 7], [0, 2, 4, 6]],
  RGB: { 1: [74, 122, 66], 13: [74, 122, 66], 0: [124, 170, 92], 9: [124, 170, 92], 2: [196, 160, 138], 3: [168, 166, 164], 10: [219, 208, 182], 8: [56, 132, 182], 15: [138, 128, 112] },
  suelo(g, n, X0, Y0, S, sc, lod, es3D = false) {
    const tx0 = Math.floor(X0 / TM) - 1, ty0 = Math.floor(Y0 / TM) - 1, TN = Math.ceil(S / TM) + 3, H = TM / 2, MS = this.MS;
    const tiles = new Uint8Array(TN * TN); for (let j = 0; j < TN; j++) for (let i = 0; i < TN; i++) tiles[j * TN + i] = MAP.tile(tx0 + i, ty0 + j);
    if (lod === 2) {   // de muy lejos (4 px por casilla): la imagen de casillas ampliada con suavizado, sin figuras
      const sm = mkCanvas(TN, TN), sg = sm.getContext('2d'), im = sg.createImageData(TN, TN), base = [211, 205, 192];
      for (let i = 0; i < TN * TN; i++) { const c = this.RGB[tiles[i]] || base, j = (Math.floor(i / TN) * TN + i % TN) * 4, x = (tx0 + i % TN + .5) * TM, y = (ty0 + Math.floor(i / TN) + .5) * TM, e = MAP.elevM(x, y), sh = clamp(1 + (MAP.elevM(x - 40, y - 40) - e) * .008, .7, 1.2); im.data[j] = clamp(c[0] * sh, 0, 255); im.data[j + 1] = clamp(c[1] * sh, 0, 255); im.data[j + 2] = clamp(c[2] * sh, 0, 255); im.data[j + 3] = 255; }
      sg.putImageData(im, 0, 0); g.imageSmoothingEnabled = true; const ts = TM * sc; g.drawImage(sm, (tx0 * TM - X0) * sc, (ty0 * TM - Y0) * sc, TN * ts, TN * ts); return;
    }
    g.fillStyle = '#d3cdc0'; g.fillRect(0, 0, n, n);   // piso urbano (andenes, patios y antejardines)
    g.setTransform(sc, 0, 0, sc, -X0 * sc, -Y0 * sc); g.lineJoin = 'round';
    // forma de una clase de suelo. Con suave, el campo se difumina (3×3 binomial) y el borde pasa por donde vale ½: esquinas redondas;
    // lo que queda muy chico para el campo difuminado (una o dos casillas) se pinta como cuadro de esquinas redondas
    const forma = (test, suave) => {
      const m = new Uint8Array(TN * TN); let any = 0; for (let i = 0; i < TN * TN; i++) if (test(tiles[i])) { m[i] = 1; any = 1; } if (!any) return false;
      let f = m; if (suave) { f = new Float32Array(TN * TN); const M = (i, j) => m[clamp(j, 0, TN - 1) * TN + clamp(i, 0, TN - 1)]; for (let j = 0; j < TN; j++) for (let i = 0; i < TN; i++) f[j * TN + i] = (4 * M(i, j) + 2 * (M(i - 1, j) + M(i + 1, j) + M(i, j - 1) + M(i, j + 1)) + M(i - 1, j - 1) + M(i + 1, j - 1) + M(i - 1, j + 1) + M(i + 1, j + 1)) / 16; }
      const t = (u, v) => u === v ? .5 : clamp((.5 - u) / (v - u), 0, 1);
      g.beginPath();
      for (let j = 0; j < TN - 1; j++) for (let i = 0, run = -1; i < TN; i++) {
        const A = i < TN - 1 ? f[j * TN + i] : 0, B = i < TN - 1 ? f[j * TN + i + 1] : 0, C = i < TN - 1 ? f[(j + 1) * TN + i + 1] : 0, D = i < TN - 1 ? f[(j + 1) * TN + i] : 0, c = (A >= .5) * 8 + (B >= .5) * 4 + (C >= .5) * 2 + (D >= .5);
        // celdas llenas seguidas: una sola franja (menos figuras que dibujar)
        if (c === 15) { if (run < 0) run = i; continue; } if (run >= 0) { const xa = (tx0 + run + .5) * TM, xb = (tx0 + i + .5) * TM, ya = (ty0 + j + .5) * TM, yb = ya + TM; g.moveTo(xa, ya); g.lineTo(xb, ya); g.lineTo(xb, yb); g.lineTo(xa, yb); g.closePath(); run = -1; }
        if (!c || i >= TN - 1) continue;
        const x = (tx0 + i + .5) * TM, y = (ty0 + j + .5) * TM, V = MS[c];
        for (let q = 0; q < V.length; q++) { const v = V[q]; let px, py;
          switch (v) { case 0: px = 0; py = 0; break; case 1: px = t(A, B); py = 0; break; case 2: px = 1; py = 0; break; case 3: px = 1; py = t(B, C); break; case 4: px = 1; py = 1; break; case 5: px = t(D, C); py = 1; break; case 6: px = 0; py = 1; break; default: px = 0; py = t(A, D); }
          q ? g.lineTo(x + px * TM, y + py * TM) : g.moveTo(x + px * TM, y + py * TM); }
        g.closePath();
      }
      if (suave) for (let j = 1; j < TN - 1; j++) for (let i = 1; i < TN - 1; i++) if (m[j * TN + i] && f[j * TN + i] < .5) { const x = (tx0 + i) * TM + 2, y = (ty0 + j) * TM + 2; g.moveTo(x + 5, y); g.arcTo(x + 16, y, x + 16, y + 16, 5); g.arcTo(x + 16, y + 16, x, y + 16, 5); g.arcTo(x, y + 16, x, y, 5); g.arcTo(x, y, x + 16, y, 5); g.closePath(); }
      return true; };
    const capa = (test, col, borde, bw, suave) => { if (!forma(test, suave)) return; if (borde && lod < 2) { g.strokeStyle = borde; g.lineWidth = bw; g.stroke(); } g.fillStyle = col; g.fill(); };
    capa(v => v === TT.MOUNT || v === TT.LAND, '#4a7a42', '#3d6838', 3, true);
    capa(v => v === TT.GRASS || v === TT.CANAL, '#7caa5c', '#5f8f48', 1.6, true);
    if (lod === 2) { capa(v => v === TT.BRICK, '#c4a08a', null, 0, true); capa(v => v === TT.BLDG, '#a8a6a4', null, 0, true); }   // de lejos, la trama de casas y edificios
    capa(v => v === TT.PLAZA, '#dbd0b6', '#b9ab8c', 1, true);
    capa(v => v === TT.DEPOT, '#8a8070', '#6f665a', 1, true);
    capa(v => v === TT.WATER, '#3884b6', '#969286', 5, false);   // el agua sin difuminar: un cauce de una casilla no se corta
    // monte: copas de árbol sobre el dosel (cerca), y brillos del agua
    if (lod === 0) {
      for (let j = 1; j < TN - 1; j++) for (let i = 1; i < TN - 1; i++) {
        const v = tiles[j * TN + i], X = tx0 + i, Y = ty0 + j;
        if (v === TT.MOUNT || v === TT.LAND) for (let q = 0; q < 3; q++) { const x = (X + .15 + h2(X, Y, 30 + q) * .7) * TM, y = (Y + .15 + h2(X, Y, 40 + q) * .7) * TM, r = 3.2 + h2(X, Y, 20 + q) * 3; g.fillStyle = 'rgba(20,40,22,.35)'; g.beginPath(); g.arc(x + r * .4, y + r * .45, r, 0, TAU); g.fill(); g.fillStyle = ['#3f7a3a', '#4b8640', '#3a7246', '#56883c'][(h2(X, Y, 50 + q) * 4) | 0]; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); g.fillStyle = 'rgba(160,200,110,.35)'; g.beginPath(); g.arc(x - r * .3, y - r * .35, r * .45, 0, TAU); g.fill(); }
        else if (v === TT.WATER && h2(X, Y, 61) < .5) { const x = (X + h2(X, Y, 62)) * TM, y = (Y + h2(X, Y, 63)) * TM; g.strokeStyle = 'rgba(220,240,255,.45)'; g.lineWidth = .5; g.beginPath(); g.moveTo(x - 2.5, y); g.quadraticCurveTo(x, y - 1, x + 2.5, y); g.stroke(); }
      }
    }
    g.setTransform(1, 0, 0, 1, 0, 0);
    // relieve: sombreado de laderas (luz del noroeste) desde la rejilla de elevación en 2D; en 3D la malla ya sombrea con la normal suave del terreno
    if (!es3D) { const ts = TM * sc, dx = (tx0 * TM - X0) * sc, dy = (ty0 * TM - Y0) * sc, E = (x, y) => MAP.elevM(x, y), sh = mkCanvas(TN, TN), shg = sh.getContext('2d'), im = shg.createImageData(TN, TN); let any = 0;
      for (let j = 0; j < TN; j++) for (let i = 0; i < TN; i++) { const x = (tx0 + i + .5) * TM, y = (ty0 + j + .5) * TM, d = (E(x - 30, y - 30) - E(x + 30, y + 30)) * .012, o = (j * TN + i) * 4; if (Math.abs(d) < .02) continue; any = 1; if (d < 0) { im.data[o + 3] = Math.min(110, -d * 300); } else { im.data[o] = im.data[o + 1] = im.data[o + 2] = 255; im.data[o + 3] = Math.min(60, d * 160); } }
      if (any) { shg.putImageData(im, 0, 0); g.imageSmoothingEnabled = true; g.drawImage(sh, 0, 0, TN, TN, dx + ts / 2, dy + ts / 2, TN * ts, TN * ts); } }
    // quebradas: canal de concreto y lámina de agua entre los centros de sus casillas, dentro de su retiro verde
    g.setTransform(sc, 0, 0, sc, -X0 * sc, -Y0 * sc); g.lineCap = g.lineJoin = 'round';
    for (const [col, lw] of [['#989286', 4.2], ['#3f8fc4', 2.6]]) {
      g.strokeStyle = col; g.lineWidth = lw; g.beginPath();
      for (let j = 1; j < TN - 1; j++) for (let i = 1; i < TN - 1; i++) { if (tiles[j * TN + i] !== TT.CANAL) continue; const x = (tx0 + i + .5) * TM, y = (ty0 + j + .5) * TM; let solo = 1;
        for (const [a, b] of [[1, 0], [0, 1], [1, 1], [-1, 1]]) { const u = tiles[(j + b) * TN + i + a]; if (u === TT.CANAL || u === TT.WATER) { if (a && b && (tiles[j * TN + i + a] === TT.CANAL || tiles[(j + b) * TN + i] === TT.CANAL)) continue; g.moveTo(x, y); g.lineTo(x + a * TM, y + b * TM); solo = 0; } }
        if (solo) { g.moveTo(x - 4, y); g.lineTo(x + 4, y); } }
      g.stroke();
    }
    g.setTransform(1, 0, 0, 1, 0, 0);
  },
  /* desplaza una polilínea a un lado (normal promediada en cada vértice) */
  offset(P, d) { const n = P.length / 2, Q = new Float32Array(P.length); for (let i = 0; i < n; i++) { const a = Math.max(0, i - 1), b = Math.min(n - 1, i + 1), dx = P[2 * b] - P[2 * a], dy = P[2 * b + 1] - P[2 * a + 1], L = Math.hypot(dx, dy) || 1; Q[2 * i] = P[2 * i] - dy / L * d; Q[2 * i + 1] = P[2 * i + 1] + dx / L * d; } return Q; },
  /* calles: sardinel, andén, asfalto, separadores arborizados, mobiliario y cebras */
  calles(g, X0, Y0, S, sc, lod) {
    const cs = this.near(X0 - 40, Y0 - 40, X0 + S + 40, Y0 + S + 40), path = P => { g.moveTo(P[0], P[1]); for (let i = 2; i < P.length; i += 2) g.lineTo(P[i], P[i + 1]); };
    const run = (f, wf, col, dash) => { g.strokeStyle = col; g.setLineDash(dash || []); for (const c of cs) { if (!f(c)) continue; g.lineWidth = wf(c); g.beginPath(); for (const Q of this.partes(c)) path(Q); g.stroke(); } g.setLineDash([]); };
    g.lineJoin = 'round'; g.lineCap = 'round';
    const veh = c => c.k <= 4, urb = c => c.k === 1 || c.k === 2 || c.k === 4;
    if (lod < 2) {
      // peatonales y escaleras (debajo de las calles)
      run(c => c.k === 6, c => c.w + 1.2, '#a59d8b'); run(c => c.k === 6, c => c.w, '#e8e0cc');
      run(c => c.k === 7, c => c.w + 1, '#9a917e'); run(c => c.k === 7, c => c.w, '#d3c9b2'); if (lod === 0) run(c => c.k === 7, c => c.w * .9, '#a99d84', [.35, .55]);
      // andén con sardinel
      run(urb, c => c.w + 6.2, '#9a958a'); run(urb, c => c.w + 5.2, '#d9d4c8');
      run(c => c.k === 3, c => c.w + 3.4, '#8f8b82');
    }
    // asfalto por jerarquía (las mayores encima); de muy lejos solo avenidas, autopistas y carreras, un poco más anchas para que se lean
    for (const k of lod === 2 ? [4, 2, 3] : [1, 4, 2, 3]) run(c => c.k === k, c => lod === 2 ? Math.max(c.w, 9) : c.w, k === 3 ? '#3e434b' : k === 2 ? '#454a52' : '#4d525a');
    if (lod === 2) return;
    // separador central verde con sardinel en avenidas y autopistas de doble calzada
    run(c => (c.k === 2 && c.w >= 13) || (c.k === 3 && c.w >= 14), () => 2.1, '#9a958a');
    run(c => (c.k === 2 && c.w >= 13) || (c.k === 3 && c.w >= 14), () => 1.4, '#5e964b');
    // ciclorrutas
    run(c => c.k === 5, c => c.w + .6, '#e9e6dc'); run(c => c.k === 5, c => c.w, '#2e9d55');
    // marcas: borde y carriles en avenidas y autopistas, línea de centro en carreras, punteada en calles anchas
    g.lineCap = 'butt';
    for (const c of cs) {
      if (!veh(c) || c.P.length < 4) continue;
      if (c.k === 2 || c.k === 3) {
        const nl = Math.max(2, Math.round(c.w / 3.5)); g.strokeStyle = '#efede5'; g.lineWidth = .22;
        for (const Q of this.partes(c)) { if (Q.length < 4) continue;
          for (const s of [-1, 1]) { g.beginPath(); path(this.offset(Q, s * (c.w / 2 - .5))); g.stroke(); }
          g.setLineDash([3, 5]); for (let i = 1; i < nl; i++) { if (((c.k === 2 && c.w >= 13) || (c.k === 3 && c.w >= 14)) && Math.abs(-c.w / 2 + i * c.w / nl) < 1.2) continue; g.beginPath(); path(this.offset(Q, -c.w / 2 + i * c.w / nl)); g.stroke(); } g.setLineDash([]);
          if (c.k === 3) { g.strokeStyle = '#e8c64a'; g.lineWidth = .25; g.beginPath(); path(this.offset(Q, -(c.w / 2 - .9))); g.stroke(); g.strokeStyle = '#efede5'; g.lineWidth = .22; } }
      } else if (c.k === 4 || c.w >= 8) { g.strokeStyle = c.k === 4 ? '#e8c64a' : '#e7e5dd'; g.lineWidth = .2; g.setLineDash(c.k === 4 ? [] : [2.5, 4]); g.beginPath(); for (const Q of this.partes(c)) path(Q); g.stroke(); g.setLineDash([]); }
      // mobiliario de andén de cerca: bancas de madera y paraderos con techo en avenidas y carreras
      if (lod === 0 && (c.k === 2 || c.k === 4)) {
        for (const Q of this.partes(c)) for (let i = 2; i < Q.length; i += 2) {
          const ax = Q[i - 2], ay = Q[i - 1], dx = Q[i] - ax, dy = Q[i + 1] - ay, L = Math.hypot(dx, dy); if (L < 36) continue;
          const ux = dx / L, uy = dy / L, an = Math.atan2(uy, ux), sd = (c.i + i) % 2 ? 1 : -1, off = c.w / 2 + 1.65;
          const mx = ax + dx * .5 - uy * off * sd, my = ay + dy * .5 + ux * off * sd;
          if (mx < X0 || mx > X0 + S || my < Y0 || my > Y0 + S) continue;
          g.save(); g.translate(mx, my); g.rotate(an);
          if (c.k === 2 && L > 55 && (c.i % 3 === 0)) { g.fillStyle = 'rgba(20,28,38,.22)'; g.fillRect(-1.9, -.4, 4.2, 1.4); g.fillStyle = '#2d637f'; g.fillRect(-2.1, -.6, 4.2, 1.2); g.fillStyle = '#89b8d0'; g.fillRect(-1.8, -.4, 3.6, .35); }
          else { g.fillStyle = '#7c5333'; g.fillRect(-.9, -.28, 1.8, .56); }
          g.restore();
        }
      }
    }
    // cebras en los cruces con semáforo (VM.lights): a lado y lado del cruce, de borde a borde de cada calle
    if (lod === 0 && VM.lights) {
      g.strokeStyle = '#eeece4'; g.lineWidth = .55;
      for (const [a, b] of VM.lights) {
        const lx = a * TM / 4, ly = b * TM / 4; if (lx < X0 - 30 || ly < Y0 - 30 || lx > X0 + S + 30 || ly > Y0 + S + 30) continue;
        for (const c of cs) {
          if (!veh(c)) continue; const P = c.P; let bd = 14, bi = -1, bt = 0;
          for (let i = 2; i < P.length; i += 2) { const ax = P[i - 2], ay = P[i - 1], dx = P[i] - ax, dy = P[i + 1] - ay, t = clamp(((lx - ax) * dx + (ly - ay) * dy) / (dx * dx + dy * dy || 1), 0, 1), d = Math.hypot(ax + dx * t - lx, ay + dy * t - ly); if (d < bd) { bd = d; bi = i; bt = t; } }
          if (bi < 0) continue; const ax = P[bi - 2], ay = P[bi - 1], dx = P[bi] - ax, dy = P[bi + 1] - ay, L = Math.hypot(dx, dy); if (L < 1) continue; const ux = dx / L, uy = dy / L, cx2 = ax + dx * bt, cy2 = ay + dy * bt, hw = c.w / 2 - .4;
          for (const sd of [-1, 1]) { const zx = cx2 + ux * (9 + c.w * .3) * sd, zy = cy2 + uy * (9 + c.w * .3) * sd; g.beginPath(); for (let q = -hw + .4; q <= hw - .2; q += 1.1) { const px = zx - uy * q, py = zy + ux * q; g.moveTo(px - ux * 1.6, py - uy * 1.6); g.lineTo(px + ux * 1.6, py + uy * 1.6); } g.stroke(); }
        }
      }
    }
    g.lineCap = 'round';
  },
  /* casas, edificios y árboles de las regiones que tocan el trozo (con su volumen hacia arriba) */
  estructuras(g, X0, Y0, S, sc, lod, cv) {
    // de lejos (lod 1) con datos reales no se arma la región entera (física, recorte, árboles): basta con las huellas
    // leídas del binario, sin las que caen en la calle; los árboles salen de las casillas. Así un trozo de 640 m cuesta poco.
    const ob = this.ob, top = 150 * ob, rs = [], lejos = lod === 1 && !!this.ED, L1 = [];
    for (let ry = Math.floor((Y0 - 30) / this.R); ry <= Math.floor((Y0 + S + top + 30) / this.R); ry++) for (let rx = Math.floor((X0 - 30) / this.R); rx <= Math.floor((X0 + S + 30) / this.R); rx++) { if (!lejos) { rs.push(this.region(rx, ry)); continue; } const Rg = this.reg.get(rx * 4096 + ry); if (Rg) rs.push(Rg); else L1.push(this.edifDe(rx, ry)); }
    const vis = b => { const r = b.hw + b.hd; return b.x + r > X0 - 4 && b.x - r < X0 + S + 4 && b.y + r > Y0 - 4 && b.y - r - b.h * ob < Y0 + S + 4; };
    const B = []; for (const Rg of rs) for (const b of Rg.bs) if (vis(b)) B.push(b);
    for (const L of L1) for (const b of L) { if (b.rec === false || !vis(b)) continue; if (b.rec === undefined && this.enSegs(this.segsCerca(b.x, b.y, 1), b.x, b.y)) continue; B.push(b); }
    const HS = this.HT ? this.hitosEn(X0 - 30, Y0 - 30, X0 + S + 30, Y0 + S + 190 * ob) : [];
    for (const H of HS) this.hitoSuelo(g, H, lod, cv);   // plazas y parques especiales, a ras de piso
    for (const H of HS) B.push({ hito: H, ym: H.y1, y: H.y1, x: H.cx, ux: 0, uy: 0, hw: 0, hd: 0, h: 0 });
    B.sort((a, b) => a.ym - b.ym);   // de atrás hacia adelante: el borde de abajo de cada huella
    // sombras (sol de la tarde): una sola pasada, debajo de todo
    g.fillStyle = 'rgba(16,22,34,.24)'; g.beginPath();
    for (const H of HS) if (!H.libre) this.sombra(g, H);
    for (const b of B) if (!b.hito && (lod !== 1 || b.h > 4.5)) this.sombraEd(g, b, lod === 1);   // de lejos, la sombra de una casa de un piso no alcanza un píxel
    g.fill();
    // árboles bajos antes que los edificios del frente
    const T = []; for (const Rg of rs) for (let i = 0; i < Rg.trees.length; i += 4) { const x = Rg.trees[i], y = Rg.trees[i + 1]; if (x > X0 - 6 && x < X0 + S + 6 && y > Y0 - 6 && y < Y0 + S + 10) T.push(Rg.trees, i); }
    if (L1.length) { const A = this.arbolesLejos(X0, Y0, S, B); for (let i = 0; i < A.length; i += 4) T.push(A, i); }
    g.fillStyle = 'rgba(16,30,20,.3)'; g.beginPath(); for (let q = 0; q < T.length; q += 2) { const A = T[q], i = T[q + 1], x = A[i] + A[i + 2] * .5, y = A[i + 1] + A[i + 2] * .35, r = A[i + 2]; g.moveTo(x + r, y); g.arc(x, y, r, 0, TAU); } g.fill();   // sombras de todos los árboles, en una pasada
    if (lod === 1) this.edifLejos(g, B, ob, cv);   // de lejos: casas en lote por color, edificios uno por uno
    else for (const b of B) { if (b.hito) this.hito(g, b.hito, lod, cv); else this.dibEd(g, b, sc); }
    // copas de los árboles (encima de su sombra; los guayacanes florecen amarillo o rosado)
    { const cop = [new Path2D(), new Path2D(), new Path2D(), new Path2D()];   // copas por color, en cuatro pasadas
      for (let q = 0; q < T.length; q += 2) { const A = T[q], i = T[q + 1], x = A[i], y = A[i + 1], r = A[i + 2], fl = A[i + 3], c = fl ? (h2(x | 0, y | 0, 5) < .5 ? 2 : 3) : 1; cop[0].moveTo(x + r, y - 1.6); cop[0].arc(x, y - 1.6, r, 0, TAU); const r2 = r * .74, cx = x - r * .2, cy = y - 1.6 - r * .25; cop[c].moveTo(cx + r2, cy); cop[c].arc(cx, cy, r2, 0, TAU); }
      ['#2f5b2f', '#4f8a45', '#f0c13a', '#e78bb8'].forEach((c, i) => { g.fillStyle = c; g.fill(cop[i]); }); }
    // luces de ventanas para la noche (capa aparte, se arma cuando hace falta)
    cv.lights = (cv.lights || []).concat(B.filter(b => !b.hito && b.h > 6 && b.s > .3).map(b => [b.x, b.y - b.h * ob * .5, b.hw, b.h])); cv.X0 = X0; cv.Y0 = Y0; cv.sc = sc;
  },
  /* árboles de lejos sin armar la región: parques y, en las manzanas, según la zona (van debajo de los edificios) */
  arbolesLejos(X0, Y0, S, B) {
    const out = [], DENS = { poblado: .34, laureles: .2, pueblo: .1, mixto: .05, ladera: .035, centro: .015 }, C = 4, N = Math.ceil(S / C) + 2, oc = new Uint8Array(N * N);
    for (const b of B) { if (b.hito) continue; const r = Math.max(b.hw, b.hd) + .5, i0 = Math.max(0, Math.floor((b.x - r - X0) / C)), i1 = Math.min(N - 1, Math.floor((b.x + r - X0) / C)), j0 = Math.max(0, Math.floor((b.y - r - Y0) / C)), j1 = Math.min(N - 1, Math.floor((b.y + r - Y0) / C)); for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) oc[j * N + i] = 1; }
    for (let y = Math.floor(Y0 / 9) * 9 + 4; y < Y0 + S; y += 9) for (let x = Math.floor(X0 / 9) * 9 + 4; x < X0 + S; x += 9) { const v = MAP.tile(Math.floor(x / TM), Math.floor(y / TM)); let p = v === TT.GRASS ? .5 : v === TT.PLAZA ? .12 : (v === TT.BRICK || v === TT.BLDG) ? DENS[this.zona(x, y)] || .04 : 0;
      if (!p || h2(x, y, 21) >= p) continue; const jx = x + (h2(x, y, 22) - .5) * 6, jy = y + (h2(x, y, 23) - .5) * 6, gi = Math.floor((jx - X0) / C), gj = Math.floor((jy - Y0) / C); if (gi >= 0 && gj >= 0 && gi < N && gj < N && oc[gj * N + gi]) continue; out.push(jx, jy, 2.4 + h2(x, y, 24) * 2.2, h2(x, y, 25) < .08 ? 1 : 0); }
    return out;
  },
  luces(c) {
    if (c.lightCv) return c.lightCv; const n = c.width, lc = mkCanvas(n, n), g = lc.getContext('2d'); g.setTransform(c.sc, 0, 0, c.sc, -c.X0 * c.sc, -c.Y0 * c.sc);
    for (const [x, y, r] of c.glow || []) { const gr = g.createRadialGradient(x, y, 0, x, y, r * 2.2); gr.addColorStop(0, 'rgba(255,236,190,.95)'); gr.addColorStop(1, 'rgba(255,220,160,0)'); g.fillStyle = gr; g.fillRect(x - r * 2.2, y - r * 2.2, r * 4.4, r * 4.4); }
    for (const [x, y, w, h] of c.lights || []) { const r = h2(x | 0, y | 0, 41); if (r > .7) continue; g.fillStyle = `rgba(255,${200 + (r * 70 | 0)},120,${.55 + r * .4})`; const nn = Math.max(1, Math.round(h / 6)); for (let i = 0; i < nn; i++) if (h2(x | 0, i, 42) < .55) g.fillRect(x - w * .5 + h2(x | 0, i, 43) * w, y - h * .15 + i * .9, .9, .6); }
    return (c.lightCv = lc);
  },
  lightsTop(g, night, t) {
    if (night < .25 || !MAP._vis) return; g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = clamp(night * (.85 + .15 * Math.sin(t * 1.7)), 0, 1);
    for (const [c, sx, sy, sw, sh] of MAP._vis) if ((c.lights && c.lights.length) || (c.glow && c.glow.length)) g.drawImage(this.luces(c), 1, 1, c.width - 2, c.height - 2, sx, sy, sw, sh);
    g.restore();
  }
};
