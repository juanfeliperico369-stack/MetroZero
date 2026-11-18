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
    let nPo = 0; try { nPo = Album.check(E); } catch (e) { E('álbum: ' + e.message); }
    // maqueta 2:1: la proyección va y vuelve, y el dibujo pinta ciudad (no solo cielo)
    try {
      const s = NET.stations.find(q => q.name === 'San Antonio'), c = { x: s.x, y: s.y, a: .3 }, r0 = Iso.rot;
      for (let r = 0; r < 4; r++) { Iso.rot = r; const p = Iso.P(s.x + 50, s.y - 30, Iso.Z0, c, 200, 160), w = Iso.Pi(p.x, p.y, c, 200, 160); if (Math.hypot(w.x - s.x - 50, w.y - s.y + 30) > .5) E('maqueta: la proyección no vuelve con giro ' + r); }
      Iso.rot = r0; if (!EM.headless) { Iso.render(c, 96, 72); const d = Iso.d; let tierra = 0; for (let i = 0; i < d.length; i++) if (((d[i] >> 16) & 255) - (d[i] & 255) < 20) tierra++; /* el cielo es azulado: azul mucho mayor que rojo */ if (tierra < d.length * .3) E('maqueta: el dibujo salió casi vacío'); }
    } catch (e) { E('maqueta: ' + e.message); }
    // calendario: festivos de Colombia y horarios del Metro (lunes a sábado 4:30–23; domingos y festivos 5–22) y de EnCicla
    try {
      const F = (y, m, d, h = 12, mi = 0) => new Date(y, m - 1, d, h, mi);
      if (festivo(F(2026, 1, 12)) !== 'Reyes Magos' || festivo(F(2026, 4, 3)) !== 'Viernes Santo' || festivo(F(2026, 5, 18)) !== 'Ascensión del Señor' || festivo(F(2026, 11, 18))) E('calendario: festivos de 2026 mal calculados');
      if (serviceOpen(F(2026, 11, 22, 4, 45)) || !serviceOpen(F(2026, 11, 23, 4, 45)) || serviceOpen(F(2026, 11, 22, 22, 30)) || !serviceOpen(F(2026, 11, 21, 22, 30)) || serviceOpen(F(2026, 1, 12, 4, 45))) E('calendario: horario del Metro equivocado');
      if (!enciclaHorario(F(2026, 11, 22, 9)).abierto || enciclaHorario(F(2026, 11, 22, 16)).abierto || !enciclaHorario(F(2026, 11, 23, 6)).abierto) E('calendario: horario de EnCicla equivocado');
    } catch (e) { E('calendario: ' + e.message); }
    // mapa ajustado (src/data/ajustes.js): nombres y barrios fuera de Medellín, huellas de estación; estaciones de EnCicla en Ciudad Libre
    try {
      if (typeof AJUSTES !== 'undefined' && !window.__sinAjustes) {
        if (!MAP.ajustado) E('ajustes: no se aplicaron'); if (!MAP.techos || MAP.techos.length < 49) E('ajustes: faltan huellas de estación (' + (MAP.techos || []).length + ')');
        const bl = NET.stations.find(q => q.name === 'Bello'); if (!MAP.barrioAt(bl.x, bl.y)) E('ajustes: Bello sin barrio');
        if (AJUSTES.calles) { let nm = 0; for (let k = 0; k < (MAP.rE || []).length; k++) if (MAP.rE[k]) nm++; if (nm < 50000) E('ajustes: pocos nombres de calle nuevos (' + nm + ')'); }
      }
      if (typeof ENCICLA !== 'undefined') { if (ENCICLA.estaciones.length < 100) E('encicla: faltan estaciones'); const L = EM.modes.libre.create('lb:San Antonio', { seed: 3 }); if (L.docks.length !== ENCICLA.estaciones.length || !L.parked.some(p => p.dock != null)) E('encicla: anclajes sin bicis'); }
    } catch (e) { E('ajustes: ' + e.message); }
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
        nBa = CIUDAD.barrios.length; nCa = CIUDAD.calles.length - 1; if (!(MAP.parcheN > 60000)) E('ciudad: parche no aplicado (' + MAP.parcheN + ')');
        const cerca = (est, txt) => { const s = NET.stations.find(q => q.name === est); if (!s) return false; for (let r = 0; r <= 140; r += 10) for (let a = 0; a < TAU; a += .4) { const c = MAP.calleAt(s.x + Math.cos(a) * r, s.y + Math.sin(a) * r); if (c && (c.n + '|' + c.p).includes(txt)) return true; } return false; };
        const B = NET.stations.find(q => q.name === 'Parque Berrío'), bb = B && MAP.barrioAt(B.x, B.y); if (!bb || bb[0] !== 'La Candelaria') E('ciudad: Parque Berrío debería quedar en La Candelaria (' + (bb && bb[0]) + ')');
        for (const [est, txt] of [['Parque Berrío', 'Carrera 50'], ['Floresta', 'Carrera 80'], ['Hospital', 'Calle 67'], ['Industriales', 'Sistema Vial del Rio']]) if (!cerca(est, txt)) E('ciudad: cerca de ' + est + ' no aparece ' + txt);
      } } catch (e) { E('ciudad: ' + e.message); }
    // ciudad vectorial (1.1.0): calles con curva, edificios fuera de las vías, andenes sobre su línea, giros suaves y buses sobre el asfalto
    let nVias = 0, nEd = 0; try {
      if (typeof VIAS !== 'undefined') {
        if (!VC.on || VC.ch.length < 20000) E('ciudad vectorial: no cargó las vías (' + VC.ch.length + ')'); nVias = VC.ch.length;
        const asfalto = (x, y, m = -.3) => { for (const c of VC.near(x - 20, y - 20, x + 20, y + 20)) { if (c.k > 4) continue; const P = c.P; for (let i = 2; i < P.length; i += 2) { const ax = P[i - 2], ay = P[i - 1], dx = P[i] - ax, dy = P[i + 1] - ay, t = clamp(((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy || 1), 0, 1); if (Math.hypot(ax + dx * t - x, ay + dy * t - y) < c.w / 2 + m) return true; } } return false; };
        let nb = 0, mal = 0; for (const n of ['Parque Berrío', 'Estadio', 'Santo Domingo Savio']) { const h = NET.stations.find(q => q.name === n); if (!h) continue; const R = VC.regionAt(h.x, h.y); for (const b of R.bs) { nb++; if (asfalto(b.x, b.y)) mal++; } }
        if (nb < 500) E('ciudad vectorial: pocos edificios generados (' + nb + ')'); if (mal) E('ciudad vectorial: ' + mal + ' edificios sobre el asfalto');
        for (const l of NET.lines) { if (l.kind !== 'metro' && l.kind !== 'tram') continue; const P = l.P.pts; let giro = 0; for (let i = 2; i < P.length; i++) { let d = Math.abs(Math.atan2(P[i].y - P[i - 1].y, P[i].x - P[i - 1].x) - Math.atan2(P[i - 1].y - P[i - 2].y, P[i - 1].x - P[i - 2].x)); if (d > Math.PI) d = TAU - d; giro = Math.max(giro, d); }
          if (l.kind === 'metro' && giro > .2) E(l.id + ': la vía tiene un quiebre de ' + Math.round(giro * 57.3) + '° (debe ser curva)');
          for (const s of l.st) { if (NET.project(l.P, s.x, s.y).d > 1) E(l.id + ': el andén de ' + s.name + ' no está sobre su línea'); if (Math.hypot(s.ox - s.x, s.oy - s.y) > 30) Wn(l.id + ': ' + s.name + ' quedó a ' + Math.round(Math.hypot(s.ox - s.x, s.oy - s.y)) + ' m de su punto');
            const K = KIND[l.kind], s0 = clamp(s.s - K.plat / 2, 0, Math.max(0, l.P.len - K.plat)), a0 = NET.dirAt(l.P, s0 + 5, 4), a1 = NET.dirAt(l.P, s0 + K.plat - 5, 4); let da = Math.abs(a1 - a0); if (da > Math.PI) da = TAU - da; if (l.kind === 'metro' && da > .44) Wn(l.id + ': el andén de ' + s.name + ' gira ' + Math.round(da * 57.3) + '°'); } }
        let n = 0, f = 0, nmp = 0, fmp = 0; for (const l of NET.lines) { if (l.kind !== 'brt' && l.kind !== 'feeder') continue; for (let t = 0; t < l.P.len; t += 25) { const q = NET.at(l.P, t); if (l.kind === 'feeder') { n++; if (!asfalto(q.x, q.y, 4)) f++; } else { nmp++; if (VC.solid(q.x, q.y, 1)) fmp++; } } }
        if (n && f / n > .06) E('alimentadores: ' + Math.round(f / n * 100) + ' % del recorrido va por fuera de las calles');
        if (nmp && fmp) E('Metroplús: ' + fmp + ' puntos de su carril quedaron dentro de un edificio o del agua');
        // arquitectura icónica: cargada, sin edificios genéricos encima y sólida (las plazas se caminan)
        if (VC.HT.length < 28) E('arquitectura: faltan hitos (' + VC.HT.length + ' de 30)');
        for (const id of ['coltejer', 'catedral', 'estadio', 'bibespana']) { const H = VC.HT.find(q => q.id === id); if (!H) { E('arquitectura: falta ' + id); continue; } const R = VC.regionAt(H.cx, H.cy); if (R.bs.some(b => VC.dentroH(H, b.x, b.y))) E('arquitectura: edificios genéricos sobre ' + H.n); if (id !== 'estadio' && !VC.solid(H.cx, H.cy, .3)) E('arquitectura: ' + H.n + ' no se choca'); }
        const B0 = VC.HT.find(q => q.id === 'botero'); if (B0 && VC.solid(B0.cx + 6, B0.cy + 6, .3) && VC.solid(B0.cx - 6, B0.cy - 6, .3)) Wn('arquitectura: la Plaza Botero no se deja caminar');
        // casas y edificios reales (1.2.0): cargados, con pisos y usos, y con la calle siempre libre (se recortan contra el asfalto)
        if (typeof EDIFICIOS !== 'undefined') {
          if (!VC.ED) E('edificios reales: no cargaron'); else {
            nEd = VC.ED.cnt.reduce((a, b) => a + b, 0); if (nEd < 600000) E('edificios reales: solo ' + nEd + ' (deben ser más de 600.000)');
            let m = 0, bl = 0; for (const n of ['Parque Berrío', 'Estadio', 'Santo Domingo Savio', 'Poblado', 'Niquía', 'San Javier']) { const h = NET.stations.find(q => q.name === n); if (!h) continue;
              for (const c of VC.near(h.x - 220, h.y - 220, h.x + 220, h.y + 220)) { if (c.k > 4) continue; const P = c.P; for (let i = 2; i < P.length; i += 2) { const ax = P[i - 2], ay = P[i - 1], dx = P[i] - ax, dy = P[i + 1] - ay, L = Math.hypot(dx, dy) || 1;
                for (let t = 0; t < L; t += 4) { const x = ax + dx * t / L, y = ay + dy * t / L; if (Math.abs(x - h.x) > 220 || Math.abs(y - h.y) > 220) continue; const ox = -dy / L * (c.w / 2 - .8), oy = dx / L * (c.w / 2 - .8); m++; if (VC.solid(x + ox, y + oy, .4) || VC.solid(x - ox, y - oy, .4)) bl++; } } } }
            if (m < 500) Wn('edificios reales: pocas muestras de calle (' + m + ')'); else if (bl / m > .01) E('edificios reales: ' + (bl / m * 100).toFixed(1) + ' % de los bordes de carril quedan dentro de un edificio'); else if (bl / m > .003) Wn('edificios reales: ' + (bl / m * 100).toFixed(2) + ' % de los bordes de carril tocan un edificio');
            const hp = NET.stations.find(q => q.name === 'Poblado'); if (hp && !VC.regionAt(hp.x, hp.y).bs.some(b => b.k === 2 && b.pis >= 10)) Wn('edificios reales: El Poblado sin torres de 10 pisos o más');
            const hu = NET.stations.find(q => q.name === 'Universidad'); if (hu && !VC.regionAt(hu.x, hu.y).bs.some(b => b.k === 4)) Wn('edificios reales: la Universidad de Antioquia sin edificios educativos cerca de su estación');
            if (!VC.campus || VC.campus.length < 20) Wn('campus universitarios: pocos (' + (VC.campus ? VC.campus.length : 0) + ')');
            if (!VC.SG || VC.suelosEn(0, 0, MW * TM, MH * TM).filter(o => o.t === 'cancha').length < 800) Wn('suelos: pocas canchas');
          }
        }
      }
    } catch (e) { E('ciudad vectorial: ' + e.message); }
    const stats = `${NET.lines.length} líneas · ${NET.stations.length} estaciones · ${nC} tramos de metro · ${nB} rutas de bus · ${nV} recorridos 3D · ${nR} tableros de agujas · ${nK} puzles de cable · ${nT} capítulos en la ciudad · ${nA} piezas de arte · ${nPo} postales · ${nBa} barrios · ${nCa} calles con nombre · ${nVias} vías con curva · ${nEd} casas y edificios reales · ${VC.HT.length} piezas de arquitectura · ${LINE_META.trivia.length} preguntas · ${Object.keys(LINE_META.stationFacts).length} datos · ${Math.round(performance.now() - t0)} ms`;
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
