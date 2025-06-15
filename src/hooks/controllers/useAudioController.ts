/**
 * Audio Controller Hook
 *
 * Converts AudioController render prop pattern to hook composition.
 * Manages audio system and sound-related settings.
 */

import { useCallback, useEffect, useRef } from 'react';
import { useAudio } from '../useAudio';
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

/**
 * Hook that provides audio system management functionality
 * Replaces AudioController render prop pattern
 */
export function useAudioController(): AudioSystemAPI {
  // Settings integration
  const settings = useSettings();
  const updateSettings = useUpdateSettings();

  // Track if audio has been initialized after user interaction
  const audioInitializedRef = useRef(false);

  // Sound system integration
  const {
    playSound: originalPlaySound,
    isMuted,
    volume,
    setVolumeLevel,
    toggleMute,
    preloadAudio,
    unlockAudio,
    isWebAudioEnabled,
    getDetailedAudioState,
    getPreloadProgress,
    audioSystemStatus,
    hasInitializationError,
    canRetryInitialization,
    retryAudioInitialization,
  } = useAudio({
    initialVolume: settings.volume,
    initialMuted: settings.isMuted,
    autoPreload: false, // Disable auto preload to prevent AudioContext creation before user interaction
  });

  // Initialize audio after first user interaction
  const initializeAudioOnUserInteraction = useCallback(async () => {
    if (!audioInitializedRef.current) {
      audioInitializedRef.current = true;
      try {
        await unlockAudio();
        await preloadAudio();
      } catch (error) {
        console.warn('Failed to initialize audio on user interaction:', error);
      }
    }
  }, [unlockAudio, preloadAudio]);

  // Enhanced playSound that initializes audio on first call
  const playSound = useCallback(
    async (soundKey: SoundKey) => {
      await initializeAudioOnUserInteraction();
      return originalPlaySound(soundKey);
    },
    [initializeAudioOnUserInteraction, originalPlaySound]
  );

  // Setup global user interaction listeners for audio initialization
  useEffect(() => {
    const handleUserInteraction = () => {
      initializeAudioOnUserInteraction();
    };

    // Add listeners for various user interaction events
    document.addEventListener('click', handleUserInteraction, { once: true });
    document.addEventListener('keydown', handleUserInteraction, { once: true });
    document.addEventListener('touchstart', handleUserInteraction, { once: true });

    return () => {
      // Cleanup listeners (though they should be removed automatically with 'once: true')
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
    };
  }, [initializeAudioOnUserInteraction]);

  // Event handlers (React Compiler will optimize these)
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

  // Audio system status computation (React Compiler will optimize this)
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

  // Return API object
  return {
    isMuted,
    volume,
    audioSystemStatus: enhancedAudioSystemStatus,
    playSound,
    onVolumeChange: handleVolumeChange,
    onToggleMute: handleToggleMute,
    unlockAudio,
    ...(canRetryInitialization && { retryAudioInitialization }),
  };
}
