# Language: es
# Escenarios BDD del contexto Préstamos — los ACs de spec.md en Gherkin.
# Cada escenario se automatiza con un test en 3-tdd/tests/prestamos.test.js.

# AC-1
Característica: Préstamos con límite y vencimiento
  Regla: un socio tiene máximo 3 préstamos activos y cada préstamo vence a 14 días

  Escenario: préstamo dentro del límite
    Dado un socio con 2 préstamos activos
    Y un libro disponible
    Cuando el socio pide prestado el libro
    Entonces el préstamo se crea como activo
    Y su vencimiento es la fecha de préstamo más 14 días

  Escenario: límite alcanzado
    Dado un socio con 3 préstamos activos
    Cuando el socio pide prestado otro libro
    Entonces la solicitud se rechaza con la razón "límite alcanzado"

  Escenario: libro retirado
    Dado un libro con estado "retirado"
    Cuando un socio lo pide prestado
    Entonces la solicitud se rechaza con la razón "libro no disponible"

  Escenario: vencimiento exacto
    Dado un préstamo creado el 2026-09-21
    Entonces su vencimiento es el 2026-10-05