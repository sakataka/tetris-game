/**
 * Cognitive Accessibility Store
 *
 * Focused store for cognitive assistance features including:
 * - Simplified UI options
 * - Confirmation dialogs
 * - Timeout warnings
 * - Auto-save functionality
 * - Game-specific cognitive aids
 */

import { create } from 'zustand';
import { type PersistOptions, persist } from 'zustand/middleware';
import {
  type CognitiveAccessibilityActions,
  type CognitiveAccessibilityState,
  type CognitiveAssistance,
  DEFAULT_COGNITIVE_ACCESSIBILITY,
} from '../types/accessibility';

// Cognitive accessibility store interface
interface CognitiveAccessibilityStore
  extends CognitiveAccessibilityState,
    CognitiveAccessibilityActions {
  // Bulk updates
  updateCognitiveState: (updates: Partial<CognitiveAccessibilityState>) => void;

  // Gaming session management
  enableFocusMode: () => void;
  disableFocusMode: () => void;

  // UI complexity management
  setUIComplexity: (simplified: boolean) => void;

  // Reset functionality
  resetToDefaults: () => void;

  // Preset configurations
  applyMinimalCognitive: () => void;
  applyMaximalCognitive: () => void;
}

// Create the cognitive accessibility store
export const useCognitiveAccessibilityStore = create<CognitiveAccessibilityStore>()(
  persist(
    (set) => ({
      // Initial state
      ...DEFAULT_COGNITIVE_ACCESSIBILITY,

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

      // Individual toggles for common settings
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

      // Bulk state updates
      updateCognitiveState: (updates: Partial<CognitiveAccessibilityState>) =>
        set((state) => ({ ...state, ...updates })),

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

      // Reset to defaults
      resetToDefaults: () => set(() => ({ ...DEFAULT_COGNITIVE_ACCESSIBILITY })),

      // Preset configurations
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
    }),
    {
      name: 'tetris-cognitive-accessibility',
      partialize: (state) => ({
        cognitive: state.cognitive,
        gameSpecific: state.gameSpecific,
      }),
    } as PersistOptions<CognitiveAccessibilityStore, Partial<CognitiveAccessibilityState>>
  )
);

// Optimized selector hooks for cognitive accessibility
export const useCognitiveAccessibilityState = () =>
  useCognitiveAccessibilityStore((state) => ({
    cognitive: state.cognitive,
    gameSpecific: state.gameSpecific,
  }));

export const useCognitiveAssistance = () =>
  useCognitiveAccessibilityStore((state) => state.cognitive);

export const useGameAccessibility = () =>
  useCognitiveAccessibilityStore((state) => state.gameSpecific);

export const useSimplifiedUI = () =>
  useCognitiveAccessibilityStore((state) => state.cognitive.simplifiedUI);

export const useConfirmActions = () =>
  useCognitiveAccessibilityStore((state) => state.cognitive.confirmActions);

export const useAutoSave = () =>
  useCognitiveAccessibilityStore((state) => state.cognitive.autoSave);

export const useTimeoutWarnings = () =>
  useCognitiveAccessibilityStore((state) => state.cognitive.timeoutWarnings);

export const usePauseOnFocusLoss = () =>
  useCognitiveAccessibilityStore((state) => state.cognitive.pauseOnFocusLoss);

// Game-specific selectors
export const usePauseOnBlur = () =>
  useCognitiveAccessibilityStore((state) => state.gameSpecific.pauseOnBlur);

export const useVisualGameOver = () =>
  useCognitiveAccessibilityStore((state) => state.gameSpecific.visualGameOver);

export const useColorCodedPieces = () =>
  useCognitiveAccessibilityStore((state) => state.gameSpecific.colorCodedPieces);

export const useGridLines = () =>
  useCognitiveAccessibilityStore((state) => state.gameSpecific.gridLines);

export const useDropPreview = () =>
  useCognitiveAccessibilityStore((state) => state.gameSpecific.dropPreview);

// Action hooks for stable references
export const useUpdateCognitiveAssistance = () =>
  useCognitiveAccessibilityStore((state) => state.updateCognitiveAssistance);

export const useUpdateGameSpecific = () =>
  useCognitiveAccessibilityStore((state) => state.updateGameSpecific);

export const useToggleSimplifiedUI = () =>
  useCognitiveAccessibilityStore((state) => state.toggleSimplifiedUI);

export const useToggleConfirmActions = () =>
  useCognitiveAccessibilityStore((state) => state.toggleConfirmActions);

export const useToggleAutoSave = () =>
  useCognitiveAccessibilityStore((state) => state.toggleAutoSave);

export const useEnableFocusMode = () =>
  useCognitiveAccessibilityStore((state) => state.enableFocusMode);

export const useDisableFocusMode = () =>
  useCognitiveAccessibilityStore((state) => state.disableFocusMode);

export const useSetUIComplexity = () =>
  useCognitiveAccessibilityStore((state) => state.setUIComplexity);

export const useApplyMinimalCognitive = () =>
  useCognitiveAccessibilityStore((state) => state.applyMinimalCognitive);

export const useApplyMaximalCognitive = () =>
  useCognitiveAccessibilityStore((state) => state.applyMaximalCognitive);
