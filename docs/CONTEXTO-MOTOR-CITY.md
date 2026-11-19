# Motor City 2.2 en El Metro · qué cambió y qué sigue

**19‑nov‑2026 · lo hizo Claude (la IA del motor, Claude Code), a pedido del autor.** Esta nota es para la IA de El Metro.
La fuente de verdad del motor es `juanfeliperico369-stack/motorcity`. Se juega en la web en <https://juanfeliperico369-stack.github.io/motorcity/>.

## Qué cambió en este repositorio
- **El motor 2.2 está ahora en `motor-city/`** (el nombre es solo «Motor City»; nada de «del Valle»).
- **`motor-valle/` volvió exactamente a como estaba antes** de la sincronización 2.0, en el commit `cc5d7a6`. El juego no cambia, compila igual y sus pruebas siguen en verde.
- Bórralo solo cuando termines de migrar a `motor-city/`.
- Si algo del motor te falta o está mal, **no lo cambies en tu copia**:
  1. pídelo con `node motor-city/motor.mjs reporte "título" --juego elmetro` (queda en `motorcity/reportes/`);
  2. o trabaja en `motorcity` siguiendo su `CONTRIBUIR.md`;
  3. la IA del motor lo une, sube la versión y sincroniza.

## Qué trae Motor City 2.2 que te sirve
| Pieza | Para qué en El Metro |
|---|---|
| `MC.Vistas`, con la vista **lateral** (casa de muñecas que gira de a 90°) y la **panorámica** | La lateral del motor para compararla con tu `23-lado.js`; la 3D por software como respaldo de tu G3. |
| **GPU virtual:** `MC.GPU`, `MC.ResDinamica` y `MC.Raster` (3D por software) | Que la 3D ande en celulares sin GPU buena. |
| **Física de niveles por superficies** y cámara con resortes | Puentes, viaducto y deprimidos sin trampas; la cámara no atraviesa edificios. |
| `MC.Manejo` | Curvas de respuesta, giro según la velocidad, asistencias y esquemas (un pulgar, tocar para ir, inclinar…). |
| `MC.UI` | El centro libre, lo que no cambia se atenúa y un aviso a la vez. `MC.UI.verificar(ui)` lo prueba. |
| `MC.Lugares` y `MC.Desgaste` | Estaciones y Metrocables como lugares jugables, con interiores (taquilla, torniquetes y andén). |
| `MC.Hogar` y `MC.Direccion` | La casa del jugador desde su dirección real, sin internet; se diseña con muebles. |
| `MC.Historias`, `MC.Director` y `MC.Ocurrencias` | Cultura metro, Rosalba y los usuarios con rutinas (`MC.Poblacion`). |
| `MC.Sprites` | El arte del juego en atlas, con respaldo procedural. |

## Qué sigue para ti
Tu plan completo está en **`motor-city/docs/PLAN-IAS.md`**, sección «4. IA de El Metro». La guía de migración es **`motor-city/docs/MIGRACION-ELMETRO.md`**. El manual es `motor-city/docs/MANUAL.md`.
