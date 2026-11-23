/* =====================================================================
   PASAJES QUE SE GASTAN (3.7 «Épocas», Claude, 23‑nov‑2026) · lo primero de las sugerencias de diseño (docs/SUGERENCIAS-CLAUDE.md,
   sección 3): los pasajes 🎫 se ganaban y casi no se usaban.
   - Ahora compran pintura para tus vehículos propios: moto, carro particular, patineta y monopatín eléctricos, skate y patines.
     Cada color cuesta 30 🎫; ya comprado, se cambia gratis. Se ve en 2D y en 3D.
   - Los de servicio (taxi, camioneta del Metro, bici EnCicla y buses) conservan su color: son de todos.
   - En Ciudad Libre: 🆘 → «🎨 Pintura». Se guarda en Save.d.pinturas (con su valor por defecto).
   ===================================================================== */
(function () {
  const L = EM.modes.libre; if (!L || typeof VEH === 'undefined') return;
  const PROPIOS = ['moto', 'carro', 'scooter', 'monopatin', 'skate', 'patines'].filter(k => VEH[k]), PRECIO = 30;
  const COLORES = [['Rojo', '#EC343A'], ['Mostaza', '#F6C538'], ['Azul Línea A', '#1C5C9C'], ['Naranja Línea B', '#E38835'], ['Verde tranvía', '#59AB42'], ['Rosa Línea H', '#EB318E'], ['Morado Línea M', '#743D90'], ['Petróleo Metroplús', '#0E6F76']];
  const P = EM.pintura = {
    PROPIOS, COLORES, PRECIO,
    datos() { return Save.d.pinturas || (Save.d.pinturas = { compradas: [], actual: '' }); },
    color(kind) { const c = this.datos().actual; return c && PROPIOS.includes(kind) ? c : null; },
    rgb(h) { return [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255); },
    /* elegir un color: si ya es tuyo, gratis; si no, cuesta PRECIO pasajes */
    elegir(st, hex) {
      const D = this.datos(); if (!hex) { D.actual = ''; Save.write(); return 'ok'; }
      if (!D.compradas.includes(hex)) { if ((Save.d.wallet | 0) < PRECIO) return 'falta'; Save.d.wallet -= PRECIO; D.compradas.push(hex); if (EM.jugo && st) EM.jugo.pop(st, '🎨 −' + PRECIO + ' 🎫', 'y'); if (typeof Snd !== 'undefined') Snd.play('coin'); }
      D.actual = hex; Save.write(); return 'ok';
    }
  };
  /* 2D y física: V(st) da el mismo tipo con tu color (hereda todo lo demás, así sigue cualquier ajuste de velocidad) */
  const deriv = new WeakMap(), V0 = L.V;
  L.V = function (st) {
    const V = V0.call(this, st); if (!V || !st || !st.veh) return V; const c = P.color(st.veh.kind); if (!c) return V;
    let m = deriv.get(V); if (!m) deriv.set(V, m = {}); return m[c] || (m[c] = Object.assign(Object.create(V), { col: c }));
  };
  /* 3D: tu vehículo se tiñe (solo el tuyo: se reconoce por su posición; los parqueados del mismo tipo no) */
  const T = EM.taller;
  if (T && T.mundo && L.dyn3D) {
    const mundo0 = T.mundo, dyn0 = L.dyn3D;
    T.mundo = function (buffer, x, altura, z, rumbo, g3 = EM.g3) {
      const pz = T._pintar; if (!pz || x !== pz.x || z !== pz.z || !g3 || !g3.gl || !g3.P) return mundo0.apply(this, arguments);
      const gl = g3.gl, u = g3.P.u; gl.uniform4fv(u.tint, [pz.c[0], pz.c[1], pz.c[2], pz.a]); try { return mundo0.apply(this, arguments); } finally { gl.uniform4fv(u.tint, [0, 0, 0, 0]); }
    };
    L.dyn3D = function (G, st) {
      const c = st && st.mode === 'veh' && st.veh ? P.color(st.veh.kind) : null; T._pintar = c ? { x: st.x, z: st.y, c: P.rgb(c), a: (VEH[st.veh.kind] || {}).monta ? .3 : .42 } : null;
      try { return dyn0.apply(this, arguments); } finally { T._pintar = null; }
    };
  }
  /* 🆘: la fila de pintura, después de la época (o de «vista de lejos clara») */
  const ayuda0 = L.ayuda;
  L.ayuda = function (st) {
    const r = ayuda0.apply(this, arguments); if (EM.headless || document.getElementById('lbPint')) return r;
    const ref = document.getElementById('lbEpoca') || document.querySelector('#mBody .tg[data-cl]'); if (!ref) return r;
    const d = document.createElement('div'); (ref.id === 'lbEpoca' ? ref : ref).after(d);
    const pinta = () => { const D = P.datos(); d.innerHTML = `<div class="pag">🎨 Pintura de tus vehículos <small>(moto, carro, patinetas, skate y patines) · tienes ${Save.d.wallet | 0} 🎫</small></div><div class="tg" id="lbPint" style="flex-wrap:wrap"><button data-c="" class="${D.actual ? '' : 'on'}">Original</button>${COLORES.map(([n, h]) => `<button data-c="${h}" title="${esc(n)}" class="${D.actual === h ? 'on' : ''}" style="background:${h};color:#fff;min-width:44px;text-shadow:0 1px 2px #000">${D.compradas.includes(h) ? (D.actual === h ? '✓' : '·') : PRECIO + '🎫'}</button>`).join('')}</div>`;
      for (const b of d.querySelectorAll('[data-c]')) b.onclick = () => { const r2 = P.elegir(st, b.dataset.c); if (r2 === 'falta') { UI.toast('Te faltan ' + (PRECIO - (Save.d.wallet | 0)) + ' 🎫: haz oficios, el reto del día o un modo desde 🎮'); return; } pinta(); }; };
    pinta(); return r;
  };
})();
