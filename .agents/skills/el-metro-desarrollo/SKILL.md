---
name: el-metro-desarrollo
description: Cómo trabajar en el código del videojuego "El Metro" (Metro de Medellín). Explica la estructura de un solo HTML sin librerías, el mapa de módulos en src/js, la compilación, las pruebas con bot y 100 partidas, las capturas en Chromium, la APK de Android, la publicación en GitHub Pages y la bitácora. Úsala siempre que vayas a leer, modificar, probar, compilar o publicar el juego.
---

# El Metro · desarrollo

## Qué es
Videojuego **offline** de mundo abierto + arcade sobre el Metro de Medellín, para todo público y para celulares modestos. Se entrega como **un solo `index.html`** (PWA en GitHub Pages) y como **APK** de Android (WebView).
- **Misión:** que cualquiera conozca, use y quiera la red y la ciudad jugando.
- **Visión:** el gran juego de Medellín, fiel a la ciudad.

**Antes de tocar nada, lee:**
- `docs/BITACORA.md`: estado, historial y pendientes.
- `docs/PLAN.md`: fases.
- `arte/README.md`: arte.

## Protocolo
Antes de trabajar, sigue el **PROTOCOLO PARA TODA IA** (`arte/PROTOCOLO-IA.md`, también en `AGENTS.md`):
1. lee todo;
2. reflexiona;
3. responde el cuestionario;
4. prueba;
5. auto‑ajústate;
6. haz solo lo tuyo;
7. entrega y registra.

## Reglas que no se rompen
1. **Un solo HTML, sin librerías externas ni internet** en tiempo de juego. Todo va embebido (datos, fuentes, arte).
2. **Celulares modestos:** cuida los ms por cuadro, cachea lo dibujado y evita asignar memoria en el bucle.
3. **Español** en todo el juego y en los textos; **todo público** (sin violencia).
4. **No romper el guardado** (`localStorage` clave `elmetro.v1`, objeto `Save.d`). Si agregas campos, que tengan valor por defecto.
5. **El arte nuevo siempre va con respaldo:** si falta una imagen, sigue el dibujo procedural actual.
6. **Cerrar cada sesión actualizando `docs/BITACORA.md`**: qué cambió, qué se probó y qué falta.

## Mapa del código (`src/js/*.js` se concatenan en orden)
| Archivo | Qué hace |
|---|---|
| `00-core.js` | `EM`, `Save`, sonido y música generativa, `UI`, utilidades |
| `10-map.js` | Mapa real (casillas de 20 m, `TT.*`), relieve, rótulos, barrios; delega el dibujo cenital en `VC` |
| `11-ciudad2.js` | **Ciudad vectorial `VC`** (1.1.0): calles con curva desde `VIAS`, suelo sin escalones (cuadrados marchantes), casas y edificios generados a lo largo de cada calle por regiones de 640 m, choques (`VC.solid`, `VC.agarre`, `VC.despeja`), 4 niveles de detalle con presupuesto por cuadro y trozos por adelantado (`VC.prefetch`), rótulos y postes sobre las calles |
| `11-hitos.js` | **Arquitectura icónica** (`HITOS`): huella real de OSM, estilos de dibujo propios (`aguja`, `basilica`, `iglesia`, `palacio`, `estadio`, `rocas`, `vidrio`, `ladrillo`, `republicano`, `moderno`, `cupula`, `cubos`, `luces`, `botero`, `pies`); reserva su huella en la región y es sólida |
| `12-red.js` | Red de transporte `NET` (líneas, estaciones, recorridos). A, B y T usan el eje real de `RIELES`; los buses, `RUTAS_CALLES`; cada estación queda sobre su línea |
| `18-mundo.js` | Reloj del juego, clima y fechas de Medellín |
| `19-atlas.js` | `Atlas`: arte de las IA (`src/data/arte.js`) con respaldo procedural: `has`, `url`, `img`, `tag`, `ico`, `retrato`, `fiesta`, `check` |
| `20-art.js` / `21-sprites.js` | Paleta `PAL` y sprites procedurales |
| `22-gl.js` | Motor 3D WebGL1 propio `G3` |
| `23-lado.js` | Panorámica lateral por capas |
| `24-iso.js` | Maqueta 2:1: el valle en proyección dimétrica, dibujado por columnas con búfer de altura (`Iso.render`, `Iso.P`, `Iso.Pi`, `Iso.rot`) |
| `25-game.js` | Bucle de juego, HUD, pausa, `Game.freeze()` |
| `30-conduce.js` / `31-cabina.js` | Metro y tranvía (panorámica, cabina, ATP, procedimiento) |
| `35-ciudad.js` | Tráfico, peatones, perros, transporte en la ciudad |
| `36-libre.js` / `37-trama.js` | Ciudad Libre e historia jugable en la ciudad |
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

