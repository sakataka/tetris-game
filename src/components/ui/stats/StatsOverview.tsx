/**
 * Statistics Overview Component
 * Displays main statistics and period selector
 */

import { cn } from '@/utils/ui/cn';
import type React from 'react';
import { useTranslation } from 'react-i18next';
import { TYPOGRAPHY } from '../../../constants/layout';
import type { EnhancedStatistics } from '../../../utils/data/statisticsUtils';
import { STATISTICS_PERIODS } from '../../../utils/data/StatisticsService';
import CyberCard from '../CyberCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../select';

interface StatsOverviewProps {
  statistics: EnhancedStatistics;
  selectedPeriod: string;
  onPeriodChange?: (period: string) => void;
}

const StatsOverview: React.FC<StatsOverviewProps> = ({
  statistics,
  selectedPeriod,
  onPeriodChange = () => {},
}) => {
  const { t } = useTranslation();

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
    <CyberCard title={`📊 ${t('statistics.title')}`} theme='cyan' size='lg'>
      <div className='flex justify-between items-center mb-4'>
        <span className='text-gray-400'>{t('statistics.period.label')}</span>
        <Select value={selectedPeriod} onValueChange={onPeriodChange}>
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
            {STATISTICS_PERIODS.map((period) => (
              <SelectItem
                key={period.label}
                value={period.label}
                className='text-foreground hover:bg-cyber-cyan-20 focus:bg-cyber-cyan-20 focus:text-cyber-cyan'
              >
                {t(getTranslationKey(period.label))}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Main statistics grid */}
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
  );
};

export default StatsOverview;