/* =====================================================================
   ARCADE Y TODO ABIERTO (3.2 «Evolución», Claude, 22‑nov‑2026)
   Pedido del autor: «aún hay muchos [modos] donde todo está roto y es injugable, los vehículos no se mueven, van muy
   lento, los controles son engorrosos» y «todo desbloqueado desde el principio: debo probar todo antes de pulir la trama».
   La auditoría con entradas de jugador (docs/EVOLUCION-EL-METRO-CLAUDE.md) midió:
   - Metro y Tranvía: con la palanca arriba 12 s el tren no salía (pedía llave, sentido y señal; la escuela aparecía sola).
   - Al volante: el bus no se movía (chocaba contra las casillas viejas de 20 m) y el juego corría al 62 % del tiempo real.
   - Bus: de 0 a 40 km/h en 12 s.
   - Carrera: al 65 % del tiempo real, con 0,12 m/s² de aceleración (de 29 a 72 km/h en 100 s); junto a Niquía la pista
     pasaba por dentro de los edificios y la cámara quedaba encerrada.
   Arreglos (módulo aditivo: envuelve sin reescribir los modos):
   1. Tiempo real en todos los modos: pasos de 1/30 s hasta 0,12 s por cuadro (antes, tope de 50 ms por cuadro).
   2. Arcade (por defecto; Ajustes → «Manejo de los modos»): en el metro y el tranvía la cabina queda lista (llave y
      ADELANTE), la señal sale casi enseguida, no hay vigilante, las puertas abren y cierran solas del lado del andén, el
      abordaje dura la mitad y la aceleración y el freno son 1,8 veces los reales. En los buses, puertas solas y el doble
      de aceleración. «Realista» deja el procedimiento completo; la Escuela de conducción siempre lo enseña.
   3. Carrera: sale a 43 km/h en 2 s y sube hasta el tope del vehículo; la pista se corre al lado libre de la vía.
   4. Todo abierto: niveles de todos los modos, capítulos de la historia clásica y de «La última vuelta» en la ciudad.
   5. ⏫ Acelerador fijo en Ciudad Libre (como Motor City 4.6.1): acelera solo y el joystick solo da la dirección.
   ===================================================================== */
