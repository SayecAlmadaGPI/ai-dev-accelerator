// Catálogo de badges (insignias) y lógica de evaluación.
// Cada badge define una función `check(ctx)` que recibe el contexto de progreso
// del usuario (ítems completados, scores de quizzes) y devuelve true si la
// insignia está ganada. La evaluación es pura: sin efectos secundarios.
// La persistencia del estado "ganado" vive en src/scripts/badges.ts.

export const BADGE_PREFIX = 'aida:badge:';

/** Contexto que recibe cada badge para decidir si está ganada. */
export interface BadgeContext {
  /** Slugs completados (de `listDone()`). */
  done: string[];
  /** Scores de quizzes: slug -> puntaje obtenido. */
  quizScores: Record<string, number>;
  /** Totales de quizzes: slug -> puntaje máximo posible. */
  quizTotals: Record<string, number>;
  /** Módulos con dominio demostrado (bestPct ≥ 80 desde localStorage). */
  masteryCount: number;
  /** Repasos espaciados completados (aida:review:count). */
  reviewCount: number;
  /** Total de ítems trackeables (módulos + labs). */
  total: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  check: (ctx: BadgeContext) => boolean;
}

// Constantes de conteo por grupo (espejan src/data/trackable.json).
const MODULES_TOTAL = 11;
const LABS_TOTAL = 5;

/** Cuenta cuántos slugs completados pertenecen a un grupo. */
function countGroup(done: string[], group: 'modules' | 'labs'): number {
  return done.filter((slug) => slug.startsWith(group + '/')).length;
}

export const BADGES: Badge[] = [
  {
    id: 'first-step',
    name: 'Primer paso',
    description: 'Completa 1 módulo',
    icon: '🎯',
    check: (ctx) => countGroup(ctx.done, 'modules') >= 1,
  },
  {
    id: 'third-module',
    name: 'En marcha',
    description: 'Completa 3 módulos',
    icon: '🚀',
    check: (ctx) => countGroup(ctx.done, 'modules') >= 3,
  },
  {
    id: 'half-modules',
    name: 'Mitad del camino',
    description: 'Completa 6 módulos (de 11)',
    icon: '🧗',
    check: (ctx) => countGroup(ctx.done, 'modules') >= 6,
  },
  {
    id: 'all-modules',
    name: 'Dominio total',
    description: 'Completa los 11 módulos',
    icon: '👑',
    check: (ctx) => countGroup(ctx.done, 'modules') >= MODULES_TOTAL,
  },
  {
    id: 'first-lab',
    name: 'Manos a la obra',
    description: 'Completa 1 lab',
    icon: '🛠️',
    check: (ctx) => countGroup(ctx.done, 'labs') >= 1,
  },
  {
    id: 'all-labs',
    name: 'Cinturón negro',
    description: 'Completa los 5 labs',
    icon: '🥋',
    check: (ctx) => countGroup(ctx.done, 'labs') >= LABS_TOTAL,
  },
  {
    id: 'first-quiz',
    name: 'Primer quiz',
    description: 'Tu primer intento honesto de un quiz',
    icon: '✅',
    check: (ctx) => Object.values(ctx.quizScores).some((s) => s > 0),
  },
  {
    id: 'perfect-quiz',
    name: 'Perfeccionista',
    description: 'Score perfecto en al menos 1 quiz',
    icon: '💯',
    check: (ctx) =>
      Object.entries(ctx.quizScores).some(([slug, score]) => {
        const total = ctx.quizTotals[slug];
        return typeof total === 'number' && total > 0 && score >= total;
      }),
  },
  {
    id: 'mastery-first',
    name: 'Dominio demostrado',
    description: 'Logra ≥80% en el quiz de 1 módulo',
    icon: '🏅',
    check: (ctx) => ctx.masteryCount >= 1,
  },
  {
    id: 'mastery-five',
    name: 'Media maratón',
    description: 'Logra ≥80% en los quizzes de 5 módulos',
    icon: '🏃',
    check: (ctx) => ctx.masteryCount >= 5,
  },
  {
    id: 'mastery-all',
    name: 'El kit completo',
    description: 'Logra ≥80% en los quizzes de los 11 módulos',
    icon: '🎒',
    check: (ctx) => ctx.masteryCount >= MODULES_TOTAL,
  },
  {
    id: 'review-streak',
    name: 'Memoria de hierro',
    description: 'Completa 3 repasos espaciados',
    icon: '🧠',
    check: (ctx) => ctx.reviewCount >= 3,
  },
];

/** Devuelve los IDs de badges ganadas según el contexto. */
export function evaluateBadges(ctx: BadgeContext): string[] {
  return BADGES.filter((b) => b.check(ctx)).map((b) => b.id);
}