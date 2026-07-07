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

## 3. Estrategia de inversión (orden recomendado)

1. **Capa portable primero.** `AGENTS.md`, specs, planes, `.planning/`, ADRs,
   `init.sh`. Si solo haces esto, ya tienes un harness que cambia de tool sin
   reescribirse.
2. **Capa inner de la tool que uses hoy.** Rules scoped, skills, hooks,
   subagents de esa tool. Aquí está el leverage mecánico.
3. **Capa inner de una segunda tool** solo si el equipo realmente la usa en
   paralelo. Mantener dos capas inner sincronizadas cuesta; no lo hagas por
   miedo al lock-in, hazlo si hay uso real.

## 4. Señales de que invertiste al revés

- Tienes `.cursor/rules/` ricas pero ningún `AGENTS.md`. → La capa portable
  no existe; al cambiar de tool pierdes todo.
- Tus reglas críticas viven solo en hooks de una tool. → La mecánica no es
  portable; un script invocado por el hook sí lo sería.
- Tienes skills elaboradas pero el flujo no está documentado en markdown
  plano. → El conocimiento está atrapado en una tool.

## 5. Referencias

- M3 §3.9 — portabilidad entre herramientas.
- M1 §jerarquía de enforcement — hooks > scoped rules > AGENTS.md.
- `templates/AGENTS.md` — el contrato canónico portable.