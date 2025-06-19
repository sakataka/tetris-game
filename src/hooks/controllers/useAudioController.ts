/**
 * Audio Controller Hook
 *
 * Converts AudioController render prop pattern to hook composition.
 * Manages audio system and sound-related settings.
 */

import { useCallback, useEffect } from 'react';
import { useSimpleAudio } from '@/hooks/useSimpleAudio';
import { useSettings, useUpdateSettings } from '@/store/settingsStore';
import type { SoundKey } from '@/types/tetris';

export interface AudioSystemAPI {
  isMuted: boolean;
  volume: number;
  playSound: (soundType: SoundKey) => void;
  onVolumeChange: (volume: number) => void;
  onToggleMute: () => void;
}

/**
 * Hook that provides simplified audio system management functionality
 * Uses the new useSimpleAudio hook instead of complex audio system
 */
export function useAudioController(): AudioSystemAPI {
  // Settings integration
  const settings = useSettings();
  const updateSettings = useUpdateSettings();

  // Simple audio system integration
  const { volume, isMuted, setVolume, setMuted, playSound } = useSimpleAudio();

  // Sync with settings on mount
  useEffect(() => {
    setVolume(settings.volume);
    setMuted(settings.isMuted);
  }, [settings.volume, settings.isMuted, setVolume, setMuted]);

  // Event handlers
  const handleVolumeChange = useCallback(
    (newVolume: number) => {
      updateSettings({ volume: newVolume });
      setVolume(newVolume);
    },
    [updateSettings, setVolume]
  );

  const handleToggleMute = useCallback(() => {
    const newMuted = !isMuted;
    updateSettings({ isMuted: newMuted });
    setMuted(newMuted);
  }, [updateSettings, isMuted, setMuted]);

  // Return simplified API
  return {
    isMuted,
    volume,
    playSound,
    onVolumeChange: handleVolumeChange,
    onToggleMute: handleToggleMute,
  };
}
