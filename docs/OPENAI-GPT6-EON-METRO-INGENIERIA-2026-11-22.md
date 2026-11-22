# OPENAI GPT-6 · EÓN — EL METRO: Auditoría de ingeniería, correcciones y plan maestro de evolución arcade
**Fecha:** 22 de noviembre de 2026  
**Autor de esta entrega:** OpenAI GPT-6 · Eón  
**Único repositorio modificable:** https://github.com/juanfeliperico369-stack/MetroZero  
**Rama de trabajo:** ia/openai-gpt6-eon/manejo-modos-20261122  
**Estado:** auditoría técnica y dos correcciones aditivas comprobadas con pruebas aisladas; integración completa y pruebas E2E pendientes.

> Este documento es autónomo: presenta diagnóstico, conceptos de diseño, arquitectura, correcciones, matriz de experiencias, inspiración, plan de implementación, criterios de aceptación y traspaso entre IAs. Complementa —no reemplaza ni sobrescribe— el informe de 6.375 palabras de la PR #3, docs/OPENAI-GPT6-METRO-AUDITORIA-2026-11-22.md. No declara como realizado lo que todavía no está validado. Ningún otro repositorio ha sido modificado.

## 1. Norte del proyecto: qué videojuego estamos construyendo

**El Metro es un videojuego arcade, de mundo abierto, apto para todo público, sobre el Valle de Aburrá y la experiencia humana de su movilidad.** Debe permitir caminar, observar, orientar pasajeros, conducir vehículos del sistema, operar tráfico, resolver desafíos, realizar oficios y descubrir historias. La diversión es la puerta de entrada; el aprendizaje y la contemplación son recompensas, no lecciones obligatorias.

**Mandamientos del diseño**
1. El botón principal abre Ciudad Libre en un toque; tutorial e historia son voluntarios.
2. Todos los módulos y capítulos se pueden probar desde el principio. Estrellas y reputación registran logros: no bloquean interfaces.
3. Todo desafío disponible desde un menú debe poder activarse desde su ubicación correspondiente en el mundo y ejecutar las **mismas reglas, física, resultados y recompensas**.
4. Un solo sistema de coordenadas, edificios, vías, alturas y entidades. Cenital, isométrico, panorámica, primera y tercera persona son representaciones del mismo mundo. Pixel-art y 2D son estilos de representación, capas materiales y perspectivas de actividad, no mundos independientes.
5. Manejar tiene que ser inteligible, ágil y justo: acelerar produce avance visible, las cámaras se orientan bien, los controles táctiles se sueltan, los choques se explican y cada reto ofrece salida.
6. Respetar la geografía y la infraestructura real, señalando qué partes son licencia arcade. No confundir una vía paralela al metro con una ciclovía.
7. El juego debe ser íntegramente utilizable sin conexión, en un solo HTML compilado, sin dependencia de un servidor MMO obligatorio.
8. Mantener el motor propio del repositorio, su guardado elmetro.v1 y su identidad familiar. Motor City sirve como caja de herramientas para portar ideas puntuales.

**Meta del diseño**: que el jugador pueda decir “Hoy recorrí Medellín, ayudé a una persona a hacer transbordo, reparé un problema de frecuencia, manejé un tren, vi llover desde el cable y encontré algo que no sabía del lugar”, sin necesitar haber completado un capítulo.

## 2. Material revisado y coordinación

La estructura actual contiene el mundo y sus datos en src/data/valle.js, ciudad.js, edificios.js, vias.js, encicla.js y red.js; las capas de representación en 10-map.js, 21-sprites.js, 22-gl.js, 23-lado.js y 24-iso.js; el bucle general en 25-game.js; módulos ferroviario, vial, mundo libre, bus, cable y runner en 30-conduce.js, 32-volante.js, 36-libre.js, 38-bus.js, 47-carrera.js y 52-cableviaje.js; menú, tutorial e integración en 65-menu.js, 69-tutorial.js, 97-abierto.js y 98-relevo-z1.js. El bot y las regresiones base están en 90-bot.js y tools/test.mjs.

**Coordinación multi-IA (GitHub, no promesas de sincronía):**
- Issue #2: https://github.com/juanfeliperico369-stack/MetroZero/issues/2
- PR #3, otra instancia OpenAI GPT-6: https://github.com/juanfeliperico369-stack/MetroZero/pull/3 — desbloquea niveles y capítulos, corrige ciclos de cámaras de teclado y acelera runner. Todavía sin fusionar en el momento de esta auditoría.
- Claude: informes de Motor City 4.5 y relevo previo de Z1 y Z2 en docs/INFORME-MOTOR-CITY-4.5.md y .ai-coord/.
- Gemini/Antigravity: auditorías anteriores de interfaz, modo libre, narrativas y zonas asignadas; consultar estado antes de fusionar.
- La rama de Eón añade solo nombres de archivo nuevos; evita editar 98-relevo-z1.js, 98a-openai-gpt6-fluidez.js, el motor, mapas compartidos y save.

Otros repositorios consultados **solo como referencias**: motorcity (optimización, efectos, cámaras, física), BicicletasUno (cobertura del Valle, estaciones, movilidad en bici) y RunRunZero (lógica de micromovilidad y runner). El juego UnoCero es referencia narrativa cuando se componga una antología de crónicas, sin copiar su código ni su contenido sin una revisión.

