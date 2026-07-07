# Módulo 3 — Diseño del Entorno de Trabajo (Workbench)

> **La implementación concreta del harness.**
> El M1 te dijo *qué* es un harness y *por qué* importa. Este módulo te dice *cómo se construye*: qué archivos crear, qué va en cada uno, cómo se cargan y cómo se mantiene el entorno portable entre herramientas.

---

## 3.0 El workbench como "taller"

Imagina tu repo como un taller donde un colaborador muy capaz pero distraído va a trabajar. Un taller bien montado tiene: un cartel de reglas en la entrada, herramientas colgadas en su lugar, una guía de seguridad junto a cada máquina peligrosa, y un cuaderno de decisiones donde se anota por qué se hizo cada cosa. Eso es el workbench, traducido a archivos.

La pregunta de diseño no es "¿qué quieres que el agente sepa?", sino "¿qué necesita estar *en el entorno* para que el agente acierte sin que se lo pidas?". El workbench es el conjunto de archivos que viven en el repo y que el agente carga — siempre, bajo demanda o por scope — al arrancar.

> **Principio rector del workbench:** cada cosa que pones acá le quita un slot de atención al modelo (ver M0: presupuesto de ~150-200 instrucciones efectivas). Por eso el trabajo no es *llenar* el workbench, es *curar* el workbench. Cada línea debe ganar su lugar.

---

## 3.1 AGENTS.md / CLAUDE.md: el contrato base

### Qué es y por qué importa

El `AGENTS.md` (o `CLAUDE.md` en Claude Code) es el archivo canónico de instrucciones de proyecto para el agente. Es el equivalente para máquinas del `README.md` para humanos. Define las reglas estables que el agente debe respetar siempre: comandos, estilo, gotchas, lo que no se toca.

> `README.md` es para humanos. `AGENTS.md` es para agentes de código. Symlinks son helpers de compatibilidad.

### Cross-tool: el estándar de facto

No hay una spec universal formal, pero hay un consenso práctico:

| Herramienta | Lee | Notas |
|-------------|-----|-------|
| **Codex** | `AGENTS.md` | Soporte de primera clase; carga desde `~/.codex/`, raíz del repo y working dir. |
| **Cursor** | `AGENTS.md` y `CLAUDE.md` | Junto con `.cursor/rules`. |
| **Claude Code** | `CLAUDE.md` | Lectura oficial. Truco cross-tool: `ln -s AGENTS.md CLAUDE.md` para un único archivo canónico. |
| **Aider** | `CONVENTIONS.md` / indicado en `.aider.conf.yml` | Convención propia. |

**Recomendación práctica:** escribe un único `AGENTS.md` canónico y enlázalo como `CLAUDE.md` (o usa `@imports`) para que Claude Code lo lea. Así tienes una sola fuente de verdad que funciona en varias herramientas.

### Qué SÍ poner

- **Comandos:** cómo correr tests, build, lint, migrate. Con el comando exacto, no "usa el linter".
- **Reglas de estilo que difieren de los defaults:** si el repo prohíbe `any` en TypeScript o exige inmutabilidad, dilo.
- **Instrucciones de testing:** dónde viven los tests, qué cobertura esperas, qué convenciones de naming.
- **Etiqueta del repo:** branching, PR expectations, tamaño de commit.
- **Decisiones arquitectónicas estables:** "los repos usan el patrón repository", "el state vive en X".
- **Gotchas:** lo que rompes una vez y no quieres volver a romper.
- **Lo que no se toca:** migraciones aplicadas, configs de prod, paths críticos.

### Qué NO poner

- **Lo que el agente puede inferir del código.** Si `package.json` ya dice que usas Jest, no hace falta repetirlo.
- **Convenciones estándar del lenguaje.** "Usa camelCase en JS" es ruido.
- **Documentación de API detallada.** Va en `docs/`, referenciada con un context pointer.
- **Información que cambia frecuentemente.** Cada cambio invalida el cache del prefijo (M0) y compite por slots.
- **Secretos.** Nunca.
- **Guías de estilo genéricas.** Para eso existen linters y formatters — úsalos como enforcement, no como prosa.

