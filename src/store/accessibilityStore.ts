/**
 * Accessibility Store Orchestrator
 *
 * Main accessibility store that coordinates between specialized stores:
 * - Visual accessibility (contrast, fonts, animations)
 * - Cognitive accessibility (simplified UI, confirmations)
 * - Input accessibility (keyboard, feedback)
 *
 * Provides unified API and level management while delegating
 * specific functionality to focused stores.
 */

import { create } from 'zustand';
import { persist, PersistOptions } from 'zustand/middleware';
import {
  AccessibilityLevel,
  AccessibilityState,
  ACCESSIBILITY_PRESETS,
} from '../types/accessibility';

import { useVisualAccessibilityStore, useVisualAccessibilityState } from './visualAccessibility';
import {
  useCognitiveAccessibilityStore,
  useCognitiveAccessibilityState,
} from './cognitiveAccessibility';
import { useInputAccessibilityStore, useInputAccessibilityState } from './inputAccessibility';

// Orchestrator store interface - manages accessibility level and coordinates stores
interface AccessibilityOrchestratorStore {
  // Core state
  level: AccessibilityLevel;
  enabled: boolean;

  // Level management
  setAccessibilityLevel: (level: AccessibilityLevel) => void;
  toggleAccessibility: () => void;

  // Unified state access (computed from specialized stores)
  getAccessibilityState: () => AccessibilityState;

  // Cross-store operations
  applyPreset: (preset: AccessibilityLevel) => void;
  resetAllToDefaults: () => void;
  detectAllSystemPreferences: () => void;

  // Convenience methods for common operations
  enableAccessibilityMode: () => void;
  enableGamingMode: () => void;
  enableScreenReaderMode: () => void;
}

// Helper function to apply presets across all stores
function applyPresetToStores(preset: AccessibilityLevel) {
  const presetConfig = ACCESSIBILITY_PRESETS[preset];

  // Apply to visual store
  const visualStore = useVisualAccessibilityStore.getState();
  if (presetConfig.colorBlindnessType !== undefined)
    visualStore.setColorBlindnessType(presetConfig.colorBlindnessType);
  if (presetConfig.contrast !== undefined) visualStore.setContrast(presetConfig.contrast);
  if (presetConfig.fontSize !== undefined) visualStore.setFontSize(presetConfig.fontSize);
  if (presetConfig.animationIntensity !== undefined)
    visualStore.setAnimationIntensity(presetConfig.animationIntensity);
  if (presetConfig.visual !== undefined) visualStore.updateVisualAssistance(presetConfig.visual);

  // Apply to cognitive store
  const cognitiveStore = useCognitiveAccessibilityStore.getState();
  if (presetConfig.cognitive !== undefined)
    cognitiveStore.updateCognitiveAssistance(presetConfig.cognitive);
  if (presetConfig.gameSpecific !== undefined)
    cognitiveStore.updateGameSpecific(presetConfig.gameSpecific);

  // Apply to input store
  const inputStore = useInputAccessibilityStore.getState();
  if (presetConfig.keyboard !== undefined)
    inputStore.updateKeyboardNavigation(presetConfig.keyboard);
  if (presetConfig.feedback !== undefined) inputStore.updateFeedbackSettings(presetConfig.feedback);
}

// Create the orchestrator store
export const useAccessibilityStore = create<AccessibilityOrchestratorStore>()(
  persist(
    (set, get) => ({
      // Initial state
      level: 'standard',
      enabled: true,

      // Level management
      setAccessibilityLevel: (level: AccessibilityLevel) => {
        applyPresetToStores(level);
        set({ level });
      },

      toggleAccessibility: () => set((state) => ({ enabled: !state.enabled })),

      // Unified state access (computed from specialized stores)
      getAccessibilityState: (): AccessibilityState => {
        const visualState = useVisualAccessibilityStore.getState();
        const cognitiveState = useCognitiveAccessibilityStore.getState();
        const inputState = useInputAccessibilityStore.getState();
        const orchestratorState = get();

        return {
          level: orchestratorState.level,
          enabled: orchestratorState.enabled,
          ...visualState,
          ...cognitiveState,
          ...inputState,
        };
      },

      // Cross-store operations
      applyPreset: (preset: AccessibilityLevel) => {
        applyPresetToStores(preset);
        set({ level: preset });
      },

      resetAllToDefaults: () => {
        useVisualAccessibilityStore.getState().resetToDefaults();
        useCognitiveAccessibilityStore.getState().resetToDefaults();
        useInputAccessibilityStore.getState().resetToDefaults();
        set({ level: 'standard', enabled: true });
      },

      detectAllSystemPreferences: () => {
        useVisualAccessibilityStore.getState().detectSystemPreferences();
        // Cognitive and input stores don't have system preferences detection
      },

      // Convenience methods for common operations
      enableAccessibilityMode: () => {
        get().applyPreset('enhanced');
        set({ enabled: true });
      },

      enableGamingMode: () => {
        // Gaming-optimized settings across stores
        useInputAccessibilityStore.getState().enableGamingMode();
        useCognitiveAccessibilityStore.getState().enableFocusMode();
        // Keep current visual settings
        set({ level: 'standard' });
      },

      enableScreenReaderMode: () => {
        useInputAccessibilityStore.getState().enableScreenReaderMode();
        get().applyPreset('maximum');
        set({ enabled: true });
      },
    }),
    {
      name: 'tetris-accessibility-orchestrator',
      partialize: (state) => ({
        level: state.level,
        enabled: state.enabled,
      }),
      onRehydrateStorage: () => (state) => {
        // Apply current level preset on rehydration
        if (state?.level) {
          applyPresetToStores(state.level);
        }
        // Detect system preferences if enabled
        if (state?.enabled) {
          state.detectAllSystemPreferences();
        }
      },
    } as PersistOptions<
      AccessibilityOrchestratorStore,
      Pick<AccessibilityOrchestratorStore, 'level' | 'enabled'>
    >
  )
);

// Backward compatibility hooks (delegate to specialized stores)
export const useAccessibility = () => {
  const orchestratorState = useAccessibilityStore((state) => ({
    level: state.level,
    enabled: state.enabled,
  }));
  const visualState = useVisualAccessibilityState();
  const cognitiveState = useCognitiveAccessibilityState();
  const inputState = useInputAccessibilityState();

  return {
    ...orchestratorState,
    ...visualState,
    ...cognitiveState,
    ...inputState,
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

// Re-export specialized store hooks for direct access
export {
  // Visual accessibility
  useVisualAccessibilityState,
  useColorBlindnessType,
  useContrastLevel,
  useFontSizeLevel,
  useVisualAssistance,
  useAnimationSettings,
  useSetColorBlindnessType,
  useSetContrast,
  useSetFontSize,
  useSetAnimationIntensity,
  useUpdateVisualAssistance,
  useToggleHighContrast,
  useToggleLargeText,
  useToggleReducedMotion,
} from './visualAccessibility';

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
} from './cognitiveAccessibility';

export {
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
} from './inputAccessibility';
