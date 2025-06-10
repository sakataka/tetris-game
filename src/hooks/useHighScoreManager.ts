import { useCallback, useEffect, useRef } from 'react';
import { useStatisticsStore, useAddHighScore, useUpdateStatistics } from '../store/statisticsStore';
import { GameState, SoundKey } from '../types/tetris';
import {
  isHighScore,
  getHighScoreRank,
  getHighScoreMessage,
  createHighScoreEntry,
} from '../utils/game';

interface UseHighScoreManagerProps {
  gameState: GameState;
  playSound?: (soundType: SoundKey) => void;
}

interface HighScoreResult {
  isNewHighScore: boolean;
  rank?: number;
  message?: string;
}

export function useHighScoreManager({ gameState, playSound }: UseHighScoreManagerProps) {
  const addHighScore = useAddHighScore();
  const updateStatistics = useUpdateStatistics();
  const previousGameOverRef = useRef(false);
  const gameEndProcessedRef = useRef(false);

  // Detect game end and execute high score processing
  const processGameEnd = useCallback(
    (finalScore: number, level: number, lines: number): HighScoreResult => {
      // Skip if already processed
      if (gameEndProcessedRef.current) {
        return { isNewHighScore: false };
      }

      gameEndProcessedRef.current = true;

      // Get current state from store
      const currentState = useStatisticsStore.getState();
      const { highScores, statistics } = currentState;

      // Update statistics
      const newStats = {
        totalGames: statistics.totalGames + 1,
        totalScore: statistics.totalScore + finalScore,
        totalLines: statistics.totalLines + lines,
        playTime: statistics.playTime + Date.now(), // Simple time calculation (actual implementation should record start time)
      };

      // Count Tetris bonus (4-line simultaneous clear detection requires separate implementation)
      updateStatistics(newStats);

      // High score determination
      if (isHighScore(finalScore, highScores)) {
        const rank = getHighScoreRank(finalScore, highScores);
        const message = rank ? getHighScoreMessage(rank) : '';

        // Create and save high score entry
        const highScoreEntry = createHighScoreEntry(finalScore, level, lines);
        addHighScore(highScoreEntry);

        // Play sound effects
        if (playSound) {
          if (rank === 1) {
            playSound('tetris'); // Special sound for 1st place
          } else {
            playSound('lineClear'); // For other high scores
          }
        }

        return {
          isNewHighScore: true,
          rank: rank || undefined,
          message,
        };
      }

      return { isNewHighScore: false };
    },
    [addHighScore, updateStatistics, playSound]
  );

  // Process when game is reset
  const handleGameReset = useCallback(() => {
    gameEndProcessedRef.current = false;
  }, []);

  // Monitor game state changes
  useEffect(() => {
    const isGameOver = gameState.gameOver;
    const wasGameOver = previousGameOverRef.current;

    // Detect the moment when game ends
    if (isGameOver && !wasGameOver && !gameEndProcessedRef.current) {
      processGameEnd(gameState.score, gameState.level, gameState.lines);
    }

    // When game is reset
    if (!isGameOver && wasGameOver) {
      handleGameReset();
    }

    previousGameOverRef.current = isGameOver;
  }, [
    gameState.gameOver,
    gameState.score,
    gameState.level,
    gameState.lines,
    processGameEnd,
    handleGameReset,
  ]);

  // High score related utility functions
  const checkIsHighScore = useCallback((score: number) => {
    const { highScores } = useStatisticsStore.getState();
    return isHighScore(score, highScores);
  }, []);

  const getScoreRank = useCallback((score: number) => {
    const { highScores } = useStatisticsStore.getState();
    return getHighScoreRank(score, highScores);
  }, []);

  const getCurrentHighScore = useCallback(() => {
    const { highScores } = useStatisticsStore.getState();
    return highScores.length > 0 ? highScores[0].score : 0;
  }, []);

  const getLowestHighScore = useCallback(() => {
    const { highScores } = useStatisticsStore.getState();
    return highScores.length > 0 ? highScores[highScores.length - 1].score : 0;
  }, []);

  // Function to manually save high score (for testing)
  const manualSaveHighScore = useCallback(
    (score: number, level: number, lines: number, playerName?: string) => {
      const highScoreEntry = createHighScoreEntry(score, level, lines, playerName);
      addHighScore(highScoreEntry);
      return highScoreEntry;
    },
    [addHighScore]
  );

  return {
    // High score determination function
    checkIsHighScore,
    getScoreRank,
    getCurrentHighScore,
    getLowestHighScore,

    // Manual save function
    manualSaveHighScore,

    // Getters for current high scores and statistics
    getHighScores: () => useStatisticsStore.getState().highScores,
    getStatistics: () => useStatisticsStore.getState().statistics,

    // Processing state
    isGameEndProcessed: gameEndProcessedRef.current,
  };
}
