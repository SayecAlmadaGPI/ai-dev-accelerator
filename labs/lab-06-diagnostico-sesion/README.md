<!--
  lab-06-diagnostico-sesion/README.md
  ------------------------------------
  Lab 06 — Diagnóstico de sesión. Tomar UNA sesión real con tu agente
  (o la transcripción de una fallida) y diagnosticarla con el vocabulario
  del M0: clasificar cada falla, nombrar cada fenómeno con evidencia
  citada y prescribir la respuesta correcta por fenómeno. Fase 4.

  Ejercita: M0 (lenguaje operativo, modos de falla), M4 §4.2 (umbrales
  de compaction para las prescripciones).

  Principio del lab: "se puso raro" no es diagnóstico. El vocabulario
  del M0 solo se vuelve habilidad cuando lo usas contra una sesión real
  — con citas textuales, no con impresiones.
-->

# Lab 06 — Diagnóstico de sesión

> **Objetivo:** dejar de decir "se puso raro, le voy a reabrir". Tomas
> una sesión real tuya, la recorres con el glosario del M0 y produces un
> diagnóstico con nombres y evidencia: qué fenómeno pasó, en qué turno,
> y cuál era la respuesta correcta. Al final, aplicas al menos una
> prescripción en una sesión nueva y mides el resultado.

## Módulos que ejercita

- **M0** — lenguaje operativo: modos de falla (§0.4), glosario compacto
  (§0.9), handoffs y compaction como vocabulario (§0.5).
- **M4 §4.2** — umbrales de compaction (60% / 70% / autocompact) que
  sostienen las prescripciones.

> **Calentamiento (opcional):** la página del Módulo 0 en el sitio trae
> el widget de práctica `m0-diagnostico` — un terminal con una sesión
> degradada para calentar el ojo antes de diagnosticar la tuya.

## Parte 1 — Captura una sesión

Elige UNA sesión real reciente con tu agente. Ideal: una que "se puso
rara" o que cerraste frustrado. Sirve cualquiera con sustancia (≥20
turnos o ≥30 minutos); si no tienes ninguna a mano, usa la transcripción
de una sesión fallida.

1. Exporta la transcripción completa (la mayoría de las tools permite
   exportar; si no, copia el historial completo a `sesion-raw.md`).
2. Registra los números que puedas: turnos totales, % de contexto al
   final, tamaño aproximado del contexto acumulado.
3. **No la limpies ni la edites.** La evidencia cruda es el insumo; una
   transcripción "arreglada" no es evidencia.

## Parte 2 — Nombra cada fenómeno

Recorre la transcripción y marca cada momento donde algo falló, se
degradó o te desconcertó. Para cada uno, nómbralo con el glosario
compacto del M0 (§0.9). Preguntas guía — las del §0.4:

- ¿El agente afirmó algo falso (una API que no existe, una función
  inventada)? → **hallucination factuality**.
- ¿Hizo algo distinto a lo pedido, aunque fuera correcto en sí mismo?
  → **hallucination faithfulness**. Clasifica cuál de las dos fue: se
  corrigen distinto.
- ¿Empezó a ignorar reglas que respetaba al principio, repitió errores
  ya corregidos, olvidó constraints? → **dumb zone / attention
  degradation** (context rot, M4 §4.1.3).
- ¿Te dio la razón en algo que merecía discusión? → **sycophancy**.
- ¿Usó una API o patrón desactualizado? → **knowledge cutoff** /
  parametric vs. contextual knowledge.
- ¿"Recordó" cómo era el código sin leerlo esta sesión? → **primary vs.
  secondary source**.
- ¿El costo se disparó o el agente "olvidó" reglas tras cambiar algo al
  inicio del prompt? → **prefix cache** invalidado (M0 §0.1).

> Cada fenómeno nombrado necesita **evidencia citada**: número de turno
> (o marca de tiempo) + la frase textual que lo evidencia. "Me pareció
> que alucinó" no cuenta; la cita sí.

## Parte 3 — Prescribe la respuesta

