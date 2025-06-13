/**
 * Accessibility Types Definition
 *
 * Consolidated type definitions for all accessibility-related functionality.
 * Separated from store implementations for better maintainability.
 */

import type { ColorBlindnessType, ContrastLevel } from './tetris';

// Core accessibility enums and levels
export type AccessibilityLevel = 'minimal' | 'standard' | 'enhanced' | 'maximum';
export type AnimationIntensity = 'none' | 'reduced' | 'normal' | 'enhanced';
export type FontSizeLevel = 'small' | 'normal' | 'large' | 'extra-large';

// Visual Accessibility Types
export interface VisualAssistance {
  highContrast: boolean;
  largeText: boolean;
  boldText: boolean;
  underlineLinks: boolean;
  cursorSize: 'normal' | 'large' | 'extra-large';
}

export interface VisualAccessibilityState {
  colorBlindnessType: ColorBlindnessType;
  contrast: ContrastLevel;
  fontSize: FontSizeLevel;
  visual: VisualAssistance;
  reducedMotion: boolean;
  animationIntensity: AnimationIntensity;
  respectSystemPreferences: boolean;
}

// Cognitive Accessibility Types
export interface CognitiveAssistance {
  simplifiedUI: boolean;
  confirmActions: boolean;
  timeoutWarnings: boolean;
  autoSave: boolean;
  pauseOnFocusLoss: boolean;
}

export interface CognitiveAccessibilityState {
  cognitive: CognitiveAssistance;
  gameSpecific: {
    pauseOnBlur: boolean;
    visualGameOver: boolean;
    colorCodedPieces: boolean;
    gridLines: boolean;
    dropPreview: boolean;
  };
}

// Input & Navigation Accessibility Types
export interface KeyboardNavigation {
  enabled: boolean;
  focusOutline: boolean;
  skipLinks: boolean;
  tabOrder: 'default' | 'optimized';
}

export interface FeedbackSettings {
  soundEffects: boolean;
  voiceAnnouncements: boolean;
  hapticFeedback: boolean;
  screenReader: boolean;
}

export interface InputAccessibilityState {
  keyboard: KeyboardNavigation;
  feedback: FeedbackSettings;
}

// Complete accessibility state (composition of all parts)
export interface AccessibilityState
  extends VisualAccessibilityState,
    CognitiveAccessibilityState,
    InputAccessibilityState {
  level: AccessibilityLevel;
  enabled: boolean;
}

// Default configurations for each category
export const DEFAULT_VISUAL_ACCESSIBILITY: VisualAccessibilityState = {
  colorBlindnessType: 'none',
  contrast: 'normal',
  fontSize: 'normal',
  visual: {
    highContrast: false,
    largeText: false,
    boldText: false,
    underlineLinks: false,
    cursorSize: 'normal',
  },
  animationIntensity: 'normal',
  reducedMotion: false,
  respectSystemPreferences: true,
};

export const DEFAULT_COGNITIVE_ACCESSIBILITY: CognitiveAccessibilityState = {
  cognitive: {
    simplifiedUI: false,
    confirmActions: false,
    timeoutWarnings: true,
    autoSave: true,
    pauseOnFocusLoss: true,
  },
  gameSpecific: {
    pauseOnBlur: true,
    visualGameOver: true,
    colorCodedPieces: true,
    gridLines: false,
    dropPreview: true,
  },
};

export const DEFAULT_INPUT_ACCESSIBILITY: InputAccessibilityState = {
  keyboard: {
    enabled: true,
    focusOutline: true,
    skipLinks: false,
    tabOrder: 'default',
  },
  feedback: {
    soundEffects: true,
    voiceAnnouncements: false,
    hapticFeedback: false,
    screenReader: false,
  },
};

// Complete default state
export const DEFAULT_ACCESSIBILITY_STATE: AccessibilityState = {
  level: 'standard',
  enabled: true,
  ...DEFAULT_VISUAL_ACCESSIBILITY,
  ...DEFAULT_COGNITIVE_ACCESSIBILITY,
  ...DEFAULT_INPUT_ACCESSIBILITY,
};

