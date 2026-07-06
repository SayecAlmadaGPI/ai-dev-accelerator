# Spec: Filtrar proyectos por estado y fecha

> **ID:** project-status-date-filter
> **Tipo:** feature
> **Nivel de rigor:** Spec-Anchored
> **Estado:** aprobada
> **Propietario:** [PM + Tech Lead]
> **Fecha:** 2026-07-02

---

## 1. Contexto y motivación

**Problema actual:**
La lista de proyectos (`GET /api/projects`) devuelve todos los proyectos sin
orden ni filtro. Los gestores con más de 50 proyectos no pueden encontrar
los que necesitan. Pierden en promedio 2-3 minutos por consulta y a veces
se equivocan de proyecto al editar.

**Motivación para resolverlo ahora:**
Es la funcionalidad más solicitada del trimestre (3 tickets duplicados) y
bloquea el feature de "panel de proyectos vencidos", que entra en la misma
milestone.

**Usuarios afectados:**
Gestores de proyectos (rol `project_manager`). Aceptación firmada por el PM.

---

## 2. Objetivos y no-objetivos

**Objetivos (in scope):**
- [ ] Filtrar por `status` (un valor o varios).
- [ ] Filtrar por rango de fechas (`from` / `to`).
- [ ] Combinar ambos filtros (AND).
- [ ] Paginación sin romperse por los filtros.

**No-objetivos (out of scope):**
- [ ] NO: ordenamiento por columnas (ticket separado PROJ-150).
- [ ] NO: guardar filtros como vistas (backlog, no entra esta milestone).
- [ ] NO: filtros por cliente o por responsable (otra milestone).
- [ ] NO: cambiar el schema de `projects`.

> ⚠️ Si el agente propone añadir ordenamiento o vistas, debe detenerse: está fuera de alcance.

---

## 3. Invariantes y constraints

**Invariantes:**
- `GET /api/projects` sigue devolviendo los mismos campos por proyecto que hoy (no se agregan ni quitan).
- Los permisos existentes no se modifican ni relajan.
- El endpoint sigue requiriendo autenticación.

**Constraints técnicos:**
- **Stack:** Node 20 + Express + PostgreSQL + TypeScript.
- **Performance:** p95 del endpoint con filtros < 300ms con 10.000 proyectos.
- **Seguridad:** `status`, `from`, `to` se validan en el boundary; nunca se interpolan en SQL.

**Constraints de proceso:**
- No modificar migraciones ya aplicadas en producción.
- Los tests existentes de `projects` deben seguir pasando sin modificación.

---

## 4. Requisitos funcionales

### RF-1: Filtrar por status
**Como** gestor de proyectos
**quiero** filtrar la lista por uno o varios estados
**para** ver solo los proyectos en el estado que me interesa.

**Comportamiento esperado:**
- `GET /api/projects?status=active` → solo proyectos con `status = 'active'`.
- `GET /api/projects?status=active,archived` → proyectos con `status IN ('active','archived')`.
- `status` inválido (no en el enum) → `400 Bad Request` con mensaje claro.
- `status` ausente → no se filtra por estado (devuelve todos los estados).

**Datos de entrada:** query param `status`, string, lista separada por coma.
**Datos de salida:** `{ projects: Project[], total: number, page: number }`.

### RF-2: Filtrar por rango de fechas
**Como** gestor de proyectos
**quiero** filtrar por rango de fechas
**para** ver proyectos creados en un período.

**Comportamiento esperado:**
- `GET /api/projects?from=2026-01-01&to=2026-06-30` → proyectos con `created_at` en ese rango, **inclusivo en ambos extremos**.
- `from` solo → desde esa fecha hasta hoy.
- `to` solo → hasta esa fecha.
- Fechas con formato inválido → `400 Bad Request`.
- La fecha usada para el filtro es `created_at` (no `updated_at` ni `deadline`).

### RF-3: Combinar filtros
- `status` y `from`/`to` combinan con AND.
- Si ambos filtros vienen vacíos → comportamiento actual sin cambios (devuelve todo paginado).

---

## 5. Criterios de aceptación

