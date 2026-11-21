# Informe de Motor City 4.5 para El Metro

> **Para la IA que siga con El Metro (Codex, Gemini, Claude o cualquier otra).** Lo escribió Claude el 21‑nov‑2026 por pedido del autor: «compártele a cada repositorio un documento detallado con lo que has cambiado, lo que has mejorado, lo que queda por auditar y lo que falta que ellos hagan; que sigan manteniendo su propia versión del Valle; solo compárteles el motor y especifica cómo usarlo para terminar de desarrollar y mejorar su propio videojuego».
>
> Sigue el **protocolo de 7 pasos** de `CLAUDE.md`. Después de este informe: `TAREAS-IA.md`, `docs/BITACORA.md`, `docs/PLAN.md` y, si vas a usar el motor, `motor-city/docs/DOCUMENTO-UNICO.md` y `motor-city/docs/INVESTIGACION-MANEJO.md`.

## 1. La decisión del autor (lo que cambia para ti)
- **El Metro sigue con su propio motor** (`src/js/` con su Motor del Valle, `src/data/valle.js`). **No migres a Motor City.** La tarea «Migrar a `motor-city/`» (`TAREAS-IA.md`, punto 1, y `motor-city/docs/MIGRACION-ELMETRO.md`) queda **anulada**.
- **Motor City 4.5.0 está en `motor-city/`** como referencia y caja de herramientas (§ 6).
- **El mapa es tuyo** (skill `medellin-fiel`): viaducto, estaciones, cables, relieve y edificios los mejora tu IA. Motor City no los toca.
- **Todo público** y la paleta oficial de líneas (`arte/`, skill `el-metro-arte`). Nada de *Turno Cero* entra aquí.

## 2. Lo que Claude cambió en este repositorio (rama `claude/motor-city-engine-xu7p4y`, publicada en `main` y `gh-pages` el 21‑nov‑2026)
| Qué | Dónde | Notas |
|---|---|---|
| **Mundo abierto primero:** ▶ Jugar entra directo a **Ciudad Libre** (San Antonio o donde quedaste); «Todos los modos» debajo | `src/js/97-abierto.js` | Regla del autor. La prueba de 100 partidas lo comprueba (`tools/test.mjs`, capturas `02-ciudad-libre` y `02b-modos`). |
| **Relevo de Z1 y Z2 de Antigravity:** Ciudad Libre desbloqueada, pausa visible, cámara que no tapa la cabina ni la barra del tutorial (`ubicar()` dinámico), `pointercancel` en los controles, sonidos de la carrera, historia en 16:9 | `src/js/98-relevo-z1.js` | |
| La carrera: ventana de obstáculos (`crVentana`) y el satélite en caché (`_sat`) | `src/js/47-carrera.js`, `src/js/25-game.js` | Menos trabajo por cuadro. |
| Íconos de la app restaurados (daban 404) | `src/iconos/`, copiados por `tools/build.mjs` | |
| **Tutorial opcional:** «❓ Cómo se juega» al final del menú, nunca sale solo | `src/js/69-tutorial.js` y menú | |
| Motor City de la 2.0 a la **4.5.0** en `motor-city/` (el juego no cambió por esto) y el documento único | `motor-city/`, `dist/EL-METRO-TODO.md` | |
| Protocolo entre IAs sin mediador | `.ai-coord/`, `docs/COORDINACION-IA.md` | |

## 3. Lo que mejoró para quien juega
- Abre en la ciudad, manejando: sin menús obligatorios.
- La cámara ya no tapa la cabina ni la barra del tutorial; la pausa se ve; los dedos que se salen de la pantalla no dejan el control pegado.
- Los íconos de la app vuelven a verse.

## 4. Lo que queda por auditar (y cómo)
| # | Qué | Cómo |
|---|---|---|
| A1 | En un celular real (Android 7 con WebView 119 o más, iPhone 8/X con iOS 16): Ciudad Libre, conducir el metro, la carrera | Skill `el-metro-calidad-movil`; telemetría y capturas 412 × 860. |
| A2 | Que «Jugar» con un guardado viejo (`elmetro.v1`) entre a Ciudad Libre donde quedó y no pierda nada | Abrir con un guardado de la v2.0.0. |
| A3 | Las 100 partidas del bot con el motor 4.5 en `motor-city/` | `node tools/test.mjs 100` (0 errores). |
| A4 | Fidelidad del mapa contra OpenStreetMap (estaciones, cables, viaducto) | `docs/auditorias/` y la skill `medellin-fiel`. |
| A5 | Árboles que caigan en canchas o en la mitad de las plazas | Recorrer el Atanasio Girardot, la Alpujarra y el Parque de los Deseos. |

