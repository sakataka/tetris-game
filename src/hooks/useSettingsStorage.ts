/**
 * Settings Storage Hook
 *
 * Focused hook for localStorage operations with error handling.
 * Extracted from useSettings.ts for single responsibility.
 */

import { useCallback } from 'react';
import { log } from '@/utils/logging';

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

export const DEFAULT_SETTINGS: GameSettings = {
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
 * Settings storage operations hook
 *
 * Provides localStorage operations with error handling and validation.
 * All storage operations are resilient to localStorage being unavailable.
 */
export function useSettingsStorage() {
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

  const exportSettings = useCallback((settings: GameSettings): string => {
    return JSON.stringify(settings, null, 2);
  }, []);

  const importSettings = useCallback((settingsJson: string): GameSettings | null => {
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
      return validatedSettings;
    } catch (error) {
      log.warn('Failed to import settings', {
        component: 'SettingsStorage',
        metadata: { error },
      });
      return null;
    }
  }, []);

  return {
    saveSettings,
    loadSettings,
    clearSettings,
    exportSettings,
    importSettings,
    DEFAULT_SETTINGS,
    STORAGE_KEY,
  };
}
