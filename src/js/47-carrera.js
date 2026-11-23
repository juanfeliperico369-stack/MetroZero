/* =====================================================================
   CARRERA SIN FIN (2.0.0) · la misión M4 del Plan único (docs/PLAN-UNICO-IA.md), con lo mejor de las dos entregas:
   de Gemini/Antigravity la elección de vehículo y los poderes (🧲 imán, ⚡ turbo, 🛡 escudo); de ChatGPT/Codex las mallas 3D
   de los vehículos y los obstáculos (EM.taller.vehiculo y EM.taller.pista) y el manubrio con las manos en primera persona.
   En patineta por la calle real que va junto a una línea del metro, del tranvía o del Metroplús: en 3D con el motor G3 y las
   casas y edificios reales (primera o tercera persona) y, si no hay WebGL, desde arriba. Tres carriles, saltos, obstáculos de
   Medellín (huecos, conos, motos, perros, chazas y charcos), pasajes 🎫 y, en cada estación, su dato. El ritmo acelera.
   Cuando lleguen el motor de carrera de Run Scooter y su arte (Gemini y ChatGPT), se cambian la pista, los obstáculos y el
   dibujo; el contrato de modos (create, step, draw, levels, result, ai, act) se queda igual para que el bot lo siga jugando.
   ===================================================================== */
