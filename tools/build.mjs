#!/usr/bin/env node
/* Construye dist/: index.html (un solo archivo, sin internet), manifest, service worker y .nojekyll.
   Uso: node tools/build.mjs [--url https://usuario.github.io/Repo/]
   Íconos e imagen para compartir: node tools/assets.mjs (usa el Chromium instalado). */
import fs from 'node:fs'; import path from 'node:path'; import crypto from 'node:crypto'; import { execFileSync } from 'node:child_process';
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..'), src = p => path.join(root, 'src', p), dist = path.join(root, 'dist');
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const URL_ = arg('--url', 'https://juanfeliperico369-stack.github.io/MetroZero/');
const read = p => fs.readFileSync(p, 'utf8');
const version = /version: '([^']+)'/.exec(read(src('js/00-core.js')))[1];
fs.mkdirSync(dist, { recursive: true });
// La versión publicada va sin comentarios de línea completa (el código fuente los conserva). Solo se quita un bloque
// /* … */ que ocupa sus propias líneas y no contiene otro cierre, y las líneas que empiezan por //: nunca código.
const limpia = t => t.replace(/^[ \t]*\/\*(?:(?!\*\/)[\s\S])*\*\/[ \t]*\r?\n/gm, '').replace(/^[ \t]*\/\/[^\n]*\r?\n/gm, '');
const limpiaCss = t => t.replace(/\/\*(?:(?!\*\/)[\s\S])*\*\//g, '');
const data = ['data/valle.js', 'data/red.js', 'data/rutas.js', 'data/lugares.js', 'data/arte.js', 'data/ciudad.js'].filter(p => fs.existsSync(src(p))).map(p => limpia(read(src(p))));
const mods = fs.readdirSync(src('js')).filter(f => f.endsWith('.js')).sort().map(f => limpia(read(src('js/' + f))));
const js = mods.join('\n');
// verificación de sintaxis (el bot interno revisa la lógica)
const tmp = path.join(dist, '.check.js'); fs.writeFileSync(tmp, data.join('\n') + '\n' + js);
try { execFileSync(process.execPath, ['--check', tmp], { stdio: 'pipe' }); } catch (e) { console.error(String(e.stderr || e)); process.exit(1); } finally { fs.unlinkSync(tmp); }
const head = read(src('head.html')).replace('%FONTS%', read(src('fonts.css'))).replace('%CSS%', limpiaCss(read(src('style.css')))).replaceAll('%URL%', URL_);
const html = head + read(src('body.html')) + data.map(d => '<script>' + d + '</script>\n').join('') + '<script>\n' + js + '\n</script>\n</body></html>\n';
fs.writeFileSync(path.join(dist, 'index.html'), html);
const hash = crypto.createHash('sha1').update(html).digest('hex').slice(0, 8);
const manifest = { name: 'El Metro · La última vuelta', short_name: 'El Metro', description: 'Juego offline sobre el Metro de Medellín: trenes, tranvía, Metroplús, alimentadores y metrocables.', lang: 'es-CO', start_url: './', scope: './', id: './', display: 'standalone', orientation: 'any', background_color: '#0F2238', theme_color: '#0F2238', categories: ['games', 'education'],
  icons: [{ src: 'icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' }, { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' }, { src: 'icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }] };
fs.writeFileSync(path.join(dist, 'manifest.webmanifest'), JSON.stringify(manifest, null, 1));
const files = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png', 'apple-touch-icon.png', 'favicon-32.png', 'favicon.svg'];
fs.writeFileSync(path.join(dist, 'sw.js'), `/* El Metro · service worker: guarda el juego para abrir sin internet */
const CACHE = 'el-metro-v${version}-${hash}', FILES = ${JSON.stringify(files)};
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('el-metro-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const r = e.request; if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
  e.respondWith(caches.match(r, { ignoreSearch: true }).then(hit => hit || fetch(r).then(res => { if (res.ok && res.type === 'basic') { const cp = res.clone(); caches.open(CACHE).then(c => c.put(r, cp)); } return res; }).catch(() => r.mode === 'navigate' ? caches.match('index.html') : undefined)));
});
`);
fs.writeFileSync(path.join(dist, '.nojekyll'), '');
fs.copyFileSync(path.join(root, 'tools', 'server.mjs'), path.join(dist, 'server.mjs'));
console.log(`dist/index.html ${(html.length / 1024).toFixed(0)} KB · v${version} · cache ${hash}`);
