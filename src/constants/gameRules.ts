/**
 * Game rules related constants
 *
 * Configuration values for score calculation, level progression, and game balance
 *
 * @deprecated Use gameConfig.ts for new implementations. This file provides
 * backward compatibility for existing code.
 */

// Import timing constants
import { GAME_TIMING } from './timing';

// Re-export timing constants
export { GAME_TIMING } from './timing';

// Re-export individual timing values for compatibility
export const INITIAL_DROP_TIME = GAME_TIMING.INITIAL_DROP_TIME;

// Re-export from new configuration system
export {
  SCORES,
  type ScoreType,
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
