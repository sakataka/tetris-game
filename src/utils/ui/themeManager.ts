/**
 * Theme Manager - Dynamic Theme Application System
 *
 * Provides a unified interface for applying themes across the entire UI.
 * Bridges theme store with CSS variables for dynamic theme switching.
 */

import type { ThemeVariant } from '../../types/tetris';
import { getThemePreset } from './themePresets';

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
 * Theme configuration with semantic color mapping
 */
export interface ThemeConfig {
  name: string;
  variant: ThemeVariant;
  colors: SemanticColorTokens;
  effects: {
    blur: number;
    glow: number;
    saturation: number;
    brightness: number;
  };
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
 * Converts theme presets to semantic color tokens
 */
function mapThemeToSemanticColors(themeVariant: ThemeVariant): SemanticColorTokens {
  const preset = getThemePreset(themeVariant);

  // Map preset colors to semantic roles using theme palette
  const baseColors: SemanticColorTokens = {
    primary: preset.colors.primary,
    secondary: preset.colors.secondary,
    tertiary: preset.colors.tertiary,
    background: preset.colors.background,
    foreground: preset.colors.foreground,
    accent: preset.colors.accent,
    surface: preset.colors.background,
    muted: preset.colors.tertiary,
    border: preset.colors.primary,
    success: preset.colors.accent,
    warning: preset.colors.tertiary,
    error: preset.colors.secondary,
    info: preset.colors.primary,
  };

  // All themes now use the consistent preset-based mapping
  // No per-theme overrides needed - colors come from theme presets
  return baseColors;
}

/**
 * Apply theme to CSS variables dynamically
 */
export function applyThemeToDocument(themeVariant: ThemeVariant): void {
  const semanticColors = mapThemeToSemanticColors(themeVariant);
  const preset = getThemePreset(themeVariant);

  // Apply semantic color tokens
  Object.entries(semanticColors).forEach(([tokenName, colorValue]) => {
    const cssVariable = CSS_VARIABLE_MAP[tokenName as keyof SemanticColorTokens];
    document.documentElement.style.setProperty(cssVariable, colorValue);
  });

  // Apply effect variables
  document.documentElement.style.setProperty('--theme-blur', `${preset.effects.blur}px`);
  document.documentElement.style.setProperty('--theme-glow', `${preset.effects.glow}px`);
  document.documentElement.style.setProperty(
    '--theme-saturation',
    preset.effects.saturation.toString()
  );
  document.documentElement.style.setProperty(
    '--theme-brightness',
    preset.effects.brightness.toString()
  );

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
 * Get current theme configuration
 */
export function getCurrentThemeConfig(themeVariant: ThemeVariant): ThemeConfig {
  const preset = getThemePreset(themeVariant);
  const semanticColors = mapThemeToSemanticColors(themeVariant);

  return {
    name: preset.name,
    variant: themeVariant,
    colors: semanticColors,
    effects: preset.effects,
  };
}

/**
 * Initialize theme system on app startup
 */
export function initializeThemeSystem(initialTheme: ThemeVariant = 'cyberpunk'): void {
  // Apply initial theme
  applyThemeToDocument(initialTheme);

  // Generate transparency variants for all semantic colors
  const semanticColors = mapThemeToSemanticColors(initialTheme);
  Object.entries(semanticColors).forEach(([tokenName, colorValue]) => {
    generateTransparencyVariants(colorValue, tokenName);
  });

  console.log(`🎨 Theme system initialized with ${initialTheme} theme`);
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
   * Check if color is light (for contrast calculations)
   */
  isLightColor: (color: string): boolean => {
    // Simple heuristic - would need more sophisticated implementation
    return color.includes('#f') || color.includes('white') || color.includes('light');
  },
} as const;
