# Plan de implementación: Filtros de proyectos por status y fecha

> **Spec de origen:** `./spec.md`
> **Branch / worktree:** `feature/project-status-date-filter`
> **Autor del plan:** Tech Lead
> **Fecha:** 2026-07-02
> **Estado:** en-ejecución

---

## 0. Preparación del workspace

- [x] Crear worktree aislado: `git worktree add ../proj-filter -b feature/project-status-date-filter`
- [x] Baseline limpia: `npm test` → 127 tests, todos verdes.

---

## Resumen del plan

| # | Tarea                                        | Archivos principales                                   | Verificación                          |
|---|----------------------------------------------|--------------------------------------------------------|---------------------------------------|
| 1 | Validar query param `status`                 | `controller.ts`, `status-filter.test.ts`              | tests parseo + 400                    |
| 2 | `findFiltered` en ProjectRepo (status)      | `ProjectRepo.ts`, `ProjectRepo.filter.test.ts`        | tests repo + grep interpolación       |
| 3 | Conectar controller→service→repo (status)    | `service.ts`, `status-filter.test.ts` (e2e)           | AC-1, AC-2, AC-4, AC-7                |
| 4 | Validar `from`/`to` (formato + rango)        | `controller.ts`, `date-filter.test.ts`               | tests formato + 400                   |
| 5 | Extender `findFiltered` con rango de fechas | `ProjectRepo.ts`, `ProjectRepo.filter.test.ts`       | tests repo fechas                     |
| 6 | Combinación AND + no-regresión               | `service.ts`, `combined-filter.test.ts`               | AC-3, AC-5, AC-6, AC-7                |
| 7 | Verificación final contra la spec            | (todos los AC)                                         | AC-1..7 + revisión de diff            |

---

## Tarea 1: Validar query param `status`

**Objetivo:** el controller parsea `status` (uno o varios, separados por coma) y rechaza valores fuera del enum con `400`.

**Archivos a crear/modificar:**
- `src/api/projects/controller.ts` — parsear y validar.
- `tests/api/projects/status-filter.test.ts` — tests.

**Pasos (TDD estricto):**
1. **RED:** `?status=active` → `['active']`; `?status=active,archived` → array; `?status=bogus` → 400.
2. `npm test -- status-filter` → fallan.
3. **GREEN:** validar contra el enum de `src/schemas/project.ts`.
4. `npm test -- status-filter` → pasan.
5. **REFACTOR:** extraer parseo a `src/schemas/parseStatusFilter.ts` si queda legible.

**Verificación:**
- [ ] tests pasan.
- [ ] no se tocaron archivos fuera de la lista.
- [ ] `npm run lint` sin warnings nuevos.

---

## Tarea 2: `findFiltered` en ProjectRepo (status)

**Objetivo:** método `findFiltered({ statuses?, from?, to?, page })` con query builder parameterizado.

**Archivos:** `src/repositories/ProjectRepo.ts`, `tests/repositories/ProjectRepo.filter.test.ts`.

**Pasos:**
1. **RED:** `findFiltered({ statuses: ['active'] })` devuelve solo `active`.
2. falla.
3. **GREEN:** `qb.whereIn('status', statuses)`.
4. pasa.
5. **REFACTOR:** helper de paginación compartido con `findAll`.

**Verificación:**
- [ ] `grep -n "raw\|\${" src/repositories/ProjectRepo.ts` no aparece en el método nuevo.
- [ ] tests del repo pasan.

---

## Tarea 3: Conectar controller → service → repo (status)

**Objetivo:** flujo HTTP end-to-end para status.

**Archivos:** `src/api/projects/service.ts`, `tests/api/projects/status-filter.test.ts` (añadir e2e).

**Pasos:**
1. **RED:** e2e `?status=active` → `total === cuenta de active en DB de test`.
2. falla.
3. **GREEN:** service llama al repo.
4. pasa.
5. **REFACTOR:** validación solo en controller, no duplicar en service.

**Verificación:**
- [ ] AC-1, AC-2, AC-4 verificados.
- [ ] AC-7 (los 12 tests existentes) siguen pasando.

> Fase 1.1 completada con esta tarea.

---

## Tarea 4-6: Filtro por fecha y combinación (fase 1.2)

[El mismo molde que 1-3, aplicado a `from`/`to` inclusivos sobre `created_at`, y a la combinación AND. Cada tarea es 2-5 min con RED-GREEN-REFACTOR. Se omite el detalle para no repetir.]

**Verificación combinada (cierre de 1.2):**
- [ ] AC-3 (rango inclusivo), AC-5 (fecha inválida → 400), AC-6 (AND) verificados.
- [ ] AC-7 sigue en verde.

---

## Tarea 7: Integración y verificación final (fase 1.3)

**Objetivo:** auditar todo contra la spec antes del PR.

**Pasos:**
1. `npm test` → suite completa en verde.
2. Ejecutar cada AC:
   - AC-1..AC-7 con los comandos de la spec.
3. `git diff main` → revisar que solo se tocaron los archivos de la sección 7 de la spec.
4. Confirmar invariantes: respuesta con mismos campos, permisos intactos, auth requerida.

**Definición de "Plan completado":**
- [ ] tareas 1..6 ✅.
- [ ] todos los AC verificados.
- [ ] code review sin bloqueantes.

---

## Code review (post-implementación)

**Checklist (contra el plan, no contra el gusto):**
- [ ] cada tarea → un commit claro.
- [ ] no hay código sin test.
- [ ] YAGNI: no se añadió ordenamiento ni vistas (están en no-objetivos).
- [ ] DRY: el helper de paginación se reutilizó, no se duplicó.
- [ ] todos los AC cubiertos por tests.

**Hallazgos:**
- _(ejemplo real durante la ejecución)_ Tarea 3: se detectó duplicación de validación entre controller y service → corregido en REFACTOR.

---

## Cierre del branch

- [ ] todos los tests en verde.
- [ ] opción elegida: **PR** (no merge directo).
- [ ] actualizar `spec.md` estado → `verificada` con commit SHA.
- [ ] actualizar `state.json`: `verification_gates.ship_ready = true`.

<!--
  Recordatorio Superpowers: "evidence over claims".
  Cada casilla marcada arriba debe tener un comando cuya salida la respalde.
-->