(function () {
  const S = () => (Save.d && Save.d.settings) || {}, arcade = () => S().arcade !== 0;

  /* ---------- 1 · tiempo real en todos los modos ---------- */
  for (const id in EM.modes) { const M = EM.modes[id]; if (M && !M.substeps) M.substeps = true; }

  /* ---------- 2 · metro y tranvía en arcade ---------- */
  const C = EM.modes.conduce;
  if (C) {
    const KA = {}, arcK = kd => KA[kd] || (KA[kd] = Object.assign({}, KIND[kd], { acc: KIND[kd].acc * 1.8, brk: KIND[kd].brk * 1.8, emg: KIND[kd].emg * 1.3 }));
    const create0 = C.create, tick0 = C.tick, doors0 = C.doors, mount0 = C.mount;
    C.create = function (lv, opts = {}) {
      const st = create0.call(this, lv, opts), escuela = String(lv || '').endsWith('#escuela');
      st.arcade = arcade() && !escuela && !opts.auto ? 1 : 0;
      if (st.arcade) { st.key = true; st.sel = 1; st.sigOK = true; st.tut = -1; }
      return st;
    };
    C.tick = function (st, dt, K, line) {
      if (st.arcade !== 1) return tick0.call(this, st, dt, K, line);
      st.key = true; if (st.sel === 0) st.sel = 1; st.vigAlarm = false; st.vigNext = 30;
      if (st.ph === 'ready') st.sigOK = true; else if (st.ph === 'dwell' && st.doors === 2 && !st.sigOK) st.sigT += dt * 3;
      const kd = st.kind, k0 = KIND[kd], ka = arcK(kd); KIND[kd] = ka;
      try { tick0.call(this, st, dt, ka, line); } finally { KIND[kd] = k0; }
      if (st.ph === 'dwell' && !st.done && !st.trivia) {   // puertas solas, del lado del andén
        if (st.doors === 0 && !st.opened && st.dwell > .35) { this.doors(st); if (st.doors === 1) st.bTime = Math.max(2.5, st.bTime * .5); }
        else if (st.doors === 1 && st.board >= 1 && st.bellDone) { st._cz = (st._cz || 0) + dt; if (st._cz > .5) { st._cz = 0; this.doors(st); } }
      }
    };
    C.doors = function (st, side) { return doors0.call(this, st, st.arcade === 1 ? undefined : side); };
    C.mount = function (st, el) {
      const r = mount0.apply(this, arguments);
      if (st.arcade === 1) for (const id of ['cbKey', 'cbSel', 'cbVig']) { const b = document.getElementById(id); if (b) b.style.display = 'none'; }
      return r;
    };
  }

  /* ---------- buses: puertas solas y más aceleración en arcade ---------- */
  const VA = {}, rapido = kd => VA[kd] || (VA[kd] = Object.assign({}, VEH[kd], { acc: VEH[kd].acc * 2, brk: VEH[kd].brk * 1.4 }));
  const B = EM.modes.bus;
  if (B) {
    const step0 = B.step;
    B.step = function (st, dt) {
      const kd = st.veh && st.veh.kind; if (st.auto || !arcade() || !VEH[kd]) return step0.call(this, st, dt);
      const v0 = VEH[kd]; VEH[kd] = rapido(kd);
      try { step0.call(this, st, dt); } finally { VEH[kd] = v0; }
      if (st.ph !== 'stop' || st.done) return;
      const W = st.waiting[st.ni] || [], quedan = W.filter(p => !p.gone).length;
      if (st.doors === 0 && st.dwell > .5) this.doors(st);
      else if (st.doors === 1 && !quedan && st.alight <= 0) { st._cz = (st._cz || 0) + dt; if (st._cz > .6) { st._cz = 0; this.doors(st); } }
    };
  }
  const Vo = EM.modes.volante;
  if (Vo) {
    const dw0 = Vo.dwellTick;
    Vo.dwellTick = function (st, dt, line) {
      dw0.call(this, st, dt, line); if (st.auto || !arcade() || st.ph !== 'dwell' || st.done) return;
      if (st.doors === 0 && st.dwell > .4) this.doors(st);
      else if (st.doors === 1 && st.board >= 1) { st._cz = (st._cz || 0) + dt; if (st._cz > .5) { st._cz = 0; this.doors(st); } }
    };
  }

  /* ---------- 3 · carrera: arranque vivo y pista por el lado libre ---------- */
  const Cr = EM.modes.carrera;
  if (Cr) {
    const step0 = Cr.step, PASO = 12;
    Cr.step = function (st, dt) {
      step0.call(this, st, dt); if (st.done) return;
      const top = this.V(st).spd * (st.turbo > 0 ? 1.3 : 1);
      if (st.v < 12 && st.inv <= 0) st.v = Math.min(12, st.v + 2.6 * dt); else if (st.v < top) st.v = Math.min(top, st.v + .14 * dt);
    };
    Cr.step._arranqueVivo = true;   // 98a (GPT-6) lo lee para no sumar un segundo arranque
    /* el corrimiento lateral libre de edificios cada 12 m: primero el de la muestra anterior (para no saltar de lado), luego los demás */
    Cr.libreOff = function (st, s, prev) {
      const l = NET.byId[st.line], b = st.off, C0 = [prev, b, b - 4, b + 4, b + 8, -b, -b + 4, -b - 4, b - 8, b + 12, -b - 8];
      const vistos = new Set(); for (const o of C0) { if (vistos.has(o)) continue; vistos.add(o); let ok = true; for (const c of [-2.6, 0, 2.6]) { const q = NET.at(l.P, clamp(s, 0, l.P.len), o + c); if (VC.solid(q.x, q.y, .5)) { ok = false; break; } } if (ok) return o; }
      return prev;
    };
    Cr.offAt = function (st, s) {
      if (!VC.on || st.auto) return st.off;
      const T = st._offT || (st._offT = []), i = Math.max(0, Math.floor(s / PASO));
      while (T.length <= i + 1) T.push(this.libreOff(st, T.length * PASO, T.length ? T[T.length - 1] : st.off));
      const f = s / PASO - i; return T[i] + (T[i + 1] - T[i]) * clamp(f, 0, 1);
    };
    Cr.pos = function (st, s, c) { const l = NET.byId[st.line]; return NET.at(l.P, clamp(s, 0, l.P.len), this.offAt(st, s) + (c - 1) * 2.6); };
  }

  /* ---------- 5 · ⏫ acelerador fijo en Ciudad Libre ---------- */
  const L = EM.modes.libre;
  if (L) {
    /* y el arranque más vivo, como el del motor (taxi al 90 % en 2,7 s): segundos hasta la punta y para frenar */
    if (L.ARC) { L.ARC.carro = [3, 1.45, .13, 3.8, 2.0, .06]; L.ARC.moto = [4.2, 2.2, .1, 3.2, 1.8, .1]; L.ARC.bus = [1.9, .85, .2, 6.5, 2.8, .05]; }
    const da0 = L.driveArcade, mount0 = L.mount, upd0 = L.updCtl, key0 = L.key;
    L.driveArcade = function (st, dt) {
      if (!st.crucero || st.mode !== 'veh' || st.auto) return da0.call(this, st, dt);
      const k = st.keys, j = st.joy, up = k.up, m = j.m;
      if (!k.down && !st.hb) { if (j.m > .15) j.m = 1; else k.up = true; }   // ▼ o el freno de mano frenan mientras se sostienen
      try { return da0.call(this, st, dt); } finally { k.up = up; j.m = m; }
    };
    L.crucero = function (st, on) {
      st.crucero = on == null ? !st.crucero : !!on; const b = document.getElementById('lbCru'); if (b) b.classList.toggle('on', st.crucero);
      this.msg(st, st.crucero ? '⏫ Acelerador fijo: acelera solo y el joystick solo da la dirección. ▼ o ✋ frenan mientras los sostienes' : 'Acelerador normal', 'b');
    };
    L.mount = function (st, el) {
      const r = mount0.apply(this, arguments), box = el && el.querySelector('.lbbtns');
      if (box && !document.getElementById('lbCru')) { const b = document.createElement('button'); b.className = 'abtn cru'; b.id = 'lbCru'; b.setAttribute('aria-label', 'Acelerador fijo'); b.innerHTML = '⏫<small>fijo</small>'; b.onclick = () => this.crucero(st); box.appendChild(b); }
      this.updCtl(st); return r;
    };
    L.updCtl = function (st) {
      const r = upd0.apply(this, arguments), b = document.getElementById('lbCru');
      if (b) { const veh = st.mode === 'veh' && !((this.V(st) || {}).walk); b.style.display = veh ? '' : 'none'; if (!veh) st.crucero = false; b.classList.toggle('on', !!st.crucero); }
      return r;
    };
    L.key = function (st, k, down) { if (down && (k === 'x' || k === 'X') && st.mode === 'veh') { this.crucero(st); return; } return key0.call(this, st, k, down); };
    /* las charlas ya no amarran: si caminas o manejas, la charla se cierra y sigues (antes el joystick quedaba muerto hasta
       tocar la ✕); y la primera crónica espera 25 s, para que al empezar en una estación no salte encima del juego */
    const step0 = L.step;
    L.step = function (st, dt) {
      if (st._crEspera == null) st._crEspera = 25;
      const k = st.keys || {}; if (st.charla && !st.auto && ((st.joy && st.joy.m > .35) || k.up || k.down || k.left || k.right) && typeof Gente !== 'undefined') Gente.cerrar(st);
      return step0.apply(this, arguments);
    };
  }

  /* ---------- 4 · todo abierto desde el principio + el ajuste de manejo ---------- */
  if (typeof Menu === 'undefined') return;
  const abre = () => { for (const b of document.querySelectorAll('#lBody .lock')) b.classList.remove('lock'); };
  const fila = (id) => {
    const body = document.getElementById('lBody'); if (!body || document.getElementById('lArc')) return;
    const d = document.createElement('div'); d.id = 'lArc'; d.className = 'boxed'; d.style.marginBottom = '12px';
    const pinta = () => { const a = arcade(); d.innerHTML = `<div class="pag" style="font-size:12px">Manejo de los modos</div><div class="tg" style="margin-top:6px"><button data-v="1" class="${a ? 'on' : ''}">🎮 Arcade</button><button data-v="0" class="${a ? '' : 'on'}">🎓 Realista</button></div><p class="m" style="margin:6px 0 0;font-size:12.5px">${a ? (id === 'conduce' || id === 'tranvia' ? 'Cabina lista, señal enseguida, puertas solas del lado del andén y más aceleración. Solo manejas y frenas en la marca.' : 'Puertas solas en cada parada y más aceleración: solo manejas y paras donde está la gente.') : (id === 'conduce' || id === 'tranvia' ? 'Procedimiento real: llave, sentido, señal de salida, vigilante y puertas por lado.' : 'Abres y cierras las puertas tú, con la aceleración real del bus.')}</p>`;
      for (const b of d.querySelectorAll('[data-v]')) b.onclick = () => { Save.d.settings.arcade = +b.dataset.v; Save.write(); pinta(); }; };
    pinta(); body.prepend(d);
  };
  const lv0 = Menu.levels;
  Menu.levels = function (id) { const r = lv0.apply(this, arguments); abre(); if (['conduce', 'tranvia', 'volante', 'bus'].includes(id)) fila(id); return r; };
  const sl0 = Menu.storyList;
  if (sl0) Menu.storyList = function () {
    const r = sl0.apply(this, arguments); abre();
    for (const b of document.querySelectorAll('#lBody [data-c]')) { const sp = b.lastElementChild; if (sp && sp.textContent === '🔒') sp.textContent = '▶'; b.onclick = () => { if (typeof Story !== 'undefined') Story.open(+b.dataset.c); }; }
    /* «La última vuelta» en la ciudad: cualquier capítulo, empezando donde comienza */
    const city = document.getElementById('stCity'); if (city && typeof TRAMA !== 'undefined' && typeof Trama !== 'undefined' && !document.getElementById('stCaps')) {
      const w = document.createElement('div'); w.id = 'stCaps'; w.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;margin-top:10px';
      w.innerHTML = '<div class="pag" style="font-size:12px;width:100%">O empieza en cualquier capítulo</div>' + TRAMA.map((C, i) => `<button class="btn sm" data-tc="${i}" title="${esc(C.t)}">${i + 1}. ${esc(C.t.length > 22 ? C.t.slice(0, 21) + '…' : C.t)}</button>`).join('');
      city.closest('.boxed').appendChild(w);
      for (const b of w.querySelectorAll('[data-tc]')) b.onclick = () => { const i = +b.dataset.tc, S0 = TRAMA[i].steps[0]; Save.d.trama = { c: i, s: 0, fin: 0, started: 1 }; if (S0 && S0.at) Trama.place(S0.at, S0.line); Save.write(); Snd.init(); Game.start('libre', 'lb:trama', {}); };
    }
    return r;
  };
})();
