<!--
  lab-05-model-evaluation/README.md
  ---------------------------------
  Lab 05 — Model Evaluation. Evalúa 3 modelos en tu propio codebase con
  prueba ciega, y decide adopción con el protocolo del M9. Fase 4.

  Ejercita: M9 (evaluación de modelos, lectura de leaderboards, cost-per-
  quality), M1 (agent = model + harness — decides combinaciones, no
  modelos aislados).

  Principio del lab: no crees en "gana en SWE-bench". Crees en "gana en
  TUS tareas a ciegas". El lab te obliga a construir esa evidencia.
-->

# Lab 05 — Model Evaluation

> **Objetivo:** evaluar 3 modelos en tu propio codebase con prueba
> ciega, calcular cost-per-quality para tu volumen, y decidir adopción
> con el protocolo del M9. No decides por leaderboard; decides por
> evidencia en tu dominio.

## Módulos que ejercita

- **M9** — tipos de modelos, benchmarks, lectura de leaderboards,
  evaluación de releases, cost-per-quality, tiered routing.
- **M1** — decides una *combinación* modelo+harness, no un modelo
  aislado.

## Los 3 modelos

Elige 3 modelos que estés considerando. Sugerencia de perfiles para que
el lab sea instructivo (no tres clones):

- **Modelo A — tu actual.** El que usas hoy; la línea base.
- **Modelo B — un release nuevo que te tienta.** El candidato a adoptar.
- **Modelo C — uno de perfil distinto** (p.ej. reasoning vs. chat, o
  open-weight vs. API, o mucho más barato). Para ver si un tier inferior
  basta para tus tareas.

> Si los tres son "el más caro de cada proveedor", el lab pierde valor:
> no aprendes a discriminar por cost-per-quality. Mezcla perfiles.

## Parte 1 — Lee sus releases sin hype

Para cada modelo, llena la tabla de `templates/model-comparison-cheatsheet.md`:

- Tipo (Dense/MoE), acceso (API/open-weight).
- SWE-bench-Live (si existe; si solo hay Verified, márcalo y desconfía).
- Ventana nominal vs. útil estimada.
- Costo relativo por 1M tokens (input/output/cached).
- Multimodal: marcar solo si tu harness lo usa.

> Si un modelo solo publica Verified y no Live, anota el gap esperado
> (~24% Live vs. ~70% Verified) como advertencia (M9 §9.2.2).

## Parte 2 — Las 10 preguntas

Para el Modelo B (el candidato), completa
`templates/10-preguntas-antes-adoptar.md`. Si falla las 4 primeras, no
gastes tiempo en la prueba ciega: no adoptes.

## Parte 3 — Prueba ciega en tu dominio

Usa `templates/benchmark-your-task.py` como esqueleto:

1. Define 5-10 tareas **reales** de tu codebase (un bug fix, una
   feature, un refactor, un test). No HumanEval; TUS tareas.
2. Integra los 3 modelos (los `run()` del script). Los nombres son
   ciegos (M_A, M_B, M_C) hasta el final.
3. Corre la prueba. Evalúa cada output **sin saber qué modelo lo
   produjo** (la verificación es computacional, no por opinión).
4. Lee el revelado al final: cuál ganó en TUS tareas.

> La parte que más se salta: la prueba es **ciega**. Si sabes cuál es
> cuál al evaluar, introduces sesgo. La verificación computacional
> (tests pasan / no pasan) elimina el sesgo por diseño.

## Parte 4 — Cost-per-quality

Para el ganador de la prueba ciega y tu actual, calcula:

```
cost_per_task = (tokens_input + tokens_output × factor_output) × precio
quality = % de tus tareas resueltas a nivel aceptable
cost_per_quality = cost_per_task / quality
```

Registra en la tabla de cost-per-quality de
`templates/model-comparison-cheatsheet.md`.

> El modelo que gana la prueba ciega puede perder en cost-per-quality.
> Si cuesta el triple y solo resuelve 10% más, para tu volumen puede no
> valer la pena (M9 §9.3.3).

## Parte 5 — Decisión de adopción

Con la evidencia de las partes 1-4, decide:

- **Adoptar** el Modelo B si gana la ciega Y no empeora cost-per-quality
  Y pasa las 10 preguntas Y hay rollback fácil.
- **No adoptar** si el único argumento era el benchmark público.
- **Esperar** si el release tiene <2 semanas (deja que otros encuentren
  regresiones).
- **Tiered routing** (opcional avanzado): si el Modelo C (más barato)
  resuelve tus tareas mecánicas igual que el caro, enruta lo barato a
  lo barato y lo caro a lo difícil (M9 §9.5.3).

## Criterio de terminación

- Tabla de los 3 modelos completa (`model-comparison-cheatsheet.md`).
- 10 preguntas respondidas para el candidato.
- Prueba ciega corrida en 5-10 tareas reales; resultado en
  `benchmark-your-task-result.json`.
- Cost-per-quality calculado para ganador y actual.
- `RESULTADO.md` con: decisión final, evidencia que la sostiene, y qué
  te sorprendió (p.ej. "el modelo barato resolvió el 80% de mis tareas a
  un 20% del costo").

## Qué debes haber aprendido

- Que "gana en SWE-bench" no decide; "gana en TUS tareas a ciegas" sí.
- Que el cost-per-quality es el benchmark que de verdad te conviene
  mirar.
- Que decides una combinación modelo+harness, no un modelo aislado; un
  modelo superior en harness flojo puede perder contra uno inferior en
  harness afilado.
- Que la prueba ciega elimina el sesgo de "ya sé que el nuevo es mejor".

## Referencias

- `modules/09-evaluacion-modelos.md`
- `modules/01-mentalidad-harness.md` (agent = model + harness)
- `templates/model-comparison-cheatsheet.md`,
  `templates/10-preguntas-antes-adoptar.md`,
  `templates/benchmark-your-task.py`