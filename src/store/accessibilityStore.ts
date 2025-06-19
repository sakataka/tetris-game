/**
 * Unified Accessibility Store
 *
 * Complete consolidated store managing all accessibility features:
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
import { type PersistOptions, persist } from 'zustand/middleware';
import {
  ACCESSIBILITY_PRESETS,
  type AccessibilityLevel,
  type AccessibilityState,
  type AnimationIntensity,
  type CognitiveAccessibilityActions,
  type CognitiveAccessibilityState,
  type CognitiveAssistance,
  DEFAULT_COGNITIVE_ACCESSIBILITY,
  DEFAULT_INPUT_ACCESSIBILITY,
  DEFAULT_VISUAL_ACCESSIBILITY,
  type FeedbackSettings,
  type FontSizeLevel,
  type InputAccessibilityActions,
  type InputAccessibilityState,
  type KeyboardNavigation,
  type VisualAccessibilityActions,
  type VisualAccessibilityState,
  type VisualAssistance,
} from '@/types/accessibility';
import type { ColorBlindnessType, ContrastLevel } from '@/types/tetris';

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

// Complete unified accessibility store interface
interface UnifiedAccessibilityStore
  extends VisualAccessibilityState,
    VisualAccessibilityActions,
    CognitiveAccessibilityState,
    CognitiveAccessibilityActions,
    InputAccessibilityState,
    InputAccessibilityActions {
  // Core orchestration state
  level: AccessibilityLevel;
  enabled: boolean;

  // Level management
  setAccessibilityLevel: (level: AccessibilityLevel) => void;
  toggleAccessibility: () => void;

  // Unified state access
  getAccessibilityState: () => AccessibilityState;

  // Cross-domain operations
  applyPreset: (preset: AccessibilityLevel) => void;
  resetAllToDefaults: () => void;
  detectAllSystemPreferences: () => void;

  // Visual accessibility methods
  detectSystemPreferences: () => void;
  updateVisualState: (updates: Partial<VisualAccessibilityState>) => void;
  resetVisualToDefaults: () => void;

  // Cognitive accessibility methods
  updateCognitiveState: (updates: Partial<CognitiveAccessibilityState>) => void;
  enableFocusMode: () => void;
  disableFocusMode: () => void;
  setUIComplexity: (simplified: boolean) => void;
  resetCognitiveToDefaults: () => void;

  // Input accessibility methods
  updateInputState: (updates: Partial<InputAccessibilityState>) => void;
  enableOptimizedKeyboard: () => void;
  enableBasicKeyboard: () => void;
  enableFullFeedback: () => void;
  enableMinimalFeedback: () => void;
  enableSilentMode: () => void;
  resetInputToDefaults: () => void;

  // Convenience methods for common operations
  enableAccessibilityMode: () => void;
  enableGamingMode: () => void;
  enableScreenReaderMode: () => void;
}

// Helper function to apply presets to unified store
function applyPresetToStore(preset: AccessibilityLevel) {
  const presetConfig = ACCESSIBILITY_PRESETS[preset];
  const store = useAccessibilityStore.getState();

  // Apply visual settings
  if (presetConfig.colorBlindnessType !== undefined)
    store.setColorBlindnessType(presetConfig.colorBlindnessType);
  if (presetConfig.contrast !== undefined) store.setContrast(presetConfig.contrast);
  if (presetConfig.fontSize !== undefined) store.setFontSize(presetConfig.fontSize);
  if (presetConfig.animationIntensity !== undefined)
    store.setAnimationIntensity(presetConfig.animationIntensity);
  if (presetConfig.visual !== undefined) store.updateVisualAssistance(presetConfig.visual);

  // Apply cognitive settings
  if (presetConfig.cognitive !== undefined) store.updateCognitiveAssistance(presetConfig.cognitive);
  if (presetConfig.gameSpecific !== undefined) store.updateGameSpecific(presetConfig.gameSpecific);

  // Apply input settings
  if (presetConfig.keyboard !== undefined) store.updateKeyboardNavigation(presetConfig.keyboard);
  if (presetConfig.feedback !== undefined) store.updateFeedbackSettings(presetConfig.feedback);
}

// Create the unified accessibility store
export const useAccessibilityStore = create<UnifiedAccessibilityStore>()(
  persist(
    (set, get) => ({
      // Initial state from all accessibility domains + orchestration
      ...DEFAULT_VISUAL_ACCESSIBILITY,
      ...DEFAULT_COGNITIVE_ACCESSIBILITY,
      ...DEFAULT_INPUT_ACCESSIBILITY,
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

      // === COGNITIVE ACCESSIBILITY FEATURES ===

      // Cognitive assistance updates
      updateCognitiveAssistance: (cognitive: Partial<CognitiveAssistance>) =>
        set((state) => ({
          ...state,
          cognitive: { ...state.cognitive, ...cognitive },
        })),

      // Game-specific settings
      updateGameSpecific: (gameSettings: Partial<CognitiveAccessibilityState['gameSpecific']>) =>
        set((state) => ({
          ...state,
          gameSpecific: { ...state.gameSpecific, ...gameSettings },
        })),

      // Individual cognitive toggles
      toggleSimplifiedUI: () =>
        set((state) => ({
          ...state,
          cognitive: {
            ...state.cognitive,
            simplifiedUI: !state.cognitive.simplifiedUI,
          },
        })),

      toggleConfirmActions: () =>
        set((state) => ({
          ...state,
          cognitive: {
            ...state.cognitive,
            confirmActions: !state.cognitive.confirmActions,
          },
        })),

      toggleAutoSave: () =>
        set((state) => ({
          ...state,
          cognitive: {
            ...state.cognitive,
            autoSave: !state.cognitive.autoSave,
          },
        })),

      // Focus mode for intensive gaming sessions
      enableFocusMode: () =>
        set((state) => ({
          ...state,
          cognitive: {
            ...state.cognitive,
            simplifiedUI: true,
            confirmActions: false,
            timeoutWarnings: false,
            pauseOnFocusLoss: false,
          },
          gameSpecific: {
            ...state.gameSpecific,
            pauseOnBlur: false,
            visualGameOver: true,
            dropPreview: true,
          },
        })),

      disableFocusMode: () => {
        const defaults = DEFAULT_COGNITIVE_ACCESSIBILITY;
        set((state) => ({
          ...state,
          cognitive: { ...defaults.cognitive },
          gameSpecific: { ...defaults.gameSpecific },
        }));
      },

      // UI complexity management
      setUIComplexity: (simplified: boolean) =>
        set((state) => ({
          ...state,
          cognitive: {
            ...state.cognitive,
            simplifiedUI: simplified,
            confirmActions: simplified,
            timeoutWarnings: !simplified,
          },
        })),

      // === INPUT ACCESSIBILITY FEATURES ===

      // Keyboard navigation updates
      updateKeyboardNavigation: (keyboard: Partial<KeyboardNavigation>) =>
        set((state) => ({
          ...state,
          keyboard: { ...state.keyboard, ...keyboard },
        })),

      // Feedback settings updates
      updateFeedbackSettings: (feedback: Partial<FeedbackSettings>) =>
        set((state) => ({
          ...state,
          feedback: { ...state.feedback, ...feedback },
        })),

      // Individual keyboard toggles
      toggleKeyboardFocus: () =>
        set((state) => ({
          ...state,
          keyboard: {
            ...state.keyboard,
            focusOutline: !state.keyboard.focusOutline,
          },
        })),

      // Individual feedback toggles
      toggleSoundEffects: () =>
        set((state) => ({
          ...state,
          feedback: {
            ...state.feedback,
            soundEffects: !state.feedback.soundEffects,
          },
        })),

      toggleVoiceAnnouncements: () =>
        set((state) => ({
          ...state,
          feedback: {
            ...state.feedback,
            voiceAnnouncements: !state.feedback.voiceAnnouncements,
          },
        })),

      toggleHapticFeedback: () =>
        set((state) => ({
          ...state,
          feedback: {
            ...state.feedback,
            hapticFeedback: !state.feedback.hapticFeedback,
          },
        })),

      // === LEVEL MANAGEMENT ===

      setAccessibilityLevel: (level: AccessibilityLevel) => {
        applyPresetToStore(level);
        set({ level });
      },

      toggleAccessibility: () => set((state) => ({ enabled: !state.enabled })),

      // Unified state access (all features integrated)
      getAccessibilityState: (): AccessibilityState => {
        const currentState = get();

        return {
          // Core orchestration
          level: currentState.level,
          enabled: currentState.enabled,
          // Visual accessibility
          colorBlindnessType: currentState.colorBlindnessType,
          contrast: currentState.contrast,
          fontSize: currentState.fontSize,
          visual: currentState.visual,
          animationIntensity: currentState.animationIntensity,
          reducedMotion: currentState.reducedMotion,
          respectSystemPreferences: currentState.respectSystemPreferences,
          // Cognitive accessibility
          cognitive: currentState.cognitive,
          gameSpecific: currentState.gameSpecific,
          // Input accessibility
          keyboard: currentState.keyboard,
          feedback: currentState.feedback,
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

      // === BULK UPDATES ===

      updateCognitiveState: (updates: Partial<CognitiveAccessibilityState>) =>
        set((state) => ({ ...state, ...updates })),

      updateInputState: (updates: Partial<InputAccessibilityState>) =>
        set((state) => ({ ...state, ...updates })),

      // === PROFILE MANAGEMENT ===

      // Keyboard profile management
      enableOptimizedKeyboard: () =>
        set((state) => ({
          ...state,
          keyboard: {
            enabled: true,
            focusOutline: true,
            skipLinks: true,
            tabOrder: 'optimized',
          },
        })),

      enableBasicKeyboard: () =>
        set((state) => ({
          ...state,
          keyboard: {
            enabled: true,
            focusOutline: false,
            skipLinks: false,
            tabOrder: 'default',
          },
        })),

      // Feedback profile management
      enableFullFeedback: () =>
        set((state) => ({
          ...state,
          feedback: {
            soundEffects: true,
            voiceAnnouncements: true,
            hapticFeedback: true,
            screenReader: true,
          },
        })),

      enableMinimalFeedback: () =>
        set((state) => ({
          ...state,
          feedback: {
            soundEffects: true,
            voiceAnnouncements: false,
            hapticFeedback: false,
            screenReader: false,
          },
        })),

      enableSilentMode: () =>
        set((state) => ({
          ...state,
          feedback: {
            soundEffects: false,
            voiceAnnouncements: false,
            hapticFeedback: false,
            screenReader: false,
          },
        })),

      // Cross-domain operations
      applyPreset: (preset: AccessibilityLevel) => {
        applyPresetToStore(preset);
        set({ level: preset });
      },

      resetCognitiveToDefaults: () => {
        const defaults = DEFAULT_COGNITIVE_ACCESSIBILITY;
        set((state) => ({
          ...state,
          cognitive: { ...defaults.cognitive },
          gameSpecific: { ...defaults.gameSpecific },
        }));
      },

      resetInputToDefaults: () => {
        const defaults = DEFAULT_INPUT_ACCESSIBILITY;
        set((state) => ({
          ...state,
          keyboard: { ...defaults.keyboard },
          feedback: { ...defaults.feedback },
        }));
      },

      resetAllToDefaults: () => {
        set(() => ({
          ...DEFAULT_VISUAL_ACCESSIBILITY,
          ...DEFAULT_COGNITIVE_ACCESSIBILITY,
          ...DEFAULT_INPUT_ACCESSIBILITY,
          level: 'standard',
          enabled: true,
        }));
      },

      detectAllSystemPreferences: () => {
        // Only visual preferences can be detected from system
        get().detectSystemPreferences();
      },

      // Convenience methods for common operations
      enableAccessibilityMode: () => {
        get().applyPreset('enhanced');
        set({ enabled: true });
      },

      enableGamingMode: () =>
        set((state) => ({
          ...state,
          // Cognitive: Minimize interruptions, maximize performance info
          cognitive: {
            simplifiedUI: true,
            confirmActions: false,
            timeoutWarnings: false,
            autoSave: false,
            pauseOnFocusLoss: false,
          },
          gameSpecific: {
            ...state.gameSpecific,
            pauseOnBlur: false,
            visualGameOver: true,
            colorCodedPieces: false, // Less visual clutter
            gridLines: false,
            dropPreview: true,
          },
          // Input: Optimize for gaming
          keyboard: {
            enabled: true,
            focusOutline: false, // Less visual distraction
            skipLinks: false,
            tabOrder: 'default',
          },
          feedback: {
            soundEffects: true,
            voiceAnnouncements: false, // Less interruption during gameplay
            hapticFeedback: true,
            screenReader: false,
          },
          level: 'standard',
        })),

      enableScreenReaderMode: () =>
        set((state) => ({
          ...state,
          // Cognitive: Maximize clarity and confirmations
          cognitive: {
            simplifiedUI: true,
            confirmActions: true,
            timeoutWarnings: true,
            autoSave: true,
            pauseOnFocusLoss: true,
          },
          gameSpecific: {
            ...state.gameSpecific,
            pauseOnBlur: true,
            visualGameOver: true,
            colorCodedPieces: true,
            gridLines: true,
            dropPreview: true,
          },
          // Input: Optimize for screen readers
          keyboard: {
            enabled: true,
            focusOutline: true,
            skipLinks: true,
            tabOrder: 'optimized',
          },
          feedback: {
            soundEffects: false, // Avoid conflicts with screen reader
            voiceAnnouncements: true,
            hapticFeedback: false,
            screenReader: true,
          },
          enabled: true,
          level: 'maximum',
        })),
    }),
    {
      name: 'tetris-accessibility-unified',
      partialize: (state) => ({
        // Core orchestration
        level: state.level,
        enabled: state.enabled,
        // Visual accessibility
        colorBlindnessType: state.colorBlindnessType,
        contrast: state.contrast,
        fontSize: state.fontSize,
        visual: state.visual,
        animationIntensity: state.animationIntensity,
        reducedMotion: state.reducedMotion,
        respectSystemPreferences: state.respectSystemPreferences,
        // Cognitive accessibility
        cognitive: state.cognitive,
        gameSpecific: state.gameSpecific,
        // Input accessibility
        keyboard: state.keyboard,
        feedback: state.feedback,
      }),
      onRehydrateStorage: () => (state) => {
        // Apply current level preset on rehydration
        if (state?.level) {
          applyPresetToStore(state.level);
        }
        // Detect system preferences if enabled
        if (state?.enabled && state?.respectSystemPreferences) {
          state.detectSystemPreferences();
        }
      },
    } as PersistOptions<
      UnifiedAccessibilityStore,
      Partial<VisualAccessibilityState> &
        Partial<CognitiveAccessibilityState> &
        Partial<InputAccessibilityState> & {
          level: AccessibilityLevel;
          enabled: boolean;
        }
    >
  )
);

// Main accessibility hook (all features integrated)
export const useAccessibility = () => {
  return useAccessibilityStore((state) => ({
    // Core orchestration
    level: state.level,
    enabled: state.enabled,
    // Visual accessibility
    colorBlindnessType: state.colorBlindnessType,
    contrast: state.contrast,
    fontSize: state.fontSize,
    visual: state.visual,
    animationIntensity: state.animationIntensity,
    reducedMotion: state.reducedMotion,
    respectSystemPreferences: state.respectSystemPreferences,
    // Cognitive accessibility
    cognitive: state.cognitive,
    gameSpecific: state.gameSpecific,
    // Input accessibility
    keyboard: state.keyboard,
    feedback: state.feedback,
  }));
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

// === COGNITIVE ACCESSIBILITY HOOKS ===

export const useCognitiveAccessibilityState = () =>
  useAccessibilityStore((state) => ({
    cognitive: state.cognitive,
    gameSpecific: state.gameSpecific,
  }));

export const useCognitiveAssistance = () => useAccessibilityStore((state) => state.cognitive);

export const useGameAccessibility = () => useAccessibilityStore((state) => state.gameSpecific);

export const useSimplifiedUI = () => useAccessibilityStore((state) => state.cognitive.simplifiedUI);

export const useConfirmActions = () =>
  useAccessibilityStore((state) => state.cognitive.confirmActions);

export const useAutoSave = () => useAccessibilityStore((state) => state.cognitive.autoSave);

export const useTimeoutWarnings = () =>
  useAccessibilityStore((state) => state.cognitive.timeoutWarnings);

export const usePauseOnFocusLoss = () =>
  useAccessibilityStore((state) => state.cognitive.pauseOnFocusLoss);

// Game-specific selectors
export const usePauseOnBlur = () =>
  useAccessibilityStore((state) => state.gameSpecific.pauseOnBlur);

export const useVisualGameOver = () =>
  useAccessibilityStore((state) => state.gameSpecific.visualGameOver);

export const useColorCodedPieces = () =>
  useAccessibilityStore((state) => state.gameSpecific.colorCodedPieces);

export const useGridLines = () => useAccessibilityStore((state) => state.gameSpecific.gridLines);

export const useDropPreview = () =>
  useAccessibilityStore((state) => state.gameSpecific.dropPreview);

// Cognitive action hooks
export const useUpdateCognitiveAssistance = () =>
  useAccessibilityStore((state) => state.updateCognitiveAssistance);

export const useUpdateGameSpecific = () =>
  useAccessibilityStore((state) => state.updateGameSpecific);

export const useToggleSimplifiedUI = () =>
  useAccessibilityStore((state) => state.toggleSimplifiedUI);

export const useToggleConfirmActions = () =>
  useAccessibilityStore((state) => state.toggleConfirmActions);

export const useToggleAutoSave = () => useAccessibilityStore((state) => state.toggleAutoSave);

export const useEnableFocusMode = () => useAccessibilityStore((state) => state.enableFocusMode);

export const useDisableFocusMode = () => useAccessibilityStore((state) => state.disableFocusMode);

export const useSetUIComplexity = () => useAccessibilityStore((state) => state.setUIComplexity);

// === INPUT ACCESSIBILITY HOOKS ===

export const useInputAccessibilityState = () =>
  useAccessibilityStore((state) => ({
    keyboard: state.keyboard,
    feedback: state.feedback,
  }));

export const useKeyboardNavigation = () => useAccessibilityStore((state) => state.keyboard);

export const useFeedbackSettings = () => useAccessibilityStore((state) => state.feedback);

// Individual keyboard setting selectors
export const useKeyboardEnabled = () => useAccessibilityStore((state) => state.keyboard.enabled);

export const useFocusOutline = () => useAccessibilityStore((state) => state.keyboard.focusOutline);

export const useSkipLinks = () => useAccessibilityStore((state) => state.keyboard.skipLinks);

export const useTabOrder = () => useAccessibilityStore((state) => state.keyboard.tabOrder);

// Individual feedback setting selectors
export const useSoundEffects = () => useAccessibilityStore((state) => state.feedback.soundEffects);

export const useVoiceAnnouncements = () =>
  useAccessibilityStore((state) => state.feedback.voiceAnnouncements);

export const useHapticFeedback = () =>
  useAccessibilityStore((state) => state.feedback.hapticFeedback);

export const useScreenReader = () => useAccessibilityStore((state) => state.feedback.screenReader);

// Input action hooks
export const useUpdateKeyboardNavigation = () =>
  useAccessibilityStore((state) => state.updateKeyboardNavigation);

export const useUpdateFeedbackSettings = () =>
  useAccessibilityStore((state) => state.updateFeedbackSettings);

export const useToggleKeyboardFocus = () =>
  useAccessibilityStore((state) => state.toggleKeyboardFocus);

export const useToggleSoundEffects = () =>
  useAccessibilityStore((state) => state.toggleSoundEffects);

export const useToggleVoiceAnnouncements = () =>
  useAccessibilityStore((state) => state.toggleVoiceAnnouncements);

export const useToggleHapticFeedback = () =>
  useAccessibilityStore((state) => state.toggleHapticFeedback);

// Profile management hooks
export const useEnableOptimizedKeyboard = () =>
  useAccessibilityStore((state) => state.enableOptimizedKeyboard);

export const useEnableBasicKeyboard = () =>
  useAccessibilityStore((state) => state.enableBasicKeyboard);

export const useEnableFullFeedback = () =>
  useAccessibilityStore((state) => state.enableFullFeedback);

export const useEnableMinimalFeedback = () =>
  useAccessibilityStore((state) => state.enableMinimalFeedback);

export const useEnableSilentMode = () => useAccessibilityStore((state) => state.enableSilentMode);

// Reset hooks
export const useResetCognitiveToDefaults = () =>
  useAccessibilityStore((state) => state.resetCognitiveToDefaults);

export const useResetInputToDefaults = () =>
  useAccessibilityStore((state) => state.resetInputToDefaults);
