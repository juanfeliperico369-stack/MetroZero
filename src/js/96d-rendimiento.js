/* =====================================================================
   RENDIMIENTO DEL 3D (3.6 «Ciudad viva», Claude, 23‑nov‑2026) · que el mundo 3D no ahogue a los celulares modestos
   Medido en la auditoría de la 3.5.0 (Chromium sin tarjeta gráfica, el peor caso del proyecto): con el sombreado realista y la
   resolución 3D nueva (0,82), el volante bajó de 13 a 5 cuadros por segundo, la carrera de 14 a 4,5 y Ciudad Libre, que ahora abre
   en 3D cenital, a 6,5 (y el juego iba en cámara lenta: ritmo 0,53–0,76).
   - Regulador automático (Ajustes → «Calidad 3D: automática»): mientras se dibuja 3D mira el tiempo de cada cuadro; si pasa de
     45 ms (≈ 22 cuadros por segundo) durante 1,2 s baja un escalón y si baja de 26 ms durante 5 s sube uno.
     Escalones: 0 · todo · 1 · sin el sombreado realista · 2 · resolución ×0,75 · 3 · ×0,58 y ciudad cercana liviana (menos edificios
     a lo lejos) · 4 · ×0,45. En el último, Ciudad Libre pasa sola a la vista 2D una vez y lo dice.
   - 📏 «Medir mi celular» (idea de Motor City 5.2, `?medir`): mide 3 s el 2D y 3 s el 3D en San Antonio y deja la calidad que sirve.
   - Tiempo real hasta 5 cuadros por segundo: en 25-game.js los pasos de 1/30 s llegan ahora hasta 0,2 s por cuadro (antes 0,12).
   ===================================================================== */