## 3. Hallazgos y severidad

| ID | Hallazgo comprobado en código | Impacto | Acción |
|---|---|---|---|
| P0-01 | En 47-carrera.js el runner sigue NET.byId de A/B/T/MP1/MP2/MPO, no un grafo verificado de ciclovías | La actividad incumple el recorrido exigido y crea asociaciones espaciales engañosas | **Bloqueante pendiente**, nueva capa GIS ciclista con direcciones |
| P0-02 | El Bus usa Libre.drive, pero Al volante posee otro integrador y colisión sobre casillas de 20 m | Respuesta desigual y riesgo de atasco por geometría gruesa | Rescate conservador **implementado en esta rama**; unificación física **pendiente** |
| P0-03 | Un modo cerrado crea su estado independiente del mundo libre | No garantiza misma experiencia en ambos accesos | Diseñar ActivityService y una entidad única, migración por etapas |
| P0-04 | Los modos arrancan bajo pasos de tiempo distintos y algunos carecen de substeps fijos | Progresión y precisión distintas con FPS variables | Acumulador físico fijo por entidad, benchmark 30/60 FPS |
| P1-01 | Runner acelera solo 0,12 m/s² en main y su AI lee 9 m | Aceleración lenta y decisiones tardías | Aceleración implementada por **PR #3**; anticipación del bot **implementada en esta rama** |
| P1-02 | Al volante frena en seco contra cualquier superficie sólida detectada en las 5 muestras del bus articulado | Un giro junto a una manzana puede detenerlo completamente | Recuperación protegida y aceleración inicial moderada en esta rama; corregir origen de colisión después |
| P1-03 | Subidas, cámara y control usan convenciones por módulo | Sensación de juego inconsistente | Tabla de acciones y cámaras compartidas, especificación de accesibilidad |
| P1-04 | Datos de ciclovías y estaciones EnCicla no son equivalentes | Fallos de accesibilidad y sentido | Extraer grafo con procedencia y validación manual; no inventar enlaces |
| P2-01 | Modo vista pixel y panorámica no prueban por contrato que compartan posición del objeto 3D | Riesgo de mundos aparentes diferentes | Transformaciones puras de WorldPosition y pruebas de paridad |
| P2-02 | Paisaje y edificios densos implican presión sobre WebGL móvil | Tirones, consumo energético, pérdida de respuesta | PerfHUD y telemetría p50/p95/p99, PVS/LOD/atlases antes de efectos |
| P2-03 | Story, NPC y gestión todavía se desarrollan como sistemas parciales | Menor profundidad RPG | Subtramas localizadas, consecuencias pequeñas pero persistentes |
| P2-04 | Demo MMO sugerida no es un servicio multijugador real | Deuda técnica si exige servidor y rompe offline | RPG vivo offline primero; multijugador optativo y local por separado |

**Hallazgo esencial:** un botón que funciona o 100 partidas automáticas sin excepciones no prueban que una actividad sea agradable o que un humano pueda completarla. El bot actual valida bastante bien estados finitos, pero debe medir progreso real, claridad visual y control sostenido por personas.

## 4. Trabajo de código de esta rama: delimitación exacta

**Archivos nuevos**
- src/js/98b-openai-gpt6-eon-manejo.js — módulo aditivo, cargado después de 98a y antes de 99-boot por orden alfabético.
- tools/test-gpt6-eon-manejo.mjs — pruebas de comportamiento con mocks Node.
- Este documento.
- .ai-coord/estado-openai-gpt6-eon.json y mensaje append-only al buzón de agentes.

**Al volante:**
- Si en modo marcha se intenta acelerar pero no hay desplazamiento durante 2,6 s, busca candidatos 4–16 m más adelante sobre la MISMA polilínea.
- Rechaza el rescate cerca de la próxima parada, ante un semáforo, dentro de edificios, montañas, agua o superficies sólidas, y cuando la ruta no existe.
- Revisa diversos puntos del chasis articulado, conserva vehículo/rumbo y muestra un aviso de recolocación. No inventa una ruta, no concede estrellas, no salta una estación válida.
- Atajo R solamente tras indicios de bloqueo. Teclas anteriores se delegan al controlador original.
- Aceleración base del articulado pasa al menos a 1,35 y alimentador a 1,55 (unidades internas del motor). La velocidad máxima original permanece intacta. Estas cifras son ajuste de game feel **por contrastar en móvil**.
- Es una protección contra atasco; **no reemplaza** el arreglo estructural del collider ni prueba que todas las rutas sean practicables.

**Runner:**
- El piloto automático ahora consulta la ventana ya indexada (crVentana), no busca en el conjunto completo de obstáculos.
- Evalúa una distancia de anticipación dependiente de velocidad (hasta 42 m), comprueba carriles libres y usa el salto para obstáculos bajos.
- Conserva invulnerabilidad, turbo, cambio de vehículo, puntuación y lógica original del jugador. No reescribe la velocidad modificada por la PR #3.
- **Pendiente:** ruta real sobre ciclovía; el cambio de IA no convierte NET A/B/T/MP en senderos ciclistas.

