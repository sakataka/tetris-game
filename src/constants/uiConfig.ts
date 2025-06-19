/**
 * UI Configuration System
 *
 * Provides runtime configurable UI constants with responsive design
 * and theme management for different screen sizes and user preferences.
 */

import { DEFAULT_VALUES } from './defaults';

export interface UIConfiguration {
  // Layout dimensions
  layout: {
    boardWidth: number;
    boardHeight: number;
    cellSize: number;
    virtualButtonSize: number;
    minScreenWidth: number;
  };

  // Responsive breakpoints
  breakpoints: {
    mobile: number;
    tablet: number;
    desktop: number;
  };

  // Animation and effects
  effects: {
    flashDuration: number;
    shakeDuration: number;
    resetDelay: number;
    animationDuration: string;
    transitionDuration: string;
    touchDelay: number;
  };

  // Typography system
  typography: {
    baseFontSize: number;
    fontScaleRatio: number;
    lineHeight: number;
    fontWeights: {
      normal: number;
      medium: number;
      bold: number;
    };
  };

  // Spacing system (8-point grid)
  spacing: {
    baseUnit: number; // 8px base unit
    scaleFactors: {
      xs: number; // 0.5x = 4px
      sm: number; // 1x = 8px
      md: number; // 2x = 16px
      lg: number; // 3x = 24px
      xl: number; // 4x = 32px
      xxl: number; // 6x = 48px
    };
  };

