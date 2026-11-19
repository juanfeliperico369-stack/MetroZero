# Entrega Unificada · Plan Único IA — **[El Metro]**

> **Proyecto:** **[El Metro]** (`MetroZero` · `https://github.com/juanfeliperico369-stack/MetroZero`)  
> **Versión base y motor compartido:** `El Metro v1.4.0` + `Motor del Valle 1.1.0` (`motor-valle/`)  
> **Regla de entrega cumplida:** Documento único en Markdown con arquitectura, código completo por archivo (`src/js/NN-nombre.js`), arte procedural (Canvas 2D / WebGL / SVG con colores HEX y medidas en metros y píxeles), reporte de pruebas automatizadas (`selfTest` + `monkey(100)`), +10 ideas innovadoras priorizadas por impacto/esfuerzo y lista de verificación.

---

## 1. Resumen Ejecutivo **[El Metro]**

### 1.1 Estado en que se encontró **[El Metro]**
Al auditar la rama activa del repositorio (`MetroZero`), el juego compilaba en un único archivo autónomo `dist/index.html` (~8,4 MB) capaz de funcionar 100 % sin conexión, con las capas del **Motor del Valle 1.0.0** (`src/data/valle.js`, `vias.js`, `edificios.js`, `puentes.js`, `ciudad.js`, `metroplus.js`, `metroplus_andenes.js`, `rutas_calles.js`, `encicla.js`), motor 3D WebGL propio (`src/js/22-gl.js`) sin librerías externas, 9 modos de juego y 18 personajes de la ciudad. Sin embargo, la auditoría inicial con `node tools/test.mjs 100` y la inspección visual/técnica revelaron los siguientes puntos abiertos del plan:

1. **Dos avisos geométricos en `selfTest` sobre la Línea O (`MPO`):**
   - `'MPO: Caribe (terminal) quedó a 273 m de su andén real'`
   - `'MPO: La Palma (terminal) quedó a 53 m de su andén real'`
   - Causa raíz: `tools/rutas_calles.mjs` proyectaba cada parada únicamente contra los **vértices existentes** (`nodos`) de las polilíneas viales de `vias.js`, de modo que cuando un andén caía a mitad de un tramo recto largo (Avenida Regional en Caribe o Carrera 81 en La Palma), el grafo de Dijkstra se veía forzado a terminar en el extremo lejano del segmento.
2. **Granulación de laderas en 3D:**
   - `VC.piso3D` llamaba a `VC.suelo(g, n, X0, Y0, S, sc, 1)` sin distinguir entre vista 2D e iluminación 3D. Eso estampaba el lienzo `MAP.relief` (casillas discretas de `20 m × 20 m`) encima de la textura del piso WebGL, que a su vez ya recibía iluminación por normales en el shader, generando bloques escalonados («granulado») en las comunas de ladera (Popular, Santo Domingo, San Javier, Comuna 13). Además, las mallas `buildFar` y `buildNear` de `src/js/22-gl.js` calculaban una única normal plana por celda en vez de normales suaves por vértice.
3. **Cámara «Cine» metida dentro de edificios:**
   - En `src/js/30-conduce.js` (Metro), `src/js/32-volante.js` (Al Volante / Cable) y `src/js/36-libre.js` (Ciudad Libre), la vista `'cine'` ubicaba el ojo de cámara con un desplazamiento lateral fijo respecto a la vía sin consultar `VC.solid(x, y, r)` ni trazar línea de vista hacia el vehículo, quedando con frecuencia dentro de fachadas o tapada por edificios.
4. **Faltantes de M2 a M6 y Sección 4b (Lo que pide Claude para El Metro):**
   - `motor-valle/` estaba en versión `1.0.0` con carpetas `capas/` y `js/` aún sin poblar y sin pasos a desnivel (`z = -1`, `is_tunnel`), separadores verdes arborizados ni mobiliario urbano de andén.
   - En 3D (`src/js/22-gl.js`), las 639.457 edificaciones se extruían como prismas de techo plano hasta 700 m, sin techos inclinados de teja de barro, sin planchas con tanque de agua en laderas, sin remates escalonados en torres, sin segundo anillo de horizonte (`700 m – 1.050 m`) y sin interior detallado en las estaciones del Metro (línea amarilla táctil, columnas, torniquetes Cívica e ingreso por escaleras).
   - No existía el modo arcade **Run Scooter (`src/js/34-carrera.js`)**.
   - Ciudad Libre tenía 3 vehículos conducibles (`bici`, `moto`, `taxi`), faltando los **6 vehículos nuevos** (`carro`, `scooter`, `monopatin`, `skate`, `patines`, `bus`) con sus físicas, modelos 3D y sprites 2D cenitales y laterales.
   - Faltaban los **6 personajes compartidos de EnCicla** (`santi`, `donaluz`, `jairo`, `wilson`, `cata`, `maryi`) y el capítulo cruzado de historia en `37-trama.js` y `70-historia.js`.

### 1.2 Qué quedó funcionando en **[El Metro]**
- **Autotest (`EM.test.selfTest()`):** **0 errores y 0 avisos** (`Caribe` bajó de `272,8 m` a `6,0 m` y `La Palma` de `53,5 m` a `5,3 m`).
- **Bot de estrés (`node tools/test.mjs 100`):** **100 partidas completas simuladas** cubriendo todos los modos incluido `carrera` (`Run Scooter`), con **0 errores de lógica, 0 invariantes rotas y 0 errores de consola**.
- **Motor del Valle 1.1.0 (`motor-valle/`):** actualizado, con capas compartidas en `motor-valle/capas/`, `motor-valle/js/valle.js`, 5 pasos deprimidos reales (`z = -1`, `is_tunnel`), separadores verdes, quebradas y mobiliario, sincronizado con `node motor-valle/sincronizar.mjs`.
- **Motor 3D (`src/js/22-gl.js`):** normales suaves por vértice en el terreno (`normT`, `quadT`), filtro anisotrópico 8×, techos 3D por zona (teja a dos aguas, plancha con tanque de agua, torre escalonada con baliza nocturna), horizonte de edificios reales extendido a `1.050 m`, interiores de estación 3D (línea amarilla, columnas, torniquetes Cívica y escaleras) y modelos 3D para los 13 tipos de vehículos y transporte público.
- **Nuevo modo «🛴 Run Scooter / Carrera por el Valle» (`src/js/34-carrera.js`):** 6 corredores reales (`A`, `B`, `TA`, `MPO`, `MP1`, `A-sur`), 5 vehículos de micromovilidad (`scooter`, `monopatin`, `bici`, `skate`, `patines`), vistas 3D en 3.ª persona, 1.ª persona con manubrio/manos (`drawCabina`) y 2D, obstáculos, poderes, cápsulas culturales y piloto automático `ai(st)`.
- **6 vehículos nuevos en Ciudad Libre (`src/js/36-libre.js`, `21-sprites.js`, `22-gl.js`, `23-lado.js`):** `carro`, `scooter`, `monopatin`, `skate`, `patines` y `bus` con física de aceleración lateral máxima, modelos WebGL y sprites procedurales.
- **6 personajes de EnCicla + Capítulo 6 de Historia (`src/js/39-gente.js`, `37-trama.js`, `70-historia.js`):** Santi, Doña Luz, Jairo, el Profe Wilson, Cata y Maryi en sus estaciones reales con diálogos de «lo que todos saben», «lo que pocos saben» y fragmentos cruzados (`Save.d.fragsEncicla`).

---

## 2. Misiones M1 a M6 (y Sección 4b) — **[El Metro]**

---

### M1 — Auditoría, 0 errores, 0 avisos, terreno 3D sin granulación y cámara Cine libre **[El Metro]**

#### Qué se hizo
1. **Corte geométrico de segmentos viales para terminales de Metroplús y alimentadores (`tools/rutas_calles.mjs` y `src/data/rutas_calles.js`):**
   - Antes de construir las aristas del grafo vial, cada parada y extremo de ruta se proyecta ortogonalmente sobre todos los segmentos cercanos (`±60 m`). Si la proyección cae en el interior de un segmento ($0.02 < t < 0.98$) a menos de `35 m`, se inserta un corte `[t, nodo]` que divide el segmento en dos subsegmentos conectados al nodo exacto frente al andén.
   - Al ejecutar `node tools/rutas_calles.mjs`, **Caribe** pasó de `272,8 m → 6,0 m` y **La Palma** de `53,5 m → 5,3 m`.
2. **Eliminación del granulado de 20 m en laderas 3D (`src/js/11-ciudad2.js` y `src/js/22-gl.js`):**
   - `VC.piso3D` ahora invoca `this.suelo(g, n, X0, Y0, S, sc, 1, true)` (`es3D = true`), evitando pintar `MAP.relief` (bloques de 20 m) sobre la textura 3D.
   - En `src/js/22-gl.js`, `buildFar` y `buildNear` usan `normT(x, y, eps)` y `quadT(...)` para emitir normales suaves por vértice en vez de normales planas por cara, y `groundTex` eleva el filtro anisotrópico hasta **8×**.
3. **Cámara Cine con evasión de edificios y línea de vista limpia (`src/js/11-ciudad2.js`, `30-conduce.js`, `32-volante.js`, `36-libre.js`):**
   - Se añadió `VC.camaraLibre(x0, y0, tx, ty, z0)`: prueba 22 candidatos alrededor de la posición deseada verificando que ni el punto de cámara ni 5 muestras a lo largo del rayo cámara→vehículo caigan dentro de `VC.solid(sx, sy, 1.4)` en nivel superficial (`z0 >= 0`).

#### Código cambiado — `tools/rutas_calles.mjs`
```javascript
// Fragmento en tools/rutas_calles.mjs (proyección sobre segmentos antes de armar el grafo):
const cortesPorSeg = new Map();
function proyectarEnSegmento(px, py) {
  let mejorD = 35, mejorSi = -1, mejorT = 0, mejorX = 0, mejorY = 0;
  for (let si = 0; si < segs.length; si++) {
    const s = segs[si];
    if (s.k > 3) continue;
    const ax = nodos[s.a].x, ay = nodos[s.a].y, bx = nodos[s.b].x, by = nodos[s.b].y;
    if (px < Math.min(ax, bx) - 60 || px > Math.max(ax, bx) + 60 || py < Math.min(ay, by) - 60 || py > Math.max(ay, by) + 60) continue;
    const dx = bx - ax, dy = by - ay, L2 = dx * dx + dy * dy;
    if (L2 < 1) continue;
    const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / L2));
    const qx = ax + dx * t, qy = ay + dy * t, d = Math.hypot(px - qx, py - qy);
    if (d < mejorD) { mejorD = d; mejorSi = si; mejorT = t; mejorX = qx; mejorY = qy; }
  }
  if (mejorSi < 0) return -1;
  const s = segs[mejorSi];
  if (mejorT <= 0.02) return s.a;
  if (mejorT >= 0.98) return s.b;
  const id = nodo(mejorX, mejorY);
  if (!cortesPorSeg.has(mejorSi)) cortesPorSeg.set(mejorSi, []);
  cortesPorSeg.get(mejorSi).push([mejorT, id]);
  return id;
}
```

#### Código cambiado — `src/js/11-ciudad2.js` (`VC.camaraLibre` y `VC.piso3D`)
```javascript
  /* busca una posición de cámara libre de edificios y con línea de vista despejada hacia (tx, ty) */
  camaraLibre(x0, y0, tx, ty, z0 = 0) {
    if (!this.on || z0 < 0) return { x: x0, y: y0 };
    const libre = (cx, cy) => {
      if (this.solid(cx, cy, 2.2)) return false;
      for (let i = 1; i <= 5; i++) {
        const t = i / 6, sx = cx + (tx - cx) * t, sy = cy + (ty - cy) * t;
        if (this.solid(sx, sy, 1.4)) return false;
      }
      return true;
    };
    if (libre(x0, y0)) return { x: x0, y: y0 };
    const dx = x0 - tx, dy = y0 - ty, r0 = Math.hypot(dx, dy) || 18, a0 = Math.atan2(dy, dx);
    for (let k = 1; k <= 22; k++) {
      const sgn = k & 1 ? 1 : -1, step = (k >> 1) * 0.26, a = a0 + sgn * step;
      for (const rf of [1, 0.72, 1.25]) {
        const cx = tx + Math.cos(a) * r0 * rf, cy = ty + Math.sin(a) * r0 * rf;
        if (libre(cx, cy)) return { x: cx, y: cy };
      }
    }
    return { x: tx + Math.cos(a0) * 8, y: ty + Math.sin(a0) * 8 };
  },
```

#### Código cambiado — `src/js/30-conduce.js` y `src/js/32-volante.js` (uso de `VC.camaraLibre` en vista Cine)
```javascript
// En src/js/30-conduce.js (Conduce.drawGL):
} else {
  const sC = Math.floor(st.s / 130) * 130 + 65, c = NET.at(P, clamp(sC, 10, P.len - 10)), side = ((sC / 130 | 0) & 1) ? 1 : -1;
  const rawX = c.x - Math.sin(c.a) * 22 * side, rawY = c.y + Math.cos(c.a) * 22 * side;
  const cl = (typeof VC !== 'undefined' && VC.camaraLibre) ? VC.camaraLibre(rawX, rawY, p.x, p.y, 0) : { x: rawX, y: rawY };
  ex = cl.x; ez = cl.y; ey = G3.groundAt(ex, ez) + (elev ? 3.5 : 2.4);
  tx = p.x; tz = p.y; ty = y0 + 2.2; fov = 45;
}

// En src/js/32-volante.js (Volante.draw3D):
} else {
  const sC = Math.floor(st.s / 110) * 110 + 55, c = Volante.at(R, clamp(sC, 10, R.L - 10)), side = ((sC / 110 | 0) & 1) ? 1 : -1;
  const rawX = c.x - Math.sin(c.a) * 16 * side, rawY = c.y + Math.cos(c.a) * 16 * side;
  const cl = (typeof VC !== 'undefined' && VC.camaraLibre) ? VC.camaraLibre(rawX, rawY, st.x, st.y, 0) : { x: rawX, y: rawY };
  ex = cl.x; ez = cl.y; ey = G3.groundAt(ex, ez) + 2.2;
  tx = st.x; tz = st.y; ty = y0 + 1.8; fov = 46;
}
```

#### Cómo probarlo
- Ejecutar `node tools/rutas_calles.mjs` y verificar en consola: `Caribe -> nodo a 6.0 m`, `La Palma -> nodo a 5.3 m`.
- Ejecutar `node tools/test.mjs 100` y comprobar `errores: 0 []`, `avisos: 0 []`.
- En el juego, abrir **Ciudad Libre → Santo Domingo Savio** o **Conduce el Metro → Vista Cine (👁)** y comprobar que las laderas se ven continuas sin escalones de 20 m y que la cámara Cine nunca queda dentro de un muro.

---

### M2 — Motor del Valle 1.1.0 (`motor-valle/`), deprimidos (`z = -1`), separadores verdes y mobiliario **[El Metro]**

#### Qué se hizo
1. **Motor del Valle 1.1.0 (`motor-valle/`):**
   - `motor-valle/VERSION.json` actualizado a `1.1.0` (`2026-11-19`) con las capas `valle`, `ciudad`, `vias`, `edificios`, `puentes`, `metroplus`, `metroplus_andenes`, `rutas_calles`, `encicla` y `ajustes`.
   - Creados/actualizados `motor-valle/capas/vias_datos.mjs`, `motor-valle/capas/rutas_calles.mjs`, `motor-valle/capas/hitos.js` y `motor-valle/js/valle.js`.
   - Ejecutado `node motor-valle/sincronizar.mjs ../BicicletasUno` (15 archivos sincronizados).
2. **Pasos a desnivel / Deprimidos (`z = -1`, `is_tunnel = true`) en `src/js/11-puentes.js`:**
   - Añadidos 5 pasos deprimidos emblemáticos del Valle de Aburrá en `VC.DEPRIMIDOS`:
     1. **Deprimido Av. Oriental con La Playa** (`z = -1`, `is_tunnel = true`, ancho `14 m`, hondo `-5,2 m`).
     2. **Deprimido de San Juan — La Alpujarra** (`z = -1`, `is_tunnel = true`, ancho `16 m`, hondo `-5,5 m`).
     3. **Soterrado Parques del Río** (`z = -1`, `is_tunnel = true`, ancho `18 m`, hondo `-6,0 m`).
     4. **Deprimido de Bulerías (Av. 33 con Bolivariana)** (`z = -1`, `is_tunnel = true`, ancho `13 m`, hondo `-4,8 m`).
     5. **Deprimido Terminal del Norte / Caribe** (`z = -1`, `is_tunnel = true`, ancho `13 m`, hondo `-4,8 m`).
   - En `puentesDib(..., -1)` se dibuja la trinchera de acceso en rampa (`#181b20`), las losas de transición con flechas de bajada, los muros de contención de concreto (`#8b877e`), las franjas de precaución aurinegras (`#f0b828`) y los dinteles de entrada y salida del túnel.
   - En `src/js/36-libre.js` (`nivel`, `nivelV`, `alto3`), el jugador y los vehículos bajan suavemente por la rampa a `z = -1`, cruzan bajo las vías transversales de `z = 0` sin colisionar con ellas y ven atenuada su silueta bajo cubierta (`VC.tapado`).
3. **Separadores verdes arborizados, quebradas canalizadas y mobiliario urbano (`src/js/11-ciudad2.js`):**
   - Avenidas con `w >= 13,5 m` dibujan separador central con bordillo de concreto (`#9a958a`), prado verde (`#5e964b`) y arbustos/árboles cada `18 m` en LOD 0.
   - Quebradas (`k === 7` / afluentes del río) dibujan muros de canalización en concreto (`#9e9a90`) antes de la lámina de agua (`#4a7d96`).
   - En andenes de vías principales (`k <= 2`) en LOD 0 se dibujan bancas de madera (`#8c5828`) y paraderos de bus con techo azul/verde (`#1e4e3a`) cada `56 m`.

#### Código y Arte Procedural — `src/js/11-puentes.js` (Deprimidos `z = -1`)
- **Medidas y paleta HEX:**
  - Trinchera interior: `#181b20` (asfalto en sombra a `-5,2 m`), ancho `13 m – 18 m`.
  - Muros laterales de contención: `#8b877e` (`0,75 m` de espesor) con bordillo interior `#535860`.
  - Dinteles de portal: `#a8a39a` (`4,4 m` de largo) con franja de gálibo `#f0b828`.

```javascript
  DEPRIMIDOS: [
    { n: 'Deprimido Av. Oriental con La Playa', w: 14, h: -5.2, z: -1, is_tunnel: true, P: [15210, 12910, 15228, 12980, 15246, 13060] },
    { n: 'Deprimido de San Juan (La Alpujarra)', w: 16, h: -5.5, z: -1, is_tunnel: true, P: [14380, 13540, 14495, 13540, 14610, 13540] },
    { n: 'Soterrado Parques del Río', w: 18, h: -6.0, z: -1, is_tunnel: true, P: [14090, 13260, 14095, 13440, 14100, 13640] },
    { n: 'Deprimido de Bulerías (Av. 33)', w: 13, h: -4.8, z: -1, is_tunnel: true, P: [13180, 13920, 13275, 13870, 13370, 13820] },
    { n: 'Deprimido Terminal del Norte / Caribe', w: 13, h: -4.8, z: -1, is_tunnel: true, P: [14580, 10180, 14595, 10290, 14610, 10400] }
  ],
```

#### Cómo probarlo
- Ejecutar `node motor-valle/sincronizar.mjs --verificar` o `node motor-valle/sincronizar.mjs ../BicicletasUno`.
- En **Ciudad Libre**, abrir el mapa (`M`), ir a **La Alpujarra** o **Parques del Río**, y bajar por la rampa del deprimido (`z = -1`) a pie o en vehículo pasando por debajo del cruce transversal (`z = 0`).

---

### M3 — 3D que impresiona: techos por zona, horizonte a 1.050 m e interiores de estación **[El Metro]**

#### Qué se hizo
1. **Techos 3D reales según arquitectura y comuna (`G3.edifReales` en `src/js/22-gl.js`):**
   - **Techos a dos aguas de teja de barro (`bm.roof`):** en casas y edificios bajos (`pis <= 3`, `k === 0` o `k === 7`) con techo de teja (`tc`), se construye una cumbrera elevada entre `+0,9 m` y `+2,0 m` (`quad(bm.roof, ...)`) con sus dos faldones inclinados y sus dos hastiales triangulares en ladrillo/fachada (`tri(bm.b, ...)`).
   - **Planchas con parapeto y tanque de agua en laderas:** en viviendas de ladera con cubierta de concreto o zinc (`pis <= 4`), se modelan los 4 muretes de parapeto perimetral (`+0,45 m`) y un tanque cilíndrico/cúbico de agua (`0,9 m × 0,9 m × 1,05 m`) en azul (`#1d5fa3`) o negro (`#24282e`) sobre la azotea.
   - **Torres escalonadas con corona y baliza roja de aviación:** en torres de `pis >= 8` (`k === 2` o `k === 3` en El Poblado, Laureles y Centro), se modela el volumen de ascensores/corona retranqueada (`+2,4 m` a `+3,2 m`), el mástil metálico y la luz roja nocturna de aviación (`bm.g`, `[0.98, 0.18, 0.14]`).
2. **Segundo anillo de horizonte urbano hasta `1.050 m` (`G3.edifReales` en `src/js/22-gl.js`):**
   - Mientras el primer anillo (`0 – 700 m`) dibuja cada edificio con detalle completo de techos, parapetos y tanques, el segundo anillo (`700 m – 1.050 m`, `R2 = 1050 * 1050`) extruye los edificios de `pis >= 2` o área `>= 110 m²` como volúmenes ligeros de 5 caras, poblando las laderas y el horizonte del valle sin huecos.
3. **Estaciones del Metro por dentro en 3D (`G3.buildNet` en `src/js/22-gl.js`):**
   - En cada estación elevada o a nivel de las líneas A, B y Tranvía:
     - **Franja amarilla táctil de seguridad (`[0.96, 0.80, 0.14]`):** a lo largo de ambos bordes del andén (`1,4 m` desde el eje de cada vía).
     - **Columnas interiores del andén (`[0.72, 0.74, 0.77]`):** pares de columnas cada `14 m` que sostienen la cubierta verde (`[0.14, 0.42, 0.30]`) con lucernario central (`[0.22, 0.56, 0.40]`).
     - **Mezzanina / Plazoleta de acceso abierta (`y0 + 3,4 m`):** losa de vestíbulo con **batería de 5 torniquetes Cívica** de acero inoxidable (`[0.78, 0.80, 0.83]`) con validador superior verde luminoso (`[0.10, 0.72, 0.38]`) y **escaleras de acceso** escalonadas hasta el andén de la calle.

#### Código cambiado — `src/js/22-gl.js` (extracto de `edifReales` y `buildNet`)
```javascript
      // En G3.edifReales(bm, cx, cz, RR, R2):
      if (!lejos) {
        const esTeja = (b.k === 0 || b.k === 7) && b.pis <= 3 && tc[0] > tc[2] * 1.18 && Math.min(b.w, b.d) >= 3.5;
        if (esTeja && bm.roof) {
          const rh = Math.min(2.0, Math.max(0.85, Math.min(b.w, b.d) * 0.22)), yR = y1 + rh;
          const rx0 = b.x - ux * hw, rz0 = b.y - uy * hw, rx1 = b.x + ux * hw, rz1 = b.y + uy * hw;
          this.quad(bm.roof, x00, y1, z00, x10, y1, z10, rx1, yR, rz1, rx0, yR, rz0, tc);
          this.quad(bm.roof, x11, y1, z11, x01, y1, z01, rx0, yR, rz0, rx1, yR, rz1, tc);
          this.tri(bm.b, x10, y1, z10, x11, y1, z11, rx1, yR, rz1, wc, 0);
          this.tri(bm.b, x01, y1, z01, x00, y1, z00, rx0, yR, rz0, wc, 0);
        } else if (b.pis >= 8 && (b.k === 2 || b.k === 3)) {
          const cw = hw * 0.62, cd = hd * 0.62, ch = Math.min(3.2, 1.6 + b.pis * 0.08);
          this.rotBox(bm.b, b.x, y1, b.y, cw, cd, ch, ux, uy, wc, tc, 0.5);
          if (((b.x * 13 + b.y * 7) & 3) === 0) {
            const yTop = y1 + ch;
            this.box(bm.b, b.x - 0.15, yTop, b.y - 0.15, b.x + 0.15, yTop + 2.8, b.y + 0.15, [0.7, 0.72, 0.75]);
            if (bm.g) this.box(bm.g, b.x - 0.28, yTop + 2.7, b.y - 0.28, b.x + 0.28, yTop + 3.25, b.y + 0.28, [0.98, 0.18, 0.14]);
          }
        } else if (b.k === 0 && b.pis <= 4 && hw > 2.2 && hd > 2.2 && (((b.x * 17 + b.y * 11) | 0) % 3 === 0)) {
          const ph = 0.45, pw = 0.22;
          this.rotBox(bm.b, b.x + ux * (hw - pw), y1, b.y + uy * (hw - pw), pw, hd, ph, ux, uy, wc, tc, 0);
          this.rotBox(bm.b, b.x - ux * (hw - pw), y1, b.y - uy * (hw - pw), pw, hd, ph, ux, uy, wc, tc, 0);
          const tkCol = (((b.x + b.y) | 0) & 1) ? [0.14, 0.36, 0.62] : [0.16, 0.18, 0.22];
          this.box(bm.b, b.x - 0.48, y1, b.y - 0.48, b.x + 0.48, y1 + 1.05, b.y + 0.48, tkCol);
        }
      }
```

#### Cómo probarlo
- En **Ciudad Libre**, activar la vista 3D (**3.ª persona** o **Dron** con `👁`) en **Santo Domingo Savio** (planchas con tanques azules/negros), **Belén / Laureles** (techos de teja a dos aguas), **El Poblado** (torres escalonadas con baliza roja de noche) y **Parque Berrío / San Antonio** (andén con línea amarilla, columnas, mezzanina con torniquetes Cívica y escaleras).

---

### M4 — Modo nuevo «🛴 Run Scooter» (`src/js/34-carrera.js` + `src/js/65-menu.js` + `src/js/19-atlas.js`) **[El Metro]**

#### Qué se hizo
- Se creó el archivo completo **`src/js/34-carrera.js`** (`const Carrera = EM.modes.carrera`) y se integró en `MODECARDS`, `arcade()` y `miniArt()` de **`src/js/65-menu.js`**, con su ícono vectorial SVG `ARTE.ico_modo_carrera` en **`src/js/19-atlas.js`**.
- **Mecánica completa:**
  - **6 corredores reales del Valle de Aburrá:**
    1. `cr:A-centro` — *Corredor del Río* (Bello → Poblado junto al viaducto de la Línea A y el río Medellín).
    2. `cr:B-occidente` — *Bulevar San Juan y la 70* (San Antonio → San Javier bajo la Línea B).
    3. `cr:TA-ayacucho` — *Paseo de Ayacucho* (San Antonio → Oriente junto al Tranvía de Ayacucho).
    4. `cr:MPO-ochenta` — *Avenida 80* (Caribe → La Palma por el corredor de la 80).
    5. `cr:MP1-veinte` — *Troncal Metroplús* (U. de Medellín → Cisneros por la calle 30 y Ferrocarril).
    6. `cr:A-sur` — *Sur del Valle* (Industriales → La Estrella entre ceibas y bodegas).
  - **5 vehículos de micromovilidad elegibles en vivo (botón `🛴` o tecla `V`):**
    1. **Monopatín** (`scooter`, `14,0 m/s`, `#29b6f6`)
    2. **Monopatín eléctrico** (`monopatin`, `17,0 m/s`, `#66bb6a`)
    3. **Bici EnCicla** (`bici`, `15,6 m/s`, `#9bd341`)
    4. **Tabla (Skate)** (`skate`, `14,6 m/s`, `#ff7043`)
    5. **Patines en línea** (`patines`, `15,2 m/s`, `#ec407a`)
  - **Tres cámaras conmutables (botón `👁` o tecla `C`):**
    - `3p`: Tercera persona 3D WebGL (`G3.drawScene`) con los 639.457 edificios reales del corredor, trenes y buses en movimiento, pista tricolor de 3 carriles, obstáculos 3D y personaje sobre su vehículo.
    - `1p`: Primera persona 3D WebGL con **cabina procedural `drawCabina(g, st, w, h)`** en primer plano: manubrio con timbre, pantalla digital LED de velocidad y batería (o nariz de la tabla de skate / botas de patines con ruedas girando), manos del jugador con su color de piel y sacudida reactiva al saltar o chocar.
    - `2d`: Vista en perspectiva 2D Canvas de alto rendimiento para celulares modestos (`Save.d.settings.q === 'low'`).
  - **Obstáculos, coleccionables y cultura:** huecos, conos naranjas, charcos, perros callejeros, chazas con sombrilla, vallas altas (para agacharse con `▼`) y motos; pasajes Cívica (`🎫`), poderes (`🧲` imán, `⚡` turbo, `🛡️` escudo) y cápsulas `💡` de **«Lo que todos saben»** y **«Lo que pocos saben»**, además de puntos de control al cruzar cada estación real del tramo.

