import { useRef, useCallback, useState } from 'react';
import type { SoundKey } from '../types/tetris';
import { AudioError, handleError } from '../utils/errorHandler';

interface SoundFiles {
  lineClear: string;
  pieceLand: string;
  pieceRotate: string;
  tetris: string;
  gameOver: string;
  hardDrop: string;
}

interface AudioState {
  loaded: Set<SoundKey>;
  failed: Set<SoundKey>;
  loading: Set<SoundKey>;
}

interface UseSoundsProps {
  initialVolume?: number;
  initialMuted?: boolean;
}

export function useSounds({ initialVolume = 0.5, initialMuted = false }: UseSoundsProps = {}) {
  const [isMuted, setIsMuted] = useState(initialMuted);
  const [volume, setVolume] = useState(initialVolume);
  const [audioState, setAudioState] = useState<AudioState>({
    loaded: new Set(),
    failed: new Set(),
    loading: new Set()
  });
  const audioRefs = useRef<{ [key in SoundKey]?: HTMLAudioElement }>({});


  // ユーザーインタラクション後の音声アンロック
  const unlockAudio = useCallback(async () => {
    if (typeof window === 'undefined') return;
    
    const promises = Object.values(audioRefs.current).map(async (audio) => {
      if (audio) {
        try {
          await audio.play();
          audio.pause();
          audio.currentTime = 0;
        } catch {
          // ユーザーインタラクション不要の場合は警告のみ
          const audioError = new AudioError(
            'Audio unlock failed',
            { action: 'audio_unlock', component: 'useSounds' },
            { recoverable: true, retryable: false }
          );
          handleError(audioError);
        }
      }
    });
    
    await Promise.allSettled(promises);
  }, []);

  // 音声ファイルを初期化
  const initializeSounds = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    const soundFiles: SoundFiles = {
      lineClear: '/sounds/line-clear.mp3',
      pieceLand: '/sounds/piece-land.mp3',
      pieceRotate: '/sounds/piece-rotate.mp3',
      tetris: '/sounds/tetris.mp3',
      gameOver: '/sounds/game-over.mp3',
      hardDrop: '/sounds/hard-drop.mp3'
    };
    
    Object.entries(soundFiles).forEach(([key, src]) => {
      const soundKey = key as SoundKey;
      
      if (!audioRefs.current[soundKey] && !audioState.failed.has(soundKey)) {
        setAudioState(prev => ({
          ...prev,
          loading: new Set([...prev.loading, soundKey])
        }));

        const audio = new Audio();
        audio.preload = 'auto';
        audio.volume = volume;
        
        audio.addEventListener('canplaythrough', () => {
          setAudioState(prev => ({
            loaded: new Set([...prev.loaded, soundKey]),
            failed: prev.failed,
            loading: new Set([...prev.loading].filter(k => k !== soundKey))
          }));
        });

        audio.addEventListener('error', (e) => {
          const audioError = new AudioError(
            `Failed to load sound: ${soundKey}`,
            { action: 'audio_load', component: 'useSounds', additionalData: { soundKey, event: e } },
            { recoverable: true, retryable: true }
          );
          handleError(audioError);
          
          setAudioState(prev => ({
            loaded: prev.loaded,
            failed: new Set([...prev.failed, soundKey]),
            loading: new Set([...prev.loading].filter(k => k !== soundKey))
          }));
        });

        audio.src = src;
        audioRefs.current[soundKey] = audio;
      }
    });
  }, [volume, audioState.failed]);

  // 音を再生
  const playSound = useCallback((soundType: SoundKey) => {
    if (isMuted || audioState.failed.has(soundType)) return;

    const audio = audioRefs.current[soundType];
    if (audio && audioState.loaded.has(soundType)) {
      audio.volume = volume;
      audio.currentTime = 0; // リセットして重複再生を可能にする
      
      // モバイル端末での音声再生対応
      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          // ユーザーインタラクションが必要な場合は警告のみ
          if (error.name === 'NotAllowedError') {
            const audioError = new AudioError(
              `Audio play requires user interaction: ${soundType}`,
              { action: 'audio_play', component: 'useSounds', additionalData: { soundType } },
              { recoverable: true, retryable: true, userMessage: '音声を有効にするには画面をタップしてください' }
            );
            handleError(audioError);
          } else {
            const audioError = new AudioError(
              `Could not play sound: ${soundType}`,
              { action: 'audio_play', component: 'useSounds', additionalData: { soundType, error } },
              { recoverable: true, retryable: false }
            );
            handleError(audioError);
            
            // その他のエラーの場合は失敗として記録
            setAudioState(prev => ({
              ...prev,
              failed: new Set([...prev.failed, soundType])
            }));
          }
        });
      }
    }
  }, [isMuted, volume, audioState.loaded, audioState.failed]);

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
    initializeSounds,
    unlockAudio,
    audioState
  };
}