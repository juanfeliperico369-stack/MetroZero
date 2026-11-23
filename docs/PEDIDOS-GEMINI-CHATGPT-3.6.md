# Pedidos para Gemini y ChatGPT · El Metro 3.6 «Ciudad viva» (23‑nov‑2026, Claude)

> **Reparto del autor (nov‑2026):**
> - **Gemini y Antigravity:** las tareas fáciles y medianas.
> - **ChatGPT y Codex:** las fuertes.
> - **Arte:** lo hacen Gemini (Nano Banana) y ChatGPT, que hace las mejores imágenes.
> - **Código y commits:** Antigravity y Codex, cada uno en su rama de `juanfeliperico369-stack/MetroZero`. Nunca en `main` ni en `ccr-2a67f935-oat714`.
>
> Los **prompts listos para pegar** están al final (sección 4).

---

## 1. Qué falta (evaluación del 23‑nov, con El Metro 3.6.0)

Todo lo medido sale de `tools/auditoria-jugabilidad.mjs` y `tools/medir-3d.mjs`. Corren en Chromium sin tarjeta gráfica, que es el peor caso: un celular modesto.

| # | Falta | Evidencia | A quién |
|---|---|---|---|
| 1 | **El 3D sigue caro.** A calidad alta, la vista 3p da 6 cuadros por segundo y la cen3d 9. Cada cuadro tiene 774–786 mil vértices y 98–126 llamadas de dibujo. La 3.6 ya recortó la red de transporte (830 mil vértices) por celdas de 800 m. Faltan los edificios (`bld`), el terreno lejano y las cajas de los vehículos, que van de a una por llamada. | `tools/medir-3d.mjs` | **Codex** (CX‑36‑1) |
| 2 | **No hay contrarreloj ni fantasma.** El reto del día (3.6) da una razón para volver, pero no hay contra quién correr ni forma de compartir. | Plan de evolución, sección 6 | **Codex** (CX‑36‑2) |
| 3 | **Falta un modo de estrategia propio de un metro:** «Un día de operación», un roguelite tipo Mini Metro sobre la red real. | Plan, secciones 5.2 y 6 | **Codex** (CX‑36‑3) |
| 4 | **Bicis y motos no se inclinan en las curvas.** Motor City 5.2 ya lo calcula: φ = atan(v·ω/g). | Informe del motor, 5.2 | **Antigravity** (GA‑36‑1) |
| 5 | **En 3D, mover la cámara y manejar se estorban.** Motor City 4.8 lo resolvió con la pantalla en mitades. | Informe del motor, 4.8 | **Antigravity** (GA‑36‑2) |
| 6 | **Las 6 subtramas no dejan huella.** Se decide y se cobra, pero nadie lo recuerda: no hay diario, ni noticia, ni reputación por barrio a la vista. | `src/js/36c-actividades.js` | **Antigravity** (GA‑36‑3) |
| 7 | **Arte pendiente:** las medallas `logro_intermodal` y `logro_ciclista`, y los íconos `ico_modo_carrera` e `ico_modo_tranvia`. Hoy van con respaldo procedural. | `src/js/19-atlas.js` (`pend`) | **ChatGPT** (C‑71) |
| 8 | **Arte de lo nuevo:** el reto del día, el modo zen, «Medir mi celular», las zonas de skate y las subtramas no tienen ícono ni ilustración. | 3.4–3.6 | **ChatGPT** (C‑70, C‑72) y **Gemini** (G‑110 a G‑112) |

---

## 2. Pedidos para Gemini (arte) y Antigravity (código)

### Arte · Gemini (Nano Banana)
Siempre con las reglas del Bloque 4 de `arte/06-guia-unica-ia.md`:
- sin texto ni logos;
- fondo transparente o **magenta plano #FF00FF**;
- luz desde arriba a la izquierda y sin sombra proyectada;
- paleta del juego.

**G‑110 · «Domingo zen»: panorámica al amanecer.** Cuatro capas de paralaje de 2048 × 512 px, para el modo zen del corredor.
- **Escena:** la ciclorruta de la Avenida Las Vegas al amanecer, con el río Medellín, los árboles de la orilla y las montañas del oriente con niebla baja.
- **Paleta del amanecer:** #F6C538 y #E38835 en el cielo, #8fb8d8 en la niebla y #59AB42 en los árboles.
- **Capas y nombres:** `g110_zen_cielo.png` (sin transparencia), `g110_zen_montana.png`, `g110_zen_ciudad.png` y `g110_zen_frente.png` (estas tres, con fondo magenta).
- **Carpeta:** `arte/entregas/panoramicas/`.

