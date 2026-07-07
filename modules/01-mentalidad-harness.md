# Módulo 1 — Mentalidad de Harness

> **La pieza teórica que conecta el vocabulario del M0 con la metodología del M2.**
> Si el M0 te dio los nombres y el M2 te dará el método, este módulo te da el *por qué*: por qué los agentes capaces fallan, y por qué la palanca para arreglarlo no es el modelo, es el entorno que lo rodea.

---

## 1.0 La tesis: el agente no es el modelo

Hay una sola idea que, si la internalizas, cambia todo lo demás. La formuló Birgitta Böckeler (Thoughtworks) y se ha vuelto la definición operativa del campo:

> **Agent = Model + Harness**

- El **modelo** es el LLM: GPT, Claude, Gemini, DeepSeek. Lo eligió el proveedor, está congelado, no lo controlas.
- El **harness** es *todo lo demás*: el system prompt, el AGENTS.md, las tools disponibles, los permisos, el sandbox, los hooks, el CI, los review-agents, los scripts de inicialización, los context pointers. Eso lo diseñas tú.

La consecuencia práctica es enorme: **cuando un agente funciona mal, casi nunca es "el modelo es tonto"; es "el harness está mal".** Y como el harness es tuyo, lo puedes arreglar. Cambiar de modelo es esperar que el próximo release lo solucione por ti. Diseñar el harness es tomar el control hoy.

> Dos agentes con el **mismo modelo** y **distinto harness** pueden tener resultados radicalmente distintos. El harness es la palanca, no el modelo.

Esto también explica por qué "probe con Claude y no me dio bueno, Cursor sí" casi nunca es una comparación honesta de modelos: estás comparando dos harnesses que usan el mismo modelo de base, y atribuyendo al modelo lo que es mérito (o culpa) del harness.

---

## 1.1 Por qué los agentes capaces fallan

Los modelos de 2026 son extraordinariamente capaces. Y sin embargo, las sesiones reales se rompen con frecuencia. ¿Por qué? Porque la capacidad del modelo no es el cuello de botella. El cuello de botella es que el modelo es **no determinista, sin estado, con atención finita, operando sobre un contexto que se corrompe**.

