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
  /** Qué es y cómo se usa, visible al abrir el ejercicio en el modal. */
  desc: string;
}

export const widgetsBySlug: Record<string, WidgetRef[]> = {
  'modules/00-lenguaje-operativo': [
    { kind: 'terminal', id: 'm0-diagnostico', label: 'Diagnóstico de sesión', desc: 'Diagnostica una sesión degradada con el vocabulario del M0: corre los comandos sugeridos en la consola (empieza con cat sintomas.txt), lee la pista y escribe tu veredicto con el comando diagnostico.' },
  ],
  'modules/02-spec-plan-execute': [
    { kind: 'playground', id: 'filterByDate', label: 'filterByDate en vivo', desc: 'El ejemplo del M2 en JS real: ajusta la función de filtrado por estado y rango de fechas y ejecútala con tests en vivo.' },
  ],
  'modules/03-workbench': [
    { kind: 'terminal', id: 'm3-workbench', label: 'Workbench interactivo', desc: 'Recorre el workbench del M3: AGENTS.md, skills, hooks y .planning/ con comandos guiados.' },
  ],
  'modules/04-handoffs': [
    { kind: 'terminal', id: 'm4-handoff', label: 'Cierre de sesión', desc: 'Recorre los 7 pasos del cierre de sesión y la retoma desde archivos (M4 §4.6–4.7): corre cada paso y observa qué sobrevive.' },
  ],
  'modules/06-verificacion': [
    { kind: 'playground', id: 'mutation-testing', label: 'Mutation testing mini', desc: '¿Tu suite atrapa una mutación? Cambia > por >= y mira si los tests lo detectan (M6).' },
    { kind: 'terminal', id: 'm6-verify', label: 'Verificación interactiva', desc: 'DONE/VERIFIED vs phantom report: evalúa reportes de agente con el sensor correcto (M6).' },
  ],
  'modules/07-failure-modes': [
    { kind: 'terminal', id: 'm7-arbol', label: 'Árbol de decisión', desc: 'El árbol del M7 §7.9: corre arbol para verlo completo y diagnostico <clase> para la mitigación correcta de cada clase de falla.' },
  ],
  'labs/lab-01-baseline-vs-harness': [
    { kind: 'terminal', id: 'lab-01', label: 'Lab 01 interactivo', desc: 'Calentamiento del lab-01: baseline sin harness vs. harness con verificación.' },
  ],
  'labs/lab-02-spec-driven-feature': [
    { kind: 'terminal', id: 'lab-02', label: 'Lab 02 interactivo', desc: 'Recorrido del lab-02: spec → plan → tasks con .planning/ y gates.' },
    { kind: 'playground', id: 'task-store', label: 'task-store en vivo', desc: 'Store de tareas con idempotencia: completa tareas y verifica que repetir la operación no rompe nada (lab-02).' },
  ],
};