/**
 * Simplified Unified Theme System - Single Source of Truth
 *
 * Only 3 types of colors: background, foreground, tetrominoes
 * This eliminates complexity and ensures consistency
 */

import type { ThemeVariant } from '@/types/tetris';
import themePresetsData from '../../data/themePresetsSimple.json';

// Validate JSON import and provide fallback
if (!themePresetsData || typeof themePresetsData !== 'object') {
  throw new Error('Theme presets JSON failed to load or is invalid');
}

// Extract only valid theme variants
const validThemeKeys: ThemeVariant[] = ['cyberpunk', 'classic', 'retro', 'minimal', 'neon'];

// Type-safe access to theme presets with runtime validation
const THEME_PRESETS = Object.fromEntries(
  validThemeKeys.map((key) => [key, (themePresetsData as Record<string, unknown>)[key]])
) as unknown as Record<
  ThemeVariant,
  {
    name: string;
    background: string;
    foreground: string;
    tetrominoes: Record<'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L', string>;
  }
>;

// Validate that all required themes are present
const requiredThemes: ThemeVariant[] = ['cyberpunk', 'classic', 'retro', 'minimal', 'neon'];
for (const theme of requiredThemes) {
  if (!THEME_PRESETS[theme]) {
    throw new Error(`Required theme '${theme}' is missing from theme presets`);
  }
  if (
    !THEME_PRESETS[theme].background ||
    !THEME_PRESETS[theme].foreground ||
    !THEME_PRESETS[theme].tetrominoes
  ) {
    throw new Error(
      `Theme '${theme}' is missing required background, foreground, or tetrominoes properties`
    );
  }
}

/**
 * Simplified theme configuration with only essential colors
 */
export interface UnifiedThemeConfig {
  name: string;
  variant: ThemeVariant;
  background: string;
  foreground: string;
  tetrominoes: Record<'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L', string>;
}

/**
 * Get unified theme configuration for a specific theme variant
 */
export function getUnifiedThemeConfig(variant: ThemeVariant): UnifiedThemeConfig {
  const preset = THEME_PRESETS[variant];
  if (!preset) {
    throw new Error(`Theme variant '${variant}' not found`);
  }

  return {
    name: preset.name,
    variant,
    background: preset.background,
    foreground: preset.foreground,
    tetrominoes: preset.tetrominoes,
  };
}

/**
 * Apply theme colors to document CSS variables
 */
export function applyUnifiedThemeToDocument(variant: ThemeVariant): void {
  const config = getUnifiedThemeConfig(variant);
  const root = document.documentElement;

  // Apply basic colors
  root.style.setProperty('--theme-background', config.background);
  root.style.setProperty('--theme-foreground', config.foreground);

  // Legacy compatibility - these will use the same values
  root.style.setProperty('--background', config.background);
  root.style.setProperty('--foreground', config.foreground);

  // ===== SHADCN/UI COMPATIBILITY COLORS =====
  // These are required for the checkbox, switch, and other UI components
  root.style.setProperty('--primary', config.foreground);
  root.style.setProperty('--primary-foreground', config.background);

  // Generate dynamic colors using color-mix
  const inputColor = `color-mix(in srgb, ${config.foreground} 10%, ${config.background})`;
  const borderColor = `color-mix(in srgb, ${config.foreground} 20%, transparent)`;
  const mutedColor = `color-mix(in srgb, ${config.foreground} 30%, ${config.background})`;

  root.style.setProperty('--input', inputColor);
  root.style.setProperty('--border', borderColor);
  root.style.setProperty('--ring', config.foreground);
  root.style.setProperty('--muted', mutedColor);

  // Apply tetromino colors
  Object.entries(config.tetrominoes).forEach(([piece, color]) => {
    root.style.setProperty(`--tetromino-${piece.toLowerCase()}`, color);
  });

  console.log(`🎨 Applied simplified theme: ${variant}`, {
    background: config.background,
    foreground: config.foreground,
    primary: config.foreground,
  });
}

/**
 * Get theme configuration for a specific tetromino piece
 */
export function getTetrominoColor(
  variant: ThemeVariant,
  piece: keyof UnifiedThemeConfig['tetrominoes']
): string {
  return getUnifiedThemeConfig(variant).tetrominoes[piece];
}

// Export the theme presets for external use (like ThemeSelector)
export { THEME_PRESETS };
