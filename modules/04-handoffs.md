# Módulo 4 — Flujo de Trabajo y Handoffs

> **Tesis:** una sesión no alcanza. Las tareas reales con agentes duran más
> que una ventana de contexto. Lo que separa un harness confiable de uno
> frágil es si el estado sobrevive al cierre de la sesión — y eso depende de
> dónde vivió el estado, no de qué tan buena fue tu última conversación.

---

## 4.0 Por qué este módulo existe

El M1 dijo que el agente es `modelo + harness`. El M2 te dio la metodología
(spec → plan → execute). El M3 te dio el workbench de archivos. Este módulo
cierra el círculo: **cómo haces que todo eso sobreviva a través del tiempo y
de los límites del contexto.**

El problema es concreto y mecánico, no filosófico. Una ventana de contexto
se llena. Un agente que trabajó 90 minutos tiene la mitad de sus tokens
ocupados por su propia trayectoria. Una sesión nueva arranca con cero
memoria de lo anterior. Si tu estado vivió en la conversación, se evapora en
cualquiera de esos tres puntos. Si vivió en archivos, se reconstruye.

> **La regla del M4:** si el estado vive en archivos, una sesión nueva puede
> continuar el trabajo. Si vive en la conversación, no. Todo lo demás de este
> módulo es táctica para cumplir esa regla.

---

## 4.1 Anatomía de una sesión

Una sesión con un agente no es una línea recta de "pido → recibo". Es una
curva con tres fases, y el costo no es lineal sino cuadrático respecto del
contexto acumulado.

### 4.1.1 Las tres fases de una sesión

| Fase | Característica | Riesgo |
|------|----------------|--------|
| **Arranque** (0–~20% del contexto) | El agente reconstruye estado, lee specs, arma plan. | Que reconstruya mal y arranque en dirección equivocada. |
| **Productiva** (~20–~60%) | El agente ejecuta, edita, corre tests. La trayectoria es útil. | Que el contexto se llene de detalles que ya no aportan. |
| **Degradada** (~60%+) | Cada turno procesa todo lo acumulado. La atención se diluye. | Context rot: el agente empieza a perder reglas y a repetirse. |

### 4.1.2 El costo cuadrático

Cada turno nuevo, el modelo relee todo el contexto acumulado. No es "sumar
un turno", es "reprocesar todo lo dicho hasta ahora". Por eso una sesión que
va por el turno 40 no es 2× más cara que una en el turno 20: es
proporcionalmente más cara y, peor, más propensa a error.

> **Implicación práctica:** una sesión no debe medirse en "cuánto logré",
> sino en "cuánto logré por unidad de contexto gastado". Llegar al borde del
> contexto con el trabajo a medio hacer es el peor resultado: pagaste el
> costo cuadrático y aun así no cerraste.

### 4.1.3 Context rot

Alrededor del ~70% del contexto, el agente empieza a perder detalles que
antes respetaba: salta reglas del `AGENTS.md`, repite pasos, olvida
no-objetivos de la spec. No es que "se olvide" mágicamente: es que la
atención se distribuye sobre más tokens y los detalles tempranos pesan menos.

> El context rot es la razón por la que "esperar al autocompact" es una
> mala estrategia. Para cuando el sistema compacta solo, ya estás en zona
> degradada desde hace rato.

---

## 4.2 Compaction: la cirugía del contexto

La compaction es el mecanismo por el cual el sistema resume el contexto para
librar espacio. Existe porque las ventanas son finitas; el riesgo es que es
una cirugía: corta algo, y no siempre lo que cortarías tú.

### 4.2.1 Tres umbrales que debes conocer

| Umbral | Qué pasa | Qué debes hacer |
|--------|----------|-----------------|
| **~60%** | Aún estás en zona productiva. La compaction sería opcional. | Compactar proactivamente acá si vas a seguir trabajando. Pierdes poco, ganas margen. |
| **~70%** | Inicia el context rot. El agente empieza a degradarse silenciosamente. | Ya deberías haber compactado o cerrado sesión. |
| **~83.5%** | El sistema compacta automáticamente (autocompact). | Demasiado tarde: ya trabajaste en zona degradada. |