> **La prueba del ácido (recuperada del M1):** quita una línea. Si al quitarla el agente empieza a equivocarse en algo concreto, ganaba su lugar. Si no notas diferencia, era ruido. Un `AGENTS.md` de alto signal es aquel del que *cada línea se extrañe* cuando se borra.

### La jerarquía de carga (multi-nivel)

El `AGENTS.md` no es un archivo solo; es una jerarquía que se carga según dónde estés trabajando:

```
~/.claude/CLAUDE.md          # global, tus preferencias personales
./CLAUDE.md                  # equipo, commiteado al repo
./CLAUDE.local.md            # personal, gitignored (reglas que sobreviven a compaction)
./subdir/CLAUDE.md           # scoped, carga al trabajar en ese subdirectorio
```

Para monorepos, los archivos de directorios padre/hijo se cargan según correspondencia. Esto permite que `frontend/` tenga reglas distintas de `backend/` sin contaminarse.

### El límite de los ~150-200 slots

Los modelos frontera degradan linealmente la compliance pasada cierta cantidad de instrucciones efectivas (~150-200, según datos de Vercel y la comunidad). El system prompt base del agente ya consume ~50. **Cada línea de tu AGENTS.md compite por los slots que quedan.**

Consecuencia: un AGENTS.md de 500 líneas no es "5× mejor" que uno de 100; es *menos confiable*. La compliance degrada con la longitud. La meta no es exhaustividad; es densidad de signal.

> No uses `/init` a ciegas para autogenerar el CLAUDE.md. Si lo autogeneras sin pensar cada línea, no entiendes el contrato más importante del harness. `/init` es un punto de partida, no un veredicto.

---

## 3.2 Skills: conocimiento operativo empaquetado

### Qué es una skill

Una skill es un playbook reutilizable y versionable que encapsula un flujo vertical completo: "cómo hacer una migración de DB en este repo", "cómo deployar a staging", "cómo hacer triage de un incidente". Se invoca por nombre (`/migrar-db`) y el agente sigue el playbook en lugar de improvisar.

> AGENTS.md es conocimiento *declarativo* ("qué es verdad sobre este repo"). Skills son conocimiento *operativo* ("cómo se hace X acá, paso a paso").

### Cuándo una skill, cuándo una regla

| Quiero… | Va en… |
|---------|--------|
| Que el agente siempre respete X | `AGENTS.md` (regla estable) |
| Que el agente sepa *cómo* ejecutar un flujo de varios pasos | Skill (playbook invocable) |
| Que el agente cambie de comportamiento según el archivo que toca | Rule scoped (`.claude/rules/`) |
| Referenciar doc profunda sin hinchar el contexto | Context pointer (`@import`) |

### Dato de Vercel: AGENTS.md vs. skills para entregar conocimiento de APIs de framework

Vercel publicó que, en sus evaluaciones, `AGENTS.md` supera a las skills para entregar conocimiento de APIs de framework (Next.js, etc.). La razón: ese conocimiento es *estable* y se necesita *siempre*; las skills son para lo *condicional* y *on-demand*. Confundir las dos lleva a skills gigantes que el agente nunca invoca, o a AGENTS.md hinchado con tutoriales.

### Dónde viven y cómo se estructuran

```
.claude/skills/
└── migrar-db/
    └── SKILL.md      # el playbook: trigger, pasos, verificación, ejemplos
```

El archivo `SKILL.md` tiene típicamente: nombre, descripción/trigger, pasos, casos borde, verificación. La convención está documentada en `templates/.claude/skills/SKILL.md` (ver artefactos de este módulo).

### Cuándo escribir una skill (no antes)

- El flujo se repite 3+ veces (de lo contrario, no amortizas el costo de escribirla).
- El flujo tiene pasos específicos del repo que el agente no adivinaría.
- El flujo tiene verificación propia (no solo "y ya está").

