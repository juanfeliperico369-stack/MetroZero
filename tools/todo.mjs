// COMPILA EL PROYECTO EN UN SOLO DOCUMENTO.
//  - dist/EL-METRO-TODO.md   : documento único para IA (protocolo primero; guía, skills, plan, bitácora, arte, galería y CÓDIGO FUENTE completo)
//  - dist/El-Metro-TODO.html : el mismo contenido en pestañas + el juego jugable adentro + descargas (EL-METRO-TODO.md, CONTEXTO-IA.md, SKILLS-IA.md, el juego)
//  - AGENTS.md, CLAUDE.md, GEMINI.md (raíz): protocolo e índice que los agentes de código leen automáticamente
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
const WEB = 'https://juanfeliperico369-stack.github.io/MetroZero/';
// baja los títulos un nivel (sin tocar bloques de código) y quita comentarios HTML
const demote = (md, n = 1) => { let fence = false; return md.replace(/<!--[\s\S]*?-->\n?/g, '').split('\n').map(l => { if (/^(```|~~~)/.test(l)) fence = !fence; return !fence && /^#{1,5} /.test(l) ? '#'.repeat(n) + l : l; }).join('\n').trim(); };
const PROTO = rd('arte/PROTOCOLO-IA.md');

const LEEME = `# El Metro · Todo en uno

> Versión del juego **v${ver}** · compilado el ${hoy}.
> **Si eres una IA:** sigue el **PROTOCOLO** (pestaña “⚠ Protocolo IA” o primera parte del documento): lee todo, reflexiona, responde el cuestionario, prueba, auto‑ajústate y solo entonces haz tu parte.

Aquí está **todo** el proyecto:
- el **videojuego** (▶ Jugar en el archivo HTML; su **código fuente completo** va al final del documento único);
- la **guía única para IA** (Gemini y ChatGPT): misión, visión, contexto, roles, encargos con prompts, correcciones, entrega y **skills**;
- el **plan** y la **bitácora**;
- toda la **carpeta de arte**: biblia, referencias, Medellín, historia, folclor y fiestas, diseño, entregas y galería.

## Cómo usarlo
1. **Jugar:** en \`El-Metro-TODO.html\`, botón **▶ Jugar El Metro** (funciona sin internet; el progreso queda en ese navegador). También en la web: ${WEB}
2. **Gemini (Nano Banana) y ChatGPT:**
   1. Sube **\`EL-METRO-TODO.md\`** (el documento único) como conocimiento de tu **Gem** o como archivo de tu **Proyecto**.
   2. En las instrucciones pega el **rol** que corresponde (Guía única → Bloque 2).
   3. Pídele que siga el **protocolo** y te responda el cuestionario.
   4. Después, pide los encargos **uno por uno**, empezando por **G‑00**.
3. **Agentes de código** (Codex “astra”, Antigravity “argon”, Claude Code): abren el repositorio; leen solos \`AGENTS.md\`, \`GEMINI.md\` o \`CLAUDE.md\` y las skills de \`.agents/skills/\` y \`.claude/skills/\`. Este documento les da todo junto.
4. **Entregas de arte:** según la Guía única, Bloque 5 (carpetas, nombres y lista de control).

## Enlaces
- Juego en la web (PWA): ${WEB}
- App Android (APK): ${WEB}el-metro.apk
- Archivo con todo y el juego: ${WEB}El-Metro-TODO.html
- Carpeta de arte en línea: ${WEB}arte/
- Repositorio: https://github.com/juanfeliperico369-stack/MetroZero (rama de trabajo \`ccr-2a67f935-oat714\`)
`;

// ---------- código fuente ----------
const lang = f => ({ '.js': 'js', '.mjs': 'js', '.html': 'html', '.css': 'css', '.sh': 'bash', '.kts': 'kotlin', '.kt': 'kotlin', '.java': 'java', '.xml': 'xml', '.properties': 'properties', '.md': 'markdown', '.gradle': 'groovy' })[path.extname(f)] || '';
const walk = d => fs.readdirSync(path.join(root, d), { withFileTypes: true }).flatMap(e => { const p = path.join(d, e.name); if (e.isDirectory()) return /(^|\/)(build|\.gradle|\.kotlin|\.idea|gradle|keystore|assets)$/.test(p) ? [] : walk(p); return [p]; });
const codeFiles = [
  'src/head.html', 'src/body.html', 'src/style.css',
  ...fs.readdirSync(path.join(root, 'src/js')).filter(f => f.endsWith('.js')).sort().map(f => 'src/js/' + f),
  'src/data/red.js', 'src/data/lugares.js', 'src/data/rutas.js',
  ...fs.readdirSync(path.join(root, 'tools')).filter(f => /\.(mjs|sh|html)$/.test(f)).sort().map(f => 'tools/' + f),
  ...(fs.existsSync(path.join(root, 'android')) ? walk('android').filter(f => /\.(kt|kts|java|xml|md|properties)$/.test(f) && !/local\.properties$|gradle-wrapper/.test(f)).sort() : [])
];
let code = '', codeBytes = 0;
for (const f of codeFiles) {
  if (!fs.existsSync(path.join(root, f))) continue;
  const txt = rd(f), fence = txt.includes('~~~~') ? '`````' : '~~~~'; codeBytes += txt.length;
  code += `\n### \`${f}\`\n${fence}${lang(f)}\n${txt.replace(/\s+$/, '')}\n${fence}\n`;
}
const valleKB = Math.round(fs.statSync(path.join(root, 'src/data/valle.js')).size / 1024);
const JUEGO_MD = `# 13 · El videojuego: cómo jugarlo y código fuente completo

## Cómo jugarlo
- En **\`El-Metro-TODO.html\`**: botón **▶ Jugar El Metro**. También se puede descargar ahí mismo como \`el-metro.html\`.
- En la web (PWA, instalable): ${WEB}
- En Android: ${WEB}el-metro.apk

## Cómo está hecho
Un solo \`index.html\` sin librerías, armado por \`node tools/build.mjs\`. Concatena:
- \`src/head.html\`, \`src/body.html\` y \`src/style.css\`;
- los datos de \`src/data/\`;
- los módulos de \`src/js/\` en orden.

Las pruebas son \`node tools/test.mjs 100\`. El mapa de módulos y los comandos están en la skill **el-metro-desarrollo** (parte 3 de este documento).

## Datos que no van como texto
- **\`src/data/valle.js\`** (${valleKB} KB): el mapa del Valle de Aburrá en binario comprimido (casillas de 20 m con tipo de suelo y relieve de 80 m), tomado de “Juega EnCicla”. No es texto legible; se usa con \`MAP.tile\`, \`MAP.tileM\` y \`MAP.elevM\` (ver \`src/js/10-map.js\`).
- Las fuentes tipográficas y los íconos van embebidos al compilar.

## Código fuente (${codeFiles.length} archivos, ${Math.round(codeBytes / 1024)} KB)
${code}`;

// ---------- documento único ----------
const PARTES = [
  ['0 · Protocolo para toda IA', PROTO],
  ['1 · Léeme: qué es y cómo usarlo', LEEME],
  ['2 · Guía única para IA (contexto, roles, encargos, skills y bitácora)', rd('arte/06-guia-unica-ia.md')],
  ['3 · Skills del proyecto', rd('arte/SKILLS-IA.md')],
  ['4 · Plan de desarrollo', rd('docs/PLAN.md')],
  ['5 · Biblia de estilo', rd('arte/00-biblia-de-estilo.md')],
  ['6 · Referencias de videojuegos', rd('arte/01-referencias-videojuegos.md')],
  ['7 · Medellín y su transporte: identidad visual', rd('arte/02-medellin-visual.md')],
  ['8 · Historia del Metro y de Medellín', rd('arte/03-historia-metro-y-medellin.md')],
  ['9 · Folclor y fiestas', rd('arte/04-folklore-y-fiestas.md')],
  ['10 · Diseño: mundo abierto + arcade', rd('arte/05-diseno-mundo-abierto-arcade.md')],
  ['11 · Entregas e integración', rd('arte/08-entregas-e-integracion.md')],
  ['12 · Galería de referencia (créditos)', rd('arte/galeria.md')]
];
let TODO = `# EL METRO · DOCUMENTO ÚNICO PARA IA (TODO EN UNO)

> **Versión del juego v${ver} · compilado el ${hoy}.** Este documento reúne **todo** el proyecto *El Metro* (videojuego del Metro de Medellín): protocolo, guía para IA, contexto, roles, encargos, skills, plan, bitácora, investigación de arte y el **código fuente completo** del juego.
>
> **SI ERES UNA IA:**
> 1. Empieza por la **parte 0 (PROTOCOLO)** y síguelo al pie de la letra.
> 2. **Lee TODO**, de principio a fin (si no te cabe de una vez, léelo por partes hasta terminar).
> 3. Reflexiona, responde el **cuestionario** y prueba en pequeño.
> 4. **Auto‑ajústate** guardando tus “Reglas aprendidas”.
> 5. Solo entonces haz **tu** parte, con precisión.

## Índice
${PARTES.map(([t]) => '- ' + t).join('\n')}
- 13 · El videojuego: cómo jugarlo y código fuente completo
`;
for (const [t, md] of PARTES) TODO += `\n---\n\n# ${t}\n\n${demote(md, 1)}\n`;
TODO += `\n---\n\n${JUEGO_MD}\n\n---\n\n# FIN DEL DOCUMENTO\n\n> **Si eres una IA y llegaste hasta aquí:** vuelve al **PROTOCOLO** (parte 0):\n> - **paso 2**: resume misión, estado, tu rol, tus encargos y lo que no debes hacer;\n> - **paso 3**: responde el cuestionario;\n> - **paso 4**: haz tu prueba en pequeño;\n> - **paso 5**: auto‑ajústate.\n>\n> Después trabaja **solo** en lo tuyo, con precisión.\n`;
fs.writeFileSync(path.join(root, 'dist', 'EL-METRO-TODO.md'), TODO);

// ---------- AGENTS.md / CLAUDE.md / GEMINI.md ----------
const agentes = name => `# ${name} · El Metro

> Instrucciones para **agentes de código**: Codex de ChatGPT (“astra”), Antigravity y Gemini CLI (“argon”), Claude Code, Cursor y otros. **Archivo generado** por \`node tools/todo.mjs\` a partir de \`arte/PROTOCOLO-IA.md\`. No lo edites a mano: edita el protocolo y vuelve a compilar.

${demote(PROTO, 1)}

## Qué leer en este repositorio (paso 1 del protocolo)
| Archivo | Qué es |
|---|---|
| \`docs/BITACORA.md\` | Estado, historial y pendientes |
| \`docs/PLAN.md\` | Fases, incluida la 1b: Medellín fiel e isométrica |
| \`arte/06-guia-unica-ia.md\` | Contexto, roles, encargos y skills |
| \`arte/README.md\` | Índice de la carpeta de arte |
| \`.agents/skills/\` y \`.claude/skills/\` | Skills \`el-metro-desarrollo\`, \`el-metro-arte\`, \`medellin-fiel\`, \`frontend-design\`, \`webapp-testing\`, \`skill-creator\` |

**Todo junto, con el código:** \`node tools/todo.mjs\` genera:
- \`dist/EL-METRO-TODO.md\`: el documento único;
- \`dist/El-Metro-TODO.html\`: el mismo contenido con el juego jugable adentro.

## Comandos esenciales
~~~~bash
node tools/build.mjs        # compila dist/index.html (un solo HTML)
node tools/test.mjs 100     # autotest + 100 partidas + pantallas: debe dar 0 errores
node tools/todo.mjs         # documento único + archivo con todo + este archivo
~~~~

## Reglas del proyecto
- Un solo HTML, sin librerías externas ni internet en el juego.
- Celulares modestos.
- Español y todo público.
- El arte nuevo siempre va con respaldo procedural.
- No romper el guardado (\`elmetro.v1\`).
- Las pruebas deben dar 0 errores.
- Actualiza \`docs/BITACORA.md\` al cerrar cada sesión.
`;
for (const n of ['AGENTS.md', 'CLAUDE.md', 'GEMINI.md']) fs.writeFileSync(path.join(root, n), agentes(n));

// ---------- archivo HTML con todo y el juego ----------
const D = (id, tab, file, md) => ({ id, tab, file, md });
const DOCS = [
  D('inicio', 'Inicio', 'LEEME.md', LEEME), D('protocolo', '⚠ Protocolo IA', 'PROTOCOLO-IA.md', PROTO),
  D('guia', '★ Guía única para IA', '06-guia-unica-ia.md', rd('arte/06-guia-unica-ia.md')), D('skills', 'Skills', 'SKILLS-IA.md', rd('arte/SKILLS-IA.md')),
  D('plan', 'Plan', 'PLAN.md', rd('docs/PLAN.md')), D('biblia', 'Biblia de estilo', '00-biblia-de-estilo.md', rd('arte/00-biblia-de-estilo.md')),
  D('juegos', 'Referencias', '01-referencias-videojuegos.md', rd('arte/01-referencias-videojuegos.md')), D('medellin', 'Medellín visual', '02-medellin-visual.md', rd('arte/02-medellin-visual.md')),
  D('historia', 'Historia', '03-historia-metro-y-medellin.md', rd('arte/03-historia-metro-y-medellin.md')), D('fiestas', 'Folclor y fiestas', '04-folklore-y-fiestas.md', rd('arte/04-folklore-y-fiestas.md')),
  D('diseno', 'Diseño del juego', '05-diseno-mundo-abierto-arcade.md', rd('arte/05-diseno-mundo-abierto-arcade.md')), D('entregas', 'Entregas', '08-entregas-e-integracion.md', rd('arte/08-entregas-e-integracion.md')),
  D('codigo', 'Código del juego', 'CODIGO.md', JUEGO_MD.replace(/\n### `[\s\S]*$/, '\n\n> El código fuente completo (' + codeFiles.length + ' archivos) va en **EL-METRO-TODO.md** (botón ⬇ arriba), para no cargar esta página.')),
  D('galeria-md', null, 'galeria.md', rd('arte/galeria.md')), D('contexto', null, 'CONTEXTO-IA.md', rd('arte/CONTEXTO-IA.md'))
];
const J = x => JSON.stringify(x).replace(/</g, '\\u003c');
const gz = b => zlib.gzipSync(b, { level: 9 }).toString('base64');
const juego = fs.readFileSync(path.join(root, 'dist', 'index.html'));
let html = rd('tools/todo-plantilla.html');
html = html.replace(/%%VERSION%%/g, () => 'v' + ver).replace('%%DOCS%%', () => J(DOCS)).replace('%%GAL%%', () => J(JSON.parse(rd('arte/galeria.json')))).replace('%%JUEGO%%', () => gz(juego)).replace('%%TODO%%', () => gz(Buffer.from(TODO)));
fs.writeFileSync(path.join(root, 'dist', 'El-Metro-TODO.html'), html);
console.log(`dist/EL-METRO-TODO.md ${Math.round(TODO.length / 1024)} KB (código: ${codeFiles.length} archivos, ${Math.round(codeBytes / 1024)} KB) · dist/El-Metro-TODO.html ${(html.length / 1048576).toFixed(2)} MB · AGENTS.md, CLAUDE.md, GEMINI.md`);
