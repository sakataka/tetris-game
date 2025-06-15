/**
 * Unified Accessibility Store
 *
 * Consolidated store managing all accessibility features:
 * - Visual accessibility (contrast, fonts, animations, color blindness)
 * - Basic level management and coordination with specialized stores
 *
 * Integrates visual accessibility features directly while coordinating
 * with specialized cognitive and input accessibility stores.
 */

import { create } from 'zustand';
import { type PersistOptions, persist } from 'zustand/middleware';
import {
  ACCESSIBILITY_PRESETS,
  type AccessibilityLevel,
  type AccessibilityState,
  type AnimationIntensity,
  DEFAULT_VISUAL_ACCESSIBILITY,
  type FontSizeLevel,
  type VisualAccessibilityActions,
  type VisualAccessibilityState,
  type VisualAssistance,
} from '../types/accessibility';
import type { ColorBlindnessType, ContrastLevel } from '../types/tetris';

import { useSpecializedAccessibilityStore } from './specializedAccessibility';

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

// Unified accessibility store interface - includes visual features + coordination
interface UnifiedAccessibilityStore extends VisualAccessibilityState, VisualAccessibilityActions {
  // Core orchestration state
  level: AccessibilityLevel;
  enabled: boolean;

  // Level management
  setAccessibilityLevel: (level: AccessibilityLevel) => void;
  toggleAccessibility: () => void;

  // Unified state access (computed from all stores)
  getAccessibilityState: () => AccessibilityState;

  // Cross-store operations
  applyPreset: (preset: AccessibilityLevel) => void;
  resetAllToDefaults: () => void;
  detectAllSystemPreferences: () => void;

  // Visual accessibility system integration
  detectSystemPreferences: () => void;
  updateVisualState: (updates: Partial<VisualAccessibilityState>) => void;
  resetVisualToDefaults: () => void;

  // Convenience methods for common operations
  enableAccessibilityMode: () => void;
  enableGamingMode: () => void;
  enableScreenReaderMode: () => void;
}

// Helper function to apply presets across unified and specialized stores
function applyPresetToStores(preset: AccessibilityLevel) {
  const presetConfig = ACCESSIBILITY_PRESETS[preset];

  // Apply to unified store (visual features now integrated)
  const unifiedStore = useAccessibilityStore.getState();
  if (presetConfig.colorBlindnessType !== undefined)
    unifiedStore.setColorBlindnessType(presetConfig.colorBlindnessType);
  if (presetConfig.contrast !== undefined) unifiedStore.setContrast(presetConfig.contrast);
  if (presetConfig.fontSize !== undefined) unifiedStore.setFontSize(presetConfig.fontSize);
  if (presetConfig.animationIntensity !== undefined)
    unifiedStore.setAnimationIntensity(presetConfig.animationIntensity);
  if (presetConfig.visual !== undefined) unifiedStore.updateVisualAssistance(presetConfig.visual);

  // Apply to specialized store (cognitive + input)
  const specializedStore = useSpecializedAccessibilityStore.getState();
  if (presetConfig.cognitive !== undefined)
    specializedStore.updateCognitiveAssistance(presetConfig.cognitive);
  if (presetConfig.gameSpecific !== undefined)
    specializedStore.updateGameSpecific(presetConfig.gameSpecific);
  if (presetConfig.keyboard !== undefined)
    specializedStore.updateKeyboardNavigation(presetConfig.keyboard);
  if (presetConfig.feedback !== undefined)
    specializedStore.updateFeedbackSettings(presetConfig.feedback);
}

