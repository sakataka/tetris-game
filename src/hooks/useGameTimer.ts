import { useTimerAnimation, ANIMATION_PRESETS } from '../utils/animation';

interface UseGameTimerProps {
  isActive: boolean;
  interval: number;
  onTick: () => void;
}

/**
 * Game timer hook
 *
 * Migrated from traditional setInterval to unified animation management system,
 * improving performance and behavior when tab is inactive
 */
export function useGameTimer({ isActive, interval, onTick }: UseGameTimerProps) {
  // Use unified animation management system
  // Important: Only depend on interval, not onTick to prevent timer reset
  useTimerAnimation(onTick, interval, [interval], {
    ...ANIMATION_PRESETS.GAME_LOOP,
    enabled: isActive,
    // Remove auto-stop when tab is inactive (maintain game progress)
  });
}
