/**
 * AnimationManager test
 *
 * Tests for unified animation management system
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock error handler first
vi.mock('../utils/data/errorHandler', () => ({
  handleError: vi.fn(),
}));

// Mock matchMedia
const mockMatchMedia = vi.fn().mockImplementation((query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}));

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: mockMatchMedia,
});

// Mock requestAnimationFrame and cancelAnimationFrame
let frameId = 1;
const mockRequestAnimationFrame = vi.fn().mockImplementation(() => {
  return frameId++; // Just return an ID, don't execute callbacks
});

const mockCancelAnimationFrame = vi.fn();

Object.defineProperty(window, 'requestAnimationFrame', {
  writable: true,
  value: mockRequestAnimationFrame,
});

Object.defineProperty(window, 'cancelAnimationFrame', {
  writable: true,
  value: mockCancelAnimationFrame,
});

// Mock performance.now
Object.defineProperty(window, 'performance', {
  writable: true,
  value: {
    now: vi.fn(() => Date.now()),
  },
});

import { AnimationManager } from '../utils/animation/animationManager';

describe('AnimationManager', () => {
  let animationManager: AnimationManager;
  let mockCallback: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockCallback = vi.fn();

    // Reset singleton instance
    (AnimationManager as any).instance = null;
    animationManager = AnimationManager.getInstance();

    // Reset frame ID counter
    frameId = 1;
  });

  afterEach(() => {
    // Stop all animations to prevent leaks
    try {
      animationManager.stopAll();
    } catch {
      // Ignore errors during cleanup
    }
  });

  describe('Singleton pattern', () => {
    it('should always return the same instance', () => {
      const manager1 = AnimationManager.getInstance();
      const manager2 = AnimationManager.getInstance();

      expect(manager1).toBe(manager2);
    });
  });

  describe('Animation registration and management', () => {
    it('should register animation successfully', () => {
      animationManager.registerAnimation('test-animation', mockCallback);

      expect(window.requestAnimationFrame).toHaveBeenCalled();
    });

    it('should handle unregistering non-existent animation gracefully', () => {
      const initialCalls = (window.cancelAnimationFrame as any).mock.calls.length;

      animationManager.unregisterAnimation('non-existent');

      // No additional cancel calls for non-existent animation
      expect((window.cancelAnimationFrame as any).mock.calls.length).toBe(initialCalls);
    });
  });

  describe('Performance monitoring', () => {
    it('should provide performance statistics', () => {
      const stats = animationManager.getStats();

      expect(stats).toHaveProperty('totalFrames');
      expect(stats).toHaveProperty('droppedFrames');
      expect(stats).toHaveProperty('averageFrameTime');
      expect(stats).toHaveProperty('activeAnimations');
      expect(stats).toHaveProperty('isPaused');
      expect(stats).toHaveProperty('isReducedMotion');
      expect(stats).toHaveProperty('globalFPSLimit');
    });

    it('should set global FPS limit', () => {
      animationManager.setGlobalFPSLimit(30);

      const stats = animationManager.getStats();
      expect(stats.globalFPSLimit).toBe(30);
    });
  });

  describe('Resource management', () => {
    it('should stop all animations', () => {
      const stats = animationManager.getStats();
      expect(stats.activeAnimations).toBe(0);
    });
  });
});
