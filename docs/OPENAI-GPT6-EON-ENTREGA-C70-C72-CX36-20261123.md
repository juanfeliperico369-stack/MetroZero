# OpenAI GPT-6 · Eón — entrega C-70 / C-71 / C-72 y CX-36

**Fecha:** 23 de noviembre de 2026  
**Repositorio:** `juanfeliperico369-stack/MetroZero`  
**Rama exclusiva:** `ia/codex/eon-optimizacion-3.7`  
**Firma:** OpenAI GPT-6 · Eón (Artista 2 / colaborador de código).

## 1. Contexto de esta entrega

El encargo cita la versión **3.6.0** y `docs/PEDIDOS-GEMINI-CHATGPT-3.6.md`, pero el `main` que se comprobó durante la intervención declara **3.5.0** en `src/js/00-core.js`; los archivos `docs/PEDIDOS-GEMINI-CHATGPT-3.6.md`, `tools/medir-3d.mjs` y `tools/auditoria-jugabilidad.mjs` **no existen** en ese árbol. La referencia `ccr-2a67f935-oat714` aparece en la bitácora como sesión de Claude, no se verificó como SHA/branch de Git. Se tomó como base el `main` verificado, sin modificar `main` ni otros repositorios.

## 2. Arte original publicado en PNG

Ruta: `arte/entregas/vectorial/png/`. Las 14 imágenes están guardadas de manera independiente y tienen nombres exactos; los íconos usan **PNG 256 × 256** con canal alfa y paleta indizada.

| Familia | Archivo | Concepto |
|---|---|---|
| C-70 | `ico_reto.png` | Calendario y estrella |
| C-70 | `ico_zen.png` | Amanecer y franja verde |
| C-70 | `ico_medir.png` | Velocímetro apuntando hacia la derecha |
| C-70 | `ico_skate.png` | Patineta superando una baranda |
| C-70 | `ico_ciclovia.png` | Bicicleta en franja verde |
| C-71 | `logro_racha7.png` | Medalla de constancia y siete marcas |
| C-71 | `logro_combo8.png` | Medalla de patineta y ocho marcas |
| C-71 | `logro_zen.png` | Medalla del amanecer |
| C-71 | `logro_intermodal.png` | Medalla de transporte combinado |
| C-71 | `logro_ciclista.png` | Medalla del anclaje de bicicleta |
| C-71 | `ico_modo_carrera.png` | Corredor sobre vía verde |
| C-71 | `ico_modo_tranvia.png` | Tranvía verde |
| C-72 | `portada_36_vertical.png` | Ciudad al atardecer, 1080 × 1920 |
| C-72 | `portada_36_horizontal.png` | Ciudad al atardecer, 1920 × 1080 |

Las portadas son composiciones **procedurales** de formas planas: panorámica al atardecer, laderas, edificaciones, cable, gente, ciclorruta y encuadre de vagón. No son fotografías ni capturas del juego. Paleta: `#f1ece0`, `#154a80`, `#1C5C9C`, `#E38835`, `#59AB42`, `#F6C538`, `#EC343A`; fondo transparente en los iconos, sin logos ni texto. **No se han sustituido aún los recursos que usa Atlas**, ya que el protocolo requiere receta en `tools/arte_juego.py`, respaldo procedural y comprobación de integración. Son recursos preparados para revisión y selección del autor.

## 3. Código añadido sin reemplazar módulos principales

1. `src/js/22a-gpt6-eon-3d-batch.js`: combina las cajas dinámicas `G3.box` en un búfer GPU reutilizable por cuadro, con transformación de vértices y normales. Conserva dibujo previo fuera del ciclo y métricas de lote en `G3._eonBatchStats`. **No implementa todavía recorte por celdas** de `G3.bld` y `G3.far`.
2. `src/js/48a-gpt6-eon-fantasma.js`: instrumenta `conduce`, `bus` y `carrera` con muestras interpoladas cada 0,1 segundos y cuantización a 0,1 m; registra la mejor duración del día por ruta en `Save.d.best._retoFantasma` (dentro del esquema v1), accesible en `EM.reto.fantasma`. Superposición de distancia al fantasma y marcador translúcido en pantalla 3D. El QR de `src/js/05-qr.js` **comparte la marca**, no el trazado completo.
3. `src/js/48-operacion.js`: modo `operacion` con estaciones y vínculos de NET, demanda por hora, picos de mañana/tarde, flota, saturación, refuerzos, mejoras entre jornadas, 7 jornadas y piloto `ai`. Inicio a las 4:30 a. m. y cierre a las 11 p. m.; utiliza el contrato `Game`.
4. `src/js/97c-gpt6-eon-operacion-estaciones.js`: ofrece 🎮 «Un día de operación» desde el menú de actividades de estaciones sin reemplazar los demás modos.

