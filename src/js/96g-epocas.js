/* =====================================================================
   ÉPOCAS (3.7 «Épocas», Claude, 23‑nov‑2026) · jugar la red como era (idea de UnoCero: la línea de tiempo con hitos que se abre
   jugando; documento de evolución, secciones 5.6 y 7)
   En Ciudad Libre, 🆘 → «📅 Época»: Hoy, 2016, 2011, 2008, 2004, 1996 o 1995.
   - La lista de líneas (NET.lines) y las de cada estación se filtran EN SU SITIO mientras estás en Ciudad Libre, con la fecha de
     apertura de cada línea (l.open, de los datos de la red): así lo ven todos los sistemas que ya la leen (los trenes y cables que
     circulan, el dibujo 2D, la red 3D, el mapa, abordar en las estaciones y los modos de 🎮). Al salir de la ciudad, vuelve entera.
   - El 3D se rearma solo si la época cambió (G3.buildNet) y la vista toma un tono de recuerdo (sepia suave en las épocas viejas).
   - Al entrar, la ficha de la época: las líneas en servicio con su fecha, lo nuevo y lo que pocos saben de lo nuevo.
   - Simplificaciones que se dicen en la ficha: los alimentadores aparecen desde 2011 y el resto de la ciudad es la de hoy.
   - «La última vuelta» (la historia en la ciudad) siempre va en «Hoy»: usa líneas de todas las épocas.
   ===================================================================== */
