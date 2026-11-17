// Arma dist/El-Metro-TODO.html: UN SOLO ARCHIVO con todo el proyecto.
// Contiene el juego jugable (comprimido adentro), la guía única para IA, skills, plan, bitácora, toda la carpeta de arte y la galería.
// Desde ese archivo se pueden descargar TODO.md (todo el texto, para IA), CONTEXTO-IA.md, SKILLS-IA.md y el juego suelto.
// Uso: node tools/todo.mjs
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { execFileSync } from 'node:child_process';
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const run = f => execFileSync(process.execPath, [path.join(root, 'tools', f)], { cwd: root, stdio: ['ignore', 'pipe', 'inherit'] }).toString().trim();
console.log(run('build.mjs').split('\n').pop()); console.log(run('skills.mjs')); console.log(run('arte.mjs'));
const rd = p => fs.readFileSync(path.join(root, p), 'utf8');
const ver = (rd('src/js/00-core.js').match(/version: '([^']+)'/) || [])[1] || '?', hoy = new Date().toISOString().slice(0, 10);
const LEEME = `# El Metro · Todo en un archivo

> Versión del juego **v${ver}** · archivo generado el ${hoy}.

Este archivo reúne **todo** el proyecto:
- el **videojuego jugable** (botón **▶ Jugar El Metro**, funciona sin internet);
- la **guía única para IA** (Gemini y ChatGPT) con misión, visión, contexto, roles, encargos y **skills**;
- el **plan**, la **bitácora**;
- toda la **carpeta de arte**: biblia de estilo, referencias, Medellín, historia, folclor y fiestas, diseño, entregas y galería.

## Qué hay aquí
| Pestaña o botón | Contenido |
|---|---|
| **▶ Jugar El Metro** | El juego completo (v${ver}). El progreso se guarda en este navegador |
| **★ Guía única para IA** | Contexto completo, roles de Gemini (G‑) y ChatGPT (C‑), encargos con prompts para copiar, correcciones, entrega, skills (Bloque 6) y la **bitácora completa** (Anexo A) |
| **Skills** | Skills del proyecto (\`el-metro-arte\`, \`medellin-fiel\`, \`el-metro-desarrollo\`) y las oficiales instaladas |
| **Plan** | Fases de desarrollo, incluida la Fase 1b: Medellín fiel e isométrica |
| **Biblia · Referencias · Medellín · Historia · Fiestas · Diseño · Entregas** | La investigación completa de arte y diseño |
| **Galería** | 71 fotos de referencia con licencia libre (cargan con internet) |
| **⬇ TODO.md** | Todo el texto en **un solo archivo Markdown**, para subir a un Gem de Gemini o a un Proyecto de ChatGPT |
| **⬇ CONTEXTO-IA.md · ⬇ SKILLS-IA.md** | Versiones livianas: solo el contexto más la bitácora, y solo las skills |
| **⬇ Juego (el-metro.html)** | El juego suelto, para guardarlo o compartirlo |

## Cómo usarlo
1. **Jugar:** toca **▶ Jugar El Metro**. Para salir, usa “✕ cerrar el juego”.
2. **Gemini (Nano Banana) y ChatGPT:**
   1. Descarga **TODO.md** y súbelo como conocimiento de un **Gem** o como archivo de un **Proyecto**.
   2. En las instrucciones pega el **rol** que corresponde (Guía única → Bloque 2).
   3. Pide los **encargos** uno por uno (Bloque 3), empezando por **G‑00**.
3. **Agentes de código** (Codex “astra”, Antigravity “argon”, Claude Code): trabajan sobre el repositorio, donde están las skills (\`.agents/skills/\` y \`.claude/skills/\`). Este archivo les sirve de resumen completo.
4. **Entregas de arte:** según la Guía única, Bloque 5 (carpetas, nombres y lista de control).

## Enlaces
- Juego en la web (PWA): https://juanfeliperico369-stack.github.io/MetroZero/
- App Android (APK): https://juanfeliperico369-stack.github.io/MetroZero/el-metro.apk
- Carpeta de arte en línea: https://juanfeliperico369-stack.github.io/MetroZero/arte/
- Repositorio: https://github.com/juanfeliperico369-stack/MetroZero (rama de trabajo \`ccr-2a67f935-oat714\`)
`;
const D = (id, tab, file, md, todo = true) => ({ id, tab, file, md, todo });
const DOCS = [
  D('inicio', 'Inicio', 'LEEME.md', LEEME),
  D('guia', '★ Guía única para IA', '06-guia-unica-ia.md', rd('arte/06-guia-unica-ia.md')),
  D('skills', 'Skills', 'SKILLS-IA.md', rd('arte/SKILLS-IA.md')),
  D('plan', 'Plan', 'PLAN.md', rd('docs/PLAN.md')),
  D('biblia', 'Biblia de estilo', '00-biblia-de-estilo.md', rd('arte/00-biblia-de-estilo.md')),
  D('juegos', 'Referencias', '01-referencias-videojuegos.md', rd('arte/01-referencias-videojuegos.md')),
  D('medellin', 'Medellín visual', '02-medellin-visual.md', rd('arte/02-medellin-visual.md')),
  D('historia', 'Historia', '03-historia-metro-y-medellin.md', rd('arte/03-historia-metro-y-medellin.md')),
  D('fiestas', 'Folclor y fiestas', '04-folklore-y-fiestas.md', rd('arte/04-folklore-y-fiestas.md')),
  D('diseno', 'Diseño del juego', '05-diseno-mundo-abierto-arcade.md', rd('arte/05-diseno-mundo-abierto-arcade.md')),
  D('entregas', 'Entregas', '08-entregas-e-integracion.md', rd('arte/08-entregas-e-integracion.md')),
  D('galeria-md', null, 'galeria.md', rd('arte/galeria.md')),
  D('contexto', null, 'CONTEXTO-IA.md', rd('arte/CONTEXTO-IA.md'), false)
];
const J = x => JSON.stringify(x).replace(/</g, '\\u003c');
const juego = fs.readFileSync(path.join(root, 'dist', 'index.html')), gz = zlib.gzipSync(juego, { level: 9 }).toString('base64');
let html = fs.readFileSync(path.join(root, 'tools', 'todo-plantilla.html'), 'utf8');
html = html.replace(/%%VERSION%%/g, () => 'v' + ver).replace('%%DOCS%%', () => J(DOCS)).replace('%%GAL%%', () => J(JSON.parse(rd('arte/galeria.json')))).replace('%%JUEGO%%', () => gz);
const out = path.join(root, 'dist', 'El-Metro-TODO.html');
fs.writeFileSync(out, html);
const todoLen = DOCS.filter(d => d.todo).reduce((a, d) => a + d.md.length, 0);
console.log(`dist/El-Metro-TODO.html ${(html.length / 1048576).toFixed(2)} MB · juego ${(juego.length / 1048576).toFixed(2)} MB (gzip+base64 ${(gz.length / 1048576).toFixed(2)} MB) · ${DOCS.length} documentos · TODO.md ≈ ${Math.round(todoLen / 1024)} KB`);
