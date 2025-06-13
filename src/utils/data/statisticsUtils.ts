import type { GameStatistics, HighScore } from '../../types/tetris';

// Extended statistics type definition
export interface EnhancedStatistics extends GameStatistics {
  readonly efficiency: number; // lines per minute
  readonly consistency: number; // score variance percentage
  readonly longestSession: number; // longest play time in seconds
  readonly favoriteLevel: number; // most common level reached
  readonly linesClearingRate: number; // lines per game average
  readonly scorePerLine: number; // average score per line
  readonly sessionCount: number; // number of play sessions
  readonly lastPlayDate: number; // timestamp of last game
}

export interface GameSession {
  readonly id: string;
  readonly startTime: number;
  readonly endTime: number;
  readonly games: SessionGame[];
}

export interface SessionGame {
  readonly score: number;
  readonly level: number;
  readonly lines: number;
  readonly tetrisCount: number;
  readonly timestamp: number;
}

export interface StatisticsPeriod {
  readonly label: string;
  readonly days: number;
}

export const STATISTICS_PERIODS: StatisticsPeriod[] = [
  { label: 'Today', days: 1 },
  { label: 'This Week', days: 7 },
  { label: 'This Month', days: 30 },
  { label: 'All Time', days: 0 },
];

/**
 * Calculate enhanced statistics from basic statistics
 */
export function calculateEnhancedStatistics(
  baseStats: GameStatistics,
  sessions: GameSession[] = [],
  highScores: readonly HighScore[] = []
): EnhancedStatistics {
  const efficiency = calculateEfficiency(baseStats.totalLines, baseStats.playTime);
  const consistency = calculateConsistency(highScores.map((hs) => hs.score));
  const sessionStats = calculateSessionStatistics(sessions);
  const favoriteLevel = findFavoriteLevel(sessions);

  return {
    ...baseStats,
    efficiency,
    consistency,
    longestSession: sessionStats.longestSession,
    favoriteLevel,
    linesClearingRate: baseStats.totalGames > 0 ? baseStats.totalLines / baseStats.totalGames : 0,
    scorePerLine: baseStats.totalLines > 0 ? baseStats.totalScore / baseStats.totalLines : 0,
    sessionCount: sessionStats.sessionCount,
    lastPlayDate: Math.max(...highScores.map((hs) => hs.date), 0),
  };
}

/**
 * Calculate efficiency (lines per minute)
 */
export function calculateEfficiency(totalLines: number, playTimeSeconds: number): number {
  if (playTimeSeconds === 0) return 0;
  const playTimeMinutes = playTimeSeconds / 60;
  return totalLines / playTimeMinutes;
}

/**
 * Calculate score consistency (variance-based)
 */
export function calculateConsistency(scores: number[]): number {
  if (scores.length === 0) return 0;

  const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  const variance = scores.reduce((sum, score) => sum + (score - average) ** 2, 0) / scores.length;
  const standardDeviation = Math.sqrt(variance);

  if (average === 0) return 0;

  const consistency = Math.max(0, 100 - (standardDeviation / average) * 100);
  return Math.round(consistency * 10) / 10; // Round to 1 decimal place
}

/**
 * Identify the most frequently reached level
 */
export function findFavoriteLevel(sessions: GameSession[]): number {
  if (sessions.length === 0) return 1;

  const games = sessions.flatMap((session) => session.games);
  if (games.length === 0) return 1;

  const levelCounts = games.reduce(
    (counts, game) => {
      counts[game.level] = (counts[game.level] || 0) + 1;
      return counts;
    },
    {} as Record<number, number>
  );

  const mostCommonLevel = Object.entries(levelCounts).sort(([, a], [, b]) => b - a)[0];

  return mostCommonLevel ? Number.parseInt(mostCommonLevel[0]) : 1;
}

/**
 * Calculate session statistics
 */
export function calculateSessionStatistics(sessions: GameSession[]): {
  sessionCount: number;
  longestSession: number;
  averageSessionTime: number;
  totalGames: number;
  gamesPerSession: number;
} {
  if (sessions.length === 0) {
    return {
      sessionCount: 0,
      longestSession: 0,
      averageSessionTime: 0,
      totalGames: 0,
      gamesPerSession: 0,
    };
  }

  const sessionDurations = sessions.map((session) => session.endTime - session.startTime);
  const totalPlayTime = sessionDurations.reduce((sum, duration) => sum + duration, 0);
  const longestSession = Math.max(...sessionDurations);
  const totalGames = sessions.reduce((total, session) => total + session.games.length, 0);

  return {
    sessionCount: sessions.length,
    longestSession,
    averageSessionTime: totalPlayTime / sessions.length,
    totalGames,
    gamesPerSession: totalGames / sessions.length,
  };
}

