'use client';

import { useEffect } from 'react';
import { useAudio } from '../../hooks/useAudio';
import { useSettings, useUpdateSettings } from '../../store/settingsStore';
import type { SoundKey } from '../../types/tetris';

export interface AudioSystemAPI {
  isMuted: boolean;
  volume: number;
  audioSystemStatus: {
    isWebAudioEnabled: boolean;
    strategy: string;
    initialized: boolean;
    hasError: boolean;
    canRetry: boolean;
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
  retryAudioInitialization?: (() => Promise<void>) | undefined;
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
    audioSystemStatus,
    hasInitializationError,
    canRetryInitialization,
    retryAudioInitialization,
  } = useAudio({
    initialVolume: settings.volume,
    initialMuted: settings.isMuted,
  });

  // Initialize sounds on mount
  useEffect(() => {
    initializeSounds();
  }, [initializeSounds]);

  // Event handlers (React Compiler will optimize these)
  const handleVolumeChange = (newVolume: number) => {
    updateSettings({ volume: newVolume });
    setVolumeLevel(newVolume);
  };

  const handleToggleMute = () => {
    updateSettings({ isMuted: !settings.isMuted });
    toggleMute();
  };

  // Audio system status computation (React Compiler will optimize this)
  const fallbackStatus = getFallbackStatus();
  const detailedState = getDetailedAudioState();
  const preloadProgress = getPreloadProgress();

  const enhancedAudioSystemStatus: AudioSystemAPI['audioSystemStatus'] = {
    isWebAudioEnabled,
    strategy: audioSystemStatus.strategy,
    initialized: audioSystemStatus.initialized,
    hasError: hasInitializationError,
    canRetry: canRetryInitialization,
  };

  if (preloadProgress) {
    enhancedAudioSystemStatus.preloadProgress = preloadProgress;
  }

  if (fallbackStatus) {
    enhancedAudioSystemStatus.fallbackStatus = {
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

    enhancedAudioSystemStatus.detailedState = {
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

  // Construct API object
  const audioSystemAPI: AudioSystemAPI = {
    isMuted,
    volume,
    audioSystemStatus: enhancedAudioSystemStatus,
    playSound, // Direct reference, React Compiler will optimize
    onVolumeChange: handleVolumeChange,
    onToggleMute: handleToggleMute,
    unlockAudio,
    ...(canRetryInitialization && { retryAudioInitialization }),
  };

  return children(audioSystemAPI);
}
