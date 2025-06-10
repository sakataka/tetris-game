/**
 * Statistics Service - Unified statistics calculation and data processing
 *
 * Separates statistics calculation logic from UI display components
 * following Single Responsibility Principle and Service pattern.
 */

import { HighScore, GameStatistics } from '../../types/tetris';
import { EnhancedStatistics, GameSession, SessionGame, StatisticsPeriod } from './statisticsUtils';

// Period filtering configuration
export const STATISTICS_PERIODS: StatisticsPeriod[] = [
  { label: 'Today', days: 1 },
  { label: 'This Week', days: 7 },
  { label: 'This Month', days: 30 },
  { label: 'All Time', days: 0 },
];

/**
 * Period Filter - Handles time-based data filtering
 */
export class PeriodFilter {
  private static getPeriodStartTime(days: number): number {
    if (days === 0) return 0; // All time
    const now = Date.now();
    return now - days * 24 * 60 * 60 * 1000;
  }

  static filterHighScoresByPeriod(
    highScores: readonly HighScore[],
    period: StatisticsPeriod
  ): readonly HighScore[] {
    if (period.days === 0) return highScores;

    const startTime = this.getPeriodStartTime(period.days);
    return highScores.filter((score) => score.date >= startTime);
  }

  static filterSessionsByPeriod(sessions: GameSession[], period: StatisticsPeriod): GameSession[] {
    if (period.days === 0) return sessions;

    const startTime = this.getPeriodStartTime(period.days);
    return sessions.filter((session) => session.startTime >= startTime);
  }

  static filterGamesByPeriod(games: SessionGame[], period: StatisticsPeriod): SessionGame[] {
    if (period.days === 0) return games;

    const startTime = this.getPeriodStartTime(period.days);
    return games.filter((game) => game.timestamp >= startTime);
  }

  static getPeriodByLabel(label: string): StatisticsPeriod {
    return STATISTICS_PERIODS.find((p) => p.label === label) || STATISTICS_PERIODS[3];
  }
}

/**
 * Statistics Calculator - Handles all statistical calculations
 */
export class StatisticsCalculator {
  /**
   * Calculate efficiency (Lines Per Minute)
   */
  static calculateEfficiency(totalLines: number, playTimeSeconds: number): number {
    if (playTimeSeconds <= 0) return 0;
    const playTimeMinutes = playTimeSeconds / 60;
    return Math.round((totalLines / playTimeMinutes) * 100) / 100;
  }

  /**
   * Calculate score consistency (variance percentage)
   */
  static calculateConsistency(scores: number[]): number {
    if (scores.length <= 1) return 100;

    const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const variance =
      scores.reduce((sum, score) => sum + Math.pow(score - average, 2), 0) / scores.length;
    const standardDeviation = Math.sqrt(variance);

    if (average === 0) return 100;
    const consistency = Math.max(0, 100 - (standardDeviation / average) * 100);
    return Math.round(consistency * 100) / 100;
  }

  /**
   * Find most frequently reached level
   */
  static findFavoriteLevel(sessions: GameSession[]): number {
    const games = sessions.flatMap((session) => session.games);
    if (games.length === 0) return 1;

    const levelCounts = games.reduce(
      (counts, game) => {
        counts[game.level] = (counts[game.level] || 0) + 1;
        return counts;
      },
      {} as Record<number, number>
    );

    return parseInt(
      Object.keys(levelCounts).reduce((a, b) =>
        levelCounts[parseInt(a)] > levelCounts[parseInt(b)] ? a : b
      )
    );
  }

  /**
   * Calculate session-based statistics
   */
  static calculateSessionStatistics(sessions: GameSession[]): {
    longestSession: number;
    sessionCount: number;
    lastPlayDate: number;
    linesClearingRate: number;
    scorePerLine: number;
  } {
    if (sessions.length === 0) {
      return {
        longestSession: 0,
        sessionCount: 0,
        lastPlayDate: 0,
        linesClearingRate: 0,
        scorePerLine: 0,
      };
    }

    const longestSession = Math.max(...sessions.map((s) => s.endTime - s.startTime));
    const lastPlayDate = Math.max(...sessions.map((s) => s.endTime));

    const allGames = sessions.flatMap((session) => session.games);
    const totalLines = allGames.reduce((sum, game) => sum + game.lines, 0);
    const totalScore = allGames.reduce((sum, game) => sum + game.score, 0);

    const linesClearingRate = allGames.length > 0 ? totalLines / allGames.length : 0;
    const scorePerLine = totalLines > 0 ? totalScore / totalLines : 0;

    return {
      longestSession: Math.round(longestSession / 1000), // Convert to seconds
      sessionCount: sessions.length,
      lastPlayDate,
      linesClearingRate: Math.round(linesClearingRate * 100) / 100,
      scorePerLine: Math.round(scorePerLine * 100) / 100,
    };
  }

  /**
   * Calculate Tetris rate (4-line clears percentage)
   */
  static calculateTetrisRate(sessions: GameSession[]): number {
    const allGames = sessions.flatMap((session) => session.games);
    if (allGames.length === 0) return 0;

    const totalTetris = allGames.reduce((sum, game) => sum + game.tetrisCount, 0);
    const totalLines = allGames.reduce((sum, game) => sum + game.lines, 0);

    if (totalLines === 0) return 0;
    return Math.round(((totalTetris * 4) / totalLines) * 10000) / 100; // Percentage
  }

