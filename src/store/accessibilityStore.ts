/**
 * Unified Accessibility Store
 *
 * Complete consolidated store managing all accessibility features
 * using direct Zustand implementation for maximum compatibility:
 * - Visual accessibility (contrast, fonts, animations, color blindness)
 * - Cognitive accessibility (simplified UI, confirmations, auto-save)
 * - Input accessibility (keyboard navigation, feedback settings)
 * - Game-specific accessibility features
 * - Cross-domain orchestration and presets
 *
 * This single store replaces the previous 3-store architecture
 * for simplified state management and better performance.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  ACCESSIBILITY_PRESETS,
  type AccessibilityLevel,
  type AccessibilityState,
  type AnimationIntensity,
  type CognitiveAssistance,
  DEFAULT_COGNITIVE_ACCESSIBILITY,
  DEFAULT_INPUT_ACCESSIBILITY,
  DEFAULT_VISUAL_ACCESSIBILITY,
  type FeedbackSettings,
  type FontSizeLevel,
  type KeyboardNavigation,
  type VisualAssistance,
} from '../types/accessibility';
import type { ColorBlindnessType, ContrastLevel } from '../types/tetris';

// System preference detection for visual settings
function detectSystemVisualPreferences(): Partial<AccessibilityStoreState> {
  const preferences: Partial<AccessibilityStoreState> = {};

  if (typeof window !== 'undefined') {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      preferences.reducedMotion = true;
      preferences.animationIntensity = 'reduced';
    }

    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
    if (prefersHighContrast) {
      preferences.contrast = 'high';
      preferences.visual = {
        ...DEFAULT_VISUAL_ACCESSIBILITY.visual,
        highContrast: true,
      };
    }

    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDarkMode) {
      preferences.contrast = 'high';
    }
  }

  return preferences;
}

// Complete accessibility store state interface
// This includes all properties from the three component interfaces
interface AccessibilityStoreState {
  // Core accessibility properties
  level: AccessibilityLevel;
  enabled: boolean;

  // Visual accessibility properties (from VisualAccessibilityState)
  colorBlindnessType: ColorBlindnessType;
  contrast: ContrastLevel;
  fontSize: FontSizeLevel;
  visual: VisualAssistance;
  reducedMotion: boolean;
  animationIntensity: AnimationIntensity;
  respectSystemPreferences: boolean;

  // Cognitive accessibility properties (from CognitiveAccessibilityState)
  cognitive: CognitiveAssistance;
  gameSpecific: {
    pauseOnBlur: boolean;
    visualGameOver: boolean;
    colorCodedPieces: boolean;
    gridLines: boolean;
    dropPreview: boolean;
  };

  // Input accessibility properties (from InputAccessibilityState)
  keyboardNavigation: KeyboardNavigation;
  feedbackSettings: FeedbackSettings;
}

// Store with all actions
interface UnifiedAccessibilityStore extends AccessibilityStoreState {
  // Level management
  setAccessibilityLevel: (level: AccessibilityLevel) => void;

  // Unified state access
  getAccessibilityState: () => AccessibilityState;

  // Cross-domain operations
  applyPreset: (preset: AccessibilityLevel) => void;
  detectAllSystemPreferences: () => void;

  // Visual accessibility methods
  setColorBlindnessType: (type: ColorBlindnessType) => void;
  setContrast: (level: ContrastLevel) => void;
  setFontSize: (size: FontSizeLevel) => void;
  setAnimationIntensity: (intensity: AnimationIntensity) => void;
  updateVisualAssistance: (visual: Partial<VisualAssistance>) => void;

  // Cognitive accessibility methods
  updateCognitiveAssistance: (cognitive: Partial<CognitiveAssistance>) => void;

  // Input accessibility methods
  updateKeyboardNavigation: (keyboard: Partial<KeyboardNavigation>) => void;
  updateFeedbackSettings: (feedback: Partial<FeedbackSettings>) => void;

  // Convenience methods for common operations
  enableAccessibilityMode: () => void;
  enableGamingMode: () => void;
  enableScreenReaderMode: () => void;

  // Base actions
  reset: () => void;
  batchUpdate: (updates: Partial<AccessibilityStoreState>) => void;
}

// Initial state for the store
const INITIAL_ACCESSIBILITY_STATE: AccessibilityStoreState = {
  ...DEFAULT_VISUAL_ACCESSIBILITY,
  ...DEFAULT_COGNITIVE_ACCESSIBILITY,
  ...DEFAULT_INPUT_ACCESSIBILITY,
  level: 'standard',
  enabled: true,
};

// Create the unified accessibility store using direct Zustand
export const useAccessibilityStore = create<UnifiedAccessibilityStore>()(
  persist(
    (set, get) => ({
      ...INITIAL_ACCESSIBILITY_STATE,

      // Level management
      setAccessibilityLevel: (level: AccessibilityLevel) => {
        set((state) => {
          const newState = { ...state, level };
          const presetConfig = ACCESSIBILITY_PRESETS[level];

          if (presetConfig.colorBlindnessType !== undefined)
            newState.colorBlindnessType = presetConfig.colorBlindnessType;
          if (presetConfig.contrast !== undefined) newState.contrast = presetConfig.contrast;
          if (presetConfig.fontSize !== undefined) newState.fontSize = presetConfig.fontSize;
          if (presetConfig.animationIntensity !== undefined)
            newState.animationIntensity = presetConfig.animationIntensity;
          if (presetConfig.reducedMotion !== undefined)
            newState.reducedMotion = presetConfig.reducedMotion;

          return newState;
        });
      },

      // Unified state access
      getAccessibilityState: (): AccessibilityState => {
        const state = get();
        return {
          colorBlindnessType: state.colorBlindnessType,
          contrast: state.contrast,
          fontSize: state.fontSize,
          visual: state.visual,
          reducedMotion: state.reducedMotion,
          animationIntensity: state.animationIntensity,
          respectSystemPreferences: state.respectSystemPreferences,
          cognitive: state.cognitive,
          gameSpecific: state.gameSpecific,
          keyboardNavigation: state.keyboardNavigation,
          feedbackSettings: state.feedbackSettings,
          level: state.level,
          enabled: state.enabled,
        };
      },

      // Cross-domain operations
      applyPreset: (preset: AccessibilityLevel) => {
        const presetConfig = ACCESSIBILITY_PRESETS[preset];
        set((state) => {
          const updates: Partial<AccessibilityStoreState> = {};

          if (presetConfig.colorBlindnessType !== undefined)
            updates.colorBlindnessType = presetConfig.colorBlindnessType;
          if (presetConfig.contrast !== undefined) updates.contrast = presetConfig.contrast;
          if (presetConfig.fontSize !== undefined) updates.fontSize = presetConfig.fontSize;
          if (presetConfig.animationIntensity !== undefined) {
            updates.animationIntensity = presetConfig.animationIntensity;
            updates.reducedMotion =
              presetConfig.animationIntensity === 'none' ||
              presetConfig.animationIntensity === 'reduced';
          }
          if (presetConfig.visual !== undefined) updates.visual = presetConfig.visual;
          if (presetConfig.cognitive !== undefined) updates.cognitive = presetConfig.cognitive;
          if (presetConfig.keyboardNavigation !== undefined)
            updates.keyboardNavigation = presetConfig.keyboardNavigation;
          if (presetConfig.feedbackSettings !== undefined)
            updates.feedbackSettings = presetConfig.feedbackSettings;

          return { ...state, ...updates };
        });
      },

      detectAllSystemPreferences: () => {
        const preferences = detectSystemVisualPreferences();
        set((state) => ({ ...state, ...preferences }));
      },

      // Visual accessibility methods
      setColorBlindnessType: (type: ColorBlindnessType) =>
        set((state) => ({ ...state, colorBlindnessType: type })),

      setContrast: (level: ContrastLevel) => set((state) => ({ ...state, contrast: level })),

      setFontSize: (size: FontSizeLevel) => set((state) => ({ ...state, fontSize: size })),

      setAnimationIntensity: (intensity: AnimationIntensity) => {
        set((state) => ({
          ...state,
          animationIntensity: intensity,
          reducedMotion: intensity === 'none' || intensity === 'reduced',
        }));
      },

      updateVisualAssistance: (visual: Partial<VisualAssistance>) =>
        set((state) => ({
          ...state,
          visual: { ...state.visual, ...visual },
        })),

      // Cognitive accessibility methods
      updateCognitiveAssistance: (cognitive: Partial<CognitiveAssistance>) =>
        set((state) => ({
          ...state,
          cognitive: { ...state.cognitive, ...cognitive },
        })),

      // Input accessibility methods
      updateKeyboardNavigation: (keyboard: Partial<KeyboardNavigation>) =>
        set((state) => ({
          ...state,
          keyboardNavigation: { ...state.keyboardNavigation, ...keyboard },
        })),

      updateFeedbackSettings: (feedback: Partial<FeedbackSettings>) =>
        set((state) => ({
          ...state,
          feedbackSettings: { ...state.feedbackSettings, ...feedback },
        })),

      // Convenience methods for common operations
      enableAccessibilityMode: () => {
        set((state) => ({
          ...state,
          enabled: true,
          level: 'enhanced',
          visual: {
            ...state.visual,
            highContrast: true,
            largeText: true,
          },
          cognitive: {
            ...state.cognitive,
            simplifiedUI: true,
            confirmActions: true,
          },
        }));
      },

      enableGamingMode: () => {
        set((state) => ({
          ...state,
          enabled: true,
          level: 'standard',
          reducedMotion: false,
          animationIntensity: 'normal',
          cognitive: {
            ...state.cognitive,
            pauseOnFocusLoss: false,
            autoSave: true,
          },
        }));
      },

      enableScreenReaderMode: () => {
        set((state) => ({
          ...state,
          enabled: true,
          level: 'enhanced',
          visual: {
            ...state.visual,
            highContrast: true,
            largeText: true,
          },
          cognitive: {
            ...state.cognitive,
            simplifiedUI: true,
            timeoutWarnings: true,
          },
          keyboardNavigation: {
            ...state.keyboardNavigation,
            enabled: true,
            skipLinks: true,
          },
        }));
      },

      // Base actions
      reset: () => set(() => ({ ...INITIAL_ACCESSIBILITY_STATE })),

      batchUpdate: (updates: Partial<AccessibilityStoreState>) =>
        set((state) => ({ ...state, ...updates })),
    }),
    {
      name: 'accessibility-storage',
      version: 1,
    }
  )
);

// Export hooks for specific accessibility features
export const useVisualAccessibility = () =>
  useAccessibilityStore((state) => ({
    colorBlindnessType: state.colorBlindnessType,
    contrast: state.contrast,
    fontSize: state.fontSize,
    animationIntensity: state.animationIntensity,
    reducedMotion: state.reducedMotion,
    visual: state.visual,
    setColorBlindnessType: state.setColorBlindnessType,
    setContrast: state.setContrast,
    setFontSize: state.setFontSize,
    setAnimationIntensity: state.setAnimationIntensity,
    updateVisualAssistance: state.updateVisualAssistance,
  }));

export const useCognitiveAccessibility = () =>
  useAccessibilityStore((state) => ({
    cognitive: state.cognitive,
    updateCognitiveAssistance: state.updateCognitiveAssistance,
  }));

export const useInputAccessibility = () =>
  useAccessibilityStore((state) => ({
    keyboardNavigation: state.keyboardNavigation,
    feedbackSettings: state.feedbackSettings,
    updateKeyboardNavigation: state.updateKeyboardNavigation,
    updateFeedbackSettings: state.updateFeedbackSettings,
  }));

export const useAccessibilityLevel = () =>
  useAccessibilityStore((state) => ({
    level: state.level,
    enabled: state.enabled,
    setAccessibilityLevel: state.setAccessibilityLevel,
    applyPreset: state.applyPreset,
  }));

// Legacy exports for backward compatibility
export const useAccessibility = useAccessibilityStore;
