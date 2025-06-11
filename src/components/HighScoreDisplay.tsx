'use client';

import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { HighScore } from '../types/tetris';

interface HighScoreDisplayProps {
  highScores: readonly HighScore[];
  showRank?: boolean;
  maxDisplay?: number;
  className?: string;
}

const HighScoreDisplay = memo(function HighScoreDisplay({
  highScores,
  showRank = true,
  maxDisplay = 10,
  className = '',
}: HighScoreDisplayProps) {
  const { t, i18n } = useTranslation();
  const displayScores = highScores.slice(0, maxDisplay);

  return (
    <div data-testid='high-score-display' className={`hologram-cyan p-4 ${className}`}>
      <h3 className='text-xl font-bold mb-4 text-cyber-cyan'>🏆 {t('statistics.highScores')}</h3>

      <div className='space-y-2'>
        {displayScores.map((score, index) => (
          <div
            key={score.id}
            className='flex justify-between items-center p-2 rounded neon-border-cyan'
            data-testid={`high-score-item-${index}`}
          >
            <div className='flex items-center gap-2'>
              {showRank && <span className='text-cyber-yellow font-bold w-8'>#{index + 1}</span>}
              <div>
                <div className='font-bold text-cyber-cyan'>{score.score.toLocaleString()}</div>
                <div className='text-sm text-gray-400'>
                  {t('game.level')} {score.level} • {score.lines} {t('game.lines').toLowerCase()}
                </div>
              </div>
            </div>

            <div className='text-right'>
              {score.playerName && (
                <div className='text-sm text-cyber-purple font-semibold'>{score.playerName}</div>
              )}
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
