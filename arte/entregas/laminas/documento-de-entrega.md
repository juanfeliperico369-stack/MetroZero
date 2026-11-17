# EL METRO · DOCUMENTO ÚNICO MAESTRO (TODO EN UNO + ARTE MINIMALISTA COMPILADO)

> **Versión del juego:** `v0.5.1` ("Medellín Minimalista y Fiel", sobre base `v0.5.0`) · **Compilado:** `2026-11-17`.
> Este documento reúne **absolutamente todo** el proyecto *El Metro* (videojuego del Metro de Medellín y del Valle de Aburrá): protocolo con cuestionario resuelto, guía única para IA, reglas de diseño minimalista sin rastro de IA, cuidado de filtros para todo público, skills, plan de desarrollo, bitácora, biblia de estilo, referencias de videojuegos, identidad visual de Medellín, historia, folclor y fiestas, diseño de mundo abierto + arcade, entregas, galería de referencia, catálogo de las 20 láminas generadas y el **código fuente compilado** del arte y del motor.

## Índice General
- **0 · Protocolo para toda IA (con Cuestionario Resuelto y 9 Reglas Aprendidas)**
- **1 · Léeme: qué es y cómo usarlo**
- **2 · Guía única para IA (contexto, roles, encargos rediseñados `G‑` y `C‑`, correcciones, entrega, skills y bitácora)**
- **3 · Skills del proyecto (`el-metro-desarrollo`, `el-metro-arte`, `medellin-fiel`)**
- **4 · Plan de desarrollo (Fases 1 a 5 + Fase 1b Medellín fiel e isométrica)**
- **5 · Biblia de estilo + Sistema de Diseño Minimalista (Cero rastro de IA y Cuidado de Filtros)**
- **6 · Referencias de videojuegos (32 juegos analizados y 10 pilares)**
- **7 · Medellín y su transporte: identidad visual**
- **8 · Historia del Metro y de Medellín**
- **9 · Folclor, cultura paisa y calendario de fiestas**
- **10 · Diseño: mundo abierto + arcade**
- **11 · Entregas, inventario de láminas generadas e integración al motor**
- **12 · Galería de referencia (71 fotos con licencia libre y créditos)**
- **13 · El videojuego: cómo jugarlo y código fuente completo (Arte Minimalista Compilado + Motor y Herramientas)**

---

# 0 · Protocolo para toda IA (con Cuestionario Resuelto y 9 Reglas Aprendidas)

## 0.1 Los 7 pasos obligatorios (en orden, sin saltarse ninguno)
1. **LEE TODO:** Lee el documento completo de principio a fin (protocolo, guía, contexto, roles, encargos, skills, plan, bitácora, arte, galería y código).
2. **REFLEXIONA:** Resume misión, visión, estado del juego, tu rol, tus encargos y lo que NO debes hacer. Si dos partes chocan, manda el Bloque 1 del contexto.
3. **COMPRUEBA QUE ENTENDISTE:** Responde el cuestionario de comprensión de 13 preguntas.
4. **PRUEBA EN PEQUEÑO:**
   - **Gemini (Artista 1):** Encargo `G‑00` (`ancla_estilo.png`).
   - **ChatGPT (Artista 2):** Un ícono del encargo `C‑10`.
   - **Agentes de código:** `node tools/build.mjs` y `node tools/test.mjs 100` (0 errores).
5. **AUTO‑AJÚSTATE:** Guarda tus **"Reglas aprendidas"** en tus propias instrucciones (Gem, Proyecto o Skills) y repite la prueba hasta pasar la lista de control. Nunca cambies la misión, la visión ni las reglas del autor sin su permiso.
6. **HAZ SOLO LO TUYO, CON PRECISIÓN:** Ejecuta los encargos respetando vista, paleta HEX, fondo, tamaño, nombre de archivo y formato.
7. **ENTREGA Y REGISTRA:** Entrega según el Bloque 5 e informa en 5–10 líneas qué hiciste, cómo lo probaste, qué aprendiste y qué falta, actualizando `docs/BITACORA.md`.

## 0.2 Cuestionario de comprensión (Resuelto y Verificado)
1. **¿Cuál es la misión del proyecto, en una frase?**
   Que cualquier persona —niños, familias, paisas y visitantes— conozca, use y quiera la red de transporte y la ciudad de Medellín jugando: recorriendo su mapa real, manejando cada vehículo del sistema, cuidando a la gente con la "Cultura Metro" y viviendo sus fiestas.
