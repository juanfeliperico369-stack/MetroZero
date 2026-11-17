# 07 · Guía de prompts · PARTE 2: ChatGPT y Midjourney

> **ChatGPT (generador de imágenes):** sigue instrucciones largas al pie de la letra, escribe **texto legible** y puede entregar **PNG con fondo transparente**. Lo usamos para sprites, íconos, consola de cabina, letreros y portada con título.
> **Midjourney:** da la **mejor atmósfera pintada**. Lo usamos para las capas panorámicas, el arte clave, el ambiente de las fiestas y las **texturas repetibles** (`--tile`). En Midjourney los prompts van **en inglés** porque funciona mejor.
> Las dos herramientas deben seguir la **biblia de estilo** (`00-biblia-de-estilo.md`). Nunca pongas nombres de otros juegos ni de artistas en los prompts: describe el estilo con palabras, para que el arte sea **original**.

---

## PARTE 2A · ChatGPT

### 0. Instrucción base (pégala al empezar la conversación)
```
Vas a crear arte para "El Metro", un videojuego para celulares sobre el Metro de Medellín (Colombia). Reglas para todas las imágenes de esta conversación:
1) Pixel art moderno y limpio, siluetas legibles en tamaño pequeño, contorno oscuro fino #141414 en vehículos y personas.
2) Paleta limitada a: ladrillo #b4583a, teja #a8452f, asfalto #3b3f45, andén #c9c1ad, pasto #4f8a3c, árbol #2f6b35, concreto #a9a59b, vidrio #9fd3e6, tinta #154a80, papel #f1ece0, negro #141414, y los colores de línea del Metro: A #1C5C9C, B #E38835, T #59AB42, K #B8CF40, J #F6C538, H #EB318E, L #8E612A, M #743D90, P #EC343A, Metroplús #0E6F76.
3) Luz desde arriba a la izquierda, SIN sombra proyectada.
4) FONDO TRANSPARENTE (PNG). Si no puedes, fondo magenta plano #FF00FF.
5) Prohibido: logos o marcas reales, marcas de agua, armas, violencia. Para todo público.
6) Solo pon texto cuando yo lo pida y en español.
Responde "Listo" y espera el primer encargo.
```
**Tamaños de ChatGPT:**
- 1024×1024 (cuadrado);
- 1536×1024 (horizontal), para hojas de sprites y portadas;
- 1024×1536 (vertical), para cabina y pantalla de carga.

Si tienes la imagen ancla de Gemini (`ancla_estilo.png`), **adjúntala** y di: “mismo estilo que la imagen adjunta”.

### 1. Sprites de vehículos vistos desde arriba
**C‑01 · Hoja de vehículos del sistema** → `spr_vehiculos_sistema.png`
```
Hoja de sprites horizontal (1536×1024), fondo transparente. Vehículos vistos desde ARRIBA en vista cenital pura (solo se ve el techo y un poquito de los costados), todos mirando hacia la DERECHA, alineados en filas con espacio entre ellos, a la misma escala (1 metro = 8 píxeles):
fila 1: coche de metro con cabina (22 m, techo plateado con equipos de aire y pantógrafo, franja #1C5C9C a los lados), coche intermedio, coche con cabina hacia atrás;
fila 2: tranvía de 3 módulos verde #59AB42; bus articulado de 18 m #0E6F76 con techo blanco y fuelle oscuro en la mitad;
fila 3: bus alimentador blanco con franja; buseta de colores; chiva colombiana (bus escalera pintado a mano, techo con parrilla);
fila 4: cabinas de metrocable vistas desde arriba en 6 colores (#B8CF40, #F6C538, #8E612A, #EB318E, #743D90, #EC343A).
Sin sombra, sin texto, sin logos.
```
**C‑02 · Hoja de vehículos de la calle** → `spr_vehiculos_calle.png`
```
Misma vista cenital pura, fondo transparente, mirando a la derecha, escala 1 m = 8 px: taxi amarillo #f2c400 con aviso en el techo, 6 carros particulares de colores (rojo, azul, blanco, gris, negro, verde), camioneta de servicio azul del metro con platón, moto con conductor con casco, bicicleta pública verde con ciclista, carrito de vendedor ambulante, ambulancia, camión pequeño de mercado. Ordenados en una cuadrícula.
```
**C‑03 · Animación de puertas** → `spr_puertas_bus.png`: “El bus articulado de la hoja C‑01 en 3 cuadros: puertas cerradas, medio abiertas y abiertas (puertas del lado izquierdo), vista cenital, fondo transparente”.

