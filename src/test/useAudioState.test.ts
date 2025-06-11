import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAudioState } from '../hooks/useAudioState';

// Mock audio utilities
vi.mock('../utils/audio', () => ({
  audioManager: {
    setMasterVolume: vi.fn(),
    setMuted: vi.fn(),
  },
}));

describe('useAudioState', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useAudioState());

    expect(result.current.volume).toBe(0.5);
    expect(result.current.isMuted).toBe(false);
    expect(result.current.effectiveVolume).toBe(0.5);
    expect(result.current.volumePercentage).toBe(50);
  });

  it('should initialize with custom values', () => {
    const { result } = renderHook(() =>
      useAudioState({
        initialVolume: 0.8,
        initialMuted: true,
      })
    );

    expect(result.current.volume).toBe(0.8);
    expect(result.current.isMuted).toBe(true);
    expect(result.current.effectiveVolume).toBe(0);
  });

  it('should set volume correctly', () => {
    const { result } = renderHook(() => useAudioState());

    act(() => {
      result.current.setVolume(0.7);
    });

    expect(result.current.volume).toBe(0.7);
    expect(result.current.volumePercentage).toBe(70);
  });

  it('should clamp volume to valid range', () => {
    const { result } = renderHook(() => useAudioState());

    act(() => {
      result.current.setVolume(1.5);
    });

    expect(result.current.volume).toBe(1);

    act(() => {
      result.current.setVolume(-0.5);
    });

    expect(result.current.volume).toBe(0);
  });

  it('should toggle mute state', () => {
    const { result } = renderHook(() =>
      useAudioState({
        initialVolume: 0.6,
      })
    );

    expect(result.current.isMuted).toBe(false);
    expect(result.current.effectiveVolume).toBe(0.6);

    act(() => {
      result.current.toggleMute();
    });

    expect(result.current.isMuted).toBe(true);
    expect(result.current.effectiveVolume).toBe(0);

    act(() => {
      result.current.toggleMute();
    });

    expect(result.current.isMuted).toBe(false);
    expect(result.current.effectiveVolume).toBe(0.6);
  });

  it('should set mute state directly', () => {
    const { result } = renderHook(() => useAudioState());

    act(() => {
      result.current.setMuted(true);
    });

    expect(result.current.isMuted).toBe(true);

    act(() => {
      result.current.setMuted(false);
    });

    expect(result.current.isMuted).toBe(false);
  });

  it('should manage HTML audio registration', () => {
    const { result } = renderHook(() =>
      useAudioState({
        strategy: 'htmlaudio',
      })
    );

    const mockAudio = {
      volume: 0,
    } as HTMLAudioElement;

    act(() => {
      result.current.registerHtmlAudio('testSound', mockAudio);
    });

    expect(mockAudio.volume).toBe(0.5);

    act(() => {
      result.current.unregisterHtmlAudio('testSound');
    });

    // Unregistration doesn't affect the audio element directly
  });

  it('should calculate utility properties correctly', () => {
    const { result } = renderHook(() =>
      useAudioState({
        initialVolume: 0.3,
      })
    );

    expect(result.current.isAudible).toBe(true);
    expect(result.current.canUnmute).toBe(true);

    act(() => {
      result.current.setMuted(true);
    });

    expect(result.current.isAudible).toBe(false);
    expect(result.current.canUnmute).toBe(true);

    act(() => {
      result.current.setVolume(0);
      result.current.setMuted(false);
    });

    expect(result.current.isAudible).toBe(false);
  });

  it('should sync with Web Audio API when strategy is webaudio', async () => {
    const audioManager = await import('../utils/audio').then((m) => m.audioManager);

    const { result } = renderHook(() =>
      useAudioState({
        strategy: 'webaudio',
        initialVolume: 0.4,
      })
    );

    expect(audioManager.setMasterVolume).toHaveBeenCalledWith(0.4);
    expect(audioManager.setMuted).toHaveBeenCalledWith(false);

    act(() => {
      result.current.setVolume(0.8);
    });

    expect(audioManager.setMasterVolume).toHaveBeenCalledWith(0.8);

    act(() => {
      result.current.setMuted(true);
    });

    expect(audioManager.setMuted).toHaveBeenCalledWith(true);
  });
});
