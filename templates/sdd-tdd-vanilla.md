<!--
  templates/sdd-tdd-vanilla.md
  ----------------------------
  El flujo SDD + TDD SIN framework: la disciplina vive en tu AGENTS.md y en
  los prompts de arranque, no en herramientas instaladas. Es el puente entre
  el Nivel 1 (solo SDD) y el Nivel 2 (+GSD) del Módulo 2 §2.8.

  La versión "instalada" de este flujo es Gentle-AI (Gentleman Programming),
  cuyo Strict TDD Mode automatiza exactamente este ciclo — ver §Escalado.
-->

# SDD + TDD vanilla — el flujo sin framework

> **Objetivo:** el pipeline SDD + TDD sin instalar GSD, Superpowers ni
> Gentle-AI. La disciplina vive en **tres piezas que copias a mano**: las
> reglas en tu `AGENTS.md`, el prompt de arranque (que le pide al modelo
> *configurar* la metodología y confirmarla) y el prompt por tarea
> (RED → GREEN → REFACTOR + DONE/VERIFIED). Cero dependencias.

## Cuándo vanilla y cuándo framework

| Criterio | Vanilla (esta plantilla) | Framework (GSD / Superpowers / Gentle-AI) |
|---|---|---|
| Alcance de la tarea | Una sesión o menos | Cruza sesiones / largo horizonte |
| Setup | ~2 min copiando reglas | Instalador + configuración |
| Memoria entre sesiones | Los archivos que tú defines (spec + handoff) | Estado machine-readable (`.planning/`) o memoria persistente (Engram) |
| Disciplina | Advisory: reglas en contexto + prompts | Mecánica: gates, hooks, verificación bloqueante |
| Aprendizaje | Entiendes la disciplina por dentro | La disciplina viene empaquetada |
| Riesgo | El agente puede saltarse un paso si no lo vigilas | El framework bloquea los saltos |

**Regla de decisión:** si la tarea cabe en una sesión y quieres *entender* la
disciplina (o no quieres instalar nada en el repo del cliente), vanilla. Si el
context rot te muerde dos veces en la misma semana, escala a GSD (M2 §2.8
Nivel 2). Si la calidad es irregular, a Superpowers o Gentle-AI (Nivel 3).

---

## Bloque A — Reglas para tu `AGENTS.md` (copiar y pegar)

```markdown
## Disciplina de desarrollo (SDD + TDD)

- Todo feature sustancial parte de una `spec.md` con ACs verificables y
  no-objetivos. Sin spec aprobada por el humano, no escribes código de
  producción: pide la spec.
- Cada `[NEEDS CLARIFICATION]` de la spec BLOQUEA: no inventes; pregunta.
- Descompón en tareas atómicas (~5-15 min cada una). Una tarea = un ciclo
  TDD completo.
- ORDEN OBLIGATORIO por tarea:
  1. RED — escribe el test que describe el comportamiento. Muestra la
     salida del comando de tests FALLANDO antes de escribir código.
  2. GREEN — escribe el código MÍNIMO que hace pasar el test. Sin
     optimizar, sin funcionalidad extra. Muestra los tests pasando.
  3. REFACTOR — mejora sin cambiar comportamiento; los tests siguen
     pasando. Si alguno falla, revierte el refactor.
- No avances a la siguiente tarea con tests en rojo.
- Un test que pasa sin aserciones es un test roto: cuenta como fallo.
- Al cerrar cada tarea: reporte DONE/VERIFIED (qué verificaste, qué NO,
  supuestos hechos, qué debe revisar el humano primero).
- Comandos de verificación: <TEST_COMMAND> y <BUILD_COMMAND>.
```

> Reemplaza `<TEST_COMMAND>` / `<BUILD_COMMAND>` (`npx vitest run`,
> `pytest`, `go test ./...`…). Sin comando de tests, el TDD vanilla no puede
> funcionar: es la primera cosa que configura.

## Bloque B — Prompt de arranque (el agente configura la metodología)

