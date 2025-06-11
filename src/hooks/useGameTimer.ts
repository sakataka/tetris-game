import { useEffect, useRef } from 'react';

interface UseGameTimerProps {
  isActive: boolean;
  interval: number;
  onTick: () => void;
}

/**
 * Game timer hook with simple setInterval implementation for debugging
 */
export function useGameTimer({ isActive, interval, onTick }: UseGameTimerProps) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const onTickRef = useRef(onTick);

  // Update callback ref when it changes
  useEffect(() => {
    onTickRef.current = onTick;
  }, [onTick]);

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        onTickRef.current();
      }, interval);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isActive, interval]);
}
