# Handoff — Diseño y arquitectura del sitio AI Dev Accelerator

> Documento para cualquier herramienta agéntica (o persona) que quiera **rediseñar
> el HTML/CSS del curso** o **modificar una parte sin romper el resto**. Lee esto
> antes de tocar nada. Está verificado contra el código al 2026-07-28.

El sitio es un **Astro Starlight** estático desplegado en GitHub Pages:
https://SayecAlmadaGPI.github.io/ai-dev-accelerator/

- **Repo:** `SayecAlmadaGPI/ai-dev-accelerator` (público). Pages source = GitHub Actions.
- **Stack:** Astro 7 + Starlight 0.41. **Sin React.** Toda la interactividad es
  vanilla JS (islas que se montan por `data-*`).
- **Base path:** `/ai-dev-accelerator/` (definido en `astro.config.mjs`).
- **Idioma:** español neutro, forma **tú**, sin voseo. Restricción crítica: aplica
  a TODO el contenido nuevo (prosa, UI, comentarios, quizzes, escenarios, commits).

---

## 1. La regla #1: copy-on-build (no edites `src/content/docs/`)

El contenido del curso **no vive** en `src/content/docs/`. La fuente canónica es la
**raíz del repo**: `modules/`, `labs/`, `cheatsheets/`, `templates/`, `examples/`,
`README.md`, `BLUEPRINT.md`.

`scripts/build-content.mjs` corre en `prebuild`/`predev` (ver `package.json`) y:

1. Lee los `.md` de la raíz, deriva el `title:` del primer H1 y **borra ese H1**
   del body (para no duplicar el título de página de Starlight).
2. Reescribe los links internos `.md` → slugs con prefijo base, en minúsculas
   (GitHub Pages es case-sensitive).
3. Inyecta el mount-point del quiz al final de cada módulo:
   `<div data-quiz-mount data-slug="...">`.
4. Copia assets no-markdown (`.py`, `.sh`, `.json`, imágenes…) a `public/`.
5. Genera `src/data/trackable.json` (lista de módulos + labs trackeables).

**`src/content/docs/` y `src/data/trackable.json` están gitignored y se regeneran
en cada build. Editarlos a mano se pierde.** Edita siempre la raíz del repo.

**Excepciones (hand-authored, commiteadas, NO regeneradas):**
- `src/content/docs/simulador.mdx` — página del simulador.
- `src/content/docs/playground.mdx` — página del playground.
- `src/data/quizzes.ts`, `src/data/terminal-scenarios.ts`,
  `src/data/playground-examples.ts` — contenido de las islas.

---

## 2. Mapa de overrides de Starlight

Starlight permite reemplazar componentes por clave. En `astro.config.mjs` →
`components:` hay 6 overrides. **Todo el HTML custom vive en `src/components/`**.

| Componente | Archivo | Qué controla | CSS |
|---|---|---|---|
| `SiteTitle` | `src/components/SiteTitle.astro` | Marca SVG `>>` + wordmark en el header. **Contiene el `<script>` global de boot** de las islas (§4). | scoped en el archivo |
| `Hero` | `src/components/Hero.astro` | Hero del landing (solo `/`). Lee el bloque `hero:` del frontmatter que `build-content.mjs` inyecta en `index.md`. Incluye `ProgressOverview` + `ModuleDashboard`. | scoped + `:global(.aida-grad)` |
| `PageTitle` | `src/components/PageTitle.astro` | El `<h1>` de cada página + (en módulos/labs) el `ProgressRing` y el botón `ProgressMark`. | scoped |
| `PageFrame` | `src/components/PageFrame.astro` | **El layout entero**: header + sidebar izquierdo (con botón de colapsar) + `main-frame`. Estado de colapso en `localStorage` `aida:sidebar:collapsed`. | scoped |
| `Sidebar` | `src/components/Sidebar.astro` | Sidebar izquierdo accordion (fases colapsables, anillos de progreso mini, badge de número de módulo). | scoped |
| `PageSidebar` | `src/components/PageSidebar.astro` | **Panel derecho**: metadata del módulo, labs relacionados, TOC, y los **widgets de práctica embebidos** (§5). | scoped |

