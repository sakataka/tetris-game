/**
 * アニメーション統一管理システム
 *
 * 分散していたrequestAnimationFrame管理を統合し、
 * パフォーマンスと保守性を向上させる中央集権型アニメーションマネージャー
 */

import { handleError } from '../data/errorHandler';
import { SystemError } from '../../types/errors';

export interface AnimationOptions {
  /** 目標FPS (デフォルト: 60) */
  fps?: number;
  /** アニメーション優先度 (高優先度は低FPS時も継続) */
  priority?: 'low' | 'normal' | 'high';
  /** 自動停止条件 */
  autoStop?: {
    /** 最大実行時間（ミリ秒） */
    maxDuration?: number;
    /** 条件関数（trueで停止） */
    condition?: () => boolean;
  };
}

interface ActiveAnimation {
  id: string;
  callback: FrameRequestCallback;
  options: Required<AnimationOptions>;
  requestId: number;
  startTime: number;
  lastFrameTime: number;
  frameCount: number;
}

/**
 * シングルトンアニメーションマネージャー
 *
 * 機能:
 * - requestAnimationFrame の統一管理
 * - FPS制限と優先度ベースの実行制御
 * - パフォーマンス監視と自動最適化
 * - デバッグ用統計情報
 */
export class AnimationManager {
  private static instance: AnimationManager;
  private activeAnimations = new Map<string, ActiveAnimation>();
  private isPaused = false;
  private isReducedMotion = false;
  private globalFPSLimit = 60;
  private performanceThreshold = 16.67; // 60FPS基準

  // パフォーマンス統計
  private stats = {
    totalFrames: 0,
    droppedFrames: 0,
    averageFrameTime: 0,
    lastPerformanceCheck: 0,
  };

  private constructor() {
    this.initializeSettings();
    this.startPerformanceMonitoring();
  }

  public static getInstance(): AnimationManager {
    if (!AnimationManager.instance) {
      AnimationManager.instance = new AnimationManager();
    }
    return AnimationManager.instance;
  }

  /**
   * アニメーションを登録して実行開始
   */
  public registerAnimation(
    id: string,
    callback: FrameRequestCallback,
    options: AnimationOptions = {}
  ): void {
    try {
      // 既存アニメーションがあれば停止
      if (this.activeAnimations.has(id)) {
        this.unregisterAnimation(id);
      }

      // オプションのデフォルト値設定
      const fullOptions: Required<AnimationOptions> = {
        fps: options.fps ?? this.globalFPSLimit,
        priority: options.priority ?? 'normal',
        autoStop: {
          maxDuration: options.autoStop?.maxDuration ?? Infinity,
          condition: options.autoStop?.condition ?? (() => false),
        },
      };

      // reduced-motion設定時は低優先度アニメーションをスキップ
      if (this.isReducedMotion && fullOptions.priority === 'low') {
        return;
      }

      const animation: ActiveAnimation = {
        id,
        callback,
        options: fullOptions,
        requestId: 0,
        startTime: performance.now(),
        lastFrameTime: 0,
        frameCount: 0,
      };

      // アニメーション実行ループ
      const animate = (currentTime: number) => {
        if (this.isPaused || !this.activeAnimations.has(id)) {
          return;
        }

        const targetInterval = 1000 / fullOptions.fps;
        const deltaTime = currentTime - animation.lastFrameTime;

        // FPS制限チェック
        if (deltaTime >= targetInterval) {
          // 自動停止条件チェック
          const elapsed = currentTime - animation.startTime;
          const maxDuration = fullOptions.autoStop.maxDuration ?? Infinity;
          if (elapsed >= maxDuration || fullOptions.autoStop.condition?.()) {
            this.unregisterAnimation(id);
            return;
          }

          try {
            callback(currentTime);
            animation.frameCount++;
            animation.lastFrameTime = currentTime;

            // パフォーマンス統計更新
            this.updatePerformanceStats(deltaTime);
          } catch (error) {
            handleError(
              new SystemError(`Animation callback error: ${id}`, {
                component: 'AnimationManager',
                action: 'animate',
                timestamp: Date.now(),
                additionalData: { animationId: id, error },
              })
            );
            this.unregisterAnimation(id);
            return;
          }
        }

        animation.requestId = requestAnimationFrame(animate);
      };

      animation.requestId = requestAnimationFrame(animate);
      this.activeAnimations.set(id, animation);
    } catch (error) {
      handleError(
        new SystemError(`Failed to register animation: ${id}`, {
          component: 'AnimationManager',
          action: 'registerAnimation',
          timestamp: Date.now(),
          additionalData: { animationId: id, error },
        })
      );
    }
  }

