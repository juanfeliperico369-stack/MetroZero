# 06 · GUÍA ÚNICA DE ARTE PARA IA · *El Metro*

> Una sola guía para las tres IA de imágenes: **Gemini (Nano Banana)**, **ChatGPT** y **Midjourney**.
> Cada IA recibe **todo el contexto** (Bloque 1), pero **solo hace su parte** (Bloque 2: su rol; Bloque 3: sus encargos).
> Reemplaza a las guías anteriores 06 (Gemini) y 07 (ChatGPT y Midjourney).

## Paso a paso (para ti)
1. **Gemini:** crea un **Gem** (asistente personalizado) llamado “Artista 1 · El Metro” y pega en sus instrucciones el **Bloque 1 + el Rol de Gemini (2A)**. Si no usas Gems, pega ambos bloques al empezar cada conversación.
2. **ChatGPT:** crea un **Proyecto** “El Metro · Arte” y pega en sus instrucciones el **Bloque 1 + el Rol de ChatGPT (2B)**. Si no, pégalos al empezar cada conversación.
3. **Midjourney** no lee documentos largos. Sus prompts (Bloque 3C) **ya traen el contexto adentro**. Si quieres que ChatGPT te escriba más prompts de Midjourney, usa el Rol 2C.
4. Empieza por **G‑00 (ancla de estilo)** en Gemini. Esa imagen se adjunta después en Gemini y ChatGPT y se usa como `--sref` en Midjourney, para que las tres IA dibujen igual.
5. Pide los encargos **uno por uno**, copiando el prompt de cada uno.
6. Guarda cada imagen con el **nombre exacto** del encargo y entrégamela como dice el Bloque 5.

---

