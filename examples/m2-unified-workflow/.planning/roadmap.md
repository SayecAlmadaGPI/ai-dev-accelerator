# Roadmap: Filtros de proyectos v1

> **Spec raíz:** `../spec.md`
> **Última actualización:** 2026-07-02
> **Estado global:** en-progreso

---

## Milestone 1: Filtros de proyectos v1

**Descripción:** Filtros por estado y rango de fechas en `GET /api/projects`, sin tocar schema ni romper el comportamiento existente.
**Spec asociada:** `../spec.md`
**Estado:** en-progreso

### Phase 1.1: Filtro por status (backend)

**Objetivo:** Implementar y testear el filtrado por `status` (uno o varios valores), con validación.
**Depende de:** ninguna
**Estado:** en-ejecución
**Agente responsable:** gsd-executor

**Tareas (referencia a `.planning/tasks/`):**
- [ ] `tasks/phase-1.1-task-01.md` — Validación del query param `status` (incluye caso inválido → 400).
- [ ] `tasks/phase-1.1-task-02.md` — Método `findFiltered` en `ProjectRepo` con status.
- [ ] `tasks/phase-1.1-task-03.md` — Conectar controller → service → repo para status.

**Criterios de cierre de la fase:**
- [ ] Todas las tareas marcan ✅.
- [ ] AC-1, AC-2, AC-4 verificados.
- [ ] `/gsd-verify-work` no reporta desviaciones.

**Artefacto de salida:** `GET /api/projects?status=...` funcional.

### Phase 1.2: Filtro por fecha y combinación

**Objetivo:** Agregar `from`/`to` (inclusivos) y la combinación AND con `status`.
**Depende de:** 1.1
**Estado:** planeada
**Agente responsable:** gsd-executor

**Tareas:**
- [ ] `tasks/phase-1.2-task-01.md` — Validación de `from`/`to` (formato y rango).
- [ ] `tasks/phase-1.2-task-02.md` — Extender `findFiltered` con rango de fechas.
- [ ] `tasks/phase-1.2-task-03.md` — Tests de combinación AND (AC-6) y no-regresión (AC-7).

**Criterios de cierre:**
- [ ] AC-3, AC-5, AC-6, AC-7 verificados.
- [ ] Los 12 tests existentes siguen pasando.

**Artefacto de salida:** endpoint con ambos filtros combinables.

### Phase 1.3: Verificación y ship

**Objetivo:** Auditoría final contra la spec y preparación del PR.
**Depende de:** 1.1, 1.2
**Estado:** planeada
**Agente responsable:** gsd-verifier

**Tareas:**
- [ ] `tasks/phase-1.3-task-01.md` — Ejecutar todas las verificaciones de AC-1..7.
- [ ] `tasks/phase-1.3-task-02.md` — Revisar diff contra alcance de la spec (sección 7).

---

## Vista de estado

| Milestone | Fases | Tareas totales | Hechas | En progreso | Bloqueadas |
|-----------|-------|-----------------|--------|-------------|------------|
| M1        | 3     | 8               | 0      | 1           | 0          |

---

## Decisiones de planificación

- **2026-07-02** Se separó `status` y `fecha` en fases distintas para poder ejecutarlas con subagentes de contexto fresco y reducir el riesgo de que uno contamine al otro.
- **2026-07-02** Se añadió una fase 1.3 de verificación dedicada porque la spec tiene 7 AC y conviene un cierre explícito antes del PR.

---

<!--
  Nota GSD: con este roadmap, un agente que arranca una sesión fresca lee
  roadmap.md + state.json y sabe exactamente dónde está el proyecto, sin
  reconstruir toda la historia de la conversación.
-->