<!--
  benchmark-importa-mi-caso.md — ¿Este benchmark importa para mi caso?
  -------------------------------------------------------------------
  Cheatsheet de decisión (Apéndice B). Versión consulta-rápida de M9 §9.2.
-->

# ¿Este benchmark importa para mi caso?

> **Decisión rápida:** importa si mide una tarea parecida a la tuya Y es
> posterior al cutoff del modelo. Si mide "una función suelta" o es
> estático anterior al cutoff, es marketing, no señal.

## Tabla de decisión por nivel

| Nivel del benchmark | Mide | ¿Importa para un coding agent? |
|---------------------|------|-------------------------------|
| **Function-level** (HumanEval, MBPP) | Una función aislada. | **Bajo** — pocas tareas reales son una función suelta. |
| **Repository-level** (SWE-bench y variantes) | Un issue real multi-archivo. | **Alto** — aproxima el trabajo real del agente. |
| **Agent-oriented** (Terminal-Bench, AgentBench, GAIA) | Actuar en un entorno. | **Alto** — decide y ejecuta, no solo responde. |
| **Contests** (LiveCodeBench, Codeforces) | Algoritmos con respuesta correcta. | **Medio** — razonamiento algorítmico, no ingeniería. |
| **Reasoning** (MMLU, GPQA, AIME, HLE) | Conocimiento/raciocinio general. | **Bajo** para coding — proxy, no ingeniería. |
| **Arena / ELO** (LMArena) | Preferencia humana en duelos. | **Subjetivo** — termómetro, no decisión. |

## Dos preguntas que filtran cualquier benchmark

1. **¿Es posterior al cutoff del modelo?**
   - No → mide **memorización**, no capacidad (M9 §9.3.1). Descarta el número.
2. **¿Es repo-level / agent-oriented, o solo function-level?**
   - Function-level → es marketing para tu caso (M9 §9.2.1).

## La trampa SWE-bench (Verified vs. Live)

> SWE-bench-Verified muestra ~70%; SWE-bench-Live muestra ~24%. La
> diferencia no es "el modelo empeoró": Live no permite que el modelo
> haya visto la respuesta. Ese gap (~46 puntos) es la medida del
> overfitting a benchmarks estáticos (M9 §9.2.2). Si un proveedor solo
> cita Verified, desconfía.

## Veredicto de una línea

- Repo-level / agent-oriented Y posterior al cutoff → **míralo**.
- Function-level o estático anterior al cutoff → **ignóralo** como
  argumento de adopción.
- El benchmark que de verdad importa: **tu prueba ciega en tu dominio**
  (M9 §9.4.2).

**Fondo:** M9 §9.2 (niveles), §9.3 (trampas), §9.4.2 (prueba ciega).