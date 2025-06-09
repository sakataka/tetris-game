'use client';

import { memo } from 'react';
import StatisticsDashboard from './StatisticsDashboard';
import { useHighScores, useStatistics } from '../store/statisticsStore';
import { calculateEnhancedStatistics } from '../utils/statisticsUtils';

interface StatisticsTabContentProps {
  className?: string;
}

const StatisticsTabContent = memo(function StatisticsTabContent({
  className = ''
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
      <StatisticsDashboard 
        statistics={enhancedStats}
        highScores={highScores}
        showDetailedView={true}
      />
    </div>
  );
});

export default StatisticsTabContent;