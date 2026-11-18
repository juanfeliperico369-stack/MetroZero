/* =====================================================================
   CÁMARA EN LAS OTRAS VISTAS (1.3.0): en las vistas desde arriba de Bus, Al volante y Metro, dos dedos acercan o alejan
   (también la rueda del ratón y los botones + y −), 📐 cambia el ángulo (el mismo de Ciudad Libre) y 🎥 suelta la cámara
   para arrastrar y mirar; otro toque a 🎥 la devuelve. Un modo la pide con la propiedad `camara: {}` (Game.start la monta)
   y en su dibujo multiplica su escala por CamUI.zoom(st), suma CamUI.off(st) al centro y deja en st._k sus píxeles por metro.
   ===================================================================== */
const CamUI = EM.camui = {
  zoom(st) { return st.zoomU || 1; },
  off(st) { return st.camLibre ? { x: st.camDx || 0, y: st.camDy || 0 } : { x: 0, y: 0 }; },
  mount(st) {
    if (EM.headless) return; const el = $('#gctl'); if (!el) return; this.unmount();
    const b = document.createElement('div'); b.className = 'camui'; b.id = 'camUI';
    b.innerHTML = '<button data-c="mas" aria-label="Acercar">+</button><button data-c="menos" aria-label="Alejar">−</button><button data-c="ang" aria-label="Ángulo de la cámara">📐</button><button data-c="libre" aria-label="Cámara libre: arrastra para mirar">🎥</button>';
    el.appendChild(b);
    const zoom = f => { st.zoomU = clamp((st.zoomU || 1) * f, .35, 3); };
    b.querySelector('[data-c=mas]').onclick = () => zoom(1.3); b.querySelector('[data-c=menos]').onclick = () => zoom(1 / 1.3);
    b.querySelector('[data-c=ang]').onclick = () => { const s = Save.d.settings; s.angulo = ((s.angulo | 0) + 1) % VC.ANGULOS.length; const A = VC.angulo(s.angulo); Save.write(); UI.gmsg('📐 Ángulo: ' + A.n, 'b'); };
    const lb = b.querySelector('[data-c=libre]'); lb.onclick = () => { st.camLibre = !st.camLibre; if (!st.camLibre) st.camDx = st.camDy = 0; lb.classList.toggle('on', st.camLibre); UI.gmsg(st.camLibre ? '🎥 Cámara libre: arrastra para mirar (toca 🎥 para volver)' : '🎥 La cámara te sigue otra vez', 'b'); };
    const cv = $('#gcv'); if (!cv) return; const T = new Map(); let pinch = null;
    const down = e => { T.set(e.pointerId, { x: e.clientX, y: e.clientY }); if (T.size === 2) { const [p, q] = [...T.values()]; pinch = { d: Math.hypot(p.x - q.x, p.y - q.y), z: st.zoomU || 1 }; } };
    const move = e => { const q = T.get(e.pointerId); if (!q) return; const nx = e.clientX, ny = e.clientY;
      if (T.size >= 2 && pinch) { q.x = nx; q.y = ny; const [a, c] = [...T.values()]; st.zoomU = clamp(pinch.z * Math.hypot(a.x - c.x, a.y - c.y) / Math.max(12, pinch.d), .35, 3); return; }
      if (st.camLibre && T.size === 1) { const k = st._k || 1; st.camDx = (st.camDx || 0) - (nx - q.x) / k; st.camDy = (st.camDy || 0) - (ny - q.y) / k; } q.x = nx; q.y = ny; };
    const up = e => { T.delete(e.pointerId); if (T.size < 2) pinch = null; };
    const wheel = e => { e.preventDefault(); st.zoomU = clamp((st.zoomU || 1) * Math.exp(-clamp(e.deltaY, -120, 120) * .0016), .35, 3); };
    cv.addEventListener('pointerdown', down); cv.addEventListener('pointermove', move); cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up); cv.addEventListener('wheel', wheel, { passive: false });
    this._off = () => { cv.removeEventListener('pointerdown', down); cv.removeEventListener('pointermove', move); cv.removeEventListener('pointerup', up); cv.removeEventListener('pointercancel', up); cv.removeEventListener('wheel', wheel); const e2 = $('#camUI'); if (e2) e2.remove(); this._off = null; };
  },
  unmount() { if (this._off) this._off(); }
};
