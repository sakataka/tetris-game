/**
 * Specialized Accessibility Store
 *
 * Consolidated store for specialized accessibility features:
 * - Cognitive accessibility (simplified UI, confirmations, auto-save)
 * - Input accessibility (keyboard navigation, feedback settings)
 *
 * Combines cognitive and input accessibility features into a single,
 * cohesive store while maintaining clear separation of concerns.
 */

import { create } from 'zustand';
import { type PersistOptions, persist } from 'zustand/middleware';
import {
  type CognitiveAccessibilityActions,
  type CognitiveAccessibilityState,
  type CognitiveAssistance,
  DEFAULT_COGNITIVE_ACCESSIBILITY,
  DEFAULT_INPUT_ACCESSIBILITY,
  type FeedbackSettings,
  type InputAccessibilityActions,
  type InputAccessibilityState,
  type KeyboardNavigation,
} from '../types/accessibility';

// Combined specialized accessibility state
interface SpecializedAccessibilityState
  extends CognitiveAccessibilityState,
    InputAccessibilityState {}

// Combined specialized accessibility actions
interface SpecializedAccessibilityActions
  extends CognitiveAccessibilityActions,
    InputAccessibilityActions {}

// Specialized accessibility store interface
interface SpecializedAccessibilityStore
  extends SpecializedAccessibilityState,
    SpecializedAccessibilityActions {
  // Bulk updates
  updateCognitiveState: (updates: Partial<CognitiveAccessibilityState>) => void;
  updateInputState: (updates: Partial<InputAccessibilityState>) => void;
  updateSpecializedState: (updates: Partial<SpecializedAccessibilityState>) => void;

  // Cognitive session management
  enableFocusMode: () => void;
  disableFocusMode: () => void;
  setUIComplexity: (simplified: boolean) => void;
  applyMinimalCognitive: () => void;
  applyMaximalCognitive: () => void;

  // Input profile management
  enableOptimizedKeyboard: () => void;
  enableBasicKeyboard: () => void;
  enableFullFeedback: () => void;
  enableMinimalFeedback: () => void;
  enableSilentMode: () => void;

  // Accessibility mode presets (cross-domain)
  enableScreenReaderMode: () => void;
  enableGamingMode: () => void;

  // Reset functionality
  resetCognitiveToDefaults: () => void;
  resetInputToDefaults: () => void;
  resetAllToDefaults: () => void;
}

// Create the specialized accessibility store
export const useSpecializedAccessibilityStore = create<SpecializedAccessibilityStore>()(
  persist(
    (set) => ({
      // Initial state (cognitive + input)
      ...DEFAULT_COGNITIVE_ACCESSIBILITY,
      ...DEFAULT_INPUT_ACCESSIBILITY,

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

      // === BULK UPDATES ===

      updateCognitiveState: (updates: Partial<CognitiveAccessibilityState>) =>
        set((state) => ({ ...state, ...updates })),

      updateInputState: (updates: Partial<InputAccessibilityState>) =>
        set((state) => ({ ...state, ...updates })),

      updateSpecializedState: (updates: Partial<SpecializedAccessibilityState>) =>
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

      // === ACCESSIBILITY MODE PRESETS ===

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
        })),

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
        })),

      // === RESET FUNCTIONALITY ===

      // Cognitive preset configurations
      applyMinimalCognitive: () =>
        set((state) => ({
          ...state,
          cognitive: {
            simplifiedUI: false,
            confirmActions: false,
            timeoutWarnings: false,
            autoSave: false,
            pauseOnFocusLoss: false,
          },
          gameSpecific: {
            ...state.gameSpecific,
            pauseOnBlur: false,
            visualGameOver: false,
          },
        })),

      applyMaximalCognitive: () =>
        set((state) => ({
          ...state,
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
        })),

      // Reset individual domains
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

      // Reset everything to defaults
      resetAllToDefaults: () => {
        set(() => ({
          ...DEFAULT_COGNITIVE_ACCESSIBILITY,
          ...DEFAULT_INPUT_ACCESSIBILITY,
        }));
      },
    }),
    {
      name: 'tetris-specialized-accessibility',
      partialize: (state) => ({
        // Cognitive state
        cognitive: state.cognitive,
        gameSpecific: state.gameSpecific,
        // Input state
        keyboard: state.keyboard,
        feedback: state.feedback,
      }),
    } as PersistOptions<
      SpecializedAccessibilityStore,
      Pick<SpecializedAccessibilityStore, 'cognitive' | 'gameSpecific' | 'keyboard' | 'feedback'>
    >
  )
);

// === COGNITIVE ACCESSIBILITY HOOKS ===

export const useCognitiveAccessibilityState = () =>
  useSpecializedAccessibilityStore((state) => ({
    cognitive: state.cognitive,
    gameSpecific: state.gameSpecific,
  }));

export const useCognitiveAssistance = () =>
  useSpecializedAccessibilityStore((state) => state.cognitive);

export const useGameAccessibility = () =>
  useSpecializedAccessibilityStore((state) => state.gameSpecific);

export const useSimplifiedUI = () =>
  useSpecializedAccessibilityStore((state) => state.cognitive.simplifiedUI);

export const useConfirmActions = () =>
  useSpecializedAccessibilityStore((state) => state.cognitive.confirmActions);

export const useAutoSave = () =>
  useSpecializedAccessibilityStore((state) => state.cognitive.autoSave);

export const useTimeoutWarnings = () =>
  useSpecializedAccessibilityStore((state) => state.cognitive.timeoutWarnings);

export const usePauseOnFocusLoss = () =>
  useSpecializedAccessibilityStore((state) => state.cognitive.pauseOnFocusLoss);