2. **¿Qué IA hace los encargos `G‑` y cuál los `C‑`? ¿Cuál es tu rol?**
   Gemini (Nano Banana) hace los encargos `G‑` (Artista 1) y ChatGPT hace los encargos `C‑` (Artista 2). En esta compilación maestra autorizada se documentan y entregan ambos lotes claramente separados.
3. **¿Qué color HEX tiene la línea A? ¿Y el Metroplús línea 1?**
   Línea A: `#1C5C9C`. Metroplús línea 1: `#0E6F76`.
4. **¿Qué fondo se usa cuando la herramienta no da transparencia?**
   Fondo magenta plano `#FF00FF` (o verde `#00FF00` únicamente si el objeto lleva tonos rosados o morados), sin sombras ni degradados y nunca blanco.
5. **¿Desde dónde viene la luz y por qué no se dibuja la sombra proyectada?**
   La luz viene desde arriba a la izquierda (45°); no se dibuja sombra proyectada en el piso porque el motor del juego la calcula y rota dinámicamente en una capa aparte según la hora solar.
6. **¿Qué escala tienen los sprites de vehículos y hacia dónde miran?**
   Escala `1 m = 8 px` en vista cenital pura (90°) mirando siempre a la **derecha (`+x`)**: carro y taxi `36×16`, moto `16×8`, bici `14×6`, buseta `64×20`, alimentador `96×20`, articulado `144×20`, coche de metro `176×24` y cabina de cable `24×24`.
7. **¿Qué está prohibido en todas las imágenes?**
   Texto, letras o números no pedidos (y cuando se piden, solo en español), logos o marcas reales (Metro, EPM, empresas), marcas de agua, armas, violencia, alcohol, cigarrillo, pólvora en manos de niños, estereotipos de narcotráfico, copias de otros juegos y capturas de Google Maps o Google Earth.
8. **¿Qué es la proyección dimétrica 2:1 y en qué encargos se usa?**
   Es la proyección "isométrica" de pixel art donde por cada 1 px vertical se avanzan 2 px horizontales (~26,565°), manteniendo la altura relativa real de los edificios; se usa en `G‑90` (conceptos isométricos por región) y `G‑100` (repintado de mosaicos base generados con datos abiertos), además de futuros interiores de estación.
9. **¿Quién es Rosalba y cómo se viste?**
   Conductora del primer tren del Metro en 1995 (~60 años) en su última semana antes de jubilarse; tiene piel clara cálida `#f1c9a5`, pelo canoso recogido `#dcd8d0`, sonrisa cálida, viste uniforme azul `#12446c` con franja `#1C5C9C` sin logos, pañoleta, gafas en el bolsillo y lleva su termo de tinto.
10. **¿Cuál es el primer encargo que hay que hacer y por qué?**
    El encargo `G‑00` (`ancla_estilo.png`), porque define el canon visual del juego y se adjunta en todas las conversaciones posteriores para que todas las entregas mantengan exactamente el mismo estilo.
11. **¿Qué skill del proyecto debes seguir siempre y cuál solo en el mapa y la vista isométrica?**
    Seguir siempre `el-metro-arte` (y `el-metro-desarrollo` al tocar código), y usar `medellin-fiel` en todo lo relativo al mapa, relieve, estructuras y los encargos isométricos `G‑90` y `G‑100`.
12. ***(Agentes de código)* ¿Qué comando compila el juego, cuál lo prueba con 100 partidas, cuál arma este documento único y qué archivo se actualiza al terminar?**
    Compila con `node tools/build.mjs`, prueba 100 partidas con `node tools/test.mjs 100`, arma el documento único con `node tools/todo.mjs` y al terminar se actualiza siempre `docs/BITACORA.md` (más la skill correspondiente si cambió una regla).
13. **¿Qué haces si te piden algo que no está en tu rol?**
    Si se opera en sesión restringida a un solo artista, responder a qué IA le corresponde (`"Eso le corresponde al Artista 2 (ChatGPT)"` o `"Eso le corresponde al Artista 1 (Gemini)"`) y no hacerlo.

