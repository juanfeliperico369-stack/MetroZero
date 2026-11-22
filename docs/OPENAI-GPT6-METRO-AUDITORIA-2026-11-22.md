# OPENAI GPT-6 · EL METRO — Auditoría de jugabilidad, comparativa y plan de evolución del mundo abierto

**Proyecto:** `juanfeliperico369-stack/MetroZero` · **fecha:** 22 de noviembre de 2026 · **autor técnico:** OpenAI GPT-6 · **alcance de escritura:** únicamente `MetroZero`.

> **Estado honesto:** Este documento distingue entre lo *observado en código*, lo *corregido con un parche verificable* y lo *propuesto para desarrollo*. No certifica que todos los modos estén terminados ni que se hayan ejecutado juegos comerciales de Android. Las referencias se contrastaron con fichas y materiales públicos; las pruebas disponibles del parche son deterministas con Node, **no equivalen a una sesión táctil en móvil con GPU**. El objetivo es evitar que varias IAs confundan planes con funciones implementadas.

## 0. Directriz de producto — decisión que no se negocia

**El Metro es un videojuego arcade familiar ambientado en una versión jugable del Valle de Aburrá: un solo territorio, movilidad viva, libre exploración, misiones intermodales y aprendizaje sin lecciones obligatorias.** No es un simulador ferroviario lento ni una recopilación de minijuegos inconexos. El jugador tiene control efectivo y feedback inmediato; el mundo conserva escala, causalidad, estaciones, horarios aproximados y cultura de transporte, pero comprime el tiempo solo donde mejora la diversión. Todos los modos y capítulos clásicos se pueden probar desde el primer minuto; la progresión desbloquea *reconocimiento, historias, cosméticos o variaciones*, nunca acceso básico.

Los tres criterios para evaluar cualquier característica son **diversión perceptible**, **conciencia sobre movilidad/convivencia** y **curiosidad por el territorio**. Se rechaza una propuesta si no contribuye a ninguno de ellos o contradice la identidad del juego.

### Reglas de diseño comprobables

1. El botón **Jugar** lleva a Ciudad Libre en un toque; tutorial y narrativa son voluntarios; desde el menú también se entra a todos los modos.
2. Un solo sistema de coordenadas del Valle y **una sola simulación autorizada** de geografía, viajeros, rutas, vehículos e incidentes. Las cámaras y vistas no hacen copias del mundo. El dibujo 2D/píxel puede ser deliberadamente estilizado, pero usa la misma verdad espacial.
3. Cada actividad se ejecuta con el **mismo contrato de reglas** tanto desde Ciudad Libre como desde su lista de niveles. Cambiar de contexto no debe cambiar manejo, obstáculos, puntuación o latencia.
4. Un vehículo responde al primer control en menos de **150 ms percibidos** en condiciones normales; acelera con intención arcade sin romper límites de seguridad internos del modo.
5. Los escenarios son observables, fotografiables y tienen consecuencias: pasajeros, servicios, oficios, reputación de cuidado, calidad del viaje, historias de vecinos, pequeñas economías de movilidad.
6. La actividad runner de bici/patines/monopatín es **exclusiva de corredores de ciclovía verificados**, con bifurcaciones, estrechamientos, cruces y áreas de trucos conectadas. **No convertir la vía férrea ni el carril Metroplús en ciclovía.**
7. Cada mejora visual se mide contra fps, consumo de memoria y claridad de controles antes de elevar el nivel de detalle.
8. En las representaciones educativas, distinguir con claridad lo **real, estilizado, ficticio, planificado y aproximado**. No enseñar como estaciones reales lugares generados para jugar.

## 1. Qué se inspeccionó y qué ya existe

Inspección por API GitHub del repositorio y archivos de código fuente a 22/11/2026; no asumir que un comentario en código es prueba de jugabilidad. Se comprobó `AGENTS.md`, `TAREAS-IA.md`, `README.md`, `docs/COORDINACION-IA.md`, `docs/INFORME-MOTOR-CITY-4.5.md`, estados y buzón multi-IA, `tools/build.mjs` y los módulos principales.

| Subsistema real | Código / dato | Fortalezas observadas | Brecha / riesgo |
|---|---|---|---|
| Motor / estado | `src/js/00-core.js`, `25-game.js` | Modos con contrato común; guardado `elmetro.v1`; bucle y prueba bot | Falta automatizar medición de respuesta humana y trazas físicas por modo |
| Mapa y geometría | `10-map.js`, `11-ciudad2.js`, `src/data/valle.js`, `vias.js`, `edificios.js` | Terreno del Valle, calles, infraestructura, estaciones y detalle procedimental | Validar continuidad y colisiones a todas las escalas; no confundir mapa aproximado con geodato oficial |
| Mundo 3D | `22-gl.js`, `36-libre.js` | WebGL 1 sin librerías, terreno y objetos 3D desde coordenadas compartidas, cámaras libre/seguimiento | Render más elaborado, profundidad de fachadas y perfiles GPU pendientes de medición real |
| Ciudad Libre | `35-ciudad.js`, `36-libre.js`, `39-gente.js`, `97-abierto.js` | Caminata, vehículos, transporte abordable, encargos, fotografía, vecinos, mapa y rescate; portada entra directo | Las actividades independientes aún no están todas montadas en el mundo con el mismo estado/mecánica |
| Trenes y tranvía | `30-conduce.js` | Física con límites, señales, andén, confort, horarios, seis perspectivas | La tecla `v` solo recorría 4 de 6 vistas; calibrar experiencia de aceleración/frenada real con telemetría |
| Buses y alimentadores | `32-volante.js`, `38-bus.js` | Manejo 3D y cenital, semáforos, pasajeros, timón, asistencia; `Bus` llama `Libre.drive` | La tecla `v` solo recorría 4 de 5 vistas; dos contratos de conducir bus deben converger para actividad única |
| Arcade de red y cruces | `40-rieles.js`, `45-metroplus.js`, `50-cable.js` | Puzles de agujas, semáforos y cable con puntuación | Topologías de tablero separadas del mundo urbano: falta marcador/entrada contextual en estación/cruce real |
| Runner | `47-carrera.js` | Obstáculos, cinco vehículos, turbo/escudo/imán, cámaras 3D con G3, interfaz móvil y recorrido por ventana | Arranque demasiado lento por aceleración `.12 m/s²`; usa corredores A/B/T/Metroplús, **no ciclovías comprobadas** |
| Historia | `37-trama.js`, `70-historia.js`, `69-tutorial.js` | Escenas, historia de Rosalba y guía voluntaria | Lista de capítulos clásicos bloqueada por progreso; no debe impedir pruebas libres |
| UI accesible | `65-menu.js`, `27-camara.js`, `98-relevo-z1.js` | Parches previos de UI a 412×860, pausa visible, `pointercancel`, cámara libre | El menú bloquea niveles por estrellas; se requieren ensayos táctiles y horizontales repetibles |
| Rendimiento | `22-gl.js`, `25-game.js`, `tools/build.mjs` | DPR adaptable, cachés regionales y gráficos 2D como alternativa | No hay aquí perfil validado en Android 7–16 / iOS para cada vista y densidad; no prometemos 60 fps sin datos |
| IA y colaboración | `.ai-coord/`, `docs/COORDINACION-IA.md` | Ramas y buzón append-only, otras IAs dejaron entregas, módulos aditivos | Riesgo de cambios simultáneos; atribución y estado verificable por commit requeridos |

