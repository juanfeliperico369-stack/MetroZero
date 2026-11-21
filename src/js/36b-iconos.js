/* =====================================================================
   ÍCONOS Y TAMAÑO DE LA INTERFAZ (3.1) · pedido del autor: «mejora los íconos y la información en pantalla: a veces hay tantas
   cosas y tan grandes que tapan todo el juego; además el tamaño solo tiene dos opciones, grande o enorme».
   - Íconos dibujados (SVG de trazo, del color del texto) en vez de emojis, que cambian de un celular a otro: vista, foto, cámara
     libre, acercar, correr, ritmo, qué ver cerca y rescate. Si el arte del juego trae su propio ícono, se usa ese.
   - Tamaño de botones e información: pequeño, mediano (por defecto) o grande (el de antes). Se encogen desde su esquina, así no
     cambian de lugar ni tapan más; se elige en el menú de Ciudad Libre (⏸) y se guarda en settings.uiTam.
   - Modo foco: manejando rápido, la columna de botones se atenúa y la ficha del lugar se esconde (como el «foco» de Motor City).
   ===================================================================== */
(() => {
  const s = (d, rel = '') => `<svg class="ico" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"${rel}>${d}</svg>`;
  const ICO = EM.iconos = {
    vista: s('<path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z"/><circle cx="12" cy="12" r="3.2"/>'),
    foto: s('<path d="M3.5 8.5h3.2l1.8-2.8h7l1.8 2.8h3.2v10.5H3.5z"/><circle cx="12" cy="13.5" r="3.6"/>'),
    camara: s('<path d="M12 3v18M3 12h18"/><path d="M9 6l3-3 3 3M9 18l3 3 3-3M6 9l-3 3 3 3M18 9l3 3-3 3"/>'),
    zoom: s('<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.4 15.4L21 21M7.5 10.5h6M10.5 7.5v6"/>'),
    correr: s('<circle cx="15" cy="4.6" r="1.9"/><path d="M7.5 21l3.2-5.5 3.3 2.2V21M5 11.5l3.6-3 4.2.8 2.2 3.2h3.6M10.7 15.5l1.6-6"/>'),
    ritmo: s('<path d="M3.5 6.5l7.5 5.5-7.5 5.5zM12.5 6.5l7.5 5.5-7.5 5.5z" fill="currentColor"/>'),
    guia: s('<path d="M12 21.5s-6.5-6.4-6.5-11.5a6.5 6.5 0 0113 0c0 5.1-6.5 11.5-6.5 11.5z"/><circle cx="12" cy="10" r="2.4"/>'),
    ayuda: s('<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="3.6"/><path d="M6 6l3.4 3.4M18 6l-3.4 3.4M6 18l3.4-3.4M18 18l-3.4-3.4"/>'),
    freno: s('<circle cx="12" cy="12" r="8.5"/><path d="M10 16V8h3a2.5 2.5 0 010 5h-3"/>')
  };
  /* botón → ícono; se conserva el <small> (con su id) que el juego actualiza */
  const MAPA = { lbVista: 'vista', lbFoto: 'foto', lbCam: 'camara', lbZoom: 'zoom', lbRun: 'correr', lbFF: 'ritmo', lbGuia: 'guia', lbAyuda: 'ayuda', lbHb: 'freno' };
  ICO.aplicar = () => { for (const [id, k] of Object.entries(MAPA)) { const b = document.getElementById(id); if (!b || b.dataset.ico) continue; if (b.querySelector('img.aico') && id !== 'lbHb') { b.dataset.ico = 1; continue; } const sm = b.querySelector('small'); b.innerHTML = ICO[k] + (sm ? sm.outerHTML : ''); b.dataset.ico = 1; } };
  /* tamaño: 0 pequeño, 1 mediano, 2 grande */
  ICO.TAM = [['Pequeño', .74], ['Mediano', .87], ['Grande', 1]];
  ICO.tam = () => { const v = Save.d && Save.d.settings ? Save.d.settings.uiTam : 1; return clamp(v == null ? 1 : v | 0, 0, 2); };
  ICO.ponTam = () => { if (typeof document !== 'undefined') document.documentElement.style.setProperty('--uiz', String(ICO.TAM[ICO.tam()][1])); };
  if (typeof Libre !== 'undefined') {
    const _mount = Libre.mount; Libre.mount = function () { const r = _mount.apply(this, arguments); try { ICO.ponTam(); ICO.aplicar(); } catch (e) { EM.errors.push('íconos: ' + e.message); } return r; };
    const _step = Libre.step; Libre.step = function (st, dt) { const r = _step.apply(this, arguments);
      if (!EM.headless && Game.st === st) { const f = st.mode === 'veh' && Math.abs(st.vf) > 9; if (f !== !!st._foco) { st._foco = f; const g = document.getElementById('game'); if (g) g.classList.toggle('foco', f); } }
      return r; };
  }
  if (typeof document !== 'undefined') { const t = setInterval(() => { if (!EM.ready || !Save.d) return; clearInterval(t); ICO.ponTam(); }, 250); }
})();
