/* =====================================================================
   CIUDAD VIVA EN FAMILIA (3.6, Claude, 23‑nov‑2026) · de Motor City 5.2 «Ciudad viva» (`MC.CiudadViva`, js/26-vida-ciudad.js),
   con el tono que el motor recomienda para este juego: familia, sin violencia (solo choque, derrape y pito).
   La gente de Ciudad Libre ya no ignora lo que pasa: quien está cerca se voltea a mirar, se detiene un momento y dice algo
   de aquí. Una reacción cada 1,2 s como mucho y hasta dos personas, para que no sea ruido.
   - Pito (H o Q en un vehículo): «¡Qué susto!», «Tranquilo, mijo».
   - Choque: «¡Uy! ¿Está bien?», «¿Le ayudo?».
   - Derrape con el freno de mano: «¡Despacio!», «¡Qué frenada!».
   ===================================================================== */
(function () {
  const L = EM.modes.libre; if (!L || typeof Ciudad === 'undefined') return;
  const FR = {
    pito: ['¡Qué susto!', '¡Ya, ya, ya voy!', 'Tranquilo, mijo', '¡Uy, ese pito!', 'Con calma, que hay tiempo'],
    crash: ['¡Uy! ¿Está bien?', '¡Cuidado, pues!', 'Ay, Dios mío…', '¿Le ayudo?', '¡Despacito, que no es carrera!'],
    brake: ['¡Despacio!', '¡Qué frenada!', '¡Ojo, que aquí hay gente!', 'Así no, mijo', '¡Cuidado con la ciclorruta!']
  };
  /* las frases de familia del motor (src/js/96e1-frases-ciudad.js, generado): se suman a las de cada evento y, para la charla al
     azar, las de ambiente que van con la hora y la lluvia */
  const EV = { pito: ['bocina'], crash: ['choque'], brake: ['derrape'] }, deMotor = k => (typeof FRASES_CIUDAD !== 'undefined' ? FRASES_CIUDAD : []).filter(f => f.ev.some(e => EV[k].includes(e))).map(f => f.t);
  const ambiente = () => { if (typeof FRASES_CIUDAD === 'undefined') return null; const h = (typeof Mundo !== 'undefined' ? Mundo.hour() : 12) * 60, ll = typeof Mundo !== 'undefined' && !!(Mundo.weather() || {}).rain;
    const L0 = FRASES_CIUDAD.filter(f => f.ev.includes('ambiente') && !f.lugar && (!f.hora || (h >= f.hora[0] && h < f.hora[1])) && (f.lluvia === undefined || f.lluvia === ll)); return L0.length ? L0[(Math.random() * L0.length) | 0].t : null; };
  const say0 = Ciudad.say; Ciudad.say = function (p, txt) { if (!txt && Math.random() < .45) txt = ambiente() || txt; return say0.call(this, p, txt); };
  const Vv = EM.ciudadViva = {
    reacciona(st, k, r) {
      if (EM.headless || !st || st.auto || Game.st !== st || !Ciudad.peds) return 0; const t = now(); if (t - (this._t || 0) < 1.2) return 0; this._t = t;
      const L0 = FR[k].concat(deMotor(k)), cerca = Ciudad.peds.filter(p => !p.dog && !p.gone && Math.abs(p.x - st.x) < r && Math.abs(p.y - st.y) < r && Math.hypot(p.x - st.x, p.y - st.y) < r).sort((a, b) => Math.hypot(a.x - st.x, a.y - st.y) - Math.hypot(b.x - st.x, b.y - st.y)).slice(0, 2);
      cerca.forEach((p, i) => { p.a = Math.atan2(st.y - p.y, st.x - p.x); p.wait = Math.max(p.wait || 0, 1.6 + i * .4); if (i === 0 || Math.random() < .5) Ciudad.say(p, L0[(Math.random() * L0.length) | 0]); });
      return cerca.length;
    }
  };
  const sfx0 = L.sfx, key0 = L.key;
  L.sfx = function (st, k) { if (k === 'crash' || k === 'brake') Vv.reacciona(st, k, k === 'crash' ? 30 : 22); return sfx0.apply(this, arguments); };
  L.key = function (st, k, down) { if (down && (k === 'h' || k === 'q') && st.mode === 'veh') Vv.reacciona(st, 'pito', 35); return key0.apply(this, arguments); };
})();