**Hallazgo arquitectónico:** Hoy existe un *terreno compartido y varios renderizadores* (2D, WebGL, lateral, isométrico). Eso es una base valiosa, **pero no basta para demostrar que todas las actividades comparten el mismo estado lógico**. El criterio futuro es *una única simulación de mundo*, no necesariamente un único shader ni un único canvas.

## 2. Fallos reproducibles por lectura de código y correcciones de esta entrega

### F-01 · Nivel de dificultad artificial: modos cerrados aunque el usuario pide prueba libre — P0

**Causa:** `src/js/65-menu.js::levels()` incluye `lock` cuando no existen estrellas en el nivel anterior; su `onclick` cancela el inicio si la clase está presente. También bloquea capítulos posteriores en `storyList()`. La solución no es regalar estrellas ni adulterar el archivo de guardado: simplemente **retirar el bloqueo de interfaz** y permitir que `Game.start()` o `Story.open()` hagan lo normal.

**Corrección:** `src/js/98a-openai-gpt6-fluidez.js` envuelve `Menu.levels` y `Menu.storyList`, elimina `lock` al mostrar la pantalla y abre directamente el capítulo clásico seleccionado; la puntuación y el capítulo completado siguen registrados según sus reglas actuales. **No se cambia la llave `elmetro.v1`.**

**Verificación local:** prueba Node con 12 entradas de nivel y 8 de historia simuladas; se comprueba desbloqueo y apertura del capítulo 8. **Pendiente** probar todas las pantallas reales con ratón y Android.

### F-02 · Atajo de vistas incompleto — P1

**Causa:** `src/js/30-conduce.js::key()` define 6 vistas pero usa `% 4`; `src/js/32-volante.js::key()` define 5 vistas pero también `% 4`. El botón `v` nunca llega a algunas perspectivas. **Corrección:** capa aditiva que utiliza el tamaño completo de los conjuntos de vistas, conserva el resto de teclas y no reinicia la partida.

**Verificación local:** una vuelta cerrada por las 6 cámaras del Metro y 5 del bus, más delegación a tecla `h` para comprobar que otras órdenes no se pierden. **Pendiente:** comprobar recorte de HUD, orientación y ausencia de duplicación del mundo al alternar en móvil.

### F-03 · El runner no alcanza una velocidad divertida — P0

**Causa:** en `47-carrera.js::step()` la aceleración normal es **0,12 m/s²** hasta máximos típicos de 20–23 m/s. Desde el arranque `v = 8 m/s`, la sola aceleración de 0,12 implica **100 segundos** para llegar a 20 m/s; la mayor parte de un tramo corto se juega a velocidad baja. **Corrección:** elevar la aceleración normal total a aproximadamente **4,4 m/s²**, manteniendo el tope del vehículo, el turbo y la detección original de obstáculos. Esta cifra es de *diseño de videojuego*, no una afirmación de aceleración humana real. La distancia a obstáculo debe recalibrarse tras prueba táctil.

**Verificación local:** prueba determinista de 90 fotogramas a 30 Hz: velocidad pasa de 8 a casi 20 m/s en unos 3 segundos, avanza distancia, no supera el tope, el turbo respeta su límite, `dt=0` no mueve. **Pendiente:** telemetría de choques, legibilidad de obstáculos a velocidad final y control en teléfono.

### F-04 · Runner utiliza segmentos de línea férrea/Metroplús, no red de ciclovías — P0, NO CORREGIDO

**Causa:** `47-carrera.js::LINEAS` selecciona A, B, T, MP1, MP2 y MPO y `pos()` recorre `NET.byId[st.line].P` con desplazamiento; `src/data/encicla.js` enumera estaciones de bici, **no constituye una red ciclista legal**. El hecho de que una calle esté paralela al metro no la convierte en ciclovía. Antes de publicar un modo "solo ciclovías" debe integrarse una polilínea con trazabilidad por tramo (fuente, sentido, tipología, ancho, longitud, estado). **No se pretende que el parche de velocidad solucione este error espacial**.

**Acción:** preparar `src/data/ciclovias.js` validado desde datos abiertos/OSM y revisión manual; elegir rutas reales `cycleway`/`bicycle=designated`, incluyendo ciclocalles solo si están identificadas y separando tramos recreativos; no fabricar conexiones inexistentes. Para arcade, permitir atajos ficticios únicamente con etiqueta `arcade` y visual claramente diferenciada, sin afirmar infraestructura real. Sustituir `CR.LINEAS` por niveles de corredor certificado y mover obstáculos, plazas y curvas a distancias sobre esa red. Probar paso por intersecciones y retorno en cada tramo.

