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
- `motor-city/` de 4.5.0 a **4.6.0** (y luego a 4.6.1) (y se borraron de esa copia los juegos sueltos Carreras y Extremo, que ya no existen).
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

## 6. 4.6.1 · ⏫ Acelerador fijo (22‑nov‑2026)
El autor: «el problema es el arranque: si se suelta el joystick se deja de acelerar; coloca un botón que, presionado, siempre esté acelerando sin parar, y para detenerse simplemente se desactiva». En el motor (`motor-city/js/37-manejo.js`): `MC.Manejo.aplicar(controles.leer(), cuerpo, { …, acelFijo: true })` pone el empuje a fondo y deja al joystick solo la dirección; al pasar a `false`, frena suave hasta parar (salvo que se toque el joystick). El botón: `ui.alternar({ id: 'acelerador', icono: '⏫', texto: 'Acelerar', al: v => … })` (`motor-city/js/70-interfaz.js`). En Turno Cero está junto a 🛑 y ⚡ (tecla V). **Si tu juego tiene su propio manejo**, la idea cabe en pocas líneas: con el botón prendido, la velocidad objetivo es la máxima y el joystick solo gira; al apagarlo, frenar hasta 0 mientras no se toque el joystick.

## 7. 4.7.0 · Plan de evolución y Turno Cero con los modos en el mundo abierto (22‑nov‑2026)
- El autor pidió a tres IA a la vez revisar el juego de prueba contra las mejores referencias e investigar; cada una escribió su plan:
  - Claude: `motor-city/docs/PLAN-EVOLUCION-CLAUDE.md`;
  - ChatGPT: `docs/PLAN-EVOLUCION-CHATGPT.md`, en su rama del motor;
  - Gemini: `docs/PLAN-EVOLUCION-GEMINI.md`, en su rama.
- Lo útil para tu juego: § 4 (controles, mundos grandes con pocos recursos, render y optimización con fuentes) y § 7 (Run solo por ciclorruta: en `motor-city/js/50-run.js` el camino y los cruces se filtran a `VIA.CICLO`).
- El motor nuevo trae:
  - `G.Actividades`, marcas de actividades en el mundo abierto (`motor-city/juegos/getaway/60-modos.js`), un patrón reutilizable;
  - el ritmo arcade de velocidades;
  - que un carro quieto se lleve lo liviano (canecas, conos) a cualquier velocidad.
- Este repositorio solo recibió la copia del motor; el juego no cambió.

## Motor City 4.8.0 «Flexibilidad» (22‑nov‑2026, Claude)
- **Qué trae el motor nuevo (en `motor-city/`):**
  - ⚙️ `MC.Flex` (`js/37-flexibilidad.js`): control, giro, velocidad de los vehículos, distancia de cámara, acelerador fijo, tren con palanca, mano zurda, tamaño de la interfaz, calidad fija, vibración y pantalla en mitades;
  - la pantalla en mitades de `MC.Controles` (arriba la cámara, abajo manejar; el joystick no se suelta al mover la cámara);
  - el mapa grande con 🚀 Ir y paso al 🌍 planeta;
  - el caché de sectores de suelo de 400 (p95 de 166 a 33 ms con CPU 4×);
  - el Raster 3D por software con tráfico y `aPantalla`;
  - primera persona a la altura de los ojos, luz hemisférica y 🌄 miradores.
- **Para portar (manera A, leer y portar):**
  - la idea de las mitades: el joystick solo en el cuarto inferior de su mano y la mitad de arriba para la cámara;
  - el 🚀 Ir del mapa;
  - el arreglo del caché, si este juego descomprime sectores por demanda.
- En este repositorio, el juego subió a 3.3.0 con su propia ⚙️ Flexibilidad (Ajustes → ⚙️ Flexibilidad: arcade o realista, mano zurda, joystick, giro, velocidad, acelerador fijo al subir y tamaño de botones).

## Motor City 4.9.0 «Realismo» (22‑nov‑2026, Claude)
- **three.js 0.170 (MIT) incrustado en el motor y `MC.VistaTres` (`motor-city/js/45-tres.js`):** el 3D realista sobre las mismas mallas, con:
  - sol con sombras de verdad;
  - luz física y exposición neutra;
  - ventanas que brillan de noche;
  - grano en muros y suelo.
- **Lección para portar:** con three.js ≥ 0.163, no usar `scene.environment` (tiñe de azul todo lo que mira hacia arriba); los reflejos van por material.
- **Plan de realismo y pedidos de arte y datos:** `motor-city/docs/PLAN-REALISMO.md` y `motor-city/docs/PEDIDOS-CHATGPT-4.9.md`.
- Este juego no cambió en esta versión.
