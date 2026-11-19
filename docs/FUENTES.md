# Fuentes de `src/data/red.js`

Datos de la red de transporte del Valle de Aburrá para "El Metro". Versión `2026-11`. Consulta: noviembre de 2026.

## Ciudad: barrios, calles, manzanas, lotes y espacio público (v0.7.0)
Los genera `python3 tools/ciudad_datos.py` en `src/data/ciudad.js`, a partir de capas abiertas descargadas con `tools/ciudad_descarga.py` (ArcGIS Online):

| Capa | Publica | Uso en el juego |
|---|---|---|
| Límite barrio-vereda catastral (349) | Alcaldía de Medellín | barrio en el HUD, rótulos y letrero |
| Manzanas (10.968) | Alcaldía de Medellín | qué casillas son construidas |
| Malla vial 2026 (23.588 tramos, nomenclatura y ancho) | Alcaldía de Medellín (Infraestructura) | nombre de cada calle |
| Jerarquía vial (1.030) | Alcaldía de Medellín (Planeación) | nombres populares (Avenida Oriental, Las Vegas…) |
| Inventario de espacio público (2.187) | Alcaldía de Medellín | parques, plazas y zonas verdes con nombre |
| Lotes catastrales, febrero de 2026 (312.716, solo centroide y área) | Subsecretaría de Catastro de Medellín | división de las casas |
| Barrios de Itagüí (85), Envigado (39) y Sabaneta (31) | capas publicadas por esas alcaldías u observatorios | barrio en el HUD y rótulos |

**Cita exigida por la licencia abierta del Catastro:** “Fuente: Portal de Datos Abiertos Subsecretaria de Catastro del Municipio de Medellín, Colombia www.medellin.gov.co/geomedellin”. Los lotes son de **febrero de 2026**.

**Transformaciones** (la licencia pide declararlas): rasterizado a casillas de 20 m; recorte al valle; simplificación de líneas; conteo de lotes por casilla (2 bits); nombres de vía abreviados expandidos (CL → Calle, CR → Carrera…).

Los barrios de **Bello, Copacabana, Girardota, Barbosa, La Estrella y Caldas** aún no tienen capa abierta encontrada. Desde v0.10.0 se llenan con la capa aproximada de Juega EnCicla (ver abajo).

## Ajustes del mapa y EnCicla (v0.10.0)
| Dato | Fuente | Archivo |
|---|---|---|
| Nombres de calle y barrios fuera de la capa oficial | Mapa de Juega EnCicla v1.2: vías vectoriales y barrios por punto con nombre (© colaboradores de OpenStreetMap, ODbL, vía Overture Maps). Los barrios son aproximados | `src/data/ajustes.js` (`tools/mapa_ajustes.mjs`) |
| Patio‑taller del Metro, talleres del Metro y talleres del antiguo Ferrocarril de Antioquia | OpenStreetMap, ways 52513116, 52513115 y 142453569, consultados el 17‑nov‑2026 | `src/data/ajustes.js` |
| Río continuo y relieve del cauce | Calculados sobre el propio mapa (recorrido por el agua, regresión isotónica) | `src/data/ajustes.js` |
| 133 estaciones de EnCicla | Juega EnCicla v1.2 (posiciones aproximadas, típicamente a 46 m de la real) | `src/data/encicla.js` (`tools/encicla_datos.mjs`) |
| Horario del Metro | Metro de Medellín y Telemedellín (2026): lunes a sábado de 4:30 a. m. a 11 p. m.; domingos y festivos de 5 a. m. a 10 p. m.; en fechas especiales cambia | `src/js/00-core.js` |
| Horario de préstamo de EnCicla | Página oficial de EnCicla, como lo usa Juega EnCicla (consulta del 17‑nov‑2026); los festivos van como domingo por decisión del autor | `src/js/00-core.js` |
| Festivos de Colombia | Ley 51 de 1983 (Ley Emiliani) y Semana Santa según la Pascua; cálculo tomado de Juega EnCicla | `src/js/00-core.js` |

