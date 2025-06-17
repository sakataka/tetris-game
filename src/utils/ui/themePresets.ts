import type {
  ColorBlindnessType,
  ContrastLevel,
  ThemeConfig,
  ThemeVariant,
} from '../../types/tetris';
import { ColorConverter } from './colorConverter';

// Preset color palettes
export const COLOR_PALETTES: Record<ThemeVariant, any> = {
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
  blur: { sm: '4px', md: '8px', lg: '12px' },
  glow: { sm: '4px', md: '8px', lg: '12px' },
  shadow: { sm: '2px', md: '4px', lg: '8px' },
  saturation: 1.0,
  brightness: 1.0,
  contrast: 1.0,
};

// Theme-specific effect settings
export const THEME_EFFECTS: Record<ThemeVariant, typeof DEFAULT_EFFECTS> = {
  cyberpunk: {
    blur: { sm: '6px', md: '10px', lg: '16px' },
    glow: { sm: '8px', md: '16px', lg: '24px' },
    shadow: { sm: '4px', md: '8px', lg: '12px' },
    saturation: 1.8,
    brightness: 1.2,
    contrast: 1.1,
  },
  classic: {
    blur: { sm: '0px', md: '0px', lg: '0px' },
    glow: { sm: '0px', md: '0px', lg: '0px' },
    shadow: { sm: '1px', md: '2px', lg: '3px' },
    saturation: 0.8,
    brightness: 0.9,
    contrast: 1.0,
  },
  retro: {
    blur: { sm: '3px', md: '6px', lg: '8px' },
    glow: { sm: '4px', md: '8px', lg: '12px' },
    shadow: { sm: '2px', md: '4px', lg: '6px' },
    saturation: 1.5,
    brightness: 1.1,
    contrast: 1.05,
  },
  minimal: {
    blur: { sm: '1px', md: '2px', lg: '4px' },
    glow: { sm: '2px', md: '4px', lg: '6px' },
    shadow: { sm: '1px', md: '2px', lg: '3px' },
    saturation: 0.6,
    brightness: 0.95,
    contrast: 0.95,
  },
  neon: {
    blur: { sm: '8px', md: '12px', lg: '20px' },
    glow: { sm: '12px', md: '20px', lg: '32px' },
    shadow: { sm: '6px', md: '12px', lg: '18px' },
    saturation: 2.0,
    brightness: 1.3,
    contrast: 1.2,
  },
};

// Preset theme configurations
export const THEME_PRESETS: Record<ThemeVariant, any> = {
  cyberpunk: {
    name: 'Cyberpunk',
    colors: COLOR_PALETTES.cyberpunk,
    effects: THEME_EFFECTS.cyberpunk,
  },
  classic: {
    name: 'Classic',
    colors: COLOR_PALETTES.classic,
    effects: THEME_EFFECTS.classic,
  },
  retro: {
    name: 'Retro',
    colors: COLOR_PALETTES.retro,
    effects: THEME_EFFECTS.retro,
  },
  minimal: {
    name: 'Minimal',
    colors: COLOR_PALETTES.minimal,
    effects: THEME_EFFECTS.minimal,
  },
  neon: {
    name: 'Neon',
    colors: COLOR_PALETTES.neon,
    effects: THEME_EFFECTS.neon,
  },
};

// Color blindness adaptation palettes
export const COLOR_BLIND_PALETTES: Record<
  Exclude<ColorBlindnessType, 'none'>,
  Partial<any>
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
