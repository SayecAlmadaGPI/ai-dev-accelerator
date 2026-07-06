<!--
  plan.md — Plantilla de plan de implementación (estilo Superpowers)
  -------------------------------------------------------------------
  El plan NO es la spec. El plan dice CÓMO se ejecuta la spec, tarea por tarea,
  con paths exactos y pasos verificables. Está pensado para que un
  "junior entusiasta con mal gusto y sin criterio" pueda seguirlo sin desviarse.

  Filosofía Superpowers:
  - Cada tarea toma 2-5 minutos (no horas).
  - Cada tarea incluye los paths exactos de los archivos a tocar.
  - Cada tarea tiene pasos de verificación (no "y ya está").
  - Se hace TDD real: RED → GREEN → REFACTOR. El código sin test se borra.

  Reglas para el agente que ejecuta este plan:
  - Trabaja UNA tarea a la vez.
  - No toques archivos que no están listados en la tarea.
  - Si una tarea no puede completarse, detente y reporta; no improvises.
  - Verifica antes de declarar la tarea como hecha.
-->

# Plan de implementación: [Nombre del feature]

> **Spec de origen:** [link a spec.md o path relativo]
> **Branch / worktree:** [nombre de la rama git, ej. feature/project-status-filter]
> **Autor del plan:** [quién escribió el plan]
> **Fecha:** [YYYY-MM-DD]
> **Estado:** draft | en-ejecución | en-review | completado

---

## 0. Preparación del workspace

- [ ] Crear worktree aislado: `git worktree add ../<feature> -b feature/<slug>`
- [ ] Confirmar baseline limpia: `npm test` (o equivalente) debe estar en verde ANTES de empezar.
- [ ] Si el baseline no pasa, detente: no es culpa tuya, pero no puedes empezar sobre arena movediza.

---

## Resumen del plan

| # | Tarea                               | Archivos principales              | Verificación            |
|---|-------------------------------------|-----------------------------------|-------------------------|
| 1 | [descripción corta]                 | [paths]                           | [cómo se verifica]      |
| 2 | [descripción corta]                 | [paths]                           | [cómo se verifica]      |
| 3 | [descripción corta]                 | [paths]                           | [cómo se verifica]      |

---

## Tarea 1: [Nombre de la tarea, 2-5 min]

**Objetivo:** [qué se logra con esta tarea, en una línea]

**Archivos a crear/modificar:**
- `src/path/exact/archivo.ts` — [qué se le hace]
- `tests/path/exact/archivo.test.ts` — [qué test cubre]

**Pasos (TDD estricto):**
1. **RED:** Escribe el test primero que describe el comportamiento esperado.
   - [Qué debe afirmar el test]
2. Ejecuta el test: debe FALLAR (todavía no hay implementación).
   - **Comando:** `npm test -- archivo.test.ts`
3. **GREEN:** Escribe la implementación mínima para que el test pase.
   - [Qué escribir, a nivel de intención, no código completo]
4. Ejecuta el test: debe pasar.
   - **Comando:** `npm test -- archivo.test.ts`
5. **REFACTOR:** Mejora el código sin romper el test. Vuelve a ejecutar.

**Verificación de la tarea:**
- [ ] El test pasa.
- [ ] No se tocaron archivos fuera de la lista.
- [ ] `npm run lint` no agrega warnings nuevos.

**Notas / pistas:**
- [Si aplica: patrón del repo a seguir, gotcha conocido]

---

## Tarea 2: [Nombre de la tarea]
[Repetir el mismo bloque]

---

## Tarea N: Integración y verificación final

**Objetivo:** Asegurar que todo el plan cumple los criterios de aceptación de la spec.

**Pasos:**
1. Ejecutar el suite completo: `npm test`
2. Ejecutar cada verificación de los AC de la spec:
   - AC-1: [comando] → ✅/❌
   - AC-2: [comando] → ✅/❌
3. Confirmar que no se rompieron invariantes (sección 3 de la spec).
4. Revisar el diff completo: `git diff main` — ¿hay algo fuera de alcance?

**Definición de "Plan completado":**
- [ ] Todas las tareas 1..N-1 marcan ✅.
- [ ] Todos los AC de la spec están verificados.
- [ ] El code review (sección siguiente) pasó sin bloqueantes.

---

## Code review (post-implementación)

**Checklist de revisión (contra el plan, no contra el gusto):**
- [ ] Cada tarea se mapea a un commit claro.
- [ ] No hay código sin test.
- [ ] No se introdujeron abstracciones innecesarias (YAGNI).
- [ ] No se duplicó lógica existente (DRY).
- [ ] Los AC de la spec están todos cubiertos por tests.

**Hallazgos:**
- [Bloqueante 1: ...]
- [Sugerencia 1: ...]

---

## Cierre del branch

- [ ] Todos los tests pasan en verde.
- [ ] Opciones: merge / PR / conservar / descartar.
- [ ] Limpieza del worktree si se mergeó o descartó.
- [ ] Actualizar la spec a estado `verificada` con el commit SHA.

<!--
  Recordatorio Superpowers: "evidence over claims".
  No declares victoria: muéstrala con la salida de los tests.
-->