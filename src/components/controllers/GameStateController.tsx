'use client';

import { useEffect, useRef } from 'react';
import type { GameState, SoundKey, LineEffectState, Tetromino } from '../../types/tetris';
import { useGameControls } from '../../hooks/useGameControls';
import { useGameLoop } from '../../hooks/useGameLoop';
import { useHighScoreManager } from '../../hooks/useHighScoreManager';
import { useSessionTrackingV2 } from '../../hooks/useSessionTrackingV2';
import { animationManager } from '../../utils/animation/animationManager';
import {
  useGameState,
  useDropTime,
  useUpdateParticles,
  useResetGame,
  useTogglePause,
  useSetDropTime,
  useUpdateLineEffect,
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
  const updateParticles = useUpdateParticles();
  const resetGame = useResetGame();
  const togglePause = useTogglePause();
  const setDropTime = useSetDropTime();
  const updateLineEffect = useUpdateLineEffect();
  const clearLineEffect = useClearLineEffect();

  // Game action functions
  const calculatePiecePlacementState = useCalculatePiecePlacementState();
  const movePieceToPosition = useMovePieceToPosition();
  const rotatePieceTo = useRotatePieceTo();

  // Line clear effect auto-cleanup - unified with AnimationManager
  const effectCleanupIdRef = useRef<string | null>(null);

  useEffect(() => {
    const hasFlashingLines = gameState.lineEffect.flashingLines.length > 0;
    const hasShaking = gameState.lineEffect.shaking;
    const hasParticles = gameState.lineEffect.particles.length > 0;

    // Cleanup previous timer if exists
    if (effectCleanupIdRef.current) {
      animationManager.unregisterAnimation(effectCleanupIdRef.current);
      effectCleanupIdRef.current = null;
    }

    // Setup unified cleanup timer for all effects
    if (hasFlashingLines || hasShaking || hasParticles) {
      const animationId = `line-effect-cleanup-${Date.now()}`;
      effectCleanupIdRef.current = animationId;

      let startTime = 0;
      let flashCleared = false;

      const cleanupCallback = (currentTime: number) => {
        if (startTime === 0) {
          startTime = currentTime;
        }

        const elapsed = currentTime - startTime;

        // Clear flash and shake after FLASH_DURATION
        if (!flashCleared && elapsed >= EFFECTS.FLASH_DURATION) {
          updateLineEffect({ flashingLines: [], shaking: false });
          flashCleared = true;
        }

        // Clear all effects after FLASH_DURATION + 100ms
        if (elapsed >= EFFECTS.FLASH_DURATION + 100) {
          clearLineEffect();
          animationManager.unregisterAnimation(animationId);
          effectCleanupIdRef.current = null;
        }
      };

      animationManager.registerAnimation(animationId, cleanupCallback, {
        fps: 60,
        priority: 'normal',
        autoStop: {
          maxDuration: EFFECTS.FLASH_DURATION + 200, // Safety timeout
        },
      });
    }

    return () => {
      // Cleanup on unmount or dependency change
      if (effectCleanupIdRef.current) {
        animationManager.unregisterAnimation(effectCleanupIdRef.current);
        effectCleanupIdRef.current = null;
      }
    };
  }, [
    gameState.lineEffect.flashingLines,
    gameState.lineEffect.shaking,
    gameState.lineEffect.particles,
    clearLineEffect,
    updateLineEffect,
  ]);

  // Piece control actions (React Compiler will optimize this)
  const pieceControlActions = {
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

  // Event handlers (React Compiler will optimize these)
  const handleReset = () => {
    onGameStart();
    resetGame();
  };

  const handleTogglePause = () => {
    togglePause();
  };

  const handleParticleUpdate = (particles: LineEffectState['particles']) => {
    updateParticles(particles);
  };

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
