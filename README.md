# AI Accelerated Development

Material para usar IA en la construcción de código con **Spec-Driven
Development** como metodología central. Pensado tanto para consulta
autodidacta como para capacitación guiada.

> **Tesis del curso:** un agente de IA es `modelo + harness`. La
> metodología (SDD) te dice *qué* construir; el harness (archivos,
> reglas, sensores, permisos) hace que el agente sea confiable. Lo que
> acelera y potencia la construcción con código no es "mejores prompts";
> es especificar bien, diseñar el entorno y verificar sin depender del
> agente.

Este repositorio **no empieza desde los fundamentos de IA**. Cubre lo
imprescindible para trabajar con agentes y acelerar la construcción:
vocabulario operativo, mentalidad de harness, spec-driven development,
workbench, handoffs, integración (MCP), verificación, failure modes,
casos end-to-end, evaluación de modelos y seguridad.

## Empezar por aquí

Si vienes de cero, el orden recomendado respeta las dependencias del
mapa (ver `BLUEPRINT.md` §mapa de dependencias):

1. **M0 — Lenguaje Operativo** → [`modules/00-lenguaje-operativo.md`](./modules/00-lenguaje-operativo.md)
   El vocabulario sin el cual el resto no se entiende (spec, harness,
   sensor, feedforward, system of record, etc.).
2. **M1 — Mentalidad de Harness** → [`modules/01-mentalidad-harness.md`](./modules/01-mentalidad-harness.md)
   La tesis `agent = model + harness` y por qué el harness es el
   multiplicador.
3. **M2 — Especificar, Planificar y Ejecutar** → [`modules/02-spec-plan-execute.md`](./modules/02-spec-plan-execute.md)
   El núcleo metodológico: SDD + GSD + Superpowers como pipeline.

A partir de M2, el resto se lee por interés o en orden.

## Estructura del repositorio

| Carpeta | Qué contiene |
|---------|--------------|
| [`modules/`](./modules/) | Las 11 lecciones del curso (M0–M10), cada una autocontenido. |
| [`templates/`](./templates/) | Plantillas descargables y reutilizables (AGENTS.md, spec, plan, hooks, MCP, verificación, seguridad, etc.). |
| [`labs/`](./labs/) | 5 laboratorios prácticos (labs 01–05) que convierten los módulos en habilidad. |
| [`cheatsheets/`](./cheatsheets/) | Cheatsheets de decisión y árboles de decisión para consulta rápida. |
| [`examples/`](./examples/) | Ejemplos trabajados completos (el del M2: ticket → spec → plan → resultado). |
| [`BLUEPRINT.md`](./BLUEPRINT.md) | El plano maestro: arquitectura del curso, referencias organizadas por tema y hoja de ruta por fases. |

## Los 11 módulos

| # | Módulo | Foco |
|---|-------|------|
| M0 | [Lenguaje Operativo](./modules/00-lenguaje-operativo.md) | Vocabulario operativo para trabajo con agentes. |
| M1 | [Mentalidad de Harness](./modules/01-mentalidad-harness.md) | Agent = model + harness; por qué el harness multiplica. |
| M2 | [Spec-Driven Development](./modules/02-spec-plan-execute.md) | **Núcleo metodológico.** SDD + GSD + Superpowers. |
| M3 | [Diseño del Entorno de Trabajo](./modules/03-workbench.md) | AGENTS.md, skills, hooks, memoria, permisos. |
| M4 | [Flujo de Trabajo y Handoffs](./modules/04-handoffs.md) | Sesiones, compaction, handoffs, two-agent split. |
| M5 | [Herramientas y Protocolos de Integración](./modules/05-herramientas-mcp.md) | Function calling y MCP. |
| M6 | [Verificación y Control de Calidad](./modules/06-verificacion.md) | Sensores, DONE/VERIFIED, test gaming. |
| M7 | [Failure Modes y Defensa Práctica](./modules/07-failure-modes.md) | Taxonomía de fallas y respuesta. |
| M8 | [Casos de Uso End-to-End](./modules/08-casos-uso.md) | 6 casos que recombinan el kit. |
| M9 | [Evaluación de Modelos](./modules/09-evaluacion-modelos.md) | Leer leaderboards, evaluar releases sin hype. |
| M10 | [Seguridad, Governance y Compliance](./modules/10-seguridad-governance.md) | Seguridad determinista del harness. |

Índice completo con estado de publicación: [`modules/README.md`](./modules/README.md).

## Los 5 labs

| Lab | Foco |
|-----|------|
| [lab-01](./labs/lab-01-baseline-vs-harness/) | Sentir la diferencia con/sin harness. |
| [lab-02](./labs/lab-02-spec-driven-feature/) | Feature completo de extremo a extremo desde la spec. |
| [lab-03](./labs/lab-03-mcp-integration/) | Conectar agente a DB y API vía MCP, con seguridad. |
| [lab-04](./labs/lab-04-failure-mode-hunt/) | Cazar 5 bugs (uno por clase de la taxonomía M7). |
| [lab-05](./labs/lab-05-model-evaluation/) | Evaluar 3 modelos en tu codebase con prueba ciega. |

Índice de labs: [`labs/README.md`](./labs/README.md).

## Cómo usar este material

- **Autoestudio:** lee M0 → M1 → M2, luego los módulos por interés. Haz
  al menos el `lab-01` antes de seguir; te hace sentir el argumento del
  curso en primera persona.
- **Capacación guiada:** cada módulo está estructurado igual (tesis,
  subsecciones numeradas, tablas, anti-patrones, niveles de adopción,
  FAQ, referencias) para citarse en clase. Los labs son las prácticas.

## Convención de idioma

El material está en **español neutro** (forma "tú", sin voseo). Los
términos técnicos (harness, spec, sensor, hook, etc.) se mantienen en
inglés por ser el vocabulario operativo del campo; su glosa está en M0.

## Estado

Núcleo del curso completo: módulos M0–M10, labs 01–05, plantillas,
cheatsheets y ejemplos. Pendiente (Fase 5): sitio estático y
videos-demo. El blueprint prevé mantener un changelog de caducidad de
referencias, porque el ecosistema cambia cada 3–6 meses.

Licencia y contribuciones: ver `BLUEPRINT.md` §notas para futuras
versiones.