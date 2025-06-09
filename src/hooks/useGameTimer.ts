import { useTimerAnimation, ANIMATION_PRESETS } from '../utils/animation';

interface UseGameTimerProps {
  isActive: boolean;
  interval: number;
  onTick: () => void;
}

/**
 * ゲームタイマーフック
 * 
 * 従来のsetIntervalから統一アニメーション管理システムに移行し、
 * パフォーマンスとタブ非アクティブ時の動作を改善
 */
export function useGameTimer({
  isActive,
  interval,
  onTick
}: UseGameTimerProps) {
  
  // 統一アニメーション管理システムを使用
  useTimerAnimation(
    onTick,
    interval,
    [onTick, interval],
    {
      ...ANIMATION_PRESETS.GAME_LOOP,
      enabled: isActive
      // タブ非アクティブ時の自動停止を削除（ゲーム進行を維持）
    }
  );
}