## BLOQUE 1 · CONTEXTO DEL PROYECTO (pégalo completo en Gemini y en ChatGPT)
```
=== CONTEXTO DEL PROYECTO «EL METRO» — léelo completo; aplica a todo lo que hagas ===

1) QUÉ ES
"El Metro" es un videojuego para celulares (web y Android), sin conexión y para todo público, sobre el Metro de Medellín (Colombia) y la ciudad real del Valle de Aburrá. Es un MUNDO ABIERTO + ARCADE: se recorre la ciudad real a pie, en bici, taxi, bus, metro, metrocable y tranvía.
Módulos del juego:
- Ciudad Libre: mundo abierto visto desde arriba (cenital), con misiones, pasajeros, peatones, perros y vendedores.
- Bus: simulador cenital del Metroplús (bus articulado de 18 m) y de los alimentadores, de parada en parada, con pasajeros que pasan su tarjeta.
- Metro y tranvía: vista lateral panorámica por capas (cordillera, cerros, laderas con barrios, ciudad) y cabina en primera persona con botones y procedimiento real.
- Metrocable: viajar y operar las 6 líneas de cable.
- Historia "La última vuelta": Rosalba, conductora del primer tren de 1995, vive su última semana de trabajo y le enseña todo a su nieta (la protagonista) recorriendo la ciudad.
- Fiestas reales: el juego cambia con el calendario: Feria de las Flores (agosto), Alumbrados navideños (diciembre), Noche de las Velitas (7 de diciembre) y aniversario del Metro (30 de noviembre).
Restricción técnica: todo el arte se reduce después a pixel art liviano para celulares modestos. Por eso se necesita arte limpio, con siluetas claras, la vista correcta y fondo plano.

2) DIRECCIÓN DE ARTE
Concepto: "Medellín de verdad, dibujada con cariño".
- Ciudad vista desde arriba: pixel art denso y acogedor (techos, árboles en masa, río con orillas suaves, lluvia), con la claridad de los juegos clásicos de ciudad vista desde el cielo.
- Panorámica lateral: siluetas planas por capas con bruma (perspectiva atmosférica); el cielo lo pinta el juego.
- 3D: maqueta low-poly limpia, de caras planas.
- Interfaz: estética editorial (papel crema, tinta azul, letras condensadas gruesas, bloques de color) con los colores de las líneas del Metro como acentos.
Reglas para TODA imagen:
- Luz desde arriba a la izquierda. SIN sombra proyectada en el piso (la pone el juego).
- Contorno oscuro fino (#141414) en personajes y vehículos; edificios sin contorno grueso.
- Paleta limitada (máximo 32 colores por imagen), tomada de la sección 3.
- Silueta legible en tamaño pequeño; formas simples; sin texturas fotográficas.
- Fondo magenta plano #FF00FF, o transparente si tu herramienta lo permite, salvo que el encargo diga otra cosa. Nunca fondo blanco.
- PROHIBIDO: texto, letras o números (salvo cuando el encargo lo pida, y en español); logos o marcas reales (ni el logo del Metro ni de empresas); marcas de agua; armas; violencia; alcohol; cigarrillo; pólvora en manos de niños; estereotipos de narcotráfico. Todo es para todo público.
- Arte ORIGINAL: no copies personajes, logos ni escenarios de otros juegos. Las referencias de la sección 8 son solo principios.

3) PALETAS (HEX)
Líneas del sistema: A #1C5C9C · B #E38835 · T (tranvía) #59AB42 · K #B8CF40 · J #F6C538 · H #EB318E · L #8E612A · M #743D90 · P #EC343A · Metroplús 1 #0E6F76 · Metroplús 2 #65A9AC.
Interfaz: papel #f1ece0 · crema #faf6ec · manteca #fbe7b0 · tinta #154a80 · negro #141414 · noche #0f2a45 · gris #9aa1a8 · blanco #fdfbf5.
Ciudad de día: asfalto #3b3f45 · andén #c9c1ad · ladrillo #b4583a y #9a4630 · teja #a8452f · losa #9e9a92 · eternit #8f9497 · pasto #4f8a3c · árbol #2f6b35 · río #5f7f73 · concreto #a9a59b · vidrio #9fd3e6 · tanque de agua #1d1f24.
Panorámica: día (cielo #3f8bd0 a #d6ecf3, cordillera #7f9fbf, cerros #5f8f86, laderas #3f7f4a, suelo #36663b) · atardecer (#3d2e5f #8e5b7a #f08a5d #f4d9a8) · noche (#08122a #1a2b4f, ventanas #ffd27a #ffb347).
Gente: pieles #f1c9a5 #d9a77f #b07a52 #8a5a3b #5e3b26 · ropa #c8201f #12446c #2f9b57 #c3952f #ff6a3d #7a5cc4 #f9e4a4 #141414 #1b8088.
Fiestas: Feria de las Flores #9b3faf #f7c325 #d7263d #f28c28 #3a7d44 · Alumbrados #fff1c1 #ffc23d #e83e8c #2ec4f1 #0b1530 · Velitas #ffb347 #d62828 #2a9d8f #f4d35e.

4) VISTAS Y TAMAÑOS
- Ciudad (cenital 3/4): desde arriba con unos 15° de inclinación; se ve el techo y una franja de la fachada de abajo. Una casilla del mapa = 20 m.
- Sprites de vehículos: vista superior pura, mirando a la DERECHA. Escala 1 m = 8 px: carro 36×16, moto 16×8, bici 14×6, buseta 64×20, alimentador 96×20, articulado 144×20, coche de metro 176×24, cabina de cable 24×24.
- Peatones: vista superior pura, 16×16 px por cuadro, 4 cuadros de caminar.
- Panorámica: perfil puro, sin punto de fuga, SIN cielo; capas horizontales 4:1 (cordillera lejana, cerros, laderas con barrios, ciudad cercana).
- Vehículos y estaciones de perfil: perfil puro mirando a la derecha.
- Cabina en primera persona: vertical 9:16 y horizontal 16:9; el parabrisas en magenta plano.
- Retratos: busto en tres cuartos mirando a la derecha, cuadrado.
- Íconos: cuadrados, planos, contorno negro grueso, 2 colores más negro, sin texto.
Las IA generan grande (1024 px o más) y luego se reduce y se pixela. Lo importante: la vista correcta, las proporciones y el fondo plano.

5) CÓMO SE VE MEDELLÍN
- Valle largo y angosto de norte a sur. El río Medellín va canalizado en el fondo, con autopistas a lado y lado, y el metro elevado corre junto al río.
- Laderas a oriente y occidente llenas de barrios de LADRILLO naranja a la vista que suben hasta el monte verde. De noche, las laderas son un "pesebre" de luces cálidas.
- Casas de barrio: 2 a 4 pisos, terrazas planas con tanques de agua negros, varillas esperando el siguiente piso, ropa al sol, escaleras exteriores, algunas fachadas pintadas (menta, amarillo, rosado).
- Otros lugares:
  · barrios tradicionales con techos de teja de barro;
  · El Poblado, con torres de ladrillo y vidrio;
  · el centro, con la Catedral de ladrillo, el Palacio de la Cultura en damero blanco y negro, la Plaza Botero con esculturas de bronce y el Parque de los Pies Descalzos (guadua, agua, arena);
  · el Pueblito Paisa, con muros blancos y balcones de madera de colores.
- Vegetación: ceibas, guayacanes amarillos y rosados, palmas y guadua. Cerros: El Volador, Nutibara, Pan de Azúcar, El Picacho y Quitasol.
- Clima de eterna primavera: sol fuerte al mediodía, aguaceros en la tarde, niebla en la madrugada.

6) EL SISTEMA DE TRANSPORTE
- Metro (líneas A y B): viaducto de concreto gris claro sobre columnas, catenaria con postes; estaciones elevadas con cubierta metálica y andén con línea amarilla; trenes de 3 coches con cabina en ambos extremos, carrocería clara con franja de color.
- Metrocable (K, J, L, H, M, P): cabinas pequeñas tipo góndola sobre torres metálicas que pasan por encima de las casas; la L (Arví) entra a un bosque de pinos con neblina.
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
- Atmósfera (arte digital de túneles de neón, Holstin, Cairn): noches de cine, pixel isométrico con luz, ilustración estilizada.

9) REPARTO DEL TRABAJO (cada IA hace SOLO lo suyo)
- ARTISTA 1 = GEMINI NANO BANANA, encargos G-: ancla de estilo, personajes (hojas, retratos y sprites), fotos reales convertidas a nuestro estilo (estaciones y vehículos de perfil), ladera desde foto, variantes por hora y por fiesta, hojas de casas de barrio.
- ARTISTA 2 = CHATGPT, encargos C-: sprites de vehículos vistos desde arriba con fondo transparente, íconos e insignias, consola de cabina y tablero del bus, letreros en blanco, portada con título, decoraciones de fiesta.
- ARTISTA 3 = MIDJOURNEY, encargos M-: capas panorámicas por zona y hora, texturas repetibles, arte de ambiente de las fiestas, portada pintada, conceptos de región.

10) ENTREGA
- Cada imagen se guarda con el nombre exacto del encargo: minúsculas, sin tildes ni espacios (por ejemplo ret_rosalba_alegre.png).
- Formato PNG, con fondo transparente o magenta #FF00FF.
- Una imagen por encargo, o la hoja que se pida.
=== FIN DEL CONTEXTO ===
```

