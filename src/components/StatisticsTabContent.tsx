import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHighScores, useStatistics } from '@/store/statisticsStore';
import type { GameSession } from '@/utils/data/statisticsUtils';
import StatisticsDashboard from './StatisticsDashboard';
import CyberCard from './ui/CyberCard';

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
        <StatisticsDashboard
          baseStatistics={statistics}
          sessions={sessions}
          highScores={highScores}
          selectedPeriod={selectedPeriod}
          onPeriodChange={handlePeriodChange}
          showDetailedView={true}
        />
      </CyberCard>
    </div>
  );
});

export default StatisticsTabContent;
