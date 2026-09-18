<!--
  templates/decision-record.md
  ----------------------------
  El formato mínimo para resolver un [NEEDS CLARIFICATION] con confianza
  (Módulo 2 §2.2, "El taller"). Un [NEEDS CLARIFICATION] no se borra: se
  convierte en una decisión registrada. Copia este bloque por cada D-x.
-->

# Registro de decisión (D-x) — plantilla

> **Cuándo usarlo:** cada vez que resuelves un `[NEEDS CLARIFICATION]` de la
> sección 10 de una spec. La decisión vive donde la va a leer el agente y el
> próximo humano: en la sección 10 de la spec (y, si el repo usa ADRs, con
> su enlace al ADR correspondiente — M3 §3.6).

## La plantilla

```markdown
- [x] **D-<n>:** <la pregunta, textual como estaba en la spec>
  → **Tipo:** dato faltante | producto | técnica | alcance
  → **Vía:** medido en <fuente> | default reversible | decidido por mí | escalado a <quién>
  → **Decisión:** <una frase, sin ambigüedad>
  → **Por qué:** <1-2 líneas — la razón, no el sentimiento>
  → **Opciones consideradas:** <A> (descartada por <x>), <B> (descartada por <y>)
  → **Coste si estaba mal:** <bajo/medio/alto> — <qué tocarías>
  → **Reversible:** sí/no — <cómo>
```

## El test de confianza (las tres preguntas)

Antes de borrar el `[NEEDS CLARIFICATION]`, las tres preguntas deben dar sí:

1. ¿Puedo defender esta decisión en el review sin decir "me pareció"?
2. ¿El coste si estaba mal es conocido y asumible?
3. ¿Está registrada donde el agente (y el próximo humano) la van a leer?

## Ejemplo completo

```markdown
- [x] **D-3:** ¿El endpoint acepta filtros combinados (estado + fecha) o
      solo uno a la vez?
  → **Tipo:** producto (define el contrato para el usuario).
  → **Vía:** default razonable + reversible — la convención de APIs de
    listado es filtros combinables con AND.
  → **Decisión:** filtros combinables con AND (estado AND rango).
  → **Por qué:** el caso de uso principal del ticket ("ver activos de la
    última semana") requiere ambos; excluir la combinación obligaría a un
    segundo endpoint o a filtrar en cliente.
  → **Opciones:** (a) solo un filtro por request — descartada: obliga al
    cliente a hacer dos llamadas y reconciliar; (b) OR — descartada:
    amplía resultados, no los acota, y nadie pidió "o".
  → **Coste si estaba mal:** bajo — un `WHERE` adicional + 2 tests.
  → **Reversible:** sí (cambio de contrato documentado en la spec).
```

## Anti-patrones (por qué existe esta plantilla)

- **Decidir en silencio:** borrar el marker sin registrar. La decisión se
  vuelve invisible y el "por qué" se pierde para el siguiente.
- **Delegársela al agente:** "tú decides" activa la sycophancy del modelo
  (validará lo que tú insinúes y no escalará lo que importa).
- **Escalar todo:** preguntar lo que el código, el log o la convención ya
  responden. La burocracia mata la spec.

## Referencias

- `modules/02-spec-plan-execute.md` §2.2 — "El taller" (el procedimiento completo).
- `examples/m2-unified-workflow/spec.md` — decisiones resueltas D-1/D-2 en una spec real.
- `examples/m2-unified-workflow/EJERCICIOS.md` — Ejercicio 1: práctica guiada.