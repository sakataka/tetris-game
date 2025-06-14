'use client';

import { useCallback } from 'react';
import { useGameState, useResetGame, useTogglePause } from '../store/gameStateStore';
import { useSession } from './useSession';

/**
 * Game buttons hook for GameButtonsPanel
 * Provides game state and actions needed for game control buttons
 * Includes session management integration
 */
export function useGameButtons() {
  const gameState = useGameState();
  const resetGame = useResetGame();
  const togglePause = useTogglePause();
  const { onGameStart } = useSession();

  // Extract required state
  const gameOver = gameState.gameOver;
  const isPaused = gameState.isPaused;

  // Action handlers
  const handleTogglePause = useCallback(() => {
    togglePause();
  }, [togglePause]);

  const handleReset = useCallback(() => {
    // Follow the same pattern as GameStateController
    // First trigger game start event for session tracking
    onGameStart();
    // Then reset the actual game state
    resetGame();
  }, [onGameStart, resetGame]);

  return {
    gameOver,
    isPaused,
    onTogglePause: handleTogglePause,
    onReset: handleReset,
  };
}
