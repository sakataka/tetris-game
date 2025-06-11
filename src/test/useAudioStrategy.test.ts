import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useAudioStrategy } from '../hooks/useAudioStrategy';

// Mock audio utilities
vi.mock('../utils/audio', () => ({
  audioManager: {
    getAudioState: vi.fn(() => ({
      loadedSounds: [],
    })),
  },
}));

// Mock global AudioContext
const mockAudioContext = vi.fn(() => ({
  close: vi.fn(),
  resume: vi.fn(),
}));

Object.defineProperty(window, 'AudioContext', {
  writable: true,
  value: mockAudioContext,
});

Object.defineProperty(window, 'webkitAudioContext', {
  writable: true,
  value: mockAudioContext,
});

describe('useAudioStrategy', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useAudioStrategy());

    expect(result.current.currentStrategy).toBe('silent');
    expect(result.current.isInitialized).toBe(false);
    expect(result.current.isWebAudioSupported).toBe(false);
    expect(result.current.initializationError).toBeNull();
  });

  it('should detect Web Audio support', async () => {
    const { result } = renderHook(() =>
      useAudioStrategy({
        enableWebAudio: true,
      })
    );

    await act(async () => {
      await result.current.initializeStrategy();
    });

    expect(result.current.isWebAudioSupported).toBe(true);
    expect(result.current.isInitialized).toBe(true);
  });

  it('should fallback to HTML Audio when Web Audio is disabled', async () => {
    const { result } = renderHook(() =>
      useAudioStrategy({
        enableWebAudio: false,
        preferredStrategy: 'webaudio',
      })
    );

    await act(async () => {
      await result.current.initializeStrategy();
    });

    expect(result.current.currentStrategy).toBe('htmlaudio');
    expect(result.current.isInitialized).toBe(true);
  });

  it('should provide strategy capabilities correctly', async () => {
    const { result } = renderHook(() => useAudioStrategy());

    await act(async () => {
      await result.current.initializeStrategy('htmlaudio');
    });

    const capabilities = result.current.getStrategyCapabilities();
    expect(capabilities.canPlayAudio).toBe(true);
    expect(capabilities.hasVolumeControl).toBe(true);
    expect(capabilities.hasAdvancedFeatures).toBe(false);
  });

  it('should handle strategy switching', async () => {
    const { result } = renderHook(() => useAudioStrategy());

    await act(async () => {
      await result.current.switchStrategy('htmlaudio');
    });

    expect(result.current.currentStrategy).toBe('htmlaudio');

    await act(async () => {
      await result.current.switchStrategy('silent');
    });

    expect(result.current.currentStrategy).toBe('silent');
  });

  it('should reset strategy state', () => {
    const { result } = renderHook(() => useAudioStrategy());

    act(() => {
      result.current.resetStrategy();
    });

    expect(result.current.currentStrategy).toBe('silent');
    expect(result.current.isInitialized).toBe(false);
    expect(result.current.isWebAudioSupported).toBe(false);
    expect(result.current.initializationError).toBeNull();
  });

  it('should handle initialization errors gracefully', async () => {
    // Mock AudioContext to not exist (simulate no Web Audio support)
    Object.defineProperty(window, 'AudioContext', {
      writable: true,
      value: undefined,
    });
    Object.defineProperty(window, 'webkitAudioContext', {
      writable: true,
      value: undefined,
    });

    const { result } = renderHook(() =>
      useAudioStrategy({
        enableWebAudio: true,
        preferredStrategy: 'webaudio',
      })
    );

    await act(async () => {
      await result.current.initializeStrategy('webaudio');
    });

    // Should fallback to htmlaudio when Web Audio is not supported
    expect(result.current.currentStrategy).toBe('htmlaudio');
    expect(result.current.isWebAudioSupported).toBe(false);
    expect(result.current.isInitialized).toBe(true);
  });

  it('should provide convenience getters', async () => {
    const { result } = renderHook(() => useAudioStrategy());

    expect(result.current.isWebAudioActive).toBe(false);
    expect(result.current.isHtmlAudioActive).toBe(false);
    expect(result.current.isSilentMode).toBe(true);

    await act(async () => {
      await result.current.initializeStrategy('htmlaudio');
    });

    expect(result.current.isHtmlAudioActive).toBe(true);
    expect(result.current.isSilentMode).toBe(false);
  });
});
