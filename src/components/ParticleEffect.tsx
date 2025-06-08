'use client';

import { useEffect, useRef, memo, useMemo, useCallback, useState } from 'react';
import { 
  LineEffectState, 
  PARTICLE_GRAVITY, 
  PARTICLE_MAX_Y, 
  PARTICLE_LIFE_DURATION,
  PARTICLE_SCALE_BASE,
  PARTICLE_SCALE_MULTIPLIER,
  PARTICLE_OPACITY_MULTIPLIER
} from '../types/tetris';
import { particlePool } from '../utils/particlePool';
import { performanceMonitor } from '../utils/performanceMonitor';
import ParticleCanvas from './ParticleCanvas';

interface ParticleEffectProps {
  lineEffect: LineEffectState;
  onParticleUpdate: (particles: LineEffectState['particles']) => void;
  forceRenderer?: 'dom' | 'canvas' | 'auto';
  enablePerformanceMonitoring?: boolean;
}

// 個別パーティクルコンポーネント（重い計算を分離）
const Particle = memo(function Particle({ 
  particle 
}: { 
  particle: LineEffectState['particles'][0] 
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
      // CSS変数を使用してパフォーマンス改善
      '--particle-color': particle.color,
      '--particle-scale': scale,
      '--life-ratio': lifeRatio,
    } as React.CSSProperties & Record<string, string | number>;
  }, [particle.x, particle.y, particle.life, particle.color]);

  return (
    <div
      className="absolute rounded-full particle-optimized"
      style={style}
    />
  );
});

const ParticleEffect = memo(function ParticleEffect({ 
  lineEffect, 
  onParticleUpdate,
  forceRenderer = 'auto',
  enablePerformanceMonitoring = false
}: ParticleEffectProps) {
  const animationRef = useRef<number | undefined>(undefined);
  const lastUpdateTimeRef = useRef<number>(0);
  const [currentRenderer, setCurrentRenderer] = useState<'dom' | 'canvas'>('dom');
  const performanceCheckCountRef = useRef(0);

  // アニメーション関数をuseCallbackでメモ化
  const animate = useCallback(() => {
    if (enablePerformanceMonitoring) {
      performanceMonitor.startFrame();
    }

    const now = performance.now();
    const deltaTime = now - lastUpdateTimeRef.current;
    
    // フレームレート制限（60FPS = 16.67ms）
    if (deltaTime < 16.67) {
      animationRef.current = requestAnimationFrame(animate);
      return;
    }
    
    lastUpdateTimeRef.current = now;
    
    const updatedParticles: LineEffectState['particles'] = [];
    const expiredParticles: LineEffectState['particles'] = [];

    // バッチ処理で配列操作を最適化
    for (let i = 0; i < lineEffect.particles.length; i++) {
      const particle = lineEffect.particles[i];
      const updatedParticle = {
        ...particle,
        x: particle.x + particle.vx,
        y: particle.y + particle.vy,
        vy: particle.vy + PARTICLE_GRAVITY,
        life: particle.life - 1
      };

      if (updatedParticle.life > 0 && updatedParticle.y < PARTICLE_MAX_Y) {
        updatedParticles.push(updatedParticle);
      } else {
        expiredParticles.push(particle);
      }
    }

    // 期限切れのパーティクルをプールに戻す
    if (expiredParticles.length > 0) {
      particlePool.releaseParticles(expiredParticles);
    }

    onParticleUpdate(updatedParticles);

    // パフォーマンス監視とレンダラー自動切り替え
    if (enablePerformanceMonitoring) {
      const metrics = performanceMonitor.endFrame(updatedParticles.length);
      
      // 自動レンダラー切り替え（30フレーム毎にチェック）
      if (forceRenderer === 'auto' && ++performanceCheckCountRef.current >= 30) {
        performanceCheckCountRef.current = 0;
        
        if (metrics.fps < 45 && currentRenderer === 'dom' && updatedParticles.length > 20) {
          console.log('🚀 Switching to Canvas renderer for better performance');
          setCurrentRenderer('canvas');
        } else if (metrics.fps > 55 && currentRenderer === 'canvas' && updatedParticles.length < 10) {
          console.log('🎨 Switching to DOM renderer for better visual quality');
          setCurrentRenderer('dom');
        }
      }
    }

    // パーティクルが残っている場合のみ次のフレームを要求
    if (updatedParticles.length > 0) {
      animationRef.current = requestAnimationFrame(animate);
    } else {
      animationRef.current = undefined;
    }
  }, [lineEffect.particles, onParticleUpdate, enablePerformanceMonitoring, forceRenderer, currentRenderer]);

  useEffect(() => {
    if (lineEffect.particles.length === 0) {
      // パーティクルがない場合はアニメーションを停止
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = undefined;
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

  // レンダラー選択ロジック
  const selectedRenderer = useMemo(() => {
    if (forceRenderer !== 'auto') return forceRenderer;
    return currentRenderer;
  }, [forceRenderer, currentRenderer]);

  // パーティクルリストをuseMemoでメモ化（DOM レンダラー用）
  const particleElements = useMemo(() => {
    if (selectedRenderer === 'canvas') return null;
    
    return lineEffect.particles.map(particle => (
      <Particle 
        key={particle.id} 
        particle={particle}
      />
    ));
  }, [lineEffect.particles, selectedRenderer]);

  // パフォーマンス最適化情報を開発環境でログ出力
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && enablePerformanceMonitoring) {
      console.log(`🎮 Particle Renderer: ${selectedRenderer.toUpperCase()}, Particles: ${lineEffect.particles.length}`);
    }
  }, [selectedRenderer, lineEffect.particles.length, enablePerformanceMonitoring]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
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