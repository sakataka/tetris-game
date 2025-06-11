import { useCallback } from 'react';
import { useKeyboardInput } from './useKeyboardInput';
import { useAnimationTimer } from './useAnimationTimer';
import { useDropTimeCalculator } from './useDropTimeCalculator';

interface GameActions {
  movePiece: (dir: { x: number; y: number }) => void;
  rotatePieceClockwise: () => void;
  hardDrop: () => void;
  dropPiece: () => void;
  togglePause: () => void;
  resetGame: () => void;
}

interface UseGameLoopProps {
  isGameOver: boolean;
  isPaused: boolean;
  level: number;
  dropTime: number;
  initialDropTime: number;
  actions: GameActions;
  onDropTimeChange: (newDropTime: number) => void;
}

export function useGameLoop({
  isGameOver,
  isPaused,
  level,
  dropTime,
  initialDropTime,
  actions,
  onDropTimeChange,
}: UseGameLoopProps) {
  // Callback for keyboard input processing
  const onMoveLeft = useCallback(() => actions.movePiece({ x: -1, y: 0 }), [actions]);
  const onMoveRight = useCallback(() => actions.movePiece({ x: 1, y: 0 }), [actions]);
  const onMoveDown = useCallback(() => actions.movePiece({ x: 0, y: 1 }), [actions]);
  const onConfirm = useCallback(() => actions.resetGame(), [actions]);

  // Keyboard input processing
  useKeyboardInput({
    isGameOver,
    onMoveLeft,
    onMoveRight,
    onMoveDown,
    onRotate: actions.rotatePieceClockwise,
    onHardDrop: actions.hardDrop,
    onPause: actions.togglePause,
    onReset: actions.resetGame,
    onConfirm,
  });

  // Game timer (unified with AnimationManager)
  useAnimationTimer({
    isActive: !isGameOver && !isPaused,
    interval: dropTime,
    onTick: actions.dropPiece,
  });

  // Drop time calculation
  useDropTimeCalculator({
    level,
    initialDropTime,
    onDropTimeChange,
  });
}
