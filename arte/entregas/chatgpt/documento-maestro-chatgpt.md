# EL METRO — DOCUMENTO MAESTRO TOTAL

**Edición documental:** 17 de noviembre de 2026 · **Arte:** A2-1.0 · **Juego de referencia:** v0.5.0

> Entrega documental integral del trabajo del Artista 2 (ChatGPT). No es una actualización del videojuego publicado. El documento fuente se conserva íntegramente en el Anexo A. Los archivos gráficos reales se incluyen en el ZIP maestro, bajo `ARTE/`.

## Lectura rápida

- **PDF maestro:** lectura visual, galerías de PNG y texto del documento original en páginas consecutivas; incluye adjuntos descargables desde visores compatibles.
- **Este Markdown:** texto técnico íntegro, inventario exhaustivo de recursos, referencias relativas a los PNG y código fuente SVG, Python y JSON integrado al final.
- **ZIP maestro:** entrega portable con todos los PNG/SVG, hojas, borradores identificados, scripts, manifiestos, HTML anterior, PDF y MD; no reemplaza el repositorio GitHub del juego.

## 1. Misión, visión y límites de la entrega

**Misión del juego (fuente original):** que niños, familias, habitantes y visitantes conozcan Medellín y la red de transporte jugando, mediante Cultura Metro, recorridos, conducción, personajes e identidad local.

**Visión:** un mundo abierto + arcade sobre el Valle de Aburrá, fiel al relieve, río, estaciones y barrios, apto para dispositivos modestos, sin internet y con posibilidad de juego en red local.

**Alcance de esta entrega:** únicamente encargos C- del Artista 2; no incluye la ejecución de encargos G- (Gemini), la integración en `src/` ni la aprobación del director del proyecto.

## 2. Control del proyecto y estado comprobado

| Dato | Estado |
|---|---|
| Juego base | v0.5.0, según documento original |
| Paquete de arte | A2-1.0, no es versión nueva del juego |
| Familias C- producidas | 13 |
| Recursos individuales inventariados | 124 |
| PNG en el directorio de entrega | 194, incluidos atlas, previsualizaciones e históricos |
| SVG editables | 92; no cubren necesariamente todos los PNG |
| Scripts Python preservados | 8 |
| Documento base preservado | 9,914 líneas · SHA-256 `aace95bdbb653886d73c9cf3c9dbc2aa0f802580c152df9bf1ee91528ed3dee5` |
| Batería QA previa | Reporte de 473 comprobaciones sin errores en `qa_final.json`; no demuestra que el juego haya sido probado |
| Validación de esta entrega | Archivos PNG legibles y SVG XML válido; ZIP comprobado; PDF inspeccionado |
| Integración en PWA, APK o repositorio | Pendiente; no se han modificado |

## 3. Dirección artística y convenciones

Concepto del proyecto: **“Medellín de verdad, dibujada con cariño”**. Lenguaje: ilustración funcional y minimalista para la interfaz, y pixel art claro para sprites y escenarios. Legibilidad en tamaños pequeños, personajes reconocibles, clima local y coherencia cromática; sin imitar mecánicamente arte de otros videojuegos.

- **Interfaz:** papel `#f1ece0`, crema `#faf6ec`, tinta `#154a80`, contornos `#141414`.
- **Identidad de líneas:** A `#1C5C9C`; B `#E38835`; T `#59AB42`; K `#B8CF40`; J `#F6C538`; H `#EB318E`; L `#8E612A`; M `#743D90`; P `#EC343A`; Metroplús 1 `#0E6F76`; Metroplús 2 `#65A9AC`.
- **Luz:** arriba a la izquierda; **no dibujar sombra proyectada**, porque la calcula el juego.
- **Fondo:** transparencia RGBA, o `#FF00FF` cuando se necesita chroma key, particularmente en parabrisas de cabina.
- **Iconos:** formas simples con contorno oscuro, máximo dos acentos más negro, sin texto, sin marcas comerciales.
- **Vehículos:** vista cenital a la derecha, escala nominal 8 píxeles por metro; usar sprites nativos, no las previsualizaciones ampliadas.
- **Prohibiciones del proyecto:** logos/marcas sin autorización, texto o números no solicitados, marcas de agua, violencia, estereotipos de narcotráfico, texturas fotográficas como solución genérica.

## 4. Inventario de encargos C-

| ID | Encargo | Recursos individuales | Integración |
|---|---|---:|---|
| C-01 | Vehículos del sistema | 14 | Pendiente de integración/aprobación |
| C-02 | Vehículos urbanos | 13 | Pendiente de integración/aprobación |
| C-03 | Estados de puertas | 3 | Pendiente de integración/aprobación |
| C-10 | Íconos de modos | 9 | Pendiente de integración/aprobación |
| C-11 | Íconos de acciones | 12 | Pendiente de integración/aprobación |
| C-12 | Insignias de logros | 20 | Pendiente de integración/aprobación |
| C-20 | Consola de metro | 2 | Pendiente de integración/aprobación |
| C-21 | Cabina de bus | 1 | Pendiente de integración/aprobación |
| C-30 | Señalética | 16 | Pendiente de integración/aprobación |
| C-40 | Portada | 2 | Pendiente de integración/aprobación |
| C-41 | Pantalla de carga | 1 | Pendiente de integración/aprobación |
| C-50 | Fiestas | 21 | Pendiente de integración/aprobación |
| C-60 | Texturas | 10 | Pendiente de integración/aprobación |

## 5. Catálogo íntegro de recursos individuales

Estas rutas corresponden al ZIP, en la carpeta `ARTE/`. Las imágenes aparecerán al abrir este `.md` desde la raíz del ZIP en un visor Markdown con soporte para rutas relativas.

### C-01 · Vehículos del sistema

| Recurso | Resolución | Archivo | Vista |
|---|---|---|---|
| Vehículos del sistema | 96 × 20 | [`ARTE/vehiculos/alimentador.png`](ARTE/vehiculos/alimentador.png) | ![Vehículos del sistema](ARTE/vehiculos/alimentador.png) |
| Vehículos del sistema | 64 × 20 | [`ARTE/vehiculos/buseta.png`](ARTE/vehiculos/buseta.png) | ![Vehículos del sistema](ARTE/vehiculos/buseta.png) |
| Vehículos del sistema | 64 × 20 | [`ARTE/vehiculos/chiva.png`](ARTE/vehiculos/chiva.png) | ![Vehículos del sistema](ARTE/vehiculos/chiva.png) |
| Vehículos del sistema | 176 × 24 | [`ARTE/vehiculos/metro_coche_cabina_delantera.png`](ARTE/vehiculos/metro_coche_cabina_delantera.png) | ![Vehículos del sistema](ARTE/vehiculos/metro_coche_cabina_delantera.png) |
| Vehículos del sistema | 176 × 24 | [`ARTE/vehiculos/metro_coche_cabina_trasera.png`](ARTE/vehiculos/metro_coche_cabina_trasera.png) | ![Vehículos del sistema](ARTE/vehiculos/metro_coche_cabina_trasera.png) |
| Vehículos del sistema | 176 × 24 | [`ARTE/vehiculos/metro_coche_intermedio.png`](ARTE/vehiculos/metro_coche_intermedio.png) | ![Vehículos del sistema](ARTE/vehiculos/metro_coche_intermedio.png) |
| Vehículos del sistema | 24 × 24 | [`ARTE/vehiculos/metrocable_cabina_h.png`](ARTE/vehiculos/metrocable_cabina_h.png) | ![Vehículos del sistema](ARTE/vehiculos/metrocable_cabina_h.png) |
| Vehículos del sistema | 24 × 24 | [`ARTE/vehiculos/metrocable_cabina_j.png`](ARTE/vehiculos/metrocable_cabina_j.png) | ![Vehículos del sistema](ARTE/vehiculos/metrocable_cabina_j.png) |
| Vehículos del sistema | 24 × 24 | [`ARTE/vehiculos/metrocable_cabina_k.png`](ARTE/vehiculos/metrocable_cabina_k.png) | ![Vehículos del sistema](ARTE/vehiculos/metrocable_cabina_k.png) |
| Vehículos del sistema | 24 × 24 | [`ARTE/vehiculos/metrocable_cabina_l.png`](ARTE/vehiculos/metrocable_cabina_l.png) | ![Vehículos del sistema](ARTE/vehiculos/metrocable_cabina_l.png) |
| Vehículos del sistema | 24 × 24 | [`ARTE/vehiculos/metrocable_cabina_m.png`](ARTE/vehiculos/metrocable_cabina_m.png) | ![Vehículos del sistema](ARTE/vehiculos/metrocable_cabina_m.png) |
| Vehículos del sistema | 24 × 24 | [`ARTE/vehiculos/metrocable_cabina_p.png`](ARTE/vehiculos/metrocable_cabina_p.png) | ![Vehículos del sistema](ARTE/vehiculos/metrocable_cabina_p.png) |
| Vehículos del sistema | 144 × 20 | [`ARTE/vehiculos/metroplus_articulado.png`](ARTE/vehiculos/metroplus_articulado.png) | ![Vehículos del sistema](ARTE/vehiculos/metroplus_articulado.png) |
| Vehículos del sistema | 160 × 24 | [`ARTE/vehiculos/tranvia_3_modulos.png`](ARTE/vehiculos/tranvia_3_modulos.png) | ![Vehículos del sistema](ARTE/vehiculos/tranvia_3_modulos.png) |

### C-02 · Vehículos urbanos

| Recurso | Resolución | Archivo | Vista |
|---|---|---|---|
| Vehículos de la calle | 48 × 18 | [`ARTE/vehiculos/ambulancia.png`](ARTE/vehiculos/ambulancia.png) | ![Vehículos de la calle](ARTE/vehiculos/ambulancia.png) |
| Vehículos de la calle | 14 × 6 | [`ARTE/vehiculos/bici.png`](ARTE/vehiculos/bici.png) | ![Vehículos de la calle](ARTE/vehiculos/bici.png) |
| Vehículos de la calle | 52 × 20 | [`ARTE/vehiculos/camion.png`](ARTE/vehiculos/camion.png) | ![Vehículos de la calle](ARTE/vehiculos/camion.png) |
| Vehículos de la calle | 42 × 18 | [`ARTE/vehiculos/camioneta.png`](ARTE/vehiculos/camioneta.png) | ![Vehículos de la calle](ARTE/vehiculos/camioneta.png) |
| Vehículos de la calle | 24 × 16 | [`ARTE/vehiculos/carrito.png`](ARTE/vehiculos/carrito.png) | ![Vehículos de la calle](ARTE/vehiculos/carrito.png) |
| Vehículos de la calle | 36 × 16 | [`ARTE/vehiculos/carro_azul.png`](ARTE/vehiculos/carro_azul.png) | ![Vehículos de la calle](ARTE/vehiculos/carro_azul.png) |
| Vehículos de la calle | 36 × 16 | [`ARTE/vehiculos/carro_blanco.png`](ARTE/vehiculos/carro_blanco.png) | ![Vehículos de la calle](ARTE/vehiculos/carro_blanco.png) |
| Vehículos de la calle | 36 × 16 | [`ARTE/vehiculos/carro_gris.png`](ARTE/vehiculos/carro_gris.png) | ![Vehículos de la calle](ARTE/vehiculos/carro_gris.png) |
| Vehículos de la calle | 36 × 16 | [`ARTE/vehiculos/carro_negro.png`](ARTE/vehiculos/carro_negro.png) | ![Vehículos de la calle](ARTE/vehiculos/carro_negro.png) |
| Vehículos de la calle | 36 × 16 | [`ARTE/vehiculos/carro_rojo.png`](ARTE/vehiculos/carro_rojo.png) | ![Vehículos de la calle](ARTE/vehiculos/carro_rojo.png) |
| Vehículos de la calle | 36 × 16 | [`ARTE/vehiculos/carro_verde.png`](ARTE/vehiculos/carro_verde.png) | ![Vehículos de la calle](ARTE/vehiculos/carro_verde.png) |
| Vehículos de la calle | 16 × 8 | [`ARTE/vehiculos/moto.png`](ARTE/vehiculos/moto.png) | ![Vehículos de la calle](ARTE/vehiculos/moto.png) |
| Vehículos de la calle | 36 × 16 | [`ARTE/vehiculos/taxi.png`](ARTE/vehiculos/taxi.png) | ![Vehículos de la calle](ARTE/vehiculos/taxi.png) |

