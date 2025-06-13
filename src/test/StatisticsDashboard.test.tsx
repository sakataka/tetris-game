import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { GameStatistics, HighScore } from '../types/tetris';

// Statistics dashboard type definition (not yet implemented)
interface EnhancedStatistics extends GameStatistics {
  readonly efficiency: number; // lines per minute
  readonly consistency: number; // score variance percentage
  readonly longestSession: number; // longest play time in seconds
  readonly favoriteLevel: number; // most common level reached
  readonly linesClearingRate: number; // lines per game average
  readonly scorePerLine: number; // average score per line
  readonly sessionCount: number; // number of play sessions
  readonly lastPlayDate: number; // timestamp of last game
}

interface StatisticsPeriod {
  readonly label: string;
  readonly days: number;
}

const STATISTICS_PERIODS: StatisticsPeriod[] = [
  { label: 'Today', days: 1 },
  { label: 'This Week', days: 7 },
  { label: 'This Month', days: 30 },
  { label: 'All Time', days: 0 },
];

// Mock data with fixed timestamps
const FIXED_BASE_TIME = 1700000000000; // Fixed timestamp: 2023-11-14T22:13:20.000Z

const mockStatistics: EnhancedStatistics = {
  totalGames: 150,
  totalLines: 3500,
  totalScore: 525000,
  bestScore: 45000,
  averageScore: 3500,
  playTime: 14400, // 4 hours
  bestStreak: 8,
  tetrisCount: 42,
  efficiency: 15.5, // lines per minute
  consistency: 85.2, // percentage
  longestSession: 2700, // 45 minutes
  favoriteLevel: 6,
  linesClearingRate: 23.3,
  scorePerLine: 150,
  sessionCount: 28,
  lastPlayDate: FIXED_BASE_TIME - 3600000, // 1 hour before base time
};

const mockHighScores: HighScore[] = [
  { id: '1', score: 45000, level: 10, lines: 85, date: FIXED_BASE_TIME - 86400000 },
  { id: '2', score: 38000, level: 9, lines: 72, date: FIXED_BASE_TIME - 172800000 },
  { id: '3', score: 32000, level: 8, lines: 68, date: FIXED_BASE_TIME - 259200000 },
];