**G‑111 · Las 6 subtramas: una escena cada una.** 1024 × 768 px, en el estilo de las escenas de la historia (ilustración plana, cálida y de Medellín).
- **Escenas y nombres:**
  - Hora pico en San Antonio, andén de integración de las líneas A y B: `esc_sub_pico_sa.png`.
  - Convivencia en la ciclovía de Parques del Río, ciclistas de EnCicla y jóvenes en skate: `esc_sub_ciclo_rio.png`.
  - Niebla espesa sobre la loma, cabinas de la Línea L rumbo a Arví: `esc_sub_niebla_arvi.png`.
  - Música en el paseo del tranvía de Ayacucho, con un guitarrista: `esc_sub_guitarra_t.png`.
  - Nudo vial en Industriales, con buses del Metroplús y semáforos: `esc_sub_cruce_ind.png`.
  - Una bici EnCicla fuera del anclaje en la Unidad Deportiva Atanasio Girardot: `esc_sub_bici_estadio.png`.
- **Colores de línea:** A #1C5C9C, B #E38835, tranvía #59AB42, L #8E612A y Metroplús 1 #0E6F76.
- **Carpeta:** `arte/entregas/clave/`.

**G‑112 · Las 6 zonas de skate vistas desde arriba.** 1024 × 1024 px, en planta cenital, con fondo magenta fuera del piso.
- **Contenido:** el piso de cada zona con sus rampas, barandas, bancas y escaleras. Se usarán como calcomanía del suelo en 2D y en 3D.
- **Zonas:**
  - Parques del Río;
  - Skatepark Ciudad del Río;
  - Unidad Deportiva Atanasio;
  - Pies Descalzos (parkour);
  - Parque Explora y Carabobo;
  - Corredor Cultural Ayacucho.
- **Nombres:** `tex_skate_parques_rio.png`, `tex_skate_ciudad_rio.png`, `tex_skate_atanasio.png`, `tex_skate_pies_descalzos.png`, `tex_skate_explora.png` y `tex_skate_ayacucho.png`.
- **Carpeta:** `arte/entregas/texturas/`.

### Código · Antigravity (rama `ia/antigravity/<tema>-3.7`)
Siempre **en módulos aditivos**, sin romper el guardado `elmetro.v1`, y con `node tools/build.mjs && node tools/test.mjs 100` en 0 errores.

**GA‑36‑1 · Inclinación en las curvas** (de Motor City 5.2, `Cuerpo._ladear`).
- **Qué:** bici, moto, patineta, monopatín y patines se inclinan con φ = clamp(atan(v·ω/9,81), ±0,45 rad), suavizado. El vehículo y el piloto juntos.
- **Dónde:** en el 3D de Ciudad Libre y en el corredor.
- **Aceptación:** prueba que mida φ ≈ atan(v·ω/g) en una curva sintética; capturas a 412 × 860.

**GA‑36‑2 · Pantalla en mitades en el 3D** (de Motor City 4.8, `MC.Controles`).
- **Qué:** arriba se arrastra la cámara; abajo se maneja. El joystick no se suelta al mover la cámara.
- **Dónde:** opción en Ajustes → ⚙️ Flexibilidad.
- **Aceptación:** prueba de dos dedos con Playwright: el vehículo sigue con el joystick mientras gira la cámara.

**GA‑36‑3 · Las subtramas dejan huella.**
- **Qué:** cada decisión de `36c-actividades.js` deja tres cosas:
  - una línea en un **diario** que se lee desde el menú de Ciudad Libre;
  - una **noticia** que la gente comenta (usa `EM.ciudadViva` y `FRASES_CIUDAD`);
  - la **reputación del barrio**, visible en el letrero del lugar.
- **Además:** la gente que espera en estaciones y bancas usa las frases con `lugar: 'paradero'` y `'banca'` de `src/js/96e1-frases-ciudad.js`, generado con `node tools/frases_ciudad.mjs`.
- **Aceptación:** el diario se guarda con valor por defecto en `newSave()`; prueba en `90-bot.js`.

