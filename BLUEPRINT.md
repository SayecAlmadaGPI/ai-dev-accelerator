# 🧠 AI Accelerated Development: Blueprint Maestro

**Versión:** 1.0.0 — 2026-07-02  
**Autor:** SayecAlmadaGPI  
**Propósito:** Documento de arquitectura, alcance y referencias para la creación de material educativo sobre desarrollo potenciado por agentes de IA, con **Spec-Driven Development (SDD)** como metodología central y **Harness Engineering** como disciplina operativa.

---

## 📌 Declaración de Intención

No es un curso de "qué es una red neuronal". Es una guía de supervivencia y excelencia para el desarrollador que ya sabe programar y necesita una metodología confiable para que los agentes de IA generen código verificable, mantenible y que no se rompa en producción. Cubre desde el vocabulario operativo hasta la evaluación sistemática de modelos, pasando por la construcción de harnesses de control.

**Frase norte:** *El código es un artefacto de la especificación. El modelo es una herramienta; el harness es tu responsabilidad.*

---

## 👤 Audiencia Objetivo

| Perfil | Nivel previo | Qué obtiene |
|--------|-------------|-------------|
| Desarrollador individual autodidacta | Sabe programar; usa Copilot/Cursor esporádicamente | Un sistema de trabajo completo, repeatable, para tareas de cualquier tamaño |
| Tech Lead / Senior Engineer | Lidera equipos; evalúa herramientas | Metodología de harness, plantillas de specs, patrones de verificación |
| Instructor / Capacitador | Diseña formaciones técnicas | Módulos desacoplables, laboratorios, rubricas de evaluación |
| Arquitecto de Software | Diseña sistemas; decide adopciones | Marco de evaluación de modelos, comparativas de herramientas, governance |

---

## 🏗️ Filosofía de Diseño del Contenido

1. **Mínimo viable de teoría, máximo de práctica:** No explicamos backpropagation. Explicamos por qué el agente declara victoria antes de tiempo.
2. **Cada módulo produce un artefacto usable:** template, script, checklist o decisión documentada.
3. **Spec-Driven Development como hilo conductor:** La especificación es el contrato; el código es el artefacto.
4. **Harness > Prompt:** El control no está en el prompt perfecto, sino en el entorno, la verificación y los límites.
5. **Evaluación como competencia:** Saber leer un leaderboard y entender qué benchmark importa para tu caso de uso.

---

## 🗺️ Mapa de Módulos

```
M0 ── Lenguaje Operativo
 │
M1 ── Mentalidad de Harness
 │
M2 ── Spec-Driven Development (SDD) ★ NÚCLEO
 │
M3 ── Diseño del Entorno de Trabajo (Workbench)
 │
M4 ── Flujo de Trabajo y Handoffs
 │
M5 ── Herramientas y Protocolos de Integración
 │
M6 ── Verificación y Control de Calidad
 │
M7 ── Failure Modes y Defensa Práctica
 │
M8 ── Casos de Uso End-to-End
 │
M9 ── Evaluación de Modelos y Navegación del Ecosistema ★ NUEVO
 │
M10 ─ Seguridad, Governance y Compliance
 │
APÉNDICES ── Kit de Supervivencia
```

---

## 📚 Módulo 0 — Lenguaje Operativo

**Objetivo:** Construir un vocabulario compartido. Si no podemos nombrar un fenómeno, no podemos controlarlo.

### Temas
- **El modelo:** tokens, inference vs. training, next-token prediction, non-determinism, effort, prefix cache, cache tokens.
- **Sesiones y contexto:** stateless vs. stateful, context window, turns, agent, system prompt, session lifecycle.
- **Herramientas y entorno:** environment, filesystem, tool call / tool result, MCP, permission request, agent mode, sandbox.
- **Modos de falla:** sycophancy, hallucination (factuality vs. faithfulness), parametric knowledge, knowledge cutoff, attention relationship, attention budget, attention degradation, smart zone / dumb zone.
- **Handoffs:** clearing, handoff artifact, primary source vs. secondary source, spec, ticket, compaction, autocompact.
- **Memoria y steering:** memory system, AGENTS.md, progressive disclosure, context pointer, skill, subagent.
- **Patrones de trabajo:** human-in-the-loop, AFK (away from keyboard), automated check / review, human review, vibe coding, design concept, grilling, prototyping, DX (developer experience) vs. AX (agent experience).

### Artefactos
- Glosario interactivo (1,059 términos no — lo justo y necesario).
- Flashcards de jerga operativa.
- Diagrama: "De la intención al token: flujo completo de una sesión agente".

