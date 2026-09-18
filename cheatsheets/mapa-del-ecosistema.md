<!--
  cheatsheets/mapa-del-ecosistema.md
  ----------------------------------
  El mapa del ecosistema 2026, organizado por FUNCIÓN (qué aporta a tu
  pipeline), no por marca. Anti-envejecimiento: las marcas cambian cada
  3-6 meses; las funciones y los criterios de decisión no. Fecha de
  medición: 2026-09-14.
-->

# ¿Qué herramienta o enfoque complementa mi pipeline?

> **Mapa del ecosistema 2026 por función.** No es un catálogo de marcas: es
> "qué aporta cada categoría a tu flujo SDD + TDD y con qué se combina".
> Los productos concretos caducan; las funciones y los criterios, no.
> Fondo: M2 (pipeline), M3 (workbench), M4 (flujo/AFK), M9 (evaluación).

## 1. Orquestadores de flujo — quién estructura el trabajo

| Enfoque | Qué aporta | Con qué se combina | Encaja cuando |
|---|---|---|---|
| **SDD + TDD vanilla** | Disciplina por contrato: reglas en AGENTS.md + prompts. Setup ~2 min | Todo el curso | Tareas de 1 sesión; aprender el flujo por dentro (M2 §2.8 Nivel 1.5) |
| **GSD** | Estado en archivos (`.planning/`): continuidad entre sesiones, tasks atómicas, subagentes frescos | Cualquier runtime | El context rot te muerde; features multi-sesión (M2 §2.3) |
| **Superpowers** | TDD estricto por skill + code review contra el plan | GSD o solo | La calidad es irregular; quieres RED→GREEN obligatorio (M2 §2.4) |
| **BMAD-METHOD** | Un equipo ágil virtual: analista → PM → arquitecto → SM → dev → QA con revisión adversarial | Tu agente favorito (agéntrico) | Features grandes con requisitos difusos: necesitas PRD y arquitectura antes de codear (M2 §2.3) |
| **Gentle-AI** | Configurador de ecosistema: Engram (memoria) + SDD 10 fases + Strict TDD bloqueante + permisos | Claude Code, Cursor, OpenCode, Codex, Pi… | Quieres el flujo instalado sin armarlo a mano (M2 §2.8 Nivel 1.5) |
| **Spec Kit** | Especificaciones versionadas con artículos constitucionales + `/speckit-converge` | Cualquier agente | Estándar de facto para specs en el repo (M2 §2.2) |

## 2. Agentes cloud / AFK — el extremo asíncrono

Delegas la tarea a una VM/sandbox remoto; trabajan solos y vuelven con un PR.
El extremo derecho del eje HITL ↔ AFK del M4: **solo es seguro lo que tiene
spec + verificación automática** (M4 §4.8; seguridad en M10).

| Producto | Enfoque | Aporta |
|---|---|---|
| **Jules** (Google) | VM asíncrona con integración GitHub profunda | Tareas AFK de repos reales; plan visible antes de ejecutar |
| **Codex Cloud** (OpenAI) | Sandbox cloud dentro de los planes ChatGPT | Paralelizar tareas acotadas; CI auto-fix |
| **Devin** (Cognition) | Autonomía amplia de punta a punta | Tareas largas con infraestructura propia |
| **Copilot agents** | Nativo de GitHub | Automatizar fixes y PRs dentro del flujo del repo |

> Criterio transversal: un agente cloud es tan bueno como su **brief
> autosuficiente** — spec con ACs + alcance + rollback (M2). Si el brief
> necesita una conversación, no es AFK: es tu próxima sesión local.

## 3. IDEs y harnesses locales — dónde corre el agente

| Harness | Sesgo | Nota (2026-09) |
|---|---|---|
| **Claude Code** | Terminal, agentes/skills/hooks maduros | El estándar de facto del curso (M3) |
| **Cursor** | IDE, Tab-completion + agente | Fuerte en edición inline |
| **OpenCode** | Open-source, multi-proveedor (BYO) | AGENTS.md nativo, MCP |
| **Pi** | Chasis minimalista: todo es extensión | El caso límite del M1 |
| **Windsurf / Cline / Roo Code** | IDE agéntico / extensión VS Code | Alternativas con modelos propios |
| **Codex CLI / Gemini CLI** | Terminal de los otros proveedores | Multi-proveedor para no casarte |

## 4. Memoria y contexto — qué sobrevive a la sesión

| Mecanismo | Qué guarda | Cuándo |
|---|---|---|
| `AGENTS.md` + docs | Reglas y punteros (M3) | Siempre, nivel 1 |
| `.planning/` + handoff | Estado de trabajo (M2/M4) | Entre sesiones de un feature |
| **Engram** (MCP) | Decisiones, bugs, descubrimientos — automático, sync por git | Cuando el contexto entre sesiones se vuelve dolor (M4) |
| **Mem0 / Letta** | Capa de memoria programable para agentes custom | Cuando construyes tu propio harness (M7) |
| Memory tool (API) | Estado on-demand del proveedor | Agents SDK (M4) |

## 5. Revisión y evidencia — quién verifica

| Enfoque | Qué aporta | Fondo |
|---|---|---|
| Sensores computacionales | Verdad barata y determinística (build, tests, lint) | M6 §6.3 |
| Review-agent adversarial | Segunda opinión con contexto fresco (Judgment Day de Gentle-AI es el patrón) | M6 §6.5; M0 subagent |
| **RDD (revisión acotada, lentes 4R)** | Revisión por dimensiones acotadas con evidencia desde Git, no de la narración del agente | M6 §6.5 |
| Humano con grilling | El gate final: "¿cómo lo sabes?" | M0 §0.7 |

## 6. Specs versionadas en el repo

- **OpenSpec** — delta-specs + sync con specs principales (el patrón Spec-Anchored del M2 §2.2, automatizado).
- **Spec Kit** — constitución + `/speckit-converge` para cerrar implementación contra la spec.
- **Kiro** — specs como ciudadano de primera clase en el IDE (M2 §2.2).

---

> **Veredicto:** ninguna categoría reemplaza el pipeline del curso — todas
> lo alimentan: el orquestador estructura, el agente cloud ejecuta AFK,
> la memoria persiste, la revisión audita. La pregunta no es "¿qué uso?",
> es "¿qué hueco de mi pipeline necesito tapar hoy?". Verificado contra
> fuentes primarias el 2026-09-14; revisar cada producto antes de decidir.