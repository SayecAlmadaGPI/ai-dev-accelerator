<!--
  SKILL.md — Plantilla de un skill reutilizable
  --------------------------------------------
  Un skill (ver M3 §3.3) es un flujo vertical y repetible que se invoca por
  nombre, vive bajo `.claude/skills/` y se carga on-demand. Es la herramienta
  para meter conocimiento profundo sin inflar el system prompt.

  Criterios para que algo merezca ser un skill (los tres deben cumplirse):
  1. El flujo se repite 3+ veces (si no, no amortizas el costo de escribirlo).
  2. Tiene pasos discretos que el agente olvidaría o saltaría sin guía.
  3. El conocimiento que necesita no está en el AGENTS.md (si está, es regla,
     no skill).

  Si las dos primeras no se cumplen, deja que el agente lo improvise con el
  AGENTS.md; meter todo en skills es la otra cara del AGENTS.md hinchado.

  Cómo usar este template: copia este archivo a
  .claude/skills/<nombre-del-skill>/SKILL.md y reemplaza los corchetes.
-->

---
name: [nombre-del-skill-en-kebab-case]
description: [Una línea: qué hace y cuándo invocarlo. El agente decide si usarlo
  a partir de esta línea, así que sé específico sobre el "cuándo".]
---

# [Nombre del skill]

> **Tesis:** [una línea. Qué logra este skill y por qué vale como artefacto
> reutilizable en lugar de una instrucción ad-hoc.]

## Cuándo usarlo

- [Condición de entrada 1 — ej: "Hay que crear una migración de DB."]
- [Condición de entrada 2 — ej: "El equipo reportó el mismo flujo 3+ veces."]

## Cuándo NO usarlo

- [Ej: "Es un cambio de esquema trivial que no toca datos en producción."]
- [Ej: "El flujo ya está cubierto por otro skill."] — evita skills solapados.

## Pasos

1. **[Verbo en infinitivo] [qué].**
   - Por qué: [qué se previene si se hace en este orden].
   - Gate: [qué debe ser verdadero antes de avanzar al paso 2].

2. **[Verbo] [qué].**
   - ...

3. **[Verbo] [qué] — el paso de verificación.**
   - Este paso no es opcional. Un skill sin verificación es una receta que
     se cree correcta por defecto.

## Invariante (lo que este skill garantiza)

- [Ej: "Toda migración creada por este skill es reversible y tiene un test
  de rollback."]

## Anti-patrón

- [Ej: "NO crear la migración y el rollback en commits separados; si se
  separan, el rollback se olvida."]

## Artefactos que produce / toca

- [Ej: "`db/migrations/<timestamp>_<nombre>.sql` (forward)"]
- [Ej: "`db/migrations/<timestamp>_<nombre>_rollback.sql` (reverse)"]

## Referencias

- [Link a la doc interna o externa de donde sale el flujo, si la hay.]
- [Referencia cruzada a un módulo: ver M3 §3.3.]