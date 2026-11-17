# 06 · Guía de prompts · PARTE 1: Gemini “Nano Banana”

> **Nano Banana** es el modelo de imágenes de Gemini (Gemini 2.5 Flash Image). Si tu cuenta tiene **Nano Banana Pro**, úsalo para lo que lleve texto o necesite más resolución.
> **Para qué lo usamos:** lo que mejor hace es **mantener el mismo personaje y el mismo estilo** entre imágenes, **editar con palabras** (“ahora de noche”) y **combinar fotos de referencia** con nuestro estilo.
> **Lo que NO le pedimos aquí:** fondos panorámicos pintados, texturas repetibles y portada con letras (eso va en la Parte 2: ChatGPT y Midjourney).

## 0. Antes de empezar
1. Lee la **biblia de estilo** (`00-biblia-de-estilo.md`): paletas, vistas y tamaños.
2. Ten a mano las **fotos de referencia** de la Galería (`arte/index.html`). Descarga desde su página de origen las que vayas a subir a Gemini como referencia.
3. Abre **una conversación nueva por tanda** (personajes, vehículos de perfil, estaciones, variantes). Gemini mantiene mejor el estilo dentro de la misma conversación.
4. Gemini no da fondos transparentes: pide siempre **fondo magenta plano `#FF00FF`**. Yo lo quito después.
5. Deja **margen libre en las esquinas**, por si la imagen sale con marca de agua visible.
6. **Nombra cada archivo** como dice cada encargo (`08-entregas-e-integracion.md`).

## 1. Prompt base (pégalo al empezar cada conversación)
```
Vas a ser el artista de un videojuego para celulares llamado "El Metro", sobre el Metro de Medellín (Colombia) y su ciudad real. Reglas de estilo para TODAS las imágenes de esta conversación:
- Estilo: pixel art moderno y limpio, con formas simples y silueta legible a tamaño pequeño; mezcla de pixel art denso y acogedor con ilustración plana. Nada fotorrealista.
- Paleta limitada (máximo 32 colores) basada en: ladrillo #b4583a y #9a4630, teja #a8452f, asfalto #3b3f45, andén #c9c1ad, pasto #4f8a3c, árbol #2f6b35, río #5f7f73, concreto #a9a59b, vidrio #9fd3e6, tinta #154a80, negro #141414, papel #f1ece0. Colores de líneas del Metro: A #1C5C9C, B #E38835, T #59AB42, K #B8CF40, J #F6C538, H #EB318E, L #8E612A, M #743D90, P #EC343A, Metroplús #0E6F76.
- Luz suave desde arriba a la izquierda. SIN sombra proyectada en el piso (el juego la pone).
- Contorno oscuro fino (#141414) en personajes y vehículos.
- Fondo: magenta plano #FF00FF sin degradados ni textura, salvo que te pida otra cosa.
- Prohibido: texto, letras, números, logos o marcas reales, marcas de agua, armas, violencia. Para todo público.
- Deja margen libre alrededor del objeto.
Confirma con "Listo" y espera mi primer encargo.
```

## 2. El ancla de estilo (lo primero que se genera)
**G‑00 · Tablero de estilo** → `ancla_estilo.png`
```
Crea un tablero de estilo cuadrado (1:1) dividido en 4 recuadros, todo en el mismo estilo de pixel art del juego:
1) arriba a la izquierda: una manzana de barrio de Medellín vista desde arriba con leve inclinación (se ven techos y la fachada de abajo): casas de ladrillo naranja a la vista, terrazas planas con tanques de agua negros, una calle gris con andén y un árbol;
2) arriba a la derecha: un tren de metro de tres coches visto de perfil, carrocería clara con franja azul #1C5C9C, sobre un viaducto de concreto;
3) abajo a la izquierda: tres personas paisas caminando vistas de frente (una abuela con uniforme azul de conductora y termo de café, un joven con morral, una vendedora con delantal);
4) abajo a la derecha: una ladera de montaña verde llena de casitas de ladrillo, con un Metrocable de cabinas pequeñas pasando por encima.
Fondo de cada recuadro: papel #f1ece0. Sin texto.
```
✅ Cuando te guste, **guárdalo** y **adjúntalo en cada conversación nueva** con: “Usa EXACTAMENTE el estilo de la imagen adjunta”.

## 3. Personajes (la mayor fortaleza de Nano Banana)
Haz **primero la hoja del personaje** y luego pide sus variantes **en la misma conversación**, adjuntando la hoja.

