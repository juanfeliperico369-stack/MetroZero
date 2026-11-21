# Bitácora · El Metro

> Guía viva del proyecto. Quien retome el trabajo (persona o IA) debe leer esto, `docs/PLAN.md` y `arte/README.md`, y actualizar esta bitácora al cerrar cada sesión.



## 21‑nov‑2026 · Motor City 4.6.0 en `motor-city/` e informe (Claude, sesión del motor)
- `motor-city/` pasó a 4.6.0 (el manejo y el mapa de EnCicla en el motor, horizontal y un solo juego de prueba). El juego no cambió en esta entrada: el manejo de EnCicla de El Metro ya lo hizo la sesión de El Metro en la 3.1.0 «Fluido» (rama `ccr-2a67f935-oat714`, APK 29).
- Informe: `docs/INFORME-MOTOR-CITY-4.6.md`.

## 21‑nov‑2026 · Motor City 4.5.0 en `motor-city/` e informe para la IA que siga (Claude)
- **El autor decidió:** El Metro **sigue con su propio motor**; Motor City se comparte como referencia. Lo que cambió, mejoró, falta auditar y les toca, y cómo usar el motor sin dejar el propio: **`docs/INFORME-MOTOR-CITY-4.5.md`**.
- **Publicado:** `main` al día con la rama de Claude y `gh-pages` con el `dist/` nuevo.
- **Probado:** `node tools/build.mjs` y `node tools/test.mjs 100` (0 errores).
- **Falta:** el informe, § 4 y § 5 (crónicas Z3, bus a Guatapé, manejo, modelos, rostros, mapa fiel).

## 21‑nov‑2026 · Motor City 4.4.0 en `motor-city/` (Claude)
- El autor confirmó que las otras IA ya no siguen: Claude lleva todo. Lo pendiente de este juego está en `motor-city/CONTEXTO-RELEVO.md` § 5:
  - el bus a Guatapé con el lector MC4 del motor (zonas Z4 y Z5);
  - las crónicas (Z3).
- Las tarjetas de MODOS que señaló la auditoría ya no se cruzan con el texto en la versión actual (se comprobó a 412 × 860).
- Probado: `node tools/build.mjs` y `node tools/test.mjs 100`, con 0 errores.

## 21‑nov‑2026 · Mundo abierto primero y los íconos (Claude, a partir de la auditoría G‑H28 de Antigravity)
- **Regla del autor:** mundo abierto desde el principio; el tutorial y la historia son opcionales.
- **`src/js/97-abierto.js`**, aditivo (envuelve `Menu.bind`):
  - **▶ Jugar entra directo a Ciudad Libre**: donde quedaste o, la primera vez, San Antonio. 1 toque y 0,4 s (antes, 3 toques: MODOS, la grilla y el inicio);
  - el botón nuevo **«Todos los modos»** queda justo debajo;
  - la historia y la guía siguen opcionales en la portada;
  - al salir de Ciudad Libre se vuelve a la portada.
- **Íconos:**
  - `favicon.svg`, `favicon-32.png`, `icon-*.png` y `apple-touch-icon.png` estaban solo en `gh-pages`, así que en local daban 404 y el service worker podía fallar al instalar;
  - ahora viven en `src/iconos/` y `tools/build.mjs` los copia a `dist/`.
- **`tools/test.mjs`:** comprueba que ▶ Jugar entra directo a Ciudad Libre. Las capturas ahora son `02-ciudad-libre` y `02b-modos`.
- **Probado:** `node tools/build.mjs` y `node tools/test.mjs 100`, con 0 errores y 0 errores de consola.

## 21‑nov‑2026 · Motor City 4.2.0 en `motor-city/` (Claude)
- Llegó el motor 4.2:
  - recorte por región en el 3D;
  - IA que no se tranca en el borde de la calle;
  - el vuelo sin pausa;
  - las entregas de ChatGPT y de Antigravity unidas.

  Turno Cero sigue aislado.
- Probado: `node tools/build.mjs` y `node tools/test.mjs 100`, con 0 errores.

## 21‑nov‑2026 · Motor City 4.1.0 en `motor-city/` (Claude)
- Llegó el motor 4.1. Trae técnicas de motores clásicos, rehechas desde cero:
  - 🏁 Arcade (la carretera de OutRun), que podría servir para un modo de bus por la Autopista del Embalse;
  - ⛰️ Vuelo (el Voxel Space de Comanche), que podría servir para ver el valle desde el Metrocable;
  - la gema y el ruido de Thief;
  - el DDA de Wolfenstein;
  - las semillas de Elite.

  Ver `motor-city/docs/INVESTIGACION-MOTORES-CLASICOS.md`. Turno Cero sigue aislado.
- **Regla nueva del autor:** mundo abierto desde el principio; el tutorial y la historia son opcionales y nunca bloquean (`motor-city/CONTEXTO-RELEVO.md` § 7). Gemini lo revisa en este juego (G‑H28).
- Probado: `node tools/build.mjs` y `node tools/test.mjs 100`, con 0 errores.

## 21‑nov‑2026 · Relevo Z1 y Z2: los 6 errores que halló Antigravity, terminados (Claude)
- Antigravity reclamó Z1 y Z2 (`.ai-coord/estado-antigravity.json`) y catalogó 6 errores a `412 × 860`, pero se quedó sin uso antes de subir los arreglos. El autor pidió terminarlos.
- **Arreglos** (casi todo en el archivo aditivo `src/js/98-relevo-z1.js`, con ganchos sobre `Menu`, `Game` y `EM.modes.carrera`):
  1. **Ciudad Libre:** todos los inicios abiertos. Son puntos de partida, no niveles con estrellas; antes solo se abría el primero.
  2. **`#ghud`:** las fichas se recortan y ya no empujan el botón de pausa fuera de la pantalla.
  3. **`.camui`:** la columna de cámara baja sola bajo el tablero de la cabina, la barra del trabajo (también la del tutorial y la de la trama) y el mensaje.
  4. **Historia:** el lienzo conserva su 16:9; antes se estiraba 2,5× en alto.
  5. **Carrera:**
     - suenan el pasaje, el poder, el golpe, el escudo, la estación y el salto;
     - `47-carrera.js` recorre solo la ventana de obstáculos cercana con un cursor (`crVentana`), no todos los de la línea en cada cuadro.
  6. **`25-game.js`:**
     - `--sat` se lee solo al cambiar el tamaño, no con `getComputedStyle` en cada cuadro;
     - `pointercancel` suelta el dedo.
- **Probado:**
  - `node tools/build.mjs`;
  - `node tools/test.mjs 100`: 100 partidas, 0 errores, 0 errores de consola;
  - medición en Chromium `412 × 860`:
    - 0 inicios bloqueados;
    - pausa dentro de la pantalla en todos los modos;
    - la cámara no se cruza con la barra ni con el mensaje;
    - historia con proporción 1,00.
- **Motor:** `motor-city/` pasa a la 4.0.3, con las entregas de ChatGPT y Antigravity unidas. Turno Cero sigue aislado y no se mezcla con este juego.
- **Falta (de Antigravity, sin reclamar por nadie más):** Z3 (`37-cronicas.js`), Z4 (`15-mc-puente.js`) y Z5 (`48-planificador.js`, `49-guatape.js`). Están en `.ai-coord/estado-antigravity.json`.

## 20-nov-2026 · Motor City 4.0.0 en `motor-city/`
- Llegó el motor 4.0. Trae:
  - el planeta (`MC.Planeta`);
  - la búsqueda 0–5 (`MC.Busqueda`);
  - el lector GLB (`MC.Modelos`);
  - los juegos con varios mundos.
- *Turno Cero*, el juego adulto de Motor City, queda aislado en `motor-city/juegos/getaway/` y no se mezcla con este juego. Manhattan no se copia aquí.
- `TAREAS-IA.md` tiene la nota de la 4.0 y un pedido adaptado a este juego.
- Pruebas en verde.

## 20‑nov‑2026 · Tutorial opcional (lo del motor 3.0, adaptado a El Metro) (Claude, la IA del motor)
- **`src/js/69-tutorial.js`: «❓ Cómo se juega» opcional.**
  - Nunca sale solo ni bloquea: es un botón al final del menú.
  - Son pasos cortos para el juego y para cada modo (Ciudad Libre, Metro, Metroplús, Metrocable, Carrera, Historia y Red), con Atrás, Siguiente y Saltar.
  - La primera vez solo se ofrece con un aviso que se va solo. En Ajustes, «Ofrecer “Cómo se juega”» lo apaga.
- Probado: `node tools/build.mjs` y `node tools/test.mjs 100` con 0 errores. En el navegador, el botón aparece, no se abre solo, avanza y «Saltar» lo cierra.
- Queda para la IA de El Metro llevar a Ciudad Libre lo demás del motor 3.0: el mundo 3D único con sus cámaras aéreas, los topes de zoom, el mapa grande y los artilugios físicos (`motor-city/docs/INVESTIGACION-CAMARA.md`).

## 20‑nov‑2026 · Motor City 3.0 en `motor-city/` (Claude, la IA del motor)
- Se sincronizó el motor 3.0:
  - un solo mundo 3D con varias cámaras (la cenital, la ciudad y la maqueta sobre el mismo mundo);
  - fachadas y árboles low-poly;
  - `MC.Objetos`;
  - topes de zoom y el mapa grande.
- **El juego no cambia** y sus pruebas siguen en verde (100 partidas, 0 errores).

## 20‑nov‑2026 · Motor City 2.10 en `motor-city/` (Claude, la IA del motor)
- Se sincronizó el motor 2.10:
  - las skills y plugins de los videos del autor: Hallmark, Modern Web Guidance, find-skills y HyperFrames (`.claude/settings.json`, y `CLAUDE.md` vía `tools/todo.mjs`);
  - el público simulado;
  - rutas por la calle;
  - el cómic y el 1 bit más rápidos;
  - atlas más livianos.
- **El juego no cambia** y sus pruebas siguen en verde (100 partidas, 0 errores).

## 20‑nov‑2026 · Ramas unidas y Motor del Valle 1.2.0 (Claude, la IA del motor)
- **Motor del Valle 1.2.0** copiado desde Juega EnCicla, que es la fuente de verdad (`node motor-valle/sincronizar.mjs ../MetroZero`):
  - capas comunes y por juego;
  - `js/red-niveles.mjs`;
  - `geo/pasos.py`.
  Es lo mismo que traía la rama `motor-valle` (de55357).
- La rama **`plan-unico-el-metro`** (57d66c9) **no se fusionó**: es una línea paralela que ya quedó dentro de la v2.0.0 (ace4f1e):
  - la carrera sin fin con poderes;
  - los seis personajes de EnCicla;
  - los techos y las estaciones en 3D;
  - los deprimidos de OpenStreetMap.
  Fusionarla habría devuelto el código a su estado anterior en 14 archivos.
- Pruebas: `node tools/build.mjs` y `node tools/test.mjs 100`, con 0 errores.

## 20‑nov‑2026 · Motor City 2.9 en `motor-city/` (Claude, la IA del motor)
- Se sincronizó el motor 2.9:
  - la entrega maestra de referencias;
  - la entrega de Gemini;
  - la de ChatGPT y Codex (arte a escala, lluvia, 1 bit, agua precalculada y adaptadores).
- **El juego no cambia** y sus pruebas siguen en verde (100 partidas, 0 errores).

