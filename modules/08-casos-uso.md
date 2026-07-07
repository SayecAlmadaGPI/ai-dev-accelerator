# Módulo 8 — Casos de Uso End-to-End

> **Tesis:** los módulos anteriores te dieron las piezas — spec, harness,
> verificación, failure modes, MCP, seguridad. Este módulo las ensambla
> en flujos completos sobre escenarios reales. El valor no está en cada
> caso aislado, está en ver cómo las mismas piezas se recombinan en seis
> situaciones distintas: lo que cambia es el orden de aplicación y dónde
> pone el énfasis cada caso, no el kit de herramientas.

---

## 8.0 Por qué este módulo existe

Hasta aquí cada módulo profundizó una dimensión. Pero en una sesión real
no "haces M2" y luego "haces M6": haces *refactorizar este módulo legacy*
o *debuggear este incidente*, y dentro de eso activas M2, M3, M6, M7 según
corresponda. Este módulo muestra esa activación en orden, caso por caso.

> **La regla del M8:** cada caso es la misma metodología aplicada con
> distinto énfasis. Lo que aprendas no es "la técnica del refactor", es
> *qué piezas activas primero y cuáles pasan a segundo plano* para ese
> tipo de tarea.

---

## 8.1 Los seis casos en una tabla

| Caso | Riesgo dominante | Pieza que lidera | Pieza que refuerza |
|------|------------------|------------------|---------------------|
| 8.2 Refactor de legacy | Perder comportamiento | Tests de caracterización | Spec del comportamiento preservado |
| 8.3 Feature nuevo | Scope creep, phantom verification | Spec + plan TDD | DONE/VERIFIED + CI gate |
| 8.4 Generación de tests | Test gaming, tests que no prueban | Mutation testing | AC explícitos por test |
| 8.5 Documentación viva | Drift doc ↔ código | Doc que se valida en CI | Generación desde el código |
| 8.6 Migración de stack | Rotura masiva, irreversibilidad | Migración en fases + gates | Worktree aislado, rollback |
| 8.7 Debugging de incidente | Fix sin entender la causa | Hipótesis → reproducción → fix | Postmortem |

> Ver `examples/` (cuando aplique) y los labs correspondientes para los
> casos prácticos guiados.

---

## 8.2 Refactorización de código legacy

**Riesgo dominante:** perder comportamiento que no está escrito en ningún
test. Refactorizar sin red de seguridad = inventar bugs nuevos mientras
"limpias".

### 8.2.1 La secuencia

1. **Caracterización antes que belleza.** Antes de tocar el código,
   genera *tests de caracterización*: tests que codifican el
   comportamiento actual (lo que el código hace, no lo que debería hacer).
   No prueban correctitud; prueban *no-regresión*. El M2 §TDD al revés:
   aquí el test describe lo existente.
2. **Spec del comportamiento a preservar.** Escribe qué invariantes
   deben sobrevivir al refactor ("dada entrada X, sigue devolviendo Y";
   "el orden de side effects no cambia"). Esto es lo que no se puede
   romper; todo lo demás es libre.
3. **Refactor en pasos pequeños, verde entre cada uno.** Un cambio por
   commit, tests en verde entre cambios. Si un paso rompe verde, sabes
   exactamente qué paso lo causó.
4. **Mutation testing al final.** Verifica que tus tests de
   caracterización capturan mutaciones; si no, no te protegen de
   regresiones reales.

### 8.2.2 Trampas

> **Anti-patrón:** "lo reescribo de cero, queda más limpio". El rewrite
> pierde el conocimiento tácito del legacy (edge cases, workarounds
> sutiles). Refactoriza preservando; reescribe solo si la spec del
> comportamiento te dice que la mayoría del legacy ya no aplica.

> **Anti-patrón:** refactor + feature en el mismo diff. Mezclar cambio
> de estructura con cambio de comportamiento hace imposible atribuir
> regresiones. Refactor y feature van en commits (o PRs) separados.

### 8.2.3 Dónde pone el énfasis este caso

- **Lidera:** tests de caracterización + spec de "comportamiento
  preservado".
- **Refuerza:** M6 (mutation testing, diff guard para que el refactor
  no toque behavior), M7 §7.3 (worktree aislado para que la deriva del
  refactor no contamine main).

---

## 8.3 Desarrollo de feature nuevo

**Riesgo dominante:** scope creep y phantom verification — el agente
"termina" sin que lo que pidió la spec esté realmente verificado.

