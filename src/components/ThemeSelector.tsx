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

  // Use CSS variables directly - they're already set by the theme system

  return (
    <div className={`theme-selector ${className}`}>
      <Select value={currentTheme} onValueChange={handleThemeChange}>
        <SelectTrigger
          id={themeSelectorId}
          data-testid='theme-selector'
          className='w-full p-3 rounded-lg border focus:outline-none focus:ring-2 transition-colors bg-theme-background text-theme-foreground border-theme-foreground border-opacity-30'
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent
          className='border rounded-lg bg-theme-background border-theme-foreground border-opacity-30'
        >
          {themes.map(({ variant, name }) => (
            <SelectItem
              key={variant}
              value={variant}
              className='transition-colors text-theme-foreground'
            >
              {name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Simplified theme preview - Only 3 color types */}
      <div className='mt-3 p-3 rounded-lg border bg-theme-background border-theme-foreground border-opacity-30'>
        <div className='text-xs mb-3 font-medium text-theme-foreground'>
          {t('themes.preview')}
        </div>

        {/* Background & Foreground */}
        <div className='mb-3'>
          <div className='flex items-center gap-4 mb-2'>
            <span className='text-xs w-20 text-theme-foreground opacity-70'>
              {t('themes.background')}:
            </span>
            <div
              className='w-6 h-6 rounded border bg-theme-background border-theme-foreground border-opacity-60'
              title={t('themes.backgroundTooltip', { color: currentThemeConfig.background })}
            />
          </div>
          <div className='flex items-center gap-4 mb-2'>
            <span className='text-xs w-20 text-theme-foreground opacity-70'>
              {t('themes.foreground')}:
            </span>
            <div
              className='w-6 h-6 rounded border bg-theme-foreground border-theme-foreground border-opacity-60'
              title={t('themes.textTooltip', { color: currentThemeConfig.foreground })}
            />
          </div>
        </div>

        {/* Tetromino Colors - Using EXACT same source as game */}
        <div>
          <div className='text-xs mb-2 font-medium text-theme-foreground'>
            {t('themes.tetrominoColors')}
          </div>
          <div className='flex items-center gap-1 flex-wrap'>
            {Object.entries(actualTetrominoColors).map(([piece, color]) => (
              <div key={piece} className='flex flex-col items-center gap-1'>
                <div
                  className='w-5 h-5 rounded border border-theme-foreground border-opacity-60'
                  style={{ backgroundColor: color }}
                  title={t('themes.pieceTooltip', { piece, color })}
                />
                <span className='text-xs text-theme-foreground opacity-60'>
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