### F-05 · Doble simulación funcional entre minijuego cerrado y mundo abierto — P0, diseño por implementar

**Causa:** `Bus` recurre a `Libre.drive` (buena reutilización), pero el simulador `Volante` posee otro integrador, flota/collisiones/controles propios; `Conduce` tiene su estado de tren y `Ciudad` mantiene vehículos de fondo. La actividad arcade de Metroplús construye tablero de intersecciones independiente. Resultado posible: "manejar aquí" no equivale a "manejar allí".

**Acción:** un único `ActivityService.start(activityId, worldEntity, config)` en ambos accesos: en modo cerrado crea una *vista enfocada* del mismo modelo de vehículo; en Ciudad Libre invoca `ActivityService` sobre la misma entidad y ubicación. El modo puede suministrar HUD y cámara propios, pero **no otro motor físico**. Implementar primero para un tren, un bus y un cruce; expandir tras pruebas.

### F-06 · Continuidad de controles y velocidad a 30 fps — P0, por instrumentar

El ciclo central limita `dt` y solo algunos modos usan substeps. Una carga gráfica o pestaña suspendida puede producir "tiempo que no pasó" o paso desigual. Mantener paso físico fijo 1/60 s, acumulador máximo 0,10 s y un máximo de 5 subpasos por cuadro; interpolar solo visualmente. **No acelerar la física para ocultar frames perdidos.** La velocidad arcade es decisión del modo, independiente del fps.

**Orden de prioridad:** primero F-01/F-02/F-03 hechos; luego completar F-04/F-05/F-06 y comprobar en teléfono, antes de expandir arte.

## 3. Cambios de código incluidos y pruebas

| Archivo | Estado en esta entrega | Alcance |
|---|---|---|
| `src/js/98a-openai-gpt6-fluidez.js` | **Nuevo y comprobado sintácticamente** | Desbloqueo de niveles/capítulos, teclado de todas las cámaras, aceleración del runner |
| `tools/test-gpt6-fluidez.mjs` | **Nuevo, prueba PASS en Node v22** | Regresiones deterministas de los comportamientos anteriores sin navegador |
| `docs/OPENAI-GPT6-METRO-AUDITORIA-2026-11-22.md` | **Este documento** | Auditoría, fuentes, plan, criterios de aceptación y coordinación |
| `.ai-coord/buzon/20261122-0930-openai-gpt6-metro.md` | **Nuevo** | Traspaso a otros agentes sin pisar su estado |

**Pruebas realizadas en entorno aislado sobre el parche:**

```bash
node --check src/js/98a-openai-gpt6-fluidez.js
node tools/test-gpt6-fluidez.mjs
# Resultado observado al 22/11: PASS GPT-6: desbloqueo de 12 niveles,
# 8 capítulos, 6+5 vistas, velocidad, turbo y pausa
```

**Pruebas que aún no se han ejecutado y son OBLIGATORIAS antes de fusionar a publicación:**

```bash
node tools/build.mjs
node tools/test.mjs 100
# En Chromium móvil: Ciudad Libre, Tren A, Tranvía T, Bus,
# Volante, Cable, Metroplús, control de agujas y Runner.
# Inspeccionar fallos consola, fps y controles en 412×860 y 860×412.
```

El nuevo `src/js/98a...` se integra automáticamente en el HTML único porque `tools/build.mjs` concatena por orden alfabético todos los `.js` del directorio. Se carga después de `98-relevo-z1.js` y antes de `99-boot.js`. No requiere Internet, CDN ni cambios en la versión del guardado.

## 4. Comparativa rigurosa: qué aprender de los referentes y qué NO importar

La clave es extraer una **mecánica concreta** y situarla en infraestructura del juego, no copiar estética o franquicias. Esta es investigación documental sobre material de los estudios, tiendas oficiales y páginas del proyecto. **No es una prueba jugada en dispositivo de los títulos comerciales.**

