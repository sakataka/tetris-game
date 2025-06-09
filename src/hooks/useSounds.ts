import { useRef, useCallback, useState, useEffect } from 'react';
import type { SoundKey } from '../types/tetris';
import { audioManager } from '../utils/audioManager';
import { preloadAudioSmart, getAudioPreloadProgress } from '../utils/audioPreloader';
import { playWithFallback, getFallbackStatus } from '../utils/audioFallback';

interface AudioState {
  loaded: Set<SoundKey>;
  failed: Set<SoundKey>;
  loading: Set<SoundKey>;
}

interface UseSoundsProps {
  initialVolume?: number;
  initialMuted?: boolean;
  useWebAudio?: boolean; // Web Audio API使用フラグ
}

export function useSounds({ 
  initialVolume = 0.5, 
  initialMuted = false,
  useWebAudio = true // デフォルトでWeb Audio APIを使用
}: UseSoundsProps = {}) {
  // 🔍 DEBUG: useSounds実行をトレース
  console.log(`🔍 useSounds executed, initialVolume: ${initialVolume}, initialMuted: ${initialMuted}`);
  
  const [isMuted, setIsMuted] = useState(initialMuted);
  const [volume, setVolume] = useState(initialVolume);
  const [audioState, setAudioState] = useState<AudioState>({
    loaded: new Set(),
    failed: new Set(),
    loading: new Set()
  });
  
  // HTMLAudioElementのフォールバック用
  const audioRefs = useRef<{ [key in SoundKey]?: HTMLAudioElement }>({});
  const isWebAudioSupported = useRef<boolean>(useWebAudio);

  // HTMLAudioElementフォールバック初期化（volume依存除去）
  const initializeFallbackAudio = useCallback(() => {
    const soundFiles = {
      lineClear: '/sounds/line-clear.mp3',
      pieceLand: '/sounds/piece-land.mp3',
      pieceRotate: '/sounds/piece-rotate.mp3',
      tetris: '/sounds/tetris.mp3',
      gameOver: '/sounds/game-over.mp3',
      hardDrop: '/sounds/hard-drop.mp3'
    };
    
    Object.entries(soundFiles).forEach(([key, src]) => {
      const soundKey = key as SoundKey;
      
      if (!audioRefs.current[soundKey]) {
        setAudioState(prev => ({
          ...prev,
          loading: new Set([...prev.loading, soundKey])
        }));

        const audio = new Audio();
        audio.preload = 'auto';
        audio.volume = volume; // 現在のvolumeを使用（循環依存回避）
        
        audio.addEventListener('canplaythrough', () => {
          setAudioState(prev => ({
            loaded: new Set([...prev.loaded, soundKey]),
            failed: prev.failed,
            loading: new Set([...prev.loading].filter(k => k !== soundKey))
          }));
        });

        audio.addEventListener('error', () => {
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
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Web Audio APIかHTMLAudioElementかを自動検出して初期化
  useEffect(() => {
    const initializeAudioSystem = async () => {
      if (typeof window === 'undefined') return;
      
      if (isWebAudioSupported.current) {
        try {
          // 高度なプリロードシステムを使用
          await preloadAudioSmart();
          audioManager.setMasterVolume(volume);
          audioManager.setMuted(isMuted);
          
          // プリロード結果を状態に反映
          const webAudioState = audioManager.getAudioState();
          setAudioState({
            loaded: new Set(webAudioState.loadedSounds),
            failed: new Set(),
            loading: new Set()
          });
          
        } catch {
          // Web Audio API失敗時はHTMLAudioElementにフォールバック
          isWebAudioSupported.current = false;
          initializeFallbackAudio();
        }
      } else {
        initializeFallbackAudio();
      }
    };
    
    initializeAudioSystem();
  }, [initializeFallbackAudio]); // eslint-disable-line react-hooks/exhaustive-deps
  
  // Web Audio APIの音量・ミュート設定の同期
  useEffect(() => {
    if (isWebAudioSupported.current) {
      audioManager.setMasterVolume(volume);
    } else {
      // HTMLAudioElementの音量更新
      Object.values(audioRefs.current).forEach(audio => {
        if (audio) audio.volume = volume;
      });
    }
  }, [volume]);
  
  useEffect(() => {
    if (isWebAudioSupported.current) {
      audioManager.setMuted(isMuted);
    }
  }, [isMuted]);
  
  // ユーザーインタラクション後の音声アンロック（フォールバック用）
  const unlockAudio = useCallback(async () => {
    if (typeof window === 'undefined') return;
    
    if (!isWebAudioSupported.current) {
      // HTMLAudioElementのアンロック
      const promises = Object.values(audioRefs.current).map(async (audio) => {
        if (audio) {
          try {
            await audio.play();
            audio.pause();
            audio.currentTime = 0;
          } catch {
            // エラーは無視（通常の動作）
          }
        }
      });
      
      await Promise.allSettled(promises);
    }
    // Web Audio APIの場合はaudioManager内で自動処理
  }, []);

  // 音声ファイルを初期化（レガシー関数、互換性のため残存）
  const initializeSounds = useCallback(() => {
    if (isWebAudioSupported.current) {
      // Web Audio APIの場合は既に初期化済み
      return;
    }
    
    // HTMLAudioElementフォールバック
    initializeFallbackAudio();
  }, [initializeFallbackAudio]);

  // 音を再生（堅牢なフォールバックシステム）
  const playSound = useCallback(async (soundType: SoundKey) => {
    console.log(`🔍 playSound useCallback created/executed, soundType: ${soundType}`);
    // 現在の状態をリアルタイムで参照（依存配列を空にして関数参照を固定）
    if (isMuted) return;

    try {
      // 統合フォールバックシステムを使用
      await playWithFallback(soundType, { volume });
    } catch {
      // 最終的なフォールバック失敗時
      setAudioState(prev => ({
        ...prev,
        failed: new Set([...prev.failed, soundType])
      }));
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 音量を設定
  const setVolumeLevel = useCallback((newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolume(clampedVolume);
    
    if (isWebAudioSupported.current) {
      audioManager.setMasterVolume(clampedVolume);
    } else {
      // HTMLAudioElementの音量更新
      Object.values(audioRefs.current).forEach(audio => {
        if (audio) audio.volume = clampedVolume;
      });
    }
  }, []);

  // ミュート切り替え
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
    // 新機能
    isWebAudioEnabled: isWebAudioSupported.current,
    getDetailedAudioState: () => isWebAudioSupported.current ? audioManager.getAudioState() : null,
    getPreloadProgress: getAudioPreloadProgress,
    getFallbackStatus
  };
}