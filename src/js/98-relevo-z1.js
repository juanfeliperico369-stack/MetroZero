/* =====================================================================
   RELEVO Z1 (Claude, 21-nov-2026) · los 6 errores que encontró Antigravity en su auditoría a 412 × 860
   Antigravity reclamó la zona Z1 (.ai-coord/estado-antigravity.json) pero no alcanzó a subir los arreglos antes de
   quedarse sin uso; el autor pidió terminarlos. Van en este archivo aditivo (ganchos sobre Menu, Game y CR) para no
   reescribir sus módulos, como pide docs/COORDINACION-IA.md. Mensaje en .ai-coord/buzon/.
   1) Ciudad Libre: todos los inicios abiertos (eran puntos de partida, no niveles con estrellas).
   2) #ghud: las fichas ya no empujan el botón de pausa fuera de la pantalla.
   3) .camui: ya no tapa el tablero de la cabina, la barra del trabajo (.jobbar) ni el mensaje del juego.
   4) #story: el lienzo de la historia conserva su proporción 16:9 (antes se estiraba 2,5× en alto).
   5) Carrera: sonidos (pasaje, poder, golpe, estación, salto, escudo) y recorrido por ventana de obstáculos
      (47-carrera.js usa crVentana: ya no recorre todos los obstáculos de la línea en cada cuadro).
   6) Juego: --sat se lee una sola vez por cambio de tamaño (25-game.js) y pointercancel suelta el dedo.
   ===================================================================== */
(function () {
  /* 2, 3 y 4: estilos */
  const css = document.createElement('style'); css.id = 'relevoZ1';
  css.textContent = '#ghud .chips{flex:0 1 auto;min-width:0;overflow:hidden;flex-wrap:nowrap}#ghud .chips>*{flex:none}#ghud .ib{flex:none}'
    + '#story canvas{flex:none;width:100%;height:auto;aspect-ratio:16/9;max-height:calc(100% - 170px);object-fit:contain;margin:auto 0}';
  document.head.appendChild(css);
  /* 3: la columna de cámara (+ − regla cámara) baja hasta quedar libre: bajo el tablero de la cabina (dibujado en el lienzo),
     bajo la barra del trabajo (.jobbar, también la del tutorial y la de la trama) y bajo el mensaje (#gmsg) cuando están a su altura */
  const CABINA = ['conduce', 'tranvia'], ubicar = () => { const c = document.getElementById('camUI'); if (!c) return; const sat = Game._sat || 0, h = c.offsetHeight || 170; let top = 112 + sat;
    if (Game.mode && CABINA.some(k => EM.modes[k] === Game.mode)) top = Math.max(top, 196 + sat);
    for (let pasada = 0; pasada < 2; pasada++) for (const e of document.querySelectorAll('#game .jobbar, #game #gmsg')) { if (e.classList.contains('hide')) continue; const r = e.getBoundingClientRect(); if (r.height < 4 || r.left > 52) continue; if (r.top < top + h && r.bottom > top - 4) top = Math.max(top, r.bottom + 8); }
    const t = Math.round(top) + 'px'; if (c.style.top !== t) c.style.top = t; };
  setInterval(ubicar, 300);
  /* 1: Ciudad Libre sin candados */
  if (typeof Menu !== 'undefined' && Menu.levels) { const _lv = Menu.levels; Menu.levels = function (id) { const r = _lv.apply(this, arguments); if (id === 'libre') document.querySelectorAll('#lBody [data-l].lock').forEach(b => b.classList.remove('lock')); return r; }; }
  /* 6: pointercancel (el sistema cancela el gesto: se suelta como si se levantara el dedo) */
  const cv = document.getElementById('gcv'); if (cv && typeof Game !== 'undefined') cv.addEventListener('pointercancel', e => { try { Game.pointer('up', e); } catch (err) { /* sin modo activo */ } });
  /* 5: sonidos de la carrera, comparando el estado antes y después de cada paso */
  const C = EM.modes && EM.modes.carrera; if (C && C.step && typeof Snd !== 'undefined') { const _st = C.step;
    C.step = function (st, dt) { const a = { p: st.pasajes, w: st.poderes, v: st.vidas, e: st.est, y: st.y, es: st.escudo }; const r = _st.apply(this, arguments);
      if (!EM.headless) { if (st.vidas < a.v) Snd.play('crash'); else if (a.es && !st.escudo) Snd.play('ok'); if (st.pasajes > a.p) Snd.play('coin'); if (st.poderes > a.w) Snd.play('star'); if (st.est !== a.e && a.e >= 0) Snd.play('bell'); if (a.y === 0 && st.y > 0) Snd.play('whoosh'); }
      return r; }; }
})();
