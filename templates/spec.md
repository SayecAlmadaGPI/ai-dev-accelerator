<!--
  spec.md — Plantilla canónica de Spec-Driven Development (SDD)
  ---------------------------------------------------------------
  Esta es la SPEC: el contrato entre tú y el agente.
  El agente debe ejecutar CONTRA esta spec, no contra su imaginación.
  Regla de oro: si una línea no ayuda a decidir "está hecho o no está hecho",
  probablemente no pertenece aquí.

  Cómo usarla:
  - Completa las secciones [OBLIGATORIO]. Las [OPCIONAL] puedes omitirlas.
  - Deja los marcadores [NEEDS CLARIFICATION] donde haya ambigüedad.
    El agente los trata como BLOQUEANTES, no como adivinanzas.
  - Escribe los criterios de aceptación como si fueran tests: deben poder
    ejecutarse y devolver pass/fail, no "más o menos bien".
-->

# Spec: [Nombre corto del feature o cambio]

> **ID:** [slug-kebab-case, ej. project-status-filter]
> **Tipo:** feature | refactor | bugfix | spike | migración
> **Nivel de rigor:** Spec-First | Spec-Anchored | Spec-as-Source
> **Estado:** draft | en-revisión | aprobada | en-progreso | verificada | entregada
> **Propietario:** [quién responde por la spec, no quién escribe el código]
> **Fecha:** [YYYY-MM-DD]

---

## 1. Contexto y motivación [OBLIGATORIO]
<!-- El PORQUÉ. No el qué. El agente necesita entender el problema, no la solución. -->

**Problema actual:**
[1-3 párrafos. Qué duele hoy. A quién. Con qué frecuencia. Con qué impacto.]

**Motivación para resolverlo ahora:**
[Por qué esto y no otra cosa. Qué desbloquea. Qué costo tiene no hacerlo.]

**Usuarios afectados / stakeholders:**
[Quién va a usar el resultado. Quién firma la aceptación.]

---

## 2. Objetivos y no-objetivos [OBLIGATORIO]
<!-- Dibuja el perímetro. Lo que NO entra es tan importante como lo que entra. -->

**Objetivos (in scope):**
- [ ] [Objetivo verificable 1]
- [ ] [Objetivo verificable 2]
- [ ] [Objetivo verificable 3]

**No-objetivos (out of scope):**
- [ ] [Lo que explícitamente NO se hace, aunque parezca obvio incluirlo]
- [ ] [Funcionalidades adyacentes que se dejan para otro ciclo]

> ⚠️ **Crítico para agentes:** los no-objetivos son la primera defensa contra el scope creep.
> Si el agente intenta hacer algo de esta lista, debe detenerse y preguntar.

---

## 3. Invariantes y constraints [OBLIGATORIO]
<!-- Lo que NUNCA debe romperse, sin importar qué. El agente no puede negociar esto. -->

**Invariantes (cosas que deben seguir siendo ciertas después del cambio):**
- [ej. "El endpoint /api/projects sigue devolviendo los mismos campos que hoy"]
- [ej. "Los permisos existentes no se modifican ni se relajan"]

**Constraints técnicos:**
- **Stack:** [lenguaje, framework, versión mínima]
- **Compatibilidad:** [browsers, SO, versiones de dependencias]
- **Performance:** [límites: p95 < Xms, no aumentar bundle > Ykb]
- **Seguridad:** [restricciones: no loguear PII, validar input en el boundary, etc.]

**Constraints de proceso:**
- [ej. "Todo cambio debe pasar los tests existentes sin modificarlos"]
- [ej. "No se tocan migraciones ya aplicadas en producción"]

---

## 4. Requisitos funcionales [OBLIGATORIO]
<!-- El QUÉ. Describe comportamiento, no implementación. -->

### RF-1: [Nombre del requisito]
**Como** [rol]
**quiero** [acción]
**para** [beneficio]

**Comportamiento esperado:**
- [Pasos concretos del comportamiento, no código]
- [Qué pasa en el happy path]
- [Qué pasa en los edge cases conocidos]

**Datos de entrada:**
- [Campos, tipos, validaciones]

**Datos de salida:**
- [Formato, campos, códigos de error]

### RF-2: ...
[Repetir por cada requisito]

---

## 5. Criterios de aceptación [OBLIGATORIO]
<!-- ESTO es lo más importante. Deben ser automatizables y binarios (pass/fail).
     Si no puedes escribir un test para un criterio, el criterio está mal escrito. -->

