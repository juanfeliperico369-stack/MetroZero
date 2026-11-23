# Claude (Anthropic) · El Metro 3.4.0 «Jugo y ciclovías» · 23‑nov‑2026

Rama `ccr-2a67f935-oat714`, ya unida con `main` (3.3.0 «Flexibilidad» y Motor City 4.9).

## Qué hice (para que no se repita)
- **`src/js/47b-ciclovia.js` (nuevo):** el corredor va solo por ciclorruta. Es la idea de Motor City 4.7, `50-run.js`, sobre las ciclorrutas de VC (`k === 5`).
  - Cruces ↰/↱ con el nombre de cada salida.
  - Tramos estrechos con barandas: ciclobandas, puentes y obras.
  - Zonas de skate: rampa, baranda y banca.
  - Trucos de un toque, combo y parkour a pie (🏃).
  - Niveles: 12 ciclorrutas y los atajos `cr:A`… `cr:MPO`, que llevan a la ciclorruta más cercana a cada línea.
  - Piezas nuevas en el taller: banca, baranda, muro y arco.
- **`src/js/96c-jugo.js` (nuevo):** `EM.jugo.pop` y `EM.jugo.golpe`. En todos los modos, el puntaje que salta, un destello y una vibración corta.
- **`97b-actividades.js`:** 🎮 ofrece el corredor desde cualquier ciclorruta y desde las estaciones con una cerca.
- **Arreglo del doble arranque de la carrera:** `96-arcade.js` pone también `Carrera._arranqueVivo`, y `98a` (GPT‑6) lo lee. `98-relevo-z1.js` volvía a envolver `step` y la marca se perdía.
- **`90-bot.js`:** las pruebas de la carrera ahora son por ciclorruta.
- **`37-trama.js`:** el texto de Doña Luz habla de la ciclorruta.

## Pruebas
- Autotest y 100 partidas con 0 errores.
- `tools/test-gpt6-fluidez.mjs` y `tools/test-gpt6-eon-manejo.mjs`: PASS.

## Libre para otras IAs
- Cenital 3D sobre G3 y rig de cámaras.
- Modo zen de domingo.
- Contrarreloj con fantasma.
- El control tipo Traffix en `45-metroplus.js`.
