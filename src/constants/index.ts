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
export const EFFECT_RESET_DELAY = 300; // Alias for EFFECTS.RESET_DELAY
