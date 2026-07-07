<!--
  10-preguntas-antes-adoptar.md — Checklist antes de adoptar un modelo
  -------------------------------------------------------------------
  El protocolo de M9 §9.4.1. Antes de cambiar de modelo por un release,
  responde las 10 preguntas. Si fallas las 4 primeras (los cimientos),
  lo demás no importa: no adoptes.

  Principio: el argumento para adoptar no es "gana en X benchmark"; es
  "resuelve mejor TUS tareas reales, a costo razonable, con rollback
  fácil". Si no puedes articular eso, no adoptes.
-->

# 10 preguntas antes de adoptar un nuevo modelo

> **Modelo evaluado:** [nombre + versión]
> **Release date:** [YYYY-MM-DD]
> **Modelo actual de referencia:** [nombre + versión]
> **Evaluador:** [quién decide]

## Cimientos (si fallan, no adoptes)

- [ ] **1. ¿Resuelve el release un problema que TÚ tienes?**
  No "gana en X"; "mejora en la dimensión que me duele" (latencia,
  costo, razonamiento, ventana). Si no puedes nombrar el problema,
  no hay razón para cambiar.

- [ ] **2. ¿El benchmark que cita es posterior al cutoff del modelo?**
  Si el benchmark es anterior o contemporáneo al cutoff, el modelo
  pudo ver las respuestas → mide memorización, no capacidad (M9 §9.3.1).

- [ ] **3. ¿Es repo-level / agent-oriented, o solo function-level?**
  Lo primero importa para coding agents; lo segundo es marketing
  (M9 §9.2.1). HumanEval no decide tu adopción; SWE-bench-Live sí.

- [ ] **4. ¿El costo por token sube, baja o es igual?**
  Calcula cost-per-quality para tu volumen, no solo "es más barato por
  1M". Si sube costo y el delta de calidad es marginal, no adoptes.

## Compatibilidad y riesgo

- [ ] **5. ¿La ventana útil (no nominal) cambia a tu favor?**
  ¿Sostiene calidad en rangos largos o solo anuncia 1M? Mid-lost-in-
  the-middle / context rot (M9 §9.3.4).

- [ ] **6. ¿Mantiene compatibilidad con tu harness?**
  API, tool calling, streaming, caching. Romper una de estas te cuesta
  rework del harness (M3). Marca cuáles se rompen.

- [ ] **7. ¿Qué pierdes del modelo actual?**
  Cambiar por arriba en X puede ser abajo en Y que necesitas (M9 §9.4.1).
  Lista lo que el actual hace bien y verifica el nuevo no lo pierde.

- [ ] **8. ¿Hay rollback fácil?**
  Si el nuevo empeora tu dominio, ¿puedes volver en un comando? Si no,
  la adopción es riesgosa (M4, M8 §8.6 rollback plan).

## Señal mínima y timing

- [ ] **9. ¿Cuál es la señal mínima de adopción?**
  No "es mejor"; "resuelve N de mis tareas reales mejor que el actual
  en una prueba ciega" (M9 §9.4.2). Define N antes de probar.

- [ ] **10. ¿Es momento de cambiar?**
  ¿El delta justifica la fricción del cambio, o esperas al próximo
  release? Si el release tiene <2 semanas, considera esperar a que
  otros encuentren regresiones.

---

## Veredicto

- **10 "sí":** adopta (con prueba ciega del punto 9 ya hecha).
- **8-9 "sí":** adopta condicional; resuelve lo que falló antes de migrar
  a todos.
- **5-7 "sí":** no adoptes; el delta no justifica la fricción.
- **<5 "sí":** no adoptes; faltan los cimientos.

## Evidencia de la prueba ciega (punto 9)

> Adjunta el resultado de `benchmark-your-task.py` (M9 §9.4.2) sobre
> tus tareas reales, a ciegas (sin saber cuál es cuál al evaluar).

| Tarea | Modelo actual (resuelve: sí/no/parcial) | Modelo nuevo (sí/no/parcial) | Ganador |
|-------|-----------------------------------------|-----------------------------|--------|
| [T1] | ... | ... | ... |
| [T2] | ... | ... | ... |
| **Total** | N/M | N/M | [cuál] |

## Decisión final

- [ ] **Adoptar** a partir del [fecha].
- [ ] **No adoptar**; razón: [una línea].
- [ ] **Esperar** hasta [fecha] y reevaluar.

<!--
  Recordatorio: este checklist no decide por ti; te impide adoptar por
  hype. Si después de responder las 10 la decisión no es obvia, la
  respuesta casi siempre es "espera al próximo release".
-->