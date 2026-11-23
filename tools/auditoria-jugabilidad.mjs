// Auditoría de jugabilidad con entradas de jugador (Claude, 3.2–3.6). Cada modo 12 s de tiempo real en Chromium a 412 × 860.
// Mide cuadros por segundo, ritmo (tiempo del juego ÷ tiempo real: 1 = normal, menos = cámara lenta), velocidad por segundo y avance.
// Uso: node tools/auditoria-jugabilidad.mjs [modos separados por coma] [carpeta de capturas]
//   node tools/auditoria-jugabilidad.mjs                      → todos los modos
//   node tools/auditoria-jugabilidad.mjs volante,carrera /tmp  → solo esos, capturas en /tmp
// Sin tarjeta gráfica (como aquí) el 3D se parece a un celular modesto: es el peor caso del proyecto.
import { createRequire } from 'node:module'; import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const { chromium } = createRequire(import.meta.url)('playwright');
const raiz = path.join(path.dirname(fileURLToPath(import.meta.url)), '..'), SOLO = process.argv[2] || '', OUT = process.argv[3] || '';
const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 412, height: 860 }, deviceScaleFactor: 1, hasTouch: true })).newPage();
const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto('file://' + path.join(raiz, 'dist/index.html')); await p.waitForFunction(() => window.EM && EM.ready && (typeof VC === 'undefined' || VC.on), null, { timeout: 120000 });
await p.evaluate(() => { const s = EM.save.d.settings; s.voz = 0; s.snd = 0; s.mus = 0; s.ciclo = 'dia'; window.__f = 0; const r = () => { window.__f++; requestAnimationFrame(r); }; requestAnimationFrame(r); });
const carreraLv = await p.evaluate(() => (EM.modes.carrera.levels().find(l => /^cr:c\d/.test(l.id)) || EM.modes.carrera.levels()[0]).id);
const CASOS = [['conduce', 'A:0-2', 'up'], ['tranvia', 'T:0-2', 'up'], ['volante', 'vo:MP1:0-4', 'up'], ['bus', 'bus:MP1:0-4', 'up'], ['carrera', carreraLv, 'nada'],
  ['cableviaje', 'cv:K', 'vt'], ['despacho', 'despacho0', 'ai'], ['alim', 'alim0', 'ai'], ['metroplus', 'mp0', 'ai'], ['cable', 'cb:K:0', 'ai'], ['libre', 'lb:San Antonio', 'up']].filter(c => !SOLO || SOLO.split(',').includes(c[0]));
const out = {};
for (const [m, lv, inp] of CASOS) {
  await p.evaluate(([m, lv]) => { if (typeof UI !== 'undefined' && UI.close) UI.close(); EM.game.start(m, lv, {}); }, [m, lv]); await p.waitForTimeout(1500);
  const ini = await p.evaluate(() => { const st = EM.game.st; return { t: st.t, s: st.s, x: st.x, y: st.y, f: window.__f, now: performance.now() }; });
  if (inp === 'up') await p.keyboard.down('ArrowUp'); const M = [];
  for (let k = 0; k < 12; k++) {
    if (inp === 'vt' && k < 6) await p.keyboard.press('ArrowUp');
    if (inp === 'ai') { for (let j = 0; j < 2; j++) { await p.evaluate(() => { const Mo = EM.game.mode, st = EM.game.st, a = Mo.ai && Mo.ai(st); if (a) Mo.act(st, a); }); await p.waitForTimeout(450); } } else await p.waitForTimeout(1000);
    M.push(await p.evaluate(() => { const st = EM.game.st; return { t: st.t, v: st.v != null ? st.v : st.vf != null ? st.vf : 0, s: st.s, x: st.x, y: st.y }; }));
  }
  if (inp === 'up') await p.keyboard.up('ArrowUp');
  const fin = await p.evaluate(() => ({ f: window.__f, now: performance.now() })), real = (fin.now - ini.now) / 1000, u = M[M.length - 1];
  if (OUT) fs.writeFileSync(path.join(OUT, 'auditoria-' + m + '.png'), await p.screenshot());
  const avance = u.s != null && ini.s != null ? Math.abs(u.s - ini.s) : u.x != null ? Math.hypot(u.x - ini.x, u.y - ini.y) : null;
  out[m] = { fps: +((fin.f - ini.f) / real).toFixed(1), ritmo: +((u.t - ini.t) / real).toFixed(2), vmax_kmh: Math.round(Math.max(...M.map(q => q.v)) * 3.6), avance_m: avance == null ? '-' : Math.round(avance), v_por_s: M.map(q => Math.round(q.v * 3.6)).join(' ') };
  await p.evaluate(() => { EM.game.stop(); if (typeof UI !== 'undefined' && UI.close) UI.close(); });
}
console.table(out); console.log('errores', errs.slice(0, 6), await p.evaluate(() => EM.errors.slice(-4))); await b.close();
