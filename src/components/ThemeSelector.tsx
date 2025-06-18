import React, { useId } from 'react';
import type { ThemeVariant } from '../types/tetris';
import { THEME_PRESETS } from '../utils/ui/unifiedThemeSystem';
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
  // Generate unique ID for form element
  const themeSelectorId = useId();

  const handleThemeChange = (value: string) => {
    onThemeChange(value as ThemeVariant);
  };

  const themes = Object.entries(THEME_PRESETS);

  return (
    <div className={`theme-selector ${className}`}>
      <Select value={currentTheme} onValueChange={handleThemeChange}>
        <SelectTrigger
          id={themeSelectorId}
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

      {/* Theme preview - Role-based color display */}
      <div className='mt-3 p-3 rounded-lg bg-theme-primary/10 border border-theme-primary/30'>
        <div className='text-xs text-theme-foreground mb-2 font-medium'>Color Roles:</div>
        <div className='space-y-2'>
          {/* Background colors row */}
          <div className='flex items-center gap-2'>
            <span className='text-xs text-theme-muted w-16'>背景:</span>
            <div
              className='w-6 h-6 rounded border border-theme-primary/30'
              style={{ backgroundColor: THEME_PRESETS[currentTheme].colors.background }}
              title={`Background: ${THEME_PRESETS[currentTheme].colors.background}`}
            />
            <div
              className='w-6 h-6 rounded border border-theme-primary/30'
              style={{ backgroundColor: THEME_PRESETS[currentTheme].colors.surface }}
              title={`Surface: ${THEME_PRESETS[currentTheme].colors.surface}`}
            />
          </div>

          {/* Text and accent colors row */}
          <div className='flex items-center gap-2'>
            <span className='text-xs text-theme-muted w-16'>文字:</span>
            <div
              className='w-6 h-6 rounded border border-theme-primary/30'
              style={{ backgroundColor: THEME_PRESETS[currentTheme].colors.foreground }}
              title={`Foreground: ${THEME_PRESETS[currentTheme].colors.foreground}`}
            />
            <div
              className='w-6 h-6 rounded border border-theme-primary/30'
              style={{ backgroundColor: THEME_PRESETS[currentTheme].colors.muted }}
              title={`Muted: ${THEME_PRESETS[currentTheme].colors.muted}`}
            />
          </div>

          {/* Primary colors row */}
          <div className='flex items-center gap-2'>
            <span className='text-xs text-theme-muted w-16'>強調:</span>
            <div
              className='w-6 h-6 rounded border border-theme-primary/30'
              style={{ backgroundColor: THEME_PRESETS[currentTheme].colors.primary }}
              title={`Primary: ${THEME_PRESETS[currentTheme].colors.primary}`}
            />
            <div
              className='w-6 h-6 rounded border border-theme-primary/30'
              style={{ backgroundColor: THEME_PRESETS[currentTheme].colors.secondary }}
              title={`Secondary: ${THEME_PRESETS[currentTheme].colors.secondary}`}
            />
            <div
              className='w-6 h-6 rounded border border-theme-primary/30'
              style={{ backgroundColor: THEME_PRESETS[currentTheme].colors.accent }}
              title={`Accent: ${THEME_PRESETS[currentTheme].colors.accent}`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export const ThemeSelectorMemo = React.memo(ThemeSelector);