## Reglas aprendidas (ciudad vectorial, 1.1.0)
- **Nada se dibuja por casillas en las vistas cenitales:** todo pasa por `MAP.drawTop` → `VC.drawTop`. Las casillas siguen siendo la verdad del uso del suelo (parque, agua, monte, manzana), no de la forma.
- **Cada trozo lleva 1 px de margen** y se pega con su ancho y su alto redondeados por separado: así no hay costuras.
- **Los trozos se dibujan por CPU** (`willReadFrequently`): miles de figuras pequeñas son más parejas por CPU que en la tarjeta gráfica; nunca se leen píxeles de vuelta (`getImageData`) al armar un trozo.
- **Lo que se ubica en el mapa** (carros parqueados, anclajes, vendedores, personajes, el jugador al bajarse) pasa por `VC.despeja` para no quedar dentro de un edificio; se acomoda al acercarse, no al empezar (generar todo el valle al inicio es lento).
- **Una estación es un andén sobre su línea** (`NET.at(l.P, s.s)`), dibujado con `Ciudad.banda` siguiendo la curva; en las terminales el andén entero queda hacia adentro.
- **Un edificio famoso se dibuja con su huella real** (`tools/hitos_datos.py`), nunca inventado; si OSM no lo tiene (p. ej. el Orquideorama), no se pone.
- **El metro va elevado** en las vistas con volumen: tablero, andenes, cubiertas y trenes se corren `KIND.metro.deck × VC.ob` hacia arriba; las columnas y el edificio de acceso van al piso.
- **Medir antes de afirmar:** `EM.test.selfTest()` revisa vías cargadas, edificios fuera del asfalto, andenes sobre su línea, vías sin quiebres y buses sobre las calles.

## Comandos
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

## Flujo de un cambio
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

## Diseño y seguridad (desde v0.8.0)
- **Diseño:** noche del valle, concreto, andén blanco y el color de cada línea; la franja de las 11 líneas bajo las barras. El inicio es un diagrama de línea (`.linea`, `.parada`, `.tren`). Los modos son filas con `--c` = color de su línea (`.modo`, clases `c-*`). Nada de estética de revista: sin etiquetas en mayúsculas espaciadas, sin bordes negros gruesos.
- **Seguridad:** todo lo que llega de otro celular pasa por `Multi.onmsg`, que valida por tipo; los nombres, por `Multi.nombre`. En HTML se usa siempre `esc()`. La CSP de `src/head.html` no deja conexiones externas: si una función nueva necesita una, decide si de verdad hace falta. El autotest prueba importar con `__proto__` y mensajes malformados.
- **Comentarios:** dentro de una línea de código compacta, usa `/* … */`, nunca `//`, porque `//` anula el resto de la línea.
- **Publicación:** `tools/build.mjs` quita los comentarios de línea completa. No escribas código en la misma línea que un bloque `/* */` que ocupa varias líneas.

## Errores conocidos
- Wikimedia y Flickr bloquean descargas desde servidores en la nube. Para referencias, usa enlaces con su licencia (ver `arte/galeria.md`).
- No uses capturas de Google Maps ni de Google Earth como base de arte.
- El tamaño del HTML importa: hoy pesa unos 2,4 MB (533 KB son arte). El arte nuevo va en WebP pequeño o SVG minificado, dentro de `src/data/arte.js`.
- Lo que el bot no ve (tarjetas, diálogos, portada) se revisa con capturas: en v0.6.0 un comentario anuló una línea y solo se notó en la captura.
- El mapa cenital: mide las vías **con las de su mismo tipo** (en los datos, autopista, avenida y viaducto vienen pegados) y revisa el banco de sitios reales (Niquía, Acevedo, San Antonio, Parque Berrío, Santo Domingo, Poblado, Industriales, Floresta) a k = 2,1, 1 y 0,42.