**Resultados de la prueba aislada ejecutada en Node:** PASS en detección de atascos, respeto de semáforos, respeto de paradas, ausencia de teletransporte a sólidos, aumento de aceleración, anticipación de obstáculo alto, salto de obstáculo bajo, turbo y conservación del teclado. La prueba no carga el mapa de Medellín ni renderiza WebGL: no es una afirmación de E2E superado.

## 5. Cómo debe funcionar el mundo único

Modelo propuesto sin sustituir de golpe el motor:

1. **WorldData**: WorldPoint en metros con x este, y sur, altura z; polígonos y mallas de edificios; polilíneas de redes: riel, vía pública, ciclorruta certificada, andén, sendero y teleférico. Cada segmento incluye tipo, sentido, restricción, ancho real/ficticio, fuente y fecha de validación.
2. **WorldState**: hora, clima, semáforos, pasajeros cercanos, incidentes, vehículos de ID estable, actividades activas, objetos coleccionados y zonas cargadas.
3. **MovementSystem**: mover a pie, ciclo, bus, metro, cable; perfiles con máximo, aceleración, frenado, giro, masa aparente y asistencia. No replicar conductores separados para libre y cerrado.
4. **ActivityService**: registrar un reto en el mundo y en el menú. Ambos disparan la misma instancia o la misma clase de simulación con idéntica semilla y un WorldEntityRef; solo cambia la cámara y, cuando aplique, el HUD.
5. **CameraRig**: transformar el WorldPoint único mediante top, perspectiva cenital oblicua, isométrica 2:1, primera, tercera, panorámica de recorrido, lateral y pixel. Un cambio de vista nunca genera una segunda ciudad.
6. **RenderSystem**: geometría y materiales 3D cerca; sprites y calcomanías 2D a media distancia; elementos pixel para señalización o modos específicamente diseñados como puzles, no para esconder falta de geometría. El fallback 2D renderiza los mismos objetos del WorldState.
7. **Persistence**: guardar únicamente cambios relevantes e IDs, no millones de peatones. Mantener elmetro.v1; ampliar campos mediante Save.sanitize y migración compatible.

**Contrato verificable para una misma actividad:** si la misión de paradas comienza desde el menú o al subirse a una cabina de la estación A y recibe idénticas entradas en idénticos pasos, velocidad, posición, confort, pasajeros, puntuación y fin deben coincidir dentro de tolerancias documentadas. La posición final tiene que quedar reflejada en Ciudad Libre. Probar también ida y vuelta de cámara con el vehículo en movimiento.

**Migración compatible:** empezar con el bus que hoy usa Libre.drive, extraer el controlador común; luego alinear Al volante; después Conduce/ferroviario; por último recreativas, rompecabezas y actividades. No intentar reescribir todo el juego en una sola PR.

## 6. Cámaras: de bonito a coherente

| Vista | Uso recomendado | Reglas de coherencia |
|---|---|---|
| 3D cenital alto | Mapa legible, planificación, supervisión, exploración | Norte arriba opcional; estaciones y rutas legibles, edificios ocultables sin cambiar colisiones |
| Cenital 3/4 | Mundo abierto estilo arcade, caminata y bus | Seguimiento amortiguado, mirada adelantada, zoom por velocidad sin desorientar |
| Isométrica 2:1 | Maqueta urbana, puzles, panorámica de barrios | Proyección matemática de la misma geometría, no otro mosaico de ciudad |
| Primera persona | Cabina, viaje, paseo a pie | Ojos físicamente situados; clipping en interiores; cabeza/horizonte coherentes |
| Tercera persona | Bicicleta, skate, paseo, bus | Cámara evita paredes con raycast y acorta brazo si hay oclusión |
| Panorámica | Tren, cable, contemplación | Cámara sigue distancia s sobre vía real y compone valle por profundidad; no cambia trazado |
| 2D lateral | Train Chu/Tiny Rails, tramo de mantenimiento, saltos | Construir el perfil desde las estaciones y el terreno del mismo corredor |
| 2D frontal | Selector de andenes, taquilla Cívica, rompecabezas | Elementos UI interactivos anclados al lugar físico |
| Pixel world | Interiores retro, recuerdo histórico, reto de estrategia | Pixelado como shader/atlas y perspectiva; misma ciudad lógica |
| Dron/foto | Descubrimiento, arquitectura, paisaje | Cámaras con límites y colisiones; sin “teletransporte” del personaje |

**Regla para arte “más realista”:** alto realismo perceptual no exige geometría densa en toda la ciudad. Importa silueta fiel de metro/cable, materiales diferenciados, iluminación y profundidad creíbles, proporciones y orientación correctas, gestos y sonidos sincronizados. Los objetos cercanos demandan detalle; los lejanos requieren masas y colores convincentes.

## 7. Equilibrio físico: precisión sin castigar el tiempo real

Adoptar perfiles de juego, no un “realismo” universal: Servicio (prioriza confort), Arcade (respuesta rápida), Zen (viaje contemplativo), Escuela (más información), Destreza (control total). Misma base de mundo; diferente interfaz y asistencia.

