/**
 * Statistics Overview Component
 * Displays main statistics and period selector
 */

import type React from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/utils/ui/cn';
import { TYPOGRAPHY } from '../../../constants/layout';
import { STATISTICS_PERIODS } from '../../../utils/data/StatisticsService';
import type { EnhancedStatistics } from '../../../utils/data/statisticsUtils';
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
    <CyberCard title={t('statistics.title')} theme='primary' size='lg'>
      <div className='flex justify-between items-center mb-4'>
        <span className='text-theme-foreground opacity-70'>{t('statistics.period.label')}</span>
        <Select value={selectedPeriod} onValueChange={onPeriodChange}>
          <SelectTrigger
            className={cn(
              'w-[140px] bg-theme-foreground/10 border-theme-foreground/30 text-theme-foreground',
              'hover:bg-theme-foreground/20 focus:ring-theme-foreground focus:border-theme-foreground',
              'data-[state=open]:border-theme-foreground',
              TYPOGRAPHY.SMALL_LABEL
            )}
            data-testid='period-selector'
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent className='bg-background border-theme-foreground/30'>
            {STATISTICS_PERIODS.map((period) => (
              <SelectItem
                key={period.label}
                value={period.label}
                className='text-foreground hover:bg-theme-foreground/20 focus:bg-theme-foreground/20 focus:text-theme-foreground'
              >
                {t(getTranslationKey(period.label))}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Main statistics grid */}
      <div className='grid grid-cols-2 gap-3' data-testid='main-stats'>
        <div className='bg-theme-foreground/10 p-3 rounded border border-theme-foreground/30'>
          <div className={`${TYPOGRAPHY.SMALL_LABEL} text-theme-foreground opacity-70 text-left`}>
            {t('statistics.totalGames')}
          </div>
          <div
            className={`${TYPOGRAPHY.STAT_VALUE} ${TYPOGRAPHY.TITLE_WEIGHT} text-theme-foreground text-right`}
          >
            {statistics.totalGames}
          </div>
        </div>

        <div className='bg-theme-foreground/10 p-3 rounded border border-theme-foreground/30'>
          <div className={`${TYPOGRAPHY.SMALL_LABEL} text-theme-foreground opacity-70 text-left`}>
            {t('statistics.bestScore')}
          </div>
          <div
            className={`${TYPOGRAPHY.STAT_VALUE} ${TYPOGRAPHY.TITLE_WEIGHT} text-theme-foreground text-right`}
          >
            {statistics.bestScore.toLocaleString()}
          </div>
        </div>

        <div className='bg-theme-foreground/10 p-3 rounded border border-theme-foreground/30'>
          <div className={`${TYPOGRAPHY.SMALL_LABEL} text-theme-foreground opacity-70 text-left`}>
            {t('statistics.totalLines')}
          </div>
          <div
            className={`${TYPOGRAPHY.STAT_VALUE} ${TYPOGRAPHY.TITLE_WEIGHT} text-theme-foreground text-right`}
          >
            {statistics.totalLines.toLocaleString()}
          </div>
        </div>

        <div className='bg-theme-foreground/10 p-3 rounded border border-theme-foreground/30'>
          <div className={`${TYPOGRAPHY.SMALL_LABEL} text-theme-foreground opacity-70 text-left`}>
            {t('statistics.playTime')}
          </div>
          <div
            className={`${TYPOGRAPHY.STAT_VALUE} ${TYPOGRAPHY.TITLE_WEIGHT} text-theme-foreground text-right`}
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
