import { useCallback, useRef } from 'react';
import type { SoundKey } from '../types/tetris';
import { playWithFallback } from '../utils/audio';
import { AudioStrategyType } from './useAudioStrategy';
import { log } from '../utils/logging/logger';

interface UseAudioPlayerProps {
  strategy: AudioStrategyType;
  volume: number;
  isMuted: boolean;
  getHtmlAudioElement?: (soundKey: SoundKey) => HTMLAudioElement | undefined;
  onPlayError?: (soundKey: SoundKey, error: Error) => void;
}

interface PlayOptions {
  volume?: number;
  loop?: boolean;
  playbackRate?: number;
}

/**
 * Simple audio playback interface hook
 *
 * Provides a clean, strategy-agnostic interface for playing sounds.
 * Handles fallback logic and error reporting.
 */
export function useAudioPlayer({
  strategy,
  volume,
  isMuted,
  getHtmlAudioElement,
  onPlayError,
}: UseAudioPlayerProps) {
  const lastPlayTime = useRef<{ [key in SoundKey]?: number }>({});
  const playCountRef = useRef<{ [key in SoundKey]?: number }>({});

  // Throttle rapid sound plays (prevent audio spam)
  const PLAY_THROTTLE_MS = 50;

  // Play sound using Web Audio API
  const playWebAudio = useCallback(
    async (soundKey: SoundKey, options: PlayOptions = {}) => {
      try {
        log.audio(`Playing sound via Web Audio: ${soundKey}, volume: ${options.volume ?? volume}`);
        await playWithFallback(soundKey, {
          volume: options.volume ?? volume,
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
    [volume, onPlayError]
  );

  // Play sound using HTML Audio element
  const playHtmlAudio = useCallback(
    async (soundKey: SoundKey, options: PlayOptions = {}) => {
      log.audio(`Attempting HTML Audio playback: ${soundKey}`);

      if (!getHtmlAudioElement) {
        log.audio('HTML Audio element getter not provided');
        throw new Error('HTML Audio element getter not provided');
      }

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
        const finalVolume = (options.volume ?? volume) * (isMuted ? 0 : 1);
        audio.volume = finalVolume;
        audio.loop = options.loop ?? false;
        audio.playbackRate = options.playbackRate ?? 1.0;

        log.audio(`Playing HTML Audio: ${soundKey}, volume: ${finalVolume}, muted: ${isMuted}`);
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
    [volume, isMuted, getHtmlAudioElement, onPlayError]
  );

  // Main play function with throttling and strategy handling
  const playSound = useCallback(
    async (soundKey: SoundKey, options: PlayOptions = {}) => {
      log.audio(`playSound called: ${soundKey}, strategy: ${strategy}, muted: ${isMuted}`);

      // Early return for silent mode or muted state
      if (strategy === 'silent') {
        log.audio(`Skipping playback - silent mode`);
        return;
      }

      if (isMuted) {
        log.audio(`Skipping playback - muted`);
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
        if (strategy === 'webaudio') {
          log.audio(`Using Web Audio strategy for ${soundKey}`);
          await playWebAudio(soundKey, options);
        } else if (strategy === 'htmlaudio') {
          log.audio(`Using HTML Audio strategy for ${soundKey}`);
          await playHtmlAudio(soundKey, options);
        }
      } catch (error) {
        log.audio(`Playback failed for ${soundKey}: ${error}`);
        // Error already handled in individual play functions
        // This catch prevents unhandled promise rejections
      }
    },
    [strategy, isMuted, playWebAudio, playHtmlAudio]
  );

  // Play sound with specific volume (convenience method)
  const playSoundWithVolume = useCallback(
    async (soundKey: SoundKey, volume: number) => {
      await playSound(soundKey, { volume });
    },
    [playSound]
  );

  // Play looped sound (for background music)
  const playLoopedSound = useCallback(
    async (soundKey: SoundKey, options: PlayOptions = {}) => {
      await playSound(soundKey, { ...options, loop: true });
    },
    [playSound]
  );

  // Stop looped sound (HTML Audio only)
  const stopLoopedSound = useCallback(
    (soundKey: SoundKey) => {
      if (strategy === 'htmlaudio' && getHtmlAudioElement) {
        const audio = getHtmlAudioElement(soundKey);
        if (audio && !audio.paused) {
          audio.pause();
          audio.currentTime = 0;
        }
      }
      // Web Audio API doesn't support stopping individual sounds in current implementation
    },
    [strategy, getHtmlAudioElement]
  );

  // Stop all sounds (HTML Audio only)
  const stopAllSounds = useCallback(() => {
    if (strategy === 'htmlaudio' && getHtmlAudioElement) {
      const soundKeys: SoundKey[] = [
        'lineClear',
        'pieceLand',
        'pieceRotate',
        'tetris',
        'gameOver',
        'hardDrop',
      ];
      soundKeys.forEach((soundKey) => {
        const audio = getHtmlAudioElement(soundKey);
        if (audio && !audio.paused) {
          audio.pause();
          audio.currentTime = 0;
        }
      });
    }
    // Web Audio API doesn't support stopping all sounds in current implementation
  }, [strategy, getHtmlAudioElement]);

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

  // Reset play statistics
  const resetPlayStats = useCallback(() => {
    lastPlayTime.current = {};
    playCountRef.current = {};
  }, []);

  // Test if sound can be played
  const canPlaySound = useCallback(
    (soundKey: SoundKey): boolean => {
      if (strategy === 'silent' || isMuted) {
        return false;
      }

      if (strategy === 'htmlaudio' && getHtmlAudioElement) {
        const audio = getHtmlAudioElement(soundKey);
        return !!audio && audio.readyState >= 2; // HAVE_CURRENT_DATA or higher
      }

      // For Web Audio, assume sound can be played if strategy is active
      // More detailed checking would require access to audioManager state
      return strategy === 'webaudio';
    },
    [strategy, isMuted, getHtmlAudioElement]
  );

  return {
    // Main play functions
    playSound,
    playSoundWithVolume,
    playLoopedSound,

    // Sound control
    stopLoopedSound,
    stopAllSounds,

    // Utility functions
    canPlaySound,
    getPlayStats,
    resetPlayStats,

    // Status information
    isPlaybackEnabled: strategy !== 'silent' && !isMuted,
    currentStrategy: strategy,
  };
}