Para cada fenómeno nombrado, prescribe lo que el fenómeno dicta — no
"pedirle otra vez con más énfasis":

| Fenómeno | Prescripción |
|----------|--------------|
| Dumb zone / attention degradation | Compactar proactivo al ~60% o cerrar con handoff si el trabajo no terminó (M4 §4.2.2, §4.2.4). No esperar el autocompact. |
| Hallucination factuality | Grounding: forzar primary source — que lea el código real antes de afirmar. |
| Hallucination faithfulness | Spec con no-objetivos y AC; verificar contra el alcance, no contra la prosa (M2). |
| Sycophancy | Grilling: pedir evidencia, no validación. |
| Knowledge cutoff | Darle la API/docs en archivos (contextual knowledge), no asumir que "la sabe". |
| Primary/secondary drift | "Léelo y dime" — la primary source siempre gana (M0 §0.5). |
| Cache invalidado | System prompt / AGENTS.md estable; reglas al inicio, no dispersas. |
| Instrucciones viejas contaminando | Clearing (`/clear`) entre tareas no relacionadas (M0 §0.5). |

Escribe la prescripción al lado de cada fenómeno en tu tabla de la
Parte 2. Si un fenómeno no aparece en tu sesión, no lo inventes — el
diagnóstico honesto también es resultado.

## Parte 4 — RESULTADO.md

1. La **tabla fenómeno → evidencia (cita) → prescripción**, con el
   conteo de turnos y contexto de la sesión analizada.
2. **Al menos 1 prescripción accionada** en una sesión nueva (p. ej.
   compactar al 60% en vez de dejarla llegar a 83%) y su resultado
   observado: ¿cambió algo? ¿Qué mediste?
3. **"Qué fenómeno me pasa a mí":** tu patrón personal. ¿Qué se repite
   en tus sesiones? Ese patrón es tu primer candidato a regla
   permanente.

## Criterio de terminación

- ≥5 fenómenos nombrados, cada uno con evidencia citada (turno + frase
  textual) y clasificación factuality vs. faithfulness donde aplique.
- ≥1 prescripción accionada en una sesión nueva, con el resultado
  registrado (qué hiciste, qué esperabas, qué pasó).
- `RESULTADO.md` con la tabla completa + tu patrón personal.

## Rúbrica de dominio

Autoevalúate al terminar (regístralo en tu `RESULTADO.md`):

| Nivel | Criterios observables |
|-------|----------------------|
| **Mínimo** | La sesión está capturada (transcripción cruda + números) y el diagnóstico nombra ≥5 fenómenos con evidencia citada — turno y frase textual — en la tabla de `RESULTADO.md`. |
| **Medio** | Todo el criterio: factuality vs. faithfulness clasificado correctamente en cada caso que aplique, cada fenómeno con su prescripción de la tabla del M4 §4.2 / M0, y ≥1 prescripción accionada en una sesión nueva con su resultado observado. |
| **Completo** | Criterio + el patrón personal identificado con evidencia de recurrencia (el mismo fenómeno en ≥2 sesiones o en ≥2 momentos de la misma) y una prescripción preventiva **instalada** (regla en AGENTS.md, hábito de compact al 60%, grilling como default) que ataca la causa del patrón, no el síntoma. |

## Qué debes haber aprendido

- Que nombrar el fenómeno con precisión es el diagnóstico: el nombre
  correcto te da la mitigación correcta.
- Que factuality y faithfulness se corrigen distinto — confundirlas te
  hace aplicar la mitigación equivocada.
- Que la dumb zone no se arregla insistiendo: se compacta o se cierra
  con handoff (M4).
- Qué fenómeno te pasa a ti — y por eso, qué regla merece un lugar
  permanente en tu harness.

## Referencias

- `modules/00-lenguaje-operativo.md` §0.4 (modos de falla), §0.5
  (handoffs), §0.9 (glosario compacto)
- `modules/04-handoffs.md` §4.1, §4.2 (fases de sesión, umbrales)
- `templates/handoff.md` (para cuando la prescripción sea cerrar)