### 2. Íconos de interfaz
**C‑10 · Íconos de modos** → `ico_modos.png`
```
Set de 9 íconos cuadrados (128×128 cada uno) en una cuadrícula de 3×3, fondo transparente. Estilo: ícono plano de afiche con contorno negro grueso, máximo 2 colores más negro, esquinas suaves, sin texto. Íconos: 1) ciudad libre (manzana con edificio y persona caminando), 2) bus articulado de frente, 3) tren de metro de frente con franja azul, 4) cabina de metrocable colgando del cable, 5) libro abierto con un tren (historia), 6) brújula con una Cívica (guía), 7) mapa de líneas de colores (la red), 8) dos celulares conectados (juntos), 9) palanca de arcade (arcade).
```
**C‑11 · Íconos de cabina y acciones** → `ico_acciones.png`: “Mismo estilo, 12 íconos: llave, flechas de sentido, mano de vigilante (hombre muerto), megáfono de anuncio, puertas izquierda, puertas derecha, pito, cámara de fotos, lupa, persona corriendo, adelantar ⏩, tarjeta Cívica genérica (sin logos)”.
**C‑12 · Insignias de logros** → `ico_logros.png`
```
20 insignias redondas tipo medalla en cuadrícula de 5×4, fondo transparente, estilo afiche con contorno negro, sin texto: primer viaje, frenada al centímetro, mano firme, punta a punta (tren largo), puesto de control (agujas), carril exclusivo (bus articulado), ciudad colgante (cabinas), diez de diez (estrellas), gerente (gráfica), la última vuelta (taza de tinto humeante), enciclopedia (libro), turno de noche (luna), antes del primer tren (madrugada con farol), duelo (dos manos), en red (antena), costumbre (calendario), bolsillo lleno (monedero), ni una gota (tinto en equilibrio), feria de las flores (silleta), alumbrados (estrella de luces).
```

### 3. Cabina y tableros
**C‑20 · Consola del metro** → `cab_consola_vertical.png` (1024×1536) y `cab_consola_horizontal.png` (1536×1024)
```
Ilustración en primera persona desde el asiento del conductor de un tren de metro moderno: abajo, la consola con palanca combinada de tracción y freno a la derecha, llave de activación, selector de sentido, botones grandes iluminados (sin texto, con placas vacías para poner etiquetas después), velocímetro analógico con aguja, pantalla LED ámbar vacía y lámparas de señal. Arriba, el parabrisas ocupa la mitad superior y debe quedar en MAGENTA PLANO #FF00FF (allí el juego dibuja la vía). Colores de interior: gris grafito, azul #1C5C9C, detalles ámbar. Estilo pixel art limpio y detallado. Sin logos ni texto.
```
**C‑21 · Tablero del bus** → `cab_bus.png`: el mismo encargo para un **bus articulado**: timón grande, palanca de puertas, validador de tarjeta, espejo; parabrisas en magenta.

### 4. Letreros (sin nombres; el juego escribe el texto)
**C‑30 · Señalética** → `ui_letreros.png`: “Letreros de estación en blanco (placas rectangulares con borde de color de línea), un panel LED de próximo tren apagado, flechas de salida, el símbolo de la línea amarilla del andén y un torniquete visto de frente. Fondo transparente, sin texto”.

### 5. Portada, compartir y carga (aquí SÍ va texto)
**C‑40 · Portada horizontal (compartir 1200×630)** → `clave_compartir.png`
```
Ilustración horizontal 1536×1024 (se recorta a 1200×630): un tren de metro claro con franja azul #1C5C9C cruza un viaducto al atardecer sobre el río de Medellín; detrás, montañas con laderas llenas de casitas de ladrillo que empiezan a encenderse, un metrocable de cabinas de colores sube por la ladera, gallinazos en el cielo naranja y violeta. Estilo: ilustración plana por capas con detalle de pixel art. Arriba a la izquierda el título "EL METRO" en letras condensadas gruesas color crema #fbe7b0 con borde #141414, y debajo "La última vuelta" en letra más pequeña. Sin logos reales.
```
**C‑41 · Pantalla de carga vertical** → `clave_carga.png` (1024×1536): “La misma escena en vertical, con Rosalba (abuela conductora con uniforme azul y tinto) mirando la ciudad desde el andén, de espaldas. Sin texto”.

