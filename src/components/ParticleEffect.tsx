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
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {lineEffect.particles.map(particle => {
        const lifeRatio = particle.life / 60;
        const scale = 0.5 + lifeRatio * 1.5;
        const blur = (1 - lifeRatio) * 2;
        
        return (
          <div
            key={particle.id}
            className="absolute rounded-full particle-enhanced"
            style={{
              left: `${particle.x}px`,
              top: `${particle.y}px`,
              width: `${2 + scale}px`,
              height: `${2 + scale}px`,
              backgroundColor: particle.color,
              opacity: lifeRatio * 0.9,
              transform: `scale(${scale}) rotate(${particle.life * 5}deg)`,
              filter: `blur(${blur}px)`,
              boxShadow: `
                0 0 ${4 + scale * 2}px ${particle.color},
                0 0 ${8 + scale * 4}px ${particle.color}40,
                0 0 ${12 + scale * 6}px ${particle.color}20
              `,
              background: `radial-gradient(circle, ${particle.color} 0%, ${particle.color}80 50%, transparent 100%)`,
              animationDuration: `${0.5 + Math.random() * 0.5}s`
            }}
          >
            {/* 内側のコア */}
            <div 
              className="absolute inset-0 rounded-full"
              style={{
                background: `radial-gradient(circle, white 0%, ${particle.color} 30%, transparent 70%)`,
                opacity: lifeRatio * 0.6,
                transform: 'scale(0.3)'
              }}
            />
          </div>
        );
      })}
      
    </div>
  );
});

export default ParticleEffect;