La taxonomía de fallas más útil (del [Codex Knowledge Base](https://codex.danielvaughan.com/2026/06/03/coding-agent-failure-taxonomy-nist-style-classification-detection-codex-cli/), que verás a fondo en el M7) agrupa los modos de falla en cinco clases. Aquí los presento desde el ángulo del harness: **qué falló del entorno que permitió que el modelo se equivocara**.

| Clase de falla | % aprox. | Qué falla en el harness |
|----------------|----------|--------------------------|
| **Corrupción de contexto** | ~40% | El contexto creció sin control; no hay compactación proactiva, ni handoffs, ni aislamiento por subagentes. |
| **Mal uso de tools** | ~25% | El catálogo de tools es pobre o ambiguo; los schemas confunden; hay tools peligrosas sin restricciones. |
| **Degeneración de trayectoria** | ~15% | No hay verificación que frene los loops; el agente entra en *yak-shaving* y nadie lo detiene. |
| **Sandbox y seguridad** | ~10% | No hay aislamiento; permisos demasiado amplios; tools destructivas sin gate. |
| **Realización de acción** | ~10% | No hay enforcement del formato de salida; el agente reporta "tests pasan" sin haberlos corrido. |

> **El dato que manda todo:** ~40% de las fallas atribuidas al modelo son, en realidad, fallas de la capa de contexto. El modelo razona bien sobre el contexto que tiene; el problema es que el contexto que tiene está corrupto o incompleto. Eso es un problema de harness, no de modelo.

La conclusión: si tu única respuesta a "el agente se equivoca" es "pedírselo otra vez" o "cambiar de modelo", estás apuntando al síntoma. El harness es donde se gana o se pierde la confiabilidad.

---

## 1.2 Inner Harness vs. Outer Harness

No todo el harness es tuyo. Hay una división que conviene tener clara, porque te dice dónde invertir esfuerzo.

### Inner Harness (la controla el vendor)

Lo que viene embebido en la herramienta que usas (Cursor, Claude Code, Codex). No lo diseñaste, pero sí lo elegiste al elegir la herramienta.

| Cursor | Claude Code |
|--------|-------------|
| Modos Plan / Agent / Ask | Agente CLI corriendo en el shell |
| `.cursor/rules/*.mdc` con activación por glob | `CLAUDE.md` / `AGENTS.md` cargados desde la raíz |
| Indexado del codebase para retrieval | Razonamiento sobre el codebase completo |
| UI de diff edit-por-edit | Planificación multi-paso con todo lists |
| Background agents (sandboxes cloud) | Ediciones vía primitivas Unix |
| Model picker para rutear trabajo | Tests como operación de primera clase |
| Soporte MCP | Soporte MCP |

### Outer Harness (lo construyes tú)

Aquí es donde el esfuerzo de ingeniería *paga dividendos*. Y lo crucial: **la mayoría de esta capa es portable entre herramientas**.

1. **AGENTS.md** — la superficie de instrucciones universal, legible por varias herramientas.
2. **MCP servers** — work tracker, test runner, CI/CD, logs, GitHub. Funcionan en cualquier agente que soporte MCP.
3. **CI checks** — build, test, lint, tests estructurales, security scans.
4. **Pre-commit / pre-push hooks** — sensores rápidos y deterministas.
5. **Generadores de código** — scaffolding que produce la forma correcta de entrada.
6. **Skills de review-agent** — controles inferenciales apoyados en la salida computacional.

### La implicación estratégica

Invierte primero en la **capa portable** (AGENTS.md, MCP servers, CI, hooks, generadores). Esa inversión sobrevive a que cambies de herramienta. Las reglas específicas de un IDE (`.cursor/rules`) son la capa *barata y rápida* que se monta encima, pero no son tu ventaja competitiva: se las lleva el viento si migras de editor.

> Un test en CI es portabilidad pura. Una regla `.cursor/rules` es deuda con Cursor. Prioriza la primera.

---

## 1.3 El repositorio como system of record

Esta es la decisión de diseño más importante del harness, y la que más cuesta internalizar:

> **Todo lo que importa debe vivir en el filesystem, no en la conversación.**

Las razones son las tres que vimos en el M0:

1. **La conversación es efímera.** Se cierra y se evapora. Los archivos no.
2. **La conversación se degrada.** Entre más crece, peor atiende el modelo (smart zone → dumb zone). Los archivos se leen frescos cuando se necesitan.
3. **La conversación no es auditable ni diff-able.** No puedes ver "qué decidió el agente y cuándo" como ves un `git log`. Los archivos sí.

¿Qué significa en la práctica "el repo como system of record"? Significa que el estado del proyecto viaja por **artefactos de archivo**:

- La **intención** vive en `spec.md` (no en un mensaje del chat).
- El **progreso** vive en `claude-progress.md` y `state.json` (no en "lo que el agente recuerda").
- Las **reglas** viven en `AGENTS.md` (no en "lo que le pedí al principio").
- Las **verificaciones** viven en tests y CI (no en "parece que funciona").
- Las **decisiones de diseño** viven en `docs/decisions/` (no en "lo que discutimos el otro día").

> Si un dato existe en la conversación y no en un archivo, considera que no existe. Mañana no va a estar.

Esto es lo que GSD (M2) llama "el filesystem como base de datos del proyecto". No es una metáfora: es literalmente cómo sobrevive el estado entre sesiones y vence al context rot.

---

## 1.4 Guías vs. Sensores: feedforward y feedback

El harness controla al agente con dos tipos de mecanismos, inspirados en la teoría de control. Entender la diferencia te dice qué poner dónde.

### Guías (controles feedforward)
Orientan al agente **antes** de que actúe. Le dicen qué hacer y qué no hacer.

- `AGENTS.md` con reglas de estilo, comandos, gotchas.
- `.cursor/rules/components.mdc` que limita el tamaño de archivo o prohíbe `any`.
- Templates de spec que fuerzan marcadores `[NEEDS CLARIFICATION]`.
- Skills que describen un flujo paso a paso.

**Propiedad clave:** son *advisory*. El modelo puede no seguirlas. Por eso solas no alcanzan.

### Sensores (controles feedback)
Observan lo que el agente **hizo** y ayudan a corregir. Hay dos sub-tipos:

- **Computacionales (deterministas, baratos):** `tsc --noEmit`, ESLint, `dotnet build`, ArchUnitNET, mutation testing, schema-diff. Responden pas/fail sin opinión.
- **Inferenciales (basados en modelo, caros):** un review-agent que analiza el diff del PR, apoyado en la salida de los sensores computacionales.

**Propiedad clave:** los computacionales son *deterministas* — no dependen de que el modelo esté de buen humor. Por eso son la base confiable; los inferenciales se montan encima.

### El principio rector

> **Toda regla de texto que valga la pena conservar debería aspirar a convertirse en un check determinista o en un generador.**

Una regla que dice "usa el patrón repository" es *prosa frágil*: el modelo puede ignorarla. Un analizador que falla el build cuando no se usa es *enforcement*. Mejor aún: un generador que scaffoldea la forma correcta hace que el error sea **estructuralmente imposible**.

| Nivel de enforcement | Ejemplo | Confianza |
|----------------------|---------|-----------|
| Prosa en AGENTS.md | "usa el patrón repository" | Baja (advisory) |
| Regla scoped | `.claude/rules/` que carga solo con archivos del repo | Media |
| Check determinista | Linter / typecheck / test estructural | Alta |
| Generador | `dotnet new` / scaffolder que produce la forma correcta | Máxima (el error no puede ocurrir) |

La progresión natural es: empieza con la prosa, y cada vez que una regla se repita o se incumpla, *promuévela* un nivel hasta que sea determinista o generada.

---

## 1.5 La jerarquía de enforcement

Como Andrej Karpathy observó: *"los agentes no escuchan mis instrucciones"*. Hinchan abstracciones, copian y pegan, ignoran la guía de estilo. La respuesta no es rogarles mejor; es construir **tres capas de enforcement**, de la más débil a la más fuerte:

1. **Git hooks (mecánico, determinista)** — bloquean commits malos automáticamente. El agente no puede pasar por alto lo que el hook impide.
2. **`.claude/rules/` (advisory, scope-specific)** — cargan solo cuando son relevantes, sin contaminar el contexto global.
3. **`CLAUDE.md` / `AGENTS.md` (principios globales)** — el contrato base, siempre cargado, pero *advisory*.

> La jerarquía importa porque respeta el presupuesto de contexto (M0). Las reglas globales compiten por los ~150-200 slots de instrucción efectivos del modelo. Si metes todo ahí, la compliance degrada. Las reglas scoped entran solo cuando hace falta; las mecánicas ni siquiera necesitan contexto.

Un pre-commit saludable típicamente incluye: lint-staged, secret scanning, límite de tamaño de archivo (~300 líneas), colocation de tests, auto-generación de docs, drift detection. Cada uno es un sensor computacional que libera al AGENTS.md de tener que *pedir* lo que el hook ya *exige*.

---

## 1.6 El harness mínimo viable

¿Cuál es el harness más chico que ya te cambia la vida? No necesitas los 6 MCP servers y el review-agent inferencial para empezar. El mínimo viable son cinco piezas:

```
┌─────────────────────────────────────────────────────────────────┐
│  HARNESS MÍNIMO VIABLE                                          │
│                                                                  │
│  1. AGENTS.md            ← reglas estables del proyecto         │
│  2. spec.md (por tarea)  ← el contrato que el agente ejecuta    │
│  3. Tests + CI           ← sensor computacional que cierra loop │
│  4. Pre-commit hook      ← enforcement mecánico de lo crítico    │
│  5. Handoff artifact     ← estado que sobrevive entre sesiones  │
│                                                                  │
│  ┌─── lo que importa viaja por archivos, no por charla ───┐    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

Con esas cinco piezas ya tienes:
- El agente sabe qué respetar (1).
- El agente sabe qué construir y qué lo define como hecho (2).
- El agente puede verificar su trabajo sin que tú seas el loop (3).
- Lo crítico no depende de que el modelo "se acuerde" (4).
- La siguiente sesión retoma donde quedó esta (5).

Lo que **no** necesitas para empezar: MCP servers custom, subagentes especializados, review-agent inferencial, multi-agent orchestration. Esas son capas que se suman cuando el mínimo ya no da abasto, no prerequisitos.

> Orden de inversión recomendado (de Talk Think Do, adaptado): (a) AGENTS.md en una tarde → (b) sensores computacionales rápidos en CI en unos días → (c) 1-2 MCP servers para el flujo de mayor fricción → (d) generadores/skills encima de scaffolders existentes → (e) review-agent inferencial, solo cuando la capa computacional ya es confiable.

---

## 1.7 Cómo se conecta con el M0 y el M2

Este módulo es el puente. Visto en retrospectiva:

- **M0** te dio el vocabulario: *harness, smart/dumb zone, context rot, handoff, subagent, sandbox, progressive disclosure, AX*. Sin esos nombres, este módulo no se puede ni discutir.
- **M1** (este) te da el diagnóstico y el marco de diseño: *por qué* fallan, *qué* es el harness, *dónde* vive cada control, *cuál* es la jerarquía.
- **M2** te da el método: *cómo* se especifica (SDD), *cómo* se orquesta (GSD), *cómo* se ejecuta (Superpowers). El M2 presupone que ya compraste la tesis del M1.

Y mirando hacia adelante:

- **M3 (Workbench)** es la *implementación concreta* del harness: AGENTS.md, skills, hooks, memoria en 4 capas, cross-tool compatibility.
- **M4 (Handoffs)** es la *operación* del system of record entre sesiones.
- **M6 (Verificación)** es la *capa de sensores* que aquí llamamos feedback.
- **M7 (Failure modes)** es el *detalle* de las cinco clases que aquí solo enunciamos.

> Si tuvieras que explicar el curso en una frase: *M0 nombra, M1 diagnostica, M2 receta, M3-M10 aplican.*

---

## 1.8 Checklist de diseño de harness

20 preguntas para evaluar si tu entorno es un harness o una colección de deseos. El artefacto descargable está en `templates/harness-design-checklist.md`; aquí va el resumen ejecutivo.

**System of record**
- [ ] ¿La intención de cada feature vive en un `spec.md`, no en un mensaje del chat?
- [ ] ¿El progreso de las sesiones largas se persiste en archivos (`claude-progress.md`, `state.json`)?
- [ ] ¿Las decisiones de diseño están documentadas en `docs/decisions/`?
- [ ] ¿Una sesión nueva puede reconstruir el estado sin releer la conversación anterior?

**Restricciones explícitas**
- [ ] ¿Hay un `AGENTS.md` con las reglas estables del proyecto (comandos, estilo, gotchas)?
- [ ] ¿Está por debajo de ~200 líneas efectivas (sin hinchar)?
- [ ] ¿Los no-objetivos de cada spec son explícitos?
- [ ] ¿Las paths críticas están protegidas (no se tocan sin gate)?

**Guías (feedforward)**
- [ ] ¿Las reglas que solo aplican a ciertos archivos viven en rules scoped, no en el global?
- [ ] ¿El conocimiento profundo se carga on-demand (context pointers), no inline?
- [ ] ¿Hay skills para los flujos verticales repetibles (migraciones, deploys)?

**Sensores (feedback)**
- [ ] ¿Hay un sensor computacional por cada regla crítica (lint, typecheck, test estructural)?
- [ ] ¿El CI corre los AC de la spec, no solo "los tests"?
- [ ] ¿Hay un review-agent (inferencial) que compara el diff contra la spec?
- [ ] ¿El reporte de cierre exige DONE/VERIFIED (qué se verificó, qué no, supuestos)?

**Jerarquía de enforcement**
- [ ] ¿Lo más crítico está en hooks (mecánico), no en prosa del AGENTS.md?
- [ ] ¿Cada regla de texto que se incumple repetidamente se "promueve" a check o generador?
- [ ] ¿Las acciones destructivas tienen sandbox o worktree aislado?

**Contexto y continuidad**
- [ ] ¿Compactas proactivamente (~60%) antes del autocompact (~83%)?
- [ ] ¿Las reglas críticas de seguridad viven en `CLAUDE.local.md` (sobreviven a compaction)?
- [ ] ¿Usas subagentes con contexto fresco para verificación, en lugar del agente principal saturado?

> Si marcas menos de 10 casillas, tu entorno es más "deseo" que harness. Si marcas 15+, estás en zona confiable. 18+ es harness maduro.

---

## 1.9 Niveles de adopción

Como en el M2, no montes todo el harness el primer día. Tres niveles:

### Nivel 1 — Harness mínimo
- `AGENTS.md` corto y de alto signal.
- `spec.md` por feature (Spec-First, mínimo).
- Tests + CI que corren los AC.
- Pre-commit hook con lo crítico (lint, typecheck).
- **Ganancia:** el agente ya no improvisa reglas ni verifica "a ojo".

### Nivel 2 — Harness con memoria y enforcement
- Todo lo del Nivel 1, más:
- Handoff artifacts entre sesiones (`claude-progress.md`).
- Rules scoped + context pointers (progressive disclosure).
- Promover las reglas más incumplidas a checks deterministas.
- Worktree aislado para cambios con estado mutante.
- **Ganancia:** el context rot deja de matarte; la calidad deja de depender de la suerte.

### Nivel 3 — Harness maduro
- Todo lo del Nivel 2, más:
- 1-2 MCP servers para el flujo de mayor fricción.
- Generadores/skills que hacen los errores estructuralmente imposibles.
- Review-agent inferencial apoyado en la capa computacional.
- Subagentes especializados (reviewer, verifier) con contexto fresco.
- **Ganancia:** confiabilidad por defecto, no por vigilancia.

> **Consejo de adopción:** el Nivel 1 se alcanza en una tarde y ya recupera el costo. La trampa común es saltar al Nivel 3 sin haber consolidado el Nivel 1: te quedan MCP servers elegantes sobre un AGENTS.md hinchado y sin verificación. Construye de abajo hacia arriba.

---

## 1.10 Preguntas frecuentes (y trampas comunes)

**— ¿No es lo mismo "harness" que "buen prompting"?**
No. El prompting es *advisory* y vive en la conversación. El harness es *estructural* y vive en el entorno. Puedes tener el mejor prompt del mundo y un harness pésimo: el agente va a fallar igual cuando el contexto se sature. El harness es lo que sostiene al agente cuando el prompt ya no alcanza.

**— Si el modelo es tan capaz, ¿por qué necesita tanto andamiaje?**
Porque la capacidad no es el cuello de botella. Lo son la no-determinación, la atención finita y el contexto corruptible (sección 1.1). El andamiaje no hace al modelo más inteligente; crea un entorno donde su capacidad *se puede aprovechar* sin que se desvíe.

**— ¿Esto no es solo "buenas prácticas de ingeniería" recicladas?**
En parte sí, y eso es bueno. CI, hooks, linters, tests estructurales ya eran buenas prácticas. Lo que cambia con agentes es la *urgencia*: un humano ignora una regla de texto por pereza; un agente la ignora por naturaleza. Lo que antes era "buena práctica" ahora es "lo mínimo para que el agente no te queme el repo".

**— ¿Cómo sé si mi AGENTS.md está bien o hinchado?**
La prueba del ácido: quita una línea. Si al quitarla el agente empieza a equivocarse en algo concreto, esa línea ganaba su lugar. Si no notas diferencia, era ruido. Un AGENTS.md de alto signal es aquel del que *cada línea se extrañe* cuando se borra.

**— ¿Cuándo conviene un MCP server propio?**
Cuando hay un flujo de alta fricción que el agente hace mal por falta de acceso estructurado: un work tracker interno, un test runner con output complejo, logs distribuidos. Si el agente puede hacerlo bien con `curl` y `cat`, no hace falta MCP. Construye MCP para el flujo que más tiempo te roba, no por moda.

**— ¿Inner o outer harness primero?**
Outer. Lo portable (AGENTS.md, CI, hooks, MCP) sobrevive a que cambies de herramienta. Lo inner (reglas de un IDE específico) es la capa fina de arriba, barata de reconstruir.

---

## Referencias de este módulo

- [Learn Harness Engineering — WalkingLabs](https://walkinglabs.github.io/learn-harness-engineering/en/) — curso completo (12 módulos + proyectos); fuente principal del marco teórico.
- [Harness Engineering for Coding Agents — Talk Think Do](https://talkthinkdo.com/guides/ai-and-code/harness-engineering-coding-agents/) — inner/outer harness, guías vs. sensores, orden de inversión.
- [Anthropic's Harness Engineering — Rick Hightower](https://ai.plainenglish.io/anthropics-harness-engineering-two-agents-one-feature-list-zero-context-overflow-7c26eb02c807) — two-agent split, feature list JSON.
- [Effective Harnesses for Long-Running Agents — Anthropic](https://www.anthropic.com/engineering/effective-harnesses-long-running-agents) — harnesses para sesiones largas.
- [Effective Context Engineering — Anthropic](https://www.anthropic.com/engineering/effective-context-engineering) — contexto como recurso finito.
- [Coding Agent Failure Taxonomy — Codex Knowledge Base](https://codex.danielvaughan.com/2026/06/03/coding-agent-failure-taxonomy-nist-style-classification-detection-codex-cli/) — las 5 clases de falla (~40% contexto).
- [dlt-hub/dlthub-ai-workbench](https://github.com/dlt-hub/dlthub-ai-workbench), [rajshah4/harness-engineering](https://github.com/rajshah4/harness-engineering), [jameswood-tech/harness-engineering-cursor](https://github.com/jameswood-tech/harness-engineering-cursor) — implementaciones de referencia.

---

> **Cierre del módulo:** si solo te quedas con una idea, que sea esta — *el modelo es dado; el harness es tuyo*. Cuando algo falle, la pregunta no es "¿qué modelo lo haría mejor?", es "¿qué control del harness habría impedido esto?". Esa pregunta, hecha sistema, es todo el resto del curso.