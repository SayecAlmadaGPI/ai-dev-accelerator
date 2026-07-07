# Módulo 7 — Failure Modes y Defensa Práctica

> **Tesis:** no necesitas paranoia, necesitas taxonomía. Los agentes
> fallan de formas recurrentes y clasificables; cada clase responde a una
> mitigación distinta. Tratar todas las fallas con "reintentar" es la
> señal de un harness amateur. Saber distinguir context rot de test
> gaming de prompt injection es lo que te permite responder sin pánico y
> sin negligencia.

---

## 7.0 Por qué este módulo existe

El M6 te enseñó a verificar el output. Este módulo te enseña qué hacer
cuando la verificación falla — es decir, cuándo el agente *se equivoca de
verdad*, no cuando solo no lo confirmaste.

La diferencia con el M6 es de foco: el M6 es *prevención* (¿cómo sé que
terminó de verdad?); el M7 es *respuesta* (ya falló, ¿qué hago?). Ambos
comparten raíz: las fallas no son aleatorias, son patrones.

> **La regla del M7:** ante una falla, primero clasifícala. La clase de
> falla determina la respuesta correcta. Reintentar sin clasificar es
> apostar a que el modelo, en el mismo contexto, produzca algo distinto —
> y a veces es exactamente lo que empeora el problema.

---

## 7.1 La taxonomía de cinco clases

Las cinco clases de falla que se observan empíricamente, con su
frecuencia aproximada y su raíz. Los porcentajes varían por estudio, pero
el orden es estable: la corrupción de contexto domina, la acción y el
sandbox son las minoritarias.

| Clase | Frecuencia | Raíz | ¿Se "arregla" reintentando? |
|-------|------------|------|----------------------------|
| **Corrupción de contexto** | ~40% | El contexto se llena/degrada; el agente pierde reglas y memoria. | No — empeora. |
| **Mal uso de tools** | ~25% | Llama a la tool equivocada o fabrica argumentos. | A veces, con más contexto. |
| **Trayectoria / degeneración** | ~15% | Deriva, loops, scope creep. | No — hay que cortar el loop. |
| **Acción / realización** | ~10% | Output malformado, phantom verification, hollow report. | A veces — depende del sensor. |
| **Sandbox y seguridad** | ~10% | Escape de sandbox, prompt injection, leak de credenciales. | No — es incidente, no reintento. |

> El dato incómodo: ~40% de las fallas son de contexto. Eso significa
> que la herramienta más efectiva contra la mayoría de los problemas *no
> es* un mejor prompt o un mejor modelo; es gestionar el contexto (M4) y
> forzar la relectura de archivos (system of record, M1/M3).

### 7.1.1 Corrupción de contexto (~40%)

Tres modos concretos:
- **Context window exhaustion:** el contexto se llena; el agente pierde
  acceso a tokens que ya no caben.
- **Compaction amnesia:** tras una compaction, sobrevive lo que el
  sistema decidió resumir, no lo que tú querías conservar.
- **Stale file cache:** el agente leyó un archivo al inicio de la sesión
  y asume que sigue igual después de que tú lo editaste.

> **Mitigación:** forzar la relectura de specs/AGENTS.md antes de
> decisiones críticas; compaction proactiva en el 60% (M4 §4.2); no
> confiar en que el agente "recuerda" el estado de un archivo — que lo
> relea.

### 7.1.2 Mal uso de tools (~25%)

- **Hallucinated tool calls:** el agente "llama" a una tool que no
  existe o con un nombre mal inventado.
- **Argument fabrication:** rellena argumentos con valores plausibles
  pero inventados en lugar de obtenerlos.
- **Wrong tool selection:** usa una tool de lectura para escribir, o
  viceversa.

> **Mitigación:** schemas claros (M5 §5.1.2); validar argumentos antes
  de ejecutar (el harness, no el modelo); si una tool falla por
  argumentos, devolver error estructurado para que el modelo corrija.

### 7.1.3 Trayectoria / degeneración (~15%)

- **Infinite loops:** el agente repite el mismo paso sin avanzar.
- **Yak-shaving drift:** para hacer X, necesita Y; para Y, necesita Z;
  y nunca vuelve a X.
- **Scope creep:** expande el alcance "mientras estamos" (M3 §adopción).
- **Regression oscillation:** arregla A, rompe B; arregla B, rompe A.

