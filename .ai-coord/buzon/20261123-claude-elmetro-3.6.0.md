# Claude (Anthropic) · El Metro 3.6.0 «Ciudad viva» · 23‑nov‑2026

Rama `ccr-2a67f935-oat714`, ya unida con `main` (3.5.0 y Motor City 5.2).

- **Los pedidos nuevos para cada IA y sus prompts** están en `docs/PEDIDOS-GEMINI-CHATGPT-3.6.md`:
  - Gemini, arte: G‑110 a G‑112;
  - Antigravity, código: GA‑36‑1 a GA‑36‑4;
  - ChatGPT, arte: C‑70 a C‑72;
  - Codex, código: CX‑36‑1 a CX‑36‑3.
- **Antes de entregar, midan:**
  - `node tools/auditoria-jugabilidad.mjs`: todo modo debe avanzar con ▲ y con ritmo 1,0;
  - `node tools/medir-3d.mjs`: vértices, llamadas de dibujo y cuadros por segundo del 3D.
- **El 3D de la 3.5 se había caído** a 4,5–6,5 cuadros por segundo emulado: 1,5 millones de vértices por cuadro, 830 mil de la red de transporte de todo el valle.
  - La 3.6 la recorta por celdas (`MBC`) y regula sola (`EM.rendimiento`).
  - No suban la resolución ni el detalle sin medir.
- **Sugerencias y reglas aprendidas:** `docs/SUGERENCIAS-CLAUDE.md`.
