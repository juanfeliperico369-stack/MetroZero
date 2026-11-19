/* =====================================================================
   CARRERA SIN FIN (1.5.0) · prototipo de la misión M4 del Plan único (docs/PLAN-UNICO-IA.md)
   En patineta por la calle real que va junto a una línea del metro, del tranvía o del Metroplús: en 3D con el motor G3 y las
   casas y edificios reales (primera o tercera persona) y, si no hay WebGL, desde arriba. Tres carriles, saltos, obstáculos de
   Medellín (huecos, conos, motos, perros, chazas y charcos), pasajes 🎫 y, en cada estación, su dato. El ritmo acelera.
   Cuando lleguen el motor de carrera de Run Scooter y su arte (Gemini y ChatGPT), se cambian la pista, los obstáculos y el
   dibujo; el contrato de modos (create, step, draw, levels, result, ai, act) se queda igual para que el bot lo siga jugando.
   ===================================================================== */
const CR_OBS = {   // [largo (m), alto (m), color, 0 = se salta (está en el piso) · 1 = se esquiva o se salta si es bajo]
  hueco: [1.6, .05, '#2f2f33', 0], charco: [2.2, .04, '#5aa0c8', 0], cono: [.5, .8, '#f08a2b', 1], perro: [.9, .7, '#8a5a2b', 1], moto: [2, 1.3, '#c0392b', 1], chaza: [1.6, 1.4, '#2ec4b6', 1]
};
const Carrera = EM.modes.carrera = {
  id: 'carrera', name: 'Carrera sin fin', sub: 'Junto al metro, al tranvía y al Metroplús', music: 'conduce', fullCanvas: true,
  tip: 'Desliza a los lados (o ◀ ▶) para cambiar de carril y hacia arriba (o ▲) para saltar. Los huecos y los charcos se saltan; los conos, los perros, las motos y las chazas se esquivan. Recoge pasajes 🎫 y el dato de cada estación. 👁 cambia entre primera y tercera persona.',
  LINEAS: [['A', 'Línea A del metro'], ['B', 'Línea B del metro'], ['T', 'Tranvía de Ayacucho'], ['MP1', 'Metroplús Línea 1'], ['MP2', 'Metroplús Línea 2']],
  levels() { return this.LINEAS.filter(([id]) => NET.byId[id]).map(([id, n]) => ({ id: 'cr:' + id, name: n, sub: 'En patineta, por la calle junto a la vía' })); },
  create(lv, opts = {}) {
    const id = String(lv || 'cr:A').slice(3), l = NET.byId[id] || NET.byId.A, rng = new RNG((opts.seed | 0) + 17), obs = [];
    for (let s = 70; s < l.P.len - 30; s += 9 + rng.f() * 16) { const tipos = Object.keys(CR_OBS); obs.push(rng.f() < .6 ? { s, c: rng.i(0, 2), k: rng.pick(tipos) } : { s, c: rng.i(0, 2), k: 'pasaje' }); }
    return { lvId: lv, line: l.id, off: l.kind === 'metro' ? 13 : 0, s: 30, v: 8, c: 1, cx: 1, y: 0, vy: 0, t: 0, obs, pts: 0, pasajes: 0, vidas: 3, inv: 0, done: false, primera: false, est: -1, dato: '', datoT: 0, auto: !!opts.auto };
  },
  /* punto del carril c (0, 1 o 2; 2,6 m uno del otro) a s metros del comienzo de la línea */
  pos(st, s, c) { const l = NET.byId[st.line]; return NET.at(l.P, clamp(s, 0, l.P.len), st.off + (c - 1) * 2.6); },
  step(st, dt) {
    if (st.done) return; const l = NET.byId[st.line]; st.t += dt; st.v = Math.min(22, st.v + dt * .12);   // el ritmo acelera hasta 80 km/h
    st.s += st.v * dt; st.cx += (st.c - st.cx) * Math.min(1, dt * 10); if (st.inv > 0) st.inv -= dt;
    if (st.y > 0 || st.vy > 0) { st.vy -= 22 * dt; st.y = Math.max(0, st.y + st.vy * dt); if (st.y === 0) st.vy = 0; }
    for (const o of st.obs) { if (o.hecho || Math.abs(o.s - st.s) > 1.2 || Math.abs(o.c - st.cx) > .5) continue;
      if (o.k === 'pasaje') { o.hecho = 1; st.pasajes++; st.pts += 10; continue; }
      const T = CR_OBS[o.k]; if (st.y > Math.max(.3, T[1]) || st.inv > 0) continue;   // saltando por encima, o recién golpeado
      o.hecho = 1; st.vidas--; st.inv = 1.4; st.v = Math.max(7, st.v * .7); if (st.vidas <= 0) st.done = true; }
    for (const e of l.st) { if (e.i <= st.est || e.s > st.s) continue; st.est = e.i; st.pts += 25; const f = NET.fact ? NET.fact(e.name) : ''; st.dato = '🚉 ' + e.name + (f ? ' · ' + f : ''); st.datoT = 6; }
    if (st.datoT > 0) st.datoT -= dt; st.pts += st.v * dt * .5;
    if (st.s >= l.P.len - 10) st.done = true;   // llegaste al final de la línea
    if (st.auto) { const a = this.ai(st); if (a) this.act(st, a); }
  },
  /* el bot: mira 9 m adelante; salta lo bajo y esquiva lo alto */
  ai(st) {
    const o = st.obs.find(q => !q.hecho && q.k !== 'pasaje' && q.s > st.s && q.s < st.s + 9 && q.c === st.c); if (!o) return null; const T = CR_OBS[o.k];
    if (T[3] === 0 || T[1] < .9) return 'salta'; const libre = [0, 1, 2].filter(c => !st.obs.some(q => !q.hecho && q.k !== 'pasaje' && q.c === c && q.s > st.s && q.s < st.s + 11));
    return libre.length ? (libre[0] < st.c ? 'izq' : 'der') : 'salta';
  },
  act(st, a) { if (a === 'izq') st.c = Math.max(0, st.c - 1); else if (a === 'der') st.c = Math.min(2, st.c + 1); else if (a === 'salta' && st.y === 0) st.vy = 7.5; else if (a === 'vista') st.primera = !st.primera; },
  key(st, k, down) { if (!down) return; const m = { ArrowLeft: 'izq', a: 'izq', ArrowRight: 'der', d: 'der', ArrowUp: 'salta', w: 'salta', ' ': 'salta', v: 'vista' }[k]; if (m) this.act(st, m); },
  mount(st, el) {
    el.innerHTML = `<div class="crbtns"><button id="crIz" aria-label="Carril a la izquierda">◀</button><button id="crSa" aria-label="Saltar">▲</button><button id="crDe" aria-label="Carril a la derecha">▶</button></div><div class="vsel"><button id="crVi" title="Primera o tercera persona">👁</button></div>`;
    $('#crIz').onclick = () => this.act(st, 'izq'); $('#crDe').onclick = () => this.act(st, 'der'); $('#crSa').onclick = () => this.act(st, 'salta'); $('#crVi').onclick = () => this.act(st, 'vista');
    const cv = $('#gcv'); let p0 = null; this.unmount();   // deslizar: a los lados cambia de carril, hacia arriba salta
    this._pd = e => { p0 = { x: e.clientX, y: e.clientY }; }; this._pu = e => { if (!p0) return; const dx = e.clientX - p0.x, dy = e.clientY - p0.y; p0 = null; if (Math.abs(dx) > 30 && Math.abs(dx) > Math.abs(dy)) this.act(st, dx < 0 ? 'izq' : 'der'); else if (dy < -30) this.act(st, 'salta'); };
    cv.addEventListener('pointerdown', this._pd); cv.addEventListener('pointerup', this._pu);
  },
  unmount() { const cv = $('#gcv'); if (cv && this._pd) { cv.removeEventListener('pointerdown', this._pd); cv.removeEventListener('pointerup', this._pu); this._pd = null; } },
  gl(st) { return !st.auto && !EM.headless && Save.d.settings.q !== 'low' && typeof G3 !== 'undefined' && G3.init(); },
  draw(g, st, vp) {
    const W = vp.w, H = vp.h, p = this.pos(st, st.s, st.cx), z = MAP.elevM(p.x, p.y) + st.y;
    if (this.gl(st)) { G3.show(true); const c = Math.cos(p.a), s = Math.sin(p.a), cam = st.primera ? { eye: [p.x + c * .3, z + 1.55, p.y + s * .3], at: [p.x + c * 20, z + 1.2, p.y + s * 20], fov: 1.2 } : { eye: [p.x - c * 6.5, z + 3.2, p.y - s * 6.5], at: [p.x + c * 8, z + 1, p.y + s * 8], fov: 1.05 };
      G3.draw(cam, { hour: Mundo.hour(), rain: Mundo.weather().rain, escala: .8, suave: true, cerca: 1.5, dyn: G => this.dyn3D(G, st, p, z) }); }
    else {   // desde arriba (sin WebGL, en «Celular modesto» o en las pruebas)
      if (typeof G3 !== 'undefined' && G3.cv) G3.show(false); const k = 4 * (W / Math.max(1, ($('#gcv') || { clientWidth: W }).clientWidth || W)), mx = p.x, my = p.y, S = (x, y) => ({ x: W / 2 + (x - mx) * k, y: H * .62 + (y - my) * k });
      g.fillStyle = '#3a6b45'; g.fillRect(0, 0, W, H); if (MAP.ready) MAP.drawTop(g, W, H, mx, my - (H * .12) / k, k);
      for (const o of st.obs) { if (o.hecho || o.s < st.s - 8 || o.s > st.s + 70) continue; const q = S(this.pos(st, o.s, o.c).x, this.pos(st, o.s, o.c).y); g.fillStyle = o.k === 'pasaje' ? PAL.mostaza : CR_OBS[o.k][2]; g.beginPath(); g.arc(q.x, q.y, (o.k === 'pasaje' ? .5 : .8) * k, 0, TAU); g.fill(); }
      const q = S(p.x, p.y); g.fillStyle = '#ffb21e'; g.strokeStyle = PAL.negro; g.lineWidth = 2; g.beginPath(); g.arc(q.x, q.y, (1 + st.y * .3) * k, 0, TAU); g.fill(); g.stroke();
    }
    this.marcador(g, st, W, H);
  },
  dyn3D(G, st, p, z) {
    for (const o of st.obs) { if (o.hecho || o.s < st.s - 3 || o.s > st.s + 90) continue; const q = this.pos(st, o.s, o.c), zq = MAP.elevM(q.x, q.y);
      if (o.k === 'pasaje') { G.box(q.x, zq + 1 + Math.sin(st.t * 3 + o.s) * .15, q.y, st.t * 2, .5, .08, .35, [.98, .78, .2]); continue; }
      const T = CR_OBS[o.k]; G.box(q.x, zq, q.y, q.a, T[0], o.k === 'moto' ? .7 : 1.1, Math.max(.06, T[1]), rgb(T[2])); }
    if (st.primera) G.box(p.x + Math.cos(p.a) * .75, z + 1.05, p.y + Math.sin(p.a) * .75, p.a + Math.PI / 2, .7, .05, .05, [.15, .15, .17]);   // el manubrio
    else if (!(st.inv > 0 && Math.floor(st.t * 10) % 2)) { G.box(p.x, z + .08, p.y, p.a, 1.1, .5, .12, rgb('#2ec4b6')); Libre.persona3(G, p.x, z + .2, p.y, p.a, Perfil.ped(), 1, st.t * 9); }
  },
  /* la barra de arriba del juego (Game.hud) */
  hud(st) { return [['🎫', st.pasajes], ['❤', Math.max(0, st.vidas)], ['', Math.round(st.v * 3.6) + ' km/h']]; },
  /* el marcador sobre el lienzo: puntos, pasajes, vidas, velocidad y el dato de la última estación */
  marcador(g, st, W, H) {
    const d = W / Math.max(1, ($('#gcv') || { clientWidth: W }).clientWidth || W), f = n => Math.round(n * d) + 'px Cuerpo, sans-serif', km = Math.round(st.v * 3.6);
    g.textAlign = 'left'; g.fillStyle = 'rgba(15,34,56,.82)'; g.fillRect(8 * d, 56 * d, 168 * d, 52 * d); g.fillStyle = '#fff'; g.font = '800 ' + f(17); g.fillText(Math.round(st.pts) + ' puntos', 16 * d, 77 * d); g.font = '700 ' + f(12.5); g.fillText('🎫 ' + st.pasajes + '   ' + '❤'.repeat(Math.max(0, st.vidas)) + '   ' + km + ' km/h', 16 * d, 98 * d);
    if (st.datoT > 0 && st.dato) { g.globalAlpha = clamp(st.datoT, 0, 1); g.fillStyle = 'rgba(255,255,255,.94)'; g.fillRect(8 * d, H - 120 * d, W - 16 * d, 44 * d); g.fillStyle = '#0f2238'; g.font = '700 ' + f(12.5); const t = st.dato.length > 70 ? st.dato.slice(0, 68) + '…' : st.dato; g.fillText(t, 16 * d, H - 94 * d); g.globalAlpha = 1; }
  },
  result(st) { const pts = Math.round(st.pts); return { done: st.done, win: st.done && st.vidas > 0, score: pts, stars: st.done ? (pts > 1500 ? 3 : pts > 800 ? 2 : pts > 300 ? 1 : 0) : 0, lines: [['Puntos', pts], ['Pasajes', st.pasajes], ['Estaciones', st.est + 1]], fact: st.dato || '' }; }
};
