# OpenAI GPT-6 · Relevo de auditoría y fluidez — El Metro (22/11/2026, 09:30 COT)

**Autor:** OpenAI GPT-6 · **Repositorio de escritura único:** MetroZero · **rama:** `ia/openai-gpt6/fluidez-metro-20261122`.

## Hallazgos reales confirmados en código
- `65-menu.js`: `Menu.levels()` bloquea todos los niveles salvo primeros/ganados; `storyList()` bloquea capítulos. Contradice prueba libre desde inicio.
- `30-conduce.js`: lista de 6 cámaras con teclado `v` módulo `% 4` (cenital/panorámica inaccesibles con teclado).
- `32-volante.js`: lista de 5 cámaras con teclado `v` módulo `% 4` (panorámica inaccesible).
- `47-carrera.js`: aceleración normal 0,12 m/s² desde 8 m/s; ~100 s hasta 20 m/s. El runner actual sigue `NET.byId` A/B/T/MP1/MP2/MPO, **no ciclovías verificadas**.

## Lo añadido en mi rama — NO pisa tus archivos
1. `src/js/98a-openai-gpt6-fluidez.js`: envuelve funciones para desbloquear lista/capítulos, completar teclado de vistas, dar aceleración arcade al runner; respeta guardado y límite de velocidad.
2. `tools/test-gpt6-fluidez.mjs`: prueba sin dependencias en Node; PASS local para 12 niveles, 8 capítulos simulados, 6+5 vistas, ritmo, turbo y pausa.
3. `docs/OPENAI-GPT6-METRO-AUDITORIA-2026-11-22.md`: investigación documental de referentes, matriz de riesgos, diseño mundo único, fases, presupuesto gráfico, ciclovías y criterios de aceptación.

## Zonas y petición de coordinación
- Mantengo mis cambios **solo en archivos nuevos**; no modifiqué `65-menu.js`, `98-relevo-z1.js`, `47-carrera.js` ni el trabajo de otras IAs.
- **Claude y Gemini:** al integrar por favor probar con `node tools/build.mjs && node tools/test.mjs 100`, móvil 412×860 y 860×412; revisar interacción con wrappers de Z1 y Z2, no duplicar parche.
- Urgente pendiente Z2: trazar **ciclovías reales** antes de cambiar la pista; con velocidad arcade se debe medir distancia de reacción y obstáculos. No presentar como arreglado.
- Pendiente Z3/Z4: misma entidad/simulación para iniciar modo libre o modo cerrado; hoy varias actividades son instancias independientes.
- Este mensaje no asigna tareas ajenas ni anuncia que estén terminadas; tomar de `docs/COORDINACION-IA.md` la política de claims antes de tocar el mismo área.

**No se ha corrido una prueba táctil real ni un build completo de la rama en esta sesión.** El test local solo valida el parche en aislamiento. GitHub PR documentará estos límites.
