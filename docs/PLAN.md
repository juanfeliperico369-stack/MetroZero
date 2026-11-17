# Plan de desarrollo · El Metro (a partir de v0.3.0)

## Visión (del autor)
Un solo mundo: el Valle de Aburrá real (mapa de EnCicla) donde se vive el sistema Metro completo. No minijuegos: **módulos de simulación** (bus cenital de estación a estación, metro en panorámica 2D + cabina, metrocable, ciudad libre), arte con identidad (colores oficiales del Metro, revista EMSAY, pixel art tipo Town Brush/Townscaper, referencias arcade: GTA 1/2, PAKO, Getaway, #DRIVE), mundo vivo (día/noche, clima, fechas de Medellín, NPC), para todo público, offline, celulares modestos.

## Avance
- **v0.4.0:** Fase 1 en curso con arte procedural mejorado (ciudad por lotes y manzanas, laderas con barrios en la panorámica, viaducto 3D realista); Fase 2: cabina con procedimiento real + Escuela de conducción, Cívica al subir al bus; Fase 3: perros (callejeros y con correa) en la ciudad. Pendiente el atlas pintado (encargos 1–3 de `PROMPTS-IA.md`).

## Fases
### Fase 1 · Arte real (2–3 sesiones)
- **Tiles cenitales (16 px/casilla):** asfalto con textura, andenes, bordillos, cebras, manzanas con tejados variados (ladrillo, teja, azotea), parques con caminos, río con orillas, canchas, iglesias/plazas de los lugares reales. Entregable: `src/art/tiles.png` + `tiles.json` (atlas) y carga en `10-map.js` (reemplaza el dibujo procedural tile a tile, manteniendo el fallback).
- **Sprites:** metro (3 carros, cabina), tranvía, articulado, alimentador, taxi, carros ×6, motos, bici, cabinas de cable, peatones (8 variantes × 4 frames), vendedores. Vista cenital, 8 direcciones no necesarias (se rota). Atlas `src/art/sprites.png`.
- **Panorámica:** fondos pintados en 3 capas (cerros lejanos, laderas con barrios, ciudad) por tramo de línea (Norte, Centro, Sur, Occidente, Ayacucho), variantes día/tarde/noche; el relieve real sigue mandando la silueta.
- **Cabina:** consola del metro ilustrada (referencia: cabinas MAN/CAF del Metro de Medellín), botones DOM con estilo; interior del bus para el simulador en parada.
- **Portada/compartir/íconos** ilustrados.
### Fase 2 · Bus y Metro a fondo
- Bus: paradas en la mediana (Metroplús) con acceso por puente, cola de pasajeros con destino, cobro Cívica al subir, hora pico con más gente, 3D opcional (el motor ya existe), misiones de ruta (horario, lleno, lluvia).
- Metro: señales ATP en la vía, anuncios grabados (voz), interior del tren con pasajeros al abrir puertas, despacho desde el PCC como meta‑juego (Arcade → integrado), tramos especiales de fechas (Alumbrados).
### Fase 3 · Ciudad Libre como columna vertebral
- La historia se juega dentro del mundo (ir a la estación X, tomar el metro, etc.).
- Más NPC y eventos (policía de tránsito, ciclovía los domingos, Feria de las Flores con silleteros), interiores de estación, retos de tiempo, cooperativo en red dentro de la ciudad.
### Fase 4 · Datos y realismo
- Completar alimentadores del sur y paraderos exactos; estaciones de Metroplús exactas; Metro de la 80 con estaciones oficiales; verificar horarios y tarifas vigentes.
### Fase 5 · Plataformas
- Pruebas en celulares reales; APK con modo "Cerca" (Bluetooth/Wi‑Fi Direct) y lector QR; iPhone (lector QR JS); rendimiento (chunks en Web Worker, sprites en atlas).

## Reglas de trabajo
- Un solo HTML sin librerías; cada módulo en `src/js/NN-nombre.js`; datos en `src/data`.
- Antes de entregar: `node tools/build.mjs && node tools/test.mjs 100` (0 errores) y capturas en Chromium.
- Publicar: `node tools/assets.mjs`, `bash tools/apk.sh`, copiar `dist/` a la rama `gh-pages`, `node tools/verify-pages.mjs`.
- Cerrar cada sesión actualizando `docs/BITACORA.md` (qué cambió, qué se probó, qué falta).
