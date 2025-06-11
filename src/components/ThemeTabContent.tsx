'use client';

import { memo } from 'react';
import { ThemeSettingsMemo } from './ThemeSettings';
import {
  useTheme,
  useSetTheme,
  useSetCustomColors,
  useSetAccessibilityOptions,
  useUpdateThemeState,
  useResetThemeToDefault,
} from '../store/themeStore';
import { useThemeManager } from '../hooks/useThemeManager';

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
    <div className={className}>
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
