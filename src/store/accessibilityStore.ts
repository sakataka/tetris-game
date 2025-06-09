/**
 * アクセシビリティ専用ストア
 * 
 * テーマから分離されたアクセシビリティ設定の一元管理
 * WCAG準拠機能の拡張とユーザビリティ向上
 */

import { create } from 'zustand';
import { persist, PersistOptions } from 'zustand/middleware';
import { ColorBlindnessType, ContrastLevel } from '../types/tetris';

// アクセシビリティレベル定義
export type AccessibilityLevel = 'minimal' | 'standard' | 'enhanced' | 'maximum';

// アニメーション強度レベル
export type AnimationIntensity = 'none' | 'reduced' | 'normal' | 'enhanced';

// フォントサイズレベル
export type FontSizeLevel = 'small' | 'normal' | 'large' | 'extra-large';

// キーボードナビゲーション設定
export interface KeyboardNavigation {
  enabled: boolean;
  focusOutline: boolean;
  skipLinks: boolean;
  tabOrder: 'default' | 'optimized';
}

// 視覚的支援設定
export interface VisualAssistance {
  highContrast: boolean;
  largeText: boolean;
  boldText: boolean;
  underlineLinks: boolean;
  cursorSize: 'normal' | 'large' | 'extra-large';
}

// 音声・触覚フィードバック設定
export interface FeedbackSettings {
  soundEffects: boolean;
  voiceAnnouncements: boolean;
  hapticFeedback: boolean;
  screenReader: boolean;
}

// 認知支援設定
export interface CognitiveAssistance {
  simplifiedUI: boolean;
  confirmActions: boolean;
  timeoutWarnings: boolean;
  autoSave: boolean;
  pauseOnFocusLoss: boolean;
}

// 完全なアクセシビリティ状態
export interface AccessibilityState {
  // 基本設定
  level: AccessibilityLevel;
  enabled: boolean;
  
  // 視覚的アクセシビリティ
  colorBlindnessType: ColorBlindnessType;
  contrast: ContrastLevel;
  fontSize: FontSizeLevel;
  visual: VisualAssistance;
  
  // モーション・アニメーション
  animationIntensity: AnimationIntensity;
  reducedMotion: boolean;
  respectSystemPreferences: boolean;
  
  // ナビゲーション
  keyboard: KeyboardNavigation;
  
  // フィードバック
  feedback: FeedbackSettings;
  
  // 認知支援
  cognitive: CognitiveAssistance;
  
  // ゲーム固有設定
  gameSpecific: {
    pauseOnBlur: boolean;
    visualGameOver: boolean;
    colorCodedPieces: boolean;
    gridLines: boolean;
    dropPreview: boolean;
  };
}

// デフォルト設定
const DEFAULT_ACCESSIBILITY_STATE: AccessibilityState = {
  level: 'standard',
  enabled: true,
  
  colorBlindnessType: 'none',
  contrast: 'normal',
  fontSize: 'normal',
  visual: {
    highContrast: false,
    largeText: false,
    boldText: false,
    underlineLinks: false,
    cursorSize: 'normal'
  },
  
  animationIntensity: 'normal',
  reducedMotion: false,
  respectSystemPreferences: true,
  
  keyboard: {
    enabled: true,
    focusOutline: true,
    skipLinks: false,
    tabOrder: 'default'
  },
  
  feedback: {
    soundEffects: true,
    voiceAnnouncements: false,
    hapticFeedback: false,
    screenReader: false
  },
  
  cognitive: {
    simplifiedUI: false,
    confirmActions: false,
    timeoutWarnings: true,
    autoSave: true,
    pauseOnFocusLoss: true
  },
  
  gameSpecific: {
    pauseOnBlur: true,
    visualGameOver: true,
    colorCodedPieces: true,
    gridLines: false,
    dropPreview: true
  }
};

