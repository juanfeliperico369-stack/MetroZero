# Motor City 2.0 en El Metro · qué cambió y qué sigue

**19‑nov‑2026 · lo hizo Claude (la IA del motor, Claude Code), a pedido del autor.** Esta nota es para la IA de El Metro. **Sigue tu `CLAUDE.md`** antes de tocar algo.

## Qué cambió en este repositorio
**Solo la carpeta `motor-valle/`.** Tenías la copia 1.1.0; ahora está el motor **2.0.0**, sincronizado desde `juanfeliperico369-stack/motorcity`, que es la nueva **fuente de verdad** del motor. Ya no lo es BicicletasUno ni MetroZero.

- **El juego no cambió:**
  - `tools/build.mjs` no incluye nada de `motor-valle/`;
  - el HTML compilado tiene la misma huella (`b8f24800`);
  - `node tools/test.mjs 100` sigue en 0 errores.
- `motor-valle/js/valle.js` pasó de tu 1.1.0 al lector 1.2.0, que une las dos y conserva tu interfaz `Valle.elmetro` / `MotorValle`.
- **Lo nuevo:**
  - el motor en fuente (`js/00-…` a `js/50-…`) y compilado (`dist/motor.js`);
  - el mundo 2.0 (`datos/medellin/mundo.mc4`), que ya trae **tus** 639.457 huellas, tus puentes, tus rieles, tu Metroplús y tus hitos;
  - `run/` (Run Scooter), `herramientas/`, `pruebas/`, `sandbox/` y `docs/`, con **`docs/MIGRACION-ELMETRO.md`**.

## Qué sigue para ti
Lee **`motor-valle/docs/MIGRACION-ELMETRO.md`**. En corto:
1. **Conserva** tu cabina, tu maqueta, tu Metrocable, tu vista lateral (`23-lado.js`) y tu trama contemplativa.
2. Usa el motor 2.0 en lugar de tu 1.1.0. Pasa al mundo 2.0: los mismos datos en una sola fuente, y el HTML baja de tamaño.
3. **Transporte con horario determinista** (`MC.Transporte`): tus trenes y los de Juega EnCicla coinciden a la misma hora.
4. **La panorámica del motor** parte de tu `23-lado.js` (con crédito) y suma la fila real de edificios, las siluetas de los emblemáticos y el viaducto con sus trenes. Pruébala en Ciudad Libre.
5. Integra Run en la ciclovía con tu piel si quieres (`MC.Run`). Tu «🛴 Run Scooter» puede pasar a ser este.

**Si algo del mapa está mal, pídelo en `motorcity`.** Tus herramientas `tools/*_datos.*` siguen siendo la referencia de cómo se hicieron tus capas.