**G‑01 · Hoja de Rosalba** → `per_rosalba_hoja.png`
```
[adjunta ancla_estilo.png] Usa exactamente el estilo de la imagen adjunta.
Hoja de personaje (16:9) de ROSALBA, 60 años, conductora del Metro de Medellín a punto de jubilarse: pelo canoso recogido (#dcd8d0), piel clara cálida (#f1c9a5), uniforme azul #12446c con una franja #1C5C9C en el pecho (sin logos), pañoleta, termo de tinto (café) en la mano, sonrisa cálida y mirada sabia.
Muéstrala de cuerpo entero en 4 vistas en fila: frente, tres cuartos, perfil y espalda. Debajo, 3 caras: neutra, alegre y emocionada (con lágrimas de felicidad). Fondo magenta plano #FF00FF. Sin texto.
```
**G‑02 · Retratos para diálogo** → `ret_rosalba_neutra.png`, `ret_rosalba_alegre.png`
```
Con el mismo personaje de la hoja anterior, haz un retrato de busto en tres cuartos mirando hacia la derecha, cuadrado (1:1), en pixel art de 64×64 píxeles ampliado (píxeles grandes y nítidos), expresión NEUTRA. Fondo magenta plano. Luego repite idéntico con expresión ALEGRE.
```
**G‑03 · Sprite cenital del personaje** → `spr_rosalba_cenital.png`
```
El mismo personaje visto desde ARRIBA (vista cenital pura, como en los juegos clásicos de ciudad vistos desde el cielo): se ve la coronilla canosa, los hombros con el uniforme azul y los brazos. Hoja de 4 cuadros de caminar en fila, mirando hacia la derecha. Pixel art de 16×16 píxeles por cuadro, ampliado. Fondo magenta. Sin sombra.
```
Repite G‑01 a G‑03 con estos personajes (fichas en la biblia, sección 8):

| ID | Personaje | Descripción corta para el prompt |
|---|---|---|
| G‑04 | **La nieta** (protagonista) | 16 años, pelo oscuro, chaqueta azul #1C5C9C, morral, tenis blancos, mirada curiosa |
| G‑05 | **Don Efraín** | 65 años, bigote y pelo blancos, chaqueta gris #5a6470, audífonos de radio al cuello |
| G‑06 | **Doña Marleny** | 55 años, ruana roja #c8201f, delantal, termo y canasta de arepas, pelo negro recogido |
| G‑07 | **Wílmar** | 40 años, piel morena #8a5a3b, camisa blanca, gorra azul, bigote corto, risa fácil |
| G‑08 | **Agente de tránsito** | 35 años, chaleco reflectivo verde‑amarillo #c7e000, casco blanco, silbato, postura amable |

**G‑09 · Pasajeros variados** → `per_pasajeros_hoja.png`
```
[ancla] Hoja (16:9) con 8 pasajeros diferentes de Medellín, de cuerpo entero y de frente: estudiante universitaria con morral, abuelo con sombrero aguadeño y carriel, señora con bolsa de mercado, obrero con casco, hincha de fútbol con camiseta verde, turista con mapa, niño con uniforme de colegio, mujer con bebé en canguro. Variedad de pieles (#f1c9a5, #d9a77f, #b07a52, #8a5a3b, #5e3b26). Fondo magenta. Sin texto ni logos.
```
Luego: “Ahora los mismos 8 vistos desde arriba, 4 cuadros de caminar cada uno, 16×16 px por cuadro, en una cuadrícula de 8 filas”.

**G‑10 · Gente de la calle** → `per_calle_hoja.png`
- vendedor de tinto con termo;
- vendedora de arepas con carrito;
- vendedor de chontaduro con carreta;
- lustrabotas;
- **silletero** con silleta de flores a la espalda;
- músico con guitarra;
- ciclista en bici pública;
- 3 perros: criollo café, negro y manchado.

Pídelo con el mismo formato: de frente y desde arriba.

## 4. De la foto real a nuestro estilo (adjunta una foto de la galería)
Aquí Nano Banana **conserva la estructura real** y cambia el estilo. Adjunta **la foto + el ancla de estilo**.

**G‑20 · Estación elevada de perfil** → `est_lado_parque_berrio.png`
```
[adjunta foto de la estación + ancla_estilo.png] Redibuja la estación de metro de la foto como una ilustración de PERFIL perfecto (vista lateral plana, sin perspectiva), en el estilo de la imagen de ancla: estructura de concreto gris claro, cubierta metálica, andén con línea amarilla, escaleras. Conserva la forma real de la estación. Formato 4:1 horizontal. Fondo magenta plano. Sin letreros ni texto.
```
Haz lo mismo con estas estaciones:

| ID | Estación | Notas para el prompt |
|---|---|---|
| G‑21 | San Antonio | Cruce de líneas A y B |
| G‑22 | Niquía | Estación terminal |
| G‑23 | Una estación de **Metroplús** | Plataforma en el separador de la avenida, puertas de vidrio |
| G‑24 | Una estación de **Metrocable** | Estructura metálica y cubierta |
| G‑25 | Una parada del **tranvía de Ayacucho** | Plataforma a nivel de calle |

**G‑30 · Tren de perfil** → `veh_lado_metro_a.png`
```
[foto de un tren del Metro de Medellín + ancla] Convierte el tren de la foto en un sprite de PERFIL perfecto mirando a la derecha: 3 coches con cabina en los extremos, ventanas, puertas marcadas, pantógrafo; franja del color #1C5C9C. Formato 8:1 horizontal. Fondo magenta. Sin logos ni texto.
```
Variantes:

| ID | Vehículo | Notas para el prompt |
|---|---|---|
| G‑31 | Tren más nuevo | Otra generación de trenes |
| G‑32 | Tranvía | 3 módulos, verde #59AB42 |
| G‑33 | Cabina de Metrocable | Hazla en los **6 colores de línea** (K, J, L, H, M, P) en una fila |
| G‑34 | Articulado de Metroplús | 18 m, #0E6F76, fuelle oscuro en la mitad |
| G‑35 | Alimentador | Bus blanco con franja |
| G‑36 | Buseta tradicional | De colores |
| G‑37 | Chiva | Bus escalera pintado a mano, para la Feria |

**G‑40 · Laderas con barrios** (para la panorámica) → `pan_ladera_casas.png`
```
[foto de una comuna en ladera + ancla] Convierte esta ladera llena de casas en una capa de fondo para un juego de vista lateral: silueta de montaña con casitas de ladrillo apiladas que suben desde abajo y se vuelven bosque verde arriba. Estilo plano de ilustración con detalle pixelado en las casas. Formato 4:1 horizontal. La parte de arriba de la montaña sobre fondo magenta plano. Sin texto.
```

## 5. Variantes por edición (misma imagen, otra hora o fiesta)
Adjunta la imagen ya aprobada y pide **solo el cambio**: Nano Banana conserva todo lo demás.

| ID | Pide así | Archivo |
|---|---|---|
| G‑50 | “La misma imagen, ahora **de noche**: cielo no, solo ventanas cálidas #ffd27a encendidas (no todas), faroles #ffb347, sin cambiar las formas.” | `…_noche.png` |
| G‑51 | “La misma imagen, al **atardecer**: luz dorada desde la derecha, sombras más largas.” | `…_tarde.png` |
| G‑52 | “La misma imagen **bajo la lluvia**: superficies brillantes, charcos, gente con paraguas de colores.” | `…_lluvia.png` |
| G‑53 | “La misma imagen en **Alumbrados de diciembre**: figuras y guirnaldas de luces de colores (#fff1c1, #ffc23d, #e83e8c, #2ec4f1) sobre las estructuras.” | `…_alumbrados.png` |
| G‑54 | “La misma imagen en la **Feria de las Flores**: guirnaldas y silletas de flores (#9b3faf, #f7c325, #d7263d, #f28c28).” | `…_feria.png` |
| G‑55 | “La misma imagen en la **Noche de las Velitas**: velas y faroles de papel en el andén.” | `…_velitas.png` |

## 6. Casillas de barrio desde arriba (apoyo al atlas)
**G‑60 · Hoja de casas de barrio** → `cas_barrio_hoja.png`
```
[ancla] Hoja cuadrada con una cuadrícula de 4×4 casillas, cada una es una casa o lote de un barrio de Medellín vista desde arriba con leve inclinación (techo y franja de fachada inferior): techos de losa gris con tanque de agua negro, techos de teja de barro, terrazas con ropa colgada y matas, una casa sin terminar con varillas, una casa pintada de verde menta, otra amarilla, otra rosada; ladrillo naranja a la vista. Todas del mismo tamaño y alineadas a la cuadrícula. Fondo magenta entre casillas. Sin sombra proyectada.
```
También en hojas de 4×4, con el mismo formato:
- **G‑61:** edificios de El Poblado (ladrillo y vidrio, azoteas con aire acondicionado).
- **G‑62:** parques, plazas, canchas y árboles (incluye guayacán amarillo y rosado).
- **G‑63:** orillas del río, quebradas, escaleras de la Comuna 13 y grafitis vistos desde arriba.

## 7. Problemas comunes y cómo pedir la corrección
| Problema | Dile esto |
|---|---|
| Cambió el estilo | “Vuelve EXACTAMENTE al estilo de la imagen adjunta (ancla). Mismos colores, mismo grosor de píxel.” |
| Metió texto o un logo | “Quita todo el texto, letras, números y logos. Deja las superficies lisas.” |
| La vista salió en perspectiva | “Vista de perfil PERFECTA, ortográfica, sin punto de fuga.” / “Vista cenital PURA desde arriba.” |
| El fondo no es plano | “Fondo magenta #FF00FF completamente plano, sin sombra ni degradado.” |
| Se ve borroso | “Píxeles grandes, nítidos y cuadrados; sin desenfoque ni suavizado.” |
| El personaje cambió de cara | “Es el MISMO personaje de la hoja adjunta: misma cara, peinado, ropa y colores.” |

## 8. Lista de entrega de esta parte
Ancla (G‑00) · personajes y retratos (G‑01 a G‑10) · estaciones de perfil (G‑20 a G‑25) · vehículos de perfil (G‑30 a G‑37) · ladera (G‑40) · variantes (G‑50 a G‑55) · hojas de casillas (G‑60 a G‑63).
Entrégalo según `08-entregas-e-integracion.md`.
