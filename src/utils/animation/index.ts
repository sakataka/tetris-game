/**
 * アニメーション統一管理システム - インデックスファイル
 * 
 * 全てのアニメーション関連ユーティリティとフックを統合エクスポート
 */

// アニメーションマネージャー
export { 
  AnimationManager, 
  animationManager,
  type AnimationOptions 
} from './animationManager';

// カスタムフック
export {
  useAnimationFrame,
  useSimpleAnimation,
  useConditionalAnimation,
  useTimerAnimation,
  usePerformanceAnimation,
  type UseAnimationOptions
} from './useAnimationFrame';

// 便利な定数
export const ANIMATION_PRESETS = {
  /** 高性能ゲームループ (60FPS) */
  GAME_LOOP: { fps: 60, priority: 'high' as const },
  
  /** UIアニメーション (30FPS) */
  UI_ANIMATION: { fps: 30, priority: 'normal' as const },
  
  /** パーティクルエフェクト (45FPS) */
  PARTICLE_EFFECT: { fps: 45, priority: 'normal' as const },
  
  /** 低優先度バックグラウンド (15FPS) */
  BACKGROUND: { fps: 15, priority: 'low' as const },
  
  /** アクセシビリティ配慮 (24FPS) */
  REDUCED_MOTION: { fps: 24, priority: 'normal' as const }
} as const;

/**
 * アニメーション管理のベストプラクティス
 */
export const ANIMATION_BEST_PRACTICES = {
  /**
   * ゲームループ向けアニメーション設定
   */
  gameLoop: () => ({
    ...ANIMATION_PRESETS.GAME_LOOP,
    autoStop: {
      condition: () => document.hidden // タブが非アクティブ時は停止
    }
  }),
  
  /**
   * UI効果向けアニメーション設定
   */
  uiEffect: (maxDuration: number = 5000) => ({
    ...ANIMATION_PRESETS.UI_ANIMATION,
    autoStop: { maxDuration }
  }),
  
  /**
   * パーティクル向けアニメーション設定
   */
  particleEffect: (maxDuration: number = 10000) => ({
    ...ANIMATION_PRESETS.PARTICLE_EFFECT,
    autoStop: { maxDuration }
  })
} as const;