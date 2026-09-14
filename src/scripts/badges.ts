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
const HIST_PREFIX = 'aida:quizhist:';

/** Repasos espaciados completados; lo incrementa quiz.ts por bloque terminado. */
export const REVIEW_COUNT_KEY = 'aida:review:count';

/** Mismo umbral de dominio que el motor del quiz (src/scripts/quiz.ts). */
const MASTERY_PCT = 80;

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

/**
 * Mejor pct de dominio del módulo. Fuente de verdad: el historial del
 * motor v2 (aida:quizhist:<slug>). Fallback legacy (usuarios v1): sin
 * historial, se aproxima desde el mejor score crudo sobre el banco.
 */
export function readBestPct(slug: string, total: number): number {
  if (typeof localStorage === 'undefined') return 0;
  const raw = localStorage.getItem(HIST_PREFIX + slug);
  if (raw) {
    try {
      const hist = JSON.parse(raw) as { bestPct?: unknown };
      if (typeof hist.bestPct === 'number') return hist.bestPct;
    } catch {
      // JSON corrupto: cae al fallback legacy.
    }
  }
  const score = Number(localStorage.getItem(QUIZ_PREFIX + slug) || 0);
  return total > 0 ? Math.round((score / total) * 100) : 0;
}

/** Cuántos módulos (de los 11 con quiz) tienen dominio demostrado (≥80%). */
export function readMasteryCount(): number {
  if (typeof localStorage === 'undefined') return 0;
  let count = 0;
  for (const quiz of quizzes) {
    if (readBestPct(quiz.slug, quiz.questions.length) >= MASTERY_PCT) count++;
  }
  return count;
}

/** Repasos espaciados completados (aida:review:count). */
function readReviewCount(): number {
  if (typeof localStorage === 'undefined') return 0;
  const n = Number(localStorage.getItem(REVIEW_COUNT_KEY) || 0);
  return Number.isFinite(n) && n > 0 ? n : 0;
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
    masteryCount: readMasteryCount(),
    reviewCount: readReviewCount(),
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