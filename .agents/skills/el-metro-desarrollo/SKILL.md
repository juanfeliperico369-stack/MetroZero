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
| `10-map.js` | Mapa real (casillas de 20 m, `TT.*`), relieve, trozos cenitales en caché |
| `12-red.js` | Red de transporte `NET` (líneas, estaciones, recorridos) |
| `18-mundo.js` | Reloj del juego, clima y fechas de Medellín |
| `20-art.js` / `21-sprites.js` | Paleta `PAL` y sprites procedurales |
| `22-gl.js` | Motor 3D WebGL1 propio `G3` |
| `23-lado.js` | Panorámica lateral por capas |
| `25-game.js` | Bucle de juego, HUD, pausa, `Game.freeze()` |
| `30-conduce.js` / `31-cabina.js` | Metro y tranvía (panorámica, cabina, ATP, procedimiento) |
| `35-ciudad.js` | Tráfico, peatones, perros, transporte en la ciudad |
| `36-libre.js` / `37-trama.js` | Ciudad Libre e historia jugable en la ciudad |
| `38-bus.js` | Simulador de bus (Metroplús y alimentadores) |
| `52-cableviaje.js` | Metrocable |
| `60-mapa.js` / `65-menu.js` / `66-vida.js` / `67-guia.js` / `70-historia.js` | La Red, menús, misiones y logros, guía, historia clásica |
| `80-multi.js` / `06-net.js` / `05-qr.js` | Multijugador local (WebRTC/QR, servidor local) |
| `90-bot.js` | `EM.test.selfTest()` y partidas automáticas (monkey) |

Datos en `src/data/`:
- `valle.js`: mapa y relieve de EnCicla;
- `red.js`: líneas y estaciones;
- `rutas.js`: recorridos de buses por calles reales;
- `lugares.js`: lugares con postal.

**Convenciones:**
- Coordenadas del mundo en metros: x hacia el este, y hacia el sur. Casilla `TM = 20` m.
- Cada modo implementa `levels()`, `create(lv, opts)`, `step(st, dt)`, `draw(g, st, vp)`, `hud(st)`, `mount(st, el)`.
- Usa `EM.headless` y `st.auto` para que el bot juegue sin interfaz.

## Comandos
```
node tools/build.mjs                 # dist/index.html + manifest + sw.js (revisa la sintaxis)
node tools/test.mjs 100              # selfTest + 100 partidas automáticas + recorrido de pantallas (debe dar 0 errores)
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

## Errores conocidos
- Wikimedia y Flickr bloquean descargas desde servidores en la nube. Para referencias, usa enlaces con su licencia (ver `arte/galeria.md`).
- No uses capturas de Google Maps ni de Google Earth como base de arte.
- El tamaño del HTML importa: hoy pesa unos 1,8 MB. El arte nuevo va en atlas comprimidos.
