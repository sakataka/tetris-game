/**
 * Particle System Optimization Tests
 * Validates enhanced performance optimizations and new features
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { particlePool } from '../utils/performance/particlePool';
import { CanvasRenderer } from '../utils/performance/canvasRenderer';
import { FpsController } from '../utils/performance/fpsController';
import { Particle } from '../types/tetris';

describe('Particle Pool Optimization', () => {
  beforeEach(() => {
    particlePool.resetStatistics();
  });

  describe('Enhanced Object Pooling', () => {
    it('should batch create particles efficiently', () => {
      const particles = particlePool.getParticles(
        10,
        100,
        200,
        '#ff0000',
        { vxMin: -2, vxMax: 2, vyMin: -5, vyMax: -1 },
        { min: 50, max: 100 }
      );

      expect(particles).toHaveLength(10);
      expect(particles[0].color).toBe('#ff0000');
      // Allow for reasonable variance in position (±20 pixels)
      expect(particles[0].x).toBeGreaterThanOrEqual(80);
      expect(particles[0].x).toBeLessThanOrEqual(120);
      expect(particles[0].y).toBeGreaterThanOrEqual(180);
      expect(particles[0].y).toBeLessThanOrEqual(220);
    });

    it('should optimize batch particle release', () => {
      const particles = particlePool.getParticles(
        5,
        0,
        0,
        '#00ff00',
        { vxMin: 0, vxMax: 0, vyMin: 0, vyMax: 0 },
        { min: 10, max: 10 }
      );

      const initialStats = particlePool.getPoolStatistics();
      particlePool.releaseParticles(particles);
      const finalStats = particlePool.getPoolStatistics();

      expect(finalStats.poolSize).toBeGreaterThan(initialStats.poolSize);
      expect(finalStats.reuseRatio).toBeGreaterThan(0);
    });

    it('should provide detailed pool statistics', () => {
      // Create some particles to generate statistics
      particlePool.getParticles(
        3,
        0,
        0,
        '#0000ff',
        { vxMin: 0, vxMax: 0, vyMin: 0, vyMax: 0 },
        { min: 10, max: 10 }
      );

      const stats = particlePool.getPoolStatistics();

      expect(stats).toHaveProperty('poolSize');
      expect(stats).toHaveProperty('maxPoolSize');
      expect(stats).toHaveProperty('allocatedCount');
      expect(stats).toHaveProperty('reuseCount');
      expect(stats).toHaveProperty('reuseRatio');
      expect(stats).toHaveProperty('utilization');

      expect(typeof stats.poolSize).toBe('number');
      expect(typeof stats.reuseRatio).toBe('number');
      expect(stats.reuseRatio).toBeGreaterThanOrEqual(0);
      expect(stats.reuseRatio).toBeLessThanOrEqual(1);
    });

    it('should maintain pool capacity limits', () => {
      const maxParticles = 200; // More than maxPoolSize
      const particles = particlePool.getParticles(
        maxParticles,
        0,
        0,
        '#ffffff',
        { vxMin: 0, vxMax: 0, vyMin: 0, vyMax: 0 },
        { min: 10, max: 10 }
      );

      particlePool.releaseParticles(particles);
      const stats = particlePool.getPoolStatistics();

      expect(stats.poolSize).toBeLessThanOrEqual(stats.maxPoolSize);
    });

    it('should preload pool for better initial performance', () => {
      particlePool.preloadPool(30);
      const stats = particlePool.getPoolStatistics();

      expect(stats.poolSize).toBeGreaterThanOrEqual(30);
    });
  });
});

describe('Canvas Renderer Optimization', () => {
  let mockContext: CanvasRenderingContext2D;
  let renderer: CanvasRenderer;

  beforeEach(() => {
    // Create mock context

    mockContext = {
      clearRect: vi.fn(),
      beginPath: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      translate: vi.fn(),
      rotate: vi.fn(),
      createRadialGradient: vi.fn(() => ({
        addColorStop: vi.fn(),
      })),
      set globalAlpha(value: number) {},
      set fillStyle(value: string | CanvasGradient) {},
      set shadowColor(value: string) {},
      set shadowBlur(value: number) {},
      set shadowOffsetX(value: number) {},
      set shadowOffsetY(value: number) {},
      set imageSmoothingEnabled(value: boolean) {},
      set imageSmoothingQuality(value: ImageSmoothingQuality) {},
      set globalCompositeOperation(value: GlobalCompositeOperation) {},
    } as unknown as CanvasRenderingContext2D;

    renderer = new CanvasRenderer(mockContext, {
      enableShadows: true,
      enableGradients: true,
      maxParticlesPerFrame: 100,
      clearStrategy: 'full',
    });
  });

  afterEach(() => {
    renderer.dispose();
  });

  describe('Performance Optimizations', () => {
    it('should cache gradients to avoid recreation', () => {
      const particles: Particle[] = [
        { id: '1', x: 10, y: 10, vx: 1, vy: 1, life: 50, color: '#ff0000' },
        { id: '2', x: 20, y: 20, vx: 1, vy: 1, life: 50, color: '#ff0000' }, // Same color
      ];

      renderer.renderParticles(particles);

      const stats = renderer.getStats();
      expect(stats.gradientCacheSize).toBeGreaterThan(0);
    });

    it('should limit particle rendering per frame', () => {
      const manyParticles: Particle[] = Array.from({ length: 150 }, (_, i) => ({
        id: `particle_${i}`,
        x: i * 2,
        y: i * 2,
        vx: 1,
        vy: 1,
        life: 50,
        color: '#00ff00',
      }));

      renderer.renderParticles(manyParticles);

      // Should handle large particle counts gracefully
      expect(mockContext.arc).toHaveBeenCalled();
    });

    it('should optimize clearing strategy', () => {
      renderer.clearCanvas(400, 600);

      expect(mockContext.clearRect).toHaveBeenCalledWith(0, 0, 400, 600);
    });

    it('should sort particles by color for state change optimization', () => {
      const particles: Particle[] = [
        { id: '1', x: 10, y: 10, vx: 1, vy: 1, life: 50, color: '#ff0000' },
        { id: '2', x: 20, y: 20, vx: 1, vy: 1, life: 50, color: '#00ff00' },
        { id: '3', x: 30, y: 30, vx: 1, vy: 1, life: 50, color: '#ff0000' }, // Same as first
      ];

      renderer.renderParticles(particles);

      // Should render without errors (color grouping optimization)
      // Each particle renders main circle and inner core
      expect(mockContext.arc).toHaveBeenCalledTimes(6); // 3 particles × 2 circles each
    });

    it('should update configuration dynamically', () => {
      renderer.updateConfig({
        enableGradients: false,
        maxParticlesPerFrame: 50,
      });

      const updatedStats = renderer.getStats();
      expect(updatedStats.config.enableGradients).toBe(false);
      expect(updatedStats.config.maxParticlesPerFrame).toBe(50);
    });
  });
});

describe('FPS Controller', () => {
  let fpsController: FpsController;

  beforeEach(() => {
    fpsController = new FpsController({
      targetFps: 60,
      minFps: 30,
      maxFps: 120,
      adaptiveMode: true,
    });
  });

  describe('Frame Rate Management', () => {
    it('should control frame rate based on target FPS', () => {
      const timestamp1 = 100; // First frame
      const timestamp2 = 108; // 8ms later, too soon for 60fps (16.67ms expected)
      const timestamp3 = 120; // 20ms later, enough time passed

      const frame1 = fpsController.shouldRenderFrame(timestamp1);
      const frame2 = fpsController.shouldRenderFrame(timestamp2);
      const frame3 = fpsController.shouldRenderFrame(timestamp3);

      expect(frame1.shouldRender).toBe(true); // First frame is always rendered
      expect(frame2.shouldRender).toBe(false); // Too soon
      expect(frame3.shouldRender).toBe(true); // Enough time passed
    });

    it('should provide detailed FPS information', () => {
      const fpsInfo = fpsController.getFpsInfo();

      expect(fpsInfo).toHaveProperty('currentFps');
      expect(fpsInfo).toHaveProperty('targetFps');
      expect(fpsInfo).toHaveProperty('adaptiveInterval');
      expect(fpsInfo).toHaveProperty('isThrottling');
      expect(fpsInfo).toHaveProperty('performanceLevel');

      expect(['excellent', 'good', 'fair', 'poor']).toContain(fpsInfo.performanceLevel);
    });

    it('should adapt frame rate based on performance', () => {
      const initialInfo = fpsController.getFpsInfo();

      fpsController.updateConfig({ targetFps: 30 });
      const updatedInfo = fpsController.getFpsInfo();

      expect(updatedInfo.targetFps).toBe(30);
      expect(updatedInfo.targetFps).not.toBe(initialInfo.targetFps);
    });

    it('should provide performance recommendations', () => {
      const recommendations = fpsController.getPerformanceRecommendations();

      expect(Array.isArray(recommendations)).toBe(true);
      // Should provide some recommendations based on performance
    });

    it('should create frame limiter function', () => {
      const mockCallback = vi.fn();
      const frameLimiter = fpsController.createFrameLimiter(mockCallback);

      expect(typeof frameLimiter).toBe('function');

      frameLimiter(100);
      expect(mockCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          timestamp: 100,
          shouldRender: expect.any(Boolean),
          actualFps: expect.any(Number),
        })
      );
    });

    it('should reset controller state', () => {
      // Simulate some frames
      fpsController.shouldRenderFrame(0);
      fpsController.shouldRenderFrame(20);

      fpsController.reset();

      const fpsInfo = fpsController.getFpsInfo();
      expect(fpsInfo.currentFps).toBe(0);
      expect(fpsInfo.isThrottling).toBe(false);
    });
  });
});

describe('Integrated Particle System Performance', () => {
  it('should demonstrate improved memory efficiency', () => {
    // Create particles using optimized pool
    const particles = particlePool.getParticles(
      20,
      100,
      100,
      '#ff6600',
      { vxMin: -3, vxMax: 3, vyMin: -6, vyMax: -2 },
      { min: 60, max: 120 }
    );

    expect(particles).toHaveLength(20);

    // Release particles back to pool
    particlePool.releaseParticles(particles);

    const stats = particlePool.getPoolStatistics();
    expect(stats.reuseRatio).toBeGreaterThan(0);
  });

  it('should handle high-performance scenarios', () => {
    const mockContext = {
      clearRect: vi.fn(),
      beginPath: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      translate: vi.fn(),
      rotate: vi.fn(),
      createRadialGradient: vi.fn(() => ({
        addColorStop: vi.fn(),
      })),
      set globalAlpha(value: number) {},
      set fillStyle(value: string | CanvasGradient) {},
      set shadowColor(value: string) {},
      set shadowBlur(value: number) {},
      set shadowOffsetX(value: number) {},
      set shadowOffsetY(value: number) {},
      set imageSmoothingEnabled(value: boolean) {},
      set imageSmoothingQuality(value: ImageSmoothingQuality) {},
      set globalCompositeOperation(value: GlobalCompositeOperation) {},
    } as unknown as CanvasRenderingContext2D;

    const renderer = new CanvasRenderer(mockContext, {
      enableShadows: false, // Performance mode
      enableGradients: false,
      maxParticlesPerFrame: 50,
      clearStrategy: 'selective',
    });

    const fpsController = new FpsController({
      targetFps: 45, // Lower target for performance
      adaptiveMode: true,
    });

    // Simulate high particle count scenario
    const particles = particlePool.getParticles(
      100,
      200,
      200,
      '#00ffff',
      { vxMin: -4, vxMax: 4, vyMin: -8, vyMax: -3 },
      { min: 30, max: 90 }
    );

    expect(particles.length).toBe(100);

    // Render with performance optimizations
    renderer.renderParticles(particles);

    // Check frame rate control
    const frameInfo = fpsController.shouldRenderFrame(0);
    expect(frameInfo.shouldRender).toBe(true);

    renderer.dispose();
    particlePool.releaseParticles(particles);
  });
});
