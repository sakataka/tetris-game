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
  // Primary hook: Audio strategy (must be initialized first)
  const audioStrategy = useAudioStrategy({
    preferredStrategy: useWebAudio ? 'webaudio' : 'htmlaudio',
    enableWebAudio: useWebAudio,
  });

  // Secondary hooks: Depend on strategy being initialized
  const audioState = useAudioState({
    initialVolume,
    initialMuted,
    strategy: audioStrategy.currentStrategy,
  });

  const audioPreloader = useAudioPreloader({
    strategy: audioStrategy.currentStrategy,
    autoPreload: audioStrategy.isInitialized, // Only preload when strategy is ready
  });

  const audioPlayer = useAudioPlayer({
    strategy: audioStrategy.currentStrategy,
    volume: audioState.volume,
    isMuted: audioState.isMuted,
    getHtmlAudioElement: audioPreloader.getHtmlAudioElement,
  });

  // Initialize audio strategy on mount with proper error handling
  useEffect(() => {
    const initializeAudio = async () => {
      try {
        console.log(
          `[useSounds] Checking audio strategy initialization. isInitialized: ${audioStrategy.isInitialized}`
        );
        if (!audioStrategy.isInitialized) {
          console.log('[useSounds] Initializing audio strategy...');
          await audioStrategy.initializeStrategy();
          console.log('[useSounds] Audio strategy initialization completed');
        } else {
          console.log('[useSounds] Audio strategy already initialized');
        }
      } catch (error) {
        console.warn('[useSounds] Audio initialization failed:', error);
        // Strategy will automatically fallback to silent mode
      }
    };

    initializeAudio();
  }, [audioStrategy.isInitialized, audioStrategy.initializeStrategy]); // eslint-disable-line react-hooks/exhaustive-deps

  // Retry initialization if it failed
  useEffect(() => {
    if (audioStrategy.hasInitializationError && audioStrategy.canRetry) {
      console.warn('Audio initialization error detected, attempting retry...');
      const retryTimer = setTimeout(() => {
        audioStrategy.retryInitialization().catch((error) => {
          console.error('Audio retry failed:', error);
        });
      }, 1000); // Retry after 1 second

      return () => clearTimeout(retryTimer);
    }

    // Return empty cleanup function for consistent return
    return () => {};
  }, [audioStrategy]); // Use entire audioStrategy object to fix exhaustive-deps

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

    // Debug and recovery features
    hasInitializationError: audioStrategy.hasInitializationError,
    initializationError: audioStrategy.initializationError,
    canRetryInitialization: audioStrategy.canRetry,
    retryAudioInitialization: audioStrategy.retryInitialization,

    // System status
    audioSystemStatus: {
      strategy: audioStrategy.currentStrategy,
      initialized: audioStrategy.isInitialized,
      webAudioSupported: audioStrategy.isWebAudioSupported,
      error: audioStrategy.initializationError,
      canRetry: audioStrategy.canRetry,
    },
  };
}
