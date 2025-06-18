import React, { useId } from 'react';
import { useTranslation } from 'react-i18next';
import type { ThemeVariant } from '../types/tetris';
import { getTetrominoColors } from '../utils/ui/themeAwareTetrominoes';
import { getUnifiedThemeConfig } from '../utils/ui/unifiedThemeSystem';
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
  // Generate unique ID for form element
  const themeSelectorId = useId();

  const handleThemeChange = (value: string) => {
    onThemeChange(value as ThemeVariant);
  };

  // Use the EXACT same source as actual game rendering
  const currentThemeConfig = getUnifiedThemeConfig(currentTheme);

  // Get all available themes using the same function as actual rendering
  const themes: Array<{ variant: ThemeVariant; config: typeof currentThemeConfig; name: string }> =
    (['cyberpunk', 'classic', 'retro', 'minimal', 'neon'] as ThemeVariant[]).map((variant) => ({
      variant,
      config: getUnifiedThemeConfig(variant),
      name: getUnifiedThemeConfig(variant).name,
    }));
  const actualTetrominoColors = getTetrominoColors(currentTheme);

  // Get actual colors from CSS variables (same as game uses)
  const actualBackgroundColor =
    typeof window !== 'undefined'
      ? getComputedStyle(document.documentElement).getPropertyValue('--theme-background').trim()
      : currentThemeConfig.background;
  const actualForegroundColor =
    typeof window !== 'undefined'
      ? getComputedStyle(document.documentElement).getPropertyValue('--theme-foreground').trim()
      : currentThemeConfig.foreground;

  return (
    <div className={`theme-selector ${className}`}>
      <Select value={currentTheme} onValueChange={handleThemeChange}>
        <SelectTrigger
          id={themeSelectorId}
          data-testid='theme-selector'
          className='w-full p-3 rounded-lg border focus:outline-none focus:ring-2 transition-colors'
          style={{
            backgroundColor: actualBackgroundColor,
            borderColor: `${actualForegroundColor}40`, // 25% opacity
            color: actualForegroundColor,
          }}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent
          className='border rounded-lg'
          style={{
            backgroundColor: actualBackgroundColor,
            borderColor: `${actualForegroundColor}40`,
          }}
        >
          {themes.map(({ variant, name }) => (
            <SelectItem
              key={variant}
              value={variant}
              className='transition-colors'
              style={{
                color: actualForegroundColor,
              }}
            >
              {name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Simplified theme preview - Only 3 color types */}
      <div
        className='mt-3 p-3 rounded-lg border'
        style={{
          backgroundColor: actualBackgroundColor,
          borderColor: `${actualForegroundColor}40`,
        }}
      >
        <div className='text-xs mb-3 font-medium' style={{ color: actualForegroundColor }}>
          {t('themes.preview')}
        </div>

        {/* Background & Foreground */}
        <div className='mb-3'>
          <div className='flex items-center gap-4 mb-2'>
            <span className='text-xs w-20 opacity-70' style={{ color: actualForegroundColor }}>
              {t('themes.background')}:
            </span>
            <div
              className='w-6 h-6 rounded border'
              style={{
                backgroundColor: actualBackgroundColor,
                borderColor: `${actualForegroundColor}60`,
              }}
              title={`Background: ${actualBackgroundColor}`}
            />
          </div>
          <div className='flex items-center gap-4 mb-2'>
            <span className='text-xs w-20 opacity-70' style={{ color: actualForegroundColor }}>
              {t('themes.foreground')}:
            </span>
            <div
              className='w-6 h-6 rounded border'
              style={{
                backgroundColor: actualForegroundColor,
                borderColor: `${actualForegroundColor}60`,
              }}
              title={`Text: ${actualForegroundColor}`}
            />
          </div>
        </div>

        {/* Tetromino Colors - Using EXACT same source as game */}
        <div>
          <div className='text-xs mb-2 font-medium' style={{ color: actualForegroundColor }}>
            {t('themes.tetrominoColors')}
          </div>
          <div className='flex items-center gap-1 flex-wrap'>
            {Object.entries(actualTetrominoColors).map(([piece, color]) => (
              <div key={piece} className='flex flex-col items-center gap-1'>
                <div
                  className='w-5 h-5 rounded border'
                  style={{
                    backgroundColor: color,
                    borderColor: `${actualForegroundColor}60`,
                  }}
                  title={`${piece} piece: ${color}`}
                />
                <span className='text-xs opacity-60' style={{ color: actualForegroundColor }}>
                  {piece}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export const ThemeSelectorMemo = React.memo(ThemeSelector);
