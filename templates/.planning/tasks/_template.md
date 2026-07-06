<!--
  task-XX.md — Plantilla de tarea atómica estilo GSD
  ---------------------------------------------------
  Una tarea es la unidad más pequeña de trabajo ejecutable por un agente
  con contexto fresco. NO es una story ni un epic. Es algo que un agente
  puede tomar, ejecutar y marcar como hecho en una sesión corta.

  Principios GSD para tareas:
  - Atómica: no se puede subdividir sin perder sentido.
  - Ejecutable: tiene pasos concretos, no aspiraciones.
  - Autocontenida: un agente fresco puede ejecutarla sin historial.
  - Verificable: tiene un criterio binario de "hecha".
  - Contexto mínimo: lista los archivos exactos, no el repo entero.

  El agente que ejecuta esta tarea recibe contexto FRESCO:
  no hereda la conversación anterior. Por eso todo lo necesario
  debe estar escrito aquí, o referenciado por path.
-->

# Task: [Nombre corto de la tarea]

> **Phase:** [1.1]
> **Milestone:** [M1]
> **Spec ref:** [link a la sección de la spec que esta tarea satisface, ej. spec.md#RF-2]
> **Plan ref:** [link a plan.md tarea correspondiente, si existe]
> **Estado:** pendiente | en-progreso | bloqueada | verificada | archivada
> **Agente asignado:** [gsd-executor | ninguno]
> **Estimación:** [2-5 min | ~30 min]

---

## Objetivo
[Una frase: qué logra esta tarea específicamente. Si no puedes resumirlo en una frase, es más de una tarea.]

## Contexto que el agente necesita
<!-- El agente viene con contexto fresco. Dale SOLO lo relevante. -->

- **Spec relevante:** leer `spec.md` sección [RF-X] y los AC-[N].
- **Archivos a leer antes de empezar:**
  - `src/[path]` — [por qué hay que leerlo]
- **Patrón a seguir:** [ej. "sigue el patrón de src/repositories/ProjectRepo.ts"]

## Archivos a crear o modificar
- `src/[path/exact.ts]` — [qué se le hace: crear | modificar | borrar]
- `tests/[path/exact.test.ts]` — [test que cubre el cambio]

## Pasos (TDD)
1. **RED:** Escribe el test que describe el comportamiento esperado.
   - [Qué afirma el test]
2. Ejecuta: `[comando de test]` → debe fallar.
3. **GREEN:** Implementa lo mínimo para que pase.
4. Ejecuta: `[comando de test]` → debe pasar.
5. **REFACTOR:** Mejora sin romper. Ejecuta de nuevo.

## Verificación (criterio binario de "hecha")
- [ ] El test pasa: `[comando]`
- [ ] No se tocaron archivos fuera de la lista.
- [ ] No se modificaron tests existentes para hacerlos pasar (test gaming).
- [ ] `[comando de lint/typecheck]` sin errores nuevos.

## Cómo reportar al terminar (DONE/VERIFIED)
El agente debe responder con:
- **Qué verificó:** [lista de comandos ejecutados y su resultado]
- **Qué NO verificó:** [lo que quedó fuera de su alcance]
- **Supuestos:** [lo que asumió que no estaba en la task]
- **Próxima task sugerida:** [siguiente task lógica del roadmap]

## Bloqueos / [NEEDS CLARIFICATION]
- [Si hay ambigüedad, NO adivines. Marca la task como bloqueada y explica por qué.]

<!--
  Regla de oro: si el agente se encuentra queriendo tocar un archivo
  que NO está en la lista de arriba, debe DETENERSE y reportar.
  Ese es el síntoma número uno de scope creep.
-->