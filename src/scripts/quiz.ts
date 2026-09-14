// Isla vanilla de quiz (Fase 4a → motor v2 en F2). Se monta en cada
// <div data-quiz-mount data-slug="..."> inyectado por build-content.mjs al
// final de cada módulo. Patrón Fase 3: query [data-*], render, persistir en
// localStorage, dispatchar evento aida:quiz en window. Sin React.
//
// Motor v2 (F2):
//   - Muestreo por intento: se baraja TODO el banco (Fisher-Yates) y se toma
//     una muestra de SAMPLE preguntas; cada reintento remuestrea.
//   - Umbral de dominio (MASTERY_PCT) con correctivos por ref de sección.
//   - Historial de intentos por módulo: aida:quizhist:<slug> (JSON).
//   - Repaso espaciado (interleaving): al montar el quiz de un módulo, los
//     módulos previos vencidos por intervalo (7d/3d/1d según último pct)
//     entran en un details colapsable ANTES del quiz. Sin scheduler externo:
//     el "vencimiento" se evalúa en cada montaje de página.
// Multi-instancia: cada mount tiene su propio estado encapsulado.

import { quizBySlug, quizzes, type Quiz, type QuizQuestion } from '../data/quizzes';

// --- Constantes del motor ----------------------------------------------------

/** Preguntas por intento: se baraja todo el banco y se toma esta muestra. */
const SAMPLE = 5;

/**
 * Umbral de dominio del módulo: con pct >= MASTERY_PCT el veredicto es
 * "Dominio demostrado" y el intervalo de repaso espaciado sube a 7 días.
 * Los textos del quiz se construyen desde esta constante (no hardcodear 80).
 */
const MASTERY_PCT = 80;

/** Máximo de módulos previos vencidos que entran al repaso espaciado. */
const REVIEW_MODULES = 2;

/** Preguntas por módulo en el repaso espaciado. */
const REVIEW_QUESTIONS = 2;

/** Milisegundos de un día (base de los intervalos de repaso 7d/3d/1d). */
const DAY_MS = 86_400_000;

// Mejor score histórico por slug (número de correctas del mejor intento).
// Compat crítica: lo leen ProgressRing y badges — NO cambiar la semántica.
const PREFIX = 'aida:quiz:';
// Historial v2 por slug: JSON QuizHistory.
const HIST_PREFIX = 'aida:quizhist:';
// Repasos espaciados completados: +1 por bloque de repaso terminado
// (no por pregunta). Lo leen los badges (review-streak) y la UI.
const REVIEW_COUNT_KEY = 'aida:review:count';
const EVENT = 'aida:quiz';

interface QuizState {
  idx: number;
  selected: number | null;
  answered: boolean;
  score: number;
}

/** Historial de intentos por módulo (aida:quizhist:<slug>). */
interface QuizHistory {
  attempts: number;
  last: number; // epoch ms del último intento
  lastPct: number; // pct del último intento (el repaso no lo baja)
  best: number; // epoch ms del mejor intento
  bestPct: number; // pct del mejor intento (cuya fecha vive en `best`)
}

/** Módulo previo vencido que entra al repaso espaciado. */
interface ReviewModule {
  quiz: Quiz;
  last: number; // epoch ms del último intento registrado
}

export function initQuizzes(): void {
  if (typeof document === 'undefined') return;
  document
    .querySelectorAll<HTMLElement>('[data-quiz-mount]')
    .forEach((mount) => {
      const slug = mount.dataset.slug || '';
      const quiz = quizBySlug[slug];
      if (!quiz) {
        mount.hidden = true;
        return;
      }
      renderQuiz(mount, quiz);
    });
}