- Metro: tracción en 3–4 posiciones, frenado anticipado, andén visible, señal predecible; pasos físicos estables; opción ×2–×3 solo en tramos seguros, detener multiplicación cerca de estaciones.
- Metroplús/articulado: volante asistido por defecto; dirección manual opcional; radio de giro del remolque; aceleración inicial clara; no atascarse por casilla cartográfica; semáforos y paradas tienen prioridad.
- Bici: aceleración suave, freno capaz, inclinación virtual opcional, ajustes de sensibilidad por dispositivo. Los parámetros reales de Ciudad Libre (bicicleta 30 km/h máx., scooter 25 km/h) difieren significativamente de la carrera que puede mostrar 70–85 km/h. Resolver con **escala arcade de percepción** (FOV, partículas, textura, ritmo de obstáculos) y un perfil de velocidad razonable antes de llamar “realista” a un vehículo de micromovilidad.
- Runner: evitar 3 carriles físicos si la ciclorruta tiene 1 carril. Distinguir zonas de maniobra, sentidos, cruces, intersecciones, plazas de trucos y ramales; cada transición comunica la nueva regla con tiempo suficiente para reaccionar.
- Visión del jugador: desde que el peligro se reconoce hasta que colisiona debe haber, como punto de partida a validar, ≥1,5 s en dificultad normal; señal clara y latencia de mando baja. El cálculo de 9 m a 20 m/s equivale a 0,45 s y es insuficiente para táctil ordinario.
- Controles: acelerador sostenido/graduable; freno siempre accesible; botón de pausa en área segura; sensibilidad constante entre vistas; botones táctiles ≥44–48 puntos CSS como referencia de diseño; soporte de teclado sin necesidad de sensor.
- Recuperación: si se atasca el bus o alguien se cae en un hueco gráfico, el sistema ofrece acción de rescate **sin penalización arbitraria**, pero nunca hace trampa en una parada o un semáforo.

**Nota:** estas cifras son hipótesis de diseño y criterios propuestos; validarlas mediante pruebas humanas, no presentarlas como mediciones actuales.

## 8. Matriz de modos: qué significa “completo y jugable”

| Actividad | Dónde aparece en mundo libre | Bucle jugable | Aprendizaje / curiosidad | Criterio de terminado |
|---|---|---|---|---|
| Conducir Línea A/B | Cabinas y patio-taller | Puesta en marcha, velocidad, parada, puertas, retorno | Señales, estaciones, orientación | 5/5 viajes manuales sin atasco |
| Tranvía Ayacucho | Parada/depósito del corredor T | Tracción, cruces, servicio | Convivencia vial y patrimonio | Arrancar, detenerse y completar |
| Metroplús y alimentadores | Cabina/paradero real | Conducir, detenerse, abordar, cobrar, confort | Intermodalidad, accesibilidad | 5/5 recorridos completos por humano |
| Metrocable | Estaciones y miradores | Operar cabinas, viento, seguridad, paseo | Topografía y vida de ladera | Misión y regreso funcionales |
| Puesto de control | Control ferroviario/patio | Despachar, cambiar agujas, prevenir conflictos | Frecuencia y seguridad de red | Tableros resolubles, feedback de causa |
| Semáforos tipo Traffix | Cruce de Metroplús/tranvía verificado | Control simple de fase, colas, prioridad | Cómo una intersección afecta a otros | 10 niveles sin conflicto imposible |
| Planificación de red | Mesa de operaciones de estación | Capacidad, presupuesto, frecuencias, incidencias | Demanda y decisiones de transporte | Consecuencias visibles, sin bloquear mundo |
| Encomiendas tipo Package Inc | Bodega/estación | Clasificar, sincronizar transbordos, puntualidad | Logística ciudadana | 10 misiones con soluciones múltiples |
| Orientar pasajeros | NPC real en estación | Elegir ruta/transbordos, accesibilidad | Geografía real del Valle | Destinos y conexiones comprobados |
| Carrera de ciclovía / parkour | Entrada al corredor ciclista y skateplaza | Desvíos, obstáculos, trucos, contrarreloj | Movilidad sostenible y seguridad | Red GIS válida y 10 carreras justas |
| Descubrimiento / foto | Parques, miradores, barrios | Postales, relatos, visitas | Historia y arquitectura | Persistencia y foto sin ruptura |
| Oficios y mantenimiento | Taller, estación, sede/operación | Reparar, ayudar, priorizar recursos | Función de cada oficio | Incidencia afecta servicio local |
| Crónicas RPG | Personajes en lugares concretos | Escuchar, decidir, acompañar, reencontrar | Memoria barrial y empatía | Misión opcional, elección y consecuencia |
| Roguelite de incidentes | Central de operaciones | Sesión de 5–10 min, eventos variables, resolver | Trade-offs y resiliencia de una red | Reiniciar sin cerrar contenido base |

Los modos de acción y estrategia deben evitar superponer mecánicas ajenas a la temática. No hacen falta armas, crimen, guerras ni fantasías de destrucción masiva para aprender de GTA, Bullet Echo, Missiles o Solar Smash: se pueden extraer legibilidad, intensidad, escala, IA o curvas de tensión y adaptar **solo lo compatible** con el transporte urbano familiar.

