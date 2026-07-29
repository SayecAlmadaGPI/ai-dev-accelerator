// =============================================================================
// mermaid.ts — Isla de renderizado de diagramas Mermaid para Starlight.
// -----------------------------------------------------------------------------
// Carga Mermaid v11 (ESM) desde CDN solo si la página tiene bloques
// `language-mermaid` generados por Expressive Code, los reemplaza por SVG y
// re-inicializa en cada `astro:page-load` (view transitions).
// Paleta ámbar del design system (ver theme.css).
// =============================================================================
//   Tokens usados (oscuro):
//     --sl-color-accent:      #d4a056  (acento ámbar)
//     --sl-color-accent-low:  #2a1f12  (ámbar oscuro bajo)
//     --sl-color-bg-sidebar:  #0e0b09  (superficie terciaria)
//     --sl-color-bg-inline-code: #16110c (superficie secundaria)
//     --sl-color-text:        #e6e0d6  (texto base)
// =============================================================================

/** URL del build ESM de Mermaid v11 en CDN. */
const MERMAID_URL = 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';

/**
 * Variables de tema para Mermaid (dark + paleta ámbar del sitio).
 * Mapean a los tokens de theme.css para que los diagramas no rompan el look.
 */
const MERMAID_THEME_VARS = {
  primaryColor: '#2a1f12',
  primaryTextColor: '#e6e0d6',
  primaryBorderColor: '#d4a056',
  lineColor: '#d4a056',
  secondaryColor: '#16110c',
  tertiaryColor: '#0e0b09',
  fontFamily: 'Inter Variable, sans-serif'
};

/** true si Mermaid ya fue cargado e inicializado en esta sesión. */
let loaded = false;
/** Promise en vuelo de carga del módulo Mermaid (evita doble import). */
let loadPromise: Promise<typeof import('mermaid').default> | null = null;

/**
 * Carga Mermaid desde el CDN (ESM dinámico) una sola vez por sesión y lo
 * inicializa con el tema del sitio. Es seguro llamarlo en cada page-load:
 * las llamadas subsiguientes devuelven la misma promesa cacheada.
 */
async function loadMermaid(): Promise<typeof import('mermaid').default> {
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    // import dinámico: el bundler de Astro respeta la URL absoluta.
    const mod = await import(/* @vite-ignore */ MERMAID_URL);
    const mermaid = mod.default;

    mermaid.initialize({
      startOnLoad: false,
      theme: 'dark',
      themeVariables: MERMAID_THEME_VARS,
      securityLevel: 'loose',
      // Evita el autoarranque y deja que controlemos el render manual.
      deterministicIds: true
    });

    loaded = true;
    return mermaid;
  })().catch((err) => {
    // Si falla la carga, descartamos la promesa cacheada para reintentar.
    loadPromise = null;
    throw err;
  });

  return loadPromise;
}

/** Selector de los bloques de código que Expressive Code renderiza como Mermaid. */
const BLOCK_SELECTOR = 'pre>code.language-mermaid';

/** Contador para generar ids estables y únicos por diagrama. */
let diagramCounter = 0;

/**
 * Construye el placeholder de carga. Mientras Mermaid se descarga/renderiza,
 * el usuario ve "Renderizando diagrama…" en lugar del código crudo.
 */
function createPlaceholder(): HTMLDivElement {
  const ph = document.createElement('div');
  ph.className = 'aida-mermaid aida-mermaid--loading';
  ph.textContent = 'Renderizando diagrama…';
  return ph;
}

/**
 * Construye el wrapper final que envuelve el SVG renderizado. Mantiene el
 * spacing del design system sin tocar un CSS externo (estilos inline mínimos).
 */
function createWrapper(svg: string): HTMLDivElement {
  const wrap = document.createElement('div');
  wrap.className = 'aida-mermaid';
  // Spacing consistente con el resto del contenido (margin-block + overflow).
  wrap.style.marginBlock = '1.25rem';
  wrap.style.overflowX = 'auto';
  wrap.innerHTML = svg;
  return wrap;
}

/**
 * Construye la nota de error y deja el bloque de código original visible.
 * Se inserta una pequeña nota antes del `<pre>` para que el usuario sepa
 * que algo falló, sin romper la lectura del cheatsheet.
 */
function attachErrorNote(pre: HTMLPreElement, message: string): void {
  if (pre.dataset.aidaMermaidError === '1') return;
  pre.dataset.aidaMermaidError = '1';

  const note = document.createElement('div');
  note.className = 'aida-mermaid aida-mermaid--error';
  note.textContent = `No se pudo renderizar el diagrama: ${message}`;
  note.style.marginBlock = '0.75rem';
  note.style.color = '#e6e0d6';
  note.style.fontStyle = 'italic';
  note.style.opacity = '0.85';
  pre.insertAdjacentElement('beforebegin', note);
}

/**
 * Reemplaza un bloque `<pre><code class="language-mermaid">` por su SVG.
 * Si algo falla (carga o render), deja el bloque original y añade una nota.
 */
async function renderBlock(pre: HTMLPreElement): Promise<void> {
  const codeEl = pre.querySelector<HTMLElement>('code.language-mermaid');
  if (!codeEl) return;

  const code = codeEl.textContent ?? '';
  if (!code.trim()) return;

  // Id estable y único para el render de Mermaid (exige id único por diagrama).
  const id = `aida-mermaid-${++diagramCounter}`;

  // Placeholder visible mientras carga/renderiza.
  const placeholder = createPlaceholder();
  pre.insertAdjacentElement('beforebegin', placeholder);

  try {
    const mermaid = await loadMermaid();
    const { svg } = await mermaid.render(id, code);

    // El render de Mermaid puede dejar un <div> temporal suelto; lo limpia
    // la propia librería, pero por si acaso removemos el placeholder.
    placeholder.remove();
    pre.insertAdjacentElement('beforebegin', createWrapper(svg));

    // Ocultamos el `<pre>` original: el SVG ya lo representa.
    pre.style.display = 'none';
  } catch (err) {
    // Si Mermaid falla, sacamos el placeholder y dejamos el código crudo.
    placeholder.remove();
    const msg = err instanceof Error ? err.message : 'error desconocido';
    attachErrorNote(pre, msg);
  }
}

/**
 * Inicializa la isla de Mermaid. Busca todos los bloques `language-mermaid`
 * y los reemplaza por SVG. Es idempotente: seguro llamarla varias veces
 * (lo hacemos en cada `astro:page-load`).
 */
export function initMermaid(): void {
  if (typeof document === 'undefined') return;

  const blocks = Array.from(
    document.querySelectorAll<HTMLPreElement>(BLOCK_SELECTOR)
  );

  if (blocks.length === 0) return;

  // Renderiza en paralelo; cada bloque gestiona su propio error.
  for (const pre of blocks) {
    void renderBlock(pre);
  }
}

// Re-inicializa en cada navegación de Astro (view transitions).
if (typeof document !== 'undefined') {
  document.addEventListener('astro:page-load', () => initMermaid());
}