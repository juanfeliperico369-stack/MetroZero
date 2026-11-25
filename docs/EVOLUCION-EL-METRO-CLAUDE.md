# Evolución de El Metro · documento de Claude (Anthropic)

> **Quién lo escribió:** Claude (Anthropic), la IA de El Metro en la rama `ccr-2a67f935-oat714`.
> **Fecha:** 22‑nov‑2026.
> **Base y resultado:**
> - parte de la versión publicada 3.1.0 «Fluido»;
> - de este trabajo sale la **3.2.0 «Evolución»**, con los arreglos de la sección 3 ya en el juego.
>
> **Las otras IAs** trabajan en lo mismo y escriben su propio documento:
> - **Antigravity (Google DeepMind / Gemini):** `docs/PLAN-EVOLUCION-ANTIGRAVITY-GEMINI.md`, en la rama `ia/antigravity/evolucion-3.2`;
> - **Codex (ChatGPT):** `docs/CONTEXTO-CODEX-2026-11-22.md`, en la rama `ia/codex/metro-20261122`;
> - **OpenAI GPT‑6:** `docs/OPENAI-GPT6-METRO-AUDITORIA-2026-11-22.md`, en la rama `ia/openai-gpt6/fluidez-metro-20261122`.
>
> Lo que reportaron mientras yo trabajaba está en la sección 13.

> **Actualización del 23‑nov‑2026 (3.4.0 «Jugo y ciclovías»):**
> - el corredor ya va solo por las ciclorrutas reales, con cruces ↰/↱, tramos que se angostan, zonas de skate, trucos y parkour a pie;
> - el jugo está en todos los modos (sección 12).

---

## 0. En corto

1. **Medí todos los modos con entradas de jugador** (sección 2). Cuatro estaban rotos o lentos:
   - el metro y el tranvía no arrancaban con la palanca;
   - el bus «Al volante» no se movía y el juego corría al 62 % del tiempo real;
   - el bus tardaba 12 s en llegar a 40 km/h;
   - la carrera corría al 65 % y la pista pasaba por dentro de edificios.

   Además, en Ciudad Libre la primera charla dejaba el joystick muerto.
2. **Todo eso quedó arreglado en la 3.2.0 y medido otra vez:**
   - el metro llega de 0 a 62 km/h en 12 s;
   - el bus del volante, de 0 a 67 km/h;
   - el bus, a 55 km/h en 10 s;
   - todos los modos van en tiempo real.
3. **Todo está abierto desde el principio:**
   - los niveles de todos los modos;
   - los capítulos de la historia clásica;
   - cualquier capítulo de «La última vuelta» en la ciudad.
4. **Cada modo está dentro del mundo abierto.** Junto a cada estación aparece 🎮 «jugar»:
   - manejar el metro, el tranvía, el Metroplús o el alimentador **desde esa misma estación**;
   - operar o armar el cable;
   - despachar trenes y la carrera.

   Es el mismo módulo del menú y, al terminar, vuelves al mismo punto de la ciudad.
5. **Lo que más falta**, según la comparación con las referencias:
   - un ciclo de progreso claro: ganar, mejorar, desbloquear, aunque todo esté abierto;
   - retroalimentación con más «jugo»;
   - partidas cortas y rejugables con fantasmas y contrarreloj;
   - un corredor por ciclovías con skate y parkour;
   - una cámara cenital 3D sobre el mismo mundo;
   - historias con arcos, épocas y consecuencias, al estilo de UnoCero.
6. **El plan (sección 12)** va por versiones pequeñas, cada una con su criterio de aceptación medible.

---

## 1. Cómo se hizo

- **Auditoría con entradas reales.** Usé un script de Playwright (`scratchpad/auditoria.mjs`) que en Chromium a 412 × 860:
  - abre cada modo;
  - hace lo que haría un jugador: sostener ▲, subir la velocidad del cable o tocar como el bot en los rompecabezas;
  - durante 12 s de tiempo real, mide cuadros por segundo, el tiempo del juego frente al real, la velocidad segundo a segundo, el avance y el puntaje.

  Chromium aquí dibuja WebGL sin tarjeta gráfica. Por eso sus cuadros por segundo en 3D se parecen a los de un **celular modesto**: es el peor caso que pide el proyecto.
- **Investigación en la web:**
  - de cada referencia del autor: tienda, reseñas y charlas de los desarrolladores;
  - de los temas técnicos: render, optimización, alcance de juegos grandes y sensación de juego.

  Las fuentes están en la sección 14.
- **Lo que no se pudo:**
  - **jugar** los juegos de celular, porque aquí no hay teléfono ni tienda; se suplió con sus fichas, reseñas y charlas;
  - **encontrar en la web** `cityrt.com` ni la ficha de *Train Chu*. De *Train Chu* se estudió *Tiny Rails*, del mismo estudio (Tiny Titan).
- **UnoCero:** su página arma el contenido con JavaScript. Por eso leí el HTML publicado de su repositorio, que es público, en solo lectura y sin ejecutarlo. Es **INDUSTRY ART**, un simulador de estudio de arte de 1700 a 2300. Lo que sirve de su forma de contar está en la sección 5.6.
- **Coordinación:**
  - revisé el repositorio (`git fetch --all`) al empezar y a mitad del trabajo;
  - leí los avisos de Antigravity y Codex en `.ai-coord/buzon/`;
  - dejé el mío: `20261122-1500-claude-elmetro-3.2.0.md`.

---

## 2. Auditoría de jugabilidad: antes y después (medido)

Cada modo se probó 12 s de tiempo real con la entrada indicada. «Ritmo» es tiempo del juego ÷ tiempo real: 1 = normal y menos de 1 = cámara lenta.

| Modo (nivel) | Entrada | Antes (3.1.0) | Después (3.2.0) | Qué pasaba |
|---|---|---|---|---|
| Metro (A: Niquía → Madera) | ▲ sostenido | 0 km/h, fase «listo» | 0 → **62 km/h** en 12 s; 108 m | Pedía girar la llave, poner ADELANTE y esperar la señal. La escuela se abría sola la primera vez. |
| Tranvía (T:0‑2) | ▲ sostenido | 0 km/h | 0 → 39 km/h; frena solo antes de la estación (ATP) | Lo mismo que el metro. |
| Al volante (Metroplús 1) | ▲ sostenido | 0 m, ritmo **0,62** | 0 → **67 km/h**; 138 m, ritmo **0,99** | Chocaba contra las casillas viejas de 20 m (no contra la ciudad que se ve). Además el bucle cortaba a 50 ms por cuadro. |
| Bus (Metroplús 1) | ▲ sostenido | 0 → 40 km/h en 12 s | 0 → **55 km/h** en 10 s | Aceleración real de bus: 1,05 m/s², y cae con la velocidad. |
| Carrera sin fin (A) | ninguna | ritmo **0,65**; 29 → 32 km/h | ritmo **0,99**; sale a **44 km/h** | Aceleraba a 0,12 m/s²: de 29 a 72 km/h en unos 100 s. Junto a Niquía la cámara quedaba dentro de los edificios. |
| Metrocable · Viaje (K) | sube la velocidad | bien (ritmo ×3) | igual | — |
| Despacho, Alimentadores, Cruces del Metroplús, Arma el cable | toques del bot | avanzan y terminan | igual | — |
| Ciudad Libre | ▲ a pie | 0 m: el joystick quedaba muerto | 2,3 m/s | La crónica salía al empezar en la estación y bloqueaba el movimiento hasta tocar la ✕. |

