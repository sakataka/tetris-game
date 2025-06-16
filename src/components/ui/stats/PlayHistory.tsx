/**
 * Play History Component
 * Displays play history and session statistics
 */

import type React from 'react';
import { useTranslation } from 'react-i18next';
import { TYPOGRAPHY } from '../../../constants/layout';
import type { EnhancedStatistics } from '../../../utils/data/statisticsUtils';
import CyberCard from '../CyberCard';

interface PlayHistoryProps {
  statistics: EnhancedStatistics;
  advancedMetrics?: {
    gamesPerSession: number;
    improvementTrend: number;
  } | null;
}

const PlayHistory: React.FC<PlayHistoryProps> = ({
  statistics,
  advancedMetrics,
}) => {
  const { t } = useTranslation();

  return (
    <CyberCard title={`📅 ${t('statistics.playTime')}`} theme='accent' size='md'>
      <div
        className={`grid grid-cols-2 gap-3 ${TYPOGRAPHY.SMALL_LABEL}`}
        data-testid='play-history'
      >
        <div className='flex justify-between items-center'>
          <span className='text-gray-400'>{t('statistics.gamesPlayed')}</span>
          <span className={`text-theme-accent ${TYPOGRAPHY.BODY_WEIGHT}`}>
            {statistics.sessionCount}
          </span>
        </div>

        <div className='flex justify-between items-center'>
          <span className='text-gray-400'>{t('statistics.bestScore')}</span>
          <span className={`text-theme-accent ${TYPOGRAPHY.BODY_WEIGHT}`}>
            {Math.floor(statistics.longestSession / 60)}m
          </span>
        </div>

        <div className='flex justify-between items-center'>
          <span className='text-gray-400'>{t('statistics.gamesPlayed')}</span>
          <span className={`text-theme-accent ${TYPOGRAPHY.BODY_WEIGHT}`}>
            {advancedMetrics?.gamesPerSession.toFixed(1) || '0.0'}
          </span>
        </div>

        <div className='flex justify-between items-center'>
          <span className='text-gray-400'>{t('statistics.efficiency')}</span>
          <span className={`text-theme-accent ${TYPOGRAPHY.BODY_WEIGHT}`}>
            {advancedMetrics
              ? `${
                  (advancedMetrics.improvementTrend > 0 ? '+' : '') +
                  advancedMetrics.improvementTrend.toFixed(1)
                }%`
              : '0.0%'}
          </span>
        </div>

        <div className='flex justify-between items-center'>
          <span className='text-gray-400'>{t('statistics.playTime')}</span>
          <span className={`text-theme-accent ${TYPOGRAPHY.BODY_WEIGHT}`}>
            {statistics.lastPlayDate > 0
              ? `${Math.floor((Date.now() - statistics.lastPlayDate) / 3600000)}h ago`
              : t('statistics.never')}
          </span>
        </div>
      </div>
    </CyberCard>
  );
};

export default PlayHistory;