<!--
  AGENTS.md — Contrato canónico del proyecto para el agente
  ----------------------------------------------------------
  Este archivo es la capa de feedforward más estable del harness (ver M1)
  y la fuente de verdad portable entre herramientas (ver M3). Claude Code lo
  lee como CLAUDE.md (enlázalo o usa @imports); otros agentes lo leen como
  AGENTS.md. Una sola fuente, muchas herramientas.

  Principio rector: cada línea debe ganar su lugar. Si la quitas y el agente
  no se equivoca en nada concreto, era ruido. Córta la. La meta es densidad de
  signal, no volumen. Por debajo de ~150-200 líneas efectivas.

  Cómo usar este template:
  1. Reemplaza cada bloque [ENTRE CORCHETES]] con la realidad del proyecto.
  2. Borra las secciones que no apliquen. Un AGENTS.md que dice "N/A" en todo
     pierde peso.
  3. No delegues el llenado a ciegas al skill /init. Úsalo como borrador y edita
     cada línea con tu juicio.
-->

# AGENTS.md — [Nombre del proyecto]

> **Tesis:** [una línea que describe qué es el proyecto y qué contrato firme
> ofrece al agente. Ej: "API REST de facturación; TypeScript estricto, sin
> `any`, tests sobre los criterios de aceptación de cada spec."]

## 1. Para empezar (lo que el agente necesita sí o sí)

- **Stack:** [lenguaje, framework, runtime, base de datos, gestor de paquetes].
- **Comandos canónicos:**
  - Instalar dependencias: `[comando]`
  - Correr tests: `[comando]` (un solo comando; si hay varios, cuál es el de
    guarda).
  - Typecheck / lint: `[comando]`
  - Build local: `[comando]`
- **Estructura raíz:**
  - `src/` — [qué vive acá]
  - `tests/` — [convención de naming de tests]
  - `docs/specs/` — specs que rigen cada feature (ver M2)
  - `.planning/` — estado del loop GSD cuando aplica (ver M2)
- **Runtime / versiones:** [Node 20, Python 3.12, etc.]. Ver `.tool-versions`
  / `package.json` engines; no lo dupliques si ya está ahí.

## 2. Reglas estables (lo que el agente debe respetar)

### 2.1 Estilo y formato

- [Ej: "TypeScript estricto, `noImplicitAny`, sin `any` ni `@ts-ignore`."]
- [Ej: "Funciones puras en `src/domain/`; side effects solo en `src/adapters/`."]
- [Ej: "Commits en conventional commits; el hook pre-commit lo verifica."]

### 2.2 Tests

- [Ej: "Todo cambio de comportamiento viene con un test que lo reproduce.
  Tests sobre criterios de aceptación, no tests genéricos."]
- [Ej: "No uses `any` en fixtures; tipa los datos de prueba."]

### 2.3 Paths críticas (gate obligatorio)

- **Migraciones de DB:** no se editan migraciones ya aplicadas; se crean nuevas.
- **Configs de prod / CI:** no se modifican sin revisión humana explícita.
- **`docs/specs/*.md` aprobados:** no se alteran sin abrir un nuevo spec de cambio.

> Estas paths deben tener, además de esta prosa, un hook que las proteja (ver M3
> §3.6). La prosa es advisory; el hook es mecánico.

## 3. Gotchas (lo que rompiste una vez y no quieres volver a romper)

- [Ej: "El campo `amount` se guarda en centavos, no en la unidad monetaria.
  Cualquier cálculo que lo asuma en unidad está mal."]
- [Ej: "El servicio X reintenta 3 veces antes de fallar; no agregues retries
  propios encima."]
- [Ej: "El job Y depende del timezone del container (UTC); no uses hora local."]

> Mantén esta sección corta y específica. Un gotcha genérico ("cuidado con
> los nulls") no aporta; uno concreto ("el endpoint Z devuelve null, no
> []") sí.

## 4. Cómo se trabaja en este repo

- **Spec primero:** toda feature no trivial empieza con un `spec.md` (ver M2 y
  `templates/spec.md`).
- **Plan antes de programar:** el spec se descompone en un plan TDD (ver
  `templates/plan.md`) antes de tocar código.
- **Reporte de cierre:** cada tarea termina con DONE/VERIFIED explícito (ver M2
  tarea `_template.md`): qué se verificó, qué no, supuestos, qué revisa un humano.

## 5. Lo que el agente puede inferir del código (NO repetir acá)

- [Ej: "La convención de naming de tests ya se ve en `tests/`; no la documentes."]
- [Ej: "Las dependencias ya están en `package.json`; no las listes acá."]

> Si el `package.json` ya dice que usas Jest, no hace falta repetirlo. Cada
> línea que el agente puede inferir es ruido que le quita un slot de atención.

## 6. Referencias internas

- Specs: `docs/specs/` (plantilla: `templates/spec.md`)
- Planes: `templates/plan.md`
- Estado GSD: `.planning/` (plantillas: `templates/.planning/`)
- Checklist de harness: `templates/harness-design-checklist.md`
- Matriz de compatibilidad entre herramientas: `templates/cross-tool-compatibility-matrix.md`

<!--
  Recordatorio de mantenimiento: cada vez que una regla de texto de esta
  sección 2 se incumpla repetidamente, pregúntate si merece ascender a un
  check determinista (hook) o a un generador. El harness madura de prosa
  hacia mecánica, no al revés.
-->