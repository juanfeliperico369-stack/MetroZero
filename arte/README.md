# Carpeta de arte · *El Metro*

Investigación visual y guía de producción para llevar *El Metro* a un **mundo abierto + arcade** con arte de verdad. Sirve a cualquier persona o IA que haga arte para el juego.

| Archivo | Qué contiene |
|---|---|
| [`00-biblia-de-estilo.md`](00-biblia-de-estilo.md) | **Reglas visuales**: paletas HEX, luz, vistas, escalas, tamaños de entrega, personajes, qué sí y qué no, lista de control |
| [`01-referencias-videojuegos.md`](01-referencias-videojuegos.md) | **32 referencias** analizadas (estilo, paleta, cámara, interfaz, mecánicas y qué tomamos): GTA 1/2/London/Chinatown Wars, Reckless Getaway 1 y 2, NFS, Forza Horizon, FR Legends, #DRIVE, PAKO Forever, Super Arcade Racing, APEX Racer, simulador de vuelo, Missiles!, 1945 Air Force, Tiny Rails, Infinity Games (Railways, Traffix, Package Inc, Infinity Loop, Laser, Laberinto), Grand Mountain Adventure, Alto's Odyssey, Townscaper, Town Brush, CityRT, Josh White, los 4 reels (Holstin, carreras cinematográficas, Cairn, conducción realista) y las referencias propias del autor; nombres verificados en la Play Store |
| [`02-medellin-visual.md`](02-medellin-visual.md) | Identidad visual de Medellín y de su sistema de transporte: geografía, ladrillo, laderas, metro, cables, tranvía, Metroplús, alimentadores, luz por hora |
| [`03-historia-metro-y-medellin.md`](03-historia-metro-y-medellin.md) | Cronología del Metro (1995–hoy, con fuentes), historia de la ciudad e ideas para el juego |
| [`04-folklore-y-fiestas.md`](04-folklore-y-fiestas.md) | Fiestas, mitos, arriería, música, comida, habla paisa, **calendario del juego** y paletas culturales |
| [`05-diseno-mundo-abierto-arcade.md`](05-diseno-mundo-abierto-arcade.md) | **Diseño del juego**: fantasía, mundo, bucles, cámaras, capa arcade, eventos en el mundo, progresión e integración al código |
| [`06-guia-unica-ia.md`](06-guia-unica-ia.md) | **GUÍA ÚNICA DE PROMPTS para Gemini Nano Banana y ChatGPT**: misión, visión, estado y contexto completo para las dos IA; el rol de cada una (solo hace su parte); encargos G‑ y C‑; correcciones; entrega; y la **bitácora del juego como anexo** |
| [`SKILLS-IA.md`](SKILLS-IA.md) | **Skills del proyecto** (formato SKILL.md): índice y skills propias (`el-metro-arte`, `medellin-fiel`, `el-metro-desarrollo`), para subir a un Gem o a un Proyecto. Los agentes de código las leen en `.agents/skills/` y `.claude/skills/`. Las genera `node tools/skills.mjs` |
| [`CONTEXTO-IA.md`](CONTEXTO-IA.md) | Contexto completo más la bitácora en **un solo archivo**, para subir como conocimiento a un Gem de Gemini o a un Proyecto de ChatGPT. Lo genera `node tools/arte.mjs` |
| [`08-entregas-e-integracion.md`](08-entregas-e-integracion.md) | Orden de producción, carpetas, nombres, cómo entregar y cómo se integra |
| [`index.html`](index.html) (Galería) · [`galeria.md`](galeria.md) · `galeria.json` | **71 fotos de referencia con licencia libre** (metro, cables, tranvía, buses, ciudad, fiestas y cultura), con autor y licencia. Se enlazan, no se copiaron |

**Antes que nada:** toda IA sigue el [`PROTOCOLO-IA.md`](PROTOCOLO-IA.md):
1. leer todo;
2. reflexionar;
3. responder el cuestionario;
4. probar;
5. auto‑ajustarse;
6. hacer solo su parte;
7. entregar y registrar.

**Documento único para IA:** `node tools/todo.mjs` compila `dist/EL-METRO-TODO.md`, con todo y el código fuente del juego.

**Todo en un archivo:** `node tools/todo.mjs` genera `dist/El-Metro-TODO.html`, con el juego jugable adentro, todos estos documentos y las descargas de `TODO.md`, `CONTEXTO-IA.md` y `SKILLS-IA.md`. Está publicado en GitHub Pages.

**Flujo:**
1. Leer la biblia.
2. Hacer el ancla de estilo en Gemini.
3. Producir con la guía única (06): cada IA (Gemini y ChatGPT) recibe el contexto completo y su rol.
4. Entregar según la guía 08.
5. Yo lo integro, lo pruebo y lo publico.