/**
 * Filter statistics by specified period
 */
export function filterStatisticsByPeriod(sessions: GameSession[], days: number): GameSession[] {
  if (days === 0) return sessions; // All time

  const cutoffTime = Date.now() - days * 24 * 60 * 60 * 1000;

  return sessions
    .map((session) => ({
      ...session,
      games: session.games.filter((game) => game.timestamp > cutoffTime),
    }))
    .filter((session) => session.games.length > 0);
}

/**
 * Calculate play time statistics
 */
export function calculatePlayTimeStatistics(sessions: GameSession[]): {
  totalPlayTime: number;
  averageSessionTime: number;
  longestSession: number;
} {
  if (sessions.length === 0) {
    return {
      totalPlayTime: 0,
      averageSessionTime: 0,
      longestSession: 0,
    };
  }

  const sessionDurations = sessions.map((session) => session.endTime - session.startTime);
  const totalPlayTime = sessionDurations.reduce((sum, duration) => sum + duration, 0);
  const longestSession = Math.max(...sessionDurations);

  return {
    totalPlayTime,
    averageSessionTime: totalPlayTime / sessions.length,
    longestSession,
  };
}

/**
 * Calculate Tetris-related statistics
 */
export function calculateTetrisStatistics(sessions: GameSession[]): {
  totalTetris: number;
  tetrisRate: number;
  tetrisPerGame: number;
} {
  const allGames = sessions.flatMap((session) => session.games);

  if (allGames.length === 0) {
    return {
      totalTetris: 0,
      tetrisRate: 0,
      tetrisPerGame: 0,
    };
  }

  const totalTetris = allGames.reduce((sum, game) => sum + game.tetrisCount, 0);
  const tetrisRate = (totalTetris / allGames.length) * 100;

  return {
    totalTetris,
    tetrisRate,
    tetrisPerGame: totalTetris / allGames.length,
  };
}

/**
 * Validate statistics data
 */
export function validateStatisticsData(stats: Partial<EnhancedStatistics>): boolean {
  const { totalGames, totalScore, efficiency, consistency } = stats;

  // Execute negative value check and consistency range check in single return statement
  return !(
    (totalGames !== undefined && totalGames < 0) ||
    (totalScore !== undefined && totalScore < 0) ||
    (efficiency !== undefined && efficiency < 0) ||
    (consistency !== undefined && (consistency < 0 || consistency > 100))
  );
}

/**
 * Format statistics data for display
 */
export function formatStatisticsForDisplay(stats: Partial<EnhancedStatistics>): {
  playTime: string;
  efficiency: string;
  consistency: string;
  scorePerLine: string;
  tetrisRate: string;
} {
  const playTimeHours = Math.floor((stats.playTime || 0) / 3600);
  const playTimeMinutes = Math.floor(((stats.playTime || 0) % 3600) / 60);

  return {
    playTime: `${playTimeHours}h ${playTimeMinutes}m`,
    efficiency: `${(stats.efficiency || 0).toFixed(1)} LPM`,
    consistency: `${(stats.consistency || 0).toFixed(1)}%`,
    scorePerLine: (stats.scorePerLine || 0).toFixed(1),
    tetrisRate: `${(((stats.tetrisCount || 0) / (stats.totalGames || 1)) * 100).toFixed(1)}%`,
  };
}

/**
 * Generate statistics summary text
 */
export function generateStatisticsSummary(
  currentStats: EnhancedStatistics,
  previousStats?: EnhancedStatistics
): {
  totalGames: number;
  bestScore: number;
  improvement: string;
  status: 'improving' | 'stable' | 'declining';
} {
  let improvement = '+0%';
  let status: 'improving' | 'stable' | 'declining' = 'stable';

  if (previousStats) {
    const scoreDiff = currentStats.bestScore - previousStats.bestScore;
    const scoreImprovement =
      previousStats.bestScore > 0 ? (scoreDiff / previousStats.bestScore) * 100 : 0;

    improvement =
      scoreImprovement > 0 ? `+${scoreImprovement.toFixed(1)}%` : `${scoreImprovement.toFixed(1)}%`;

    if (scoreImprovement > 5) {
      status = 'improving';
    } else if (scoreImprovement < -5) {
      status = 'declining';
    }
  }

  return {
    totalGames: currentStats.totalGames,
    bestScore: currentStats.bestScore,
    improvement,
    status,
  };
}
