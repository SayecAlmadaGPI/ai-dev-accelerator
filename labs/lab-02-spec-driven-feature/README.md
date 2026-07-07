<!--
  lab-02-spec-driven-feature/README.md
  ------------------------------------
  Lab 02 — Spec-Driven Feature. Implementar un feature completo de
  extremo a extremo, desde la spec hasta el commit verde. Fase 3.

  Ejercita: M2 (SDD + GSD + Superpowers), M3 (workbench), M6 (verificación).

  Principio del lab: recorrer el flujo completo del curso en un feature
  real (no trivial, no enorme). Lo importante no es el código que produces,
  es la disciplina de spec → plan → tasks → implement → verify → commit,
  con el reporte DONE/VERIFIED al cerrar.
-->

# Lab 02 — Spec-Driven Feature

> **Objetivo:** recorrer el flujo completo del curso en un feature real:
> ticket → spec → plan → tasks → implement → verify → commit, cerrando
> con DONE/VERIFIED. No se trata del código, se trata de la disciplina.

## Módulos que ejercita

- **M2** — Spec-Driven Development + GSD (loop) + Superpowers (plan TDD).
- **M3** — workbench (AGENTS.md, .planning/, init.sh).
- **M6** — verificación (pipeline, DONE/VERIFIED, golden tests).

## La feature

Un mini "reporteador de estado de proyectos" con persistencia en archivo
(JSON plano, sin DB). Funciones:

- `addTask(project, task)` — agrega una tarea a un proyecto.
- `listOpenTasks(project)` — lista tareas no cerradas.
- `closeTask(project, taskId)` — cierra una tarea.
- `statusReport(project, dateRange?)` — devuelve un resumen: total,
  abiertas, cerradas, y (si hay `dateRange`) cuántas se cerraron en el
  rango `[from, to)`.

Invariantes:
- `from` inclusivo, `to` exclusivo (igual que el lab-01; recicla el
  aprendizaje).
- No se mutan los argumentos; el store es append + rewrite del JSON.
- `closeTask` sobre una tarea ya cerrada es idempotente (no error).
- `closeTask` sobre un `taskId` inexistente lanza `TaskNotFound`.

## Parte 1 — Spec

Escribe `docs/specs/project-status-report.md` desde `templates/spec.md`.
Cuida especialmente:
- **No-objetivos** explícitos (NO multi-usuario, NO persistencia en DB,
  NO concurrencia, NO autenticación).
- **Invariantes** (los cuatro de arriba).
- **Criterios de aceptación**, uno por invariante, más AC de behavior
  (`statusReport` vacío devuelve ceros, no errores).
- Marca con `[NEEDS CLARIFICATION]` lo que no sepas y resuélvelo antes de
  seguir (M2).

> Si terminas la spec sin ningún `[NEEDS CLARIFICATION]`, o la escribiste
  de memoria o no la pensaste suficiente. Vuelve y busca la ambigüedad.

## Parte 2 — Roadmap GSD

Crea `.planning/roadmap.md` desde `templates/.planning/roadmap.md`.
Milestones → Phases → Tasks. Sugerencia de phases:
1. **Store y addTask** (con test de no-mutación).
2. **listOpenTasks y closeTask** (con test de idempotencia y TaskNotFound).
3. **statusReport con rango opcional** (con test de to-exclusivo y
   reporte vacío).

## Parte 3 — Plan TDD (Superpowers)

Para cada phase, un `plan.md` (desde `templates/plan.md`) con tareas
RED → GREEN → REFACTOR. **El test antes que el código** (M2 §TDD, M6
§6.6.4): esto reduce el espacio de test gaming.

## Parte 4 — Execute + Verify

Implementa task por task. Cierra cada task con su reporte
DONE/VERIFIED en `.planning/tasks/<id>.md` (M2 §tarea template):
- Qué se verificó (comando + número).
- Qué NO se verificó.
- Supuestos.
- Qué revisa el humano primero.

Al cerrar la sesión, deja `handoff.md` (M4) aunque termines — es
hábito, no solo continuidad.

## Parte 5 — CI gate

Crea `verification-pipeline.yaml` desde `templates/verification-pipeline.yaml`
(adaptado a tu stack). Confirma que el diff guard detecta si tocas tests
golden y que el gate DONE/VERIFIED bloquea un PR sin reporte.

## Criterio de terminación

- Los 4 AC tienen tests que pasan; mutation testing (si lo tienes) no
  encuentra mutantes sin capturar en las 4 funciones.
- `init.sh` reproduce el entorno en verde desde cero.
- `.planning/` consistente con el estado real.
- Un PR con reporte DONE/VERIFIED completo pasa el gate.
- `RESULTADO.md` con: qué `[NEEDS CLARIFICATION]` encontraste en la
  spec, qué phantom/hollow report atrapaste con el sensor, y qué
  regla promueves de prosa a check.

## Qué debes haber aprendido

- Que la spec con no-objetivos explícitos es la primera defensa contra
  el scope creep (M7 §7.3).
- Que TDD (test antes que código) reduce el test gaming (M6 §6.6.4).
- Que el loop GSD (Initialize → Discuss → Plan → Execute → Verify →
  Ship) produce sesiones terminables, no maratones infinitas.
- Que el gate DONE/VERIFIED en CI convierte la verificación en hábito,
  no en cortesía.

## Referencias

- `modules/02-spec-plan-execute.md`
- `modules/03-workbench.md`, `modules/06-verificacion.md`
- `templates/spec.md`, `templates/plan.md`,
  `templates/.planning/roadmap.md`, `templates/.planning/tasks/_template.md`,
  `templates/DONE_VERIFIED.md`, `templates/verification-pipeline.yaml`
- `examples/m2-unified-workflow/` (el ejemplo trabajado del M2)