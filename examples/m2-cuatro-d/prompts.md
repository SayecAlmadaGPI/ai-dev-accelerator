<!--
  examples/m2-cuatro-d/prompts.md
  ------------------------------
  Los prompts literales del flujo agéntico para este ejemplo — la versión
  del Nivel 1.5 (M2 §2.8, templates/sdd-tdd-vanilla.md) aplicada a este
  feature. Cada fase muestra qué le pediste al agente y qué debía
  devolverte como evidencia.
-->

# Los prompts del flujo agéntico

Estos son los prompts que convierten el ejemplo en un **proceso de
desarrollo agéntico**: los pegas en tu agente (Claude Code, Codex, Cursor…
cualquiera), en orden, y verificas la evidencia que cada uno devuelve.

## Prompt 1 — Arranque: configurar la disciplina (DDD + SDD + TDD)

```text
Vamos a implementar el contexto "Préstamos" de este repositorio con la
disciplina SDD + TDD. Antes de escribir código:

1. Lee examples/m2-cuatro-d/1-dominio/README.md (el lenguaje ubicuo y el
   bounded context) y examples/m2-cuatro-d/2-spec/spec.md (el contrato).
2. Confírmame en 3 líneas: qué nombres usarás (Socio, Libro, Préstamo,
   activo, Retirado — sin sinónimos), qué cuentas como tarea terminada
   (ACs como escenarios) y qué hace que te detengas y preguntes.
3. El código vive SOLO dentro de este bounded context: nada de catálogo,
   multas ni reservas.
4. Cada tarea sigue el ciclo RED (test que falla, mostrado) → GREEN
   (código mínimo) → REFACTOR (sin cambiar comportamiento). Muestra la
   salida de los tests en cada fase.

Confirma con "SDD+TDD activa" y lista las tareas en el orden que las
implementarías. Espera mi aprobación.
```

## Prompt 2 — Por tarea (el AC como escenario es el AC)

```text
Implementa la tarea AC-1 de examples/m2-cuatro-d/2-spec/spec.md. El AC es
el escenario BDD:

  Given un socio con 2 préstamos activos
  And un libro disponible
  When el socio pide prestado el libro
  Then se crea un préstamo activo con vencimiento a 14 días

Ciclo obligatorio:
1. RED: escribe el test del escenario (lenguaje ubicuo, casos borde) y
   muéstrame la salida FALLANDO.
2. GREEN: el código mínimo que lo hace pasar. Usa SOLO el lenguaje
   ubicuo. Muestra TODOS los tests en verde.
3. REFACTOR: mejora sin cambiar comportamiento; los tests siguen verdes.
4. Cierra con DONE/VERIFIED: qué AC cubriste, qué NO verificaste,
   supuestos.

Si el escenario tiene alguna ambigüedad: detente y pregunta, no inventes.
```

## Prompt 3 — Auditoría de mutación (proteger las decisiones)

```text
Auditoría de mutación sobre tu implementación:
1. Muta LIMITE_PRESTAMOS de 3 a 4 y corre los tests. Si NINGÚN test
   falla, tu suite no protege la decisión del límite: arregla el test.
2. Muta DIAS_VENCIMIENTO de 14 a 7 y repite.
3. Restaura los valores y muéstrame ambas corridas.
```

Resultado esperado (medido en este ejemplo): con `LIMITE = 4`, AC-2 falla
("límite alcanzado" ya no ocurre con 3 activos); con `DIAS = 7`, AC-1 y
AC-4 fallan. Ningún mutante sobrevive → las decisiones están protegidas.

## Prompt 4 — Cierre (DONE/VERIFIED, M6 §6.5)

```text
Antes de declarar la tarea terminada:

| AC | Evidencia (comando + salida) | Resultado |

Y lista: (a) qué NO verificaste, (b) supuestos, (c) qué revisa un humano
primero. Sin la tabla, no está DONE.
```

## Dónde aparece cada D en estos prompts

| Prompt | La D que opera |
|---|---|
| 1 (arranque) | **DDD** (el agente adopta el lenguaje ubicuo y el bounded context) + **SDD** (confirma el contrato) |
| 2 (por tarea) | **BDD** (el escenario es el AC) + **TDD** (el ciclo) |
| 3 (auditoría) | **TDD** auditado con mutation testing |
| 4 (cierre) | **SDD** — la evidencia contra los ACs del contrato |