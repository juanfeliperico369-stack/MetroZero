# La próxima revolución de El Metro (hacia v1.0)

**Fecha:** 17‑nov‑2026. **Punto de partida:** v0.10.0.

**Fuentes del plan:**
- la auditoría propia (`docs/auditorias/2026-11-17-auditoria-juego-y-mapa.md`);
- la auditoría de Juega EnCicla v1.2 (`docs/auditorias/2026-11-17-auditoria-encicla-v1.2.md`), el juego hermano que comparte la misma cuadrícula del valle.

## La idea en una frase
Pasar de “muchos modos sobre un mapa” a **un día real en el Valle de Aburrá**, contado por la gente que hace andar el Metro:
- con sus horarios, sus oficios y sus fiestas;
- sobre un mapa que se reconoce calle por calle;
- y con EnCicla como vecino.

## Lo que EnCicla enseña (y por qué funciona allá)
1. **Oficios con turnos reales.** Dan estructura: cada turno tiene hora, lugar, metas y una historia corta. El Metro ya tiene los modos; le falta amarrarlos a la **persona** y a la **hora**.
2. **Calendario real.** El juego “sabe qué día es”: festivos, ciclovía y fiestas que cambian el mapa. El Metro ya lo adoptó en v0.10.0.
3. **Calles como vectores.** Las circulares de Laureles se reconocen porque se dibujan como líneas con su ancho, no como casillas de 20 m.
4. **Pruebas que miden el mapa:** estaciones alcanzables, camión que llega a todas y CPU 4 veces más lenta.

## Siete pilares
| # | Pilar | Qué es | Meta medible |
|---|---|---|---|
| 1 | **El día del Metro** | Ciudad Libre con reloj de 24 h: primer tren a las 4:30 (5:00 domingos y festivos), hora pico, último tren, Alumbrados de noche | El servicio coincide con el horario oficial; la prueba revisa 6 fechas y horas |
| 2 | **Oficios del Metro** | Conductor de tren, operador del Puesto de Control, operador de cable, conductor de tranvía, de Metroplús y de alimentador, mantenimiento de vía de madrugada, taquilla y Cívica, gestor de Cultura Metro. Cada oficio con 2 o 3 turnos reales | 9 oficios × 3 turnos; cada turno con hora, lugar y meta |
| 3 | **La historia que sigue** | Sesión 2 de “La última vuelta”: Alumbrados, cable Arví, línea J y Comuna 13, Metro de la 80. Cruces con “Un día del valle” de EnCicla: Rosalba y Santi se conocen en Floresta | 6 capítulos nuevos, jugables en el mapa |
| 4 | **Mapa vectorial** | Calles como vectores sobre la cuadrícula: ancho real, curvas, glorietas y nombres. Huellas de edificios en el centro y El Poblado. Maqueta 2:1 en Ciudad Libre | Laureles, Floresta, Estadio, Centro, Santo Domingo, El Poblado, Bello y Envigado, reconocibles en capturas de referencia comparadas versión a versión |
| 5 | **Valle común con EnCicla** | Un solo paquete de datos para los dos juegos: casillas, relieve corregido, barrios, nombres, estaciones del Metro y de EnCicla | Cada mejora del mapa se aplica en los dos juegos con la misma herramienta |
| 6 | **Técnica sólida** | Trozos del mapa en un Web Worker; registro de ganchos en vez de envolturas; guardado con esquema y migraciones; prueba de memoria tras 30 minutos | 0 cuadros de más de 50 ms al arrancar; ≤ 32 MB de imagen en calidad baja |
| 7 | **Para todo el mundo** | Modo tranquilo (sin reloj), menos movimiento, letra grande, alto contraste y avisos para lector de pantalla (ya están los avisos) | Botones ≥ 44 px, letra ≥ 12 px y contraste ≥ 4,5:1 en todas las pantallas |

## Fases
| Versión | Contenido |
|---|---|
| **v0.11** | Mapa: quebradas a su tamaño (hilo dentro de un retiro verde, con las cubiertas bajo la calle). Medallas C‑12 nº 21 y 22 (de ChatGPT). Pantalla “Hoy”: siguiente capítulo, misiones, fiesta y horario del Metro en una sola tarjeta. Trozos en un Web Worker |
| **v0.12** | Pilar 1 completo: el reloj de 24 h en Ciudad Libre manda sobre trenes, buses y cables, con el último tren y el primero. “Direcciones paisas” y “Placas de lo poco conocido”: las 3 primeras son la quebrada bajo La Playa, los talleres del Ferrocarril y la nomenclatura |
| **v0.13** | Pilar 2: los primeros 4 oficios (Puesto de Control, mantenimiento de vía, taquilla y Cívica, Cultura Metro) con turnos reales |
| **v0.14** | Pilar 4: calles vectoriales (de `vias.bin` de EnCicla o de la malla vial oficial con su ancho), glorietas, huellas de edificios en el centro y El Poblado |
| **v1.0** | Pilar 3 (historia, sesión 2), los oficios restantes, valle común con EnCicla, firma de publicación fuera del repositorio y ficha de Play Store |

## Decisiones del autor
1. **Peso.**
   - Hoy el HTML pesa 2,9 MB.
   - Las calles vectoriales y las huellas de edificios pueden sumar 1 a 2 MB.
   - ¿Se acepta, o se cargan por zonas?
2. **Valle común:** ¿un repositorio de datos compartido por los dos juegos, o que cada juego copie del otro con su herramienta, como ahora?
3. **Firma de la APK:** sacar la llave del repositorio impide actualizar las APK ya instaladas. Hay que decidirlo antes de Play Store.
4. **Festivos en EnCicla:** la página oficial dice que no presta. Hoy los dos juegos los tratan como domingo, por decisión del autor.
