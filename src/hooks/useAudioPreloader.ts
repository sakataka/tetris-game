import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DEFAULT_VALUES } from '@/constants';
import type { SoundKey } from '@/types/tetris';
import { getAudioPreloadProgress, preloadAudioSmart } from '@/utils/audio';
import { log } from '@/utils/logging/logger';

interface AudioState {
  loaded: Set<SoundKey>;
  failed: Set<SoundKey>;
  loading: Set<SoundKey>;
}

interface PreloadProgress {
  totalSounds: number;
  loadedSounds: number;
  failedSounds: number;
  isLoading: boolean;
  isComplete: boolean;
  progressPercentage: number;
}

interface UseAudioPreloaderProps {
  autoPreload?: boolean;
  onPreloadComplete?: (loadedCount: number, failedCount: number) => void;
  onPreloadError?: (error: Error) => void;
  onSoundLoaded?: (soundKey: SoundKey) => void;
  onSoundFailed?: (soundKey: SoundKey, error: Error) => void;
}

interface AudioPreloaderAPI {
  loadState: AudioState;
  progress: PreloadProgress;
  preloadSounds: () => Promise<void>;
  preloadSound: (soundKey: SoundKey) => Promise<boolean>;
  clearPreloadState: () => void;
  retryFailedSounds: () => Promise<void>;
  soundFiles: Record<SoundKey, string>;
  soundKeys: SoundKey[];
}

/**
 * Audio file preloading and progress management
 *
 * Handles:
 * - Smart audio preloading with progress tracking
 * - Individual sound loading with error handling
 * - Retry mechanisms for failed loads
 * - Load state management (loaded/failed/loading)
 */
