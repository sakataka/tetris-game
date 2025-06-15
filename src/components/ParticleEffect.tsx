import { memo, useEffect, useRef, useState } from 'react';
import { useFeatureFlags, usePerformanceConfig } from '../config';
import {
  PARTICLE_GRAVITY,
  PARTICLE_LIFE_DURATION,
  PARTICLE_MAX_Y,
  PARTICLE_OPACITY_MULTIPLIER,
  PARTICLE_SCALE_BASE,
  PARTICLE_SCALE_MULTIPLIER,
} from '../constants';
import type { LineEffectState } from '../types/tetris';
import { ANIMATION_PRESETS, useConditionalAnimation } from '../utils/animation';
import { log } from '../utils/logging';
import { globalFpsController, particlePool, performanceMonitor } from '../utils/performance';
import ParticleCanvas from './ParticleCanvas';

interface ParticleEffectProps {
  lineEffect: LineEffectState;
  onParticleUpdate: (particles: LineEffectState['particles']) => void;
  forceRenderer?: 'dom' | 'canvas' | 'auto';
  enablePerformanceMonitoring?: boolean;
  maxParticles?: number;
  performanceMode?: boolean;
}

// Individual particle component (React Compiler will optimize calculations)
const Particle = memo(function Particle({
  particle,
}: {
  particle: LineEffectState['particles'][0];
}) {
  // Calculate particle style (React Compiler will optimize this)
  const lifeRatio = particle.life / PARTICLE_LIFE_DURATION;
  const scale = PARTICLE_SCALE_BASE + lifeRatio * PARTICLE_SCALE_MULTIPLIER;
  const blur = (1 - lifeRatio) * 2;
  const rotation = particle.life * 5;

  // Accelerated fade out - exponential decay for quicker disappearance
  const fadeRatio = lifeRatio < 0.5 ? lifeRatio * lifeRatio * 4 : lifeRatio;
  const opacity = fadeRatio * PARTICLE_OPACITY_MULTIPLIER;

  const style = {
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

  return <div className='absolute rounded-full particle-optimized' style={style} />;
});

const ParticleEffect = memo(function ParticleEffect({
  lineEffect,
  onParticleUpdate,
  forceRenderer = 'auto',
  enablePerformanceMonitoring = false,
  maxParticles: propMaxParticles,
  performanceMode: propPerformanceMode = false,
}: ParticleEffectProps) {
  // Use configuration system for dynamic settings
  const featureFlags = useFeatureFlags();
  const performanceConfig = usePerformanceConfig();

  // Override props with configuration values
  const maxParticles = propMaxParticles ?? performanceConfig.maxParticles;
  const performanceMode = propPerformanceMode || !performanceConfig.enableOptimizations;
  const particlesEnabled = featureFlags.particlesEnabled;

  const [currentRenderer, setCurrentRenderer] = useState<'dom' | 'canvas'>('dom');
  const performanceCheckCountRef = useRef(0);

  // Leverage unified animation management system
  const hasParticles = lineEffect.particles.length > 0;

  // Particle physics helper function (React Compiler will optimize)
  const processParticlePhysics = (particles: LineEffectState['particles']) => {
    const updated: LineEffectState['particles'] = [];
    const expired: LineEffectState['particles'] = [];

    for (const particle of particles) {
      if (!particle) continue;

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
  };

  // Enhanced renderer auto-switching with global FPS controller (React Compiler will optimize)
  const checkRendererPerformance = (particleCount: number) => {
    if (forceRenderer !== 'auto') return;

    if (++performanceCheckCountRef.current >= 30) {
      performanceCheckCountRef.current = 0;

      const fpsInfo = globalFpsController.getFpsInfo();

      // Switch to canvas for better performance
      if (fpsInfo.performanceLevel === 'poor' && currentRenderer === 'dom' && particleCount > 15) {
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
  };

  // Optimized particle update with performance constraints (React Compiler will optimize)
  const updateParticles = () => {
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
  };

  // Use unified animation management system with conditional execution
  useConditionalAnimation(updateParticles, hasParticles, [updateParticles], {
    ...ANIMATION_PRESETS.PARTICLE_EFFECT,
    autoStop: {
      condition: () => lineEffect.particles.length === 0,
    },
  });

  // Renderer selection logic based on performance requirements (React Compiler will optimize)
  const selectedRenderer = forceRenderer !== 'auto' ? forceRenderer : currentRenderer;

  // Particle list for DOM renderer (React Compiler will optimize)
  const particleElements =
    selectedRenderer === 'canvas'
      ? null
      : lineEffect.particles.map((particle) => <Particle key={particle.id} particle={particle} />);

  // Development-only performance optimization logging with enhanced metrics
  useEffect(() => {
    if (process.env['NODE_ENV'] === 'development' && enablePerformanceMonitoring) {
      const fpsInfo = globalFpsController.getFpsInfo();
      const poolStats = particlePool.getPoolStatistics();

      log.performance(
        `Particle System - Renderer: ${selectedRenderer.toUpperCase()}`,
        fpsInfo.currentFps,
        {
          component: 'ParticleEffect',
          metadata: {
            renderer: selectedRenderer,
            particleCount: lineEffect.particles.length,
            performanceLevel: fpsInfo.performanceLevel,
            poolReuseRatio: poolStats.reuseRatio,
          },
        }
      );
    }
  }, [selectedRenderer, lineEffect.particles.length, enablePerformanceMonitoring]);

  // Early return after all hooks are called
  if (!particlesEnabled) {
    log.config('Particles disabled by feature flag', {
      action: 'ParticleEffect',
      metadata: { particlesEnabled },
    });
    return null;
  }

  return (
    <div className='absolute inset-0 pointer-events-none overflow-hidden'>
      {selectedRenderer === 'canvas' ? (
        <ParticleCanvas
          lineEffect={lineEffect}
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
