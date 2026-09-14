// Mapa slug → widgets de práctica contextual (F2g). Lo consume
// PageSidebar.astro para renderizar la card "Práctica en línea" del panel
// derecho: cada página puede tener uno o más widgets, en orden de aparición.
//
// Los ids apuntan a contenido autorado (canned, committed):
// - kind 'terminal'  → escenarios de src/data/terminal-scenarios.ts
// - kind 'playground' → ejemplos de src/data/playground-examples.ts
//
// Para agregar/quitar un widget en una página, edita este mapa (no
// PageSidebar.astro).

export interface WidgetRef {
  kind: 'terminal' | 'playground';
  /** Id del escenario o ejemplo que monta el widget. */
  id: string;
  /** Etiqueta visible en el summary colapsable. */
  label: string;
}

export const widgetsBySlug: Record<string, WidgetRef[]> = {
  'modules/00-lenguaje-operativo': [
    { kind: 'terminal', id: 'm0-diagnostico', label: 'Diagnóstico de sesión' },
  ],
  'modules/02-spec-plan-execute': [
    { kind: 'playground', id: 'filterByDate', label: 'filterByDate en vivo' },
  ],
  'modules/03-workbench': [
    { kind: 'terminal', id: 'm3-workbench', label: 'Workbench interactivo' },
  ],
  'modules/04-handoffs': [
    { kind: 'terminal', id: 'm4-handoff', label: 'Cierre de sesión' },
  ],
  'modules/06-verificacion': [
    { kind: 'playground', id: 'mutation-testing', label: 'Mutation testing mini' },
    { kind: 'terminal', id: 'm6-verify', label: 'Verificación interactiva' },
  ],
  'modules/07-failure-modes': [
    { kind: 'terminal', id: 'm7-arbol', label: 'Árbol de decisión' },
  ],
  'labs/lab-01-baseline-vs-harness': [
    { kind: 'terminal', id: 'lab-01', label: 'Lab 01 interactivo' },
  ],
  'labs/lab-02-spec-driven-feature': [
    { kind: 'terminal', id: 'lab-02', label: 'Lab 02 interactivo' },
    { kind: 'playground', id: 'task-store', label: 'task-store en vivo' },
  ],
};