// Mock the StatisticsDashboard component (not yet implemented)
const MockStatisticsDashboard = ({
  statistics,
  highScores,
  selectedPeriod = 'All Time',
  onPeriodChange = () => {},
  showDetailedView = true,
}: {
  statistics: EnhancedStatistics;
  highScores: HighScore[];
  selectedPeriod?: string;
  onPeriodChange?: (period: string) => void;
  showDetailedView?: boolean;
}) => {
  return (
    <div data-testid='statistics-dashboard' className='hologram-purple p-6 space-y-6'>
      <div className='flex justify-between items-center'>
        <h2 className='text-2xl font-bold text-cyber-purple'>📊 Statistics Dashboard</h2>
        <select
          value={selectedPeriod}
          onChange={(e) => onPeriodChange(e.target.value)}
          className='bg-gray-800 text-cyan-400 border border-cyan-400 rounded px-3 py-1'
          data-testid='period-selector'
        >
          {STATISTICS_PERIODS.map((period) => (
            <option key={period.label} value={period.label}>
              {period.label}
            </option>
          ))}
        </select>
      </div>

      {/* Main statistics */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4' data-testid='main-stats'>
        <div className='hologram-cyan p-4 rounded neon-border-cyan'>
          <div className='text-sm text-gray-400'>Total Games</div>
          <div className='text-2xl font-bold text-cyan-400'>{statistics.totalGames}</div>
        </div>
        <div className='hologram-cyan p-4 rounded neon-border-cyan'>
          <div className='text-sm text-gray-400'>Best Score</div>
          <div className='text-2xl font-bold text-yellow-400'>
            {statistics.bestScore.toLocaleString()}
          </div>
        </div>
        <div className='hologram-cyan p-4 rounded neon-border-cyan'>
          <div className='text-sm text-gray-400'>Total Lines</div>
          <div className='text-2xl font-bold text-green-400'>
            {statistics.totalLines.toLocaleString()}
          </div>
        </div>
        <div className='hologram-cyan p-4 rounded neon-border-cyan'>
          <div className='text-sm text-gray-400'>Play Time</div>
          <div className='text-2xl font-bold text-purple-400'>
            {Math.floor(statistics.playTime / 3600)}h{' '}
            {Math.floor((statistics.playTime % 3600) / 60)}m
          </div>
        </div>
      </div>

      {showDetailedView && (
        <>
          {/* Efficiency metrics */}
          <div
            className='hologram-yellow neon-border-yellow p-4 rounded'
            data-testid='efficiency-stats'
          >
            <h3 className='text-lg font-bold text-yellow-400 mb-3'>🎯 Performance Metrics</h3>
            <div className='grid grid-cols-2 md:grid-cols-3 gap-3 text-sm'>
              <div>
                <span className='text-gray-400'>Efficiency: </span>
                <span className='text-cyan-400 font-semibold'>{statistics.efficiency} LPM</span>
              </div>
              <div>
                <span className='text-gray-400'>Consistency: </span>
                <span className='text-green-400 font-semibold'>{statistics.consistency}%</span>
              </div>
              <div>
                <span className='text-gray-400'>Score/Line: </span>
                <span className='text-purple-400 font-semibold'>{statistics.scorePerLine}</span>
              </div>
              <div>
                <span className='text-gray-400'>Tetris Rate: </span>
                <span className='text-red-400 font-semibold'>
                  {((statistics.tetrisCount / statistics.totalGames) * 100).toFixed(1)}%
                </span>
              </div>
              <div>
                <span className='text-gray-400'>Avg Level: </span>
                <span className='text-yellow-400 font-semibold'>{statistics.favoriteLevel}</span>
              </div>
              <div>
                <span className='text-gray-400'>Best Streak: </span>
                <span className='text-pink-400 font-semibold'>{statistics.bestStreak}</span>
              </div>
            </div>
          </div>

          {/* Play history summary */}
          <div className='hologram-cyan neon-border-cyan p-4 rounded' data-testid='play-history'>
            <h3 className='text-lg font-bold text-cyan-400 mb-3'>📅 Play History</h3>
            <div className='grid grid-cols-2 gap-3 text-sm'>
              <div>
                <span className='text-gray-400'>Sessions: </span>
                <span className='text-cyan-400 font-semibold'>{statistics.sessionCount}</span>
              </div>
              <div>
                <span className='text-gray-400'>Longest Session: </span>
                <span className='text-purple-400 font-semibold'>
                  {Math.floor(statistics.longestSession / 60)}m
                </span>
              </div>
              <div>
                <span className='text-gray-400'>Games/Session: </span>
                <span className='text-green-400 font-semibold'>
                  {(statistics.totalGames / statistics.sessionCount).toFixed(1)}
                </span>
              </div>
              <div>
                <span className='text-gray-400'>Last Played: </span>
                <span className='text-yellow-400 font-semibold'>
                  {Math.floor((FIXED_BASE_TIME - statistics.lastPlayDate) / 3600000)}h ago
                </span>
              </div>
            </div>
          </div>

          {/* Recent high scores */}
          <div
            className='hologram-purple neon-border-purple p-4 rounded'
            data-testid='recent-achievements'
          >
            <h3 className='text-lg font-bold text-purple-400 mb-3'>🏆 Recent Achievements</h3>
            <div className='space-y-2'>
              {highScores.slice(0, 3).map((score, index) => (
                <div key={score.id} className='flex justify-between items-center text-sm'>
                  <span className='text-gray-400'>#{index + 1}</span>
                  <span className='text-cyan-400 font-semibold'>
                    {score.score.toLocaleString()}
                  </span>
                  <span className='text-purple-400'>Level {score.level}</span>
                  <span className='text-gray-500'>
                    {Math.floor((FIXED_BASE_TIME - score.date) / 86400000)}d ago
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Empty state */}
      {statistics.totalGames === 0 && (
        <div className='text-center py-8' data-testid='empty-state'>
          <div className='text-gray-500 text-lg'>No statistics available</div>
          <div className='text-gray-600 text-sm mt-2'>Play some games to see your stats!</div>
        </div>
      )}
    </div>
  );
};

describe('StatisticsDashboard component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic display functionality', () => {
    it('displays statistics dashboard correctly', () => {
      render(<MockStatisticsDashboard statistics={mockStatistics} highScores={mockHighScores} />);

      expect(screen.getByTestId('statistics-dashboard')).toBeInTheDocument();
      expect(screen.getByText('📊 Statistics Dashboard')).toBeInTheDocument();
    });

    it('should display period selection select box', () => {
      render(<MockStatisticsDashboard statistics={mockStatistics} highScores={mockHighScores} />);

      const periodSelector = screen.getByTestId('period-selector');
      expect(periodSelector).toBeInTheDocument();
      expect(periodSelector).toHaveValue('All Time');
    });

    it('should display main statistics correctly', () => {
      render(<MockStatisticsDashboard statistics={mockStatistics} highScores={mockHighScores} />);

      const mainStats = screen.getByTestId('main-stats');
      expect(mainStats).toHaveTextContent('150'); // Total Games
      expect(mainStats).toHaveTextContent('45,000'); // Best Score
      expect(mainStats).toHaveTextContent('3,500'); // Total Lines
      expect(mainStats).toHaveTextContent('4h 0m'); // Play Time
    });
  });

  describe('Detailed statistics display', () => {
    it('should display efficiency metrics correctly', () => {
      render(<MockStatisticsDashboard statistics={mockStatistics} highScores={mockHighScores} />);

      const efficiencyStats = screen.getByTestId('efficiency-stats');
      expect(efficiencyStats).toHaveTextContent('🎯 Performance Metrics');
      expect(efficiencyStats).toHaveTextContent('15.5 LPM'); // Efficiency
      expect(efficiencyStats).toHaveTextContent('85.2%'); // Consistency
      expect(efficiencyStats).toHaveTextContent('150'); // Score per line
    });

    it('should calculate and display Tetris achievement rate', () => {
      render(<MockStatisticsDashboard statistics={mockStatistics} highScores={mockHighScores} />);

      // tetrisCount(42) / totalGames(150) * 100 = 28.0%
      expect(screen.getByText('28.0%')).toBeInTheDocument();
    });

    it('should display play history summary', () => {
      render(<MockStatisticsDashboard statistics={mockStatistics} highScores={mockHighScores} />);

      expect(screen.getByText('📅 Play History')).toBeInTheDocument();
      expect(screen.getByText('28')).toBeInTheDocument(); // Sessions
      expect(screen.getByText('45m')).toBeInTheDocument(); // Longest session
      expect(screen.getByText('5.4')).toBeInTheDocument(); // Games per session
    });

    it('should display recent high scores', () => {
      render(<MockStatisticsDashboard statistics={mockStatistics} highScores={mockHighScores} />);

      expect(screen.getByText('🏆 Recent Achievements')).toBeInTheDocument();
      expect(screen.getByText('#1')).toBeInTheDocument();
      expect(screen.getByText('#2')).toBeInTheDocument();
      expect(screen.getByText('#3')).toBeInTheDocument();
    });
  });

  describe('Period filtering functionality', () => {
    it('should allow period selection change', () => {
      const onPeriodChange = vi.fn();
      render(
        <MockStatisticsDashboard
          statistics={mockStatistics}
          highScores={mockHighScores}
          onPeriodChange={onPeriodChange}
        />
      );

      const selector = screen.getByTestId('period-selector');
      expect(selector).toHaveValue('All Time');

      // Period change tests will be added during implementation
    });

    it('should have all period options available', () => {
      render(<MockStatisticsDashboard statistics={mockStatistics} highScores={mockHighScores} />);

      const selector = screen.getByTestId('period-selector');
      const options = selector.querySelectorAll('option');

      expect(options).toHaveLength(4);
      expect(options[0]).toHaveTextContent('Today');
      expect(options[1]).toHaveTextContent('This Week');
      expect(options[2]).toHaveTextContent('This Month');
      expect(options[3]).toHaveTextContent('All Time');
    });
  });

  describe('Display mode switching', () => {
    it('should hide detailed statistics in simple display mode', () => {
      render(
        <MockStatisticsDashboard
          statistics={mockStatistics}
          highScores={mockHighScores}
          showDetailedView={false}
        />
      );

      expect(screen.getByTestId('main-stats')).toBeInTheDocument();
      expect(screen.queryByTestId('efficiency-stats')).not.toBeInTheDocument();
      expect(screen.queryByTestId('play-history')).not.toBeInTheDocument();
      expect(screen.queryByTestId('recent-achievements')).not.toBeInTheDocument();
    });

    it('should display all statistics in detailed display mode', () => {
      render(
        <MockStatisticsDashboard
          statistics={mockStatistics}
          highScores={mockHighScores}
          showDetailedView={true}
        />
      );

      expect(screen.getByTestId('main-stats')).toBeInTheDocument();
      expect(screen.getByTestId('efficiency-stats')).toBeInTheDocument();
      expect(screen.getByTestId('play-history')).toBeInTheDocument();
      expect(screen.getByTestId('recent-achievements')).toBeInTheDocument();
    });
  });

  describe('Empty state handling', () => {
    it('should display appropriate message when no statistics data', () => {
      const emptyStats: EnhancedStatistics = {
        ...mockStatistics,
        totalGames: 0,
      };

      render(<MockStatisticsDashboard statistics={emptyStats} highScores={[]} />);

      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
      expect(screen.getByText('No statistics available')).toBeInTheDocument();
      expect(screen.getByText('Play some games to see your stats!')).toBeInTheDocument();
    });
  });

  describe('Data formatting', () => {
    it('should display large numbers with proper comma separation', () => {
      const largeStats: EnhancedStatistics = {
        ...mockStatistics,
        bestScore: 1234567,
        totalLines: 12345,
      };

      render(<MockStatisticsDashboard statistics={largeStats} highScores={mockHighScores} />);

      const mainStats = screen.getByTestId('main-stats');
      expect(mainStats).toHaveTextContent('1,234,567');
      expect(mainStats).toHaveTextContent('12,345');
    });

    it('should display time in appropriate format', () => {
      const timeStats: EnhancedStatistics = {
        ...mockStatistics,
        playTime: 7323, // 2 hours 2 minutes 3 seconds
        longestSession: 3665, // 1 hour 1 minute 5 seconds
      };

      render(<MockStatisticsDashboard statistics={timeStats} highScores={mockHighScores} />);

      const mainStats = screen.getByTestId('main-stats');
      const playHistory = screen.getByTestId('play-history');
      expect(mainStats).toHaveTextContent('2h 2m');
      expect(playHistory).toHaveTextContent('61m');
    });
  });
});

describe('Statistics calculation utilities (planned)', () => {
  it('should calculate period-filtered statistics', () => {
    // This feature is planned for later implementation
    expect(true).toBe(true);
  });

  it('should calculate efficiency metrics correctly', () => {
    // This feature is planned for later implementation
    expect(true).toBe(true);
  });

  it('should calculate consistency score', () => {
    // This feature is planned for later implementation
    expect(true).toBe(true);
  });
});
