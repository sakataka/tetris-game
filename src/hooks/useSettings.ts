import { useState, useCallback, useEffect } from 'react';

export interface GameSettings {
  audioEnabled: boolean;
  volume: number;
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

const STORAGE_KEY = 'tetris-game-settings';

function saveToLocalStorage(settings: GameSettings): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.warn('Failed to save settings to localStorage:', error);
  }
}

function loadFromLocalStorage(): GameSettings | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Check settings validity
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
    console.warn('Failed to load settings from localStorage:', error);
  }
  return null;
}

export function useSettings() {
  const [settings, setSettingsState] = useState<GameSettings>(() => {
    return loadFromLocalStorage() || DEFAULT_SETTINGS;
  });

  // Update and save settings
  const updateSettings = useCallback((updates: Partial<GameSettings>) => {
    setSettingsState((prevSettings) => {
      const newSettings = { ...prevSettings, ...updates };
      saveToLocalStorage(newSettings);
      return newSettings;
    });
  }, []);

  // Reset settings to default
  const resetSettings = useCallback(() => {
    setSettingsState(DEFAULT_SETTINGS);
    saveToLocalStorage(DEFAULT_SETTINGS);
  }, []);

  // Update specific key binding
  const updateKeyBinding = useCallback(
    (action: keyof GameSettings['keyBindings'], keys: string[]) => {
      updateSettings({
        keyBindings: {
          ...settings.keyBindings,
          [action]: keys,
        },
      });
    },
    [settings.keyBindings, updateSettings]
  );

  // Update volume
  const setVolume = useCallback(
    (volume: number) => {
      const clampedVolume = Math.max(0, Math.min(1, volume));
      updateSettings({ volume: clampedVolume });
    },
    [updateSettings]
  );

  // Toggle audio enabled/disabled
  const toggleAudio = useCallback(() => {
    updateSettings({ audioEnabled: !settings.audioEnabled });
  }, [settings.audioEnabled, updateSettings]);

  // Monitor localStorage changes (detect changes in other tabs)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const newSettings = JSON.parse(e.newValue);
          setSettingsState({
            ...DEFAULT_SETTINGS,
            ...newSettings,
            keyBindings: {
              ...DEFAULT_SETTINGS.keyBindings,
              ...newSettings.keyBindings,
            },
          });
        } catch (error) {
          console.warn('Failed to parse settings from storage event:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

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