## Ciudad con curvas (v1.1.0)
| Dato | Fuente | Archivo |
|---|---|---|
| Mapa base v3 (manzanas oficiales, huellas, pisos y barrios por celda) | El Metro 1.0.0: tubería de mapas de Juega EnCicla 1.3.1 (`tools/geo/build.py`, TILE=20) y `tools/mapa_valle.py`; © colaboradores de OpenStreetMap (ODbL) vía Overture Maps, huellas de Overture (OSM, Microsoft y Google), capas oficiales de Medellín, relieve SRTM/NASA | `src/data/valle.js`, `src/data/ciudad.js`, `src/data/rutas.js` |
| 26.919 calles como vectores, con su curva, su ancho y su nombre | Juega EnCicla 1.3.1, `src/data/vias.bin` (casillas de 10 m): © colaboradores de OpenStreetMap (ODbL) vía Overture Maps; nomenclatura y ancho de la malla vial oficial de Medellín cuando existe | `src/data/vias.js` (`tools/vias_datos.mjs`) |
| Eje de las líneas A, B y del tranvía de Ayacucho | Vías férreas de OpenStreetMap (`railway=subway` y `tram`), consulta Overpass del 18‑nov‑2026; punto medio entre los dos rieles, suavizado | `src/data/rieles.js` (`tools/rieles_datos.mjs`) |
| Arquitectura icónica (30 piezas: Coltejer, Basílica Metropolitana, Palacio de la Cultura, Museo de Antioquia, Plaza Botero, Atanasio Girardot, Biblioteca España, Edificio EPM, Teatro Metropolitano, Parque de las Luces, La Alpujarra, Planetario, Explora…) | Huellas de edificios de OpenStreetMap (API 0.6, consulta del 18‑nov‑2026); alturas aproximadas por pisos conocidos | `src/data/hitos.js` (`tools/hitos_datos.py`) |
| Corredores de Metroplús (líneas 1, 2 y O) por su carril exclusivo | Juega EnCicla 1.3.1, `src/data/valle.json` (campo `mp`, de OpenStreetMap, ODbL); esquinas redondeadas | `src/data/metroplus.js` (`tools/metroplus_datos.mjs`) |
| Recorridos de los alimentadores por las calles | Trazado de `src/data/rutas.js` rehecho sobre la red de calles de `src/data/vias.js` (camino más corto por el corredor de la ruta, pasando por cada parada) | `src/data/rutas_calles.js` (`tools/rutas_calles.mjs`) |

**Transformaciones** de esta capa: simplificación de líneas (Ramer–Douglas–Peucker, 1,25 m en calles y 0,35 m en rieles), cuantización a 2,5 m, suavizado del eje férreo (media móvil de ±18 m) y esquinas de los buses redondeadas (radio de ~6 m). Hasta v1.1.1 las casas y los edificios se generaban a lo largo de cada calle; desde v1.2.0 son las huellas reales (ver abajo) y la generación queda solo de respaldo si faltan los datos.

