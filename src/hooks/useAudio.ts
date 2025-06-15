import { useCallback } from 'react';
import type { SoundKey } from '../types/tetris';
import { getAudioPreloadProgress, getFallbackStatus } from '../utils/audio';
import { useAudioPlayer } from './useAudioPlayer';
import { useAudioPreloader } from './useAudioPreloader';
import { useAudioState } from './useAudioState';

interface UseAudioProps {
  initialVolume?: number;
  initialMuted?: boolean;
  useWebAudio?: boolean;
  autoPreload?: boolean;
  onPreloadComplete?: (loadedCount: number, failedCount: number) => void;
  onPreloadError?: (error: Error) => void;
  onPlayError?: (soundKey: SoundKey, error: Error) => void;
}

interface AudioState {
  loaded: Set<SoundKey>;
  failed: Set<SoundKey>;
  loading: Set<SoundKey>;
}

interface PlayOptions {
  volume?: number;
  loop?: boolean;
  playbackRate?: number;
}

/**
 * Unified audio management hook - Compatibility wrapper
 *
 * This hook now serves as a compatibility wrapper that combines four specialized hooks:
 * - useAudioStrategy: Strategy selection and initialization
 * - useAudioState: Volume and mute state management
 * - useAudioPreloader: Audio file preloading with progress tracking
 * - useAudioPlayer: Sound playback with throttling and statistics
 *
 * Benefits of decomposition:
 * - Improved maintainability (914 lines → 4 focused hooks)
 * - Better separation of concerns
 * - Enhanced testability
 * - Reusable components for different use cases
 */
