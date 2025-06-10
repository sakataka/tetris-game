/**
 * Input & Navigation Accessibility Store
 *
 * Focused store for input and navigation assistance including:
 * - Keyboard navigation settings
 * - Audio/haptic feedback controls
 * - Screen reader support
 * - Voice announcements
 */

import { create } from 'zustand';
import { persist, PersistOptions } from 'zustand/middleware';
import {
  InputAccessibilityState,
  InputAccessibilityActions,
  KeyboardNavigation,
  FeedbackSettings,
  DEFAULT_INPUT_ACCESSIBILITY,
} from '../types/accessibility';

// Input accessibility store interface
interface InputAccessibilityStore extends InputAccessibilityState, InputAccessibilityActions {
  // Bulk updates
  updateInputState: (updates: Partial<InputAccessibilityState>) => void;

  // Keyboard profile management
  enableOptimizedKeyboard: () => void;
  enableBasicKeyboard: () => void;

  // Feedback profile management
  enableFullFeedback: () => void;
  enableMinimalFeedback: () => void;
  enableSilentMode: () => void;

  // Accessibility mode presets
  enableScreenReaderMode: () => void;
  enableGamingMode: () => void;

  // Reset functionality
  resetToDefaults: () => void;
}

// Create the input accessibility store
export const useInputAccessibilityStore = create<InputAccessibilityStore>()(
  persist(
    (set) => ({
      // Initial state
      ...DEFAULT_INPUT_ACCESSIBILITY,

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

      // Bulk state updates
      updateInputState: (updates: Partial<InputAccessibilityState>) =>
        set((state) => ({ ...state, ...updates })),

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

      // Accessibility mode presets
      enableScreenReaderMode: () =>
        set((state) => ({
          ...state,
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

      // Reset to defaults
      resetToDefaults: () => set(() => ({ ...DEFAULT_INPUT_ACCESSIBILITY })),
    }),
    {
      name: 'tetris-input-accessibility',
      partialize: (state) => ({
        keyboard: state.keyboard,
        feedback: state.feedback,
      }),
    } as PersistOptions<InputAccessibilityStore, Partial<InputAccessibilityState>>
  )
);

// Optimized selector hooks for input accessibility
export const useInputAccessibilityState = () =>
  useInputAccessibilityStore((state) => ({
    keyboard: state.keyboard,
    feedback: state.feedback,
  }));

export const useKeyboardNavigation = () => useInputAccessibilityStore((state) => state.keyboard);

export const useFeedbackSettings = () => useInputAccessibilityStore((state) => state.feedback);

// Individual keyboard setting selectors
export const useKeyboardEnabled = () =>
  useInputAccessibilityStore((state) => state.keyboard.enabled);

export const useFocusOutline = () =>
  useInputAccessibilityStore((state) => state.keyboard.focusOutline);

export const useSkipLinks = () => useInputAccessibilityStore((state) => state.keyboard.skipLinks);

export const useTabOrder = () => useInputAccessibilityStore((state) => state.keyboard.tabOrder);

// Individual feedback setting selectors
export const useSoundEffects = () =>
  useInputAccessibilityStore((state) => state.feedback.soundEffects);

export const useVoiceAnnouncements = () =>
  useInputAccessibilityStore((state) => state.feedback.voiceAnnouncements);

export const useHapticFeedback = () =>
  useInputAccessibilityStore((state) => state.feedback.hapticFeedback);

export const useScreenReader = () =>
  useInputAccessibilityStore((state) => state.feedback.screenReader);

// Action hooks for stable references
export const useUpdateKeyboardNavigation = () =>
  useInputAccessibilityStore((state) => state.updateKeyboardNavigation);

export const useUpdateFeedbackSettings = () =>
  useInputAccessibilityStore((state) => state.updateFeedbackSettings);

export const useToggleKeyboardFocus = () =>
  useInputAccessibilityStore((state) => state.toggleKeyboardFocus);

export const useToggleSoundEffects = () =>
  useInputAccessibilityStore((state) => state.toggleSoundEffects);

export const useToggleVoiceAnnouncements = () =>
  useInputAccessibilityStore((state) => state.toggleVoiceAnnouncements);

export const useToggleHapticFeedback = () =>
  useInputAccessibilityStore((state) => state.toggleHapticFeedback);

// Profile management hooks
export const useEnableOptimizedKeyboard = () =>
  useInputAccessibilityStore((state) => state.enableOptimizedKeyboard);

export const useEnableBasicKeyboard = () =>
  useInputAccessibilityStore((state) => state.enableBasicKeyboard);

export const useEnableFullFeedback = () =>
  useInputAccessibilityStore((state) => state.enableFullFeedback);

export const useEnableMinimalFeedback = () =>
  useInputAccessibilityStore((state) => state.enableMinimalFeedback);

export const useEnableSilentMode = () =>
  useInputAccessibilityStore((state) => state.enableSilentMode);

export const useEnableScreenReaderMode = () =>
  useInputAccessibilityStore((state) => state.enableScreenReaderMode);

export const useEnableGamingMode = () =>
  useInputAccessibilityStore((state) => state.enableGamingMode);
