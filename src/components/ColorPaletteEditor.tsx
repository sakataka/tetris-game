import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/utils/ui/cn';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ColorPalette } from '../types/tetris';

interface ColorPaletteEditorProps {
  colors: ColorPalette;
  onColorsChange: (colors: Partial<ColorPalette>) => void;
  className?: string;
}

interface ColorInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  description?: string;
}

function ColorInput({ label, value, onChange, description }: ColorInputProps) {
  const [inputValue, setInputValue] = useState(value);
  const colorInputId = `color-input-${label.toLowerCase().replace(/\s+/g, '-')}`;

  // Event handlers (React Compiler will optimize these)
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setInputValue(newValue);

    // Check if it's a valid hex color
    if (/^#[0-9A-F]{6}$/i.test(newValue)) {
      onChange(newValue);
    }
  };

  const handleBlur = () => {
    // Correct to valid value when focus is lost
    if (!/^#[0-9A-F]{6}$/i.test(inputValue)) {
      setInputValue(value);
    }
  };

  return (
    <div className='color-input mb-3'>
      <Label htmlFor={colorInputId} className='block text-sm font-medium mb-1 text-theme-primary'>
        {label}
      </Label>
      <div className='flex gap-2 items-center'>
        <div className='relative'>
          <input
            id={colorInputId}
            type='color'
            value={value}
            onChange={(e) => {
              setInputValue(e.target.value);
              onChange(e.target.value);
            }}
            className={cn(
              'w-10 h-10 rounded-md border-2 border-theme-primary/30 cursor-pointer',
              'hover:border-theme-primary transition-colors duration-200',
              'focus:outline-none focus:ring-2 focus:ring-theme-primary focus:border-theme-primary',
              'disabled:cursor-not-allowed disabled:opacity-50'
            )}
            aria-describedby={`${colorInputId}-description`}
          />
        </div>
        <Input
          type='text'
          value={inputValue}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder='#FFFFFF'
          className={cn(
            'flex-1 font-mono text-sm',
            'bg-theme-primary/10 border-theme-primary/30 text-foreground',
            'focus-visible:ring-theme-primary focus-visible:border-theme-primary',
            'hover:bg-theme-primary/20 transition-colors'
          )}
        />
      </div>
      {description && (
        <p id={`${colorInputId}-description`} className='text-xs text-theme-primary mt-1'>
          {description}
        </p>
      )}
    </div>
  );
}

export default function ColorPaletteEditor({
  colors,
  onColorsChange,
  className = '',
}: ColorPaletteEditorProps) {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  // Event handler (React Compiler will optimize this)
  const handleColorChange = (key: keyof ColorPalette, value: string) => {
    onColorsChange({ [key]: value });
  };

  const colorFields: Array<{
    key: keyof ColorPalette;
    label: string;
    description: string;
  }> = [
    {
      key: 'primary',
      label: t('colorPalette.primaryColor'),
      description: t('colorPalette.primaryColorDesc'),
    },
    {
      key: 'secondary',
      label: t('colorPalette.secondaryColor'),
      description: t('colorPalette.secondaryColorDesc'),
    },
    {
      key: 'tertiary',
      label: t('colorPalette.tertiaryColor'),
      description: t('colorPalette.tertiaryColorDesc'),
    },
    {
      key: 'background',
      label: t('colorPalette.backgroundColor'),
      description: t('colorPalette.backgroundColorDesc'),
    },
    {
      key: 'foreground',
      label: t('colorPalette.textColor'),
      description: t('colorPalette.textColorDesc'),
    },
    {
      key: 'accent',
      label: t('colorPalette.accentColor'),
      description: t('colorPalette.accentColorDesc'),
    },
  ];

  const resetToDefaults = () => {
    const defaultColors: ColorPalette = {
      primary: '#00ffff',
      secondary: '#ff00ff',
      tertiary: '#ffff00',
      background: '#0a0a0f',
      foreground: '#ffffff',
      accent: '#00ff00',
    };
    onColorsChange(defaultColors);
  };

  return (
    <div className={`color-palette-editor ${className}`}>
      <div className='flex items-center justify-between mb-3'>
        <h3 className='text-lg font-bold text-theme-primary'>{t('colorPalette.title')}</h3>
        <Button
          variant='outline'
          size='sm'
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            'border-theme-primary/30 text-theme-primary hover:bg-theme-primary/10',
            'bg-theme-primary/5 hover:text-theme-primary'
          )}
        >
          {isExpanded ? t('colorPalette.collapse') : t('colorPalette.advancedSettings')}
        </Button>
      </div>

      {/* Color preview (always displayed) */}
      <div className='mb-4 p-3 rounded-lg bg-theme-primary/10 border border-theme-primary/30'>
        <div className='text-sm font-medium mb-2 text-theme-primary'>
          {t('colorPalette.preview')}
        </div>
        <div className='grid grid-cols-6 gap-2'>
          {colorFields.map(({ key, label }) => (
            <div key={key} className='text-center'>
              <div
                className='w-full h-8 rounded border border-theme-primary/30 mb-1'
                style={{ backgroundColor: colors[key] }}
              />
              <div className='text-xs text-theme-primary truncate' title={label}>
                {label.slice(0, 4)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed settings (when expanded only) */}
      {isExpanded && (
        <div className='space-y-1'>
          {colorFields.map(({ key, label, description }) => (
            <ColorInput
              key={key}
              label={label}
              value={colors[key]}
              onChange={(value) => handleColorChange(key, value)}
              description={description}
            />
          ))}

          <div className='flex gap-2 mt-4'>
            <Button
              variant='destructive'
              size='sm'
              onClick={resetToDefaults}
              className={cn(
                'bg-theme-error/20 border border-theme-error/30 text-theme-error',
                'hover:bg-theme-error/30 hover:text-theme-error'
              )}
            >
              {t('buttons.reset')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export const ColorPaletteEditorMemo = React.memo(ColorPaletteEditor);
