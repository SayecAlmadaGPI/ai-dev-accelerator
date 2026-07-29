<!--
  references/llm-mecanica.md — Lectura de apoyo (sección Referencias)
  -------------------------------------------------------------------
  Documento conceptual que aterriza el funcionamiento de una LLM desde
  first principles y lo entrelaza con el contenido del curso (M0-M10).

  No es un módulo ni un lab: es una lectura de referencia que explica el
  *por qué* detrás del vocabulario del M0 y la tesis del M1. El sitio lo
  publica en /references/llm-mecanica/ vía copy-on-build.

  Español neutro, forma tú, sin voseo.
-->

# Cómo funciona una LLM y por qué el harness es tu trabajo

> **Tesis:** una LLM predice el siguiente token. El razonamiento no es un
> módulo añadido: es esa misma predicción, desplegada en el tiempo, sobre
> pesos que el entrenamiento forzó a modelar el mundo. Y la atención —el
> mismo mecanismo que da ese poder— impone los dos límites que el curso
> nombra en el M0 (context window, attention degradation). El harness
> existe para gestionar esos límites. Este documento conecta el mecanismo
> con cada práctica del curso.

> Lectura de apoyo para el M0 (vocabulario) y el M1 (mentalidad de
> harness). No reemplaza a esos módulos; explica el *por qué* de sus
> conceptos desde first principles.

---

## 1. El mecanismo base: una pasada = un quantum de cómputo

Una LLM es un transformer que, dado un contexto (una secuencia de
tokens), produce una distribución de probabilidad sobre el vocabulario
para el **siguiente token**. Muestreas uno, lo agregas al contexto, y
repites. Eso es todo el bucle de generación.

Lo decisivo: **cada predicción de token es UNA pasada hacia adelante del
modelo** — una cantidad fija de cómputo (capas × parámetros activados).
El modelo no puede "pensar más" dentro de una pasada; su profundidad y
su ancho son finitos. Entonces:

> Cómputo total que el modelo puede gastar en un problema =
> (cómpito por pasada) × (número de pasadas).

La única forma de gastar más cómputo es consumir más pasadas, es decir,
generar más tokens intermedios antes del token de la respuesta.

**Vocabulario del M0 que vive acá:** token, inference, next-token
prediction, non-determinism, context window, turn.

---

## 2. No es "teclado predictivo con más datos": el salto es la arquitectura

El teclado predictivo del teléfono y la LLM comparten el *objetivo*
(predecir el siguiente token). No comparten la *arquitectura*:

- **El teclado usa n-gramas:** cuenta qué token suele seguir a qué
  secuencia de N tokens. Solo ve los últimos N tokens; sin estructura,
  sin composición.
- **La LLM usa un transformer con self-attention:** cada token puede
  atender a *cualquier* token del contexto (no solo a los últimos), y las
  capas componen funciones sobre esas atenciones. Eso permite
  dependencias de largo alcance y estructura anidada.

> "Más datos sobre un n-grama" no te da razonamiento: solo agranda una
> tabla de co-ocurrencias. La atención es lo que rompe el límite "solo
> veo los últimos tokens" y deja que el cómputo componga. Escalar la
> arquitectura equivocada es agrandar un diccionario; escalar la correcta
> cruza umbrales de capacidad.

### La intuición del "contenido", afilada

No es que al modelo se le entrene "contenido" aparte del lenguaje. El
objetivo sigue siendo uno solo: predecir el siguiente token. Lo que pasa
es que, para predecir bien sobre un corpus que incluye código,
matemática y razonamientos multi-paso, **la única forma de lograrlo es
construir representaciones internas que modelen el mundo, no solo la
superficie del lenguaje**.

Ejemplo (esquema Winograd): *"El trofeo no cabía en la maleta marrón
porque era demasiado ____."* ¿"grande" (maleta) o "pequeño" (trofeo)?
Para acertar, el modelo tiene que modelar la situación física, no
estadística de bigramas. La predicción correcta fuerza un modelo del
mundo dentro de los pesos. Multiplícalo por billones de ejemplos y
obtienes que la misma señal "predice el siguiente token" termina
comprimiendo, sin que se lo pidas, estructura de razonamiento.

---

## 3. Las dos piernas que faltan: escala y post-entrenamiento

1. **Escala conjunta** (parámetros + datos + cómputo), no solo datos. Más
   datos sobre un modelo chico no cruzan el umbral; el cruce de
   capacidades pasa con los tres creciendo juntos.
2. **Post-entrenamiento (RLHF / instruction tuning).** Al modelo base (que
   solo predice texto) se le afina con reinforcement learning sobre
   preferencias humanas para que siga instrucciones, sea útil y rechace
   daño. Esto moldea el *comportamiento*, no la capacidad de predicción.

