'use client';

import React, { useCallback } from 'react';
import { ThemeVariant } from '../types/tetris';
import { THEME_PRESETS } from '../utils/ui';

interface ThemeSelectorProps {
  currentTheme: ThemeVariant;
  onThemeChange: (theme: ThemeVariant) => void;
  className?: string;
}

export default function ThemeSelector({
  currentTheme,
  onThemeChange,
  className = ''
}: ThemeSelectorProps) {
  
  const handleThemeChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    onThemeChange(event.target.value as ThemeVariant);
  }, [onThemeChange]);

  const themes = Object.entries(THEME_PRESETS);

  return (
    <div className={`theme-selector ${className}`}>
      <label className="block text-sm font-medium mb-2 text-cyber-cyan">
        テーマ選択
      </label>
      <select
        value={currentTheme}
        onChange={handleThemeChange}
        className="w-full p-3 rounded-lg bg-cyber-cyan-10 border border-cyber-cyan-30 
                   text-foreground focus:outline-none focus:ring-2 focus:ring-cyber-cyan
                   hover:bg-cyber-cyan-20 transition-colors"
      >
        {themes.map(([variant, config]) => (
          <option 
            key={variant} 
            value={variant}
            className="bg-background text-foreground"
          >
            {config.name}
          </option>
        ))}
      </select>
      
      {/* テーマプレビュー */}
      <div className="mt-3 p-3 rounded-lg hologram">
        <div className="text-xs text-cyber-cyan mb-2">プレビュー:</div>
        <div className="flex gap-2">
          {Object.entries(THEME_PRESETS[currentTheme].colors).slice(0, 3).map(([key, color]) => (
            <div
              key={key}
              className="w-6 h-6 rounded border border-cyber-cyan-30"
              style={{ backgroundColor: color }}
              title={`${key}: ${color}`}
            />
          ))}
        </div>
        <div className="text-xs text-cyber-purple mt-2">
          エフェクト強度: {THEME_PRESETS[currentTheme].effects.glow}px
        </div>
      </div>
    </div>
  );
}

export const ThemeSelectorMemo = React.memo(ThemeSelector);