**Manejo en Ciudad Libre**, con `scratchpad/medir-manejo.mjs` en asfalto. Da lo mismo a 30 y a 60 cuadros por segundo:

| Vehículo | 0–50 km/h (3.1.0) | 0–50 km/h (3.2.0) | Velocidad a los 4 s |
|---|---|---|---|
| Taxi | 2,8 s | **1,9 s** | 98 km/h |
| Moto | — | **1,4 s** | 115 km/h |
| Bici y patineta | — | — | 30 y 25 km/h (su tope) |

**El costo del 3D en un celular modesto.** Las vistas 3D (volante, carrera, Ciudad Libre en tercera persona) dan **13 a 14 cuadros por segundo** sin tarjeta gráfica. Las vistas 2D dan 57 a 60. Por eso el tiempo real del punto 1 de la sección 3 era urgente, y por eso la sección 10 propone bajar el costo del 3D.

---

## 3. Lo que se arregló en la 3.2.0 (ya publicado)

Los arreglos están en módulos aditivos: envuelven los modos sin reescribirlos, para que las otras IAs puedan integrar sin choques.

1. **Tiempo real en todos los modos** (`src/js/96-arcade.js`). El bucle parte el tiempo en pasos de 1/30 s hasta 0,12 s por cuadro. Antes, cortaba a 50 ms por cuadro, y a 13 cuadros por segundo el juego iba en cámara lenta.
2. **Modo Arcade, por defecto.** Se cambia en la pantalla de niveles: «🎮 Arcade / 🎓 Realista».
   - **Metro y tranvía:**
     - la cabina queda lista;
     - la señal sale casi enseguida;
     - no hay vigilante;
     - las puertas abren y cierran solas del lado del andén;
     - el abordaje dura la mitad;
     - aceleración y freno 1,8 veces los reales.

     El jugador se concentra en lo divertido: acelerar, frenar a tiempo y detener el frente en la marca.
   - **Buses:** puertas solas y el doble de aceleración.
   - **Realista** deja todo el procedimiento. La **Escuela de conducción** siempre lo enseña.
3. **Al volante:** choca contra la ciudad que se ve (`Volante.suelo`). El corredor de la ruta siempre se rueda, como en el modo Bus.
4. **Carrera:**
   - sale a 43 km/h en 2 s y sube hasta el tope del vehículo;
   - la pista se corre al lado libre de la vía cada 12 m (`Carrera.offAt`).
5. **Ciudad Libre:**
   - **⏫ acelerador fijo**, con el botón `fijo` o la tecla X: acelera solo y el joystick solo da la dirección. Es la idea de Motor City 4.6.1;
   - arranque más vivo de carros, motos y buses;
   - las charlas se cierran al caminar;
   - la primera crónica espera 25 s.
6. **Todo abierto desde el principio:**
   - sin candados en los niveles;
   - los capítulos clásicos se eligen libres;
   - «La última vuelta» en la ciudad se empieza en cualquier capítulo, en el lugar donde ese capítulo comienza.
7. **Cada modo en el mundo abierto** (`src/js/97b-actividades.js`): el botón 🎮 «jugar» junto a cada estación.
   - **Metro y tranvía:** manejar desde ahí hacia un lado o el otro (dos estaciones) o el recorrido completo.
   - **Metroplús y alimentadores:** manejar desde arriba o en la cabina 3D.
   - **Cable:** operarlo y armarlo.
   - **Despacho, rompecabezas de alimentadores, cruces del Metroplús y carrera.**

   Los tramos «desde aquí» son niveles nuevos con el formato de siempre, por ejemplo `A:3-5`. Al terminar o al salir con ⏸ vuelves a la ciudad, al mismo punto.
8. **Pruebas nuevas en el autotest** (`src/js/90-bot.js`):
   - el metro arranca con la palanca;
   - el bus del volante avanza;
   - Acevedo ofrece modos;
   - los tramos «desde aquí» salen de su estación;
   - la pista de la carrera no pasa por edificios.

---

## 4. Lo que le falta al juego (diagnóstico)

El Metro ya tiene mucho:
- el valle real con 639 457 edificios;
- 31 líneas, de ellas 12 del sistema y el resto alimentadores;
- 11 modos;
- historia, crónicas, personajes, álbum y logros.

Lo que falta no es contenido. Es **forma de juego**:

1. **Un ciclo de progreso visible.** Que todo esté abierto (lo pide el autor) no quita que haya algo que **ganar y mejorar**. Las referencias más pegajosas tienen un ciclo corto «jugar → ganar → mejorar → volver»: *Super Arcade Racing*, *#DRIVE* y *Tiny Rails*. Hoy los pasajes 🎫 y las estrellas se ganan, pero casi no se gastan en nada que cambie cómo se juega.
2. **Partidas cortas y rejugables.**
   - Un tramo de metro dura 1 a 2 minutos, pero no hay **contrarreloj**, ni **fantasma** de la mejor vuelta, ni **reto del día**.
   - *Traffix*, *Railways* y *Mini Metro* viven de partidas de 1 a 3 minutos con una sola regla clara.
3. **Retroalimentación («jugo»).**
   - El frenado perfecto en la marca, un cruce seguro o un pasajero bien orientado merecen más que un texto: sonido, vibración corta, un destello y el puntaje que salta.
   - Ojo: la sacudida de cámara va solo en lo que importa. Si todo sacude, es ruido (sección 14).
4. **Controles uniformes entre modos.** Cada modo tiene su tablero: palanca, pedales, timón, flechas, joystick. El arcade de la 3.2 ya quitó los pasos de cabina. Falta un **esquema común**:
   - **▲ acelerar y ▼ frenar siempre a la derecha;**
   - **dirección a la izquierda;**
   - **● acción en el mismo lugar.**
5. **Cámara cenital 3D sobre el mismo mundo.**
   - Hoy la vista desde arriba es un dibujo 2D aparte (VC), y el 3D (G3) es otro dibujo del mismo mapa.
   - El autor pide **un solo mundo 3D** para cenital, primera y tercera persona.
6. **El corredor sin fin va junto a la vía, no por ciclovías.** El autor lo quiere por ciclovías, con giros, calles que se angostan, skate y parkour, también en el mundo abierto (sección 8).
7. **Historias con peso.** La trama y las crónicas son lineales. Faltan:
   - **subtramas por personaje** con decisiones y consecuencias;
   - **reputación** por barrio o línea;
   - **noticias** que cuenten lo que hiciste;
   - una **línea de tiempo** del sistema que se abra jugando, al estilo de UnoCero (sección 5.6).
8. **El 3D cuesta mucho en celulares modestos:** 13 a 14 cuadros por segundo sin tarjeta gráfica. Hay que bajar llamadas de dibujo y detalle lejano (sección 10).

