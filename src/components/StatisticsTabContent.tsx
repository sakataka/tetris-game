'use client';

import { memo, lazy, Suspense } from 'react';

// 統計ダッシュボードを動的インポート
const StatisticsDashboard = lazy(() => import('./StatisticsDashboard'));
import { useHighScores, useStatistics } from '../store/statisticsStore';
import { calculateEnhancedStatistics } from '../utils/data';

interface StatisticsTabContentProps {
  className?: string;
}

const StatisticsTabContent = memo(function StatisticsTabContent({
  className = '',
}: StatisticsTabContentProps) {
  const highScores = useHighScores();
  const statistics = useStatistics();

  // Calculate enhanced statistics
  const enhancedStats = calculateEnhancedStatistics(
    statistics,
    [], // We'll use playSessions later for more detailed tracking
    highScores
  );

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
          statistics={enhancedStats}
          highScores={highScores}
          showDetailedView={true}
        />
      </Suspense>
    </div>
  );
});

export default StatisticsTabContent;