## 0.3 Las 9 Reglas Aprendidas (Para Diseño Minimalista Profesional Sin Rastro de IA)
1. **Regla 1 (Grilla entera 1:1 sin "mixels"):** Todo activo pixelado se construye sobre una cuadrícula entera uniforme donde cada bloque tiene idéntico tamaño; quedan prohibidos los bordes semitransparentes, el suavizado (*anti‑aliasing*) y la mezcla de resoluciones.
2. **Regla 2 (Geometría minimalista de bloques planos):** Máximo 2 tonos por superficie (color base + plano de luz superior izquierdo) y contorno constante `#141414` de 1 px, eliminando los degradados plásticos (*pillow shading*) y el ruido hiperdetallado típico de los generadores de IA.
3. **Regla 3 (Separación estricta entre Cenital 3/4 e Isométrico 2:1):** En las casillas `G‑60` a `G‑63` y el panel 1 de `G‑00`, las calles y muros son 100 % paralelos a los bordes horizontal y vertical del lienzo (mostrando techo arriba y franja de fachada sur abajo); el giro diagonal 2:1 se aplica exclusivamente en `G‑90` y `G‑100`.
4. **Regla 4 (Cero sombras proyectadas en el suelo):** Las suelas de los zapatos, las ruedas y las bases de las casas descansan directamente sobre el fondo `#FF00FF` (o `#f1ece0` en `G‑00`) sin óvalos oscuros debajo.
5. **Regla 5 (Descripción cromática limpia en prompts):** No incluir códigos `#HEX` literales dentro del texto de prompts de imagen para evitar que los modelos los escriban como texto; usar el nombre exacto del color y aplicar la cuantización HEX matemática en `cuantizarColor()`.
6. **Regla 6 (Invariancia posicional en retratos):** Los retratos `neutra` y `alegre` de cada personaje comparten exactamente las mismas coordenadas de silueta, pelo y ropa, cambiando únicamente los bloques de ojos, cejas y boca.
7. **Regla 7 (Proporciones exactas en hojas cenitales):** Las tiras individuales de caminar usan proporción 4:1 (`64×16 px`) y la cuadrícula de 8 pasajeros usa proporción 1:2 (`64×128 px`), siempre mirando hacia `+x` (derecha).
8. **Regla 8 (Vocabulario técnico y familiar seguro para filtros):** Redactar siempre con terminología ferroviaria, arquitectónica y familiar inequívoca (*botón vigilante de atención en cabina*, *joven aprendiz de conducción de 16 años*, *arquitectura vernácula andina de ladrillo terracota*, *celebración cultural familiar*).
9. **Regla 9 (Respaldo procedural permanente):** Toda integración en el código consulta primero `Atlas.get(id)` y, si la imagen no está cargada, ejecuta automáticamente el dibujo procedural original sin interrumpir la partida.

---

# 1 · Léeme: qué es y cómo usarlo

*El Metro* es un videojuego gratuito, sin conexión a internet y para todo público (web PWA y APK de Android) sobre el Metro de Medellín y el Valle de Aburrá. Todo el juego cabe en un único archivo `index.html` (~1,8 MB) sin librerías externas.

### Cómo usar los 3 entregables maestros
1. **El Documento Maestro Ilustrado (`EL-METRO-MAESTRO.html` / PDF):** Contiene toda la documentación editorial con las **20 láminas minimalistas incrustadas** y comentadas.
2. **El Empaquetador `.zip` (`generar-el-metro-zip.mjs`):** Ejecuta `node generar-el-metro-zip.mjs` para generar al instante el archivo `el-metro-arte-y-codigo.zip` y poblar la carpeta `arte/entregas/` con los PNG transparentes y sus `.txt`.
3. **Este Documento Único (`EL-METRO-TODO-REDISENADO.md`):** Súbelo como archivo de conocimiento a un Gem de Gemini, a un Proyecto de ChatGPT o al repositorio para disponer de todo el contexto, los encargos y el código fuente compilado.

---

# 2 · Guía única para IA (Contexto, Roles, Encargos `G‑` y `C‑`, Correcciones y Entrega)

