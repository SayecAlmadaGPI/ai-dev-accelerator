<!--
  harness-design-checklist.md — 20 preguntas para evaluar tu entorno
  --------------------------------------------------------------
  Uso: marcase cada casilla honestamente. No es un examen para aprobar
  con 20/20; es un diagnóstico. Menos de 10 = tu entorno es más "deseo"
  que harness. 15+ = zona confiable. 18+ = harness maduro.

  Recorréla de arriba a abajo: el orden va de lo más estructural
  (system of record) a lo más operativo (contexto y continuidad).
  Las secciones bajas dependen de las altas: no tiene sentido pulir
  los sensores si tu estado vive en la conversación.

  Vinculado al Módulo 1 (mentalidad de harness) y al Módulo 3 (workbench).
-->

# Checklist de diseño de harness

> **Proyecto:** [nombre]
> **Fecha:** [YYYY-MM-DD]
> **Evaluador:** [quién responde]
> **Resultado:** __ / 20

---

## A. System of record (¿el estado vive en archivos?)

- [ ] **A1.** La intención de cada feature vive en un `spec.md`, no en un mensaje del chat.
- [ ] **A2.** El progreso de las sesiones largas se persiste en archivos (`claude-progress.md`, `state.json` o equivalente).
- [ ] **A3.** Las decisiones de diseño están documentadas en `docs/decisions/` (o similar), no en "lo que discutimos".
- [ ] **A4.** Una sesión nueva puede reconstruir el estado sin releer la conversación anterior.

> Si fallás A1-A4, lo demás no importa: tu estado se evapora al cerrar la sesión. Arrreglá esto primero.

## B. Restricciones explícitas (¿el agente sabe qué respetar?)

- [ ] **B1.** Hay un `AGENTS.md` (o `CLAUDE.md`) con las reglas estables del proyecto: comandos, estilo, gotchas.
- [ ] **B2.** Ese archivo está por debajo de ~200 líneas efectivas (sin contenido que el agente puede inferir del código).
- [ ] **B3.** Los no-objetivos de cada spec son explícitos (primera defensa contra el scope creep).
- [ ] **B4.** Las paths críticas (migraciones, configs, CI) están protegidas: el agente no las toca sin gate.

## C. Guías / feedforward (¿el agente sabe cómo, sin saturar contexto?)

- [ ] **C1.** Las reglas que solo aplican a ciertos archivos viven en rules scoped (`.claude/rules/`, `.cursor/rules`), no en el global.
- [ ] **C2.** El conocimiento profundo se carga on-demand (context pointers, `@imports`), no inline en el system prompt.
- [ ] **C3.** Hay skills para los flujos verticales repetibles (migraciones, deploys, triage de incidentes).

## D. Sensores / feedback (¿puedes detectar lo que el agente hizo mal?)

- [ ] **D1.** Hay un sensor computacional (lint, typecheck, test estructural) por cada regla crítica del proyecto.
- [ ] **D2.** El CI corre los criterios de aceptación de la spec, no solo "los tests genéricos".
- [ ] **D3.** Hay un review-agent (inferencial) que compara el diff contra la spec, apoyado en la capa computacional.
- [ ] **D4.** El reporte de cierre exige DONE/VERIFIED: qué se verificó, qué no, supuestos, qué debe revisar un humano.

## E. Jerarquía de enforcement (¿lo crítico depende del modelo o del entorno?)

- [ ] **E1.** Lo más crítico está en hooks (mecánico, determinista), no en prosa del AGENTS.md.
- [ ] **E2.** Cada regla de texto que se incumple repetidamente se "promueve" a check determinista o a generador.
- [ ] **E3.** Las acciones destructivas (borrado, rewrite de migraciones, force-push) tienen sandbox o worktree aislado.

## F. Contexto y continuidad (¿gestionás la smart zone?)

- [ ] **F1.** Compactás proactivamente (~60% de contexto) antes de esperar al autocompact (~83%).
- [ ] **F2.** Las reglas críticas de seguridad viven en `CLAUDE.local.md` (o equivalente que sobrevive a la compaction).
- [ ] **F3.** Usás subagentes con contexto fresco para verificación, en lugar del agente principal ya saturado.

---

## Cómo interpretar el resultado

| Puntaje | Diagnóstico | Acción sugerida |
|---------|-------------|-----------------|
| 0-9 | **Deseo, no harness.** El estado vive en la conversación; el agente improvisa. | Arrancá por A1-A4 (system of record) y B1 (AGENTS.md mínimo). |
| 10-14 | **Harness básico.** Confiable para tareas chicas, frágil para sesiones largas. | Cerrá D1-D2 (sensores computacionales) y F1 (compactación proactiva). |
| 15-17 | **Harness confiable.** Sobrevive sesiones largas y cambios de herramienta. | Subí E1-E2 (promover prosa a checks) y D3 (review-agent inferencial). |
| 18-20 | **Harness maduro.** Confiabilidad por defecto, no por vigilancia. | Mantené; revisá trimestralmente porque el ecosistema cambia. |

---

## Notas del evaluador

- [Qué falló y por qué]
- [Qué se promueve de prosa a check en el próximo sprint]
- [Qué capa portable priorizar antes de invertir en capa inner de un IDE]

<!--
  Recordatorio: este checklist no es estático. Cada vez que una regla
  de texto se incumpla, volvé a esta lista y preguntate si esa regla
  merece ascender a un check determinista o a un generador. El harness
  madura de abajo hacia arriba.
-->