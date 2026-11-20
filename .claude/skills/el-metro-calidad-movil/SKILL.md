---
name: el-metro-calidad-movil
description: Auditoría de calidad móvil (412×860), cero solapamientos de HUD, contraste WCAG AA, rendimiento sin reflujos DOM, seguridad táctil pointercancel y ciclo de verificación visual con Playwright para El Metro y juegos web Canvas/WebGL sin librerías. Úsala al auditar, arreglar u optimizar interfaz, controles táctiles, renderizado 2D/3D o bucles de juego.
---
# El Metro · Calidad Móvil, Rendimiento y Verificación Visual

Síntesis aplicable de `develop-web-game` (OpenAI), `web-design-guidelines` (Vercel), `GoogleChrome/modern-web-guidance` y hallazgos empíricos en `MetroZero`.

## 1. Bucle de juego sin reflujos DOM
- Cachear `--sat`, `--sab` y dimensiones en `resize` (nunca `getComputedStyle` dentro de `requestAnimationFrame`).
- Evitar escrituras redundantes a `innerHTML` en el HUD comparando contra el estado anterior.
- En corredores ordenados por `s` (`47-carrera.js`), usar cursor creciente `st._oi` (`O(1)` amortizado).
- Ajustar el lienzo de historia (`70-historia.js`) a la proporción real del contenedor.
- Usar `image-rendering: auto` en el canvas WebGL cuando `suave: true`.

## 2. HUD móvil (`412 × 860`) y accesibilidad
- `#gChips` con `min-width: 0; overflow-x: auto` y `#gPause` con `flex: none` (pausa siempre visible).
- `.camui` visible solo en vistas cenitales/panorámicas; sin tapar velocidad ni `.jobbar`.
- Contraste WCAG AA (≥ 4,5:1): botones amarillos (`.mos`) siempre con tinta oscura `#13253A`.
- Registrar `pointercancel` junto a `pointerup` en todo gesto táctil.
- Desbloquear siempre todos los puntos de partida en modos `endless: true` (`Ciudad Libre`).

## 3. Verificación visual obligatoria
1. `node tools/build.mjs` y `node tools/assets.mjs`.
2. `node tools/test.mjs 100 --shots DIR`.
3. Medir percentiles (`MC.Telemetria.resumen()`) bajo CPU 4× en Playwright.
4. Inspeccionar visualmente los PNG clave antes de cerrar cada fase.
