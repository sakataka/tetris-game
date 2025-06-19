/**
 * Efficiency Metrics Component
 * Displays efficiency and performance metrics
 */

import type React from 'react';
import { useTranslation } from 'react-i18next';
import CyberCard from '@/components/ui/CyberCard';
import { TYPOGRAPHY } from '@/constants/layout';
import type { EnhancedStatistics } from '@/utils/data/statisticsUtils';

interface EfficiencyMetricsProps {
  statistics: EnhancedStatistics;
  advancedMetrics?: {
    tetrisRate: number;
    averageGameDuration: number;
  } | null;
}

const EfficiencyMetrics: React.FC<EfficiencyMetricsProps> = ({ statistics, advancedMetrics }) => {
  const { t } = useTranslation();

  return (
    <CyberCard title={t('statistics.efficiency')} theme='primary' size='md'>
      <div
        className={`grid grid-cols-2 gap-3 ${TYPOGRAPHY.SMALL_LABEL}`}
        data-testid='efficiency-stats'
      >
        <div className='flex justify-between items-center'>
          <span className='text-theme-muted'>{t('statistics.efficiency')}</span>
          <span className={`text-theme-primary ${TYPOGRAPHY.BODY_WEIGHT}`}>
            {statistics.efficiency.toFixed(1)} LPM
          </span>
        </div>

        <div className='flex justify-between items-center'>
          <span className='text-theme-muted'>{t('statistics.consistency')}</span>
          <span className={`text-theme-primary ${TYPOGRAPHY.BODY_WEIGHT}`}>
            {statistics.consistency.toFixed(1)}%
          </span>
        </div>

        <div className='flex justify-between items-center'>
          <span className='text-theme-muted'>{t('statistics.metrics.scorePerLine')}</span>
          <span className={`text-theme-primary ${TYPOGRAPHY.BODY_WEIGHT}`}>
            {Math.round(statistics.scorePerLine)}
          </span>
        </div>

        <div className='flex justify-between items-center'>
          <span className='text-theme-muted'>{t('statistics.tetrisRate')}</span>
          <span className={`text-theme-primary ${TYPOGRAPHY.BODY_WEIGHT}`}>
            {advancedMetrics?.tetrisRate.toFixed(1) || '0.0'}%
          </span>
        </div>

        <div className='flex justify-between items-center'>
          <span className='text-theme-muted'>{t('statistics.averageScore')}</span>
          <span className={`text-theme-primary ${TYPOGRAPHY.BODY_WEIGHT}`}>
            {statistics.favoriteLevel}
          </span>
        </div>

        <div className='flex justify-between items-center'>
          <span className='text-theme-muted'>{t('statistics.playTime')}</span>
          <span className={`text-theme-primary ${TYPOGRAPHY.BODY_WEIGHT}`}>
            {advancedMetrics ? `${Math.floor(advancedMetrics.averageGameDuration / 60)}m` : '0m'}
          </span>
        </div>
      </div>
    </CyberCard>
  );
};

export default EfficiencyMetrics;