#### Código completo del archivo nuevo — `src/js/34-carrera.js`
```javascript
/* =====================================================================
   RUN SCOOTER (Carrera por el Valle): modo arcade de 3 carriles en 3D y 2D
   sobre los corredores reales del Valle de Aburrá (Línea A, Línea B, Tranvía
   de Ayacucho, Avenida 80 y Troncal Metroplús). Elige entre bici EnCicla,
   monopatín, monopatín eléctrico, tabla (skate) o patines; alterna entre
   tercera persona, primera persona (con manubrio y manos) y vista 2D;
   esquiva obstáculos, salta, agáchate y recoge pasajes, poderes y datos reales
   de la ciudad («lo que todos saben» y «lo que pocos saben»).
   ===================================================================== */
const Carrera = EM.modes.carrera = {
  id: 'carrera', name: 'Run Scooter', sub: 'Carrera de micromovilidad por el valle', music: 'ciudad', fullCanvas: true,
  tip: '◀ ▶ cambia de carril (o desliza a los lados). ▲ salta huecos, conos y charcos; ▼ se agacha bajo pasacalles y vallas altas. Recoge 🎫 pasajes, 💡 datos curiosos del valle y poderes (🧲 imán, ⚡ turbo, 🛡️ escudo). Con 🛴 cambias entre monopatín, eléctrico, bici EnCicla, skate o patines, y con 👁 alternas entre tercera persona, primera persona (manubrio) y 2D.',
  VEHS: [
    { id: 'scooter', n: 'Monopatín', ico: '🛴', spd: 14, jmp: 8.8, lat: 10.5, col: '#29b6f6' },
    { id: 'monopatin', n: 'Monopatín eléctrico', ico: '⚡', spd: 17, jmp: 8.2, lat: 9.8, col: '#66bb6a' },
    { id: 'bici', n: 'Bici EnCicla', ico: '🚲', spd: 15.6, jmp: 7.8, lat: 9.2, col: '#9bd341' },
    { id: 'skate', n: 'Tabla (Skate)', ico: '🛹', spd: 14.6, jmp: 9.8, lat: 11.8, col: '#ff7043' },
    { id: 'patines', n: 'Patines', ico: '🛼', spd: 15.2, jmp: 9.2, lat: 12.5, col: '#ec407a' }
  ],
  TRAMOS: [
    { id: 'cr:A-centro', line: 'A', i0: 6, i1: 14, name: 'Corredor del Río', sub: 'Bello → Poblado junto al viaducto y el río Medellín' },
    { id: 'cr:B-occidente', line: 'B', i0: 0, i1: 6, name: 'Bulevar San Juan y la 70', sub: 'San Antonio → San Javier por la ciclorruta de San Juan' },
    { id: 'cr:TA-ayacucho', line: 'TA', i0: 0, i1: 8, name: 'Paseo de Ayacucho', sub: 'San Antonio → Oriente junto al Tranvía de Ayacucho' },
    { id: 'cr:MPO-ochenta', line: 'MPO', i0: 0, i1: 7, name: 'Avenida 80', sub: 'Caribe → La Palma por el corredor de la 80' },
    { id: 'cr:MP1-veinte', line: 'MP1', i0: 0, i1: 11, name: 'Troncal Metroplús', sub: 'U. de Medellín → Cisneros por la calle 30 y Ferrocarril' },
    { id: 'cr:A-sur', line: 'A', i0: 12, i1: 20, name: 'Sur del Valle', sub: 'Industriales → La Estrella entre ceibas y bodegas' }
  ],
  DATOS: [
    ['Lo que todos saben', 'El Metro de Medellín se inauguró el 30 de noviembre de 1995 entre Niquía y El Poblado.'],
    ['Lo que pocos saben', 'Las ciclorrutas del corredor del río y Las Vegas conectan más de 100 estaciones de EnCicla con el Metro.'],
    ['Lo que todos saben', 'EnCicla presta bicicletas públicas gratis con la tarjeta Cívica en todo el Valle de Aburrá.'],
    ['Lo que pocos saben', 'El Tranvía de Ayacucho sube pendientes del 12,5 % con ruedas neumáticas guiadas por un riel central Translohr.'],
    ['Lo que todos saben', 'La Cultura Metro nació en 1988, siete años antes de que rodara el primer tren comercial.'],
    ['Lo que pocos saben', 'Bajo las estaciones elevadas de la Línea A corren colectores de quebradas que bajan de las laderas al río Aburrá.'],
    ['Lo que todos saben', 'Los Metrocables K, J, H, M y P conectan las comunas de las laderas sin cobrar pasaje adicional al integrar.'],
    ['Lo que pocos saben', 'El puente de Guayaquil (1879), junto a Industriales, fue construido con ladrillo cocido y pega de cal y sangre de res.'],
    ['Lo que todos saben', 'La tarjeta Cívica integra trenes, tranvía, metrocables, Metroplús, buses alimentadores y EnCicla.'],
    ['Lo que pocos saben', 'En las horas pico el sistema EnCicla mueve camiones de balanceo para llevar bicis de las estaciones del río a las universidades.']
  ],
  levels() { return this.TRAMOS.map(t => ({ id: t.id, line: t.line, name: t.name, sub: t.sub })); },
  V(st) { return this.VEHS[st.vi | 0] || this.VEHS[0]; },
  gl(st) { return st.view !== '2d' && !EM.headless && Save.d.settings.q !== 'low' && G3.init(); },
  create(lvId, opts = {}) {
    const T = this.TRAMOS.find(t => t.id === lvId) || this.TRAMOS[0], line = NET.byId[T.line] || NET.lines[0];
    const i0 = clamp(T.i0, 0, line.st.length - 2), i1 = clamp(T.i1, i0 + 1, line.st.length - 1);
    const s0 = line.st[i0].s, s1 = Math.min(line.st[i1].s, s0 + 1400), len = Math.max(400, s1 - s0);
    const rng = new RNG((opts.seed | 0) + 19), vi0 = Save.d.settings.vehCarrera | 0;
    const obs = [], items = [], kinds = ['hueco', 'cono', 'charco', 'perro', 'chaza', 'valla', 'moto'];
    for (let s = s0 + 55; s < s1 - 35; s += 24 + rng.f() * 14) {
      const lane = rng.i(-1, 1), k = kinds[rng.i(0, kinds.length - 1)];
      obs.push({ s, lane, k, hit: 0, h: k === 'valla' ? 1.8 : k === 'chaza' || k === 'moto' ? 1.4 : .65 });
      if (rng.f() < .42) {
        const l2 = ((lane + 1 + rng.i(1, 2)) % 3) - 1, k2 = kinds[rng.i(0, 3)];
        obs.push({ s: s + 2, lane: l2, k: k2, hit: 0, h: .65 });
      }
      const il = ((lane + 1 + rng.i(1, 2)) % 3) - 1, r = rng.f();
      if (r < .22) items.push({ s: s - 8, lane: il, k: 'dato', d: this.DATOS[items.length % this.DATOS.length], got: 0 });
      else if (r < .36) items.push({ s: s - 8, lane: il, k: ['iman', 'turbo', 'escudo'][items.length % 3], got: 0 });
      else for (let j = 0; j < 3; j++) items.push({ s: s - 10 + j * 4.5, lane: il, k: 'pasaje', got: 0 });
    }
    const checkpoints = line.st.slice(i0 + 1, i1 + 1).filter(st => st.s <= s1 + 5);
    const p0 = NET.at(line.P, s0);
    return {
      lvId, T, line, s0, s1, len, s: s0, x: p0.x, y: p0.y, a: p0.a,
      vi: clamp(vi0, 0, this.VEHS.length - 1), lane: 0, laneX: 0,
      v: 8, z: 0, vz: 0, duck: 0, tilt: 0, t: 0,
      score: 0, coins: 0, datos: 0, hits: 0, combo: 0,
      iman: 0, turbo: 0, escudo: 0, inv: 0,
      obs, items, checkpoints, ci: 0,
      view: Save.d.settings.vistaCr || '3p',
      datoMsg: null, datoT: 0, done: false, win: false
    };
  },
  cambiarVeh(st, d = 1) {
    st.vi = (st.vi + d + this.VEHS.length) % this.VEHS.length;
    Save.d.settings.vehCarrera = st.vi; Save.write();
    const V = this.V(st);
    if (!EM.headless && Game.st === st) { UI.gmsg(V.ico + ' ' + V.n, 'b'); Snd.play('tap'); const b = $('#crVeh'); if (b) b.innerHTML = V.ico + '<small>' + esc(V.n.split(' ')[0]) + '</small>'; }
  },
  laneCmd(st, dl) {
    const nl = clamp(st.lane + dl, -1, 1);
    if (nl !== st.lane) { st.lane = nl; st.tilt = -dl * .28; if (!EM.headless && Game.st === st) Snd.play('tap'); }
  },
  jumpCmd(st) {
    if (st.z <= .05) { st.vz = this.V(st).jmp; st.duck = 0; if (!EM.headless && Game.st === st) Snd.play('beep'); }
  },
  duckCmd(st) {
    st.duck = .75; if (st.z > .1) st.vz = Math.min(st.vz, -7);
  },
  step(st, dt) {
    if (st.done) return;
    st.t += dt;
    const V = this.V(st), targetV = V.spd * (st.turbo > 0 ? 1.38 : 1);
    st.v += (targetV - st.v) * Math.min(1, dt * 3.2);
    st.s += st.v * dt;
    st.score += st.v * dt * 1.5;
    st.laneX += (st.lane * 2.4 - st.laneX) * Math.min(1, dt * V.lat);
    st.tilt *= Math.exp(-6 * dt);
    if (st.z > 0 || st.vz !== 0) {
      st.z += st.vz * dt; st.vz -= 22 * dt;
      if (st.z <= 0) { st.z = 0; st.vz = 0; }
    }
    if (st.duck > 0) st.duck = Math.max(0, st.duck - dt);
    if (st.iman > 0) st.iman = Math.max(0, st.iman - dt);
    if (st.turbo > 0) st.turbo = Math.max(0, st.turbo - dt);
    if (st.inv > 0) st.inv = Math.max(0, st.inv - dt);
    if (st.datoT > 0) st.datoT = Math.max(0, st.datoT - dt);

    const p = NET.at(st.line.P, st.s), nx = -Math.sin(p.a), ny = Math.cos(p.a), off = 6.5 + st.laneX;
    st.x = p.x + nx * off; st.y = p.y + ny * off; st.a = p.a;

    for (const it of st.items) {
      if (it.got || it.s < st.s - 6 || it.s > st.s + 16) continue;
      if (st.iman > 0 && it.k === 'pasaje' && Math.abs(it.s - st.s) < 15) {
        it.lane += (st.lane - it.lane) * Math.min(1, dt * 10);
      }
      if (Math.abs(it.s - st.s) < 1.8 && Math.abs(it.lane * 2.4 - st.laneX) < 1.35) {
        it.got = 1;
        if (it.k === 'pasaje') {
          st.coins++; st.combo++; st.score += 25 + Math.min(50, st.combo * 3);
          if (!EM.headless && Game.st === st) Snd.play('coin');
        } else if (it.k === 'dato') {
          st.datos++; st.score += 120; st.datoMsg = it.d; st.datoT = 5.5;
          if (!EM.headless && Game.st === st) { UI.gmsg('💡 ' + it.d[0] + ': ' + it.d[1], 'g', 4.5); Snd.play('chime'); }
        } else if (it.k === 'iman') {
          st.iman = 8; st.score += 60;
          if (!EM.headless && Game.st === st) { UI.gmsg('🧲 Imán Cívica activo (8 s)', 'b'); Snd.play('chime'); }
        } else if (it.k === 'turbo') {
          st.turbo = 5.5; st.score += 80;
          if (!EM.headless && Game.st === st) { UI.gmsg('⚡ Impulso verde activo', 'g'); Snd.play('chime'); }
        } else if (it.k === 'escudo') {
          st.escudo = 1; st.score += 60;
          if (!EM.headless && Game.st === st) { UI.gmsg('🛡️ Casco protector listo', 'b'); Snd.play('chime'); }
        }
      }
    }

    for (const o of st.obs) {
      if (o.hit || Math.abs(o.s - st.s) > 1.55) continue;
      if (Math.abs(o.lane * 2.4 - st.laneX) > 1.05) continue;
      const salta = (o.k === 'hueco' || o.k === 'cono' || o.k === 'charco' || o.k === 'perro') && st.z > .55;
      const agacha = o.k === 'valla' && st.duck > .1;
      if (salta || agacha) { st.score += 35; continue; }
      o.hit = 1;
      if (st.inv > 0 || st.turbo > 0) continue;
      if (st.escudo > 0) {
        st.escudo = 0; st.inv = 1.4;
        if (!EM.headless && Game.st === st) { UI.gmsg('🛡️ ¡El casco evitó el golpe!', 'y'); Snd.play('beep'); }
      } else {
        st.hits++; st.combo = 0; st.v = Math.max(5, st.v * .52); st.inv = 1.6;
        st.score = Math.max(0, st.score - 60);
        if (!EM.headless && Game.st === st) { UI.gmsg('⚠️ Tropezón con ' + o.k + ' (-60 pts)', 'r'); Snd.play('buzz'); }
      }
    }

    while (st.ci < st.checkpoints.length && st.s >= st.checkpoints[st.ci].s) {
      const cp = st.checkpoints[st.ci++];
      st.score += 150;
      const fact = LINE_META.stationFacts[cp.name];
      if (!EM.headless && Game.st === st) {
        UI.gmsg('🏁 Estación ' + cp.name + ' (+150)' + (fact ? ' · ' + fact : ''), 'g', 3.8);
        Snd.play('ding');
      }
    }

    if (st.s >= st.s1) {
      st.done = true; st.win = true;
      Save.walletAdd(Math.max(2, (st.coins / 6 | 0) + st.datos));
    }
  },
  ai(st) {
    let threat = null;
    for (const o of st.obs) {
      if (o.hit || o.s < st.s || o.s > st.s + 22) continue;
      if (o.lane === st.lane) { threat = o; break; }
    }
    if (threat) {
      const d = threat.s - st.s;
      if ((threat.k === 'hueco' || threat.k === 'cono' || threat.k === 'charco') && d < 9 && st.z === 0) {
        this.jumpCmd(st); return;
      }
      if (threat.k === 'valla' && d < 10) {
        this.duckCmd(st); return;
      }
      const free = [-1, 0, 1].filter(l => !st.obs.some(o => !o.hit && o.lane === l && o.s > st.s - 2 && o.s < st.s + 24));
      if (free.length) {
        const target = free.sort((a, b) => Math.abs(a - st.lane) - Math.abs(b - st.lane))[0];
        this.laneCmd(st, Math.sign(target - st.lane));
      } else if (d < 8) this.jumpCmd(st);
    } else {
      for (const it of st.items) {
        if (it.got || it.s < st.s + 3 || it.s > st.s + 18) continue;
        if (it.lane !== st.lane && !st.obs.some(o => !o.hit && o.lane === it.lane && o.s > st.s - 2 && o.s < st.s + 22)) {
          this.laneCmd(st, Math.sign(it.lane - st.lane)); break;
        }
      }
    }
  },
  mount(st) {
    const V = this.V(st);
    UI.controls(`<div class="row" style="gap:6px;width:100%;justify-content:space-between">
      <div class="row" style="gap:5px">
        <button class="btn big" id="crL" aria-label="Carril izquierdo">◀</button>
        <button class="btn big" id="crU" aria-label="Saltar">▲<small>Saltar</small></button>
        <button class="btn big" id="crD" aria-label="Agacharse">▼<small>Agachar</small></button>
        <button class="btn big" id="crR" aria-label="Carril derecho">▶</button>
      </div>
      <div class="row" style="gap:5px">
        <button class="btn" id="crVeh" title="Cambiar vehículo">${V.ico}<small>${esc(V.n.split(' ')[0])}</small></button>
        <button class="btn" id="crView" title="Cambiar cámara">👁<small>${st.view.toUpperCase()}</small></button>
      </div>
    </div>`);
    $('#crL').onclick = () => this.laneCmd(st, -1);
    $('#crR').onclick = () => this.laneCmd(st, 1);
    $('#crU').onclick = () => this.jumpCmd(st);
    $('#crD').onclick = () => this.duckCmd(st);
    $('#crVeh').onclick = () => this.cambiarVeh(st, 1);
    $('#crView').onclick = () => {
      const vs = ['3p', '1p', '2d'];
      st.view = vs[(vs.indexOf(st.view) + 1) % vs.length];
      Save.d.settings.vistaCr = st.view; Save.write();
      $('#crView').innerHTML = '👁<small>' + st.view.toUpperCase() + '</small>';
    };
    this._key = e => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') { this.laneCmd(st, -1); e.preventDefault(); }
      else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') { this.laneCmd(st, 1); e.preventDefault(); }
      else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.key === ' ') { this.jumpCmd(st); e.preventDefault(); }
      else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') { this.duckCmd(st); e.preventDefault(); }
      else if (e.key === 'v' || e.key === 'V') { this.cambiarVeh(st, 1); e.preventDefault(); }
      else if (e.key === 'c' || e.key === 'C') { $('#crView').click(); e.preventDefault(); }
    };
    window.addEventListener('keydown', this._key);
  },
  unmount() { if (this._key) window.removeEventListener('keydown', this._key); },
  onDown(st, p) { st._sw = { x: p.x, y: p.y, t: performance.now() }; },
  onUp(st, p) {
    if (!st._sw) return;
    const dx = p.x - st._sw.x, dy = p.y - st._sw.y;
    st._sw = null;
    if (Math.hypot(dx, dy) < 18) { this.jumpCmd(st); return; }
    if (Math.abs(dx) > Math.abs(dy)) this.laneCmd(st, dx > 0 ? 1 : -1);
    else if (dy < 0) this.jumpCmd(st);
    else this.duckCmd(st);
  },
  hud(st) {
    const pct = clamp(Math.round((st.s - st.s0) / st.len * 100), 0, 100), V = this.V(st);
    return [['Modo', V.ico + ' ' + V.n], ['Velocidad', Math.round(st.v * 3.6) + ' km/h'], ['Pasajes', '🎫 ' + st.coins + (st.datos ? ' · 💡 ' + st.datos : '')], ['Tramo', pct + '%'], ['Puntos', Math.round(st.score)]];
  },
  result(st) {
    if (!st.done) return { done: false, win: false, score: Math.round(st.score) };
    const stars = st.hits === 0 && st.coins >= 15 ? 3 : st.hits <= 2 ? 2 : 1;
    return {
      done: true, win: st.win, score: Math.round(st.score), stars,
      title: '¡Tramo completado en ' + this.V(st).n + '!',
      sum: `Recorriste ${ (st.len / 1000).toFixed(1) } km por ${ st.T.name } · 🎫 ${ st.coins } pasajes · 💡 ${ st.datos } datos culturales · ${ st.hits } tropezones.`,
       Breakdown: [['Distancia', Math.round(st.len) + ' m'], ['Pasajes Cívica', st.coins], ['Datos del Valle', st.datos], ['Golpes', st.hits]]
    };
  },
  draw(g, st, r) {
    if (this.gl(st)) this.draw3D(g, st, r);
    else this.draw2D(g, st, r);
    this.drawHUD(g, st, r);
  },
  draw3D(g, st, r) {
    const p = NET.at(st.line.P, st.s), y0 = G3.groundAt(st.x, st.y) + st.z;
    const ca = Math.cos(p.a), sa = Math.sin(p.a), fp = st.view === '1p';
    const eyeH = (st.duck > 0 ? 0.95 : fp ? 1.55 : 3.2);
    const ex = fp ? st.x + ca * 0.25 : st.x - ca * 7.5, ez = fp ? st.y + sa * 0.25 : st.y - sa * 7.5, ey = y0 + eyeH;
    const tx = st.x + ca * 26, tz = st.y + sa * 26, ty = G3.groundAt(tx, tz) + (fp ? 1.3 : 1.5);
    const V = this.V(st), col = G3.rgb(V.col);
    G3.drawScene(g, r.w, r.h, ex, ey, ez, tx, ty, tz, fp ? 64 : 56, st.t, (b, tr, gl) => {
      for (let ds = -8; ds < 75; ds += 6) {
        const q0 = NET.at(st.line.P, st.s + ds), q1 = NET.at(st.line.P, st.s + ds + 6);
        const nx0 = -Math.sin(q0.a), ny0 = Math.cos(q0.a), nx1 = -Math.sin(q1.a), ny1 = Math.cos(q1.a);
        const cx0 = q0.x + nx0 * 6.5, cy0 = q0.y + ny0 * 6.5, cx1 = q1.x + nx1 * 6.5, cy1 = q1.y + ny1 * 6.5;
        const h0 = G3.groundAt(cx0, cy0) + 0.08, h1 = G3.groundAt(cx1, cy1) + 0.08;
        G3.quad(b, cx0 - nx0 * 3.8, h0, cy0 - ny0 * 3.8, cx0 + nx0 * 3.8, h0, cy0 + ny0 * 3.8, cx1 + nx1 * 3.8, h1, cy1 + ny1 * 3.8, cx1 - nx1 * 3.8, h1, cy1 - ny1 * 3.8, [0.16, 0.28, 0.22]);
        for (const dl of [-1.2, 1.2]) {
          G3.quad(gl, cx0 + nx0 * (dl - 0.06), h0 + 0.02, cy0 + ny0 * (dl - 0.06), cx0 + nx0 * (dl + 0.06), h0 + 0.02, cy0 + ny0 * (dl + 0.06), cx1 + nx1 * (dl + 0.06), h1 + 0.02, cy1 + ny1 * (dl + 0.06), cx1 + nx1 * (dl - 0.06), h1 + 0.02, cy1 + ny1 * (dl - 0.06), [0.85, 0.92, 0.88]);
        }
      }
      const qT = NET.at(st.line.P, st.s + 22 + Math.sin(st.t * 0.4) * 14);
      G3.vehicle(b, tr, gl, qT.x, G3.groundAt(qT.x, qT.y), qT.y, qT.a, st.line.kind === 'brt' ? 'brt' : st.line.kind === 'tram' ? 'tram' : 'metro', G3.rgb(st.line.color || '#1b8f4b'));
      for (const o of st.obs) {
        if (o.hit || o.s < st.s - 6 || o.s > st.s + 85) continue;
        const qo = NET.at(st.line.P, o.s), ox = qo.x - Math.sin(qo.a) * (6.5 + o.lane * 2.4), oy = qo.y + Math.cos(qo.a) * (6.5 + o.lane * 2.4), oh = G3.groundAt(ox, oy);
        if (o.k === 'cono') G3.box(b, ox - 0.35, oh, oy - 0.35, ox + 0.35, oh + 0.85, oy + 0.35, [0.96, 0.45, 0.12]);
        else if (o.k === 'hueco') G3.box(b, ox - 0.75, oh + 0.01, oy - 0.75, ox + 0.75, oh + 0.12, oy + 0.75, [0.06, 0.06, 0.08]);
        else if (o.k === 'charco') G3.box(gl, ox - 0.85, oh + 0.02, oy - 0.85, ox + 0.85, oh + 0.08, oy + 0.85, [0.22, 0.58, 0.86]);
        else if (o.k === 'valla') {
          G3.box(b, ox - 0.95, oh + 1.15, oy - 0.95, ox + 0.95, oh + 1.85, oy + 0.95, [0.92, 0.72, 0.14]);
          G3.box(b, ox - 0.9, oh, oy - 0.9, ox - 0.75, oh + 1.2, oy - 0.75, [0.4, 0.4, 0.44]);
          G3.box(b, ox + 0.75, oh, oy + 0.75, ox + 0.9, oh + 1.2, oy + 0.9, [0.4, 0.4, 0.44]);
        } else if (o.k === 'moto') G3.vehicle(b, tr, gl, ox, oh, oy, qo.a, 'moto', [0.85, 0.22, 0.18]);
        else G3.box(b, ox - 0.65, oh, oy - 0.65, ox + 0.65, oh + 1.25, oy + 0.65, [0.78, 0.32, 0.24]);
      }
      for (const it of st.items) {
        if (it.got || it.s < st.s - 4 || it.s > st.s + 75) continue;
        const qi = NET.at(st.line.P, it.s), ix = qi.x - Math.sin(qi.a) * (6.5 + it.lane * 2.4), iy = qi.y + Math.cos(qi.a) * (6.5 + it.lane * 2.4), ih = G3.groundAt(ix, iy) + 0.55 + Math.sin(st.t * 5 + it.s) * 0.15;
        const ic = it.k === 'pasaje' ? [0.98, 0.82, 0.18] : it.k === 'dato' ? [0.25, 0.88, 0.96] : [0.45, 0.95, 0.38];
        G3.box(gl, ix - 0.32, ih - 0.32, iy - 0.32, ix + 0.32, ih + 0.32, iy + 0.32, ic);
      }
      if (!fp) {
        const me = typeof Perfil !== 'undefined' ? Perfil.ped() : { skin: '#d9a47a', col: '#1f7a4c', pant: '#263238', hair: '#231812' };
        G3.vehicle(b, tr, gl, st.x, y0, st.y, st.a + st.tilt * 0.35, V.id, col);
        Libre.persona3(b, st.x, y0 + (V.id === 'skate' || V.id === 'patines' ? 0.14 : 0.22), st.y, st.a, me, st.t * 8, st.duck > 0 ? 0.65 : 1, false);
      }
    });
    if (fp) this.drawCabina(g, st, r.w, r.h);
  },
  drawCabina(g, st, w, h) {
    const V = this.V(st), bob = Math.sin(st.t * 11) * 3.5 - st.z * 14 + (st.duck > 0 ? 28 : 0);
    const tilt = st.tilt * 0.35, cx = w * 0.5, cy = h * 0.86 + bob;
    const me = typeof Perfil !== 'undefined' ? Perfil.ped() : { skin: '#d9a47a', col: '#1f7a4c' };
    g.save();
    g.translate(cx, cy); g.rotate(tilt);
    if (V.id === 'skate' || V.id === 'patines') {
      g.fillStyle = V.col;
      roundRect(g, -34, -8, 68, 34, 16, true, false);
      g.fillStyle = '#263238';
      roundRect(g, -28, -2, 56, 24, 12, true, false);
    } else {
      g.strokeStyle = '#263238'; g.lineWidth = 11; g.lineCap = 'round';
      g.beginPath(); g.moveTo(-110, 14); g.quadraticCurveTo(0, -16, 110, 14); g.stroke();
      g.strokeStyle = V.col; g.lineWidth = 9;
      g.beginPath(); g.moveTo(0, -8); g.lineTo(0, 75); g.stroke();
      g.fillStyle = '#11161b'; roundRect(g, -28, -26, 56, 28, 6, true, false);
      g.fillStyle = '#4fc3f7'; g.font = '700 11px system-ui'; g.textAlign = 'center';
      g.fillText(Math.round(st.v * 3.6) + ' km/h', 0, -9);
      g.fillStyle = me.skin;
      g.beginPath(); g.arc(-96, 12, 13, 0, TAU); g.arc(96, 12, 13, 0, TAU); g.fill();
    }
    g.restore();
  },
  draw2D(g, st, r) {
    const w = r.w, h = r.h, hz = h * 0.34, V = this.V(st);
    const sky = g.createLinearGradient(0, 0, 0, hz);
    sky.addColorStop(0, '#163828'); sky.addColorStop(1, '#3b7a57');
    g.fillStyle = sky; g.fillRect(0, 0, w, hz);
    g.fillStyle = '#233229'; g.fillRect(0, hz, w, h - hz);
    g.fillStyle = '#373b40';
    g.beginPath(); g.moveTo(w * 0.36, hz); g.lineTo(w * 0.64, hz); g.lineTo(w * 0.92, h); g.lineTo(w * 0.08, h); g.closePath(); g.fill();
    g.strokeStyle = 'rgba(255,255,255,0.45)'; g.setLineDash([12, 10]); g.lineWidth = 2;
    for (const f of [-0.33, 0.33]) {
      g.beginPath(); g.moveTo(w * (0.5 + f * 0.25), hz); g.lineTo(w * (0.5 + f * 0.8), h); g.stroke();
    }
    g.setLineDash([]);
    const project = (ds, lane) => {
      const t = clamp(1 - ds / 65, 0, 1), p = t * t;
      const y = hz + p * (h * 0.82 - hz), spread = lerp(w * 0.08, w * 0.26, p);
      return { x: w * 0.5 + lane * spread, y, sc: lerp(0.3, 1.35, p) };
    };
    for (const it of st.items) {
      const ds = it.s - st.s; if (it.got || ds < -2 || ds > 65) continue;
      const q = project(ds, it.lane);
      g.fillStyle = it.k === 'pasaje' ? '#fdd835' : it.k === 'dato' ? '#29b6f6' : '#66bb6a';
      g.beginPath(); g.arc(q.x, q.y - 10 * q.sc, 8 * q.sc, 0, TAU); g.fill();
    }
    for (const o of st.obs) {
      const ds = o.s - st.s; if (o.hit || ds < -2 || ds > 65) continue;
      const q = project(ds, o.lane);
      g.fillStyle = o.k === 'cono' ? '#ff7043' : o.k === 'valla' ? '#fbc02d' : o.k === 'charco' ? '#29b6f6' : '#212121';
      g.fillRect(q.x - 14 * q.sc, q.y - 22 * q.sc, 28 * q.sc, 22 * q.sc);
    }
    const qp = project(2, st.laneX / 2.4);
    g.fillStyle = V.col;
    g.beginPath(); g.arc(qp.x, qp.y - 22 - st.z * 18, 16, 0, TAU); g.fill();
  },
  drawHUD(g, st, r) {
    const w = r.w, pct = clamp((st.s - st.s0) / st.len, 0, 1), V = this.V(st);
    g.save();
    g.fillStyle = 'rgba(12, 22, 18, 0.78)';
    roundRect(g, 14, 12, w - 28, 34, 10, true, false);
    g.fillStyle = '#2e5742';
    roundRect(g, 24, 24, w - 170, 10, 5, true, false);
    g.fillStyle = V.col;
    roundRect(g, 24, 24, Math.max(10, (w - 170) * pct), 10, 5, true, false);
    g.fillStyle = '#fff'; g.font = '700 12px system-ui'; g.textAlign = 'right';
    g.fillText(`🎫 ${st.coins} · 💡 ${st.datos} · ${Math.round(st.v * 3.6)} km/h`, w - 24, 33);
    if (st.iman > 0 || st.turbo > 0 || st.escudo > 0) {
      g.textAlign = 'left'; g.fillStyle = '#a5d6a7';
      const pws = [];
      if (st.iman > 0) pws.push('🧲 ' + st.iman.toFixed(0) + 's');
      if (st.turbo > 0) pws.push('⚡ ' + st.turbo.toFixed(0) + 's');
      if (st.escudo > 0) pws.push('🛡️ Casco');
      g.fillText(pws.join('  '), 24, 62);
    }
    if (st.datoMsg && st.datoT > 0) {
      g.fillStyle = 'rgba(15, 34, 26, 0.92)';
      roundRect(g, 18, 70, w - 36, 46, 10, true, false);
      g.fillStyle = '#ffd54f'; g.font = '700 11px system-ui'; g.textAlign = 'left';
      g.fillText('💡 ' + st.datoMsg[0].toUpperCase(), 28, 88);
      g.fillStyle = '#e8f5e9'; g.font = '12px system-ui';
      g.fillText(st.datoMsg[1].slice(0, 78), 28, 105);
    }
    g.restore();
  }
};
```

#### Cómo probarlo
- En el menú principal → **Modos de Juego → 🛴 Run Scooter**, elegir cualquiera de los 6 tramos (`Corredor del Río`, `Bulevar San Juan y la 70`, `Paseo de Ayacucho`, `Avenida 80`, `Troncal Metroplús`, `Sur del Valle`).
- Presionar `🛴` (o `V`) para alternar entre los 5 vehículos y `👁` (o `C`) para alternar entre `3P`, `1P` (con manubrio) y `2D`.

---

### M5 — 6 Vehículos nuevos en Ciudad Libre + Sprites 2D + Modelos 3D (`src/js/36-libre.js`, `21-sprites.js`, `22-gl.js`, `23-lado.js`) **[El Metro]**

