import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSounds } from '../hooks/useSounds';

// モジュールモック（直接定義）
vi.mock('../utils/audio/audioManager', () => ({
  audioManager: {
    isInitialized: vi.fn().mockReturnValue(true),
    initialize: vi.fn().mockResolvedValue(undefined),
    loadSound: vi.fn().mockResolvedValue(true),
    playSound: vi.fn().mockResolvedValue(undefined),
    setVolume: vi.fn(),
    setMasterVolume: vi.fn(),
    setMuted: vi.fn(),
    getMasterVolume: vi.fn().mockReturnValue(0.5),
    isMutedState: vi.fn().mockReturnValue(false),
    getAudioState: vi.fn().mockReturnValue({
      initialized: true,
      suspended: false,
      loadedSounds: ['lineClear', 'pieceLand', 'pieceRotate', 'tetris', 'gameOver', 'hardDrop'],
      activeSounds: 0,
      masterVolume: 0.5,
      isMuted: false,
    }),
    preloadAllSounds: vi.fn().mockResolvedValue(undefined),
    stopSound: vi.fn(),
    stopAllSounds: vi.fn(),
    unlockAudio: vi.fn().mockResolvedValue(true),
    dispose: vi.fn(),
  },
}));

vi.mock('../utils/audio/audioPreloader', () => ({
  preloadAudioSmart: vi.fn().mockResolvedValue({
    total: 6,
    loaded: 6,
    failed: 0,
    inProgress: 0,
    progress: 1.0,
  }),
  getAudioPreloadProgress: vi.fn().mockReturnValue({
    total: 6,
    loaded: 6,
    failed: 0,
    inProgress: 0,
    progress: 1.0,
  }),
}));

vi.mock('../utils/audio/audioFallback', () => ({
  playWithFallback: vi.fn().mockResolvedValue(undefined),
  getFallbackStatus: vi.fn().mockReturnValue({
    currentLevel: 0,
    availableLevels: ['web-audio-api', 'html-audio-element'],
    capabilities: {
      webAudio: true,
      htmlAudio: true,
      audioContextSupport: true,
      mp3Support: true,
      codecs: ['audio/mpeg'],
      autoplayPolicy: 'allowed',
    },
    silentMode: false,
  }),
}));

// モック関数への参照を取得
import { audioManager } from '../utils/audio/audioManager';
import { preloadAudioSmart, getAudioPreloadProgress } from '../utils/audio/audioPreloader';
import { playWithFallback, getFallbackStatus } from '../utils/audio/audioFallback';

// vi.mocked()を使用してモック関数への型安全なアクセスを提供
const mockAudioManager = vi.mocked(audioManager);
const mockPreloadAudioSmart = vi.mocked(preloadAudioSmart);
const mockGetAudioPreloadProgress = vi.mocked(getAudioPreloadProgress);
const mockPlayWithFallback = vi.mocked(playWithFallback);
const mockGetFallbackStatus = vi.mocked(getFallbackStatus);

// Fetch API モック（音声ファイル取得用）
global.fetch = vi.fn().mockResolvedValue({
  ok: true,
  arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(1024)),
});

// HTML Audio Element モック
const mockAudio = {
  play: vi.fn().mockResolvedValue(undefined),
  pause: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  volume: 0.5,
  currentTime: 0,
  preload: 'auto',
  src: '',
};

// グローバルモック設定
Object.defineProperty(window, 'Audio', {
  writable: true,
  value: vi.fn(() => mockAudio),
});

beforeEach(() => {
  vi.clearAllMocks();
  mockAudio.volume = 0.5;

  // モック関数のリセット
  mockPreloadAudioSmart.mockResolvedValue({
    total: 6,
    loaded: 6,
    failed: 0,
    inProgress: 0,
    progress: 1.0,
  });
  mockPlayWithFallback.mockResolvedValue(undefined);
});

