# Módulo 2 — Especificar, Planificar y Ejecutar con Agentes

> **Núcleo metodológico del curso.**
> Si solo lees un módulo, que sea este.
> Todo lo demás (harness, handoffs, verificación) existe para *servir* a lo que aquí se construye: un contrato entre un humano y un agente.

---

## Evidencia de logro

> Al terminar este módulo debes poder:

| # | Objetivo | Cómo se comprueba |
|---|----------|-------------------|
| 1. | **Escribe** una spec con ACs binarios, no-objetivos y ambigüedades marcadas `[NEEDS CLARIFICATION]`. | Quiz M2; lab-02; plantilla `templates/spec.md`. |
| 2. | **Elige** el nivel de rigor (Spec-First / Spec-Anchored / Spec-as-Source) justificando por contexto. | Quiz M2; §2.2. |
| 3. | **Descompone** una spec en phases y tasks atómicas ejecutables por subagentes de contexto fresco. | Quiz M2; §2.3/2.5. |
| 4. | **Distingue** los artefactos del pipeline (spec/roadmap/state.json/tasks/plan/feature_list) y qué "verdad" porta cada uno. | Quiz M2; §2.6; ejemplo `examples/m2-unified-workflow/`. |

**Práctica recomendada:** lab-02 — feature completo desde la spec (ver [`lab-02-spec-driven-feature`](../labs/lab-02-spec-driven-feature/)).

---

## 2.1 Por qué una metodología (y no solo "vibe coding")

### El problema de la intención no especificada

Cuando le pides a un agente *"añade filtros a la lista de proyectos"*, estás delegando miles de micro-decisiones que no le diste:

- ¿La fecha es de creación o de actualización?
- ¿El rango es inclusivo en los dos extremos?
- ¿El filtro va en el endpoint actual o en uno nuevo?
- ¿Qué pasa si no llega ningún filtro?
- ¿Los estados son un enum fijo o vienen de base de datos?

El agente **va a responder todas esas preguntas**. Lo que no le diste, lo inventa — y lo hace dentro de su contexto, donde nadie lo revisa. Esa es la raíz de los tres problemas más caros del trabajo con agentes:

1. **Scope creep:** el agente decide que "añadir filtros" incluye también ordenamiento y vistas guardadas, porque suena relacionado.
2. **Hallucination consentida:** inventa un campo o un endpoint que "tendría sentido" y lo implementa como si existiera.
3. **Tests que pasan pero testean lo equivocado:** escribe tests que confirman su suposición, no la tuya. El resultado es "verde" pero falso.

### De "promptear y rezar" a "contrato verificable"

Hay dos modelos de trabajo con agentes, y la diferencia no es la herramienta:

| Modelo                      | Cómo se delega                         | Dónde se decide lo ambiguo       | Cómo sabes que está hecho         |
|-----------------------------|----------------------------------------|----------------------------------|-----------------------------------|
| **Vibe coding**             | Un prompt en lenguaje natural          | Dentro del contexto del agente   | "Se ve que funciona"             |
| **Spec-Driven Development** | Una spec (contrato) + un plan          | En la spec, antes de codear      | Cada AC tiene un test que pasa   |

En vibe coding, la ambigüedad se resuelve **en runtime, dentro del agente, sin auditoría**. En SDD, se resuelve **en la spec, con revisión humana, antes de que se escriba una línea de código**. El agente no decide más; ejecuta contra un contrato.

> **Frase que conviene memorizar:** *el código es un artefacto de la especificación.* Si la especificación es buena, el agente no tiene margen para equivocarse sobre el qué. Solo sobre el cómo — y eso lo controla el harness y los tests.

### El ecosistema: SDD + GSD + Superpowers

Estos tres frameworks no compiten; ocupan capas distintas del mismo pipeline:

| Framework        | Capa                   | Pregunta que responde                  | Artefacto central             |
|------------------|------------------------|----------------------------------------|-------------------------------|
| **SDD**          | Especificación        | ¿Qué construimos y qué lo define como hecho? | `spec.md`                |
| **GSD**          | Orquestación           | ¿Cómo organizamos el trabajo para que sobreviva entre sesiones? | `.planning/` (state machine) |
| **Superpowers**  | Implementación        | ¿Cómo ejecutamos cada tarea sin que el agente se desvíe? | `plan.md` + TDD + subagents |

