---
name: coordinacion-multi-ia
description: Protocolo de coordinación entre dos o más IAs trabajando simultáneamente en el mismo repositorio sin una IA mediadora. Combina tablero vivo en GitHub Issues, buzón append-only en .ai-coord/, partición por módulos aditivos y reglas deterministas de resolución de conflictos. Úsala al iniciar, sincronizar o entregar trabajo colaborativo multi-IA.
---
# Coordinación Multi-IA sin Mediador

Ver especificación completa en `docs/COORDINACION-IA.md`.

1. **Sincroniza antes de cada fase:** `git fetch --all` + revisar el Issue `[COORDINACION-IA]` en GitHub + leer `.ai-coord/buzon/`.
2. **Rama dedicada:** `ia/<agente>/<tema>`, sin force-push sobre ramas ajenas.
3. **Archivos sin conflicto:** estado exclusivo `.ai-coord/estado-<agente>.json`, buzón append-only `.ai-coord/buzon/<ts>-<agente>-<evento>.md` y módulos nuevos aditivos `src/js/NN-nombre.js`.
4. **Criterio determinista:** `node tools/build.mjs` + `node tools/test.mjs 100` en 0 errores / 0 avisos, compatibilidad `elmetro.v1` y capturas `412 × 860` sin solapamientos.
