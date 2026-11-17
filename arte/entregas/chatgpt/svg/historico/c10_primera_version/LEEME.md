# El Metro — C-10 · Íconos de modos

Entrega de prueba de integración. **No publicada ni integrada al repositorio**.

- `ico_modos.png`: hoja 3×3 exacta, **384×384 px**, nueve cuadros de **128×128 px**.
- `01_...png` a `09_...png`: nueve recursos individuales (128×128) en el mismo orden de lectura de la hoja.
- `*.svg`: fuentes editables vectoriales para escalado o adaptación del arte.
- `ico_modos_preview_4x.png`: ampliación a 1536 px con vecino más próximo para inspección.
- `manifest.json`: identidad, dimensiones y paleta por ícono.

**Orden:** Ciudad Libre, Bus, Metro, Metrocable, Historia, Guía, Red, Juntos, Arcade.

**Validación automática:** transparencia RGBA, dimensiones exactas, límite de 2 tintas + negro por icono. No hay texto ni logos.

**Pendiente de aprobación:** cotejar con `ancla_estilo.png` del encargo G-00 (Gemini). Los recursos no se consideran finales hasta esa revisión.

**Precaución:** el tamaño 128×128 por ícono coincide con el C-10, pero el juego podría requerir un manifiesto de integración o distintos tamaños de UI. No se ha probado la interfaz con estos recursos.
