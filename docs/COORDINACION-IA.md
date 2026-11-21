# Protocolo de Coordinación Multi-IA sin Mediador · El Metro (`MetroZero`)

> **Propósito:** Permitir que dos o más IAs que reciben exactamente las mismas instrucciones trabajen en paralelo sobre `MetroZero` (y reporten sobre `motorcity`) **sin una tercera IA mediadora**, evitando conflictos de fusión, trabajo duplicado o regresiones, y dejando trazabilidad total para la **IA principal** que integrará y publicará el juego.

---

## 1. Arquitectura de Doble Canal (Tiempo Real + Git Sin Conflictos)

### Canal A · Tablero Vivo en GitHub Issues (Tiempo Real)
- Existe un único Issue abierto de coordinación en `juanfeliperico369-stack/MetroZero` con título:
  `[COORDINACION-IA] Tablero vivo de tareas, claims y traspasos (Fases 1-2-3)`
- Antes de iniciar **cada fase** (Fase 1, Fase 2, Fase 3), cada IA ejecuta:
  ```bash
  git fetch --all --prune
  gh issue list -R juanfeliperico369-stack/MetroZero --state open
  gh issue view <NUMERO_ISSUE> -R juanfeliperico369-stack/MetroZero --comments
  ```
- Si la otra IA ya publicó avances, ramas o *claims*, se leen y se evita repetir trabajo o editar los mismos módulos simultáneamente.

### Canal B · Estado Append-Only en el Repositorio (`.ai-coord/`)
Para que dos ramas puedan fusionarse sin conflictos de Git:
- **Archivo de estado exclusivo por agente:** `.ai-coord/estado-<agente>.json` (cada IA modifica **solo** su propio JSON).
- **Buzón de mensajes estrictamente append-only:** `.ai-coord/buzon/<YYYYMMDD-HHMM>-<agente>-<evento>.md` (cada mensaje es un archivo nuevo; jamás se edita el archivo de otra IA).

---

## 2. Convenciones de Ramas y Partición de Zonas

1. **Rama base común:** `origin/claude/motor-city-engine-xu7p4y` (la rama más reciente con El Metro v2.0.0 + Motor City 4.0.0 + Tutorial opcional).
2. **Rama dedicada por agente:** `ia/<agente>/<tema>` (ej. `ia/antigravity/fases-1-2-3`, `ia/codex/fases-1-2-3`).
   - Nunca hacer `push --force` sobre la rama de otra IA ni sobre `main` / `gh-pages`.
3. **Regla de Extensión Aditiva (Cero Pisadas):**
   - Toda funcionalidad nueva debe vivir preferiblemente en su **propio archivo aditivo** `src/js/NN-nombre.js` (conectado mediante hooks sobre `EM`, `Menu`, `Game`, `Libre`, `MC`), evitando reescrituras monolíticas de archivos compartidos.
   - Si una IA debe modificar un archivo compartido (`src/style.css`, `src/js/25-game.js`, `src/js/65-menu.js`, `tools/build.mjs`), lo declara en su `estado-<agente>.json` y en el Issue de coordinación con sus líneas y objetivo exactos.

### Mapa de Zonas Recomendado para Trabajo Simultáneo
| Zona / Capa | Módulos principales | Estrategia sin conflictos |
|---|---|---|
| **Z1 · Auditoría UI 412px y Bucle** | `src/style.css`, `src/js/25-game.js`, `src/js/27-camara.js`, `src/js/60-mapa.js`, `src/js/65-menu.js`, `src/js/70-historia.js`, `src/js/90-bot.js` | Quien reclame Z1 hace commit rápido y sube rama para que la otra IA pueda hacer `git cherry-pick` o `merge`. |
| **Z2 · Game Feel y Runner** | `src/js/47-carrera.js`, `src/js/30-conduce.js`, `src/js/32-volante.js`, `src/js/38-bus.js` | Mejoras discretas y medibles con audio, combo y física. |
| **Z3 · Narrativa Coherente (UnoCero)** | `src/js/37-cronicas.js` (nuevo), `src/js/39-gente.js`, `src/data/guion.js` | Archivo aditivo `37-cronicas.js` con guardado retrocompatible `Save.d.cronicas`. |
| **Z4 · Puente Motor City 4.0** | `src/js/15-mc-puente.js` (nuevo), `tools/build.mjs` | Adaptador `MC.Mundo` sin duplicar el MC4 de 6,6 MB; expone `EM.mc`. |
| **Z5 · Modos Motor City** | `src/js/48-planificador.js` (nuevo `MC.Urbe`), `src/js/49-guatape.js` (nuevo `MC.Planeta`) | Archivos 100 % independientes registrados en `EM.modes` y `MODECARDS`. |
| **Z6 · Documentación y Reportes** | `docs/REPORTE-FASES-1-2-3-EL-METRO.md`, `motorcity/reportes/2026-11-20-el-metro-integracion-motorcity.md`, `docs/BITACORA.md` | Cada IA firma sus secciones con `[Antigravity]` / `[Otra-IA]` para fusión limpia. |

---

## 3. Reglas Deterministas de Resolución de Conflictos (Sin Mediador)
Cuando las dos ramas se integren (ya sea por una de las dos IAs o por la IA principal):
1. **Puerta de calidad objetiva:** Solo entra código que pase `node tools/build.mjs` + `node tools/test.mjs 100` con **0 errores, 0 avisos y 0 errores de consola**, y sin solapamientos en capturas `412 × 860`.
2. **Retrocompatibilidad estricta de `elmetro.v1`:** Toda clave nueva en `Save.d` debe tener valor por defecto en `newSave()` / `Save.sanitize()`.
3. **Unión aditiva de mejoras:** Si ambas IAs mejoran el mismo modo, se conservan ambas mejoras no excluyentes; en caso de dos implementaciones del mismo objetivo, gana la más liviana en ms/cuadro (`MC.Telemetria.resumen().cuadro_p95`) y menor peso en KB en `dist/index.html`.
4. **Respeto a los límites del proyecto:** Un solo HTML offline, español de Colombia, todo público, arte con respaldo procedural y sin auditar el juego de prueba de Motor City.
