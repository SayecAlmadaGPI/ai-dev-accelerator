<!--
  cross-tool-compatibility-matrix.md — Portabilidad del harness entre tools
  --------------------------------------------------------------------------
  Una capa del harness que es portable entre herramientas (Claude Code,
  Cursor, Gemini CLI, Aider, etc.) te protege del lock-in y te permite
  cambiar de tool sin reescribir el contrato. Ver M3 §3.9.

  Esta matriz es un inventario: para cada artefacto del workbench, anota
  dónde vive en cada tool y cuál es el mecanismo de portabilidad. El
  principio rector (M3) es invertir primero en la capa portable (la que
  funciona en todas las tools) y solo después en la capa inner específica
  de un IDE.

  Cómo usar: reemplaza los corchetes y marca con ✅/⚠️/❌ según el soporte
  real de cada tool en tu contexto. Mantén la matriz actualizada cuando
  cambien las tools.
-->

# Matriz de compatibilidad entre herramientas

> **Tesis:** el harness portátil sobrevive al cambio de tool. El harness
> que vive solo en un IDE no. Invierte primero en la capa portable.

## 1. Capa portable (independiente de la tool)

| Artefacto | Archivo canónico | Claude Code | Cursor | Gemini CLI | Aider | Mecanismo de portabilidad |
|-----------|------------------|-------------|--------|------------|-------|---------------------------|
| Reglas estables del proyecto | `AGENTS.md` | Lee como `CLAUDE.md` (enlazar o `@imports`) | Lee `AGENTS.md` nativamente | Lee `AGENTS.md` nativamente | Lee `CONVENTIONS.md` / `AGENTS.md` | **Un único `AGENTS.md` canónico**, enlazado desde los aliases que cada tool espera. |
| Specs | `docs/specs/*.md` | Cargadas on-demand por el agente | Igual | Igual | Igual | Markdown plano; cualquier tool lo lee. |
| Planes TDD | `templates/plan.md` | Igual | Igual | Igual | Igual | Markdown plano. |
| Estado del loop (GSD) | `.planning/` | Leído por el agente al arrancar | Igual | Igual | Igual | Archivos en el repo; no depende de la tool. |
| ADRs | `docs/decisions/` | Igual | Igual | Igual | Igual | Markdown plano. |
| Init script | `init.sh` / `init.ps1` | Corrido por el agente o por el humano | Igual | Igual | Igual | Script de shell; independiente de la tool. |

> **Conclusión de la sección 1:** todo lo de esta tabla es markdown o script
> en el repo. No depende de ninguna tool. Esta es la capa que conviene
> pulir primero.

> **OpenCode y Pi en la capa portable:** ambas tools leen `AGENTS.md`
> nativamente (OpenCode con `/init`; Pi desde raíz y working dir), y el
> resto (specs, planes, `.planning/`, ADRs, `init.sh`) es markdown o
> script → "Igual" que las otras. Tu capa portable les aplica sin cambios.

> **Codex en la capa portable:** lee `AGENTS.md` de primera clase (desde
> `~/.codex/`, raíz del repo y working dir; M3). El resto (specs, planes,
> `.planning/`, ADRs, `init.sh`) es markdown o script → "Igual" que las
> otras. Tu capa portable le aplica sin cambios.

## 2. Capa inner (específica de cada tool)

| Artefacto | Claude Code | Cursor | Gemini CLI | Aider | ¿Portabilidad? |
|-----------|--------------|--------|------------|-------|----------------|
| Reglas scoped | `.claude/rules/*.md` | `.cursor/rules/*.mdc` | (propio) | (no soporta) | ⚠️ Sintaxis distinta; hay que mantener dos copias o un generador. |
| Skills | `.claude/skills/` | (no nativo) | (no nativo) | (no nativo) | ❌ Solo Claude Code. Documenta el flujo en markdown plano como fallback portable. |
| Hooks | `.claude/settings.json` (hooks) | (propio) | (no nativo) | (no nativo) | ❌ Migrar la lógica crítica a un script que el hook invoca; el script sí es portable. |
| Subagents | `.claude/agents/*.md` | (propio) | (propio) | (no nativo) | ⚠️ La *definición* del subagent es portable como markdown; el *mecanismo* de invocación no. |
| Permisos por tool | `.claude/settings.json` (permissions) | (propio) | (propio) | (propio) | ❌ Config distinta por tool. |
| Memoria local | `CLAUDE.local.md` | (propio) | (propio) | (propio) | ❌ No portable por diseño (preferencias personales). |