### C-03 · Estados de puertas

| Recurso | Resolución | Archivo | Vista |
|---|---|---|---|
| Puertas de autobús | 144 × 20 | [`ARTE/vehiculos/bus_puertas_izquierda_abiertas.png`](ARTE/vehiculos/bus_puertas_izquierda_abiertas.png) | ![Puertas de autobús](ARTE/vehiculos/bus_puertas_izquierda_abiertas.png) |
| Puertas de autobús | 144 × 20 | [`ARTE/vehiculos/bus_puertas_izquierda_cerradas.png`](ARTE/vehiculos/bus_puertas_izquierda_cerradas.png) | ![Puertas de autobús](ARTE/vehiculos/bus_puertas_izquierda_cerradas.png) |
| Puertas de autobús | 144 × 20 | [`ARTE/vehiculos/bus_puertas_izquierda_entreabiertas.png`](ARTE/vehiculos/bus_puertas_izquierda_entreabiertas.png) | ![Puertas de autobús](ARTE/vehiculos/bus_puertas_izquierda_entreabiertas.png) |

### C-10 · Íconos de modos

| Recurso | Resolución | Archivo | Vista |
|---|---|---|---|
| Iconos de modos | 128 × 128 | [`ARTE/iconos/c10_modos/01_ciudad_libre.png`](ARTE/iconos/c10_modos/01_ciudad_libre.png) | ![Iconos de modos](ARTE/iconos/c10_modos/01_ciudad_libre.png) |
| Iconos de modos | 128 × 128 | [`ARTE/iconos/c10_modos/02_bus.png`](ARTE/iconos/c10_modos/02_bus.png) | ![Iconos de modos](ARTE/iconos/c10_modos/02_bus.png) |
| Iconos de modos | 128 × 128 | [`ARTE/iconos/c10_modos/03_metro.png`](ARTE/iconos/c10_modos/03_metro.png) | ![Iconos de modos](ARTE/iconos/c10_modos/03_metro.png) |
| Iconos de modos | 128 × 128 | [`ARTE/iconos/c10_modos/04_metrocable.png`](ARTE/iconos/c10_modos/04_metrocable.png) | ![Iconos de modos](ARTE/iconos/c10_modos/04_metrocable.png) |
| Iconos de modos | 128 × 128 | [`ARTE/iconos/c10_modos/05_historia.png`](ARTE/iconos/c10_modos/05_historia.png) | ![Iconos de modos](ARTE/iconos/c10_modos/05_historia.png) |
| Iconos de modos | 128 × 128 | [`ARTE/iconos/c10_modos/06_guia.png`](ARTE/iconos/c10_modos/06_guia.png) | ![Iconos de modos](ARTE/iconos/c10_modos/06_guia.png) |
| Iconos de modos | 128 × 128 | [`ARTE/iconos/c10_modos/07_red.png`](ARTE/iconos/c10_modos/07_red.png) | ![Iconos de modos](ARTE/iconos/c10_modos/07_red.png) |
| Iconos de modos | 128 × 128 | [`ARTE/iconos/c10_modos/08_juntos.png`](ARTE/iconos/c10_modos/08_juntos.png) | ![Iconos de modos](ARTE/iconos/c10_modos/08_juntos.png) |
| Iconos de modos | 128 × 128 | [`ARTE/iconos/c10_modos/09_arcade.png`](ARTE/iconos/c10_modos/09_arcade.png) | ![Iconos de modos](ARTE/iconos/c10_modos/09_arcade.png) |

### C-11 · Íconos de acciones

| Recurso | Resolución | Archivo | Vista |
|---|---|---|---|
| Iconos de acciones | 128 × 128 | [`ARTE/iconos/c11_acciones/01_llave.png`](ARTE/iconos/c11_acciones/01_llave.png) | ![Iconos de acciones](ARTE/iconos/c11_acciones/01_llave.png) |
| Iconos de acciones | 128 × 128 | [`ARTE/iconos/c11_acciones/02_sentido.png`](ARTE/iconos/c11_acciones/02_sentido.png) | ![Iconos de acciones](ARTE/iconos/c11_acciones/02_sentido.png) |
| Iconos de acciones | 128 × 128 | [`ARTE/iconos/c11_acciones/03_vigilante.png`](ARTE/iconos/c11_acciones/03_vigilante.png) | ![Iconos de acciones](ARTE/iconos/c11_acciones/03_vigilante.png) |
| Iconos de acciones | 128 × 128 | [`ARTE/iconos/c11_acciones/04_megafono.png`](ARTE/iconos/c11_acciones/04_megafono.png) | ![Iconos de acciones](ARTE/iconos/c11_acciones/04_megafono.png) |
| Iconos de acciones | 128 × 128 | [`ARTE/iconos/c11_acciones/05_puerta_izquierda.png`](ARTE/iconos/c11_acciones/05_puerta_izquierda.png) | ![Iconos de acciones](ARTE/iconos/c11_acciones/05_puerta_izquierda.png) |
| Iconos de acciones | 128 × 128 | [`ARTE/iconos/c11_acciones/06_puerta_derecha.png`](ARTE/iconos/c11_acciones/06_puerta_derecha.png) | ![Iconos de acciones](ARTE/iconos/c11_acciones/06_puerta_derecha.png) |
| Iconos de acciones | 128 × 128 | [`ARTE/iconos/c11_acciones/07_pito.png`](ARTE/iconos/c11_acciones/07_pito.png) | ![Iconos de acciones](ARTE/iconos/c11_acciones/07_pito.png) |
| Iconos de acciones | 128 × 128 | [`ARTE/iconos/c11_acciones/08_foto.png`](ARTE/iconos/c11_acciones/08_foto.png) | ![Iconos de acciones](ARTE/iconos/c11_acciones/08_foto.png) |
| Iconos de acciones | 128 × 128 | [`ARTE/iconos/c11_acciones/09_lupa.png`](ARTE/iconos/c11_acciones/09_lupa.png) | ![Iconos de acciones](ARTE/iconos/c11_acciones/09_lupa.png) |
| Iconos de acciones | 128 × 128 | [`ARTE/iconos/c11_acciones/10_correr.png`](ARTE/iconos/c11_acciones/10_correr.png) | ![Iconos de acciones](ARTE/iconos/c11_acciones/10_correr.png) |
| Iconos de acciones | 128 × 128 | [`ARTE/iconos/c11_acciones/11_adelantar.png`](ARTE/iconos/c11_acciones/11_adelantar.png) | ![Iconos de acciones](ARTE/iconos/c11_acciones/11_adelantar.png) |
| Iconos de acciones | 128 × 128 | [`ARTE/iconos/c11_acciones/12_tarjeta.png`](ARTE/iconos/c11_acciones/12_tarjeta.png) | ![Iconos de acciones](ARTE/iconos/c11_acciones/12_tarjeta.png) |

### C-12 · Insignias de logros

| Recurso | Resolución | Archivo | Vista |
|---|---|---|---|
| Insignias de logros | 128 × 128 | [`ARTE/iconos/c12_logros/01_primer_viaje.png`](ARTE/iconos/c12_logros/01_primer_viaje.png) | ![Insignias de logros](ARTE/iconos/c12_logros/01_primer_viaje.png) |
| Insignias de logros | 128 × 128 | [`ARTE/iconos/c12_logros/02_frenada_precisa.png`](ARTE/iconos/c12_logros/02_frenada_precisa.png) | ![Insignias de logros](ARTE/iconos/c12_logros/02_frenada_precisa.png) |
| Insignias de logros | 128 × 128 | [`ARTE/iconos/c12_logros/03_mano_firme.png`](ARTE/iconos/c12_logros/03_mano_firme.png) | ![Insignias de logros](ARTE/iconos/c12_logros/03_mano_firme.png) |
| Insignias de logros | 128 × 128 | [`ARTE/iconos/c12_logros/04_punta_a_punta.png`](ARTE/iconos/c12_logros/04_punta_a_punta.png) | ![Insignias de logros](ARTE/iconos/c12_logros/04_punta_a_punta.png) |
| Insignias de logros | 128 × 128 | [`ARTE/iconos/c12_logros/05_control.png`](ARTE/iconos/c12_logros/05_control.png) | ![Insignias de logros](ARTE/iconos/c12_logros/05_control.png) |
| Insignias de logros | 128 × 128 | [`ARTE/iconos/c12_logros/06_carril.png`](ARTE/iconos/c12_logros/06_carril.png) | ![Insignias de logros](ARTE/iconos/c12_logros/06_carril.png) |
| Insignias de logros | 128 × 128 | [`ARTE/iconos/c12_logros/07_ciudad_colgante.png`](ARTE/iconos/c12_logros/07_ciudad_colgante.png) | ![Insignias de logros](ARTE/iconos/c12_logros/07_ciudad_colgante.png) |
| Insignias de logros | 128 × 128 | [`ARTE/iconos/c12_logros/08_diez_de_diez.png`](ARTE/iconos/c12_logros/08_diez_de_diez.png) | ![Insignias de logros](ARTE/iconos/c12_logros/08_diez_de_diez.png) |
| Insignias de logros | 128 × 128 | [`ARTE/iconos/c12_logros/09_gerente.png`](ARTE/iconos/c12_logros/09_gerente.png) | ![Insignias de logros](ARTE/iconos/c12_logros/09_gerente.png) |
| Insignias de logros | 128 × 128 | [`ARTE/iconos/c12_logros/10_ultima_vuelta.png`](ARTE/iconos/c12_logros/10_ultima_vuelta.png) | ![Insignias de logros](ARTE/iconos/c12_logros/10_ultima_vuelta.png) |
| Insignias de logros | 128 × 128 | [`ARTE/iconos/c12_logros/11_enciclopedia.png`](ARTE/iconos/c12_logros/11_enciclopedia.png) | ![Insignias de logros](ARTE/iconos/c12_logros/11_enciclopedia.png) |
| Insignias de logros | 128 × 128 | [`ARTE/iconos/c12_logros/12_turno_noche.png`](ARTE/iconos/c12_logros/12_turno_noche.png) | ![Insignias de logros](ARTE/iconos/c12_logros/12_turno_noche.png) |
| Insignias de logros | 128 × 128 | [`ARTE/iconos/c12_logros/13_madrugada.png`](ARTE/iconos/c12_logros/13_madrugada.png) | ![Insignias de logros](ARTE/iconos/c12_logros/13_madrugada.png) |
| Insignias de logros | 128 × 128 | [`ARTE/iconos/c12_logros/14_duelo.png`](ARTE/iconos/c12_logros/14_duelo.png) | ![Insignias de logros](ARTE/iconos/c12_logros/14_duelo.png) |
| Insignias de logros | 128 × 128 | [`ARTE/iconos/c12_logros/15_en_red.png`](ARTE/iconos/c12_logros/15_en_red.png) | ![Insignias de logros](ARTE/iconos/c12_logros/15_en_red.png) |
| Insignias de logros | 128 × 128 | [`ARTE/iconos/c12_logros/16_costumbre.png`](ARTE/iconos/c12_logros/16_costumbre.png) | ![Insignias de logros](ARTE/iconos/c12_logros/16_costumbre.png) |
| Insignias de logros | 128 × 128 | [`ARTE/iconos/c12_logros/17_bolsillo_lleno.png`](ARTE/iconos/c12_logros/17_bolsillo_lleno.png) | ![Insignias de logros](ARTE/iconos/c12_logros/17_bolsillo_lleno.png) |
| Insignias de logros | 128 × 128 | [`ARTE/iconos/c12_logros/18_ni_una_gota.png`](ARTE/iconos/c12_logros/18_ni_una_gota.png) | ![Insignias de logros](ARTE/iconos/c12_logros/18_ni_una_gota.png) |
| Insignias de logros | 128 × 128 | [`ARTE/iconos/c12_logros/19_feria_flores.png`](ARTE/iconos/c12_logros/19_feria_flores.png) | ![Insignias de logros](ARTE/iconos/c12_logros/19_feria_flores.png) |
| Insignias de logros | 128 × 128 | [`ARTE/iconos/c12_logros/20_alumbrados.png`](ARTE/iconos/c12_logros/20_alumbrados.png) | ![Insignias de logros](ARTE/iconos/c12_logros/20_alumbrados.png) |

