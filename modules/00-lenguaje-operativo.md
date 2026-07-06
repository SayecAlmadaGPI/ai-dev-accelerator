# Módulo 0 — Lenguaje Operativo

> **El prerequisito de todo el curso.**
> Si no puedes nombrar un fenómeno, no puedes controlarlo. Este módulo construye el vocabulario que necesitas para *pensar* sobre el trabajo con agentes — no para aprobar un examen de terminología, sino para diagnosticar con precisión qué falló cuando algo falla.

---

## 0.0 Por qué importa el vocabulario

Hay un momento muy específico en el que un desarrollador pasa de "usar IA como chatbot" a "trabajar con agentes como ingeniero". Es el momento en el que deja de decir *"se puso raro, le voy a reabrir"* y empieza a decir *"el contexto se llenó y entró en la dumb zone, hay que hacer un handoff con artifact"*. No es un cambio de sofisticación; es un cambio de **capacidad de diagnóstico**.

El [Dictionary of AI Coding](https://github.com/mattpocock/dictionary-of-ai-coding) de Matt Pocock nació exactamente de esto: la jerga operativa del trabajo con agentes, traducida a lenguaje llano. Este módulo es una destilación de esa idea, organizada en siete ejes temáticos, para que cuando leas los módulos 1 a 10 sepas *qué* está pasando y *por qué* se llama como se llama.

**Cómo leer este módulo:** cada término tiene tres partes:

- **Definición:** qué es, en una frase.
- **Por qué te importa:** la consecuencia operativa. Si no cambia nada de lo que haces, el término no pertenece aquí.
- **En la práctica:** cómo se ve cuando lo encuentras en una sesión real.

Al final hay un glosario compacto de referencia rápida y un diagrama del flujo completo.

---

## 0.1 El modelo: anatomía operativa de un LLM

Estos términos describen la **caja negra** con la que hablas. No necesitas saber cómo se entrena, pero sí necesitas saber cómo se factura y por qué no es determinista.

### Token
**Definición:** la unidad mínima de texto que el modelo procesa. No es una palabra: es un *sub-fragmento*. "Gato" puede ser un token; "desafortunadamente" puede ser tres.
**Por qué te importa:** todo se cobra y se mide en tokens — input, output y cache. El costo de tu sesión es la suma de tokens procesados. La context window se mide en tokens, no en caracteres.
**En la práctica:** un archivo de 1000 líneas de TypeScript son ~10.000-15.000 tokens. Eso ya es ~1% de una ventana de 1M.

### Training vs. Inference
**Definición:** *training* es cuando el modelo aprende (lo hace el proveedor, una sola vez por versión); *inference* es cuando el modelo predice (lo que pasa cada vez que le mandás un mensaje).
**Por qué te importa:** el conocimiento del modelo está *congelado* en el training. En inference no aprende nada nuevo — solo predice. Cuando le pedís "recuerda que X", no está aprendiendo; está usando el contexto de la conversación. Si borras el contexto, "olvida".
**En la práctica:** por eso un agente que "aprendió" tu códigobase en una sesión no sabe nada en la siguiente, salvo que persistas ese conocimiento en archivos (de eso viven M1 y M4).

### Next-token prediction
**Definición:** lo único que realmente hace el modelo en inference: dado un texto, predecir el siguiente token más probable. Una y otra vez.
**Por qué te importa:** explica la *non-determinism* y la *hallucination*. El modelo no "sabe" nada; predice lo que sería un texto plausible. Si el texto plausible es falso pero convincente, lo produce igual.
**En la práctica:** cuando un agente inventa el nombre de una función que "tendría que existir", no está mintiendo: está prediciendo el token más probable según el patrón. El error es estructural, no malicioso.

### Non-determinism
**Definición:** el mismo input no garantiza el mismo output. Dos ejecuciones idénticas pueden dar respuestas distintas.
**Por qué te importa:** por eso los tests de agentes son estadísticos, no deterministas. Y por eso "lo probé y funcionaba" no es verificación — hay que ejecutar los AC varias veces o con seeds distintas.
**En la práctica:** un agente que pasa tus tests en una corrida puede fallarlos en la siguiente sin que hayas cambiado nada. Eso no es un bug del agente; es la naturaleza del medio.

### Effort (esfuerzo / razonamiento)
**Definición:** cuántos tokens de "pensamiento" el modelo se permite generar antes de responder. Mayor effort = más tokens de razonamiento interno = más caro y más lento, pero típicamente mejor en tareas difíciles.
**Por qué te importa:** es un dial de costo/calidad. Para tareas triviales, effort bajo ahorra dinero y tiempo. Para refactorizar código legacy, effort alto suele pagarse.
**En la práctica:** elegir effort es como elegir cuánto tiempo dejar pensar a un colaborador antes de que empiece a escribir.

### Prefix cache
**Definición:** un prefijo idéntico de tu input que el proveedor ya procesó antes y guarda listo para reusar. Si mandás el mismo system prompt otra vez, no se re-procesa.
**Por qué te importa:** es la diferencia entre $300/día y $30/día en muchas cargas de trabajo reales. El prompt caching (Módulo 9) puede reducir el costo de input entre un 50% y un 90% cuando hay prefijos repetidos.
**En la práctica:** mantener tu system prompt / AGENTS.md estable entre llamadas activa el cache. Cambiar una línea al principio invalida todo el cache del prefijo.

### Cache tokens
**Definición:** los tokens leídos desde el prefix cache en lugar de procesarse desde cero. Se facturan a una fracción del precio (típicamente 10-25% del input normal).
**Por qué te importa:** es la métrica que te dice si tu diseño está aprovechando el cache. Pocas cache tokens = estás pagando de más.
**En la práctica:** en una sesión de agente larga, la mayoría del costo debería ir a cache tokens, no a input fresco. Si no, tu estructura de prompts no es cache-friendly.

---

## 0.2 Sesiones, contexto y turnos

Esta es la capa de interacción. Donde el "estado" vive (o deja de vivir).

### Stateless vs. Stateful
**Definición:** un sistema *stateless* no recuerda nada entre llamadas; uno *stateful* sí. Una API LLM pura es stateless por defecto; una sesión de agente es stateful (acumula el contexto entre turnos).
**Por qué te importa:** el "estado" de tu sesión NO vive en el modelo. Vive en el contexto que le re-envías en cada turno. Si cortas la sesión, el estado se evapora.
**En la práctica:** por eso cerrar una sesión y reabrir "lo mismo" no es lo mismo — perdiste el contexto acumulado. Salvo que lo hayas persistido en archivos (M1, M4).

### Context window
**Definición:** el máximo de tokens que el modelo puede "tener en mente" a la vez en una sesión. En 2026, 1M es estándar; algunos llegan a 2M o 10M.
**Por qué te importa:** no es un número de "cuánto cabe", sino de "cuánto atiende". A partir de cierto punto, la calidad de atención degrada aunque el texto entre.
**En la práctica:** una ventana de 1M no significa que leer 800K tokens te dé un buen resultado. Significa que *cabén*. Lo que el modelo atienda es otra historia (ver *attention degradation*).

### Turn (turno)
**Definición:** un ciclo de input + output entre tú y el modelo. Una sesión con 50 turnos tiene 50 inputs tuyos y 50 outputs del modelo.
**Por qué te importa:** cada turno re-envía todo el historial. El costo crece de forma *cuadrática* con la cantidad de turnos, no lineal. Turn 100 cuesta mucho más que turn 10, porque re-procesa los 99 anteriores.
**En la práctica:** una sesión de 200 turnos puede costar 10-20× más que una de 20 turnos con el mismo trabajo útil. Compactar (ver más abajo) rompe esa cuadrática.

### Agent (agente)
**Definición:** un modelo + un harness (las herramientas, instrucciones, permisos y entorno). El "agente" no es el modelo; es el *sistema* que lo rodea.
**Por qué te importa:** es la distinción que sostiene todo el Módulo 1. Cuando un agente funciona mal, casi nunca es "el modelo es tonto"; es "el harness está mal".
**En la práctica:** dos agentes con el mismo modelo y distinto harness pueden tener resultados radicalmente distintos. El harness es la palanca, no el modelo.

### System prompt
**Definición:** las instrucciones iniciales que definen el comportamiento del agente, enviadas al principio de cada turno. Es lo primero que el modelo "lee".
**Por qué te importa:** es donde viven las reglas estables (rol, restricciones, formato). Pero es *advisory*: el modelo puede no seguirlas. Por eso el harness agrega enforcement mecánico (M3, M6).
**En la práctica:** el AGENTS.md / CLAUDE.md termina empacado dentro del system prompt. Cada línea compite por la atención del modelo.

### Session lifecycle
**Definición:** el ciclo de vida de una sesión: apertura → acumulación de turnos → (posible *compaction*) → cierre o handoff.
**Por qué te importa:** entender el ciclo te dice *cuándo* intervenir: cuándo compactar, cuándo hacer handoff, cuándo cerrar y empezar de nuevo. Mal gestionar el lifecycle es la causa #1 de sesiones que se degradan.
**En la práctica:** una buena sesión termina con estado limpio guardado en archivos; una mala termina con el contexto saturado y el agente confundido.

---

## 0.3 Herramientas y entorno

Cómo el agente percibe el mundo y actúa sobre él. Sin herramientas, un agente es solo un chatbot que escribe texto.

### Environment
**Definición:** el entorno donde el agente ejecuta: el directorio de trabajo, las variables de entorno, el shell, los permisos del sistema operativo.
**Por qué te importa:** dos agentes con el mismo prompt pero distinto environment ven cosas distintas. El environment es parte del harness.
**En la práctica:** correr un agente en tu máquina vs. en un container vs. en CI son tres realidades distintas para el agente, aunque el prompt sea idéntico.

### Filesystem
**Definición:** el sistema de archivos del environment. Es el sistema de percepción principal del agente: lee código, escribe código, lee logs.
**Por qué te importa:** lo que no está en archivos no existe para el agente de forma durable. Si el "estado" vive solo en la conversación, se pierde.
**En la práctica:** por eso el blueprint insiste en "el repositorio como system of record". Lo que importa debe vivir en el filesystem, no en la charla.

### Tool (herramienta)
**Definición:** una función que el agente puede invocar para actuar sobre el entorno: leer archivo, ejecutar comando, hacer HTTP request, buscar en DB.
**Por qué te importa:** sin tools, el agente solo produce texto. Con tools, produce *cambios* en el mundo. El catálogo de tools define el perímetro de lo que el agente puede y no puede hacer.
**En la práctica:** dar acceso a `bash` sin restricciones es distinto a dar acceso solo a `grep`. El set de tools es una decisión de seguridad, no solo de conveniencia.

### Tool call / Tool result
**Definición:** *tool call* es la solicitud del agente para ejecutar una herramienta (con argumentos); *tool result* es lo que la herramienta devuelve. El agente razona sobre el resultado para decidir el siguiente paso.
**Por qué te importa:** es el ciclo de percepción-acción del agente. Cada tool call es una oportunidad para que algo salga mal: argumentos mal formados, resultados que contienen instrucciones (prompt injection), o herramientas que fallan.
**En la práctica:** un agente que hace 30 tool calls para una tarea simple probablemente está en un loop de *yak-shaving* (Módulo 7). Un agente que hace 0 tool calls probablemente está alucinando en lugar de verificar.

### MCP (Model Context Protocol)
**Definición:** un protocolo estándar para que servidores expongan tools, resources y prompts a clientes de LLM de forma portable. Es como una API, pero diseñada para agentes.
**Por qué te importa:** es la pieza que hace que tus integraciones (DB, issue tracker, CI) funcionen con cualquier agente que soporte MCP, sin reescribirlas. Se ve a fondo en el Módulo 5.
**En la práctica:** construir un MCP server para "mi work tracker interno" te sirve igual en Claude Code, Cursor, Codex y Gemini. Es portabilidad real, no promesa.

### Permission request / Permission mode
**Definición:** cuando el agente quiere ejecutar una acción sensible (escribir archivo, correr comando, hacer red), pide permiso. El *permission mode* define la política: auto-aprobar, preguntar siempre, denegar.
**Por qué te importa:** es tu control de seguridad *durante* la ejecución. El modo que elijas cambia qué tan autónomo es el agente y cuánto riesgo asumís.
**En la práctica:** `read-only` para explorar, `propose-then-commit` para cambios que tú apruebas, `full-agent` para tareas largas AFK. Elegir mal el modo es la causa #1 de "el agente borró algo que no debía".

### Sandbox
**Definición:** un entorno aislado y restringido donde el agente ejecuta acciones, de modo que no pueda escapar ni dañar el sistema host.
**Por qué te importa:** es tu red de seguridad cuando el agente hace cosas destructivas. Sin sandbox, un agente con acceso a bash puede hacer `rm -rf` por equivocación.
**En la práctica:** correr al agente en un container o worktree aislado es el equivalente a ponerle cinturón de seguridad. Siempre que haya estado mutante, sandbox.

---

## 0.4 Modos de falla

Los nombres de lo que sale mal. Saber el nombre es el primer paso para reconocerlo y reaccionar (el Módulo 7 profundiza).

### Sycophancy (complacencia)
**Definición:** la tendencia del modelo a estar de acuerdo con vos, aunque estés equivocado. Si sugerís una mala idea, tiende a validarla en lugar de cuestionarla.
**Por qué te importa:** te da una falsa sensación de validación. El agente que dice "sí, buena idea" a todo no es un buen colaborador; es un espejo.
**En la práctica:** si le decís "¿no es mejor usar Redis aquí?", probablemente diga "sí, excelente", aunque Mongo fuera la mejor opción. La validación no es señal de corrección.

### Hallucination: factuality vs. faithfulness
**Definición:** dos tipos distintos de alucinación. *Factuality* es inventar hechos que no son ciertos (una API que no existe). *Faithfulness* es desviarse de lo que pediste, aunque el contenido sea verdadero.
**Por qué te importa:** se corrigen distinto. Factuality se ataca con grounding (que el agente cite fuentes verificables). Faithfulness se ataca con specs y verificación contra el alcance.
**En la práctica:** "el agente dice que existe `fs.copyRecursive()`" es factuality. "Pedí arreglar un bug y reescribió tres módulos" es faithfulness. Confundirlas lleva a mitigaciones equivocadas.

### Parametric knowledge vs. Contextual knowledge
**Definición:** *parametric* es lo que el modelo aprendió en training (congelado, con fecha de corte). *Contextual* es lo que le diste en el contexto de esta sesión.
**Por qué te importa:** si una API cambió después del cutoff del modelo, el modelo la va a usar mal — su conocimiento parametric está desactualizado.
**En la práctica:** nunca asumas que el agente "sabe" tu códigobase. Su conocimiento parametric no la incluye. Siempre debe leerla (contextual) antes de actuar sobre ella.

### Knowledge cutoff
**Definición:** la fecha hasta la que llega el conocimiento parametric del modelo. Cualquier cambio posterior es invisible para él salvo que se lo des como contexto.
**Por qué te importa:** explica por qué un agente puede usar patrones de 2022 en 2026. No es pereza; es que su conocimiento se detuvo en su cutoff.
**En la práctica:** si tu framework lanzó una feature nueva el año pasado, dásela al agente en un archivo (docs, ejemplos) en lugar de esperar que la sepa.

### Attention relationship
**Definición:** cómo el modelo "atiende" diferentes partes del contexto. No todo el contexto recibe la misma atención: el inicio, el final y lo más reciente pesan más.
**Por qué te importa:** explica el *lost in the middle* — información al medio del contexto se "pierde". Lo que pusiste al final tiene más influencia que lo del medio.
**En la práctica:** las instrucciones críticas van al *principio* (system prompt / AGENTS.md) o se *repiten al final* (CLAUDE.local.md tras compaction). Nunca al medio.

### Attention budget / Attention degradation
**Definición:** la atención es un recurso finito. A medida que el contexto crece, cada parte recibe menos atención: *attention degradation*. El modelo empieza fuerte y se va apagando.
**Por qué te importa:** es la razón por la que una sesión larga no es mejor que una corta. Más contexto ≠ más inteligencia; a menudo es menos.
**En la práctica:** la *smart zone* (principio de sesión, contexto moderado) da mejores resultados que la *dumb zone* (contexto saturado, finales de sesión larga).

### Smart zone / Dumb zone
**Definición:** la *smart zone* es el rango donde el agente razona bien (contexto moderado, atención alta). La *dumb zone* es cuando el contexto se satura y el agente empieza a perder instrucciones, confundirse y degradarse.
**Por qué te importa:** es el concepto que justifica *compactar*, hacer *handoffs* y empezar sesiones nuevas. Estar en la dumb zone es trabajar con un agente peor del que pagaste.
**En la práctica:** síntomas de dumb zone: el agente ignora instrucciones que respetaba al principio, repite errores que ya corrigió, olvida constraints. La solución no es "pedirle otra vez"; es compactar o hacer handoff.

---

## 0.5 Handoffs

Cómo pasar el trabajo entre sesiones (y entre agentes) sin que se pierda en el camino. El corazón operativo del Módulo 4.

### Clearing
**Definición:** vaciar deliberadamente el contexto antes de empezar una nueva tarea relacionada, para no arrastrar instrucciones viejas que contaminen la nueva.
**Por qué te importa:** limpiar entre tareas distintas previene que el agente aplique reglas de la tarea anterior a la nueva. Es higiene, no pérdida.
**En la práctica:** `/clear` entre tareas no relacionadas. No entre subpasos de la misma tarea.

### Handoff
**Definición:** transferir el trabajo de una sesión/agente a otro, dejando un *handoff artifact* que permita reconstruir el estado sin releer la conversación anterior.
**Por qué te importa:** es el mecanismo que vence al context rot. Sin handoff, cada sesión empieza de cero o de un contexto saturado. Con handoff, empieza de un *artefacto*.
**En la práctica:** el handoff artifact del M2 es `claude-progress.md` + `state.json` + el último commit. Un agente nuevo lee eso y continúa sin reconstruir la historia.

### Primary source vs. Secondary source
**Definición:** *primary source* es la fuente original de un dato (el código, el log, el issue). *Secondary source* es un resumen o interpretación (lo que un agente dijo que decía el código).
**Por qué te importa:** el agente confía más en su contexto (secondary) que en la realidad (primary) cuando hay conflicto. Forzarlo a leer la primary source corrige desviaciones.
**En la práctica:** si el agente "recuerda" que una función hace X pero no la leyó esta sesión, pídele que la lea. La primary source siempre gana.

### Handoff artifact
**Definición:** el conjunto de archivos que un agente deja al cerrar para que el siguiente continúe: progreso, decisiones, bloqueantes, spec, SHA del commit.
**Por qué te importa:** es el *contrato de continuidad*. Sin él, la siguiente sesión improvisa. Con él, retoma exactamente donde quedó.
**En la práctica:** mínimo viable: `claude-progress.md` con "qué hice, qué falta, qué está bloqueado, dónde dejé el commit".

### Spec / Ticket
**Definición:** el *ticket* es la intención (lo que alguien quiere). La *spec* es el contrato técnico (lo que se va a construir y qué lo define como hecho). Ver M2.
**Por qué te importa:** confundirlos lleva a ejecutar contra la intención vaga en lugar del contrato preciso. El ticket es insumo; la spec es lo que el agente ejecuta.
**En la práctica:** nunca delegues al agente contra un ticket. Siempre contra una spec (aunque sea Spec-First, mínima).

### Compaction / Autocompact
**Definición:** *compaction* es resumir el historial de la sesión para liberar espacio de contexto sin perder lo esencial. *Autocompact* es cuando el harness lo hace solo al llegar a un umbral.
**Por qué te importa:** es lo que evita que la sesión muera por saturación, pero introduce un riesgo: si algo importante se queda fuera del resumen, se "olvida".
**En la práctica:** compactar a ~60% (proactivo) suele preservar mejor que esperar al autocompact a ~83%. Las reglas críticas deben sobrevivir la compaction — por eso van en `CLAUDE.local.md`, no en la charla.

---

## 0.6 Memoria y steering

Cómo el agente recuerda entre sesiones y cómo lo orientas sin micro-administrarlo. Base del Módulo 3.

### Memory system
**Definición:** el conjunto de mecanismos por los que el agente persiste conocimiento entre sesiones. No es una sola cosa: en Claude Code son cuatro capas (CLAUDE.md, MEMORY.md, memory tool, subagent memory).
**Por qué te importa:** "memoria" no es magia; son archivos con reglas de carga. Entender las capas te dice dónde poner cada cosa para que se cargue cuando corresponde.
**En la práctica:** las reglas estables van en CLAUDE.md (siempre cargadas); los hechos descubiertos en la sesión van en MEMORY.md (cargados al inicio); el conocimiento on-demand va en archivos referenciados por *context pointers*.

### AGENTS.md
**Definición:** el archivo canónico de instrucciones de proyecto para agentes. De facto standard: lo leen Codex, Cursor y (vía symlink/import) Claude Code.
**Por qué te importa:** es donde viven las reglas del proyecto que el agente debe respetar siempre: comandos, estilo, gotchas, lo que no se toca.
**En la práctica:** un AGENTS.md bien escrito reduce enormemente los "errores de principiante" del agente en tu repo. Uno hinchado degrada la compliance (ver ~150-200 slots en M3).

### Progressive disclosure
**Definición:** no cargar todo el conocimiento en el contexto al inicio; cargarlo *cuando se necesita*, en niveles. El contexto base se mantiene chico; lo específico entra on-demand.
**Por qué te importa:** es el patrón que evita que el system prompt se vuelva inmanejable. Decirle al agente *dónde* encontrar la info, no dársela toda.
**En la práctica:** AGENTS.md al nivel 1 (siempre), docs/ al nivel 2 (on-demand), design docs al nivel 3 (raras veces). Esto preserva la smart zone.

### Context pointer
**Definición:** una referencia en el contexto base que apunta a dónde está el conocimiento profundo, en lugar de incluir el conocimiento. "Para X, ver `docs/decisions/004.md`".
**Por qué te importa:** es la herramienta concreta del progressive disclosure. Te permite mantener AGENTS.md corto sin perder profundidad.
**En la práctica:** `@path/to/import` en CLAUDE.md es un context pointer: carga el archivo solo cuando se invoca, no siempre.

### Skill
**Definición:** un playbook reutilizable y versionable que encapsula un flujo vertical (cómo hacer una migración, cómo deployar, cómo triage de incidentes). Se invoca por nombre.
**Por qué te importa:** es la forma de empaquetar conocimiento *operacional* (no solo declarativo). Un skill dice "cómo se hace X en este repo", paso a paso.
**En la práctica:** `.claude/skills/migrar-db/SKILL.md` se invoca con `/migrar-db`. El agente sigue el playbook en lugar de improvisar la migración cada vez.

### Subagent
**Definición:** un agente secundario con contexto aislado que el agente principal delega para tareas específicas (investigar, revisar, verificar). Su contexto no contamina al principal.
**Por qué te importa:** es la palanca del paralelismo y de la verificación adversarial. Un subagent reviewer con contexto fresco suele detectar cosas que el agente principal, saturado, ya no ve.
**En la práctica:** "lanza un subagent que revise este diff contra la spec" aprovecha contexto fresco y aislado para una verificación más limpia que la del agente principal al final de una sesión larga.

---

## 0.7 Patrones de trabajo

Cómo se organiza el trabajo humano-agente. Estos términos describen *modalidades*, no conceptos técnicos.

### Human-in-the-loop (HITL)
**Definición:** modo de trabajo en el que el humano aprueba cada paso relevante del agente. El agente propone; el humano aprueba; el agente ejecuta.
**Por qué te importa:** es el modo para tareas de alto riesgo o poco claras. Máxima seguridad, mínima velocidad. Elegirlo donde el costo de un error es alto.
**En la práctica:** refactor de migraciones de DB, cambios en producción, touching del schema. Donde un error cuesta caro, HITL.

### AFK (away from keyboard)
**Definición:** modo en el que delegás una tarea y te apartáss; el agente trabaja solo y vuelve con un resultado (un PR, un diff, un reporte).
**Por qué te importa:** es el modo para tareas largas y bien especificadas. Máxima velocidad, máximo riesgo si la spec es mala.
**En la práctica:** solo es seguro en AFK lo que tiene una buena spec + verificación automática. Sin spec, AFK es "esperar y rezar".

### Automated check / Automated review
**Definición:** *automated check* es una verificación determinística (test, lint, build). *Automated review* es una verificación hecha por otro modelo/agent sobre el diff.
**Por qué te importa:** son las dos capas de verificación que cierran el loop sin humano. Check es barato y confiable; review es más cara pero detecta cosas que check no puede.
**En la práctica:** check responde "¿compila? ¿pasan los tests?". review responde "¿este cambio cumple la spec? ¿hay código muerto?". Ambas, no una sola.

### Human review
**Definición:** la revisión que un humano hace sobre el output del agente antes de aceptarlo. El último gate de calidad.
**Por qué te importa:** no es opcional cuando el costo del error supera el costo de tu tiempo. La pregunta es *qué tan grande* debe ser el cambio para requerirla.
**En la práctica:** para la mayoría del código de producción, human review del diff final es el mínimo. El grado de detail depende del riesgo del cambio.

### Vibe coding
**Definición:** programar guiándose por la intuición y el feedback inmediato del agente, sin spec ni verificación formal. "Se ve que funciona, merge".
**Por qué te importa:** es el anti-patrón del que arranca todo este curso. Rápido y placentero para prototipos; peligroso para producción.
**En la práctica:** permitido en verde (prototipos, exploración). Prohibido en código mantenido por otros o que va a producción.

### Design concept
**Definición:** una descripción de alto nivel de una solución antes de comprometerse con la implementación. No es una spec; es una hipótesis de diseño.
**Por qué te importa:** es la etapa donde el agente puede equivocarse barato. Descartar un design concept cuesta minutos; descartar una implementación cuesta horas.
**En la práctica:** pedirle al agente "dame tres design concepts para esto" antes de "implementalo" explora el espacio de soluciones sin quemar tokens en implementaciones que vas a tirar.

### Grilling
**Definición:** la práctica de cuestionar sistemáticamente el output del agente: "¿por qué elegiste esto?", "¿qué pasa si el input es vacío?", "¿verificaste que X existe?".
**Por qué te importa:** es la postura que mantiene al agente honesto. Sin grilling, el agente produce texto plausible; con grilling, se ve obligado a verificar.
**En la práctica:** grilling es lo que separa al senior que usa IA bien del junior que se deja llevar por la fluidez del agente.

### Prototyping
**Definición:** construir una versión rápida y desechable para validar una idea antes de invertir en la versión real.
**Por qué te importa:** es el caso de uso legítimo del vibe coding. Lo desechable puede ser libre; lo que se queda debe tener spec.
**En la práctica:** "construyé un prototype de esta UI en 20 minutos, lo voy a tirar igual" es prototyping sano. Lo que sobrevive al prototipo se reescribe con spec.

### DX vs. AX
**Definición:** *DX* (developer experience) es qué tan agradable es trabajar *con* tu código para un humano. *AX* (agent experience) es qué tan agradable es trabajar *con* tu repo para un agente.
**Por qué te importa:** optimizar solo DX deja al agente en desventaja. Un repo con AX bueno (AGENTS.md claro, comandos reproducibles, tests rápidos, estructura predecible) hace que el agente sea más confiable sin que tú hagas más.
**En la práctica:** "¿un agente nuevo puede arrancar en este repo y ser productivo en 10 minutos?" es la pregunta de AX. Si la respuesta es no, tu repo tiene deuda de AX.

---

## 0.8 El flujo completo: de la intención al token

Este diagrama muestra cómo todos los términos de este módulo encajan en una sola sesión de agente:

```
┌──────────────────────────────────────────────────────────────────────┐
│  INTENCIÓN (ticket vago)                                              │
│     "filtrar proyectos por estado"                                     │
└──────────────────────────────────────────────────────────────────────┘
                    │
                    │  SDD (M2): transformar en spec.md (contrato)
                    ▼
┌──────────────────────────────────────────────────────────────────────┐
│  SPEC (primary source)                                                │
│     objetivos, no-objetivos, invariantes, AC binarios                 │
└──────────────────────────────────────────────────────────────────────┘
                    │
                    │  GSD (M2): descomponer en .planning/
                    ▼
┌──────────────────────────────────────────────────────────────────────┐
│  ENTORNO (environment + filesystem)                                   │
│     AGENTS.md (memory) + skills + tools + sandbox + permission mode  │
│     └─ MCP servers conectan al mundo exterior (M5)                    │
└──────────────────────────────────────────────────────────────────────┘
                    │
                    │  Sesión arranca: system prompt + AGENTS.md cargados
                    ▼
┌──────────────────────────────────────────────────────────────────────┐
│  SMART ZONE ◄─────────────────────────────────────► DUMB ZONE        │
│  (contexto moderado,                                (contexto          │
│   atención alta)                                    saturado,          │
│                                                      attention         │
│                                                      degradation)      │
│                                                                       │
│   turnos: 1 ──► N                                                     │
│     cada turno: tool call ──► tool result ──► razonamiento             │
│     costo crece cuadrático; cache tokens mantienen el bill bajo        │
│                                                                       │
│   sycophancy + hallucination (factuality/faithfulness) los vigilan    │
└──────────────────────────────────────────────────────────────────────┘
                    │
                    │  Al ~60% contexto: compaction proactiva
                    │  Al saturar: handoff + clearing
                    ▼
┌──────────────────────────────────────────────────────────────────────┐
│  VERIFICACIÓN (automated check + review)                              │
│     tests, lint, build + subagent reviewer con contexto fresco        │
│     DONE/VERIFIED: qué se verificó, qué no, supuestos, qué revisar    │
└──────────────────────────────────────────────────────────────────────┘
                    │
                    │  Human review (HITL) o AFK final
                    ▼
┌──────────────────────────────────────────────────────────────────────┐
│  RESULTADO persistente (filesystem, no conversación)                  │
│     commit + handoff artifact (claude-progress.md, state.json)        │
└──────────────────────────────────────────────────────────────────────┘
```

Léelo así: **lo que importa debe viajar por los archivos (laterales), no por la conversación (centro).** La conversación es efímera y se degrada; los archivos sobreviven. Toda la metodología del curso existe para que el estado viaje por los laterales.

---

## 0.9 Glosario de referencia rápida

Tabla compacta para consulta durante una sesión. Cuando oyes / ves X, piensa Y.

| Término | En una frase | Cuidado con... |
|--------|--------------|----------------|
| Token | Unidad de texto que el modelo procesa | Creer que 1 token ≈ 1 palabra (no) |
| Inference | Predicción del modelo en runtime | Creer que el modelo "aprende" en inference |
| Non-determinism | Mismo input ≠ mismo output | "Lo probé una vez y funcionó" |
| Effort | Cuánto "piensa" antes de responder | Siempre usar effort alto (caro) |
| Prefix cache | Prefijo ya procesado, reutilizable | Cambiar el inicio del prompt (invalida cache) |
| Context window | Máximo de tokens "en mente" | Creer que = atención efectiva |
| Turn | Un ciclo input+output | Ignorar el costo cuadrático de turnos |
| Agent | Modelo + harness | Culpar al modelo cuando falla el harness |
| Tool | Función invocable sobre el entorno | Dar tools sin pensar en seguridad |
| MCP | Protocolo estándar de tools portable | Reinventar integraciones por herramienta |
| Sandbox | Entorno aislado de ejecución | Correr agentes con bash sin sandbox |
| Sycophancy | El agente te da la razón | Tomar validación como señal de corrección |
| Hallucination (factuality) | Inventar hechos | Creer que cita fuentes reales |
| Hallucination (faithfulness) | Desviarse de lo pedido | Confundirlo con factuality |
| Smart/Dumb zone | Rango de buena/degradada atención | Seguir trabajando en dumb zone |
| Handoff | Transferir trabajo con artifact | Cerrar sesión sin dejar handoff |
| Primary source | Fuente original (código/log) | Confiar en lo que el agente "recuerda" |
| Compaction | Resumir historial para liberar contexto | Dejar reglas críticas fuera del resumen |
| Progressive disclosure | Cargar conocimiento on-demand | Hinchar el system prompt |
| Subagent | Agente con contexto aislado | Usar el agente principal saturado para revisar |
| HITL | Humano aprueba cada paso | Micro-administrar tareas triviales |
| AFK | Agente trabaja solo | Hacer AFK sin spec ni verificación |
| Vibe coding | Programar sin spec ni verificación | Usarlo en producción |
| DX vs AX | Experiencia de humano vs agente | Optimizar solo DX |

---

## 0.10 Cómo usar este vocabulario a partir de ahora

1. **Diagnostica con precisión.** Cuando algo falle, no digas "se rompió"; diagnostica: ¿factuality o faithfulness? ¿smart zone o dumb zone? ¿falla de modelo o de harness? El nombre te dice la mitigación.
2. **Estructura el contexto con intención.** Las reglas críticas al inicio (AGENTS.md) y se repiten al final (CLAUDE.local.md tras compaction). El conocimiento profundo on-demand (context pointers). Esto preserva la smart zone.
3. **Mide lo que cuesta.** Vigila cache tokens vs input fresco, turnos por sesión, cuándo compactas. Si no lo mides, lo pagas sin saberlo.
4. **Elige el modo correcto.** HITL para alto riesgo, AFK solo con spec + verificación, vibe coding solo en verde.
5. **Cuando dudes del vocabulario, vuelve aquí.** Los módulos 1-10 usan estos términos sin volver a definirlos. Este módulo es tu diccionario de todo el curso.

---

## Referencias de este módulo

- [Dictionary of AI Coding — Matt Pocock](https://github.com/mattpocock/dictionary-of-ai-coding) — la fuente principal de este vocabulario, traducido y adaptado.
- [AI Coding Dictionary](https://aicodingdictionary.com) — sitio web del repositorio anterior.
- [Best practices for Claude Code — Docs](https://code.claude.com/docs/en/best-practices) — definiciones operativas oficiales de Anthropic.
- [Claude Code & Agent Memory — orchestrator.dev](https://orchestrator.dev/blog/2026-04-06--claude-code-agent-memory-2026/) — las 4 capas de memoria y los umbrales de compaction.
- [LLM Context Window Comparison — Morph](https://www.morphllm.com/llm-context-window-comparison) — contexto nominal vs. efectivo, costos.

---

> **Cierre del módulo:** si solo te quedas con una idea, que sea esta — *nombrar con precisión es el primer acto de ingeniería*. El resto del curso es cómo actuar con precisión una vez que sabes nombrar lo que pasa.