import { useCallback } from 'react';
import { useStatisticsStore, useAddHighScore } from '../store/statisticsStore';
import type { HighScore, GameStatistics } from '../types/tetris';
import { isHighScore, getHighScoreRank, createHighScoreEntry } from '../utils/game';

export interface HighScoreUtilsAPI {
  // High score determination functions
  checkIsHighScore: (score: number) => boolean;
  getScoreRank: (score: number) => number | null;
  getCurrentHighScore: () => number;
  getLowestHighScore: () => number;

  // Manual save function
  manualSaveHighScore: (
    score: number,
    level: number,
    lines: number,
    playerName?: string
  ) => HighScore;

  // Getters for current high scores and statistics
  getHighScores: () => readonly HighScore[];
  getStatistics: () => GameStatistics;
}

/**
 * High score utility functions
 *
 * Single responsibility: Provide utility functions for high score checking,
 * ranking, and manual high score management.
 */
export function useHighScoreUtils(): HighScoreUtilsAPI {
  const addHighScore = useAddHighScore();

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
    return highScores.length > 0 ? (highScores[0]?.score ?? 0) : 0;
  }, []);

  const getLowestHighScore = useCallback(() => {
    const { highScores } = useStatisticsStore.getState();
    return highScores.length > 0 ? (highScores[highScores.length - 1]?.score ?? 0) : 0;
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

  // Getters for current state
  const getHighScores = useCallback(() => {
    return useStatisticsStore.getState().highScores;
  }, []);

  const getStatistics = useCallback(() => {
    return useStatisticsStore.getState().statistics;
  }, []);

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
  };
}
