/* =====================================================================
   ATLAS · arte del juego embebido en src/data/arte.js (lo genera tools/arte_juego.py)
   Láminas (encargos G-): retratos, escenas y la maqueta isométrica, en WebP.
   Vectorial (encargos C-): íconos, logros, fiestas, portada y pantalla de carga, en SVG.
   Regla del proyecto: el arte nuevo SIEMPRE tiene respaldo. Si ARTE[id] no existe o no carga,
   cada módulo sigue dibujando su versión procedural de siempre.
   ===================================================================== */
const Atlas = EM.atlas = {
  _u: {}, _i: {},
  has(id) { return typeof ARTE !== 'undefined' && Object.prototype.hasOwnProperty.call(ARTE, id); },
  /* URL lista para <img> o CSS (los SVG se convierten en data:image/svg+xml) */
  url(id) {
    if (!this.has(id)) return ''; if (this._u[id]) return this._u[id];
    const a = ARTE[id]; return this._u[id] = a.charCodeAt(0) === 60 ? 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(a) : a;
  },
  /* imagen lista para drawImage; null mientras carga o si no existe (y entonces va el respaldo) */
  img(id, onload) {
    if (!this.has(id) || typeof Image === 'undefined') return null;
    let im = this._i[id];
    if (!im) { im = this._i[id] = new Image(); im.decoding = 'async'; im.onload = () => { im._ok = 1; if (onload) onload(im); }; im.onerror = () => { im._bad = 1; }; im.src = this.url(id); }
    else if (onload && !im._ok && !im._bad) im.addEventListener('load', () => onload(im), { once: true });
    return im._ok ? im : null;
  },
  /* etiqueta <img> para la interfaz; cadena vacía si no hay arte */
  tag(id, cls = '', alt = '') { return this.has(id) ? `<img class="${cls}" src="${this.url(id)}" alt="${esc(alt)}" draggable="false" decoding="async">` : ''; },
  /* ícono de botón: el SVG del juego o, si falta, el respaldo (emoji o letra) */
  ico(id, fb) { return this.has(id) ? `<img class="aico" src="${this.url(id)}" alt="" draggable="false">` : fb; },
  ids(pre = '') { return typeof ARTE === 'undefined' ? [] : Object.keys(ARTE).filter(k => k.startsWith(pre)); },
  /* retrato del que habla, según el tono de la frase (alegre, triste o neutra) */
  WHO: { 'Rosalba': 'rosalba', 'Don Efraín': 'efrain', 'Doña Marleny': 'marleny', 'Wílmar': 'wilmar', 'Agente de tránsito': 'agente', 'Pasajero': 'pasajero', 'Tú': 'nieta', 'La nieta': 'nieta' },
  retrato(who, txt = '') {
    const b = this.WHO[who]; if (!b) return '';
    if (this.has('ret_' + b)) return 'ret_' + b;
    const tono = /(adi[oó]s|desp[ie]d|extra[ñn]|[uú]ltima vuelta|llor|l[aá]grim|me voy|jubil|triste|nunca m[aá]s)/i.test(txt) ? 'triste'
      : /(¡|jaja|qu[eé] bueno|felic|bien hecho|gracias|bacano|ch[eé]vere|qu[eé] belleza|orgull)/i.test(txt) ? 'alegre' : 'neutra';
    return ['ret_' + b + '_' + tono, 'ret_' + b + '_neutra'].find(k => this.has(k)) || '';
  },
  /* decoración de fiestas (C-50) para la portada y el menú, según el calendario real */
  FIESTA: { luces: ['fie_luz_estrella', 'fie_luz_flor', 'fie_farol_amarillo'], flores: ['fie_petalo_01', 'fie_petalo_02', 'fie_petalo_03', 'fie_petalo_05'], velas: ['fie_velita', 'fie_farol_rojo', 'fie_velita', 'fie_farol_amarillo'], banderas: ['fie_banderines_feria'] },
  fiesta() {
    const deco = typeof Mundo !== 'undefined' ? Mundo.deco() : '', L = this.FIESTA[deco]; if (!L) return '';
    const ids = L.filter(k => this.has(k)); if (!ids.length) return '';
    let h = ''; for (let i = 0; i < 9; i++) h += `<img src="${this.url(ids[i % ids.length])}" alt="" style="--i:${i}">`;
    return `<div class="fdeco ${deco}" aria-hidden="true">${h}</div>`;
  },
  /* verificación para el selfTest: ids bien formados y referencias del juego presentes */
  check(E) {
    if (typeof ARTE === 'undefined') { E('atlas: falta src/data/arte.js'); return 0; }
    for (const [k, v] of Object.entries(ARTE)) if (!/^data:image\/webp;base64,/.test(v) && !/^<svg[\s>]/.test(v)) E('atlas: ' + k + ' no es WebP ni SVG');
    const need = [...MODECARDS.map(c => 'ico_modo_' + c.id), ...LOGROS.map(l => 'logro_' + l[0]), ...TRAMA.map(c => c.art).filter(Boolean), 'portada', 'carga'];
    for (const w of Object.keys(TRAMA_WHO)) if (this.WHO[w] && !this.retrato(w)) E('atlas: sin retrato de ' + w);
    for (const k of need) if (!this.has(k)) E('atlas: falta ' + k);
    return Object.keys(ARTE).length;
  }
};
