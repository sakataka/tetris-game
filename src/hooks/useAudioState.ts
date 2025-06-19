import { useCallback, useState } from 'react';
import { log } from '@/utils/logging/logger';

interface AudioVolumeState {
  volume: number;
  isMuted: boolean;
  previousVolume: number;
}

interface UseAudioStateProps {
  initialVolume?: number;
  initialMuted?: boolean;
  onVolumeChange?: (volume: number) => void;
  onMuteToggle?: (isMuted: boolean) => void;
}

interface AudioStateAPI {
  volumeState: AudioVolumeState;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  setMuted: (muted: boolean) => void;
  getEffectiveVolume: () => number;
}

/**
 * Audio volume and mute state management
 *
 * Handles:
 * - Volume level control with validation
 * - Mute/unmute functionality with volume preservation
 * - Effective volume calculation (considers mute state)
 * - Volume change notifications
 */
export function useAudioState({
  initialVolume = 0.5,
  initialMuted = false,
  onVolumeChange,
  onMuteToggle,
}: UseAudioStateProps = {}): AudioStateAPI {
  // ===== Volume State =====
  const [volumeState, setVolumeState] = useState<AudioVolumeState>({
    volume: Math.max(0, Math.min(1, initialVolume)), // Clamp to valid range
    isMuted: initialMuted,
    previousVolume: Math.max(0, Math.min(1, initialVolume)),
  });

  // ===== Volume Control =====

  const setVolume = useCallback(
    (newVolume: number) => {
      // Validate volume range
      const clampedVolume = Math.max(0, Math.min(1, newVolume));

      log.audio(`Setting volume to ${clampedVolume} (from ${volumeState.volume})`, {
        action: 'setVolume',
      });

      setVolumeState((prev) => {
        const updatedState = {
          ...prev,
          volume: clampedVolume,
          // Preserve previous volume only if we're not muted and volume > 0
          previousVolume: !prev.isMuted && clampedVolume > 0 ? clampedVolume : prev.previousVolume,
        };

        // Auto-unmute if volume is set to > 0
        if (clampedVolume > 0 && prev.isMuted) {
          updatedState.isMuted = false;
          onMuteToggle?.(false);
        }

        return updatedState;
      });

      onVolumeChange?.(clampedVolume);
    },
    [volumeState.volume, onVolumeChange, onMuteToggle]
  );

  // ===== Mute Control =====

  const setMuted = useCallback(
    (muted: boolean) => {
      log.audio(`Setting mute to ${muted}`, { action: 'setMuted' });

      setVolumeState((prev) => {
        // If unmuting and current volume is 0, restore previous volume
        const newVolume = !muted && prev.volume === 0 ? prev.previousVolume : prev.volume;

        const updatedState = {
          ...prev,
          isMuted: muted,
          volume: newVolume,
        };

        return updatedState;
      });

      onMuteToggle?.(muted);
    },
    [onMuteToggle]
  );

  const toggleMute = useCallback(() => {
    const newMutedState = !volumeState.isMuted;
    log.audio(`Toggling mute: ${volumeState.isMuted} → ${newMutedState}`, { action: 'toggleMute' });
    setMuted(newMutedState);
  }, [volumeState.isMuted, setMuted]);

  // ===== Utility Functions =====

  const getEffectiveVolume = useCallback((): number => {
    return volumeState.isMuted ? 0 : volumeState.volume;
  }, [volumeState.isMuted, volumeState.volume]);

  // ===== API =====
  return {
    volumeState,
    setVolume,
    toggleMute,
    setMuted,
    getEffectiveVolume,
  };
}