(function () {
  if (typeof NET === 'undefined' || typeof Libre === 'undefined' || typeof Game === 'undefined') return;
  const S = () => (Save.d && Save.d.settings) || {}, ano = l => l.open ? +String(l.open).slice(0, 4) : 0;
  const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const fecha = f => { const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(f || ''); return m ? (+m[3]) + ' de ' + MESES[+m[2] - 1] + ' de ' + m[1] : ''; };
  const EP = EM.epocas = {
    ANOS: [0, 2016, 2011, 2008, 2004, 1996, 1995], firma: '', actual: 0,
    nombre(a) { return a ? String(a) : 'Hoy'; },
    /* ¿existía la línea en el año a? (0 = hoy: todo, como siempre) */
    abierta(l, a) { if (!a) return true; if (l.kind === 'feeder') return a >= 2011; return l.kind !== 'future' && ano(l) > 0 && ano(l) <= a; },
    /* filtra NET.lines y las líneas de cada estación en su sitio; devuelve true si cambió algo */
    aplicar(a) {
      const T = NET._todas || (NET._todas = NET.lines.slice()), L = T.filter(l => this.abierta(l, a)), firma = L.map(l => l.id).join(',');
      this.actual = a; if (firma === this.firma || (!this.firma && L.length === T.length)) { this.firma = firma; return false; }
      NET.lines.length = 0; NET.lines.push(...L); const dentro = new Set(L);
      for (const h of NET.stations) { if (!h._todas) h._todas = h.lines.slice(); h.lines.length = 0; h.lines.push(...h._todas.filter(l => dentro.has(l))); }
      this.firma = firma;
      if (typeof G3 !== 'undefined') { G3._rm = null; if (G3.ok && G3.gl && G3.buildNet) { try { G3.buildNet(); } catch (e) { EM.errors.push('épocas 3D: ' + e.message); } } }
      return true;
    },
    filtro(a) { return !a ? '' : a <= 1996 ? 'sepia(.42) saturate(.8) contrast(1.05)' : a <= 2008 ? 'sepia(.26) saturate(.88)' : a <= 2011 ? 'sepia(.14)' : 'sepia(.06)'; },
    tono(a) { for (const c of [document.getElementById('gcv'), typeof G3 !== 'undefined' && G3.cv]) if (c && c.style) c.style.filter = this.filtro(a); },
    /* la ficha de la época: en servicio, lo nuevo y lo que pocos saben */
    ficha(a) {
      const T = (NET._todas || NET.lines).filter(l => l.kind !== 'feeder' && l.kind !== 'future'), L = T.filter(l => this.abierta(l, a)).sort((x, y) => String(x.open).localeCompare(String(y.open)));
      const i = this.ANOS.indexOf(a), antes = a ? (this.ANOS[i + 1] || 0) : 2016, nuevas = L.filter(l => ano(l) > antes), dato = nuevas.map(l => l.fact || l.tech).find(Boolean);
      const chip = l => `<span class="badge" style="background:${l.color}">${esc(l.id.replace(/^AL-/, ''))}</span>`;
      return `<div class="pag">📅 Época</div><h2>${a ? 'Medellín en ' + a : 'Hoy'}</h2>
        <p class="m"><b>En servicio (${L.length}):</b><br>${L.map(l => chip(l) + ' ' + esc(l.name) + ' <small>· desde el ' + esc(fecha(l.open)) + '</small>').join('<br>')}</p>
        ${nuevas.length ? `<p class="m"><b>Lo nuevo${a ? ' de esta época' : ' desde 2016'}:</b> ${nuevas.map(l => esc(l.name)).join(', ')}.</p>` : ''}
        ${dato ? `<div class="film" style="margin:8px 0">Lo que pocos saben · ${esc(dato)}</div>` : ''}
        <p class="m" style="font-size:12px">${a ? 'Circulan solo las líneas que ya existían. Los alimentadores aparecen desde 2011 y el resto de la ciudad es la de hoy.' : 'Toda la red de hoy.'}</p>
        <div class="row"><button class="btn pri" id="epOk">A rodar</button></div>`;
    },
    mostrar(a) { if (EM.headless) return; UI.modal(this.ficha(a)); const b = document.getElementById('epOk'); if (b) b.onclick = () => UI.close(); }
  };
  /* Ciudad Libre: la época se aplica antes de crear la ciudad (los trenes que circulan salen de NET.lines) y se quita al salir */
  const create0 = Libre.create, unmount0 = Libre.unmount, mount0 = Libre.mount, ayuda0 = Libre.ayuda;
  Libre.create = function (lv, opts = {}) {
    const a = lv === 'lb:trama' || opts.auto ? 0 : (+S().epoca || 0); EP.aplicar(a);
    const st = create0.apply(this, arguments); st.epoca = a; return st;
  };
  Libre.mount = function (st, el) { const r = mount0.apply(this, arguments); EP.tono(st.epoca || 0); if (st.epoca && !st._epVisto && !st.auto) { st._epVisto = 1; this.msg(st, '📅 Estás en ' + st.epoca + ': solo circulan las líneas que ya existían (🆘 → Época)', 'b'); } return r; };
  Libre.unmount = function (st) { const r = unmount0.apply(this, arguments); EP.tono(0); EP.aplicar(0); return r; };
  /* 🆘: el selector de época, después de «vista de lejos clara» */
  Libre.ayuda = function (st) {
    const r = ayuda0.apply(this, arguments); if (EM.headless || document.getElementById('lbEpoca')) return r;
    const ref = document.querySelector('#mBody .tg[data-cl]'), cur = st.epoca || 0; if (!ref) return r;
    const d = document.createElement('div'); d.innerHTML = `<div class="pag">📅 Época: la red como era</div><div class="tg" id="lbEpoca">${EP.ANOS.map(a => `<button data-v="${a}" class="${cur === a ? 'on' : ''}">${EP.nombre(a)}</button>`).join('')}</div>`;
    ref.after(d);
    for (const b of d.querySelectorAll('button')) b.onclick = () => {
      const a = +b.dataset.v; if (st.trama) { this.msg(st, 'La historia va en «Hoy»: termina el capítulo o sal de la historia para cambiar de época', 'y'); return; }
      S().epoca = a; Save.write(); UI.close(); this.persist(st); const back = (Game.opts && Game.opts.back) || 'cover';
      Game.start('libre', 'lb:ultimo', { back }); setTimeout(() => EP.mostrar(a), 350);
    };
    return r;
  };
})();
