---
name: el-metro-arte
description: Dirección de arte y producción de imágenes para el videojuego "El Metro" (Metro de Medellín). Cubre las paletas HEX, las vistas y escalas, los personajes y las reglas (sin texto ni logos, fondo magenta); el reparto de encargos entre Gemini Nano Banana (G-) y ChatGPT (C-); y la revisión, entrega e integración del arte al juego. Úsala al generar, encargar, revisar o integrar cualquier imagen, sprite, ícono, panorámica o mosaico del juego.
---

# El Metro · arte

## Dónde está todo
| Archivo | Qué contiene |
|---|---|
| `arte/06-guia-unica-ia.md` | **Guía única**: contexto completo, roles, encargos G‑ y C‑, correcciones, entrega y bitácora |
| `arte/CONTEXTO-IA.md` | Contexto y bitácora en un archivo, para subir a un Gem o a un Proyecto |
| `arte/00-biblia-de-estilo.md` | Reglas visuales completas |
| `arte/01` a `arte/05` | Referencias de juegos, Medellín visual, historia, folclor y fiestas, diseño |
| `arte/galeria.md` | Fotos de referencia con licencia libre |

## Concepto
**“Medellín de verdad, dibujada con cariño”.**
- Ciudad vista desde arriba en pixel art denso y acogedor.
- Panorámica de siluetas por capas con bruma.
- Vista isométrica dimétrica 2:1.
- 3D low‑poly limpio.
- Interfaz editorial con los colores de las líneas del Metro como acentos.

> El fondo crema de la interfaz (`#f1ece0`) es **decisión del autor**: viene de la revista EMSAY. Si otra skill de diseño lo marca como cliché, se mantiene igual.

## Reglas para toda imagen
- Luz desde arriba a la izquierda; **sin sombra proyectada** (la pone el juego).
- Contorno `#141414` fino en personajes y vehículos.
- Máximo 32 colores, tomados de la paleta.
- **Fondo magenta plano `#FF00FF`** o transparente; nunca blanco.
- **Prohibido:** texto (salvo pedido y en español), logos o marcas reales, marcas de agua, violencia, alcohol, cigarrillo y pólvora en manos de niños.
- Arte **original**: no se copian juegos ni artistas.
- No se usan capturas de Google Maps ni de Google Earth como base.

## Paletas clave
**Líneas:**

| A | B | T | K | J | H | L | M | P | MP1 | MP2 |
|---|---|---|---|---|---|---|---|---|---|---|
| `#1C5C9C` | `#E38835` | `#59AB42` | `#B8CF40` | `#F6C538` | `#EB318E` | `#8E612A` | `#743D90` | `#EC343A` | `#0E6F76` | `#65A9AC` |

**Ciudad:**
- asfalto `#3b3f45`
- andén `#c9c1ad`
- ladrillo `#b4583a` y `#9a4630`
- teja `#a8452f`
- losa `#9e9a92`
- pasto `#4f8a3c`
- árbol `#2f6b35`
- río `#5f7f73`
- concreto `#a9a59b`
- vidrio `#9fd3e6`

**Interfaz:**
- papel `#f1ece0`
- tinta `#154a80`
- negro `#141414`
- manteca `#fbe7b0`

## Vistas y escalas
| Vista | Regla |
|---|---|
| Cenital 3/4 | ~15° de inclinación; casilla de 20 m (entrega a 64 px por casilla) |
| Sprites de vehículos | Vista superior pura, mirando a la derecha, **1 m = 8 px** |
| Peatones | 16×16 px por cuadro, 4 cuadros |
| Panorámica | Perfil puro, sin cielo, capas anchas (21:9 o más) |
| Isométrica | Dimétrica 2:1 (~26,6°) |
| Cabina | 9:16 y 16:9, con el parabrisas en magenta |
| Retratos | Busto 3/4 mirando a la derecha |
| Íconos | 128 px, planos, contorno grueso |

## Reparto de encargos
- **Gemini Nano Banana, encargos G‑:** ancla de estilo (G‑00), personajes, foto → estilo, variantes de hora y fiesta, casas de barrio, panorámicas (G‑70 a G‑73), ambientes de fiesta (G‑80 a G‑86), conceptos isométricos (G‑90) y repintado de mosaicos base (G‑100).
- **ChatGPT, encargos C‑:** sprites cenitales con transparencia, íconos e insignias, cabina, letreros, portadas, decoraciones de fiesta y texturas (C‑60).
- Cada IA **solo hace lo suyo**. Los prompts exactos están en la guía única.

## Revisión (antes de aceptar una imagen)
1. ¿La vista es correcta?
2. ¿Los colores son de la paleta y la línea tiene su color?
3. ¿El fondo es plano?
4. ¿No tiene sombra proyectada, ni texto, ni logos?
5. ¿Se lee bien en pequeño?
6. ¿Tiene el nombre exacto del encargo (minúsculas, sin tildes)?

## Integración al juego
1. Lo entregado va en `arte/entregas/<carpeta>/` (estructura en la guía única, Bloque 5).
2. Se quita el magenta (transparencia) y se recorta a la cuadrícula.
3. Se reduce con **vecino más cercano** a la escala del juego y se **cuantiza a la paleta**.
4. Se arman **atlas** en `src/art/` (PNG o WebP más un JSON de coordenadas), embebidos en el HTML. La meta es menos de 4 MB de arte.
5. Se conecta el arte, siempre con respaldo al dibujo procedural:

   | Arte | Archivo |
   |---|---|
   | Casillas | `10-map.js` |
   | Sprites | `21-sprites.js` |
   | Capas | `23-lado.js` |
   | Vehículos de perfil | `30-conduce.js`, `52-cableviaje.js` |
   | Consola | `31-cabina.js` |
   | Retratos | `37-trama.js` |
   | Íconos | menús |
   | Isométrico | vista nueva (ver skill `medellin-fiel`) |
6. Se prueba con `node tools/test.mjs 100` y capturas, y se publica (skill `el-metro-desarrollo`).