## BLOQUE 1 · CONTEXTO DEL PROYECTO
* **Misión:** Que cualquier persona —niños, familias, paisas y visitantes— conozca, use y quiera la red de transporte y la ciudad de Medellín jugando: recorriendo su mapa real, manejando cada vehículo del sistema, cuidando a la gente con la "Cultura Metro" y viviendo sus fiestas.
* **Visión:** Ser el gran juego de mundo abierto sobre Medellín y su Metro: una ciudad fiel en relieve, río, barrios, estaciones y estructuras, con arte minimalista propio de alta calidad, viva de día y de noche, que funcione sin internet en celulares modestos y se juegue en familia y en red local.
* **Módulos del juego:**
  - **Ciudad Libre (`36-libre.js` + `35-ciudad.js`):** Mundo abierto cenital donde se camina o se maneja bici, moto, taxi, camioneta, bus y se aborda el metro, tranvía y metrocables, con oficios por radio.
  - **Bus (`38-bus.js`):** Simulador cenital de Metroplús (articulados de 18 m) y alimentadores (35 rutas por calles reales con validación de tarjeta Cívica).
  - **Metro y Tranvía (`30-conduce.js` + `31-cabina.js` + `23-lado.js`):** Vista lateral panorámica por capas y cabina en primera persona con procedimiento real (llave, sentido, señal de salida, botón vigilante, puertas según lado del andén, anuncio y Escuela de conducción de 9 pasos).
  - **Metrocable (`52-cableviaje.js`):** Operación de las 6 líneas de cable aéreo con física de péndulo, viento, tormentas y miradores fotográficos.
  - **Historia en la ciudad (`37-trama.js`) y clásica (`70-historia.js`):** *"La última vuelta"*, con Rosalba y su nieta a lo largo de 8 capítulos integrados en el mapa real.
  - **Guía (`67-guia.js`), La Red (`60-mapa.js`), Juntos (`80-multi.js`) y Arcade (`40/45/50-*.js`, `32-volante.js`).**

## BLOQUE 2 · ROLES
* **Artista 1 · Gemini (`G‑00` a `G‑100`):** Ancla de estilo, personajes (hojas, retratos, sprites cenitales), estaciones y vehículos de perfil, laderas, variantes de hora y fiesta, hojas de casillas cenitales 3/4, capas panorámicas, escenas de ambiente de fiestas, conceptos isométricos 2:1 y repintado de mosaicos base.
* **Artista 2 · ChatGPT (`C‑01` a `C‑60`):** Sprites de vehículos vistos desde arriba (`1 m = 8 px`), puertas del bus, íconos de modos y acciones, insignias de logros, consolas de cabina en 1.ª persona, señalética en blanco, portadas, pantalla de carga, decoraciones de fiesta y texturas repetibles sin costuras.

## BLOQUE 3 · CATÁLOGO COMPLETO DE ENCARGOS REDISEÑADOS (MINIMALISTAS Y BLINDADOS PARA FILTROS)

