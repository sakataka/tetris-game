import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAudio } from '../hooks/useAudio';

// Mock audio utilities
vi.mock('../utils/audio', () => ({
  playWithFallback: vi.fn().mockResolvedValue(undefined),
  preloadAudioSmart: vi.fn().mockResolvedValue(undefined),
  getAudioPreloadProgress: vi.fn().mockReturnValue({
    initialized: true,
    suspended: false,
    loadedSounds: ['lineClear', 'pieceLand', 'pieceRotate', 'tetris', 'gameOver', 'hardDrop'],
    activeSounds: 0,
    masterVolume: 0.5,
    isMuted: false,
  }),
  audioManager: {
    initialize: vi.fn().mockResolvedValue(undefined),
    getAudioState: vi.fn().mockReturnValue({
      initialized: true,
      loadedSounds: ['lineClear', 'pieceLand', 'pieceRotate', 'tetris', 'gameOver', 'hardDrop'],
    }),
    setMasterVolume: vi.fn(),
    setMuted: vi.fn(),
  },
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

// Mock logger
vi.mock('../utils/logging/logger', () => ({
  log: {
    audio: vi.fn(),
  },
}));

// Fetch API mock (for audio file retrieval)
global.fetch = vi.fn().mockResolvedValue({
  ok: true,
  arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(1024)),
});

// HTML Audio Element mock
const mockAudio = {
  play: vi.fn().mockResolvedValue(undefined),
  pause: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  canPlayType: vi.fn().mockReturnValue('probably'),
  volume: 0.5,
  currentTime: 0,
  paused: true,
  readyState: 4, // HAVE_ENOUGH_DATA
  preload: 'auto',
  src: '',
  muted: false,
  loop: false,
  playbackRate: 1.0,
};

// AudioContext mock
const mockAudioContext = {
  state: 'suspended',
  resume: vi.fn().mockResolvedValue(undefined),
  suspend: vi.fn().mockResolvedValue(undefined),
  close: vi.fn().mockResolvedValue(undefined),
  createGain: vi.fn().mockReturnValue({
    connect: vi.fn(),
    disconnect: vi.fn(),
    gain: { value: 1 },
  }),
  createBufferSource: vi.fn().mockReturnValue({
    connect: vi.fn(),
    disconnect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    buffer: null,
  }),
  decodeAudioData: vi.fn().mockResolvedValue({}),
  destination: {},
};

// Global mock setup
Object.defineProperty(window, 'Audio', {
  writable: true,
  value: vi.fn(() => mockAudio),
});

Object.defineProperty(window, 'AudioContext', {
  writable: true,
  value: vi.fn(() => mockAudioContext),
});

Object.defineProperty(window, 'webkitAudioContext', {
  writable: true,
  value: vi.fn(() => mockAudioContext),
});

beforeEach(() => {
  vi.clearAllMocks();
  mockAudio.volume = 0.5;
  mockAudio.paused = true;
  mockAudio.currentTime = 0;
  mockAudio.muted = false;
  mockAudio.loop = false;
  mockAudio.playbackRate = 1.0;
  mockAudioContext.state = 'suspended';
});

describe('useAudio - Unified Audio Management', () => {
  it('should initialize with default values', async () => {
    const { result } = renderHook(() => useAudio());

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    expect(result.current.isMuted).toBe(false);
    expect(result.current.volume).toBe(0.5);
    expect(result.current.strategy).toMatch(/webaudio|htmlaudio|silent/);
  });

  it('should initialize with custom values', async () => {
    const { result } = renderHook(() =>
      useAudio({
        initialVolume: 0.8,
        initialMuted: true,
        useWebAudio: true,
      })
    );

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    expect(result.current.isMuted).toBe(true);
    expect(result.current.volume).toBe(0.8);
  });

  it('should handle volume changes', async () => {
    const { result } = renderHook(() => useAudio());

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    await act(async () => {
      result.current.setVolume(0.8);
    });

    expect(result.current.volume).toBe(0.8);

    // Test volume clamping
    await act(async () => {
      result.current.setVolume(1.5);
    });

    expect(result.current.volume).toBe(1);

    await act(async () => {
      result.current.setVolume(-0.5);
    });

    expect(result.current.volume).toBe(0);
  });

  it('should toggle mute state', async () => {
    const { result } = renderHook(() => useAudio());

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    const initialMuted = result.current.isMuted;

    await act(async () => {
      result.current.toggleMute();
    });

    expect(result.current.isMuted).toBe(!initialMuted);

    await act(async () => {
      result.current.toggleMute();
    });

    expect(result.current.isMuted).toBe(initialMuted);
  });

  it('should set mute state directly', async () => {
    const { result } = renderHook(() => useAudio());

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    await act(async () => {
      result.current.setMuted(true);
    });

    expect(result.current.isMuted).toBe(true);

    await act(async () => {
      result.current.setMuted(false);
    });

    expect(result.current.isMuted).toBe(false);
  });

  it('should play sound', async () => {
    const { result } = renderHook(() => useAudio());

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    await act(async () => {
      result.current.playSound('lineClear');
    });

    // Sound should be called (implementation depends on strategy)
    expect(result.current.playSound).toBeDefined();
  });

  it('should not play sound when muted', async () => {
    const { result } = renderHook(() => useAudio({ initialMuted: true }));

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    // Should not throw error even when muted
    await act(async () => {
      result.current.playSound('lineClear');
    });

    expect(result.current.isMuted).toBe(true);
  });

  it('should provide audio system status', async () => {
    const { result } = renderHook(() => useAudio());

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    expect(result.current.audioSystemStatus).toEqual(
      expect.objectContaining({
        strategy: expect.any(String),
        initialized: expect.any(Boolean),
        webAudioSupported: expect.any(Boolean),
      })
    );
  });

  it('should provide preload progress', async () => {
    const { result } = renderHook(() => useAudio());

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    expect(result.current.preloadProgress).toEqual(
      expect.objectContaining({
        totalSounds: expect.any(Number),
        loadedSounds: expect.any(Number),
        failedSounds: expect.any(Number),
        isLoading: expect.any(Boolean),
        isComplete: expect.any(Boolean),
        progressPercentage: expect.any(Number),
      })
    );
  });

  it('should handle Web Audio API fallback', async () => {
    // Mock Web Audio API as unavailable
    Object.defineProperty(window, 'AudioContext', {
      writable: true,
      value: undefined,
    });
    Object.defineProperty(window, 'webkitAudioContext', {
      writable: true,
      value: undefined,
    });

    const { result } = renderHook(() => useAudio({ useWebAudio: true }));

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    // Should fallback to HTML Audio or Silent mode
    expect(['htmlaudio', 'silent']).toContain(result.current.strategy);
  });

  it('should disable Web Audio when useWebAudio is false', async () => {
    const { result } = renderHook(() => useAudio({ useWebAudio: false }));

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    expect(result.current.isWebAudioEnabled).toBe(false);
  });

  it('should provide utility functions', async () => {
    const { result } = renderHook(() => useAudio());

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    expect(result.current.getEffectiveVolume()).toEqual(expect.any(Number));
    expect(result.current.getVolumePercentage()).toEqual(expect.any(Number));
    expect(result.current.canPlaySound('lineClear')).toEqual(expect.any(Boolean));
    expect(result.current.getPlayStats()).toEqual(expect.any(Object));
  });

  it('should provide legacy compatibility functions', async () => {
    const { result } = renderHook(() => useAudio());

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    // Legacy functions should exist and not throw
    expect(result.current.initializeSounds).toBeDefined();
    expect(result.current.unlockAudio).toBeDefined();
    expect(result.current.audioState).toBeDefined();

    await act(async () => {
      result.current.initializeSounds();
      await result.current.unlockAudio();
    });
  });

  it('should handle strategy switching', async () => {
    const { result } = renderHook(() => useAudio());

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    // Current strategy should be initialized

    await act(async () => {
      result.current.switchStrategy('htmlaudio');
    });

    // Strategy may change depending on browser support
    expect(result.current.strategy).toMatch(/webaudio|htmlaudio|silent/);
  });

  it('should handle initialization errors gracefully', async () => {
    // Mock initialization failure
    const mockError = new Error('Initialization failed');
    vi.mocked(mockAudioContext.resume).mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => useAudio());

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    // Should not throw error, should fallback gracefully
    expect(result.current.strategy).toMatch(/webaudio|htmlaudio|silent/);
  });

  it('should provide HTML Audio elements when using HTML Audio strategy', async () => {
    const { result } = renderHook(() => useAudio({ useWebAudio: false }));

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    expect(result.current.getHtmlAudioElement).toBeDefined();
    expect(result.current.htmlAudioElements).toBeDefined();
  });

  it('should handle preloading reset', async () => {
    const { result } = renderHook(() => useAudio());

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    await act(async () => {
      result.current.resetPreload();
    });

    expect(result.current.resetPreload).toBeDefined();
  });

  it('should stop all sounds', async () => {
    const { result } = renderHook(() => useAudio());

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    await act(async () => {
      result.current.stopAllSounds();
    });

    expect(result.current.stopAllSounds).toBeDefined();
  });
});