---

## 5. Las referencias, una por una: qué tomar y qué no

Formato:
- **Bien**: lo que hace bien.
- **→ El Metro**: la idea aplicable y dónde va.
- **✗**: lo que no conviene o no cabe.

Con 💡 marco lo que pocos saben del juego.

### 5.1 Conducción y arcade

**Super Arcade Racing (OutOfTheBit), «el más importante» para el autor**
- **Bien:**
  - carreras desde arriba con **dos botones** (acelerar y frenar);
  - derrape dosificando el acelerador;
  - 60 niveles de historia y más de 60 pistas en 5 biomas;
  - monedas por carrera para comprar mejoras y forma y color del carro;
  - trampas en la pista.
- **→ El Metro:**
  - **«Copa de los barrios»:** carreras desde arriba por calles reales del valle (Las Palmas, la 80, la Regional, las lomas de Robledo), en carro, moto, bici o patineta, con **control de dos botones** opcional: ▲ acelera y ▼ frena; girar sin acelerador derrapa.
  - Biomas = zonas reales: centro, laderas, río, Poblado y Bello.
  - Mejoras con pasajes 🎫: motor, frenos, agarre, color. Todo abierto, pero mejorable.
- **✗:** el «grind» (repetir para pagar mejoras) que le critican. Las mejoras deben llegar rápido.

**#DRIVE (Pixel Perfect Dude)**
- **Bien:**
  - manejar lo más lejos posible cuidando gasolina y estado en talleres de la vía;
  - chapas como moneda;
  - policía;
  - relajante.
- **→ El Metro:**
  - **«Ruta larga»:** del valle hacia afuera (Santa Elena, Guatapé, Caldas) cuidando **batería o gasolina**, con paradas en estaciones de servicio reales;
  - modo tranquilo con radio y amanecer.
- **✗:**
  - la policía como amenaza: no va con todo público;
  - poca variedad de paisaje, que aquí sobra.

**PAKO Forever (Tree Men Games) y Reckless Getaway 2 (Pixelbite)**
- **Bien:**
  - persecuciones sin fin con controles de **dos mitades de pantalla** (izquierda y derecha giran; las dos a la vez derrapan);
  - mapa que se regenera;
  - marcadores en la vía que dan tareas o poderes;
  - misiones raras escondidas.
- **→ El Metro:**
  - **«Escapa del aguacero»:** el cielo se cierra (lluvia real de Medellín) y hay que llegar a una estación antes de mojarse, recogiendo pasajeros en el camino;
  - **marcadores de tarea** en la calle: «lleva este domicilio», «recoge a la abuela», «foto del grafiti»;
  - el control de dos mitades como opción en Ciudad Libre.
- **✗:**
  - la persecución policial y el choque como castigo único (un golpe acaba todo), que le critican;
  - los policías de frente sin tiempo de reacción.

**APEX Racers, FR Legends y Need for Speed No Limits**
- Lo que se conoce de este tipo de juegos (no se verificó cada uno en esta sesión):
  - garaje para personalizar;
  - derrape con puntaje (*FR Legends*);
  - eventos cortos.
- **→ El Metro:**
  - **personalizar el vehículo propio** (color, rines, calcomanías del Metro) y verlo en el mundo abierto;
  - **derrape con puntaje** solo en zonas permitidas, como la pista de karts o un parqueadero vacío de noche.
- **✗:** las carreras callejeras ilegales y los arrancones en vías públicas. En El Metro, las carreras son en circuitos o eventos.

**Forza Horizon**
- **Bien:**
  - el **festival** como estructura libre;
  - eventos repartidos en el mapa;
  - **descubrir premia**: vallas, carros escondidos;
  - en FH4, estaciones del año que cambian cada semana.
- **Crítica:** falta estructura; abrir el mapa toma dos toques.
- **→ El Metro:**
  - **eventos de temporada reales**:
    - la Feria de las Flores (agosto);
    - los Alumbrados (diciembre);
    - la ciclovía de domingos y festivos;
    - días de partido en el Atanasio.
  - **descubrimientos** que suman al álbum: postales, crónicas, grafitis de la Comuna 13, miradores;
  - el mapa con **un toque**.
- 💡 En FH6 descubrir hitos vale tanto como ganar eventos: justo lo que El Metro puede hacer con su ciudad real.

**GTA 1, GTA 2 y GTA London**
- **Bien:** la vista **cenital** pura, que hace legible una ciudad grande en una pantalla pequeña.
- **→ El Metro:** la cenital ya es la vista base de Ciudad Libre. Hay que **alejar la cámara con la velocidad**, como estos GTA, para ver venir las curvas.
- **✗:** violencia y crimen.

**GTA Chinatown Wars**
- **Bien:**
  - cenital ligeramente inclinada, muy elogiada;
  - **minijuegos táctiles** cortos dentro del mundo: hacer, abrir, buscar.
- **Críticas:** la cámara a veces se queda atrás en las maniobras; los minijuegos se perdieron al pasar a consolas sin pantalla táctil.
- **→ El Metro:** **minijuegos táctiles de oficio** dentro de Ciudad Libre, que duran segundos:
  - recargar la Cívica;
  - arreglar la cadena de la bici EnCicla;
  - marcar la tarjeta del torniquete;
  - cambiar una bombilla de la estación;
  - limpiar un vidrio de la cabina del cable.

  Con eso, la ciudad se siente **tocada**, no solo recorrida.
- 💡 El autor pidió «ciudad jugable estilo Chinatown Wars» desde la 1.1. La cámara de esta versión es la que mejor funciona en celular.

**GTA San Andreas**
- **Bien:** mundo con **oficios** (taxi, bombero, paramédico), gimnasio, ropa, novias y bandas: una vida dentro de la ciudad.
- **→ El Metro:** los **oficios** ya existen en Ciudad Libre (taxi, ruta, domicilio). Faltan:
  - que **suban de nivel**, como el taxi de San Andreas a las 50 carreras;
  - que den **algo duradero**: un vehículo, un uniforme, una charla nueva.

### 5.2 Transporte, gestión, estrategia y rompecabezas

**Traffix y Traffix 3D (Infinity Games), «perfecto para buses y Metroplús»**
- **Bien:**
  - semáforos en rojo por defecto;
  - **un toque = amarillo, pasa un carro; doble toque = verde, pasan todos**;
  - si esperan mucho se enojan;
  - una ciudad por nivel.
- **→ El Metro:** el modo **Cruces del Metroplús** debe tomar ese control exacto:
  - toque = deja pasar un carro;
  - doble toque = verde.

  Las intersecciones serían las reales de la 30, la 45 y la 80. Hoy el modo pide más gestos. Antigravity anuncia un «impulso táctil estilo Traffix» en `45-metroplus.js` (sección 13): **integrarlo**.
- 💡 Casi todos los choques ocurren con el verde, no con el amarillo: la tensión está en decidir cuándo soltar a todos.