### 4.2.2 Proactivo vs. reactivo

- **Proactivo:** tú disparas `/compact` (o su equivalente) cerca del 60%,
  en un punto que tú eliges — idealmente al terminar una subtarea coherente.
- **Reactivo (autocompact):** el sistema decide, tarde, qué resumir.

> La diferencia no es "si se compacta" sino "quién decide qué se pierde".
> Cuando tú decides, puedes guiar el resumen ("mantén la spec y el plan,
> descarta los intentos fallidos del intento 3"). Cuando el sistema
> decide, pierdes el control sobre qué sobrevive.

### 4.2.3 Qué sobrevive a una compaction

Esto es crítico y a menudo malentendido:

- **Sobrevive lo que está en archivos.** La spec, el plan, el `AGENTS.md`,
  el `.planning/state.json`. El agente los relee después de compactar.
- **Sobrevive lo que está en el resumen** que el sistema genera.
- **No sobrevive** la trayectoria de intentos fallidos, las
  justificaciones conversacionales, las correcciones de medio camino.

> Por eso el M1 insistía en system of record: lo que vive en archivos es
> inmune a la compaction. Lo que vive solo en la conversación es frágil.

### 4.2.4 Cuándo compactar vs. cuándo cerrar sesión

| Situación | Compactar | Cerrar sesión + handoff |
|-----------|-----------|-------------------------|
| Vas a seguir tú mismo, en la misma tool. | ✅ | Innecesario |
| Vas a cambiar de tool (Claude → Cursor). | ❌ No te ayuda | ✅ El handoff es lo portátil |
| El agente está degradado y los errores se acumulan. | ⚠️ Sigue con contexto viciado | ✅ Arranca limpio |
| Terminaste una subtarea coherente y hay más por hacer. | ✅ | Cualquiera sirve |
| Terminaste la sesión por hoy. | — | ✅ Deja handoff |

> La tentación es "compactar y seguir" cuando lo correcto es "cerrar y
> arrancar limpio con handoff". Compactar conserva el contexto viciado;
> cerrar lo descarta pero te obliga a tener el estado en archivos.

---

## 4.3 Handoffs: la transferencia entre sesiones

El handoff es el artefacto que permite que una sesión nueva continue el
trabajo de una anterior sin haberla vivido. Es la materialización del
principio "el estado vive en archivos".

### 4.3.1 Cuándo cerrar una sesión con handoff

- Cuando el contexto se acerca al 60–70% y el trabajo no terminó.
- Cuando vas a cambiar de tool o de máquina.
- Cuando el agente empezó a degradarse (errores que antes no cometía).
- Al final del día, aunque parezca que "ya casi termino". El "casi" es la
  trampa: mañana no recordarás el "casi".

### 4.3.2 El artefacto de handoff: qué debe contener

Un handoff que sirve tiene cinco partes. Omitir cualquiera te hace perder
el 80% del valor:

1. **La spec activa** (o su referencia). Qué se está construyendo y por
   qué. Si la spec está en `docs/specs/`, basta la ruta.
2. **El progreso real, no el narrado.** Qué tareas están DONE/VERIFIED,
   cuáles en progreso, cuáles sin tocar. Si usas GSD, esto vive en
   `.planning/state.json` y `.planning/tasks/`.
3. **Los bloqueantes.** Lo que el agente no pudo resolver: un test rojo
   que no se entiende, una API que no responde, una decisión pendiente.
   **Esto es lo más valioso del handoff** y lo que más se omite.
4. **Las decisiones tomadas.** Por qué se eligió el camino A y no el B.
   Sin esto, la sesión nueva puede desandar lo hecho.
5. **El SHA del último commit.** El punto reproducible al que volver. Si
   algo se rompe, `git reset` a ese SHA te devuelve a un estado conocido.

> **Anti-patrón #1:** el handoff que narra lo que se hizo pero no lo que
> *falta*. La sesión nueva necesita saber dónde retomar, no lo que ya
> terminó. Lo terminado está en git.
>
> **Anti-patrón #2:** el handoff que omite los bloqueantes "para no
> asustar". Los bloqueantes son exactamente lo que la sesión nueva va a
> chocar primero; documentarlos le ahorra redescubrirlos.

### 4.3.3 Primary source vs. secondary source

Una distinción que aclara qué lee quién:

- **Primary source (lo que lee el agente):** archivos en el repo. La spec,
  el plan, `state.json`, el `AGENTS.md`. Es la fuente de verdad mecánica.
- **Secondary source (lo que lee el humano):** el handoff narrado, los
  comentarios del PR, los ADRs. Es la fuente de verdad humana.

> El error común es escribir el handoff como si fuera el primary source.
> No lo es: el primary source son los archivos. El handoff es un *índice*
> hacia esos archivos más un resumen de estado. Si el handoff contradice
> a `state.json`, el agente debe creerle a `state.json` (y el handoff
> debe marcarse como desactualizado).

### 4.3.4 Plantilla de handoff

Ver `templates/handoff.md`. Es corta a propósito: si tu handoff es más
largo que la spec, algo anda mal — la spec debería estar haciendo el
trabajo pesado.

---

## 4.4 Two-Agent Architecture: especializar para no saturar

Anthropic describe un patrón que escala más allá de una sola sesión larga:
dividir el trabajo en dos agentes con roles distintos y contextos distintos.

### 4.4.1 Los dos roles

| Rol | Contexto | Tarea | Qué pasa al terminar |
|-----|----------|-------|----------------------|
| **Initializer Agent** | Ancho, efímero. | Lee la spec, analiza el codebase, genera una `feature_list.json`, crea tests esqueleto, escribe un startup script. | **Se descarta su contexto.** Su producto son archivos, no conversación. |
| **Coding Agent** | Angosto pero profundo. | Toma la salida del initializer y construye incrementalmente, una feature a la vez. | Conserva contexto mientras la sesión sea productiva; cierra con commit + handoff. |

### 4.4.2 Por qué funciona

El initializer hace el trabajo de "entender todo", que es lo que más
contexto consume — y lo descarta en cuanto lo convierte en archivos. El
coding agent nunca tiene que "entender todo"; arranca con el entendimiento
ya cristalizado en `feature_list.json` y los tests esqueleto.

> Es la misma idea del M3 (subagentes para investigación): mover el
> contexto caro y descartable a un proceso que muere, y dejar el contexto
> útil y persistente en archivos. Aquí se aplica a la *inicialización
> completa de una feature*, no a una subtarea.

### 4.4.3 Cuándo aplica y cuándo es overkill

- **Aplica:** features medianas-grandes con un codebase que el agente no
  conoce de memoria. El initializer paga el costo de mapeo una vez.
- **Overkill:** un cambio chico en código que ya conoces. El initializer
  sería overhead; un solo agente en una sesión corta alcanza.

> La pregunta clave: ¿el agente que va a codear necesita "entender mucho
> antes de tocar nada"? Si sí, un initializer que deje ese entendimiento
  en archivos vale la pena. Si no, no.

### 4.4.4 El `feature_list.json`

Es el puente entre los dos agentes. Estructura típica:

```json
{
  "spec_ref": "docs/specs/project-status-date-filter.md",
  "features": [
    { "id": "F1", "desc": "...", "test": "tests/f1.test.ts", "done": false },
    { "id": "F2", "desc": "...", "test": "tests/f2.test.ts", "done": false }
  ],
  "startup_script": "scripts/start-feature.sh"
}
```

El coding agent trabaja feature por feature, marca `done: true` al
verificar, y avanza. No necesita releer la spec cada vez: la lista ya es la
traducción operativa de la spec.

> Plantilla de partida: `templates/feature_list.json`. Incluye, además de
> las features, los `blockers` y las `decisions` — porque el puente entre
> los dos agentes también debe transferir lo que el initializer no pudo
> resolver y lo que decidió, no solo la lista de tareas.

---

## 4.5 Human-in-the-loop vs. AFK

No todo trabajo con agentes es igual. Dos modos extremos y un espectro entre
ellos.

### 4.5.1 Los dos modos

| Modo | Qué haces tú | Cuándo sirve | Riesgo |
|------|--------------|--------------|--------|
| **Human-in-the-loop (HITL)** | Revisas cada paso, confirmas decisiones, corriges el rumbo. | Specs ambiguas, dominio nuevo, decisiones irreversibles. | Lento; te vuelves el cuello de botella. |
| **AFK (away from keyboard)** | Das la instrucción y te vas. El agente trabaja solo, idealmente con verificación mecánica. | Tareas bien especificadas, dominio conocido, reversibles. | Drift silencioso si no hay sensores. |

### 4.5.2 Cómo decidir

La decisión no es "qué modo prefiero", es "qué tanto riesgo tiene esta
tarea y qué tan bien especificada está":

- **Spec clara + reversible + sensores fuertes** → AFK es seguro.
- **Spec clara + irreversible** → HITL en el punto de no retorno (antes
  de migrar, antes de pushear, antes de borrar).
- **Spec ambigua + reversible** → HITL en los puntos de decisión, AFK en
  la ejecución mecánica entre decisiones.
- **Spec ambigua + irreversible** → HITL todo el tiempo, o mejor: no
  delegues todavía, aclara la spec primero (vuelve al M2).

### 4.5.3 El espectro real

Nadie trabaja 100% AFK o 100% HITL. El patrón sano es **AFK por tramos con
puntos de control HITL**:

1. Especificas (HITL — tú escribes la spec).
2. El agente planea (HITL — tú apruebas el plan).
3. El agente ejecuta una feature (AFK — te vas).
4. El agente verifica y reporta (HITL — tú lees el DONE/VERIFIED).
5. Repites 3–4 hasta cerrar.

> El error clásico es "AFK total sin puntos de control": el agente
> trabaja 40 minutos, se desvía en el minuto 5, y vuelves a un diff que no
> es lo que pediste. Los puntos de control son baratos; el rework no.

---

## 4.6 Commit discipline: cada sesión termina en verde

> **Regla firme:** una sesión de trabajo con un agente termina en un commit
> con tests passing. No "cuando termine"; al cerrar la sesión.

### 4.6.1 Por qué

- Un commit verde es un punto reproducible. Si la siguiente sesión rompe
  algo, sabes que el problema es nuevo, no acumulado.
- Un commit verde es la base del handoff: el SHA que dejas en el handoff
  debe apuntar a verde, no a "creo que funciona".
- Un commit verde te obliga a verificar antes de declarar terminado. Es
  la métrica de "de verdad cerré".

### 4.6.2 Granularidad

- **No** un mega-commit al final de la sesión con 8 features.
- **No** un commit por cada línea editada (ruido).
- **Sí** un commit por unidad coherente: una feature de la `feature_list`,
  o un grupo de tests que pertenecen juntos.

> Si el agente te dice "hice todo, commiteo", detente. Pregúnta: "¿qué
> unidades coherentes hay en ese 'todo'?" y commitea cada una por separado,
> cada una con tests verdes antes de la siguiente.

### 4.6.3 Qué va en el mensaje de commit

- Qué hizo (no "cambios en X", sino "Agrega filtro por fecha al status
  report").
- Qué verificó (qué tests pasan).
- Qué NO hizo (si la feature quedó a medias: "F1 completa; F2 pendiente,
  ver handoff").

> El mensaje de commit es parte del system of record. Un agente que
> reconstruye estado a partir de `git log` depende de que tus commits
> digan algo útil.

---

## 4.7 Recuperación de estado: cómo arranca una sesión nueva

Cuando abres una sesión nueva para continuar trabajo, el agente arranca con
cero memoria. La secuencia de recuperación es la que separa un harness
maduro de uno que improvisa.

### 4.7.1 La secuencia de arranque (lo que el agente debe hacer)

1. **Leer el `AGENTS.md`** (o `CLAUDE.md`) — el contrato estable.
2. **Leer el handoff** más reciente, si existe — el índice de estado.
3. **Leer `.planning/state.json`** (o el equivalente) — el estado mecánico
   real, no el narrado.
4. **Revisar `git log`** desde el SHA del handoff — qué cambió desde la
   última sesión.
5. **Confirmar el estado** contigo antes de tocar código: "Según el
   handoff y state.json, falta F2 y hay un bloqueante en X. ¿Avanzo así?"

> El paso 5 es el que la mayoría omite. Sin él, el agente arranca a
> codear sobre un entendimiento que puede estar desactualizado, y los
> primeros 5 minutos de trabajo son los que más se desperdician al
> corregir rumbo.

### 4.7.2 `claude-progress.md`

Un artefacto específico para sesiones largas: un archivo en el repo (o en
el directorio de trabajo) donde el agente va escribiendo, a medida que
avanza, lo que hizo y lo que falta. Es más detallado que el handoff (que
se escribe una vez al cerrar) y más vivo que `state.json` (que es estado
mecánico).

- El agente lo actualiza cada N tareas o antes de una pausa.
- La sesión nueva lo lee como parte del arranque.
- Al cerrar la sesión, su contenido se condensa en el handoff final.

> Ver `templates/claude-progress.md`. Si usas GSD, `.planning/state.json`
> cubre gran parte de esta función; `claude-progress.md` agrega la capa
> narrativa de "qué descubrimos, qué decidimos".

### 4.7.3 Qué hacer cuando NO hay handoff

A veces heredas un repo sin handoff (un compañero se fue, o tú mismo hace
dos semanas). La recuperación es distinta pero posible:

1. `git log` de los últimos commits para entender rumbo reciente.
2. `docs/specs/` para entender qué se estaba construyendo.
3. `.planning/` si existe, para estado mecánico.
4. Tests: correrlos y ver qué está rojo. Lo rojo es pista de trabajo en
   progreso.

> La ausencia de handoff es recuperable si el system of record es bueno.
> No es recuperable si el estado vivió en conversaciones que ya no están.
> Esta es la prueba final de si tu harness tiene system of record o no.

---

## 4.8 Subagentes como herramienta de paralelismo

El M3 introdujo los subagentes para *aislamiento de contexto*. Aquí los
retomamos como herramienta de *paralelismo* en flujos más largos.

### 4.8.1 Tres patrones de uso

| Patrón | Qué hace | Cuándo |
|--------|----------|--------|
| **Fan-out de investigación** | Varios subagentes exploran partes distintas del codebase en paralelo; el principal sintetiza. | "Qué cambió entre estas 5 features en el último año." |
| **Adversarial review** | Un subagent implementó; otro, con contexto fresco y sin compromiso previo, refuta. | Verificar que el diff realmente cumple la spec. |
| **Verificación especializada** | Subagentes por dimensión (seguridad, perf, types) en lugar de un revisor generalista. | Review de un PR grande con varias preocupaciones. |

### 4.8.2 Por qué el contexto fresco importa para verificación

El agente que implementó tiene *compromiso previo* con su solución: la
escribió, la justificó, la defendió. Al revisarla, tiende a confirmar lo
que ya hizo. Un subagent con contexto fresco, que solo ve el diff y la
spec, no tiene ese sesgo.

> Esta es la versión operativa de "no dejes que el mismo agente que
> escribió verifique lo que escribió". No es desconfianza; es arquitectura
> del contexto.

### 4.8.3 Advertencia: paralelismo no es gratuidad

Cada subagent consume tokens y tiempo. El fan-out a 10 subagentes cuando 2
alcanzaban es un antipatrón. La regla: paraleliza cuando las tareas son
genuinamente independientes y el costo de cada una justifica el overhead
de lanzarla.

---

## 4.9 El flujo completo: Initializer → Coding → Commit → Handoff

```
┌──────────────┐   spec    ┌───────────────┐  feature_list.json
│  Inicializar │ ────────> │ Initializer   │ ──────────────────┐
│  (tú)        │           │ Agent (ancho,  │                   │
└──────────────┘           │  efímero)     │                   ▼
                           └───────────────┘        ┌────────────────────┐
                                   │ tests esqueleto │ Coding Agent       │
                                   └────────────────>│ (angosto, profundo)│
                                                      │                    │
                                                      │  feature por feature│
                                                      │  cada una: test →   │
                                                      │  code → verde →     │
                                                      │  commit             │
                                                      └─────────┬──────────┘
                                                                │
                                          ¿contexto ~60% o fin?  │
                                                                ▼
                                                      ┌────────────────────┐
                                                      │ Commit verde       │
                                                      │ + handoff.md       │
                                                      └────────────────────┘
                                                                │
                                                                ▼
                                                      ┌────────────────────┐
                                                      │ Sesión nueva       │
                                                      │ lee handoff +      │
                                                      │ state.json + git   │
                                                      │ y continúa         │
                                                      └────────────────────┘
```

---

## 4.10 Niveles de adopción

### Mínimo (arranca hoy)

- Cada sesión termina en commit verde.
- Al cerrar, dejas un `handoff.md` con las 5 partes (spec ref, progreso,
  bloqueantes, decisiones, SHA).
- Al abrir una sesión nueva, pides al agente que lea el handoff y
  `state.json`/`.planning/` antes de tocar código.

### Medio

- Compaction proactiva al 60% en lugar de esperar al autocompact.
- `claude-progress.md` vivo durante la sesión, condensado en handoff al
  cerrar.
- Two-agent split para features medianas-grandes.
- Puntos de control HITL dentro de flujos AFK.

### Completo

- Subagentes para adversarial review y verificación especializada.
- Recuperación de estado probada: ejercitas el "abrir sesión nueva y
  continuar" como drill, no solo cuando pasa.
- Umbrales de compaction monitoreados como métrica, no como sensación.

---

## 4.11 FAQ — trampas reales

**¿Compaction proactiva o cerrar sesión?** Si vas a seguir tú mismo en la
misma tool y el contexto está sano pero lleno, compacta al 60% en un punto
coherente. Si el contexto está viciado (errores que se acumulan), cerrar y
arrancar con handoff es mejor: descarta lo viciado.

**Mi handoff es más largo que la spec.** Mal signal. La spec debe hacer el
trabajo pesado; el handoff es índice + estado. Si tu handoff explica qué
construir, la spec está incompleta. Completa la spec, achica el handoff.

**¿Le creo al handoff o a `state.json`?** A `state.json` (lo mecánico). El
handoff es un índice hacia él más el estado narrado. Si contradicen,
gana el archivo; el handoff se marca desactualizado.

**El agente al arrancar no leyó el handoff.** Pídeselo explícitamente:
"Lee `handoff.md`, `.planning/state.json` y los commits desde el SHA
mencionado; confírmame el estado antes de codear." No asumas que lo hará
solo.

**AFK suena peligroso.** Lo es sin sensores. AFK requiere que la
verificación sea mecánica (tests, typecheck), no "el agente dice que
terminó". Si tu verificación es solo el reporte del agente, estás en HITL
aunque creas estar en AFK.

**¿Cada cuánto dejo `claude-progress.md`?** Cada subtarea coherente o
antes de una pausa. No cada línea. La granularidad de "lo que
racionalmente querrías retomar" es la correcta.

---

## 4.12 Referencias

- **Learn Harness Engineering — WalkingLabs**
  (https://walkinglabs.github.io/learn-harness-engineering/en/) — módulos
  4, 5, 6, 10, 12 sobre sesiones, inicialización, overreaching y estado
  limpio.
- **Anthropic — Effective Harnesses for Long-Running Agents**
  (https://www.anthropic.com/engineering/effective-harnesses-long-running-agents) —
  two-agent split, feature list JSON.
- **Claude Code Docs — Best Practices**
  (https://code.claude.com/docs/en/best-practices) — `/clear`,
  `/compact`, plan mode, explore → plan → implement → commit.
- **orchestrator.dev — Agent Memory 2026**
  (https://orchestrator.dev/blog/2026-04-06--claude-code-agent-memory-2026/) —
  context compaction thresholds, context rot.

**Plantillas vinculadas:** `templates/handoff.md`,
`templates/claude-progress.md`, checklist "Cierre de sesión".