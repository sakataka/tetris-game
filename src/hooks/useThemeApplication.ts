import { useEffect } from 'react';
import { initializeTheme } from '../utils/ui';
import type { ThemeConfig } from '../types/tetris';

export interface ThemeApplicationAPI {
  applyTheme: (config: ThemeConfig) => void;
}

/**
 * Theme application to DOM
 *
 * Single responsibility: Apply theme configuration to CSS variables
 * and initialize theme in the DOM.
 */
export function useThemeApplication(themeConfig: ThemeConfig): void {
  useEffect(() => {
    // Apply theme configuration to DOM
    initializeTheme(themeConfig);
  }, [themeConfig]);
}
