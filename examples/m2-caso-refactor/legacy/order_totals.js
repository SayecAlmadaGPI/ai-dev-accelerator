// legacy/order_totals.js
//
// Cálculo de totales de pedido — módulo monolítico heredado.
// Nadie lo quiere tocar, todos lo usan. Regla de la casa: NO se modifica
// sin tests de caracterización en verde (ver ./order_totals.test.js).
//
// Comportamientos "raros" = comportamiento CONTRATADO: alguien depende de
// ellos, aunque nadie recuerde por qué. Cada uno está numerado y tiene su
// caso en la suite de caracterización (../characterization_suite.js).

// IVA hardcodeado desde 2019. El comentario original decía
// "el 19% no cambia nunca".
var IVA = 0.19;

// Tabla de umbrales de envío (copiada de un correo de 2021). Orden raro:
// de mayor a menor umbral; se aplica el PRIMERO cuyo "desde" calce.
var UMBRALES_ENVIO = [
  { desde: 200000, costo: 0 },
  { desde: 100000, costo: 4900 },
  { desde: 0, costo: 9900 },
];

// Redondeo ad-hoc de dinero: Math.round sobre centavos. OJO: con flotantes
// esto NO es el "redondeo half-up del colegio" — ver los tests de
// caracterización antes de "arreglarlo".
function roundMoney(x) {
  return Math.round(x * 100) / 100;
}

function calculateTotals(order, now) {
  // --- subtotal ---
  var subtotal = 0;
  for (var i = 0; i < order.items.length; i++) {
    subtotal += order.items[i].price * order.items[i].qty;
  }
  subtotal = roundMoney(subtotal);

  // --- descuento por cupón ---
  var discount = 0;
  var coupon = order.coupon;
  if (coupon) {
    var expired = false;
    if (coupon.expiresAt && now) {
      // Raro #2: la frontera es inclusiva — si expira "hoy", HOY ya no vale.
      expired =
        new Date(coupon.expiresAt).getTime() <= new Date(now).getTime();
    }
    // Raro #1: sin `now`, un cupón con fecha de expiración NUNCA cuenta
    // como expirado (se confía en el caller).
    if (!expired) {
      if (coupon.type === 'percent') {
        // Raro #3: el cupón percent exige un subtotal mínimo; si no llega,
        // se ignora EN SILENCIO (sin error, sin warning).
        if (subtotal >= (coupon.minSubtotal || 0)) {
          // Raro #4: el descuento se redondea HACIA ABAJO "para no prometer
          // más descuento del real" — y con flotantes, floor trae sorpresas.
          discount = Math.floor((subtotal * coupon.value / 100) * 100) / 100;
        }
      } else if (coupon.type === 'fixed') {
        // Raro #5: fixed no exige mínimo, pero nunca descuenta más que el
        // subtotal (el pedido nunca queda negativo).
        discount = Math.min(coupon.value, subtotal);
      }
      // Raro #6: type desconocido → discount queda en 0, en silencio.
    }
  }

  // --- impuesto y envío ---
  var base = subtotal - discount;
  var tax = roundMoney(base * IVA);

  // Raro #7: el envío se calcula sobre la base DESPUÉS del descuento, no
  // sobre el subtotal crudo. Un cupón grande puede "bajar" la categoría de
  // envío del pedido.
  var shipping = 9900; // default por si ningún umbral calzara
  for (var j = 0; j < UMBRALES_ENVIO.length; j++) {
    if (base >= UMBRALES_ENVIO[j].desde) {
      shipping = UMBRALES_ENVIO[j].costo;
      break;
    }
  }

  // Raro #8: un pedido sin items igual cobra el envío mínimo (nadie lo
  // decidió así; la tabla con "desde: 0" lo implica).
  var total = roundMoney(base + tax + shipping);

  return {
    subtotal: subtotal,
    discount: discount,
    tax: tax,
    shipping: shipping,
    total: total,
  };
}
export default { calculateTotals };