// プリセット設定
export const ACCESSIBILITY_PRESETS: Record<AccessibilityLevel, Partial<AccessibilityState>> = {
  minimal: {
    level: 'minimal',
    visual: { highContrast: false, largeText: false, boldText: false, underlineLinks: false, cursorSize: 'normal' },
    animationIntensity: 'normal',
    keyboard: { enabled: true, focusOutline: false, skipLinks: false, tabOrder: 'default' },
    feedback: { soundEffects: true, voiceAnnouncements: false, hapticFeedback: false, screenReader: false },
    cognitive: { simplifiedUI: false, confirmActions: false, timeoutWarnings: false, autoSave: false, pauseOnFocusLoss: false }
  },
  
  standard: {
    level: 'standard',
    visual: { highContrast: false, largeText: false, boldText: false, underlineLinks: false, cursorSize: 'normal' },
    animationIntensity: 'normal',
    keyboard: { enabled: true, focusOutline: true, skipLinks: false, tabOrder: 'default' },
    feedback: { soundEffects: true, voiceAnnouncements: false, hapticFeedback: false, screenReader: false },
    cognitive: { simplifiedUI: false, confirmActions: false, timeoutWarnings: true, autoSave: false, pauseOnFocusLoss: false }
  },
  
  enhanced: {
    level: 'enhanced',
    visual: { highContrast: true, largeText: true, boldText: true, underlineLinks: false, cursorSize: 'normal' },
    animationIntensity: 'reduced',
    keyboard: { enabled: true, focusOutline: true, skipLinks: true, tabOrder: 'optimized' },
    feedback: { soundEffects: true, voiceAnnouncements: true, hapticFeedback: false, screenReader: false },
    cognitive: { simplifiedUI: true, confirmActions: true, timeoutWarnings: true, autoSave: false, pauseOnFocusLoss: false }
  },
  
  maximum: {
    level: 'maximum',
    contrast: 'high',
    fontSize: 'extra-large',
    visual: { 
      highContrast: true, 
      largeText: true, 
      boldText: true, 
      underlineLinks: true,
      cursorSize: 'extra-large'
    },
    animationIntensity: 'none',
    reducedMotion: true,
    keyboard: { 
      enabled: true, 
      focusOutline: true, 
      skipLinks: true, 
      tabOrder: 'optimized' 
    },
    feedback: { 
      soundEffects: true, 
      voiceAnnouncements: true, 
      hapticFeedback: true,
      screenReader: true 
    },
    cognitive: { 
      simplifiedUI: true, 
      confirmActions: true, 
      timeoutWarnings: true,
      autoSave: true,
      pauseOnFocusLoss: true 
    },
    gameSpecific: {
      pauseOnBlur: true,
      visualGameOver: true,
      colorCodedPieces: true,
      gridLines: true,
      dropPreview: true
    }
  }
};

// ストアインターフェース
interface AccessibilityStore {
  // State
  accessibility: AccessibilityState;
  
  // Actions
  setAccessibilityLevel: (level: AccessibilityLevel) => void;
  updateAccessibility: (updates: Partial<AccessibilityState>) => void;
  
  // 個別設定更新
  setColorBlindnessType: (type: ColorBlindnessType) => void;
  setContrast: (level: ContrastLevel) => void;
  setFontSize: (size: FontSizeLevel) => void;
  setAnimationIntensity: (intensity: AnimationIntensity) => void;
  
  // 視覚的支援
  updateVisualAssistance: (visual: Partial<VisualAssistance>) => void;
  toggleHighContrast: () => void;
  toggleLargeText: () => void;
  
  // キーボードナビゲーション
  updateKeyboardNavigation: (keyboard: Partial<KeyboardNavigation>) => void;
  toggleKeyboardFocus: () => void;
  
  // フィードバック設定
  updateFeedbackSettings: (feedback: Partial<FeedbackSettings>) => void;
  toggleSoundEffects: () => void;
  toggleVoiceAnnouncements: () => void;
  
