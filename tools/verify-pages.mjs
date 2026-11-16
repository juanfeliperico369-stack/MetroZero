#!/usr/bin/env node
/* Verifica el juego publicado: carga, service worker activo, abre sin conexión,
   errores de instalabilidad de Chrome (CDP Page.getInstallabilityErrors), manifest, íconos y Open Graph.
   Uso: node tools/verify-pages.mjs [url] */
import { createRequire } from 'node:module'; const { chromium } = createRequire(import.meta.url)('playwright');
const url = process.argv[2] || 'https://juanfeliperico369-stack.github.io/MetroZero/';
const b = await chromium.launch(), ctx = await b.newContext({ viewport: { width: 412, height: 860 } }), p = await ctx.newPage(), errs = [], R = {};
p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
const res = await p.goto(url, { waitUntil: 'load' }); R.http = res.status();
await p.waitForFunction(() => window.EM && EM.ready, null, { timeout: 30000 }); R.cargo = true;
R.sw = await p.evaluate(async () => { const r = await navigator.serviceWorker.ready; return r.active ? r.active.state : 'sin activo'; });
await p.reload({ waitUntil: 'load' }); R.controla = await p.evaluate(() => !!navigator.serviceWorker.controller);
R.cache = await p.evaluate(async () => (await caches.keys()).join(','));
const cdp = await ctx.newCDPSession(p); const inst = await cdp.send('Page.getInstallabilityErrors'); R.instalabilidad = inst.installabilityErrors.map(e => e.errorId + (e.errorArguments || []).map(a => ':' + a.value).join(''));
const man = await cdp.send('Page.getAppManifest'); R.manifestErrores = (man.errors || []).map(e => e.message);
R.meta = await p.evaluate(() => ({ ogImage: document.querySelector('meta[property="og:image"]').content, ogUrl: document.querySelector('meta[property="og:url"]').content, apple: document.querySelector('link[rel=apple-touch-icon]').href, capable: !!document.querySelector('meta[name=apple-mobile-web-app-capable]'), title: !!document.querySelector('meta[name=apple-mobile-web-app-title]'), vfc: /viewport-fit=cover/.test(document.querySelector('meta[name=viewport]').content) }));
for (const f of ['compartir.png', 'apple-touch-icon.png', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png', 'manifest.webmanifest', 'el-metro.apk']) { const r = await p.request.get(url + f); R['GET ' + f] = r.status(); }
await ctx.setOffline(true); await p.reload({ waitUntil: 'load' }); await p.waitForFunction(() => window.EM && EM.ready, null, { timeout: 30000 }); R.sinConexion = await p.evaluate(() => !!document.querySelector('#cover.on') && EM.netw.lines.length);
await ctx.setOffline(false);
R.erroresConsola = errs;
console.log(JSON.stringify(R, null, 1)); await b.close();
