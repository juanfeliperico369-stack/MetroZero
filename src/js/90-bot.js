/* =====================================================================
   BOT DE PRUEBAS (dentro del juego)
   selfTest(): valida datos de la red, que cada nivel tenga solución y que el horario sea sensato.
   monkey(n): n partidas automáticas (piloto automático + toques al azar) buscando errores e invariantes rotas.
   Uso: menú → 🤖 Bot de pruebas · consola: EM.test.monkey(100) · node tools/test.mjs
   ===================================================================== */
const BotT = EM.test = {
  selfTest() {
    const errors = [], warnings = [], E = m => errors.push(m), Wn = m => warnings.push(m), fin = v => typeof v === 'number' && isFinite(v);
    const t0 = performance.now(), mx = MW * TM, my = MH * TM;
    // red
    const ids = new Set(); for (const L of LINE_META.lines) { if (ids.has(L.id)) E('línea repetida ' + L.id); ids.add(L.id); if (!/^#[0-9a-f]{6}$/i.test(L.color || '')) Wn('color raro en ' + L.id); }
    for (const l of NET.lines) {
      if (l.st.length < 2) E(l.id + ': menos de 2 estaciones'); if (!(l.P.len > 50)) E(l.id + ': recorrido muy corto');
      for (const s of l.st) { if (!fin(s.x) || !fin(s.y) || s.x < 0 || s.y < 0 || s.x > mx || s.y > my) E(l.id + ': estación fuera del mapa ' + s.name); if (!fin(s.s)) E(l.id + ': posición inválida ' + s.name); }
      for (let i = 1; i < l.st.length; i++) { const d = l.st[i].s - l.st[i - 1].s; if (d < 30 && l.kind !== 'escalator') Wn(l.id + ': estaciones muy juntas ' + l.st[i - 1].name + '–' + l.st[i].name + ' (' + d.toFixed(0) + ' m)'); if (d > 6000 && l.kind !== 'cable' && l.kind !== 'future') Wn(l.id + ': tramo largo ' + (d / 1000).toFixed(1) + ' km'); }
    }
    if (!NET.byId.A) E('falta la Línea A');
    for (const q of LINE_META.trivia) if (!q.q || !Array.isArray(q.a) || q.a.length < 2) E('trivia mal formada: ' + (q.q || '?'));
    // conduce: cada nivel crea, su horario es finito y el piloto llega
    let nC = 0; for (const lv of Conduce.levels()) { try { const st = Conduce.create(lv.id, { seed: 1, auto: true }); nC++; if (!st.sched.every(fin)) E('horario inválido ' + lv.id); if (st.ideal.some(t => t >= 1999)) E('el piloto no llega en ' + lv.id); } catch (e) { E('conduce ' + lv.id + ': ' + e.message); } }
    // agujas: toda aparición llega a alguna salida y toda salida es alcanzable
    let nR = 0; for (const id of ['despacho', 'alim']) { const M = EM.modes[id]; for (const lv of M.levels()) { try { const st = M.create(lv.id, { seed: 1 }); nR++; const reach = new Set(); for (const sp of st.sp) { const r = M.reachEx(st, sp.i); if (!r.size) E(lv.id + ': entrada sin salida'); r.forEach(x => reach.add(x)); } for (const ex of st.ex) if (!reach.has(ex.i)) E(lv.id + ': salida inalcanzable'); if (!st.swl.length) Wn(lv.id + ': sin agujas'); if (st.ex.length < 2) Wn(lv.id + ': una sola salida'); } catch (e) { E(id + ' ' + lv.id + ': ' + e.message); } } }
    // simulador de bus: todas las rutas crean y tienen horario
    let nB = 0; for (const lv of Bus.levels()) { try { const st = Bus.create(lv.id, { seed: 1 }); nB++; if (!st.sched.every(fin) || !isFinite(st.x)) E('bus ' + lv.id + ': horario/posición'); } catch (e) { E('bus ' + lv.id + ': ' + e.message); } }
    // ciudad libre: aparece, hay vehículos parqueados y se generan oficios
    try { const st = Libre.create('lb:San Antonio', { seed: 1 }); if (!st.parked.length) E('libre: sin vehículos'); if (!isFinite(st.x)) E('libre: posición'); for (let i = 0; i < 40; i++) Libre.offer(st); if (!st.job) Wn('libre: no se generó ningún oficio'); if (!Ciudad.transit.length) E('libre: sin transporte en movimiento'); } catch (e) { E('libre: ' + e.message); }
    // al volante y viaje en cable
    let nV = 0; for (const lv of Volante.levels()) { try { const st = Volante.create(lv.id, { seed: 1, auto: true }); nV++; if (!st.sched.every(fin) || !isFinite(st.x)) E('volante horario/posición inválida ' + lv.id); const R = Volante.route(NET.byId[st.line]); if (!R.lim.every(fin)) E('volante límites ' + lv.id); } catch (e) { E('volante ' + lv.id + ': ' + e.message); } }
    for (const lv of CableViaje.levels()) { try { const st = CableViaje.create(lv.id, { seed: 1 }); if (st.stS.length < 2 || !st.stS.every(fin)) E('cable viaje sin estaciones ' + lv.id); } catch (e) { E('cableviaje ' + lv.id + ': ' + e.message); } }
    // metroplús
    for (const lv of MPlus.levels()) { try { const st = MPlus.create(lv.id, { seed: 1 }); if (!st.X.length || !st.lanes.some(l => l.bus)) E(lv.id + ': sin cruces o sin carril de bus'); } catch (e) { E('metroplus ' + lv.id + ': ' + e.message); } }
    // metrocable: la solución guardada es válida y el tablero inicial no está resuelto
    let nK = 0; for (const lv of Cable.levels()) { try { const st = Cable.create(lv.id, {}); nK++; const s2 = Object.assign({}, st, { m: st.sol }); if (!Cable.solved(s2)) E(lv.id + ': la solución no conecta'); if (Cable.solved(st)) E(lv.id + ': empieza resuelto'); } catch (e) { E('cable ' + lv.id + ': ' + e.message); } }
    // historia
    for (const c of CAPS) if (c.go) { const M = EM.modes[c.go[0]]; if (!M) E('historia: modo ' + c.go[0]); else if (!M.levels().some(l => l.id === c.go[1])) Wn('historia: nivel ' + c.go[1] + ' no existe (usa el primero)'); }
    let nT = 0; try { nT = EM.trama ? EM.trama.check(E) : 0; } catch (e) { E('trama: ' + e.message); }
    let nA = 0; try { nA = EM.atlas ? EM.atlas.check(E) : 0; } catch (e) { E('atlas: ' + e.message); }
    // seguridad: una partida importada no cambia prototipos y los mensajes de otro celular no rompen el juego
    try {
      const d = Save.sanitize(JSON.parse('{"v":1,"__proto__":{"contaminado":1},"settings":{"__proto__":{"x":1}},"wallet":-5}'));
      if (({}).contaminado !== undefined || Object.getPrototypeOf(d) !== Object.prototype || d.wallet !== 0) E('seguridad: importar partidas no se sanea');
      const P0 = Multi.players;
      for (const m of [null, 'x', { t: 5 }, { t: 'hello', from: 3, name: {} }, { t: 'roster', p: JSON.parse('{"__proto__":{"name":"x"},"7":{"name":[1]}}'), host: {} }, { t: 'start', mode: 'constructor' }, { t: 'act', a: {} }, { t: 'sc', from: 2, name: 9 }, { t: 'st', s: [1] }]) Multi.onmsg(m);
      if (Object.values(Multi.players).some(q => typeof q.name !== 'string') || ({}).name !== undefined) E('seguridad: mensajes de red sin validar');
      Multi.players = P0;
    } catch (e) { E('seguridad: ' + e.message); }
    // Medellín reconocible: parche de casillas, barrios y nombres de calle (datos oficiales)
    let nBa = 0, nCa = 0; try {
      if (typeof CIUDAD === 'undefined') E('ciudad: falta src/data/ciudad.js'); else {
        nBa = CIUDAD.barrios.length; nCa = CIUDAD.calles.length - 1; if (!(MAP.parcheN > 80000)) E('ciudad: parche no aplicado (' + MAP.parcheN + ')');
        const cerca = (est, txt) => { const s = NET.stations.find(q => q.name === est); if (!s) return false; for (let r = 0; r <= 140; r += 10) for (let a = 0; a < TAU; a += .4) { const c = MAP.calleAt(s.x + Math.cos(a) * r, s.y + Math.sin(a) * r); if (c && (c.n + '|' + c.p).includes(txt)) return true; } return false; };
        const B = NET.stations.find(q => q.name === 'Parque Berrío'), bb = B && MAP.barrioAt(B.x, B.y); if (!bb || bb[0] !== 'La Candelaria') E('ciudad: Parque Berrío debería quedar en La Candelaria (' + (bb && bb[0]) + ')');
        for (const [est, txt] of [['Parque Berrío', 'Carrera 50'], ['Floresta', 'Carrera 80'], ['Hospital', 'Calle 67'], ['Industriales', 'Sistema Vial del Rio']]) if (!cerca(est, txt)) E('ciudad: cerca de ' + est + ' no aparece ' + txt);
      } } catch (e) { E('ciudad: ' + e.message); }
    const stats = `${NET.lines.length} líneas · ${NET.stations.length} estaciones · ${nC} tramos de metro · ${nB} rutas de bus · ${nV} recorridos 3D · ${nR} tableros de agujas · ${nK} puzles de cable · ${nT} capítulos en la ciudad · ${nA} piezas de arte · ${nBa} barrios · ${nCa} calles con nombre · ${LINE_META.trivia.length} preguntas · ${Object.keys(LINE_META.stationFacts).length} datos · ${Math.round(performance.now() - t0)} ms`;
    return { errors, warnings, stats };
  },
  monkey(n = 20, seed = 7) {
    const rng = new RNG(seed), errors = [], modes = ['conduce', 'bus', 'libre', 'cableviaje', 'conduce', 'bus', 'despacho', 'alim', 'metroplus', 'cable', 'volante'], cv = typeof document !== 'undefined' ? mkCanvas(360, 640) : null, g = cv ? cv.getContext('2d') : null;
    let games = 0, steps = 0, wins = 0;
    for (let k = 0; k < n; k++) {
      const id = modes[k % modes.length], M = EM.modes[id], lvs = M.levels().filter(l => !l.full); const lv = rng.pick(lvs);
      let st; try { st = M.create(lv.id, { seed: rng.i(1, 1e6), auto: true }); } catch (e) { errors.push(id + ' crear ' + lv.id + ': ' + e.message); continue; }
      games++; const dt = id === 'conduce' ? .1 : 1 / 20, max = id === 'conduce' ? 7000 : id === 'volante' ? 9000 : id === 'bus' ? 9000 : id === 'cableviaje' ? 6000 : id === 'libre' ? 2400 : 4800;
      try {
        for (let i = 0; i < max; i++) {
          M.step(st, dt); steps++;
          if (id === 'libre') { if (i % 25 === 0) st.joy = { x: rng.f() * 2 - 1, y: rng.f() * 2 - 1, m: rng.f() }; if (i % 90 === 0) { st.keys.up = rng.f() < .7; st.hb = rng.f() < .2; M.action(st); } if (i % 300 === 0) { M.offer(st); M.photo(st); } if (!isFinite(st.x) || !isFinite(st.vf)) throw new Error('jugador inválido'); }
          else if (id === 'bus') { if (!isFinite(st.x) || !isFinite(st.vf)) throw new Error('bus inválido'); }
          else if (id === 'volante' || id === 'cableviaje') { if (id === 'cableviaje' && i % 200 === 0) M.photo(st); if (id === 'volante' && (!isFinite(st.x) || !isFinite(st.v))) throw new Error('bus inválido'); }
          else if (id !== 'conduce') { if (i % 5 === 0) { const a = M.ai(st); if (a) M.act(st, a); } if (rng.f() < .01) { const a = this.randomAct(id, st, rng); if (a) M.act(st, a); } }
          else if (st.ph === 'dwell' && st.trivia) M.answer(st, 0);
          if (i % 400 === 0 && g) { g.setTransform(1, 0, 0, 1, 0, 0); if (id === 'conduce') st.view = ['cab', 'tps', 'lado', 'top', 'pan'][(i / 400) % 5 | 0]; if (id === 'volante') st.view = ['top', 'pan'][(i / 400) % 2 | 0]; if (id === 'cableviaje') st.view = ['lado', 'top'][(i / 400) % 2 | 0]; if (id === 'libre' || id === 'bus') st.far = (i / 400) % 2 === 1; M.draw(g, st, { x: 0, y: 0, w: 360, h: 640 }); }
          const r = M.result(st); if (!isFinite(r.score)) throw new Error('puntaje no numérico');
          if (id === 'conduce' && (!isFinite(st.v) || !isFinite(st.s) || st.v < 0)) throw new Error('física inválida v=' + st.v + ' s=' + st.s);
          if (st.ents && st.ents.length > 300) throw new Error('demasiados vehículos');
          if (st.veh && st.veh.length > 400) throw new Error('demasiados carros');
          if (r.done) { if (r.win) wins++; break; }
        }
      } catch (e) { errors.push(id + ' ' + lv.id + ': ' + e.message); }
    }
    return { games, steps, wins, errors };
  },
  randomAct(id, st, rng) {
    if (id === 'despacho' || id === 'alim') return st.swl.length ? { k: 'sw', i: rng.pick(st.swl) } : null;
    if (id === 'metroplus') return { k: 'x', i: rng.i(0, st.X.length - 1) };
    if (id === 'cable') return { k: 'rot', i: rng.i(0, st.m.length - 1) };
    return null;
  }
};
