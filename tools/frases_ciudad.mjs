// Frases de la ciudad viva para El Metro, desde Motor City 5.2 (motor-city/datos/frases/ciudad.json, «familia»).
// Uso: node tools/frases_ciudad.mjs  →  src/js/96e1-frases-ciudad.js (sin atropellos ni explosiones: juego familiar)
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const raiz = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const d = JSON.parse(fs.readFileSync(path.join(raiz, 'motor-city/datos/frases/ciudad.json'), 'utf8'));
const fuera = new Set(['atropello', 'explosion', 'sirena', 'llamada']);
const F = d.familia.filter(x => x.t && Array.isArray(x.ev) && !x.ev.some(e => fuera.has(e))).map(x => { const o = { t: x.t, ev: x.ev }; for (const k of ['lugar', 'hora', 'lluvia']) if (x[k] !== undefined) o[k] = x[k]; return o; });
const js = `/* Generado por tools/frases_ciudad.mjs desde Motor City 5.2 (motor-city/datos/frases/ciudad.json, «familia»: ${F.length} frases).
   No se edita a mano: se cambian en el motor y se vuelve a generar. Sin atropellos, explosiones, sirenas ni llamadas (juego familiar). */
const FRASES_CIUDAD = ${JSON.stringify(F)};
`;
fs.writeFileSync(path.join(raiz, 'src/js/96e1-frases-ciudad.js'), js); console.log('src/js/96e1-frases-ciudad.js ·', F.length, 'frases');