describe('useSounds - Web Audio API対応', () => {
  it('should initialize with default values', async () => {
    const { result } = renderHook(() => useSounds());

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.isMuted).toBe(false);
    expect(result.current.volume).toBe(0.5);
    expect(result.current.isWebAudioEnabled).toBe(true);
  });

  it('should initialize with custom values', async () => {
    const { result } = renderHook(() =>
      useSounds({
        initialVolume: 0.8,
        initialMuted: true,
        useWebAudio: true,
      })
    );

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.isMuted).toBe(true);
    expect(result.current.volume).toBe(0.8);
    expect(result.current.isWebAudioEnabled).toBe(true);
  });

  it('should initialize audio system with Web Audio API', async () => {
    renderHook(() => useSounds());

    // Wait for async initialization
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(mockPreloadAudioSmart).toHaveBeenCalled();
    expect(mockAudioManager.setMasterVolume).toHaveBeenCalledWith(0.5);
    expect(mockAudioManager.setMuted).toHaveBeenCalledWith(false);
  });

  it('should fallback to HTMLAudio when Web Audio API fails', async () => {
    // Web Audio API失敗をシミュレート
    mockPreloadAudioSmart.mockRejectedValueOnce(new Error('Web Audio API not supported'));

    renderHook(() => useSounds({ useWebAudio: true }));

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    // HTMLAudioElementが使用されることを確認
    expect(window.Audio).toHaveBeenCalled();
  });

  it('should disable Web Audio API when useWebAudio is false', () => {
    const { result } = renderHook(() => useSounds({ useWebAudio: false }));

    expect(result.current.isWebAudioEnabled).toBe(false);
    expect(window.Audio).toHaveBeenCalled();
  });

  it('should toggle mute state with Web Audio API', async () => {
    const { result } = renderHook(() => useSounds());

    await act(async () => {
      result.current.toggleMute();
    });

    expect(result.current.isMuted).toBe(true);
    expect(mockAudioManager.setMuted).toHaveBeenCalledWith(true);
  });

  it('should set volume level with Web Audio API', async () => {
    const { result } = renderHook(() => useSounds());

    await act(async () => {
      result.current.setVolumeLevel(0.8);
    });

    expect(result.current.volume).toBe(0.8);
    expect(mockAudioManager.setMasterVolume).toHaveBeenCalledWith(0.8);

    // Test clamping
    await act(async () => {
      result.current.setVolumeLevel(1.5);
    });

    expect(result.current.volume).toBe(1.0);
    expect(mockAudioManager.setMasterVolume).toHaveBeenCalledWith(1.0);
  });

  it('should play sound using fallback system', async () => {
    const { result } = renderHook(() => useSounds());

    await act(async () => {
      await result.current.playSound('lineClear');
    });

    expect(mockPlayWithFallback).toHaveBeenCalledWith('lineClear', { volume: 0.5 });
  });

  it('should not play sound when muted', async () => {
    const { result } = renderHook(() => useSounds({ initialMuted: true }));

    await act(async () => {
      await result.current.playSound('lineClear');
    });

    expect(mockPlayWithFallback).not.toHaveBeenCalled();
  });

  it('should handle playback errors gracefully', async () => {
    mockPlayWithFallback.mockRejectedValueOnce(new Error('Playback failed'));

    const { result } = renderHook(() => useSounds());

    await act(async () => {
      await result.current.playSound('lineClear');
    });

    // エラーが処理され、失敗状態が記録されることを確認
    expect(result.current.audioState.failed.has('lineClear')).toBe(true);
  });

  it('should provide detailed audio state', async () => {
    const { result } = renderHook(() => useSounds());

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    const detailedState = result.current.getDetailedAudioState();
    expect(mockAudioManager.getAudioState).toHaveBeenCalled();
    expect(detailedState).toEqual({
      initialized: true,
      suspended: false,
      loadedSounds: ['lineClear', 'pieceLand', 'pieceRotate', 'tetris', 'gameOver', 'hardDrop'],
      activeSounds: 0,
      masterVolume: 0.5,
      isMuted: false,
    });
  });

  it('should provide preload progress', async () => {
    const { result } = renderHook(() => useSounds());

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    const progress = result.current.getPreloadProgress();
    expect(mockGetAudioPreloadProgress).toHaveBeenCalled();
    expect(progress).toEqual({
      total: 6,
      loaded: 6,
      failed: 0,
      inProgress: 0,
      progress: 1.0,
    });
  });

  it('should provide fallback status', async () => {
    const { result } = renderHook(() => useSounds());

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    const fallbackStatus = result.current.getFallbackStatus();
    expect(mockGetFallbackStatus).toHaveBeenCalled();
    expect(fallbackStatus).toEqual({
      currentLevel: 0,
      availableLevels: ['web-audio-api', 'html-audio-element'],
      capabilities: expect.objectContaining({
        webAudio: true,
        htmlAudio: true,
      }),
      silentMode: false,
    });
  });

  it('should initialize sounds with legacy method', async () => {
    const { result } = renderHook(() => useSounds());

    await act(async () => {
      result.current.initializeSounds();
    });

    // Web Audio APIの場合は何もしない（既に初期化済み）
    expect(mockAudioManager.preloadAllSounds).not.toHaveBeenCalled();
  });

  it('should unlock audio for HTMLAudio fallback', async () => {
    const { result } = renderHook(() => useSounds({ useWebAudio: false }));

    await act(async () => {
      await result.current.unlockAudio();
    });

    // HTMLAudioElementのアンロック処理が実行されることを確認
    expect(mockAudio.play).toHaveBeenCalled();
  });

  it('should track audio loading states correctly', async () => {
    const { result } = renderHook(() => useSounds());

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // Web Audio APIで正常にロードされた状態
    expect(result.current.audioState.loaded.size).toBe(6);
    expect(result.current.audioState.failed.size).toBe(0);
    expect(result.current.audioState.loading.size).toBe(0);
  });

  it('should handle volume synchronization between systems', async () => {
    const { result } = renderHook(() => useSounds({ initialVolume: 0.3 }));

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // 初期化時に音量が同期されることを確認
    expect(mockAudioManager.setMasterVolume).toHaveBeenCalledWith(0.3);

    // 音量変更時の同期確認
    await act(async () => {
      result.current.setVolumeLevel(0.9);
    });

    expect(mockAudioManager.setMasterVolume).toHaveBeenCalledWith(0.9);
  });
});
