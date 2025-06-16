/**
 * High Scores List Component
 * Displays recent high scores with ranking
 */

import { cn } from '@/utils/ui/cn';
import type React from 'react';
import { useTranslation } from 'react-i18next';
import { TYPOGRAPHY } from '../../../constants/layout';
import type { HighScore } from '../../../types/tetris';
import CyberCard from '../CyberCard';
import { Badge } from '../badge';

interface HighScoresListProps {
  highScores: readonly HighScore[];
}

const HighScoresList: React.FC<HighScoresListProps> = ({ highScores }) => {
  const { t } = useTranslation();

  const getRankingBadgeStyle = (position: number) => {
    switch (position) {
      case 0:
        return 'bg-yellow-500 text-black border-yellow-400';
      case 1:
        return 'bg-gray-400 text-black border-gray-300';
      case 2:
        return 'bg-orange-600 text-white border-orange-500';
      default:
        return 'bg-cyber-cyan-20 text-cyber-cyan border-cyber-cyan-30';
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
    <CyberCard title={`🏆 ${t('statistics.highScores')}`} theme='cyan' size='md'>
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
            <span className={`text-cyan-400 ${TYPOGRAPHY.BODY_WEIGHT} flex-1 text-right`}>
              {score.score.toLocaleString()}
            </span>
            <Badge
              variant='secondary'
              className='bg-cyber-cyan-20 text-cyber-cyan border-cyber-cyan-30'
            >
              Lv{score.level}
            </Badge>
            <span className='text-gray-500 text-xs'>
              {formatTimeAgo(score.date)}
            </span>
          </div>
        ))}
        {highScores.length === 0 && (
          <div className={`text-gray-500 text-center py-0.5 ${TYPOGRAPHY.SMALL_LABEL}`}>
            {t('statistics.noHighScores')}
          </div>
        )}
      </div>
    </CyberCard>
  );
};

export default HighScoresList;