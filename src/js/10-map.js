/* =====================================================================
   MAPA REAL DEL VALLE DE ABURRÁ (de Caldas a Barbosa) · casillas de 20 m
   Datos de Juega EnCicla: calles, río, quebradas, parques, municipios y relieve.
   Unidad del mundo: METROS. x = este, y = sur. Fila 0 = norte.
   ===================================================================== */
const VM = VALLE_META, MW = VM.W, MH = VM.H, TM = VM.tile, ES = VM.es;
const TT = { GRASS: 0, MOUNT: 1, BRICK: 2, BLDG: 3, ROAD: 4, AVE: 5, WALK: 6, CICLO: 7, WATER: 8, CANAL: 9, PLAZA: 10, BRIDGE: 11, STATION: 12, LAND: 13, AUTO: 14, DEPOT: 15, STEPS: 16 };
const TCOL = ['#6f9a4a', '#3d6838', '#b4583a', '#8d97a4', '#4b5059', '#3f444d', '#bdb6a5', '#3f9a50', '#3a87a8', '#4b7f8c', '#d9cdae', '#6d6f75', '#f4ecd0', '#a99a7a', '#34383f', '#5ab0d0', '#a39882'];
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
    this.ready = true;
  },
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
    const RS = CH + 2, RK = new Uint8Array(RS * RS), RW = new Uint8Array(RS * RS), RP = new Uint8Array(RS * RS), ri = (x, y) => (y + 1) * RS + x + 1;
    // se mide con las vías del MISMO tipo (autopista, avenida y calle vienen pegadas en los datos); un cruce es donde llega una vía transversal
    const runV = (x, y) => { let n = 1; for (let k = 1; k < 5 && road(T(x, y - k)); k++) n++; for (let k = 1; k < 5 && road(T(x, y + k)); k++) n++; return n; };
    const runH = (x, y) => { let n = 1; for (let k = 1; k < 5 && road(T(x - k, y)); k++) n++; for (let k = 1; k < 5 && road(T(x + k, y)); k++) n++; return n; };
    for (let y = -1; y <= CH; y++) for (let x = -1; x <= CH; x++) {
      const v = T(x, y); if (!road(v) || v === TT.BRIDGE) continue; let l = 0, r = 0, u = 0, w = 0;
      while (l < 9 && T(x - l - 1, y) === v) l++; while (r < 9 && T(x + r + 1, y) === v) r++; while (u < 9 && T(x, y - u - 1) === v) u++; while (w < 9 && T(x, y + w + 1) === v) w++;
      const h = l + r + 1, vv = u + w + 1, k = ri(x, y);
      if (vv >= h + 3 && h <= 9) {
        const xa = x - l - 1, xb = x + r + 1, cruce = (road(T(xa, y)) && T(xa, y) !== TT.BRIDGE && runV(xa, y) <= 3) || (road(T(xb, y)) && T(xb, y) !== TT.BRIDGE && runV(xb, y) <= 3);
        if (cruce) RK[k] = 3; else { RK[k] = 1; RW[k] = h; RP[k] = l; }
      } else if (h >= vv + 3 && vv <= 9) {
        const ya = y - u - 1, yb = y + w + 1, cruce = (road(T(x, ya)) && T(x, ya) !== TT.BRIDGE && runH(x, ya) <= 3) || (road(T(x, yb)) && T(x, yb) !== TT.BRIDGE && runH(x, yb) <= 3);
        if (cruce) RK[k] = 3; else { RK[k] = 2; RW[k] = vv; RP[k] = u; }
      } else RK[k] = 3;
    }
    const RKa = (x, y) => RK[ri(x, y)];
    for (let ty = 0; ty < CH; ty++) for (let tx = 0; tx < CH; tx++) {
      const X = cx * CH + tx, Y = cy * CH + ty, v = T(tx, ty), base = TRGB[v] || TRGB[0], e = this.elevM(X * TM, Y * TM), sh = clamp(1 + (this.elevM(X * TM - 40, Y * TM - 40) - e) * .011, .74, 1.22);
      const nN = T(tx, ty - 1), nS = T(tx, ty + 1), nW = T(tx - 1, ty), nE = T(tx + 1, ty), k0 = ri(tx, ty), rk = RK[k0], rw = RW[k0], rp = RP[k0];
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
            const edge = (py === 0 && !road(nN)) || (py === P - 1 && !road(nS)) || (px === 0 && !road(nW)) || (px === P - 1 && !road(nE));
            if (edge) { col = v === TT.BRIDGE ? [70, 70, 76] : [201, 194, 178]; m = sh; break; }
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
          case TT.WALK: m *= (px % 4 === 0 || py % 4 === 0) ? .955 : 1.015 + (h2((X * P + px) >> 2, (Y * P + py) >> 2, 5) - .5) * .05; break;
          case TT.PLAZA: m *= (((px >> 1) + (py >> 1)) % 2 ? .965 : 1.02) * ((px % 8 === 0 || py % 8 === 0) ? .93 : 1); break;
          case TT.CICLO: { const a = cvert ? px : py, al = cvert ? Y * P + py : X * P + px; col = [189, 182, 165]; m *= (px % 4 === 0 || py % 4 === 0) ? .955 : 1.01;
            if (a >= 5 && a <= 10) { col = a === 5 || a === 10 ? [236, 234, 226] : [64, 138, 96]; m = sh * (a === 7 || a === 8 ? (al % 8 < 4 ? 1.02 : .97) : 1); } break; }
          case TT.WATER: case TT.CANAL: {
            const db = Math.min(wet(nN) ? 99 : py, wet(nS) ? 99 : P - 1 - py, wet(nW) ? 99 : px, wet(nE) ? 99 : P - 1 - px);
            if (v === TT.CANAL) { if (db === 0) { col = [206, 202, 192]; m = sh; break; } if (db === 1) { col = [126, 124, 118]; m = sh; break; } col = [72, 120, 120]; }
            else { if (db === 0) { col = [92, 120, 70]; m = sh * (hh < .5 ? 1 : .9); break; } col = [58, 118, 138]; }
            m *= db === 2 ? .86 : db === 3 ? .94 : 1; const rp2 = ((X * P + px) * 3 + (Y * P + py) * 7 + ((X * P + px) >> 3)) % 29; if (rp2 === 0 && hh < .7) m *= 1.16; else if (hh < .012) m *= 1.3;   // brillos sueltos, sin rayas
            break; }
          case TT.STEPS: { const up = stx > sty, a = up ? px : py, s2 = up ? py : px; col = [198, 192, 180]; if (s2 === 0 || s2 === P - 1) { col = [120, 116, 108]; m = sh; } else m *= a % 3 === 0 ? .8 : a % 3 === 1 ? 1.06 : 1; break; }
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
        // casas de barrio: 2 o 3 lotes por casilla, techos de teja, eternit o plancha con tanque; fachada hacia el sur
        const nS = T(tx, ty + 1), nN = T(tx, ty - 1), streetS = nS !== TT.BRICK && nS !== TT.BLDG, nh = 2 + (h2(X, Y, 50) < .35 ? 1 : 0), hw = P / nh;
        for (let i = 0; i < nh; i++) {
          const hx = ox + Math.round(i * hw), w = Math.round((i + 1) * hw) - Math.round(i * hw), rr = h2(X * 3 + i, Y, 51), typ = rr < .42 ? 'teja' : rr < .7 ? 'plancha' : 'eternit', top = oy + (nN === TT.BRICK ? 0 : 1), hh = P - (top - oy) - (streetS ? 2 : 0);
          const roof = typ === 'teja' ? ['#b4583a', '#a24b30', '#c4683f', '#8e4128'][(rr * 97 | 0) % 4] : typ === 'plancha' ? ['#b7b2a8', '#a9a49a', '#c2bdb2'][(rr * 31 | 0) % 3] : ['#8f979c', '#9aa2a6', '#7f878c'][(rr * 13 | 0) % 3];
          R(hx, top, w, hh, roof);
          if (typ === 'teja') { R(hx, top + (hh >> 1), w, 1, Art.shade(roof, 1.25)); for (let yy = top + 2; yy < top + hh - 1; yy += 2) R(hx + 1, yy, w - 2, 1, Art.shade(roof, (yy - top) < (hh >> 1) ? .9 : .8)); }
          else if (typ === 'eternit') { for (let xx = hx + 1; xx < hx + w - 1; xx += 2) R(xx, top + 1, 1, hh - 2, Art.shade(roof, .82)); }
          else { R(hx + 1, top + 1, w - 2, 1, Art.shade(roof, 1.12)); if (rr < .55) { R(hx + 2, top + 2, 4, 4, '#141414'); R(hx + 2, top + 2, 3, 3, rr < .5 ? '#2f5f9c' : '#1d1d1d'); R(hx + 2, top + 2, 1, 1, '#9cc0e6'); } if (h2(X, i, 52) < .45) { g.fillStyle = 'rgba(30,30,30,.55)'; for (let q = 0; q < 4; q++) g.fillRect(hx + w - 3, top + 1 + q * 3, 1, 1); } if (h2(Y, i, 53) < .3) { R(hx + 1, top + hh - 4, w - 2, 1, '#d9d9d9'); for (let q = 0; q < w - 3; q += 2) R(hx + 2 + q, top + hh - 3, 1, 2, ['#EC343A', '#F6C538', '#1C5C9C', '#fff'][q & 3]); } }
          R(hx, top, 1, hh, 'rgba(20,20,20,.55)');   // medianera
          if (streetS) { const wall = h2(X, i, 54) < .55 ? BRICKS[(rr * 7 | 0) % 4] : WALLS[(rr * 97 | 0) % WALLS.length]; R(hx, oy + P - 2, w, 5, wall); R(hx, oy + P + 3, w, 1, 'rgba(0,0,0,.35)'); R(hx + 1 + (rr * (w - 3) | 0), oy + P - 1, 2, 4, '#3a2a20'); const wx = hx + (rr < .5 ? w - 3 : 1); R(wx, oy + P - 1, 2, 2, '#28435a'); lights.push([wx, oy + P - 1, 2]); }
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
      } else if (v === TT.AVE && (RK[ri(tx, ty)] === 1 || RK[ri(tx, ty)] === 2) && RW[ri(tx, ty)] >= 2) {
        // árboles del separador, uno cada dos casillas a lo largo
        const vert = RK[ri(tx, ty)] === 1, rp = RP[ri(tx, ty)], mid = RW[ri(tx, ty)] * P / 2, t0 = Math.floor(mid / P);
        if (rp === t0 && ((vert ? Y : X) & 1) === 0 && h2(vert ? X - rp : X, vert ? Y : Y - rp, 99) < .8) {
          const loc = mid - t0 * P, x = vert ? ox + loc : ox + (P >> 1), y = vert ? oy + (P >> 1) : oy + loc, rr = 3.2 + h2(X, Y, 72) * 1.6;
          g.fillStyle = 'rgba(18,38,22,.35)'; g.beginPath(); g.ellipse(x + 1.5, y + 1.5, rr, rr * .7, 0, 0, TAU); g.fill(); g.fillStyle = '#2c5a2c'; g.beginPath(); g.arc(x, y, rr, 0, TAU); g.fill(); g.fillStyle = h2(X, Y, 73) < .15 ? '#e0b830' : h2(X, Y, 74) < .15 ? '#c96bb0' : '#4b8640'; g.beginPath(); g.arc(x - .4, y - .5, rr * .72, 0, TAU); g.fill();
        }
      } else if ((v === TT.ROAD) && r < .3 && (RK[ri(tx, ty)] === 1 || RK[ri(tx, ty)] === 2)) {
        // carro parqueado junto al andén
        const nN2 = T(tx, ty - 1), nS2 = T(tx, ty + 1), nW2 = T(tx - 1, ty), nE2 = T(tx + 1, ty), rd = q => q === TT.ROAD || q === TT.AVE || q === TT.AUTO || q === TT.BRIDGE, horiz = rd(nW2) || rd(nE2), col = ['#c43a26', '#2a5a92', '#e9eef3', '#1d1f24', '#9aa7b8', '#f2c400', '#3d6b3a', '#d98a3a'][(r * 97 | 0) % 8];
        if (horiz && !rd(nS2)) { const x = ox + 3 + (h2(X, Y, 70) * 5 | 0), y = oy + P - 6; R(x - 1, y - 1, 9, 5, '#141414'); R(x, y, 7, 3, col); R(x + 2, y, 3, 3, Art.shade(col, 1.15)); R(x + 5, y, 1, 3, '#1f2e3d'); }
        else if (!horiz && !rd(nE2)) { const x = ox + P - 6, y = oy + 3 + (h2(X, Y, 71) * 5 | 0); R(x - 1, y - 1, 5, 9, '#141414'); R(x, y, 3, 7, col); R(x, y + 2, 3, 3, Art.shade(col, 1.15)); R(x, y + 5, 3, 1, '#1f2e3d'); }
      } else if (v === TT.WALK && r < .4) {
        // árbol de andén (copa pequeña sobre la acera, del lado de la calle)
        const rd = q => q === TT.ROAD || q === TT.AVE || q === TT.AUTO, dx = rd(T(tx + 1, ty)) ? 4 : rd(T(tx - 1, ty)) ? -4 : 0, dy = rd(T(tx, ty + 1)) ? 4 : rd(T(tx, ty - 1)) ? -4 : 0;
        if (dx || dy) { const x = ox + (P >> 1) + dx, y = oy + (P >> 1) + dy, rr = 3 + h2(X, Y, 72) * 2; g.fillStyle = 'rgba(18,38,22,.35)'; g.beginPath(); g.ellipse(x + 2, y + 2, rr, rr * .7, 0, 0, TAU); g.fill(); g.fillStyle = '#2c5a2c'; g.beginPath(); g.arc(x, y, rr, 0, TAU); g.fill(); g.fillStyle = h2(X, Y, 73) < .2 ? '#c96bb0' : '#4b8640'; g.beginPath(); g.arc(x - .4, y - .5, rr * .75, 0, TAU); g.fill(); }
        else if (h2(X, Y, 74) < .25) { R(ox + 6, oy + 6, 4, 2, '#5a3a22'); R(ox + 6, oy + 5, 4, 1, '#7a5a3a'); }   // banca
      }
    }
    // capa de luces (ventanas encendidas) cacheada: se mezcla de noche con 'lighter'
    const lc = mkCanvas(n, n), lg = lc.getContext('2d'); for (const [x, y, w] of lights) { const h = h2(x, y, 3); if (h > .62) continue; lg.fillStyle = 'rgba(255,' + (196 + (h * 90 | 0)) + ',110,' + (.55 + .45 * h2(x, y, 9)) + ')'; lg.fillRect(x, y, w, 1); if (h < .2) { lg.fillStyle = 'rgba(255,210,120,.25)'; lg.fillRect(x - 1, y - 1, w + 2, 3); } }
    c.lightCv = lc; this.chunks.set(key, c); while (this.chunks.size > 40) this.chunks.delete(this.chunks.keys().next().value);
    return c;
  },
  /* dibuja el mapa cenital: centro (mx,my) en metros, escala k px/m. Con night > 0 enciende ventanas */
  drawTop(g, W, H, mx, my, k, night = 0) {
    const CHm = this.CH * TM, s = k * TM / this.PX;
    const x0 = mx - W / 2 / k, y0 = my - H / 2 / k, x1 = mx + W / 2 / k, y1 = my + H / 2 / k;
    g.imageSmoothingEnabled = s < .95; this._vis = [];   // al alejar, suavizado: sin titileo de rayas y bordes
    for (let cy = Math.floor(y0 / CHm); cy <= Math.floor(y1 / CHm); cy++) for (let cx = Math.floor(x0 / CHm); cx <= Math.floor(x1 / CHm); cx++) {
      if (cx < 0 || cy < 0 || cx * this.CH >= MW || cy * this.CH >= MH) continue;
      const c = this.chunk(cx, cy), sx = Math.floor((cx * CHm - x0) * k), sy = Math.floor((cy * CHm - y0) * k);
      g.drawImage(c, sx, sy, Math.ceil(c.width * s) + 1, Math.ceil(c.height * s) + 1); this._vis.push([c, sx, sy, s]);
    }
  },
  /* luces de ventanas (después del tinte de la noche) */
  lightsTop(g, night, t) {
    if (night < .25 || !this._vis) return; g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = clamp(night * (.85 + .15 * Math.sin(t * 1.7)), 0, 1); g.imageSmoothingEnabled = false;
    for (const [c, sx, sy, s] of this._vis) g.drawImage(c.lightCv, sx, sy, Math.ceil(c.width * s) + 1, Math.ceil(c.height * s) + 1);
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
