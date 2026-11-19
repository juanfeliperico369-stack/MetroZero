# SKILLS PARA IA · El Metro

> Archivo para subir como **conocimiento** a un Gem de Gemini o a un **Proyecto** de ChatGPT (junto con `CONTEXTO-IA.md`). Reúne el índice de skills y las **skills propias del proyecto**. Los agentes de código (Claude Code, Codex, Antigravity) las leen directo del repositorio en `.agents/skills/` y `.claude/skills/`.

## Skills del proyecto *El Metro*

Las **skills** son carpetas con un `SKILL.md` (instrucciones y, a veces, scripts). Siguen el formato abierto **Agent Skills** ([agentskills.io](https://agentskills.io/specification)), que leen Claude, Codex de ChatGPT, Antigravity y Gemini CLI. Cada agente carga una skill cuando la tarea coincide con su descripción.

## Dónde las lee cada IA
| IA | Carpeta |
|---|---|
| **Claude Code** | `.claude/skills/` (copia automática con `node tools/skills.mjs`) |
| **ChatGPT Codex** (“astra”) | `.agents/skills/`, la carpeta común. Algunas versiones usan `.codex/skills/` *(verificar en la documentación de Codex)* |
| **Gemini Antigravity** (“argon”) y Gemini CLI | `.agents/skills/` del espacio de trabajo. La documentación oficial de Antigravity la indica para skills de proyecto; la ruta global cambia según la versión |
| **Gemini (Nano Banana)** y **ChatGPT** como generadores de imágenes | No leen carpetas. Sube `arte/SKILLS-IA.md` (y `arte/CONTEXTO-IA.md`) como conocimiento de un **Gem** o como archivo de un **Proyecto** |

## Skills instaladas
| Skill | Para qué | Quién la usa | Origen y licencia |
|---|---|---|---|
| **el-metro-desarrollo** | Estructura del código, compilar, probar (100 partidas), capturas, APK, publicar y bitácora | Agentes de código (Claude, Codex, Antigravity) | Propia del proyecto |
| **el-metro-arte** | Dirección de arte, paletas, vistas, reparto G‑ y C‑, revisión e integración de imágenes | Todas las IA (las de imágenes, vía `SKILLS-IA.md`) | Propia del proyecto |
| **medellin-fiel** | Topografía, relieve, estructuras y vista isométrica 2:1 (Fase 1b) | Agentes de código; Gemini para el repintado G‑100 | Propia del proyecto |
| **frontend-design** | Dirección visual de interfaces: tipografía, jerarquía, evitar diseños genéricos (menús, HUD, guía) | Agentes de código | [anthropics/skills](https://github.com/anthropics/skills) · Apache‑2.0 (`LICENSE.txt` en la carpeta) |
| **webapp-testing** | Probar aplicaciones web con Playwright: capturas, consola, DOM (complementa `tools/test.mjs`) | Agentes de código | anthropics/skills · Apache‑2.0 |
| **skill-creator** | Crear, mejorar y evaluar skills nuevas del proyecto | Agentes de código | anthropics/skills · Apache‑2.0 |

Versión de anthropics/skills copiada: commit `e4bb5d9` (16 nov 2026).

> **Nota sobre `frontend-design`:** marca como “cliché” el fondo crema con acento terracota. En *El Metro*, el papel crema `#f1ece0` es **decisión del autor** (revista EMSAY). Se mantiene, con los colores de las líneas del Metro como acentos (ver `el-metro-arte`).

## Recomendadas, no instaladas aquí
**Plugins de Claude** que el autor puede activar en su cuenta:

| Plugin | Para qué |
|---|---|
| **image-generation** | Guía de prompts para Gemini Image y GPT Image; sirve para mejorar los encargos G‑ y C‑ |
| **frontend-design** | La misma skill de arriba, para usarla en cualquier proyecto |
| **playwright** (Microsoft) | Manejar el navegador de forma interactiva |
| **Android Emulator QA** | Probar la APK en un emulador del PC |
| **Unity** | Solo si algún día el juego pasa a Unity: sprites pixel‑perfect, atlas, mosaicos |

**Skills oficiales que no se copiaron:**
- **canvas-design** pesa 5,6 MB por sus fuentes.
- **algorithmic-art** usa p5.js, que el juego no lleva.

Ambas están en anthropics/skills si se necesitan.

## Mantenimiento
- Las skills propias se editan **solo** en `.agents/skills/`.
- Después se corre `node tools/skills.mjs`, que copia todo a `.claude/skills/` y regenera `arte/SKILLS-IA.md`.
- Al cambiar una regla del proyecto, actualiza la skill correspondiente y la bitácora.


---

# Skill · el-metro-desarrollo

```yaml
name: el-metro-desarrollo
description: Cómo trabajar en el código del videojuego "El Metro" (Metro de Medellín). Explica la estructura de un solo HTML sin librerías, el mapa de módulos en src/js, la compilación, las pruebas con bot y 100 partidas, las capturas en Chromium, la APK de Android, la publicación en GitHub Pages y la bitácora. Úsala siempre que vayas a leer, modificar, probar, compilar o publicar el juego.
```

## El Metro · desarrollo

### Qué es
Videojuego **offline** de mundo abierto + arcade sobre el Metro de Medellín, para todo público y para celulares modestos. Se entrega como **un solo `index.html`** (PWA en GitHub Pages) y como **APK** de Android (WebView).
- **Misión:** que cualquiera conozca, use y quiera la red y la ciudad jugando.
- **Visión:** el gran juego de Medellín, fiel a la ciudad.

**Antes de tocar nada, lee:**
- `docs/BITACORA.md`: estado, historial y pendientes.
- `docs/PLAN.md`: fases.
- `arte/README.md`: arte.

### Protocolo
Antes de trabajar, sigue el **PROTOCOLO PARA TODA IA** (`arte/PROTOCOLO-IA.md`, también en `AGENTS.md`):
1. lee todo;
2. reflexiona;
3. responde el cuestionario;
4. prueba;
5. auto‑ajústate;
6. haz solo lo tuyo;
7. entrega y registra.

### Reglas que no se rompen
1. **Un solo HTML, sin librerías externas ni internet** en tiempo de juego. Todo va embebido (datos, fuentes, arte).
2. **Celulares modestos:** cuida los ms por cuadro, cachea lo dibujado y evita asignar memoria en el bucle.
3. **Español** en todo el juego y en los textos; **todo público** (sin violencia).
4. **No romper el guardado** (`localStorage` clave `elmetro.v1`, objeto `Save.d`). Si agregas campos, que tengan valor por defecto.
5. **El arte nuevo siempre va con respaldo:** si falta una imagen, sigue el dibujo procedural actual.
6. **Cerrar cada sesión actualizando `docs/BITACORA.md`**: qué cambió, qué se probó y qué falta.

### Mapa del código (`src/js/*.js` se concatenan en orden)
| Archivo | Qué hace |
|---|---|
| `00-core.js` | `EM`, `Save`, sonido y música generativa, `UI`, utilidades |
| `10-map.js` | Mapa real (casillas de 20 m, `TT.*`), relieve, rótulos, barrios; delega el dibujo cenital en `VC` |
| `11-ciudad2.js` | **Ciudad vectorial `VC`** (1.1.0): calles con curva desde `VIAS`, suelo sin escalones (cuadrados marchantes), casas y edificios **reales** por regiones de 640 m (de `EDIFICIOS`; generados a lo largo de cada calle solo si faltan los datos), choques (`VC.solid`, `VC.agarre`, `VC.despeja`), 4 niveles de detalle con presupuesto por cuadro y trozos por adelantado (`VC.prefetch`), rótulos y postes sobre las calles |
| `11-edificios.js` | **Casas y edificios reales** (1.2.0): lee `EDIFICIOS` por región (`VC.edifDe`), los recorta contra la calle (`VC.recorta` con `segsCerca`/`enSegs`), estilo por zona y uso (`VC.estilo`: muros, techos de teja a dos aguas, lámina, plancha con tanque, azotea), dibujo de cerca (`dibEd`) y de lejos en lote (`edifLejos`), y suelos especiales (`SUELOS`: canchas, pistas, piscinas, campus y sus rótulos) |
| `11-hitos.js` | **Arquitectura icónica** (`HITOS`): huella real de OSM, estilos de dibujo propios (`aguja`, `basilica`, `iglesia`, `palacio`, `estadio`, `rocas`, `vidrio`, `ladrillo`, `republicano`, `moderno`, `cupula`, `cubos`, `luces`, `botero`, `pies`); reserva su huella en la región y es sólida |
| `11-puentes.js` | **Puentes y niveles** (1.3.0): `PUENTES` (2.150 puentes de OSM vía Overture) con tablero, rampas (`puAlto`), pilas sólidas sin las que caerían en una calle (`pilas`), `puenteEn(x, y, z)`, `partes(c)` (la calle sin sus tramos sobre puente); el viaducto (`metroBase`: columnas cada 30 m y el acceso de cada estación en piezas que dejan libre la calle de abajo, `hallPiezas`), `tapado`, `carrilPuentes`/`carAlto` para el tráfico, `rumbo` (asistencia de carril) y los ángulos de cámara (`ANGULOS`, `angulo`) |
| `12-red.js` | Red de transporte `NET` (líneas, estaciones, recorridos). A, B y T usan el eje real de `RIELES`; los buses, `RUTAS_CALLES`; cada estación queda sobre su línea |
| `18-mundo.js` | Reloj del juego, clima y fechas de Medellín |
| `19-atlas.js` | `Atlas`: arte de las IA (`src/data/arte.js`) con respaldo procedural: `has`, `url`, `img`, `tag`, `ico`, `retrato`, `fiesta`, `check` |
| `20-art.js` / `21-sprites.js` | Paleta `PAL` y sprites procedurales |
| `22-gl.js` | Motor 3D WebGL1 propio `G3` |
| `23-lado.js` | Panorámica lateral por capas |
| `24-iso.js` | Maqueta 2:1: el valle en proyección dimétrica, dibujado por columnas con búfer de altura (`Iso.render`, `Iso.P`, `Iso.Pi`, `Iso.rot`) |
| `25-game.js` | Bucle de juego, HUD, pausa, `Game.freeze()`. Desde 1.3.0: los modos con `substeps` avanzan el tiempo real en pasos de 1/30 s con su `escala` (ritmo), la calidad automática baja o sube la densidad de píxeles según el tiempo de cuadro y los modos con `camara: {}` reciben `CamUI` |
| `26-perfil.js` | **Tu personaje** (`Perfil`, `Save.d.perfil`): piel, peinado, ropa, gorro (gorra, sombrero aguadeño, casco, gorro de lana) y accesorio (mochila, carriel, ruana, cámara); `ped()` da los parámetros de `Spr.ped`, `retrato()` la cara de frente y `abrir()` la ficha |
| `27-camara.js` | `CamUI`: pellizco, rueda, + y −, 📐 y 🎥 (arrastrar) en las vistas desde arriba de Bus, Al volante y Metro |
| `30-conduce.js` / `31-cabina.js` | Metro y tranvía (panorámica, cabina, ATP, procedimiento) |
| `35-ciudad.js` | Tráfico, peatones, perros, transporte en la ciudad |
| `36-libre.js` / `37-trama.js` | Ciudad Libre e historia jugable en la ciudad. Desde 1.3.0: manejo «fácil» (el joystick apunta hacia donde se va) o «clásico», giro limitado por la aceleración lateral de cada vehículo (`VEH.lat`, `giroMax`), pedal con peso, asistencia de carril, articulado con rótula (`VEH.art`, `st.h2`), ritmo ⏩ (`RITMOS`), 🆘 ayuda (`ayuda`, `llevar`, `salida`, `vigila`) y niveles (`nivel`, `nivelV`) |
| `22-gl.js` (1.4.0) | El motor 3D `G3` arma la ventana cercana con el piso de calles reales (`VC.piso3D`), los edificios reales (`edifReales`), los hitos y los puentes; Ciudad Libre lo usa en sus vistas tercera persona, dron y cine (`Libre.draw3D`, `dyn3D`, `hud3D`, `joyMundo`) |
| `28-taller-*.js` (2.0.0) | **Taller de arte procedural** de ChatGPT/Codex (`EM.taller`): `Malla` (caras en metros, X al frente, Y arriba), `vehiculo(id, {persona})`, `pista(obstáculo)`, `primera` (manubrio y manos), `horizonte`, `escena` (pasaje doblado), `lienzo` (respaldo Canvas) y `malla(clave, hacer)`: caché de mallas subidas a G3 |
| `src/data/guion.js` (2.0.0) | **Trama en datos**: los 6 personajes de EnCicla (`GUION.personajes`, con `frag`); `39-gente.js` los suma a `GENTE` |
| `47-carrera.js` (1.5.0, 2.0.0) | **Carrera sin fin**, prototipo de la M4: patineta por la calle junto a una línea, 3 carriles, saltos, obstáculos (`CR_OBS`), pasajes y datos de estación; 3D con `G3` y respaldo desde arriba; `hud(st)` es la barra del juego y `marcador()` el dibujo |
| `39-gente.js` | **Gente de la ciudad** (`GENTE`, `Gente`): 20 personajes con nombre y oficio en su lugar real que cuentan lo que todos saben y lo que pocos saben, turistas que piden compañía (`turista`) y 📍 qué hay cerca (`guia`, `LUGAR_INFO`) |
| `68-album.js` | Álbum de postales: lugares reales con vista aérea del mapa y postales especiales (`Album.ganar`, `Album.open`) |
| `38-bus.js` | Simulador de bus (Metroplús y alimentadores) |
| `52-cableviaje.js` | Metrocable |
| `60-mapa.js` / `65-menu.js` / `66-vida.js` / `67-guia.js` / `70-historia.js` | La Red, menús, misiones y logros, guía, historia clásica |
| `80-multi.js` / `06-net.js` / `05-qr.js` | Multijugador local (WebRTC/QR, servidor local) |
| `90-bot.js` | `EM.test.selfTest()` y partidas automáticas (monkey) |

Datos en `src/data/`:
- `valle.js`: mapa y relieve de EnCicla;
- `red.js`: líneas y estaciones;
- `rutas.js`: recorridos de buses por calles reales (casillas; respaldo);
- `vias.js`: 26.919 calles como vectores con ancho y nombre. **Generado** por `node tools/vias_datos.mjs RUTA_DE_JUEGA_ENCICLA_1.3`;
- `rieles.js`: eje de A, B y T entre los dos rieles de OpenStreetMap. **Generado** por `node tools/rieles_datos.mjs JSON_DE_OVERPASS`;
- `rutas_calles.js`: alimentadores por las calles vectoriales, pasando por cada parada. **Generado** por `node tools/rutas_calles.mjs`;
- `metroplus.js`: corredores reales de Metroplús (líneas 1, 2 y O). **Generado** por `node tools/metroplus_datos.mjs RUTA_DE_JUEGA_ENCICLA_1.3`;
- `lugares.js`: lugares con postal;
- `arte.js`: arte embebido (WebP y SVG). **Generado** por `python3 tools/arte_juego.py` desde `arte/entregas/`; no se edita a mano.
- `ciudad.js`: datos oficiales abiertos (parche de casillas, barrios, nombres de calle por casilla, lotes, lugares). **Generado** por `python3 tools/ciudad_datos.py CACHE` (descarga previa: `python3 tools/ciudad_descarga.py CACHE`). Se usa con `MAP.barrioAt`, `MAP.calleAt`, `MAP.lotT` y `MAP.drawLabels`. El mapa base `valle.js` **no se modifica**: el parche se aplica al cargar.

**Convenciones:**
- Coordenadas del mundo en metros: x hacia el este, y hacia el sur. Casilla `TM = 20` m.
- Cada modo implementa `levels()`, `create(lv, opts)`, `step(st, dt)`, `draw(g, st, vp)`, `hud(st)`, `mount(st, el)`.
- Usa `EM.headless` y `st.auto` para que el bot juegue sin interfaz.

### Reglas aprendidas (ciudad vectorial, 1.1.0)
- **Nada se dibuja por casillas en las vistas cenitales:** todo pasa por `MAP.drawTop` → `VC.drawTop`. Las casillas siguen siendo la verdad del uso del suelo (parque, agua, monte, manzana), no de la forma.
- **Cada trozo lleva 1 px de margen** y se pega con su ancho y su alto redondeados por separado: así no hay costuras.
- **Los trozos se dibujan por CPU** (`willReadFrequently`): miles de figuras pequeñas son más parejas por CPU que en la tarjeta gráfica; nunca se leen píxeles de vuelta (`getImageData`) al armar un trozo.
- **Lo que se ubica en el mapa** (carros parqueados, anclajes, vendedores, personajes, el jugador al bajarse) pasa por `VC.despeja` para no quedar dentro de un edificio; se acomoda al acercarse, no al empezar (generar todo el valle al inicio es lento).
- **Una estación es un andén sobre su línea** (`NET.at(l.P, s.s)`), dibujado con `Ciudad.banda` siguiendo la curva; en las terminales el andén entero queda hacia adentro.
- **Un edificio famoso se dibuja con su huella real** (`tools/hitos_datos.py`), nunca inventado; si OSM no lo tiene (p. ej. el Orquideorama), no se pone.
- **El metro va elevado** en las vistas con volumen: tablero, andenes, cubiertas y trenes se corren `KIND.metro.deck × VC.ob` hacia arriba; las columnas y el edificio de acceso van al piso.
- **Medir antes de afirmar:** `EM.test.selfTest()` revisa vías cargadas, edificios fuera del asfalto, andenes sobre su línea, vías sin quiebres y buses sobre las calles.

### Reglas aprendidas (casas y edificios reales, 1.2.0)
- **Las casas y los edificios son las huellas reales** (`src/data/edificios.js`, de `tools/edificios_datos.py`): 639.457 en el valle, guardadas por región de 640 m y leídas solo cuando hacen falta. La generación a lo largo de las calles queda de respaldo si faltan los datos.
- **La calle siempre libre:** huellas (Overture) y vías (EnCicla, cuantizadas a 2,5 m) vienen de fuentes distintas y se corren 1–2 m. Cada edificio se recorta contra los tramos de calle (asfalto con medio andén, peatonales, escaleras, carril del Metroplús y tranvía). El autotest exige que los bordes de carril queden libres en más del 99 %.
- **Nunca guardes en un objeto compartido una decisión tomada con la rejilla de una región:** la de una vecina no cubre todo el edificio. Mide contra datos globales (tramos de calle, hitos) y guarda el resultado en el edificio (`b.rec`).
- **La física mira también a los vecinos:** `Rg.fis` = edificios propios + los de regiones vecinas que entran en esta.
- **Un polígono que se recorta queda rectángulo:** mide la calle contra el rectángulo entero, no contra el polígono (si no, la calle que pasaba por el hueco de una L queda tapada).
- **Lo que se dibuja por miles va en lote:** árboles y casas de lejos se pintan por color con `Path2D` (un trozo de 640 m en la zona más densa pasó de 385 a ~140 ms).
- **No recompiles `dist/` mientras corren las pruebas.**
- **Cómo medir:** capturas por lugar (`geoM(lat, lon)` + `EM.map.drawTop`), tiempo de región y de trozo, y la fracción de calle bloqueada antes y después.

### Reglas aprendidas (niveles, manejo y vida, 1.3.0)
- **El mundo tiene niveles:** a ras de piso se dibuja el suelo, los andenes y lo que va abajo; luego la gente y los carros ordenados con los edificios que los tapan; luego los puentes de nivel 1, el viaducto y sus trenes, los niveles 2 y 3 y los cables. Al puente se sube por donde el tablero está bajo (< 0,9 m); de arriba solo se baja por las puntas (< 1,2 m); por la mitad se pasa por debajo.
- **Lo sólido de abajo deja libre la calle:** columnas del viaducto, pilas de puente y accesos de las estaciones no se ponen sobre una calle, un peatonal, el carril del Metroplús ni el tranvía (en el Centro las estaciones están sobre Bolívar). El autotest mide la calle tapada bajo las estaciones.
- **El tiempo no se frena con el celular:** `dt` máximo de 50 ms ponía el juego en cámara lenta bajo 20 cuadros por segundo. Los modos con `substeps` reparten el tiempo real en pasos de 1/30 s (hasta 14 por cuadro).
- **El giro lo limita el agarre:** `giroMax(V, v)` = ángulo que da la aceleración lateral `V.lat`; a 80 km/h un toque no voltea el carro y en la esquina, despacio, gira cerrado. El autotest lo comprueba en todos los vehículos.
- **Nada que se calcule cada pocos segundos debe armar regiones:** el aviso de «¿perdido?» usaba `VC.agarre` a 48 m y armaba regiones vecinas (tirones de medio segundo); se hace con las casillas de 20 m.
- **Los personajes se ubican una vez y cerca de su lugar real**; lo que dicen se marca «lo que todos saben» o «lo que pocos saben» y no lleva cifras dudosas. Revisa cada dato antes de ponerlo.
- **En este servidor, el navegador sin pantalla con la GPU emulada (swiftshader) deja de dar cuadros por segundos**, también con la 1.2.0: para medir, congela el bucle (`Game.freeze(true)`) y llama `Game.frame()` a mano, o usa `--disable-gpu`. Las capturas de página salen con el bucle congelado.

### Reglas aprendidas (vistas 3D y mapa, 1.4.0)
- **En los sombreadores, nada de coordenadas grandes en el fragmento:** en muchos celulares (y en el navegador de pruebas) el fragmento trabaja en precisión media: hasta ~16.384 y con saltos de 16 m a 27 km. Las coordenadas de textura (`vuv`), el hueco del piso lejano (`vh`) y los patrones de ventanas y luces (`vw`, con `mod`) se calculan en el vértice. Los síntomas son un piso en cuadros de 16 m, rayas y puntitos.
- **Un uniforme que usan los dos sombreadores tiene que tener la misma precisión:** por eso el vértice usa `Rv` y `Hv` propios.
- **Piso con detalle fino = mipmaps:** la textura del piso 3D (`VC.piso3D`) es de 2048 px (potencia de 2), con `generateMipmap` y filtro anisótropo; sin eso, las líneas de andén parpadean de lado.
- **Nada de comentarios `//` en medio de una línea larga que sigue después:** se tragan el resto (pasó dos veces).
- **El mapa grande congela el juego** (`Game.freeze`) y dibuja con su propio bucle; al cerrar, se descongela.

### Reglas aprendidas (terreno para el Plan único, 1.5.0)
- **Un modo nuevo:** se registra en `EM.modes`, va en `MODECARDS` (`65-menu.js`), en la lista del bot (`monkey`, `90-bot.js`) y con su ícono `ico_modo_<id>` en el arte. Mientras el ícono no llega, se agrega a `pend` en `19-atlas.js`.
- **`hud(st)` es la barra de arriba** (`Game.hud` lo llama cada 0,2 s y espera `[[rótulo, valor]]`). No uses ese nombre para dibujar.
- **Vehículos:** `VEH` en `36-libre.js`. Los que se montan llevan `monta: 1` y se dibujan con `Libre.tabla` y el personaje encima.
- **Trama en datos:** `src/data/guion.js` define `GUION = { personajes: [...], capitulos: [...] }` y se compila solo si existe. `39-gente.js` suma los personajes válidos.

### Reglas aprendidas (entregas del Plan único, 2.0.0)
- **Una entrega de otra IA es código no confiable**, aunque diga «probado»:
  - antes de aplicarla, `git apply --check` contra la versión actual;
  - busca llamadas a funciones que no existen (en la de Gemini, `G3.drawScene` o `b.teja`): el bot corre sin WebGL y no las ve;
  - mira cada cambio en una captura.
- **Mide antes de aceptar más geometría:** tiempo de `G3.buildNear` en el centro, El Poblado, Santo Domingo y Laureles, 3 pasadas, contra la versión anterior.
- **Datos del mapa: nunca coordenadas a mano.** Los deprimidos salen de Overture (`is_tunnel`) con `tools/puentes_datos.py`. En `PUENTES.B` van con nivel −1 y el alto es la profundidad.
- **Capítulos nuevos de la trama o de la historia: antes del Epílogo, nunca en medio.** El progreso se guarda por índice (`Save.d.trama.c`, `Save.d.story.ch`); también va `TRAMA_ART` en la misma posición.
- **Mallas del taller en el 3D:** `EM.taller.malla('v:' + id, () => EM.taller.vehiculo(id))` y `EM.taller.mundo(buf, x, z, y, rumbo)`. `MALLA3` (en `36-libre.js`) dice qué pieza usa cada vehículo de `VEH`.
- **`tools/build.mjs`:** la lista `data` ya trae el contenido de cada archivo; para agregar uno, empuja `limpia(read(src(…)))`, no su nombre.

### Comandos
```
node tools/build.mjs                 # dist/index.html + manifest + sw.js (revisa la sintaxis)
node tools/test.mjs 100              # servidor local + selfTest + 100 partidas automáticas + recorrido de pantallas (debe dar 0 errores)
node tools/test-servidor.mjs         # solo el servidor local (16 comprobaciones)
python3 tools/arte_juego.py          # arte/entregas/ → src/data/arte.js (+ arte/entregas/USO-EN-EL-JUEGO.md)
python3 tools/ciudad_descarga.py .cache/ciudad   # una vez: capas oficiales (barrios, manzanas, malla vial, lotes…)
python3 tools/ciudad_datos.py .cache/ciudad      # → src/data/ciudad.js (parche, barrios, calles, lotes, lugares)
node tools/osm-ventanas.mjs v.json   # verificar el mapa contra OpenStreetMap (ver docs/auditorias/)
node tools/auditoria-mapa.mjs --json m.json --img docs/auditorias/img/AAAA-MM-DD   # cifras del mapa (criterios de aceptación) y láminas; --sin-ajustes para el antes
node tools/mapa_ajustes.mjs RUTA_ENCICLA   # src/data/ajustes.js: nombres y barrios fuera de Medellín, puentes y relieve del río, escaleras, calle del tranvía, patio-taller
node tools/encicla_datos.mjs RUTA_ENCICLA  # src/data/encicla.js: las 133 estaciones de EnCicla para Ciudad Libre
python3 tools/edificios_datos.py --descargar CARPETA   # una vez: huellas y usos de Overture (duckdb) y pisos oficiales del Catastro
python3 tools/edificios_datos.py CARPETA               # → src/data/edificios.js (casas y edificios reales, canchas, piscinas y campus)
node tools/test.mjs 30 --shots DIR   # además, capturas de cada pantalla
node tools/assets.mjs                # íconos y compartir.png (el apple-touch-icon debe quedar sin transparencia)
bash tools/apk.sh -Pelmetro.versionName=X.Y.Z -Pelmetro.versionCode=N   # APK
node tools/verify-pages.mjs          # verifica la web publicada: carga, service worker, sin conexión, instalable
node tools/arte.mjs                  # regenera arte/index.html y arte/CONTEXTO-IA.md (bitácora sincronizada)
node tools/skills.mjs                # copia .agents/skills → .claude/skills y arma arte/SKILLS-IA.md
node tools/todo.mjs                  # COMPILA TODO: dist/EL-METRO-TODO.md (documento único con código), dist/El-Metro-TODO.html (con el juego) y AGENTS.md, CLAUDE.md, GEMINI.md
```
**Chromium y Playwright** ya vienen instalados (`require('playwright')`). En la nube, el 3D usa SwiftShader: lanza Chromium con `--enable-unsafe-swiftshader --use-angle=swiftshader --ignore-gpu-blocklist`.

**Capturas:**
- Llama `EM.game.freeze(true)` antes de capturar y `false` después.
- La primera captura de cada modo puede tardar mucho: reintenta con más tiempo.

### Flujo de un cambio
1. Lee la bitácora y el archivo que vas a tocar.
2. Cambia el código.
3. Compila con `node tools/build.mjs`.
4. Prueba con `node tools/test.mjs 100` (0 errores) y mira capturas en vertical (412×860) y horizontal.
5. Sube la versión en `00-core.js` (`EM.version`).
6. Actualiza la bitácora (y el plan si aplica).
7. Haz commit en la rama de trabajo.
8. Publica:
   1. copia `dist/` a la rama `gh-pages`, que lleva `.nojekyll`;
   2. espera a que el `sw.js` publicado muestre la nueva caché;
   3. corre `node tools/verify-pages.mjs`.

### Diseño y seguridad (desde v0.8.0)
- **Diseño:** noche del valle, concreto, andén blanco y el color de cada línea; la franja de las 11 líneas bajo las barras. El inicio es un diagrama de línea (`.linea`, `.parada`, `.tren`). Los modos son filas con `--c` = color de su línea (`.modo`, clases `c-*`). Nada de estética de revista: sin etiquetas en mayúsculas espaciadas, sin bordes negros gruesos.
- **Seguridad:** todo lo que llega de otro celular pasa por `Multi.onmsg`, que valida por tipo; los nombres, por `Multi.nombre`. En HTML se usa siempre `esc()`. La CSP de `src/head.html` no deja conexiones externas: si una función nueva necesita una, decide si de verdad hace falta. El autotest prueba importar con `__proto__` y mensajes malformados.
- **Comentarios:** dentro de una línea de código compacta, usa `/* … */`, nunca `//`, porque `//` anula el resto de la línea.
- **Publicación:** `tools/build.mjs` quita los comentarios de línea completa. No escribas código en la misma línea que un bloque `/* */` que ocupa varias líneas.

### Errores conocidos
- Wikimedia y Flickr bloquean descargas desde servidores en la nube. Para referencias, usa enlaces con su licencia (ver `arte/galeria.md`).
- No uses capturas de Google Maps ni de Google Earth como base de arte.
- El tamaño del HTML importa. Desde v1.2.0 pesa unos 8 MB: 4,5 MB son las casas y edificios reales (`src/data/edificios.js`) y 0,5 MB el arte. El arte nuevo va en WebP pequeño o SVG minificado, dentro de `src/data/arte.js`. Antes de sumar datos, mide qué flujo pesa más (posiciones, medidas, ángulos, polígonos).
- Lo que el bot no ve (tarjetas, diálogos, portada) se revisa con capturas: en v0.6.0 un comentario anuló una línea y solo se notó en la captura.
- El mapa cenital: mide las vías **con las de su mismo tipo** (en los datos, autopista, avenida y viaducto vienen pegados) y revisa el banco de sitios reales (Niquía, Acevedo, San Antonio, Parque Berrío, Santo Domingo, Poblado, Industriales, Floresta) a k = 2,1, 1 y 0,42.


---

# Skill · el-metro-arte

```yaml
name: el-metro-arte
description: Dirección de arte y producción de imágenes para el videojuego "El Metro" (Metro de Medellín). Cubre las paletas HEX, las vistas y escalas, los personajes y las reglas (sin texto ni logos, fondo magenta); el reparto de encargos entre Gemini Nano Banana (G-) y ChatGPT (C-); y la revisión, entrega e integración del arte al juego. Úsala al generar, encargar, revisar o integrar cualquier imagen, sprite, ícono, panorámica o mosaico del juego.
```

## El Metro · arte

### Dónde está todo
| Archivo | Qué contiene |
|---|---|
| `arte/06-guia-unica-ia.md` | **Guía única**: contexto completo, roles, encargos G‑ y C‑, correcciones, entrega y bitácora |
| `arte/CONTEXTO-IA.md` | Contexto y bitácora en un archivo, para subir a un Gem o a un Proyecto |
| `arte/00-biblia-de-estilo.md` | Reglas visuales completas |
| `arte/01` a `arte/05` | Referencias de juegos, Medellín visual, historia, folclor y fiestas, diseño |
| `arte/galeria.md` | Fotos de referencia con licencia libre |

### Concepto
**“Medellín de verdad, dibujada con cariño”.**
- Ciudad vista desde arriba en pixel art denso y acogedor.
- Panorámica de siluetas por capas con bruma.
- Vista isométrica dimétrica 2:1.
- 3D low‑poly limpio.
- Interfaz editorial con los colores de las líneas del Metro como acentos.

> El fondo crema de la interfaz (`#f1ece0`) es **decisión del autor**: viene de la revista EMSAY. Si otra skill de diseño lo marca como cliché, se mantiene igual.

### Reglas para toda imagen
- Luz desde arriba a la izquierda; **sin sombra proyectada** (la pone el juego).
- Contorno `#141414` fino en personajes y vehículos.
- Máximo 32 colores, tomados de la paleta.
- **Fondo magenta plano `#FF00FF`** o transparente; nunca blanco.
- **Prohibido:** texto (salvo pedido y en español), logos o marcas reales, marcas de agua, violencia, alcohol, cigarrillo y pólvora en manos de niños.
- Arte **original**: no se copian juegos ni artistas.
- No se usan capturas de Google Maps ni de Google Earth como base.

### Paletas clave
**Líneas:**

| A | B | T | K | J | H | L | M | P | MP1 | MP2 |
|---|---|---|---|---|---|---|---|---|---|---|
| `#1C5C9C` | `#E38835` | `#59AB42` | `#B8CF40` | `#F6C538` | `#EB318E` | `#8E612A` | `#743D90` | `#EC343A` | `#0E6F76` | `#65A9AC` |

**Ciudad:**
- asfalto `#3b3f45`
- andén `#c9c1ad`
- ladrillo `#b4583a` y `#9a4630`
- teja `#a8452f`
- losa `#9e9a92`
- pasto `#4f8a3c`
- árbol `#2f6b35`
- río `#5f7f73`
- concreto `#a9a59b`
- vidrio `#9fd3e6`

**Interfaz:**
- papel `#f1ece0`
- tinta `#154a80`
- negro `#141414`
- manteca `#fbe7b0`

### Vistas y escalas
| Vista | Regla |
|---|---|
| Cenital 3/4 | ~15° de inclinación; casilla de 20 m (entrega a 64 px por casilla) |
| Sprites de vehículos | Vista superior pura, mirando a la derecha, **1 m = 8 px** |
| Peatones | 16×16 px por cuadro, 4 cuadros |
| Panorámica | Perfil puro, sin cielo, capas anchas (21:9 o más) |
| Isométrica | Dimétrica 2:1 (~26,6°) |
| Cabina | 9:16 y 16:9, con el parabrisas en magenta |
| Retratos | Busto 3/4 mirando a la derecha |
| Íconos | 128 px, planos, contorno grueso |

### Reparto de encargos
- **Gemini Nano Banana, encargos G‑:** ancla de estilo (G‑00), personajes, foto → estilo, variantes de hora y fiesta, casas de barrio, panorámicas (G‑70 a G‑73), ambientes de fiesta (G‑80 a G‑86), conceptos isométricos (G‑90) y repintado de mosaicos base (G‑100).
- **ChatGPT, encargos C‑:** sprites cenitales con transparencia, íconos e insignias, cabina, letreros, portadas, decoraciones de fiesta y texturas (C‑60).
- Cada IA **solo hace lo suyo**. Los prompts exactos están en la guía única.

### Revisión (antes de aceptar una imagen)
1. ¿La vista es correcta?
2. ¿Los colores son de la paleta y la línea tiene su color?
3. ¿El fondo es plano?
4. ¿No tiene sombra proyectada, ni texto, ni logos?
5. ¿Se lee bien en pequeño?
6. ¿Tiene el nombre exacto del encargo (minúsculas, sin tildes)?

### Integración al juego (así se hizo en v0.6.0)
1. Lo entregado va en `arte/entregas/laminas/` o `arte/entregas/vectorial/`, con el **nombre del encargo** (por ejemplo `G-01-03_rosalba.jpg`). El inventario y la verificación van en `arte/entregas/INVENTARIO.md`.
2. Se agrega la receta en `tools/arte_juego.py` (id, archivo, tipo, caja de recorte, ancho final y uso). Los tipos:
   - `retrato`: dentro del marco, sin fondo;
   - `busto` y `magenta`: sin el fondo magenta conectado al borde, así no se borran los rosados interiores;
   - `escena`: recorte y WebP;
   - los SVG de ChatGPT se minifican tal cual.
3. `python3 tools/arte_juego.py` genera `src/data/arte.js` y `arte/entregas/USO-EN-EL-JUEGO.md`. Las cajas de recorte salen de una segmentación del fondo magenta.
4. En el código se usa `Atlas` (`src/js/19-atlas.js`), siempre con respaldo procedural:
   - `Atlas.tag(id)` para la interfaz;
   - `Atlas.img(id)` para el lienzo;
   - `Atlas.retrato(quien, frase)` para los diálogos;
   - `Atlas.fiesta()` para los adornos.
   - El autotest (`Atlas.check`) exige que existan las piezas que el juego nombra.

   | Arte | Archivo |
   |---|---|
   | Casillas | `10-map.js` |
   | Sprites | `21-sprites.js` |
   | Capas | `23-lado.js` |
   | Vehículos de perfil | `30-conduce.js`, `52-cableviaje.js` |
   | Consola | `31-cabina.js` |
   | Retratos y tarjetas de capítulo | `37-trama.js` |
   | Portada, íconos de modos e historia | `65-menu.js` |
   | Medallas | `66-vida.js` |

### Reglas aprendidas en la entrega 1 (nov‑2026)
Las propusieron Gemini y ChatGPT y se comprobaron al integrar:
1. **Retratos en la misma posición** en cada gesto (mismo encuadre y altura de ojos): así se cambian sin saltos.
2. **Fondo magenta plano** incluso dentro de los marcos: el recorte lo quita solo.
3. **No escribas códigos HEX en el texto de un prompt de imagen:** el modelo puede dibujarlos como letras. Nombra el color (“azul metro”) y adjunta la paleta como imagen.
4. **Grilla de píxel entera**, sin mezclar tamaños de píxel (nada de *mixels*); máximo 2 tonos por superficie más el contorno.
5. **No mezcles vistas:** cenital 3/4 (casillas) e isométrica 2:1 (maqueta) van en láminas separadas.
6. **Cero sombras proyectadas:** las pone el juego.
7. **Entrega también la fuente** (SVG o el script que la genera): con eso se recuperó todo lo de ChatGPT aunque faltó el ZIP.
8. **Distingue las evidencias:** “sintaxis válida”, “prueba ejecutada” y “partida real jugada” son cosas distintas. No digas “probado” si solo validaste archivos.
9. **Lo que dices del mundo real, verifícalo:** la “Línea O” es de buses por la 80, no del Metro de la 80 (será la Línea E, rosada).
   | Íconos | menús |
   | Isométrico | vista nueva (ver skill `medellin-fiel`) |
6. Se prueba con `node tools/test.mjs 100` y capturas, y se publica (skill `el-metro-desarrollo`).


---

# Skill · medellin-fiel

```yaml
name: medellin-fiel
description: Fidelidad geográfica de Medellín en el videojuego "El Metro" (Fase 1b del plan). Cubre topografía y relieve, río, vías, viaducto y estaciones del metro, cables sobre las lomas, alturas de edificios, lugares icónicos y la vista isométrica dimétrica 2:1 (mosaicos base desde datos abiertos más repintado con IA). Úsala al tocar el mapa, el relieve, las vistas cenital, panorámica, 3D o isométrica, o al generar o repintar mosaicos de la ciudad.
```

## Medellín fiel e isométrica

### Objetivo
Que la topografía, el relieve, el río, las vías y las estructuras de Medellín sean **fieles**, y crear una **ciudad en miniatura en proyección dimétrica 2:1**, como los mapas de ciudades reales en pixel art. Hoy el juego tiene detalles mal diseñados:
- relieve suavizado (modelo de 80 m);
- laderas sin escalonamiento;
- viaducto y estaciones con alturas y formas aproximadas;
- cables que no siguen bien las lomas;
- alturas de edificios genéricas;
- lugares icónicos sin forma propia.

### Datos actuales del juego
- `src/data/valle.js`: casillas de 20 m con tipo de suelo (`TT.*`) y relieve de 80 m (`MAP.elevM`, `MAP.tileM`, `MAP.bHeight`), tomado de “Juega EnCicla” (OpenStreetMap + SRTM).
- `src/data/red.js`: líneas y estaciones; `NET` las convierte en recorridos (`NET.at(P, s)`).
- `src/data/rutas.js` (recorridos de buses, `tools/rutas.mjs`) y `src/data/lugares.js` (lugares con postal).

### Fuentes abiertas para mejorar
*(Verificar cobertura y licencia antes de usar.)*

| Fuente | Qué aporta | Licencia |
|---|---|---|
| **OpenStreetMap** | Calles, edificios, río, parques | ODbL; atribución “© OpenStreetMap contributors” |
| **Overture Maps** | Huellas de edificios (con datos de Microsoft y Google) y alturas cuando existen | CDLA o ODbL según la capa |
| **Google Open Buildings 2.5D Temporal** | Ráster de alturas desde satélite; tinyworlds lo calibra con edificios de pisos conocidos | CC BY 4.0 *(cobertura en Colombia sin verificar)* |
| **Copernicus GLO‑30** | Relieve de 30 m, mejor que los 80 m actuales | Libre con atribución |
| Datos de la Alcaldía de Medellín y el Área Metropolitana (MEData, GeoMedellín) | Posible modelo de terreno más fino, catastro, red vial | *(sin verificar)* |

**Prohibido:** usar imágenes de Google Maps o de Google Earth como base (sus términos lo restringen).

**Meta de datos compactos:** 1 byte de altura por casilla de 20 m, más el tipo de techo y la forma de los lugares icónicos. Todo comprimido y embebido; el juego genera las vistas en el celular.

### Proyección dimétrica 2:1
El “isométrico” de pixel art es **dimétrico 2:1**: por cada píxel hacia arriba, dos hacia el lado (unos 26,565°).

Con la convención del juego (metros; x al este, y al sur, z hacia arriba; `s` = píxeles por metro):
```
pantallaX = (x − y) · s
pantallaY = (x + y) · s / 2 − z · s · kz      (kz ≈ 0,8 a 1; ajústalo para que las alturas se vean naturales)
```
Se dibuja de atrás hacia adelante (orden por x + y), con caras visibles al sur y al este y luz desde arriba a la izquierda.

### Tubería
1. **Datos** (`tools/`): descargar y reducir las fuentes a la grilla de 20 m (alturas, techos), cambiar el relieve a 30 m y medir viaducto, estaciones y torres de cable.
2. **Escena real:** terreno; edificios con su altura; río canalizado; jerarquía vial (autopistas, la 80, Las Vegas, Las Palmas, Regional); viaducto con su altura; estaciones con cubierta, accesos y puentes; torres de cable con la curva del cable sobre el terreno. Lugares icónicos: Catedral, Coltejer, Nutibara con el Pueblito Paisa, El Volador, Biblioteca España, estadio y Olaya Herrera.
3. **Vista isométrica procedural** en el juego: nueva vista de Ciudad Libre y maqueta en La Red, generada en el celular desde los datos, con el pixel art del juego (enfoque tipo tinyworlds).
4. **Mosaicos base 2:1** de las zonas héroe (centro, estaciones, lugares icónicos) con la geometría real. **Gemini los repinta** (encargo G‑100) sin mover nada. El resto queda procedural para mantener el peso bajo.
5. **Corregir las otras vistas** con la misma escena:
   - cenital: alturas y sombras;
   - panorámica: perfiles de relieve de 30 m;
   - 3D: viaducto y estaciones medidos.
6. **Verificación:** comparar capturas con las fotos de `arte/galeria.md` y con el mapa, y llevar la lista de detalles corregidos en la bitácora.

### Referencias
- [Isometric Cities](https://isometriccities.com/): directorio y técnicas. Hay tres caminos:
  1. IA que repinta mosaicos;
  2. render por código desde datos abiertos;
  3. diorama 3D con cámara isométrica.
- Ciudades de ejemplo: [Isometric NYC](https://www.pcgamer.com/software/ai/software-engineer-creates-classic-simcity-style-map-of-nyc-and-argues-that-ai-is-good-for-creatives-actually/) (IA ajustada para repintar), [Tiny Barcelona](https://tiny-barcelona.agenturl.dev), [Tiny Madrid](https://tinymadrid.app), [Tiny València](https://tinyvalencia.com) (datos 3D del Catastro y el IGN repintados), [Isometric Málaga](https://isometric-malaga.xiangminf.com), [CDMX](https://cdmxisometrico.com), [Buenos Aires](https://caba.nicolaspoore.com).
- [tinyworlds](https://github.com/nihey/tinyworlds): sin IA. Toma OpenStreetMap y Overture Maps, hace un rasterizado por software y arma una pirámide de teselas. Una ciudad grande pesa unos 1,5 GB: por eso aquí se genera en el dispositivo.

### Datos oficiales abiertos (desde v0.7.0)
La Alcaldía de Medellín publica en ArcGIS Online (cuenta `services1.arcgis.com/FZVaYraI7sEGQ6rF`, unas 525 capas públicas):
- barrios (`shp_limite_barrio_vereda_cata`) y manzanas;
- **malla vial 2026**, con nomenclatura (`via_gen`: CL 50, CR 80…) y **ancho** en metros;
- jerarquía vial con nombres populares e inventario de espacio público;
- **lotes catastrales**: 312 mil, con centroide y área.

Los usa `tools/ciudad_descarga.py` + `tools/ciudad_datos.py`.

**Licencia del Catastro:** citar “Fuente: Portal de Datos Abiertos Subsecretaria de Catastro del Municipio de Medellín, Colombia www.medellin.gov.co/geomedellin” y declarar las transformaciones (ver `docs/FUENTES.md`).

**Lección medida:** en el mapa base, casi todas las casillas “andén” (88–97 %) eran lotes dentro de manzanas. Antes de dibujar, cruza con las manzanas.

### Medellín desde el aire (desde v1.2.0)
- Investigación completa, con créditos de cada foto: `docs/investigacion/medellin-desde-el-aire.md`. Solo fotos con licencia libre (Wikimedia Commons) y datos abiertos; **nunca imágenes de Google Maps ni de Google Earth**.
- **Huella real, material por zona:** la forma y la posición de cada casa son las reales (Overture: OSM, Microsoft y Google Open Buildings). Los pisos son oficiales en Popular, El Poblado y Robledo (Catastro, capa `3DConstruccciones`), de OSM donde existen y estimados por zona en el resto. Muros, techos y árboles salen de la zona (`VC.zona`: comuna o municipio).
- **Lo que se ve desde arriba:**
  - El fondo plano del valle (Laureles, Belén, Centro, alrededores del aeropuerto) es terracota: teja de barro.
  - Las laderas populares son claras: fibrocemento y zinc sobre ladrillo, planchas con tanque, escaleras con baranda amarilla.
  - El Poblado son torres de ladrillo de 12 a 30 pisos en el bosque.
  - El Centro es fachada continua ocre y de ladrillo, con teja vieja y azoteas.
- **La Alpujarra:** la Alcaldía y la Gobernación son bloques blancos con fachada inclinada, parteluces y culatas macizas (estilo `alpujarra` de `11-hitos.js`).

### Medir antes y después (desde la auditoría del 17‑nov)
- `node tools/auditoria-mapa.mjs` da las cifras que sirven de criterio de aceptación:
  - nombres de calle y barrios por municipio;
  - estaciones sin huella o sobre edificios;
  - trazo del metro y del tranvía sobre casas;
  - cortes y subidas del río;
  - manchones de agua y escaleras sueltas;
  - relieve.
- Con `--img` dibuja las láminas.
- Hoja de ruta M1–M12 con sus metas en `docs/auditorias/2026-11-17-auditoria-juego-y-mapa.md`.
- **Toda mejora del mapa se entrega con su cifra de antes y de después.**
- **Ajustes del mapa base (v0.10.0):** `tools/mapa_ajustes.mjs` corre el juego con `window.__sinAjustes` y escribe `src/data/ajustes.js`; `MAP.ajustes()` los aplica al cargar y `MAP.estaciones()` marca las huellas de estación cuando la red ya existe.
  - El orden importa: capa oficial → nombres y barrios extra (mismo orden de casillas de vía) → cambios de casillas → huellas.
- **Juega EnCicla** usa la misma cuadrícula y el mismo relieve: lo que se corrija aquí sirve allá, y al revés (ver `docs/auditorias/2026-11-17-auditoria-encicla-v1.2.md`).
- **Relieve:** SRTM y Copernicus son modelos de **superficie**: miden copas de árboles, puentes y muros, no el agua. Antes de usar el relieve en el río hay que “quemar” el cauce para que siempre baje (regresión isotónica a lo largo del recorrido).

Bello y los demás municipios del norte y del sur aún no tienen capa abierta de barrios. Nominatim limita a las IP de la nube (error 429): no insistas.

