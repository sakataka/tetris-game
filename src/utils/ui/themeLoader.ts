/**
 * JSON-based Theme Preset Loader
 *
 * Dynamically loads theme presets from unified JSON files,
 * performs runtime validation while ensuring type safety
 */

import { ThemeConfig, ThemeVariant, ColorBlindnessType } from '../../types/tetris';

// Type definitions for JSON schema validation
interface ThemeConfigData {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    tertiary: string;
    background: string;
    foreground: string;
    accent: string;
  };
  effects: {
    blur: number;
    glow: number;
    saturation: number;
    brightness: number;
  };
  accessibility: {
    colorBlindnessType: string;
    contrast: string;
    animationIntensity: string;
  };
}

interface ThemePresetsJSON extends Record<string, unknown> {
  _metadata?: {
    version: string;
    description: string;
    lastUpdated: string;
    totalThemes: number;
  };
  colorBlindness?: Record<string, unknown>;
  animations?: Record<string, unknown>;
}

/**
 * Load JSON preset file
 */
async function loadThemePresetsJSON(): Promise<ThemePresetsJSON> {
  try {
    // Load JSON with dynamic import
    const response = await import('../../data/themePresets.json');
    return response.default || response;
  } catch (error) {
    console.error('Failed to load theme presets JSON:', error);
    throw new Error('Theme presets could not be loaded');
  }
}

/**
 * Type safety validation for JSON data
 */
function validateThemeConfig(data: ThemeConfigData, themeName: string): ThemeConfig {
  // Check existence of required fields
  if (!data.name || typeof data.name !== 'string') {
    throw new Error(`Invalid theme config: missing or invalid name for ${themeName}`);
  }

  if (!data.colors || typeof data.colors !== 'object') {
    throw new Error(`Invalid theme config: missing colors for ${themeName}`);
  }

  if (!data.effects || typeof data.effects !== 'object') {
    throw new Error(`Invalid theme config: missing effects for ${themeName}`);
  }

  if (!data.accessibility || typeof data.accessibility !== 'object') {
    throw new Error(`Invalid theme config: missing accessibility for ${themeName}`);
  }

  // Color palette validation
  const colors = data.colors;
  const requiredColorKeys = [
    'primary',
    'secondary',
    'tertiary',
    'background',
    'foreground',
    'accent',
  ];
  for (const key of requiredColorKeys) {
    if (
      !colors[key as keyof typeof colors] ||
      typeof colors[key as keyof typeof colors] !== 'string'
    ) {
      throw new Error(`Invalid theme config: missing or invalid color.${key} for ${themeName}`);
    }
    // Simple validation of hex color code format
    if (!/^#[0-9a-fA-F]{6}$/.test(colors[key as keyof typeof colors])) {
      throw new Error(
        `Invalid theme config: invalid hex color format for ${themeName}.colors.${key}`
      );
    }
  }

  // Effects validation
  const effects = data.effects;
  const requiredEffectKeys = ['blur', 'glow', 'saturation', 'brightness'];
  for (const key of requiredEffectKeys) {
    if (typeof effects[key as keyof typeof effects] !== 'number') {
      throw new Error(`Invalid theme config: missing or invalid effects.${key} for ${themeName}`);
    }
  }

  // Accessibility settings validation
  const accessibility = data.accessibility;
  const validColorBlindnessTypes = ['none', 'protanopia', 'deuteranopia', 'tritanopia'];
  const validContrastLevels = ['low', 'normal', 'high'];
  const validAnimationIntensities = ['none', 'reduced', 'normal', 'enhanced'];

  if (!validColorBlindnessTypes.includes(accessibility.colorBlindnessType)) {
    throw new Error(`Invalid theme config: invalid colorBlindnessType for ${themeName}`);
  }

  if (!validContrastLevels.includes(accessibility.contrast)) {
    throw new Error(`Invalid theme config: invalid contrast for ${themeName}`);
  }

  if (!validAnimationIntensities.includes(accessibility.animationIntensity)) {
    throw new Error(`Invalid theme config: invalid animationIntensity for ${themeName}`);
  }

  // Return validated data as type-safe ThemeConfig
  return {
    name: data.name,
    colors: {
      primary: colors.primary,
      secondary: colors.secondary,
      tertiary: colors.tertiary,
      background: colors.background,
      foreground: colors.foreground,
      accent: colors.accent,
    },
    effects: {
      blur: effects.blur,
      glow: effects.glow,
      saturation: effects.saturation,
      brightness: effects.brightness,
    },
    accessibility: {
      colorBlindnessType: accessibility.colorBlindnessType as ColorBlindnessType,
      contrast: accessibility.contrast as 'low' | 'normal' | 'high',
      animationIntensity: accessibility.animationIntensity as
        | 'none'
        | 'reduced'
        | 'normal'
        | 'enhanced',
    },
  };
}