| Referente | Lección comprobable / transferible | Integración verosímil a El Metro | Qué evitar |
|---|---|---|---|
| **Super Arcade Racing** (OutOfTheBit) | Controles simples, top-down 2D pixel, respuesta inmediata, niveles cortos con motivación narrativa | Retos de precisión de llegada, conducción simplificada del bus en vista cenital, repetir en 30–90 s | Copiar carreras clandestinas que conviertan transporte público en imprudencia |
| **Mini Metro** (Dinosaur Polo Club) | Estrategia legible de líneas, capacidad, puntos de presión y mejoras | Gestión de despacho ante demanda de estación y transbordos; reto infinito opcional | Redibujar libremente la red real como si los trazados fueran operables |
| **Railways** (Infinity Games) | Un toque detiene; arrastrar redirige; gestionar simultaneidad y colisiones | Puesto de control sobre agujas y andenes existentes; señales visuales claras | Exigir veinte gestos antes de entender la primera acción |
| **Train Conductor / Train Conductor World** | Ritmo ferroviario arcade, dificultad creciente, desviar trenes y evitarlos | Minirretos de tráfico y control usando vías y playas de maniobra identificadas | Rieles imposibles creados sobre casas o al aire |
| **Traffix** | Una acción central (semáforo) produce consecuencias instantáneas | Cruces Metroplús y tranvía, conflictos con peatones, taxis y motos en nodos existentes | Tratar al bus como si tuviera prioridad sin reglas verificadas |
| **911 Operator** | Incidentes situados en una ciudad, decisiones de despacho y recursos escasos | Centro de operaciones con incidencias de movilidad **no violentas**: averías, lluvias, accesibilidad, viajeros perdidos | Contenido de violencia o emergencias gráficas incompatibles con todo público |
| **PAKO Forever** | Controles reducidos, reintentos rápidos, emergentes y sorpresa constante | Carreras de precisión en zona segura/ciclovías, desafíos por récord personal | Persecuciones policiales como núcleo de la identidad del Metro |
| **GTA 1/2 / Chinatown** | Legibilidad cenital, barrios reconocibles y sistema de misiones interconectadas | Actividades en estación/taller/plaza y mapa consultable en un toque | Crimen, armas y economía ilegal como objetivos en este juego familiar |
| **Townscaper / TheoTown / Cities: Skylines** | Placer de contemplar y comprender la ciudad; urbanismo por capas | Modo maqueta/dron; comparar ruido, espacio y flujo de pasajeros en escenarios controlados | Permitir mover las estaciones reales a voluntad sin avisar que es un escenario hipotético |
| **Sky / A Short Hike / Alto's Odyssey** | Viaje como recompensa, calma, identidad de lugares, pequeños hallazgos | Album fotográfico de paisaje ferroviario, miradores de cable, relatos de usuarios | Añadir grandes mundos vacíos o objetivos de velocidad permanentes |
| **The Sims / idle management** | Rutinas de habitantes con necesidades y consecuencias visibles | Turnos de anfitrión, mantenimiento, bodega, flota, atención al usuario | Esperas largas o temporizadores con monetización que frenen el juego |
| **Monument Valley / Infinity Loop / Laser** | Puzles de una idea, reglas intuitivas, retorno visual al resolver | Red de transbordos, señalética, ubicación de andenes, continuidad de cables | Puzles arbitrarios que no enseñan nada sobre movilidad |
| **Tiny Rails / Train Chu** | Viaje ferroviario 2D lateral, paisaje en movimiento, progresión de trayectos | Modo lateral de tren/mantenimiento, puntualidad simplificada, estaciones con transiciones | Crear "otro Valle" lateral independiente del que explora el jugador |
| **Forza Horizon / #DRIVE / FR Legends / APEX Racer** | Sensación de velocidad, cámara, sonido, control y curva de aprendizaje | Perfil arcade de bus/vehículos autorizados y actividades de circuito en zona controlada | Aplicar velocidades de carreras al servicio comercial de pasajeros |
| **WorldBox / Mini Motorways / Package Inc** | Causalidad sistémica y claridad visual de redes en movimiento | Simular desplazamientos origen-destino, congestión y capacidad por distrito | Simular agentes de todo el Valle a máxima precisión: costo exponencial sin beneficio |
| **Vector / SkateSpace / Shadow Fight** | Animación y ritmo visual de movimiento, parkour de siluetas legibles | Skateplaza conectada a ciclovía, salto/derrape con señales de riesgo y aterrizajes expresivos | Peleas, daño o acrobacias peligrosas en vías ferroviarias como juego normal |

**Priorización:** para **MetroZero**, los juegos con mayor retorno práctico son (a) *Super Arcade Racing* para game feel y legibilidad, (b) *Railways/Train Conductor* para despacho interactivo, (c) *Traffix* para Metroplús, (d) *Mini Metro* para red y oferta/demanda, (e) *911 Operator* para incidentes, y (f) *Sky/A Short Hike* para contemplación. El resto aporta subsistemas puntuales, no una receta global.

### Fuentes externas comprobadas

- Metro de Medellín — Sistema Integrado, líneas y modos de transporte: https://www.metrodemedellin.gov.co/usuarios/sistema-integrado/
- Metro de Medellín — Línea A, eje La Estrella ↔ Niquía: https://www.metrodemedellin.gov.co/usuarios/sistema-integrado/linea-a
- Metro de Medellín — Tranvía T, integración y convivencia: https://www.metrodemedellin.gov.co/al-dia/noticias/tranvia-cumple-10-anos-de-servicio-integracion-y-transformacion
- Super Arcade Racing — ficha oficial en Google Play: https://play.google.com/store/apps/details?id=com.outofthebit.superarcaderacing
- Mini Metro — creador Dinosaur Polo Club: https://dinopoloclub.com/games/mini-metro/
- Railways — ficha Apple App Store, mecánicas de pausa, arrastre y choques: https://apps.apple.com/us/app/railways/id1492002834
- Train Conductor — estudio The Voxel Agents: https://www.thevoxelagents.com/trainconductor/
- Train Conductor World — estudio: https://thevoxelagents.com/presskit/sheet.php?p=train_conductor_world
- Traffix — Infinity Games en Google Play: https://play.google.com/store/apps/details?id=com.infinity.traffix
- 911 Operator — Steam: https://store.steampowered.com/app/503560/911_Operator/
- PAKO Forever — Google Play: https://play.google.com/store/apps/details?id=com.treemengames.pakoforever
- MDN — WebGL best practices: https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices
- MDN — Optimizing canvas: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas

## 5. Arquitectura para una sola ciudad, todas las vistas

**Principio:** un solo *world state*, no "una ciudad 2D" y "una ciudad 3D". Cambiar cámara modifica proyección, distancia, capas visibles y entrada, pero no posición, colisión, hora, pasajeros ni desenlace.

```text
WorldData (mapa, vías, edificios, curvas, ciclovías verificadas)
  └── WorldSimulation (reloj, eventos, flota, pasajeros, clima, tráfico)
       ├── PlayerController (a pie / bici / bus / tren / cable)
       ├── ActivityService (conduce, despacho, cruce, runner, mantenimiento...)
       ├── WorldEntityRegistry (ID estable, posición 3D y estado)
       ├── CameraRig (cenital, panorámica, tercera, primera, dron...)
       ├── Render3D (terreno, volumen, detalle por distancia, luces)
       └── Render2D/Pixel (atlas, lateral, frontal, maqueta y arcade)
```

