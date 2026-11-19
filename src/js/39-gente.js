/* =====================================================================
   GENTE DE LA CIUDAD (1.3.0): personajes con nombre y oficio en sus lugares de verdad. Cada uno cuenta lo que todos saben
   y lo que pocos saben de su sitio; los turistas piden que los acompañes; y 📍 muestra lo que hay para ver cerca.
   Es un juego para contemplar la ciudad y moverse en ella: nadie apura, nadie pierde.
   Cada personaje: id, nombre, oficio, dónde (['hito', id] | ['est', estación] | ['geo', lat, lon]), aspecto (como Save.d.perfil)
   y lo que dice ([0, texto]: lo que todos saben; [1, texto]: lo que pocos saben; [2, texto]: de su vida).
   ===================================================================== */
const GENTE = [
  { id: 'rocio', n: 'Doña Rocío', o: 'guía de la Plaza Botero', en: ['hito', 'botero'], look: { piel: 2, peinado: 4, colPelo: 0, camisa: 3, pantalon: 3, zapatos: 0, gorro: 2, colGorro: 0, accesorio: 4 },
    f: [[0, 'Estas 23 esculturas de bronce son de Fernando Botero, el pintor y escultor de Medellín: él mismo se las regaló a la ciudad y la plaza abrió en 2002.'], [1, 'Fíjese que hay partes que brillan más: la gente las toca para la buena suerte y el bronce se pule de tanto sobarlo.'], [1, 'El edificio blanco y negro de enfrente es el Palacio de la Cultura Rafael Uribe Uribe. Lo diseñó un arquitecto belga, Agustín Goovaerts, en los años veinte.'], [2, 'Llevo veinte años contando esto y todavía me emociona ver la cara de la gente cuando entra a la plaza.']] },
  { id: 'abelardo', n: 'Don Abelardo', o: 'lustrabotas del Parque Berrío', en: ['est', 'Parque Berrío'], look: { piel: 3, peinado: 2, colPelo: 5, camisa: 4, pantalon: 4, zapatos: 0, gorro: 1, colGorro: 4, accesorio: 0 },
    f: [[0, 'En Medellín se dice «nos vemos en La Gorda»: es la escultura de Botero que está frente al Banco de la República, aquí en el Berrío.'], [1, 'La Candelaria, la iglesia del parque, fue la catedral de Medellín antes de que terminaran la Metropolitana, en el Parque Bolívar.'], [1, 'El Parque Berrío fue la plaza principal desde la Colonia: aquí estaban el mercado, las fiestas y los anuncios.'], [2, 'Una lustrada bien hecha dura la semana… si no llueve. ¿Le brillo esos zapatos?']] },
  { id: 'clemencia', n: 'Hermana Clemencia', o: 'voluntaria de la Basílica Metropolitana', en: ['hito', 'catedral'], look: { piel: 0, peinado: 0, colPelo: 5, camisa: 5, pantalon: 3, zapatos: 0, gorro: 0, colGorro: 4, accesorio: 0 },
    f: [[0, 'La Basílica Metropolitana es toda de ladrillo cocido: dicen que tiene más de un millón de ladrillos y es de las iglesias de ladrillo más grandes del mundo.'], [1, 'La diseñó el arquitecto francés Charles Émile Carré. El Edificio Carré, junto al Parque de las Luces, también es suyo.'], [2, 'El Parque Bolívar se llena de palomas y de abuelos jugando ajedrez. Venga un domingo.']] },
  { id: 'fabio', n: 'Don Fabio', o: 'textilero jubilado', en: ['hito', 'coltejer'], look: { piel: 1, peinado: 2, colPelo: 5, camisa: 4, pantalon: 1, zapatos: 0, gorro: 0, colGorro: 0, accesorio: 0 },
    f: [[0, 'El Coltejer termina en punta como una aguja de tejer: por Coltejer, la textilera que ayudó a que Medellín fuera ciudad de fábricas y de moda.'], [1, 'Cuando lo inauguraron, a comienzos de los setenta, fue el edificio más alto de Colombia.'], [2, 'Yo trabajé treinta años en los telares. Todavía sueño con el ruido de las máquinas.']] },
  { id: 'kevin', n: 'Kevin', o: 'hincha', en: ['hito', 'estadio'], look: { piel: 2, peinado: 3, colPelo: 0, camisa: 1, pantalon: 3, zapatos: 1, gorro: 1, colGorro: 2, accesorio: 1 },
    f: [[0, 'El Atanasio Girardot lo comparten dos equipos: Atlético Nacional, el verde, y el Independiente Medellín, el rojo y azul.'], [1, 'Alrededor del estadio está la Unidad Deportiva: piscinas, coliseos y pistas que usa cualquiera, no solo los deportistas.'], [2, 'El día de clásico la ciudad se divide en dos colores… pero en el metro todos vamos juntos.']] },
  { id: 'yurani', n: 'Yurani', o: 'bibliotecaria de Santo Domingo', en: ['hito', 'bibespana'], look: { piel: 2, peinado: 5, colPelo: 0, camisa: 6, pantalon: 0, zapatos: 2, gorro: 0, colGorro: 0, accesorio: 1 },
    f: [[0, 'Las tres rocas oscuras son el Parque Biblioteca España, del arquitecto Giancarlo Mazzanti: abrió en 2007 y se volvió el símbolo de Santo Domingo.'], [1, 'La Línea K del Metrocable, que llega aquí, abrió en 2004: fue el primer cable aéreo del mundo hecho para el transporte masivo de una ciudad.'], [2, 'Antes del cable, bajar al centro era más de una hora en bus. Ahora son minutos mirando la ciudad desde arriba.']] },
  { id: 'otoniel', n: 'Don Otoniel', o: 'silletero de Santa Elena', en: ['est', 'Arví'], look: { piel: 3, peinado: 2, colPelo: 1, camisa: 4, pantalon: 2, zapatos: 0, gorro: 2, colGorro: 0, accesorio: 3 },
    f: [[0, 'En agosto bajamos a Medellín con las silletas cargadas de flores: es el Desfile de Silleteros, el de la Feria de las Flores.'], [1, 'La silleta era una silla de madera para cargar a la espalda: así se bajaban bultos, flores y hasta personas por estas montañas.'], [1, 'En el Parque Arví hay caminos de piedra más viejos que la ciudad: los hicieron los pueblos indígenas mucho antes de la Colonia.'], [2, 'Si se pierde por el monte, no se afane: el cable lo baja otra vez a Santo Domingo.']] },
  { id: 'jhon', n: 'Jhon', o: 'grafitero y guía de la Comuna 13', en: ['est', 'Las Independencias I (base)'], look: { piel: 3, peinado: 3, colPelo: 0, camisa: 5, pantalon: 3, zapatos: 2, gorro: 1, colGorro: 3, accesorio: 1 },
    f: [[0, 'Estas escaleras eléctricas al aire libre se abrieron en 2011: la subida que antes era como un edificio de 28 pisos ahora se hace en minutos.'], [1, 'Cada grafiti cuenta algo del barrio: la memoria, la música, la gente que no está. Mírelos despacio.'], [2, 'Aquí el hip hop salvó a muchos pelados. Si oye música, quédese: es de los de acá.']] },
  { id: 'valentina', n: 'Valentina', o: 'guía del Parque de los Pies Descalzos', en: ['hito', 'pies'], look: { piel: 1, peinado: 1, colPelo: 3, camisa: 8, pantalon: 5, zapatos: 1, gorro: 0, colGorro: 0, accesorio: 0 },
    f: [[0, 'En el Parque de los Pies Descalzos se camina sin zapatos: arena, agua y piedras para sentir la ciudad con los pies.'], [1, 'El edificio de al lado es el de EPM, al que le dicen el Edificio Inteligente: ahí están las Empresas Públicas de Medellín, la del agua y la luz.'], [2, 'El bosque de guaduas es mi parte favorita: suena cuando hace viento.']] },
  { id: 'gilma', n: 'Doña Gilma', o: 'vendedora de obleas', en: ['geo', 6.2367, -75.5795], look: { piel: 2, peinado: 4, colPelo: 1, camisa: 2, pantalon: 3, zapatos: 0, gorro: 0, colGorro: 0, accesorio: 0 },
    f: [[0, 'Arriba de este cerro, el Nutibara, está el Pueblito Paisa: una réplica de un pueblo antioqueño con su plaza, su iglesia y su barbería.'], [1, 'Desde el Pueblito se ve casi todo el valle: el río, el centro y las lomas de los dos lados.'], [2, '¿Una oblea? Con arequipe y mora, o con queso. Son las galleticas delgaditas de los parques.']] },
  { id: 'hernan', n: 'Don Hernán', o: 'funcionario de La Alpujarra', en: ['hito', 'alcaldia'], look: { piel: 1, peinado: 0, colPelo: 1, camisa: 4, pantalon: 3, zapatos: 0, gorro: 0, colGorro: 0, accesorio: 0 },
    f: [[0, 'La Alpujarra es el centro administrativo: la Alcaldía, la Gobernación de Antioquia y el Concejo están en el mismo lugar.'], [1, 'El monumento grande de bronce es el Monumento a la Raza, de Rodrigo Arenas Betancourt: cuenta la historia de Antioquia en una sola escultura.'], [2, 'Al mediodía esto se llena de gente buscando almuerzo corriente. Yo pido sopa siempre.']] },
  { id: 'sara', n: 'Sara', o: 'estudiante de la UdeA', en: ['est', 'Universidad'], look: { piel: 1, peinado: 1, colPelo: 0, camisa: 1, pantalon: 0, zapatos: 3, gorro: 0, colGorro: 0, accesorio: 1 },
    f: [[0, 'La Universidad de Antioquia nació en 1803: es una de las más antiguas del país. Su Ciudad Universitaria está junto a esta estación.'], [1, 'Pedro Nel Gómez pintó murales enormes en la ciudad; fue pintor, escultor, arquitecto e ingeniero. Hay obra suya en la universidad y en el centro.'], [2, 'Entre clase y clase nos vamos al Jardín Botánico, que queda cruzando la calle.']] },
  { id: 'libardo', n: 'Don Libardo', o: 'vendedor de tinto', en: ['est', 'San Antonio'], look: { piel: 2, peinado: 2, colPelo: 5, camisa: 0, pantalon: 2, zapatos: 0, gorro: 1, colGorro: 1, accesorio: 0 },
    f: [[1, 'En el Parque San Antonio hay dos pájaros de Botero: uno destrozado por una bomba en 1995 y uno nuevo al lado. Botero pidió dejar los dos, para no olvidar.'], [0, 'San Antonio es la única estación donde se cruzan las líneas A y B del metro, y de aquí sale el tranvía de Ayacucho.'], [2, '¿Un tintico? El de la calle es suave y dulce. El café fuerte, el de las fincas, déjelo para la casa.']] },
  { id: 'luzdary', n: 'Luz Dary', o: 'del Parque de las Luces', en: ['hito', 'luces'], look: { piel: 3, peinado: 0, colPelo: 0, camisa: 7, pantalon: 0, zapatos: 2, gorro: 0, colGorro: 0, accesorio: 0 },
    f: [[0, 'En diciembre Medellín se llena de alumbrados: el río y los parques se iluminan con miles de figuras de luz.'], [1, 'Este es el Parque de las Luces: sus columnas de luz se encienden de noche. Los dos edificios viejos de ladrillo, el Vásquez y el Carré, son de finales del siglo XIX y se restauraron.'], [2, 'De noche esto parece un bosque de luz. Venga a las siete.']] },
  { id: 'patricia', n: 'Patricia', o: 'guía de Cultura Metro', en: ['est', 'Acevedo'], look: { piel: 1, peinado: 4, colPelo: 1, camisa: 0, pantalon: 3, zapatos: 0, gorro: 0, colGorro: 0, accesorio: 0 },
    f: [[0, 'El Metro de Medellín abrió el 30 de noviembre de 1995 y sigue siendo el único metro de Colombia.'], [0, 'Cultura Metro es cuidar el sistema como la casa: se da el asiento, no se come adentro y se deja salir antes de entrar.'], [1, 'De Acevedo salen dos cables: la K, a Santo Domingo, y la P, a El Progreso. Uno puede pasar del tren al cable sin volver a pagar.']] },
  { id: 'mateo', n: 'Mateo', o: 'conductor del tranvía', en: ['est', 'Pabellón del Agua'], look: { piel: 0, peinado: 0, colPelo: 3, camisa: 4, pantalon: 3, zapatos: 0, gorro: 0, colGorro: 0, accesorio: 0 },
    f: [[0, 'El tranvía va por la calle Ayacucho, desde San Antonio hasta Oriente, y conecta con dos cables: la M en Miraflores y la H en Oriente.'], [1, 'No tiene ruedas de hierro: rueda sobre llantas de caucho guiadas por un riel en el centro. Así sube la pendiente de Ayacucho.'], [2, 'Lo que más me gusta es el saludo de la gente desde los balcones.']] },
  { id: 'amparo', n: 'Doña Amparo', o: 'de La Aurora', en: ['est', 'La Aurora'], look: { piel: 3, peinado: 0, colPelo: 5, camisa: 2, pantalon: 3, zapatos: 0, gorro: 0, colGorro: 0, accesorio: 2 },
    f: [[0, 'La Línea J del Metrocable sube de San Javier a La Aurora, por encima de la Comuna 13.'], [1, 'Desde la cabina se ven las terrazas de las casas: muchas tienen matas, ropa colgada y hasta palomares.'], [2, 'Yo bajo todos los días a vender arepas. Con el cable llego a la plaza en un ratico.']] },
  { id: 'rios', n: 'Agente Ríos', o: 'policía de turismo', en: ['geo', 6.2088, -75.5672], look: { piel: 2, peinado: 2, colPelo: 0, camisa: 3, pantalon: 1, zapatos: 0, gorro: 1, colGorro: 1, accesorio: 0 },
    f: [[0, 'El Poblado se llama así porque aquí empezó todo: en 1616 se fundó San Lorenzo de Aburrá, el primer poblado del valle.'], [1, 'El Parque Lleras es famoso de noche, pero de día es un parque tranquilo, con árboles enormes y cafés.'], [2, 'Si se pierde, pregunte: el paisa siempre le explica… aunque se demore un rato.']] },
  { id: 'nelly', n: 'Nelly', o: 'vendedora de mango biche', en: ['est', 'Estadio'], look: { piel: 3, peinado: 1, colPelo: 0, camisa: 9, pantalon: 3, zapatos: 0, gorro: 0, colGorro: 0, accesorio: 0 },
    f: [[0, 'El mango biche con sal y limón es de las frutas de la calle más queridas de Medellín.'], [1, 'En Medellín se habla de «parce» y «¿qué hubo pues?»; y el «pues» al final de la frase no significa nada: es cariño.'], [2, 'Los días de partido vendo todo antes del himno.']] },
  { id: 'arturo', n: 'Profe Arturo', o: 'divulgador del Planetario', en: ['hito', 'planetario'], look: { piel: 1, peinado: 2, colPelo: 5, camisa: 5, pantalon: 1, zapatos: 0, gorro: 0, colGorro: 0, accesorio: 0 },
    f: [[0, 'El Planetario, el Parque Explora y el Jardín Botánico quedan juntos, en el norte: se pueden visitar en un mismo día.'], [1, 'Medellín está a unos 1.500 metros sobre el mar, en un valle angosto: por eso el clima es templado todo el año y le dicen la ciudad de la eterna primavera.'], [2, 'Mi pregunta favorita de los niños: «¿y las estrellas también se montan en el metro?»']] }
];
/* lo que se dice de cada lugar en la guía (📍): una línea corta, sin cifras dudosas */
const LUGAR_INFO = {
  coltejer: 'Su punta imita una aguja de tejer.', catedral: 'Iglesia de ladrillo cocido, en el Parque Bolívar.', palacio: 'Edificio blanco y negro, junto a la Plaza Botero.', museo: 'El Museo de Antioquia: Botero y Pedro Nel Gómez.', botero: '23 esculturas de Botero al aire libre.',
  candelaria: 'Fue la catedral antes de la Metropolitana.', veracruz: 'Iglesia colonial, junto a la Plaza Botero.', sanjose: 'Iglesia del centro, sobre la Avenida Oriental.', sanantonio: 'Junto al Parque San Antonio.', estadio: 'La casa de Nacional y del Medellín.', bibespana: 'Las tres rocas de Santo Domingo.',
  epm: 'El Edificio Inteligente de EPM.', teatro: 'Teatro Metropolitano: conciertos y la Filarmónica.', pies: 'Se camina descalzo por arena y agua.', luces: 'Columnas de luz y dos edificios restaurados.', vasquez: 'Edificio de ladrillo de finales del siglo XIX.', carre: 'Edificio de ladrillo de Charles Émile Carré.',
  bibepm: 'La Biblioteca EPM, de techo inclinado.', ferrocarril: 'La vieja estación del Ferrocarril de Antioquia.', alcaldia: 'Centro Administrativo La Alpujarra.', gobernacion: 'Centro Administrativo La Alpujarra.', concejo: 'Centro Administrativo La Alpujarra.', justicia: 'En La Alpujarra.', nacional: 'Antiguo palacio de juzgados, hoy centro comercial.',
  banrep: 'Frente a La Gorda de Botero.', planetario: 'El cielo de Medellín, bajo techo.', explora: 'Ciencia para tocar, con acuario.', pablotobon: 'Teatro de conciertos, títeres y cine.', memoria: 'Museo Casa de la Memoria.', mamm: 'Museo de Arte Moderno, en Ciudad del Río.'
};
/* personajes que llegan en datos (src/data/guion.js, formato de docs/PLAN-UNICO-IA.md 4b-6): se suman si traen lo necesario */
if (typeof GUION !== 'undefined' && GUION && Array.isArray(GUION.personajes)) for (const P of GUION.personajes) {
  const ok = P && typeof P.id === 'string' && typeof P.n === 'string' && typeof P.o === 'string' && Array.isArray(P.en) && Array.isArray(P.f) && P.f.length && !GENTE.some(G => G.id === P.id);
  if (ok) GENTE.push({ id: P.id, n: P.n.slice(0, 40), o: P.o.slice(0, 60), en: P.en, look: P.look || {}, f: P.f.filter(x => Array.isArray(x) && typeof x[1] === 'string').map(x => [x[0] | 0, x[1].slice(0, 400)]), frag: typeof P.frag === 'string' ? P.frag.slice(0, 200) : undefined });
}
const TURISTAS = [['Emma', 'de Francia'], ['Lukas', 'de Alemania'], ['Sofía', 'de Argentina'], ['Hiro', 'de Japón'], ['Ana', 'de Bogotá'], ['Tom', 'de Canadá'], ['Lucía', 'de España'], ['Diego', 'de México'], ['Amara', 'de Kenia'], ['Joana', 'de Brasil']];
const Gente = EM.gente = {
  /* los personajes de la partida: se ubican la primera vez que hay ciudad (cerca de su lugar, en un punto libre) */
  crear(st) { st.gente = []; st.tur = null; st.turT = 40; },
  ubicar(st) {
    if (st._gu || !VC.on || !NET.stations.length) return; st._gu = 1; const out = [];
    for (const G of GENTE) { let q = null; const [t, a, b] = G.en;
      if (t === 'hito') { const H = VC.HT.find(h => h.id === a); if (H) q = { x: H.cx + 10, y: H.y1 + 6 }; }
      else if (t === 'est') { const h = NET.stations.find(s => s.name === a); if (h) q = { x: h.x + 14, y: h.y + 10 }; }
      else if (t === 'geo') q = geoM(a, b);
      if (!q) continue; const p = VC.despeja(q.x, q.y, .6, false, 40); out.push({ G, x: p.x, y: p.y, x0: p.x, y0: p.y, a: h2(p.x | 0, p.y | 0, 3) * TAU, ph: 0, v: 0, tx: p.x, ty: p.y, wt: 2 + h2(p.x | 0, 1, 9) * 4, look: Perfil.ped(G.look), i: 0 }); }
    st.gente = out;
  },
  todos(st) { const L = st.gente ? st.gente.slice() : []; if (st.tur && st.tur.p) L.push(st.tur.p); return L; },
  cerca(st, r) { if (st.mode !== 'walk') return null; let best = null, bd = r; for (const p of this.todos(st)) { const d = dist(p.x, p.y, st.x, st.y); if (d < bd) { bd = d; best = p; } } return best; },
  /* andar: cada uno pasea despacio alrededor de su sitio y mira al jugador cuando se acerca; el turista te sigue */
  tick(st, dt) {
    this.ubicar(st); for (const p of st.gente || []) {
      const dj = dist(p.x, p.y, st.x, st.y); if (dj > 260) continue;
      if (dj < 7 && st.mode === 'walk') { p.v = 0; p.a += Math.atan2(Math.sin(Math.atan2(st.y - p.y, st.x - p.x) - p.a), Math.cos(Math.atan2(st.y - p.y, st.x - p.x) - p.a)) * Math.min(1, dt * 4); continue; }
      if ((p.wt -= dt) < 0) { p.wt = 4 + Math.random() * 6; const a = Math.random() * TAU, r = 1 + Math.random() * 5; const q = { x: p.x0 + Math.cos(a) * r, y: p.y0 + Math.sin(a) * r }; if (!VC.solid(q.x, q.y, .4)) { p.tx = q.x; p.ty = q.y; } }
      const d = dist(p.x, p.y, p.tx, p.ty); if (d > .3) { p.a = Math.atan2(p.ty - p.y, p.tx - p.x); p.v = .8; p.x += Math.cos(p.a) * p.v * dt; p.y += Math.sin(p.a) * p.v * dt; p.ph += dt * 7; } else p.v = 0;
    }
    this.turista(st, dt);
  },
  /* turistas: aparecen cerca de una estación o un lugar famoso y piden que los acompañes a otro que quede cerca */
  turista(st, dt) {
    const T = st.tur;
    if (!T) { if (st.mode === 'ride' || (st.turT -= dt) > 0 || !VC.on || !VC.HT.length) return; st.turT = 70 + Math.random() * 60;
      const cands = VC.HT.filter(H => { const d = dist(H.cx, H.cy, st.x, st.y); return d > 30 && d < 320; }); if (!cands.length) return; const H0 = cands[Math.floor(Math.random() * cands.length)];
      const dests = VC.HT.filter(H => H !== H0 && LUGAR_INFO[H.id] && dist(H.cx, H.cy, H0.cx, H0.cy) > 180 && dist(H.cx, H.cy, H0.cx, H0.cy) < 1100); if (!dests.length) return; const D = dests[Math.floor(Math.random() * dests.length)];
      const [n, de] = TURISTAS[Math.floor(Math.random() * TURISTAS.length)], q = VC.despeja(H0.cx + 8, H0.y1 + 8, .6, false, 40), look = Perfil.ped(Perfil.azar());
      look.acc = 4; st.tur = { p: { x: q.x, y: q.y, a: 0, ph: 0, v: 0, look, tur: 1, G: { id: 'tur', n, o: 'turista ' + de } }, D, ok: false, t: 0 }; return; }
    const p = T.p; T.t += dt; if (!T.ok) { if (T.t > 240 && dist(p.x, p.y, st.x, st.y) > 120) st.tur = null; return; }
    // acompañando: te sigue a dos pasos; si te subes a algo, te espera
    const d = dist(p.x, p.y, st.x, st.y);
    if (st.mode === 'walk' && d > 2.4) { const a = Math.atan2(st.y - p.y, st.x - p.x), v = Math.min(4.2, d * 1.2); const nx = p.x + Math.cos(a) * v * dt, ny = p.y + Math.sin(a) * v * dt; if (!VC.solid(nx, ny, .3)) { p.x = nx; p.y = ny; } else if (d > 30) { p.x = st.x - Math.cos(a) * 2; p.y = st.y - Math.sin(a) * 2; } p.a = a; p.v = v; p.ph += dt * 8; } else p.v = 0;
    if (st.mode !== 'walk' && !T.esp) { T.esp = 1; Ciudad.say(p, 'Te espero aquí'); } if (st.mode === 'walk') T.esp = 0;
    if (dist(st.x, st.y, T.D.cx, T.D.cy) < 45 && d < 14) { const pago = 5; Save.d.wallet += pago; const L = Save.d.libre; L.turistas = (L.turistas | 0) + 1; Save.write(); Libre.sfx(st, 'ok'); Libre.msg(st, '🧳 ' + p.G.n + ': «¡Gracias! ' + (LUGAR_INFO[T.D.id] || '') + '» · +' + pago + ' 🎫', 'b'); Ciudad.say(p, '¡Qué belleza!'); st.guia = null; T.p.tur = 2; st.tur = null; st.turT = 60; }
    if (d > 400) { Libre.msg(st, '🧳 ' + p.G.n + ' se quedó atrás y siguió por su cuenta', 'y'); st.tur = null; st.guia = null; st.turT = 60; }
  },
  /* dibujo: cada personaje con su ropa, un globo 💬 si no has hablado con él (❓ los turistas) y su nombre al acercarte */
  items(st, items, g, S, k, sh, x0, y0, x1, y1) {
    if (!Spr || !Spr.ped) return; const visto = Save.d.gente || {};
    for (const p of this.todos(st)) { if (p.x < x0 - 6 || p.x > x1 + 6 || p.y < y0 - 6 || p.y > y1 + 6) continue;
      items.push({ x: p.x, y: p.y, r: .5, a: 1.8, f: () => { Ciudad.ped(g, Object.assign({ x: p.x, y: p.y, a: p.a, ph: p.v > .1 ? p.ph : 0, seed: 3, stun: 0 }, p.look), S, k, sh);
        const q = S(p.x, p.y), dj = dist(p.x, p.y, st.x, st.y), yy = q.y - 12 * Math.max(.6, k * .4) - 6;
        if (p.tur === 1 && !(st.tur && st.tur.ok) || (!p.tur && !visto[p.G.id])) { const r = 8; g.fillStyle = p.tur ? PAL.mostaza : '#fff'; g.strokeStyle = PAL.negro; g.lineWidth = 1.5; g.beginPath(); g.arc(q.x, yy, r, 0, TAU); g.fill(); g.stroke(); g.fillStyle = PAL.negro; g.font = '700 11px Cuerpo, sans-serif'; g.textAlign = 'center'; g.fillText(p.tur ? '?' : '…', q.x, yy + 4); g.textAlign = 'left'; }
        if (dj < 14 && k > 1) { g.font = '700 12px Cuerpo, sans-serif'; g.textAlign = 'center'; g.lineWidth = 3; g.strokeStyle = 'rgba(255,255,255,.92)'; const t = p.G.n; g.strokeText(t, q.x, yy - 12); g.fillStyle = '#0f2238'; g.fillText(t, q.x, yy - 12); g.textAlign = 'left'; } } }); }
  },
  /* la charla: retrato, nombre y oficio, y lo que cuenta (marcado: lo que todos saben / lo que pocos saben) */
  hablar(st, p) {
    if (st.trama && st.trama.talk) return; const G = p.G, vis = Save.d.gente || (Save.d.gente = {});
    if (p.tur) { const T = st.tur; if (!T) return; if (T.ok) { Ciudad.say(p, 'Vamos a ' + T.D.n); return; } this.charla(st, p, [`¡Hola! Soy ${G.n}, ${G.o.replace('turista ', '')}. Me dijeron que no me puedo ir sin conocer ${T.D.n}. ¿Me acompañas?`], [['Claro, sígueme', () => { T.ok = true; st.guia = { x: T.D.cx, y: T.D.cy, title: 'Acompaña a ' + G.n + ' a ' + T.D.n, hint: LUGAR_INFO[T.D.id] || '' }; this.cerrar(st); Libre.msg(st, '🧳 ' + G.n + ' te sigue: llévala caminando', 'b'); }], ['Ahora no', () => { this.cerrar(st); }]]); return; }
    const nuevo = !vis[G.id], fe = Save.d.fragsEncicla || (Save.d.fragsEncicla = {}), conF = GENTE.filter(q => q.frag); let pieF = '';
    if (nuevo) { vis[G.id] = 1; Save.d.wallet += 2; if (G.frag && !fe[G.id]) { fe[G.id] = 1; const n = conF.filter(q => fe[q.id]).length; pieF = ' · 🚲 fragmento de EnCicla ' + n + ' de ' + conF.length; if (n === conF.length) { Save.d.wallet += 20; pieF += ' · ¡El pasaje doblado está completo! +20 🎫'; st._pasaje = 1; } } Save.write(); }
    const L = G.f.map(([t, x]) => (t === 1 ? '💡 Lo que pocos saben: ' : t === 0 ? '📌 Lo que todos saben: ' : '') + x);
    if (G.frag) L.push('🚲 ' + G.frag);
    this.charla(st, p, L, null, nuevo ? '+2 🎫 por conocer a ' + G.n + ' · ' + Object.keys(vis).length + ' de ' + GENTE.length + ' personajes' + pieF : '');
  },
  charla(st, p, lines, opts, pie) {
    const el = $('#trTalk'); if (!el || EM.headless) { st.charla = null; return; } st.charla = { p, lines, i: 0, opts, pie };
    const pinta = () => { const C = st.charla; if (!C) { el.className = 'trtalk hide'; el.innerHTML = ''; return; } const last = C.i >= C.lines.length - 1, face = Perfil.retrato(C.p.look, 96);
      el.className = 'trtalk conface'; el.innerHTML = `<img class="face" src="${face}" alt=""><b class="who">${esc(C.p.G.n)} · ${esc(C.p.G.o)}</b><p>${esc(C.lines[C.i])}</p>${C.pie && last ? `<p class="m" style="margin-top:-4px;font-size:12.5px">${esc(C.pie)}</p>` : ''}<div class="opts">${C.opts && last ? C.opts.map((o, i) => `<button class="btn sm ${i ? 'gh' : 'pri'}" data-o="${i}">${esc(o[0])}</button>`).join('') : `<button class="btn pri sm" data-n>${last ? 'Gracias ✓' : 'Cuénteme más ▶'}</button>`}</div><button class="x" data-x aria-label="Cerrar">✕</button>`;
      const n = el.querySelector('[data-n]'); if (n) n.onclick = () => { Snd.play('tap'); if (C.i < C.lines.length - 1) { C.i++; pinta(); } else this.cerrar(st); };
      el.querySelectorAll('[data-o]').forEach(b => b.onclick = () => C.opts[+b.dataset.o][1]()); el.querySelector('[data-x]').onclick = () => this.cerrar(st); };
    this._pinta = pinta; pinta(); Snd.play('tap');
  },
  cerrar(st) { st.charla = null; if (this._pinta) this._pinta(); if (st._pasaje) { st._pasaje = 0; this.escenaPasaje(); } },
  /* con los seis fragmentos de EnCicla: la escena del pasaje doblado (tren al atardecer, retrato y el papel que se abre), del taller de arte de Codex */
  escenaPasaje() {
    const T = EM.taller; if (!T || !T.escena || EM.headless) return;
    UI.modal(`<div class="pag">Juega EnCicla · 6 de 6</div><h2>El pasaje doblado</h2><canvas id="gpEsc" width="320" height="180" style="width:100%;border-radius:10px;background:#154a80"></canvas><p class="m">Los seis fragmentos eran el mapa de un viaje en metro y en bici, de San Antonio a Floresta y de ahí a Estadio.</p><button class="btn" id="gpX">Seguir</button>`);
    const cv = $('#gpEsc'), g = cv && cv.getContext('2d'), M = GENTE.find(q => q.id === 'ec_maryi'), t0 = now(); let ret = null, raf = 0; if (!g) return;
    if (M && T.retrato) T.retrato(M).then(im => { ret = im; }).catch(() => {});
    const loop = () => { if (!document.body.contains(cv)) return; try { T.escena(g, 320, 180, Math.min(8, now() - t0), ret); } catch (e) { EM.errors.push('escena: ' + e.message); return; } raf = requestAnimationFrame(loop); }; loop();
    const b = $('#gpX'); if (b) b.onclick = () => { cancelAnimationFrame(raf); UI.close(); };
  },
  /* 📍 qué ver cerca: lugares famosos, estaciones y personajes, con lo que hay que saber; tocar uno lo vuelve destino (flecha y distancia) */
  guia(st) {
    if (EM.headless) return; const km = d => d < 1000 ? Math.round(d) + ' m' : (d / 1000).toFixed(1).replace('.', ',') + ' km', L = [], vis = Save.d.gente || {};
    for (const H of VC.HT || []) if (LUGAR_INFO[H.id]) L.push({ i: '🏛', n: H.n, t: LUGAR_INFO[H.id], x: H.cx, y: H.cy });
    for (const h of NET.stations) { if (!h.lines.some(l => l.kind === 'metro' || l.kind === 'cable' || l.kind === 'tram')) continue; const f = NET.fact ? NET.fact(h.name) : ''; L.push({ i: h.lines.some(l => l.kind === 'cable') ? '🚡' : h.lines.some(l => l.kind === 'tram') ? '🚋' : '🚇', n: 'Estación ' + h.name, t: f ? String(f).slice(0, 110) : 'Estación de ' + h.lines.filter(l => l.kind !== 'future').map(l => l.name).slice(0, 2).join(' y '), x: h.x, y: h.y }); }
    for (const p of st.gente || []) L.push({ i: vis[p.G.id] ? '🙂' : '💬', n: p.G.n, t: (p.G.o.charAt(0).toUpperCase() + p.G.o.slice(1)) + (vis[p.G.id] ? '' : ' · aún no lo conoces'), x: p.x, y: p.y });
    for (const o of L) o.d = dist(o.x, o.y, st.x, st.y); L.sort((a, b) => a.d - b.d); const top = L.slice(0, 10), conoce = Object.keys(vis).length;
    UI.modal(`<div class="pag">Guía</div><h2>📍 Qué hay cerca</h2><p class="m" style="margin-top:-4px">Toca un lugar y te muestro el camino. Conoces a ${conoce} de ${GENTE.length} personajes de la ciudad.</p><div class="col guia">${top.map((o, i) => `<button class="btn" data-g="${i}"><span>${o.i} <b>${esc(o.n)}</b> · ${km(o.d)}</span><small>${esc(o.t)}</small></button>`).join('')}</div>
      <div class="row" style="margin-top:10px">${st.guia ? '<button class="btn sm gh" id="gQuita">Quitar el destino</button>' : ''}<button class="btn pri" id="gOk">Cerrar</button></div>`);
    $$('#mBody [data-g]').forEach(b => b.onclick = () => { const o = top[+b.dataset.g]; st.guia = { x: o.x, y: o.y, title: o.n, hint: o.t }; UI.close(); Libre.msg(st, '📍 Rumbo a ' + o.n + ' · ' + km(o.d), 'b'); });
    const q = $('#gQuita'); if (q) q.onclick = () => { st.guia = null; UI.close(); }; $('#gOk').onclick = () => UI.close();
  }
};
