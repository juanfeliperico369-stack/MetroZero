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
  { id: 'skate', ico: '🛹', spd: 20, sal: 8, mesh: 'skate', pie: .16 }, { id: 'patines', ico: '🛼', spd: 20.5, sal: 7.8, mesh: 'patines', pie: .2 },
  { id: 'monopatin', ico: '🛴', spd: 21, sal: 7.5, mesh: 'scooter', pie: .16 }, { id: 'scooter', ico: '⚡', spd: 23, sal: 7.2, mesh: 'electrico', pie: .24 },
  { id: 'bici', ico: '🚲', spd: 22, sal: 7, mesh: 'bici', pie: .55 }
];
const CR_POD = { iman: ['🧲', 'Imán: los pasajes de los otros carriles llegan solos', 8, [.86, .2, .2]], turbo: ['⚡', 'Turbo: más rápido y atraviesas lo que venga', 5, [.98, .8, .15]], escudo: ['🛡', 'Escudo: el próximo golpe no cuenta', 0, [.25, .55, .95]] };
const CR_OBS = {   // [largo (m), alto (m), color, 0 = se salta (está en el piso) · 1 = se esquiva o se salta si es bajo]
  hueco: [1.6, .05, '#2f2f33', 0], charco: [2.2, .04, '#5aa0c8', 0], cono: [.5, .8, '#f08a2b', 1], perro: [.9, .7, '#8a5a2b', 1], moto: [2, 1.3, '#c0392b', 1], chaza: [1.6, 1.4, '#2ec4b6', 1]
};
const Carrera = EM.modes.carrera = {
  id: 'carrera', name: 'Carrera sin fin', sub: 'Junto al metro, al tranvía y al Metroplús', music: 'conduce', fullCanvas: true,
  tip: 'Desliza a los lados (o ◀ ▶) para cambiar de carril y hacia arriba (o ▲) para saltar. Los huecos y los charcos se saltan; los conos, los perros, las motos y las chazas se esquivan. Recoge pasajes 🎫, poderes (🧲 imán, ⚡ turbo, 🛡 escudo) y el dato de cada estación. 🛹 cambia de vehículo y 👁 entre primera y tercera persona.',
  LINEAS: [['A', 'Línea A del metro'], ['B', 'Línea B del metro'], ['T', 'Tranvía de Ayacucho'], ['MP1', 'Metroplús Línea 1'], ['MP2', 'Metroplús Línea 2'], ['MPO', 'Línea O por la 80']],
  levels() { return this.LINEAS.filter(([id]) => NET.byId[id]).map(([id, n]) => ({ id: 'cr:' + id, name: n, sub: 'En skate, patines, monopatín o bici, por la calle junto a la vía' })); },
  V(st) { return CR_VEH[st.vi | 0] || CR_VEH[0]; },
  create(lv, opts = {}) {
    const id = String(lv || 'cr:A').slice(3), l = NET.byId[id] || NET.byId.A, rng = new RNG((opts.seed | 0) + 17), obs = [];
    const tipos = Object.keys(CR_OBS), pods = Object.keys(CR_POD);
    for (let s = 70; s < l.P.len - 30; s += 9 + rng.f() * 16) { const r = rng.f(), c = rng.i(0, 2); obs.push(r < .58 ? { s, c, k: rng.pick(tipos) } : r < .955 ? { s, c, k: 'pasaje' } : { s, c, k: rng.pick(pods) }); }
    return { lvId: lv, line: l.id, off: l.kind === 'metro' ? 13 : 0, s: 30, v: 8, c: 1, cx: 1, y: 0, vy: 0, t: 0, obs, pts: 0, pasajes: 0, vidas: 3, inv: 0, done: false, primera: false, est: -1, dato: '', datoT: 0, auto: !!opts.auto,
      vi: clamp(Save.d.settings.vehCr | 0, 0, CR_VEH.length - 1), iman: 0, turbo: 0, escudo: 0, poderes: 0 };
  },
  /* punto del carril c (0, 1 o 2; 2,6 m uno del otro) a s metros del comienzo de la línea */
  pos(st, s, c) { const l = NET.byId[st.line]; return NET.at(l.P, clamp(s, 0, l.P.len), st.off + (c - 1) * 2.6); },
  step(st, dt) {
    if (st.done) return; const l = NET.byId[st.line], V = this.V(st), top = V.spd * (st.turbo > 0 ? 1.3 : 1); st.t += dt;
    st.v = st.v > top ? Math.max(top, st.v - dt * 3) : Math.min(top, st.v + dt * (st.turbo > 0 ? 4 : .12));   // el ritmo acelera hasta el tope del vehículo (unos 75 a 85 km/h)
    st.s += st.v * dt; st.cx += (st.c - st.cx) * Math.min(1, dt * 10); if (st.inv > 0) st.inv -= dt; if (st.iman > 0) st.iman -= dt; if (st.turbo > 0) st.turbo -= dt;
    if (st.y > 0 || st.vy > 0) { st.vy -= 22 * dt; st.y = Math.max(0, st.y + st.vy * dt); if (st.y === 0) st.vy = 0; }
    for (const o of st.obs) { if (o.hecho || o.s < st.s - 1.2 || o.s > st.s + (st.iman > 0 && o.k === 'pasaje' ? 7 : 1.2)) continue;
      if (Math.abs(o.c - st.cx) > (st.iman > 0 && o.k === 'pasaje' ? 2.5 : .5)) continue;   // con el imán, los pasajes de los otros carriles llegan solos
      if (o.k === 'pasaje') { o.hecho = 1; st.pasajes++; st.pts += 10; continue; }
      if (CR_POD[o.k]) { o.hecho = 1; st.poderes++; st.pts += 15; const P = CR_POD[o.k]; if (o.k === 'escudo') st.escudo = 1; else st[o.k] = P[2]; st.dato = P[0] + ' ' + P[1]; st.datoT = 3; continue; }
      const T = CR_OBS[o.k]; if (st.y > Math.max(.3, T[1]) || st.inv > 0) continue;   // saltando por encima, o recién golpeado
      o.hecho = 1; if (st.turbo > 0) { st.pts += 5; continue; }   // con el turbo se atraviesa
      if (st.escudo) { st.escudo = 0; st.inv = 1; st.dato = '🛡 El escudo aguantó el golpe'; st.datoT = 2.5; continue; }
      st.vidas--; st.inv = 1.4; st.v = Math.max(7, st.v * .7); if (st.vidas <= 0) st.done = true; }
    for (const e of l.st) { if (e.i <= st.est || e.s > st.s) continue; st.est = e.i; st.pts += 25; const f = NET.fact ? NET.fact(e.name) : ''; st.dato = '🚉 ' + e.name + (f ? ' · ' + f : ''); st.datoT = 6; }
    if (st.datoT > 0) st.datoT -= dt; st.pts += st.v * dt * .5;
    if (st.s >= l.P.len - 10) st.done = true;   // llegaste al final de la línea
    if (st.auto) { const a = this.ai(st); if (a) this.act(st, a); }
  },
  /* el bot: mira 9 m adelante; salta lo bajo y esquiva lo alto */
  ai(st) {
    if (st.t > 4 && !st._bv) { st._bv = 1; return 'vehiculo'; }   // el bot prueba otro vehículo una vez
    const o = st.obs.find(q => !q.hecho && CR_OBS[q.k] && q.s > st.s && q.s < st.s + 9 && q.c === st.c); if (!o || st.turbo > 0) return null; const T = CR_OBS[o.k];
    if (T[3] === 0 || T[1] < .9) return 'salta'; const libre = [0, 1, 2].filter(c => !st.obs.some(q => !q.hecho && CR_OBS[q.k] && q.c === c && q.s > st.s && q.s < st.s + 11));
    return libre.length ? (libre[0] < st.c ? 'izq' : 'der') : 'salta';
  },
  act(st, a) {
    if (a === 'izq') st.c = Math.max(0, st.c - 1); else if (a === 'der') st.c = Math.min(2, st.c + 1); else if (a === 'salta' && st.y === 0) st.vy = this.V(st).sal; else if (a === 'vista') st.primera = !st.primera;
    else if (a === 'vehiculo') { st.vi = (st.vi + 1) % CR_VEH.length; const V = this.V(st); if (!st.auto) { Save.d.settings.vehCr = st.vi; Save.write(); } st.dato = V.ico + ' ' + ((VEH[V.id] || {}).n || V.id); st.datoT = 2.5; const b = $('#crVe'); if (b) b.textContent = V.ico; }
  },
  key(st, k, down) { if (!down) return; const m = { ArrowLeft: 'izq', a: 'izq', ArrowRight: 'der', d: 'der', ArrowUp: 'salta', w: 'salta', ' ': 'salta', v: 'vista', c: 'vehiculo' }[k]; if (m) this.act(st, m); },
  mount(st, el) {
    el.innerHTML = `<div class="crbtns"><button id="crIz" aria-label="Carril a la izquierda">◀</button><button id="crSa" aria-label="Saltar">▲</button><button id="crDe" aria-label="Carril a la derecha">▶</button></div><div class="vsel"><button id="crVe" title="Cambiar de vehículo">${this.V(st).ico}</button><button id="crVi" title="Primera o tercera persona">👁</button></div>`;
    $('#crIz').onclick = () => this.act(st, 'izq'); $('#crDe').onclick = () => this.act(st, 'der'); $('#crSa').onclick = () => this.act(st, 'salta'); $('#crVi').onclick = () => this.act(st, 'vista'); $('#crVe').onclick = () => this.act(st, 'vehiculo');
    const cv = $('#gcv'); let p0 = null; this.unmount();   // deslizar: a los lados cambia de carril, hacia arriba salta
    this._pd = e => { p0 = { x: e.clientX, y: e.clientY }; }; this._pu = e => { if (!p0) return; const dx = e.clientX - p0.x, dy = e.clientY - p0.y; p0 = null; if (Math.abs(dx) > 30 && Math.abs(dx) > Math.abs(dy)) this.act(st, dx < 0 ? 'izq' : 'der'); else if (dy < -30) this.act(st, 'salta'); };
    cv.addEventListener('pointerdown', this._pd); cv.addEventListener('pointerup', this._pu);
  },
  unmount() { const cv = $('#gcv'); if (cv && this._pd) { cv.removeEventListener('pointerdown', this._pd); cv.removeEventListener('pointerup', this._pu); this._pd = null; } },
  gl(st) { return !st.auto && !EM.headless && Save.d.settings.q !== 'low' && typeof G3 !== 'undefined' && G3.init(); },
  draw(g, st, vp) {
    const W = vp.w, H = vp.h, p = this.pos(st, st.s, st.cx), z = MAP.elevM(p.x, p.y) + st.y;
    if (this.gl(st)) { G3.show(true); const c = Math.cos(p.a), s = Math.sin(p.a), cam = st.primera ? { eye: [p.x + c * .3, z + 1.55, p.y + s * .3], at: [p.x + c * 20, z + 1.2, p.y + s * 20], fov: 1.2 } : { eye: [p.x - c * 6.5, z + 3.2, p.y - s * 6.5], at: [p.x + c * 8, z + 1, p.y + s * 8], fov: 1.05 };
      G3.draw(cam, { hour: Mundo.hour(), rain: Mundo.weather().rain, escala: .8, suave: true, cerca: 1.5, dyn: G => this.dyn3D(G, st, p, z) });
      if (st.primera && EM.taller) EM.taller.primera(g, this.V(st).mesh, W, H, (st.cx - st.c) * .22 + (st.y > 0 ? -.03 : 0)); }   // el manubrio (o la tabla y los pies) con las manos, del taller de arte
    else {   // desde arriba (sin WebGL, en «Celular modesto» o en las pruebas)
      if (typeof G3 !== 'undefined' && G3.cv) G3.show(false); const k = 4 * (W / Math.max(1, ($('#gcv') || { clientWidth: W }).clientWidth || W)), mx = p.x, my = p.y, S = (x, y) => ({ x: W / 2 + (x - mx) * k, y: H * .62 + (y - my) * k });
      g.fillStyle = '#3a6b45'; g.fillRect(0, 0, W, H); if (MAP.ready) MAP.drawTop(g, W, H, mx, my - (H * .12) / k, k);
      for (const o of st.obs) { if (o.hecho || o.s < st.s - 8 || o.s > st.s + 70) continue; const q = S(this.pos(st, o.s, o.c).x, this.pos(st, o.s, o.c).y), P = CR_POD[o.k]; g.fillStyle = o.k === 'pasaje' ? PAL.mostaza : P ? 'rgb(' + P[3].map(v => v * 255 | 0) + ')' : CR_OBS[o.k][2]; g.beginPath(); g.arc(q.x, q.y, (o.k === 'pasaje' ? .5 : .8) * k, 0, TAU); g.fill(); }
      const q = S(p.x, p.y); g.fillStyle = '#ffb21e'; g.strokeStyle = PAL.negro; g.lineWidth = 2; g.beginPath(); g.arc(q.x, q.y, (1 + st.y * .3) * k, 0, TAU); g.fill(); g.stroke();
    }
    this.marcador(g, st, W, H);
  },
  /* malla del taller de arte subida una vez por contexto de WebGL (null si el taller no está: se dibuja con cajas) */
  malla(clave, hacer) { const T = EM.taller; return T && T.malla ? T.malla(clave, () => hacer(T)) : null; },
  dyn3D(G, st, p, z) {
    const T = EM.taller;
    for (const o of st.obs) { if (o.hecho || o.s < st.s - 3 || o.s > st.s + 90) continue; const q = this.pos(st, o.s, o.c), zq = MAP.elevM(q.x, q.y), P = CR_POD[o.k];
      if (P) { G.box(q.x, zq + .9 + Math.sin(st.t * 3 + o.s) * .15, q.y, st.t * 2.5, .55, .55, .55, P[3]); continue; }
      const m = this.malla('o:' + o.k, T => T.pista(o.k));
      if (m) { T.mundo(m, q.x, zq + (o.k === 'pasaje' ? .45 + Math.sin(st.t * 3 + o.s) * .15 : 0), q.y, o.k === 'pasaje' ? st.t * 2 : q.a + (o.k === 'moto' || o.k === 'perro' ? Math.PI : 0)); continue; }
      if (o.k === 'pasaje') { G.box(q.x, zq + 1 + Math.sin(st.t * 3 + o.s) * .15, q.y, st.t * 2, .5, .08, .35, [.98, .78, .2]); continue; }
      const C = CR_OBS[o.k]; G.box(q.x, zq, q.y, q.a, C[0], o.k === 'moto' ? .7 : 1.1, Math.max(.06, C[1]), rgb(C[2])); }
    if (st.primera || (st.inv > 0 && Math.floor(st.t * 10) % 2)) return;   // en primera persona el manubrio va encima, en el lienzo
    const V = this.V(st), m = this.malla('v:' + V.mesh, T => T.vehiculo(V.mesh, { persona: false }));
    if (m) T.mundo(m, p.x, z, p.y, p.a); else G.box(p.x, z + .08, p.y, p.a, 1.1, .5, .12, rgb('#2ec4b6'));
    Libre.persona3(G, p.x, z + V.pie, p.y, p.a, Perfil.ped(), 1, V.id === 'bici' ? 0 : st.t * 9);
    if (st.escudo || st.turbo > 0) G.box(p.x, z + 2.3 + Math.sin(st.t * 4) * .1, p.y, st.t * 2, .3, .3, .3, st.turbo > 0 ? CR_POD.turbo[3] : CR_POD.escudo[3]);
  },
  /* la barra de arriba del juego (Game.hud) */
  hud(st) { return [['🎫', st.pasajes], ['❤', Math.max(0, st.vidas)], [this.V(st).ico, Math.round(st.v * 3.6) + ' km/h']]; },
  /* el marcador sobre el lienzo: puntos, pasajes, vidas, velocidad y el dato de la última estación */
  marcador(g, st, W, H) {
    const d = W / Math.max(1, ($('#gcv') || { clientWidth: W }).clientWidth || W), f = n => Math.round(n * d) + 'px Cuerpo, sans-serif', km = Math.round(st.v * 3.6);
    g.textAlign = 'left'; g.fillStyle = 'rgba(15,34,56,.82)'; g.fillRect(8 * d, 56 * d, 168 * d, 52 * d); g.fillStyle = '#fff'; g.font = '800 ' + f(17); g.fillText(Math.round(st.pts) + ' puntos', 16 * d, 77 * d); g.font = '700 ' + f(12.5); g.fillText('🎫 ' + st.pasajes + '   ' + '❤'.repeat(Math.max(0, st.vidas)) + '   ' + km + ' km/h' + (st.iman > 0 ? '  🧲' : '') + (st.turbo > 0 ? '  ⚡' : '') + (st.escudo ? '  🛡' : ''), 16 * d, 98 * d);
    if (st.datoT > 0 && st.dato) { g.globalAlpha = clamp(st.datoT, 0, 1); g.fillStyle = 'rgba(255,255,255,.94)'; g.fillRect(8 * d, H - 120 * d, W - 16 * d, 44 * d); g.fillStyle = '#0f2238'; g.font = '700 ' + f(12.5); const t = st.dato.length > 70 ? st.dato.slice(0, 68) + '…' : st.dato; g.fillText(t, 16 * d, H - 94 * d); g.globalAlpha = 1; }
  },
  result(st) { const pts = Math.round(st.pts); return { done: st.done, win: st.done && st.vidas > 0, score: pts, stars: st.done ? (pts > 1500 ? 3 : pts > 800 ? 2 : pts > 300 ? 1 : 0) : 0, lines: [['Puntos', pts], ['Pasajes', st.pasajes], ['Estaciones', st.est + 1], ['Poderes', st.poderes], ['Vehículo', this.V(st).ico + ' ' + ((VEH[this.V(st).id] || {}).n || '')]], fact: st.dato || '' }; }
};
