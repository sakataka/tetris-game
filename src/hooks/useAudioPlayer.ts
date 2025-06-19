import { useCallback, useRef, useState } from 'react';
import { DEFAULT_VALUES } from '@/constants';
import type { SoundKey } from '@/types/tetris';
import { audioManager } from '@/utils/audio';
import { log } from '@/utils/logging/logger';

interface PlaybackState {
  playCount: Record<SoundKey, number>;
  lastPlayTime: Record<SoundKey, number>;
  isPlaying: Set<SoundKey>;
}

interface UseAudioPlayerProps {
  throttleMs?: number;
  onPlaySound?: (soundKey: SoundKey) => void;
  onPlayError?: (soundKey: SoundKey, error: Error) => void;
  enablePlayCount?: boolean;
}

interface AudioPlayerAPI {
  playbackState: PlaybackState;
  playSound: (soundKey: SoundKey) => Promise<boolean>;
  stopSound: (soundKey: SoundKey) => void;
  stopAllSounds: () => void;
  getPlayCount: (soundKey: SoundKey) => number;
  getTotalPlayCount: () => number;
  clearPlayCounts: () => void;
  isThrottled: (soundKey: SoundKey) => boolean;
}

/**
 * Audio playback management with throttling and statistics
 *
 * Handles:
 * - Sound playback with throttling to prevent audio spam
 * - Play count tracking for statistics
 * - Error handling for playback failures
 * - Integration with audio manager utility
 */
export function useAudioPlayer({
  throttleMs = DEFAULT_VALUES.AUDIO.THROTTLE_MS,
  onPlaySound,
  onPlayError,
  enablePlayCount = true,
}: UseAudioPlayerProps = {}): AudioPlayerAPI {
  // ===== Playback State =====
  const [playbackState, setPlaybackState] = useState<PlaybackState>({
    playCount: {} as Record<SoundKey, number>,
    lastPlayTime: {} as Record<SoundKey, number>,
    isPlaying: new Set(),
  });

  // ===== Refs =====
  const throttleTimers = useRef<Record<string, NodeJS.Timeout>>({});

  // ===== Throttling Utilities =====

  const isThrottled = useCallback(
    (soundKey: SoundKey): boolean => {
      const now = Date.now();
      const lastPlay = playbackState.lastPlayTime[soundKey] || 0;
      return now - lastPlay < throttleMs;
    },
    [playbackState.lastPlayTime, throttleMs]
  );

  const updatePlaybackTiming = useCallback((soundKey: SoundKey, isPlaying: boolean) => {
    const now = Date.now();

    setPlaybackState((prev) => ({
      ...prev,
      lastPlayTime: {
        ...prev.lastPlayTime,
        [soundKey]: now,
      },
      isPlaying: isPlaying
        ? new Set([...prev.isPlaying, soundKey])
        : new Set([...prev.isPlaying].filter((key) => key !== soundKey)),
    }));
  }, []);

  // ===== Play Count Management =====

  const incrementPlayCount = useCallback(
    (soundKey: SoundKey) => {
      if (!enablePlayCount) return;

      setPlaybackState((prev) => ({
        ...prev,
        playCount: {
          ...prev.playCount,
          [soundKey]: (prev.playCount[soundKey] || 0) + 1,
        },
      }));
    },
    [enablePlayCount]
  );

  const getPlayCount = useCallback(
    (soundKey: SoundKey): number => {
      return playbackState.playCount[soundKey] || 0;
    },
    [playbackState.playCount]
  );

  const getTotalPlayCount = useCallback((): number => {
    return Object.values(playbackState.playCount).reduce((total, count) => total + count, 0);
  }, [playbackState.playCount]);

  const clearPlayCounts = useCallback(() => {
    log.audio('Clearing all play counts', { action: 'clearPlayCounts' });

    setPlaybackState((prev) => ({
      ...prev,
      playCount: {} as Record<SoundKey, number>,
    }));
  }, []);

  // ===== Sound Playback =====

  const playSound = useCallback(
    async (soundKey: SoundKey): Promise<boolean> => {
      // Throttling check
      if (isThrottled(soundKey)) {
        log.audio(`Sound ${soundKey} is throttled, skipping`, { action: 'playSound' });
        return false;
      }

      try {
        // Update timing immediately to prevent rapid firing
        updatePlaybackTiming(soundKey, true);

        log.audio(`Playing sound: ${soundKey}`, { action: 'playSound' });

        // Play through audio manager (returns void, no boolean result)
        await audioManager.playSound(soundKey);

        // If we reach here, playback was successful
        // Increment play count on successful play
        incrementPlayCount(soundKey);
        onPlaySound?.(soundKey);

        log.audio(`Successfully played: ${soundKey}`, { action: 'playSound' });

        // Clear playing state after a short delay (most sounds are short)
        setTimeout(() => {
          updatePlaybackTiming(soundKey, false);
        }, 1000);

        return true;
      } catch (error) {
        const audioError = error instanceof Error ? error : new Error(String(error));

        // Clear playing state on error
        updatePlaybackTiming(soundKey, false);

        log.audio(`Error playing ${soundKey}: ${audioError.message}`, { action: 'playSound' });
        onPlayError?.(soundKey, audioError);

        return false;
      }
    },
    [isThrottled, updatePlaybackTiming, incrementPlayCount, onPlaySound, onPlayError]
  );

  // ===== Sound Control =====

  const stopSound = useCallback(
    (soundKey: SoundKey) => {
      log.audio(`Stopping sound: ${soundKey}`, { action: 'stopSound' });

      try {
        // Stop through audio manager
        audioManager.stopSound?.(soundKey);

        // Update state
        updatePlaybackTiming(soundKey, false);

        // Clear any pending throttle timers
        const timerKey = `stop_${soundKey}`;
        if (throttleTimers.current[timerKey]) {
          clearTimeout(throttleTimers.current[timerKey]);
          delete throttleTimers.current[timerKey];
        }
      } catch (error) {
        const audioError = error instanceof Error ? error : new Error(String(error));
        log.audio(`Error stopping ${soundKey}: ${audioError.message}`, { action: 'stopSound' });
      }
    },
    [updatePlaybackTiming]
  );

  const stopAllSounds = useCallback(() => {
    log.audio('Stopping all sounds', { action: 'stopAllSounds' });

    try {
      // Stop all sounds through audio manager
      audioManager.stopAllSounds?.();

      // Clear all playing states
      setPlaybackState((prev) => ({
        ...prev,
        isPlaying: new Set(),
      }));

      // Clear all throttle timers
      Object.values(throttleTimers.current).forEach(clearTimeout);
      throttleTimers.current = {};
    } catch (error) {
      const audioError = error instanceof Error ? error : new Error(String(error));
      log.audio(`Error stopping all sounds: ${audioError.message}`, { action: 'stopAllSounds' });
    }
  }, []);

  // ===== Cleanup Effect =====
  // Timer cleanup is handled in stopAllSounds when needed

  // ===== API =====
  return {
    playbackState,
    playSound,
    stopSound,
    stopAllSounds,
    getPlayCount,
    getTotalPlayCount,
    clearPlayCounts,
    isThrottled,
  };
}