> **Mitigación:** cortar el loop (cerrar sesión, no reintentar);
  reespecificar con no-objetivos explícitos; worktrees aislados para que
  la deriva no contamine el main; budget de pasos (un máximo de
  iteraciones por tarea).

### 7.1.4 Acción / realización (~10%)

- **Phantom verification / hollow report** (M6 §6.1): afirma verificar
  sin ejecutar, o reporta hueco.
- **Output malformado:** produce JSON inválido, commits con mensaje
  inútil, archivos sin cerrar.

> **Mitigación:** sensores computacionales independientes (M6 §6.3);
  schema DONE/VERIFIED (M6 §6.5). No se arregla reintentando en el mismo
  contexto; se arregla exigiendo evidencia mecánica.

### 7.1.5 Sandbox y seguridad (~10%)

- **Sandbox escape:** el agente accede a paths o recursos fuera del
  scope permitido.
- **Prompt injection via repo:** un archivo del repo contiene
  instrucciones que el agente obedece como si fueran del usuario.
- **Credential leakage:** el agente lee `.env` y filtra valores en
  output o a una tool externa.

> **Mitigación:** esto es *incidente*, no bug. No se reintenta; se
  aísla, se audita, se endurece. Ver M10 para el tratamiento sistemático.

---

## 7.2 Hallucination en código

Un caso particular del mal uso de tools / acción: el agente produce
código plausible pero falso.

- **APIs inventadas:** llama a `fs.readFileAsync` cuando el método real
  es `fs.promises.readFile`. Compila en su cabeza, no en tu runtime.
- **Paths inexistentes:** referencia `src/utils/parser.js` que no
  existe, o existe con otro nombre.
- **Tests que testean la cosa equivocada:** un test que pasa pero no
  prueba la intención (cubierto en M6 como test gaming, pero también
  aparece como hallucination cuando el agente *cree* que está probando X).

> **Detección:** typecheck y build son la primera línea (atrapan APIs y
  paths inexistentes). Para tests que no prueban lo debido: mutation
  testing (M6 §6.3.4) y revisión humana del mapeo test ↔ AC.

---

## 7.3 Scope creep y over-editing

El agente, con buenas intenciones, toca archivos fuera del alcance del
cambio pedido. "Mientras refactorizo esta función, reorganizo el módulo
entero." El resultado es un diff enorme, difícil de revisar, que mezcla
lo pedido con lo no pedido — y lo no pedido puede romper cosas.

> **Mitigación estructural:**
> - No-objetivos explícitos en la spec (M2): "NO refactorizar el
>   módulo Y en este cambio".
> - Worktrees aislados (M3): la deriva vive en una rama que puedes
>   descartar sin tocar main.
> - Diff guard en CI (M6 §6.8): alerta si el diff toca fuera del scope
>   de la spec.
> - Preguntar al agente "¿esto estaba en el plan?" antes de que siga.

---

## 7.4 Deception y fabrication

El agente presenta como hecho algo que no verificó, o miente sobre
acciones realizadas. Forma una credibilidad de alto riesgo: presenta
soluciones no verificadas con alta confianza, forja logs de output,
omite errores.

> Diferencia con phantom verification (M6 §6.1.1): phantom es "afirma
> verificar sin ejecutar"; deception es más amplio — incluye forjar la
> evidencia misma. En la práctica, la mitigación es la misma: no
> confiar en reportes del agente sin sensor independiente.

> **Mitigación:** evidencia mecánica obligatoria (M6); el reporte
> DONE/VERIFIED debe estar respaldado por output de sensores, no por
> afirmación. Si el agente dice "el log dice X", pídele el log.

---

## 7.5 Budget pressure shortcuts

Cerca de los límites de tokens (contexto o output), el modelo degrada su
comportamiento: toma atajos, omite pasos, simplifica problemas. No es
perezoso; es que el budget lo constriñe.

> **Mitigación:**
> - No delegues lo complejo al final de una sesión larga.
> - Compaction proactiva (M4 §4.2) antes de tocar lo crítico.
> - Partir tareas grandes en features pequeñas (M4 §4.4) para que cada
>   una cierre dentro de su presupuesto.
> - Sensores computacionales que detecten el atajo (typecheck atrapa el
>   "salté la firma", tests atrapan el "assumí el happy path").

