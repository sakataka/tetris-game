import { create } from 'zustand';
import { GameSettings } from '../types/tetris';

// デフォルト設定値
const DEFAULT_SETTINGS: GameSettings = {
  volume: 0.5,
  isMuted: false,
  theme: 'cyberpunk' as const,
  keyBindings: {
    moveLeft: 'ArrowLeft',
    moveRight: 'ArrowRight',
    moveDown: 'ArrowDown',
    rotate: 'ArrowUp',
    hardDrop: ' ',
    pause: 'p',
    reset: 'r'
  },
  difficulty: 'normal' as const,
  gameMode: 'single' as const,
  virtualControlsEnabled: false
};

interface SettingsStore {
  // State
  settings: GameSettings;
  
  // Actions
  updateSettings: (newSettings: Partial<GameSettings>) => void;
  resetSettings: () => void;
}

export const useSettingsStore = create<SettingsStore>()((set) => ({
  // Initial state
  settings: DEFAULT_SETTINGS,
  
  // Actions
  updateSettings: (newSettings) =>
    set((state) => ({
      settings: { ...state.settings, ...newSettings }
    })),
  
  resetSettings: () =>
    set(() => ({
      settings: DEFAULT_SETTINGS
    }))
}));

// Selector hooks for optimized access
export const useSettings = () => useSettingsStore((state) => state.settings);
export const useSettingsActions = () => useSettingsStore((state) => ({
  updateSettings: state.updateSettings,
  resetSettings: state.resetSettings
}));