import { useEffect, useCallback } from 'react';
import { ThemeVariant, ThemeState } from '../types/tetris';
import { initializeTheme, applyColorBlindnessFilter, adjustColorsForContrast } from '../utils/ui';

interface UseThemeManagerProps {
  themeState: ThemeState;
  setTheme: (theme: ThemeVariant) => void;
  updateThemeState: (themeState: Partial<ThemeState>) => void;
  setAccessibilityOptions: (accessibility: Partial<ThemeState['accessibility']>) => void;
}

export function useThemeManager({
  themeState,
  setTheme,
  updateThemeState,
  setAccessibilityOptions,
}: UseThemeManagerProps) {
  // テーマの初期化と適用
  useEffect(() => {
    let config = { ...themeState.config };

    // 色覚異常フィルターを適用
    if (themeState.accessibility.colorBlindnessType !== 'none') {
      config.colors = applyColorBlindnessFilter(
        config.colors,
        themeState.accessibility.colorBlindnessType
      );
    }

    // コントラスト調整を適用
    if (themeState.accessibility.contrast !== 'normal') {
      config.colors = adjustColorsForContrast(config.colors, themeState.accessibility.contrast);
    }

    // アニメーション設定を更新
    config = {
      ...config,
      accessibility: {
        ...config.accessibility,
        animationIntensity: themeState.accessibility.animationIntensity,
      },
    };

    // テーマを適用
    initializeTheme(config);

    // ローカルストレージに保存
    try {
      localStorage.setItem('tetris-theme-state', JSON.stringify(themeState));
    } catch (error) {
      console.warn('Failed to save theme state to localStorage:', error);
    }
  }, [themeState]);

  // システムの配色設定変更を監視
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      // システム配色が変更された時の処理（必要に応じて）
      console.log('System color scheme changed:', e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, []);

  // アクセシビリティ設定の変更を監視
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const handleReducedMotionChange = (e: MediaQueryListEvent) => {
      if (e.matches && themeState.accessibility.animationIntensity === 'enhanced') {
        setAccessibilityOptions({
          animationIntensity: 'reduced',
          reducedMotion: true,
        });
      }
    };

    mediaQuery.addEventListener('change', handleReducedMotionChange);
    return () => mediaQuery.removeEventListener('change', handleReducedMotionChange);
  }, [themeState.accessibility.animationIntensity, setAccessibilityOptions]);

  // テーマ変更関数
  const changeTheme = useCallback(
    (newTheme: ThemeVariant) => {
      setTheme(newTheme);
    },
    [setTheme]
  );

  // アクセシビリティ設定変更関数
  const updateAccessibility = useCallback(
    (accessibility: Partial<ThemeState['accessibility']>) => {
      setAccessibilityOptions(accessibility);
    },
    [setAccessibilityOptions]
  );

  // エフェクト強度変更関数
  const updateEffectIntensity = useCallback(
    (intensity: number) => {
      updateThemeState({ effectIntensity: intensity });
    },
    [updateThemeState]
  );

  // アニメーション有効/無効切り替え
  const toggleAnimations = useCallback(() => {
    updateThemeState({ animations: !themeState.animations });
  }, [themeState.animations, updateThemeState]);

  // ローカルストレージからテーマ状態を復元
  const loadThemeFromStorage = useCallback(() => {
    try {
      const savedState = localStorage.getItem('tetris-theme-state');
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        updateThemeState(parsedState);
        return true;
      }
    } catch (error) {
      console.warn('Failed to load theme state from localStorage:', error);
    }
    return false;
  }, [updateThemeState]);

  return {
    currentTheme: themeState.current,
    themeConfig: themeState.config,
    accessibility: themeState.accessibility,
    effectIntensity: themeState.effectIntensity,
    animations: themeState.animations,
    changeTheme,
    updateAccessibility,
    updateEffectIntensity,
    toggleAnimations,
    loadThemeFromStorage,
  };
}
