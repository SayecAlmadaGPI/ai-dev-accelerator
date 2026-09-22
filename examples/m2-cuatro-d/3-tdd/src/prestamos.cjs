// Implementación final del contexto Préstamos (GREEN + REFACTOR).
// El lenguaje es el ubicuo del dominio: Socio, Libro, Préstamo, Retirado.
// Las reglas de negocio son constantes nombradas — sin números mágicos.

const LIMITE_PRESTAMOS = 3; // D-1: límite por socio (decisión registrada)
const DIAS_VENCIMIENTO = 14;
const DIAS_POR_MS = 24 * 60 * 60 * 1000;

let prestamos = [];
let hoy = new Date('2026-09-21T00:00:00Z'); // reloj inyectable para tests

/**
 * RF-1 / RF-3: un socio pide prestado un libro disponible.
 * RF-2: el vencimiento es fecha + DIAS_VENCIMIENTO.
 * Devuelve { ok: true, prestamo } o { ok: false, razon }.
 */
function solicitarPrestamo({ socioId, libro, fecha = hoy }) {
  if (libro.estado === 'retirado') {
    return { ok: false, razon: 'libro no disponible' };
  }
  const activos = prestamos.filter(
    (p) => p.socioId === socioId && p.activo,
  ).length;
  if (activos >= LIMITE_PRESTAMOS) {
    return { ok: false, razon: 'límite alcanzado' };
  }
  const prestamo = {
    socioId,
    libroId: libro.id,
    fecha,
    vencimiento: new Date(fecha.getTime() + DIAS_VENCIMIENTO * DIAS_POR_MS),
    activo: true,
  };
  prestamos.push(prestamo);
  return { ok: true, prestamo };
}

/** RF-3 complementaria: devolver un préstamo lo deja inactivo. */
function devolver(prestamo) {
  prestamo.activo = false;
  return { ok: true, prestamo };
}

function contarActivos(socioId) {
  return prestamos.filter((p) => p.socioId === socioId && p.activo).length;
}

function restaurar(fechaDeHoy = '2026-09-21T00:00:00Z') {
  prestamos = [];
  hoy = new Date(fechaDeHoy);
}

module.exports = {
  LIMITE_PRESTAMOS,
  DIAS_VENCIMIENTO,
  restaurar,
  contarActivos,
  solicitarPrestamo,
  devolver,
  get prestamos() { return prestamos; },
};