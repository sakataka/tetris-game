import { create } from 'zustand';

interface AudioState {
  // Volume and mute state
  volume: number;
  isMuted: boolean;
  previousVolume: number;

  // Strategy and initialization state
  currentStrategy: 'webaudio' | 'htmlaudio' | 'silent';
  isInitialized: boolean;
  initializationError: string | null;

  // Preload state
  preloadProgress: {
    total: number;
    loaded: number;
    failed: number;
    progress: number;
    isComplete: boolean;
    isLoading: boolean;
  };

  // Actions
  setVolume: (volume: number) => void;
  setMuted: (muted: boolean) => void;
  toggleMute: () => void;
  setStrategy: (strategy: 'webaudio' | 'htmlaudio' | 'silent') => void;
  setInitialized: (initialized: boolean) => void;
  setInitializationError: (error: string | null) => void;
  updatePreloadProgress: (progress: { total: number; loaded: number; failed: number }) => void;
}

export const useAudioStore = create<AudioState>((set, get) => ({
  // Initial state
  volume: 0.5,
  isMuted: false,
  previousVolume: 0.5,
  currentStrategy: 'webaudio',
  isInitialized: false,
  initializationError: null,
  preloadProgress: {
    total: 0,
    loaded: 0,
    failed: 0,
    progress: 0,
    isComplete: false,
    isLoading: false,
  },

  // Volume actions
  setVolume: (newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    const state = get();

    set({
      volume: clampedVolume,
      // Auto-unmute if volume is set to > 0
      isMuted: clampedVolume > 0 ? false : state.isMuted,
      // Preserve previous volume only if we're not muted and volume > 0
      previousVolume: !state.isMuted && clampedVolume > 0 ? clampedVolume : state.previousVolume,
    });
  },

  setMuted: (muted: boolean) => {
    const state = get();
    set({
      isMuted: muted,
      // If unmuting and current volume is 0, restore previous volume
      volume: !muted && state.volume === 0 ? state.previousVolume : state.volume,
    });
  },

  toggleMute: () => {
    const state = get();
    const newMuted = !state.isMuted;
    set({
      isMuted: newMuted,
      // If unmuting and current volume is 0, restore previous volume
      volume: !newMuted && state.volume === 0 ? state.previousVolume : state.volume,
    });
  },

  // Strategy actions
  setStrategy: (strategy) => set({ currentStrategy: strategy }),
  setInitialized: (initialized) => set({ isInitialized: initialized }),
  setInitializationError: (error) => set({ initializationError: error }),

  // Preload actions
  updatePreloadProgress: (progress) => {
    const progressPercentage = progress.total > 0 ? (progress.loaded / progress.total) * 100 : 0;
    set({
      preloadProgress: {
        ...progress,
        progress: progressPercentage,
        isComplete: progress.loaded + progress.failed >= progress.total && progress.total > 0,
        isLoading: progress.loaded + progress.failed < progress.total && progress.total > 0,
      },
    });
  },
}));

// Individual selectors for optimal performance
export const useAudioVolume = () => useAudioStore((state) => state.volume);
export const useAudioMuted = () => useAudioStore((state) => state.isMuted);
export const useSetAudioVolume = () => useAudioStore((state) => state.setVolume);
export const useToggleAudioMute = () => useAudioStore((state) => state.toggleMute);
export const useAudioStrategy = () => useAudioStore((state) => state.currentStrategy);
export const useAudioInitialized = () => useAudioStore((state) => state.isInitialized);
export const useAudioPreloadProgress = () => useAudioStore((state) => state.preloadProgress);

// Combined selectors for components that need multiple values
export const useAudioVolumeState = () =>
  useAudioStore((state) => ({
    volume: state.volume,
    isMuted: state.isMuted,
    setVolume: state.setVolume,
    toggleMute: state.toggleMute,
  }));

export const useAudioSystemStatus = () =>
  useAudioStore((state) => ({
    strategy: state.currentStrategy,
    initialized: state.isInitialized,
    error: state.initializationError,
    preloadProgress: state.preloadProgress,
  }));
