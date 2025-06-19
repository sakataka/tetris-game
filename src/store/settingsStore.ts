import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { GameSettings, ThemeVariant } from '../types/tetris';
import { log } from '../utils/logging';

// Navigation types
export type TabType = 'game' | 'stats' | 'theme' | 'settings';

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
  // Navigation state
  activeTab: TabType;
}

interface SettingsStoreState extends ExtendedGameSettings {
  isInitialized: boolean;
}

// Settings store with additional actions
interface SettingsStore extends SettingsStoreState {
  // Settings management
  updateSettings: (newSettings: Partial<ExtendedGameSettings>) => void;

  // Audio controls
  enableAudio: (enabled: boolean) => void;
  setVolume: (volume: number) => void;

  // Visual controls
  setShowGhost: (enabled: boolean) => void;
  setShowParticles: (enabled: boolean) => void;

  // Theme controls
  setTheme: (theme: ThemeVariant) => void;

  // Key binding management
  setKeyBinding: (action: keyof ExtendedKeyBindings, keys: string[]) => void;

  // Navigation
  setActiveTab: (tab: TabType) => void;

  // System actions
  resetSettings: () => void;
  initialize: () => void;

  // Legacy toggle methods for backward compatibility
  toggleMute: () => void;
  toggleGhost: () => void;
  toggleParticles: () => void;
  toggleInitialized: () => void;
}

// Default key bindings
const defaultKeyBindings: ExtendedKeyBindings = {
  moveLeft: ['ArrowLeft', 'a', 'A'],
  moveRight: ['ArrowRight', 'd', 'D'],
  moveDown: ['ArrowDown', 's', 'S'],
  rotate: ['ArrowUp', 'w', 'W', ' '],
  hardDrop: ['Space'],
  pause: ['p', 'P', 'Escape'],
  reset: ['r', 'R'],
};

// Initial state
const INITIAL_SETTINGS_STATE: SettingsStoreState = {
  // Audio settings
  audioEnabled: true,
  volume: 0.5,
  isMuted: false,

  // Visual settings
  showGhost: true,
  showParticles: true,
  theme: 'cyberpunk' as ThemeVariant,

  // Game controls
  keyBindings: defaultKeyBindings,
  difficulty: 'normal' as const,
  gameMode: 'single' as const,
  virtualControlsEnabled: false,

  // Navigation
  activeTab: 'game',

  // System
  isInitialized: false,
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      ...INITIAL_SETTINGS_STATE,

      // Settings management
      updateSettings: (newSettings: Partial<ExtendedGameSettings>) => {
        const store = get();
        set((state) => ({ ...state, ...newSettings }));

        log.info('Settings updated', {
          component: 'SettingsStore',
          metadata: {
            changes: Object.keys(newSettings),
            newState: { ...store, ...newSettings },
          },
        });
      },

      // Audio controls
      enableAudio: (enabled: boolean) => {
        set((state) => ({ ...state, audioEnabled: enabled }));
      },

      setVolume: (volume: number) => {
        set((state) => ({ ...state, volume }));
      },

      // Visual controls
      setShowGhost: (enabled: boolean) => {
        set((state) => ({ ...state, showGhost: enabled }));
      },

      setShowParticles: (enabled: boolean) => {
        set((state) => ({ ...state, showParticles: enabled }));
      },

      // Theme controls
      setTheme: (theme: ThemeVariant) => {
        set((state) => ({ ...state, theme }));
      },

      // Key binding management
      setKeyBinding: (action: keyof ExtendedKeyBindings, keys: string[]) => {
        set((state) => ({
          ...state,
          keyBindings: {
            ...state.keyBindings,
            [action]: keys,
          },
        }));
      },

      // Navigation
      setActiveTab: (tab: TabType) => {
        set((state) => ({ ...state, activeTab: tab }));
      },

      // System actions
      resetSettings: () => {
        set(() => ({ ...INITIAL_SETTINGS_STATE }));
      },

      initialize: () => {
        set((state) => ({ ...state, isInitialized: true }));
      },

      // Legacy toggle methods for backward compatibility
      toggleMute: () => {
        set((state) => ({ ...state, audioEnabled: !state.audioEnabled }));
      },

      toggleGhost: () => {
        set((state) => ({ ...state, showGhost: !state.showGhost }));
      },

      toggleParticles: () => {
        set((state) => ({ ...state, showParticles: !state.showParticles }));
      },

      toggleInitialized: () => {
        set((state) => ({ ...state, isInitialized: !state.isInitialized }));
      },
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => localStorage),
      version: 1,
      migrate: (persistedState: unknown, version: number) => {
        log.info('Migrating settings from version', {
          component: 'SettingsStore',
          metadata: { version, persistedState },
        });
        // Migration logic can be added here if needed
        return persistedState as SettingsStore;
      },
      onRehydrateStorage: () => (state) => {
        if (state) {
          log.info('Settings rehydrated from storage', {
            component: 'SettingsStore',
            metadata: { isInitialized: state.isInitialized },
          });
        }
      },
    }
  )
);

// Export individual hooks for convenience
export const useAudioSettings = () =>
  useSettingsStore((state) => ({
    audioEnabled: state.audioEnabled,
    volume: state.volume,
    enableAudio: state.enableAudio,
    setVolume: state.setVolume,
    toggleMute: state.toggleMute,
  }));

export const useVisualSettings = () =>
  useSettingsStore((state) => ({
    showGhost: state.showGhost,
    showParticles: state.showParticles,
    theme: state.theme,
    setShowGhost: state.setShowGhost,
    setShowParticles: state.setShowParticles,
    setTheme: state.setTheme,
    toggleGhost: state.toggleGhost,
    toggleParticles: state.toggleParticles,
  }));

export const useKeyBindings = () =>
  useSettingsStore((state) => ({
    keyBindings: state.keyBindings,
    setKeyBinding: state.setKeyBinding,
  }));

export const useNavigation = () =>
  useSettingsStore((state) => ({
    activeTab: state.activeTab,
    setActiveTab: state.setActiveTab,
  }));

export const useSettings = () => useSettingsStore();

// Legacy export for backward compatibility
export const useUpdateSettings = () => useSettingsStore((state) => state.updateSettings);
