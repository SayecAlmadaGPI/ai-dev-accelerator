<!--
  una-sesion-o-varias.md — ¿Sigo en esta sesión o cierro y arranco otra?
  ---------------------------------------------------------------------
  Cheatsheet de decisión (Apéndice B). Versión consulta-rápida de M4 §4.2.
-->

# ¿Una sesión o varias?

> **Decisión rápida:** depende del nivel de contexto y de si está viciado.
> Los umbrales: 60% compacta, 70% context rot, 83.5% autocompact.

## Tabla de decisión

| Contexto | Estado del trabajo | Qué hacer |
|----------|--------------------|-----------|
| < ~60% | Sigue productivo | **Sigue en la misma sesión.** |
| ~60% | Más por hacer, contexto sano | **Compacta proactivamente** en un punto coherente. |
| ~60% | Cambias de tool/máquina | **Cierra con handoff** (compactar no te ayuda a cambiar de tool). |
| ~70%+ | Errores que antes no cometía (context rot) | **Cierra y arranca limpio con handoff.** No compactes: conserva lo viciado. |
| ~83.5% | (autocompact) | **Demasiado tarde.** Para cuando llega, ya trabajaste en zona degradada. |

## Compaction vs. cierre de sesión

| Situación | Compactar | Cerrar + handoff |
|-----------|-----------|------------------|
| Sigues tú, misma tool, contexto sano pero lleno. | ✅ | Innecesario |
| Cambias de tool o máquina. | ❌ no te ayuda | ✅ el handoff es portátil |
| El agente está degradado (errores acumulados). | ⚠️ sigue con contexto viciado | ✅ arranca limpio |
| Cerraste una subtarea coherente y hay más. | ✅ | Cualquiera sirve |
| Terminaste por hoy. | — | ✅ deja handoff |

## Anti-patrón

> **"Compactar y seguir" cuando lo correcto es "cerrar y arrancar
> limpio".** Compactar conserva el contexto viciado; cerrar lo descarta,
> pero te obliga a tener el estado en archivos (system of record, M1).

## Veredicto de una línea

- Contexto <60% y productivo → **sigue**.
- ~60% y sano, más por hacer → **compacta**.
- Degradado o cambias de tool → **cierra con handoff**.
- Nunca esperes al autocompact (~83%).

**Fondo:** M4 §4.1 (anatomía) y §4.2 (compaction), §4.3 (handoff).