'use client';

import { memo, useEffect, useRef, useState } from 'react';
import type { LineEffectState } from '../types/tetris';
import { log } from '../utils/logging';
import { CanvasRenderer, performanceMonitor } from '../utils/performance';

interface ParticleCanvasProps {
  lineEffect: LineEffectState;
  width?: number;
  height?: number;
  enablePerformanceMode?: boolean;
  maxParticles?: number;
}

const ParticleCanvas = memo(function ParticleCanvas({
  lineEffect,
  width = 400,
  height = 600,
  enablePerformanceMode = true,
  maxParticles = 100,
}: ParticleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<CanvasRenderer | null>(null);
  const [renderStats, setRenderStats] = useState({ particleCount: 0 });

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

    return () => {
      rendererRef.current?.dispose();
    };
  }, [width, height, enablePerformanceMode, maxParticles]);

  // Render particles when they change (no physics update - just rendering)
  useEffect(() => {
    const renderer = rendererRef.current;
    if (!renderer) return;

    // Start performance monitoring
    if (enablePerformanceMode) {
      performanceMonitor.startFrame();
    }

    // Clear and render current particles
    renderer.clearCanvas(width, height);
    renderer.renderParticles(lineEffect.particles);

    // End performance monitoring and update stats
    if (enablePerformanceMode) {
      performanceMonitor.endFrame(lineEffect.particles.length);
    }

    setRenderStats({ particleCount: lineEffect.particles.length });
  }, [lineEffect.particles, width, height, enablePerformanceMode]);

  // Performance monitoring display (development only)
  const shouldShowStats = process.env.NODE_ENV === 'development' && enablePerformanceMode;

  useEffect(() => {
    if (shouldShowStats && renderStats.particleCount > 0) {
      log.performance(
        `Canvas Renderer - Particles: ${renderStats.particleCount}`,
        renderStats.particleCount,
        {
          component: 'ParticleCanvas',
          metadata: {
            particleCount: renderStats.particleCount,
            stats: rendererRef.current?.getStats(),
          },
        }
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
          Particles: {renderStats.particleCount}
        </div>
      )}
    </>
  );
});

export default ParticleCanvas;