- [ ] **AC-1:** [Criterio verificable, ej. "GET /api/projects?status=active devuelve solo proyectos con status=active"]
  - **Verificación:** [comando o test que lo valida, ej. `curl ... | jq '.[] | .status' | uniq` debe dar solo "active"]
- [ ] **AC-2:** [Criterio verificable]
  - **Verificación:** [cómo se prueba]
- [ ] **AC-3:** [Criterio de no-regresión, ej. "Los 47 tests existentes de projects siguen pasando"]
  - **Verificación:** `npm test -- projects`

> Regla: un humano (o un CI) debe poder marcar cada casilla como ✅ o ❌
> sin discusión subjetiva. Si hay discusión, el AC está mal definido.

---

## 6. Dependencias y prerequisitos [OPCIONAL]
- **Depende de:** [otros features, tickets, infra, APIs externas]
- **Bloquea a:** [qué se desbloquea cuando esto termine]
- **Prerequisitos de entorno:** [migraciones de DB, feature flags, configs]

---

## 7. Diseño técnico (pista, no solución) [OPCIONAL]
<!--
  NO escribas la implementación aquí. Eso va en plan.md (Superpowers) o en
  .planning/tasks/ (GSD). Aquí solo das PISTAS: qué archivos probablemente
  se toquen, qué patrones del repo seguir, qué no reinventar.
-->

**Archivos / módulos probablemente afectados:**
- [path/to/file.ts] — [por qué]
- [path/to/tests] — [qué cobertura agregar]

**Patrones del repo a respetar:**
- [ej. "Los repos usan el patrón repository, ver src/repositories/ProjectRepo.ts"]

**Pistas de implementación (no obligatorias para el agente):**
- [Sugerencias, no instrucciones. El agente puede proponer otra vía.]

---

## 8. Datos de prueba / escenarios [OPCIONAL]
<!-- Seed data, casos borde, escenarios de QA. -->

| Escenario  | Input esperado | Output esperado | AC que cubre |
|------------|----------------|-----------------|--------------|
| [caso 1]   | [...]          | [...]           | AC-1, AC-2   |
| [edge 1]   | [...]          | [...]           | AC-2         |

---

## 9. Rollback plan [OPCIONAL pero recomendado]
**Si esto sale mal en producción:**
- [Pasos concretos para revertir: feature flag, migración down, etc.]
- [Cómo detectar que hay que revertir: métrica, alerta, síntoma]

---

## 10. Decisiones abiertas [OBLIGATORIO si las hay]
<!--
  Cada item con [NEEDS CLARIFICATION] es BLOQUEANTE.
  El agente NO debe adivinar la respuesta. Debe detenerse y preguntar
  (o marcar la task como bloqueada en GSD).
-->

- [ ] **D-1:** [Pregunta abierta, ej. "¿El filtro por fecha es inclusivo o exclusivo en ambos extremos?"] `[NEEDS CLARIFICATION]`
- [ ] **D-2:** [Pregunta abierta] `[NEEDS CLARIFICATION]`

---

## 11. Definición de "Verificado" [OBLIGATORIO]
<!-- Qué significa que esto esté HECHO de verdad. Inspira el DONE/VERIFIED schema. -->

Esta spec se considera **verificada** cuando TODOS estos son ciertos:

- [ ] Todos los AC-1..N marcan ✅ con sus verificaciones ejecutadas.
- [ ] Todos los `[NEEDS CLARIFICATION]` de la sección 10 están resueltos.
- [ ] Los tests existentes siguen pasando (no se rompió nada).
- [ ] Los nuevos tests cubren los AC y los edge cases de la sección 8.
- [ ] No se tocaron archivos fuera del alcance (sección 7 vs. diff real).
- [ ] El rollback plan (sección 9) está documentado y testeado si aplica.

---

## 12. Trazabilidad [OPCIONAL]
- **Ticket de origen:** [link al issue/ticket]
- **Roadmap milestone (GSD):** [.planning/roadmap.md → Milestone X]
- **Plan de implementación:** [plan.md — Superpowers]
- **PR(s):** [links]
- **Commit de verificación:** [SHA]

---

<!--
  Notas finales para el agente que lee esta spec:
  - No inventes requisitos. Si algo no está aquí, pregunta o márcalo como bloqueado.
  - Si una sección [OBLIGATORIO] está vacía, la spec NO está lista para ejecución.
  - Tu trabajo es cumplir los AC sin romper los invariantes. Nada más.
-->