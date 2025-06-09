'use client';

import { useEffect, useRef, memo, useCallback } from 'react';
import { LineEffectState } from '../types/tetris';
import {
  PARTICLE_GRAVITY,
  PARTICLE_MAX_Y,
  PARTICLE_LIFE_DURATION,
  PARTICLE_SCALE_BASE,
  PARTICLE_SCALE_MULTIPLIER,
  PARTICLE_OPACITY_MULTIPLIER
} from '../constants';
import { particlePool } from '../utils/performance';

interface ParticleCanvasProps {
  lineEffect: LineEffectState;
  onParticleUpdate: (particles: LineEffectState['particles']) => void;
  width?: number;
  height?: number;
}

const ParticleCanvas = memo(function ParticleCanvas({ 
  lineEffect, 
  onParticleUpdate,
  width = 400,
  height = 600
}: ParticleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const lastUpdateTimeRef = useRef<number>(0);

  // Canvas初期化
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // High DPI対応
    const ratio = window.devicePixelRatio || 1;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(ratio, ratio);

    // パフォーマンス最適化設定
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    ctxRef.current = ctx;
  }, [width, height]);

  // パーティクル描画関数
  const drawParticle = useCallback((
    ctx: CanvasRenderingContext2D, 
    particle: LineEffectState['particles'][0]
  ) => {
    const lifeRatio = particle.life / PARTICLE_LIFE_DURATION;
    const scale = PARTICLE_SCALE_BASE + lifeRatio * PARTICLE_SCALE_MULTIPLIER;
    const opacity = lifeRatio * PARTICLE_OPACITY_MULTIPLIER;
    const size = 2 + scale;

    ctx.save();
    
    // パーティクル位置に移動
    ctx.translate(particle.x, particle.y);
    ctx.rotate((particle.life * 5) * Math.PI / 180);
    
    // グラデーション作成
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size);
    gradient.addColorStop(0, particle.color);
    gradient.addColorStop(0.3, particle.color + 'CC');
    gradient.addColorStop(0.7, particle.color + '44');
    gradient.addColorStop(1, 'transparent');
    
    ctx.fillStyle = gradient;
    ctx.globalAlpha = opacity;
    
    // 外側のグロー効果
    ctx.shadowColor = particle.color;
    ctx.shadowBlur = 4 + scale * 2;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    // パーティクル描画
    ctx.beginPath();
    ctx.arc(0, 0, size, 0, Math.PI * 2);
    ctx.fill();
    
    // 内側のコア
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = opacity * 0.6;
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.3, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  }, []);

  // アニメーション関数をuseCallbackでメモ化
  const animate = useCallback(() => {
    const ctx = ctxRef.current;
    if (!ctx) return;

    const now = performance.now();
    const deltaTime = now - lastUpdateTimeRef.current;
    
    // フレームレート制限（60FPS = 16.67ms）
    if (deltaTime < 16.67) {
      animationRef.current = requestAnimationFrame(animate);
      return;
    }
    
    lastUpdateTimeRef.current = now;
    
    // Canvas清拭
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    const updatedParticles: LineEffectState['particles'] = [];
    const expiredParticles: LineEffectState['particles'] = [];

    // パーティクル更新と描画
    for (let i = 0; i < lineEffect.particles.length; i++) {
      const particle = lineEffect.particles[i];
      
      // パーティクル状態更新
      const updatedParticle = {
        ...particle,
        x: particle.x + particle.vx,
        y: particle.y + particle.vy,
        vy: particle.vy + PARTICLE_GRAVITY,
        life: particle.life - 1
      };

      if (updatedParticle.life > 0 && updatedParticle.y < PARTICLE_MAX_Y) {
        updatedParticles.push(updatedParticle);
        drawParticle(ctx, updatedParticle);
      } else {
        expiredParticles.push(particle);
      }
    }

    // 期限切れのパーティクルをプールに戻す
    if (expiredParticles.length > 0) {
      particlePool.releaseParticles(expiredParticles);
    }

    onParticleUpdate(updatedParticles);

    // パーティクルが残っている場合のみ次のフレームを要求
    if (updatedParticles.length > 0) {
      animationRef.current = requestAnimationFrame(animate);
    } else {
      animationRef.current = undefined;
    }
  }, [lineEffect.particles, onParticleUpdate, drawParticle]);

  useEffect(() => {
    if (lineEffect.particles.length === 0) {
      // パーティクルがない場合はアニメーションを停止
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = undefined;
      }
      
      // Canvas清拭
      const ctx = ctxRef.current;
      if (ctx) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      }
      return;
    }

    // アニメーションが既に実行中でない場合のみ開始
    if (!animationRef.current) {
      lastUpdateTimeRef.current = performance.now();
      animationRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = undefined;
      }
    };
  }, [lineEffect.particles.length, animate]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ width, height }}
    />
  );
});

export default ParticleCanvas;