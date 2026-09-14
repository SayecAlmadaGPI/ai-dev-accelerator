# Spec: Refactor de `order_totals` — preservar comportamiento, cambiar estructura

> **ID:** order-totals-refactor
> **Tipo:** refactor
> **Nivel de rigor:** Spec-Anchored
> **Estado:** verificada
> **Propietario:** [Tech Lead]
> **Fecha:** 2026-09-14

---

## 1. Contexto y motivación

**Problema actual:**
`legacy/order_totals.js` calcula los totales de pedido (subtotal, cupones,
IVA, envío, total) en una sola función de ~60 líneas. Las reglas de negocio
conviven con la aritmética y la tabla de envío; cada fix nuevo obliga a
leer TODO el archivo para no romper las demás reglas. El archivo acumula 8
comportamientos "raros" que nadie se atreve a tocar porque no hay tests.

**Motivación para resolverlo ahora:**
Tres equipos piden cambios sobre este cálculo el próximo trimestre. Sin
estructura modular, cada cambio es una apuesta; con tests de caracterización
en verde, cada cambio es un diff auditable.

**Usuarios afectados / stakeholders:**
Checkout (consume `calculateTotals`). Aceptación: Tech Lead firma contra
los tests de caracterización.

---

## 2. Objetivos y no-objetivos

**Objetivos (in scope):**
- [ ] Fijar el comportamiento actual con tests de caracterización ANTES de
  tocar el código (`characterization_suite.js` corriendo contra `legacy/`).
- [ ] Extraer las reglas de cupones a `refactored/cupones.js`.
- [ ] Extraer impuesto y envío a `refactored/tax_shipping.js`.
- [ ] Dejar `refactored/order_totals.js` como orquestador con la MISMA
  firma pública que el legacy.

**No-objetivos (out of scope):**
- [ ] NO: "arreglar" ningún comportamiento raro — el cupón bajo el mínimo
  que se ignora en silencio, el envío sobre la base post-descuento, el
  pedido vacío que cobra envío, los redondeos con floor… todo se conserva.
  Eso es otro ticket, con su propia spec y su propio debate de negocio.
- [ ] NO: mover el IVA (19%) a configuración. Es scope creep de interfaz.
- [ ] NO: cambiar la firma, los tipos ni el shape del retorno.
- [ ] NO: añadir manejo de errores nuevo (el legacy no valida `order`;
  seguirá sin hacerlo).

> ⚠️ **Crítico para agentes:** los no-objetivos son la primera defensa
> contra el scope creep. Si te tienta "de paso lo mejoro": NO.

---

## 3. Invariantes y constraints

**Invariantes (los golden outputs del legacy):**
La tabla `GOLDEN` de `characterization_suite.js` ES la lista ejecutable de
invariantes. Resumen de lo que no se puede romper:

1. Sin `now`, un cupón con `expiresAt` vencido APLICA igual (raro #1).
2. Expiración inclusiva: si vence "hoy", HOY ya no vale (raro #2).
3. Cupón percent bajo `minSubtotal` → descuento 0, en silencio (raro #3).
4. Descuento percent redondeado HACIA ABAJO con `Math.floor` (raro #4).
5. Cupón fixed recortado al subtotal, nunca más (raro #5).
6. Tipo de cupón desconocido → 0, en silencio (raro #6).
7. Envío calculado sobre la base POST-descuento (raro #7).
8. Pedido sin items cobra el envío mínimo (raro #8).
9. Los redondeos con flotantes byte a byte: `Math.round`/`Math.floor`
   sobre `x * 100` con el MISMO orden de operaciones del legacy.

**Constraints técnicos:**
- **Stack:** Node ≥ 22 (repo ESM), `node --test` + `node:assert`. CERO
  dependencias nuevas.
- **Firma pública:** `calculateTotals(order, now)` →
  `{ subtotal, discount, tax, shipping, total }`, default export.

**Constraints de proceso:**
- Los tests de caracterización se escriben y pasan en verde contra el
  legacy ANTES de crear `refactored/`.
- Refactor en pasos pequeños, suite en verde entre cada uno.

---

## 4. Requisitos funcionales

### RF-1: Misma firma pública
`refactored/order_totals.js` exporta default `{ calculateTotals }`;
`calculateTotals(order, now)` acepta las mismas entradas y devuelve el
mismo shape con los mismos valores para toda entrada del dominio actual.

### RF-2: Reglas aisladas por dominio
- `cupones.js`: todo lo relativo a descuentos por cupón (raros #1-#6).
- `tax_shipping.js`: IVA y tabla de envío (raros #7-#8).
- `order_totals.js`: solo orquestación (subtotal → descuento → base →
  tax/envío → total).

---

## 5. Criterios de aceptación

- [x] **AC-1:** La suite de caracterización pasa contra el legacy ANTES de
  refactorizar.
  - **Verificación:** `node --test legacy/order_totals.test.js` → 19 pass, 0 fail.
- [x] **AC-2:** La MISMA suite pasa contra el refactored DESPUÉS.
  - **Verificación:** `node --test refactored/order_totals.test.js` → 19 pass, 0 fail.
- [x] **AC-3:** Firma pública idéntica: default export con `calculateTotals`
  y el mismo shape de retorno (lo cubre el `deepEqual` de cada golden case).
- [x] **AC-4:** Cero dependencias nuevas: solo `node:test` y `node:assert`.
- [x] **AC-5:** Refactor en 3 tareas con la suite en verde entre cada una
  (ver `plan.md`, verificación binaria por tarea).

> Regla: cada casilla es ✅/❌ sin discusión subjetiva. Las verificaciones
> se ejecutaron; la salida real está en `RESULTADO.md`.

---

## 6. Dependencias y prerequisitos

- **Depende de:** nada; el legacy corre solo.
- **Bloquea a:** los 3 cambios de negocio del próximo trimestre sobre
  cupones/envío/IVA.
- **Prerequisitos:** suite de caracterización en verde contra legacy (AC-1).

---

## 7. Diseño técnico (pista, no solución)

**Archivos / módulos afectados:**
- `legacy/order_totals.js` — solo lectura: es el oráculo de caracterización.
- `characterization_suite.js` — la spec ejecutable (golden cases).
- `refactored/{cupones,tax_shipping,order_totals}.js` — el destino.

**Pistas de implementación:**
- Las expresiones numéricas NO se reescriben: con flotantes, reordenar la
  aritmética cambia el redondeo (golden cases 17-19 lo fijan).
- `roundMoney` puede duplicarse entre módulos: es una línea; compartirlo
  sería abstracción por nada.

---

## 8. Datos de prueba / escenarios

La tabla completa de escenarios (19 golden cases, con los 8 raros y las
fronteras de envío, mínimo de cupón, expiración y redondeo) vive en
`characterization_suite.js` — es la sección 8 de esta spec, ejecutable.

---

## 9. Rollback plan

- El legacy NO se toca: revertir es borrar `refactored/`. Cero riesgo.
- El caller sigue importando el legacy hasta que el refactored lleve un
  ciclo en verde; el switcheo es un import de una línea.

---

## 10. Decisiones abiertas

- [x] **D-1:** ¿Suite única compartida o copiada por directorio? → **Única
  y paramétrica** (`registerTotalsSuite(mod, target)`): una copia por
  lado deriva en el momento en que alguien edita solo una.

> Sin `[NEEDS CLARIFICATION]` pendientes.

---

## 11. Definición de "Verificado"

Esta spec se considera **verificada** cuando:
- [x] AC-1..5 marcan ✅ con sus verificaciones ejecutadas (salida en
  `RESULTADO.md`).
- [x] La suite de caracterización no se modificó entre el legacy y el
  refactored (mismo archivo, cero diffs).
- [x] No se tocaron archivos fuera de `refactored/` y la suite nueva.

---

## 12. Trazabilidad

- **Ticket de origen:** ejemplo del M8 §8.2 (caso trabajado del curso).
- **Plan de implementación:** `plan.md`.
- **Verificación:** `RESULTADO.md` con las salidas reales de `node --test`.