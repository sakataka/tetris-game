/**
 * Unified settings management hook
 *
 * Composed of specialized hooks for maintainability:
 * - useSettingsStorage: localStorage operations
 * - useSettingsState: in-memory state management
 * - useKeyBindings: key binding operations
 * - useSettingsSync: cross-tab synchronization
 */

import { useCallback } from 'react';
import { useSettingsStorage, type GameSettings } from './useSettingsStorage';
import { useSettingsState } from './useSettingsState';
import { useKeyBindings } from './useKeyBindings';
import { useSettingsSync } from './useSettingsSync';

// Re-export GameSettings for backward compatibility
export type { GameSettings };

const DEFAULT_SETTINGS: GameSettings = {
  audioEnabled: true,
  volume: 0.5,
  keyBindings: {
    moveLeft: ['ArrowLeft', 'a', 'A'],
    moveRight: ['ArrowRight', 'd', 'D'],
    moveDown: ['ArrowDown', 's', 'S'],
    rotate: ['ArrowUp', 'w', 'W'],
    hardDrop: [' '],
    pause: ['p', 'P'],
    reset: ['r', 'R'],
  },
  theme: 'cyberpunk',
  showGhost: true,
  showParticles: true,
};

export function useSettings() {
  // Storage operations hook
  const { saveSettings, loadSettings } = useSettingsStorage(DEFAULT_SETTINGS);

  // Initialize settings from storage or defaults
  const initialSettings = loadSettings() || DEFAULT_SETTINGS;

  // State management hook with auto-save
  const {
    settings,
    updateSettings: updateState,
    resetToDefaults,
  } = useSettingsState(initialSettings, (newSettings) => {
    saveSettings(newSettings);
  });

  // Key bindings management hook
  const { updateKeyBinding } = useKeyBindings(
    settings.keyBindings,
    DEFAULT_SETTINGS.keyBindings,
    (newKeyBindings) => {
      updateState({ keyBindings: newKeyBindings });
    }
  );

  // Cross-tab synchronization hook
  useSettingsSync(DEFAULT_SETTINGS, (syncedSettings) => {
    updateState(syncedSettings);
  });

  // Public API functions (maintain backward compatibility)
  const updateSettings = useCallback(
    (updates: Partial<GameSettings>) => {
      updateState(updates);
    },
    [updateState]
  );

  const resetSettings = useCallback(() => {
    resetToDefaults(DEFAULT_SETTINGS);
    saveSettings(DEFAULT_SETTINGS);
  }, [resetToDefaults, saveSettings]);

  const setVolume = useCallback(
    (volume: number) => {
      const clampedVolume = Math.max(0, Math.min(1, volume));
      updateSettings({ volume: clampedVolume });
    },
    [updateSettings]
  );

  const toggleAudio = useCallback(() => {
    updateSettings({ audioEnabled: !settings.audioEnabled });
  }, [settings.audioEnabled, updateSettings]);

  return {
    settings,
    updateSettings,
    resetSettings,
    updateKeyBinding,
    setVolume,
    toggleAudio,
    DEFAULT_SETTINGS,
  };
}
