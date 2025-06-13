import { useState, useCallback, useEffect } from 'react';
import { log } from '../utils/logging';

export interface GameSettings {
  audioEnabled: boolean;
  volume: number;
  isMuted: boolean;
  keyBindings: {
    moveLeft: string[];
    moveRight: string[];
    moveDown: string[];
    rotate: string[];
    hardDrop: string[];
    pause: string[];
    reset: string[];
  };
  theme: 'cyberpunk' | 'classic' | 'neon';
  showGhost: boolean;
  showParticles: boolean;
}

export interface KeyBindings {
  moveLeft: string[];
  moveRight: string[];
  moveDown: string[];
  rotate: string[];
  hardDrop: string[];
  pause: string[];
  reset: string[];
}

const DEFAULT_SETTINGS: GameSettings = {
  audioEnabled: true,
  volume: 0.5,
  isMuted: false,
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

const STORAGE_KEY = 'tetris-game-settings';

/**
 * Unified settings management hook
 * 
 * Consolidates all settings-related functionality:
 * - State management with React state
 * - localStorage persistence with error handling
 * - Cross-tab synchronization via storage events
 * - Key bindings management
 * - Volume and audio controls
 * - Theme management
 */
export function useSettings() {
  // ===== Storage Operations =====
  
  const saveSettings = useCallback((settings: GameSettings): void => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      log.warn('Failed to save settings to localStorage', {
        component: 'SettingsStorage',
        metadata: { error },
      });
    }
  }, []);

  const loadSettings = useCallback((): GameSettings | null => {
    if (typeof window === 'undefined') return null;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Merge with default settings to handle missing properties
        return {
          ...DEFAULT_SETTINGS,
          ...parsed,
          keyBindings: {
            ...DEFAULT_SETTINGS.keyBindings,
            ...parsed.keyBindings,
          },
        };
      }
    } catch (error) {
      log.warn('Failed to load settings from localStorage', {
        component: 'SettingsStorage',
        metadata: { error },
      });
    }
    return null;
  }, []);

  const clearSettings = useCallback((): void => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      log.warn('Failed to clear settings from localStorage', {
        component: 'SettingsStorage',
        metadata: { error },
      });
    }
  }, []);

  // ===== State Management =====
  
  // Initialize settings from storage or defaults
  const initialSettings = loadSettings() || DEFAULT_SETTINGS;
  const [settings, setSettings] = useState<GameSettings>(initialSettings);

  const updateSettings = useCallback(
    (updates: Partial<GameSettings>) => {
      setSettings((prevSettings) => {
        const newSettings = { ...prevSettings, ...updates };
        // Auto-save to localStorage
        saveSettings(newSettings);
        return newSettings;
      });
    },
    [saveSettings]
  );

  const resetToDefaults = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    saveSettings(DEFAULT_SETTINGS);
  }, [saveSettings]);

  // ===== Cross-tab Synchronization =====
  
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const newSettings = JSON.parse(e.newValue);
          const mergedSettings = {
            ...DEFAULT_SETTINGS,
            ...newSettings,
            keyBindings: {
              ...DEFAULT_SETTINGS.keyBindings,
              ...newSettings.keyBindings,
            },
          };
          setSettings(mergedSettings);
        } catch (error) {
          log.warn('Failed to parse settings from storage event', {
            component: 'SettingsSync',
            metadata: { error },
          });
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // ===== Key Bindings Management =====
  
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

  const resetKeyBindings = useCallback(() => {
    updateSettings({
      keyBindings: DEFAULT_SETTINGS.keyBindings,
    });
  }, [updateSettings]);

  const addKeyBinding = useCallback(
    (action: keyof KeyBindings, newKey: string) => {
      const currentKeys = settings.keyBindings[action];
      if (!currentKeys.includes(newKey)) {
        updateKeyBinding(action, [...currentKeys, newKey]);
      }
    },
    [settings.keyBindings, updateKeyBinding]
  );

  const removeKeyBinding = useCallback(
    (action: keyof KeyBindings, keyToRemove: string) => {
      const currentKeys = settings.keyBindings[action];
      const filteredKeys = currentKeys.filter(key => key !== keyToRemove);
      if (filteredKeys.length > 0) { // Ensure at least one key remains
        updateKeyBinding(action, filteredKeys);
      }
    },
    [settings.keyBindings, updateKeyBinding]
  );

  // ===== Audio Controls =====
  
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

  const setMuted = useCallback(
    (isMuted: boolean) => {
      updateSettings({ isMuted });
    },
    [updateSettings]
  );

  const toggleMute = useCallback(() => {
    updateSettings({ isMuted: !settings.isMuted });
  }, [settings.isMuted, updateSettings]);

  // ===== Theme Management =====
  
  const setTheme = useCallback(
    (theme: GameSettings['theme']) => {
      updateSettings({ theme });
    },
    [updateSettings]
  );

  // ===== Visual Settings =====
  
  const toggleGhost = useCallback(() => {
    updateSettings({ showGhost: !settings.showGhost });
  }, [settings.showGhost, updateSettings]);

  const toggleParticles = useCallback(() => {
    updateSettings({ showParticles: !settings.showParticles });
  }, [settings.showParticles, updateSettings]);

  // ===== Utility Functions =====
  
  const isKeyBound = useCallback(
    (key: string): boolean => {
      return Object.values(settings.keyBindings).some(keys => keys.includes(key));
    },
    [settings.keyBindings]
  );

  const getActionForKey = useCallback(
    (key: string): keyof KeyBindings | null => {
      for (const [action, keys] of Object.entries(settings.keyBindings)) {
        if (keys.includes(key)) {
          return action as keyof KeyBindings;
        }
      }
      return null;
    },
    [settings.keyBindings]
  );

  const getEffectiveVolume = useCallback((): number => {
    if (!settings.audioEnabled || settings.isMuted) {
      return 0;
    }
    return settings.volume;
  }, [settings.audioEnabled, settings.isMuted, settings.volume]);

  const exportSettings = useCallback((): string => {
    return JSON.stringify(settings, null, 2);
  }, [settings]);

  const importSettings = useCallback(
    (settingsJson: string): boolean => {
      try {
        const importedSettings = JSON.parse(settingsJson);
        // Validate and merge with defaults
        const validatedSettings = {
          ...DEFAULT_SETTINGS,
          ...importedSettings,
          keyBindings: {
            ...DEFAULT_SETTINGS.keyBindings,
            ...importedSettings.keyBindings,
          },
        };
        updateSettings(validatedSettings);
        return true;
      } catch (error) {
        log.warn('Failed to import settings', {
          component: 'Settings',
          metadata: { error },
        });
        return false;
      }
    },
    [updateSettings]
  );

  // ===== Return API =====
  
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
    isKeyBound,
    getActionForKey,
    
    // Audio controls
    setVolume,
    toggleAudio,
    setMuted,
    toggleMute,
    getEffectiveVolume,
    
    // Theme management
    setTheme,
    
    // Visual settings
    toggleGhost,
    toggleParticles,
    
    // Storage operations
    saveSettings,
    loadSettings,
    clearSettings,
    exportSettings,
    importSettings,
    
    // Constants
    DEFAULT_SETTINGS,
    
    // Backward compatibility (legacy API)
    resetToDefaults,
  };
}

// ===== Legacy Compatibility Exports =====

// Store-like selectors for backward compatibility with existing usage patterns
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

