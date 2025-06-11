/**
 * Performance optimization related constants
 *
 * Configuration values for particles, rendering, and memory management
 */

// Particle physics settings
export const PARTICLE_PHYSICS = {
  GRAVITY: 0.5, // increased from 0.2 to 0.5 for faster falling
  MAX_Y: 500,
  LIFE_DURATION: 20, // frames (reduced from 60 to 20 - about 0.33 seconds at 60fps)
  SCALE_BASE: 0.5,
  SCALE_MULTIPLIER: 1.5,
  OPACITY_MULTIPLIER: 0.9,
  PARTICLES_PER_CELL: 3,
} as const;

// Particle system settings
export const PARTICLE_CONFIG = {
  GRAVITY: 0.5, // sync with PARTICLE_PHYSICS.GRAVITY
  MAX_Y: 500,
  LIFE_MAX: 20, // sync with PARTICLE_PHYSICS.LIFE_DURATION
  SCALE_BASE: 1.0,
  OPACITY_MULTIPLIER: 0.8,
  COUNT_PER_LINE: 15,
  POOL_SIZE: 100,
  MAX_PARTICLES: 200,
} as const;

// Rendering optimization
export const PERFORMANCE = {
  RENDER_BATCH_SIZE: 20,
  CLEANUP_INTERVAL: 10000, // 10 seconds
} as const;

// Individual exports (backward compatibility)
export const PARTICLE_GRAVITY = PARTICLE_PHYSICS.GRAVITY;
export const PARTICLE_MAX_Y = PARTICLE_PHYSICS.MAX_Y;
export const PARTICLE_LIFE_DURATION = PARTICLE_PHYSICS.LIFE_DURATION;
export const PARTICLE_SCALE_BASE = PARTICLE_PHYSICS.SCALE_BASE;
export const PARTICLE_SCALE_MULTIPLIER = PARTICLE_PHYSICS.SCALE_MULTIPLIER;
export const PARTICLE_OPACITY_MULTIPLIER = PARTICLE_PHYSICS.OPACITY_MULTIPLIER;
export const PARTICLES_PER_CELL = PARTICLE_PHYSICS.PARTICLES_PER_CELL;