Una analogía útil: **SDD es el plano arquitectónico, GSD es la obra con cronograma y cuadrillas, Superpowers es el manual de construcción y control de calidad.** Puedes usar solo SDD y ya ganar mucho. Puedes sumar GSD cuando tus tareas duren más de una sesión. Puedes sumar Superpowers cuando necesites que el código salga con calidad por defecto, no por suerte.

---

## 2.2 Spec-Driven Development (SDD)

### Los tres niveles de rigor

No toda spec tiene que ser igual de formal. El paper *"Spec-Driven Development: From Code to Contract"* (AIWare 2026) define tres niveles, y la regla de oro es **usar el mínimo nivel que elimine la ambigüedad para tu contexto**:

| Nivel             | La spec vive...                          | Cuándo usarlo                                  |
|-------------------|------------------------------------------|------------------------------------------------|
| **Spec-First**     | Antes de codear; puede derivar después   | Prototipos, pruebas de concepto, verde         |
| **Spec-Anchored** | Junto al código; los tests fuerzan alineación | La mayoría del código de producción (sweet spot) |
| **Spec-as-Source**| Es lo único que editan humanos; el código se genera | Dominios con generación confiable (OpenAPI, Simulink) |

El error más común es creer que más rigor es siempre mejor. No lo es: over-specificar un prototipo cuesta más en burocracia de lo que ahorra en bugs. El otro error, más caro, es usar Spec-First donde haría falta Spec-Anchored: la spec deriva, nadie la actualiza, y termina mintiendo sobre el código.

> **Heurística:** si el feature va a producción y va a ser mantenido por alguien que no eres tú, usa Spec-Anchored como mínimo.

### La spec como "super-prompt"

Los LLM son excelentes completando patrones y malos leyendo mentes. Una spec bien escrita **descompone un problema complejo en componentes modulares que caben en la context window del agente** y, sobre todo, quita la necesidad de adivinar.

El paper "Spec-Driven Development: From Code to Contract" (AIWare 2026) reporta que las specs refinadas por humanos pueden reducir los errores del código generado por LLM **hasta un 50%**. Eso no es magia: es simplemente que la spec eliminó 50% de las decisiones que el agente habría tomado en silencio.

Tres propiedades de una buena spec, pensada como super-prompt:
1. **Descompone:** cada RF es independiente y mapea a ACs verificables.
2. **Es binaria:** cada AC se puede marcar ✅ o ❌ sin opinión.
3. **Es bloqueante:** los `[NEEDS CLARIFICATION]` detienen al agente en lugar de invitarlo a adivinar.

### Anatomía de `spec.md` (archivo `templates/spec.md`)

La plantilla tiene 12 secciones. No todas son obligatorias, pero las obligatorias son el mínimo no negociable. Repaso el porqué de cada una:

| Sección                              | Obligatoria | Por qué importa                                            |
|--------------------------------------|-------------|------------------------------------------------------------|
| 1. Contexto y motivación             | Sí          | El agente entiende el problema; no resuelve el problema equivocado. |
| 2. Objetivos y no-objetivos          | Sí          | Los no-objetivos son la **primera defensa contra el scope creep**. |
| 3. Invariantes y constraints        | Sí          | Lo que el agente no puede negociar. Inmutable.            |
| 4. Requisitos funcionales (RF)      | Sí          | El QUÉ, no el cómo. Comportamiento, no implementación.    |
| 5. Criterios de aceptación (AC)     | Sí          | **El corazón.** Si no puedes escribir un test, el AC está mal. |
| 6. Dependencias y prerequisitos     | Opcional    | Mapea el bloqueo y el desbloqueo.                          |
| 7. Diseño técnico (pista, no solución) | Opcional | Pistas de archivos y patrones. La implementación NO va aquí. |
| 8. Datos de prueba / escenarios     | Opcional    | Seed data y edge cases para QA.                           |
| 9. Rollback plan                    | Recomendado | Cómo revertir si sale mal.                                |
| 10. Decisiones abiertas             | Sí si hay   | `[NEEDS CLARIFICATION]` = bloqueante.                     |
| 11. Definición de "Verificado"      | Sí          | Lo que convierte la spec en "hecha".                      |
| 12. Trazabilidad                     | Opcional    | Conecta ticket → roadmap → plan → PR → commit.             |

