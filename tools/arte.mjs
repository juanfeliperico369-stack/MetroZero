// Genera arte/index.html: la carpeta de arte en una sola página (documentos, prompts con botón Copiar, muestras de color y galería).
// Uso: node tools/arte.mjs
import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..'), dir = path.join(root, 'arte');
const DOCS = [
  ['inicio', 'Inicio', 'README.md'], ['biblia', 'Biblia de estilo', '00-biblia-de-estilo.md'], ['juegos', 'Referencias', '01-referencias-videojuegos.md'],
  ['medellin', 'Medellín visual', '02-medellin-visual.md'], ['historia', 'Historia', '03-historia-metro-y-medellin.md'], ['fiestas', 'Folclor y fiestas', '04-folklore-y-fiestas.md'],
  ['diseno', 'Diseño del juego', '05-diseno-mundo-abierto-arcade.md'], ['gemini', 'Prompts · Gemini', '06-guia-gemini-nano-banana.md'],
  ['chatgpt', 'Prompts · ChatGPT y Midjourney', '07-guia-chatgpt-midjourney.md'], ['entregas', 'Entregas', '08-entregas-e-integracion.md']];
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const slug = s => s.toLowerCase().replace(/[^\p{L}\p{N}\s_-]/gu, '').trim().replace(/\s/g, '-');
const fileTo = Object.fromEntries(DOCS.map(([id, , f]) => [f, id]));
function inline(t) {
  const codes = [];
  let s = t.replace(/`([^`]+)`/g, (m, c) => { codes.push(c); return '\u0000' + (codes.length - 1) + '\u0000'; });
  s = esc(s);
  s = s.replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>').replace(/(^|[\s(])\*([^*\s][^*]*)\*/g, '$1<em>$2</em>');
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, txt, href) => {
    const local = href.match(/^([\w-]+\.md)(#.*)?$/);
    if (local && fileTo[local[1]]) return `<a href="#${fileTo[local[1]]}">${txt}</a>`;
    if (/^index\.html/.test(href)) return `<a href="#${href.split('#')[1] || 'inicio'}">${txt}</a>`;
    if (href.startsWith('#')) return `<a href="${href}">${txt}</a>`;
    return `<a href="${href}" target="_blank" rel="noopener">${txt}</a>`;
  });
  s = s.replace(/(^|[\s(,;])(#[0-9a-fA-F]{6})\b/g, (m, p, c) => `${p}<i class="sw" style="background:${c}"></i>${c}`);
  s = s.replace(/\u0000(\d+)\u0000/g, (m, k) => { const c = codes[+k], hex = /^#[0-9a-fA-F]{6}$/.test(c) ? `<i class="sw" style="background:${c}"></i>` : ''; return `${hex}<code>${esc(c)}</code>`; });
  return s;
}
function md(src) {
  const L = src.replace(/\r/g, '').split('\n'), out = []; let i = 0, n = 0;
  while (i < L.length) {
    const l = L[i];
    if (/^```/.test(l)) { const buf = []; i++; while (i < L.length && !/^```/.test(L[i])) buf.push(L[i++]); i++; out.push(`<div class="pre"><button class="cp">Copiar</button><pre>${esc(buf.join('\n'))}</pre></div>`); continue; }
    if (/^#{1,4} /.test(l)) { const h = l.match(/^#+/)[0].length, t = l.slice(h + 1); out.push(`<h${h} id="${slug(t)}">${inline(t)}</h${h}>`); i++; continue; }
    if (/^---\s*$/.test(l)) { out.push('<hr>'); i++; continue; }
    if (/^\|/.test(l)) { const rows = []; while (i < L.length && /^\|/.test(L[i])) rows.push(L[i++]); const cells = r => r.replace(/^\||\|$/g, '').split('|').map(c => c.trim()); let h = '<div class="tw"><table><thead><tr>' + cells(rows[0]).map(c => `<th>${inline(c)}</th>`).join('') + '</tr></thead><tbody>'; for (const r of rows.slice(2)) h += '<tr>' + cells(r).map(c => `<td>${inline(c)}</td>`).join('') + '</tr>'; out.push(h + '</tbody></table></div>'); continue; }
    if (/^>\s?/.test(l)) { const buf = []; while (i < L.length && /^>\s?/.test(L[i])) buf.push(L[i++].replace(/^>\s?/, '')); out.push(`<blockquote>${buf.map(inline).join('<br>')}</blockquote>`); continue; }
    if (/^\s*([-*]|\d+\.)\s/.test(l)) { const ord = /^\s*\d+\./.test(l), buf = []; while (i < L.length && /^\s*([-*]|\d+\.)\s/.test(L[i])) { buf.push(L[i].replace(/^\s*([-*]|\d+\.)\s/, '')); i++; } out.push(`<${ord ? 'ol' : 'ul'}>${buf.map(b => `<li>${inline(b)}</li>`).join('')}</${ord ? 'ol' : 'ul'}>`); continue; }
    if (!l.trim()) { i++; continue; }
    const buf = []; while (i < L.length && L[i].trim() && !/^(#{1,4} |```|\||>|\s*([-*]|\d+\.)\s|---\s*$)/.test(L[i])) buf.push(L[i++]); out.push(`<p>${inline(buf.join(' '))}</p>`); n++;
  }
  return out.join('\n');
}
const gal = JSON.parse(fs.readFileSync(path.join(dir, 'galeria.json'), 'utf8'));
const CAT = { metro: 'Metro (A y B)', cable: 'Metrocable', tranvia: 'Tranvía de Ayacucho', bus: 'Metroplús, alimentadores y busetas', ciudad: 'Ciudad', fiesta: 'Fiestas', cultura: 'Cultura' };
let galHtml = '<p class="nota">Fotos con licencia libre encontradas con Openverse (Wikimedia Commons y Flickr). Se cargan desde su sitio original; toca una para ver la fuente, el autor y la licencia.</p>';
for (const c of Object.keys(CAT)) { const L = gal.filter(g => g.cat === c); if (!L.length) continue; galHtml += `<h2>${CAT[c]} <small>(${L.length})</small></h2><div class="grid">` + L.map(g => `<a class="ph" href="${g.fuente}" target="_blank" rel="noopener"><img loading="lazy" referrerpolicy="no-referrer" src="${g.miniatura}" alt="${esc(g.titulo || '')}"><span>${esc(g.titulo || '')}<br><small>${esc(g.autor || 'autor sin nombre')} · ${esc(g.licencia)}</small></span></a>`).join('') + '</div>'; }
const sections = DOCS.map(([id, t, f]) => `<section id="${id}" class="doc">${md(fs.readFileSync(path.join(dir, f), 'utf8'))}</section>`).join('\n') + `<section id="galeria" class="doc"><h1>Galería de referencia</h1>${galHtml}</section>`;
const nav = DOCS.map(([id, t]) => `<a href="#${id}">${t}</a>`).join('') + '<a href="#galeria">Galería</a>';
const html = `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>El Metro · Carpeta de arte</title><meta name="robots" content="noindex">
<style>
:root{--lA:#1C5C9C;--lB:#E38835;--lT:#59AB42;--lK:#B8CF40;--lJ:#F6C538;--lH:#EB318E;--lL:#8E612A;--lM:#743D90;--lP:#EC343A;--papel:#f1ece0;--crema:#faf6ec;--tinta:#154a80;--negro:#141414;--mante:#fbe7b0}
*{box-sizing:border-box}body{margin:0;background:var(--papel);color:var(--negro);font:16px/1.55 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
header{position:sticky;top:0;z-index:5;background:var(--tinta);color:#fff;border-bottom:4px solid var(--negro)}
header h1{margin:0;padding:10px 14px 4px;font:900 22px/1.1 "Arial Narrow",Impact,sans-serif;letter-spacing:.04em;text-transform:uppercase}
.band{height:6px;background:linear-gradient(90deg,var(--lA) 0 11%,var(--lB) 0 22%,var(--lT) 0 33%,var(--lK) 0 44%,var(--lJ) 0 55%,var(--lH) 0 66%,var(--lL) 0 77%,var(--lM) 0 88%,var(--lP) 0)}
nav{display:flex;gap:6px;overflow-x:auto;padding:8px 10px;white-space:nowrap;scrollbar-width:none}nav a{color:#fff;text-decoration:none;font-weight:700;font-size:13px;padding:5px 10px;border:2px solid rgba(255,255,255,.5);border-radius:99px}nav a.on{background:var(--mante);color:var(--negro);border-color:var(--mante)}
section,h1,h2,h3,h4{scroll-margin-top:118px}main{max-width:920px;margin:0 auto;padding:12px 14px 80px}.doc{display:none}.doc.on{display:block}
h1,h2,h3{font-family:"Arial Narrow",Impact,sans-serif;text-transform:uppercase;letter-spacing:.02em;line-height:1.1}h1{font-size:30px;border-bottom:4px solid var(--negro);padding-bottom:6px}h2{font-size:22px;margin-top:28px;border-left:8px solid var(--lA);padding-left:8px}h3{font-size:18px;margin-top:22px}h4{margin:16px 0 4px}
a{color:var(--tinta)}code{background:var(--crema);border:1px solid #d8d0bd;padding:0 4px;border-radius:3px;font-size:.9em}
blockquote{margin:12px 0;padding:8px 12px;background:var(--crema);border-left:6px solid var(--lJ)}
.tw{overflow-x:auto;margin:10px 0}table{border-collapse:collapse;min-width:100%;background:var(--crema);font-size:14px}th,td{border:2px solid var(--negro);padding:5px 7px;vertical-align:top;text-align:left}th{background:var(--negro);color:#fff}
.pre{position:relative;margin:12px 0}pre{background:#0f2a45;color:#f1ece0;padding:12px;padding-top:34px;border:3px solid var(--negro);box-shadow:4px 4px 0 var(--negro);white-space:pre-wrap;word-break:break-word;font-size:13px}
.cp{position:absolute;right:8px;top:6px;border:2px solid var(--negro);background:var(--mante);font-weight:800;font-size:12px;padding:3px 10px;cursor:pointer}.cp.ok{background:var(--lT);color:#fff}
.sw{display:inline-block;width:.9em;height:.9em;border:1px solid var(--negro);vertical-align:-1px;margin-right:3px;border-radius:2px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:10px}.ph{display:block;background:var(--crema);border:2px solid var(--negro);text-decoration:none;color:var(--negro);box-shadow:3px 3px 0 var(--negro)}.ph img{display:block;width:100%;aspect-ratio:4/3;object-fit:cover;background:#ddd}.ph span{display:block;padding:5px 7px;font-size:12px;line-height:1.3}.ph small{opacity:.7}.nota{font-size:14px;background:var(--crema);padding:8px;border:2px dashed var(--negro)}
</style></head><body><header><h1>El Metro · Carpeta de arte</h1><div class="band"></div><nav>${nav}</nav></header><main>${sections}</main>
<script>
const show=()=>{const id=decodeURIComponent((location.hash||'#inicio').slice(1)),sec=document.getElementById(id)||document.querySelector(id?'[id="'+id+'"]':'#inicio');let doc=sec&&sec.closest('.doc');if(!doc)doc=document.getElementById('inicio');document.querySelectorAll('.doc').forEach(d=>d.classList.toggle('on',d===doc));document.querySelectorAll('nav a').forEach(a=>a.classList.toggle('on',a.getAttribute('href')==='#'+doc.id));setTimeout(()=>{if(sec&&sec!==doc)sec.scrollIntoView();else scrollTo(0,0);const a=document.querySelector('nav a.on');if(a)a.scrollIntoView({inline:'center',block:'nearest'});},0);};
addEventListener('hashchange',show);show();
document.querySelectorAll('.cp').forEach(b=>b.onclick=async()=>{const t=b.nextElementSibling.textContent;try{await navigator.clipboard.writeText(t);}catch(e){const r=document.createRange();r.selectNodeContents(b.nextElementSibling);const s=getSelection();s.removeAllRanges();s.addRange(r);document.execCommand('copy');}b.textContent='¡Copiado!';b.classList.add('ok');setTimeout(()=>{b.textContent='Copiar';b.classList.remove('ok');},1500);});
</script></body></html>`;
fs.writeFileSync(path.join(dir, 'index.html'), html);
console.log('arte/index.html', Math.round(html.length / 1024), 'KB ·', DOCS.length, 'documentos ·', gal.length, 'fotos');
