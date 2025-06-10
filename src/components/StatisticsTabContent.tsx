'use client';

import { memo, lazy, Suspense } from 'react';

// Dynamically import statistics dashboard
const StatisticsDashboard = lazy(() => import('./StatisticsDashboard'));
import { useHighScores, useStatistics } from '../store/statisticsStore';
import { GameSession } from '../utils/data/statisticsUtils';

interface StatisticsTabContentProps {
  className?: string;
}

const StatisticsTabContent = memo(function StatisticsTabContent({
  className = '',
}: StatisticsTabContentProps) {
  const highScores = useHighScores();
  const statistics = useStatistics();

  // Use empty sessions array for now - can be extended later
  const sessions: GameSession[] = [];

  return (
    <div className={className}>
      <Suspense
        fallback={
          <div className='flex items-center justify-center p-8'>
            <div className='text-cyan-300 text-sm'>統計データを読み込み中...</div>
          </div>
        }
      >
        <StatisticsDashboard
          baseStatistics={statistics}
          sessions={sessions}
          highScores={highScores}
          showDetailedView={true}
        />
      </Suspense>
    </div>
  );
});

export default StatisticsTabContent;