// Create the unified accessibility store
export const useAccessibilityStore = create<UnifiedAccessibilityStore>()(
  persist(
    (set, get) => ({
      // Initial state from visual accessibility + orchestration
      ...DEFAULT_VISUAL_ACCESSIBILITY,
      level: 'standard',
      enabled: true,

      // Visual accessibility features (integrated from visualAccessibility.ts)
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

      // Level management
      setAccessibilityLevel: (level: AccessibilityLevel) => {
        applyPresetToStores(level);
        set({ level });
      },

      toggleAccessibility: () => set((state) => ({ enabled: !state.enabled })),

      // Unified state access (computed from all stores)
      getAccessibilityState: (): AccessibilityState => {
        const specializedState = useSpecializedAccessibilityStore.getState();
        const currentState = get();

        return {
          // Core orchestration
          level: currentState.level,
          enabled: currentState.enabled,
          // Visual accessibility (now integrated)
          colorBlindnessType: currentState.colorBlindnessType,
          contrast: currentState.contrast,
          fontSize: currentState.fontSize,
          visual: currentState.visual,
          animationIntensity: currentState.animationIntensity,
          reducedMotion: currentState.reducedMotion,
          respectSystemPreferences: currentState.respectSystemPreferences,
          // Specialized store (cognitive + input)
          cognitive: specializedState.cognitive,
          gameSpecific: specializedState.gameSpecific,
          keyboard: specializedState.keyboard,
          feedback: specializedState.feedback,
        };
      },

      // Visual accessibility system integration
      detectSystemPreferences: () => {
        const detected = detectSystemVisualPreferences();
        if (Object.keys(detected).length > 0) {
          set((state) => ({ ...state, ...detected }));
        }
      },

      // Bulk visual state updates
      updateVisualState: (updates: Partial<VisualAccessibilityState>) =>
        set((state) => ({ ...state, ...updates })),

      // Reset visual to defaults
      resetVisualToDefaults: () => set((state) => ({ ...state, ...DEFAULT_VISUAL_ACCESSIBILITY })),

      // Cross-store operations
      applyPreset: (preset: AccessibilityLevel) => {
        applyPresetToStores(preset);
        set({ level: preset });
      },

      resetAllToDefaults: () => {
        // Reset visual (now integrated)
        get().resetVisualToDefaults();
        // Reset specialized store (cognitive + input)
        useSpecializedAccessibilityStore.getState().resetAllToDefaults();
        set({ level: 'standard', enabled: true });
      },

      detectAllSystemPreferences: () => {
        // Detect visual preferences (now integrated)
        get().detectSystemPreferences();
        // Cognitive and input stores don't have system preferences detection
      },

      // Convenience methods for common operations
      enableAccessibilityMode: () => {
        get().applyPreset('enhanced');
        set({ enabled: true });
      },

      enableGamingMode: () => {
        // Gaming-optimized settings across stores
        useSpecializedAccessibilityStore.getState().enableGamingMode();
        // Keep current visual settings
        set({ level: 'standard' });
      },

      enableScreenReaderMode: () => {
        useSpecializedAccessibilityStore.getState().enableScreenReaderMode();
        get().applyPreset('maximum');
        set({ enabled: true });
      },
    }),
    {
      name: 'tetris-accessibility-unified',
      partialize: (state) => ({
        // Core orchestration
        level: state.level,
        enabled: state.enabled,
        // Visual accessibility (now integrated)
        colorBlindnessType: state.colorBlindnessType,
        contrast: state.contrast,
        fontSize: state.fontSize,
        visual: state.visual,
        animationIntensity: state.animationIntensity,
        reducedMotion: state.reducedMotion,
        respectSystemPreferences: state.respectSystemPreferences,
      }),
      onRehydrateStorage: () => (state) => {
        // Apply current level preset on rehydration
        if (state?.level) {
          applyPresetToStores(state.level);
        }
        // Detect system preferences if enabled
        if (state?.enabled && state?.respectSystemPreferences) {
          state.detectSystemPreferences();
        }
      },
    } as PersistOptions<
      UnifiedAccessibilityStore,
      Partial<VisualAccessibilityState> & {
        level: AccessibilityLevel;
        enabled: boolean;
      }
    >
  )
);

// Main accessibility hook (visual now integrated, cognitive/input delegated)
export const useAccessibility = () => {
  const unifiedState = useAccessibilityStore((state) => ({
    // Core orchestration
    level: state.level,
    enabled: state.enabled,
    // Visual accessibility (now integrated)
    colorBlindnessType: state.colorBlindnessType,
    contrast: state.contrast,
    fontSize: state.fontSize,
    visual: state.visual,
    animationIntensity: state.animationIntensity,
    reducedMotion: state.reducedMotion,
    respectSystemPreferences: state.respectSystemPreferences,
  }));
  const specializedState = useSpecializedAccessibilityStore((state) => ({
    cognitive: state.cognitive,
    gameSpecific: state.gameSpecific,
    keyboard: state.keyboard,
    feedback: state.feedback,
  }));

  return {
    ...unifiedState,
    ...specializedState,
  };
};

