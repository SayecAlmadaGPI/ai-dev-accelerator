# Laboratorios

Ejercicios prácticos que convierten los módulos en habilidad. Cada lab es
un directorio con una guía (`README.md`) y, cuando aplica, archivos de
partida. El curso **AI Accelerated Development** los organiza por fase.

> **Principio:** un lab no se "lee", se hace. La guía describe el objetivo,
> el punto de partida y el criterio de terminación; el resto es tu trabajo
> con el agente. Si terminas sin haber visto fallar al agente al menos
> una vez, el lab probablemente no te exigió suficiente.

## Labs publicados (Fase 3 — Calidad y Seguridad)

| Lab | Foco | Módulos que ejercita | Estado |
|-----|------|----------------------|--------|
| [lab-01 — Baseline vs. Harness](./lab-01-baseline-vs-harness/) | Sentir la diferencia de trabajar con y sin harness. | M1, M3, M6 | ✅ publicado |
| [lab-02 — Spec-Driven Feature](./lab-02-spec-driven-feature/) | Implementar un feature de extremo a extremo desde la spec. | M2, M3, M6 | ✅ publicado |
| [lab-03 — MCP Integration](./lab-03-mcp-integration/) | Conectar un agente a DB y API vía MCP, con seguridad. | M5, M6, M10 | ✅ publicado |

## Labs publicados (Fase 4 — Especialización)

| Lab | Foco | Módulos que ejercita | Estado |
|-----|------|----------------------|--------|
| [lab-04 — Failure Mode Hunt](./lab-04-failure-mode-hunt/) | Cazar 5 bugs (uno por clase de la taxonomía M7), fixear con protocolo, postmortem. | M7, M6, M8 §8.7 | ✅ publicado |
| [lab-05 — Model Evaluation](./lab-05-model-evaluation/) | Evaluar 3 modelos en tu codebase con prueba ciega y decidir adopción. | M9, M1 | ✅ publicado |

## Pendientes

- (ninguno pendiente — labs 01-05 publicados)

## Cómo hacer un lab

1. Lee el `README.md` del lab: objetivo, punto de partida, criterio de
   terminación.
2. Monta el entorno con el `init.sh` provisto (si lo hay) o el que el lab
   describa.
3. Trabaja con tu agente siguiendo la metodología de los módulos
   referenciados.
4. Cuando el agente declare terminado, aplica el checklist de verificación
   del lab antes de aceptar.
5. Al final, deja un `RESULTADO.md` con el reporte DONE/VERIFIED (M6 §6.5)
   y una nota de qué falló y qué aprendiste.

> Si un lab no te hizo corregir el rumbo del agente al menos una vez, lo
  hiciste demasiado fácil. Sube la dificultad: specs más estrictas, menos
  hand-holding, sensores que antes no tenías.