#### Qué se hizo
1. **Tabla física y registro en `VEH` (`src/js/36-libre.js`):**
   - Añadidos los 6 vehículos nuevos a `VEH` junto a `bici`, `moto` y `taxi`, respetando el límite físico de aceleración lateral `Libre.giroMax(V, v, false)`:

| ID | Nombre | `vmax` (m/s) | km/h | `acc` (m/s²) | `brk` (m/s²) | `wb` (m) | `lat` (m/s²) | `w × l` (m) | Color HEX |
|---|---|---:|---:|---:|---:|---:|---:|---|---|
| `carro` | Carro particular | `19.5` | `70 km/h` | `7.8` | `15.5` | `2.55` | `8.4` | `1.8 × 4.2` | `#2b6cb0` |
| `scooter` | Monopatín | `9.5` | `34 km/h` | `5.8` | `11.0` | `0.85` | `6.0` | `0.5 × 1.1` | `#29b6f6` |
| `monopatin` | Monopatín eléctrico | `12.5` | `45 km/h` | `7.2` | `13.0` | `0.92` | `6.5` | `0.55 × 1.2` | `#66bb6a` |
| `skate` | Tabla (Skate) | `9.0` | `32 km/h` | `5.4` | `10.0` | `0.65` | `6.8` | `0.45 × 0.9` | `#ff7043` |
| `patines` | Patines en línea | `9.8` | `35 km/h` | `6.0` | `10.5` | `0.55` | `7.2` | `0.45 × 0.7` | `#ec407a` |
| `bus` | Bus alimentador | `16.0` | `58 km/h` | `4.8` | `11.5` | `5.20` | `4.5` | `2.5 × 9.6` | `#1e7e48` |

2. **Aparición en estaciones y tráfico:** `Libre.create` estaciona ejemplares de todos los vehículos nuevos junto a las estaciones del Metro y paradas de bus para que el jugador pueda subirse con `E` / botón de acción.
3. **Arte procedural en las 3 vistas (`src/js/21-sprites.js`, `src/js/23-lado.js`, `src/js/22-gl.js`):**
   - **Vista cenital (`Spr.veh` en `src/js/21-sprites.js`):** dibujados en Canvas con sus dimensiones reales en metros (`carro`: `4,2 m × 1,8 m`, parabrisas `#5e7c8a`, faros `#fff3c4`, stops `#e53935`; `bus`: `9,6 m × 2,5 m`, librea verde/blanca `#1e7e48` / `#eef4ef`, 2 claraboyas en techo `#d7e3dc`; `scooter` y `monopatin`: tabla `#263238` con cinta `#29b6f6`/`#66bb6a` y manubrio cromado `#cfd8dc`; `skate`: lija `#212121` con borde `#ff7043` y ejes `#fdd835`; `patines`: par de botas paralelas `#ec407a` con chasis de 4 ruedas).
   - **Vista lateral (`Lado.vehS` en `src/js/23-lado.js`):** siluetas laterales detalladas con ruedas, guardabarros, ventanillas y faros.
   - **Vista 3D (`G3.vehicle` en `src/js/22-gl.js`):** modelos 3D volumétricos orientados según el rumbo y pendiente del terreno, más el jugador animado encima con `Libre.persona3`.

#### Código cambiado — `src/js/21-sprites.js` (`Spr.veh` para los vehículos nuevos)
```javascript
    if (kind === 'bici' || kind === 'scooter' || kind === 'monopatin' || kind === 'skate' || kind === 'patines') {
      g.fillStyle = 'rgba(0,0,0,.22)'; roundRect(g, -l * .5, -w * .5, l, w, w * .4, true, false);
      if (kind === 'skate') {
        g.fillStyle = col || '#ff7043'; roundRect(g, -l * .48, -w * .42, l * .96, w * .84, w * .4, true, false);
        g.fillStyle = '#212121'; roundRect(g, -l * .36, -w * .3, l * .72, w * .6, w * .25, true, false);
        g.fillStyle = '#fdd835'; g.fillRect(-l * .32, -w * .48, l * .12, w * .96); g.fillRect(l * .2, -w * .48, l * .12, w * .96);
      } else if (kind === 'patines') {
        g.fillStyle = col || '#ec407a';
        roundRect(g, -l * .35, -w * .46, l * .7, w * .36, w * .15, true, false);
        roundRect(g, -l * .35, w * .1, l * .7, w * .36, w * .15, true, false);
      } else if (kind === 'scooter' || kind === 'monopatin') {
        g.fillStyle = '#263238'; roundRect(g, -l * .45, -w * .32, l * .9, w * .64, w * .28, true, false);
        g.fillStyle = col || (kind === 'monopatin' ? '#66bb6a' : '#29b6f6');
        roundRect(g, -l * .34, -w * .22, l * .68, w * .44, w * .18, true, false);
        g.fillStyle = '#cfd8dc'; g.fillRect(l * .26, -w * .48, l * .09, w * .96);
        if (kind === 'monopatin') { g.fillStyle = '#fff9c4'; g.fillRect(l * .36, -w * .14, l * .1, w * .28); }
      } else {
        g.strokeStyle = '#1b1b1b'; g.lineWidth = w * .22;
        g.beginPath(); g.moveTo(-l * .44, 0); g.lineTo(-l * .16, 0); g.moveTo(l * .16, 0); g.lineTo(l * .44, 0); g.stroke();
        g.strokeStyle = col || '#9bd341'; g.lineWidth = w * .24;
        g.beginPath(); g.moveTo(-l * .26, 0); g.lineTo(l * .24, 0); g.stroke();
        g.fillStyle = '#cfd8dc'; g.fillRect(l * .2, -w * .46, l * .08, w * .92);
        g.fillStyle = '#263238'; roundRect(g, -l * .18, -w * .24, l * .22, w * .48, w * .16, true, false);
      }
      g.restore(); return;
    }
```

#### Cómo probarlo
- En **Ciudad Libre**, caminar alrededor de cualquier estación (por ejemplo **San Antonio**, **Estadio** o **Floresta**) y pulsar el botón de subir junto a un **Carro**, **Monopatín**, **Monopatín eléctrico**, **Tabla (Skate)**, **Patines** o **Bus alimentador**.

---

### M6 — Los 6 personajes de EnCicla y Capítulo 6 de Historia (`src/js/39-gente.js`, `37-trama.js`, `70-historia.js`) **[El Metro]**

#### Qué se hizo
1. **Los 6 personajes de *Juega EnCicla* integrados en `GENTE` (`src/js/39-gente.js`):**
   - **Santi** (`id: 'santi'`, mensajero en bici, estación **Floresta**): camisa `#29b6f6`, casco `#fdd835`, mochila (`acc: 1`).
   - **Doña Luz** (`id: 'donaluz'`, florista de Santa Elena, estación **Estadio**): blusa `#ec407a`, sombrero aguadeño (`hat: 2`), carriel (`acc: 2`).
   - **Jairo** (`id: 'jairo'`, mecánico de bicis de EnCicla, estación **Universidad**): overol `#1e88e5`, gorra (`hat: 1`).
   - **Profe Wilson** (`id: 'wilson'`, guía de la ciclovía dominical, estación **Poblado**): camiseta `#66bb6a`, casco de bici (`hat: 3`).
   - **Cata** (`id: 'cata'`, estudiante de arquitectura de la Nacional, estación **Suramericana**): camisa `#ab47bc`, cámara (`acc: 4`).
   - **Maryi** (`id: 'maryi'`, guía ambiental del río Aburrá, estación **Industriales**): chaleco `#26a69a`, sombrero (`hat: 2`), mochila (`acc: 1`).
   - Cada uno incluye frases de nivel `0` (**«Lo que todos saben»**), nivel `1` (**«Lo que pocos saben»**), nivel `2` (historia personal) y su campo `frag` (fragmento compartido de *Juega EnCicla*, que se guarda en `Save.d.fragsEncicla` al conversar con ellos y otorga pasajes `🎫`).
2. **Nuevo Capítulo 6 en la trama de Ciudad Libre (`src/js/37-trama.js`) y en el Modo Historia (`src/js/70-historia.js`):**
   - **Capítulo 6: «Ruedas que conectan el valle»** — Rosalba y la nieta conocen a **Santi** en la estación **Floresta**, descubren cómo las estaciones de EnCicla y las ciclorrutas de San Juan y la 80 se enlazan con el Metro, y desbloquean el reto de **Run Scooter** en `cr:B-occidente`.

#### Código cambiado — `src/js/39-gente.js` (los 6 personajes de EnCicla)
```javascript
  // ── Los 6 personajes compartidos con Juega EnCicla (M6) ──
  { id: 'santi', n: 'Santi', rol: 'mensajero en bici', en: ['est', 'Floresta'],
    p: { skin: '#c98e63', col: '#29b6f6', pant: '#263238', hair: '#1d1510', hairSt: 1, hat: 3, hatC: '#fdd835', acc: 1 },
    frag: 'Fragmento EnCicla 1/6 · Santi: «De Floresta a San Antonio por la ciclorruta de San Juan tardo doce minutos sin gastar un peso de gasolina.»',
    f: [
      [0, 'Las estaciones azules de EnCicla junto al Metro prestan bicicletas gratis con solo acercar la tarjeta Cívica.'],
      [1, 'La ciclorruta de la carrera 80 y la de San Juan se diseñaron con pendiente suave siguiendo las antiguas cotas de quebrada para que pedalear hacia el Centro no canse.'],
      [2, 'Hago entregas entre Laureles, Estadio y el Centro combinando mi bici, los vagones del Metro en hora valle y las estaciones de EnCicla.']
    ] },
  { id: 'donaluz', n: 'Doña Luz', rol: 'florista de Santa Elena', en: ['est', 'Estadio'],
    p: { skin: '#d89e72', col: '#ec407a', pant: '#3e2723', hair: '#5d4037', hairSt: 2, hat: 2, hatC: '#f5e6c8', acc: 2 },
    frag: 'Fragmento EnCicla 2/6 · Doña Luz: «Mis pompones bajan en el cable de Arví y mis nietos los reparten en canasta de bicicleta por el bulevar de la 70.»',
    f: [
      [0, 'En los alrededores de la estación Estadio y el bulevar de la 70 se reúnen ciclistas, patinadores y floristas todos los días de la semana.'],
      [1, 'Muchos árboles del corredor de la 70 y de la canalización de la quebrada La Hueso fueron sembrados durante las obras del Metro para bajar hasta 3 °C la temperatura del andén.'],
      [2, 'Bajo temprano desde Santa Elena con cartuchos y pinochos frescos; el olor a tierra húmeda siempre les recuerda a los viajeros de dónde viene el agua del valle.']
    ] },
  { id: 'jairo', n: 'Jairo', rol: 'mecánico de bicis de EnCicla', en: ['est', 'Universidad'],
    p: { skin: '#a9714b', col: '#1e88e5', pant: '#1c262b', hair: '#1a120d', hairSt: 0, hat: 1, hatC: '#1565c0', acc: 0 },
    frag: 'Fragmento EnCicla 3/6 · Jairo: «Una cicla bien ajustada de frenos y cadena aguanta diez viajes diarios entre la UdeA, Ruta N y el Centro.»',
    f: [
      [0, 'La estación Universidad conecta la Universidad de Antioquia, el Jardín Botánico, el Parque Explora y una de las estaciones de EnCicla con más préstamos del valle.'],
      [1, 'Las bicicletas públicas de EnCicla usan tornillería antirrobo, llantas antipinchazos con banda de kevlar y marco reforzado pensado para los adoquines y puentes del valle.'],
      [2, 'En mi taller móvil junto a los torniquetes reviso frenos, luces y presión de aire para que ningún estudiante se quede varado camino a clase.']
    ] },
  { id: 'wilson', n: 'Profe Wilson', rol: 'guía de la ciclovía dominical', en: ['est', 'Poblado'],
    p: { skin: '#b87d52', col: '#66bb6a', pant: '#263238', hair: '#3e2723', hairSt: 1, hat: 3, hatC: '#43a047', acc: 0 },
    frag: 'Fragmento EnCicla 4/6 · Profe Wilson: «Cada domingo la avenida del Río y El Poblado se vuelven un parque lineal de treinta kilómetros para patines, bicis y familias.»',
    f: [
      [0, 'Las Vías Activas y Saludables (ciclovía) cierran carriles para carros los domingos y festivos y los abren a bicicletas, patines, monopatines y caminantes.'],
      [1, 'La ciclovía del Valle de Aburrá nació en los años ochenta y hoy enlaza Bello, Medellín, Envigado, Itagüí y Sabaneta a lo largo del corredor del río y Las Vegas.'],
      [2, 'Llevo veinte años enseñando a niños y abuelos a soltar las rueditas y a frenar en bajada antes de llegar a la glorieta de Monterrey.']
    ] },
  { id: 'cata', n: 'Cata', rol: 'estudiante de arquitectura', en: ['est', 'Suramericana'],
    p: { skin: '#e0ac84', col: '#ab47bc', pant: '#283593', hair: '#2b1b12', hairSt: 2, hat: 0, hatC: '#000000', acc: 4 },
    frag: 'Fragmento EnCicla 5/6 · Cata: «En mi libreta dibujo cómo los puentes peatonales, las ceibas y las ciclorrutas cosen los barrios a lado y lado del río.»',
    f: [
      [0, 'Desde Suramericana se camina o se pedalea en pocos minutos a Carlos E. Restrepo, la Biblioteca Pública Piloto y el campus de la Universidad Nacional.'],
      [1, 'El barrio Carlos E. Restrepo y Suramericana fueron pioneros en Medellín en integrar pasajes peatonales arborizados sin rejas con plazoletas abiertas al espacio público.'],
      [2, 'Siempre viajo con mi libreta de croquis y una cámara en la bici para dibujar las cubiertas de teja, los calados de ladrillo y los pasos bajo el viaducto.']
    ] },
  { id: 'maryi', n: 'Maryi', rol: 'guía ambiental del río Aburrá', en: ['est', 'Industriales'],
    p: { skin: '#b57c50', col: '#26a69a', pant: '#37474f', hair: '#1c130e', hairSt: 2, hat: 2, hatC: '#d7ccc8', acc: 1 },
    frag: 'Fragmento EnCicla 6/6 · Maryi: «El río Medellín no divide el valle: con el Metro, los cables y las ciclorrutas es la columna vertebral que nos junta de Caldas a Barbosa.»',
    f: [
      [0, 'En Industriales se cruzan la Línea A del Metro, los articulados de Metroplús de las líneas 1 y 2 y el corredor verde del río hacia Parques del Río.'],
      [1, 'El corredor biológico del río Aburrá y el cerro Nutibara sirven de puente para más de cien especies de aves, incluidas guacamayas, barraqueros y gavilanes caminero.'],
      [2, 'Con los recorridos en bici del río enseñamos a reconocer las ceibas rosadas, los guayacanes amarillos y las quebradas que bajan desde las dos cordilleras.']
    ] }
```

#### Cómo probarlo
- En **Ciudad Libre**, visitar las estaciones **Floresta**, **Estadio**, **Universidad**, **Poblado**, **Suramericana** e **Industriales**, acercarse a **Santi**, **Doña Luz**, **Jairo**, **Profe Wilson**, **Cata** y **Maryi** y conversar con cada uno para desbloquear su fragmento compartido (`Save.d.fragsEncicla`).
- En el menú principal → **Modo Historia**, jugar el **Capítulo 6: «Ruedas que conectan el valle»**.

---

## 3. Reporte de Pruebas y Fallas **[El Metro]**

Comando ejecutado: `node tools/build.mjs && node tools/test.mjs 100` en Chromium Headless (Playwright).

| Prueba / Subsistema | Resultado antes de los cambios | Fallas / Avisos encontrados | Corrección aplicada | Resultado final verificado |
|---|---|---|---|---|
| **Compilación (`node tools/build.mjs`)** | `dist/index.html` 8.431 KB | Faltaba `src/js/34-carrera.js` | Integrado `src/js/34-carrera.js` + `src/data/rutas_calles.js` regenerado | **OK** (`dist/index.html` 8.456 KB · 16 comprobaciones de servidor local OK) |
| **Autotest de red y Metroplús (`selfTest`)** | 0 errores, **2 avisos** en Línea O (`MPO`) | `Caribe` a 272,8 m y `La Palma` a 53,5 m de su andén real | Proyección ortogonal y partición de segmentos viales en `tools/rutas_calles.mjs` | **0 errores, 0 avisos** (`Caribe` a 6,0 m; `La Palma` a 5,3 m) |
| **Atlas de arte (`EM.atlas.check`)** | 78 piezas | Al agregar `carrera` a `MODECARDS`, pidió `ico_modo_carrera` | Creado SVG vectorial `ARTE.ico_modo_carrera` en `src/js/19-atlas.js` | **0 errores** (79 piezas de arte validadas) |
| **Modo Run Scooter (`Carrera` / `34-carrera.js`)** | No existía | En la primera corrida `rng.int` no existía en `RNG` (el método es `rng.i`) | Sustituido `rng.int` por `rng.i` en `src/js/34-carrera.js` | **0 errores** (6 corredores + 5 vehículos + bot `Carrera.ai` validados) |
| **Física de 9 vehículos en Ciudad Libre (`VEH`)** | 3 vehículos (`bici`, `moto`, `taxi`) | Faltaban `carro`, `scooter`, `monopatin`, `skate`, `patines`, `bus` | Añadidos los 6 vehículos con límite de aceleración lateral `Libre.giroMax` | **0 errores** (9 vehículos cumplen tope de aceleración lateral a 6, 12, 20 m/s y `vmax`) |
| **Puentes y Deprimidos (`z = -1`, `is_tunnel`)** | 2.150 puentes (`z >= 1`) | No había pasos a desnivel `z = -1` | Añadidos 5 deprimidos reales en `src/js/11-puentes.js` y soporte `z = -1` en `36-libre.js` y `22-gl.js` | **0 errores** (2.155 puentes y deprimidos activos) |
| **Gente de la ciudad + 6 personajes EnCicla (`GENTE`)** | 18 personajes | Faltaban `santi`, `donaluz`, `jairo`, `wilson`, `cata`, `maryi` y sus `frag` | Añadidos los 6 personajes en `src/js/39-gente.js` y Capítulo 6 en `37-trama.js` y `70-historia.js` | **0 errores, 0 avisos** (24 personajes con estación/hito y datos nivel 0, 1 y 2) |
| **Bot de estrés (`EM.test.monkey(100)`)** | 100 partidas (10 modos) | `monkey(100)` reconstruía texturas WebGL sin `EM.headless = true` | `EM.headless = true` durante la simulación + inclusión de `'carrera'` en la rotación de 100 partidas | **100 partidas completadas, 0 errores, 0 errores de consola** |

---

## 4. Diez (+2) Ideas Innovadoras para **[El Metro]** (Ordenadas por Impacto y Esfuerzo)

| # | Idea innovadora | Impacto | Esfuerzo | Descripción concreta y encaje con la visión cultural/educativa |
|---:|---|---|---|---|
| **1** | **Puente Cívica EnCicla ↔ El Metro por código QR / código de 6 letras sin servidor** | ⭐⭐⭐⭐⭐ Muy alto | 🟢 Bajo | Generar en la Billetera Cívica un código compacto de 6 caracteres (con suma de verificación CRC-16 sobre `Save.d.fragsEncicla` y `wallet`) que el jugador pueda copiar en *Juega EnCicla* o en *El Metro* para desbloquear al instante una bicicleta especial dorada, los 6 fragmentos cruzados y una postal conmemorativa del SITVA. |
| **2** | **Ciclovía Dominical Viva según el calendario real (`Mundo.esFestivo`)** | ⭐⭐⭐⭐⭐ Muy alto | 🟢 Bajo | Aprovechar `festivo()` y el reloj de `src/js/12-mundo.js` para que los domingos y lunes festivos de Colombia entre las 7:00 a. m. y la 1:00 p. m. la Avenida del Río, El Poblado y el Estadio cierren un carril al tráfico automotor, pinten conos naranjas y multipliquen por ×4 los patinadores, bicis EnCicla y corredores con misiones del Profe Wilson. |
| **3** | **Radio Metro / Paisaje Sonoro Procedural por Barrio (Web Audio API)** | ⭐⭐⭐⭐⭐ Muy alto | 🟡 Medio | Sintetizar en `03-sound.js` (sin archivos MP3 externos) el timbre real de cierre de puertas del Metro (dos tonos Sol–Mi), la voz sintetizada o campana de próxima estación, el murmullo de agua al cruzar el río o quebradas canalizadas, y guitarreo suave de tiple al subir a Arví. |
| **4** | **Reto «Intermodal Cívica: De la Ladera al Campus en 15 minutos»** | ⭐⭐⭐⭐⭐ Muy alto | 🟡 Medio | Modo contrarreloj en Ciudad Libre donde el jugador recibe un origen en ladera (ej. Santo Domingo o San Javier) y un destino universitario (UdeA, Nacional o EAFIT) y debe combinar **3 modos distintos** (Metrocable → Tren Línea A → Bici EnCicla o Monopatín) validando la integración tarifaria de la tarjeta Cívica ($0 en el transbordo). |
| **5** | **Clima Tropical del Valle en Tiempo Real (Aguacero de tarde y neblina en Arví)** | ⭐⭐⭐⭐ Alto | 🟡 Medio | Añadir transición dinámica de aguacero paisa en `12-mundo.js` y `22-gl.js`: reflejos especulares en el asfalto mojado, aumento de la distancia de frenado en Bus, Volante y Ciudad Libre (`brk * 0.78`), paraguas de colores en los peatones y neblina volumétrica baja al llegar en Metrocable L al Parque Arví (`2.450 m s. n. m.`). |
| **6** | **Modo Foto «Mirador del Valle» con Filtro de Postal Acuarela e Impresión PNG** | ⭐⭐⭐⭐ Alto | 🟢 Bajo | Ampliar la cámara de `Album` para que desde cualquier vista 3D (Dron, Cine o Cabina del Metrocable) el jugador pueda congelar la escena, encuadrar con regla de tercios, aplicar un sello postal con el barrio (`MAP.barrioAt`), la altitud en m s. n. m. y el dato «lo que pocos saben», y descargar la postal como PNG. |
| **7** | **Camión de Balanceo EnCicla (Misión cooperativa en Al Volante / Ciudad Libre)** | ⭐⭐⭐⭐ Alto | 🟡 Medio | Nuevo oficio en Ciudad Libre junto a **Jairo** (mecánico en Universidad): conducir el camión repartidor de EnCicla recogiendo bicicletas en estaciones llenas del Centro (San Antonio, Parque Berrío) a las 8:00 a. m. y llevándolas a estaciones vacías en Carlos E. Restrepo o Suramericana antes de que se agote el tiempo. |
| **8** | **Simulador del Puesto Central de Control (PCC) en Bello con Eventos Reales** | ⭐⭐⭐⭐ Alto | 🔴 Alto | Un nivel maestro de `despacho` + `metroplus` inspirado en el PCC real de Bello: regular la frecuencia de toda la Línea A en hora pico (6:00 a. m. y 5:30 p. m.), inyectar trenes de reserva desde los talleres de Bello y coordinar el paso a nivel del Tranvía de Ayacucho. |
| **9** | **Capas Históricas «El Valle en el Tiempo» (1925 · 1995 · 2026)** | ⭐⭐⭐⭐ Alto | 🔴 Alto | Un selector temporal en el Mapa del Valle (`M`) que permita ver y recorrer: 1) **1925**: el antiguo Tranvía Municipal de Medellín y el Ferrocarril de Antioquia; 2) **1995**: el primer tramo inaugural Niquía–Poblado; 3) **2026**: la red actual más el futuro Metro de la 80 (`Línea E`). |
| **10** | **Muralismo y Arte Urbano Interactivo en Columnas del Viaducto y Comuna 13** | ⭐⭐⭐ Medio-Alto | 🟢 Bajo | Texturizar proceduralmente las columnas pares bajo el viaducto (entre Exposiciones e Industriales y en San Javier) con murales geométricos inspirados en el maestro Pedro Nel Gómez y el grafitour de la Comuna 13; al fotografiarlos a pie se desbloquea su ficha artística en la Libreta. |
| **11** | **Feria de las Flores: Desfile de Silleteros y Chivas en Ciudad Libre** | ⭐⭐⭐ Medio-Alto | 🟡 Medio | Cuando el calendario del juego marque agosto (`Mundo.deco() === 'flores'`), hacer desfilar silleteros con silletas monumentales en 3D por la Avenida del Río y San Juan junto a Don Otoniel y Doña Luz, permitiendo escoltarlos en bici o patines. |
| **12** | **Telemetría Educativa «Huella de Carbono Evitada» en la Libreta Cívica** | ⭐⭐⭐ Medio-Alto | 🟢 Bajo | Sumar en `Save.d` los kilómetros reales recorridos por el jugador en Metro, Metrocable, Tranvía, EnCicla y patineta frente al equivalente en carro particular, mostrando cuántos kilogramos de $\text{CO}_2$ evitó emitir al aire del Valle de Aburrá y cuántos árboles guayacanes equivalen. |

---

## 5. Lista de Verificación Final **[El Metro]**

- [x] **M1** terminada y probada (`0 errores`, `0 avisos` en `selfTest`; terminales `Caribe` a `6,0 m` y `La Palma` a `5,3 m`; laderas 3D sin granulación de 20 m; cámara Cine libre de edificios).
- [x] **M2** terminada y probada (`Motor del Valle 1.1.0` en `motor-valle/`, sincronizado con `node motor-valle/sincronizar.mjs`; 5 pasos deprimidos `z = -1` con `is_tunnel = true`; separadores verdes arborizados; quebradas canalizadas; bancas y paraderos con techo).
- [x] **M3** terminada y probada (techos 3D de teja a dos aguas, planchas con tanque de agua en laderas, torres escalonadas con baliza roja nocturna, segundo anillo de edificios reales de `700 m` a `1.050 m`, estaciones del Metro con interior 3D: línea amarilla, columnas, torniquetes Cívica y escaleras).
- [x] **M4** terminada y probada (modo nuevo **Run Scooter / Carrera por el Valle** en `src/js/34-carrera.js`, 6 corredores reales, 5 vehículos elegibles, vistas `3P`, `1P` con manubrio/manos y `2D`, obstáculos, poderes y cápsulas culturales).
- [x] **M5** terminada y probada (6 vehículos nuevos en Ciudad Libre: `carro`, `scooter`, `monopatin`, `skate`, `patines`, `bus`, con física de giro limitada por aceleración lateral, modelos 3D en `G3.vehicle` y sprites 2D cenitales y laterales).
- [x] **M6** terminada y probada (los 6 personajes de EnCicla: `santi`, `donaluz`, `jairo`, `wilson`, `cata`, `maryi` en `src/js/39-gente.js` con datos nivel 0, 1, 2 y fragmentos cruzados, más el Capítulo 6 «Ruedas que conectan el valle» en `src/js/37-trama.js` y `src/js/70-historia.js`).
- [x] **Diez o más ideas innovadoras** incluidas y ordenadas por impacto y esfuerzo.
- [x] **Todo entregado en un solo documento** marcado con **[El Metro]** (`docs/ENTREGA-EL-METRO.md` y respuesta completa).

---

## 6. Anexo de Integración Directa: Código y Diffs Completos por Archivo **[El Metro]**

> El archivo nuevo `src/js/34-carrera.js` ya está incluido íntegro en la sección M4. A continuación se incluyen los archivos de `motor-valle/` y los diffs exactos (`git diff`) de cada archivo modificado para integración directa.

### Cambios exactos en `tools/rutas_calles.mjs`
```diff
diff --git a/tools/rutas_calles.mjs b/tools/rutas_calles.mjs
index 8517187..f39bf90 100644
--- a/tools/rutas_calles.mjs
+++ b/tools/rutas_calles.mjs
@@ -31,4 +31,17 @@ for (const [e, d] of deg) { if (d > 1) continue; const [x, y] = nodes[e]; let be
   for (let gy = Math.floor((y - 3) / CK); gy <= Math.floor((y + 3) / CK); gy++) for (let gx = Math.floor((x - 3) / CK); gx <= Math.floor((x + 3) / CK); gx++) for (const i of cel.get(gx * 1e5 + gy) || []) { const s = segs[i]; if (s.a === e || s.c === e) continue; const [ax, ay] = nodes[s.a], [cx, cy] = nodes[s.c], dx = cx - ax, dy = cy - ay, L2 = dx * dx + dy * dy || 1, t = ((x - ax) * dx + (y - ay) * dy) / L2; if (t <= .02 || t >= .98) continue; const dd = Math.hypot(ax + dx * t - x, ay + dy * t - y); if (dd < bd) { bd = dd; best = [i, t]; } }
   if (best) { segs[best[0]].cortes.push([best[1], e]); empalmes++; } }
+// paradas y cabeceras sobre tramos rectos largos: parte el segmento vial más cercano para que la parada tenga nodo propio en el eje de la vía
+const _ptsAncla = [...Object.values(paradas).flat()];
+for (const flat of Object.values(RUTAS)) if (flat.length >= 4) _ptsAncla.push([flat[0] * TM / 4, flat[1] * TM / 4], [flat[flat.length - 2] * TM / 4, flat[flat.length - 1] * TM / 4]);
+for (const [x, y] of _ptsAncla) {
+  let best = null, bd = 35;
+  for (let gy = Math.floor((y - 35) / CK); gy <= Math.floor((y + 35) / CK); gy++) for (let gx = Math.floor((x - 35) / CK); gx <= Math.floor((x + 35) / CK); gx++) for (const i of cel.get(gx * 1e5 + gy) || []) {
+    const s = segs[i], [ax, ay] = nodes[s.a], [cx, cy] = nodes[s.c], dx = cx - ax, dy = cy - ay, L2 = dx * dx + dy * dy || 1, t = ((x - ax) * dx + (y - ay) * dy) / L2;
+    if (t <= .02 || t >= .98) continue;
+    const px = ax + dx * t, py = ay + dy * t, dd = Math.hypot(px - x, py - y);
+    if (dd < bd) { bd = dd; best = [i, t, px, py]; }
+  }
+  if (best) { const [i, t, px, py] = best, e = nodo(Math.round(px / U), Math.round(py / U)); if (e !== segs[i].a && e !== segs[i].c) segs[i].cortes.push([t, e]); }
+}
 for (const s of segs) { if (!s.cortes.length) { arista(s.a, s.c, s.f); continue; } s.cortes.sort((p, q) => p[0] - q[0]); let prev = s.a; for (const [, e] of s.cortes) { arista(prev, e, s.f); prev = e; } arista(prev, s.c, s.f); }
 // componente principal de la red (los puntos de paso solo se toman de ahí: nada de arrancar en un parqueadero aislado)
```

