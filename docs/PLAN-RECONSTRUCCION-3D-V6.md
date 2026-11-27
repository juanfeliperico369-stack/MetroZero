# Plan de Reconstrucción 3D v6 · El Metro («Efecto GTA · Sistema Integrado en Relieve Real»)

> **Plan maestro del ecosistema y bases de código ya iniciadas:** [`motorcity/docs/PLAN-RECONSTRUCCION-3D-V6.md`](https://github.com/juanfeliperico369-stack/motorcity/blob/main/docs/PLAN-RECONSTRUCCION-3D-V6.md) y [`motorcity/motor-v6/`](https://github.com/juanfeliperico369-stack/motorcity/tree/main/motor-v6).
> **Auditoría base que origina este plan:** [`docs/AUDITORIA-CRITICA-2026-11-27.md`](./AUDITORIA-CRITICA-2026-11-27.md).

---

## 1. Por qué El Metro se reconstruye sobre Motor 3D v6

La auditoría forense destapó fallas estructurales que los parches `96*` y `97*` ya no pueden sostener:
- **82 módulos concatenados** donde un comentario `//` rompió la pausa por completo (`25-game.js:28`), dejó el caminar a pie medio comentado (`36-libre.js:210`) y rompió el modo cooperativo (`80-multi.js:109`).
- **276,5 MB de memoria JS** al entrar a Ciudad Libre, textura gigante de suelo `2048 × 2048` pintada en 2D que provoca congelones de ~440 ms, y un **tramado ajedrezado** que tapa el centro de la pantalla en San Antonio.
- El pellizco táctil bloqueado (`3.2 < 3.6`), 13 de 17 botones por debajo del mínimo táctil de `44 px`, `50 MB` muertos en `motor-city/` y **16 PNGs faltantes** en `96i-arte-36.js`.

Con **Motor 3D v6**, El Metro conserva su **corazón valioso** (sus datos reales de OSM, Catastro, SRTM y la red completa Metro/Metrocable/Tranvía/Metroplús — de donde de hecho ya se extrajo el catálogo de **12 Zonas Hero** de `motor-v6`), pero desecha la capa rota de parches y corre sobre el motor 3D unificado.

---

## 2. Cómo transforma Motor 3D v6 a El Metro

| Problema actual en `MetroZero` | Solución estructural en Motor 3D v6 |
|---|---|
| **Suelo plano pintado (`2048²`) + tramado ajedrezado** | Topografía 3D real (`terreno.js`) con materiales PBR reales de Medellín (`114 KB` en 9 WebPs). Edificios entre la cámara y el jugador se **desvanecen suavemente por alfa por edificio** (`camara.js`), jamás con cuadrícula ajedrezada. |
| **Cámara rígida / pellizco trabado** | Cámara cenital única inteligente (`72° → 34°`) con **auto-seguimiento gradual** hacia donde camina el pasajero o avanza el tren, control relativo a la cámara, *spring-arm* contra viaductos y laderas, y pellizco continuo 100 % operativo. |
| **Escala incoherente entre trenes, viaducto y personas** | Biblia SI estricta (`1 u = 1 m`): pasajero **1,72 m**, coche del Metro **23,0 × 3,20 × 3,85 m** (tren de 3 coches = 70 m), viaducto elevado a **+6,80 m libres** reales, Metroplús **18,0 m**, bus alimentador **10,8 m**. |
| **Peso desbordado (276 MB heap)** | **Arquitectura «Efecto GTA»:** las **12 Zonas Hero** (incluidos San Antonio, Parque Berrío, Alpujarra/Cisneros, Universidad/Explora, Estadio, Ayacucho, Comuna 13 y Santo Domingo con **190 m de desnivel real y 47,3 % de pendiente**) se cargan por paquete pequeño (~17–45 KB c/u); el resto del Valle de Aburrá usa **edificios genéricos GPU (`InstancedMesh`)** con **0 bytes** de huella. |
| **Ciudad Libre sin parkour ni vida alrededor de las estaciones** | El pasajero puede caminar, correr, hacer **parkour urbano** por escalas, puentes peatonales y plazoletas, visitar los **5 Skateparks reales** (ej. llegar en Metro a Estadio, Industriales/Ciudad del Río o Aguacatala/Puente 4 Sur y patinar allí) y transbordar sin cortes. |

---

## 3. Los 3 pilares jugables de El Metro v6 (enfoque y calidad)

1. **Conducción y Operación del Sistema Integrado en Relieve Real:**
   - **Líneas A y B (viaducto y nivel):** frenado regenerativo suave, apertura de puertas sincronizada en estaciones Hero con andenes 3D reales.
   - **Metrocables (Líneas K, J, H, M, P):** subir realmente **+190 m a +450 m** sobre las laderas de ladrillo de Santo Domingo y San Javier viendo el Valle de Aburrá en 3D real.
   - **Tranvía de Ayacucho (Línea T):** calle compartida con pendiente real del **9,6 %** entre San Antonio, Bicentenario y Miraflores.
2. **Ciudad Libre + Modo Turismo 3D (Pasajero a Pie + Parkour + Skateparks):**
   - Caminar (código 100 % activo, sin líneas comentadas), transbordar entre Metro, Tranvía, Cable y EnCicla, recorrer las **12 Zonas Hero** con sus hitos emblemáticos en 3D y desbloquear los **5 Skateparks** cercanos a las estaciones.
3. **Estrategia de Red (Modo Ingeniero / Despacho en Vista Cenital Alta):**
   - Usando la **misma cámara cenital única alejada a 72°**, administrar frecuencias, horas pico y contingencias sin duplicar motores ni mapas 2D.

*(El arte 2D/pixel existente de personajes como Rosalba y las tarjetas de estaciones queda reservado a diálogos, menús y fichas turísticas — nunca como parches sobre el mundo 3D.)*

---

## 4. Hoja de ruta de migración (Fases en `MetroZero`)

| Fase | Entregable concreto en `MetroZero` | Criterio verificable |
|---|---|---|
| **Fase 0 (Completada)** | Extracción real de las **12 Zonas Hero** (5.407 edificios + 760 segmentos viales + DEM SRTM real) desde `src/data/` hacia `motorcity/motor-v6/datos/zonas-hero-medellin.json` + tren de 3 coches y viaducto en `motor-v6/demo.html`. | Datos y proporciones SI validados en verde; tren de 3 coches circulando a 60 km/h reales en el slice vertical. |
| **Fase 1 · Cirugía de Emergencia (pre-migración opcional)** | Descomentar pausa (`25-game.js:28`), caminar (`36-libre.js:210`), arreglar `80-multi.js:109`, corregir pellizco y silenciar *hi-hats* con música apagada en la rama heredada si se requiere muestra inmediata; borrar los 50 MB muertos de `motor-city/`. | Pruebas reales en navegador que verifican pausa, caminar y silencio de audio (no solo `test.mjs 100`). |
| **Fase 2 · Corredor Troncal 3D v6 (Línea A + 4 Estaciones Hero)** | Construir el viaducto continuo de Línea A sobre `motor-v6` conectando **Universidad (Explora)**, **Parque Berrío / San Antonio**, **Alpujarra** y **Poblado / Puente 4 Sur** con abordaje en tiempo real. | Viaje continuo de 5 estaciones en Chrome móvil `412 × 860` con `< 110 MB` heap JS, `0` tramado ajedrezado y ≥ 45 FPS. |
| **Fase 3 · Laderas Reales (Tranvía de Ayacucho + Metrocables K/J)** | Integrar las Zonas Hero de **Ayacucho** (9,6 %), **Comuna 13** (22,4 %, 933 casas) y **Santo Domingo** (47,3 %, 1.550 casas) con cabinas de cable en pendiente real. | Subida completa de Acevedo → Santo Domingo sin edificios flotando ni saltos de cámara. |
| **Fase 4 · Integración de Turismo, Skateparks y Guardado `elmetro.v1`** | Conectar las 12 rutas turísticas, acceso a los 5 skateparks cercanos a estaciones, HUD limpio (todos los botones ≥ `44 × 44 px`) y migrador transparente desde `elmetro.v1`. | 0 botones `< 44 px`, 0 errores de consola, guardado `elmetro.v1` preservado al 100 %, soporte vertical y horizontal (P10). |

---

## 5. Reglas de calidad obligatorias para `MetroZero` v6
- **Sin logos ni marcas registradas ajenas** (respetar `AVISO-LEGAL.md` y la paleta cívica del proyecto).
- **Guardián de sonido real desde el arranque:** al salir de la app o apagar música, **todo** (incluidos *hi-hats* y efectos) queda en silencio absoluto.
- **Pruebas honestas:** las pruebas de CI deben abrir la app en navegador real, probar pausa, caminar, pellizco, memoria `< 120 MB` y FPS reales (prohibido el `medir()` falso).
