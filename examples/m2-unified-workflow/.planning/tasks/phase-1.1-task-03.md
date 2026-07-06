# Task: Conectar controller → service → repo para status

> **Phase:** 1.1
> **Milestone:** M1
> **Spec ref:** `../spec.md#RF-1` (AC-1, AC-2, AC-4 integrados)
> **Plan ref:** `../../plan.md#tarea-3`
> **Estado:** pendiente
> **Agente asignado:** gsd-executor
> **Estimación:** ~5 min

---

## Objetivo
Unir las piezas: el controller (task-01) llama al service, que invoca `findFiltered` del repo (task-02), y se devuelve la respuesta paginada con el campo `total`.

## Contexto que el agente necesita
- **Spec relevante:** `../spec.md` RF-1 (formato de salida `{ projects, total, page }`).
- **Archivos a leer antes de empezar:**
  - `src/api/projects/service.ts` — método actual.
  - `src/api/projects/controller.ts` — ya modificado en task-01.

## Archivos a crear o modificar
- `src/api/projects/service.ts` — pasar `statuses` al repo y armar la respuesta.
- `tests/api/projects/status-filter.test.ts` — extender con test end-to-end del flujo.

## Pasos (TDD)
1. **RED:** test end-to-end que hace petición HTTP real al endpoint de prueba con `?status=active` y afirma que `total === cuenta de proyectos con status=active` en la DB de test.
2. Ejecuta: falla.
3. **GREEN:** conecta controller → service → repo.
4. Ejecuta: pasa.
5. **REFACTOR:** verifica que no se duplicó la validación (la validación vive en el controller, no en el service).

## Verificación (criterio binario de "hecha")
- [ ] `npm test -- status-filter` pasa (incluye el e2e nuevo).
- [ ] `npm test -- projects` (los 12 tests existentes) siguen pasando (AC-7).
- [ ] La validación no se duplicó en service y repo.

## Cómo reportar al terminar (DONE/VERIFIED)
- **Verifiqué:** AC-1, AC-2, AC-4 vía tests; AC-7 (no-regresión) verde.
- **No verifiqué:** el filtro por fecha (va en phase 1.2).
- **Fase 1.1 completa:** marcar las 3 tasks y la phase 1.1 como verificadas en `state.json`.

## Bloqueos / [NEEDS CLARIFICATION]
Ninguno.

> Las tasks de las fases 1.2 y 1.3 siguen el mismo patrón (fecha + combinación, y verificación final respectivamente) y se generan con `/gsd-plan-phase`. No se incluyen completas aquí para no repetir el molde; el archivo `../../RESULTADO.md` muestra el resumen del cierre.