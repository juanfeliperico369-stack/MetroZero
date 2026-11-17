# 00 · Biblia de estilo de *El Metro*

> Las reglas visuales que debe cumplir **todo** el arte, lo haga una persona, Gemini, ChatGPT o Midjourney. Si una imagen no cumple esto, no entra al juego.

## 1. Concepto en una frase
**“Medellín de verdad, dibujada con cariño”**:
- la ciudad real del mapa de EnCicla;
- con la densidad de un pueblo en pixel art (Town Brush, GTA 2);
- el cielo y las montañas en capas de ilustración (Alto's Odyssey);
- un 3D de maqueta limpia (Grand Mountain Adventure);
- una interfaz editorial con los colores de las líneas del Metro (revista EMSAY + Industry Art).

## 2. Paletas maestras
**Líneas del sistema** (acentos de interfaz, vehículos y señalética)
| A | B | T | K | J | H | L | M | P | Metroplús 1 | Metroplús 2 |
|---|---|---|---|---|---|---|---|---|---|---|
| `#1C5C9C` | `#E38835` | `#59AB42` | `#B8CF40` | `#F6C538` | `#EB318E` | `#8E612A` | `#743D90` | `#EC343A` | `#0E6F76` | `#65A9AC` |

**Interfaz (papel editorial)**
- papel `#f1ece0`
- crema `#faf6ec`
- manteca `#fbe7b0`
- tinta `#154a80`
- negro `#141414`
- noche `#0f2a45`
- noche 2 `#163a5c`
- gris `#9aa1a8`
- blanco `#fdfbf5`

**Ciudad de día (cenital)**
- asfalto `#3b3f45`
- andén `#c9c1ad`
- ladrillo `#b4583a` / `#9a4630`
- teja `#a8452f`
- losa `#9e9a92`
- eternit `#8f9497`
- pasto `#4f8a3c`
- árbol `#2f6b35`
- río `#5f7f73`
- concreto `#a9a59b`
- vidrio `#9fd3e6`
- tanque de agua `#1d1f24`

**Panorámica por hora**
| Hora | Colores |
|---|---|
| Día | cielo `#3f8bd0`→`#d6ecf3`, cordillera `#7f9fbf`, cerros `#5f8f86`, laderas `#3f7f4a`, suelo `#36663b` |
| Atardecer | `#3d2e5f` `#8e5b7a` `#f08a5d` `#f4d9a8` |
| Noche | `#08122a` `#1a2b4f`, ventanas `#ffd27a` `#ffb347` |

**Gente**
- Pieles: `#f1c9a5` `#d9a77f` `#b07a52` `#8a5a3b` `#5e3b26`.
- Ropa: `#c8201f` `#12446c` `#2f9b57` `#c3952f` `#ff6a3d` `#7a5cc4` `#f9e4a4` `#141414` `#1b8088`.

**Fiestas:** ver `04-folklore-y-fiestas.md`, sección D.

## 3. Luz
- **Cenital:** el sol viene de **arriba a la izquierda**; las sombras caen **abajo a la derecha a 45°**, en negro al 25–30 %. Al mediodía las sombras son cortas; en la mañana y la tarde, largas. El juego mueve la sombra según la hora: las imágenes deben venir **sin sombra proyectada** (va aparte) y con un leve volumen interno (cara iluminada / cara en sombra).
- **Noche:** ventanas cálidas `#ffd27a` (que no se enciendan todas), faroles `#ffb347` con halo suave, faros blancos y luces traseras rojas. El juego oscurece el resto.
- **Lluvia:** superficies brillantes, reflejos verticales de las luces, paraguas de colores.

## 4. Vistas, escalas y tamaños de entrega
La IA no entrega tamaños exactos de pixel art. Por eso **se genera grande y limpio**, y yo lo reduzco, cuantizo y recorto. Lo importante son la **vista**, las **proporciones** y el **fondo plano**.

| Vista | Uso en el juego | Proyección | Entrega |
|---|---|---|---|
| **Cenital 3/4** | Ciudad Libre, bus | Desde arriba con ~15° de inclinación: se ve el techo y una franja de la fachada sur | Casillas de 20 m → **64×64 px** (3,2 px/m); hojas de 8×8 casillas = 512×512 px |
| **Sprites de vehículos** | Todos los modos cenitales | Vista superior pura, **mirando a la derecha (+x)**, sin sombra | **8 px/m**: carro 36×16, taxi 36×16, moto 16×8, bici 14×6, buseta 64×20, alimentador 96×20, articulado 144×20, tren (1 coche) 176×24, cabina de cable 24×24 |
| **Peatones y NPC** | Mundo | Vista superior, cabeza un poco grande | 16×16 por cuadro, 4 cuadros de caminar, 8 variantes |
| **Panorámica lateral** | Metro, tranvía y cable | Perfil puro, sin cielo (lo pinta el juego) | Capas de **2048×512** repetibles en X: cordillera, cerros, laderas con barrios, ciudad cercana, primer plano |
| **Vehículos de perfil** | Panorámica | Perfil puro mirando a la derecha | Tren de 3 coches 1536×192; tranvía 1024×160; cabina 192×192; bus 768×160 |
| **Cabina 1ª persona** | Metro (y luego bus) | Desde el asiento del conductor | 1080×1920 y 1920×1080, con el **parabrisas en magenta `#FF00FF`** (ahí se ve la vía) |
| **Interiores isométricos** (futuro) | Estaciones | Isométrico 2:1 en pixel art | Piezas de 128×64 px |
| **Retratos** | Diálogos de la historia | Busto 3/4, mirada a la derecha | 512×512, fondo plano; neutra y alegre |
| **Íconos de interfaz** | Botones, mapa, logros | Frontal plano, trazo grueso | 128×128, 2 colores + negro, sin texto |
| **Arte clave** | Portada, compartir, carga | Ilustración | 1200×630 (compartir), 1080×1920 (carga) |

**Fondo:** magenta plano `#FF00FF` (o verde `#00FF00` si el objeto es rosado o morado) cuando la herramienta no da transparencia. Si da PNG transparente, mejor.

## 5. Línea y forma
- **Sprites** (vehículos, gente): contorno oscuro `#141414` de 1 px a escala final, formas simples, **silueta legible a 20 px**.
- **Edificios y casillas:** sin contorno negro grueso; borde 1 px más oscuro del mismo tono; techos con 2–3 tonos.
- **Panorámica:** sin contornos; formas planas con bandas de color; detalle solo en el filo de los cerros y en las casas.
- **3D low‑poly:** caras planas, sin texturas fotográficas.

## 6. Reglas de pixel art (para lo que se pixela)
- **≤ 32 colores** por recurso, tomados de las paletas de arriba; bandas de 3–4 tonos, no degradados suaves.
- Píxeles cuadrados, sin desenfoque ni anti‑aliasing en el resultado final (yo cuantizo la imagen de la IA).
- Animaciones a 8–12 cuadros por segundo: caminar en 4 cuadros, puertas en 3, luces en 2.

## 7. Tipografía e interfaz
- **Títulos:** letra condensada, en mayúsculas, gruesa (la “Titulos” del juego).
- **Texto:** humanista legible (la “Cuerpo”).
- **LED de cabina:** monoespaciada ámbar.
- Botones grandes (mínimo 44 px), bordes negros de 3 px, sombra dura desplazada (estilo afiche).
- Franja con los colores de las líneas en la parte superior.
- **Nada de texto dentro de las imágenes generadas**: los textos los pone el juego. Excepción: letreros de estación cuando se pidan.

## 8. Personajes principales (fichas de diseño)
| Personaje | Edad | Ropa y colores | Rasgos |
|---|---|---|---|
| **Rosalba** | ~60 | Uniforme de conductora azul `#12446c` con franja `#1C5C9C`, pañoleta, termo de **tinto** | Pelo canoso recogido `#dcd8d0`, gafas en el bolsillo, sonrisa cálida |
| **La nieta (tú)** | 16 | Chaqueta azul de la línea A, morral, tenis blancos | Pelo oscuro, mirada curiosa |
| **Don Efraín** | ~65 | Chaqueta gris `#5a6470`, camisa clara, audífonos de radio | Bigote blanco, pelo blanco corto |
| **Doña Marleny** | ~55 | Ruana roja `#c8201f`, delantal, termo de arepas | Pelo negro recogido, manos de trabajo |
| **Wílmar** | ~40 | Camisa blanca, gorra azul `#1C5C9C` | Piel morena `#8a5a3b`, bigote corto, risa fácil |
| **Agente de tránsito** | ~35 | Chaleco reflectivo verde‑amarillo `#c7e000`, casco blanco, silbato | Postura firme y amable |
| **Pasajeros** | variados | Ropa de la paleta “gente” | Estudiantes, abuelos, trabajadores, turistas, deportistas |

## 9. Qué sí y qué no
**Sí:**
- ladrillo, montaña, río y metro elevado;
- flores y luces en fechas reales;
- gente diversa en su rutina;
- perros;
- vendedores con carrito;
- buses de colores.

**No:**
- logos o marcas reales;
- personajes de otros juegos;
- armas, violencia, alcohol, cigarrillo o pólvora en manos de niños;
- estereotipos;
- texto ilegible o en inglés dentro de las imágenes;
- marcas de agua;
- estilos “de película de narcos”.

## 10. Lista de control antes de entregar un recurso
1. ¿Vista y proyección correctas (cenital 3/4, superior pura, perfil, cabina)?
2. ¿Colores dentro de la paleta, con el color de línea correcto?
3. ¿Fondo transparente o magenta plano, sin sombra proyectada?
4. ¿Silueta legible en pequeño?
5. ¿Sin texto ni logos (salvo lo pedido)?
6. ¿Nombre de archivo según `08-entregas-e-integracion.md`?