export const useAccessibilityLevel = () => useAccessibilityStore((state) => state.level);

export const useAccessibilityEnabled = () => useAccessibilityStore((state) => state.enabled);

// Orchestrator action hooks
export const useSetAccessibilityLevel = () =>
  useAccessibilityStore((state) => state.setAccessibilityLevel);

export const useToggleAccessibility = () =>
  useAccessibilityStore((state) => state.toggleAccessibility);

export const useApplyAccessibilityPreset = () =>
  useAccessibilityStore((state) => state.applyPreset);

export const useResetAllAccessibility = () =>
  useAccessibilityStore((state) => state.resetAllToDefaults);

export const useDetectSystemPreferences = () =>
  useAccessibilityStore((state) => state.detectAllSystemPreferences);

export const useEnableAccessibilityMode = () =>
  useAccessibilityStore((state) => state.enableAccessibilityMode);

export const useEnableGamingMode = () => useAccessibilityStore((state) => state.enableGamingMode);

export const useEnableScreenReaderMode = () =>
  useAccessibilityStore((state) => state.enableScreenReaderMode);

// Visual accessibility selector hooks (now integrated)
export const useVisualAccessibilityState = () =>
  useAccessibilityStore((state) => ({
    colorBlindnessType: state.colorBlindnessType,
    contrast: state.contrast,
    fontSize: state.fontSize,
    visual: state.visual,
    animationIntensity: state.animationIntensity,
    reducedMotion: state.reducedMotion,
    respectSystemPreferences: state.respectSystemPreferences,
  }));

export const useColorBlindnessType = () =>
  useAccessibilityStore((state) => state.colorBlindnessType);

export const useContrastLevel = () => useAccessibilityStore((state) => state.contrast);

export const useFontSizeLevel = () => useAccessibilityStore((state) => state.fontSize);

export const useVisualAssistance = () => useAccessibilityStore((state) => state.visual);

export const useAnimationSettings = () =>
  useAccessibilityStore((state) => ({
    animationIntensity: state.animationIntensity,
    reducedMotion: state.reducedMotion,
  }));

// Visual accessibility action hooks (now integrated)
export const useSetColorBlindnessType = () =>
  useAccessibilityStore((state) => state.setColorBlindnessType);

export const useSetContrast = () => useAccessibilityStore((state) => state.setContrast);

export const useSetFontSize = () => useAccessibilityStore((state) => state.setFontSize);

export const useSetAnimationIntensity = () =>
  useAccessibilityStore((state) => state.setAnimationIntensity);

export const useUpdateVisualAssistance = () =>
  useAccessibilityStore((state) => state.updateVisualAssistance);

export const useToggleHighContrast = () =>
  useAccessibilityStore((state) => state.toggleHighContrast);

export const useToggleLargeText = () => useAccessibilityStore((state) => state.toggleLargeText);

export const useToggleReducedMotion = () =>
  useAccessibilityStore((state) => state.toggleReducedMotion);

export const useDetectSystemVisualPreferences = () =>
  useAccessibilityStore((state) => state.detectSystemPreferences);

// Re-export specialized store hooks for direct access

export {
  // Cognitive accessibility
  useCognitiveAccessibilityState,
  useCognitiveAssistance,
  useGameAccessibility,
  useSimplifiedUI,
  useConfirmActions,
  useAutoSave,
  useTimeoutWarnings,
  usePauseOnFocusLoss,
  usePauseOnBlur,
  useVisualGameOver,
  useColorCodedPieces,
  useGridLines,
  useDropPreview,
  useUpdateCognitiveAssistance,
  useUpdateGameSpecific,
  useToggleSimplifiedUI,
  useToggleConfirmActions,
  useToggleAutoSave,
  useEnableFocusMode,
  useDisableFocusMode,
  // Input accessibility
  useInputAccessibilityState,
  useKeyboardNavigation,
  useFeedbackSettings,
  useKeyboardEnabled,
  useFocusOutline,
  useSkipLinks,
  useTabOrder,
  useSoundEffects,
  useVoiceAnnouncements,
  useHapticFeedback,
  useScreenReader,
  useUpdateKeyboardNavigation,
  useUpdateFeedbackSettings,
  useToggleKeyboardFocus,
  useToggleSoundEffects,
  useToggleVoiceAnnouncements,
  useToggleHapticFeedback,
} from './specializedAccessibility';
