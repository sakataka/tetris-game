/**
 * Unified constants export
 *
 * Re-export from functionally split constant files
 * Used as single source of truth
 */

// Audio configuration system (new)
export * from './audioConfig';
// Default values and initial settings
export * from './defaults';
// Game configuration system (new)
export * from './gameConfig';
// Game rules related (legacy compatibility)
export * from './gameRules';
// Layout and UI related (legacy compatibility)
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
// UI configuration system (new)
export * from './uiConfig';
// Validation system for all configurations
export {
  formatValidationResult,
  isValidAudioConfig,
  isValidGameConfig,
  isValidUIConfig,
  type ValidationError,
  type ValidationResult,
  type ValidationWarning,
  validateAllConfigs,
  validateAudioConfig as validateAudioConfigV2,
  validateGameConfig as validateGameConfigV2,
  validateUIConfig as validateUIConfigV2,
} from './validation';

// Aliases for backward compatibility
import { GAME_TIMING } from './timing';
export const EFFECT_RESET_DELAY = GAME_TIMING.EFFECT_RESET_DELAY; // Alias for backward compatibility
