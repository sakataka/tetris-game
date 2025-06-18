import { useMemo } from 'react';
import type { ThemeConfig, ThemeState } from '../types/tetris';
// import { adjustColorsForContrast, applyColorBlindnessFilter } from '../utils/ui'; // Removed with Color Palette Settings

export interface AccessibilityFiltersAPI {
  processedConfig: ThemeConfig;
}

/**
 * Accessibility filters processing
 *
 * Single responsibility: Apply accessibility filters to theme configuration
 * including color blindness filters and contrast adjustments.
 */
export function useAccessibilityFilters(
  baseConfig: ThemeConfig,
  _accessibility: ThemeState['accessibility']
): AccessibilityFiltersAPI {
  const processedConfig = useMemo(() => {
    const config = { ...baseConfig };

    // Color vision deficiency filters and contrast adjustment temporarily disabled
    // These features were removed along with Color Palette Settings
    // TODO: Implement new accessibility filters if needed

    // Note: accessibility.colorBlindnessType and accessibility.contrast are preserved
    // but not currently applied to theme colors

    // Animation settings are now handled by the theme manager
    // This was previously part of the old ThemeConfig structure
    // TODO: Update this when integrating with new theme system

    return config;
  }, [baseConfig]);

  return {
    processedConfig,
  };
}
