# Task: Combinación AND de filtros y no-regresión

> **Phase:** 1.2
> **Milestone:** M1
> **Spec ref:** `../spec.md#RF-3` (AC-3, AC-6, AC-7)
> **Plan ref:** `../../plan.md#tarea-6`
> **Estado:** completada
> **Agente asignado:** gsd-executor
> **Estimación:** ~5 min
> **Resultado:** tests combinados en verde, AC-6 y AC-7 verificados.

---

## Objetivo
Combinar `status` y `from`/`to` con AND en el flujo HTTP completo y confirmar que los 12 tests existentes de `projects` siguen pasando.

## Contexto que el agente necesita
- **Spec relevante:** `../spec.md` RF-3 (los filtros combinan con AND; sin filtros, comportamiento actual sin cambios).
- **Archivos a leer antes de empezar:**
  - `src/api/projects/service.ts` — ya pasa `statuses` al repo (phase 1.1).
  - `src/repositories/ProjectRepo.ts` — `findFiltered` ya soporta ambos filtros por separado (task-02).
- **Patrón a seguir:** cada filtro se añade al query builder solo si viene presente; ausencia = no filtrar.

## Archivos a crear o modificar
- `src/api/projects/service.ts` — pasar `from`/`to` junto a `statuses`.
- `tests/api/projects/combined-filter.test.ts` — tests del AND y de la no-regresión.

## Pasos (TDD)
1. **RED:** test e2e `?status=active&from=2026-01-01` → solo proyectos `active` creados desde esa fecha (AND, no OR).
2. Ejecuta: `npm test -- combined-filter` → falla.
3. **GREEN:** el service pasa todos los filtros validados al repo.
4. Ejecuta: `npm test -- combined-filter` y `npm test -- projects` → pasan.
5. **REFACTOR:** sin filtros, el camino debe ser idéntico al de antes (sin cláusulas muertas).

## Verificación (criterio binario de "hecha")
- [x] AC-3 y AC-6 verificados vía tests combinados.
- [x] AC-7: los 12 tests existentes siguen en verde.
- [x] No se tocaron archivos fuera de la lista.

## Cómo reportar al terminar (DONE/VERIFIED)
- **Verifiqué:** AC-3 y AC-6 con tests e2e; AC-7 sin regresiones.
- **Fase 1.2 completa:** marcar las 3 tasks y la phase 1.2 como verificadas en `state.json`.

## Bloqueos / [NEEDS CLARIFICATION]
Ninguno.