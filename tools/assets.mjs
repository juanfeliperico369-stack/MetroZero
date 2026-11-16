#!/usr/bin/env node
/* Genera íconos (192, 512, maskable 512, apple-touch 180 sin transparencia, favicon 32 + svg)
   y la imagen para compartir (compartir.png 1200×630) dibujándolos con el propio arte del juego. */
import { createRequire } from 'node:module'; import fs from 'node:fs'; import path from 'node:path';
const { chromium } = createRequire(import.meta.url)('playwright');
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..'), dist = path.join(root, 'dist');
const b = await chromium.launch(), p = await b.newPage();
await p.goto('file://' + path.join(dist, 'index.html')); await p.waitForFunction(() => window.EM && EM.ready); await p.evaluate(() => document.fonts.ready);
const out = await p.evaluate(() => {
  const A = EM.art, mk = (w, h, f) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); f(g, w, h); return c.toDataURL('image/png'); };
  const icon = (S, mask) => mk(S, S, g => A.icon(g, S, mask));
  const share = mk(1200, 630, (g, W, H) => {
    g.fillStyle = '#f8f1dc'; g.fillRect(0, 0, W, H);
    g.fillStyle = '#0e5a6b'; g.fillRect(0, 0, W, 64); g.fillStyle = '#141414'; g.fillRect(0, 64, W, 6);
    g.fillStyle = '#fbf8ee'; g.font = '800 22px Cuerpo, sans-serif'; g.fillText('M E T R O   D E   M E D E L L Í N   ·   V A L L E   D E   A B U R R Á', 28, 42);
    const art = document.createElement('canvas'); art.width = 320; art.height = 200; const ag = art.getContext('2d'); A.cover(ag, 320, 200, 7.3, false);
    g.imageSmoothingEnabled = false; g.fillStyle = '#141414'; g.fillRect(586, 110, 588, 380); g.drawImage(art, 594, 118, 572, 357.5);
    g.fillStyle = '#12446c'; g.font = '700 220px Titulos, Impact, sans-serif'; g.fontStretch = 'condensed'; g.fillText('EL', 30, 290); g.fillText('METRO', 30, 480);
    g.fillStyle = '#c8201f'; g.font = 'italic 34px Georgia, serif'; g.fillText('¿Sabés a dónde vas?', 36, 545);
    g.fillStyle = '#1b8088'; g.font = '700 54px Titulos, Impact, sans-serif'; g.fillText('LA ÚLTIMA VUELTA', 600, 560);
    g.fillStyle = '#f9e4a4'; g.fillRect(0, H - 40, W, 40); g.fillStyle = '#141414'; g.fillRect(0, H - 43, W, 3); g.fillStyle = '#12446c'; g.font = '700 24px Cuerpo, sans-serif'; g.fillText('Trenes · Tranvía · Metroplús · Alimentadores · Metrocables  —  juega sin internet', 28, H - 12);
  });
  return { i192: icon(192), i512: icon(512), m512: icon(512, true), apple: icon(180, true), fav: icon(32), share };
});
const save = (n, d) => fs.writeFileSync(path.join(dist, n), Buffer.from(d.split(',')[1], 'base64'));
save('icon-192.png', out.i192); save('icon-512.png', out.i512); save('icon-maskable-512.png', out.m512); save('apple-touch-icon.png', out.apple); save('favicon-32.png', out.fav); save('compartir.png', out.share);
fs.writeFileSync(path.join(dist, 'favicon.svg'), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="#0e5a6b"/><rect x="5" y="6" width="22" height="20" fill="#141414"/><rect x="6" y="7" width="20" height="18" fill="#c9ced4"/><rect x="8" y="9" width="16" height="7" fill="#12446c"/><rect x="6" y="18" width="20" height="2" fill="#1f63ad"/><rect x="7" y="21" width="3" height="2" fill="#fff3b0"/><rect x="22" y="21" width="3" height="2" fill="#fff3b0"/><rect x="4" y="27" width="24" height="2" fill="#c8201f"/></svg>`);
await b.close(); console.log('íconos y compartir.png listos en dist/');