**GA‑36‑4 · Meter el arte G‑110 a G‑112 al juego cuando llegue**, siempre con respaldo procedural. Va el zen con su panorámica, las subtramas con su escena y las zonas con su piso.

---

## 3. Pedidos para ChatGPT (arte) y Codex (código)

### Arte · ChatGPT
Mismas reglas del Bloque 4. Los íconos siguen el formato de **C‑10**: 256 × 256 px, figura simple de trazo grueso y color plano de la paleta, legible a 48 px, con fondo transparente o magenta.

**C‑70 · Íconos de lo nuevo (3.4–3.6).** Carpeta `arte/entregas/iconos/`.
- `ico_reto.png`: una estrella sobre una hoja de calendario. Colores #F6C538 y #154a80.
- `ico_zen.png`: un sol saliendo sobre una franja verde de ciclorruta. Colores #F6C538 y #59AB42.
- `ico_medir.png`: un velocímetro con la aguja a la derecha. Colores #1C5C9C y #F6C538.
- `ico_skate.png`: una patineta saltando sobre una baranda. Colores #E38835 y #154a80.
- `ico_ciclovia.png`: una bicicleta sobre una franja verde con línea punteada. Colores #59AB42 y #f1ece0.

**C‑71 · Medallas y los íconos de modo que faltan.** 256 × 256 px, medalla redonda con cinta.
- **Medallas nuevas:**
  - `logro_racha7`: 7 días seguidos de reto;
  - `logro_combo8`: un combo ×8 en el corredor;
  - `logro_zen`: recorrer Las Vegas en el modo zen.
- **Las que siguen pendientes desde la 2.0:**
  - `logro_intermodal`: metro, cable y bus en un viaje;
  - `logro_ciclista`: devolver una EnCicla;
  - `ico_modo_carrera`: corredor por ciclorruta;
  - `ico_modo_tranvia`: tranvía de Ayacucho, #59AB42.
- **Carpeta:** `arte/entregas/iconos/`.

**C‑72 · Portada 3.6 «Ciudad viva».** Dos tamaños: 1080 × 1920 (vertical) y 1920 × 1080.
- **Escena:** la ciudad desde un vagón de la Línea A al atardecer, con un ciclista en la ciclorruta abajo, la gente en el andén y el metrocable al fondo.
- **Reglas:** sin texto ni logos.
- **Nombres y carpeta:** `portada_36_vertical.png` y `portada_36_horizontal.png`, en `arte/entregas/clave/`.

### Código · Codex (rama `ia/codex/<tema>-3.7`)
Mismas reglas: módulos aditivos, guardado intacto y 0 errores en `node tools/test.mjs 100`.

**CX‑36‑1 · Rendimiento 3D a fondo.**
- **Medir antes y después:** con `node tools/medir-3d.mjs`.
- **Qué:**
  - recorte por celdas para `G3.bld` y `G3.far` (la clase `MBC` de `src/js/22-gl.js` ya existe para la red de transporte);
  - lotes para las cajas dinámicas: `G3.box` acumula en un solo búfer por cuadro y se dibuja una vez;
  - detalle por distancia para los edificios lejanos.
- **Aceptación:**
  - en calidad alta, menos de 400 mil vértices y menos de 120 llamadas por cuadro;
  - 3p a 12 cuadros por segundo o más en `medir-3d.mjs`, hoy 6;
  - las capturas sin cambios visibles a menos de 700 m.

**CX‑36‑2 · Contrarreloj con fantasma.**
- **Qué:** en el metro, el bus y el corredor se graba la mejor vuelta de cada tramo (posición en el tiempo, cada 0,1 s) y se reproduce como un fantasma translúcido. El reto del día (`EM.reto`, en `src/js/96f-reto.js`) muestra tu mejor marca. El fantasma se comparte con un código QR (`src/js/05-qr.js`).
- **Aceptación:** el fantasma repite el tramo con menos de 1 m de error; el guardado tiene valor por defecto.

**CX‑36‑3 · «Un día de operación»** (roguelite tipo Mini Metro, sobre la red real).
- **Qué:**
  - de 4:30 a. m. a 11 p. m.;
  - la demanda crece con las horas pico;
  - entre jornadas eliges mejoras al azar: un tren más, un andén largo o un bus de apoyo;
  - termina cuando una estación se satura;
  - cada partida es distinta.
