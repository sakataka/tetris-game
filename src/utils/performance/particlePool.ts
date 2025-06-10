import { Particle } from '../../types/tetris';

/**
 * Optimized Particle Pool with batch processing and memory efficiency
 * Implements object pooling pattern with minimal allocation overhead
 */
class ParticlePool {
  private pool: Particle[] = [];
  private maxPoolSize = 150; // Increased pool size for better reuse
  private allocatedCount = 0;
  private reuseCount = 0;

  // Batch particle creation for better performance
  getParticles(
    count: number,
    baseX: number,
    baseY: number,
    color: string,
    velocityRange: { vxMin: number; vxMax: number; vyMin: number; vyMax: number },
    lifeRange: { min: number; max: number }
  ): Particle[] {
    const particles: Particle[] = [];
    
    for (let i = 0; i < count; i++) {
      const particle = this.getSingleParticle(
        `particle_${Date.now()}_${i}`,
        baseX + (Math.random() - 0.5) * 20, // Small position variance
        baseY + (Math.random() - 0.5) * 10,
        color,
        velocityRange.vxMin + Math.random() * (velocityRange.vxMax - velocityRange.vxMin),
        velocityRange.vyMin + Math.random() * (velocityRange.vyMax - velocityRange.vyMin),
        lifeRange.min + Math.random() * (lifeRange.max - lifeRange.min)
      );
      particles.push(particle);
    }
    
    return particles;
  }

  // Single particle creation (optimized property assignment)
  getSingleParticle(
    id: string,
    x: number,
    y: number,
    color: string,
    vx: number,
    vy: number,
    life: number
  ): Particle {
    let particle = this.pool.pop();

    if (particle) {
      // Reuse existing particle with optimized property updates
      this.reuseCount++;
      Object.assign(particle, { id, x, y, color, vx, vy, life });
    } else {
      // Create new particle only when necessary
      this.allocatedCount++;
      particle = { id, x, y, color, vx, vy, life };
    }

    return particle;
  }

  // Legacy method for backward compatibility
  getParticle(
    id: string,
    x: number,
    y: number,
    color: string,
    vx: number,
    vy: number,
    life: number
  ): Particle {
    return this.getSingleParticle(id, x, y, color, vx, vy, life);
  }

  // Optimized batch release with capacity checking
  releaseParticles(particles: Particle[]) {
    if (particles.length === 0) return;
    
    const availableSpace = this.maxPoolSize - this.pool.length;
    const releaseCount = Math.min(particles.length, availableSpace);
    
    // Batch push for better performance
    if (releaseCount > 0) {
      this.pool.push(...particles.slice(0, releaseCount));
    }
  }

  // Single particle release (less efficient, kept for compatibility)
  releaseParticle(particle: Particle) {
    if (this.pool.length < this.maxPoolSize) {
      this.pool.push(particle);
    }
  }

  // Enhanced pool statistics for performance monitoring
  getPoolStatistics(): {
    poolSize: number;
    maxPoolSize: number;
    allocatedCount: number;
    reuseCount: number;
    reuseRatio: number;
    utilization: number;
  } {
    const totalRequests = this.allocatedCount + this.reuseCount;
    return {
      poolSize: this.pool.length,
      maxPoolSize: this.maxPoolSize,
      allocatedCount: this.allocatedCount,
      reuseCount: this.reuseCount,
      reuseRatio: totalRequests > 0 ? this.reuseCount / totalRequests : 0,
      utilization: this.pool.length / this.maxPoolSize,
    };
  }

  // Legacy method for backward compatibility
  getPoolSize(): number {
    return this.pool.length;
  }

  // Reset pool statistics (useful for testing and debugging)
  resetStatistics(): void {
    this.allocatedCount = 0;
    this.reuseCount = 0;
  }

  // Preload pool with particles to reduce initial allocation overhead
  preloadPool(count: number = 50): void {
    const particlesToCreate = Math.min(count, this.maxPoolSize - this.pool.length);
    
    for (let i = 0; i < particlesToCreate; i++) {
      this.pool.push({
        id: '',
        x: 0,
        y: 0,
        color: '#ffffff',
        vx: 0,
        vy: 0,
        life: 0,
      });
    }
  }
}

// Singleton particle pool with preloaded particles
export const particlePool = new ParticlePool();

// Preload pool for better initial performance
if (typeof window !== 'undefined') {
  particlePool.preloadPool();
}
