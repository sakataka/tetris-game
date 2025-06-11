import { useCallback } from 'react';
import { log } from '../utils/logging';
import type { ThemeState } from '../types/tetris';

const STORAGE_KEY = 'tetris-theme-state';

export interface ThemeStorageAPI {
  saveThemeState: (themeState: ThemeState) => void;
  loadThemeState: () => ThemeState | null;
  clearThemeState: () => void;
}

/**
 * Theme state localStorage operations
 *
 * Single responsibility: Handle localStorage persistence of theme state
 * with proper error handling and SSR safety.
 */
export function useThemeStorage(): ThemeStorageAPI {
  const saveThemeState = useCallback((themeState: ThemeState): void => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(themeState));
    } catch (error) {
      log.warn('Failed to save theme state to localStorage', {
        component: 'ThemeStorage',
        metadata: { error },
      });
    }
  }, []);

  const loadThemeState = useCallback((): ThemeState | null => {
    if (typeof window === 'undefined') return null;

    try {
      const savedState = localStorage.getItem(STORAGE_KEY);
      if (savedState) {
        return JSON.parse(savedState);
      }
    } catch (error) {
      log.warn('Failed to load theme state from localStorage', {
        component: 'ThemeStorage',
        metadata: { error },
      });
    }
    return null;
  }, []);

  const clearThemeState = useCallback((): void => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      log.warn('Failed to clear theme state from localStorage', {
        component: 'ThemeStorage',
        metadata: { error },
      });
    }
  }, []);

  return {
    saveThemeState,
    loadThemeState,
    clearThemeState,
  };
}