### C-20 · Consola de metro

| Recurso | Resolución | Archivo | Vista |
|---|---|---|---|
| Consola del Metro | 1536 × 1024 | [`ARTE/cabinas/cab_consola_horizontal.png`](ARTE/cabinas/cab_consola_horizontal.png) | ![Consola del Metro](ARTE/cabinas/cab_consola_horizontal.png) |
| Consola del Metro | 1024 × 1536 | [`ARTE/cabinas/cab_consola_vertical.png`](ARTE/cabinas/cab_consola_vertical.png) | ![Consola del Metro](ARTE/cabinas/cab_consola_vertical.png) |

### C-21 · Cabina de bus

| Recurso | Resolución | Archivo | Vista |
|---|---|---|---|
| Tablero de autobús | 1536 × 1024 | [`ARTE/cabinas/cab_bus.png`](ARTE/cabinas/cab_bus.png) | ![Tablero de autobús](ARTE/cabinas/cab_bus.png) |

### C-30 · Señalética

| Recurso | Resolución | Archivo | Vista |
|---|---|---|---|
| Señalética | 128 × 128 | [`ARTE/senalizacion/flecha_derecha.png`](ARTE/senalizacion/flecha_derecha.png) | ![Señalética](ARTE/senalizacion/flecha_derecha.png) |
| Señalética | 128 × 128 | [`ARTE/senalizacion/flecha_izquierda.png`](ARTE/senalizacion/flecha_izquierda.png) | ![Señalética](ARTE/senalizacion/flecha_izquierda.png) |
| Señalética | 128 × 128 | [`ARTE/senalizacion/linea_amarilla.png`](ARTE/senalizacion/linea_amarilla.png) | ![Señalética](ARTE/senalizacion/linea_amarilla.png) |
| Señalética | 128 × 128 | [`ARTE/senalizacion/panel_led.png`](ARTE/senalizacion/panel_led.png) | ![Señalética](ARTE/senalizacion/panel_led.png) |
| Señalética | 128 × 128 | [`ARTE/senalizacion/placa_a.png`](ARTE/senalizacion/placa_a.png) | ![Señalética](ARTE/senalizacion/placa_a.png) |
| Señalética | 128 × 128 | [`ARTE/senalizacion/placa_b.png`](ARTE/senalizacion/placa_b.png) | ![Señalética](ARTE/senalizacion/placa_b.png) |
| Señalética | 128 × 128 | [`ARTE/senalizacion/placa_h.png`](ARTE/senalizacion/placa_h.png) | ![Señalética](ARTE/senalizacion/placa_h.png) |
| Señalética | 128 × 128 | [`ARTE/senalizacion/placa_j.png`](ARTE/senalizacion/placa_j.png) | ![Señalética](ARTE/senalizacion/placa_j.png) |
| Señalética | 128 × 128 | [`ARTE/senalizacion/placa_k.png`](ARTE/senalizacion/placa_k.png) | ![Señalética](ARTE/senalizacion/placa_k.png) |
| Señalética | 128 × 128 | [`ARTE/senalizacion/placa_l.png`](ARTE/senalizacion/placa_l.png) | ![Señalética](ARTE/senalizacion/placa_l.png) |
| Señalética | 128 × 128 | [`ARTE/senalizacion/placa_m.png`](ARTE/senalizacion/placa_m.png) | ![Señalética](ARTE/senalizacion/placa_m.png) |
| Señalética | 128 × 128 | [`ARTE/senalizacion/placa_metroplus1.png`](ARTE/senalizacion/placa_metroplus1.png) | ![Señalética](ARTE/senalizacion/placa_metroplus1.png) |
| Señalética | 128 × 128 | [`ARTE/senalizacion/placa_metroplus2.png`](ARTE/senalizacion/placa_metroplus2.png) | ![Señalética](ARTE/senalizacion/placa_metroplus2.png) |
| Señalética | 128 × 128 | [`ARTE/senalizacion/placa_p.png`](ARTE/senalizacion/placa_p.png) | ![Señalética](ARTE/senalizacion/placa_p.png) |
| Señalética | 128 × 128 | [`ARTE/senalizacion/placa_t.png`](ARTE/senalizacion/placa_t.png) | ![Señalética](ARTE/senalizacion/placa_t.png) |
| Señalética | 128 × 128 | [`ARTE/senalizacion/torniquete.png`](ARTE/senalizacion/torniquete.png) | ![Señalética](ARTE/senalizacion/torniquete.png) |

### C-40 · Portada

| Recurso | Resolución | Archivo | Vista |
|---|---|---|---|
| Portada y compartir | 1536 × 1024 | [`ARTE/portadas/clave_compartir.png`](ARTE/portadas/clave_compartir.png) | ![Portada y compartir](ARTE/portadas/clave_compartir.png) |
| Portada y compartir | 1536 × 1024 | [`ARTE/portadas/clave_portada.png`](ARTE/portadas/clave_portada.png) | ![Portada y compartir](ARTE/portadas/clave_portada.png) |

### C-41 · Pantalla de carga

| Recurso | Resolución | Archivo | Vista |
|---|---|---|---|
| Pantalla de carga | 1024 × 1536 | [`ARTE/portadas/clave_carga.png`](ARTE/portadas/clave_carga.png) | ![Pantalla de carga](ARTE/portadas/clave_carga.png) |

### C-50 · Fiestas

| Recurso | Resolución | Archivo | Vista |
|---|---|---|---|
| Decoraciones festivas | 128 × 128 | [`ARTE/fiestas/banderines_feria.png`](ARTE/fiestas/banderines_feria.png) | ![Decoraciones festivas](ARTE/fiestas/banderines_feria.png) |
| Decoraciones festivas | 128 × 128 | [`ARTE/fiestas/farol_amarillo.png`](ARTE/fiestas/farol_amarillo.png) | ![Decoraciones festivas](ARTE/fiestas/farol_amarillo.png) |
| Decoraciones festivas | 128 × 128 | [`ARTE/fiestas/farol_rojo.png`](ARTE/fiestas/farol_rojo.png) | ![Decoraciones festivas](ARTE/fiestas/farol_rojo.png) |
| Decoraciones festivas | 128 × 128 | [`ARTE/fiestas/farol_verde.png`](ARTE/fiestas/farol_verde.png) | ![Decoraciones festivas](ARTE/fiestas/farol_verde.png) |
| Decoraciones festivas | 128 × 128 | [`ARTE/fiestas/figura_luz_guirnalda.png`](ARTE/fiestas/figura_luz_guirnalda.png) | ![Decoraciones festivas](ARTE/fiestas/figura_luz_guirnalda.png) |
| Decoraciones festivas | 128 × 128 | [`ARTE/fiestas/guirnalda_curva.png`](ARTE/fiestas/guirnalda_curva.png) | ![Decoraciones festivas](ARTE/fiestas/guirnalda_curva.png) |
| Decoraciones festivas | 128 × 128 | [`ARTE/fiestas/guirnalda_recta.png`](ARTE/fiestas/guirnalda_recta.png) | ![Decoraciones festivas](ARTE/fiestas/guirnalda_recta.png) |
| Decoraciones festivas | 128 × 128 | [`ARTE/fiestas/luz_estrella.png`](ARTE/fiestas/luz_estrella.png) | ![Decoraciones festivas](ARTE/fiestas/luz_estrella.png) |
| Decoraciones festivas | 128 × 128 | [`ARTE/fiestas/luz_flor.png`](ARTE/fiestas/luz_flor.png) | ![Decoraciones festivas](ARTE/fiestas/luz_flor.png) |
| Decoraciones festivas | 128 × 128 | [`ARTE/fiestas/luz_pesebre_sencillo.png`](ARTE/fiestas/luz_pesebre_sencillo.png) | ![Decoraciones festivas](ARTE/fiestas/luz_pesebre_sencillo.png) |
| Decoraciones festivas | 128 × 128 | [`ARTE/fiestas/petalo_01.png`](ARTE/fiestas/petalo_01.png) | ![Decoraciones festivas](ARTE/fiestas/petalo_01.png) |
| Decoraciones festivas | 128 × 128 | [`ARTE/fiestas/petalo_02.png`](ARTE/fiestas/petalo_02.png) | ![Decoraciones festivas](ARTE/fiestas/petalo_02.png) |
| Decoraciones festivas | 128 × 128 | [`ARTE/fiestas/petalo_03.png`](ARTE/fiestas/petalo_03.png) | ![Decoraciones festivas](ARTE/fiestas/petalo_03.png) |
| Decoraciones festivas | 128 × 128 | [`ARTE/fiestas/petalo_04.png`](ARTE/fiestas/petalo_04.png) | ![Decoraciones festivas](ARTE/fiestas/petalo_04.png) |
| Decoraciones festivas | 128 × 128 | [`ARTE/fiestas/petalo_05.png`](ARTE/fiestas/petalo_05.png) | ![Decoraciones festivas](ARTE/fiestas/petalo_05.png) |
| Decoraciones festivas | 128 × 128 | [`ARTE/fiestas/petalo_06.png`](ARTE/fiestas/petalo_06.png) | ![Decoraciones festivas](ARTE/fiestas/petalo_06.png) |
| Decoraciones festivas | 128 × 128 | [`ARTE/fiestas/petalo_07.png`](ARTE/fiestas/petalo_07.png) | ![Decoraciones festivas](ARTE/fiestas/petalo_07.png) |
| Decoraciones festivas | 128 × 128 | [`ARTE/fiestas/petalo_08.png`](ARTE/fiestas/petalo_08.png) | ![Decoraciones festivas](ARTE/fiestas/petalo_08.png) |
| Decoraciones festivas | 128 × 128 | [`ARTE/fiestas/ramillete_flores.png`](ARTE/fiestas/ramillete_flores.png) | ![Decoraciones festivas](ARTE/fiestas/ramillete_flores.png) |
| Decoraciones festivas | 128 × 128 | [`ARTE/fiestas/silleta_cenital.png`](ARTE/fiestas/silleta_cenital.png) | ![Decoraciones festivas](ARTE/fiestas/silleta_cenital.png) |
| Decoraciones festivas | 128 × 128 | [`ARTE/fiestas/velita.png`](ARTE/fiestas/velita.png) | ![Decoraciones festivas](ARTE/fiestas/velita.png) |

### C-60 · Texturas

| Recurso | Resolución | Archivo | Vista |
|---|---|---|---|
| Texturas repetibles | 1024 × 1024 | [`ARTE/texturas/tex_adoquin.png`](ARTE/texturas/tex_adoquin.png) | ![Texturas repetibles](ARTE/texturas/tex_adoquin.png) |
| Texturas repetibles | 1024 × 1024 | [`ARTE/texturas/tex_anden.png`](ARTE/texturas/tex_anden.png) | ![Texturas repetibles](ARTE/texturas/tex_anden.png) |
| Texturas repetibles | 1024 × 1024 | [`ARTE/texturas/tex_asfalto.png`](ARTE/texturas/tex_asfalto.png) | ![Texturas repetibles](ARTE/texturas/tex_asfalto.png) |
| Texturas repetibles | 1024 × 1024 | [`ARTE/texturas/tex_balasto.png`](ARTE/texturas/tex_balasto.png) | ![Texturas repetibles](ARTE/texturas/tex_balasto.png) |
| Texturas repetibles | 1024 × 1024 | [`ARTE/texturas/tex_concreto.png`](ARTE/texturas/tex_concreto.png) | ![Texturas repetibles](ARTE/texturas/tex_concreto.png) |
| Texturas repetibles | 1024 × 1024 | [`ARTE/texturas/tex_eternit.png`](ARTE/texturas/tex_eternit.png) | ![Texturas repetibles](ARTE/texturas/tex_eternit.png) |
| Texturas repetibles | 1024 × 1024 | [`ARTE/texturas/tex_ladrillo.png`](ARTE/texturas/tex_ladrillo.png) | ![Texturas repetibles](ARTE/texturas/tex_ladrillo.png) |
| Texturas repetibles | 1024 × 1024 | [`ARTE/texturas/tex_pasto.png`](ARTE/texturas/tex_pasto.png) | ![Texturas repetibles](ARTE/texturas/tex_pasto.png) |
| Texturas repetibles | 1024 × 1024 | [`ARTE/texturas/tex_rio.png`](ARTE/texturas/tex_rio.png) | ![Texturas repetibles](ARTE/texturas/tex_rio.png) |
| Texturas repetibles | 1024 × 1024 | [`ARTE/texturas/tex_teja.png`](ARTE/texturas/tex_teja.png) | ![Texturas repetibles](ARTE/texturas/tex_teja.png) |

