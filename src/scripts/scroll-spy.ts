// Scroll-spy para el TOC del panel derecho (rediseño e-learning).
// Resalta dinámicamente la sección visible del contenido en el índice
// lateral. Starlight ya fija `aria-current="true"` en el primer render,
// pero no lo actualiza al hacer scroll; aquí lo hacemos reactivo con
// IntersectionObserver.

// Selectores del DOM tal como existen en PageFrame.astro y PageSidebar.astro.
const MAIN_SELECTORS = ['.main-frame article', 'main article', 'main'];
const TOC_CONTAINER_SELECTOR = '.rp-toc';

// Guardamos el observer en módulo para poder desconectarlo al
// re-inicializar tras una view transition.
let observer: IntersectionObserver | null = null;
let scrollHandler: (() => void) | null = null;
let activeId: string | null = null;

/** Encuentra el contenedor de contenido principal. */
function getContentRoot(): HTMLElement | null {
  for (const sel of MAIN_SELECTORS) {
    const el = document.querySelector<HTMLElement>(sel);
    if (el) return el;
  }
  return null;
}

/** Encuentra el contenedor del TOC (panel derecho). */
function getTocContainer(): HTMLElement | null {
  return document.querySelector<HTMLElement>(TOC_CONTAINER_SELECTOR);
}

/**
 * Marca como activo el enlace del TOC cuyo href apunta al id dado.
 * Quita `aria-current` del resto para que el CSS de PageSidebar.astro
 * (`.rp-toc :global(:where(a[aria-current='true']))`) aplique el resaltado.
 */
function setActive(id: string | null): void {
  if (id === activeId) return;
  activeId = id;

  const toc = getTocContainer();
  if (!toc) return;

  const links = toc.querySelectorAll<HTMLAnchorElement>('a[href^="#"]');
  for (const link of links) {
    const target = link.getAttribute('href')?.slice(1) ?? '';
    if (id && target === id) {
      link.setAttribute('aria-current', 'true');
    } else {
      link.removeAttribute('aria-current');
    }
  }
}

/**
 * Inicializa el scroll-spy. Observa todos los h2/h3 del contenido y
 * actualiza el enlace activo del TOC según el heading más visible.
 * Es seguro llamarla varias veces: limpia la instancia previa.
 */
export function initScrollSpy(): void {
  if (typeof document === 'undefined') return;

  // Limpia la instancia anterior (view transitions).
  if (observer) {
    observer.disconnect();
    observer = null;
  }
  if (scrollHandler) {
    window.removeEventListener('scroll', scrollHandler, { passive: true } as EventListenerOptions);
    scrollHandler = null;
  }

  const content = getContentRoot();
  const toc = getTocContainer();
  if (!content || !toc) return;

  // Recopila los headings en orden de aparición.
  const headings = Array.from(
    content.querySelectorAll<HTMLElement>('h2, h3')
  ).filter((h) => h.id);

  if (headings.length === 0) return;

  // Mapa de id -> heading para resolver referencias.
  const byId = new Map<string, HTMLElement>();
  for (const h of headings) byId.set(h.id, h);

  // Lleva el registro de qué headings están actualmente intersectando.
  const visible = new Map<string, number>();

  // Elige el heading más cercano al tope del viewport como activo.
  function pickActive(): void {
    let bestId: string | null = null;
    let bestTop = Infinity;

    for (const [id, ratio] of visible) {
      if (ratio <= 0) continue;
      const h = byId.get(id);
      if (!h) continue;
      const top = h.getBoundingClientRect().top;
      // Preferimos el heading más alto que esté visible o ya pasado.
      if (top < bestTop) {
        bestTop = top;
        bestId = id;
      }
    }

    // Si nada está visible, mantenemos el último activo (puede ocurrir
    // en scroll rápido); si todo está por debajo del tope, marcamos el
    // primer heading.
    if (!bestId) {
      const firstTop = headings[0].getBoundingClientRect().top;
      if (firstTop > 0) {
        // Aún no llegamos al primer heading: nada activo.
        setActive(null);
        return;
      }
      bestId = headings[0].id;
    }

    setActive(bestId);
  }

  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const id = entry.target.id;
        if (entry.isIntersecting) {
          visible.set(id, entry.intersectionRatio);
        } else {
          visible.delete(id);
        }
      }
      pickActive();
    },
    {
      root: null,
      // Margen superior igual a la altura del header para que el heading
      // se considere "activo" al llegar justo bajo la navbar.
      rootMargin: '-80px 0px -70% 0px',
      threshold: [0, 0.25, 0.5, 1]
    }
  );

  for (const h of headings) observer.observe(h);

  // Al hacer scroll, también recalculamos por si el IntersectionObserver
  // no dispara (entrada/salida exacta en el borde).
  scrollHandler = () => pickActive();
  window.addEventListener('scroll', scrollHandler, { passive: true });

  // Estado inicial.
  pickActive();
}

// Re-inicializa en cada navegación de Astro (view transitions).
if (typeof document !== 'undefined') {
  document.addEventListener('astro:page-load', () => initScrollSpy());
}