# Task: Ejecutar todas las verificaciones de AC-1..7

> **Phase:** 1.3
> **Milestone:** M1
> **Spec ref:** `../spec.md#5-criterios-de-aceptación` (AC-1..AC-7)
> **Plan ref:** `../../plan.md#tarea-7`
> **Estado:** completada
> **Agente asignado:** gsd-verifier
> **Estimación:** ~5 min
> **Resultado:** 7/7 AC verificados con evidencia registrada en `../../RESULTADO.md`.

---

## Objetivo
Ejecutar cada verificación de la sección 5 de la spec con sus comandos concretos (curl + jq + npm test) y registrar la evidencia, sin confiar en claims.

## Contexto que el agente necesita
- **Spec relevante:** `../spec.md` sección 5 (comando de verificación por AC) y sección 11 (definición de "verificado").
- **Archivos a leer antes de empezar:**
  - `../../RESULTADO.md` — donde se registra la evidencia de cierre.
- **Patrón a seguir:** evidence over claims: cada ✅ debe respaldarse con la salida de un comando.

## Pasos
1. `npm test` → suite completa en verde.
2. Ejecutar AC-1..AC-6 con curl contra el endpoint de prueba y verificar con `jq`.
3. AC-7: `npm test -- projects` → 12/12 verdes.
4. Confirmar invariantes: mismos campos por proyecto, permisos intactos, 401 sin token.
5. Volcar la tabla de verificación en `../../RESULTADO.md`.

## Verificación (criterio binario de "hecha")
- [x] Los 7 AC ejecutados y registrados en `../../RESULTADO.md`.
- [x] Invariantes confirmados (schema, permisos, auth).

## Cómo reportar al terminar (DONE/VERIFIED)
- **Verifiqué:** AC-1..AC-7 con sus comandos; evidencia en `../../RESULTADO.md`.
- **Próxima task sugerida:** `tasks/phase-1.3-task-02.md` (auditoría de diff).

## Bloqueos / [NEEDS CLARIFICATION]
Ninguno.