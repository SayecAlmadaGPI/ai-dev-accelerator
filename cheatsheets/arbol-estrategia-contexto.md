<!--
  arbol-estrategia-contexto.md — Árbol de decisión: cache vs. RAG vs. compact
  --------------------------------------------------------------------------
  Árbol de decisión (Apéndice C). Decide la estrategia de contexto de la
  sesión. Combina cache (M4), compact (M4) y RAG vs. long-context (M9).
-->

# Árbol de estrategia de contexto

> **El contexto es el cuello de botella.** Decidir cómo lo manejas
> (conservarlo con cache, resumirlo con compact, o partirlo con RAG) es
> una de las decisiones que más impacto tiene en costo y calidad.

```
¿Cuál es tu problema de contexto ahora?
│
├─ ¿La conversación es larga pero el CONTENIDO no cambia entre turnos
│  (mismo spec, misma base de código)?
│  └─ SÍ → CACHE (prompt caching).
│      El prefijo estable se cachea; pagas solo el delta nuevo.
│      Caveat: TTL ~5 min; si la sesión se enfría, el cache se pierde.
│
├─ ¿El contexto creció y empieza a degradarse, pero lo que hay
│  SIGUE siendo relevante?
│  └─ SÍ → COMPACT (proactivo, ~60%).
│      Resume en un punto coherente. Conserva lo relevante; descarta
│      el ruido. Siempre antes del autocompact (~83%).
│
├─ ¿El contexto está viciado (errores que antes no cometía) aunque
│  no esté lleno?
│  └─ SÍ → CERRAR SESIÓN + HANDOFF (no compact).
│      Compact conserva lo viciado. Cerrar descarta y arranca limpio.
│      Requiere que el estado esté en archivos (M1, system of record).
│
├─ ¿Necesitas material de un corpus GRANDE y estable, y sabes qué
│  buscar (lookup repetitivo)?
│  └─ SÍ → RAG.
│      Recupera solo lo relevante; barato en inferencia repetida.
│      Advertencia: si el retriever falla, el modelo nunca ve esa parte.
│
├─ ¿No sabes qué buscarás (exploración) o el corpus es chico?
│  └─ SÍ → LONG-CONTEXT.
│      Mete todo. Ojo: ventana nominal ≠ útil (lost-in-the-middle).
│      Y el costo es cuadrático en el contexto (M4 §4.1.2).
│
└─ ¿Combinas ambos (sesión activa + corpus grande)?
   └─ SÍ → RAG + LONG-CONTEXT.
       RAG para el corpus, long-context para la sesión activa.
```

## Regla de los umbrales

| Umbral | Qué dispara |
|--------|-------------|
| < ~60% | Sigue; cache lo que sea estable. |
| ~60% | Compact proactivo en un punto coherente. |
| ~70%+ | Context rot probable: cierra + handoff (no compact). |
| ~83.5% | Autocompact: ya trabajaste en zona degradada. Demasiado tarde. |

> **Costo cuadrático:** cada turno relee todo el contexto. Sostener
> long-context cuesta más que varias sesiones cortas con handoff.

## Veredicto de una línea

- Estable entre turnos → **cache**.
- Lleno pero sano → **compact**.
- Viciado → **cerrar + handoff** (no compact).
- Corpus grande y lookup repetitivo → **RAG**.
- Exploración o corpus chico → **long-context**.

**Fondo:** M4 §4.1 (anatomía/costo), §4.2 (compaction), §4.3 (handoff);
M9 §9.5 (estrategias de contexto), §9.5.2 (RAG vs. long-context).
Ver también [¿RAG o long-context?](./rag-o-long-context.md) y
[¿Una sesión o varias?](./una-sesion-o-varias.md).