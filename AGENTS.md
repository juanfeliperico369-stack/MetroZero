# AGENTS.md · El Metro

> Instrucciones para **agentes de código**: Codex de ChatGPT (“astra”), Antigravity y Gemini CLI (“argon”), Claude Code, Cursor y otros. **Archivo generado** por `node tools/todo.mjs` a partir de `arte/PROTOCOLO-IA.md`. No lo edites a mano: edita el protocolo y vuelve a compilar.

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

## Qué leer en este repositorio (paso 1 del protocolo)
| Archivo | Qué es |
|---|---|
| `docs/BITACORA.md` | Estado, historial y pendientes |
| `docs/PLAN.md` | Fases, incluida la 1b: Medellín fiel e isométrica |
| `arte/06-guia-unica-ia.md` | Contexto, roles, encargos y skills |
| `arte/README.md` | Índice de la carpeta de arte |
| `.agents/skills/` y `.claude/skills/` | Skills `el-metro-desarrollo`, `el-metro-arte`, `medellin-fiel`, `frontend-design`, `webapp-testing`, `skill-creator` |

**Todo junto, con el código:** `node tools/todo.mjs` genera:
- `dist/EL-METRO-TODO.md`: el documento único;
- `dist/El-Metro-TODO.html`: el mismo contenido con el juego jugable adentro.

## Comandos esenciales
~~~~bash
node tools/build.mjs        # compila dist/index.html (un solo HTML)
node tools/test.mjs 100     # autotest + 100 partidas + pantallas: debe dar 0 errores
node tools/todo.mjs         # documento único + archivo con todo + este archivo
~~~~

## Reglas del proyecto
- Un solo HTML, sin librerías externas ni internet en el juego.
- Celulares modestos.
- Español y todo público.
- El arte nuevo siempre va con respaldo procedural.
- No romper el guardado (`elmetro.v1`).
- Las pruebas deben dar 0 errores.
- Actualiza `docs/BITACORA.md` al cerrar cada sesión.
