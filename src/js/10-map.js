/* =====================================================================
   MAPA REAL DEL VALLE DE ABURRÁ (de Caldas a Barbosa) · casillas de 20 m
   Datos de Juega EnCicla: calles, río, quebradas, parques, municipios y relieve.
   Unidad del mundo: METROS. x = este, y = sur. Fila 0 = norte.
   ===================================================================== */
const VM = VALLE_META, MW = VM.W, MH = VM.H, TM = VM.tile, ES = VM.es;
const TT = { GRASS: 0, MOUNT: 1, BRICK: 2, BLDG: 3, ROAD: 4, AVE: 5, WALK: 6, CICLO: 7, WATER: 8, CANAL: 9, PLAZA: 10, BRIDGE: 11, STATION: 12, LAND: 13, AUTO: 14, DEPOT: 15, STEPS: 16 };
const TCOL = ['#6f9a4a', '#3d6838', '#b4583a', '#8d97a4', '#4b5059', '#3f444d', '#bdb6a5', '#3f9a50', '#3a87a8', '#4b7f8c', '#d9cdae', '#6d6f75', '#f4ecd0', '#a99a7a', '#34383f', '#8a8072', '#a39882'];
const TRGB = TCOL.map(c => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)]);
const geoM = (lat, lon) => ({ x: (lon - VM.lon0) * VM.kx * TM, y: (VM.latN - lat) * VM.ky * TM });
const mGeo = (x, y) => ({ lat: VM.latN - y / TM / VM.ky, lon: VM.lon0 + x / TM / VM.kx });

