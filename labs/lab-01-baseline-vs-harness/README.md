<!--
  lab-01-baseline-vs-harness/README.md
  ------------------------------------
  Lab 01 — Baseline vs. Harness. Sentir la diferencia de trabajar con un
  agente SIN harness vs. CON harness mínimo. Fase 3.

  Ejercita: M1 (mentalidad de harness), M3 (workbench), M6 (verificación).

  Principio del lab: la diferencia no se entiende leyéndola, se siente.
  Haces la misma tarea dos veces. La primera, sin harness (sin AGENTS.md,
  sin spec, sin sensor). La segunda, con un harness mínimo. Anotas qué
  cambió. Ese delta es el argumento del curso en primera persona.
-->

# Lab 01 — Baseline vs. Harness

> **Objetivo:** sentir la diferencia, no teorizarla. Haces la misma
> tarea dos veces — sin harness y con harness mínimo — y registras el
> delta. Esa evidencia es la que sostiene el resto del curso.

## Módulos que ejercita

- **M1** — mentalidad de harness (agent = model + harness).
- **M3** — workbench mínimo (AGENTS.md, init.sh).
- **M6** — verificación (DONE/VERIFIED, sensor computacional).

## Punto de partida

Una tarea chica y autoverificable: implementar una función
`filterByDate(items, range)` que filtra una lista de eventos por un rango
de fechas `[from, to)`, con la invariante de que `from` inclusivo y `to`
exclusivo, y que `items` no se mute. Es la feature del ejemplo del M2
(`examples/m2-unified-workflow/`), así que si lo hiciste, ya conoces el
rumbo — eso es bueno, el foco aquí es el harness, no la lógica.

Requisitos del entorno:
- Cualquier lenguaje con typecheck + test runner (TypeScript + Vitest, o
  Python + pytest, etc.).
- Un agente (Claude Code, Cursor, el que uses).

## Parte A — Sin harness (baseline)

Configura el agente *sin* ninguna de las capas del M3:

- **No** crees `AGENTS.md` / `CLAUDE.md`.
- **No** escribas spec. Pídele la feature directamente en el chat.
- **No** corras tests tú; confía en el reporte del agente.
- **No** dejes handoff; cierra la sesión.

Prompt sugerido (literal):
> "Implementa filterByDate(items, range) que filtra eventos por [from, to)
> con from inclusivo y to exclusivo, sin mutar items. Asegúrate de que
> funcione."

Al terminar, **sin abrir el código a fondo**, anota:
1. ¿El agente te dijo que terminó? ¿Con qué evidencia?
2. ¿Corrió los tests o solo afirmó que "deberían pasar"?
3. ¿Mencionó la invariante de no-mutación, o la obvió?
4. ¿Cuánto confiance tenía su reporte vs. qué verificaste tú?

> Esta parte es incómoda a propósito. El punto es ver el phantom
> verification y el hollow report en carne propia (M6 §6.1).

## Parte B — Con harness mínimo

Ahora monta un harness mínimo, apoyándote en las plantillas:

1. **`AGENTS.md`** (copia `templates/AGENTS.md` y complétalo): stack,
   comandos canónicos (test, typecheck), la invariante de no-mutación
   como regla, y el gotcha "to es exclusivo".
2. **`spec.md`** (copia `templates/spec.md`): objetivo, no-objetivos
   ("NO mutar items", "NO aceptar from > to sin error"), invariante,
   criterios de aceptación (AC1: filtra por rango; AC2: no muta; AC3:
   from inclusivo, to exclusivo; AC4: lanza error si from > to).
3. **`init.sh`** (copia `templates/init.sh`): typecheck + tests en verde
   como punto de partida.
4. Pídele al agente que **lea el AGENTS.md y la spec antes de codear**,
   que produzca un **plan** (`templates/plan.md`), y que cierre con un
   reporte **DONE/VERIFIED** (`templates/DONE_VERIFIED.md`).

Al terminar, aplica el checklist `templates/es-verificable-checklist.md`
antes de aceptar.

Anota:
1. ¿El agente respetó la invariante de no-mutación sin que se la
   recordaras? (Si sí, fue el AGENTS.md.)
2. ¿El reporte tuvo números y nombres, o marcas de check?
3. ¿Qué se detectó con el sensor que el agente no habría atrapado solo?
4. ¿Cuánto tiempo ganaste (o perdiste) en setup vs. en debugging?

## Criterio de terminación

- `init.sh` corre en verde desde cero.
- Los AC1-AC4 tienen tests que pasan.
- Reporte DONE/VERIFIED completo (4 partes).
- `RESULTADO.md` con la comparación Parte A vs. Parte B, una tabla de
  "qué falló en A que no falló en B" y una nota de qué promueves de
  prosa a check en tu próximo harness.

## Qué debes haber aprendido

- La diferencia entre "el agente dice que terminó" y "un sensor confirma
  que terminó".
- Que un AGENTS.md chico y denso cambia el comportamiento del agente más
  que un prompt largo.
- Que la invariante explícita (no-mutación, to-exclusivo) sobrevive al
  agente solo si vive en un archivo, no en la conversación.

## Referencias

- `modules/01-mentalidad-harness.md`
- `modules/03-workbench.md`
- `modules/06-verificacion.md`
- `templates/AGENTS.md`, `templates/spec.md`, `templates/init.sh`,
  `templates/DONE_VERIFIED.md`, `templates/es-verificable-checklist.md`