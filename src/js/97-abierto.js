/* =====================================================================
   MUNDO ABIERTO PRIMERO (Claude, 21‑nov‑2026) · regla del autor para todos los juegos de Motor City:
   «mundo abierto desde el principio; el tutorial y el contexto de la historia son opcionales y nunca bloquean».
   Antigravity lo midió en su auditoría G‑H28 (motorcity/reportes/2026-11-21-gemini-clasicos-4.1.md): aquí ▶ Jugar
   abría la pantalla de MODOS, luego una grilla y luego el inicio (3 toques).
   - ▶ Jugar entra DIRECTO a Ciudad Libre: donde quedaste o, la primera vez, San Antonio (1 toque).
   - Un botón nuevo, «Todos los modos», queda justo debajo: Metro, Metroplús, Metrocable, bus, carrera, historia…
   - La historia («La última vuelta») y «Aprende a usar el Metro» siguen ahí, opcionales.
   Archivo aditivo: envuelve Menu.bind sin reescribir 65-menu.js.
   ===================================================================== */
(function () {
  if (typeof Menu === 'undefined' || !Menu.bind) return;
  const _bind = Menu.bind;
  Menu.bind = function () {
    const r = _bind.apply(this, arguments), play = document.getElementById('bPlay'); if (!play) return r;
    /* «Todos los modos», debajo de Jugar, con el mismo estilo de parada */
    if (!document.getElementById('bModos')) { const b = document.createElement('button'); b.className = 'parada'; b.id = 'bModos'; b.style.setProperty('--c', 'var(--lB, #f39200)'); b.innerHTML = '<i></i><span><b>Todos los modos</b><small>Metro, Metroplús, Metrocable, bus, carrera y más</small></span>'; play.insertAdjacentElement('afterend', b);
      b.onclick = e => { Snd.init(); Snd.play('tap'); const ms = this.tren(e.currentTarget); setTimeout(() => this.modes(), ms); }; }
    play.onclick = e => { Snd.init(); Snd.play('tap'); const ms = this.tren(e.currentTarget); setTimeout(() => { const sv = Save.d.libre || {}; Game.start('libre', sv.x ? 'lb:ultimo' : 'lb:San Antonio', { back: 'cover' }); }, ms); };
    return r;
  };
  /* el arranque cambia el texto de Jugar al terminar de cargar: se ajusta después */
  const t = setInterval(() => { if (!EM.ready) return; clearInterval(t); const s = document.querySelector('#bPlay small'); if (s) { const sv = (Save.d && Save.d.libre) || {}; s.textContent = sv.x ? 'Ciudad Libre: donde quedaste' : 'Ciudad Libre: camina, monta y maneja por el valle'; } }, 200);
})();
