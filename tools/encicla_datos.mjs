#!/usr/bin/env node
/* Estaciones de EnCicla para Ciudad Libre → src/data/encicla.js, tomadas de Juega EnCicla (el juego hermano).
   Uso: node tools/encicla_datos.mjs RUTA_DEL_REPO_DE_JUEGA_ENCICLA
   Toma la lista ESTACIONES de src/js/19-lugares.js: [id, nombre, municipio, lat, lon, tipo, demanda, zona].
   Las posiciones son aproximadas (en Juega EnCicla v1.2, típicamente a 46 m de la real). */
import fs from 'node:fs'; import path from 'node:path';
const ENC = process.argv[2]; if (!ENC) { console.error('Uso: node tools/encicla_datos.mjs RUTA_DEL_REPO_DE_JUEGA_ENCICLA'); process.exit(1); }
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const src = fs.readFileSync(path.join(ENC, 'src/js/19-lugares.js'), 'utf8'), version = (fs.readFileSync(path.join(ENC, 'src/js/00-core.js'), 'utf8').match(/version: '([\d.]+)'/) || [])[1] || '?';
const i0 = src.indexOf('[', src.indexOf('const ESTACIONES = ')); let i = i0, depth = 0, q = '';
for (; i < src.length; i++) { const c = src[i]; if (q) { if (c === '\\') i++; else if (c === q) q = ''; continue; } if (c === "'" || c === '"') q = c; else if (c === '[') depth++; else if (c === ']' && --depth === 0) break; }
const E = new Function('return ' + src.slice(i0, i + 1))();
const est = E.map(([, n, mu, la, lo, tp]) => [n, mu, +la.toFixed(5), +lo.toFixed(5), tp]);
const txt = `/* Estaciones de EnCicla (sistema público de bicicletas del Valle de Aburrá), tomadas de Juega EnCicla v${version}: posiciones aproximadas. Generado por tools/encicla_datos.mjs.
   Tipos: a automática, m con anfitrión. Horario de préstamo según la página oficial de EnCicla, como lo usa Juega EnCicla (los festivos, como domingo). */
const ENCICLA = ${JSON.stringify({ v: version, web: 'https://juanfeliperico369-stack.github.io/BicicletasUno/', estaciones: est })};
`;
fs.writeFileSync(path.join(root, 'src/data/encicla.js'), txt);
console.log(est.length, 'estaciones · src/data/encicla.js', Math.round(txt.length / 1024), 'KB · tipos', [...new Set(est.map(e => e[4]))].join(','));
