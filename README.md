# El Metro · La última vuelta

Videojuego **offline** (un solo HTML) sobre el Metro de Medellín, construido sobre el **mapa real** del Valle de Aburrá. Un solo mundo con módulos de simulación: **Ciudad Libre** (mundo abierto cenital estilo GTA 1/2: a pie, taxi, bici, moto, o de pasajero en metro, tranvía, cables y buses), **Bus** (simulador cenital de Metroplús y alimentadores de estación a estación, con pasajeros, semáforos y tráfico), **Metro** (vista panorámica 2D del valle y cabina en primera persona), **Metrocable**, guía para aprender a usar el Metro, historia de Rosalba, multijugador local y extras arcade. Día y noche, clima y fechas reales de Medellín.

- **Jugar en la web:** https://juanfeliperico369-stack.github.io/MetroZero/
- **Android:** https://juanfeliperico369-stack.github.io/MetroZero/el-metro.apk

## Construir
```
node tools/rutas.mjs     # recorridos de buses por calles reales (A*) → src/data/rutas.js
node tools/build.mjs     # dist/index.html + manifest + sw.js
node tools/assets.mjs    # íconos y compartir.png (Chromium/Playwright)
node tools/test.mjs 100  # bot: selfTest + 100 partidas + recorrido de la interfaz
bash tools/apk.sh        # dist/el-metro.apk (ver android/README.md)
node dist/server.mjs     # servidor local para jugar en red sin internet
```
Código en `src/js/*.js` (se concatenan en orden). Datos: `src/data/valle.js` (mapa OSM/SRTM de Juega EnCicla), `src/data/red.js` (líneas, estaciones, datos y trivia; fuentes en `docs/FUENTES.md`).
La historia "La última vuelta" se juega dentro de Ciudad Libre (`src/js/37-trama.js`): caminar, abordar líneas reales, hablar con los personajes y pasar a manejar.
Bitácora para retomar el trabajo: `docs/BITACORA.md` · plan: `docs/PLAN.md` · encargos para otras IA: `docs/PROMPTS-IA.md`.
