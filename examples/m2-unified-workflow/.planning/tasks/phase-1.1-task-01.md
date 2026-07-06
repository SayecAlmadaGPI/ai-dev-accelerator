# Task: Validación del query param `status`

> **Phase:** 1.1
> **Milestone:** M1
> **Spec ref:** `../spec.md#RF-1` (y AC-1, AC-4)
> **Plan ref:** `../../plan.md#tarea-1`
> **Estado:** pendiente
> **Agente asignado:** gsd-executor
> **Estimación:** ~5 min

---

## Objetivo
Validar el query param `status` del endpoint `GET /api/projects`: aceptar uno o varios valores separados por coma, y rechazar con `400` cualquier valor que no pertenezca al enum de estados.

## Contexto que el agente necesita
- **Spec relevante:** leer `../spec.md` secciones 3 (enum de status como constraint) y RF-1.
- **Archivos a leer antes de empezar:**
  - `src/schemas/project.ts` — enum de estados válidos.
  - `src/api/projects/controller.ts` — cómo se reciben query params hoy.
- **Patrón a seguir:** la validación de input usa el helper `validateQuery` de `src/schemas/`.

## Archivos a crear o modificar
- `src/api/projects/controller.ts` — parsear `status` y validar contra el enum.
- `tests/api/projects/status-filter.test.ts` — tests del happy path y del 400.

## Pasos (TDD)
1. **RED:** Escribe `status-filter.test.ts` con:
   - test: `?status=active` → no lanza, parsea a `['active']`.
   - test: `?status=active,archived` → parsea a `['active','archived']`.
   - test: `?status=bogus` → responde `400`.
2. Ejecuta: `npm test -- status-filter` → deben fallar (no hay implementación).
3. **GREEN:** En el controller, parsea `status`, valida cada valor contra el enum, si alguno no pertenece → `next(BadRequest(...))`.
4. Ejecuta: `npm test -- status-filter` → deben pasar.
5. **REFACTOR:** si hay lógica repetible, extrae a `src/schemas/parseStatusFilter.ts`.

## Verificación (criterio binario de "hecha")
- [ ] `npm test -- status-filter` pasa.
- [ ] No se tocaron archivos fuera de la lista.
- [ ] No se modificaron tests existentes para hacerlos pasar.
- [ ] `npm run lint && npm run typecheck` sin errores nuevos.

## Cómo reportar al terminar (DONE/VERIFIED)
- **Verifiqué:** `npm test -- status-filter` (3/3 verdes), `npm run typecheck` limpio.
- **No verifiqué:** comportamiento con base de datos real (va en task-02).
- **Supuestos:** asumí que el enum de estados vive en `src/schemas/project.ts` (confirmado al leerlo).
- **Próxima task sugerida:** `tasks/phase-1.1-task-02.md` (repo con filtro real).

## Bloqueos / [NEEDS CLARIFICATION]
Ninguno.