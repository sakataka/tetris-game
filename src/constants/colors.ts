/**
 * Centralized Color Constants
 *
 * UI colors, shadows, and glow effects used throughout the application
 */

export const UI_COLORS = {
  WHITE: '#ffffff',
  BLACK: '#000000',
  TRANSPARENT: 'transparent',

  // Overlay backgrounds
  OVERLAY_BACKGROUND: 'rgba(0,0,0,0.9)',
  SEMI_TRANSPARENT_BLACK: 'rgba(0,0,0,0.8)',

  // Game board colors
  EMPTY_CELL: 'transparent',
  GHOST_PIECE: 'rgba(255,255,255,0.3)',
} as const;

export const SHADOW_COLORS = {
  PURPLE: '0_0_15px_rgba(147,51,234,0.5)',
  CYAN: '0_0_15px_rgba(6,182,212,0.5)',
  YELLOW: '0_0_15px_rgba(245,158,11,0.5)',
  RED: '0_0_20px_rgba(239,68,68,0.6)',
  GREEN: '0_0_15px_rgba(34,197,94,0.5)',
  WHITE: '0_0_10px_rgba(255,255,255,0.5)',
} as const;

export const NEON_GLOWS = {
  SMALL: '0_0_10px',
  MEDIUM: '0_0_15px',
  LARGE: '0_0_20px',
  EXTRA_LARGE: '0_0_30px',
} as const;

export const GLOW_INTENSITIES = {
  SUBTLE: 0.3,
  NORMAL: 0.5,
  STRONG: 0.6,
  INTENSE: 0.8,
} as const;
