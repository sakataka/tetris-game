import { Particle } from '../../types/tetris';

class ParticlePool {
  private pool: Particle[] = [];
  private maxPoolSize = 100; // プールの最大サイズ

  // パーティクルを取得（再利用または新規作成）
  getParticle(
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
      // 既存のパーティクルを再利用
      particle.id = id;
      particle.x = x;
      particle.y = y;
      particle.color = color;
      particle.vx = vx;
      particle.vy = vy;
      particle.life = life;
    } else {
      // 新しいパーティクルを作成
      particle = { id, x, y, color, vx, vy, life };
    }

    return particle;
  }

  // パーティクルをプールに戻す
  releaseParticle(particle: Particle) {
    if (this.pool.length < this.maxPoolSize) {
      this.pool.push(particle);
    }
  }

  // 複数のパーティクルをプールに戻す
  releaseParticles(particles: Particle[]) {
    particles.forEach((particle) => this.releaseParticle(particle));
  }

  // プールのサイズを取得（デバッグ用）
  getPoolSize(): number {
    return this.pool.length;
  }
}

// シングルトンのパーティクルプール
export const particlePool = new ParticlePool();