**Tres anti-patrones de specs que engañan al agente** (y cómo se ven en la práctica):

- **AC opinable:** *"la UI debe ser clara y rápida"*. No hay comando que devuelva pass/fail. → Reescribir: *"el panel carga en p95 < 300ms con 10.000 ítems"*.
- **Spec que esconde implementación:** *"usar Redis para cachear"*. Eso es diseño, no spec. → Mover a sección 7 como pista, no como requisito.
- **No-objetivos ausentes:** sin perímetro, el agente expande alcance por simpatía. → Listar explícitamente lo que NO entra.

### El truco que más valor da: `[NEEDS CLARIFICATION]`

En la sección 10, cada item marcado `[NEEDS CLARIFICATION]` es **bloqueante por diseño**. El agente no adivina; se detiene y pregunta (o, en GSD, marca la task como bloqueada en `state.json`). Esto convierte la ambigüedad —que en vibe coding sería un bug en producción— en un evento visible y gestionable.

> Si al escribir la spec descubres que una sección no puedes completarla sin inventar, no inventes: marca `[NEEDS CLARIFICATION]`. Ese es el momento en el que la spec te está avisando de un riesgo *antes* de que cueste dinero.

### Las constitutional articles de Spec Kit

[GitHub Spec Kit](https://github.com/github/spec-kit) — el toolkit de SDD de GitHub — lleva la idea del contrato un paso más allá: cada proyecto tiene una **constitution**, un archivo de principios inmutables que gobierna toda spec, plan y task (se crea una vez con `/speckit.constitution`). Su núcleo son **nueve artículos** (documentados en el repo, `spec-driven.md` — "The Nine Articles of Development"), cada uno con su porqué operativo:

| Artículo | Qué manda | Por qué te importa |
|---|---|---|
| **I. Library-First** | Toda feature nace como librería standalone, con fronteras claras y dependencias mínimas | Modularidad forzada desde el spec → menos bugs de integración en el código generado |
| **II. CLI Interface Mandate** | Toda librería se expone por CLI: texto in, texto out, JSON para datos estructurados | Nada queda escondido en clases opacas → todo es observable y testeable |
| **III. Test-First Imperative** | No hay código antes de los tests: primero se escriben, se aprueban y se confirman fallando (ROJO) | Los AC son ejecutables desde el día 0 — este módulo entero convertido en regla constitucional |
| **IV-VI. Project-Defined** | Slots que cada proyecto define con sus no negociables (p. ej. seguridad, observabilidad, versionado, breaking changes) | El template no decide tus estándares: los hereda de tu constitution y los audita igual que los built-in |
| **VII. Simplicity** | Máximo 3 proyectos; nada de future-proofing; toda capa extra se justifica | YAGNI con dientes: la complejidad hay que documentarla, no solo escribirla |
| **VIII. Anti-Abstraction** | Usa el framework directamente, sin wrappers; una sola representación por modelo | YAGNI frente al agente que "mejora" el código con abstracciones que nadie pidió |
| **IX. Integration-First Testing** | Bases de datos reales sobre mocks; contract tests obligatorios antes de implementar | El código funciona en la práctica, no solo en la teoría del test unitario |

Lo notable no es la lista sino el **enforcement**: el template de plan de Spec Kit tiene *gates* de pre-implementación (Simplicity Gate, Anti-Abstraction Gate, Integration-First Gate) que el agente debe pasar antes de codear — o documentar la excepción. Es el mismo patrón del Módulo 1: reglas *advisory* convertidas en checks mecánicos. Y el flujo llega completo como comandos — `/speckit.specify` → `/speckit.plan` → `/speckit.tasks` → `/speckit.implement` — con `/speckit-converge` (desde la 1.0) auditando el codebase contra spec/plan/tasks y convirtiendo el trabajo faltante en tasks nuevas.

---

## 2.3 De la spec al plan: GSD (Get Shit Done Redux)

### El problema que ataca: context rot

La causa de falla número uno en agentes de código (≈40% según la taxonomía que vimos en el Módulo 1, §1.1) es la **corrupción de contexto**: a medida que la conversación crece, el agente pierde instrucciones, confunde archivos y olvida constraints. Una sesión larga no es una sesión más inteligente; es una sesión que se degrada.

GSD resuelve esto con una idea simple y potente: **el filesystem es la base de datos del proyecto.** Todo el estado vive en archivos dentro de `.planning/`, no en la memoria de la conversación. Un agente que arranca una sesión nueva lee esos archivos y reconstruye el contexto sin releer el historial.

### La jerarquía: Milestones → Phases → Tasks

```
Milestone  (hito de valor entregable)
  └─ Phase  (unidad planificable y ejecutable)
       └─ Task  (unidad atómica ejecutable por un agente de contexto fresco)
```

- **Milestone:** "Filtros de proyectos v1" (valor entregable).
- **Phase:** "Filtro por status (backend)" (algo que puedes ejecutar y verificar).
- **Task:** "Validar query param status" (algo que un agente hace en ~5 minutos con contexto fresco).

La atomicidad de las tasks es lo que permite el truco anti-context-rot: cada task la ejecuta un subagente **con contexto nuevo**, no el agente principal que ya tiene la conversación saturada.

### El `.planning/` como state machine basada en archivos

```
.planning/
├── roadmap.md      ← la jerarquía Milestone/Phase/Task, editable y diff-able
├── state.json      ← "posición actual" del proyecto (fase activa, bloqueos, gates)
└── tasks/
    └── *.md        ← cada task es autocontenida para un agente fresco
```

Por qué archivos y no "memoria de la conversación":
- Es **machine-readable** (los agentes de GSD lo parsean).
- Es **diff-able** (ves cómo evolucionó el plan en el tiempo).
- Es **auditable** (quién cambió qué, cuándo — vía git).
- **Sobrevive entre sesiones**, que es justo lo que la memoria de la conversación no hace.

### Las 6 etapas del ciclo GSD

1. **Initialize** — `/gsd-new-project` genera requirements y roadmap a partir de la spec.
2. **Discuss** — `/gsd-discuss-phase` captura preferencias de implementación con el humano.
3. **Plan** — `/gsd-plan-phase` crea task files atómicos y ejecutables.
4. **Execute** — `/gsd-execute-phase` lanza subagentes con contexto fresco por task.
5. **Verify** — `/gsd-verify-work` audita el output contra los objetivos originales.
6. **Ship** — `/gsd-ship` prepara la integración y archiva la fase.

El detalle notable: **Verify contra los objetivos originales**, no contra "lo que el agente hizo". Esa es la diferencia entre auditar intención (GSD) y auditar output (lo que harías en vibe coding).

GSD trae 33 agentes especializados (`gsd-planner`, `gsd-executor`, `gsd-verifier`...) y 67 slash commands, y es **multi-runtime**: el mismo `.planning/` funciona en Claude Code, Codex, Cursor, Gemini, Augment. El plan no se ata a una herramienta.

### Self-specs: el agente redacta SU spec

El patrón: en lugar de redactar tú la spec desde cero, le pasas el ticket al agente y le pides que redacte *su* spec de la tarea — la que él va a ejecutar — marcando `[NEEDS CLARIFICATION]` donde tu descripción no alcance. Tú no la aceptas tal cual: la revisas con **grilling** (M0, §0.7): cada supuesto, cada no-objetivo, cada AC que parezca obvio.

- **Cuándo sirve:** tareas medias, donde escribir la spec tú cuesta más que corregir la del agente. El draft es barato; tu revisión hostil es el valor.
- **El riesgo:** *sycophancy* en espejo — la spec auto-escrita hereda los supuestos tuyos que el agente infirió sin auditar, y te la devuelve pulida como si fuera validación. Una spec que solo confirma lo que ibas a hacer igual no te protege de nada.
- **La regla:** self-spec sí; auto-aprobada, nunca. El agente propone el contrato; el humano firma. Si no encuentras nada que corregir, es señal de que no revisaste con suficiente hostilidad.

### Paralelismo con SDD

Si el contrato está cerrado, el plan se puede paralelizar: specs con **interfaces estables** (ACs + invariantes fijos) se descomponen en phases/tasks **no superpuestas** ejecutables por agentes en paralelo — cada subagente con contexto fresco, como en el M4. Spec Kit lo hace explícito: `/speckit.tasks` marca las tasks independientes `[P]` y agrupa las que pueden correr en paralelo sin pisarse.

- **El requisito:** el contrato (ACs + invariantes) cierra *antes* de abrir el paralelismo. Dos agentes paralelizando sobre una spec con ambigüedades no producen el doble de trabajo: producen el doble de integración que reconciliar a mano.
- **La frontera:** paraleliza lo que no comparte archivos. Si dos tasks tocan el mismo módulo, son una task o son secuenciales — no importa cuánto contexto fresco tengan.

---

## 2.4 De la spec al código: Superpowers

### La filosofía en cuatro palabras

> **TDD, YAGNI, DRY, evidence over claims.**

Superpowers es una metodología completa para agentes de código, no un plugin. Su tesis es que el agente no debe empezar a escribir código inmediatamente: debe **refinar la idea, presentarla en partes digeribles, escribir un plan que hasta un junior entusiasta con mal gusto podría seguir, y solo entonces ejecutar con subagentes**.

### Las 7 fases

1. **Brainstorming** — diálogo socrático para sacar la spec de la conversación (es decir, el agente te ayuda a *llegar* a la spec si no la tienes).
2. **Using-git-worktrees** — workspace aislado en una rama nueva, con baseline de tests limpia.
3. **Writing-plans** — tareas de 2-5 minutos con paths exactos, código completo y pasos de verificación.
4. **Subagent-driven-development** — lanza subagentes frescos por tarea, con revisión en dos etapas (cumplimiento de spec, luego calidad de código).
5. **Test-driven-development** — RED → GREEN → REFACTOR estricto. *"El código escrito antes que el test se borra."*
6. **Requesting-code-review** — revisa contra el plan, no contra el gusto. Los issues críticos bloquean.
7. **Finishing-a-development-branch** — verifica tests, ofrece merge/PR/conservar/descartar, limpia el worktree.

### "Un junior entusiasta con mal gusto, sin criterio"

Esta frase de Superpowers es la clave de por qué sus planes funcionan: el plan se escribe asumiendo que quien lo ejecuta no tiene buen juicio arquitectónico. Por eso cada task indica:
- los **paths exactos** de los archivos a tocar,
- los **tests a escribir primero**,
- los **pasos de verificación** binarios.

El juicio arquitectónico **ya vivió cuando se escribió la spec y el plan**. El agente que ejecuta no necesita tenerlo; solo necesita seguir el plan. Eso es lo que permite delegar a subagentes frescos sin que la calidad se desplome.

### La skills library

Superpowers empaqueta su conocimiento como **skills** (concepto que verás en el Módulo 3): testing, debugging, colaboración (brainstorming, writing-plans, executing-plans, dispatching-parallel-agents, requesting/receiving-code-review, git-worktrees, subagent-driven-development) y meta (writing-skills). Cada skill es un playbook reutilizable, no una receta de un solo uso.

> Nota importante: GSD y Superpowers **se solapan intencionalmente** en algunos puntos (ambos planifican, ambos usan subagentes). No es un bug, es una elección. GSD prioriza la orquestación durable entre sesiones; Superpowers prioriza la disciplina de implementación dentro de una sesión. En la práctica se complementan: GSD orquesta *qué fase* se ejecuta, Superpowers decide *cómo* se ejecuta cada task dentro de esa fase.

---

## 2.5 El workflow unificado: SDD + GSD + Superpowers

Así se encadenan los tres en un flujo real:

```
┌─────────────────────────────────────────────────────────────┐
│ FASE A — Especificar (SDD)                                   │
│   Ticket vago  ──►  spec.md  (contrato con ACs binarios)    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ FASE B — Planificar (GSD)                                    │
│   spec.md  ──►  roadmap.md + state.json + tasks/*.md         │
│   (hierarquía Milestone→Phase→Task, machine-readable)        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ FASE C — Diseñar la ejecución (Superpowers)                  │
│   task  ──►  plan.md con RED-GREEN-REFACTOR por tarea         │
│   (worktree aislado, paths exactos, verificación binaria)    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ FASE D — Ejecutar (GSD + Superpowers)                        │
│   subagente fresco por task  ──►  TDD estricto               │
│   (contexto nuevo = sin context rot)                         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ FASE E — Verificar y Entregar (ambos)                        │
│   ACs ejecutados  ──►  DONE/VERIFIED  ──►  PR  ──►  ship      │
│   (evidence over claims; state.json → ship_ready)            │
└─────────────────────────────────────────────────────────────┘
```

**Lo importante del flujo:** cada fase produce un **artefacto de archivo** que la siguiente fase consume. Nada vive solo en la conversación. Si tu laptop se apaga entre la Fase B y la C, no pierdes nada: `roadmap.md` y `state.json` están en el repo, y un agente nuevo puede continuar.

---

## 2.6 Tipos de archivos y sus secciones (kit completo)

Aquí está la "tabla periódica" de artefactos del pipeline, con qué sección aporta cada uno. Todos tienen plantilla descargable en `templates/`.

| Archivo                  | Origen        | Rol en el pipeline                  | Secciones clave                                              |
|--------------------------|---------------|-------------------------------------|--------------------------------------------------------------|
| `spec.md`                | SDD           | El contrato                         | Contexto, Objetivos/No-objetivos, Invariantes, RF, AC, Decisiones abiertas, Definición de verificado |
| `.planning/roadmap.md`   | GSD           | El mapa (Milestone/Phase/Task)      | Milestones, Phases con tareas y criterios de cierre, vista de estado, log de decisiones |
| `.planning/state.json`   | GSD           | La posición actual del proyecto     | Fase activa, tareas hechas/bloqueadas, verification gates, session log |
| `.planning/tasks/*.md`   | GSD           | Tarea atómica autocontenida         | Objetivo, contexto mínimo, archivos a tocar, pasos TDD, verificación binaria, reporte DONE/VERIFIED |
| `plan.md`                | Superpowers   | El plan de implementación con TDD  | Preparación del workspace, tareas RED-GREEN-REFACTOR, code review, cierre del branch |
| `design.md`              | Superpowers   | Documento de diseño (de brainstorming) | Decisiones de diseño, alternativas descartadas, restricciones |
| `feature_list.json`      | SDD/harness   | Mapa de control del harness         | Features, estado, dependencias — machine-readable, persistente |

**Una manera de acordarte del rol de cada uno:**

- `spec.md` → *qué* y *qué lo define como hecho*.
- `roadmap.md` → *en qué orden* y *con qué dependencias*.
- `state.json` → *dónde estamos ahora*.
- `tasks/*.md` → *qué hace exactamente cada subagente*.
- `plan.md` → *cómo se ejecuta cada task con TDD*.
- `feature_list.json` → *qué existe y en qué estado* (para el harness).

> Regla de oro: si un dato existe en más de un archivo, el **source of truth** es el más "estructurado y diff-able". La spec es la verdad sobre intención; `state.json` es la verdad sobre progreso; el código es la verdad sobre implementación. Nunca dejes que la conversación sea la fuente de verdad de nada.

---

## 2.7 Ejemplo completo: "Filtrar proyectos por estado y fecha"

El directorio `examples/m2-unified-workflow/` contiene el caso de punta a punta. Te recomiendo leerlo en este orden:

1. `TICKET.md` — cómo llega la materia prima (vaga, con supuestos ocultos).
2. `spec.md` — cómo SDD la convierte en contrato (12 secciones, 7 AC binarios, 2 decisiones resueltas).
3. `.planning/roadmap.md` + `state.json` — cómo GSD descompone en 3 fases y 8 tasks, y trackea el estado.
4. `.planning/tasks/phase-1.1-task-01..03.md` — cómo cada task es autocontenida para un agente fresco.
5. `plan.md` — cómo Superpowers convierte las tasks en un plan RED-GREEN-REFACTOR.
6. `RESULTADO.md` — el cierre con evidencia: 7 AC en verde, invariantes confirmados, scope creep cero.

El punto del ejemplo no es el código en sí (no hay código, son las plantillas aplicadas). El punto es que **el mismo ticket vago, procesado con esta metodología, no tiene ni una sola decisión tomada en silencio**. Cada ambigüedad del ticket es una casilla ✅ verificable en el resultado.

**Ejercicios de completación sobre este caso:** `examples/m2-unified-workflow/EJERCICIOS.md` (fading: completa la spec → el plan → el prompt).

---

## 2.8 Cómo adoptarlo sin morir en el intento

No intentes montar los tres frameworks el primer día. Hay niveles de adopción (1, 1.5, 2 y 3), y cada uno ya te hace mejor que el anterior:

### Nivel 1 — Mínimo viable
- Escribe `spec.md` antes de pedirle código al agente.
- Pídele que ejecute contra los AC, no contra su imaginación.
- Resuelve los `[NEEDS CLARIFICATION]` antes de codear.
- **Costo:** 15-20 minutos por feature. **Ganancia:** eliminas gran parte de los errores más comunes (hasta un 50% según el estudio citado en §2.2).

### Nivel 1.5 — SDD + TDD vanilla (sin framework)
- El Nivel 1 cubre el QUÉ (la spec). Este nivel añade el CÓMO disciplinado (TDD) **sin instalar nada**: la disciplina vive en tu `AGENTS.md` y en el prompt de arranque — literalmente le pides al modelo que configure y confirme la metodología.
- El ciclo por tarea: **RED** (test que falla, mostrado) → **GREEN** (código mínimo) → **REFACTOR** (sin cambiar comportamiento) → **DONE/VERIFIED** con evidencia. Es el mismo TDD de Superpowers, aplicado por prompt en vez de por skill.
- Kit copy-paste completo: [`templates/sdd-tdd-vanilla.md`](../templates/sdd-tdd-vanilla.md) — reglas para `AGENTS.md`, prompt de arranque, prompt por tarea y prompt de cierre.
- **Cuándo:** tareas que caben en una sesión, repos donde no puedes instalar nada, o cuando quieres entender la disciplina por dentro antes de instalarla.
- **La trampa:** es advisory — si el agente salta el RED, nada lo bloquea mecánicamente. El gate que lo vuelve determinístico es el pre-commit del Módulo 6… o la versión instalada: **Gentle-AI** (Gentleman Programming, MIT, 16 agentes) hace exactamente este flujo con verificación bloqueante — su `/sdd-init` detecta el framework de testing del proyecto (vitest, pytest, go test…) y ofrece activar **Strict TDD Mode**; `sdd-apply` recibe las instrucciones del ciclo como obligatorias y `sdd-verify` impide archivar si un requisito quedó sin test.
- **Ganancia:** el código sale con test primero por contrato, y aprendes el flujo que los frameworks empaquetan.

### Nivel 2 — Medio (sumar GSD)
- Añade `.planning/roadmap.md` y `state.json` para features que duren más de una sesión.
- Divide el trabajo en phases y tasks atómicas.
- Al cerrar la sesión, actualiza `state.json` con el handoff (esto se conecta con el Módulo 4).
- **Ganancia:** el context rot deja de matarte; un agente nuevo continúa sin reconstruir la historia.

### Nivel 3 — Completo (sumar Superpowers)
- Usa worktrees aislados por feature.
- Ejecuta cada task con un subagente de contexto fresco.
- Impón RED-GREEN-REFACTOR estricto.
- Haz code review contra el plan antes del PR.
- **Ganancia:** la calidad sale por defecto, no por suerte.

> **Consejo de adopción:** empieza siempre por el Nivel 1 con features reales de tu trabajo. La primera vez una spec te toma 40 minutos y te parece exagerado. A la quinta, te toma 15 minutos y no puedes creer que antes codificaras sin esto. Es el mismo efecto que tuvo aprender TDD: al principio duele, después no sabes vivir sin él.

---

## 2.9 Preguntas frecuentes (y trampas comunes)

**— ¿No es esto burocracia que frena al equipo?**
Solo si lo usas al nivel máximo para todo. Un hotfix de una línea no necesita `spec.md` + `roadmap.md` + `plan.md`. La heurística del nivel de rigor (sección 2.2) existe precisamente para esto: el mínimo que elimine la ambigüedad.

**— ¿Qué gana el agente con una spec vs. un buen prompt?**
Un buen prompt describe la intención una vez; una spec describe el contrato y sobrevive al contexto. El prompt se degrada con la conversación; la spec no. Además, la spec es auditable por humanos y diff-able por git, cosa que un prompt no es.

**— ¿GSD o Superpowers, con cuál empiezo?**
Si tu problema es "pierdo el hilo entre sesiones", GSD. Si tu problema es "el código sale con calidad irregular", Superpowers. En la práctica, casi todos necesitan GSD primero (el context rot mata antes que la calidad irregular).

**— ¿Y si la spec cambia mientras se codea?**
Bienvenido a Spec-Anchored: la spec y el código se mantienen alineados a la fuerza por los tests. Si descubres que la spec estaba mal, **actualiza la spec primero**, no el código a escondidas. El diff de la spec es información valiosa para el siguiente que la lea.

**— ¿Esto sirve para algo que no sea backend web?**
Sí. SDD es agnóstico al dominio: sirve para CLI, data pipelines, scripts, infra como código, migraciones de DB. Los AC siempre pueden escribirse como "este comando devuelve esto" o "este archivo tiene esta forma".

---

> **Practica esto:** el [Playground](../playground/) ejecuta en el navegador los
> ejemplos de este módulo (filterByDate, el task-store, invariante + sensor,
> TDD red → green). Sentir las invariantes en código vale más que leerlas.

## Referencias de este módulo

- **SDD — metodología:** [GitHub Spec Kit (blog)](https://github.blog/ai-and-ml/generative-ai/spec-driven-development-with-ai-get-started-with-a-new-open-source-toolkit/), [repo](https://github.com/github/spec-kit) (1.0, con `/speckit-converge`), [paper AIWare 2026](https://arxiv.org/pdf/2602.00180), [SDD Flow comunitario](https://github.com/Ataden/SDD_Flow).
- **Análisis del ecosistema SDD:** [Böckeler — Understanding SDD: Kiro, spec-kit, and Tessl](https://martinfowler.com/articles/exploring-gen-ai/sdd-3-tools.html) — de dónde salen los tres niveles de rigor de §2.2, con crítica honesta (verbosidad, revisar markdown en vez de código).
- **GSD:** [overview de GSD Redux](https://deepwiki.com/open-gsd/get-shit-done-redux/1-overview).
- **Superpowers:** [repo obra/superpowers](https://github.com/obra/superpowers).
- **SDD + TDD sin framework (Nivel 1.5):** plantilla `templates/sdd-tdd-vanilla.md` — reglas de AGENTS.md + prompts del ciclo.
- **Gentle-AI (Gentleman Programming) — el flujo instalado:** [repo](https://github.com/Gentleman-Programming/gentle-ai) · [documentación en español](https://gentle-ai-wiki.gentlemanprogramming.com/es/) — configurador MIT (16 agentes): Engram (memoria), SDD de 10 fases, **Strict TDD Mode** con detección de capacidades y verificación bloqueante, permisos con lista de negación (`.env*`, llaves, secrets).
- **Sobre context rot y por qué el filesystem como base de datos:** [Anthropic — Effective Harnesses for Long-Running Agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents), [Learn Harness Engineering](https://walkinglabs.github.io/learn-harness-engineering/en/).
- **Sobre specs refinadas que reducen errores ~50%:** paper AIWare 2026 (link arriba).

---

> **Cierre del módulo:** si al terminar de leer esto solo te queda una idea, que sea esta — *especificar es delegar con confianza; no especificar es delegar y rezar*. El resto del curso son técnicas para que esa confianza esté bien puesta.