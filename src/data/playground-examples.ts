// Ejemplos del playground JS (Fase 4d). Ports ejecutables de la prosa del
// curso: cada uno corre en el navegador (sandboxed iframe) y hace
// console.log del resultado. Contenido autorado, committed, español neutro.
// Sin imports: JS plano del browser.

export interface PlaygroundExample {
  id: string;
  title: string;
  /** Módulo/lab de origen, para contexto. */
  module: string;
  code: string;
}

export const examples: PlaygroundExample[] = [
  {
    id: 'filterByDate',
    title: 'filterByDate (lab-01 / M2)',
    module: 'modules/02-spec-plan-execute, labs/lab-01',
    code: `// filterByDate(items, range): filtra eventos por [from, to).
// Invariante: from inclusivo, to exclusivo; NO muta items.
function filterByDate(items, range) {
  const { from, to } = range;
  if (!(from < to)) throw new Error('from debe ser < to');
  return items.filter((e) => e.date >= from && e.date < to);
}

const events = [
  { name: 'a', date: '2026-01-01' },
  { name: 'b', date: '2026-01-15' },
  { name: 'c', date: '2026-02-01' },
];

const r = filterByDate(events, { from: '2026-01-01', to: '2026-02-01' });
console.log('en rango:', r.map((e) => e.name));          // ['a','b']
console.log('original intacto:', events.length === 3);   // true (no muta)
console.log('to exclusivo:', !r.some((e) => e.name === 'c')); // true
`,
  },
  {
    id: 'task-store',
    title: 'task-store (lab-02)',
    module: 'labs/lab-02',
    code: `// task-store: addTask / listOpenTasks / closeTask.
// Append + rewrite del store (no muta argumentos). closeTask idempotente.
let store = { tasks: [] };

function addTask(project, task) {
  const id = store.tasks.length + 1;
  store.tasks = [...store.tasks, { project, id, ...task, closed: false }];
  return store.tasks.at(-1);
}
function listOpenTasks(project) {
  return store.tasks.filter((t) => t.project === project && !t.closed);
}
function closeTask(project, taskId) {
  const t = store.tasks.find((x) => x.project === project && x.id === taskId);
  if (!t) throw new Error('TaskNotFound');
  if (t.closed) return t; // idempotente: no lanza
  store.tasks = store.tasks.map((x) =>
    x.id === taskId ? { ...x, closed: true } : x,
  );
  return store.tasks.find((x) => x.id === taskId);
}

addTask('web', { title: 'setup' });
addTask('web', { title: 'spec' });
closeTask('web', 1);
console.log('abiertas web:', listOpenTasks('web').map((t) => t.title)); // ['spec']
closeTask('web', 1); // idempotente: segunda vez no lanza
console.log('idempotente ok');
`,
  },
  {
    id: 'filterStatus',
    title: 'filterStatus (lab-02)',
    module: 'labs/lab-02',
    code: `// filterStatus(tasks, status): filtra por estado. No muta.
function filterStatus(tasks, status) {
  return tasks.filter((t) => t.status === status);
}

const tasks = [
  { id: 1, status: 'open' },
  { id: 2, status: 'closed' },
  { id: 3, status: 'open' },
];

console.log('open:', filterStatus(tasks, 'open').map((t) => t.id));     // [1,3]
console.log('closed:', filterStatus(tasks, 'closed').map((t) => t.id)); // [2]
console.log('original intacto:', tasks.length === 3);                  // true
`,
  },
  {
    id: 'invariant-sensor',
    title: 'Invariante + sensor (M2)',
    module: 'modules/02-spec-plan-execute',
    code: `// Una invariante explicita + un sensor que la verifica para varios casos.
function normalizeRange(r) {
  // Invariante: devuelve {from,to} con from <= to.
  if (r.from > r.to) throw new Error('from > to rompe la invariante');
  return { from: r.from, to: r.to };
}

// Sensor: comprueba la invariante para un set de entradas.
function sensor() {
  const cases = [
    { from: 1, to: 5 },
    { from: 5, to: 1 },  // debe lanzar
    { from: 3, to: 3 },  // frontera: from === to es valido
  ];
  for (const c of cases) {
    try {
      const out = normalizeRange(c);
      if (!(out.from <= out.to)) throw new Error('invariante violada');
    } catch (e) {
      if (c.from <= c.to) throw e; // lanzar solo si no era esperado
    }
  }
  return 'sensor: invariante ok';
}

console.log(sensor());
`,
  },
  {
    id: 'mutation-testing',
    title: 'Mutation testing mini (M6)',
    module: 'modules/06-verificacion',
    code: `// Bug sutil que un mutation test detectaria: el limite inferior usa '>'
// (exclusivo) en vez de '>=' (inclusivo). Pierde el caso limite 'from'.
function filterByDateBuggy(items, range) {
  return items.filter((e) => e.date > range.from && e.date < range.to);
}

const events = [
  { name: 'a', date: '2026-01-01' }, // == from -> deberia entrar, el bug la excluye
  { name: 'b', date: '2026-01-05' },
  { name: 'c', date: '2026-01-10' },
];

const out = filterByDateBuggy(events, { from: '2026-01-01', to: '2026-01-10' });
console.log('incluye from?', out.some((e) => e.date === '2026-01-01')); // false -> BUG
console.log('resultado:', out.map((e) => e.name));                     // ['b']

// Fix: cambiar '>' por '>=' en el limite inferior. El mutation test lo atrapa
// porque un test con date === from falla al mutar '>=' a '>'.
`,
  },
  {
    id: 'tdd-red-green',
    title: 'TDD red → green (M2/M6)',
    module: 'modules/02-spec-plan-execute, modules/06-verificacion',
    code: `// TDD: escribe el test primero (RED), luego el codigo minimo (GREEN).

// Paso 1 — RED: stub que no pasa el test.
function isClosed(t) {
  return false; // TODO
}

function runTests() {
  if (!isClosed({ closed: true }))
    throw new Error('RED: isClosed no detecta closed=true');
  if (isClosed({ closed: false }))
    throw new Error('RED: isClosed dice closed cuando no lo esta');
  return 'GREEN: tests pasan';
}

try {
  console.log(runTests());
} catch (e) {
  console.log(e.message);
}

// Paso 2 — GREEN: descomenta la implementacion minima y vuelve a ejecutar:
// function isClosed(t) { return t.closed === true; }
`,
  },
];