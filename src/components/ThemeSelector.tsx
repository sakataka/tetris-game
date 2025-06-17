import React from 'react';
import { useTranslation } from 'react-i18next';
import type { ThemeVariant } from '../types/tetris';
import { THEME_PRESETS } from '../utils/ui';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface ThemeSelectorProps {
  currentTheme: ThemeVariant;
  onThemeChange: (theme: ThemeVariant) => void;
  className?: string;
}

export default function ThemeSelector({
  currentTheme,
  onThemeChange,
  className = '',
}: ThemeSelectorProps) {
  const { t } = useTranslation();
  const handleThemeChange = (value: string) => {
    onThemeChange(value as ThemeVariant);
  };

  const themes = Object.entries(THEME_PRESETS);

  return (
    <div className={`theme-selector ${className}`}>
      <Label htmlFor='theme-selector' className='block text-sm font-medium mb-2 text-theme-primary'>
        {t('themes.preview')}
      </Label>
      <Select value={currentTheme} onValueChange={handleThemeChange}>
        <SelectTrigger
          id='theme-selector'
          data-testid='theme-selector'
          className='w-full p-3 rounded-lg bg-theme-primary/10 border border-theme-primary/30 
                     text-foreground focus:outline-none focus:ring-2 focus:ring-theme-primary
                     hover:bg-theme-primary/20 transition-colors
                     [&>span]:text-foreground'
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent className='bg-background border-theme-primary/30'>
          {themes.map(([variant, config]) => (
            <SelectItem
              key={variant}
              value={variant}
              className='text-foreground hover:bg-theme-primary/20 focus:bg-theme-primary/20 focus:text-theme-primary'
            >
              {config.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Theme preview */}
      <div className='mt-3 p-3 rounded-lg bg-theme-primary/10 border border-theme-primary/30'>
        <div className='flex gap-2'>
          {Object.entries(THEME_PRESETS[currentTheme].colors)
            .slice(0, 3)
            .map(([key, color]) => (
              <div
                key={key}
                className='w-6 h-6 rounded border border-theme-primary/30'
                style={{ backgroundColor: color }}
                title={`${key}: ${color}`}
              />
            ))}
        </div>
        <div className='text-xs text-theme-primary mt-2'>
          {t('accessibility.motion')}: {THEME_PRESETS[currentTheme].effects.glow}px
        </div>
      </div>
    </div>
  );
}

export const ThemeSelectorMemo = React.memo(ThemeSelector);
