/**
 * Layout and UI dimension related constants
 *
 * Game board, UI element sizes, and breakpoint settings
 *
 * @deprecated Use uiConfig.ts for new implementations. This file provides
 * backward compatibility for existing code.
 */

// Re-export from new UI configuration system
export {
  BOARD_HEIGHT,
  BOARD_WIDTH,
  BREAKPOINTS,
  EFFECTS,
  MOBILE_CONFIG,
  THEME_CONFIG,
} from './uiConfig';

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
    SMALL: 'p-2 md:p-4', // 8px -> 16px (8-point grid)
    MEDIUM: 'p-4 md:p-6', // 16px -> 24px (8-point grid)
    LARGE: 'p-6 md:p-8', // 24px -> 32px (8-point grid)
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
    SMALL: 'gap-2', // 8px (8-point grid)
    MEDIUM: 'gap-4', // 16px (8-point grid)
    LARGE: 'gap-6', // 24px (8-point grid)
  },
} as const;

// Typography system for consistent text hierarchy
export const TYPOGRAPHY = {
  PANEL_TITLE: 'text-sm', // Main panel titles
  SECTION_HEADER: 'text-xs', // Section headers within panels
  BODY_TEXT: 'text-xs', // Standard body text
  SMALL_LABEL: 'text-xs', // Small labels and captions (improved from text-2xs)
  BUTTON_TEXT: 'text-xs', // Button text
  STAT_VALUE: 'text-xs', // Statistics values
  // Font weights
  TITLE_WEIGHT: 'font-bold',
  BODY_WEIGHT: 'font-medium',
  LABEL_WEIGHT: 'font-normal',
} as const;

// 8-point grid spacing system
export const SPACING_SCALE = {
  xs: '0.5rem', // 8px
  sm: '1rem', // 16px
  md: '1.5rem', // 24px
  lg: '2rem', // 32px
  xl: '3rem', // 48px
} as const;

// Standardized spacing patterns using 8-point grid
export const SPACING = {
  // Vertical spacing (using 8-point grid)
  PANEL_INTERNAL: 'space-y-2', // 8px (internal panel spacing)
  SECTION_GAP: 'space-y-4', // 16px (between major sections)
  FORM_ELEMENTS: 'space-y-3', // 12px (form element spacing)
  TIGHT: 'space-y-2', // 8px (tight spacing)
  LOOSE: 'space-y-6', // 24px (loose spacing)
  // Margins (using 8-point grid)
  PANEL_TITLE_BOTTOM: 'mb-2', // 8px after panel titles
  SECTION_TITLE_BOTTOM: 'mb-2', // 8px after section titles
  FORM_LABEL_BOTTOM: 'mb-1', // 4px after form labels
} as const;

// Component padding using 8-point grid
export const PADDING_SCALE = {
  xs: 'p-2', // 8px
  sm: 'p-4', // 16px
  md: 'p-6', // 24px
  lg: 'p-8', // 32px
  xl: 'p-12', // 48px
} as const;

// Gap sizes using 8-point grid
export const GAP_SCALE = {
  xs: 'gap-2', // 8px
  sm: 'gap-4', // 16px
  md: 'gap-6', // 24px
  lg: 'gap-8', // 32px
  xl: 'gap-12', // 48px
} as const;

// Design tokens for consistent styling
export const DESIGN_TOKENS = {
  borderRadius: '6px',
  transition: '150ms ease',
  focusRing: '2px solid var(--theme-primary)',
  hoverScale: '1.02',
} as const;

// Cyberpunk typography system for unified font usage
export const CYBERPUNK_TYPOGRAPHY = {
  FONTS: {
    PRIMARY: 'font-cyber-primary', // Orbitron for headers, main UI
    SECONDARY: 'font-cyber-secondary', // Courier New for monospace data
    BODY: 'font-cyber-body', // Inter for body text (minimal use)
  },
  USAGE_RULES: {
    TITLES: 'font-cyber-primary font-bold', // Panel titles, headers
    STATS: 'font-cyber-secondary font-bold', // Score, level, lines data
    BUTTONS: 'font-cyber-primary font-medium', // Button text
    LABELS: 'font-cyber-primary font-normal', // Field labels
    BODY: 'font-cyber-primary font-normal', // General text
  },
} as const;
