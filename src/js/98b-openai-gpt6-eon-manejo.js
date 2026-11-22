/*
 * OpenAI GPT-6 · Eón · Recuperación arcade y visión anticipada · 22-XI-2026.
 * Complemento aditivo a la PR #3; se ejecuta después de 98a-... cuando se fusione.
 * NO cambia la geometría, rutas, límites de velocidad, puntos, ni el guardado.
 * La recuperación es la última opción, solo al quedar bloqueado fuera de paradas.
 */
(function () {
  'use strict';
  const volante = EM.modes && EM.modes.volante;
  if (volante && typeof volante.step === 'function' && typeof NET !== 'undefined' && typeof MAP !== 'undefined') {
    const prohibido = new Set([TT.MOUNT, TT.BRICK, TT.BLDG, TT.WATER, TT.CANAL, TT.LAND]);
    const anterior = volante.step;

    function rescatar(st) {
      if (!MAP.ready || !st || !Number.isFinite(st.sR) || !NET.byId[st.line]) return false;
      const l = NET.byId[st.line], B = BUSES && BUSES[st.kind];
      if (!B || !l.P || !Number.isFinite(l.P.len) || typeof volante.pts !== 'function') return false;
      // No teletransportar a través de un semáforo o una parada: son detenciones válidas.
      if (!st.stopTgt || !(st.stopTgt[st.ni] - st.sR > 45)) return false;
      if (typeof volante.redAhead === 'function') {
        const semaforo = volante.redAhead(st);
        if (Number.isFinite(semaforo) && semaforo < 32) return false;
      }
      for (const adelante of [4, 7, 10, 13, 16]) {
        const s = st.sR + adelante;
        if (s >= l.P.len - 3 || s >= st.stopTgt[st.ni] - 30) continue;
        for (const margen of [0, 1.5, -1.5]) {
          const p = NET.at(l.P, s, margen);
          if (!p || !Number.isFinite(p.x) || !Number.isFinite(p.y) || !Number.isFinite(p.a)) continue;
          const probe = { x: p.x, y: p.y, h: p.a, h2: p.a };
          const pts = volante.pts(probe, B);
          if (!pts || !pts.length || pts.some(([x, y]) => prohibido.has(MAP.tileM(x, y)))) continue;
          st.x = p.x; st.y = p.y; st.h = p.a; st.h2 = p.a; st.sR = s;
          st.off = Math.abs(margen); st.v = 0; st.steer = 0; st.sin = 0;
          st._eonAtasco = 0; st._eonRecuperaciones = (st._eonRecuperaciones || 0) + 1;
          st._lost = 0;
          if (typeof volante.msg === 'function') volante.msg(st, 'Bus recolocado en la ruta tras quedar atascado', 'b');
          return true;
        }
      }
      return false;
    }

    volante.step = function (st, dt) {
      const x = st && st.x, y = st && st.y;
      const r = anterior.apply(this, arguments);
      if (!st || !Number.isFinite(dt) || dt <= 0 || st.done || st.ph !== 'run' || st.rev || !MAP.ready) {
        if (st) st._eonAtasco = 0;
        return r;
      }
      const insiste = (st.keys && st.keys.up) || (st.auto && st.lev > .5) || st.lev > .75;
      const detenido = Number.isFinite(st.v) && st.v < .45 && Math.hypot(st.x - x, st.y - y) < .035;
      if (!insiste || !detenido || (st.keys && st.keys.down) || (st.stopTgt && st.stopTgt[st.ni] - st.sR <= 45)) {
        st._eonAtasco = 0;
        return r;
      }
      st._eonAtasco = (st._eonAtasco || 0) + Math.min(dt, .1);
      if (st._eonAtasco >= 2.6 && !rescatar(st)) st._eonAtasco = 1.8;
      return r;
    };
    const keyAnterior = volante.key;
    if (typeof keyAnterior === 'function') {
      volante.key = function (st, key, down) {
        // Atajo opcional: solo disponible si realmente hubo un bloqueo al acelerar.
        if (down && (key === 'r' || key === 'R') && st && st._eonAtasco > .65 && st.ph === 'run') {
          rescatar(st);
          return;
        }
        return keyAnterior.apply(this, arguments);
      };
    }
    volante.tip += ' Si un bloqueo del mapa impide avanzar, acelera unos segundos para recuperarte o pulsa R.';
    // Ajuste arcade moderado: mejora la respuesta de arranque sin tocar el tope de velocidad.
    if (typeof BUSES !== 'undefined') {
      if (BUSES.brt) BUSES.brt.acc = Math.max(BUSES.brt.acc, 1.35);
      if (BUSES.feeder) BUSES.feeder.acc = Math.max(BUSES.feeder.acc, 1.55);
    }
  }

  // El piloto del corredor avistaba obstáculos a solo 9 metros: <0,5 s a 75 km/h.
  // Usa la ventana ordenada ya cacheada por el juego; no inspecciona la lista completa.
  const carrera = EM.modes && EM.modes.carrera;
  if (carrera && typeof carrera.ai === 'function' && typeof crVentana === 'function' && typeof CR_OBS !== 'undefined') {
    const anteriorAI = carrera.ai;
    carrera.ai = function (st) {
      if (!st || !Array.isArray(st.obs) || !Number.isFinite(st.s) || !Number.isFinite(st.v)) return anteriorAI.apply(this, arguments);
      if (st.t > 4 && !st._bv) { st._bv = 1; return 'vehiculo'; }
      const ventana = crVentana(st, st.s + .01, st.s + Math.max(25, Math.min(42, st.v * 2)));
      const obst = ventana.find(o => !o.hecho && CR_OBS[o.k] && o.c === st.c);
      if (!obst || st.turbo > 0) return null;
      const d = obst.s - st.s;
      // Reaccionar cuando quedan ~1-1,3 s, y no malgastar cambios de carril demasiado pronto.
      if (d > Math.max(12, st.v * 1.25)) return null;
      const tipo = CR_OBS[obst.k], saltable = tipo[3] === 0 || tipo[1] < .9;
      if (saltable) return d <= Math.max(11, st.v * .8) && st.y === 0 && st.vy <= 0 ? 'salta' : null;
      const espacio = Math.max(13, st.v * 1.3);
      const libres = [0, 1, 2].filter(c => c !== st.c && !ventana.some(o => !o.hecho && CR_OBS[o.k] && o.c === c && o.s <= st.s + espacio));
      if (libres.length) {
        libres.sort((a, b) => Math.abs(a - st.c) - Math.abs(b - st.c));
        return libres[0] < st.c ? 'izq' : 'der';
      }
      return st.y === 0 && st.vy <= 0 && d <= Math.max(12, st.v * .85) ? 'salta' : null;
    };
  }
})();