**Railways! (Infinity Games), «perfecto para el metro en 3D cenital»**
- **Bien:**
  - tocar un tren lo **detiene** unos segundos;
  - arrastrar **desvía** tramos;
  - los pasajeros van **por color**: cada tren recoge los suyos.
- **→ El Metro:**
  - el modo **Despacho** puede volverse este juego sobre la **red real vista en cenital 3D**: tocar un tren para retenerlo en la estación y arrastrar para cambiar la aguja en el patio de Bello o en San Antonio;
  - pasajeros con el color de su línea (A azul, B naranja).

  Es el puente natural entre la cenital 3D y un rompecabezas de dos gestos.

**Train Chu y Tiny Rails (Tiny Titan), «perfecto para el metro en 2D»**
- **Bien** (de *Tiny Rails*, porque la ficha de *Train Chu* no aparece en la web):
  - tren **de lado** que viaja tranquilo entre estaciones;
  - pasajeros y carga;
  - comercio;
  - **mejoras de vagones**;
  - partidas cortas.
- **Críticas:** la espera y el «grind».
- **→ El Metro:**
  - la vista **lateral 2D** del metro («lado») ya existe. Falta el **ciclo de mejoras**: vagones nuevos, aire acondicionado, música, más capacidad;
  - un **modo tranquilo de lado** para contemplar el valle mientras el tren avanza solo y uno atiende pasajeros.

**Package Inc. (Infinity Games)**
- **Bien:** diseñar la red de reparto de una ciudad que crece; mover centros cuando sube la demanda.
- **→ El Metro:** **«Domicilios en bici»**, la red EnCicla:
  - poner anclajes donde la gente los pide y moverlos cuando el barrio crece;
  - se mide en bicis disponibles, viajes y tiempos.

  Conecta con Juega EnCicla.

**Infinity Loop, Laser y Maze (Infinity Games)**
- **Bien:** rompecabezas de un gesto (girar piezas, reflejar, recorrer) y sin texto.
- **→ El Metro:**
  - el modo **Arma el cable** ya es de esta familia;
  - sumar **«Conecta la red»**: girar piezas de vía hasta que la línea A llegue de Niquía a La Estrella, con el trazado real;
  - niveles por estación y **modo zen** sin fallar.

**Mini Metro y Mini Motorways (Dinosaur Polo Club)**
- No estaban en la lista del autor, pero son la referencia obvia de un juego de metro.
- **Bien:**
  - conectar destinos con pocas líneas;
  - la ciudad crece sola;
  - termina cuando una estación se satura;
  - cada partida es distinta.
- **→ El Metro:** el **roguelite «Un día de operación»** (sección 6).
- 💡 Sus creadores dijeron que el parecido con las redes reales fue más suerte que diseño. Nacieron como prototipos de un *game jam*.

**911 Operator**
- **Bien:**
  - despachar emergencias sobre **mapas reales de OpenStreetMap**, con calles y direcciones reales;
  - más de 140 tipos de reportes.
- **Crítica:** controles enredados.
- **→ El Metro:** **«Centro de control»**, sin emergencias graves y con calles reales del valle:
  - un tren varado en Industriales;
  - una persona perdida en Parque Berrío;
  - un aguacero que inunda un deprimido vial.

  Mandas buses de apoyo, cuadrillas o un tren vacío. El valle ya tiene 3411 calles con nombre.
- **✗:** heridos, crímenes y muertes.

**Idle Supermarket Tycoon**
- Lo que se conoce del juego: gestión idle de una tienda que crece sola mientras no juegas; se mejoran cajas y estantes.
- **→ El Metro:** **la chaza o la tienda de la estación** como pequeño negocio del jugador: vende tinto y arepas a la gente que pasa y crece con las visitas. Es la «casa» del jugador en el mundo y un ancla de la historia propia.
- **✗:** la mecánica idle que juega sola y los anuncios.

**Cities: Skylines, SimCity BuildIt y TheoTown**
- Lo que se conoce de estos juegos: construir ciudad, zonas, servicios y **transporte público con líneas propias**.
- **→ El Metro:**
  - **«Plan de expansión»:** dibujar las líneas que vienen (Metro de la 80, nuevos cables) sobre el valle real y ver cuánta gente las usaría con los datos de barrios;
  - el protocolo de coordinación ya reserva `48-planificador.js` (zona Z5) para un planificador así.
- **✗:** construir la ciudad entera. El valle ya existe y es real.

**Townscaper**
- **Bien:**
  - construir tocando una cuadrícula **irregular**;
  - el algoritmo decide la forma (paredes, techos, escaleras), lo que da pueblos orgánicos.
- **→ El Metro:** el **taller de barrios** para decorar el entorno en 2D o cenital: tocar y que el juego ponga la casa de ladrillo correcta con su escalera de loma.
- 💡 Stålberg empezó con un prototipo (*Brick Block*) muy parecido a *marching cubes*. Luego lo llevó a una cuadrícula grande y deforme, y lo contó en IndieCade Europe 2019 («Organic Towns from Square Tiles»).

**The Sims**
- Lo que se conoce del juego: necesidades, rutinas, casa propia y relaciones.
- **→ El Metro:** **la historia propia** del jugador: su casa en un barrio, su oficio, su horario.
  - Las **rutinas** de los personajes (Gente) ya existen.
  - Falta que **el jugador tenga rutina**: salir temprano, almorzar, volver.
- **✗:** necesidades que castigan, como el hambre que obliga.

**WorldBox y Solar Smash**
- Lo que se conoce de estos juegos: simuladores divinos de destruir o crear mundos.
- **✗ No aplica.** Destruir la ciudad real no va con la misión.
- La única idea transferible está en *WorldBox*: **mirar cómo la vida avanza sola**. El Metro la tiene en la vista de dron y cine.

### 5.3 Acción, movimiento, sigilo

**Vector (Nekki)**
- **Bien:**
  - corredor de **parkour** con gestos: arriba salta, abajo se desliza;
  - trucos con nombre (Dash Vault, Rocket Vault);
  - estrellas por tiempo, por recoger todo y por hacer todos los trucos.
- **→ El Metro:** el **corredor de ciclovías** (sección 8):
  - deslizar arriba = ollie o salto de baranda;
  - abajo = agacharse bajo el aviso de un puente;
  - estrellas por tiempo, pasajes y trucos.
- 💡 Sus movimientos se animaron con herramientas de captura y física (Cascadeur), por eso se ven tan humanos.

**Alto's Odyssey**
- **Bien:**
  - **un solo toque** para todo (saltar y hacer trucos);
  - combos;
  - 180 metas;
  - **modo Zen** sin puntos, sin monedas y sin poderes, en el que no se pierde;
  - vibración al aterrizar un truco.
- **→ El Metro:**
  - el corredor con **un toque** (sostener = cargar el salto, soltar = saltar, girar el dedo en el aire = truco);
  - **modo Zen** por la ciclovía de domingo, al amanecer, sin perder;
  - vibración corta al aterrizar.
- 💡 Descartaron un gancho de agarre porque complicaba el juego de un solo toque.

