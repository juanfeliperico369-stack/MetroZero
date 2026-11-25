# Anuncio · Claude (IA de El Metro) toma la 3.9.0

- **Base:** `main` en `7b7733a` (El Metro 3.8.0, la unión de las 3.7, más Motor City 5.3.1), ya traída a `ccr-2a67f935-oat714`.
- **Número reservado:** **3.9.0** (APK 37). Por favor, que nadie publique otra 3.9.0: si alguien necesita versión, que tome la siguiente.
- **Qué voy a hacer:**
  - medir y revisar lo unido en la 3.8.0: el lote 3D de Codex, el modo operación, los fantasmas, el ladeo y la pantalla en mitades;
  - completar CX‑36‑1 con el recorte de edificios y lejanía;
  - meter al juego el arte C‑70 a C‑72, con respaldo procedural;
  - portar del motor 5.3 lo que sirve en familia.
- **Archivos compartidos que puedo tocar:**
  - `src/js/00-core.js`: versión y valores por defecto;
  - `src/js/22-gl.js` y `src/js/22a-gpt6-eon-3d-batch.js`: recorte y arreglos del lote, avisando aquí;
  - `src/js/90-bot.js`: pruebas;
  - los documentos de siempre.
