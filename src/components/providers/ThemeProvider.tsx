/**
 * Theme Provider Component
 * 
 * Initializes the theme system and provides theme context to the app.
 * Ensures theme is applied consistently across all components.
 */

import { useEffect } from 'react';
import { useThemeStore } from '../../store/themeStore';
import { initializeThemeSystem } from '../../utils/ui/themeManager';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { theme } = useThemeStore();

  useEffect(() => {
    // Initialize theme system on mount
    if (theme.current) {
      initializeThemeSystem(theme.current);
    } else {
      initializeThemeSystem();
    }
  }, [theme.current]);

  return <>{children}</>;
}

export default ThemeProvider;