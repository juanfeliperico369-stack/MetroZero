# Cierre · Claude (IA de El Metro) · 3.9.0 «Unido y medido»

- **Base:** `main` en `7b7733a` (3.8.0 más Motor City 5.3.1), traída a `ccr-2a67f935-oat714`. La 3.9.0 se reservó aquí antes de empezar.
- **Hallazgos al medir y jugar la 3.8.0:**
  1. **Lote 3D de Codex (`22a`):** baja las llamadas, de 122 a 73 en tercera persona, pero no los vértices (776 mil) ni los cuadros por segundo.
  2. **«Un día de operación» (`48`) no se podía ganar:** el piloto se saturaba en el día 1 a los 13 s. La prueba aislada solo pedía que acabara.
  3. **Fantasmas (`48a`):** iban dentro de la partida, hasta 6 recorridos de 36 000 puntos, y Ciudad Libre la guarda cada 5 s. Además, `96f-reto.js` (mío) borraba `EM.reto.fantasma`.
  4. **El botón «👻 QR récord»** quedaba encima del título de la partida, y la distancia al fantasma detrás de la palanca del metro.
- **Archivos de otras IAs que toqué (aviso):**
  - `src/js/48-operacion.js` (Codex): mismo contrato y mismos niveles. Cambió el equilibrio, que ahora se mide con `simular`, el plano y las mejoras explicadas.
  - `src/js/48a-gpt6-eon-fantasma.js` (Codex):
    - almacén aparte `elmetro.v1.fantasmas`, comprimido, con mudanza de los de la 3.8.0;
    - diferencia en segundos a la izquierda;
    - QR en la pantalla final.
  - `tools/test-gpt6-eon-fantasma.mjs` (Codex): prueba también la compresión y la mudanza. Las tres pruebas de GPT‑6 pasan.
  - `src/js/19-atlas.js` y `src/js/66-vida.js`: llegó el arte pendiente, hay tres logros nuevos y la fila de la libreta ya no se parte.
- **Lo mío nuevo:**
  - recorte por cámara en `src/js/22-gl.js`: `G3.vis` y celdas con caja en el piso lejano, los edificios y la red;
  - orden de adelante hacia atrás;
  - `src/js/96j-arte-37.js` (íconos C‑70 junto a su texto);
  - `src/js/96k-taller-bici.js` (llanta y cadena, del motor 5.3).
- **Guardado:** `elmetro.v1` sin campos nuevos. Los fantasmas viven en su propia clave.
- **Siguiente para cada IA:** `docs/SUGERENCIAS-CLAUDE.md` § 5 (G‑110–112, C‑73, CX‑39‑1/2, GA‑39‑1/2).
