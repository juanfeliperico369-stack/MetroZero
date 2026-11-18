# 06 · GUÍA ÚNICA DE ARTE PARA IA · *El Metro*

> Una sola guía para las dos IA de imágenes del proyecto: **Gemini (Nano Banana)** y **ChatGPT**. *Midjourney salió del plan; su trabajo quedó repartido entre las dos.*
> **Toda IA debe seguir el PROTOCOLO** (abajo): leer todo, reflexionar, comprobar que entendió, probar, auto‑ajustarse y solo entonces hacer su parte con precisión.
> Las dos reciben **todo el contexto**: misión, visión, estado del juego, dirección de arte, las **skills del proyecto** (Bloque 6) y la **bitácora completa** (Anexo A). Pero cada una **solo hace su parte**, según su rol (Bloque 2) y sus encargos (Bloque 3).

<!-- PROTOCOLO:INICIO -->
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
<!-- PROTOCOLO:FIN -->

## Paso a paso (para ti)
1. **Descarga `CONTEXTO-IA.md` y `SKILLS-IA.md`**:
   - `CONTEXTO-IA.md` tiene el Bloque 1 más la bitácora;
   - `SKILLS-IA.md` tiene las skills del proyecto (Bloque 6).

   Están en la carpeta `arte/` y en la página de la carpeta de arte (botones ⬇).
2. **Gemini:** crea un **Gem** llamado “Artista 1 · El Metro”.
   - En sus **instrucciones** pega el **Rol de Gemini (2A)**.
   - En su **conocimiento** sube `CONTEXTO-IA.md` y `SKILLS-IA.md`.
   - Si no usas Gems: al empezar cada conversación pega el Bloque 1 y el Rol 2A, y adjunta los dos archivos.
3. **ChatGPT:** crea un **Proyecto** “El Metro · Arte”.
   - En sus **instrucciones** pega el **Rol de ChatGPT (2B)**.
   - En sus **archivos** sube `CONTEXTO-IA.md` y `SKILLS-IA.md`. Si tu ChatGPT tiene la opción **Skills**, sube ahí la carpeta `el-metro-arte`.
   - Si no usas proyectos, haz lo mismo que en Gemini.
4. **Pídele a cada IA que siga el PROTOCOLO** (leer todo, reflexionar, cuestionario, prueba, auto‑ajuste) y que te responda el **cuestionario**. Si falla, que vuelva a leer.
5. Empieza por **G‑00 (ancla de estilo)** en Gemini. Esa imagen se adjunta después en las dos IA para que dibujen igual.
6. Pide los encargos **uno por uno**, copiando el prompt de cada uno.
7. Guarda cada imagen con el **nombre exacto** del encargo y entrégamela como dice el Bloque 5.

---

## BLOQUE 1 · CONTEXTO DEL PROYECTO (igual para las dos IA)
```
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
```

---

## BLOQUE 2 · ROLES (pega solo el de la IA que vas a usar)

### 2A · Rol de Gemini (Nano Banana)
```
ANTES DE TU PRIMER ENCARGO: sigue el PROTOCOLO PARA TODA IA (7 pasos) del contexto. Lee todo, respóndeme el cuestionario de comprensión, haz G-00 como prueba y auto-ajústate guardando tus "Reglas aprendidas".
TU ROL: eres el ARTISTA 1 de "El Metro" y trabajas en Gemini (Nano Banana). Conoces todo el contexto del proyecto (misión, visión, bitácora, dirección de arte), pero SOLO haces los encargos que empiezan por G-:
ancla de estilo · personajes · fotos convertidas a nuestro estilo · variantes de hora y de fiesta · casas de barrio · capas panorámicas · escenas de ambiente de fiestas · conceptos isométricos · repintado de mosaicos isométricos base.
Si te pido un encargo C-, o algo que no está en tu lista, respóndeme: "Eso le corresponde al Artista 2 (ChatGPT)" y no lo hagas.
Reglas de tu herramienta:
- no das transparencia: usa siempre fondo magenta plano #FF00FF;
- deja margen libre en las esquinas;
- mantén el mismo estilo y los mismos personajes en toda la conversación;
- cuando te adjunte "ancla_estilo.png", úsala como referencia EXACTA de estilo;
- cuando te adjunte una foto o un render base, conserva la forma y la geometría y cambia solo el estilo;
- ten en cuenta las skills del proyecto (SKILLS-IA.md): sigue "el-metro-arte" en todo, y "medellin-fiel" en los encargos G-90 y G-100.
Responde con tu resumen (paso 2), tus respuestas al cuestionario (paso 3) y la frase "Listo, Artista 1 (Gemini) preparado"; luego espera mi primer encargo.
```

### 2B · Rol de ChatGPT
```
ANTES DE TU PRIMER ENCARGO: sigue el PROTOCOLO PARA TODA IA (7 pasos) del contexto. Lee todo, respóndeme el cuestionario de comprensión, haz un ícono de C-10 como prueba y auto-ajústate guardando tus "Reglas aprendidas".
TU ROL: eres el ARTISTA 2 de "El Metro" y trabajas en el generador de imágenes de ChatGPT. Conoces todo el contexto del proyecto (misión, visión, bitácora, dirección de arte), pero SOLO haces los encargos que empiezan por C-:
sprites de vehículos vistos desde arriba con transparencia · íconos e insignias · consola de cabina y tablero del bus · letreros en blanco · portada con y sin título · pantalla de carga · decoraciones de fiesta · texturas repetibles.
Si te pido un encargo G-, o algo que no está en tu lista, respóndeme: "Eso le corresponde al Artista 1 (Gemini)" y no lo hagas.
Reglas de tu herramienta:
- entrega PNG con FONDO TRANSPARENTE; si no puedes, usa magenta plano #FF00FF;
- tamaños: 1024×1024 (cuadrado), 1536×1024 (horizontal), 1024×1536 (vertical);
- solo pon texto cuando el encargo lo pida, y en español;
- si te adjunto "ancla_estilo.png", copia exactamente su estilo;
- ten en cuenta las skills del proyecto (SKILLS-IA.md): sigue "el-metro-arte" en todo.
Responde con tu resumen (paso 2), tus respuestas al cuestionario (paso 3) y la frase "Listo, Artista 2 (ChatGPT) preparado"; luego espera mi primer encargo.
```

---

## BLOQUE 3 · ENCARGOS

### 3A · Gemini Nano Banana (Artista 1) · encargos G‑
> Gemini ya tiene el contexto, así que los prompts son cortos. **Adjunta `ancla_estilo.png` en cada conversación nueva**, en cuanto exista.

**G‑00 · Ancla de estilo** → `ancla_estilo.png`
```
G-00. Crea el tablero de estilo del juego: imagen cuadrada (1:1) dividida en 4 recuadros, todo en el mismo estilo:
1) una manzana de barrio de Medellín vista desde arriba con leve inclinación: casas de ladrillo naranja a la vista, terrazas planas con tanques de agua negros, una calle gris con andén y un árbol;
2) un tren de metro de tres coches de perfil, carrocería clara con franja #1C5C9C, sobre un viaducto de concreto;
3) tres personas de frente: Rosalba (abuela conductora con uniforme azul y termo), un joven con morral y una vendedora con delantal;
4) una ladera verde llena de casitas de ladrillo con un metrocable de cabinas pequeñas pasando por encima.
Fondo de cada recuadro: papel #f1ece0. Sin texto.
```

