<!--
  roadmap.md — Plantilla de roadmap estilo GSD (Get Shit Done Redux)
  ------------------------------------------------------------------
  El roadmap es la descomposición jerárquica del trabajo:
    Milestone → Phase → Task
  Vive en .planning/ porque el filesystem ES la base de datos del proyecto.
  Sobrevive entre sesiones; el contexto del agente no.

  Por qué JSON/YAML/MD y no "charla":
  - Es machine-readable (los agentes de GSD lo parsean).
  - Es diff-able (puedes ver cómo evolucionó el plan).
  - Es auditable (quién cambió qué, cuándo).

  Estructura jerárquica de GSD:
  - Milestone: hito de valor entregable (ej. "Filtros de proyectos v1").
  - Phase: unidad planificable y ejecutable (ej. "Backend del filtro").
  - Task: unidad atómica ejecutable por un agente con contexto fresco.
-->

# Roadmap: [Nombre del proyecto o feature grande]

> **Spec raíz:** [link a spec.md]
> **Última actualización:** [YYYY-MM-DD]
> **Estado global:** planeando | en-progreso | bloqueado | entregado

---

## Milestone 1: [Nombre del hito de valor]

**Descripción:** [Qué valor entregable representa este milestone, en 1-2 líneas]
**Spec asociada:** [link a la spec que define este milestone]
**Estado:** planeando | en-progreso | verificado | entregado

### Phase 1.1: [Nombre de la fase, unidad ejecutable]

**Objetivo:** [Qué logra esta fase específicamente]
**Depende de:** [otra fase o "ninguna"]
**Estado:** draft | planeada | en-ejecución | verificada | archivada
**Agente responsable:** [gsd-planner | gsd-executor | gsd-verifier | ninguno]

**Tareas (referencia a .planning/tasks/):**
- [ ] `tasks/phase-1.1-task-01.md` — [descripción corta]
- [ ] `tasks/phase-1.1-task-02.md` — [descripción corta]
- [ ] `tasks/phase-1.1-task-03.md` — [descripción corta]

**Criterios de cierre de la fase:**
- [ ] Todas las tareas marcan ✅.
- [ ] Los AC de la spec asociada a esta fase están verificados.
- [ ] `/gsd-verify-work` no reporta desviaciones contra el objetivo.

**Artefacto de salida:** [qué produce esta fase: endpoint, módulo, migración, etc.]

### Phase 1.2: [Nombre de la fase]
[Repetir bloque]

---

## Milestone 2: [Nombre del hito]
[Repetir bloque]

---

## Vista de estado (resumen ejecutivo)

| Milestone | Fases | Tareas totales | Hechas | En progreso | Bloqueadas |
|-----------|-------|-----------------|--------|-------------|------------|
| M1        | 2     | 8               | 0      | 0           | 0          |
| M2        | 1     | 4               | 0      | 0           | 0          |

---

## Decisiones de planificación (logs)

<!-- Un log append-only de por qué el roadmap quedó así.
     Útil cuando retomas en otra sesión y no recuerdas por qué descartaste la opción B. -->

- **[YYYY-MM-DD]** Decidimos hacer Phase 1.1 antes que 1.2 porque [razón].
- **[YYYY-MM-DD]** Cambiamos el alcance de M2: [qué se sacó y por qué].

---

## Workstreams paralelos (si aplica)

<!-- Para trabajo en paralelo. Cada workstream es una pista independiente. -->

| Workstream | Owner     | Milestone | Estado  |
|------------|-----------|-----------|---------|
| backend    | [nombre]  | M1        | activo  |
| frontend   | [nombre]  | M1        | activo  |

---

<!--
  Nota GSD: el roadmap es la fuente de verdad del "qué" y el "cuándo".
  El "cómo" detallado vive en tasks/*.md.
  Si una fase no puede planearse, usa /gsd-discuss-phase antes de /gsd-plan-phase.
-->