'use client';

import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { GAME_UI_SIZES, SPACING, TYPOGRAPHY } from '../constants/layout';
import type { Tetromino } from '../types/tetris';
import CyberCard from './ui/CyberCard';

interface CombinedStatsNextPanelProps {
  score: number;
  level: number;
  lines: number;
  nextPiece: Tetromino | null;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

const CombinedStatsNextPanel = memo(function CombinedStatsNextPanel({
  score,
  level,
  lines,
  nextPiece,
  size = 'xs',
}: CombinedStatsNextPanelProps) {
  const { t } = useTranslation();

  const cellSize =
    size === 'xs' ? 'w-2 h-2' : size === 'sm' ? 'w-3 h-3' : GAME_UI_SIZES.NEXT_PIECE.CELL;
  const containerSize =
    size === 'xs' ? 'w-8 h-8' : size === 'sm' ? 'w-12 h-12' : GAME_UI_SIZES.NEXT_PIECE.CONTAINER;

  return (
    <CyberCard
      title={`${t('panels.scoreData')} & ${t('game.nextPiece')}`.toUpperCase()}
      theme='cyan'
      size={size}
    >
      <div className='grid grid-cols-2 gap-2'>
        {/* Score Information */}
        <div className={SPACING.TIGHT}>
          <div className='flex justify-between items-center'>
            <span className={`text-gray-300 ${TYPOGRAPHY.SMALL_LABEL}`}>{t('game.score')}</span>
            <span className={`font-mono ${TYPOGRAPHY.STAT_VALUE} text-yellow-400 font-bold`}>
              {score.toLocaleString()}
            </span>
          </div>
          <div className='flex justify-between items-center'>
            <span className={`text-gray-300 ${TYPOGRAPHY.SMALL_LABEL}`}>{t('game.level')}</span>
            <span className={`font-mono ${TYPOGRAPHY.STAT_VALUE} text-green-400 font-bold`}>
              {level}
            </span>
          </div>
          <div className='flex justify-between items-center'>
            <span className={`text-gray-300 ${TYPOGRAPHY.SMALL_LABEL}`}>{t('game.lines')}</span>
            <span className={`font-mono ${TYPOGRAPHY.STAT_VALUE} text-blue-400 font-bold`}>
              {lines}
            </span>
          </div>
        </div>

        {/* Next Piece Preview */}
        <div className='flex flex-col items-center justify-center'>
          <div className={`${TYPOGRAPHY.SMALL_LABEL} text-gray-400 mb-1`}>
            {t('game.nextPiece')}
          </div>
          <div className='grid gap-0 w-fit p-1 bg-black/30 rounded border border-purple-400/30'>
            {nextPiece ? (
              nextPiece.shape.map((row, y) => (
                <div key={`next-piece-row-${y}`} className='flex'>
                  {row.map((cell, x) => (
                    <div
                      key={`${y}-${x}`}
                      className={`${cellSize} border border-gray-600/50 relative ${
                        cell ? 'shadow-[0_0_5px_rgba(255,255,255,0.3)]' : 'bg-transparent'
                      }`}
                      style={{
                        backgroundColor: cell ? nextPiece.color : 'transparent',
                      }}
                    >
                      {cell === 1 && (
                        <div className='absolute inset-0 bg-current opacity-20 blur-sm' />
                      )}
                    </div>
                  ))}
                </div>
              ))
            ) : (
              <div className={`${containerSize} bg-gray-700/50 rounded border border-gray-500`} />
            )}
          </div>
        </div>
      </div>
    </CyberCard>
  );
});

export default CombinedStatsNextPanel;