**G‑01 · Hoja de Rosalba** → `per_rosalba_hoja.png`
```
G-01. Hoja de personaje (16:9) de ROSALBA, según la ficha del contexto. Cuerpo entero en 4 vistas en fila (frente, tres cuartos, perfil, espalda) y, debajo, 3 caras: neutra, alegre y emocionada (con lágrimas de felicidad). Fondo magenta plano. Sin texto.
```
**G‑02 · Retratos** → `ret_rosalba_neutra.png`, `ret_rosalba_alegre.png`
```
G-02. Con la misma Rosalba de la hoja: retrato de busto en tres cuartos mirando a la derecha, cuadrado (1:1), en pixel art de 64×64 ampliado (píxeles grandes y nítidos), expresión NEUTRA. Fondo magenta. Después repite idéntico con expresión ALEGRE.
```
**G‑03 · Sprite cenital** → `spr_rosalba_cenital.png`
```
G-03. La misma Rosalba vista desde ARRIBA (vista cenital pura): coronilla canosa, hombros con el uniforme azul y brazos. Hoja de 4 cuadros de caminar en fila, mirando a la derecha, pixel art de 16×16 por cuadro, ampliado. Fondo magenta. Sin sombra.
```
**G‑04 a G‑08** repiten G‑01, G‑02 y G‑03 con cada personaje. Cambia el nombre en el prompt y en el archivo:

| ID | Personaje | Archivos |
|---|---|---|
| G‑04 | La nieta | `per_nieta_*`, `ret_nieta_*`, `spr_nieta_cenital` |
| G‑05 | Don Efraín | `per_efrain_*` … |
| G‑06 | Doña Marleny | `per_marleny_*` … |
| G‑07 | Wílmar | `per_wilmar_*` … |
| G‑08 | Agente de tránsito | `per_agente_*` … |

**G‑09 · Pasajeros** → `per_pasajeros_hoja.png` y `spr_pasajeros_cenital.png`
```
G-09. Hoja (16:9) con 8 pasajeros de Medellín de cuerpo entero y de frente: estudiante universitaria con morral, abuelo con sombrero aguadeño y carriel, señora con bolsa de mercado, obrero con casco, hincha de fútbol con camiseta verde, turista con mapa, niño con uniforme de colegio, mujer con bebé en canguro. Pieles variadas de la paleta. Fondo magenta. Después: los mismos 8 vistos desde arriba, 4 cuadros de caminar cada uno (16×16 por cuadro), en una cuadrícula de 8 filas.
```
**G‑10 · Gente de la calle** → `per_calle_hoja.png`
```
G-10. Igual que G-09 (de frente y luego desde arriba) con: vendedor de tinto con termo, vendedora de arepas con carrito, vendedor de chontaduro con carreta, lustrabotas, silletero con silleta de flores a la espalda, músico con guitarra, ciclista en bicicleta pública verde, y 3 perros criollos (café, negro y manchado).
```
**G‑20 · Estación de perfil desde foto** → `est_lado_parque_berrio.png`
```
G-20. [Adjunto una foto real de la estación y el ancla] Redibuja la estación de la foto como ilustración de PERFIL perfecto (vista lateral plana, sin perspectiva), en nuestro estilo: concreto gris claro, cubierta metálica, andén con línea amarilla, escaleras. Conserva la forma real. Formato horizontal muy ancho (21:9). Fondo magenta. Sin letreros ni texto.
```
**G‑21 a G‑25** repiten G‑20 con otras estaciones:
- G‑21: San Antonio, `est_lado_san_antonio`.
- G‑22: Niquía, `est_lado_niquia`.
- G‑23: una estación de Metroplús, `est_lado_metroplus`.
- G‑24: una estación de Metrocable, `est_lado_cable`.
- G‑25: una parada del tranvía, `est_lado_tranvia`.

**G‑30 · Tren de perfil desde foto** → `veh_lado_metro_a.png`
```
G-30. [Adjunto una foto real de un tren del Metro de Medellín y el ancla] Conviértelo en un sprite de PERFIL perfecto mirando a la derecha: 3 coches con cabina en los extremos, ventanas, puertas marcadas, pantógrafo y franja #1C5C9C. Formato horizontal muy ancho (21:9). Fondo magenta. Sin logos ni texto.
```
**G‑31 a G‑37** repiten G‑30 con otros vehículos:
- G‑31: tren de la generación más nueva, `veh_lado_metro_nuevo`.
- G‑32: tranvía de 3 módulos verde #59AB42, `veh_lado_tranvia`.
- G‑33: cabina de Metrocable en los 6 colores de línea, en una fila, `veh_lado_cabinas`.
- G‑34: articulado de Metroplús, `veh_lado_articulado`.
- G‑35: alimentador, `veh_lado_alimentador`.
- G‑36: buseta, `veh_lado_buseta`.
- G‑37: chiva, `veh_lado_chiva`.

**G‑40 · Ladera desde foto** → `pan_ladera_casas.png`
```
G-40. [Adjunto una foto real de una comuna en ladera y el ancla] Conviértela en una capa de fondo de vista lateral: silueta de montaña con casitas de ladrillo apiladas que suben desde abajo y se vuelven bosque verde arriba. Ilustración plana con detalle pixelado en las casas. Formato 21:9. Arriba de la montaña, fondo magenta. Sin texto.
```
**G‑50 a G‑55 · Variantes por edición.** Adjunta la imagen ya aprobada y pide solo el cambio:

| ID | Prompt | Archivo |
|---|---|---|
| G‑50 | “La misma imagen, de NOCHE: ventanas cálidas #ffd27a encendidas (no todas) y faroles #ffb347, sin cambiar las formas.” | `…_noche.png` |
| G‑51 | “La misma imagen al ATARDECER: luz dorada desde la derecha y sombras más largas.” | `…_tarde.png` |
| G‑52 | “La misma imagen bajo la LLUVIA: superficies brillantes, charcos y gente con paraguas de colores.” | `…_lluvia.png` |
| G‑53 | “La misma imagen en los ALUMBRADOS de diciembre: figuras y guirnaldas de luces (#fff1c1 #ffc23d #e83e8c #2ec4f1).” | `…_alumbrados.png` |
| G‑54 | “La misma imagen en la FERIA DE LAS FLORES: guirnaldas y silletas de flores (#9b3faf #f7c325 #d7263d #f28c28).” | `…_feria.png` |
| G‑55 | “La misma imagen en la NOCHE DE LAS VELITAS: velas y faroles de papel en el andén.” | `…_velitas.png` |

**G‑60 · Casas de barrio desde arriba** → `cas_barrio_hoja.png`
```
G-60. Hoja cuadrada con una cuadrícula de 4×4 casillas iguales y alineadas. Cada casilla es una casa o lote de barrio de Medellín vista desde arriba con leve inclinación (techo y franja de la fachada de abajo): losas grises con tanque de agua negro, tejas de barro, terrazas con ropa colgada y matas, una casa sin terminar con varillas, fachadas menta, amarilla y rosada, ladrillo naranja a la vista. Fondo magenta entre casillas. Sin sombra proyectada.
```
**G‑61 a G‑63** repiten G‑60 con otros temas:
- G‑61: edificios de El Poblado (ladrillo y vidrio, azoteas con aire acondicionado), `cas_poblado_hoja`.
- G‑62: parques, plazas, canchas y árboles, con guayacán amarillo y rosado, `cas_parques_hoja`.
- G‑63: orillas del río, quebradas, escaleras de la Comuna 13 y grafitis vistos desde arriba, `cas_rio_comuna13_hoja`.

**G‑70 a G‑73 · Capas panorámicas** → `pan_<zona>_<hora>_<capa>.png`
```
G-70. Capa de fondo para la vista lateral del juego: silueta de la CORDILLERA LEJANA de los Andes sobre el valle de Medellín, formas planas con bruma suave y un filo apenas iluminado, color #7f9fbf que se aclara hacia #a8c0d8 abajo. Vista de perfil perfecta, horizonte nivelado, sin edificios. Arriba del filo, fondo magenta plano (el cielo lo pone el juego). Formato horizontal muy ancho (21:9). Zona: [ZONA]. Hora: [HORA]. Sin texto.
```
- **G‑71 · Cerros** (`_2cerros`): “colinas verdes #5f8f86 delante de la cordillera, con pocas casas de ladrillo al pie”, con el mismo formato.
- **G‑72 · Laderas con barrios** (`_3laderas`): “ladera empinada llena de casitas de ladrillo #b4583a con terrazas y tanques negros, que suben desde el valle y se vuelven bosque arriba, con una línea de metrocable de cabinas pequeñas”, con el mismo formato.
- **G‑73 · Ciudad cercana** (`_4ciudad`): “siluetas de edificios de ladrillo de mediana altura, algunas torres de vidrio, la catedral de ladrillo, árboles y el viaducto elevado del metro”, con el mismo formato.

Si queda corta, pide: “Extiende la misma imagen hacia la derecha, igual de alta y sin cambiar nada”. Yo empato los bordes al final.

**Zonas [ZONA]** (y nombre del archivo):

| Zona | Texto para el prompt |
|---|---|
| `norte` | Bello, casas bajas y fábricas textiles antiguas |
| `centro` | catedral de ladrillo, edificios altos y una torre con aguja |
| `occidente` | San Javier y Comuna 13: laderas muy pobladas con murales de colores |
| `nororiente` | Santo Domingo: biblioteca de tres edificios negros como rocas en lo alto |
| `sur` | El Poblado: torres de vidrio y ladrillo entre mucho verde |
| `ayacucho` | una calle empinada con casas de colores |

**Horas [HORA]** (y nombre del archivo):

| Hora | Texto para el prompt |
|---|---|
| `dia` | luz de mediodía |
| `tarde` | atardecer dorado con bruma naranja y violeta |
| `noche` | noche con miles de ventanas cálidas #ffd27a en la ladera |
| `alumbrados` | noche de diciembre con figuras de luces de colores junto al río |

**G‑80 a G‑86 · Escenas de ambiente de fiestas** (sirven de referencia para todo el equipo) → `amb_<fiesta>.png`
```
G-80. Escena ilustrada (16:9) del DESFILE DE SILLETEROS en Medellín: campesinos cargan a la espalda grandes silletas de madera llenas de flores (#9b3faf #f7c325 #d7263d #f28c28) por una avenida ancha, familias aplaudiendo, sol de agosto y el viaducto del metro al fondo. Ambiente alegre y familiar, ilustración plana con detalles de pixel art, en el estilo del ancla. Sin texto.
```
Para los demás, cambia solo la escena:

| ID | Escena | Archivo |
|---|---|---|
| G‑81 | Río de noche con enormes figuras de luces de colores (#fff1c1 #ffc23d #e83e8c #2ec4f1), familias paseando y un tren cruzando un viaducto iluminado | `amb_alumbrados` |
| G‑82 | Barrio de ladera al anochecer, con velas y faroles de papel de colores en cada puerta | `amb_velitas` |
| G‑83 | Avión antiguo de hélice de los años 30 y la silueta de una pareja bailando tango al atardecer, en homenaje | `amb_tango` |
| G‑84 | Escaleras eléctricas techadas que suben una ladera de colores con murales enormes | `amb_comuna13` |
| G‑85 | Cabinas de cable entrando a un bosque de pinos con neblina sobre la ciudad | `amb_arvi` |
| G‑86 | Aguacero de tarde sobre la ciudad: calles brillantes, paraguas de colores y buses con las luces encendidas | `amb_aguacero` |

**G‑90 · Concepto isométrico de región** (nuevo) → `concepto_iso_<region>.png`
```
G-90. Concepto de una porción de Medellín en miniatura, en proyección DIMÉTRICA 2:1 (pixel art "isométrico" de juego: por cada píxel hacia arriba, dos hacia el lado), en el estilo del ancla: [REGIÓN]. Edificios con su altura relativa real, techos detallados (losas con tanques de agua, tejas, azoteas), calles con carros diminutos, árboles en masa, gente pequeñita. Luz desde arriba a la izquierda. Fondo magenta fuera del terreno. Cuadrado (1:1). Sin texto.
```
**Regiones [REGIÓN]:**

| Región | Texto para el prompt | Archivo |
|---|---|---|
| centro | Parque Berrío y la estación elevada del metro junto al Palacio de la Cultura en damero blanco y negro | `concepto_iso_centro` |
| ladera | ladera de la Comuna 13 con casas de ladrillo apiladas, escaleras eléctricas techadas y una torre de metrocable | `concepto_iso_ladera` |
| poblado | torres de ladrillo y vidrio entre árboles, con calles curvas en pendiente | `concepto_iso_poblado` |
| río | el río canalizado con autopistas a los lados y el viaducto del metro | `concepto_iso_rio` |
| cable | Santo Domingo con la estación del cable y la biblioteca de rocas negras | `concepto_iso_cable` |

**G‑100 · Repintar mosaicos isométricos base** (cuando yo los envíe) → `iso_<zona>_<fila>_<col>.png`
```
G-100. Te adjunto un RENDER BASE en proyección dimétrica 2:1 de una zona REAL de Medellín, generado con datos abiertos (relieve, edificios con su altura, calles, río, viaductos, estaciones y torres de cable). Repíntalo en el estilo del ancla SIN mover ni cambiar la geometría: cada edificio, calle, árbol, vía y estación queda exactamente en la misma posición, con el mismo tamaño y el mismo encuadre. Solo cambia materiales y detalles: ladrillo naranja a la vista, losas con tanques de agua negros, tejas, vidrio en torres, andenes, cebras, árboles frondosos y gente pequeñita. Las zonas que en la base estén en magenta siguen en magenta. Sin texto.
```
*Si te devuelve algo movido, pide: “Vuelve a hacerlo calcando la base adjunta: misma geometría al píxel, solo cambia el estilo”.*

### 3B · ChatGPT (Artista 2) · encargos C‑
> ChatGPT ya tiene el contexto. Adjunta `ancla_estilo.png` cuando exista.

**C‑01 · Vehículos del sistema vistos desde arriba** → `spr_vehiculos_sistema.png` (1536×1024)
```
C-01. Hoja de sprites con fondo transparente. Vehículos en vista cenital pura (solo se ve el techo y un poco de los costados), todos mirando a la DERECHA, a la misma escala (1 m = 8 px), en filas y con espacio entre ellos.
Fila 1: coche de metro con cabina (22 m, techo plateado con equipos y pantógrafo, franja #1C5C9C a los lados), coche intermedio y coche con cabina hacia atrás.
Fila 2: tranvía de 3 módulos #59AB42; bus articulado de 18 m #0E6F76 con techo blanco y fuelle oscuro.
Fila 3: alimentador blanco con franja; buseta de colores; chiva (bus escalera pintado a mano, con parrilla en el techo).
Fila 4: cabinas de metrocable desde arriba en 6 colores (#B8CF40 #F6C538 #8E612A #EB318E #743D90 #EC343A).
Sin sombra, sin texto, sin logos.
```
**C‑02 · Vehículos de la calle** → `spr_vehiculos_calle.png`
```
C-02. Misma vista, escala y fondo que C-01: taxi amarillo #f2c400 con aviso en el techo, 6 carros particulares (rojo, azul, blanco, gris, negro, verde), camioneta azul de servicio con platón, moto con conductor y casco, bicicleta pública verde con ciclista, carrito de vendedor ambulante, ambulancia y camión pequeño de mercado. En cuadrícula.
```
**C‑03 · Puertas del bus** → `spr_puertas_bus.png`
```
C-03. El bus articulado de C-01 en 3 cuadros (puertas del lado izquierdo cerradas, medio abiertas y abiertas), vista cenital, fondo transparente.
```
**C‑10 · Íconos de modos** → `ico_modos.png`
```
C-10. 9 íconos cuadrados (128×128 cada uno) en cuadrícula de 3×3, fondo transparente. Estilo afiche plano, contorno negro grueso, máximo 2 colores más negro, sin texto:
1) ciudad libre (manzana con edificio y persona caminando)
2) bus articulado de frente
3) tren de metro de frente con franja azul
4) cabina de metrocable colgando del cable
5) libro abierto con un tren (historia)
6) brújula con una tarjeta (guía)
7) mapa de líneas de colores (la red)
8) dos celulares conectados (juntos)
9) palanca de arcade (arcade)
```
**C‑11 · Íconos de acciones** → `ico_acciones.png`
```
C-11. Mismo estilo que C-10, 12 íconos: llave, flechas de sentido, mano de vigilante (hombre muerto), megáfono, puertas a la izquierda, puertas a la derecha, pito, cámara de fotos, lupa, persona corriendo, adelantar ⏩, tarjeta de transporte genérica (sin logos).
```
**C‑12 · Insignias de logros** → `ico_logros.png`
```
C-12. 20 insignias redondas tipo medalla en cuadrícula de 5×4, fondo transparente, estilo afiche con contorno negro, sin texto:
primer viaje · frenada al centímetro · mano firme · punta a punta (tren largo) · puesto de control (agujas) · carril exclusivo (bus articulado) · ciudad colgante (cabinas) · diez de diez (estrellas) · gerente (gráfica) · la última vuelta (taza de tinto humeante) · enciclopedia (libro) · turno de noche (luna) · antes del primer tren (madrugada con farol) · duelo (dos manos) · en red (antena) · costumbre (calendario) · bolsillo lleno (monedero) · ni una gota (tinto en equilibrio) · feria de las flores (silleta) · alumbrados (estrella de luces).
```
**C‑20 · Consola del metro** → `cab_consola_vertical.png` (1024×1536) y `cab_consola_horizontal.png` (1536×1024)
```
C-20. Ilustración en primera persona desde el asiento del conductor de un metro moderno.
Abajo, la consola: palanca combinada de tracción y freno a la derecha, llave de activación, selector de sentido, botones grandes iluminados con placas vacías (SIN texto), velocímetro analógico con aguja, pantalla LED ámbar vacía y lámparas de señal.
La mitad de arriba es el parabrisas, en MAGENTA PLANO #FF00FF (ahí el juego dibuja la vía).
Interior gris grafito con azul #1C5C9C y detalles ámbar. Pixel art limpio y detallado. Sin logos ni texto.
```
**C‑21 · Tablero del bus** → `cab_bus.png`
```
C-21. Igual que C-20, pero del bus articulado: timón grande, palanca de puertas, validador de tarjeta y espejo. El parabrisas en magenta.
```
**C‑30 · Señalética** → `ui_letreros.png`
```
C-30. Letreros de estación en blanco (placas rectangulares con borde del color de cada línea), panel LED de próximo tren apagado, flechas de salida, la línea amarilla del andén y un torniquete visto de frente. Fondo transparente. Sin texto.
```
**C‑40 · Portada** → `clave_compartir.png` (con título) y `clave_portada.png` (sin título), ambas a 1536×1024
```
C-40. Un tren de metro claro con franja #1C5C9C cruza un viaducto al amanecer sobre el río de Medellín. Detrás, montañas con laderas llenas de casitas de ladrillo, un metrocable de cabinas de colores sube por la ladera y hay gallinazos en el cielo naranja y violeta. En la ventana de la cabina, Rosalba (abuela conductora con uniforme azul) sonríe con su termo de tinto. Ilustración plana por capas con detalle de pixel art, ambiente tierno y esperanzador.
Versión 1: arriba a la izquierda, el título "EL METRO" en letras condensadas gruesas color crema #fbe7b0 con borde #141414 y, debajo, "La última vuelta" en letra más pequeña.
Versión 2: la misma imagen SIN ningún texto.
Sin logos reales.
```
**C‑41 · Pantalla de carga** → `clave_carga.png` (1024×1536)
```
C-41. La misma escena de C-40 en vertical, con Rosalba de espaldas mirando la ciudad desde el andén. Sin texto.
```
**C‑50 · Decoraciones de fiesta** → `fiesta_sprites.png`
```
C-50. Hoja con fondo transparente y vista cenital: pétalos sueltos (8 tipos), una silleta de flores vista desde arriba, faroles de papel (rojo, verde y amarillo) y velas, guirnaldas de luces en tramo recto y en curva, figuras de luz de Navidad vistas desde arriba (estrella, flor, pesebre sencillo) y banderines de la Feria.
```
**C‑60 · Texturas repetibles** → `tex_<material>.png` (1024×1024)
```
C-60. Textura cuadrada REPETIBLE sin costuras (que encaje por los cuatro lados), vista desde arriba ortográfica, luz plana y pareja, apta para pixel art: [MATERIAL]. Sin sombras, sin texto, sin logos.
```
*Yo arreglo las costuras que queden. Haz una textura por material:*

| Material [MATERIAL] | Colores | Archivo |
|---|---|---|
| Ladrillo naranja a la vista con juntas claras | #b4583a #9a4630 #c8714d #d8c3a5 | `tex_ladrillo` |
| Teja de barro | #a8452f | `tex_teja` |
| Asfalto con grietas suaves | #3b3f45 | `tex_asfalto` |
| Baldosa de andén | #c9c1ad | `tex_anden` |
| Concreto de viaducto | #a9a59b | `tex_concreto` |
| Balasto con traviesas | — | `tex_balasto` |
| Pasto | #4f8a3c | `tex_pasto` |
| Agua de río café verdosa | #5f7f73 | `tex_rio` |
| Techo de eternit ondulado | — | `tex_eternit` |
| Adoquín de plaza | — | `tex_adoquin` |

---

## BLOQUE 4 · CORRECCIONES RÁPIDAS (para Gemini y ChatGPT)
| Problema | Díselo así |
|---|---|
| Cambió el estilo | “Vuelve EXACTAMENTE al estilo del ancla adjunta: mismos colores y mismo grosor de píxel.” |
| Salió texto o un logo | “Quita todo el texto, letras, números y logos.” |
| La vista quedó en perspectiva | “Vista de perfil PERFECTA, sin punto de fuga” / “Vista cenital PURA desde arriba” / “Proyección dimétrica 2:1 exacta.” |
| Se movió la geometría de una base o foto | “Calca la base adjunta: misma geometría al píxel; solo cambia el estilo.” |
| El fondo no es plano | “Fondo magenta #FF00FF completamente plano, sin sombra ni degradado.” |
| Se ve borroso | “Píxeles grandes, nítidos y cuadrados, sin suavizado.” |
| Muy realista o recargado | “Más simple: formas planas y pocos colores de la paleta.” |
| El personaje cambió de cara | “Es el MISMO personaje de la hoja adjunta: misma cara, peinado, ropa y colores.” |
| Pediste algo de la otra IA | La IA debe responder “Eso le corresponde a…”. Pídeselo a la que corresponde. |
| Escribió el código de color como texto en la imagen | “No escribas códigos de color en la imagen. Usa el color de la paleta adjunta.” (En tus prompts nombra los colores; adjunta la paleta como imagen.) |
| Los retratos cambian de encuadre | “Mismo encuadre, tamaño y altura de ojos en los tres gestos.” |

**Reglas aprendidas en la entrega 1 (nov‑2026):** retratos en la misma posición; fondo magenta también dentro de los marcos; colores por nombre y paleta adjunta; grilla de píxel entera; vistas separadas; cero sombras; **entrega la fuente** (SVG o script); distingue “válido”, “probado” y “jugado”; verifica los datos del mundo real. Detalle en la skill `el-metro-arte`.

---

## BLOQUE 5 · ENTREGA
**Orden recomendado:**
1. G‑00 (ancla de estilo);
2. personajes (G‑01 a G‑10);
3. vehículos vistos desde arriba (C‑01, C‑02);
4. panorámicas del centro y el norte, de día y de noche (G‑70 a G‑73);
5. casas de barrio (G‑60 a G‑63) y texturas (C‑60);
6. conceptos isométricos (G‑90);
7. estaciones y vehículos de perfil (G‑20 a G‑37);
8. íconos (C‑10 a C‑12);
9. cabina (C‑20, C‑21);
10. fiestas (G‑53 a G‑55, C‑50, G‑80 a G‑86);
11. portadas (C‑40, C‑41).

G‑100 empieza cuando yo te envíe los mosaicos base. Una entrega parcial ya sirve.

**Carpetas** (dentro de `arte/entregas/`; las láminas terminadas se ordenan en `laminas/` y los SVG en `vectorial/`):

| Carpeta | Qué va |
|---|---|
| `00_ancla` | el ancla de estilo |
| `personajes` | hojas, retratos y sprites de personajes |
| `vehiculos` | sprites cenitales y vehículos de perfil |
| `estaciones` | estaciones de perfil |
| `panoramicas` | capas panorámicas y la ladera |
| `casillas` | hojas de casas y barrios |
| `texturas` | texturas repetibles |
| `isometrico` | conceptos isométricos y mosaicos repintados |
| `cabinas` | consola del metro y tablero del bus |
| `iconos` | íconos e insignias |
| `clave` | portadas y pantalla de carga |
| `fiestas` | variantes, decoraciones y ambiente de fiestas |

**Reglas:**
- Nombres en minúsculas, sin tildes ni espacios.
- PNG con fondo transparente o magenta.
- Opcional: un `.txt` con el mismo nombre y el prompt que funcionó.

**Cómo me lo entregas** (elige una):
1. Adjunto en esta conversación, suelto o en un `.zip` por carpeta.
2. Subido en GitHub, en `arte/entregas/` de la rama de trabajo.
3. Una carpeta de Google Drive compartida.

**Qué hago yo:**
1. Reviso cada imagen con la lista de control.
2. Quito el magenta.
3. Reduzco y cuantizo a la paleta.
4. Armo los atlas.
5. Lo conecto al juego, manteniendo el dibujo actual como respaldo.
6. Pruebo con 100 partidas y capturas.
7. Publico la nueva versión.

**Lista de control** (antes de enviarme cada imagen):
1. ¿La vista es correcta?
2. ¿Los colores son de la paleta?
3. ¿El fondo es transparente o magenta?
4. ¿No tiene sombra proyectada, ni texto, ni logos?
5. ¿Se lee bien en pequeño?
6. ¿Tiene el nombre exacto del encargo?

---

## BLOQUE 6 · SKILLS DEL PROYECTO
> Las **skills** son instrucciones de trabajo en formato abierto `SKILL.md` ([Agent Skills](https://agentskills.io/specification)). Los agentes de código las leen solos; las IA de imágenes las reciben en el archivo `SKILLS-IA.md`. Así **todas trabajan con las mismas reglas**.

| Skill | Para qué | Gemini (imágenes) | ChatGPT (imágenes) | Agentes de código* |
|---|---|---|---|---|
| **el-metro-arte** (propia) | Dirección de arte, paletas, vistas, reparto G‑ y C‑, revisión e integración | ✅ siempre | ✅ siempre | ✅ al integrar arte |
| **medellin-fiel** (propia) | Topografía, relieve, estructuras y vista isométrica 2:1 | ✅ en G‑90 y G‑100 | — | ✅ al tocar el mapa y las vistas |
| **el-metro-desarrollo** (propia) | Código, compilar, probar, APK, publicar y bitácora | — | — | ✅ siempre |
| **frontend-design** (Anthropic, Apache‑2.0) | Dirección visual de menús, HUD y guía | — | — | ✅ en interfaz (con el crema EMSAY como decisión del autor) |
| **webapp-testing** (Anthropic, Apache‑2.0) | Pruebas en el navegador con Playwright | — | — | ✅ al probar |
| **skill-creator** (Anthropic, Apache‑2.0) | Crear y mejorar skills | — | — | ✅ al crear skills nuevas |

*Agentes de código: Claude Code, Codex de ChatGPT (“astra”) y Antigravity de Gemini (“argon”).

**Cómo se cargan:**
- **Gemini (Gem):** sube `SKILLS-IA.md` al conocimiento del Gem, junto con `CONTEXTO-IA.md`.
- **ChatGPT (Proyecto):** sube `SKILLS-IA.md` a los archivos del Proyecto. Si tu ChatGPT tiene **Skills**, sube la carpeta `el-metro-arte`.
- **Codex y Antigravity:** abre el repositorio; leen `.agents/skills/` solos.
- **Claude Code:** lee `.claude/skills/` solo.

**Plugins de Claude recomendados** (se activan en la cuenta de Claude):
- **image-generation:** guía de prompts para Gemini Image y GPT Image.
- **frontend-design.**
- **playwright** (Microsoft).
- **Android Emulator QA**, para probar la APK.
- **Unity**, solo si el juego algún día pasa a Unity.

**Mantenimiento:** las skills se editan en `.agents/skills/` y se corre `node tools/skills.mjs`, que copia todo a `.claude/skills/` y regenera `SKILLS-IA.md`.

---

## ANEXO A · BITÁCORA DEL JUEGO (copia automática de `docs/BITACORA.md`)
<!-- BITACORA:INICIO -->
### Bitácora · El Metro

> Guía viva del proyecto. Quien retome el trabajo (persona o IA) debe leer esto, `docs/PLAN.md` y `arte/README.md`, y actualizar esta bitácora al cerrar cada sesión.

#### Estado al 2026-11-18 · v1.1.1 "Ciudad con curvas" (retoque)
**Novedad de v1.1.1:** los tres Metroplús (líneas 1, 2 y O) van por su **corredor real**, el de su carril exclusivo (`src/data/metroplus.js`, de Juega EnCicla 1.3.1), y no por la ruta más corta entre calles, que se desviaba hasta 1 km y daba vueltas en glorietas. El carril queda libre de edificios en la ciudad vectorial y se dibuja como carril de bus (asfalto, franja del color de la línea y raya blanca). El autotest revisa que ningún punto del carril quede dentro de un edificio o del agua y que los alimentadores no salgan de las calles. Debajo sigue vigente lo de v1.1.0.

**Qué se probó:** autotest con 0 errores y 0 avisos; 100 partidas del bot (364 mil pasos) con 0 errores y 0 errores de consola.

**Publicado:** https://juanfeliperico369-stack.github.io/MetroZero/ (**v1.1.1 verificada el 2026-11-18**: carga, service worker con caché `el-metro-v1.1.1-38220983`, sin conexión, instalable, 0 errores de consola). APK: `/el-metro.apk` (versionCode 21, **3,3 MB**).

##### v1.1.0 "Ciudad con curvas"
**Novedad de v1.1.0** (une la línea de 1.0.0 de la otra IA con v0.10.0 y redibuja la ciudad):
- **Mapa base de 1.0.0:** manzanas oficiales, huellas, pisos y barrios en todo el valle (formato v3: `ba`, `hg`, `lt`), con `CIUDAD` y `RUTAS` de 1.0.0 y lo de v0.10.0 encima (EnCicla, calendario, ajustes, accesibilidad).
- **Motor de ciudad vectorial** (`src/js/11-ciudad2.js`, `VC`): reemplaza el dibujo por casillas en todas las vistas cenitales.
  - Calles de `src/data/vias.js` (26.919 vías de Juega EnCicla 1.3.1) con su curva, su ancho, andén, sardinel, carriles y cebras.
  - Suelo sin escalones: contornos de cuadrados marchantes difuminados (parques y lago con esquinas redondas).
  - Casas y edificios generados a lo largo de cada calle, girados con ella, sin tocar vías ni andenes; volumen al estilo de las ciudades cenitales (techo desplazado, fachadas con ventanas, sombra y contorno).
  - Cuatro niveles de detalle (80 m a 4 px/m … 2,5 km a 0,2 px/m), presupuesto de 12 ms por cuadro, trozos por adelantado hacia donde va la cámara y 1 px de margen por trozo (sin costuras).
- **Rieles que concuerdan:** eje real de A, B y T entre los dos rieles de OpenStreetMap (`src/data/rieles.js`; giro máximo 6°). Cada estación queda sobre su línea y su andén sigue la vía; la B termina al borde del viaducto de la A.
- **Buses por las calles:** Metroplús y alimentadores rehechos sobre la red vectorial pasando por cada parada (`src/data/rutas_calles.js`).
- **Física libre:** a pie y en vehículo solo frenan los edificios dibujados y el agua; fuera del asfalto hay más roce. La gente camina por los andenes; carros, bicis y anclajes se acomodan fuera de los edificios al acercarse. Cámara alineada al píxel.
- **Arquitectura icónica** (`src/js/11-hitos.js`, `src/data/hitos.js`): 30 edificios y plazas con su huella real de OpenStreetMap y un dibujo propio: la aguja del Coltejer, las torres y la cúpula de la Basílica, el Palacio de la Cultura en franjas, las graderías y la cancha del Atanasio, las tres rocas de la Biblioteca España, el vidrio del Edificio EPM, las cajas rojas de Explora, la cúpula del Planetario, La Alpujarra, los postes del Parque de las Luces (se encienden de noche) y las esculturas de la Plaza Botero. Nada genérico se monta encima y se choca contra ellos.
- **Metro elevado:** el tablero va a 7 m con columnas cada 30 m y su sombra en el piso; los andenes llevan cubierta metálica con el color de la línea y cada estación su edificio de acceso abajo. Los cables del Metrocable van a 14 m con sus torres.
- **Rótulos y postes** sobre las calles dibujadas; el letrero toma el nombre de la vía cuando la capa oficial no lo trae.
- **Autotest nuevo:** vías cargadas, edificios fuera del asfalto, andenes sobre su línea, vías sin quiebres y buses sobre las calles.

Herramientas nuevas: `tools/vias_datos.mjs`, `tools/rieles_datos.mjs`, `tools/rutas_calles.mjs` y `tools/hitos_datos.py` (cómo regenerar en `docs/FUENTES.md`).

**Qué se probó:** `node tools/test.mjs 100` → autotest con 0 errores y 0 avisos (26.919 vías, 30 piezas de arquitectura, andenes sobre su línea, sin quiebres, buses sobre las calles), 100 partidas del bot (368 mil pasos) con 0 errores y 0 errores de consola. Cuadros de 2–7 ms de JavaScript caminando y manejando; un trozo cercano se arma en 10–20 ms (las regiones de 640 m en 10–25 ms, por adelantado).

**Publicado:** https://juanfeliperico369-stack.github.io/MetroZero/ (**v1.1.0 verificada el 2026-11-18**: carga, service worker con caché `el-metro-v1.1.0-d0a6e2db`, sin conexión, instalable, 0 errores de consola). APK: `/el-metro.apk` (versionCode 20, **3,4 MB**).

**Qué falta:** el Orquideorama y otros edificios que OpenStreetMap no tiene como huella; alturas por edificio con el catastro; afinar el recorrido de los Metroplús donde su carril exclusivo no está en las vías vectoriales.

##### v0.10.0 "Valle completo y EnCicla"
**Novedad de v0.10.0:**
- **El mapa, medido y corregido:**
  - las 49 estaciones tienen huella y techo;
  - el río es continuo y siempre baja;
  - el tranvía va por su calle;
  - aparece el patio‑taller de Bello;
  - hay barrios y nombres de calle en todo el valle.
- **El calendario es real:** festivos de Colombia, y el Metro de 5 a. m. a 10 p. m. los domingos y festivos.
- **Primer cruce con Juega EnCicla:** sus 133 estaciones en Ciudad Libre, con préstamo, timbre y logros.

Debajo sigue vigente lo de v0.9.0.

##### v0.9.0 "Maqueta y álbum"
**Novedad de v0.9.0:** la **Maqueta 2:1** (el valle real en 3D isométrico, dentro de La Red) y el **Álbum de postales** (48 postales: los lugares reales con su vista aérea y 5 especiales con ilustración), más el cartel de la fiesta del día. Debajo sigue vigente lo de v0.8.0.

##### v0.8.0 "Identidad del Metro"
**Novedad de v0.8.0:** interfaz nueva con los colores de las líneas; el inicio es un diagrama de línea (cada opción es una estación y un tren viaja a la que se toca); sin la estética de revista ni sus notas; seguridad revisada (red local, importación de partidas, CSP); código del juego sin comentarios en la versión publicada y sin menciones de herramientas de IA. Debajo sigue vigente lo de v0.7.0.

##### v0.7.0 "Medellín reconocible"
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

**Publicado:** https://juanfeliperico369-stack.github.io/MetroZero/ (rama `gh-pages`; **v0.10.0 verificada el 2026-11-17**: carga con la CSP activa, service worker con caché `el-metro-v0.10.0-99755ed9`, sin conexión, instalable, 0 errores de consola). APK: `/el-metro.apk` (versionCode 10, **2,0 MB**).

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
##### v0.10.0 (2026-11-17) — valle completo, calendario real y cruce con EnCicla
Pedido del autor: “haz lo que puedas, mejóralo todo” (sobre la auditoría), y “audita Juega EnCicla, toma fragmentos, los huevos de pascua y las mejoras, y prepara la próxima revolución”.
1. **Mapa (hoja de ruta M1–M6 de la auditoría, todo medido con `tools/auditoria-mapa.mjs`):**
   - **Ajustes del mapa base** en `src/data/ajustes.js` (171 KB), generados por `tools/mapa_ajustes.mjs` y aplicados al cargar (`MAP.ajustes`):
     - 86.642 casillas de vía ganan nombre de calle y 205 barrios aproximados llenan los municipios sin capa oficial, con datos de Juega EnCicla v1.2 (OpenStreetMap vía Overture).
     - **Casas con barrio:** Bello pasa de 1 a 59 %, Girardota de 0 a 99 %, Barbosa de 0 a 98 % y Caldas y La Estrella de 0 y 4 a 83 %.
     - **Vías con nombre:** Medellín pasa de 63 a 80 %, Itagüí de 18 a 78 % y Bello de 11 a 45 %.
     - **Río:** 88 puentes donde una vía cortaba el cauce (69 cortes → 0) y 1.339 esquinas del relieve quemadas con regresión isotónica (37 tramos que subían → 0).
     - 69 casillas de casa pasan a calle bajo el tranvía de Ayacucho (24 % del trazo sobre casas → 0 %).
     - Se quitan las 32 escaleras sueltas que no conectaban con nada.
     - **Patio‑taller del Metro en Bello** con balasto y vías, y talleres del antiguo Ferrocarril de Antioquia, ambos de OpenStreetMap.
   - **Huellas de estación (`MAP.estaciones`):** andén techado orientado con la línea y la franja del color de cada línea.
     - Medidas: metro 140 × 36 m, tranvía 44 × 16 m, cable 60 × 40 m.
     - Las 49 estaciones tienen techo; ninguna queda sobre una casa.
   - **Rótulos:**
     - un nombre extra no repite el oficial del mismo trozo;
     - patio y talleres van con ■ en azul.
2. **Arreglos rápidos de la auditoría:**
   - **Memoria:** la capa de luces de cada trozo se crea solo de noche, y la caché depende de la memoria del equipo (16, 28 o 40 trozos).
   - **Sin tirón al arrancar:** cada cuadro construye trozos por 10 ms como máximo (mínimo uno); el resto se pinta liso un instante.
   - **Resultado:** con 0 estrellas dice “Llegaste, sin estrellas” y da un consejo.
   - **Accesibilidad:** nombres para los botones de íconos, botones de 44 px, letra de 12 px y avisos en `aria-live`.
   - **Seguridad:** el código de invitación se descomprime con tope de 64 KB.
3. **Calendario real, de Juega EnCicla:**
   - `festivo()` cubre los festivos de Colombia (Ley Emiliani y Semana Santa).
   - **Horario del Metro corregido:** antes abría a las 7 los domingos y no conocía los festivos. Ahora va de lunes a sábado de 4:30 a. m. a 11 p. m., y los domingos y festivos de 5 a. m. a 10 p. m.
   - **Fechas:** Feria de las Flores (10 días desde el primer viernes de agosto), Fiesta del Libro, Día del Niño, Día del Padre y ciclovía.
4. **EnCicla en Ciudad Libre** (`src/data/encicla.js`, 133 estaciones, de `tools/encicla_datos.mjs`):
   - **Anclajes:** azules con postes verdes y bicis.
   - **Préstamo:** con el horario de EnCicla y 60 minutos de juego; se devuelve en cualquier anclaje.
   - **Frases:** al prestar habla un personaje de EnCicla; al devolver lejos se oye “Nadie aplaude al anfitrión, pero todos llegan.”
   - **Logros nuevos:** *Metro + bici* y *Ciclista secreto* (tres timbrazos debajo de una estación del metro, el espejo del Maquinista secreto de EnCicla).
   - **Postal** “Metro + EnCicla” y enlace al juego hermano en los créditos.
   - Las medallas 21 y 22 quedan encargadas a ChatGPT (C‑12). Mientras llegan, la libreta usa emoji.
5. **Documentos:**
   - auditoría de Juega EnCicla con ideas para su IA: `docs/auditorias/2026-11-17-auditoria-encicla-v1.2.md`;
   - plan de la próxima revolución: `docs/REVOLUCION.md`;
   - actualización de la auditoría del mapa.
6. **Pruebas:**
   - el autotest suma el calendario (festivos de 2026 y horarios del Metro y de EnCicla), los ajustes del mapa (barrio en Bello, nombres nuevos, 49 huellas) y los anclajes de EnCicla;
   - 100 partidas, 0 errores.
7. **Reglas aprendidas:**
   - los dos juegos comparten cuadrícula y relieve: cualquier corrección del mapa se mide una vez y sirve dos veces;
   - el arte de logros nuevos se encarga a ChatGPT; el código solo pone el respaldo.

##### Auditoría de v0.9.0 (2026-11-17) — juego y mapa medidos
Pedido del autor: “audita el videojuego, dame ideas y sugerencias y, en especial, analiza el mapa para seguirlo mejorando después”. No cambia el juego.
1. **Informe:** `docs/auditorias/2026-11-17-auditoria-juego-y-mapa.md`. Trae rendimiento, balance, código, seguridad, accesibilidad, el mapa a fondo con cuatro láminas, la hoja de ruta del mapa (M1–M12, cada paso con su meta medible) y 14 ideas.
2. **Herramienta nueva, `tools/auditoria-mapa.mjs`:** mide el mapa con el propio juego y dibuja las láminas. Sus cifras son los criterios de aceptación de cada mejora del mapa.
3. **Hallazgos principales:**
   - **Memoria:** la caché del mapa puede ocupar ~80 MB de imagen (40 trozos × 2 lienzos de 512²).
   - **Rendimiento:** la panorámica lateral satura el hilo principal, y Ciudad Libre y el bus se congelan 0,2–0,3 s al arrancar.
   - **Resultado incoherente:** el viaje en Metrocable se “gana” con puntaje negativo y dice “¡Bien hecho!”.
   - **Accesibilidad:** el botón 🏃 de Ciudad Libre no tiene nombre y no hay región `aria-live`.
   - **Seguridad:** las invitaciones se descomprimen sin tope.
   - **Mapa:**
     - las 49 estaciones no tienen huella y dos caen sobre edificios;
     - el río se corta 69 veces y sube en 37 tramos (hasta 27 m en Copacabana);
     - las quebradas ocupan 29,4 km², con 2.266 manchones de agua;
     - el tranvía va en un 24 % sobre casas;
     - fuera de Medellín e Itagüí casi no hay barrios (Bello 1 %), y fuera de Medellín pocas calles tienen nombre (4–18 %).
4. **Regla aprendida:** el bot sirve para encontrar errores, no para balancear. El piloto automático del bus y de “Al volante” no intenta ganar. Para balancear hacen falta datos de jugadores.

##### v0.9.0 (2026-11-17) — Maqueta 2:1 y álbum de postales
Pedido del autor: “continúa desarrollando y mejorando, termina lo pendiente y lo olvidado”.
1. **Maqueta 2:1 (`src/js/24-iso.js`), en La Red con el botón “⬢ Maqueta 2:1”:** el valle real en proyección dimétrica.
   - Se dibuja por columnas de adelante hacia atrás con búfer de altura: relieve real con sombreado, calles, río, parques, casas con techos de teja o plancha y edificios con su altura (con hileras de ventanas al acercarse).
   - Las líneas van sobre el relieve: el metro en viaducto, los cables por encima de la loma. Hay estaciones y nombres de barrios.
   - **Giro de 90°**, arrastre y pellizco.
   - Rendimiento: se dibuja a resolución CSS en caché (24–64 ms en el banco), solo al soltar el dedo; si un dibujo pasa de 70 ms, baja la resolución sola.
   - Un salto rápido por bloques de 640 m evita calcular lo que no asoma.
2. **Álbum de postales (`src/js/68-album.js`), botón “📷 Álbum” en Elige tu viaje.** Esto estaba olvidado: las postales se tomaban, pero no había dónde verlas.
   - 43 lugares reales, cada uno con **vista aérea sacada del propio mapa** (con rótulos) o su ilustración (Comuna 13, Biblioteca España, Plaza Botero y Palacio de la Cultura).
   - **5 especiales:** Parque Arví y Homenaje a Gardel (bajarse en su estación en Ciudad Libre), Silleteros, Alumbrados y Velitas (jugar en esas fechas).
   - Usa la misma lista `Save.d.fotos` (el guardado no cambia).
3. **Cartel de la fiesta del día** con su ilustración arriba de las misiones (Alumbrados, Feria de las Flores y Velitas). Con esto se usan las 5 ilustraciones que estaban incluidas y no aparecían en ninguna parte.
4. **Pruebas:**
   - el autotest suma el álbum (arte y datos de las 48 postales) y la maqueta (la proyección va y vuelve con los 4 giros; un dibujo de prueba sale con 95 % de ciudad);
   - 100 partidas, 0 errores, 0 de consola.
5. **APK solo con el juego:** desde v0.6.0 la APK metía también los documentos del proyecto (El-Metro-TODO.html y EL-METRO-TODO.md), la imagen para redes y el servidor local. Ahora `android/app/build.gradle.kts` los excluye y la APK pasa de 4,9 a 1,9 MB.
6. **Regla aprendida:** al meter un comentario en una línea de código compacta, usar `/* … */`, nunca `//`: un `//` anuló el resto de una línea y solo lo atrapó la verificación de sintaxis.

##### v0.8.0 (2026-11-17) — identidad del Metro, seguridad y código limpio
Pedido del autor: “cambia la estética de revista, usa los colores del metro y crea una interfaz de inicio más original; quita notas innecesarias del estilo revista; pule el código; verifica su seguridad y déjalo sin rastro de uso de IA”.
1. **Diseño (`src/style.css` reescrita, mismas clases):**
   - paleta: noche del valle `#0F2238`, concreto `#E8ECEF`, andén blanco, tinta `#13253A` y los colores de cada línea;
   - **franja de las 11 líneas** bajo las barras;
   - botones en píldora, paneles redondeados y nada de bordes negros gruesos ni sombras duras;
   - tablero de anuncios con texto ámbar como el de las estaciones.
2. **Inicio original:**
   - la ilustración del valle arriba, con el título y el estado del servicio (“En servicio, 18:18” o “Cerrado, abre a las 4:30”);
   - el **menú es una línea de metro**: Jugar, La última vuelta, Aprende a usar el Metro y Jugar juntos son estaciones de colores sobre el trazo;
   - **un tren viaja a la estación que se toca** (respeta “reducir movimiento”).
3. **Elige tu viaje:** cada modo es una fila con el color de su línea: ícono en una estación, nombre, descripción y estrellas.
   - Se quitaron las notas de revista: “La revista que se mueve”, “Est. 01…”, el lema en cursiva, el pie con sellos, “Estética: revista EMSAY” en créditos y la etiqueta del bot.
   - El tema por defecto pasa de “revista” a **“metro”**; las partidas guardadas con “revista” se leen como “metro”.
4. **Seguridad:**
   - los mensajes del modo Juntos se validan por tipo: nombres limpios y acotados, modo y nivel existentes, acciones primitivas, sin claves `__proto__`, resultados con solo puntaje, estrellas y victoria;
   - importar partidas descarta claves que cambian prototipos;
   - **CSP** en el HTML: sin conexiones externas, sin objetos ni marcos y sin `base` ni formularios;
   - `no-referrer`.
   - Android revisado: solo carga sus archivos, los enlaces externos van al navegador, el acceso a archivos está apagado y los nombres de archivo se limpian.
   - **Pendiente del autor:** la APK se firma con la clave de desarrollo que está en el repositorio. Con ella, cualquiera podría firmar una “actualización”. Hay que crear una clave de publicación fuera del repositorio; las instalaciones actuales tendrían que reinstalar una vez.
5. **Código:**
   - la versión publicada se compila **sin comentarios** (`tools/build.mjs`, solo líneas completas de comentario);
   - sin menciones de herramientas de IA en `src/`, en las herramientas del juego ni en Android;
   - carpetas de arte neutras: `arte/entregas/laminas` y `arte/entregas/vectorial`;
   - índice de vías renombrado (`rIdx`) para no chocar con otra variable.
6. **Pruebas:**
   - el autotest suma pruebas de seguridad;
   - 100 partidas, 0 errores, 0 de consola (con la CSP activa);
   - pruebas maliciosas a mano: importar con `__proto__` y mensajes de red malformados, todas bien.

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
0. **Hoja de ruta del mapa medida (auditoría del 17‑nov): M1–M6 hechos en v0.10.0.** Siguiente: M7 (quebradas a su tamaño). Plan grande en `docs/REVOLUCION.md`.
0. **Hoja de ruta original del mapa (auditoría del 17‑nov):**
   - M1–M6 en una sola sesión: estaciones con huella, río continuo y que siempre baja, tranvía por su calle, patio‑taller de Bello y escaleras con sentido;
   - luego M7 (quebradas a su tamaño);
   - luego M8 y M9 (nombres y barrios fuera de Medellín).
   - Metas y fuentes en `docs/auditorias/2026-11-17-auditoria-juego-y-mapa.md`. Comprobar con `node tools/auditoria-mapa.mjs`.
   - **Arreglos rápidos del juego** del mismo informe: memoria del mapa, arranque sin tirón, resultado coherente con 0 estrellas, accesibilidad en juego y tope a las invitaciones.
0a. **Maqueta 2:1: hecha en v0.9.0.** Siguiente: usarla también en Ciudad Libre como vista opcional y pintarla con el encargo G‑100.
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
<!-- BITACORA:FIN -->
