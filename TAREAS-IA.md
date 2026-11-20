# Tareas de cada IA · El Metro

> **Motor City 3.0 (20‑nov‑2026):** antes de tu encargo, lee **las 10 reglas que dejó el feedback del autor** en `motor-city/docs/PROXIMO-NUEVA-YORK.md` §3:
> - un solo mundo con varias cámaras;
> - volumen en lo que se levanta;
> - fachadas con detalle;
> - cámara con topes y un mapa para ver todo;
> - tutoriales opcionales;
> - fluidez medida;
> - probar en un celular real con GPU.
>
> Lo que sigue después de los encargos de Gemini y ChatGPT es «Getaway Nueva York».

> **Si te dijeron «mira el repositorio y haz tu parte», empieza aquí**, y sigue el **protocolo de 7 pasos** (`CLAUDE.md`, `AGENTS.md` o `GEMINI.md`): lee todo, reflexiona, comprueba, prueba en pequeño, ajústate, haz solo lo tuyo, entrega y registra.
> - Lo del motor está en `motor-city/docs/DOCUMENTO-UNICO.md`, y lo que cambió en `docs/CONTEXTO-MOTOR-CITY.md`.
> - Al terminar, actualiza `docs/BITACORA.md`.

**Reparto (nov‑2026, del autor):**
- **Antigravity** trabaja ahora con **«hydrogen»** (ya no con «argon»): a Gemini le tocan las **tareas fáciles**.
- **Codex** sigue con **«astra»** y **ChatGPT genera mejores imágenes**: le tocan las **fuertes**.
- **En los encargos de arte:** si un encargo **G‑** es difícil (personajes, vehículos, escenas completas, mosaicos isométricos), hazlo con **ChatGPT**, con las mismas reglas, paleta y nombre de archivo. Gemini se queda con los G‑ sencillos (íconos, texturas simples, revisiones y referencias).


**Nuevo (20‑nov‑2026, Motor City 2.10):**
- **Skills y plugins de los videos del autor:** Hallmark, Modern Web Guidance y HyperFrames, en `.claude/settings.json`. Las demás IA las instalan con `node motor-city/motor.mjs skills --instalar --agente codex` (o `antigravity`).
- **Codex («astra»):**
  - antes de tocar la interfaz (`src/js/65-menu.js`, CSS), consulta **Modern Web Guidance** y corre `legacy-scan src/js --json`; aplica solo lo verificado;
  - haz un **tráiler** de El Metro con **HyperFrames**, con capturas reales.
- **Gemini («hydrogen»):** corre `node motor-city/motor.mjs publico` y anota qué perfil se atasca.
- La rama `plan-unico-el-metro` ya está dentro de la v2.0.0. No la fusiones.

## La IA de El Metro (Codex «astra» o Claude): lo fuerte
1. **Migrar a `motor-city/`** (`motor-city/docs/MIGRACION-ELMETRO.md`). Hoy `tools/build.mjs` sigue leyendo `src/data/valle.js`.
2. **Estilo realista familiar** del motor 2.6 en las vistas cenital, isométrica y lateral:
   - árboles de pie;
   - asfalto gastado;
   - andenes de baldosa;
   - techos con textura.
3. **Lección de ciudad:**
   - las estaciones suben el valor del suelo (`urbe.capa('transporte')` y `'valor'`);
   - un modo «¿dónde va la próxima estación?».
4. **La interfaz en 412 px:**
   - que los botones `+`, `−`, regla y cámara no tapen la velocidad;
   - que el aviso azul no tape la barra de ruta;
   - que «Espera en el andén» no corte «Carrera 51».

   Lo vio la auditoría de Gemini.
5. **Tutoriales opcionales:** un botón, nunca una ventana que salga sola.
6. `node tools/assets.mjs` antes de `node tools/test.mjs` (sin eso da 404), o mejor: que `test.mjs` lo llame solo.
7. `node tools/test.mjs 100` con 0 errores.

## Gemini con Antigravity («hydrogen»): lo fácil
1. `node tools/build.mjs` y `node tools/test.mjs 10`: pega el resultado en `docs/BITACORA.md`.
2. Capturas en 412 × 860 (portada, metro, cable, lateral y mapa) y una tabla foto → hallazgo → gravedad.
3. Los encargos **G‑** sencillos de `arte/06-guia-unica-ia.md`, con su lista de control.

## ChatGPT (imágenes): el arte difícil
Los encargos **C‑** de `arte/06-guia-unica-ia.md`, más los **G‑** difíciles que pasan a ti (ver arriba), con las reglas del protocolo:
- vista y proyección exactas;
- paleta, con el color de cada línea;
- fondo transparente o magenta;
- sin sombra proyectada ni texto;
- nombre exacto del encargo.