// Preset configurations for each accessibility level
export const ACCESSIBILITY_PRESETS: Record<AccessibilityLevel, Partial<AccessibilityState>> = {
  minimal: {
    level: 'minimal',
    visual: {
      highContrast: false,
      largeText: false,
      boldText: false,
      underlineLinks: false,
      cursorSize: 'normal',
    },
    animationIntensity: 'normal',
    keyboard: {
      enabled: true,
      focusOutline: false,
      skipLinks: false,
      tabOrder: 'default',
    },
    feedback: {
      soundEffects: true,
      voiceAnnouncements: false,
      hapticFeedback: false,
      screenReader: false,
    },
    cognitive: {
      simplifiedUI: false,
      confirmActions: false,
      timeoutWarnings: false,
      autoSave: false,
      pauseOnFocusLoss: false,
    },
  },

  standard: {
    level: 'standard',
    visual: {
      highContrast: false,
      largeText: false,
      boldText: false,
      underlineLinks: false,
      cursorSize: 'normal',
    },
    animationIntensity: 'normal',
    keyboard: {
      enabled: true,
      focusOutline: true,
      skipLinks: false,
      tabOrder: 'default',
    },
    feedback: {
      soundEffects: true,
      voiceAnnouncements: false,
      hapticFeedback: false,
      screenReader: false,
    },
    cognitive: {
      simplifiedUI: false,
      confirmActions: false,
      timeoutWarnings: true,
      autoSave: false,
      pauseOnFocusLoss: false,
    },
  },

  enhanced: {
    level: 'enhanced',
    visual: {
      highContrast: true,
      largeText: true,
      boldText: true,
      underlineLinks: false,
      cursorSize: 'normal',
    },
    animationIntensity: 'reduced',
    keyboard: {
      enabled: true,
      focusOutline: true,
      skipLinks: true,
      tabOrder: 'optimized',
    },
    feedback: {
      soundEffects: true,
      voiceAnnouncements: true,
      hapticFeedback: false,
      screenReader: false,
    },
    cognitive: {
      simplifiedUI: true,
      confirmActions: true,
      timeoutWarnings: true,
      autoSave: false,
      pauseOnFocusLoss: false,
    },
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
      cursorSize: 'extra-large',
    },
    animationIntensity: 'none',
    reducedMotion: true,
    keyboard: {
      enabled: true,
      focusOutline: true,
      skipLinks: true,
      tabOrder: 'optimized',
    },
    feedback: {
      soundEffects: true,
      voiceAnnouncements: true,
      hapticFeedback: true,
      screenReader: true,
    },
    cognitive: {
      simplifiedUI: true,
      confirmActions: true,
      timeoutWarnings: true,
      autoSave: true,
      pauseOnFocusLoss: true,
    },
    gameSpecific: {
      pauseOnBlur: true,
      visualGameOver: true,
      colorCodedPieces: true,
      gridLines: true,
      dropPreview: true,
    },
  },
};

// System preference detection utility types
export interface SystemAccessibilityPreferences {
  reducedMotion?: boolean;
  highContrast?: boolean;
  darkMode?: boolean;
}

// Store action types for each category
export interface VisualAccessibilityActions {
  setColorBlindnessType: (type: ColorBlindnessType) => void;
  setContrast: (level: ContrastLevel) => void;
  setFontSize: (size: FontSizeLevel) => void;
  setAnimationIntensity: (intensity: AnimationIntensity) => void;
  updateVisualAssistance: (visual: Partial<VisualAssistance>) => void;
  toggleHighContrast: () => void;
  toggleLargeText: () => void;
  toggleReducedMotion: () => void;
}

export interface CognitiveAccessibilityActions {
  updateCognitiveAssistance: (cognitive: Partial<CognitiveAssistance>) => void;
  updateGameSpecific: (gameSettings: Partial<CognitiveAccessibilityState['gameSpecific']>) => void;
  toggleSimplifiedUI: () => void;
  toggleConfirmActions: () => void;
  toggleAutoSave: () => void;
}

export interface InputAccessibilityActions {
  updateKeyboardNavigation: (keyboard: Partial<KeyboardNavigation>) => void;
  updateFeedbackSettings: (feedback: Partial<FeedbackSettings>) => void;
  toggleKeyboardFocus: () => void;
  toggleSoundEffects: () => void;
  toggleVoiceAnnouncements: () => void;
  toggleHapticFeedback: () => void;
}