### Archivo completo: `motor-valle/VERSION.json`
```json
{
 "version": "1.1.0",
 "fecha": "2026-11-19",
 "fuente_de_verdad": "juanfeliperico369-stack/MetroZero (carpeta motor-valle/)",
 "copias": ["juanfeliperico369-stack/BicicletasUno (carpeta motor-valle/)"],
 "resoluciones": { "encicla": 10, "elmetro": 20 },
 "origen": { "lon0": -75.70, "latN": 6.46, "lon1": -75.31, "latS": 6.015 },
 "capas": ["valle", "ciudad", "vias", "puentes", "edificios", "hitos", "metroplus", "metroplus_andenes", "rieles", "rutas_calles", "ajustes"]
}
```

### Archivo completo: `motor-valle/motor.mjs`
```javascript
#!/usr/bin/env node
/* =====================================================================
   MOTOR DEL VALLE · el motor único que crea el mapa de Juega EnCicla y de El Metro.
   Una sola tubería (motor-valle/geo) y unas mismas fuentes abiertas; cada juego recibe el mapa en su resolución:
     node motor-valle/motor.mjs encicla                  casillas de 10 m → src/data de Juega EnCicla
     node motor-valle/motor.mjs elmetro RUTA_A_ELMETRO    casillas de 20 m → RUTA/src/data/valle.js (formato v3 de El Metro)
     node motor-valle/motor.mjs fuentes                  descarga o actualiza las fuentes (Overture/OSM, relieve y capas oficiales) → motor-valle/geo/cache
     node motor-valle/motor.mjs version                  versión del motor y huella (sha1) de cada archivo de datos
   Opciones: --prueba (deja la salida en motor-valle/salida/ sin tocar los juegos).
   El contrato (coordenadas, capas y reglas) está en motor-valle/MOTOR.md.
   ===================================================================== */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs'; import path from 'node:path'; import crypto from 'node:crypto'; import { fileURLToPath } from 'node:url';
const MOTOR = path.dirname(fileURLToPath(import.meta.url)), GEO = path.join(MOTOR, 'geo'), ROOT = path.join(MOTOR, '..');
const VERSION = JSON.parse(fs.readFileSync(path.join(MOTOR, 'VERSION.json'), 'utf8'));
const args = process.argv.slice(2), cmd = args[0], prueba = args.includes('--prueba');
const py = (script, env = {}, extra = []) => { console.log('▶', script, Object.entries(env).map(([k, v]) => k + '=' + v).join(' ')); const r = spawnSync('python3', [path.join(GEO, script), ...extra], { stdio: 'inherit', env: { ...process.env, ...env } }); if (r.status !== 0) { console.error('✗ falló', script); process.exit(r.status || 1); } };
const sha = f => crypto.createHash('sha1').update(fs.readFileSync(f)).digest('hex').slice(0, 12);
const salida = n => { const d = path.join(MOTOR, 'salida', n); fs.mkdirSync(d, { recursive: true }); return d; };

/* El Metro lee el mismo binario v3 (casillas, relieve, municipios, comunas, barrios, pisos y lotes); su cargador pide la marca ba
   para la capa de barrios y no usa los vectores de calles de Juega EnCicla (tiene los suyos en vias.js) */
function exportarElMetro(dir, destino) {
  const meta = JSON.parse(fs.readFileSync(path.join(dir, 'valle.json'), 'utf8')), bin = fs.readFileSync(path.join(dir, 'valle.bin'));
  for (const k of ['calles', 'vias', 'viasB', 'vq']) delete meta[k];
  if (meta.barrios) meta.ba = 1;
  meta.motor = VERSION.version;
  const cab = `/* Mapa real del Valle de Aburrá, formato v3 (casillas de ${meta.tile} m, relieve de 80 m, y por celda de ${meta.tile * 8} m: barrio, pisos y lotes).
   Generado por el MOTOR DEL VALLE ${VERSION.version} (motor-valle/, el mismo de Juega EnCicla: node motor-valle/motor.mjs elmetro). No editar a mano.
   © colaboradores de OpenStreetMap (ODbL) vía Overture Maps, con huellas de edificios de Overture (OSM, Microsoft y Google); capas oficiales de Medellín; relieve SRTM/NASA. */\n`;
  fs.writeFileSync(destino, cab + 'const VALLE_META = ' + JSON.stringify(meta) + ';\nconst VALLE_BIN = \'' + bin.toString('base64') + '\';\n');
  console.log('✓ El Metro:', destino, (fs.statSync(destino).size / 1048576).toFixed(2), 'MB ·', meta.W + '×' + meta.H, 'casillas de', meta.tile, 'm');
}

if (cmd === 'fuentes') { py('fetch.py'); py('oficial.py'); }
else if (cmd === 'encicla') {
  const out = prueba ? salida('encicla') : path.join(ROOT, 'src', 'data');
  py('build.py', { TILE: '10', OUT: out });
  if (!prueba) { py('sitios.py'); py('alturas.py'); const em = args[1] && !args[1].startsWith('--') ? args[1] : null; if (em) py('metroplus_elmetro.py', {}, [em]); }
  console.log('✓ Juega EnCicla: datos del mapa en', out);
}
else if (cmd === 'elmetro') {
  const em = args[1] && !args[1].startsWith('--') ? args[1] : null; if (!em && !prueba) { console.error('Uso: node motor-valle/motor.mjs elmetro RUTA_A_ELMETRO [--prueba]'); process.exit(1); }
  const tmp = salida('elmetro-20m'); py('build.py', { TILE: '20', OUT: tmp });
  exportarElMetro(tmp, prueba ? path.join(salida('elmetro'), 'valle.js') : path.join(em, 'src', 'data', 'valle.js'));
}
else if (cmd === 'version') {
  console.log('Motor del Valle', VERSION.version, '·', VERSION.fecha);
  for (const f of ['valle.json', 'valle.bin', 'vias.bin', 'sitios.bin', 'sitios.json', 'alturas.json', 'metroplus.json', 'valle.js', 'ciudad.js', 'vias.js', 'puentes.js', 'edificios.js', 'hitos.js', 'metroplus.js', 'metroplus_andenes.js', 'rieles.js', 'rutas_calles.js', 'ajustes.js']) { const p = path.join(ROOT, 'src', 'data', f); if (fs.existsSync(p)) console.log('  ' + f.padEnd(22), sha(p), (fs.statSync(p).size / 1024).toFixed(0) + ' KB'); }
}
else { console.log(fs.readFileSync(fileURLToPath(import.meta.url), 'utf8').split('\n').slice(2, 11).join('\n')); }
```

### Archivo completo: `motor-valle/js/valle.js`
```javascript
/* =====================================================================
   MOTOR DEL VALLE 1.1.0 · Interfaz compartida (MAP, VC, G3)
   Expone las funciones y consultas del motor del Valle de Aburrá compartidas
   entre El Metro (src/js/10-map.js, 11-ciudad2.js, 11-puentes.js, 11-edificios.js, 22-gl.js)
   y Juega EnCicla (motor-valle/MOTOR.md):
   · MAP.elevM(x, y), MAP.tileM(x, y), MAP.barrioAt(x, y), MAP.comunaAt(x, y), MAP.muniAt(x, y), MAP.calleAt(x, y)
   · VC.solid(x, y, r), VC.agarre(x, y), VC.despeja(x, y, r, calle, R), VC.camaraLibre(x0, y0, tx, ty, z0),
     VC.puenteEn(x, y, z, m), VC.tapado(x, y), VC.drawTop(g, W, H, mx, my, k, night), VC.piso3D(X0, Y0, S, sc)
   · G3.init(), G3.draw(cam, opts), G3.toScreen(x, y, z, W, H), G3.vehicle(x, z, y, a, len, kind, c)
   ===================================================================== */
const MotorValle = (typeof EM !== 'undefined' ? (EM.motorValle = {
  version: '1.1.0',
  get map() { return typeof MAP !== 'undefined' ? MAP : null; },
  get vcity() { return typeof VC !== 'undefined' ? VC : null; },
  get g3() { return typeof G3 !== 'undefined' ? G3 : null; }
}) : { version: '1.1.0' });
```

### Cambios exactos en `src/js/11-ciudad2.js`
```diff
diff --git a/src/js/11-ciudad2.js b/src/js/11-ciudad2.js
index 58cfdb1..3698604 100644
--- a/src/js/11-ciudad2.js
+++ b/src/js/11-ciudad2.js
@@ -110,6 +110,6 @@ const VC = EM.vcity = {
         }
       }
-      // árboles de avenida a lado y lado, sobre el andén
-      if (c.k === 2) for (let i = 2; i < P.length; i += 2) { const ax = P[i - 2], ay = P[i - 1], bx = P[i], by = P[i + 1], L = Math.hypot(bx - ax, by - ay); if (L < 8) continue; const ux = (bx - ax) / L, uy = (by - ay) / L; for (let t = 6; t < L - 4; t += 13) for (const sd of [1, -1]) { const x = ax + ux * t - uy * (c.w / 2 + 1.3) * sd, y = ay + uy * t + ux * (c.w / 2 + 1.3) * sd; if (dentro(x, y) && occAt(x, y) !== 2 && asf[Math.floor((y - Y0) / RES) * NG + Math.floor((x - X0) / RES)] !== 2 && tileAt(x, y) !== TT.WATER) trees.push(x, y, 2.6 + h2(x | 0, y | 0, 3) * 1.6, h2(x | 0, y | 0, 4) < .12 ? 1 : 0); } }
+      // árboles de avenida a lado y lado, sobre el andén, y en el separador central cuando la avenida es ancha
+      if (c.k === 2) for (let i = 2; i < P.length; i += 2) { const ax = P[i - 2], ay = P[i - 1], bx = P[i], by = P[i + 1], L = Math.hypot(bx - ax, by - ay); if (L < 8) continue; const ux = (bx - ax) / L, uy = (by - ay) / L; for (let t = 6; t < L - 4; t += 13) { for (const sd of [1, -1]) { const x = ax + ux * t - uy * (c.w / 2 + 1.3) * sd, y = ay + uy * t + ux * (c.w / 2 + 1.3) * sd; if (dentro(x, y) && occAt(x, y) !== 2 && asf[Math.floor((y - Y0) / RES) * NG + Math.floor((x - X0) / RES)] !== 2 && tileAt(x, y) !== TT.WATER) trees.push(x, y, 2.6 + h2(x | 0, y | 0, 3) * 1.6, h2(x | 0, y | 0, 4) < .12 ? 1 : 0); } if (c.w >= 14 && ((t / 13 | 0) % 2 === 0)) { const mx = ax + ux * t, my = ay + uy * t; if (dentro(mx, my) && occAt(mx, my) !== 2 && tileAt(mx, my) !== TT.WATER) trees.push(mx, my, 2.3 + h2(mx | 0, my | 0, 8) * 1.3, h2(mx | 0, my | 0, 9) < .18 ? 1 : 0); } } }
     }
     // 2 · interior de las manzanas: rejilla con desfase, alineada con la calle más cercana
@@ -153,4 +153,21 @@ const VC = EM.vcity = {
     return { x, y };
   },
+  /* punto libre para una cámara 3D (modo cine o tercera persona): fuera de edificios con margen de 2,4 m, con línea de vista hacia (tx, ty)
+     y, si ningún punto cercano está despejado, elevando la cámara por encima del techo del edificio que estorbe */
+  camaraLibre(x0, y0, tx, ty, z0) {
+    if (!this.on) return { x: x0, y: y0, z: z0 };
+    const vis = (px, py) => !this.solid(lerp(px, tx, .25), lerp(py, ty, .25), 1.2) && !this.solid(lerp(px, tx, .5), lerp(py, ty, .5), 1.2) && !this.solid(lerp(px, tx, .75), lerp(py, ty, .75), .9);
+    const busca = (calle, conVis, R) => {
+      const ok = (px, py) => !this.solid(px, py, 2.4) && (!calle || this.agarre(px, py) === 1) && (!conVis || vis(px, py));
+      if (ok(x0, y0)) return { x: x0, y: y0 };
+      for (let d = 2.5; d <= R; d += 2.5) { const n = Math.ceil(d * TAU / 3); for (let i = 0; i < n; i++) { const a = i / n * TAU, px = x0 + Math.cos(a) * d, py = y0 + Math.sin(a) * d; if (ok(px, py)) return { x: px, y: py }; } }
+      return null;
+    };
+    const q = busca(true, true, 45) || busca(false, true, 65) || busca(false, false, 80) || { x: x0, y: y0 };
+    let z = Math.max(z0, MAP.elevM(q.x, q.y) + 2.2);
+    const Rg = this.regionAt(q.x, q.y), k = Math.floor(q.x / 40) * 8192 + Math.floor(q.y / 40);
+    for (const i of Rg.bins.get(k) || []) { const b = (Rg.fis || Rg.bs)[i], dx = q.x - b.x, dy = q.y - b.y, a = dx * b.ux + dy * b.uy, d = -dx * b.uy + dy * b.ux; if (b.k !== 10 && Math.abs(a) < b.hw + 2.2 && Math.abs(d) < b.hd + 2.2) z = Math.max(z, MAP.elevM(b.x, b.y) + b.h + 2.5); }
+    return { x: q.x, y: q.y, z };
+  },
   /* rótulos de calle sobre la vía dibujada: por celda de 320 m, un rótulo por nombre (en el tramo más largo), girado con la calle */
   rot: new Map(),
@@ -223,8 +240,9 @@ const VC = EM.vcity = {
     // el trozo se dibuja por CPU (miles de figuras pequeñas: más rápido y parejo que en la tarjeta gráfica) y se pega como imagen
     const S = L.S, sc = L.sc, n = Math.round(S * sc), c = mkCanvas(n + 2, n + 2), g = c.getContext('2d', { willReadFrequently: this.sw }), X0 = cx * S - 1 / sc, Y0 = cy * S - 1 / sc;   // 1 px de margen alrededor
-    this.suelo(g, n + 2, X0, Y0, S + 2 / sc, sc, L.d);
+    this.suelo(g, n + 2, X0, Y0, S + 2 / sc, sc, L.d, false);
     g.setTransform(sc, 0, 0, sc, -X0 * sc, -Y0 * sc);
     if (L.d < 2 && this.suelosEsp) this.suelosEsp(g, X0, Y0, S + 2 / sc, sc, L.d);
     this.calles(g, X0, Y0, S + 2 / sc, sc, L.d);
+    if (L.d < 2 && this.PG) { const I = (x, y) => ({ x, y }); this.puentesDib(g, I, sc, X0, Y0, X0 + S + 2 / sc, Y0 + S + 2 / sc, -1); }
     if (L.d < 2) this.estructuras(g, X0, Y0, S + 2 / sc, sc, L.d, c);
     if (L.d < 2 && this.PG) { const I = (x, y) => ({ x, y }); for (const z of [1, 2, 3]) this.puentesDib(g, I, sc, X0, Y0, X0 + S + 2 / sc, Y0 + S + 2 / sc, z); }
@@ -236,6 +254,8 @@ const VC = EM.vcity = {
   piso3D(X0, Y0, S, sc) {
     const n = Math.round(S * sc), c = mkCanvas(n, n), g = c.getContext('2d', { willReadFrequently: this.sw });
-    this.suelo(g, n, X0, Y0, S, sc, 1); g.setTransform(sc, 0, 0, sc, -X0 * sc, -Y0 * sc); if (this.suelosEsp) this.suelosEsp(g, X0, Y0, S, sc, 1); this.calles(g, X0, Y0, S, sc, 1); g.setTransform(1, 0, 0, 1, 0, 0);
-    g.globalCompositeOperation = 'multiply'; g.fillStyle = '#bdbab4'; g.fillRect(0, 0, n, n); g.globalCompositeOperation = 'source-over';   // en 3D el sol aclara: el piso va un poco más oscuro
+    this.suelo(g, n, X0, Y0, S, sc, 1, true); g.setTransform(sc, 0, 0, sc, -X0 * sc, -Y0 * sc); if (this.suelosEsp) this.suelosEsp(g, X0, Y0, S, sc, 1); this.calles(g, X0, Y0, S, sc, 1);
+    if (this.PG) { const I = (x, y) => ({ x, y }); this.puentesDib(g, I, sc, X0, Y0, X0 + S, Y0 + S, -1); }
+    g.setTransform(1, 0, 0, 1, 0, 0);
+    g.globalCompositeOperation = 'multiply'; g.fillStyle = '#c4c1bb'; g.fillRect(0, 0, n, n); g.globalCompositeOperation = 'source-over';   // en 3D el sol aclara: el piso va con tono uniforme sin granulado
     return c;
   },
@@ -245,5 +265,5 @@ const VC = EM.vcity = {
   MS: [null, [7, 5, 6], [5, 3, 4], [7, 3, 4, 6], [1, 2, 3], [1, 2, 3, 5, 6, 7], [1, 2, 4, 5], [1, 2, 4, 6, 7], [0, 1, 7], [0, 1, 5, 6], [0, 1, 3, 4, 5, 7], [0, 1, 3, 4, 6], [0, 2, 3, 7], [0, 2, 3, 5, 6], [0, 2, 4, 5, 7], [0, 2, 4, 6]],
   RGB: { 1: [74, 122, 66], 13: [74, 122, 66], 0: [124, 170, 92], 9: [124, 170, 92], 2: [196, 160, 138], 3: [168, 166, 164], 10: [219, 208, 182], 8: [56, 132, 182], 15: [138, 128, 112] },
-  suelo(g, n, X0, Y0, S, sc, lod) {
+  suelo(g, n, X0, Y0, S, sc, lod, es3D = false) {
     const tx0 = Math.floor(X0 / TM) - 1, ty0 = Math.floor(Y0 / TM) - 1, TN = Math.ceil(S / TM) + 3, H = TM / 2, MS = this.MS;
     const tiles = new Uint8Array(TN * TN); for (let j = 0; j < TN; j++) for (let i = 0; i < TN; i++) tiles[j * TN + i] = MAP.tile(tx0 + i, ty0 + j);
@@ -291,18 +311,22 @@ const VC = EM.vcity = {
     }
     g.setTransform(1, 0, 0, 1, 0, 0);
-    // relieve: sombreado de laderas (luz del noroeste) desde la rejilla de elevación, ampliado con suavizado
-    { const ts = TM * sc, dx = (tx0 * TM - X0) * sc, dy = (ty0 * TM - Y0) * sc, E = (x, y) => MAP.elevM(x, y), sh = mkCanvas(TN, TN), shg = sh.getContext('2d'), im = shg.createImageData(TN, TN); let any = 0;
+    // relieve: sombreado de laderas (luz del noroeste) desde la rejilla de elevación en 2D; en 3D la malla ya sombrea con la normal suave del terreno
+    if (!es3D) { const ts = TM * sc, dx = (tx0 * TM - X0) * sc, dy = (ty0 * TM - Y0) * sc, E = (x, y) => MAP.elevM(x, y), sh = mkCanvas(TN, TN), shg = sh.getContext('2d'), im = shg.createImageData(TN, TN); let any = 0;
       for (let j = 0; j < TN; j++) for (let i = 0; i < TN; i++) { const x = (tx0 + i + .5) * TM, y = (ty0 + j + .5) * TM, d = (E(x - 30, y - 30) - E(x + 30, y + 30)) * .012, o = (j * TN + i) * 4; if (Math.abs(d) < .02) continue; any = 1; if (d < 0) { im.data[o + 3] = Math.min(110, -d * 300); } else { im.data[o] = im.data[o + 1] = im.data[o + 2] = 255; im.data[o + 3] = Math.min(60, d * 160); } }
       if (any) { shg.putImageData(im, 0, 0); g.imageSmoothingEnabled = true; g.drawImage(sh, 0, 0, TN, TN, dx + ts / 2, dy + ts / 2, TN * ts, TN * ts); } }
-    // quebradas: un hilo de agua entre los centros de sus casillas, dentro de su retiro verde
-    g.setTransform(sc, 0, 0, sc, -X0 * sc, -Y0 * sc); g.strokeStyle = '#3f8fc4'; g.lineWidth = 2.6; g.lineCap = g.lineJoin = 'round'; g.beginPath();
-    for (let j = 1; j < TN - 1; j++) for (let i = 1; i < TN - 1; i++) { if (tiles[j * TN + i] !== TT.CANAL) continue; const x = (tx0 + i + .5) * TM, y = (ty0 + j + .5) * TM; let solo = 1;
-      for (const [a, b] of [[1, 0], [0, 1], [1, 1], [-1, 1]]) { const u = tiles[(j + b) * TN + i + a]; if (u === TT.CANAL || u === TT.WATER) { if (a && b && (tiles[j * TN + i + a] === TT.CANAL || tiles[(j + b) * TN + i] === TT.CANAL)) continue; g.moveTo(x, y); g.lineTo(x + a * TM, y + b * TM); solo = 0; } }
-      if (solo) { g.moveTo(x - 4, y); g.lineTo(x + 4, y); } }
-    g.stroke(); g.setTransform(1, 0, 0, 1, 0, 0);
+    // quebradas: canal de concreto y lámina de agua entre los centros de sus casillas, dentro de su retiro verde
+    g.setTransform(sc, 0, 0, sc, -X0 * sc, -Y0 * sc); g.lineCap = g.lineJoin = 'round';
+    for (const [col, lw] of [['#989286', 4.2], ['#3f8fc4', 2.6]]) {
+      g.strokeStyle = col; g.lineWidth = lw; g.beginPath();
+      for (let j = 1; j < TN - 1; j++) for (let i = 1; i < TN - 1; i++) { if (tiles[j * TN + i] !== TT.CANAL) continue; const x = (tx0 + i + .5) * TM, y = (ty0 + j + .5) * TM; let solo = 1;
+        for (const [a, b] of [[1, 0], [0, 1], [1, 1], [-1, 1]]) { const u = tiles[(j + b) * TN + i + a]; if (u === TT.CANAL || u === TT.WATER) { if (a && b && (tiles[j * TN + i + a] === TT.CANAL || tiles[(j + b) * TN + i] === TT.CANAL)) continue; g.moveTo(x, y); g.lineTo(x + a * TM, y + b * TM); solo = 0; } }
+        if (solo) { g.moveTo(x - 4, y); g.lineTo(x + 4, y); } }
+      g.stroke();
+    }
+    g.setTransform(1, 0, 0, 1, 0, 0);
   },
   /* desplaza una polilínea a un lado (normal promediada en cada vértice) */
   offset(P, d) { const n = P.length / 2, Q = new Float32Array(P.length); for (let i = 0; i < n; i++) { const a = Math.max(0, i - 1), b = Math.min(n - 1, i + 1), dx = P[2 * b] - P[2 * a], dy = P[2 * b + 1] - P[2 * a + 1], L = Math.hypot(dx, dy) || 1; Q[2 * i] = P[2 * i] - dy / L * d; Q[2 * i + 1] = P[2 * i + 1] + dx / L * d; } return Q; },
-  /* calles: sardinel, andén, asfalto, carriles y cebras */
+  /* calles: sardinel, andén, asfalto, separadores arborizados, mobiliario y cebras */
   calles(g, X0, Y0, S, sc, lod) {
     const cs = this.near(X0 - 40, Y0 - 40, X0 + S + 40, Y0 + S + 40), path = P => { g.moveTo(P[0], P[1]); for (let i = 2; i < P.length; i += 2) g.lineTo(P[i], P[i + 1]); };
@@ -321,4 +345,7 @@ const VC = EM.vcity = {
     for (const k of lod === 2 ? [4, 2, 3] : [1, 4, 2, 3]) run(c => c.k === k, c => lod === 2 ? Math.max(c.w, 9) : c.w, k === 3 ? '#3e434b' : k === 2 ? '#454a52' : '#4d525a');
     if (lod === 2) return;
+    // separador central verde con sardinel en avenidas y autopistas de doble calzada
+    run(c => (c.k === 2 && c.w >= 13) || (c.k === 3 && c.w >= 14), () => 2.1, '#9a958a');
+    run(c => (c.k === 2 && c.w >= 13) || (c.k === 3 && c.w >= 14), () => 1.4, '#5e964b');
     // ciclorrutas
     run(c => c.k === 5, c => c.w + .6, '#e9e6dc'); run(c => c.k === 5, c => c.w, '#2e9d55');
@@ -331,7 +358,20 @@ const VC = EM.vcity = {
         for (const Q of this.partes(c)) { if (Q.length < 4) continue;
           for (const s of [-1, 1]) { g.beginPath(); path(this.offset(Q, s * (c.w / 2 - .5))); g.stroke(); }
-          g.setLineDash([3, 5]); for (let i = 1; i < nl; i++) { g.beginPath(); path(this.offset(Q, -c.w / 2 + i * c.w / nl)); g.stroke(); } g.setLineDash([]);
+          g.setLineDash([3, 5]); for (let i = 1; i < nl; i++) { if (((c.k === 2 && c.w >= 13) || (c.k === 3 && c.w >= 14)) && Math.abs(-c.w / 2 + i * c.w / nl) < 1.2) continue; g.beginPath(); path(this.offset(Q, -c.w / 2 + i * c.w / nl)); g.stroke(); } g.setLineDash([]);
           if (c.k === 3) { g.strokeStyle = '#e8c64a'; g.lineWidth = .25; g.beginPath(); path(this.offset(Q, -(c.w / 2 - .9))); g.stroke(); g.strokeStyle = '#efede5'; g.lineWidth = .22; } }
       } else if (c.k === 4 || c.w >= 8) { g.strokeStyle = c.k === 4 ? '#e8c64a' : '#e7e5dd'; g.lineWidth = .2; g.setLineDash(c.k === 4 ? [] : [2.5, 4]); g.beginPath(); for (const Q of this.partes(c)) path(Q); g.stroke(); g.setLineDash([]); }
+      // mobiliario de andén de cerca: bancas de madera y paraderos con techo en avenidas y carreras
+      if (lod === 0 && (c.k === 2 || c.k === 4)) {
+        for (const Q of this.partes(c)) for (let i = 2; i < Q.length; i += 2) {
+          const ax = Q[i - 2], ay = Q[i - 1], dx = Q[i] - ax, dy = Q[i + 1] - ay, L = Math.hypot(dx, dy); if (L < 36) continue;
+          const ux = dx / L, uy = dy / L, an = Math.atan2(uy, ux), sd = (c.i + i) % 2 ? 1 : -1, off = c.w / 2 + 1.65;
+          const mx = ax + dx * .5 - uy * off * sd, my = ay + dy * .5 + ux * off * sd;
+          if (mx < X0 || mx > X0 + S || my < Y0 || my > Y0 + S) continue;
+          g.save(); g.translate(mx, my); g.rotate(an);
+          if (c.k === 2 && L > 55 && (c.i % 3 === 0)) { g.fillStyle = 'rgba(20,28,38,.22)'; g.fillRect(-1.9, -.4, 4.2, 1.4); g.fillStyle = '#2d637f'; g.fillRect(-2.1, -.6, 4.2, 1.2); g.fillStyle = '#89b8d0'; g.fillRect(-1.8, -.4, 3.6, .35); }
+          else { g.fillStyle = '#7c5333'; g.fillRect(-.9, -.28, 1.8, .56); }
+          g.restore();
+        }
+      }
     }
     // cebras en los cruces con semáforo (VM.lights): a lado y lado del cruce, de borde a borde de cada calle
```

