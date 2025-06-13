import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { SoundKey } from '../types/tetris';
import {
  audioManager,
  getAudioPreloadProgress,
  getFallbackStatus,
  playWithFallback,
  preloadAudioSmart,
} from '../utils/audio';
import { log } from '../utils/logging/logger';

export type AudioStrategyType = 'webaudio' | 'htmlaudio' | 'silent';

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

interface AudioStrategyState {
  currentStrategy: AudioStrategyType;
  isWebAudioSupported: boolean;
  isInitialized: boolean;
  initializationError: Error | null;
}

interface AudioVolumeState {
  volume: number;
  isMuted: boolean;
  previousVolume: number;
}

interface PreloadProgress {
  totalSounds: number;
  loadedSounds: number;
  failedSounds: number;
  isLoading: boolean;
  isComplete: boolean;
  progressPercentage: number;
}

interface PlayOptions {
  volume?: number;
  loop?: boolean;
  playbackRate?: number;
}

/**
 * Unified audio management hook
 *
 * Combines all audio functionality into a single, comprehensive hook:
 * - Strategy selection and switching (Web Audio → HTML Audio → Silent)
 * - Volume and mute state management
 * - Audio preloading with progress tracking
 * - Sound playback with fallback handling
 * - Error recovery and retry mechanisms
 */