**Skate Space**
- **Bien:** parques propios, misiones y repeticiones en video.
- **Críticas:** pocos trucos y controles difíciles al armar parques.
- **→ El Metro:**
  - **zonas de skate** en plazas reales del mundo abierto (propuesta: Parque de los Deseos o el bajo del viaducto), donde se para el corredor y se patina libre;
  - **repetición** de los últimos 10 s para la foto.

**Shadow Fight 2 y Gun Fu: Stickman 2**
- Lo que se conoce de estos juegos: peleas en silueta y acción con armas.
- **✗ No aplica** a la pelea.
- Lo transferible: **la silueta** como estilo legible a contraluz (atardecer en el cable) y la animación con **pocos cuadros pero buenas poses**, que ayuda al arte con pocos recursos.

**Hunter Assassin y Bullet Echo**
- **Bien:**
  - tocar para moverse;
  - el **cono de visión** (linterna) como regla de sigilo;
  - en *Bullet Echo*, lo que no se ve se **oye**.
- **✗:** eliminar enemigos.
- **→ El Metro:**
  - **«Avistamiento de aves»** en el Jardín Botánico o en el cerro El Volador: el cono es el de la cámara de fotos y las aves se espantan si te acercas rápido;
  - **guía de seguridad del Metro** que encuentra a un niño perdido entre la multitud usando lo que oye.

  Es la misma mecánica, al servicio de la **contemplación**.

**Soul Knight**
- Lo que se conoce del juego: mazmorras *roguelite* cortas con armas al azar.
- **→ El Metro:** la **estructura roguelite** (recorrido corto, mejoras al azar, volver a empezar) sí sirve. Es el «Un día de operación» de la sección 6.
- **✗:** el combate.

**The Bonfire: Forsaken Lands**
- Lo que se conoce del juego: aldea en 2D de lado alrededor de una fogata; recolectar de día y defender de noche.
- **→ El Metro:** la **vista de lado con ciclo de día y noche** como gestión tranquila:
  - **«La estación de noche»**, cuidar una estación del cable: luces, limpieza, la última cabina;
  - el valle encendido de fondo.
- **✗:** monstruos y defensa.

### 5.4 Contemplación y atmósfera

**Sky: Children of the Light**
- Lo que se conoce del juego: social, sin violencia; se reparte luz y se encuentran espíritus que cuentan una historia.
- **→ El Metro:**
  - **encontrar recuerdos** en el valle: crónicas y fragmentos, que ya existen;
  - **regalar**: el pasaje que le pagas a alguien sin saldo.
- La «presencia» de otros jugadores sin internet: **fantasmas** compartidos por QR (sección 7).

**Monument Valley**
- Lo que se conoce del juego: arquitectura imposible que se gira; cada nivel es una postal.
- **→ El Metro:**
  - **rompecabezas de miradores**: girar la cámara alrededor de un lugar (la Biblioteca España, el Edificio Coltejer) hasta que la foto «calce» con la postal del álbum;
  - es contemplación con una meta.

**Little Nightmares**
- Lo que se conoce del juego: escala pequeña del personaje frente a un mundo enorme; sin texto.
- **→ El Metro:** la **escala** como emoción:
  - la vista de primera persona bajo el viaducto;
  - el niño que ve el metro pasar por encima.

  Es un encuadre para la cámara cine, sin miedo.

### 5.5 Vuelo y espacio

**Real Flight Simulator, Missiles!, 1945 Air Force y Spaceflight Simulator**
- **→ El Metro:**
  - **el dron** de Ciudad Libre ya vuela. Se le puede dar un **circuito de vuelo** con aros sobre el río y entre las torres del centro, al estilo de un simulador ligero;
  - la **vista panorámica del valle** desde el aire, ligada a las fotos del álbum.
- **✗:**
  - *Missiles!* y *1945 Air Force* (disparos);
  - *Spaceflight Simulator* (cohetes), que no cabe en un juego del Metro.

### 5.6 Historias: UnoCero (INDUSTRY ART)

UnoCero (`juanfeliperico369-stack.github.io/UnoCero`) es un **simulador de estudio de arte**: cine, series, videojuegos, teatro, música y libros, de 1700 a 2300. Lo que sirve para dar **peso** a las historias de El Metro:

1. **Línea de tiempo que se abre jugando.** Hitos con ficha, épocas e inventos. Algunos hitos cambian los gustos del público.
   - **→ El Metro:** la **historia del sistema por épocas**: 1995 (la línea A), 2004 (el primer cable, el K), 2011 (Metroplús), 2016 (el tranvía de Ayacucho).
   - Cada época **cambia el mundo abierto**: qué líneas existen y cómo se ve el valle. Así se juega la red como era.
2. **Curiosidades en dos niveles: «lo que todos saben» y «lo que pocos saben».**
   - El Metro ya marca las charlas así.
   - **→** extenderlo a **cada estación**, con una ficha que se completa con visitas, fotos y crónicas.
3. **Arcos con nombre**, como «Condena», «Crisis», «Deudas y promesas», «Dilema», «Redención», «Renacimiento» o «Sacrificio».
   - **→ El Metro:** cada personaje de la Gente tiene **un arco de 3 a 5 escenas** con un tema. Por ejemplo, Don Abelardo, el lustrabotas, con «Renacimiento»: el centro que vuelve a llenarse.
   - Las decisiones del jugador **tuercen el final**.
4. **Noticias y reputación.**
   - En UnoCero, la reputación sube o baja según lo que eliges en una entrevista, y las noticias traen «una moda, una crisis, un auge».
   - **→ El Metro:**
     - un **noticiero o radio** en Ciudad Libre que cuenta lo que hiciste («La conductora que llegó puntual 10 veces seguidas») y lo que pasa en la ciudad («Aguacero en la 80: Metroplús con demoras»);
     - **reputación por barrio** que abre charlas y oficios.

---

## 6. Plan por géneros (los 10 que pidió el autor)

| Género | Cómo se juega en El Metro | Ya existe | Falta (propuesto) | Referencia |
|---|---|---|---|---|
| **Arcade** | Partidas cortas con puntaje inmediato | Carrera, frenado en la marca, cruces | Copa de los barrios (dos botones), contrarreloj por tramo, jugo | Super Arcade Racing, Traffix |
| **Mundo abierto** | El valle real; cada modo jugable en su estación | Ciudad Libre y actividades 🎮 (3.2) | Eventos de temporada, marcadores de tarea, descubrimientos con premio | Forza Horizon, GTA CTW |
| **Roguelite** | **«Un día de operación»**: de 4:30 a. m. a 11 p. m. La demanda crece por horas pico y entre jornadas eliges mejoras al azar (un tren más, andén largo, bus de apoyo). Termina cuando una estación se satura; el día cambia en cada partida. | — | Todo (modo nuevo sobre la red real) | Mini Metro, Soul Knight |
| **Estrategia** | Decidir dónde y cuándo | Despacho, Alimentadores | Centro de control con calles reales; plan de expansión de líneas | 911 Operator, Cities: Skylines |
| **Rompecabezas** | Un gesto, una regla | Arma el cable, agujas | Conecta la red; miradores que calzan con la postal | Infinity Loop, Monument Valley |
| **Acción** | Reflejos sin violencia | Carrera | Corredor de ciclovías con trucos y parkour; escapa del aguacero | Vector, PAKO |
| **Gestión de recursos** | Poco, bien usado | Pasajes 🎫 | La chaza de la estación; mejoras de vagones; red EnCicla | Tiny Rails, Package Inc |
| **Simulador de actividades** | Oficios y rutinas | Taxi, ruta, domicilio, cable | Oficios que suben de nivel; rutina propia; minijuegos táctiles | GTA San Andreas, The Sims |
| **Contrarreloj** | Contra el reloj y contra tu fantasma | Puntualidad en paradas | Fantasma de la mejor vuelta en cada tramo; reto del día | Traffix, Vector |
| **Rol** | Historia propia y de la Gente | Trama, crónicas, personajes | Arcos por personaje con decisiones, reputación por barrio, diario y noticias | UnoCero, Sky |