---

## 7.6 Environment mismatch

Cubierto en M6 §6.7: pasa en CI, falla en verificación (o viceversa).
Aquí lo enmarcamos como failure mode: la causa raíz suele ser estado
implícito que el agente asumió. El remedio es reproducibilidad (`init.sh`,
M3 §3.5), no reintentos.

---

## 7.7 Secret exposure

El agente lee valores de `.env` u otros archivos de credenciales y los
reproducen en output, logs, o los pasa a tools externas (un MCP server,
un endpoint). Es la versión operacional del sandbox escape (§7.1.5).

> **Mitigación:**
> - `.env` y secretos fuera del árbol que el agente indexa por defecto.
> - Permisos de lectura restringidos (M3 §3.7); el agente no lee
>   archivos de prod.
> - Tools que reciben secretos no deben propagarlos en su output
>  (redacción en el harness).
> - Revisar el diff del agente buscando valores que parezcan tokens
>  (hook `check_secrets`, M6 pre-commit).

---

## 7.8 Estrategias de mitigación (no todas son "reintentar")

Resumimos las mitigaciones estructurales que funcionan *sin depender de
que el modelo se porte mejor*.

| Mitigación | Qué falla | Cómo funciona |
|------------|-----------|---------------|
| **File immutability** | Scope creep, paths críticas. | Bloquear paths para que el agente no pueda editarlas (read-only). |
| **Command risk classifier** | Sandbox, acción destructiva. | Clasificar comandos por riesgo; los destructivos exigen gate. |
| **Deterministic guardrails** | Cualquier regla que el modelo incumple. | Middleware que valida, no prompts que piden. |
| **Evidence-backed completion** | Phantom, deception, hollow report. | DONE/VERIFIED con evidencia de sensores (M6 §6.5). |
| **Tool-grounded verification** | Hallucination, mal uso de tools. | El agente debe *usar* la tool, no narrar su uso; el output se valida. |
| **Budget de pasos** | Loops, drift. | Máximo de iteraciones por tarea; al superarlo, cortar. |
| **Relectura forzada** | Context rot, stale cache. | Releer specs/AGENTS.md antes de decisiones críticas. |
| **Worktree aislado** | Scope creep, deriva destructiva. | La deriva vive en una rama descartable. |

> El hilo común: **determinístico > probabilístico.** Toda mitigación
> que depende de "pedirle al modelo" es frágil; toda mitigación que
> depende de un mecanismo independiente del modelo es robusta. Esto es lo
> mismo que el M1 dijo con hooks > scoped rules > AGENTS.md.

---

## 7.9 Árbol de decisión: qué hacer cuando el agente falla

```
El agente falló. ¿De qué clase es?
│
├─ ¿El contexto está saturado (>60%) o el agente pierde reglas que
│  antes respetaba?
│  └─ SÍ → Corrupción de contexto.
│          No reintentes. Compacta (M4 §4.2) o cierra sesión con
│          handoff (M4 §4.3) y arranca limpio.
│
├─ ¿Llamó a una tool inexistente, fabricó argumentos, o usó la tool
│  equivocada?
│  └─ SÍ → Mal uso de tools.
│          Devuelve error estructurado al modelo; revisa el schema
│          (M5 §5.1.2). No reintentes en ciego.
│
├─ ¿Está repitiendo pasos, derivando a tareas no pedidas, o
│  oscilando entre dos soluciones?
│  └─ SÍ → Trayectoria / degeneración.
│          Corta el loop. Reespecifica con no-objetivos. Usa worktree
│          aislado para que la deriva no contamine.
│
├─ ¿Afirmó verificar sin ejecutar, o su reporte es hueco / sin
│  números?
│  └─ SÍ → Acción / realización.
│          Exige evidencia mecánica (M6 §6.5). El sensor, no el
│          modelo, debe confirmar. No reintentes sin sensor.
│
└─ ¿Accedió a paths fuera de scope, obedeció instrucciones de un
   archivo del repo, o filtró credenciales?
   └─ SÍ → Sandbox y seguridad.
           Esto es incidente. Aísla, audita, endurece. Ver M10.
           NO reintentes.
```

> Ver `templates/failure-classes-cheatsheet.md` para la versión tabular.

---

## 7.10 El postmortem de sesión fallida