  // 認知支援
  updateCognitiveAssistance: (cognitive: Partial<CognitiveAssistance>) => void;
  toggleSimplifiedUI: () => void;
  
  // ゲーム固有
  updateGameSpecific: (gameSettings: Partial<AccessibilityState['gameSpecific']>) => void;
  
  // システム設定検出
  detectSystemPreferences: () => void;
  
  // リセット
  resetToDefaults: () => void;
  applyPreset: (preset: AccessibilityLevel) => void;
}

// システム設定検出関数
function detectSystemAccessibilityPreferences(): Partial<AccessibilityState> {
  const preferences: Partial<AccessibilityState> = {};
  
  if (typeof window !== 'undefined') {
    // Reduced motion の検出
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      preferences.reducedMotion = true;
      preferences.animationIntensity = 'reduced';
    }
    
    // High contrast の検出
    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
    if (prefersHighContrast) {
      preferences.contrast = 'high';
      preferences.visual = { ...DEFAULT_ACCESSIBILITY_STATE.visual, highContrast: true };
    }
    
    // Color scheme の検出
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDarkMode) {
      preferences.contrast = 'high';
    }
  }
  
  return preferences;
}

// Zustand ストア作成
export const useAccessibilityStore = create<AccessibilityStore>()(
  persist(
    (set) => ({
      // Initial state
      accessibility: DEFAULT_ACCESSIBILITY_STATE,
      
      // Level management
      setAccessibilityLevel: (level) => {
        const preset = ACCESSIBILITY_PRESETS[level];
        set((state) => ({
          accessibility: { ...state.accessibility, ...preset }
        }));
      },
      
      updateAccessibility: (updates) =>
        set((state) => ({
          accessibility: { ...state.accessibility, ...updates }
        })),
      
      // Individual settings
      setColorBlindnessType: (type) =>
        set((state) => ({
          accessibility: { ...state.accessibility, colorBlindnessType: type }
        })),
      
      setContrast: (level) =>
        set((state) => ({
          accessibility: { ...state.accessibility, contrast: level }
        })),
      
      setFontSize: (size) =>
        set((state) => ({
          accessibility: { ...state.accessibility, fontSize: size }
        })),
      
      setAnimationIntensity: (intensity) =>
        set((state) => ({
          accessibility: { 
            ...state.accessibility, 
            animationIntensity: intensity,
            reducedMotion: intensity === 'none' || intensity === 'reduced'
          }
        })),
      
      // Visual assistance
      updateVisualAssistance: (visual) =>
        set((state) => ({
          accessibility: {
            ...state.accessibility,
            visual: { ...state.accessibility.visual, ...visual }
          }
        })),
      
      toggleHighContrast: () =>
        set((state) => ({
          accessibility: {
            ...state.accessibility,
            visual: {
              ...state.accessibility.visual,
              highContrast: !state.accessibility.visual.highContrast
            }
          }
        })),
      
      toggleLargeText: () =>
        set((state) => ({
          accessibility: {
            ...state.accessibility,
            visual: {
              ...state.accessibility.visual,
              largeText: !state.accessibility.visual.largeText
            }
          }
        })),
      
      // Keyboard navigation
      updateKeyboardNavigation: (keyboard) =>
        set((state) => ({
          accessibility: {
            ...state.accessibility,
            keyboard: { ...state.accessibility.keyboard, ...keyboard }
          }
        })),
      
      toggleKeyboardFocus: () =>
        set((state) => ({
          accessibility: {
            ...state.accessibility,
            keyboard: {
              ...state.accessibility.keyboard,
              focusOutline: !state.accessibility.keyboard.focusOutline
            }
          }
        })),
      
      // Feedback settings
      updateFeedbackSettings: (feedback) =>
        set((state) => ({
          accessibility: {
            ...state.accessibility,
            feedback: { ...state.accessibility.feedback, ...feedback }
          }
        })),
      
      toggleSoundEffects: () =>
        set((state) => ({
          accessibility: {
            ...state.accessibility,
            feedback: {
              ...state.accessibility.feedback,
              soundEffects: !state.accessibility.feedback.soundEffects
            }
          }
        })),
      
      toggleVoiceAnnouncements: () =>
        set((state) => ({
          accessibility: {
            ...state.accessibility,
            feedback: {
              ...state.accessibility.feedback,
              voiceAnnouncements: !state.accessibility.feedback.voiceAnnouncements
            }
          }
        })),
      
      // Cognitive assistance
      updateCognitiveAssistance: (cognitive) =>
        set((state) => ({
          accessibility: {
            ...state.accessibility,
            cognitive: { ...state.accessibility.cognitive, ...cognitive }
          }
        })),
      
      toggleSimplifiedUI: () =>
        set((state) => ({
          accessibility: {
            ...state.accessibility,
            cognitive: {
              ...state.accessibility.cognitive,
              simplifiedUI: !state.accessibility.cognitive.simplifiedUI
            }
          }
        })),
      
      // Game specific
      updateGameSpecific: (gameSettings) =>
        set((state) => ({
          accessibility: {
            ...state.accessibility,
            gameSpecific: { ...state.accessibility.gameSpecific, ...gameSettings }
          }
        })),
      
      // System preferences
      detectSystemPreferences: () => {
        const detected = detectSystemAccessibilityPreferences();
        if (Object.keys(detected).length > 0) {
          set((state) => ({
            accessibility: { ...state.accessibility, ...detected }
          }));
        }
      },
      
      // Reset and presets
      resetToDefaults: () =>
        set(() => ({
          accessibility: DEFAULT_ACCESSIBILITY_STATE
        })),
      
      applyPreset: (preset) => {
        const presetConfig = ACCESSIBILITY_PRESETS[preset];
        set((state) => ({
          accessibility: { ...state.accessibility, ...presetConfig }
        }));
      }
    }),
    {
      name: 'tetris-accessibility-settings',
      partialize: (state) => ({ accessibility: state.accessibility }) as Partial<AccessibilityStore>,
      onRehydrateStorage: () => (state) => {
        // 復元後にシステム設定を検出
        if (state?.accessibility.respectSystemPreferences) {
          state.detectSystemPreferences();
        }
      }
    } as PersistOptions<AccessibilityStore>
  )
);