**Las tres claves del autor** atraviesan todo:
- **Diversión**: arcade, jugo y partidas cortas.
- **Conciencia**:
  - Cultura Metro;
  - ceder el puesto;
  - la ciclorruta no es para carros;
  - lo que se sabe y lo que pocos saben.
- **Contemplación**:
  - modo zen;
  - aves;
  - miradores;
  - el valle de noche.

---

## 7. El mundo abierto como columna (rol y «MMO sin internet»)

1. **Actividades.** Ya están en la 3.2. Siguen:
   - **marcadores** en el mapa grande: 🎮 por estación, ★ si ya tiene estrellas;
   - un **«qué hacer cerca»** que ofrezca las tres actividades más cercanas que te falten.
2. **Calendario real:**
   - ciclovía los domingos y festivos (el corredor zen se abre allí);
   - Feria de las Flores en agosto (silleteros en Santa Elena, desfile);
   - Alumbrados en diciembre (el río encendido; el juego ya tiene `fest`);
   - partidos en el Atanasio (estación Estadio llena).
3. **La historia propia:**
   - eliges tu **barrio de origen** (tu casa, tu estación) y tu **oficio** principal;
   - tu chaza o tu ruta crecen;
   - las crónicas y la Gente te reconocen.
4. **Subtramas por personaje:** arcos de 3 a 5 escenas con tema, al estilo de UnoCero. Las decisiones quedan en un **diario** que se lee como una crónica del jugador.
5. **Reputación y noticias:** por barrio y por línea. El noticiero de radio en Ciudad Libre cuenta lo que hiciste.
6. **«MMO» sin internet**, en un juego de un solo HTML sin servidor:
   - **fantasmas por QR**: el recorrido del amigo en un tramo viaja en un código, y el juego ya trae `05-qr.js`;
   - **duelos de mesa** en el mismo celular, que ya existen;
   - **gente con rutinas** que hace sentir el valle habitado.

   No se propone servidor: rompería la regla de «sin internet en el juego».

---

## 8. Corredor sin fin por ciclovías, skate y parkour (pedido explícito)

**Dónde corre.** Por las **ciclorrutas reales**: ya están en `src/data/vias.js` como vías de tipo 5, con su ancho.
- La pista se arma **encadenando tramos de ciclorruta** en los cruces.
- En cada cruce aparece la elección **↰ / ↱**: el cambio de dirección que pidió el autor.
- Cuando la ciclorruta termina, sigue por la calle de menor jerarquía más cercana. Ahí **se angosta**.
- Ancho real: **ancha** en avenidas con separador (la 80, Las Vegas) y **estrecha** en calles de ladera.

**Cómo se juega**, con un toque como *Alto's* y deslizar como *Vector*:

| Gesto | Qué hace |
|---|---|
| Tocar o sostener | Cargar el salto; al soltar, ollie |
| Deslizar arriba | Salto de baranda o de banca (parkour) |
| Deslizar abajo | Agacharse bajo un aviso o una talanquera |
| A los lados | Cambiar de carril, o elegir ↰ / ↱ en el cruce |
| Girar el dedo en el aire | Truco: kickflip, 360 |

**Cosas en la vía:**
- huecos, charcos, conos, perros, chazas, peatones distraídos con el celular;
- **bancas y barandas** para *grind*;
- **rampas** de acceso a puentes peatonales;
- en la ciclovía dominical, gente trotando.

**Zonas de skate.** Son paradas del corredor y lugares del mundo abierto donde se patina libre, sin reloj. Se proponen en plazas reales como estas:
- Parque de los Deseos;
- el bajo del viaducto.

Combos y fotos.

**Modos:**
- **normal**, con vidas y pasajes;
- **contrarreloj** con fantasma;
- **Zen**: domingo de ciclovía, amanecer, sin perder.

**Conciencia:**
- frenar en los cruces con peatones da puntos;
- invadir el andén quita.

**Estado:**
- Antigravity anuncia una versión en `47-carrera.js` en su rama;
- Codex tocó la colisión de la carrera;
- yo envolví la carrera desde afuera (`96-arcade.js`);
- **propuesta**: integrar la de Antigravity sobre la 3.2, con el contrato de modos intacto (`create`, `step`, `draw`, `levels`, `result`, `ai`, `act`), para que el bot la siga jugando.

---

## 9. Vistas y cámaras: un solo mundo 3D

**Lo que hay hoy:**
- un **dibujo 2D vectorial** de la ciudad (VC): cenital, inclinada y mapa;
- un **mundo 3D** (G3: tercera persona, dron, cine, cabinas);
- la **vista lateral** del metro y del cable («lado»).

Comparten datos (vías, edificios, red), pero son **dibujos distintos**.

**Lo que pide el autor y la propuesta:**
1. **Un solo mundo 3D** para cenital, panorámica, primera y tercera persona. La cenital pasa a ser **una cámara más de G3**:
   - ortográfica o con poca perspectiva;
   - mirando hacia abajo;
   - que se aleja con la velocidad, como los GTA.
2. **El 2D queda para lo que el 2D hace mejor:**
   - **diseñar y detallar el entorno** (el taller de barrios, el mapa);
   - los **modos que lo necesitan**: lateral del metro como *Train Chu*, carreras desde arriba como *Super Arcade Racing*, rompecabezas.

   Esos modos se dibujan **desde los mismos datos**, así no se contradicen con el 3D.
3. **Pixel sin otro mundo.** El «mundo pixel» es el **mismo 3D dibujado a baja resolución con una paleta corta**:
   - 1/3 o 1/4 de la pantalla, escalado sin suavizado;
   - es barato y además **ayuda a los celulares modestos**.

   Para vehículos y personajes en la vista desde arriba, **sprite stacking** (capas 2D apiladas que se ven 3D), popularizado por *NIUM*, da un pixel con volumen sin mallas nuevas.
4. **Un solo rig de cámara** con modos: `cenital`, `inclinada`, `3p`, `1p`, `pan`, `cine` y `lado`.
   - Las transiciones son interpoladas.
   - Cada modo de juego pide la suya; el jugador puede cambiarla.
5. **Horizontal y vertical.** El mismo rig acomoda el campo de visión y el lugar de los controles según la orientación. Antigravity anuncia este trabajo en su rama (`22-gl.js`, `27-camara.js`).

