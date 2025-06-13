'use client';

import { Suspense, lazy, memo } from 'react';
import { useTranslation } from 'react-i18next';

// Dynamically import statistics dashboard
const StatisticsDashboard = lazy(() => import('./StatisticsDashboard'));
import { useHighScores, useStatistics } from '../store/statisticsStore';
import type { GameSession } from '../utils/data/statisticsUtils';

interface StatisticsTabContentProps {
  className?: string;
}

const StatisticsTabContent = memo(function StatisticsTabContent({
  className = '',
}: StatisticsTabContentProps) {
  const { t } = useTranslation();
  const highScores = useHighScores();
  const statistics = useStatistics();

  // Use empty sessions array for now - can be extended later
  const sessions: GameSession[] = [];

  return (
    <div className={`space-y-1.5 ${className}`}>
      <Suspense
        fallback={
          <div className='flex items-center justify-center p-8'>
            <div className='text-cyan-300 text-sm'>{t('common.loading')}...</div>
          </div>
        }
      >
        <StatisticsDashboard
          baseStatistics={statistics}
          sessions={sessions}
          highScores={highScores}
          selectedPeriod={t('statistics.allTime')}
          showDetailedView={true}
        />
      </Suspense>
    </div>
  );
});

export default StatisticsTabContent;
