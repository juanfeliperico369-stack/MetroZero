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
    const CH = this.CH, P = this.PX, n = CH * P; c = mkCanvas(n, n); const g = c.getContext('2d'), img = g.createImageData(n, n), d = img.data, T = (x, y) => this.tile(cx * CH + x, cy * CH + y);
    const road = v => v === TT.ROAD || v === TT.AVE || v === TT.AUTO || v === TT.BRIDGE;
    for (let ty = 0; ty < CH; ty++) for (let tx = 0; tx < CH; tx++) {
      const X = cx * CH + tx, Y = cy * CH + ty, v = T(tx, ty), base = TRGB[v] || TRGB[0], e = this.elevM(X * TM, Y * TM), sh = clamp(1 + (this.elevM(X * TM - 40, Y * TM - 40) - e) * .011, .74, 1.22);
      const nN = T(tx, ty - 1), nS = T(tx, ty + 1), nW = T(tx - 1, ty), nE = T(tx + 1, ty);
      for (let py = 0; py < P; py++) for (let px = 0; px < P; px++) {
        let m = sh, col = base; const hh = h2(X * P + px, Y * P + py, v), chk = (px + py) % 2;
        switch (v) {
          case TT.GRASS: m *= chk ? .95 : 1.02; if (hh < .02) col = [[236, 232, 210], [246, 197, 56], [235, 49, 142]][(hh * 150) | 0]; break;
          case TT.MOUNT: m *= .9 + (chk ? 0 : .05); break;
          case TT.BRICK: case TT.BLDG: col = [96, 112, 74]; m *= chk ? .95 : 1; break;   // patio (la casa se pinta encima)
          case TT.ROAD: case TT.AVE: case TT.AUTO: case TT.BRIDGE: {
            m *= .97 + hh * .05; const edge = (py === 0 && !road(nN)) || (py === P - 1 && !road(nS)) || (px === 0 && !road(nW)) || (px === P - 1 && !road(nE));
            if (edge) { col = v === TT.BRIDGE ? [70, 70, 76] : [201, 194, 178]; m = sh; }
            else if (v !== TT.ROAD && ((road(nN) || road(nS)) && px === (P >> 1) && py % 4 < 2 || (road(nW) || road(nE)) && !(road(nN) || road(nS)) && py === (P >> 1) && px % 4 < 2)) { col = [244, 236, 208]; m = sh; }
            break; }
          case TT.WALK: case TT.PLAZA: m *= (px % 3 === 0 || py % 3 === 0) ? .9 : 1.02; break;
          case TT.CICLO: if (px === P >> 1 && py % 4 < 2) { col = [250, 250, 245]; m = sh; } break;
          case TT.WATER: case TT.CANAL: { const nb = !(nN === v) || !(nS === v); m *= (py + Math.floor(X * 1.7)) % 5 === 0 && hh < .6 ? 1.18 : nb && (py < 2 || py > P - 3) ? .82 : 1; break; }
          case TT.STEPS: m *= py % 2 ? .85 : 1.05; break;
          default: m *= .95 + hh * .08;
        }
        const o = ((ty * P + py) * n + tx * P + px) * 4; d[o] = clamp(col[0] * m, 0, 255); d[o + 1] = clamp(col[1] * m, 0, 255); d[o + 2] = clamp(col[2] * m, 0, 255); d[o + 3] = 255;
      }
    }
    g.putImageData(img, 0, 0);
    // segunda pasada (de norte a sur): árboles y casas en 3/4 que se montan sobre la fila de abajo
    const lights = [], R = (x, y, w, h, col) => { g.fillStyle = col; g.fillRect(x, y, w, h); };
    const WALLS = ['#efe3c8', '#f2cfae', '#d6e6d2', '#e9c9c9', '#f4e2a0', '#cfe0ea', '#e2d4ee', '#f7efe2'], ROOFS = ['#b4583a', '#a24b30', '#c4683f', '#8e4128'];
    for (let ty = 0; ty < CH; ty++) for (let tx = 0; tx < CH; tx++) {
      const X = cx * CH + tx, Y = cy * CH + ty, v = T(tx, ty), ox = tx * P, oy = ty * P, r = h2(X, Y, 11);
      if (v === TT.GRASS && r < .28 || v === TT.MOUNT) {
        const nt = v === TT.MOUNT ? 2 + (r * 2 | 0) : 1;
        for (let k = 0; k < nt; k++) { const rr = 3.5 + h2(X, Y, 20 + k) * 3.5, x = ox + 3 + h2(X, Y, 30 + k) * (P - 6), y = oy + 3 + h2(X, Y, 40 + k) * (P - 6), dk = v === TT.MOUNT ? .85 : 1;
          g.fillStyle = 'rgba(18,38,22,.4)'; g.beginPath(); g.ellipse(x + rr * .7, y + rr * .8, rr, rr * .7, 0, 0, TAU); g.fill();
          g.fillStyle = Art.shade('#2c5a2c', dk); g.beginPath(); g.arc(x, y, rr, 0, TAU); g.fill(); g.fillStyle = Art.shade(['#3f7a3a', '#4b8640', '#3a7246'][(r * 3) | 0], dk); g.beginPath(); g.arc(x - .5, y - .6, rr * .78, 0, TAU); g.fill();
          g.fillStyle = Art.shade('#79ac56', dk); g.fillRect(x - rr * .5, y - rr * .6, 2, 2); g.fillRect(x - rr * .1, y - rr * .75, 1.5, 1.5); g.fillRect(x + rr * .2, y - rr * .3, 1.5, 1.5); }
      } else if (v === TT.BRICK) {
        const wall = r < .55 ? (r < .3 ? '#b85c3e' : '#a9533a') : WALLS[(r * 97 | 0) % WALLS.length], roof = ROOFS[(r * 31 | 0) % ROOFS.length], fh = 5, two = r > .8;
        R(ox + 3, oy + 4, P - 2, P - 2, 'rgba(0,0,0,.28)');   // sombra proyectada
        R(ox + 1, oy + 1, P - 2, P - 3, '#141414'); R(ox + 1, oy + 1, P - 2, P - 4, roof); R(ox + 1, oy + 2 + ((P - 4) >> 1), P - 2, 1, Art.shade(roof, 1.25)); for (let yy = oy + 3; yy < oy + P - 4; yy += 3) R(ox + 2, yy, P - 4, 1, Art.shade(roof, .9));
        if (two) R(ox + P - 6, oy + 3, 3, 3, Art.shade(roof, .7));
        R(ox + 1, oy + P - 3, P - 2, fh, wall); R(ox + 1, oy + P - 3 + fh, P - 2, 1, 'rgba(0,0,0,.35)');
        R(ox + 2 + (r * 5 | 0), oy + P - 2, 2, 4, '#3a2a20'); const wx = ox + P - 5, wy = oy + P - 2; R(wx, wy, 2, 2, '#28435a'); lights.push([wx, wy, 2]); if (r < .5) { R(ox + 3, oy + P - 1, 2, 2, '#28435a'); lights.push([ox + 3, oy + P - 1, 2]); }
      } else if (v === TT.BLDG) {
        const hgt = 4 + (r * 7 | 0), roof = r < .5 ? '#9aa0a6' : '#b9b5ad', wall = ['#d8d2c4', '#c9ced4', '#e6dcc8', '#b8c4cc', '#cfd9df'][(r * 5) | 0];
        R(ox + 4, oy + 5, P, P, 'rgba(0,0,0,.3)');   // sombra proyectada
        R(ox, oy, P, P - 2, '#141414'); R(ox + 1, oy + 1, P - 2, P - 4, roof); R(ox + 2, oy + 2, 4, 3, Art.shade(roof, .85)); if (r < .4) { R(ox + P - 6, oy + 3, 3, 3, '#7d8792'); R(ox + P - 5, oy + 4, 1, 1, '#d9d9d9'); } if (r > .7) R(ox + 2, oy + P - 8, 5, 2, Art.shade(roof, .75));
        R(ox + 1, oy + P - 3, P - 2, hgt, wall); for (let wy = oy + P - 2; wy < oy + P - 3 + hgt - 1; wy += 3) for (let wx = ox + 2; wx < ox + P - 2; wx += 3) { R(wx, wy, 2, 2, '#2a4560'); lights.push([wx, wy, 2]); }
        R(ox + 1, oy + P - 3 + hgt, P - 2, 1, 'rgba(0,0,0,.35)');
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
    g.imageSmoothingEnabled = false; this._vis = [];
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
