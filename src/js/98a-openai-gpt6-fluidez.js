/*
 * OpenAI GPT-6 · Fluidez arcade y acceso libre · 2026-11-22
 * Módulo aditivo: no reescribe motores ajenos y se carga después de 98-relevo-z1.js.
 * Preserva la física ferroviaria, el guardado y el trazado del mapa.
 */
(function () {
  'use strict';

  // Cualquier nivel debe poder probarse desde el primer inicio.
  // El cierre original consulta la clase 'lock' al tocar, por lo que quitarla
  // después de dibujar conserva el mismo selector y los eventos existentes.
  if (typeof Menu !== 'undefined' && typeof Menu.levels === 'function') {
    const anterior = Menu.levels;
    Menu.levels = function () {
      const resultado = anterior.apply(this, arguments);
      document.querySelectorAll('#lBody [data-l].lock').forEach(b => b.classList.remove('lock'));
      return resultado;
    };
  }

  // Los capítulos clásicos se pueden examinar en cualquier orden, sin alterar
  // el progreso guardado; la misión sigue usando su propio resultado.
  if (typeof Menu !== 'undefined' && typeof Menu.storyList === 'function') {
    const anterior = Menu.storyList;
    Menu.storyList = function () {
      const resultado = anterior.apply(this, arguments);
      document.querySelectorAll('#lBody [data-c]').forEach(b => {
        b.classList.remove('lock');
        const marcador = b.lastElementChild;
        if (marcador && marcador.textContent.trim() === '🔒') marcador.textContent = '▶';
        b.onclick = () => { if (typeof Snd !== 'undefined') Snd.init(); Story.open(Number(b.dataset.c)); };
      });
      return resultado;
    };
  }

  // El teclado recorría un módulo de 4 aunque hubiera 5 o 6 vistas.
  // No se modifican las cámaras; solo se vuelve alcanzable cada proyección.
  function camarasCompletas(modo, vistas) {
    if (!modo || typeof modo.key !== 'function') return;
    const anterior = modo.key;
    modo.key = function (estado, tecla, presionada) {
      if (tecla === 'v' || tecla === 'V') {
        if (presionada) {
          const indice = vistas.indexOf(estado.view);
          estado.view = vistas[(indice + 1) % vistas.length];
        }
        return;
      }
      return anterior.apply(this, arguments);
    };
  }
  camarasCompletas(EM.modes.conduce, ['cab', 'tps', 'cine', 'lado', 'top', 'pan']);
  camarasCompletas(EM.modes.volante, ['tps', 'cab', 'cine', 'top', 'pan']);

  // La carrera tardaba ~100 segundos en pasar de 8 a 20 m/s: 0,12 m/s².
  // Se añade ~4,28 m/s² antes del avance original para un despegue de
  // ~2,7 s, sin alterar el límite de cada vehículo ni el modelo de colisiones.
  const carrera = EM.modes.carrera;
  // Integración (Claude, 4.8): si 96-arcade ya dio el arranque vivo, no se suma otro (el tope llegaría en 3 s y se perdería la subida).
  if (carrera && typeof carrera.step === 'function' && !carrera.step._arranqueVivo) {
    const anterior = carrera.step;
    carrera.step = function (estado, dt) {
      if (estado && !estado.done && Number.isFinite(dt) && dt > 0 && Number.isFinite(estado.v)) {
        const vehiculo = this.V(estado);
        if (vehiculo && Number.isFinite(vehiculo.spd)) {
          const tope = vehiculo.spd * (estado.turbo > 0 ? 1.3 : 1);
          if (estado.v < tope) estado.v = Math.min(tope, estado.v + (estado.turbo > 0 ? 3.9 : 4.28) * dt);
        }
      }
      return anterior.apply(this, arguments);
    };
  }
})();
