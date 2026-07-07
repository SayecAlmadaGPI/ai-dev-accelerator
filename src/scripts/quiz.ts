// Isla vanilla de quiz (Fase 4a). Se monta en cada <div data-quiz-mount
// data-slug="..."> inyectado por build-content.mjs al final de cada módulo.
// Patrón Fase 3: query [data-*], render, persistir en localStorage, dispatchar
// evento aida:quiz en window. Sin React.

import { quizBySlug, type Quiz } from '../data/quizzes';

const PREFIX = 'aida:quiz:';
const EVENT = 'aida:quiz';

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

interface QuizState {
  idx: number;
  selected: number | null;
  answered: boolean;
  score: number;
}

function renderQuiz(host: HTMLElement, quiz: Quiz): void {
  host.classList.add('aida-quiz');

  const best = Number(localStorage.getItem(PREFIX + quiz.slug) || 0);
  const state: QuizState = { idx: 0, selected: null, answered: false, score: 0 };

  host.innerHTML = `
    <div class="aida-quiz__head">
      <span class="aida-quiz__kicker">Comprobación</span>
      <h2 class="aida-quiz__title">Comprueba lo aprendido</h2>
      <p class="aida-quiz__meta"></p>
    </div>
    <div class="aida-quiz__body"></div>
    <div class="aida-quiz__foot"></div>`;

  const body = host.querySelector<HTMLElement>('.aida-quiz__body')!;
  const foot = host.querySelector<HTMLElement>('.aida-quiz__foot')!;
  const meta = host.querySelector<HTMLElement>('.aida-quiz__meta')!;

  const renderQuestion = () => {
    const q = quiz.questions[state.idx];
    state.selected = null;
    state.answered = false;
    meta.textContent = `Pregunta ${state.idx + 1} de ${quiz.questions.length}`;
    body.innerHTML = `
      <p class="aida-quiz__q">${esc(q.q)}</p>
      <div class="aida-quiz__opts" role="radiogroup">
        ${q.options
          .map(
            (o, i) => `
          <label class="aida-quiz__opt">
            <input type="radio" name="aida-quiz-${state.idx}" value="${i}" />
            <span class="aida-quiz__opt-mark"></span>
            <span class="aida-quiz__opt-text">${esc(o)}</span>
          </label>`,
          )
          .join('')}
      </div>`;
    body.querySelectorAll<HTMLElement>('.aida-quiz__opt').forEach((label, i) => {
      label.addEventListener('click', () => {
        if (state.answered) return;
        state.selected = i;
        body.querySelectorAll('.aida-quiz__opt').forEach((l) =>
          l.classList.remove('is-selected'),
        );
        label.classList.add('is-selected');
        (label.querySelector('input') as HTMLInputElement).checked = true;
      });
    });
    foot.innerHTML = `<button class="aida-quiz__btn sl-link-button primary" type="button">Comprobar</button>`;
    foot.querySelector('button')!.addEventListener('click', check);
  };

  const check = () => {
    if (state.selected === null || state.answered) return;
    state.answered = true;
    const q = quiz.questions[state.idx];
    const correct = state.selected === q.answer;
    if (correct) state.score++;
    body.querySelectorAll<HTMLElement>('.aida-quiz__opt').forEach((label, i) => {
      label.classList.remove('is-selected');
      if (i === q.answer) label.classList.add('is-correct');
      else if (i === state.selected) label.classList.add('is-wrong');
    });
    const fb = document.createElement('div');
    fb.className = 'aida-quiz__fb ' + (correct ? 'is-ok' : 'is-no');
    fb.innerHTML = `<strong>${correct ? '✓ Correcto' : '✗ Incorrecto'}</strong>${
      q.explain ? `<p>${esc(q.explain)}</p>` : ''
    }`;
    body.appendChild(fb);
    const isLast = state.idx === quiz.questions.length - 1;
    foot.innerHTML = `<button class="aida-quiz__btn sl-link-button primary" type="button">${
      isLast ? 'Ver resultado' : 'Siguiente'
    }</button>`;
    foot.querySelector('button')!.addEventListener('click', () => {
      if (isLast) showResult();
      else {
        state.idx++;
        renderQuestion();
      }
    });
  };

  const showResult = () => {
    const total = quiz.questions.length;
    const prevBest = Number(localStorage.getItem(PREFIX + quiz.slug) || 0);
    if (state.score > prevBest) {
      localStorage.setItem(PREFIX + quiz.slug, String(state.score));
      window.dispatchEvent(
        new CustomEvent(EVENT, {
          detail: { slug: quiz.slug, score: state.score, total },
        }),
      );
    }
    const verdict =
      state.score === total
        ? 'Todas correctas. Dominas este módulo.'
        : state.score === 0
          ? 'Repasa el módulo y reintenta.'
          : 'Bien encaminado. Revisa las que fallaste y reintenta.';
    body.innerHTML = `
      <div class="aida-quiz__result">
        <div class="aida-quiz__score">${state.score}<span>/${total}</span></div>
        <p class="aida-quiz__verdict">${verdict}</p>
        <p class="aida-quiz__best">Mejor: ${Math.max(state.score, prevBest)} / ${total}</p>
      </div>`;
    foot.innerHTML = `<button class="aida-quiz__btn sl-link-button secondary" type="button">Reintentar</button>`;
    foot.querySelector('button')!.addEventListener('click', () => {
      state.idx = 0;
      state.score = 0;
      renderQuestion();
    });
    meta.textContent = '';
  };

  renderQuestion();
}

function esc(s: string): string {
  return s.replace(
    /[&<>"]/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string),
  );
}