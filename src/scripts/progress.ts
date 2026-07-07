// Helpers de progreso (Fase 3). Persistencia por navegador en localStorage,
// SIN backend. Keys: `aida:done:<slug>`. El evento custom `aida:progress`
// permite que la card del landing (ProgressOverview) se actualice en vivo
// cuando se marca/desmarca un ítem desde otra página/isla.

const PREFIX = 'aida:done:';

export function getDone(slug: string): boolean {
  if (typeof localStorage === 'undefined') return false;
  return localStorage.getItem(PREFIX + slug) === '1';
}

export function setDone(slug: string, done: boolean): void {
  if (typeof localStorage === 'undefined') return;
  if (done) localStorage.setItem(PREFIX + slug, '1');
  else localStorage.removeItem(PREFIX + slug);
  notify();
}

export function toggleDone(slug: string): boolean {
  const next = !getDone(slug);
  setDone(slug, next);
  return next;
}

export function listDone(): string[] {
  if (typeof localStorage === 'undefined') return [];
  const out: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith(PREFIX)) out.push(k.slice(PREFIX.length));
  }
  return out;
}

function notify(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('aida:progress'));
}