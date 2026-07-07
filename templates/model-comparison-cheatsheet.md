<!--
  model-comparison-cheatsheet.md — Tabla viva de comparación de modelos
  -------------------------------------------------------------------
  El "dashboard" del M9. El ecosistema cambia cada 3-6 meses; esta tabla
  tiene fecha de medición y caducidad explícita. No es estática.

  Principio: lo que importa para decidir no es "gana en X", es la
  combinación de calidad (en tu dominio), costo, ventana útil y cutoff.
  La columna "ventana útil" NO es la nominal: es la que sostiene calidad.

  Cómo usar: rellena con los modelos que estés evaluando. Actualiza con
  cada release. Marca la fecha de medición. Cuando una fila tenga más de
  6 meses, recíclala.
-->

# Model Comparison Cheat Sheet 2026

> **Fecha de actualización:** [YYYY-MM-DD]
> **Cutoff de referencia:** [fecha de corte de los benchmarks citados]
> **Caduca en:** [fecha + 6 meses] — el ecosistema cambia; revisa antes
> de decidir con esta tabla.

## Tabla comparativa

> Las cifras son *ordinales de referencia* (🔴 bajo / 🟡 medio / 🟢 alto),
> no valores absolutos; los absolutos cambian por release. Para valores
> exactos, verifica contra la fuente del proveedor el día que decidas.

| Modelo | Tipo (Dense/MoE) | Acceso (API/Open-weight) | SWE-bench-Live (cutoff posterior) | Ventana nominal | Ventana útil (estimada) | Costo relativo / 1M tokens | Caching | Multimodal | Notas |
|--------|------------------|-------------------------|-----------------------------------|------------------|-------------------------|---------------------------|---------|------------|-------|
| [Modelo A] | [Dense/MoE] | [API/Open] | [🔴/🟡/🟢] | [tokens] | [tokens] | [🔴/🟡/🟢] | [sí/no] | [sí/no] | [una línea] |
| [Modelo B] | ... | ... | ... | ... | ... | ... | ... | ... | ... |
| [Modelo C] | ... | ... | ... | ... | ... | ... | ... | ... | ... |

## Claves de lectura

- **SWE-bench-Live, no Verified.** Live es anti-contaminación (M9 §9.2.2).
  Verified puede inflarse ~3× por overfitting.
- **Ventana útil ≠ nominal.** La nominal es marketing; la útil es la que
  sostiene calidad antes de lost-in-the-middle / context rot (M9 §9.3.4).
- **Costo relativo:** comparar input, output Y cached. Para sesiones
  largas, el caching es el ahorro dominante (M9 §9.5.1).
- **Multimodal:** marcar solo si tu harness real lo usa. Pagar multimodal
  que no usas es costo sin beneficio.

## Cost-per-quality (lo que de verdad decides)

Para cada modelo, calcula para una muestra de TUS tareas:

```
cost_per_task = (tokens_input + tokens_output × factor_output) × precio
quality = % de tareas resueltas a nivel aceptable (prueba ciega, M9 §9.4.2)
cost_per_quality = cost_per_task / quality
```

El modelo con menor `cost_per_quality` en TU dominio gana — no el de
mejor SWE-bench.

| Modelo | Costo medio por tarea | % resueltas (ciego) | Cost-per-quality |
|--------|----------------------|---------------------|------------------|
| [Modelo A] | [$] | [%] | [$/%] |
| [Modelo B] | ... | ... | ... |

## Comparativa de harness (no solo de modelos)

> Recuerda: decides una *combinación* modelo+harness (M9 §9.4.3, M1).

| Tool | Modelo por defecto | Cambio de modelo | MCP | Hooks | Skills | Cost model | Portabilidad del harness (M3 §3.9) |
|------|--------------------|------------------|-----|-------|--------|------------|------------------------------------|
| [Tool A] | [cuál] | [sí/no] | [sí/no] | [sí/no] | [sí/no] | [por sesión/token] | [alta/media/baja] |
| [Tool B] | ... | ... | ... | ... | ... | ... | ... |

## Decisión de adopción (resumen)

- **Adoptar si:** gana la prueba ciega en mi dominio Y cost-per-quality
  no empeora Y hay rollback fácil Y pasa las 10 preguntas (M9 §9.4.1).
- **No adoptar si:** el único argumento es un benchmark estático.
- **Esperar si:** release con <2 semanas (deja que otros encuentren
  regresiones).

## Referencia

- M9 §9.2 — benchmarks por nivel.
- M9 §9.3 — trampas de leaderboards.
- M9 §9.4 — protocolo de evaluación de releases.
- `templates/10-preguntas-antes-adoptar.md`, `templates/benchmark-your-task.py`.