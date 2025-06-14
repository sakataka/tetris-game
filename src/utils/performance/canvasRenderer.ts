/**
 * Optimized Canvas Renderer for Particle Effects
 * Implements efficient drawing patterns with minimal state changes and object allocation
 */

import {
  PARTICLE_LIFE_DURATION,
  PARTICLE_OPACITY_MULTIPLIER,
  PARTICLE_SCALE_BASE,
  PARTICLE_SCALE_MULTIPLIER,
} from '../../constants';
import type { Particle } from '../../types/tetris';

interface CanvasRendererConfig {
  enableShadows?: boolean;
  enableGradients?: boolean;
  maxParticlesPerFrame?: number;
  clearStrategy?: 'full' | 'selective' | 'dirty';
}

export class CanvasRenderer {
  private ctx: CanvasRenderingContext2D;
  private config: Required<CanvasRendererConfig>;
  private gradientCache = new Map<string, CanvasGradient>();
  private lastClearTime = 0;
  private dirtyRegions: Array<{ x: number; y: number; width: number; height: number }> = [];

  // Pre-allocated objects to avoid garbage collection

  constructor(ctx: CanvasRenderingContext2D, config: CanvasRendererConfig = {}) {
    this.ctx = ctx;
    this.config = {
      enableShadows: config.enableShadows ?? true,
      enableGradients: config.enableGradients ?? true,
      maxParticlesPerFrame: config.maxParticlesPerFrame ?? 200,
      clearStrategy: config.clearStrategy ?? 'full',
    };

    this.setupCanvas();
  }

  private setupCanvas(): void {
    // Optimize canvas rendering context
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';

    // Set default composite operation for better performance
    this.ctx.globalCompositeOperation = 'source-over';

    // Initialize DOMMatrix if available (browser environment)
    // (Removed tempTransform as it was unused)
  }

  // Optimized gradient creation with caching
  private getGradient(color: string, size: number): CanvasGradient {
    const key = `${color}_${Math.floor(size)}`;

    if (this.gradientCache.has(key)) {
      const cached = this.gradientCache.get(key);
      if (cached !== undefined) {
        return cached;
      }
    }

    const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, size);
    gradient.addColorStop(0, color);
    gradient.addColorStop(0.3, `${color}CC`);
    gradient.addColorStop(0.7, `${color}44`);
    gradient.addColorStop(1, 'transparent');

    // Limit cache size to prevent memory leaks
    if (this.gradientCache.size > 50) {
      const firstKey = this.gradientCache.keys().next().value;
      if (firstKey !== undefined) {
        this.gradientCache.delete(firstKey);
      }
    }

    this.gradientCache.set(key, gradient);
    return gradient;
  }

  // Efficient canvas clearing strategy
  clearCanvas(canvasWidth: number, canvasHeight: number): void {
    const now = performance.now();

    switch (this.config.clearStrategy) {
      case 'full':
        this.ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        break;

      case 'selective':
        // Only clear if enough time has passed
        if (now - this.lastClearTime > 16.67) {
          // ~60fps
          this.ctx.clearRect(0, 0, canvasWidth, canvasHeight);
          this.lastClearTime = now;
        }
        break;

      case 'dirty':
        // Clear only dirty regions (experimental)
        for (const region of this.dirtyRegions) {
          this.ctx.clearRect(region.x, region.y, region.width, region.height);
        }
        this.dirtyRegions.length = 0;
        break;
    }
  }

  // Batch particle rendering for maximum performance
  renderParticles(particles: Particle[]): void {
    if (particles.length === 0) return;

    const particlesToRender = Math.min(particles.length, this.config.maxParticlesPerFrame);

    // Sort particles by color to minimize state changes
    const sortedParticles = particles
      .slice(0, particlesToRender)
      .sort((a, b) => a.color.localeCompare(b.color));

    for (const particle of sortedParticles) {
      if (!particle) continue;

      this.renderSingleParticle(particle);
    }
  }

  // Optimized single particle rendering
  private renderSingleParticle(particle: Particle): void {
    const lifeRatio = particle.life / PARTICLE_LIFE_DURATION;
    const scale = PARTICLE_SCALE_BASE + lifeRatio * PARTICLE_SCALE_MULTIPLIER;
    const opacity = lifeRatio * PARTICLE_OPACITY_MULTIPLIER;
    const size = 2 + scale;

    // Early exit for invisible particles
    if (opacity < 0.01 || size < 0.1) return;

    this.ctx.save();

    // Transform to particle position and rotation
    this.ctx.translate(particle.x, particle.y);
    this.ctx.rotate((particle.life * 5 * Math.PI) / 180);

    // Set opacity
    this.ctx.globalAlpha = opacity;

    // Set shadow if enabled
    if (this.config.enableShadows) {
      this.ctx.shadowColor = particle.color;
      this.ctx.shadowBlur = 4 + scale * 2;
      this.ctx.shadowOffsetX = 0;
      this.ctx.shadowOffsetY = 0;
    }

    // Use gradient if enabled, otherwise solid color
    if (this.config.enableGradients) {
      const gradient = this.getGradient(particle.color, size);
      this.ctx.fillStyle = gradient;
    } else {
      this.ctx.fillStyle = particle.color;
    }

    // Draw main particle
    this.ctx.beginPath();
    this.ctx.arc(0, 0, size, 0, Math.PI * 2);
    this.ctx.fill();

    // Draw inner core for enhanced visual effect
    if (this.config.enableGradients) {
      this.ctx.shadowBlur = 0;
      this.ctx.fillStyle = '#ffffff';
      this.ctx.globalAlpha = opacity * 0.6;
      this.ctx.beginPath();
      this.ctx.arc(0, 0, size * 0.3, 0, Math.PI * 2);
      this.ctx.fill();
    }

    this.ctx.restore();

    // Track dirty region for selective clearing
    if (this.config.clearStrategy === 'dirty') {
      this.dirtyRegions.push({
        x: particle.x - size - 5,
        y: particle.y - size - 5,
        width: (size + 5) * 2,
        height: (size + 5) * 2,
      });
    }
  }

  // Performance optimization: batch shadow updates
  batchRenderWithSameColor(particles: Particle[], color: string): void {
    if (particles.length === 0) return;

    // Set shadow once for all particles of the same color
    if (this.config.enableShadows) {
      this.ctx.shadowColor = color;
    }

    for (const particle of particles) {
      this.renderSingleParticle(particle);
    }
  }

  // Cleanup resources
  dispose(): void {
    this.gradientCache.clear();
    this.dirtyRegions.length = 0;
  }

  // Performance metrics
  getStats(): {
    gradientCacheSize: number;
    dirtyRegionsCount: number;
    config: Required<CanvasRendererConfig>;
  } {
    return {
      gradientCacheSize: this.gradientCache.size,
      dirtyRegionsCount: this.dirtyRegions.length,
      config: { ...this.config },
    };
  }

  // Update configuration dynamically
  updateConfig(newConfig: Partial<CanvasRendererConfig>): void {
    Object.assign(this.config, newConfig);

    // Clear cache if gradient settings changed
    if ('enableGradients' in newConfig) {
      this.gradientCache.clear();
    }
  }
}

export default CanvasRenderer;
