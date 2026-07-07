# Módulo 9 — Evaluación de Modelos y Navegación del Ecosistema ★ NUEVO

> **Tesis:** los modelos cambian cada trimestre; la habilidad de leer un
> release sin hype no. Saber distinguir "gana en SWE-bench" de "sirve
> para TU tarea", entender por qué un benchmark publicitario puede ser
> engañoso, y tener un protocolo para probar un modelo en tu dominio
> antes de adoptarlo, es lo que te mantiene productivo cuando el
> ecosistema se mueva bajo tus pies.

---

## 9.0 Por qué este módulo existe

El resto del curso asume que ya tienes un modelo y un agente. Este
módulo va un paso antes: cómo eliges el modelo, cómo lees los benchmarks
que lo promocionan, y cómo decides si un release nuevo merece que
cambies. Es distinto a los demás módulos porque no es sobre el harness,
es sobre el *motor* del harness.

> **La regla del M9:** el benchmark más importante no es el de la
> landing page, es tu billetera y tu dominio. Un modelo que gana en
> SWE-bench-Verified puede ser peor que el anterior *para tu codebase
> específico*; solo lo sabes probándolo en tu tarea, no en la suya.

---

## 9.1 Tipos de modelos y arquitecturas

Antes de evaluar, entiende qué estás evaluando. La forma del modelo
afecta costo, latencia, y dónde desplegarlo.

### 9.1.1 Dense vs. MoE (Mixture of Experts)

| | Dense | MoE |
|---|-------|-----|
| **Qué hace** | Todos los parámetros activos por cada token. | Divide en "expertos"; un *router* activa unos pocos por token. |
| **Parámetros totales** | = parámetros activos. | ≫ parámetros activos (p.ej. 8×7B tiene 47B totales, ~13B activos). |
| **Costo por token** | Proporcional al tamaño total. | Proporcional a los activos, no a los totales. |
| **Trade-off** | Simple, predecible, más caro en grande. | Más capacidad por dólar, pero más complejo de desplegar. |

> Para fines prácticos: un MoE te da "calidad de modelo grande" a "costo
> de modelo más chico" en inferencia, a costa de mayor uso de memoria
> (los expertos todos cargados) y complejidad de despliegue. Si usas
> API, no lo notas; si despliegas en local, sí.

### 9.1.2 Token-choice vs. expert-choice routing (MoE interno)

- **Token-choice:** cada token *elige* qué expertos activar. Simple,
  pero puede desbalancear (algunos expertos saturan, otros mueren de
  hambre → *expert collapse*).
- **Expert-choice:** cada experto *elige* qué tokens atender. Mejor
  balance de carga, más complejo de entrenar.

> No necesitas esto para usar un MoE; lo necesitas para entender por qué
> dos MoE del mismo tamaño rinden distinto: el routing importa tanto
> como los expertos.

### 9.1.3 Otras dimensiones que importan para elegir

- **Open-weight vs. API-only:** open-weight (puedes correrlo local,
> controlar datos, auditar) vs. API (mejor calidad, sin control del
> entorno, costo por token). Local-first (Ollama, llama.cpp) es la
> opción en entornos regulados.
- **Multimodal vs. text-only:** ¿necesita leer imágenes/diagramas del
> repo? Si tu harness no toca visuales, text-only basta y es más
> barato.
- **Reasoning vs. chat:** los *reasoning models* (extienden el tiempo de
> pensamiento, p.ej. o-series) rinden mejor en planificación y
> razonamiento difícil, pero cuestan más y tardan más. Para tareas
> mecánicas, un chat model es suficiente y más rápido.

> Ver §9.7 para la tabla comparativa viva.

---

## 9.2 Qué es un benchmark y qué mide

Un benchmark no mide "qué tan bueno es el modelo"; mide "qué tan bien
hace *esta tarea específica*". La confusión nace de tomar una tarea
específica como representativa de todas.

### 9.2.1 Por nivel de abstracción

