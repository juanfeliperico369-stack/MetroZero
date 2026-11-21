/* =====================================================================
   ATLAS · arte del juego embebido en src/data/arte.js (lo genera tools/arte_juego.py)
   Láminas (encargos G-): retratos, escenas y la maqueta isométrica, en WebP.
   Vectorial (encargos C-): íconos, logros, fiestas, portada y pantalla de carga, en SVG.
   Regla del proyecto: el arte nuevo SIEMPRE tiene respaldo. Si ARTE[id] no existe o no carga,
   cada módulo sigue dibujando su versión procedural de siempre.
   ===================================================================== */
if (typeof ARTE !== 'undefined' && !ARTE.ico_modo_carrera) {
  ARTE.ico_modo_carrera = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 70 55"><rect width="70" height="55" rx="10" fill="#1b3a2b"/><path d="M8 44 L24 20 L46 20 L62 44 Z" fill="#3a3d42"/><line x1="29" y1="20" x2="21" y2="44" stroke="#fff" stroke-width="1.2" stroke-dasharray="3,2"/><line x1="41" y1="20" x2="49" y2="44" stroke="#fff" stroke-width="1.2" stroke-dasharray="3,2"/><circle cx="25" cy="39" r="5" fill="#1b1b1b" stroke="#29b6f6" stroke-width="2"/><circle cx="46" cy="39" r="5" fill="#1b1b1b" stroke="#29b6f6" stroke-width="2"/><path d="M25 39 L43 39 L46 18 L41 18" fill="none" stroke="#9bd341" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><circle cx="35" cy="28" r="4" fill="#fdd835"/></svg>';
}
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
    const pend = new Set(['logro_intermodal', 'logro_ciclista', 'ico_modo_carrera', 'ico_modo_tranvia']);   // medallas encargadas a ChatGPT (C-12, 21 y 22) y el ícono de la carrera sin fin (Plan único, M4): mientras llegan, el respaldo procedural
    const need = [...MODECARDS.map(c => 'ico_modo_' + c.id), ...LOGROS.map(l => 'logro_' + l[0]).filter(id => !pend.has(id)), ...TRAMA.map(c => c.art).filter(Boolean), 'portada', 'carga'];
    for (const w of Object.keys(TRAMA_WHO)) if (this.WHO[w] && !this.retrato(w)) E('atlas: sin retrato de ' + w);
    for (const k of need) if (!this.has(k) && !pend.has(k)) E('atlas: falta ' + k);
    return Object.keys(ARTE).length;
  }
};
