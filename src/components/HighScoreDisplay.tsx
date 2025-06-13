'use client';

import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { SPACING, TYPOGRAPHY } from '../constants/layout';
import type { HighScore } from '../types/tetris';
import PanelBase from './ui/PanelBase';

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

  return (
    <PanelBase
      title={`🏆 ${t('statistics.highScores')}`}
      theme='cyan'
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
                <span
                  className={`text-cyber-yellow ${TYPOGRAPHY.TITLE_WEIGHT} w-6 ${TYPOGRAPHY.BODY_TEXT}`}
                >
                  #{index + 1}
                </span>
              )}
              <div>
                <div
                  className={`${TYPOGRAPHY.TITLE_WEIGHT} text-cyber-cyan ${TYPOGRAPHY.BODY_TEXT}`}
                >
                  {score.score.toLocaleString()}
                </div>
                <div className={`${TYPOGRAPHY.SMALL_LABEL} text-gray-400`}>
                  {t('game.levelPrefix')}
                  {score.level}
                </div>
              </div>
            </div>

            <div className='text-right'>
              <div className={`${TYPOGRAPHY.SMALL_LABEL} text-gray-500`}>
                {new Date(score.date).toLocaleDateString(
                  i18n.language === 'ja' ? 'ja-JP' : 'en-US'
                )}
              </div>
            </div>
          </div>
        ))}

        {highScores.length === 0 && (
          <div
            className={`text-center text-gray-500 py-8 ${TYPOGRAPHY.BODY_TEXT}`}
            data-testid='no-scores-message'
          >
            {t('statistics.noHighScores')}
          </div>
        )}
      </div>
    </PanelBase>
  );
});

export default HighScoreDisplay;