**M0 / M9:** el "esfuerzo" (effort), el prefix cache, el cost-per-quality
y la comparativa de modelos viven en este nivel.

---

## 4. Cómo "razona" algo que predice tokens: desplegar el cómputo en el tiempo

Un problema que no entra en una pasada (sumar dos números de 12 dígitos,
deducir quién quedó con el sombrero) no se resuelve "de golpe". Se
resuelve porque el modelo **genera su propio estado intermedio**:
escribe el razonamiento y después lo "lee" como parte de su contexto.
Esto es **Chain-of-Thought (CoT)**.

- **Razonamiento paramétrico (una pasada):** hecho o patrón simple que
  entra en un forward pass. "Capital de Francia."
- **Razonamiento procedural (muchas pasadas):** lo que no cabe en una
  pasada y hay que desplegar en pasos. Transitividad con items
  arbitrarios: el modelo no te la garantiza en una sola pasada; la
  encadena escribiéndola.

"Piensa paso a paso" funciona por una razón mecánica: le das al modelo
más pasadas (más cómputo) para descomponer el problema.

### Tipos de flujo de razonamiento (flujos, no arquitecturas)

1. **Directo / single-pass** — una pasada → respuesta. Chat model
   clásico.
2. **Chain-of-Thought explícito** — pasos visibles antes de la respuesta.
   Más cómputo, mejor en multi-paso.
3. **Self-correction / crítica** — genera, se revisa, corrige. Bucle
   generar → revisar.
4. **Decomposición / planning** — parte el problema en sub-tareas, las
   resuelve y combina. **Acá vive el SDD del M2: spec → plan → tasks →
   ejecutar.**
5. **Test-time search** — genera varias ramas (best-of-N,
   tree-of-thoughts), las puntúa con un verificador y elige la mejor.
6. **Agéntico / con tools** — el modelo emite una llamada a una
   herramienta (calculadora, código, búsqueda, DB), recibe un resultado
   exacto y continúa. El razonamiento se extiende fuera del modelo; el
   cómputo exacto lo hace un entorno determinista. **Esto es el MCP del
   M5 y los sensores del M6.**

---

## 5. Lo que sí cambia de arquitectura

- **Mixture-of-Experts (MoE):** misma generación autoregresiva, pero un
  *router* activa solo unos pocos expertos por token. Mismo costo por
  token, más parámetros totales → más capacidad por FLOP. No es "más
  razonamiento"; es "más conocimiento por token al mismo precio". (M9.)
- **Modelos de razonamiento (estilo o1 / R1):** la arquitectura sigue
  siendo transformer. Cambia (a) el entrenamiento con RL sobre trazas
  largas y *recompensas verificables* (RLVR), y (b) el flujo de
  inferencia: un CoT largo y oculto con backtrack y auto-verificación.
  Aprendieron a gastar muchas más pasadas bien dirigidas. El "reasoning"
  es una *política de generación* entrenada, no un módulo.
- **Sistemas híbridos:** acoplan un solver simbólico o un ejecutor de
  código (PAL). El LLM "razona" traduciendo a código; el cómputo exacto
  lo hace el runtime.

---

## 6. La atención es el mecanismo Y los dos límites (M0)

Atención = **softmax ponderada sobre todos los tokens del contexto**.
Para cada token que el modelo va a producir, calcula un peso (entre 0 y
1, que suma 1) sobre cada token anterior y arma una combinación.

Dos propiedades del softmax que son la clave:

1. **Es de suma fija (zero-sum).** Si hay 100 tokens, los pesos suman 1.
   Si hay 10 000, también. No crece con el contexto.
2. **Es O(n²) en cómputo y O(n) en memoria** (KV cache): cada par de
   tokens interactúa.

### Límite 1 — Context window (límite exterior, duro)

- **Entrenamiento:** el modelo aprende a operar sobre secuencias de
  hasta longitud N. Más allá, las posiciones no tienen comportamiento
  aprendido → la atención se vuelve ruido.
- **Cómputo / memoria:** atención O(n²) y KV cache O(n). Duplicar el
  contexto ≈ cuadruplicar el cómputo de atención. El techo nominal
  también es el punto donde la infraestructura deja de pagar.

### Límite 2 — Attention degradation / context rot (límite interior, blando)

Aunque estés dentro de la ventana nominal, la calidad cae a medida que
la llenas. La causa es la propiedad zero-sum:

- Cada token nuevo es un *distractor* que compite por la masa de
  atención. La masa relevante se diluye: la relación señal/ruido cae con
  el tamaño.
- **Lost-in-the-middle:** los datos de entrenamiento concentran lo
  relevante al inicio y al final (primacía / recencia); el modelo aprende
  a atender más a los extremos. El medio de un contexto largo se
  "olvida" aunque esté dentro de la ventana.