> **Conclusión de la sección 2:** esta capa es la que te ata a una tool. La
> estrategia no es eliminarla (es donde está la mecánica fuerte), sino que
> la lógica crítica viva en la capa portable (sección 1) y la capa inner
> solo la *invoque*. Ejemplo: un hook de Claude Code que protege migraciones
> debe llamar a `scripts/check-migrations.sh`; el script es portable, el
> hook es el wrapper.

> **OpenCode y Pi en la capa inner:** OpenCode declara su inner harness en
> `opencode.json` (agents, commands, rules, permisos, plugins). Pi no
> tiene capa inner de fábrica: la construyes como extensiones TypeScript
> (skills, templates, custom tools; MCP, subagents y permisos se añaden).
> El desglose por dimensión está en la §3 siguiente.

> **Codex en la capa inner:** expone su propio modelo de permisos y
> aislamiento (el árbol de selección manda revisarlo por comando). El resto
> de la capa inner (reglas scoped, skills, hooks, subagents) no está
> documentado en este repo: verifica la versión vigente antes de contar con
> ello.

## 3. Dimensiones del harness por tool

La §1 mapea *artefacto → dónde vive*; la §2 mapea *capa → portabilidad*.
Esta sección mapea **dimensión del harness → soporte por tool**, para
decidir qué tool te da la mecánica que necesitas. Cubre Claude Code
(referencia "baterías incluidas"), Cursor (IDE), OpenCode (open-source
multi-proveedor), Pi (chasis mínimo extensible) y Codex (agente de tareas
orientado a issue).

> Leyenda: ✅ nativo · ⚠️ parcial o vía plugin · ❌ no nativo (construible
> como extensión) · — no aplica. Son ordinales, no absolutos: las
> herramientas cambian; las dimensiones no. Revisa la versión vigente de
> cada tool antes de decidir.

| Dimensión | Claude Code | Cursor | OpenCode | Pi | Codex |
|---|---|---|---|---|---|
| **Slash commands custom** | ✅ `.claude/commands/` + built-in (`/clear`, `/compact`, plan mode) | ✅ rules con `description`/`globs`; custom instructions | ✅ `/docs/commands/` | ✅ vía extensiones (`/cmd`), skills (`/skill:name`), templates (`/tpl`) | —/verificar |
| **Extensiones / skills** | ✅ `.claude/skills/` (SKILL.md) | ✅ Skills + `.cursor/rules/*.mdc` | ✅ agents, agent skills, plugins, custom tools, rules | ✅ extensiones TS (npm/git/path), skills, templates, temas | —/verificar |
| **Hooks deterministas** | ✅ first-class: `PreToolUse`/`PostToolUse`/`Stop` en `settings.json` | ❌ no hay hooks (rules son advisory on-demand) | ⚠️ vía plugins ("custom tools, hooks…"), no config first-class | ❌ no nativo (maneja eventos como `project_trust`; construible) | —/verificar |
| **Sistema de memoria** | ✅ 4 capas: `CLAUDE.md` · `MEMORY.md` auto · memory tool · subagent memory | ✅ codebase index + docs index + `@`-mentions + Memories (auto) | ⚠️ `AGENTS.md` (`/init`) + References (dirs/repos externos) + compaction/summary ocultos; sesiones jerárquicas | ✅ `AGENTS.md`/`CLAUDE.md` + `SYSTEM.md` + compactación; sesiones en árbol JSONL (fork) | ✅ `AGENTS.md` de primera clase (`~/.codex/`, raíz del repo, working dir) |
| **Subagents** | ✅ `.claude/agents/*.md` | ❌ Agent monolítico (sin subagents) | ✅ agents configurables (sesiones hijas) | ❌ no nativo (construible como extensión) | —/verificar (agente de tarea completa, orientado a issue) |
| **MCP** | ✅ nativo | ✅ nativo | ✅ nativo | ❌ no nativo (construible como extensión) | ✅ (M0 lo lista entre las tools con soporte MCP) |
| **Permisos / sandbox** | ✅ permission modes (read-only, plan, full) + sandbox | ⚠️ checkpoints (snapshots locales para revertir); sin sandbox explícito en la doc | ✅ `permission` (edit/bash = ask) + `policies` (experimental deny/allow) | ❌ no nativo (recomienda contenedores/tmux; trust system para cargar extensiones) | ⚠️ modelo propio de permisos y aislamiento; detalles según versión |
| **Selección de modelo / BYO** | ⚠️ mainly Anthropic; tiered routing limitado | ✅ multi-proveedor + BYO key | ✅ 75+ proveedores + locales + login Copilot/ChatGPT | ✅ 15+ proveedores + locales (Ollama, llama.cpp) + BYO key | —/verificar |
| **Open-source** | ❌ cerrado | ❌ cerrado | ✅ | ✅ MIT | —/verificar |
| **Lee `AGENTS.md`** | vía `CLAUDE.md` (symlink / `@imports`) | ✅ `AGENTS.md` + `CLAUDE.md` | ✅ nativo (`/init` lo genera) | ✅ `AGENTS.md` / `CLAUDE.md` | ✅ de primera clase (`~/.codex/`, raíz del repo, working dir) |