## 9. Referencias comparadas y traducción útil al proyecto

| Referencia | Técnica o sensación aprovechable | Integración razonable | No importar |
|---|---|---|---|
| **Super Arcade Racing** | Giro/derrape comprensibles, pistas cortas, cámara cenital, pixel detallado | Retos de control de metrobus y circuitos seguros | Ilegalidad vial/derrapes en pasajeros |
| GTA 1, 2, London y Chinatown Wars | Ciudad compacta legible, historias por distrito, cámara aérea, interacción táctil | Misiones por barrios y objetos útiles en mundo realista | Delitos y violencia como recompensa |
| Railways / Train Conductor / Traffix | Una decisión de vía/señal causa efecto inmediato | Agujas, convoyes y cruces con prioridad visual | Tocar controles no relacionados con el tablero |
| Package Inc / Infinity Loop / Laser / Maze | Flujo lógico, causas visibles y rompecabezas breves | Encomiendas, energía de estaciones, rutas accesibles | Puzles arbitrarios sin relación con movilidad |
| Mini Metro / Mini Motorways / CityRT | Repartir capacidad, conexiones, crecimiento y cuellos | Puesto de control de red en escenarios realistas | Cambiar arbitrariamente trazados reales |
| Tiny Rails / Train Chu | Viaje 2D lateral divertido, progreso de tramo | Perfil lateral del metro existente, vagón detallado | Construir otro mapa incompatible |
| #DRIVE, PAKO 2/Forever/3, Getaway, Reckless Getaway | Velocidad legible, control simple, sorpresa y reinicio breve | Retos de destreza y micromovilidad en áreas seguras | Policías/persecuciones como eje del servicio |
| Forza Horizon / NFS / APEX / FR Legends | Cámara dinámica, sonido, tuning, sensación de adherencia | Personalización del HUD, taller de vehículos, fotomodo | Velocidad de superdeportivo para bus urbano |
| Alto's Odyssey / Sky | Flujo, paisaje, calma y descubrimiento | Cable al atardecer, visitas, recompensas no monetarias | Obligar a pasar un reto para contemplar |
| Townscaper / TheoTown / Cities: Skylines / SimCity | Lógica visual del paisaje y consecuencias de gestión | Maqueta de barrios y escenario de planificación | Deformar ciudad real sin indicar simulación |
| The Sims / idle tycoon / The Bonfire | Rutinas diarias, necesidades y pequeños encargos | Oficios, flota, comercios y turnos de usuarios | Esperas artificiales para monetizar |
| 911 Operator | Mapa, despacho, recursos y decisiones ante incidentes | Centro de operaciones para lluvias, fallas, accesibilidad | Emergencias violentas/gráficas |
| Vector / SkateSpace / Shadow Fight | Animación expresiva, precisión de saltos, combos | Trucos y parkour en skateplaza conectada a ciclovía | Combate como actividad central |
| Little Nightmares / Monument Valley | Encuadre, profundidad, descubrimiento visual, un puzzle memorable | Recorridos de estación, laberintos de conexiones | Terror o ambigüedad espacial que rompa orientación |
| WorldBox / Solar Smash / Spaceflight Simulator / vuelo 3D | Escala visual, cámara libre, mapas legibles, reglas sistémicas | Dron educativo del Valle, clima/relieve, red aérea de cable | Destrucción de la ciudad como diversión |
| Bullet Echo / 1945 Air Force / Missiles | Claridad cenital, anticipación, ritmo, objetos y control de distancias | Desafíos de mensajería/prevención, avión de papel de feria, dron pacífico | Armas en un juego familiar |
| UnoCero (proyecto del autor) | Narración, identidad, personaje y ramificación | Crónicas y encuentros barriales nuevos | Copiar directamente sin adaptar la agencia |

**Límite de la investigación:** se han contrastado descripciones públicas y material técnico del proyecto. No se ha afirmado haber jugado personalmente cada videojuego de las referencias en Android/PC. Para decisiones finas de manejo, las pruebas con jugadores son más informativas que las fichas de tienda.

## 10. Runner exclusivamente en ciclovías: especificación geoespacial

Este es el principal bloqueante conceptual. Actualmente cr:A/cr:B/cr:T/cr:MP* recorre NET.byId de transporte masivo, y un desplazamiento lateral de 13 m en línea A no acredita que haya ciclovía.

**Modelo de datos mínimo para src/data/ciclovias.js:**
- id estable, source_id, fecha y licencia, geometría [x,y,z] y distancias acumuladas;
- tipo: físicamente segregada / carril integrado / camino compartido / ciclocalle designada / arcade ficticia;
- sentido permitido, cruces, conectividad, accesos para cada tipo de vehículo, ancho real y tratamiento de peatones;
- segmento vecino izquierdo/derecho, obstáculos plausibles, plaza de trucos e intersección semaforizada;
- indicador certeza (verificado en fuente + revisión local, pendiente, solo jugable ficticio).

