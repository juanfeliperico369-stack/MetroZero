# Entregas de arte · inventario y verificación

Lo que entregaron **Gemini (Artista 1, encargos G‑)** y **ChatGPT (Artista 2, encargos C‑)**, revisado por Claude Code el **17‑nov‑2026** e integrado al juego en **v0.6.0**.

- **Qué se integró al juego y dónde:** [`USO-EN-EL-JUEGO.md`](USO-EN-EL-JUEGO.md). Lo genera `python3 tools/arte_juego.py`.
- **Cómo se usa en el código:** `Atlas` en `src/js/19-atlas.js`. Si falta una imagen, el juego dibuja su respaldo procedural.

## 1. Qué llegó

| Archivo recibido | Tamaño | SHA‑256 (inicio) | Qué tenía | Dónde quedó |
|---|---:|---|---|---|
| `El_Metro_-_Documento_Maestro_y_Biblia_Visual_con_Arte_Incrustado.pdf` (Gemini) | 4,8 MB | `414bee23cdf44d54` | 20 láminas a resolución completa (G‑00 a G‑100) | `gemini/*.jpg`, con el nombre del encargo |
| `El_Metro_-_Documento_Maestro_Completo_1.md` (Gemini) | 27 KB | `75de91fc118a4091` | Cuestionario, 9 reglas aprendidas, catálogo de láminas, código propuesto | `gemini/documento-maestro-gemini.md` |
| `EL_METRO_MAESTRO_TOTAL-2.md` (ChatGPT) | 1,4 MB | `20683446bc8ba1fe` | Inventario C‑, anexos con 92 SVG, 8 scripts, 9 manifiestos y una auditoría | `chatgpt/` y `docs/auditorias/` |
| `01_Guia_y_vehiculos.pdf` … `04_Vistas_y_arte_historico.pdf` (ChatGPT) | 0,7–1,2 MB c/u | `29eb7b21…` `d8eb07b3…` `eeebfb3d…` `207ea1d3…` | Miniaturas (≤ 233 px) de todo lo C‑ | Se usaron para verificar; las texturas quedaron en `chatgpt/texturas/` |
| `05_Contexto_y_codigo_1.pdf`, `06_Contexto_y_codigo_2.pdf` | 0,4 MB c/u | `3ae1538b…` `90f9fd85…` | Texto de nuestro documento único (sin cambios) | No se copió: es `EL-METRO-TODO.md` |
| `00_PRUEBA_DE_SUBIDA_1_PAGINA.pdf` | 45 KB | `6f98d92c…` | Prueba de subida, sin imágenes | No se copió |

Los PDF no se guardan en el repositorio: pesan mucho y su contenido ya está extraído aquí.

## 2. Gemini · encargos G‑ (20 láminas)

| Lámina | Encargo | Estado | Nota |
|---|---|---|---|
| `G-00_ancla-de-estilo.jpg` | G‑00 | ✅ | Fija el estilo: pixel art grueso con contorno oscuro |
| `G-01-03_rosalba.jpg` | G‑01, G‑02, G‑03 | ✅ **en el juego** | 4 vistas, **3 retratos** (neutra, alegre, llorosa) y 4 sprites cenitales |
| `G-04_nieta.jpg` · `G-05_don-efrain.jpg` | G‑04, G‑05 | ✅ **en el juego** | Mismo formato que Rosalba; retratos en la misma posición (sirven para animar gestos) |
| `G-06-08_marleny-wilmar-agente.jpg` | G‑06 a G‑08 | ✅ **en el juego** | Cuerpo, busto y sprite cenital de cada uno |
| `G-09_pasajeros.jpg` · `G-10_gente-de-la-calle.jpg` | G‑09, G‑10 | ✅ (pasajero **en el juego**) | 8 pasajeros, vendedores, silletero, músico, ciclista y perros, de frente y cenitales |
| `G-20-25_estaciones-de-perfil.jpg` | G‑20 a G‑25 | ✅ pendiente | Para la panorámica lateral (Fase 2 del arte) |
| `G-30-37_vehiculos-de-perfil.jpg` | G‑30 a G‑37 | ✅ pendiente | Metro de 3 coches, Metroplús, tranvía, cabinas, alimentador, buseta y chiva |
| `G-40-55_ladera-y-variantes.jpg` | G‑50 a G‑55 | ✅ (atardecer **en el juego**) | 6 variantes con el cielo magenta (transparente): noche, atardecer, lluvia, alumbrados, feria y velitas. **Falta la base de día (G‑40)** |
| `G-60…`, `G-61…`, `G-62-63…` | G‑60 a G‑63 | ✅ pendiente | 48 casillas en 3/4. A 16 px por casilla (la escala del mapa cenital) perderían el detalle: van para un acercamiento o para la vista isométrica |
| `G-70-73_panorama-dia.jpg` · `…-noche.jpg` | G‑70 a G‑73 | ✅ **en el juego** | Cielo magenta = transparente; el juego pone su propio cielo detrás |
| `G-80-81_silleteros-y-alumbrados.jpg` · `G-82-86_…` | G‑80 a G‑86 | ✅ **en el juego** | Silleteros, alumbrados, velitas, tango (homenaje a Gardel), Comuna 13, Arví y aguacero |
| `G-90_isometrico-centro.jpg` · `G-100_…` · `G-90_…-cuatro-regiones.jpg` | G‑90, G‑100 | ✅ (centro **en el juego**) | Dimétrica 2:1 correcta; guía visual de la Maqueta 2:1 |