- **Posición:** `[x, y, z]` con y elevación; todas las posiciones referencian la misma entidad. En 2D, proyectar el mismo `[x,z]` y altura; en lateral, posición a lo largo de la línea `s` proyectada desde la misma curva tridimensional, sin segunda geografía.
- **Redes:** grafo `nodo/arista` con metadatos `mode`, `sentido`, `ancho`, `acceso`, `velocidadJuego`, `fuente`, `realidad`. Cada modo filtra aristas legales para su vehículo. Metro solo sobre su vía; bus solo calle/carril; runner solo ciclovía/sendero apto acreditado.
- **Simulación:** `fixedStep=1/60`, `renderAlpha` interpolado. Personas lejanas = demanda agregada y horarios, no millones de NPC con física. Vecindario cercano = agentes con rutas y eventos. Mantener semillas estables por distrito.
- **Actividades:** estructura `ActivityDefinition {id, locationPredicate, start, step, act, render, result, reward, worldEvent}`. Dos entradas (libre / menú) llaman al mismo `start`, no implementaciones duplicadas. El modo cerrado puede fijar cámara pero no reescribir `step`.
- **Persistencia:** los identificadores estables permiten guardar reputación/visitas/cambios sin serializar millones de agentes. Versionar el nuevo bloque y migrar desde `elmetro.v1` conservando datos.
- **UI:** todos los controles bajo una tabla de acciones (`move`, `brake`, `interact`, `cameraNext`, `pause`, `zoom`), vinculable a teclado, puntero, táctil y orientación. Nunca exigir giroscopio. Una mano debe poder activar función primaria.
- **Visual:** 3D es volumétrico, 2D puede estar superpuesto como cartelería/sprites, pixel como estilo específico de ciertos minijuegos y texturas. Si no hay WebGL: un fallback 2D legible **del mismo estado**, no un juego distinto.

### Contrato de identidad entre módulo y mundo libre

Para cada actividad `A` elegir un punto de entrada *real del mundo*: estación, patio, cabina, cruce, taller o ciclovía. Tras activarse, `Game.start(A,level,{worldRef, returnToWorld:true})` usa las reglas A y, al salir, la posición y consecuencias se reflejan en el mundo. En versión inicial puede usarse un *snapshot controlado* para no romper la partida; después una entidad persistente. Los resultados del módulo no se duplican ni se pierden cuando se cierran escenas.

**Prueba de equivalencia:** misma semilla + mismas acciones + mismos pasos de 16,67 ms → igual posición de vehículo ±0,1 m, puntuación idéntica, paradas y penalizaciones idénticas para entrada libre y entrada menú. Si no, el requisito no se ha cumplido.

## 6. Perfiles de jugabilidad y balance

Es preferible **un conjunto pequeño de experiencias impecables** a veinte botones nominales.

| Experiencia | Núcleo jugable | Ritmo objetivo de diseño | En Mundo Libre | Condición para declarar jugable |
|---|---|---|---|---|
| **Conduce Metro / tranvía** | Tracción y freno de precisión, señales, paradas, pasajeros | Respuesta inmediata; opción crucero x2/x3 en segmentos, freno de estación en tiempo normal | Subir a cabina o iniciar turno en estación/depósito | 5/5 viajes de prueba terminan por medios humanos sin bloqueo |
| **Bus / Metroplús / alimentador** | Conducir, girar o asistente opcional, pasajeros, Cívica, cruces | Arranque sin atasco; rutas cortas 2–5 min; tiempo comprimido fuera de maniobras | Abordar cabina; servicio local que respeta cruce | 5/5 salidas, paradas, puertas y regresos sin pérdida de control |
| **Metrocable** | Ritmo de cabinas, clima, capacidad, contemplación | Controles breves y viajes cómodos de contemplar | Terminal y mirador | Gestionar salida/parada y eventos con señales claras |
| **Despacho ferroviario** | Agujas, separación de trenes, asignación de andén | Turnos 45–120 s con dificultad graduable | Puesto de Control sobre red existente | No hay spawn imposible; todos los tableros tienen solución |
| **Cruces Metroplús / Traffix** | Alternar señales y ordenar flujos sin colisiones | Decisiones cada 3–8 s, pausa disponible | Intersección real marcada en mundo | Señal toca exactamente lo que pinta y se ve por qué falló |
| **Runner de ciclovía** | Esquivar, cambiar de carril/sentido permitido, saltar, trucos | Aceleración 2–3 s, lectura anticipada 1,5–2,0 s | Entrar desde ciclovía; poder salir/seguir en el mismo corredor | 10 carreras manuales sin choque injusto; ciclovía verificada |
| **Mantenimiento de red** | Detectar falla, elegir herramienta, presión de tiempo | Puzzles de 30–90 s, sin esperas idle obligatorias | Taller y patio, consecuencias temporales visibles | 100 % de órdenes resolubles y comprobables |
| **Orientación del pasajero** | Encontrar trayecto con transbordo, accesibilidad y tiempo | 30–120 s por encargo | Usuario pide ayuda en estación | Respuesta y transferencia coinciden con el grafo real simulado |
| **Foto / exploración / postales** | Descubrir barrios, líneas, arquitectura, historia oral | Libre, sin cronómetro | Miradores de cable, plazas, estaciones | Localización y texto coherentes, guardado de foto estable |
| **Gestión de red (roguelite)** | Resolver incidentes bajo capacidad escasa | Sesiones 5–12 min, mejoras temporales por turno | Pantalla de control de operaciones | La sesión reinicia sin bloquear el modo base ni alterar hechos reales |

**Desfase del mundo:** la vista puede exagerar desplazamiento de cámara, sonido, partículas y vibración; el sistema de rutas y paradas mantiene magnitudes coherentes. No elevar un tren de pasajeros a velocidad de automóvil deportivo para fingir diversión: mejor acortar secciones aburridas con escalador temporal voluntario y señalizado. El corredor runner **sí** usa velocidad fantástica declarada, porque es arcade, sin pretensión física humana.

## 7. Diseño concreto del runner solo por ciclovías

