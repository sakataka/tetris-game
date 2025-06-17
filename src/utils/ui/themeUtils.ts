import type { ThemeConfig, ThemeVariant } from '../../types/tetris';
import { ColorConverter } from './colorConverter';
import { getCurrentThemeConfig } from './themeManager';

/**
 * Apply theme configuration to CSS variables
 */
export function applyThemeToCSS(config: ThemeConfig): void {
  const root = document.documentElement;

  // Basic color configuration
  root.style.setProperty('--background', config.colors.background);
  root.style.setProperty('--foreground', config.colors.foreground);
  root.style.setProperty('--accent-primary', config.colors.primary);
  root.style.setProperty('--accent-secondary', config.colors.secondary);
  root.style.setProperty('--accent-tertiary', config.colors.tertiary);

  // Theme semantic colors
  root.style.setProperty('--theme-primary', config.colors.primary);
  root.style.setProperty('--theme-secondary', config.colors.secondary);
  root.style.setProperty('--theme-tertiary', config.colors.tertiary);
  root.style.setProperty('--theme-accent', config.colors.accent);
  root.style.setProperty('--theme-foreground', config.colors.foreground);
  root.style.setProperty('--theme-background', config.colors.background);
  root.style.setProperty('--theme-warning', config.colors.warning);
  root.style.setProperty('--theme-error', config.colors.error);
  root.style.setProperty('--theme-success', config.colors.success);
  root.style.setProperty('--theme-muted', config.colors.muted);
  root.style.setProperty('--theme-surface', config.colors.surface);
  root.style.setProperty('--theme-border', config.colors.border);

  // Cyberpunk color palette (backward compatibility)
  root.style.setProperty('--cyber-cyan', config.colors.primary);
  root.style.setProperty('--cyber-purple', config.colors.secondary);
  root.style.setProperty('--cyber-yellow', config.colors.tertiary);
  root.style.setProperty('--cyber-green', config.colors.accent);

  // Auto-generate transparency variations
  const transparencyVariables = generateTransparencyVariables(config.colors);
  Object.entries(transparencyVariables).forEach(([varName, value]) => {
    root.style.setProperty(varName, value);
  });

  // Effect configuration (using any type to handle mixed structure)
  const effects = config.effects as any;
  if (effects && typeof effects.blur === 'number') {
    root.style.setProperty('--neon-blur-sm', `${effects.blur * 0.5}px`);
    root.style.setProperty('--neon-blur-md', `${effects.blur}px`);
    root.style.setProperty('--neon-blur-lg', `${effects.blur * 1.5}px`);
    root.style.setProperty('--neon-blur-xl', `${effects.blur * 2}px`);
  }

  // Dynamically generate hologram background
  const hologramBg =
    'linear-gradient(45deg, var(--cyber-cyan-10) 0%, var(--cyber-purple-10) 50%, var(--cyber-yellow-10) 100%)';
  root.style.setProperty('--hologram-bg', hologramBg);
  root.style.setProperty('--hologram-border', '1px solid var(--cyber-cyan-30)');
}

/**
 * Transparency variation levels
 */
const TRANSPARENCY_LEVELS = [10, 20, 30, 40, 50, 60, 70, 80, 90] as const;

/**
 * Color name mapping for transparency generation
 */
const COLOR_NAME_MAPPING = {
  primary: 'cyan',
  secondary: 'purple',
  tertiary: 'yellow',
  accent: 'green',
  warning: 'warning',
  error: 'error',
  success: 'success',
  info: 'info',
  muted: 'muted',
} as const;

/**
 * Theme color mapping for CSS variables
 */
const THEME_COLOR_MAPPING = {
  primary: 'primary',
  secondary: 'secondary',
  tertiary: 'tertiary',
  accent: 'accent',
  warning: 'warning',
  error: 'error',
  success: 'success',
  info: 'info',
  muted: 'muted',
} as const;

/**
 * Generate transparency variations using ColorConverter
 */
function generateTransparencyVariables(colors: any): Record<string, string> {
  const variables: Record<string, string> = {};

  // Generate legacy cyber-* transparency variables
  Object.entries(COLOR_NAME_MAPPING).forEach(([colorKey, cssName]) => {
    const hexColor = colors[colorKey];
    if (hexColor) {
      const transparencies = ColorConverter.generateTransparencies(hexColor, TRANSPARENCY_LEVELS);

      Object.entries(transparencies).forEach(([level, rgba]) => {
        const varName = `--cyber-${cssName}-${level}`;
        variables[varName] = rgba;
      });
    }
  });

  // Generate theme-* transparency variables
  Object.entries(THEME_COLOR_MAPPING).forEach(([colorKey, cssName]) => {
    const hexColor = colors[colorKey];
    if (hexColor) {
      const transparencies = ColorConverter.generateTransparencies(hexColor, TRANSPARENCY_LEVELS);

      Object.entries(transparencies).forEach(([level, rgba]) => {
        const varName = `--theme-${cssName}-${level}`;
        variables[varName] = rgba;
      });
    }
  });

  return variables;
}

// Removed: hexToRgb function replaced by ColorConverter.hexToRgb

// Removed: adjustColorBrightness function replaced by ColorConverter methods

// getThemePreset is imported from ./themePresets

/**
 * Create custom theme configuration
 */
export function createCustomTheme(
  baseTheme: ThemeVariant,
  customColors?: any,
  customEffects?: any
): ThemeConfig {
  const baseConfig = getCurrentThemeConfig(baseTheme);

  return {
    ...baseConfig,
    name: 'Custom',
    colors: {
      ...baseConfig.colors,
      ...customColors,
    },
    effects: {
      ...(baseConfig.effects || {}),
      ...(customEffects || {}),
    },
  };
}

/**
 * Apply animation settings to CSS
 */
export function applyAnimationSettings(intensity: string): void {
  const root = document.documentElement;

  switch (intensity) {
    case 'none':
      root.style.setProperty('--animation-duration', '0s');
      root.style.setProperty('--particle-enabled', '0');
      break;
    case 'reduced':
      root.style.setProperty('--animation-duration', '0.3s');
      root.style.setProperty('--particle-enabled', '0');
      break;
    case 'normal':
      root.style.setProperty('--animation-duration', '0.6s');
      root.style.setProperty('--particle-enabled', '1');
      break;
    case 'enhanced':
      root.style.setProperty('--animation-duration', '1s');
      root.style.setProperty('--particle-enabled', '1');
      break;
  }
}

/**
 * Initialize theme configuration
 */
export function initializeTheme(config: ThemeConfig): void {
  applyThemeToCSS(config);

  // Handle accessibility settings if available
  const accessibility = (config as any).accessibility;
  if (accessibility && accessibility.animationIntensity) {
    applyAnimationSettings(accessibility.animationIntensity);

    // Configure reduced motion preferences
    if (
      accessibility.animationIntensity === 'none' ||
      accessibility.animationIntensity === 'reduced'
    ) {
      document.body.classList.add('reduce-motion');
    } else {
      document.body.classList.remove('reduce-motion');
    }
  }
}