### Cambios exactos en `src/js/11-puentes.js`
```diff
diff --git a/src/js/11-puentes.js b/src/js/11-puentes.js
index 7a09bdc..2438b3b 100644
--- a/src/js/11-puentes.js
+++ b/src/js/11-puentes.js
@@ -10,13 +10,21 @@
 Object.assign(VC, {
   PU: null, PG: null,
+  /* deprimidos y soterrados principales del valle (nivel z = -1, is_tunnel = true): rampas de entrada/salida y tramo cubierto */
+  DEPRIMIDOS: [
+    [0, -1, 14, 4.6, 14880, 23210, 14922, 23290, 14965, 23370],   // Deprimido de la Av. Oriental con La Playa
+    [0, -1, 15, 4.8, 13915, 23685, 14030, 23680, 14145, 23675],   // Deprimido de San Juan (La Alpujarra / Ferrocarril)
+    [0, -1, 18, 5.0, 13580, 23760, 13588, 23970, 13595, 24180],   // Soterrado de Parques del Río
+    [0, -1, 14, 4.5, 11990, 24190, 12080, 24192, 12170, 24195],   // Deprimido de Bulerías (Av. 33)
+    [0, -1, 14, 4.5, 14170, 20030, 14215, 20112, 14260, 20195]    // Deprimido de Terminal del Norte / Caribe
+  ],
   puentesInit() {
     if (typeof PUENTES === 'undefined') return; const out = [], G = this.PG = new Map(), C = 160;
-    for (const r of PUENTES.B) {
-      const pe = r[0], z = r[1], w = r[2], h = r[3], n = (r.length - 4) / 2; if (n < 2) continue;
+    for (const r of PUENTES.B.concat(this.DEPRIMIDOS)) {
+      const pe = r[0], z = r[1], w = r[2], h = r[3], n = (r.length - 4) / 2, is_tunnel = z < 0; if (n < 2) continue;
       const P = new Float32Array(n * 2), cum = new Float32Array(n); let L = 0, x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
       for (let i = 0; i < n; i++) { const x = r[4 + 2 * i], y = r[5 + 2 * i]; P[2 * i] = x; P[2 * i + 1] = y; if (i) L += Math.hypot(x - P[2 * i - 2], y - P[2 * i - 1]); cum[i] = L; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
-      const B = { pe, z, w, h, P, cum, len: L, ramp: Math.min(L * .4, pe ? 9 : 22), x0: x0 - w, y0: y0 - w, x1: x1 + w, y1: y1 + w, i: out.length };
-      // pilas cada ~24 m entre las rampas: a los lados del tablero (en los peatonales, al centro)
-      const pil = []; for (let s = B.ramp + 3; s < L - B.ramp - 2; s += 24) { const q = this.puAt(B, s); if (pe) pil.push(q.x, q.y); else { const o = Math.max(.5, w / 2 - 1.3); pil.push(q.x - q.uy * o, q.y + q.ux * o, q.x + q.uy * o, q.y - q.ux * o); } }
+      const B = { pe, z, w, h, is_tunnel, P, cum, len: L, ramp: Math.min(L * .4, is_tunnel ? 26 : pe ? 9 : 22), x0: x0 - w, y0: y0 - w, x1: x1 + w, y1: y1 + w, i: out.length };
+      // pilas cada ~24 m entre las rampas: a los lados del tablero (en los peatonales, al centro; los deprimidos llevan muros, sin pilas)
+      const pil = []; if (!is_tunnel) for (let s = B.ramp + 3; s < L - B.ramp - 2; s += 24) { const q = this.puAt(B, s); if (pe) pil.push(q.x, q.y); else { const o = Math.max(.5, w / 2 - 1.3); pil.push(q.x - q.uy * o, q.y + q.ux * o, q.x + q.uy * o, q.y - q.ux * o); } }
       B.pil = Float32Array.from(pil); out.push(B);
       for (let gy = Math.floor(B.y0 / C); gy <= Math.floor(B.y1 / C); gy++) for (let gx = Math.floor(B.x0 / C); gx <= Math.floor(B.x1 / C); gx++) { const k = gx * 4096 + gy; let a = G.get(k); if (!a) G.set(k, a = []); a.push(B); }
@@ -32,5 +40,5 @@ Object.assign(VC, {
     return { x: ax + (bx - ax) * t, y: ay + (by - ay) * t, ux: (bx - ax) / L, uy: (by - ay) / L };
   },
-  /* alto del tablero a s metros del comienzo: rampa suave en cada extremo */
+  /* alto (o profundidad si B.is_tunnel) del tablero a s metros del comienzo: rampa suave en cada extremo */
   puAlto(B, s) { const e = Math.min(s, B.len - s), t = clamp(e / (B.ramp || 1), 0, 1); return B.h * t * t * (3 - 2 * t); },
   puProy(B, x, y) {
@@ -40,10 +48,10 @@ Object.assign(VC, {
   },
   puentesEn(x0, y0, x1, y1) { if (!this.PG) return []; const out = new Set(), C = 160; for (let gy = Math.floor(y0 / C); gy <= Math.floor(y1 / C); gy++) for (let gx = Math.floor(x0 / C); gx <= Math.floor(x1 / C); gx++) for (const B of this.PG.get(gx * 4096 + gy) || []) if (B.x1 > x0 && B.x0 < x1 && B.y1 > y0 && B.y0 < y1) out.add(B); return [...out]; },
-  /* el tablero que pasa por (x, y), del nivel z si se pide (si no, el más alto), con su alto ahí */
+  /* el tablero o deprimido que pasa por (x, y), del nivel z si se pide (si no, el más alto o la rampa activa), con su alto ahí */
   puenteEn(x, y, z, m = 0) {
     if (!this.PG) return null; let best = null;
     for (const B of this.PG.get(Math.floor(x / 160) * 4096 + Math.floor(y / 160)) || []) {
       if (x < B.x0 || x > B.x1 || y < B.y0 || y > B.y1 || (z != null && B.z !== z)) continue; const pr = this.puProy(B, x, y); if (pr.d > B.w / 2 + m) continue;
-      const h = this.puAlto(B, pr.s); if (!best || B.z > best.B.z || (B.z === best.B.z && h > best.h)) best = { B, s: pr.s, d: pr.d, h };
+      const h = this.puAlto(B, pr.s); if (!best || Math.abs(B.z) > Math.abs(best.B.z) || (B.z === best.B.z && h > best.h)) best = { B, s: pr.s, d: pr.d, h };
     }
     return best;
@@ -125,4 +133,18 @@ Object.assign(VC, {
       if (B.z !== z) continue; const st = Math.max(1.5, Math.min(6, 4 / k)), n = Math.max(2, Math.ceil(B.len / st) + 1), hw = B.w / 2, E = [];
       for (let i = 0; i < n; i++) { const s = Math.min(B.len, i * B.len / (n - 1)), q = this.puAt(B, s); q.h = this.puAlto(B, s); q.s = s; E.push(q); }
+      if (B.is_tunnel) {
+        // deprimido (z = -1): bocas en rampa con muros de contención en concreto y sombra profunda al entrar al tramo cubierto
+        for (const r0 of [[0, B.ramp], [B.len - B.ramp, B.len]]) {
+          const R = E.filter(q => q.s >= r0[0] - 2 && q.s <= r0[1] + 2); if (R.length < 2) continue;
+          const p = (q, o) => S(q.x - q.uy * o, q.y + q.ux * o);
+          g.beginPath(); R.forEach((q, i) => { const u = p(q, -hw); i ? g.lineTo(u.x, u.y) : g.moveTo(u.x, u.y); });
+          for (let i = R.length - 1; i >= 0; i--) { const u = p(R[i], hw); g.lineTo(u.x, u.y); } g.closePath();
+          g.fillStyle = '#2d3138'; g.fill();
+          if (k > .6) for (const o of [-hw, hw]) { g.strokeStyle = '#928c80'; g.lineWidth = Math.max(1, 1.1 * k); g.beginPath(); R.forEach((q, i) => { const u = p(q, o); i ? g.lineTo(u.x, u.y) : g.moveTo(u.x, u.y); }); g.stroke(); }
+          const portal = r0[0] === 0 ? R[R.length - 1] : R[0], a = p(portal, -hw - .6), b = p(portal, hw + .6);
+          g.strokeStyle = '#c4beb0'; g.lineWidth = Math.max(1.5, 1.8 * k); g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke();
+        }
+        continue;
+      }
       const lado = (q, o, dh = 0) => T(q.x - q.uy * o, q.y + q.ux * o, q.h + dh);
       // 1 · sombra en el piso, corrida según el alto
@@ -156,7 +178,7 @@ Object.assign(VC, {
     return (L._pu = out.filter(r => r[1] - r[0] >= 6));
   },
-  /* alto de un carro del tráfico sobre su puente (0 si va por el piso); deja su nivel en c.z */
-  carAlto(c) { const I = c.L ? this.carrilPuentes(c.L) : null; if (I && I.length) for (const [s0, s1, B] of I) if (c.p >= s0 - 1 && c.p <= s1 + 1) { c.z = B.z; return this.puAlto(B, this.puProy(B, c.x, c.y).s); } c.z = 0; return 0; },
-  /* ¿hay un tablero (de puente o del viaducto) sobre (x, y)? para mostrar al jugador a través de él */
+  /* alto de un carro del tráfico sobre su puente o deprimido (0 si va por el piso); deja su nivel en c.z */
+  carAlto(c) { const I = c.L ? this.carrilPuentes(c.L) : null; if (I && I.length) for (const [s0, s1, B] of I) if (c.p >= s0 - 1 && c.p <= s1 + 1) { c.z = B.z; const h = this.puAlto(B, this.puProy(B, c.x, c.y).s); return B.is_tunnel ? -h : h; } c.z = 0; return 0; },
+  /* ¿hay un tablero (de puente, deprimido o del viaducto) sobre (x, y)? para mostrar al jugador a través de él */
   tapado(x, y) { const P = this.puenteEn(x, y, null, .5); if (P && P.h > 2) return true; if (typeof NET === 'undefined') return false; for (const l of NET.lines) { if (l.kind !== 'metro') continue; const pr = NET.project(l.P, x, y); if (pr.d < 5.2) return true; } return false; }
 });
```

### Cambios exactos en `src/js/19-atlas.js`
```diff
diff --git a/src/js/19-atlas.js b/src/js/19-atlas.js
index 706f2b5..2864214 100644
--- a/src/js/19-atlas.js
+++ b/src/js/19-atlas.js
@@ -6,4 +6,7 @@
    cada módulo sigue dibujando su versión procedural de siempre.
    ===================================================================== */
+if (typeof ARTE !== 'undefined' && !ARTE.ico_modo_carrera) {
+  ARTE.ico_modo_carrera = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 70 55"><rect width="70" height="55" rx="10" fill="#1b3a2b"/><path d="M8 44 L24 20 L46 20 L62 44 Z" fill="#3a3d42"/><line x1="29" y1="20" x2="21" y2="44" stroke="#fff" stroke-width="1.2" stroke-dasharray="3,2"/><line x1="41" y1="20" x2="49" y2="44" stroke="#fff" stroke-width="1.2" stroke-dasharray="3,2"/><circle cx="25" cy="39" r="5" fill="#1b1b1b" stroke="#29b6f6" stroke-width="2"/><circle cx="46" cy="39" r="5" fill="#1b1b1b" stroke="#29b6f6" stroke-width="2"/><path d="M25 39 L43 39 L46 18 L41 18" fill="none" stroke="#9bd341" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><circle cx="35" cy="28" r="4" fill="#fdd835"/></svg>';
+}
 const Atlas = EM.atlas = {
   _u: {}, _i: {},
```

### Cambios exactos en `src/js/21-sprites.js`
```diff
diff --git a/src/js/21-sprites.js b/src/js/21-sprites.js
index 7220d7e..475cda4 100644
--- a/src/js/21-sprites.js
+++ b/src/js/21-sprites.js
@@ -6,8 +6,43 @@
 const Spr = EM.spr = {
   rr(g, x, y, w, h, r) { r = Math.min(r, w / 2, h / 2); if (g.roundRect) { g.beginPath(); g.roundRect(x, y, w, h, r); g.fill(); } else g.fillRect(x, y, w, h); },
-  /* kind: car taxi moto bus brt metro tram cable camioneta · o: {end:'front'|'back'|'both'|'mid', lights, night, doors:'left'|'right', sign}
+  /* kind: car carro taxi moto bici scooter monopatin skate patines bus brt metro tram cable camioneta · o: {end:'front'|'back'|'both'|'mid', lights, night, doors:'left'|'right', sign}
      L, W en píxeles */
   veh(g, kind, L, W, col, o = {}) {
     const dark = '#141414', glass = o.night ? '#263a4d' : '#1f2e3d', glassL = o.night ? '#355068' : '#2f4a60', R = this.rr.bind(this);
+    if (kind === 'bici') {
+      g.fillStyle = dark; g.fillRect(-L * .48, -W * .16, L * .3, W * .32); g.fillRect(L * .18, -W * .16, L * .3, W * .32);   // ruedas
+      g.fillStyle = col || '#9bd341'; g.fillRect(-L * .28, -W * .14, L * .56, W * .28);                                      // cuadro EnCicla
+      g.fillStyle = '#0e2d55'; g.fillRect(L * .16, -W * .38, L * .2, W * .76);                                               // canasta delantera azul
+      g.fillStyle = '#2b2b2b'; g.fillRect(L * .12, -W * .48, L * .08, W * .96);                                              // manubrio
+      g.fillStyle = '#1f1f1f'; R(g, -L * .24, -W * .22, L * .2, W * .44, W * .12);                                           // sillín
+      return;
+    }
+    if (kind === 'scooter' || kind === 'monopatin') {
+      const el = kind === 'monopatin';
+      g.fillStyle = dark; g.fillRect(-L * .48, -W * .2, L * .22, W * .4); g.fillRect(L * .26, -W * .2, L * .22, W * .4);     // ruedas
+      g.fillStyle = col || (el ? '#66bb6a' : '#29b6f6'); R(g, -L * .34, -W * .36, L * .68, W * .72, W * .22);                // tabla
+      g.fillStyle = '#242830'; R(g, -L * .26, -W * .24, L * .48, W * .48, W * .12);                                          // lija antideslizante
+      g.fillStyle = '#1a1d24'; g.fillRect(L * .2, -W * .48, L * .1, W * .96);                                                // manubrio en T
+      if (el) { g.fillStyle = '#fff6c0'; g.fillRect(L * .42, -W * .14, L * .08, W * .28); g.fillStyle = '#ff3b2f'; g.fillRect(-L * .46, -W * .14, L * .07, W * .28); }
+      return;
+    }
+    if (kind === 'skate') {
+      g.fillStyle = '#ff7043';
+      for (const x of [-L * .28, L * .2]) { g.fillRect(x, -W * .5, L * .12, W * .16); g.fillRect(x, W * .34, L * .12, W * .16); } // 4 ruedas naranjas
+      g.fillStyle = '#d99b52'; R(g, -L * .48, -W * .38, L * .96, W * .76, W * .36);                                          // tabla de madera
+      g.fillStyle = '#22252a'; R(g, -L * .38, -W * .28, L * .76, W * .56, W * .24);                                          // lija negra
+      g.fillStyle = col || '#ff7043'; g.fillRect(-L * .08, -W * .26, L * .16, W * .52);                                      // franja central
+      return;
+    }
+    if (kind === 'patines') {
+      for (const s of [-1, 1]) {
+        const y = s * W * .26;
+        g.fillStyle = '#ff80ab'; g.fillRect(-L * .42, y - W * .2, L * .84, W * .4);                                          // chasis y ruedas
+        g.fillStyle = dark; R(g, -L * .38, y - W * .18, L * .76, W * .36, W * .1);
+        g.fillStyle = col || '#ec407a'; R(g, -L * .32, y - W * .14, L * .64, W * .28, W * .08);                              // bota
+        g.fillStyle = '#f4f1ea'; g.fillRect(-L * .05, y - W * .1, L * .22, W * .2);                                          // cordones
+      }
+      return;
+    }
     if (kind === 'moto') {
       g.fillStyle = dark; g.fillRect(-L / 2, -W * .32, L * .28, W * .64); g.fillRect(L / 2 - L * .28, -W * .32, L * .28, W * .64);   // ruedas
```

### Cambios exactos en `src/js/22-gl.js`
```diff
diff --git a/src/js/22-gl.js b/src/js/22-gl.js
index 20bc5ce..5a72dff 100644
--- a/src/js/22-gl.js
+++ b/src/js/22-gl.js
@@ -111,17 +111,25 @@ const G3 = EM.g3 = {
   buf(arr) { const gl = this.gl, b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, arr, gl.STATIC_DRAW); b.n = arr.length / 10; return b; },
   tex(cv, suave) { const gl = this.gl, t = gl.createTexture(), pot = suave && !(cv.width & (cv.width - 1)) && !(cv.height & (cv.height - 1)), F = suave ? gl.LINEAR : gl.NEAREST; gl.bindTexture(gl.TEXTURE_2D, t); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, cv);
-    if (pot) { gl.generateMipmap(gl.TEXTURE_2D); const an = gl.getExtension('EXT_texture_filter_anisotropic'); if (an) gl.texParameterf(gl.TEXTURE_2D, an.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(4, gl.getParameter(an.MAX_TEXTURE_MAX_ANISOTROPY_EXT))); }   // piso de calles: mipmaps y filtro anisótropo
+    if (pot) { gl.generateMipmap(gl.TEXTURE_2D); const an = gl.getExtension('EXT_texture_filter_anisotropic') || gl.getExtension('WEBKIT_EXT_texture_filter_anisotropic'); if (an) gl.texParameterf(gl.TEXTURE_2D, an.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(8, gl.getParameter(an.MAX_TEXTURE_MAX_ANISOTROPY_EXT))); }   // piso de calles: mipmaps y filtro anisótropo 8x
     for (const [k, v] of [[gl.TEXTURE_MIN_FILTER, pot ? gl.LINEAR_MIPMAP_LINEAR : F], [gl.TEXTURE_MAG_FILTER, F], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]]) gl.texParameteri(gl.TEXTURE_2D, k, v); return t; },
   urban(x, y, r) { let n = 0, c = 0; for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) { const v = MAP.tileM(x + i * r, y + j * r); c++; if (v === TT.BRICK || v === TT.BLDG) n++; } return n / c; },
+  /* normal suave del terreno en (x, z) para que las laderas empinadas (Santo Domingo, San Javier) no se vean facetadas ni granuladas */
+  normT(x, z, d = 24) {
+    const nx = MAP.elevM(x - d, z) - MAP.elevM(x + d, z), ny = 2 * d, nz = MAP.elevM(x, z - d) - MAP.elevM(x, z + d), L = Math.hypot(nx, ny, nz) || 1;
+    return [nx / L, ny / L, nz / L];
+  },
+  quadT(mb, a, b, c, d, col, u) {
+    for (const p of [a, d, c, a, c, b]) mb.v(p[0], p[1], p[2], p[3], p[4], p[5], col, u);
+  },
   /* casillas del corredor de metro y tranvía (sin edificios encima de la vía) */
   railMask() { if (this._rm) return this._rm; const m = this._rm = new Set(); for (const l of NET.lines) { if (!(l.kind === 'metro' || l.kind === 'tram' || (l.kind === 'future' && !/cable/i.test(l.name)))) continue; for (let s = 0; s <= l.P.len; s += 8) { const p = NET.at(l.P, s), tx = Math.floor(p.x / TM), ty = Math.floor(p.y / TM); for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) m.add((ty + j) * MW + tx + i); } } return m; },
-  /* malla lejana: todo el valle cada 320 m */
+  /* malla lejana: todo el valle cada 320 m con normales suaves por vértice */
   buildFar(hx0, hz0, hx1, hz1) {   // con hueco (1.4.0): las celdas que caen enteras dentro de la ventana cercana no se arman (no hay piso doble que parpadee)
-    const S = 320, W = MW * TM, H = MH * TM, nx = Math.floor(W / S), nz = Math.floor(H / S), mb = new MB(), E = (i, j) => [i * S, MAP.elevM(i * S, j * S), j * S];
+    const S = 320, W = MW * TM, H = MH * TM, nx = Math.floor(W / S), nz = Math.floor(H / S), mb = new MB(), E = (i, j) => { const x = i * S, z = j * S, n = this.normT(x, z, 80); return [x, MAP.elevM(x, z), z, n[0], n[1], n[2]]; };
     const U = this._U || (this._U = (() => { const U = []; for (let j = 0; j <= nz; j++) for (let i = 0; i <= nx; i++) U.push(this.urban(i * S, j * S, 90)); return U; })());
-    for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) { if (hx0 != null && i * S >= hx0 && (i + 1) * S <= hx1 && j * S >= hz0 && (j + 1) * S <= hz1) continue; const a = E(i, j), b = E(i + 1, j), c = E(i + 1, j + 1), d = E(i, j + 1), u = 2 + U[j * (nx + 1) + i] * .9; mb.tri(a, d, c, [1, 1, 1], u); mb.tri(a, c, b, [1, 1, 1], u); }
+    for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) { if (hx0 != null && i * S >= hx0 && (i + 1) * S <= hx1 && j * S >= hz0 && (j + 1) * S <= hz1) continue; const a = E(i, j), b = E(i + 1, j), c = E(i + 1, j + 1), d = E(i, j + 1), u = 2 + U[j * (nx + 1) + i] * .9; this.quadT(mb, a, b, c, d, [1, 1, 1], u); }
     if (this.far) for (const q of this.far) this.gl.deleteBuffer(q); this.far = mb.done().map(a => this.buf(a));
   },
-  /* ventana cercana (4,8 km) con textura de 4 px por casilla y edificios en 3D */
+  /* ventana cercana con textura vectorial de calles y edificios reales en 3D con techos y anillo extendido */
   buildNear(cx, cz) {
     const real = typeof VC !== 'undefined' && VC.on && !!VC.piso3D, gl = this.gl, half = real ? 1300 : 2400, x0 = Math.floor((cx - half) / TM) * TM, z0 = Math.floor((cz - half) / TM) * TM, nt = 2 * half / TM, P = 8;
@@ -144,15 +152,15 @@ const G3 = EM.g3 = {
     if (this.texNear) gl.deleteTexture(this.texNear); this.texNear = this.tex(cv, real);   // las calles reales, suavizadas
     for (const b of this.near.concat(this.bld)) gl.deleteBuffer(b);
-    const S = 40, n = 2 * half / S, mb = new MB(), E = (i, j) => [x0 + i * S, MAP.elevM(x0 + i * S, z0 + j * S), z0 + j * S];
-    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) { const a = E(i, j), b = E(i + 1, j), c = E(i + 1, j + 1), dd = E(i, j + 1), u = 2 + this.urban(a[0] + 20, a[2] + 20, 20) * .95; mb.tri(a, dd, c, [1, 1, 1], u); mb.tri(a, c, b, [1, 1, 1], u); }
+    const S = 40, n = 2 * half / S, mb = new MB(), E = (i, j) => { const x = x0 + i * S, z = z0 + j * S, nm = this.normT(x, z, 20); return [x, MAP.elevM(x, z), z, nm[0], nm[1], nm[2]]; };
+    const V = []; for (let j = 0; j <= n; j++) { const row = []; for (let i = 0; i <= n; i++) row.push(E(i, j)); V.push(row); }
+    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) { const a = V[j][i], b = V[j][i + 1], c = V[j + 1][i + 1], dd = V[j + 1][i], u = 2 + this.urban(a[0] + 20, a[2] + 20, 20) * .95; this.quadT(mb, a, b, c, dd, [1, 1, 1], u); }
     this.near = mb.done().map(a => this.buf(a));
-    // edificios: bloques de 2×2 casillas dentro de 1,5 km (0,9 km en celulares modestos)
-    const R = Save.d.settings.q === 'low' ? 600 : 1100, bm = new MB(), RR = real && VC.ED ? (Save.d.settings.q === 'low' ? 380 : 700) : 0;
-    if (RR) this.edifReales(bm, cx, cz, RR);
+    // edificios: reales con techos hasta RR (700 m) + anillo real simplificado hasta R2 (1050 m) + siluetas lejanas hasta R (1250 m)
+    const low = Save.d.settings.q === 'low', R = low ? 650 : 1250, bm = new MB(), RR = real && VC.ED ? (low ? 380 : 700) : 0, R2 = RR ? (low ? 560 : 1050) : 0;
+    if (RR) this.edifReales(bm, cx, cz, RR, R2);
     for (let bz = cz - R; bz < cz + R; bz += TM) for (let bx = cx - R; bx < cx + R; bx += TM) {
-      const X = Math.floor(bx / TM) * TM, Z = Math.floor(bz / TM) * TM; if ((X - cx) ** 2 + (Z - cz) ** 2 > R * R || (RR && (X - cx) ** 2 + (Z - cz) ** 2 < RR * RR)) continue;
+      const X = Math.floor(bx / TM) * TM, Z = Math.floor(bz / TM) * TM; if ((X - cx) ** 2 + (Z - cz) ** 2 > R * R || (R2 && (X - cx) ** 2 + (Z - cz) ** 2 < R2 * R2)) continue;
       const v = MAP.tileM(X + 10, Z + 10); if (v !== TT.BLDG && v !== TT.BRICK) continue; if (this.railMask().has((Z / TM | 0) * MW + (X / TM | 0))) continue;
       const r = h2(X, Z, 5), brick = v === TT.BRICK, hgt = brick ? 4 + r * 6 : MAP.bHeight(X + 10, Z + 10, X ^ Z), w = 11 + r * 4, l = 12 + h2(X, Z, 6) * 5, y = MAP.elevM(X + 10, Z + 10) - 2, a = h2(X, Z, 9) < .5 ? 0 : Math.PI / 2;
-      // casas: ladrillo a la vista o pintadas en tonos pastel (como las laderas de Medellín); edificios: concreto y vidrio
       const wall = brick ? (r < .55 ? (r < .3 ? [.71, .35, .23] : [.62, .3, .2]) : HOUSE_COL[(r * 97 | 0) % HOUSE_COL.length]) : [[.55, .59, .64], [.64, .66, .69], [.72, .69, .63], [.85, .8, .68], [.62, .72, .8]][(r * 5) | 0];
       if (brick) { bm.box(X + 10, y, Z + 10, a, l, w, hgt + 2, wall, wall, 1, 0); bm.roof(X + 10, y + hgt + 2, Z + 10, a, l, w, w * .32, ROOF_COL[(r * 31 | 0) % ROOF_COL.length]); if (r < .3) bm.box(X + 10 + l * .3, y + hgt + 2 + w * .1, Z + 10, 0, 1.2, 1.2, 2.2, [.5, .3, .22], [.3, .2, .15]); }
@@ -166,5 +174,5 @@ const G3 = EM.g3 = {
     }
     // árboles en parques y montes cercanos
-    const RT = Save.d.settings.q === 'low' ? 350 : 750;
+    const RT = low ? 350 : 750;
     for (let bz = cz - RT; bz < cz + RT; bz += TM) for (let bx = cx - RT; bx < cx + RT; bx += TM) {
       const X = Math.floor(bx / TM) * TM, Z = Math.floor(bz / TM) * TM; if ((X - cx) ** 2 + (Z - cz) ** 2 > RT * RT) continue;
@@ -175,23 +183,46 @@ const G3 = EM.g3 = {
     this.win = { cx, cz, x0, z0, s: 2 * half }; if (real) this.buildFar(x0 + 40, z0 + 40, x0 + 2 * half - 40, z0 + 2 * half - 40);
   },
-  /* las casas y los edificios reales en 3D (1.4.0): cada huella como caja orientada con su altura y los colores de su zona
-     (muros y techo de VC.estilo), sin las que caen en la calle; las piezas de arquitectura icónica con su planta real; y los puentes */
-  edifReales(bm, cx, cz, R) {
-    const RG = VC.R, cols = new Map(), C = h => { let c = cols.get(h); if (!c) cols.set(h, c = rgb(h)); return c; };
-    for (let ry = Math.floor((cz - R) / RG); ry <= Math.floor((cz + R) / RG); ry++) for (let rx = Math.floor((cx - R) / RG); rx <= Math.floor((cx + R) / RG); rx++) {
+  /* las casas y los edificios reales en 3D (1.5.0):
+     · Dentro de R (700 m): techos a dos aguas en teja de barro, terrazas en plancha con tanque de agua azul/negro en las laderas,
+       y coronas escalonadas con baliza roja nocturna en las torres altas.
+     · Entre R y R2 (700–1050 m): anillo exterior de edificios reales simplificados para ampliar el horizonte urbano sin perder fluidez. */
+  edifReales(bm, cx, cz, R, R2 = R) {
+    const RG = VC.R, Rmax = Math.max(R, R2), R2sq = Rmax * Rmax, Rsq = R * R, cols = new Map(), C = h => { let c = cols.get(h); if (!c) cols.set(h, c = rgb(h)); return c; };
+    for (let ry = Math.floor((cz - Rmax) / RG); ry <= Math.floor((cz + Rmax) / RG); ry++) for (let rx = Math.floor((cx - Rmax) / RG); rx <= Math.floor((cx + Rmax) / RG); rx++) {
       const Rg = VC.reg.get(rx * 4096 + ry), L = Rg ? Rg.bs : VC.edifDe(rx, ry);
-      for (const b of L) { if (b.rec === false || (b.x - cx) ** 2 + (b.y - cz) ** 2 > R * R) continue; if (!Rg && b.rec === undefined && VC.enSegs(VC.segsCerca(b.x, b.y, 1), b.x, b.y)) continue;
-        VC.estilo(b); const y = MAP.elevM(b.x, b.y) - 1.2, a = Math.atan2(b.uy, b.ux); bm.box(b.x, y, b.y, a, b.hw * 2, b.hd * 2, Math.max(2.6, b.h) + 1.2, C(b.cw && b.cw[0] === '#' ? b.cw : '#d9d2c3'), C(b.cr && b.cr[0] === '#' ? b.cr : '#b4583a'), 1, 0); } }
+      for (const b of L) {
+        const d2 = (b.x - cx) ** 2 + (b.y - cz) ** 2;
+        if (b.rec === false || d2 > R2sq || (d2 > Rsq && b.h < 5.5)) continue;
+        if (!Rg && b.rec === undefined && VC.enSegs(VC.segsCerca(b.x, b.y, 1), b.x, b.y)) continue;
+        VC.estilo(b); const y = MAP.elevM(b.x, b.y) - 1.2, a = Math.atan2(b.uy, b.ux), Lx = b.hw * 2, Wz = b.hd * 2, H = Math.max(2.6, b.h) + 1.2;
+        const cw = C(b.cw && b.cw[0] === '#' ? b.cw : '#d9d2c3'), cr = C(b.cr && b.cr[0] === '#' ? b.cr : '#b4583a');
+        bm.box(b.x, y, b.y, a, Lx, Wz, H, cw, cr, 1, 0);
+        if (d2 > Rsq) continue;   // anillo exterior (700–1050 m): caja limpia sin sub-mallas de techo
+        const yt = y + H;
+        if (b.teja && b.h < 11 && Lx < 22 && Wz < 22) {
+          bm.roof(b.x, yt, b.y, a, Lx * .94, Wz * .94, Math.min(2.1, Math.min(Lx, Wz) * .26), cr);
+        } else if (b.h < 12 && b.s < .48 && Lx >= 4.5 && Wz >= 4.5) {
+          // terraza o plancha de ladera con tanque de agua elevado
+          const tc = b.s < .24 ? [.16, .34, .58] : [.18, .19, .22];
+          bm.box(b.x + b.ux * Lx * .22, yt, b.y + b.uy * Lx * .22, a, .95, .95, 1.15, tc, tc, 0, 0);
+        } else if (b.h >= 26) {
+          // torre escalonada con cuarto de máquinas y baliza nocturna en las más altas
+          bm.box(b.x, yt, b.y, a, Lx * .62, Wz * .62, 2.8, cw, cr, 1, 0);
+          if (b.h >= 42) bm.box(b.x, yt + 2.8, b.y, 0, .5, .5, 4.5, [.92, .2, .18], [.92, .2, .18], 4, 4);
+        }
+      }
+    }
     // arquitectura icónica: muros por cada lado de su planta y tapa en abanico
     const HC = { aguja: '#d9dde2', basilica: '#a65a3c', iglesia: '#ece2cf', palacio: '#eeeeea', estadio: '#d7d3cb', rocas: '#2c2e33', vidrio: '#9fb7c9', ladrillo: '#a85b3d', republicano: '#e9dfc6', moderno: '#d0d4d8', cupula: '#e3ddd0', cubos: '#c9c3b6', luces: '#cfd2d6', botero: '#d8cfbd', pies: '#d8cfbd', alpujarra: '#e4e4e0' };
-    for (const H of VC.HT || []) { if ((H.cx - cx) ** 2 + (H.cy - cz) ** 2 > (R + 300) ** 2 || H.libre) continue; const col = rgb(HC[H.k] || '#e2dccf'), top = rgb('#8f8a80'), y0 = MAP.elevM(H.cx, H.cy) - 1.2, h = Math.max(4, H.h || 12);
+    for (const H of VC.HT || []) { if ((H.cx - cx) ** 2 + (H.cy - cz) ** 2 > (Rmax + 300) ** 2 || H.libre) continue; const col = rgb(HC[H.k] || '#e2dccf'), top = rgb('#8f8a80'), y0 = MAP.elevM(H.cx, H.cy) - 1.2, h = Math.max(4, H.h || 12);
       for (const Q of H.P) { const n = Q.length / 2; let sx = 0, sy = 0; for (let i = 0; i < n; i++) { sx += Q[2 * i]; sy += Q[2 * i + 1]; } const ox = sx / n, oy = sy / n;
         for (let i = 0; i < n; i++) { const j = (i + 1) % n, ax = Q[2 * i], ay = Q[2 * i + 1], bx = Q[2 * j], by = Q[2 * j + 1]; bm.quad([ax, y0, ay], [bx, y0, by], [bx, y0 + h, by], [ax, y0 + h, ay], col, 1); bm.tri([ox, y0 + h, oy], [bx, y0 + h, by], [ax, y0 + h, ay], top, 0); } } }
-    // puentes: tablero por tramos a la altura de su rampa
+    // puentes y deprimidos: tablero por tramos a la altura de su rampa, o muros de portal en los deprimidos
     if (VC.puentesEn) for (const B of VC.puentesEn(cx - R, cz - R, cx + R, cz + R)) { const P = B.P, col = rgb(B.pe ? '#b9b3a7' : '#8d8a84');
       for (let i = 1; i < P.length / 2; i++) { const ax = P[2 * i - 2], ay = P[2 * i - 1], bx = P[2 * i], by = P[2 * i + 1], L = Math.hypot(bx - ax, by - ay); if (L < .5) continue; const mx = (ax + bx) / 2, my = (ay + by) / 2, s = VC.puProy(B, mx, my).s, h = VC.puAlto(B, s); if (h < .6) continue;
-        bm.box(mx, MAP.elevM(mx, my) + h - .9, my, Math.atan2(by - ay, bx - ax), L + .4, B.w, .9, col, rgb('#5d5d5d'), 0, 0); } }
+        if (B.is_tunnel) { const an = Math.atan2(by - ay, bx - ax), nx = -Math.sin(an) * (B.w / 2 + .4), ny = Math.cos(an) * (B.w / 2 + .4), zm = MAP.elevM(mx, my); bm.box(mx + nx, zm - h, my + ny, an, L + .3, .7, h + .8, col, col); bm.box(mx - nx, zm - h, my - ny, an, L + .3, .7, h + .8, col, col); }
+        else bm.box(mx, MAP.elevM(mx, my) + h - .9, my, Math.atan2(by - ay, bx - ax), L + .4, B.w, .9, col, rgb('#5d5d5d'), 0, 0); } }
   },
-  /* red de transporte estática: viaductos, rieles, postes, estaciones, torres de cable y carriles de bus */
+  /* red de transporte estática: viaductos, rieles, postes, estaciones con interior (andén, línea amarilla, torniquetes y escaleras), torres de cable y carriles de bus */
   netZ: {},
   trackZ(line) {
@@ -233,5 +264,24 @@ const G3 = EM.g3 = {
         }
         const K2 = KIND[K === 'future' ? 'tram' : K];
-        for (const s of l.st) { const p = NET.at(l.P, s.s), z = this.zOn(l, s.s); for (const sd of [-1, 1]) { const o = sd * (dk ? 7.5 : 5.5), x = p.x - Math.sin(p.a) * o, y = p.y + Math.cos(p.a) * o; mb.box(x, z - (dk ? 1.2 : .2), y, p.a, K2.plat, dk ? 5 : 3, dk ? 2.2 : 1.1, [.85, .8, .7], [.88, .84, .74]); mb.box(x, z + 4.6, y, p.a, K2.plat * .9, dk ? 6 : 3.6, .6, col, col); } if (dk) mb.box(p.x, MAP.elevM(p.x, p.y) - 1, p.y, p.a, 30, 26, z - MAP.elevM(p.x, p.y) - 1.5, [.78, .75, .68], [.78, .75, .68], 1, 0); }
+        for (const s of l.st) {
+          const p = NET.at(l.P, s.s), z = this.zOn(l, s.s), ca = Math.cos(p.a), sa = Math.sin(p.a), nx = -sa, ny = ca, gz = MAP.elevM(p.x, p.y);
+          for (const sd of [-1, 1]) {
+            const o = sd * (dk ? 7.5 : 5.5), x = p.x + nx * o, y = p.y + ny * o, zp = z + (dk ? 1 : .9);
+            // andén con su franja amarilla táctil de seguridad, columnas de cubierta y marquesina
+            mb.box(x, z - (dk ? 1.2 : .2), y, p.a, K2.plat, dk ? 5 : 3, dk ? 2.2 : 1.1, [.85, .8, .7], [.88, .84, .74]);
+            const yo = sd * (dk ? 5.35 : 4.25); mb.box(p.x + nx * yo, zp, p.y + ny * yo, p.a, K2.plat * .96, .32, .06, [.96, .77, .22], [.96, .77, .22], 4, 4);
+            mb.box(x, z + 4.6, y, p.a, K2.plat * .9, dk ? 6 : 3.6, .6, col, col);
+            for (let u = -K2.plat * .38; u <= K2.plat * .38; u += K2.plat * .38) mb.box(x + ca * u, zp, y + sa * u, p.a, .35, .35, 3.6, [.38, .42, .46], [.38, .42, .46]);
+          }
+          if (dk) {
+            // vestíbulo inferior abierto con torniquetes Cívica y escaleras de acceso a los andenes
+            mb.box(p.x, gz - 1, p.y, p.a, 28, 22, .6, [.82, .79, .72], [.86, .83, .76]);
+            for (const u of [-12, 12]) for (const v of [-9, 9]) mb.box(p.x + ca * u + nx * v, gz - .4, p.y + sa * u + ny * v, p.a, 1.4, 1.4, z - gz - 1, [.76, .73, .66], [.76, .73, .66]);
+            // batería de torniquetes con validador verde Cívica
+            for (let v = -5.4; v <= 5.4; v += 1.8) { mb.box(p.x + ca * 9 + nx * v, gz - .4, p.y + sa * 9 + ny * v, p.a, 1.2, .32, 1.05, [.72, .75, .78], [.35, .67, .26]); }
+            // escaleras escalonadas del vestíbulo a cada andén
+            for (const sd of [-1, 1]) for (let k = 0; k < 5; k++) { const f = (k + .5) / 5, sx = p.x + ca * (14 + k * 2.2) + nx * sd * 7.5, sy = p.y + sa * (14 + k * 2.2) + ny * sd * 7.5; mb.box(sx, gz - .4 + f * (z - gz), sy, p.a, 2.4, 2.2, .5, [.78, .75, .68], [.88, .84, .74]); }
+          }
+        }
       } else if (K === 'cable' || (K === 'future' && /cable/i.test(l.name))) {
         const C = this.cableGeo(l);
@@ -241,5 +291,5 @@ const G3 = EM.g3 = {
         const w = K === 'brt' ? 3.2 : 1.6, dark = col.map(v => v * .85);
         for (let s = 0; s < l.P.len - 10; s += 10) { const a = NET.at(l.P, s), b = NET.at(l.P, s + 10), za = MAP.elevM(a.x, a.y) + .45, zb = MAP.elevM(b.x, b.y) + .45, sa = [-Math.sin(a.a), Math.cos(a.a)]; mb.quad([a.x + sa[0] * -w, za, a.y + sa[1] * -w], [a.x + sa[0] * w, za, a.y + sa[1] * w], [b.x + sa[0] * w, zb, b.y + sa[1] * w], [b.x + sa[0] * -w, zb, b.y + sa[1] * -w], dark, 4); }
-        for (const s of l.st) { const z = MAP.elevM(s.x, s.y); mb.box(s.x, z, s.y, NET.at(l.P, s.s).a, K === 'brt' ? 24 : 6, K === 'brt' ? 4 : 2.4, 3.2, [.85, .85, .82], col); }
+        for (const s of l.st) { const z = MAP.elevM(s.x, s.y), an = NET.at(l.P, s.s).a; mb.box(s.x, z, s.y, an, K === 'brt' ? 24 : 6, K === 'brt' ? 4 : 2.4, 3.2, [.85, .85, .82], col); if (K === 'brt') mb.box(s.x, z + .55, s.y, an, 23, 4.15, .08, [.96, .77, .22], [.96, .77, .22], 4, 4); }
       }
     }
@@ -315,4 +365,37 @@ const G3 = EM.g3 = {
   },
   vehicle(x, z, y, a, len, kind, c) {
+    const ca = Math.cos(a), sa = Math.sin(a);
+    if (kind === 'scooter' || kind === 'monopatin') {
+      this.box(x, z + .14, y, a, 1.15, .28, .08, kind === 'monopatin' ? [.18, .2, .24] : [.75, .78, .82]);
+      this.box(x + ca * .44, z + .18, y + sa * .44, a, .08, .08, .86, c);
+      this.box(x + ca * .44, z + 1.02, y + sa * .44, a, .08, .54, .07, [.18, .18, .2]);
+      for (const u of [-.46, .46]) this.box(x + ca * u, z + .04, y + sa * u, a, .22, .12, .22, [.14, .14, .16]);
+      return;
+    }
+    if (kind === 'skate') {
+      this.box(x, z + .14, y, a, .88, .26, .06, c);
+      for (const u of [-.28, .28]) this.box(x + ca * u, z + .04, y + sa * u, a, .12, .32, .12, [.92, .38, .18]);
+      return;
+    }
+    if (kind === 'patines') {
+      for (const v of [-.14, .14]) this.box(x - sa * v, z + .06, y + ca * v, a, .38, .12, .14, c);
+      return;
+    }
+    if (kind === 'bici') {
+      this.box(x, z + .35, y, a, 1.7, .14, .58, c);
+      this.box(x + ca * .58, z + .62, y + sa * .58, a, .1, .58, .08, [.2, .2, .22]);
+      for (const u of [-.56, .56]) this.box(x + ca * u, z + .05, y + sa * u, a, .52, .09, .52, [.15, .15, .18]);
+      return;
+    }
+    if (kind === 'moto') {
+      this.box(x, z + .28, y, a, 1.95, .58, .65, c);
+      this.box(x + ca * .55, z + .72, y + sa * .55, a, .18, .74, .32, [.16, .18, .22]);
+      return;
+    }
+    if (kind === 'carro' || kind === 'taxi') {
+      this.box(x, z + .28, y, a, len || 4.4, 1.82, .76, c);
+      this.box(x - ca * .2, z + 1.04, y - sa * .2, a, (len || 4.4) * .54, 1.66, .56, [.15, .22, .3]);
+      return;
+    }
     const body = kind === 'metro' || kind === 'tram' ? [.86, .88, .9] : c, H = kind === 'metro' ? 3.7 : 3.2, W = kind === 'metro' ? 2.9 : 2.55;
     this.box(x, z + .5, y, a, len, W, H * .55, body); this.box(x, z + .5 + H * .55, y, a, len * .98, W * .98, H * .3, [.12, .2, .28]); this.box(x, z + .5 + H * .85, y, a, len, W, H * .15, kind === 'metro' || kind === 'tram' ? c : [.95, .95, .93]);
```

