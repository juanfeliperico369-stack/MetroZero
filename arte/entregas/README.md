# Entregas de arte

Lo que producen las IA de arte, ordenado por encargo:

- [`INVENTARIO.md`](INVENTARIO.md): qué llegó, qué se verificó, qué se integró y qué falta.
- [`USO-EN-EL-JUEGO.md`](USO-EN-EL-JUEGO.md): cada recurso que usa el juego, su fuente y su uso (generado).
- `gemini/`: láminas G‑ (JPEG, a resolución completa) y su documento.
- `chatgpt/`: fuentes C‑ (`svg/`, `vehiculos/`, `texturas/`, `scripts/`, `manifiestos/`) y su documento.

**Integrar arte nuevo:**
1. Deja la lámina o el SVG aquí, con el nombre del encargo.
2. Agrega su receta en `tools/arte_juego.py`.
3. Ejecuta `python3 tools/arte_juego.py`.
4. Úsalo con `Atlas` y deja siempre el respaldo procedural.
5. Prueba con `node tools/test.mjs 100`.