  /**
   * Calculate average game duration
   */
  static calculateAverageGameDuration(sessions: GameSession[]): number {
    const allGames = sessions.flatMap((session) => session.games);
    if (allGames.length === 0) return 0;

    // Estimate based on session data (simplified calculation)
    const totalSessionTime = sessions.reduce(
      (sum, session) => sum + (session.endTime - session.startTime),
      0
    );
    const totalGames = allGames.length;

    return Math.round(totalSessionTime / totalGames / 1000); // Convert to seconds
  }
}

/**
 * Statistics Service - Main service class for statistics operations
 */
export class StatisticsService {
  /**
   * Calculate enhanced statistics with all metrics
   */
  static calculateEnhancedStatistics(
    baseStats: GameStatistics,
    sessions: GameSession[] = [],
    highScores: readonly HighScore[] = []
  ): EnhancedStatistics {
    const sessionStats = StatisticsCalculator.calculateSessionStatistics(sessions);

    return {
      ...baseStats,
      efficiency: StatisticsCalculator.calculateEfficiency(
        baseStats.totalLines,
        baseStats.playTime
      ),
      consistency: StatisticsCalculator.calculateConsistency(highScores.map((hs) => hs.score)),
      longestSession: sessionStats.longestSession,
      favoriteLevel: StatisticsCalculator.findFavoriteLevel(sessions),
      linesClearingRate: sessionStats.linesClearingRate,
      scorePerLine: sessionStats.scorePerLine,
      sessionCount: sessionStats.sessionCount,
      lastPlayDate: sessionStats.lastPlayDate,
    };
  }

  /**
   * Calculate period-specific statistics
   */
  static calculatePeriodStatistics(
    baseStats: GameStatistics,
    sessions: GameSession[],
    highScores: readonly HighScore[],
    period: StatisticsPeriod
  ): EnhancedStatistics {
    const filteredSessions = PeriodFilter.filterSessionsByPeriod(sessions, period);
    const filteredHighScores = PeriodFilter.filterHighScoresByPeriod(highScores, period);

    // Calculate period-specific base stats
    const allGames = filteredSessions.flatMap((session) => session.games);
    const periodBaseStats: GameStatistics = {
      totalGames: allGames.length,
      totalScore: allGames.reduce((sum, game) => sum + game.score, 0),
      totalLines: allGames.reduce((sum, game) => sum + game.lines, 0),
      bestScore: allGames.length > 0 ? Math.max(...allGames.map((g) => g.score)) : 0,
      averageScore:
        allGames.length > 0
          ? allGames.reduce((sum, game) => sum + game.score, 0) / allGames.length
          : 0,
      playTime:
        filteredSessions.reduce((sum, session) => sum + (session.endTime - session.startTime), 0) /
        1000, // Convert to seconds
      bestStreak: 0, // TODO: Implement streak calculation
      tetrisCount: allGames.reduce((sum, game) => sum + game.tetrisCount, 0),
    };

    return this.calculateEnhancedStatistics(periodBaseStats, filteredSessions, filteredHighScores);
  }

  /**
   * Get available periods
   */
  static getAvailablePeriods(): StatisticsPeriod[] {
    return [...STATISTICS_PERIODS];
  }

  /**
   * Validate and normalize period selection
   */
  static validatePeriod(periodLabel: string): StatisticsPeriod {
    return PeriodFilter.getPeriodByLabel(periodLabel);
  }

  /**
   * Calculate advanced metrics for dashboard
   */
  static calculateAdvancedMetrics(
    sessions: GameSession[],
    period: StatisticsPeriod = STATISTICS_PERIODS[3] // All Time default
  ): {
    tetrisRate: number;
    averageGameDuration: number;
    gamesPerSession: number;
    improvementTrend: number;
  } {
    const filteredSessions = PeriodFilter.filterSessionsByPeriod(sessions, period);

    const tetrisRate = StatisticsCalculator.calculateTetrisRate(filteredSessions);
    const averageGameDuration = StatisticsCalculator.calculateAverageGameDuration(filteredSessions);

    const allGames = filteredSessions.flatMap((session) => session.games);
    const gamesPerSession =
      filteredSessions.length > 0 ? allGames.length / filteredSessions.length : 0;

    // Calculate improvement trend (simplified)
    const improvementTrend = this.calculateImprovementTrend(allGames);

    return {
      tetrisRate: Math.round(tetrisRate * 100) / 100,
      averageGameDuration,
      gamesPerSession: Math.round(gamesPerSession * 100) / 100,
      improvementTrend: Math.round(improvementTrend * 100) / 100,
    };
  }

  /**
   * Calculate improvement trend (score progression)
   */
  private static calculateImprovementTrend(games: SessionGame[]): number {
    if (games.length < 2) return 0;

    // Sort by timestamp and calculate trend
    const sortedGames = games.sort((a, b) => a.timestamp - b.timestamp);
    const halfPoint = Math.floor(sortedGames.length / 2);

    const firstHalf = sortedGames.slice(0, halfPoint);
    const secondHalf = sortedGames.slice(halfPoint);

    const firstHalfAvg = firstHalf.reduce((sum, game) => sum + game.score, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, game) => sum + game.score, 0) / secondHalf.length;

    if (firstHalfAvg === 0) return 0;
    return ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;
  }
}

// Export types for backward compatibility
export type {
  EnhancedStatistics,
  GameSession,
  SessionGame,
  StatisticsPeriod,
} from './statisticsUtils';

export default StatisticsService;
