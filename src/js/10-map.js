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
  t: null, E: null, ready: false, chunks: new Map(), CH: 32, PX: 8,
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
  /* ---------- vista cenital: trozos de 32×32 casillas pintados en pixel art ---------- */
  chunk(cx, cy) {
    const k = cx + ',' + cy; let c = this.chunks.get(k); if (c) { this.chunks.delete(k); this.chunks.set(k, c); return c; }
    const CH = this.CH, P = this.PX, n = CH * P; c = mkCanvas(n, n); const g = c.getContext('2d'), img = g.createImageData(n, n), d = img.data;
    for (let ty = 0; ty < CH; ty++) for (let tx = 0; tx < CH; tx++) {
      const X = cx * CH + tx, Y = cy * CH + ty, v = this.tile(X, Y), base = TRGB[v] || TRGB[0];
      const e = this.elevM(X * TM, Y * TM), sh = clamp(1 + (this.elevM(X * TM - 40, Y * TM - 40) - e) * .012, .72, 1.25);
      for (let py = 0; py < P; py++) for (let px = 0; px < P; px++) {
        let m = sh; const hh = h2(X * P + px, Y * P + py, v);
        switch (v) {
          case TT.GRASS: m *= .92 + hh * .14; break;
          case TT.MOUNT: m *= ((px + py * 3 + (X * 7 + Y * 3)) % 7 === 0 ? .78 : .95 + hh * .08); break;
          case TT.BRICK: m *= (py === 0 || px === 0) ? .7 : (py % 3 === 0 ? .9 : 1.04); break;           // tejados de ladrillo
          case TT.BLDG: m *= (px === 0 || py === 0) ? .66 : (px === P - 1 || py === P - 1) ? 1.18 : ((px % 3 === 1 && py % 3 === 1) ? 1.25 : 1); break;
          case TT.ROAD: case TT.AVE: case TT.AUTO: m *= .97 + hh * .05; if (v !== TT.ROAD && (px === 3 || px === 4) && py % 4 < 2 && (this.tile(X, Y - 1) === v || this.tile(X, Y + 1) === v)) m *= 1.9; break;
          case TT.WATER: m *= (py + (now() | 0)) % 5 === 0 ? 1.12 : .98; break;
          case TT.CICLO: m *= (px === 0 || px === P - 1) ? .8 : 1; break;
          default: m *= .95 + hh * .08;
        }
        const o = ((ty * P + py) * n + tx * P + px) * 4; d[o] = clamp(base[0] * m, 0, 255); d[o + 1] = clamp(base[1] * m, 0, 255); d[o + 2] = clamp(base[2] * m, 0, 255); d[o + 3] = 255;
      }
    }
    g.putImageData(img, 0, 0);
    // árboles en laderas y parques (círculos pixelados)
    for (let ty = 0; ty < CH; ty++) for (let tx = 0; tx < CH; tx++) {
      const X = cx * CH + tx, Y = cy * CH + ty, v = this.tile(X, Y);
      if ((v === TT.GRASS && h2(X, Y, 3) < .22) || (v === TT.MOUNT && h2(X, Y, 4) < .55)) { g.fillStyle = h2(X, Y, 5) < .5 ? '#2c5a2c' : '#3b7334'; const r = 2 + (h2(X, Y, 6) * 3 | 0); g.fillRect(tx * P + 4 - r, ty * P + 4 - r, r * 2, r * 2); g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(tx * P + 4 - r, ty * P + 4 - r, r, 2); }
    }
    this.chunks.set(k, c); while (this.chunks.size > 48) this.chunks.delete(this.chunks.keys().next().value);
    return c;
  },
  /* dibuja el mapa cenital: centro (mx,my) en metros, escala k px/m */
  drawTop(g, W, H, mx, my, k) {
    const CHm = this.CH * TM, s = k * TM * this.CH / (this.CH * this.PX);
    const x0 = mx - W / 2 / k, y0 = my - H / 2 / k, x1 = mx + W / 2 / k, y1 = my + H / 2 / k;
    g.imageSmoothingEnabled = false;
    for (let cy = Math.floor(y0 / CHm); cy <= Math.floor(y1 / CHm); cy++) for (let cx = Math.floor(x0 / CHm); cx <= Math.floor(x1 / CHm); cx++) {
      if (cx < 0 || cy < 0 || cx * this.CH >= MW || cy * this.CH >= MH) continue;
      const c = this.chunk(cx, cy), sx = (cx * CHm - x0) * k, sy = (cy * CHm - y0) * k;
      g.drawImage(c, Math.floor(sx), Math.floor(sy), Math.ceil(c.width * s) + 1, Math.ceil(c.height * s) + 1);
    }
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
