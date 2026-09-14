// Escenarios del simulador de terminal (Fase 4c). Cada escenario es una "sesión"
// fake con un set curado de comandos extraídos de la prosa del curso (labs +
// módulos). El shell (src/scripts/term.ts) interpreta el comando exacto; si no
// lo reconoce, sugiere `help`. Contenido autorado, committed, español neutro.

export interface TermScenario {
  id: string;
  title: string;
  /** Prompt del shell, ej. "lab-01$ ". */
  prompt: string;
  /** Intro que se imprime al cargar el escenario. */
  intro: string;
  /** cmd (sin argumentos extra) -> output canned. `help`, `clear`, `ls` y
   *  `echo` los maneja el shell globalmente; acá van los específicos. */
  commands: Record<string, string>;
}

export const scenarios: TermScenario[] = [
  {
    id: 'lab-01',
    title: 'Lab 01 — Baseline vs. Harness',
    prompt: 'lab-01$ ',
    intro:
      'Estás en lab-01. Montaste el harness mínimo (AGENTS.md, spec, init.sh).\n' +
      'Escribe `help` para ver los comandos disponibles, o prueba `bash init.sh`.',
    commands: {
      'bash init.sh':
        '+ typecheck\n  npx tsc --noEmit\n+ tests\n  npm test\n\n' +
        ' PASS  src/filterByDate.test.ts\n' +
        '   ✓ filtra por rango [from, to)\n' +
        '   ✓ no muta items\n' +
        '   ✓ from inclusivo, to exclusivo\n' +
        '   ✓ lanza error si from > to\n\n' +
        'init.sh: typecheck en verde, tests en verde. Listo para codear.',
      'cat AGENTS.md':
        '# AGENTS.md\n' +
        'stack: TypeScript + Vitest\n' +
        'comandos: npm test | npx tsc --noEmit\n' +
        'regla: NO mutar argumentos (invariante)\n' +
        'gotcha: `to` es exclusivo en los rangos [from, to)',
      'cp templates/init.sh .': 'copiado templates/init.sh -> ./init.sh',
      'cp templates/AGENTS.md .': 'copiado templates/AGENTS.md -> ./AGENTS.md',
      'cp templates/spec.md docs/specs/filterByDate.md':
        'copiado templates/spec.md -> docs/specs/filterByDate.md',
      'npm test':
        ' PASS  src/filterByDate.test.ts (4)\n Tests 4 passed 4 total\n Duration 0.31s',
      'npx tsc --noEmit': 'typecheck: 0 errores.',
      'git status':
        'En la rama main\n' +
        'Cambios sin preparar:\n' +
        '  modificados:     src/filterByDate.ts\n' +
        '  nuevos:          src/filterByDate.test.ts\n' +
        '  nuevos:          AGENTS.md, docs/specs/filterByDate.md',
    },
  },
  {
    id: 'lab-02',
    title: 'Lab 02 — Spec-Driven Feature',
    prompt: 'lab-02$ ',
    intro:
      'Estás en lab-02. La spec está escrita; vas a planear y ejecutar por fases.\n' +
      'Prueba `gsd-plan-phase 1` para ver el plan TDD de la fase 1.',
    commands: {
      'cp templates/spec.md docs/specs/project-status-report.md':
        'copiado templates/spec.md -> docs/specs/project-status-report.md',
      'cp templates/plan.md .planning/phases/01-store-addTask.md':
        'copiado templates/plan.md -> .planning/phases/01-store-addTask.md',
      'gsd-plan-phase 1':
        'Plan fase 1 — Store y addTask\n' +
        '  RED    escribe test de no-mutación para addTask\n' +
        '  RED    escribe test: addTask sobre proyecto nuevo lo crea\n' +
        '  GREEN  implementa store append + rewrite del JSON\n' +
        '  REFACTOR extrae read/write del store\n' +
        '  VERIFY  npx tsc --noEmit && npm test',
      'gsd-execute-phase 1':
        'fase 1: 2 tests RED, luego GREEN. typecheck en verde. tests 4/4.\n' +
        'Reporte DONE/VERIFIED escrito en .planning/tasks/01.md',
      'npm test':
        ' PASS  src/store.test.ts (5)\n PASS  src/addTask.test.ts (3)\n' +
        ' Tests 8 passed 8 total',
      'npx tsc --noEmit': 'typecheck: 0 errores.',
      'cat .planning/tasks/01.md':
        '# Task 01 — DONE/VERIFIED\n' +
        'Verificado: npm test (8/8), npx tsc --noEmit (0 err).\n' +
        'NO verificado: concurrencia (fuera de alcance, ver spec no-objetivos).\n' +
        'Supuestos: store en archivo plano, sin locking.\n' +
        'Humano revisa primero: la invariante de no-mutación.',
      'git status':
        'En la rama feat/project-status-report\n' +
        '  modificados:  src/store.ts, src/addTask.ts\n' +
        '  nuevos:       tests, .planning/, docs/specs/project-status-report.md',
    },
  },
  {
    id: 'm6-verify',
    title: 'M6 — Verificación con sensor',
    prompt: 'm6-verify$ ',
    intro:
      'Estás verificando una feature. El agente dice que terminó; el sensor\n' +
      'decide. Prueba `npm test`, luego `npx stryer run` (mutation testing).',
    commands: {
      'npm test': ' Tests 12 passed 12 total\n Duration 1.04s',
      'npx tsc --noEmit': 'typecheck: 0 errores.',
      'npx stryer run':
        'Mutation testing: 24 mutantes generados\n' +
        '  22 capturados (tests los detectan)\n' +
        '  2 SIN capturar:\n' +
        '    - closeTask: boundary `>` en vez de `>=` (no testeado)\n' +
        '    - statusReport: rango omitido cuando dateRange es null\n' +
        'Mutation score: 91% — por debajo del umbral (95%).\n' +
        'Acción: agrega tests para los 2 mutantes antes de mergear.',
      'cat templates/DONE_VERIFIED.md':
        '# DONE/VERIFIED\n' +
        '1. Qué se verificó (comando + número): npm test 12/12, tsc 0 err, stry 91%.\n' +
        '2. Qué NO se verificó: performance, concurrencia.\n' +
        '3. Supuestos: datos de prueba < 1k registros.\n' +
        '4. Qué revisa el humano primero: los 2 mutantes sin capturar.',
      'git status':
        'En la rama main\n nada para commitear, el árbol de trabajo está limpio',
    },
  },
  {
    id: 'm3-workbench',
    title: 'M3 — Workbench y .planning/',
    prompt: 'm3-workbench$ ',
    intro:
      'Estás en un proyecto con workbench montado. Explora la estructura de\n' +
      '.planning/ y el estado de la sesión con `cat .planning/state.json`.',
    commands: {
      'ls .planning/':
        'roadmap.md\nstate.json\ntasks/\nphases/',
      'cat .planning/state.json':
        '{\n  "current_phase": "02-listOpenTasks-closeTask",\n  "open_tasks": ["02", "03"],\n' +
        '  "last_verified": "2026-07-06T14:22Z",\n  "blockers": []\n}',
      'cat .planning/roadmap.md':
        '# Roadmap — project-status-report\n' +
        'M1: Store y addTask          [DONE/VERIFIED]\n' +
        'M2: listOpenTasks, closeTask [EN PROGRESO]\n' +
        'M3: statusReport con rango   [PENDIENTE]',
      'cat handoff.md':
        '# Handoff — sesión 2026-07-06\n' +
        'Estado: fase 2 a mitad de implementación (closeTask idempotente listo,\n' +
        'TaskNotFound pendiente). Próximo paso: test RED para TaskNotFound.\n' +
        'Comando de verificación: npm test && npx tsc --noEmit',
      'gsd-discuss':
        'Discusión de la fase: la duda abierta es si `closeTask` sobre id\n' +
        'inexistente lanza antes o después de validar el estado. Decisión:\n' +
        'validar existencia primero (lanza TaskNotFound), luego idempotencia.',
    },
  },
  {
    id: 'm0-diagnostico',
    title: 'M0 — Diagnóstico de sesión',
    prompt: 'm0-diagnostico$ ',
    intro:
      'Llevas 80 minutos en una sesión y el agente empezó a fallar de formas\n' +
      'que antes no fallaba. Antes de decir "se puso raro" y reabrir, diagnostica.\n' +
      'Empieza con `cat sintomas.txt`.',
    commands: {
      'cat sintomas.txt':
        '# Síntomas observados (últimos 15 min)\n' +
        '- Ignoró la regla "no mutar argumentos" del AGENTS.md\n' +
        '  (la respetó toda la primera hora).\n' +
        '- Repitió un error que ya corregiste dos veces.\n' +
        '- "Recuerda" que `to` es inclusivo en el filtro. No lo es.\n' +
        '- Contexto usado: ~78%.\n' +
        '¿El agente "se puso raro"... o tiene nombre?\n' +
        'Pista: `cat AGENTS.md`, `cat docs/specs/filterByDate.md`, luego\n' +
        '`diagnostico`.',
      'cat AGENTS.md':
        '# AGENTS.md\n' +
        'stack: TypeScript + Vitest\n' +
        'comandos: npm test | npx tsc --noEmit\n' +
        'regla: NO mutar argumentos (invariante)\n' +
        'gotcha: `to` es exclusivo en los rangos [from, to)',
      'cat docs/specs/filterByDate.md':
        '# Spec — filterByDate\n' +
        'Rango [from, to): from inclusivo, to EXCLUSIVO.\n' +
        'Invariante: no mutar el array de entrada.\n' +
        'AC: `npm test` en verde antes de declarar done.\n' +
        '\n' +
        'El agente "recuerda" que `to` es inclusivo. La spec dice lo\n' +
        'contrario. La primary source (este archivo) siempre gana sobre\n' +
        'lo que el agente "recuerda" de su contexto (secondary source).',
      '/compact':
        'Compacting... el historial se resumió a ~12k tokens.\n' +
        'Sobrevive: lo que vive en archivos (AGENTS.md, spec, .planning/).\n' +
        'No sobrevive: la trayectoria de intentos fallidos ni las\n' +
        'correcciones de medio camino.\n' +
        '\n' +
        'Cuidado: compactaste a ~78%, con el agente ya degradado. Lo\n' +
        'proactivo era compactar a ~60%... o cerrar con handoff.',
      'diagnostico':
        'Diagnóstico (con el vocabulario del M0):\n' +
        '1. Dumb zone: el contexto está saturado (~78%) y la atención\n' +
        '   degradó; el agente perdió instrucciones que antes respetaba.\n' +
        '2. El "recuerdo" equivocado de `to` es el contexto (secondary\n' +
        '   source) pisando a la spec (primary source). Cura: pídele\n' +
        '   releer el archivo, no "recordarlo mejor".\n' +
        '3. La cura estructural: compactar a tiempo (~60%) o cerrar la\n' +
        '   sesión con un handoff artifact y arrancar limpio.\n' +
        '\n' +
        '"Se puso raro" no es un diagnóstico. Ahora tienes nombres.',
    },
  },
  {
    id: 'm4-handoff',
    title: 'M4 — Cierre de sesión y handoff',
    prompt: 'm4-handoff$ ',
    intro:
      'El contexto va por ~65%: hora de cerrar limpio. Recorre el checklist\n' +
      'de cierre en 7 pasos. Empieza con `npm test` (paso 1: verificación\n' +
      'mecánica en verde).',
    commands: {
      'npm test':
        ' PASS  src/filterByDate.test.ts (4)\n' +
        ' PASS  src/statusReport.test.ts (7)\n' +
        ' Tests 11 passed 11 total\n' +
        'Paso 1 en marcha: verde lo dice el sensor, no el agente.',
      'npx tsc --noEmit':
        'typecheck: 0 errores.\n' +
        'Paso 1 OK: verificación mecánica completa.',
      'git log':
        'a1e7f3c Agrega statusReport con rango de fechas\n' +
        '        (verifica: npm test 11/11 — F2 completa)\n' +
        'b2c4d91 Agrega filterByDate + tests de no-mutación\n' +
        '        (verifica: npm test 4/4 — F1 completa)\n' +
        '9f0a2e1 init: harness mínimo (AGENTS.md, spec, init.sh)\n' +
        'Pasos 2 y 3 OK: un commit por unidad coherente, cada uno en\n' +
        'verde, con mensaje que dice qué hizo, qué verificó y qué no.',
      'cat claude-progress.md':
        '# Progress — status-report\n' +
        '| Tarea | Estado        | Nota                     |\n' +
        '|-------|---------------|--------------------------|\n' +
        '| F1    | DONE/VERIFIED | npm test 4/4             |\n' +
        '| F2    | DONE/VERIFIED | npm test 11/11           |\n' +
        '| F3    | sin tocar     | export CSV               |\n' +
        '## Bitácora (lo último arriba)\n' +
        '- Hice: rango [from, to) en statusReport.\n' +
        '- Descubrí: el mock de Date debe congelarse (ver test 7).\n' +
        '- Bloqueante: ninguno.\n' +
        'Paso 4 OK: la última entrada es la verdad.',
      'cat handoff.md':
        '# Handoff — 2026-09-13\n' +
        '1. Spec activa: docs/specs/status-report.md (aprobada)\n' +
        '2. Progreso real: F1 y F2 DONE/VERIFIED; F3 (export CSV)\n' +
        '   sin tocar. Fuente mecánica: .planning/state.json\n' +
        '3. Bloqueantes: el tipo CSV del adapter no matchea el stub.\n' +
        '   Intentado: cast directo. Hipótesis: falta el codec.\n' +
        '   Prueba primero: el codec.\n' +
        '4. Decisiones: adapter propio en vez de tocar el servicio\n' +
        '   existente (razón: el servicio es de otro equipo).\n' +
        '5. Punto reproducible: SHA a1e7f3c; verificar con npm test.\n' +
        'Paso 5 OK: las cinco partes, bloqueantes incluidos.',
      'cat .planning/state.json':
        '{\n' +
        '  "current_feature": "F3-export-csv",\n' +
        '  "done": ["F1", "F2"],\n' +
        '  "blockers": ["tipo CSV vs stub del adapter"],\n' +
        '  "last_commit": "a1e7f3c"\n' +
        '}\n' +
        'Paso 6 OK: state.json y handoff cuentan la misma historia.\n' +
        'Si se contradicen, gana state.json.',
      'git status':
        'En la rama main\n' +
        'nada para commitear, el árbol de trabajo está limpio\n' +
        'Paso 7 OK: sesión cerrada en commit verde + handoff.',
      'nueva-sesion':
        'Sesión nueva iniciada (contexto en 0%).\n' +
        'Arranque:\n' +
        '1. Leí AGENTS.md — el contrato estable.\n' +
        '2. Leí handoff.md — el índice de estado.\n' +
        '3. Leí .planning/state.json — el estado mecánico real.\n' +
        '4. git log desde a1e7f3c: sin cambios posteriores.\n' +
        '5. Confirmo antes de tocar código: "F1 y F2 verificadas, falta\n' +
        '   F3 (export CSV) y hay un bloqueante con el stub del adapter.\n' +
        '   ¿Avanzo así?"\n' +
        'El estado sobrevivió al cierre porque vivía en archivos, no en\n' +
        'la conversación.',
    },
  },
  {
    id: 'm7-arbol',
    title: 'M7 — Árbol de decisión',
    prompt: 'm7-arbol$ ',
    intro:
      'El agente falló. Antes de reintentar en ciego, clasifica la falla:\n' +
      'la clase determina la respuesta. Escribe `arbol` para ver el árbol\n' +
      'de decisión §7.9, o prueba `diagnostico contexto`.',
    commands: {
      arbol:
        'El agente falló. ¿De qué clase es?\n' +
        '├─ ¿Contexto saturado (>60%) o pierde reglas que antes\n' +
        '│  respetaba? → contexto. Prueba `diagnostico contexto`\n' +
        '├─ ¿Llamó a una tool inexistente o fabricó argumentos?\n' +
        '│  → tools. Prueba `diagnostico tools`\n' +
        '├─ ¿Repite pasos, deriva a tareas no pedidas u oscila?\n' +
        '│  → trayectoria. Prueba `diagnostico trayectoria`\n' +
        '├─ ¿Afirmó verificar sin ejecutar, o reporte hueco?\n' +
        '│  → acción. Prueba `diagnostico accion`\n' +
        '└─ ¿Paths fuera de scope, instrucciones de un archivo del\n' +
        '   repo, o credenciales filtradas? → sandbox.\n' +
        '   Prueba `diagnostico sandbox`',
      'diagnostico contexto':
        'Síntoma: contexto ~75%; el agente pierde reglas que antes\n' +
        'respetaba.\n' +
        'Clase: corrupción de contexto (context rot).\n' +
        'Mitigación: NO reintentes. Compacta (M4 §4.2) o cierra sesión\n' +
        'con handoff (M4 §4.3) y arranca limpio.\n' +
        'Reintentar en el mismo contexto es apostar a que el modelo\n' +
        'produzca algo distinto con lo mismo. ~40% de las fallas son\n' +
        'de esta familia: es la primera pregunta que debes hacerte.',
      'diagnostico tools':
        'Síntoma: llamó a una tool inexistente, fabricó argumentos\n' +
        'plausibles o usó la tool equivocada.\n' +
        'Clase: mal uso de tools (hallucinated tool call,\n' +
        'argument fabrication).\n' +
        'Mitigación: devuelve error estructurado al modelo y revisa el\n' +
        'schema de la tool (M5 §5.1.2). Reintenta solo tras corregir\n' +
        'el schema; nunca en ciego.',
      'diagnostico trayectoria':
        'Síntoma: repite pasos sin avanzar, deriva a tareas no pedidas\n' +
        '("mientras tanto, refactorizo esto") u oscila entre dos\n' +
        'soluciones.\n' +
        'Clase: trayectoria / degeneración (infinite loop,\n' +
        'yak-shaving, scope creep).\n' +
        'Mitigación: corta el loop. Reespecifica con no-objetivos\n' +
        'explícitos (M2) y usa un worktree aislado para que la deriva\n' +
        'no contamine main. No reintentes.',
      'diagnostico accion':
        'Síntoma: afirmó verificar sin ejecutar, o su reporte es hueco\n' +
        '("todo OK ✓", sin números).\n' +
        'Clase: acción / realización (phantom verification,\n' +
        'hollow report).\n' +
        'Mitigación: exige evidencia mecánica (M6 §6.5). El sensor, no\n' +
        'el modelo, debe confirmar; si no puede mostrar el output del\n' +
        'comando, no verificó. No reintentes sin sensor.',
      'diagnostico sandbox':
        'Síntoma: accedió a paths fuera de scope, obedeció\n' +
        'instrucciones halladas en un archivo del repo o filtró\n' +
        'credenciales.\n' +
        'Clase: sandbox y seguridad (prompt injection via repo,\n' +
        'credential leakage).\n' +
        'Mitigación: esto es incidente. Aísla, audita, endurece (M10).\n' +
        'NO reintentes: reintentar un leak de credenciales es\n' +
        'reproducir el leak.',
    },
  },
];