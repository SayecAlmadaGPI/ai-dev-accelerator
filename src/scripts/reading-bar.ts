// Barra de progreso de lectura (rediseño e-learning).
// Muestra, en la parte superior de la página, qué porcentaje del
// contenido principal ya fue recorrido. La barra se oculta en la
// landing y en páginas sin contenido de artículo.
//
// El CSS ya vive en theme.css (.aida-readbar / .aida-readbar__fill /
// .aida-readbar.is-hidden). Aquí solo creamos el marcado y lo
// mantenemos sincronizado con el scroll.

const MAIN_SELECTORS = ['.main-frame article', 'main article', 'main'];

let bar: HTMLElement | null = null;
let fill: HTMLElement | null = null;
let scrollHandler: (() => void) | null = null;
let rafId: number | null = null;

/** Crea (o reutiliza) el elemento de la barra en el body. */
function ensureBar(): { bar: HTMLElement; fill: HTMLElement } {
  if (bar && fill && document.body.contains(bar)) {
    return { bar, fill };
  }
  bar = document.createElement('div');
  bar.className = 'aida-readbar';
  fill = document.createElement('div');
  fill.className = 'aida-readbar__fill';
  bar.appendChild(fill);
  document.body.appendChild(bar);
  return { bar, fill };
}

/** Encuentra el contenedor de contenido principal. */
function getContentRoot(): HTMLElement | null {
  for (const sel of MAIN_SELECTORS) {
    const el = document.querySelector<HTMLElement>(sel);
    if (el) return el;
  }
  return null;
}

/**
 * Determina si la barra debe mostrarse en la página actual.
 * Se oculta en la landing (`/` o el baseUrl) y en rutas que no
 * tienen contenido de artículo (p. ej. índices sin article).
 */
function shouldShow(baseUrl: string): boolean {
  const path = window.location.pathname;

  // Normaliza el base: siempre con barra final.
  const base = baseUrl.endsWith('/') ? baseUrl : baseUrl + '/';
  const root = base === '/' ? '/' : base;

  // Oculta en la landing.
  if (path === '/' || path === root || path === root.replace(/\/$/, '')) {
    return false;
  }

  // Oculta si no hay contenedor de contenido.
  const content = getContentRoot();
  if (!content) return false;

  // Si el contenido es muy corto (no hay desbordamiento), no se justifica.
  const scrollable = content.scrollHeight - content.clientHeight;
  if (scrollable <= 80) return false;

  return true;
}

/** Calcula el porcentaje de progreso y actualiza el fill. */
function update(): void {
  if (!fill) return;
  const content = getContentRoot();
  if (!content) {
    fill.style.width = '0%';
    return;
  }

  // Distancia desde el tope del viewport hasta el inicio del contenido.
  const rect = content.getBoundingClientRect();
  const total = content.scrollHeight - window.innerHeight;
  if (total <= 0) {
    fill.style.width = '0%';
    return;
  }

  // Avance relativo: cuánto del contenido ya "subió" por encima del tope.
  const scrolled = -rect.top;
  const pct = Math.max(0, Math.min(100, (scrolled / total) * 100));
  fill.style.width = pct.toFixed(2) + '%';
}

/** Loop de actualización con rAF para evitar thrash al hacer scroll. */
function onScroll(): void {
  if (rafId !== null) return;
  rafId = requestAnimationFrame(() => {
    rafId = null;
    update();
  });
}

/**
 * Inicializa la barra de progreso de lectura.
 * @param baseUrl Base URL del sitio (import.meta.env.BASE_URL).
 */
export function initReadingBar(baseUrl: string = '/'): void {
  if (typeof document === 'undefined') return;

  // Limpia la instancia anterior (view transitions).
  if (scrollHandler) {
    window.removeEventListener('scroll', scrollHandler, { passive: true } as EventListenerOptions);
    window.removeEventListener('resize', scrollHandler);
    scrollHandler = null;
  }
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }

  const { bar: barEl, fill: fillEl } = ensureBar();
  bar = barEl;
  fill = fillEl;

  // Resetea el ancho para evitar flashes entre navegaciones.
  fill.style.width = '0%';

  const show = shouldShow(baseUrl);
  bar.classList.toggle('is-hidden', !show);

  if (!show) return;

  scrollHandler = onScroll;
  window.addEventListener('scroll', scrollHandler, { passive: true });
  window.addEventListener('resize', scrollHandler);

  // Cálculo inicial.
  update();
}

// Re-evalúa en cada navegación de Astro (view transitions).
if (typeof document !== 'undefined') {
  document.addEventListener('astro:page-load', () => initReadingBar());
}