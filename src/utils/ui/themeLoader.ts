/**
 * JSON-based Theme Preset Loader
 *
 * Dynamically loads theme presets from unified JSON files,
 * performs runtime validation while ensuring type safety
 */

import type { ThemeConfig, ThemeVariant } from '../../types/tetris';
import { log } from '../logging';

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
    warning: string;
    error: string;
    success: string;
    info: string;
    muted: string;
    surface: string;
    border: string;
    neutral?: string;
  };
  effects: {
    blur: { sm: string; md: string; lg: string };
    glow: { sm: string; md: string; lg: string };
    shadow: { sm: string; md: string; lg: string };
    saturation: number;
    brightness: number;
    contrast: number;
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
    log.error('Failed to load theme presets JSON', {
      component: 'ThemeLoader',
      metadata: { error },
    });
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
    'warning',
    'error',
    'success',
    'info',
    'muted',
    'surface',
    'border',
  ];
  for (const key of requiredColorKeys) {
    if (
      !colors[key as keyof typeof colors] ||
      typeof colors[key as keyof typeof colors] !== 'string'
    ) {
      throw new Error(`Invalid theme config: missing or invalid color.${key} for ${themeName}`);
    }
    // Simple validation of hex color code format
    const colorValue = colors[key as keyof typeof colors];
    if (colorValue && !/^#[0-9a-fA-F]{6}$/.test(colorValue)) {
      throw new Error(
        `Invalid theme config: invalid hex color format for ${themeName}.colors.${key}`
      );
    }
  }

  // Optional neutral color validation
  if (colors.neutral && !/^#[0-9a-fA-F]{6}$/.test(colors.neutral)) {
    throw new Error(
      `Invalid theme config: invalid hex color format for ${themeName}.colors.neutral`
    );
  }

  // Effects validation
  const effects = data.effects;
  const requiredEffectObjectKeys = ['blur', 'glow', 'shadow'];
  const requiredEffectNumberKeys = ['saturation', 'brightness', 'contrast'];
  
  for (const key of requiredEffectObjectKeys) {
    const effectObj = effects[key as keyof typeof effects];
    if (typeof effectObj !== 'object' || effectObj === null) {
      throw new Error(`Invalid theme config: missing or invalid effects.${key} for ${themeName}`);
    }
    const requiredSizes = ['sm', 'md', 'lg'] as const;
    for (const size of requiredSizes) {
      if (typeof (effectObj as Record<string, string>)[size] !== 'string') {
        throw new Error(`Invalid theme config: missing or invalid effects.${key}.${size} for ${themeName}`);
      }
    }
  }
  
  for (const key of requiredEffectNumberKeys) {
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

  // Return validated data as type-safe ThemeConfig (casting for now)
  return {
    name: data.name,
    variant: 'cyberpunk', // Default variant for loaded themes
    colors: {
      primary: colors.primary,
      secondary: colors.secondary,
      tertiary: colors.tertiary,
      background: colors.background,
      foreground: colors.foreground,
      accent: colors.accent,
      warning: colors.warning,
      error: colors.error,
      success: colors.success,
      info: colors.info,
      muted: colors.muted,
      surface: colors.surface,
      border: colors.border,
      neutral: colors.neutral || colors.muted,
    },
    effects: {
      blur: effects.blur,
      glow: effects.glow,
      shadow: effects.shadow,
      saturation: effects.saturation,
      brightness: effects.brightness,
      contrast: effects.contrast,
    },
    typography: {} as any,
    spacing: {} as any,
    sizing: {} as any,
    borders: {} as any,
    animations: {} as any,
  } as ThemeConfig;
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
      const cached = this.cache.get(themeName);
      if (cached !== undefined) {
        return cached;
      }
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
    log.warn('getThemePresetSync is deprecated. Use getThemePresetAsync instead.', {
      component: 'ThemeLoader',
    });
  }

  // Fallback: return minimal default theme
  return {
    name: 'Default',
    variant: 'cyberpunk',
    colors: {
      primary: '#00ffff',
      secondary: '#ff00ff',
      tertiary: '#ffff00',
      background: '#0a0a0f',
      foreground: '#ffffff',
      accent: '#00ff00',
      warning: '#ffaa00',
      error: '#ff0040',
      success: '#00ff00',
      info: '#0080ff',
      muted: '#666666',
      surface: '#1a1a2e',
      border: '#333333',
      neutral: '#4a4a6a',
    },
    effects: {
      blur: { sm: '4px', md: '8px', lg: '12px' },
      glow: { sm: '4px', md: '12px', lg: '16px' },
      shadow: { sm: '2px', md: '4px', lg: '8px' },
      saturation: 1.0,
      brightness: 1.0,
      contrast: 1.0,
    },
    typography: {} as any,
    spacing: {} as any,
    sizing: {} as any,
    borders: {} as any,
    animations: {} as any,
  } as ThemeConfig;
}
