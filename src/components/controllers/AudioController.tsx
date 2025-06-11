'use client';

import { useCallback, useEffect, useMemo } from 'react';
import type { SoundKey } from '../../types/tetris';
import { useSounds } from '../../hooks/useSounds';
import { useSettings, useUpdateSettings } from '../../store/settingsStore';

export interface AudioSystemAPI {
  isMuted: boolean;
  volume: number;
  audioSystemStatus: {
    isWebAudioEnabled: boolean;
    preloadProgress?: {
      total: number;
      loaded: number;
      failed: number;
      progress: number;
    };
    fallbackStatus?: {
      currentLevel: number;
      availableLevels: string[];
      silentMode: boolean;
    };
    detailedState?: {
      initialized: boolean;
      suspended: boolean;
      loadedSounds: string[];
      activeSounds: number;
    };
  };
  playSound: (soundType: SoundKey) => void;
  onVolumeChange: (volume: number) => void;
  onToggleMute: () => void;
  unlockAudio: () => Promise<void>;
}

interface AudioControllerProps {
  children: (api: AudioSystemAPI) => React.ReactNode;
}

/**
 * AudioController manages the audio system and sound-related settings.
 * Responsibilities:
 * - Sound system initialization and management
 * - Volume and mute state control
 * - Audio status monitoring
 * - Settings persistence
 */
export function AudioController({ children }: AudioControllerProps) {
  // Settings integration
  const settings = useSettings();
  const updateSettings = useUpdateSettings();

  // Sound system integration
  const {
    playSound,
    isMuted,
    volume,
    setVolumeLevel,
    toggleMute,
    initializeSounds,
    unlockAudio,
    isWebAudioEnabled,
    getDetailedAudioState,
    getPreloadProgress,
    getFallbackStatus,
  } = useSounds({
    initialVolume: settings.volume,
    initialMuted: settings.isMuted,
  });

  // Stabilized playSound function for external use
  const stablePlaySound = useCallback((soundType: SoundKey) => {
    playSound(soundType);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Initialize sounds on mount
  useEffect(() => {
    initializeSounds();
  }, [initializeSounds]);

  // Event handlers
  const handleVolumeChange = useCallback(
    (newVolume: number) => {
      updateSettings({ volume: newVolume });
      setVolumeLevel(newVolume);
    },
    [updateSettings, setVolumeLevel]
  );

  const handleToggleMute = useCallback(() => {
    updateSettings({ isMuted: !settings.isMuted });
    toggleMute();
  }, [updateSettings, settings.isMuted, toggleMute]);

  // Audio system status computation
  const audioSystemStatus = useMemo(() => {
    const fallbackStatus = getFallbackStatus();
    const detailedState = getDetailedAudioState();

    const preloadProgress = getPreloadProgress();
    const result: AudioSystemAPI['audioSystemStatus'] = {
      isWebAudioEnabled,
    };

    if (preloadProgress) {
      result.preloadProgress = preloadProgress;
    }

    if (fallbackStatus) {
      result.fallbackStatus = {
        currentLevel: fallbackStatus.currentLevel,
        availableLevels: fallbackStatus.availableLevels,
        silentMode: fallbackStatus.silentMode,
      };
    }

    if (detailedState) {
      // Type-safe property access for backward compatibility
      const hasProgressData =
        detailedState && typeof detailedState === 'object' && detailedState !== null;
      const progressData = hasProgressData
        ? (detailedState as unknown as Record<string, unknown>)
        : {};

      result.detailedState = {
        initialized: Boolean(hasProgressData && 'totalSounds' in progressData),
        suspended: Boolean(
          hasProgressData && 'isLoading' in progressData && progressData['isLoading']
        ),
        loadedSounds: Array.isArray(progressData['loadedSounds'])
          ? (progressData['loadedSounds'] as string[])
          : [],
        activeSounds:
          typeof progressData['totalSounds'] === 'number' ? progressData['totalSounds'] : 0,
      };
    }

    return result;
  }, [isWebAudioEnabled, getPreloadProgress, getFallbackStatus, getDetailedAudioState]);

  // Construct API object
  const audioSystemAPI: AudioSystemAPI = {
    isMuted,
    volume,
    audioSystemStatus,
    playSound: stablePlaySound,
    onVolumeChange: handleVolumeChange,
    onToggleMute: handleToggleMute,
    unlockAudio,
  };

  return children(audioSystemAPI);
}
