/**
 * Unified constants export
 *
 * Re-export from functionally split constant files
 * Used as single source of truth
 */

// Color and visual constants
export * from './colors';

// Default values and initial settings
export * from './defaults';

// Game rules related
export * from './gameRules';

// Layout and UI related
export * from './layout';

// System limits and thresholds
export * from './limits';
// Performance optimization
export * from './performance';
// Storage management
export * from './storage';
// String resources
export * from './strings';
// Tetromino definitions
export * from './tetrominoes';
// Timing and internationalization
export * from './timing';

// Aliases for backward compatibility
import { GAME_TIMING } from './timing';
export const EFFECT_RESET_DELAY = GAME_TIMING.EFFECT_RESET_DELAY; // Alias for backward compatibility
