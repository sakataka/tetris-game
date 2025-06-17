/**
 * Theme Manager - Comprehensive Dynamic Theme Application System
 *
 * Provides a unified interface for applying comprehensive themes across the entire UI.
 * Applies colors, typography, spacing, sizing, borders, effects, and animations.
 * Bridges theme store with CSS variables for dynamic theme switching.
 */

import comprehensiveThemePresets from '../../data/comprehensiveThemePresets.json';
import type { ThemeVariant } from '../../types/tetris';

/**
 * Comprehensive theme preset interface
 */
export interface ComprehensiveThemePreset {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    tertiary: string;
    background: string;
    foreground: string;
    accent: string;
    success: string;
    warning: string;
    error: string;
    muted: string;
    surface: string;
  };
  tetrominoes: {
    I: string;
    O: string;
    T: string;
    S: string;
    Z: string;
    J: string;
    L: string;
  };
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
  effects: {
    blur: Record<string, string>;
    glow: Record<string, string>;
    shadow: Record<string, string>;
    saturation: number;
    brightness: number;
    contrast: number;
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
 * Semantic color tokens for consistent theming
 * Maps logical color roles to actual color values
 */
export interface SemanticColorTokens {
  // Primary brand colors
  primary: string;
  secondary: string;
  tertiary: string;

  // UI surface colors
  background: string;
  foreground: string;
  surface: string;

  // Interactive states
  accent: string;
  muted: string;
  border: string;

  // Semantic feedback colors
  success: string;
  warning: string;
  error: string;
  info: string;
}

/**
 * Theme configuration with comprehensive theming
 */
export interface ThemeConfig {
  name: string;
  variant: ThemeVariant;
  colors: SemanticColorTokens;
  typography: ComprehensiveThemePreset['typography'];
  spacing: ComprehensiveThemePreset['spacing'];
  sizing: ComprehensiveThemePreset['sizing'];
  borders: ComprehensiveThemePreset['borders'];
  effects: ComprehensiveThemePreset['effects'];
  animations: ComprehensiveThemePreset['animations'];
}

/**
 * Get comprehensive theme preset
 */
function getComprehensiveThemePreset(themeVariant: ThemeVariant): ComprehensiveThemePreset {
  const presets = comprehensiveThemePresets as Record<ThemeVariant, ComprehensiveThemePreset>;
  return presets[themeVariant] || presets.cyberpunk;
}

/**
 * CSS variable mapping for dynamic theme application
 */
const CSS_VARIABLE_MAP: Record<keyof SemanticColorTokens, string> = {
  primary: '--theme-primary',
  secondary: '--theme-secondary',
  tertiary: '--theme-tertiary',
  background: '--theme-background',
  foreground: '--theme-foreground',
  surface: '--theme-surface',
  accent: '--theme-accent',
  muted: '--theme-muted',
  border: '--theme-border',
  success: '--theme-success',
  warning: '--theme-warning',
  error: '--theme-error',
  info: '--theme-info',
} as const;

/**
 * Theme preset to semantic color mapping
 * Converts comprehensive theme presets to semantic color tokens
 */
function mapThemeToSemanticColors(themeVariant: ThemeVariant): SemanticColorTokens {
  const preset = getComprehensiveThemePreset(themeVariant);

  // Map preset colors to semantic roles using theme palette
  const baseColors: SemanticColorTokens = {
    primary: preset.colors.primary,
    secondary: preset.colors.secondary,
    tertiary: preset.colors.tertiary,
    background: preset.colors.background,
    foreground: preset.colors.foreground,
    accent: preset.colors.accent,
    surface: preset.colors.surface,
    muted: preset.colors.muted,
    border: preset.colors.primary,
    success: preset.colors.success,
    warning: preset.colors.warning,
    error: preset.colors.error,
    info: preset.colors.primary,
  };

  return baseColors;
}

/**
 * Apply comprehensive theme to CSS variables dynamically
 */
export function applyThemeToDocument(themeVariant: ThemeVariant): void {
  const semanticColors = mapThemeToSemanticColors(themeVariant);
  const preset = getComprehensiveThemePreset(themeVariant);

  // Apply semantic color tokens
  Object.entries(semanticColors).forEach(([tokenName, colorValue]) => {
    const cssVariable = CSS_VARIABLE_MAP[tokenName as keyof SemanticColorTokens];
    document.documentElement.style.setProperty(cssVariable, colorValue);
  });

  // Apply typography variables
  document.documentElement.style.setProperty(
    '--theme-font-primary',
    preset.typography.fontFamily.primary
  );
  document.documentElement.style.setProperty(
    '--theme-font-secondary',
    preset.typography.fontFamily.secondary
  );
  document.documentElement.style.setProperty(
    '--theme-font-body',
    preset.typography.fontFamily.body
  );

  Object.entries(preset.typography.fontSize).forEach(([key, value]) => {
    document.documentElement.style.setProperty(`--theme-text-${key}`, value);
  });

  Object.entries(preset.typography.fontWeight).forEach(([key, value]) => {
    document.documentElement.style.setProperty(`--theme-font-${key}`, value);
  });

  Object.entries(preset.typography.lineHeight).forEach(([key, value]) => {
    document.documentElement.style.setProperty(`--theme-leading-${key}`, value);
  });

  Object.entries(preset.typography.letterSpacing).forEach(([key, value]) => {
    document.documentElement.style.setProperty(`--theme-tracking-${key}`, value);
  });

  // Apply spacing variables
  Object.entries(preset.spacing).forEach(([key, value]) => {
    document.documentElement.style.setProperty(`--theme-spacing-${key}`, value);
  });

  // Apply sizing variables
  Object.entries(preset.sizing.button).forEach(([key, sizes]) => {
    document.documentElement.style.setProperty(`--theme-button-${key}-height`, sizes.height);
    document.documentElement.style.setProperty(`--theme-button-${key}-padding`, sizes.padding);
  });

  Object.entries(preset.sizing.card).forEach(([key, sizes]) => {
    document.documentElement.style.setProperty(`--theme-card-${key}-padding`, sizes.padding);
  });

  Object.entries(preset.sizing.input).forEach(([key, sizes]) => {
    document.documentElement.style.setProperty(`--theme-input-${key}-height`, sizes.height);
    document.documentElement.style.setProperty(`--theme-input-${key}-padding`, sizes.padding);
  });

  // Apply border variables
  Object.entries(preset.borders.width).forEach(([key, value]) => {
    document.documentElement.style.setProperty(`--theme-border-${key}`, value);
  });

  Object.entries(preset.borders.radius).forEach(([key, value]) => {
    document.documentElement.style.setProperty(`--theme-rounded-${key}`, value);
  });

  document.documentElement.style.setProperty('--theme-border-style', preset.borders.style);

  // Apply effect variables
  Object.entries(preset.effects.blur).forEach(([key, value]) => {
    document.documentElement.style.setProperty(`--theme-blur-${key}`, value);
  });

  Object.entries(preset.effects.glow).forEach(([key, value]) => {
    document.documentElement.style.setProperty(`--theme-glow-${key}`, value);
  });

  Object.entries(preset.effects.shadow).forEach(([key, value]) => {
    document.documentElement.style.setProperty(`--theme-shadow-${key}`, value);
  });

  document.documentElement.style.setProperty(
    '--theme-saturation',
    preset.effects.saturation.toString()
  );
  document.documentElement.style.setProperty(
    '--theme-brightness',
    preset.effects.brightness.toString()
  );
  document.documentElement.style.setProperty(
    '--theme-contrast',
    preset.effects.contrast.toString()
  );

  // Apply animation variables
  Object.entries(preset.animations.duration).forEach(([key, value]) => {
    document.documentElement.style.setProperty(`--theme-duration-${key}`, value);
  });

  Object.entries(preset.animations.easing).forEach(([key, value]) => {
    document.documentElement.style.setProperty(`--theme-ease-${key}`, value);
  });

  document.documentElement.style.setProperty(
    '--theme-animations-enabled',
    preset.animations.enabled ? '1' : '0'
  );
  document.documentElement.style.setProperty(
    '--theme-particles-enabled',
    preset.animations.particles ? '1' : '0'
  );
  document.documentElement.style.setProperty(
    '--theme-animation-intensity',
    preset.animations.intensity
  );

  // Apply tetromino colors
  Object.entries(preset.tetrominoes).forEach(([piece, color]) => {
    document.documentElement.style.setProperty(`--tetromino-${piece.toLowerCase()}`, color);
  });

  // Apply theme class to body for CSS-based theming
  document.body.className = document.body.className
    .replace(/theme-\w+/g, '')
    .concat(` theme-${themeVariant}`)
    .trim();
}

/**
 * Generate CSS variables with transparency variants
 */
export function generateTransparencyVariants(baseColor: string, variantName: string): void {
  const opacities = [5, 10, 20, 30, 40, 50, 60, 70, 80, 90];

  opacities.forEach((opacity) => {
    const variableName = `--theme-${variantName}-${opacity}`;
    const colorValue = `color-mix(in oklch, ${baseColor} ${opacity}%, transparent)`;
    document.documentElement.style.setProperty(variableName, colorValue);
  });
}

/**
 * Update custom color overrides
 */
export function applyCustomColors(customColors: Partial<SemanticColorTokens>): void {
  Object.entries(customColors).forEach(([tokenName, colorValue]) => {
    const cssVariable = CSS_VARIABLE_MAP[tokenName as keyof SemanticColorTokens];
    if (cssVariable && colorValue) {
      document.documentElement.style.setProperty(cssVariable, colorValue);

      // Generate transparency variants for custom colors
      generateTransparencyVariants(colorValue, tokenName);
    }
  });
}

/**
 * Get current comprehensive theme configuration
 */
export function getCurrentThemeConfig(themeVariant: ThemeVariant): ThemeConfig {
  const preset = getComprehensiveThemePreset(themeVariant);
  const semanticColors = mapThemeToSemanticColors(themeVariant);

  return {
    name: preset.name,
    variant: themeVariant,
    colors: semanticColors,
    typography: preset.typography,
    spacing: preset.spacing,
    sizing: preset.sizing,
    borders: preset.borders,
    effects: preset.effects,
    animations: preset.animations,
  };
}

/**
 * Initialize comprehensive theme system on app startup
 */
export function initializeThemeSystem(initialTheme: ThemeVariant = 'cyberpunk'): void {
  // Apply initial theme with all properties
  applyThemeToDocument(initialTheme);

  // Generate transparency variants for all semantic colors
  const semanticColors = mapThemeToSemanticColors(initialTheme);
  Object.entries(semanticColors).forEach(([tokenName, colorValue]) => {
    generateTransparencyVariants(colorValue, tokenName);
  });

  console.log(`🎨 Comprehensive theme system initialized with ${initialTheme} theme`);
  console.log('✨ Typography, spacing, sizing, borders, effects, and animations applied');
}

/**
 * Get tetromino colors for the current theme
 */
export function getThemeTetrominoColors(themeVariant: ThemeVariant): Record<string, string> {
  const preset = getComprehensiveThemePreset(themeVariant);
  return preset.tetrominoes;
}

/**
 * Theme utility functions for components
 */
export const themeUtils = {
  /**
   * Get CSS variable reference for use in Tailwind classes
   */
  getCSSVar: (tokenName: keyof SemanticColorTokens) => `var(${CSS_VARIABLE_MAP[tokenName]})`,

  /**
   * Get CSS variable with transparency
   */
  getCSSVarWithOpacity: (tokenName: keyof SemanticColorTokens, opacity: number) =>
    `var(--theme-${tokenName}-${opacity})`,

  /**
   * Get tetromino color CSS variable
   */
  getTetrominoCSSVar: (piece: 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L') => 
    `var(--tetromino-${piece.toLowerCase()})`,

  /**
   * Check if color is light (for contrast calculations)
   */
  isLightColor: (color: string): boolean => {
    // Simple heuristic - would need more sophisticated implementation
    return color.includes('#f') || color.includes('white') || color.includes('light');
  },
} as const;
