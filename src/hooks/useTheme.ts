import { useCallback, useEffect } from 'react';
import { initializeTheme } from '../utils/ui';
import { log } from '../utils/logging';
import { useAccessibilityFilters } from './useAccessibilityFilters';
import { useSystemPreferences } from './useSystemPreferences';
import type { ThemeVariant, ThemeState, ThemeConfig } from '../types/tetris';

const STORAGE_KEY = 'tetris-theme-state';

interface UseThemeProps {
  themeState: ThemeState;
  setTheme: (theme: ThemeVariant) => void;
  updateThemeState: (themeState: Partial<ThemeState>) => void;
  setAccessibilityOptions: (accessibility: Partial<ThemeState['accessibility']>) => void;
}

/**
 * Unified theme management hook
 *
 * Consolidates all theme-related functionality:
 * - Theme state management and persistence
 * - CSS application to DOM
 * - Accessibility processing and system preferences
 * - Theme switching and configuration
 * - Storage operations with error handling
 */
export function useTheme({
  themeState,
  setTheme,
  updateThemeState,
  setAccessibilityOptions,
}: UseThemeProps) {
  // ===== Storage Operations =====

  const saveThemeState = useCallback((themeStateToSave: ThemeState): void => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(themeStateToSave));
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

  // ===== Accessibility Processing =====

  // Process theme config with accessibility filters
  const { processedConfig } = useAccessibilityFilters(themeState.config, themeState.accessibility);

  // ===== Theme Application =====

  // Apply theme configuration to DOM
  useEffect(() => {
    initializeTheme(processedConfig);
  }, [processedConfig]);

  // ===== System Preferences Monitoring =====

  // Monitor system preferences and update accessibility settings
  useSystemPreferences(themeState.accessibility, setAccessibilityOptions);

  // ===== Auto-save Theme State =====

  // Auto-save theme state when it changes
  useEffect(() => {
    saveThemeState(themeState);
  }, [themeState, saveThemeState]);

  // ===== Theme Management Functions =====

  // Change theme variant
  const changeTheme = useCallback(
    (newTheme: ThemeVariant) => {
      setTheme(newTheme);
    },
    [setTheme]
  );

  // Update accessibility settings
  const updateAccessibility = useCallback(
    (accessibility: Partial<ThemeState['accessibility']>) => {
      setAccessibilityOptions(accessibility);
    },
    [setAccessibilityOptions]
  );

  // Update effect intensity
  const updateEffectIntensity = useCallback(
    (intensity: number) => {
      const clampedIntensity = Math.max(0, Math.min(1, intensity));
      updateThemeState({ effectIntensity: clampedIntensity });
    },
    [updateThemeState]
  );

  // Toggle animations
  const toggleAnimations = useCallback(() => {
    updateThemeState({ animations: !themeState.animations });
  }, [themeState.animations, updateThemeState]);

  // Update custom colors
  const updateCustomColors = useCallback(
    (customColors: Partial<ThemeState['customColors']>) => {
      const currentColors = themeState.customColors || {};
      const mergedColors = {
        ...currentColors,
        ...customColors,
      };

      // Filter out undefined values to maintain type safety
      const filteredColors: Record<string, string> = {};
      Object.entries(mergedColors).forEach(([key, value]) => {
        if (value !== undefined) {
          filteredColors[key] = value;
        }
      });

      // Type-safe update using conditional assignment
      if (Object.keys(filteredColors).length > 0) {
        updateThemeState({
          customColors: filteredColors,
        });
      } else {
        // Create update object without customColors property
        const updateObject: Partial<ThemeState> = {};
        updateThemeState(updateObject);
      }
    },
    [themeState.customColors, updateThemeState]
  );

  // Reset theme to defaults
  const resetTheme = useCallback(() => {
    const defaultTheme: ThemeVariant = 'cyberpunk';
    setTheme(defaultTheme);
    updateThemeState({
      effectIntensity: 0.8,
      animations: true,
    });
  }, [setTheme, updateThemeState]);

  // ===== Storage Management Functions =====

  // Load theme from storage
  const loadThemeFromStorage = useCallback(() => {
    const savedState = loadThemeState();
    if (savedState) {
      updateThemeState(savedState);
      return true;
    }
    return false;
  }, [loadThemeState, updateThemeState]);

  // Export theme configuration
  const exportThemeConfig = useCallback((): string => {
    return JSON.stringify(themeState, null, 2);
  }, [themeState]);

  // Import theme configuration
  const importThemeConfig = useCallback(
    (themeConfigJson: string): boolean => {
      try {
        const importedTheme = JSON.parse(themeConfigJson);
        // Validate structure
        if (importedTheme && typeof importedTheme === 'object') {
          updateThemeState(importedTheme);
          return true;
        }
        return false;
      } catch (error) {
        log.warn('Failed to import theme configuration', {
          component: 'Theme',
          metadata: { error },
        });
        return false;
      }
    },
    [updateThemeState]
  );

  // ===== Theme Utilities =====

  // Get current theme colors
  const getCurrentThemeColors = useCallback(() => {
    return processedConfig.colors;
  }, [processedConfig.colors]);

  // Check if theme is dark mode
  const isDarkMode = useCallback(() => {
    return ['cyberpunk', 'neon'].includes(themeState.current);
  }, [themeState]);

  // Get effective contrast ratio
  const getEffectiveContrast = useCallback(() => {
    const isHighContrast = themeState.accessibility.contrast === 'high';
    const baseLevel = isHighContrast ? 1.5 : 1.0;
    return Math.min(baseLevel * 1.2, 3.0);
  }, [themeState.accessibility.contrast]);

  // Check if animations are enabled (considering both state and accessibility)
  const areAnimationsEnabled = useCallback(() => {
    return themeState.animations && !themeState.accessibility.reducedMotion;
  }, [themeState.animations, themeState.accessibility.reducedMotion]);

  // ===== Return API =====

  return {
    // Current theme state
    currentTheme: themeState.current,
    themeConfig: themeState.config,
    processedConfig,
    accessibility: themeState.accessibility,
    effectIntensity: themeState.effectIntensity,
    animations: themeState.animations,
    customColors: themeState.customColors,

    // Theme management
    changeTheme,
    updateAccessibility,
    updateEffectIntensity,
    toggleAnimations,
    updateCustomColors,
    resetTheme,

    // Storage operations
    saveThemeState,
    loadThemeState,
    clearThemeState,
    loadThemeFromStorage,
    exportThemeConfig,
    importThemeConfig,

    // Theme utilities
    getCurrentThemeColors,
    isDarkMode,
    getEffectiveContrast,
    areAnimationsEnabled,

    // Backward compatibility
    applyTheme: (config: ThemeConfig) => initializeTheme(config),
  };
}

// ===== Legacy Compatibility Functions =====

/**
 * Theme application hook for backward compatibility
 */
export function useThemeApplication(themeConfig: ThemeConfig): void {
  useEffect(() => {
    initializeTheme(themeConfig);
  }, [themeConfig]);
}

/**
 * Theme storage hook for backward compatibility
 */
export function useThemeStorage() {
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

/**
 * Legacy theme manager hook for backward compatibility
 */
export function useThemeManager(props: UseThemeProps) {
  return useTheme(props);
}
