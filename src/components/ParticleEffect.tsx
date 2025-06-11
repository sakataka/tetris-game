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
import { particlePool, performanceMonitor, globalFpsController } from '../utils/performance';
import { useConditionalAnimation, ANIMATION_PRESETS } from '../utils/animation';
import ParticleCanvas from './ParticleCanvas';

interface ParticleEffectProps {
  lineEffect: LineEffectState;
  onParticleUpdate: (particles: LineEffectState['particles']) => void;
  forceRenderer?: 'dom' | 'canvas' | 'auto';
  enablePerformanceMonitoring?: boolean;
  maxParticles?: number;
  performanceMode?: boolean;
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

    // Accelerated fade out - exponential decay for quicker disappearance
    const fadeRatio = lifeRatio < 0.5 ? lifeRatio * lifeRatio * 4 : lifeRatio;
    const opacity = fadeRatio * PARTICLE_OPACITY_MULTIPLIER;

    return {
      left: `${particle.x}px`,
      top: `${particle.y}px`,
      width: `${2 + scale}px`,
      height: `${2 + scale}px`,
      opacity,
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
  maxParticles = 100,
  performanceMode = false,
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

  // Enhanced renderer auto-switching with global FPS controller
  const checkRendererPerformance = useCallback(
    (particleCount: number) => {
      if (forceRenderer !== 'auto') return;

      if (++performanceCheckCountRef.current >= 30) {
        performanceCheckCountRef.current = 0;

        const fpsInfo = globalFpsController.getFpsInfo();

        // Switch to canvas for better performance
        if (
          fpsInfo.performanceLevel === 'poor' &&
          currentRenderer === 'dom' &&
          particleCount > 15
        ) {
          setCurrentRenderer('canvas');
        }
        // Switch back to DOM when performance is good and particle count is low
        else if (
          fpsInfo.performanceLevel === 'excellent' &&
          currentRenderer === 'canvas' &&
          particleCount < 8
        ) {
          setCurrentRenderer('dom');
        }
        // Force canvas when too many particles
        else if (particleCount > maxParticles * 0.8 && currentRenderer === 'dom') {
          setCurrentRenderer('canvas');
        }
      }
    },
    [forceRenderer, currentRenderer, maxParticles]
  );

  // Optimized particle update with performance constraints
  const updateParticles = useCallback(() => {
    // Limit particle count for performance
    const particlesToProcess = performanceMode
      ? lineEffect.particles.slice(0, maxParticles)
      : lineEffect.particles;

    if (enablePerformanceMonitoring) {
      performanceMonitor.startFrame();
    }

    const { updated, expired } = processParticlePhysics(particlesToProcess);

    // Batch release expired particles for better performance
    if (expired.length > 0) {
      particlePool.releaseParticles(expired);
    }

    // Update particles and check if all are finished
    onParticleUpdate(updated);

    // Performance monitoring and automatic renderer switching
    if (enablePerformanceMonitoring) {
      performanceMonitor.endFrame(updated.length);
      checkRendererPerformance(updated.length);
    } else {
      // Basic performance check without detailed monitoring
      checkRendererPerformance(updated.length);
    }
  }, [
    lineEffect.particles,
    onParticleUpdate,
    enablePerformanceMonitoring,
    processParticlePhysics,
    checkRendererPerformance,
    maxParticles,
    performanceMode,
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

  // Development-only performance optimization logging with enhanced metrics
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && enablePerformanceMonitoring) {
      const fpsInfo = globalFpsController.getFpsInfo();
      const poolStats = particlePool.getPoolStatistics();

      console.log(
        `🎮 Particle System - Renderer: ${selectedRenderer.toUpperCase()}, ` +
          `Particles: ${lineEffect.particles.length}, ` +
          `FPS: ${fpsInfo.currentFps} (${fpsInfo.performanceLevel}), ` +
          `Pool Reuse: ${(poolStats.reuseRatio * 100).toFixed(1)}%`
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
          enablePerformanceMode={performanceMode}
          maxParticles={maxParticles}
        />
      ) : (
        particleElements
      )}
    </div>
  );
});

export default ParticleEffect;
