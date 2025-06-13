import React from 'react';
import { useTranslation } from 'react-i18next';
import { HighScore, GameStatistics } from '../types/tetris';
import { StatisticsService, STATISTICS_PERIODS } from '../utils/data/StatisticsService';
import { EnhancedStatistics, GameSession } from '../utils/data/statisticsUtils';
import { SPACING, TYPOGRAPHY } from '../constants/layout';

interface StatisticsDashboardProps {
  baseStatistics: GameStatistics;
  sessions?: GameSession[];
  highScores: readonly HighScore[];
  selectedPeriod?: string;
  onPeriodChange?: (period: string) => void;
  showDetailedView?: boolean;
}

const StatisticsDashboard: React.FC<StatisticsDashboardProps> = ({
  baseStatistics,
  sessions = [],
  highScores,
  selectedPeriod = 'All Time',
  onPeriodChange = () => {},
  showDetailedView = true,
}) => {
  const { t } = useTranslation();

  // Calculate enhanced statistics using StatisticsService (React Compiler will optimize)
  const period = StatisticsService.validatePeriod(selectedPeriod);
  const statistics: EnhancedStatistics = StatisticsService.calculatePeriodStatistics(
    baseStatistics,
    sessions,
    highScores,
    period
  );

  // Calculate advanced metrics for detailed view (React Compiler will optimize)
  const advancedMetrics = showDetailedView
    ? StatisticsService.calculateAdvancedMetrics(sessions, period)
    : null;
  return (
    <div
      data-testid='statistics-dashboard'
      className={`hologram-purple p-1 ${SPACING.PANEL_INTERNAL}`}
    >
      <div className='flex justify-between items-center'>
        <h2 className={`${TYPOGRAPHY.PANEL_TITLE} ${TYPOGRAPHY.TITLE_WEIGHT} text-cyber-purple`}>
          📊 {t('statistics.title')}
        </h2>
        <select
          value={selectedPeriod}
          onChange={(e) => onPeriodChange(e.target.value)}
          className={`bg-gray-800 text-cyan-400 border border-cyan-400 rounded px-2 py-0.5 ${TYPOGRAPHY.SMALL_LABEL}`}
          data-testid='period-selector'
        >
          {STATISTICS_PERIODS.map((period) => (
            <option key={period.label} value={period.label}>
              {t(`statistics.period.${period.label.toLowerCase().replace(/\s+/g, '')}`)}
            </option>
          ))}
        </select>
      </div>

      {/* Main statistics */}
      <div className='grid grid-cols-2 gap-1' data-testid='main-stats'>
        <div className='hologram-cyan p-1 rounded neon-border-cyan'>
          <div className={`${TYPOGRAPHY.SMALL_LABEL} text-gray-400`}>
            {t('statistics.totalGames')}
          </div>
          <div className={`${TYPOGRAPHY.STAT_VALUE} ${TYPOGRAPHY.TITLE_WEIGHT} text-cyan-400`}>
            {statistics.totalGames}
          </div>
        </div>
        <div className='hologram-cyan p-1 rounded neon-border-cyan'>
          <div className={`${TYPOGRAPHY.SMALL_LABEL} text-gray-400`}>
            {t('statistics.bestScore')}
          </div>
          <div className={`${TYPOGRAPHY.STAT_VALUE} ${TYPOGRAPHY.TITLE_WEIGHT} text-yellow-400`}>
            {statistics.bestScore.toLocaleString()}
          </div>
        </div>
        <div className='hologram-cyan p-1 rounded neon-border-cyan'>
          <div className={`${TYPOGRAPHY.SMALL_LABEL} text-gray-400`}>
            {t('statistics.totalLines')}
          </div>
          <div className={`${TYPOGRAPHY.STAT_VALUE} ${TYPOGRAPHY.TITLE_WEIGHT} text-green-400`}>
            {statistics.totalLines.toLocaleString()}
          </div>
        </div>
        <div className='hologram-cyan p-1 rounded neon-border-cyan'>
          <div className={`${TYPOGRAPHY.SMALL_LABEL} text-gray-400`}>
            {t('statistics.playTime')}
          </div>
          <div className={`${TYPOGRAPHY.STAT_VALUE} ${TYPOGRAPHY.TITLE_WEIGHT} text-purple-400`}>
            {Math.floor(statistics.playTime / 3600)}h{' '}
            {Math.floor((statistics.playTime % 3600) / 60)}m
          </div>
        </div>
      </div>

      {showDetailedView && (
        <>
          {/* Efficiency metrics */}
          <div
            className='hologram-yellow neon-border-yellow p-1 rounded'
            data-testid='efficiency-stats'
          >
            <h3
              className={`${TYPOGRAPHY.SECTION_HEADER} ${TYPOGRAPHY.TITLE_WEIGHT} text-yellow-400 ${SPACING.SECTION_TITLE_BOTTOM}`}
            >
              🎯 {t('statistics.efficiency')}
            </h3>
            <div className={`grid grid-cols-2 gap-0.5 ${TYPOGRAPHY.SMALL_LABEL}`}>
              <div>
                <span className='text-gray-400'>{t('statistics.efficiency')}: </span>
                <span className={`text-cyan-400 ${TYPOGRAPHY.BODY_WEIGHT}`}>
                  {statistics.efficiency.toFixed(1)} LPM
                </span>
              </div>
              <div>
                <span className='text-gray-400'>{t('statistics.consistency')}: </span>
                <span className={`text-green-400 ${TYPOGRAPHY.BODY_WEIGHT}`}>
                  {statistics.consistency.toFixed(1)}%
                </span>
              </div>
              <div>
                <span className='text-gray-400'>{t('statistics.metrics.scorePerLine')}: </span>
                <span className={`text-purple-400 ${TYPOGRAPHY.BODY_WEIGHT}`}>
                  {Math.round(statistics.scorePerLine)}
                </span>
              </div>
              <div>
                <span className='text-gray-400'>{t('statistics.tetrisRate')}: </span>
                <span className={`text-red-400 ${TYPOGRAPHY.BODY_WEIGHT}`}>
                  {advancedMetrics?.tetrisRate.toFixed(1) || '0.0'}%
                </span>
              </div>
              <div>
                <span className='text-gray-400'>{t('statistics.averageScore')}: </span>
                <span className={`text-yellow-400 ${TYPOGRAPHY.BODY_WEIGHT}`}>
                  {statistics.favoriteLevel}
                </span>
              </div>
              <div>
                <span className='text-gray-400'>{t('statistics.playTime')}: </span>
                <span className={`text-pink-400 ${TYPOGRAPHY.BODY_WEIGHT}`}>
                  {advancedMetrics
                    ? `${Math.floor(advancedMetrics.averageGameDuration / 60)}m`
                    : '0m'}
                </span>
              </div>
            </div>
          </div>

          {/* Play history summary */}
          <div className='hologram-cyan neon-border-cyan p-1 rounded' data-testid='play-history'>
            <h3
              className={`${TYPOGRAPHY.SECTION_HEADER} ${TYPOGRAPHY.TITLE_WEIGHT} text-cyan-400 ${SPACING.SECTION_TITLE_BOTTOM}`}
            >
              📅 {t('statistics.playTime')}
            </h3>
            <div className={`grid grid-cols-2 gap-0.5 ${TYPOGRAPHY.SMALL_LABEL}`}>
              <div>
                <span className='text-gray-400'>{t('statistics.gamesPlayed')}: </span>
                <span className={`text-cyan-400 ${TYPOGRAPHY.BODY_WEIGHT}`}>
                  {statistics.sessionCount}
                </span>
              </div>
              <div>
                <span className='text-gray-400'>{t('statistics.bestScore')}: </span>
                <span className={`text-purple-400 ${TYPOGRAPHY.BODY_WEIGHT}`}>
                  {Math.floor(statistics.longestSession / 60)}m
                </span>
              </div>
              <div>
                <span className='text-gray-400'>{t('statistics.gamesPlayed')}: </span>
                <span className={`text-green-400 ${TYPOGRAPHY.BODY_WEIGHT}`}>
                  {advancedMetrics?.gamesPerSession.toFixed(1) || '0.0'}
                </span>
              </div>
              <div>
                <span className='text-gray-400'>{t('statistics.efficiency')}: </span>
                <span className={`text-cyan-400 ${TYPOGRAPHY.BODY_WEIGHT}`}>
                  {advancedMetrics
                    ? (advancedMetrics.improvementTrend > 0 ? '+' : '') +
                      advancedMetrics.improvementTrend.toFixed(1) +
                      '%'
                    : '0.0%'}
                </span>
              </div>
              <div>
                <span className='text-gray-400'>{t('statistics.playTime')}: </span>
                <span className={`text-yellow-400 ${TYPOGRAPHY.BODY_WEIGHT}`}>
                  {statistics.lastPlayDate > 0
                    ? `${Math.floor((Date.now() - statistics.lastPlayDate) / 3600000)}h ago`
                    : 'Never'}
                </span>
              </div>
            </div>
          </div>

          {/* Recent high scores */}
          <div
            className='hologram-purple neon-border-purple p-1 rounded'
            data-testid='recent-achievements'
          >
            <h3
              className={`${TYPOGRAPHY.SECTION_HEADER} ${TYPOGRAPHY.TITLE_WEIGHT} text-purple-400 ${SPACING.SECTION_TITLE_BOTTOM}`}
            >
              🏆 {t('statistics.highScores')}
            </h3>
            <div className={SPACING.TIGHT}>
              {highScores.slice(0, 3).map((score, index) => (
                <div
                  key={score.id}
                  className={`flex justify-between items-center ${TYPOGRAPHY.SMALL_LABEL}`}
                >
                  <span className='text-gray-400'>#{index + 1}</span>
                  <span className={`text-cyan-400 ${TYPOGRAPHY.BODY_WEIGHT}`}>
                    {score.score.toLocaleString()}
                  </span>
                  <span className='text-purple-400'>Lv{score.level}</span>
                  <span className='text-gray-500'>
                    {(() => {
                      const msAgo = Date.now() - score.date;
                      const daysAgo = Math.floor(msAgo / 86400000);
                      const hoursAgo = Math.floor(msAgo / 3600000);

                      if (daysAgo > 0) {
                        return t('statistics.daysAgo', { count: daysAgo });
                      } else if (hoursAgo > 0) {
                        return t('statistics.hoursAgo', { count: hoursAgo });
                      } else {
                        return t('statistics.hoursAgo', { count: 1 });
                      }
                    })()}
                  </span>
                </div>
              ))}
              {highScores.length === 0 && (
                <div className={`text-gray-500 text-center py-0.5 ${TYPOGRAPHY.SMALL_LABEL}`}>
                  {t('statistics.noHighScores')}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Empty state */}
      {statistics.totalGames === 0 && (
        <div className='text-center py-2' data-testid='empty-state'>
          <div className={`text-gray-500 ${TYPOGRAPHY.BODY_TEXT}`}>
            {t('statistics.noStatistics')}
          </div>
          <div className={`text-gray-600 ${TYPOGRAPHY.SMALL_LABEL} mt-1`}>
            {t('statistics.playGameToViewStats')}
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(StatisticsDashboard);