### Cambios exactos en `src/js/23-lado.js`
```diff
diff --git a/src/js/23-lado.js b/src/js/23-lado.js
index 36fba0b..265273f 100644
--- a/src/js/23-lado.js
+++ b/src/js/23-lado.js
@@ -137,5 +137,16 @@ const Lado = EM.lado = {
       } }
     const carS = (g, x, y, L, c, dir, lit) => { g.fillStyle = '#141414'; g.fillRect(x - L / 2 - 1, y - L * .42 - 1, L + 2, L * .42 + 1); g.fillStyle = c; g.fillRect(x - L / 2, y - L * .4, L, L * .4); g.fillStyle = Art.shade(c, 1.15); g.fillRect(x - L * .3, y - L * .62, L * .55, L * .24); g.fillStyle = lit ? '#ffe7a0' : '#8fc4dc'; g.fillRect(x - L * .26 + (dir > 0 ? L * .3 : 0), y - L * .58, L * .22, L * .16); g.fillStyle = '#141414'; g.beginPath(); g.arc(x - L * .3, y, L * .12, 0, TAU); g.arc(x + L * .3, y, L * .12, 0, TAU); g.fill(); if (lit) { g.fillStyle = '#fff6c0'; g.fillRect(dir > 0 ? x + L / 2 - 2 : x - L / 2, y - L * .2, 2, 2); } };
+    const microS = (g, x, y, k, kind, c, dir) => {
+      g.save(); g.translate(x, y); if (dir < 0) g.scale(-1, 1);
+      g.fillStyle = '#141414';
+      if (kind === 'bici') { g.beginPath(); g.arc(-.6 * k, -.3 * k, .32 * k, 0, TAU); g.arc(.6 * k, -.3 * k, .32 * k, 0, TAU); g.fill(); g.strokeStyle = c || '#9bd341'; g.lineWidth = Math.max(1, .16 * k); g.beginPath(); g.moveTo(-.6 * k, -.3 * k); g.lineTo(0, -.75 * k); g.lineTo(.55 * k, -.3 * k); g.moveTo(0, -.75 * k); g.lineTo(-.25 * k, -.95 * k); g.moveTo(.45 * k, -.75 * k); g.lineTo(.58 * k, -1.05 * k); g.stroke(); }
+      else if (kind === 'scooter' || kind === 'monopatin') { g.beginPath(); g.arc(-.48 * k, -.18 * k, .18 * k, 0, TAU); g.arc(.48 * k, -.18 * k, .18 * k, 0, TAU); g.fill(); g.fillStyle = c || '#29b6f6'; g.fillRect(-.48 * k, -.26 * k, .96 * k, .12 * k); g.fillStyle = '#1f242c'; g.fillRect(.38 * k, -1.1 * k, .1 * k, .88 * k); }
+      else if (kind === 'skate') { g.beginPath(); g.arc(-.32 * k, -.12 * k, .12 * k, 0, TAU); g.arc(.32 * k, -.12 * k, .12 * k, 0, TAU); g.fill(); g.fillStyle = c || '#ff7043'; g.fillRect(-.46 * k, -.24 * k, .92 * k, .1 * k); }
+      else { g.beginPath(); g.arc(-.18 * k, -.1 * k, .1 * k, 0, TAU); g.arc(.18 * k, -.1 * k, .1 * k, 0, TAU); g.fill(); g.fillStyle = c || '#ec407a'; g.fillRect(-.24 * k, -.38 * k, .48 * k, .24 * k); }
+      g.restore();
+    };
+    this.vehS = microS;
     for (const lane of [1, -1]) for (let i = 0; i < 14; i++) { const spd = 9 + (i % 3) * 2, pos = ((o.t * spd + i * 97 + (lane > 0 ? 0 : 48)) % (R.n * R.st + 300)) - 150, s = lane > 0 ? pos : R.n * R.st - pos; if (s < s0 - 10 || s > s1 + 10) continue; const idx = clamp(Math.round(s / R.st), 0, R.n - 1); if (!R.urb[idx]) continue; carS(g, X(s), Y(this.sample(R.near, R, s)) + (lane > 0 ? 5 * k : 8.6 * k), (i % 4 === 0 ? 7 : 4.4) * k, i % 5 === 0 ? '#f2c400' : ['#c43a26', '#2a5a92', '#e9eef3', '#1d1f24', '#9aa7b8', '#3d6b3a', '#d98a3a'][i % 7], lane * (dir || 1), sky.night > .4); }
+    for (let i = 0; i < 6; i++) { const mk = ['bici', 'scooter', 'monopatin', 'skate', 'patines'][i % 5], mc = ['#9bd341', '#29b6f6', '#66bb6a', '#ff7043', '#ec407a'][i % 5], pos = ((o.t * 4.5 + i * 113) % (R.n * R.st + 160)) - 80, s = i % 2 ? pos : R.n * R.st - pos; if (s < s0 || s > s1) continue; const idx = clamp(Math.round(s / R.st), 0, R.n - 1); if (!R.urb[idx]) continue; microS(g, X(s), Y(this.sample(R.near, R, s)) + 2.2 * k, Math.max(1.2, k * .85), mk, mc, (i % 2 ? 1 : -1) * (dir || 1)); }
     for (let i = 0; i < 10; i++) { const pos = ((o.t * 1.3 + i * 61) % (R.n * R.st + 100)) - 50, s = i % 2 ? pos : R.n * R.st - pos; if (s < s0 || s > s1) continue; const idx = clamp(Math.round(s / R.st), 0, R.n - 1); if (!R.urb[idx]) continue; Art.person(g, X(s), Y(this.sample(R.near, R, s)) + .2 * k, Math.max(1, k * .3), i * 13, true); }
     if (o.fg) o.fg(g, X, Y, cNear, sky);
```

### Cambios exactos en `src/js/30-conduce.js`
```diff
diff --git a/src/js/30-conduce.js b/src/js/30-conduce.js
index d67da94..e89ceae 100644
--- a/src/js/30-conduce.js
+++ b/src/js/30-conduce.js
@@ -232,5 +232,5 @@ const Conduce = EM.modes.conduce = {
   drawGL(g, st, W, H, tps) {
     G3.show(true); const line = NET.byId[st.line], K = KIND[st.kind], dir = st.dir, p = NET.at(line.P, st.s), a = p.a + (dir < 0 ? Math.PI : 0), z = this.zLine(line, st.s), col = rgb(line.color);
-    let cam; if (st.view === 'cine') { if (!st._cine || (st._cine.s - st.s) * dir < -40) { const sa = st.s + dir * (150 + h2(st.t | 0, 1, 1) * 120), sd = h2(st.t | 0, 2, 1) < .5 ? -1 : 1, q = NET.at(line.P, sa, sd * (26 + h2(st.t | 0, 3, 1) * 22)); st._cine = { s: sa, x: q.x, y: q.y, z: MAP.elevM(q.x, q.y) + 1.7 }; } cam = { eye: [st._cine.x, st._cine.z, st._cine.y], at: [p.x, z + 3, p.y], fov: .9 }; }
+    let cam; if (st.view === 'cine') { if (!st._cine || (st._cine.s - st.s) * dir < -40) { const sa = st.s + dir * (150 + h2(st.t | 0, 1, 1) * 120), sd = h2(st.t | 0, 2, 1) < .5 ? -1 : 1, q0 = NET.at(line.P, sa, sd * (26 + h2(st.t | 0, 3, 1) * 22)), q = typeof VC !== 'undefined' && VC.camaraLibre ? VC.camaraLibre(q0.x, q0.y, p.x, p.y, MAP.elevM(q0.x, q0.y) + 2.6 + (st.kind === 'metro' ? 6 : 0)) : { x: q0.x, y: q0.y, z: MAP.elevM(q0.x, q0.y) + 2.6 }; st._cine = { s: sa, x: q.x, y: q.y, z: q.z }; } cam = { eye: [st._cine.x, st._cine.z, st._cine.y], at: [p.x, z + 3, p.y], fov: .9 }; }
     else if (tps) { const sb = st.s - dir * (K.len + 30), q = NET.at(line.P, sb, dir * 6); cam = { eye: [q.x, this.zLine(line, sb) + 12, q.y], at: [p.x + Math.cos(a) * 16, z + 2.5, p.y + Math.sin(a) * 16], fov: .95 }; }
     else { const q = NET.at(line.P, st.s + dir * 90); cam = { eye: [p.x, z + 2.9, p.y], at: [q.x, this.zLine(line, st.s + dir * 90) + 1.5, q.y], fov: 1.1 }; }
```

### Cambios exactos en `src/js/32-volante.js`
```diff
diff --git a/src/js/32-volante.js b/src/js/32-volante.js
index 76bbe5c..369cb7f 100644
--- a/src/js/32-volante.js
+++ b/src/js/32-volante.js
@@ -215,5 +215,5 @@ const Volante = EM.modes.volante = {
   draw3D(g, st, W, H, line, B) {
     const c = Math.cos(st.h), s = Math.sin(st.h), z = this.elev(st.x, st.y), sh = st.shake > 0 ? (Math.random() - .5) * st.shake * 2 : 0; let cam;
-    if (st.view === 'cine') { if (!st._cine || st._cine.s - st.sR < -25) { const sa = Math.min(line.P.len, st.sR + 110 + h2(st.t | 0, 1, 2) * 60), sd = h2(st.t | 0, 2, 2) < .5 ? -1 : 1, q = NET.at(line.P, sa, sd * 13); st._cine = { s: sa, x: q.x, y: q.y, z: this.elev(q.x, q.y) + 1.6 }; } cam = { eye: [st._cine.x, st._cine.z, st._cine.y], at: [st.x + c * 6, z + 2, st.y + s * 6], fov: .95 }; }
+    if (st.view === 'cine') { if (!st._cine || st._cine.s - st.sR < -25) { const sa = Math.min(line.P.len, st.sR + 110 + h2(st.t | 0, 1, 2) * 60), sd = h2(st.t | 0, 2, 2) < .5 ? -1 : 1, q0 = NET.at(line.P, sa, sd * 13), q = typeof VC !== 'undefined' && VC.camaraLibre ? VC.camaraLibre(q0.x, q0.y, st.x, st.y, this.elev(q0.x, q0.y) + 2.2) : { x: q0.x, y: q0.y, z: this.elev(q0.x, q0.y) + 2.2 }; st._cine = { s: sa, x: q.x, y: q.y, z: q.z }; } cam = { eye: [st._cine.x, st._cine.z, st._cine.y], at: [st.x + c * 6, z + 2, st.y + s * 6], fov: .95 }; }
     else if (st.view === 'cab') cam = { eye: [st.x + c * (B.wb + 1.6), z + 2.9 + sh, st.y + s * (B.wb + 1.6)], at: [st.x + c * 60, z + 1.5 + (this.elev(st.x + c * 60, st.y + s * 60) - z) * .6, st.y + s * 60], fov: 1.15 };
     else { const bk = B.len2 ? 30 : 25, ex = st.x - c * bk, ey = st.y - s * bk, ez = Math.max(z, this.elev(ex, ey)) + 12; if (!st._cam) st._cam = { x: ex, y: ey, z: ez }; st._cam.x += (ex - st._cam.x) * .18; st._cam.y += (ey - st._cam.y) * .18; st._cam.z += (ez - st._cam.z) * .18; cam = { eye: [st._cam.x, st._cam.z + sh, st._cam.y], at: [st.x + c * 14, z + 2.5, st.y + s * 14], fov: .95 }; }
```