- [ ] **AC-1:** `GET /api/projects?status=active` devuelve solo proyectos con `status='active'`.
  - **Verificación:** `curl .../projects?status=active | jq '.projects[].status' | sort -u` → solo `active`.
- [ ] **AC-2:** `?status=active,archived` devuelve proyectos con status en ese conjunto.
  - **Verificación:** los `status` devueltos son subconjunto de `{active, archived}`.
- [ ] **AC-3:** `?from=2026-01-01&to=2026-06-30` devuelve `created_at` dentro del rango inclusivo.
  - **Verificación:** `jq '.projects[].created_at'` todos entre `from` y `to` inclusive.
- [ ] **AC-4:** `status=invalid` → `400`.
- [ ] **AC-5:** fecha con formato inválido → `400`.
- [ ] **AC-6:** combinación `status=active&from=2026-01-01` → AND.
- [ ] **AC-7 (no-regresión):** los 12 tests existentes de `projects` siguen pasando.
  - **Verificación:** `npm test -- projects`.

---

## 6. Dependencias y prerequisitos

- **Depende de:** nada (el endpoint y el modelo existen).
- **Bloquea a:** "panel de proyectos vencidos" (PROJ-160).
- **Prerequisitos:** seed de tests con proyectos en varios estados y fechas.

---

## 7. Diseño técnico (pista, no solución)

**Archivos / módulos probablemente afectados:**
- `src/api/projects/controller.ts` — parsear y validar query params.
- `src/api/projects/service.ts` — construir el query con filtros.
- `src/repositories/ProjectRepo.ts` — método `findFiltered(filters)`.
- `tests/api/projects/filter.test.ts` — tests nuevos.

**Patrones del repo a respetar:**
- Los repos usan query builders parameterizados (NUNCA string interpolation en SQL).
- Validación de input con el schema compartido en `src/schemas/`.

---

## 8. Datos de prueba / escenarios

| Escenario                     | Input                          | Output esperado          | AC        |
|-------------------------------|--------------------------------|--------------------------|-----------|
| un estado válido              | `?status=active`               | solo `active`            | AC-1      |
| varios estados                | `?status=active,archived`      | subconjunto              | AC-2      |
| rango inclusivo               | `?from=2026-01-01&to=2026-06-30`| fechas en rango          | AC-3      |
| estado inválido               | `?status=bogus`                | 400                      | AC-4      |
| fecha inválida                | `?from=not-a-date`             | 400                      | AC-5      |
| combinación                   | `?status=active&from=...`      | AND                      | AC-6      |
| sin filtros (no-regresión)    | (sin params)                   | todo paginado            | AC-7      |

---

## 9. Rollback plan

**Si sale mal en producción:**
- El feature no modifica schema, así que revertir el deploy del commit es suficiente.
- No hay feature flag en este caso (no se consideró necesario por ser read-only y aditivo).

**Cómo detectar que hay que revertir:**
- Aumento de `400` en el endpoint > umbral de alerta.
- Latencia p95 > 300ms sostenida.

---

## 10. Decisiones abiertas

- [x] **D-1:** ¿La fecha del filtro es `created_at`? → **Sí**, confirmado con PM.
- [x] **D-2:** ¿El rango es inclusivo en ambos extremos? → **Sí**, confirmado con PM.

> Ambas resueltas antes de aprobar la spec. Sin `[NEEDS CLARIFICATION]` pendientes.

---

## 11. Definición de "Verificado"

Esta spec se considera **verificada** cuando:
- [ ] Todos los AC-1..7 marcan ✅ con sus verificaciones ejecutadas.
- [ ] No hay `[NEEDS CLARIFICATION]` pendientes (resueltos en sección 10).
- [ ] Los 12 tests existentes de `projects` siguen pasando.
- [ ] Los nuevos tests cubren los AC y los edge cases de la sección 8.
- [ ] No se tocaron archivos fuera de los listados en la sección 7.
- [ ] El rollback plan está documentado.

---

## 12. Trazabilidad

- **Ticket de origen:** PROJ-142
- **Roadmap milestone:** `.planning/roadmap.md` → M1
- **Plan de implementación:** `plan.md`
- **PR(s):** _(a completar)_
- **Commit de verificación:** _(a completar)_