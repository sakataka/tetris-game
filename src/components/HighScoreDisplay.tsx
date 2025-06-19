import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { SPACING, TYPOGRAPHY } from '@/constants/layout';
import type { HighScore } from '@/types/tetris';
import { cn } from '@/utils/ui/cn';
import { Badge } from './ui/badge';
import CyberCard from './ui/CyberCard';

interface HighScoreDisplayProps {
  highScores: readonly HighScore[];
  showRank?: boolean;
  maxDisplay?: number;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

const HighScoreDisplay = memo(function HighScoreDisplay({
  highScores,
  showRank = true,
  maxDisplay = 10,
  className = '',
  size = 'md',
}: HighScoreDisplayProps) {
  const { t, i18n } = useTranslation();
  const displayScores = highScores.slice(0, maxDisplay);

  const getRankingBadgeStyle = (position: number) => {
    switch (position) {
      case 0:
        return 'bg-theme-foreground/20 text-theme-foreground border-theme-foreground/30';
      case 1:
        return 'bg-theme-foreground/20 text-theme-foreground border-theme-foreground/30';
      case 2:
        return 'bg-theme-foreground/20 text-theme-foreground border-theme-foreground/30';
      default:
        return 'bg-theme-foreground/20 text-theme-foreground border-theme-foreground/30';
    }
  };

  return (
    <CyberCard
      title={t('statistics.highScores')}
      theme='primary'
      size={size}
      className={className}
      data-testid='high-score-display'
    >
      <div className={SPACING.PANEL_INTERNAL}>
        {displayScores.map((score, index) => (
          <div
            key={score.id}
            className='flex justify-between items-center p-1 rounded'
            data-testid={`high-score-item-${index}`}
          >
            <div className='flex items-center gap-1'>
              {showRank && (
                <Badge
                  variant='outline'
                  className={cn(
                    'font-mono font-bold min-w-[32px] justify-center',
                    getRankingBadgeStyle(index)
                  )}
                >
                  #{index + 1}
                </Badge>
              )}
              <div>
                <div
                  className={`${TYPOGRAPHY.TITLE_WEIGHT} text-theme-foreground ${TYPOGRAPHY.BODY_TEXT}`}
                >
                  {score.score.toLocaleString()}
                </div>
                <div className={`${TYPOGRAPHY.SMALL_LABEL} text-theme-foreground opacity-70`}>
                  {t('game.levelPrefix')}
                  {score.level}
                </div>
              </div>
            </div>

            <div className='text-right'>
              <div className={`${TYPOGRAPHY.SMALL_LABEL} text-theme-muted`}>
                {new Date(score.date).toLocaleDateString(
                  i18n.language === 'ja' ? 'ja-JP' : 'en-US'
                )}
              </div>
            </div>
          </div>
        ))}

        {highScores.length === 0 && (
          <div
            className={`text-center text-theme-muted py-8 ${TYPOGRAPHY.BODY_TEXT}`}
            data-testid='no-scores-message'
          >
            {t('statistics.noHighScores')}
          </div>
        )}
      </div>
    </CyberCard>
  );
});

export default HighScoreDisplay;
