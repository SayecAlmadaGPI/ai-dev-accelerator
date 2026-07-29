<!--
  seleccion-de-tooling.md — ¿Claude Code, Cursor, Codex, Aider, OpenCode o Pi?
  ---------------------------------------------------------------------
  Cheatsheet de decisión (Apéndice B). Versión consulta-rápida de M9 §9.4.3.

  Principio: decides una COMBINACIÓN modelo+harness, no un modelo aislado
  (M1). Un modelo superior en harness flojo rinde menos que uno inferior
  en harness afilado.
-->

# ¿Claude Code, Cursor, Codex, Aider, OpenCode o Pi?

> **Decisión rápida:** no compares modelos aisladamente; compara
> *combinaciones* modelo+harness. El harness inner (hooks, skills,
> subagents, permisos) es la mitad del rendimiento.

## Tabla por dimensión

> Las marcas cambian; las dimensiones no. Revisa la versión actual de
> cada tool antes de decidir.

| Dimensión | Qué comparar | Por qué importa |
|-----------|---------------|-----------------|
| **Modelo por defecto** | ¿Cuál? ¿Puedes cambiarlo? ¿Tiered routing? | Lock-in al modelo del proveedor vs. libertad de enrutar. |
| **Harness inner** | Hooks, skills, subagentes, permisos por tool (M3). | Donde está la mecánica fuerte; lo demás es wrapper. |
| **MCP** | ¿Soporta MCP? ¿Nativo o limitado? (M5) | Estándar para integrar al mundo real. |
| **Portabilidad del harness** | ¿Tu AGENTS.md/planning sobrevive al cambio? (M3 §3.9) | Lo que no es portable te ata. |
| **Cost model** | Por sesión, por token, suscripción. | Cost-per-quality para tu volumen (M9 §9.3.3). |
| **Lock-in** | ¿Puedes moverte sin reescribir el harness? | Invierte primero en la capa portable (M3 §3.9). |
| **Open-source** | ¿El agente es open-source? | Hedging de lock-in del proveedor. |
| **BYO modelo / proveedor** | ¿Traes tu propia API key o cuenta (Copilot, ChatGPT, Ollama)? | Multi-proveedor real, no solo el del vendor. |

## Regla de oro

> Invierte primero en la **capa portable** (AGENTS.md, specs, `.planning/`,
> `init.sh` — markdown y scripts que cualquier tool lee). Solo después en
> la **capa inner** de la tool que elijas. Así, si cambias de tool, no
> pierdes el harness.

## Veredicto de una línea

- No decidas por "el modelo más nuevo"; decide por la combinación
  modelo+harness que mejor resuelve TUS tareas a tu costo.
- Antes de comprometerte: ¿tu harness portable sobrevive al cambio? Si
  no, blíndalo antes.
- **OpenCode** si quieres open-source + traer tu propio modelo o cuenta
  (Copilot, ChatGPT, Ollama) sin atarte a un proveedor; te da MCP, agents
  y permisos de fábrica.
- **Pi** si quieres un chasis mínimo que extender a medida: el inner
  harness (MCP, subagents, permisos, hooks) lo construyes tú con
  extensiones. Caso límite del M1.

**Fondo:** M9 §9.4.3, M1 (agent = model + harness), M3 §3.9 (portabilidad).
Ver también el [árbol de selección de herramienta](./arbol-seleccion-herramienta.md).