- **Dónde:** modo nuevo `48-operacion.js`, que la coordinación ya reserva como zona Z5, y 🎮 en las estaciones (`EM.actividades`).
- **Aceptación:** partida de 5 a 10 minutos; el bot la juega en `tools/test.mjs`.

---

## 4. Prompts para pegar

### 4.1 Gemini · arte (Nano Banana)
```
Eres el Artista 1 de «El Metro», un videojuego familiar sobre el Metro de Medellín. Antes de dibujar, lee la guía completa
(arte/06-guia-unica-ia.md del repositorio juanfeliperico369-stack/MetroZero; si no tienes acceso, usa estas reglas):
sin texto ni logos; fondo transparente o magenta plano #FF00FF; luz desde arriba a la izquierda y sin sombra proyectada;
paleta del juego (papel #f1ece0, tinta #154a80, azul A #1C5C9C, naranja B #E38835, tranvía #59AB42, Metroplús 1 #0E6F76,
mostaza #F6C538, rojo #EC343A, L Arví #8E612A); Medellín real (ladrillo, lomas, río, metrocables) y para todo público.
Haz, en este orden y uno por uno, mostrándome cada imagen antes de seguir:
1) G-110 «Domingo zen»: 4 capas de paralaje 2048×512 de la ciclorruta de la Avenida Las Vegas al amanecer, con el río Medellín,
   los árboles de la orilla y las montañas del oriente con niebla. Nombres: g110_zen_cielo (sin transparencia), g110_zen_montana,
   g110_zen_ciudad y g110_zen_frente (fondo magenta).
2) G-111: seis escenas 1024×768, ilustración plana y cálida: hora pico en el andén de San Antonio (líneas A y B);
   ciclistas de EnCicla y jóvenes en skate en Parques del Río; niebla sobre la Línea L rumbo a Arví; un guitarrista en el paseo
   del tranvía de Ayacucho; buses del Metroplús en el cruce de Industriales; una bici EnCicla fuera del anclaje en el Atanasio
   Girardot. Nombres: esc_sub_pico_sa, esc_sub_ciclo_rio, esc_sub_niebla_arvi, esc_sub_guitarra_t, esc_sub_cruce_ind,
   esc_sub_bici_estadio.
3) G-112: seis plantas cenitales 1024×1024 de zonas de skate (piso con rampas, barandas, bancas y escaleras; fondo magenta fuera
   del piso): Parques del Río, Ciudad del Río, Unidad Deportiva Atanasio, Pies Descalzos, Parque Explora y Carabobo, Corredor
   Ayacucho. Nombres: tex_skate_parques_rio, tex_skate_ciudad_rio, tex_skate_atanasio, tex_skate_pies_descalzos,
   tex_skate_explora, tex_skate_ayacucho.
Entrega en PNG con el nombre exacto, en minúsculas y sin tildes, y al final escribe en 5 líneas qué hiciste, qué te costó
y qué reglas aprendiste para tus instrucciones del Gem.
```

### 4.2 Antigravity (Gemini) · código
```
Eres Antigravity, IA de código de «El Metro» (repositorio juanfeliperico369-stack/MetroZero). Haz el protocolo de CLAUDE.md/GEMINI.md
(lee todo, responde el cuestionario, compila y juega). Parte de la rama ccr-2a67f935-oat714 (El Metro 3.6.0) en una rama tuya
ia/antigravity/<tema>-3.7, nunca en main. Lee docs/PEDIDOS-GEMINI-CHATGPT-3.6.md (sección 2) y haz, en módulos aditivos:
GA-36-1 inclinación de bici/moto/patineta en las curvas (φ = atan(v·ω/g), de Motor City 5.2), GA-36-2 pantalla en mitades en el
3D (arriba cámara, abajo manejo, de Motor City 4.8), GA-36-3 que las 6 subtramas de 36c-actividades.js dejen huella (diario,
noticia comentada por la gente con EM.ciudadViva y FRASES_CIUDAD, reputación del barrio visible) y GA-36-4 integrar el arte
G-110 a G-112 cuando llegue, con respaldo procedural. Reglas: no rompas el guardado elmetro.v1 (campos nuevos en newSave con valor
por defecto); mide con node tools/auditoria-jugabilidad.mjs y node tools/medir-3d.mjs antes y después (si el 3D baja, no
lo entregues); node tools/build.mjs && node tools/test.mjs 100 con 0 errores; capturas a 412×860 y 860×412. Al terminar:
bitácora (docs/BITACORA.md), aviso en .ai-coord/buzon/ y un informe de 5–10 líneas con qué hiciste, cómo lo probaste y qué falta.
```

