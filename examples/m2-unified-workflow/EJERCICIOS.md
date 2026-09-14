# Ejercicios de completación — caso "Filtrar proyectos por estado y fecha"

> Este directorio es el ejemplo *modelado* del M2: los artefactos (TICKET, spec, roadmap, tasks, plan) ya están terminados y puedes leerlos de punta a punta. Estos ejercicios son el paso siguiente: **fading** — del modelo completo pasas a insumos con huecos que tú completas (ejercicio 1 y 2), y terminas con trabajo abierto sin red (ejercicio 3).
>
> Regla del juego: escribe tu intento ANTES de abrir el artefacto real. El aprendizaje no está en acertar, está en el diff: donde tu versión y la real divergen hay un supuesto que no habías auditado. Cierra un ejercicio antes de pasar al siguiente.

---

## Ejercicio 1 — Completa la spec

**Objetivo:** escribir las piezas que faltan de una spec (2 ACs, 1 no-objetivo, 1 invariante, 1 `[NEEDS CLARIFICATION]`) a partir de un ticket vago.

**Insumo (lee antes de escribir):**
- `TICKET.md` — el ticket PROJ-142 tal como llegó (vago, con supuestos ocultos).
- M2, §2.2 — anatomía de `spec.md`: qué hace un AC binario, un no-objetivo, un invariante.

**Tarea:** completa los 5 huecos `<...>` de esta spec recortada. No abras `spec.md` todavía.

```markdown
# Spec (recortada): Filtrar proyectos por estado y fecha

## 2. Objetivos y no-objetivos

**Objetivos (in scope):**
- [ ] Filtrar por `status` (un valor o varios).
- [ ] Filtrar por rango de fechas (`from` / `to`).
- [ ] Combinar ambos filtros (AND).
- [ ] Paginación sin romperse por los filtros.

**No-objetivos (out of scope):**
- [ ] NO: <HUECO 1 — un no-objetivo> (pista: el ticket pide "encontrar más
  rápido" los proyectos; hay UNA mejora vecina que suena related pero tiene
  ticket propio y NO entra en esta milestone).

## 3. Invariantes y constraints

**Invariantes:**
- <HUECO 2 — un invariante que protege a los consumidores actuales del
  endpoint> (pista: el filtro es aditivo y read-only; ¿qué NO puede cambiar
  en la respuesta para no romper a quien ya la consume?).
- Los permisos existentes no se modifican ni relajan.
- El endpoint sigue requiriendo autenticación.

## 5. Criterios de aceptación

- [x] **AC-1:** `GET /api/projects?status=active` devuelve solo proyectos con `status='active'`.
- [x] **AC-2:** `?status=active,archived` devuelve proyectos con status en ese conjunto.
- [x] **AC-3:** `?from=2026-01-01&to=2026-06-30` devuelve `created_at` dentro del rango inclusivo.
- [x] **AC-4:** <HUECO 3 — un AC de error para `status`>.
- [x] **AC-5:** <HUECO 4 — un AC de error para las fechas>.
- [x] **AC-6:** `?status=active&from=2026-01-01` → combinación AND.
- [x] **AC-7 (no-regresión):** los 12 tests existentes de `projects` siguen pasando.

## 10. Decisiones abiertas

- [ ] **D-1:** <HUECO 5 — la pregunta que hay que hacerle al PM sobre la fecha>
  → [NEEDS CLARIFICATION: formula la pregunta concreta que la cierra].
```

**Autoevaluación binaria (todo debe ser ✅ antes del diff):**
- [ ] Tus 2 ACs tienen verificación ejecutable (un comando, una salida observable) — cero adjetivos.
- [ ] Tu no-objetivo es una tentativa *vecina* al ticket, no algo inventado de la nada.
- [ ] Tu invariante protege a un consumidor existente, no al feature nuevo.
- [ ] Tu `[NEEDS CLARIFICATION]` es una pregunta que un PM puede responder sin ver código.

**Al terminar:** abre `spec.md` y haz diff contra tus 5 piezas (secciones 2, 3, 5 y 10). ¿Equivalentes o más débiles? Lo tuyo cuenta si pasa la revisión del Tech Lead, no si coincide palabra por palabra.

**¿Te atoras?** Mira la sección "Cómo llegó" de `TICKET.md`: cada pregunta que el ticket deja abierta te dice qué debe responder un hueco. Solo después de intentarlo, recurre a `spec.md`.

---

## Ejercicio 2 — Del spec al plan

**Objetivo:** descomponer una spec cerrada en un roadmap: 3 fases y 8 tasks atómicas.