---

## 10. Técnica: render y optimización (celular modesto, un solo HTML)

**Medido:** en 3D, de 13 a 14 cuadros por segundo sin tarjeta gráfica; en 2D, de 57 a 60.

**Ya está:**
- resolución dinámica (`Game.dpr` baja si los cuadros pasan de 34 ms);
- trozos del mapa con presupuesto de 12 ms por cuadro;
- pasos fijos de 1/30 s (3.2).

**Propuesto, en orden de impacto:**

1. **Agrupar la geometría estática por trozo** (*batching*): una malla por trozo con todos sus edificios en vez de una llamada por edificio. Es la recomendación principal de MDN: menos llamadas y más grandes.
2. **Instancias** para lo repetido: árboles, postes, carros, personas.
   - Ojo: un reporte de WebKit (2020) midió instancias muy lentas en un iPhone 12 Pro.
   - Hay que **medir** y tener respaldo sin instancias.
3. **Presupuesto de llamadas:** una guía para OpenGL ES da menos de 500 por cuadro; para gama baja, **150** como meta.
4. **Detalle por distancia (LOD) e impostores:** de lejos, los edificios son cajas sin ventanas o un recorte pintado del horizonte, que el juego ya tiene.
5. **Atlas de texturas** para no cambiar de textura entre llamadas.
6. **Recorte por vista** (*frustum culling*) por trozo; y por oclusión simple en el centro, con los edificios altos.
7. **Modo pixel** (sección 9) como «calidad baja» que se ve intencional y no pobre.
8. **Sin reflujos del DOM en el bucle:** la interfaz ya actualiza su HUD cada 0,2 s y cachea medidas. Sigue la regla.
9. **Datos comprimidos** (deflate, ya usado) y **carga perezosa** de regiones.

---

## 11. Juegos grandes con pocos recursos (lo aprendido)

- **Un mundo, muchos modos.** El Metro ya lo hace: la misma red sirve al metro, al cable, al bus, al despacho y a la carrera. **Cada modo nuevo debe salir del mundo que ya existe** (sección 3.7), no de un escenario aparte.
- **Datos reales en vez de contenido a mano:** 639 457 edificios, 3411 calles con nombre y 502 barrios. Es la ventaja de El Metro sobre cualquier juego de su tamaño.
- **Lo procedural, con curaduría.** Las retrospectivas avisan:
  - la generación procedural no ahorra diseño;
  - puede dar contenido «parecido»;
  - una narrativa totalmente procedural desborda a un equipo pequeño.

  **→** las historias se escriben a mano (arcos cortos) y el mundo se genera de datos.
- **Reusar sistemas, no arte.** Un solo contrato de modos y un solo taller de mallas. Lo mismo para la cámara (sección 9).
- **Alcance:** versiones pequeñas con criterio medible (sección 12). Cada una pasa por `node tools/test.mjs 100` con 0 errores.

---

## 12. Hoja de ruta

| Versión | Qué | Criterio de aceptación (medible) |
|---|---|---|
| **3.2.0 ✔** | Modos arreglados, arcade, todo abierto, actividades 🎮, acelerador fijo | Auditoría: todos los modos avanzan con ▲ en menos de 2 s y a ritmo 1,0. Autotest y 100 partidas con 0 errores. |
| **3.3.0 ✔** (otra sesión) | ⚙️ Flexibilidad: arcade o realista, mano zurda, joystick, giro, velocidad; unión de las ramas de las IAs | Autotest y 100 partidas con 0 errores |
| **3.4.0 ✔** | Corredor solo por ciclovías: cruces ↰/↱, tramos estrechos, zonas de skate, trucos, parkour a pie y 🎮 desde cualquier ciclorruta. Jugo en todos los modos | La pista no se sale de la ciclorruta; con el piloto, 4 de 6 ciclorrutas terminan con 2–3 vidas; autotest y 100 partidas con 0 errores |
| **3.5.0 ✔** (otra sesión) | Unión con «Mundo 3D y Realismo» de Antigravity (cen3d, mundoRPG, shaders) | 100 partidas con 0 errores |
| **3.6.0 ✔** | 3D recortado y regulado (📏), ciudad viva en familia, ⭐ reto del día, 🌅 domingo zen; pedidos y prompts para Gemini y ChatGPT | En el 3D emulado, el volante pasa de 5 a 16 y Ciudad Libre de 6,5 a 18 cuadros por segundo, con ritmo 1,0; 0 errores |
| **3.7.0 ✔** | 📅 Épocas (la red como era, con ficha y tono de recuerdo) y 🎨 pasajes que se gastan (pintura de tus vehículos) | En 1995 solo la A; en 2011, Metroplús y no tranvía; al salir, toda la red; autotest y 100 partidas con 0 errores |
| **3.8.0 ✔** (otra sesión) | Unión de las 3.7 (Épocas y GA‑36 de Antigravity), Codex / GPT‑6 Eón (CX‑36) y el arte C‑70 a C‑72 | Autotest y 100 partidas con 0 errores |
| **3.9.0 ✔** | Unido y medido: 3D recortado por lo que ve la cámara, «Un día de operación» que se puede ganar, fantasmas fuera de la partida y en segundos, arte de ChatGPT en el juego, 🔧 taller de la bici (motor 5.3) | Vértices por cuadro en San Antonio: 788 mil → 155 mil (cenital 3D) con la misma imagen; el piloto gana las 7 jornadas y no jugar pierde la primera; autotest y 100 partidas con 0 errores |
| **4.0 (Claude)** | Calendario real en el mundo abierto (ciclovía del domingo, Feria de las Flores, Alumbrados), menos fichas en la barra de arriba y la calidad por defecto con las cifras del celular del autor (`?medir`) | `docs/SUGERENCIAS-CLAUDE.md` § 5 |
| **3.5** | Cenital 3D sobre G3; rig único de cámaras; horizontal y vertical | 30 cuadros por segundo en cenital 3D en «celular modesto» (sin tarjeta gráfica: 25 o más) |
| **3.6** | Contrarreloj con fantasma, reto del día y fantasmas por QR | Fantasma reproduce el tramo con error < 1 m |
| **3.7** | «Un día de operación» (roguelite) y Cruces con el control de Traffix | Partida de 5–10 min; dos partidas seguidas nunca iguales |
| **3.8** | Historias con peso: arcos por personaje, reputación, diario, noticias, épocas del sistema | 6 arcos completos; el diario guarda las decisiones sin romper `elmetro.v1` |
| **3.9** | Arte: modelos más realistas, modo pixel, sprite stacking | Mismo costo de dibujo o menor; respaldo procedural |

---

## 13. Lo que reportan las otras IAs

Lo leí en el repositorio el 22‑nov a las 14:17 UTC.

