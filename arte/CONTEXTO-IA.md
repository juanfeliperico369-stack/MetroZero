# CONTEXTO PARA IA · El Metro

> Archivo para subir como **conocimiento** a un Gem de Gemini o a un **Proyecto** de ChatGPT. Contiene el **protocolo**, el contexto completo del proyecto (Bloque 1 de la guía única) y la bitácora del juego. El **rol** de cada IA y sus **encargos** están en `06-guia-unica-ia.md` (o en el documento único `EL-METRO-TODO.md`).

## PROTOCOLO PARA TODA IA · léelo antes que nada

> Este protocolo aplica a **cualquier IA** que trabaje en *El Metro*:
> - Gemini (Nano Banana), Artista 1;
> - ChatGPT, Artista 2;
> - Codex (“astra”), Antigravity (“argon”), Claude Code y cualquier otro agente.
>
> El autor del proyecto pide **precisión**. Para lograrla, cada IA debe **leer todo, reflexionar, comprobar que entendió, probar y auto‑ajustarse** antes de hacer su parte, y debe hacer **solo** su parte.

### Los 7 pasos (en orden, sin saltarse ninguno)
1. **LEE TODO.**
   - Lee el documento completo, de principio a fin: protocolo, guía, contexto, roles, encargos, skills, plan, bitácora, arte, galería y código.
   - Si no te cabe de una vez, **léelo por partes hasta terminarlo**.
   - No empieces a trabajar sin haber leído todo.
2. **REFLEXIONA.**
   - Resume en pocas líneas la misión y la visión, el estado del juego, **tu rol**, **tus encargos** y **lo que NO debes hacer**.
   - Busca dudas, vacíos o contradicciones. Si encuentras alguna, **pregúntala antes de empezar**.
   - Si dos partes chocan, manda el contexto del proyecto (Bloque 1). Si aun así no se resuelve, pregunta.
3. **COMPRUEBA QUE ENTENDISTE.**
   - Responde el **cuestionario de comprensión** (abajo) con lo que leíste.
   - Si dudas o fallas en una respuesta, **vuelve a leer** esa parte antes de seguir.
4. **PRUEBA EN PEQUEÑO.** Antes de producir en serie, haz una prueba corta de tu trabajo y evalúala con la **lista de control**:

   | IA | Prueba |
   |---|---|
   | Gemini | El encargo **G‑00** (ancla de estilo) |
   | ChatGPT | Un ícono del encargo **C‑10** |
   | Agentes de código | `node tools/build.mjs` y `node tools/test.mjs 100` (debe dar 0 errores), y **juega el juego** para conocerlo |
5. **AUTO‑AJÚSTATE.**
   - Corrige tu propia forma de trabajar con lo que te enseñó la prueba.
   - Guarda las **“Reglas aprendidas”** en tus propias instrucciones:

     | IA | Dónde las guardas |
     |---|---|
     | Gemini | Instrucciones de tu **Gem** |
     | ChatGPT | Instrucciones de tu **Proyecto** |
     | Agentes de código | Skills `el-metro-*` (con `skill-creator`) y bitácora |

   - Repite la prueba hasta que pase la lista de control.
   - **Nunca** cambies la misión, la visión ni las reglas del autor sin su permiso; ajusta solo **cómo** trabajas tú.
6. **HAZ SOLO LO TUYO, CON PRECISIÓN.**
   - Ejecuta únicamente los encargos de tu rol, uno por uno.
   - Respeta exactamente la vista, la paleta, el fondo, el tamaño, el nombre de archivo y el formato.
   - Si te piden algo de otra IA, responde a quién le corresponde y no lo hagas.
7. **ENTREGA Y REGISTRA.**
   - Entrega según la guía (Bloque 5: carpetas y nombres).
   - Informa en 5–10 líneas:
     - qué hiciste;
     - cómo lo probaste;
     - qué aprendiste (tus reglas nuevas);
     - qué falta.
   - Los agentes de código actualizan además `docs/BITACORA.md` y, si cambió una regla de trabajo, la skill correspondiente.

### Cuestionario de comprensión (respóndelo antes de trabajar)
1. ¿Cuál es la misión del proyecto, en una frase?
2. ¿Qué IA hace los encargos **G‑** y cuál los **C‑**? ¿Cuál es **tu** rol?
3. ¿Qué color HEX tiene la línea **A**? ¿Y el **Metroplús línea 1**?
4. ¿Qué fondo se usa cuando la herramienta no da transparencia?
5. ¿Desde dónde viene la luz y por qué no se dibuja la sombra proyectada?
6. ¿Qué escala tienen los sprites de vehículos y hacia dónde miran?
7. ¿Qué está **prohibido** en todas las imágenes?
8. ¿Qué es la proyección **dimétrica 2:1** y en qué encargos se usa?
9. ¿Quién es **Rosalba** y cómo se viste?
10. ¿Cuál es el **primer encargo** que hay que hacer y por qué?
11. ¿Qué skill del proyecto debes seguir siempre y cuál solo en el mapa y la vista isométrica?
12. *(Agentes de código)* ¿Qué comando compila el juego, cuál lo prueba con 100 partidas, cuál arma este documento único y qué archivo se actualiza al terminar?
13. ¿Qué haces si te piden algo que no está en tu rol?

> Las respuestas están en este mismo documento. Si una IA no puede contestarlas, todavía no lo ha leído completo.

### Lista de control (para toda entrega)
1. ¿Leí todo y respondí el cuestionario?
2. ¿Es un encargo de **mi** rol?
3. ¿La vista y la proyección son correctas?
4. ¿Los colores son de la paleta, con el color de línea correcto?
5. ¿El fondo es transparente o magenta plano?
6. ¿No tiene sombra proyectada, ni texto, ni logos (salvo que el encargo lo pida)?
7. ¿Se lee bien en tamaño pequeño?
8. ¿Tiene el nombre exacto del encargo?
9. ¿Anoté lo que aprendí en mis “Reglas aprendidas”?

---

=== CONTEXTO DEL PROYECTO «EL METRO» — léelo completo; aplica a todo lo que hagas ===

