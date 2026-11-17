# 05 · Diseño: mundo abierto + arcade sobre Medellín

> Cómo se combinan todas las referencias en un solo juego preciso. Parte de lo que **ya existe** en El Metro v0.5.0 y marca lo nuevo con **[nuevo]**.

## 1. Fantasía del jugador
**“Ser parte de la red que mueve a Medellín.”** Recorres la ciudad real a pie, en bici, en taxi, en bus, en metro, en cable y en tranvía. Manejas cada vehículo del sistema, ayudas a su gente y vives sus fiestas. Ganas siendo **bueno con la ciudad**: suave, puntual, preciso y amable.

## 2. Estructura del mundo
- **Ciudad Libre es el centro de todo** (como el festival de Forza Horizon o el mapa de GTA): desde ahí se entra a la historia, los oficios, los eventos y los módulos de manejo, y a ella se vuelve siempre. Ya funciona así con la historia en la ciudad.
- **Regiones con identidad:**
  - **Norte:** Bello, Niquía, Madera.
  - **Nororiente:** Acevedo, Santo Domingo, Arví.
  - **Centro:** San Antonio, Parque Berrío, Botero, Ayacucho.
  - **Occidente:** San Javier, Comuna 13, Estadio, Laureles.
  - **Sur:** Poblado, Envigado, Itagüí, Sabaneta, La Estrella.
- **Confianza por comuna** [nuevo, de GTA 2]: ayudar en un barrio (oficios, pasajeros, eventos) abre misiones y decoraciones en ese barrio.
- **Puntos de interés:**
  - estaciones de todas las líneas;
  - 45 lugares con postal;
  - miradores;
  - vendedores;
  - teléfonos de encargo [nuevo, de GTA 1: los puntos de atención Cívica dan misiones].

## 3. Bucles de juego
| Escala | Qué haces | Recompensa |
|---|---|---|
| **Segundos** | Manejar o caminar, frenar suave, parar en la marca, validar la Cívica, esquivar, saludar | Cadena de “Cultura Metro” ×1→×5 |
| **Minutos** | Una ruta de bus, un tramo de metro, un viaje en cable, un oficio, un evento relámpago de 1–3 min | Estrellas (de 3 en 3, como Alto), pasajes 🎫, postales |
| **Días y semanas** | Capítulos de la historia, fiestas del calendario real, colección de vehículos y decoraciones, rango de oficio, La Red | Rangos (Aprendiz → Conductora → Maestra), logros, decoraciones de temporada |

## 4. Cámaras (cada módulo con la suya)
| Momento | Cámara | Referencia | Estado |
|---|---|---|---|
| A pie | Cenital 3/4 cercana | GTA 1/2, Town Brush | existe |
| Vehículo en la ciudad | Cenital con **zoom según velocidad**; opción de **girar con el rumbo** | GTA 1 / Chinatown Wars | zoom existe; giro [nuevo] |
| Bus | Cenital de seguimiento; **HUD mínimo** opcional con direccionales y flechas en el asfalto | Idea propia (minimalismo de Alto) | seguimiento existe; HUD mínimo [nuevo] |
| Metro y tranvía | Panorámica por capas ↔ cabina 1ª persona ↔ 3ª persona ↔ cine | Alto, Tiny Rails, simuladores | existe |
| Metrocable | Panorámica, 3D y cabina | Grand Mountain (góndolas) | existe |
| Llegadas y finales | **Repetición de cine** (cámara baja junto a la vía, paneo) | Forza, reel de carreras | [nuevo] |
| Fotos | **Modo foto** con encuadre, hora y filtro | Forza, Alto | [nuevo] |
| Interiores de estación | Isométrica pixel con luz dinámica | Holstin | [nuevo, futuro] |

## 5. Controles
- **Táctil:** joystick y botones grandes (existe); acciones táctiles de un toque con sentido físico (girar la llave, pasar la Cívica, tocar el timbre, mover una aguja), como en Chinatown Wars.
- **Modo niños de dos botones** [nuevo, de Super Arcade Racing]: acelerar y frenar; el asistente gira solo (ya existe en el bus).
- **Teclado** e **inclinación** opcional (ya existen).

## 6. La capa arcade: manejar bien es el puntaje
**Cadena “Cultura Metro”** [nuevo, de las cadenas de habilidad de Forza]. Suben el multiplicador:
- frenar suave;
- arrancar sin sacudir;
- parar en la marca (zona de toque de FR Legends: menos de 1 m es perfecto);
- llegar a tiempo;
- ceder el paso;
- esperar a que suba todo el mundo.

**Rompen la cadena:**
- un golpe;
- un frenazo;
- pasarse un rojo;
- cerrar puertas con gente subiendo;
- la bocina sin razón.

**Además:**
- **Estrellas de 3 en 3** por ruta o tramo (existen).
- **Récords y “fantasma”** del mejor recorrido [nuevo].
- **Sensación de velocidad sin violencia** (de NFS): campo de visión, líneas de viento, vibración leve en la cabina y sonido del motor; el placer está en la fluidez.

