# Bitácora · El Metro

> Guía viva del proyecto. Quien retome el trabajo (persona o IA) debe leer esto, `docs/PLAN.md` y `arte/README.md`, y actualizar esta bitácora al cerrar cada sesión.

## Estado al 2026-11-18 · v1.1.0 "Ciudad con curvas"
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
   - **capa vectorial de OpenStreetMap**: ejes de vía con su ancho, glorietas, curvas y **nombres de calles**;
   - **huellas reales de edificios** y usos del suelo;
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
