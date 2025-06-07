'use client';

import { useEffect, useRef, memo } from 'react';
import { LineEffectState } from '../types/tetris';
import { particlePool } from '../utils/particlePool';

interface ParticleEffectProps {
  lineEffect: LineEffectState;
  onParticleUpdate: (particles: LineEffectState['particles']) => void;
}

const ParticleEffect = memo(function ParticleEffect({ lineEffect, onParticleUpdate }: ParticleEffectProps) {
  const animationRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (lineEffect.particles.length === 0) return;

    const animate = () => {
      const updatedParticles: LineEffectState['particles'] = [];
      const expiredParticles: LineEffectState['particles'] = [];

      lineEffect.particles.forEach(particle => {
        const updatedParticle = {
          ...particle,
          x: particle.x + particle.vx,
          y: particle.y + particle.vy,
          vy: particle.vy + 0.2, // 重力効果
          life: particle.life - 1
        };

        if (updatedParticle.life > 0 && updatedParticle.y < 500) {
          updatedParticles.push(updatedParticle);
        } else {
          expiredParticles.push(particle);
        }
      });

      // 期限切れのパーティクルをプールに戻す
      if (expiredParticles.length > 0) {
        particlePool.releaseParticles(expiredParticles);
      }

      onParticleUpdate(updatedParticles);

      if (updatedParticles.length > 0) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [lineEffect.particles, onParticleUpdate]);

  return (
    <div className="absolute inset-0 pointer-events-none">
      {lineEffect.particles.map(particle => (
        <div
          key={particle.id}
          className="absolute w-1 h-1 rounded-full"
          style={{
            left: `${particle.x}px`,
            top: `${particle.y}px`,
            backgroundColor: particle.color,
            opacity: particle.life / 60,
            boxShadow: `0 0 4px ${particle.color}`
          }}
        />
      ))}
    </div>
  );
});

export default ParticleEffect;