### 3A · Encargos `G‑` (Artista 1 · Gemini)
* **`G‑00` (`ancla_estilo.png` · Lámina `dc417bc7.jpeg`):** Tablero cuadrado (1:1) dividido en 4 recuadros simétricos sobre fondo papel `#f1ece0`: (1) manzana de barrio en vista cenital 3/4 ortogonal con losas, tanques negros, calle gris y árbol; (2) tren de 3 coches de perfil con franja `#1C5C9C` sobre viaducto; (3) Rosalba, la nieta y vendedora de frente sin sombra proyectada; (4) ladera verde con casitas de ladrillo y metrocable.
* **`G‑01` a `G‑03` (`per_rosalba_hoja.png`, `ret_rosalba_neutra.png`, `ret_rosalba_alegre.png`, `spr_rosalba_cenital.png` · Lámina `faea4672.jpeg`):** Rosalba en 4 vistas ortogonales, 3 expresiones y caminata cenital de 4 cuadros mirando a la derecha sobre fondo `#FF00FF`.
* **`G‑04` (`per_nieta_*`, `ret_nieta_*`, `spr_nieta_cenital.png` · Lámina `5b195328.jpeg`):** La Nieta (16 años, chaqueta azul `#1C5C9C`, morral gris y tenis blancos).
* **`G‑05` (`per_efrain_*`, `ret_efrain_*`, `spr_efrain_cenital.png` · Lámina `076020ea.jpeg`):** Don Efraín (65 años, pelo y bigote blancos, chaqueta gris `#5a6470` y audífonos de radio al cuello).
* **`G‑06`, `G‑07` y `G‑08` (`per_marleny_*`, `per_wilmar_*`, `per_agente_*` · Lámina `5b862a36.jpeg`):** Doña Marleny (ruana roja `#c8201f` y delantal), Wílmar (camisa blanca y gorra `#1C5C9C`) y Agente de tránsito (chaleco reflectivo `#c7e000` y casco blanco).
* **`G‑09` (`per_pasajeros_hoja.png`, `spr_pasajeros_cenital.png` · Lámina `924df75c.jpeg`):** 8 pasajeros de Medellín de frente y en vista cenital pura.
* **`G‑10` (`per_calle_hoja.png` · Lámina `ad75489d.jpeg`):** Vendedor de tinto, vendedora de arepas, vendedor de chontaduro, lustrabotas, silletero, músico, ciclista en bici pública verde y 3 perros criollos.
* **`G‑20` a `G‑25` (`est_lado_*` · Lámina `ee85029d.jpeg`):** Estaciones de perfil plano sobre fondo `#FF00FF` (Parque Berrío, San Antonio, Niquía, Metroplús, Metrocable y Tranvía).
* **`G‑30` a `G‑37` (`veh_lado_*` · Lámina `ffa77092.jpeg`):** Vehículos de perfil mirando a la derecha (tren MAN, tren CAF, tranvía `#59AB42`, 6 cabinas de Metrocable, articulado `#0E6F76`, alimentador, buseta y chiva).
* **`G‑40` y `G‑50` a `G‑55` (`pan_ladera_casas.png` y variantes · Lámina `e8e91ee8.jpeg`):** Ladera de comunas y sus 6 variantes (`_noche`, `_tarde`, `_lluvia`, `_alumbrados`, `_feria`, `_velitas`).
* **`G‑60` a `G‑63` (`cas_barrio_hoja.png`, `cas_poblado_hoja.png`, `cas_parques_hoja.png`, `cas_rio_comuna13_hoja.png` · Láminas `99b3b13f.jpeg`, `a2b435ed.jpeg`, `09aa89f6.jpeg`):** Hojas cuadradas de 4×4 casillas cenitales 3/4 ortogonales.
* **`G‑70` a `G‑73` (`pan_<zona>_<hora>_<1lejana|2cerros|3laderas|4ciudad>.png` · Láminas `3bb14dd3.jpeg` y `8645faad.jpeg`):** Capas panorámicas de día y de noche/Alumbrados sin cielo.
* **`G‑80` a `G‑86` (`amb_<fiesta>.png` · Láminas `91bc2208.jpeg` y `2808d6e4.jpeg`):** Escenas de Silleteros, Alumbrados, Velitas, Tango, Comuna 13, Arví y Aguacero.
* **`G‑90` y `G‑100` (`concepto_iso_<region>.png`, `iso_<zona>_<fila>_<col>.png` · Láminas `1a997e8e.jpeg`, `8d1cd4ce.jpeg`, `259eeec3.jpeg`):** Conceptos isométricos en proyección dimétrica 2:1 (Centro, Ladera, Poblado, Río y Cable) y mosaico base repintado sin alterar la geometría.

### 3B · Encargos `C‑` (Artista 2 · ChatGPT)
* **`C‑01` (`spr_vehiculos_sistema.png`):** Vehículos del sistema en vista cenital pura (`1 m = 8 px`, mirando a `+x`).
* **`C‑02` (`spr_vehiculos_calle.png`):** Taxi `#f2c400`, 6 carros, camioneta azul, moto, bici verde, carrito de vendedor, ambulancia y camión.
* **`C‑03` (`spr_puertas_bus.png`):** Articulado en 3 cuadros de apertura de puertas izquierdas.
* **`C‑10`, `C‑11` y `C‑12` (`ico_modos.png`, `ico_acciones.png`, `ico_logros.png`):** 9 íconos de modos, 12 de acciones y 20 medallas de logros sin texto.
* **`C‑20` y `C‑21` (`cab_consola_vertical.png`, `cab_consola_horizontal.png`, `cab_bus.png`):** Consola del Metro y tablero del bus con parabrisas en `#FF00FF`.
* **`C‑30`, `C‑40`, `C‑41`, `C‑50` y `C‑60` (`ui_letreros.png`, `clave_compartir.png`, `clave_portada.png`, `clave_carga.png`, `fiesta_sprites.png`, `tex_<material>.png`):** Señalética en blanco, portadas, pantalla de carga, adornos cenitales de fiesta y 10 texturas repetibles sin costuras.

---

# 3 · Skills del proyecto (`el-metro-desarrollo`, `el-metro-arte`, `medellin-fiel`)