### 6. Decoraciones de fiesta (sprites cenitales)
**C‑50** → `fiesta_sprites.png`: hoja con fondo transparente y vista cenital:
- pétalos sueltos de colores (8 tipos);
- silleta de flores vista desde arriba;
- faroles de papel (rojo, verde y amarillo) y velas;
- guirnaldas de luces en tramos rectos y en curva;
- figuras de luz de Navidad vistas desde arriba (estrella, flor, pesebre sencillo);
- banderines de la Feria.

---

## PARTE 2B · Midjourney (en inglés)

### 0. Configuración recomendada
- Versión: la más reciente (`--v 7` o superior).
- Usa `--style raw` para que respete mejor el prompt.
- **Consistencia de estilo:** sube `ancla_estilo.png` y úsala como **referencia de estilo**: arrastra la imagen a la casilla de “Style Reference” o añade `--sref <URL de tu imagen>`. Con `--sw 50` a `200` controlas cuánto pesa.
- Siempre `--no text, letters, logo, watermark, signature`.
- Para alargar una capa panorámica, usa **Pan** (izquierda o derecha) o **Zoom Out** en el editor. Yo empato los bordes al final.
- **Texturas repetibles:** `--tile` (solo para texturas, no para capas panorámicas).

### 1. Capas panorámicas (vista lateral del metro, el tranvía y el cable)
Estructura: genera **4 capas por zona y hora**, cada una por separado, sobre **fondo plano**: el cielo lo pinta el juego.

**M‑01 · Cordillera lejana** → `pan_<zona>_<hora>_1lejana.png`
```
side view parallax background layer for a 2D game, distant Andes mountain range silhouette above a long narrow valley (Medellín, Colombia), flat shapes with soft atmospheric haze, subtle ridge highlight, color #7f9fbf fading to #a8c0d8 at the base, no sky (plain flat magenta #FF00FF above the ridge), wide horizontal strip, clean vector-like illustration --ar 4:1 --style raw --no text, letters, logo, watermark, buildings
```
**M‑02 · Cerros intermedios** → `…_2cerros.png`: “rolling green hills silhouette in front of distant mountains, few scattered red-brick houses at the bottom, flat illustration, color #5f8f86, plain flat magenta background above, side view --ar 4:1 --style raw --no text, logo”.

**M‑03 · Laderas con barrios** → `…_3laderas.png`
```
side view of a steep green hillside densely covered with small stacked red-brick houses (exposed orange brick #b4583a, flat concrete roofs with black water tanks, colorful painted facades), houses climbing from the valley floor and fading into green forest near the top, a thin cable car line with tiny cabins crossing the slope, flat illustration with crisp pixel-art detail in the houses, plain flat magenta background above the ridge --ar 4:1 --style raw --no text, logo, watermark
```
**M‑04 · Ciudad cercana** → `…_4ciudad.png`: “side view of a dense Latin American city skyline in the valley: mid-rise red-brick apartment buildings, a few glass towers, a large brick cathedral dome, trees, all as flat silhouettes with simple windows, plain magenta background above --ar 4:1 --style raw --no text, logo”.

**Zonas:** `norte` (Bello: casas bajas, fábricas antiguas), `centro` (catedral de ladrillo, edificios altos, aguja), `occidente` (San Javier y Comuna 13: laderas muy pobladas y grafitis), `nororiente` (Santo Domingo: biblioteca de rocas negras en lo alto), `sur` (Poblado: torres de vidrio y ladrillo, mucho verde), `ayacucho` (calle que sube con casas de colores).
**Horas** (cámbialas en el prompt):
- `dia`: “bright midday light”;
- `tarde`: “golden hour, warm orange and violet haze”;
- `noche`: “night, thousands of warm window lights #ffd27a scattered on the hillside”;
- `alumbrados`: “December night with colorful Christmas light figures along the river”.

