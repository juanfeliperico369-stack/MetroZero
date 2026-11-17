# El Metro · La última vuelta

Videojuego **offline** (un solo HTML) sobre el Metro de Medellín, construido sobre el **mapa real** del Valle de Aburrá. Un solo mundo con módulos de simulación: **Ciudad Libre** (mundo abierto cenital estilo GTA 1/2: a pie, taxi, bici, moto, o de pasajero en metro, tranvía, cables y buses), **Bus** (simulador cenital de Metroplús y alimentadores de estación a estación, con pasajeros, semáforos y tráfico), **Metro** (vista panorámica 2D del valle y cabina en primera persona), **Metrocable**, guía para aprender a usar el Metro, historia de Rosalba, multijugador local y extras arcade. Día y noche, clima y fechas reales de Medellín.

- **Jugar en la web:** https://juanfeliperico369-stack.github.io/MetroZero/
- **Android:** https://juanfeliperico369-stack.github.io/MetroZero/el-metro.apk

## Construir
```
node tools/rutas.mjs     # recorridos de buses por calles reales (A*) → src/data/rutas.js
node tools/build.mjs     # dist/index.html + manifest + sw.js
node tools/assets.mjs    # íconos y compartir.png (Chromium/Playwright)
node tools/test.mjs 100  # servidor local + selfTest + 100 partidas + recorrido de la interfaz
python3 tools/arte_juego.py  # arte/entregas → src/data/arte.js
bash tools/apk.sh        # dist/el-metro.apk (ver android/README.md)
node dist/server.mjs     # servidor local para jugar en red sin internet
```
Código en `src/js/*.js` (se concatenan en orden). Datos: `src/data/valle.js` (mapa OSM/SRTM de Juega EnCicla), `src/data/red.js` (líneas, estaciones, datos y trivia; fuentes en `docs/FUENTES.md`).
La historia "La última vuelta" se juega dentro de Ciudad Libre (`src/js/37-trama.js`): caminar, abordar líneas reales, hablar con los personajes y pasar a manejar.
## Mapa del repositorio
| Carpeta | Qué hay |
|---|---|
| `src/` | El juego: `head.html`, `body.html`, `style.css`, `js/*.js` (módulos en orden) y `data/` (`valle.js` mapa OSM/SRTM de Juega EnCicla, `red.js`, `rutas.js`, `lugares.js` y `arte.js`, el arte embebido) |
| `tools/` | Compilar (`build.mjs`), probar (`test.mjs`, `test-servidor.mjs`), arte (`arte_juego.py`, `assets.mjs`, `arte.mjs`), documentos (`todo.mjs`, `skills.mjs`), APK (`apk.sh`), servidor local (`server.mjs`), verificación contra OpenStreetMap (`osm-ventanas.mjs`, `osm_comparar.py`) |
| `arte/` | Biblia de estilo, referencias, Medellín, historia, folclor, diseño, **guía única para las IA** (`06-guia-unica-ia.md`) y **entregas** de Gemini y ChatGPT (`entregas/`, con su inventario) |
| `docs/` | `BITACORA.md` (estado e historial), `PLAN.md` (fases), `FUENTES.md`, `auditorias/` (servidor local, fidelidad del mapa) y lo histórico |
| `.agents/skills/`, `.claude/skills/` | Skills del proyecto para las IA (`el-metro-desarrollo`, `el-metro-arte`, `medellin-fiel`…) |
| `android/` | Envoltorio WebView para la APK |

Para retomar el trabajo: `docs/BITACORA.md` → `docs/PLAN.md` → `arte/README.md`. Instrucciones para agentes: `AGENTS.md`, `CLAUDE.md` y `GEMINI.md`, que genera `node tools/todo.mjs`.