## Casas y edificios reales (v1.2.0)
| Dato | Fuente | Archivo |
|---|---|---|
| 639.457 casas y edificios del valle con su huella (posición, forma y orientación) | Overture Maps Foundation, tema `buildings`, release 2026-10-21.0 (consulta del 18‑nov‑2026): OpenStreetMap (171.210 huellas; ODbL), Microsoft ML Buildings (131.744; ODbL) y Google Open Buildings (336.503; CC BY 4.0 / ODbL). Son polígonos abiertos, no imágenes; no se usó ninguna imagen de Google Maps ni de Google Earth | `src/data/edificios.js` (`tools/edificios_datos.py`) |
| Pisos oficiales de 7.779 edificios (Popular, El Poblado y Robledo) | Subsecretaría de Catastro de Medellín, capa `3DConstruccciones` (42.365 construcciones con `numero_pis` y `altura`) en el ArcGIS Online de la Alcaldía. **Cita:** “Fuente: Portal de Datos Abiertos Subsecretaria de Catastro del Municipio de Medellín, Colombia www.medellin.gov.co/geomedellin” | ídem |
| Pisos de otros 5.028 edificios | OpenStreetMap (`building:levels`, `height`) vía Overture: Coltejer 38, Edificio del Café 36, Torre Institucional de la Alcaldía 24… | ídem |
| Pisos del resto | Estimados por zona y tamaño de la huella con las distribuciones medidas uniendo las huellas con la capa oficial (Popular → laderas, El Poblado → torres entre árboles, Robledo → barrios mixtos), y tablas propias para el Centro, Laureles‑Belén y los pueblos según las fotos aéreas. Pisos medios resultantes: laderas 2,4; barrios mixtos 2,9; Laureles 3,2; El Poblado 3,6; Centro 3,9; pueblos 1,7 | ídem |
| Uso de cada edificio (casa, edificio, torre, bodega, colegio o universidad, salud, iglesia, cívico, comercio, coliseo, cubierta, invernadero, tanque…) | Etiqueta `class` de OpenStreetMap cuando existe; si no, el uso del suelo que lo contiene (Overture `base/land_use`) y sus pisos | ídem |
| 56 campus universitarios, 1.368 canchas, 37 pistas atléticas y 885 piscinas | Overture `base/land_use` y `base/water` (OpenStreetMap, ODbL) | `SUELOS` en `src/data/edificios.js` |
| Materiales, techos y árboles de cada zona | Fotos aéreas, desde el metrocable y desde edificios altos, con licencia libre, de Wikimedia Commons (créditos en `docs/investigacion/medellin-desde-el-aire.md`) | `src/js/11-edificios.js` |
| Forma de la Alcaldía, la Gobernación y el Palacio de Justicia (fachada inclinada, parteluces, culatas blancas) | Las mismas fotos de La Alpujarra (Commons) | estilo `alpujarra` en `src/js/11-hitos.js` |

**Transformaciones** (las licencias piden declararlas): proyección al mapa del valle; se descartan las huellas de menos de 12 m² y las que quedan bajo una pieza de arquitectura icónica; las casi rectangulares (relleno ≥ 0,78 de su rectángulo orientado) se guardan como rectángulo y las demás como polígono simplificado a 1 m; centros a 0,5 m, medidas a 0,5 m y ángulo a 1,4°. En el juego, cada edificio se **recorta contra la calle** (asfalto con medio andén, peatonales y escaleras), porque huellas y vías vienen de fuentes distintas y se corren uno o dos metros: la calle queda siempre libre. Regenerar: `python3 tools/edificios_datos.py --descargar CARPETA` y luego `python3 tools/edificios_datos.py CARPETA` (necesita `duckdb`, `shapely`, `pyarrow`).

## Puentes, niveles y Metroplús (v1.3.0)
| Dato | Fuente | Archivo |
|---|---|---|
| 2.150 puentes (1.436 vehiculares y 714 peatonales) con su nivel | Overture Maps Foundation, tema `transportation/segment`, release 2026-10-21.0: bandera `is_bridge` de `road_flags` y nivel de `level_rules` (© colaboradores de OpenStreetMap, ODbL) | `src/data/puentes.js` (de `tools/puentes_datos.py`) |
| Corredores de Metroplús líneas 1 y 2 | Relaciones de ruta de OpenStreetMap 5458501 y 5393696 (Línea 1), 5401998 y 5401999 (Línea 2), API 0.6 (ODbL) | `src/data/metroplus.js` (de `tools/metroplus_osm.py`) |
| Andenes de las estaciones de Metroplús | OpenStreetMap, API 0.6 (`public_transport=platform`, `highway=platform` o `bus_stop` con el nombre de la estación), ODbL | `src/data/metroplus_andenes.js` (de `tools/metroplus_andenes.py`) |
| Línea O de Metroplús | Rehecha por las calles dibujadas, pasando por cada andén | `src/data/rutas_calles.js` (de `tools/rutas_calles.mjs`) |
| Lo que cuentan los personajes de la ciudad | Conocimiento general sobre Medellín, revisado dato por dato; sin cifras dudosas | `src/js/39-gente.js` |

**Transformaciones:** los tramos de cada puente se unen por nivel, se pasan a metros del mapa del valle y se enlazan con las calles del juego (los tramos de calle que van sobre un puente no se dibujan a ras de piso). La altura del tablero es de 6 m por nivel (3 m en los puentes vehiculares cortos, de menos de 24 m, sobre quebradas), con rampas de hasta 22 m (9 m en los peatonales).

## Coordenadas