* **`el-metro-desarrollo`:** Un solo `index.html` offline sin librerías externas, enfocado en celulares modestos, con guardado en `localStorage` (`elmetro.v1`), pruebas automáticas (`node tools/test.mjs 100` con 0 errores) y respaldo procedural permanente.
* **`el-metro-arte`:** Dirección visual *"Medellín de verdad, dibujada con cariño"*, paletas HEX oficiales, limpieza de `#FF00FF`, escalado por vecino más cercano y cuantización a 32 colores.
* **`medellin-fiel`:** Fidelidad geográfica y estructural del Valle de Aburrá y proyección dimétrica 2:1 (`pantallaX = (x - y) * s`, `pantallaY = (x + y) * s / 2 - z * s * kz`).

---

# 4 · Plan de desarrollo y Bitácora (`v0.5.1`)

* **Fase 1 (Arte real minimalista):** Compilada en `src/data/arte-minimal.js` y `src/js/19-atlas.js`, conectando retratos, sprites cenitales, casillas, capas panorámicas y texturas con respaldo procedural automático.
* **Fase 1b (Medellín fiel e isométrica 2:1):** Implementada en `src/js/24-iso.js` junto con las láminas de referencia `G‑90` y `G‑100`.
* **Fase 2 y Fase 3 (Cabina real, Bus con Cívica e Historia en la ciudad):** Activas en `31-cabina.js`, `38-bus.js` y `37-trama.js`.

---

# 5 · Biblia de Estilo, Referencias, Historia, Folclor y Galería

*(Ver detalle tabular y visual completo en las secciones 1 a 8 del PDF Maestro `EL-METRO-MAESTRO.html`)*:
* **Paleta de líneas:** A `#1C5C9C`, B `#E38835`, T `#59AB42`, K `#B8CF40`, J `#F6C538`, H `#EB318E`, L `#8E612A`, M `#743D90`, P `#EC343A`, MP1 `#0E6F76`, MP2 `#65A9AC`, Línea O `#00A99D`.
* **10 pilares del juego:** Mapa real único, transporte como control del mundo, manejar bien como puntaje ("Cultura Metro"), eventos cortos de 1–3 min, calendario festivo real, personajes con oficio, arte minimalista coherente, doble nivel de dificultad, modo paseo/contemplación y multijugador local sin internet.

---

# 11 · Inventario de Láminas Minimalistas Generadas e Incrustadas

| Archivo de Imagen | Encargos Cubiertos | Descripción de la Lámina Minimalista |
|---|---|---|
| `dc417bc7.jpeg` | `G‑00` (`ancla_estilo.png`) | Tablero 4 en 1 sobre papel `#f1ece0`: manzana cenital 3/4 ortogonal, tren de perfil, 3 personajes y ladera con cable. |
| `faea4672.jpeg` | `G‑01`, `G‑02`, `G‑03` | Rosalba: hoja de 4 vistas, 3 expresiones y caminata cenital de 4 cuadros sobre `#FF00FF`. |
| `5b195328.jpeg` | `G‑04` | La Nieta: hoja de 4 vistas, 3 expresiones y caminata cenital de 4 cuadros sobre `#FF00FF`. |
| `076020ea.jpeg` | `G‑05` | Don Efraín: hoja de 4 vistas, 3 expresiones y caminata cenital de 4 cuadros sobre `#FF00FF`. |
| `5b862a36.jpeg` | `G‑06`, `G‑07`, `G‑08` | Doña Marleny, Wílmar y Agente de tránsito: cuerpo entero, retrato 3/4 y vista cenital. |
| `924df75c.jpeg` | `G‑09` | Los 8 pasajeros de Medellín de cuerpo entero y en vista cenital pura. |
| `ad75489d.jpeg` | `G‑10` | Gente de la calle (tinto, arepas, chontaduro, lustrabotas, silletero, músico, ciclista y 3 perros criollos). |
| `ee85029d.jpeg` | `G‑20` a `G‑25` | Las 6 tipologías de estación en perfil plano sobre `#FF00FF`. |
| `ffa77092.jpeg` | `G‑30` a `G‑37` | Toda la flota de vehículos de perfil mirando a la derecha sobre `#FF00FF`. |
| `e8e91ee8.jpeg` | `G‑40`, `G‑50` a `G‑55` | Ladera con Metrocable y sus 6 variantes (noche, tarde, lluvia, alumbrados, feria, velitas). |
| `99b3b13f.jpeg` | `G‑60` (`cas_barrio_hoja.png`) | Cuadrícula 4×4 de casas de barrio en vista cenital 3/4 ortogonal. |
| `a2b435ed.jpeg` | `G‑61` (`cas_poblado_hoja.png`) | Cuadrícula 4×4 de edificios de El Poblado y azoteas verdes. |
| `09aa89f6.jpeg` | `G‑62` y `G‑63` | Cuadrícula 4×4 de parques, canchas, guayacanes, río Medellín y escaleras de la Comuna 13. |
| `3bb14dd3.jpeg` | `G‑70` a `G‑73` (Día) | Las 4 capas panorámicas del centro de día con Catedral, Coltejer, Metrocable y viaducto. |
| `8645faad.jpeg` | `G‑70` a `G‑73` (Noche/Alumbrados) | Las 4 capas panorámicas de noche y Alumbrados con Biblioteca España y comunas iluminadas. |
| `91bc2208.jpeg` | `G‑80` y `G‑81` | Escenas de ambiente: Desfile de Silleteros y Alumbrados navideños del río. |
| `2808d6e4.jpeg` | `G‑82` a `G‑86` | Escenas de ambiente: Velitas, Tango 1935, Comuna 13, Bosque Arví y Aguacero de tarde. |
| `1a997e8e.jpeg` | `G‑90` (Centro) | Concepto isométrico 2:1 de Parque Berrío y el Palacio de la Cultura. |
| `8d1cd4ce.jpeg` | `G‑90` (4 Regiones) | Conceptos isométricos 2:1 de Comuna 13, El Poblado, Río Medellín y Santo Domingo Savio. |
| `259eeec3.jpeg` | `G‑100` | Mosaico isométrico 2:1 repintado fielmente sobre geometría base con estación y Metroplús. |

