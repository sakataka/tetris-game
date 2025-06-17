import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme as useThemeManager } from '../hooks/useTheme';
import {
  useResetThemeToDefault,
  useSetAccessibilityOptions,
  useSetTheme,
  useTheme,
  useUpdateThemeState,
} from '../store/themeStore';
import { ThemeSettingsMemo } from './ThemeSettings';
import CyberCard from './ui/CyberCard';

interface ThemeTabContentProps {
  className?: string;
}

const ThemeTabContent = memo(function ThemeTabContent({ className = '' }: ThemeTabContentProps) {
  const { t } = useTranslation();
  // Theme-related state and actions
  const themeState = useTheme();
  const setTheme = useSetTheme();
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
    <div className={`max-w-4xl ${className}`}>
      <CyberCard title={t('themes.title') || t('tabs.themes')} theme='primary' size='lg'>
        <ThemeSettingsMemo
          currentTheme={themeState.current}
          colorBlindnessType={themeState.accessibility.colorBlindnessType}
          contrast={themeState.accessibility.contrast}
          animationIntensity={themeState.accessibility.animationIntensity}
          reducedMotion={themeState.accessibility.reducedMotion}
          effectIntensity={themeState.effectIntensity}
          animations={themeState.animations}
          onThemeChange={themeManager.changeTheme}
          onAccessibilityChange={themeManager.updateAccessibility}
          onEffectIntensityChange={themeManager.updateEffectIntensity}
          onAnimationsToggle={themeManager.toggleAnimations}
          onResetToDefault={resetThemeToDefault}
        />
      </CyberCard>
    </div>
  );
});

export default ThemeTabContent;
