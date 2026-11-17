# 08 · Cómo entregar el arte y cómo se integra al juego

## 1. Orden recomendado (de más a menos impacto)
1. **Ancla de estilo** (G‑00). Sin ella, todo lo demás sale disparejo.
2. **Personajes y retratos** (G‑01 a G‑10).
3. **Sprites cenitales de vehículos** (C‑01, C‑02).
4. **Capas panorámicas** de 2 zonas (centro y norte), de día y de noche (M‑01 a M‑04).
5. **Hojas de casas y barrios** (G‑60 a G‑63) y **texturas** (M‑10).
6. **Estaciones y vehículos de perfil** (G‑20 a G‑37).
7. **Íconos y logros** (C‑10 a C‑12).
8. **Consola de cabina** (C‑20, C‑21).
9. **Fiestas**: variantes (G‑53 a G‑55), decoraciones (C‑50) y ambiente (M‑20 a M‑26).
10. **Arte clave** (C‑40, C‑41, M‑30).

Una entrega parcial **ya sirve**: integro lo que llegue y el resto sigue con el dibujo actual del juego.

## 2. Carpetas y nombres
```
arte/entregas/
  00_ancla/        ancla_estilo.png
  personajes/      per_<nombre>_hoja.png · ret_<nombre>_<neutra|alegre>.png · spr_<nombre>_cenital.png
  vehiculos/       spr_vehiculos_<sistema|calle>.png · veh_lado_<tipo>.png
  estaciones/      est_lado_<estacion>.png
  panoramicas/     pan_<zona>_<dia|tarde|noche|alumbrados>_<1lejana|2cerros|3laderas|4ciudad>.png
  casillas/        cas_<tema>_hoja.png
  texturas/        tex_<material>.png
  cabinas/         cab_<consola_vertical|consola_horizontal|bus>.png
  iconos/          ico_<modos|acciones|logros>.png
  clave/           clave_<compartir|carga|portada>.png
  fiestas/         fiesta_sprites.png · <archivo>_<feria|alumbrados|velitas|lluvia|noche|tarde>.png
```
- Todo en **minúsculas**, sin tildes ni espacios (`parque_berrio`, no `Parque Berrío`).
- **PNG** para todo, salvo el arte clave y el de ambiente (puede ser JPG de buena calidad).
- **Fondo transparente o magenta plano `#FF00FF`.** Nunca blanco ni con degradado.
- Opcional, pero muy útil: un `.txt` con el mismo nombre y **el prompt que funcionó**, para repetir o corregir.

## 3. Cómo me lo entregas (elige una)
1. **Aquí mismo:** adjunta las imágenes (o un `.zip` por carpeta) en esta conversación y dime “ya está el arte de …”.
2. **GitHub:** en el repositorio, rama `ccr-2a67f935-oat714`, entra a `arte/` → *Add file* → *Upload files* y súbelas en la carpeta `entregas/` con la estructura de arriba.
3. **Google Drive:** crea una carpeta “El Metro · Arte” con las mismas subcarpetas y compárteme el enlace. Si el conector de Drive está activo en la sesión, la leo directamente.

## 4. Qué hago yo con el arte (integración)
1. **Inventario y revisión** con la lista de control de la biblia (vista, paleta, fondo, legibilidad, sin texto ni logos). Lo que no cumpla vuelve con una corrección concreta para la IA.
2. **Limpieza:** quito el magenta (transparencia), recorto y alineo a la cuadrícula.
3. **Reducción a pixel art:** escalo con vecino más cercano a la escala del juego (8 px/m en sprites, 64 px por casilla) y **cuantizo a la paleta** (máximo 32 colores) para que todo combine.
4. **Atlas:** junto las piezas en hojas (`src/art/*.png` + `*.json` con coordenadas), comprimidas para que el HTML único siga siendo liviano. Meta: menos de 4 MB de arte en total.
5. **Código con respaldo:** cada módulo usa el arte nuevo si existe y, si falta, sigue con el dibujo procedural actual. Así nada se rompe.

   | Arte | Dónde entra |
   |---|---|
   | Casillas | mapa (`10-map.js`) |
   | Sprites | `21-sprites.js` |
   | Capas | panorámica (`23-lado.js`) |
   | Vehículos de perfil | `30-conduce.js` y `52-cableviaje.js` |
   | Consola | `31-cabina.js` |
   | Retratos | diálogos (`37-trama.js`) |
   | Íconos | menús |
   | Arte clave | portada, íconos y `compartir.png` |
6. **Variantes por hora y fiesta:** el juego elige la capa según la hora y la fecha reales, con fundido entre ellas.
7. **Pruebas:** autotest, 100 partidas sin errores y capturas en Chromium en vertical y horizontal, de día y de noche.
8. **Publicación:** nueva versión en GitHub Pages, APK y bitácora actualizada.

## 5. Créditos y licencias
- Lo que generes con Gemini, ChatGPT o Midjourney bajo tu cuenta es **tuyo** según los términos de cada servicio (revísalos). Lo registro en `arte/CREDITOS.md` cuando llegue.
- Las fotos de `galeria.md` son solo **referencia**. Si alguna se usa tal cual en el juego, se cita con su licencia.