function renderQuiz(host: HTMLElement, quiz: Quiz): void {
  host.classList.add('aida-quiz');

  // Repaso espaciado: solo módulos previos con algún intento registrado.
  // Primera visita total (cero historial) → cero bloques de repaso.
  const modIdx = quizzes.findIndex((q) => q.slug === quiz.slug);
  const review = modIdx > 0 ? collectReview(modIdx) : [];
  const sampleLen = Math.min(SAMPLE, quiz.questions.length);

  host.innerHTML = `
    ${renderReview(review)}
    <div class="aida-quiz__head">
      <span class="aida-quiz__kicker">Comprobación</span>
      <h2 class="aida-quiz__title">Quiz · muestra de ${sampleLen} pregunta${
        sampleLen === 1 ? '' : 's'
      } (banco: ${quiz.questions.length})</h2>
      <p class="aida-quiz__meta"></p>
    </div>
    <div class="aida-quiz__body"></div>
    <div class="aida-quiz__foot"></div>`;

  if (review.length) initReviewFlow(host, review);

  const body = host.querySelector<HTMLElement>('.aida-quiz__body')!;
  const foot = host.querySelector<HTMLElement>('.aida-quiz__foot')!;
  const meta = host.querySelector<HTMLElement>('.aida-quiz__meta')!;

  runFlow(
    { body, foot, meta },
    () => sampleQuestions(quiz.questions, SAMPLE),
    'Reintentar con nuevas preguntas',
    (score, total, failed) => {
      const pct = Math.round((score / total) * 100);
      recordAttempt(quiz.slug, score, pct, false);
      const mastery = pct >= MASTERY_PCT;
      window.dispatchEvent(
        new CustomEvent(EVENT, {
          detail: { slug: quiz.slug, score, total, pct, mastery, review: false },
        }),
      );

      // Correctivo: refs únicos y ordenados de las preguntas falladas.
      // (Las preguntas del banco v1 traen ref 'undefined' → se omiten.)
      const refs = [
        ...new Set(
          failed
            .map((q) => q.ref)
            .filter((r): r is string => Boolean(r) && r !== 'undefined'),
        ),
      ].sort((a, b) => a.localeCompare(b, 'es', { numeric: true }));

      const bestScore = Number(localStorage.getItem(PREFIX + quiz.slug) || 0);
      body.innerHTML = `
      <div class="aida-quiz__result">
        <div class="aida-quiz__score">${score}<span>/${total}</span></div>
        <p class="aida-quiz__verdict">${
          mastery
            ? `<span class="aida-quiz__mastery">✓ Dominio demostrado (≥${MASTERY_PCT}%)</span>`
            : `Aún sin dominio (umbral ${MASTERY_PCT}%)`
        }</p>
        ${
          !mastery && refs.length
            ? `<p class="aida-quiz__remedy">Revisa antes de reintentar: ${refs
                .map((r) => `<code>${esc(r)}</code>`)
                .join(', ')}</p>`
            : ''
        }
        <p class="aida-quiz__best">Mejor: ${bestScore} / ${total}</p>
      </div>`;
    },
  );
}

/**
 * Flujo del bloque de repaso: intercala preguntas de hasta 2 módulos previos
 * vencidos. Al terminar registra un intento (no penaliza lastPct) por módulo
 * repasado y muestra el desglose por módulo.
 */
