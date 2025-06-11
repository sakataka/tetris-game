'use client';

import { useEffect, useRef, memo, useCallback, useState } from 'react';
import { LineEffectState } from '../types/tetris';
import { PARTICLE_GRAVITY, PARTICLE_MAX_Y } from '../constants';
import {
  particlePool,
  CanvasRenderer,
  FpsController,
  performanceMonitor,
} from '../utils/performance';

interface ParticleCanvasProps {
  lineEffect: LineEffectState;
  onParticleUpdate: (particles: LineEffectState['particles']) => void;
  width?: number;
  height?: number;
  enablePerformanceMode?: boolean;
  maxParticles?: number;
}

const ParticleCanvas = memo(function ParticleCanvas({
  lineEffect,
  onParticleUpdate,
  width = 400,
  height = 600,
  enablePerformanceMode = true,
  maxParticles = 100,
}: ParticleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<CanvasRenderer | null>(null);
  const fpsControllerRef = useRef<FpsController | null>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const [renderStats, setRenderStats] = useState({ fps: 0, particleCount: 0 });

  // Canvas and renderer initialization
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // High DPI support
    const ratio = window.devicePixelRatio || 1;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(ratio, ratio);

    // Initialize optimized renderer
    rendererRef.current = new CanvasRenderer(ctx, {
      enableShadows: !enablePerformanceMode,
      enableGradients: !enablePerformanceMode,
      maxParticlesPerFrame: maxParticles,
      clearStrategy: enablePerformanceMode ? 'selective' : 'full',
    });

    // Initialize FPS controller
    fpsControllerRef.current = new FpsController({
      targetFps: enablePerformanceMode ? 45 : 60,
      minFps: 30,
      adaptiveMode: true,
    });

    return () => {
      rendererRef.current?.dispose();
    };
  }, [width, height, enablePerformanceMode, maxParticles]);

  // Optimized particle physics update
  const updateParticlePhysics = useCallback((particles: LineEffectState['particles']) => {
    const updatedParticles: LineEffectState['particles'] = [];
    const expiredParticles: LineEffectState['particles'] = [];

    for (let i = 0; i < particles.length; i++) {
      const particle = particles[i];

      // Update particle physics
      const updatedParticle = {
        ...particle,
        x: particle.x + particle.vx,
        y: particle.y + particle.vy,
        vy: particle.vy + PARTICLE_GRAVITY,
        life: particle.life - 1,
      };

      if (updatedParticle.life > 0 && updatedParticle.y < PARTICLE_MAX_Y) {
        updatedParticles.push(updatedParticle);
      } else {
        expiredParticles.push(particle);
      }
    }

    // Return expired particles to pool
    if (expiredParticles.length > 0) {
      particlePool.releaseParticles(expiredParticles);
    }

    return updatedParticles;
  }, []);

  // Optimized animation loop with FPS control
  const animate = useCallback(() => {
    const renderer = rendererRef.current;
    const fpsController = fpsControllerRef.current;

    if (!renderer || !fpsController) return;

    const frameCallback = (frameInfo: {
      shouldRender: boolean;
      actualFps: number;
      timestamp: number;
    }) => {
      if (!frameInfo.shouldRender) {
        // Skip this frame but continue animation
        if (lineEffect.particles.length > 0) {
          animationRef.current = requestAnimationFrame(
            fpsController.createFrameLimiter(frameCallback)
          );
        }
        return;
      }

      // Start performance monitoring
      if (enablePerformanceMode) {
        performanceMonitor.startFrame();
      }

      // Update particle physics
      const updatedParticles = updateParticlePhysics(lineEffect.particles);

      // Clear and render
      renderer.clearCanvas(width, height);
      renderer.renderParticles(updatedParticles);

      // Update parent component
      onParticleUpdate(updatedParticles);

      // End performance monitoring
      if (enablePerformanceMode) {
        performanceMonitor.endFrame(updatedParticles.length);
        setRenderStats({ fps: frameInfo.actualFps, particleCount: updatedParticles.length });
      }

      // Continue animation if particles remain
      if (updatedParticles.length > 0) {
        animationRef.current = requestAnimationFrame(
          fpsController.createFrameLimiter(frameCallback)
        );
      } else {
        animationRef.current = undefined;
      }
    };

    animationRef.current = requestAnimationFrame(fpsController.createFrameLimiter(frameCallback));
  }, [
    lineEffect.particles,
    onParticleUpdate,
    updateParticlePhysics,
    width,
    height,
    enablePerformanceMode,
  ]);

  useEffect(() => {
    if (lineEffect.particles.length === 0) {
      // Stop animation when no particles
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = undefined;
      }

      // Clear canvas
      const renderer = rendererRef.current;
      if (renderer) {
        renderer.clearCanvas(width, height);
      }
      return;
    }

    // Start animation if not already running
    if (!animationRef.current) {
      animate();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = undefined;
      }
    };
  }, [lineEffect.particles.length, animate, width, height]);

  // Performance monitoring display (development only)
  const shouldShowStats = process.env.NODE_ENV === 'development' && enablePerformanceMode;

  useEffect(() => {
    if (shouldShowStats && renderStats.particleCount > 0) {
      console.log(
        `🎨 Canvas Renderer - FPS: ${renderStats.fps}, Particles: ${renderStats.particleCount}`,
        rendererRef.current?.getStats()
      );
    }
  }, [renderStats, shouldShowStats]);

  return (
    <>
      <canvas
        ref={canvasRef}
        className='absolute inset-0 pointer-events-none'
        style={{ width, height }}
      />
      {shouldShowStats && (
        <div className='absolute top-2 right-2 text-xs text-green-400 bg-black/50 p-1 rounded font-mono'>
          FPS: {renderStats.fps} | Particles: {renderStats.particleCount}
        </div>
      )}
    </>
  );
});

export default ParticleCanvas;