## 5. Lo que les toca hacer (en orden de valor)
1. **El manejo (metro, tranvía, Metroplús, bus y carros de Ciudad Libre).** Para lo que va por calle, porta del motor 4.5 (manera A del § 6): choque que desliza, desatascar, asistencia que evita la pared (con interruptor), joystick amortiguado y acelerador que se recoge en las curvas; para lo que va por riel, frenado y arranque con peso (ya lo tiene) y que nunca se quede trabado en un cambio de vía. Mídelo con una prueba como la § 25 de `motor-city/pruebas/prueba.mjs`.
2. **Las crónicas (Z3):** narrativa aditiva en `src/js/37-cronicas.js`, que guarde en `Save.d.cronicas` sin romper `elmetro.v1`.
3. **El bus intermunicipal a Guatapé (C‑EM40, zonas Z4 y Z5):** modo aparte con el modo bus actual, la Terminal del Norte, la Autopista del Embalse de `MC.Planeta` y el mundo `motor-city/datos/guatape/mundo.mc4` (0,4 MB). Manera C del § 6.
4. **Modelos 3D, 2D y pixel:** trenes de las líneas A y B, cabinas del cable, tranvía, Metroplús y la gente, con la paleta oficial. El generador `motor-city/juegos/getaway/arte3d/generar_modelos.py` muestra cómo hacer GLB con silueta, AO horneada y malla indexada; los encargos G‑/C‑ de arte siguen en `arte/06-guia-unica-ia.md`.
5. **Rostros detallados** para Rosalba, los pasajeros y los personajes de las crónicas: `MC.Rostro` (manera B).
6. **Topografía, relieve, casas, edificios y el mapa** (tuyos, skill `medellin-fiel`): lomas con su relieve fino, techos de teja a cuatro aguas en los barrios, terrazas con tanques; el viaducto y las estaciones fieles.
7. **Árboles con lógica:** nada en canchas, piscinas ni en la mitad de las plazas duras (`motor-city/js/29-arboleda.js`, `sembrable()`).
8. **La forma cenital** que admira el autor (*Hunter Assassin*): vista desde arriba limpia, con lo importante (estaciones, trenes, rutas) resaltado. En la isométrica 2:1, lo mismo: que se lea de un vistazo.
9. **Efectos para todo público:** chispas del pantógrafo, frenada con polvo, puertas, multitudes; sin explosiones (`MC.Efectos`).
10. **Interfaz y espaciados:** rejilla de 8 px y área segura; Modern Web Guidance antes de tocar `src/js/65-menu.js`; nada sobre el centro (`MC.UI.verificar`).
11. **Publicar** cada versión en `gh-pages` y la APK con `.github/workflows/apk.yml` (sube `elmetro.versionCode` en `android/gradle.properties` cada vez; etiqueta `v*` para la release).
## 6. Cómo usar Motor City sin dejar tu motor
El autor decidió que **cada juego sigue con su propio motor** (el Motor del Valle en EnCicla y El Metro; el motor WebGL propio en Run Scooter). Motor City viaja en `motor-city/` como **referencia y caja de herramientas**: no se compila dentro del juego a menos que tú lo decidas.

### 6.1 Tres maneras, de la más liviana a la más completa
| Manera | Qué haces | Peso que suma | Cuándo conviene |
|---|---|---|---|
| **A. Leer y portar** | Lees la función en `motor-city/js/NN-*.js` y escribes la tuya en un archivo **aditivo** de tu juego (rango libre de tu `src/js`). | 0 | Lo pequeño: el choque que desliza, el desatascador, la asistencia de manejo, las reglas de los árboles. |
| **B. Un módulo suelto** | Copias un archivo del motor que no depende de nada (o de muy poco) y lo llamas con tu propia proyección. | 10–30 KB | `MC.Rostro` (`js/71-rostros.js`), `MC.Efectos` (`js/88-efectos.js`), `MC.Colormap` (`js/47-colormap.js`), `MC.Semilla` y `MC.DDA` (`js/47-clasicos.js`). |
| **C. El motor entero como librería** | Metes `motor-city/dist/motor.js` en tu HTML **antes** de tu código. Todo queda bajo el objeto global `MC`, que no choca con tus nombres. | ≈ 1 MB (≈ 250 KB comprimido) | Un modo nuevo que use mundos MC4 (por ejemplo **Guatapé**: `motor-city/datos/guatape/mundo.mc4`, 0,4 MB), `MC.Planeta`, `MC.Vistas`, `MC.Trafico`. |

