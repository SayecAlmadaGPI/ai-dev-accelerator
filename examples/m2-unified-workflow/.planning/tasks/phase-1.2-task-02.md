# Task: Extender `findFiltered` con rango de fechas

> **Phase:** 1.2
> **Milestone:** M1
> **Spec ref:** `../spec.md#RF-2` (AC-3)
> **Plan ref:** `../../plan.md#tarea-5`
> **Estado:** completada
> **Agente asignado:** gsd-executor
> **Estimación:** ~5 min
> **Resultado:** tests del repo en verde, rango inclusivo sobre `created_at` (AC-3 verificado).

---

## Objetivo
Extender `findFiltered` en `ProjectRepo` para aceptar `from`/`to` y filtrar por `created_at` con rango inclusivo en ambos extremos, siempre con query builder parameterizado.

## Contexto que el agente necesita
- **Spec relevante:** `../spec.md` RF-2: la fecha del filtro es `created_at` (no `updated_at`), inclusivo en ambos extremos (D-1 y D-2 de la sección 10).
- **Archivos a leer antes de empezar:**
  - `src/repositories/ProjectRepo.ts` — `findFiltered` ya filtra por `statuses` (phase 1.1).
- **Patrón a seguir:** `qb.whereBetween('created_at', [from, to])`, NUNCA interpolación de strings en SQL.

## Archivos a crear o modificar
- `src/repositories/ProjectRepo.ts` — extender `findFiltered` con `from`/`to`.
- `tests/repositories/ProjectRepo.filter.test.ts` — tests del rango inclusivo.

## Pasos (TDD)
1. **RED:** test `findFiltered({ from: '2026-01-01', to: '2026-06-30' })` devuelve solo proyectos con `created_at` en el rango, extremos incluidos.
2. Ejecuta: `npm test -- ProjectRepo.filter` → fallan.
3. **GREEN:** añade `whereBetween` cuando vengan `from`/`to`.
4. Ejecuta: `npm test -- ProjectRepo.filter` → pasan.
5. **REFACTOR:** nada nuevo; el helper de paginación ya existe desde phase 1.1.

## Verificación (criterio binario de "hecha")
- [x] `npm test -- ProjectRepo.filter` pasa (incluye rango de fechas).
- [x] No hay interpolación de strings en SQL en el método.
- [x] No se tocaron archivos fuera de la lista.

## Cómo reportar al terminar (DONE/VERIFIED)
- **Verifiqué:** tests del repo con rango inclusivo en verde (AC-3 a nivel repo).
- **No verifiqué:** la combinación AND con `status` (va en task-03).
- **Próxima task sugerida:** `tasks/phase-1.2-task-03.md` (combinación AND + no-regresión).

## Bloqueos / [NEEDS CLARIFICATION]
Ninguno.