## 20‑nov‑2026 · Motor City 2.8 en `motor-city/` (Claude, la IA del motor)
- Se sincronizó el motor 2.8, con lo que se pudo hacer ya de la entrega maestra de referencias del autor:
  - fauna que reacciona, huellas, faros y luces de freno;
  - los estilos vintage, CRT y térmico;
  - accesibilidad, telemetría en percentiles y contratos de datos.
- **El juego no cambia** y sus pruebas siguen en verde (100 partidas, 0 errores).

## 20‑nov‑2026 · Motor City 2.7 en `motor-city/` (Claude, la IA del motor)
- Se sincronizó el motor 2.7:
  - estilos gráficos (cómic, manga, anime, novela gráfica, ukiyo-e y acuarela);
  - peso y vida;
  - la exportación del mundo a glTF para motores más potentes.
- **El juego no cambia** y sus pruebas siguen en verde (100 partidas, 0 errores).

## 20‑nov‑2026 · Motor City 2.6 en `motor-city/` y `TAREAS-IA.md` (Claude, la IA del motor)
- Se sincronizó el motor 2.6:
  - estilo realista familiar (árboles de pie, asfalto gastado, andenes de baldosa, techos con textura);
  - tutorial opcional.
- **`TAREAS-IA.md`** en la raíz: la lista de cada IA en orden. Gemini con Antigravity («hydrogen») hace lo fácil; ChatGPT y Codex («astra») hacen lo fuerte.
- Protocolo: Antigravity pasa de «argon» a «hydrogen»; los encargos G‑ difíciles van a ChatGPT. `CLAUDE.md`, `AGENTS.md` y `GEMINI.md` regenerados con `node tools/todo.mjs`.
- **El juego no cambia** y sus pruebas siguen en verde (100 partidas, 0 errores).

## 19‑nov‑2026 · Motor City 2.5.1 en `motor-city/` (Claude, la IA del motor)
- Se sincronizó el motor 2.5.1:
  - controles que se ven (joystick, botones de acción y flecha al objetivo);
  - modo libre en Mandados;
  - el arte de Gemini integrado con `MC.Pieles` (`motor-city/dist/arte/gemini.js`);
  - leyenda en las capas de datos;
  - la lista de pedidos.
- `.gitignore`: `dist/` pasó a `/dist/` (más `motor-valle/dist/`), para que `motor-city/dist/` quede en git.
- **El juego no cambia** y sus pruebas siguen en verde (100 partidas, 0 errores).

## 19‑nov‑2026 · Motor City 2.5 en `motor-city/` (Claude, la IA del motor)
- Se sincronizó el motor 2.5: entrar al agua (dejar el vehículo en la orilla, nadar, bucear con aire, volver a subirse, lancha).
- **El juego no cambia** y sus pruebas siguen en verde.

## 19‑nov‑2026 · Motor City 2.4 en `motor-city/` (Claude, la IA del motor)
- Se sincronizó el motor 2.4: terreno y límites verosímiles (agua con profundidad, pendientes, obstáculos reales), naturaleza y lagos generados.
- **El juego no cambia** y sus pruebas siguen en verde.
- Qué sigue: `motor-city/docs/DOCUMENTO-UNICO.md`, §9.

## 19‑nov‑2026 · Motor City 2.3 en `motor-city/` (Claude, la IA del motor)
- **Qué se hizo:** sincronizar el motor 2.3 (sombras del sol, mobiliario urbano, fachadas por reglas, `MC.Urbe` con capas de datos, objetos inteligentes y sonido ambiente).
- **Cómo se probó:** `node tools/build.mjs` y `node tools/test.mjs 100`, con 0 errores. El juego no cambia.
- **Qué falta:** la migración (le toca a la IA de El Metro). Lee `motor-city/docs/DOCUMENTO-UNICO.md`, §9.4: ahí está la lección «las estaciones suben el valor del suelo».

## 19‑nov‑2026 · Motor City 2.2 en `motor-city/` (Claude, la IA del motor)
- **Qué se hizo:**
  - el motor (ahora solo «Motor City») quedó en `motor-city/`, sincronizado desde `juanfeliperico369-stack/motorcity`;
  - `motor-valle/` volvió a como estaba en `cc5d7a6`.
- **Cómo se probó:** `node tools/build.mjs` y `node tools/test.mjs 100`, con 0 errores. **El juego no cambia.**
- **Qué aprendí:** que cada juego reciba el motor en su propia carpeta, sin pisar la que usa.
- **Qué falta:** la migración, que le toca a la IA de El Metro. Ver `docs/CONTEXTO-MOTOR-CITY.md` y `motor-city/docs/PLAN-IAS.md`, sección 4.

## 2026-11-19 · Motor City 2.0 en `motor-valle/` (el juego no cambia)
> Lo hizo la IA del motor (Claude Code), a pedido del autor. Solo tocó `motor-valle/`, esta bitácora y `docs/CONTEXTO-MOTOR-CITY.md`. No hizo encargos de El Metro.

**Qué cambió:**
- La copia del motor pasó de **1.1.0 a Motor City 2.0.0**, sincronizada desde `juanfeliperico369-stack/motorcity`, la nueva fuente de verdad. Trae:
  - el mundo 2.0, con tus 639.457 huellas, tus puentes, rieles, Metroplús e hitos, más lo de EnCicla;
  - el motor (`motor-valle/dist/motor.js`): transporte con horario determinista, la panorámica que parte de tu `23-lado.js`, WebGL, maqueta 2:1, pixel, clima y Run en la ciclovía;
  - la guía `motor-valle/docs/MIGRACION-ELMETRO.md`.
- `motor-valle/js/valle.js` pasó a ser el lector 1.2.0, que une las dos 1.1.0 y conserva tu interfaz `MotorValle` / `Valle.elmetro`.
- `tools/build.mjs` no incluye `motor-valle/`: el juego compilado es idéntico (`b8f24800`).

**Qué se probó:**
- `node tools/build.mjs`: la misma huella;
- `node tools/test.mjs 100`: 0 errores.

**Qué falta (para la IA de El Metro, con su protocolo):** decidir si usar el motor 2.0 y el mundo 2.0 en lugar de los datos propios. Ver la guía.

## Estado al 2026-11-19 · v2.0.0 "La revolución"
**Novedad de v2.0.0:** llegaron las entregas del Plan único para El Metro y entró lo mejor de las dos, revisado, medido y corregido. Las copias quedan en `docs/entregas/2026-11-19/`:
- **ChatGPT/Codex (arte):** `EL-METRO-M1-M6-chatgpt-codex.md`, un taller de arte procedural en código.
- **Gemini/Antigravity (código):** `ENTREGA-EL-METRO-gemini-antigravity.md`, con diferencias contra v1.4.0.

**Qué entró de Gemini/Antigravity:**
- **Terminales de la línea O en su andén:** `tools/rutas_calles.mjs` parte el tramo de calle frente a cada parada.
  - Caribe y La Palma ya no dan aviso; el autotest queda con **0 avisos**.
- **Laderas en 3D sin escalones:** `VC.piso3D` ya no estampa el relieve de 20 m; el terreno lleva normales suaves por vértice (`G3.normT`, `G3.quadT`) y filtro anisótropo hasta 8×.
- **Cámara de cine que no se mete en las paredes:** `VC.camaraLibre` en Ciudad Libre, el metro y Al volante.
  - Corregido aquí: la línea de vista se revisa cada 3 m, no en tres puntos; antes quedaba pegada a una fachada en Estadio.
- **Techos en 3D:** teja a dos aguas, tanques de agua negros o azules sobre las planchas de ladera, y coronas con baliza roja en las torres.
  - Corregido aquí: la entrega preguntaba por campos que no existen (`b.teja`, `b.s`), así que solo salían las coronas. Ahora usa `b.rt` (tipo de techo) y `b.z` (zona) de `VC.estilo`.
- **Estaciones elevadas:** franja amarilla táctil, columnas, marquesina y escaleras.
  - Se quitó el vestíbulo a ras de piso con torniquetes: quedaba enterrado (se veía como ruido blanco) y tapaba la calle de abajo.
- **Calles:** separador verde en avenidas anchas, quebradas con canal de concreto, bancas y paraderos en el andén.
- **Sprites de micromovilidad:** cenitales (`Spr.veh`) y laterales (`Lado.vehS`).
- **Capítulo de Historia «Ruedas que conectan el valle»:** va a la carrera por la línea B, con los diálogos revisados.
- **La idea de los fragmentos de EnCicla:** se guardan en `Save.d.fragsEncicla`.

**Qué entró de ChatGPT/Codex:**
- **El taller de arte procedural** (`src/js/28-taller-*.js`, `EM.taller`): mallas en metros con el formato de vértices de G3 y un respaldo en Canvas 2D.
  - **Vehículos 3D:** bici, skate, patines, monopatín, patineta eléctrica, moto, carro, taxi, camioneta, bus y alimentador. En la bici y la moto el conductor va sentado.
  - **Obstáculos 3D:** hueco, cono, moto, perro, chaza, charco y pasaje.
  - **Manubrio y manos en primera persona** (`T.primera`).
  - **Escena animada del pasaje doblado:** el tren al atardecer, el retrato y el papel que se abre. Sale al juntar los 6 fragmentos (+20 🎫).
- **Los seis personajes de Juega EnCicla** (`src/data/guion.js`), con los oficios del juego de EnCicla:
  - Doña Luz, usuaria desde 2011, en San Antonio;
  - Santi, anfitrión, en Floresta;
  - Don Jairo, mecánico, en Estadio;
  - Wilson, de balance, en Caribe;
  - Cata, de monitoreo, en Acevedo;
  - Maryi, de pausas activas, en Universidad.
  - Sus datos de la red se revisaron contra el juego.
- **El capítulo «El pasaje doblado»** en la trama de Ciudad Libre: San Antonio → carrera → línea B → Floresta → Estadio → postal. Va antes del Epílogo para no descuadrar partidas guardadas.

**Lo que se hizo distinto (y por qué):**
- **Deprimidos:**
  - La entrega traía 5 con coordenadas puestas a mano, y varios no coinciden con nada real.
  - `tools/puentes_datos.py` ahora saca de OpenStreetMap (Overture: `is_tunnel`) **26 deprimidos reales** de 30 a 600 m. Entre ellos están el soterrado de Parques del Río (Carrera 62, 459 m), la Calle 58, la Calle 67 y la Transversal Inferior.
  - Los túneles de montaña (Occidente, Oriente) quedan fuera.
  - Los 2.150 puentes quedaron idénticos.
  - En el deprimido se baja en rampa (nivel −1). Los carros del tramo cubierto no se pintan encima del parque.
- **Anillo de edificios hasta 1.050 m:** medido, armar la ventana 3D en Santo Domingo pasaba de 0,38 s a 1,34 s (tirones al moverse). Queda apagado; los techos solos cuestan un 5–10 %.
- **«Run Scooter» (`34-carrera.js`):**
  - No entró tal cual: su 3D llama funciones que no existen en el motor (`G3.drawScene`, `G3.groundAt`, `G3.quad`, `G3.rgb`), así que nunca se había corrido con WebGL.
  - De ahí se tomaron, para la carrera de 1.5.0 (ya probada en 3D), la **elección de vehículo** (🛹: skate, patines, monopatín, patineta eléctrica o bici EnCicla, guardada en `settings.vehCr`), los **poderes** (🧲 imán, ⚡ turbo, 🛡 escudo) y la **línea O por la 80**.
