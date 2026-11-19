/* =====================================================================
   RUN SCOOTER (Carrera por el Valle): modo arcade de 3 carriles en 3D y 2D
   sobre los corredores reales del Valle de Aburrá (Línea A, Línea B, Tranvía
   de Ayacucho, Avenida 80 y Troncal Metroplús). Elige entre bici EnCicla,
   monopatín, monopatín eléctrico, tabla (skate) o patines; alterna entre
   tercera persona, primera persona (con manubrio y manos) y vista 2D;
   esquiva obstáculos, salta, agáchate y recoge pasajes, poderes y datos reales
   de la ciudad («lo que todos saben» y «lo que pocos saben»).
   ===================================================================== */
const Carrera = EM.modes.carrera = {
  id: 'carrera', name: 'Run Scooter', sub: 'Carrera de micromovilidad por el valle', music: 'ciudad', fullCanvas: true,
  tip: '◀ ▶ cambia de carril (o desliza a los lados). ▲ salta huecos, conos y charcos; ▼ se agacha bajo pasacalles y vallas altas. Recoge 🎫 pasajes, 💡 datos curiosos del valle y poderes (🧲 imán, ⚡ turbo, 🛡️ escudo). Con 🛴 cambias entre monopatín, eléctrico, bici EnCicla, skate o patines, y con 👁 alternas entre tercera persona, primera persona (manubrio) y 2D.',
  VEHS: [
    { id: 'scooter', n: 'Monopatín', ico: '🛴', spd: 14, jmp: 8.8, lat: 10.5, col: '#29b6f6' },
    { id: 'monopatin', n: 'Monopatín eléctrico', ico: '⚡', spd: 17, jmp: 8.2, lat: 9.8, col: '#66bb6a' },
    { id: 'bici', n: 'Bici EnCicla', ico: '🚲', spd: 15.6, jmp: 7.8, lat: 9.2, col: '#9bd341' },
    { id: 'skate', n: 'Tabla (Skate)', ico: '🛹', spd: 14.6, jmp: 9.8, lat: 11.8, col: '#ff7043' },
    { id: 'patines', n: 'Patines', ico: '🛼', spd: 15.2, jmp: 9.2, lat: 12.5, col: '#ec407a' }
  ],
  TRAMOS: [
    { id: 'cr:A-centro', line: 'A', i0: 6, i1: 14, name: 'Corredor del Río', sub: 'Bello → Poblado junto al viaducto y el río Medellín' },
    { id: 'cr:B-occidente', line: 'B', i0: 0, i1: 6, name: 'Bulevar San Juan y la 70', sub: 'San Antonio → San Javier por la ciclorruta de San Juan' },
    { id: 'cr:TA-ayacucho', line: 'TA', i0: 0, i1: 8, name: 'Paseo de Ayacucho', sub: 'San Antonio → Oriente junto al Tranvía de Ayacucho' },
    { id: 'cr:MPO-ochenta', line: 'MPO', i0: 0, i1: 7, name: 'Avenida 80', sub: 'Caribe → La Palma por el corredor de la 80' },
    { id: 'cr:MP1-veinte', line: 'MP1', i0: 0, i1: 11, name: 'Troncal Metroplús', sub: 'U. de Medellín → Cisneros por la calle 30 y Ferrocarril' },
    { id: 'cr:A-sur', line: 'A', i0: 12, i1: 20, name: 'Sur del Valle', sub: 'Industriales → La Estrella entre ceibas y bodegas' }
  ],
  DATOS: [
    ['Lo que todos saben', 'El Metro de Medellín se inauguró el 30 de noviembre de 1995 entre Niquía y El Poblado.'],
    ['Lo que pocos saben', 'Las ciclorrutas del corredor del río y Las Vegas conectan más de 100 estaciones de EnCicla con el Metro.'],
    ['Lo que todos saben', 'EnCicla presta bicicletas públicas gratis con la tarjeta Cívica en todo el Valle de Aburrá.'],
    ['Lo que pocos saben', 'El Tranvía de Ayacucho sube pendientes del 12,5 % con ruedas neumáticas guiadas por un riel central Translohr.'],
    ['Lo que todos saben', 'La Cultura Metro nació en 1988, siete años antes de que rodara el primer tren comercial.'],
    ['Lo que pocos saben', 'Bajo las estaciones elevadas de la Línea A corren colectores de quebradas que bajan de las laderas al río Aburrá.'],
    ['Lo que todos saben', 'Los Metrocables K, J, H, M y P conectan las comunas de las laderas sin cobrar pasaje adicional al integrar.'],
    ['Lo que pocos saben', 'El puente de Guayaquil (1879), junto a Industriales, fue construido con ladrillo cocido y pega de cal y sangre de res.'],
    ['Lo que todos saben', 'La tarjeta Cívica integra trenes, tranvía, metrocables, Metroplús, buses alimentadores y EnCicla.'],
    ['Lo que pocos saben', 'En las horas pico el sistema EnCicla mueve camiones de balanceo para llevar bicis de las estaciones del río a las universidades.']
  ],
  levels() { return this.TRAMOS.map(t => ({ id: t.id, line: t.line, name: t.name, sub: t.sub })); },
  V(st) { return this.VEHS[st.vi | 0] || this.VEHS[0]; },
  gl(st) { return st.view !== '2d' && !EM.headless && Save.d.settings.q !== 'low' && G3.init(); },
  create(lvId, opts = {}) {
    const T = this.TRAMOS.find(t => t.id === lvId) || this.TRAMOS[0], line = NET.byId[T.line] || NET.lines[0];
    const i0 = clamp(T.i0, 0, line.st.length - 2), i1 = clamp(T.i1, i0 + 1, line.st.length - 1);
    const s0 = line.st[i0].s, s1 = Math.min(line.st[i1].s, s0 + 1400), len = Math.max(400, s1 - s0);
    const rng = new RNG((opts.seed | 0) + 19), vi0 = Save.d.settings.vehCarrera | 0;
    const obs = [], items = [], kinds = ['hueco', 'cono', 'charco', 'perro', 'chaza', 'valla', 'moto'];
    for (let s = s0 + 55; s < s1 - 35; s += 24 + rng.f() * 14) {
      const lane = rng.i(-1, 1), k = kinds[rng.i(0, kinds.length - 1)];
      obs.push({ s, lane, k, hit: 0, h: k === 'valla' ? 1.8 : k === 'chaza' || k === 'moto' ? 1.4 : .65 });
      if (rng.f() < .42) {
        const l2 = ((lane + 1 + rng.i(1, 2)) % 3) - 1, k2 = kinds[rng.i(0, 3)];
        obs.push({ s: s + 2, lane: l2, k: k2, hit: 0, h: .65 });
      }
      const il = ((lane + 1 + rng.i(1, 2)) % 3) - 1, r = rng.f();
      if (r < .22) items.push({ s: s - 8, lane: il, k: 'dato', d: this.DATOS[items.length % this.DATOS.length], got: 0 });
      else if (r < .36) items.push({ s: s - 8, lane: il, k: ['iman', 'turbo', 'escudo'][items.length % 3], got: 0 });
      else for (let j = 0; j < 3; j++) items.push({ s: s - 10 + j * 4.5, lane: il, k: 'pasaje', got: 0 });
    }
    const checkpoints = line.st.slice(i0 + 1, i1 + 1).filter(st => st.s <= s1 + 5);
    const p0 = NET.at(line.P, s0);
    return {
      lvId, T, line, s0, s1, len, s: s0, x: p0.x, y: p0.y, a: p0.a,
      vi: clamp(vi0, 0, this.VEHS.length - 1), lane: 0, laneX: 0,
      v: 8, z: 0, vz: 0, duck: 0, tilt: 0, t: 0,
      score: 0, coins: 0, datos: 0, hits: 0, combo: 0,
      iman: 0, turbo: 0, escudo: 0, inv: 0,
      obs, items, checkpoints, ci: 0,
      view: Save.d.settings.vistaCr || '3p',
      datoMsg: null, datoT: 0, done: false, win: false
    };
  },
  cambiarVeh(st, d = 1) {
    st.vi = (st.vi + d + this.VEHS.length) % this.VEHS.length;
    Save.d.settings.vehCarrera = st.vi; Save.write();
    const V = this.V(st);
    if (!EM.headless && Game.st === st) { UI.gmsg(V.ico + ' ' + V.n, 'b'); Snd.play('tap'); const b = $('#crVeh'); if (b) b.innerHTML = V.ico + '<small>' + esc(V.n.split(' ')[0]) + '</small>'; }
  },
  laneCmd(st, dl) {
    const nl = clamp(st.lane + dl, -1, 1);
    if (nl !== st.lane) { st.lane = nl; st.tilt = -dl * .28; if (!EM.headless && Game.st === st) Snd.play('tap'); }
  },
  jumpCmd(st) {
    if (st.z <= .05) { st.vz = this.V(st).jmp; st.duck = 0; if (!EM.headless && Game.st === st) Snd.play('beep'); }
  },
  duckCmd(st) {
    st.duck = .75; if (st.z > .1) st.vz = Math.min(st.vz, -7);
  },
  step(st, dt) {
    if (st.done) return;
    st.t += dt;
    const V = this.V(st), targetV = V.spd * (st.turbo > 0 ? 1.38 : 1);
    st.v += (targetV - st.v) * Math.min(1, dt * 3.2);
    st.s += st.v * dt;
    st.score += st.v * dt * 1.5;
    st.laneX += (st.lane * 2.4 - st.laneX) * Math.min(1, dt * V.lat);
    st.tilt *= Math.exp(-6 * dt);
    if (st.z > 0 || st.vz !== 0) {
      st.z += st.vz * dt; st.vz -= 22 * dt;
      if (st.z <= 0) { st.z = 0; st.vz = 0; }
    }
    if (st.duck > 0) st.duck = Math.max(0, st.duck - dt);
    if (st.iman > 0) st.iman = Math.max(0, st.iman - dt);
    if (st.turbo > 0) st.turbo = Math.max(0, st.turbo - dt);
    if (st.inv > 0) st.inv = Math.max(0, st.inv - dt);
    if (st.datoT > 0) st.datoT = Math.max(0, st.datoT - dt);

    const p = NET.at(st.line.P, st.s), nx = -Math.sin(p.a), ny = Math.cos(p.a), off = 6.5 + st.laneX;
    st.x = p.x + nx * off; st.y = p.y + ny * off; st.a = p.a;

    // recolectables
    for (const it of st.items) {
      if (it.got || it.s < st.s - 6 || it.s > st.s + 16) continue;
      if (st.iman > 0 && it.k === 'pasaje' && Math.abs(it.s - st.s) < 15) {
        it.lane += (st.lane - it.lane) * Math.min(1, dt * 10);
      }
      if (Math.abs(it.s - st.s) < 1.8 && Math.abs(it.lane * 2.4 - st.laneX) < 1.35) {
        it.got = 1;
        if (it.k === 'pasaje') {
          st.coins++; st.combo++; st.score += 15 + Math.min(30, st.combo * 2);
          Save.d.wallet = (Save.d.wallet || 0) + 1;
          if (!EM.headless && Game.st === st) Snd.play('coin');
        } else if (it.k === 'dato') {
          st.datos++; st.score += 45; st.datoMsg = it.d; st.datoT = 5.5;
          if (!EM.headless && Game.st === st) { UI.gmsg('💡 ' + it.d[0] + ': ' + it.d[1], 'y'); Snd.play('star'); }
        } else if (it.k === 'iman') {
          st.iman = 8; st.score += 25;
          if (!EM.headless && Game.st === st) { UI.gmsg('🧲 Imán de pasajes (8 s)', 'b'); Snd.play('ok'); }
        } else if (it.k === 'turbo') {
          st.turbo = 5; st.score += 30;
          if (!EM.headless && Game.st === st) { UI.gmsg('⚡ Turbo eléctrico (5 s)', 'g'); Snd.play('star'); }
        } else if (it.k === 'escudo') {
          st.escudo = 1; st.score += 25;
          if (!EM.headless && Game.st === st) { UI.gmsg('🛡️ Escudo protector activo', 'b'); Snd.play('ok'); }
        }
      }
    }

    // obstáculos
    for (const o of st.obs) {
      if (o.hit || Math.abs(o.s - st.s) > 1.55 || Math.abs(o.lane * 2.4 - st.laneX) > 1.05) continue;
      const jumpOk = (o.k === 'hueco' || o.k === 'cono' || o.k === 'charco' || o.k === 'perro') && st.z > .55;
      const duckOk = o.k === 'valla' && st.duck > 0 && st.z < .3;
      if (jumpOk || duckOk || st.turbo > 0 || st.inv > 0) {
        o.hit = 2; st.score += 10; continue;
      }
      o.hit = 1;
      if (st.escudo > 0) {
        st.escudo = 0; st.inv = 1.2;
        if (!EM.headless && Game.st === st) { UI.gmsg('🛡️ ¡El escudo absorbió el golpe!', 'y'); Snd.play('door'); }
        continue;
      }
      if (o.k === 'charco') {
        st.v *= .65; st.combo = 0;
        if (!EM.headless && Game.st === st) { UI.gmsg('💦 ¡Charco! Pierdes impulso', 'y'); Snd.play('brake'); }
      } else {
        st.hits++; st.combo = 0; st.v = Math.max(4, st.v * .45); st.inv = 1.4;
        if (!EM.headless && Game.st === st) { UI.gmsg('💥 ¡Cuidado con ' + (o.k === 'hueco' ? 'el hueco' : o.k === 'perro' ? 'el perrito' : o.k === 'chaza' ? 'el puesto' : o.k === 'valla' ? 'la valla' : o.k === 'moto' ? 'la moto' : 'el cono') + '!', 'r'); Snd.play('crash'); vib(90); }
      }
    }

    // metas parciales en cada estación del corredor
    const cp = st.checkpoints[st.ci];
    if (cp && st.s >= cp.s) {
      st.ci++; st.score += 80;
      const f = NET.fact(cp.name);
      if (!EM.headless && Game.st === st) {
        UI.gmsg('🚉 Meta parcial: ' + cp.name + ' · +80 pts', 'g');
        if (f) { st.datoMsg = ['Estación ' + cp.name, f]; st.datoT = 5.5; }
        Snd.play('bell');
      }
    }

    if (st.s >= st.s1) { st.done = true; st.win = true; }
  },
  result(st) {
    const stars = st.win ? (st.hits === 0 ? 3 : st.hits <= 2 ? 2 : 1) : 0;
    return {
      done: st.done, win: st.win, score: Math.round(st.score), stars,
      title: st.win ? '¡Corredor completado!' : 'Fin del recorrido',
      lines: [
        ['Vehículo', this.V(st).ico + ' ' + this.V(st).n],
        ['Pasajes recogidos', st.coins + ' 🎫'],
        ['Datos del valle', st.datos + ' 💡'],
        ['Tropiezos', String(st.hits)]
      ]
    };
  },
  hud(st) {
    const V = this.V(st), pct = Math.round(clamp((st.s - st.s0) / st.len, 0, 1) * 100);
    const r = [
      [V.ico, Math.round(st.v * 3.6) + ' km/h'],
      ['🎫', String(st.coins)],
      ['🏁', pct + '%'],
      ['★', fmt(Math.round(st.score))]
    ];
    if (st.escudo > 0) r.push(['🛡️', 'OK']);
    if (st.turbo > 0) r.push(['⚡', Math.ceil(st.turbo) + 's']);
    if (st.iman > 0) r.push(['🧲', Math.ceil(st.iman) + 's']);
    return r;
  },
  mount(st, el) {
    const V = this.V(st);
    el.innerHTML = `<div class="lbbtns" style="left:12px;right:12px;display:flex;justify-content:space-between;pointer-events:none">
      <div style="display:flex;gap:8px;pointer-events:auto">
        <button class="abtn" id="crL" aria-label="Carril izquierdo">◀</button>
        <button class="abtn" id="crR" aria-label="Carril derecho">▶</button>
      </div>
      <div style="display:flex;gap:8px;pointer-events:auto">
        <button class="abtn" id="crD" aria-label="Agacharse">▼</button>
        <button class="abtn big" id="crU" aria-label="Saltar">▲<small>saltar</small></button>
      </div>
    </div>
    <div class="vsel"><button id="crVeh" title="Cambiar vehículo (V)">${V.ico}<small>${esc(V.n.split(' ')[0])}</small></button><button id="crView" title="Cambiar vista: 3ª persona, 1ª persona o 2D">👁<small id="crViewN">${st.view === 'cab' ? '1ª' : st.view === '2d' ? '2D' : '3D'}</small></button></div>`;
    $('#crL').onclick = () => this.laneCmd(st, -1);
    $('#crR').onclick = () => this.laneCmd(st, 1);
    $('#crU').onclick = () => this.jumpCmd(st);
    $('#crD').onclick = () => this.duckCmd(st);
    $('#crVeh').onclick = () => this.cambiarVeh(st, 1);
    $('#crView').onclick = () => {
      const vs = ['3p', 'cab', '2d'], nx = vs[(vs.indexOf(st.view) + 1) % vs.length];
      st.view = nx; Save.d.settings.vistaCr = nx; Save.write();
      $('#crViewN').textContent = nx === 'cab' ? '1ª' : nx === '2d' ? '2D' : '3D';
      UI.gmsg(nx === 'cab' ? '🥽 Vista 1ª persona (manubrio)' : nx === '2d' ? '🗺 Vista 2D' : '🎮 Vista 3ª persona', 'b');
    };
    const cv = $('#gcv');
    if (cv) {
      let sx = 0, sy = 0, down = false;
      const pd = e => { sx = e.clientX; sy = e.clientY; down = true; };
      const pu = e => {
        if (!down) return; down = false;
        const dx = e.clientX - sx, dy = e.clientY - sy;
        if (Math.hypot(dx, dy) < 18) return;
        if (Math.abs(dx) > Math.abs(dy)) this.laneCmd(st, dx < 0 ? -1 : 1);
        else if (dy < 0) this.jumpCmd(st); else this.duckCmd(st);
      };
      cv.addEventListener('pointerdown', pd); cv.addEventListener('pointerup', pu);
      this._un = () => { cv.removeEventListener('pointerdown', pd); cv.removeEventListener('pointerup', pu); };
    }
  },
  unmount() { if (this._un) { this._un(); this._un = null; } },
  key(st, k, down) {
    if (!down) return;
    if (k === 'ArrowLeft' || k === 'a' || k === 'A') this.laneCmd(st, -1);
    else if (k === 'ArrowRight' || k === 'd' || k === 'D') this.laneCmd(st, 1);
    else if (k === 'ArrowUp' || k === 'w' || k === 'W' || k === ' ') this.jumpCmd(st);
    else if (k === 'ArrowDown' || k === 's' || k === 'S') this.duckCmd(st);
    else if (k === 'v' || k === 'V' || k === 'c' || k === 'C') this.cambiarVeh(st, 1);
  },
  draw(g, st, vp) {
    if (this.gl(st)) { G3.show(true); this.draw3D(g, st, vp); return; } else if (G3.cv) G3.show(false);
    this.draw2D(g, st, vp);
  },
  draw3D(g, st, vp) {
    const W = vp.w, H = vp.h, V = this.V(st), z0 = MAP.elevM(st.x, st.y), z = z0 + st.z, c = Math.cos(st.a), s = Math.sin(st.a);
    const cab = st.view === 'cab', eyeH = (st.duck > 0 ? .95 : 1.55);
    const cam = cab
      ? { eye: [st.x + c * .25, z + eyeH, st.y + s * .25], at: [st.x + c * 18, z + eyeH - .45, st.y + s * 18], fov: 1.05 }
      : { eye: [st.x - c * 6.5, Math.max(z + 3.1, MAP.elevM(st.x - c * 6.5, st.y - s * 6.5) + 1.8), st.y - s * 6.5], at: [st.x + c * 9, z + 1.1, st.y + s * 9], fov: .98 };
    G3.draw(cam, {
      hour: Mundo.hour(), rain: Mundo.weather().rain, escala: Game.dpr && Game.dpr < 1.5 ? .75 : .9, suave: true, cerca: 1.5,
      dyn: G => {
        // pista de 3 carriles sobre el corredor real
        for (let ds = -6; ds <= 72; ds += 6) {
          const q = NET.at(st.line.P, st.s + ds), nx = -Math.sin(q.a), ny = Math.cos(q.a), qx = q.x + nx * 6.5, qy = q.y + ny * 6.5, qz = MAP.elevM(qx, qy);
          G.box(qx, qz + .02, qy, q.a, 5.8, 7.6, .05, [.2, .23, .27]);
          G.box(qx - nx * 1.2, qz + .05, qy - ny * 1.2, q.a, 2.6, .1, .04, [.92, .88, .72]);
          G.box(qx + nx * 1.2, qz + .05, qy + ny * 1.2, q.a, 2.6, .1, .04, [.92, .88, .72]);
          G.box(qx - nx * 3.7, qz + .06, qy - ny * 3.7, q.a, 5.8, .18, .08, [.18, .62, .34]);
          G.box(qx + nx * 3.7, qz + .06, qy + ny * 3.7, q.a, 5.8, .18, .08, [.18, .62, .34]);
        }
        // obstáculos
        for (const o of st.obs) {
          if (o.hit === 1 || o.s < st.s - 8 || o.s > st.s + 85) continue;
          const q = NET.at(st.line.P, o.s), nx = -Math.sin(q.a), ny = Math.cos(q.a), ox = q.x + nx * (6.5 + o.lane * 2.4), oy = q.y + ny * (6.5 + o.lane * 2.4), oz = MAP.elevM(ox, oy);
          if (o.k === 'hueco') G.box(ox, oz + .04, oy, q.a, 1.5, 1.5, .08, [.06, .06, .08]);
          else if (o.k === 'charco') G.box(ox, oz + .05, oy, q.a, 2.1, 1.7, .05, [.28, .55, .78]);
          else if (o.k === 'cono') { G.box(ox, oz + .06, oy, q.a, .55, .55, .75, [.95, .42, .12]); G.box(ox, oz + .38, oy, q.a, .42, .42, .16, [.95, .95, .95]); }
          else if (o.k === 'perro') { G.box(ox, oz + .15, oy, q.a + .5, .75, .32, .38, [.58, .38, .22]); G.box(ox + Math.cos(q.a + .5) * .35, oz + .42, oy + Math.sin(q.a + .5) * .35, q.a + .5, .28, .26, .26, [.58, .38, .22]); }
          else if (o.k === 'chaza') { G.box(ox, oz + .1, oy, q.a, 1.5, 1.3, 1.1, [.82, .26, .22]); G.box(ox, oz + 1.85, oy, q.a, 1.9, 1.8, .22, [.96, .77, .22]); G.box(ox, oz + 1.1, oy, q.a, .12, .12, .8, [.2, .2, .22]); }
          else if (o.k === 'valla') { G.box(ox, oz + 1.25, oy, q.a, .45, 2.1, .65, [.92, .72, .14]); G.box(ox - nx * .95, oz + .06, oy - ny * .95, q.a, .15, .15, 1.3, [.3, .32, .36]); G.box(ox + nx * .95, oz + .06, oy + ny * .95, q.a, .15, .15, 1.3, [.3, .32, .36]); }
          else if (o.k === 'moto') G3.vehicle(ox, oz + .06, oy, q.a, 2, 'moto', [.88, .22, .24]);
        }
        // recolectables
        for (const it of st.items) {
          if (it.got || it.s < st.s - 5 || it.s > st.s + 75) continue;
          const q = NET.at(st.line.P, it.s), nx = -Math.sin(q.a), ny = Math.cos(q.a), ix = q.x + nx * (6.5 + it.lane * 2.4), iy = q.y + ny * (6.5 + it.lane * 2.4), iz = MAP.elevM(ix, iy) + .55 + Math.sin(st.t * 5 + it.s) * .12;
          const col = it.k === 'pasaje' ? [.18, .72, .38] : it.k === 'dato' ? [.98, .82, .2] : it.k === 'turbo' ? [.25, .78, .98] : it.k === 'iman' ? [.92, .28, .35] : [.55, .42, .95];
          G.box(ix, iz, iy, st.t * 2.4 + it.s, .45, .45, .45, col);
        }
        // jugador en 3ª persona
        if (!cab) {
          const col = Libre.rgb3(V.col), sc = st.duck > 0 ? .72 : 1;
          G3.vehicle(st.x, z + .05, st.y, st.a + st.tilt, V.id === 'bici' ? 1.75 : V.id === 'patines' ? .6 : 1.15, V.id, col);
          Libre.persona3(G, st.x, z + (V.id === 'bici' ? .55 : .22), st.y, st.a + st.tilt, typeof Perfil !== 'undefined' ? Perfil.ped() : { col: '#1C5C9C' }, sc, st.t * 11);
          if (st.escudo > 0) G.box(st.x, z + 1.95, st.y, st.t * 3, .5, .5, .15, [.35, .75, .98]);
        }
      }
    });
    if (cab) this.drawCabina(g, st, W, H, V);
    this.drawBanner(g, st, W, H);
  },
  /* Primera persona: manubrio, manos del jugador, velocímetro y timbre sobre la vista 3D */
  drawCabina(g, st, W, H, V) {
    const bob = Math.sin(st.t * 11) * (st.z > .1 ? 1 : 5), tx = st.tilt * W * .22, cy = H * .84 + bob + (st.duck > 0 ? H * .07 : 0);
    const yo = typeof Perfil !== 'undefined' ? Perfil.ped() : { skin: '#e8b98f', col: '#1C5C9C' };
    g.save(); g.translate(W / 2 + tx, cy); g.rotate(-st.tilt * .65);
    if (V.id === 'skate' || V.id === 'patines') {
      // nariz de la tabla o punta de los patines abajo y manos equilibrando a los lados
      g.fillStyle = V.col; Spr.rr(g, -W * .07, H * .04, W * .14, H * .16, 18);
      g.fillStyle = '#22252a'; Spr.rr(g, -W * .055, H * .055, W * .11, H * .14, 14);
      for (const s of [-1, 1]) {
        g.fillStyle = yo.col || '#1C5C9C'; Spr.rr(g, s * W * .26 - 24, -10, 48, 90, 14);
        g.fillStyle = yo.skin || '#e8b98f'; g.beginPath(); g.arc(s * W * .26, -16, 20, 0, TAU); g.fill();
      }
    } else {
      // columna de dirección, manubrio, puños, manos del jugador y pantalla/timbre
      const bw = Math.min(W * .64, 420);
      g.fillStyle = '#1b1f26'; g.fillRect(-14, 0, 28, H * .22);
      g.fillStyle = V.id === 'bici' ? '#2c323c' : '#242933'; Spr.rr(g, -bw / 2, -14, bw, 22, 10);
      g.fillStyle = V.col; g.fillRect(-bw * .18, -11, bw * .36, 16);
      // puños de caucho y frenos
      g.fillStyle = '#121417'; Spr.rr(g, -bw / 2 - 8, -18, 68, 30, 10); Spr.rr(g, bw / 2 - 60, -18, 68, 30, 10);
      g.strokeStyle = '#9aa2ad'; g.lineWidth = 4; g.beginPath(); g.moveTo(-bw / 2 + 12, -18); g.lineTo(-bw / 2 + 52, -32); g.moveTo(bw / 2 - 12, -18); g.lineTo(bw / 2 - 52, -32); g.stroke();
      // brazos y manos
      for (const s of [-1, 1]) {
        const hx = s * (bw / 2 - 26);
        g.fillStyle = yo.col || '#1C5C9C'; g.beginPath(); g.moveTo(hx - 20, 18); g.lineTo(hx + 20, 18); g.lineTo(hx + s * 45, H * .22); g.lineTo(hx + s * 5, H * .22); g.closePath(); g.fill();
        g.fillStyle = yo.skin || '#e8b98f'; Spr.rr(g, hx - 18, -20, 36, 34, 10);
      }
      // velocímetro digital (monopatín eléctrico) o timbre y canasta (bici EnCicla)
      if (V.id === 'bici') {
        g.strokeStyle = '#0e2d55'; g.lineWidth = 3; g.strokeRect(-55, -58, 110, 44);
        g.fillStyle = '#d4a017'; g.beginPath(); g.arc(-bw * .22, -24, 12, 0, TAU); g.fill();
      } else {
        g.fillStyle = '#0f1722'; Spr.rr(g, -38, -44, 76, 36, 8);
        g.fillStyle = '#5eead4'; g.font = '800 16px Cuerpo, sans-serif'; g.textAlign = 'center';
        g.fillText(Math.round(st.v * 3.6) + ' km/h', 0, -21);
      }
    }
    g.restore();
  },
  draw2D(g, st, vp) {
    const W = vp.w, H = vp.h, V = this.V(st);
    g.fillStyle = '#2d4a34'; g.fillRect(0, 0, W, H);
    const rw = Math.min(W * .66, 360), rx = (W - rw) / 2, lw = rw / 3;
    g.fillStyle = '#2b3038'; g.fillRect(rx, 0, rw, H);
    g.fillStyle = '#2f9b57'; g.fillRect(rx - 8, 0, 8, H); g.fillRect(rx + rw, 0, 8, H);
    g.fillStyle = 'rgba(255,248,220,.55)';
    const offY = (st.s * 18) % 48;
    for (let y = -48 + offY; y < H; y += 48) {
      g.fillRect(rx + lw - 2, y, 4, 24); g.fillRect(rx + lw * 2 - 2, y, 4, 24);
    }
    const Y = s => H * .78 - (s - st.s) * 14, X = l => W / 2 + l * lw;
    for (const it of st.items) {
      if (it.got || it.s < st.s - 4 || it.s > st.s + 45) continue;
      const x = X(it.lane), y = Y(it.s);
      g.fillStyle = it.k === 'pasaje' ? '#59AB42' : it.k === 'dato' ? '#F6C538' : '#29b6f6';
      g.beginPath(); g.arc(x, y, 9, 0, TAU); g.fill();
    }
    for (const o of st.obs) {
      if (o.hit === 1 || o.s < st.s - 4 || o.s > st.s + 45) continue;
      const x = X(o.lane), y = Y(o.s);
      g.fillStyle = o.k === 'hueco' ? '#111' : o.k === 'charco' ? '#3b82f6' : o.k === 'valla' ? '#eab308' : '#ef4444';
      g.fillRect(x - lw * .34, y - 10, lw * .68, 20);
    }
    const px = W / 2 + (st.laneX / 2.4) * lw, py = H * .78 - st.z * 14;
    g.save(); g.translate(px, py); g.rotate(-Math.PI / 2 + st.tilt);
    Spr.veh(g, V.id, 34, 18, V.col);
    g.restore();
    this.drawBanner(g, st, W, H);
  },
  drawBanner(g, st, W, H) {
    if (st.datoT <= 0 || !st.datoMsg) return;
    const a = clamp(st.datoT, 0, 1), bw = Math.min(W - 24, 520), bx = (W - bw) / 2, by = 58;
    g.save(); g.globalAlpha = a * .94;
    g.fillStyle = '#0f2238'; Spr.rr(g, bx, by, bw, 54, 12);
    g.fillStyle = '#F6C538'; g.fillRect(bx, by, 6, 54);
    g.font = '800 12px Cuerpo, sans-serif'; g.fillText('💡 ' + st.datoMsg[0].toUpperCase(), bx + 14, by + 18);
    g.fillStyle = '#f4f1ea'; g.font = '600 12px Cuerpo, sans-serif';
    g.fillText(st.datoMsg[1].slice(0, 72), bx + 14, by + 38);
    g.restore();
  },
  ai(st) {
    const near = st.obs.find(o => !o.hit && o.s > st.s - .5 && o.s < st.s + 22 && o.lane === st.lane);
    if (near) {
      if ((near.k === 'hueco' || near.k === 'cono' || near.k === 'charco') && st.z === 0 && near.s - st.s < 9) { this.jumpCmd(st); return; }
      if (near.k === 'valla' && near.s - st.s < 9) { this.duckCmd(st); return; }
      const free = [-1, 0, 1].filter(l => l !== st.lane && !st.obs.some(o => !o.hit && o.lane === l && Math.abs(o.s - near.s) < 12));
      if (free.length) {
        free.sort((a, b) => Math.abs(a - st.lane) - Math.abs(b - st.lane));
        this.laneCmd(st, Math.sign(free[0] - st.lane)); return;
      }
      this.jumpCmd(st); return;
    }
    const prize = st.items.find(it => !it.got && it.s > st.s + 2 && it.s < st.s + 18 && it.lane !== st.lane);
    if (prize && !st.obs.some(o => !o.hit && o.lane === prize.lane && o.s > st.s - 2 && o.s < prize.s + 10)) {
      this.laneCmd(st, Math.sign(prize.lane - st.lane));
    }
  }
};
