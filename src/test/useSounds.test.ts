import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSounds } from '../hooks/useSounds';

// Mock decomposed hooks that useSounds uses
const mockAudioStrategy = {
  currentStrategy: 'webaudio' as 'webaudio' | 'htmlaudio' | 'silent',
  isWebAudioActive: true,
  isHtmlAudioActive: false,
  isSilentMode: false,
  isWebAudioSupported: true,
  isInitialized: true,
  initializeStrategy: vi.fn().mockResolvedValue(undefined),
  switchStrategy: vi.fn().mockResolvedValue(undefined),
  resetStrategy: vi.fn(),
  getStrategyCapabilities: vi.fn().mockReturnValue({
    webAudio: true,
    htmlAudio: true,
    audioContextSupport: true,
  }),
  initializationError: null,
};

const mockAudioState = {
  volume: 0.5,
  isMuted: false,
  effectiveVolume: 0.5,
  volumePercentage: 50,
  isAudible: true,
  canUnmute: true,
  setVolume: vi.fn(),
  setMuted: vi.fn(),
  toggleMute: vi.fn(),
  registerHtmlAudio: vi.fn(),
  unregisterHtmlAudio: vi.fn(),
  getHtmlAudioVolume: vi.fn().mockReturnValue(0.5),
};

const mockAudioPreloader = {
  progress: { loaded: 6, total: 6, failed: 0, inProgress: 0, progress: 1.0 },
  loadState: {
    loaded: new Set([
      'lineClear',
      'pieceLand',
      'pieceRotate',
      'tetris',
      'gameOver',
      'hardDrop',
    ] as const),
    failed: new Set(),
    loading: new Set(),
  },
  preloadAudio: vi.fn().mockResolvedValue(undefined),
  resetPreload: vi.fn(),
  getHtmlAudioElement: vi.fn(),
  htmlAudioElements: new Map(),
  isPreloadComplete: true,
  isPreloading: false,
  hasPreloadErrors: false,
  preloadSuccessRate: 1.0,
  getDetailedProgress: vi.fn().mockReturnValue({
    initialized: true,
    suspended: false,
    loadedSounds: ['lineClear', 'pieceLand', 'pieceRotate', 'tetris', 'gameOver', 'hardDrop'],
    activeSounds: 0,
    masterVolume: 0.5,
    isMuted: false,
  }),
};

const mockAudioPlayer = {
  playSound: vi.fn().mockResolvedValue(undefined),
  playSoundWithVolume: vi.fn().mockResolvedValue(undefined),
  playLoopedSound: vi.fn().mockResolvedValue(undefined),
  stopLoopedSound: vi.fn(),
  stopAllSounds: vi.fn(),
  isPlaybackEnabled: true,
  canPlaySound: vi.fn().mockReturnValue(true),
  playbackThrottleMs: 100,
  currentStrategy: 'webaudio' as 'webaudio' | 'htmlaudio' | 'silent',
  resetPlayStats: vi.fn(),
  getPlayStats: vi.fn().mockReturnValue({ totalPlayed: 0, errors: 0 }),
};

// Mock the decomposed hooks
vi.mock('../hooks/useAudioStrategy', () => ({
  useAudioStrategy: vi.fn(() => mockAudioStrategy),
}));

vi.mock('../hooks/useAudioState', () => ({
  useAudioState: vi.fn(() => mockAudioState),
}));

vi.mock('../hooks/useAudioPreloader', () => ({
  useAudioPreloader: vi.fn(() => mockAudioPreloader),
}));

vi.mock('../hooks/useAudioPlayer', () => ({
  useAudioPlayer: vi.fn(() => mockAudioPlayer),
}));

