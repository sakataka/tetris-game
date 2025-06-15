import { Suspense, lazy, memo } from 'react';
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

  // Use empty sessions array for now - can be extended later
  const sessions: GameSession[] = [];

  return (
    <div className={`max-w-4xl ${className}`}>
      <CyberCard title={t('statistics.title')} theme='purple' size='lg'>
        <Suspense
          fallback={
            <div className='space-y-4 p-4'>
              {/* Statistics Cards Skeleton */}
              <div className='grid grid-cols-2 gap-4'>
                <Skeleton className='h-16 bg-cyber-cyan-10 border border-cyber-cyan-30' />
                <Skeleton className='h-16 bg-cyber-cyan-10 border border-cyber-cyan-30' />
              </div>
              {/* Charts Skeleton */}
              <Skeleton className='h-32 bg-cyber-cyan-10 border border-cyber-cyan-30' />
              {/* High Scores Skeleton */}
              <div className='space-y-2'>
                <Skeleton className='h-8 bg-cyber-cyan-10 border border-cyber-cyan-30' />
                <Skeleton className='h-6 bg-cyber-cyan-10 border border-cyber-cyan-30' />
                <Skeleton className='h-6 bg-cyber-cyan-10 border border-cyber-cyan-30' />
              </div>
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
      </CyberCard>
    </div>
  );
});

export default StatisticsTabContent;