- **Sus 6 vehículos para Ciudad Libre:** ya estaban desde 1.5.0 con su física; se quedaron los de 1.5.0.
- **Mapa:** su `motor-valle` decía que la fuente de verdad era MetroZero (al revés). Se sincronizó el motor real **1.1.0** desde Juega EnCicla con `sincronizar.mjs`; el mapa base de El Metro no cambia.

**Falla propia corregida:** desde 1.5.0, `tools/build.mjs` metía el *nombre* de `src/data/guion.js` en vez de su contenido. No se notaba porque el archivo no existía.

**Para la IA de Juega EnCicla:** el Motor del Valle 1.1.0 trae 12 deprimidos escritos a mano en `geo/alturas.py`. Los reales salen de Overture con `is_tunnel` (ver `tools/puentes_datos.py` de El Metro); conviene pasarlos al motor.

**Qué se probó:**
- autotest con 0 errores y 0 avisos, con comprobaciones nuevas: mallas del taller, poderes y vehículos de la carrera, deprimidos, cámara de cine y los 6 personajes con su estación;
- 100 partidas del bot: 343.504 pasos y 40 victorias, con 0 errores y 0 errores de consola;
- capturas 3D en Santo Domingo, Laureles, El Poblado, Exposiciones, Industriales, la Calle 58 y Parques del Río;
- la carrera con cada vehículo en primera y tercera persona, y la escena del pasaje doblado.

**Publicado:** https://juanfeliperico369-stack.github.io/MetroZero/ (**v2.0.0 verificada el 2026-11-19**: carga, service worker con caché `el-metro-v2.0.0-b8f24800`, sin conexión, instalable, 0 errores de consola). APK: `/el-metro.apk` (versionCode 26, **6,7 MB**), igual byte a byte a la construida.

## Estado al 2026-11-19 · v1.5.0 "Preparando la revolución"
**Novedad de v1.5.0:** mientras Gemini y ChatGPT trabajan en el Plan único, El Metro ya juega con el mapa del motor único y deja listo el terreno para integrar lo que entreguen.
- **Mapa único:** el mapa base sale del Motor del Valle 1.0.0, el mismo de Juega EnCicla.
- **Carrera sin fin** (`src/js/47-carrera.js`, prototipo de la misión M4):
  - en patineta, por la calle real junto a la línea A, la B, el tranvía o el Metroplús;
  - en 3D (primera o tercera persona) con los edificios reales; si no hay WebGL, desde arriba;
  - tres carriles y saltos; se esquivan conos, perros, motos y chazas y se saltan huecos y charcos;
  - se recogen pasajes 🎫 y el dato de cada estación, y el ritmo acelera.
  - El bot de pruebas la juega.
  - Cuando lleguen el motor de Run Scooter y su arte, se cambian la pista, los obstáculos y el dibujo; el contrato de modos se queda igual.
- **Vehículos nuevos en Ciudad Libre** (terreno de la M5):
  - patineta eléctrica, monopatín eléctrico, skate y patines (se montan, con su tabla dibujada en 2D y en 3D);
  - carro particular y bus de ruta;
  - cada uno con su física (giro limitado por su agarre) y parqueados por el valle: patinetas en las estaciones, skates y patines en las plazas, buses de ruta en los barrios.
- **Trama en datos** (terreno de la M6): los personajes que lleguen en `src/data/guion.js` (`GUION.personajes`, con el formato de la sección 4b del Plan único) se suman solos a la gente de la ciudad. El archivo se compila solo si existe.
- **Arte pendiente:** el ícono de la carrera queda como encargo (Plan único, M4); mientras llega, el respaldo procedural.
- **Falla encontrada jugando y corregida:** la carrera usaba el nombre `hud` para su marcador, y el juego lo llama para la barra de arriba.

**Qué se probó:** autotest con 0 errores; 100 partidas del bot (329 mil pasos, con la carrera sin fin) con 0 errores y 0 errores de consola; carrera en 3D en las líneas A y B; patineta eléctrica en Ciudad Libre; recorrido de los nueve modos con capturas.

**Publicado:** https://juanfeliperico369-stack.github.io/MetroZero/ (**v1.5.0 verificada el 2026-11-19**: carga, service worker con caché `el-metro-v1.5.0-71a5b17e`, sin conexión, instalable, 0 errores de consola). APK: `/el-metro.apk` (versionCode 25, **6,6 MB**).

## 2026-11-19 · Mapa único y plan para Gemini y ChatGPT
- **Mapa único:** El Metro se une a la rama `motor-valle` y su mapa base (`src/data/valle.js`) sale ahora del **Motor del Valle 1.0.0**, el mismo de Juega EnCicla. El autotest da 0 errores.
  - El mapa solo se cambia en `motor-valle/` y se copia con `node motor-valle/sincronizar.mjs`.
- **Plan único** (`docs/PLAN-UNICO-IA.md`) para Gemini con Antigravity y ChatGPT con Codex:
  - misiones M1 a M6, que son las mismas en los dos trabajos (código y arte);
  - la sección 4 trae las peticiones para Juega EnCicla y la 4b, las de El Metro;
  - todo se entrega en un solo documento.
- **Lo que sigue:** con las dos entregas, la IA de El Metro revisa, prueba, integra y publica la revolución de El Metro.

## Estado al 2026-11-18 · v1.4.0 "La ciudad desde todos los ángulos"
**Novedad de v1.4.0:** Ciudad Libre se mira y se juega desde varios estilos de vista, y el mapa deja elegir dónde estar.
- **Mapa del valle** (como en Juega EnCicla): se toca el minimapa (o la tecla M) y se abre el mapa grande, con arrastre, pellizco y rueda.
  - Están las líneas, las estaciones, los lugares famosos y los personajes.
  - Tocar uno, o cualquier punto, ofrece «🚶 Ir aquí» (te lleva) o «📍 Marcar destino» (flecha y distancia).
  - Nuevo comienzo «🗺 Elegir en el mapa»: muestra todo el valle para escoger dónde empezar.
- **Vistas 3D en Ciudad Libre** (👁 cambia entre las cuatro):
  - desde arriba (la de siempre, con sus tres ángulos);
  - tercera persona, detrás de ti, con el joystick relativo a la cámara (arriba es hacia donde mira);
  - dron: alto y lejos, gira despacio cuando estás quieto, para contemplar;
  - cine: una cámara a la altura de un poste, en la calle, que te ve pasar.
  - En 3D, un dedo gira la cámara y dos acercan o alejan.
  - Necesitan «Calidad gráfica: Normal»; en «Celular modesto» se queda la vista desde arriba.
- **El 3D con la ciudad real** (`src/js/22-gl.js`):
  - a 700 m alrededor, las casas y los edificios reales son cajas orientadas con su altura y los colores de su zona;
  - las piezas de arquitectura van con su planta real y los puentes con su tablero;
  - el piso es el de calles de la ciudad vectorial (`VC.piso3D`), con mipmaps y filtro anisótropo;
  - se ven el tráfico, la gente, los personajes, los vehículos parqueados y los trenes, cables y buses de la ciudad en su sitio, además de ti (con tu ropa) y un rombo naranja encima.
  - Antes, la vista 3D del bus y del metro usaba bloques de 20 m sacados de las casillas.
- **Tu personaje se ve más:**
  - en pantalla nunca queda más chico de lo legible;
  - lleva un disco naranja bajo los pies, un anillo con flecha de rumbo y su silueta encima de todo, aunque un edificio lo tape.
- **Lo aprendido en 3D:**
  - en muchos celulares el sombreador de fragmentos solo maneja números hasta ~16.000 y con precisión de 16 m, y el valle pasa de 27.000 m;
  - por eso las coordenadas de la textura, el hueco del piso lejano y el dibujo de ventanas y luces se calculan en el sombreador de vértices;
  - el piso lejano se arma con hueco y lo pegado al piso (andenes, plazas) va un poco delante.

**Qué se probó:** `node tools/test.mjs 100` → autotest con 0 errores y 2 avisos (las terminales Caribe y La Palma de la Línea O); 100 partidas del bot (365 mil pasos) con 0 errores y 0 errores de consola. Capturas de las tres vistas 3D en el Parque Berrío, Santo Domingo, El Poblado y Estadio (a pie y en taxi), del mapa (elegir dónde empezar, tocar una estación, ir allá) y del personaje con su anillo.

**Publicado:** https://juanfeliperico369-stack.github.io/MetroZero/ (**v1.4.0 verificada el 2026-11-18**: carga, service worker con caché `el-metro-v1.4.0-993beff4`, sin conexión, instalable, 0 errores de consola). APK: `/el-metro.apk` (versionCode 24, **6,6 MB**).

### v1.3.0 "La ciudad con altura y con gente"
**Novedad de v1.3.0:** el mundo tiene **niveles**, el manejo tiene **peso**, la ciudad tiene **gente con historias** y la cámara se mueve a voluntad. Es un juego para contemplar la ciudad y moverse en ella, para turistas (que la conocen) y para la gente de acá (que se reconoce en ella).
- **Puentes y niveles** (`src/js/11-puentes.js`, `src/data/puentes.js`, `tools/puentes_datos.py`):
  - 2.150 puentes reales del valle (1.436 vehiculares y 714 peatonales), de OpenStreetMap vía Overture Maps (bandera `is_bridge` y nivel); 1.002 calles del juego pasan por uno. Tablero con rampas, pilas, canto, barandas y sombra.
  - Al puente se sube por sus rampas; por la mitad se pasa por debajo, entre las pilas; arriba, la baranda no deja caer. Los carros del tráfico suben a los puentes de su carril.
  - El viaducto del metro va por encima: el jugador pasa por debajo y se ve su silueta a través del tablero. Las columnas (cada 30 m) y los accesos de cada estación son sólidos, pero no tapan la calle: en el Centro, sobre Bolívar, la calle sigue por debajo de la estación (el acceso solo toca alrededor del 5 % de la calle de abajo, en el borde del andén).
  - Las pilas de puente no caen en una calle, en el carril del Metroplús ni en el tranvía.
- **Metroplús sobre sus andenes:** las líneas 1 y 2 van por sus relaciones de ruta de OpenStreetMap (5458501, 5393696, 5401998, 5401999) y cada estación está en el centro de su andén real (`src/data/metroplus_andenes.js`, `tools/metroplus_andenes.py`). La Línea O va por las calles dibujadas. Las 53 estaciones quedan fuera de los edificios; las terminales Caribe (273 m) y La Palma (53 m) de la Línea O siguen lejos de su andén real.
- **Buses y trenes que toman bien las curvas:** el articulado de Metroplús va en dos cuerpos con fuelle y el de atrás sigue al de adelante por la rótula (también el que manejas tú); cada vagón del metro y del tranvía y cada alimentador se apoya en sus dos ejes sobre la vía; las esquinas de las rutas de bus tienen radio de giro (11 m el alimentador, 14 m el articulado).
- **Manejo con peso y más centrado** (todos los vehículos de Ciudad Libre):
  - «Fácil» (de fábrica): el joystick apunta hacia donde quieres ir y el vehículo gira hacia allá con su radio de giro; si apuntas casi a lo largo de la calle, sigue la calle. «Clásico»: los lados giran y arriba acelera, con zona muerta y curva fina cerca del centro.
  - El ángulo de las ruedas se limita por la aceleración lateral que aguanta cada vehículo (taxi 8,5 m/s², moto 9,5, bici 5,5, articulado 3,8): antes, a 70 km/h, el taxi giraba con unos 6 g; ahora con menos de 1 g. El volante vuelve solo al centro y el acelerador entra en unos 0,3 s.
  - Asistencia al volante: sin girar, el vehículo se endereza con la calle. Se apaga en 🆘.
  - A pie se arranca y se para con un poco de inercia.