export function useAudioPreloader({
  autoPreload = true,
  onPreloadComplete,
  onPreloadError,
  onSoundLoaded,
  onSoundFailed,
}: UseAudioPreloaderProps = {}): AudioPreloaderAPI {
  // ===== Sound Files Configuration =====
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

  // ===== Preload State =====
  const [loadState, setLoadState] = useState<AudioState>({
    loaded: new Set(),
    failed: new Set(),
    loading: new Set(),
  });

  const [progress, setProgress] = useState<PreloadProgress>({
    totalSounds: soundKeys.length,
    loadedSounds: 0,
    failedSounds: 0,
    isLoading: false,
    isComplete: false,
    progressPercentage: 0,
  });

  // ===== Refs =====
  const preloadAttempted = useRef(false);
  const preloadInProgress = useRef(false);

  // ===== Progress Calculation =====
  const updateProgress = useCallback(
    (loadState: AudioState) => {
      const totalSounds = soundKeys.length;
      const loadedSounds = loadState.loaded.size;
      const failedSounds = loadState.failed.size;
      const isLoading = loadState.loading.size > 0;
      const isComplete = !isLoading && loadedSounds + failedSounds >= totalSounds;
      const progressPercentage =
        totalSounds > 0 ? ((loadedSounds + failedSounds) / totalSounds) * 100 : 0;

      setProgress({
        totalSounds,
        loadedSounds,
        failedSounds,
        isLoading,
        isComplete,
        progressPercentage,
      });

      // Notify completion
      if (isComplete && !preloadInProgress.current) {
        onPreloadComplete?.(loadedSounds, failedSounds);
        log.audio(`Preload complete: ${loadedSounds} loaded, ${failedSounds} failed`, {
          action: 'updateProgress',
        });
      }
    },
    [soundKeys.length, onPreloadComplete]
  );

  // ===== Individual Sound Loading =====

  const preloadSound = useCallback(
    async (soundKey: SoundKey): Promise<boolean> => {
      const soundPath = soundFiles[soundKey];
      if (!soundPath) {
        log.audio(`No path found for sound: ${soundKey}`, { action: 'preloadSound' });
        return false;
      }

      // Skip if already loaded or currently loading
      if (loadState.loaded.has(soundKey) || loadState.loading.has(soundKey)) {
        return loadState.loaded.has(soundKey);
      }

      log.audio(`Starting preload for: ${soundKey}`, { action: 'preloadSound' });

      // Mark as loading
      setLoadState((prev) => ({
        ...prev,
        loading: new Set([...prev.loading, soundKey]),
        failed: new Set([...prev.failed].filter((key) => key !== soundKey)), // Remove from failed if retrying
      }));

      try {
        const progress = await preloadAudioSmart();
        const success = progress.progress > 0; // Consider it successful if any progress was made

        setLoadState((prev) => {
          const newState = {
            ...prev,
            loading: new Set([...prev.loading].filter((key) => key !== soundKey)),
          };

          if (success) {
            newState.loaded = new Set([...prev.loaded, soundKey]);
            onSoundLoaded?.(soundKey);
            log.audio(`Successfully loaded: ${soundKey}`, { action: 'preloadSound' });
          } else {
            newState.failed = new Set([...prev.failed, soundKey]);
            const error = new Error(`Failed to preload ${soundKey}`);
            onSoundFailed?.(soundKey, error);
            log.audio(`Failed to load: ${soundKey}`, { action: 'preloadSound' });
          }

          updateProgress(newState);
          return newState;
        });

        return success;
      } catch (error) {
        const audioError = error instanceof Error ? error : new Error(String(error));

        setLoadState((prev) => {
          const newState = {
            ...prev,
            loading: new Set([...prev.loading].filter((key) => key !== soundKey)),
            failed: new Set([...prev.failed, soundKey]),
          };

          updateProgress(newState);
          return newState;
        });

        onSoundFailed?.(soundKey, audioError);
        onPreloadError?.(audioError);
        log.audio(`Error loading ${soundKey}: ${audioError.message}`, { action: 'preloadSound' });
        return false;
      }
    },
    [
      soundFiles,
      loadState.loaded,
      loadState.loading,
      updateProgress,
      onSoundLoaded,
      onSoundFailed,
      onPreloadError,
    ]
  );

  // ===== Bulk Preloading =====

  const preloadSounds = useCallback(async (): Promise<void> => {
    if (preloadInProgress.current) {
      log.audio('Preload already in progress, skipping', { action: 'preloadSounds' });
      return;
    }

    preloadInProgress.current = true;
    log.audio(`Starting bulk preload of ${soundKeys.length} sounds`, { action: 'preloadSounds' });

    try {
      // Check current progress from audio utils
      const currentProgress = getAudioPreloadProgress();
      if (currentProgress.progress >= DEFAULT_VALUES.AUDIO.PRELOAD_PROGRESS_COMPLETE) {
        log.audio('All sounds already preloaded', { action: 'preloadSounds' });

        // Update state to reflect completed preload
        setLoadState({
          loaded: new Set(soundKeys),
          failed: new Set(),
          loading: new Set(),
        });

        return;
      }

      // Preload all sounds concurrently
      const preloadPromises = soundKeys.map((soundKey) => preloadSound(soundKey));
      await Promise.allSettled(preloadPromises);

      log.audio('Bulk preload completed', { action: 'preloadSounds' });
    } catch (error) {
      const audioError = error instanceof Error ? error : new Error(String(error));
      log.audio(`Error during bulk preload: ${audioError.message}`, { action: 'preloadSounds' });
      onPreloadError?.(audioError);
    } finally {
      preloadInProgress.current = false;
    }
  }, [soundKeys, preloadSound, onPreloadError]);

  // ===== Retry Mechanisms =====

  const retryFailedSounds = useCallback(async (): Promise<void> => {
    const failedSounds = Array.from(loadState.failed);
    if (failedSounds.length === 0) {
      log.audio('No failed sounds to retry', { action: 'retryFailedSounds' });
      return;
    }

    log.audio(`Retrying ${failedSounds.length} failed sounds`, { action: 'retryFailedSounds' });

    const retryPromises = failedSounds.map((soundKey) => preloadSound(soundKey));
    await Promise.allSettled(retryPromises);
  }, [loadState.failed, preloadSound]);

  // ===== State Management =====

  const clearPreloadState = useCallback(() => {
    log.audio('Clearing preload state', { action: 'clearPreloadState' });

    setLoadState({
      loaded: new Set(),
      failed: new Set(),
      loading: new Set(),
    });

    setProgress({
      totalSounds: soundKeys.length,
      loadedSounds: 0,
      failedSounds: 0,
      isLoading: false,
      isComplete: false,
      progressPercentage: 0,
    });

    preloadAttempted.current = false;
    preloadInProgress.current = false;
  }, [soundKeys.length]);

  // ===== Auto-preload Effect =====
  useEffect(() => {
    if (autoPreload && !preloadAttempted.current) {
      preloadAttempted.current = true;
      log.audio('Starting auto-preload', { action: 'useAudioPreloader' });
      preloadSounds();
    }
  }, [autoPreload, preloadSounds]);

  // ===== Progress Update Effect =====
  useEffect(() => {
    updateProgress(loadState);
  }, [loadState, updateProgress]);

  // ===== API =====
  return {
    loadState,
    progress,
    preloadSounds,
    preloadSound,
    clearPreloadState,
    retryFailedSounds,
    soundFiles,
    soundKeys,
  };
}