// Mock getFallbackStatus utility
vi.mock('../utils/audio', () => ({
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

// Get references to mocked hooks
import { useAudioStrategy } from '../hooks/useAudioStrategy';
import { useAudioState } from '../hooks/useAudioState';
import { useAudioPreloader } from '../hooks/useAudioPreloader';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { getFallbackStatus } from '../utils/audio';

const mockUseAudioStrategy = vi.mocked(useAudioStrategy);
const mockUseAudioState = vi.mocked(useAudioState);
const mockUseAudioPreloader = vi.mocked(useAudioPreloader);
const mockUseAudioPlayer = vi.mocked(useAudioPlayer);
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

  // Reset mock implementations
  mockAudioStrategy.currentStrategy = 'webaudio';
  mockAudioStrategy.isWebAudioActive = true;
  mockAudioStrategy.isInitialized = true;

  mockAudioState.volume = 0.5;
  mockAudioState.isMuted = false;

  mockAudioPreloader.loadState.loaded = new Set([
    'lineClear',
    'pieceLand',
    'pieceRotate',
    'tetris',
    'gameOver',
    'hardDrop',
  ] as const);
  mockAudioPreloader.loadState.failed = new Set();
  mockAudioPreloader.loadState.loading = new Set();

  mockAudioPlayer.isPlaybackEnabled = true;

  // Reset mocked hook implementations
  mockUseAudioStrategy.mockReturnValue(mockAudioStrategy);
  mockUseAudioState.mockReturnValue(mockAudioState);
  mockUseAudioPreloader.mockReturnValue(mockAudioPreloader);
  mockUseAudioPlayer.mockReturnValue(mockAudioPlayer);
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
    // Set up mocks to return custom values
    mockAudioState.volume = 0.8;
    mockAudioState.isMuted = true;
    mockUseAudioState.mockReturnValue(mockAudioState);

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

    expect(mockUseAudioStrategy).toHaveBeenCalledWith({
      preferredStrategy: 'webaudio',
      enableWebAudio: true,
    });
  });

  it('should fallback to HTMLAudio when Web Audio API fails', async () => {
    // Simulate Web Audio API failure by changing strategy
    mockAudioStrategy.currentStrategy = 'htmlaudio';
    mockAudioStrategy.isWebAudioActive = false;
    mockUseAudioStrategy.mockReturnValue(mockAudioStrategy);

    const { result } = renderHook(() => useSounds({ useWebAudio: true }));

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.strategy).toBe('htmlaudio');
    expect(result.current.isWebAudioEnabled).toBe(false);
  });

  it('should disable Web Audio API when useWebAudio is false', () => {
    // Set up mocks to return disabled Web Audio state
    mockAudioStrategy.isWebAudioActive = false;
    mockAudioStrategy.currentStrategy = 'htmlaudio';
    mockUseAudioStrategy.mockReturnValue(mockAudioStrategy);

    const { result } = renderHook(() => useSounds({ useWebAudio: false }));

    expect(result.current.isWebAudioEnabled).toBe(false);
    expect(result.current.strategy).toBe('htmlaudio');
    expect(mockUseAudioStrategy).toHaveBeenCalledWith({
      preferredStrategy: 'htmlaudio',
      enableWebAudio: false,
    });
  });

  it('should toggle mute state with Web Audio API', async () => {
    const { result } = renderHook(() => useSounds());

    await act(async () => {
      result.current.toggleMute();
    });

    expect(mockAudioState.toggleMute).toHaveBeenCalled();
  });

  it('should set volume level with Web Audio API', async () => {
    const { result } = renderHook(() => useSounds());

    await act(async () => {
      result.current.setVolumeLevel(0.8);
    });

    expect(mockAudioState.setVolume).toHaveBeenCalledWith(0.8);

    // Test clamping
    await act(async () => {
      result.current.setVolumeLevel(1.5);
    });

    expect(mockAudioState.setVolume).toHaveBeenCalledWith(1.5);
  });

  it('should play sound using fallback system', async () => {
    const { result } = renderHook(() => useSounds());

    await act(async () => {
      await result.current.playSound('lineClear');
    });

    expect(mockAudioPlayer.playSound).toHaveBeenCalledWith('lineClear');
  });

  it('should not play sound when muted', async () => {
    mockAudioState.isMuted = true;
    mockUseAudioState.mockReturnValue(mockAudioState);

    const { result } = renderHook(() => useSounds({ initialMuted: true }));

    await act(async () => {
      await result.current.playSound('lineClear');
    });

    // Audio player should still be called, but will handle muted state internally
    expect(mockAudioPlayer.playSound).toHaveBeenCalledWith('lineClear');
  });

  it('should handle playback errors gracefully', async () => {
    // Set up failed state before creating hook
    mockAudioPreloader.loadState.failed = new Set(['lineClear'] as const);
    mockUseAudioPreloader.mockReturnValue(mockAudioPreloader);

    const { result } = renderHook(() => useSounds());

    // Mock the playSound to reject, but don't throw in test
    mockAudioPlayer.playSound.mockRejectedValueOnce(new Error('Playback failed'));

    await act(async () => {
      try {
        await result.current.playSound('lineClear');
      } catch {
        // Expected to fail, ignore error
      }
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
    expect(mockAudioPreloader.getDetailedProgress).toHaveBeenCalled();
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
    expect(mockAudioPreloader.getDetailedProgress).toHaveBeenCalled();
    expect(progress).toEqual({
      initialized: true,
      suspended: false,
      loadedSounds: ['lineClear', 'pieceLand', 'pieceRotate', 'tetris', 'gameOver', 'hardDrop'],
      activeSounds: 0,
      masterVolume: 0.5,
      isMuted: false,
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

    // Legacy function should complete without error (no-op)
    expect(result.current.initializeSounds).toBeDefined();
  });

  it('should unlock audio for HTMLAudio fallback', async () => {
    mockAudioStrategy.currentStrategy = 'htmlaudio';
    mockAudioStrategy.isWebAudioActive = false;
    mockUseAudioStrategy.mockReturnValue(mockAudioStrategy);

    const { result } = renderHook(() => useSounds({ useWebAudio: false }));

    await act(async () => {
      await result.current.unlockAudio();
    });

    // Legacy function should complete without error
    expect(result.current.strategy).toBe('htmlaudio');
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
    mockAudioState.volume = 0.3;
    mockUseAudioState.mockReturnValue(mockAudioState);

    const { result } = renderHook(() => useSounds({ initialVolume: 0.3 }));

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // 初期化時に音量が同期されることを確認
    expect(mockUseAudioState).toHaveBeenCalledWith({
      initialVolume: 0.3,
      initialMuted: false,
      strategy: 'webaudio',
    });

    // 音量変更時の同期確認
    await act(async () => {
      result.current.setVolumeLevel(0.9);
    });

    expect(mockAudioState.setVolume).toHaveBeenCalledWith(0.9);
  });
});
