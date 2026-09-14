// src/scripts/command-palette.ts
// Isla vanilla: command palette (Cmd+K / Ctrl+K) con búsqueda fuzzy sobre
// un índice generado en build-time (src/data/search-index.json). Sin React,
// sin dependencias runtime. Se monta en document.body al cargar.
//
// El índice se genera en build-content.mjs (ver generateSearchIndex()).
// Incluye: páginas (title, url, group) + acciones rápidas (simulador,
// playground, exportar/importar progreso).

export type SearchEntry = {
  title: string;
  url: string;
  group: string;
  type: 'page' | 'action';
  keywords?: string;
};

let palette: HTMLElement | null = null;
let input: HTMLInputElement | null = null;
let resultsEl: HTMLElement | null = null;
let index: SearchEntry[] = [];
let filtered: SearchEntry[] = [];
let selectedIdx = 0;
let base = '/';
let lastFocused: HTMLElement | null = null;

// --- Fuzzy search simple (subsecuencia + scoring por cercanía) ---
function fuzzyScore(query: string, text: string): number {
  if (!query) return 1;
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  if (t.includes(q)) return 100 - (t.indexOf(q) === 0 ? 0 : 10);
  // Subsecuencia fuzzy
  let qi = 0;
  let score = 0;
  let lastMatch = -1;
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) {
      score += lastMatch === -1 ? 10 : Math.max(1, 10 - (ti - lastMatch - 1));
      lastMatch = ti;
      qi++;
    }
  }
  return qi === q.length ? score : 0;
}

function search(query: string): SearchEntry[] {
  if (!query.trim()) {
    // Sin query: mostrar páginas principales + acciones
    return [
      ...index.filter((e) => e.type === 'action'),
      ...index.filter((e) => e.group === 'Módulos').slice(0, 5),
    ];
  }
  const scored = index
    .map((e) => {
      const s = Math.max(
        fuzzyScore(query, e.title) * 2,
        fuzzyScore(query, e.group),
        e.keywords ? fuzzyScore(query, e.keywords) * 0.7 : 0,
      );
      return { entry: e, score: s };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 12);
  return scored.map((x) => x.entry);
}

// Escapa texto/atributos inyectados vía innerHTML (title, group, url).
function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function render() {
  if (!resultsEl) return;
  filtered = search(input?.value || '');
  resultsEl.innerHTML = filtered
    .map(
      (e, i) => `
      <li class="cp-result" role="option" id="cp-opt-${i}" aria-selected="false" data-url="${esc(e.url)}" data-idx="${i}">
        <span class="cp-result__group">${esc(e.group)}</span>
        <span class="cp-result__title">${esc(e.title)}</span>
        <span class="cp-result__type">${e.type === 'action' ? 'acción' : 'página'}</span>
      </li>`,
    )
    .join('');
  setActive(filtered.length > 0 ? 0 : -1);
}

function navigate(url: string) {
  close();
  // Usar navigate() de Astro si está disponible (view transitions), sino location
  const w = window as unknown as { navigate?: (url: string) => void };
  if (w.navigate) {
    w.navigate(url);
  } else {
    window.location.href = url;
  }
}

function open() {
  if (!palette) return;
  lastFocused = document.activeElement as HTMLElement | null;
  palette.classList.add('cp-is-open');
  input?.focus();
  input?.select();
  render();
  input?.setAttribute('aria-expanded', 'true');
}

function close() {
  if (!palette) return;
  palette.classList.remove('cp-is-open');
  if (input) input.value = '';
  input?.setAttribute('aria-expanded', 'false');
  input?.removeAttribute('aria-activedescendant');
  // Devolver el foco al elemento que abrió la paleta
  lastFocused?.focus();
  lastFocused = null;
}

// Marca la opción idx como activa: clase visual, aria-selected y
// aria-activedescendant sobre el combobox (patrón WAI-ARIA).
function setActive(idx: number) {
  selectedIdx = Math.max(0, idx);
  const items = resultsEl?.querySelectorAll('.cp-result');
  items?.forEach((el, i) => {
    el.classList.toggle('cp-result--active', i === selectedIdx);
    el.setAttribute('aria-selected', i === selectedIdx ? 'true' : 'false');
  });
  const activeId = items?.[selectedIdx]?.id;
  if (input) {
    if (activeId) input.setAttribute('aria-activedescendant', activeId);
    else input.removeAttribute('aria-activedescendant');
  }
  items?.[selectedIdx]?.scrollIntoView({ block: 'nearest' });
}

function moveSelection(delta: number) {
  if (filtered.length === 0) return;
  setActive((selectedIdx + delta + filtered.length) % filtered.length);
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    e.preventDefault();
    close();
    return;
  }
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    moveSelection(1);
    return;
  }
  if (e.key === 'ArrowUp') {
    e.preventDefault();
    moveSelection(-1);
    return;
  }
  if (e.key === 'Enter') {
    e.preventDefault();
    const entry = filtered[selectedIdx];
    if (entry) navigate(entry.url);
    return;
  }
}

