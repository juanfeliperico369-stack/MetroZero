/* =====================================================================
   HISTORIA EN LA CIUDAD · "La última vuelta" jugada sobre el mapa real.
   Pasos: hablar con personajes, ir a un lugar, abordar una línea, bajarse en una estación,
   tomar una postal, orientar pasajeros y pasar a manejar (metro, cable, bus, tranvía).
   Al terminar cada módulo se vuelve a la ciudad en la estación de llegada.
   Progreso: Save.d.trama = { c: capítulo, s: paso, fin }.
   ===================================================================== */
const TRAMA_WHO = {
  'Rosalba': { col: '#12446c', hair: '#dcd8d0', skin: '#f1c9a5' },
  'Don Efraín': { col: '#5a6470', hair: '#e6e6e6', skin: '#d9a77f' },
  'Doña Marleny': { col: '#c8201f', hair: '#2a1a12', skin: '#b07a52' },
  'Wílmar': { col: '#f4f1ea', hat: '#1C5C9C', skin: '#8a5a3b' },
  'Agente de tránsito': { col: '#c7e000', hat: '#f4f1ea', skin: '#d9a77f' },
  'Pasajero': { col: '#7a5cc4', skin: '#d9a77f' }
};
const TRAMA = [
  { t: 'Niquía, 4:30 a. m.', steps: [
    { k: 'hablar', who: 'Rosalba', at: 'Niquía', txt: 'Rosalba te espera en la estación Niquía', lines: [
      ['Rosalba', 'Mija, despierte. El primer tren sale a las cuatro y media y la ciudad no espera a nadie.'],
      ['Rosalba', 'Hace treinta años me senté en una cabina por primera vez. Medellín estrenaba metro y yo estrenaba miedo.'],
      ['Rosalba', 'Esta es mi última semana. Y quiero que la manejemos juntas: usted adelante y yo al lado, con mi tinto.']] },
    { k: 'modulo', who: 'Rosalba', at: 'Niquía', m: 'conduce', lv: 'A:0-2#escuela', fin: 'Madera', finLine: 'A', txt: 'Sube a la cabina con Rosalba: Escuela de conducción de Niquía a Madera', lines: [
      ['Rosalba', 'Primero la llave, después el sentido, y espere la señal. Suba la palanca despacito… y frene en la marca, que la gente se cansa de caminar.']],
      ok: 'Ese frenazo suave es lo que la gente recuerda. Nadie aplaude al conductor, pero todos llegan.' }
  ] },
  { t: 'Santo Domingo mira al cielo', steps: [
    { k: 'hablar', who: 'Rosalba', at: 'Madera', line: 'A', txt: 'Habla con Rosalba en Madera', lines: [
      ['Rosalba', 'Ahora va a conocer el cable. En 2004 subió aquí el primer metrocable del mundo hecho para transporte público de verdad.'],
      ['Rosalba', 'Tome el metro hacia el sur hasta Acevedo. Allá, sin salir de la estación, se pasa al Metrocable K. Yo me voy en el que sigue.']] },
    { k: 'abordar', line: 'A', at: 'Madera', txt: 'Sube al metro en Madera (hacia La Estrella)' },
    { k: 'bajar', line: 'A', at: 'Acevedo', txt: 'Bájate en Acevedo' },
    { k: 'abordar', line: 'K', at: 'Acevedo', txt: 'Sube al Metrocable K en Acevedo' },
    { k: 'bajar', line: 'K', at: 'Santo Domingo Savio', txt: 'Bájate arriba, en Santo Domingo Savio' },
    { k: 'hablar', who: 'Doña Marleny', at: 'Santo Domingo Savio', line: 'K', txt: 'Doña Marleny vende arepas junto a la estación', lines: [
      ['Doña Marleny', '¡Usted es la nieta de Rosalba! Antes yo bajaba hora y media a pie con el mercado. Ahora en minutos estoy arriba viendo toda la ciudad.'],
      ['Doña Marleny', 'Vaya y tómele una foto a la biblioteca, la de las tres rocas negras. Desde allá se ve el valle completico.']] },
    { k: 'foto', lugar: 'bibespana', txt: 'Toma la postal del Parque Biblioteca España con 📷' },
    { k: 'modulo', who: 'Doña Marleny', at: 'Santo Domingo Savio', line: 'K', m: 'cableviaje', lv: 'cv:K', fin: 'Santo Domingo Savio', finLine: 'K', txt: 'Vuelve con Doña Marleny: hoy operas la línea K', lines: [
      ['Doña Marleny', 'Rosalba dice que hoy usted opera la línea. Si el viento sopla duro, baje la velocidad; si truena, se detiene todo. Y no se olvide de las fotos.']],
      ok: 'Desde la cabina, el valle se ve como un pesebre encendido.' }
  ] },
  { t: 'Los que alimentan la red', steps: [
    { k: 'hablar', who: 'Rosalba', at: 'Santo Domingo Savio', line: 'K', txt: 'Rosalba llegó en el cable de atrás: habla con ella', lines: [
      ['Rosalba', 'El metro no llega a cada esquina. Por eso existen los alimentadores: buses que bajan de los barrios hasta las estaciones.'],
      ['Rosalba', 'Baje en el cable hasta Acevedo y súbase al alimentador de Santa Rita. Allá la espera Wílmar, que se sabe las lomas de memoria.']] },
    { k: 'abordar', line: 'K', at: 'Santo Domingo Savio', txt: 'Baja en el Metrocable K hacia Acevedo' },
    { k: 'bajar', line: 'K', at: 'Acevedo', txt: 'Bájate en Acevedo' },
    { k: 'abordar', line: 'AL-C6-001', at: 'Acevedo', txt: 'Sube al alimentador C6-001 hacia Santa Rita' },
    { k: 'bajar', line: 'AL-C6-001', at: 'Santa Rita', txt: 'Bájate en Santa Rita, al final de la ruta' },
    { k: 'hablar', who: 'Wílmar', at: 'Santa Rita', line: 'AL-C6-001', txt: 'Wílmar te espera en la cabecera', lines: [
      ['Wílmar', '¡Llegó la aprendiz! Venga, súbase: hoy maneja usted, de Santa Rita a la estación Acevedo.'],
      ['Wílmar', 'En subida, palanca a fondo; en bajada, freno suave. Y pare donde está la gente, no diez metros después.']] },
    { k: 'modulo', who: 'Wílmar', at: 'Santa Rita', line: 'AL-C6-001', m: 'bus', lv: 'bus:AL-C6-001:0-3', fin: 'Acevedo', finLine: 'A', txt: 'Maneja el alimentador de Santa Rita a Acevedo', lines: [
      ['Wílmar', 'Si quiere, deje el asistente de carril. Cuando se sienta segura, apáguelo y maneje con el timón.']],
      ok: 'Una señora se bajó en Acevedo y le dijo: “Usted maneja suavecito, mija. Así sí da gusto”.' }
  ] },
  { t: 'El articulado', steps: [
    { k: 'hablar', who: 'Rosalba', at: 'Acevedo', line: 'A', txt: 'Rosalba te espera en Acevedo', lines: [
      ['Rosalba', '¡Así se hace! Ahora el Metroplús: buses articulados de dieciocho metros con su propio carril.'],
      ['Rosalba', 'Tome el metro hasta Hospital y allá el Metroplús hacia Parque Aranjuez. El agente de tránsito la espera.']] },
    { k: 'abordar', line: 'A', at: 'Acevedo', txt: 'Sube al metro hacia el sur (andén a La Estrella)' },
    { k: 'bajar', line: 'A', at: 'Hospital', txt: 'Bájate en Hospital' },
    { k: 'abordar', line: 'MP1', at: 'Hospital', txt: 'Sube al Metroplús Línea 1 hacia Parque Aranjuez' },
    { k: 'bajar', line: 'MP1', at: 'Parque Aranjuez', txt: 'Bájate en Parque Aranjuez' },
    { k: 'hablar', who: 'Agente de tránsito', at: 'Parque Aranjuez', line: 'MP1', txt: 'Habla con el agente de tránsito', lines: [
      ['Agente de tránsito', 'El carril es exclusivo, pero los semáforos son para todos. Rojo es rojo.'],
      ['Agente de tránsito', 'Y ojo con las motos: esas se cuelan hasta por el ojo de una aguja.']] },
    { k: 'modulo', who: 'Agente de tránsito', at: 'Parque Aranjuez', line: 'MP1', m: 'bus', lv: 'bus:MP1:0-4', fin: 'Gardel', finLine: 'MP1', txt: 'Maneja el articulado de Parque Aranjuez a Gardel', lines: [
      ['Agente de tránsito', 'Dieciocho metros con una bisagra en la mitad: en las curvas, la cola va por dentro. Pare justo frente a la puerta del andén.']],
      ok: 'Al llegar a Gardel, el bus quedó justo frente a la puerta del andén. Perfecto.' }
  ] },
  { t: 'Ayacucho sobre llantas', steps: [
    { k: 'ir', at: 'San Antonio', line: 'T', r: 35, txt: 'Ve al tranvía en San Antonio (Metroplús 2 hasta San José y tranvía, o como quieras)' },
    { k: 'hablar', who: 'Rosalba', at: 'San Antonio', line: 'T', txt: 'Rosalba está en el andén del tranvía', lines: [
      ['Rosalba', 'El tranvía de Ayacucho rueda sobre llantas y lo guía un riel en el centro. Sube lomas que un tren normal no se atrevería.'],
      ['Rosalba', 'Aquí hay semáforos y gente cruzando. Despacio y con cariño.']] },
    { k: 'modulo', who: 'Rosalba', at: 'San Antonio', line: 'T', m: 'conduce', lv: 'T:0-2', fin: 'Pabellón del Agua', finLine: 'T', txt: 'Maneja el tranvía de San Antonio a Pabellón del Agua', lines: [
      ['Rosalba', 'Vamos, que la loma no se sube sola.']],
      ok: 'Una señora le dijo adiós desde un balcón con una ruana en la mano.' }
  ] },
  { t: 'La hora pico', steps: [
    { k: 'ir', at: 'San Antonio', line: 'A', r: 40, txt: 'Vuelve a la estación San Antonio: Don Efraín necesita ayuda' },
    { k: 'hablar', who: 'Don Efraín', at: 'San Antonio', line: 'A', txt: 'Habla con Don Efraín', lines: [
      ['Don Efraín', '¡Rosalbita me contó de usted! Llegó la hora pico: las cinco y media, cuando todo el valle quiere volver a casa.'],
      ['Don Efraín', 'En San Antonio se cruzan la línea A, la B y el tranvía, y la gente se enreda. Ayúdeme a orientar a tres pasajeros.']] },
    { k: 'orientar', at: 'San Antonio', line: 'A', n: 3, txt: 'Orienta a los pasajeros con ❓' },
    { k: 'hablar', who: 'Don Efraín', at: 'San Antonio', line: 'A', txt: 'Vuelve con Don Efraín', lines: [
      ['Don Efraín', 'Usted tiene mano. Lo difícil no es mover los trenes: es no perder la calma.'],
      ['Don Efraín', 'Rosalba la espera en Niquía para la última vuelta. Súbase al metro hacia el norte.']] }
  ] },
  { t: 'La última vuelta', steps: [
    { k: 'abordar', line: 'A', at: 'San Antonio', txt: 'Sube al metro hacia el norte (andén a Niquía)' },
    { k: 'bajar', line: 'A', at: 'Niquía', txt: 'Bájate en Niquía' },
    { k: 'hablar', who: 'Rosalba', at: 'Niquía', txt: 'Rosalba te espera con dos tintos', lines: [
      ['Rosalba', 'Mañana ya no vengo. Hoy maneja usted, de Niquía a La Estrella, todo el valle de punta a punta.'],
      ['Tú', '¿Y usted qué va a hacer?'],
      ['Rosalba', 'Montarme de pasajera. Sentarme en la ventana, mirar el río y saber que el tren está en buenas manos.']] },
    { k: 'modulo', who: 'Rosalba', at: 'Niquía', m: 'conduce', lv: 'A:0-20', fin: 'La Estrella', finLine: 'A', txt: 'La última vuelta: maneja de Niquía a La Estrella', lines: [
      ['Rosalba', 'Vamos, mija. Sin afán y sin regar el tinto.']],
      ok: 'En cada estación alguien la reconoció y la saludó. Rosalba lloró en silencio, con el tinto entre las manos, sin regar ni una gota.' }
  ] },
  { t: 'Epílogo', steps: [
    { k: 'hablar', who: 'Rosalba', at: 'La Estrella', line: 'A', txt: 'Despídete de Rosalba en La Estrella', lines: [
      ['Tú', 'Ahora la red es nuestra: los cables, los buses, el tranvía, los trenes y los que vienen.'],
      ['Rosalba', 'La red no es de hierro, mija. Es de la gente que la cuida. Cultura Metro, ¿sí o qué?'],
      ['', 'FIN DE LA HISTORIA · La ciudad sigue abierta: oficios, postales y todas las líneas.']] }
  ] }
];
/* preguntas de orientación (la primera opción es la correcta; el último dato es la estación de destino) */
/* arte de cada capítulo (src/data/arte.js) y el cielo que va detrás de las ilustraciones con fondo transparente */
const TRAMA_ART = ['esc_noche', 'esc_ladera_atardecer', 'esc_aguacero', 'esc_tango', 'iso_centro', 'esc_dia', 'carga', 'portada'];
TRAMA.forEach((c, i) => { c.art = TRAMA_ART[i]; });
const TRAMA_SKY = { esc_noche: 'linear-gradient(#0b1630,#23365c 70%,#3a4d73)', esc_dia: 'linear-gradient(#7fb6df,#d6ecfb)', esc_ladera_atardecer: 'linear-gradient(#3d2e5f,#c97b78 55%,#f4d9a8)', iso_centro: 'linear-gradient(#f4ecd0,#d9cdae)' };
const TRAMA_PREG = [
  ['¿Cómo llego a Santo Domingo Savio?', ['Línea A al norte hasta Acevedo y ahí el Metrocable K', 'Línea B hasta San Javier y el cable J', 'Tranvía hasta Oriente y el cable H'], 'Santo Domingo Savio'],
  ['Voy para La Aurora, arriba de San Javier.', ['Línea B hasta San Javier y el Metrocable J', 'Línea A hasta Acevedo y el cable P', 'Tranvía hasta Miraflores y el cable M'], 'La Aurora'],
  ['¿Cómo subo a Villa Sierra?', ['Tranvía de Ayacucho hasta Oriente y el Metrocable H', 'Línea A hasta Acevedo y el cable K', 'Línea B hasta San Javier y el cable J'], 'Villa Sierra'],
  ['Quiero ir a caminar al Parque Arví.', ['Línea A a Acevedo, cable K a Santo Domingo y luego el cable L', 'Tranvía a Oriente y cable H', 'Línea B a San Javier y cable J'], 'Arví'],
  ['Necesito llegar al Trece de Noviembre.', ['Tranvía hasta Miraflores y el Metrocable M', 'Línea A hasta Acevedo y el cable P', 'Línea B hasta Estadio y caminar'], 'Trece de Noviembre'],
  ['¿Cómo llego a El Progreso, en el Doce de Octubre?', ['Línea A al norte hasta Acevedo y el Metrocable P', 'Línea B hasta San Javier y el cable J', 'Tranvía hasta Oriente y el cable H'], 'El Progreso'],
  ['Voy para el parque de Envigado.', ['Línea A hacia el sur hasta la estación Envigado', 'Línea B hacia San Javier', 'Tranvía hacia Oriente'], 'Envigado'],
  ['Tengo partido en el Atanasio Girardot.', ['Línea B hasta la estación Estadio', 'Línea A hasta Industriales', 'Tranvía hasta Bicentenario'], 'Estadio']
];
const Trama = EM.trama = {
  save() { const d = Save.d; return d.trama || (d.trama = { c: 0, s: 0, fin: 0 }); },
  cap() { return TRAMA[this.save().c] || null; },
  step() { const C = this.cap(); return C ? C.steps[this.save().s] || null : null; },
  active() { const T = this.save(); return !T.fin && !!this.step(); },
  /* posición de una estación (de una línea concreta si se indica), de un centro o de un lugar */
  stPos(name, line) {
    const l = line && NET.byId[line], s = l ? l.st.find(q => q.name === name) : null; if (s) return { x: s.x, y: s.y, name };
    const h = NET.stations.find(q => q.name === name); if (h) return { x: h.x, y: h.y, name };
    const L = (Ciudad.lm || []).find(q => q.id === name || q.name === name); if (L) return { x: L.x, y: L.y, name: L.name };
    return null;
  },
  walkable(q) { return q === TT.WALK || q === TT.PLAZA || q === TT.STATION || q === TT.STEPS || q === TT.GRASS; },
  npcPos(S, i = 0) {
    const p = this.stPos(S.at, S.line); if (!p) return null; const a = h2(hashStr((S.who || 'p') + i), 3, 11) * TAU, r = 12 + i * 7;
    const t = Libre.nearTile(p.x + Math.cos(a) * r, p.y + Math.sin(a) * r, q => this.walkable(q), 6); return { x: t.x, y: t.y, a: a + Math.PI };
  },
  /* ---------- ciclo de vida ---------- */
  init(st) { st.trama = { npcs: [], talk: null, key: '', talked: 0, warned: 0, rode: 0, ok: 0 }; this.enter(st); },
  enter(st) {
    const T = this.save(), C = this.cap(), S = this.step(), tr = st.trama; tr.key = T.c + ':' + T.s; tr.npcs = []; tr.talk = null; tr.talked = 0; tr.warned = 0; tr.rode = st.mode === 'ride' ? 1 : 0; tr.ok = 0;
    if (!S) { st.goal = null; return; }
    if (S.k === 'hablar' || S.k === 'modulo') { const p = this.npcPos(S); if (p) tr.npcs.push(Object.assign({ who: S.who, mark: S.k === 'modulo' ? '▶' : '!' }, p)); }
    if (S.k === 'orientar') { const rng = new RNG(T.c * 31 + (T.preg || 0) + 7), pool = TRAMA_PREG.slice(); for (let i = 0; i < S.n && pool.length; i++) { const q = pool.splice(rng.i(0, pool.length - 1), 1)[0], p = this.npcPos({ at: S.at, line: S.line, who: 'Pasajero' }, i + 1); if (p) tr.npcs.push(Object.assign({ who: 'Pasajero', mark: '?', q, ord: rng.shuffle([0, 1, 2]), col: ROPA[(i * 3 + 1) % ROPA.length] }, p)); } }
    const g = S.k === 'foto' ? this.stPos(S.lugar) : (tr.npcs[0] || this.stPos(S.at, S.line));
    st.goal = g ? { x: g.x, y: g.y, title: 'Cap. ' + (T.c + 1) + ' · ' + C.t, hint: S.txt, k: S.k } : null;
    if (T.s === 0) { Libre.msg(st, '📖 Capítulo ' + (T.c + 1) + ' · ' + C.t, 'b'); this.card(st, T.c, C.t); }
    Libre.msg(st, '📖 ' + S.txt, 'y');
  },
  card(st, c, t, tries = 0) {
    if (EM.headless || st.auto) return;
    // al empezar, la partida aún no está montada: se reintenta un momento después
    if (Game.st !== st) { if (tries < 8) setTimeout(() => this.card(st, c, t, tries + 1), 250); return; }
    const host = $('#gctl'); if (!host) return; const el = document.createElement('div'), art = TRAMA[c] && TRAMA[c].art;
    if (art && Atlas.has(art)) {   // tarjeta ilustrada del capítulo: se cierra sola o al tocarla
      el.className = 'trcard'; el.innerHTML = `<div class="in"><div class="pic" style="background:${TRAMA_SKY[art] || 'var(--noche)'}">${Atlas.tag(art, '', t)}</div><small>La última vuelta · Capítulo ${c + 1} de ${TRAMA.length}</small><b>${esc(t)}</b><i>Toca para seguir</i></div>`;
      const bye = () => { if (el.isConnected) { el.classList.add('out'); setTimeout(() => el.remove(), 300); } }; el.onclick = bye; host.appendChild(el); setTimeout(bye, 5200); return;
    }
    el.className = 'trcap'; el.innerHTML = `<small>La última vuelta · Capítulo ${c + 1} de ${TRAMA.length}</small><b>${esc(t)}</b>`; host.appendChild(el); setTimeout(() => el.remove(), 3800);
  },
  advance() { const T = this.save(); T.s++; let newCap = false; if (T.s >= TRAMA[T.c].steps.length) { T.c++; T.s = 0; newCap = true; Save.d.wallet += 30; if (T.c >= TRAMA.length) { T.fin = 1; const L = Save.d.logros || (Save.d.logros = {}); if (!L.historia) { L.historia = Date.now(); if (!EM.headless) UI.toast('🏅 Logro: La última vuelta'); } } } Save.write(); return newCap; },
  next(st) {
    const T = this.save(), c0 = T.c, newCap = this.advance();
    if (newCap) { Libre.msg(st, '✓ Capítulo ' + (c0 + 1) + ' completo · +30 🎫', 'g'); Libre.sfx(st, 'win'); } else Libre.sfx(st, 'star');
    if (T.fin) { st.goal = null; st.trama.npcs = []; Libre.msg(st, 'FIN · La ciudad sigue abierta: oficios, postales y todas las líneas', 'g'); return; }
    this.enter(st);
  },
  wantLine(st) { const S = this.step(); return S && S.k === 'abordar' ? S.line : null; },
  tick(st, dt) {
    const S = this.step(), tr = st.trama; if (!S || this.save().fin) return; if (tr.key !== this.save().c + ':' + this.save().s) this.enter(st);
    if (tr.talk) { if (st.mode !== 'walk' || !tr.talk.n || dist(st.x, st.y, tr.talk.n.x, tr.talk.n.y) > 9) this.close(st); return; }
    if (S.k === 'hablar' || S.k === 'modulo' || S.k === 'orientar') {
      if (st.mode === 'walk') { const n = tr.npcs.find(q => !q.done && dist(q.x, q.y, st.x, st.y) < 4); if (n && !tr.talked) this.talk(st, n); else if (!n && tr.talked && !tr.npcs.some(q => !q.done && dist(q.x, q.y, st.x, st.y) < 8)) tr.talked = 0; }
      if (S.k === 'orientar') { const left = tr.npcs.filter(q => !q.done); if (left.length && st.goal) { let b = left[0], bd = 1e9; for (const q of left) { const d = dist(q.x, q.y, st.x, st.y); if (d < bd) { bd = d; b = q; } } st.goal.x = b.x; st.goal.y = b.y; st.goal.hint = S.txt + ' (' + (S.n - left.length) + '/' + S.n + ')'; } }
      if (st.auto) { const n = tr.npcs.find(q => !q.done); if (n) { st.x = n.x; st.y = n.y; } }
    } else if (S.k === 'ir') { if (st.goal && dist(st.x, st.y, st.goal.x, st.goal.y) < (S.r || 30) && st.mode !== 'ride') this.next(st); }
    else if (S.k === 'abordar') {
      if (st.mode === 'ride') { if (st.ride.line.id === S.line) { tr.rode = 1; this.next(st); } else if (!tr.warned) { tr.warned = 1; Libre.msg(st, 'Esa es la ' + st.ride.line.name + '. Necesitas la ' + NET.byId[S.line].name, 'y'); } }
      else tr.warned = 0;
    } else if (S.k === 'bajar') {
      const g = st.goal, d = g ? dist(st.x, st.y, g.x, g.y) : 1e9;
      if (st.mode === 'ride') { tr.rode = 1; const v = st.ride; if (v.ph === 'dwell' && v.st && v.st.name === S.at && !tr.warned) { tr.warned = 1; Libre.msg(st, '🚉 ¡Es aquí! Bájate en ' + S.at + ' con ●', 'g'); Libre.sfx(st, 'beep'); } else if (v.ph !== 'dwell') tr.warned = 0; if (st.auto && v.ph === 'dwell' && v.st && v.st.name === S.at) Libre.action(st); }
      else if (d < 90) this.next(st);
      else if (tr.rode && !tr.warned2) { tr.warned2 = 1; Libre.msg(st, 'Te bajaste antes de tiempo: vuelve a subir y bájate en ' + S.at, 'y'); }
    }
  },
  /* ---------- conversación ---------- */
  talk(st, n) {
    const S = this.step(), tr = st.trama; tr.talked = 1; if (!S) return;
    tr.talk = { n, i: 0, lines: n.q ? null : (S.lines || []) };
    if (EM.headless || st.auto || Game.st !== st) { // el bot responde solo
      if (n.q) this.answer(st, 0); else { tr.talk = null; if (S.k === 'modulo') this.launch(st, S); else this.next(st); } return;
    }
    Snd.play('tap'); this.render(st);
  },
  render(st) {
    const el = $('#trTalk'), tr = st.trama, T = tr.talk; if (!el) return; if (!T) { el.className = 'trtalk hide'; el.innerHTML = ''; return; }
    const S = this.step(), n = T.n; el.className = 'trtalk';
    if (n.q) {
      const [q, opts] = n.q; el.innerHTML = `${Atlas.tag(Atlas.retrato('Pasajero'), 'face', 'Pasajero')}<b class="who">Pasajero</b><p>${esc(T.msg || q)}</p><div class="opts">${n.ord.map(i => `<button class="btn sm" data-o="${i}">${esc(opts[i])}</button>`).join('')}</div><button class="x" data-x>✕</button>`;
      el.classList.toggle('conface', !!el.querySelector('.face')); el.querySelectorAll('[data-o]').forEach(b => b.onclick = () => this.answer(st, +b.dataset.o)); el.querySelector('[data-x]').onclick = () => this.close(st); return;
    }
    const L = T.lines[T.i] || ['', '']; const last = T.i >= T.lines.length - 1;
    if (T.said !== T.i) { T.said = T.i; if (L[1]) Snd.say(L[1]); }
    const face = L[0] ? Atlas.retrato(L[0], L[1]) : ''; el.classList.toggle('conface', !!face);
    el.innerHTML = `${face ? Atlas.tag(face, 'face', L[0]) : ''}${L[0] ? `<b class="who">${esc(L[0])}</b>` : ''}<p>${esc(L[1])}</p><div class="opts">${last && S.k === 'modulo' ? `<button class="btn pri sm" data-go>▶ ¡Vamos!</button><button class="btn sm gh" data-later>Más tarde</button>` : `<button class="btn pri sm" data-n>${last ? 'Listo ✓' : 'Siguiente ▶'}</button>`}</div>`;
    const nb = el.querySelector('[data-n]'); if (nb) nb.onclick = () => { Snd.play('tap'); if (T.i < T.lines.length - 1) { T.i++; this.render(st); } else { tr.talk = null; this.render(st); this.next(st); } };
    const go = el.querySelector('[data-go]'); if (go) go.onclick = () => { tr.talk = null; this.render(st); this.launch(st, S); };
    const lt = el.querySelector('[data-later]'); if (lt) lt.onclick = () => this.close(st);
  },
  close(st) { st.trama.talk = null; this.render(st); },
  answer(st, o) {
    const tr = st.trama, T = tr.talk, n = T && T.n; if (!n) return; const ok = o === 0, dest = n.q[2];
    if (ok) { n.done = 1; tr.ok++; Save.d.wallet += 5; Libre.msg(st, '✓ «¡Mil gracias!» · +5 🎫', 'g'); Libre.sfx(st, 'coin'); Ciudad.say(n, '¡Gracias, mija!'); tr.talk = null; this.render(st); if (tr.npcs.every(q => q.done)) { const T2 = this.save(); T2.preg = (T2.preg || 0) + 1; this.next(st); } }
    else { T.msg = 'Mmm… creo que por ahí no llego a ' + dest + '. Mira dónde se cruza esa línea con el metro.'; Libre.sfx(st, 'bad'); this.render(st); }
  },
  onAction(st) {
    if (st.mode !== 'walk' || !this.active()) return false; const tr = st.trama;
    const n = tr.npcs.find(q => !q.done && dist(q.x, q.y, st.x, st.y) < 5); if (n) { this.talk(st, n); return true; } return false;
  },
  onPhoto(st) {
    const S = this.step(); if (!S || S.k !== 'foto' || !st.goal || !this.active()) return false;
    if (dist(st.x, st.y, st.goal.x, st.goal.y) < 90) { st.flash = .4; const L = this.stPos(S.lugar), F = Save.d.fotos || (Save.d.fotos = []); if (L && !F.includes(L.name)) F.push(L.name); Libre.msg(st, '📷 ' + (L ? L.name : 'Postal') + ' · guardada en tu libreta', 'g'); this.next(st); return true; }
    return false;
  },
  /* ---------- módulos: manejar y volver a la ciudad ---------- */
  place(name, line) { const p = this.stPos(name, line); if (!p) return; const t = Libre.nearTile(p.x + 10, p.y + 10, q => this.walkable(q), 6); const L = Save.d.libre || (Save.d.libre = {}); L.x = t.x; L.y = t.y; L.veh = null; Save.write(); },
  launch(st, S) {
    if (EM.headless || st.auto) { this.next(st); return; }
    const T = this.save(), C = this.cap(), M = EM.modes[S.m], lvl = M.levels().find(l => l.id === S.lv) || M.levels()[0];
    Game.start(S.m, lvl.id, { back: 'menu', trama: 1, onEnd: r => {
      const ok = r.win || r.stars > 0, earn = Save.record(S.m, lvl.id, r);
      if (ok && this.step() === S) { this.place(S.fin, S.finLine); this.advance(); }
      UI.modal(`<div class="pag">Capítulo ${T.c + 1} · ${esc(C.t)}</div><h2>${ok ? '¡Lo lograste!' : 'Casi'}</h2><div style="font-size:30px;color:var(--mostaza)">${'★'.repeat(r.stars | 0)}${'☆'.repeat(3 - (r.stars | 0))}</div><div class="film" style="margin:10px 0">${esc(ok ? S.ok : 'Rosalba: “Tranquila, mija. Nadie nace aprendido. Otra vez.”')}</div><p class="m">+${earn} 🎫</p><div class="row">${ok ? '' : '<button class="btn" id="trAgain">↻ Otra vez</button>'}<button class="btn pri" id="trCity">🏙️ Volver a la ciudad</button></div>`);
      $('#trCity').onclick = () => { UI.close(); Game.stop(); Game.start('libre', 'lb:trama', {}); };
      const a = $('#trAgain'); if (a) a.onclick = () => { UI.close(); Game.stop(); this.launch({}, S); };
    } });
  },
  /* ---------- dibujo de personajes ---------- */
  draw(g, st, S, k, sh) {
    const tr = st.trama; if (!tr || !tr.npcs.length) return; const t = st.t;
    for (const n of tr.npcs) {
      if (n.done) continue; const W = TRAMA_WHO[n.who] || TRAMA_WHO.Pasajero, q = S(n.x, n.y); if (q.x < -60 || q.y < -60 || q.x > g.canvas.width + 60 || q.y > g.canvas.height + 60) continue;
      Ciudad.ped(g, { x: n.x, y: n.y, a: n.a, ph: Math.sin(t * 2 + n.x) * .3, col: n.col || W.col, skin: W.skin, hair: W.hair, hat: W.hat, seed: 3, stun: 0 }, S, k, sh);
      const s = Math.max(.6, k * .4), y = q.y - 12 * s - 12, bob = Math.sin(t * 4 + n.x) * 3;
      g.font = '800 ' + Math.round(10 * Math.max(1, k / 2.4)) + 'px Cuerpo, sans-serif'; g.textAlign = 'center'; const label = n.who === 'Pasajero' ? 'Pasajero' : n.who, w = g.measureText(label).width + 10, fh = Math.round(14 * Math.max(1, k / 2.4));
      g.fillStyle = 'rgba(12,37,51,.88)'; g.fillRect(q.x - w / 2, y - fh, w, fh); g.fillStyle = PAL.mostaza; g.fillText(label, q.x, y - fh * .28);
      g.fillStyle = n.mark === '?' ? '#7ab648' : PAL.mostaza; g.strokeStyle = PAL.negro; g.lineWidth = 2; g.beginPath(); g.arc(q.x, y - fh - 12 + bob, 9, 0, TAU); g.fill(); g.stroke();
      g.fillStyle = PAL.negro; g.font = '900 12px Cuerpo, sans-serif'; g.fillText(n.mark, q.x, y - fh - 8 + bob); g.textAlign = 'left';
    }
  },
  /* ---------- validación de datos (autotest) ---------- */
  check(E) {
    TRAMA.forEach((C, ci) => C.steps.forEach((S, si) => {
      const id = 'trama ' + (ci + 1) + '.' + (si + 1);
      if (S.line && !NET.byId[S.line]) E(id + ': línea ' + S.line + ' no existe');
      if (S.at && !this.stPos(S.at, S.line)) E(id + ': lugar ' + S.at + ' no existe');
      if (S.line && S.at && NET.byId[S.line] && !NET.byId[S.line].st.some(q => q.name === S.at)) E(id + ': ' + S.at + ' no está en la línea ' + S.line);
      if (S.k === 'foto' && !(typeof LUGARES !== 'undefined' && LUGARES.some(l => l[0] === S.lugar))) E(id + ': postal ' + S.lugar + ' no existe');
      if (S.k === 'modulo') { const M = EM.modes[S.m]; if (!M) E(id + ': módulo ' + S.m); else if (!M.levels().some(l => l.id === S.lv)) E(id + ': nivel ' + S.lv); if (!this.stPos(S.fin, S.finLine)) E(id + ': llegada ' + S.fin); }
      if ((S.k === 'hablar' || S.k === 'modulo') && !TRAMA_WHO[S.who]) E(id + ': personaje ' + S.who);
    }));
    for (const q of TRAMA_PREG) { if (q[1].length !== 3) E('pregunta con opciones raras: ' + q[0]); if (!NET.stations.some(h => h.name === q[2])) E('pregunta: destino ' + q[2] + ' no existe'); }
    return TRAMA.length;
  }
};
