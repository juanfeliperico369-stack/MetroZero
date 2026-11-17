# Bitácora · El Metro

> Guía viva del proyecto. Quien retome el trabajo (persona o IA) debe leer esto, `docs/PLAN.md` y `docs/PROMPTS-IA.md`, y actualizar esta bitácora al cerrar cada sesión.

## Estado al 2026-11-17 · v0.5.0 "La historia en la ciudad"
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

**Publicado:** https://juanfeliperico369-stack.github.io/MetroZero/ (rama `gh-pages`; v0.5.0 verificada el 2026-11-17: carga, service worker con caché `el-metro-v0.5.0-63270c88`, sin conexión, instalable sin errores) · APK v0.5.0 (versionCode 5) en `/el-metro.apk`.

## Carpeta de arte (`arte/`, 2026-11-17)
Investigación visual y guía de producción para el arte definitivo:
- biblia de estilo, 32 referencias de juegos analizadas (incluye los 4 reels del autor), identidad visual de Medellín y su transporte, historia del Metro y de la ciudad con fuentes, folclor y calendario de fiestas, y diseño de mundo abierto + arcade;
- **guía única de prompts** (`06-guia-unica-ia.md`): contexto completo para todas las IA + rol de cada una (Gemini Nano Banana hace los encargos G‑, ChatGPT los C‑ y Midjourney los M‑) + encargos, correcciones y entrega; y especificación de entregas e integración (`08`);
- 71 fotos de referencia con licencia libre, enlazadas desde Openverse con autor y licencia (`galeria.md`/`galeria.json`). Las descargas directas desde Wikimedia y Flickr están bloqueadas en la nube;
- `node tools/arte.mjs` genera `arte/index.html`: una página con todo, botones de copiar en los prompts, muestras de color y galería. Publicada en `/arte/` de GitHub Pages.

**Siguiente paso:** cuando el autor traiga el arte (estructura en `arte/08-entregas-e-integracion.md`), limpiar el magenta, cuantizar a la paleta, armar atlas y conectarlos en `10-map.js`, `21-sprites.js`, `23-lado.js`, `31-cabina.js` y `37-trama.js`, siempre con respaldo procedural.

## Historial
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
1. **Arte "real":** sprites y tiles hechos a mano o generados por IA (ver `docs/PROMPTS-IA.md`), fondos pintados para la panorámica (cerros, Alumbrados), cabina del metro con foto‑referencia, portada/compartir ilustrados.
2. **Bus:** interiores en parada (cámara que se acerca), pasajeros con destinos, cobro con Cívica, paradas intermedias reales de Metroplús (en la mediana), pico y placa/hora pico, 3D opcional dentro del simulador.
3. **Metro:** señales en la vía (ATP real), anuncios de voz grabados, interior del tren (pasajeros), tramos nocturnos con Alumbrados, cables desde el metro, escuela también para tranvía (pantógrafo, señales de tranvía).
4. **Ciudad Libre / historia:** sesión 2 de la historia (Alumbrados, cable Arví, línea J y Comuna 13, Metro de la 80), escenas de corte con los personajes, más NPC (policía de tránsito, ciclistas EnCicla), interiores de estación, retos de tiempo, cooperativo.
5. **Datos:** alimentadores del sur (Itagüí, Envigado, Sabaneta, Bello) y paraderos exactos; estaciones de Metroplús en la mediana con sus accesos.
6. **Técnico:** trozos del mapa en Web Worker (hoy ~50 ms por trozo de 640 m al entrar en zona nueva), probar en celulares reales (rendimiento 3D y cenital, WebRTC), modo Bluetooth/“Cerca” nativo en el APK, lector QR JS para iPhone, sonido de motor por vehículo, música por módulo.
