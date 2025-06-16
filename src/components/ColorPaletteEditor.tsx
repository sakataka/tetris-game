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
      <Label htmlFor={colorInputId} className='block text-sm font-medium mb-1 text-cyber-cyan'>
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
              'w-10 h-10 rounded-md border-2 border-cyber-cyan-30 cursor-pointer',
              'hover:border-cyber-cyan transition-colors duration-200',
              'focus:outline-none focus:ring-2 focus:ring-cyber-cyan focus:border-cyber-cyan',
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
            'bg-cyber-cyan-10 border-cyber-cyan-30 text-foreground',
            'focus-visible:ring-cyber-cyan focus-visible:border-cyber-cyan',
            'hover:bg-cyber-cyan-20 transition-colors'
          )}
        />
      </div>
      {description && (
        <p id={`${colorInputId}-description`} className='text-xs text-cyan-400 mt-1'>
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
      description: 'Main accent color (neon effects, etc.)',
    },
    {
      key: 'secondary',
      label: t('colorPalette.secondaryColor'),
      description: 'Secondary accent color',
    },
    {
      key: 'tertiary',
      label: t('colorPalette.tertiaryColor'),
      description: 'Tertiary accent color',
    },
    {
      key: 'background',
      label: t('colorPalette.backgroundColor'),
      description: 'Main background color',
    },
    {
      key: 'foreground',
      label: t('colorPalette.textColor'),
      description: 'Primary text color',
    },
    {
      key: 'accent',
      label: t('colorPalette.accentColor'),
      description: 'Accent color (for special elements)',
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
        <h3 className='text-lg font-bold text-cyber-cyan'>{t('colorPalette.title')}</h3>
        <Button
          variant='outline'
          size='sm'
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            'border-cyan-400/30 text-cyan-400 hover:bg-cyan-500/10',
            'bg-cyan-500/5 hover:text-cyan-400'
          )}
        >
          {isExpanded ? t('colorPalette.collapse') : t('colorPalette.advancedSettings')}
        </Button>
      </div>

      {/* Color preview (always displayed) */}
      <div className='mb-4 p-3 rounded-lg bg-cyber-cyan-10 border border-cyber-cyan-30'>
        <div className='text-sm font-medium mb-2 text-cyber-cyan'>{t('colorPalette.preview')}</div>
        <div className='grid grid-cols-6 gap-2'>
          {colorFields.map(({ key, label }) => (
            <div key={key} className='text-center'>
              <div
                className='w-full h-8 rounded border border-cyber-cyan-30 mb-1'
                style={{ backgroundColor: colors[key] }}
              />
              <div className='text-xs text-cyber-cyan truncate' title={label}>
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
                'bg-cyber-red-20 border border-cyber-red-30 text-cyber-red',
                'hover:bg-cyber-red-30 hover:text-cyber-red'
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