| Datos | Fuente |
|---|---|
| Línea A, Línea B y tranvía T-A | `docs/ref-estaciones-encicla.json` (OpenStreetMap). Se usaron tal cual. |
| Metrocables H, J, K, L, M y P | Relaciones de ruta de OpenStreetMap, leídas con la API 0.6 (`/relation/{id}/full`): K 1516642, L 1520815, P 19703370, H 7520266, J 1506181 y M 7520371. Andalucía y Popular (K) y SENA (P) vienen de Wikidata (P625). |
| Metroplús Líneas 1 y 2 | Relaciones OSM 5393696, 5458501, 5401998 y 5401999 (andenes y trazado). Los `via` son el trazado OSM simplificado. U. de M. y Parque Aranjuez vienen de Wikidata. |
| Metroplús Línea O | Paraderos `highway=bus_stop` "(Metroplús)" de OSM, buscados con Nominatim. Cuando había un andén por sentido, se usó el promedio de ambos. El orden de paradas es el de Telemedellín (ver abajo). |
| Alimentadores | Capa ArcGIS "Sistema de Transporte SITVA" (cuenta `javargas_metromed`), capas 4 ("Paraderos Alimentador e Integrado") y 5 ("Sistema Alimentador e Integrado"): https://services3.arcgis.com/ARUXxWVTK25ENUfB/arcgis/rest/services/Sistema_de_Transporte_SITVA/FeatureServer |
| Escaleras de la Comuna 13 | Vía OSM 406641200 (`conveying=yes`) |
| Corredor de la Avenida 80, río y calles | `src/data/valle.js` (OSM/Overture, ya incluido en el repo) |
| Barrios y referencias para proyectos futuros | Nominatim (OSM) |
| Wikidata (SPARQL) | https://query.wikidata.org/ (red Q654751 Metro de Medellín, Q3307447 Metrocable, Q6012081 Metroplús) |

## Colores

- **Metro y cables:** Módulo de Wikipedia "Adjacent stations/Medellín Metro", https://en.wikipedia.org/wiki/Module:Adjacent_stations/Medell%C3%ADn_Metro. Los valores son A `#1C5C9C`, B `#E38835`, T-A `#59AB42`, H `#EB318E`, J `#F6C538`, K `#B8CF40`, L `#8E612A`, M `#743D90` y P `#EC343A`. Coinciden en tono con Wikidata y con las etiquetas `colour` de OSM, aunque no se verificaron contra el manual de marca oficial del Metro.
- **Metroplús 1 y 2:** Etiquetas `colour` de las relaciones OSM: L1 `#0E6F76` y L2 `#65A9AC`.
- **Colores inventados, sin color oficial encontrado:** Metroplús Línea O `#00A99D`, Línea E / Metro de la 80 `#00B5E2`, Tren del Río `#6E4B3A`, Metrocable San Antonio de Prado `#7FB3D5`, escaleras `#5D6D7E` y la paleta de los alimentadores.

## Fechas, longitudes y datos técnicos

- Metro de Medellín (es.wikipedia): https://es.wikipedia.org/wiki/Metro_de_Medell%C3%ADn
  - Fechas de las Líneas A y B, Sabaneta y La Estrella (17/09/2012), ancho de vía 1435 mm, 80 km/h, trenes de 3 coches MAN-Siemens y CAF, y los 13 trenes nuevos.
- Tensión de 1500 V CC:
  - https://core.ac.uk/download/524543857.pdf
  - https://alamys.org/wp-content/uploads/2021/07/Ultracaps.pdf
- Metrocable (en.wikipedia), con longitudes y demanda de H, J, K y M y los 15 minutos a Arví: https://en.wikipedia.org/wiki/Metrocable_(Medell%C3%ADn)
- Fechas de apertura de los cables (Wikidata P1619): K 2004-08-07, J 2008-03-03, L 2010-02-09, H 2016-12-17, M 2019-02-28 y P 2021-06-10.
- Tranvía de Ayacucho (es.wikipedia): https://es.wikipedia.org/wiki/Tranv%C3%ADa_de_Ayacucho
  - Inaugurado el 15/10/2015, con operación comercial desde el 31/03/2016, 4,2 km, 12 vehículos Translohr y el tranvía histórico de 1921 a 1951.
