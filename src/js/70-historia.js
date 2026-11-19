/* =====================================================================
   HISTORIA · "La última vuelta"
   Rosalba manejó el primer tren de Medellín en 1995. Esta es su última semana.
   Su nieta (tú) aprende cada oficio de la red. Cada capítulo termina en una misión.
   ===================================================================== */
const CAPS = [
  { t: 'Niquía, 4:30 a. m.', scene: 'anden', lines: [
    ['Rosalba', 'Mija, despierte. El primer tren sale a las cuatro y media y la ciudad no espera a nadie.'],
    ['Rosalba', 'Hace treinta años me senté en esta cabina por primera vez. Medellín estrenaba metro y yo estrenaba miedo.'],
    ['Rosalba', 'Primero lo primero: la tarjeta Cívica, el torniquete, la línea amarilla del andén y dejar salir antes de entrar. Eso es Cultura Metro.'],
    ['Tú', '¿Y ahora, abuela?'],
    ['Rosalba', 'Ahora es mi última semana. Y quiero que la manejes conmigo. Suba la palanca despacito… y frene en la marca, que la gente se cansa de caminar.']
  ], go: ['conduce', 'A:0-2'], fin: 'Ese frenazo suave es lo que la gente recuerda. Nadie aplaude al conductor, pero todos llegan.' },
  { t: 'El Puesto de Control', scene: 'control', lines: [
    ['Don Efraín', '¡Rosalbita! ¿Esta es la nieta? Venga, mija, que aquí se ve toda la línea en una pared.'],
    ['Rosalba', 'Efraín lleva veinte años moviendo agujas. Él dice que los trenes son como los nietos: hay que mandarlos para donde es.'],
    ['Don Efraín', 'Toque las agujas a tiempo. Cada tren a su andén, y que nunca se encuentren dos en el mismo cruce.']
  ], go: ['despacho', 'despacho0'], fin: 'Don Efraín le guiñó el ojo: “Usted tiene mano”.' },
  { t: 'Santo Domingo mira al cielo', scene: 'cable', lines: [
    ['Rosalba', 'En 2004 subió el primer metrocable del mundo hecho para transporte público de verdad, aquí, a Santo Domingo.'],
    ['Doña Marleny', 'Antes yo bajaba hora y media a pie con el mercado. Ahora en minutos estoy arriba viendo toda la ciudad.'],
    ['Rosalba', 'Hoy usted opera la línea. Si el viento sopla duro, baje la velocidad; si truena, se detiene todo. Y no se olvide de las fotos desde los miradores.']
  ], go: ['cableviaje', 'cv:K'], fin: 'Desde la cabina, el valle se ve como un pesebre encendido.' },
  { t: 'Los que alimentan la red', scene: 'barrio', lines: [
    ['Rosalba', 'El metro no llega a cada esquina. Por eso existen los alimentadores: buses que bajan de los barrios hasta las estaciones.'],
    ['Wílmar (conductor)', 'Yo me sé las lomas de memoria. Usted dígame pa’ dónde va cada bus y yo lo llevo.'],
    ['Rosalba', 'Cada estación pide su color. Cuando se llena, sale el tren. ¡Pilas!']
  ], go: ['alim', 'alim0'], fin: 'Wílmar pitó dos veces al despedirse, como se saludan los conductores.' },
  { t: 'Wílmar presta el timón', scene: 'barrio', lines: [
    ['Wílmar (conductor)', 'Venga, súbase. Hoy maneja usted el alimentador: de Santa Rita a la estación Acevedo.'],
    ['Wílmar (conductor)', 'En las lomas de Medellín el bus pesa: en subida, palanca a fondo; en bajada, freno suave. Y pare donde está la gente, no diez metros después.'],
    ['Rosalba', 'Si quiere, deje el asistente de carril. Cuando se sienta segura, apáguelo y maneje con el timón.']
  ], go: ['bus', 'bus:AL-C6-001:0-3'], fin: 'Una señora se bajó en Acevedo y le dijo: “Usted maneja suavecito, mija. Así sí da gusto”.' },
  { t: 'Belén – Aranjuez', scene: 'metroplus', lines: [
    ['Rosalba', 'El Metroplús tiene su propio carril, pero tiene que cruzar las calles como todo el mundo.'],
    ['Agente de tránsito', 'Usted maneja los semáforos. Los buses grandes valen oro, pero no deje a nadie esperando para siempre.'],
    ['Rosalba', 'Y ojo con las motos, mija. Esas se cuelan hasta por el ojo de una aguja.']
  ], go: ['metroplus', 'mp0'], fin: 'La avenida respiró. Hasta las motos hicieron fila… un ratico.' },
  { t: 'El articulado', scene: 'metroplus', lines: [
    ['Rosalba', 'Ahora súbase al articulado. Dieciocho metros de bus con una bisagra en la mitad: en las curvas, la cola va por dentro.'],
    ['Agente de tránsito', 'El carril es exclusivo, pero los semáforos son para todos. Rojo es rojo.']
  ], go: ['bus', 'bus:MP1:0-4'], fin: 'Al llegar a la estación, el bus quedó justo frente a la puerta del andén. Perfecto.' },
  { t: 'Ayacucho sobre llantas', scene: 'tranvia', lines: [
    ['Rosalba', 'El tranvía de Ayacucho rueda sobre llantas y lo guía un riel en el centro. Sube lomas que un tren normal no se atrevería.'],
    ['Rosalba', 'Aquí hay semáforos y gente cruzando. Despacio y con cariño.']
  ], go: ['conduce', 'T:0-2'], fin: 'Una señora le dijo adiós desde un balcón con una ruana en la mano.' },
  { t: 'La hora pico', scene: 'control', lines: [
    ['Don Efraín', 'Llegó la hora pico. Las cinco y media de la tarde, cuando todo el valle quiere volver a casa.'],
    ['Rosalba', 'Respire. Ya sabe hacerlo. Lo difícil no es mover los trenes: es no perder la calma.']
  ], go: ['despacho', 'despacho5'], fin: 'Sobrevivir a la hora pico es el diploma no oficial de todo el que trabaja en el metro.' },
  { t: 'La última vuelta', scene: 'atardecer', lines: [
    ['Rosalba', 'Mañana ya no vengo. Hoy maneja usted, de Niquía a La Estrella, todo el valle de punta a punta.'],
    ['Tú', '¿Y usted qué va a hacer?'],
    ['Rosalba', 'Montarme de pasajera. Sentarme en la ventana, mirar el río y saber que el tren está en buenas manos.']
  ], go: ['conduce', 'A:0-20'], fin: 'En cada estación alguien la reconoció y la saludó. Rosalba lloró en silencio, con el tinto entre las manos, sin regar ni una gota.' },
  { t: 'Ruedas que conectan el valle', scene: 'metroplus', lines: [   // 2.0.0: idea de la entrega de Gemini/Antigravity, con los datos revisados
    ['Rosalba', 'Cuando uno se baja del tren, el viaje sigue: en bici de EnCicla, en patines o en monopatín.'],
    ['Santi (anfitrión de EnCicla)', 'Por Floresta pasa la línea B: desde aquí llegas a San Antonio sin bajarte del tren. Y la bici te espera a la salida.'],
    ['Rosalba', 'Escoja en qué rodar, mija: esquive los huecos, salte los charcos y recoja el dato de cada estación.']
  ], go: ['carrera', 'cr:B'], fin: 'Santi chocó esos cinco en el anclaje: «¡Qué ritmo! El metro y las bicis andan al mismo compás».' },
  { t: 'Epílogo', scene: 'noche', lines: [
    ['Tú', 'Ahora la red es nuestra: los cables, los buses, el tranvía, los trenes y los que vienen.'],
    ['Rosalba', 'La red no es de hierro, mija. Es de la gente que la cuida. Cultura Metro, ¿sí o qué?'],
    ['', 'FIN DE LA HISTORIA · La Red queda abierta: mejora la flota y sigue jugando todos los modos.']
  ], go: null }
];
const Story = EM.story = {
  ch: 0, line: 0, cv: null, t0: 0, raf: 0,
  open(ch) { this.ch = clamp(ch == null ? Save.d.story.ch : ch, 0, CAPS.length - 1); this.line = -1; UI.show('story'); Music.play('story'); this.next(); cancelAnimationFrame(this.raf); const loop = () => { if (UI.cur !== 'story') return; this.raf = requestAnimationFrame(loop); this.draw(); }; loop(); },
  next() {
    const C = CAPS[this.ch]; this.line++;
    if (this.line === 0) { $('#stText').innerHTML = `<span class="who">Capítulo ${this.ch + 1}</span><br><b style="font-size:20px">${esc(C.t)}</b>`; return; }
    const L = C.lines[this.line - 1];
    if (!L) { this.mission(); return; }
    $('#stText').innerHTML = (L[0] ? `<span class="who">${esc(L[0])}</span><br>` : '') + esc(L[1]); Snd.play('tap');
  },
  mission() {
    const C = CAPS[this.ch];
    if (!C.go) { Save.d.story.ch = CAPS.length - 1; Save.write(); UI.back(); return; }
    const [m, lv] = C.go, mode = EM.modes[m], lvl = mode.levels().find(l => l.id === lv) || mode.levels()[0];
    Game.start(m, lvl.id, { back: 'menu', story: this.ch, onEnd: r => {
      const ok = r.win || r.stars > 0, earn = Save.record(m, lvl.id, r);
      if (ok && Save.d.story.ch <= this.ch) { Save.d.story.ch = this.ch + 1; Save.write(); }
      UI.modal(`<div class="pag">Capítulo ${this.ch + 1} · ${ok ? 'cumplido' : 'casi'}</div><h2>${esc(C.t)}</h2><div style="font-size:30px;color:var(--mostaza)">${'★'.repeat(r.stars | 0)}${'☆'.repeat(3 - (r.stars | 0))}</div><div class="film" style="margin:10px 0">${esc(ok ? C.fin : 'Rosalba: “Tranquila, mija. Nadie nace aprendido. Otra vez.”')}</div><p class="m">+${earn} 🎫</p><div class="row"><button class="btn pri" id="sgN">${ok ? 'Siguiente capítulo ▶' : '↻ Reintentar'}</button><button class="btn sm gh" id="sgX">Menú</button></div>`);
      $('#sgN').onclick = () => { UI.close(); Game.stop(); if (ok) this.open(this.ch + 1); else this.mission(); };
      $('#sgX').onclick = () => { UI.close(); Game.exit(); };
    } });
  },
  /* escenas pixeladas (320×180) */
  draw() {
    const cv = $('#stCv'), g = cv.getContext('2d'), W = 320, H = 180, t = now(), sc = CAPS[this.ch].scene; g.imageSmoothingEnabled = false;
    const night = sc === 'noche' || sc === 'anden';
    if (sc === 'control') {
      g.fillStyle = '#1c2b36'; g.fillRect(0, 0, W, H); g.fillStyle = '#0c1820'; g.fillRect(10, 14, W - 20, 90);
      g.strokeStyle = '#f9e4a4'; g.lineWidth = 2; g.beginPath(); g.moveTo(20, 60); g.lineTo(300, 60); g.moveTo(120, 60); g.lineTo(150, 36); g.lineTo(260, 36); g.moveTo(180, 60); g.lineTo(210, 84); g.lineTo(290, 84); g.stroke();
      for (let i = 0; i < 4; i++) { const x = ((t * 30 + i * 80) % 300) + 10; g.fillStyle = ['#1f63ad', '#f08a1c', '#2f9b57', '#f2a900'][i]; g.fillRect(x, 57, 10, 6); }
      for (let i = 0; i < 12; i++) { g.fillStyle = (t * 2 + i) % 3 > 1 ? '#38e07b' : '#ff3b2f'; g.fillRect(24 + i * 24, 24, 4, 4); }
      g.fillStyle = '#2a3a46'; g.fillRect(0, 120, W, 60); for (let i = 0; i < 3; i++) { Art.person(g, 70 + i * 90, 160, 4, i + 3, false); }
    } else if (sc === 'cable' || sc === 'barrio') {
      Art.cover(g, W, H, t, false);
    } else if (sc === 'metroplus') {
      g.fillStyle = '#d9cdae'; g.fillRect(0, 0, W, H); g.fillStyle = '#3f444d'; g.fillRect(0, 70, W, 60); g.fillStyle = '#7ab64855'; g.fillRect(0, 88, W, 24); g.fillStyle = PAL.mante; for (let x = 0; x < W; x += 16) g.fillRect(x, 99, 8, 2);
      const bx = ((t * 40) % (W + 120)) - 100; g.fillStyle = PAL.negro; g.fillRect(bx - 1, 89, 92, 22); g.fillStyle = '#7ab648'; g.fillRect(bx, 90, 44, 20); g.fillRect(bx + 46, 90, 44, 20); g.fillStyle = '#f4f1ea'; g.fillRect(bx + 4, 94, 36, 8); g.fillRect(bx + 50, 94, 36, 8);
      for (let i = 0; i < 10; i++) Art.building(g, i * 34, 20 + h2(i, 1, 1) * 20, 30, 48 - h2(i, 1, 1) * 20, i, false, i % 2 === 0);
      for (let i = 0; i < 9; i++) Art.building(g, i * 38, 136, 34, 44, i + 20, false, true);
    } else if (sc === 'tranvia') {
      Art.cover(g, W, H, t, false); g.fillStyle = 'rgba(12,37,51,.25)'; g.fillRect(0, 0, W, H); Art.trainSide(g, ((t * 22) % (W + 140)) - 140, 150, 3, '#2f9b57', .8, false);
    } else { Art.cover(g, W, H, t, night || sc === 'atardecer' && (t % 20) > 10); }
    // Rosalba (abuela con uniforme del metro y su tinto)
    if (sc !== 'control' && sc !== 'metroplus') { const x = 268, y = 176; g.fillStyle = PAL.negro; g.fillRect(x - 11, y - 50, 22, 50); g.fillStyle = '#12446c'; g.fillRect(x - 10, y - 40, 20, 34); g.fillStyle = '#f1c9a5'; g.fillRect(x - 7, y - 50, 14, 11); g.fillStyle = '#e8e8e8'; g.fillRect(x - 8, y - 53, 16, 5); g.fillStyle = PAL.mante; g.fillRect(x - 10, y - 34, 20, 3); g.fillStyle = '#f3efe6'; g.fillRect(x + 8, y - 26, 6, 6); g.fillStyle = '#5a3417'; g.fillRect(x + 9, y - 25, 4, 2); g.fillStyle = '#333'; g.fillRect(x - 8, y - 6, 6, 6); g.fillRect(x + 2, y - 6, 6, 6); }
    g.fillStyle = 'rgba(0,0,0,.5)'; g.fillRect(0, 0, W, 14); g.fillStyle = PAL.mante; g.font = '700 10px Cuerpo, sans-serif'; g.fillText('LA ÚLTIMA VUELTA · CAP. ' + (this.ch + 1) + ' · ' + CAPS[this.ch].t.toUpperCase(), 6, 10);
  },
  bind() { $('#stNext').onclick = () => { Snd.init(); this.next(); }; $('#stSkip').onclick = () => this.mission(); $('#stCv').onclick = () => this.next(); }
};
