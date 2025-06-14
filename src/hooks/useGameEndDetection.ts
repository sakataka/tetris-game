import { useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useAddHighScore, useStatisticsStore, useUpdateStatistics } from '../store/statisticsStore';
import type { GameState, SoundKey } from '../types/tetris';
import {
  createHighScoreEntry,
  getHighScoreMessage,
  getHighScoreRank,
  isHighScore,
} from '../utils/game';

interface HighScoreResult {
  isNewHighScore: boolean;
  rank?: number;
  message?: string;
}

export interface GameEndDetectionAPI {
  processGameEnd: (finalScore: number, level: number, lines: number) => HighScoreResult;
  handleGameReset: () => void;
  isGameEndProcessed: boolean;
}

/**
 * Game end detection and high score processing
 *
 * Single responsibility: Automatically detect game over state changes
 * and process high score registration with sound effects.
 */
export function useGameEndDetection(
  gameState: GameState,
  playSound?: (soundType: SoundKey) => void
): GameEndDetectionAPI {
  const addHighScore = useAddHighScore();
  const updateStatistics = useUpdateStatistics();
  const previousGameOverRef = useRef(false);
  const gameEndProcessedRef = useRef(false);

  // Process when game ends and handle high score registration
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

        if (rank) {
          const message = getHighScoreMessage(rank);

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

          // Show toast notification for high score achievement
          const rankEmoji = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '🏆';
          toast.success(`${rankEmoji} ${message}`, {
            description: `Score: ${finalScore.toLocaleString()} | Level: ${level} | Lines: ${lines}`,
            duration: 5000,
          });

          return {
            isNewHighScore: true,
            rank,
            message,
          };
        }
      }

      return { isNewHighScore: false };
    },
    [addHighScore, updateStatistics, playSound]
  );

  // Process when game is reset
  const handleGameReset = useCallback(() => {
    gameEndProcessedRef.current = false;
  }, []);

  // Monitor game state changes for automatic detection
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

  return {
    processGameEnd,
    handleGameReset,
    isGameEndProcessed: gameEndProcessedRef.current,
  };
}