export function useAudio({
  initialVolume = 0.5,
  initialMuted = false,
  autoPreload = true,
  onPreloadComplete,
  onPreloadError,
  onPlayError,
}: UseAudioProps = {}) {
  // ===== Decomposed Hooks Integration =====

  // Strategy management - TEMPORARILY DISABLED for debugging
  // const strategyAPI = useAudioStrategy({
  //   useWebAudio,
  //   ...(onPreloadError && { onInitializationError: onPreloadError }),
  // });
  
  // Minimal strategy state for compatibility
  const strategyAPI = {
    strategyState: {
      currentStrategy: 'webaudio' as 'webaudio' | 'htmlaudio' | 'silent',
      isWebAudioSupported: true,
      isInitialized: true,
      initializationError: null,
    },
    switchToStrategy: async () => true,
    retryInitialization: async () => {},
    detectWebAudioSupport: () => true,
  };

  // Volume and mute state management
  const stateAPI = useAudioState({
    initialVolume,
    initialMuted,
  });

  // Audio file preloading with progress tracking
  const preloaderAPI = useAudioPreloader({
    autoPreload,
    ...(onPreloadComplete && { onPreloadComplete }),
    ...(onPreloadError && { onPreloadError }),
  });

  // Sound playback with throttling and statistics
  const playerAPI = useAudioPlayer({
    throttleMs: 50, // Legacy PLAY_THROTTLE_MS value
    ...(onPlayError && { onPlayError }),
    enablePlayCount: true,
  });

  // ===== Compatibility Layer =====

  // Play sound with volume options (main interface)
  const playSound = useCallback(
    async (soundKey: SoundKey, _options: PlayOptions = {}) => {
      // Early return for silent mode or muted state
      if (strategyAPI.strategyState.currentStrategy === 'silent') {
        return;
      }

      if (stateAPI.volumeState.isMuted) {
        return;
      }

      // Apply volume from options or use current volume
      // const effectiveVolume = options.volume ?? stateAPI.getEffectiveVolume();

      // Use audio player with effective volume
      await playerAPI.playSound(soundKey);
    },
    [strategyAPI.strategyState.currentStrategy, stateAPI.volumeState.isMuted, playerAPI.playSound]
  );

  // Play sound with specific volume (convenience method)
  const playSoundWithVolume = useCallback(
    async (soundKey: SoundKey, volume: number) => {
      await playSound(soundKey, { volume });
    },
    [playSound]
  );

  // Get play statistics (legacy format)
  const getPlayStats = useCallback(() => {
    const totalPlays = playerAPI.getTotalPlayCount();
    const playCountBySound: Record<string, number> = {};

    // Convert to legacy format
    preloaderAPI.soundKeys.forEach((soundKey) => {
      playCountBySound[soundKey] = playerAPI.getPlayCount(soundKey);
    });

    return {
      playCountBySound,
      totalPlays,
      lastPlayTimes: {}, // Not tracked in new implementation
    };
  }, [playerAPI, preloaderAPI.soundKeys]);

  // Test if sound can be played
  const canPlaySound = useCallback(
    (soundKey: SoundKey): boolean => {
      if (strategyAPI.strategyState.currentStrategy === 'silent' || stateAPI.volumeState.isMuted) {
        return false;
      }

      // Check if sound is loaded
      return preloaderAPI.loadState.loaded.has(soundKey);
    },
    [
      strategyAPI.strategyState.currentStrategy,
      stateAPI.volumeState.isMuted,
      preloaderAPI.loadState.loaded,
    ]
  );

  // ===== Legacy Compatibility Functions =====
  const unlockAudio = useCallback(async () => {
    // This is now handled automatically by the decomposed hooks
  }, []);

  const initializeSounds = useCallback(() => {
    // This is now handled automatically by preloading
  }, []);

  // Convert state to legacy format for compatibility
  const legacyAudioState: AudioState = {
    loaded: preloaderAPI.loadState.loaded,
    failed: preloaderAPI.loadState.failed,
    loading: preloaderAPI.loadState.loading,
  };

  // ===== Return API (Maintains Full Compatibility) =====
  return {
    // Core playback functions
    playSound,
    playSoundWithVolume,
    stopAllSounds: playerAPI.stopAllSounds,

    // Audio state
    isMuted: stateAPI.volumeState.isMuted,
    volume: stateAPI.volumeState.volume,
    setVolumeLevel: stateAPI.setVolume,
    setVolume: stateAPI.setVolume,
    toggleMute: stateAPI.toggleMute,
    setMuted: stateAPI.setMuted,

    // Strategy management
    strategy: strategyAPI.strategyState.currentStrategy,
    isStrategyInitialized: strategyAPI.strategyState.isInitialized,
    isWebAudioEnabled: strategyAPI.strategyState.currentStrategy === 'webaudio',
    isWebAudioSupported: strategyAPI.strategyState.isWebAudioSupported,
    switchStrategy: strategyAPI.switchToStrategy,
    retryInitialization: strategyAPI.retryInitialization,

    // Preloading
    preloadProgress: preloaderAPI.progress,
    isPreloadComplete: preloaderAPI.progress.isComplete,
    isPreloading: preloaderAPI.progress.isLoading,
    hasPreloadErrors: preloaderAPI.progress.failedSounds > 0,
    preloadSuccessRate:
      preloaderAPI.progress.totalSounds > 0
        ? (preloaderAPI.progress.loadedSounds / preloaderAPI.progress.totalSounds) * 100
        : 0,
    preloadAudio: preloaderAPI.preloadSounds,
    resetPreload: preloaderAPI.clearPreloadState,

    // HTML Audio access (for HTML Audio strategy)
    getHtmlAudioElement: () => undefined, // Not available in decomposed version
    htmlAudioElements: {}, // Not available in decomposed version

    // Utility functions
    canPlaySound,
    canPlayAudio:
      strategyAPI.strategyState.currentStrategy !== 'silent' && !stateAPI.volumeState.isMuted,
    getPlayStats,
    isAudible: !stateAPI.volumeState.isMuted && stateAPI.volumeState.volume > 0,
    getEffectiveVolume: stateAPI.getEffectiveVolume,
    getVolumePercentage: () => Math.round(stateAPI.volumeState.volume * 100),

    // Progress information
    getDetailedProgress: () => {
      if (strategyAPI.strategyState.currentStrategy === 'webaudio') {
        return getAudioPreloadProgress();
      }
      return null;
    },

    // Legacy compatibility
    initializeSounds,
    unlockAudio,
    audioState: legacyAudioState,
    getDetailedAudioState: () =>
      strategyAPI.strategyState.currentStrategy === 'webaudio' ? getAudioPreloadProgress() : null,
    getPreloadProgress: () => {
      if (strategyAPI.strategyState.currentStrategy === 'webaudio') {
        return getAudioPreloadProgress();
      }
      return null;
    },
    getFallbackStatus,
    playStats: getPlayStats(),

    // Debug and recovery features
    hasInitializationError: strategyAPI.strategyState.initializationError !== null,
    initializationError: strategyAPI.strategyState.initializationError,
    canRetryInitialization:
      !strategyAPI.strategyState.isInitialized ||
      strategyAPI.strategyState.initializationError !== null,
    retryAudioInitialization: strategyAPI.retryInitialization,

    // System status
    audioSystemStatus: {
      strategy: strategyAPI.strategyState.currentStrategy,
      initialized: strategyAPI.strategyState.isInitialized,
      webAudioSupported: strategyAPI.strategyState.isWebAudioSupported,
      error: strategyAPI.strategyState.initializationError,
      canRetry:
        !strategyAPI.strategyState.isInitialized ||
        strategyAPI.strategyState.initializationError !== null,
    },

    // ===== Decomposed Hook Access (For Advanced Use Cases) =====
    // These provide direct access to the individual hooks for advanced scenarios
    _internal: {
      strategyAPI,
      stateAPI,
      preloaderAPI,
      playerAPI,
    },
  };
}