function initReviewFlow(host: HTMLElement, review: ReviewModule[]): void {
  const body = host.querySelector<HTMLElement>('.aida-quiz__review-body')!;
  const foot = host.querySelector<HTMLElement>('.aida-quiz__review-foot')!;
  const meta = host.querySelector<HTMLElement>('.aida-quiz__review-count')!;

  // Pregunta → módulo al que pertenece (por identidad de objeto).
  let ownerOf = new Map<QuizQuestion, ReviewModule>();
  const fetchReview = (): QuizQuestion[] => {
    ownerOf = new Map();
    const pools = review.map((r) => sampleQuestions(r.quiz.questions, REVIEW_QUESTIONS));
    const qs: QuizQuestion[] = [];
    const max = Math.max(...pools.map((p) => p.length));
    for (let i = 0; i < max; i++) {
      pools.forEach((pool, m) => {
        const q = pool[i];
        if (q) {
          ownerOf.set(q, review[m]);
          qs.push(q);
        }
      });
    }
    return qs;
  };

  runFlow(
    { body, foot, meta },
    fetchReview,
    'Reintentar repaso',
    (score, total, failed) => {
      // Un bloque de repaso terminado = un repaso completado (se cuenta
      // aquí, no por pregunta). Se escribe antes de los eventos aida:quiz
      // para que la re-evaluación de badges ya lo vea.
      const prevReviews = Number(localStorage.getItem(REVIEW_COUNT_KEY) || 0) || 0;
      localStorage.setItem(REVIEW_COUNT_KEY, String(prevReviews + 1));
      const totalsBySlug = new Map<string, number>();
      ownerOf.forEach((r) => {
        totalsBySlug.set(r.quiz.slug, (totalsBySlug.get(r.quiz.slug) || 0) + 1);
      });
      const wrongBySlug = new Map<string, number>();
      for (const q of failed) {
        const r = ownerOf.get(q);
        if (r) wrongBySlug.set(r.quiz.slug, (wrongBySlug.get(r.quiz.slug) || 0) + 1);
      }

      const lines = review.map((r) => {
        const t = totalsBySlug.get(r.quiz.slug) || 0;
        const c = t - (wrongBySlug.get(r.quiz.slug) || 0);
        const pct = t > 0 ? Math.round((c / t) * 100) : 0;
        const mastery = pct >= MASTERY_PCT;
        recordAttempt(r.quiz.slug, c, pct, true);
        window.dispatchEvent(
          new CustomEvent(EVENT, {
            detail: { slug: r.quiz.slug, score: c, total: t, pct, mastery, review: true },
          }),
        );
        return `<p class="aida-quiz__review-line"><strong>${esc(
          moduleLabel(r.quiz.slug),
        )}</strong> · ${c}/${t}${
          mastery ? ` <span class="aida-quiz__mastery">✓ Dominio demostrado</span>` : ''
        }</p>`;
      });

      body.innerHTML = `
      <div class="aida-quiz__result">
        <div class="aida-quiz__score">${score}<span>/${total}</span></div>
        ${lines.join('')}
      </div>`;
    },
  );
}

interface FlowUI {
  body: HTMLElement;
  foot: HTMLElement;
  meta: HTMLElement;
}

let flowSeq = 0;

/**
 * Motor de preguntas compartido por el quiz principal y el repaso: render
 * secuencial (radios + feedback con explain) y reintento que remuestrea.
 * onFinish registra/pinta el resultado: recibe (correctas, total, falladas).
 */
