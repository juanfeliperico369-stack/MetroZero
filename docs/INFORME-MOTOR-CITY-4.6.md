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

## 3. Lo que cambió en este repositorio (Claude, 21‑nov‑2026)
| Qué | Dónde | Notas |
|---|---|---|
| **El manejo de EnCicla en la ciudad libre** (`driveArcade`) | `src/js/36-libre.js` | El autor: «te basaste en El Metro, donde también está mal hecho: arréglalo de paso». Antes: modelo de bicicleta con agarre lateral, el giro limitado por la aceleración lateral (a 70 km/h el radio pasaba de 50 m) y un acelerador que tardaba 0,3 s. Ahora el taxi va de 0 al 90 % en 2,7 s (antes más de 10), gira en 16 m a 72 km/h y no derrapa sin freno de mano. Tabla por tipo en `Libre.ARC` (los mismos números que `Vehiculos.ARCADE` del motor). El modelo de antes queda para los buses (modo bus) y para quien ponga `Save.d.settings.manejo = 'simulacion'`. |
| **A pie:** con el joystick a fondo se trota (3,9 m/s; antes caminaba a 1,6) y gira al instante | `src/js/36-libre.js` (`walk`) | |
| **Cámara:** mira menos adelante (0,45·v, tope de 14 m; antes 1,1·v) y sigue más rápido | `src/js/36-libre.js` (`step`) | |
| APK **2.0.2 (código 28)** | `android/gradle.properties` | |
| `motor-city/` de 4.5.0 a **4.6.0** | `motor-city/` | |

## 4. Lo que te toca (IA de El Metro)
- **Sentir el manejo con las manos** en un celular y ajustar `Libre.ARC` si hace falta: `[accK, brkK, coastK, arrastre, w0, w1, tw, accMín, brkMín]` por tipo (ligero, moto, auto, pesado).
- El **mapa del valle** (`mapa()` en `src/js/36-libre.js`) ya era como el de EnCicla (dibujo por partes, + − ◎, pausa). Si quieres la brújula (norte o rumbo arriba) o los nombres que no se montan, cópialos de `motor-city/js/70-mapa.js`.
- El modo **bus** (`src/js/38-bus.js`) sigue con el manejo de antes: pásalo a `driveArcade` si se siente pesado.
- Lo de la 4.5 sigue en pie (Guatapé como modo aparte, crónicas Z3): `docs/INFORME-MOTOR-CITY-4.5.md`.
- Pruebas: `node tools/build.mjs`, `node tools/test.mjs 100` (0 errores) y `node tools/todo.mjs`.

## 5. Reglas que siguen
- Un solo HTML, sin internet ni librerías; español de Colombia; todo público (de Turno Cero no entra nada); no romper el guardado; nunca subir llaves.
- El mapa es de tu IA: Motor City no lo cambia.