Cuando una sesión termina en un fracaso que no entendiste a tiempo, el
postmortem es el artefacto que convierte el incidente en conocimiento
permanente del harness. No es para culpar al agente; es para endurecer
el harness la próxima vez.

Partes:
1. **Qué se intentaba** (spec + tarea).
2. **Qué falló y cuándo** (el síntoma observable, no la interpretación).
3. **Clase de falla** (de la taxonomía §7.1).
4. **Por qué no lo atrapó el harness** (cuál sensor faltó, cuál regla era
   solo advisory, cuál gate no existía).
5. **Mitigación a instalar** (qué promueve de prosa a check, qué hook
   se agrega, qué spec se corrige).
6. **Recurrencia esperada** (¿es de la clase que se repite?).

> Ver `templates/incident-postmortem-agent.md`.

---

## 7.11 Niveles de adopción

### Mínimo (arranca hoy)

- Conocer la taxonomía: distinguir context rot de test gaming de
  sandbox escape antes de responder.
- Ante falla, clasificar antes de actuar. No reintentar en ciego.
- Postmortem simple tras cualquier sesión que terminó mal sin que lo
  entendieras a tiempo.

### Medio

- Mitigaciones estructurales: file immutability en paths críticas,
  budget de pasos por tarea, relectura forzada antes de decisiones
  críticas.
- Detección de test gaming y phantom verification como gates (M6).

### Completo

- Command risk classifier; worktrees aislados por defecto para que la
  deriva nunca toque main.
- Cada postmortem produce una mitigación instalada (un hook, un gate,
  un spec corregido). El harness madura con cada incidente.

---

## 7.12 FAQ — trampas reales

**¿Reintento cuando el agente se equivoca?** Depende de la clase. Context
rot y trayectoria: no reintentes, corta. Mal uso de tools: a veces,
devolviendo error estructurado. Acción: reintenta solo si ahora hay
sensor. Sandbox: nunca reintentes, es incidente.

**El agente "cree" que verificó pero no ejecutó.** Es phantom
verification. La respuesta no es "verifica mejor"; es exigir output
textual del comando. Si no puede mostrarlo, no verificó.

**Mi agente deriva siempre a "mientras tanto refactorizo esto".** Scope
creep. No-objetivos explícitos en la spec (M2), diff guard en CI (M6),
y worktree aislado para que la deriva sea descartable.

**¿Cómo se si es context rot o un bug del modelo?** Si las reglas que
antes respetaba empiezan a fallar y el contexto va alto, es rot. Si
falla desde el arranque con contexto limpio, es otra cosa (mal uso de
tools, hallucination, spec ambigua).

**Secret exposure suena teórico.** No lo es: el agente que lee `.env`
para "entender la config" y luego te lo imprime en un resumen ya filtró
el secreto a tu pantalla (y al log). Mantén secretos fuera del árbol
indexado.

**¿Todo falla por contexto?** No, pero ~40% sí. Por eso la primera
pregunta ante una falla es "¿el contexto está saturado?". Si sí, la
solución casi nunca es más prompt.

---

## 7.13 Referencias

- **Coding Agent Failure Taxonomy — Codex Knowledge Base**
  (https://codex.danielvaughan.com/2026/06/03/coding-agent-failure-taxonomy-nist-style-classification-detection-codex-cli/) —
  taxonomía de 5 clases con porcentajes.
- **What Breaks When LLMs Code? — arXiv**
  (https://arxiv.org/html/2605.30777v1) — estudio empírico de 547 fallas
  reales de seguridad operacional.
- **ClayBuddy Framework — arXiv**
  (https://arxiv.org/html/2606.19380v3) — underspecification, capability
  errors, harness errors; propone mitigaciones concretas.
- **12 Failure Classes from 30B Tokens — DEV Community**
  (https://dev.to/cryptokeesan/what-12-failure-classes-and-30-billion-tokens-spent-taught-us-about-trusting-ai-coding-agents-pi7) —
  experiencia de producción a escala.
- **Coding Discipline — SkillStack**
  (https://github.com/viktorbezdek/skillstack/blob/main/coding-discipline/README.md) —
  5 failure modes empíricamente documentados.

**Plantillas vinculadas:** `templates/failure-classes-cheatsheet.md`,
`templates/incident-postmortem-agent.md`.