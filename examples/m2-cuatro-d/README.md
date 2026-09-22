<!--
  examples/m2-cuatro-d/
  ---------------------
  Ejemplo sencillo: las cuatro D (DDD, SDD, BDD, TDD) aplicadas en UN
  flujo de desarrollo agéntico, sobre un mini-dominio real y ejecutable
  (Node puro, node:test, cero dependencias). Corre los tests con:
    node --test
  Fondo: cheatsheets/las-cuatro-d.md y M2 §2.5.
-->

# Las cuatro D en un flujo agéntico: préstamos de biblioteca

> **Objetivo del ejemplo:** mostrar, en un feature mínimo y completo, cómo
> las cuatro metodologías se encadenan cuando trabajas con un agente:
> **DDD nombra → SDD contrata → BDD comunica → TDD protege**. Todo el
> código corre con `node --test` (sin dependencias).

## El escenario

Quieres que tu agente implemente un mini-sistema de **préstamos de
biblioteca**. Es el caso ideal para el ejemplo: el dominio es comprensible
para cualquiera, pero tiene reglas de negocio con fronteras (límites,
vencimientos, estados) donde cada una de las cuatro D aporta algo distinto.

## El orden de lectura (es el orden de la pila)

| # | Carpeta | Qué muestra | La D que opera |
|---|---------|-------------|----------------|
| 1 | [`1-dominio/`](./1-dominio/README.md) | El **lenguaje ubicuo** (los términos y sus significados acordados) y el **bounded context** (Préstamos) — qué palabras usa la spec y por qué esas | DDD |
| 2 | [`2-spec/spec.md`](./2-spec/spec.md) | La spec cuyo contrato está escrito en ese lenguaje, con **ACs como escenarios Given/When/Then** (BDD) | SDD + BDD |
| 3 | [`3-tdd/`](./3-tdd/) | Un ciclo **RED → GREEN → REFACTOR** anotado por fase, con los prompts literales que le diste al agente | TDD |
| 4 | [`prompts.md`](./prompts.md) | Los prompts completos del flujo agéntico (arranque, por tarea, cierre) — la versión del Nivel 1.5 (M2 §2.8) | TDD (agéntico) |
| 5 | [`RESULTADO.md`](./RESULTADO.md) | La evidencia: tests en verde, la mutación que atrapa la decisión, y qué aprendió cada D | Las cuatro |

## Los prompts del flujo (resumen)

1. **Arranque** — le pides al agente que configure la disciplina SDD + TDD
   (Nivel 1.5, `templates/sdd-tdd-vanilla.md`) y confirme.
2. **Por tarea** — le das el escenario BDD como AC: el agente escribe el
   test que falla (RED), el código mínimo (GREEN), refactoriza y muestra
   las salidas.
3. **Cierre** — DONE/VERIFIED con la tabla de evidencia (M6 §6.5).
4. **Auditoría** — mutas una regla (`LIMITE = 4`) y verificas que los tests
   la atrapan (M6 §6.3.4).

## Qué NO es este ejemplo

- No usa GSD ni Superpowers ni Gentle-AI: es el flujo **vanilla** del
  Nivel 1.5 — si tu tarea cruza sesiones, escala a GSD (M2 §2.8).
- No cubre multas, reservas ni devoluciones tardías: el bounded context
  deliberado es solo "Préstamos". El resto es otro contexto (y otra spec).

## Referencias

- [`cheatsheets/las-cuatro-d.md`](../../cheatsheets/las-cuatro-d.md) — la conciliación y el diagrama.
- `modules/02-spec-plan-execute.md` §2.2 (taller), §2.5 (las cuatro D), §2.8 (Nivel 1.5).
- `templates/sdd-tdd-vanilla.md`, `templates/decision-record.md` — el kit.