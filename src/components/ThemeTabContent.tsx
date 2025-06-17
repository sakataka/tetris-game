import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme as useThemeManager } from '../hooks/useTheme';
import {
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
  const updateThemeState = useUpdateThemeState();

  const themeManager = useThemeManager({
    themeState,
    setTheme,
    updateThemeState,
    setAccessibilityOptions: () => {}, // Placeholder since accessibility options are disabled
  });

  return (
    <div className={`max-w-4xl ${className}`}>
      <CyberCard title={t('themes.title') || t('tabs.themes')} theme='primary' size='lg'>
        <ThemeSettingsMemo
          currentTheme={themeState.current}
          effectIntensity={themeState.effectIntensity}
          animations={themeState.animations}
          onThemeChange={themeManager.changeTheme}
          onEffectIntensityChange={themeManager.updateEffectIntensity}
          onAnimationsToggle={themeManager.toggleAnimations}
        />
      </CyberCard>
    </div>
  );
});

export default ThemeTabContent;