**Extracción y validación:**
1. Identificar OpenStreetMap: highway=cycleway, highway=path + bicycle=designated, vías con cycleway:left/right/both y sus reglas de oneway:bicycle. Consultar también fuentes oficiales de ciclorrutas, sin asumir que todos los senderos son aptos.
2. Transformar coordenadas geográficas al mismo sistema geoM del juego; conservar OSM ID/fuente/licencia.
3. Cortar polilíneas en intersecciones, resolver sentido y accesos, eliminar saltos cartográficos irreales y puentes sin conexión.
4. Revisar visualmente las primeras rutas con el mapa; separar carriles reales de **carriles de maniobra arcade**.
5. Construir eventos de carrera por distancia s en el grafo, no por distancia sobre la Línea A. Abrir ramas en cruces, estrechar o ensanchar área jugable, diferenciar subida, descenso y peraltes.
6. Usar la misma infraestructura con ciclistas/NPC en Ciudad Libre. Entrar en corredor desde el mundo libre inicia la misma actividad runner; salir vuelve al mismo punto y posición.
7. Añadir test: toda muestra de recorrido en intervalo regular pertenece a un segmento clasificado apto; ninguna transición cruza calle sin cruce explícito; el signo de dirección coincide con la red; no hay rieles atravesados.
8. Modelar skateplazas, parques y parkour **solo en zonas apropiadas** conectadas a la ciclovía, con límites de velocidad y señalización.

El TT.CICLO de la grilla de 20 metros es una ayuda visual, **no un trazado exacto con accesos/direccionales ni ancho legal**. La lista ENCICLA contiene estaciones de préstamo, no caminos entre ellas. No declarar solucionado este requisito hasta superar el validador geométrico.

## 11. Un mundo vivo sin una CPU imposible

**Sistema RPG de cercanía y densidad variable**
- 0–80 m: peatones con posiciones explícitas, cruces y conversaciones, pocos vehículos con física detallada, colisiones continuas y sonido.
- 80–350 m: automóviles y pasajeros con trayectorias simplificadas, menos animación, interacciones representadas por eventos.
- 350 m–horizonte: demanda de transporte agregada por estación/comuna y hora; fachadas/árboles instanciados o convertidos a impostores, luces por sectores.
- Fuera de la región: un scheduler de eventos y cantidades, no agentes individuales ni draw calls.
- Semillas deterministas por barrio y tiempo del juego: mismo barrio se reconoce tras regresar, sin mantener miles de objetos en RAM.

**Subtramas con consecuencias visibles y verosímiles**
1. Un usuario perdió el transbordo: resolver ruta, luego reaparece agradeciendo; mejora confianza de estación.
2. Taller de Niquía pide una pieza: entregar por corredor permitido; un tren regresa a servicio.
3. Día de aguacero: redistribuir pasajeros y orientar refugios sin romper reglas de acceso.
4. Persona que aprende a usar Cívica: puzzle de pago/transbordo, luego enseña a otra.
5. Exposición histórica en un vagón: fotografías comparadas de ayer/hoy y voz de antiguos usuarios.
6. Músico de estación: recuperar horarios para una presentación autorizada, unlock de melodía original.
7. Ruta accesible: ayudar a alguien a usar ascensor y conexión con información correcta.
8. Guía de mirador: encontrar perspectivas de laderas, barrio y arquitectura; desbloquear filtro fotográfico.
9. Feria de movilidad: demostración de circuitos seguros de bici/skate y prevención de choques.
10. Administradora de flota: decidir qué vehículos mantener, qué rutas reforzar y medir satisfacción.

**RPG no es MMO:** reputación de barrios, oficios, NPC con memoria y elecciones funcionan offline. MMO real significaría infraestructura de red, persistencia compartida, moderación y costes; dejarlo como extensión posterior opcional, no como requisito que bloquee el mundo libre.

**Roguelite**: central de operaciones con un turno autoconclusivo, eventos semi-aleatorios (avería, lluvia, saturación, desvío), 2–3 mejoras temporales y puntuación; jamás bloquear vías reales del juego fuera de ese turno ni perder progreso del mundo abierto.

## 12. Arte 3D, 2D y pixel: sistema unificado y realismo eficaz

**Orden recomendado de inversión visual**
1. Siluetas fieles: trenes A/B, tranvía, articulado, alimentador, cable y cubiertas de estaciones. Proporciones, puertas, colores y ancho por encima de polígonos.
2. Materiales: vidrio con reflejo discreto, metal pintado, concreto, baldosa, ladrillo, teja, vegetación, humedad y cartelería legible.
3. Iluminación: cielo por hora, oclusión ambiente horneada en elementos estáticos, sombra cercana del vehículo, luces funcionales de noche.
4. Terreno: relieve creíble a distancia, laderas con densidad de construcción por comuna, quebradas y río con continuidad visual.
5. VFX suaves: chispas de pantógrafo, frenada, lluvia, puertas, sombra de cable, reflejos de charcos; nada de explosiones violentas.
6. Personajes: ciclos de andar, abordar, mirar y saludar; distancia de animación adaptable; animación facial solo en primer plano.
7. 2D: atlas para señalética, marquesinas, UI, minimapas, ventanas y carteles, texturas de fachadas y perspectiva lateral.
8. Pixel: resolución de arte definida por modo (por ejemplo tiles de 16/32 px), escala entera para pixel limpio, colores limitados con iluminación por LUT; no mezclar píxel borroso con texto fino.

