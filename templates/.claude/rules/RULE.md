<!--
  RULE.md — Plantilla de una regla scoped (aplica solo a ciertas rutas)
  -------------------------------------------------------------------
  Las reglas scoped (ver M3 §3.4) viven bajo `.claude/rules/` (o
  `.cursor/rules`) y se activan cuando el agente toca archivos que
  coinciden con el `globs`. Son la herramienta para meter reglas que SOLO
  aplican a un subconjunto del repo, sin ensuciar el AGENTS.md global.

  Cuándo sacar una regla del AGENTS.md y llevarla a un rule scoped:
  - Solo aplica a archivos de un subdirectorio o tipo específico.
  - El AGENTS.md global empieza a mezclar reglas de dominios distintos.

  Si la regla aplica a TODO el repo, déjala en AGENTS.md. Mover reglas
  globales a rules scoped fragmenta el contrato y lo hace más difícil de
  auditar.

  Cómo usar este template: copia a .claude/rules/<nombre>.md y reemplaza
  los corchetes.
-->

---
description: [Una línea: qué impone esta regla.]
globs: [patrón/es que disparan la regla. Ej: "src/adapters/**", "db/migrations/**"]
---

# Regla: [Nombre corto]

> **Cuándo aplica:** cuando el agente lee o edita archivos que coinciden con
> `globs`. Fuera de ese scope, esta regla no existe (y eso es lo bueno).

## Lo que el agente debe respetar

- [Regla 1 — específica y verificable.]
- [Regla 2 — específica y verificable.]

## Por qué es scoped y no global

[Una línea: por qué esta regla NO merece un slot en el AGENTS.md de todo
el proyecto. Ej: "Solo aplica al adaptador de pago; meterlo en el global
ensucia el contrato para el resto del repo."]

## Sensor asociado (ver M1 §guías vs sensores)

- [Ej: "El linter `no-side-effects-in-domain` verifica la regla 1 de forma computacional."]
- [Ej: "No hay sensor computacional; la verificación es inferencial (review-agent)."]

> Si una regla scoped se incumple repetidamente y tiene sensor, considera
> subirla a hook (M3 §3.6). Si no tiene sensor, la regla es solo advisory y
> probablemente se incumplirá.

## Anti-patrón

- [Ej: "NO poner esta lógica en el AGENTS.md global pensando que 'así aplica
  a más lados'. Aplicar a más lados es ruido para los lados donde no corresponde."]