**Antigravity (Google DeepMind / Gemini)**, rama `ia/antigravity/evolucion-3.2`, aviso `20261122-1415-antigravity-evolucion-3.2.md`.
- Escribe `docs/PLAN-EVOLUCION-ANTIGRAVITY-GEMINI.md`: comparación de más de 35 referencias, «un solo mundo 3D», plan por los 10 géneros y RPG o MMO ligero.
- Anuncia arreglos que coinciden con los míos:
  - todo liberado;
  - `substeps`;
  - crucero;
  - puertas ágiles;
  - impulso táctil estilo Traffix en `45-metroplus.js`;
  - acelerador fijo;
  - actividades en `36c-actividades.js`.
- Anuncia también:
  - el corredor por ciclovías con skate y parkour en `47-carrera.js`;
  - un mundo 3D con luz hemisférica, oclusión, especular y neblina;
  - las cámaras cenital 3D, 1p, 3p, panorámica, cine y 2D/pixel.
- **Mi propuesta de integración:**
  - lo que ya está en 3.2 (tiempo real, arcade, abierto, actividades, acelerador fijo) queda como base;
  - de su rama conviene traer el corredor de ciclovías, la cenital 3D, la luz y el control Traffix;
  - todo debe pasar el autotest y las 100 partidas.

**Codex (ChatGPT)**, rama `ia/codex/metro-20261122`, aviso `20261122-1430-codex-relevo-311.md`.
- Trabaja en:
  - la hora del primer cuadro del cable (`52-cableviaje.js`);
  - la colisión a lo largo del desplazamiento en la carrera (`47-carrera.js`);
  - los pasajeros al bajar y al cerrar puertas del bus (`38-bus.js`);
  - regresiones en `90-bot.js`.
- No incorporó el bus a Guatapé, porque usa carretera ficticia, y lo explica.
- Su investigación irá en `docs/CONTEXTO-CODEX-2026-11-22.md`.
- **Encaja con la 3.2:** yo no toqué esos archivos, salvo envolver la carrera desde afuera.

**OpenAI GPT‑6**, rama `ia/openai-gpt6/fluidez-metro-20261122`, aviso `20261122-0930-openai-gpt6-metro.md`. La vi en el segundo `git fetch`.
- Escribe `docs/OPENAI-GPT6-METRO-AUDITORIA-2026-11-22.md`: referencias, riesgos, mundo único, fases, presupuesto gráfico, ciclovías y criterios de aceptación.
- Su módulo aditivo `src/js/98a-openai-gpt6-fluidez.js`:
  - quita los candados de niveles y capítulos (igual que la 3.2);
  - acelera la carrera a unos 4,3 m/s² hasta el tope;
  - arregla el teclado de vistas.
- **Hallazgo que mi auditoría no vio:** con la tecla V las vistas pasan con `% 4`. En el metro (6 vistas) y en el volante (5), la cenital y la panorámica no se alcanzan con el teclado. Con los botones de la pantalla sí se alcanzan.
  - **→** integrar su arreglo de vistas en la 3.3.
  - Su aceleración de la carrera y la mía (`96-arcade.js`) no deben sumarse: hay que elegir una. Propongo la suya si se mide la distancia de reacción ante los obstáculos, como él mismo advierte.
- Avisa con honestidad que no corrió una prueba táctil real ni el build completo de su rama.

---

## 14. Fuentes

**Referencias del autor:**
- Super Arcade Racing:
  - https://www.thexboxhub.com/super-arcade-racing-review/
  - https://bonusstage.co.uk/archives/178310
- Traffix: https://apps.apple.com/app/id1465703539 · Traffix 3D: https://apps.apple.com/app/id1483904390 · Steam: https://store.steampowered.com/app/1102580
- Railways!: https://apps.apple.com/app/id1492002834
- Package Inc.: https://apps.apple.com/app/id1518996950 · https://www.ladiesgamers.com/package-inc-review/
- Tiny Rails: https://www.pocketgamer.com/tiny-rails/review/ · https://store.steampowered.com/app/614630
- 911 Operator: https://store.steampowered.com/app/503560 · https://apps.apple.com/app/id1199822686
- PAKO Forever: https://apps.apple.com/app/id1352933197
- #DRIVE: https://toucharcade.com/games/drive
- Reckless Getaway 2:
  - https://www.androidpolice.com/2017/05/24/pixelbites-reckless-getaway-2-races-onto-play-store/
  - https://apps.apple.com/app/id1190553787
- Skate Space: https://apps.apple.com/app/id1466582074
- Forza Horizon: https://en.wikipedia.org/wiki/Forza_Horizon
- GTA Chinatown Wars:
  - https://www.gamespot.com/reviews/grand-theft-auto-chinatown-wars-review/1900-6237360/
  - https://www.destructoid.com/?p=42157
  - https://www.gamesradar.com/gta-chinatown-wars-on-iphone-the-best-version-yet
  - https://en.wikipedia.org/wiki/Grand_Theft_Auto:_Chinatown_Wars
- Bullet Echo: https://apps.apple.com/app/id1500726361
- Hunter Assassin: https://apps.apple.com/app/hunter-assassin/id1479587574 · https://www.mobygames.com/game/145654/hunter-assassin/
- Vector: https://en.wikipedia.org/wiki/Vector_(video_game) · https://apps.apple.com/app/id578252579
- Alto's Odyssey: https://en.wikipedia.org/wiki/Alto%27s_Odyssey · https://apps.apple.com/app/id1182456409
- Townscaper:
  - https://en.wikipedia.org/wiki/Townscaper
  - https://www.gamedeveloper.com/game-platforms/how-townscaper-works-a-story-four-games-in-the-making
- UnoCero (INDUSTRY ART): https://juanfeliperico369-stack.github.io/UnoCero/ (leído desde su repositorio público).

**Agregada por el diseño:** Mini Metro y Mini Motorways.
- https://en.wikipedia.org/wiki/Mini_Metro_(video_game)
- https://www.gamedeveloper.com/audio/-i-mini-motorways-i-and-the-delicate-art-of-marrying-complexity-and-minimalism
- https://www.vice.com/en/article/we-asked-a-transit-planner-how-to-up-our-mini-metro-game

**Sensación de juego:**
- https://en.wikipedia.org/wiki/Game_feel
- https://arxiv.org/abs/2011.09201
- https://www.gamedeveloper.com/design/6-mistakes-that-ll-drain-the-juice-out-of-your-game
- https://www.gameanalytics.com/blog/squeezing-more-juice-out-of-your-game-design

**Render y optimización:**
- https://developer.mozilla.org/docs/Web/API/WebGL_API/WebGL_best_practices
- https://developer.amazon.com/docs/vega/0.22/webview-webgl-best-practices.html
- https://bugs.webkit.org/show_bug.cgi?id=218949
- https://android-developers.googleblog.com/2015/05/game-performance-geometry-instancing.html

**Pixel con volumen (sprite stacking):**
- https://80.lv/articles/developer-shows-how-to-make-2d-game-look-3d-with-sprite-stacking
- https://dev-dwarf.github.io/dwarfdev/tutorials/2021/01/24/Stack3D-Guide.html

**Alcance y generación procedural:**
- https://www.gamedeveloper.com/design/level-design-in-procedural-generation
- https://www.gamedeveloper.com/business/post-mortem-george-scared-of-the-dark
- https://80.lv/articles/workflows-challenges-of-developing-games-as-a-two-person-team
