// characterization_suite.js — Suite de CARACTERIZACIÓN del cálculo de totales.
//
// Regla del M8 §8.2: estos tests NO prueban correctitud; prueban NO-REGRESIÓN.
// Codifican lo que el código HACE (incluidos los 8 comportamientos raros
// documentados en legacy/order_totals.js), no lo que "debería" hacer.
//
// La MISMA suite corre contra legacy/ y refactored/ (dual-run en miniatura,
// M8 §8.6.5): los wrappers order_totals.test.js de cada directorio la
// invocan pasándole su módulo. Un refactor correcto deja ambos en verde
// con exactamente los mismos golden values.
//
// Los golden values salieron de EJECUTAR el legacy, no de una calculadora:
// en los casos de redondeo con flotantes (filas 17-19) la aritmética de
// máquina y la del colegio NO coinciden, y eso es parte del contrato.

import { test } from 'node:test';
import assert from 'node:assert/strict';

const item = (price, qty) => ({ price, qty });

// Cada fila: name (qué comportamiento fija), order (entrada), now
// (fecha de referencia opcional), expected (output EXACTO del legacy).
const GOLDEN = [
  {
    name: 'pedido simple sin cupón: happy path completo',
    order: { items: [item(50000, 2), item(12500, 1)] },
    expected: { subtotal: 112500, discount: 0, tax: 21375, shipping: 4900, total: 138775 },
  },
  {
    name: 'raro #8 — pedido sin items igual cobra el envío mínimo',
    order: { items: [] },
    expected: { subtotal: 0, discount: 0, tax: 0, shipping: 9900, total: 9900 },
  },
  {
    name: 'cupón percent: 10% sobre 100000',
    order: { items: [item(50000, 2)], coupon: { type: 'percent', value: 10, minSubtotal: 50000 } },
    expected: { subtotal: 100000, discount: 10000, tax: 17100, shipping: 9900, total: 117000 },
  },
  {
    name: 'frontera del mínimo: subtotal == minSubtotal SÍ aplica (>=)',
    order: { items: [item(100000, 1)], coupon: { type: 'percent', value: 10, minSubtotal: 100000 } },
    expected: { subtotal: 100000, discount: 10000, tax: 17100, shipping: 9900, total: 117000 },
  },
  {
    name: 'raro #3 — cupón percent bajo el mínimo se ignora en silencio',
    order: { items: [item(33333, 3)], coupon: { type: 'percent', value: 10, minSubtotal: 100000 } },
    expected: { subtotal: 99999, discount: 0, tax: 18999.81, shipping: 9900, total: 128898.81 },
  },
  {
    name: "minSubtotal ausente: `coupon.minSubtotal || 0` deja pasar el cupón",
    order: { items: [item(1000, 1)], coupon: { type: 'percent', value: 50 } },
    expected: { subtotal: 1000, discount: 500, tax: 95, shipping: 9900, total: 10495 },
  },
  {
    name: 'raro #4 — descuento percent con floor: 10% de 149.95 → 14.99 (no 14.995)',
    order: { items: [item(149.95, 1)], coupon: { type: 'percent', value: 10, minSubtotal: 0 } },
    expected: { subtotal: 149.95, discount: 14.99, tax: 25.64, shipping: 9900, total: 10060.6 },
  },
  {
    name: 'raro #2 — frontera de expiración inclusiva: vence hoy, HOY ya no vale',
    order: { items: [item(100000, 2)], coupon: { type: 'fixed', value: 5000, expiresAt: '2026-03-01' } },
    now: '2026-03-01',
    expected: { subtotal: 200000, discount: 0, tax: 38000, shipping: 0, total: 238000 },
  },
  {
    name: 'expiración: el día anterior sí aplica (y dispara el raro #7)',
    order: { items: [item(100000, 2)], coupon: { type: 'fixed', value: 5000, expiresAt: '2026-03-01' } },
    now: '2026-02-28',
    expected: { subtotal: 200000, discount: 5000, tax: 37050, shipping: 4900, total: 236950 },
  },
  {
    name: "raro #1 — sin `now`, un cupón vencido APLICA igual",
    order: { items: [item(50000, 2)], coupon: { type: 'fixed', value: 1000, expiresAt: '2020-01-01' } },
    expected: { subtotal: 100000, discount: 1000, tax: 18810, shipping: 9900, total: 127710 },
  },
  {
    name: 'raro #5 — cupón fixed mayor que el subtotal se recorta al subtotal',
    order: { items: [item(1500, 2)], coupon: { type: 'fixed', value: 9999 } },
    expected: { subtotal: 3000, discount: 3000, tax: 0, shipping: 9900, total: 9900 },
  },
  {
    name: 'raro #6 — tipo desconocido: descuento 0 en silencio',
    order: { items: [item(50000, 2)], coupon: { type: 'bogus', value: 100000 } },
    expected: { subtotal: 100000, discount: 0, tax: 19000, shipping: 4900, total: 123900 },
  },
  {
    name: 'raro #7 — envío sobre la base post-descuento: 195000 paga 4900, no 0',
    order: { items: [item(70000, 3)], coupon: { type: 'fixed', value: 15000 } },
    expected: { subtotal: 210000, discount: 15000, tax: 37050, shipping: 4900, total: 236950 },
  },
  {
    name: 'frontera envío: base 200000 exacto es gratis',
    order: { items: [item(100000, 2)] },
    expected: { subtotal: 200000, discount: 0, tax: 38000, shipping: 0, total: 238000 },
  },
  {
    name: 'frontera envío: base 199999.98 paga 4900',
    order: { items: [item(66666.66, 3)] },
    expected: { subtotal: 199999.98, discount: 0, tax: 38000, shipping: 4900, total: 242899.98 },
  },
  {
    name: 'frontera envío: base 100000 exacto paga 4900',
    order: { items: [item(50000, 2)] },
    expected: { subtotal: 100000, discount: 0, tax: 19000, shipping: 4900, total: 123900 },
  },
  {
    name: 'redondeo IVA con flotantes: 100.5 × 19% → 19.10 (una calculadora da 19.095)',
    order: { items: [item(100.5, 1)] },
    expected: { subtotal: 100.5, discount: 0, tax: 19.1, shipping: 9900, total: 10019.6 },
  },
  {
    name: 'redondeo IVA en frontera .5: 25.5 × 19% → 4.85 (no 4.84)',
    order: { items: [item(12.75, 2)] },
    expected: { subtotal: 25.5, discount: 0, tax: 4.85, shipping: 9900, total: 9930.35 },
  },
  {
    name: 'subtotal se redondea tras sumar flotantes: 10.10 × 3 → 30.30',
    order: { items: [item(10.1, 3)] },
    expected: { subtotal: 30.3, discount: 0, tax: 5.76, shipping: 9900, total: 9936.06 },
  },
];

// Registra la suite completa contra un módulo concreto (legacy o refactored).
// `target` solo etiqueta los nombres de los tests para distinguir las salidas.
export function registerTotalsSuite(mod, target) {
  const { calculateTotals } = mod;
  if (typeof calculateTotals !== 'function') {
    throw new Error(`[${target}] el módulo no expone calculateTotals como función`);
  }
  for (const c of GOLDEN) {
    test(`[${target}] ${c.name}`, () => {
      assert.deepEqual(
        calculateTotals(c.order, c.now),
        c.expected,
        `[${target}] se perdió el comportamiento caracterizado: ${c.name}`
      );
    });
  }
}