/**
 * Statistics Dashboard - Refactored into Modular Components
 * Main container for all statistics displays
 */

import type React from 'react';
import { useTranslation } from 'react-i18next';
import { TYPOGRAPHY } from '../constants/layout';
import { useStatisticsCalculation } from '../hooks/useStatisticsCalculation';
import type { GameStatistics, HighScore } from '../types/tetris';
import type { GameSession } from '../utils/data/statisticsUtils';
import CyberCard from './ui/CyberCard';
import EfficiencyMetrics from './ui/stats/EfficiencyMetrics';
import HighScoresList from './ui/stats/HighScoresList';
import PlayHistory from './ui/stats/PlayHistory';
import StatsOverview from './ui/stats/StatsOverview';

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

  // Use custom hook for statistics calculation
  const { statistics, advancedMetrics } = useStatisticsCalculation({
    baseStatistics,
    sessions,
    highScores,
    selectedPeriod: selectedPeriod || 'All Time',
    showDetailedView,
  });

  return (
    <div data-testid='statistics-dashboard' className='space-y-6 max-w-4xl'>
      {/* Main Overview */}
      <StatsOverview
        statistics={statistics}
        selectedPeriod={selectedPeriod || 'All Time'}
        onPeriodChange={onPeriodChange}
      />

      {/* Detailed Views */}
      {showDetailedView && (
        <>
          <EfficiencyMetrics statistics={statistics} advancedMetrics={advancedMetrics} />

          <PlayHistory statistics={statistics} advancedMetrics={advancedMetrics} />

          <HighScoresList highScores={highScores} />
        </>
      )}

      {/* Empty State */}
      {statistics.totalGames === 0 && (
        <CyberCard title='📈 Get Started' theme='primary' size='md'>
          <div className='text-center py-2' data-testid='empty-state'>
            <div className={`text-theme-muted ${TYPOGRAPHY.BODY_TEXT}`}>
              {t('statistics.noStatistics')}
            </div>
            <div className={`text-theme-muted ${TYPOGRAPHY.SMALL_LABEL} mt-1`}>
              {t('statistics.playGameToViewStats')}
            </div>
          </div>
        </CyberCard>
      )}
    </div>
  );
};

export default StatisticsDashboard;
