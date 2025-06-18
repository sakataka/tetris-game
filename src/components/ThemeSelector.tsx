import React, { useId } from 'react';
import type { ThemeVariant } from '../types/tetris';
import { THEME_PRESETS } from '../utils/ui';
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

      {/* Theme preview - 6 representative colors */}
      <div className='mt-3 p-3 rounded-lg bg-theme-primary/10 border border-theme-primary/30'>
        <div className='grid grid-cols-6 gap-2'>
          {(() => {
            // Select most representative colors for each theme
            const colorKeys = (() => {
              switch (currentTheme) {
                case 'cyberpunk':
                  return ['primary', 'secondary', 'tertiary', 'accent', 'background', 'surface'];
                case 'classic':
                  return ['primary', 'secondary', 'tertiary', 'background', 'accent', 'surface'];
                case 'retro':
                  return ['primary', 'secondary', 'tertiary', 'accent', 'background', 'surface'];
                case 'neon':
                  return ['primary', 'secondary', 'tertiary', 'accent', 'background', 'surface'];
                case 'minimal':
                  return ['primary', 'secondary', 'tertiary', 'accent', 'background', 'surface'];
                default:
                  return ['primary', 'secondary', 'tertiary', 'accent', 'neutral', 'surface'];
              }
            })();
            
            return colorKeys.map((colorKey) => {
              const color = THEME_PRESETS[currentTheme].colors[colorKey as keyof typeof THEME_PRESETS[typeof currentTheme]['colors']];
              return (
                <div
                  key={colorKey}
                  className='w-6 h-6 rounded border border-theme-primary/30'
                  style={{ backgroundColor: color as string }}
                  title={`${colorKey}: ${color}`}
                />
              );
            });
          })()}
        </div>
      </div>
    </div>
  );
}

export const ThemeSelectorMemo = React.memo(ThemeSelector);
