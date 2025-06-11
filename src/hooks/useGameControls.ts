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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onStateChange: _onStateChange,
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

      const isValid = isValidPosition(gameState.board, gameState.currentPiece, newPosition);

      if (isValid) {
        actions.onPieceMove(gameState, newPosition);
        // onStateChange not needed as Zustand store is updated directly
      } else if (dir.y > 0) {
        // Piece hit bottom, place it
        // Sound playback is handled within calculatePiecePlacementState, not here
        actions.onPieceLand(gameState, gameState.currentPiece, 0);
        // onStateChange is omitted as calculatePiecePlacementState directly updates Zustand store
      }
    },
    [gameState, actions]
  );

  const rotatePieceClockwise = useCallback(() => {
    if (!gameState.currentPiece || gameState.gameOver || gameState.isPaused) {
      return;
    }

    const rotatedPiece = rotatePiece(gameState.currentPiece);

    if (isValidPosition(gameState.board, rotatedPiece, rotatedPiece.position)) {
      playSound('pieceRotate');
      actions.onPieceRotate(gameState, rotatedPiece);
      // onStateChange not needed as Zustand store is updated directly
    }
  }, [gameState, actions, playSound]);

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
    // Sound playback is handled within calculatePiecePlacementState, not here
    actions.onPieceLand(gameState, droppedPiece, hardDropBonus);
    // onStateChange is omitted as calculatePiecePlacementState directly updates Zustand store
  }, [gameState, actions]); // onStateChange excluded - not actually used

  return {
    movePiece,
    rotatePieceClockwise,
    dropPiece,
    hardDrop,
  };
}