**Insumo (lee antes de escribir):**
- `spec.md` — completo (ahora sí: es el insumo, no la respuesta).
- M2, §2.3 — la jerarquía Milestone → Phase → Task y la atomicidad que permite subagentes de contexto fresco.
- `templates/.planning/roadmap.md` — la plantilla en blanco.

**Tarea:** aquí está el esqueleto del roadmap con el milestone y las fases ya nombradas. Escribe las **8 tasks** — título de una línea + a qué AC apunta cada una — antes de abrir `.planning/roadmap.md`:

```text
Milestone 1: Filtros de proyectos v1
  Phase 1.1 — Filtro por status (backend)    → tasks: <?>
  Phase 1.2 — Filtro por fecha y combinación → tasks: <?>
  Phase 1.3 — Verificación y ship            → tasks: <?>
```

Decide tú cuántas tasks van por fase (el total es 8) y en qué orden dentro de cada fase.

**Autoevaluación binaria:**
- [ ] 8 tasks en total; ninguna que tome a un agente fresco más de ~5-15 min (si te sobran pasos, divídela).
- [ ] Cada task trazable a al menos un AC de la spec.
- [ ] Dentro de cada fase el orden es inequívoco: ninguna task depende de otra de forma ambigua.
- [ ] La última fase no implementa nada: verifica ACs y revisa el diff contra el alcance.

**Al terminar:** abre `.planning/roadmap.md` y compara. Fíjate sobre todo en las *fronteras* de fase (¿cortaste igual?) y en la atomicidad (¿tus tasks son más grandes?). Su sección "Decisiones de planificación" explica el porqué de los cortes — léela después de tu diff.

**¿Te atoras?** Mira `spec.md` §7 (archivos afectados) y §5 (ACs): cada task es "un AC + 1-2 archivos". Y mira §2 (no-objetivos): nada de lo que escribiste puede estar del otro lado de ese perímetro.

---

## Ejercicio 3 — Del task al prompt

**Objetivo:** redactar el prompt de arranque para un subagente fresco que va a ejecutar una task — el último eslabón del pipeline, donde la metodología se vuelve conversación.

**Insumo (lee antes de escribir):**
- `.planning/tasks/phase-1.1-task-01.md` — la task completa.
- M2, §2.5, Fase D — por qué cada task la ejecuta un subagente con contexto fresco.

**Tarea:** un subagente fresco no ha leído nada — ni la spec, ni el roadmap, ni esta página. Redacta el **PROMPT** con el que lo arrancarías. El molde son ~5 líneas:

```text
1. Qué vas a hacer (la task en una frase).
2. Qué leer antes de empezar (paths exactos).
3. Qué NO tocar (perímetro).
4. Cómo se verifica que está hecha (criterio binario, un comando).
5. Cómo reportar al terminar (qué verificaste / qué no / supuestos).
```

No copies la task completa al prompt: destílala. El prompt es la task convertida en instrucción de arranque, no su re-impresión.

**Autoevaluación binaria:**
- [ ] El prompt es autocontenido: el subagente puede arrancar sin hacerte preguntas.
- [ ] Nombra archivos por path exacto, no "el controller".
- [ ] La verificación es un comando con salida binaria (pasa/falla), no "debería funcionar".
- [ ] El perímetro dice qué NO tocar, no solo qué tocar.
- [ ] Cabe en 5-8 líneas: si te quedó de media página, re-imprimiste la task en vez de arrancar al agente.

**Al terminar:** compara con la task de origen, sección por sección — no hay un prompt "real" en el ejemplo para copiar, y eso es a propósito: este ejercicio es abierto, como tu trabajo. Si quieres un espejo, pásale tu prompt a un agente fresco de verdad y mira si arranca sin preguntas: esa es la verificación que importa.

**¿Te atoras?** Vuelve a la task y mapea sus secciones al molde: "Contexto que el agente necesita" → línea 2, "Archivos a crear o modificar" → líneas 2-3, "Verificación (criterio binario)" → línea 4, "Cómo reportar (DONE/VERIFIED)" → línea 5. La task ya es el prompt desarmado; tu trabajo es armarlo sin grasa.

---

> **El fading completo, en una línea:** ejercicio 1 te da la forma y huecos de contenido; ejercicio 2 te da el contenido y huecos de forma; ejercicio 3 te da la task y te pide la conversación. Si los tres te quedaron cómodos, el siguiente paso no es otro ejercicio: es tu propio ticket, con `templates/spec.md` en blanco.