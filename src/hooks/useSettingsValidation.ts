/**
 * Settings Validation Hook
 * 
 * Focused hook for settings validation and utility functions.
 * Extracted from useSettings.ts for single responsibility.
 */

import { useCallback } from 'react';
import type { GameSettings, KeyBindings } from './useSettingsStorage';

/**
 * Settings validation and utility functions hook
 * 
 * Provides validation logic and utility functions for settings management.
 * All functions are pure and side-effect free.
 */
export function useSettingsValidation() {
  // Key binding utilities
  const isKeyBound = useCallback(
    (settings: GameSettings, key: string): boolean => {
      return Object.values(settings.keyBindings).some((keys) => keys.includes(key));
    },
    []
  );

  const getActionForKey = useCallback(
    (settings: GameSettings, key: string): keyof KeyBindings | null => {
      for (const [action, keys] of Object.entries(settings.keyBindings)) {
        if (keys.includes(key)) {
          return action as keyof KeyBindings;
        }
      }
      return null;
    },
    []
  );

  // Audio utilities
  const getEffectiveVolume = useCallback((settings: GameSettings): number => {
    if (!settings.audioEnabled || settings.isMuted) {
      return 0;
    }
    return settings.volume;
  }, []);

  const clampVolume = useCallback((volume: number): number => {
    return Math.max(0, Math.min(1, volume));
  }, []);

  // Key binding validation
  const validateKeyBinding = useCallback((keys: string[]): boolean => {
    return keys.length > 0 && keys.every(key => typeof key === 'string' && key.length > 0);
  }, []);

  const validateKeyBindings = useCallback((keyBindings: KeyBindings): boolean => {
    return Object.values(keyBindings).every(keys => validateKeyBinding(keys));
  }, [validateKeyBinding]);

  // Settings validation
  const validateSettings = useCallback((settings: Partial<GameSettings>): boolean => {
    // Volume validation
    if (settings.volume !== undefined) {
      if (typeof settings.volume !== 'number' || settings.volume < 0 || settings.volume > 1) {
        return false;
      }
    }

    // Theme validation
    if (settings.theme !== undefined) {
      const validThemes = ['cyberpunk', 'classic', 'neon'] as const;
      if (!validThemes.includes(settings.theme)) {
        return false;
      }
    }

    // Key bindings validation
    if (settings.keyBindings !== undefined) {
      if (!validateKeyBindings(settings.keyBindings)) {
        return false;
      }
    }

    // Boolean validations
    const booleanFields = ['audioEnabled', 'isMuted', 'showGhost', 'showParticles'] as const;
    for (const field of booleanFields) {
      if (settings[field] !== undefined && typeof settings[field] !== 'boolean') {
        return false;
      }
    }

    return true;
  }, [validateKeyBindings]);

  // Key binding helpers
  const addKeyToBinding = useCallback((
    currentKeys: string[],
    newKey: string
  ): string[] => {
    if (!currentKeys.includes(newKey)) {
      return [...currentKeys, newKey];
    }
    return currentKeys;
  }, []);

  const removeKeyFromBinding = useCallback((
    currentKeys: string[],
    keyToRemove: string
  ): string[] => {
    const filteredKeys = currentKeys.filter((key) => key !== keyToRemove);
    // Ensure at least one key remains
    return filteredKeys.length > 0 ? filteredKeys : currentKeys;
  }, []);

  return {
    // Key binding utilities
    isKeyBound,
    getActionForKey,
    
    // Audio utilities
    getEffectiveVolume,
    clampVolume,
    
    // Validation functions
    validateKeyBinding,
    validateKeyBindings,
    validateSettings,
    
    // Key binding helpers
    addKeyToBinding,
    removeKeyFromBinding,
  };
}