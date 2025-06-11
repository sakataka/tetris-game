import { useMemo } from 'react';
import { applyColorBlindnessFilter, adjustColorsForContrast } from '../utils/ui';
import type { ThemeConfig, ThemeState } from '../types/tetris';

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
  accessibility: ThemeState['accessibility']
): AccessibilityFiltersAPI {
  const processedConfig = useMemo(() => {
    let config = { ...baseConfig };

    // Apply color vision deficiency filters
    if (accessibility.colorBlindnessType !== 'none') {
      config.colors = applyColorBlindnessFilter(config.colors, accessibility.colorBlindnessType);
    }

    // Apply contrast adjustment
    if (accessibility.contrast !== 'normal') {
      config.colors = adjustColorsForContrast(config.colors, accessibility.contrast);
    }

    // Update animation settings
    config = {
      ...config,
      accessibility: {
        ...config.accessibility,
        animationIntensity: accessibility.animationIntensity,
      },
    };

    return config;
  }, [baseConfig, accessibility]);

  return {
    processedConfig,
  };
}
