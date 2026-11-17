# Plan de desarrollo · El Metro (a partir de v0.3.0)

## Visión (del autor)
Un solo mundo: el Valle de Aburrá real (mapa de EnCicla) donde se vive el sistema Metro completo. No minijuegos: **módulos de simulación** (bus cenital de estación a estación, metro en panorámica 2D + cabina, metrocable, ciudad libre), arte con identidad (colores oficiales del Metro, revista EMSAY, pixel art tipo Town Brush/Townscaper, referencias arcade: GTA 1/2, PAKO, Getaway, #DRIVE), mundo vivo (día/noche, clima, fechas de Medellín, NPC), para todo público, offline, celulares modestos.

## Avance
- **v0.4.0:** Fase 1 en curso con arte procedural mejorado (ciudad por lotes y manzanas, laderas con barrios en la panorámica, viaducto 3D realista); Fase 2: cabina con procedimiento real + Escuela de conducción, Cívica al subir al bus; Fase 3: perros (callejeros y con correa) en la ciudad. Pendiente el atlas pintado (encargos 1–3 de `PROMPTS-IA.md`).
- **Carpeta de arte (nov 2026):** investigación visual completa y **guía única para IA** (Gemini Nano Banana y ChatGPT; Midjourney salió del plan) en `arte/`. Nueva **Fase 1b**: Medellín fiel e isométrica.
- **v0.5.0:** Fase 3 iniciada: la historia se juega dentro de Ciudad Libre (`37-trama.js`), con módulos encadenados y regreso a la ciudad; panorámica con paleta de ilustración y capa intermedia.

- **v0.6.0:** Fase 1 (arte real) **iniciada con las entregas de Gemini y ChatGPT**:
  - retratos, tarjetas de capítulo, portada, íconos, medallas y adornos de fiestas, con `Atlas` y respaldo procedural;
  - **mapa cenital rediseñado** (vías por tipo y ancho, separadores, cebras en cruces, río con muros);
  - **Fase 1b medida:** el trazado de calles coincide con OpenStreetMap en un 98–100 % a 20 m. Falta la capa vectorial (anchos, glorietas, nombres) y los edificios reales.

## Fases
### Fase 1 · Arte real (2–3 sesiones)
- **Tiles cenitales (16 px/casilla):** asfalto con textura, andenes, bordillos, cebras, manzanas con tejados variados (ladrillo, teja, azotea), parques con caminos, río con orillas, canchas, iglesias/plazas de los lugares reales. Entregable: `src/art/tiles.png` + `tiles.json` (atlas) y carga en `10-map.js` (reemplaza el dibujo procedural tile a tile, manteniendo el fallback).
- **Sprites:** metro (3 carros, cabina), tranvía, articulado, alimentador, taxi, carros ×6, motos, bici, cabinas de cable, peatones (8 variantes × 4 frames), vendedores. Vista cenital, 8 direcciones no necesarias (se rota). Atlas `src/art/sprites.png`.
- **Panorámica:** fondos pintados en 3 capas (cerros lejanos, laderas con barrios, ciudad) por tramo de línea (Norte, Centro, Sur, Occidente, Ayacucho), variantes día/tarde/noche; el relieve real sigue mandando la silueta.
- **Cabina:** consola del metro ilustrada (referencia: cabinas MAN/CAF del Metro de Medellín), botones DOM con estilo; interior del bus para el simulador en parada.
- **Portada/compartir/íconos** ilustrados.
### Fase 1b · Medellín fiel e isométrica (relieve, estructuras y vista 2:1)
**Por qué:** el juego todavía tiene detalles mal diseñados:
- relieve suavizado (modelo de 80 m);
- laderas sin escalonamiento;
- viaducto y estaciones con alturas y formas aproximadas;
- cables que no siguen bien las lomas;
- alturas de edificios genéricas;
- lugares icónicos sin forma propia.

**Referencias** (mapas de ciudades reales en pixel art “isométrico”):
- [Isometric Cities](https://isometriccities.com/): directorio de unas 95 ciudades y explicación de las técnicas.
- [Isometric NYC](https://www.pcgamer.com/software/ai/software-engineer-creates-classic-simcity-style-map-of-nyc-and-argues-that-ai-is-good-for-creatives-actually/) (Andy Coenen, enero de 2026): ajustó un modelo de edición de imagen para repintar en pixel art imágenes de la ciudad.
- [Tiny Barcelona](https://tiny-barcelona.agenturl.dev) · [Tiny Madrid](https://tinymadrid.app) (modos Conducir, Volar y Carreras) · [Tiny València](https://tinyvalencia.com) (parte de datos 3D del Catastro y del IGN y los repinta con IA) · [Isometric Málaga](https://isometric-malaga.xiangminf.com) · [CDMX isométrico](https://cdmxisometrico.com) · [Buenos Aires](https://caba.nicolaspoore.com).
- [tinyworlds](https://github.com/nihey/tinyworlds): sin IA. Rasteriza por código huellas y alturas de edificios, calles, parques, agua y árboles de OpenStreetMap y Overture Maps en una pirámide de teselas con zoom. Donde faltan alturas, usa el ráster de alturas satelital *Google Open Buildings 2.5D* calibrado con edificios de pisos conocidos.

**Claves técnicas:**
- El “isométrico” de pixel art es en realidad **dimétrico 2:1** (unos 26,6°).
- Hay tres técnicas:
  1. IA que repinta mosaicos base;
  2. render por código desde datos abiertos;
  3. diorama 3D con cámara isométrica.
- Una ciudad grande completa pesa del orden de **1,5 GB** en teselas (tinyworlds). Por eso en un HTML sin conexión hay que **generar en el dispositivo** desde datos compactos, no cargar imágenes gigantes.

**Plan:**
1. **Datos** (`tools/`): sumar al mapa de EnCicla:
   - alturas de edificios por casilla de 20 m (1 byte), desde Overture Maps / OSM y *Open Buildings 2.5D* *(cobertura en Colombia por verificar)*;
   - relieve de **30 m** (Copernicus GLO‑30) en lugar del de 80 m, y revisar si la Alcaldía o el Área Metropolitana tienen un modelo de terreno abierto más fino;
   - tipo de techo por casilla.
2. **Escena real:** viaducto con su altura y trazado medidos, estaciones con su forma (cubierta, accesos y puentes), torres de cable en sus posiciones y con la curva del cable sobre el terreno, río canalizado con su ancho y jerarquía vial (autopistas, la 80, Las Vegas, Las Palmas, Regional). También los lugares icónicos modelados: Catedral, Coltejer, Nutibara con el Pueblito Paisa, El Volador, Biblioteca España, estadio y Olaya Herrera.
3. **Vista isométrica 2:1 procedural** (como tinyworlds) dentro del juego: nueva vista de Ciudad Libre y “maqueta” en La Red, generada en el celular desde los datos, con el mismo pixel art del juego.
4. **Repintado con IA donde más luce:** genero **mosaicos base 2:1** con la geometría real y Gemini los repinta (encargo **G‑100** de la guía única) sin mover nada. Va solo para zonas héroe: centro, estaciones, lugares icónicos y portada. El resto queda procedural para mantener el peso bajo.
5. **Corregir las otras vistas con la misma escena:** cenital (alturas y sombras reales), panorámica (perfiles de las laderas con relieve de 30 m), 3D (viaducto y estaciones medidos).
**Estado en v0.6.0:**
- **Medido:** fidelidad de calles contra OSM (`docs/auditorias/2026-11-17-fidelidad-mapa-osm.md`, con `tools/osm-ventanas.mjs` y `tools/osm_comparar.py`).
- **Diseñada (sin publicar) la Maqueta 2:1:** render “voxel” por columnas de adelante hacia atrás con búfer de altura, sobre el relieve real (bilineal de 80 m) y los edificios con su altura.
  - Pantalla: x = (u − v)·a; y = (u + v)·a/2 − z·a·kz, con kz ≈ 1,4. Giro de 90°.
  - Rendimiento: se dibuja a resolución CSS en caché y se mueve con transformaciones mientras se arrastra; se vuelve a dibujar al soltar.
  - Muestras por cuadro ≈ ancho × alto de pantalla.
- **Siguiente:**
  1. Capa vectorial de OSM con nombres de calles, procesada fuera del juego (Geofabrik está bloqueado desde la nube).
  2. La Maqueta en La Red.
  3. Casillas G‑60 a G‑63 en un acercamiento.

6. **Verificación:** comparar capturas del juego con fotos de la galería (`arte/galeria.md`) y con el mapa; lista de “detalles mal diseñados” marcada uno por uno. El autor puede señalar los que vea con capturas.

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