function runFlow(
  ui: FlowUI,
  fetchQuestions: () => QuizQuestion[],
  retryLabel: string,
  onFinish: (score: number, total: number, failed: QuizQuestion[]) => void,
): void {
  const id = `aida-quiz-${++flowSeq}`;
  let questions: QuizQuestion[] = [];
  const state: QuizState = { idx: 0, selected: null, answered: false, score: 0 };
  const failed: QuizQuestion[] = [];

  const start = () => {
    questions = fetchQuestions();
    state.idx = 0;
    state.selected = null;
    state.answered = false;
    state.score = 0;
    failed.length = 0;
    if (!questions.length) {
      ui.body.innerHTML = '';
      ui.foot.innerHTML = '';
      return;
    }
    renderQuestion();
  };

  const renderQuestion = () => {
    const q = questions[state.idx];
    state.selected = null;
    state.answered = false;
    ui.meta.textContent = `Pregunta ${state.idx + 1} de ${questions.length}`;
    ui.body.innerHTML = `
      <p class="aida-quiz__q">${esc(q.q)}</p>
      <div class="aida-quiz__opts" role="radiogroup">
        ${q.options
          .map(
            (o, i) => `
          <label class="aida-quiz__opt">
            <input type="radio" name="${id}-${state.idx}" value="${i}" />
            <span class="aida-quiz__opt-mark"></span>
            <span class="aida-quiz__opt-text">${esc(o)}</span>
          </label>`,
          )
          .join('')}
      </div>`;
    ui.body.querySelectorAll<HTMLElement>('.aida-quiz__opt').forEach((label, i) => {
      label.addEventListener('click', () => {
        if (state.answered) return;
        state.selected = i;
        ui.body.querySelectorAll('.aida-quiz__opt').forEach((l) =>
          l.classList.remove('is-selected'),
        );
        label.classList.add('is-selected');
        (label.querySelector('input') as HTMLInputElement).checked = true;
      });
    });
    ui.foot.innerHTML = `<button class="aida-quiz__btn sl-link-button primary" type="button">Comprobar</button>`;
    ui.foot.querySelector('button')!.addEventListener('click', check);
  };

  const check = () => {
    if (state.selected === null || state.answered) return;
    state.answered = true;
    const q = questions[state.idx];
    const correct = state.selected === q.answer;
    if (correct) state.score++;
    else failed.push(q);
    ui.body.querySelectorAll<HTMLElement>('.aida-quiz__opt').forEach((label, i) => {
      label.classList.remove('is-selected');
      if (i === q.answer) label.classList.add('is-correct');
      else if (i === state.selected) label.classList.add('is-wrong');
    });
    const fb = document.createElement('div');
    fb.className = 'aida-quiz__fb ' + (correct ? 'is-ok' : 'is-no');
    fb.innerHTML = `<strong>${correct ? '✓ Correcto' : '✗ Incorrecto'}</strong>${
      q.explain ? `<p>${esc(q.explain)}</p>` : ''
    }`;
    ui.body.appendChild(fb);
    const isLast = state.idx === questions.length - 1;
    ui.foot.innerHTML = `<button class="aida-quiz__btn sl-link-button primary" type="button">${
      isLast ? 'Ver resultado' : 'Siguiente'
    }</button>`;
    ui.foot.querySelector('button')!.addEventListener('click', () => {
      if (isLast) showResult();
      else {
        state.idx++;
        renderQuestion();
      }
    });
  };

  const showResult = () => {
    onFinish(state.score, questions.length, failed.slice());
    ui.meta.textContent = '';
    ui.foot.innerHTML = `<button class="aida-quiz__btn sl-link-button secondary" type="button">${retryLabel}</button>`;
    ui.foot.querySelector('button')!.addEventListener('click', start);
  };

  start();
}

// --- Persistencia: historial y mejor score -----------------------------------

/**
 * Lee el historial del módulo. Degradación legacy: si no hay aida:quizhist
 * pero existe aida:quiz (v1), cuenta como intento registrado con last=0
 * (siempre vencido → entra al repaso).
 */
function readHistory(slug: string): QuizHistory | null {
  const raw = localStorage.getItem(HIST_PREFIX + slug);
  if (raw) {
    try {
      const h = JSON.parse(raw) as Partial<QuizHistory>;
      if (typeof h.attempts === 'number' && h.attempts > 0 && typeof h.last === 'number') {
        return {
          attempts: h.attempts,
          last: h.last,
          lastPct: typeof h.lastPct === 'number' ? h.lastPct : 0,
          best: typeof h.best === 'number' ? h.best : 0,
          bestPct: typeof h.bestPct === 'number' ? h.bestPct : 0,
        };
      }
    } catch {
      // JSON corrupto: cae al fallback legacy.
    }
  }
  if (localStorage.getItem(PREFIX + slug) !== null) {
    return { attempts: 1, last: 0, lastPct: 0, best: 0, bestPct: 0 };
  }
  return null;
}

/**
 * Registra un intento en el historial y, si supera el mejor, el mejor score
 * en aida:quiz:<slug> (compat con ProgressRing/badges, nunca hacia abajo).
 * El repaso no penaliza: lastPct solo sube.
 */
