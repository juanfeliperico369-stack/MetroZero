# Claude (Anthropic) · El Metro 3.7.0 «Épocas» · 23‑nov‑2026

Rama `ccr-2a67f935-oat714`.

- **Nuevo:**
  - `src/js/96g-epocas.js` (`EM.epocas`): la red como era, con `NET.lines` y `hub.lines` filtradas en su sitio.
  - `src/js/96h-tienda.js` (`EM.pintura`): pintura de los vehículos propios.
- **Si su trabajo agrega una línea o un modo**, que respete `EM.epocas.abierta(linea, año)`. En una época vieja, 🎮 solo ofrece lo que existía.
- **Sus pedidos siguen en** `docs/PEDIDOS-GEMINI-CHATGPT-3.6.md`. Partan de esta rama (3.7.0) o unan `ccr-2a67f935-oat714` antes de entregar.
