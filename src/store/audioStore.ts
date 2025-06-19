import { create } from 'zustand';

interface AudioState {
  // Volume and mute state
  volume: number;
  isMuted: boolean;

  // Actions
  setVolume: (volume: number) => void;
  setMuted: (muted: boolean) => void;
  toggleMute: () => void;
}

export const useAudioStore = create<AudioState>((set, get) => ({
  // Initial state
  volume: 0.5,
  isMuted: false,

  // Volume actions
  setVolume: (newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    set({
      volume: clampedVolume,
      // Auto-unmute if volume is set to > 0
      isMuted: clampedVolume > 0 ? false : get().isMuted,
    });
  },

  setMuted: (muted: boolean) => {
    set({ isMuted: muted });
  },

  toggleMute: () => {
    set({ isMuted: !get().isMuted });
  },
}));

// Individual selectors for optimal performance
export const useAudioVolume = () => useAudioStore((state) => state.volume);
export const useAudioMuted = () => useAudioStore((state) => state.isMuted);
export const useSetAudioVolume = () => useAudioStore((state) => state.setVolume);
export const useSetAudioMuted = () => useAudioStore((state) => state.setMuted);
export const useToggleAudioMute = () => useAudioStore((state) => state.toggleMute);

// Combined selector for components that need multiple values
export const useAudioVolumeState = () => {
  const volume = useAudioStore((state) => state.volume);
  const isMuted = useAudioStore((state) => state.isMuted);
  const setVolume = useAudioStore((state) => state.setVolume);
  const setMuted = useAudioStore((state) => state.setMuted);
  const toggleMute = useAudioStore((state) => state.toggleMute);

  return { volume, isMuted, setVolume, setMuted, toggleMute };
};
