# Cierre de relevo · Antigravity (Google DeepMind / Gemini) · GA-36-1 a GA-36-4 (v3.7.0)

- **Rama publicada:** `origin/ia/antigravity/ciudad-viva-3.7` (partiendo de `origin/ccr-2a67f935-oat714` `9ddcb6a`, El Metro 3.6.0 «Ciudad viva»; nunca sobre `main`).
- **Módulos aditivos entregados:**
  1. **`src/js/96g-ladeo-mitades.js` (GA-36-1 + GA-36-2):**
     - **GA-36-1:** inclinación física en curva (`φ = clamp(atan(v·ω / 9.81), ±0.45 rad)`, `τ = 0.14 s`) para `bici`, `moto`, `scooter`, `skate`, `monopatin` y `patines`, rotando vehículo (`EM.taller.mundo`) y piloto (`Libre.persona3`) como un bloque rígido alrededor del punto de apoyo en Ciudad Libre 3D y en el corredor (`47-carrera.js` / `47b-ciclovia.js`), más alabeo sutil en `EM.taller.primera`.
     - **GA-36-2:** pantalla en mitades en el 3D de Ciudad Libre (mitad superior cámara + pellizco + doble toque para centrar; mitad inferior manejo sin soltar el joystick) con opción `✂️ Pantalla en 3D` en **Ajustes → ⚙️ Flexibilidad** (`settings.pantalla`: `'mitades'` | `'clasica'`).
  2. **`src/js/96h-subtramas-vivas.js` (GA-36-3):**
     - Cada decisión en las 6 subtramas de `36c-actividades.js` registra: (a) entrada persistente en el **Diario de huellas** (`Save.d.rpg.diario`, legible en `⭐ Diario RPG` y en el menú de pausa de Ciudad Libre), (b) **noticia comentada** por los peatones vía `EM.ciudadViva` y `Ciudad.say`, y (c) **reputación del barrio** (`Save.d.rpg.barrios`) visible en `#lbLugar`.
     - Peatones esperando en estaciones/paraderos o descansando en plazas/bancas utilizan las frases `lugar: 'paradero'` y `'banca'` de `src/js/96e1-frases-ciudad.js` (`node tools/frases_ciudad.mjs`).
  3. **`src/js/96i-arte-36.js` + `tools/arte_juego.py` (GA-36-4):**
     - Tubería opcional lista en `tools/arte_juego.py` para los 16 PNG de `G-110` (`panoramicas/g110_zen_*.png`), `G-111` (`clave/esc_sub_*.png`) y `G-112` (`texturas/tex_skate_*.png`).
     - Mientras llegan las imágenes de Gemini (Artista 1), operan los respaldos procedurales: paralaje de 4 capas al amanecer en `cr:zen`, 6 escenas planas cálidas de Medellín en subtramas y pisos de skateparks con cero costo extra en el 3D.

## Guardado (`elmetro.v1`)
Intacto y retrocompatible: campos nuevos con valor por defecto en `newSave()` y saneamiento en `Save.sanitize()` (`settings.pantalla = 'mitades'`, `rpg.diario = []`, `rpg.barrios = {}`).

## Mediciones antes vs. después y pruebas (0 errores)
- `node tools/medir-3d.mjs` (San Antonio): **0 llamadas y 0 vértices agregados** (`cen3d` esc 0: 110→102 llamadas, 786k→787k vtx, fps 6.1→6.6 en corrida limpia; esc 3: 125→95 llamadas, 427k→428k vtx, fps 13.2→13.5; `3p` esc 0: 155→137 llamadas, 775k→776k vtx).
- `node tools/auditoria-jugabilidad.mjs`: `conduce` 60 fps / ritmo 1.00, `bus` 59.7 fps / ritmo 1.00, `volante` ritmo 0.97 / 90 km/h, `carrera` ritmo 0.99 / 47 km/h, `libre` ritmo 0.99 / 0 errores.
- `node tools/build.mjs`: `dist/index.html` 8.724 KB · `v3.7.0`.
- `node tools/test.mjs 100 --shots /tmp/elmetro-37`: **RESULTADO: OK, 0 errores** (16/16 servidor local, carga 2.245 ms, `selfTest` 0 errores/0 avisos, `monkey` 100 partidas / 293.300 pasos / 54 victorias / 0 errores).
- `node tools/test-ga36.mjs`: **PASS** (ladeo sintético diff `0.0000`, dos dedos simultáneos CDP `joyDurante=1`, `cyoTras=-0.756`, `cyoBajoDiff=0`, diario/noticia/barrio/paradero/banca y capturas `412×860` + `860×412`).
- `node tools/test-gpt6-fluidez.mjs` y `node tools/test-gpt6-eon-manejo.mjs`: **PASS**.

## Pendiente
- Los 16 PNG de **G-110, G-111 y G-112** corresponden a **Gemini (Nano Banana), Artista 1**; en cuanto se depositen en `arte/entregas/{panoramicas,clave,texturas}/`, basta correr `python3 tools/arte_juego.py && node tools/build.mjs` para activarlos automáticamente.
