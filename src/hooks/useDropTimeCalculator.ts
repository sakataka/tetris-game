import { useEffect } from 'react';
import { GAME_TIMING } from '../constants';

interface UseDropTimeCalculatorProps {
  level: number;
  initialDropTime: number;
  onDropTimeChange: (newDropTime: number) => void;
}

export function useDropTimeCalculator({
  level,
  initialDropTime,
  onDropTimeChange,
}: UseDropTimeCalculatorProps) {
  useEffect(() => {
    const newDropTime = Math.max(GAME_TIMING.MIN_DROP_TIME, initialDropTime - (level - 1) * 100);
    onDropTimeChange(newDropTime);
  }, [level, initialDropTime, onDropTimeChange]);
}