### 2. Texturas repetibles (para el 3D y el mapa)
**M‑10** → `tex_<material>.png`
```
seamless tileable texture, top-down orthographic, exposed orange clay brick wall with light mortar joints, flat even lighting, pixel-art friendly, limited palette #b4583a #9a4630 #c8714d #d8c3a5 --tile --ar 1:1 --style raw --no text, logo, shadows
```
Cambia el material:
- teja de barro (`#a8452f`);
- asfalto con grietas suaves (`#3b3f45`);
- andén de baldosa (`#c9c1ad`);
- concreto de viaducto (`#a9a59b`);
- balasto con traviesas;
- pasto (`#4f8a3c`);
- agua del río café verdosa (`#5f7f73`);
- techo de eternit ondulado;
- adoquín de plaza.

### 3. Arte de ambiente de las fiestas (referencias para todo el equipo)
**M‑20 · Feria de las Flores**
```
illustrated scene of a flower parade in Medellín: farmers carrying huge wooden frames full of flowers on their backs (silletas) along a wide avenue, crowds cheering, orchids, sunflowers, carnations, bright August sun, an elevated metro viaduct in the background, joyful family atmosphere, flat illustration with pixel-art details --ar 16:9 --style raw --no text, logo, watermark
```
Cambia la escena:
- **M‑21 Alumbrados:** “river at night lined with giant colorful Christmas light figures, families walking, metro train crossing a lit viaduct”.
- **M‑22 Velitas:** “hillside neighborhood at dusk, every doorstep with candles and colorful paper lanterns”.
- **M‑23 Tango:** “1930s vintage propeller plane and a tango dancing couple silhouette at dusk, homage atmosphere”.
- **M‑24 Comuna 13:** “covered outdoor escalators climbing a colorful hillside with huge murals”.
- **M‑25 Arví:** “cable car cabins entering a misty pine forest above the city”.
- **M‑26 Aguacero:** “afternoon tropical rain over the city, shiny streets, colorful umbrellas, buses with headlights”.

### 4. Arte clave y regiones
**M‑30 · Portada pintada** (sin texto; el título lo pone el juego o ChatGPT)
```
key art for a cozy open-world transit game set in Medellín, Colombia: a sunrise over a long valley, an elevated metro train with a blue stripe crossing over the river, cable car cabins climbing hillsides covered in red-brick houses, an elderly train driver woman with a thermos of coffee smiling at the window, warm golden light, layered flat illustration with crisp pixel details, hopeful and tender mood --ar 16:9 --style raw --no text, letters, logo, watermark
```
**M‑40 · Mapas de concepto por región** (guía para el atlas cenital): “top-down slightly tilted view of a Medellín neighborhood block: red-brick houses with flat roofs and black water tanks, narrow streets with parked cars, a small park with a soccer court, a corner store with a colorful awning, cozy dense pixel-art style, soft light from top-left --ar 1:1 --style raw --no text, logo”. Hazlo para centro, ladera, Poblado, río y estación de metro.

### 5. Correcciones rápidas
| Problema | Agrega o cambia |
|---|---|
| Salió texto o letras | `--no text, letters, typography, signage` |
| Demasiado realista | `flat illustration, simple shapes, limited palette` y baja `--s` a 50–100 |
| Muy recargado | `clean, minimal, generous negative space` |
| Perspectiva torcida en capas laterales | `orthographic side view, no perspective, horizon perfectly level` |
| No respeta el estilo | Sube `--sw` y usa la misma `--sref` en todo |
| Bordes que no empatan | Usa **Pan** para alargar; yo hago el empate final |

---

## Reparto de trabajo (resumen)
| Herramienta | Encargos |
|---|---|
| **Gemini Nano Banana** (Parte 1) | Ancla de estilo, personajes (hojas, retratos, sprites), foto → estilo (estaciones y vehículos de perfil), ladera desde foto, variantes de hora y fiesta, hojas de casas de barrio |
| **ChatGPT** (Parte 2A) | Sprites cenitales de vehículos con transparencia, íconos y logros, consola de cabina y tablero del bus, letreros en blanco, portada con título, decoraciones de fiesta |
| **Midjourney** (Parte 2B) | Capas panorámicas por zona y hora, texturas `--tile`, arte de ambiente de fiestas, portada pintada, conceptos de región |

Entrégalo todo según `08-entregas-e-integracion.md`.