### 8.3.1 La secuencia (es el flujo canónico del curso)

1. **Ticket → spec** (M2): convierte el pedido en `docs/specs/<feature>.md`
   con objetivos, no-objetivos explícitos, invariantes, AC.
2. **Spec → plan** (M2): descompone en `plan.md` TDD (RED → GREEN →
   REFACTOR). El test antes que el código reduce test gaming (M6 §6.6.4).
3. **Plan → tasks** (M2 GSD): `.planning/roadmap.md` con phases y tasks
   atómicas.
4. **Execute task por task**, cerrando cada una con reporte DONE/VERIFIED
   (M6 §6.5).
5. **CI gate** (M6 §6.8): el pipeline verifica contra la spec, no solo
   "tests pasan".
6. **Commit por unidad coherente**, verde entre cada uno (M4 §4.6).

> Este caso es exactamente lo que ejercita el `lab-02-spec-driven-feature`.
> Si lo hiciste, ya recorriste este flujo.

### 8.3.2 Trampas

> **Anti-patrón:** "la spec está en mi cabeza, se la explico al agente
> en el chat". Sin spec escrita, el AC no existe, el scope creep no tiene
> defensa, y el DONE/VERIFIED no tiene contra qué comparar.

> **Anti-patrón:** el agente implementa sin plan y commitea todo junto.
> Sin descomposición TDD, no hay punto de retroceso; si algo se rompe a
> mitad, no sabes dónde.

### 8.3.3 Dónde pone el énfasis

- **Lidera:** M2 (spec + plan + tasks) + M6 (DONE/VERIFIED + gate).
- **Refuerza:** M4 (commit verde por unidad), M7 §7.3 (no-objetivos como
  defensa anti scope creep).

---

## 8.4 Generación y mantenimiento de tests

**Riesgo dominante:** el agente produce tests que pasan pero no prueban
la intención (test gaming y hollow coverage, M6 §6.1.3).

### 8.4.1 Cobertura retroactiva (sobre código sin tests)

1. **No generes "tests del 100%".** Empieza por los caminos críticos:
   funciones con side effects, invariantes de la spec, paths que rompen
   producción si fallan.
2. **AC explícito por test.** Cada test debe mapear a un AC o a un
   invariante; si no mapea, es ruido. Pídele al agente que documente, en
   el test, qué AC cubre.
3. **Mutation testing como validador.** Después de generar, muta el
   código; si los tests no fallan, no están probando.

### 8.4.2 Tests de regresión (sobre un bug ya fixeado)

1. **Reproduce primero.** El test de regresión parte del bug reproducido
   (rojo), *luego* del fix (verde). Es TDD estricto sobre el bug.
2. **Nombra el test por el síntoma, no por la solución.**
   `regression_filter_excludes_to_when_equal` (qué protege) >
   `test_filter_fix` (qué hiciste).

### 8.4.3 Mantenimiento

1. **Tests como código, no como ornamento.** Refactoriza tests; el DRY
   aplica. Un test duplicado 20 veces es deuda que oculta el que importa.
2. **Golden tests inmutables** (M6 §6.6.2): los que codifican AC de specs
   aprobadas no se tocan sin spec de cambio.
3. **Detecta tests muertos.** Un test `.skip` o un archivo no corrido en
   CI es carga muerta; un sensor que liste tests no corridos lo detecta.

### 8.4.4 Trampa

> **Anti-patrón:** "le pido al agente que suba la cobertura al 90%". La
> cobertura es proxy de nada: un test que asserts `true` sube cobertura.
> Pídele cobertura *de AC* y *poder de captura* (mutation testing), no
> cobertura de líneas.

### 8.4.5 Dónde pone el énfasis

- **Lidera:** M6 (mutation testing, AC por test, test gaming).
- **Refuerza:** M2 (AC en la spec), M7 (detectar hollow coverage como
  failure mode).

---

## 8.5 Documentación viva

**Riesgo dominante:** el drift — docs que dicen una cosa y el código hace
otra. La doc muerta es peor que la ausente: activa confianza falsa.

### 8.5.1 Principio: la doc que no se valida, miente

La documentación viva es la que un sensor valida contra el código. Si
no hay sensor, la doc envejece y nadie se entera.

### 8.5.2 Estrategias

