/**
 * Unified animation management system - Index file
 *
 * Integrated export of all animation-related utilities and hooks
 */

// Animation manager
export { AnimationManager, animationManager, type AnimationOptions } from './animationManager';

// Custom hooks
export {
  useAnimationFrame,
  useSimpleAnimation,
  useConditionalAnimation,
  useTimerAnimation,
  usePerformanceAnimation,
  type UseAnimationOptions,
} from './useAnimationFrame';

// Convenient constants
export const ANIMATION_PRESETS = {
  /** High-performance game loop (60FPS) */
  GAME_LOOP: { fps: 60, priority: 'high' as const },

  /** UI animations (30FPS) */
  UI_ANIMATION: { fps: 30, priority: 'normal' as const },

  /** Particle effects (45FPS) */
  PARTICLE_EFFECT: { fps: 45, priority: 'normal' as const },

  /** Low-priority background (15FPS) */
  BACKGROUND: { fps: 15, priority: 'low' as const },

  /** Accessibility consideration (24FPS) */
  REDUCED_MOTION: { fps: 24, priority: 'normal' as const },
} as const;

/**
 * Animation management best practices
 */
export const ANIMATION_BEST_PRACTICES = {
  /**
   * Animation settings for game loops
   */
  gameLoop: () => ({
    ...ANIMATION_PRESETS.GAME_LOOP,
    autoStop: {
      condition: () => document.hidden, // Stop when tab is inactive
    },
  }),

  /**
   * Animation settings for UI effects
   */
  uiEffect: (maxDuration = 5000) => ({
    ...ANIMATION_PRESETS.UI_ANIMATION,
    autoStop: { maxDuration },
  }),

  /**
   * Animation settings for particles
   */
  particleEffect: (maxDuration = 10000) => ({
    ...ANIMATION_PRESETS.PARTICLE_EFFECT,
    autoStop: { maxDuration },
  }),
} as const;