---

## BLOQUE 2 · ROLES (pega solo el de la IA que vas a usar, debajo del Bloque 1)

### 2A · Rol de Gemini (Nano Banana)
```
TU ROL: eres el ARTISTA 1 de "El Metro" y trabajas en Gemini (Nano Banana). Conoces todo el contexto de arriba para entender el proyecto, pero SOLO haces los encargos que empiezan por G- (ancla de estilo, personajes, fotos convertidas a nuestro estilo, variantes de hora y de fiesta, hojas de casas de barrio).
Si te pido un encargo C- o M-, o algo que no está en tu lista, respóndeme: "Eso le corresponde al Artista 2 (ChatGPT) o al Artista 3 (Midjourney)" y no lo hagas.
Reglas de tu herramienta:
- no das transparencia: usa siempre fondo magenta plano #FF00FF;
- deja margen libre en las esquinas;
- mantén el mismo estilo y los mismos personajes en toda la conversación;
- cuando te adjunte "ancla_estilo.png", úsala como referencia EXACTA de estilo;
- cuando te adjunte una foto real, conserva la forma real y cambia solo el estilo.
Responde solo: "Listo, Artista 1 (Gemini) preparado", y espera mi primer encargo.
```

### 2B · Rol de ChatGPT
```
TU ROL: eres el ARTISTA 2 de "El Metro" y trabajas en el generador de imágenes de ChatGPT. Conoces todo el contexto de arriba para entender el proyecto, pero SOLO haces los encargos que empiezan por C- (sprites de vehículos vistos desde arriba con transparencia, íconos e insignias, consola de cabina y tablero del bus, letreros en blanco, portada con título, decoraciones de fiesta).
Si te pido un encargo G- o M-, o algo que no está en tu lista, respóndeme: "Eso le corresponde al Artista 1 (Gemini) o al Artista 3 (Midjourney)" y no lo hagas.
Reglas de tu herramienta:
- entrega PNG con FONDO TRANSPARENTE; si no puedes, usa magenta plano #FF00FF;
- tamaños: 1024×1024 (cuadrado), 1536×1024 (horizontal), 1024×1536 (vertical);
- solo pon texto cuando el encargo lo pida, y en español;
- si te adjunto "ancla_estilo.png", copia exactamente su estilo.
Responde solo: "Listo, Artista 2 (ChatGPT) preparado", y espera mi primer encargo.
```