00) PROTOCOLO (obligatorio)
Antes de cualquier trabajo sigue los 7 pasos del PROTOCOLO PARA TODA IA:
1. lee TODO;
2. reflexiona (misión, estado, tu rol, tus encargos, lo que NO debes hacer);
3. comprueba que entendiste respondiendo el cuestionario de comprensión;
4. prueba en pequeño y evalúate con la lista de control;
5. AUTO-AJÚSTATE: guarda tus "Reglas aprendidas" en tus propias instrucciones y repite hasta pasar;
6. haz SOLO tu parte, con precisión;
7. entrega e informa qué hiciste, cómo lo probaste, qué aprendiste y qué falta.
Nunca cambies la misión, la visión ni las reglas del autor sin su permiso.

0) MISIÓN, VISIÓN Y ESTADO
MISIÓN: que cualquier persona —niños, familias, paisas y visitantes— conozca, use y quiera la red de transporte y la ciudad de Medellín jugando: recorriendo su mapa real, manejando cada vehículo del sistema, cuidando a la gente con la "Cultura Metro" y viviendo sus fiestas.
VISIÓN: ser el gran juego de mundo abierto sobre Medellín y su Metro. Una ciudad fiel (relieve, río, barrios, estaciones y estructuras), con arte propio de calidad y viva de día y de noche. Que funcione sin internet en celulares modestos y se juegue en familia y en red local. Más adelante, crecer a otras redes de metro y trenes del mundo.
VALORES: Cultura Metro (respeto y cuidado), para todo público, fidelidad a la ciudad real, ligereza y accesibilidad, arte original.
ESTADO ACTUAL (v0.5.0, publicado como web y app Android): el juego funciona con dibujo procedural (hecho por código). Lo que falta es el ARTE REAL que ustedes van a producir. La bitácora completa del juego está en el Anexo A de esta guía o en el archivo CONTEXTO-IA.md.

1) QUÉ ES
"El Metro" es un videojuego para celulares (web y Android), sin conexión y para todo público, sobre el Metro de Medellín (Colombia) y la ciudad real del Valle de Aburrá. Es un MUNDO ABIERTO + ARCADE: se recorre la ciudad real a pie, en bici, taxi, bus, metro, metrocable y tranvía.
Módulos:
- Ciudad Libre: mundo abierto visto desde arriba, con misiones, pasajeros, peatones, perros y vendedores.
- Bus: simulador visto desde arriba del Metroplús (articulado de 18 m) y de los alimentadores, de parada en parada, con pasajeros que pasan su tarjeta.
- Metro y tranvía: vista lateral panorámica por capas (cordillera, cerros, laderas con barrios, ciudad) y cabina en primera persona con botones y procedimiento real.
- Metrocable: viajar y operar las 6 líneas de cable.
- Historia "La última vuelta": Rosalba, conductora del primer tren de 1995, vive su última semana de trabajo y le enseña todo a su nieta (la protagonista) recorriendo la ciudad.
- Fiestas reales: el juego cambia con el calendario: Feria de las Flores (agosto), Alumbrados navideños (diciembre), Noche de las Velitas (7 de diciembre) y aniversario del Metro (30 de noviembre).
Restricción técnica: todo el arte se reduce después a pixel art liviano. Por eso se necesita arte limpio, con siluetas claras, la vista correcta y fondo plano.

2) DIRECCIÓN DE ARTE
Concepto: "Medellín de verdad, dibujada con cariño".
- Ciudad vista desde arriba: pixel art denso y acogedor (techos, árboles en masa, río con orillas suaves, lluvia), con la claridad de los juegos clásicos de ciudad vista desde el cielo.
- Panorámica lateral: siluetas planas por capas con bruma; el cielo lo pinta el juego.
- Vista isométrica (nueva, ver sección 10): ciudad en miniatura en proyección dimétrica 2:1.
- 3D: maqueta low-poly limpia.
- Interfaz: estética editorial (papel crema, tinta azul, letras condensadas gruesas) con los colores de las líneas del Metro como acentos.
Reglas para TODA imagen:
- Luz desde arriba a la izquierda. SIN sombra proyectada en el piso (la pone el juego).
- Contorno oscuro fino (#141414) en personajes y vehículos; edificios sin contorno grueso.
- Paleta limitada (máximo 32 colores por imagen), tomada de la sección 3.
- Silueta legible en tamaño pequeño; formas simples; sin texturas fotográficas.
- Fondo magenta plano #FF00FF, o transparente si tu herramienta lo permite, salvo que el encargo diga otra cosa. Nunca fondo blanco.
- PROHIBIDO: texto, letras o números (salvo cuando el encargo lo pida, y en español); logos o marcas reales (ni el logo del Metro ni de empresas); marcas de agua; armas; violencia; alcohol; cigarrillo; pólvora en manos de niños; estereotipos de narcotráfico. Todo es para todo público.
- Arte ORIGINAL: no copies personajes, logos ni escenarios de otros juegos. Las referencias de la sección 8 son solo principios.
- No uses capturas de Google Maps ni de Google Earth como base: sus términos lo restringen. Las bases reales las doy yo, hechas con datos abiertos.

3) PALETAS (HEX)
Líneas del sistema: A #1C5C9C · B #E38835 · T (tranvía) #59AB42 · K #B8CF40 · J #F6C538 · H #EB318E · L #8E612A · M #743D90 · P #EC343A · Metroplús 1 #0E6F76 · Metroplús 2 #65A9AC.
Interfaz: papel #f1ece0 · crema #faf6ec · manteca #fbe7b0 · tinta #154a80 · negro #141414 · noche #0f2a45 · gris #9aa1a8 · blanco #fdfbf5.
Ciudad de día: asfalto #3b3f45 · andén #c9c1ad · ladrillo #b4583a y #9a4630 · teja #a8452f · losa #9e9a92 · eternit #8f9497 · pasto #4f8a3c · árbol #2f6b35 · río #5f7f73 · concreto #a9a59b · vidrio #9fd3e6 · tanque de agua #1d1f24.
Panorámica: día (cielo #3f8bd0 a #d6ecf3, cordillera #7f9fbf, cerros #5f8f86, laderas #3f7f4a, suelo #36663b) · atardecer (#3d2e5f #8e5b7a #f08a5d #f4d9a8) · noche (#08122a #1a2b4f, ventanas #ffd27a #ffb347).
Gente: pieles #f1c9a5 #d9a77f #b07a52 #8a5a3b #5e3b26 · ropa #c8201f #12446c #2f9b57 #c3952f #ff6a3d #7a5cc4 #f9e4a4 #141414 #1b8088.
Fiestas: Feria de las Flores #9b3faf #f7c325 #d7263d #f28c28 #3a7d44 · Alumbrados #fff1c1 #ffc23d #e83e8c #2ec4f1 #0b1530 · Velitas #ffb347 #d62828 #2a9d8f #f4d35e.

4) VISTAS Y TAMAÑOS
- Ciudad (cenital 3/4): desde arriba con unos 15° de inclinación; se ve el techo y una franja de la fachada de abajo. Una casilla del mapa = 20 m.
- Isométrica (dimétrica 2:1): por cada píxel hacia arriba, dos hacia el lado (unos 26,6°); edificios con su altura real.
- Sprites de vehículos: vista superior pura, mirando a la DERECHA. Escala 1 m = 8 px: carro 36×16, moto 16×8, bici 14×6, buseta 64×20, alimentador 96×20, articulado 144×20, coche de metro 176×24, cabina de cable 24×24.
- Peatones: vista superior pura, 16×16 px por cuadro, 4 cuadros de caminar.
- Panorámica: perfil puro, sin punto de fuga, SIN cielo; capas horizontales muy anchas (21:9 o más): cordillera lejana, cerros, laderas con barrios, ciudad cercana.
- Vehículos y estaciones de perfil: perfil puro mirando a la derecha.
- Cabina en primera persona: vertical 9:16 y horizontal 16:9; el parabrisas en magenta plano.
- Retratos: busto en tres cuartos mirando a la derecha, cuadrado.
- Íconos: cuadrados, planos, contorno negro grueso, 2 colores más negro, sin texto.
Las IA generan grande (1024 px o más) y luego se reduce y se pixela. Lo importante: la vista correcta, las proporciones y el fondo plano.

