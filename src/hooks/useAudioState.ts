import { useState, useCallback, useEffect, useRef } from 'react';
import { audioManager } from '../utils/audio';
import { AudioStrategyType } from './useAudioStrategy';

interface UseAudioStateProps {
  initialVolume?: number;
  initialMuted?: boolean;
  strategy?: AudioStrategyType;
}

interface AudioState {
  volume: number;
  isMuted: boolean;
  previousVolume: number; // For restoring volume after unmute
}

/**
 * Audio state management hook
 *
 * Manages volume and mute state independently of the audio strategy.
 * Synchronizes state with the underlying audio system (Web Audio or HTML Audio).
 */
export function useAudioState({
  initialVolume = 0.5,
  initialMuted = false,
  strategy = 'webaudio',
}: UseAudioStateProps = {}) {
  const [audioState, setAudioState] = useState<AudioState>({
    volume: initialVolume,
    isMuted: initialMuted,
    previousVolume: initialVolume,
  });

  // Refs for HTML Audio elements (when using HTML Audio strategy)
  const htmlAudioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});

  // Update volume in the underlying audio system
  const syncVolumeToSystem = useCallback(
    (volume: number) => {
      if (strategy === 'webaudio') {
        try {
          audioManager.setMasterVolume(volume);
        } catch {
          // Web Audio not available, ignore
        }
      } else if (strategy === 'htmlaudio') {
        // Update all HTML Audio elements
        Object.values(htmlAudioRefs.current).forEach((audio) => {
          if (audio) {
            audio.volume = volume;
          }
        });
      }
      // Silent strategy doesn't need volume sync
    },
    [strategy]
  );

  // Update mute in the underlying audio system
  const syncMuteToSystem = useCallback(
    (muted: boolean) => {
      if (strategy === 'webaudio') {
        try {
          audioManager.setMuted(muted);
        } catch {
          // Web Audio not available, ignore
        }
      }
      // HTML Audio mute is handled by setting volume to 0
      // Silent strategy doesn't need mute sync
    },
    [strategy]
  );

  // Set volume (0.0 to 1.0)
  const setVolume = useCallback(
    (newVolume: number) => {
      const clampedVolume = Math.max(0, Math.min(1, newVolume));

      setAudioState((prev) => ({
        ...prev,
        volume: clampedVolume,
        previousVolume: prev.isMuted ? prev.previousVolume : clampedVolume,
      }));

      // Sync to underlying system only if not muted
      if (!audioState.isMuted) {
        syncVolumeToSystem(clampedVolume);
      }
    },
    [audioState.isMuted, syncVolumeToSystem]
  );

  // Toggle mute state
  const toggleMute = useCallback(() => {
    setAudioState((prev) => {
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
      setAudioState((prev) => {
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

  // Register HTML Audio element for volume sync
  const registerHtmlAudio = useCallback(
    (key: string, audio: HTMLAudioElement) => {
      htmlAudioRefs.current[key] = audio;

      // Set initial volume and mute state
      audio.volume = audioState.isMuted ? 0 : audioState.volume;
    },
    [audioState.volume, audioState.isMuted]
  );

  // Unregister HTML Audio element
  const unregisterHtmlAudio = useCallback((key: string) => {
    delete htmlAudioRefs.current[key];
  }, []);

  // Sync state to system when strategy changes
  useEffect(() => {
    if (audioState.isMuted) {
      syncVolumeToSystem(0);
      syncMuteToSystem(true);
    } else {
      syncVolumeToSystem(audioState.volume);
      syncMuteToSystem(false);
    }
  }, [strategy, audioState.volume, audioState.isMuted, syncVolumeToSystem, syncMuteToSystem]);

  // Get effective volume (considering mute state)
  const getEffectiveVolume = useCallback(() => {
    return audioState.isMuted ? 0 : audioState.volume;
  }, [audioState.isMuted, audioState.volume]);

  // Get volume percentage for UI display
  const getVolumePercentage = useCallback(() => {
    return Math.round(audioState.volume * 100);
  }, [audioState.volume]);

  return {
    // Current state
    volume: audioState.volume,
    isMuted: audioState.isMuted,
    effectiveVolume: getEffectiveVolume(),
    volumePercentage: getVolumePercentage(),

    // State control
    setVolume,
    setMuted,
    toggleMute,

    // HTML Audio registration (for HTML Audio strategy)
    registerHtmlAudio,
    unregisterHtmlAudio,

    // Utility functions
    isAudible: !audioState.isMuted && audioState.volume > 0,
    canUnmute: audioState.previousVolume > 0,
  };
}
