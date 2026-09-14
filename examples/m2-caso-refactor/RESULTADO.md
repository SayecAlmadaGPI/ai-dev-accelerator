# RESULTADO — Refactor de `order_totals`: qué se caracterizó y qué cambió

> Caso trabajado del M8 §8.2. Orden de lectura: `legacy/` →
> `legacy/order_totals.test.js` → `spec.md` → `plan.md` → `refactored/`
> → este archivo.

---

## Qué se caracterizó primero (y por qué eso y no otra cosa)

Antes de tocar nada, se ejecutó el legacy con 19 entradas elegidas para
acorralar cada regla — incluidas las raras y las fronteras — y sus
outputs reales quedaron fijados como golden values en
`characterization_suite.js`. Lo que se caracterizó:

| Frontera / raro | Caso que lo fija | Golden clave |
|---|---|---|
| Cupón percent bajo el mínimo (raro #3) | subtotal 99999 vs mín 100000 | descuento **0**, en silencio |
| Mínimo inclusivo (`>=`) | subtotal 100000 vs mín 100000 | descuento **10000** |
| Expiración inclusiva (raro #2) | vence `2026-03-01`, hoy es `2026-03-01` | descuento **0** |
| Sin `now` no expira nada (raro #1) | cupón vencido en 2020, sin `now` | descuento **aplica** |
| Floor del descuento (raro #4) | 10% de 149.95 | 14.99, no 14.995 |
| Clamp del fixed (raro #5) | fixed 9999 sobre subtotal 3000 | descuento 3000 |
| Envío post-descuento (raro #7) | 210000 − 15000 = 195000 | envío **4900**, no 0 |
| Umbral exacto de envío | base 200000.00 vs 199999.98 | **0** vs **4900** |
| Pedido vacío cobra envío (raro #8) | items `[]` | total **9900** |
| Redondeo IVA con flotantes | 100.5 × 19% | **19.10** (la calculadora da 19.095) |
| Redondeo IVA en `.5` | 25.5 × 19% | **4.85** |
| Subtotal con flotantes | 10.10 × 3 | **30.30** |

Detalle que justifica todo el método: los dos casos de IVA redondeado
salieron AL REVÉS de lo que la aritmética "de colegio" predice
(19.095 → 19.10, y 4.845 → 4.85). Ningún cálculo mental era confiable;
los golden values se fijaron ejecutando, no suponiendo. Ese es el
argumento operativo de "caracterización antes que refactor".

## Qué quedó en verde (salidas reales)

Suite de caracterización (19 casos) contra el legacy, ANTES de refactorizar:

```
$ node --test legacy/order_totals.test.js
ℹ tests 19
ℹ pass 19
ℹ fail 0
```

La MISMA suite (mismo archivo, cero diffs) contra el refactored:

```
$ node --test refactored/order_totals.test.js
ℹ tests 19
ℹ pass 19
ℹ fail 0
```

Dual-run completo desde este directorio:

```
$ node --test
ℹ tests 38
ℹ pass 38
ℹ fail 0
ℹ duration_ms 95.3
```

Los 5 AC de `spec.md` se verificaron binariamente (AC-1 y AC-2 arriba;
AC-3 firma idéntica la pincha el `deepEqual` de cada golden; AC-4 cero
dependencias — solo `node:test` y `node:assert`; AC-5 tres tareas con
verde entre cada una, ver `plan.md`).

**Mutation check** (M8 §8.2.1.4): se eliminó el clamp del cupón fixed
(raro #5) en `refactored/cupones.js` a propósito:

```
$ node --test refactored/order_totals.test.js   # con la mutación
ℹ tests 19
ℹ pass 18
ℹ fail 1      # [refactored] raro #5 — cupón fixed mayor que el subtotal se recorta
```

Restaurado el clamp → 19 pass. La suite captura mutaciones; no es
ornamento verde.

## Cómo la misma suite corre contra ambos (decisión D-1 de la spec)

`characterization_suite.js` es **paramétrica**: `registerTotalsSuite(mod,
target)` registra los 19 tests contra el módulo que le pasen. Los
wrappers son de 4 líneas:

- `legacy/order_totals.test.js` → `registerTotalsSuite(totals, 'legacy')`
- `refactored/order_totals.test.js` → `registerTotalsSuite(totals, 'refactored')`

Una suite copiada por directorio deriva en cuanto alguien edita solo una
de las copias; la fuente única hace imposible ese drift y convierte el
"la misma suite pasa contra ambos" en literal, no en aspiración.

## Qué NO cambió (comportamiento) y qué sí (estructura)

**No cambió — está contratado por la suite:**
- Los outputs para las 19 entradas caracterizadas (y por extensión, el
  pipeline para todo el dominio cubierto): mismos redondeos, mismas
  fronteras, mismos silencios.
- La firma pública: `calculateTotals(order, now)` con default export y
  shape `{ subtotal, discount, tax, shipping, total }`.
- Los 8 comportamientos raros, con sus efectos exactos (tabla de arriba).
- Cero dependencias, cero manejo de errores nuevo.

**Sí cambió:**
- Un archivo monolítico de ~95 líneas → tres módulos con una
  responsabilidad cada uno: `cupones.js` (descuentos), `tax_shipping.js`
  (IVA + envío) y un `order_totals.js` que solo orquesta.
- Cada raro ahora está etiquetado y vive donde se puede encontrar, en
  vez de enterrado en un `if` dentro de una función de 60 líneas.

## Lecciones (por qué caracterización antes que refactor)

1. **El legacy sabe cosas que nadie documentó.** Los dos casos de IVA
   redondeado contradecían el cálculo mental; cualquier "mejora" de
   redondeo los habría cambiado silenciosamente.
2. **Los golden values se fijan ejecutando, no calculando.** Con
   flotantes, ni siquiera el refactor puede confiar en "es la misma
   fórmula": el orden de `subtotal * value / 100 * 100` se copió tal
   cual porque reordenar la multiplicación cambia el floor.
3. **La suite es la spec ejecutable.** Sección 3 de `spec.md` (los
   invariantes) no es prosa: es la tabla `GOLDEN` corriendo. El AC-2
   ("misma suite en verde contra ambos") no admite interpretación.
4. **Refactor y fix de negocio van separados.** El pedido vacío que
   cobra envío probablemente sea un bug — pero es un bug DE NEGOCIO con
   ticket propio. Aquí se preservó y se dejó anotado como sugerencia en
   el code review del `plan.md`.