Si las dos primeras no se cumplen, deja que el agente lo improvise con el AGENTS.md; meter todo en skills es la otra cara del AGENTS.md hinchado.

---

## 3.3 Subagents: contexto aislado para tareas especializadas

### Qué es un subagent

Un subagent es un agente secundario con **contexto aislado** que el agente principal delega para una tarea específica. Su contexto no contamina al principal y viceversa. Esto es clave: el subagent arranca fresco, hace su tarea, devuelve un resultado, y se va.

### Para qué sirven de verdad

- **Investigación:** "releva qué hace este módulo y vuelve con un resumen" — el subagent lee 50 archivos sin llenar el contexto del principal.
- **Revisión adversarial:** "revisa este diff contra la spec" — un subagent fresco detecta cosas que el principal, saturado, ya no ve.
- **Verificación:** "corre los tests e interpreta el output" — aislado del contexto de implementación, menos sesgado a decir "verde".
- **Paralelismo:** fan-out a N subagents sobre archivos independientes (ver M5 y el patrón de workflows).

### Dónde se definen

```
.claude/agents/
└── code-reviewer.md   # definición del subagent: rol, tools, scope
```

Cada subagent puede tener su propio system prompt, set de tools y permisos. Un reviewer no necesita permisos de escritura; un investigador no necesita permisos de red.

### Trampa común: usar el agente principal saturado para revisar

El error más frecuente es pedirle al *mismo* agente que acaba de implementar que "revisa lo que hiciste". El agente tiene contexto cargado y sesgo de confirmación; va a validar su propio trabajo. Un subagent fresco, con solo el diff y la spec, es mucho más honesto.

> Regla: el que implementó no revisa. El que revisa arranca con contexto fresco.

---

## 3.4 Hooks: enforcement mecánico, no advisory

### Qué es un hook

Un hook es un script determinístico que se ejecuta en un punto específico del workflow del agente, sin pasar por el modelo. A diferencia del AGENTS.md (advisory), el hook **siempre se ejecuta**: no depende de que el modelo "se acuerde".

> CLAUDE.md es advisory. Hooks son mecánicos. Cuando algo es crítico, súbelo a hook.

### Tipos de hooks típicos

| Hook | Cuándo corre | Uso típico |
|------|--------------|------------|
| `PreToolUse` | Antes de una tool call | Bloquear comandos peligrosos, validar paths |
| `PostToolUse` | Después de una tool call | Lint auto, drift detection |
| `Stop` | Cuando el agente termina turn | Notificar, loggear, abrir review |
| `UserPromptSubmit` | Al enviar un prompt | Inyectar contexto, validar input |

### Por qué hooks > prosa para lo crítico

Una regla que dice "no borres migraciones" es prosa: el modelo puede no seguirla. Un hook `PreToolUse` que bloquea cualquier write a `db/migrations/*.sql` ya aplicados es mecánico: el agente *no puede* hacerlo, no es que "no debería". Lo crítico pertenece a hooks; lo demás puede vivir en prosa scoped.

### Cómo se configuran

En Claude Code, los hooks viven en `settings.json` (a nivel proyecto o usuario). El skill `update-config` de tu harness los configura sin que toques JSON a mano. La regla: si lo pensabas poner como regla de texto en AGENTS.md y es crítico, considera si merece ser un hook.

> **Aviso importante:** automatismos del tipo "desde ahora, cada vez que X" (reglas que viven en tu cabeza) requieren hooks, no memoria. La memoria del agente es advisory; los hooks son mecánicos y los ejecuta el harness, no el modelo.

---

## 3.5 Scripts de inicialización: por qué el setup es una fase aparte

### El problema del setup manual

Si cada vez que un agente arranca tiene que descubrir cómo levantar tu repo (instalar deps, sembrar DB, configurar env), vas a perder 15-20 minutos y parte del contexto en cada sesión. Y peor: si el setup varía entre sesiones, el agente trabaja sobre un entorno inconsistente.

