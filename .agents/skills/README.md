# Skills del proyecto *El Metro*

Las **skills** son carpetas con un `SKILL.md` (instrucciones y, a veces, scripts). Siguen el formato abierto **Agent Skills** ([agentskills.io](https://agentskills.io/specification)), que leen Claude, Codex de ChatGPT, Antigravity y Gemini CLI. Cada agente carga una skill cuando la tarea coincide con su descripción.

## Dónde las lee cada IA
| IA | Carpeta |
|---|---|
| **Claude Code** | `.claude/skills/` (copia automática con `node tools/skills.mjs`) |
| **ChatGPT Codex** (“astra”) | `.agents/skills/`, la carpeta común. Algunas versiones usan `.codex/skills/` *(verificar en la documentación de Codex)* |
| **Gemini Antigravity** (“argon”) y Gemini CLI | `.agents/skills/` del espacio de trabajo. La documentación oficial de Antigravity la indica para skills de proyecto; la ruta global cambia según la versión |
| **Gemini (Nano Banana)** y **ChatGPT** como generadores de imágenes | No leen carpetas. Sube `arte/SKILLS-IA.md` (y `arte/CONTEXTO-IA.md`) como conocimiento de un **Gem** o como archivo de un **Proyecto** |

## Skills instaladas
| Skill | Para qué | Quién la usa | Origen y licencia |
|---|---|---|---|
| **el-metro-desarrollo** | Estructura del código, compilar, probar (100 partidas), capturas, APK, publicar y bitácora | Agentes de código (Claude, Codex, Antigravity) | Propia del proyecto |
| **el-metro-arte** | Dirección de arte, paletas, vistas, reparto G‑ y C‑, revisión e integración de imágenes | Todas las IA (las de imágenes, vía `SKILLS-IA.md`) | Propia del proyecto |
| **medellin-fiel** | Topografía, relieve, estructuras y vista isométrica 2:1 (Fase 1b) | Agentes de código; Gemini para el repintado G‑100 | Propia del proyecto |
| **frontend-design** | Dirección visual de interfaces: tipografía, jerarquía, evitar diseños genéricos (menús, HUD, guía) | Agentes de código | [anthropics/skills](https://github.com/anthropics/skills) · Apache‑2.0 (`LICENSE.txt` en la carpeta) |
| **webapp-testing** | Probar aplicaciones web con Playwright: capturas, consola, DOM (complementa `tools/test.mjs`) | Agentes de código | anthropics/skills · Apache‑2.0 |
| **skill-creator** | Crear, mejorar y evaluar skills nuevas del proyecto | Agentes de código | anthropics/skills · Apache‑2.0 |

Versión de anthropics/skills copiada: commit `e4bb5d9` (16 nov 2026).

> **Nota sobre `frontend-design`:** marca como “cliché” el fondo crema con acento terracota. En *El Metro*, el papel crema `#f1ece0` es **decisión del autor** (revista EMSAY). Se mantiene, con los colores de las líneas del Metro como acentos (ver `el-metro-arte`).

## Recomendadas, no instaladas aquí
**Plugins de Claude** que el autor puede activar en su cuenta:

| Plugin | Para qué |
|---|---|
| **image-generation** | Guía de prompts para Gemini Image y GPT Image; sirve para mejorar los encargos G‑ y C‑ |
| **frontend-design** | La misma skill de arriba, para usarla en cualquier proyecto |
| **playwright** (Microsoft) | Manejar el navegador de forma interactiva |
| **Android Emulator QA** | Probar la APK en un emulador del PC |
| **Unity** | Solo si algún día el juego pasa a Unity: sprites pixel‑perfect, atlas, mosaicos |

**Skills oficiales que no se copiaron:**
- **canvas-design** pesa 5,6 MB por sus fuentes.
- **algorithmic-art** usa p5.js, que el juego no lleva.

Ambas están en anthropics/skills si se necesitan.

## Mantenimiento
- Las skills propias se editan **solo** en `.agents/skills/`.
- Después se corre `node tools/skills.mjs`, que copia todo a `.claude/skills/` y regenera `arte/SKILLS-IA.md`.
- Al cambiar una regla del proyecto, actualiza la skill correspondiente y la bitácora.
