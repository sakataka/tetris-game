import {
  ThemeConfig,
  ColorPalette,
  ThemeVariant,
  ColorBlindnessType,
  ContrastLevel,
} from '../../types/tetris';
import { ColorConverter } from './colorConverter';

// Preset color palettes
export const COLOR_PALETTES: Record<ThemeVariant, ColorPalette> = {
  cyberpunk: {
    primary: '#00ffff',
    secondary: '#ff00ff',
    tertiary: '#ffff00',
    background: '#0a0a0f',
    foreground: '#ffffff',
    accent: '#00ff00',
  },
  classic: {
    primary: '#0066cc',
    secondary: '#cc6600',
    tertiary: '#006600',
    background: '#f5f5f5',
    foreground: '#333333',
    accent: '#cc0000',
  },
  retro: {
    primary: '#ff6b35',
    secondary: '#f7931e',
    tertiary: '#ffd23f',
    background: '#2d1b69',
    foreground: '#ffffff',
    accent: '#ee4266',
  },
  minimal: {
    primary: '#2c3e50',
    secondary: '#34495e',
    tertiary: '#7f8c8d',
    background: '#ecf0f1',
    foreground: '#2c3e50',
    accent: '#3498db',
  },
  neon: {
    primary: '#ff0080',
    secondary: '#00ff80',
    tertiary: '#8000ff',
    background: '#000000',
    foreground: '#ffffff',
    accent: '#ffff00',
  },
};

// Default effect settings
export const DEFAULT_EFFECTS = {
  blur: 8,
  glow: 12,
  saturation: 1.0,
  brightness: 1.0,
};

// Theme-specific effect settings
export const THEME_EFFECTS: Record<ThemeVariant, typeof DEFAULT_EFFECTS> = {
  cyberpunk: {
    blur: 10,
    glow: 16,
    saturation: 1.8,
    brightness: 1.2,
  },
  classic: {
    blur: 0,
    glow: 0,
    saturation: 0.8,
    brightness: 0.9,
  },
  retro: {
    blur: 6,
    glow: 8,
    saturation: 1.5,
    brightness: 1.1,
  },
  minimal: {
    blur: 2,
    glow: 4,
    saturation: 0.6,
    brightness: 0.95,
  },
  neon: {
    blur: 12,
    glow: 20,
    saturation: 2.0,
    brightness: 1.3,
  },
};

// Preset theme configurations
export const THEME_PRESETS: Record<ThemeVariant, ThemeConfig> = {
  cyberpunk: {
    name: 'Cyberpunk',
    colors: COLOR_PALETTES.cyberpunk,
    effects: THEME_EFFECTS.cyberpunk,
    accessibility: {
      colorBlindnessType: 'none',
      contrast: 'normal',
      animationIntensity: 'enhanced',
    },
  },
  classic: {
    name: 'Classic',
    colors: COLOR_PALETTES.classic,
    effects: THEME_EFFECTS.classic,
    accessibility: {
      colorBlindnessType: 'none',
      contrast: 'high',
      animationIntensity: 'reduced',
    },
  },
  retro: {
    name: 'Retro',
    colors: COLOR_PALETTES.retro,
    effects: THEME_EFFECTS.retro,
    accessibility: {
      colorBlindnessType: 'none',
      contrast: 'normal',
      animationIntensity: 'normal',
    },
  },
  minimal: {
    name: 'Minimal',
    colors: COLOR_PALETTES.minimal,
    effects: THEME_EFFECTS.minimal,
    accessibility: {
      colorBlindnessType: 'none',
      contrast: 'high',
      animationIntensity: 'reduced',
    },
  },
  neon: {
    name: 'Neon',
    colors: COLOR_PALETTES.neon,
    effects: THEME_EFFECTS.neon,
    accessibility: {
      colorBlindnessType: 'none',
      contrast: 'normal',
      animationIntensity: 'enhanced',
    },
  },
};

// Color blindness adaptation palettes
export const COLOR_BLIND_PALETTES: Record<
  Exclude<ColorBlindnessType, 'none'>,
  Partial<ColorPalette>
> = {
  protanopia: {
    primary: '#0080ff',
    secondary: '#ffaa00',
    tertiary: '#8000ff',
  },
  deuteranopia: {
    primary: '#0066cc',
    secondary: '#ff6600',
    tertiary: '#cc00cc',
  },
  tritanopia: {
    primary: '#ff0066',
    secondary: '#66ff00',
    tertiary: '#6600ff',
  },
};

// Contrast adjustment function
export function adjustColorContrast(color: string, level: ContrastLevel): string {
  const adjustments = {
    low: 0.7,
    normal: 1.0,
    high: 1.3,
  };

  const adjustment = adjustments[level];
  if (adjustment === 1.0) return color;

  return ColorConverter.adjustContrast(color, adjustment);
}

/**
 * Get theme preset configuration
 */
export function getThemePreset(theme: ThemeVariant): ThemeConfig {
  return THEME_PRESETS[theme];
}

// Animation intensity settings
export const ANIMATION_SETTINGS = {
  none: {
    duration: 0,
    enabled: false,
    particles: false,
    effects: false,
  },
  reduced: {
    duration: 0.3,
    enabled: true,
    particles: false,
    effects: false,
  },
  normal: {
    duration: 0.6,
    enabled: true,
    particles: true,
    effects: true,
  },
  enhanced: {
    duration: 1.0,
    enabled: true,
    particles: true,
    effects: true,
  },
};
