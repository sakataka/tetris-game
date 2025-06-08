import { useEffect } from 'react';

interface UseGameTimerProps {
  isActive: boolean;
  interval: number;
  onTick: () => void;
}

export function useGameTimer({
  isActive,
  interval,
  onTick
}: UseGameTimerProps) {
  
  useEffect(() => {
    if (!isActive) return;

    const timer = setInterval(onTick, interval);
    return () => clearInterval(timer);
  }, [isActive, interval, onTick]);
}