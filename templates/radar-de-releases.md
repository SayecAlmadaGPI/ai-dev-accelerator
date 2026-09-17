<!--
  templates/radar-de-releases.md
  ------------------------------
  El protocolo operativo del radar de releases (Módulo 9 §9.4.5): cómo
  enterarte de los releases, filtrarlos por capas de confianza y registrar
  las decisiones para tener línea de base en la próxima evaluación.
-->

# Radar de releases — de la publicación a tu repo

> **Objetivo:** no ahogarte en el ruido de releases y, aun así, no perderte
> el que sí te importa. Un filtro de capas con confianza decreciente, una
> cadencia fija (trimestral) y un registro de decisiones que te da línea de
> base para la próxima evaluación. Fondo: M9 §9.3.5 (claims), §9.4.1 (10
> preguntas), §9.4.2 (prueba ciega), §9.4.5 (las capas).

## 1. Las capas del filtro (confianza decreciente)

| Capa | Señal | Fuente concreta (2026-09) | Qué hacer |
|---|---|---|---|
| 0 — Anuncio | Tweet, keynote, demo | X, YouTube, newsletters | Fecha + qué afirman. **Cero números.** |
| 1 — Fuente primaria | Release notes, changelog, paper | Blog del proveedor, repo, arXiv | Extraer: qué cambió, cutoff, precio, breaking changes |
| 2 — Benchmarks independientes fechados | Leaderboards con fecha de medición | SWE-bench Pro público+privado (Scale Labs), Terminal-Bench 4.0, llm-stats, CodeSOTA | Contexto fuerte; verificar que la última entrada sea de este trimestre |
| 3 — Estudios empíricos | RCTs, surveys, académicos | METR (uplift update 2026-02, survey 2026-05), arXiv | Contexto de confianza; nunca decisión |
| 4 — **Tu prueba ciega** | 5-10 tareas reales de TU repo | `benchmark-your-task.py` + lab-05 | **La única capa que decide** |

## 2. Checklist de filtrado (8 señales de hype)

Marca una señal y el release baja a "vigilar" (o se archiva):

- [ ] El benchmark citado es **anterior al cutoff** del modelo nuevo.
- [ ] Solo hay métricas function-level (HumanEval) para un claim de agente.
- [ ] "Agentic" sin especificar harness, contexto ni comandos de verificación.
- [ ] Comparación contra el **peor** modelo rival, no contra el mejor actual.
- [ ] Precio anunciado sin cache tokens ni cost-per-quality.
- [ ] Ventana de contexto anunciada sin *ventana útil* (§9.3.4).
- [ ] "Hasta X%" sin distribución, ni n, ni fecha de medición.
- [ ] El claim de productividad es autoreporte sin protocolo (§9.3.5).

**8/8 señales = archiva.** Menos de 3 y la dimensión te duele → prueba ciega.

## 3. Registro de decisiones (tu línea de base)

| Fecha | Release | Capas 0-1 (qué afirma) | Capa 2 (independiente) | Capa 3 (estudios) | Capa 4 (tu prueba) | Decisión | Rollback |
|---|---|---|---|---|---|---|---|
| 2026-09-XX | \<nombre\> | \<qué afirmó el vendor\> | \<benchmarks con fecha\> | \<estudios citables\> | 5-10 tareas, resultado | adoptar / vigilar / descartar | cómo revertir |

**La regla:** sin registro, cada evaluación arranca desde cero y dependes de
la memoria (que rota como el contexto del agente, M4). Con registro, la
próxima evaluación compara contra tu línea de base documentada.

## 4. Cuándo formalizar un eval suite

La prueba ciega manual alcanza para decisiones puntuales. Formaliza cuando:
- Evalúas modelos **más de una vez por trimestre**,
- el costo de una mala adopción supera las horas de armar el suite,
- hay varios agentes/personas evaluando (necesitas la misma vara).

En ese caso: dataset permanente de tus tareas + scoring automático + el
suite en CI (se corre con cada release candidato). Ver
[Anthropic — Demystifying evals for AI agents](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)
y la guía Evals de [OpenAI](https://developers.openai.com/learn/evals).

## Referencias

- `modules/09-evaluacion-modelos.md` §9.3.5, §9.4.5 — el fondo conceptual.
- `templates/benchmark-your-task.py` — la capa 4.
- `templates/10-preguntas-antes-adoptar.md` — el gate de adopción.
- [METR — uplift update](https://metr.org/blog/2026-02-24-uplift-update/) y [survey](https://metr.org/blog/2026-05-11-ai-usage-survey/) — cómo se lee un claim de productividad.