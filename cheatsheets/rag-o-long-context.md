<!--
  rag-o-long-context.md — ¿RAG o meter todo en la ventana (long-context)?
  -----------------------------------------------------------------------
  Cheatsheet de decisión (Apéndice B). Versión consulta-rápida de M9 §9.5.2.
-->

# ¿RAG o long-context?

> **Decisión rápida:** long-context para exploración; RAG para lookup
> repetitivo sobre corpus grande y estable. No son mutuamente excluyentes.

## Tabla de decisión

| Necesidad | Cuál | Por qué |
|-----------|------|---------|
| No sabes qué buscarás (exploración, sesión abierta). | **Long-context** | RAG necesita saber qué recuperar; si no lo sabes, mete todo. |
| Lookup repetitivo sobre corpus grande y estable. | **RAG** | Recupera solo lo relevante; más barato en inferencia repetida. |
| Corpus pequeño (cabe en la ventana útil). | **Long-context** | RAG es overhead sin beneficio si todo cabe. |
| Corpus enorme (> ventana útil real). | **RAG** | Long-context sufre lost-in-the-middle y context rot. |
| Necesidad mixta. | **Ambos** | RAG para el corpus + long-context para la sesión activa. |

## Advertencias

- **Ventana nominal ≠ útil.** "1M tokens" no significa calidad sostenida;
  la ventana útil (antes de lost-in-the-middle) suele ser bastante menor
  (M9 §9.3.4).
- **Costo cuadrático.** Cada turno relee todo el contexto; long-context
  sostenido cuesta más que varias sesiones cortas (M4 §4.1.2).
- **RAG pierde lo que no recupera.** Si el retriever falla, el modelo
  nunca ve esa parte; long-context no tiene ese fallo (lo tiene peor:
  lo ve pero no le pesa).

## Veredicto de una línea

- Exploración o corpus chico → **long-context**.
- Lookup repetitivo sobre corpus grande → **RAG**.
- Dudas → empieza con long-context y migra a RAG cuando el costo
  sostenido duela.

**Fondo:** M9 §9.5.2, M4 §4.1.2 (costo cuadrático), M9 §9.3.4 (ventana útil).