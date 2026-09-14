# Task: Validación de `from`/`to` (formato y rango)

> **Phase:** 1.2
> **Milestone:** M1
> **Spec ref:** `../spec.md#RF-2` (AC-3, AC-5)
> **Plan ref:** `../../plan.md#tarea-4`
> **Estado:** completada
> **Agente asignado:** gsd-executor
> **Estimación:** ~5 min
> **Resultado:** tests en verde, fechas validadas en el boundary (AC-5 verificado).

---

## Objetivo
Validar los query params `from` y `to` del endpoint `GET /api/projects`: formato de fecha ISO (`YYYY-MM-DD`), rango coherente (`from <= to`) y rechazo con `400` ante entradas inválidas.

## Contexto que el agente necesita
- **Spec relevante:** `../spec.md` RF-2 (el filtro usa `created_at`, inclusivo en ambos extremos) y sección 3 (validación en el boundary).
- **Archivos a leer antes de empezar:**
  - `src/api/projects/controller.ts` — ya valida `status` (phase 1.1); seguir el mismo patrón.
  - `src/schemas/parseStatusFilter.ts` — helper extraído en phase 1.1, como referencia de estilo.
- **Patrón a seguir:** la validación de input vive en el controller, nunca en el service ni en el repo.

## Archivos a crear o modificar
- `src/api/projects/controller.ts` — parsear y validar `from`/`to`.
- `tests/api/projects/date-filter.test.ts` — tests de formato, rango y 400.

## Pasos (TDD)
1. **RED:** `date-filter.test.ts` con: `?from=2026-01-01` parsea sin error; `?from=not-a-date` → `400`; `?from=2026-06-30&to=2026-01-01` (rango invertido) → `400`.
2. Ejecuta: `npm test -- date-filter` → fallan.
3. **GREEN:** valida formato ISO y coherencia de rango en el controller.
4. Ejecuta: `npm test -- date-filter` → pasan.
5. **REFACTOR:** si hay duplicación con la validación de `status`, extraer el helper de parseo de query params.

## Verificación (criterio binario de "hecha")
- [x] `npm test -- date-filter` pasa.
- [x] No se tocaron archivos fuera de la lista.
- [x] No se modificaron tests existentes para hacerlos pasar.

## Cómo reportar al terminar (DONE/VERIFIED)
- **Verifiqué:** `npm test -- date-filter` verdes, `400` para formato inválido (AC-5).
- **No verifiqué:** el filtro contra la DB real (va en task-02).
- **Próxima task sugerida:** `tasks/phase-1.2-task-02.md` (rango de fechas en el repo).

## Bloqueos / [NEEDS CLARIFICATION]
Ninguno.