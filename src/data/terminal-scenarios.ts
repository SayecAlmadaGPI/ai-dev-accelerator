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
];