export function useAudio({
  initialVolume = 0.5,
  initialMuted = false,
  useWebAudio = true,
  autoPreload = true,
  onPreloadComplete,
  onPreloadError,
  onPlayError,
}: UseAudioProps = {}) {
  // ===== Strategy State =====
  const [strategyState, setStrategyState] = useState<AudioStrategyState>({
    currentStrategy: 'silent',
    isWebAudioSupported: false,
    isInitialized: false,
    initializationError: null,
  });

  // ===== Volume State =====
  const [volumeState, setVolumeState] = useState<AudioVolumeState>({
    volume: initialVolume,
    isMuted: initialMuted,
    previousVolume: initialVolume,
  });

  // ===== Preload State =====
  const [loadState, setLoadState] = useState<AudioState>({
    loaded: new Set(),
    failed: new Set(),
    loading: new Set(),
  });

  const [progress, setProgress] = useState<PreloadProgress>({
    totalSounds: 0,
    loadedSounds: 0,
    failedSounds: 0,
    isLoading: false,
    isComplete: false,
    progressPercentage: 0,
  });

  // ===== Refs =====
  const initializationAttempted = useRef(false);
  const preloadAttempted = useRef(false);
  const htmlAudioRefs = useRef<{ [key in SoundKey]?: HTMLAudioElement }>({});
  const lastPlayTime = useRef<{ [key in SoundKey]?: number }>({});
  const playCountRef = useRef<{ [key in SoundKey]?: number }>({});

  // ===== Constants =====
  const PLAY_THROTTLE_MS = 50;

  // Sound file mappings (memoized to prevent dependency changes)
  const soundFiles = useMemo(
    (): Record<SoundKey, string> => ({
      lineClear: '/sounds/line-clear.mp3',
      pieceLand: '/sounds/piece-land.mp3',
      pieceRotate: '/sounds/piece-rotate.mp3',
      tetris: '/sounds/tetris.mp3',
      gameOver: '/sounds/game-over.mp3',
      hardDrop: '/sounds/hard-drop.mp3',
    }),
    []
  );

  const soundKeys = useMemo(() => Object.keys(soundFiles) as SoundKey[], [soundFiles]);

  // ===== Strategy Management =====

  // Detect Web Audio API support
  const detectWebAudioSupport = useCallback((): boolean => {
    if (typeof window === 'undefined') return false;

    try {
      const AudioContext =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof window.AudioContext })
          .webkitAudioContext;
      return !!AudioContext;
    } catch {
      return false;
    }
  }, []);

  // Test Web Audio API initialization
  const testWebAudioStrategy = useCallback(async (): Promise<boolean> => {
    try {
      log.audio('Testing Web Audio strategy...');
      await audioManager.initialize();
      const webAudioState = audioManager.getAudioState();

      log.audio(`Web Audio state: ${JSON.stringify(webAudioState)}`);

      if (!webAudioState.initialized) {
        throw new Error('Web Audio initialization failed');
      }
      log.audio('Web Audio strategy test successful');
      return true;
    } catch (webAudioError) {
      log.audio(`Web Audio initialization failed, falling back to HTML Audio: ${webAudioError}`);
      return false;
    }
  }, []);

  // Test HTML Audio capability
  const testHtmlAudioStrategy = useCallback(async (): Promise<boolean> => {
    try {
      log.audio('Testing HTML Audio strategy...');
      const testAudio = new Audio();
      testAudio.volume = 0;
      testAudio.muted = true;

      const canPlay = testAudio.canPlayType('audio/mpeg');
      log.audio(`HTML Audio MP3 support: ${canPlay}`);

      if (!canPlay) {
        throw new Error('HTML Audio MP3 support not available');
      }
      log.audio('HTML Audio strategy test successful');
      return true;
    } catch (htmlAudioError) {
      log.audio(`HTML Audio test failed, falling back to silent mode: ${htmlAudioError}`);
      return false;
    }
  }, []);

  // Initialize audio strategy (split into smaller functions for complexity)
  const shouldSkipInitialization = useCallback(
    (forceRetry: boolean) => {
      return (
        initializationAttempted.current &&
        !forceRetry &&
        strategyState.isInitialized &&
        !strategyState.initializationError
      );
    },
    [strategyState.isInitialized, strategyState.initializationError]
  );

  const selectFinalStrategy = useCallback(
    async (strategy: AudioStrategyType, webAudioSupported: boolean) => {
      let finalStrategy: AudioStrategyType = strategy;

      // Strategy selection and testing
      if (strategy === 'webaudio' && !webAudioSupported) {
        log.audio('Web Audio not supported, falling back to HTML Audio');
        finalStrategy = 'htmlaudio';
      }

      if (finalStrategy === 'webaudio') {
        log.audio('Testing Web Audio strategy');
        const webAudioWorking = await testWebAudioStrategy();
        if (!webAudioWorking) {
          log.audio('Web Audio failed, falling back to HTML Audio');
          finalStrategy = 'htmlaudio';
        }
      }

      if (finalStrategy === 'htmlaudio') {
        log.audio('Testing HTML Audio strategy');
        const htmlAudioWorking = await testHtmlAudioStrategy();
        if (!htmlAudioWorking) {
          log.audio('HTML Audio failed, falling back to silent mode');
          finalStrategy = 'silent';
        }
      }

      return finalStrategy;
    },
    [testWebAudioStrategy, testHtmlAudioStrategy]
  );

  const initializeStrategy = useCallback(
    async (
      strategy: AudioStrategyType = useWebAudio ? 'webaudio' : 'htmlaudio',
      forceRetry = false
    ) => {
      // Early return if initialization should be skipped
      if (shouldSkipInitialization(forceRetry)) {
        return;
      }

      // Reset initialization flag if retrying or if there was an error
      if (forceRetry || strategyState.initializationError) {
        initializationAttempted.current = false;
      }

      setStrategyState((prev) => ({
        ...prev,
        isInitialized: false,
        initializationError: null,
      }));

      try {
        log.audio(`Initializing audio strategy: ${strategy}, forceRetry: ${forceRetry}`);

        const webAudioSupported = useWebAudio && detectWebAudioSupport();
        log.audio(`Web Audio supported: ${webAudioSupported}, useWebAudio: ${useWebAudio}`);

        const finalStrategy = await selectFinalStrategy(strategy, webAudioSupported);

        initializationAttempted.current = true;
        log.audio(`Initialization complete. Final strategy: ${finalStrategy}`);

        setStrategyState({
          currentStrategy: finalStrategy,
          isWebAudioSupported: webAudioSupported,
          isInitialized: true,
          initializationError: null,
        });
      } catch (error) {
        // Don't mark as attempted if initialization failed, allow retry
        initializationAttempted.current = false;
        log.audio(`Critical initialization error: ${error}`);

        setStrategyState({
          currentStrategy: 'silent',
          isWebAudioSupported: false,
          isInitialized: true,
          initializationError:
            error instanceof Error ? error : new Error('Unknown audio initialization error'),
        });
      }
    },
    [
      useWebAudio,
      detectWebAudioSupport,
      shouldSkipInitialization,
      selectFinalStrategy,
      strategyState.initializationError,
    ]
  );

  // Switch to a different strategy
  const switchStrategy = useCallback(
    async (newStrategy: AudioStrategyType) => {
      initializationAttempted.current = false;
      await initializeStrategy(newStrategy, true);
    },
    [initializeStrategy]
  );

  // Retry current strategy initialization
  const retryInitialization = useCallback(async () => {
    const currentStrategy = strategyState.currentStrategy;
    initializationAttempted.current = false;
    await initializeStrategy(currentStrategy, true);
  }, [initializeStrategy, strategyState.currentStrategy]);

  // ===== Volume Management =====

  // Update volume in the underlying audio system
  const syncVolumeToSystem = useCallback(
    (volume: number) => {
      if (strategyState.currentStrategy === 'webaudio') {
        try {
          audioManager.setMasterVolume(volume);
        } catch {
          // Web Audio not available, ignore
        }
      } else if (strategyState.currentStrategy === 'htmlaudio') {
        // Update all HTML Audio elements
        Object.values(htmlAudioRefs.current).forEach((audio) => {
          if (audio) {
            audio.volume = volume;
          }
        });
      }
      // Silent strategy doesn't need volume sync
    },
    [strategyState.currentStrategy]
  );

  // Update mute in the underlying audio system
  const syncMuteToSystem = useCallback(
    (muted: boolean) => {
      if (strategyState.currentStrategy === 'webaudio') {
        try {
          audioManager.setMuted(muted);
        } catch {
          // Web Audio not available, ignore
        }
      }
      // HTML Audio mute is handled by setting volume to 0
      // Silent strategy doesn't need mute sync
    },
    [strategyState.currentStrategy]
  );

  // Set volume (0.0 to 1.0)
  const setVolume = useCallback(
    (newVolume: number) => {
      const clampedVolume = Math.max(0, Math.min(1, newVolume));

      setVolumeState((prev) => ({
        ...prev,
        volume: clampedVolume,
        previousVolume: prev.isMuted ? prev.previousVolume : clampedVolume,
      }));

      // Sync to underlying system only if not muted
      if (!volumeState.isMuted) {
        syncVolumeToSystem(clampedVolume);
      }
    },
    [volumeState.isMuted, syncVolumeToSystem]
  );

  // Toggle mute state
  const toggleMute = useCallback(() => {
    setVolumeState((prev) => {
      const newMuted = !prev.isMuted;

      // Sync to underlying system
      if (newMuted) {
        syncVolumeToSystem(0);
        syncMuteToSystem(true);
      } else {
        syncVolumeToSystem(prev.previousVolume);
        syncMuteToSystem(false);
      }

      return {
        ...prev,
        isMuted: newMuted,
      };
    });
  }, [syncVolumeToSystem, syncMuteToSystem]);

  // Set mute state directly
  const setMuted = useCallback(
    (muted: boolean) => {
      setVolumeState((prev) => {
        if (prev.isMuted === muted) return prev;

        // Sync to underlying system
        if (muted) {
          syncVolumeToSystem(0);
          syncMuteToSystem(true);
        } else {
          syncVolumeToSystem(prev.previousVolume);
          syncMuteToSystem(false);
        }

        return {
          ...prev,
          isMuted: muted,
        };
      });
    },
    [syncVolumeToSystem, syncMuteToSystem]
  );

  // ===== Preloading =====

  // Update progress state
  const updateProgress = useCallback(() => {
    const totalSounds = soundKeys.length;
    const loadedSounds = loadState.loaded.size;
    const failedSounds = loadState.failed.size;
    const isLoading = loadState.loading.size > 0;
    const isComplete = loadedSounds + failedSounds >= totalSounds && !isLoading;
    const progressPercentage =
      totalSounds > 0 ? Math.round(((loadedSounds + failedSounds) / totalSounds) * 100) : 0;

    setProgress({
      totalSounds,
      loadedSounds,
      failedSounds,
      isLoading,
      isComplete,
      progressPercentage,
    });

    // Call completion callback
    if (isComplete && onPreloadComplete) {
      onPreloadComplete(loadedSounds, failedSounds);
    }
  }, [loadState, soundKeys.length, onPreloadComplete]);

  // Preload using Web Audio API
  const preloadWebAudio = useCallback(async () => {
    try {
      setLoadState((prev) => ({
        ...prev,
        loading: new Set(soundKeys),
      }));

      await preloadAudioSmart();

      // Get loaded sounds from audioManager
      const webAudioState = audioManager.getAudioState();
      const loadedSounds = new Set(webAudioState.loadedSounds as SoundKey[]);
      const failedSounds = new Set(soundKeys.filter((key) => !loadedSounds.has(key)));

      setLoadState({
        loaded: loadedSounds,
        failed: failedSounds,
        loading: new Set(),
      });
    } catch (error) {
      // All sounds failed to load
      setLoadState({
        loaded: new Set(),
        failed: new Set(soundKeys),
        loading: new Set(),
      });

      if (onPreloadError) {
        onPreloadError(error instanceof Error ? error : new Error('Web Audio preload failed'));
      }
    }
  }, [soundKeys, onPreloadError]);

  // Preload using HTML Audio elements
  const preloadHtmlAudio = useCallback(() => {
    setLoadState((prev) => ({
      ...prev,
      loading: new Set(soundKeys),
    }));

    const loadPromises = soundKeys.map((soundKey) => {
      return new Promise<void>((resolve) => {
        const audio = new Audio();
        audio.preload = 'auto';

        const handleLoad = () => {
          htmlAudioRefs.current[soundKey] = audio;
          setLoadState((prev) => ({
            loaded: new Set([...prev.loaded, soundKey]),
            failed: prev.failed,
            loading: new Set([...prev.loading].filter((k) => k !== soundKey)),
          }));
          cleanup();
          resolve();
        };

        const handleError = () => {
          setLoadState((prev) => ({
            loaded: prev.loaded,
            failed: new Set([...prev.failed, soundKey]),
            loading: new Set([...prev.loading].filter((k) => k !== soundKey)),
          }));
          cleanup();
          resolve();
        };

        const cleanup = () => {
          audio.removeEventListener('canplaythrough', handleLoad);
          audio.removeEventListener('error', handleError);
        };

        audio.addEventListener('canplaythrough', handleLoad);
        audio.addEventListener('error', handleError);
        audio.src = soundFiles[soundKey];
      });
    });

    return Promise.allSettled(loadPromises);
  }, [soundKeys, soundFiles]);

  // Main preload function
  const preloadAudio = useCallback(async () => {
    if (preloadAttempted.current || strategyState.currentStrategy === 'silent') {
      return;
    }

    preloadAttempted.current = true;

    try {
      if (strategyState.currentStrategy === 'webaudio') {
        await preloadWebAudio();
      } else if (strategyState.currentStrategy === 'htmlaudio') {
        await preloadHtmlAudio();
      }
    } catch (error) {
      if (onPreloadError) {
        onPreloadError(error instanceof Error ? error : new Error('Audio preload failed'));
      }
    }
  }, [strategyState.currentStrategy, preloadWebAudio, preloadHtmlAudio, onPreloadError]);

  // Reset preload state
  const resetPreload = useCallback(() => {
    preloadAttempted.current = false;
    setLoadState({
      loaded: new Set(),
      failed: new Set(),
      loading: new Set(),
    });
    setProgress({
      totalSounds: 0,
      loadedSounds: 0,
      failedSounds: 0,
      isLoading: false,
      isComplete: false,
      progressPercentage: 0,
    });

    // Clean up HTML Audio elements
    htmlAudioRefs.current = {};
  }, []);

  // Get HTML Audio element for a specific sound
  const getHtmlAudioElement = useCallback((soundKey: SoundKey): HTMLAudioElement | undefined => {
    return htmlAudioRefs.current[soundKey];
  }, []);

  // ===== Sound Playback =====

  // Play sound using Web Audio API
  const playWebAudio = useCallback(
    async (soundKey: SoundKey, options: PlayOptions = {}) => {
      try {
        log.audio(
          `Playing sound via Web Audio: ${soundKey}, volume: ${options.volume ?? volumeState.volume}`
        );
        await playWithFallback(soundKey, {
          volume: options.volume ?? volumeState.volume,
        });
        log.audio(`Web Audio playback successful: ${soundKey}`);
      } catch (error) {
        log.audio(`Web Audio playback failed for ${soundKey}: ${error}`);
        const playError = error instanceof Error ? error : new Error('Web Audio play failed');
        if (onPlayError) {
          onPlayError(soundKey, playError);
        }
        throw playError;
      }
    },
    [volumeState.volume, onPlayError]
  );

  // Play sound using HTML Audio element
  const playHtmlAudio = useCallback(
    async (soundKey: SoundKey, options: PlayOptions = {}) => {
      log.audio(`Attempting HTML Audio playback: ${soundKey}`);

      const audio = getHtmlAudioElement(soundKey);
      if (!audio) {
        log.audio(`HTML Audio element not found for sound: ${soundKey}`);
        throw new Error(`HTML Audio element not found for sound: ${soundKey}`);
      }

      try {
        log.audio(`HTML Audio element found for ${soundKey}, src: ${audio.src}`);

        // Reset to beginning if already playing
        if (!audio.paused) {
          audio.currentTime = 0;
        }

        // Apply options
        const finalVolume = (options.volume ?? volumeState.volume) * (volumeState.isMuted ? 0 : 1);
        audio.volume = finalVolume;
        audio.loop = options.loop ?? false;
        audio.playbackRate = options.playbackRate ?? 1.0;

        log.audio(
          `Playing HTML Audio: ${soundKey}, volume: ${finalVolume}, muted: ${volumeState.isMuted}`
        );
        await audio.play();
        log.audio(`HTML Audio playback successful: ${soundKey}`);
      } catch (error) {
        log.audio(`HTML Audio playback failed for ${soundKey}: ${error}`);
        const playError = error instanceof Error ? error : new Error('HTML Audio play failed');
        if (onPlayError) {
          onPlayError(soundKey, playError);
        }
        throw playError;
      }
    },
    [volumeState.volume, volumeState.isMuted, getHtmlAudioElement, onPlayError]
  );

  // Main play function with throttling and strategy handling
  const playSound = useCallback(
    async (soundKey: SoundKey, options: PlayOptions = {}) => {
      log.audio(
        `playSound called: ${soundKey}, strategy: ${strategyState.currentStrategy}, muted: ${volumeState.isMuted}`
      );

      // Early return for silent mode or muted state
      if (strategyState.currentStrategy === 'silent') {
        log.audio('Skipping playback - silent mode');
        return;
      }

      if (volumeState.isMuted) {
        log.audio('Skipping playback - muted');
        return;
      }

      // Throttle rapid plays of the same sound
      const now = Date.now();
      const lastPlay = lastPlayTime.current[soundKey];
      if (lastPlay && now - lastPlay < PLAY_THROTTLE_MS) {
        log.audio(`Throttling rapid play of ${soundKey}`);
        return;
      }

      lastPlayTime.current[soundKey] = now;
      playCountRef.current[soundKey] = (playCountRef.current[soundKey] ?? 0) + 1;

      try {
        if (strategyState.currentStrategy === 'webaudio') {
          log.audio(`Using Web Audio strategy for ${soundKey}`);
          await playWebAudio(soundKey, options);
        } else if (strategyState.currentStrategy === 'htmlaudio') {
          log.audio(`Using HTML Audio strategy for ${soundKey}`);
          await playHtmlAudio(soundKey, options);
        }
      } catch (error) {
        log.audio(`Playback failed for ${soundKey}: ${error}`);
        // Error already handled in individual play functions
        // This catch prevents unhandled promise rejections
      }
    },
    [strategyState.currentStrategy, volumeState.isMuted, playWebAudio, playHtmlAudio]
  );

  // Play sound with specific volume (convenience method)
  const playSoundWithVolume = useCallback(
    async (soundKey: SoundKey, volume: number) => {
      await playSound(soundKey, { volume });
    },
    [playSound]
  );

  // Stop all sounds (HTML Audio only)
  const stopAllSounds = useCallback(() => {
    if (strategyState.currentStrategy === 'htmlaudio') {
      soundKeys.forEach((soundKey) => {
        const audio = getHtmlAudioElement(soundKey);
        if (audio && !audio.paused) {
          audio.pause();
          audio.currentTime = 0;
        }
      });
    }
    // Web Audio API doesn't support stopping all sounds in current implementation
  }, [strategyState.currentStrategy, soundKeys, getHtmlAudioElement]);

  // Get play statistics
  const getPlayStats = useCallback(() => {
    const stats = { ...playCountRef.current };
    const totalPlays = Object.values(stats).reduce((sum, count) => sum + (count ?? 0), 0);

    return {
      playCountBySound: stats,
      totalPlays,
      lastPlayTimes: { ...lastPlayTime.current },
    };
  }, []);

  // Test if sound can be played
  const canPlaySound = useCallback(
    (soundKey: SoundKey): boolean => {
      if (strategyState.currentStrategy === 'silent' || volumeState.isMuted) {
        return false;
      }

      if (strategyState.currentStrategy === 'htmlaudio') {
        const audio = getHtmlAudioElement(soundKey);
        return !!audio && audio.readyState >= 2; // HAVE_CURRENT_DATA or higher
      }

      // For Web Audio, assume sound can be played if strategy is active
      // More detailed checking would require access to audioManager state
      return strategyState.currentStrategy === 'webaudio';
    },
    [strategyState.currentStrategy, volumeState.isMuted, getHtmlAudioElement]
  );

  // ===== Effects =====

  // Initialize audio strategy on mount with proper error handling
  useEffect(() => {
    const initializeAudio = async () => {
      try {
        log.audio(
          `Checking audio strategy initialization. isInitialized: ${strategyState.isInitialized}`
        );
        if (!strategyState.isInitialized) {
          log.audio('Initializing audio strategy...');
          await initializeStrategy();
          log.audio('Audio strategy initialization completed');
        } else {
          log.audio('Audio strategy already initialized');
        }
      } catch (error) {
        log.audio(`Audio initialization failed: ${error}`);
        // Strategy will automatically fallback to silent mode
      }
    };

    initializeAudio();
  }, [strategyState.isInitialized, initializeStrategy]);

  // Retry initialization if it failed
  useEffect(() => {
    if (strategyState.initializationError && !strategyState.isInitialized) {
      console.warn('Audio initialization error detected, attempting retry...');
      const retryTimer = setTimeout(() => {
        retryInitialization().catch((error) => {
          console.error('Audio retry failed:', error);
        });
      }, 1000); // Retry after 1 second

      return () => clearTimeout(retryTimer);
    }

    return () => {};
  }, [strategyState.initializationError, strategyState.isInitialized, retryInitialization]);

  // Auto-preload when strategy changes
  useEffect(() => {
    if (autoPreload && strategyState.currentStrategy !== 'silent' && strategyState.isInitialized) {
      resetPreload();
      preloadAudio();
    }
  }, [
    strategyState.currentStrategy,
    strategyState.isInitialized,
    autoPreload,
    resetPreload,
    preloadAudio,
  ]);

  // Update progress when load state changes
  useEffect(() => {
    updateProgress();
  }, [loadState, updateProgress]);

  // Sync state to system when strategy changes
  useEffect(() => {
    if (volumeState.isMuted) {
      syncVolumeToSystem(0);
      syncMuteToSystem(true);
    } else {
      syncVolumeToSystem(volumeState.volume);
      syncMuteToSystem(false);
    }
  }, [
    strategyState.currentStrategy,
    volumeState.volume,
    volumeState.isMuted,
    syncVolumeToSystem,
    syncMuteToSystem,
  ]);

  // ===== Legacy Compatibility Functions =====
  const unlockAudio = useCallback(async () => {
    // This is now handled automatically by the decomposed hooks
    // Kept for backward compatibility
  }, []);

  const initializeSounds = useCallback(() => {
    // This is now handled automatically by preloading
    // Kept for backward compatibility
  }, []);

  // Convert state to legacy format for compatibility
  const legacyAudioState: AudioState = {
    loaded: loadState.loaded,
    failed: loadState.failed,
    loading: loadState.loading,
  };

  // ===== Return API =====
  return {
    // Core playback functions
    playSound,
    playSoundWithVolume,
    stopAllSounds,

    // Audio state
    isMuted: volumeState.isMuted,
    volume: volumeState.volume,
    setVolumeLevel: setVolume,
    setVolume,
    toggleMute,
    setMuted,

    // Strategy management
    strategy: strategyState.currentStrategy,
    isStrategyInitialized: strategyState.isInitialized,
    isWebAudioEnabled: strategyState.currentStrategy === 'webaudio',
    isWebAudioSupported: strategyState.isWebAudioSupported,
    switchStrategy,
    retryInitialization,

    // Preloading
    preloadProgress: progress,
    isPreloadComplete: progress.isComplete,
    isPreloading: progress.isLoading,
    hasPreloadErrors: progress.failedSounds > 0,
    preloadSuccessRate:
      progress.totalSounds > 0 ? (progress.loadedSounds / progress.totalSounds) * 100 : 0,
    preloadAudio,
    resetPreload,

    // HTML Audio access (for HTML Audio strategy)
    getHtmlAudioElement,
    htmlAudioElements: htmlAudioRefs.current,

    // Utility functions
    canPlaySound,
    canPlayAudio: strategyState.currentStrategy !== 'silent' && !volumeState.isMuted,
    getPlayStats,
    isAudible: !volumeState.isMuted && volumeState.volume > 0,
    getEffectiveVolume: () => (volumeState.isMuted ? 0 : volumeState.volume),
    getVolumePercentage: () => Math.round(volumeState.volume * 100),

    // Progress information
    getDetailedProgress: () => {
      if (strategyState.currentStrategy === 'webaudio') {
        return getAudioPreloadProgress();
      }
      return null;
    },

    // Legacy compatibility
    initializeSounds,
    unlockAudio,
    audioState: legacyAudioState,
    getDetailedAudioState: () =>
      strategyState.currentStrategy === 'webaudio' ? getAudioPreloadProgress() : null,
    getPreloadProgress: () => {
      if (strategyState.currentStrategy === 'webaudio') {
        return getAudioPreloadProgress();
      }
      return null;
    },
    getFallbackStatus,
    playStats: getPlayStats(),

    // Debug and recovery features
    hasInitializationError: strategyState.initializationError !== null,
    initializationError: strategyState.initializationError,
    canRetryInitialization:
      !strategyState.isInitialized || strategyState.initializationError !== null,
    retryAudioInitialization: retryInitialization,

    // System status
    audioSystemStatus: {
      strategy: strategyState.currentStrategy,
      initialized: strategyState.isInitialized,
      webAudioSupported: strategyState.isWebAudioSupported,
      error: strategyState.initializationError,
      canRetry: !strategyState.isInitialized || strategyState.initializationError !== null,
    },
  };
}