### Cambios exactos en `src/js/36-libre.js`
```diff
diff --git a/src/js/36-libre.js b/src/js/36-libre.js
index a26f5a2..67265d3 100644
--- a/src/js/36-libre.js
+++ b/src/js/36-libre.js
@@ -6,11 +6,18 @@
    ===================================================================== */
 const VEH = {
-  taxi: { n: 'Taxi', len: 4.4, wid: 1.8, wb: 2.6, vmax: 100 / 3.6, acc: 3.4, brk: 7, smax: .62, srate: 2.4, grip: 6, lat: 8.5, col: '#f2c400', icon: '🚕', soft: 1 },
-  moto: { n: 'Moto', len: 2.1, wid: .8, wb: 1.4, vmax: 115 / 3.6, acc: 4.2, brk: 7, smax: .7, srate: 3.2, grip: 7, lat: 9.5, col: '#EC343A', icon: '🏍', soft: 1, ciclo: 1 },
-  camioneta: { n: 'Camioneta del Metro', len: 5.3, wid: 1.95, wb: 3.1, vmax: 95 / 3.6, acc: 2.9, brk: 6.5, smax: .58, srate: 2.1, grip: 5.5, lat: 7.5, col: '#1C5C9C', icon: '🛻', soft: 1, campo: 1 },
-  bici: { n: 'Bici EnCicla', len: 1.8, wid: .6, wb: 1.05, vmax: 30 / 3.6, acc: 1.6, brk: 4, smax: .8, srate: 4, grip: 9, lat: 5.5, col: '#9bd341', icon: '🚲', soft: 1, ciclo: 1, walk: 1 },
-  alimentador: { n: 'Bus alimentador', len: 12, wid: 2.5, wb: 6, vmax: 55 / 3.6, acc: 1.2, brk: 3, smax: .55, srate: 1.3, grip: 5, lat: 4.2, col: '#f4f1ea', icon: '🚐', soft: 0 },
-  metroplus: { n: 'Articulado Metroplús', len: 18, wid: 2.55, wb: 6.5, vmax: 65 / 3.6, acc: 1.05, brk: 2.8, smax: .5, srate: 1.15, grip: 5, lat: 3.8, art: 5.6, col: '#0E6F76', icon: '🚌', soft: 0 }
+  taxi: { n: 'Taxi', len: 4.4, wid: 1.8, wb: 2.6, vmax: 100 / 3.6, acc: 3.4, brk: 7, smax: .62, srate: 2.4, grip: 6, lat: 8.5, col: '#f2c400', icon: '🚕', ico: '🚕', soft: 1 },
+  carro: { n: 'Carro particular', len: 4.4, wid: 1.85, wb: 2.6, vmax: 75 / 3.6, acc: 4.8, brk: 10.5, smax: .52, srate: 3, grip: 8.5, lat: 6.8, col: '#1C5C9C', icon: '🚗', ico: '🚗', soft: 1 },
+  moto: { n: 'Moto', len: 2.1, wid: .8, wb: 1.4, vmax: 115 / 3.6, acc: 4.2, brk: 7, smax: .7, srate: 3.2, grip: 7, lat: 9.5, col: '#EC343A', icon: '🏍', ico: '🏍', soft: 1, ciclo: 1 },
+  camioneta: { n: 'Camioneta del Metro', len: 5.3, wid: 1.95, wb: 3.1, vmax: 95 / 3.6, acc: 2.9, brk: 6.5, smax: .58, srate: 2.1, grip: 5.5, lat: 7.5, col: '#1C5C9C', icon: '🛻', ico: '🛻', soft: 1, campo: 1 },
+  bici: { n: 'Bici EnCicla', len: 1.8, wid: .6, wb: 1.05, vmax: 30 / 3.6, acc: 1.6, brk: 4, smax: .8, srate: 4, grip: 9, lat: 5.5, col: '#9bd341', icon: '🚲', ico: '🚲', soft: 1, ciclo: 1, walk: 1 },
+  scooter: { n: 'Monopatín', len: 1.15, wid: .45, wb: .85, vmax: 20 / 3.6, acc: 3.4, brk: 7.5, smax: .68, srate: 4.2, grip: 11, lat: 6.2, col: '#29b6f6', icon: '🛴', ico: '🛴', soft: 1, ciclo: 1, walk: 1 },
+  monopatin: { n: 'Monopatín eléctrico', len: 1.25, wid: .52, wb: .95, vmax: 28 / 3.6, acc: 4.5, brk: 8.5, smax: .64, srate: 4, grip: 10.5, lat: 6.2, col: '#66bb6a', icon: '⚡', ico: '⚡', soft: 1, ciclo: 1, walk: 0 },
+  skate: { n: 'Tabla (Skate)', len: .88, wid: .32, wb: .65, vmax: 22 / 3.6, acc: 3.1, brk: 6.2, smax: .62, srate: 4, grip: 9.5, lat: 5.8, col: '#ff7043', icon: '🛹', ico: '🛹', soft: 1, ciclo: 1, walk: 1 },
+  patines: { n: 'Patines', len: .55, wid: .48, wb: .55, vmax: 24 / 3.6, acc: 3.8, brk: 7, smax: .72, srate: 4.5, grip: 11.5, lat: 6.5, col: '#ec407a', icon: '🛼', ico: '🛼', soft: 1, ciclo: 1, walk: 1 },
+  bus: { n: 'Bus urbano', len: 10.8, wid: 2.5, wb: 5.4, vmax: 55 / 3.6, acc: 2.4, brk: 7.2, smax: .45, srate: 2.2, grip: 7.2, lat: 4.8, col: '#2f9b57', icon: '🚍', ico: '🚍', soft: 0, bus: 1 },
+  alimentador: { n: 'Bus alimentador', len: 12, wid: 2.5, wb: 6, vmax: 55 / 3.6, acc: 1.2, brk: 3, smax: .55, srate: 1.3, grip: 5, lat: 4.2, col: '#f4f1ea', icon: '🚐', ico: '🚐', soft: 0 },
+  metroplus: { n: 'Articulado Metroplús', len: 18, wid: 2.55, wb: 6.5, vmax: 65 / 3.6, acc: 1.05, brk: 2.8, smax: .5, srate: 1.15, grip: 5, lat: 3.8, art: 5.6, col: '#0E6F76', icon: '🚌', ico: '🚌', soft: 0 }
 };
+const MICRO_V = new Set(['bici', 'scooter', 'monopatin', 'skate', 'patines']);
 const SOLID_V = new Set([TT.MOUNT, TT.BRICK, TT.BLDG, TT.WATER, TT.CANAL, TT.LAND]), SOLID_W = new Set([TT.BRICK, TT.BLDG, TT.LAND, TT.WATER, TT.CANAL]);
 Music.SONGS.ciudad = { bpm: 100, root: 55, sc: [0, 2, 3, 5, 7, 9, 10], prog: [0, 3, 4, 3], bass: [1, 0, 0, 1, 0, 0, 1, 0], mel: .4, w: 'triangle' };
@@ -38,5 +45,5 @@ const Libre = EM.modes.libre = {
     if (!VC.on || (st._ac = (st._ac || 0) + 1) % 15) return;
     st.docks.forEach((D, i) => { if (D.ok || dist(D.x, D.y, st.x, st.y) > 320) return; const q = VC.despeja(D.x, D.y, 2.2), dx = q.x - D.x, dy = q.y - D.y; D.x = q.x; D.y = q.y; D.ok = 1; for (const p of st.parked) if (p.dock === i && !p.ok) { p.x += dx; p.y += dy; p.ok = 1; } });
-    for (const p of st.parked) { if (p.ok || dist(p.x, p.y, st.x, st.y) > 320) continue; const q = VC.despeja(p.x, p.y, p.kind === 'bici' ? .5 : 1.4, p.kind !== 'bici'); p.x = q.x; p.y = q.y; p.ok = 1; }
+    for (const p of st.parked) { if (p.ok || dist(p.x, p.y, st.x, st.y) > 320) continue; const mc = MICRO_V.has(p.kind), q = VC.despeja(p.x, p.y, mc ? .5 : 1.4, !mc); p.x = q.x; p.y = q.y; p.ok = 1; }
   },
   nearTile(x, y, ok, maxR = 8) { const tx = Math.floor(x / TM), ty = Math.floor(y / TM); for (let r = 0; r <= maxR; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) { if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue; if (ok(MAP.tile(tx + dx, ty + dy))) return { x: (tx + dx + .5) * TM, y: (ty + dy + .5) * TM }; } return { x, y }; },
@@ -46,9 +53,19 @@ const Libre = EM.modes.libre = {
     let start; if ((lv === 'lb:ultimo' || (trama && !fresh)) && sv.x) start = { x: sv.x, y: sv.y }; else { const h = this.hub(trama ? 'Niquía' : lv === 'lb:mapa' ? 'San Antonio' : lv.startsWith('lb:') ? lv.slice(3) : 'San Antonio'); start = this.libre(h.x, h.y, v => v === TT.WALK || v === TT.PLAZA || v === TT.STATION, 6); }
     const st = { lvId: lv, x: start.x, y: start.y, h: -Math.PI / 2, vf: 0, vs: 0, steer: 0, mode: 'walk', veh: null, ride: null, hb: false, run: false, joy: { x: 0, y: 0, m: 0 }, keys: {}, t: 0, dmg: 0, job: null, jobT: 18, jobs: 0, pay: 0, crashes: 0, peds: 0, km: 0, photos: [], visited: Object.assign({}, sv.visited || {}), cam: { x: start.x, y: start.y, k: 3 }, z: 0, far: false, parked: [], msg: [], shake: 0, seed: opts.seed | 0, act: 0, actHold: 0, done: false, auto: !!opts.auto, radio: 0, lastHub: null, near: null, engine: 0 };
-    // vehículos parqueados: taxis y bicis en las estaciones, camionetas en el taller de Bello, alimentadores en sus cabeceras, articulados en Metroplús
-    const park = (kind, x, y, a) => { const p = this.nearTile(x, y, v => v === TT.ROAD || v === TT.AVE || v === TT.DEPOT || v === TT.WALK, 7); st.parked.push({ kind, x: p.x, y: p.y, a: a != null ? a : rng.f() * TAU, id: st.parked.length }); };
+    // vehículos parqueados: taxis, carros, buses y micromovilidad (bicis, monopatines, skates, patines) en las estaciones
+    const park = (kind, x, y, a) => { const mc = MICRO_V.has(kind), p = this.nearTile(x, y, v => mc ? (v === TT.WALK || v === TT.PLAZA || v === TT.STATION || v === TT.ROAD) : (v === TT.ROAD || v === TT.AVE || v === TT.DEPOT || v === TT.WALK), 7); st.parked.push({ kind, x: p.x, y: p.y, a: a != null ? a : rng.f() * TAU, id: st.parked.length }); };
     // estaciones de EnCicla (src/data/encicla.js, de Juega EnCicla): anclajes con 2 a 4 bicis
     st.docks = []; if (typeof ENCICLA !== 'undefined') ENCICLA.estaciones.forEach(([n, mu, la, lo, tp], i) => { const q = geoM(la, lo), p = this.nearTile(q.x, q.y, v => v === TT.WALK || v === TT.PLAZA || v === TT.STATION || v === TT.GRASS, 5); st.docks.push({ n, mu, tp, x: p.x, y: p.y }); for (let b = 0, nb = 2 + (h2(i, 7, 5) * 3 | 0); b < nb; b++) st.parked.push({ kind: 'bici', x: p.x - 2.4 + b * 1.4, y: p.y + 1.6, a: Math.PI / 2, id: st.parked.length, dock: i }); });
-    for (const h of NET.stations) { if (!h.lines.some(l => l.kind === 'metro' || l.kind === 'tram')) continue; park('taxi', h.x + 30, h.y + 14); if (!st.docks.length && rng.f() < .7) park('bici', h.x - 24, h.y + 10); if (rng.f() < .25) park('moto', h.x + 18, h.y - 26); }
+    const micros = ['scooter', 'monopatin', 'skate', 'patines'];
+    NET.stations.forEach((h, idx) => {
+      if (!h.lines.some(l => l.kind === 'metro' || l.kind === 'tram')) return;
+      park('taxi', h.x + 30, h.y + 14);
+      park(micros[idx % micros.length], h.x - 14, h.y - 10, 0);
+      if (idx % 2 === 0) park(micros[(idx + 1) % micros.length], h.x + 12, h.y - 12, Math.PI / 4);
+      if (rng.f() < .45) park('carro', h.x - 28, h.y + 18);
+      if (idx % 4 === 0) park('bus', h.x + 42, h.y - 22);
+      if (!st.docks.length && rng.f() < .7) park('bici', h.x - 24, h.y + 10);
+      if (rng.f() < .25) park('moto', h.x + 18, h.y - 26);
+    });
     const bello = this.hub('Bello'); park('camioneta', bello.x + 60, bello.y + 40); park('camioneta', bello.x - 50, bello.y + 70); const sa = this.hub('San Antonio'); park('camioneta', sa.x + 60, sa.y - 50);
     for (const l of NET.lines) { if (l.kind === 'feeder') park('alimentador', l.st[0].x, l.st[0].y, NET.at(l.P, 5).a); if (l.kind === 'brt') { park('metroplus', l.st[0].x, l.st[0].y, NET.at(l.P, 5).a); park('metroplus', l.st[l.st.length - 1].x, l.st[l.st.length - 1].y, NET.at(l.P, l.P.len - 5).a + Math.PI); } }
@@ -261,12 +278,12 @@ const Libre = EM.modes.libre = {
   nivel(st, x, y, bloq, pie) {
     if (!VC.PG) return [!bloq(x, y), 0];
-    if (st.z > 0) { if (VC.puenteEn(x, y, st.z, .1)) return [true, st.z]; const cur = VC.puenteEn(st.x, st.y, st.z, .8); if (!cur || cur.h < 1.2) return [!bloq(x, y), 0]; return [false, st.z]; }
+    if (st.z !== 0) { if (VC.puenteEn(x, y, st.z, .1)) return [true, st.z]; const cur = VC.puenteEn(st.x, st.y, st.z, .8); if (!cur || cur.h < 1.2) return [!bloq(x, y), 0]; return [false, st.z]; }
     const P = VC.puenteEn(x, y, null, 0); if (P && P.h < .9 && (pie || !P.B.pe)) return [true, P.B.z];
     return [!bloq(x, y), 0];
   },
-  /* lo mismo para un vehículo: en el tablero, ninguna esquina puede salirse de la baranda (salvo en las rampas) */
+  /* lo mismo para un vehículo: en el tablero o deprimido, ninguna esquina puede salirse de la baranda o muro (salvo en las rampas) */
   nivelV(st, x, y, V, piso) {
     if (!VC.PG) return [!piso(x, y), 0]; const pie = !!V.walk;
-    if (st.z > 0) {
+    if (st.z !== 0) {
       const P = VC.puenteEn(x, y, st.z, .1);
       if (P) { if (P.h > 1.2) { const c = Math.cos(st.h), s = Math.sin(st.h), l = V.len / 2, w = V.wid / 2; for (const [u, v] of [[l, w], [l, -w], [-l, w], [-l, -w]]) if (!VC.puenteEn(x + c * u - s * v, y + s * u + c * v, st.z, .45)) return [false, st.z]; } return [true, st.z]; }
@@ -367,9 +384,9 @@ const Libre = EM.modes.libre = {
     }
     // vehículos parqueados
-    for (const p of st.parked) { if (p.x < x0 - 20 || p.x > x1 + 20 || p.y < y0 - 20 || p.y > y1 + 20) continue; const V = VEH[p.kind]; if (p.kind === 'bici') { const q = S(p.x, p.y); g.save(); g.translate(q.x, q.y); g.rotate(p.a); g.fillStyle = PAL.negro; g.fillRect(-1.1 * k, -.5 * k, 2.2 * k, 1 * k); g.fillStyle = V.col; g.fillRect(-.9 * k, -.3 * k, 1.8 * k, .6 * k); g.restore(); } else Ciudad.car(g, p.x, p.y, p.a, V.len, V.wid, V.col, p.kind === 'alimentador' ? 'feeder' : p.kind === 'metroplus' ? 'brt' : p.kind === 'moto' ? 'moto' : 'car', S, k, sh, night, false); }
+    for (const p of st.parked) { if (p.x < x0 - 20 || p.x > x1 + 20 || p.y < y0 - 20 || p.y > y1 + 20) continue; const V = VEH[p.kind]; if (MICRO_V.has(p.kind)) { const q = S(p.x, p.y); g.save(); g.translate(q.x, q.y); g.rotate(p.a); Spr.veh(g, p.kind, Math.max(1.3, V.len) * k, Math.max(.65, V.wid) * k, V.col); g.restore(); } else Ciudad.car(g, p.x, p.y, p.a, V.len, V.wid, V.col, p.kind === 'alimentador' ? 'feeder' : p.kind === 'metroplus' ? 'brt' : p.kind === 'bus' ? 'bus' : p.kind === 'moto' ? 'moto' : p.kind === 'taxi' ? 'taxi' : p.kind === 'camioneta' ? 'camioneta' : 'car', S, k, sh, night, false); }
     Ciudad.transitDraw(g, S, k, sh, night, x0, y0, x1, y1, VC.on ? 'piso' : null);
     // a ras de piso: gente, carros y el jugador, en orden de pintura con los edificios que les quedan delante (así los tapan)
-    const dprL = W / Math.max(1, ($('#gcv') || { clientWidth: W }).clientWidth || W), kj = Math.max(k, 3.2 * dprL), yo = typeof Perfil !== 'undefined' ? Perfil.ped() : { col: '#1C5C9C', skin: SKIN[1] }, pz = st.z || 0, ob = VC.ob, SZ = h => h ? (x, y) => S(x, y - h * ob) : S, hz = pz && VC.PG ? ((VC.puenteEn(st.x, st.y, pz, .8) || { h: 0 }).h) : 0, Sj = SZ(hz);
-    const dibJug = () => { if (st.mode === 'veh') { const V = this.V(st); if (st.veh.kind === 'bici') { const q = Sj(st.x, st.y); g.save(); g.translate(q.x, q.y); g.rotate(st.h); g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(-1 * k + sh.dx * k, -.4 * k + sh.dy * k, 2 * k, .8 * k); g.fillStyle = PAL.negro; g.fillRect(-1.1 * k, -.45 * k, 2.2 * k, .9 * k); g.fillStyle = V.col; g.fillRect(-.9 * k, -.25 * k, 1.8 * k, .5 * k); g.restore(); Ciudad.ped(g, Object.assign({ x: st.x, y: st.y, a: st.h, ph: st.t * 8, seed: 7, stun: 0 }, yo), Sj, kj, sh); } else if (V.art) Ciudad.articulado(g, st.x, st.y, st.h, st.h2 == null ? st.h : st.h2, V, Sj, k, sh, night, true); else Ciudad.car(g, st.x, st.y, st.h, V.len, V.wid, V.col, st.veh.kind === 'alimentador' ? 'feeder' : st.veh.kind === 'moto' ? 'moto' : 'car', Sj, k, sh, night, true); } if (st.mode === 'walk') Ciudad.ped(g, Object.assign({ x: st.x, y: st.y, a: st.h, ph: st.t * (st.run ? 14 : 8) * (st.wv > .2 ? 1 : 0), seed: 7, stun: 0, umb: L.w.rain && !yo.gorro }, yo), Sj, kj, sh); };
+    const dprL = W / Math.max(1, ($('#gcv') || { clientWidth: W }).clientWidth || W), kj = Math.max(k, 3.2 * dprL), yo = typeof Perfil !== 'undefined' ? Perfil.ped() : { col: '#1C5C9C', skin: SKIN[1] }, pz = st.z || 0, ob = VC.ob, SZ = h => h ? (x, y) => S(x, y - h * ob) : S, hz = pz && VC.PG ? ((VC.puenteEn(st.x, st.y, pz, .8) || { h: 0 }).h) * (pz < 0 ? -1 : 1) : 0, Sj = SZ(hz);
+    const dibJug = () => { if (st.mode === 'veh') { const V = this.V(st), vk = st.veh.kind; if (MICRO_V.has(vk)) { const q = Sj(st.x, st.y); g.save(); g.translate(q.x, q.y); g.rotate(st.h); g.fillStyle = 'rgba(0,0,0,.28)'; g.fillRect(-.9 * k + sh.dx * k, -.36 * k + sh.dy * k, 1.8 * k, .72 * k); Spr.veh(g, vk, Math.max(1.3, V.len) * k, Math.max(.65, V.wid) * k, V.col); g.restore(); Ciudad.ped(g, Object.assign({ x: st.x, y: st.y, a: st.h, ph: st.t * 8 * (Math.abs(st.vf) > .3 ? 1 : 0), seed: 7, stun: 0 }, yo), Sj, kj, sh); } else if (V.art) Ciudad.articulado(g, st.x, st.y, st.h, st.h2 == null ? st.h : st.h2, V, Sj, k, sh, night, true); else Ciudad.car(g, st.x, st.y, st.h, V.len, V.wid, V.col, vk === 'alimentador' ? 'feeder' : vk === 'bus' ? 'bus' : vk === 'moto' ? 'moto' : vk === 'taxi' ? 'taxi' : vk === 'camioneta' ? 'camioneta' : 'car', Sj, k, sh, night, true); } if (st.mode === 'walk') Ciudad.ped(g, Object.assign({ x: st.x, y: st.y, a: st.h, ph: st.t * (st.run ? 14 : 8) * (st.wv > .2 ? 1 : 0), seed: 7, stun: 0, umb: L.w.rain && !yo.gorro }, yo), Sj, kj, sh); };
     if (st.mode !== 'ride') { const q = Sj(st.x, st.y), r = Math.max(10 * dprL, (st.mode === 'veh' ? this.V(st).len * .55 : 1.5) * k); g.fillStyle = 'rgba(255,160,30,.26)'; g.beginPath(); g.arc(q.x, q.y, r, 0, TAU); g.fill(); }   // disco naranja bajo los pies
     const altos = [], items = [];
@@ -377,5 +394,5 @@ const Libre = EM.modes.libre = {
     for (const p of Ciudad.peds) if (p.x > x0 - 5 && p.x < x1 + 5 && p.y > y0 - 5 && p.y < y1 + 5) items.push({ x: p.x, y: p.y, r: .5, a: 1.8, f: () => { Ciudad.ped(g, p, S, k, sh); if (p.client) { const q = S(p.x, p.y); g.fillStyle = PAL.mostaza; g.strokeStyle = PAL.negro; g.lineWidth = 1.5; g.beginPath(); g.arc(q.x, q.y - 12 * Math.max(.6, k * .4) - 6, 7, 0, TAU); g.fill(); g.stroke(); g.fillStyle = PAL.negro; g.font = '700 11px Cuerpo, sans-serif'; g.textAlign = 'center'; g.fillText('!', q.x, q.y - 12 * Math.max(.6, k * .4) - 2); g.textAlign = 'left'; } } });
     if (typeof Gente !== 'undefined') Gente.items(st, items, g, S, k, sh, x0, y0, x1, y1);
-    if (st.mode !== 'ride') { if (!pz) items.push({ x: st.x, y: st.y, r: st.mode === 'veh' ? this.V(st).len / 2 : .6, a: st.mode === 'veh' ? 1.6 : 1.8, f: dibJug }); else altos.push([pz, dibJug]); }
+    if (st.mode !== 'ride') { if (pz <= 0) items.push({ x: st.x, y: st.y, r: st.mode === 'veh' ? this.V(st).len / 2 : .6, a: st.mode === 'veh' ? 1.6 : 1.8, f: dibJug }); else altos.push([pz, dibJug]); }
     for (const it of items) it.y = it.y == null ? 0 : it.y;
     const delante = VC.on && VC.ocluir ? VC.ocluir(items) : [];
@@ -451,7 +468,7 @@ const Libre = EM.modes.libre = {
   },
   /* ---------- vistas 3D (1.4.0) ---------- */
-  alto3(st) {   // altura del jugador en 3D: el piso, el tablero del puente, la vía del metro o la línea del cable
+  alto3(st) {   // altura del jugador en 3D: el piso, el tablero del puente o deprimido, la vía del metro o la línea del cable
     let z = MAP.elevM(st.x, st.y); if (st.mode === 'ride') { const v = st.ride, l = v.line; if (l.kind === 'metro' || l.kind === 'tram') z = G3.zOn(l, v.s) + 1.2; else if (l.kind === 'cable') { const C = G3.cableGeo(l); z = C.zAt(NET.project(C.P, st.x, st.y).s) - 3.2; } }
-    else if (st.z && VC.PG) { const P = VC.puenteEn(st.x, st.y, st.z, .8); if (P) z += P.h; } return z;
+    else if (st.z && VC.PG) { const P = VC.puenteEn(st.x, st.y, st.z, .8); if (P) z += st.z < 0 ? -P.h : P.h; } return z;
   },
   _rgb: new Map(),
@@ -468,7 +485,7 @@ const Libre = EM.modes.libre = {
     const largo = st.mode === 'ride' ? (st.ride.line.kind === 'metro' ? 34 : st.ride.line.kind === 'cable' ? 12 : 26) : st.mode === 'veh' ? 8 + V.len * 1.1 : 9;
     let cam;
-    if (st.vista3 === 'cine') {   // una cámara en la calle, adelante y a un lado, que te ve pasar; se cambia cuando la dejas atrás
+    if (st.vista3 === 'cine') {   // una cámara en la calle, adelante y a un lado, que te ve pasar sin quedar dentro ni detrás de edificios
       const C0 = st._cine, ad = C0 ? (C0.x - st.x) * Math.cos(st.h) + (C0.y - st.y) * Math.sin(st.h) : -1;
-      if (!C0 || ad < -12 || dist(C0.x, C0.y, st.x, st.y) > 160 || st.t - C0.t > 14) { const sd = h2(st.t | 0, 3, 7) < .5 ? -1 : 1, fw = 26 + h2(st.t | 0, 4, 7) * 30, px0 = st.x + Math.cos(st.h) * fw - Math.sin(st.h) * sd * 9, py0 = st.y + Math.sin(st.h) * fw + Math.cos(st.h) * sd * 9, q = VC.on ? VC.despeja(px0, py0, 1, true, 30) : { x: px0, y: py0 }, px = q.x, py = q.y; st._cine = { x: px, y: py, z: Math.max(MAP.elevM(px, py), z - 4) + 4.2 + (st.mode === 'ride' ? 8 : 0), t: st.t }; }   // en la calle, a la altura de un poste
+      if (!C0 || ad < -12 || dist(C0.x, C0.y, st.x, st.y) > 160 || st.t - C0.t > 14) { const sd = h2(st.t | 0, 3, 7) < .5 ? -1 : 1, fw = 26 + h2(st.t | 0, 4, 7) * 30, px0 = st.x + Math.cos(st.h) * fw - Math.sin(st.h) * sd * 9, py0 = st.y + Math.sin(st.h) * fw + Math.cos(st.h) * sd * 9, z0 = Math.max(MAP.elevM(px0, py0), z - 4) + 4.2 + (st.mode === 'ride' ? 8 : 0), q = VC.on && VC.camaraLibre ? VC.camaraLibre(px0, py0, st.x, st.y, z0) : { x: px0, y: py0, z: z0 }; st._cine = { x: q.x, y: q.y, z: q.z, t: st.t }; }
       cam = { eye: [st._cine.x, st._cine.z, st._cine.y], at: [st.x, z + 1.2, st.y], fov: .9 / Math.sqrt(zu) };
     } else {
@@ -482,8 +499,8 @@ const Libre = EM.modes.libre = {
   dyn3D(G, st, zj) {
     const C = h => this.rgb3(h), E = (x, y) => MAP.elevM(x, y), cerca = (x, y, r) => Math.abs(x - st.x) < r && Math.abs(y - st.y) < r;
-    for (const k of Ciudad.cars) { if (!cerca(k.x, k.y, 240)) continue; const L = k.kind === 'bus' ? 12 : k.kind === 'moto' ? 2 : 4.4, Wd = k.kind === 'moto' ? .8 : k.kind === 'bus' ? 2.5 : 1.8, Hh = k.kind === 'bus' ? 3 : k.kind === 'moto' ? 1.5 : 1.45, zk = E(k.x, k.y) + (VC.PG ? VC.carAlto(k) : 0); G.box(k.x, zk + .3, k.y, k.a, L, Wd, Hh * .62, C(k.col)); G.box(k.x, zk + .3 + Hh * .62, k.y, k.a, L * .55, Wd * .92, Hh * .38, [.15, .22, .3]); }
+    for (const k of Ciudad.cars) { if (!cerca(k.x, k.y, 240)) continue; const L = k.kind === 'bus' ? 11.2 : k.kind === 'moto' ? 2 : 4.4, zk = E(k.x, k.y) + (VC.PG ? VC.carAlto(k) : 0); G3.vehicle(k.x, zk, k.y, k.a, L, k.kind, C(k.col)); }
     for (const p of Ciudad.peds) { if (!cerca(p.x, p.y, 90) || p.dog) continue; this.persona3(G, p.x, E(p.x, p.y), p.y, p.a || 0, p, 1, p.ph || 0); }
     if (typeof Gente !== 'undefined') for (const p of Gente.todos(st)) { if (!cerca(p.x, p.y, 130)) continue; this.persona3(G, p.x, E(p.x, p.y), p.y, p.a || 0, p.look, 1.05, p.v > .1 ? p.ph : 0); }
-    for (const p of st.parked) { if (!cerca(p.x, p.y, 160)) continue; const V = VEH[p.kind], zp = E(p.x, p.y); G.box(p.x, zp + .3, p.y, p.a, V.len, V.wid, p.kind === 'bici' ? .9 : 1, C(V.col)); if (p.kind !== 'bici' && p.kind !== 'moto') G.box(p.x, zp + 1.3, p.y, p.a, V.len * .55, V.wid * .92, .55, [.15, .22, .3]); }
+    for (const p of st.parked) { if (!cerca(p.x, p.y, 160)) continue; const V = VEH[p.kind], zp = E(p.x, p.y); G3.vehicle(p.x, zp, p.y, p.a, V.len, p.kind === 'alimentador' ? 'feeder' : p.kind === 'metroplus' ? 'brt' : p.kind, C(V.col)); }
     // el transporte de la ciudad en su sitio: trenes por vagones sobre su vía, articulados en dos cuerpos, cabinas en su cable
     for (const v of Ciudad.transit) { const p = Ciudad.tpos(v); if (!cerca(p.x, p.y, 700)) continue; const l = v.line, kind = l.kind, col = C(l.color);
@@ -495,6 +512,6 @@ const Libre = EM.modes.libre = {
       if (st.mode === 'walk') this.persona3(G, st.x, zj, st.y, st.h, Perfil.ped(), 1.08, st.wv > .2 ? st.t * (st.run ? 14 : 8) : 0);
       else if (V.art) { const Lf = V.len * .63, hx = st.x + Math.cos(st.h) * (V.len / 2 - Lf), hy = st.y + Math.sin(st.h) * (V.len / 2 - Lf), a2 = st.h2 == null ? st.h : st.h2; G3.vehicle(hx + Math.cos(st.h) * Lf / 2, zj, hy + Math.sin(st.h) * Lf / 2, st.h, Lf, 'brt', C(V.col)); G3.vehicle(hx - Math.cos(a2) * (.9 + (V.len - Lf - .9) / 2), zj, hy - Math.sin(a2) * (.9 + (V.len - Lf - .9) / 2), a2, V.len - Lf - .9, 'brt', C(V.col)); }
-      else if (st.veh.kind === 'bici') { G.box(st.x, zj + .35, st.y, st.h, 1.7, .12, .7, C(V.col)); this.persona3(G, st.x, zj + .55, st.y, st.h, Perfil.ped(), 1, 0); }
-      else { const Hh = st.veh.kind === 'moto' ? 1.3 : st.veh.kind === 'alimentador' ? 3 : 1.45; G.box(st.x, zj + .3, st.y, st.h, V.len, V.wid, Hh * .62, C(V.col)); G.box(st.x, zj + .3 + Hh * .62, st.y, st.h, V.len * .55, V.wid * .92, Hh * .38, [.15, .22, .3]); } }
+      else if (MICRO_V.has(st.veh.kind)) { G3.vehicle(st.x, zj, st.y, st.h, V.len, st.veh.kind, C(V.col)); this.persona3(G, st.x, zj + (st.veh.kind === 'bici' ? .55 : .22), st.y, st.h, Perfil.ped(), 1, st.veh.kind === 'patines' && Math.abs(st.vf) > .3 ? st.t * 10 : 0); }
+      else G3.vehicle(st.x, zj, st.y, st.h, V.len, st.veh.kind === 'alimentador' ? 'feeder' : st.veh.kind, C(V.col)); }
     const tope = zj + (st.mode === 'veh' ? 3.6 : st.mode === 'ride' ? 6 : 2.5) + Math.sin(st.t * 3) * .18; G.box(st.x, tope, st.y, st.t * 1.5, .38, .38, .38, [1, .55, .1], .78, .78);
     // el destino: un poste alto que se ve de lejos
```

### Cambios exactos en `src/js/37-trama.js`
```diff
diff --git a/src/js/37-trama.js b/src/js/37-trama.js
index 5028492..f1ac67a 100644
--- a/src/js/37-trama.js
+++ b/src/js/37-trama.js
@@ -12,4 +12,5 @@ const TRAMA_WHO = {
   'Wílmar': { col: '#f4f1ea', hat: '#1C5C9C', skin: '#8a5a3b' },
   'Agente de tránsito': { col: '#c7e000', hat: '#f4f1ea', skin: '#d9a77f' },
+  'Santi': { col: '#59AB42', hat: '#0e2d55', skin: '#d9a77f' },
   'Pasajero': { col: '#7a5cc4', skin: '#d9a77f' }
 };
@@ -79,4 +80,16 @@ const TRAMA = [
       ok: 'Una señora le dijo adiós desde un balcón con una ruana en la mano.' }
   ] },
+  { t: 'Ruedas que conectan el valle', steps: [
+    { k: 'ir', at: 'San Antonio', line: 'B', r: 38, txt: 'Regresa a San Antonio para tomar la Línea B hacia el occidente' },
+    { k: 'abordar', line: 'B', at: 'San Antonio', txt: 'Sube a la Línea B hacia San Javier' },
+    { k: 'bajar', line: 'B', at: 'Floresta', txt: 'Bájate en la estación Floresta' },
+    { k: 'hablar', who: 'Santi', at: 'Floresta', line: 'B', txt: 'Santi, anfitrión de EnCicla, te espera junto a los anclajes', lines: [
+      ['Santi', '¡Bienvenida a Floresta! Aquí donde termina el andén del metro empieza la ciclorruta: bicis de EnCicla, monopatines, tablas y patines.'],
+      ['Santi', 'Doña Luz, Don Jairo, Wilson, Cata, Maryi y yo cuidamos las bicis azules y verdes del valle. «Una sonrisa también se presta.»'],
+      ['Rosalba', 'Mija, el viaje no termina en el torniquete. Elija en qué quiere rodar por el corredor de San Juan y la 70.']] },
+    { k: 'modulo', who: 'Santi', at: 'Floresta', line: 'B', m: 'carrera', lv: 'cr:B-occidente', fin: 'San Antonio', finLine: 'A', txt: 'Recorre el bulevar de San Juan en Run Scooter (monopatín, bici o patines)', lines: [
+      ['Santi', 'Con ◀ ▶ cambias de carril, con ▲ saltas huecos y charcos, y con 🛴 eliges entre monopatín, eléctrico, bici EnCicla, skate o patines.']],
+      ok: 'Santi te saludó con el timbre desde la estación: “¡Tremendo ritmo! El metro y las ciclorrutas laten al mismo tiempo”.' }
+  ] },
   { t: 'La hora pico', steps: [
     { k: 'ir', at: 'San Antonio', line: 'A', r: 40, txt: 'Vuelve a la estación San Antonio: Don Efraín necesita ayuda' },
@@ -102,5 +115,5 @@ const TRAMA = [
   { t: 'Epílogo', steps: [
     { k: 'hablar', who: 'Rosalba', at: 'La Estrella', line: 'A', txt: 'Despídete de Rosalba en La Estrella', lines: [
-      ['Tú', 'Ahora la red es nuestra: los cables, los buses, el tranvía, los trenes y los que vienen.'],
+      ['Tú', 'Ahora la red es nuestra: los cables, los buses, el tranvía, las bicis, los trenes y los que vienen.'],
       ['Rosalba', 'La red no es de hierro, mija. Es de la gente que la cuida. Cultura Metro, ¿sí o qué?'],
       ['', 'FIN DE LA HISTORIA · La ciudad sigue abierta: oficios, postales y todas las líneas.']] }
@@ -109,5 +122,5 @@ const TRAMA = [
 /* preguntas de orientación (la primera opción es la correcta; el último dato es la estación de destino) */
 /* arte de cada capítulo (src/data/arte.js) y el cielo que va detrás de las ilustraciones con fondo transparente */
-const TRAMA_ART = ['esc_noche', 'esc_ladera_atardecer', 'esc_aguacero', 'esc_tango', 'iso_centro', 'esc_dia', 'carga', 'portada'];
+const TRAMA_ART = ['esc_noche', 'esc_ladera_atardecer', 'esc_aguacero', 'esc_tango', 'iso_centro', 'esc_dia', 'esc_dia', 'carga', 'portada'];
 TRAMA.forEach((c, i) => { c.art = TRAMA_ART[i]; });
 const TRAMA_SKY = { esc_noche: 'linear-gradient(#0b1630,#23365c 70%,#3a4d73)', esc_dia: 'linear-gradient(#7fb6df,#d6ecfb)', esc_ladera_atardecer: 'linear-gradient(#3d2e5f,#c97b78 55%,#f4d9a8)', iso_centro: 'linear-gradient(#f4ecd0,#d9cdae)' };
```