function buildPalette() {
  if (palette) return;
  palette = document.createElement('div');
  palette.className = 'cp';
  palette.setAttribute('role', 'dialog');
  palette.setAttribute('aria-modal', 'true');
  palette.setAttribute('aria-label', 'Búsqueda rápida');
  palette.innerHTML = `
    <div class="cp__backdrop" data-cp-close></div>
    <div class="cp__panel">
      <div class="cp__input-wrap">
        <svg class="cp__icon" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
        </svg>
        <input class="cp__input" type="text" role="combobox" id="cp-input" placeholder="Buscar páginas, módulos, acciones…" autocomplete="off" spellcheck="false" aria-expanded="false" aria-controls="cp-listbox" aria-autocomplete="list" />
        <kbd class="cp__esc">Esc</kbd>
      </div>
      <ul class="cp__results" id="cp-listbox" role="listbox" aria-label="Resultados"></ul>
      <div class="cp__foot">
        <span><kbd>↑</kbd><kbd>↓</kbd> navegar</span>
        <span><kbd>↵</kbd> abrir</span>
        <span><kbd>Esc</kbd> cerrar</span>
      </div>
    </div>
  `;
  document.body.appendChild(palette);

  input = palette.querySelector('.cp__input');
  resultsEl = palette.querySelector('.cp__results');

  input?.addEventListener('input', render);
  input?.addEventListener('keydown', handleKeydown);

  // Focus trap: el input es el único elemento enfocable del modal, así que
  // Tab/Shift+Tab vuelven a él y Escape cierra desde cualquier punto.
  palette.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && e.target !== input) {
      e.preventDefault();
      close();
      return;
    }
    if (e.key === 'Tab') {
      e.preventDefault();
      input?.focus();
    }
  });

  palette.querySelector('[data-cp-close]')?.addEventListener('click', close);
  resultsEl?.addEventListener('click', (e) => {
    const target = (e.target as HTMLElement).closest('.cp-result');
    if (target) {
      const url = target.getAttribute('data-url');
      if (url) navigate(url);
    }
  });
  resultsEl?.addEventListener('mousemove', (e) => {
    const target = (e.target as HTMLElement).closest('.cp-result');
    if (target) {
      const idx = Number(target.getAttribute('data-idx'));
      if (idx !== selectedIdx) setActive(idx);
    }
  });
}

export function initCommandPalette(baseUrl: string) {
  base = baseUrl;
  // Cargar índice
  fetch(baseUrl + 'search-index.json')
    .then((r) => r.json())
    .then((data) => {
      index = data;
    })
    .catch(() => {
      // En dev, el índice puede no estar listo aún
    });

  // Atajo global Cmd+K / Ctrl+K
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (palette?.classList.contains('cp-is-open')) close();
      else {
        buildPalette();
        open();
      }
    }
  });

  // Re-inicializar tras view transitions
  document.addEventListener('astro:page-load', () => {
    if (palette?.classList.contains('cp-is-open')) close();
  });
}