const MAP = EM.map = {
  t: null, E: null, ready: false, chunks: new Map(), CH: 32, PX: 16,
  async load() {
    const bin = atob(VALLE_BIN), u8 = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
    const nT = MW * MH, nE = VM.eW * VM.eH, nM = VM.mW * VM.mH, size = nT + nE * 2 + nM * 2;
    let raw = null;
    if (window.DecompressionStream) { try { raw = new Uint8Array(await new Response(new Blob([u8]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer()); } catch (e) { raw = null; } }
    if (!raw || raw.length < size) raw = inflateRaw(u8, size);
    this.t = raw.slice(0, nT);
    const ed = new Int16Array(raw.slice(nT, nT + nE * 2).buffer), E = this.E = new Int16Array(nE);
    for (let j = 0; j < VM.eH; j++) { let a = 0; for (let i = 0; i < VM.eW; i++) { a += ed[j * VM.eW + i]; E[j * VM.eW + i] = a; } }
    this.mu = raw.slice(nT + nE * 2, nT + nE * 2 + nM); this.co = raw.slice(nT + nE * 2 + nM, nT + nE * 2 + nM * 2);
    if (typeof CIUDAD !== 'undefined') { try { await this.ciudad(); } catch (e) { EM.errors.push('ciudad: ' + e.message); console.error(e); } }
    if (typeof AJUSTES !== 'undefined' && typeof CIUDAD !== 'undefined' && !window.__sinAjustes) { try { await this.ajustes(); } catch (e) { EM.errors.push('ajustes: ' + e.message); console.error(e); } }
    this.ready = true;
  },
  /* ---------- MEDELLÍN RECONOCIBLE · datos oficiales abiertos (src/data/ciudad.js, de tools/ciudad_datos.py) ----------
     1) parche: los 'andenes' que en realidad son lotes dentro de manzanas pasan a casa o edificio; parques y plazas reales;
     2) barrios (grilla de 80 m); 3) nombre de calle por casilla de vía (nomenclatura y nombre popular); 4) lotes por casilla. */
  async unz(b64, n) {
    const bin = atob(b64), u8 = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
    let r = null; if (window.DecompressionStream) { try { r = new Uint8Array(await new Response(new Blob([u8]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer()); } catch (e) { r = null; } }
    return r && r.length >= n ? r : inflateRaw(u8, n);
  },
  async ciudad() {
    const C = CIUDAD, t = this.t, n = MW * MH, P = C.parche, pb = await this.unz(P.data, P.bytes);
    let wi = 0, pi = 0, ch = 0;
    for (let i = 0; i < n; i++) if (t[i] === TT.WALK) { const c = (pb[wi >> 2] >> ((wi & 3) * 2)) & 3; wi++; if (!c) continue; ch++; t[i] = c === 1 ? TT.BRICK : c === 2 ? TT.BLDG : ((pb[P.nw + (pi >> 3)] >> (pi & 7)) & 1) ? TT.PLAZA : TT.GRASS; if (c === 3) pi++; }
    for (let q = P.nw + P.np, last = 0; q < pb.length;) { let d = 0, sh = 0, b; do { b = pb[q++]; d += (b & 127) * 2 ** sh; sh += 7; } while (b & 128); last += d; t[last] = pb[q++]; ch++; }
    this.parcheN = ch;
    const bb = await this.unz(C.bgrid, C.bgridN); this.bg = new Uint16Array(bb.length >> 1); for (let i = 0; i < this.bg.length; i++) this.bg[i] = bb[2 * i] | bb[2 * i + 1] << 8;
    // calles: por cada casilla de vía en orden, 0 izquierda · 1 arriba · 4 arriba-izq · 5 arriba-der · 2 sin nombre · 3 + varint nombre nuevo
    const cd = await this.unz(C.cdata, C.cdataN), NR = C.nvias, rx = new Uint16Array(NR), rn = new Uint16Array(NR), rp = new Uint16Array(NR), row = new Int32Array(MH + 1);
    const L = [{ p: 0, a: new Uint16Array(MW), b: new Uint16Array(MW), out: rn }, { p: C.cdataN0, a: new Uint16Array(MW), b: new Uint16Array(MW), out: rp }];
    let k = 0;
    for (let y = 0; y < MH; y++) {
      row[y] = k; for (const s of L) { const z = s.a; s.a = s.b; s.b = z; s.b.fill(0); }   // a = fila de arriba, b = fila actual
      for (let x = 0; x < MW; x++) {
        const v = t[y * MW + x]; if (v !== TT.ROAD && v !== TT.AVE && v !== TT.AUTO && v !== TT.BRIDGE) continue;
        rx[k] = x;
        for (const s of L) {
          const c = cd[s.p++]; let id = 0;
          if (c === 0) id = s.b[x - 1]; else if (c === 1) id = s.a[x]; else if (c === 4) id = s.a[x - 1]; else if (c === 5) id = s.a[x + 1];
          else if (c === 3) { let sh = 0, b; do { b = cd[s.p++]; id += (b & 127) * 2 ** sh; sh += 7; } while (b & 128); }
          s.b[x] = id; s.out[k] = id;
        }
        k++;
      }
    }
    row[MH] = k; this.rX = rx; this.rN = rn; this.rP = rp; this.rRow = row;
    const lo = C.lotes, lb = await this.unz(lo.data, lo.n), w = lo.x1 - lo.x0 + 1, h = lo.y1 - lo.y0 + 1, la = new Uint8Array(w * h); let bi = 0;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const v = t[(y + lo.y0) * MW + x + lo.x0]; if (v === TT.BRICK || v === TT.BLDG) { la[y * w + x] = (lb[bi >> 2] >> ((bi & 3) * 2)) & 3; bi++; } }
    this.lot = { x0: lo.x0, y0: lo.y0, w, h, a: la };
  },
  /* ---------- AJUSTES DEL MAPA (src/data/ajustes.js, de tools/mapa_ajustes.mjs) ----------
     nombres de calle y barrios donde la capa oficial no llega (mapa de Juega EnCicla: OpenStreetMap vía Overture; barrios aproximados),
     río continuo y relieve que siempre baja por el cauce, escaleras sueltas, calle bajo el tranvía y patio-taller del Metro en Bello. */
  async ajustes() {
    const A = AJUSTES, t = this.t;
    if (this.rRow) {   // nombres extra para las casillas de vía sin nombre oficial, en orden: 0 izquierda · 1 arriba · 4 arriba-izq · 5 arriba-der · 2 nada · 3 + varint
      const cd = await this.unz(A.calles.d, A.calles.n), rE = new Uint16Array(this.rX.length); let p = 0, a = new Uint16Array(MW), b = new Uint16Array(MW);
      for (let y = 0; y < MH; y++) {
        const z = a; a = b; b = z; b.fill(0);
        for (let k = this.rRow[y]; k < this.rRow[y + 1]; k++) { if (this.rN[k] || this.rP[k]) continue; const x = this.rX[k], c = cd[p++]; let id = 0; if (c === 0) id = b[x - 1]; else if (c === 1) id = a[x]; else if (c === 4) id = a[x - 1]; else if (c === 5) id = a[x + 1]; else if (c === 3) { let sh = 0, q; do { q = cd[p++]; id += (q & 127) * 2 ** sh; sh += 7; } while (q & 128); } b[x] = id; rE[k] = id; }
      }
      this.rE = rE;
    }
    const B = A.barrios, bb = await this.unz(B.d, B.GW * B.GH * 2); this.bgE = new Uint16Array(B.GW * B.GH); for (let i = 0; i < this.bgE.length; i++) this.bgE[i] = bb[2 * i] | bb[2 * i + 1] << 8;
    this.barriosL = CIUDAD.barrios.concat(B.lista);
    const T = A.tiles; for (const i of T.puente) t[i] = TT.BRIDGE; for (const i of T.agua) t[i] = TT.WATER; for (const i of T.calle) t[i] = TT.ROAD; for (let i = 0; i < T.pares.length; i += 2) t[T.pares[i]] = T.pares[i + 1];
    for (let i = 0; i < A.relieve.length; i += 2) this.E[A.relieve[i]] = A.relieve[i + 1];
    this.lugaresL = CIUDAD.lugares.concat(A.lugares); this.ajustado = true;
  },
  /* huellas de estación (andén techado, orientado con su línea): metro 140 × 36 m, tranvía 44 × 16 m y cable 60 × 40 m.
     Las casillas pasan a estación salvo vías mayores, agua y escaleras; el techo se pinta encima con la franja de cada línea. */
  estaciones() {
    if (!this.t || window.__sinAjustes) return; const t = this.t, out = [], keep = new Set([TT.AUTO, TT.AVE, TT.BRIDGE, TT.WATER, TT.CANAL, TT.STEPS, TT.DEPOT]);
    for (const s of NET.stations) {
      const Ls = s.lines.filter(l => l.kind === 'metro' || l.kind === 'tram' || l.kind === 'cable'); if (!Ls.length) continue;
      const L = Ls.find(l => l.kind === 'metro') || Ls.find(l => l.kind === 'tram') || Ls[0], P = L.P.pts; let bi = 0, bd = Infinity;
      for (let i = 0; i < P.length - 1; i++) { const ax = P[i].x, ay = P[i].y, dx = P[i + 1].x - ax, dy = P[i + 1].y - ay, u = clamp(((s.x - ax) * dx + (s.y - ay) * dy) / (dx * dx + dy * dy || 1), 0, 1), d = (ax + dx * u - s.x) ** 2 + (ay + dy * u - s.y) ** 2; if (d < bd) { bd = d; bi = i; } }
      const a = Math.atan2(P[bi + 1].y - P[bi].y, P[bi + 1].x - P[bi].x), [w, h] = L.kind === 'metro' ? [140, 36] : L.kind === 'tram' ? [44, 16] : [60, 40], ca = Math.cos(a), sa = Math.sin(a), Rr = Math.ceil(w / TM);
      out.push({ x: s.x, y: s.y, a, w, h, k: L.kind, cols: [...new Set(Ls.map(l => l.color))] });
      let hechas = 0; const marca = (hh, ok) => { for (let dy = -Rr; dy <= Rr; dy++) for (let dx = -Rr; dx <= Rr; dx++) {
        const tx = Math.floor(s.x / TM) + dx, ty = Math.floor(s.y / TM) + dy, px = (tx + .5) * TM - s.x, py = (ty + .5) * TM - s.y;
        if (Math.abs(px * ca + py * sa) <= w / 2 && Math.abs(-px * sa + py * ca) <= hh / 2 && tx >= 0 && ty >= 0 && tx < MW && ty < MH && ok(t[ty * MW + tx])) { t[ty * MW + tx] = TT.STATION; hechas++; }
      } };
      marca(h, q => !keep.has(q)); if (!hechas) marca(16, q => q !== TT.WATER && q !== TT.CANAL && q !== TT.BRIDGE);
    }
    this.techos = out; this.chunks.clear(); this._mini = null;
  },
  barrioAt(x, y) { if (!this.bg) return null; const C = CIUDAD, i = clamp(Math.floor(y / TM / C.K), 0, C.GH - 1) * C.GW + clamp(Math.floor(x / TM / C.K), 0, C.GW - 1), v = this.bg[i]; if (v) return C.barrios[v - 1]; if (!this.bgE) return null; const A = AJUSTES.barrios, w = this.bgE[clamp(Math.floor(y / TM / 8), 0, A.GH - 1) * A.GW + clamp(Math.floor(x / TM / 8), 0, A.GW - 1)]; return w ? A.lista[w - 1] : null; },
  /* nombres de la casilla de vía (tx, ty): { n: nomenclatura, p: nombre popular } o null */
  calleT(tx, ty) {
    if (!this.rRow || ty < 0 || ty >= MH) return null; let a = this.rRow[ty], b = this.rRow[ty + 1] - 1;
    while (a <= b) { const m = (a + b) >> 1, x = this.rX[m]; if (x === tx) { const N = CIUDAD.calles, n = this.rN[m], p = this.rP[m], e = this.rE ? this.rE[m] : 0; return n || p ? { n: n ? N[n][0] : '', p: p ? N[p][0] : '' } : e ? { n: AJUSTES.calles.lista[e - 1], p: '' } : null; } if (x < tx) a = m + 1; else b = m - 1; }
    return null;
  },
  calleAt(x, y) { const tx = Math.floor(x / TM), ty = Math.floor(y / TM); return this.calleT(tx, ty) || this.calleT(tx + 1, ty) || this.calleT(tx - 1, ty) || this.calleT(tx, ty + 1) || this.calleT(tx, ty - 1); },
  /* lotes catastrales en la casilla construida (Medellín): 0 sin dato, 1 uno, 2 dos o tres, 3 cuatro o más */
  lotT(tx, ty) { const L = this.lot; if (!L) return 0; const x = tx - L.x0, y = ty - L.y0; return x < 0 || y < 0 || x >= L.w || y >= L.h ? 0 : L.a[y * L.w + x]; },
  tile(tx, ty) { tx |= 0; ty |= 0; return (tx < 0 || ty < 0 || tx >= MW || ty >= MH) ? TT.MOUNT : this.t[ty * MW + tx]; },
  tileM(x, y) { return this.tile(Math.floor(x / TM), Math.floor(y / TM)); },
  /* relieve: metros sobre el nivel del mar (bilineal en la grilla de 80 m) */
  elevM(x, y) {
    const W = VM.eW, g = TM * ES, gx = clamp(x / g, 0, W - 1.001), gy = clamp(y / g, 0, VM.eH - 1.001), i = gx | 0, j = gy | 0, fx = gx - i, fy = gy - j, E = this.E, k = j * W + i;
    return (E[k] * (1 - fx) + E[k + 1] * fx) * (1 - fy) + (E[k + W] * (1 - fx) + E[k + W + 1] * fx) * fy;
  },
  muniAt(x, y) { const i = clamp(Math.floor(y / TM / 8), 0, VM.mH - 1) * VM.mW + clamp(Math.floor(x / TM / 8), 0, VM.mW - 1), v = this.mu[i]; return v ? VM.munis[v - 1] : ''; },
  comunaAt(x, y) { const i = clamp(Math.floor(y / TM / 8), 0, VM.mH - 1) * VM.mW + clamp(Math.floor(x / TM / 8), 0, VM.mW - 1), v = this.co[i]; return v ? VM.comunas[v - 1] : ''; },
  /* altura típica de edificios según la zona (centro y El Poblado: torres; laderas: casas de ladrillo) */
  bHeight(x, y, seed) {
    const c = this.comunaAt(x, y), r = h2(x | 0, y | 0, seed);
    if (/Candelaria/.test(c)) return 18 + r * 60; if (/Poblado/.test(c)) return 20 + r * 70; if (/Laureles|América|Belén/.test(c)) return 9 + r * 22;
    return 6 + r * 10;
  },
  /* ---------- vista cenital estilo pincel de pueblo: trozos de 32×32 casillas a 10 px por casilla ----------
     Suelo con tramado, árboles frondosos con sombra, casas en 3/4 (tejado + fachada de colores), andenes y bordillos,
     río con ondas. Las ventanas se guardan para encenderlas de noche. */
  chunk(cx, cy) {
    const key = cx + ',' + cy; let c = this.chunks.get(key); if (c) { this.chunks.delete(key); this.chunks.set(key, c); return c; }
    const CH = this.CH, P = this.PX, n = CH * P; c = mkCanvas(n, n); const g = c.getContext('2d'), img = g.createImageData(n, n), d = img.data;
    // ventana de casillas con margen: anchos de vía y orillas sin salirse del trozo ni llamar this.tile a cada píxel
    const M = 10, SW = CH + 2 * M, tw = new Uint8Array(SW * SW);
    for (let j = 0; j < SW; j++) for (let i = 0; i < SW; i++) tw[j * SW + i] = this.tile(cx * CH + i - M, cy * CH + j - M);
    const T = (x, y) => tw[(y + M) * SW + x + M], road = v => v === TT.ROAD || v === TT.AVE || v === TT.AUTO || v === TT.BRIDGE, wet = v => v === TT.WATER || v === TT.CANAL;
    // cada casilla de vía es tramo vertical (1), tramo horizontal (2) o cruce/plazoleta (3), con su ancho en casillas y su posición
    const RS = CH + 2, RK = new Uint8Array(RS * RS), RW = new Uint8Array(RS * RS), RP = new Uint8Array(RS * RS), rIdx = (x, y) => (y + 1) * RS + x + 1;
    // se mide con las vías del MISMO tipo (autopista, avenida y calle vienen pegadas en los datos); un cruce es donde llega una vía transversal
    const runV = (x, y) => { let n = 1; for (let k = 1; k < 5 && road(T(x, y - k)); k++) n++; for (let k = 1; k < 5 && road(T(x, y + k)); k++) n++; return n; };
    const runH = (x, y) => { let n = 1; for (let k = 1; k < 5 && road(T(x - k, y)); k++) n++; for (let k = 1; k < 5 && road(T(x + k, y)); k++) n++; return n; };
    for (let y = -1; y <= CH; y++) for (let x = -1; x <= CH; x++) {
      const v = T(x, y); if (!road(v) || v === TT.BRIDGE) continue; let l = 0, r = 0, u = 0, w = 0;
      while (l < 9 && T(x - l - 1, y) === v) l++; while (r < 9 && T(x + r + 1, y) === v) r++; while (u < 9 && T(x, y - u - 1) === v) u++; while (w < 9 && T(x, y + w + 1) === v) w++;
      const h = l + r + 1, vv = u + w + 1, k = rIdx(x, y);
      if (vv >= h + 3 && h <= 9) {
        const xa = x - l - 1, xb = x + r + 1, cruce = (road(T(xa, y)) && T(xa, y) !== TT.BRIDGE && runV(xa, y) <= 3) || (road(T(xb, y)) && T(xb, y) !== TT.BRIDGE && runV(xb, y) <= 3);
        if (cruce) RK[k] = 3; else { RK[k] = 1; RW[k] = h; RP[k] = l; }
      } else if (h >= vv + 3 && vv <= 9) {
        const ya = y - u - 1, yb = y + w + 1, cruce = (road(T(x, ya)) && T(x, ya) !== TT.BRIDGE && runH(x, ya) <= 3) || (road(T(x, yb)) && T(x, yb) !== TT.BRIDGE && runH(x, yb) <= 3);
        if (cruce) RK[k] = 3; else { RK[k] = 2; RW[k] = vv; RP[k] = u; }
      } else RK[k] = 3;
    }
    const RKa = (x, y) => RK[rIdx(x, y)];
    for (let ty = 0; ty < CH; ty++) for (let tx = 0; tx < CH; tx++) {
      const X = cx * CH + tx, Y = cy * CH + ty, v = T(tx, ty), base = TRGB[v] || TRGB[0], e = this.elevM(X * TM, Y * TM), sh = clamp(1 + (this.elevM(X * TM - 40, Y * TM - 40) - e) * .011, .74, 1.22);
      const nN = T(tx, ty - 1), nS = T(tx, ty + 1), nW = T(tx - 1, ty), nE = T(tx + 1, ty), k0 = rIdx(tx, ty), rk = RK[k0], rw = RW[k0], rp = RP[k0];
      // tramo de vía: cebras solo a la entrada de un cruce (siempre en avenidas; en calles, algunas)
      let zA = 0, zB = 0, stx = 0, sty = 0;
      if (rk === 1 || rk === 2) {
        const X0 = rk === 1 ? X - rp : X, Y0 = rk === 2 ? Y - rp : Y, ok = (jx, jy) => v === TT.AVE || v === TT.ROAD && h2(jx, jy, 97) < .45;
        if (rk === 1) { zA = RKa(tx, ty - 1) === 3 && ok(X0, Y - 1); zB = RKa(tx, ty + 1) === 3 && ok(X0, Y + 1); }
        else { zA = RKa(tx - 1, ty) === 3 && ok(X - 1, Y0); zB = RKa(tx + 1, ty) === 3 && ok(X + 1, Y0); }
      } else if (v === TT.STEPS) { stx = Math.abs(this.elevM(X * TM + 18, Y * TM + 10) - this.elevM(X * TM + 2, Y * TM + 10)); sty = Math.abs(this.elevM(X * TM + 10, Y * TM + 18) - this.elevM(X * TM + 10, Y * TM + 2)); }
      const cvert = v === TT.CICLO ? (nN === TT.CICLO) + (nS === TT.CICLO) >= (nW === TT.CICLO) + (nE === TT.CICLO) : 0;
      for (let py = 0; py < P; py++) for (let px = 0; px < P; px++) {
        let m = sh, col = base; const hh = h2(X * P + px, Y * P + py, v), chk = (px + py) % 2;
        switch (v) {
          case TT.GRASS: m *= chk ? .96 : 1.02; if (hh < .015) col = [[236, 232, 210], [246, 197, 56], [235, 49, 142]][(hh * 200) | 0]; else if (hh > .93) m *= .9; break;
          case TT.MOUNT: m *= .9 + (chk ? 0 : .05); break;
          case TT.BRICK: case TT.BLDG: col = [96, 112, 74]; m *= chk ? .95 : 1; break;   // patio (la casa se pinta encima)
          case TT.ROAD: case TT.AVE: case TT.AUTO: case TT.BRIDGE: {
            m *= .97 + hh * .05; if (hh > .985) m *= .86;   // parches del asfalto
            // andén con bordillo a cada lado de la calle (donde no sigue otra vía): calle 3 px (≈ 4 m), avenida 2, autopista solo berma
            const de = Math.min(road(nN) ? 99 : py, road(nS) ? 99 : P - 1 - py, road(nW) ? 99 : px, road(nE) ? 99 : P - 1 - px), swk = v === TT.ROAD ? 3 : v === TT.AVE ? 2 : 0;
            if (v === TT.BRIDGE) { if (de === 0) { col = [70, 70, 76]; m = sh; break; } }
            else if (de < swk) { const hz = (road(nN) ? 99 : py) === de || (road(nS) ? 99 : P - 1 - py) === de; col = [198, 192, 180]; m = sh * ((hz ? (X * P + px) : (Y * P + py)) % 5 === 0 ? .9 : 1 + (hh - .5) * .04); break; }
            else if (de === swk) { col = swk ? [222, 216, 204] : [150, 146, 138]; m = sh; break; }
            if (v === TT.BRIDGE) { col = [150, 150, 154]; m = sh * ((((X * P + px) + (Y * P + py)) % 9 === 0) ? .82 : .97 + hh * .05); break; }   // puente o viaducto: losa de concreto con juntas
            if (rk !== 1 && rk !== 2) break;   // cruce: asfalto limpio
            { const vt = rk === 1, a0 = vt ? px : py, nA = vt ? nW : nN, nB = vt ? nE : nS, sw = v === TT.AVE ? 2 : 1;   // frontera con otra vía paralela: separador
              if ((road(nA) && nA !== v && a0 < sw) || (road(nB) && nB !== v && a0 >= P - sw)) { col = v === TT.AUTO ? [212, 208, 198] : v === TT.AVE ? [88, 128, 70] : [201, 194, 178]; m = sh; break; } }
            const vert = rk === 1, a = (vert ? px : py) + rp * P, al = vert ? Y * P + py : X * P + px, ln = vert ? py : px, Wd = rw * P, mid = Wd / 2, dm = Math.abs(a + .5 - mid);
            const med = rw >= 2 && v !== TT.ROAD && v !== TT.BRIDGE, sep = rw >= 4 ? Math.abs(((a + P) % (2 * P)) - P + .5) : 99;   // vías muy anchas: calzadas de dos casillas
            if (med && Math.min(dm, sep) <= (v === TT.AUTO ? 1 : 2.5)) { const dd = Math.min(dm, sep);   // separador: verde con bordillo (avenida) o barrera de concreto (autopista)
              if (v === TT.AUTO) { col = dd <= .5 ? [176, 172, 164] : [214, 210, 200]; } else { col = dd > 1.5 ? [204, 198, 184] : (hh < .5 ? [92, 132, 72] : [84, 122, 66]); }
              m = sh; break;
            }
            if ((zA && ln >= 1 && ln <= 4) || (zB && ln >= P - 5 && ln <= P - 2)) { if (a % 4 < 2) { col = [238, 236, 228]; m = sh; } break; }   // cebra
            if (rw === 1) {
              if (v === TT.AVE || v === TT.AUTO) { if (a === 6 || a === 9) { col = [244, 196, 52]; m = sh * .95; } }   // doble línea amarilla
              else if ((a === 7 || a === 8) && al % 10 < 5 && (a === 8 || v === TT.BRIDGE)) { col = [244, 196, 52]; m = sh * .92; }   // línea central discontinua
            } else if (!med && (a === Math.floor(mid) - 1 || a === Math.floor(mid))) { col = [244, 196, 52]; m = sh * .92; }   // calle ancha sin separador
            else if (a % 8 === 0 && a > 3 && a < Wd - 4 && dm > 4 && sep > 4 && al % 12 < 5) { col = [232, 230, 220]; m = sh * .95; }   // carriles
            break; }
          case TT.WALK: {   // peatonal o andén ancho: adoquín trabado (filas de 2 px, piezas de 4 px corridas a media pieza)
            const gx = X * P + px, gy = Y * P + py, fila = gy >> 1, junta = (gy & 1) === 1 || ((gx + (fila & 1) * 2) & 3) === 0;
            col = [200, 192, 178]; m *= junta ? .91 : 1 + (h2(gx >> 2, fila, 5) - .5) * .07; break; }
          case TT.PLAZA: {   // plaza: losas de 4 px en dos tonos, con franja cada 16 px
            const gx = X * P + px, gy = Y * P + py, banda = (gx & 15) === 0 || (gy & 15) === 0;
            col = banda ? [178, 120, 92] : (((gx >> 2) + (gy >> 2)) & 1) ? [222, 212, 188] : [208, 198, 174]; m *= (gx & 3) === 0 || (gy & 3) === 0 ? .95 : 1; break; }
          case TT.CICLO: { const a = cvert ? px : py, al = cvert ? Y * P + py : X * P + px; col = [189, 182, 165]; m *= (px % 4 === 0 || py % 4 === 0) ? .955 : 1.01;
            if (a >= 5 && a <= 10) { col = a === 5 || a === 10 ? [236, 234, 226] : [64, 138, 96]; m = sh * (a === 7 || a === 8 ? (al % 8 < 4 ? 1.02 : .97) : 1); } break; }
          case TT.WATER: case TT.CANAL: {
            const db = Math.min(wet(nN) ? 99 : py, wet(nS) ? 99 : P - 1 - py, wet(nW) ? 99 : px, wet(nE) ? 99 : P - 1 - px);
            if (v === TT.CANAL) { if (db === 0) { col = [206, 202, 192]; m = sh; break; } if (db === 1) { col = [126, 124, 118]; m = sh; break; } col = [72, 120, 120]; }
            else { if (db === 0) { col = [92, 120, 70]; m = sh * (hh < .5 ? 1 : .9); break; } col = [58, 118, 138]; }
            m *= db === 2 ? .86 : db === 3 ? .94 : 1; const rp2 = ((X * P + px) * 3 + (Y * P + py) * 7 + ((X * P + px) >> 3)) % 29; if (rp2 === 0 && hh < .7) m *= 1.16; else if (hh < .012) m *= 1.3;   // brillos sueltos, sin rayas
            break; }
          case TT.STEPS: { const up = stx > sty, a = up ? px : py, s2 = up ? py : px; col = [198, 192, 180]; if (s2 === 0 || s2 === P - 1) { col = [120, 116, 108]; m = sh; } else m *= a % 3 === 0 ? .8 : a % 3 === 1 ? 1.06 : 1; break; }
          case TT.DEPOT: { const a = (X * P + px) % 8; col = [138, 128, 112]; if (a === 2 || a === 5) { col = [62, 62, 66]; m = sh; } else if (a > 2 && a < 5 && (Y * P + py) % 3 === 0) { col = [104, 84, 62]; m = sh; } else m *= .94 + hh * .1; break; }   // patio: balasto y vías
          default: m *= .95 + hh * .08;
        }
        const o = ((ty * P + py) * n + tx * P + px) * 4; d[o] = clamp(col[0] * m, 0, 255); d[o + 1] = clamp(col[1] * m, 0, 255); d[o + 2] = clamp(col[2] * m, 0, 255); d[o + 3] = 255;
      }
    }
    g.putImageData(img, 0, 0);
    // segunda pasada: sombras, edificios por manzana (techos y fachadas), casas por lote, árboles, carros parqueados
    const lights = [], R = (x, y, w, h, col) => { g.fillStyle = col; g.fillRect(x, y, w, h); };
    const WALLS = ['#efe3c8', '#f2cfae', '#d6e6d2', '#e9c9c9', '#f4e2a0', '#cfe0ea', '#e2d4ee', '#f7efe2'], BRICKS = ['#b85c3e', '#a9533a', '#c0654a', '#9c4a33'];
    const AP_WALL = ['#e6dcc8', '#d8d2c4', '#c9ced4', '#efe8d8', '#b05a3c', '#a9533a', '#cfd9df', '#d9c7a6'], AP_ROOF = ['#9aa0a6', '#b9b5ad', '#a7aaa8', '#8e9499', '#c4bfb4', '#9c8f80', '#b9a48c', '#a8877a', '#cfc8bb'];
    // manzanas de edificios: lotes de 1–3 casillas por supermanzana de 8×8
    const lot = (X, Y) => { const sx = X >> 3, sy = Y >> 3, lw = 1 + (h2(sx, sy, 31) * 3 | 0), lh = 1 + (h2(sx, sy, 32) * 2.4 | 0), ox = h2(sx, sy, 33) * lw | 0, oy = h2(sx, sy, 34) * lh | 0; return sx * 997 + sy * 7919 + Math.floor((X + ox) / lw) * 31 + Math.floor((Y + oy) / lh) * 131071; };
    const TW = (x, y) => this.tile(cx * CH + x, cy * CH + y), same = (x1, y1, x2, y2) => TW(x1, y1) === TT.BLDG && TW(x2, y2) === TT.BLDG && lot(cx * CH + x1, cy * CH + y1) === lot(cx * CH + x2, cy * CH + y2);
    const fhOf = X => clamp(Math.round(X / 20 * P * .42), 4, 14);
    // 2a · sombras proyectadas (sol de la tarde: hacia abajo a la derecha), en una capa aparte para no acumular
    const shc = mkCanvas(n, n), sg = shc.getContext('2d'); sg.fillStyle = '#000';
    for (let ty = 0; ty < CH; ty++) for (let tx = 0; tx < CH; tx++) { const X = cx * CH + tx, Y = cy * CH + ty, v = T(tx, ty); if (v !== TT.BLDG && v !== TT.BRICK) continue; const hm = v === TT.BLDG ? this.bHeight(X * TM, Y * TM, lot(X, Y)) : 7, off = clamp(hm * .22, 2, 12); sg.fillRect(tx * P + off * .8, ty * P + off * .55 + (v === TT.BLDG ? fhOf(hm) : 5), P, P); }
    g.save(); g.globalAlpha = .26; g.drawImage(shc, 0, 0); g.restore();
    for (let ty = 0; ty < CH; ty++) for (let tx = 0; tx < CH; tx++) {
      const X = cx * CH + tx, Y = cy * CH + ty, v = T(tx, ty), ox = tx * P, oy = ty * P, r = h2(X, Y, 11);
      if (v === TT.GRASS && r < .28 || v === TT.MOUNT) {
        const nt = v === TT.MOUNT ? 2 + (r * 2 | 0) : 1;
        for (let k = 0; k < nt; k++) { const rr = 3.5 + h2(X, Y, 20 + k) * 3.5, x = ox + 3 + h2(X, Y, 30 + k) * (P - 6), y = oy + 3 + h2(X, Y, 40 + k) * (P - 6), dk = v === TT.MOUNT ? .85 : 1;
          g.fillStyle = 'rgba(18,38,22,.4)'; g.beginPath(); g.ellipse(x + rr * .7, y + rr * .8, rr, rr * .7, 0, 0, TAU); g.fill();
          g.fillStyle = Art.shade('#2c5a2c', dk); g.beginPath(); g.arc(x, y, rr, 0, TAU); g.fill(); g.fillStyle = Art.shade(['#3f7a3a', '#4b8640', '#3a7246', '#56883c'][(r * 4) | 0], dk); g.beginPath(); g.arc(x - .5, y - .6, rr * .78, 0, TAU); g.fill();
          g.fillStyle = Art.shade('#79ac56', dk); g.fillRect(x - rr * .5, y - rr * .6, 2, 2); g.fillRect(x - rr * .1, y - rr * .75, 1.5, 1.5); g.fillRect(x + rr * .2, y - rr * .3, 1.5, 1.5); }
      } else if (v === TT.BRICK) {
        // casas de barrio con la fachada hacia SU calle (sur, este, oeste o norte), divididas según los lotes catastrales
        // (Medellín) o al azar estable (resto del valle). Techos de teja, eternit o plancha (terraza con tanque, ropa,
        // columnas con varilla "para el segundo piso", matas y a veces un perro). Las casillas de adentro son patios y terrazas.
        const nS = T(tx, ty + 1), nN = T(tx, ty - 1), nW = T(tx - 1, ty), nE = T(tx + 1, ty), calle = q => road(q) || q === TT.WALK || q === TT.PLAZA || q === TT.STEPS || q === TT.CICLO || q === TT.STATION;
        const front = calle(nS) ? 'S' : calle(nE) && !calle(nW) ? 'E' : calle(nW) ? 'W' : calle(nE) ? 'E' : calle(nN) ? 'N' : '';
        const lt = this.lotT(X, Y), hq = h2(X, Y, 50), nh = lt ? [2, 1 + (hq < .35 ? 1 : 0), 2 + (hq < .5 ? 1 : 0), 3 + (hq < .45 ? 1 : 0)][lt] : 2 + (hq < .35 ? 1 : 0);
        const alongX = front !== 'E' && front !== 'W', span = P, hw = span / nh, streetS = front === 'S';
        if (!front && hq < .4) {   // patio interior de la manzana: cemento o pasto, con ropa tendida o un palo de mango
          R(ox, oy, P, P, hq < .2 ? '#9fa58a' : '#b3ac9c'); R(ox, oy, P, 1, 'rgba(20,20,20,.3)');
          if (hq < .12) { g.fillStyle = '#2c5a2c'; g.beginPath(); g.arc(ox + 8, oy + 8, 5, 0, TAU); g.fill(); g.fillStyle = '#4b8640'; g.beginPath(); g.arc(ox + 7.5, oy + 7.4, 3.8, 0, TAU); g.fill(); }
          else for (let q = 0; q < 6; q++) R(ox + 3 + q * 2, oy + 6 + (q & 1), 1, 2, ['#EC343A', '#F6C538', '#1C5C9C', '#fff', '#59AB42', '#EB318E'][(q + (X & 3)) % 6]);
        } else for (let i = 0; i < nh; i++) {
          const a0 = Math.round(i * hw), a1 = Math.round((i + 1) * hw), w0 = a1 - a0, rr = h2(X * 3 + i, Y * 5 + i, 51), typ = rr < .38 ? 'teja' : rr < .72 ? 'plancha' : 'eternit';
          const hx = alongX ? ox + a0 : ox, hy = alongX ? oy : oy + a0, w = alongX ? w0 : P, hh0 = alongX ? P : w0;
          const top = hy + (alongX && nN !== TT.BRICK && front !== 'N' ? 1 : 0), hh = hh0 - (top - hy) - (streetS ? 2 : 0);
          const roof = typ === 'teja' ? ['#b4583a', '#a24b30', '#c4683f', '#8e4128'][(rr * 97 | 0) % 4] : typ === 'plancha' ? ['#b7b2a8', '#a9a49a', '#c2bdb2', '#b3a690'][(rr * 31 | 0) % 4] : ['#8f979c', '#9aa2a6', '#7f878c'][(rr * 13 | 0) % 3];
          R(hx, top, w, hh, roof);
          if (typ === 'teja') { if (alongX) { R(hx, top + (hh >> 1), w, 1, Art.shade(roof, 1.25)); for (let yy = top + 2; yy < top + hh - 1; yy += 2) R(hx + 1, yy, w - 2, 1, Art.shade(roof, (yy - top) < (hh >> 1) ? .9 : .8)); }
            else { R(hx + (w >> 1), top, 1, hh, Art.shade(roof, 1.25)); for (let xx = hx + 2; xx < hx + w - 1; xx += 2) R(xx, top + 1, 1, hh - 2, Art.shade(roof, (xx - hx) < (w >> 1) ? .9 : .8)); } }
          else if (typ === 'eternit') { if (alongX) for (let xx = hx + 1; xx < hx + w - 1; xx += 2) R(xx, top + 1, 1, hh - 2, Art.shade(roof, .82)); else for (let yy = top + 1; yy < top + hh - 1; yy += 2) R(hx + 1, yy, w - 2, 1, Art.shade(roof, .82)); }
          else {   // plancha: la terraza paisa
            R(hx + 1, top + 1, w - 2, 1, Art.shade(roof, 1.12));
            if (rr < .5 && w > 4 && hh > 5) { R(hx + 2, top + 2, 4, 4, '#141414'); R(hx + 2, top + 2, 3, 3, rr < .47 ? '#2f5f9c' : '#1d1d1d'); R(hx + 2, top + 2, 1, 1, '#9cc0e6'); }
            const r2 = h2(X + i, Y, 55);
            if (r2 < .22 && w > 4 && hh > 6) { for (const [cx2, cy2] of [[hx + 1, top + 1], [hx + w - 3, top + 1], [hx + 1, top + hh - 3], [hx + w - 3, top + hh - 3]]) { R(cx2, cy2, 2, 2, '#8d8d86'); R(cx2, cy2, 1, 1, '#2b2b2b'); } }   // columnas con varilla
            else if (r2 < .55 && hh > 6) { R(hx + 1, top + hh - 4, w - 2, 1, '#d9d9d9'); for (let q = 0; q < w - 3; q += 2) R(hx + 2 + q, top + hh - 3, 1, 2, ['#EC343A', '#F6C538', '#1C5C9C', '#fff', '#EB318E'][(q + i) % 5]); }   // ropa tendida
            if (h2(X, Y + i, 56) < .3) for (let q = 0; q < 3; q++) R(hx + w - 2 - q * 2, top + 2, 1, 1, ['#3f8f3a', '#c4486b', '#59AB42'][q]);   // matas
            if (h2(Y, X + i, 57) < .025 && w > 5) { R(hx + 3, top + (hh >> 1), 3, 1, '#7a4a22'); R(hx + 6, top + (hh >> 1) - 1, 1, 1, '#5a3418'); }   // perro en la terraza
          }
          if (alongX) R(hx, top, 1, hh, 'rgba(20,20,20,.55)'); else R(hx, hy, w, 1, 'rgba(20,20,20,.55)');   // medianera
          const wall = h2(X, i, 54) < .55 ? BRICKS[(rr * 7 | 0) % 4] : WALLS[(rr * 97 | 0) % WALLS.length];
          if (streetS) { R(hx, oy + P - 2, w, 5, wall); R(hx, oy + P + 3, w, 1, 'rgba(0,0,0,.35)'); R(hx + 1 + (rr * (w - 3) | 0), oy + P - 1, 2, 4, '#3a2a20'); const wx = hx + (rr < .5 ? w - 3 : 1); R(wx, oy + P - 1, 2, 2, '#28435a'); lights.push([wx, oy + P - 1, 2]); if (rr > .86) R(hx, oy + P - 2, w, 1, ['#EC343A', '#1C5C9C', '#59AB42', '#F6C538'][(rr * 40 | 0) % 4]); }
          else if (front === 'E' || front === 'W') { const ex = front === 'E' ? ox + P - 2 : ox; R(ex, hy, 2, w0, Art.shade(wall, .92)); R(ex, hy + 1 + (rr * (w0 - 3) | 0), 2, 2, '#3a2a20'); if (w0 > 4) { R(ex, hy + w0 - 2, 2, 1, '#28435a'); lights.push([ex, hy + w0 - 2, 2]); } }
          else if (front === 'N') { R(hx, oy, w, 2, Art.shade(wall, .92)); R(hx + 1 + (rr * (w - 3) | 0), oy, 2, 2, '#3a2a20'); }
        }
        R(ox, oy, P, 1, nN === TT.BRICK ? 'rgba(20,20,20,.25)' : '#141414');
      } else if (v === TT.BLDG) {
        // edificio por lote: techo continuo, borde solo hacia afuera, fachada al sur con pisos y ventanas
        const L = lot(X, Y), hm = this.bHeight(X * TM, Y * TM, L), lr = h2(L & 65535, L >> 16, 61), roof = AP_ROOF[(lr * 61 | 0) % AP_ROOF.length], wall = AP_WALL[(lr * 37 | 0) % AP_WALL.length], fh = fhOf(hm);
        const sN = same(tx, ty, tx, ty - 1), sS = same(tx, ty, tx, ty + 1), sW = same(tx, ty, tx - 1, ty), sE = same(tx, ty, tx + 1, ty);
        R(ox, oy, P, P, roof);
        if (!sN) R(ox, oy, P, 1, '#141414'); if (!sW) R(ox, oy, 1, P, '#141414'); if (!sE) R(ox + P - 1, oy, 1, P, '#141414');
        if (!sN) R(ox + (sW ? 0 : 1), oy + 1, P - (sW ? 0 : 1) - (sE ? 0 : 1), 1, Art.shade(roof, 1.15)); if (!sW) R(ox + 1, oy + 1, 1, P - 1, Art.shade(roof, 1.1)); if (!sE) R(ox + P - 2, oy + 1, 1, P - 1, Art.shade(roof, .85));
        const ri = h2(X, Y, 62);
        if (ri < .13) { const tx2 = ox + 3 + (h2(X, Y, 63) * (P - 9) | 0), ty2 = oy + 3 + (h2(X, Y, 64) * (P - 9) | 0); g.fillStyle = '#141414'; g.beginPath(); g.arc(tx2 + 2.5, ty2 + 2.5, 3, 0, TAU); g.fill(); g.fillStyle = ri < .16 ? '#2f5f9c' : '#2a2a2a'; g.beginPath(); g.arc(tx2 + 2.5, ty2 + 2.5, 2.2, 0, TAU); g.fill(); R(tx2 + 1, ty2 + 1, 1, 1, '#9cc0e6'); }
        else if (ri < .27) { R(ox + 4, oy + 4, 4, 3, '#7d8792'); R(ox + 5, oy + 5, 2, 1, '#cfd5da'); R(ox + 9, oy + 9, 3, 3, '#7d8792'); }
        else if (ri < .35 && hm > 30) { R(ox + 3, oy + 3, P - 6, P - 6, Art.shade(roof, .82)); R(ox + 5, oy + 5, P - 10, P - 10, '#4a5560'); }   // cuarto de máquinas
        else if (ri < .41) { for (let q = 0; q < 3; q++) R(ox + 3 + q * 4, oy + 5, 3, 6, '#2e4a66'); }   // calentadores solares
        else if (ri < .47) { R(ox + 3, oy + 3, P - 6, P - 6, '#4f7a3a'); for (let q = 0; q < 5; q++) R(ox + 4 + h2(X, q, 65) * (P - 9), oy + 4 + h2(Y, q, 66) * (P - 9), 2, 2, '#79ac56'); }   // azotea verde
        if (hm > 45 && ri > .9) { R(ox + (P >> 1), oy + 2, 1, 4, '#141414'); R(ox + (P >> 1) - 1, oy + 1, 3, 1, '#EC343A'); lights.push([ox + (P >> 1) - 1, oy + 1, 3]); }
        if (!sS) { const y0 = oy + P; R(ox + (sW ? 0 : 0), y0, P, fh, wall); R(ox, y0, P, 1, Art.shade(wall, .78)); if (!sW) R(ox, y0, 1, fh, '#141414'); if (!sE) R(ox + P - 1, y0, 1, fh, '#141414'); R(ox, y0 + fh, P, 1, 'rgba(0,0,0,.4)');
          const glass = hm > 40 && lr > .6; for (let wy = y0 + 2; wy < y0 + fh - 1; wy += 3) for (let wx = ox + 2; wx < ox + P - 2; wx += 3) { R(wx, wy, 2, 2, glass ? '#3d6a8a' : '#2a4560'); lights.push([wx, wy, 2]); }
          if (fh >= 6 && ri > .5) R(ox + 2, y0 + fh - 3, P - 4, 2, ['#EC343A', '#1C5C9C', '#59AB42', '#F6C538', '#E38835'][(lr * 5) | 0]); }   // toldo / local comercial
      } else if (v === TT.AVE && (RK[rIdx(tx, ty)] === 1 || RK[rIdx(tx, ty)] === 2) && RW[rIdx(tx, ty)] >= 2) {
        // árboles del separador, uno cada dos casillas a lo largo
        const vert = RK[rIdx(tx, ty)] === 1, rp = RP[rIdx(tx, ty)], mid = RW[rIdx(tx, ty)] * P / 2, t0 = Math.floor(mid / P);
        if (rp === t0 && ((vert ? Y : X) & 1) === 0 && h2(vert ? X - rp : X, vert ? Y : Y - rp, 99) < .8) {
          const loc = mid - t0 * P, x = vert ? ox + loc : ox + (P >> 1), y = vert ? oy + (P >> 1) : oy + loc, rr = 3.2 + h2(X, Y, 72) * 1.6;
          g.fillStyle = 'rgba(18,38,22,.35)'; g.beginPath(); g.ellipse(x + 1.5, y + 1.5, rr, rr * .7, 0, 0, TAU); g.fill(); g.fillStyle = '#2c5a2c'; g.beginPath(); g.arc(x, y, rr, 0, TAU); g.fill(); g.fillStyle = h2(X, Y, 73) < .15 ? '#e0b830' : h2(X, Y, 74) < .15 ? '#c96bb0' : '#4b8640'; g.beginPath(); g.arc(x - .4, y - .5, rr * .72, 0, TAU); g.fill();
        }
      } else if ((v === TT.ROAD) && r < .3 && (RK[rIdx(tx, ty)] === 1 || RK[rIdx(tx, ty)] === 2)) {
        // carro parqueado junto al andén
        const nN2 = T(tx, ty - 1), nS2 = T(tx, ty + 1), nW2 = T(tx - 1, ty), nE2 = T(tx + 1, ty), rd = q => q === TT.ROAD || q === TT.AVE || q === TT.AUTO || q === TT.BRIDGE, horiz = rd(nW2) || rd(nE2), col = ['#c43a26', '#2a5a92', '#e9eef3', '#1d1f24', '#9aa7b8', '#f2c400', '#3d6b3a', '#d98a3a'][(r * 97 | 0) % 8];
        if (horiz && !rd(nS2)) { const x = ox + 3 + (h2(X, Y, 70) * 5 | 0), y = oy + P - 6; R(x - 1, y - 1, 9, 5, '#141414'); R(x, y, 7, 3, col); R(x + 2, y, 3, 3, Art.shade(col, 1.15)); R(x + 5, y, 1, 3, '#1f2e3d'); }
        else if (!horiz && !rd(nE2)) { const x = ox + P - 6, y = oy + 3 + (h2(X, Y, 71) * 5 | 0); R(x - 1, y - 1, 5, 9, '#141414'); R(x, y, 3, 7, col); R(x, y + 2, 3, 3, Art.shade(col, 1.15)); R(x, y + 5, 3, 1, '#1f2e3d'); }
      } else if ((v === TT.PLAZA || v === TT.WALK) && r > .9) {
        // vida en la plaza o la peatonal: carrito de venta con sombrilla de colores, o banca con farol
        const x = ox + 4 + (h2(X, Y, 80) * 8 | 0), y = oy + 4 + (h2(X, Y, 81) * 8 | 0);
        if (r > .955) { g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(x + 2, y + 2, 4, 3, 0, 0, TAU); g.fill(); const cs = [['#EC343A', '#fff'], ['#F6C538', '#1C5C9C'], ['#59AB42', '#fff'], ['#E38835', '#EB318E']][(r * 400 | 0) % 4];
          for (let q = 0; q < 4; q++) { g.fillStyle = cs[q & 1]; g.beginPath(); g.moveTo(x, y); g.arc(x, y, 3.6, q * TAU / 4, (q + 1) * TAU / 4); g.fill(); } R(x - .5, y - .5, 1, 1, '#141414'); }
        else { R(x - 3, y, 6, 2, '#6a4a2c'); R(x - 3, y - 1, 6, 1, '#8a6a44'); R(x + 4, y - 3, 1, 4, '#2b2b2b'); R(x + 3, y - 4, 3, 1, '#ffe7a3'); lights.push([x + 3, y - 4, 3]); }
      } else if (v === TT.WALK && r < .4) {
        // árbol de andén (copa pequeña sobre la acera, del lado de la calle)
        const rd = q => q === TT.ROAD || q === TT.AVE || q === TT.AUTO, dx = rd(T(tx + 1, ty)) ? 4 : rd(T(tx - 1, ty)) ? -4 : 0, dy = rd(T(tx, ty + 1)) ? 4 : rd(T(tx, ty - 1)) ? -4 : 0;
        if (dx || dy) { const x = ox + (P >> 1) + dx, y = oy + (P >> 1) + dy, rr = 3 + h2(X, Y, 72) * 2; g.fillStyle = 'rgba(18,38,22,.35)'; g.beginPath(); g.ellipse(x + 2, y + 2, rr, rr * .7, 0, 0, TAU); g.fill(); g.fillStyle = '#2c5a2c'; g.beginPath(); g.arc(x, y, rr, 0, TAU); g.fill(); g.fillStyle = h2(X, Y, 73) < .2 ? '#c96bb0' : '#4b8640'; g.beginPath(); g.arc(x - .4, y - .5, rr * .75, 0, TAU); g.fill(); }
        else if (h2(X, Y, 74) < .25) { R(ox + 6, oy + 6, 4, 2, '#5a3a22'); R(ox + 6, oy + 5, 4, 1, '#7a5a3a'); }   // banca
      }
    }
    // techos de estación: andén techado con la franja del color de cada línea (las huellas vienen de MAP.estaciones)
    if (this.techos) { const kk = P / TM, X0 = cx * CH * TM, Y0 = cy * CH * TM, half = CH * TM / 2;
      for (const s of this.techos) {
        if (Math.abs(s.x - X0 - half) > half + s.w || Math.abs(s.y - Y0 - half) > half + s.w) continue; const w = s.w * kk, h = s.h * kk, bw = Math.max(2, Math.round(h / 6));
        g.save(); g.translate((s.x - X0) * kk, (s.y - Y0) * kk); g.rotate(s.a);
        g.fillStyle = 'rgba(0,0,0,.28)'; g.fillRect(-w / 2 + 3, -h / 2 + 3, w, h);
        g.fillStyle = s.k === 'cable' ? '#d6d0c4' : '#e9e5dc'; g.fillRect(-w / 2, -h / 2, w, h); g.fillStyle = '#8b877f'; g.fillRect(-w / 2, -h / 2, w, 1); g.fillRect(-w / 2, h / 2 - 1, w, 1); g.fillRect(-w / 2, -h / 2, 1, h); g.fillRect(w / 2 - 1, -h / 2, 1, h);
        if (s.k !== 'cable') { g.fillStyle = 'rgba(120,116,108,.45)'; for (let x = -w / 2 + 6; x < w / 2 - 3; x += 8) g.fillRect(x, -h / 2 + 2, 1, h - 4); }
        s.cols.forEach((c, i) => { g.fillStyle = c; g.fillRect(-w / 2 + 2, -bw * s.cols.length / 2 + i * bw, w - 4, bw); });
        if (s.k === 'cable') { g.fillStyle = '#5b5f66'; g.beginPath(); g.arc(0, 0, Math.min(w, h) * .22, 0, TAU); g.fill(); g.fillStyle = s.cols[0]; g.beginPath(); g.arc(0, 0, Math.min(w, h) * .12, 0, TAU); g.fill(); }
        g.restore(); lights.push([(s.x - X0) * kk - 2, (s.y - Y0) * kk - 1, 4]);
      }
    }
    // capa de luces (ventanas encendidas) cacheada: se mezcla de noche con 'lighter'
    c.lights = lights; this.chunks.set(key, c); while (this.chunks.size > this.maxTrozos()) this.chunks.delete(this.chunks.keys().next().value);
    return c;
  },
  /* dibuja el mapa cenital: centro (mx,my) en metros, escala k px/m. Con night > 0 enciende ventanas */
  drawTop(g, W, H, mx, my, k, night = 0) {
    const CHm = this.CH * TM, s = k * TM / this.PX;
    const x0 = mx - W / 2 / k, y0 = my - H / 2 / k, x1 = mx + W / 2 / k, y1 = my + H / 2 / k;
    g.imageSmoothingEnabled = s < .95; this._vis = [];   // al alejar, suavizado: sin titileo de rayas y bordes
    for (let cy = Math.floor(y0 / CHm); cy <= Math.floor(y1 / CHm); cy++) for (let cx = Math.floor(x0 / CHm); cx <= Math.floor(x1 / CHm); cx++) {
      if (cx < 0 || cy < 0 || cx * this.CH >= MW || cy * this.CH >= MH) continue;
      const sx = Math.floor((cx * CHm - x0) * k), sy = Math.floor((cy * CHm - y0) * k);
      if (!this.chunks.has(cx + ',' + cy) && this.prisa && this._hechos > 0 && now() > this.prisa) { g.fillStyle = TCOL[this.tile(cx * this.CH + 16, cy * this.CH + 16)]; g.fillRect(sx, sy, Math.ceil(CHm * k) + 1, Math.ceil(CHm * k) + 1); this.pend = 1; continue; }
      if (!this.chunks.has(cx + ',' + cy)) this._hechos = (this._hechos || 0) + 1;
      const c = this.chunk(cx, cy); g.drawImage(c, sx, sy, Math.ceil(c.width * s) + 1, Math.ceil(c.height * s) + 1); this._vis.push([c, sx, sy, s]);
    }
  },
  /* ---------- rótulos como en un mapa real: calles (con su dirección), barrios y parques ---------- */
  rotulosTrozo(cx, cy) {
    const CH = this.CH, x0 = cx * CH, x1 = x0 + CH, G = new Map(), out = [];
    for (let ty = cy * CH; ty < Math.min(MH, (cy + 1) * CH); ty++) {
      let a = this.rRow[ty], b = this.rRow[ty + 1]; while (a < b) { const m = (a + b) >> 1; if (this.rX[m] < x0) a = m + 1; else b = m; }
      for (let i = a; i < this.rRow[ty + 1] && this.rX[i] < x1; i++) for (const [L, id] of [[1, this.rP[i]], [0, this.rN[i]], [2, this.rE && !this.rN[i] && !this.rP[i] ? this.rE[i] : 0]]) {
        if (!id) continue; const key = L * 65536 + id; let q = G.get(key); if (!q) G.set(key, q = { L, id, n: 0, sx: 0, sy: 0, xx: 0, yy: 0, xy: 0, pts: [] });
        const x = this.rX[i] + .5, y = ty + .5; q.n++; q.sx += x; q.sy += y; q.xx += x * x; q.yy += y * y; q.xy += x * y; q.pts.push(x, y);
      }
    }
    const norm = s => String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''), ofi = new Set(); for (const q of G.values()) if (q.L !== 2) ofi.add(norm(CIUDAD.calles[q.id][0]));
    for (const q of G.values()) {
      if (q.n < (q.L === 1 ? 4 : 3) || (q.L === 2 && ofi.has(norm(AJUSTES.calles.lista[q.id - 1])))) continue; const mx = q.sx / q.n, my = q.sy / q.n, vx = q.xx / q.n - mx * mx, vy = q.yy / q.n - my * my, cxy = q.xy / q.n - mx * my;
      let a = .5 * Math.atan2(2 * cxy, vx - vy); if (a > Math.PI / 2) a -= Math.PI; if (a < -Math.PI / 2) a += Math.PI;
      let best = 0, bd = 1e9; for (let i = 0; i < q.pts.length; i += 2) { const d = (q.pts[i] - mx) ** 2 + (q.pts[i + 1] - my) ** 2; if (d < bd) { bd = d; best = i; } }
      const nm = q.L === 2 ? AJUSTES.calles.lista[q.id - 1] : CIUDAD.calles[q.id][0], av = /^(Avenida|Autopista|Vía|Doble|Troncal|Circular|Diagonal|Transversal)/.test(nm);
      out.push({ x: q.pts[best] * TM, y: q.pts[best + 1] * TM, a, t: nm, pri: q.L === 1 ? 3 : av ? 2 : 1, len: Math.sqrt(Math.max(vx, vy)) * 2 * TM });
    }
    return out.sort((p, q) => q.pri - p.pri || q.len - p.len);
  },
  drawLabels(g, W, H, mx, my, k, dpr = 1, night = 0) {
    if (!this.ready || typeof CIUDAD === 'undefined' || !this.rRow) return; const kc = k / dpr, S = (x, y) => [W / 2 + (x - mx) * k, H / 2 + (y - my) * k], boxes = [];
    const libre = (x0, y0, x1, y1) => { for (const b of boxes) if (x0 < b[2] && x1 > b[0] && y0 < b[3] && y1 > b[1]) return false; boxes.push([x0, y0, x1, y1]); return true; };
    const ink = night > .4 ? '#f4ecd0' : '#1d2733', halo = night > .4 ? 'rgba(10,16,26,.85)' : 'rgba(250,246,236,.92)';
    g.save(); g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
    const texto = (t, x, y, a, f, col, hal, lw) => { g.font = f; const w = g.measureText(t).width, h = parseFloat(f.match(/(\d+(\.\d+)?)px/)[1]), c = Math.abs(Math.cos(a)), sn = Math.abs(Math.sin(a)), bw = (w * c + h * sn) / 2 + 3 * dpr, bh = (w * sn + h * c) / 2 + 2 * dpr;
      if (x + bw < 0 || y + bh < 0 || x - bw > W || y - bh > H || !libre(x - bw, y - bh, x + bw, y + bh)) return; g.save(); g.translate(x, y); g.rotate(a); g.strokeStyle = hal; g.lineWidth = lw; g.strokeText(t, 0, 0); g.fillStyle = col; g.fillText(t, 0, 0); g.restore(); };
    // calles (a pie, en bici o en carro)
    if (kc >= .75) {
      const fs = clamp(kc * 5.2, 9, 13) * dpr, CHm = this.CH * TM, x0 = mx - W / 2 / k, y0 = my - H / 2 / k, x1 = mx + W / 2 / k, y1 = my + H / 2 / k;
      for (let cy = Math.floor(y0 / CHm); cy <= Math.floor(y1 / CHm); cy++) for (let cx = Math.floor(x0 / CHm); cx <= Math.floor(x1 / CHm); cx++) {
        if (cx < 0 || cy < 0 || cx * this.CH >= MW || cy * this.CH >= MH || (this.prisa && !this.chunks.has(cx + ',' + cy))) continue; const c = this.chunk(cx, cy); if (!c.rot) c.rot = this.rotulosTrozo(cx, cy);
        for (const r of c.rot) { if (r.len < (r.pri === 3 ? 60 : 40)) continue; const [x, y] = S(r.x, r.y); texto(r.pri === 3 ? r.t.toUpperCase() : r.t, x, y, r.a, (r.pri >= 2 ? '800 ' : '700 ') + (r.pri === 3 ? fs * .95 : fs) + 'px Cuerpo, sans-serif', r.pri === 3 ? (night > .4 ? '#ffd27a' : '#5a3a12') : ink, halo, 3.2 * dpr); }
      }
    }
    // parques, plazas y miradores
    if (kc >= .6) for (const L of this.lugaresL || CIUDAD.lugares) {
      if (L[1] === 'verde' && (kc < 1.4 || L[4] < 8)) continue; if (kc < 1 && L[4] < 30) continue;
      const [x, y] = S(L[2] / 4 * TM, L[3] / 4 * TM); if (x < -80 || y < -40 || x > W + 80 || y > H + 40) continue;
      const met = L[1] === 'metro' || L[1] === 'historia';
      texto((met ? '■ ' : L[1] === 'plaza' || L[1] === 'plazoleta' ? '◆ ' : L[1] === 'mirador' ? '▲ ' : '♣ ') + L[0], x, y, 0, 'italic 700 ' + clamp(kc * 4.6, 9, 12) * dpr + 'px Cuerpo, sans-serif', met ? (night > .4 ? '#a9cdf2' : '#1C5C9C') : night > .4 ? '#b9e6a0' : '#245a2a', halo, 3 * dpr);
    }
    // barrios: a media distancia, en mayúsculas espaciadas
    if (kc >= .14 && kc < 1.6) for (const B of this.barriosL || CIUDAD.barrios) {
      if (!B[6] && kc < .9) continue; if (B[5] < (kc < .3 ? 60 : kc < .6 ? 18 : 4)) continue;
      const [x, y] = S(B[3] / 4 * TM, B[4] / 4 * TM); if (x < -120 || y < -30 || x > W + 120 || y > H + 30) continue;
      texto(B[0].toUpperCase().split('').join(String.fromCharCode(8202)), x, y, 0, '800 ' + clamp(kc * 9, 9, 14) * dpr + 'px Cuerpo, sans-serif', night > .4 ? 'rgba(255,236,190,.92)' : 'rgba(35,45,70,.78)', halo, 3.4 * dpr);
    }
    g.restore();
  },
  /* trozos en caché según la memoria del equipo: cada uno ocupa ~1 MB de imagen (2 con las luces de noche) */
  maxTrozos() { if (!this._maxT) { const m = navigator.deviceMemory || 4, low = typeof Save !== 'undefined' && Save.d && Save.d.settings && Save.d.settings.q === 'low'; this._maxT = low || m <= 2 ? 16 : m <= 4 ? 28 : 40; } return this._maxT; },
  /* capa de luces de ventanas de un trozo: se crea la primera vez que se necesita (solo de noche) */
  luces(c) {
    if (c.lightCv) return c.lightCv; const n = c.width, lc = mkCanvas(n, n), lg = lc.getContext('2d');
    for (const [x, y, w] of c.lights || []) { const h = h2(x, y, 3); if (h > .62) continue; lg.fillStyle = 'rgba(255,' + (196 + (h * 90 | 0)) + ',110,' + (.55 + .45 * h2(x, y, 9)) + ')'; lg.fillRect(x, y, w, 1); if (h < .2) { lg.fillStyle = 'rgba(255,210,120,.25)'; lg.fillRect(x - 1, y - 1, w + 2, 3); } }
    return (c.lightCv = lc);
  },
  /* luces de ventanas (después del tinte de la noche) */
  lightsTop(g, night, t) {
    if (night < .25 || !this._vis) return; g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = clamp(night * (.85 + .15 * Math.sin(t * 1.7)), 0, 1); g.imageSmoothingEnabled = false;
    for (const [c, sx, sy, s] of this._vis) g.drawImage(this.luces(c), sx, sy, Math.ceil(c.width * s) + 1, Math.ceil(c.height * s) + 1);
    g.restore();
  },
  /* ---------- panorámica: mapa entero con sombreado del relieve (1 px = 2 casillas) ---------- */
  mini() {
    if (this._mini) return this._mini; const K = 2, w = Math.ceil(MW / K), h = Math.ceil(MH / K), c = mkCanvas(w, h), g = c.getContext('2d'), img = g.createImageData(w, h), d = img.data;
    const rank = [1, 0, 2, 3, 6, 7, 5, 8, 4, 3, 2, 6, 9, 2, 8, 7, 4];
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      let v = this.tile(x * K, y * K), r = rank[v];
      for (let j = 0; j < K; j++) for (let i = 0; i < K; i++) { const u = this.tile(x * K + i, y * K + j); if (rank[u] > r) { r = rank[u]; v = u; } }
      const X = x * K * TM, Y = y * K * TM, e = this.elevM(X, Y), sh = clamp(1 + (this.elevM(X - 60, Y - 60) - e) * .008, .62, 1.3), hz = clamp(1 - (e - 1450) / 2600, .75, 1), col = TRGB[v], o = (y * w + x) * 4;
      d[o] = clamp(col[0] * sh * hz + (1 - hz) * 120, 0, 255); d[o + 1] = clamp(col[1] * sh * hz + (1 - hz) * 130, 0, 255); d[o + 2] = clamp(col[2] * sh * hz + (1 - hz) * 140, 0, 255); d[o + 3] = 255;
    }
    g.putImageData(img, 0, 0); this._mini = c; this.miniK = K * TM; return c;
  },
  /* camino más corto sobre la grilla (A*) para buses: pruebas y rutas nuevas */
  roadOK(v) { return v === TT.ROAD || v === TT.AVE || v === TT.AUTO || v === TT.BRIDGE; }
};
