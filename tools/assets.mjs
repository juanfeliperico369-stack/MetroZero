#!/usr/bin/env node
/* Genera íconos (192, 512, maskable 512, apple-touch 180 sin transparencia, favicon 32 + svg)
   y la imagen para compartir (compartir.png 1200×630) dibujándolos con el propio arte del juego. */
import { createRequire } from 'node:module'; import fs from 'node:fs'; import path from 'node:path';
const { chromium } = createRequire(import.meta.url)('playwright');
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..'), dist = path.join(root, 'dist');
const b = await chromium.launch(), p = await b.newPage();
await p.goto('file://' + path.join(dist, 'index.html')); await p.waitForFunction(() => window.EM && EM.ready); await p.evaluate(() => document.fonts.ready);
await p.evaluate(() => new Promise(r => { if (!EM.atlas.has('portada')) return r(); if (EM.atlas.img('portada', r)) r(); setTimeout(r, 3000); }));
const out = await p.evaluate(() => {
  const A = EM.art, mk = (w, h, f) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); f(g, w, h); return c.toDataURL('image/png'); };
  const icon = (S, mask) => mk(S, S, g => A.icon(g, S, mask));
  // imagen para compartir: la ilustración del valle, el título y la línea con sus estaciones (identidad del Metro)
  const share = mk(1200, 630, (g, W, H) => {
    g.fillStyle = '#0F2238'; g.fillRect(0, 0, W, H);
    const pic = EM.atlas.img('portada');
    if (pic) { const s2 = Math.max(W / pic.naturalWidth, H / pic.naturalHeight); g.drawImage(pic, (W - pic.naturalWidth * s2) / 2, (H - pic.naturalHeight * s2) / 2 - 40, pic.naturalWidth * s2, pic.naturalHeight * s2); }
    else { const art = document.createElement('canvas'); art.width = 320; art.height = 200; A.cover(art.getContext('2d'), 320, 200, 7.3, false); g.imageSmoothingEnabled = false; g.drawImage(art, 0, 0, W, W / 1.6); }
    const sombra = g.createLinearGradient(0, 0, W * .62, 0); sombra.addColorStop(0, 'rgba(15,34,56,.96)'); sombra.addColorStop(.75, 'rgba(15,34,56,.72)'); sombra.addColorStop(1, 'rgba(15,34,56,0)'); g.fillStyle = sombra; g.fillRect(0, 0, W, H);
    g.fillStyle = '#fff'; g.font = '700 168px Titulos, Impact, sans-serif'; g.fillText('El Metro', 60, 250);
    g.fillStyle = '#d7e2ec'; g.font = '600 34px Cuerpo, sans-serif'; g.fillText('Medellín y el Valle de Aburrá', 64, 312); g.fillText('en metro, tranvía, cable y bus', 64, 356);
    const est = [['Jugar', '#1C5C9C'], ['La última vuelta', '#EB318E'], ['Sin internet', '#59AB42']];
    g.fillStyle = '#1C5C9C'; g.fillRect(84, 404, 10, 168);
    est.forEach(([t, c], i) => { const y = 420 + i * 66; g.fillStyle = '#fff'; g.beginPath(); g.arc(89, y, 19, 0, Math.PI * 2); g.fill(); g.lineWidth = 8; g.strokeStyle = c; g.stroke(); g.fillStyle = '#fff'; g.font = '700 34px Titulos, Impact, sans-serif'; g.fillText(t, 126, y + 12); });
    const L = ['#1C5C9C', '#E38835', '#59AB42', '#B8CF40', '#F6C538', '#EB318E', '#8E612A', '#743D90', '#EC343A', '#0E6F76', '#65A9AC'];
    L.forEach((c, i) => { g.fillStyle = c; g.fillRect(i * W / L.length, H - 14, W / L.length + 1, 14); });
  });
  return { i192: icon(192), i512: icon(512), m512: icon(512, true), apple: icon(180, true), fav: icon(32), share };
});
const save = (n, d) => fs.writeFileSync(path.join(dist, n), Buffer.from(d.split(',')[1], 'base64'));
save('icon-192.png', out.i192); save('icon-512.png', out.i512); save('icon-maskable-512.png', out.m512); save('apple-touch-icon.png', out.apple); save('favicon-32.png', out.fav); save('compartir.png', out.share);
fs.writeFileSync(path.join(dist, 'favicon.svg'), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="#0e5a6b"/><rect x="5" y="6" width="22" height="20" fill="#141414"/><rect x="6" y="7" width="20" height="18" fill="#c9ced4"/><rect x="8" y="9" width="16" height="7" fill="#12446c"/><rect x="6" y="18" width="20" height="2" fill="#1f63ad"/><rect x="7" y="21" width="3" height="2" fill="#fff3b0"/><rect x="22" y="21" width="3" height="2" fill="#fff3b0"/><rect x="4" y="27" width="24" height="2" fill="#c8201f"/></svg>`);
await b.close(); console.log('íconos y compartir.png listos en dist/');