- **Ritmo ⏩ siempre a mano:** ×1, ×1,5 o ×2 a pie y manejando; en metro, cable, tranvía o bus, ×1, ×3 o ×6. Además el juego ya no se pone en cámara lenta cuando el celular da menos de 20 cuadros por segundo (el tiempo real se reparte en pasos de 1/30 s).
- **🆘 Ayuda y rescate:** ir a la estación más cercana, salir a la calle más cercana (con tu vehículo), pedir un taxi o volver a donde empezaste. Si llevas rato lejos de toda calle o empujando sin moverte, el juego te lo ofrece. Al bajarte en una estación quedas en la calle o el andén más cercano, no en el monte (Arví y los cables de las lomas).
- **Tu personaje** (como en Juega EnCicla): piel, peinado, color de pelo, camiseta, pantalón, zapatos, gorro (gorra, sombrero aguadeño, casco de bici, gorro de lana) y accesorio (mochila, carriel, ruana o cámara de turista). Se elige en 🆘 → Mi personaje y se ve en el juego (piernas y zapatos al caminar) y en tu retrato.
- **Gente de la ciudad** (`src/js/39-gente.js`): 20 personajes con nombre y oficio en su lugar real (Doña Rocío en la Plaza Botero, Don Abelardo lustrabotas en el Parque Berrío, Don Otoniel silletero en Arví, Jhon en las escaleras de la Comuna 13, Patricia de Cultura Metro en Acevedo…). Cada uno cuenta «lo que todos saben» y «lo que pocos saben» de su sitio; conocerlos da 🎫 y se lleva la cuenta. Los turistas piden que los acompañes a pie a un lugar famoso cercano (+5 🎫).
- **📍 Qué hay cerca:** los lugares famosos, las estaciones y los personajes más cercanos, con su dato; tocar uno lo vuelve destino (flecha y distancia).
- **Cámara a voluntad:** en Ciudad Libre, 🎥 suelta la cámara (arrastrar), dos dedos o la rueda acercan y alejan, y 📐 cambia el ángulo (clásica, más inclinada o casi cenital; también en Ajustes). En Bus, Al volante y Metro, las vistas desde arriba tienen + y −, pellizco, 📐 y 🎥.
- **Rendimiento:**
  - un trozo de 640 m de lejos (al alejar la cámara) se arma con las huellas leídas del binario, sin armar la región entera: de ~135 ms (con la región ya armada) o varios cientos en frío a 10–25 ms en casi todo el valle (65–130 ms en Popular, la zona más densa);
  - calidad automática: si los cuadros pasan de ~34 ms se baja la densidad de píxeles del lienzo (de 2 hasta 1) y se vuelve a subir cuando sobra;
  - manejando un taxi, el cuadro tarda en JavaScript y dibujo 4–6 ms la mitad de las veces y menos de 17 ms el 99 % en Santo Domingo (medido con el dibujo por software; ver «Reglas aprendidas» de la skill de desarrollo).
- **Autotest nuevo:** puentes, rampas, paso por debajo, baranda, columnas y accesos del metro, calle libre bajo las estaciones, estaciones de Metroplús, ángulos de cámara, giro de cada vehículo, ritmo, esquinas de bus, personajes y su lugar.

**Qué se probó:** `node tools/test.mjs 100` → autotest con 0 errores y 2 avisos (las terminales Caribe y La Palma de la Línea O, lejos de su andén real); 100 partidas del bot (368 mil pasos) con 0 errores y 0 errores de consola. Partidas a mano con capturas: charla con Don Abelardo, ficha del personaje, ayuda con taxi, guía y destino, manejo fácil, articulado y tren en sus curvas más cerradas, y la cámara en Bus, Al volante y Metro.

**Publicado:** https://juanfeliperico369-stack.github.io/MetroZero/ (**v1.3.0 verificada el 2026-11-18**: carga, service worker con caché `el-metro-v1.3.0-409eac0a`, sin conexión, instalable, 0 errores de consola). APK: `/el-metro.apk` (versionCode 23, **6,6 MB**).

### v1.2.0 "Medellín tal cual"
**Novedad de v1.2.0:** se investigó a Medellín desde el aire: fotos aéreas, desde el avión, el metrocable, drones y satélite, todas con licencia libre y sin imágenes de Google. Con eso la ciudad se dibuja con sus **casas y edificios reales**:
- **Casas y edificios:** 639.457 en todo el valle, de Caldas a Barbosa, con su huella real (posición, forma y orientación).
  - Datos: `src/data/edificios.js`, generado por `tools/edificios_datos.py`, de Overture Maps (OpenStreetMap, Microsoft ML Buildings y Google Open Buildings).
  - Van por región de 640 m y se leen solo cuando hacen falta. La generación a lo largo de las calles queda de respaldo.
- **Pisos:**
  - 7.779 oficiales, del Catastro de Medellín (capa `3DConstruccciones` de Popular, El Poblado y Robledo);
  - 5.028 de OpenStreetMap (Coltejer 38, Edificio del Café 36, Torre Institucional de la Alcaldía 24…);
  - el resto, estimados por zona y tamaño con lo medido en esas tres comunas.
- **Usos:** casa, bloque, torre, bodega, colegio o universidad, hospital, iglesia con campanario, cívico, comercio, coliseo, cubierta abierta, invernadero y tanque redondo.
- **Materiales y techos por zona**, como se ven desde el aire (`src/js/11-edificios.js`):
  - laderas de ladrillo a la vista, con fibrocemento, zinc oxidado y planchas con tanque negro o azul;
  - barrios planos de teja de barro: desde el avión son un tapete terracota;
  - El Poblado, de torres de ladrillo entre el bosque, con piscinas y helipuertos en algunas azoteas;
  - el Centro, ocre y de ladrillo;
  - los pueblos, blancos con teja.
  - Detalles: teja a dos aguas con cumbrera y hastiales, láminas con canales, y ventanas y puerta por piso.
- **Suelos:** 56 campus universitarios con su prado, sus árboles y su rótulo; 1.368 canchas (de fútbol con sus líneas y placas polideportivas de colores); 37 pistas atléticas y 885 piscinas. Más árboles en patios y antejardines de Laureles y El Poblado.
- **La Alpujarra tal cual:** la Alcaldía, la Gobernación y el Palacio de Justicia van con fachada inclinada, parteluces blancos, ventanas oscuras y culatas macizas (estilo `alpujarra`).
- **La calle siempre libre:** huellas y vías vienen de fuentes distintas y se corren 1–2 m.
  - Por eso cada edificio se recorta contra el asfalto con medio andén, las peatonales, las escaleras, el carril del Metroplús y el tranvía.
  - Sin recorte, del 7 al 29 % de los bordes de carril quedaban dentro de una casa y el taxi se trababa. Ahora quedan del 0 al 0,05 %, como en 1.1.1.
- **Investigación:** `docs/investigacion/medellin-desde-el-aire.md` reúne lo que se ve en cada zona, cómo se volvió regla y los créditos de cada foto.
- **Autotest nuevo:** revisa que carguen más de 600.000 edificios reales, que más del 99 % de los bordes de carril quede libre, que haya torres en El Poblado, edificios educativos en la UdeA, campus y canchas.
- **Rendimiento:**
  - una región de 640 m se arma en 10 a 60 ms (60 ms en Popular, la más densa);
  - un trozo cercano, en 1 a 18 ms;
  - un trozo de 640 m de lejos, en la zona más densa, en unos 140 ms, con árboles y casas de lejos en lote;
  - manejando, los cuadros tardan en JavaScript lo mismo que en 1.1.1.
- **Peso:** el HTML pasa de 3,6 a 8,1 MB; 4,5 MB son las casas y los edificios.

Herramienta nueva: `tools/edificios_datos.py` (cómo regenerar en `docs/FUENTES.md`).

**Qué se probó:** `node tools/test.mjs 100` → autotest con 0 errores y 0 avisos (639.457 casas y edificios reales, calles libres, torres en El Poblado, la UdeA, campus y canchas); 100 partidas del bot (367 mil pasos) con 0 errores y 0 errores de consola. Capturas por lugar (La Alpujarra, la UdeA, la Nacional, EAFIT, la UPB, Popular, Santo Domingo, Laureles, El Poblado, el Centro, Guayabal, la Comuna 13 y la noche) comparadas con las fotos. Con un taxi en Santo Domingo y en Laureles se llega a 30 km/h, como en 1.1.1.

**Publicado:** https://juanfeliperico369-stack.github.io/MetroZero/ (**v1.2.0 verificada el 2026-11-18**: carga, service worker con caché `el-metro-v1.2.0-6f9df48f`, sin conexión, instalable, 0 errores de consola). APK: `/el-metro.apk` (versionCode 22, **6,6 MB**).

### v1.1.1 "Ciudad con curvas" (retoque)
**Novedad de v1.1.1:** los tres Metroplús (líneas 1, 2 y O) van por su **corredor real**, el de su carril exclusivo (`src/data/metroplus.js`, de Juega EnCicla 1.3.1), y no por la ruta más corta entre calles, que se desviaba hasta 1 km y daba vueltas en glorietas. El carril queda libre de edificios en la ciudad vectorial y se dibuja como carril de bus (asfalto, franja del color de la línea y raya blanca). El autotest revisa que ningún punto del carril quede dentro de un edificio o del agua y que los alimentadores no salgan de las calles. Debajo sigue vigente lo de v1.1.0.

**Qué se probó:** autotest con 0 errores y 0 avisos; 100 partidas del bot (364 mil pasos) con 0 errores y 0 errores de consola.

**Publicado:** https://juanfeliperico369-stack.github.io/MetroZero/ (**v1.1.1 verificada el 2026-11-18**: carga, service worker con caché `el-metro-v1.1.1-38220983`, sin conexión, instalable, 0 errores de consola). APK: `/el-metro.apk` (versionCode 21, **3,3 MB**).

### v1.1.0 "Ciudad con curvas"
**Novedad de v1.1.0** (une la línea de 1.0.0 de la otra IA con v0.10.0 y redibuja la ciudad):
- **Mapa base de 1.0.0:** manzanas oficiales, huellas, pisos y barrios en todo el valle (formato v3: `ba`, `hg`, `lt`), con `CIUDAD` y `RUTAS` de 1.0.0 y lo de v0.10.0 encima (EnCicla, calendario, ajustes, accesibilidad).
- **Motor de ciudad vectorial** (`src/js/11-ciudad2.js`, `VC`): reemplaza el dibujo por casillas en todas las vistas cenitales.
  - Calles de `src/data/vias.js` (26.919 vías de Juega EnCicla 1.3.1) con su curva, su ancho, andén, sardinel, carriles y cebras.
  - Suelo sin escalones: contornos de cuadrados marchantes difuminados (parques y lago con esquinas redondas).
  - Casas y edificios generados a lo largo de cada calle, girados con ella, sin tocar vías ni andenes; volumen al estilo de las ciudades cenitales (techo desplazado, fachadas con ventanas, sombra y contorno).
  - Cuatro niveles de detalle (80 m a 4 px/m … 2,5 km a 0,2 px/m), presupuesto de 12 ms por cuadro, trozos por adelantado hacia donde va la cámara y 1 px de margen por trozo (sin costuras).
