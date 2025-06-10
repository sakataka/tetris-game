'use client';

import { useCallback, useEffect, useMemo } from 'react';
import type { GameState, SoundKey, LineEffectState, Tetromino } from '../../types/tetris';
import { useGameControls } from '../../hooks/useGameControls';
import { useGameLoop } from '../../hooks/useGameLoop';
import { useHighScoreManager } from '../../hooks/useHighScoreManager';
import { useSessionTrackingV2 } from '../../hooks/useSessionTrackingV2';
import {
  useGameState,
  useDropTime,
  useSetGameState,
  useUpdateParticles,
  useResetGame,
  useTogglePause,
  useSetDropTime,
  useCalculatePiecePlacementState,
  useMovePieceToPosition,
  useRotatePieceTo,
  useClearLineEffect,
} from '../../store/gameStateStore';
import { EFFECTS } from '../../constants/layout';

export interface GameStateAPI {
  gameState: GameState;
  dropTime: number;
  onReset: () => void;
  onTogglePause: () => void;
  onParticleUpdate: (particles: LineEffectState['particles']) => void;
  onMove: (direction: { x: number; y: number }) => void;
  onRotate: () => void;
  onHardDrop: () => void;
}

interface GameStateControllerProps {
  playSound: (soundType: SoundKey) => void;
  onGameStart: () => void;
  children: (api: GameStateAPI) => React.ReactNode;
}

/**
 * GameStateController manages core game state and game logic operations.
 * Responsibilities:
 * - Game state management (board, pieces, score)
 * - Game controls integration
 * - Game loop management
 * - High score detection
 * - Session tracking
 */
export function GameStateController({
  playSound,
  onGameStart,
  children,
}: GameStateControllerProps) {
  // Zustand store integration for game state
  const gameState = useGameState();
  const dropTime = useDropTime();
  const setGameState = useSetGameState();
  const updateParticles = useUpdateParticles();
  const resetGame = useResetGame();
  const togglePause = useTogglePause();
  const setDropTime = useSetDropTime();
  const clearLineEffect = useClearLineEffect();

  // Game action functions
  const calculatePiecePlacementState = useCalculatePiecePlacementState();
  const movePieceToPosition = useMovePieceToPosition();
  const rotatePieceTo = useRotatePieceTo();

  // Line clear effect auto-cleanup
  useEffect(() => {
    const hasActiveEffects =
      gameState.lineEffect.flashingLines.length > 0 ||
      gameState.lineEffect.particles.some((p) => p.life > 0);

    if (hasActiveEffects) {
      const timeoutId = setTimeout(() => {
        clearLineEffect();
      }, EFFECTS.FLASH_DURATION);

      return () => clearTimeout(timeoutId);
    }

    return undefined;
  }, [gameState.lineEffect.flashingLines, gameState.lineEffect.particles, clearLineEffect]);

  // Piece control actions
  const pieceControlActions = useMemo(() => {
    return {
      onPieceMove: (state: GameState, newPosition: { x: number; y: number }) => {
        movePieceToPosition(newPosition);
        return state; // Zustand integration handles state update
      },
      onPieceLand: (state: GameState, piece: Tetromino, bonusPoints?: number) => {
        calculatePiecePlacementState(piece, bonusPoints, playSound);
        return state; // Zustand integration handles state update
      },
      onPieceRotate: (state: GameState, rotatedPiece: Tetromino) => {
        rotatePieceTo(rotatedPiece);
        return state; // Zustand integration handles state update
      },
    };
  }, [movePieceToPosition, rotatePieceTo, calculatePiecePlacementState, playSound]);

  // High score and session management
  useHighScoreManager({
    gameState,
    playSound,
  });
  const { endSession } = useSessionTrackingV2();

  // Monitor game over state to end session
  useEffect(() => {
    if (gameState.gameOver) {
      endSession();
    }
  }, [gameState.gameOver, endSession]);

  // Game controls integration
  const gameControls = useGameControls({
    gameState,
    actions: pieceControlActions,
    playSound,
    onStateChange: setGameState,
  });

  // Game loop integration
  useGameLoop({
    isGameOver: gameState.gameOver,
    isPaused: gameState.isPaused,
    level: gameState.level,
    dropTime,
    initialDropTime: 1000, // Initial drop time in milliseconds
    actions: {
      movePiece: gameControls.movePiece,
      rotatePieceClockwise: gameControls.rotatePieceClockwise,
      hardDrop: gameControls.hardDrop,
      dropPiece: gameControls.dropPiece,
      togglePause: togglePause,
      resetGame: resetGame,
    },
    onDropTimeChange: setDropTime,
  });

  // Event handlers
  const handleReset = useCallback(() => {
    onGameStart();
    resetGame();
  }, [onGameStart, resetGame]);

  const handleTogglePause = useCallback(() => {
    togglePause();
  }, [togglePause]);

  const handleParticleUpdate = useCallback(
    (particles: LineEffectState['particles']) => {
      updateParticles(particles);
    },
    [updateParticles]
  );

  // Construct API object
  const gameStateAPI: GameStateAPI = {
    gameState,
    dropTime,
    onReset: handleReset,
    onTogglePause: handleTogglePause,
    onParticleUpdate: handleParticleUpdate,
    onMove: gameControls.movePiece,
    onRotate: gameControls.rotatePieceClockwise,
    onHardDrop: gameControls.hardDrop,
  };

  return children(gameStateAPI);
}
