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

// Type exports
export type SupportedLocale = (typeof I18N_CONFIG.SUPPORTED_LOCALES)[number];