- **Rieles que concuerdan:** eje real de A, B y T entre los dos rieles de OpenStreetMap (`src/data/rieles.js`; giro máximo 6°). Cada estación queda sobre su línea y su andén sigue la vía; la B termina al borde del viaducto de la A.
- **Buses por las calles:** Metroplús y alimentadores rehechos sobre la red vectorial pasando por cada parada (`src/data/rutas_calles.js`).
- **Física libre:** a pie y en vehículo solo frenan los edificios dibujados y el agua; fuera del asfalto hay más roce. La gente camina por los andenes; carros, bicis y anclajes se acomodan fuera de los edificios al acercarse. Cámara alineada al píxel.
- **Arquitectura icónica** (`src/js/11-hitos.js`, `src/data/hitos.js`): 30 edificios y plazas con su huella real de OpenStreetMap y un dibujo propio: la aguja del Coltejer, las torres y la cúpula de la Basílica, el Palacio de la Cultura en franjas, las graderías y la cancha del Atanasio, las tres rocas de la Biblioteca España, el vidrio del Edificio EPM, las cajas rojas de Explora, la cúpula del Planetario, La Alpujarra, los postes del Parque de las Luces (se encienden de noche) y las esculturas de la Plaza Botero. Nada genérico se monta encima y se choca contra ellos.
- **Metro elevado:** el tablero va a 7 m con columnas cada 30 m y su sombra en el piso; los andenes llevan cubierta metálica con el color de la línea y cada estación su edificio de acceso abajo. Los cables del Metrocable van a 14 m con sus torres.
- **Rótulos y postes** sobre las calles dibujadas; el letrero toma el nombre de la vía cuando la capa oficial no lo trae.
- **Autotest nuevo:** vías cargadas, edificios fuera del asfalto, andenes sobre su línea, vías sin quiebres y buses sobre las calles.

Herramientas nuevas: `tools/vias_datos.mjs`, `tools/rieles_datos.mjs`, `tools/rutas_calles.mjs` y `tools/hitos_datos.py` (cómo regenerar en `docs/FUENTES.md`).

**Qué se probó:** `node tools/test.mjs 100` → autotest con 0 errores y 0 avisos (26.919 vías, 30 piezas de arquitectura, andenes sobre su línea, sin quiebres, buses sobre las calles), 100 partidas del bot (368 mil pasos) con 0 errores y 0 errores de consola. Cuadros de 2–7 ms de JavaScript caminando y manejando; un trozo cercano se arma en 10–20 ms (las regiones de 640 m en 10–25 ms, por adelantado).

**Publicado:** https://juanfeliperico369-stack.github.io/MetroZero/ (**v1.1.0 verificada el 2026-11-18**: carga, service worker con caché `el-metro-v1.1.0-d0a6e2db`, sin conexión, instalable, 0 errores de consola). APK: `/el-metro.apk` (versionCode 20, **3,4 MB**).

**Qué falta:** el Orquideorama y otros edificios que OpenStreetMap no tiene como huella; alturas por edificio con el catastro; afinar el recorrido de los Metroplús donde su carril exclusivo no está en las vías vectoriales.

### v0.10.0 "Valle completo y EnCicla"
**Novedad de v0.10.0:**
- **El mapa, medido y corregido:**
  - las 49 estaciones tienen huella y techo;
  - el río es continuo y siempre baja;
  - el tranvía va por su calle;
  - aparece el patio‑taller de Bello;
  - hay barrios y nombres de calle en todo el valle.
- **El calendario es real:** festivos de Colombia, y el Metro de 5 a. m. a 10 p. m. los domingos y festivos.
- **Primer cruce con Juega EnCicla:** sus 133 estaciones en Ciudad Libre, con préstamo, timbre y logros.

Debajo sigue vigente lo de v0.9.0.

### v0.9.0 "Maqueta y álbum"
**Novedad de v0.9.0:** la **Maqueta 2:1** (el valle real en 3D isométrico, dentro de La Red) y el **Álbum de postales** (48 postales: los lugares reales con su vista aérea y 5 especiales con ilustración), más el cartel de la fiesta del día. Debajo sigue vigente lo de v0.8.0.

### v0.8.0 "Identidad del Metro"
**Novedad de v0.8.0:** interfaz nueva con los colores de las líneas; el inicio es un diagrama de línea (cada opción es una estación y un tren viaja a la que se toca); sin la estética de revista ni sus notas; seguridad revisada (red local, importación de partidas, CSP); código del juego sin comentarios en la versión publicada y sin menciones de herramientas de IA. Debajo sigue vigente lo de v0.7.0.

### v0.7.0 "Medellín reconocible"
**Novedad de v0.7.0:** el mapa se corrige y se nombra con **datos abiertos oficiales** (`src/data/ciudad.js`, de `tools/ciudad_datos.py`):
- **90 mil casillas corregidas:** las "andén" que en realidad eran lotes dentro de manzanas ahora son casas o edificios; parques y plazas reales;
- **502 barrios** (Medellín, Itagüí, Envigado y Sabaneta) y **2.438 nombres de calle** (nomenclatura oficial y nombres populares);
- **lotes catastrales** para dividir las casas;
- rótulos en el mapa, barrio en el HUD y un letrero al entrar a otra calle o barrio;
- casas con la fachada hacia su calle, andenes con bordillo y plazas y peatonales rediseñadas.

v0.6.0 trajo el arte de Gemini y ChatGPT y el primer rediseño del mapa. El HTML pesa ~2,7 MB.

### Estado anterior · v0.5.0 "La historia en la ciudad"
**Qué es:** un videojuego offline (un solo `index.html`, ~1,8 MB) sobre el Metro de Medellín y el Valle de Aburrá, construido sobre el **mapa real** (casillas de 20 m, OSM + relieve SRTM, tomado de "Juega EnCicla"). Un único mundo con módulos de simulación, no minijuegos:

| Módulo | Archivo | Qué hace |
|---|---|---|
| Ciudad Libre | `36-libre.js` + `35-ciudad.js` | Mundo abierto cenital estilo GTA 1/2: a pie, bici, moto, taxi, camioneta; abordar metro/tranvía/cables/buses reales; oficios por radio; Cívica al abordar. |
| Bus (Metroplús y alimentadores) | `38-bus.js` | Simulador cenital de estación a estación por calles reales: pasajeros que esperan y suben validando la Cívica (bip; a veces sin saldo y recargan), puertas, semáforos, tráfico, horario, confort, asistente de carril. 35 rutas (MP1, MP2, O y 15 alimentadores). |
| Metro | `30-conduce.js` + `31-cabina.js` + `23-lado.js` | Metro y tranvía en vista panorámica 2D (relieve real en capas, laderas con barrios que se encienden de noche, calle con carros y gente bajo el viaducto, estaciones con techo) y cabina 1ª persona con **procedimiento real**: llave, selector de sentido, señal de salida, vigilante (hombre muerto), puertas por lado del andén, anuncio, botonera iluminada y **Escuela de conducción** (9 pasos). También 3ª persona/cine (WebGL). |
| Metrocable | `52-cableviaje.js` | Opera la línea: viento, péndulo de la cabina, tormentas, fotos en miradores; vista lateral o 3D. |
| Guía | `67-guia.js` | Aprende a usar el Metro: Cívica, cómo viajar, líneas, Cultura Metro, datos. |
| Historia en la ciudad | `37-trama.js` (+ ganchos en `36-libre.js`) | "La última vuelta" jugada en el mapa: 8 capítulos con pasos (hablar, ir, abordar una línea, bajarse en una estación, postal, orientar pasajeros, manejar) sobre la red real: Niquía → Madera (escuela) → metro a Acevedo → cable K a Santo Domingo → alimentador C6‑001 a Santa Rita → metro a Hospital → Metroplús a Parque Aranjuez → tranvía en San Antonio → hora pico (orientar) → Niquía → La Estrella. Personajes con nombre en el mapa, diálogos con voz opcional, título de capítulo, ⏩ para adelantar viajes. Al terminar cada módulo se vuelve a la ciudad en la estación de llegada. Progreso en `Save.d.trama`. |
| Historia clásica | `70-historia.js` | Los 11 capítulos con escenas pixeladas que llevan a cada módulo (siguen disponibles en el menú Historia). |
| La Red / Juntos / Arcade | `60-mapa.js`, `80-multi.js`, `40/45/50-*.js`, `32-volante.js` | Mapa‑gerencia; multijugador local (duelo, QR Wi‑Fi, servidor `server.mjs`); los puzles antiguos quedaron como "Arcade". |

**Mundo vivo:** `18-mundo.js` (reloj ×30/real/día/noche, clima por temporada y hora con semilla del día, fechas: aniversario 30/11, Alumbrados, Velitas, Novena, Navidad, Año Nuevo, Feria de las Flores, Silleteros, 20 de julio, 7 de agosto, Antioqueñidad, Amor y Amistad, Halloween, Madre, Semana Santa). `35-ciudad.js`: transporte real en movimiento con paradas, peatones con rumbo/paraguas/miedo/conversación, gente esperando el bus, vendedores ambulantes, tráfico en carriles reales con semáforos de 32 s, sombras por sol, faros, postes, ventanas encendidas.

**Arte:** `10-map.js` casillas de 16 px dibujadas por **manzanas/lotes** (tejados unidos por lote con tanques, aires, paneles, terrazas verdes; fachada sur con ventanas y toldos; sombras en capa aparte; barrios de ladrillo con 2–3 casas por casilla y techos de teja/plancha/eternit, ropa tendida; carros parqueados, árboles y bancas en andenes; avenidas con carriles, línea amarilla en calles locales y cebras solo en cruces reales), viaductos con rieles, andenes, torres de cable; `21-sprites.js` sprites cenitales con detalle (metro por carros con cabina, articulado con fuelle, alimentador, taxi con aviso, carros, motos, cabinas, peatones con cabeza/brazos/paraguas, carrito de vendedor); `22-gl.js` 3D low‑poly propio (WebGL 1; viaducto de concreto con balasto, rieles de acero y pretiles; sin edificios encima de la vía); `23-lado.js` panorámica por capas (cordillera y laderas con barrios de ladrillo y monte por ruido suave, en tira cacheada; luces de ventanas de noche; fachadas y árboles de primer plano anclados al mundo).

**Datos:** `src/data/red.js` (31 líneas, 222 paradas, 97 datos de línea, 58 de estación, 38 trivias; fuentes en `docs/FUENTES.md`), `rutas.js` (recorridos de bus por calles reales, A*), `lugares.js` (45 lugares reales con postal), `valle.js` (mapa).

**Pruebas:** `node tools/test.mjs 100` → selfTest (datos, solubilidad, rutas) + partidas automáticas en todos los modos + recorrido de pantallas. Última corrida: ver Historial v0.4.0. El bot también vive en el menú (🤖).

**Publicado:** https://juanfeliperico369-stack.github.io/MetroZero/ (rama `gh-pages`; **v0.10.0 verificada el 2026-11-17**: carga con la CSP activa, service worker con caché `el-metro-v0.10.0-99755ed9`, sin conexión, instalable, 0 errores de consola). APK: `/el-metro.apk` (versionCode 10, **2,0 MB**).

