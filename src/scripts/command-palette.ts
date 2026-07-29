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

function render() {
  if (!resultsEl) return;
  filtered = search(input?.value || '');
  selectedIdx = 0;
  resultsEl.innerHTML = filtered
    .map(
      (e, i) => `
      <li class="cp-result${i === 0 ? ' cp-result--active' : ''}" data-url="${e.url}" data-idx="${i}">
        <span class="cp-result__group">${e.group}</span>
        <span class="cp-result__title">${e.title}</span>
        <span class="cp-result__type">${e.type === 'action' ? 'acción' : 'página'}</span>
      </li>`,
    )
    .join('');
}

function navigate(url: string) {
  close();
  // Usar navigate() de Astro si está disponible (view transitions), sino location
  if (typeof window !== 'undefined' && (window as any).navigate) {
    (window as any).navigate(url);
  } else {
    window.location.href = url;
  }
}

function open() {
  if (!palette) return;
  palette.classList.add('cp-is-open');
  input?.focus();
  input?.select();
  render();
}

function close() {
  if (!palette) return;
  palette.classList.remove('cp-is-open');
  if (input) input.value = '';
}

function moveSelection(delta: number) {
  if (filtered.length === 0) return;
  selectedIdx = (selectedIdx + delta + filtered.length) % filtered.length;
  const items = resultsEl?.querySelectorAll('.cp-result');
  items?.forEach((el, i) => {
    el.classList.toggle('cp-result--active', i === selectedIdx);
  });
  items?.[selectedIdx]?.scrollIntoView({ block: 'nearest' });
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
        <input class="cp__input" type="text" placeholder="Buscar páginas, módulos, acciones…" autocomplete="off" spellcheck="false" />
        <kbd class="cp__esc">Esc</kbd>
      </div>
      <ul class="cp__results"></ul>
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
      if (idx !== selectedIdx) {
        selectedIdx = idx;
        resultsEl.querySelectorAll('.cp-result').forEach((el, i) => {
          el.classList.toggle('cp-result--active', i === selectedIdx);
        });
      }
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