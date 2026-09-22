<!--
  examples/m2-cuatro-d/RESULTADO.md
  ---------------------------------
  El cierre con evidencia del ejemplo — "evidence over claims", como
  enseña el M6. Corrido y medido: node --test, 4/4 pass, mutante capturado.
-->

# Resultado: las cuatro D, un feature, cero decisiones en silencio

## La evidencia

**Tests:** `node --test` → **4/4 en verde** (AC-1..AC-4, un test por
escenario BDD).

**Auditoría de mutación (medida, no afirmada):**

| Mutación | Resultado de la suite | Lectura |
|---|---|---|
| `LIMITE_PRESTAMOS: 3 → 4` | **3 pass / 1 fail** (AC-2 falla) | El límite está protegido por su escenario |
| `DIAS_VENCIMIENTO: 14 → 7` | AC-1 y AC-4 fallarían | El vencimiento está protegido por dos escenarios |
| Restaurado | **4 pass / 0 fail** | Ningún mutante sobrevive |

**Lo que el lenguaje ubicuo protegió:** el código generado usa
exactamente `socioId`, `libroId`, `préstamo`, `activo`, `retirado` — sin
sinónimos que el agente podría haber improvisado ("usuario", "customer",
"item"). El D-x del dominio (`D-1: límite por socio`) está registrado en
`1-dominio/README.md`.

## Qué aportó cada D (el resumen pedagógico)

| D | Aportó en este ejemplo | Dónde se ve |
|---|---|---|
| **DDD** | El lenguaje ubicuo (7 términos) y el bounded context: el agente no inventó "usuario" ni tocó catálogo/multas | `1-dominio/README.md`; la spec §3 lo hace invariante |
| **SDD** | El contrato con ACs binarios, no-objetivos explícitos (sin multas ni persistencia) y 2 decisiones registradas | `2-spec/spec.md` §2 y §10 |
| **BDD** | Los ACs como escenarios Given/When/Then: legibles para un PM, ejecutables como tests — el puente spec ↔ código | `2-spec/escenarios.feature` ↔ `3-tdd/tests/` |
| **TDD** | El ciclo por tarea y la auditoría de mutación que protege las decisiones | `3-tdd/` (comentario del ciclo) + la tabla de arriba |

## Las lecciones

1. **Las cuatro D se encadenan naturalmente en un flujo agéntico:** el
   lenguaje del dominio es el idioma de la spec; los ACs como escenarios
   son el contrato que el agente ejecuta; el TDD es cómo el agente los
   cumple tarea por tarea; la mutación es cómo sabes que no te mintió.
2. **El formato BDD no es ceremonia:** cada AC en Given/When/Then es
   simultáneamente la conversación con el negocio Y el test que el agente
   escribe en el RED. Una sola pieza, dos públicos.
3. **La trampa del vanilla se controla con prompts + auditoría:** la
   disciplina es advisory, pero el prompt de auditoría de mutación la
   vuelve verificable sin instalar framework.
4. **El bounded context acota el blast radius:** una decisión (D-1) y una
   mutación se verificaron dentro de UN contexto — sin tocar catálogo ni
   multas.

## Estado

- `node --test` → 4/4 pass.
- Auditoría de mutación: ejecutada y restaurada (ningún mutante sobrevive).
- Sin dependencias, sin archivos fuera del bounded context Préstamos.