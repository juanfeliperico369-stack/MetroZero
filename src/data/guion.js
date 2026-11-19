/* La trama en datos (Plan único, M6): los seis personajes de Juega EnCicla en El Metro, cada uno en su estación y con su oficio
   de EnCicla (anfitrión, usuaria desde 2011, mecánico, balance, monitoreo y pausas activas), y un fragmento de «El pasaje doblado».
   Personajes, aspecto y diálogos: entrega de ChatGPT/Codex (contenido/guion/el-pasaje-doblado.json); los fragmentos de EnCicla
   que se guardan al conversar son idea de la entrega de Gemini/Antigravity. Los datos de la red se revisaron contra el juego. */
const GUION = {
  personajes: [
    { id: 'ec_luz', n: 'Doña Luz', o: 'usuaria de EnCicla desde 2011', en: ['est', 'San Antonio'], look: { piel: 1, peinado: 1, colPelo: 5, camisa: 6, pantalon: 2, zapatos: 0, gorro: 0, colGorro: 0, accesorio: 2 },
      f: [[0, 'En San Antonio se encuentran las líneas A y B.'], [1, 'También puedes seguir por el tranvía hacia Oriente: sale de aquí mismo.'], [2, 'Ponga el papel contra la luz. ¿Sí ve el radio que le falta a la rueda?']],
      frag: 'Fragmento EnCicla 2/6 · Doña Luz dobla la esquina del pasaje para marcar dónde empezó el viaje.' },
    { id: 'ec_santi', n: 'Santi', o: 'anfitrión de estación EnCicla', en: ['est', 'Floresta'], look: { piel: 2, peinado: 0, colPelo: 0, camisa: 1, pantalon: 0, zapatos: 0, gorro: 1, colGorro: 2, accesorio: 0 },
      f: [[0, 'Por Floresta pasa la línea B.'], [1, 'Desde aquí llegas a San Antonio sin bajarte del tren.'], [2, 'Doblé el papel para que no se saliera de la libreta.']],
      frag: 'Fragmento EnCicla 1/6 · Santi guarda en su planilla una esquina de papel doblada: «la trajo una señora de San Antonio».' },
    { id: 'ec_jairo', n: 'Don Jairo', o: 'mecánico de bicicletas de EnCicla', en: ['est', 'Estadio'], look: { piel: 3, peinado: 0, colPelo: 5, camisa: 0, pantalon: 3, zapatos: 0, gorro: 1, colGorro: 1, accesorio: 0 },
      f: [[0, 'Estadio es una estación de la línea B.'], [1, 'Hacia San Javier, la siguiente es Floresta.'], [2, 'Cuando enseño a centrar un rin, empiezo con ese dibujo.']],
      frag: 'Fragmento EnCicla 3/6 · En el dibujo del pasaje falta un radio; Don Jairo dice que así se aprende a centrar una rueda.' },
    { id: 'ec_wilson', n: 'Wilson', o: 'conductor de balance de EnCicla', en: ['est', 'Caribe'], look: { piel: 2, peinado: 0, colPelo: 0, camisa: 4, pantalon: 1, zapatos: 0, gorro: 1, colGorro: 0, accesorio: 0 },
      f: [[0, 'Caribe queda en la línea A.'], [1, 'La línea O enlaza Caribe y La Palma por la 80.'], [2, 'Lo que más cuido en la vuelta es que la última bici llegue entera.']],
      frag: 'Fragmento EnCicla 4/6 · Wilson lleva bicis de las estaciones llenas a las vacías; en su ruta, el pasaje doblado viaja en la guantera.' },
    { id: 'ec_cata', n: 'Cata', o: 'operadora de monitoreo de EnCicla', en: ['est', 'Acevedo'], look: { piel: 3, peinado: 4, colPelo: 0, camisa: 8, pantalon: 0, zapatos: 0, gorro: 0, colGorro: 0, accesorio: 0 },
      f: [[0, 'En Acevedo puedes pasar del metro al cable.'], [1, 'La K sale hacia Santo Domingo y la P hacia El Progreso.'], [2, 'Yo dibujo dos rayas distintas para acordarme de los dos lados del valle.']],
      frag: 'Fragmento EnCicla 5/6 · Desde la sala de monitoreo, Cata le pinta al pasaje dos rayas: una por cada lado del valle.' },
    { id: 'ec_maryi', n: 'Maryi', o: 'guía de pausas activas de EnCicla', en: ['est', 'Universidad'], look: { piel: 2, peinado: 4, colPelo: 0, camisa: 0, pantalon: 1, zapatos: 1, gorro: 0, colGorro: 0, accesorio: 0 },
      f: [[0, 'Universidad queda en la línea A.'], [1, 'Si vas hacia Bello, la siguiente es Caribe.'], [2, 'Bájate un momentico de los patines. ¿Sientes cómo descansan las piernas?']],
      frag: 'Fragmento EnCicla 6/6 · Maryi junta los pedazos: el pasaje doblado era el mapa de un viaje en metro y en bici.' }
  ]
};
