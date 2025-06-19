/**
 * Timing and animation related constants
 *
 * Frame rate, animation duration, and timer settings
 */

// Internationalization settings
export const I18N_CONFIG = {
  DEFAULT_LOCALE: 'en',
  SUPPORTED_LOCALES: ['en', 'ja', 'zh', 'ko'] as const,
  FALLBACK_LOCALE: 'en',
  DATE_FORMAT: {
    ja: 'YYYY年MM月DD日',
    en: 'MM/DD/YYYY',
    zh: 'YYYY年MM月DD日',
    ko: 'YYYY년 MM월 DD일',
  },
} as const;

// Frame and timing settings
export const TIMING = {
  FRAME_RATE: 60, // FPS
  ANIMATION_FRAME_TIME: 16.67, // ms (1000/60)
  DEBOUNCE_DELAY: 150, // ms
  THROTTLE_DELAY: 100, // ms
} as const;

// Animation settings
export const ANIMATIONS = {
  FADE_DURATION: 300,
  SLIDE_DURATION: 250,
  BOUNCE_DURATION: 400,
  PULSE_INTERVAL: 1000,
} as const;

// Game-specific timing
export const GAME_TIMING = {
  MIN_DROP_TIME: 50, // Minimum piece drop time (ms)
  INITIAL_DROP_TIME: 1000, // Initial piece drop time (ms)
  SPEED_INCREMENT_PER_LEVEL: 50, // Speed increment per level (ms)
  STANDARD_TIMEOUT: 100, // General timeout duration (ms)
  ERROR_RELOAD_DELAY: 3000, // Error boundary reload delay (ms)
  AUDIO_TIMEOUT: 10000, // Audio strategy timeout (ms)
  DEFAULT_SOUND_DURATION: 1000, // Default sound duration (ms)

  // User interaction delays
  KEY_REPEAT_DELAY: 150, // Key repeat initial delay
  KEY_REPEAT_INTERVAL: 50, // Key repeat interval
  TOUCH_FEEDBACK_DURATION: 100, // Touch feedback duration

  // Animation and effect timings
  EFFECT_RESET_DELAY: 300, // Effect reset delay (ms)
  UI_EFFECT_MAX_DURATION: 5000, // Maximum UI effect duration (ms)
  PARTICLE_EFFECT_MAX_DURATION: 10000, // Maximum particle effect duration (ms)

  // FPS and frame calculations
  MS_PER_SECOND: 1000, // Milliseconds per second
  TARGET_FPS: 60, // Target frames per second
} as const;

// Timer intervals
export const INTERVALS = {
  PERFORMANCE_CHECK: 5000, // Performance monitoring interval
  SESSION_SAVE: 30000, // Session data save interval
  ERROR_CLEANUP: 60000, // Error history cleanup interval
  CACHE_CLEANUP: 300000, // Cache cleanup interval (5 minutes)
} as const;

// Type exports
export type SupportedLocale = (typeof I18N_CONFIG.SUPPORTED_LOCALES)[number];
