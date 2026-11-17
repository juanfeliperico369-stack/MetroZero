---
name: medellin-fiel
description: Fidelidad geográfica de Medellín en el videojuego "El Metro" (Fase 1b del plan). Cubre topografía y relieve, río, vías, viaducto y estaciones del metro, cables sobre las lomas, alturas de edificios, lugares icónicos y la vista isométrica dimétrica 2:1 (mosaicos base desde datos abiertos más repintado con IA). Úsala al tocar el mapa, el relieve, las vistas cenital, panorámica, 3D o isométrica, o al generar o repintar mosaicos de la ciudad.
---

# Medellín fiel e isométrica

## Objetivo
Que la topografía, el relieve, el río, las vías y las estructuras de Medellín sean **fieles**, y crear una **ciudad en miniatura en proyección dimétrica 2:1**, como los mapas de ciudades reales en pixel art. Hoy el juego tiene detalles mal diseñados:
- relieve suavizado (modelo de 80 m);
- laderas sin escalonamiento;
- viaducto y estaciones con alturas y formas aproximadas;
- cables que no siguen bien las lomas;
- alturas de edificios genéricas;
- lugares icónicos sin forma propia.

## Datos actuales del juego
- `src/data/valle.js`: casillas de 20 m con tipo de suelo (`TT.*`) y relieve de 80 m (`MAP.elevM`, `MAP.tileM`, `MAP.bHeight`), tomado de “Juega EnCicla” (OpenStreetMap + SRTM).
- `src/data/red.js`: líneas y estaciones; `NET` las convierte en recorridos (`NET.at(P, s)`).
- `src/data/rutas.js` (recorridos de buses, `tools/rutas.mjs`) y `src/data/lugares.js` (lugares con postal).

## Fuentes abiertas para mejorar
*(Verificar cobertura y licencia antes de usar.)*

| Fuente | Qué aporta | Licencia |
|---|---|---|
| **OpenStreetMap** | Calles, edificios, río, parques | ODbL; atribución “© OpenStreetMap contributors” |
| **Overture Maps** | Huellas de edificios (con datos de Microsoft y Google) y alturas cuando existen | CDLA o ODbL según la capa |
| **Google Open Buildings 2.5D Temporal** | Ráster de alturas desde satélite; tinyworlds lo calibra con edificios de pisos conocidos | CC BY 4.0 *(cobertura en Colombia sin verificar)* |
| **Copernicus GLO‑30** | Relieve de 30 m, mejor que los 80 m actuales | Libre con atribución |
| Datos de la Alcaldía de Medellín y el Área Metropolitana (MEData, GeoMedellín) | Posible modelo de terreno más fino, catastro, red vial | *(sin verificar)* |

**Prohibido:** usar imágenes de Google Maps o de Google Earth como base (sus términos lo restringen).

**Meta de datos compactos:** 1 byte de altura por casilla de 20 m, más el tipo de techo y la forma de los lugares icónicos. Todo comprimido y embebido; el juego genera las vistas en el celular.

## Proyección dimétrica 2:1
El “isométrico” de pixel art es **dimétrico 2:1**: por cada píxel hacia arriba, dos hacia el lado (unos 26,565°).

Con la convención del juego (metros; x al este, y al sur, z hacia arriba; `s` = píxeles por metro):
```
pantallaX = (x − y) · s
pantallaY = (x + y) · s / 2 − z · s · kz      (kz ≈ 0,8 a 1; ajústalo para que las alturas se vean naturales)
```
Se dibuja de atrás hacia adelante (orden por x + y), con caras visibles al sur y al este y luz desde arriba a la izquierda.

## Tubería
1. **Datos** (`tools/`): descargar y reducir las fuentes a la grilla de 20 m (alturas, techos), cambiar el relieve a 30 m y medir viaducto, estaciones y torres de cable.
2. **Escena real:** terreno; edificios con su altura; río canalizado; jerarquía vial (autopistas, la 80, Las Vegas, Las Palmas, Regional); viaducto con su altura; estaciones con cubierta, accesos y puentes; torres de cable con la curva del cable sobre el terreno. Lugares icónicos: Catedral, Coltejer, Nutibara con el Pueblito Paisa, El Volador, Biblioteca España, estadio y Olaya Herrera.
3. **Vista isométrica procedural** en el juego: nueva vista de Ciudad Libre y maqueta en La Red, generada en el celular desde los datos, con el pixel art del juego (enfoque tipo tinyworlds).
4. **Mosaicos base 2:1** de las zonas héroe (centro, estaciones, lugares icónicos) con la geometría real. **Gemini los repinta** (encargo G‑100) sin mover nada. El resto queda procedural para mantener el peso bajo.
5. **Corregir las otras vistas** con la misma escena:
   - cenital: alturas y sombras;
   - panorámica: perfiles de relieve de 30 m;
   - 3D: viaducto y estaciones medidos.
6. **Verificación:** comparar capturas con las fotos de `arte/galeria.md` y con el mapa, y llevar la lista de detalles corregidos en la bitácora.

## Referencias
- [Isometric Cities](https://isometriccities.com/): directorio y técnicas. Hay tres caminos:
  1. IA que repinta mosaicos;
  2. render por código desde datos abiertos;
  3. diorama 3D con cámara isométrica.
- Ciudades de ejemplo: [Isometric NYC](https://www.pcgamer.com/software/ai/software-engineer-creates-classic-simcity-style-map-of-nyc-and-argues-that-ai-is-good-for-creatives-actually/) (IA ajustada para repintar), [Tiny Barcelona](https://tiny-barcelona.agenturl.dev), [Tiny Madrid](https://tinymadrid.app), [Tiny València](https://tinyvalencia.com) (datos 3D del Catastro y el IGN repintados), [Isometric Málaga](https://isometric-malaga.xiangminf.com), [CDMX](https://cdmxisometrico.com), [Buenos Aires](https://caba.nicolaspoore.com).
- [tinyworlds](https://github.com/nihey/tinyworlds): sin IA. Toma OpenStreetMap y Overture Maps, hace un rasterizado por software y arma una pirámide de teselas. Una ciudad grande pesa unos 1,5 GB: por eso aquí se genera en el dispositivo.
