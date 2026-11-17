// Verificación del mapa contra OpenStreetMap (1/2): exporta ventanas de casillas del juego y sus cajas lat/lon.
// Uso: node tools/osm-ventanas.mjs ventanas.json  → luego descarga cada caja de api.openstreetmap.org/api/0.6/map y corre tools/osm_comparar.py
import { createRequire } from 'node:module'; import fs from 'node:fs'; const { chromium } = createRequire(import.meta.url)('playwright');
const OUT = process.argv[2], R = 30, sitios = ['San Antonio', 'Niquía', 'Santo Domingo Savio'];
const b = await chromium.launch(); const p = await b.newPage();
await p.goto('file://' + new URL('../dist/index.html', import.meta.url).pathname); await p.waitForFunction(() => window.EM && EM.ready, null, { timeout: 60000 });
const res = await p.evaluate(({ sitios, R }) => sitios.map(nm => {
  const s = NET.stations.find(q => q.name === nm), tx = Math.floor(s.x / 20), ty = Math.floor(s.y / 20), t = [];
  for (let y = ty - R; y < ty + R; y++) for (let x = tx - R; x < tx + R; x++) t.push(EM.map.tile(x, y));
  const VM = VALLE_META, g = (x, y) => ({ lat: VM.latN - y / VM.ky, lon: VM.lon0 + x / VM.kx });   // en casillas
  const a = g(tx - R, ty + R), c = g(tx + R, ty - R);
  return { nm, tx0: tx - R, ty0: ty - R, n: 2 * R, t, bbox: [a.lon, a.lat, c.lon, c.lat], meta: { lon0: VM.lon0, latN: VM.latN, kx: VM.kx, ky: VM.ky } };
}), { sitios, R });
fs.writeFileSync(OUT, JSON.stringify(res)); console.log(res.map(r => r.nm + ' ' + r.bbox.map(v => v.toFixed(5)).join(',')).join('\n'));
await b.close();
