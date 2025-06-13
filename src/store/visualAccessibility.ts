/**
 * Visual Accessibility Store
 *
 * Focused store for visual assistance features including:
 * - Color blindness support
 * - Contrast adjustments
 * - Font size management
 * - Animation and motion controls
 */

import { create } from 'zustand';
import { type PersistOptions, persist } from 'zustand/middleware';
import {
  type AnimationIntensity,
  DEFAULT_VISUAL_ACCESSIBILITY,
  type FontSizeLevel,
  type VisualAccessibilityActions,
  type VisualAccessibilityState,
  type VisualAssistance,
} from '../types/accessibility';
import type { ColorBlindnessType, ContrastLevel } from '../types/tetris';

// System preference detection for visual settings
function detectSystemVisualPreferences(): Partial<VisualAccessibilityState> {
  const preferences: Partial<VisualAccessibilityState> = {};

  if (typeof window !== 'undefined') {
    // Reduced motion detection
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      preferences.reducedMotion = true;
      preferences.animationIntensity = 'reduced';
    }

    // High contrast detection
    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
    if (prefersHighContrast) {
      preferences.contrast = 'high';
      preferences.visual = {
        ...DEFAULT_VISUAL_ACCESSIBILITY.visual,
        highContrast: true,
      };
    }

    // Color scheme detection (affects contrast preference)
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDarkMode) {
      preferences.contrast = 'high';
    }
  }

  return preferences;
}

// Visual accessibility store interface
interface VisualAccessibilityStore extends VisualAccessibilityState, VisualAccessibilityActions {
  // System integration
  detectSystemPreferences: () => void;

  // Bulk updates
  updateVisualState: (updates: Partial<VisualAccessibilityState>) => void;

  // Reset functionality
  resetToDefaults: () => void;
}

// Create the visual accessibility store
export const useVisualAccessibilityStore = create<VisualAccessibilityStore>()(
  persist(
    (set) => ({
      // Initial state
      ...DEFAULT_VISUAL_ACCESSIBILITY,

      // Color blindness support
      setColorBlindnessType: (type: ColorBlindnessType) =>
        set((state) => ({ ...state, colorBlindnessType: type })),

      // Contrast management
      setContrast: (level: ContrastLevel) => set((state) => ({ ...state, contrast: level })),

      // Font size control
      setFontSize: (size: FontSizeLevel) => set((state) => ({ ...state, fontSize: size })),

      // Animation intensity
      setAnimationIntensity: (intensity: AnimationIntensity) =>
        set((state) => ({
          ...state,
          animationIntensity: intensity,
          reducedMotion: intensity === 'none' || intensity === 'reduced',
        })),

      // Visual assistance features
      updateVisualAssistance: (visual: Partial<VisualAssistance>) =>
        set((state) => ({
          ...state,
          visual: { ...state.visual, ...visual },
        })),

      // High contrast toggle
      toggleHighContrast: () =>
        set((state) => ({
          ...state,
          visual: {
            ...state.visual,
            highContrast: !state.visual.highContrast,
          },
          // Automatically adjust contrast level when toggling
          contrast: !state.visual.highContrast ? 'high' : 'normal',
        })),

      // Large text toggle
      toggleLargeText: () =>
        set((state) => ({
          ...state,
          visual: {
            ...state.visual,
            largeText: !state.visual.largeText,
          },
          // Automatically adjust font size when toggling
          fontSize: !state.visual.largeText ? 'large' : 'normal',
        })),

      // Reduced motion toggle
      toggleReducedMotion: () =>
        set((state) => ({
          ...state,
          reducedMotion: !state.reducedMotion,
          animationIntensity: !state.reducedMotion ? 'reduced' : 'normal',
        })),

      // System preferences detection
      detectSystemPreferences: () => {
        const detected = detectSystemVisualPreferences();
        if (Object.keys(detected).length > 0) {
          set((state) => ({ ...state, ...detected }));
        }
      },

      // Bulk state updates
      updateVisualState: (updates: Partial<VisualAccessibilityState>) =>
        set((state) => ({ ...state, ...updates })),

      // Reset to defaults
      resetToDefaults: () => set(() => ({ ...DEFAULT_VISUAL_ACCESSIBILITY })),
    }),
    {
      name: 'tetris-visual-accessibility',
      partialize: (state) => ({
        colorBlindnessType: state.colorBlindnessType,
        contrast: state.contrast,
        fontSize: state.fontSize,
        visual: state.visual,
        animationIntensity: state.animationIntensity,
        reducedMotion: state.reducedMotion,
        respectSystemPreferences: state.respectSystemPreferences,
      }),
      onRehydrateStorage: () => (state) => {
        // Detect system preferences on store rehydration
        if (state?.respectSystemPreferences) {
          state.detectSystemPreferences();
        }
      },
    } as PersistOptions<VisualAccessibilityStore, Partial<VisualAccessibilityState>>
  )
);

// Optimized selector hooks for visual accessibility
export const useVisualAccessibilityState = () =>
  useVisualAccessibilityStore((state) => ({
    colorBlindnessType: state.colorBlindnessType,
    contrast: state.contrast,
    fontSize: state.fontSize,
    visual: state.visual,
    animationIntensity: state.animationIntensity,
    reducedMotion: state.reducedMotion,
  }));

export const useColorBlindnessType = () =>
  useVisualAccessibilityStore((state) => state.colorBlindnessType);

export const useContrastLevel = () => useVisualAccessibilityStore((state) => state.contrast);

export const useFontSizeLevel = () => useVisualAccessibilityStore((state) => state.fontSize);

export const useVisualAssistance = () => useVisualAccessibilityStore((state) => state.visual);

export const useAnimationSettings = () =>
  useVisualAccessibilityStore((state) => ({
    animationIntensity: state.animationIntensity,
    reducedMotion: state.reducedMotion,
  }));

// Action hooks for stable references
export const useSetColorBlindnessType = () =>
  useVisualAccessibilityStore((state) => state.setColorBlindnessType);

export const useSetContrast = () => useVisualAccessibilityStore((state) => state.setContrast);

export const useSetFontSize = () => useVisualAccessibilityStore((state) => state.setFontSize);

export const useSetAnimationIntensity = () =>
  useVisualAccessibilityStore((state) => state.setAnimationIntensity);

export const useUpdateVisualAssistance = () =>
  useVisualAccessibilityStore((state) => state.updateVisualAssistance);

export const useToggleHighContrast = () =>
  useVisualAccessibilityStore((state) => state.toggleHighContrast);

export const useToggleLargeText = () =>
  useVisualAccessibilityStore((state) => state.toggleLargeText);

export const useToggleReducedMotion = () =>
  useVisualAccessibilityStore((state) => state.toggleReducedMotion);

export const useDetectSystemVisualPreferences = () =>
  useVisualAccessibilityStore((state) => state.detectSystemPreferences);
