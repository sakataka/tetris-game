import { useEffect, useRef } from 'react';
import { DEFAULT_VALUES } from '@/constants';
import { animationManager } from '@/utils/animation/animationManager';

interface UseAnimationTimerProps {
  isActive: boolean;
  interval: number;
  onTick: () => void;
}

/**
 * Animation-based timer hook to replace setInterval
 *
 * Uses AnimationManager for unified requestAnimationFrame timing,
 * eliminating timer conflicts and providing better performance.
 */
export function useAnimationTimer({ isActive, interval, onTick }: UseAnimationTimerProps) {
  const onTickRef = useRef(onTick);
  const animationIdRef = useRef<string | null>(null);

  // Update callback ref when it changes
  useEffect(() => {
    onTickRef.current = onTick;
  }, [onTick]);

  useEffect(() => {
    if (isActive) {
      const animationId = `game-timer-${Date.now()}-${Math.random()}`;
      animationIdRef.current = animationId;

      let lastTickTime: number = DEFAULT_VALUES.UI.ANIMATION_LAST_TICK_INITIAL;

      // Animation callback that simulates setInterval behavior
      const tickCallback = (currentTime: number) => {
        if (lastTickTime === DEFAULT_VALUES.UI.ANIMATION_LAST_TICK_INITIAL) {
          lastTickTime = currentTime;
        }

        const deltaTime = currentTime - lastTickTime;

        // Execute tick when interval has elapsed
        if (deltaTime >= interval) {
          onTickRef.current();
          lastTickTime = currentTime;
        }
      };

      // Register with AnimationManager
      animationManager.registerAnimation(animationId, tickCallback, {
        fps: Math.min(60, 1000 / interval), // Calculate appropriate FPS
        priority: 'high', // Game timer has high priority
      });
    } else {
      // Cleanup animation when inactive
      if (animationIdRef.current) {
        animationManager.unregisterAnimation(animationIdRef.current);
        animationIdRef.current = null;
      }
    }

    return () => {
      // Cleanup on unmount or dependency change
      if (animationIdRef.current) {
        animationManager.unregisterAnimation(animationIdRef.current);
        animationIdRef.current = null;
      }
    };
  }, [isActive, interval]);
}
