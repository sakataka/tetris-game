import { useEffect } from 'react';

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
    const newDropTime = Math.max(50, initialDropTime - (level - 1) * 100);
    onDropTimeChange(newDropTime);
  }, [level, initialDropTime, onDropTimeChange]);
}