Componentes propios (no son overrides, se usan dentro de los anteriores):

| Archivo | Qué es |
|---|---|
| `src/components/ProgressRing.astro` | Anillo SVG de progreso (%, label). Se hidrata desde localStorage. Tamaños `md`/`sm`. |
| `src/components/ProgressMark.astro` | Botón "Marcar como completado" / "✓ Completado". |
| `src/components/ProgressOverview.astro` | Card "Tu progreso" del landing (anillo total + lista de módulos/labs). |
| `src/components/ModuleDashboard.astro` | Grid de cards de módulos en el landing (lee `modules/*.md` en build-time). |

**Otros archivos que tocan el HTML/render:**
- `src/content.config.ts` — define la colección `docs` con `docsSchema()`
  (OBLIGATORIO; sin él, Starlight filtra todas las entradas y no hay rutas).
- `astro.config.mjs` — sidebar, `customCss`, `head` (manifest/theme-color/icon),
  registro de overrides.

---

## 3. Design system — `src/styles/theme.css`

Es el único archivo de estilos globales. Se carga vía `customCss` en
`astro.config.mjs`. **Las reglas van SIN `@layer`** (unlayered) para pisar las
capas `starlight.base|core|components` en la cascada. No agregues `@layer` o
perderás especificidad.

### Tokens (sección `:root` = dark default; `:root[data-theme='light']` = light)