```text
Vamos a trabajar en este repo con la disciplina SDD + TDD (sin frameworks
instalados). Antes de escribir cualquier código:

1. Lee AGENTS.md, sección "Disciplina de desarrollo (SDD + TDD)".
2. Confírmame en 3 líneas: qué vas a exigir antes de escribir código de
   producción, qué cuenta como "tarea terminada" y qué hace que se
   detenga y pregunte en lugar de inventar.
3. A partir de ahora, cada vez que te dé una spec: descomponla en tareas
   atómicas, muéstrame la lista y espera mi aprobación del orden.

No escribas código todavía. Confirma con "SDD+TDD activa" y lista qué
te falta de mi entorno (comandos de test, rutas de specs).
```

> Por qué funciona: no le pides al modelo "sé disciplinado" (advisory
> débil). Le pides que *reafirme las reglas con sus palabras* — eso activa
> el contexto en su sesión — y que las ancle a comandos verificables. El
> enforcement real sigue siendo tuyo: si no muestra la salida fallando, no
> hay GREEN.

## Bloque C — Prompt por tarea (el ciclo)

```text
Implementa la tarea <ID> de spec.md. Ciclo obligatorio:

1. RED — escribe el test del comportamiento deseado (casos normales,
   borde y de error). Muéstrame la salida del comando de tests FALLANDO.
   Si no falla, el test está mal: repítelo.
2. GREEN — escribe el código mínimo para que pase. Muéstrame la salida
   con TODOS los tests (nuevos y existentes) en verde.
3. REFACTOR — mejora sin cambiar comportamiento; los tests siguen pasando.
   Muéstrame la salida.
4. Cierra con el reporte DONE/VERIFIED de la tarea.

Prohibido: escribir código antes del RED, avanzar con rojo, mezclar el
refactor con nueva funcionalidad, o marcar DONE sin evidencia.
```

## Bloque D — Prompt de cierre (evidencia, no narrativa)

```text
Antes de declarar la tarea terminada:

| # | AC de la spec | Evidencia (comando + salida) | Resultado |
|---|---------------|------------------------------|-----------|

Además lista: (a) qué NO verificaste, (b) supuestos que hiciste,
(c) qué debería revisar un humano primero. Sin esta tabla, no está DONE.
```

(Este es el mismo esquema de `templates/DONE_VERIFIED.md` del Módulo 6 — el
reporte de evidencia no cambia con el nivel de adopción.)

---

## Cómo escala (cuando el dolor aparece)

| Dolor que apareció | Escala a |
|---|---|
| "La conversación se satura y pierde el hilo entre sesiones" | **GSD** (Nivel 2): `.planning/` como estado en archivos |
| "El código sale con calidad irregular, a veces salta el RED" | **Superpowers** (Nivel 3) o **Gentle-AI**: la disciplina pasa de prompt a skill obligatoria |
| "Quiero esto instalado sin armarlo a mano, con verificación bloqueante" | **Gentle-AI** — `gentle-ai install` (MIT, 16 agentes): su `/sdd-init` detecta el framework de testing (vitest/jest, pytest, go test, cargo test…) y ofrece activar **Strict TDD Mode**; el subagente de apply recibe `strict-tdd.md` como instrucciones obligatorias y `sdd-verify` **bloquea el archive** si un requisito quedó sin test |

> Nota: la lista de negación de permisos de Gentle-AI (`.env*`, `*.pem`,
> `secrets/*`, llaveros…) aplica también la capa de seguridad del Módulo 10.

## Referencias

- `modules/02-spec-plan-execute.md` §2.8 — dónde entra este flujo en los niveles de adopción.
- `templates/DONE_VERIFIED.md`, `templates/es-verificable-checklist.md` — el cierre con evidencia.
- [Gentle-AI — repo](https://github.com/Gentleman-Programming/gentle-ai) · [documentación en español](https://gentle-ai-wiki.gentlemanprogramming.com/es/) · [Strict TDD Mode](https://gentle-ai-wiki.gentlemanprogramming.com/es/) (la versión instalada de este flujo, con detección de capacidades y verificación bloqueante).