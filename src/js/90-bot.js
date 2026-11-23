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
        // Metroplús (1.3.0): cada estación sobre su línea, cerca de su andén real (las terminales pueden quedar más lejos) y fuera de los edificios
        for (const l of NET.lines) { if (l.kind !== 'brt') continue; if (l.st.length < 8) E(l.id + ': solo ' + l.st.length + ' estaciones');
          for (const s of l.st) { if (NET.project(l.P, s.x, s.y).d > 1) E(l.id + ': ' + s.name + ' no está sobre su línea'); const d = Math.hypot(s.ox - s.x, s.oy - s.y); if (d >= 45) Wn(l.id + ': ' + s.name + ' (terminal) quedó a ' + Math.round(d) + ' m de su andén real'); if (VC.solid(s.x, s.y, .5)) E(l.id + ': la estación ' + s.name + ' quedó dentro de un edificio'); } }
        // puentes y niveles (1.3.0): cargados, con su calle encima, pilas sólidas; por la rampa se sube, por la mitad se pasa por debajo y la baranda no deja caer
        if (typeof PUENTES !== 'undefined') {
          if (!VC.PU || VC.PU.length < 1500) E('puentes: solo ' + (VC.PU ? VC.PU.length : 0) + ' (deben ser más de 1.500)'); else {
            const npz = VC.ch.filter(c => c.pz).length; if (npz < 500) E('puentes: solo ' + npz + ' calles pasan por un puente');
            const B = VC.PU.filter(q => !q.pe && q.h >= 5 && q.len >= 80 && q.pil.length >= 2).sort((a, b) => b.len - a.len)[0];
            if (!B) E('puentes: ningún puente vehicular alto'); else {
              if (!VC.solid(B.pil[0], B.pil[1], .3)) E('puentes: las pilas no se chocan');
              const Lb = EM.modes.libre, a = VC.puAt(B, 1), m = VC.puAt(B, B.len / 2), no = () => false;
              const r1 = Lb.nivel({ x: a.x - a.ux, y: a.y - a.uy, z: 0 }, a.x, a.y, no, true); if (!r1[0] || r1[1] !== B.z) E('niveles: por la rampa no se sube al puente');
              const r2 = Lb.nivel({ x: m.x + m.uy * 30, y: m.y - m.ux * 30, z: 0 }, m.x, m.y, no, true); if (!r2[0] || r2[1] !== 0) E('niveles: por debajo de la mitad del puente no se pasa');
              const r3 = Lb.nivel({ x: m.x, y: m.y, z: B.z }, m.x - m.uy * (B.w / 2 + 1.5), m.y + m.ux * (B.w / 2 + 1.5), no, true); if (r3[0]) E('niveles: desde lo alto del puente se cae por la baranda');
            }
          }
          // viaducto: entre columnas se pasa por debajo (y el jugador se ve a través del tablero); las columnas fuera de la calle sí se chocan
          const lA = NET.lines.find(l => l.id === 'A'); if (lA) { let n = 0, mal = 0, nc = 0, mc = 0;
            for (let t = 615; t < lA.P.len - 600; t += 300) { if (lA.st.some(s => Math.abs(s.s - t) < 120)) continue; const q = NET.at(lA.P, t); n++; if (VC.enBase(q.x, q.y, .3) || !VC.tapado(q.x, q.y)) mal++; const c = NET.at(lA.P, t - 15); if (!VC.enSegs(VC.segsCerca(c.x, c.y, 1), c.x, c.y)) { nc++; if (!VC.enBase(c.x, c.y, .3)) mc++; } }
            if (mal) E('viaducto: en ' + mal + ' de ' + n + ' puntos no se pasa por debajo'); if (mc) E('viaducto: ' + mc + ' de ' + nc + ' columnas no se chocan'); }
          // estaciones del metro: la calle que pasa por debajo (Bolívar en el Centro, la 80 en Floresta) queda libre
          let na = 0, ba = 0; for (const l of NET.lines) { if (l.kind !== 'metro') continue; for (const s of l.st) { const pl = KIND.metro.plat, s0 = clamp(s.s - pl / 2, 0, Math.max(0, l.P.len - pl));
            for (let t = s0 + 22; t <= s0 + pl - 22; t += 3) for (let o = -10; o <= 10; o += 2.5) { const q = NET.at(l.P, t, o); if (!asfalto(q.x, q.y)) continue; na++; if (VC.enBase(q.x, q.y, .3)) ba++; } } }
          if (na > 200 && ba / na > .03) E('estaciones del metro: ' + (ba / na * 100).toFixed(1) + ' % de la calle que pasa por debajo quedó tapada'); else if (na > 200 && ba / na > .01) Wn('estaciones del metro: ' + (ba / na * 100).toFixed(1) + ' % de la calle de abajo tocada por un acceso');
        }
        // manejo (1.3.0): a ninguna velocidad el giro pasa de la aceleración lateral que aguanta cada vehículo; el ritmo elige ×1, ×1,5 y ×2
        for (const kd in VEH) { const V = VEH[kd]; for (const v of [6, 12, 20, V.vmax]) { const a = v * v / V.wb * Math.tan(Libre.giroMax(V, v, false)); if (a > (V.lat || 8) * 1.02 + .01) E('manejo: ' + V.n + ' gira con ' + a.toFixed(1) + ' m/s² a ' + Math.round(v * 3.6) + ' km/h (tope ' + V.lat + ')'); } }
        { const s0 = Save.d.settings.ritmo; const E3 = [0, 1, 2].map(r => { Save.d.settings.ritmo = r; return [Libre.escala({ mode: 'walk' }), Libre.escala({ mode: 'ride' })]; }); Save.d.settings.ritmo = s0; if (E3[0][0] !== 1 || E3[2][0] !== 2 || E3[2][1] !== 6) E('ritmo: escalas ' + JSON.stringify(E3)); }
        // buses (1.3.0): las esquinas de cada recorrido tienen radio de giro (ningún quiebre de más de 25° en menos de 2 m)
        { let peor = 0, cual = ''; for (const l of NET.lines) { if (l.kind !== 'feeder' && l.kind !== 'brt') continue; const P = l.P.pts; for (let i = 2; i < P.length; i++) { const L1 = dist(P[i - 1].x, P[i - 1].y, P[i - 2].x, P[i - 2].y), L2 = dist(P[i].x, P[i].y, P[i - 1].x, P[i - 1].y); if (L1 < .3 || L2 < .3) continue; let d = Math.abs(Math.atan2(P[i].y - P[i - 1].y, P[i].x - P[i - 1].x) - Math.atan2(P[i - 1].y - P[i - 2].y, P[i - 1].x - P[i - 2].x)); if (d > Math.PI) d = TAU - d; if (d > .44 && Math.min(L1, L2) < 2 && d > peor) { peor = d; cual = l.id; } } } if (peor) Wn('buses: ' + cual + ' gira ' + Math.round(peor * 57.3) + '° en una esquina sin curva'); }
        // gente de la ciudad (1.3.0): cada personaje tiene dónde estar, cara y qué contar
        if (typeof GENTE !== 'undefined') { if (GENTE.length < 18) E('gente: solo ' + GENTE.length + ' personajes'); for (const G of GENTE) { const [t, a] = G.en; if (t === 'hito' && !VC.HT.some(h => h.id === a)) E('gente: ' + G.n + ' no tiene su lugar (' + a + ')'); if (t === 'est' && !NET.stations.some(s => s.name === a)) E('gente: ' + G.n + ' no tiene su estación (' + a + ')'); if (!G.f.some(f => f[0] === 1)) Wn('gente: ' + G.n + ' no cuenta nada poco conocido'); } }
        if (typeof Perfil !== 'undefined') { const q = Perfil.ped(); if (!/^#[0-9a-f]{6}$/i.test(q.skin) || !/^#[0-9a-f]{6}$/i.test(q.col)) E('tu personaje: colores inválidos'); }
        if (typeof CamUI === 'undefined') E('cámara: falta la de las otras vistas');
        // vistas y mapa (1.4.0): cuatro estilos de vista, joystick con la cámara en 3D, piso 3D con calles, edificios reales en 3D y el mapa con todo para elegir
        if (Libre.VISTAS.length < 4) E('vistas: faltan estilos');
        // terreno para el Plan único (1.5.0): vehículos que se montan, carro y bus de ruta; la carrera sin fin con sus líneas
        for (const kd of ['scooter', 'monopatin', 'skate', 'patines', 'carro', 'bus']) if (!VEH[kd]) E('vehículos: falta ' + kd);
        if (typeof Carrera === 'undefined' || Carrera.levels().length < 4) E('carrera sin fin: faltan líneas'); else { const c = Carrera.create('cr:A', { seed: 3 }); for (let i = 0; i < 600; i++) Carrera.step(c, 1 / 20); if (!isFinite(c.s) || c.s < 100) E('carrera sin fin: no avanza'); } { const j = Libre.joyMundo({ vista3: '3p', cy: 0, cyo: 0, joy: { x: 0, y: -1, m: 1 } }); if (Math.abs(j.x - 1) > 1e-6 || Math.abs(j.y) > 1e-6) E('vistas: en 3D el joystick no va con la cámara'); }
        if (typeof G3 === 'undefined' || typeof G3.edifReales !== 'function' || typeof VC.piso3D !== 'function') E('vistas 3D: faltan los edificios reales o el piso con calles'); else { const c = VC.piso3D(14000, 23000, 200, .5); if (!c || c.width !== 100) E('vistas 3D: el piso no se arma'); }
        // 2.0.0 · entregas del Plan único: taller de arte (Codex), carrera con vehículos y poderes, deprimidos reales, cámara de cine y personajes de EnCicla
        { const T = EM.taller; if (!T || !T.Malla) E('taller de arte: no cargó'); else { for (const id of T.vehiculos) { const d = T.vehiculo(id).datos(); if (!d.length || d.length % 30 || d.some(v => !isFinite(v))) E('taller: malla mala de ' + id); } for (const id of T.obstaculos) if (!T.pista(id).caras.length) E('taller: obstáculo vacío ' + id); for (const k of Object.keys(MALLA3)) if (!T.vehiculos.includes(MALLA3[k][0])) E('taller: no hay pieza para ' + k); for (const k of Object.keys(CR_OBS)) if (!T.obstaculos.includes(k)) E('taller: no hay pieza para el obstáculo ' + k); } }
        { const c = Carrera.create('cr:B', { seed: 5 }); c.obs.unshift({ s: 31, c: 1, k: 'turbo' }, { s: 34, c: 1, k: 'cono' }, { s: 40, c: 1, k: 'escudo' }, { s: 44, c: 1, k: 'perro' }); c.v = 8; for (let i = 0; i < 160 && c.s < 47; i++) Carrera.step(c, 1 / 20);
          if (c.vidas !== 3) E('carrera: el turbo o el escudo no protegen (' + c.vidas + ' vidas)'); if (c.poderes < 2) E('carrera: no recoge poderes'); Carrera.act(c, 'vehiculo'); if (c.vi !== 1) E('carrera: no cambia de vehículo'); if (EM.ciclo && EM.ciclo.armar()) { if (!Carrera.levels().some(l => /^cr:c\d+$/.test(l.id))) E('carrera: no hay niveles de ciclorruta'); const m = Carrera.create('cr:MPO', { seed: 2 }); if (!m.cic) E('carrera: el atajo de la línea O no sale en una ciclorruta'); else { let fuera = 0; for (let s = 0; s < Math.min(600, m.cic.cum[m.cic.cum.length - 1]); s += 15) { const q = Carrera.pos(m, s, 1); if (!VC.near(q.x - 6, q.y - 6, q.x + 6, q.y + 6).some(c => c.k === 5)) fuera++; } if (fuera > 2) E('carrera: la pista se sale de la ciclorruta (' + fuera + ')'); } } else if (!Carrera.levels().some(l => l.id === 'cr:MPO')) E('carrera: falta la línea O'); }
        { const D = PUENTES.B.filter(r => r[1] < 0); if (D.length < 10) E('deprimidos: solo ' + D.length); else { const B = VC.PU.find(b => b.is_tunnel && b.len > 100), q = VC.puAt(B, B.len / 2), P = VC.puenteEn(q.x, q.y, -1, 0); if (!P || P.h < 3) E('deprimidos: el tramo cubierto no baja'); if (Libre.alto3({ x: q.x, y: q.y, z: -1, mode: 'walk' }) > MAP.elevM(q.x, q.y) - 3) E('deprimidos: en 3D el jugador no baja'); } }
        // 3.0 · manejo de Motor City 4.5 adaptado. Con un muro recto de prueba (y > 0 es pared): el roce en diagonal desliza y conserva
        // velocidad sin contar golpe, de frente frena y cuenta el golpe. Con un edificio real: si quedó metido, sale solo.
        { const V = VEH.taxi, prueba = (h, n, y0 = -1.6) => { const st = { x: 0, y: y0, z: 0, h, vf: 12, vs: 0, crashes: 0, dmg: 0, shake: 0 }, muro = (x, y) => { const c = Math.cos(st.h), s = Math.sin(st.h), l = V.len / 2, w = V.wid / 2; for (const [u, v] of [[l, w], [l, -w], [-l, w], [-l, -w], [0, 0]]) if (y + s * u + c * v > 0) return true; return false; };
            const x0 = st.x; for (let i = 0; i < n; i++) { const dt = 1 / 60, dx = Math.cos(st.h) * st.vf * dt, dy = Math.sin(st.h) * st.vf * dt; if (!muro(st.x + dx, st.y + dy)) { st.x += dx; st.y += dy; } else Libre.deslizar(st, V, dx, dy, dt, muro); } return { d: st.x - x0, v: st.vf, dentro: muro(st.x, st.y), choques: st.crashes }; };
          const a = prueba(.15, 60); if (a.d < 9 || a.v < 9 || a.dentro || a.choques) E('manejo: el roce en diagonal no desliza (' + JSON.stringify(a) + ')');
          const b = prueba(Math.PI / 2, 40, -4); if (b.v > 3 || b.dentro || !b.choques) E('manejo: de frente no frena (' + JSON.stringify(b) + ')'); }
        if (VC.on) { const st = Libre.create('lb:San Antonio', { seed: 2 }), V = VEH.taxi, h = Libre.hub('San Antonio'), Rg = VC.regionAt(h.x + 200, h.y + 200), B = (Rg.fis || Rg.bs).filter(b => b.k !== 10 && b.hw > 9 && b.hd > 5)[0];
          if (B) { Object.assign(st, { mode: 'veh', veh: { kind: 'taxi' }, x: B.x, y: B.y, z: 0, h: 0, vf: 0, vs: 0, steer: 0, thr: 1, joy: { x: 0, y: 0, m: 0 }, keys: { up: true }, hb: false, _atasco: 0, _empujon: null, _chT: 0, desatascos: 0 }); for (let i = 0; i < 150 && Libre.hitV(st.x, st.y, st.h, V); i++) Libre.drive(st, 1 / 60); if (Libre.hitV(st.x, st.y, st.h, V)) E('manejo: metido en un edificio no sale'); } }
        if (VC.on) { const H = (VC.HT || []).find(h => h.C && h.k === 'estadio'); if (H) { let malos = 0, n = 0; for (const [dx, dy] of [[0, 0], [VC.R, 0], [0, VC.R], [-VC.R, 0], [0, -VC.R]]) { const Rg = VC.regionAt(H.cx + dx, H.cy + dy), T = Rg.trees || []; for (let i = 0; i < T.length; i += 4) { n++; if (!VC.sembrable(T[i], T[i + 1], VC.suelosEn(T[i] - 2, T[i + 1] - 2, T[i] + 2, T[i + 1] + 2))) malos++; } } if (malos) E('árboles: ' + malos + ' de ' + n + ' en canchas, piscinas o en medio de una plaza dura'); } }   // 3.0 · árboles con lógica
        if (EM.cronicas) { const L = EM.cronicas.lista(); if (L.length < 10) E('crónicas: solo ' + L.length); for (const l of L) { const p = EM.cronicas.narrador(l, 'prueba'), t = EM.cronicas.lineas(l); if (!p || !p.look || !p.G.n || t.length < 3) E('crónicas: incompleta la de ' + l.id); } }   // 3.0 · crónicas del sistema
        // 3.2 · arcade: los modos arrancan y avanzan con lo que haría un jugador; actividades del mundo abierto; carrera fuera de los edificios
        { const M = EM.modes.conduce, s1 = M.create('A:0-2', { seed: 3 }); s1.keys = { up: true }; for (let i = 0; i < 300; i++) M.step(s1, 1 / 30); if (Save.d.settings.arcade !== 0 && !(s1.v > 11)) E('arcade: el metro no arranca con la palanca (' + Math.round(s1.v * 3.6) + ' km/h en 10 s, fase ' + s1.ph + ')');
          const Vo = EM.modes.volante, s2 = Vo.create('vo:MP1:0-4', { seed: 3 }), x0 = s2.x, y0 = s2.y; s2.keys = { up: true }; for (let i = 0; i < 300; i++) Vo.step(s2, 1 / 30); if (Math.hypot(s2.x - x0, s2.y - y0) < 40) E('arcade: el bus del volante no avanza (' + Math.round(Math.hypot(s2.x - x0, s2.y - y0)) + ' m en 10 s)'); }
        if (EM.actividades) { const h = NET.stations.find(s => s.name === 'Acevedo'), q = h && EM.actividades.aqui({ x: h.x, y: h.y, mode: 'walk' }); if (!q || q.G.length < 3) E('actividades: Acevedo sin modos para jugar');
          const s3 = EM.modes.conduce.create('A:3-5', { seed: 1 }); if (s3.stops.join() !== '3,4,5') E('actividades: el tramo «desde aquí» no arranca en su estación (' + s3.stops.join() + ')');
          const s4 = EM.modes.tranvia.create('T:3-1', { seed: 1 }); if (s4.stops.join() !== '3,2,1') E('actividades: el tranvía «desde aquí» no arranca en su estación'); }
        if (VC.on && EM.modes.carrera.offAt) { const C = EM.modes.carrera, s5 = C.create('cr:A', { seed: 1 }); let malos = 0; for (let s = 40; s < 600; s += 10) { const q = C.pos(s5, s, 1); if (VC.solid(q.x, q.y, .3)) malos++; } if (malos > 4) E('carrera: la pista pasa por dentro de ' + malos + ' edificios'); }
        { const c = VC.camaraLibre(14000, 23000, 14030, 23040, 1500); if (!c || !isFinite(c.z) || VC.solid(c.x, c.y, 2)) E('cámara de cine: queda dentro de un edificio'); }
        { const ec = GENTE.filter(g => g.frag); if (ec.length !== 6) E('EnCicla: ' + ec.length + ' de 6 personajes'); for (const g of ec) if (!NET.stations.some(s => s.name === g.en[1])) E('EnCicla: no existe la estación ' + g.en[1]); }
        { const C = Libre.mapaCosas({ gente: [] }); if (C.filter(o => o.t === 'est').length < 70 || C.filter(o => o.t === 'hito').length < 25) E('mapa: faltan estaciones o lugares para elegir (' + C.length + ')'); }
        // cámara (1.3.0): tres ángulos distintos y el del guardado aplicado
        if (!VC.ANGULOS || VC.ANGULOS.length < 3 || new Set(VC.ANGULOS.map(A => A.ob)).size !== VC.ANGULOS.length) E('cámara: faltan ángulos');
        else if (VC.ob !== VC.ANGULOS[clamp(Save.d.settings.angulo | 0, 0, VC.ANGULOS.length - 1)].ob) E('cámara: el ángulo guardado no se aplicó');
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
    // 3.4.0 · mundo 3D único, mundoRPG (6 zonas Skate/Parkour + 10 módulos + 6 subtramas), ciclovías y regresiones (CableViaje hora 1, Bus al bajar, colisión barrida)
    try {
      const cv0 = CableViaje.create('cv:K', { seed: 1 }); if (!isFinite(cv0.hourNow)) E('cableviaje: hourNow inválido en el primer cuadro');
      if (!Libre.VISTAS.some(v => v[0] === 'cen3d') || !Libre.VISTAS.some(v => v[0] === '1p')) E('vistas 3.4: faltan cen3d o 1p');
      const jc = Libre.joyMundo({ vista3: 'cen3d', cy: 1.2, cyo: 0, joy: { x: 0, y: -1, m: 1 } }); if (Math.abs(jc.x) > 1e-6 || Math.abs(jc.y + 1) > 1e-6) E('vistas 3.4: cen3d debe mantener Norte arriba');
      if (!EM.mundoRPG) E('mundoRPG 3.4: no cargó EM.mundoRPG');
      else {
        const Z = EM.mundoRPG.zonas(); if (Z.length < 6) E('mundoRPG 3.4: faltan zonas Skate/Parkour (' + Z.length + ')');
        for (const z of Z) if (!fin(z.x) || !fin(z.y)) E('mundoRPG 3.4: zona con coords inválidas ' + z.id);
        if (EM.mundoRPG.MODULOS.length < 10) E('mundoRPG 3.4: faltan módulos abiertos (' + EM.mundoRPG.MODULOS.length + ')');
        if (EM.mundoRPG.SUBTRAMAS.length < 6) E('mundoRPG 3.4: faltan subtramas (' + EM.mundoRPG.SUBTRAMAS.length + ')');
      }
      const cr = Carrera.create('cr:A', { seed: 9 });
      if (!cr.tramos || cr.tramos.length < 3 || !cr.giros || !cr.giros.length) E('carrera 3.2: faltan tramos de ancho variable o giros direccionales');
      cr.obs.unshift({ s: 28, c: 1, k: 'rampa' }, { s: 46, c: 1, k: 'baranda' }, { s: 64, c: 1, k: 'arco' });
      cr.v = 18; cr.s = 26.8; Carrera.step(cr, .2); // paso grande: la colisión barrida debe detectar la rampa sin saltarla
      if (cr.y <= 0 && cr.vy <= 0) E('carrera 3.2: la rampa o la colisión barrida falló');
      const b = Bus.create(Bus.levels()[0].id, { seed: 2 }); b.ph = 'stop'; b.pax = 5; b.waiting[b.ni] = []; Bus.doors(b); const al0 = b.alight;
      for (let i = 0; i < 40 && b.alight > 0; i++) Bus.stopTick(b, .1, NET.byId[b.line]);
      if (al0 > 0 && b.pax !== 5 - al0) E('bus 3.2: al bajar pasajeros st.pax quedó en ' + b.pax + ' (esperado ' + (5 - al0) + ')');
    } catch (e) { E('3.2.0: ' + e.message); }
    // 3.7.0 · GA-36-1 (ladeo en curvas), GA-36-2 (mitades 3D), GA-36-3 (huellas de subtramas + paradero/banca), GA-36-4 (arte G-110..G-112 con respaldo)
    try {
      if (!EM.ladeo) E('GA-36-1: falta EM.ladeo');
      else {
        const vS = 12, wS = .35, esp = Math.atan(vS * wS / 9.81);
        let phi = 0; for (let i = 0; i < 60; i++) phi = EM.ladeo.paso(phi, vS, wS, 1 / 30, false);
        if (Math.abs(phi - esp) > .02) E('GA-36-1: φ=' + phi.toFixed(3) + ' difiere de atan(v·ω/g)=' + esp.toFixed(3));
        let tope = 0; for (let i = 0; i < 60; i++) tope = EM.ladeo.paso(tope, 25, 1.5, 1 / 30, false);
        if (Math.abs(tope - .45) > .015) E('GA-36-1: el tope de ladeo no limita en ±0,45 rad (' + tope.toFixed(3) + ')');
        let aire = phi; for (let i = 0; i < 60; i++) aire = EM.ladeo.paso(aire, vS, wS, 1 / 30, true);
        if (Math.abs(aire) > .02) E('GA-36-1: en el aire no se endereza (' + aire.toFixed(3) + ')');
        const lb = Libre.create('lb:San Antonio', { seed: 3 });
        Object.assign(lb, { mode: 'veh', veh: { kind: 'bici', col: VEH.bici.col, id: -1 }, vf: 10, h: 0, ladeo: 0, joy: { x: 0, y: 1, m: 1 }, keys: { up: true, right: true } });
        for (let i = 0; i < 18; i++) Libre.step(lb, 1 / 30);
        if (!(Math.abs(lb.ladeo) > .03)) E('GA-36-1: la bici en curva en Ciudad Libre no se inclina (' + (lb.ladeo || 0).toFixed(3) + ')');
      }
      const ns = newSave();
      if (ns.settings.pantalla !== 'mitades' || !Array.isArray(ns.rpg.diario) || typeof ns.rpg.barrios !== 'object') E('GA-36: faltan valores por defecto en newSave()');
      if (!EM.mitades) E('GA-36-2: falta EM.mitades');
      if (!EM.subtramasVivas) E('GA-36-3: falta EM.subtramasVivas');
      else {
        const bak = JSON.parse(JSON.stringify(Save.d));
        try {
          Save.d = Save.sanitize(newSave());
          const ent = EM.subtramasVivas.registrar(null, 'pico-sa', 0, true);
          if (!ent || !Save.d.rpg.diario.length || Save.d.rpg.diario[0].id !== 'pico-sa') E('GA-36-3: la subtrama no dejó línea en el diario');
          if (!EM.ciudadViva || !EM.ciudadViva.noticias || !EM.ciudadViva.noticias().length) E('GA-36-3: la subtrama no dejó noticia en EM.ciudadViva');
          const sa = NET.stations.find(s => s.name === 'San Antonio');
          if (!(EM.subtramasVivas.repBarrio(sa.x, sa.y, 'La Candelaria') > 0)) E('GA-36-3: no subió la reputación del barrio');
          if (!EM.ciudadViva.fraseLugar('paradero') || !EM.ciudadViva.fraseLugar('banca')) E('GA-36-3: faltan frases de paradero o banca desde FRASES_CIUDAD');
        } finally { Save.d = bak; }
      }
      if (!EM.arte36 || EM.arte36.MAPA.zen.length !== 4 || Object.keys(EM.arte36.MAPA.subtramas).length !== 6 || Object.keys(EM.arte36.MAPA.skate).length !== 6) E('GA-36-4: mapa incompleto de G-110..G-112');
      else for (const k of Object.keys(EM.arte36.MAPA.subtramas)) if (!EM.arte36.escenaSubtrama(k)) E('GA-36-4: sin respaldo para subtrama ' + k);
    } catch (e) { E('3.7.0: ' + e.message); }
    const stats = `${NET.lines.length} líneas · ${NET.stations.length} estaciones · ${nC} tramos de metro · ${nB} rutas de bus · ${nV} recorridos 3D · ${nR} tableros de agujas · ${nK} puzles de cable · ${nT} capítulos en la ciudad · ${nA} piezas de arte · ${nPo} postales · ${nBa} barrios · ${nCa} calles con nombre · ${nVias} vías con curva · ${VC.PU ? VC.PU.length : 0} puentes · ${nEd} casas y edificios reales · ${VC.HT.length} piezas de arquitectura · ${LINE_META.trivia.length} preguntas · ${Object.keys(LINE_META.stationFacts).length} datos · ${Math.round(performance.now() - t0)} ms`;
    return { errors, warnings, stats };
  },
  monkey(n = 20, seed = 7) {
    const h0 = EM.headless; EM.headless = true;
    const rng = new RNG(seed), errors = [], modes = ['conduce', 'bus', 'libre', 'cableviaje', 'conduce', 'bus', 'despacho', 'alim', 'metroplus', 'cable', 'volante', 'carrera', 'tranvia'], cv = typeof document !== 'undefined' ? mkCanvas(360, 640) : null, g = cv ? cv.getContext('2d') : null;
    let games = 0, steps = 0, wins = 0;
    try {
    for (let k = 0; k < n; k++) {
      const id = modes[k % modes.length], M = EM.modes[id], lvs = M.levels().filter(l => !l.full); const lv = rng.pick(lvs);
      let st; try { st = M.create(lv.id, { seed: rng.i(1, 1e6), auto: true }); } catch (e) { errors.push(id + ' crear ' + lv.id + ': ' + e.message); continue; }
      games++; const dt = id === 'conduce' || id === 'tranvia' ? .1 : 1 / 20, max = id === 'conduce' || id === 'tranvia' ? 7000 : id === 'volante' ? 9000 : id === 'bus' ? 9000 : id === 'cableviaje' ? 6000 : id === 'libre' ? 2400 : id === 'carrera' ? 3000 : 4800;
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
    } finally { EM.headless = h0; }
    return { games, steps, wins, errors };
  },
  randomAct(id, st, rng) {
    if (id === 'despacho' || id === 'alim') return st.swl.length ? { k: 'sw', i: rng.pick(st.swl) } : null;
    if (id === 'metroplus') return { k: 'x', i: rng.i(0, st.X.length - 1) };
    if (id === 'cable') return { k: 'rot', i: rng.i(0, st.m.length - 1) };
    return null;
  }
};
