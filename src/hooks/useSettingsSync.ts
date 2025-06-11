import { useEffect } from 'react';
import { log } from '../utils/logging';
import type { GameSettings } from './useSettingsStorage';

export interface SettingsSyncAPI {
  // This hook only provides side effects, no return API needed
  // Using object type to satisfy ESLint no-empty-object-type rule
  readonly _sideEffectsOnly: true;
}

/**
 * Cross-tab settings synchronization
 *
 * Single responsibility: Monitor localStorage changes from other tabs
 * and synchronize settings across browser tabs.
 */
export function useSettingsSync(
  defaultSettings: GameSettings,
  onSettingsSync: (newSettings: GameSettings) => void
): void {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const STORAGE_KEY = 'tetris-game-settings';

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const newSettings = JSON.parse(e.newValue);
          const mergedSettings = {
            ...defaultSettings,
            ...newSettings,
            keyBindings: {
              ...defaultSettings.keyBindings,
              ...newSettings.keyBindings,
            },
          };
          onSettingsSync(mergedSettings);
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
  }, [defaultSettings, onSettingsSync]);
}
