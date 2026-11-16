# El Metro · La última vuelta

Videojuego **offline** (un solo HTML) sobre el Metro de Medellín y el Valle de Aburrá. **Ciudad Libre**: recorre el valle real a pie, en taxi, bici, moto o bus, o de pasajero en el metro, el tranvía y los cables (estilo GTA 1/2), con peatones, tráfico, día y noche, clima y fechas de la ciudad. Además: conduce trenes, tranvía, Metroplús y alimentadores en 3D; despacha agujas; controla semáforos; opera y arma metrocables; gestiona la red. Historia: Rosalba, conductora del primer tren (1995), en su última semana.

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
Bitácora para retomar el trabajo: `docs/BITACORA.md`.
