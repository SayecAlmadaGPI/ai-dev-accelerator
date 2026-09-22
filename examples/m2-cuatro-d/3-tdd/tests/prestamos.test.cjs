// Los tests SON los escenarios BDD de 2-spec/escenarios.feature, con el
// lenguaje ubicuo. Estructura: cada test = un AC (Given/When/Then).
// Correr con: node --test

const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const { LIMITE_PRESTAMOS, restaurar, contarActivos, solicitarPrestamo } = require('../src/prestamos.cjs');

const libroDisponible = (id = 'L1') => ({ id, estado: 'disponible' });
const libroRetirado = { id: 'L9', estado: 'retirado' };
const UN_SOCIO = 'S1';

beforeEach(() => restaurar());

// AC-1 — préstamo dentro del límite
test('AC-1: Given socio con 2 préstamos activos, when pide un libro disponible, then se crea con vencimiento a 14 días', () => {
  solicitarPrestamo({ socioId: UN_SOCIO, libro: libroDisponible('L1'), fecha: new Date('2026-09-21T00:00:00Z') });
  solicitarPrestamo({ socioId: UN_SOCIO, libro: libroDisponible('L2'), fecha: new Date('2026-09-21T00:00:00Z') });

  const resultado = solicitarPrestamo({ socioId: UN_SOCIO, libro: libroDisponible('L3') });

  assert.equal(resultado.ok, true);
  assert.equal(resultado.prestamo.vencimiento.toISOString().slice(0, 10), '2026-10-05'); // +14 días exactos
  assert.equal(contarActivos(UN_SOCIO), 3);
});

// AC-2 — límite alcanzado
test('AC-2: Given socio con 3 préstamos activos, when pide otro, then se rechaza con "límite alcanzado"', () => {
  for (const id of ['L1', 'L2', 'L3']) {
    solicitarPrestamo({ socioId: UN_SOCIO, libro: libroDisponible(id) });
  }

  const resultado = solicitarPrestamo({ socioId: UN_SOCIO, libro: libroDisponible('L4') });

  assert.deepEqual(resultado, { ok: false, razon: 'límite alcanzado' });
});

// AC-3 — libro retirado
test('AC-3: Given un libro retirado, when se pide, then se rechaza con "libro no disponible"', () => {
  const resultado = solicitarPrestamo({ socioId: UN_SOCIO, libro: libroRetirado });

  assert.deepEqual(resultado, { ok: false, razon: 'libro no disponible' });
});

// AC-4 — vencimiento exacto
test('AC-4: Given un préstamo creado el 2026-09-21, then su vencimiento es 2026-10-05 (+14 días exactos)', () => {
  const resultado = solicitarPrestamo({
    socioId: UN_SOCIO,
    libro: libroDisponible(),
    fecha: new Date('2026-09-21T00:00:00Z'),
  });

  assert.equal(resultado.ok, true);
  assert.equal(resultado.prestamo.vencimiento.toISOString().slice(0, 10), '2026-10-05');
});

/*
 * El ciclo TDD anotado de la tarea AC-1 (lo que el agente hizo, fase por
 * fase — ver prompts.md):
 *
 * RED     -> se escribió este test con la salida FALLANDO:
 *            "AssertionError: resultado.ok === false" (solicitarPrestamo
 *            no existía todavía).
 * GREEN   -> la implementación MÍNIMA: un push al array con ok: true.
 *            Sin límite, sin vencimiento, sin estados de libro.
 * REFACTOR-> extraer las reglas a constantes nombradas y agregar los
 *            rechazos (AC-2, AC-3) en tareas separadas, cada una con su
 *            propio RED.
 *
 * AUDITORÍA DE MUTACIÓN (M6 §6.3.4): muta LIMITE_PRESTAMOS de 3 a 4 ->
 * AC-2 FALLA (el test distingue el límite real). Muta DIAS_VENCIMIENTOS a
 * 7 -> AC-1 y AC-4 FALLAN. Ningún mutante sobrevive: las decisiones están
 * protegidas. Ver prompts.md, prompt de auditoría.
 */