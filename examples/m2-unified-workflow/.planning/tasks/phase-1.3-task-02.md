# Task: Revisar diff contra alcance de la spec (sección 7)

> **Phase:** 1.3
> **Milestone:** M1
> **Spec ref:** `../spec.md#7-diseño-técnico-pista-no-solución` (alcance)
> **Plan ref:** `../../plan.md#tarea-7`
> **Estado:** completada
> **Agente asignado:** gsd-verifier
> **Estimación:** ~5 min
> **Resultado:** diff auditado contra `main`: 8 archivos, todos dentro de la sección 7; scope creep cero.

---

## Objetivo
Auditar `git diff main` y confirmar que solo se tocaron los archivos del alcance de la sección 7 de la spec, sin cambios de schema ni de permisos.

## Contexto que el agente necesita
- **Spec relevante:** `../spec.md` sección 7 (archivos previstos) y sección 3 (invariantes).
- **Patrón a seguir:** cualquier archivo fuera de la lista es un hallazgo que se reporta, no se ignora.

## Pasos
1. `git diff main --stat` → lista de archivos tocados.
2. Comparar contra la sección 7 de la spec; cualquier extra es scope creep.
3. Confirmar que `policies/` y las migraciones no tienen cambios.
4. Actualizar `spec.md` (estado `verificada` + commit SHA) y `state.json` (`ship_ready: true`); preparar el PR.

## Verificación (criterio binario de "hecha")
- [x] Diff revisado: 8 archivos, todos dentro del alcance de la sección 7.
- [x] `policies/` y migraciones sin cambios.

## Cómo reportar al terminar (DONE/VERIFIED)
- **Verifiqué:** diff contra `main` sin archivos fuera de alcance; scope creep: cero.
- **Cierre:** spec `verificada` con SHA 8f3a2c1, `state.json` con `ship_ready: true`, PR #12 enviado.

## Bloqueos / [NEEDS CLARIFICATION]
Ninguno.