### La solución: el setup como fase determinista

GSD (M2) lo formula bien: **la inicialización es una fase separada, repetible y determinista**. El agente no "descubre" el entorno; corre un script que lo deja en un estado conocido.

Un script de init saludable:
1. Verifica versiones (Node, Python, Docker).
2. Instala dependencias de forma idempotente.
3. Siembra la DB de tests a un estado conocido.
4. Verifica que el baseline pase los tests (si no, detente).
5. Imprime un resumen del estado listo para el agente.

### El initializer agent (patrón two-agent)

Para sesiones largas, Anthropic usa un patrón de dos agentes (ver M4 en detalle):
- **Initializer agent:** lee la spec, analiza el codebase, genera la feature list JSON, crea tests esqueleto, escribe el startup script. Luego **se descarta su contexto**.
- **Coding agent:** toma la salida del initializer y construye incrementalmente, con contexto angosto pero profundo.

El inicializador gasta contexto en *entender*; el coder gasta contexto en *construir*. Separarlos evita que el contexto de entendimiento contamine al de construcción. Por eso el setup es una fase, no un subproducto.

> El artefacto `templates/init.sh` (en este módulo) es un punto de partida para el init determinista.

---

## 3.6 Estructura de directorios que facilitan el razonamiento del agente

No hay una estructura "correcta", pero hay principios que ayudan al agente:

1. **Convención predecible:** si `src/api/` sigue un patrón, todo lo nuevo ahí lo sigue. El agente aprende del patrón; las excepciones lo confunden.
2. **Colocation:** los tests junto al código que testean. `foo.ts` y `foo.test.ts` juntos, no en un `tests/` lejano. El agente los encuentra sin buscar.
3. **Namespaces claros:** si el agente ve `src/repositories/`, espera que `UserRepo` viva en `src/repositories/UserRepo.ts`. Cúmplelo.
4. **Un lugar para cada cosa:** si la doc vive en `docs/`, no también en `wiki/` y `notion/`. El agente busca en un solo lugar.
5. **`docs/decisions/` (ADRs):** las decisiones de arquitectura documentadas y numeradas. El agente las encuentra y respeta; tú las diff-eas en el tiempo.

### Lo que confunde al agente (evitalo)

- Múltiples archivos con nombres casi idénticos en distintos lugares (`User.ts`, `user.ts`, `Users.ts`).
- Lógica duplicada con pequeñas variaciones ("¿cuál es la buena?").
- Configs con overrides implícitos (`env.local`, `env.dev`, `env.development`).
- Código muerto no borrado (el agente lo "respeta" creyendo que importa).

---

## 3.7 Gestión de permisos y modos de ejecución

El permiso no es solo seguridad; es la **modalidad de autonomía** del agente. Elegir el modo correcto es la decisión más subestimada del workbench.

| Modo | Qué permite | Cuándo usarlo |
|------|-------------|--------------|
| **Read-only** | Solo lectura, sin writes ni red | Explorar, auditar, planificar |
| **Propose-then-commit** | Propone cambios; tú apruebas antes de aplicar | Cambios con riesgo medio, HITL |
| **Full-agent** | Ejecuta writes y comandos sin gate por tarea | Tareas largas AFK, con spec + verificación |
| **Sandboxed** | Cualquiera de los anteriores, en cont/worktree aislado | Siempre que haya estado mutante |

> La causa #1 de "el agente borró algo que no debía" es elegir mal el modo. Si hay estado mutante y no hay sandbox, estás asumiendo riesgo sin querer.

### Permisos por tool, no globales

Las herramientas modernas permiten permisos por tool: `grep` auto-aprobado, `bash` con confirmación, `git push` siempre bloqueado. Configura el default más restrictivo que no te frene, y abre solo lo necesario. Un `.claude/settings.json` curado ahorra docenas de confirmaciones por sesión sin abrir riesgos.

> El skill `fewer-permission-prompts` escanea tus sesiones y arma un allowlist priorizado para reducir fricción sin perder control.

---

