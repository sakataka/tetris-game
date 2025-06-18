import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ColorBlindnessType, ContrastLevel, ThemeState, ThemeVariant } from '../types/tetris';
import { applyUnifiedThemeToDocument, getUnifiedThemeConfig } from '../utils/ui/unifiedThemeSystem';

// Default theme state
const DEFAULT_THEME_STATE: ThemeState = {
  current: 'cyberpunk' as ThemeVariant,
  effectIntensity: 1.0,
  animations: true,
  config: getUnifiedThemeConfig('cyberpunk'),
  accessibility: {
    colorBlindnessType: 'none' as ColorBlindnessType,
    contrast: 'normal' as ContrastLevel,
    animationIntensity: 'normal',
    reducedMotion: false,
  },
};

interface ThemeStore {
  // State
  theme: ThemeState;

  // Actions
  setTheme: (theme: ThemeVariant) => void;
  updateThemeState: (themeState: Partial<ThemeState>) => void;
  setAccessibilityOptions: (accessibility: Partial<ThemeState['accessibility']>) => void;

  // Effect and animation controls
  setEffectIntensity: (intensity: number) => void;
  toggleAnimations: () => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      // Initial state
      theme: DEFAULT_THEME_STATE,

      // Actions
      setTheme: (themeVariant) => {
        // Apply theme to document immediately
        applyUnifiedThemeToDocument(themeVariant);

        set((state) => ({
          theme: {
            ...state.theme,
            current: themeVariant,
            config: getUnifiedThemeConfig(themeVariant),
          },
        }));
      },

      updateThemeState: (themeState) =>
        set((state) => ({
          theme: { ...state.theme, ...themeState },
        })),

      setAccessibilityOptions: (accessibility) =>
        set((state) => ({
          theme: {
            ...state.theme,
            accessibility: { ...state.theme.accessibility, ...accessibility },
            config: {
              ...state.theme.config,
              accessibility: { ...state.theme.config.accessibility, ...accessibility },
            },
          },
        })),

      setEffectIntensity: (intensity) =>
        set((state) => ({
          theme: {
            ...state.theme,
            effectIntensity: Math.max(0.5, Math.min(1.5, intensity)),
          },
        })),

      toggleAnimations: () =>
        set((state) => ({
          theme: {
            ...state.theme,
            animations: !state.theme.animations,
          },
        })),
    }),
    {
      name: 'tetris-theme-storage',
      version: 1,
      partialize: (state) => ({ theme: state.theme }),
      onRehydrateStorage: () => (state) => {
        if (state?.theme?.current) {
          // Reapply theme on hydration
          applyUnifiedThemeToDocument(state.theme.current);
          console.log('🎨 Theme rehydrated:', state.theme.current);
        } else {
          // Initialize with default theme
          applyUnifiedThemeToDocument('cyberpunk');
        }
      },
    }
  )
);

// Selector hooks for optimized access
export const useTheme = () => useThemeStore((state) => state.theme);
export const useCurrentTheme = () => useThemeStore((state) => state.theme.current);
export const useThemeConfig = () => useThemeStore((state) => state.theme.config);
export const useThemeAccessibility = () => useThemeStore((state) => state.theme.accessibility);

// Individual action hooks (function reference stabilization)
export const useSetTheme = () => useThemeStore((state) => state.setTheme);
export const useUpdateThemeState = () => useThemeStore((state) => state.updateThemeState);
export const useSetAccessibilityOptions = () =>
  useThemeStore((state) => state.setAccessibilityOptions);
export const useSetEffectIntensity = () => useThemeStore((state) => state.setEffectIntensity);
export const useToggleAnimations = () => useThemeStore((state) => state.toggleAnimations);