function recordAttempt(slug: string, score: number, pct: number, isReview: boolean): void {
  const now = Date.now();
  const hist = readHistory(slug) ?? { attempts: 0, last: 0, lastPct: 0, best: 0, bestPct: 0 };
  hist.attempts++;
  hist.last = now;
  if (!isReview || pct > hist.lastPct) hist.lastPct = pct;
  if (pct >= hist.bestPct) {
    hist.bestPct = pct;
    hist.best = now;
  }
  localStorage.setItem(HIST_PREFIX + slug, JSON.stringify(hist));

  const prevBest = Number(localStorage.getItem(PREFIX + slug) || 0);
  if (score > prevBest) localStorage.setItem(PREFIX + slug, String(score));
}


// --- Repaso espaciado --------------------------------------------------------

/** Intervalo en días según el pct del ÚLTIMO intento: ≥80 → 7d, 60–79 → 3d, <60 → 1d. */
function intervalDays(pct: number): number {
  return pct >= MASTERY_PCT ? 7 : pct >= 60 ? 3 : 1;
}

/**
 * Módulos previos vencidos (índices 0..modIdx-1, orden M0..M10), los más
 * antiguos primero, hasta REVIEW_MODULES. Solo si tienen intento registrado.
 */
function collectReview(modIdx: number): ReviewModule[] {
  const now = Date.now();
  const due: ReviewModule[] = [];
  for (let i = 0; i < modIdx; i++) {
    const q = quizzes[i];
    const hist = readHistory(q.slug);
    if (!hist) continue;
    if (now - hist.last > intervalDays(hist.lastPct) * DAY_MS) {
      due.push({ quiz: q, last: hist.last });
    }
  }
  due.sort((a, b) => a.last - b.last);
  return due.slice(0, REVIEW_MODULES);
}

/** 'modules/04-handoffs' → 'M4' (etiqueta corta para repaso y resultados). */
function moduleLabel(slug: string): string {
  const m = slug.match(/(\d+)-/);
  return m ? `M${Number(m[1])}` : slug;
}

/** Cuánto hace el último intento, en texto (repaso). Legacy (last=0) degradado. */
function daysAgo(last: number): string {
  if (!last) return 'sin registro reciente';
  const days = Math.floor((Date.now() - last) / DAY_MS);
  if (days <= 0) return 'hoy';
  if (days === 1) return 'ayer';
  return `hace ${days} días`;
}

/** HTML del details colapsable de repaso (vacío si no hay módulos vencidos). */
function renderReview(review: ReviewModule[]): string {
  if (!review.length) return '';
  const n = review.reduce(
    (acc, r) => acc + Math.min(REVIEW_QUESTIONS, r.quiz.questions.length),
    0,
  );
  const labels = review.map((r) => moduleLabel(r.quiz.slug)).join(', ');
  const when = review
    .map((r) => `${moduleLabel(r.quiz.slug)}: ${daysAgo(r.last)}`)
    .join(' · ');
  return `
    <details class="aida-quiz__review">
      <summary>Repaso espaciado — ${n} ${n === 1 ? 'pregunta' : 'preguntas'} de ${esc(
        labels,
      )}</summary>
      <p class="aida-quiz__review-when">Última vez — ${esc(when)}</p>
      <p class="aida-quiz__review-count"></p>
      <div class="aida-quiz__review-body"></div>
      <div class="aida-quiz__review-foot"></div>
    </details>`;
}

// --- Utilidades ---------------------------------------------------------------

/** Fisher-Yates: baraja una copia del array (no muta el banco). */
function shuffle<T>(items: T[]): T[] {
  const arr = items.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Muestra de n preguntas (o todas si el banco es menor), barajada. */
function sampleQuestions<T>(items: T[], n: number): T[] {
  return shuffle(items).slice(0, Math.min(n, items.length));
}

function esc(s: string): string {
  return s.replace(
    /[&<>"]/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string),
  );
}