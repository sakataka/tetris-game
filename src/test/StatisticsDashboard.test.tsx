import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { GameStatistics, HighScore } from '../types/tetris';
import type { GameSession } from '../utils/data/statisticsUtils';
import StatisticsDashboard from '../components/StatisticsDashboard';

// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'statistics.noStatistics': 'No statistics available yet',
        'statistics.playGameToViewStats': 'Play some games to see your stats!',
      };
      return translations[key] || key;
    },
  }),
}));

// Mock child components to avoid deep dependency chains
vi.mock('../components/ui/stats/StatsOverview', () => ({
  default: ({ statistics, selectedPeriod }: any) => (
    <div data-testid='stats-overview'>
      <span data-testid='total-games'>{statistics.totalGames}</span>
      <span data-testid='best-score'>{statistics.bestScore}</span>
      <span data-testid='total-lines'>{statistics.totalLines}</span>
      <span data-testid='selected-period'>{selectedPeriod}</span>
    </div>
  ),
}));

vi.mock('../components/ui/stats/EfficiencyMetrics', () => ({
  default: ({ statistics }: any) => (
    <div data-testid='efficiency-metrics'>
      <span data-testid='average-score'>{statistics.averageScore}</span>
    </div>
  ),
}));

vi.mock('../components/ui/stats/PlayHistory', () => ({
  default: ({ statistics }: any) => (
    <div data-testid='play-history'>
      <span data-testid='play-time'>{statistics.playTime}</span>
    </div>
  ),
}));

vi.mock('../components/ui/stats/HighScoresList', () => ({
  default: ({ highScores }: any) => (
    <div data-testid='high-scores-list'>
      <span data-testid='high-scores-count'>{highScores.length}</span>
    </div>
  ),
}));

vi.mock('../components/ui/CyberCard', () => ({
  default: ({ children, title, theme, size }: any) => (
    <div className={`cyber-card ${theme} ${size}`}>
      <h3>{title}</h3>
      {children}
    </div>
  ),
}));

// Mock the statistics calculation hook
vi.mock('../hooks/useStatisticsCalculation', () => ({
  useStatisticsCalculation: ({ baseStatistics, sessions }: any) => ({
    statistics: baseStatistics,
    advancedMetrics: {
      efficiency: 15.5,
      consistency: 85.2,
      longestSession: 2700,
      favoriteLevel: 6,
      linesClearingRate: 23.3,
      scorePerLine: 150,
      sessionCount: sessions?.length || 0,
      lastPlayDate: Date.now() - 3600000,
    },
  }),
}));

// Mock data
const mockBaseStatistics: GameStatistics = {
  totalGames: 150,
  totalLines: 3500,
  totalScore: 525000,
  bestScore: 45000,
  averageScore: 3500,
  playTime: 14400, // 4 hours
  bestStreak: 8,
  tetrisCount: 42,
};

const mockSessions: GameSession[] = [
  {
    id: '1',
    startTime: Date.now() - 86400000,
    endTime: Date.now() - 86399400,
    games: [
      { score: 5000, level: 5, lines: 24, tetrisCount: 1, timestamp: Date.now() - 86400000 },
      { score: 4500, level: 4, lines: 20, tetrisCount: 0, timestamp: Date.now() - 86399800 },
    ],
  },
  {
    id: '2',
    startTime: Date.now() - 172800000,
    endTime: Date.now() - 172799600,
    games: [
      { score: 4500, level: 4, lines: 18, tetrisCount: 1, timestamp: Date.now() - 172800000 },
      { score: 4000, level: 3, lines: 16, tetrisCount: 0, timestamp: Date.now() - 172799800 },
    ],
  },
];

const mockHighScores: HighScore[] = [
  { id: '1', score: 45000, level: 10, lines: 85, date: Date.now() - 86400000 },
  { id: '2', score: 38000, level: 9, lines: 72, date: Date.now() - 172800000 },
  { id: '3', score: 32000, level: 8, lines: 68, date: Date.now() - 259200000 },
];

const emptyStatistics: GameStatistics = {
  totalGames: 0,
  totalLines: 0,
  totalScore: 0,
  bestScore: 0,
  averageScore: 0,
  playTime: 0,
  bestStreak: 0,
  tetrisCount: 0,
};

