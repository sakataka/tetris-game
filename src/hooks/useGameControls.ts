import { useCallback } from 'react';
import { GameState, Tetromino, HARD_DROP_BONUS_MULTIPLIER, SoundKey } from '../types/tetris';
import { isValidPosition, rotatePiece } from '../utils/tetrisUtils';

interface PieceControlActions {
  onPieceMove: (state: GameState, newPosition: { x: number; y: number }) => GameState;
  onPieceLand: (state: GameState, piece: Tetromino, bonusPoints?: number) => GameState;
  onPieceRotate: (state: GameState, rotatedPiece: Tetromino) => GameState;
}

interface UseGameControlsProps {
  gameState: GameState;
  actions: PieceControlActions;
  playSound: (soundType: SoundKey) => void;
  onStateChange: (newState: GameState) => void;
}

export function useGameControls({
  gameState,
  actions,
  playSound,
  onStateChange
}: UseGameControlsProps) {
  
  // 🔍 DEBUG: useGameControls実行をトレース
  console.log(`🔍 useGameControls executed`);
  
  const movePiece = useCallback((dir: { x: number; y: number }) => {
    if (!gameState.currentPiece || gameState.gameOver || gameState.isPaused) {
      return;
    }

    const newPosition = {
      x: gameState.currentPiece.position.x + dir.x,
      y: gameState.currentPiece.position.y + dir.y
    };

    if (isValidPosition(gameState.board, gameState.currentPiece, newPosition)) {
      const newState = actions.onPieceMove(gameState, newPosition);
      onStateChange(newState);
    } else if (dir.y > 0) {
      // Piece hit bottom, place it
      playSound('pieceLand');
      const newState = actions.onPieceLand(gameState, gameState.currentPiece, 0);
      onStateChange(newState);
    }
  }, [gameState, actions, playSound, onStateChange]);

  const rotatePieceClockwise = useCallback(() => {
    if (!gameState.currentPiece || gameState.gameOver || gameState.isPaused) {
      return;
    }

    const rotatedPiece = rotatePiece(gameState.currentPiece);
    
    if (isValidPosition(gameState.board, rotatedPiece, rotatedPiece.position)) {
      playSound('pieceRotate');
      const newState = actions.onPieceRotate(gameState, rotatedPiece);
      onStateChange(newState);
    }
  }, [gameState, actions, playSound, onStateChange]);

  const dropPiece = useCallback(() => {
    movePiece({ x: 0, y: 1 });
  }, [movePiece]);

  const hardDrop = useCallback(() => {
    if (!gameState.currentPiece || gameState.gameOver || gameState.isPaused) {
      return;
    }

    let dropY = gameState.currentPiece.position.y;
    while (isValidPosition(gameState.board, gameState.currentPiece, { 
      x: gameState.currentPiece.position.x, 
      y: dropY + 1 
    })) {
      dropY++;
    }

    const droppedPiece = {
      ...gameState.currentPiece,
      position: { x: gameState.currentPiece.position.x, y: dropY }
    };

    const hardDropBonus = (dropY - gameState.currentPiece.position.y) * HARD_DROP_BONUS_MULTIPLIER;
    playSound('hardDrop');
    const newState = actions.onPieceLand(gameState, droppedPiece, hardDropBonus);
    onStateChange(newState);
  }, [gameState, actions, playSound, onStateChange]);

  return {
    movePiece,
    rotatePieceClockwise,
    dropPiece,
    hardDrop
  };
}