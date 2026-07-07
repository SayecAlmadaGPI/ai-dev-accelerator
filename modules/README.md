# Módulos

Material de lecciones del curso **AI Accelerated Development**. Cada módulo es un
archivo Markdown autocontenido, pensado tanto para consulta autodidacta como
para capacitación guiada.

## Módulos publicados

| Módulo | Archivo | Estado |
|--------|---------|--------|
| M0 — Lenguaje Operativo | [`00-lenguaje-operativo.md`](./00-lenguaje-operativo.md) | ✅ publicado |
| M1 — Mentalidad de Harness | [`01-mentalidad-harness.md`](./01-mentalidad-harness.md) | ✅ publicado |
| M2 — Especificar, Planificar y Ejecutar con Agentes | [`02-spec-plan-execute.md`](./02-spec-plan-execute.md) | ✅ publicado |
| M3 — Diseño del Entorno de Trabajo | [`03-workbench.md`](./03-workbench.md) | ✅ publicado |
| M4 — Flujo de Trabajo y Handoffs | [`04-handoffs.md`](./04-handoffs.md) | ✅ publicado |
| M5 — Herramientas y Protocolos de Integración | [`05-herramientas-mcp.md`](./05-herramientas-mcp.md) | ✅ publicado |
| M6 — Verificación y Control de Calidad | [`06-verificacion.md`](./06-verificacion.md) | ✅ publicado |
| M7 — Failure Modes y Defensa Práctica | [`07-failure-modes.md`](./07-failure-modes.md) | ✅ publicado |
| M8 — Casos de Uso End-to-End | [`08-casos-uso.md`](./08-casos-uso.md) | ✅ publicado |
| M9 — Evaluación de Modelos y Navegación del Ecosistema | [`09-evaluacion-modelos.md`](./09-evaluacion-modelos.md) | ✅ publicado |
| M10 — Seguridad, Governance y Compliance | [`10-seguridad-governance.md`](./10-seguridad-governance.md) | ✅ publicado |

## Pendientes (según `BLUEPRINT.md`)

- (ninguno pendiente — todos los módulos M0–M10 publicados)

## Convención de cada módulo

Cada archivo de módulo debe seguir esta estructura para que sirva tanto para
autoestudio como para enseñanza:

1. **Encabezado** con su número y título, y una línea de tesis ("si solo lees una cosa, que sea esta").
2. **Subsecciones numeradas** (`2.1`, `2.2`, ...) para citarlas en clase y en otros módulos.
3. **Tablas comparativas** para decisiones rápidas.
4. **Anti-patrones / trampas comunes** con un aside visual.
5. **Ejemplo concreto** referenciando un directorio bajo `examples/`.
6. **Niveles de adopción** (mínimo, medio, completo) para no asustar al lector.
7. **FAQ** con trampas reales.
8. **Referencias** con los links exactos.

## Cómo citar entre módulos

Usa rutas relativas: desde `modules/02-...md`, un ejemplo está en
`../examples/m2-unified-workflow/` y una plantilla en `../templates/`.