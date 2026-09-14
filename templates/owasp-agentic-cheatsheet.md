<!--
  owasp-agentic-cheatsheet.md — OWASP Agentic AI: mitigaciones por categoría
  ------------------------------------------------------------------------
  Traducción operativa del OWASP Top 10 para Agentic AI a mitigaciones
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
| **T1 Prompt Injection (directa)** | Mínimo privilegio: aunque obedezca, no puede ejecutar. | Permisos por tool | System message con límites. |
| **T1 Prompt Injection (indirecta/repo)** | Separación input/instrucción; quarantined LLM para archivos no confiables. | Sandbox / Dual LLM | Marcar origen de input al modelo. |
| **T1 Prompt Injection (vía tool output)** | Dual LLM: el LLM con permisos no ve output hostil. | Dual LLM | Tratar todo output de tool como no confiable. |
| **T2 Tool Misuse** | No ejecutar output crudo; validar args y output antes de ejecutar. | Harness | — |
| **T3 Privilege Compromise** | Permisos por tool con scope mínimo; kill switch; secretos fuera del árbol indexado; redacción en output de tools; errores estructurados y sanitizados (sin stack traces con secrets). | Permisos / sandbox / harness | AGENTS.md con no-objetivos; "No leas `.env`" (insuficiente solo). |
| **T4 Resource Overload** | Circuit breakers por tipo de falla; presupuestos de tokens y llamadas por sesión. | Harness | — |
| **T5 Cascading Hallucination** | Relectura forzada de fuentes canónicas; no confiar en memoria del agente para lo crítico; curar qué entra al system of record (specs/ADRs). | System of record / proceso | — |
| **T6 Intent Breaking** | Gates por paso contra el spec/plan; trazabilidad de decisión spec → tarea → commit. | Harness | — |
| **T7 Misaligned/Deceptive Behaviors** | Sensores cuyo resultado no pasa por el modelo (DONE/VERIFIED externo). | Harness | — |
| **T8 Repudiation & Traceability** | Logging inmutable append-only; Merkle audit logs. | Harness | — |
| **T9 Identity & Impersonation** | Revisar MCP servers antes de conectar; tool poisoning checks. | Host config | — |
| **T10 Overwhelming HITL** | Aprobación solo de lo irreversible; agrupar aprobaciones con contexto mínimo. | Host config | — |

## Las 3 mitigaciones de mayor leverage

> Si solo haces tres cosas, haz estas:

1. **Secretos fuera del árbol indexado + hook que bloquea commits con
   secretos.** Cubre la porción de T3 (privilege compromise) que es leak
   de datos. Barato, inmediato, determinista.
2. **Mínimo privilegio por tool + kill switch.** Cubre T3, T1 (no puede
   ejecutar aunque obedezca) y deriva destructiva. Determinista.
3. **Context-Minimization + separación input/instrucción.** Cubre T1
   indirecta, una porción de T5 (context poisoning) y context rot a la
   vez, y además reduce costo. El win-win de aplicar primero.

## Preguntas de diseño (una por riesgo)
- **T1 Inyección:** aunque el modelo obedezca una inyección, ¿qué le
  impide ejecutarla? (Si la respuesta es "nada", no estás cubierto.)
- **T2 Tool misuse:** ¿el output o los argumentos del agente se
  ejecutan sin validación? (Si sí, tool misuse sin cubrir.)
- **T3 Privilegios:** ¿el agente tiene más permisos de los que su
  tarea actual necesita, y puede leer `.env` o equivalentes? (Si sí,
  privilege compromise sin cubrir.)
- **T4 Recursos:** ¿existe un circuit breaker que pare al agente tras
  N fallos o presupuesto quemado? (Si no, un loop lo deja corriendo
  toda la noche.)
- **T5 Alucinación en cascada:** ¿lo crítico se decide contra fuentes
  canónicas o contra la memoria del agente? (Si es contra su memoria,
  un error se propaga por toda la cadena.)
- **T6 Intent:** ¿algún gate verifica que el trabajo cumpla el spec
  original, no solo que "esté hecho"? (Si no, el intent se rompe sin
  que nadie lo note.)
- **T7 Decepción:** ¿el "done" del agente lo certifica un sensor
  externo o el propio modelo? (Si es el modelo, phantom verification.)
- **T8 Audit:** si algo sale mal, ¿puedes reconstruir qué decidió el
  agente y por qué? (Si no, repudiation & traceability sin cubrir.)
- **T9 Identidad:** ¿revisaste cada MCP server antes de conectarlo?
  (Si no, cualquiera puede suplantar una tool de confianza.)
- **T10 HITL:** ¿el humano aprueba solo lo irreversible? (Si aprueba
  todo, aprueba nada.)

## Referencia

- M10 §10.1 — OWASP Top 10 para Agentic AI.
- M10 §10.2 — prompt injection, las cuatro vías.
- M10 §10.3 — determinístico > probabilístico.
- `templates/security-governance-checklist.md` — 20 controles.