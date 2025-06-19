import { useCallback, useEffect, useRef, useState } from 'react';
import type { SoundKey } from '@/types/tetris';

// Sound file definitions
const SOUND_FILES: Record<SoundKey, string> = {
  lineClear: '/sounds/line-clear.mp3',
  pieceLand: '/sounds/piece-land.mp3',
  pieceRotate: '/sounds/piece-rotate.mp3',
  tetris: '/sounds/tetris.mp3',
  gameOver: '/sounds/game-over.mp3',
  hardDrop: '/sounds/hard-drop.mp3',
};

interface UseSimpleAudioReturn {
  volume: number;
  isMuted: boolean;
  setVolume: (volume: number) => void;
  setMuted: (muted: boolean) => void;
  toggleMute: () => void;
  playSound: (soundKey: SoundKey) => void;
  stopAllSounds: () => void;
}

/**
 * Simple audio hook using HTMLAudio elements
 * Replaces the complex Strategy Pattern system with basic functionality
 */
export function useSimpleAudio(): UseSimpleAudioReturn {
  const [volume, setVolumeState] = useState(0.5);
  const [isMuted, setMutedState] = useState(false);
  const [previousVolume, setPreviousVolume] = useState(0.5);

  // Store audio elements for each sound
  const audioElementsRef = useRef<Map<SoundKey, HTMLAudioElement>>(new Map());

  // Initialize audio elements
  useEffect(() => {
    const audioElements = audioElementsRef.current;

    // Create audio elements for each sound
    Object.entries(SOUND_FILES).forEach(([soundKey, soundPath]) => {
      if (!audioElements.has(soundKey as SoundKey)) {
        const audio = new Audio(soundPath);
        audio.preload = 'auto';
        audio.volume = volume;
        audioElements.set(soundKey as SoundKey, audio);
      }
    });

    // Cleanup function
    return () => {
      audioElements.forEach((audio) => {
        audio.pause();
        audio.src = '';
      });
      audioElements.clear();
    };
  }, [volume]);

  // Update volume for all audio elements when volume changes
  useEffect(() => {
    const effectiveVolume = isMuted ? 0 : volume;
    audioElementsRef.current.forEach((audio) => {
      audio.volume = effectiveVolume;
    });
  }, [volume, isMuted]);

  const setVolume = useCallback(
    (newVolume: number) => {
      const clampedVolume = Math.max(0, Math.min(1, newVolume));
      setVolumeState(clampedVolume);

      // Auto-unmute if volume is set to > 0
      if (clampedVolume > 0 && isMuted) {
        setMutedState(false);
      }

      // Save as previous volume if not muted
      if (!isMuted && clampedVolume > 0) {
        setPreviousVolume(clampedVolume);
      }
    },
    [isMuted]
  );

  const setMuted = useCallback(
    (muted: boolean) => {
      setMutedState(muted);

      // If unmuting and current volume is 0, restore previous volume
      if (!muted && volume === 0) {
        setVolumeState(previousVolume);
      }
    },
    [volume, previousVolume]
  );

  const toggleMute = useCallback(() => {
    const newMuted = !isMuted;
    setMutedState(newMuted);

    if (!newMuted && volume === 0) {
      setVolumeState(previousVolume);
    }
  }, [isMuted, volume, previousVolume]);

  const playSound = useCallback(
    (soundKey: SoundKey) => {
      // Skip if muted
      if (isMuted) return;

      const audio = audioElementsRef.current.get(soundKey);
      if (!audio) {
        console.warn(`Audio element not found for sound: ${soundKey}`);
        return;
      }

      try {
        // Reset to beginning and play
        audio.currentTime = 0;
        audio.play().catch((error) => {
          console.warn(`Failed to play sound ${soundKey}:`, error);
        });
      } catch (error) {
        console.warn(`Error playing sound ${soundKey}:`, error);
      }
    },
    [isMuted]
  );

  const stopAllSounds = useCallback(() => {
    audioElementsRef.current.forEach((audio) => {
      try {
        audio.pause();
        audio.currentTime = 0;
      } catch (error) {
        console.warn('Error stopping audio:', error);
      }
    });
  }, []);

  return {
    volume,
    isMuted,
    setVolume,
    setMuted,
    toggleMute,
    playSound,
    stopAllSounds,
  };
}