## 3.8 La arquitectura de memoria en 4 capas

Claude Code (y herramientas similares) implementan la memoria como **cuatro capas distintas**, cada una con su rol. Entenderlas te dice dónde poner cada cosa para que se cargue cuando corresponde.

| Capa | Archivo | Quién escribe | Cuándo se carga |
|------|---------|---------------|----------------|
| 1 | `CLAUDE.md` / `AGENTS.md` | Tú (humano) | Cada inicio de sesión |
| 2 | `MEMORY.md` (auto-memory) | El agente (autónomo) | Primeras ~200 líneas al inicio |
| 3 | Memory tool (`memory_*`) | Agentes por API | On-demand |
| 4 | Subagent memory (`memory:` frontmatter) | Cada subagent | Al arrancar el subagent |

### Capa 1: el contrato humano
Lo que tú decides que el agente siempre respete. Estable, curado, corto. Ya lo cubrimos en 3.1.

### Capa 2: la auto-memoria
El agente descubre patrones durante la sesión y los escribe solo en `MEMORY.md`. Tú la revisas periódicamente. Ojo: solo las primeras ~200 líneas se cargan automáticamente al inicio; lo que se va abajo es ruido.

### Capa 3: memoria on-demand (API agents)
Para flujos por API (no interactivos), el patrón es: una sesión inicial crea `claude-progress.txt`, un checklist de features y un `init.sh`. Cada sesión siguiente lee el dir de memoria + el progress log + `git log` para reconstruir el estado. Esto es la base del two-agent architecture (M4).

### Capa 4: memoria del subagent
Cada subagent puede tener su propio almacén persistente (`memory: project` en el frontmatter). El code-reviewer acumula lo que aprendió sobre el repo en `~/.claude/agent-memory/code-reviewer/MEMORY.md`. Esto permite que un subagent especializado mejore con el tiempo sin contaminar al principal.

### La regla de oro de la memoria

> Lo que importa sobrevive a la compaction solo si está en un archivo que se re-carga. La conversación NO sobrevive a la compaction. Las reglas críticas de seguridad van en `CLAUDE.local.md` (se re-lee tras compaction, a diferencia del historial).

---

## 3.9 El workbench cross-tool, en una tabla

Lo que es portable entre herramientas (invierte primero) vs. lo que no:

| Portable (outer harness) | No portable (inner harness) |
|---------------------------|-----------------------------|
| `AGENTS.md` en la raíz | `.cursor/rules/*.mdc` (Claude Code no los lee nativamente) |
| MCP servers | Skills de Cursor (dependen del runtime de Cursor) |
| CI checks (build, test, lint, structural, security) | UIs de diff inline de un IDE |
| Pre-commit / pre-push hooks | Review-agents atados a un IDE específico |
| Code generators / scaffolding | Atajos de teclado de un editor |
| Test suites y mutation tests | |

> La inversión en la columna izquierda sobrevive a que cambies de herramienta. La columna derecha es la capa fina, barata de reconstruir.

---

## 3.10 Artefactos de este módulo

Este módulo produce cinco artefactos descargables en `templates/`:

1. **`AGENTS.md`** — plantilla canónica del contrato base, con secciones comentadas de qué poner y qué no.
2. **`.claude/skills/SKILL.md`** — plantilla de skill (trigger, pasos, verificación).
3. **`init.sh`** — script de inicialización determinista de sesión.
4. **`.claude/rules/RULE.md`** — plantilla de rule scoped con frontmatter.
5. **`cross-tool-compatibility-matrix.md`** — cheatsheet de qué funciona en cada herramienta.

> Cada uno está pensado para copiar y pegar en un repo real. No son ejemplos abstractos; son puntos de partida editables.

---

## 3.11 Niveles de adopción

### Nivel 1 — Workbench mínimo
- `AGENTS.md` corto y de alto signal (sección 3.1).
- Tests + CI que corren los AC.
- Permisos configurados (read-only por default, bash con confirmación).
- **Ganancia:** el agente sabe qué respetar; reduces errores de "no sabía que…".