## 6. Entregas, código fuente y reproducibilidad

El ZIP guarda íntegros los archivos `.png`, `.svg`, `.py`, `.json`, `.patch` y la documentación recibida. Este Markdown incluye además como **texto** el código SVG, Python y JSON, pero los PNG son imágenes rasterizadas sin una receta editable equivalente para cada píxel. No debe afirmarse que todos los PNG se pueden recrear desde un SVG.

**Carpetas principales**: `ARTE/vehiculos/`, `ARTE/iconos/`, `ARTE/cabinas/`, `ARTE/senalizacion/`, `ARTE/portadas/`, `ARTE/fiestas/`, `ARTE/texturas/`, `ARTE/previews/`, `ARTE/historico/`, `ARTE/documentacion/`.

**Cómo utilizar los recursos:** 1) copiar el PNG o SVG desde el ZIP a una rama de desarrollo; 2) comprobar escala, transparencia y capas; 3) configurar atlas sin alterar proporciones; 4) probar al tamaño real en un dispositivo móvil; 5) aprobar comparando con G-00 y con las referencias verificadas de Medellín; 6) compilar y ejecutar `node tools/test.mjs 100` cuando el repositorio completo esté disponible; 7) registrar resultados en `docs/BITACORA.md` y publicar solo tras superar pruebas funcionales.

### Limitaciones honestas

- Los 124 recursos son **entregables artísticos candidatos**, no una interfaz jugable ni una versión del juego empaquetada.
- Los 473 controles pertenecen al registro previo de QA del paquete; no equivalen a 473 sesiones jugadas.
- Los encargos G- son externos al alcance; falta el ancla visual G-00.
- La auditoría del servidor histórico se conserva por contexto; el parche no se ha aplicado aquí al juego publicado.
- En el PDF pueden cambiar la representación de algunos caracteres Unicode muy especiales; el `.md` adjunto conserva los bytes exactos del original.

## 7. Hoja de ruta de integración

1. Comparar C-01 a C-60 con `ancla_estilo.png` cuando Gemini entregue G-00 y registrar ajustes.
2. Revisar aspectos culturales y técnicos de Medellín (transporte, cabinas, señalética y topografía).
3. Aplicar los PNG/SVG aprobados a la rama v0.5.0 de GitHub, con mapas de atlas explícitos.
4. Verificar tamaños táctiles, alto contraste, bajo consumo de memoria y rendimiento offline.
5. Construir, recorrer pantallas, ejecutar 100 partidas automatizadas y pruebas manuales en Android.
6. Actualizar bitácora, conservar el historial de versiones y preparar una publicación nueva.

## 8. Integridad y trazabilidad

