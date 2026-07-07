<!--
  security-governance-checklist.md — 20 controles aplicables
  ----------------------------------------------------------
  Checklist de seguridad y governance para un harness con agentes de
  código. Ver M10.

  Principio: cada control es determinista o no es control. Si tu
  respuesta a un ítem es "se lo pedimos al agente", no tienes el control;
  tienes un deseo. Marca solo lo que es mecánico.

  Cómo usar: recórrelo de arriba a abajo. El orden va de lo más básico
  (secretos, permisos) a lo más elaborado (governance, audit). Las
  secciones bajas son prerequisito de las altas.
-->

# Checklist de seguridad y governance

> **Proyecto:** [nombre]
> **Fecha:** [YYYY-MM-DD]
> **Evaluador:** [quién responde]
> **Resultado:** __ / 20

---

## A. Secretos y datos sensibles

- [ ] **A1.** `.env` y archivos de credenciales están fuera del árbol
  que el agente indexa por defecto.
- [ ] **A2.** Ninguna tool devuelve secretos en su output (redacción en
  el harness, no en el prompt).
- [ ] **A3.** Un hook bloquea commits con secretos (`pre-commit-agent-checks.sh`,
  M6 §6.6).
- [ ] **A4.** El agente no tiene permiso de lectura sobre directorios de
  prod o de datos sensibles (M3 §3.7).

## B. Permisos y mínimo privilegio

- [ ] **B1.** Permisos por tool con mínimo privilegio (grep auto, bash
  con confirmación, git push bloqueado).
- [ ] **B2.** Las tools de escritura son idempotentes o marcadas como no
  idempotentes (M5 §5.1.3).
- [ ] **B3.** Lo irreversible (migraciones, deploys, borrados) exige
  aprobación humana (kill switch / gate).

## C. Sandboxing e aislamiento

- [ ] **C1.** Worktree aislado por defecto para que la deriva no toque
  main (M3, M7 §7.3).
- [ ] **C2.** Ejecución sensible en contenedor sin red saliente (o con
  whitelisting).
- [ ] **C3.** Existe un kill switch para detener al agente en seco.
- [ ] **C4.** Circuit breaker tras N fallos de un tipo en una ventana
  (M7 §7.1.3).

## D. Prompt injection y output handling

- [ ] **D1.** El contenido de archivos del repo se trata como datos, no
  como instrucciones (separación input/instrucción).
- [ ] **D2.** Output del agente no se ejecuta sin validación determinista
  (no ejecutar output crudo).
- [ ] **D3.** Para input hostil por diseño (web, logs de terceros), se
  usa quarantined LLM (Dual LLM, M10 §10.4).

## E. Audit y governance

- [ ] **E1.** Logging inmutable de cada tool call (con args) y decisión
  del agente.
- [ ] **E2.** Trazabilidad end-to-end: spec → plan → tarea → tool call →
  commit (system of record, M1).
- [ ] **E3.** Postmortem tras incidente produce una mitigación instalada
  (M7 §7.10).
- [ ] **E4.** Governance del flujo determinista (FIDES) o privilegios
  programables (Progent) donde el costo de fallo lo justifica.

---

## Cómo interpretar el resultado

| Puntaje | Diagnóstico | Acción sugerida |
|---------|-------------|-----------------|
| 0-7 | **Sin defensa estructural.** La "seguridad" vive en el prompt. | A1-A3 (secretos) y B1-B2 (permisos) ya reducen el 80% del riesgo real. |
| 8-13 | **Defensa básica.** Determinista en lo obvio, probabilístico en lo delicado. | C1-C2 (sandbox) y D1-D2 (separación input/instrucción). |
| 14-17 | **Defensa robusta.** Sandboxing y audit cubren lo operativo. | D3 (Dual LLM donde aplique) y E1-E2 (audit inmutable). |
| 18-20 | **Governance maduro.** Flujo determinista y trazabilidad total. | Mantén; revisa ante cada nuevo tipo de input hostil. |

---

## Los 6 patrones de diseño defensivo — cuándo usar cada uno

| Patrón | Mejor contra | Costo | Cuándo aplicar |
|--------|--------------|-------|----------------|
| **Action-Selector** | Acciones sensibles una a una. | Bajo. | Cuando cada escritura merece gate. |
| **Plan-Then-Execute** | Trayectoria destructiva. | Bajo. | Tareas multi-paso (ya en M2). |
| **LLM Map-Reduce** | Trabajo paralelizable sin estado. | Medio. | Reviews, migraciones por archivo. |
| **Dual LLM** | Prompt injection indirecta. | Alto. | Input hostil por diseño (web, terceros). |
| **Code-Then-Execute** | Cálculo complejo del agente. | Medio. | Cuando el agente debe computar, no narrar. |
| **Context-Minimization** | Inyección + context rot a la vez. | Bajo. | Siempre que se pueda. El win-win. |

> Context-Minimization es el patrón que más conviene aplicar primero:
> defiende dos amenazas (inyección y rot) y además reduce costo. Es
> raro que una mitigación sea a la vez más segura y más barata; esta sí.

## Notas del evaluador

- [Qué control faltó y por qué]
- [Qué se promueve de prompt a mecanismo determinista]
- [Dónde el costo de fallo justifica FIDES / Progent]

<!--
  Recordatorio: la seguridad del agente es propiedad del harness, no
  del modelo. Cada control marcado aquí debe sobrevivir a un modelo que
  intente saltárselo. Si la defensa es "se lo pedimos al agente", no es
  control; es deseo.
-->