// Game-specific selectors
export const usePauseOnBlur = () =>
  useSpecializedAccessibilityStore((state) => state.gameSpecific.pauseOnBlur);

export const useVisualGameOver = () =>
  useSpecializedAccessibilityStore((state) => state.gameSpecific.visualGameOver);

export const useColorCodedPieces = () =>
  useSpecializedAccessibilityStore((state) => state.gameSpecific.colorCodedPieces);

export const useGridLines = () =>
  useSpecializedAccessibilityStore((state) => state.gameSpecific.gridLines);

export const useDropPreview = () =>
  useSpecializedAccessibilityStore((state) => state.gameSpecific.dropPreview);

// Cognitive action hooks
export const useUpdateCognitiveAssistance = () =>
  useSpecializedAccessibilityStore((state) => state.updateCognitiveAssistance);

export const useUpdateGameSpecific = () =>
  useSpecializedAccessibilityStore((state) => state.updateGameSpecific);

export const useToggleSimplifiedUI = () =>
  useSpecializedAccessibilityStore((state) => state.toggleSimplifiedUI);

export const useToggleConfirmActions = () =>
  useSpecializedAccessibilityStore((state) => state.toggleConfirmActions);

export const useToggleAutoSave = () =>
  useSpecializedAccessibilityStore((state) => state.toggleAutoSave);

export const useEnableFocusMode = () =>
  useSpecializedAccessibilityStore((state) => state.enableFocusMode);

export const useDisableFocusMode = () =>
  useSpecializedAccessibilityStore((state) => state.disableFocusMode);

export const useSetUIComplexity = () =>
  useSpecializedAccessibilityStore((state) => state.setUIComplexity);

export const useApplyMinimalCognitive = () =>
  useSpecializedAccessibilityStore((state) => state.applyMinimalCognitive);

export const useApplyMaximalCognitive = () =>
  useSpecializedAccessibilityStore((state) => state.applyMaximalCognitive);

// === INPUT ACCESSIBILITY HOOKS ===

export const useInputAccessibilityState = () =>
  useSpecializedAccessibilityStore((state) => ({
    keyboard: state.keyboard,
    feedback: state.feedback,
  }));

export const useKeyboardNavigation = () =>
  useSpecializedAccessibilityStore((state) => state.keyboard);

export const useFeedbackSettings = () =>
  useSpecializedAccessibilityStore((state) => state.feedback);

// Individual keyboard setting selectors
export const useKeyboardEnabled = () =>
  useSpecializedAccessibilityStore((state) => state.keyboard.enabled);

export const useFocusOutline = () =>
  useSpecializedAccessibilityStore((state) => state.keyboard.focusOutline);

export const useSkipLinks = () =>
  useSpecializedAccessibilityStore((state) => state.keyboard.skipLinks);

export const useTabOrder = () =>
  useSpecializedAccessibilityStore((state) => state.keyboard.tabOrder);

// Individual feedback setting selectors
export const useSoundEffects = () =>
  useSpecializedAccessibilityStore((state) => state.feedback.soundEffects);

export const useVoiceAnnouncements = () =>
  useSpecializedAccessibilityStore((state) => state.feedback.voiceAnnouncements);

export const useHapticFeedback = () =>
  useSpecializedAccessibilityStore((state) => state.feedback.hapticFeedback);

export const useScreenReader = () =>
  useSpecializedAccessibilityStore((state) => state.feedback.screenReader);

// Input action hooks
export const useUpdateKeyboardNavigation = () =>
  useSpecializedAccessibilityStore((state) => state.updateKeyboardNavigation);

export const useUpdateFeedbackSettings = () =>
  useSpecializedAccessibilityStore((state) => state.updateFeedbackSettings);

export const useToggleKeyboardFocus = () =>
  useSpecializedAccessibilityStore((state) => state.toggleKeyboardFocus);

export const useToggleSoundEffects = () =>
  useSpecializedAccessibilityStore((state) => state.toggleSoundEffects);

export const useToggleVoiceAnnouncements = () =>
  useSpecializedAccessibilityStore((state) => state.toggleVoiceAnnouncements);

export const useToggleHapticFeedback = () =>
  useSpecializedAccessibilityStore((state) => state.toggleHapticFeedback);

// Profile management hooks
export const useEnableOptimizedKeyboard = () =>
  useSpecializedAccessibilityStore((state) => state.enableOptimizedKeyboard);

export const useEnableBasicKeyboard = () =>
  useSpecializedAccessibilityStore((state) => state.enableBasicKeyboard);

export const useEnableFullFeedback = () =>
  useSpecializedAccessibilityStore((state) => state.enableFullFeedback);

export const useEnableMinimalFeedback = () =>
  useSpecializedAccessibilityStore((state) => state.enableMinimalFeedback);

export const useEnableSilentMode = () =>
  useSpecializedAccessibilityStore((state) => state.enableSilentMode);

export const useEnableScreenReaderMode = () =>
  useSpecializedAccessibilityStore((state) => state.enableScreenReaderMode);

export const useEnableGamingMode = () =>
  useSpecializedAccessibilityStore((state) => state.enableGamingMode);

// Reset hooks
export const useResetCognitiveToDefaults = () =>
  useSpecializedAccessibilityStore((state) => state.resetCognitiveToDefaults);

export const useResetInputToDefaults = () =>
  useSpecializedAccessibilityStore((state) => state.resetInputToDefaults);

export const useResetSpecializedToDefaults = () =>
  useSpecializedAccessibilityStore((state) => state.resetAllToDefaults);
