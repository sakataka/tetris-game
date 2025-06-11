import { useState, useCallback } from 'react';
import type { GameSettings } from './useSettingsStorage';

export interface SettingsStateAPI {
  settings: GameSettings;
  updateSettings: (updates: Partial<GameSettings>) => void;
  resetToDefaults: (defaultSettings: GameSettings) => void;
}

/**
 * Game settings state management
 *
 * Single responsibility: Manage the in-memory state of game settings
 * with update and reset functionality.
 */
export function useSettingsState(
  initialSettings: GameSettings,
  onSettingsChange?: (newSettings: GameSettings) => void
): SettingsStateAPI {
  const [settings, setSettings] = useState<GameSettings>(initialSettings);

  const updateSettings = useCallback(
    (updates: Partial<GameSettings>) => {
      setSettings((prevSettings) => {
        const newSettings = { ...prevSettings, ...updates };
        // Notify of changes if callback provided
        onSettingsChange?.(newSettings);
        return newSettings;
      });
    },
    [onSettingsChange]
  );

  const resetToDefaults = useCallback(
    (defaultSettings: GameSettings) => {
      setSettings(defaultSettings);
      onSettingsChange?.(defaultSettings);
    },
    [onSettingsChange]
  );

  return {
    settings,
    updateSettings,
    resetToDefaults,
  };
}