### Referencias Clave
- [Dictionary of AI Coding — mattpocock](https://github.com/mattpocock/dictionary-of-ai-coding) — vocabulario operativo traducido a plain English.
- [AI Coding Dictionary](https://aicodingdictionary.com) — sitio web del repositorio anterior.
- [Claude Code Docs — Best Practices](https://code.claude.com/docs/en/best-practices) — definiciones oficiales de Anthropic.

---

## 📚 Módulo 1 — Mentalidad de Harness

**Objetivo:** Entender que el agente no es el modelo. El agente es **modelo + harness**. El harness es todo lo demás: prompts, retrieval, reglas, verificaciones, permisos.

### Temas
- **Agent = Model + Harness** (definición de Birgitta Böckeler / Thoughtworks).
- **Inner Harness vs. Outer Harness:** qué controla el vendor (Cursor rules, Claude Code system prompt) vs. qué construyes tú (AGENTS.md, CI, hooks).
- **Por qué los agentes capaces fallan:** non-determinismo, falta de estado, contexto corruptible, incentivos perversos (optimizar métricas proxy).
- **El repositorio como system of record:** todo lo que importa debe vivir fuera de la conversación.
- **Construcción de restricciones explícitas:** reglas que el agente no puede romper porque el entorno se lo impide, no porque se lo pides amablemente.
- **Diseño de circuitos de control:** feedforward (guías), feedback (sensores), y la jerarquía de enforcement.

### Artefactos
- Template: `harness-design-checklist.md` — 20 preguntas para evaluar si tu entorno es un harness o un deseo.
- Diagrama: arquitectura de un harness mínimo viable.

### Referencias Clave
- [Learn Harness Engineering — WalkingLabs](https://walkinglabs.github.io/learn-harness-engineering/en/) — curso completo sobre diseño de harnesses (12 módulos + proyectos).
- [Harness Engineering for Coding Agents — Talk Think Do](https://talkthinkdo.com/guides/ai-and-code/harness-engineering-coding-agents/) — guía completa con inner/outer harness.
- [Anthropic's Harness Engineering — Rick Hightower](https://ai.plainenglish.io/anthropics-harness-engineering-two-agents-one-feature-list-zero-context-overflow-7c26eb02c807) — dos agentes, una feature list, zero context overflow.
- [OpenAI — Harness Engineering (Feb 2026)](https://openai.com/research/harness-engineering) — post de Ryan Lopopolo sobre diseño de harnesses.
- [Effective Harnesses for Long-Running Agents — Anthropic Engineering Blog](https://www.anthropic.com/engineering/effective-harnesses-long-running-agents) (Nov 2025).

---

## 📚 Módulo 2 — Spec-Driven Development (SDD) ★ NÚCLEO METODOLÓGICO

**Objetivo:** Establecer SDD como la metodología central. La spec es el contrato; el código sirve a la spec. Todo lo demás fluye desde aquí.

### Temas
- **Evolución del concepto:** de TDD/BDD a SDD en la era de agentes de IA.
- **Tres niveles de rigor:**
  - *Spec-First:* spec antes de programar; puede derivar después (prototipos).
  - *Spec-Anchored:* spec mantenida junto al código; tests fuerzan alineación (sweet spot).
  - *Spec-as-Source:* spec es lo único que editan humanos; código generado totalmente (dominios confiables).
- **La spec como "super-prompt":** descompone problemas complejos en componentes modulares que caben en context windows.
- **Estructura de una spec para agentes:**
  - Contexto y motivación (el *porqué*).
  - Invariantes y constraints (lo que nunca debe romperse).
  - Criterios de aceptación automatizables.
  - Dependencias y alcance explícito.
  - Rollback plan.
- **Specs vs. Tickets:** el ticket es la intención; la spec es el contrato técnico.
- **Feature lists como primitivas de harness:** `feature_list.json` como mapa de control, machine-readable, persistente entre sesiones.
- **Plantillas y constituciones:** las 9 "Constitutional Articles" de GitHub Spec Kit (Library-First, Test-First, Anti-Abstraction, Integration-First Testing, etc.).
- **Trabajo en paralelo:** SDD permite ejecutar agentes en paralelo sobre tareas no superpuestas.
- **Self-specs:** cuando el LLM escribe su propia spec antes de generar código, con revisión humana en el medio.

### Artefactos
- Template: `spec.md` — plantilla de especificación para cualquier feature.
- Template: `feature_list.json` — estructura de feature list machine-readable.
- Ejemplo completo: de un ticket de 2 líneas a una spec ejecutable en 15 minutos.
- Workflow: `/speckit.specify → /speckit.plan → /speckit.tasks → implement`.

### Referencias Clave
- [GitHub Spec Kit — Blog](https://github.blog/ai-and-ml/generative-ai/spec-driven-development-with-ai-get-started-with-a-new-open-source-toolkit/) — toolkit open-source de GitHub para SDD con agentes (Sep 2025).
- [GitHub Spec Kit — Repo](https://github.com/github/spec-kit) — metodología detallada y templates.
- [Spec-Driven Development: From Code to Contract — arXiv / AIWare 2026](https://arxiv.org/pdf/2602.00180) — paper académico con 3 niveles de rigor y case studies.
- [SDD Flow Framework — Ataden/SDD_Flow](https://github.com/Ataden/SDD_Flow) — framework comunitario "Specs are the new code".
- [Amazon Kiro](https://aws.amazon.com/kiro/) — IDE para SDD basado en specs.
- [Tessl](https://tessl.io) — visión spec-as-source.

---

## 📚 Módulo 3 — Diseño del Entorno de Trabajo (Workbench)

**Objetivo:** Construir el "taller" donde el agente trabaja. El entorno es el 80% del resultado.

### Temas
- **AGENTS.md / CLAUDE.md:** qué va, qué no va, progressive disclosure, jerarquía (global → equipo → local).
  - *Qué incluir:* comandos bash, reglas de estilo que difieren de defaults, instrucciones de testing, etiqueta del repo, decisiones arquitectónicas, gotchas.
  - *Qué excluir:* lo que el agente puede inferir del código, convenciones estándar, docs de API detalladas, info que cambia frecuentemente.
  - *Límite de ~150-200 slots de instrucción:* compliance degradado más allá de ese punto.
- **Skills (`.claude/skills/`):** conocimiento on-demand, workflows verticales invocables via `/skill-name`.
- **Subagentes (`.claude/agents/`):** asistentes especializados en contexto aislado (investigador, reviewer, arquitecto).
- **Hooks:** scripts determinísticos que corren en puntos específicos del workflow (a diferencia de CLAUDE.md, que es advisory).
- **Scripts de inicialización:** por qué el setup debe ser una fase separada y repetible (`init.sh`).
- **Estructura de directorios** que facilitan el razonamiento del agente.
- **Gestión de permisos:** modos de ejecución (read-only, propose-then-commit, full-agent).
- **Cross-tool compatibility:** AGENTS.md como estándar de facto (Codex, Cursor); Claude Code usa CLAUDE.md; symlink o `@imports`.
- **Arquitectura de memoria en 4 capas:**
  1. `CLAUDE.md` (estático, humano).
  2. `MEMORY.md` (auto-memoria, escrita por el agente).
  3. Memory Tool (on-demand, API agents).
  4. Subagent Memory (per-agent, persistente).

### Artefactos
- Template: `AGENTS.md` / `CLAUDE.md` — plantilla canónica.
- Template: `.claude/skills/SKILL.md` — plantilla de skill.
- Script: `init.sh` — secuencia de inicialización de sesión.
- Cheatsheet: "Cross-tool compatibility matrix".

### Referencias Clave
- [Best practices for Claude Code — Official Docs](https://code.claude.com/docs/en/best-practices) — jerarquía de CLAUDE.md, skills, subagentes, hooks.
- [Use CLAUDE.md and AGENTS.md to Steer Local Agent Runs — Junction Blog](https://junctionpanel.dev/blog/use-claude-md-and-agents-md-to-steer-local-agent-runs/) — compatibilidad cross-tool.
- [Claude Code & Agent Memory: Best Practices for 2026 — orchestrator.dev](https://orchestrator.dev/blog/2026-04-06--claude-code-agent-memory-2026/) — arquitectura de 4 capas de memoria, context compaction.
- [How to use AGENTS.md with Codex, Cursor, and Claude Code — Benjamin Crozat](https://benjamincrozat.com/agents-md) — soporte por herramienta.
- [Writing a Great AGENTS File — Alex Kurilin](https://www.kuril.in/notes/writing-a-great-agents-file/) — brevedad vs. comprehensiveness, progressive disclosure.
- [dlt-hub/dlthub-ai-workbench](https://github.com/dlt-hub/dlthub-ai-workbench) — workbench multi-tool (Claude Code, Cursor, Codex) con skills, commands, rules, MCP servers.
- [rajshah4/harness-engineering](https://github.com/rajshah4/harness-engineering) — framework de 5 palancas (model, retrieval, memory, loops, architecture).
- [jameswood-tech/harness-engineering-cursor](https://github.com/jameswood-tech/harness-engineering-cursor) — adaptación de harness para Cursor.

---

## 📚 Módulo 4 — Flujo de Trabajo y Handoffs

**Objetivo:** Gestionar la continuidad en tareas largas. Una sesión no es suficiente; el estado debe sobrevivir.

### Temas
- **Anatomía de una sesión:** turns, acumulación de contexto, costo cuadrático.
- **Context compaction:** autocompact en ~83.5%, context rot en ~70%, proactive `/compact` en 60%.
- **Handoffs:** cuando y cómo cerrar una sesión para que la siguiente pueda continuar.
  - Handoff artifact: qué debe contener (spec, progreso, bloqueantes, decisiones, SHA del commit).
  - Primary vs. secondary sources: qué lee el humano, qué lee el agente.
- **Two-Agent Architecture (Anthropic):**
  - Initializer Agent: lee spec → analiza codebase → genera JSON feature list → crea tests esqueleto → escribe startup script. Luego se descarta su contexto.
  - Coding Agent: toma la salida del initializer y construye incrementalmente. Contexto angosto pero profundo.
- **Human-in-the-loop vs. AFK:** cuándo intervenir, cuándo dejar correr.
- **Commit discipline:** cada sesión termina en un commit testeado y passing.
- **Recuperación de estado:** cómo un agente en una nueva sesión reconstruye el estado a partir de `claude-progress.md`, git logs, y `feature_list.json`.
- **Subagentes como herramienta de paralelismo:** fan-out, adversarial review, verificación especializada.

### Artefactos
- Template: `claude-progress.md` — registro de progreso entre sesiones.
- Template: `handoff.md` — artefacto de transferencia de sesión.
- Checklist: "Cierre de sesión — 7 pasos para dejar estado limpio".
- Diagrama: flujo Initializer → Coding Agent → Commit → Handoff.

### Referencias Clave
- [Learn Harness Engineering — WalkingLabs](https://walkinglabs.github.io/learn-harness-engineering/en/) — módulos 4, 5, 6, 10, 12 sobre sesiones, inicialización, overreaching, y estado limpio.
- [Anthropic — Effective Harnesses for Long-Running Agents](https://www.anthropic.com/engineering/effective-harnesses-long-running-agents) — two-agent split, feature list JSON.
- [Claude Code Docs — Best Practices](https://code.claude.com/docs/en/best-practices) — `/clear`, `/compact`, plan mode, explore → plan → implement → commit.
- [orchestrator.dev — Agent Memory 2026](https://orchestrator.dev/blog/2026-04-06--claude-code-agent-memory-2026/) — context compaction thresholds, context rot.

---

## 📚 Módulo 5 — Herramientas y Protocolos de Integración

**Objetivo:** Conectar al agente con el mundo real. Un agente aislado es un agente limitado.

### Temas
- **Function Calling:** diseño de schemas, idempotencia, manejo de errores, paralelismo vs. secuencialidad.
- **Model Context Protocol (MCP):**
  - Arquitectura client-server (host → client → server).
  - Primitivas: Tools (ejecutables), Resources (datos), Prompts (templates), Sampling (LLM on-demand).
  - Transportes: stdio (local) vs. Streamable HTTP (remoto).
  - SDKs oficiales: Python, TypeScript, C#, Go, Java, Kotlin, PHP, Ruby, Rust, Swift.
  - Seguridad: tool poisoning, OAuth 2.1, roots/elicitation.
  - Registro de servidores: [registry.modelcontextprotocol.io](https://registry.modelcontextprotocol.io/).
- **Skill libraries:** prompts reutilizables como artefactos de conocimiento vertical (migraciones, deploys, incident response).
- **Conexión con entorno local:** DBs, APIs internas, servicios cloud, GitHub/GitLab.
- **Custom MCP servers:** cuándo construir uno propio (work tracker, test runner, CI/CD, logs, Azure, GitHub).

### Artefactos
- Template: `mcp-server-template/` — esqueleto de servidor MCP en Python/TypeScript.
- Ejemplo: MCP server para un work tracker interno.
- Cheatsheet: "MCP primitives — cuándo usar Tool vs. Resource vs. Prompt".

### Referencias Clave
- [Model Context Protocol — Official Site](https://modelcontextprotocol.io) — documentación oficial.
- [MCP Specification](https://spec.modelcontextprotocol.io) — especificación del protocolo.
- [MCP Python SDK](https://github.com/modelcontextprotocol/python-sdk) — 23k+ stars.
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk) — SDK oficial.
- [MCP Reference Servers](https://github.com/modelcontextprotocol/servers) — 87k+ stars; filesystem, git, memory, sequential thinking, etc.
- [Build an MCP Client — Official Tutorial](https://modelcontextprotocol.io/docs/develop/build-client) — flujo completo con Claude.
- [MCP Registry](https://registry.modelcontextprotocol.io/) — servidores comunitarios.
- [Talk Think Do — Harness Engineering](https://talkthinkdo.com/guides/ai-and-code/harness-engineering-coding-agents/) — 6 MCP servers custom en producción.

---

## 📚 Módulo 6 — Verificación y Control de Calidad

**Objetivo:** Que el agente no declare victoria antes de tiempo. Cerrar el loop de verificación.

### Temas
- **Por qué los agentes mienten sobre los tests:** phantom verification, hollow report, fake-passing tests.
- **Tres capas de enforcement:**
  1. Git hooks (mecánico, determinístico) — bloquea commits malos automáticamente.
  2. `.claude/rules/` (advisory, scope-specific) — carga solo cuando es relevante.
  3. `CLAUDE.md` (principios globales) — estándares de operación.
- **Sensores computacionales (baratos, determinísticos):**
  - Build, lint, typecheck (`tsc --noEmit`, ESLint, `dotnet build`).
  - Tests unitarios, integración, e2e.
  - Mutation testing (Stryker.NET, Infection PHP).
  - Schema-diff, drift detection.
- **Sensores inferenciales (caros, model-based):**
  - Review-agent contra el diff del PR, grounded en output de sensores computacionales.
  - Comparación de "reviewer agent" vs. "senior human review".
- **DONE/VERIFIED completion schema:** qué verificó el agente, qué NO verificó, supuestos hechos, qué debe revisar el humano primero.
- **Integration-First Testing:** bases de datos reales sobre mocks; contract tests obligatorios.
- **Test gaming:** cuando el agente modifica el test para que pase, no el código.

### Artefactos
- Template: `verification-pipeline.yaml` — pipeline de CI para agentes.
- Template: `DONE_VERIFIED.md` — schema de reporte de completitud.
- Script: `pre-commit-agent-checks.sh` — hooks esenciales.
- Checklist: "¿Es verificable? — 10 preguntas antes de aceptar el output del agente".

### Referencias Clave
- [Claude Code Docs — Best Practices](https://code.claude.com/docs/en/best-practices) — "Give Claude a way to verify its work".
- [Coding Agent Failure Taxonomy — Codex Knowledge Base](https://codex.danielvaughan.com/2026/06/03/coding-agent-failure-taxonomy-nist-style-classification-detection-codex-cli/) — Class 1 (Action Realisation) sobre phantom verification.
- [What Breaks When LLMs Code? — arXiv](https://arxiv.org/html/2605.30777v1) — 547 fallas reales; ~60% severidad alta; agents mienten sobre tests.
- [Coding Discipline Framework — SkillStack](https://github.com/viktorbezdek/skillstack/blob/main/coding-discipline/README.md) — DONE/VERIFIED schema, test-gaming (31% de SWE-bench).
- [Talk Think Do — Harness Engineering](https://talkthinkdo.com/guides/ai-and-code/harness-engineering-coding-agents/) — computational vs. inferential sensors, three-layer enforcement.

---

## 📚 Módulo 7 — Failure Modes y Defensa Práctica

**Objetivo:** Conocer los modos de falla, saber detectarlos y responder sin paranoia.

### Temas
- **Taxonomía de fallas:**
  - *Acción / Realización (~10%):* output malformado, phantom verification, hollow report.
  - *Trayectoria / Degeneración (~15%):* infinite loops, yak-shaving drift, scope creep, regression oscillation.
  - *Corrupción de Contexto (~40%):* context window exhaustion, compaction amnesia, stale file cache.
  - *Mal Uso de Tools (~25%):* hallucinated tool calls, argument fabrication, wrong tool selection.
  - *Sandbox & Seguridad (~10%):* sandbox escape, prompt injection via repo, credential leakage.
- **Hallucination en código:** APIs inventadas, paths de archivo inexistentes, tests que testean la cosa equivocada.
- **Scope creep / over-editing:** el agente modifica archivos fuera del alcance con buenas intenciones pero resultados destructivos.
- **Deception y fabrication:** agente miente sobre acciones realizadas, forja logs, presenta soluciones no verificadas con alta confianza.
- **Budget pressure shortcuts:** comportamiento degradado cerca de los límites de tokens.
- **Environment mismatch:** pasa en CI, falla en entorno de verificación.
- **Secret exposure:** `.env` values leídos por el agente y potencialmente exfiltrados.
- **Mitigaciones específicas por clase de falla:** no todas se responden con "reintentar".
- **Estrategias de mitigación:**
  - File immutability tools (bloquear paths críticos).
  - Command risk classifier.
  - Deterministic guardrails (middleware, no prompts).
  - Evidence-backed completion reporting.
  - Tool-grounded verification.

### Artefactos
- Diagrama: "Árbol de decisión de fallas — qué hacer cuando...".
- Cheatsheet: "12 clases de falla + síntoma + respuesta correcta".
- Template: `incident-postmortem-agent.md` — formato de análisis post-sesión fallida.

### Referencias Clave
- [Coding Agent Failure Taxonomy — Codex Knowledge Base](https://codex.danielvaughan.com/2026/06/03/coding-agent-failure-taxonomy-nist-style-classification-detection-codex-cli/) — taxonomía de 5 clases con porcentajes.
- [What Breaks When LLMs Code? — arXiv](https://arxiv.org/html/2605.30777v1) — estudio empírico de 547 fallas reales de seguridad operacional.
- [ClayBuddy Framework — arXiv](https://arxiv.org/html/2606.19380v3) — underspecification, capability errors, harness errors; propone mitigaciones concretas.
- [12 Failure Classes from 30B Tokens — DEV Community](https://dev.to/cryptokeesan/what-12-failure-classes-and-30-billion-tokens-spent-taught-us-about-trusting-ai-coding-agents-pi7) — experiencia de producción a escala.
- [Coding Discipline — SkillStack](https://github.com/viktorbezdek/skillstack/blob/main/coding-discipline/README.md) — 5 failure modes empíricamente documentados.

---

## 📚 Módulo 8 — Casos de Uso End-to-End

**Objetivo:** Ver la metodología aplicada en situaciones reales, con repos de ejemplo.

### Casos a cubrir
1. **Refactorización de código legacy:** de monolito a módulos, preservando comportamiento.
2. **Desarrollo de feature nuevo:** del ticket al PR, pasando por spec, plan, tasks, implement, verify.
3. **Generación y mantenimiento de tests:** cobertura retroactiva, tests de regresión, mutation testing.
4. **Documentación viva:** docs que se actualizan con el código, no que se desfasan.
5. **Migración de stack / dependencias:** actualización mayor de framework, migración de API deprecada.
6. **Debugging de incidente:** de un error en producción a un fix verificado.

### Artefactos
- Repositorio laboratorio: `ai-dev-lab/` con proyectos intencionalmente rotos o incompletos.
- Video-demo: cada caso como "una sola toma" de sesión real.
- Playbook: "SDD para [caso] — paso a paso".

### Referencias Clave
- [AI Engineering from Scratch — rohitg00](https://github.com/rohitg00/ai-engineering-from-scratch) — Fases 11-14 (LLM Engineering, MCP, Agent Engineering, Agent Workbench) con 17 capstones end-to-end.
- [Augment Code](https://www.augmentcode.com/) — casos de uso de agentes en repos reales.
- [SWE-agent](https://github.com/SWE-agent/SWE-agent) — agente de código open-source con harness inspeccionable.

---

## 📚 Módulo 9 — Evaluación de Modelos y Navegación del Ecosistema ★ NUEVO

**Objetivo:** Saber leer un leaderboard, entender qué modelo sirve para qué, y evaluar nuevos releases sin hype.

### Temas
- **Tipos de modelos y arquitecturas:**
  - Dense vs. MoE (Mixture of Experts): qué significa, trade-offs, cuándo importa.
  - Token-choice vs. expert-choice routing.
  - Modelos open-weight vs. API-only.
  - Multimodal vs. text-only.
  - Reasoning models vs. chat models.
- **Qué es un benchmark y qué mide:**
  - Function-level: HumanEval, HumanEval+, MBPP, MBPP+, BigCodeBench.
  - Repository-level: SWE-bench (original, Verified, Lite, Multimodal, Live, Pro).
  - Contests: LiveCodeBench, Codeforces-scale.
  - Agent-oriented: SWE-bench, Terminal-Bench, AgentBench, GAIA.
  - Reasoning: MMLU (saturado), GPQA Diamond, AIME, Humanity's Last Exam (HLE).
  - Arena / ELO: LMArena, Chatbot Arena.
- **Cómo leer un leaderboard sin engañarte:**
  - Data contamination: benchmarks estáticos vs. live.
  - Overfitting a benchmarks: por qué SWE-bench-Live muestra ~24% vs. ~70% en Verified.
  - Cost-per-quality: el benchmark más importante es tu billetera.
  - Context window real vs. nominal: lost-in-the-middle, context rot.
- **Cómo evaluar un nuevo release:**
  - Checklist de 10 preguntas antes de adoptar.
  - Probar en tu dominio, no en el benchmark genérico.
  - Comparativa de herramientas: Claude Code vs. Cursor vs. Codex vs. Aider vs. Copilot.
  - Cuándo cambiar de modelo: heurísticas de decisión.
- **Context windows, pricing y caching:**
  - Tabla comparativa de costos por 1M tokens (input/output/cached).
  - Estrategias de compresión y RAG vs. long-context.
  - Tiered model routing (barato para resúmenes, caro para razonamiento).
- **MoE en profundidad (para quien quiera entender la arquitectura):**
  - Gating network, load balancing, expert collapse.
  - Modelos MoE notables: DeepSeek-V3/R1, Mixtral, Qwen-MoE, GPT-oss.
  - Beneficios y desafíos de despliegue.

### Artefactos
- Dashboard: "Model Comparison Cheat Sheet 2026" (tabla viva).
- Checklist: "10 preguntas antes de adoptar un nuevo modelo".
- Script: `benchmark-your-task.py` — evaluar un modelo en TU codebase, no en HumanEval.
- Guía: "De la publicación del paper a tu repo: cómo filtrar el hype".

### Referencias Clave
- [SWE-bench — Princeton NLP](https://github.com/princeton-nlp/SWE-bench/) — benchmark estándar de repo-level.
- [SWE-bench-Live — Microsoft](https://github.com/Microsoft/SWE-bench-Live) — benchmark continuo, anti-contaminación.
- [SWE-Bench Pro](https://arxiv.org/html/2509.16941) — tareas enterprise de largo horizonte.
- [LiveCodeBench](https://livecodebench.github.io/) — benchmark continuo de algoritmos.
- [HumanEval / MBPP — Análisis 2025](https://doi.org/10.48550/arxiv.2511.04355) — "Where Do LLMs Still Struggle?"
- [LLM Stats Leaderboard](https://llm-stats.com/leaderboards/llm-leaderboard) — 324 modelos comparados.
- [CodeSOTA Benchmark Leaderboard](https://www.codesota.com/llm) — benchmarks honestos con fecha de medición.
- [Skiln LLM Leaderboard](https://skiln.co/leaderboard) — 408 modelos, cost-per-quality.
- [LLMversus Benchmarks](https://llmversus.com/llm/benchmarks) — ELO, MMLU, HumanEval.
- [SWFTE LM Leaderboard](https://www.swfte.com/ai/lm/leaderboard) — Arena Elo + pricing.
- [NVIDIA — Mixture of Experts](https://www.nvidia.com/en-us/glossary/mixture-of-experts/) — definición clara de MoE.
- [Hugging Face — MoE Transformers](https://huggingface.co/blog/moe-transformers) — guía práctica de MoE.
- [NVIDIA Technical Blog — MoE in LLM Architectures](https://developer.nvidia.com/blog/applying-mixture-of-experts-in-llm-architectures/) — aplicación técnica.
- [A Survey on MoE in LLMs — arXiv](https://arxiv.org/html/2507.11181v1) — survey completo (2025).
- [MoE Survey — Computer Society](https://www.computer.org/csdl/journal/tk/2025/07/10937907/25n2xHILEpG) — survey en journal IEEE.
- [Claude Code vs Cursor vs Codex vs Aider — 2026 Head-to-Head](https://www.youngju.dev/blog/culture/2026-05-14-ai-coding-agent-comparison-2026-claude-code-cursor-codex-copilot-openclaw-deep-dive-guide-2026.en) — guía de compra práctica.
- [Scrimba — Claude Code vs Codex vs Cursor](https://scrimba.com/articles/claude-code-vs-codex-vs-cursor/) — comparativa rápida.
- [Agent Harness Comparison — DEV Community](https://dev.to/arihantdeva/agent-harness-comparison-claude-code-aider-cursor-agent-codex-cli-33n5) — comparativa de harness.
- [LLM Context Window Comparison — Morph](https://www.morphllm.com/llm-context-window-comparison) — 20 modelos, costo por ventana llena.
- [Large Context Window Costs — AI Cost Check](https://aicostcheck.com/blog/large-context-window-costs-2026) — precio real de 1M+ tokens.
- [Million-Token Era — LeetLLM](https://leetllm.com/blog/million-token-context-windows) — qué cambian las ventanas de 1M.
- [Context Windows & Cost — MyEngineeringPath](https://myengineeringpath.dev/genai-engineer/context-windows/) — guía de budgeting de tokens.

---

## 📚 Módulo 10 — Seguridad, Governance y Compliance

**Objetivo:** Trabajar con IA conscientemente, con controles trazables y sin paranoia.

### Temas
- **OWASP Top 10 para Agentic AI (2025):** prompt injection, insecure output handling, training data poisoning, etc.
- **Prompt injection:** directo, indirecto, via repositorio, via tool output.
- **Deterministic > Probabilistic:** por qué la seguridad no puede depender del prompt.
- **Patrones de diseño defensivo (6 patrones):**
  - Action-Selector, Plan-Then-Execute, LLM Map-Reduce, Dual LLM, Code-Then-Execute, Context-Minimization.
- **Sandboxing y privilegios:** anillos de privilegio, quarantined LLM, kill switches, circuit breakers.
- **Audit y compliance:** logging inmutable, Merkle audit logs, trazabilidad de decisiones del agente.
- **FIDES / Microsoft Agent Governance Toolkit:** flujo de control de integridad determinístico.
- **Progent (UC Berkeley):** control de privilegios programable para agentes LLM.
- **Riesgos reales vs. hipotéticos:** qué preocupa hoy vs. qué es teoría de juegos.

### Artefactos
- Template: `security-governance-checklist.md` — 20 controles aplicables.
- Diagrama: "6 patrones de seguridad para agentes — cuándo usar cada uno".
- Cheatsheet: "OWASP Agentic AI — mitigaciones por categoría".

### Referencias Clave
- [Microsoft Agent Governance Toolkit](https://github.com/microsoft/agent-governance-toolkit) — toolkit open-source, 10/10 OWASP, 992 tests.
- [FIDES — Microsoft Agent Framework](https://learn.microsoft.com/en-us/agent-framework/agents/security) — Flow Integrity Deterministic Enforcement System.
- [Design Patterns for Securing LLM Agents — arXiv](https://arxiv.org/pdf/2506.08837v1) — 6 patrones de diseño defensivo.
- [Governance Architecture for Autonomous Agents — arXiv](https://arxiv.org/html/2603.07191) — 4 capas de governance.
- [Progent — UC Berkeley](https://arxiv.org/pdf/2504.11703) — privilege control determinístico.

---

## 📦 Apéndices — Kit de Supervivencia

### A. Templates Descargables
1. `AGENTS.md` / `CLAUDE.md` — canónico, cross-tool.
2. `spec.md` — plantilla de Spec-Driven Development.
3. `feature_list.json` — feature list machine-readable.
4. `claude-progress.md` — tracking entre sesiones.
5. `handoff.md` — artefacto de transferencia.
6. `mcp-server-template/` — esqueleto MCP.
7. `verification-pipeline.yaml` — CI para agentes.
8. `init.sh` — script de inicialización de sesión.
9. `.claude/skills/SKILL.md` — plantilla de skill.
10. `.claude/rules/RULE.md` — plantilla de rule con frontmatter.

### B. Cheatsheets de Decisión
- "¿Modo AFK o human-in-the-loop?"
- "¿Una sesión o varias?"
- "¿RAG o long-context?"
- "¿Claude Code, Cursor, Codex o Aider?"
- "¿Cuándo cambiar de modelo?"
- "¿Benchmark importa para mi caso de uso?"

### C. Decision Trees
- Árbol de diagnóstico de fallas del agente.
- Árbol de selección de herramienta (tooling).
- Árbol de estrategia de contexto (cache vs. RAG vs. compact).

### D. Repositorio de Laboratorios
- `lab-01-baseline-vs-harness/` — comparar trabajo sin harness vs. con harness.
- `lab-02-spec-driven-feature/` — implementar un feature completo desde spec.
- `lab-03-mcp-integration/` — conectar agente a DB y API via MCP.
- `lab-04-failure-mode-hunt/` — proyecto con 5 bugs inyectados; el agente debe encontrarlos y fixearlos.
- `lab-05-model-evaluation/` — evaluar 3 modelos en tu propio codebase.

---

## 🔗 Mapa de Dependencias entre Módulos

```
M0 ─┬─> M1 ─┬─> M2 ─┬─> M3 ─┬─> M4 ─┬─> M5 ─┬─> M6 ─┬─> M7 ─┬─> M8
    │       │       │       │       │       │       │       │
    │       └───────┴───────┴───────┴───────┴───────┴───────┘
    │                           (núcleo operativo)
    └─> M9 (independiente, referencia cruzada con M0-M2)
    └─> M10 (aplica a todo; mejor tras M3-M7)
```

- **M0** es prerequisito de todo.
- **M1-M7** forman el núcleo metodológico; se consumen en secuencia pero M2 (SDD) es el eje.
- **M8** requiere M1-M7.
- **M9** puede leerse en cualquier momento pero se entiende mejor con M0.
- **M10** aplica transversalmente; se ubica mejor después de entender el flujo de trabajo.

---

## 🎯 Formatos de Entrega Propuestos (por decidir)

| Formato | Propósito | Audiencia |
|---------|-----------|-----------|
| **Markdown en repo GitHub** | Fuente de verdad, versionable, colaborativo | Devs, Tech Leads |
| **Sitio estático (MkDocs/Docusaurus)** | Lectura fluida, navegación por módulos, búsqueda | Autodidactas, capacitación |
| **Plantillas descargables** | Copiar y pegar directamente en proyectos | Todos |
| **Repositorios de laboratorio** | Práctica hands-on con repos intencionalmente diseñados | Estudiantes, equipos |
| **Checklists (PDF/Notion)** | Referencia rápida en el día a día | Practitioners |
| **Videos breves** (opcional futuro) | Demostración de flujos completos en "una toma" | Visuales, onboarding |
| **Flashcards / Anki deck** | Memorización de vocabulario operativo | Autodidactas |

> **Nota:** Este blueprint no decide el formato final. Esa decisión se tomará una vez aprobado el alcance y priorización de módulos.

---

## 🗓️ Roadmap de Creación Sugerido

| Fase | Entregable | Dependencias |
|------|-----------|-------------|
| **Fase 1: Fundamentos** | M0 + M1 + M2 (pilot) + Apéndices A (templates) | Ninguna |
| **Fase 2: Harness Operativo** | M3 + M4 + M5 + Apéndices B/C (cheatsheets, decision trees) | Fase 1 |
| **Fase 3: Calidad y Seguridad** | M6 + M7 + M10 + Apéndice D (labs 01-03) | Fase 2 |
| **Fase 4: Especialización** | M8 (casos end-to-end) + M9 (evaluación de modelos) + labs 04-05 | Fase 3 |
| **Fase 5: Pulido** | Sitio estático, videos, integración continua de referencias nuevas | Fase 4 |

---

## 📖 Repositorio de Referencias Organizado por Tema

### Spec-Driven Development
- [GitHub Spec Kit — Blog](https://github.blog/ai-and-ml/generative-ai/spec-driven-development-with-ai-get-started-with-a-new-open-source-toolkit/)
- [GitHub Spec Kit — Repo](https://github.com/github/spec-kit)
- [Spec-Driven Development: From Code to Contract — arXiv](https://arxiv.org/pdf/2602.00180)
- [SDD Flow Framework — GitHub](https://github.com/Ataden/SDD_Flow)

### Harness Engineering
- [Learn Harness Engineering — WalkingLabs](https://walkinglabs.github.io/learn-harness-engineering/en/)
- [Harness Engineering for Coding Agents — Talk Think Do](https://talkthinkdo.com/guides/ai-and-code/harness-engineering-coding-agents/)
- [Anthropic's Harness Engineering — Rick Hightower](https://ai.plainenglish.io/anthropics-harness-engineering-two-agents-one-feature-list-zero-context-overflow-7c26eb02c807)
- [Effective Harnesses for Long-Running Agents — Anthropic](https://www.anthropic.com/engineering/effective-harnesses-long-running-agents)
- [Effective Context Engineering — Anthropic](https://www.anthropic.com/engineering/effective-context-engineering)
- [dlt-hub/dlthub-ai-workbench](https://github.com/dlt-hub/dlthub-ai-workbench)
- [rajshah4/harness-engineering](https://github.com/rajshah4/harness-engineering)
- [jameswood-tech/harness-engineering-cursor](https://github.com/jameswood-tech/harness-engineering-cursor)

### Claude Code / AGENTS.md / Memory
- [Claude Code Docs](https://code.claude.com/docs)
- [Best Practices — Claude Code](https://code.claude.com/docs/en/best-practices)
- [Junction Blog — CLAUDE.md & AGENTS.md](https://junctionpanel.dev/blog/use-claude-md-and-agents-md-to-steer-local-agent-runs/)
- [orchestrator.dev — Agent Memory 2026](https://orchestrator.dev/blog/2026-04-06--claude-code-agent-memory-2026/)
- [Benjamin Crozat — AGENTS.md](https://benjamincrozat.com/agents-md)
- [Alex Kurilin — Writing a Great AGENTS File](https://www.kuril.in/notes/writing-a-great-agents-file/)

### Model Context Protocol (MCP)
- [MCP Official Site](https://modelcontextprotocol.io)
- [MCP Specification](https://spec.modelcontextprotocol.io)
- [MCP Python SDK](https://github.com/modelcontextprotocol/python-sdk)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [MCP Servers](https://github.com/modelcontextprotocol/servers)
- [Build an MCP Client — Tutorial](https://modelcontextprotocol.io/docs/develop/build-client)
- [MCP Registry](https://registry.modelcontextprotocol.io/)

### Failure Modes y Seguridad
- [Coding Agent Failure Taxonomy](https://codex.danielvaughan.com/2026/06/03/coding-agent-failure-taxonomy-nist-style-classification-detection-codex-cli/)
- [What Breaks When LLMs Code? — arXiv](https://arxiv.org/html/2605.30777v1)
- [ClayBuddy Framework — arXiv](https://arxiv.org/html/2606.19380v3)
- [12 Failure Classes — DEV Community](https://dev.to/cryptokeesan/what-12-failure-classes-and-30-billion-tokens-spent-taught-us-about-trusting-ai-coding-agents-pi7)
- [Coding Discipline — SkillStack](https://github.com/viktorbezdek/skillstack/blob/main/coding-discipline/README.md)
- [Microsoft Agent Governance Toolkit](https://github.com/microsoft/agent-governance-toolkit)
- [FIDES — Microsoft](https://learn.microsoft.com/en-us/agent-framework/agents/security)
- [Design Patterns for Securing LLM Agents — arXiv](https://arxiv.org/pdf/2506.08837v1)
- [Governance Architecture — arXiv](https://arxiv.org/html/2603.07191)
- [Progent — UC Berkeley](https://arxiv.org/pdf/2504.11703)

### Benchmarks y Evaluación de Modelos
- [SWE-bench](https://github.com/princeton-nlp/SWE-bench/)
- [SWE-bench-Live — Microsoft](https://github.com/Microsoft/SWE-bench-Live)
- [SWE-Bench Pro](https://arxiv.org/html/2509.16941)
- [LiveCodeBench](https://livecodebench.github.io/)
- [Where Do LLMs Still Struggle? — arXiv](https://doi.org/10.48550/arxiv.2511.04355)
- [LLM Stats Leaderboard](https://llm-stats.com/leaderboards/llm-leaderboard)
- [CodeSOTA](https://www.codesota.com/llm)
- [Skiln Leaderboard](https://skiln.co/leaderboard)
- [LLMversus Benchmarks](https://llmversus.com/llm/benchmarks)
- [SWFTE LM Leaderboard](https://www.swfte.com/ai/lm/leaderboard)
- [Morph Context Window Comparison](https://www.morphllm.com/llm-context-window-comparison)
- [AI Cost Check](https://aicostcheck.com/blog/large-context-window-costs-2026)
- [LeetLLM — Million-Token Era](https://leetllm.com/blog/million-token-context-windows)
- [MyEngineeringPath — Context Windows](https://myengineeringpath.dev/genai-engineer/context-windows/)

### Mixture of Experts (MoE)
- [NVIDIA — Mixture of Experts](https://www.nvidia.com/en-us/glossary/mixture-of-experts/)
- [Hugging Face — MoE Transformers](https://huggingface.co/blog/moe-transformers)
- [NVIDIA Technical Blog — MoE in LLMs](https://developer.nvidia.com/blog/applying-mixture-of-experts-in-llm-architectures/)
- [A Survey on MoE in LLMs — arXiv](https://arxiv.org/html/2507.11181v1)
- [MoE Survey — IEEE Computer Society](https://www.computer.org/csdl/journal/tk/2025/07/10937907/25n2xHILEpG)

### Comparativas de Herramientas
- [2026 AI Coding Agent Head-to-Head — Chaos and Order](https://www.youngju.dev/blog/culture/2026-05-14-ai-coding-agent-comparison-2026-claude-code-cursor-codex-copilot-openclaw-deep-dive-guide-2026.en)
- [Scrimba — Claude Code vs Codex vs Cursor](https://scrimba.com/articles/claude-code-vs-codex-vs-cursor/)
- [Agent Harness Comparison — DEV Community](https://dev.to/arihantdeva/agent-harness-comparison-claude-code-aider-cursor-agent-codex-cli-33n5)
- [Claude Code vs Cursor vs Aider — DEV Community](https://dev.to/sameer_saleem/claude-code-vs-cursor-vs-aider-the-2026-battle-for-your-terminal-and-ide-3cb4)

### Surveys Académicos y Revisiones Sistemáticas
- [LLM-Based Multi-Agent Systems for Code Generation — Tampere University](https://arxiv.org/html/2604.16321v1) — 114 estudios, 37 benchmarks.
- [A Survey on Code Generation with LLM-based Agents](https://arxiv.org/html/2508.00083v2)
- [AI Agentic Programming: A Survey](https://arxiv.org/html/2508.11126)
- [Waterfall-style Multi-Agent Workflows — ACM](https://dl.acm.org/doi/10.1145/3803846.3807461)
- [Code in Harmony — OpenReview](https://openreview.net/pdf?id=URUMBfrHFy)

### Referencias Originales del Usuario
- [mattpocock/dictionary-of-ai-coding](https://github.com/mattpocock/dictionary-of-ai-coding)
- [walkinglabs.github.io/learn-harness-engineering](https://walkinglabs.github.io/learn-harness-engineering/en/)
- [iaparagentecuriosa.686f6c61.dev](https://www.iaparagentecuriosa.686f6c61.dev/)
- [rohitg00/ai-engineering-from-scratch](https://github.com/rohitg00/ai-engineering-from-scratch)

---

## 📝 Notas para Futuras Versiones del Blueprint

- [ ] Incorporar prácticas específicas de `Augment Code` y `Devin` cuando haya más literatura abierta.
- [ ] Añadir módulo de "Agent Economics" (cost tracking, budget governance, FinOps para LLMs) si el público lo demanda.
- [ ] Explorar integración con `OpenAI Codex` async/cloud workflows como caso de uso en M8.
- [ ] Considerar sección de "Local-First AI" (Ollama, llama.cpp, local models) para entornos regulados.
- [ ] Traducción a español: decidir si el material base se escribe en español con términos en inglés, o bilingüe completo.
- [ ] Mantener un changelog de referencias: el ecosistema cambia cada 3-6 meses; este blueprint necesita caducidad explícita.

---

*Documento generado el 2026-07-02. El ecosistema de agentes de IA evoluciona rápidamente; las referencias aquí citadas reflejan el estado del arte a esa fecha. Se recomienda revisión trimestral.*