### 2C · Rol opcional: ChatGPT como redactor de prompts para Midjourney
```
TU ROL: con el contexto de arriba, eres el REDACTOR DE PROMPTS del ARTISTA 3 (Midjourney). No generas imágenes: SOLO escribes prompts en inglés para los encargos M- que te pida, siguiendo la dirección de arte y las paletas del contexto. Cada prompt debe:
- describir la vista y la composición, y nombrar los colores HEX clave;
- terminar con los parámetros "--ar <proporción> --style raw --sref <URL_ANCLA> --no text, letters, logo, watermark, signature";
- no nombrar juegos ni artistas;
- ser para todo público.
Si te pido algo que no es un encargo M-, responde "Eso le corresponde al Artista 1 o al Artista 2".
Responde solo: "Listo, redactor de Midjourney preparado".
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
G-20. [Adjunto una foto real de la estación y el ancla] Redibuja la estación de la foto como ilustración de PERFIL perfecto (vista lateral plana, sin perspectiva), en nuestro estilo: concreto gris claro, cubierta metálica, andén con línea amarilla, escaleras. Conserva la forma real. Formato 4:1 horizontal. Fondo magenta. Sin letreros ni texto.
```
**G‑21 a G‑25** repiten G‑20 con otras estaciones:
- G‑21: San Antonio, `est_lado_san_antonio`.
- G‑22: Niquía, `est_lado_niquia`.
- G‑23: una estación de Metroplús, `est_lado_metroplus`.
- G‑24: una estación de Metrocable, `est_lado_cable`.
- G‑25: una parada del tranvía, `est_lado_tranvia`.