/* los vehículos de la carrera son los mismos de Ciudad Libre (VEH); spd: tope (m/s), sal: impulso del salto (m/s), mesh: pieza del taller */
const CR_VEH = [
  { id: 'skate', ico: '🛹', spd: 21, sal: 8.6, mesh: 'skate', pie: .16, truco: ['Ollie', 'Kickflip', '360 Flip', 'Heelflip'] },
  { id: 'patines', ico: '🛼', spd: 21.5, sal: 8.4, mesh: 'patines', pie: .2, truco: ['Giro 360', 'Salto águila', 'Grab lateral', 'Doble giro'] },
  { id: 'monopatin', ico: '🛴', spd: 22, sal: 8.1, mesh: 'scooter', pie: .16, truco: ['Tailwhip', 'Barspin', 'No-hander', 'Hop alto'] },
  { id: 'scooter', ico: '⚡', spd: 24, sal: 7.8, mesh: 'electrico', pie: .24, truco: ['Manual ⚡', 'Salto limpio', 'Giro ágil', 'Impulso'] },
  { id: 'bici', ico: '🚲', spd: 23, sal: 7.6, mesh: 'bici', pie: .55, truco: ['Bunny Hop', 'Caballito', 'Tabletop', 'Barspin BMX'] }
];
const CR_POD = { iman: ['🧲', 'Imán: los pasajes de los otros carriles llegan solos', 8, [.86, .2, .2]], turbo: ['⚡', 'Turbo: más rápido y atraviesas obstáculos', 5, [.98, .8, .15]], escudo: ['🛡', 'Escudo: el próximo golpe no cuenta', 0, [.25, .55, .95]] };
/* relevo Z1: los obstáculos están ordenados por s; solo se recorre la ventana [s0, s1] con un cursor */
const crVentana = (st, s0, s1) => { const O = st.obs; let i = st._ci || 0; while (i > 0 && O[i - 1].s >= s0) i--; while (i < O.length && O[i].s < s0) i++; st._ci = i; const R = []; for (let j = i; j < O.length && O[j].s <= s1; j++) R.push(O[j]); return R; };
/* [largo (m), alto (m), color, clase: 0=piso(saltar), 1=esquivar, 2=rampa(salto+truco), 3=baranda(grind+truco), 4=arco(agacharse/parkour)] */
const CR_OBS = {
  hueco: [1.6, .05, '#2f2f33', 0], charco: [2.2, .04, '#5aa0c8', 0], cono: [.5, .8, '#f08a2b', 1], perro: [.9, .7, '#8a5a2b', 1],
  moto: [2, 1.3, '#c0392b', 1], chaza: [1.6, 1.4, '#2ec4b6', 1],
  rampa: [3.2, .72, '#F6C538', 2], baranda: [3.8, .58, '#F6C538', 3], arco: [.6, 1.9, '#1C5C9C', 4]
};
const Carrera = EM.modes.carrera = {
  id: 'carrera', name: 'Ciclovías · Carrera sin fin', sub: 'Skate, patines, bici y parkour por las ciclovías de Medellín', music: 'conduce', fullCanvas: true, substeps: true,
  tip: 'Solo por ciclovías reales: ◀ ▶ cambia de carril o toma giros (↰/↱), ▲ salta y hace TRUCOS en el aire o sobre rampas y barandas, ▼ desliza / hace parkour bajo los arcos. Las calles cambian de amplias (3 carriles) a estrechas (2 carriles).',
  LINEAS: [
    ['A', 'Ciclovía del Río · Parques del Río', 'Corredor ciclovía paralelo al río y Línea A · plazas skate'],
    ['B', 'Ciclovía Estadio · La 70 y San Javier', 'Unidad Deportiva Atanasio Girardot · parkour y rampas'],
    ['T', 'Ciclovía Ayacucho · Tranvía y Plazas', 'Corredor peatonal y ciclovía de Ayacucho · tramos estrechos'],
    ['MP1', 'Ciclovía Calle 30 · Ciudad del Río', 'Skatepark Ciudad del Río y corredor verde Belén–Aranjuez'],
    ['MP2', 'Ciclovía Av. Oriental · Pies Descalzos', 'Ciclovía céntrica con giros rápidos y barandas'],
    ['MPO', 'Ciclovía Av. 80 · Caribe a La Palma', 'Corredor occidental de ciclovía con tramos rápidos']
  ],
  levels() { return this.LINEAS.filter(([id]) => NET.byId[id]).map(([id, n, sub]) => ({ id: 'cr:' + id, name: n, sub: sub || 'Ciclovía de Medellín · skate y parkour' })); },
  V(st) { return CR_VEH[st.vi | 0] || CR_VEH[0]; },
  /* ancho del corredor en s: 3 carriles (avenida / zona skate) o 2 carriles (calle estrecha) */
  tramoEn(st, s) {
    if (!st.tramos || !st.tramos.length) return { ancho: 3, zona: 'avenida' };
    for (let i = st.tramos.length - 1; i >= 0; i--) if (s >= st.tramos[i].s) return st.tramos[i];
    return st.tramos[0];
  },
  create(lv, opts = {}) {
    const id = String(lv || 'cr:A').slice(3), l = NET.byId[id] || NET.byId.A, rng = new RNG((opts.seed | 0) + 17), obs = [];
    // tramos variables: siempre empieza en avenida amplia (3 carriles) y alterna con calles estrechas (2 carriles) y zonas skate/parkour
    const tramos = [{ s: 0, ancho: 3, zona: 'avenida' }];
    const zonas = ['avenida', 'estrecha', 'skatepark', 'estrecha', 'parkour'];
    for (let s = 180, zi = 1; s < l.P.len - 60; s += 160 + rng.i(0, 110), zi++) {
      const z = zonas[zi % zonas.length];
      tramos.push({ s, ancho: z === 'estrecha' ? 2 : 3, zona: z });
    }
    // giros direccionales en las curvas reales o cruces de ciclovía
    const giros = [];
    for (let s = 210; s < l.P.len - 90; s += 230 + rng.i(0, 110)) {
      const a0 = NET.at(l.P, s - 25).a, a1 = NET.at(l.P, Math.min(l.P.len, s + 25)).a;
      let da = Math.atan2(Math.sin(a1 - a0), Math.cos(a1 - a0));
      const dir = Math.abs(da) > .1 ? (da > 0 ? 1 : -1) : (rng.f() < .5 ? -1 : 1);
      giros.push({ s, dir, visto: false, hecho: false });
    }
    const baseTipos = ['hueco', 'charco', 'cono', 'perro', 'moto', 'chaza', 'arco'], skateTipos = ['rampa', 'baranda', 'arco', 'cono'], pods = Object.keys(CR_POD);
    const anchoDe = s => { for (let i = tramos.length - 1; i >= 0; i--) if (s >= tramos[i].s) return tramos[i]; return tramos[0]; };
    for (let s = 70; s < l.P.len - 30; s += 10 + rng.f() * 14) {
      const tr = anchoDe(s), maxC = tr.ancho - 1, c = rng.i(0, maxC), r = rng.f();
      if (tr.zona === 'skatepark' || tr.zona === 'parkour') {
        if (r < .48) obs.push({ s, c, k: rng.pick(skateTipos) });
        else if (r < .92) obs.push({ s, c, k: 'pasaje' });
        else obs.push({ s, c, k: rng.pick(pods) });
      } else {
        if (r < .54) obs.push({ s, c, k: r < .12 ? rng.pick(['rampa', 'baranda', 'arco']) : rng.pick(baseTipos) });
        else if (r < .94) obs.push({ s, c, k: 'pasaje' });
        else obs.push({ s, c, k: rng.pick(pods) });
      }
    }
    return {
      lvId: lv, line: l.id, off: l.kind === 'metro' ? 14 : 3.5, s: 30, v: 11.8, c: 1, cx: 1, y: 0, vy: 0, t: 0, obs, tramos, giros,
      ancho: 3, zona: 'avenida', duck: 0, grind: 0, jumpBuf: 0, airTrick: 0, trickSpin: 0, combo: 0, comboT: 0, trucos: 0, girosOk: 0,
      pts: 0, pasajes: 0, vidas: 3, inv: 0, done: false, primera: false, est: -1, dato: '', datoT: 0, auto: !!opts.auto,
      vi: clamp(Save.d.settings.vehCr | 0, 0, CR_VEH.length - 1), iman: 0, turbo: 0, escudo: 0, poderes: 0, _oc: {}
    };
  },
  /* desplazamiento lateral libre de edificios para que la ciclovía nunca atraviese casas (hallazgo compartido con Claude) */
  offAt(st, s) {
    const k = Math.round(s / 18), C = st._oc || (st._oc = {});
    if (C[k] != null) return C[k];
    const l = NET.byId[st.line], base = st.off;
    if (typeof VC === 'undefined' || !VC.on) return (C[k] = base);
    const libre = o => { for (const d of [-2.4, 0, 2.4]) { const q = NET.at(l.P, clamp(k * 18, 0, l.P.len), o + d); if (VC.solid(q.x, q.y, .5)) return false; } return true; };
    if (libre(base)) return (C[k] = base);
    for (const o of [-base, base + 6, -base - 6, 0, base - 5, -base + 5]) if (libre(o)) return (C[k] = o);
    return (C[k] = base);
  },
  /* punto del carril c (centrado según ancho 2 o 3 carriles) a s metros del comienzo */
  pos(st, s, c) {
    const l = NET.byId[st.line], tr = this.tramoEn(st, s), sep = tr.ancho === 2 ? 2.3 : 2.6, cen = (tr.ancho - 1) / 2;
    const o0 = this.offAt(st, Math.floor(s / 18) * 18), o1 = this.offAt(st, Math.ceil(s / 18) * 18), t = (s / 18) - Math.floor(s / 18);
    return NET.at(l.P, clamp(s, 0, l.P.len), lerp(o0, o1, t) + (c - cen) * sep);
  },
  step(st, dt) {
    if (st.done) return;
    const l = NET.byId[st.line], V = this.V(st), top = V.spd * (st.turbo > 0 ? 1.32 : st.grind > 0 ? 1.12 : 1);
    st.t += dt;
    // tramo actual (ancho variable y zonas skate/parkour)
    const tr = this.tramoEn(st, st.s);
    if (tr.zona !== st.zona || tr.ancho !== st.ancho) {
      st.zona = tr.zona; st.ancho = tr.ancho;
      if (st.c >= tr.ancho) st.c = tr.ancho - 1;
      const lbl = tr.zona === 'estrecha' ? '↔ Ciclovía estrecha (2 carriles)' : tr.zona === 'skatepark' ? '🛹 Zona Skatepark · rampas y barandas' : tr.zona === 'parkour' ? '🏃 Zona Parkour · arcos y saltos' : '🚴 Ciclovía amplia (3 carriles)';
      st.dato = lbl; st.datoT = 3.2;
    }
    st.v = st.v > top ? Math.max(top, st.v - dt * 3.5) : Math.min(top, st.v + dt * (st.turbo > 0 ? 5.5 : .85));
    const sPrev = st.s;
    st.s += st.v * dt; st.cx += (st.c - st.cx) * Math.min(1, dt * 13);
    if (st.inv > 0) st.inv = Math.max(0, st.inv - dt);
    if (st.iman > 0) st.iman = Math.max(0, st.iman - dt);
    if (st.turbo > 0) st.turbo = Math.max(0, st.turbo - dt);
    if (st.duck > 0) st.duck = Math.max(0, st.duck - dt);
    if (st.jumpBuf > 0) st.jumpBuf = Math.max(0, st.jumpBuf - dt);
    if (st.trickSpin > 0) st.trickSpin = Math.max(0, st.trickSpin - dt * 2.4);
    if (st.comboT > 0) { st.comboT -= dt; if (st.comboT <= 0) st.combo = 0; }
    // física de salto, grind sobre baranda y buffer de salto
    if (st.grind > 0) {
      st.grind = Math.max(0, st.grind - dt); st.y = .62; st.vy = 0; st.pts += 35 * Math.max(1, st.combo) * dt;
      if (st.grind === 0) { st.vy = 3.2; }
    } else if (st.y > 0 || st.vy > 0) {
      st.vy -= 23 * dt; st.y = Math.max(0, st.y + st.vy * dt);
      if (st.y === 0) { st.vy = 0; st.airTrick = 0; }
    }
    if (st.y === 0 && st.jumpBuf > 0 && st.grind <= 0) { st.vy = V.sal; st.jumpBuf = 0; st.duck = 0; }
    // giros direccionales en la ciclovía
    for (const g of st.giros || []) {
      if (g.hecho) continue;
      const d = g.s - st.s;
      if (!g.visto && d < 75 && d > 0) { g.visto = true; st.dato = (g.dir < 0 ? '↰ Giro a la IZQUIERDA en ' : '↱ Giro a la DERECHA en ') + Math.round(d) + ' m'; st.datoT = 2.6; }
      if (d < -14) { g.hecho = true; }
    }
    // obstáculos, rampas, barandas, arcos, pasajes y poderes (colisión continua a lo largo del desplazamiento [sPrev, st.s])
    for (const o of crVentana(st, sPrev - 1.5, st.s + 7)) {
      if (o.hecho || o.s < sPrev - 1.5 || o.s > st.s + (st.iman > 0 && o.k === 'pasaje' ? 7 : 1.5)) continue;
      const dc = Math.abs(o.c - st.cx);
      // bono near-miss al pasar rozando un obstáculo sólido
      if (!o.casi && CR_OBS[o.k] && CR_OBS[o.k][3] === 1 && o.s >= sPrev - .9 && o.s <= st.s + .9 && dc > .55 && dc < 1.15 && st.y < .4) {
        o.casi = 1; st.pts += 20; st.comboT = Math.max(st.comboT, 3);
      }
      if (dc > (st.iman > 0 && o.k === 'pasaje' ? 2.5 : .52)) continue;
      if (o.k === 'pasaje') { o.hecho = 1; st.pasajes++; st.pts += 10 * Math.max(1, st.combo || 1); continue; }
      if (CR_POD[o.k]) { o.hecho = 1; st.poderes++; st.pts += 15; const P = CR_POD[o.k]; if (o.k === 'escudo') st.escudo = 1; else st[o.k] = P[2]; st.dato = P[0] + ' ' + P[1]; st.datoT = 3; continue; }
      const T = CR_OBS[o.k]; if (!T) continue;
      if (T[3] === 2) { // rampa de skate: lanza alto + permite truco
        o.hecho = 1; st.vy = Math.max(st.vy, V.sal * 1.42); st.y = Math.max(st.y, .3); st.duck = 0; st.airTrick = 0;
        st.combo = Math.min(5, (st.combo || 0) + 1); st.comboT = 4.5; st.pts += 40 * st.combo;
        st.dato = '🛹 ¡Rampa! Toca ▲ para TRUCOS en el aire (×' + st.combo + ')'; st.datoT = 2.4;
        if (!EM.headless && Game.st === st) Snd.play('whoosh');
        continue;
      }
      if (T[3] === 3) { // baranda de skate: grind con chispas
        o.hecho = 1; st.grind = .85; st.y = .62; st.vy = 0; st.duck = 0;
        st.combo = Math.min(5, (st.combo || 0) + 1); st.comboT = 4.5; st.trucos++; st.pts += 55 * st.combo;
        st.dato = '✨ ¡Grind en baranda! ×' + st.combo + ' · +' + (55 * st.combo); st.datoT = 2.4;
        if (!EM.headless && Game.st === st) Snd.play('star');
        if (Save.d && Save.d.rpg) Save.d.rpg.trucos = (Save.d.rpg.trucos || 0) + 1;
        continue;
      }
      if (T[3] === 4) { // arco de parkour: se pasa agachado (▼) o muy alto sobre él
        if (st.duck > 0 || st.y > 1.75) {
          o.hecho = 1; st.combo = Math.min(5, (st.combo || 0) + 1); st.comboT = 4.5; st.trucos++; st.pts += 45 * st.combo;
          st.dato = '🏃 ¡Parkour bajo el arco! ×' + st.combo + ' · +' + (45 * st.combo); st.datoT = 2.2;
          if (!EM.headless && Game.st === st) Snd.play('ok');
          continue;
        }
      }
      if (st.y > Math.max(.3, T[1]) || st.inv > 0) continue;
      o.hecho = 1; if (st.turbo > 0) { st.pts += 10; continue; }
      if (st.escudo) { st.escudo = 0; st.inv = 1; st.dato = '🛡 El escudo aguantó el golpe'; st.datoT = 2.5; continue; }
      st.vidas--; st.inv = 1.4; st.combo = 0; st.v = Math.max(8, st.v * .72); if (st.vidas <= 0) st.done = true;
    }
    for (const e of l.st) { if (e.i <= st.est || e.s > st.s) continue; st.est = e.i; st.pts += 25; const f = NET.fact ? NET.fact(e.name) : ''; st.dato = '🚉 ' + e.name + (f ? ' · ' + f : ''); st.datoT = 5.5; }
    if (st.datoT > 0) st.datoT -= dt;
    st.pts += st.v * dt * .5;
    if (st.s >= l.P.len - 10) st.done = true;
    if (st.auto) { const a = this.ai(st); if (a) this.act(st, a); }
    this.updBtn(st);
  },
  updBtn(st) {
    if (EM.headless || Game.st !== st) return;
    const b = $('#crSa'); if (!b) return;
    const air = (st.y > .35 || st.grind > 0) && st.airTrick < 2;
    b.classList.toggle('cr-trick', air);
    b.innerHTML = air ? '★<small>truco</small>' : '▲<small>saltar</small>';
  },
  /* bot: salta lo bajo, se agacha en arcos, hace trucos en el aire y toma giros */
  ai(st) {
    if (st.t > 4 && !st._bv) { st._bv = 1; return 'vehiculo'; }
    if (st.y > .55 && st.airTrick === 0) return 'truco';
    const g = (st.giros || []).find(q => !q.hecho && q.s - st.s < 20 && q.s - st.s > -4);
    if (g) return g.dir < 0 ? 'izq' : 'der';
    const o = st.obs.find(q => !q.hecho && CR_OBS[q.k] && q.s > st.s && q.s < st.s + 10 && q.c === st.c);
    if (!o || st.turbo > 0) return null;
    const T = CR_OBS[o.k];
    if (T[3] === 2 || T[3] === 3) return null; // aprovechar rampas y barandas
    if (T[3] === 4) return 'agacha';
    if (T[3] === 0 || T[1] < .9) return 'salta';
    const carriles = st.ancho === 2 ? [0, 1] : [0, 1, 2];
    const libre = carriles.filter(c => !st.obs.some(q => !q.hecho && CR_OBS[q.k] && CR_OBS[q.k][3] === 1 && q.c === c && q.s > st.s && q.s < st.s + 12));
    return libre.length ? (libre[0] < st.c ? 'izq' : 'der') : 'salta';
  },
  doGiro(st, dir) {
    const g = (st.giros || []).find(q => !q.hecho && q.s - st.s < 32 && q.s - st.s > -12 && q.dir === dir);
    if (!g) return false;
    g.hecho = true; st.girosOk++; st.combo = Math.min(5, (st.combo || 0) + 1); st.comboT = 4.5;
    st.pts += 50 * st.combo; st.v = Math.min(this.V(st).spd * 1.25, st.v + 2.6);
    st.dato = (dir < 0 ? '↰' : '↱') + ' ¡Giro perfecto! ×' + st.combo + ' · +' + (50 * st.combo); st.datoT = 2.2;
    if (!EM.headless && Game.st === st) Snd.play('coin');
    return true;
  },
  act(st, a) {
    const maxC = (st.ancho || 3) - 1, V = this.V(st);
    if (a === 'izq') { this.doGiro(st, -1); st.c = Math.max(0, st.c - 1); }
    else if (a === 'der') { this.doGiro(st, 1); st.c = Math.min(maxC, st.c + 1); }
    else if (a === 'salta') {
      if (st.y > .35 || st.grind > 0) { this.act(st, 'truco'); return; }
      if (st.y === 0) { st.vy = V.sal; st.duck = 0; }
      else st.jumpBuf = .14;
    } else if (a === 'truco') {
      if ((st.y > .25 || st.grind > 0) && st.airTrick < 2) {
        st.airTrick++; st.trucos++; st.trickSpin = 1; st.combo = Math.min(5, (st.combo || 0) + 1); st.comboT = 4.5;
        const nom = V.truco[(st.trucos - 1) % V.truco.length], pts = 60 * st.combo; st.pts += pts;
        st.dato = '★ ' + nom + ' ×' + st.combo + ' · +' + pts; st.datoT = 2.2;
        if (!EM.headless && Game.st === st) { Snd.play('star'); vib(18); }
        if (Save.d && Save.d.rpg) Save.d.rpg.trucos = (Save.d.rpg.trucos || 0) + 1;
      }
    } else if (a === 'agacha') {
      if (st.y > .1) { st.vy = -16; st.grind = 0; } // aterrizaje rápido
      st.duck = .75;
      if (!EM.headless && Game.st === st) Snd.play('tap');
    } else if (a === 'vista') st.primera = !st.primera;
    else if (a === 'vehiculo') { st.vi = (st.vi + 1) % CR_VEH.length; const V2 = this.V(st); if (!st.auto) { Save.d.settings.vehCr = st.vi; Save.write(); } st.dato = V2.ico + ' ' + ((VEH[V2.id] || {}).n || V2.id); st.datoT = 2.5; const b = $('#crVe'); if (b) b.textContent = V2.ico; }
  },
  key(st, k, down) { if (!down) return; const m = { ArrowLeft: 'izq', a: 'izq', ArrowRight: 'der', d: 'der', ArrowUp: 'salta', w: 'salta', ' ': 'salta', ArrowDown: 'agacha', s: 'agacha', t: 'truco', v: 'vista', c: 'vehiculo' }[k]; if (m) this.act(st, m); },
  mount(st, el) {
    el.innerHTML = `<div class="crbtns"><button id="crIz" aria-label="Carril a la izquierda">◀<small>izq</small></button><button id="crSa" class="cr-jump" aria-label="Saltar o truco">▲<small>saltar</small></button><button id="crAg" class="cr-duck" aria-label="Deslizar parkour">▼<small>parkour</small></button><button id="crDe" aria-label="Carril a la derecha">▶<small>der</small></button></div>
      <div class="vsel"><button id="crVe" title="Cambiar de vehículo">${this.V(st).ico}</button><button id="crVi" title="Primera o tercera persona">👁</button></div>`;
    $('#crIz').onclick = () => this.act(st, 'izq'); $('#crDe').onclick = () => this.act(st, 'der'); $('#crSa').onclick = () => this.act(st, 'salta'); $('#crAg').onclick = () => this.act(st, 'agacha'); $('#crVi').onclick = () => this.act(st, 'vista'); $('#crVe').onclick = () => this.act(st, 'vehiculo');
    const cv = $('#gcv'); let p0 = null; this.unmount();   // deslizar: lados cambian carril, arriba salta/truco, abajo desliza parkour
    this._pd = e => { p0 = { x: e.clientX, y: e.clientY }; };
    this._pu = e => { if (!p0) return; const dx = e.clientX - p0.x, dy = e.clientY - p0.y; p0 = null; if (Math.abs(dx) > 28 && Math.abs(dx) > Math.abs(dy)) this.act(st, dx < 0 ? 'izq' : 'der'); else if (dy < -28) this.act(st, 'salta'); else if (dy > 28) this.act(st, 'agacha'); };
    this._pc = () => { p0 = null; };
    cv.addEventListener('pointerdown', this._pd); cv.addEventListener('pointerup', this._pu); cv.addEventListener('pointercancel', this._pc);
  },
  unmount() { const cv = $('#gcv'); if (cv && this._pd) { cv.removeEventListener('pointerdown', this._pd); cv.removeEventListener('pointerup', this._pu); cv.removeEventListener('pointercancel', this._pc); this._pd = null; } },
  gl(st) { return !st.auto && !EM.headless && Save.d.settings.q !== 'low' && typeof G3 !== 'undefined' && G3.init(); },
  draw(g, st, vp) {
    const W = vp.w, H = vp.h, p = this.pos(st, st.s, st.cx), z = MAP.elevM(p.x, p.y) + st.y;
    if (this.gl(st)) {
      G3.show(true); const c = Math.cos(p.a), s = Math.sin(p.a), eyeH = st.duck > 0 ? .85 : 1.55;
      const cam = st.primera ? { eye: [p.x + c * .3, z + eyeH, p.y + s * .3], at: [p.x + c * 22, z + (st.duck > 0 ? .7 : 1.2), p.y + s * 22], fov: 1.2 } : { eye: [p.x - c * 6.8, z + 3.4, p.y - s * 6.8], at: [p.x + c * 9, z + 1.0, p.y + s * 9], fov: 1.05 };
      G3.draw(cam, { hour: Mundo.hour(), rain: Mundo.weather().rain, escala: .82, suave: true, cerca: 1.5, dyn: G => this.dyn3D(G, st, p, z) });
      if (st.primera && EM.taller) EM.taller.primera(g, this.V(st).mesh, W, H, (st.cx - st.c) * .22 + (st.y > 0 ? -.04 : 0));
    } else {
      if (typeof G3 !== 'undefined' && G3.cv) G3.show(false); const k = 4 * (W / Math.max(1, ($('#gcv') || { clientWidth: W }).clientWidth || W)), mx = p.x, my = p.y, S = (x, y) => ({ x: W / 2 + (x - mx) * k, y: H * .62 + (y - my) * k });
      g.fillStyle = '#3a6b45'; g.fillRect(0, 0, W, H); if (MAP.ready) MAP.drawTop(g, W, H, mx, my - (H * .12) / k, k);
      // franja verde de la ciclovía en 2D
      const l = NET.byId[st.line]; g.strokeStyle = 'rgba(89,171,66,.55)'; g.lineWidth = (st.ancho === 2 ? 5.2 : 8.2) * k; g.beginPath();
      for (let s = Math.max(0, st.s - 10); s <= Math.min(l.P.len, st.s + 80); s += 6) { const q = S(NET.at(l.P, s, st.off).x, NET.at(l.P, s, st.off).y); s <= Math.max(0, st.s - 10) ? g.moveTo(q.x, q.y) : g.lineTo(q.x, q.y); } g.stroke();
      for (const o of crVentana(st, st.s - 8, st.s + 70)) { if (o.hecho || o.s < st.s - 8 || o.s > st.s + 70) continue; const q = S(this.pos(st, o.s, o.c).x, this.pos(st, o.s, o.c).y), P = CR_POD[o.k]; g.fillStyle = o.k === 'pasaje' ? PAL.mostaza : P ? 'rgb(' + P[3].map(v => v * 255 | 0) + ')' : CR_OBS[o.k][2]; g.beginPath(); g.arc(q.x, q.y, (o.k === 'pasaje' ? .5 : .85) * k, 0, TAU); g.fill(); }
      const q = S(p.x, p.y); g.fillStyle = st.duck > 0 ? '#5aa0c8' : '#ffb21e'; g.strokeStyle = PAL.negro; g.lineWidth = 2; g.beginPath(); g.arc(q.x, q.y, (1 + st.y * .3) * k, 0, TAU); g.fill(); g.stroke();
    }
    this.marcador(g, st, W, H);
  },
  malla(clave, hacer) { const T = EM.taller; return T && T.malla ? T.malla(clave, () => hacer(T)) : null; },
  dyn3D(G, st, p, z) {
    const T = EM.taller, l = NET.byId[st.line];
    // pintura de ciclovía (verde/azul con bordes blancos y bolardos según ancho 2 o 3 carriles)
    for (let s = Math.floor(st.s / 6) * 6; s < Math.min(l.P.len, st.s + 88); s += 6) {
      const tr = this.tramoEn(st, s), q = NET.at(l.P, s, st.off), zq = MAP.elevM(q.x, q.y) + .04, w = tr.ancho === 2 ? 5.2 : 8.2;
      const col = tr.zona === 'skatepark' ? [.28, .48, .58] : tr.zona === 'parkour' ? [.35, .44, .62] : [.22, .56, .34];
      G.box(q.x, zq, q.y, q.a, 5.8, w, .04, col);
      const sx = -Math.sin(q.a) * (w / 2 + .2), sy = Math.cos(q.a) * (w / 2 + .2);
      G.box(q.x + sx, zq, q.y + sy, q.a, .3, .3, .55, [.95, .8, .22]);
      G.box(q.x - sx, zq, q.y - sy, q.a, .3, .3, .55, [.95, .8, .22]);
    }
    // flecha 3D en pista para giros próximos
    for (const gr of st.giros || []) {
      if (gr.hecho || gr.s < st.s - 2 || gr.s > st.s + 75) continue;
      const q = NET.at(l.P, gr.s, st.off + gr.dir * 2.2), zq = MAP.elevM(q.x, q.y);
      G.box(q.x, zq + 1.4 + Math.sin(st.t * 6) * .2, q.y, q.a + gr.dir * .6, 1.4, .35, .8, [.98, .78, .2]);
    }
    for (const o of crVentana(st, st.s - 3, st.s + 90)) {
      if (o.hecho || o.s < st.s - 3 || o.s > st.s + 90) continue;
      const q = this.pos(st, o.s, o.c), zq = MAP.elevM(q.x, q.y), P = CR_POD[o.k];
      if (P) { G.box(q.x, zq + .9 + Math.sin(st.t * 3 + o.s) * .15, q.y, st.t * 2.5, .55, .55, .55, P[3]); continue; }
      const m = this.malla('o:' + o.k, T => T.pista(o.k));
      if (m) { T.mundo(m, q.x, zq + (o.k === 'pasaje' ? .45 + Math.sin(st.t * 3 + o.s) * .15 : 0), q.y, o.k === 'pasaje' ? st.t * 2 : q.a + (o.k === 'moto' || o.k === 'perro' ? Math.PI : 0)); continue; }
      if (o.k === 'pasaje') { G.box(q.x, zq + 1 + Math.sin(st.t * 3 + o.s) * .15, q.y, st.t * 2, .5, .08, .35, [.98, .78, .2]); continue; }
      const C = CR_OBS[o.k]; G.box(q.x, zq, q.y, q.a, C[0], o.k === 'moto' ? .7 : 1.1, Math.max(.06, C[1]), rgb(C[2]));
    }
    if (st.primera || (st.inv > 0 && Math.floor(st.t * 10) % 2)) return;
    const V = this.V(st), spinA = p.a + (st.trickSpin > 0 ? st.trickSpin * TAU : 0), m = this.malla('v:' + V.mesh, T => T.vehiculo(V.mesh, { persona: false }));
    if (m) T.mundo(m, p.x, z, p.y, spinA); else G.box(p.x, z + .08, p.y, spinA, 1.1, .5, .12, rgb('#2ec4b6'));
    Libre.persona3(G, p.x, z + V.pie - (st.duck > 0 ? .45 : 0), p.y, spinA, Perfil.ped(), st.duck > 0 ? .62 : 1, V.id === 'bici' ? 0 : st.t * 9);
    if (st.grind > 0) G.box(p.x, z + .05, p.y, st.t * 14, .45, .45, .2, [1, .9, .3]);
    if (st.escudo || st.turbo > 0) G.box(p.x, z + 2.3 + Math.sin(st.t * 4) * .1, p.y, st.t * 2, .3, .3, .3, st.turbo > 0 ? CR_POD.turbo[3] : CR_POD.escudo[3]);
  },
  hud(st) { return [['🎫', st.pasajes], ['❤', Math.max(0, st.vidas)], [this.V(st).ico, Math.round(st.v * 3.6) + ' km/h'], ...(st.combo > 1 ? [['★', '×' + st.combo]] : [])]; },
  marcador(g, st, W, H) {
    const d = W / Math.max(1, ($('#gcv') || { clientWidth: W }).clientWidth || W), f = n => Math.round(n * d) + 'px Cuerpo, sans-serif', km = Math.round(st.v * 3.6);
    g.textAlign = 'left'; g.fillStyle = 'rgba(15,34,56,.84)'; g.fillRect(8 * d, 56 * d, 196 * d, 62 * d);
    g.fillStyle = '#fff'; g.font = '800 ' + f(17); g.fillText(Math.round(st.pts) + ' pts' + (st.combo > 1 ? '  ×' + st.combo : ''), 16 * d, 76 * d);
    g.font = '700 ' + f(12); g.fillText('🎫 ' + st.pasajes + '  ' + '❤'.repeat(Math.max(0, st.vidas)) + '  ' + km + ' km/h' + (st.iman > 0 ? ' 🧲' : '') + (st.turbo > 0 ? ' ⚡' : '') + (st.escudo ? ' 🛡' : ''), 16 * d, 95 * d);
    g.fillStyle = '#ffd27a'; g.font = '700 ' + f(10.5);
    const zLbl = st.zona === 'estrecha' ? 'CICLOVÍA ESTRECHA (2)' : st.zona === 'skatepark' ? 'ZONA SKATEPARK' : st.zona === 'parkour' ? 'ZONA PARKOUR' : 'CICLOVÍA AMPLIA (3)';
    g.fillText(zLbl + (st.trucos ? ' · ★' + st.trucos : ''), 16 * d, 111 * d);
    // aviso de giro inminente
    const giro = (st.giros || []).find(q => !q.hecho && q.s - st.s < 55 && q.s - st.s > -5);
    if (giro) {
      g.fillStyle = 'rgba(246,197,56,.95)'; g.fillRect(W / 2 - 74 * d, 62 * d, 148 * d, 32 * d);
      g.fillStyle = '#13253A'; g.textAlign = 'center'; g.font = '900 ' + f(14);
      g.fillText((giro.dir < 0 ? '↰ IZQUIERDA ' : '↱ DERECHA ') + Math.max(0, Math.round(giro.s - st.s)) + 'm', W / 2, 83 * d);
      g.textAlign = 'left';
    }
    if (st.datoT > 0 && st.dato) { g.globalAlpha = clamp(st.datoT, 0, 1); g.fillStyle = 'rgba(255,255,255,.94)'; g.fillRect(8 * d, H - 122 * d, W - 16 * d, 42 * d); g.fillStyle = '#0f2238'; g.font = '700 ' + f(12.5); const t = st.dato.length > 70 ? st.dato.slice(0, 68) + '…' : st.dato; g.fillText(t, 16 * d, H - 97 * d); g.globalAlpha = 1; }
  },
  result(st) { const pts = Math.round(st.pts); return { done: st.done, win: st.done && st.vidas > 0, score: pts, stars: st.done ? (pts > 1800 ? 3 : pts > 950 ? 2 : pts > 350 ? 1 : 0) : 0, lines: [['Puntos', pts], ['Pasajes', st.pasajes], ['Trucos y Parkour', st.trucos], ['Giros perfectos', st.girosOk], ['Estaciones', st.est + 1], ['Vehículo', this.V(st).ico + ' ' + ((VEH[this.V(st).id] || {}).n || '')]], fact: st.dato || '' }; }
};