**Técnicas prácticas para HTML único**
- Combinar mallas y materiales repetidos, instanciar postes/árboles, atlas de 2D/sprites, mips y LOD 0/1/2. Disminuir draw calls antes de bajar detalle crítico.
- Hornear sombras/oclusiones de arte estático, limitar sombras dinámicas por alcance y evitar transparencias en capas masivas.
- Frustum culling y PVS por corredores/calles; no enviar a GPU edificios que ocultan otros edificios si pueden excluirse sin errores.
- Chunk cache con política LRU; generar datos por barrio bajo presupuesto por cuadro; si se usan Web Workers, transferencia de buffers sin duplicación innecesaria.
- Pixel ratio dinámico y presupuestos de VRAM por dispositivo: no multiplicar resoluciones por defecto cuando la carga de GPU supera objetivo.
- Modelos por pieza principal de silueta + detalle cercano; texturas comprimidas cuando WebGL ofrece extensión apropiada, fallback seguro.
- El mismo mesh 3D proyectado a cenital o tercera, y el mismo sprite 2D puede ser una textura del objeto, un impostor o una capa de UI; NO generar mapas alternativos para cada vista.
- Conservar identidad de objetos a través de LOD: una estación de Metro no puede cambiar de forma o salir de sitio al acercar la cámara.

**Medición, no adivinación:** recoger p50/p95/p99 de frame, CPU simulación, GPU dibujo si está disponible, recuento de entidades/chunks/draw calls, tiempo de carga, tamaño final de HTML y memoria aproximada. El juego original incluye paquetes de datos importantes, pero aquí **no se midió** un peso final compilado; cualquier número exacto sería una invención.

## 13. Rendimiento, determinismo, accesibilidad y calidad

**Presupuestos propuestos** (no resultados):
- Celular modesto: buscar 30 FPS estables, p95 del cuadro ≤33,3 ms tras cargar zona; opcional 60 FPS en teléfonos capaces.
- Juego reactivo: primer input visible en ≤100–150 ms percibidos; muestrear latencias con video a cámara lenta.
- Simulación: paso fijo 1/60 s y límite de 4–6 pasos de recuperación para evitar espiral de muerte; si hay carga, bajar render/densidad, nunca duplicar kilómetros por saltos de tiempo.
- Cargas de chunk: distribuir su generación entre cuadros; no congelar controles mientras entra una zona nueva.
- Táctil: pruebas 412×860 y 860×412, controles separados de cámara, barra de tarea y área segura, pointercancel/lostpointercapture en todos los mandos.
- Accesibilidad: paleta apta para daltonismo con símbolos, subtítulos para audio, opción de reducir movimiento y flashes, tamaño legible, control asistido, reasignación futura de botones.
- Fallback 2D: sin WebGL no se elimina la jugabilidad, solo el renderer complejo; los resultados deben coincidir.

**Banco de pruebas mínimo obligatorio**
- Arranque en modo offline y con un guardado elmetro.v1 de versiones anteriores.
- Abre primer nivel, último nivel, primer capítulo y último capítulo sin estrellas.
- Tren A, B y tranvía T: 5 viajes manuales por corredor; primera↔tercera↔cenital↔panorámica sin pérdida de posición.
- Articulado y alimentador: 5 arranques, 5 maniobras de esquina, 5 paradas con puertas, 5 tramos con subida y 5 itinerarios completos. Registrar cada atasco y tiempo de recuperación.
- Runner: 10 sesiones táctiles de 2 min sobre geometría ciclista validada; 0 choques “sin aviso”, sentido correcto, obstáculos visibles ≥1,5 s, pruebas de salto y cambios de dirección.
- Control de semáforo: estado de cada cruce concuerda con señal visual; ningún rescate salta un rojo.
- Libre: 3 zonas urbanas, 2 de ladera, 1 de cable, 1 de lluvia, 1 nocturna; volver al mismo lugar tras un modo.
- Rendimiento: fijar rutas, seeds, calidad, número de NPC; comparar antes/después sin cambiar simultáneamente todas las variables.
- Integración: mismo modo, misma seed, mismas entradas → iguales resultados en libre y cerrado; priorizar fidelidad de reglas.
- Seguridad: sin contenido de otra franquicia copiado, sin referencias externas en HTML offline y sin claves nuevas.

