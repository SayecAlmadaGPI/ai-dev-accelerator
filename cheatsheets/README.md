# Cheatsheets de decisión y árboles

Quick-reference para decisiones frecuentes con agentes de IA. El apéndice
reúne en total 15 ficheros (10 en esta carpeta + 4 de llenado en templates/): los 9 de este directorio (6 cheatsheets de
decisión + 3 árboles de decisión, indexados en las tablas de abajo) y 4
cheatsheets que viven en `templates/` — `model-comparison-cheatsheet`,
`mcp-primitives-cheatsheet`, `failure-classes-cheatsheet` y
`owasp-agentic-cheatsheet` —, que son plantillas de llenado ligadas a su
módulo y no se repiten aquí. Cada fichero es una hoja de decisión corta
(pregunta → tabla o flujo → veredicto). El contenido extenso vive en los
módulos; aquí está la versión consulta-rápida.

> **Principio:** una cheatsheet no enseña; decide. Si necesitas el
> *porqué*, vuelve al módulo citado. Si necesitas el *qué hago ahora*,
> quédate aquí.

## Cheatsheets de decisión (Apéndice B)

| Cheatsheet | Pregunta | Módulo de fondo |
|-----------|----------|-----------------|
| [modo-afk-o-hitl](./modo-afk-o-hitl.md) | ¿Trabajo human-in-the-loop o away-from-keyboard? | M4 §4.5 |
| [una-sesion-o-varias](./una-sesion-o-varias.md) | ¿Sigo en esta sesión o cierro y arranco otra? | M4 §4.2 |
| [rag-o-long-context](./rag-o-long-context.md) | ¿RAG o meter todo en la ventana? | M9 §9.5.2 |
| [seleccion-de-tooling](./seleccion-de-tooling.md) | ¿Claude Code, Cursor, Codex, Aider, OpenCode o Pi? | M9 §9.4.3 |
| [cuando-cambiar-de-modelo](./cuando-cambiar-de-modelo.md) | ¿Cambio de modelo en este release? | M9 §9.4.4 |
| [benchmark-importa-mi-caso](./benchmark-importa-mi-caso.md) | ¿Este benchmark importa para mi caso? | M9 §9.2 |

## Árboles de decisión (Apéndice C)

| Árbol | Decide | Módulo de fondo |
|-------|--------|-----------------|
| [arbol-diagnostico-fallas](./arbol-diagnostico-fallas.md) | Qué hacer cuando el agente falla. | M7 §7.9 |
| [arbol-seleccion-herramienta](./arbol-seleccion-herramienta.md) | Qué herramienta (tooling) usar. | M9 §9.4.3 |
| [arbol-estrategia-contexto](./arbol-estrategia-contexto.md) | Cache vs. RAG vs. compact. | M4 §4.2, M9 §9.5 |

> El árbol de diagnóstico de fallas también existe inline en M7 §7.9; esta
> es la versión standalone para imprimir o tener a mano durante una
> sesión.