/**
 * Unified constants export
 *
 * Re-export from functionally split constant files
 * Used as single source of truth
 */

// Game rules related
export * from './gameRules';

// Layout and UI related
export * from './layout';

// Tetromino definitions
export * from './tetrominoes';

// Performance optimization
export * from './performance';

// Storage management
export * from './storage';

// Timing and internationalization
export * from './timing';

// String resources
export * from './strings';

// Aliases for backward compatibility
export const EFFECT_RESET_DELAY = 300; // EFFECTS.RESET_DELAY へのエイリアス