### 6.2 Ejemplos
**Retratos (manera B):** copia `motor-city/js/71-rostros.js` y lo que usa (`hex3`, `css3`, `mez3`, `mulberry32`, `TAU`, de `motor-city/js/00-nucleo.js`), o usa la manera C. Luego:
```js
const R = { piel: '#c68a5e', pelo: '#16110d', ojos: '#3b2414', peinado: 'cola', fem: true, edad: .2, ropa: '#2b343d', acc: ['gafas'] };
img.src = MC.Rostro.url(R, 128, { expresion: 'sonrisa' });          /* o MC.Rostro.dibujar(ctx, R, x, y, tam) */
const cualquiera = MC.Rostro.azar(semilla);                         /* una persona de la calle */
```
**Efectos (manera B o C):** solo necesitan una función que pase del mundo a la pantalla.
```js
MC.Efectos.chispas(x, y, 14, rumbo); MC.Efectos.humo(x, y, 3); MC.Efectos.marca(x1, y1, x2, y2);
/* en tu dibujo, al final de cada cuadro: */
MC.Efectos.dibujar(ctx, (x, y, z) => [pantallaX(x, y), pantallaY(x, y) - z * escala], { t: tiempoEnSegundos });
```
**El motor entero (manera C) en tu compilación:** en tu script de compilación, antes de tu código:
```js
const motorCity = fs.readFileSync('motor-city/dist/motor.js', 'utf8');   /* node motor-city/motor.mjs construir lo rehace */
html = html.replace('/*TU_CODIGO*/', () => motorCity + '\n' + tuCodigo);
```
y para un mundo MC4 sin internet: guarda el archivo en base64 dentro de un `<script type="text/plain" id="mc4-guatape">` y ábrelo con `await MC.Mundo.cargar(texto)`.

### 6.3 Lo nuevo del motor 4.5 que más te sirve
| Qué | Archivo | Para qué en tu juego |
|---|---|---|
| Choque que desliza, desatascar, asistencia, derrape | `js/32-fisica.js` (`_mover`, `_despues`, `_asistencia`, `_desatascar`) y `js/36-taller.js` | Que el vehículo no se trabe en las paredes ni se quede pegado; que no se estrelle por un dedo nervioso. Documento: `motor-city/docs/INVESTIGACION-MANEJO.md`. |
| Qué pisa cada vehículo | `js/31-vehiculos.js` (`VEH_SUELO_*`) | Andén, ladrillo, pasto, arena, nieve y roca suelta, despacio; la moto por escalas. |
| Cosas que se rompen | `js/32-rotos.js` | Conos, canecas, vallas y bancas que se tumban según la velocidad y la masa. |
| Efectos | `js/88-efectos.js` | Chispas, humo, marcas de llanta, pedazos y restos. (La explosión es para juegos 18+.) |
| Rostros | `js/71-rostros.js` | Retratos en diálogos, tarjetas y perfiles. |
| Árboles con lógica | `js/29-arboleda.js` (`sembrable`, `despejada`) | Nada de árboles en canchas, piscinas o en la mitad de una plaza dura. |
| PVS horneado | `herramientas/pvs.mjs`, `js/45-pvs.js` | Si tu 3D dibuja una ciudad densa: no dibujar lo que tapan los edificios. |
| Sin conexión | `sw.js` y `pruebas/sin-conexion.mjs` | Abrir sin internet lo que ya se abrió, consultando solo un archivo de versión. |
| Modelos 3D con cara y AO | `juegos/getaway/arte3d/generar_modelos.py` | Un generador de GLB en Python sin dependencias para tus propios modelos. |

### 6.4 Comandos del motor (desde tu repositorio)
```bash
node motor-city/motor.mjs construir          # rehace dist/motor.js y los juegos del motor
node motor-city/motor.mjs prueba             # 144 pruebas de Node del motor
node motor-city/motor.mjs documento          # todo el contexto del motor en un archivo
node motor-city/motor.mjs skills --instalar --agente codex   # (o antigravity, gemini-cli) las skills externas
```
Para traer una versión nueva del motor, desde el repositorio `motorcity`: `node motor.mjs sincronizar ../<tu repositorio>`.

## 7. Reglas que no cambian
- Un solo HTML, sin internet ni librerías en el juego; celulares modestos (Android 7 con WebView 119, iPhone 8/X con iOS 16).
- Español de Colombia; **todo público** (sin armas, sangre ni explosiones de violencia: un choque suave, chispas y humo sí).
- **No romper el guardado** (la clave de guardado de tu juego no cambia sin migración).
- Las pruebas de tu repositorio en verde antes de subir. Nunca subir llaves.
- **El mapa es tuyo:** las calles, el relieve y los edificios de tu juego los decide y los mejora tu IA. Motor City no los cambia.
- Coordinación: tu ficha en `coord/agentes/<tu-id>.json` (o `.ai-coord/`) y un mensaje nuevo en el buzón por cada entrega.

## 8. Comandos de este repositorio
```bash
node tools/build.mjs        # dist/index.html (un solo HTML)
node tools/test.mjs 100     # autotest + 100 partidas + pantallas: 0 errores
node tools/todo.mjs         # documento único + este CLAUDE.md
```
Al terminar: `docs/BITACORA.md`, tu ficha en `.ai-coord/` y un mensaje en su buzón.
