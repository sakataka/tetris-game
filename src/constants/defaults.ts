/**
 * Default Values and Initial Settings
 *
 * Centralized default values used across components
 */

export const DEFAULT_VALUES = {
  // Audio settings
  VOLUME: 0.5,
  MUTED: false,

  // Effect settings
  EFFECT_INTENSITY: {
    MIN: 0,
    MAX: 2,
    DEFAULT: 1.0,
  },

  // Session settings
  SESSION: {
    ID_SUBSTRING_START: 2,
    ID_SUBSTRING_END: 9,
  },

  // Error handling
  ERROR_LIMITS: {
    MAX_RETRIES: 3,
    MAX_ERROR_HISTORY: 50,
    RECENT_ERROR_COUNT: 5,
  },

  // Audio system
  AUDIO: {
    MAX_RETRIES: 3,
    THROTTLE_MS: 100,
    PRELOAD_PROGRESS_COMPLETE: 100,
  },

  // UI Display
  UI: {
    HIGH_SCORE_MAX_DISPLAY: 10,
    ANIMATION_LAST_TICK_INITIAL: 0 as const,
    RETRY_COUNT_INITIAL: 0 as const,
  },

  // Game settings
  GAME: {
    LEVEL: 1,
    SCORE: 0,
    LINES: 0,
    SHOW_GHOST: true,
    SHOW_PARTICLES: true,
  },
} as const;

export const INITIAL_STATES = {
  GAME_PAUSED: false,
  GAME_OVER: false,
  SETTINGS_OPEN: false,
  MUTED: false,
} as const;