| Tipo | Ruta | SHA-256 |
|---|---|---|
| PNG | `ARTE/cabinas/cab_bus.png` | `cb12091e9d291d7c85ed3c5429c309add37f119cb0432fb0f8ab608f0f0f998c` |
| PNG | `ARTE/cabinas/cab_consola_horizontal.png` | `873d5cf11be00ff17d210215860f98e01f57a304f8194eb7936047c97804ac9a` |
| PNG | `ARTE/cabinas/cab_consola_vertical.png` | `98610516d8997b8352fce8c1990f7eabd0fb2ac99b480f30e40a089ca302d3e9` |
| PNG | `ARTE/fiestas/banderines_feria.png` | `2c4748008a1981598471fd8e4ccb9fdd6a8123c3dc180268b9fbd96e33f5adca` |
| PNG | `ARTE/fiestas/farol_amarillo.png` | `76ddee18ef3fa2c9307445056748867ad44b4568e14b229b2be6ad2f9092eb6f` |
| PNG | `ARTE/fiestas/farol_rojo.png` | `c4edc33c676822ac1abbbe7c38f1f5a71d6889f64a308f790e2390566f556c0b` |
| PNG | `ARTE/fiestas/farol_verde.png` | `90e04550ad19600294d9a9c90fc4698015dd2aa6e019d88bf0b17333ae98f6c7` |
| PNG | `ARTE/fiestas/fiesta_sprites.png` | `dac4d4eac33f1b2abf36372219210e25433de6014770ed5934ca68c3824e5e24` |
| PNG | `ARTE/fiestas/figura_luz_guirnalda.png` | `8d88d1f5a619517e42636eee68d657e5d89fdc8ed2b577773f67adb2c822df41` |
| PNG | `ARTE/fiestas/guirnalda_curva.png` | `33158c6b2b06a261046c6b0a658f0e11e5cdbf76a87ada4fb0cb659275c77420` |
| PNG | `ARTE/fiestas/guirnalda_recta.png` | `eac7c73ffebd33e162db2c131f1f59545d39b537484636669b51bf10135ca1ee` |
| PNG | `ARTE/fiestas/luz_estrella.png` | `23b56112ac2e88df22692b987aab03c0f72e7fda01322e66b8329b963cb3b9fc` |
| PNG | `ARTE/fiestas/luz_flor.png` | `d798e374cef525f381015e7d529da19b666f42b5eaedb5cbebd894c75815efc5` |
| PNG | `ARTE/fiestas/luz_pesebre_sencillo.png` | `4b6ac0970afe6742f4e18bb7941f1a9adf4a1c971d8c3dbe56e1fd79a23b1a44` |
| PNG | `ARTE/fiestas/petalo_01.png` | `67f35607f2d84a1d240c0051a07f0649241f2589731b6ca25e94310182c2a402` |
| PNG | `ARTE/fiestas/petalo_02.png` | `8bb6dddb72a01d2ca773723297592fb0de073b916b9958118cc822d4f2bc0006` |
| PNG | `ARTE/fiestas/petalo_03.png` | `1da87350e094b1e49cda434ae31faa3476da9d4783542989ca208cdac1e2fac6` |
| PNG | `ARTE/fiestas/petalo_04.png` | `44618c66a5b020bf1c99b82fe3373693246d93fd6d2f8e8406f5e2911f22c12b` |
| PNG | `ARTE/fiestas/petalo_05.png` | `91f346e94827a52856c18276e775c3931fab8ecd9b23bdc68181d7d4257517e2` |
| PNG | `ARTE/fiestas/petalo_06.png` | `ac2c3c71e8c2e37c706e3275329feec5be2a150d5de449cccf3da22f2594779b` |
| PNG | `ARTE/fiestas/petalo_07.png` | `266cb7676b5d532ca763c471c74001d25f526ba65912d6dc42490f37a5f0c7f5` |
| PNG | `ARTE/fiestas/petalo_08.png` | `5d9c0c25e0d12c2015b1c026bee5271196dd2c1d541e35f9f518a3b46d92dfd5` |
| PNG | `ARTE/fiestas/ramillete_flores.png` | `54f688f064fd43b13bcd32eb27c658852cbacda24044b099113c56df3bcc62c1` |
| PNG | `ARTE/fiestas/silleta_cenital.png` | `5fee6cb85a346d8c63003764aa537ca4f9cc0a1015167b3ecf533aa89119bab5` |
| PNG | `ARTE/fiestas/velita.png` | `c651e6d20b9988e71f7239a0ebdf7c436894047a00e6443e40370e030beb4804` |
| PNG | `ARTE/historico/boceto_c10_chat_anterior.png` | `bf2ec74a8046a6fa51080e78e57a869f85e24bc137ab1f8c51ffaf14aca0d489` |
| PNG | `ARTE/historico/boceto_c11_chat_anterior.png` | `657bef14087aeccf342ff11f5370298ae47acbfa6fba6721bab887e6f41155ff` |
| PNG | `ARTE/historico/boceto_documental_generado_01.png` | `2d2111153b1f95e4b94a9f08292c3936a77f1141b1785b8014cf073ac42008cf` |
| PNG | `ARTE/historico/boceto_documental_generado_02.png` | `3409f5e291db287b6c9296d7560ea9ecf836058dc1be88bc84730b2197d19dbf` |
| PNG | `ARTE/historico/c10_primera_version/01_ciudad_libre.png` | `453f761ee3aa3519890b9fd7023ba34937d210429f999e1057fc91db23fcc545` |
| PNG | `ARTE/historico/c10_primera_version/02_bus.png` | `ae69251518789e0226c38a909e4c9077ffb4c4ca6aa1ed52e15022455b22aeac` |
| PNG | `ARTE/historico/c10_primera_version/03_metro.png` | `64ed04e657bc873f3fed9957a9751b8d1e137798e168dd09655acb3371a4e6db` |
| PNG | `ARTE/historico/c10_primera_version/04_metrocable.png` | `dbfbe87246f02b1d712eef4b55f8f84253aadbe809c42ed82cdea9b760d25bb5` |
| PNG | `ARTE/historico/c10_primera_version/05_historia.png` | `629861cc7d2d097b68793459fb9e8f589dce045c7e91dbb2d70dea82a52ad61c` |
| PNG | `ARTE/historico/c10_primera_version/06_guia.png` | `a16df8606f05ba68ae2079d111b139c208238c66b73da2d2c0cd340aca39418c` |
| PNG | `ARTE/historico/c10_primera_version/07_red.png` | `94c6f125ca8dc3c02041e9b1b1676bc44c550fc69d8fcae59181eacdffb424b6` |
| PNG | `ARTE/historico/c10_primera_version/08_juntos.png` | `6594fdf3077f6ed5d15e9669da077458d2c7b5e81b86dbbe81ab690143aca29b` |
| PNG | `ARTE/historico/c10_primera_version/09_arcade.png` | `5fb1fb2d4add162ff16e0bf7e8bc54e5616acb5a3ad99ffa6dcc9096ed9c3bca` |
| PNG | `ARTE/historico/c10_primera_version/ico_modos.png` | `3663392fdd9d2e41c55aec9300b31f7bf1d6a88372d2dcfe2126a17045e39eee` |
| PNG | `ARTE/historico/c10_primera_version/ico_modos_preview_4x.png` | `f7eed34f93ac21fbd9d2a0a3075de08fbb2fc152d008acffd6bcbd07a9ec613f` |
| PNG | `ARTE/historico/icono_ciudad_exploratorio.png` | `72ba4b4135119375cde3b86562c6f7dce3f711533c74a5f4cef2f938a52b4ce8` |
| PNG | `ARTE/historico/infografia_provisional_anterior.png` | `2404a793916320c2d3e28c3c109946833593d99f5793a8926aa4d5abb714417a` |
| PNG | `ARTE/historico/menu_exploratorio_descartado.png` | `46c533803185e32e96bfedcf3a86d35f98bdc6fc29fee005dbc4d31e891f3a77` |
| PNG | `ARTE/iconos/c10_modos/01_ciudad_libre.png` | `f6045ff474fc0a3a20bb640407dbc99281993a878bd23ec852fcc4ec9e184541` |
| PNG | `ARTE/iconos/c10_modos/02_bus.png` | `2fc526a58c3227574d117eb84d387274f43d97614ec5273ad58eec3033985eb0` |
| PNG | `ARTE/iconos/c10_modos/03_metro.png` | `9b472f4adace7ab894874a6731f33ab9bed046d654e05dfdf2bbf207d1a4bb49` |
| PNG | `ARTE/iconos/c10_modos/04_metrocable.png` | `34df58e88530569faa959cc2dd313a57598c9d9f25dd3b02148926c8d1b979b2` |
| PNG | `ARTE/iconos/c10_modos/05_historia.png` | `28a36bcca6505458103d72707a3d2428a7be6be94e12960e0d1d14ead165cc73` |
| PNG | `ARTE/iconos/c10_modos/06_guia.png` | `daae8f5f3e45644f21b806cfbb80f88ffed89a29524d6de502536025c3bc75d4` |
| PNG | `ARTE/iconos/c10_modos/07_red.png` | `9c047b41e4c5316479fc4f5a8c290cd290e189e40c989380c0b8afc0719e6642` |
| PNG | `ARTE/iconos/c10_modos/08_juntos.png` | `e28295e4bb2bc3584cd2dcbe7a9a54e27f5747b00bab616a8119d8012859dfa9` |
| PNG | `ARTE/iconos/c10_modos/09_arcade.png` | `9c8fba03c30acf8f72e34ff6b06a524b479768873e2521b47e2528bcc1acd091` |
| PNG | `ARTE/iconos/c11_acciones/01_llave.png` | `4cdb8289f68f289463b5bbaae2ac04715de9afb1e1efc58d10798401035a7895` |
| PNG | `ARTE/iconos/c11_acciones/02_sentido.png` | `3f7a418bd23f7155384e46ae4e6b5eef073f52a6fd5d15f0e0fac98d6104b3cd` |
| PNG | `ARTE/iconos/c11_acciones/03_vigilante.png` | `bc668d6a25cb265ed52c93a0676731bfd1fc19909ce15abc45261b1fce38b06c` |
| PNG | `ARTE/iconos/c11_acciones/04_megafono.png` | `fcfacf6f3ed59dde93a1c14e2d33fd69df00ae674a7c2595b3c3306a9fb283b7` |
| PNG | `ARTE/iconos/c11_acciones/05_puerta_izquierda.png` | `c901aa34f67c5b7edb42bafbac8fbce98e511f9c4b85d7785701dd327496fd16` |
| PNG | `ARTE/iconos/c11_acciones/06_puerta_derecha.png` | `5568dc4f3981c1b05cb4dedbc22aaaa3037facde0e4939e45226e2b115d5fcaf` |
| PNG | `ARTE/iconos/c11_acciones/07_pito.png` | `42e46b37e635fa5b18d2b46cc009c6f9851629e939d99cc80d09f2488904b3c6` |
| PNG | `ARTE/iconos/c11_acciones/08_foto.png` | `eeeb2d7371a52a9266983fdb4b302ea52b3f42d11b55a7f4f1627158137e3aa9` |
| PNG | `ARTE/iconos/c11_acciones/09_lupa.png` | `a1bf68ed7e6dbe30d8b170a5a64da2e4acfc41cf2ea2f4b63237b1df703bc853` |
| PNG | `ARTE/iconos/c11_acciones/10_correr.png` | `f9caa44abb21b28a610fd9b0039ad4190252e24fd1d467450bb8bb4dac2b2959` |
| PNG | `ARTE/iconos/c11_acciones/11_adelantar.png` | `310eb98ef2d6a6331ae68e5b86e22b4a5b054f8b37016d32e478852a9f3e6a9e` |
| PNG | `ARTE/iconos/c11_acciones/12_tarjeta.png` | `2d6033d3303c1a9d9146f1f0c3fc17ab0d959714581cabd29b24f6b24974af05` |
| PNG | `ARTE/iconos/c12_logros/01_primer_viaje.png` | `e6833310c782f6e4cd4bef66da4fa87219ce30f14a761e08e4b3a40b13baa31a` |
| PNG | `ARTE/iconos/c12_logros/02_frenada_precisa.png` | `900f7f464705646c29fed02c87abe104346d59f1310797ae0c79a6868cee650d` |
| PNG | `ARTE/iconos/c12_logros/03_mano_firme.png` | `18e8b7f9ea44f2bc9dce1e8c671bbbfb6dead2337a767440d9f11eeff2350bc5` |
| PNG | `ARTE/iconos/c12_logros/04_punta_a_punta.png` | `3273a7609a8a9baeebcf13533e44c88a7427a5e115d36d9acc963bc259b7849a` |
| PNG | `ARTE/iconos/c12_logros/05_control.png` | `7d158f984761a73c6ca3a913b53b8cd47550f605f635b33f2fccee3984d57c28` |
| PNG | `ARTE/iconos/c12_logros/06_carril.png` | `b5d64233956fb6781594f2a6adf45718e06e8bef42d5ff2f8f5ec75297e14dcc` |
| PNG | `ARTE/iconos/c12_logros/07_ciudad_colgante.png` | `d29a9fc8446691636e7dc49e06c445f28fba336dabb50e3bb4c63394e8997069` |
| PNG | `ARTE/iconos/c12_logros/08_diez_de_diez.png` | `5c887955c07fc4e79134ca967f0960fbc7fec32633364fdf2d504e4a2045b476` |
| PNG | `ARTE/iconos/c12_logros/09_gerente.png` | `5b07c0bba782b0b3a37d1525053755ae8b2f0196de450740b859d9d53db82a58` |
| PNG | `ARTE/iconos/c12_logros/10_ultima_vuelta.png` | `1a491b6eccb8fef15fa11bb9683e05d5ea5cb4b5d2f194beb7bcd852815c3090` |
| PNG | `ARTE/iconos/c12_logros/11_enciclopedia.png` | `c7662cb61132e2209a4a16452669cbbf139b4600518bd43de889eb549aad9c3c` |
| PNG | `ARTE/iconos/c12_logros/12_turno_noche.png` | `dee2b874224972873dd8cf4e082143593d1179264dbebf001ac6c029f2f66cb2` |
| PNG | `ARTE/iconos/c12_logros/13_madrugada.png` | `b69d88227247be25351e916ffa7e46f8ed52c7b867264271a76d978463cb4b04` |
| PNG | `ARTE/iconos/c12_logros/14_duelo.png` | `ea716631e994432700d43277260b2fde513039e91e8e424c4a0780c3366321e6` |
| PNG | `ARTE/iconos/c12_logros/15_en_red.png` | `41e2a0ee9eeb771ba9898f98ab604df2ef5878d4a9f825f317e33961c9e87ae9` |
| PNG | `ARTE/iconos/c12_logros/16_costumbre.png` | `1ef8f174381733effb6ff53fcc8eb94102f41dde3fea3e1997ae687377cfde8d` |
| PNG | `ARTE/iconos/c12_logros/17_bolsillo_lleno.png` | `2646e2d886d1476d8771e457693fbd784d1ea59d03e9264b1e80abe67a6a9c1e` |
| PNG | `ARTE/iconos/c12_logros/18_ni_una_gota.png` | `3b6759084a944936b1f0a3cc2f4fa5d34be817a5b659b0f97ef378580c35f83b` |
| PNG | `ARTE/iconos/c12_logros/19_feria_flores.png` | `523ea7df2da4edfa8b166230dcafa9442596b522c48f23f77ebc93004ee2701c` |
| PNG | `ARTE/iconos/c12_logros/20_alumbrados.png` | `73df8e2cd60f8e15029d14b786a6db55c70be3ea9105c38f0ebf4561c93a919f` |
| PNG | `ARTE/iconos/ico_acciones.png` | `30b02d0e33078008ccbd409f3c3acc53f13907ce998e9685fc480f2351c72b2b` |
| PNG | `ARTE/iconos/ico_logros.png` | `0c7d4b1aaf1492d3d4d5727eb7aabd0096ee942a2f4b5a53c779d58616c55505` |
| PNG | `ARTE/iconos/ico_modos.png` | `4baf9f8b272d6400786103037bf1ddb6a4ed0540746e6a542b8a60df01e499ae` |
| PNG | `ARTE/portadas/clave_carga.png` | `0445c32df9f3c3c9a19ca4b518040ef1c3c303e88d983c93d8f7a494883d91ac` |
| PNG | `ARTE/portadas/clave_compartir.png` | `0a117b3093900f7d8166b9faa56384748908639ce043b33684b89969792a93aa` |
| PNG | `ARTE/portadas/clave_portada.png` | `a4b01287bff55969f0cd7fd7f46dfe12cca8e18e80ad24c2817dd29430e4d9e1` |
| PNG | `ARTE/previews/clave_art_preview.png` | `5abfbd7217f5f6a7e1cad9d3a09ac9b19a4d7fd18fd1417f5ed3bc8ae623ae3b` |
| PNG | `ARTE/previews/documento_maestro_final_escritorio.png` | `861bfa3f11b2b9f38f3bb6d7acdb85d5900fb24a884a03e055f95cbe11836b92` |
| PNG | `ARTE/previews/documento_maestro_final_movil.png` | `bfc53601c8b67f64713dd8496626b1fde4413ebc26dcb12a1dcf4eaa2ff60e6b` |
| PNG | `ARTE/previews/documento_maestro_movil.png` | `9490464ca0cde38ce1f15c600ede77a55626f361ec68dcb4441943bd4143105c` |
| PNG | `ARTE/previews/documento_maestro_navegador.png` | `e946da42fbb6aa980b5639a8fabbd25dc555ae721bded14c143432204d089d90` |
| PNG | `ARTE/previews/el_metro_compilacion_visual.png` | `66134f0911bf24e375763c0a252fa53af70e3eb7ad6ed154edc8007c452a18d9` |
| PNG | `ARTE/previews/ico_acciones_preview.png` | `739e8546081258c77dd5d028d0a3bdebb298795ae439f0388497ea951ab2be6e` |
| PNG | `ARTE/previews/ico_logros_preview.png` | `e8534a6834789756f52f41acee281c960dbafae34890cd36e29a9b05e82e430a` |
| PNG | `ARTE/previews/ico_modos_preview.png` | `91f4f3e0582184778742b3207fa152127d1fe3e1c97fbb373b1311d381f8de2f` |
| PNG | `ARTE/previews/pdf_final/page-1.png` | `0a807ab2b0fbb9b97108a524f27f0a8864fbcf415afc5988e6d5dcaa81c81345` |
| PNG | `ARTE/previews/pdf_final/page-2.png` | `b699744d89647c3ab229f5629f79d9a7e563301b1b87f45a51c134e2d3bb8fe5` |
| PNG | `ARTE/previews/pdf_final/page-3.png` | `21f6a958877050951ee97b7cdf3c56e25e70eafa3f0732ed21e129697f1a54e6` |
| PNG | `ARTE/previews/pdf_final/page-4.png` | `6d57baf205aef1cbb7e8c8b0e25686eda19fceade57d4aedbf18253fdcd6d6e5` |
| PNG | `ARTE/previews/pdf_final/page-5.png` | `c05b089a05938758fd4143a4b9c2d055e64000c9690dae3502d9399b35132d65` |
| PNG | `ARTE/previews/pdf_final/page-6.png` | `cbd644b5264511caaa25f14416ee9ee08397e7c08e60000c0b19d552a7ae161e` |
| PNG | `ARTE/previews/pdf_final/page-7.png` | `811cdafc6e12eba00aef331972b72fee28f7f9e26a8bdbf8e8d3f8501fe2aa1f` |
| PNG | `ARTE/previews/pdf_final/page-8.png` | `f92799b9715ce2345629deaf61f21af87d860080ef784dc2fec17542830c1dd5` |
| PNG | `ARTE/previews/pdf_final/page-9.png` | `961e1d647fe9543110653a57c03749252daa2b5ebd71393dcebf09f3c0d883f4` |
| PNG | `ARTE/previews/pdf_render/page-1.png` | `86e6f3a82c053deb89c1c47f758b5fb2451bf030be40fb8ac7127e30d1bae6b7` |
| PNG | `ARTE/previews/pdf_render/page-2.png` | `03a5d970dff999db4db5b3d47c1f84985eb0067a0b67e9ce34bd6d14dfbad2a6` |
| PNG | `ARTE/previews/pdf_render/page-3.png` | `af2c018f980543ddf6b6e912e18178901b808d9357c7eda5657bdc4982210f37` |
| PNG | `ARTE/previews/pdf_render/page-4.png` | `772740b872518d0015b4c53c47305035798c445f47fd1bfa96cc318054d2bbfd` |
| PNG | `ARTE/previews/pdf_render/page-5.png` | `769985c5db303f5841d8a4b3f132f1d559072293f1fbe254ff10ceae83515616` |
| PNG | `ARTE/previews/pdf_render/page-6.png` | `4424c107dbe0c6ba2da44685b0aef64210e461028d3005b4270ee390709793a2` |
| PNG | `ARTE/previews/pdf_render/page-7.png` | `b89e725c564b561b1aa51d79263350e4561f224a71ac10db0d6ebd26ecd9e5b0` |
| PNG | `ARTE/previews/pdf_render/page-8.png` | `bfe3007b94075eabdc5e7e20404ee5e8a878f10b060bbba64c4f00d914291943` |
| PNG | `ARTE/previews/spr_vehiculos_calle_ampliado.png` | `723364a6866992a8bbdc7996b17b65b02983bcee4c7edcf95e69fc52392d9cd5` |
| PNG | `ARTE/previews/spr_vehiculos_calle_sobre_papel.png` | `6cd35073d636408b2991294afb802fee07a2d2d9c5eb27769dcee45c493cb394` |
| PNG | `ARTE/previews/spr_vehiculos_sistema_ampliado.png` | `25bea1f4a415a0a85a440157a2a6fcb9940163266ab4ec0d51f8db7f86bcef1a` |
| PNG | `ARTE/previews/spr_vehiculos_sistema_sobre_papel.png` | `9270a1a6504e9bb198e5a5c62ddb82888694363f748d7835ba3866f51c507d99` |
| PNG | `ARTE/previews/texturas_mosaico.png` | `f2ba1552066331664ec691747bfe12e7fcc72efb73308359399c3fa0322a1271` |
| PNG | `ARTE/previews/ui_letreros_preview.png` | `0b5f4ed5ef5e14c19e7c61a9d65365393833d72aebc568c9005fbed153a86a41` |
| PNG | `ARTE/previews/vehiculos_calle.png` | `6cd35073d636408b2991294afb802fee07a2d2d9c5eb27769dcee45c493cb394` |
| PNG | `ARTE/previews/vehiculos_sistema.png` | `9270a1a6504e9bb198e5a5c62ddb82888694363f748d7835ba3866f51c507d99` |
| PNG | `ARTE/senalizacion/flecha_derecha.png` | `2f14bde538083acd1c904ec50750f74c95462e7a39810630ae0b15147625a9b4` |
| PNG | `ARTE/senalizacion/flecha_izquierda.png` | `a5f607219e734c4260d76930053e794c5902e8d3034f5e643d9c7212b6789988` |
| PNG | `ARTE/senalizacion/linea_amarilla.png` | `f9cbbcc44a4eefa14c3ba847da82b28753c520d7d1c3cb6d4612bdff545fc656` |
| PNG | `ARTE/senalizacion/panel_led.png` | `39d6c643df9fae7b9a201e5e45c311325413c972aee3e6b3a265bd660c41e3ed` |
| PNG | `ARTE/senalizacion/placa_a.png` | `65009fa91102e4c066bfe1b37934f037fd98cb424b481caed4138d494625277e` |
| PNG | `ARTE/senalizacion/placa_b.png` | `79d8db6e2f11891a33cdeed3e842349a8e83c215d4dd612ea6e6eb207a6b6ae1` |
| PNG | `ARTE/senalizacion/placa_h.png` | `d5de0ab3b4771cbdb621cdc07134a47546e422b5200ca0be00a5609b99486d66` |
| PNG | `ARTE/senalizacion/placa_j.png` | `678237e645a2e1f210873dcacceeff4d92f607ff8d014edb58c1da85c332232e` |
| PNG | `ARTE/senalizacion/placa_k.png` | `90a934f23f0c3b0a738fb37738cf8031e4e5ebd8399856c1ffa345f60c191cd6` |
| PNG | `ARTE/senalizacion/placa_l.png` | `62bb7770ffd68a554a0bd3dbe22a31b20b7cbf4c3f63aa65bb0535204d727423` |
| PNG | `ARTE/senalizacion/placa_m.png` | `f66222d0a95b72b95be39892874a648aa21bb299c09c839013d867f36665eef6` |
| PNG | `ARTE/senalizacion/placa_metroplus1.png` | `95e5d18dcae1563867ca6df82d80be392453d29a5fcf208a8c18ff9a7ca3e828` |
| PNG | `ARTE/senalizacion/placa_metroplus2.png` | `ad6629d78ddf103d5ba0cfe27e704ffdbbcbfa5a436b018988566dc9da451e5d` |
| PNG | `ARTE/senalizacion/placa_p.png` | `e5ab01a97562672c2d9fc680d3abbef3cdfd8484021116ac08051950e610b6dc` |
| PNG | `ARTE/senalizacion/placa_t.png` | `ced64fe30dc819575af089bc4bc6ba7515e141edee45bc13f6f29e47ea1c0880` |
| PNG | `ARTE/senalizacion/torniquete.png` | `63832c20728f433a519d9af2b9b8b56d6d59980024664eb05fd8d329061a22b7` |
| PNG | `ARTE/senalizacion/ui_letreros.png` | `23fa4082ed69501ea907bad651354e50b291f2abf0c378c3e0c66f5509c145a5` |
| PNG | `ARTE/texturas/tex_adoquin.png` | `d7d85c336a23427f8e5b974848cb498c07c4e13effa68a7315a388c23793e800` |
| PNG | `ARTE/texturas/tex_adoquin_base256.png` | `f47465fcf5734f453bd4ad81e2a0355b833bed9efeccc37a3c74809fd4350df8` |
| PNG | `ARTE/texturas/tex_anden.png` | `35ab1d26c068299d20b0f4824b9f22483e3a7d7d941725c5e63e7a263fdb2c99` |
| PNG | `ARTE/texturas/tex_anden_base256.png` | `5eb5a7cbb677118bab1403c5c7abbfdae43e77468b0840b1a6c6db750f0df25a` |
| PNG | `ARTE/texturas/tex_asfalto.png` | `61194941bdc18ab75fd9a239ead5e6a1e42a702e472e2e0bcb2987609d36e4b0` |
| PNG | `ARTE/texturas/tex_asfalto_base256.png` | `79dfb238b2dc4643b1e0b91f0ed2b3e89d07fc4576fc53acb60488c9e5d3d054` |
| PNG | `ARTE/texturas/tex_balasto.png` | `dc9116ea58344064d8e14983c93f89b44e71a9501fb790df94b9110388489d9a` |
| PNG | `ARTE/texturas/tex_balasto_base256.png` | `d4fb50bf8b8f8a9af020274b7473a7d377aa65012b9e1e14a1c5d35410b48326` |
| PNG | `ARTE/texturas/tex_concreto.png` | `1ecf19b498d2cfa3a03df075fcb208be965e78f61781e188cdb94cfa2f6434f7` |
| PNG | `ARTE/texturas/tex_concreto_base256.png` | `bf395e2554127cfe846c890cdc78a226d4e862a4363d22573587f91191692301` |
| PNG | `ARTE/texturas/tex_eternit.png` | `60a0b166d53c2a07e074f741da28ecfe7655ee463c9c9719f5dfb048e8ace97b` |
| PNG | `ARTE/texturas/tex_eternit_base256.png` | `81e928d7866a2da8f5d85c3339816ac20147c4f5d876e65b53b2bb45bdaa0280` |
| PNG | `ARTE/texturas/tex_ladrillo.png` | `646ef0b66f6368fa6e5087c0d9b8564af6d2787ef255cceadff5b5ad02f316ec` |
| PNG | `ARTE/texturas/tex_ladrillo_base256.png` | `c889d0027390e655c5f019a677e1c005da32563c1b39956e7a6b5eb9249ae4cf` |
| PNG | `ARTE/texturas/tex_pasto.png` | `a83a58b1b0ff18dfa3ceb63e9204a88b60f4d599b68f308ef7e9592fbd576063` |
| PNG | `ARTE/texturas/tex_pasto_base256.png` | `f2d1104fde5c2ba49714ac68eb9dac415127ff1d743340d9eb677bca65cbebb5` |
| PNG | `ARTE/texturas/tex_rio.png` | `9ab36853bb02d1b334c3c230356ac0fc137ea890163f83dd4fd0101535b59be6` |
| PNG | `ARTE/texturas/tex_rio_base256.png` | `96a95f73a1a536ecf77b39d8dbcb7320a17d7d47a2a46451b66f03af5a00e694` |
| PNG | `ARTE/texturas/tex_teja.png` | `8f87eee20a8315b9677e67161212b07f010580bce02ea030f3ca75e6a248c52f` |
| PNG | `ARTE/texturas/tex_teja_base256.png` | `a6036c83a2a7579aad357f1ac6f2a3405891222f4a03f825c58d48ae4bf6b7a5` |
| PNG | `ARTE/vehiculos/alimentador.png` | `776d9275474a71e8d0f10d9998591455b9c6ad159c889264db994eeea21dcf2f` |
| PNG | `ARTE/vehiculos/ambulancia.png` | `db433e56a718915707d5a14b98156c83c584694cb5145f89f092fbb22937d36f` |
| PNG | `ARTE/vehiculos/bici.png` | `0252a1c18757e6ddc3f480920cae7ec8ea23a69a323f75853ca50d52252d1e48` |
| PNG | `ARTE/vehiculos/bus_puertas_izquierda_abiertas.png` | `54aee89ad6768da66c210321d505d029cad4e04dc0edf819fc46a5c1ddd7da48` |
| PNG | `ARTE/vehiculos/bus_puertas_izquierda_cerradas.png` | `51791e459d16ab78d68cffffe506cd504c08070799a37c01e09bc2f79e6ba9d2` |
| PNG | `ARTE/vehiculos/bus_puertas_izquierda_entreabiertas.png` | `0658ebb88cb78604c7d5ffc0348541af93a9224798c749cab0bd38eb8e794517` |
| PNG | `ARTE/vehiculos/buseta.png` | `33449493465632dd5d2cec9c963a5c6b05baeeb0937cb9232cb824004519275a` |
| PNG | `ARTE/vehiculos/camion.png` | `08de46c73296b4b03512a7bdd6e502eefd8d43f409f32f02585f444d5c079182` |
| PNG | `ARTE/vehiculos/camioneta.png` | `b19ca6879182aea6052c4744f6a351603534fbd990582dcb8292cede34ec77b5` |
| PNG | `ARTE/vehiculos/carrito.png` | `ba75b8c8899ef7b42a4d4537c2fd17c552ffb3984a198061d3de951bfc2a811a` |
| PNG | `ARTE/vehiculos/carro_azul.png` | `2ac841b913f5bf02f03a64886daa8274ef67ce23d9fd96a0994c1127ff2c439b` |
| PNG | `ARTE/vehiculos/carro_blanco.png` | `fd6aa1a9f8dc7095c79f6b5af0112f8410580879ccc5847afce2cc35d52ea266` |
| PNG | `ARTE/vehiculos/carro_gris.png` | `609db609c546998d621e0fda27fb8dce98a45d3e0a6563caa5d1df96e1d044f2` |
| PNG | `ARTE/vehiculos/carro_negro.png` | `3410c6b37f14f3af5a9c8712c3f7c5f3a15f921ad6447656fc03237b7629fa03` |
| PNG | `ARTE/vehiculos/carro_rojo.png` | `32836423c0dffa17bbd4b9a599c613eba0f86f9f9700cecb119c3dd3e1a75c1f` |
| PNG | `ARTE/vehiculos/carro_verde.png` | `e8235d8bf4f065bd184fa57230685a7dbe9b52170b72434021cddeeda5882776` |
| PNG | `ARTE/vehiculos/chiva.png` | `c2501d28673c77ae360153001d4495693a3f528fc8ff029bb2774f40ed2d503c` |
| PNG | `ARTE/vehiculos/metro_coche_cabina_delantera.png` | `ea65180cf44fc76fc15db7eab01000e37cb7afc7f284c405db67036fafa24c25` |
| PNG | `ARTE/vehiculos/metro_coche_cabina_trasera.png` | `5dc7a92592ccb73b50cb72f0513ea9bcbce3afd7095aa036a812099572b8c5e9` |
| PNG | `ARTE/vehiculos/metro_coche_intermedio.png` | `9f0824268a40368855ae5fe5ec9bba2bd1f7c92669612e129906b5546d1870f9` |
| PNG | `ARTE/vehiculos/metrocable_cabina_h.png` | `92665faf265706d8db03680c99f9298383c80054be212a5940cde945f52b5991` |
| PNG | `ARTE/vehiculos/metrocable_cabina_j.png` | `9ae34b9c9f9681187f1254a9135a4af75a470365d1ddd8cbf56363a693af46b3` |
| PNG | `ARTE/vehiculos/metrocable_cabina_k.png` | `b3eeb67a4746bed1ff1b7af89abbc30ff2511a7aa0770fb71bff7665383da277` |
| PNG | `ARTE/vehiculos/metrocable_cabina_l.png` | `abc47050fead90a5df61394d5c8efd25477f06ca09d5b058d149e9ca0a0b5457` |
| PNG | `ARTE/vehiculos/metrocable_cabina_m.png` | `77effba86c0efeff2d16eff74d799c55e821cb78525c241957c6e5999fb63b13` |
| PNG | `ARTE/vehiculos/metrocable_cabina_p.png` | `59b9a76b8b0281d9c2abbdfd8db19c2c7b3e6ae0b96f262744acc1bef9e09843` |
| PNG | `ARTE/vehiculos/metroplus_articulado.png` | `7814e995f2f77c510b8f86f3a30e3af27e4ba597e7f92b7be5846f092e62bb84` |
| PNG | `ARTE/vehiculos/moto.png` | `907a5d25f7e18759de5ad34bbe2441a51e601afc138877004b2a41120fee9db3` |
| PNG | `ARTE/vehiculos/spr_puertas_bus.png` | `7342445c123b78ed915793f0d4acc564f410e324648bd30367a0adaab3ffa5b7` |
| PNG | `ARTE/vehiculos/spr_vehiculos_calle.png` | `2be2399012404b47b6150edc5791fa67b8897ec82d7c95892a7241f3135f14f0` |
| PNG | `ARTE/vehiculos/spr_vehiculos_sistema.png` | `16412e2e143bf122a2e2f91907ef316c534e45de8493387bb394807051bf683d` |
| PNG | `ARTE/vehiculos/taxi.png` | `6aea111f738fa490ca973b3d347d9ef3aed9af7ed586194bf7e63ac8fe110d94` |
| PNG | `ARTE/vehiculos/tranvia_3_modulos.png` | `bc648cf14e32f93673d79d0fc628c7cc87e62d0659102664bc4173de4ac3671c` |
| SVG | `ARTE/cabinas/cab_bus.svg` | `948dad14696c40385ad0ff0ad0d293d384f63ffe46908aa8842f1ca4f849e575` |
| SVG | `ARTE/cabinas/cab_consola_horizontal.svg` | `416b7c0d003f1b21361f1acff5bd0a9f61c66635b9b14244366efddbeaaed0a6` |
| SVG | `ARTE/cabinas/cab_consola_vertical.svg` | `58f9871ed067ba0e89ddcec7e21305e8782790850b7716a4b8b75ef6d1ca2a4b` |
| SVG | `ARTE/fiestas/banderines_feria.svg` | `f228bc6a6bce608e1cb9d1f361c6ced356441e0a53227099b9f856221b1c2eeb` |
| SVG | `ARTE/fiestas/farol_amarillo.svg` | `e6896fd3ed027cbddc83c6c2014c02d31bec16bd02da3d82e4ac38e84c7f81a3` |
| SVG | `ARTE/fiestas/farol_rojo.svg` | `d1a59b45f70016a70a123cab019c48cc658e2a9dc20fc865d815f49cec49abc0` |
| SVG | `ARTE/fiestas/farol_verde.svg` | `c3fe155af4a441d4c9c9dce5d56c787a1feae1affbbe501399a8f57643813943` |
| SVG | `ARTE/fiestas/figura_luz_guirnalda.svg` | `8b0c53929957c8b60f8cd2ff28d9d1e5268edca72f5ce3d74f9fe013a93e1a90` |
| SVG | `ARTE/fiestas/guirnalda_curva.svg` | `ef7c377c045b5efac35f7b0b7cdeec94a80d5eaae6f948fa84ee361f2b9b0c9f` |
| SVG | `ARTE/fiestas/guirnalda_recta.svg` | `6ebaa33b982a9fce99761b32d20394f42e3ab4f66a2514c4cf01d3dd22b56be3` |
| SVG | `ARTE/fiestas/luz_estrella.svg` | `661a99c53a5c4985e1e39c647d6530964792643d949ac84628ce87e374b8123d` |
| SVG | `ARTE/fiestas/luz_flor.svg` | `7fef219b9aab82e7a44f11105824169fdff717698714b0f37ef6c83f74479ea3` |
| SVG | `ARTE/fiestas/luz_pesebre_sencillo.svg` | `84d53eea0dbbd1f3a9e99cb480ed424f518f28397e606f56ec1477920e43d60a` |
| SVG | `ARTE/fiestas/petalo_01.svg` | `48e3d50c9b9def77f170332dc7bbba9ec07581ae37ed56fc1747a0737b236b8b` |
| SVG | `ARTE/fiestas/petalo_02.svg` | `ebb9bd9fa79f52f251c77aade24ada477d5c04a2e28a3f773507779ee6450af5` |
| SVG | `ARTE/fiestas/petalo_03.svg` | `09241964bf3bb00e9305e789e806cc81318f909c3dd0084504f490ea52ef3636` |
| SVG | `ARTE/fiestas/petalo_04.svg` | `58a1707b58b1ff2ae9b32419a525d3a6cbd05434a4f497c1fe8d54b0b388b003` |
| SVG | `ARTE/fiestas/petalo_05.svg` | `a7d2bac9863c0ef129a0badf20ba57dce835790ed2bdd42917b1e29f0992cbd3` |
| SVG | `ARTE/fiestas/petalo_06.svg` | `7b340554e3c86ab00caf201d82799d3a0d2eb00c46f515ceedcb9d415d5bac47` |
| SVG | `ARTE/fiestas/petalo_07.svg` | `77b091b3fe905a305a2cc534d2f013e4de536cbecd051d9532b277ea251f04a8` |
| SVG | `ARTE/fiestas/petalo_08.svg` | `5f2000c53712e3f97901177c236c9f4c14aceebc899f8fff7079da9b2cb87eb7` |
| SVG | `ARTE/fiestas/ramillete_flores.svg` | `04f3716abc950210ed6a5153735712f0f6bdcd8482d5386f323a9f76cb71f985` |
| SVG | `ARTE/fiestas/silleta_cenital.svg` | `c5546f742517666a050f119ec596cd1a4d9c22bb5c5ae2bd88379f0a2b781d82` |
| SVG | `ARTE/fiestas/velita.svg` | `628acd7e95183db383558c7c7bacdc8f20514a1380ace679cf307847dc320b54` |
| SVG | `ARTE/historico/c10_primera_version/01_ciudad_libre.svg` | `816ced389e72e98fd8713a0bfb2740b1e6d65632fa243cccf2167883e524cb4c` |
| SVG | `ARTE/historico/c10_primera_version/02_bus.svg` | `d93658e44041c464bf9a786b76b5f805281df077e802fc98c31e615f2e776bca` |
| SVG | `ARTE/historico/c10_primera_version/03_metro.svg` | `89bbf1835f24078c082305a68c4e5ac7b3dba95961acc31f9e87d8339939a215` |
| SVG | `ARTE/historico/c10_primera_version/04_metrocable.svg` | `eb242bf0a20740b9a707377113248b72d6345eabdcc4efd342d823913129530b` |
| SVG | `ARTE/historico/c10_primera_version/05_historia.svg` | `b85bf7f4f076b15e0fbd3380a54b20196268170bb48f033f5bc81f54a6e5cbd8` |
| SVG | `ARTE/historico/c10_primera_version/06_guia.svg` | `57e813d253896d124930e61394d61614738718d83c359fdc34770188a8618506` |
| SVG | `ARTE/historico/c10_primera_version/07_red.svg` | `dee549980565f89a9097eb4f909a84f74426135dbc3a3e7c215f80f8b9b0d257` |
| SVG | `ARTE/historico/c10_primera_version/08_juntos.svg` | `453b1c07daf4cfeff535e8047b01f24e27df6e440c3c5f9d99faca09d5477ed9` |
| SVG | `ARTE/historico/c10_primera_version/09_arcade.svg` | `7d8a5f9c6c3279afca8c092e8806a6e6453219fb7f50273b06f9edbe78e1fde2` |
| SVG | `ARTE/iconos/c10_modos/01_ciudad_libre.svg` | `c00eed6896edae43f45ef93388330e065dae9e446e56c5a0287140f1c398c0d9` |
| SVG | `ARTE/iconos/c10_modos/02_bus.svg` | `a6ce7fd3d42193e4e6b4dfc24f3143ad981737331f433d5b8c6d5d0c4c2d9133` |
| SVG | `ARTE/iconos/c10_modos/03_metro.svg` | `47abf671c0672520293668382ecd7393e4e8f177ba4a65d06550ee4db8e6aad9` |
| SVG | `ARTE/iconos/c10_modos/04_metrocable.svg` | `13f2912f0fb22f9f99c638ea475f7d5736d81c0de58023791650f374dbe15d8f` |
| SVG | `ARTE/iconos/c10_modos/05_historia.svg` | `2dd7cbfa96c435ec424497c6b658e24961f1c2f2093b1dd7f62d185f8a876877` |
| SVG | `ARTE/iconos/c10_modos/06_guia.svg` | `13813d77debfab4ab6218db7b0bf6fcfca858e9f787d8cd878897d07f9dac6df` |
| SVG | `ARTE/iconos/c10_modos/07_red.svg` | `3f2d0958708997ed8407daa6c5cc64cecf1c7c11cdb987d1094ec099eb1d8835` |
| SVG | `ARTE/iconos/c10_modos/08_juntos.svg` | `35ea3b52c714930f229306f56eaa00fdc9d1067b3b4c7639596d1efcefe89d9e` |
| SVG | `ARTE/iconos/c10_modos/09_arcade.svg` | `5de5641bcdb697440711fc8ce6bdccf381eb5571bce3eab130fe0b57c23a1354` |
| SVG | `ARTE/iconos/c11_acciones/01_llave.svg` | `650994303d05a2aaeee0a2ebdd6c3554716843a273cd45cf2dd22338008ea12e` |
| SVG | `ARTE/iconos/c11_acciones/02_sentido.svg` | `cf636d620aded1768eb0d2d962a200d723ab5d3dc7a1e97623b7729d3b75e4f9` |
| SVG | `ARTE/iconos/c11_acciones/03_vigilante.svg` | `e53f3832ec178ff358a4e04a19ff7d38f98abb7a1bf4030792336a41c520af65` |
| SVG | `ARTE/iconos/c11_acciones/04_megafono.svg` | `a278fdb88a240a63665bda5ef96bc49d8f7b01e879cac3787ec2c0485446154a` |
| SVG | `ARTE/iconos/c11_acciones/05_puerta_izquierda.svg` | `ac72a339f9d4c2c786ec4fd27503a9a35f6304a49fa65a3dafb54ad70af6419c` |
| SVG | `ARTE/iconos/c11_acciones/06_puerta_derecha.svg` | `6205ca0c84df34dec294502393645e56f36659ba449fc4a027929e4af62049af` |
| SVG | `ARTE/iconos/c11_acciones/07_pito.svg` | `3864112798824b0ada3ecf912531aa4d1a657cffbba40e3d37eba9b9d6199acf` |
| SVG | `ARTE/iconos/c11_acciones/08_foto.svg` | `bc9cf907eed5df8487319cd457387b989f36ff34a798d072a394afde373c82d0` |
| SVG | `ARTE/iconos/c11_acciones/09_lupa.svg` | `a6285b71bc314649f5aa5dc1a7190416797ad4388a8a1fdab8dd2d23cdd5aefe` |
| SVG | `ARTE/iconos/c11_acciones/10_correr.svg` | `ab0329aabdaa490a92195246d324ec9e8c9ed40803c94788d75baa98ce7d1a1d` |
| SVG | `ARTE/iconos/c11_acciones/11_adelantar.svg` | `8025e298ba1593f776dba96b0bf67c752b95563b88c30bf7974ac9b4083eb22f` |
| SVG | `ARTE/iconos/c11_acciones/12_tarjeta.svg` | `fca390145972cd280f146344b17f932606bcf644efec319ed913852aee3e6cd6` |
| SVG | `ARTE/iconos/c12_logros/01_primer_viaje.svg` | `cd5794dc33ca45ff47166a794a62b1e0de7d35f74009f0ceb08b9cb3b79d1b62` |
| SVG | `ARTE/iconos/c12_logros/02_frenada_precisa.svg` | `987ffbed012b1e3e65ffc0dc1633f5af2faff337ada953d85b3f2c5440bd55d4` |
| SVG | `ARTE/iconos/c12_logros/03_mano_firme.svg` | `09f4aba7640efd4d30fb5a683852a122af7825f38f62d22d06c1c4d804be9a2d` |
| SVG | `ARTE/iconos/c12_logros/04_punta_a_punta.svg` | `a768b7a98ceece6f322d382f9623f28fee7bcb6b830843a69d084199795e4754` |
| SVG | `ARTE/iconos/c12_logros/05_control.svg` | `6c4be08455c4a16c9c8e11a4981ab808134e666df457771635db255c1256426d` |
| SVG | `ARTE/iconos/c12_logros/06_carril.svg` | `aabfb8fa892cac89e5e04b044922e2dc5adb7f1e52a40145bf68aa2f69d4db59` |
| SVG | `ARTE/iconos/c12_logros/07_ciudad_colgante.svg` | `79fc59ffc4fc159d56fd3f71709c100fbd7597684978e6623f087e55b3558452` |
| SVG | `ARTE/iconos/c12_logros/08_diez_de_diez.svg` | `d9bd8837d1c729c238d17f38a3376cbcbcf31544f3e6dca0fb1573beb9cf8514` |
| SVG | `ARTE/iconos/c12_logros/09_gerente.svg` | `06e5b96632611d6e857883bca759daa1c4aa150205e09e4e09d573ee952e66aa` |
| SVG | `ARTE/iconos/c12_logros/10_ultima_vuelta.svg` | `058ca1171b6a3edfb00dc6940a557469c39deedaba115b76389743d0dd6a479a` |
| SVG | `ARTE/iconos/c12_logros/11_enciclopedia.svg` | `74f9de5b0894a2d48fd5ba7cc3e59d92ce5089562f3a4230814a21c682f05232` |
| SVG | `ARTE/iconos/c12_logros/12_turno_noche.svg` | `d4f39884e774e9b914117b8ae0c49e970640fa8caf48b94641ad1ed989b71a62` |
| SVG | `ARTE/iconos/c12_logros/13_madrugada.svg` | `5b4681ed9ffc6b86d911fec0fe339e705e70b1cbda2ba4f1e80afee687fe99b9` |
| SVG | `ARTE/iconos/c12_logros/14_duelo.svg` | `5d976d1594f44f0561c5d442295e411703cc751217c8f0a62a22f71d50827f51` |
| SVG | `ARTE/iconos/c12_logros/15_en_red.svg` | `1d4712e77c7e4e8ac66f1e66a37400c00bd6925f591684dd4aaf049d0efa300c` |
| SVG | `ARTE/iconos/c12_logros/16_costumbre.svg` | `ef36dba7d52f7c9669b2e6c9b253d389af46865592ad50049d2e06b44b7d3a18` |
| SVG | `ARTE/iconos/c12_logros/17_bolsillo_lleno.svg` | `c3ee7a26061a7d1a80564fb84d0624be1cff324e42be80508df0c555faed55db` |
| SVG | `ARTE/iconos/c12_logros/18_ni_una_gota.svg` | `c0b08c8f022cab8bc2621a48e0f0eecd704453ee2dedba2ee8895242736a8b64` |
| SVG | `ARTE/iconos/c12_logros/19_feria_flores.svg` | `f3680106bcb923e51ad9b81d09fb794a272a1eba2e8d4ff650d19978e300b3d4` |
| SVG | `ARTE/iconos/c12_logros/20_alumbrados.svg` | `4a59a77e5296b527607274792828e3d9a07b4648d42033df0ea2843d9dee7ed7` |
| SVG | `ARTE/portadas/clave_carga.svg` | `3b45e8e9ccdbcaa1603f7429aef0248cb7f84e8fd01439e2ca3259c7691d363b` |
| SVG | `ARTE/portadas/clave_portada.svg` | `88239467c4f6778766274deda55bee42fb2bec2fd72b6f6ab08d429b2ddd5506` |
| SVG | `ARTE/senalizacion/flecha_derecha.svg` | `c73e1bcf711daf7fa8d560c54fc76baa6dbc34fe64f09cbb8041bf500e84742d` |
| SVG | `ARTE/senalizacion/flecha_izquierda.svg` | `0e37328909b160f2028ffad48b658ecff71a319430e804db30daedfbd588f34c` |
| SVG | `ARTE/senalizacion/linea_amarilla.svg` | `a84617ddca0f8cda1ca962b5420cbac52425e653e05f513ee40f64c61bbe460e` |
| SVG | `ARTE/senalizacion/panel_led.svg` | `b22f509af76f1747201c746ffd9f541e52bf369d6dd71e13a338928c7ba9a0c1` |
| SVG | `ARTE/senalizacion/placa_a.svg` | `b1e0aacb1389ff5544a71e7220693d7a339c628b7a1ee6eb4c1337c0c48b22a5` |
| SVG | `ARTE/senalizacion/placa_b.svg` | `08172be3e673b6b4ee2f437b3e8b6d886fdf9cd34033db5550b8fc7802c32d54` |
| SVG | `ARTE/senalizacion/placa_h.svg` | `dfb31b120fb0adf65722c0b4cb4db8f7a3b29aa4158aa60e219006fb0bf1f94d` |
| SVG | `ARTE/senalizacion/placa_j.svg` | `ffa60a0b4b9fa5f92f8bd2c4c807e0d390f6d96423b6efbb62cd699ff725ceee` |
| SVG | `ARTE/senalizacion/placa_k.svg` | `e76027e9c262afab92eac8372681a7509318fc03486e992894d7cec752d3ca79` |
| SVG | `ARTE/senalizacion/placa_l.svg` | `ab8caa35a7f7e736b92637d7e7c894a5d04274c69fc8443006fb62f4b622d89e` |
| SVG | `ARTE/senalizacion/placa_m.svg` | `f69d6cef90193ef933c04d23d8ad08cd36aa98b4f1bda81e514bd40e2a9b666a` |
| SVG | `ARTE/senalizacion/placa_metroplus1.svg` | `8ee2b35528c5a9595fd430a8982da1c81a327ba6f697dd656c3b6c15c2c186b1` |
| SVG | `ARTE/senalizacion/placa_metroplus2.svg` | `f3ce1338ced49337969ff4310043e4d31a53adf7ecf5957f86dbc2ea88c8be96` |
| SVG | `ARTE/senalizacion/placa_p.svg` | `1ee1d55efb865293587ef7623b85de67d965b020143e3a8e44b6b0d2a91b4408` |
| SVG | `ARTE/senalizacion/placa_t.svg` | `3eb4838e9adeb4d9c3675fb86058064e98690fd93fa711a3c042d24262f90435` |
| SVG | `ARTE/senalizacion/torniquete.svg` | `2d2115374d8b8ec70d9edd71ec83da14dbfdd8d9efcff5985883fa487af0d851` |
| PY | `ARTE/documentacion/build_metro_complete_document.py` | `808e2566b4e1a9aafefac68a5ff9c53e8fafe7200c13856d64e21b085e0d4d90` |
| PY | `ARTE/documentacion/build_metro_remaining.py` | `9518315bd0fa42cc388a2d3fcd64df991f2f14db7465c57a921282fabc585cf3` |
| PY | `ARTE/documentacion/build_metro_scenes.py` | `b05b3022e9a12570d847b0ef9fa0563b869037a0bc94404f0f3d3e66a000870c` |
| PY | `ARTE/documentacion/fix_metro_atlases.py` | `f2d9586dbedce6124161aaf3359f288b4d47d55c36eb607ff927a150a0b9b0e2` |
| PY | `ARTE/documentacion/make_metro_final_pdf.py` | `bd7512b05993bc7e0d7bb36b36afa9d1c1ee8f48a457c1295bd64cd948aa376a` |
| PY | `ARTE/documentacion/qa_metro_final.py` | `69ad2e26894faf9f317857aef796e0133164b1a59df8a14c9a94b98436085308` |
| PY | `ARTE/documentacion/quantize_metro_scenes.py` | `402cbc1d40f7ef90ac9ff5a78a985bd4746fb54659df5a053a692ba7af7cdb6d` |
| PY | `ARTE/documentacion/test_metro_final_document.py` | `5796f0e36ecb1702595425c718c486b017fc11d077a6f10d46fa161c5b76ecbf` |
| JSON | `ARTE/documentacion/manifest_art.json` | `c2da404858a807aec9d16d84d66d99882d422b2a87c230aa69c993824b62bc2a` |
| JSON | `ARTE/documentacion/manifest_fiestas.json` | `c0eadf25924f94156f356c7ae6cb1ba144ff62c084e48a201a5527caf236edfd` |
| JSON | `ARTE/documentacion/manifest_maestro.json` | `9135561ec153aa327800dcc60e643242eac5f1c676ad71d75be42546a18d1444` |
| JSON | `ARTE/documentacion/manifest_vehiculos.json` | `2cf25676716998f3fd805fd4504cc348dbeb8941a7dd3269a1ab77706b03d03d` |
| JSON | `ARTE/documentacion/qa_art.json` | `e05a941bc85811b08290bfad06ee865503c392a2d8ad19e6a4ca78debea4a412` |
| JSON | `ARTE/documentacion/qa_final.json` | `d540206e3403a3bfd0124235cf6d3896d7a3368bd98f2887c76d4b1bcfe34fdd` |
| JSON | `ARTE/documentacion/qa_vehiculos.json` | `bc63bdae15e4c295fbd056eb439a1ff879a5f28eb8d224fe787b12bde58a06fd` |
| JSON | `ARTE/historico/c10_primera_version/manifest.json` | `fd1fde50a0a517fac50b892f2c4f4141ddd8dec3a724d53bdbb9b0e1628c1441` |
| JSON | `ARTE/vehiculos/atlas_layout.json` | `fd4c74bd8a9c2d3af32273c4a8709f2e6a8b3f1285d9f1f1872ad5e342bbab77` |

---


---

> **Nota del repositorio (Claude Code, 17-nov-2026).** Este archivo conserva solo la parte nueva del documento maestro de ChatGPT (líneas 1–594).
> - El **Anexo A** era una copia íntegra de `EL-METRO-TODO.md` v0.5.0 (nuestro documento único); no se duplica aquí.
> - Los **Anexos B, C y D** (92 SVG, 8 scripts Python, 9 manifiestos JSON) se extrajeron como archivos en `svg/`, `scripts/` y `manifiestos/`.
> - El **Anexo E** (auditoría del servidor local y su parche) está en `docs/auditorias/2026-11-17-servidor-local.md`, con la verificación y la corrección aplicada.
> - Los PNG del ZIP maestro no llegaron. Se recuperaron: los SVG (se renderizan con `node tools/arte-juego.mjs`), los vehículos (el script `build_metro_remaining.py` los regenera idénticos byte a byte: 31 de 33) y miniaturas de 183 px de las texturas (C-60).
