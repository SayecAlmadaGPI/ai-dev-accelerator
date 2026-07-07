<!--
  lab-04-failure-mode-hunt/README.md
  -----------------------------------
  Lab 04 — Failure Mode Hunt. Un proyecto con 5 bugs inyectados; el
  agente debe encontrarlos y fixearlos siguiendo el protocolo de
  debugging del M8 §8.7 y la taxonomía del M7. Fase 4.

  Ejercita: M7 (failure modes, clasificación, postmortem), M6
  (verificación, regression test), M8 §8.7 (debugging de incidente).

  Principio del lab: los bugs están elegidos para cubrir clases
  distintas de la taxonomía del M7. El valor no es "encontrarlos"; es
  clasificar cada uno y responder con la mitigación correcta, no con
  "cámbialo hasta que pase".
-->

# Lab 04 — Failure Mode Hunt

> **Objetivo:** cazar 5 bugs inyectados, cada uno de una clase distinta
> de la taxonomía del M7, y fixearlos con el protocolo de debugging del
> M8 (reproducción → hipótesis → fix mínimo → regression test), cerrando
> cada uno con un mini-postmortem. No se trata de encontrar bugs, se
> trata de clasificarlos y responder bien.

## Módulos que ejercita

- **M7** — taxonomía de 5 clases, árbol de decisión, postmortem.
- **M6** — regression test, DONE/VERIFIED, test gaming (evitarlo).
- **M8 §8.7** — debugging de incidente: reproducir antes de tocar.

## El proyecto

Un mini "todo app" (o el del `lab-02` extendido) con 5 bugs inyectados a
propósito. Cada bug representa una clase distinta de falla. No te
decimos cuáles son — el lab es cazarlos.

Estructura mínima del proyecto:
- `src/` con la lógica.
- `tests/` con tests que **pasan** (algunos bugs no rompen tests; rompen
  comportamiento no cubierto).
- `init.sh` que reproduce el entorno.
- `BUGS.md` vacío — lo llenas tú con la cacería.

## Las 5 clases a cazar (una por bug)

Cada bug está diseñado para cubrir una clase de la taxonomía del M7.
El orden no es pista; cada bug puede ser de cualquier clase.

| # | Clase (M7 §7.1) | Qué buscar |
|---|-----------------|------------|
| 1 | **Corrupción de contexto** (manifestada en código) | Un valor que se cachea y se asume inmutable, pero cambia. Estado implícito. |
| 2 | **Mal uso de tools / hallucination** | Una llamada a una API/lib que no existe, o con argumentos inventados. Compila en la cabeza del autor, no en el runtime. |
| 3 | **Trayectoria / scope creep** | Un bug introducido por "mientras tanto refactorizo" — mezcla de cambio de behavior con cambio de estructura. |
| 4 | **Acción / phantom verification** | Un test que afirma verificar pero no ejecuta el assert, o un `.skip` que oculta el bug. |
| 5 | **Sandbox / seguridad** | Un path que lee un archivo del entorno (p.ej. un `.env` o un path relativo escapable) que no debería. |

## Parte 1 — Caza (sin tocar código)

1. Corre `init.sh` y los tests. Anota qué pasa y qué no.
2. Recorre el código con el agente **sin pedirle fixes todavía**. Pídele
   que liste *hipótesis* de bugs, no que los arregle.
3. Para cada hipótesis, pídele que la *reproduzca* (un test que falle con
   el bug) antes de tocar nada (M8 §8.7).

> Si el agente salta a "lo arreglo", deténlo. Sin reproducción, no hay
> fix; hay parche.

## Parte 2 — Clasifica

Para cada bug encontrado, clasifícalo con el cheatsheet de 12 clases
(`templates/failure-classes-cheatsheet.md`). Registra en `BUGS.md`:

- Bug #, síntoma observable, clase (macro + modo concreto de los 12),
  evidencia (el test que lo reproduce).

> La clasificación importa más que el fix. Un bug mal clasificado te
> lleva a la mitigación equivocada (M7 §7.9).

## Parte 3 — Fix con protocolo

Para cada bug, en orden:
1. **Reproducción** (test que falla con el bug).
2. **Hipótesis** de la causa (no corazonada).
3. **Fix mínimo** dirigido por la hipótesis confirmada. *No refactor de
   paso* — eso es scope creep, la clase 3 (M8 §8.7).
4. **Regression test** que queda verde tras el fix.
5. **Reporte DONE/VERIFIED** (M6 §6.5) por bug.

## Parte 4 — Postmortem por bug

Para cada bug, un mini-postmortem (`templates/incident-postmortem-agent.md`,
versión condensada):

- Clase de falla (de la taxonomía).
- Por qué no lo atrapó el harness *antes* de que tú lo cazases.
- Mitigación a instalar (qué hook, qué test, qué regla promover).

> El postmortem es la parte que más vale. Si terminas el lab con 5
> fixes pero 0 mitigaciones instaladas, no aprendiste a prevenir, solo
> a curar.

## Criterio de terminación

- 5 bugs cazados, reproducidos, fixeados con regression test.
- `BUGS.md` con la clasificación de cada uno (clase macro + modo de los
  12).
- 5 mini-postmortems, cada uno con al menos una mitigación a instalar.
- Al menos 2 mitigaciones efectivamente instaladas (un hook, un test
  golden, una regla promovida).
- `RESULTADO.md` con: qué clase fue la más fácil de cazar, cuál la más
  difícil, y qué dice eso de tu harness actual (¿dónde es más débil?).

## Qué debes haber aprendido

- Que clasificar la falla antes de fixear cambia el fix que eliges.
- Que "reproducir antes de tocar" es la diferencia entre fix y parche.
- Que cada bug es síntoma de un hueco en el harness; el postmortem lo
  convierte en defensa permanente.
- Qué clase de la taxonomía es tu punto ciego actual (la que más te
  costó cazar).

## Referencias

- `modules/07-failure-modes.md`
- `modules/06-verificacion.md`
- `modules/08-casos-uso.md` §8.7
- `templates/failure-classes-cheatsheet.md`,
  `templates/incident-postmortem-agent.md`,
  `templates/DONE_VERIFIED.md`,
  `templates/es-verificable-checklist.md`