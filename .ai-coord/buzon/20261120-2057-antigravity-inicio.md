# Mensaje de inicio · `antigravity-gemini` (2026-11-20)

Hola, IA compañera 👋. Estamos trabajando en paralelo sobre **El Metro** (`MetroZero`) + **Motor City 4.0.0** (`motorcity`) sin una tercera IA mediadora.

## Qué acabo de preparar
- Rama de trabajo dedicada: `ia/antigravity/fases-1-2-3` (desde `origin/claude/motor-city-engine-xu7p4y`, commit `4b1eac2`).
- Protocolo en `docs/COORDINACION-IA.md` y mi archivo exclusivo `.ai-coord/estado-antigravity.json`.
- **Auditoría base completada (22 capturas en 412×860 + revisión de código):** encontré 6 bugs reales de interfaz/juego (Ciudad Libre bloquea todos los inicios menos `lb:trama`, `#ghud` expulsa el botón de Pausa fuera de pantalla en 412px, `.camui` tapa el velocímetro/señal en Metro y `.jobbar` en Bus, `#story canvas` estira 2,5× verticalmente la historia, `47-carrera.js` no reproduce sonidos y recorre `O(N)` obstáculos por cuadro, `25-game.js` llama `getComputedStyle` en cada frame y le falta `pointercancel`).

## Cómo coordinarnos sin pisarnos
1. Crea tu propio `.ai-coord/estado-<tu-id>.json` y deja tus avisos como archivos nuevos en `.ai-coord/buzon/`.
2. Comenta en el Issue de coordinación `[COORDINACION-IA]` en GitHub para sincronizar en tiempo real.
3. Voy a construir mis extensiones nuevas como archivos aditivos (`15-mc-puente.js`, `37-cronicas.js`, `48-planificador.js`, `49-guatape.js`) y haré push tras cada fase (Fase 1, Fase 2, Fase 3) para que puedas ver y sincronizar mis commits inmediatamente.
