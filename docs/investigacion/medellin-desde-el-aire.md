# Medellín desde el aire · investigación para El Metro 1.2.0

> Qué se aprendió mirando a Medellín desde arriba (fotos aéreas, desde el avión, desde el metrocable, desde drones y desde edificios altos) y cómo se volvió regla del juego. Solo se usaron fuentes con **licencia libre** (Wikimedia Commons) y datos abiertos; **ninguna imagen de Google Maps ni de Google Earth**. Las fotos no se copian al juego: se miraron para entender formas, materiales, colores y ambiente.

## Cómo se hizo
1. **Búsqueda** en Wikimedia Commons (API, con pausas por el límite de peticiones): 94 archivos útiles entre fotos aéreas, panorámicas, tomas de dron, vistas desde el metrocable y desde edificios, una imagen satelital CBERS‑4A (INPE, CC BY‑SA 4.0) y un video CC0 de la maqueta de la Ciudad Universitaria. Al video no se le pudieron sacar fotogramas, porque Wikimedia frenó la descarga; queda para la próxima.
2. **Lectura** en hojas de contacto por zona: valle y barrios planos, Centro y La Alpujarra, laderas, El Poblado y Laureles, universidades.
3. **Medición** con datos abiertos: 639.457 huellas de edificios (Overture Maps: OpenStreetMap, Microsoft y Google Open Buildings) y la capa oficial de construcciones del Catastro de Medellín con el número de pisos de Popular, El Poblado y Robledo.
4. **Regla**: cada observación pasó a una tabla de materiales, techos, pisos y árboles por zona (`src/js/11-edificios.js`), y se comparó en capturas del juego con las fotos.

## Lo que se ve desde arriba

### El valle
- **Desde el espacio** (CBERS‑4A, cámara MUX, 27‑ene‑2023): la ciudad es una franja gris rosada que sigue el río de sur a norte, con dedos que suben por las quebradas. La rodean montañas verde oscuro, y hay nubes pegadas a las crestas del occidente.
- **Desde el avión hacia el norte:** junto al río, en el sur, están las bodegas grandes de techo gris y blanco de Guayabal e Itagüí. La ladera oriental, de El Poblado a Envigado, está erizada de torres. En las lomas rurales hay fincas con teja entre potreros.
- **Lo que todos saben:** Medellín llena un valle largo y angosto de sur a norte; el río y el metro van por el fondo y la ciudad sube por las dos laderas hasta casi la cresta, que queda verde (Santa Elena al oriente, el occidente con sus cerros). Los cerros tutelares (Nutibara, El Volador) son islas de bosque dentro de la ciudad: desde el avión, el Nutibara se ve como una loma tupida con el Pueblito Paisa arriba.
- **Lo poco conocido:** visto desde el avión, el fondo plano del valle es un **tapete terracota**: la teja de barro de Laureles, Belén, el Centro y los barrios del aeropuerto domina sobre las azoteas grises. En cambio las laderas populares se ven **claras**: techos de fibrocemento y zinc sobre muros de ladrillo naranja. La diferencia de color entre el fondo y las laderas es lo que más se nota desde arriba.

### Centro y La Alpujarra
- Manzanas apretadas de 3 a 8 pisos con torres de 20 a 40 (el Coltejer tiene 38 pisos según OpenStreetMap y el Edificio del Café 36), fachadas ocres, crema y de ladrillo; teja vieja en lo bajo y azoteas con tanques y aparatos en lo alto; casi sin árboles, salvo las plazas (palmas y ceibas en el Parque Berrío y la Plaza Botero). El viaducto del metro corta el Centro en curva sobre Carabobo.
- **La Alpujarra:** la Alcaldía y la Gobernación son dos bloques enormes de **concreto blanco**, frente a frente sobre su plaza. Sus fachadas largas se **inclinan** (más anchas abajo) y son franjas verticales de ventanas oscuras color bronce entre parteluces blancos, encerradas por **culatas macizas** blancas. En la plaza está el Monumento a la Raza de Rodrigo Arenas Betancur. Al lado, la torre de la Plaza de la Libertad con su celosía dorada (24 pisos según OpenStreetMap) y el Edificio del Café.