### 4.3 ChatGPT · arte
```
Eres el Artista 2 de «El Metro», videojuego familiar del Metro de Medellín (repositorio juanfeliperico369-stack/MetroZero; si
puedes, lee arte/06-guia-unica-ia.md). Reglas: sin texto ni logos; fondo transparente o magenta plano #FF00FF; luz arriba a la
izquierda, sin sombra proyectada; paleta: papel #f1ece0, tinta #154a80, azul #1C5C9C, naranja #E38835, verde tranvía #59AB42,
mostaza #F6C538, rojo #EC343A. Los íconos siguen el formato C-10: 256×256, figura simple de trazo grueso y color plano, que se
lea a 48 px. Haz uno por uno y muéstrame cada uno:
C-70 íconos: ico_reto (estrella sobre hoja de calendario), ico_zen (sol saliendo sobre una franja verde de ciclorruta), ico_medir
(velocímetro con la aguja a la derecha), ico_skate (patineta saltando sobre una baranda), ico_ciclovia (bicicleta sobre franja
verde con línea punteada).
C-71 medallas redondas con cinta (256×256): logro_racha7 (7 días seguidos), logro_combo8 (combo ×8 en patineta), logro_zen
(amanecer en la ciclorruta), logro_intermodal (metro + cable + bus en un viaje), logro_ciclista (bici EnCicla devuelta al anclaje);
e íconos de modo: ico_modo_carrera (corredor por ciclorruta) e ico_modo_tranvia (tranvía verde #59AB42 de Ayacucho).
C-72 portada «Ciudad viva», 1080×1920 y 1920×1080: la ciudad vista desde un vagón de la Línea A al atardecer, un ciclista en la
ciclorruta de abajo, gente en el andén y el metrocable al fondo; sin texto. Nombres: portada_36_vertical, portada_36_horizontal.
Entrega PNG con el nombre exacto (minúsculas, sin tildes) y escribe al final qué reglas aprendiste para tu Proyecto.
```

### 4.4 Codex (ChatGPT) · código
```
Eres Codex, IA de código de «El Metro» (repositorio juanfeliperico369-stack/MetroZero). Haz el protocolo de AGENTS.md (lee todo,
cuestionario, compila, juega). Parte de ccr-2a67f935-oat714 (El Metro 3.6.0) en tu rama ia/codex/<tema>-3.7, nunca en main.
Lee docs/PEDIDOS-GEMINI-CHATGPT-3.6.md (sección 3) y haz, en este orden y en módulos aditivos:
CX-36-1 rendimiento 3D: recorte por celdas de G3.bld y G3.far (reusa la clase MBC de src/js/22-gl.js), lotes para G3.box (un búfer
por cuadro) y detalle por distancia. Meta: < 400 mil vértices y < 120 llamadas por cuadro en calidad alta, y 3p a 12 cuadros por
segundo o más en node tools/medir-3d.mjs (hoy 6), sin cambios visibles a menos de 700 m.
CX-36-2 contrarreloj con fantasma en metro, bus y corredor (posición cada 0,1 s, fantasma translúcido, mejor marca en el reto del
día EM.reto, compartir por QR con src/js/05-qr.js; error del fantasma < 1 m).
CX-36-3 «Un día de operación»: roguelite tipo Mini Metro sobre la red real (4:30 a. m.–11 p. m., demanda por horas pico, mejoras
al azar entre jornadas, termina cuando una estación se satura) en src/js/48-operacion.js, jugable por el bot y lanzable con 🎮 desde
las estaciones (EM.actividades).
Reglas: no rompas el guardado elmetro.v1 (valores por defecto en newSave); node tools/build.mjs && node tools/test.mjs 100 con
0 errores; mide antes y después con tools/medir-3d.mjs y tools/auditoria-jugabilidad.mjs y pon las cifras en docs/BITACORA.md;
aviso en .ai-coord/buzon/ e informe de 5–10 líneas (qué hiciste, cómo lo probaste, qué falta).
```