// Selector hooks for optimized access
export const useAccessibility = () => useAccessibilityStore((state) => state.accessibility);
export const useAccessibilityLevel = () => useAccessibilityStore((state) => state.accessibility.level);
export const useVisualAssistance = () => useAccessibilityStore((state) => state.accessibility.visual);
export const useKeyboardNavigation = () => useAccessibilityStore((state) => state.accessibility.keyboard);
export const useFeedbackSettings = () => useAccessibilityStore((state) => state.accessibility.feedback);
export const useCognitiveAssistance = () => useAccessibilityStore((state) => state.accessibility.cognitive);
export const useGameAccessibility = () => useAccessibilityStore((state) => state.accessibility.gameSpecific);

// Individual action hooks for stable references
export const useSetAccessibilityLevel = () => useAccessibilityStore((state) => state.setAccessibilityLevel);
export const useUpdateAccessibility = () => useAccessibilityStore((state) => state.updateAccessibility);
export const useSetColorBlindnessType = () => useAccessibilityStore((state) => state.setColorBlindnessType);
export const useSetContrast = () => useAccessibilityStore((state) => state.setContrast);
export const useSetAnimationIntensity = () => useAccessibilityStore((state) => state.setAnimationIntensity);
export const useToggleHighContrast = () => useAccessibilityStore((state) => state.toggleHighContrast);
export const useToggleSoundEffects = () => useAccessibilityStore((state) => state.toggleSoundEffects);
export const useDetectSystemPreferences = () => useAccessibilityStore((state) => state.detectSystemPreferences);
export const useApplyAccessibilityPreset = () => useAccessibilityStore((state) => state.applyPreset);