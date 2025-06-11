import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import type { SoundKey } from '../types/tetris';
import { preloadAudioSmart, getAudioPreloadProgress, audioManager } from '../utils/audio';
import { AudioStrategyType } from './useAudioStrategy';

interface AudioLoadState {
  loaded: Set<SoundKey>;
  failed: Set<SoundKey>;
  loading: Set<SoundKey>;
}

interface UseAudioPreloaderProps {
  strategy: AudioStrategyType;
  autoPreload?: boolean;
  onPreloadComplete?: (loadedCount: number, failedCount: number) => void;
  onPreloadError?: (error: Error) => void;
}

interface PreloadProgress {
  totalSounds: number;
  loadedSounds: number;
  failedSounds: number;
  isLoading: boolean;
  isComplete: boolean;
  progressPercentage: number;
}

/**
 * Audio preloading and initialization hook
 *
 * Handles the loading of audio files for different strategies:
 * - Web Audio API: Uses smart preloading system
 * - HTML Audio: Creates and preloads HTML Audio elements
 * - Silent: No-op preloading
 */
export function useAudioPreloader({
  strategy,
  autoPreload = true,
  onPreloadComplete,
  onPreloadError,
}: UseAudioPreloaderProps) {
  const [loadState, setLoadState] = useState<AudioLoadState>({
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

  const htmlAudioRefs = useRef<{ [key in SoundKey]?: HTMLAudioElement }>({});
  const preloadAttempted = useRef(false);

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
    if (preloadAttempted.current || strategy === 'silent') {
      return;
    }

    preloadAttempted.current = true;

    try {
      if (strategy === 'webaudio') {
        await preloadWebAudio();
      } else if (strategy === 'htmlaudio') {
        await preloadHtmlAudio();
      }
    } catch (error) {
      if (onPreloadError) {
        onPreloadError(error instanceof Error ? error : new Error('Audio preload failed'));
      }
    }
  }, [strategy, preloadWebAudio, preloadHtmlAudio, onPreloadError]);

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

  // Get detailed preload progress (for Web Audio)
  const getDetailedProgress = useCallback(() => {
    if (strategy === 'webaudio') {
      return getAudioPreloadProgress();
    }
    return null;
  }, [strategy]);

  // Auto-preload when strategy changes
  useEffect(() => {
    if (autoPreload && strategy !== 'silent') {
      resetPreload();
      preloadAudio();
    }
  }, [strategy, autoPreload, resetPreload, preloadAudio]);

  // Update progress when load state changes
  useEffect(() => {
    updateProgress();
  }, [loadState, updateProgress]);

  return {
    // Preload state
    loadState,
    progress,

    // Preload control
    preloadAudio,
    resetPreload,

    // HTML Audio access (for HTML Audio strategy)
    getHtmlAudioElement,
    htmlAudioElements: htmlAudioRefs.current,

    // Progress information
    getDetailedProgress,

    // Status checks
    isPreloadComplete: progress.isComplete,
    isPreloading: progress.isLoading,
    hasPreloadErrors: progress.failedSounds > 0,
    preloadSuccessRate:
      progress.totalSounds > 0 ? (progress.loadedSounds / progress.totalSounds) * 100 : 0,
  };
}
