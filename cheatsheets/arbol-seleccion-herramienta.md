<!--
  arbol-seleccion-herramienta.md — Árbol de decisión: qué tooling usar
  -------------------------------------------------------------------
  Árbol de decisión (Apéndice C). Versión flujo de la cheatsheet de
  selección de tooling. Decide por flujo, no por tabla.
-->

# Árbol de selección de herramienta (tooling)

> **Decides una combinación modelo+harness, no un modelo aislado** (M1).
> El flujo te lleva de la pregunta raíz a un subconjunto pequeño; el
> desempate final lo dan las dimensiones de la cheatsheet.

```
¿Qué tipo de trabajo harás?
│
├─ Edición interactiva en el IDE, conversación conmigo en el momento.
│  └─ → Cursor / Claude Code (IDE + agente, feedback inmediato).
│
├─ Tareas largas, muchos archivos, sin mi vigilancia continua.
│  └─ → Claude Code (CLI, subagents, hooks, AFK por tramos).
│      ¿Necesitas integración con CI/CD o scripts deterministas?
│      └─ SÍ → verifica su soporte de hooks + subagents + permisos.
│
├─ Flujo git-first, commits por cada cambio, diffs auditables.
│  └─ → Aider (commits granulares, edita archivo a archivo).
│      ¿Trabajo multi-archivo no trivial?
│      └─ Aider suele ir archivo a archivo; valora si encaja.
│
└─ Ejecución de tickets end-to-end, integrado a repos en la nube.
   └─ → Codex (agente de tarea completa, orientado a issue).
       ¿Necesitas control de permisos y sandbox por comando?
       └─ SÍ → revisa su modelo de permisos y aislamiento.
```

## Después del flujo: el desempate (las 3 preguntas que sí importan)

El flujo acota; el desempate lo gana:

1. **¿Soporta MCP?** Si tu integración al mundo real depende de MCP
   (M5), una tool sin soporte nativo te bloquea.
2. **¿El harness inner es afilado?** Hooks, skills, subagents, permisos
   por tool (M3). Es la mitad del rendimiento.
3. **¿Tu harness portable sobrevive al cambio?** AGENTS.md, specs,
   `.planning/`, `init.sh` en markdown/scripts (M3 §3.9). Lo que no es
   portable te ata.

> **Regla de oro:** invierte primero en la capa portable. Si cambias de
> tool mañana, no pierdes el harness.

## Veredicto de una línea

- El flujo acota; el desempate lo dan MCP + harness inner + portabilidad.
- Antes de comprometerte: blindá la capa portable.

**Fondo:** M9 §9.4.3, M1 (agent = model + harness), M3 §3.9 (portabilidad).
Ver también la [cheatsheet de selección de tooling](./seleccion-de-tooling.md).