**Ejecutar antes de fusionar/publicar** (por equipo con Node y Playwright, Playwright Chromium instalado):
1. node tools/build.mjs
2. node tools/test-gpt6-eon-manejo.mjs
3. node tools/test-gpt6-fluidez.mjs  (solo después de integrar la PR #3)
4. node tools/test.mjs 100
5. Revisión manual con interacción física/táctil en Android e iOS.

## 14. Hoja de ruta ejecutable por etapas (dependencias y entregables)

| Etapa | Prioridad | Entrega pequeña verificable | Dependencia / puerta de salida |
|---|---|---|---|
| **E0** Coordinación / baseline | Hoy | Revisar Issue #2 y PRs, medir pesos y 30/60 FPS, reporte de bloqueos por modo | Bot en verde + video táctil |
| **E1** Primeros arreglos jugables | P0 | Integrar PR #3 tras revisar, activar patch 98b, medir atascos de Volante, solucionar fallos de parada, aceleración, teclas y UI | 5/5 salidas y rutas por persona |
| **E2** Unificación de física | P0 | Servicio de bus común entre Libre, Bus, Volante; compartir estado/salida | Prueba libre↔módulo idéntica |
| **E3** Runner correcto | P0 | GIS ciclovías, cruces, sentido, cambios de ancho, skateplaza y parkour | 100% tramos aptos, 10/10 carreras justas |
| **E4** Núcleo de cámaras | P0 | CameraRig y visibilidad/oclusión del mismo mapa 3D | Transiciones sin reposicionar ciudad |
| **E5** Metro y cable completos | P0 | Arranque/frenado, cabina, gente, señales, puerto de cámaras | Viajes A/B/T/K/L manuales completos |
| **E6** Actividades situadas | P1 | Despacho, Traffix, mantenimiento, entrega y guía en puntos del mundo | Mismas reglas desde dos entradas |
| **E7** Mundo vivo RPG | P1 | 10 crónicas opcionales, rutinas NPC, pequeños efectos persistentes | Guardado retrocompatible |
| **E8** Detalle gráfico | P1 | Modelos de tren/cable/bus, barrios, VFX, cielo, atlas 2D/pixel | p95 dentro de presupuesto |
| **E9** Acabado, distribución | P0 salida | 100 partidas, recorridos humanos, calidad y tamaño, builds offline/APK | 0 regresiones P0, evidencia adjunta |

No hacer E8 a costa de E1–E4. Un metro bellísimo que no arranca sigue siendo un juego roto. Los cambios en mapa, motor o UI compartidos necesitan coordinación expresa; los cambios aditivos y documentación pueden avanzar en paralelo.

## 15. Protocolo para Claude, Gemini y otras IAs

- Leer Issue #2 y sus comentarios, la PR #3 y esta entrega antes de intervenir. Las ramas evolucionan durante la sesión; **no asumir exclusividad perpetua**.
- No sobrescribir archivos ajenos ni hacer push force; abrir PR temática con pruebas y riesgos declarados.
- Siempre registrar *qué está hecho*, *qué falla*, *qué no se pudo verificar* y enlaces a commits.
- Aceptación de ideas: demostrar correspondencia con transportes, geografía, juego familiar y coste de CPU; rechazar “porque no aplica” solo si no puede reinterpretarse el principio de juego.
- Fase narrativa: consultar UnoCero como referente conceptual, crear crónicas propias vinculadas con barrios, estaciones y tiempos del sistema.
- Antes de portar una rutina Motor City revisar licencia, APIs y coste; preferir puerto puntual al motor actual sin duplicar universo.
- Nunca ocultar un bloqueo de infraestructura real como si fuera fiel. En caso de incertidumbre usar la etiqueta “escenario arcade”.
- Repetir benchmarks con semillas y dispositivos iguales. Si un cambio aumenta calidad y baja FPS, dar opción gráfica y cuantificar la diferencia.

## 16. Fuentes para contraste y verificación posterior

**Fuentes del código del proyecto:** los archivos citados de MetroZero; docs/INFORME-MOTOR-CITY-4.5.md; docs/COORDINACION-IA.md; docs/BITACORA.md; reporte de PR #3.

**Fuentes técnicas abiertas consultadas:**
- OpenStreetMap — highway=cycleway: https://wiki.openstreetmap.org/wiki/Tag:highway=cycleway
- OpenStreetMap — cycleway=* y direccionales: https://wiki.openstreetmap.org/wiki/Key:cycleway
- MDN — WebGL best practices: https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices
- Android Developers — texturas y atlas: https://developer.android.com/games/optimize/textures
- Railways! oficial en Play Store: https://play.google.com/store/apps/details?id=com.infinity.railways
- Super Arcade Racing oficial en Play Store: https://play.google.com/store/apps/details?id=com.outofthebit.superarcaderacing
- Mini Metro (estudio): https://dinopoloclub.com/games/mini-metro/
- Página oficial del Metro de Medellín, para contrastar trazados/servicio y evitar asumir que el juego representa procedimientos operativos: https://www.metrodemedellin.gov.co/

## 17. Resumen para el siguiente agente

**Hecho en esta entrega de OpenAI GPT-6 · Eón:** lectura y coordinación de 4 repos; lectura de notas previas; contraste documental de mecánicas; script nuevo para rescate conservador de Al volante y anticipación de IA de carrera; prueba Node aislada pasando; publicación en rama propia con informe firmado. Las modificaciones de la PR #3 permanecen sin alterar.

**Bloqueantes abiertos:** verificación física y visual en Android/Chromium, red auténtica de ciclovías, identidad de estado entre módulo y mundo libre, arreglos estructurales de colisiones, fidelidad de cámaras y optimización 3D medida. No afirmar que el videojuego completo está terminado.

**Regla final:** lo primero no es añadir decenas de menús, sino conseguir que caminar, manejar, observar, decidir, explorar y regresar al mundo libre sean experiencias fluidas, coherentes y emocionantes dentro de una sola ciudad.