1. **Doc generada desde el código.** API docs desde tipos/firmas
   (TypeDoc, Sphinx, etc.); ejemplos extraídos de tests reales que
   pasan. Si la doc se genera, no puede desfasarse.
2. **ADR como system of record.** Las decisiones viven en
   `docs/decisions/` numeradas (M3 §estructura). El agente las respeta
   si las encuentra; el humano las diff-eas en el tiempo (M3 §3.9).
3. **Validación de doc en CI.** Un sensor que verifique que los
   ejemplos de la doc compilan/corren. Si un ejemplo del README no
   ejecuta, el CI falla. Es la traducción mecánica de "la doc dice la
   verdad".
4. **Doc ligada a la spec.** La spec de cada feature referencia la doc
   de usuario que describe. Al cambiar la spec, la doc cambia en el
   mismo PR (gate opcional: un PR que toca behavior sin tocar doc
   requiere justificación).

### 8.5.3 Trampa

> **Anti-patrón:** "que el agente escriba la doc del módulo". Si la doc
> se escribe una vez y no se valida, drift garantizado. Genera desde el
> código o valida en CI; lo demás es doc con fecha de caducidad.

### 8.5.4 Dónde pone el énfasis

- **Lidera:** M6 (validación mecánica de doc) + M3 (ADRs como system of
  record).
- **Refuerza:** M1 (system of record: la doc auditable es trazabilidad).

---

## 8.6 Migración de stack / dependencias

**Riesgo dominante:** rotura masiva e irreversibilidad. Una migración de
framework mayor puede romper cientos de archivos de golpe.

### 8.6.1 La secuencia

1. **Spec de migración con invariante de comportamiento.** "Después de
   migrar, todas las features actuales siguen pasando." La migración no
   cambia behavior; cambia implementación.
2. **Fases, no big-bang.** Divide la migración en fases verificables
   (M2 GSD: Milestones → Phases). Cada fase deja el repo en verde y
   funcionando, aunque sea un estado híbrido (parte nuevo, parte viejo).
3. **Worktree aislado para la migración.** El costo de una migración a
   mitad es enorme si contamina main. Aislamiento (M3, M7 §7.3) es
   obligatorio, no opcional.
4. **Rollback plan en cada fase.** Si la fase 3 rompe algo que la fase 2
   no, debes poder volver al SHA anterior de la fase 2. Sin rollback
   plan, una migración a mitad es un incidente (M7 §7.1.5, M10).
5. **Dual-run cuando sea posible.** Para migraciones de API, correr
   viejo y nuevo en paralelo y comparar outputs. El dual-run es la
   caracterización (§8.2) aplicada a una migración.

### 8.6.2 Trampas

> **Anti-patrón:** "migro todo en un mega-PR". Imposible de revisar,
> imposible de revertir. Si algo rompe, no sabes qué fase. Fases
> pequeñas, una por PR, verde entre cada una.

> **Anti-patrón:** migrar y refactorizar a la vez. La migración ya es
> cambio suficiente; mezclarla con "mientras tanto mejoro esto" hace
> imposible atribuir roturas. Migra preservando; refactoriza después.

### 8.6.3 Dónde pone el énfasis

- **Lidera:** M2 (fases verificables) + M3/M7 (worktree aislado) + M4
  (commit verde por fase, rollback SHA).
- **Refuerza:** M6 (dual-run como caracterización), M10 (irreversibilidad
  → gate humano por fase).

---

## 8.7 Debugging de incidente

**Riesgo dominante:** fix sin entender la causa. El síntoma desaparece,
la causa sigue, el incidente regresa más tarde peor.

### 8.7.1 La secuencia

1. **Reproduce antes de tocar.** Si no puedes reproducir, no puedes
   verificar el fix. La reproducción (un test que falle con el bug) es
   el primer deliverable, no el fix.
2. **Hipótesis, no corazonadas.** Escribe 2-3 hipótesis de la causa, en
   orden de probabilidad. El agente prueba una a la vez, descartando.
3. **Fix mínimo dirigido por la hipótesis confirmada.** Una vez
   reproducido y la hipótesis confirmada, el fix es pequeño y local.
   "Aprovecho para refactorizar" es scope creep en medio de un incidente
   (M7 §7.3).
4. **Test de regresión obligatorio.** El test que reproduce el bug queda
   en la suite (verde tras el fix). Es la prueba de que el incidente no
   regresa (§8.4.2).
