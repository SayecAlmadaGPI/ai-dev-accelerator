<!--
  DONE_VERIFIED.md — Schema de reporte de cierre de tarea
  --------------------------------------------------------
  El reporte de cierre exigido por el AGENTS.md y el pipeline de
  verificación. Ver M6 §6.5.

  Principio: un cierre sin este schema no es un cierre. "Todo verde" no
  cuenta: no dice qué se verificó, qué no, ni qué supuso. Exigir el schema
  no es burocracia; es lo único que separa "verifiqué" de "creo que
  verifiqué".

  Las cuatro partes son obligatorias. La parte 2 (qué NO se verificó) y
  la 4 (qué revisa el humano primero) son las que más se omiten y las que
  más valor aportan.

  Cómo usar: el agente lo completa al cerrar una tarea. Si una parte no
  aplica, dice explícitamente "n/a — razón", no la omite.
-->

# DONE / VERIFIED — [Nombre de la tarea]

> **Tarea:** [referencia a `.planning/tasks/<id>.md` o descripción breve]
> **Spec:** [`docs/specs/<nombre>.md`](ruta)
> **Commit:** [SHA del commit verde que cierra esta tarea]

## 1. Qué se verificó

> Comandos corridos + resultado numérico. No marcas de check; números y
> nombres.

- **Typecheck:** `[comando]` — resultado: [ok / N errores]
- **Lint:** `[comando]` — resultado: [ok / N warnings]
- **Tests:** `[comando]` — resultado: [N passed / N failed], cobertura [N%]
- **Otros sensores:** [schema-diff, e2e, contract tests — los que apliquen]

> Si un sensor no se corrió, no lo listes acá; va en la sección 2.

## 2. Qué NO se verificó

> Lo que quedó fuera del alcance de la verificación. Esto no es
> debilidad; es honestidad que le ahorra al revisor suposiciones.

- [Ej: "Tests e2e no corridos: requieren entorno de staging, fuera del
  scope de esta tarea."]
- [Ej: "Caso edge de concurrencia: no hay test; supuesto de que el
  adapter es single-thread."]
- [Ej: "Behavior en DB de prod: verificado solo en container de test."]

## 3. Supuestos hechos

> Lo que el agente asumió sin confirmar. Cada supuesto es algo que el
> revisor puede validar o rechazar.

- [Ej: "Asumí que la API de pagos sigue la v2; no lo verifiqué contra la
  doc viva."]
- [Ej: "Asumí inmutabilidad del input; si el caller muta el objeto, el
  resultado puede diferir."]

## 4. Qué revisa el humano primero

> El top-1 a top-3 de riesgo que merece ojos humanos antes de mergear.
> Prioriza la atención limitada del revisor.

1. **[Riesgo 1]:** [qué y por qué es lo más importante de revisar.]
2. **[Riesgo 2]:** [...]
3. **[Riesgo 3]:** [...]

## Resultado

- [ ] DONE: la implementación cumple la spec (sección 1 lo respalda).
- [ ] VERIFIED: sensores computacionales en verde; riesgos declarados en
  secciones 2-4.

<!--
  Recordatorio: si la sección 1 está vacía o sin números, NO marques
  VERIFIED. Sin sensores computacionales que respalden el DONE, es un
  hollow report (M6 §6.1.2).
-->