import { useEffect } from 'react';
import { GameState } from '../types/tetris';

interface UseGameLoopProps {
  gameState: GameState;
  dropTime: number;
  setDropTime: React.Dispatch<React.SetStateAction<number>>;
  dropPiece: () => void;
  movePiece: (dir: { x: number; y: number }) => void;
  rotatePieceClockwise: () => void;
  hardDrop: () => void;
  togglePause: () => void;
  resetGame: () => void;
  INITIAL_DROP_TIME: number;
}

export function useGameLoop({
  gameState,
  dropTime,
  setDropTime,
  dropPiece,
  movePiece,
  rotatePieceClockwise,
  hardDrop,
  togglePause,
  resetGame,
  INITIAL_DROP_TIME
}: UseGameLoopProps) {
  
  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (gameState.gameOver) {
        if (event.key === 'Enter' || event.key === ' ') {
          resetGame();
        }
        return;
      }

      switch (event.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          event.preventDefault();
          movePiece({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          event.preventDefault();
          movePiece({ x: 1, y: 0 });
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          event.preventDefault();
          movePiece({ x: 0, y: 1 });
          break;
        case 'ArrowUp':
        case 'w':
        case 'W':
          event.preventDefault();
          rotatePieceClockwise();
          break;
        case ' ':
          event.preventDefault();
          hardDrop();
          break;
        case 'p':
        case 'P':
          event.preventDefault();
          togglePause();
          break;
        case 'r':
        case 'R':
          event.preventDefault();
          resetGame();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState.gameOver, movePiece, rotatePieceClockwise, hardDrop, togglePause, resetGame]);

  // Game loop
  useEffect(() => {
    if (gameState.gameOver || gameState.isPaused) return;

    const gameLoop = setInterval(() => {
      dropPiece();
    }, dropTime);

    return () => clearInterval(gameLoop);
  }, [dropPiece, dropTime, gameState.gameOver, gameState.isPaused]);

  // Update drop time based on level
  useEffect(() => {
    const newDropTime = Math.max(50, INITIAL_DROP_TIME - (gameState.level - 1) * 100);
    setDropTime(newDropTime);
  }, [gameState.level, setDropTime, INITIAL_DROP_TIME]);
}