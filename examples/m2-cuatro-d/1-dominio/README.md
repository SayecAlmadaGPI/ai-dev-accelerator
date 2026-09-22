# 1 — Dominio: el lenguaje ubicuo y el bounded context (DDD)

> **DDD nombra.** Antes de escribir una sola línea de spec, acuerdas el
> idioma: qué significa cada palabra del dominio y dónde están las
> fronteras. Es el idioma en que se escribirán la spec, los ACs y los
> tests — y el que el agente debe respetar.

## Bounded context: **Préstamos**

Este ejemplo vive en UN solo contexto. Lo que NO está aquí deliberadamente:
multas, reservas, catálogo, socios con datos personales. Cada uno sería su
propio contexto con su propia spec — y su propia frontera de paralelización
(M2 §2.3: paraleliza lo que no comparte archivos).

## El lenguaje ubicuo

| Término | Significado acordado | Por qué importa para el agente |
|---|---|---|
| **Socio** | Persona que pide prestados libros, identificada por `socioId` | El agente no inventa un objeto "Usuario" ni "Cliente" |
| **Libro** | Un ejemplar identificable por `libroId`, con estado `disponible` o `retirado` | "Libro" NO es su contenido ni su título: es un ejemplar con estado |
| **Préstamo** | La unidad de trabajo: un libro prestado a un socio con fecha | Es el agregado central: se crea, se consulta, se devuelve |
| **Préstamo activo** | Un préstamo sin devolución registrada | El límite de abajo cuenta ESTOS, no todos los históricos |
| **Límite** | Máximo **3** préstamos activos por socio | Número de negocio: vive como constante nombrada, no mágica en el código |
| **Vencimiento** | `fecha de préstamo + 14 días`, exacto | "Dos semanas" es ambiguo; 14 días es un AC |
| **Retirado** | Un libro dado de baja del préstamo para siempre | No es "no disponible temporalmente": no se presta ni con el catálogo vacío |

## Por qué esto es DDD y no "poner nombres bonitos"

1. **El lenguaje ubicuo es un CONTRATO de palabras**: si en la spec aparece
   "usuario" y en el código "customer", el agente está improvisando una
   traducción que nadie pidió. El lenguaje acordado fuerza que el código
   generado use exactamente estos nombres.
2. **El bounded context acota la spec**: "Préstamos" no habla de multas ni
   de catálogo. Si una pregunta cae fuera (¿cómo se calcula una multa?),
   es otro contexto y otra spec — no un `[NEEDS CLARIFICATION]` de esta.
3. **Las fronteras habilitan el paralelismo**: Préstamos y Catálogo son
   contextos separados → pueden especularse e implementarse en paralelo
   sin pisarse (M2 §2.3).

## La decisión de dominio registrada (formato D-x, M2 §2.2)

```markdown
- [x] **D-1:** ¿El límite de préstamos activos es por socio o global?
  → **Tipo:** producto.
  → **Vía:** default razonable + reversible — la convención de bibliotecas
    es límite por socio.
  → **Decisión:** por socio.
  → **Por qué:** el límite protege al socio de sobre-comprometerse, no al
    inventario del libro.
  → **Coste si estaba mal:** bajo — una constante + 1 test.
  → **Reversible:** sí.
```