**G‑30 · Tren de perfil desde foto** → `veh_lado_metro_a.png`
```
G-30. [Adjunto una foto real de un tren del Metro de Medellín y el ancla] Conviértelo en un sprite de PERFIL perfecto mirando a la derecha: 3 coches con cabina en los extremos, ventanas, puertas marcadas, pantógrafo y franja #1C5C9C. Formato 8:1 horizontal. Fondo magenta. Sin logos ni texto.
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
G-40. [Adjunto una foto real de una comuna en ladera y el ancla] Conviértela en una capa de fondo de vista lateral: silueta de montaña con casitas de ladrillo apiladas que suben desde abajo y se vuelven bosque verde arriba. Ilustración plana con detalle pixelado en las casas. Formato 4:1. Arriba de la montaña, fondo magenta. Sin texto.
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
**C‑40 · Portada para compartir** → `clave_compartir.png` (1536×1024; se recorta a 1200×630)
```
C-40. Un tren de metro claro con franja #1C5C9C cruza un viaducto al atardecer sobre el río de Medellín. Detrás, montañas con laderas llenas de casitas de ladrillo que empiezan a encenderse, un metrocable de cabinas de colores sube por la ladera y hay gallinazos en el cielo naranja y violeta. Ilustración plana por capas con detalle de pixel art. Arriba a la izquierda, el título "EL METRO" en letras condensadas gruesas color crema #fbe7b0 con borde #141414 y, debajo, "La última vuelta" en letra más pequeña. Sin logos reales.
```
**C‑41 · Pantalla de carga** → `clave_carga.png` (1024×1536)
```
C-41. La misma escena de C-40 en vertical, con Rosalba (abuela conductora con uniforme azul y tinto) de espaldas, mirando la ciudad desde el andén. Sin texto.
```
**C‑50 · Decoraciones de fiesta** → `fiesta_sprites.png`
```
C-50. Hoja con fondo transparente y vista cenital: pétalos sueltos (8 tipos), una silleta de flores vista desde arriba, faroles de papel (rojo, verde y amarillo) y velas, guirnaldas de luces en tramo recto y en curva, figuras de luz de Navidad vistas desde arriba (estrella, flor, pesebre sencillo) y banderines de la Feria.
```

### 3C · Midjourney (Artista 3) · encargos M‑
> Midjourney no lee el Bloque 1: estos prompts **ya traen el contexto adentro** y van en inglés.
> **Antes de empezar:**
> - Sube `ancla_estilo.png` a Midjourney y reemplaza `<URL_ANCLA>` por su enlace (referencia de estilo). Con `--sw 50` a `200` controlas cuánto pesa.
> - Usa la versión más reciente (`--v 7` o superior).
> - Para alargar una capa, usa **Pan** a la izquierda o la derecha. Yo empato los bordes al final.
> - `--tile` es **solo para texturas** (M‑10).

**M‑01 a M‑04 · Capas panorámicas** → `pan_<zona>_<hora>_<capa>.png`. Cambia en el prompt la zona y la hora de las listas de abajo.

M‑01 · Cordillera lejana (`_1lejana`)
```
M-01 side view parallax background layer for a 2D mobile game set in Medellín, Colombia: distant Andes mountain range silhouette above a long narrow valley, flat shapes with soft atmospheric haze and a subtle ridge highlight, color #7f9fbf fading to #a8c0d8 at the base, no sky (plain flat magenta #FF00FF above the ridge), orthographic side view, horizon perfectly level, clean flat illustration, [HORA] --ar 4:1 --style raw --sref <URL_ANCLA> --no text, letters, logo, watermark, signature, buildings
```
M‑02 · Cerros intermedios (`_2cerros`)
```
M-02 side view parallax layer for a 2D game in Medellín, Colombia: rolling green hills silhouette #5f8f86 in front of distant mountains, a few scattered red-brick houses at the base, flat illustration, plain flat magenta #FF00FF background above, orthographic side view, [HORA] --ar 4:1 --style raw --sref <URL_ANCLA> --no text, letters, logo, watermark, signature
```
M‑03 · Laderas con barrios (`_3laderas`)
```
M-03 side view of a steep green hillside in Medellín, Colombia, densely covered with small stacked red-brick houses (exposed orange brick #b4583a, flat concrete roofs with black water tanks, a few painted facades in mint, yellow and pink), houses climbing from the valley floor and fading into green forest near the top, a thin cable car line with tiny cabins crossing the slope, flat illustration with crisp pixel-art detail in the houses, plain flat magenta #FF00FF above the ridge, orthographic side view, [HORA] --ar 4:1 --style raw --sref <URL_ANCLA> --no text, letters, logo, watermark, signature
```
M‑04 · Ciudad cercana (`_4ciudad`)
```
M-04 side view of a dense Latin American city in a valley (Medellín, Colombia): mid-rise red-brick apartment buildings, a few glass towers, a large brick cathedral, trees, an elevated concrete metro viaduct, all as flat silhouettes with simple windows, plain flat magenta #FF00FF background above, orthographic side view, [HORA] --ar 4:1 --style raw --sref <URL_ANCLA> --no text, letters, logo, watermark, signature
```
**Zonas** (agrégala al prompt y al nombre del archivo):

| Zona | Agrega al prompt |
|---|---|
| `norte` | Bello, low houses and old textile factories |
| `centro` | brick cathedral, tall buildings, a needle-topped tower |
| `occidente` | San Javier and Comuna 13, very dense hillsides with colorful murals |
| `nororiente` | Santo Domingo, a library made of three black rock-like buildings on the hilltop |
| `sur` | El Poblado, glass and brick towers among lots of greenery |
| `ayacucho` | a steep street climbing with colorful houses |

**[HORA]** (y el nombre del archivo):

| Hora | Texto para [HORA] |
|---|---|
| `dia` | bright midday light |
| `tarde` | golden hour, warm orange and violet haze |
| `noche` | night, thousands of warm window lights #ffd27a scattered on the hillside |
| `alumbrados` | December night with colorful Christmas light figures along the river |

**M‑10 · Texturas repetibles** → `tex_<material>.png`
```
M-10 seamless tileable texture, top-down orthographic, exposed orange clay brick wall with light mortar joints, flat even lighting, pixel-art friendly, limited palette #b4583a #9a4630 #c8714d #d8c3a5 --tile --ar 1:1 --style raw --no text, logo, shadows
```
Cambia el material y el nombre del archivo:

| Material | Agrega al prompt | Archivo |
|---|---|---|
| Teja de barro | #a8452f | `tex_teja` |
| Asfalto con grietas suaves | #3b3f45 | `tex_asfalto` |
| Baldosa de andén | #c9c1ad | `tex_anden` |
| Concreto de viaducto | #a9a59b | `tex_concreto` |
| Balasto con traviesas | — | `tex_balasto` |
| Pasto | #4f8a3c | `tex_pasto` |
| Agua de río café verdosa | #5f7f73 | `tex_rio` |
| Techo de eternit ondulado | — | `tex_eternit` |
| Adoquín de plaza | — | `tex_adoquin` |

**M‑20 a M‑26 · Ambiente de fiestas** (referencia para todo el equipo) → `amb_<fiesta>.png`
```
M-20 illustrated scene of a flower parade in Medellín, Colombia: farmers carrying huge wooden frames full of flowers on their backs along a wide avenue, cheering families, orchids, sunflowers and carnations (#9b3faf #f7c325 #d7263d #f28c28), bright August sun, an elevated metro viaduct in the background, joyful atmosphere, flat illustration with pixel-art details --ar 16:9 --style raw --sref <URL_ANCLA> --no text, letters, logo, watermark, signature
```
Para los demás, cambia solo la escena:

| ID | Escena | Archivo |
|---|---|---|
| M‑21 | river at night lined with giant colorful Christmas light figures (#fff1c1 #ffc23d #e83e8c #2ec4f1), families walking, metro train crossing a lit viaduct | `amb_alumbrados` |
| M‑22 | hillside neighborhood at dusk, every doorstep with candles and colorful paper lanterns | `amb_velitas` |
| M‑23 | 1930s vintage propeller plane and a tango dancing couple silhouette at dusk, homage atmosphere | `amb_tango` |
| M‑24 | covered outdoor escalators climbing a colorful hillside with huge murals | `amb_comuna13` |
| M‑25 | cable car cabins entering a misty pine forest above the city | `amb_arvi` |
| M‑26 | afternoon tropical rain over the city, shiny streets, colorful umbrellas, buses with headlights | `amb_aguacero` |

**M‑30 · Portada pintada** (sin texto) → `clave_portada.png`
```
M-30 key art for a cozy open-world transit game set in Medellín, Colombia: sunrise over a long valley, an elevated metro train with a blue stripe (#1C5C9C) crossing over the river, cable car cabins climbing hillsides covered in red-brick houses, an elderly train driver woman with a thermos of coffee smiling at the window, warm golden light, layered flat illustration with crisp pixel details, hopeful and tender mood --ar 16:9 --style raw --sref <URL_ANCLA> --no text, letters, logo, watermark, signature
```
**M‑40 · Conceptos de región** (guía para la ciudad vista desde arriba) → `concepto_<region>.png`
```
M-40 top-down slightly tilted view of a Medellín, Colombia neighborhood block: red-brick houses with flat roofs and black water tanks, narrow streets with parked cars, a small park with a soccer court, a corner store with a colorful awning, cozy dense pixel-art style, soft light from top-left, no cast shadows --ar 1:1 --style raw --sref <URL_ANCLA> --no text, letters, logo, watermark, signature
```
Repite M‑40 para estas regiones: centro, ladera, Poblado, río y estación de metro.

---

## BLOQUE 4 · CORRECCIONES RÁPIDAS
| Problema | Gemini / ChatGPT (díselo así) | Midjourney (agrega o cambia) |
|---|---|---|
| Cambió el estilo | “Vuelve EXACTAMENTE al estilo del ancla adjunta: mismos colores y mismo grosor de píxel.” | Usa la misma `--sref` y sube `--sw` |
| Salió texto o un logo | “Quita todo el texto, letras, números y logos.” | `--no text, letters, typography, signage, logo` |
| La vista quedó en perspectiva | “Vista de perfil PERFECTA, sin punto de fuga” / “Vista cenital PURA desde arriba.” | `orthographic side view, no perspective, horizon perfectly level` |
| El fondo no es plano | “Fondo magenta #FF00FF completamente plano, sin sombra ni degradado.” | `plain flat magenta background` |
| Se ve borroso | “Píxeles grandes, nítidos y cuadrados, sin suavizado.” | `crisp pixel details, clean edges` |
| Muy realista o recargado | “Más simple: formas planas y pocos colores.” | `flat illustration, simple shapes, limited palette` y baja `--s` |
| El personaje cambió de cara | “Es el MISMO personaje de la hoja adjunta: misma cara, peinado, ropa y colores.” | (no aplica: los personajes son de Gemini) |
| Te pidieron algo de otra IA | La IA debe responder “Eso le corresponde a…” | — |

---

## BLOQUE 5 · ENTREGA
**Orden recomendado:**
1. G‑00 (ancla de estilo);
2. personajes (G‑01 a G‑10);
3. vehículos vistos desde arriba (C‑01, C‑02);
4. panorámicas del centro y el norte, de día y de noche (M‑01 a M‑04);
5. casas de barrio (G‑60 a G‑63) y texturas (M‑10);
6. estaciones y vehículos de perfil (G‑20 a G‑37);
7. íconos (C‑10 a C‑12);
8. cabina (C‑20, C‑21);
9. fiestas (G‑53 a G‑55, C‑50, M‑20 a M‑26);
10. portadas (C‑40, C‑41, M‑30).

Una entrega parcial ya sirve.

**Carpetas** (dentro de `arte/entregas/`):

| Carpeta | Qué va |
|---|---|
| `00_ancla` | el ancla de estilo |
| `personajes` | hojas, retratos y sprites de personajes |
| `vehiculos` | sprites cenitales y vehículos de perfil |
| `estaciones` | estaciones de perfil |
| `panoramicas` | capas panorámicas y la ladera |
| `casillas` | hojas de casas y barrios |
| `texturas` | texturas repetibles |
| `cabinas` | consola del metro y tablero del bus |
| `iconos` | íconos e insignias |
| `clave` | portadas, pantalla de carga y conceptos |
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
