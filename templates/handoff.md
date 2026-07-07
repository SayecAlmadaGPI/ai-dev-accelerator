<!--
  handoff.md — Artefacto de transferencia entre sesiones
  -------------------------------------------------------
  El handoff es lo que permite que una sesión nueva continue el trabajo de
  una anterior sin haberla vivido. Ver M4 §4.3.

  Principio: el handoff es un ÍNDICE + estado, no un primary source. La
  spec, el plan y state.json son el primary source. Si tu handoff es más
  largo que la spec, la spec está incompleta; completa la spec, achica el
  handoff.

  Las cinco partes (M4 §4.3.2) son obligatorias. Omitir los bloqueantes es
  el error más común y el más caro: la sesión nueva los redescubre solos.

  Cómo usar: copia a la raíz del trabajo (o a docs/handoffs/) y reemplaza
  los corchetes. Nómbralo con fecha: handoff-YYYY-MM-DD.md.
-->

# Handoff — [Fecha YYYY-MM-DD]

> **Sesión que cierra:** [qué sesión/tool — ej: "Claude Code, sesión de la
> tarde, ~90 min"]
> **Sesión que continúa:** cualquier tool que lea archivos del repo.

## 1. Spec activa

- **Spec:** [`docs/specs/<nombre>.md`](ruta)
- **Tesis de la spec:** [una línea: qué se está construyendo y por qué]
- **Estado de la spec:** [aprobada / en borrador / con `[NEEDS CLARIFICATION]` abiertos]

## 2. Progreso real (no el narrado)

> Fuente mecánica de verdad: `.planning/state.json` y `.planning/tasks/`.
> Este resumen apunta ahí; no lo duplica.

- **DONE/VERIFIED:** [qué tareas cerraron con verificación mecánica]
- **En progreso:** [qué tarea quedó a medias y en qué estado exacto]
- **Sin tocar:** [qué tareas de la lista faltan]

## 3. Bloqueantes (lo más valioso de este handoff)

> Lo que el agente no pudo resolver. La sesión nueva va a chocar con esto
  primero; documentarlo le ahorra redescubrirlo.

- **Bloqueante 1:** [descripción precisa. Ej: "El test F2 falla con un
  error de tipos en el adapter; el mock no matchea la firma nueva."]
  - Intentado: [qué se probó]
  - Hipótesis: [qué se cree que pasa]
  - Próximo paso sugerido: [qué probar primero en la nueva sesión]
- **Bloqueante 2:** [...]

## 4. Decisiones tomadas

> Por qué se eligió el camino A y no el B. Sin esto, la sesión nueva
  puede desandar lo hecho.

- **Decisión 1:** [ej: "Usamos adapter pattern en lugar de modificar el
  servicio existente."] — Razón: [por qué]
- **Decisión 2:** [...]

## 5. Punto reproducible

- **SHA del último commit verde:** [hash completo]
- **Comando para verificar:** [el que corresponda, ej: `npm test`]
- **Resultado al cerrar:** [verde / rojo — si rojo, qué falla]

## 6. Para la sesión que continúa

- **Leer antes de programar:** `AGENTS.md`, este handoff,
  `.planning/state.json`, y `git log` desde el SHA de arriba.
- **Confirmar el estado con el humano** antes de tocar código.
- **Primer paso sugerido:** [el desbloqueo más natural o la siguiente
  feature de la lista]

<!--
  Recordatorio: si el estado narrado acá contradice a .planning/state.json,
  gana state.json. Marca este handoff como desactualizado y regenera.
-->