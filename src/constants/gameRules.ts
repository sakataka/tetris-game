/**
 * Game rules related constants
 *
 * Configuration values for score calculation, level progression, and game balance
 *
 * @deprecated Use gameConfig.ts for new implementations. This file provides
 * backward compatibility for existing code.
 */

// Re-export from new configuration system
export {
  DROP_TIME_MULTIPLIER,
  GAME_PHYSICS,
  INITIAL_DROP_TIME,
  LEVEL_UP_LINES,
  MAX_HIGH_SCORES,
  MAX_LEVEL,
  MAX_SCORE,
  MIN_LEVEL,
  MIN_SCORE,
  PARTICLE_SYSTEM,
  PREVIEW_PIECES,
  SCORES,
  type ScoreType,
  SESSION_TIMEOUT,
  VALIDATION,
} from './gameConfig';

// Legacy compatibility constants with updated naming
export const SCORES_LEGACY = {
  SINGLE: 100,
  DOUBLE: 300,
  TRIPLE: 500,
  TETRIS: 800,
  HARD_DROP_BONUS: 2,
  SOFT_DROP_BONUS: 1,
} as const;
