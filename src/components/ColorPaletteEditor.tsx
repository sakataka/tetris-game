'use client';

import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ColorPalette } from '../types/tetris';

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

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.value;
      setInputValue(newValue);

      // Check if it's a valid hex color
      if (/^#[0-9A-F]{6}$/i.test(newValue)) {
        onChange(newValue);
      }
    },
    [onChange]
  );

  const handleBlur = useCallback(() => {
    // Correct to valid value when focus is lost
    if (!/^#[0-9A-F]{6}$/i.test(inputValue)) {
      setInputValue(value);
    }
  }, [inputValue, value]);

  return (
    <div className='color-input mb-3'>
      <label className='block text-sm font-medium mb-1 text-cyber-cyan'>{label}</label>
      <div className='flex gap-2 items-center'>
        <input
          type='color'
          value={value}
          onChange={(e) => {
            setInputValue(e.target.value);
            onChange(e.target.value);
          }}
          className='w-10 h-10 rounded border border-cyber-cyan-30 cursor-pointer
                     hover:border-cyber-cyan transition-colors'
        />
        <input
          type='text'
          value={inputValue}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder='#FFFFFF'
          className='flex-1 p-2 rounded bg-cyber-cyan-10 border border-cyber-cyan-30 
                     text-foreground focus:outline-none focus:ring-2 focus:ring-cyber-cyan
                     hover:bg-cyber-cyan-20 transition-colors font-mono text-sm'
        />
      </div>
      {description && <p className='text-xs text-cyber-purple mt-1'>{description}</p>}
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

  const handleColorChange = useCallback(
    (key: keyof ColorPalette, value: string) => {
      onColorsChange({ [key]: value });
    },
    [onColorsChange]
  );

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

  const resetToDefaults = useCallback(() => {
    const defaultColors: ColorPalette = {
      primary: '#00ffff',
      secondary: '#ff00ff',
      tertiary: '#ffff00',
      background: '#0a0a0f',
      foreground: '#ffffff',
      accent: '#00ff00',
    };
    onColorsChange(defaultColors);
  }, [onColorsChange]);

  return (
    <div className={`color-palette-editor ${className}`}>
      <div className='flex items-center justify-between mb-3'>
        <h3 className='text-lg font-bold text-cyber-cyan'>{t('colorPalette.title')}</h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className='px-3 py-1 rounded bg-cyber-purple-20 border border-cyber-purple-30
                     text-cyber-purple hover:bg-cyber-purple-30 transition-colors text-sm'
        >
          {isExpanded ? t('colorPalette.collapse') : t('colorPalette.advancedSettings')}
        </button>
      </div>

      {/* Color preview (always displayed) */}
      <div className='mb-4 p-3 rounded-lg hologram'>
        <div className='text-sm font-medium mb-2 text-cyber-cyan'>{t('colorPalette.preview')}</div>
        <div className='grid grid-cols-6 gap-2'>
          {colorFields.map(({ key, label }) => (
            <div key={key} className='text-center'>
              <div
                className='w-full h-8 rounded border border-cyber-cyan-30 mb-1'
                style={{ backgroundColor: colors[key] }}
              />
              <div className='text-xs text-cyber-purple truncate' title={label}>
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
            <button
              onClick={resetToDefaults}
              className='px-4 py-2 rounded bg-cyber-yellow-20 border border-cyber-yellow-30
                         text-cyber-yellow hover:bg-cyber-yellow-30 transition-colors text-sm'
            >
              {t('colorPalette.resetToDefaults')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export const ColorPaletteEditorMemo = React.memo(ColorPaletteEditor);