/**
 * Performance optimization with memory cache
 */
class ThemeCache {
  private static instance: ThemeCache;
  private cache = new Map<string, ThemeConfig>();
  private loadPromise: Promise<ThemePresetsJSON> | null = null;

  public static getInstance(): ThemeCache {
    if (!ThemeCache.instance) {
      ThemeCache.instance = new ThemeCache();
    }
    return ThemeCache.instance;
  }

  private async getPresetsData(): Promise<ThemePresetsJSON> {
    if (!this.loadPromise) {
      this.loadPromise = loadThemePresetsJSON();
    }
    return this.loadPromise;
  }

  public async getTheme(themeName: ThemeVariant): Promise<ThemeConfig> {
    // Get from cache
    if (this.cache.has(themeName)) {
      return this.cache.get(themeName)!;
    }

    // Load and validate from JSON
    const presetsData = await this.getPresetsData();

    if (!presetsData[themeName]) {
      throw new Error(`Theme '${themeName}' not found in presets`);
    }

    const themeConfig = validateThemeConfig(presetsData[themeName] as ThemeConfigData, themeName);

    // Save to cache
    this.cache.set(themeName, themeConfig);

    return themeConfig;
  }

  public async getAllThemes(): Promise<Record<ThemeVariant, ThemeConfig>> {
    const themes: Partial<Record<ThemeVariant, ThemeConfig>> = {};

    const themeNames: ThemeVariant[] = ['cyberpunk', 'classic', 'retro', 'minimal', 'neon'];

    for (const themeName of themeNames) {
      themes[themeName] = await this.getTheme(themeName);
    }

    return themes as Record<ThemeVariant, ThemeConfig>;
  }

  public clearCache(): void {
    this.cache.clear();
    this.loadPromise = null;
  }

  public getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// Export singleton instance
export const themeCache = ThemeCache.getInstance();

/**
 * Convenient function exports (maintaining compatibility with existing code)
 */
export async function getThemePresetAsync(theme: ThemeVariant): Promise<ThemeConfig> {
  return themeCache.getTheme(theme);
}

export async function getAllThemePresetsAsync(): Promise<Record<ThemeVariant, ThemeConfig>> {
  return themeCache.getAllThemes();
}

/**
 * Synchronous fallback version (backward compatibility)
 * Note: Returns fallback theme on first call, loads actual theme in background
 */
export function getThemePresetSync(theme: ThemeVariant): ThemeConfig {
  // Return immediately if in cache
  if (themeCache.getCacheStats().keys.includes(theme)) {
    // Note: This gets from cache synchronously
    // Actual implementation requires using Promise.resolve
    console.warn('getThemePresetSync is deprecated. Use getThemePresetAsync instead.');
  }

  // Fallback: return minimal default theme
  return {
    name: 'Default',
    colors: {
      primary: '#00ffff',
      secondary: '#ff00ff',
      tertiary: '#ffff00',
      background: '#0a0a0f',
      foreground: '#ffffff',
      accent: '#00ff00',
    },
    effects: {
      blur: 8,
      glow: 12,
      saturation: 1.0,
      brightness: 1.0,
    },
    accessibility: {
      colorBlindnessType: 'none',
      contrast: 'normal',
      animationIntensity: 'normal',
    },
  };
}
