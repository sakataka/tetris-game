import { useEffect } from 'react';

interface KeyBindings {
  moveLeft: string[];
  moveRight: string[];
  moveDown: string[];
  rotate: string[];
  hardDrop: string[];
  pause: string[];
  reset: string[];
  confirm: string[];
}

interface UseKeyboardInputProps {
  isGameOver: boolean;
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onMoveDown: () => void;
  onRotate: () => void;
  onHardDrop: () => void;
  onPause: () => void;
  onReset: () => void;
  onConfirm: () => void;
  keyBindings?: Partial<KeyBindings>;
}

const DEFAULT_KEY_BINDINGS: KeyBindings = {
  moveLeft: ['ArrowLeft', 'a', 'A'],
  moveRight: ['ArrowRight', 'd', 'D'],
  moveDown: ['ArrowDown', 's', 'S'],
  rotate: ['ArrowUp', 'w', 'W'],
  hardDrop: [' '],
  pause: ['p', 'P'],
  reset: ['r', 'R'],
  confirm: ['Enter', ' '],
};

export function useKeyboardInput({
  isGameOver,
  onMoveLeft,
  onMoveRight,
  onMoveDown,
  onRotate,
  onHardDrop,
  onPause,
  onReset,
  onConfirm,
  keyBindings = {},
}: UseKeyboardInputProps) {
  useEffect(() => {
    const bindings = { ...DEFAULT_KEY_BINDINGS, ...keyBindings };

    const handleKeyPress = (event: KeyboardEvent) => {
      if (isGameOver) {
        if (bindings.confirm.includes(event.key)) {
          event.preventDefault();
          onConfirm();
        }
        return;
      }

      if (bindings.moveLeft.includes(event.key)) {
        event.preventDefault();
        onMoveLeft();
      } else if (bindings.moveRight.includes(event.key)) {
        event.preventDefault();
        onMoveRight();
      } else if (bindings.moveDown.includes(event.key)) {
        event.preventDefault();
        onMoveDown();
      } else if (bindings.rotate.includes(event.key)) {
        event.preventDefault();
        onRotate();
      } else if (bindings.hardDrop.includes(event.key)) {
        event.preventDefault();
        onHardDrop();
      } else if (bindings.pause.includes(event.key)) {
        event.preventDefault();
        onPause();
      } else if (bindings.reset.includes(event.key)) {
        event.preventDefault();
        onReset();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [
    isGameOver,
    onMoveLeft,
    onMoveRight,
    onMoveDown,
    onRotate,
    onHardDrop,
    onPause,
    onReset,
    onConfirm,
    keyBindings,
  ]);
}