Modelo de ruta `Corredor = {id,geometry3D,length,segments:[{s0,s1,width,direction,branch,provenance}],connections,skatePlazas}`. `s` mide longitud por línea; una bifurcación cambia el siguiente segmento, no teletransporta a otro mapa. Cada obstáculo se ubica en `(edgeId,s,lane,lateralOffset,height)`. El jugador elige movimiento horizontal continuo dentro del ancho real *de jugabilidad*; no imponer tres carriles en una ciclorruta estrecha. Un tramo de 2 m puede ser 1 carril; una avenida ciclista segregada 2; una zona amplia/plaza 3 y trucos. Los cambios de ancho tienen señal anticipada y transición suavizada. Al cruzar vía vehicular, el reto es tiempo/atención a señales, nunca atropellar a alguien para conseguir puntos.

**Señalización:** icono de giro válido 1,5 s antes; color y forma doble para accesibilidad; zonas de alto riesgo tienen borde visible desde primera persona, vista lateral y cenital. Si hay salto, volumen de colisión 3D y sombra de aterrizaje; el obstáculo no aparece a menos de una distancia mínima `d_min = v * 1,6 + 5 m`. Con `v=20 m/s`, `d_min≈37 m`. Hoy los obstáculos se generan separados por ~9–25 m; a velocidad arcade y sin ventana de reacción adaptativa, algunos patrones pueden resultar injustos. Es un riesgo **pendiente de balance** y razón para instrumentar telemetría antes de darlo por terminado.

**Skateplazas:** puntos anclados en el mundo, opcionales, con tutorial corto de salto/recepción y multiplicador de estilo, sin llevar al personaje a vías férreas ni a andenes de servicio. El parkour a pie es actividad separada con superficies aptas y colisiones conscientes. Fallback 2D lateral es presentación del mismo segmento o una instancia de práctica, nunca otra topología.

## 8. Controles y game feel — protocolo de prueba humana

**Meta física ≠ sensación de control.** Un slider perfecto en matemáticas puede ser engorroso en pantalla. Medir: (i) tiempo hasta primer movimiento; (ii) dirección deseada vs. rumbo real; (iii) número de correcciones de timón; (iv) veces que controles se quedan pegados; (v) distancia de detección de colisión; (vi) porcentaje de tiempo en animación utilizable vs. pantalla de carga.

- **Una mano:** joystick virtual reposicionable con zona muerta 0,10–0,15 y respuesta progresiva; acelerador separado solo donde permite expresividad. Presión continua con `pointercapture`, `pointercancel`, pérdida de foco y limpieza al cambiar de modo. Cada botón debe verse activo o no; tamaños táctiles recomendados 44–48 dp.
- **Física tren:** mantener dos controles claros (tracción/freno y puertas) y asistencia no invasiva; signos de movimiento y velocidad visibles; parada con feedback 5–1–0 m. Empezar con perfil "arcade" de ritmo dinámico y perfil técnico opcional. ATP no debe frenar por error de datos de terreno.
- **Bus:** para público general, **acelerar + frenar + dirección asistida**; girar manual en modo avanzado voluntario. El control se traduce a aceleración y steer, no directamente a salto de posición. Distinguir reversa del freno con señal y retardo corto.
- **Runner:** gesto lateral para seleccionar senda válida y tap en salto; también botones grandes; inclinación o giroscopio solo si usuario lo activa. Reacción a giro ≤100 ms tras evento; feedback visual en el mismo frame.
- **Cámara:** arriba o sobre hombro con seguimiento amortiguado y colisión contra fachadas; en primera persona mostrar horizonte y cabina, no pantalla cerrada por HUD; cenital con norte y zoom; panorámica para viajar y contemplar. El cambio de vista jamás reinicia ubicación ni velocidad.

## 9. Cómo hacer un mundo grande con pocos recursos sin bajar la ambición visual

Los gráficos **no deben ser simples**, pero **el detalle debe ser selectivo y creíble**. Polígonos, draw calls, VRAM, escala de texturas y tiempo de shader importan más que la cantidad global de edificios. Arquitectura recomendada sobre el motor WebGL1 existente:

1. **Tres niveles de geometría** por edificio: LOD0 cerca (fachada modular, balcones/ventanas/volumen), LOD1 media distancia (volumen, textura atlas y silueta), LOD2 distancia (silueta + impostor 2D). Cambios con hysteresis para evitar parpadeo.
2. **Instanciar vía CPU / fusionar mallas por región y material** en WebGL1 cuando no exista instancing por extensión. Crear objetos únicos solo para estaciones, puentes y monumentos; las fachadas urbanas son módulos combinados con semillas persistentes. MDN recomienda agrupar llamadas de dibujo.
3. **Chunking** de 128–256 m con cola de generación acotada por frame; caché LRU por presupuestos de memoria medidos, no por número infinito de chunks. Estructuras muy lejanas representan masa urbana, no ventanas individuales.
4. **Atlas 2D y pixel** como parte del material 3D: carteles, puertas, adoquines, manchas de humedad, anuncios no comerciales, señales y texturas de ventanas. Atlas evita cientos de cambios de textura; usar textura albedo + iluminación de vértices / AO precomputado. Evitar texturas externas en modo offline.
5. **Sombras baratas creíbles:** dirección solar compartida, sombras de contacto proyectadas para vehículos/árboles, AO precalculado en esquinas y bajo viaductos. Lluvia con brillo de superficie selectivo, no SSR costoso.
6. **Materiales de Medellín:** mezcla de ladrillo, revoque, hormigón, vidrio, tejados y vegetación en distribución derivada del barrio y altura. Variación por semillas persistentes; no decorar todas las fachadas igual.
7. **Personajes:** animación procedural de caminata/bici/bus + sprites 2D a distancia. NPCs cercanos con 3D y cabeza/ropa modular; rostros creíbles solo a corta distancia con malla de detalle. Evitar modelos ultra densos o inventados por IA con fallos anatómicos.
8. **Rendimiento adaptativo:** mantener 2D, 3D cercano y distancia; reducir distancia/densidad/partículas antes de eliminar geometría clave. Auto DPR 1–2 se usa ya; medir si la calidad cambia bruscamente. El menú "celular modesto" debe seguir siendo jugable, no una versión sin actividades.
9. **Identidad visual:** mezcla profesional de señalética metro, pixel selectivo, jerarquía clara y proporciones ferroviarias; apariencia coherente, no collage genérico de assets.
10. **Ajustes de accesibilidad:** contraste alto, textos legibles al mover cámara, indicaciones redundantes forma/color/sonido, controles reconfigurables, pausa accesible y modo de bajo movimiento.

