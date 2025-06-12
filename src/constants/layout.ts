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
  FLASH_DURATION: 80, // very short flash for instant feel
  SHAKE_DURATION: 80, // sync with flash duration
  RESET_DELAY: 300, // ms
  NEON_BLUR_SM: '4px',
  NEON_BLUR_MD: '8px',
  NEON_BLUR_LG: '12px',
  NEON_BLUR_XL: '16px',
} as const;

// Responsive breakpoints
export const BREAKPOINTS = {
  MOBILE_WIDTH: 768, // Mobile breakpoint in px
  TABLET_WIDTH: 1024, // Tablet breakpoint in px
  DESKTOP_WIDTH: 1280, // Desktop breakpoint in px
} as const;

// Mobile and responsive settings
export const MOBILE_CONFIG = {
  TOUCH_DELAY: 100,
  VIRTUAL_BUTTON_SIZE: 48,
  MIN_SCREEN_WIDTH: 320,
  TABLET_BREAKPOINT: BREAKPOINTS.MOBILE_WIDTH,
} as const;

// Theme and visual settings
export const THEME_CONFIG = {
  DEFAULT_VOLUME: 0.5,
  DEFAULT_EFFECT_INTENSITY: 50,
  ANIMATION_DURATION: '0.3s',
  TRANSITION_DURATION: '0.2s',
} as const;

// UI element sizes (Tailwind classes)
export const UI_SIZES = {
  VIRTUAL_BUTTON: {
    STANDARD: 'w-10 h-10', // 40px
    LARGE: 'w-14 h-14', // 56px
  },
  SLIDER: {
    WIDTH: 'w-20', // 80px
    HEIGHT: 'h-2', // 8px
  },
  PADDING: {
    SMALL: 'p-3 md:p-4',
    MEDIUM: 'p-4 md:p-6',
    LARGE: 'p-6 md:p-8',
  },
  TEXT_SIZES: {
    SMALL: 'text-base md:text-lg',
    MEDIUM: 'text-lg md:text-xl',
    LARGE: 'text-xl md:text-2xl',
  },
} as const;

// Game UI specific sizes
export const GAME_UI_SIZES = {
  NEXT_PIECE: {
    CELL: 'w-5 h-5', // 20px
    CONTAINER: 'w-20 h-20', // 80px
  },
  VOLUME_DISPLAY: 'w-8', // 32px
  GAP_SIZES: {
    SMALL: 'gap-1', // 4px
    MEDIUM: 'gap-2', // 8px
    LARGE: 'gap-4', // 16px
  },
} as const;

// Typography system for consistent text hierarchy
export const TYPOGRAPHY = {
  PANEL_TITLE: 'text-sm', // Main panel titles
  SECTION_HEADER: 'text-xs', // Section headers within panels
  BODY_TEXT: 'text-xs', // Standard body text
  SMALL_LABEL: 'text-2xs', // Small labels and captions
  BUTTON_TEXT: 'text-xs', // Button text
  STAT_VALUE: 'text-xs', // Statistics values
  // Font weights
  TITLE_WEIGHT: 'font-bold',
  BODY_WEIGHT: 'font-medium',
  LABEL_WEIGHT: 'font-normal',
} as const;

// Standardized spacing patterns
export const SPACING = {
  PANEL_INTERNAL: 'space-y-1', // Internal panel spacing
  SECTION_GAP: 'space-y-2', // Between major sections
  FORM_ELEMENTS: 'space-y-1.5', // Form element spacing
  TIGHT: 'space-y-0.5', // Very tight spacing (rare use)
  LOOSE: 'space-y-3', // Loose spacing for breathing room
  // Margins
  PANEL_TITLE_BOTTOM: 'mb-1', // Space after panel titles
  SECTION_TITLE_BOTTOM: 'mb-0.5', // Space after section titles
  FORM_LABEL_BOTTOM: 'mb-0.5', // Space after form labels
} as const;
