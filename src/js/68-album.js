/* =====================================================================
   ÁLBUM DE POSTALES · los 45 lugares reales del valle (src/data/lugares.js) y 5 postales especiales.
   - Cada postal se gana tomándole la foto en Ciudad Libre (📷 cerca del lugar) o en la historia.
   - La imagen es una vista aérea del propio mapa del juego en ese punto; si el lugar tiene ilustración, va esa.
   - Especiales: Parque Arví y Gardel (llegar a su estación) y las fiestas (jugar en esas fechas).
   Las postales se guardan por nombre en Save.d.fotos (la misma lista de siempre: no cambia el guardado).
   ===================================================================== */
const ALBUM_ARTE = { comuna13: 'esc_comuna13', bibespana: 'esc_ladera_atardecer', palacio: 'iso_centro', botero: 'iso_centro' };
const ALBUM_EXTRA = [
  { id: 'x-arvi', name: 'Parque Arví', muni: 'Medellín · Santa Elena', art: 'esc_arvi', dato: 'Bosque de pinos y robles sobre la montaña oriental, al final del cable L. Allá arriba hace frío y hay mercado campesino.', como: 'Llega en el cable L hasta la estación Arví.' },
  { id: 'x-gardel', name: 'Homenaje a Gardel', muni: 'Medellín · Manrique', art: 'esc_tango', dato: 'Carlos Gardel murió en Medellín en 1935, en un accidente de avión. En Manrique hay un barrio tanguero y una estación del Metroplús con su nombre.', como: 'Llega a la estación Gardel del Metroplús.' },
  { id: 'x-silleteros', name: 'Desfile de Silleteros', muni: 'Feria de las Flores', art: 'esc_silleteros', dato: 'Los campesinos de Santa Elena bajan cargando a la espalda silletas de flores de hasta 80 kilos.', como: 'Juega durante la Feria de las Flores (agosto).' },
  { id: 'x-alumbrados', name: 'Alumbrados del río', muni: 'Diciembre', art: 'esc_alumbrados', dato: 'Millones de luces en el río Medellín y en los barrios. Mucha gente los recorre en metro, de noche.', como: 'Juega de noche en temporada de Alumbrados.' },
  { id: 'x-velitas', name: 'Noche de las Velitas', muni: '7 de diciembre', art: 'esc_velitas', dato: 'La noche del 7 de diciembre las familias encienden velas y faroles en andenes y balcones.', como: 'Juega la noche de las velitas.' }
];
const Album = EM.album = {
  _img: {},
  fotos() { return Save.d.fotos || (Save.d.fotos = []); },
  tiene(name) { return this.fotos().includes(name); },
  n() { return this.lista().filter(p => this.tiene(p.name)).length; },
  /* gana una postal (devuelve true si es nueva) */
  ganar(name) { const F = this.fotos(); if (F.includes(name)) return false; F.push(name); Save.write(); if (!EM.headless) { Snd.play('star'); UI.toast('📷 Nueva postal en tu álbum: ' + name); } return true; },
  lista() {
    const L = (typeof LUGARES !== 'undefined' ? LUGARES : []).filter(l => !l[9] && l[0] !== 'depot').map(l => ({ id: l[0], name: l[1], muni: l[2], lat: l[3], lon: l[4], dato: l[8], art: ALBUM_ARTE[l[0]] || '', como: 'Tómale la foto en Ciudad Libre: acércate y toca 📷.' }));
    return [...L, ...ALBUM_EXTRA];
  },
  /* vista aérea del mapa del juego en el lugar (se dibuja una vez y se guarda) */
  aerea(P, w, h) {
    if (this._img[P.id]) return this._img[P.id]; if (!MAP.ready || P.lat == null) return '';
    const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'), m = geoM(P.lat, P.lon);
    g.fillStyle = '#3a6b45'; g.fillRect(0, 0, w, h); MAP.drawTop(g, w, h, m.x, m.y, .9); MAP.drawLabels(g, w, h, m.x, m.y, .9, 1, 0);
    return this._img[P.id] = c.toDataURL('image/webp', .8);
  },
  open() {
    const P = this.lista(), n = P.filter(p => this.tiene(p.name)).length;
    UI.modal(`<h2>Álbum de postales</h2><p class="m">${n} de ${P.length}. Toma la foto en Ciudad Libre con 📷 cerca de cada lugar; las especiales se ganan llegando a su estación o jugando en fiestas.</p>
      <div class="album">${P.map((p, i) => { const ok = this.tiene(p.name); return `<button class="postal ${ok ? '' : 'falta'}" data-i="${i}"><span class="foto">${ok && p.art && Atlas.has(p.art) ? Atlas.tag(p.art, '', p.name) : ok ? '<i class="aer"></i>' : '<i class="q">?</i>'}</span><b>${esc(p.name)}</b><small>${esc(p.muni)}</small></button>`; }).join('')}</div>
      <button class="btn pri" id="alOk" style="margin-top:14px">Cerrar</button>`);
    $('#alOk').onclick = () => UI.close();
    $$('.album .postal').forEach(b => b.onclick = () => this.ver(P[+b.dataset.i]));
    // las vistas aéreas se dibujan de a una, sin trabar la pantalla
    const pend = [...document.querySelectorAll('.album .postal i.aer')]; let k = 0;
    const paso = () => { if (k >= pend.length || !pend[k].isConnected) return; const el = pend[k++], p = P[+el.closest('.postal').dataset.i], u = this.aerea(p, 240, 150); if (u) el.outerHTML = `<img src="${u}" alt="${esc(p.name)}">`; setTimeout(paso, 16); };
    setTimeout(paso, 60);
  },
  ver(p) {
    const ok = this.tiene(p.name), img = ok ? (p.art && Atlas.has(p.art) ? Atlas.tag(p.art, '', p.name) : `<img src="${this.aerea(p, 480, 300)}" alt="${esc(p.name)}">`) : '';
    UI.modal(`${img ? `<div class="postal-grande">${img}</div>` : ''}<h2>${esc(p.name)}</h2><p class="pag">${esc(p.muni)}</p><p class="m">${ok ? esc(p.dato) : esc(p.como)}</p><button class="btn pri" id="alVolver">Volver al álbum</button>`);
    $('#alVolver').onclick = () => this.open();
  },
  /* postales especiales al bajarse en su estación (Ciudad Libre) y por fechas (al terminar una partida) */
  estacion(nombre) { if (nombre === 'Arví') this.ganar('Parque Arví'); if (nombre === 'Gardel') this.ganar('Homenaje a Gardel'); },
  fechas() { const h = new Date().getHours(), noche = h >= 18 || h < 5; if (Vida.has('feria') || Vida.has('silleteros')) this.ganar('Desfile de Silleteros'); if (Vida.has('alumbrados') && noche) this.ganar('Alumbrados del río'); if (Vida.has('velitas')) this.ganar('Noche de las Velitas'); },
  check(E) { for (const p of this.lista()) { if (p.art && !Atlas.has(p.art)) E('álbum: falta el arte ' + p.art); if (!p.dato) E('álbum: sin dato ' + p.name); } return this.lista().length; }
};