**Presupuesto inicial orientativo para validación**, no una certificación de hardware: objetivos de 30 fps estables a 412×860 en Android de gama modesta y 60 fps opcionales en escritorio; CPU de simulación <6 ms y render <25 ms en perfil móvil (medir percentil 95); memoria total objetivo <300 MB en teléfonos con memoria limitada, con degradación progresiva. No abrir 100 activos pesados en paralelo. Usar profiler de navegador remoto y contador de draw calls/GPU sin instalar librerías runtime.

## 10. Actividades de ciudad que tienen peso y no son decorado

**Arco ciudadano no lineal**: viajar produce historias; ayudar genera confianza; mantener un servicio mejora frecuencia; un error afecta reputación y demanda local. **No bloquear servicios por reputación.** Las actividades se descubren por proximidad y mapa, y también están en un índice accesible desde inicio.

- **Estaciones:** orientar persona con equipaje, explicar transbordo, medir cola, validar Cívica ficticia, desafío de precisión de detener tren, buscar símbolo de señalización, fotografías de arquitectura.
- **Patios/talleres:** diagnóstico breve de puertas, mantenimiento de ruedas/frenos, baterías/energía, asignación de flota antes de hora pico, recambio de piezas como puzzle razonado.
- **Corredor viaducto:** vista panorámica, fotografía en lugares públicos seguros, contraste entre paisaje y red de movilidad, cruces accesibles.
- **Metrocable:** relatos de barrios, rutas de miradores, gestión de cabinas y contingencias meteorológicas, fotos al amanecer.
- **Cruces tranviarios:** convivencia vial, no obstrucción de rieles, micro-retos de semáforo, prioridad peatonal con reglas verificadas.
- **Bus integrado:** decidir ruta a tiempo, ayudar a transbordar y entender integración; planificación ante desvío temporal.
- **Ciclovía:** carreras arcade y trucos únicamente en segmentos apropiados; observar ruido, biodiversidad urbana y rutas de primer/último kilómetro.
- **Gestión:** demanda simulada, energía, capacidad, horas pico, mantenimiento preventivo; resultados visibles en el Valle y también como panel 2D claro.

**Subtramas** sugeridas, nuevas y familiares: «El último transbordo» (ayudar a una pareja mayor a llegar sin prisa); «El turno del patio» (avería menor antes de apertura); «Voces de la loma» (postal y trayecto de metrocable); «Una ciudad que respira» (comparar ruido de distintos medios sin propaganda); «Cívica perdida» (orientar a usuario sin exponer datos personales); «La ruta del barrio» (ayudar a coordinar bus y tren). Estructura de 3–5 microeventos, 2–8 minutos, inicio/cierre en cualquier orden, diálogo con elección y consecuencia visible. Priorizar una subtrama vertical completamente jugable antes de escribir otras veinte.

**MMO**: ambición de muy largo plazo, no puerta de entrada técnica. Primero mundo offline sólido con NPC y sistemas. Después multijugador opcional 2–4 jugadores en proximidad y sincronización de actividades; más tarde eventos comunitarios asíncronos y, solo si la infraestructura y financiación lo permiten, servidor persistente. Evitar publicidad engañosa de "MMO" si el juego todavía es offline.

## 11. Matriz de aceptación y pruebas reales obligatorias

| ID | Qué hacer | Aprobado cuando | Tipo |
|---|---|---|---|
| A01 | Instalar/abrir offline sin Internet | Ningún 404, 1 HTML y guardado estable | Build + navegador |
| A02 | Primer arranque ▶ Jugar | Ciudad Libre visible y controlable en un toque | E2E móvil |
| A03 | Elegir último nivel de Metro, Cable, Cruce, Carrera y capítulos | Todos se inician sin estrellas, sin alterar estrellas anteriores | Test DOM + E2E |
| A04 | Mantener acelerar 2 s en cada vehículo | Vehículo cambia posición de forma intencional, sin `NaN`, no atascado | Test física + video |
| A05 | Tracción/freno Metro y puertas | 5 itinerarios seguidos con paradas, sin softlock | Test bot + humano |
| A06 | Metroplús volante/Bus | 5 itinerarios con giros, parada, pasajeros y vuelta | Test bot + humano |
| A07 | Runner | Acelera en ≤3 s, esquiva/salta, 10 intentos sin trampas visuales | E2E + prueba humana |
| A08 | Runner geografía | 100 % de ruta por ciclovía comprobada o plaza de práctica conectada | Auditoría GIS |
| A09 | 2D/3D/cámara | Cambiar vistas 20 veces sin modificar posición/velocidad o crear mundo nuevo | Determinismo + capturas |
| A10 | Equivalencia módulo/mundo | Misma simulación y mismo resultado con misma secuencia de entradas | Test integración |
| A11 | móvil 412×860 / 860×412 | HUD nunca tapa pausa, carriles, freno, puerta o lugar | Capturas |
| A12 | teléfono modesto | ≥30 fps p95 por 10 min y sin saltos de más de 100 ms repetidos | Perfil dispositivo |
| A13 | Secuencia 100 sesiones automáticas | Sin excepciones, modo atrapado o guardado inválido | Bot + reporte |
| A14 | Perder foco/pointercancel | Ningún acelerador se queda presionado | E2E táctil |
| A15 | Escenarios educativos | Fuentes y etiquetas diferencian real/ficción, datos de rutas actualizados | Revisión editorial |
| A16 | Población móvil | Nunca aparecen pasajeros dentro de tren/edificio por colisión de capas | Test simulación |
| A17 | Contraste alto, bajo movimiento, audio apagado | Mismo nivel terminable con interfaz alternativa | Accesibilidad |