> **Codex en esta tabla:** los datos derivan del repo (M3: `AGENTS.md` de
> primera clase desde `~/.codex/`, raíz del repo y working dir; M0: MCP
> listado como soportado; árbol de selección: agente de tarea completa
> orientado a issue, con modelo de permisos y aislamiento que hay que
> revisar). Las celdas «—/verificar» no tienen dato fiable en el repo:
> verifica la versión vigente antes de decidir.

> **Cómo leer esta tabla para decidir:** cada ✅ que falta en Pi es, por
> diseño, trabajo de harness que tú haces (M1). Si tu caso de uso necesita
> MCP nativo o subagents sin construirlos, OpenCode o Claude Code te los
> dan de fábrica; Pi te da el chasis y la libertad de armarlos a tu
> medida. Si necesitas traer tu propia cuenta de modelo (Copilot,
> ChatGPT, Ollama) sin atarte a un proveedor, OpenCode es el vehículo más
> directo.

> **Sobre los plugins que enriquecen el harness de Pi:** Pi **no trae**
> MCP, subagents, plan mode, permission gates, to-dos ni background bash
> *por diseño* ("primitives, not features"). La doc es explícita: puedes
> construirlos o instalarlos como extensiones o paquetes (`pi install
> <npm|git|path>`, `pi list`, `pi config`), o usar herramientas externas
> (contenedores, tmux). Un **trust system** retrasa la carga de extensiones
> project-local hasta que apruebas el proyecto. No hay un marketplace
> curado: las extensiones vienen de npm o git. Es el caso límite donde el
> inner harness es literalmente tu responsabilidad.

## 4. Estrategia de inversión (orden recomendado)

1. **Capa portable primero.** `AGENTS.md`, specs, planes, `.planning/`, ADRs,
   `init.sh`. Si solo haces esto, ya tienes un harness que cambia de tool sin
   reescribirse.
2. **Capa inner de la tool que uses hoy.** Rules scoped, skills, hooks,
   subagents de esa tool. Aquí está el leverage mecánico.
3. **Capa inner de una segunda tool** solo si el equipo realmente la usa en
   paralelo. Mantener dos capas inner sincronizadas cuesta; no lo hagas por
   miedo al lock-in, hazlo si hay uso real.

## 5. Señales de que invertiste al revés

- Tienes `.cursor/rules/` ricas pero ningún `AGENTS.md`. → La capa portable
  no existe; al cambiar de tool pierdes todo.
- Tus reglas críticas viven solo en hooks de una tool. → La mecánica no es
  portable; un script invocado por el hook sí lo sería.
- Tienes skills elaboradas pero el flujo no está documentado en markdown
  plano. → El conocimiento está atrapado en una tool.

## 6. Referencias

- M3 §3.9 — portabilidad entre herramientas.
- M1 §jerarquía de enforcement — hooks > scoped rules > AGENTS.md.
- `templates/AGENTS.md` — el contrato canónico portable.