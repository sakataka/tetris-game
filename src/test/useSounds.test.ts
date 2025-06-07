import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSounds } from '../hooks/useSounds';

// Mock HTMLAudioElement
const mockPlay = vi.fn().mockResolvedValue(undefined);
const mockAudio = {
  play: mockPlay,
  pause: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  volume: 0.5,
  currentTime: 0,
  preload: 'auto',
  src: ''
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useSounds', () => {
  it('should initialize with default values', () => {
    const { result } = renderHook(() => useSounds());
    
    expect(result.current.isMuted).toBe(false);
    expect(result.current.volume).toBe(0.5);
  });

  it('should initialize with custom values', () => {
    const { result } = renderHook(() => useSounds({
      initialVolume: 0.8,
      initialMuted: true
    }));
    
    expect(result.current.isMuted).toBe(true);
    expect(result.current.volume).toBe(0.8);
  });

  it('should toggle mute state', () => {
    const { result } = renderHook(() => useSounds());
    
    act(() => {
      result.current.toggleMute();
    });
    
    expect(result.current.isMuted).toBe(true);
  });

  it('should set volume level and clamp to valid range', () => {
    const { result } = renderHook(() => useSounds());
    
    act(() => {
      result.current.setVolumeLevel(0.8);
    });
    
    expect(result.current.volume).toBe(0.8);
    
    // Test clamping above max
    act(() => {
      result.current.setVolumeLevel(1.5);
    });
    
    expect(result.current.volume).toBe(1.0);
    
    // Test clamping below min
    act(() => {
      result.current.setVolumeLevel(-0.5);
    });
    
    expect(result.current.volume).toBe(0.0);
  });

  it('should initialize audio files when called', () => {
    const { result } = renderHook(() => useSounds());
    
    act(() => {
      result.current.initializeSounds();
    });
    
    // Should create Audio instances for each sound type
    expect(window.Audio).toHaveBeenCalledTimes(6);
  });

  it('should not play sound when muted', () => {
    const { result } = renderHook(() => useSounds({ initialMuted: true }));
    
    // Initialize sounds first
    act(() => {
      result.current.initializeSounds();
    });
    
    act(() => {
      result.current.playSound('lineClear');
    });
    
    expect(mockPlay).not.toHaveBeenCalled();
  });

  it('should track audio loading states', () => {
    const { result } = renderHook(() => useSounds());
    
    expect(result.current.audioState.loaded.size).toBe(0);
    expect(result.current.audioState.failed.size).toBe(0);
    expect(result.current.audioState.loading.size).toBe(0);
  });

  it('should handle audio load errors gracefully', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const mockAudioWithError = {
      ...mockAudio,
      addEventListener: vi.fn((event, callback) => {
        if (event === 'error') {
          callback(new Event('error'));
        }
      })
    };
    
    (window.Audio as any) = vi.fn(() => mockAudioWithError);
    
    const { result } = renderHook(() => useSounds());
    
    act(() => {
      result.current.initializeSounds();
    });
    
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('should set audio volume when playing sound', () => {
    const { result } = renderHook(() => useSounds({ initialVolume: 0.7 }));
    
    // Simulate successful audio loading by triggering the canplaythrough event
    const mockAudioWithCallback = {
      ...mockAudio,
      addEventListener: vi.fn((event, callback) => {
        if (event === 'canplaythrough') {
          callback();
        }
      })
    };
    
    (window.Audio as any) = vi.fn(() => mockAudioWithCallback);
    
    act(() => {
      result.current.initializeSounds();
    });
    
    act(() => {
      result.current.playSound('lineClear');
    });
    
    expect(mockAudioWithCallback.volume).toBe(0.7);
  });
});