# Bitácora · El Metro

## v0.2.0 (2026-11-16) · "La ciudad es tuya"
1. **Ciudad Libre** (`src/js/35-ciudad.js`, `36-libre.js`): mundo abierto cenital estilo GTA 1/2 sobre el mapa real (Caldas–Barbosa). A pie, bici EnCicla, moto, taxi, camioneta del Metro, alimentador y articulado; o de pasajero abordando metro, tranvía, cables y buses que circulan de verdad y paran en cada estación. Física arcade (modelo bicicleta + derrape con freno de mano, huellas, polvo, agua), choques con edificios/carros, peatones con rumbo que se asustan y conversan, tráfico en carriles reales con semáforos, oficios por radio (taxi, encomienda, cita por la red, reparación, ruta de bus, postal, tinto), postales de 45 lugares reales (`src/data/lugares.js`, de EnCicla), minimapa, joystick táctil + pedales + ●.
2. **Mundo** (`18-mundo.js`): reloj del juego (×30, real, día o noche fijo), clima por temporada/hora con semilla del día (lluvia, tormenta, niebla, nubes), temperatura, y fechas reales: cumpleaños del Metro (30/11), Alumbrados, Velitas, Novena, Navidad, Año Nuevo, Feria de las Flores, Silleteros, 20 de julio, 7 de agosto, Antioqueñidad, Amor y Amistad, Halloween, Madre, Semana Santa. Adornos en los escenarios y noticias en el menú.
3. **3D WebGL propio** (`22-gl.js`): valle low‑poly con textura del mapa real, casas pastel con techos a dos aguas, edificios, árboles, viaductos/rieles/estaciones/torres de cable, cielo y sol por hora (lat 6,25°), ventanas encendidas de noche, niebla. Usado por Conduce, Al volante y Metrocable (1ª, 3ª y cámara de cine 🎥; modo paseo 🎬).
4. **Vista lateral en capas** (`23-lado.js`, estilo odisea): relieve real en 3 capas, sol/luna, nubes, gallinazos, luces de barrios, lluvia.
5. **Al volante** (`32-volante.js`): articulado (con remolque) y alimentadores por calles reales, pendientes, tráfico, semáforos, paradas, asistente de carril, timón, pedales e inclinar el celular.
6. **Metrocable · Viaje** (`52-cableviaje.js`): operación de la línea (0–5 m/s), viento con ráfagas, péndulo de la cabina, tormentas, fotos en miradores.
7. **Arte cenital nuevo** (`10-map.js`): 16 px por casilla, casas en 3/4 con sombra proyectada, árboles frondosos, andenes y bordillos, viaductos con rieles, andenes de estación, torres de cable; luces de ventanas cacheadas por trozo.
8. Paleta con los colores oficiales de las líneas (A azul, B naranja, T verde, cables H/J/K/L/M/P, Metroplús) en interfaz y tarjetas. Historia: 2 capítulos nuevos (alimentador y articulado).
9. Probado: `node tools/test.mjs 100` → selfTest 0 errores, 100 partidas 0 errores, 0 errores de consola (la captura de la pantalla de historia falla a veces solo en el Chromium sin GPU de pruebas).
10. **Falta / siguiente**: misiones de historia dentro de Ciudad Libre; más NPC (vendedores, policías de tránsito, bicis); interiores de estación; persecuciones/retos de tiempo entre estaciones; multijugador en Ciudad Libre; más alimentadores del sur; sonido de motor por vehículo; Bluetooth nativo; pruebas en celulares reales (rendimiento 3D y WebRTC).

## v0.1.0 (2026-11-16)
1. Creado el proyecto: un solo HTML offline con fuentes, mapa real del Valle (EnCicla) y red completa (31 líneas; `src/data/red.js`).
2. Modos: Conduce, Despacho y Alimentadores (motor de agujas), Metroplús (semáforos), Metrocable (puzle), La Red (mapa + flota).
3. Historia "La última vuelta" + misiones del día, racha, logros, noticias, temas y modo daltónico.
4. Multijugador sin servidores externos: duelo de mesa, WebRTC por QR, servidor local `server.mjs`, pestañas.
5. APK Android (WebView + lector QR nativo) con `tools/apk.sh`.
6. PWA en GitHub Pages: manifest, sw.js, íconos, OG `compartir.png`, exportar/importar partidas.
7. Bot interno (menú → 🤖) y `tools/test.mjs`.
