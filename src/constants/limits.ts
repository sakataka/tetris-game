/**
 * System Limits and Thresholds
 *
 * Performance limits, validation thresholds, and boundary values
 */

export const SYSTEM_PERFORMANCE_LIMITS = {
  // FPS and frame management
  FPS_HISTORY_SIZE: 10,
  PERFORMANCE_THRESHOLD_MS: 50,
  MIN_FPS: 30,
  MAX_FPS: 120,

  // FPS adjustment ratios
  FPS_ADJUSTMENT: {
    INCREASE_RATIO: 1.1,
    DECREASE_RATIO: 0.95,
  },

  // Memory and caching
  MAX_CACHE_SIZE: 100,
  CACHE_CLEANUP_THRESHOLD: 80,
} as const;

export const PARTICLE_LIMITS = {
  POOL_SIZE: 150,
  PRELOAD_COUNT: 50,
  MAX_PARTICLES_PER_FRAME: 100,

  // Position variance
  POSITION_VARIANCE_X: 20,
  POSITION_VARIANCE_Y: 10,
} as const;

export const SYSTEM_BREAKPOINTS = {
  MOBILE_WIDTH: 768,
  TABLET_WIDTH: 1024,
  DESKTOP_WIDTH: 1280,

  // Touch detection
  MIN_TOUCH_POINTS: 0,
  MAX_TOUCH_POINTS: 10,
} as const;

export const VALIDATION_LIMITS = {
  // String lengths
  MAX_USERNAME_LENGTH: 50,
  MAX_ERROR_MESSAGE_LENGTH: 500,

  // Numeric ranges
  MIN_VOLUME: 0,
  MAX_VOLUME: 1,
  MIN_LEVEL: 1,
  MAX_LEVEL: 99,

  // Time ranges (milliseconds)
  MIN_TIMEOUT: 100,
  MAX_TIMEOUT: 30000,
} as const;
