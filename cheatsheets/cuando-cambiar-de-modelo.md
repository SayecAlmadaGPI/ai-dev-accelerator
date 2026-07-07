<!--
  cuando-cambiar-de-modelo.md — ¿Cambio de modelo en este release?
  ---------------------------------------------------------------
  Cheatsheet de decisión (Apéndice B). Versión consulta-rápida de M9 §9.4.4.
-->

# ¿Cuándo cambiar de modelo?

> **Decisión rápida:** cambia si el nuevo resuelve TUS tareas mejor *a
> ciegas* Y no empeora cost-per-quality Y hay rollback fácil. Si el
> único argumento es un benchmark público, no cambies.

## Tabla de decisión

| Señal | Acción |
|-------|--------|
| Gana la prueba ciega en TU dominio (M9 §9.4.2) Y cost-per-quality no empeora Y rollback fácil. | **Cambia.** |
| Gana en SWE-bench-Verified pero NO lo probaste a ciegas en tu dominio. | **No cambies** — Verified puede estar contaminado (M9 §9.2.2). |
| Release con <2 semanas. | **Espera** — deja que otros encuentren regresiones. |
| Solo cambia el benchmark publicitario; tu dominio no mejora. | **No cambies** — el delta no justifica la fricción. |
| Sube el costo pero el delta de calidad es marginal. | **No cambies** — cost-per-quality empeora. |
| Mejora en X pero pierde en Y que necesitas. | **No cambies** — cambia por arriba puede ser abajo donde te duele. |

## Heurística de las 3 condiciones (las tres a la vez)

1. **Gana a ciegas** en 5-10 tareas reales de tu codebase (no en
   HumanEval). Usa `templates/benchmark-your-task.py`.
2. **Cost-per-quality** no empeora para tu volumen.
3. **Rollback** en un comando si empeora tu dominio.

Si falla cualquiera, no cambies.

## Anti-patrón

> **"Cambiar cada release porque sí".** El delta rara vez justifica la
> fricción del cambio (rework del harness, retipo de prompts, regressions
> ocultas). Cambia con evidencia, no con hype.

## Veredicto de una línea

- Evidencia en tu dominio + costo razonable + rollback → **cambia**.
- Solo hype de benchmark → **no cambies**.
- Release muy nuevo → **espera**.

**Fondo:** M9 §9.4.4 (heurísticas), §9.4.2 (prueba ciega), §9.3.3
(cost-per-quality). Checklist completo: `templates/10-preguntas-antes-adoptar.md`.