**Regla del guardado:** no se cambió la clave `elmetro.v1` ni `newSave()`; el registro de fantasmas vive en `Save.d.best`, que ya tiene un valor predeterminado. Por seguridad se limita a seis récords del calendario y 36 000 cuadros de trayectoria (una hora).

## 4. Pruebas y cifras que se pueden sostener

| Prueba | Resultado |
|---|---|
| `node --check` de módulos nuevos en copia aislada | PASS |
| `node tools/test-gpt6-eon-3d-batch.mjs` | PASS: **3 cajas → 1 draw call** en mock de GPU, colores y reutilización |
| `node tools/test-gpt6-eon-fantasma.mjs` | PASS: tres modos, muestreo 0,1 s, error interpolado sintético **< 0,11 m** |
| `node tools/test-gpt6-eon-operacion.mjs` | PASS: bot acaba, hora pico, refuerzo, mejora, estado |
| `node tools/build.mjs && node tools/test.mjs 100` | **No ejecutado contra árbol completo**; repositorio completo no disponible en runtime local |
| `node tools/medir-3d.mjs` / `node tools/auditoria-jugabilidad.mjs` | **No ejecutables:** esos archivos no estaban en la base inspeccionada |
| 3p ≥12 FPS, 400 000 vértices, 120 llamadas, sin cambios antes de 700 m | **No medido/no certificado**; no se afirma cumplimiento |

Las pruebas aisladas evalúan contratos y matemáticas, **no** son sustituto de jugar el juego en Chromium y Android. No se atribuyen benchmarks inventados a las IA.

## 5. Protocolo AGENTS.md — cuestionario resuelto

1. Misión: conocer y cuidar Medellín y su Metro mediante un juego familiar, fiel y liviano.  
2. Encargos G: Gemini, salvo complejos redistribuidos; encargos C: ChatGPT Artista 2; código pesado: Codex. En este encargo el autor solicitó ambos.  
3. Línea A: **#1C5C9C**; Metroplús 1: **#0E6F76**.  
4. Sin transparencia se emplea magenta plano **#FF00FF**.  
5. Luz arriba izquierda y sin sombra proyectada, porque las sombras las resuelve el juego.  
6. Vehículos cenitales a 8 px/m, mirando a la derecha.  
7. Prohibidos texto, logos, marcas de agua y contenido ajeno al público familiar, salvo excepción escrita.  
8. Dimétrica 2:1: dos unidades horizontales por cada vertical, para la maqueta isométrica de ciudad.  
9. Rosalba: conductora mayor, pelo canoso recogido, uniforme azul, pañoleta y termo.  
10. G-00 establece ancla común; la prueba de ChatGPT es C-10 para validar legibilidad.  
11. `el-metro-arte` para arte; `medellin-fiel` en mapa/isometría; `el-metro-desarrollo` para código.  
12. Compilación: `node tools/build.mjs`; prueba: `node tools/test.mjs 100`; documento único: `node tools/todo.mjs`; registrar `docs/BITACORA.md`.  
13. Si el encargo es de otro rol, transferirlo y no invadirlo; aquí el autor autorizó explícitamente ambos papeles.

## 6. Reglas aprendidas para incorporar a las instrucciones del Proyecto «El Metro · Arte»

- Publicar **un PNG con el nombre exacto** por recurso, no solo mostrar una imagen en el chat.
- Para iconos C-70/C-71, medir **256 × 256** reales y revisar una miniatura a 48 px.
- Mantener contrastes altos, máximo siete colores de esta paleta, siluetas gruesas y opacidad fuera del fondo transparente.
- No confundir una portada con un ícono ni usar una misma composición para orientaciones 9:16 y 16:9.
- La imagen nueva no pasa a ser recurso activo hasta tener receta de integración, respaldo procedural y aprobación del inventario.
- Para código, no presentar un PASS de VM mock como medición WebGL real ni afirmar 3.7 terminada sin compilar, jugar y medir.

**No es posible modificar las instrucciones del Proyecto personal del usuario desde este repositorio.** Este bloque deja las reglas listas para que el autor las incorpore.

## 7. Próximo relevo recomendado

Ejecutar build/test100 y verificar visualmente los 14 PNG, corregir detalle del arte según revisión; aplicar recorte por celdas con geometría existente, medir WebGL real antes/después y alcanzar límites de la tarea CX-36-1; validar el fantasma en 3D y altura real de viaductos, añadir QR de trazado/importación si se quiere compartir un oponente; validar «Operación» en Chromium/Android, su ciclo de jornadas y su acceso desde cada estación; integrar portada e iconos al Atlas y compilar documento único. Registrar datos objetivos en bitácora antes de fusionar.

**Firma técnica y artística: OpenAI GPT-6 · Eón — 23/11/2026.**
