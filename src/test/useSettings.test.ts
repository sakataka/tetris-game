import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSettings } from '../hooks/useSettings';
import { createMockDOMEnvironment, clearTestStorage } from './fixtures';

// DOM環境モックをセットアップ
const domMocks = createMockDOMEnvironment();

describe('useSettings', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    clearTestStorage();
    domMocks.localStorageMock.clear();
    
    // Reset localStorage mock to return null (no data)
    vi.clearAllMocks();
    vi.spyOn(window.localStorage, 'getItem').mockReturnValue(null);
    vi.spyOn(window.localStorage, 'setItem').mockImplementation(() => {});
    vi.spyOn(window.localStorage, 'removeItem').mockImplementation(() => {});
  });

  it('should initialize with default settings', () => {
    const { result } = renderHook(() => useSettings());
    
    expect(result.current.settings.audioEnabled).toBe(true);
    expect(result.current.settings.volume).toBe(0.5);
    expect(result.current.settings.theme).toBe('cyberpunk');
    expect(result.current.settings.showGhost).toBe(true);
    expect(result.current.settings.showParticles).toBe(true);
  });

  it('should update volume correctly', () => {
    const { result } = renderHook(() => useSettings());
    
    act(() => {
      result.current.setVolume(0.8);
    });
    
    expect(result.current.settings.volume).toBe(0.8);
  });

  it('should clamp volume to valid range', () => {
    const { result } = renderHook(() => useSettings());
    
    act(() => {
      result.current.setVolume(1.5); // Above max
    });
    
    expect(result.current.settings.volume).toBe(1.0);
    
    act(() => {
      result.current.setVolume(-0.5); // Below min
    });
    
    expect(result.current.settings.volume).toBe(0.0);
  });

  it('should toggle audio enabled state', () => {
    const { result } = renderHook(() => useSettings());
    
    const initialState = result.current.settings.audioEnabled;
    
    act(() => {
      result.current.toggleAudio();
    });
    
    expect(result.current.settings.audioEnabled).toBe(!initialState);
  });

  it('should save settings to localStorage', () => {
    const setItemSpy = vi.spyOn(window.localStorage, 'setItem');
    const { result } = renderHook(() => useSettings());
    
    act(() => {
      result.current.setVolume(0.7);
    });
    
    expect(setItemSpy).toHaveBeenCalledWith(
      'tetris-game-settings',
      expect.stringContaining('"volume":0.7')
    );
  });

  it('should load settings from localStorage', () => {
    const mockSettings = {
      audioEnabled: false,
      volume: 0.3,
      theme: 'neon',
      showGhost: false,
      showParticles: false,
      keyBindings: {
        moveLeft: ['ArrowLeft'],
        moveRight: ['ArrowRight'],
        moveDown: ['ArrowDown'],
        rotate: ['ArrowUp'],
        hardDrop: [' '],
        pause: ['p'],
        reset: ['r']
      }
    };
    
    vi.spyOn(window.localStorage, 'getItem').mockReturnValue(JSON.stringify(mockSettings));
    
    const { result } = renderHook(() => useSettings());
    
    expect(result.current.settings.audioEnabled).toBe(false);
    expect(result.current.settings.volume).toBe(0.3);
    expect(result.current.settings.theme).toBe('neon');
  });

  it('should handle corrupted localStorage data gracefully', () => {
    vi.spyOn(window.localStorage, 'getItem').mockReturnValue('invalid json');
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    
    const { result } = renderHook(() => useSettings());
    
    // Should fall back to default settings
    expect(result.current.settings.audioEnabled).toBe(true);
    expect(result.current.settings.volume).toBe(0.5);
    expect(consoleSpy).toHaveBeenCalled();
    
    consoleSpy.mockRestore();
  });

  it('should reset settings to defaults', () => {
    const { result } = renderHook(() => useSettings());
    
    // Change some settings
    act(() => {
      result.current.setVolume(0.9);
      result.current.toggleAudio();
    });
    
    // Reset to defaults
    act(() => {
      result.current.resetSettings();
    });
    
    expect(result.current.settings.audioEnabled).toBe(true);
    expect(result.current.settings.volume).toBe(0.5);
  });

  it('should update key bindings', () => {
    const { result } = renderHook(() => useSettings());
    
    act(() => {
      result.current.updateKeyBinding('moveLeft', ['a', 'A']);
    });
    
    expect(result.current.settings.keyBindings.moveLeft).toEqual(['a', 'A']);
  });
});