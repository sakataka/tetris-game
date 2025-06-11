import { HighScore } from '../../types/tetris';

/**
 * Determine if the specified score qualifies for the high score list
 */
export function isHighScore(
  score: number,
  currentHighScores: readonly HighScore[],
  maxScores: number = 10
): boolean {
  if (currentHighScores.length < maxScores) {
    return true;
  }

  const lowestHighScore = currentHighScores[currentHighScores.length - 1];
  return score > lowestHighScore.score;
}

/**
 * Get the rank when a new score enters the high score list
 */
export function getHighScoreRank(
  score: number,
  currentHighScores: readonly HighScore[],
  maxScores: number = 10
): number | null {
  if (!isHighScore(score, currentHighScores, maxScores)) {
    return null;
  }

  for (let i = 0; i < currentHighScores.length; i++) {
    if (score > currentHighScores[i].score) {
      return i + 1;
    }
  }

  return currentHighScores.length + 1;
}

/**
 * Generate congratulatory message for high score achievement
 */
export function getHighScoreMessage(rank: number): string {
  const messages = {
    1: '🎉 New Record! Highest score ever!',
    2: '🥈 Excellent! 2nd place score!',
    3: '🥉 Congratulations! 3rd place!',
    default: `🏆 Top ${rank}! Amazing score!`,
  };

  if (rank <= 3) {
    return messages[rank as keyof typeof messages] || messages.default;
  }

  return messages.default;
}

/**
 * Generate unique ID for high score
 */
export function generateHighScoreId(): string {
  return `score_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Convert score data to high score format
 */
export function createHighScoreEntry(
  score: number,
  level: number,
  lines: number,
  playerName?: string
): HighScore {
  return {
    id: generateHighScoreId(),
    score,
    level,
    lines,
    date: Date.now(),
    playerName,
  };
}

/**
 * Validate high score data
 */
export function validateHighScore(highScore: HighScore): boolean {
  return (
    typeof highScore.id === 'string' &&
    typeof highScore.score === 'number' &&
    typeof highScore.level === 'number' &&
    typeof highScore.lines === 'number' &&
    typeof highScore.date === 'number' &&
    highScore.score >= 0 &&
    highScore.level >= 1 &&
    highScore.lines >= 0 &&
    highScore.date > 0 &&
    (!highScore.playerName || typeof highScore.playerName === 'string')
  );
}

/**
 * Sort high score list (descending by score)
 */
export function sortHighScores(highScores: readonly HighScore[]): HighScore[] {
  return [...highScores].sort((a, b) => {
    // First compare by score
    if (b.score !== a.score) {
      return b.score - a.score;
    }

    // If scores are same, compare by date (newer comes first)
    return b.date - a.date;
  });
}

/**
 * Validate player name
 */
export function validatePlayerName(name: string): boolean {
  return (
    name.length > 0 &&
    name.length <= 20 &&
    /^[a-zA-Z0-9_\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\u3400-\u4DBF]+$/.test(name)
  );
}

/**
 * Calculate high score statistics
 */
export function calculateHighScoreStats(highScores: readonly HighScore[]) {
  if (highScores.length === 0) {
    return {
      totalScores: 0,
      averageScore: 0,
      highestScore: 0,
      lowestScore: 0,
      averageLevel: 0,
      averageLines: 0,
    };
  }

  const totalScore = highScores.reduce((sum, score) => sum + score.score, 0);
  const totalLevel = highScores.reduce((sum, score) => sum + score.level, 0);
  const totalLines = highScores.reduce((sum, score) => sum + score.lines, 0);

  return {
    totalScores: highScores.length,
    averageScore: Math.floor(totalScore / highScores.length),
    highestScore: Math.max(...highScores.map((s) => s.score)),
    lowestScore: Math.min(...highScores.map((s) => s.score)),
    averageLevel: Math.floor(totalLevel / highScores.length),
    averageLines: Math.floor(totalLines / highScores.length),
  };
}