5) CÓMO SE VE MEDELLÍN (TOPOGRAFÍA Y ESTRUCTURAS)
- Valle largo y angosto de norte a sur, a unos 1.495 m de altura. El río Medellín va canalizado en el fondo, con autopistas a lado y lado, y el metro elevado corre junto al río.
- Laderas empinadas a oriente y occidente llenas de barrios de LADRILLO naranja a la vista que suben hasta el monte verde. Las calles de ladera son estrechas, con escaleras y curvas. De noche, las laderas son un "pesebre" de luces cálidas.
- Casas de barrio: 2 a 4 pisos, terrazas planas con tanques de agua negros, varillas esperando el siguiente piso, ropa al sol, escaleras exteriores, algunas fachadas pintadas (menta, amarillo, rosado).
- Otros lugares:
  · barrios tradicionales con techos de teja de barro;
  · El Poblado, con torres altas de ladrillo y vidrio entre mucho verde;
  · el centro, con la Catedral de ladrillo, el Palacio de la Cultura en damero blanco y negro, la Plaza Botero con esculturas de bronce y el Parque de los Pies Descalzos (guadua, agua, arena);
  · el Pueblito Paisa sobre el cerro Nutibara.
- Cerros tutelares: El Volador, Nutibara, Pan de Azúcar, El Picacho y Quitasol. Vegetación: ceibas, guayacanes amarillos y rosados, palmas y guadua.
- Clima de eterna primavera: sol fuerte al mediodía, aguaceros en la tarde, niebla en la madrugada.