## Carpeta de arte (`arte/`, 2026-11-17)
Investigación visual y guía de producción para el arte definitivo:
- biblia de estilo, 32 referencias de juegos analizadas (incluye los 4 reels del autor), identidad visual de Medellín y su transporte, historia del Metro y de la ciudad con fuentes, folclor y calendario de fiestas, y diseño de mundo abierto + arcade;
- **guía única de prompts** (`06-guia-unica-ia.md`) para **dos IA**: Gemini Nano Banana (encargos G‑) y ChatGPT (encargos C‑). Midjourney salió del plan: sus panorámicas, ambientes de fiesta y conceptos pasaron a Gemini, y las texturas y la portada sin título a ChatGPT. La guía trae **misión, visión, estado**, la dirección de arte y **la bitácora completa como Anexo A** (sincronizada por `tools/arte.mjs`, que también genera `arte/CONTEXTO-IA.md` para subir como conocimiento a un Gem de Gemini o a un Proyecto de ChatGPT);
- **Protocolo para toda IA** (`arte/PROTOCOLO-IA.md`, fuente única), en 7 pasos:
  1. leer TODO;
  2. reflexionar;
  3. responder el cuestionario de comprensión;
  4. probar en pequeño;
  5. auto‑ajustarse guardando “Reglas aprendidas” en sus propias instrucciones;
  6. hacer solo su parte con precisión;
  7. entregar y registrar.

  Va al inicio de la guía única (sincronizado), en el Bloque 1 (00), en los roles (el cuestionario es obligatorio antes del primer encargo), en `CONTEXTO-IA.md` y en `AGENTS.md`, `CLAUDE.md` y `GEMINI.md` (raíz, generados), que los agentes de código leen solos.
- **Documento único compilado** `dist/EL-METRO-TODO.md` (~950 KB): protocolo, léeme, guía, skills, plan, bitácora, toda la investigación de arte, galería y el **código fuente completo** del juego (60 archivos). El mapa binario `valle.js` solo va descrito. Lo genera `node tools/todo.mjs`.
- **Archivo único** `node tools/todo.mjs` → `dist/El-Metro-TODO.html` (~1,6 MB):
  - incluye el **juego jugable comprimido adentro** (▶ Jugar), la guía única, las skills, el plan, la bitácora, toda la carpeta de arte y la galería;
  - desde ahí se descargan `TODO.md` (todo el texto para IA), `CONTEXTO-IA.md`, `SKILLS-IA.md` y el juego suelto;
  - plantilla en `tools/todo-plantilla.html`; publicado en la raíz de GitHub Pages.