**Rechazo automático de release:** cualquier modo público que no inicia, 3D con geometría incoherente al cambiar cámara, perdidas de control táctil repetidas, runner de ciclovía etiquetado sin trazado verificado, o "corre en Android" basado exclusivamente en bot headless.

## 12. Plan por fases y dependencias — próximo ciclo

| Fase | Qué entregar, **de verdad** | Dependencia | Indicador de salida |
|---|---|---|---|
| **0 — Integración segura (actual)** | Parche F01–F03; prueba determinista; documento y mensaje IA | Rama propia + revisión otras IAs | PASS Node + CI/Chromium antes de fusionar |
| **1 — Base jugable** | Regresión de cada vehículo, remediar arrancar/frenar/girar, pruebas y tutorial opcional; sincronizar timestep | A01–A07 | 95 % de viajes humanos de muestra sin bloqueo |
| **2 — Unificar experiencias** | `ActivityService`, identidad de entidad, 1 tren + 1 bus + 1 cruce compartidos con Ciudad Libre | Fase 1 | A09/A10 pasan |
| **3 — Ciclovía física y runner** | Datos GIS comprobados, geometría de bifurcaciones/anchos, skateplazas y runner integrado al mundo | Fase 2 + licencias de geodatos | A07/A08 100 % |
| **4 — Mundo vivo y RPG** | Habitantes con destinos, incidencias, 6 tipos de oficio, 1 subtrama completa; acciones repercuten en movilidad | Fases 2–3 | Cada estación elegida ofrece 2 acciones coherentes |
| **5 — Arte 3D/2D/píxel** | Modelos más creíbles, LOD por región, facades/estaciones, árboles, caminos, iluminación y cámara sin saltos | Fases 1–4 + perfiles | A09/A11/A12 |
| **6 — Pulido, pruebas, lanzamiento** | 100 bots, baterías móviles, guardado viejo, accesibilidad, documentación y release | Todas | A01–A17 aprobadas |

No convertir las fases en una nueva excusa para bloquear contenido al jugador: **desde la Fase 1 los modos existentes quedan accesibles**. La tabla corresponde al orden de implementación y verificación de los desarrolladores, no a un sistema de progreso impuesto al jugador.

## 13. Coordinación con Claude/Gemini — evitar conflictos

Se consultaron `docs/COORDINACION-IA.md`, `.ai-coord/estado-antigravity.json`, `.ai-coord/estado-claude.json` y el buzón de noviembre. Claude dejó `97-abierto.js`, `98-relevo-z1.js` y mejoras de UI/carrera; Antigravity hizo auditoría visual a 412×860 y tenía tareas reclamadas previamente. **No modificar estos archivos ni asumir que una reserva caducada autoriza pisar su trabajo.** También existe `docs/entregas/2026-11-19/` con informes extensos de Claude/Codex y Gemini/Antigravity.

**Esta intervención pertenece a una rama propia `ia/openai-gpt6/fluidez-metro-20261122` y solo agrega archivos nuevos.** Solapamientos funcionales para comentar, no machacar:

- Para quien lleve Z1 (HUD/navegación): se desbloqueó la lista `Menu.levels()` y `Menu.storyList()`. Confirmar que el nuevo orden de envolturas no choque con sus cambios futuros.
- Para quien lleve Z2 (game feel/carrera): se solucionó aceleración normal, **NO** ciclovías ni balance de obstáculos a mayor velocidad. No reemplazar esta aceleración sin una prueba de tres segundos y feedback humano.
- Para quien lleve Z3/Z4/Z5 (historia/puente Motor City/territorio): usar `ActivityService` propuesto y trazabilidad GIS; recordar que el autor anuló migración completa al motor externo 4.5.
- Cualquier IA que quiera tocar este módulo debe revisar el buzón y abrir una PR hacia su propia rama, con evidencia de tests y explicación de compatibilidad, no hacer force push.

**Estado de la entrega, para futuros agentes:** tres fallos corregidos por parche, test Node aislado en verde, documento comparativo completo; sin prueba Chromium ni dispositivos todavía, sin ciclovías listas, sin mapa 3D fotorrealista, sin equivalencia general demostrada, sin MMO. Lo no hecho no se marcará como hecho.

---

## 14. Lista de trabajo accionable por archivo

**P0 ahora:** `tools/test.mjs` ejecutar 100 corridas; `65-menu.js` revisar integración con wrapper; `30-conduce.js` y `32-volante.js` pruebas reales de cámara; `47-carrera.js` paso acelerado y colisiones; `src/data/ciclovias.js` nueva fuente geográfica con atribución; `tests` de equivalencia mundo/módulo.

**P1 siguiente:** `25-game.js` fixed timestep y profiling; `22-gl.js` mallas regionales/LOD sin recrear mundos; `36-libre.js` `ActivityService` con semilla, lugar y retorno; `35-ciudad.js` entidad persistente; `38-bus.js` / `32-volante.js` unificar control del mismo bus; `45-metroplus.js` activación desde cruces reales; `27-camara.js` continuidad de cámara (oclusiones, recortes y sensibilidad).

**P2 posterior:** `70-historia.js`, `37-trama.js`, `39-gente.js` subtramas/actividades; `src/assets/` atlas mejorados; `arte/` modelos y comparación de LOD; `docs` documentación final.

**Conclusión:** el potencial del juego no está en añadir cincuenta títulos de modo, sino en hacer que cada metro del mapa tenga sentido y que la física responda a la intención del jugador. Primero fluidez y equivalencia; después la geografía jugable; finalmente detalle y vida. Un mundo único es una promesa técnica que se prueba, no un botón de cámara.