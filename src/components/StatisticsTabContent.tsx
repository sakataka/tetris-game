import { Suspense, lazy, memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CyberCard from './ui/CyberCard';
import { Skeleton } from './ui/skeleton';

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

  // Period selection state
  const [selectedPeriod, setSelectedPeriod] = useState<string>('All Time');

  // Use empty sessions array for now - can be extended later
  const sessions: GameSession[] = [];

  // Handle period change
  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
  };

  return (
    <div className={`max-w-4xl ${className}`}>
      <CyberCard title={t('statistics.title')} theme='primary' size='lg'>
        <Suspense
          fallback={
            <div className='space-y-4 p-4'>
              {/* Statistics Cards Skeleton */}
              <div className='grid grid-cols-2 gap-4'>
                <Skeleton className='h-16 bg-theme-primary/10 border border-theme-primary/30' />
                <Skeleton className='h-16 bg-theme-primary/10 border border-theme-primary/30' />
              </div>
              {/* Charts Skeleton */}
              <Skeleton className='h-32 bg-theme-primary/10 border border-theme-primary/30' />
              {/* High Scores Skeleton */}
              <div className='space-y-2'>
                <Skeleton className='h-8 bg-theme-primary/10 border border-theme-primary/30' />
                <Skeleton className='h-6 bg-theme-primary/10 border border-theme-primary/30' />
                <Skeleton className='h-6 bg-theme-primary/10 border border-theme-primary/30' />
              </div>
            </div>
          }
        >
          <StatisticsDashboard
            baseStatistics={statistics}
            sessions={sessions}
            highScores={highScores}
            selectedPeriod={selectedPeriod}
            onPeriodChange={handlePeriodChange}
            showDetailedView={true}
          />
        </Suspense>
      </CyberCard>
    </div>
  );
});

export default StatisticsTabContent;
