/**
 * High Scores List Component
 * Displays recent high scores with ranking
 */

import type React from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/utils/ui/cn';
import { TYPOGRAPHY } from '../../../constants/layout';
import type { HighScore } from '../../../types/tetris';
import { Badge } from '../badge';
import CyberCard from '../CyberCard';

interface HighScoresListProps {
  highScores: readonly HighScore[];
}

const HighScoresList: React.FC<HighScoresListProps> = ({ highScores }) => {
  const { t } = useTranslation();

  const getRankingBadgeStyle = (position: number) => {
    switch (position) {
      case 0:
        return 'bg-theme-warning text-black border-theme-warning';
      case 1:
        return 'bg-theme-muted text-black border-theme-muted';
      case 2:
        return 'bg-theme-accent text-white border-theme-accent';
      default:
        return 'bg-theme-primary/20 text-theme-primary border-theme-primary/30';
    }
  };

  const formatTimeAgo = (date: number) => {
    const msAgo = Date.now() - date;
    const daysAgo = Math.floor(msAgo / 86400000);
    const hoursAgo = Math.floor(msAgo / 3600000);

    if (daysAgo > 0) {
      return t('statistics.daysAgo', { count: daysAgo });
    }
    if (hoursAgo > 0) {
      return t('statistics.hoursAgo', { count: hoursAgo });
    }
    return t('statistics.hoursAgo', { count: 1 });
  };

  return (
    <CyberCard title={t('statistics.highScores')} theme='primary' size='md'>
      <div className='space-y-2' data-testid='recent-achievements'>
        {highScores.slice(0, 3).map((score, index) => (
          <div
            key={score.id}
            className={`flex justify-between items-center gap-2 ${TYPOGRAPHY.SMALL_LABEL}`}
          >
            <Badge
              variant='outline'
              className={cn(
                'font-mono font-bold min-w-[32px] justify-center',
                getRankingBadgeStyle(index)
              )}
            >
              #{index + 1}
            </Badge>
            <span className={`text-theme-success ${TYPOGRAPHY.BODY_WEIGHT} flex-1 text-right`}>
              {score.score.toLocaleString()}
            </span>
            <Badge
              variant='secondary'
              className='bg-theme-primary/20 text-theme-primary border-theme-primary/30'
            >
              Lv{score.level}
            </Badge>
            <span className='text-theme-muted text-xs'>{formatTimeAgo(score.date)}</span>
          </div>
        ))}
        {highScores.length === 0 && (
          <div className={`text-theme-muted text-center py-0.5 ${TYPOGRAPHY.SMALL_LABEL}`}>
            {t('statistics.noHighScores')}
          </div>
        )}
      </div>
    </CyberCard>
  );
};

export default HighScoresList;
