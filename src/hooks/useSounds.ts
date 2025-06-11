import { useRef, useCallback, useState, useEffect } from 'react';
import type { SoundKey } from '../types/tetris';
import {
  audioManager,
  preloadAudioSmart,
  getAudioPreloadProgress,
  playWithFallback,
  getFallbackStatus,
} from '../utils/audio';

interface AudioState {
  loaded: Set<SoundKey>;
  failed: Set<SoundKey>;
  loading: Set<SoundKey>;
}

interface UseSoundsProps {
  initialVolume?: number;
  initialMuted?: boolean;
  useWebAudio?: boolean; // Flag to enable Web Audio API
}

export function useSounds({
  initialVolume = 0.5,
  initialMuted = false,
  useWebAudio = true, // Use Web Audio API by default
}: UseSoundsProps = {}) {
  const [isMuted, setIsMuted] = useState(initialMuted);
  const [volume, setVolume] = useState(initialVolume);
  const [audioState, setAudioState] = useState<AudioState>({
    loaded: new Set(),
    failed: new Set(),
    loading: new Set(),
  });

  // Fallback HTMLAudioElement references
  const audioRefs = useRef<{ [key in SoundKey]?: HTMLAudioElement }>({});
  const isWebAudioSupported = useRef<boolean>(useWebAudio);

  // HTMLAudioElement fallback initialization (volume dependency removed)
  const initializeFallbackAudio = useCallback(() => {
    const soundFiles = {
      lineClear: '/sounds/line-clear.mp3',
      pieceLand: '/sounds/piece-land.mp3',
      pieceRotate: '/sounds/piece-rotate.mp3',
      tetris: '/sounds/tetris.mp3',
      gameOver: '/sounds/game-over.mp3',
      hardDrop: '/sounds/hard-drop.mp3',
    };

    Object.entries(soundFiles).forEach(([key, src]) => {
      const soundKey = key as SoundKey;

      if (!audioRefs.current[soundKey]) {
        setAudioState((prev) => ({
          ...prev,
          loading: new Set([...prev.loading, soundKey]),
        }));

        const audio = new Audio();
        audio.preload = 'auto';
        audio.volume = volume; // Use current volume (avoid circular dependency)

        audio.addEventListener('canplaythrough', () => {
          setAudioState((prev) => ({
            loaded: new Set([...prev.loaded, soundKey]),
            failed: prev.failed,
            loading: new Set([...prev.loading].filter((k) => k !== soundKey)),
          }));
        });

        audio.addEventListener('error', () => {
          setAudioState((prev) => ({
            loaded: prev.loaded,
            failed: new Set([...prev.failed, soundKey]),
            loading: new Set([...prev.loading].filter((k) => k !== soundKey)),
          }));
        });

        audio.src = src;
        audioRefs.current[soundKey] = audio;
      }
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-detect and initialize Web Audio API or HTMLAudioElement
  useEffect(() => {
    const initializeAudioSystem = async () => {
      if (typeof window === 'undefined') return;

      if (isWebAudioSupported.current) {
        try {
          // Use advanced preload system
          await preloadAudioSmart();
          audioManager.setMasterVolume(volume);
          audioManager.setMuted(isMuted);

          // Reflect preload results in state
          const webAudioState = audioManager.getAudioState();
          setAudioState({
            loaded: new Set(webAudioState.loadedSounds),
            failed: new Set(),
            loading: new Set(),
          });
        } catch {
          // Fallback to HTMLAudioElement when Web Audio API fails
          isWebAudioSupported.current = false;
          initializeFallbackAudio();
        }
      } else {
        initializeFallbackAudio();
      }
    };

    initializeAudioSystem();
  }, [initializeFallbackAudio]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync Web Audio API volume and mute settings
  useEffect(() => {
    if (isWebAudioSupported.current) {
      audioManager.setMasterVolume(volume);
    } else {
      // Update HTMLAudioElement volume
      Object.values(audioRefs.current).forEach((audio) => {
        if (audio) audio.volume = volume;
      });
    }
  }, [volume]);

  useEffect(() => {
    if (isWebAudioSupported.current) {
      audioManager.setMuted(isMuted);
    }
  }, [isMuted]);

  // Audio unlock after user interaction (for fallback)
  const unlockAudio = useCallback(async () => {
    if (typeof window === 'undefined') return;

    if (!isWebAudioSupported.current) {
      // Unlock HTMLAudioElement
      const promises = Object.values(audioRefs.current).map(async (audio) => {
        if (audio) {
          try {
            await audio.play();
            audio.pause();
            audio.currentTime = 0;
          } catch {
            // Ignore errors (normal behavior)
          }
        }
      });

      await Promise.allSettled(promises);
    }
    // For Web Audio API, automatic processing within audioManager
  }, []);

  // Initialize audio files (legacy function, kept for compatibility)
  const initializeSounds = useCallback(() => {
    if (isWebAudioSupported.current) {
      // Already initialized for Web Audio API
      return;
    }

    // HTMLAudioElement fallback
    initializeFallbackAudio();
  }, [initializeFallbackAudio]);

  // Play sound (robust fallback system)
  const playSound = useCallback(async (soundType: SoundKey) => {
    // Reference current state in real-time (fix function reference with empty dependency array)
    if (isMuted) return;

    try {
      // Use integrated fallback system
      await playWithFallback(soundType, { volume });
    } catch {
      // When final fallback fails
      setAudioState((prev) => ({
        ...prev,
        failed: new Set([...prev.failed, soundType]),
      }));
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Set volume
  const setVolumeLevel = useCallback((newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolume(clampedVolume);

    if (isWebAudioSupported.current) {
      audioManager.setMasterVolume(clampedVolume);
    } else {
      // Update HTMLAudioElement volume
      Object.values(audioRefs.current).forEach((audio) => {
        if (audio) audio.volume = clampedVolume;
      });
    }
  }, []);

  // Toggle mute
  const toggleMute = useCallback(() => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);

    if (isWebAudioSupported.current) {
      audioManager.setMuted(newMutedState);
    }
  }, [isMuted]);

  return {
    playSound,
    isMuted,
    volume,
    setVolumeLevel,
    toggleMute,
    initializeSounds,
    unlockAudio,
    audioState,
    // New features
    isWebAudioEnabled: isWebAudioSupported.current,
    getDetailedAudioState: () =>
      isWebAudioSupported.current ? audioManager.getAudioState() : null,
    getPreloadProgress: getAudioPreloadProgress,
    getFallbackStatus,
  };
}