- Metroplús (es.wikipedia): https://es.wikipedia.org/wiki/Metropl%C3%BAs
  - Línea 1 abierta el 22/12/2011 y de 12,5 km. Línea 2 de 13,5 km. Línea O de 9,2 km. Bus BYD en 2019. Industriales abierta el 29/10/2014.
- Línea O:
  - Orden de paradas e inicio de operación el 2/12/2019: https://telemedellin.tv/?p=60967
  - Más información: https://www.eltiempo.com/colombia/medellin/linea-o-de-buses-electricos-en-medellin-440080
- Línea 2, ecoestaciones de la Oriental (julio de 2021, 4,1 km, flota 100 % eléctrica): https://www.medellin.gov.co/es/sala-de-prensa/noticias/mas-de-cinco-millones-de-usuarios-se-han-movilizado-durante-el-primer-ano-de-operacion-de-las-ecoestaciones-de-la-linea-2-de-metroplus/
- Escaleras eléctricas de la Comuna 13:
  - https://www.semana.com/nacion/articulo/medellin-estrena-escaleras-electricas-comuna-13/251323-3/
  - https://abceconomia.co/2011/12/27/escaleras-electricas-son-una-realidad-en-la-comuna-13/
  - https://www.elmostrador.cl/noticias/mundo/2011/12/27/una-escalera-al-cielo-para-los-barrios-populares/
  - https://www.medellin.gov.co/es/sala-de-prensa/noticias/las-escaleras-electricas-de-la-comuna-13-de-medellin-recibieron-mantenimiento-integral/
- Códigos de rutas integradas del sur, usados solo como contexto: https://www.elcolombiano.com/medellin/operacion-rutas-integradas-del-metro-contingencia-catenaria-envigado-EK38896534
- Cuencas 3 y 6: https://www.medellin.gov.co/es/sala-de-prensa/noticias/la-recuperacion-e-intervencion-de-las-vias-por-donde-pasan-las-rutas-alimentadoras-de-metroplus-avanza-en-65/
- Barrio Tricentenario y los Juegos Centroamericanos de 1978:
  - https://telemedellin.tv/tricentenario-40-anos/281837/
  - https://www.elcolombiano.com/historico/tricen_con_aroma_a_juegos_y_barrio-EWEC_81630

## Proyectos futuros (estado a noviembre de 2026)

### Línea E – Metro de la 80 (`F-80`): en obra

- **Fuentes:**
  - https://metrodela80.gov.co/sobre-el-proyecto/carateristicas-tecnicas
  - https://es.wikipedia.org/wiki/L%C3%ADnea_E_(Metro_de_Medell%C3%ADn)
  - https://www.valoraanalitik.com/metro-de-la-80-presenta-avance-superior-al-52-anuncia-inicio-de-obras-para-estacion-subterranea/
  - https://newsroom.rcnradio.com/colombia/metro-de-la-80-en-medellin-cuando-estara-listo-y-como-sera-el-recorrido-del-nuevo-sistema-de-transporte
  - https://www.elcolombiano.com/medellin/nuevos-trenes-metro-de-la-80-medellin-NO39516874
  - https://globalmasstransit.net/?p=117146
  - https://news.griinstitute.org/en/infrastructure/infraestructura-antioquia-contratistas-financistas-pipeline-medellin-valle-de-aburra
  - https://telemedellin.tv/conozca-14-estaciones-del-metro-de-la-80/
- **Datos confirmados:**
  - 13,25 km, a nivel, de Caribe a Aguacatala.
  - 3 estaciones (Caribe, San Germán soterrada y La Aguacatala) y 14 paradas.
  - Avance superior al 52 % en junio de 2026; las obras de la estación San Germán empezaron en agosto de 2026.
  - El fin de obras se estima para el primer trimestre de 2028. Otra nota apunta a la operación en el primer trimestre de 2029.
  - 22 trenes del consorcio CRRC y Mota-Engil.
