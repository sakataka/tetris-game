/**
 * Unified Settings Hook (Simplified)
 * 
 * Simplified wrapper that combines focused hooks for settings management.
 * Replaces the original 379-line useSettings.ts with a cleaner architecture.
 */

import { useCallback, useState } from 'react';
import { useSettingsStorage, type GameSettings, type KeyBindings, DEFAULT_SETTINGS } from './useSettingsStorage';
import { useSettingsSync } from './useSettingsSync';
import { useSettingsValidation } from './useSettingsValidation';

/**
 * Unified settings management hook
 * 
 * Combines storage, sync, and validation functionality with a clean API.
 * Much simpler than the original 379-line implementation.
 */
export function useSettings() {
  // Storage operations
  const {
    saveSettings,
    loadSettings,
    clearSettings,
    exportSettings,
    importSettings,
    STORAGE_KEY,
  } = useSettingsStorage();

  // Validation utilities
  const {
    isKeyBound,
    getActionForKey,
    getEffectiveVolume,
    clampVolume,
    validateSettings,
    addKeyToBinding,
    removeKeyFromBinding,
  } = useSettingsValidation();

  // Initialize settings from storage or defaults
  const [settings, setSettings] = useState<GameSettings>(() => {
    return loadSettings() || DEFAULT_SETTINGS;
  });

  // Cross-tab synchronization
  useSettingsSync({
    storageKey: STORAGE_KEY,
    onSettingsChange: setSettings,
  });

  // Update settings with validation and auto-save
  const updateSettings = useCallback(
    (updates: Partial<GameSettings>) => {
      if (!validateSettings(updates)) {
        console.warn('Invalid settings update attempted:', updates);
        return;
      }

      setSettings((prevSettings) => {
        const newSettings = { ...prevSettings, ...updates };
        saveSettings(newSettings);
        return newSettings;
      });
    },
    [saveSettings, validateSettings]
  );

  const resetToDefaults = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    saveSettings(DEFAULT_SETTINGS);
  }, [saveSettings]);

  // Key binding management
  const updateKeyBinding = useCallback(
    (action: keyof KeyBindings, newKeys: string[]) => {
      updateSettings({
        keyBindings: {
          ...settings.keyBindings,
          [action]: newKeys,
        },
      });
    },
    [settings.keyBindings, updateSettings]
  );

  const addKeyBinding = useCallback(
    (action: keyof KeyBindings, newKey: string) => {
      const currentKeys = settings.keyBindings[action];
      const updatedKeys = addKeyToBinding(currentKeys, newKey);
      updateKeyBinding(action, updatedKeys);
    },
    [settings.keyBindings, updateKeyBinding, addKeyToBinding]
  );

  const removeKeyBinding = useCallback(
    (action: keyof KeyBindings, keyToRemove: string) => {
      const currentKeys = settings.keyBindings[action];
      const updatedKeys = removeKeyFromBinding(currentKeys, keyToRemove);
      updateKeyBinding(action, updatedKeys);
    },
    [settings.keyBindings, updateKeyBinding, removeKeyFromBinding]
  );

  const resetKeyBindings = useCallback(() => {
    updateSettings({
      keyBindings: DEFAULT_SETTINGS.keyBindings,
    });
  }, [updateSettings]);

  // Audio controls
  const setVolume = useCallback(
    (volume: number) => {
      const clampedVolume = clampVolume(volume);
      updateSettings({ volume: clampedVolume });
    },
    [updateSettings, clampVolume]
  );

  const toggleAudio = useCallback(() => {
    updateSettings({ audioEnabled: !settings.audioEnabled });
  }, [settings.audioEnabled, updateSettings]);

  const setMuted = useCallback(
    (isMuted: boolean) => {
      updateSettings({ isMuted });
    },
    [updateSettings]
  );

  const toggleMute = useCallback(() => {
    updateSettings({ isMuted: !settings.isMuted });
  }, [settings.isMuted, updateSettings]);

  // Theme management
  const setTheme = useCallback(
    (theme: GameSettings['theme']) => {
      updateSettings({ theme });
    },
    [updateSettings]
  );

  // Visual settings
  const toggleGhost = useCallback(() => {
    updateSettings({ showGhost: !settings.showGhost });
  }, [settings.showGhost, updateSettings]);

  const toggleParticles = useCallback(() => {
    updateSettings({ showParticles: !settings.showParticles });
  }, [settings.showParticles, updateSettings]);

  // Import/Export with validation
  const handleImportSettings = useCallback(
    (settingsJson: string): boolean => {
      const imported = importSettings(settingsJson);
      if (imported) {
        setSettings(imported);
        saveSettings(imported);
        return true;
      }
      return false;
    },
    [importSettings, saveSettings]
  );

  return {
    // Current settings
    settings,

    // General settings management
    updateSettings,
    resetSettings: resetToDefaults,

    // Key bindings
    updateKeyBinding,
    resetKeyBindings,
    addKeyBinding,
    removeKeyBinding,
    isKeyBound: (key: string) => isKeyBound(settings, key),
    getActionForKey: (key: string) => getActionForKey(settings, key),

    // Audio controls
    setVolume,
    toggleAudio,
    setMuted,
    toggleMute,
    getEffectiveVolume: () => getEffectiveVolume(settings),

    // Theme management
    setTheme,

    // Visual settings
    toggleGhost,
    toggleParticles,

    // Storage operations
    saveSettings: () => saveSettings(settings),
    clearSettings,
    exportSettings: () => exportSettings(settings),
    importSettings: handleImportSettings,

    // Constants
    DEFAULT_SETTINGS,
  };
}

// Legacy compatibility exports
export const useGameSettings = () => {
  const settingsApi = useSettings();
  return settingsApi.settings;
};

export const useUpdateSettings = () => {
  const settingsApi = useSettings();
  return settingsApi.updateSettings;
};

export const useResetSettings = () => {
  const settingsApi = useSettings();
  return settingsApi.resetSettings;
};

// Re-export types for convenience
export type { GameSettings, KeyBindings } from './useSettingsStorage';
export { DEFAULT_SETTINGS } from './useSettingsStorage';