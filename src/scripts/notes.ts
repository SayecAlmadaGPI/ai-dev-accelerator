// Isla vanilla de notas (Fase 4b). Drawer flotante (botón bottom-right) que
// guarda una nota por página en IndexedDB (vía idb-keyval). El key es el slug
// de la página actual, derivado igual que PageTitle.astro (pathname - base -
// trailing slash). Autosave con debounce 400ms; dispatcha evento aida:notes en
// window. Patrón Fase 3: sin React, monta en document.body (persiste entre
// navegaciones con view transitions). initNotes(base) se llama desde el
// <script> global de SiteTitle.astro en toda página.

import { get, set, del } from 'idb-keyval';

const EVENT = 'aida:notes';
const SAVE_MS = 400;

let baseUrl = '/';
let textarea: HTMLTextAreaElement | null = null;
let indicator: HTMLElement | null = null;
let drawer: HTMLElement | null = null;
let currentKey = '';
let saveTimer: ReturnType<typeof setTimeout> | null = null;

export function initNotes(base: string): void {
  if (typeof document === 'undefined') return;
  baseUrl = base || '/';
  mount();
  // Starlight usa client-side routing (view transitions): el drawer persiste
  // en body, pero el slug cambia. astro:page-load fires tras cada navegación
  // (incluida la inicial), así que recargamos la nota ahí.
  document.addEventListener('astro:page-load', loadNote);
  loadNote();
}

function currentSlug(): string {
  let p = location.pathname;
  if (p.startsWith(baseUrl)) p = p.slice(baseUrl.length);
  p = p.replace(/\/+$/, '');
  return p.toLowerCase();
}

function mount(): void {
  if (document.querySelector('.aida-notes-fab')) return; // ya montado

  // Botón flotante (FAB) bottom-right.
  const fab = document.createElement('button');
  fab.type = 'button';
  fab.className = 'aida-notes-fab sl-link-button secondary';
  fab.setAttribute('aria-label', 'Abrir notas');
  fab.setAttribute('aria-expanded', 'false');
  fab.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false"><path fill="currentColor" d="M5 3h14a1 1 0 0 1 1 1v16l-3-2-3 2-3-2-3 2-3-2-3 2V4a1 1 0 0 1 1-1zm3 5v1.5h8V8H8zm0 3.5V13h8v-1.5H8zm0 3.5v1.5h5V15H8z"/></svg><span>Notas</span>';
  fab.addEventListener('click', toggle);

  // Drawer panel lateral derecho.
  drawer = document.createElement('div');
  drawer.className = 'aida-notes-drawer';
  drawer.setAttribute('role', 'dialog');
  drawer.setAttribute('aria-label', 'Notas de la página');
  drawer.setAttribute('aria-hidden', 'true');
  drawer.innerHTML = `
    <div class="aida-notes__bar">
      <span class="aida-notes__title">Notas</span>
      <span class="aida-notes__slug"></span>
      <button class="aida-notes__close" type="button" aria-label="Cerrar notas">&times;</button>
    </div>
    <textarea class="aida-notes__ta" placeholder="Escribe aquí tus apuntes de esta página. Se guardan en tu navegador (IndexedDB) y persisten entre sesiones." spellcheck="true"></textarea>
    <div class="aida-notes__foot">
      <span class="aida-notes__ind">Listo</span>
      <button class="aida-notes__clear sl-link-button secondary" type="button">Borrar</button>
    </div>`;

  document.body.append(fab, drawer);

  textarea = drawer.querySelector<HTMLTextAreaElement>('.aida-notes__ta');
  indicator = drawer.querySelector<HTMLElement>('.aida-notes__ind');
  const slugLabel = drawer.querySelector<HTMLElement>('.aida-notes__slug');
  const closeBtn = drawer.querySelector<HTMLButtonElement>('.aida-notes__close');
  const clearBtn = drawer.querySelector<HTMLButtonElement>('.aida-notes__clear');
  const titleEl = drawer.querySelector<HTMLElement>('.aida-notes__title');

  closeBtn!.addEventListener('click', close);
  clearBtn!.addEventListener('click', clearNote);
  // Cierra con Escape cuando el drawer está abierto y el foco está adentro.
  drawer.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });

  // Exponer referencias para loadNote.
  (drawer as any)._slugLabel = slugLabel;
  (drawer as any)._titleEl = titleEl;

  textarea!.addEventListener('input', () => {
    setIndicator('Editando…');
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(save, SAVE_MS);
  });
}

function toggle(): void {
  if (!drawer) return;
  const open = drawer.classList.toggle('is-open');
  drawer.setAttribute('aria-hidden', open ? 'false' : 'true');
  const fab = document.querySelector<HTMLButtonElement>('.aida-notes-fab');
  fab?.setAttribute('aria-expanded', open ? 'true' : 'false');
  if (open) textarea?.focus();
}

function close(): void {
  if (!drawer) return;
  drawer.classList.remove('is-open');
  drawer.setAttribute('aria-hidden', 'true');
  document.querySelector<HTMLButtonElement>('.aida-notes-fab')?.setAttribute('aria-expanded', 'false');
  // Flush pendiente al cerrar.
  if (saveTimer) {
    clearTimeout(saveTimer);
    saveTimer = null;
    save();
  }
}

function loadNote(): void {
  if (!textarea || !drawer) return;
  const slug = currentSlug();
  currentKey = 'aida:note:' + slug;
  const slugLabel = (drawer as any)._slugLabel as HTMLElement;
  const titleEl = (drawer as any)._titleEl as HTMLElement;
  if (slugLabel) slugLabel.textContent = slug || 'inicio';
  if (titleEl) titleEl.textContent = slug ? 'Notas' : 'Notas · Inicio';
  // Carga sin disparar input.
  get(currentKey)
    .then((val) => {
      textarea!.value = (val as string) || '';
      setIndicator(val ? 'Guardado' : 'Listo');
    })
    .catch(() => {
      textarea!.value = '';
      setIndicator('Listo');
    });
}

function save(): void {
  if (!textarea || !currentKey) return;
  const value = textarea.value;
  if (value.trim().length === 0) {
    del(currentKey)
      .then(() => {
        setIndicator('Guardado');
        dispatch();
      })
      .catch(() => setIndicator('Error al guardar'));
    return;
  }
  set(currentKey, value)
    .then(() => {
      setIndicator('Guardado');
      dispatch();
    })
    .catch(() => setIndicator('Error al guardar'));
}

function clearNote(): void {
  if (!textarea) return;
  textarea.value = '';
  if (saveTimer) {
    clearTimeout(saveTimer);
    saveTimer = null;
  }
  del(currentKey)
    .then(() => {
      setIndicator('Borrado');
      dispatch();
    })
    .catch(() => setIndicator('Error al borrar'));
  textarea.focus();
}

function setIndicator(text: string): void {
  if (indicator) {
    indicator.textContent = text;
    indicator.dataset.state =
      text === 'Guardado' || text === 'Borrado' || text === 'Listo'
        ? 'ok'
        : text.startsWith('Error')
          ? 'err'
          : 'edit';
  }
}

function dispatch(): void {
  window.dispatchEvent(
    new CustomEvent(EVENT, { detail: { slug: currentKey, value: textarea?.value || '' } }),
  );
}