(function () {
  if (typeof G3 === 'undefined' || !G3.draw || typeof Game === 'undefined') return;
  const ESC = [[1, 1], [0, 1], [0, .75], [0, .58], [0, .45]], NOMBRE = ['alta', 'sin realismo', 'media', 'baja', 'mínima'];
  const S = () => (Save.d && Save.d.settings) || {};
  const R = EM.rendimiento = {
    nivel: 0, malo: 0, bueno: 0, ultimo: 0,
    auto() { const c = S().cal3d; return c == null || c === 'auto'; },
    /* una vez por cuadro con 3D: sube o baja el escalón según el tiempo real de los cuadros (Game.ft) */
    paso(t, ft) {
      if (!this.auto()) { this.nivel = clamp(+S().cal3d | 0, 0, ESC.length - 1); return; }
      const dt = t - (this.ultimo || t); this.ultimo = t; if (dt <= 0 || dt > .5 || !ft) return;
      if (ft > .045) { this.malo += dt; this.bueno = 0; if (this.malo > 1.2 && this.nivel < ESC.length - 1) { this.nivel++; this.malo = 0; this.cambio(); } }
      else if (ft < .026) { this.bueno += dt; this.malo = 0; if (this.bueno > 5 && this.nivel > 0) { this.nivel--; this.bueno = 0; } }
      else { this.malo = Math.max(0, this.malo - dt); this.bueno = 0; }
    },
    cambio() {
      if (this.nivel < ESC.length - 1 || this._2d) return; const L = EM.modes.libre, st = Game.st;
      if (Game.mode === L && st && st.vista3 && L.vista) { this._2d = 1; L.vista(st, '2d'); L.msg(st, '📏 Tu celular va justo con el 3D: te dejé la vista desde arriba (cámbiala con 👁)', 'y'); }
    },
    simple() { return !ESC[this.nivel][0]; },
    /* desde el escalón 3, la ventana 3D cercana se arma como en «Celular modesto» (edificios reales hasta 380 m en vez de 700 y
       siluetas hasta 600 m en vez de 1100): medido, cada cuadro dibujaba 1,5 millones de vértices. Al cruzar el umbral se rearma una vez */
    liviano() { const l = this.nivel >= 3; if (!!G3.liviano !== l) { G3.liviano = l; G3.win = null; } },
    factor() { return ESC[this.nivel][1]; },
    /* 📏 medir: 3 s en 2D y 3 s en 3D cenital, en San Antonio; deja el escalón que sirve y lo cuenta */
    async medir() {
      const L = EM.modes.libre; if (!L) return; Snd.init(); UI.modal('<div class="pag">📏 Medir mi celular</div><h2>Midiendo…</h2><p class="m">Unos segundos en 2D y en 3D. No toques la pantalla.</p>');
      const cuenta = ms => new Promise(res => { let n = 0; const t0 = performance.now(), f = () => { n++; if (performance.now() - t0 < ms) requestAnimationFrame(f); else res(n * 1000 / (performance.now() - t0)); }; requestAnimationFrame(f); });
      const s = S(), antes = { v: s.vistaL, c: s.cal3d }; UI.close(); Game.start('libre', 'lb:San Antonio', { back: 'cover' });
      L.vista(Game.st, '2d'); await cuenta(800); const f2 = await cuenta(3000);
      let f3 = 0; if (!(s.q === 'low') && G3.init()) { s.cal3d = 0; this.nivel = 0; L.vista(Game.st, 'cen3d'); await cuenta(1000); f3 = await cuenta(3000); }
      const nv = f3 >= 30 ? 0 : f3 >= 22 ? 1 : f3 >= 16 ? 2 : f3 >= 11 ? 3 : 4; s.cal3d = 'auto'; this.nivel = nv; this._2d = 0;
      const ir2d = !f3 || f3 < 9; s.vistaL = ir2d ? '2d' : (antes.v || 'cen3d'); if (f2 < 24 && s.q !== 'low') s.q = 'low'; Save.write();
      Game.stop(); Game.start('libre', 'lb:San Antonio', { back: 'cover' }); if (ir2d) L.vista(Game.st, '2d'); else L.vista(Game.st, s.vistaL);
      UI.modal(`<div class="pag">📏 Tu celular</div><h2>${f3 >= 22 ? 'Va muy bien' : f3 >= 11 ? 'Va bien con ajustes' : 'Mejor en 2D'}</h2><div class="kv"><b>Vista 2D</b><span>${Math.round(f2)} cuadros por segundo</span><b>Vista 3D</b><span>${f3 ? Math.round(f3) + ' cuadros por segundo' : 'sin 3D'}</span><b>Calidad 3D</b><span>automática, empieza en «${NOMBRE[nv]}»</span><b>Vista de Ciudad Libre</b><span>${ir2d ? 'desde arriba (2D)' : s.vistaL === 'cen3d' ? '3D cenital' : s.vistaL}</span>${f2 < 24 ? '<b>Calidad gráfica</b><span>celular modesto</span>' : ''}</div><p class="m">Se ajusta solo mientras juegas. Puedes cambiarlo en Ajustes.</p><button class="btn pri" id="mdOk">Listo</button>`);
      const ok = $('#mdOk'); if (ok) ok.onclick = () => UI.close();
    }
  };
  /* el 3D se dibuja con el escalón del regulador */
  const draw0 = G3.draw;
  G3.draw = function (cam, opts = {}) {
    R.paso(now(), Game.ft || 0); const f = R.factor(); G3.simple = R.simple(); R.liviano();
    return draw0.call(this, cam, f < 1 ? Object.assign({}, opts, { escala: (opts.escala || .82) * f }) : opts);
  };
  /* Ajustes: calidad 3D y 📏 medir */
  if (typeof Menu !== 'undefined' && Menu.settings) {
    const set0 = Menu.settings;
    Menu.settings = function () {
      const r = set0.apply(this, arguments), ok = document.getElementById('sOk'); if (!ok || document.getElementById('sCal3d')) return r;
      const s = S(), v = s.cal3d == null ? 'auto' : String(s.cal3d), d = document.createElement('div');
      d.innerHTML = `<div class="pag">📏 Calidad 3D</div><div class="tg" id="sCal3d">${[['auto', 'Automática'], ['0', 'Alta'], ['2', 'Media'], ['4', 'Baja']].map(([k, n]) => `<button data-v="${k}" class="${v === k ? 'on' : ''}">${n}</button>`).join('')}</div><button class="btn sm" id="sMedir" style="margin-top:6px">📏 Medir mi celular</button>`;
      ok.closest('.row').before(d);
      for (const b of d.querySelectorAll('#sCal3d button')) b.onclick = () => { s.cal3d = b.dataset.v === 'auto' ? 'auto' : +b.dataset.v; R.nivel = s.cal3d === 'auto' ? 0 : s.cal3d; Save.write(); for (const x of d.querySelectorAll('#sCal3d button')) x.classList.toggle('on', x === b); };
      d.querySelector('#sMedir').onclick = () => { UI.close(); R.medir(); };
      return r;
    };
  }
  /* ?medir en la dirección: mide al abrir (para probar en el celular sin buscar el botón) */
  if (typeof location !== 'undefined' && /[?&]medir\b/.test(location.search)) { const t = setInterval(() => { if (!EM.ready) return; clearInterval(t); setTimeout(() => R.medir(), 400); }, 250); }
})();