  // Theme configuration
  theme: {
    defaultVolume: number;
    defaultEffectIntensity: number;
    neonBlurSizes: {
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
  };

  // Accessibility preferences
  accessibility: {
    focusRingWidth: number;
    minTouchTargetSize: number;
    highContrastMode: boolean;
    reducedMotion: boolean;
    largeText: boolean;
  };
}

// Default UI configuration
export const DEFAULT_UI_CONFIG: UIConfiguration = {
  layout: {
    boardWidth: 10,
    boardHeight: 20,
    cellSize: 24,
    virtualButtonSize: 48,
    minScreenWidth: 320,
  },

  breakpoints: {
    mobile: 768,
    tablet: 1024,
    desktop: 1280,
  },

  effects: {
    flashDuration: 80,
    shakeDuration: 80,
    resetDelay: 300,
    animationDuration: '0.3s',
    transitionDuration: '0.2s',
    touchDelay: DEFAULT_VALUES.AUDIO.THROTTLE_MS,
  },

  typography: {
    baseFontSize: 14,
    fontScaleRatio: 1.25,
    lineHeight: 1.5,
    fontWeights: {
      normal: 400,
      medium: 500,
      bold: 700,
    },
  },

  spacing: {
    baseUnit: 8,
    scaleFactors: {
      xs: 0.5, // 4px
      sm: 1, // 8px
      md: 2, // 16px
      lg: 3, // 24px
      xl: 4, // 32px
      xxl: 6, // 48px
    },
  },

  theme: {
    defaultVolume: DEFAULT_VALUES.VOLUME,
    defaultEffectIntensity: DEFAULT_VALUES.EFFECT_INTENSITY.DEFAULT,
    neonBlurSizes: {
      sm: '4px',
      md: '8px',
      lg: '12px',
      xl: '16px',
    },
  },

  accessibility: {
    focusRingWidth: 2,
    minTouchTargetSize: 44, // WCAG recommendation
    highContrastMode: false,
    reducedMotion: false,
    largeText: false,
  },
} as const;

// Device-specific presets
export const DEVICE_PRESETS = {
  mobile: {
    ...DEFAULT_UI_CONFIG,
    layout: {
      ...DEFAULT_UI_CONFIG.layout,
      cellSize: 20,
      virtualButtonSize: 56,
    },
    effects: {
      ...DEFAULT_UI_CONFIG.effects,
      touchDelay: 120,
    },
    typography: {
      ...DEFAULT_UI_CONFIG.typography,
      baseFontSize: 16,
    },
  } as UIConfiguration,

  tablet: {
    ...DEFAULT_UI_CONFIG,
    layout: {
      ...DEFAULT_UI_CONFIG.layout,
      cellSize: 26,
      virtualButtonSize: 52,
    },
    typography: {
      ...DEFAULT_UI_CONFIG.typography,
      baseFontSize: 15,
    },
  } as UIConfiguration,

  desktop: DEFAULT_UI_CONFIG,

  accessibility: {
    ...DEFAULT_UI_CONFIG,
    layout: {
      ...DEFAULT_UI_CONFIG.layout,
      cellSize: 28,
      virtualButtonSize: 56,
    },
    typography: {
      ...DEFAULT_UI_CONFIG.typography,
      baseFontSize: 16,
      fontScaleRatio: 1.3,
    },
    spacing: {
      ...DEFAULT_UI_CONFIG.spacing,
      scaleFactors: {
        xs: 0.75,
        sm: 1.5,
        md: 2.5,
        lg: 3.5,
        xl: 4.5,
        xxl: 7,
      },
    },
    accessibility: {
      ...DEFAULT_UI_CONFIG.accessibility,
      focusRingWidth: 3,
      minTouchTargetSize: 48,
      highContrastMode: true,
      largeText: true,
    },
  } as UIConfiguration,
} as const;

export type DevicePreset = keyof typeof DEVICE_PRESETS;

// Configuration validation
export function validateUIConfig(config: Partial<UIConfiguration>): string[] {
  const errors: string[] = [];

  if (config.layout) {
    const { layout } = config;
    if (layout.cellSize !== undefined && layout.cellSize < 8) {
      errors.push('Cell size must be at least 8 pixels');
    }
    if (layout.virtualButtonSize !== undefined && layout.virtualButtonSize < 32) {
      errors.push('Virtual button size must be at least 32 pixels');
    }
  }

  if (config.breakpoints) {
    const { breakpoints } = config;
    if (
      breakpoints.mobile !== undefined &&
      breakpoints.tablet !== undefined &&
      breakpoints.mobile >= breakpoints.tablet
    ) {
      errors.push('Tablet breakpoint must be larger than mobile breakpoint');
    }
  }

  if (config.typography) {
    const { typography } = config;
    if (typography.baseFontSize !== undefined && typography.baseFontSize < 10) {
      errors.push('Base font size must be at least 10 pixels');
    }
    if (typography.fontScaleRatio !== undefined && typography.fontScaleRatio <= 1) {
      errors.push('Font scale ratio must be greater than 1');
    }
  }

  if (config.accessibility) {
    const { accessibility } = config;
    if (accessibility.minTouchTargetSize !== undefined && accessibility.minTouchTargetSize < 32) {
      errors.push(
        'Minimum touch target size should be at least 32 pixels (WCAG recommendation is 44px)'
      );
    }
  }

  return errors;
}

// Configuration merger with validation
export function mergeUIConfig(
  base: UIConfiguration,
  override: Partial<UIConfiguration>
): UIConfiguration {
  const errors = validateUIConfig(override);
  if (errors.length > 0) {
    throw new Error(`Invalid UI configuration: ${errors.join(', ')}`);
  }

  return {
    layout: { ...base.layout, ...override.layout },
    breakpoints: { ...base.breakpoints, ...override.breakpoints },
    effects: { ...base.effects, ...override.effects },
    typography: { ...base.typography, ...override.typography },
    spacing: { ...base.spacing, ...override.spacing },
    theme: { ...base.theme, ...override.theme },
    accessibility: { ...base.accessibility, ...override.accessibility },
  };
}

// Computed UI values based on configuration
export function computeUIValues(config: UIConfiguration) {
  const { spacing, typography } = config;

  return {
    // Computed spacing values
    spacing: {
      xs: spacing.baseUnit * spacing.scaleFactors.xs,
      sm: spacing.baseUnit * spacing.scaleFactors.sm,
      md: spacing.baseUnit * spacing.scaleFactors.md,
      lg: spacing.baseUnit * spacing.scaleFactors.lg,
      xl: spacing.baseUnit * spacing.scaleFactors.xl,
      xxl: spacing.baseUnit * spacing.scaleFactors.xxl,
    },

    // Computed typography values
    typography: {
      sizes: {
        xs: typography.baseFontSize * 0.75,
        sm: typography.baseFontSize * 0.875,
        base: typography.baseFontSize,
        lg: typography.baseFontSize * typography.fontScaleRatio,
        xl: typography.baseFontSize * typography.fontScaleRatio ** 2,
        '2xl': typography.baseFontSize * typography.fontScaleRatio ** 3,
      },
    },

    // Media queries
    mediaQueries: {
      mobile: `(max-width: ${config.breakpoints.mobile - 1}px)`,
      tablet: `(min-width: ${config.breakpoints.mobile}px) and (max-width: ${config.breakpoints.tablet - 1}px)`,
      desktop: `(min-width: ${config.breakpoints.tablet}px)`,
    },
  };
}

// Runtime UI configuration management
class UIConfigManager {
  private currentConfig: UIConfiguration = DEFAULT_UI_CONFIG;
  private listeners: ((config: UIConfiguration) => void)[] = [];