| Nivel | Qué mide | Ejemplos | Utilidad para coding agents |
|-------|----------|----------|------------------------------|
| **Function-level** | Una función aislada, input → output. | HumanEval, HumanEval+, MBPP, MBPP+, BigCodeBench. | Baja: pocas tareas reales son "una función suelta". |
| **Repository-level** | Un issue real de un repo, multi-archivo. | SWE-bench (original, Verified, Lite, Multimodal, Live, Pro). | Alta: aproxima el trabajo real del agente. |
| **Contests** | Problemas algorítmicos con respuesta correcta. | LiveCodeBench, Codeforces-scale. | Media: mide razonamiento algorítmico, no ingeniería. |
| **Agent-oriented** | Tareas que requieren actuar en un entorno. | SWE-bench, Terminal-Bench, AgentBench, GAIA. | Alta: el agente debe decidir y ejecutar, no solo responder. |
| **Reasoning** | Conocimiento/raciocinio general. | MMLU (saturado), GPQA Diamond, AIME, HLE. | Baja para coding; proxy de razonamiento, no de ingeniería. |
| **Arena / ELO** | Preferencia humana en duelos. | LMArena, Chatbot Arena. | Subjetiva; útil como termómetro, no como decisión. |

> **La lección:** para elegir un agente de código, lo que importa es
> SWE-bench (repo-level) y los agent-oriented. HumanEval te dice si el
> modelo sabe escribir una función; no te dice si sabe navegar tu repo.

### 9.2.2 SWE-bench y sus variantes (la familia que importa)

- **SWE-bench (original):** issues reales de repos open-source de
  Python. Estándar de facto. Pero estático → riesgo de contaminación
  (el modelo pudo ver la solución en entrenamiento).
- **SWE-bench Verified:** subconjunto con verificación humana de que la
  tarea es resoluble y el test es justo. Más confiable que el original,
  pero sigue estático.
- **SWE-bench Lite:** subconjunto más simple y barato de correr. Útil
  para iterar; no para comparar calidad final.
- **SWE-bench Live (Microsoft):** continuo, anti-contaminación (tareas
  posteriores al cutoff de entrenamiento). El más honesto contra
  overfitting.
- **SWE-bench Pro:** tareas enterprise de largo horizonte, más cercanas
  a trabajo real de ingeniería.

> **El dato incómodo:** SWE-bench-Live muestra ~24% de resolución vs.
> ~70% en Verified. La diferencia no es "el modelo empeoró"; es que
> Live no permite que el modelo haya visto la respuesta. Ese gap es la
> medida real del overfitting a benchmarks estáticos.

---

## 9.3 Cómo leer un leaderboard sin engañarte

Cuatro trampas que un leaderboard publicitario no te cuenta:

### 9.3.1 Data contamination

Si la tarea del benchmark estuvo en el set de entrenamiento del modelo,
> el benchmark mide memorización, no capacidad. Los benchmarks
> estáticos (SWE-bench original, HumanEval) son vulnerables; los *live*
> (posteriores al cutoff) no.

> **Pregunta a hacerte:** ¿la fecha del benchmark es posterior al cutoff
> de entrenamiento del modelo? Si no, desconfía del número.

### 9.3.2 Overfitting a benchmarks

Un modelo puede optimizarse contra un benchmark específico (selección
> de variantes, prompts afinados para esa tarea). El resultado: gana en
> ese benchmark y pierde en tu tarea. SWE-bench-Live vs. Verified (§9.2.2)
> es el ejemplo canónico: el gap de 24% vs. 70% es el overfitting
> hecho número.

### 9.3.3 Cost-per-quality

"Mejor" sin costo es marketing. Un modelo que gana 2 puntos en SWE-bench
> al triple de costo por token puede ser *peor* para tu caso de uso.
> El benchmark que más te conviene mirar es cost-per-quality: cuánto
> cuesta resolver TU tarea a nivel aceptable.

### 9.3.4 Context window real vs. nominal

"Ventana de 1M tokens" no significa "calidad sostenida en 1M tokens". A
> partir de cierto punto aparece *lost-in-the-middle* (la atención decae
> en el medio de la ventana) y *context rot* (M4 §4.1.3). La ventana
> nominal es marketing; la ventana *útil* es la que sostiene calidad, y
> suele ser bastante menor.