- **Smart zone → dumb zone:** existe una zona dulce donde el contexto es
  rico pero la señal domina al ruido. Pasado ese umbral, agregar
  contexto *empeora*: el ruido diluido vence a la señal. Más datos, peor.

| | n-grama | transformer |
|---|---|---|
| Ventana | chica y local | grande y global |
| Composición | no puede | sí (el poder) |
| Dilución del softmax | no (no ve lejos) | sí, crece con n (el costo) |
| Límite | solo exterior (ventana) | exterior (context window) **+** interior (attention degradation) |

> Los dos límites del M0 son el precio de un solo beneficio. El context
> window es "no puedo atender más allá de N". Attention degradation es
> "aunque pueda, la masa se diluye al llenar la ventana". Mismo softmax,
> dos modos de fallar.

---

## 7. El entrelazado: por qué esto justifica el kit del curso

Cada práctica del curso es respuesta directa a una propiedad del
mecanismo. Esta tabla es el mapa "mecanismo → falla → dónde lo aborda el
curso":

| Propiedad del mecanismo | Falla que produce | Práctica del curso que la aborda |
|---|---|---|
| El razonamiento se despliega en el tiempo sobre tokens autogenerados, sin garantía de verdad | Coherente pero falso (alucinación) | M2 (spec como contrato), M6 (sensores deterministas, DONE/VERIFIED), M5 (tools que hacen cómputo exacto) |
| La atención se diluye al crecer el contexto (zero-sum) | Context rot, lost-in-the-middle, dumb zone | M4 (compaction como higiene de atención), M3 (progressive disclosure / context pointers), M1/M4 (subagents con contexto fresco) |
| Hay un techo duro de ventana (O(n²), entrenamiento) | Estado que no cabe o se pierde entre sesiones | M4 (handoffs, system of record), M1 (el repo como system of record), M2 (`.planning/`) |
| El cómputo se acorta con budget (max tokens, effort bajo) | "Declara victoria antes de tiempo", razonamiento truncado | M6 (DONE/VERIFIED), M7 (failure modes), M9 (cost-per-quality, tiered routing) |
| El modelo es no determinista | Misma entrada, distinto resultado | M6 (sensores computacionales, no inferenciales), M10 (governance determinista), M9 (prueba ciega) |
| Aprendió la *forma* de las llamadas, no el anclaje | Alucinación de API, mal uso de tools | M5 (MCP con schemas claros), M7 (taxonomía de fallas), M6 (verificación tool-grounded) |
| Sycophancy: el siguiente token más probable dado una sugerencia muchas veces es "sí" | Valida tu idea equivocada | M0 (vocabulario), M1 (reviewer con contexto fresco), M6 (revisión adversarial) |
| El modelo no tiene estado entre sesiones (stateless) | "Aprendió" el codebase y al cerrar se pierde | M1 (system of record), M4 (handoff artifact), M3 (memoria en 4 capas) |
| Razonamiento models / MoE / multi-proveedor cambian capacidad y costo, no el mecanismo | Hype de "modelo nuevo" sin evidencia en tu dominio | M9 (evaluación de releases, prueba ciega, cost-per-quality); cheatsheet de selección de tooling (OpenCode/Pi, BYO modelo) |

> La consecuencia para el harness (M1): el razonamiento de la LLM es
> *procedural sobre tokens autogenerados*, sin garantía de verdad, y
> degrada de forma predecible con el tamaño del contexto. Lo que el
> harness aporta —sensores deterministas, verificación, tools que hacen
> cómputo exacto, permisos, compaction, subagents— es exactamente lo que
> el modelo no puede hacer solo con predicción de tokens: cerrar el loop
> contra la realidad y mantenerse en la smart zone.

---

## 8. Síntesis en una frase

El siguiente-token es el *bucle*; el razonamiento es la *estructura de
la distribución condicional* que el entrenamiento grabó en los pesos,
*desplegada en el tiempo* al encadenar pasadas; y la atención es el
*mecanismo que da el poder y los dos límites del M0*. El harness existe
porque ese mismo mecanismo, sin anclaje a la realidad y con degradación
predecible, necesita un entorno determinista que lo verifique, lo limite
y le mantenga la densidad de señal.

---

> **Lecturas relacionadas:**
> [M0 — Lenguaje Operativo](../modules/00-lenguaje-operativo.md),
> [M1 — Mentalidad de Harness](../modules/01-mentalidad-harness.md),
> [M2 — Spec-Driven Development](../modules/02-spec-plan-execute.md),
> [M3 — Workbench](../modules/03-workbench.md),
> [M4 — Handoffs](../modules/04-handoffs.md),
> [M5 — Herramientas y MCP](../modules/05-herramientas-mcp.md),
> [M6 — Verificación](../modules/06-verificacion.md),
> [M7 — Failure Modes](../modules/07-failure-modes.md),
> [M9 — Evaluación de Modelos](../modules/09-evaluacion-modelos.md).