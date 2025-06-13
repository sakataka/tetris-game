import { useEffect } from 'react';
import type { ThemeState } from '../types/tetris';
import { log } from '../utils/logging';

export interface SystemPreferencesAPI {
  // This hook only provides side effects, no return API needed
  // Using object type to satisfy ESLint no-empty-object-type rule
  readonly _sideEffectsOnly: true;
}

/**
 * System preferences monitoring
 *
 * Single responsibility: Monitor system-level accessibility and theme preferences
 * and trigger callbacks when they change.
 */
export function useSystemPreferences(
  currentAccessibility: ThemeState['accessibility'],
  onAccessibilityChange: (accessibility: Partial<ThemeState['accessibility']>) => void
): void {
  // Monitor system color scheme changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      // Log system color scheme changes for debugging
      log.debug('System color scheme changed', {
        component: 'SystemPreferences',
        metadata: { scheme: e.matches ? 'dark' : 'light' },
      });
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, []);

  // Monitor accessibility settings changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const handleReducedMotionChange = (e: MediaQueryListEvent) => {
      if (e.matches && currentAccessibility.animationIntensity === 'enhanced') {
        onAccessibilityChange({
          animationIntensity: 'reduced',
          reducedMotion: true,
        });
      }
    };

    mediaQuery.addEventListener('change', handleReducedMotionChange);
    return () => mediaQuery.removeEventListener('change', handleReducedMotionChange);
  }, [currentAccessibility.animationIntensity, onAccessibilityChange]);
}
