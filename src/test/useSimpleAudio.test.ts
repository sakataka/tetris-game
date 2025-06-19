import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useSimpleAudio } from '../hooks/useSimpleAudio';

// Mock HTMLAudioElement
class MockAudio {
  volume = 0.5;
  currentTime = 0;
  preload = 'auto';
  src = '';

  play = vi.fn().mockResolvedValue(undefined);
  pause = vi.fn();
  addEventListener = vi.fn();
  removeEventListener = vi.fn();
}

// Mock the Audio constructor
Object.defineProperty(global, 'Audio', {
  writable: true,
  value: vi.fn().mockImplementation(() => new MockAudio()),
});

describe('useSimpleAudio', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useSimpleAudio());

    expect(result.current.volume).toBe(0.5);
    expect(result.current.isMuted).toBe(false);
    expect(typeof result.current.setVolume).toBe('function');
    expect(typeof result.current.setMuted).toBe('function');
    expect(typeof result.current.toggleMute).toBe('function');
    expect(typeof result.current.playSound).toBe('function');
    expect(typeof result.current.stopAllSounds).toBe('function');
  });

  it('should create audio elements for all sound keys', () => {
    renderHook(() => useSimpleAudio());

    // Should create 6 audio elements (one for each sound)
    expect(global.Audio).toHaveBeenCalledTimes(6);
    expect(global.Audio).toHaveBeenCalledWith('/sounds/line-clear.mp3');
    expect(global.Audio).toHaveBeenCalledWith('/sounds/piece-land.mp3');
    expect(global.Audio).toHaveBeenCalledWith('/sounds/piece-rotate.mp3');
    expect(global.Audio).toHaveBeenCalledWith('/sounds/tetris.mp3');
    expect(global.Audio).toHaveBeenCalledWith('/sounds/game-over.mp3');
    expect(global.Audio).toHaveBeenCalledWith('/sounds/hard-drop.mp3');
  });

  it('should update volume correctly', () => {
    const { result } = renderHook(() => useSimpleAudio());

    act(() => {
      result.current.setVolume(0.8);
    });

    expect(result.current.volume).toBe(0.8);
  });

  it('should clamp volume to valid range', () => {
    const { result } = renderHook(() => useSimpleAudio());

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
    const { result } = renderHook(() => useSimpleAudio());

    expect(result.current.isMuted).toBe(false);

    act(() => {
      result.current.toggleMute();
    });

    expect(result.current.isMuted).toBe(true);

    act(() => {
      result.current.toggleMute();
    });

    expect(result.current.isMuted).toBe(false);
  });

  it('should set mute state directly', () => {
    const { result } = renderHook(() => useSimpleAudio());

    act(() => {
      result.current.setMuted(true);
    });

    expect(result.current.isMuted).toBe(true);

    act(() => {
      result.current.setMuted(false);
    });

    expect(result.current.isMuted).toBe(false);
  });

  it('should not play sound when muted', () => {
    const { result } = renderHook(() => useSimpleAudio());

    act(() => {
      result.current.setMuted(true);
    });

    act(() => {
      result.current.playSound('lineClear');
    });

    // Should not call play on any audio element
    const mockAudioInstances = (global.Audio as any).mock.results;
    mockAudioInstances.forEach((instance: any) => {
      expect(instance.value.play).not.toHaveBeenCalled();
    });
  });

  it('should play sound when not muted', () => {
    const { result } = renderHook(() => useSimpleAudio());

    act(() => {
      result.current.playSound('lineClear');
    });

    // At least one audio element should have play called
    const mockAudioInstances = (global.Audio as any).mock.results;
    const playCallCount = mockAudioInstances.reduce((count: number, instance: any) => {
      return count + instance.value.play.mock.calls.length;
    }, 0);

    expect(playCallCount).toBeGreaterThan(0);
  });

  it('should stop all sounds', () => {
    const { result } = renderHook(() => useSimpleAudio());

    act(() => {
      result.current.stopAllSounds();
    });

    // All audio elements should have pause called
    const mockAudioInstances = (global.Audio as any).mock.results;
    mockAudioInstances.forEach((instance: any) => {
      expect(instance.value.pause).toHaveBeenCalled();
      expect(instance.value.currentTime).toBe(0);
    });
  });

  it('should handle invalid sound keys gracefully', () => {
    const { result } = renderHook(() => useSimpleAudio());
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    act(() => {
      result.current.playSound('invalidSound' as any);
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Audio element not found for sound: invalidSound')
    );

    consoleSpy.mockRestore();
  });
});