  /**
   * アニメーションの登録解除
   */
  public unregisterAnimation(id: string): void {
    const animation = this.activeAnimations.get(id);
    if (animation) {
      cancelAnimationFrame(animation.requestId);
      this.activeAnimations.delete(id);
    }
  }

  /**
   * 全アニメーションの一時停止
   */
  public pauseAll(): void {
    this.isPaused = true;
    this.activeAnimations.forEach((animation) => {
      cancelAnimationFrame(animation.requestId);
    });
  }

  /**
   * 全アニメーションの再開
   */
  public resumeAll(): void {
    if (!this.isPaused) return;

    this.isPaused = false;
    this.activeAnimations.forEach((animation, id) => {
      // 再開時は新しいrequestAnimationFrameを開始
      this.registerAnimation(id, animation.callback, animation.options);
    });
  }

  /**
   * 低優先度アニメーションの停止（パフォーマンス最適化）
   */
  public pauseLowPriorityAnimations(): void {
    this.activeAnimations.forEach((animation, id) => {
      if (animation.options.priority === 'low') {
        this.unregisterAnimation(id);
      }
    });
  }

  /**
   * 全アニメーションの強制停止
   */
  public stopAll(): void {
    this.activeAnimations.forEach((animation) => {
      cancelAnimationFrame(animation.requestId);
    });
    this.activeAnimations.clear();
  }

  /**
   * アクセシビリティ設定の更新
   */
  public setReducedMotion(enabled: boolean): void {
    this.isReducedMotion = enabled;
    if (enabled) {
      this.pauseLowPriorityAnimations();
    }
  }

  /**
   * グローバルFPS制限の設定
   */
  public setGlobalFPSLimit(fps: number): void {
    this.globalFPSLimit = Math.max(1, Math.min(120, fps));
  }

  /**
   * デバッグ用統計情報取得
   */
  public getStats() {
    return {
      ...this.stats,
      activeAnimations: this.activeAnimations.size,
      isPaused: this.isPaused,
      isReducedMotion: this.isReducedMotion,
      globalFPSLimit: this.globalFPSLimit,
    };
  }

  /**
   * 初期設定の読み込み
   */
  private initializeSettings(): void {
    // prefers-reduced-motion の検出
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      this.isReducedMotion = mediaQuery.matches;

      // 設定変更の監視
      mediaQuery.addEventListener('change', (e) => {
        this.setReducedMotion(e.matches);
      });
    }
  }

  /**
   * パフォーマンス監視の開始
   */
  private startPerformanceMonitoring(): void {
    // 5秒間隔でパフォーマンスチェック
    setInterval(() => {
      this.checkPerformance();
    }, 5000);
  }

  /**
   * パフォーマンス統計の更新
   */
  private updatePerformanceStats(frameTime: number): void {
    this.stats.totalFrames++;

    if (frameTime > this.performanceThreshold * 2) {
      this.stats.droppedFrames++;
    }

    // 移動平均でフレーム時間を計算
    this.stats.averageFrameTime = this.stats.averageFrameTime * 0.9 + frameTime * 0.1;
  }

  /**
   * パフォーマンスチェックと自動最適化
   */
  private checkPerformance(): void {
    const now = performance.now();
    if (now - this.stats.lastPerformanceCheck < 5000) return;

    const dropRate = this.stats.droppedFrames / this.stats.totalFrames;

    // フレームドロップ率が20%を超える場合、自動最適化
    if (dropRate > 0.2) {
      console.warn(
        `AnimationManager: High frame drop rate (${(dropRate * 100).toFixed(1)}%). Optimizing...`
      );
      this.pauseLowPriorityAnimations();

      // グローバルFPS制限を下げる
      if (this.globalFPSLimit > 30) {
        this.setGlobalFPSLimit(this.globalFPSLimit - 10);
      }
    }

    this.stats.lastPerformanceCheck = now;
  }
}

// シングルトンインスタンスのエクスポート
export const animationManager = AnimationManager.getInstance();
