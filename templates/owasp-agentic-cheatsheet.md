<!--
  owasp-agentic-cheatsheet.md — OWASP Agentic AI: mitigaciones por categoría
  ------------------------------------------------------------------------
  Traducción operativa del OWASP Top 10 para LLM/Agentic AI a mitigaciones
  concretas para un agente de código. Ver M10 §10.1.

  Principio: cada mitigación es determinista cuando puede serlo. La
  columna "capa" indica dónde vive (determinista vs. probabilístico).
-->

# Cheatsheet — OWASP Agentic AI: mitigaciones por categoría

> **Tesis:** el OWASP Agentic Top 10 nombra los riesgos; este cheatsheet
> los convierte en mitigaciones instalables. Si la mitigación es "pedir
> al modelo", no cuenta.

## Mitigaciones por categoría

| Riesgo OWASP | Mitigación determinista | Capa | Mitigación probabilística (refuerzo) |
|--------------|-------------------------|------|--------------------------------------|
| **Prompt injection (directa)** | Mínimo privilegio: aunque obedezca, no puede ejecutar. | Permisos por tool | System message con límites. |
| **Prompt injection (indirecta/repo)** | Separación input/instrucción; quarantined LLM para archivos no confiables. | Sandbox / Dual LLM | Marcar origen de input al modelo. |
| **Prompt injection (tool output)** | Dual LLM: el LLM con permisos no ve output hostil. | Dual LLM | Tratar todo output de tool como no confiable. |
| **Insecure output handling** | No ejecutar output crudo; validar antes de ejecutar. | Harness | — |
| **Excessive agency** | Permisos por tool con scope mínimo; kill switch. | Permisos / sandbox | AGENTS.md con no-objetivos. |
| **Supply chain (tools/MCP)** | Revisar MCP servers antes de conectar; tool poisoning checks. | Host config | — |
| **Sensitive data exposure** | Secretos fuera del árbol indexado; redacción en output de tools. | Permisos / harness | "No leas `.env`" (insuficiente solo). |
| **Improper error handling** | Errores estructurados y sanitizados (sin stack traces con secrets). | Harness | — |
| **Memory / context poisoning** | Relectura forzada de fuentes canónicas; no confiar en memoria del agente para lo crítico. | System of record | — |
| **Training data poisoning** | Curar qué entra al system of record; revisar contenido de specs/ADRs. | Proceso | — |

## Las 3 mitigaciones de mayor leverage

> Si solo haces tres cosas, haz estas:

1. **Secretos fuera del árbol indexado + hook que bloquea commits con
   secretos.** Cubre sensitive data exposure y una porción de leak. Barato,
   inmediato, determinista.
2. **Mínimo privilegio por tool + kill switch.** Cubre excessive agency,
   prompt injection (no puede ejecutar aunque obedezca) y deriva
   destructiva. Determinista.
3. **Context-Minimization + separación input/instrucción.** Cubre
   prompt injection indirecta y context rot a la vez, y además reduce
   costo. El win-win de aplicar primero.

## Preguntas de diseño (una por riesgo)

- **Inyección:** aunque el modelo obedezca una inyección, ¿qué le impide
  ejecutarla? (Si la respuesta es "nada", no estás cubierto.)
- **Output:** ¿el output del agente se ejecuta sin validación? (Si sí,
  insecure output handling sin cubrir.)
- **Privilegios:** ¿el agente tiene más permisos de los que su tarea
  actual necesita? (Si sí, excessive agency.)
- **Secretos:** ¿el agente puede leer `.env` o equivalentes? (Si sí,
  sensitive data exposure sin cubrir.)
- **Audit:** si algo sale mal, ¿puedes reconstruir qué decidió el agente
  y por qué? (Si no, no hay trazabilidad.)

## Referencia

- M10 §10.1 — OWASP Top 10 para Agentic AI.
- M10 §10.2 — prompt injection, las cuatro vías.
- M10 §10.3 — determinístico > probabilístico.
- `templates/security-governance-checklist.md` — 20 controles.