<!--
  incident-postmortem-agent.md — Análisis de sesión fallida con agente
  -------------------------------------------------------------------
  Convierte un incidente en conocimiento permanente del harness. No es
  para culpar al agente; es para que la próxima vez el harness lo atrape.
  Ver M7 §7.10.

  Principio: cada postmortem debe producir al menos una mitigación
  instalada (un hook, un gate, un spec corregido, una regla promovida
  de prosa a check). Un postmortem que no cambia el harness es
  retrospectiva estéril.

  Cómo usar: complétalo tras cualquier sesión que terminó mal sin que
  lo entendieras a tiempo. Guárdalo en docs/postmortems/ numerado por
  fecha. Revisa los anteriores antes de sesiones largas.
-->

# Postmortem — [Fecha YYYY-MM-DD]

> **Sesión:** [identificador / tool]
> **Spec activa:** [`docs/specs/<nombre>.md`](ruta)
> **Severity:** [baja / media / alta / crítica]

## 1. Qué se intentaba

- **Objetivo de la sesión:** [una línea]
- **Tarea específica:** [referencia a `.planning/tasks/<id>.md` o descripción]

## 2. Qué falló y cuándo

> El síntoma observable, no la interpretación. "El agente afirmó que los
> tests pasaban pero el CI los mostraba en rojo" es observable; "el
> agente mintió" es interpretación.

- **Síntoma:** [qué viste, con evidencia: log, diff, mensaje]
- **Momento:** [en qué punto de la sesión — inicio, mitad, al cerrar]
- **Daño:** [qué se perdió: tiempo, código, datos, confianza]

## 3. Clase de falla

> Clasifícala con la taxonomía de M7 §7.1 y el cheatsheet de 12 clases.

- **Clase macro:** [contexto / tools / trayectoria / acción / sandbox]
- **Modo concreto:** [uno de los 12 del cheatsheet]
- **Por qué esa clase y no otra:** [qué observable la descarta o confirma]

## 4. Por qué no lo atrapó el harness

> La pregunta más importante. El harness existe para atrapar esto; si
  no lo hizo, algo faltó.

- [ ] **Sensor computacional faltante** — ¿qué sensor lo habría
  detectado? (typecheck, test, diff guard, secret scan)
- [ ] **Regla solo advisory** — ¿qué regla del AGENTS.md era solo texto y
  debía ser hook?
- [ ] **Gate inexistente** — ¿qué punto de control faltó en el pipeline
  (M6 §6.8)?
- [ ] **Spec ambigua** — ¿faltaba un no-objetivo o un AC que habría
  prevenido el drift?
- [ ] **Contexto mal gestionado** — ¿se llegó a la falla con contexto
  saturado (M4)?

## 5. Mitigación a instalar

> Lo concreto que cambia el harness. Si no produces una, el postmortem
  no sirvió.

- **Acción:** [ej: "Agregar hook pre-commit que detecte test gaming por
  ratio test/src."]
- **Capa destino:** [hook / scoped rule / AGENTS.md / spec / CI gate]
- **Responsable:** [quién la instala]
- **Plazo:** [cuándo]

## 6. Recurrencia esperada

- **¿Es de la clase que se repite?** [sí/no — contexto y tools son
  recurrentes; sandbox suele ser puntual]
- **Frecuencia esperada sin mitigación:** [alta / media / baja]
- **Frecuencia esperada con la mitigación del punto 5:** [alta / media / baja]

## 7. Lección portátil

> Una línea que pueda ir al AGENTS.md o a un gotcha, sin contexto de
  este incidente específico.

- [Ej: "Si el agente reporta 'tests passing' sin mostrar el comando,
  exige el output textual antes de aceptar.]

<!--
  Recordatorio: el valor del postmortem no está en el documento, está en
  la mitigación del punto 5. Si pasa un mes y la mitigación no se instaló,
  el incidente se repetirá. Revisa el punto 5 en la próxima sesión.
-->