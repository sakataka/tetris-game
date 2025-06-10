import React from 'react';
import { HighScore } from '../types/tetris';
import { EnhancedStatistics, STATISTICS_PERIODS } from '../utils/data';

interface StatisticsDashboardProps {
  statistics: EnhancedStatistics;
  highScores: readonly HighScore[];
  selectedPeriod?: string;
  onPeriodChange?: (period: string) => void;
  showDetailedView?: boolean;
}

const StatisticsDashboard: React.FC<StatisticsDashboardProps> = ({
  statistics,
  highScores,
  selectedPeriod = 'All Time',
  onPeriodChange = () => {},
  showDetailedView = true,
}) => {
  return (
    <div data-testid='statistics-dashboard' className='hologram-purple p-6 space-y-6'>
      <div className='flex justify-between items-center'>
        <h2 className='responsive-text-xl font-bold text-cyber-purple'>📊 Statistics Dashboard</h2>
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

      {/* 主要統計 */}
      <div className='responsive-grid-stats' data-testid='main-stats'>
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
          {/* 効率指標 */}
          <div
            className='hologram-yellow neon-border-yellow p-4 rounded'
            data-testid='efficiency-stats'
          >
            <h3 className='responsive-text-lg font-bold text-yellow-400 mb-3'>
              🎯 Performance Metrics
            </h3>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm'>
              <div>
                <span className='text-gray-400'>Efficiency: </span>
                <span className='text-cyan-400 font-semibold'>
                  {statistics.efficiency.toFixed(1)} LPM
                </span>
              </div>
              <div>
                <span className='text-gray-400'>Consistency: </span>
                <span className='text-green-400 font-semibold'>
                  {statistics.consistency.toFixed(1)}%
                </span>
              </div>
              <div>
                <span className='text-gray-400'>Score/Line: </span>
                <span className='text-purple-400 font-semibold'>
                  {Math.round(statistics.scorePerLine)}
                </span>
              </div>
              <div>
                <span className='text-gray-400'>Tetris Rate: </span>
                <span className='text-red-400 font-semibold'>
                  {((statistics.tetrisCount / Math.max(statistics.totalGames, 1)) * 100).toFixed(1)}
                  %
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

          {/* プレイ履歴概要 */}
          <div className='hologram-cyan neon-border-cyan p-4 rounded' data-testid='play-history'>
            <h3 className='responsive-text-lg font-bold text-cyan-400 mb-3'>📅 Play History</h3>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm'>
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
                  {statistics.sessionCount > 0
                    ? (statistics.totalGames / statistics.sessionCount).toFixed(1)
                    : '0.0'}
                </span>
              </div>
              <div>
                <span className='text-gray-400'>Last Played: </span>
                <span className='text-yellow-400 font-semibold'>
                  {statistics.lastPlayDate > 0
                    ? `${Math.floor((Date.now() - statistics.lastPlayDate) / 3600000)}h ago`
                    : 'Never'}
                </span>
              </div>
            </div>
          </div>

          {/* 最近のハイスコア */}
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
                    {Math.floor((Date.now() - score.date) / 86400000)}d ago
                  </span>
                </div>
              ))}
              {highScores.length === 0 && (
                <div className='text-gray-500 text-center py-2'>No high scores yet</div>
              )}
            </div>
          </div>
        </>
      )}

      {/* 空の状態 */}
      {statistics.totalGames === 0 && (
        <div className='text-center py-8' data-testid='empty-state'>
          <div className='text-gray-500 text-lg'>No statistics available</div>
          <div className='text-gray-600 text-sm mt-2'>Play some games to see your stats!</div>
        </div>
      )}
    </div>
  );
};

export default React.memo(StatisticsDashboard);
