/**
 * タイミング・アニメーション関連の定数
 *
 * フレームレート、アニメーション持続時間、タイマー設定
 */

// 多言語化設定
export const I18N_CONFIG = {
  DEFAULT_LOCALE: 'ja',
  SUPPORTED_LOCALES: ['ja', 'en', 'zh', 'ko'] as const,
  FALLBACK_LOCALE: 'en',
  DATE_FORMAT: {
    ja: 'YYYY年MM月DD日',
    en: 'MM/DD/YYYY',
    zh: 'YYYY年MM月DD日',
    ko: 'YYYY년 MM월 DD일',
  },
} as const;

// フレームとタイミング設定
export const TIMING = {
  FRAME_RATE: 60, // FPS
  ANIMATION_FRAME_TIME: 16.67, // ms (1000/60)
  DEBOUNCE_DELAY: 150, // ms
  THROTTLE_DELAY: 100, // ms
} as const;

// アニメーション設定
export const ANIMATIONS = {
  FADE_DURATION: 300,
  SLIDE_DURATION: 250,
  BOUNCE_DURATION: 400,
  PULSE_INTERVAL: 1000,
} as const;

// 型エクスポート
export type SupportedLocale = (typeof I18N_CONFIG.SUPPORTED_LOCALES)[number];