> Ver `templates/model-comparison-cheatsheet.md` para la tabla viva con
> costos y ventanas útiles.

---

## 9.4 Cómo evaluar un nuevo release

El protocolo, no la intuición.

### 9.4.1 Las 10 preguntas antes de adoptar

1. **¿Resuelve el release un problema que TÚ tienes?** (No "gana en
   X"; "mejora en la dimensión que me duele".)
2. **¿El benchmark que cita es posterior al cutoff del modelo?** (Si no,
   desconfía.)
3. **¿Es repo-level / agent-oriented, o solo function-level?** (Lo
   primero importa; lo segundo es marketing.)
4. **¿El costo por token sube, baja o es igual?** (Calcula cost-per-quality
   para tu volumen.)
5. **¿La ventana útil (no nominal) cambia?** (¿Mantiene calidad en
   rangos largos o solo anuncia 1M?)
6. **¿Mantiene compatibilidad con tu harness?** (API, tool calling,
   streaming, caching. Romper una de estas te cuesta rework.)
7. **¿Qué pierdes del modelo actual?** (Cambiar por arriba en X puede
   ser abajo en Y que necesitas.)
8. **¿Hay rollback?** (Si el nuevo empeora tu dominio, ¿puedes volver en
   un comando?)
9. **¿Cuál es la señal mínima de adopción?** (No "es mejor"; "resuelve
   N de mis tareas reales mejor que el actual en una prueba ciega".)
10. **¿Es momento de cambiar?** (¿El delta justifica la fricción del
    cambio, o esperas al próximo release?)

> Ver `templates/10-preguntas-antes-adoptar.md`.

### 9.4.2 Probar en tu dominio, no en el genérico

El paso que la mayoría salta. Toma 5-10 tareas *reales* de tu codebase
> (un bug fix, una feature, un refactor) y córrelas a ciegas con el
> modelo actual y el nuevo, sin saber cuál es cuál al evaluar. El que
> gane en *tus* tareas merece adopción; el que gana en SWE-bench pero
> pierde en tus tareas no.

> Ver `templates/benchmark-your-task.py` como esqueleto para esta prueba.

### 9.4.3 Comparativa de herramientas (no solo de modelos)

El modelo es la mitad; la tool (Claude Code, Cursor, Codex, Aider,
Copilot) es la otra. La comparativa relevante no es "qué modelo" sino
"qué combinación modelo+harness". Un modelo superior en un harness
flojo puede rendir menos que uno inferior en un harness afilado (M1:
agent = model + harness).

| Dimensión | Qué comparar |
|-----------|--------------|
| Harness inner | Hooks, skills, subagents, permisos (M3). |
| Modelo por defecto | ¿Puedes cambiarlo? ¿Tiered routing? |
| MCP support | §9 con M5. |
| Cost model | Por sesión, por token, suscripción. |
| Lock-in | ¿Tu harness portable sobrevive al cambio? (M3 §3.9). |

> El error clásico: comparar modelos aisladamente cuando vas a usarlos
> *dentro* de un harness. Compara combinaciones.

### 9.4.4 Cuándo cambiar de modelo: heurísticas

- **Cambia si:** el nuevo resuelve tus tareas reales mejor *a ciegas* Y
  el cost-per-quality no empeora Y hay rollback fácil.
- **No cambies si:** el único argumento es "gana en X benchmark" sin
  prueba en tu dominio.
- **Espera si:** el release es muy nuevo (semana 1). Deja que otros
> encuentren las regresiones; el costo de ser early adopter a veces
> supera el beneficio.

---

## 9.5 Context windows, pricing y caching

El lado económico del ecosistema.

### 9.5.1 Costo por 1M tokens (lo que de verdad pagas)

- **Input, output, cached** son tres precios distintos. El output suele
  ser 3-5× el input; el cached (prompt caching) es una fracción del
  input. Para sesiones largas, el caching es el ahorro más grande.
- **Ventana llena ≠ costo lineal.** Llegar a 1M tokens sostenidos cuesta
  más que 4 sesiones de 250K, porque el costo por turno es cuadrático en
  contexto (M4 §4.1.2).

### 9.5.2 RAG vs. long-context

- **Long-context:** meter todo en la ventana. Simple, pero caro y
  sujeto a lost-in-the-middle.
- **RAG:** recuperar solo lo relevante. Más barato en inferencia, pero
  añade pipeline de recuperación y puede perder lo que no recuperó.

> Regla práctica: long-context para exploración y sesiones donde no
> sabes qué buscarás; RAG para lookup repetitivo sobre un corpus grande
> y estable. No son mutuamente excluyentes; combínalos.

### 9.5.3 Tiered model routing

Usa modelos baratos para lo barato y caros para lo caro:

- **Barato (chat, rápido):** resúmenes, clasificación, extracción,
  búsqueda. La mayoría del volumen.
- **Caro (reasoning):** planificación, decisiones difíciles, debugging
  complejo. Poco volumen, mucho valor.

> Un harness que enruta todo al modelo más caro desperdicia la mayoría
> del budget en tareas que un modelo barato haría igual. El routing es
> FinOps aplicado a agentes.

---

## 9.6 MoE en profundidad (para quien quiere entender la arquitectura)

Para quienes quieren ir más allá de "es más eficiente", los mecanismos:

- **Gating network:** la red que decide qué expertos activar para cada
  token. Su calidad determina la del MoE.
- **Load balancing:** mantener a los expertos ocupados parejo. Sin él,
  unos saturan y otros mueren.
- **Expert collapse:** expertos que casi nunca se activan, desperdiciando
  parámetros. Problema conocido de MoE mal entrenados.
- **Modelos MoE notables:** DeepSeek-V3/R1, Mixtral, Qwen-MoE, GPT-oss.
  Cada uno con distinto routing y balance.

> **Beneficios:** más capacidad por dólar en inferencia, mejor
> especialización. **Desafíos:** más memoria (todos los expertos
> cargados), despliegue más complejo, sensibilidad al routing. Para uso
> vía API, el proveedor absorbe los desafíos; para despliegue local,
> te los encuentras.

---

## 9.7 Niveles de adopción

### Mínimo

- Saber distinguir function-level de repo-level y por qué el segundo
  importa más para agentes.
- Antes de adoptar un release: las 10 preguntas (§9.4.1), al menos las
  4 primeras.
- Mirar cost-per-quality, no solo "gana en X".

### Medio

- Prueba ciega en tu dominio con `benchmark-your-task.py` antes de
  adoptar.
- Tiered routing: modelo barato para tareas baratas, caro para caras.
- Leer SWE-bench-Live (no solo Verified) como termómetro honesto.

### Completo

- Tabla viva de modelos (calidad, costo, ventana útil, cutoff) que
  actualizas cada release.
- Dual-run de modelos en paralelo (igual que dual-run de migraciones,
  §8.6) para detectar regresiones de calidad antes de migrar a todos.
- Política de "esperar N semanas" tras un release para que la comunidad
  detecte regresiones antes que tú.

---

## 9.8 FAQ — trampas reales

**¿Creo en "gana en SWE-bench"?** Como punto de partida, sí; como
decisión, no. SWE-bench-Verified puede estar contaminado; mira Live.
Sobre todo, prueba en tu dominio.

**¿Ventana de 1M?** Es nominal. La útil (la que sostiene calidad) suele
ser bastante menor. Mid-lost-in-the-middle y context rot. No la tomes
como capacidad real.

**¿Cambiar de modelo cada release?** No. El delta rara vez justifica la
ficción del cambio. Cambia cuando una prueba ciega en tu dominio lo
justifica, no cuando el release lo anuncia.

**¿Reasoning model siempre mejor?** No. Cuestan más y tardan más. Para
tareas mecánicas, un chat model es suficiente y más rápido. Reserva
reasoning para planificación y razonamiento difícil.

**¿MoE vs. Dense para mi caso?** Si usas API, no decides; el proveedor
sí. Si despliegas local, dense es más simple; MoE da más calidad por
dólar pero más complejidad. Para entornos regulados local-first,
> empieza por dense.

**¿Compara modelos o harness?** Compara *combinaciones*. Un modelo
superior en harness flojo rinde menos que uno inferior en harness
afilado (M1).

---

## 9.9 Referencias

- **SWE-bench — Princeton NLP**
  (https://github.com/princeton-nlp/SWE-bench/) — benchmark estándar de
  repo-level.
- **SWE-bench-Live — Microsoft**
  (https://github.com/Microsoft/SWE-bench-Live) — benchmark continuo,
  anti-contaminación.
- **SWE-Bench Pro** (https://arxiv.org/html/2509.16941) — tareas
  enterprise de largo horizonte.
- **LiveCodeBench** (https://livecodebench.github.io/) — benchmark
  continuo de algoritmos.
- **HumanEval / MBPP — Análisis 2025**
  (https://doi.org/10.48550/arxiv.2511.04355) — "Where Do LLMs Still
  Struggle?"
- **LLM Stats Leaderboard** (https://llm-stats.com/leaderboards/llm-leaderboard)
  — 324 modelos comparados.
- **CodeSOTA Benchmark Leaderboard** (https://www.codesota.com/llm) —
  benchmarks honestos con fecha de medición.
- **Skiln LLM Leaderboard** (https://skiln.co/leaderboard) — 408
  modelos, cost-per-quality.
- **LLMversus Benchmarks** (https://llmversus.com/llm/benchmarks) —
  ELO, MMLU, HumanEval.
- **SWFTE LM Leaderboard** (https://www.swfte.com/ai/lm/leaderboard) —
  Arena Elo + pricing.
- **NVIDIA — Mixture of Experts**
  (https://www.nvidia.com/en-us/glossary/mixture-of-experts/) —
  definición clara de MoE.
- **Hugging Face — MoE Transformers**
  (https://huggingface.co/blog/moe-transformers) — guía práctica de MoE.
- **NVIDIA Technical Blog — MoE in LLM Architectures**
  (https://developer.nvidia.com/blog/applying-mixture-of-experts-in-llm-architectures/) —
  aplicación técnica.
- **A Survey on MoE in LLMs — arXiv**
  (https://arxiv.org/html/2507.11181v1) — survey completo (2025).
- **MoE Survey — Computer Society**
  (https://www.computer.org/csdl/journal/tk/2025/07/10937907/25n2xHILEpG) —
  survey en journal IEEE.
- **Claude Code vs Cursor vs Codex vs Aider — 2026 Head-to-Head**
  (https://www.youngju.dev/blog/culture/2026-05-14-ai-coding-agent-comparison-2026-claude-code-cursor-codex-copilot-openclaw-deep-dive-guide-2026.en) —
  guía de compra práctica.
- **Scrimba — Claude Code vs Codex vs Cursor**
  (https://scrimba.com/articles/claude-code-vs-codex-vs-cursor/) —
  comparativa rápida.
- **Agent Harness Comparison — DEV Community**
  (https://dev.to/arihantdeva/agent-harness-comparison-claude-code-aider-cursor-agent-codex-cli-33n5) —
  comparativa de harness.
- **LLM Context Window Comparison — Morph**
  (https://www.morphllm.com/llm-context-window-comparison) — 20
  modelos, costo por ventana llena.
- **Large Context Window Costs — AI Cost Check**
  (https://aicostcheck.com/blog/large-context-window-costs-2026) —
  precio real de 1M+ tokens.
- **Million-Token Era — LeetLLM**
  (https://leetllm.com/blog/million-token-context-windows) — qué
  cambian las ventanas de 1M.
- **Context Windows & Cost — MyEngineeringPath**
  (https://myengineeringpath.dev/genai-engineer/context-windows/) —
  guía de budgeting de tokens.

**Plantillas vinculadas:** `templates/model-comparison-cheatsheet.md`,
`templates/10-preguntas-antes-adoptar.md`,
`templates/benchmark-your-task.py`.