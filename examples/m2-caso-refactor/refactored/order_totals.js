// order_totals.js (refactored) — resultado de las 3 tareas de plan.md.
//
// MISMA firma pública que legacy/order_totals.js: default export con
// `calculateTotals(order, now)` → { subtotal, discount, tax, shipping,
// total }. Este archivo ya no calcula reglas: solo orquesta cupones e
// impuestos/envío. El comportamiento observable no cambió en NADA; lo
// que cambió es que cada regla ahora vive donde se puede encontrar.

import { couponDiscount } from './cupones.js';
import { taxFor, shippingFor } from './tax_shipping.js';

// Misma nota que en tax_shipping.js: una línea, deliberadamente duplicada.
const roundMoney = (x) => Math.round(x * 100) / 100;

function calculateTotals(order, now) {
  let subtotal = 0;
  for (const it of order.items) {
    subtotal += it.price * it.qty;
  }
  subtotal = roundMoney(subtotal);

  const discount = couponDiscount(subtotal, order.coupon, now);
  const base = subtotal - discount; // la base post-descuento alimenta TODO lo demás
  const tax = taxFor(base);
  const shipping = shippingFor(base);
  const total = roundMoney(base + tax + shipping);

  return { subtotal, discount, tax, shipping, total };
}

export default { calculateTotals };