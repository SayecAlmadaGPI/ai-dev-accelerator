# Módulos

Material de lecciones del curso **AI Accelerated Development**. Cada módulo es un
archivo Markdown autocontenido, pensado tanto para consulta autodidacta como
para capacitación guiada.

## Módulos publicados

| Módulo | Archivo | Estado |
|--------|---------|--------|
| M0 — Lenguaje Operativo | [`00-lenguaje-operativo.md`](./00-lenguaje-operativo.md) | ✅ publicado |
| M2 — Especificar, Planificar y Ejecutar con Agentes | [`02-spec-plan-execute.md`](./02-spec-plan-execute.md) | ✅ publicado |

## Pendientes (según `BLUEPRINT.md`)

- M1 — Mentalidad de Harness
- M3 — Diseño del Entorno de Trabajo (Workbench)
- M4 — Flujo de Trabajo y Handoffs
- M5 — Herramientas y Protocolos de Integración
- M6 — Verificación y Control de Calidad
- M7 — Failure Modes y Defensa Práctica
- M8 — Casos de Uso End-to-End
- M9 — Evaluación de Modelos y Navegación del Ecosistema
- M10 — Seguridad, Governance y Compliance

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