/**
 * Unified Theme System - Single Source of Truth
 *
 * All theme colors are imported from themePresets.json
 * Additional properties (typography, spacing, etc.) are defined here
 * This eliminates color duplication and ensures consistency
 */

import themePresetsData from '../../data/themePresets.json';
import type { ThemeVariant } from '../../types/tetris';

// Type-safe access to theme presets
const THEME_PRESETS = themePresetsData as Record<
  ThemeVariant,
  {
    name: string;
    colors: {
      primary: string;
      secondary: string;
      tertiary: string;
      background: string;
      foreground: string;
      accent: string;
      warning: string;
      error: string;
      success: string;
      info: string;
      muted: string;
      surface: string;
      border: string;
      neutral: string;
    };
    effects: {
      blur: { sm: string; md: string; lg: string };
      glow: { sm: string; md: string; lg: string };
      shadow: { sm: string; md: string; lg: string };
      saturation: number;
      brightness: number;
      contrast: number;
    };
  }
>;

/**
 * Enhanced theme configuration with typography, spacing, and other design tokens
 */
export interface UnifiedThemeConfig {
  name: string;
  variant: ThemeVariant;
  colors: (typeof THEME_PRESETS)[ThemeVariant]['colors'];
  effects: (typeof THEME_PRESETS)[ThemeVariant]['effects'];
  tetrominoes: Record<'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L', string>;
  typography: {
    fontFamily: {
      primary: string;
      secondary: string;
      body: string;
    };
    fontSize: Record<string, string>;
    fontWeight: Record<string, string>;
    lineHeight: Record<string, string>;
    letterSpacing: Record<string, string>;
  };
  spacing: Record<string, string>;
  sizing: {
    button: Record<string, { height: string; padding: string }>;
    card: Record<string, { padding: string }>;
    input: Record<string, { height: string; padding: string }>;
  };
  borders: {
    width: Record<string, string>;
    radius: Record<string, string>;
    style: string;
  };
  animations: {
    duration: Record<string, string>;
    easing: Record<string, string>;
    enabled: boolean;
    particles: boolean;
    intensity: string;
  };
}

/**
 * Theme-specific tetromino colors based on theme palette
 */
const TETROMINO_MAPPINGS: Record<
  ThemeVariant,
  Record<'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L', string>
> = {
  cyberpunk: {
    I: '#00ffff', // primary (cyan)
    O: '#ffaa00', // accent (orange)
    T: '#9900ff', // tertiary (purple)
    S: '#00ff88', // success (green)
    Z: '#ff0055', // error (pink)
    J: '#0088ff', // info (blue)
    L: '#ff0099', // secondary (magenta)
  },
  classic: {
    I: '#0f380f', // primary (dark green)
    O: '#ffa500', // tertiary (orange)
    T: '#8bac0f', // secondary (lime)
    S: '#6ba000', // success (green)
    Z: '#cc3300', // error (red)
    J: '#0066cc', // info (blue)
    L: '#708a40', // neutral (olive)
  },
  retro: {
    I: '#ff6b35', // primary (orange)
    O: '#ffd23f', // secondary (yellow)
    T: '#3742fa', // tertiary (blue)
    S: '#2ed573', // success (green)
    Z: '#ee4266', // error (red)
    J: '#3742fa', // info (blue)
    L: '#a0506e', // neutral (mauve)
  },
  minimal: {
    I: '#2563eb', // primary (blue)
    O: '#f97316', // tertiary (orange)
    T: '#64748b', // secondary (slate)
    S: '#10b981', // success (emerald)
    Z: '#ef4444', // error (red)
    J: '#3b82f6', // info (blue)
    L: '#9ca3af', // neutral (gray)
  },
  neon: {
    I: '#ff1493', // primary (deep pink)
    O: '#ffff00', // accent (yellow)
    T: '#ff6600', // tertiary (orange)
    S: '#00ff66', // success (green)
    Z: '#ff0066', // error (red)
    J: '#0099ff', // info (blue)
    L: '#00ffcc', // secondary (cyan)
  },
};

/**
 * Design tokens that are consistent across all themes
 */
const DESIGN_TOKENS = {
  typography: {
    fontFamily: {
      primary:
        '"Geist Mono", "SF Mono", Monaco, Inconsolata, "Roboto Mono", Consolas, "Courier New", monospace',
      secondary: '"Geist", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      body: '"Geist", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    fontSize: {
      xs: '0.75rem', // 12px
      sm: '0.875rem', // 14px
      base: '1rem', // 16px
      lg: '1.125rem', // 18px
      xl: '1.25rem', // 20px
      '2xl': '1.5rem', // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem', // 36px
    },
    fontWeight: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
    },
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75',
    },
    letterSpacing: {
      tight: '-0.025em',
      normal: '0em',
      wide: '0.025em',
      wider: '0.05em',
    },
  },
  spacing: {
    xs: '0.25rem', // 4px
    sm: '0.5rem', // 8px
    md: '0.75rem', // 12px
    lg: '1rem', // 16px
    xl: '1.5rem', // 24px
    '2xl': '2rem', // 32px
    '3xl': '3rem', // 48px
    '4xl': '4rem', // 64px
  },
  sizing: {
    button: {
      sm: { height: '2rem', padding: '0.5rem 0.75rem' },
      md: { height: '2.5rem', padding: '0.5rem 1rem' },
      lg: { height: '3rem', padding: '0.75rem 1.5rem' },
    },
    card: {
      sm: { padding: '0.75rem' },
      md: { padding: '1rem' },
      lg: { padding: '1.5rem' },
    },
    input: {
      sm: { height: '2rem', padding: '0.25rem 0.5rem' },
      md: { height: '2.5rem', padding: '0.5rem 0.75rem' },
      lg: { height: '3rem', padding: '0.75rem 1rem' },
    },
  },
  borders: {
    width: {
      thin: '1px',
      normal: '2px',
      thick: '3px',
    },
    radius: {
      none: '0',
      sm: '0.25rem',
      md: '0.375rem',
      lg: '0.5rem',
      xl: '0.75rem',
      full: '9999px',
    },
    style: 'solid',
  },
  animations: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
    },
    easing: {
      linear: 'linear',
      ease: 'ease',
      'ease-in': 'ease-in',
      'ease-out': 'ease-out',
      'ease-in-out': 'ease-in-out',
    },
  },
};

