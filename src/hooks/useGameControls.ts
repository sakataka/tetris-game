import { useCallback } from 'react';
import { GameState, Tetromino, SoundKey } from '../types/tetris';
import { SCORES } from '../constants';
import { isValidPosition, rotatePiece } from '../utils/game';

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
  onStateChange,
}: UseGameControlsProps) {
  const movePiece = useCallback(
    (dir: { x: number; y: number }) => {
      if (!gameState.currentPiece || gameState.gameOver || gameState.isPaused) {
        return;
      }

      const newPosition = {
        x: gameState.currentPiece.position.x + dir.x,
        y: gameState.currentPiece.position.y + dir.y,
      };

      if (isValidPosition(gameState.board, gameState.currentPiece, newPosition)) {
        const newState = actions.onPieceMove(gameState, newPosition);
        onStateChange(newState);
      } else if (dir.y > 0) {
        // Piece hit bottom, place it
        // 音声はcalculatePiecePlacementState内で再生されるため、ここでは再生しない
        actions.onPieceLand(gameState, gameState.currentPiece, 0);
        // onStateChangeは呼ばない（calculatePiecePlacementStateがZustandストアを直接更新）
      }
    },
    [gameState, actions, onStateChange]
  );

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
    while (
      isValidPosition(gameState.board, gameState.currentPiece, {
        x: gameState.currentPiece.position.x,
        y: dropY + 1,
      })
    ) {
      dropY++;
    }

    const droppedPiece = {
      ...gameState.currentPiece,
      position: { x: gameState.currentPiece.position.x, y: dropY },
    };

    const hardDropBonus = (dropY - gameState.currentPiece.position.y) * SCORES.HARD_DROP_BONUS;
    // 音声はcalculatePiecePlacementState内で再生されるため、ここでは再生しない
    actions.onPieceLand(gameState, droppedPiece, hardDropBonus);
    // onStateChangeは呼ばない（calculatePiecePlacementStateがZustandストアを直接更新）
  }, [gameState, actions]); // onStateChange除去 - 実際には使用されていない

  return {
    movePiece,
    rotatePieceClockwise,
    dropPiece,
    hardDrop,
  };
}
