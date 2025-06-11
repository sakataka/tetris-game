import { useEffect, useCallback } from 'react';
import { ThemeVariant, ThemeState } from '../types/tetris';
import { initializeTheme, applyColorBlindnessFilter, adjustColorsForContrast } from '../utils/ui';
import { log } from '../utils/logging';

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
  // Theme initialization and application
  useEffect(() => {
    let config = { ...themeState.config };

    // Apply color vision deficiency filters
    if (themeState.accessibility.colorBlindnessType !== 'none') {
      config.colors = applyColorBlindnessFilter(
        config.colors,
        themeState.accessibility.colorBlindnessType
      );
    }

    // Apply contrast adjustment
    if (themeState.accessibility.contrast !== 'normal') {
      config.colors = adjustColorsForContrast(config.colors, themeState.accessibility.contrast);
    }

    // Update animation settings
    config = {
      ...config,
      accessibility: {
        ...config.accessibility,
        animationIntensity: themeState.accessibility.animationIntensity,
      },
    };

    // Apply theme
    initializeTheme(config);

    // Save to localStorage
    try {
      localStorage.setItem('tetris-theme-state', JSON.stringify(themeState));
    } catch (error) {
      log.warn('Failed to save theme state to localStorage', {
        component: 'ThemeManager',
        metadata: { error },
      });
    }
  }, [themeState]);

  // Monitor system color scheme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      // Process when system color scheme changes (if necessary)
      log.debug('System color scheme changed', {
        component: 'ThemeManager',
        metadata: { scheme: e.matches ? 'dark' : 'light' },
      });
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, []);

  // Monitor accessibility settings changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const handleReducedMotionChange = (e: MediaQueryListEvent) => {
      if (e.matches && themeState.accessibility.animationIntensity === 'enhanced') {
        setAccessibilityOptions({
          animationIntensity: 'reduced',
          reducedMotion: true,
        });
      }
    };

    mediaQuery.addEventListener('change', handleReducedMotionChange);
    return () => mediaQuery.removeEventListener('change', handleReducedMotionChange);
  }, [themeState.accessibility.animationIntensity, setAccessibilityOptions]);

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
    try {
      const savedState = localStorage.getItem('tetris-theme-state');
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        updateThemeState(parsedState);
        return true;
      }
    } catch (error) {
      log.warn('Failed to load theme state from localStorage', {
        component: 'ThemeManager',
        metadata: { error },
      });
    }
    return false;
  }, [updateThemeState]);

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
