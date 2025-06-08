'use client';

import React, { useCallback } from 'react';
import { ColorBlindnessType, ContrastLevel, AnimationIntensity } from '../types/tetris';

interface AccessibilitySettingsProps {
  colorBlindnessType: ColorBlindnessType;
  contrast: ContrastLevel;
  animationIntensity: AnimationIntensity;
  reducedMotion: boolean;
  onSettingsChange: (settings: {
    colorBlindnessType?: ColorBlindnessType;
    contrast?: ContrastLevel;
    animationIntensity?: AnimationIntensity;
    reducedMotion?: boolean;
  }) => void;
  className?: string;
}

export default function AccessibilitySettings({
  colorBlindnessType,
  contrast,
  animationIntensity,
  reducedMotion,
  onSettingsChange,
  className = ''
}: AccessibilitySettingsProps) {

  const handleColorBlindnessChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    onSettingsChange({ colorBlindnessType: event.target.value as ColorBlindnessType });
  }, [onSettingsChange]);

  const handleContrastChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    onSettingsChange({ contrast: event.target.value as ContrastLevel });
  }, [onSettingsChange]);

  const handleAnimationChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    const newIntensity = event.target.value as AnimationIntensity;
    onSettingsChange({ 
      animationIntensity: newIntensity,
      reducedMotion: newIntensity === 'none' || newIntensity === 'reduced'
    });
  }, [onSettingsChange]);

  const handleReducedMotionToggle = useCallback(() => {
    const newReducedMotion = !reducedMotion;
    onSettingsChange({ 
      reducedMotion: newReducedMotion,
      animationIntensity: newReducedMotion ? 'reduced' : 'normal'
    });
  }, [reducedMotion, onSettingsChange]);

  const colorBlindnessOptions = [
    { value: 'none', label: 'なし（標準）' },
    { value: 'protanopia', label: '1型色覚（赤色盲）' },
    { value: 'deuteranopia', label: '2型色覚（緑色盲）' },
    { value: 'tritanopia', label: '3型色覚（青色盲）' }
  ];

  const contrastOptions = [
    { value: 'low', label: '低コントラスト' },
    { value: 'normal', label: '標準' },
    { value: 'high', label: '高コントラスト' }
  ];

  const animationOptions = [
    { value: 'none', label: 'アニメーションなし' },
    { value: 'reduced', label: '控えめ' },
    { value: 'normal', label: '標準' },
    { value: 'enhanced', label: '強化' }
  ];

  return (
    <div className={`accessibility-settings ${className}`}>
      <h3 className="text-lg font-bold text-cyber-cyan mb-4">アクセシビリティ設定</h3>
      
      <div className="space-y-4">
        {/* 色覚異常対応 */}
        <div>
          <label className="block text-sm font-medium mb-2 text-cyber-cyan">
            色覚対応
          </label>
          <select
            value={colorBlindnessType}
            onChange={handleColorBlindnessChange}
            className="w-full p-3 rounded-lg bg-cyber-cyan-10 border border-cyber-cyan-30 
                       text-foreground focus:outline-none focus:ring-2 focus:ring-cyber-cyan
                       hover:bg-cyber-cyan-20 transition-colors"
          >
            {colorBlindnessOptions.map(option => (
              <option key={option.value} value={option.value} className="bg-background text-foreground">
                {option.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-cyber-purple mt-1">
            色覚の特性に応じてカラーパレットを調整します
          </p>
        </div>

        {/* コントラスト設定 */}
        <div>
          <label className="block text-sm font-medium mb-2 text-cyber-cyan">
            コントラスト
          </label>
          <select
            value={contrast}
            onChange={handleContrastChange}
            className="w-full p-3 rounded-lg bg-cyber-cyan-10 border border-cyber-cyan-30 
                       text-foreground focus:outline-none focus:ring-2 focus:ring-cyber-cyan
                       hover:bg-cyber-cyan-20 transition-colors"
          >
            {contrastOptions.map(option => (
              <option key={option.value} value={option.value} className="bg-background text-foreground">
                {option.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-cyber-purple mt-1">
            テキストと背景のコントラストを調整します
          </p>
        </div>

        {/* アニメーション強度 */}
        <div>
          <label className="block text-sm font-medium mb-2 text-cyber-cyan">
            アニメーション強度
          </label>
          <select
            value={animationIntensity}
            onChange={handleAnimationChange}
            className="w-full p-3 rounded-lg bg-cyber-cyan-10 border border-cyber-cyan-30 
                       text-foreground focus:outline-none focus:ring-2 focus:ring-cyber-cyan
                       hover:bg-cyber-cyan-20 transition-colors"
          >
            {animationOptions.map(option => (
              <option key={option.value} value={option.value} className="bg-background text-foreground">
                {option.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-cyber-purple mt-1">
            アニメーションの強度を調整します（パーティクル、エフェクト等）
          </p>
        </div>

        {/* Motion Sensitivity */}
        <div>
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={reducedMotion}
              onChange={handleReducedMotionToggle}
              className="w-4 h-4 accent-cyber-cyan rounded focus:ring-2 focus:ring-cyber-cyan"
            />
            <div>
              <span className="text-sm font-medium text-cyber-cyan">
                モーション感度軽減
              </span>
              <p className="text-xs text-cyber-purple">
                動きによる不快感を軽減するため、アニメーションを最小限に抑えます
              </p>
            </div>
          </label>
        </div>

        {/* プレビューエリア */}
        <div className="mt-4 p-3 rounded-lg hologram">
          <div className="text-sm font-medium mb-2 text-cyber-cyan">現在の設定</div>
          <div className="text-xs space-y-1">
            <div className="text-cyber-purple">
              色覚対応: {colorBlindnessOptions.find(opt => opt.value === colorBlindnessType)?.label}
            </div>
            <div className="text-cyber-purple">
              コントラスト: {contrastOptions.find(opt => opt.value === contrast)?.label}
            </div>
            <div className="text-cyber-purple">
              アニメーション: {animationOptions.find(opt => opt.value === animationIntensity)?.label}
            </div>
            {reducedMotion && (
              <div className="text-cyber-yellow">
                ⚠ モーション感度軽減が有効です
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export const AccessibilitySettingsMemo = React.memo(AccessibilitySettings);