## 7. Eventos arcade dentro del mundo (no en menús aparte)
| Evento | Cómo se juega | De dónde sale |
|---|---|---|
| **Antes del aguacero** | Llevar pasajeros a la estación antes de que llegue la lluvia (2 min) | PAKO Forever, Reckless Getaway |
| **Esquiva el trancón** | Llegar a la estación en hora pico esquivando tráfico y obstáculos con física divertida | Reckless Getaway |
| **El tinto caliente** | Llevar el tinto sin regarlo (existe como oficio) | Industry Art / EnCicla |
| **El último tren** | Llegar a tiempo al último tren de la noche | GTA (contrarreloj) |
| **Agente de tránsito** | En hora pico, dar prioridad al Metroplús en cruces reales | Traffix |
| **Puesto de Control** | Mover agujas por colores en un momento de la historia | Railways |
| **Encomiendas** | Red de paquetes entre estaciones | Package Inc |
| **Dron de los Alumbrados** (dic) | Volar sobre el río, recoger estrellas de luz y esquivar pólvora | Missiles!, simulador de vuelo |
| **Viento en el cable** | Subir recogiendo flores o estrellas entre ráfagas | 1945 Air Force (lectura vertical) |
| **Paseo nocturno** | Manejar sin metas por la Autopista o Las Palmas, con radio | #DRIVE, Alto (modo zen) |
| **Carrera de chivas** (Feria) | Circuito cerrado en el centro con dos botones | Super Arcade Racing |
| **Exhibición de clásicos** (Feria) | Desfile calificado por precisión y estilo (no velocidad) | FR Legends |
| **Pinta tu barrio** | Modo creativo: pintar fachadas en ladera; las casas se acomodan solas | Townscaper |
| **Enciende los Alumbrados** | Llevar la energía a las figuras del río | Laser, Infinity Loop |
| **Orientar pasajeros** | Responder rutas reales (existe en la historia) | Laberinto: Infinito y sencillo |
| **Sube la loma** | Subir a pie las escaleras de la Comuna 13 con barra de aliento | Cairn |

## 8. Mundo vivo
- **Rutinas:** horas pico de 6–8 a. m. y 5–7 p. m. (más gente y más tráfico); la madrugada del primer tren; la noche de las laderas encendidas.
- **Pasajeros con historia** (Tiny Rails): cuentan algo al subir y vuelven a aparecer.
- **Perros, vendedores y transporte real** con paradas (ya existen); **más NPC** [nuevo]:
  - ciclistas de EnCicla;
  - agentes de tránsito;
  - silleteros (agosto);
  - músicos.
- **Clima:** temporadas de lluvia (abril–mayo y octubre–noviembre) y seca; aguaceros de tarde.
- **Calendario real:** todas las fiestas de `04-folklore-y-fiestas.md` cambian la decoración, la música y los eventos.
- **Radio** [nuevo, de GTA/Forza], emisoras generativas sin derechos de autor:
  - *Tango 1935*;
  - *Parrandera*;
  - *Carrilera*;
  - *Urbana*;
  - *Synth nocturna* (como el video de Josh White).

## 9. Progresión y economía
- **Pasajes 🎫** como moneda del juego (existe). **Sin compras con dinero real.**
- **Mejoras visibles** (APEX Racer, Super Arcade Racing):
  - bus con aire acondicionado (pasajeros felices) y mejor suspensión (más confort);
  - luces para la noche;
  - cabina con más instrumentos.
- **Decoraciones** (FR Legends, NFS): vinilos de fiesta para buses, trenes y cabinas de cable.
- **Colección:**
  - postales (existen);
  - vehículos clásicos (busetas de los 90, el tranvía de 1921);
  - fotos.
- **Rangos de oficio:** conductora de metro, operadora de cable, conductora de bus, agente, guía.

## 10. Historia
- **“La última vuelta”** se juega en la ciudad (8 capítulos, existe).
- **Sesión 2** propuesta [nuevo]:
  - **Alumbrados:** Rosalba, ya jubilada, viaja de pasajera mientras la nieta maneja la noche más bonita del año.
  - **Arví:** llevar silleteros con el cable L.
  - **Comuna 13:** subir con un guía del barrio.
  - **Metro de la 80:** inauguración en el futuro.

## 11. Juntos (multijugador local)
- Paseo en red por la Autopista (APEX Racer).
- **La Red cooperativa** con presupuesto (CityRT).
- **Carrera de chivas** para 2 jugadores (Super Arcade Racing).
- Duelo de paradas perfectas en el mismo celular (existe).

## 12. Accesibilidad
- Modo daltonismo: formas además de colores en las líneas.
- Textos grandes y voz para los diálogos (existe).
- Modo niños de dos botones.
- Sin destellos fuertes; los relámpagos se pueden desactivar.

## 13. Dónde entra el arte nuevo en el código
| Recurso | Reemplaza o mejora | Archivo |
|---|---|---|
| Atlas cenital (casillas 64 px por 20 m) | Dibujo procedural de manzanas y barrios | `src/js/10-map.js` |
| Sprites de vehículos y gente | `Spr.veh`, `Spr.ped`, `Spr.dog` | `src/js/21-sprites.js` |
| Capas panorámicas | Cordillera, cerros, laderas y fachadas | `src/js/23-lado.js` |
| Vehículos de perfil | Tren, tranvía y cabina laterales | `src/js/30-conduce.js`, `52-cableviaje.js` |
| Consola de cabina | Consola dibujada | `src/js/31-cabina.js` |
| Retratos | Caja de diálogo | `src/js/37-trama.js` |
| Íconos | Botones y logros | `src/style.css`, `65-menu.js` |
| Portada y compartir | Íconos y `compartir.png` | `tools/assets.mjs` |
