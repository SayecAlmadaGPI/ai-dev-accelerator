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
    description: 'Aprueba 1 quiz (score > 0)',
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
];

/** Devuelve los IDs de badges ganadas según el contexto. */
export function evaluateBadges(ctx: BadgeContext): string[] {
  return BADGES.filter((b) => b.check(ctx)).map((b) => b.id);
}