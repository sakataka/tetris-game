/**
 * レイアウト・UI寸法関連の定数
 * 
 * ゲームボード、UI要素のサイズ、ブレークポイント設定
 */

// ゲームボード設定
export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;

// エフェクト・アニメーション設定
export const EFFECTS = {
  FLASH_DURATION: 300,
  SHAKE_DURATION: 200,
  RESET_DELAY: 300, // ms
  NEON_BLUR_SM: '4px',
  NEON_BLUR_MD: '8px',
  NEON_BLUR_LG: '12px',
  NEON_BLUR_XL: '16px',
} as const;

// モバイル・レスポンシブ設定
export const MOBILE_CONFIG = {
  TOUCH_DELAY: 100,
  VIRTUAL_BUTTON_SIZE: 48,
  MIN_SCREEN_WIDTH: 320,
  TABLET_BREAKPOINT: 768,
} as const;

// テーマ・視覚設定
export const THEME_CONFIG = {
  DEFAULT_VOLUME: 0.5,
  DEFAULT_EFFECT_INTENSITY: 50,
  ANIMATION_DURATION: '0.3s',
  TRANSITION_DURATION: '0.2s',
} as const;