### Nivel 2 — Workbench con skills y memoria
- Todo lo del Nivel 1, más:
- 1-2 skills para los flujos más repetidos.
- `MEMORY.md` revisada periódicamente.
- Pre-commit hook con lo crítico.
- `init.sh` para setup determinista.
- **Ganancia:** el setup deja de ser fricción; los flujos repetibles salen consistentes.

### Nivel 3 — Workbench maduro
- Todo lo del Nivel 2, más:
- Subagents especializados (reviewer, verifier) con memoria propia.
- Hooks `PreToolUse`/`PostToolUse` para enforcement mecánico.
- Rules scoped por path para monorepos.
- `docs/decisions/` (ADRs) activos.
- **Ganancia:** confiabilidad por defecto; el agente acierte sin que se lo pidas.

---

## 3.12 FAQ

**— ¿AGENTS.md o CLAUDE.md?**
Escribe `AGENTS.md` (estándar de facto, multi-tool) y enlázalo como `CLAUDE.md` para Claude Code. Una fuente de verdad.

**— ¿Cuánto es "demasiado" en AGENTS.md?**
Si pasas de ~150-200 líneas efectivas (excluyendo código y tablas), la compliance empieza a degradar. La meta es densidad, no volumen. Si tienes más, mueve a skills o a context pointers.

**— ¿Las skills reemplazan al AGENTS.md?**
No. Son complementarias: AGENTS.md entrega lo estable y siempre-cargado; skills entregan lo condicional y on-demand. Vercel mostró que AGENTS.md supera a skills para conocimiento de APIs de framework.

**— ¿Hooks o reglas en AGENTS.md?**
Reglas para lo advisory; hooks para lo crítico y mecánico. La pregunta: si el modelo ignora esto, ¿qué tan malo es? Si es catastrófico, es hook.

**— ¿Qué va en `CLAUDE.local.md` (gitignored)?**
Reglas personales + las críticas de seguridad que deben sobrevivir a la compaction. Cosas que NO quieres commitear (preferencias personales) y que el equipo no debe heredar.

**— ¿Cómo empiezo si mi repo no tiene nada?**
Corre el skill `/init` como punto de partida, **pero edita cada línea**. El `/init` autogenerado no es un veredicto; es un borrador. El AGENTS.md es el artefacto de mayor leverage del harness: merece tu juicio, no un copy-paste.

---

## Referencias de este módulo

- [Best practices for Claude Code — Docs](https://code.claude.com/docs/en/best-practices) — jerarquía CLAUDE.md, skills, subagents, hooks.
- [Use CLAUDE.md and AGENTS.md to Steer Local Agent Runs — Junction Blog](https://junctionpanel.dev/blog/use-claude-md-and-agents-md-to-steer-local-agent-runs/) — compatibilidad cross-tool.
- [Claude Code & Agent Memory — orchestrator.dev](https://orchestrator.dev/blog/2026-04-06--claude-code-agent-memory-2026/) — 4 capas de memoria, umbrales de compaction.
- [How to use AGENTS.md — Benjamin Crozat](https://benjamincrozat.com/agents-md) — soporte por herramienta.
- [Writing a Great AGENTS File — Alex Kurilin](https://www.kuril.in/notes/writing-a-great-agents-file/) — brevedad, progressive disclosure, ~150-200 slots.
- [dlt-hub/dlthub-ai-workbench](https://github.com/dlt-hub/dlthub-ai-workbench) — workbench multi-tool.
- [Harness Engineering — Talk Think Do](https://talkthinkdo.com/guides/ai-and-code/harness-engineering-coding-agents/) — inner/outer harness, orden de inversión.

---

> **Cierre del módulo:** el workbench es donde la teoría del M1 se vuelve archivos. Si solo te quedas con una idea, que sea esta — *cura el workbench como un editor que corta cada línea que no se extrañe al borrarla*. La densidad de signal, no el volumen, es lo que hace confiable al agente.