/**
 * Theme-specific animation settings
 */
const THEME_ANIMATIONS: Record<
  ThemeVariant,
  { enabled: boolean; particles: boolean; intensity: string }
> = {
  cyberpunk: { enabled: true, particles: true, intensity: 'enhanced' },
  classic: { enabled: true, particles: false, intensity: 'reduced' },
  retro: { enabled: true, particles: true, intensity: 'normal' },
  minimal: { enabled: true, particles: false, intensity: 'reduced' },
  neon: { enabled: true, particles: true, intensity: 'enhanced' },
};

/**
 * Get unified theme configuration for a specific theme variant
 */
export function getUnifiedThemeConfig(themeVariant: ThemeVariant): UnifiedThemeConfig {
  const baseTheme = THEME_PRESETS[themeVariant];

  if (!baseTheme) {
    throw new Error(`Theme variant '${themeVariant}' not found in theme presets`);
  }

  return {
    name: baseTheme.name,
    variant: themeVariant,
    colors: baseTheme.colors,
    effects: baseTheme.effects,
    tetrominoes: TETROMINO_MAPPINGS[themeVariant],
    typography: DESIGN_TOKENS.typography,
    spacing: DESIGN_TOKENS.spacing,
    sizing: DESIGN_TOKENS.sizing,
    borders: DESIGN_TOKENS.borders,
    animations: {
      ...DESIGN_TOKENS.animations,
      ...THEME_ANIMATIONS[themeVariant],
    },
  };
}

/**
 * Get all available theme variants
 */
export function getAvailableThemes(): ThemeVariant[] {
  return Object.keys(THEME_PRESETS) as ThemeVariant[];
}

/**
 * Get theme colors only (for simple color access)
 */
export function getThemeColors(themeVariant: ThemeVariant) {
  const theme = THEME_PRESETS[themeVariant];
  if (!theme) {
    throw new Error(`Theme variant '${themeVariant}' not found`);
  }
  return theme.colors;
}

/**
 * Get theme effects only
 */
export function getThemeEffects(themeVariant: ThemeVariant) {
  const theme = THEME_PRESETS[themeVariant];
  if (!theme) {
    throw new Error(`Theme variant '${themeVariant}' not found`);
  }
  return theme.effects;
}

/**
 * Export theme presets for direct access (backward compatibility)
 */
export { THEME_PRESETS };

/**
 * CSS variable mapping for dynamic theme application
 */
const CSS_VARIABLE_MAP = {
  primary: '--theme-primary',
  secondary: '--theme-secondary',
  tertiary: '--theme-tertiary',
  background: '--theme-background',
  foreground: '--theme-foreground',
  surface: '--theme-surface',
  accent: '--theme-accent',
  muted: '--theme-muted',
  border: '--theme-border',
  neutral: '--theme-neutral',
  success: '--theme-success',
  warning: '--theme-warning',
  error: '--theme-error',
  info: '--theme-info',
} as const;

/**
 * Apply unified theme to document
 */
export function applyUnifiedThemeToDocument(themeVariant: ThemeVariant): void {
  const config = getUnifiedThemeConfig(themeVariant);
  const root = document.documentElement;

  // Apply color variables
  Object.entries(config.colors).forEach(([colorName, colorValue]) => {
    const cssVar = CSS_VARIABLE_MAP[colorName as keyof typeof CSS_VARIABLE_MAP];
    if (cssVar) {
      root.style.setProperty(cssVar, colorValue);
    }
  });

  // Apply tetromino colors
  Object.entries(config.tetrominoes).forEach(([piece, color]) => {
    root.style.setProperty(`--tetromino-${piece.toLowerCase()}`, color);
  });

  // Apply typography variables
  Object.entries(config.typography.fontFamily).forEach(([key, value]) => {
    root.style.setProperty(`--theme-font-${key}`, value);
  });

  Object.entries(config.typography.fontSize).forEach(([key, value]) => {
    root.style.setProperty(`--theme-text-${key}`, value);
  });

  // Apply spacing variables
  Object.entries(config.spacing).forEach(([key, value]) => {
    root.style.setProperty(`--theme-spacing-${key}`, value);
  });

  // Apply effect variables
  Object.entries(config.effects.blur).forEach(([key, value]) => {
    root.style.setProperty(`--theme-blur-${key}`, value);
  });

  Object.entries(config.effects.glow).forEach(([key, value]) => {
    root.style.setProperty(`--theme-glow-${key}`, value);
  });

  Object.entries(config.effects.shadow).forEach(([key, value]) => {
    root.style.setProperty(`--theme-shadow-${key}`, value);
  });

  // Apply theme class to body
  document.body.className = document.body.className
    .replace(/theme-\w+/g, '')
    .concat(` theme-${themeVariant}`)
    .trim();

  console.log(`🎨 Unified theme system applied: ${config.name}`);
}