- **Incierto:**
  - **Ubicación de las paradas:** Las coordenadas son aproximadas. Se ubicaron sobre el eje Transversal 78 → Transversal 73 → Calle 65 → Avenida 80 → Calle 12 Sur, a la altura del barrio o del cruce vial correspondiente (Calle 50 Colombia, Avenida San Juan, Calle 30, etc.).
  - **Orden de paradas en el sur:** El orden oficial del listado es "…, Cristo Rey, Guayabal, Apolo". En el mapa se puso Apolo antes que Guayabal por geografía, según la ubicación de la Escuela Apolo.
  - **Nombres:** Wikipedia da otra lista de nombres "tentativos" (Pedregal, Robledo, CardioVID…). Se usó la del sitio oficial. "Ciudadela Educativa" aparece en otras fuentes como "Ciudadela Educativa Pedro Nel Gómez".
  - **Apertura:** Se puso "2028?".

### Tren del Río, fase 1 (`F-TREN`): proyecto

- **Fuentes:**
  - https://telemedellin.tv/?p=154560 (7/12/2025)
  - https://www.minuto60.com/colombia/cuando-funcionaria-ferrocarril-tren-antioquia-fechas/18653
  - https://news.griinstitute.org/en/infrastructure/infraestructura-antioquia-contratistas-financistas-pipeline-medellin-valle-de-aburra
  - https://telemedellin.tv/?p=163499 (estación Bello)
- **Datos confirmados:** 29,8 km de vía sencilla entre Bello y Barbosa, con seis estaciones, una integrada a la Línea A en Bello. Hay vigencias futuras aprobadas.
- **Incierto:**
  - **Estaciones:** Los nombres de las seis estaciones no se han publicado. En el mapa hay cinco puntos indicativos (Bello, Copacabana, Girardota, Hatillo y Barbosa), puestos sobre el corredor del río.
  - **Trazado:** El `via` es el río simplificado, no el trazado ferroviario real.
  - **Apertura:** No hay fecha ("por definir").

### Metrocable San Antonio de Prado – La Estrella (`F-SAP`): proyecto, en factibilidad

- **Fuentes:**
  - https://www.elcolombiano.com/medellin/metrocable-de-san-antonio-de-prado-el-mas-grande-del-sistema-BG35551550 (15/04/2026)
  - https://www.infobae.com/colombia/2026/04/16/el-metro-de-medellin-tendra-nueva-linea-del-metrocable-estas-seran-las-rutas-y-la-fecha-de-inicio-de-la-obra/
  - https://www.medellin.gov.co/es/sala-de-prensa/noticias/nuevo-metrocable-de-medellin-transformara-la-movilidad-y-la-calidad-de-vida-de-los-habitantes-de-san-antonio-de-prado/
- **Datos confirmados:** Unos 5 km, 6 estaciones, 38 pilonas, 2.700 pasajeros por hora y sentido, unos 22 minutos de viaje y cerca de $1,3 billones de costo. La operación se espera antes de 2030.
- **Incierto:** Solo se ubicaron los extremos (la estación La Estrella y el parque principal de San Antonio de Prado). Las 4 estaciones intermedias no tienen nombre ni ubicación pública.

### Proyectos no incluidos como líneas, por falta de trazado

- **Metrocable La Cruz:** 3,83 km, en factibilidad, según la Alcaldía.
- **Cable o funicular Poblado – Las Palmas:** Se menciona en la nota de El Colombiano de abril de 2026.
- **Metro subterráneo o "Línea S" (Sabaneta – Bello, ~38 km):** Fue una prefactibilidad de 2023 y no tiene estado actual claro. Fuente: https://www.eltiempo.com/colombia/medellin/medellin-esta-es-la-fecha-en-que-se-entregaran-los-estudios-del-metro-subterraneo-805005
- **Metroplús Pretroncal Sur (Envigado e Itagüí):** No opera.
  - El tramo 2B de Envigado y el tramo 4A de Itagüí están construidos.
  - Las 23 estaciones previstas (5 en Medellín, 6 en Envigado y 12 en Itagüí) siguen en estudios y diseños, sin fecha de operación.
  - Fuentes: https://es.wikipedia.org/wiki/Metropl%C3%BAs y https://www.elcolombiano.com/antioquia/retrasos-obras-metroplus-envigado-e-itagui-OG31261924