### Laderas (Popular, Santo Domingo, Comuna 13, Villa Turbay)
- Casas de **2 a 4 pisos** de ladrillo a la vista, apiladas en la pendiente. Una de cada tres o cuatro tiene la fachada pintada (azul cielo, verde, rosado, amarillo, blanco), casi siempre el primer piso.
- **Techos:** lámina de fibrocemento gris, zinc oxidado, **planchas** de concreto con el tanque de agua (negro o azul) y a veces los hierros esperando el piso siguiente, algo de teja. Callejones y **escaleras con baranda amarilla**. Árboles solo en las quebradas y donde no se puede construir; arriba empieza el monte.
- **Lo poco conocido (datos oficiales):** en Popular, el 81 % de las unidades de construcción del Catastro mide menos de 40 m² y su promedio es de 1,65 pisos. Es la casa que crece piso por piso y se registra por partes. Unidas en su huella completa, la casa típica tiene 2 o 3 pisos (mediana 2, percentil 90 de 3).

### El Poblado (y las lomas de Envigado y Sabaneta)
- Torres de **12 a 30 pisos** con fachada de **ladrillo** naranja y balcones, metidas en un **bosque** denso. Abajo, casas blancas con teja; piscinas en los zócalos de las torres; vidrio en las oficinas de la Milla de Oro.
- **Datos oficiales:** las huellas de 500 a 1.000 m² tienen mediana de 5 pisos y percentil 90 de 26. El Poblado mezcla casas de 2 pisos con torres altísimas.

### Laureles, Belén y los barrios del aeropuerto
- Casas de 2 y 3 pisos, blancas y de ladrillo, con **teja de barro** a dos aguas y antejardín. Hay bloques de apartamentos de 5 a 8 pisos, muchos también con teja. Las avenidas y circulares van arborizadas. Hay canchas sintéticas, piscinas y canchas de tenis de polvo de ladrillo junto al aeropuerto Olaya Herrera.

### Universidades
- **Universidad de Antioquia:** bloques modernos de ladrillo y concreto de 2 a 4 pisos, de **techo plano**, alrededor de plazas y prados con muchos árboles (la Biblioteca Central, el Teatro al aire libre, el Hombre Creador de Energía).
- **Facultad de Minas (UNAL):** arenisca amarilla con pilastras, de aire art déco.
- **EAFIT y UPB:** bloques blancos y de ladrillo entre vegetación muy tupida.

## Cómo quedó en el juego
| Zona (comunas y municipios) | Muros | Techos | Pisos (estimados, si no hay dato) | Árboles en patios y antejardines |
|---|---|---|---|---|
| **Laderas** (1, 2, 3, 6, 8, 9 y 13) | 72 % ladrillo, el resto pintado | plancha con tanque 28 %, fibrocemento 22 %, zinc 26 %, teja 17 %, lámina blanca 7 % | como Popular (oficial): 2–3 | pocos (3,5 %) |
| **Barrios mixtos** (4, 5, 7, 15, San Antonio de Prado, Bello, Itagüí, La Estrella, Copacabana) | ladrillo 56 %, claros, pintados | teja 46 %, plancha 34 %, fibrocemento 20 % | como Robledo (oficial): 2–5, algunas torres | 5 % |
| **Laureles–Belén** (11, 12 y 16) | claros 42 %, ladrillo 44 % | teja 68 %, plancha 32 % | 2–3 en casas; 4–12 en bloques | 20 % |
| **El Poblado** (14, Envigado y Sabaneta) | torres de ladrillo 66 %, claros | casas con teja 62 %; torres con azotea, piscina o helipuerto | como El Poblado (oficial): torres de 10–30 | 34 % (bosque) |
| **Centro** (10) | ocres 45 %, ladrillo 35 %, grises | teja 50 %, azoteas | 3–8, torres de 15–36 | casi nada |
| **Pueblos** (Caldas, Girardota, Barbosa y corregimientos) | blancos 68 % | teja 78 % | 1–2 | 10 % |

