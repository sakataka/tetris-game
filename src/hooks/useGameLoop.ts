// useCallback removed - React Compiler handles optimization automatically
import { useAnimationTimer } from './useAnimationTimer';
import { useDropTimeCalculator } from './useDropTimeCalculator';
import { useKeyboardInput } from './useKeyboardInput';

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
  // React Compiler will optimize these event handlers automatically
  const onMoveLeft = () => actions.movePiece({ x: -1, y: 0 });
  const onMoveRight = () => actions.movePiece({ x: 1, y: 0 });
  const onMoveDown = () => actions.movePiece({ x: 0, y: 1 });
  const onConfirm = () => actions.resetGame();

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
