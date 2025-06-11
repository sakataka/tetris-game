/**
 * Unified theme management hook
 *
 * Composed of specialized hooks for maintainability:
 * - useThemeApplication: CSS application to DOM
 * - useAccessibilityFilters: accessibility processing
 * - useSystemPreferences: system preference monitoring
 * - useThemeStorage: storage operations
 */

import { useCallback, useEffect } from 'react';
import { ThemeVariant, ThemeState } from '../types/tetris';
import { useThemeApplication } from './useThemeApplication';
import { useAccessibilityFilters } from './useAccessibilityFilters';
import { useSystemPreferences } from './useSystemPreferences';
import { useThemeStorage } from './useThemeStorage';

interface UseThemeManagerProps {
  themeState: ThemeState;
  setTheme: (theme: ThemeVariant) => void;
  updateThemeState: (themeState: Partial<ThemeState>) => void;
  setAccessibilityOptions: (accessibility: Partial<ThemeState['accessibility']>) => void;
}

export function useThemeManager({
  themeState,
  setTheme,
  updateThemeState,
  setAccessibilityOptions,
}: UseThemeManagerProps) {
  // Storage operations hook
  const { saveThemeState, loadThemeState } = useThemeStorage();

  // Accessibility filters processing hook
  const { processedConfig } = useAccessibilityFilters(themeState.config, themeState.accessibility);

  // Theme application to DOM hook
  useThemeApplication(processedConfig);

  // System preferences monitoring hook (side effects only)
  useSystemPreferences(themeState.accessibility, setAccessibilityOptions);

  // Auto-save theme state when it changes
  useEffect(() => {
    saveThemeState(themeState);
  }, [themeState, saveThemeState]);

  // Theme change function
  const changeTheme = useCallback(
    (newTheme: ThemeVariant) => {
      setTheme(newTheme);
    },
    [setTheme]
  );

  // Accessibility settings change function
  const updateAccessibility = useCallback(
    (accessibility: Partial<ThemeState['accessibility']>) => {
      setAccessibilityOptions(accessibility);
    },
    [setAccessibilityOptions]
  );

  // Effect intensity change function
  const updateEffectIntensity = useCallback(
    (intensity: number) => {
      updateThemeState({ effectIntensity: intensity });
    },
    [updateThemeState]
  );

  // Toggle animations enabled/disabled
  const toggleAnimations = useCallback(() => {
    updateThemeState({ animations: !themeState.animations });
  }, [themeState.animations, updateThemeState]);

  // Restore theme state from localStorage
  const loadThemeFromStorage = useCallback(() => {
    const savedState = loadThemeState();
    if (savedState) {
      updateThemeState(savedState);
      return true;
    }
    return false;
  }, [loadThemeState, updateThemeState]);

  return {
    currentTheme: themeState.current,
    themeConfig: themeState.config,
    accessibility: themeState.accessibility,
    effectIntensity: themeState.effectIntensity,
    animations: themeState.animations,
    changeTheme,
    updateAccessibility,
    updateEffectIntensity,
    toggleAnimations,
    loadThemeFromStorage,
  };
}
