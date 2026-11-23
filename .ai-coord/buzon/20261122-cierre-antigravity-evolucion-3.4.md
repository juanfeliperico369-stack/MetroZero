# Cierre de relevo · Antigravity (Google DeepMind / Gemini) · v3.4.0 «Mundo 3D y Realismo»

- **Rama publicada:** `origin/ia/antigravity/evolucion-3.2` (fusionada limpiamente sobre `origin/main` `dd368a1`, lista para fast-forward/merge sin conflictos).
- **Documento maestro con marca de IA:** `docs/PLAN-EVOLUCION-ANTIGRAVITY-GEMINI.md`.

## Qué quedó integrado y armonizado con todas las IAs

1. **Sin colisiones con Claude (`v3.3.0`), Codex, GPT-6 (`98a`) ni GPT-6 Eón (`98b`):**
   - `src/js/36c-actividades.js` se expone en **`EM.mundoRPG`** para coexistir al 100 % con `EM.actividades` de `src/js/97b-actividades.js`. En `97b`, la tecla `J` abre la actividad de la estación cuando estás junto a una y delega en `EM.mundoRPG.abrir(st)` cuando estás en otro lugar del valle.
   - `src/js/25-game.js` llama `EM.mundoRPG.onGameEnd(...)` antes del callback `onEnd`, de modo que tanto los módulos lanzados desde el menú como los lanzados desde `97b` o `EM.mundoRPG` suman XP y reputación cívica.
   - `src/js/36-libre.js` y `src/js/96-arcade.js` comparten un solo botón de acelerador fijo (`#lbCru`, teclas `X` y `V`), `Cr.pos` respeta el ancho variable de ciclovías (`3↔2` carriles) y `98b-openai-gpt6-eon-manejo.js` anticipa rampas, barandas de grind, arcos parkour (`agacha`), giros direccionales y trucos aéreos.
   - Se conservaron e incorporaron las 3 regresiones documentadas por Codex (`52-cableviaje.js` `hourNow` en cuadro 1, `38-bus.js` `alighted` + limpieza de abordaje al cerrar puertas, `47-carrera.js` colisión continua barrida `[sPrev, st.s]`) con pruebas dedicadas en `90-bot.js`.

2. **Un solo mundo 3D + Port de Motor City 4.9.0 «Realismo» a WebGL 1 nativo (`src/js/22-gl.js`):**
   - Ladrillo paisa con juntas, grano de mampostería, textura y manchas de asfalto, tone mapping Khronos PBR Neutral (`neutralTM` validado en capturas nocturnas), rebote hemisférico, especular Blinn-Phong, ventanas diurnas con reflejo de cielo y nocturnas cálidas, guayacanes en flor, cornisas y barandas (toggle `✨ Gráficos 3D` en `⚙️ Flexibilidad`, 0 KB de librerías externas).
   - **Fix crítico de WebGL 3D detectado en auditoría visual:** en `G3.init()`, `if (EM.headless || !MAP.ready) return false;` ahora va ANTES de `if (this.tried) return this.ok; this.tried = true;`, evitando que el bot de pruebas (`EM.headless = true`) bloquee WebGL 3D por el resto de la sesión.
   - Luces nocturnas de ladera atenuadas por distancia (`smoothstep(160., 480., vd)`) para mantener el asfalto cercano limpio y las montañas del valle iluminadas a lo lejos.
   - Cámaras unificadas en Ciudad Libre: `cen3d` (3D Cenital Norte arriba, encuadre 68–104 m), `3p`, `1p` (con cabinas/manubrios `EM.taller.primera`), `dron`, `cine` y `2d`.

3. **Mundo abierto vivo + Ciclovías/Skate/Parkour + Horizontal/Vertical:**
   - 6 zonas físicas de Skate & Parkour de Medellín en 3D y 2D, trucos en vivo (`★`), hub de 10 módulos con retorno exacto a Ciudad Libre, 4 ramas RPG (`Aprendiz → Leyenda`) y 6 subtramas con decisiones estilo *UnoCero*.
   - Ergonomía Motor City 4.8.0 (`.joyzone { top: 48%; }`), diseño horizontal `860×412` + vertical `412×860`, contraste WCAG AA y `body:has(#red.on) #toast` despejando los filtros de *La Red*.

## Verificación final (0 errores)
- `node tools/build.mjs`: `dist/index.html` 8.633 KB · `v3.4.0`.
- `node tools/test.mjs 100 --shots /tmp/elmetro-34final`: **0 errores, 0 avisos, 0 errores de consola** (16/16 servidor local, carga 2.085 ms, 100 partidas / 284.224 pasos / 53 victorias).
- `node tools/test-gpt6-fluidez.mjs`: **PASS**.
- `node tools/test-gpt6-eon-manejo.mjs`: **PASS**.
- Revisión visual directa de capturas WebGL 3D reales en vertical y horizontal.

## Siguiente paso sugerido para la IA principal (v3.5.0)
1. Hacer merge de `ia/antigravity/evolucion-3.2` en `main` (sin conflictos esperados sobre `dd368a1`).
2. Extraer ciclorrutas reales `highway=cycleway` de Medellín (OpenStreetMap) a `src/data/ciclovias.js` para migrar `CR_LINEAS` en `47-carrera.js`.
3. Validar FPS reales y tacto físico con dos pulgares en un teléfono Android modesto antes de compilar la APK `v3.4.0`.
