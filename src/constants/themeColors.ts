/**
 * Theme Color Usage System
 *
 * Defines how theme colors should be used across different UI components
 * to ensure consistent visual hierarchy and proper contrast
 */

export const THEME_COLOR_USAGE = {
  // Layout & Structure
  layout: {
    pageBackground: 'background',
    mainContainer: 'background',
    sidebar: 'surface',
    header: 'surface',
    footer: 'surface',
  },

  // Panels & Cards
  panels: {
    gamePanel: 'surface',
    scorePanel: 'surface',
    nextPiecePanel: 'surface',
    settingsCard: 'surface',
    dialogBackground: 'surface',
    cardBorder: 'border',
  },

  // Text Hierarchy
  text: {
    mainTitle: 'primary',
    sectionTitle: 'primary',
    bodyText: 'foreground',
    mutedText: 'muted',
    scoreValue: 'accent',
    levelValue: 'secondary',
    linesValue: 'tertiary',
    label: 'neutral',
  },

  // Interactive Elements
  buttons: {
    primaryAction: 'primary',
    secondaryAction: 'secondary',
    dangerAction: 'error',
    successAction: 'success',
    ghostAction: 'neutral',
    disabled: 'muted',
  },

  // Game Elements
  game: {
    // Tetromino colors should use the 6-color palette
    tetrominoI: 'primary', // Cyan in most themes
    tetrominoO: 'secondary', // Yellow/Orange
    tetrominoT: 'tertiary', // Purple/Green
    tetrominoS: 'accent', // Green/Red accent
    tetrominoZ: 'error', // Red
    tetrominoJ: 'info', // Blue
    tetrominoL: 'warning', // Orange/Yellow

    // Game board
    gridLines: 'neutral + 20% opacity',
    ghostPiece: 'primary + 30% opacity',
    lockedPiece: 'neutral',
    boardBorder: 'border',

    // Effects
    lineClearFlash: 'accent',
    levelUpEffect: 'primary',
    gameOverOverlay: 'error + 50% opacity',
  },

  // Feedback & States
  states: {
    hover: 'primary + 10% opacity',
    focus: 'primary',
    active: 'primary',
    selected: 'secondary',
    error: 'error',
    warning: 'warning',
    success: 'success',
    info: 'info',
  },

  // Special Effects
  effects: {
    glow: 'primary',
    shadow: 'background + 50% opacity',
    border: 'border',
    divider: 'neutral + 30% opacity',
    overlay: 'background + 70% opacity',
  },
} as const;

/**
 * Get color CSS variable for a specific usage
 * @param usage - The usage path (e.g., 'text.mainTitle')
 * @returns CSS variable name
 */
export function getThemeColor(usage: string): string {
  const parts = usage.split('.');
  // biome-ignore lint/suspicious/noExplicitAny: Required for recursive object traversal
  let current: any = THEME_COLOR_USAGE;

  for (const part of parts) {
    current = current[part];
    if (!current) return 'var(--theme-foreground)'; // fallback
  }

  // Handle opacity modifiers
  if (typeof current === 'string' && current.includes('+')) {
    const [color, opacity] = current.split(' + ');
    if (color && opacity) {
      const opacityValue = Number.parseInt(opacity) / 100;
      return `color-mix(in oklch, var(--theme-${color}) ${opacityValue * 100}%, transparent)`;
    }
  }

  if (typeof current === 'string') {
    return `var(--theme-${current})`;
  }

  return 'var(--theme-foreground)'; // fallback
}

/**
 * Theme color combination rules for better visual harmony
 */
export const THEME_COLOR_RULES = {
  // Primary + Secondary: Main UI elements
  primarySecondary: ['buttons.primaryAction', 'buttons.secondaryAction'],

  // Surface + Border: Card and panel styling
  surfaceBorder: ['panels.gamePanel', 'panels.cardBorder'],

  // Background + Surface: Layout hierarchy
  backgroundSurface: ['layout.pageBackground', 'panels.gamePanel'],

  // Accent for highlights only
  accentHighlight: ['text.scoreValue', 'game.lineClearFlash'],

  // Neutral for non-interactive elements
  neutralElements: ['text.label', 'game.gridLines', 'effects.divider'],
} as const;
