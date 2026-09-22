<!--
  examples/README.md
  ------------------
  Índice de la sección Ejemplos: qué contiene cada ejemplo, en qué orden
  leerlos y a qué módulo pertenecen. Lo consume build-content.mjs como
  índice de la sección en el sitio.
-->

# Ejemplos — casos trabajados de punta a punta

> **Qué es esta sección:** cada carpeta es un **caso completo trabajado**
> (artefactos de metodología +, cuando aplica, código ejecutable). No son
> snippets: son specs, planes, prompts y evidencia de punta a punta, para
> que veas el pipeline entero antes de aplicarlo en tu repo.

## Los tres ejemplos

| Ejemplo | Qué muestra | Módulo | Código |
|---------|-------------|--------|--------|
| [`m2-unified-workflow/`](./m2-unified-workflow/) | El pipeline SDD + GSD + Superpowers de punta a punta: ticket vago → spec → plan → tasks → resultado. **Sin código** (son las plantillas aplicadas) | M2 (núcleo) | No (artefactos) |
| [`m2-cuatro-d/`](./m2-cuatro-d/) | Las **cuatro D conciliadas** (DDD nombra → SDD contrata → BDD comunica → TDD protege) en un flujo agéntico: lenguaje ubicuo, spec con ACs como escenarios BDD, ciclo TDD anotado y prompts literales. **Con código que corre** | M2 §2.5/§2.10 | Sí (`node --test`) |
| [`m2-caso-refactor/`](./m2-caso-refactor/) | **Refactor legacy con tests de caracterización**: monolito con comportamientos raros fijados como golden tests, refactor en 3 tareas sin cambiar comportamiento | M8 §8.2 | Sí (`node --test`) |

## Cómo leerlos

1. **Empieza por `m2-unified-workflow/`**: es la metodología central (M2) aplicada a un ticket vago.
2. **Si quieres ver las cuatro D juntas con código que corre**: `m2-cuatro-d/` — el más didáctico para entender SDD, TDD, BDD y DDD en un solo flujo.
3. **Si tu problema es un refactor de legacy**: `m2-caso-refactor/` — la técnica de caracterización antes de tocar.

Cada ejemplo tiene su `RESULTADO.md` (o su sección de resultado) con la
evidencia del cierre — "evidence over claims", como enseña el M6.

## La regla que comparten

**El mismo ticket vago, procesado con metodología, no tiene ni una sola
decisión tomada en silencio.** Cada ambigüedad es una casilla ✅ verificable.