6) EL SISTEMA DE TRANSPORTE
- Metro (líneas A y B): viaducto de concreto gris claro sobre columnas, catenaria con postes; estaciones elevadas con cubierta metálica y andén con línea amarilla; trenes de 3 coches con cabina en ambos extremos, carrocería clara con franja de color.
- Metrocable (K, J, L, H, M, P): cabinas pequeñas tipo góndola sobre torres metálicas que suben las laderas pasando por encima de las casas; la L (Arví) entra a un bosque de pinos con neblina.
- Tranvía de Ayacucho: rueda sobre llantas guiado por un riel central, varios módulos, verde #59AB42, sube por una calle de casas de colores.
- Metroplús: buses articulados de 18 m (#0E6F76) en carril exclusivo, con estaciones en el separador de la avenida y puertas de vidrio.
- Alimentadores: buses blancos con franja que bajan de los barrios a las estaciones.
- En la calle: busetas de colores con letrero de ruta, taxis amarillos (#f2c400), muchas motos, bicicletas públicas verdes, chivas (buses escalera pintados a mano) en las fiestas, vendedores ambulantes con carrito (tinto, arepas, chontaduro) y perros criollos.

7) PERSONAJES
- ROSALBA (unos 60 años): conductora del metro a punto de jubilarse. Pelo canoso recogido (#dcd8d0), piel clara cálida (#f1c9a5), uniforme azul (#12446c) con franja (#1C5C9C) y sin logos, pañoleta, termo de tinto, sonrisa cálida.
- LA NIETA (16 años, la protagonista): pelo oscuro, chaqueta azul (#1C5C9C), morral, tenis blancos, mirada curiosa.
- DON EFRAÍN (unos 65 años): controlador del Puesto de Control. Bigote y pelo blancos, chaqueta gris (#5a6470), audífonos de radio al cuello.
- DOÑA MARLENY (unos 55 años): vende arepas en Santo Domingo. Ruana roja (#c8201f), delantal, pelo negro recogido.
- WÍLMAR (unos 40 años): conductor de alimentador. Piel morena (#8a5a3b), camisa blanca, gorra azul, bigote corto, risa fácil.
- AGENTE DE TRÁNSITO (unos 35 años): chaleco reflectivo verde-amarillo (#c7e000), casco blanco, silbato, amable.
- PASAJEROS: estudiantes, abuelos con sombrero aguadeño y carriel, obreros, hinchas, turistas, niños; variedad de pieles.

8) REFERENCIAS DE JUEGOS (solo principios; NO copiar ni nombrar en las imágenes)
- Clásicos de ciudad vista desde arriba (GTA 1, 2, London y Chinatown Wars): ciudad cenital legible, zoom que cambia con la velocidad, contorno de cómic, ruta pintada sobre la calle.
- Arcade móvil (Super Arcade Racing, PAKO Forever, Reckless Getaway, #DRIVE, APEX Racer, FR Legends): siluetas claras, colores vivos, partidas cortas, mezcla de pixel y 3D, personajes expresivos.
- Velocidad y festival (Need for Speed, Forza Horizon): sensación de velocidad, noches de neón, un festival con eventos repartidos por el mapa.
- Vuelo (Simulador de Vuelo 3D, Misiles!, 1945 Air Force): cielos amplios, minimalismo plano, lectura vertical.
- Trenes y puzles (Tiny Rails; de Infinity Games: Railways, Traffix, Package Inc, Infinity Loop, Laser, Laberinto): pixel lateral cálido, minimalismo, código de colores.
- Paisaje y calma (Grand Mountain Adventure, Alto's Odyssey, Townscaper, Town Brush): maqueta low-poly, siluetas por capas con degradados, casas de colores que encajan, pixel art denso con lluvia.
- Ciudades isométricas en pixel art (Isometric NYC; Tiny Barcelona, Madrid, València y Málaga; las de Ciudad de México y Buenos Aires): ciudades reales en miniatura, fieles a su trazado y sus edificios.
- Atmósfera (arte digital de túneles de neón, Holstin, Cairn): noches cinematográficas, pixel isométrico con luz, ilustración estilizada.

9) REPARTO DEL TRABAJO (cada IA hace SOLO lo suyo)
- ARTISTA 1 = GEMINI NANO BANANA, encargos G-:
  ancla de estilo; personajes (hojas, retratos, sprites); fotos reales convertidas a nuestro estilo (estaciones y vehículos de perfil); ladera desde foto; variantes por hora y por fiesta; hojas de casas de barrio; CAPAS PANORÁMICAS por zona y hora; ESCENAS DE AMBIENTE de las fiestas; CONCEPTOS ISOMÉTRICOS por región; REPINTADO de los mosaicos isométricos base que yo genero con datos reales.
- ARTISTA 2 = CHATGPT, encargos C-:
  sprites de vehículos vistos desde arriba con fondo transparente; íconos e insignias; consola de cabina y tablero del bus; letreros en blanco; portada con título y sin título; pantalla de carga; decoraciones de fiesta; TEXTURAS REPETIBLES.

10) INICIATIVA: MEDELLÍN FIEL E ISOMÉTRICA
Meta: que la topografía, el relieve, el río, las vías y las estructuras de Medellín sean fieles. Hoy el juego tiene detalles mal ubicados o mal proporcionados. Se hará una ciudad en miniatura en proyección dimétrica 2:1, como los mapas de ciudades en pixel art (Isometric NYC, Tiny Barcelona, Tiny Madrid y similares).
Cómo:
(a) Yo genero, con datos abiertos (OpenStreetMap, alturas de edificios, modelo de relieve de 30 m), mosaicos BASE en 2:1 con la geometría real: laderas, edificios con su altura, calles, río, viaductos, estaciones y torres de cable.
(b) La IA los REPINTA en nuestro estilo sin mover la geometría.
(c) El juego usa el resultado en la vista isométrica y para corregir la vista desde arriba, la panorámica y el 3D.
Prioridades: el relieve de las laderas, la altura y el trazado del viaducto, la ubicación y forma de las estaciones, las torres y la curva de los cables sobre las lomas, las alturas de El Poblado frente a los barrios, y los lugares icónicos (Catedral, Coltejer, Nutibara, El Volador, Biblioteca España, estadio, aeropuerto Olaya Herrera).

11) ENTREGA
- Cada imagen se guarda con el nombre exacto del encargo: minúsculas, sin tildes ni espacios (por ejemplo ret_rosalba_alegre.png).
- Formato PNG, con fondo transparente o magenta #FF00FF.
- Una imagen por encargo, o la hoja que se pida.

12) BITÁCORA
La bitácora completa del juego (qué se construyó, versiones, pruebas, qué falta) está en el ANEXO A. Léela para entender en qué punto está el proyecto. No tienes que hacer nada con ella.

13) SKILLS DEL PROYECTO (tenlas en cuenta)
El proyecto tiene skills: instrucciones de trabajo en formato SKILL.md. Están en el archivo SKILLS-IA.md, y en el repositorio en .agents/skills/ y .claude/skills/.
- el-metro-arte: dirección de arte, paletas, vistas, reparto de encargos, revisión e integración. La siguen TODAS las IA.
- medellin-fiel: topografía, relieve, estructuras y vista isométrica 2:1. Se usa en los encargos G-90 y G-100 y en todo lo del mapa.
- el-metro-desarrollo: cómo compilar, probar y publicar el juego (para agentes de código).
- frontend-design, webapp-testing y skill-creator: skills oficiales de Anthropic (Apache-2.0) para diseño de interfaz, pruebas en el navegador y crear skills (para agentes de código).
Si una instrucción de una skill choca con este contexto, manda este contexto.
=== FIN DEL CONTEXTO ===

---

# ANEXO A · BITÁCORA DEL JUEGO

### Bitácora · El Metro

> Guía viva del proyecto. Quien retome el trabajo (persona o IA) debe leer esto, `docs/PLAN.md` y `arte/README.md`, y actualizar esta bitácora al cerrar cada sesión.

#### Estado al 2026-11-17 · v0.7.0 "Medellín reconocible"
**Novedad de v0.7.0:** el mapa se corrige y se nombra con **datos abiertos oficiales** (`src/data/ciudad.js`, de `tools/ciudad_datos.py`):
- **90 mil casillas corregidas:** las "andén" que en realidad eran lotes dentro de manzanas ahora son casas o edificios; parques y plazas reales;
- **502 barrios** (Medellín, Itagüí, Envigado y Sabaneta) y **2.438 nombres de calle** (nomenclatura oficial y nombres populares);
- **lotes catastrales** para dividir las casas;
- rótulos en el mapa, barrio en el HUD y un letrero al entrar a otra calle o barrio;
- casas con la fachada hacia su calle, andenes con bordillo y plazas y peatonales rediseñadas.

v0.6.0 trajo el arte de Gemini y ChatGPT y el primer rediseño del mapa. El HTML pesa ~2,7 MB.

##### Estado anterior · v0.5.0 "La historia en la ciudad"
**Qué es:** un videojuego offline (un solo `index.html`, ~1,8 MB) sobre el Metro de Medellín y el Valle de Aburrá, construido sobre el **mapa real** (casillas de 20 m, OSM + relieve SRTM, tomado de "Juega EnCicla"). Un único mundo con módulos de simulación, no minijuegos:

| Módulo | Archivo | Qué hace |
|---|---|---|
| Ciudad Libre | `36-libre.js` + `35-ciudad.js` | Mundo abierto cenital estilo GTA 1/2: a pie, bici, moto, taxi, camioneta; abordar metro/tranvía/cables/buses reales; oficios por radio; Cívica al abordar. |
| Bus (Metroplús y alimentadores) | `38-bus.js` | Simulador cenital de estación a estación por calles reales: pasajeros que esperan y suben validando la Cívica (bip; a veces sin saldo y recargan), puertas, semáforos, tráfico, horario, confort, asistente de carril. 35 rutas (MP1, MP2, O y 15 alimentadores). |
| Metro | `30-conduce.js` + `31-cabina.js` + `23-lado.js` | Metro y tranvía en vista panorámica 2D (relieve real en capas, laderas con barrios que se encienden de noche, calle con carros y gente bajo el viaducto, estaciones con techo) y cabina 1ª persona con **procedimiento real**: llave, selector de sentido, señal de salida, vigilante (hombre muerto), puertas por lado del andén, anuncio, botonera iluminada y **Escuela de conducción** (9 pasos). También 3ª persona/cine (WebGL). |
| Metrocable | `52-cableviaje.js` | Opera la línea: viento, péndulo de la cabina, tormentas, fotos en miradores; vista lateral o 3D. |
| Guía | `67-guia.js` | Aprende a usar el Metro: Cívica, cómo viajar, líneas, Cultura Metro, datos. |
| Historia en la ciudad | `37-trama.js` (+ ganchos en `36-libre.js`) | "La última vuelta" jugada en el mapa: 8 capítulos con pasos (hablar, ir, abordar una línea, bajarse en una estación, postal, orientar pasajeros, manejar) sobre la red real: Niquía → Madera (escuela) → metro a Acevedo → cable K a Santo Domingo → alimentador C6‑001 a Santa Rita → metro a Hospital → Metroplús a Parque Aranjuez → tranvía en San Antonio → hora pico (orientar) → Niquía → La Estrella. Personajes con nombre en el mapa, diálogos con voz opcional, título de capítulo, ⏩ para adelantar viajes. Al terminar cada módulo se vuelve a la ciudad en la estación de llegada. Progreso en `Save.d.trama`. |
| Historia clásica | `70-historia.js` | Los 11 capítulos con escenas pixeladas que llevan a cada módulo (siguen disponibles en el menú Historia). |
| La Red / Juntos / Arcade | `60-mapa.js`, `80-multi.js`, `40/45/50-*.js`, `32-volante.js` | Mapa‑gerencia; multijugador local (duelo, QR Wi‑Fi, servidor `server.mjs`); los puzles antiguos quedaron como "Arcade". |

**Mundo vivo:** `18-mundo.js` (reloj ×30/real/día/noche, clima por temporada y hora con semilla del día, fechas: aniversario 30/11, Alumbrados, Velitas, Novena, Navidad, Año Nuevo, Feria de las Flores, Silleteros, 20 de julio, 7 de agosto, Antioqueñidad, Amor y Amistad, Halloween, Madre, Semana Santa). `35-ciudad.js`: transporte real en movimiento con paradas, peatones con rumbo/paraguas/miedo/conversación, gente esperando el bus, vendedores ambulantes, tráfico en carriles reales con semáforos de 32 s, sombras por sol, faros, postes, ventanas encendidas.

**Arte:** `10-map.js` casillas de 16 px dibujadas por **manzanas/lotes** (tejados unidos por lote con tanques, aires, paneles, terrazas verdes; fachada sur con ventanas y toldos; sombras en capa aparte; barrios de ladrillo con 2–3 casas por casilla y techos de teja/plancha/eternit, ropa tendida; carros parqueados, árboles y bancas en andenes; avenidas con carriles, línea amarilla en calles locales y cebras solo en cruces reales), viaductos con rieles, andenes, torres de cable; `21-sprites.js` sprites cenitales con detalle (metro por carros con cabina, articulado con fuelle, alimentador, taxi con aviso, carros, motos, cabinas, peatones con cabeza/brazos/paraguas, carrito de vendedor); `22-gl.js` 3D low‑poly propio (WebGL 1; viaducto de concreto con balasto, rieles de acero y pretiles; sin edificios encima de la vía); `23-lado.js` panorámica por capas (cordillera y laderas con barrios de ladrillo y monte por ruido suave, en tira cacheada; luces de ventanas de noche; fachadas y árboles de primer plano anclados al mundo).

**Datos:** `src/data/red.js` (31 líneas, 222 paradas, 97 datos de línea, 58 de estación, 38 trivias; fuentes en `docs/FUENTES.md`), `rutas.js` (recorridos de bus por calles reales, A*), `lugares.js` (45 lugares reales con postal), `valle.js` (mapa).

**Pruebas:** `node tools/test.mjs 100` → selfTest (datos, solubilidad, rutas) + partidas automáticas en todos los modos + recorrido de pantallas. Última corrida: ver Historial v0.4.0. El bot también vive en el menú (🤖).

**Publicado:** https://juanfeliperico369-stack.github.io/MetroZero/ (rama `gh-pages`; **v0.7.0 verificada el 2026-11-17**: carga, service worker con caché `el-metro-v0.7.0-d9668e14`, sin conexión, instalable, 0 errores de consola). APK: `/el-metro.apk` (versionCode 7, 4,3 MB). Todo en un archivo: `/El-Metro-TODO.html`; documento único: `/EL-METRO-TODO.md`.

#### Carpeta de arte (`arte/`, 2026-11-17)
Investigación visual y guía de producción para el arte definitivo:
- biblia de estilo, 32 referencias de juegos analizadas (incluye los 4 reels del autor), identidad visual de Medellín y su transporte, historia del Metro y de la ciudad con fuentes, folclor y calendario de fiestas, y diseño de mundo abierto + arcade;
- **guía única de prompts** (`06-guia-unica-ia.md`) para **dos IA**: Gemini Nano Banana (encargos G‑) y ChatGPT (encargos C‑). Midjourney salió del plan: sus panorámicas, ambientes de fiesta y conceptos pasaron a Gemini, y las texturas y la portada sin título a ChatGPT. La guía trae **misión, visión, estado**, la dirección de arte y **la bitácora completa como Anexo A** (sincronizada por `tools/arte.mjs`, que también genera `arte/CONTEXTO-IA.md` para subir como conocimiento a un Gem de Gemini o a un Proyecto de ChatGPT);
- **Protocolo para toda IA** (`arte/PROTOCOLO-IA.md`, fuente única), en 7 pasos:
  1. leer TODO;
  2. reflexionar;
  3. responder el cuestionario de comprensión;
  4. probar en pequeño;
  5. auto‑ajustarse guardando “Reglas aprendidas” en sus propias instrucciones;
  6. hacer solo su parte con precisión;
  7. entregar y registrar.

  Va al inicio de la guía única (sincronizado), en el Bloque 1 (00), en los roles (el cuestionario es obligatorio antes del primer encargo), en `CONTEXTO-IA.md` y en `AGENTS.md`, `CLAUDE.md` y `GEMINI.md` (raíz, generados), que los agentes de código leen solos.
- **Documento único compilado** `dist/EL-METRO-TODO.md` (~950 KB): protocolo, léeme, guía, skills, plan, bitácora, toda la investigación de arte, galería y el **código fuente completo** del juego (60 archivos). El mapa binario `valle.js` solo va descrito. Lo genera `node tools/todo.mjs`.
- **Archivo único** `node tools/todo.mjs` → `dist/El-Metro-TODO.html` (~1,6 MB):
  - incluye el **juego jugable comprimido adentro** (▶ Jugar), la guía única, las skills, el plan, la bitácora, toda la carpeta de arte y la galería;
  - desde ahí se descargan `TODO.md` (todo el texto para IA), `CONTEXTO-IA.md`, `SKILLS-IA.md` y el juego suelto;
  - plantilla en `tools/todo-plantilla.html`; publicado en la raíz de GitHub Pages.
- **Skills del proyecto** (formato abierto Agent Skills, `SKILL.md`) en `.agents/skills/`, que leen Codex y Antigravity; `tools/skills.mjs` las copia a `.claude/skills/` para Claude Code y arma `arte/SKILLS-IA.md` para los Gems y Proyectos.
  - Tres propias: `el-metro-desarrollo` (código, pruebas y publicación), `el-metro-arte` (dirección de arte, encargos e integración) y `medellin-fiel` (relieve, estructuras e isométrica 2:1).
  - Tres oficiales de [anthropics/skills](https://github.com/anthropics/skills) (Apache‑2.0, commit `e4bb5d9`): `frontend-design`, `webapp-testing` y `skill-creator`.
  - Plugins de Claude recomendados: image-generation, playwright, Android Emulator QA y Unity (opcional).
  - La guía única las incluye (Bloque 6 y sección 13 del contexto).
- **Fase 1b del plan · Medellín fiel e isométrica:** relieve de 30 m, alturas de edificios por casilla, viaducto, estaciones y cables medidos, vista dimétrica 2:1 procedural y repintado con IA (G‑100) de zonas héroe. Referencias: Isometric NYC, Tiny Barcelona, Madrid, València y Málaga, CDMX, Buenos Aires, isometriccities.com y tinyworlds (detalle en `docs/PLAN.md`);
- 71 fotos de referencia con licencia libre, enlazadas desde Openverse con autor y licencia (`galeria.md`/`galeria.json`). Las descargas directas desde Wikimedia y Flickr están bloqueadas en la nube;
- `node tools/arte.mjs` genera `arte/index.html`: una página con todo, botones de copiar en los prompts, muestras de color y galería. Publicada en `/arte/` de GitHub Pages.

**Siguiente paso:** cuando el autor traiga el arte (estructura en `arte/08-entregas-e-integracion.md`), limpiar el magenta, cuantizar a la paleta, armar atlas y conectarlos en `10-map.js`, `21-sprites.js`, `23-lado.js`, `31-cabina.js` y `37-trama.js`, siempre con respaldo procedural.

#### Historial
##### v0.7.0 (2026-11-17) — Medellín reconocible
Pedido del autor: “dibuja bien el mapa, dale vida, que sea preciso en ubicaciones y zonas; los peatonales están desordenados y sin sentido, lo mismo los barrios y la división de las casas; el corazón es reconocer cada calle, cada zona, cada barrio”.

1. **Diagnóstico medido:** cruzando el mapa con las **manzanas catastrales** de Medellín, entre el **88 y el 97 % de las casillas “andén” caían dentro de manzanas**. No eran andenes: eran lotes construidos que la fuente original (Overture/OSM) no marcó. Por eso se pintaba adoquín donde hay casas.
2. **Datos oficiales:**
   - `tools/ciudad_descarga.py` baja de ArcGIS Online, una vez, las capas abiertas de la Alcaldía de Medellín: barrios, manzanas, malla vial 2026, jerarquía vial, espacio público y 312.716 lotes (solo centroide y área). También los barrios de Itagüí, Envigado y Sabaneta.
   - `tools/ciudad_datos.py` genera `src/data/ciudad.js` (329 KB) **sin tocar el mapa base**:
     - **parche** de 89.446 casillas, que se aplica al cargar: andén dentro de manzana → casa o edificio según el tamaño de sus lotes; espacio público → parque o plaza. Fuera de Medellín se usa la regla medida en Medellín. No se tocan las plazas a ≤ 60 m de cada estación de la red ni los lugares emblemáticos;
     - **barrios** en una grilla de 80 m;
     - **nombre por casilla de vía**: dos capas, nomenclatura y nombre popular, con código predictivo;
     - **lotes por casilla construida** (2 bits);
     - **656 lugares** con nombre.
3. **En el juego (`10-map.js`):**
   - `MAP.ciudad()` decodifica todo al cargar (+~150 ms);
   - `MAP.barrioAt`, `MAP.calleAt` y `MAP.lotT`;
   - `MAP.drawLabels`: calles rotuladas siguiendo su dirección (nombres populares en mayúscula), parques y plazas, y barrios en mayúsculas espaciadas a media distancia; evita que se encimen.
   - Se usa en Ciudad Libre, en el simulador de bus y en La Red.
   - **HUD con el barrio** y **letrero** al entrar a otra calle o barrio (Ciudad Libre).
4. **Dibujo:**
   - **andén con bordillo** dentro de cada casilla de vía (calle 3 px ≈ 4 m, avenida 2 px; la autopista solo berma);
   - **casas con fachada hacia su calle** (sur, este, oeste o norte), divididas según los lotes catastrales;
   - techos de teja, eternit o **terraza paisa**: tanque, ropa tendida, columnas con varilla “para el segundo piso”, matas y, de vez en cuando, un perro;
   - patios interiores de manzana;
   - **peatonales de adoquín trabado** y **plazas de losas con franjas de ladrillo**, carritos con sombrilla y bancas con farol;
   - los lugares emblemáticos ya no son rectángulos planos: solo su ícono (iglesia, estadio, pista, rocas de la Biblioteca España) y su nombre.
5. **Atribución:** la licencia abierta del Catastro exige citar y declarar las transformaciones. Va en créditos, en La Red y en `docs/FUENTES.md`.
6. **Pruebas:**
   - el autotest verifica el parche, los 502 barrios y los 2.438 nombres, además de casos reales: Parque Berrío en La Candelaria; Carrera 50, Carrera 80, Calle 67 y Sistema Vial del Río junto a sus estaciones;
   - 100 partidas, 0 errores; ~15 ms por trozo, igual que antes;
   - capturas en Niquía, Parque Berrío, San Antonio, Santo Domingo, Prado, Floresta, Estadio, Manrique, Bello, Madera e Itagüí.
7. **Pendiente:**
   - barrios de **Bello** (y del norte y el sur del valle): no se encontró capa abierta, y Nominatim respondió “429, demasiadas solicitudes” desde la nube;
   - anchos reales de calle por casilla (la malla trae el ancho);
   - casillas G‑60 a G‑63 de Gemini en un acercamiento.

##### v0.6.0 (2026-11-17) — el arte llega a la ciudad
1. **Entregas verificadas y ordenadas** en `arte/entregas/` (ver `INVENTARIO.md`):
   - 20 láminas de Gemini con el nombre de su encargo;
   - 92 SVG de ChatGPT recuperados de su documento maestro;
   - sus 8 scripts regeneran los vehículos **idénticos byte a byte** (31 de 33);
   - miniaturas de las texturas.
   - Se corrigieron afirmaciones: no existió una v0.5.1; la **Línea O es de buses eléctricos** por la 80 (el Metro de la 80 será la **Línea E, rosada**); el código propuesto por Gemini en `src/data/` se habría borrado al cargar.
2. **`tools/arte_juego.py` → `src/data/arte.js`:**
   - recorta las láminas por segmentación del fondo magenta, quita el fondo sin tocar los rosados interiores y reduce a WebP;
   - minifica los SVG.
   - La lista con su uso queda en `arte/entregas/USO-EN-EL-JUEGO.md`.
3. **`Atlas` (`19-atlas.js`):** `has`, `url`, `img`, `tag`, `ico`, `retrato` (gesto alegre, triste o neutro según la frase), `fiesta` (adornos según el calendario) y `check` (autotest).
4. **En el juego:**
   - portada C‑40; íconos C‑10 en las tarjetas de modos; íconos C‑11 en la cabina y en Ciudad Libre;
   - medallas C‑12 y **2 logros nuevos** (Feria de las Flores y Alumbrados);
   - adornos C‑50 en la portada durante las fiestas;
   - pantalla C‑41 en el menú de historia;
   - **retratos** de Rosalba, la nieta, Don Efraín, Doña Marleny, Wílmar, la agente y el pasajero en los diálogos;
   - **tarjeta ilustrada por capítulo**: panorama nocturno, ladera al atardecer, aguacero, tango y Gardel, centro isométrico, panorama de día, Rosalba en el andén y la portada.
5. **Mapa cenital (`10-map.js`) rediseñado** tras la queja del autor (“parecía un parqueadero”):
   - cada casilla de vía se clasifica como tramo vertical, tramo horizontal o cruce, midiendo solo con vías **del mismo tipo** (en los datos, autopista, avenida y viaducto vienen pegados);
   - un cruce solo se marca si llega una vía transversal;
   - calles con una línea amarilla; avenidas con **separador verde y árboles** (algunos guayacanes); autopista con **barrera de concreto**; calzadas cada dos casillas en franjas muy anchas;
   - **cebras solo a la entrada de los cruces**;
   - puentes y viaducto como losa de concreto; río con **muros de canal** y brillos sueltos (sin rayas); quebradas con orilla verde;
   - **escaleras** orientadas por la pendiente real, con baranda; **ciclorrutas** como carril verde sobre andén;
   - andenes y plazas más sutiles; techos más variados (menos tanques);
   - suavizado al alejar (sin titileo).
   - Mismo rendimiento: ~15 ms por trozo.
6. **Fidelidad medida contra OpenStreetMap** (`tools/osm-ventanas.mjs` + `tools/osm_comparar.py`) en centro, Niquía y Santo Domingo:
   - 98–100 % de las calles reales a ≤ 20 m de una vía del juego; 99,5–99,9 % de las vías del juego existen; 457 de 457 tramos con nombre.
   - **No es exacto:** anchos (todo mide 20 m), curvas en escalera, glorietas, edificios (procedurales) y alturas (por comuna).
7. **Servidor local (`tools/server.mjs`):**
   - se confirmó la caída de la auditoría de ChatGPT (`GET /%E0%A4%A` tumbaba el proceso) y se corrigió;
   - además: rutas resueltas dentro de la carpeta, salas de 4, tramas enmascaradas y acotadas.
   - `tools/test-servidor.mjs` hace 16 comprobaciones (con el servidor viejo fallan 11) y corre dentro de `test.mjs`.
8. **Pruebas:**
   - autotest con 78 piezas de arte verificadas; 100 partidas, 0 errores, 0 de consola;
   - capturas de portada, modos, logros, historia, tarjetas y diálogo;
   - banco del mapa en 8 sitios reales a 3 escalas.
   - Un error que el bot no veía (un comentario que anulaba la tarjeta del capítulo) salió en las capturas y se corrigió.

##### v0.5.0 (2026-11-17) — la historia se juega dentro de la ciudad
1. Nuevo `37-trama.js`: motor de pasos (hablar, ir, abordar, bajar, foto, orientar, módulo) con datos validados por el autotest (`Trama.check`): estaciones, líneas, niveles y postales deben existir.
2. Personajes en el mapa (Rosalba, Don Efraín, Doña Marleny, Wílmar, agente de tránsito, pasajeros con ❓) con nombre y marcador; conversación en caja inferior con voz opcional; preguntas de orientación de rutas reales (A→K, B→J, T→H, T→M, A→P, A→K→L…).
3. Módulos encadenados: "¡Vamos!" lanza el metro/cable/bus/tranvía y al terminar vuelve a Ciudad Libre en la estación de llegada (`Trama.place`), avanzando el capítulo.
4. Ciudad Libre: barra de capítulo con distancia, flecha y punto en el minimapa (`st.goal`), botón ⏩ (×5 al viajar o esperar en una estación), preferencia de línea al abordar en estaciones compartidas (`Ciudad.atHub(..., pref)`), los oficios se pausan durante la historia.
5. Panorámica: paleta de día tipo ilustración (cordillera azul, cerros intermedios, suelo verde), capa intermedia `R.inter` para escalonar siluetas, sin "ruido" de casas en la cordillera de día (solo luces de noche).
6. Menú Historia: "Nuevo · la historia en la ciudad" (empezar/seguir/reiniciar) sobre los capítulos clásicos.
7. Pruebas: autotest con 8 capítulos validados; 100 partidas, 0 errores, 0 de consola, todas las capturas; prueba guiada en Chromium (hablar → manejar → volver a Madera; abordar en Madera con ⏩ y bajarse en Acevedo).

##### v0.4.0 (2026-11-17) — ciudad de verdad, cabina real, laderas
1. Ciudad cenital redibujada por lotes y manzanas (`10-map.js`): tejados unidos, fachadas, sombras, tanques, barrios de ladrillo variados, carros parqueados, árboles de andén, carriles en avenidas, cebras solo en cruces.
2. `31-cabina.js`: procedimiento de cabina (llave → sentido → señal → tracción; vigilante cada 25–40 s; puertas del lado correcto según el andén; anuncio) con botonera iluminada y Escuela de conducción de 9 pasos (`A:0-2#escuela`).
3. 3D: sin edificios bajo/encima del viaducto (`G3.railMask`), tablero de concreto con balasto, rieles claros y pretiles.
4. Panorámica: laderas con barrios (comunas) y monte con ruido de valor, filo iluminado y bruma; de noche las laderas se llenan de luces; fachadas con ventanas/toldos y árboles de primer plano anclados al mundo (antes "saltaban"); título de estación más abajo en horizontal.
5. Bus: validación Cívica al subir (bip, pasajeros sin saldo que recargan), pasajes en el HUD y en el resumen.
6. **Corrección importante:** los buses largos se trababan contra esquinas de manzana (casillas de 20 m) al girar y el piloto automático no avanzaba; ahora el corredor de la ruta (±7 m) es transitable (`st.lane` en `38-bus.js`, usado por `Libre.drive`).
7. Ciudad: perros callejeros y paseados con correa (`Spr.dog`), ladran cuando un vehículo los asusta; no son clientes de taxi.
8. Pruebas: 100 partidas (0 errores) + 60 partidas con la versión final (0 errores, 0 de consola). `tools/test.mjs` reintenta capturas lentas (SwiftShader tarda en la primera captura de cada modo).

##### v0.3.0 (2026-11-17) — rediseño por retroalimentación del autor
1. Se abandona el enfoque de minijuegos: el menú ahora son módulos de simulación sobre el mapa; los puzles pasan a "Arcade".
2. Nuevo `38-bus.js` (simulador cenital de Metroplús/alimentadores) con pasajeros que esperan y abordan, puertas, horario, paradas perdidas, confort, semáforos, choques; rutas se "abren" al completarse.
3. Metro: vista panorámica 2D por defecto (recuerda la última vista), cabina rediseñada, diagrama de línea, otros trenes en la vía, estaciones con techo/letrero/gente, calle con carros y peatones y fachadas de primer plano.
4. Sprites nuevos (`21-sprites.js`), cebras, vendedores, Cívica al abordar, guía educativa, reloj configurable.
5. Correcciones: `#gctl` ocupa toda la pantalla (barras de misión visibles), luces de ventanas cacheadas por trozo, bucle congelable para capturas, pendientes limitadas para buses.
##### v0.2.0 (2026-11-16)
Ciudad Libre, Al volante 3D, Metrocable viaje, 3D WebGL, vista lateral, mundo (reloj/clima/fechas), paleta oficial de líneas, pedales/inclinar.
##### v0.1.0 (2026-11-16)
Base: HTML único, mapa real, red completa, puzles (Despacho, Alimentadores, Metroplús, Cable), La Red, historia, misiones/logros, multijugador local, APK, PWA, bot.

#### Qué falta (prioridad)
0. **Medellín fiel (Fase 1b):**
   - **capa vectorial de OpenStreetMap**: ejes de vía con su ancho, glorietas, curvas y **nombres de calles**;
   - **huellas reales de edificios** y usos del suelo;
   - estructuras (viaducto, estaciones, cables) y la **Maqueta 2:1**.
   - Hay que decidir cuánto peso aceptar (ver `docs/auditorias/2026-11-17-fidelidad-mapa-osm.md`).
   - El extracto de OSM (Geofabrik) está bloqueado desde la nube: procesarlo en el PC del autor o en una GitHub Action.
0b. **Arte, fase 2:**
   - estaciones y vehículos de perfil de Gemini (G‑20 a G‑37) en la panorámica;
   - consolas C‑20/C‑21 en la cabina; señalética C‑30;
   - casillas G‑60 a G‑63 en un acercamiento de Ciudad Libre;
   - variantes de ladera G‑50 a G‑55 en el Metrocable.
   - Pedir a ChatGPT el ZIP con las texturas de 1024 px y a Gemini la ladera de día (G‑40).
0c. **Firma de la APK:** hoy se firma con la clave de desarrollo del repositorio (lo señaló la auditoría). Cambiarla impide actualizar las APK instaladas: lo decide el autor.
1. **Arte "real":** sprites y tiles hechos a mano o generados por IA (ver `arte/06-guia-unica-ia.md`), fondos pintados para la panorámica (cerros, Alumbrados), cabina del metro con foto‑referencia, portada/compartir ilustrados.
2. **Bus:** interiores en parada (cámara que se acerca), pasajeros con destinos, cobro con Cívica, paradas intermedias reales de Metroplús (en la mediana), pico y placa/hora pico, 3D opcional dentro del simulador.
3. **Metro:** señales en la vía (ATP real), anuncios de voz grabados, interior del tren (pasajeros), tramos nocturnos con Alumbrados, cables desde el metro, escuela también para tranvía (pantógrafo, señales de tranvía).
4. **Ciudad Libre / historia:** sesión 2 de la historia (Alumbrados, cable Arví, línea J y Comuna 13, Metro de la 80), escenas de corte con los personajes, más NPC (policía de tránsito, ciclistas EnCicla), interiores de estación, retos de tiempo, cooperativo.
5. **Datos:** alimentadores del sur (Itagüí, Envigado, Sabaneta, Bello) y paraderos exactos; estaciones de Metroplús en la mediana con sus accesos.
6. **Técnico:** trozos del mapa en Web Worker (hoy ~50 ms por trozo de 640 m al entrar en zona nueva), probar en celulares reales (rendimiento 3D y cenital, WebRTC), modo Bluetooth/“Cerca” nativo en el APK, lector QR JS para iPhone, sonido de motor por vehículo, música por módulo.
