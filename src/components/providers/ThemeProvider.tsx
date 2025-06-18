/**
 * Theme Provider Component
 *
 * Initializes the theme system and provides theme context to the app.
 * Ensures theme is applied consistently across all components.
 */

import { useEffect } from 'react';
import { useThemeStore } from '../../store/themeStore';
import { applyUnifiedThemeToDocument } from '../../utils/ui/unifiedThemeSystem';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { theme } = useThemeStore();

  useEffect(() => {
    // Initialize theme system on mount
    applyUnifiedThemeToDocument(theme.current || 'cyberpunk');
  }, [theme.current]);

  return <>{children}</>;
}

export default ThemeProvider;