Además:
- **Usos:** bodegas de lámina con canales y sierra; iglesias con campanario; colegios y universidades de ladrillo o crema, con techo plano si son grandes; hospitales blancos; coliseos; cubiertas abiertas; invernaderos; tanques redondos.
- **Suelos:** 56 campus con su prado y árboles, 1.368 canchas (de fútbol, en grama con sus líneas, y placas polideportivas de colores), 37 pistas atléticas y 885 piscinas.
- **La Alpujarra:** la Alcaldía, la Gobernación y el Palacio de Justicia se dibujan con fachada inclinada, parteluces blancos, ventanas oscuras y culatas macizas (estilo `alpujarra`).
- **La calle siempre libre:** las huellas y las vías vienen de fuentes distintas y se corren uno o dos metros. Por eso cada edificio se recorta contra el asfalto con medio andén, las peatonales, las escaleras, el carril del Metroplús y el tranvía. El eje de las calles quedó libre en el 100 % de las muestras y los bordes de carril en más del 99,9 %.

## Créditos de las fotos que se miraron

**Valle y barrios planos**

| Archivo | Autor | Licencia |
|---|---|---|
| [Medellin MUX4A 20230127 248 105 L2 BAND765 Cont.png](https://commons.wikimedia.org/wiki/File:Medellin_MUX4A_20230127_248_105_L2_BAND765_Cont.png) (satélite CBERS‑4A) | INPE/OBT/DPI (Instituto Nacional de Pesquisas Espaciais, Brasil) | CC BY-SA 4.0 |
| [Vista casi completa del valle de Aburrá - Flickr - Alejandro Bayer.jpg](https://commons.wikimedia.org/wiki/File:Vista_casi_completa_del_valle_de_Aburr%C3%A1_-_Flickr_-_Alejandro_Bayer.jpg) | Alejandro Bayer Tamayo | CC BY-SA 2.0 |
| [Zona central de Medellín. Aeropuerto. Al fondo el Poblado - Flickr - Alejandro Bayer.jpg](https://commons.wikimedia.org/wiki/File:Zona_central_de_Medell%C3%ADn._Aeropuerto._Al_fondo_el_Poblado_-_Flickr_-_Alejandro_Bayer.jpg) | Alejandro Bayer Tamayo | CC BY-SA 2.0 |
| [Vista aerea de Medellín.jpg](https://commons.wikimedia.org/wiki/File:Vista_aerea_de_Medell%C3%ADn.jpg) | Xemenendura | CC BY-SA 4.0 |
| [Medellín-aerial view.jpg](https://commons.wikimedia.org/wiki/File:Medell%C3%ADn-aerial_view.jpg) | Luis Perez | CC BY 2.0 |
| [Medellín desde el aire (2044379528).jpg](https://commons.wikimedia.org/wiki/File:Medell%C3%ADn_desde_el_aire_(2044379528).jpg) | Edgar Jiménez from Porto, Portugal | CC BY-SA 2.0 |
| [Medellín desde el aire (2044382524).jpg](https://commons.wikimedia.org/wiki/File:Medell%C3%ADn_desde_el_aire_(2044382524).jpg) | Edgar Jiménez from Porto, Portugal | CC BY-SA 2.0 |
| [19-FEB-2023 - 9R8766 - EOH-BOG (ATR42 - HK4979 (FAC-1191)) (02).jpg](https://commons.wikimedia.org/wiki/File:19-FEB-2023_-_9R8766_-_EOH-BOG_(ATR42_-_HK4979_(FAC-1191))_(02).jpg) | Simply Aviation | CC BY-SA 4.0 |
| [Foto aérea dr arango.jpeg](https://commons.wikimedia.org/wiki/File:Foto_a%C3%A9rea_dr_arango.jpeg) | Cigomezr | CC BY-SA 4.0 |
| [Panorámica aérea de la ciudad de Medellín.jpg](https://commons.wikimedia.org/wiki/File:Panor%C3%A1mica_a%C3%A9rea_de_la_ciudad_de_Medell%C3%ADn.jpg) | Michael David Cote Torres | CC BY-SA 4.0 |

**Centro y La Alpujarra**

| Archivo | Autor | Licencia |
|---|---|---|
| [Centro de Medellín en dron 01.jpg](https://commons.wikimedia.org/wiki/File:Centro_de_Medell%C3%ADn_en_dron_01.jpg) | Juan Gómez | CC BY 2.0 |
| [Centro de Medellín en dron 03.jpg](https://commons.wikimedia.org/wiki/File:Centro_de_Medell%C3%ADn_en_dron_03.jpg) | Juan Gómez | CC BY 2.0 |
| [Centro de Medellín en dron 04.jpg](https://commons.wikimedia.org/wiki/File:Centro_de_Medell%C3%ADn_en_dron_04.jpg) | Juan Gómez | CC BY 2.0 |
| [Alpujarra, Medellín, Colombia.jpg](https://commons.wikimedia.org/wiki/File:Alpujarra,_Medell%C3%ADn,_Colombia.jpg) | Luis Perez | CC BY 2.0 |
| [Alcaldiamed.jpg](https://commons.wikimedia.org/wiki/File:Alcaldiamed.jpg) | Jorge Gomez Kroyf | CC BY-SA 3.0 |
| [Centro administrativo La Alpujarra - Medellín.JPG](https://commons.wikimedia.org/wiki/File:Centro_administrativo_La_Alpujarra_-_Medell%C3%ADn.JPG) | Yimicorrea | CC BY-SA 3.0 |
| [La Alpujarra-Medellin.JPG](https://commons.wikimedia.org/wiki/File:La_Alpujarra-Medellin.JPG) | SajoR | Public domain |
| [Gobernación de Antioquia2.jpg](https://commons.wikimedia.org/wiki/File:Gobernaci%C3%B3n_de_Antioquia2.jpg) | laloking97 | CC BY-SA 2.0 |
| [Edificio del Café-Alpujarra.JPG](https://commons.wikimedia.org/wiki/File:Edificio_del_Caf%C3%A9-Alpujarra.JPG) | ~~×α£đ~~es | CC BY-SA 3.0 |
| [Día soleado en Medellin.jpg](https://commons.wikimedia.org/wiki/File:D%C3%ADa_soleado_en_Medellin.jpg) | Ephren23 | CC BY-SA 4.0 |

**Laderas**

| Archivo | Autor | Licencia |
|---|---|---|
| [Vista aérea del Barrio La Avanzada, Comuna 1 - Popular, Medellín.jpg](https://commons.wikimedia.org/wiki/File:Vista_a%C3%A9rea_del_Barrio_La_Avanzada,_Comuna_1_-_Popular,_Medell%C3%ADn.jpg) | Farley Jhair Macias Betancur | CC BY-SA 4.0 |
| [Comuna 13, Medellín 06.jpg](https://commons.wikimedia.org/wiki/File:Comuna_13,_Medell%C3%ADn_06.jpg) | Bernard Gagnon | CC BY-SA 4.0 |
| [Comuna 13, Medellín 05.jpg](https://commons.wikimedia.org/wiki/File:Comuna_13,_Medell%C3%ADn_05.jpg) | Bernard Gagnon | CC BY-SA 4.0 |
| [Comuna 13, Medellín 02.jpg](https://commons.wikimedia.org/wiki/File:Comuna_13,_Medell%C3%ADn_02.jpg) | Bernard Gagnon | CC BY-SA 4.0 |
| [2018 casas en el barrio Villa Turbay de la Comuna 8 de Medellín a ala altura de la estación Villa Sierra del Metrocable.jpg](https://commons.wikimedia.org/wiki/File:2018_casas_en_el_barrio_Villa_Turbay_de_la_Comuna_8_de_Medell%C3%ADn_a_ala_altura_de_la_estaci%C3%B3n_Villa_Sierra_del_Metrocable.jpg) | Felipe Restrepo Acosta | CC BY-SA 4.0 |
| [2018 barrio Villa Turbay de la Comuna 8 de Medellín a ala altura de la estación Villa Sierra del Metrocable.jpg](https://commons.wikimedia.org/wiki/File:2018_barrio_Villa_Turbay_de_la_Comuna_8_de_Medell%C3%ADn_a_ala_altura_de_la_estaci%C3%B3n_Villa_Sierra_del_Metrocable.jpg) | Felipe Restrepo Acosta | CC BY-SA 4.0 |
| [Barrio Santo Domingo Savio.JPG](https://commons.wikimedia.org/wiki/File:Barrio_Santo_Domingo_Savio.JPG) | Albeiror24 | Public domain |

**El Poblado y Laureles**

| Archivo | Autor | Licencia |
|---|---|---|
| [El Poblado neighborhood.jpg](https://commons.wikimedia.org/wiki/File:El_Poblado_neighborhood.jpg) | User: (WT-shared) CONOCER at wts wikivoyage | Public domain |
| [El poblado ladrllo.jpg](https://commons.wikimedia.org/wiki/File:El_poblado_ladrllo.jpg) | Xemenendura | CC BY-SA 4.0 |
| [El Poblado. From San Fernando Plaza rooftop.jpg](https://commons.wikimedia.org/wiki/File:El_Poblado._From_San_Fernando_Plaza_rooftop.jpg) | User: (WT-shared) CONOCER at wts wikivoyage | Public domain |
| [Laureles - Estadio, Medellín, Antioquia, Colombia - panoramio (1).jpg](https://commons.wikimedia.org/wiki/File:Laureles_-_Estadio,_Medell%C3%ADn,_Antioquia,_Colombia_-_panoramio_(1).jpg) | Zack Knowles | CC BY-SA 3.0 |

**Universidades**

| Archivo | Autor | Licencia |
|---|---|---|
| [Edificio de la Biblioteca Central de la Universidad de Antioquia. Panorámica.JPG](https://commons.wikimedia.org/wiki/File:Edificio_de_la_Biblioteca_Central_de_la_Universidad_de_Antioquia._Panor%C3%A1mica.JPG) | Kamilokardona | CC BY-SA 3.0 |
| [Facultad de Minas de la Universidad Nacional.jpg](https://commons.wikimedia.org/wiki/File:Facultad_de_Minas_de_la_Universidad_Nacional.jpg) | SoilRos | CC BY-SA 3.0 |
| [Eafit University Medellín, Colombia.jpg](https://commons.wikimedia.org/wiki/File:Eafit_University_Medell%C3%ADn,_Colombia.jpg) | Joseeem | CC0 |
| [Biblioteca Central UPB.jpg](https://commons.wikimedia.org/wiki/File:Biblioteca_Central_UPB.jpg) | (...)freemultimedia | CC BY-SA 4.0 |


## Pendiente
- **Pisos oficiales para todo Medellín:** la capa abierta del Catastro trae los pisos solo de Popular, El Poblado y Robledo; en el resto son estimados.
- **Formas con nombre propio:** el Orquideorama del Jardín Botánico no está en OpenStreetMap, y la torre de la Plaza de la Libertad se dibuja como edificio genérico de 24 pisos, sin su celosía dorada.
- **Colores de techo por edificio:** OpenStreetMap trae `roof:colour` en muy pocos edificios (13 en todo el valle). Por eso el color sale de la zona, no del edificio.