5. **Postmortem.** Si el incidente llegó a producción, postmortem (M7
   §7.10): qué falló, por qué no lo atrapó el harness, qué mitigación
   instalar.

### 8.7.2 Trampas

> **Anti-patrón:** "cámbialo hasta que deje de fallar". Sin reproducir ni
> hipótesis, "dejar de fallar" puede ser enmascarar el síntoma. La causa
> sigue; el incidente regresa.

> **Anti-patrón:** fix + refactor del módulo en el mismo commit. En un
> incidente, lo urgente es el fix mínimo y revertible. El refactor va
> después, en su propio PR.

### 8.7.3 Dónde pone el énfasis

- **Lidera:** M7 (clasificar la falla, postmortem) + M6 (reproducción
  como test, regression test).
- **Refuerza:** M4 (commit verde con el fix + test), M2 (el test de
  regresión es un AC nuevo).

---

## 8.8 Patrón transversal: cada caso recombina el mismo kit

Lo que distingue los seis casos no es la técnica, es el orden y el
énfasis:

- **Refactor legacy** invierte el orden TDD (tests de caracterización
  antes que spec de destino).
- **Feature nuevo** es el flujo canónico (spec → plan → tasks → verify).
- **Tests** pone la validación (mutation testing) por encima de la
  generación.
- **Docs vivas** convierte la doc en algo que un sensor valida.
- **Migración** añade fases + rollback + dual-run sobre el flujo canónico.
- **Incidente** pone reproducción + hipótesis antes que el fix.

> Si tuviste que resumir el módulo en una línea: *el kit es el mismo; lo
> que cambia es qué pieza lidera y en qué orden se activan las demás*.

---

## 8.9 Niveles de adopción

### Mínimo

- Para cada caso, tener claro cuál es el riesgo dominante y qué pieza lo
  lidera antes de empezar.
- Reproducción (incidente) y caracterización (legacy) como regla: no
  tocar sin red de tests.

### Medio

- Cada caso con su plantilla de partida (`spec.md`, `plan.md`,
  `.planning/`, `DONE_VERIFIED.md`) adaptada al énfasis del caso.
- Dual-run para migraciones; mutation testing para generación de tests;
  validación de doc en CI.

### Completo

- `ai-dev-lab/` con proyectos intencionalmente rotos o incompletos para
  ejercitar cada caso sin riesgo (referencia del blueprint).
- Video-demos "una sola toma" por caso para enseñar el flujo real, no
  el resumido.
- Playbooks "SDD para [caso]" reutilizables por el equipo.

---

## 8.10 FAQ — trampas reales

**¿Refactorizo o reescribo el legacy?** Refactoriza preservando
comportamiento, con tests de caracterización. Reescribe solo si la
spec del comportamiento te dice que la mayoría del legacy ya no aplica;
> y aun así, hazlo por fases.

**El agente "arregló" el incidente pero no sé cómo.** Sin reproducción ni
hipótesis, no lo arregló; lo enmascaró. Pídele el test que reproduce el
bug y la hipótesis que confirma. Si no puede darlos, no es un fix.

**¿Cobertura 90% con el agente?** La cobertura es proxy de nada. Pídele
> cobertura de AC y poder de captura (mutation testing). Un test que
> asserts `true` sube cobertura y no prueba nada.

**Migración grande: ¿un PR o varios?** Varios, uno por fase, verde
entre cada uno, con rollback plan. Un mega-PR es irrevisitable e
irrevertible.

**¿El agente escribe la doc del módulo?** Solo si la doc se valida en CI
o se genera desde el código. Doc escrita una vez y nunca validada es
drift garantizado.

**¿Feature y refactor en el mismo diff?** No. Mezclar estructura y
comportamiento hace imposible atribuir regresiones. Commits (o PRs)
separados.

---

## 8.11 Referencias

- **AI Engineering from Scratch — rohitg00**
  (https://github.com/rohitg00/ai-engineering-from-scratch) — Fases
  11-14 (LLM Engineering, MCP, Agent Engineering, Agent Workbench) con
  17 capstones end-to-end.
- **Augment Code** (https://www.augmentcode.com/) — casos de uso de
  agentes en repos reales.
- **SWE-agent** (https://github.com/SWE-agent/SWE-agent) — agente de
  código open-source con harness inspeccionable.

**Labs vinculados:** `labs/lab-02-spec-driven-feature/` (caso 8.3),
`labs/lab-04-failure-mode-hunt/` (caso 8.7 y M7).