| Token | Uso |
|---|---|
| `--sl-color-accent` / `-high` / `-low` / `-text-accent` | Acento ámbar (#f59e0b dark / #b45309 light). **Cambia aquí para recolorear todo el sitio.** |
| `--sl-color-bg`, `-bg-nav`, `-bg-sidebar`, `-bg-inline-code`, `-bg-accent` | Superficies. |
| `--sl-color-hairline`, `-hairline-light`, `-hairline-shade` | Bordes. |
| `--sl-color-white`, `-black`, `-text` | Extremos cálidos + texto base. |
| `--sl-shadow-sm`/`-md`/`-lg` | Sombras. |
| `--sl-content-width` (48rem), `--sl-nav-height` (4rem), `--sl-sidebar-width` (17rem → 18rem ≥50rem), `--sl-nav-pad-x`, `--sl-nav-gap` | Layout. |

Fuentes: Inter Variable + JetBrains Mono Variable (cargadas vía
`@fontsource-variable/*` en `customCss`). Referenciadas como
`--sl-font` / `--sl-font-mono`.

### Familias de clases custom (todas en theme.css, búscalas por el prefijo)

| Prefijo | Feature | Aprox. líneas |
|---|---|---|
| `.pmark*` | Botón "completado" | 254–291 |
| `.aida-quiz*` | Quiz al final de módulos | 293–462 |
| `.aida-notes*` | Drawer de notas (FAB + panel) | 464–596 |
| `.aida-term*` | Simulador de terminal | 598–726 |
| `.aida-pg*` | Playground JS | 728–850 |
| layout 3 columnas + panel derecho ancho | `PageFrame`/`PageSidebar` | 852–944 |

**Notas de estilo del propio Starlight que se override:** header glassy (108–117),
item activo del sidebar con barra ámbar (128–165), cards `.sl-card`/`.card`
hover-lift (167–194), `.sl-link-button.primary`/`.secondary` (196–218),
focus-visible ring ámbar (239–246).

> Cada componente `.astro` tiene **además** su `<style>` scoped. Cuando cambies
> el look de un componente concreto, edita su `<style>` scoped; cuando cambies
> algo transversal (color, radio, sombra), edita `theme.css`.

---

## 4. Patrón de islas vanilla (la interactividad, sin React)

**No hay React.** Hay un único `<script>` global en `SiteTitle.astro` que hace
feature-detection por mount-point y `import()` dinámico (cada feature se
code-splittea y carga solo en la página que la necesita):

```
[data-quiz-mount]       → import('../scripts/quiz.ts').then(m => m.initQuizzes())
[data-term-mount]       → import('../scripts/term.ts').then(m => m.initTerm())
[data-playground-mount] → import('../scripts/playground.ts').then(m => m.initPlayground())
siempre                 → import('../scripts/notes.ts').then(m => m.initNotes(base))   (drawer en toda página)
siempre                 → navigator.serviceWorker.register(base + 'sw.js')            (PWA)
```

Usa un `MutationObserver` para detectar mount-points que aparezcan tras el
parsing (view transitions, streaming). Las islas soportan **múltiples instancias**
(`querySelectorAll` + estado encapsulado por mount).

### Dónde vive cada isla

| Isla | Script | Data source | Mount-point |
|---|---|---|---|
| Quiz | `src/scripts/quiz.ts` | `src/data/quizzes.ts` | `<div data-quiz-mount data-slug>` (inyectado por `build-content.mjs` al final de cada módulo) |
| Terminal | `src/scripts/term.ts` | `src/data/terminal-scenarios.ts` | `<div data-term-mount data-scenario>` (en `simulador.mdx` y widgets) |
| Playground | `src/scripts/playground.ts` | `src/data/playground-examples.ts` | `<div data-playground-mount data-example>` (en `playground.mdx` y widgets) |
| Notas | `src/scripts/notes.ts` | IndexedDB (`idb-keyval`) | se monta en `document.body` (FAB + drawer) |
| Progreso | `src/scripts/progress.ts` | localStorage | usado por `ProgressMark`/`ProgressOverview` |
| PWA | `public/sw.js` + `public/manifest.webmanifest` + `public/icon.svg` | — | registro en el boot |

**Contratos que NO hay que romper:**
- Los slugs se derivan **siempre igual**: `Astro.url.pathname` → quitar `BASE_URL`
  → quitar `/` final → minúsculas. (`PageTitle.astro`, `PageSidebar.astro`,
  `notes.ts` `currentSlug()`, `build-content.mjs` `slugFromRelPath`.)
- Eventos custom en `window`: `aida:progress` (progreso), `aida:quiz` (quiz),
  `aida:notes` (notas). `ProgressOverview` escucha `aida:progress` + `storage`.

---

## 5. Widgets de práctica embebidos (panel derecho)

`PageSidebar.astro` mapea **slug → widgets** y los renderiza debajo del TOC en una
card "Práctica en línea" (`<details>` colapsables). Cada widget es una instancia
independiente del simulador o playground.

| Página | Widgets |
|---|---|
| `modules/02-spec-plan-execute` | Playground `filterByDate` |
| `modules/03-workbench` | Simulador `m3-workbench` |
| `modules/06-verificacion` | Playground `mutation-testing` + Simulador `m6-verify` |
| `labs/lab-01-baseline-vs-harness` | Simulador `lab-01` |
| `labs/lab-02-spec-driven-feature` | Simulador `lab-02` + Playground `task-store` |

Para agregar/quitar un widget en una página, edita el bloque `widgets` en
`PageSidebar.astro` (líneas ~50–64). Para cambiar el tamaño de los widgets
embebidos, edita las reglas `.rp-practice__body :global(.aida-term*)` /
`.aida-pg*` al final del `<style>` de `PageSidebar.astro`.

En páginas con widgets, `<html data-has-widgets>` (lo setea un `<script is:inline>`
en `PageSidebar.astro`) ensancha el panel derecho (`theme.css` ~932).

---

## 6. Matriz "dónde cambiar X sin romper Y"

| Para cambiar… | Edita… | Cuidado con… |
|---|---|---|
| **Colores del sitio** | `theme.css` → `:root` (dark) y `:root[data-theme='light']` | mantener coherencia dark/light; los hardcoded `#fcd34d`/`#f59e0b`/`#ea580c` del gradient text están en `Hero.astro`, `theme.css` `.aida-quiz__title` y `.aida-progress__bar` |
| **Tipografía** | `theme.css` `--sl-font`/`--sl-font-mono` + `customCss` en `astro.config.mjs` | — |
| **Ancho del sidebar / contenido / header** | `theme.css` `--sl-sidebar-width`, `--sl-content-width`, `--sl-nav-height` | `PageFrame.astro` usa estos tokens; el colapso del sidebar recalcula padding en `PageFrame` + `theme.css` |
| **El header (nav)** | `PageFrame.astro` (estructura) + `theme.css` (108–117) + `SiteTitle.astro` (marca/título) | el header es `position: fixed`; `main-frame` le reserva altura con `padding-top` |
| **El sidebar izquierdo** | `Sidebar.astro` (estructura/accordion) + su `<style>` scoped + `theme.css` (128–165) | el toggle de colapso vive en `PageFrame.astro` |
| **El panel derecho** | `PageSidebar.astro` (estructura/widgets) + su `<style>` scoped + `theme.css` (896–944) | no reintroduzcas el colapso del panel derecho (se sacó a propósito, §8) |
| **El hero del landing** | `Hero.astro` + `build-content.mjs` `copyRootIndex()` (inyecta el bloque `hero:` en `index.md`) | el `<h1 id="_top" data-page-title>` es contract para TOC/skip-link/`document.title` |
| **El `<h1>` de las páginas** | `PageTitle.astro` | mantener `id="_top"` |
| **La card "Tu progreso"** | `ProgressOverview.astro` | depende de `trackable.json` (generado) y `progress.ts` |
| **El dashboard de módulos** | `ModuleDashboard.astro` | lee `modules/*.md` en build-time (H1 + primera oración) |
| **El anillo de progreso** | `ProgressRing.astro` (estructura + hidratación) + su `<style>` | **bug pendiente: §8** |
| **El quiz** | `src/data/quizzes.ts` (contenido) + `quiz.ts` (UI) + `.aida-quiz*` en `theme.css` | el mount-point lo inyecta `build-content.mjs`; no lo agregues a mano en `.md` |
| **El simulador** | `src/data/terminal-scenarios.ts` (escenarios) + `term.ts` (shell) + `.aida-term*` | — |
| **El playground** | `src/data/playground-examples.ts` (ejemplos) + `playground.ts` (iframe sandbox) + `.aida-pg*` | el iframe es `sandbox="allow-scripts"` sin `allow-same-origin`; validá `event.source` |
| **El drawer de notas** | `notes.ts` + `.aida-notes*` | se monta en `body` y persiste entre navegaciones; recarga nota en `astro:page-load` |
| **Sidebar / navegación** | `astro.config.mjs` `sidebar:` | los grupos autogenerados usan `{ label, items: [{ autogenerate: { directory } }] }` |
| **Manifest / PWA / icons** | `public/manifest.webmanifest`, `public/sw.js`, `public/icon.svg` + `head` en `astro.config.mjs` | scope = base path |
| **Contenido del curso (prosa)** | la raíz del repo (`modules/*.md`, `labs/…`, etc.) | **nunca** `src/content/docs/` (regenerado) |

---

## 7. Build y deploy

**Local (Node 22 obligatorio — el Node global v20 no sirve):**
```powershell
$env:PATH = "C:\Users\SALMADA\node22;" + $env:PATH
& "C:\Users\SALMADA\node22\npm.cmd" run dev      # dev server
& "C:\Users\SALMADA\node22\npm.cmd" run build    # build de producción
```
`prebuild`/`predev` corren `build-content.mjs` automáticamente.

**Deploy:** `.github/workflows/deploy.yml` con `withastro/action@v6` (Node 22) +
`actions/deploy-pages@v5`. Push a `main` → build + deploy automático.

---

## 8. Problemas conocidos / trampas

1. **RESUELTO (2026-07-28) — el anillo de progreso no mostraba "Completado".**
   `progress.ts` `setDone` guarda `aida:done:<slug>` con valor **`'1'`**;
   `ProgressRing.astro` comprueba `=== '1'` (antes era `=== 'true'`, que nunca
   coincidía). El chip `ProgressMark` usa `getDone` (comprueba `'1'`) y
   `ProgressOverview` usa `listDone` (solo el prefijo). Los tres lectores ahora
   son consistentes con el único escritor (`progress.ts`).

2. **`@xterm/xterm` y `@xterm/addon-fit` siguen en `package.json` pero ya no se
   usan.** El simulador se reescribió como terminal fake vanilla (`term.ts`).
   Se pueden quitar las deps para limpiar.

3. **`README.md` está desactualizado.** Dice "Pendiente (Fase 5): sitio estático"
   pero el sitio está live y completo.

4. **No reintroduzcas el colapso del panel derecho.** Se implementó y se sacó
   (commit `0bcc8b7`) porque ocultaba todo el panel (metadata + TOC + widgets) y
   la pestaña de reexpansión quedaba tapada por el header. El panel derecho es
   **siempre visible**. Si quieres más espacio de texto, colapsa el sidebar
   izquierdo (toggle del `PageFrame`).

5. **`src/content/docs/` es generado.** Si un link se rompe o falta una página,
   revisa la raíz del repo y `build-content.mjs`, no `src/content/docs/`.

6. **Sin `@layer` en `theme.css`.** Si agregas estilos globales ahí, van
   unlayered a propósito.

7. **Español neutro, forma tú.** Sin voseo (no `podés`/`tenés`/`marcás`/`decís`).
   Pasar grep curado antes de commitear contenido nuevo.

---

## 9. No tocar (salvo que sepas qué haces)

- `src/scripts/progress.ts` — contracts `aida:done:` + evento `aida:progress`.
- `src/data/trackable.json` — generado, gitignored.
- `src/content/docs/` (excepto `simulador.mdx` / `playground.mdx`) — generado.
- `.gitignore` — las páginas hand-authored y `public/` raíz son commiteadas.
- `src/content.config.ts` — el `docsSchema()` es obligatorio (sin él, no hay rutas).

---

## 10. Estructura rápida de archivos

```
astro.config.mjs              # overrides, sidebar, customCss, head, base
package.json                  # prebuild/predev → build-content.mjs
scripts/build-content.mjs     # copy-on-build (raíz → src/content/docs + public + search-index)
src/content.config.ts         # colección docs (docsSchema obligatorio)
src/styles/theme.css          # design system (tokens + componentes, sin @layer)
src/components/
  Head.astro                  # override Head: ClientRouter (view transitions) via astro-vtbot
  SiteTitle.astro             # marca + <script> boot de islas + SW register
  Hero.astro                  # hero del landing (ProgressOverview + ModuleDashboard)
  PageTitle.astro             # <h1> + Breadcrumbs + ProgressRing + ProgressMark
  PageFrame.astro             # layout 3 columnas + toggle colapso sidebar
  Sidebar.astro               # sidebar accordion
  PageSidebar.astro           # panel derecho + widgets embebidos
  ProgressRing.astro          # anillo SVG (% + label)
  ProgressMark.astro          # botón completado
  ProgressOverview.astro      # card "Tu progreso" (landing) + badges + export/import
  ModuleDashboard.astro       # grid de cards de módulos (landing)
  Badges.astro                # grid de badges desbloqueables (landing)
  Breadcrumbs.astro           # migas de pan sobre el <h1>
  Pagination.astro            # navegación prev/next al pie de contenido
src/scripts/
  progress.ts                 # aida:done: + evento aida:progress
  progress-io.ts              # export/import de progreso (JSON descargable)
  badges.ts                   # evaluación de badges + toast de desbloqueo
  command-palette.ts          # Cmd+K: búsqueda fuzzy + navegación rápida
  scroll-spy.ts               # highlight de TOC según scroll (IntersectionObserver)
  reading-bar.ts              # barra de progreso de lectura
  mermaid.ts                  # render de diagramas Mermaid (CDN lazy load)
  quiz.ts                     # isla quiz
  term.ts                     # isla terminal fake
  playground.ts               # isla playground (iframe sandbox)
  notes.ts                    # isla notas (IndexedDB)
src/data/
  quizzes.ts                  # 46 preguntas, 11 módulos (autorado, committed)
  terminal-scenarios.ts       # escenarios del simulador (autorado)
  playground-examples.ts      # ejemplos del playground (autorado)
  badges.ts                   # catálogo de badges + evaluateBadges() (autorado)
  trackable.json              # GENERADO (gitignored)
src/content/docs/
  simulador.mdx               # hand-authored (committed)
  playground.mdx              # hand-authored (committed)
  (resto GENERADO, gitignored)
public/
  manifest.webmanifest, sw.js, icon.svg   # PWA (committed)
  search-index.json           # GENERADO (índice del command palette)
  (CONTENT_DIRS GENERADO, gitignored)
.github/workflows/deploy.yml  # CI → Pages
```

---

## 11. Fase 5 — Rediseño visual + nuevas features (2026-07-28)

### 11.1. Rediseño visual (ámbar refinado)

La paleta del sitio se refinó de "startup enérgico" a "cognac sofisticado". Todos
los cambios viven en `theme.css` (tokens) + `<style>` scoped de componentes.

**Tokens cambiados (dark):**
- `--sl-color-accent`: `#f59e0b` → `#d4a056` (menos saturado, más profundo)
- `--sl-color-accent-high`: `#fcd34d` → `#e6c188` (crema cálida)
- `--sl-color-bg`: `#0d0a08` → `#0a0807` (ligeramente más oscuro)
- Hairlines, sombras y superficies ajustadas coherentemente

**Tokens cambiados (light):**
- `--sl-color-accent`: `#b45309` → `#a06a2c` (cognac profundo)
- `--sl-color-text-accent`: `#b45309` → `#8a5a22`
- Sombras más suaves (0.06–0.18 en lugar de 0.08–0.22)

**Eliminación de gradientes decorativos:**
- Hero `aida-grad`: color sólido con peso 800, no degradado
- Quiz title: `var(--sl-color-white)` sólido
- Barra de progreso: `var(--sl-color-accent)` sólido
- CTA primario: sólido con sombra sutil, sin `linear-gradient` ni `translateY`
- Hover de cards: cambio de borde + sombra `md`, sin `translateY(-3px)`

**Microtipografía:**
- `font-feature-settings: 'cv11', 'ss01', 'cv05'` (Inter más legible)
- `font-variant-numeric: tabular-nums` en código y salidas numéricas
- Header glassy: `blur(14px) saturate(120%)` (más sutil)
- `::selection` con 85% de opacidad

**Hardcoded reemplazados por tokens:**
Todos los `#f59e0b`, `#fbbf24`, `#fcd34d`, `#ea580c`, `#0d0a08`, `#e9e3da` en
terminal, playground, logo SVG, `icon.svg`, `manifest.webmanifest` y meta
`theme-color` ahora referencian tokens `--sl-color-*`.

### 11.2. View Transitions (SPA mode)

**Dep nueva:** `astro-vtbot` (maneja edge cases de search y mobile menu que se
rompen con `ClientRouter` puro en Starlight).

**Nuevo override:** `src/components/Head.astro` — wrap de `StarlightHead` con
`VtbotStarlight` que inyecta `ClientRouter`.

**Boot script refactorizado:** `SiteTitle.astro` `<script>` ahora escucha
`astro:page-load` para reinicializar islas tras cada navegación. El `Set booted`
global se eliminó (las islas se reinicializan en cada página).

**Contrato:** las islas deben ser idempotentes — pueden llamarse múltiples
veces sin duplicar estado. Los scripts que mantienen estado global (notes.ts)
escuchan `astro:page-load` internamente para recargar el contexto.

### 11.3. Command Palette (Cmd+K)

**Isla:** `src/scripts/command-palette.ts`
**Índice:** `public/search-index.json` (GENERADO por `build-content.mjs`
`generateSearchIndex()`).

- Atajo: `Cmd+K` / `Ctrl+K` abre overlay
- Búsqueda fuzzy (subsecuencia + scoring por cercanía)
- Navegación con `↑` `↓`, Enter para abrir, Esc para cerrar
- Incluye acciones rápidas: "Exportar progreso", "Importar progreso"
- Usa `window.navigate()` de Astro (view transitions) si disponible
- Se monta en `document.body` (fuera del layout)

**Para añadir entradas al índice:** edita `generateSearchIndex()` en
`scripts/build-content.mjs`.

### 11.4. Badges (sistema de logros)

**Catálogo:** `src/data/badges.ts` — 8 badges: first-step, third-module,
half-modules, all-modules, first-lab, all-labs, first-quiz, perfect-quiz.
**Runtime:** `src/scripts/badges.ts` — evaluación + toast de desbloqueo.
**UI:** `src/components/Badges.astro` — grid en la card de progreso del landing.

**Persistencia:** `aida:badge:<id> = '1'` en localStorage.
**Eventos:** `aida:badges` (dispatched tras evaluar), escucha `aida:progress`
y `aida:quiz`.

**Para añadir un badge:** edita `BADGES` en `src/data/badges.ts`. La función
`check(ctx)` recibe `{done, quizScores, quizTotals, total}`.

### 11.5. Export/Import de progreso

**Isla:** `src/scripts/progress-io.ts`
**UI:** Botones en `ProgressOverview.astro` (clase `.aida-io`).

- Export: descarga `ai-dev-accelerator-progreso-YYYY-MM-DD.json` con
  `{version: 1, exported, done[], quizzes{}, badges[]}`
- Import: lee el JSON, valida `version === 1`, escribe en localStorage,
  dispatcha `aida:progress` y `aida:badges`
- Trigger: `[data-io-export]` / `[data-io-import]` o hash `#export-progress` /
  `#import-progress` (command palette)

### 11.6. Scroll-spy del TOC

**Isla:** `src/scripts/scroll-spy.ts`
- IntersectionObserver sobre `h2`/`h3` del contenido
- Marca el link del TOC correspondiente con `aria-current="true"`
- El styling ya existe en `PageSidebar.astro` (`.rp-toc :global(a[aria-current])`)
- Re-inicializa en `astro:page-load`

### 11.7. Reading progress bar

**Isla:** `src/scripts/reading-bar.ts`
- Barra fina (2px) fija bajo el header
- Se oculta en el landing y páginas sin contenido scrolleable
- Usa `requestAnimationFrame` para updates suaves

### 11.8. Mermaid (diagramas en cheatsheets)

**Isla:** `src/scripts/mermaid.ts`
- Carga Mermaid v11 ESM desde CDN solo si hay bloques `language-mermaid`
- Theme dark con `themeVariables` ámbar del sitio
- Placeholder "Renderizando diagrama…" mientras carga
- Fallback graceful: deja el código visible si falla
- Re-inicializa en `astro:page-load`

**Para usar Mermaid en un cheatsheet:** añade un bloque de código fenced con
`language-mermaid`:
```
\`\`\`mermaid
graph TD
  A[Inicio] --> B{Decisión}
\`\`\`
```

### 11.9. Breadcrumbs

**Componente:** `src/components/Breadcrumbs.astro`
- Se renderiza en `PageTitle.astro` sobre el `<h1>`
- Solo en páginas de contenido (modules, labs, cheatsheets, templates, examples)
- Estructura: `Inicio / [Grupo] / [Título actual]`

### 11.10. Paginación prev/next

**Componente:** `src/components/Pagination.astro`
- Dos cards al pie del contenido
- Usa `Astro.locals.starlightRoute.pagination` de Starlight
- Hover con borde accent + sombra `md`
- Responsive: apila en móvil

### 11.11. Nuevas dependencias

- `astro-vtbot` — view transitions para Starlight (maneja search, mobile menu)
- Mermaid se carga desde CDN (no es dep npm)

### 11.12. Nuevos eventos custom

| Evento | Quien lo dispatcha | Quien lo escucha |
|---|---|---|
| `aida:badges` | `badges.ts` | `Badges.astro` (re-render) |
| `astro:page-load` | Astro ClientRouter | Todas las islas (re-init) |