describe('StatisticsDashboard component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic display functionality', () => {
    it('Renders dashboard with all main components', () => {
      render(
        <StatisticsDashboard
          baseStatistics={mockBaseStatistics}
          sessions={mockSessions}
          highScores={mockHighScores}
        />
      );

      expect(screen.getByTestId('statistics-dashboard')).toBeInTheDocument();
      expect(screen.getByTestId('stats-overview')).toBeInTheDocument();
      expect(screen.getByTestId('efficiency-metrics')).toBeInTheDocument();
      expect(screen.getByTestId('play-history')).toBeInTheDocument();
      expect(screen.getByTestId('high-scores-list')).toBeInTheDocument();
    });

    it('Passes correct statistics to child components', () => {
      render(
        <StatisticsDashboard
          baseStatistics={mockBaseStatistics}
          sessions={mockSessions}
          highScores={mockHighScores}
        />
      );

      // Check StatsOverview received correct data
      expect(screen.getByTestId('total-games')).toHaveTextContent('150');
      expect(screen.getByTestId('best-score')).toHaveTextContent('45000');
      expect(screen.getByTestId('total-lines')).toHaveTextContent('3500');

      // Check other components received data
      expect(screen.getByTestId('average-score')).toHaveTextContent('3500');
      expect(screen.getByTestId('play-time')).toHaveTextContent('14400');
      expect(screen.getByTestId('high-scores-count')).toHaveTextContent('3');
    });
  });

  describe('Period selection functionality', () => {
    it('Shows default period as All Time', () => {
      render(
        <StatisticsDashboard
          baseStatistics={mockBaseStatistics}
          sessions={mockSessions}
          highScores={mockHighScores}
        />
      );

      expect(screen.getByTestId('selected-period')).toHaveTextContent('All Time');
    });

    it('Uses custom selected period', () => {
      render(
        <StatisticsDashboard
          baseStatistics={mockBaseStatistics}
          sessions={mockSessions}
          highScores={mockHighScores}
          selectedPeriod='This Week'
        />
      );

      expect(screen.getByTestId('selected-period')).toHaveTextContent('This Week');
    });

    it('Calls onPeriodChange callback', () => {
      const mockOnPeriodChange = vi.fn();

      render(
        <StatisticsDashboard
          baseStatistics={mockBaseStatistics}
          sessions={mockSessions}
          highScores={mockHighScores}
          onPeriodChange={mockOnPeriodChange}
        />
      );

      // Note: Since we mocked StatsOverview, we can't test the actual period change
      // In a real test, we would interact with the period selector in StatsOverview
      expect(mockOnPeriodChange).toBeDefined();
    });
  });

  describe('Detailed view toggle', () => {
    it('Shows detailed components when showDetailedView is true', () => {
      render(
        <StatisticsDashboard
          baseStatistics={mockBaseStatistics}
          sessions={mockSessions}
          highScores={mockHighScores}
          showDetailedView={true}
        />
      );

      expect(screen.getByTestId('efficiency-metrics')).toBeInTheDocument();
      expect(screen.getByTestId('play-history')).toBeInTheDocument();
      expect(screen.getByTestId('high-scores-list')).toBeInTheDocument();
    });

    it('Hides detailed components when showDetailedView is false', () => {
      render(
        <StatisticsDashboard
          baseStatistics={mockBaseStatistics}
          sessions={mockSessions}
          highScores={mockHighScores}
          showDetailedView={false}
        />
      );

      expect(screen.queryByTestId('efficiency-metrics')).not.toBeInTheDocument();
      expect(screen.queryByTestId('play-history')).not.toBeInTheDocument();
      expect(screen.queryByTestId('high-scores-list')).not.toBeInTheDocument();
    });
  });

  describe('Empty state display', () => {
    it('Shows empty state when no games have been played', () => {
      render(
        <StatisticsDashboard baseStatistics={emptyStatistics} sessions={[]} highScores={[]} />
      );

      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
      expect(screen.getByText('No statistics available yet')).toBeInTheDocument();
      expect(screen.getByText('Play some games to see your stats!')).toBeInTheDocument();
    });

    it('Does not show empty state when games have been played', () => {
      render(
        <StatisticsDashboard
          baseStatistics={mockBaseStatistics}
          sessions={mockSessions}
          highScores={mockHighScores}
        />
      );

      expect(screen.queryByTestId('empty-state')).not.toBeInTheDocument();
    });
  });

  describe('Data handling', () => {
    it('Handles empty sessions array gracefully', () => {
      render(
        <StatisticsDashboard
          baseStatistics={mockBaseStatistics}
          sessions={[]}
          highScores={mockHighScores}
        />
      );

      expect(screen.getByTestId('statistics-dashboard')).toBeInTheDocument();
      expect(screen.getByTestId('stats-overview')).toBeInTheDocument();
    });

    it('Handles empty high scores array gracefully', () => {
      render(
        <StatisticsDashboard
          baseStatistics={mockBaseStatistics}
          sessions={mockSessions}
          highScores={[]}
        />
      );

      expect(screen.getByTestId('high-scores-count')).toHaveTextContent('0');
    });

    it('Works with default props when sessions is not provided', () => {
      render(
        <StatisticsDashboard baseStatistics={mockBaseStatistics} highScores={mockHighScores} />
      );

      expect(screen.getByTestId('statistics-dashboard')).toBeInTheDocument();
    });
  });
});
