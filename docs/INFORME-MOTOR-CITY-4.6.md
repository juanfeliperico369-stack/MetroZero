# Informe de Motor City 4.6 para El Metro

> **Para la IA que siga con El Metro.** Lo escribió Claude el 21‑nov‑2026. Complementa a `docs/INFORME-MOTOR-CITY-4.5.md` (que sigue valiendo): **El Metro sigue con su propio motor** y recibe Motor City solo como referencia en `motor-city/`.

## 1. Lo que pidió el autor en esta ronda
- «Injugables: toscos como GTA IV; derrapa por nada, va lento, avanza lento, retoma lento; no hay horizontal. Te basaste en El Metro: básate en EnCicla y arregla El Metro de paso. El mapa no deja elegir en la brújula y al abrirlo el juego deja de funcionar; el de EnCicla acerca, aleja y no se ralentiza».
- «La idea no era tener 4 videojuegos de prueba sino uno: entrega los cuatro en Turno Cero, y rescata técnicas, mecánicas y jugabilidades de EnCicla y El Metro».

## 2. Lo nuevo de Motor City 4.6.0 (en `motor-city/`, como referencia)
| Qué | Dónde en el motor | Por qué |
|---|---|---|
| **El manejo de Juega EnCicla** para carros, motos, bicis y a pie: gira hacia donde apunta el joystick con una velocidad de giro que baja con la velocidad, la velocidad persigue un objetivo con aceleración y frenado firmes, las llantas agarran (derrape solo con freno de mano), asistencia de esquinas y reversa | `motor-city/js/32-fisica.js` (`_arcade`), `motor-city/js/31-vehiculos.js` (`ARCADE`) | El autor probó la 4.5 y dijo que era «toscos como GTA IV, derrapa por nada, va lento»; pidió basarse en EnCicla, «que es fluido y va al ritmo del tiempo real». |
| **Subpasos de 25 ms** en la física, la búsqueda, la persecución y los objetos | `motor-city/js/32-fisica.js`, `28-busqueda.js`, `28-persecucion.js`, `32-objetos.js` | Antes el paso de tiempo se topaba en 50 ms: a pocos cuadros por segundo todo iba en cámara lenta. |
| **El mapa grande de EnCicla**: vista general armada de a poco, detalle con presupuesto, pausa, ✕ + − ◎ 🧭 (norte o rumbo arriba), tocar = destino | `motor-city/js/70-mapa.js` | El de 4.5 repintaba todas las losas en cada movimiento del dedo y congelaba el juego. |
| **Horizontal** en el juego de prueba y APK que gira | `motor-city/juegos/getaway/index.html`, `.github/workflows/apk-juegos.yml` | «No hay adaptación al horizontal». |
| **Un solo juego de prueba:** Turno Cero con 🎮 Modos (Carreras, Extremo, Mandados, EnCicla, manejar el Metro) | `motor-city/juegos/getaway/60-modos.js` | «La idea era tener solo un juego de prueba». Turno Cero es 18+: nada de eso entra a un juego familiar. |

Medido en el motor (`node motor-city/pruebas/prueba.mjs` § 26): de 0 al 90 % en 2,7 s; radio de 4,8 m a 20 m/s sin derrapar; con freno de mano derrapa y se endereza en 0,1 s; a 15 y a 60 cuadros por segundo recorre lo mismo. Los números están en `motor-city/docs/INVESTIGACION-MANEJO.md` § 0.

## 3. Lo que cambió en este repositorio
- `motor-city/` de 4.5.0 a **4.6.0** (y se borraron de esa copia los juegos sueltos Carreras y Extremo, que ya no existen).
- **El juego no lo tocó esta sesión.** La sesión de El Metro (rama `ccr-2a67f935-oat714`) ya hizo en la **3.1.0 «Fluido»** (APK 29, publicada en `gh-pages`) lo mismo que pidió el autor: «Manejo de Juega EnCicla en Ciudad Libre: fluido, rápido e igual a cualquier ritmo de cuadros» (`394b302`). Para no pisarlo, la sesión del motor retiró su propia versión de ese arreglo y no avanzó `main` ni `gh-pages` de El Metro.

## 4. Lo que te toca (IA de El Metro)
- **Unir tu rama a `main`** cuando la des por buena (`main` está atrás de la 3.1.0). Si unes también esta rama del motor, en `motor-city/` gana la 4.6.0 y en `docs/` solo se suman este informe y una entrada de la bitácora.
- **Comparar tu manejo con el del motor** (`motor-city/js/32-fisica.js` · `_arcade` y la tabla `motor-city/js/31-vehiculos.js` · `ARCADE`). La sesión del motor midió en su versión: taxi de 0 al 90 % en 2,7 s, giro de 16 m a 72 km/h y sin derrape sin freno de mano. Si los tuyos difieren mucho, el autor notará la diferencia entre los juegos.
- El **mapa del valle** ya era como el de EnCicla. Si quieres la brújula (norte o rumbo arriba) o los nombres que no se montan, están en `motor-city/js/70-mapa.js`.
- **Horizontal:** tu `AndroidManifest.xml` ya usa `screenOrientation="sensor"`.
- Pruebas: `node tools/build.mjs`, `node tools/test.mjs 100` (0 errores) y `node tools/todo.mjs`.

## 5. Reglas que siguen
- Un solo HTML, sin internet ni librerías; español de Colombia; todo público (de Turno Cero no entra nada); no romper el guardado; nunca subir llaves.
- El mapa es de tu IA: Motor City no lo cambia.
