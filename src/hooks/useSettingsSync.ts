/**
 * Settings Synchronization Hook
 * 
 * Focused hook for cross-tab synchronization via storage events.
 * Extracted from useSettings.ts for single responsibility.
 */

import { useEffect } from 'react';
import { log } from '../utils/logging';
import { type GameSettings, DEFAULT_SETTINGS } from './useSettingsStorage';

interface UseSettingsSyncOptions {
  storageKey: string;
  onSettingsChange: (settings: GameSettings) => void;
}

/**
 * Settings synchronization hook
 * 
 * Handles cross-tab synchronization via localStorage events.
 * Updates local state when settings change in other tabs.
 */
export function useSettingsSync({ storageKey, onSettingsChange }: UseSettingsSyncOptions) {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === storageKey && e.newValue) {
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
          onSettingsChange(mergedSettings);
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
  }, [storageKey, onSettingsChange]);
}