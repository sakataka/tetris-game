/**
 * Unified high score management hook
 *
 * Composed of specialized hooks for maintainability:
 * - useGameEndDetection: automatic game over detection and processing
 * - useHighScoreUtils: high score utility functions and manual operations
 */

import type { GameState, SoundKey } from '../types/tetris';
import { useGameEndDetection } from './useGameEndDetection';
import { useHighScoreUtils } from './useHighScoreUtils';

interface UseHighScoreManagerProps {
  gameState: GameState;
  playSound?: (soundType: SoundKey) => void;
}

export function useHighScoreManager({ gameState, playSound }: UseHighScoreManagerProps) {
  // Game end detection and processing hook
  const { processGameEnd, handleGameReset, isGameEndProcessed } = useGameEndDetection(
    gameState,
    playSound
  );

  // High score utility functions hook
  const {
    checkIsHighScore,
    getScoreRank,
    getCurrentHighScore,
    getLowestHighScore,
    manualSaveHighScore,
    getHighScores,
    getStatistics,
  } = useHighScoreUtils();

  return {
    // High score determination functions
    checkIsHighScore,
    getScoreRank,
    getCurrentHighScore,
    getLowestHighScore,

    // Manual save function
    manualSaveHighScore,

    // Getters for current high scores and statistics
    getHighScores,
    getStatistics,

    // Game end processing functions
    processGameEnd,
    handleGameReset,

    // Processing state
    isGameEndProcessed,
  };
}
