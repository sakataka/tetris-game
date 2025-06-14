import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { GameSettings, ThemeVariant } from '../types/tetris';
import { log } from '../utils/logging';

// Extended key bindings to support multiple keys per action
export interface ExtendedKeyBindings {
  moveLeft: string[];
  moveRight: string[];
  moveDown: string[];
  rotate: string[];
  hardDrop: string[];
  pause: string[];
  reset: string[];
  [key: string]: string[]; // Index signature for compatibility
}

// Extended GameSettings interface with additional properties from useSettings
export interface ExtendedGameSettings extends Omit<GameSettings, 'keyBindings'> {
  audioEnabled: boolean;
  showGhost: boolean;
  showParticles: boolean;
  keyBindings: ExtendedKeyBindings;
}

// Default settings values
const DEFAULT_SETTINGS: ExtendedGameSettings = {
  // Audio settings
  audioEnabled: true,
  volume: 0.5,
  isMuted: false,

  // Visual settings
  theme: 'cyberpunk' as const,
  showGhost: true,
  showParticles: true,

  // Key bindings (now supports multiple keys)
  keyBindings: {
    moveLeft: ['ArrowLeft', 'a', 'A'],
    moveRight: ['ArrowRight', 'd', 'D'],
    moveDown: ['ArrowDown', 's', 'S'],
    rotate: ['ArrowUp', 'w', 'W'],
    hardDrop: [' '],
    pause: ['p', 'P'],
    reset: ['r', 'R'],
  },

  // Game settings
  difficulty: 'normal' as const,
  gameMode: 'single' as const,
  virtualControlsEnabled: false,
};

interface SettingsStore {
  // State
  settings: ExtendedGameSettings;

  // Actions
  updateSettings: (newSettings: Partial<ExtendedGameSettings>) => void;
  resetSettings: () => void;
  updateTheme: (theme: ThemeVariant) => void;

  // Key binding management
  updateKeyBinding: (action: keyof ExtendedKeyBindings, newKeys: string[]) => void;
  addKeyBinding: (action: keyof ExtendedKeyBindings, newKey: string) => void;
  removeKeyBinding: (action: keyof ExtendedKeyBindings, key: string) => void;
  resetKeyBindings: () => void;
  isKeyBound: (key: string) => boolean;
  getKeyBinding: (action: keyof ExtendedKeyBindings) => string[];

  // Legacy compatibility
  updateVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleAudioEnabled: () => void;
  toggleShowGhost: () => void;
  toggleShowParticles: () => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      // Initial state
      settings: DEFAULT_SETTINGS,

      // Actions
      updateSettings: (newSettings) =>
        set((state) => {
          const updatedSettings = { ...state.settings, ...newSettings };
          log.debug('Settings updated', {
            component: 'SettingsStore',
            metadata: { changes: newSettings },
          });
          return { settings: updatedSettings };
        }),

      resetSettings: () =>
        set(() => {
          log.info('Settings reset to defaults', { component: 'SettingsStore' });
          return { settings: DEFAULT_SETTINGS };
        }),

      updateTheme: (theme) =>
        set((state) => ({
          settings: { ...state.settings, theme },
        })),

      // Key binding management
      updateKeyBinding: (action, newKeys) =>
        set((state) => ({
          settings: {
            ...state.settings,
            keyBindings: {
              ...state.settings.keyBindings,
              [action]: newKeys,
            },
          },
        })),

      addKeyBinding: (action, newKey) => {
        const currentKeys = get().settings.keyBindings[action];
        if (currentKeys && !currentKeys.includes(newKey)) {
          get().updateKeyBinding(action, [...currentKeys, newKey]);
        }
      },

      removeKeyBinding: (action, key) => {
        const currentKeys = get().settings.keyBindings[action];
        if (currentKeys) {
          get().updateKeyBinding(
            action,
            currentKeys.filter((k) => k !== key)
          );
        }
      },

      resetKeyBindings: () =>
        set((state) => ({
          settings: {
            ...state.settings,
            keyBindings: DEFAULT_SETTINGS.keyBindings,
          },
        })),

      isKeyBound: (key) => {
        const { keyBindings } = get().settings;
        return Object.values(keyBindings).some((keys) => keys.includes(key));
      },

      getKeyBinding: (action) => get().settings.keyBindings[action] || [],

      // Legacy compatibility helpers
      updateVolume: (volume) =>
        set((state) => ({
          settings: { ...state.settings, volume: Math.max(0, Math.min(1, volume)) },
        })),

      toggleMute: () =>
        set((state) => ({
          settings: { ...state.settings, isMuted: !state.settings.isMuted },
        })),

      toggleAudioEnabled: () =>
        set((state) => ({
          settings: { ...state.settings, audioEnabled: !state.settings.audioEnabled },
        })),

      toggleShowGhost: () =>
        set((state) => ({
          settings: { ...state.settings, showGhost: !state.settings.showGhost },
        })),

      toggleShowParticles: () =>
        set((state) => ({
          settings: { ...state.settings, showParticles: !state.settings.showParticles },
        })),
    }),
    {
      name: 'tetris-game-settings',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ settings: state.settings }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          log.info('Settings loaded from localStorage', {
            component: 'SettingsStore',
            metadata: { settings: state.settings },
          });
        }
      },
    }
  )
);

// Selector hooks for optimized access
export const useSettings = () => useSettingsStore((state) => state.settings);
export const useVolume = () => useSettingsStore((state) => state.settings.volume);
export const useIsMuted = () => useSettingsStore((state) => state.settings.isMuted);
export const useAudioEnabled = () => useSettingsStore((state) => state.settings.audioEnabled);
export const useTheme = () => useSettingsStore((state) => state.settings.theme);
export const useShowGhost = () => useSettingsStore((state) => state.settings.showGhost);
export const useShowParticles = () => useSettingsStore((state) => state.settings.showParticles);
export const useKeyBindings = () => useSettingsStore((state) => state.settings.keyBindings);

// Individual action hooks (function reference stabilization)
export const useUpdateSettings = () => useSettingsStore((state) => state.updateSettings);
export const useResetSettings = () => useSettingsStore((state) => state.resetSettings);
export const useUpdateTheme = () => useSettingsStore((state) => state.updateTheme);
export const useUpdateKeyBinding = () => useSettingsStore((state) => state.updateKeyBinding);
export const useAddKeyBinding = () => useSettingsStore((state) => state.addKeyBinding);
export const useRemoveKeyBinding = () => useSettingsStore((state) => state.removeKeyBinding);
export const useResetKeyBindings = () => useSettingsStore((state) => state.resetKeyBindings);
export const useIsKeyBound = () => useSettingsStore((state) => state.isKeyBound);
export const useGetKeyBinding = () => useSettingsStore((state) => state.getKeyBinding);
export const useUpdateVolume = () => useSettingsStore((state) => state.updateVolume);
export const useToggleMute = () => useSettingsStore((state) => state.toggleMute);
export const useToggleAudioEnabled = () => useSettingsStore((state) => state.toggleAudioEnabled);
export const useToggleShowGhost = () => useSettingsStore((state) => state.toggleShowGhost);
export const useToggleShowParticles = () => useSettingsStore((state) => state.toggleShowParticles);
