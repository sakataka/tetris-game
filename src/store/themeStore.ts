import { create } from 'zustand';
import { 
  ThemeState, 
  ThemeVariant, 
  ColorPalette, 
  ColorBlindnessType, 
  ContrastLevel 
} from '../types/tetris';
import { getThemePreset } from '../utils/themePresets';

// デフォルトテーマ状態
const DEFAULT_THEME_STATE: ThemeState = {
  current: 'cyberpunk' as ThemeVariant,
  effectIntensity: 1.0,
  animations: true,
  config: getThemePreset('cyberpunk'),
  accessibility: {
    colorBlindnessType: 'none' as ColorBlindnessType,
    contrast: 'normal' as ContrastLevel,
    animationIntensity: 'normal',
    reducedMotion: false
  }
};

interface ThemeStore {
  // State
  theme: ThemeState;
  
  // Actions
  setTheme: (theme: ThemeVariant) => void;
  updateThemeState: (themeState: Partial<ThemeState>) => void;
  setCustomColors: (colors: Partial<ColorPalette>) => void;
  setAccessibilityOptions: (accessibility: Partial<ThemeState['accessibility']>) => void;
  resetThemeToDefault: () => void;
  
  // Effect and animation controls
  setEffectIntensity: (intensity: number) => void;
  toggleAnimations: () => void;
}

export const useThemeStore = create<ThemeStore>()((set) => ({
  // Initial state
  theme: DEFAULT_THEME_STATE,
  
  // Actions
  setTheme: (themeVariant) =>
    set((state) => ({
      theme: { 
        ...state.theme, 
        current: themeVariant,
        config: getThemePreset(themeVariant)
      }
    })),
  
  updateThemeState: (themeState) =>
    set((state) => ({
      theme: { ...state.theme, ...themeState }
    })),
  
  setCustomColors: (colors) =>
    set((state) => ({
      theme: {
        ...state.theme,
        config: {
          ...state.theme.config,
          colors: { ...state.theme.config.colors, ...colors }
        },
        customColors: { ...state.theme.customColors, ...colors }
      }
    })),
  
  setAccessibilityOptions: (accessibility) =>
    set((state) => ({
      theme: {
        ...state.theme,
        accessibility: { ...state.theme.accessibility, ...accessibility },
        config: {
          ...state.theme.config,
          accessibility: { ...state.theme.config.accessibility, ...accessibility }
        }
      }
    })),
  
  resetThemeToDefault: () =>
    set(() => ({
      theme: DEFAULT_THEME_STATE
    })),
  
  setEffectIntensity: (intensity) =>
    set((state) => ({
      theme: {
        ...state.theme,
        effectIntensity: Math.max(0, Math.min(2, intensity))
      }
    })),
  
  toggleAnimations: () =>
    set((state) => ({
      theme: {
        ...state.theme,
        animations: !state.theme.animations
      }
    }))
}));

// Selector hooks for optimized access
export const useTheme = () => useThemeStore((state) => state.theme);
export const useThemeConfig = () => useThemeStore((state) => state.theme.config);
export const useThemeAccessibility = () => useThemeStore((state) => state.theme.accessibility);
export const useThemeActions = () => useThemeStore((state) => ({
  setTheme: state.setTheme,
  updateThemeState: state.updateThemeState,
  setCustomColors: state.setCustomColors,
  setAccessibilityOptions: state.setAccessibilityOptions,
  resetThemeToDefault: state.resetThemeToDefault,
  setEffectIntensity: state.setEffectIntensity,
  toggleAnimations: state.toggleAnimations
}));