**Revisión con la lista de control:** sin texto ni logos, sin sombras proyectadas, fondo magenta plano donde tocaba, personajes coherentes entre láminas, paleta del proyecto. Los recortes salen de una segmentación automática del fondo magenta (las cajas están en `tools/arte_juego.py`).

## 3. ChatGPT · encargos C‑ (13 familias, 124 recursos)

| Carpeta | Encargos | Estado |
|---|---|---|
| `chatgpt/svg/iconos/c10_modos` | C‑10 · 9 íconos de modos | ✅ **en el juego** (tarjetas del menú) |
| `chatgpt/svg/iconos/c11_acciones` | C‑11 · 12 íconos de acciones | ✅ **en el juego** (cabina y Ciudad Libre) |
| `chatgpt/svg/iconos/c12_logros` | C‑12 · 20 medallas | ✅ **en el juego** (libreta de logros; trajo 2 logros nuevos: Feria de las Flores y Alumbrados) |
| `chatgpt/svg/portadas` | C‑40 portada · C‑41 pantalla de carga | ✅ **en el juego** (portada, historia y capítulos 7 y 8) |
| `chatgpt/svg/fiestas` | C‑50 · 21 piezas | ✅ (11 **en el juego**: adornos de la portada según la fiesta del día) |
| `chatgpt/svg/senalizacion` | C‑30 · 16 piezas | ✅ pendiente (placas por línea, flechas, torniquete) |
| `chatgpt/svg/cabinas` | C‑20, C‑21 · consolas con parabrisas magenta | ✅ pendiente (cabina 3D) |
| `chatgpt/vehiculos` | C‑01 a C‑03 · 27 vehículos y puertas a 8 px/m | ✅ regenerados con su script: **31 de 33 PNG idénticos byte a byte** a los entregados. Son “prototipos técnicos”: el procedural del juego se mantiene |
| `chatgpt/texturas` | C‑60 · 10 texturas | ⚠️ solo miniaturas de 183 px (los PNG de 1024 px venían en un ZIP que no llegó) |
| `chatgpt/scripts`, `chatgpt/manifiestos` | Reproducibilidad | ✅ 8 scripts y 9 manifiestos, tal como se entregaron |

## 4. Afirmaciones verificadas y corregidas

- **“v0.5.1 Medellín Minimalista y Fiel” (Gemini):** no existe en el repositorio ni se publicó; era el nombre de su documento. El juego pasó de v0.5.0 a **v0.6.0**.
- **“Línea O #00A99D” (Gemini):** la Línea O **sí existe, pero es de buses eléctricos** por la avenida 80 (de la estación Caribe a La Palma, en Belén). El **Metro de la 80 será la Línea E, de color rosado**. El HEX `#00A99D` no está verificado; no se usa.
- **Código propuesto por Gemini (`src/data/arte-minimal.js`):** no se copió. En `src/data/` lo borraría `const EM = window.EM = {…}` de `00-core.js`; además ya hay retratos reales. Se adoptó la idea (respaldo por id) en `Atlas`.
- **Auditoría del servidor local (ChatGPT):** **confirmada y corregida**. Detalle en `docs/auditorias/2026-11-17-servidor-local.md`.
- **“473 comprobaciones sin errores” (ChatGPT):** son controles de su paquete de arte, no partidas. Las pruebas del juego siguen siendo `node tools/test.mjs 100`.

## 5. Qué falta pedir

1. **ChatGPT:** subir el ZIP maestro (los PNG de 1024 px de las texturas C‑60).
2. **Gemini:** la base de día de la ladera (**G‑40**).
3. **Siguiente ronda (Fase 2 del arte):** estaciones y vehículos de perfil en la panorámica; casillas 3/4 en un acercamiento de Ciudad Libre; consolas C‑20/C‑21 en la cabina; señalética C‑30 en las estaciones.
