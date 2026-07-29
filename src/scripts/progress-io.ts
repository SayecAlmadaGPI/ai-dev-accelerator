// Exportar/importar progreso del curso (Fase 3). Persistencia en localStorage,
// SIN backend. Reúne `aida:done:*`, `aida:quiz:*` y `aida:badge:*` en un JSON
// que puedes descargar y restaurar. Tras importar, avisa a la UI con los
// eventos custom `aida:progress` y `aida:badges`.

const PREFIX_DONE = 'aida:done:';
const PREFIX_QUIZ = 'aida:quiz:';
const PREFIX_BADGE = 'aida:badge:';

interface ProgressExport {
  version: 1;
  exported: string; // ISO date
  done: string[];
  quizzes: Record<string, number>;
  badges: string[];
}

interface ImportSummary {
  done: number;
  quizzes: number;
  badges: number;
}

/** Reúne todo el progreso almacenado y dispara la descarga de un JSON. */
export function exportProgress(): void {
  if (typeof localStorage === 'undefined') return;

  const done: string[] = [];
  const quizzes: Record<string, number> = {};
  const badges: string[] = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key) continue;

    if (key.startsWith(PREFIX_DONE)) {
      if (localStorage.getItem(key) === '1') {
        done.push(key.slice(PREFIX_DONE.length));
      }
    } else if (key.startsWith(PREFIX_QUIZ)) {
      const raw = localStorage.getItem(key);
      const value = raw != null ? Number(raw) : NaN;
      if (!Number.isNaN(value)) {
        quizzes[key.slice(PREFIX_QUIZ.length)] = value;
      }
    } else if (key.startsWith(PREFIX_BADGE)) {
      if (localStorage.getItem(key) === '1') {
        badges.push(key.slice(PREFIX_BADGE.length));
      }
    }
  }

  const payload: ProgressExport = {
    version: 1,
    exported: new Date().toISOString(),
    done,
    quizzes,
    badges,
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);

  const fecha = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const a = document.createElement('a');
  a.href = url;
  a.download = `ai-dev-accelerator-progreso-${fecha}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  // Libera la URL del blob en el siguiente ciclo para no cortar la descarga.
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

/** Lee un JSON de progreso, valida la versión y restaura las claves. */
export async function importProgress(file: File): Promise<ImportSummary> {
  const text = await file.text();
  const data = JSON.parse(text) as Partial<ProgressExport>;

  if (!data || data.version !== 1) {
    throw new Error('El archivo de progreso no es válido o su versión no es compatible.');
  }

  if (typeof localStorage === 'undefined') {
    return { done: 0, quizzes: 0, badges: 0 };
  }

  let doneCount = 0;
  let quizCount = 0;
  let badgeCount = 0;

  const done = Array.isArray(data.done) ? data.done : [];
  const quizzes =
    data.quizzes && typeof data.quizzes === 'object' ? data.quizzes : {};
  const badges = Array.isArray(data.badges) ? data.badges : [];

  for (const slug of done) {
    if (typeof slug === 'string' && slug.length > 0) {
      localStorage.setItem(PREFIX_DONE + slug, '1');
      doneCount++;
    }
  }

  for (const [slug, score] of Object.entries(quizzes)) {
    if (typeof slug === 'string' && slug.length > 0 && typeof score === 'number') {
      localStorage.setItem(PREFIX_QUIZ + slug, String(score));
      quizCount++;
    }
  }

  for (const id of badges) {
    if (typeof id === 'string' && id.length > 0) {
      localStorage.setItem(PREFIX_BADGE + id, '1');
      badgeCount++;
    }
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('aida:progress'));
    window.dispatchEvent(new CustomEvent('aida:badges'));
  }

  return { done: doneCount, quizzes: quizCount, badges: badgeCount };
}

/** Pregunta al usuario y maneja errores de importación de forma simple. */
async function handleImport(input: HTMLInputElement): Promise<void> {
  const file = input.files && input.files[0];
  if (!file) return;
  try {
    const summary = await importProgress(file);
    console.info(
      `[aida] Progreso importado: ${summary.done} módulos, ${summary.quizzes} quizzes, ${summary.badges} insignias.`,
    );
  } catch (err) {
    console.error('[aida] No se pudo importar el progreso:', err);
    alert('No se pudo importar el progreso. Verifica que el archivo sea válido.');
  } finally {
    input.value = '';
  }
}

/**
 * Inicializa el sistema de export/import. Re-vincula en `astro:page-load`
 * para sobrevivir a las view transitions de Starlight.
 */
export function initProgressIO(_baseUrl: string): void {
  if (typeof document === 'undefined') return;

  // Limpia un input previo si existía (re-bind en view transitions).
  const prev = document.getElementById('aida-io-file') as HTMLInputElement | null;
  if (prev) prev.remove();

  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'application/json,.json';
  fileInput.id = 'aida-io-file';
  fileInput.style.display = 'none';
  fileInput.addEventListener('change', () => void handleImport(fileInput));
  document.body.appendChild(fileInput);

  // Exportación: botones con [data-io-export] o hash #export-progress
  // (acción de la paleta de comandos).
  const onExportClick = (e: Event): void => {
    e.preventDefault();
    exportProgress();
  };

  // Importación: botones con [data-io-import] o hash #import-progress.
  const onImportClick = (e: Event): void => {
    e.preventDefault();
    fileInput.click();
  };

  // Re-vincula listeners de elementos del DOM.
  const bindDom = (): void => {
    document
      .querySelectorAll('[data-io-export]')
      .forEach((el) => {
        el.removeEventListener('click', onExportClick);
        el.addEventListener('click', onExportClick);
      });
    document
      .querySelectorAll('[data-io-import]')
      .forEach((el) => {
        el.removeEventListener('click', onImportClick);
        el.addEventListener('click', onImportClick);
      });
  };

  bindDom();

  // Acciones por hash (paleta de comandos de Starlight).
  const checkHash = (): void => {
    const hash = window.location.hash;
    if (hash === '#export-progress') {
      exportProgress();
      // Limpia el hash para no re-disparar al navegar.
      history.replaceState(null, '', window.location.pathname + window.location.search);
    } else if (hash === '#import-progress') {
      fileInput.click();
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  };

  checkHash();
  window.addEventListener('hashchange', checkHash);

  // Re-bind tras view transitions de Astro.
  document.addEventListener('astro:page-load', () => {
    bindDom();
    checkHash();
  });
}

export type { ProgressExport, ImportSummary };