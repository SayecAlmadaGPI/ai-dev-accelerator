<!--
  claude-progress.md — Bitácora viva de una sesión larga
  -------------------------------------------------------
  A diferencia del handoff (que se escribe una vez al cerrar), este archivo
  se actualiza DURANTE la sesión: cada subtarea coherente o antes de una
  pausa. Ver M4 §4.7.2.

  Es más detallado que el handoff y más narrativo que state.json:
  - state.json = estado mecánico (qué está done/pending).
  - claude-progress.md = qué descubrimos, qué decidimos, qué probamos.
  - handoff.md = índice condensado al cerrar la sesión.

  Granularidad: lo que racionalmente querrías retomar. No cada línea; cada
  subtarea coherente.

  Cómo usar: el agente lo actualiza durante la sesión. Al cerrar, su
  contenido se condensa en handoff-YYYY-MM-DD.md.
-->

# Progress — [Feature / spec en curso]

> **Spec:** [`docs/specs/<nombre>.md`](ruta)
> **Sesión iniciada:** [YYYY-MM-DD HH:MM]
> **Contexto aprox.:** [se actualiza con cada entrada: ~30% / ~55% / ...]

## Estado actual (la última entrada es la verdad)

| Tarea | Estado | Nota breve |
|-------|--------|-----------|
| [F1] | DONE/VERIFIED | [cómo se verificó] |
| [F2] | en progreso | [dónde quedó] |
| [F3] | sin tocar | — |

## Bitácora (orden cronológico, lo último arriba)

### [YYYY-MM-DD HH:MM] — [subtarea]
- **Hice:** [qué se hizo concreto]
- **Verifiqué:** [qué test/sensor lo confirma]
- **Decidí:** [decisiones, con razón]
- **Descubrí:** [hallazgos, sorpresas, gotchas que valgan retomar]
- **Bloqueante:** [si hay, específico; si no, "ninguno"]
- **Próximo:** [qué sigue]

### [YYYY-MM-DD HH:MM] — [subtarea anterior]
...

## Decisiones pendientes / `[NEEDS CLARIFICATION]`

- [Pregunta abierta que requiere al humano. Si ninguna, "ninguna".]

## Puntos de no retorno por venir

> Decisiones irreversibles próximas: migraciones, deploys, borrados.
> Marcarlas acá para que el HITL las atrape antes de que el agente las ejecute.

- [Ej: "Antes de aplicar la migración F4, requiere revisión humana: toca
  columna en producción."]

<!--
  Recordatorio: si el contexto se acerca al 60%, compacta proactivamente
  o cierra sesión con handoff. No esperes al autocompact (~83%): para
  entonces ya estás en zona degradada (~70%).
-->