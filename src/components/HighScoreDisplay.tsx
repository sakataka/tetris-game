'use client';

import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { HighScore } from '../types/tetris';

interface HighScoreDisplayProps {
  highScores: readonly HighScore[];
  showRank?: boolean;
  maxDisplay?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
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

  const padding = size === 'sm' ? 'p-2' : 'p-4';
  const titleSize = size === 'sm' ? 'text-sm' : 'text-xl';
  const titleMargin = size === 'sm' ? 'mb-2' : 'mb-4';

  return (
    <div data-testid='high-score-display' className={`hologram-cyan ${padding} ${className}`}>
      <h3 className={`${titleSize} font-bold ${titleMargin} text-cyber-cyan`}>
        🏆 {t('statistics.highScores')}
      </h3>

      <div className='space-y-1'>
        {displayScores.map((score, index) => (
          <div
            key={score.id}
            className='flex justify-between items-center p-1 rounded'
            data-testid={`high-score-item-${index}`}
          >
            <div className='flex items-center gap-1'>
              {showRank && (
                <span className='text-cyber-yellow font-bold w-6 text-xs'>#{index + 1}</span>
              )}
              <div>
                <div className='font-bold text-cyber-cyan text-xs'>
                  {score.score.toLocaleString()}
                </div>
                <div className='text-xs text-gray-400'>Lv{score.level}</div>
              </div>
            </div>

            <div className='text-right'>
              <div className='text-xs text-gray-500'>
                {new Date(score.date).toLocaleDateString(
                  i18n.language === 'ja' ? 'ja-JP' : 'en-US'
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {highScores.length === 0 && (
        <div className='text-center text-gray-500 py-8' data-testid='no-scores-message'>
          {t('statistics.noHighScores')}
        </div>
      )}
    </div>
  );
});

export default HighScoreDisplay;
