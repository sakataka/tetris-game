/**
 * Layout and UI dimension related constants
 *
 * Game board, UI element sizes, and breakpoint settings
 */

// Game board settings
export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;

// Effects and animation settings
export const EFFECTS = {
  FLASH_DURATION: 300,
  SHAKE_DURATION: 200,
  RESET_DELAY: 300, // ms
  NEON_BLUR_SM: '4px',
  NEON_BLUR_MD: '8px',
  NEON_BLUR_LG: '12px',
  NEON_BLUR_XL: '16px',
} as const;

// Mobile and responsive settings
export const MOBILE_CONFIG = {
  TOUCH_DELAY: 100,
  VIRTUAL_BUTTON_SIZE: 48,
  MIN_SCREEN_WIDTH: 320,
  TABLET_BREAKPOINT: 768,
} as const;

// Theme and visual settings
export const THEME_CONFIG = {
  DEFAULT_VOLUME: 0.5,
  DEFAULT_EFFECT_INTENSITY: 50,
  ANIMATION_DURATION: '0.3s',
  TRANSITION_DURATION: '0.2s',
} as const;
