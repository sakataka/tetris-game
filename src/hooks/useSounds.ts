import { useRef, useCallback, useState } from 'react';

interface SoundFiles {
  lineClear: string;
  pieceLand: string;
  pieceRotate: string;
  tetris: string;
  gameOver: string;
  hardDrop: string;
}

export function useSounds() {
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});

  const soundFiles: SoundFiles = {
    lineClear: '/sounds/line-clear.mp3',
    pieceLand: '/sounds/piece-land.mp3',
    pieceRotate: '/sounds/piece-rotate.mp3',
    tetris: '/sounds/tetris.mp3',
    gameOver: '/sounds/game-over.mp3',
    hardDrop: '/sounds/hard-drop.mp3'
  };

  // 音声ファイルを初期化
  const initializeSounds = useCallback(() => {
    Object.entries(soundFiles).forEach(([key, src]) => {
      if (!audioRefs.current[key]) {
        const audio = new Audio(src);
        audio.preload = 'auto';
        audio.volume = volume;
        audioRefs.current[key] = audio;
      }
    });
  }, [volume]);

  // 音を再生
  const playSound = useCallback((soundType: keyof SoundFiles) => {
    if (isMuted) return;

    const audio = audioRefs.current[soundType];
    if (audio) {
      audio.volume = volume;
      audio.currentTime = 0; // リセットして重複再生を可能にする
      audio.play().catch(error => {
        console.warn(`Could not play sound: ${soundType}`, error);
      });
    }
  }, [isMuted, volume]);

  // 音量を設定
  const setVolumeLevel = useCallback((newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolume(clampedVolume);
    
    // 既存の音声の音量を更新
    Object.values(audioRefs.current).forEach(audio => {
      audio.volume = clampedVolume;
    });
  }, []);

  // ミュート切り替え
  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  return {
    playSound,
    isMuted,
    volume,
    setVolumeLevel,
    toggleMute,
    initializeSounds
  };
}