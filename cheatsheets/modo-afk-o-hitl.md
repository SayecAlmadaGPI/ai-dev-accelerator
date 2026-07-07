<!--
  modo-afk-o-hitl.md — ¿Modo AFK o human-in-the-loop?
  ---------------------------------------------------
  Cheatsheet de decisión (Apéndice B). Versión consulta-rápida de M4 §4.5.
  El porqué está en el módulo; aquí está el veredicto.
-->

# ¿Modo AFK o human-in-the-loop?

> **Decisión rápida:** no es "qué prefiero", es "qué tan arriesgada y
> qué tan especificada está la tarea".

## Tabla de decisión

| Spec | Reversibilidad | Sensores | Modo |
|------|----------------|----------|------|
| Clara | Reversible | Fuertes | **AFK** seguro. |
| Clara | **Irreversible** (migrar, deployar, borrar) | — | **HITL en el punto de no retorno.** |
| Ambigua | Reversible | — | **HITL en decisiones, AFK entre ellas.** |
| Ambigua | **Irreversible** | — | **HITL total** — o mejor: aclara la spec antes de delegar. |

## El patrón sano: AFK por tramos con puntos de control

Nadie trabaja 100% AFK o 100% HITL. El patrón robusto alterna:

1. Especificas → (HITL)
2. Agente planea → tú apruebas el plan (HITL)
3. Agente ejecuta una feature → (AFK)
4. Agente verifica y reporta DONE/VERIFIED → tú lees (HITL)
5. Repites 3–4 hasta cerrar.

## Anti-patrón

> **AFK total sin puntos de control:** el agente trabaja 40 min, se
> desvía en el minuto 5, vuelves a un diff que no pediste. Los puntos de
> control son baratos; el rework no.

## Veredicto de una línea

- Si puedes revertirlo y los sensores son fuertes → **AFK**.
- Si no puedes revertirlo → **HITL antes del punto de no retorno**.
- Si la spec es ambigua → **HITL en las decisiones**, AFK en lo mecánico.

**Fondo:** M4 §4.5, M6 §6.5 (DONE/VERIFIED).