# Plan de implementación: Refactor de `order_totals` (monolito → módulos)

> **Spec de origen:** `./spec.md`
> **Branch / worktree:** `refactor/order-totals` (worktree aislado, M7 §7.3;
> aquí, el aislamiento es que `refactored/` es un directorio nuevo y el
> legacy queda intocado como oráculo)
> **Autor del plan:** [Tech Lead]
> **Fecha:** 2026-09-14
> **Estado:** completado

---

## 0. Preparación del workspace

- [x] Baseline en verde ANTES de empezar: la suite de caracterización pasa
  contra el legacy (`node --test legacy/order_totals.test.js` → 19 pass).
- [x] Si el baseline no pasara, DETENTE: no se refactoriza sobre arena
  movediza (aquí el legacy era el baseline y pasó a la primera).

> Nota sobre las verificaciones: `node --test` acepta los paths de los
> archivos de test como argumentos. Este repo es ESM (`"type": "module"`),
  así que los imports llevan extensión `.js`.

---

## Resumen del plan

| # | Tarea | Archivos principales | Verificación (binaria) |
|---|-------|-----------------------|------------------------|
| 1 | Extraer reglas de cupones | `refactored/cupones.js` | suite verde contra refactored en formación |
| 2 | Extraer impuesto y envío | `refactored/tax_shipping.js` | suite verde contra refactored en formación |
| 3 | Componer el orquestador | `refactored/order_totals.js` | suite verde contra legacy Y refactored |

> Cada tarea es "extraer y volver a verde", no "extraer y mejorar". Si en
> medio de una tarea aparece la tentación de arreglar un raro: es un
> no-objetivo de la spec, sección 2.

---

## Tarea 1: Extraer reglas de cupones

**Objetivo:** que las reglas de cupón (raros #1-#6) vivan solas en
`cupones.js`, sin tocar el resto.

**Pasos:**
1. Crea `refactored/cupones.js` con `couponDiscount(subtotal, coupon, now)`.
2. Mueve la lógica de cupones TAL CUAL, incluidas las expresiones
   numéricas: `Math.floor((subtotal * coupon.value / 100) * 100) / 100`
   se copia sin "simplificar" (con flotantes, reordenar cambia el
   redondeo).
3. En el `order_totals.js` en formación, reemplaza el bloque de cupones
   por una llamada a `couponDiscount`.

**Verificación de la tarea (binaria):**
- [x] `node --test legacy/order_totals.test.js refactored/order_totals.test.js`
  → 38 pass, 0 fail.

---

## Tarea 2: Extraer impuesto y envío

**Objetivo:** que IVA y tabla de envío (raros #7-#8) vivan en
`tax_shipping.js`.

**Pasos:**
1. Crea `refactored/tax_shipping.js` con `taxFor(base)` y
   `shippingFor(base)`.
2. Copia `IVA = 0.19` y `UMBRALES_ENVIO` tal cual (mover el IVA a config
   es un no-objetivo).
3. Reemplaza en el orquestador los cálculos inline por las llamadas.
   OJO: ambas funciones reciben la base POST-descuento (raro #7).

**Verificación de la tarea (binaria):**
- [x] Misma suite → 38 pass, 0 fail.

---

## Tarea 3: Componer el orquestador

**Objetivo:** `refactored/order_totals.js` queda como pura orquestación
(subtotal → descuento → base → tax/envío → total) con la MISMA firma
pública que el legacy.

**Pasos:**
1. Revisa que no quede ninguna regla de negocio dentro del orquestador.
2. Firma pública idéntica: default export `{ calculateTotals }`.
3. Corre el dual-run completo: MISMA suite contra legacy y refactored.

**Verificación de la tarea (binaria):**
- [x] `node --test` (autodescubrimiento desde este directorio) → 38 pass,
  0 fail: 19 contra legacy + 19 contra refactored, mismos golden values.

---

## Integración y verificación final

1. Suite completa en verde contra ambos (dual-run). ✅
2. Cada AC de la spec:
   - AC-1: suite verde contra legacy ANTES. ✅ (19 pass)
   - AC-2: MISMA suite verde contra refactored DESPUÉS. ✅ (19 pass)
   - AC-3: firma pública idéntica. ✅ (golden `deepEqual` pincha shape)
   - AC-4: cero dependencias nuevas. ✅ (solo `node:test`, `node:assert`)
   - AC-5: 3 tareas con verde entre cada una. ✅
3. Invariantes: sin re-ejecutar, la suite ES la verificación de los
   invariantes (sección 3 de la spec). ✅
4. Diff fuera de alcance: solo `refactored/` + la suite nueva; el legacy
   no se tocó. ✅

**Mutation check (post-implementación):** quitar el clamp del cupón fixed
(raro #5) hace fallar 1 test de 19; restaurar deja 19 pass. La suite
captura mutaciones, no solo "pasa".

**Definición de "Plan completado":**
- [x] Tareas 1-3 ✅ con sus verificaciones ejecutadas.
- [x] Todos los AC de la spec verificados (salidas en `RESULTADO.md`).
- [x] Code review: cada regla en un solo módulo; sin abstracciones nuevas
  más allá de los 3 archivos; sin lógica duplicada.

---

## Code review (post-implementación)

**Checklist:**
- [x] No hay código sin test: los 3 módulos se ejercitan vía la firma
  pública del orquestador.
- [x] No se introdujeron abstracciones innecesarias (YAGNI): ni interfaz
  de estrategias de cupón ni config de IVA.
- [x] No se duplicó lógica existente: `roundMoney` se duplicó
  deliberadamente (una línea en cada módulo que la usa; decisión
  documentada en el propio archivo).

**Hallazgos:**
- Ninguno bloqueante. Sugerencia para OTRO ticket (no-objetivo aquí):
  decidir de negocio qué hacer con el pedido vacío que cobra envío.

---

## Cierre del branch

- [x] Todos los tests en verde (38/38, dual-run).
- [x] El "merge" aquí es pedagógico: el caso queda publicado con legacy y
  refactored lado a lado, con `RESULTADO.md` como bitácora.
- [x] Spec actualizada a estado `verificada`.