## Deprimidos y personajes de EnCicla (2.0.0)
- **Deprimidos y soterrados:** 26 tramos viales con `is_tunnel` de Overture Maps (datos de OpenStreetMap, ODbL), de 30 a 600 m, generados por `tools/puentes_datos.py`.
  - Entre ellos: el soterrado de Parques del Río (Carrera 62), la Calle 58, la Calle 67 y la Transversal Inferior.
  - Se dejan fuera los túneles de montaña (Occidente y Oriente).
  - Los 5 deprimidos escritos a mano en la entrega de Gemini no se usaron.
- **Personajes de EnCicla:** nombres y oficios de Juega EnCicla (`66-historia.js`, `72-oficios2.js` de ese juego): Doña Luz (usuaria desde 2011), Santi (anfitrión), Don Jairo (mecánico), Wilson (balance), Cata (monitoreo) y Maryi (pausas activas).
  - Sus datos son de la red del propio juego: qué líneas pasan por cada estación y cuál es la siguiente.
  - Se descartaron frases de la entrega de Gemini que no se pudieron confirmar: la fecha y el número de estaciones del piloto de EnCicla, y el «puente de cal y sangre».

## Notas sobre datos inciertos

- **Alimentadores:**
  - El conjunto de datos SITVA es de 2019 (última edición en marzo de 2019) y solo cubre las cuencas 3 (Belén y suroccidente) y 6 (nororiente y centro-oriente), es decir, rutas alimentadoras de Metroplús. Algunos recorridos o paradas pueden haber cambiado.
  - No se encontraron datos geográficos abiertos de las rutas integradas de Itagüí, Envigado, Sabaneta, Bello u otros municipios. Por eso no se incluyeron, aunque sus códigos existen (por ejemplo C4-005 Calatrava, C5-017 La Mina o C5-004 Loma Casimbas).
  - Los nombres de paradas se limpiaron de los códigos internos (S157, etc.). En la C3 se reemplazaron los nombres de negocios por cruces viales.
  - El campo `open` es "sin dato".
- **Metroplús Línea 2:**
  - La fecha de apertura varía según la fuente (22, 25 o 26 de abril de 2013; Wikidata dice 2012). Se usó 2013-04-26.
  - La parada "Prado (Av. Oriental)" es un andén sin nombre en OSM (6.25901, -75.56044). Se le añadió "(Av. Oriental)" para no confundirla con la estación Prado de la Línea A, que queda a unos 650 m.
- **Metroplús Línea O:** La parada Santa Gema se ubicó cerca de la glorieta de Santa Gema (Av. 80 con Calle 33). Su andén no está en OSM.
- **Escaleras de la Comuna 13:** OSM solo tiene un tramo mapeado (unos 95 m). La longitud total (unos 384 m en seis tramos dobles) viene de la prensa. Hay dos fechas de inauguración: el 25 de diciembre de 2011 (Alcaldía) y el 26 de diciembre de 2011 (prensa). Se usó la del 26.
- **Longitudes de los cables:**
  - L tiene 4,5 km según el trazado OSM (otras fuentes dan 4,6 km).
  - P tiene 2,7 km según el trazado OSM.
- **Cabinas de los cables:** Solo se indicó la capacidad donde se encontró: K, 10 pasajeros; P, hasta 12.
- **Línea A:** El dato de 13 trenes nuevos "se fabrican en México" viene de Portafolio, https://www.portafolio.co/economia/de-mexico-a-medellin-inversion-de-mas-de-515-000-millones-en-la-fabricacion-de-los-13-trenes-nuevos-para-el-metro-497942. Llegarían hacia 2027.
- **Datos curiosos de estaciones:** Se verificaron en las fuentes anteriores o son de conocimiento general bien establecido: la Plaza Botero con 23 esculturas, San Lorenzo de Aburrá (1616), Otraparte, el Palacio Egipcio, la Casa Gardeliana, el Pueblito Paisa y otros. Los menos documentados, que conviene revisar si se quiere máxima certeza, son estos:
  - Laureles trazado por Pedro Nel Gómez.
  - El origen del nombre del barrio Alejandro Echavarría.
  - La sede del SENA junto a la estación SENA.
  - La relación del nombre Ayurá con la quebrada La Ayurá.
- **Contenido omitido a propósito:** Se omitió todo contenido violento o político (por ejemplo, la historia de la escultura del Pájaro en San Antonio o los incidentes de la Línea K en 2024).