- **Skills del proyecto** (formato abierto Agent Skills, `SKILL.md`) en `.agents/skills/`, que leen Codex y Antigravity; `tools/skills.mjs` las copia a `.claude/skills/` para Claude Code y arma `arte/SKILLS-IA.md` para los Gems y Proyectos.
  - Tres propias: `el-metro-desarrollo` (código, pruebas y publicación), `el-metro-arte` (dirección de arte, encargos e integración) y `medellin-fiel` (relieve, estructuras e isométrica 2:1).
  - Tres oficiales de [anthropics/skills](https://github.com/anthropics/skills) (Apache‑2.0, commit `e4bb5d9`): `frontend-design`, `webapp-testing` y `skill-creator`.
  - Plugins de Claude recomendados: image-generation, playwright, Android Emulator QA y Unity (opcional).
  - La guía única las incluye (Bloque 6 y sección 13 del contexto).
- **Fase 1b del plan · Medellín fiel e isométrica:** relieve de 30 m, alturas de edificios por casilla, viaducto, estaciones y cables medidos, vista dimétrica 2:1 procedural y repintado con IA (G‑100) de zonas héroe. Referencias: Isometric NYC, Tiny Barcelona, Madrid, València y Málaga, CDMX, Buenos Aires, isometriccities.com y tinyworlds (detalle en `docs/PLAN.md`);
- 71 fotos de referencia con licencia libre, enlazadas desde Openverse con autor y licencia (`galeria.md`/`galeria.json`). Las descargas directas desde Wikimedia y Flickr están bloqueadas en la nube;
- `node tools/arte.mjs` genera `arte/index.html`: una página con todo, botones de copiar en los prompts, muestras de color y galería. Publicada en `/arte/` de GitHub Pages.

**Siguiente paso:** cuando el autor traiga el arte (estructura en `arte/08-entregas-e-integracion.md`), limpiar el magenta, cuantizar a la paleta, armar atlas y conectarlos en `10-map.js`, `21-sprites.js`, `23-lado.js`, `31-cabina.js` y `37-trama.js`, siempre con respaldo procedural.

## Historial
### v0.10.0 (2026-11-17) — valle completo, calendario real y cruce con EnCicla
Pedido del autor: “haz lo que puedas, mejóralo todo” (sobre la auditoría), y “audita Juega EnCicla, toma fragmentos, los huevos de pascua y las mejoras, y prepara la próxima revolución”.
1. **Mapa (hoja de ruta M1–M6 de la auditoría, todo medido con `tools/auditoria-mapa.mjs`):**
   - **Ajustes del mapa base** en `src/data/ajustes.js` (171 KB), generados por `tools/mapa_ajustes.mjs` y aplicados al cargar (`MAP.ajustes`):
     - 86.642 casillas de vía ganan nombre de calle y 205 barrios aproximados llenan los municipios sin capa oficial, con datos de Juega EnCicla v1.2 (OpenStreetMap vía Overture).
     - **Casas con barrio:** Bello pasa de 1 a 59 %, Girardota de 0 a 99 %, Barbosa de 0 a 98 % y Caldas y La Estrella de 0 y 4 a 83 %.
     - **Vías con nombre:** Medellín pasa de 63 a 80 %, Itagüí de 18 a 78 % y Bello de 11 a 45 %.
     - **Río:** 88 puentes donde una vía cortaba el cauce (69 cortes → 0) y 1.339 esquinas del relieve quemadas con regresión isotónica (37 tramos que subían → 0).
     - 69 casillas de casa pasan a calle bajo el tranvía de Ayacucho (24 % del trazo sobre casas → 0 %).
     - Se quitan las 32 escaleras sueltas que no conectaban con nada.
     - **Patio‑taller del Metro en Bello** con balasto y vías, y talleres del antiguo Ferrocarril de Antioquia, ambos de OpenStreetMap.
   - **Huellas de estación (`MAP.estaciones`):** andén techado orientado con la línea y la franja del color de cada línea.
     - Medidas: metro 140 × 36 m, tranvía 44 × 16 m, cable 60 × 40 m.
     - Las 49 estaciones tienen techo; ninguna queda sobre una casa.
   - **Rótulos:**
     - un nombre extra no repite el oficial del mismo trozo;
     - patio y talleres van con ■ en azul.
2. **Arreglos rápidos de la auditoría:**
   - **Memoria:** la capa de luces de cada trozo se crea solo de noche, y la caché depende de la memoria del equipo (16, 28 o 40 trozos).
   - **Sin tirón al arrancar:** cada cuadro construye trozos por 10 ms como máximo (mínimo uno); el resto se pinta liso un instante.
   - **Resultado:** con 0 estrellas dice “Llegaste, sin estrellas” y da un consejo.
   - **Accesibilidad:** nombres para los botones de íconos, botones de 44 px, letra de 12 px y avisos en `aria-live`.
   - **Seguridad:** el código de invitación se descomprime con tope de 64 KB.
3. **Calendario real, de Juega EnCicla:**
   - `festivo()` cubre los festivos de Colombia (Ley Emiliani y Semana Santa).
   - **Horario del Metro corregido:** antes abría a las 7 los domingos y no conocía los festivos. Ahora va de lunes a sábado de 4:30 a. m. a 11 p. m., y los domingos y festivos de 5 a. m. a 10 p. m.
   - **Fechas:** Feria de las Flores (10 días desde el primer viernes de agosto), Fiesta del Libro, Día del Niño, Día del Padre y ciclovía.
4. **EnCicla en Ciudad Libre** (`src/data/encicla.js`, 133 estaciones, de `tools/encicla_datos.mjs`):
   - **Anclajes:** azules con postes verdes y bicis.
   - **Préstamo:** con el horario de EnCicla y 60 minutos de juego; se devuelve en cualquier anclaje.
   - **Frases:** al prestar habla un personaje de EnCicla; al devolver lejos se oye “Nadie aplaude al anfitrión, pero todos llegan.”
   - **Logros nuevos:** *Metro + bici* y *Ciclista secreto* (tres timbrazos debajo de una estación del metro, el espejo del Maquinista secreto de EnCicla).
   - **Postal** “Metro + EnCicla” y enlace al juego hermano en los créditos.
   - Las medallas 21 y 22 quedan encargadas a ChatGPT (C‑12). Mientras llegan, la libreta usa emoji.
5. **Documentos:**
   - auditoría de Juega EnCicla con ideas para su IA: `docs/auditorias/2026-11-17-auditoria-encicla-v1.2.md`;
   - plan de la próxima revolución: `docs/REVOLUCION.md`;
   - actualización de la auditoría del mapa.
6. **Pruebas:**
   - el autotest suma el calendario (festivos de 2026 y horarios del Metro y de EnCicla), los ajustes del mapa (barrio en Bello, nombres nuevos, 49 huellas) y los anclajes de EnCicla;
   - 100 partidas, 0 errores.
7. **Reglas aprendidas:**
   - los dos juegos comparten cuadrícula y relieve: cualquier corrección del mapa se mide una vez y sirve dos veces;
   - el arte de logros nuevos se encarga a ChatGPT; el código solo pone el respaldo.

### Auditoría de v0.9.0 (2026-11-17) — juego y mapa medidos
Pedido del autor: “audita el videojuego, dame ideas y sugerencias y, en especial, analiza el mapa para seguirlo mejorando después”. No cambia el juego.
1. **Informe:** `docs/auditorias/2026-11-17-auditoria-juego-y-mapa.md`. Trae rendimiento, balance, código, seguridad, accesibilidad, el mapa a fondo con cuatro láminas, la hoja de ruta del mapa (M1–M12, cada paso con su meta medible) y 14 ideas.
2. **Herramienta nueva, `tools/auditoria-mapa.mjs`:** mide el mapa con el propio juego y dibuja las láminas. Sus cifras son los criterios de aceptación de cada mejora del mapa.
3. **Hallazgos principales:**
   - **Memoria:** la caché del mapa puede ocupar ~80 MB de imagen (40 trozos × 2 lienzos de 512²).
   - **Rendimiento:** la panorámica lateral satura el hilo principal, y Ciudad Libre y el bus se congelan 0,2–0,3 s al arrancar.
   - **Resultado incoherente:** el viaje en Metrocable se “gana” con puntaje negativo y dice “¡Bien hecho!”.
   - **Accesibilidad:** el botón 🏃 de Ciudad Libre no tiene nombre y no hay región `aria-live`.
   - **Seguridad:** las invitaciones se descomprimen sin tope.
   - **Mapa:**
     - las 49 estaciones no tienen huella y dos caen sobre edificios;
     - el río se corta 69 veces y sube en 37 tramos (hasta 27 m en Copacabana);
     - las quebradas ocupan 29,4 km², con 2.266 manchones de agua;
     - el tranvía va en un 24 % sobre casas;
     - fuera de Medellín e Itagüí casi no hay barrios (Bello 1 %), y fuera de Medellín pocas calles tienen nombre (4–18 %).
4. **Regla aprendida:** el bot sirve para encontrar errores, no para balancear. El piloto automático del bus y de “Al volante” no intenta ganar. Para balancear hacen falta datos de jugadores.

### v0.9.0 (2026-11-17) — Maqueta 2:1 y álbum de postales
Pedido del autor: “continúa desarrollando y mejorando, termina lo pendiente y lo olvidado”.
1. **Maqueta 2:1 (`src/js/24-iso.js`), en La Red con el botón “⬢ Maqueta 2:1”:** el valle real en proyección dimétrica.
   - Se dibuja por columnas de adelante hacia atrás con búfer de altura: relieve real con sombreado, calles, río, parques, casas con techos de teja o plancha y edificios con su altura (con hileras de ventanas al acercarse).
   - Las líneas van sobre el relieve: el metro en viaducto, los cables por encima de la loma. Hay estaciones y nombres de barrios.
   - **Giro de 90°**, arrastre y pellizco.
   - Rendimiento: se dibuja a resolución CSS en caché (24–64 ms en el banco), solo al soltar el dedo; si un dibujo pasa de 70 ms, baja la resolución sola.
   - Un salto rápido por bloques de 640 m evita calcular lo que no asoma.
2. **Álbum de postales (`src/js/68-album.js`), botón “📷 Álbum” en Elige tu viaje.** Esto estaba olvidado: las postales se tomaban, pero no había dónde verlas.
   - 43 lugares reales, cada uno con **vista aérea sacada del propio mapa** (con rótulos) o su ilustración (Comuna 13, Biblioteca España, Plaza Botero y Palacio de la Cultura).
   - **5 especiales:** Parque Arví y Homenaje a Gardel (bajarse en su estación en Ciudad Libre), Silleteros, Alumbrados y Velitas (jugar en esas fechas).
   - Usa la misma lista `Save.d.fotos` (el guardado no cambia).
3. **Cartel de la fiesta del día** con su ilustración arriba de las misiones (Alumbrados, Feria de las Flores y Velitas). Con esto se usan las 5 ilustraciones que estaban incluidas y no aparecían en ninguna parte.
4. **Pruebas:**
   - el autotest suma el álbum (arte y datos de las 48 postales) y la maqueta (la proyección va y vuelve con los 4 giros; un dibujo de prueba sale con 95 % de ciudad);
   - 100 partidas, 0 errores, 0 de consola.
5. **APK solo con el juego:** desde v0.6.0 la APK metía también los documentos del proyecto (El-Metro-TODO.html y EL-METRO-TODO.md), la imagen para redes y el servidor local. Ahora `android/app/build.gradle.kts` los excluye y la APK pasa de 4,9 a 1,9 MB.
6. **Regla aprendida:** al meter un comentario en una línea de código compacta, usar `/* … */`, nunca `//`: un `//` anuló el resto de una línea y solo lo atrapó la verificación de sintaxis.

### v0.8.0 (2026-11-17) — identidad del Metro, seguridad y código limpio
Pedido del autor: “cambia la estética de revista, usa los colores del metro y crea una interfaz de inicio más original; quita notas innecesarias del estilo revista; pule el código; verifica su seguridad y déjalo sin rastro de uso de IA”.
1. **Diseño (`src/style.css` reescrita, mismas clases):**
   - paleta: noche del valle `#0F2238`, concreto `#E8ECEF`, andén blanco, tinta `#13253A` y los colores de cada línea;
   - **franja de las 11 líneas** bajo las barras;
   - botones en píldora, paneles redondeados y nada de bordes negros gruesos ni sombras duras;
   - tablero de anuncios con texto ámbar como el de las estaciones.
2. **Inicio original:**
   - la ilustración del valle arriba, con el título y el estado del servicio (“En servicio, 18:18” o “Cerrado, abre a las 4:30”);
   - el **menú es una línea de metro**: Jugar, La última vuelta, Aprende a usar el Metro y Jugar juntos son estaciones de colores sobre el trazo;
   - **un tren viaja a la estación que se toca** (respeta “reducir movimiento”).
3. **Elige tu viaje:** cada modo es una fila con el color de su línea: ícono en una estación, nombre, descripción y estrellas.
   - Se quitaron las notas de revista: “La revista que se mueve”, “Est. 01…”, el lema en cursiva, el pie con sellos, “Estética: revista EMSAY” en créditos y la etiqueta del bot.
   - El tema por defecto pasa de “revista” a **“metro”**; las partidas guardadas con “revista” se leen como “metro”.
4. **Seguridad:**
   - los mensajes del modo Juntos se validan por tipo: nombres limpios y acotados, modo y nivel existentes, acciones primitivas, sin claves `__proto__`, resultados con solo puntaje, estrellas y victoria;
   - importar partidas descarta claves que cambian prototipos;
   - **CSP** en el HTML: sin conexiones externas, sin objetos ni marcos y sin `base` ni formularios;
   - `no-referrer`.
   - Android revisado: solo carga sus archivos, los enlaces externos van al navegador, el acceso a archivos está apagado y los nombres de archivo se limpian.
   - **Pendiente del autor:** la APK se firma con la clave de desarrollo que está en el repositorio. Con ella, cualquiera podría firmar una “actualización”. Hay que crear una clave de publicación fuera del repositorio; las instalaciones actuales tendrían que reinstalar una vez.
5. **Código:**
   - la versión publicada se compila **sin comentarios** (`tools/build.mjs`, solo líneas completas de comentario);
   - sin menciones de herramientas de IA en `src/`, en las herramientas del juego ni en Android;
   - carpetas de arte neutras: `arte/entregas/laminas` y `arte/entregas/vectorial`;
   - índice de vías renombrado (`rIdx`) para no chocar con otra variable.
6. **Pruebas:**
   - el autotest suma pruebas de seguridad;
   - 100 partidas, 0 errores, 0 de consola (con la CSP activa);
   - pruebas maliciosas a mano: importar con `__proto__` y mensajes de red malformados, todas bien.

### v0.7.0 (2026-11-17) — Medellín reconocible
Pedido del autor: “dibuja bien el mapa, dale vida, que sea preciso en ubicaciones y zonas; los peatonales están desordenados y sin sentido, lo mismo los barrios y la división de las casas; el corazón es reconocer cada calle, cada zona, cada barrio”.

1. **Diagnóstico medido:** cruzando el mapa con las **manzanas catastrales** de Medellín, entre el **88 y el 97 % de las casillas “andén” caían dentro de manzanas**. No eran andenes: eran lotes construidos que la fuente original (Overture/OSM) no marcó. Por eso se pintaba adoquín donde hay casas.
2. **Datos oficiales:**
   - `tools/ciudad_descarga.py` baja de ArcGIS Online, una vez, las capas abiertas de la Alcaldía de Medellín: barrios, manzanas, malla vial 2026, jerarquía vial, espacio público y 312.716 lotes (solo centroide y área). También los barrios de Itagüí, Envigado y Sabaneta.
   - `tools/ciudad_datos.py` genera `src/data/ciudad.js` (329 KB) **sin tocar el mapa base**:
     - **parche** de 89.446 casillas, que se aplica al cargar: andén dentro de manzana → casa o edificio según el tamaño de sus lotes; espacio público → parque o plaza. Fuera de Medellín se usa la regla medida en Medellín. No se tocan las plazas a ≤ 60 m de cada estación de la red ni los lugares emblemáticos;
     - **barrios** en una grilla de 80 m;
     - **nombre por casilla de vía**: dos capas, nomenclatura y nombre popular, con código predictivo;
     - **lotes por casilla construida** (2 bits);
     - **656 lugares** con nombre.
3. **En el juego (`10-map.js`):**
   - `MAP.ciudad()` decodifica todo al cargar (+~150 ms);
   - `MAP.barrioAt`, `MAP.calleAt` y `MAP.lotT`;
   - `MAP.drawLabels`: calles rotuladas siguiendo su dirección (nombres populares en mayúscula), parques y plazas, y barrios en mayúsculas espaciadas a media distancia; evita que se encimen.
   - Se usa en Ciudad Libre, en el simulador de bus y en La Red.
   - **HUD con el barrio** y **letrero** al entrar a otra calle o barrio (Ciudad Libre).
4. **Dibujo:**
   - **andén con bordillo** dentro de cada casilla de vía (calle 3 px ≈ 4 m, avenida 2 px; la autopista solo berma);
   - **casas con fachada hacia su calle** (sur, este, oeste o norte), divididas según los lotes catastrales;
   - techos de teja, eternit o **terraza paisa**: tanque, ropa tendida, columnas con varilla “para el segundo piso”, matas y, de vez en cuando, un perro;
   - patios interiores de manzana;
   - **peatonales de adoquín trabado** y **plazas de losas con franjas de ladrillo**, carritos con sombrilla y bancas con farol;
   - los lugares emblemáticos ya no son rectángulos planos: solo su ícono (iglesia, estadio, pista, rocas de la Biblioteca España) y su nombre.
5. **Atribución:** la licencia abierta del Catastro exige citar y declarar las transformaciones. Va en créditos, en La Red y en `docs/FUENTES.md`.
6. **Pruebas:**
   - el autotest verifica el parche, los 502 barrios y los 2.438 nombres, además de casos reales: Parque Berrío en La Candelaria; Carrera 50, Carrera 80, Calle 67 y Sistema Vial del Río junto a sus estaciones;
   - 100 partidas, 0 errores; ~15 ms por trozo, igual que antes;
   - capturas en Niquía, Parque Berrío, San Antonio, Santo Domingo, Prado, Floresta, Estadio, Manrique, Bello, Madera e Itagüí.
7. **Pendiente:**
   - barrios de **Bello** (y del norte y el sur del valle): no se encontró capa abierta, y Nominatim respondió “429, demasiadas solicitudes” desde la nube;
   - anchos reales de calle por casilla (la malla trae el ancho);
   - casillas G‑60 a G‑63 de Gemini en un acercamiento.

### v0.6.0 (2026-11-17) — el arte llega a la ciudad
1. **Entregas verificadas y ordenadas** en `arte/entregas/` (ver `INVENTARIO.md`):
   - 20 láminas de Gemini con el nombre de su encargo;
   - 92 SVG de ChatGPT recuperados de su documento maestro;
   - sus 8 scripts regeneran los vehículos **idénticos byte a byte** (31 de 33);
   - miniaturas de las texturas.
   - Se corrigieron afirmaciones: no existió una v0.5.1; la **Línea O es de buses eléctricos** por la 80 (el Metro de la 80 será la **Línea E, rosada**); el código propuesto por Gemini en `src/data/` se habría borrado al cargar.
2. **`tools/arte_juego.py` → `src/data/arte.js`:**
   - recorta las láminas por segmentación del fondo magenta, quita el fondo sin tocar los rosados interiores y reduce a WebP;
   - minifica los SVG.
   - La lista con su uso queda en `arte/entregas/USO-EN-EL-JUEGO.md`.
3. **`Atlas` (`19-atlas.js`):** `has`, `url`, `img`, `tag`, `ico`, `retrato` (gesto alegre, triste o neutro según la frase), `fiesta` (adornos según el calendario) y `check` (autotest).
4. **En el juego:**
   - portada C‑40; íconos C‑10 en las tarjetas de modos; íconos C‑11 en la cabina y en Ciudad Libre;
   - medallas C‑12 y **2 logros nuevos** (Feria de las Flores y Alumbrados);
   - adornos C‑50 en la portada durante las fiestas;
   - pantalla C‑41 en el menú de historia;
   - **retratos** de Rosalba, la nieta, Don Efraín, Doña Marleny, Wílmar, la agente y el pasajero en los diálogos;
   - **tarjeta ilustrada por capítulo**: panorama nocturno, ladera al atardecer, aguacero, tango y Gardel, centro isométrico, panorama de día, Rosalba en el andén y la portada.
5. **Mapa cenital (`10-map.js`) rediseñado** tras la queja del autor (“parecía un parqueadero”):
   - cada casilla de vía se clasifica como tramo vertical, tramo horizontal o cruce, midiendo solo con vías **del mismo tipo** (en los datos, autopista, avenida y viaducto vienen pegados);
   - un cruce solo se marca si llega una vía transversal;
   - calles con una línea amarilla; avenidas con **separador verde y árboles** (algunos guayacanes); autopista con **barrera de concreto**; calzadas cada dos casillas en franjas muy anchas;
   - **cebras solo a la entrada de los cruces**;
   - puentes y viaducto como losa de concreto; río con **muros de canal** y brillos sueltos (sin rayas); quebradas con orilla verde;
   - **escaleras** orientadas por la pendiente real, con baranda; **ciclorrutas** como carril verde sobre andén;
   - andenes y plazas más sutiles; techos más variados (menos tanques);
   - suavizado al alejar (sin titileo).
   - Mismo rendimiento: ~15 ms por trozo.
6. **Fidelidad medida contra OpenStreetMap** (`tools/osm-ventanas.mjs` + `tools/osm_comparar.py`) en centro, Niquía y Santo Domingo:
   - 98–100 % de las calles reales a ≤ 20 m de una vía del juego; 99,5–99,9 % de las vías del juego existen; 457 de 457 tramos con nombre.
   - **No es exacto:** anchos (todo mide 20 m), curvas en escalera, glorietas, edificios (procedurales) y alturas (por comuna).
7. **Servidor local (`tools/server.mjs`):**
   - se confirmó la caída de la auditoría de ChatGPT (`GET /%E0%A4%A` tumbaba el proceso) y se corrigió;
   - además: rutas resueltas dentro de la carpeta, salas de 4, tramas enmascaradas y acotadas.
   - `tools/test-servidor.mjs` hace 16 comprobaciones (con el servidor viejo fallan 11) y corre dentro de `test.mjs`.
8. **Pruebas:**
   - autotest con 78 piezas de arte verificadas; 100 partidas, 0 errores, 0 de consola;
   - capturas de portada, modos, logros, historia, tarjetas y diálogo;
   - banco del mapa en 8 sitios reales a 3 escalas.
   - Un error que el bot no veía (un comentario que anulaba la tarjeta del capítulo) salió en las capturas y se corrigió.

### v0.5.0 (2026-11-17) — la historia se juega dentro de la ciudad
1. Nuevo `37-trama.js`: motor de pasos (hablar, ir, abordar, bajar, foto, orientar, módulo) con datos validados por el autotest (`Trama.check`): estaciones, líneas, niveles y postales deben existir.
2. Personajes en el mapa (Rosalba, Don Efraín, Doña Marleny, Wílmar, agente de tránsito, pasajeros con ❓) con nombre y marcador; conversación en caja inferior con voz opcional; preguntas de orientación de rutas reales (A→K, B→J, T→H, T→M, A→P, A→K→L…).
3. Módulos encadenados: "¡Vamos!" lanza el metro/cable/bus/tranvía y al terminar vuelve a Ciudad Libre en la estación de llegada (`Trama.place`), avanzando el capítulo.
4. Ciudad Libre: barra de capítulo con distancia, flecha y punto en el minimapa (`st.goal`), botón ⏩ (×5 al viajar o esperar en una estación), preferencia de línea al abordar en estaciones compartidas (`Ciudad.atHub(..., pref)`), los oficios se pausan durante la historia.
5. Panorámica: paleta de día tipo ilustración (cordillera azul, cerros intermedios, suelo verde), capa intermedia `R.inter` para escalonar siluetas, sin "ruido" de casas en la cordillera de día (solo luces de noche).
6. Menú Historia: "Nuevo · la historia en la ciudad" (empezar/seguir/reiniciar) sobre los capítulos clásicos.
7. Pruebas: autotest con 8 capítulos validados; 100 partidas, 0 errores, 0 de consola, todas las capturas; prueba guiada en Chromium (hablar → manejar → volver a Madera; abordar en Madera con ⏩ y bajarse en Acevedo).

### v0.4.0 (2026-11-17) — ciudad de verdad, cabina real, laderas
1. Ciudad cenital redibujada por lotes y manzanas (`10-map.js`): tejados unidos, fachadas, sombras, tanques, barrios de ladrillo variados, carros parqueados, árboles de andén, carriles en avenidas, cebras solo en cruces.
2. `31-cabina.js`: procedimiento de cabina (llave → sentido → señal → tracción; vigilante cada 25–40 s; puertas del lado correcto según el andén; anuncio) con botonera iluminada y Escuela de conducción de 9 pasos (`A:0-2#escuela`).
3. 3D: sin edificios bajo/encima del viaducto (`G3.railMask`), tablero de concreto con balasto, rieles claros y pretiles.
4. Panorámica: laderas con barrios (comunas) y monte con ruido de valor, filo iluminado y bruma; de noche las laderas se llenan de luces; fachadas con ventanas/toldos y árboles de primer plano anclados al mundo (antes "saltaban"); título de estación más abajo en horizontal.
5. Bus: validación Cívica al subir (bip, pasajeros sin saldo que recargan), pasajes en el HUD y en el resumen.
6. **Corrección importante:** los buses largos se trababan contra esquinas de manzana (casillas de 20 m) al girar y el piloto automático no avanzaba; ahora el corredor de la ruta (±7 m) es transitable (`st.lane` en `38-bus.js`, usado por `Libre.drive`).
7. Ciudad: perros callejeros y paseados con correa (`Spr.dog`), ladran cuando un vehículo los asusta; no son clientes de taxi.
8. Pruebas: 100 partidas (0 errores) + 60 partidas con la versión final (0 errores, 0 de consola). `tools/test.mjs` reintenta capturas lentas (SwiftShader tarda en la primera captura de cada modo).

### v0.3.0 (2026-11-17) — rediseño por retroalimentación del autor
1. Se abandona el enfoque de minijuegos: el menú ahora son módulos de simulación sobre el mapa; los puzles pasan a "Arcade".
2. Nuevo `38-bus.js` (simulador cenital de Metroplús/alimentadores) con pasajeros que esperan y abordan, puertas, horario, paradas perdidas, confort, semáforos, choques; rutas se "abren" al completarse.
3. Metro: vista panorámica 2D por defecto (recuerda la última vista), cabina rediseñada, diagrama de línea, otros trenes en la vía, estaciones con techo/letrero/gente, calle con carros y peatones y fachadas de primer plano.
4. Sprites nuevos (`21-sprites.js`), cebras, vendedores, Cívica al abordar, guía educativa, reloj configurable.
5. Correcciones: `#gctl` ocupa toda la pantalla (barras de misión visibles), luces de ventanas cacheadas por trozo, bucle congelable para capturas, pendientes limitadas para buses.
### v0.2.0 (2026-11-16)
Ciudad Libre, Al volante 3D, Metrocable viaje, 3D WebGL, vista lateral, mundo (reloj/clima/fechas), paleta oficial de líneas, pedales/inclinar.
### v0.1.0 (2026-11-16)
Base: HTML único, mapa real, red completa, puzles (Despacho, Alimentadores, Metroplús, Cable), La Red, historia, misiones/logros, multijugador local, APK, PWA, bot.

## Qué falta (prioridad)
0. **Medellín fiel (Fase 1b):**
   - **capa vectorial de OpenStreetMap**: hecha en v1.1.0 (ejes de vía con su ancho, curvas y nombres).
   - **huellas reales de edificios** y usos del suelo: hechas en v1.2.0.
   - Sigue: pisos oficiales para todo Medellín (la capa abierta solo trae tres comunas); color de techo por edificio; el Orquideorama y la celosía dorada de la Plaza de la Libertad; armar los trozos de lejos en un Web Worker (hoy ~140 ms en la zona más densa).
   - estructuras (viaducto, estaciones, cables) y la **Maqueta 2:1**.
   - Hay que decidir cuánto peso aceptar (ver `docs/auditorias/2026-11-17-fidelidad-mapa-osm.md`).
   - El extracto de OSM (Geofabrik) está bloqueado desde la nube: procesarlo en el PC del autor o en una GitHub Action.
0. **Hoja de ruta del mapa medida (auditoría del 17‑nov): M1–M6 hechos en v0.10.0.** Siguiente: M7 (quebradas a su tamaño). Plan grande en `docs/REVOLUCION.md`.
0. **Hoja de ruta original del mapa (auditoría del 17‑nov):**
   - M1–M6 en una sola sesión: estaciones con huella, río continuo y que siempre baja, tranvía por su calle, patio‑taller de Bello y escaleras con sentido;
   - luego M7 (quebradas a su tamaño);
   - luego M8 y M9 (nombres y barrios fuera de Medellín).
   - Metas y fuentes en `docs/auditorias/2026-11-17-auditoria-juego-y-mapa.md`. Comprobar con `node tools/auditoria-mapa.mjs`.
   - **Arreglos rápidos del juego** del mismo informe: memoria del mapa, arranque sin tirón, resultado coherente con 0 estrellas, accesibilidad en juego y tope a las invitaciones.
0a. **Maqueta 2:1: hecha en v0.9.0.** Siguiente: usarla también en Ciudad Libre como vista opcional y pintarla con el encargo G‑100.
0b. **Arte, fase 2:**
   - estaciones y vehículos de perfil de Gemini (G‑20 a G‑37) en la panorámica;
   - consolas C‑20/C‑21 en la cabina; señalética C‑30;
   - casillas G‑60 a G‑63 en un acercamiento de Ciudad Libre;
   - variantes de ladera G‑50 a G‑55 en el Metrocable.
   - Pedir a ChatGPT el ZIP con las texturas de 1024 px y a Gemini la ladera de día (G‑40).
0c. **Firma de la APK:** hoy se firma con la clave de desarrollo del repositorio (lo señaló la auditoría). Cambiarla impide actualizar las APK instaladas: lo decide el autor.
1. **Arte "real":** sprites y tiles hechos a mano o generados por IA (ver `arte/06-guia-unica-ia.md`), fondos pintados para la panorámica (cerros, Alumbrados), cabina del metro con foto‑referencia, portada/compartir ilustrados.
2. **Bus:** interiores en parada (cámara que se acerca), pasajeros con destinos, cobro con Cívica, paradas intermedias reales de Metroplús (en la mediana), pico y placa/hora pico, 3D opcional dentro del simulador.
3. **Metro:** señales en la vía (ATP real), anuncios de voz grabados, interior del tren (pasajeros), tramos nocturnos con Alumbrados, cables desde el metro, escuela también para tranvía (pantógrafo, señales de tranvía).
4. **Ciudad Libre / historia:** sesión 2 de la historia (Alumbrados, cable Arví, línea J y Comuna 13, Metro de la 80), escenas de corte con los personajes, más NPC (policía de tránsito, ciclistas EnCicla), interiores de estación, retos de tiempo, cooperativo.
5. **Datos:** alimentadores del sur (Itagüí, Envigado, Sabaneta, Bello) y paraderos exactos; estaciones de Metroplús en la mediana con sus accesos.
6. **Técnico:** trozos del mapa en Web Worker (hoy ~50 ms por trozo de 640 m al entrar en zona nueva), probar en celulares reales (rendimiento 3D y cenital, WebRTC), modo Bluetooth/“Cerca” nativo en el APK, lector QR JS para iPhone, sonido de motor por vehículo, música por módulo.
