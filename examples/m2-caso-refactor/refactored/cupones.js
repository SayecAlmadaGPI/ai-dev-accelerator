// cupones.js — extraído del monolito en la Tarea 1 de plan.md.
//
// Solo las reglas de descuento por cupón: nada de impuestos ni envío.
// Los 6 raros de cupones (ver legacy/order_totals.js) viajan aquí TAL
// CUAL: están caracterizados en la suite, no "arreglados".

function isExpired(coupon, now) {
  if (!coupon.expiresAt) return false;
  // raro #1: sin `now`, un cupón con fecha de expiración NUNCA cuenta
  // como expirado (se confía en el caller).
  if (!now) return false;
  // raro #2: la frontera es inclusiva — si expira "hoy", HOY ya no vale.
  return new Date(coupon.expiresAt).getTime() <= new Date(now).getTime();
}

export function couponDiscount(subtotal, coupon, now) {
  if (!coupon || isExpired(coupon, now)) return 0;
  if (coupon.type === 'percent') {
    // raro #3: el cupón percent exige un subtotal mínimo; si no llega, se
    // ignora EN SILENCIO (sin error, sin warning).
    if (subtotal < (coupon.minSubtotal || 0)) return 0;
    // raro #4: el descuento se redondea HACIA ABAJO. La expresión NO se
    // reescribe "más bonita": con flotantes, cambiar el orden de las
    // operaciones cambia el redondeo (fila 7 de la suite).
    return Math.floor((subtotal * coupon.value / 100) * 100) / 100;
  }
  if (coupon.type === 'fixed') {
    // raro #5: fixed no exige mínimo, pero nunca descuenta más que el
    // subtotal (el pedido nunca queda negativo).
    return Math.min(coupon.value, subtotal);
  }
  // raro #6: type desconocido → 0, en silencio.
  return 0;
}