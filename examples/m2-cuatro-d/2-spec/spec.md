<!--
  examples/m2-cuatro-d/2-spec/spec.md
  -----------------------------------
  La spec del feature, escrita con el lenguaje ubicuo del dominio (DDD) y
  con los ACs como escenarios Given/When/Then (BDD). Es la spec que el
  agente recibe como contrato. La estructura sigue templates/spec.md.
-->

# Spec: Préstamos — reglas de préstamo y vencimiento

## 1. Contexto y motivación

La biblioteca necesita registrar préstamos de libros a socios con tres
reglas de negocio verificables: límite de préstamos activos por socio,
vencimiento a 14 días y exclusión de libros retirados. Este feature lo
implementará un agente de código, por lo que el contrato debe ser
completamente verificable.

## 2. Objetivos y no-objetivos

**Objetivos:**
- Crear, consultar y devolver préstamos con las reglas del negocio.
- Rechazos con razón explícita para cada caso no permitido.

**No-objetivos:**
- Multas, reservas, renovaciones o catálogo (otros bounded contexts).
- Persistencia: el estado vive en memoria (este contexto se integra
  después con la capa de datos).
- Interfaz de usuario: este contexto es una librería (constitutional
  article I de Spec Kit: Library-First).

## 3. Invariantes y constraints

- El lenguaje es el del `1-dominio/README.md` (Socio, Libro, Préstamo,
  Préstamo activo, Límite, Vencimiento, Retirado). Ningún otro sinónimo.
- `LIMITE_PRESTAMOS = 3` y `DIAS_VENCIMIENTO = 14` son constantes nombradas,
  no números mágicos.

## 4. Requisitos funcionales (RF)

- **RF-1:** Un socio puede pedir prestado un libro disponible si tiene
  menos de 3 préstamos activos.
- **RF-2:** El vencimiento de cada préstamo es exactamente
  `fecha de préstamo + 14 días`.
- **RF-3:** Un libro `retirado` no se presta (razón: "libro no disponible").

## 5. Criterios de aceptación (ACs como escenarios BDD)

Cada AC es un escenario ejecutable en Gherkin — el negocio lo entiende y
el test que lo automatiza es el RED del ciclo TDD.

| AC | Escenario (Given/When/Then) | Verificación |
|---|---|---|
| AC-1 | **Given** un socio con 2 préstamos activos, **when** pide prestado un libro disponible, **then** se crea un préstamo activo con vencimiento a 14 días | Test de escenario |
| AC-2 | **Given** un socio con 3 préstamos activos, **when** pide prestado, **then** se rechaza con razón `límite alcanzado` | Test de escenario |
| AC-3 | **Given** un libro retirado, **when** un socio lo pide, **then** se rechaza con razón `libro no disponible` | Test de escenario |
| AC-4 | **Given** un préstamo creado el día X, **then** su vencimiento es X + 14 días exactos | Test de escenario |

Gherkin completo: [`escenarios.feature`](./escenarios.feature).

## 6. Dependencias

Ninguna (Node puro, `node:test`).

## 7. Pistas de implementación

- `3-tdd/src/prestamos.js` con las constantes `LIMITE_PRESTAMOS = 3` y
  `DIAS_VENCIMIENTO = 14` (invariante §3).
- No mezclar la regla del límite con la del vencimiento: son decisiones
  separadas (y separables por mutación, M6 §6.3.4).

## 8. Datos de prueba / escenarios

Los escenarios Gherkin de la sección 5 son los datos: cada Given es el
setup y cada Then es el assert.

## 9. Rollback plan

Un solo módulo sin dependencias: revertir el commit del feature elimina
el código y los tests sin afectar otros contextos.

## 10. Decisiones abiertas

- [x] **D-1:** ¿El límite de préstamos activos es por socio o global? →
  **Por socio** (ver `../1-dominio/README.md`, decisión registrada).
- [x] **D-2:** ¿La fecha de vencimiento cuenta días naturales o hábiles?
  → **Naturales** — no hay acuerdo de negocio que los exceptúe; registrar
  como no-objetivo de este contexto.

## 11. Definición de "Verificado"

- [ ] Todos los AC-1..4 tienen su escenario automatizado y en verde.
- [ ] Muta `LIMITE_PRESTAMOS = 4`: al menos un test debe fallar
  (auditoría de mutación, M6 §6.3.4).
- [ ] El código usa SOLO el lenguaje ubicuo (Socio, Préstamo, Retirado…).
- [ ] Sin archivos fuera del bounded context Préstamos.

## 12. Trazabilidad

- Ejemplo de: M2 §2.5 (las cuatro D) · `cheatsheets/las-cuatro-d.md`.
- Prompts del agente: [`prompts.md`](./prompts.md).