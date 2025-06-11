import { useCallback, useEffect } from 'react';
import type { SoundKey } from '../types/tetris';
import { getFallbackStatus } from '../utils/audio';
import { useAudioStrategy } from './useAudioStrategy';
import { useAudioState } from './useAudioState';
import { useAudioPreloader } from './useAudioPreloader';
import { useAudioPlayer } from './useAudioPlayer';

interface AudioState {
  loaded: Set<SoundKey>;
  failed: Set<SoundKey>;
  loading: Set<SoundKey>;
}

interface UseSoundsProps {
  initialVolume?: number;
  initialMuted?: boolean;
  useWebAudio?: boolean; // Flag to enable Web Audio API
}

export function useSounds({
  initialVolume = 0.5,
  initialMuted = false,
  useWebAudio = true, // Use Web Audio API by default
}: UseSoundsProps = {}) {
  // Use decomposed hooks
  const audioStrategy = useAudioStrategy({
    preferredStrategy: useWebAudio ? 'webaudio' : 'htmlaudio',
    enableWebAudio: useWebAudio,
  });

  const audioState = useAudioState({
    initialVolume,
    initialMuted,
    strategy: audioStrategy.currentStrategy,
  });

  const audioPreloader = useAudioPreloader({
    strategy: audioStrategy.currentStrategy,
    autoPreload: true,
  });

  const audioPlayer = useAudioPlayer({
    strategy: audioStrategy.currentStrategy,
    volume: audioState.volume,
    isMuted: audioState.isMuted,
    getHtmlAudioElement: audioPreloader.getHtmlAudioElement,
  });

  // Initialize audio strategy on mount
  useEffect(() => {
    if (!audioStrategy.isInitialized) {
      audioStrategy.initializeStrategy();
    }
  }, [audioStrategy]);

  // Legacy audio unlock function for compatibility
  const unlockAudio = useCallback(async () => {
    // This is now handled automatically by the decomposed hooks
    // Kept for backward compatibility
  }, []);

  // Legacy initialize sounds function for compatibility
  const initializeSounds = useCallback(() => {
    // This is now handled automatically by useAudioPreloader
    // Kept for backward compatibility
  }, []);

  // Convert preloader state to legacy format for compatibility
  const legacyAudioState: AudioState = {
    loaded: audioPreloader.loadState.loaded,
    failed: audioPreloader.loadState.failed,
    loading: audioPreloader.loadState.loading,
  };

  return {
    // Core playback functions (using audioPlayer)
    playSound: audioPlayer.playSound,

    // Audio state (using audioState)
    isMuted: audioState.isMuted,
    volume: audioState.volume,
    setVolumeLevel: audioState.setVolume,
    toggleMute: audioState.toggleMute,

    // Legacy compatibility functions
    initializeSounds,
    unlockAudio,

    // Audio state information (legacy format)
    audioState: legacyAudioState,

    // Extended features (using decomposed hooks)
    isWebAudioEnabled: audioStrategy.isWebAudioActive,
    getDetailedAudioState: () =>
      audioStrategy.isWebAudioActive ? audioPreloader.getDetailedProgress() : null,
    getPreloadProgress: audioPreloader.getDetailedProgress,
    getFallbackStatus,

    // New features from decomposed hooks
    strategy: audioStrategy.currentStrategy,
    isStrategyInitialized: audioStrategy.isInitialized,
    preloadProgress: audioPreloader.progress,
    canPlayAudio: audioPlayer.isPlaybackEnabled,
    playStats: audioPlayer.getPlayStats(),
  };
}
