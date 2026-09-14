<!--
  lab-07-handoff-restore/README.md
  ---------------------------------
  Lab 07 — Handoff y restore. Interrumpir a propósito una sesión real
  al ~60% de contexto, ejecutar el cierre de 7 pasos, abrir una sesión
  NUEVA y probar que reconstruye el estado solo desde archivos. El delta
  entre lo narrado y lo reconstruido mide la calidad real del handoff.
  Fase 4.

  Ejercita: M4 (handoffs, commit discipline, recuperación de estado),
  M3 (workbench como system of record), M6 (verificación mecánica).

  Principio del lab: un handoff no se valida escribiéndolo, se valida
  restaurándolo. Si una sesión nueva sin historial no puede retomar el
  trabajo, tu handoff fue teatro.
-->

# Lab 07 — Handoff y restore

> **Objetivo:** interrumpir a propósito una sesión real de trabajo al
> ~60% de contexto, cerrarla con el checklist de 7 pasos, y probar que
> una sesión NUEVA retoma el estado **solo desde archivos** — sin que le
> pegues una línea del historial viejo. El delta entre lo que tú sabías
> y lo que el agente reconstruyó es la medida objetiva de tu handoff.

## Módulos que ejercita

- **M4** — handoffs (§4.3), commit discipline (§4.6), recuperación de
  estado (§4.7).
- **M3** — el workbench como system of record: AGENTS.md, `.planning/`.
- **M6** — verificación mecánica en verde como paso 1 del cierre.

> **Calentamiento (opcional):** la página del Módulo 4 en el sitio trae
> el widget de práctica `m4-handoff` — un terminal para recorrer el
> checklist de cierre en 7 pasos antes de hacerlo en tu proyecto real.

## Parte 1 — Interrumpe y cierra con el checklist

Arranca una sesión de trabajo real (tu proyecto actual, o el feature
del `lab-02` si quieres terreno conocido). Trabaja hasta que el
contexto llegue al **~60%**. Ahí interrumpe — de preferencia al final
de una subtarea coherente (M4 §4.2.2).

Ejecuta el cierre completo con `templates/session-close-checklist.md`:

1. Verificación mecánica en verde (tests + typecheck + lint).
2. Commit por unidad coherente.
3. Mensaje de commit útil (qué hizo, qué verificó, qué NO hizo).
4. `claude-progress.md` actualizado (`templates/claude-progress.md`).
5. `handoff.md` con las **5 partes** (`templates/handoff.md`): spec
   activa, progreso real, **bloqueantes** (lo más valioso; lo que más
   se omite), decisiones tomadas, SHA del último commit verde.
6. `state.json` / `.planning/` consistente con el handoff.
7. `git status` limpio (o explícitamente WIP).

> Prohibido: "me faltan 5 minutos, termino esto otro". El punto del lab
> es cerrar a media marcha — es exactamente la situación en la que un
> handoff malo te cuesta la siguiente sesión.

## Parte 2 — Arranca la sesión nueva con el protocolo §4.7.1

Abre una sesión **nueva** (o `/clear` total, si tu tool lo garantiza).
Pídele al agente que siga la secuencia de arranque del M4 §4.7.1:

1. Leer el `AGENTS.md` (o `CLAUDE.md`) — el contrato estable.
2. Leer el handoff más reciente — el índice de estado.
3. Leer `.planning/state.json` (o equivalente) — el estado mecánico
   real, no el narrado.
4. Revisar `git log` desde el SHA del handoff.
5. **Confirmar el estado contigo antes de tocar código.**

**Regla dura:** no le pegues nada del historial viejo. Si tú le cuentas
algo del estado que no está en archivos, anótalo — eso es delta, no
ayuda. El paso 5 (confirmar antes de codear) es el que la mayoría
omite; aquí es obligatorio.

## Parte 3 — Test de retoma

Antes de dejarlo escribir una sola línea de código, exígele las tres
respuestas — solo desde archivos:

1. ¿En qué fase / task activa está el trabajo?
2. ¿Cuál es el siguiente paso concreto?
3. ¿Qué bloqueantes hay (si alguno)?

**Aprobado:** las 3 correctas contra lo que tú sabes (lo narrado por la
sesión vieja). **Fallido:** cualquiera incorrecta o vaga ("creo que
estábamos en..."). Si falla, no se lo corrijas de memoria: pídele que
vuelva a los archivos y anota **qué archivo no tenía la respuesta**.

## Parte 4 — RESULTADO.md: el delta

Compara lo narrado vs. lo reconstruido y documenta:

- **Qué faltó** en el handoff (la información que tuviste que
  suplir tú).
- **Qué sobró** (ruido que no sirvió para la retoma).
- **Qué confundió** (lo que el agente nuevo interpretó mal).
- **≥1 mejora concreta** a tu handoff o template — instalada, no
  propuesta.
- Qué parte del system of record cargó el peso (commit / handoff /
  progress / `state.json`).

## Criterio de terminación

- Los 7 pasos del checklist completos y verificables (SHA verde,
  `handoff.md` con las 5 partes, `git status` limpio).
- Test de retoma aprobado 3/3 en la sesión nueva, sin historial pegado.
- `RESULTADO.md` con el delta documentado y ≥1 mejora concreta al
  handoff.

## Rúbrica de dominio

Autoevalúate al terminar (regístralo en tu `RESULTADO.md`):

| Nivel | Criterios observables |
|-------|----------------------|
| **Mínimo** | Cierre de 7 pasos completo y verificable, sesión nueva arrancada con la secuencia §4.7.1, y test de retoma aprobado 3/3 solo desde archivos. |
| **Medio** | Todo el criterio: `RESULTADO.md` con el delta trabajado (qué faltó, qué sobró, qué confundió) y ≥1 mejora concreta **instalada** en tu handoff o template, no solo propuesta. |
| **Completo** | Criterio + segunda iteración: repetiste interrupción → cierre → retoma con la mejora instalada y el delta se redujo (evidencia comparada de ambas corridas), con la reflexión de qué parte del system of record cargó el peso de la reconstrucción. |

## Qué debes haber aprendido

- Que un handoff se valida restaurándolo, no escribiéndolo: el delta
  narrado vs. reconstruido es la única medida honesta.
- Que lo que no está en archivos no existe para la sesión nueva — el
  "recuerda que..." se evapora con el contexto.
- Que el paso 5 del §4.7.1 (confirmar antes de codear) te ahorra los
  primeros 5 minutos desperdiciados de toda sesión que arranca mal.
- Que cerrar a media marcha es barato cuando el cierre es disciplinado
  — y carísimo cuando no.

## Referencias

- `modules/04-handoffs.md` §4.3, §4.6, §4.7
- `templates/session-close-checklist.md`, `templates/handoff.md`,
  `templates/claude-progress.md`
- `templates/.planning/state.json` (si usas GSD)
- `labs/lab-02-spec-driven-feature/` (terreno conocido, si lo prefieres)