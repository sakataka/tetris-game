/**
 * Unified animation management system - Index file
 *
 * Integrated export of all animation-related utilities and hooks
 */

import { GAME_TIMING } from '@/constants/timing';

// Animation manager
export { AnimationManager, type AnimationOptions, animationManager } from './animationManager';
export { type AnimationPriority, AnimationQueue, type PerformanceMetrics } from './animationQueue';

// Custom hooks
export {
  type UseAnimationOptions,
  useAnimationFrame,
  useConditionalAnimation,
  usePerformanceAnimation,
  useSimpleAnimation,
  useTimerAnimation,
} from './useAnimationFrame';

// Convenient constants
export const ANIMATION_PRESETS = {
  /** Critical game operations (60FPS) */
  GAME_CRITICAL: { fps: 60, priority: 'critical' as const },

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
  uiEffect: (maxDuration = GAME_TIMING.UI_EFFECT_MAX_DURATION) => ({
    ...ANIMATION_PRESETS.UI_ANIMATION,
    autoStop: { maxDuration },
  }),

  /**
   * Animation settings for particles
   */
  particleEffect: (maxDuration = GAME_TIMING.PARTICLE_EFFECT_MAX_DURATION) => ({
    ...ANIMATION_PRESETS.PARTICLE_EFFECT,
    autoStop: { maxDuration },
  }),
} as const;
