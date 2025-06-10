'use client';

import { useEffect, useRef, memo, useMemo, useCallback, useState } from 'react';
import { LineEffectState } from '../types/tetris';
import {
  PARTICLE_GRAVITY,
  PARTICLE_MAX_Y,
  PARTICLE_LIFE_DURATION,
  PARTICLE_SCALE_BASE,
  PARTICLE_SCALE_MULTIPLIER,
  PARTICLE_OPACITY_MULTIPLIER,
} from '../constants';
import { particlePool, performanceMonitor } from '../utils/performance';
import { useConditionalAnimation, ANIMATION_PRESETS } from '../utils/animation';
import ParticleCanvas from './ParticleCanvas';

interface ParticleEffectProps {
  lineEffect: LineEffectState;
  onParticleUpdate: (particles: LineEffectState['particles']) => void;
  forceRenderer?: 'dom' | 'canvas' | 'auto';
  enablePerformanceMonitoring?: boolean;
}

// Individual particle component with isolated heavy calculations for performance
const Particle = memo(function Particle({
  particle,
}: {
  particle: LineEffectState['particles'][0];
}) {
  const style = useMemo(() => {
    const lifeRatio = particle.life / PARTICLE_LIFE_DURATION;
    const scale = PARTICLE_SCALE_BASE + lifeRatio * PARTICLE_SCALE_MULTIPLIER;
    const blur = (1 - lifeRatio) * 2;
    const rotation = particle.life * 5;

    return {
      left: `${particle.x}px`,
      top: `${particle.y}px`,
      width: `${2 + scale}px`,
      height: `${2 + scale}px`,
      opacity: lifeRatio * PARTICLE_OPACITY_MULTIPLIER,
      transform: `scale(${scale}) rotate(${rotation}deg)`,
      filter: `blur(${blur}px)`,
      // CSS custom properties for performance optimization
      '--particle-color': particle.color,
      '--particle-scale': scale,
      '--life-ratio': lifeRatio,
    } as React.CSSProperties & Record<string, string | number>;
  }, [particle.x, particle.y, particle.life, particle.color]);

  return <div className='absolute rounded-full particle-optimized' style={style} />;
});

const ParticleEffect = memo(function ParticleEffect({
  lineEffect,
  onParticleUpdate,
  forceRenderer = 'auto',
  enablePerformanceMonitoring = false,
}: ParticleEffectProps) {
  const [currentRenderer, setCurrentRenderer] = useState<'dom' | 'canvas'>('dom');
  const performanceCheckCountRef = useRef(0);

  // Leverage unified animation management system
  const hasParticles = lineEffect.particles.length > 0;

  // Particle physics helper function (cognitive complexity reduction)
  const processParticlePhysics = useCallback((particles: LineEffectState['particles']) => {
    const updated: LineEffectState['particles'] = [];
    const expired: LineEffectState['particles'] = [];

    for (let i = 0; i < particles.length; i++) {
      const particle = particles[i];
      const updatedParticle = {
        ...particle,
        x: particle.x + particle.vx,
        y: particle.y + particle.vy,
        vy: particle.vy + PARTICLE_GRAVITY,
        life: particle.life - 1,
      };

      if (updatedParticle.life > 0 && updatedParticle.y < PARTICLE_MAX_Y) {
        updated.push(updatedParticle);
      } else {
        expired.push(particle);
      }
    }

    return { updated, expired };
  }, []);

  // Renderer auto-switching helper function (cognitive complexity reduction)
  const checkRendererPerformance = useCallback(
    (metrics: { fps: number }, particleCount: number) => {
      if (forceRenderer !== 'auto') return;

      if (++performanceCheckCountRef.current >= 30) {
        performanceCheckCountRef.current = 0;

        if (metrics.fps < 45 && currentRenderer === 'dom' && particleCount > 20) {
          setCurrentRenderer('canvas');
        } else if (metrics.fps > 55 && currentRenderer === 'canvas' && particleCount < 10) {
          setCurrentRenderer('dom');
        }
      }
    },
    [forceRenderer, currentRenderer]
  );

  // Main particle update logic (cognitive complexity reduced via helper functions)
  const updateParticles = useCallback(() => {
    if (enablePerformanceMonitoring) {
      performanceMonitor.startFrame();
    }

    const { updated, expired } = processParticlePhysics(lineEffect.particles);

    // Return expired particles to object pool for memory efficiency
    if (expired.length > 0) {
      particlePool.releaseParticles(expired);
    }

    onParticleUpdate(updated);

    // Performance monitoring and automatic renderer switching
    if (enablePerformanceMonitoring) {
      const metrics = performanceMonitor.endFrame(updated.length);
      checkRendererPerformance(metrics, updated.length);
    }
  }, [
    lineEffect.particles,
    onParticleUpdate,
    enablePerformanceMonitoring,
    processParticlePhysics,
    checkRendererPerformance,
  ]);

  // Use unified animation management system with conditional execution
  useConditionalAnimation(updateParticles, hasParticles, [updateParticles], {
    ...ANIMATION_PRESETS.PARTICLE_EFFECT,
    autoStop: {
      condition: () => lineEffect.particles.length === 0,
    },
  });

  // Renderer selection logic based on performance requirements
  const selectedRenderer = useMemo(() => {
    if (forceRenderer !== 'auto') return forceRenderer;
    return currentRenderer;
  }, [forceRenderer, currentRenderer]);

  // Memoize particle list for DOM renderer performance optimization
  const particleElements = useMemo(() => {
    if (selectedRenderer === 'canvas') return null;

    return lineEffect.particles.map((particle) => (
      <Particle key={particle.id} particle={particle} />
    ));
  }, [lineEffect.particles, selectedRenderer]);

  // Development-only performance optimization logging
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && enablePerformanceMonitoring) {
      console.log(
        `🎮 Particle Renderer: ${selectedRenderer.toUpperCase()}, Particles: ${lineEffect.particles.length}`
      );
    }
  }, [selectedRenderer, lineEffect.particles.length, enablePerformanceMonitoring]);

  return (
    <div className='absolute inset-0 pointer-events-none overflow-hidden'>
      {selectedRenderer === 'canvas' ? (
        <ParticleCanvas
          lineEffect={lineEffect}
          onParticleUpdate={onParticleUpdate}
          width={400}
          height={600}
        />
      ) : (
        particleElements
      )}
    </div>
  );
});

export default ParticleEffect;
