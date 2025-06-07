import { useCallback } from 'react';
import { GameState, Tetromino, HARD_DROP_BONUS_MULTIPLIER } from '../types/tetris';
import { isValidPosition, rotatePiece } from '../utils/tetrisUtils';

import type { SoundKey } from './useSounds';

interface UseGameControlsProps {
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  calculatePiecePlacementState: (prevState: GameState, piece: Tetromino, bonusPoints?: number) => GameState;
  playSound: (soundType: SoundKey) => void;
}

export function useGameControls({
  setGameState,
  calculatePiecePlacementState,
  playSound
}: UseGameControlsProps) {
  
  const movePiece = useCallback((dir: { x: number; y: number }) => {
    setGameState(prevState => {
      if (!prevState.currentPiece || prevState.gameOver || prevState.isPaused) {
        return prevState;
      }

      const newPosition = {
        x: prevState.currentPiece.position.x + dir.x,
        y: prevState.currentPiece.position.y + dir.y
      };

      if (isValidPosition(prevState.board, prevState.currentPiece, newPosition)) {
        return {
          ...prevState,
          currentPiece: {
            ...prevState.currentPiece,
            position: newPosition
          }
        };
      }

      if (dir.y > 0) {
        // Piece hit bottom, place it
        playSound('pieceLand');
        return calculatePiecePlacementState(prevState, prevState.currentPiece, 0);
      }

      return prevState;
    });
  }, [calculatePiecePlacementState, setGameState, playSound]);

  const rotatePieceClockwise = useCallback(() => {
    setGameState(prevState => {
      if (!prevState.currentPiece || prevState.gameOver || prevState.isPaused) {
        return prevState;
      }

      const rotatedPiece = rotatePiece(prevState.currentPiece);
      
      if (isValidPosition(prevState.board, rotatedPiece, rotatedPiece.position)) {
        playSound('pieceRotate');
        return {
          ...prevState,
          currentPiece: rotatedPiece
        };
      }

      return prevState;
    });
  }, [setGameState, playSound]);

  const dropPiece = useCallback(() => {
    movePiece({ x: 0, y: 1 });
  }, [movePiece]);

  const hardDrop = useCallback(() => {
    setGameState(prevState => {
      if (!prevState.currentPiece || prevState.gameOver || prevState.isPaused) {
        return prevState;
      }

      let dropY = prevState.currentPiece.position.y;
      while (isValidPosition(prevState.board, prevState.currentPiece, { 
        x: prevState.currentPiece.position.x, 
        y: dropY + 1 
      })) {
        dropY++;
      }

      const droppedPiece = {
        ...prevState.currentPiece,
        position: { x: prevState.currentPiece.position.x, y: dropY }
      };

      const hardDropBonus = (dropY - prevState.currentPiece.position.y) * HARD_DROP_BONUS_MULTIPLIER;
      playSound('hardDrop');
      return calculatePiecePlacementState(prevState, droppedPiece, hardDropBonus);
    });
  }, [calculatePiecePlacementState, setGameState, playSound]);

  return {
    movePiece,
    rotatePieceClockwise,
    dropPiece,
    hardDrop
  };
}