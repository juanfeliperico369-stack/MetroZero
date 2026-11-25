/* =====================================================================
   VIDA DE LA RED: misiones del día, racha,
   logros, noticias con el calendario real de Medellín, temas y modo daltónico.
   ===================================================================== */
const MISIONES = [
  { k: 'trenes', m: 'despacho', t: n => 'Despacha ' + n + ' trenes', n: [8, 14, 20] },
  { k: 'buses', m: 'alim', t: n => 'Lleva ' + n + ' alimentadores', n: [10, 16, 24] },
  { k: 'mp', m: 'metroplus', t: n => 'Cruza ' + n + ' buses de Metroplús', n: [6, 10, 14] },
  { k: 'cables', m: 'cable', t: n => 'Arma ' + n + ' metrocables', n: [2, 3, 4] },
  { k: 'precision', m: 'conduce', t: n => 'Frena a menos de 1 m en ' + n + ' estaciones', n: [2, 4, 6] },
  { k: 'estrellas', m: null, t: n => 'Gana ' + n + ' estrellas', n: [4, 6, 9] }
];
const LOGROS = [
  ['primer', 'Primer viaje', 'Termina tu primera partida'], ['perfecto', 'Al centímetro', 'Frena a menos de 50 cm de la marca'], ['diez', 'Mano firme', '10 paradas a menos de 1 m'],
  ['lineaA', 'De punta a punta', 'Recorre la Línea A completa'], ['despacho100', 'Puesto de Control', 'Despacha 100 trenes en total'], ['mp50', 'Carril exclusivo', 'Cruza 50 buses de Metroplús'],
  ['cables6', 'Ciudad colgante', 'Arma un metrocable de cada línea'], ['tres10', 'Diez de diez', 'Consigue 3 ★ en 10 niveles'], ['flota', 'Gerente', 'Lleva una flota al máximo'],
  ['historia', 'La última vuelta', 'Termina la historia de Rosalba'], ['datos25', 'Enciclopedia paisa', 'Descubre 25 datos de estaciones'], ['noche', 'Turno de la noche', 'Juega después de las 7 p. m.'],
  ['madrugada', 'Antes del primer tren', 'Juega entre las 11 p. m. y las 4:30 a. m.'], ['duelo', 'Duelo de mesa', 'Juega un duelo en el mismo celular'], ['red', 'En red', 'Juega con otro celular'],
  ['racha3', 'Costumbre', 'Completa las misiones 3 días seguidos'], ['mil', 'Bolsillo lleno', 'Junta 1.000 pasajes'], ['tinto', 'Ni una gota', 'Termina un tramo con el tinto al 100 %'],
  ['flores', 'Feria de las Flores', 'Juega durante la Feria de las Flores (agosto)'], ['alumbrados', 'Alumbrados', 'Juega de noche en la temporada de Alumbrados'],
  ['intermodal', 'Metro + bici', 'En Ciudad Libre, viaja en metro, tranvía o cable y luego devuelve una bici EnCicla lejos de donde la tomaste'], ['ciclista', 'Ciclista secreto', 'Hay un timbre que suena tres veces debajo del metro…'],
  /* 3.9: con las medallas C-71 de ChatGPT */
  ['racha7', 'Siete días seguidos', 'Cumple el reto del día siete días seguidos'], ['combo8', 'Combo ×8', 'Encadena ocho trucos o barandas por la ciclorruta sin caerte'], ['zen', 'Amanecer en la ciclorruta', 'Termina el Domingo zen por la ciclorruta Las Vegas']
];
/* Domingo de Pascua (algoritmo anónimo gregoriano) */
function pascua(y) { const a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451), mo = Math.floor((h + l - 7 * m + 114) / 31), da = ((h + l - 7 * m + 114) % 31) + 1; return new Date(y, mo - 1, da); }
const Vida = EM.vida = {
  today() { const d = new Date(); return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()); },
  /* fiestas y fechas del Metro según el calendario real */
  fiestas(d = new Date()) {
    const out = Mundo.fiestas(d).map(f => ({ k: f.k, t: f.t })), h = d.getHours(); if (!serviceOpen(d)) out.push({ k: 'cerrado', t: 'El Metro está cerrado (abre a las ' + abreTxt(d) + '). Aquí puedes seguir manejando 😉' }); else if ((h >= 6 && h < 8) || (h >= 17 && h < 19)) out.push({ k: 'pico', t: 'Hora pico en el valle: más pasajeros y más trenes en la vía' }); const fe = festivo(d); if (fe) out.push({ k: 'festivo', t: 'Hoy es festivo (' + fe + '): el Metro va de 5 a. m. a 10 p. m.' }); else if (d.getDay() === 0) out.push({ k: 'domingo', t: 'Domingo: el Metro va de 5 a. m. a 10 p. m.' }); if (domingoOFestivo(d) && h >= 7 && h < 13) out.push({ k: 'ciclovia', t: '🚴 Ciclovía hasta la 1 p. m.: muchas vías son para bicis, patines y peatones' }); const w = Mundo.weather(); out.push({ k: 'clima', t: 'El tiempo en el valle: ' + w.name + ', ' + Mundo.temp() + ' °C' }); return out;
  },
  fiestasViejas(d = new Date()) {
    const y = d.getFullYear(), m = d.getMonth() + 1, day = d.getDate(), out = [], doy = x => Math.floor((x - new Date(x.getFullYear(), 0, 0)) / 864e5), dd = doy(d);
    const aniv = new Date(y, 10, 30), faltan = Math.ceil((aniv - new Date(y, m - 1, day)) / 864e5), años = y - 1995;
    if (faltan === 0) out.push({ k: 'aniv', t: '¡Hoy el Metro cumple ' + años + ' años! Abrió el 30 de noviembre de 1995 · pasajes ×2' });
    else if (faltan > 0 && faltan <= 21) out.push({ k: 'pre', t: 'Faltan ' + faltan + ' días para que el Metro cumpla ' + años + ' años (30 de noviembre)' });
    if ((m === 12) || (m === 1 && day <= 10)) out.push({ k: 'alumbrados', t: 'Temporada de Alumbrados: el río y los barrios se llenan de luces · paseos nocturnos con luces en la vía' });
    if (m === 8 && day <= 12) out.push({ k: 'feria', t: 'Feria de las Flores: los silleteros bajan de Santa Elena · flores en los andenes' });
    if (m === 12 && day === 24) out.push({ k: 'navidad', t: 'Nochebuena: el último tren sale más temprano. ¡Feliz Navidad!' });
    const P = pascua(y), dp = Math.round((new Date(y, m - 1, day) - P) / 864e5); if (dp >= -7 && dp <= 0) out.push({ k: 'santa', t: 'Semana Santa: horario especial y muchos viajeros hacia las terminales' });
    const h = d.getHours(); if (!serviceOpen(d)) out.push({ k: 'cerrado', t: 'El Metro está cerrado (abre a las ' + abreTxt(d) + '). Aquí puedes seguir manejando 😉' });
    else if ((h >= 6 && h < 8) || (h >= 17 && h < 19)) out.push({ k: 'pico', t: 'Hora pico en el valle: más pasajeros y más trenes en la vía' });
    return out;
  },
  has(k) { return this.fiestas().some(f => f.k === k); },
  /* entrega un logro desde cualquier modo (Ciudad Libre, EnCicla…) */
  logro(k) { const d = Save.d, L = d.logros || (d.logros = {}), q = LOGROS.find(x => x[0] === k); if (!q || L[k]) return; L[k] = Date.now(); Save.write(); if (!EM.headless) { Snd.play('star'); UI.toast('🏅 Logro: ' + q[1]); } },
  bonus() { return this.has('aniv') ? 2 : 1; },
  daily() {
    const d = Save.d, t = this.today();
    if (!d.daily || d.daily.date !== t) {
      const r = new RNG(hashStr(t)), pool = r.shuffle(MISIONES.slice()).slice(0, 3), prev = d.daily;
      d.streak = prev && prev.allDone && this.dayDiff(prev.date, t) === 1 ? (d.streak || 0) : 0; d.daily = { date: t, list: pool.map(M => ({ k: M.k, n: M.n[r.i(0, 2)], p: 0, done: false })), allDone: false };
      Save.write();
    }
    return d.daily;
  },
  dayDiff(a, b) { return Math.round((new Date(b) - new Date(a)) / 864e5); },
  /* se llama al terminar cada partida */
  onGame(mode, st, r) {
    const d = Save.d, D = this.daily(), inc = { trenes: mode === 'despacho' ? st.delivered | 0 : 0, buses: mode === 'alim' ? st.delivered | 0 : 0, mp: mode === 'metroplus' ? st.buses | 0 : 0, cables: mode === 'cable' && r.win ? 1 : 0, precision: mode === 'conduce' ? (st.arr || []).filter(a => a.err < 1).length : 0, estrellas: r.stars | 0 };
    const tot = d.tot || (d.tot = {}); for (const k in inc) tot[k] = (tot[k] || 0) + inc[k];
    let earned = 0;
    for (const m of D.list) { if (m.done) continue; m.p = Math.min(m.n, m.p + (inc[m.k] || 0)); if (m.p >= m.n) { m.done = true; earned += 40; UI.toast('Misión cumplida: ' + MISIONES.find(x => x.k === m.k).t(m.n) + ' · +40 🎫'); } }
    if (!D.allDone && D.list.every(m => m.done)) { D.allDone = true; d.streak = (d.streak || 0) + 1; earned += 60 + 10 * d.streak; UI.toast('¡Misiones del día completas! Racha 🔥 ' + d.streak + ' días'); }
    d.wallet += earned;
    // logros
    const L = d.logros || (d.logros = {}), get = k => { if (!L[k]) { L[k] = Date.now(); Snd.play('star'); UI.toast('🏅 Logro: ' + LOGROS.find(x => x[0] === k)[1]); } };
    get('primer'); const h = new Date().getHours(); if (h >= 19 || h < 5) get('noche'); if (!serviceOpen()) get('madrugada');
    if (mode === 'conduce') { if ((st.arr || []).some(a => a.err < .5)) get('perfecto'); if (tot.precision >= 10) get('diez'); if (st.line === 'A' && st.stops.length >= 21 && st.done) get('lineaA'); if (st.done && st.comfort >= 99.9 && st.stops.length > 2) get('tinto'); }
    if (tot.trenes >= 100) get('despacho100'); if (tot.mp >= 50) get('mp50');
    if (mode === 'cable') { const lines = new Set(Object.keys(d.stars.cable || {}).filter(k => d.stars.cable[k] > 0).map(k => k.split(':')[1])); if (lines.size >= 6) get('cables6'); }
    let n3 = 0; for (const m in d.stars) for (const l in d.stars[m]) if (d.stars[m][l] >= 3) n3++; if (n3 >= 10) get('tres10');
    if (Game.duel) get('duelo'); if (Game.net) get('red'); if ((d.streak || 0) >= 3) get('racha3'); if (d.wallet >= 1000) get('mil');
    if (Object.keys(d.facts).length >= 25) get('datos25'); if (d.story.ch >= CAPS.length - 1) get('historia');
    if (Object.values(d.red.lines).some(x => x.f >= 5)) get('flota');
    Album.fechas(); if (Vida.has('feria') || Vida.has('silleteros')) get('flores'); if (Vida.has('alumbrados') && (h >= 18 || h < 5)) get('alumbrados');
    Save.write();
  },
  /* noticias para la cinta del menú */
  news() {
    const d = Save.d, out = this.fiestas().map(f => f.t), r = new RNG(Date.now() / 600000 | 0), facts = Object.entries(LINE_META.stationFacts);
    for (let i = 0; i < 3 && facts.length; i++) { const [k, v] = facts[r.i(0, facts.length - 1)]; out.push(k + ': ' + v); }
    if (d.red.pax) out.push('Tu red ya movió ' + fmt(d.red.pax) + ' pasajeros');
    out.push('Cultura Metro: deja salir antes de entrar · cede la silla · no comas en los vagones');
    if ((d.streak || 0) > 0) out.push('Racha de misiones: 🔥 ' + d.streak + ' días');
    return out;
  },
  /* panel de misiones + logros en el menú */
  panel() {
    const D = this.daily(), d = Save.d, nl = Object.keys(d.logros || {}).length;
    const F = this.fiestas().map(f => f.k), ART = { alumbrados: 'esc_alumbrados', feria: 'esc_silleteros', silleteros: 'esc_silleteros', velitas: 'esc_velitas' }, fk = F.find(k => ART[k] && Atlas.has(ART[k])), ft = fk ? this.fiestas().find(f => f.k === fk).t : '';
    return `${fk ? `<div class="fiesta-ban">${Atlas.tag(ART[fk], '', ft)}<span>${esc(ft)}</span></div>` : ''}<div class="news"><div class="tick">${this.news().map(t => '<span>✦ ' + esc(t) + '</span>').join('')}</div></div>
      <div class="boxed" style="margin:12px 0"><div class="row" style="justify-content:space-between;align-items:baseline"><h3 style="margin:0">Misiones de hoy</h3><span class="pag">🔥 ${d.streak || 0} ${d.streak === 1 ? 'día' : 'días'} seguidos · 🏅 ${nl} de ${LOGROS.length}</span></div>
      ${D.list.map(m => { const M = MISIONES.find(x => x.k === m.k); return `<div class="row" style="margin-top:8px;gap:8px"><span style="flex:1;min-width:0;font-size:14px;${m.done ? 'text-decoration:line-through;opacity:.6' : ''}">${esc(M.t(m.n))}</span><span class="bar" style="width:90px"><i style="width:${Math.round(m.p / m.n * 100)}%"></i></span><b style="font-size:12px;width:44px;text-align:right">${m.p}/${m.n}</b></div>`; }).join('')}
      <div class="row" style="margin-top:10px"><button class="btn sm" id="vLog">🏅 Logros</button><button class="btn sm" id="vAlb">📷 Álbum ${Album.n()}/${Album.lista().length}</button><button class="btn sm" id="vTema">🎨 Tema</button></div></div>`;
  },
  bindPanel() { const a = $('#vLog'); if (a) a.onclick = () => this.logros(); const al = $('#vAlb'); if (al) al.onclick = () => Album.open(); const b = $('#vTema'); if (b) b.onclick = () => this.temas(); },
  logros() {
    const L = Save.d.logros || {};
    UI.modal(`<div class="pag">Logros · ${Object.keys(L).length}/${LOGROS.length}</div><h2>Tu libreta</h2><div class="col">${LOGROS.map(([k, t, d]) => `<div class="row" style="gap:10px;flex-wrap:nowrap;align-items:center;${L[k] ? '' : 'opacity:.45'}">${Atlas.has('logro_' + k) ? `<img class="medal" src="${Atlas.url('logro_' + k)}" alt="" style="${L[k] ? '' : 'filter:grayscale(1)'}">` : `<span style="font-size:22px">${L[k] ? '🏅' : '○'}</span>`}<span style="flex:1;min-width:0"><b>${esc(t)}</b><br><small>${esc(d)}</small></span></div>`).join('')}</div><button class="btn pri" id="lgOk" style="margin-top:12px">Cerrar</button>`);
    $('#lgOk').onclick = () => UI.close();
  },
  temas() {
    const s = Save.d.settings;
    UI.modal(`<div class="pag">Apariencia</div><h2>Tema</h2><div class="tg" id="tmT">${[['metro', 'Metro'], ['noche', 'Noche'], ['contraste', 'Alto contraste']].map(([k, n]) => `<button data-t="${k}" class="${this.tema() === k ? 'on' : ''}">${n}</button>`).join('')}</div><div class="pag" style="margin-top:10px">Colores</div><div class="tg" id="tmD"><button data-d="0" class="${s.dalt ? '' : 'on'}">Normales</button><button data-d="1" class="${s.dalt ? 'on' : ''}">Modo daltónico</button></div><p class="m">El modo daltónico cambia los colores de los vehículos y andenes en los modos de agujas (las letras siempre se muestran).</p><button class="btn pri" id="tmOk">Listo</button>`);
    $$('#tmT button').forEach(b => b.onclick = () => { s.tema = b.dataset.t; this.apply(); Save.write(); $$('#tmT button').forEach(x => x.classList.toggle('on', x === b)); });
    $$('#tmD button').forEach(b => b.onclick = () => { s.dalt = +b.dataset.d; Save.write(); $$('#tmD button').forEach(x => x.classList.toggle('on', x === b)); });
    $('#tmOk').onclick = () => UI.close();
  },
  /* tema visual: metro (claro), noche o alto contraste; las partidas viejas con 'revista' pasan a 'metro' */
  tema() { const t = Save.d.settings.tema; return t === 'noche' || t === 'contraste' ? t : 'metro'; },
  apply() { const t = this.tema(); document.documentElement.className = 't-' + t; const m = $('meta[name=theme-color]'); if (m) m.content = t === 'contraste' ? '#000000' : '#0F2238'; }
};
