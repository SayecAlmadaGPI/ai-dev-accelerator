// Estado de badges (insignias) + notificaciones toast.
// Persistencia por navegador en localStorage con prefijo `aida:badge:`.
// La evaluación se dispara al cambiar el progreso (aida:progress),
// al finalizar un quiz (aida:quiz) y en cada navegación (astro:page-load).
// El evento `aida:badges` notifica a la UI (Badges.astro) para re-renderizar.

import { listDone } from './progress';
import {
  BADGES,
  BADGE_PREFIX,
  evaluateBadges,
  type BadgeContext,
} from '../data/badges';
import { quizzes } from '../data/quizzes';

const QUIZ_PREFIX = 'aida:quiz:';

/** Lee los IDs de badges ya ganadas desde localStorage. */
export function getEarnedBadges(): string[] {
  if (typeof localStorage === 'undefined') return [];
  const out: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith(BADGE_PREFIX)) out.push(k.slice(BADGE_PREFIX.length));
  }
  return out;
}

/** ¿La badge ya está ganada? */
export function isBadgeEarned(id: string): boolean {
  if (typeof localStorage === 'undefined') return false;
  return localStorage.getItem(BADGE_PREFIX + id) === '1';
}

/**
 * Marca una badge como ganada si no lo estaba ya.
 * Devuelve true si fue *nueva* (acabada de guardar), false si ya existía.
 */
export function markBadgeEarned(id: string): boolean {
  if (typeof localStorage === 'undefined') return false;
  if (localStorage.getItem(BADGE_PREFIX + id) === '1') return false;
  localStorage.setItem(BADGE_PREFIX + id, '1');
  return true;
}

/** Lee los scores de quizzes guardados en localStorage. */
function readQuizScores(): Record<string, number> {
  if (typeof localStorage === 'undefined') return {};
  const out: Record<string, number> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith(QUIZ_PREFIX)) {
      const slug = k.slice(QUIZ_PREFIX.length);
      const val = Number(localStorage.getItem(k));
      if (!Number.isNaN(val)) out[slug] = val;
    }
  }
  return out;
}

/**
 * Lee los totales de quizzes, derivados de los datos autorados
 * (importados de ../data/quizzes). Si el runtime publica
 * `window.__AIDA_QUIZ_TOTALS__`, tiene prioridad; si no, se usa
 * el mapa derivado (slug → questions.length).
 */
function readQuizTotals(): Record<string, number> {
  const derived: Record<string, number> = {};
  for (const quiz of quizzes) derived[quiz.slug] = quiz.questions.length;
  if (typeof window === 'undefined') return derived;
  const w = window as unknown as { __AIDA_QUIZ_TOTALS__?: Record<string, number> };
  return w.__AIDA_QUIZ_TOTALS__ ?? derived;
}

/** Muestra un toast efímero anunciando una badge recién ganada. */
function showToast(badgeId: string): void {
  if (typeof document === 'undefined') return;
  const badge = BADGES.find((b) => b.id === badgeId);
  if (!badge) return;

  const toast = document.createElement('div');
  toast.className = 'aida-toast';
  toast.setAttribute('role', 'status');
  toast.innerHTML =
    `<span class="aida-toast__icon">${badge.icon}</span>` +
    `<span>¡Badge desbloqueada: ${badge.name}!</span>`;
  document.body.appendChild(toast);

  // Forzar reflow para que la transición dispare.
  requestAnimationFrame(() => {
    toast.classList.add('is-visible');
  });

  setTimeout(() => {
    toast.classList.remove('is-visible');
    setTimeout(() => toast.remove(), 400);
  }, 3500);
}

/**
 * Evalúa todas las badges contra el estado actual, marca las nuevas
 * ganadas, muestra un toast por cada una nueva y notifica a la UI.
 */
export function evaluateAndNotify(): void {
  if (typeof window === 'undefined') return;

  const done = listDone();
  const ctx: BadgeContext = {
    done,
    quizScores: readQuizScores(),
    quizTotals: readQuizTotals(),
    total: done.length,
  };

  const earned = evaluateBadges(ctx);
  for (const id of earned) {
    if (markBadgeEarned(id)) showToast(id);
  }

  window.dispatchEvent(new CustomEvent('aida:badges'));
}

// Escucha cambios de progreso y quizzes para re-evaluar.
if (typeof window !== 'undefined') {
  window.addEventListener('aida:progress', evaluateAndNotify);
  window.addEventListener('aida:quiz', evaluateAndNotify);
  // Soporte para view transitions de Astro.
  document.addEventListener('astro:page-load', evaluateAndNotify);
}