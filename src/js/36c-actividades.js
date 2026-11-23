/* =====================================================================
   ACTIVIDADES EN MUNDO ABIERTO, ZONAS SKATE/PARKOUR Y DIARIO RPG (v3.2.0)
   - Todos los 10 módulos cerrados se juegan desde Ciudad Libre con la misma experiencia
     y regresan al mismo lugar del valle al salir (opts.onExit).
   - 6 zonas físicas de Skate & Parkour en Medellín (3D con mallas del taller + 2D) donde
     puedes saltar y encadenar trucos en vivo o lanzar la Carrera en Ciclovía.
   - Sistema RPG ligero: 4 ramas de carrera (Tren, Bus, Cable, Ciclovía/Parkour), rangos
     y 6 subtramas con decisiones que dejan huella en tu reputación Cultura Metro.
   ===================================================================== */
(() => {
  const ZONAS_DEF = [
    { id: 'parques-rio', n: 'Parques del Río · Skate & Parkour', hub: 'Exposiciones', dx: -68, dy: 24, r: 30, cr: 'cr:A', desc: 'Plazoleta junto al río con rampas, barandas y corredor ciclovía.' },
    { id: 'ciudad-rio', n: 'Skatepark Ciudad del Río', hub: 'Industriales', dx: 52, dy: -22, r: 30, cr: 'cr:MP1', desc: 'Bowls urbanos, barandas de grind y conexión directa con Metroplús.' },
    { id: 'atanasio', n: 'Unidad Deportiva Atanasio', hub: 'Estadio', dx: -44, dy: -28, r: 32, cr: 'cr:B', desc: 'Circuito de ciclovía amplia, arcos de parkour y pista de patines.' },
    { id: 'pies-descalzos', n: 'Pies Descalzos · Parkour', hub: 'Cisneros', dx: -36, dy: 38, r: 28, cr: 'cr:MP2', desc: 'Terrazas y arcos bajos para saltos de precisión y skate urbano.' },
    { id: 'explora', n: 'Parque Explora y Carabobo', hub: 'Universidad', dx: 46, dy: -16, r: 30, cr: 'cr:A', desc: 'Paseo peatonal científico con rampas suaves y ciclorruta norte.' },
    { id: 'ayacucho', n: 'Corredor Cultural Ayacucho', hub: 'Bicentenario', dx: 34, dy: -20, r: 28, cr: 'cr:T', desc: 'Barandas y plazoletas del tranvía para trucos junto a los murales.' }
  ];

  const RUTAS = [
    { id: 'tren', ico: '🚆', n: 'Maquinista & Control', desc: 'Metro, Tranvía y Puesto de Control', modos: ['conduce', 'tranvia', 'despacho'] },
    { id: 'bus', ico: '🚌', n: 'Volante del Valle', desc: 'Metroplús, Alimentadores y Semáforos', modos: ['bus', 'volante', 'metroplus', 'alim'] },
    { id: 'cable', ico: '🚡', n: 'Guardián de la Loma', desc: 'Metrocables e ingeniería de pilonas', modos: ['cableviaje', 'cable'] },
    { id: 'ciclovia', ico: '🛹', n: 'Rider de Ciclovía & Parkour', desc: 'Ciclovías, skateparks y trucos urbanos', modos: ['carrera'] }
  ];

  const RANGOS = [
    [0, 'Aprendiz del Valle'],
    [120, 'Operador Cívico'],
    [320, 'Guía del Valle'],
    [650, 'Maestro Metro'],
    [1100, 'Leyenda Cultura Metro']
  ];

  const MODULOS = [
    { id: 'conduce', ico: '🚆', n: 'Conduce el Metro', desc: 'Cabina 1ª persona y panorámica de las Líneas A y B', hub: 'San Antonio' },
    { id: 'tranvia', ico: '🚋', n: 'Tranvía de Ayacucho', desc: 'Línea T con campana, peatones y pendientes reales', hub: 'San Antonio' },
    { id: 'cableviaje', ico: '🚡', n: 'Metrocable · Viaje', desc: 'Opera la cabina sobre la loma, viento y miradores', hub: 'Acevedo' },
    { id: 'bus', ico: '🚌', n: 'Buses (Cenital)', desc: 'Conduce Metroplús y Alimentadores por las calles', hub: 'Industriales' },
    { id: 'volante', ico: '🧭', n: 'Al Volante 3D', desc: 'Volante interactivo y cabina 3D en ruta real', hub: 'Hospital' },
    { id: 'carrera', ico: '🚴', n: 'Carrera en Ciclovías', desc: 'Ancho variable, giros, skateparks y parkour', hub: 'Exposiciones' },
    { id: 'despacho', ico: '🎛', n: 'Despacho · Control', desc: 'Agujas, señales y desvíos en tiempo real', hub: 'San Antonio' },
    { id: 'metroplus', ico: '🚦', n: 'Semáforos Traffix', desc: 'Cruces de Metroplús con turbo de flota', hub: 'Industriales' },
    { id: 'alim', ico: '🚐', n: 'Reparto Alimentador', desc: 'Lleva cada ruta alimentadora a su destino', hub: 'Niquía' },
    { id: 'cable', ico: '📐', n: 'Arma el Cable', desc: 'Puzle de ingeniería: traza torres sobre la ladera', hub: 'Santo Domingo Savio' }
  ];

  const SUBTRAMAS = [
    {
      id: 'pico-sa', ico: '🚉', lugar: 'San Antonio', titulo: 'Hora pico en San Antonio',
      txt: 'Son las 5:45 p. m. El andén de integración entre la Línea A y la Línea B se llena rápido y dos colegios acaban de salir hacia el sur.',
      opciones: [
        { k: 'expreso', t: 'Despachar tren de refuerzo corto hasta Poblado', res: 'Aliviaste el andén en 4 minutos. Los usuarios aplauden la puntualidad.', xp: ['tren', 45], rep: 20, pay: 45 },
        { k: 'anfitriones', t: 'Organizar filas con anfitriones de Cultura Metro', res: 'El abordaje fue ordenado y nadie bloqueó las puertas. Ejemplo cívico.', xp: ['tren', 35], rep: 30, pay: 35 },
        { k: 'integrado', t: 'Anunciar conexión directa con Tranvía y Metroplús', res: 'Repartiste la demanda por todo el corredor central sin saturar la vía.', xp: ['bus', 40], rep: 25, pay: 40 }
      ]
    },
    {
      id: 'ciclo-rio', ico: '🛹', lugar: 'Parques del Río', titulo: 'Convivencia en la Ciclovía del Río',
      txt: 'Ciclistas rápidos de EnCicla y jóvenes practicando skate en Parques del Río discuten porque se cruzan justo en el tramo estrecho.',
      opciones: [
        { k: 'zona', t: 'Demarcar la bahía lateral para skate y dejar 2 carriles libres', res: 'Ahora los ciclistas pasan fluidos y los skaters tienen rampa segura.', xp: ['ciclovia', 50], rep: 30, pay: 45 },
        { k: 'senales', t: 'Pintar flechas direccionales y campana de cortesía', res: 'Los giros ahora se avisan a tiempo y bajaron los sustos a cero.', xp: ['ciclovia', 40], rep: 25, pay: 35 }
      ]
    },
    {
      id: 'niebla-arvi', ico: '🌫', lugar: 'Santo Domingo · Arví', titulo: 'Niebla espesa sobre la loma',
      txt: 'Una nube baja cubre las pilonas de la Línea L rumbo a Arví con ráfagas de 38 km/h. Una familia pregunta si pueden subir ya.',
      opciones: [
        { k: 'lento', t: 'Bajar la línea a 3 m/s y monitorear el péndulo en cabina', res: 'Viaje sereno entre la niebla: la familia logró su foto del bosque.', xp: ['cable', 50], rep: 25, pay: 45 },
        { k: 'mirador', t: 'Pausar 10 minutos e invitarlos al mirador de Santo Domingo', res: 'Seguridad primero: conocieron la historia del barrio mientras escampaba.', xp: ['cable', 40], rep: 35, pay: 40 }
      ]
    },
    {
      id: 'guitarra-t', ico: '🎸', lugar: 'Corredor Ayacucho', titulo: 'Música en el paseo del Tranvía',
      txt: 'Una banda juvenil quiere tocar junto a la parada Bicentenario, pero el público empieza a invadir la losa por donde pasa la Línea T.',
      opciones: [
        { k: 'plazoleta', t: 'Mover el círculo 12 metros a la plazoleta lateral', res: 'El tranvía circula sin frenazos y la música alegra todo el corredor.', xp: ['tren', 40], rep: 30, pay: 40 },
        { k: 'campana', t: 'Acordar pausa musical cada vez que suene la campana del tranvía', res: 'Se volvió un ritual divertido del barrio y todos respetan la franja.', xp: ['ciclovia', 35], rep: 25, pay: 35 }
      ]
    },
    {
      id: 'cruce-ind', ico: '🚦', lugar: 'Industriales', titulo: 'Nudo vial en Industriales',
      txt: 'Llueve fuerte y un cruce de Metroplús Línea 1 acumula buses articulados mientras los carros particulares bloquean la intersección.',
      opciones: [
        { k: 'ola', t: 'Sincronizar ola verde Traffix para los articulados', res: 'Tres articulados cruzan en cadena y 400 personas llegan a tiempo.', xp: ['bus', 50], rep: 25, pay: 50 },
        { k: 'bici', t: 'Dar fase protegida a peatones y ciclistas bajo la lluvia', res: 'Nadie queda atrapado en el cruce y el tráfico retoma ritmo con calma.', xp: ['bus', 40], rep: 35, pay: 40 }
      ]
    },
    {
      id: 'bici-estadio', ico: '🚲', lugar: 'Unidad Deportiva Atanasio', titulo: 'Una EnCicla fuera del anclaje',
      txt: 'Al salir del skatepark encuentras una bici azul y verde de EnCicla apoyada contra una baranda, a 180 metros de la estación Estadio.',
      opciones: [
        { k: 'anclar', t: 'Llevarla hasta el anclaje y reportar estado al anfitrión', res: 'Santi te agradece: «Cuidar una bici es cuidar el viaje de cinco vecinos».', xp: ['ciclovia', 45], rep: 35, pay: 40 },
        { k: 'rodada', t: 'Avisar a Wilson y sumarte a una mini-rodada pedagógica', res: 'Diez nuevos usuarios aprenden a usar la Cívica en EnCicla hoy.', xp: ['ciclovia', 55], rep: 30, pay: 45 }
      ]
    }
  ];

  function rpgSave() {
    if (!Save.d.rpg) Save.d.rpg = { xp: { tren: 0, bus: 0, cable: 0, ciclovia: 0 }, rep: 0, subtramas: {}, trucos: 0, zonas: {} };
    if (!Save.d.rpg.xp) Save.d.rpg.xp = { tren: 0, bus: 0, cable: 0, ciclovia: 0 };
    if (!Save.d.rpg.subtramas) Save.d.rpg.subtramas = {};
    if (!Save.d.rpg.zonas) Save.d.rpg.zonas = {};
    return Save.d.rpg;
  }

  function rangoDe(xp) {
    let cur = RANGOS[0], next = RANGOS[1];
    for (let i = 0; i < RANGOS.length; i++) {
      if (xp >= RANGOS[i][0]) { cur = RANGOS[i]; next = RANGOS[i + 1] || null; }
    }
    const pct = next ? clamp((xp - cur[0]) / Math.max(1, next[0] - cur[0]), 0, 1) : 1;
    return { nombre: cur[1], xp, next: next ? next[0] : null, pct };
  }

  function resuelveZonas() {
    if (ACT._zonas && ACT._zonas.length) return ACT._zonas;
    ACT._zonas = ZONAS_DEF.map(z => {
      const h = (typeof NET !== 'undefined' && NET.stations) ? (NET.stations.find(s => s.name === z.hub) || NET.stations[0]) : { x: 0, y: 0 };
      const bx = h.x + z.dx, by = h.y + z.dy;
      const p = (typeof Libre !== 'undefined' && Libre.libre) ? Libre.libre(bx, by, v => v === TT.WALK || v === TT.PLAZA || v === TT.GRASS || v === TT.ROAD, 6) : { x: bx, y: by };
      return Object.assign({}, z, { x: p.x, y: p.y });
    });
    return ACT._zonas;
  }

  function lvPara(modeId, hub) {
    const M = EM.modes[modeId]; if (!M || !M.levels) return null;
    const L = M.levels(); if (!L || !L.length) return null;
    if (hub) {
      const n = hub.name.toLowerCase();
      if (modeId === 'conduce') {
        const isB = hub.lines && hub.lines.some(l => l.id === 'B');
        const hit = L.find(l => (isB ? l.line === 'B' : l.line === 'A') && (!l.name || l.name.toLowerCase().includes(n))) || L.find(l => l.line === (isB ? 'B' : 'A'));
        if (hit) return hit.id;
      }
      if (modeId === 'cableviaje') {
        const cl = hub.lines && hub.lines.find(l => l.kind === 'cable');
        if (cl) { const hit = L.find(l => l.line === cl.id); if (hit) return hit.id; }
      }
      if (modeId === 'bus' || modeId === 'volante') {
        const bl = hub.lines && hub.lines.find(l => l.kind === 'brt' || l.kind === 'feeder');
        if (bl) { const hit = L.find(l => l.line === bl.id); if (hit) return hit.id; }
      }
    }
    return L[0].id;
  }

  const ACT = EM.mundoRPG = {
    ZONAS: ZONAS_DEF,
    RUTAS,
    MODULOS,
    SUBTRAMAS,
    rangoDe,

    zonas() { return resuelveZonas(); },

    initLibre(st) {
      const Z = resuelveZonas();
      // parquea skate y scooter/bici en cada zona Skate/Parkour para probar al instante
      for (const z of Z) {
        st.parked.push({ kind: 'skate', x: z.x - 4, y: z.y + 3, a: 0, id: st.parked.length, ok: 1 });
        st.parked.push({ kind: 'scooter', x: z.x + 4, y: z.y + 3, a: Math.PI, id: st.parked.length, ok: 1 });
      }
    },

    enZona(st) {
      if (!st) return null;
      for (const z of resuelveZonas()) if (dist(st.x, st.y, z.x, z.y) <= z.r) return z;
      return null;
    },

    tick(st, dt) {
      if (!st || st.auto) return;
      const z = this.enZona(st);
      if (z && st._lastZona !== z.id) {
        st._lastZona = z.id;
        const R = rpgSave();
        if (!R.zonas[z.id]) {
          R.zonas[z.id] = 1; R.xp.ciclovia = (R.xp.ciclovia || 0) + 25; R.rep = (R.rep || 0) + 10; Save.d.wallet += 20; Save.write();
          Libre.msg(st, '🛹 Descubriste ' + z.n + ' (+25 XP · +20 🎫) · Toca ★ para trucos', 'g');
          Libre.sfx(st, 'star');
        } else {
          Libre.msg(st, '🛹 ' + z.n + ' · Toca ★ para trucos o lanza la Ciclovía', 'b');
        }
      } else if (!z) {
        st._lastZona = null;
      }
    },

    /* detecta actividades jugables a pocos metros del jugador */
    cerca(st) {
      const out = [];
      const z = this.enZona(st);
      if (z) {
        out.push({ ico: '🚴', lbl: 'Ciclovía', mode: 'carrera', lv: z.cr, hint: z.n });
        out.push({ ico: '★', lbl: 'Truco', fn: () => Libre.saltaTruco(st) });
      }
      const hub = Libre.nearHub(st, 55);
      if (hub && hub.lines) {
        if (hub.lines.some(l => l.kind === 'metro')) {
          out.push({ ico: '🚆', lbl: 'Conducir Metro', mode: 'conduce', lv: lvPara('conduce', hub) });
          if (['San Antonio', 'Bello', 'Acevedo', 'Niquía'].includes(hub.name)) {
            out.push({ ico: '🎛', lbl: 'Despacho', mode: 'despacho', lv: lvPara('despacho', hub) });
          }
        }
        if (hub.lines.some(l => l.kind === 'tram')) {
          out.push({ ico: '🚋', lbl: 'Tranvía T', mode: 'tranvia', lv: lvPara('tranvia', hub) });
        }
        if (hub.lines.some(l => l.kind === 'cable')) {
          out.push({ ico: '🚡', lbl: 'Operar Cable', mode: 'cableviaje', lv: lvPara('cableviaje', hub) });
          out.push({ ico: '📐', lbl: 'Puzle Cable', mode: 'cable', lv: lvPara('cable', hub) });
        }
        if (hub.lines.some(l => l.kind === 'brt' || l.kind === 'feeder')) {
          out.push({ ico: '🚌', lbl: 'Ruta Bus', mode: 'bus', lv: lvPara('bus', hub) });
          out.push({ ico: '🧭', lbl: 'Al Volante', mode: 'volante', lv: lvPara('volante', hub) });
          if (hub.lines.some(l => l.kind === 'brt')) out.push({ ico: '🚦', lbl: 'Semáforos', mode: 'metroplus', lv: lvPara('metroplus', hub) });
          else out.push({ ico: '🚐', lbl: 'Reparto', mode: 'alim', lv: lvPara('alim', hub) });
        }
      }
      return out.slice(0, 3);
    },

    /* barra contextual no intrusiva sobre los controles de Ciudad Libre */
    updBar(st) {
      if (EM.headless || Game.st !== st) return;
      const bar = $('#lbActBar'); if (!bar) return;
      if (st.mode === 'ride' || st.charla || (st.trama && st.trama.talk)) { bar.classList.add('hide'); return; }
      const acts = this.cerca(st);
      const sig = acts.map(a => a.lbl + (a.lv || '')).join('|');
      if (sig === st._actSig) return;
      st._actSig = sig;
      if (!acts.length) { bar.classList.add('hide'); bar.innerHTML = ''; return; }
      bar.classList.remove('hide');
      bar.innerHTML = acts.map((a, i) => `<button data-ai="${i}"><b>${a.ico}</b><span>${esc(a.lbl)}</span></button>`).join('');
      $$('button', bar).forEach(b => {
        b.onclick = () => {
          const a = acts[+b.dataset.ai]; if (!a) return;
          Snd.init(); Snd.play('tap');
          if (a.fn) a.fn(); else this.lanzar(st, a.mode, a.lv);
        };
      });
    },

    /* lanza CUALQUIER módulo cerrado desde Ciudad Libre y vuelve al mismo sitio al terminar o salir */
    lanzar(st, modeId, lvId) {
      if (!EM.modes[modeId]) return;
      if (st && Libre && Libre.persist) Libre.persist(st);
      UI.close();
      const lv = lvId || lvPara(modeId, st ? Libre.nearHub(st, 90) : null);
      Game.start(modeId, lv, {
        onExit: () => Game.start('libre', 'lb:ultimo', { back: 'cover' })
      });
    },

    /* otorga XP RPG y reputación al completar cualquier módulo */
    onGameEnd(modeId, st, res) {
      if (!res || EM.headless) return;
      const R = rpgSave();
      const track = RUTAS.find(r => r.modos.includes(modeId));
      const gain = Math.max(15, Math.min(120, Math.round((res.stars || 1) * 28 + (res.win ? 25 : 10))));
      if (track) {
        const before = rangoDe(R.xp[track.id] || 0).nombre;
        R.xp[track.id] = (R.xp[track.id] || 0) + gain;
        const after = rangoDe(R.xp[track.id]).nombre;
        if (after !== before && typeof UI !== 'undefined' && UI.toast) {
          UI.toast('⭐ ¡Subiste a ' + after + ' en ' + track.n + '!');
        }
      }
      R.rep = (R.rep || 0) + (res.win ? 12 : 4);
      Save.write();
    },

    /* dibujo 2D/Pixel de las 6 zonas físicas de Skate & Parkour en Ciudad Libre */
    draw2D(g, st, S, k, x0, y0, x1, y1) {
      for (const z of resuelveZonas()) {
        if (z.x < x0 - 40 || z.x > x1 + 40 || z.y < y0 - 40 || z.y > y1 + 40) continue;
        const q = S(z.x, z.y), r = Math.max(10, 14 * k);
        g.save();
        g.fillStyle = 'rgba(20, 44, 68, .72)'; g.beginPath(); g.arc(q.x, q.y, r + 2, 0, TAU); g.fill();
        g.fillStyle = '#d8d4c8'; g.beginPath(); g.arc(q.x, q.y, r, 0, TAU); g.fill();
        g.strokeStyle = '#0E6F76'; g.lineWidth = Math.max(2, 1.2 * k); g.stroke();
        // rampa, baranda amarilla y arco naranja en vista cenital 2D
        g.fillStyle = '#7e8c99'; g.fillRect(q.x - 6 * k, q.y - 4 * k, 4.5 * k, 3 * k);
        g.fillStyle = '#F6C538'; g.fillRect(q.x - 1.5 * k, q.y - 4 * k, .8 * k, 3 * k);
        g.fillStyle = '#F6C538'; g.fillRect(q.x + 1.5 * k, q.y - 1 * k, 5.5 * k, .8 * k);
        g.fillStyle = '#E38835'; g.fillRect(q.x - 4 * k, q.y + 3 * k, 5 * k, 1.1 * k);
        if (k > 1.2 && !st.far) {
          g.font = '700 ' + Math.round(clamp(k * 4, 10, 13)) + 'px Cuerpo, sans-serif';
          g.textAlign = 'center'; g.lineWidth = 3; g.strokeStyle = 'rgba(255,255,255,.92)';
          g.strokeText('🛹 ' + z.n, q.x, q.y - r - 4);
          g.fillStyle = '#0E6F76'; g.fillText('🛹 ' + z.n, q.x, q.y - r - 4);
          g.textAlign = 'left';
        }
        g.restore();
      }
    },

    /* dibujo 3D real de las 6 zonas físicas de Skate & Parkour sobre el MISMO mundo 3D */
    draw3D(G, st) {
      const E = (x, y) => MAP.elevM(x, y);
      const mesh = (k) => (EM.taller && EM.taller.malla && EM.taller.pista) ? EM.taller.malla('act:' + k, () => EM.taller.pista(k)) : null;
      const mRampa = mesh('rampa'), mBar = mesh('baranda'), mArco = mesh('arco');
      for (const z of resuelveZonas()) {
        if (Math.abs(z.x - st.x) > 220 || Math.abs(z.y - st.y) > 220) continue;
        const zz = E(z.x, z.y);
        // losa de concreto + bordes de color
        G.box(z.x, zz + .04, z.y, 0, 22, 18, .12, [.78, .76, .72]);
        G.box(z.x, zz + .10, z.y - 8.7, 0, 22, .45, .28, [.055, .435, .463]);
        G.box(z.x, zz + .10, z.y + 8.7, 0, 22, .45, .28, [.965, .773, .22]);
        // rampa de skate, baranda de grind y arco de parkour en 3D
        if (mRampa) EM.taller.mundo(mRampa, z.x - 5, zz + .14, z.y - 3, 0);
        else G.box(z.x - 5, zz + .14, z.y - 3, 0, 3.2, 1.8, .72, [.55, .6, .66]);
        if (mBar) EM.taller.mundo(mBar, z.x + 4.5, zz + .14, z.y - 1.5, Math.PI / 2);
        else G.box(z.x + 4.5, zz + .4, z.y - 1.5, 0, 3.8, .18, .55, [.965, .773, .22]);
        if (mArco) EM.taller.mundo(mArco, z.x - 1, zz + .14, z.y + 4.5, 0);
        else G.box(z.x - 1, zz + 1.1, z.y + 4.5, 0, .35, 2.2, .45, [.89, .53, .21]);
        // tótem luminoso de zona
        G.box(z.x + 9.5, zz + .1, z.y - 7.5, 0, .5, .5, 3.4, [.055, .435, .463]);
        G.box(z.x + 9.5, zz + 3.4, z.y - 7.5, st.t * 1.4, 1.0, 1.0, .6, [.965, .773, .22]);
      }
    },

    hud3D(g, st, P, rot, dpr) {
      for (const z of resuelveZonas()) {
        if (Math.abs(z.x - st.x) > 190 || Math.abs(z.y - st.y) > 190) continue;
        const q = P(z.x + 9.5, z.y - 7.5, MAP.elevM(z.x, z.y) + 4.8);
        if (q) rot('🛹 ' + z.n, q.x, q.y, '#0E6F76');
      }
    },

    /* modal unificado: Módulos & Skateparks · Diario RPG · Subtramas */
    abrir(st, tab = 'modos') {
      if (EM.headless) return;
      const R = rpgSave();
      const Z = resuelveZonas();
      const totalXp = Object.values(R.xp).reduce((a, b) => a + b, 0);
      const km = d => d < 1000 ? Math.round(d) + ' m' : (d / 1000).toFixed(1).replace('.', ',') + ' km';

      let body = '';
      if (tab === 'modos') {
        body = `<p class="m">Todos los módulos del juego están abiertos aquí mismo y regresan a tu ubicación en Ciudad Libre al salir.</p>
          <div class="pag">Los 10 módulos jugables</div>
          <div class="rpg-grid">${MODULOS.map(m => `<div class="rpg-card"><b>${m.ico} ${esc(m.n)}</b><small>${esc(m.desc)}</small><div class="row" style="margin-top:6px"><button class="btn pri sm" data-lm="${m.id}">▶ Jugar</button><button class="btn sm gh" data-irh="${esc(m.hub)}">📍 ${esc(m.hub)}</button></div></div>`).join('')}</div>
          <div class="pag" style="margin-top:10px">Zonas Skate & Parkour en Medellín (6)</div>
          <div class="col">${Z.map(z => `<div class="rpg-card"><b>🛹 ${esc(z.n)} ${R.zonas[z.id] ? '<span class="zona-pill">✓ Visitada</span>' : ''}</b><small>${esc(z.desc)} · a ${km(dist(st.x, st.y, z.x, z.y))}</small><div class="row" style="margin-top:6px"><button class="btn sm" data-irz="${z.id}">🚶 Ir allí</button><button class="btn pri sm" data-crz="${z.cr}">🚴 Ciclovía</button></div></div>`).join('')}</div>`;
      } else if (tab === 'rpg') {
        const hechas = Object.keys(R.subtramas || {}).length;
        const zonasVis = Object.keys(R.zonas || {}).length;
        body = `<div class="rpg-grid">
            <div class="rpg-card"><b>🌟 Cultura Metro</b><small>Reputación cívica: <b>${R.rep || 0}</b> pts · XP total: <b>${totalXp}</b></small></div>
            <div class="rpg-card"><b>🛹 Trucos & Zonas</b><small>Trucos: <b>${R.trucos || 0}</b> · Skateparks: <b>${zonasVis}/${Z.length}</b> · Subtramas: <b>${hechas}/${SUBTRAMAS.length}</b></small></div>
          </div>
          <div class="pag" style="margin-top:10px">Tus 4 ramas de carrera</div>
          <div class="col">${RUTAS.map(r => {
            const rg = rangoDe(R.xp[r.id] || 0);
            return `<div class="rpg-card"><b>${r.ico} ${esc(r.n)} · <span style="color:var(--lA)">${esc(rg.nombre)}</span></b><small>${esc(r.desc)} · ${rg.xp} XP${rg.next ? ' / ' + rg.next + ' XP' : ' (Rango máximo)'}</small><div class="rpg-bar"><i style="width:${Math.round(rg.pct * 100)}%"></i></div></div>`;
          }).join('')}</div>`;
      } else {
        body = `<p class="m">Historias vivas del Valle de Aburrá (inspiradas en la narrativa de decisiones de UnoCero). Cada decisión moldea tu camino cívico.</p>
          <div class="col">${SUBTRAMAS.map(s => {
            const ch = R.subtramas[s.id];
            return `<div class="rpg-card"><b>${s.ico} ${esc(s.titulo)} · <span class="zona-pill">${esc(s.lugar)}</span></b><small>${esc(s.txt)}</small>${ch ? `<div class="m" style="margin-top:6px;color:var(--lT);font-weight:700">✓ Decisión tomada: ${esc(ch)}</div>` : `<div class="col" style="margin-top:6px;gap:5px">${s.opciones.map((o, oi) => `<button class="btn sm" data-sub="${s.id}" data-oi="${oi}">${esc(o.t)}</button>`).join('')}</div>`}</div>`;
          }).join('')}</div>`;
      }

      UI.modal(`<div class="pag">Mundo Abierto · El Metro 3.4</div><h2>📋 Actividades y Diario RPG</h2>
        <div class="tg pftabs" id="actTabs">
          <button data-t="modos" class="${tab === 'modos' ? 'on' : ''}">🎯 Módulos y Zonas</button>
          <button data-t="rpg" class="${tab === 'rpg' ? 'on' : ''}">⭐ Diario RPG</button>
          <button data-t="sub" class="${tab === 'sub' ? 'on' : ''}">📖 Subtramas (${Object.keys(R.subtramas).length}/${SUBTRAMAS.length})</button>
        </div>
        <div style="margin-top:8px">${body}</div>
        <button class="btn pri sm" id="actOk" style="margin-top:10px">Volver al valle</button>`);

      $$('#actTabs button').forEach(b => b.onclick = () => this.abrir(st, b.dataset.t));
      $$('#mBody [data-lm]').forEach(b => b.onclick = () => this.lanzar(st, b.dataset.lm));
      $$('#mBody [data-crz]').forEach(b => b.onclick = () => this.lanzar(st, 'carrera', b.dataset.crz));
      $$('#mBody [data-irz]').forEach(b => b.onclick = () => {
        const z = Z.find(q => q.id === b.dataset.irz); if (!z) return;
        UI.close(); Libre.llevar(st, z.x, z.y, false); Libre.msg(st, '🛹 Estás en ' + z.n + ' · Toca ★ para saltar y hacer trucos', 'g');
      });
      $$('#mBody [data-irh]').forEach(b => b.onclick = () => {
        const h = Libre.hub(b.dataset.irh); if (!h) return;
        const t = Libre.salida(h); UI.close(); Libre.llevar(st, t.x, t.y, false); Libre.msg(st, '🚉 Estás en ' + h.name, 'b');
      });
      $$('#mBody [data-sub]').forEach(b => b.onclick = () => {
        const s = SUBTRAMAS.find(q => q.id === b.dataset.sub), o = s && s.opciones[+b.dataset.oi]; if (!o) return;
        R.subtramas[s.id] = o.t;
        R.xp[o.xp[0]] = (R.xp[o.xp[0]] || 0) + o.xp[1];
        R.rep = (R.rep || 0) + o.rep;
        Save.d.wallet += o.pay;
        Save.write();
        Snd.play('star');
        Libre.msg(st, s.ico + ' ' + o.res + ' (+' + o.pay + ' 🎫 · +' + o.xp[1] + ' XP)', 'g');
        this.abrir(st, 'sub');
      });
      $('#actOk').onclick = () => UI.close();
    }
  };
})();
