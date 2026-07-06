# Task: Método `findFiltered` con status en ProjectRepo

> **Phase:** 1.1
> **Milestone:** M1
> **Spec ref:** `../spec.md#RF-1` (AC-1, AC-2)
> **Plan ref:** `../../plan.md#tarea-2`
> **Estado:** pendiente
> **Agente asignado:** gsd-executor
> **Estimación:** ~5 min

---

## Objetivo
Añadir el método `findFiltered({ statuses?: string[], ... })` a `ProjectRepo` que filtra por el conjunto de estados usando query builder parameterizado (sin interpolación de strings en SQL).

## Contexto que el agente necesita
- **Spec relevante:** `../spec.md` sección 3 (invariante: "nunca se interpola en SQL") y RF-1.
- **Archivos a leer antes de empezar:**
  - `src/repositories/ProjectRepo.ts` — método `findAll` existente, para copiar el patrón de paginación.
- **Patrón a seguir:** query builder de Knex (`repo.qb.whereIn('status', statuses)`), NUNCA `repo.qb.raw(\`status IN (${...})\`)`.

## Archivos a crear o modificar
- `src/repositories/ProjectRepo.ts` — añadir `findFiltered`.
- `tests/repositories/ProjectRepo.filter.test.ts` — tests del repo con DB de prueba.

## Pasos (TDD)
1. **RED:** test que llama a `findFiltered({ statuses: ['active'] })` y afirma que todos los proyectos devueltos tienen `status='active'`. Test con `['active','archived']` afirma subconjunto.
2. Ejecuta: `npm test -- ProjectRepo.filter` → fallan.
3. **GREEN:** implementa `findFiltered` usando `whereIn` cuando `statuses` venga.
4. Ejecuta: `npm test -- ProjectRepo.filter` → pasan.
5. **REFACTOR:** reutiliza la lógica de paginación de `findAll` en un helper privado.

## Verificación (criterio binario de "hecha")
- [ ] `npm test -- ProjectRepo.filter` pasa.
- [ ] No hay interpolación de strings en SQL (`grep -n "raw\|\${" src/repositories/ProjectRepo.ts` no debe aparecer en el nuevo método).
- [ ] No se tocaron archivos fuera de la lista.

## Cómo reportar al terminar (DONE/VERIFIED)
- **Verifiqué:** tests del repo, grep de interpolación limpio.
- **No verifiqué:** el flujo HTTP completo (va en task-03).
- **Próxima task sugerida:** `tasks/phase-1.1-task-03.md` (conectar controller-service-repo).

## Bloqueos / [NEEDS CLARIFICATION]
Ninguno.