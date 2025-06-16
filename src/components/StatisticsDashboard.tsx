import { cn } from '@/utils/ui/cn';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { TYPOGRAPHY } from '../constants/layout';
import type { GameStatistics, HighScore } from '../types/tetris';
import { STATISTICS_PERIODS, StatisticsService } from '../utils/data/StatisticsService';
import type { EnhancedStatistics, GameSession } from '../utils/data/statisticsUtils';
import CyberCard from './ui/CyberCard';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

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
  selectedPeriod,
  onPeriodChange = () => {},
  showDetailedView = true,
}) => {
  const { t } = useTranslation();

  // Calculate enhanced statistics using StatisticsService (React Compiler will optimize)
  const period = StatisticsService.validatePeriod(selectedPeriod || t('statistics.allTime'));
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
    <div data-testid='statistics-dashboard' className='space-y-6 max-w-4xl'>
      {/* Overview */}
      <CyberCard title={`📊 ${t('statistics.title')}`} theme='cyan' size='lg'>
        <div className='flex justify-between items-center mb-4'>
          <span className='text-gray-400'>{t('statistics.period.label')}</span>
          <Select value={selectedPeriod || ''} onValueChange={onPeriodChange}>
            <SelectTrigger
              className={cn(
                'w-[140px] bg-cyber-cyan-10 border-cyber-cyan-30 text-cyber-cyan',
                'hover:bg-cyber-cyan-20 focus:ring-cyber-cyan focus:border-cyber-cyan',
                'data-[state=open]:border-cyber-cyan',
                TYPOGRAPHY.SMALL_LABEL
              )}
              data-testid='period-selector'
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className='bg-background border-cyber-cyan-30'>
              {STATISTICS_PERIODS.map((period) => {
                // Map period labels to translation keys
                const getTranslationKey = (label: string) => {
                  switch (label) {
                    case 'Today':
                      return 'statistics.period.today';
                    case 'This Week':
                      return 'statistics.period.week';
                    case 'This Month':
                      return 'statistics.period.month';
                    case 'All Time':
                      return 'statistics.period.all';
                    default:
                      return 'statistics.period.all';
                  }
                };

                return (
                  <SelectItem
                    key={period.label}
                    value={period.label}
                    className='text-foreground hover:bg-cyber-cyan-20 focus:bg-cyber-cyan-20 focus:text-cyber-cyan'
                  >
                    {t(getTranslationKey(period.label))}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
        {/* Main statistics */}
        <div className='grid grid-cols-2 gap-3' data-testid='main-stats'>
          <div className='bg-cyber-cyan-10 p-3 rounded border border-cyber-cyan-30'>
            <div className={`${TYPOGRAPHY.SMALL_LABEL} text-gray-400 text-left`}>
              {t('statistics.totalGames')}
            </div>
            <div
              className={`${TYPOGRAPHY.STAT_VALUE} ${TYPOGRAPHY.TITLE_WEIGHT} text-cyan-400 text-right`}
            >
              {statistics.totalGames}
            </div>
          </div>
          <div className='bg-cyber-cyan-10 p-3 rounded border border-cyber-cyan-30'>
            <div className={`${TYPOGRAPHY.SMALL_LABEL} text-gray-400 text-left`}>
              {t('statistics.bestScore')}
            </div>
            <div
              className={`${TYPOGRAPHY.STAT_VALUE} ${TYPOGRAPHY.TITLE_WEIGHT} text-yellow-400 text-right`}
            >
              {statistics.bestScore.toLocaleString()}
            </div>
          </div>
          <div className='bg-cyber-cyan-10 p-3 rounded border border-cyber-cyan-30'>
            <div className={`${TYPOGRAPHY.SMALL_LABEL} text-gray-400 text-left`}>
              {t('statistics.totalLines')}
            </div>
            <div
              className={`${TYPOGRAPHY.STAT_VALUE} ${TYPOGRAPHY.TITLE_WEIGHT} text-cyan-400 text-right`}
            >
              {statistics.totalLines.toLocaleString()}
            </div>
          </div>
          <div className='bg-cyber-cyan-10 p-3 rounded border border-cyber-cyan-30'>
            <div className={`${TYPOGRAPHY.SMALL_LABEL} text-gray-400 text-left`}>
              {t('statistics.playTime')}
            </div>
            <div
              className={`${TYPOGRAPHY.STAT_VALUE} ${TYPOGRAPHY.TITLE_WEIGHT} text-cyan-400 text-right`}
            >
              {Math.floor(statistics.playTime / 3600)}h{' '}
              {Math.floor((statistics.playTime % 3600) / 60)}m
            </div>
          </div>
        </div>
      </CyberCard>

      {showDetailedView && (
        <>
          {/* Efficiency metrics */}
          <CyberCard title={`🎯 ${t('statistics.efficiency')}`} theme='cyan' size='md'>
            <div
              className={`grid grid-cols-2 gap-3 ${TYPOGRAPHY.SMALL_LABEL}`}
              data-testid='efficiency-stats'
            >
              <div className='flex justify-between items-center'>
                <span className='text-gray-400'>{t('statistics.efficiency')}</span>
                <span className={`text-cyan-400 ${TYPOGRAPHY.BODY_WEIGHT}`}>
                  {statistics.efficiency.toFixed(1)} LPM
                </span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-gray-400'>{t('statistics.consistency')}</span>
                <span className={`text-yellow-400 ${TYPOGRAPHY.BODY_WEIGHT}`}>
                  {statistics.consistency.toFixed(1)}%
                </span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-gray-400'>{t('statistics.metrics.scorePerLine')}</span>
                <span className={`text-cyan-400 ${TYPOGRAPHY.BODY_WEIGHT}`}>
                  {Math.round(statistics.scorePerLine)}
                </span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-gray-400'>{t('statistics.tetrisRate')}</span>
                <span className={`text-yellow-400 ${TYPOGRAPHY.BODY_WEIGHT}`}>
                  {advancedMetrics?.tetrisRate.toFixed(1) || '0.0'}%
                </span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-gray-400'>{t('statistics.averageScore')}</span>
                <span className={`text-yellow-400 ${TYPOGRAPHY.BODY_WEIGHT}`}>
                  {statistics.favoriteLevel}
                </span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-gray-400'>{t('statistics.playTime')}</span>
                <span className={`text-cyan-400 ${TYPOGRAPHY.BODY_WEIGHT}`}>
                  {advancedMetrics
                    ? `${Math.floor(advancedMetrics.averageGameDuration / 60)}m`
                    : '0m'}
                </span>
              </div>
            </div>
          </CyberCard>

          {/* Play history summary */}
          <CyberCard title={`📅 ${t('statistics.playTime')}`} theme='cyan' size='md'>
            <div
              className={`grid grid-cols-2 gap-3 ${TYPOGRAPHY.SMALL_LABEL}`}
              data-testid='play-history'
            >
              <div className='flex justify-between items-center'>
                <span className='text-gray-400'>{t('statistics.gamesPlayed')}</span>
                <span className={`text-cyan-400 ${TYPOGRAPHY.BODY_WEIGHT}`}>
                  {statistics.sessionCount}
                </span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-gray-400'>{t('statistics.bestScore')}</span>
                <span className={`text-cyan-400 ${TYPOGRAPHY.BODY_WEIGHT}`}>
                  {Math.floor(statistics.longestSession / 60)}m
                </span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-gray-400'>{t('statistics.gamesPlayed')}</span>
                <span className={`text-cyan-400 ${TYPOGRAPHY.BODY_WEIGHT}`}>
                  {advancedMetrics?.gamesPerSession.toFixed(1) || '0.0'}
                </span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-gray-400'>{t('statistics.efficiency')}</span>
                <span className={`text-cyan-400 ${TYPOGRAPHY.BODY_WEIGHT}`}>
                  {advancedMetrics
                    ? `${
                        (advancedMetrics.improvementTrend > 0 ? '+' : '') +
                        advancedMetrics.improvementTrend.toFixed(1)
                      }%`
                    : '0.0%'}
                </span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-gray-400'>{t('statistics.playTime')}</span>
                <span className={`text-cyan-400 ${TYPOGRAPHY.BODY_WEIGHT}`}>
                  {statistics.lastPlayDate > 0
                    ? `${Math.floor((Date.now() - statistics.lastPlayDate) / 3600000)}h ago`
                    : t('statistics.never')}
                </span>
              </div>
            </div>
          </CyberCard>

          {/* Recent high scores */}
          <CyberCard title={`🏆 ${t('statistics.highScores')}`} theme='cyan' size='md'>
            <div className='space-y-2' data-testid='recent-achievements'>
              {highScores.slice(0, 3).map((score, index) => {
                const getRankingBadgeStyle = (position: number) => {
                  switch (position) {
                    case 0:
                      return 'bg-yellow-500 text-black border-yellow-400';
                    case 1:
                      return 'bg-gray-400 text-black border-gray-300';
                    case 2:
                      return 'bg-orange-600 text-white border-orange-500';
                    default:
                      return 'bg-cyber-cyan-20 text-cyber-cyan border-cyber-cyan-30';
                  }
                };

                return (
                  <div
                    key={score.id}
                    className={`flex justify-between items-center gap-2 ${TYPOGRAPHY.SMALL_LABEL}`}
                  >
                    <Badge
                      variant='outline'
                      className={cn(
                        'font-mono font-bold min-w-[32px] justify-center',
                        getRankingBadgeStyle(index)
                      )}
                    >
                      #{index + 1}
                    </Badge>
                    <span className={`text-cyan-400 ${TYPOGRAPHY.BODY_WEIGHT} flex-1 text-right`}>
                      {score.score.toLocaleString()}
                    </span>
                    <Badge
                      variant='secondary'
                      className='bg-cyber-cyan-20 text-cyber-cyan border-cyber-cyan-30'
                    >
                      Lv{score.level}
                    </Badge>
                    <span className='text-gray-500 text-xs'>
                      {(() => {
                        const msAgo = Date.now() - score.date;
                        const daysAgo = Math.floor(msAgo / 86400000);
                        const hoursAgo = Math.floor(msAgo / 3600000);

                        if (daysAgo > 0) {
                          return t('statistics.daysAgo', { count: daysAgo });
                        }
                        if (hoursAgo > 0) {
                          return t('statistics.hoursAgo', { count: hoursAgo });
                        }
                        return t('statistics.hoursAgo', { count: 1 });
                      })()}
                    </span>
                  </div>
                );
              })}
              {highScores.length === 0 && (
                <div className={`text-gray-500 text-center py-0.5 ${TYPOGRAPHY.SMALL_LABEL}`}>
                  {t('statistics.noHighScores')}
                </div>
              )}
            </div>
          </CyberCard>
        </>
      )}

      {/* Empty state */}
      {statistics.totalGames === 0 && (
        <CyberCard title='📈 Get Started' theme='cyan' size='md'>
          <div className='text-center py-2' data-testid='empty-state'>
            <div className={`text-gray-500 ${TYPOGRAPHY.BODY_TEXT}`}>
              {t('statistics.noStatistics')}
            </div>
            <div className={`text-gray-600 ${TYPOGRAPHY.SMALL_LABEL} mt-1`}>
              {t('statistics.playGameToViewStats')}
            </div>
          </div>
        </CyberCard>
      )}
    </div>
  );
};

export default React.memo(StatisticsDashboard);