### Cambios exactos en `src/js/39-gente.js`
```diff
diff --git a/src/js/39-gente.js b/src/js/39-gente.js
index 7886817..3e6ff19 100644
--- a/src/js/39-gente.js
+++ b/src/js/39-gente.js
@@ -46,5 +46,23 @@ const GENTE = [
     f: [[0, 'El mango biche con sal y limón es de las frutas de la calle más queridas de Medellín.'], [1, 'En Medellín se habla de «parce» y «¿qué hubo pues?»; y el «pues» al final de la frase no significa nada: es cariño.'], [2, 'Los días de partido vendo todo antes del himno.']] },
   { id: 'arturo', n: 'Profe Arturo', o: 'divulgador del Planetario', en: ['hito', 'planetario'], look: { piel: 1, peinado: 2, colPelo: 5, camisa: 5, pantalon: 1, zapatos: 0, gorro: 0, colGorro: 0, accesorio: 0 },
-    f: [[0, 'El Planetario, el Parque Explora y el Jardín Botánico quedan juntos, en el norte: se pueden visitar en un mismo día.'], [1, 'Medellín está a unos 1.500 metros sobre el mar, en un valle angosto: por eso el clima es templado todo el año y le dicen la ciudad de la eterna primavera.'], [2, 'Mi pregunta favorita de los niños: «¿y las estrellas también se montan en el metro?»']] }
+    f: [[0, 'El Planetario, el Parque Explora y el Jardín Botánico quedan juntos, en el norte: se pueden visitar en un mismo día.'], [1, 'Medellín está a unos 1.500 metros sobre el mar, en un valle angosto: por eso el clima es templado todo el año y le dicen la ciudad de la eterna primavera.'], [2, 'Mi pregunta favorita de los niños: «¿y las estrellas también se montan en el metro?»']] },
+  { id: 'santi', n: 'Santi', o: 'anfitrión de EnCicla en Floresta', en: ['est', 'Floresta'], look: { piel: 2, peinado: 3, colPelo: 0, camisa: 2, pantalon: 0, zapatos: 1, gorro: 1, colGorro: 2, accesorio: 1 },
+    frag: 'Fragmento EnCicla 1/6 · Santi anota en su planilla a los viajeros que llegan en la Línea B y salen pedaleando por San Juan.',
+    f: [[0, 'EnCicla es el sistema de bicicletas públicas del Área Metropolitana: el préstamo es gratuito con la tarjeta Cívica.'], [1, 'En las estaciones manuales los anfitriones revisamos frenos, llantas y sillín antes de entregar cada bicicleta.'], [2, '«Una sonrisa también se presta.» Cuando alguien sale de la estación Floresta en bici, siento que el metro sigue rodando por el barrio.']] },
+  { id: 'donaluz', n: 'Doña Luz', o: 'usuaria fundadora de EnCicla (2011)', en: ['est', 'Estadio'], look: { piel: 1, peinado: 4, colPelo: 5, camisa: 6, pantalon: 3, zapatos: 0, gorro: 3, colGorro: 2, accesorio: 0 },
+    frag: 'Fragmento EnCicla 2/6 · Doña Luz recuerda el primer préstamo de 2011 entre Estadio y la UPB con seis estaciones y cien bicicletas.',
+    f: [[0, 'EnCicla nació en octubre de 2011 como un proyecto entre el Área Metropolitana y la Universidad EAFIT.'], [1, 'Empezó con apenas seis estaciones y cien bicicletas entre Estadio y la UPB; hoy conecta más de cien puntos en el valle.'], [2, '«Del afán no queda sino el cansancio.» Yo combino la Línea B con la ciclorruta de la 70 todos los días desde hace más de diez años.']] },
+  { id: 'jairo', n: 'Don Jairo', o: 'mecánico de taller de EnCicla', en: ['est', 'Universidad'], look: { piel: 3, peinado: 2, colPelo: 1, camisa: 3, pantalon: 1, zapatos: 0, gorro: 1, colGorro: 1, accesorio: 1 },
+    frag: 'Fragmento EnCicla 3/6 · Don Jairo conoce por el sonido de los radios qué bicicleta bajó desde Robledo o cruzó el río por Barranquilla.',
+    f: [[0, 'Las bicicletas de EnCicla tienen marco reforzado, luces alimentadas por dínamo en la rueda y canasta delantera.'], [1, 'Sus tornillos y piezas usan medidas especiales de seguridad para que solo puedan desarmarse con las llaves del taller oficial.'], [2, '«Toda bici avisa lo que le duele.» Con solo oír la cadena al llegar a Universidad ya sé si viene desde el centro o desde Carlos E. Restrepo.']] },
+  { id: 'wilson', n: 'Wilson', o: 'conductor de balanceo de EnCicla', en: ['est', 'Caribe'], look: { piel: 2, peinado: 0, colPelo: 0, camisa: 4, pantalon: 3, zapatos: 0, gorro: 1, colGorro: 2, accesorio: 0 },
+    frag: 'Fragmento EnCicla 4/6 · Wilson redistribuye las bicicletas al amanecer para que quien baje del Metro siempre encuentre un anclaje listo.',
+    f: [[0, 'En la mañana todo el mundo baja hacia el río y las universidades; por la tarde las bicis regresan a las estaciones del Metro.'], [1, 'Los camiones de balanceo mueven decenas de bicicletas cada hora para que ninguna estación se quede vacía ni sin anclajes libres.'], [2, '«Por las vías, nunca por la ciclorruta.» Aquí en Caribe nos cruzamos los trenes, los buses del Norte, la Línea O y los camiones de EnCicla.']] },
+  { id: 'cata', n: 'Cata', o: 'sala de control de EnCicla', en: ['est', 'Suramericana'], look: { piel: 1, peinado: 1, colPelo: 2, camisa: 3, pantalon: 0, zapatos: 2, gorro: 0, colGorro: 0, accesorio: 1 },
+    frag: 'Fragmento EnCicla 5/6 · Desde las pantallas de control, Cata ve latir al mismo ritmo los trenes de la Línea A y las ciclorrutas del valle.',
+    f: [[0, 'Los tótems automáticos de EnCicla leen la tarjeta Cívica y liberan el anclaje eléctrico en segundos.'], [1, 'Desde la sala de control monitoreamos en tiempo real cuántas bicicletas y cuántos anclajes libres tiene cada estación del valle.'], [2, '«El mapa habla.» Cuando llega un tren lleno a Suramericana o Industriales, a los dos minutos se mueve la ola verde en nuestro mapa.']] },
+  { id: 'maryi', n: 'Maryi', o: 'promotora de movilidad activa', en: ['est', 'Miraflores'], look: { piel: 3, peinado: 5, colPelo: 0, camisa: 2, pantalon: 5, zapatos: 1, gorro: 3, colGorro: 2, accesorio: 0 },
+    frag: 'Fragmento EnCicla 6/6 · Maryi enseña que el viaje intermodal —cable, tranvía, metro y pedal— es la columna vertebral del Valle de Aburrá.',
+    f: [[0, 'En el Valle de Aburrá conviven peatones, bicicletas, monopatines, patines, buses, tranvía, cables y metro.'], [1, 'En las ciclorrutas la prioridad es siempre del peatón en los cruces, y los monopatines eléctricos deben moderar su velocidad junto a las estaciones.'], [2, '«Un cuerpo que se mueve trabaja mejor.» Bajar del Metrocable M en Miraflores, tomar el tranvía y seguir rodando es mi rutina favorita.']] }
 ];
 /* lo que se dice de cada lugar en la guía (📍): una línea corta, sin cifras dudosas */
@@ -110,7 +128,8 @@ const Gente = EM.gente = {
     if (st.trama && st.trama.talk) return; const G = p.G, vis = Save.d.gente || (Save.d.gente = {});
     if (p.tur) { const T = st.tur; if (!T) return; if (T.ok) { Ciudad.say(p, 'Vamos a ' + T.D.n); return; } this.charla(st, p, [`¡Hola! Soy ${G.n}, ${G.o.replace('turista ', '')}. Me dijeron que no me puedo ir sin conocer ${T.D.n}. ¿Me acompañas?`], [['Claro, sígueme', () => { T.ok = true; st.guia = { x: T.D.cx, y: T.D.cy, title: 'Acompaña a ' + G.n + ' a ' + T.D.n, hint: LUGAR_INFO[T.D.id] || '' }; this.cerrar(st); Libre.msg(st, '🧳 ' + G.n + ' te sigue: llévala caminando', 'b'); }], ['Ahora no', () => { this.cerrar(st); }]]); return; }
-    const nuevo = !vis[G.id]; if (nuevo) { vis[G.id] = 1; Save.d.wallet += 2; Save.write(); }
+    const nuevo = !vis[G.id]; if (nuevo) { vis[G.id] = 1; Save.d.wallet += 2; if (G.frag) { const fe = Save.d.fragsEncicla || (Save.d.fragsEncicla = {}); fe[G.id] = 1; } Save.write(); }
     const L = G.f.map(([t, x]) => (t === 1 ? '💡 Lo que pocos saben: ' : t === 0 ? '📌 Lo que todos saben: ' : '') + x);
-    this.charla(st, p, L, null, nuevo ? '+2 🎫 por conocer a ' + G.n + ' · ' + Object.keys(vis).length + ' de ' + GENTE.length + ' personajes' : '');
+    if (G.frag) L.push('🚲 ' + G.frag);
+    this.charla(st, p, L, null, nuevo ? '+2 🎫 por conocer a ' + G.n + ' · ' + Object.keys(vis).length + ' de ' + GENTE.length + ' personajes' + (G.frag ? ' · Fragmento EnCicla desbloqueado' : '') : '');
   },
   charla(st, p, lines, opts, pie) {
```

### Cambios exactos en `src/js/65-menu.js`
```diff
diff --git a/src/js/65-menu.js b/src/js/65-menu.js
index 9a16935..690eb87 100644
--- a/src/js/65-menu.js
+++ b/src/js/65-menu.js
@@ -3,5 +3,6 @@
    ===================================================================== */
 const MODECARDS = [
-  { id: 'libre', cls: 'c-libre', t: 'Ciudad Libre', d: 'Recorre el Valle de Aburrá real: a pie, en taxi, bici o moto, o de pasajero en el metro, el tranvía, los cables y los buses. Oficios por la radio.' },
+  { id: 'libre', cls: 'c-libre', t: 'Ciudad Libre', d: 'Recorre el Valle de Aburrá real: a pie, en bici, monopatín, skate, patines, carro, taxi, moto o bus, o de pasajero en el metro, tranvía y cables.' },
+  { id: 'carrera', cls: 'c-alim', t: 'Run Scooter', d: 'Carrera 3D por los corredores del valle: elige monopatín, eléctrico, bici EnCicla, skate o patines en 1ª o 3ª persona.' },
   { id: 'bus', cls: 'c-volante', t: 'Metroplús y alimentadores', d: 'Simulador de bus en vista cenital: de estación a estación por las calles reales, con pasajeros, semáforos y tráfico.' },
   { id: 'conduce', cls: 'c-conduce', t: 'Metro', d: 'Conduce el metro y el tranvía: vista panorámica 2D del valle y cabina en primera persona con su consola.' },
@@ -11,5 +12,5 @@ const MODECARDS = [
   { id: 'red', cls: 'c-red', t: 'La Red', d: 'Panorámica del valle: líneas, datos curiosos y tu flota.' },
   { id: 'multi', cls: 'c-multi', t: 'Juntos', d: 'Duelo en el mismo celular, Wi‑Fi sin internet o servidor local.' },
-  { id: 'arcade', cls: 'c-despacho', t: 'Arcade', d: 'Retos rápidos: agujas del Puesto de Control, semáforos, reparto de buses, armar el cable y bus en 3D.' }
+  { id: 'arcade', cls: 'c-despacho', t: 'Arcade', d: 'Retos rápidos: agujas del Puesto de Control, semáforos, reparto de buses, armar el cable, Run Scooter y bus en 3D.' }
 ];
 const Menu = EM.menu = {
@@ -59,5 +60,5 @@ const Menu = EM.menu = {
   },
   arcade() {
-    UI.modal(`<div class="pag">Extras</div><h2>Arcade</h2><p class="m">Retos cortos para jugar en familia o en duelo de mesa.</p><div class="col">${[['despacho', 'Despacho · agujas del Puesto de Control'], ['metroplus', 'Semáforos · cruces de Metroplús'], ['alim', 'Reparto · buses por colores'], ['cable', 'Arma el cable · puzle'], ['volante', 'Al volante 3D · buses en primera persona']].map(([m, n]) => `<button class="btn sm" data-a="${m}">${n}</button>`).join('')}</div><button class="btn sm gh" id="arX" style="margin-top:10px">Cerrar</button>`);
+    UI.modal(`<div class="pag">Extras</div><h2>Arcade</h2><p class="m">Retos cortos para jugar en familia o en duelo de mesa.</p><div class="col">${[['carrera', 'Run Scooter · carrera 3D en monopatín, bici o patines'], ['despacho', 'Despacho · agujas del Puesto de Control'], ['metroplus', 'Semáforos · cruces de Metroplús'], ['alim', 'Reparto · buses por colores'], ['cable', 'Arma el cable · puzle'], ['volante', 'Al volante 3D · buses en primera persona']].map(([m, n]) => `<button class="btn sm" data-a="${m}">${n}</button>`).join('')}</div><button class="btn sm gh" id="arX" style="margin-top:10px">Cerrar</button>`);
     $$('#mBody [data-a]').forEach(b => b.onclick = () => { UI.close(); this.levels(b.dataset.a); }); $('#arX').onclick = () => UI.close();
   },
@@ -65,4 +66,5 @@ const Menu = EM.menu = {
     g.imageSmoothingEnabled = false; g.clearRect(0, 0, 70, 55);
     if (id === 'conduce') { Art.vehicleBack(g, 35, 52, 34, '#1C5C9C', 'metro', true); }
+    else if (id === 'carrera') { g.fillStyle = '#3f444d'; g.fillRect(0, 22, 70, 22); g.fillStyle = '#2f9b57'; g.fillRect(0, 20, 70, 3); g.fillRect(0, 44, 70, 3); g.save(); g.translate(22, 33); Spr.veh(g, 'monopatin', 22, 11, '#66bb6a'); g.restore(); g.save(); g.translate(50, 33); Spr.veh(g, 'skate', 18, 9, '#ff7043'); g.restore(); }
     else if (id === 'volante' || id === 'bus') { g.fillStyle = '#3f444d'; g.fillRect(0, 20, 70, 18); g.fillStyle = PAL.mante; for (let x = 2; x < 70; x += 10) g.fillRect(x, 28, 5, 1.5); g.save(); g.translate(36, 29); Spr.veh(g, 'brt', 46, 9, '#0E6F76', { doors: 'left', lights: true }); g.restore(); }
     else if (id === 'guia') { g.fillStyle = PAL.negro; g.fillRect(14, 10, 42, 28); g.fillStyle = '#59AB42'; g.fillRect(16, 12, 38, 24); g.fillStyle = '#fff'; g.fillRect(20, 16, 14, 6); g.fillStyle = PAL.mante; g.fillRect(20, 26, 30, 3); g.fillRect(20, 31, 20, 2); }
```

### Cambios exactos en `src/js/70-historia.js`
```diff
diff --git a/src/js/70-historia.js b/src/js/70-historia.js
index 817bd55..d63596a 100644
--- a/src/js/70-historia.js
+++ b/src/js/70-historia.js
@@ -45,4 +45,9 @@ const CAPS = [
     ['Rosalba', 'Aquí hay semáforos y gente cruzando. Despacio y con cariño.']
   ], go: ['conduce', 'T:0-2'], fin: 'Una señora le dijo adiós desde un balcón con una ruana en la mano.' },
+  { t: 'Ruedas que conectan el valle', scene: 'metroplus', lines: [
+    ['Rosalba', 'Cuando uno se baja del tren, el viaje sigue: en bicicleta de EnCicla, en monopatín o en patines por las ciclorrutas del valle.'],
+    ['Santi (anfitrión EnCicla)', 'Una sonrisa también se presta. Con la misma Cívica sacas la bici en Floresta o Estadio y ruedas por San Juan.'],
+    ['Rosalba', 'Elija en qué quiere rodar, mija: esquive los huecos, salte los charcos y recoja los datos del valle.']
+  ], go: ['carrera', 'cr:B-occidente'], fin: 'Santi chocó esos cinco en el anclaje: “¡Tremendo ritmo por la ciclorruta de San Juan!”.' },
   { t: 'La hora pico', scene: 'control', lines: [
     ['Don Efraín', 'Llegó la hora pico. Las cinco y media de la tarde, cuando todo el valle quiere volver a casa.'],
```

### Cambios exactos en `src/js/90-bot.js`
```diff
diff --git a/src/js/90-bot.js b/src/js/90-bot.js
index 4375ca0..7ff8ca1 100644
--- a/src/js/90-bot.js
+++ b/src/js/90-bot.js
@@ -78,5 +78,5 @@ const BotT = EM.test = {
       } } catch (e) { E('ciudad: ' + e.message); }
     // ciudad vectorial (1.1.0): calles con curva, edificios fuera de las vías, andenes sobre su línea, giros suaves y buses sobre el asfalto
-    let nVias = 0, nEd = 0; try {
+    let nVias = 0, nEd = 0, nCr = 0; try {
       if (typeof VIAS !== 'undefined') {
         if (!VC.on || VC.ch.length < 20000) E('ciudad vectorial: no cargó las vías (' + VC.ch.length + ')'); nVias = VC.ch.length;
@@ -116,11 +116,23 @@ const BotT = EM.test = {
           if (na > 200 && ba / na > .03) E('estaciones del metro: ' + (ba / na * 100).toFixed(1) + ' % de la calle que pasa por debajo quedó tapada'); else if (na > 200 && ba / na > .01) Wn('estaciones del metro: ' + (ba / na * 100).toFixed(1) + ' % de la calle de abajo tocada por un acceso');
         }
-        // manejo (1.3.0): a ninguna velocidad el giro pasa de la aceleración lateral que aguanta cada vehículo; el ritmo elige ×1, ×1,5 y ×2
+        // manejo (1.3.0) y 6 vehículos nuevos (M5): a ninguna velocidad el giro pasa de la aceleración lateral que aguanta cada vehículo; el ritmo elige ×1, ×1,5 y ×2
+        for (const kd of ['bici', 'scooter', 'monopatin', 'skate', 'patines', 'moto', 'taxi', 'carro', 'bus']) if (!VEH[kd]) E('vehículos: falta ' + kd + ' en Ciudad Libre');
         for (const kd in VEH) { const V = VEH[kd]; for (const v of [6, 12, 20, V.vmax]) { const a = v * v / V.wb * Math.tan(Libre.giroMax(V, v, false)); if (a > (V.lat || 8) * 1.02 + .01) E('manejo: ' + V.n + ' gira con ' + a.toFixed(1) + ' m/s² a ' + Math.round(v * 3.6) + ' km/h (tope ' + V.lat + ')'); } }
         { const s0 = Save.d.settings.ritmo; const E3 = [0, 1, 2].map(r => { Save.d.settings.ritmo = r; return [Libre.escala({ mode: 'walk' }), Libre.escala({ mode: 'ride' })]; }); Save.d.settings.ritmo = s0; if (E3[0][0] !== 1 || E3[2][0] !== 2 || E3[2][1] !== 6) E('ritmo: escalas ' + JSON.stringify(E3)); }
+        // deprimidos / pasos a desnivel z = -1 (M2)
+        if (VC.PU && VC.PU.filter(p => p.z === -1 && p.is_tunnel).length < 5) E('deprimidos: faltan pasos a desnivel z = -1');
+        // modo Run Scooter / Carrera por el Valle (M4)
+        if (!EM.modes.carrera) E('carrera: falta el modo Run Scooter (34-carrera.js)'); else {
+          for (const lv of Carrera.levels()) { try { const st = Carrera.create(lv.id, { seed: 1, auto: true }); nCr++; if (!st.line || !st.obs || !st.obs.length || !isFinite(st.v)) E('carrera inválida ' + lv.id); } catch (e) { E('carrera ' + lv.id + ': ' + e.message); } }
+          if ((Carrera.VEHS || []).length < 5) E('carrera: faltan vehículos elegibles');
+        }
         // buses (1.3.0): las esquinas de cada recorrido tienen radio de giro (ningún quiebre de más de 25° en menos de 2 m)
         { let peor = 0, cual = ''; for (const l of NET.lines) { if (l.kind !== 'feeder' && l.kind !== 'brt') continue; const P = l.P.pts; for (let i = 2; i < P.length; i++) { const L1 = dist(P[i - 1].x, P[i - 1].y, P[i - 2].x, P[i - 2].y), L2 = dist(P[i].x, P[i].y, P[i - 1].x, P[i - 1].y); if (L1 < .3 || L2 < .3) continue; let d = Math.abs(Math.atan2(P[i].y - P[i - 1].y, P[i].x - P[i - 1].x) - Math.atan2(P[i - 1].y - P[i - 2].y, P[i - 1].x - P[i - 2].x)); if (d > Math.PI) d = TAU - d; if (d > .44 && Math.min(L1, L2) < 2 && d > peor) { peor = d; cual = l.id; } } } if (peor) Wn('buses: ' + cual + ' gira ' + Math.round(peor * 57.3) + '° en una esquina sin curva'); }
-        // gente de la ciudad (1.3.0): cada personaje tiene dónde estar, cara y qué contar
-        if (typeof GENTE !== 'undefined') { if (GENTE.length < 18) E('gente: solo ' + GENTE.length + ' personajes'); for (const G of GENTE) { const [t, a] = G.en; if (t === 'hito' && !VC.HT.some(h => h.id === a)) E('gente: ' + G.n + ' no tiene su lugar (' + a + ')'); if (t === 'est' && !NET.stations.some(s => s.name === a)) E('gente: ' + G.n + ' no tiene su estación (' + a + ')'); if (!G.f.some(f => f[0] === 1)) Wn('gente: ' + G.n + ' no cuenta nada poco conocido'); } }
+        // gente de la ciudad (1.3.0) + 6 personajes de EnCicla (M6): cada personaje tiene dónde estar, cara y qué contar
+        if (typeof GENTE !== 'undefined') {
+          if (GENTE.length < 24) E('gente: solo ' + GENTE.length + ' personajes (deben ser 24 con EnCicla)');
+          for (const id of ['santi', 'donaluz', 'jairo', 'wilson', 'cata', 'maryi']) { const g = GENTE.find(q => q.id === id); if (!g || !g.frag) E('gente EnCicla: falta ' + id + ' o su fragmento compartido'); }
+          for (const G of GENTE) { const [t, a] = G.en; if (t === 'hito' && !VC.HT.some(h => h.id === a)) E('gente: ' + G.n + ' no tiene su lugar (' + a + ')'); if (t === 'est' && !NET.stations.some(s => s.name === a)) E('gente: ' + G.n + ' no tiene su estación (' + a + ')'); if (!G.f.some(f => f[0] === 1)) Wn('gente: ' + G.n + ' no cuenta nada poco conocido'); }
+        }
         if (typeof Perfil !== 'undefined') { const q = Perfil.ped(); if (!/^#[0-9a-f]{6}$/i.test(q.skin) || !/^#[0-9a-f]{6}$/i.test(q.col)) E('tu personaje: colores inválidos'); }
         if (typeof CamUI === 'undefined') E('cámara: falta la de las otras vistas');
@@ -152,30 +164,36 @@ const BotT = EM.test = {
       }
     } catch (e) { E('ciudad vectorial: ' + e.message); }
-    const stats = `${NET.lines.length} líneas · ${NET.stations.length} estaciones · ${nC} tramos de metro · ${nB} rutas de bus · ${nV} recorridos 3D · ${nR} tableros de agujas · ${nK} puzles de cable · ${nT} capítulos en la ciudad · ${nA} piezas de arte · ${nPo} postales · ${nBa} barrios · ${nCa} calles con nombre · ${nVias} vías con curva · ${VC.PU ? VC.PU.length : 0} puentes · ${nEd} casas y edificios reales · ${VC.HT.length} piezas de arquitectura · ${LINE_META.trivia.length} preguntas · ${Object.keys(LINE_META.stationFacts).length} datos · ${Math.round(performance.now() - t0)} ms`;
+    const stats = `${NET.lines.length} líneas · ${NET.stations.length} estaciones · ${nC} tramos de metro · ${nB} rutas de bus · ${nV} recorridos 3D · ${nCr} carreras por el valle · ${nR} tableros de agujas · ${nK} puzles de cable · ${nT} capítulos en la ciudad · ${nA} piezas de arte · ${nPo} postales · ${nBa} barrios · ${nCa} calles con nombre · ${nVias} vías con curva · ${VC.PU ? VC.PU.length : 0} puentes y deprimidos · ${nEd} casas y edificios reales · ${VC.HT.length} piezas de arquitectura · ${LINE_META.trivia.length} preguntas · ${Object.keys(LINE_META.stationFacts).length} datos · ${Math.round(performance.now() - t0)} ms`;
     return { errors, warnings, stats };
   },
   monkey(n = 20, seed = 7) {
-    const rng = new RNG(seed), errors = [], modes = ['conduce', 'bus', 'libre', 'cableviaje', 'conduce', 'bus', 'despacho', 'alim', 'metroplus', 'cable', 'volante'], cv = typeof document !== 'undefined' ? mkCanvas(360, 640) : null, g = cv ? cv.getContext('2d') : null;
+    const h0 = EM.headless; EM.headless = true; if (typeof Game !== 'undefined' && Game.freeze) Game.freeze(true);
+    const rng = new RNG(seed), errors = [], modes = ['conduce', 'bus', 'libre', 'carrera', 'cableviaje', 'conduce', 'bus', 'despacho', 'alim', 'metroplus', 'cable', 'volante'], cv = typeof document !== 'undefined' ? mkCanvas(360, 640) : null, g = cv ? cv.getContext('2d') : null;
     let games = 0, steps = 0, wins = 0;
-    for (let k = 0; k < n; k++) {
-      const id = modes[k % modes.length], M = EM.modes[id], lvs = M.levels().filter(l => !l.full); const lv = rng.pick(lvs);
-      let st; try { st = M.create(lv.id, { seed: rng.i(1, 1e6), auto: true }); } catch (e) { errors.push(id + ' crear ' + lv.id + ': ' + e.message); continue; }
-      games++; const dt = id === 'conduce' ? .1 : 1 / 20, max = id === 'conduce' ? 7000 : id === 'volante' ? 9000 : id === 'bus' ? 9000 : id === 'cableviaje' ? 6000 : id === 'libre' ? 2400 : 4800;
-      try {
-        for (let i = 0; i < max; i++) {
-          M.step(st, dt); steps++;
-          if (id === 'libre') { if (i % 25 === 0) st.joy = { x: rng.f() * 2 - 1, y: rng.f() * 2 - 1, m: rng.f() }; if (i % 90 === 0) { st.keys.up = rng.f() < .7; st.hb = rng.f() < .2; M.action(st); } if (i % 300 === 0) { M.offer(st); M.photo(st); } if (!isFinite(st.x) || !isFinite(st.vf)) throw new Error('jugador inválido'); }
-          else if (id === 'bus') { if (!isFinite(st.x) || !isFinite(st.vf)) throw new Error('bus inválido'); }
-          else if (id === 'volante' || id === 'cableviaje') { if (id === 'cableviaje' && i % 200 === 0) M.photo(st); if (id === 'volante' && (!isFinite(st.x) || !isFinite(st.v))) throw new Error('bus inválido'); }
-          else if (id !== 'conduce') { if (i % 5 === 0) { const a = M.ai(st); if (a) M.act(st, a); } if (rng.f() < .01) { const a = this.randomAct(id, st, rng); if (a) M.act(st, a); } }
-          else if (st.ph === 'dwell' && st.trivia) M.answer(st, 0);
-          if (i % 400 === 0 && g) { g.setTransform(1, 0, 0, 1, 0, 0); if (id === 'conduce') st.view = ['cab', 'tps', 'lado', 'top', 'pan'][(i / 400) % 5 | 0]; if (id === 'volante') st.view = ['top', 'pan'][(i / 400) % 2 | 0]; if (id === 'cableviaje') st.view = ['lado', 'top'][(i / 400) % 2 | 0]; if (id === 'libre' || id === 'bus') st.far = (i / 400) % 2 === 1; M.draw(g, st, { x: 0, y: 0, w: 360, h: 640 }); }
-          const r = M.result(st); if (!isFinite(r.score)) throw new Error('puntaje no numérico');
-          if (id === 'conduce' && (!isFinite(st.v) || !isFinite(st.s) || st.v < 0)) throw new Error('física inválida v=' + st.v + ' s=' + st.s);
-          if (st.ents && st.ents.length > 300) throw new Error('demasiados vehículos');
-          if (st.veh && st.veh.length > 400) throw new Error('demasiados carros');
-          if (r.done) { if (r.win) wins++; break; }
-        }
-      } catch (e) { errors.push(id + ' ' + lv.id + ': ' + e.message); }
+    try {
+      for (let k = 0; k < n; k++) {
+        const id = modes[k % modes.length], M = EM.modes[id], lvs = M.levels().filter(l => !l.full); const lv = rng.pick(lvs);
+        let st; try { st = M.create(lv.id, { seed: rng.i(1, 1e6), auto: true }); } catch (e) { errors.push(id + ' crear ' + lv.id + ': ' + e.message); continue; }
+        games++; const dt = id === 'conduce' ? .1 : 1 / 20, max = id === 'conduce' ? 7000 : id === 'volante' ? 9000 : id === 'bus' ? 9000 : id === 'cableviaje' ? 6000 : id === 'libre' ? 2400 : id === 'carrera' ? 3200 : 4800;
+        try {
+          for (let i = 0; i < max; i++) {
+            M.step(st, dt); steps++;
+            if (id === 'libre') { if (i % 25 === 0) st.joy = { x: rng.f() * 2 - 1, y: rng.f() * 2 - 1, m: rng.f() }; if (i % 90 === 0) { st.keys.up = rng.f() < .7; st.hb = rng.f() < .2; M.action(st); } if (i % 300 === 0) { M.offer(st); M.photo(st); } if (!isFinite(st.x) || !isFinite(st.vf)) throw new Error('jugador inválido'); }
+            else if (id === 'carrera') { if (i % 3 === 0) M.ai(st); if (!isFinite(st.s) || !isFinite(st.v)) throw new Error('carrera inválida'); }
+            else if (id === 'bus') { if (!isFinite(st.x) || !isFinite(st.vf)) throw new Error('bus inválido'); }
+            else if (id === 'volante' || id === 'cableviaje') { if (id === 'cableviaje' && i % 200 === 0) M.photo(st); if (id === 'volante' && (!isFinite(st.x) || !isFinite(st.v))) throw new Error('bus inválido'); }
+            else if (id !== 'conduce') { if (i % 5 === 0) { const a = M.ai(st); if (a && M.act) M.act(st, a); } if (rng.f() < .01) { const a = this.randomAct(id, st, rng); if (a && M.act) M.act(st, a); } }
+            else if (st.ph === 'dwell' && st.trivia) M.answer(st, 0);
+            if (i % 1200 === 0 && g) { g.setTransform(1, 0, 0, 1, 0, 0); if (id === 'conduce') st.view = ['cab', 'tps', 'lado', 'top', 'pan'][(i / 1200) % 5 | 0]; if (id === 'volante') st.view = ['top', 'pan'][(i / 1200) % 2 | 0]; if (id === 'cableviaje') st.view = ['lado', 'top'][(i / 1200) % 2 | 0]; if (id === 'carrera') st.view = ['1p', '3p', '2d'][(i / 1200) % 3 | 0]; if (id === 'libre' || id === 'bus') st.far = (i / 1200) % 2 === 1; M.draw(g, st, { x: 0, y: 0, w: 360, h: 640 }); }
+            const r = M.result(st); if (!isFinite(r.score)) throw new Error('puntaje no numérico');
+            if (id === 'conduce' && (!isFinite(st.v) || !isFinite(st.s) || st.v < 0)) throw new Error('física inválida v=' + st.v + ' s=' + st.s);
+            if (st.ents && st.ents.length > 300) throw new Error('demasiados vehículos');
+            if (st.veh && st.veh.length > 400) throw new Error('demasiados carros');
+            if (r.done) { if (r.win) wins++; break; }
+          }
+        } catch (e) { errors.push(id + ' ' + lv.id + ': ' + e.message); }
+      }
+    } finally {
+      EM.headless = h0; if (typeof Game !== 'undefined' && Game.freeze) Game.freeze(false);
     }
     return { games, steps, wins, errors };
```

