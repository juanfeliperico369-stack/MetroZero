# Sugerencias de Claude (Anthropic) para El Metro · y el siguiente paso (23‑nov‑2026)

> Lo aprendido de la 3.0 a la 3.6, trabajando junto a Antigravity (Gemini), Codex y GPT‑6 (ChatGPT) y con Motor City 4.5–5.2.
> Los pedidos y los prompts para las otras IAs están en `docs/PEDIDOS-GEMINI-CHATGPT-3.6.md`.
> El plan grande, en `docs/EVOLUCION-EL-METRO-CLAUDE.md`.

## 1. Reglas que ahorran tiempo (aprendidas a golpes)
1. **Probar con entradas de jugador, no solo con el bot.**
   - El bot se salta la llave, la señal y las puertas. Por eso el metro «pasaba» las pruebas y no se movía con ▲ (3.1).
   - Se corre con `node tools/auditoria-jugabilidad.mjs`.
2. **Medir el 3D en el peor caso antes de subir la calidad.** En la 3.5 se subieron juntos:
   - la resolución 3D, de 0,55 a 0,82;
   - el sombreado realista, para todos;
   - la apertura de Ciudad Libre en 3D.

   El 3D cayó a 4,5–6,5 cuadros por segundo emulado. Se mide con `node tools/medir-3d.mjs`, y en el juego `EM.rendimiento` regula solo.
3. **Toda geometría del valle entero necesita recorte.** La red de transporte (830 mil vértices) se dibujaba completa en cada cuadro. Con la clase `MBC` (celdas de 800 m) bajó a la mitad. Lo mismo falta para edificios y terreno lejano (CX‑36‑1).
4. **Las marcas entre módulos van en el modo, no en la función.** Otro módulo vuelve a envolver `step` y la marca se pierde; así se sumaron dos arranques en la carrera (3.4).
5. **Un objeto nuevo es una pieza del taller más su entrada en las listas que revisa el autotest** (`T.obstaculos`, `CR_OBS`). Si no, el 3D registra «Objeto desconocido».
6. **Nunca amarrar el control con un diálogo.** Caminar cierra la charla (3.2). Los avisos son pasajeros.
7. **Arcade por defecto y realista como opción** (cabina, puertas, aceleración). La Escuela enseña lo real.
8. **Todo modo se lanza desde su lugar en el mundo abierto** (`EM.actividades`, 🎮) y vuelve al mismo punto. Un modo nuevo que no esté en el mundo abierto queda a medias.
9. **Los datos del motor se generan, no se copian.** Por ejemplo, `node tools/frases_ciudad.mjs` saca las frases de familia de Motor City hacia `src/js/96e1-frases-ciudad.js`.
10. **Unir antes de empezar.** El 22‑nov hubo dos 3.4.0 distintas el mismo día. Cada IA debería hacer `git fetch` y unir `main` al empezar, y anunciar en `.ai-coord/` el número de versión antes de publicarla.

## 2. Sugerencias técnicas para el repositorio
- **`tools/build.mjs`:** incluir `src/data/*.js` automáticamente. Hoy es una lista fija y un dato nuevo se puede quedar por fuera.
- **Guardián de rendimiento en `tools/test.mjs`:** que falle si en calidad alta un cuadro pasa de 900 mil vértices o de 200 llamadas, y así un retroceso como el de la 3.5 no llega a publicarse. Las cifras se toman de `tools/medir-3d.mjs`.
- **El celular del autor manda:**
  - abrir `…/MetroZero/?medir` (o Ajustes → 📏 Medir mi celular) y anotar las cifras en la bitácora;
  - con eso se fija la calidad por defecto con datos reales y no con la emulación.
- **Una sola rama de integración** (`main`): cada IA trabaja en su rama, y Claude (o quien el autor diga) une, mide y publica.
- **Scripts de prueba sueltos a `tools/`**, como ya están la auditoría y la medición del 3D. Así cualquiera repite las cifras.

## 3. Sugerencias de diseño (en orden de impacto)
1. **Pasajes que se gastan en algo visible:** el color y los rines de tu vehículo, vagones con aire o música, tu chaza en la estación. Hoy se ganan y casi no se usan.
2. **Contrarreloj con fantasma y reto del día con marca:** CX‑36‑2. El reto del día (3.6) ya da la razón para volver.
3. **Historias con épocas** (de UnoCero): jugar la red como era. `src/data/red.js` ya trae la fecha de apertura de cada línea: A, 30‑nov‑1995; J, 2008; tranvía, 2016…
4. **«Un día de operación»:** CX‑36‑3, la estrategia propia de un metro.
5. **Menos fichas en la barra de arriba:** en Ciudad Libre llegan a cinco o seis. Dejar dos y el resto en el menú ⏸.
6. **Calendario real** en el mundo abierto: ciclovía de domingo, Feria de las Flores y Alumbrados con su música y su gente.

## 4. El siguiente paso para Claude: 3.7 «Épocas»

> **Hecho en la 3.7.0:**
> - los puntos 2 (épocas) y 4 (pasajes que se gastan);
> - el punto 1 queda abierto hasta que lleguen las entregas;
> - el punto 3 espera las cifras de `?medir` en el celular del autor.
1. **Unir y medir lo que entreguen:**
   - Gemini: G‑110 a G‑112;
   - ChatGPT: C‑70 a C‑72;
   - Antigravity: GA‑36‑1 a GA‑36‑4;
   - Codex: CX‑36‑1 a CX‑36‑3.

   Cada entrega pasa por revisión, `tools/auditoria-jugabilidad.mjs`, `tools/medir-3d.mjs` y las 100 partidas antes de entrar.
2. **Épocas del sistema:** un selector de año en Ciudad Libre (1995, 2004, 2008, 2011, 2016 y hoy).
   - El mundo muestra solo las líneas que existían, con la fecha `open` de `red.js`, y cambia la ficha de cada estación.
   - Las crónicas y los hitos se abren por época: lo que todos saben y lo que pocos saben.
3. **La calidad por defecto con datos del celular del autor** (`?medir`). Si su 3D va bien, el 3D cenital sigue al abrir; si no, el 2D.
4. **Pasajes que se gastan:** una tienda en el perfil, si Codex no la toma.
5. **Siempre:** autotest y 100 partidas con 0 errores; todos los modos en tiempo real; bitácora y buzón al cerrar.