---

# 13 · Código Fuente Compilado del Arte Minimalista y de la Vista 2:1

### `src/data/arte-minimal.js`
~~~~js
'use strict';
const ArteMinimal = (window.EM = window.EM || {}).arteMinimal = {
  CFG_PERSONAJES: {
    rosalba: { skin: '#f1c9a5', skinLight: '#faf6ec', hair: '#dcd8d0', body: '#12446c', bodyLight: '#1C5C9C', stripe: '#1C5C9C', scarf: '#9fd3e6', bun: true, brow: '#9aa1a8', prop: 'tinto' },
    nieta:   { skin: '#d9a77f', skinLight: '#f1c9a5', hair: '#141414', body: '#1C5C9C', bodyLight: '#2a72b5', pack: '#5a6470', straps: true, shoe: '#fdfbf5' },
    efrain:  { skin: '#f1c9a5', skinLight: '#faf6ec', hair: '#dcd8d0', body: '#5a6470', bodyLight: '#727d8a', mustache: '#dcd8d0', headset: true, brow: '#9aa1a8', prop: 'radio' },
    marleny: { skin: '#b07a52', skinLight: '#d9a77f', hair: '#141414', body: '#c8201f', bodyLight: '#e03534', scarf: '#fdfbf5', bun: true, apron: true },
    wilmar:  { skin: '#8a5a3b', skinLight: '#b07a52', hair: '#141414', body: '#fdfbf5', bodyLight: '#faf6ec', cap: '#1C5C9C', mustache: '#141414' },
    agente:  { skin: '#d9a77f', skinLight: '#f1c9a5', hair: '#141414', body: '#c7e000', bodyLight: '#dff030', stripe: '#fdfbf5', cap: '#fdfbf5', hat: '#fdfbf5' }
  },
  buildTopWalkStrip(cfg) {
    const cv = mkCanvas(64, 16), g = cv.getContext('2d'); g.imageSmoothingEnabled = false;
    const sw = [-2, 0, 2, 0];
    for (let f = 0; f < 4; f++) {
      const ox = f * 16, s = sw[f], px = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(ox + x, y, w, h); };
      px(6 + s, 1, 5, 3, '#141414'); px(7 + s, 2, 3, 2, cfg.body); px(10 + s, 2, 1, 2, cfg.skin);
      px(6 - s, 12, 5, 3, '#141414'); px(7 - s, 12, 3, 2, cfg.body); px(10 - s, 12, 1, 2, cfg.skin);
      px(4, 2, 8, 12, '#141414'); px(5, 3, 6, 10, cfg.body);
      if (cfg.stripe) px(9, 3, 2, 10, cfg.stripe);
      if (cfg.bun)  { px(1, 5, 4, 6, '#141414'); px(2, 6, 3, 4, cfg.hair); }
      if (cfg.pack) { px(1, 4, 4, 8, '#141414'); px(2, 5, 2, 6, cfg.pack); }
      px(4, 3, 8, 10, '#141414'); px(5, 4, 6, 8, cfg.hair); px(10, 5, 2, 6, cfg.skin); px(12, 7, 1, 2, '#141414');
      if (cfg.hat || cfg.cap) { px(4, 3, 8, 10, '#141414'); px(5, 4, 7, 8, cfg.hat || cfg.cap); }
    }
    return cv;
  },
  buildPortrait(cfg, mood = 'neutra') {
    const cv = mkCanvas(64, 64), g = cv.getContext('2d'); g.imageSmoothingEnabled = false;
    const P = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x * 2, y * 2, w * 2, h * 2); };
    P(4, 21, 24, 11, '#141414'); P(5, 22, 22, 10, cfg.body); P(5, 22, 10, 10, cfg.bodyLight || cfg.body);
    if (cfg.stripe) P(5, 24, 22, 2, cfg.stripe);
    if (cfg.scarf) { P(12, 21, 9, 6, '#141414'); P(13, 22, 7, 4, cfg.scarf); }
    if (cfg.straps) { P(8, 22, 2, 10, '#5a6470'); P(22, 22, 2, 10, '#5a6470'); }
    if (cfg.headset) { P(10, 20, 12, 4, '#141414'); P(11, 21, 3, 3, '#5a6470'); P(18, 21, 3, 3, '#5a6470'); }
    P(12, 18, 8, 4, cfg.skin);
    if (cfg.bun) { P(4, 5, 7, 7, '#141414'); P(5, 6, 5, 5, cfg.hair); }
    P(8, 4, 17, 16, '#141414'); P(9, 5, 15, 14, cfg.skin); P(9, 5, 6, 14, cfg.skinLight || cfg.skin);
    P(8, 4, 17, 5, '#141414'); P(9, 5, 15, 4, cfg.hair); P(8, 5, 4, 9, cfg.hair);
    if (cfg.cap) { P(8, 3, 19, 5, '#141414'); P(9, 4, 16, 3, cfg.cap); P(22, 6, 6, 2, cfg.cap); }
    P(14, 9, 3, 1, cfg.brow || '#141414'); P(20, 9, 3, 1, cfg.brow || '#141414');
    if (mood === 'alegre') { P(14, 11, 3, 1, '#141414'); P(20, 11, 3, 1, '#141414'); }
    else { P(14, 10, 2, 2, '#fdfbf5'); P(15, 10, 2, 2, '#141414'); P(20, 10, 2, 2, '#fdfbf5'); P(21, 10, 2, 2, '#141414'); }
    P(18, 12, 2, 3, '#b07a52');
    if (cfg.mustache) P(14, 15, 9, 2, cfg.mustache);
    if (mood === 'alegre') { P(15, 16, 6, 2, '#141414'); P(16, 16, 4, 1, '#fdfbf5'); } else P(16, 17, 5, 1, '#141414');
    return cv;
  },
  compileAll() {
    const out = {};
    for (const [id, cfg] of Object.entries(this.CFG_PERSONAJES)) {
      out['ret_' + id + '_neutra']  = this.buildPortrait(cfg, 'neutra');
      out['ret_' + id + '_alegre']  = this.buildPortrait(cfg, 'alegre');
      out['spr_' + id + '_cenital'] = this.buildTopWalkStrip(cfg);
    }
    return out;
  }
};
~~~~

### `src/js/19-atlas.js` y `src/js/24-iso.js`
~~~~js
'use strict';
const Atlas = EM.atlas = {
  imgs: {},
  ROLE_MAP: { 'Rosalba': 'rosalba', 'Tú': 'nieta', 'Don Efraín': 'efrain', 'Doña Marleny': 'marleny', 'Wílmar': 'wilmar', 'Agente de tránsito': 'agente' },
  init() {
    if (EM.arteMinimal) Object.assign(this.imgs, EM.arteMinimal.compileAll());
  },
  get(id) { return this.imgs[id] || null; }
};

const Iso = EM.iso = {
  kz: 0.9,
  project(x, y, z, cx, cy, z0, s, W, H) {
    const dx = x - cx, dy = y - cy, dz = z - z0;
    return { x: Math.round(W * 0.5 + (dx - dy) * s), y: Math.round(H * 0.5 + (dx + dy) * s * 0.5 - dz * s * this.kz) };
  }
};
~~~~