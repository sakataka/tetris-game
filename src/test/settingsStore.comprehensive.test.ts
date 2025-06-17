import { beforeEach, describe, expect, it, vi } from 'vitest';
import { type TabType, useSettingsStore } from '../store/settingsStore';

// Mock localStorage for Zustand persist
const mockStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};

// Mock logging
vi.mock('../utils/logging', () => ({
  log: {
    debug: vi.fn(),
    info: vi.fn(),
  },
}));

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
  value: mockStorage,
  writable: true,
});

describe('SettingsStore - Comprehensive Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Reset the store to initial state
    useSettingsStore.setState({
      settings: {
        // Audio settings
        audioEnabled: true,
        volume: 0.5,
        isMuted: false,

        // Visual settings
        theme: 'cyberpunk',
        showGhost: true,
        showParticles: true,

        // Key bindings
        keyBindings: {
          moveLeft: ['ArrowLeft', 'a', 'A'],
          moveRight: ['ArrowRight', 'd', 'D'],
          moveDown: ['ArrowDown', 's', 'S'],
          rotate: ['ArrowUp', 'w', 'W'],
          hardDrop: [' '],
          pause: ['p', 'P'],
          reset: ['r', 'R'],
        },

        // Game settings
        difficulty: 'normal',
        gameMode: 'single',
        virtualControlsEnabled: false,

        // Navigation settings
        activeTab: 'game',
      },
    });
  });

  describe('Initial State', () => {
    it('should have correct default settings', () => {
      const { settings } = useSettingsStore.getState();

      // Audio settings
      expect(settings.audioEnabled).toBe(true);
      expect(settings.volume).toBe(0.5);
      expect(settings.isMuted).toBe(false);

      // Visual settings
      expect(settings.theme).toBe('cyberpunk');
      expect(settings.showGhost).toBe(true);
      expect(settings.showParticles).toBe(true);

      // Game settings
      expect(settings.difficulty).toBe('normal');
      expect(settings.gameMode).toBe('single');
      expect(settings.virtualControlsEnabled).toBe(false);

      // Navigation
      expect(settings.activeTab).toBe('game');
    });

    it('should have correct default key bindings', () => {
      const { settings } = useSettingsStore.getState();

      expect(settings.keyBindings.moveLeft).toEqual(['ArrowLeft', 'a', 'A']);
      expect(settings.keyBindings.moveRight).toEqual(['ArrowRight', 'd', 'D']);
      expect(settings.keyBindings.moveDown).toEqual(['ArrowDown', 's', 'S']);
      expect(settings.keyBindings.rotate).toEqual(['ArrowUp', 'w', 'W']);
      expect(settings.keyBindings.hardDrop).toEqual([' ']);
      expect(settings.keyBindings.pause).toEqual(['p', 'P']);
      expect(settings.keyBindings.reset).toEqual(['r', 'R']);
    });
  });

  describe('Basic Settings Management', () => {
    it('should update settings with updateSettings', () => {
      const store = useSettingsStore.getState();

      store.updateSettings({
        volume: 0.8,
        theme: 'neon',
        difficulty: 'hard',
      });

      const newState = useSettingsStore.getState();
      expect(newState.settings.volume).toBe(0.8);
      expect(newState.settings.theme).toBe('neon');
      expect(newState.settings.difficulty).toBe('hard');
      // Other settings should remain unchanged
      expect(newState.settings.audioEnabled).toBe(true);
      expect(newState.settings.showGhost).toBe(true);
    });

    it('should reset settings to defaults', () => {
      const store = useSettingsStore.getState();

      // Modify settings first
      store.updateSettings({
        volume: 0.9,
        theme: 'neon',
        audioEnabled: false,
        showGhost: false,
        difficulty: 'hard',
      });

      // Reset settings
      store.resetSettings();

      const newState = useSettingsStore.getState();
      expect(newState.settings.volume).toBe(0.5);
      expect(newState.settings.theme).toBe('cyberpunk');
      expect(newState.settings.audioEnabled).toBe(true);
      expect(newState.settings.showGhost).toBe(true);
      expect(newState.settings.difficulty).toBe('normal');
    });

    it('should update theme', () => {
      const store = useSettingsStore.getState();

      store.updateTheme('neon');

      const newState = useSettingsStore.getState();
      expect(newState.settings.theme).toBe('neon');
      // Other settings should remain unchanged
      expect(newState.settings.volume).toBe(0.5);
      expect(newState.settings.audioEnabled).toBe(true);
    });
  });

  describe('Navigation Management', () => {
    it('should set active tab', () => {
      const store = useSettingsStore.getState();

      const tabs: TabType[] = ['stats', 'theme', 'settings', 'game'];

      tabs.forEach((tab) => {
        store.setActiveTab(tab);
        const newState = useSettingsStore.getState();
        expect(newState.settings.activeTab).toBe(tab);
      });
    });

    it('should preserve other settings when changing tab', () => {
      const store = useSettingsStore.getState();
      const initialSettings = { ...store.settings };

      store.setActiveTab('stats');

      const newState = useSettingsStore.getState();
      expect(newState.settings.activeTab).toBe('stats');

      // All other settings should remain the same
      expect(newState.settings.volume).toBe(initialSettings.volume);
      expect(newState.settings.theme).toBe(initialSettings.theme);
      expect(newState.settings.audioEnabled).toBe(initialSettings.audioEnabled);
    });
  });

  describe('Key Binding Management', () => {
    it('should update key binding', () => {
      const store = useSettingsStore.getState();

      store.updateKeyBinding('moveLeft', ['q', 'Q']);

      const newState = useSettingsStore.getState();
      expect(newState.settings.keyBindings.moveLeft).toEqual(['q', 'Q']);
      // Other key bindings should remain unchanged
      expect(newState.settings.keyBindings.moveRight).toEqual(['ArrowRight', 'd', 'D']);
    });

    it('should add key binding', () => {
      const store = useSettingsStore.getState();

      store.addKeyBinding('moveLeft', 'z');

      const newState = useSettingsStore.getState();
      expect(newState.settings.keyBindings.moveLeft).toContain('z');
      expect(newState.settings.keyBindings.moveLeft).toContain('ArrowLeft');
      expect(newState.settings.keyBindings.moveLeft).toContain('a');
    });

    it('should not add duplicate key binding', () => {
      const store = useSettingsStore.getState();
      const initialLength = store.settings.keyBindings.moveLeft.length;

      store.addKeyBinding('moveLeft', 'a'); // 'a' already exists

      const newState = useSettingsStore.getState();
      expect(newState.settings.keyBindings.moveLeft).toHaveLength(initialLength);
      expect(newState.settings.keyBindings.moveLeft.filter((k) => k === 'a')).toHaveLength(1);
    });

    it('should remove key binding', () => {
      const store = useSettingsStore.getState();

      store.removeKeyBinding('moveLeft', 'a');

      const newState = useSettingsStore.getState();
      expect(newState.settings.keyBindings.moveLeft).not.toContain('a');
      expect(newState.settings.keyBindings.moveLeft).toContain('ArrowLeft');
      expect(newState.settings.keyBindings.moveLeft).toContain('A');
    });

    it('should handle removing non-existent key', () => {
      const store = useSettingsStore.getState();
      const initialKeys = [...store.settings.keyBindings.moveLeft];

      store.removeKeyBinding('moveLeft', 'nonexistent');

      const newState = useSettingsStore.getState();
      expect(newState.settings.keyBindings.moveLeft).toEqual(initialKeys);
    });

    it('should reset key bindings to defaults', () => {
      const store = useSettingsStore.getState();

      // Modify key bindings
      store.updateKeyBinding('moveLeft', ['x']);
      store.updateKeyBinding('rotate', ['y']);

      // Reset key bindings
      store.resetKeyBindings();

      const newState = useSettingsStore.getState();
      expect(newState.settings.keyBindings.moveLeft).toEqual(['ArrowLeft', 'a', 'A']);
      expect(newState.settings.keyBindings.rotate).toEqual(['ArrowUp', 'w', 'W']);
      // Other settings should remain unchanged
      expect(newState.settings.volume).toBe(0.5);
      expect(newState.settings.theme).toBe('cyberpunk');
    });

    it('should check if key is bound', () => {
      const store = useSettingsStore.getState();

      expect(store.isKeyBound('ArrowLeft')).toBe(true);
      expect(store.isKeyBound('a')).toBe(true);
      expect(store.isKeyBound(' ')).toBe(true); // hardDrop
      expect(store.isKeyBound('p')).toBe(true); // pause
      expect(store.isKeyBound('xyz')).toBe(false);
    });

    it('should get key binding for action', () => {
      const store = useSettingsStore.getState();

      expect(store.getKeyBinding('moveLeft')).toEqual(['ArrowLeft', 'a', 'A']);
      expect(store.getKeyBinding('hardDrop')).toEqual([' ']);
      expect(store.getKeyBinding('nonexistent' as any)).toEqual([]);
    });
  });

  describe('Legacy Compatibility Methods', () => {
    it('should update volume with bounds checking', () => {
      const store = useSettingsStore.getState();

      // Normal volume
      store.updateVolume(0.7);
      expect(useSettingsStore.getState().settings.volume).toBe(0.7);

      // Volume too high (should be clamped to 1)
      store.updateVolume(1.5);
      expect(useSettingsStore.getState().settings.volume).toBe(1);

      // Volume too low (should be clamped to 0)
      store.updateVolume(-0.2);
      expect(useSettingsStore.getState().settings.volume).toBe(0);
    });

    it('should toggle mute', () => {
      const store = useSettingsStore.getState();

      expect(store.settings.isMuted).toBe(false);

      store.toggleMute();
      expect(useSettingsStore.getState().settings.isMuted).toBe(true);

      store.toggleMute();
      expect(useSettingsStore.getState().settings.isMuted).toBe(false);
    });

    it('should toggle audio enabled', () => {
      const store = useSettingsStore.getState();

      expect(store.settings.audioEnabled).toBe(true);

      store.toggleAudioEnabled();
      expect(useSettingsStore.getState().settings.audioEnabled).toBe(false);

      store.toggleAudioEnabled();
      expect(useSettingsStore.getState().settings.audioEnabled).toBe(true);
    });

    it('should toggle show ghost', () => {
      const store = useSettingsStore.getState();

      expect(store.settings.showGhost).toBe(true);

      store.toggleShowGhost();
      expect(useSettingsStore.getState().settings.showGhost).toBe(false);

      store.toggleShowGhost();
      expect(useSettingsStore.getState().settings.showGhost).toBe(true);
    });

    it('should toggle show particles', () => {
      const store = useSettingsStore.getState();

      expect(store.settings.showParticles).toBe(true);

      store.toggleShowParticles();
      expect(useSettingsStore.getState().settings.showParticles).toBe(false);

      store.toggleShowParticles();
      expect(useSettingsStore.getState().settings.showParticles).toBe(true);
    });
  });

  describe('Complex Scenarios', () => {
    it('should handle multiple rapid updates correctly', () => {
      const store = useSettingsStore.getState();

      // Rapid updates
      for (let i = 0; i < 10; i++) {
        store.updateSettings({ volume: i / 10 });
      }

      const finalState = useSettingsStore.getState();
      expect(finalState.settings.volume).toBe(0.9); // Last update should win
    });

    it('should maintain consistency across different operation types', () => {
      const store = useSettingsStore.getState();

      // Mix different types of operations
      store.updateSettings({ theme: 'neon' });
      store.setActiveTab('stats');
      store.addKeyBinding('moveLeft', 'z');
      store.toggleMute();
      store.updateVolume(0.8);

      const finalState = useSettingsStore.getState();

      // Verify all operations took effect
      expect(finalState.settings.theme).toBe('neon');
      expect(finalState.settings.activeTab).toBe('stats');
      expect(finalState.settings.keyBindings.moveLeft).toContain('z');
      expect(finalState.settings.isMuted).toBe(true);
      expect(finalState.settings.volume).toBe(0.8);

      // Verify unmodified properties remain intact
      expect(finalState.settings.difficulty).toBe('normal');
      expect(finalState.settings.showGhost).toBe(true);
    });

    it('should handle edge cases in key binding operations', () => {
      const store = useSettingsStore.getState();

      // Add multiple keys
      store.addKeyBinding('pause', 'Escape');
      store.addKeyBinding('pause', 'Space');

      // Try to add duplicate
      store.addKeyBinding('pause', 'p'); // Already exists

      // Remove some keys
      store.removeKeyBinding('pause', 'P');

      const finalState = useSettingsStore.getState();
      const pauseKeys = finalState.settings.keyBindings.pause;

      expect(pauseKeys).toContain('p');
      expect(pauseKeys).toContain('Escape');
      expect(pauseKeys).toContain('Space');
      expect(pauseKeys).not.toContain('P'); // Removed
      expect(pauseKeys.filter((k) => k === 'p')).toHaveLength(1); // No duplicates
    });
  });
});
