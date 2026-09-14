// tax_shipping.js — extraído del monolito en la Tarea 2 de plan.md.
//
// Impuesto y envío: las dos piezas que el monolito calculaba entrelazadas
// con el descuento. Aquí viven los raros #7 y #8.

// IVA hardcodeado desde 2019. La spec (sección 2, no-objetivos) prohíbe
// moverlo a configuración: sería scope creep en un refactor de estructura.
const IVA = 0.19;

// Tabla de umbrales de envío — mismo orden raro del legacy (de mayor a
// menor; se aplica el PRIMERO cuyo "desde" calza).
const UMBRALES_ENVIO = [
  { desde: 200000, costo: 0 },
  { desde: 100000, costo: 4900 },
  { desde: 0, costo: 9900 },
];

// roundMoney vive duplicado (aquí y en order_totals.js) a propósito: es
// una línea; compartirlo crearía acoplamiento por nada. Si un lado
// cambiara, la suite de caracterización lo detecta al instante.
const roundMoney = (x) => Math.round(x * 100) / 100;

// IVA sobre la base (subtotal - descuento). El envío NO paga IVA.
// OJO con el redondeo: la expresión es idéntica a la del legacy porque
// con flotantes "equivalente" no siempre lo es (filas 17-18 de la suite).
export function taxFor(base) {
  return roundMoney(base * IVA);
}

// raro #7: el envío se calcula sobre la base POST-descuento, no sobre el
// subtotal crudo — un cupón grande puede bajar la categoría de envío.
// raro #8: base 0 (pedido vacío) calza el umbral "desde: 0" → 9900.
export function shippingFor(base) {
  for (const row of UMBRALES_ENVIO) {
    if (base >= row.desde) return row.costo;
  }
  return 9900;
}