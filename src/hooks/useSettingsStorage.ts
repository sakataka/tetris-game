import { useCallback } from 'react';
import { log } from '../utils/logging';

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

const STORAGE_KEY = 'tetris-game-settings';

export interface SettingsStorageAPI {
  saveSettings: (settings: GameSettings) => void;
  loadSettings: () => GameSettings | null;
  clearSettings: () => void;
}

/**
 * Local storage operations for game settings
 *
 * Single responsibility: Handle localStorage persistence of game settings
 * with proper error handling and SSR safety.
 */
export function useSettingsStorage(defaultSettings: GameSettings): SettingsStorageAPI {
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
          ...defaultSettings,
          ...parsed,
          keyBindings: {
            ...defaultSettings.keyBindings,
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
  }, [defaultSettings]);

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

  return {
    saveSettings,
    loadSettings,
    clearSettings,
  };
}
