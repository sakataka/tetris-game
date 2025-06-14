'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import type { ThemeVariant } from '../types/tetris';
import { THEME_PRESETS } from '../utils/ui';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

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
      <label htmlFor='theme-selector' className='block text-sm font-medium mb-2 text-cyber-cyan'>
        {t('themes.preview')}
      </label>
      <Select value={currentTheme} onValueChange={handleThemeChange}>
        <SelectTrigger
          id='theme-selector'
          className='w-full p-3 rounded-lg bg-cyber-cyan-10 border border-cyber-cyan-30 
                     text-foreground focus:outline-none focus:ring-2 focus:ring-cyber-cyan
                     hover:bg-cyber-cyan-20 transition-colors
                     [&>span]:text-foreground'
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent className='bg-background border-cyber-cyan-30'>
          {themes.map(([variant, config]) => (
            <SelectItem
              key={variant}
              value={variant}
              className='text-foreground hover:bg-cyber-cyan-20 focus:bg-cyber-cyan-20 focus:text-cyber-cyan'
            >
              {config.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Theme preview */}
      <div className='mt-3 p-3 rounded-lg hologram'>
        <div className='flex gap-2'>
          {Object.entries(THEME_PRESETS[currentTheme].colors)
            .slice(0, 3)
            .map(([key, color]) => (
              <div
                key={key}
                className='w-6 h-6 rounded border border-cyber-cyan-30'
                style={{ backgroundColor: color }}
                title={`${key}: ${color}`}
              />
            ))}
        </div>
        <div className='text-xs text-cyber-purple mt-2'>
          {t('accessibility.motion')}: {THEME_PRESETS[currentTheme].effects.glow}px
        </div>
      </div>
    </div>
  );
}

export const ThemeSelectorMemo = React.memo(ThemeSelector);