  getConfig(): UIConfiguration {
    return this.currentConfig;
  }

  setConfig(config: Partial<UIConfiguration>): void {
    this.currentConfig = mergeUIConfig(this.currentConfig, config);
    this.notifyListeners();
  }

  setPreset(preset: DevicePreset): void {
    this.currentConfig = DEVICE_PRESETS[preset];
    this.notifyListeners();
  }

  resetToDefault(): void {
    this.currentConfig = DEFAULT_UI_CONFIG;
    this.notifyListeners();
  }

  getComputedValues() {
    return computeUIValues(this.currentConfig);
  }

  subscribe(listener: (config: UIConfiguration) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener(this.currentConfig));
  }
}

export const uiConfigManager = new UIConfigManager();

// Export current configuration for backward compatibility
export const UI_CONFIG = uiConfigManager.getConfig();
export const COMPUTED_UI = uiConfigManager.getComputedValues();

// Backward compatibility exports
export const BOARD_WIDTH = UI_CONFIG.layout.boardWidth;
export const BOARD_HEIGHT = UI_CONFIG.layout.boardHeight;

export const EFFECTS = {
  FLASH_DURATION: UI_CONFIG.effects.flashDuration,
  SHAKE_DURATION: UI_CONFIG.effects.shakeDuration,
  RESET_DELAY: UI_CONFIG.effects.resetDelay,
  NEON_BLUR_SM: UI_CONFIG.theme.neonBlurSizes.sm,
  NEON_BLUR_MD: UI_CONFIG.theme.neonBlurSizes.md,
  NEON_BLUR_LG: UI_CONFIG.theme.neonBlurSizes.lg,
  NEON_BLUR_XL: UI_CONFIG.theme.neonBlurSizes.xl,
} as const;

export const BREAKPOINTS = {
  MOBILE_WIDTH: UI_CONFIG.breakpoints.mobile,
  TABLET_WIDTH: UI_CONFIG.breakpoints.tablet,
  DESKTOP_WIDTH: UI_CONFIG.breakpoints.desktop,
} as const;

export const MOBILE_CONFIG = {
  TOUCH_DELAY: UI_CONFIG.effects.touchDelay,
  VIRTUAL_BUTTON_SIZE: UI_CONFIG.layout.virtualButtonSize,
  MIN_SCREEN_WIDTH: UI_CONFIG.layout.minScreenWidth,
  TABLET_BREAKPOINT: UI_CONFIG.breakpoints.mobile,
} as const;

export const THEME_CONFIG = {
  DEFAULT_VOLUME: UI_CONFIG.theme.defaultVolume,
  DEFAULT_EFFECT_INTENSITY: UI_CONFIG.theme.defaultEffectIntensity,
  ANIMATION_DURATION: UI_CONFIG.effects.animationDuration,
  TRANSITION_DURATION: UI_CONFIG.effects.transitionDuration,
} as const;
