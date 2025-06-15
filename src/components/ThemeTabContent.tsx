import { memo } from 'react';
import { useTheme as useThemeManager } from '../hooks/useTheme';
import {
  useResetThemeToDefault,
  useSetAccessibilityOptions,
  useSetCustomColors,
  useSetTheme,
  useTheme,
  useUpdateThemeState,
} from '../store/themeStore';
import { ThemeSettingsMemo } from './ThemeSettings';

interface ThemeTabContentProps {
  className?: string;
}

const ThemeTabContent = memo(function ThemeTabContent({ className = '' }: ThemeTabContentProps) {
  // Theme-related state and actions
  const themeState = useTheme();
  const setTheme = useSetTheme();
  const setCustomColors = useSetCustomColors();
  const setAccessibilityOptions = useSetAccessibilityOptions();
  const updateThemeState = useUpdateThemeState();
  const resetThemeToDefault = useResetThemeToDefault();

  const themeManager = useThemeManager({
    themeState,
    setTheme,
    updateThemeState,
    setAccessibilityOptions,
  });

  return (
    <div className={`space-y-4 p-3 ${className}`}>
      <ThemeSettingsMemo
        currentTheme={themeState.current}
        colors={themeState.config.colors}
        colorBlindnessType={themeState.accessibility.colorBlindnessType}
        contrast={themeState.accessibility.contrast}
        animationIntensity={themeState.accessibility.animationIntensity}
        reducedMotion={themeState.accessibility.reducedMotion}
        effectIntensity={themeState.effectIntensity}
        animations={themeState.animations}
        onThemeChange={themeManager.changeTheme}
        onColorsChange={setCustomColors}
        onAccessibilityChange={themeManager.updateAccessibility}
        onEffectIntensityChange={themeManager.updateEffectIntensity}
        onAnimationsToggle={themeManager.toggleAnimations}
        onResetToDefault={resetThemeToDefault}
      />
    </div>
  );
});

export default ThemeTabContent;
