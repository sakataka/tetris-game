import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { GAME_UI_SIZES, SPACING, TYPOGRAPHY } from '../constants/layout';
import type { Tetromino } from '../types/tetris';
import CyberCard from './ui/CyberCard';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';

interface CombinedStatsNextPanelProps {
  score: number;
  level: number;
  lines: number;
  nextPiece: Tetromino | null;
  gameOver?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

const CombinedStatsNextPanel = memo(function CombinedStatsNextPanel({
  score,
  level,
  lines,
  nextPiece,
  gameOver = false,
  size = 'xs',
}: CombinedStatsNextPanelProps) {
  const { t } = useTranslation();

  const cellSize =
    size === 'xs' ? 'w-2 h-2' : size === 'sm' ? 'w-3 h-3' : GAME_UI_SIZES.NEXT_PIECE.CELL;
  const containerSize =
    size === 'xs' ? 'w-8 h-8' : size === 'sm' ? 'w-12 h-12' : GAME_UI_SIZES.NEXT_PIECE.CONTAINER;

  // Game status badge - only for game over
  const getGameStatusBadge = () => {
    return (
      <Badge
        variant='destructive'
        className='bg-theme-error/20 text-theme-error border-theme-error/50 animate-pulse'
      >
        {t('game.gameOver')}
      </Badge>
    );
  };

  return (
    <CyberCard
      title={`${t('panels.scoreDataUpper')} & ${t('game.nextPieceUpper')}`}
      theme='primary'
      size={size}
    >
      {/* Game Status Badge - Show only for game over */}
      {gameOver && <div className='flex justify-center mb-2'>{getGameStatusBadge()}</div>}
      <div className='grid grid-cols-2 gap-2'>
        {/* Score Information */}
        <div className={SPACING.TIGHT}>
          <div className='flex justify-between items-center'>
            <span className={`text-gray-300 ${TYPOGRAPHY.SMALL_LABEL}`}>{t('game.score')}</span>
            <span
              className={`font-mono ${TYPOGRAPHY.STAT_VALUE} text-theme-primary font-bold`}
              data-testid='score'
            >
              {score.toLocaleString()}
            </span>
          </div>
          <div className='flex justify-between items-center'>
            <span className={`text-gray-300 ${TYPOGRAPHY.SMALL_LABEL}`}>{t('game.level')}</span>
            <span
              className={`font-mono ${TYPOGRAPHY.STAT_VALUE} text-theme-primary font-bold`}
              data-testid='level'
            >
              {level}
            </span>
          </div>
          <div className='flex justify-between items-center'>
            <span className={`text-gray-300 ${TYPOGRAPHY.SMALL_LABEL}`}>{t('game.lines')}</span>
            <span
              className={`font-mono ${TYPOGRAPHY.STAT_VALUE} text-theme-primary font-bold`}
              data-testid='lines'
            >
              {lines}
            </span>
          </div>

          {/* Level Progress */}
          <div className='mt-2'>
            <div className='flex justify-between items-center mb-1'>
              <span className={`text-gray-400 ${TYPOGRAPHY.SMALL_LABEL}`}>
                {t('game.levelProgress')}
              </span>
              <span className={`text-theme-primary ${TYPOGRAPHY.SMALL_LABEL} font-mono`}>
                {lines % 10}/10
              </span>
            </div>
            <Progress
              value={(lines % 10) * 10}
              className='h-1.5 bg-gray-700/50 [&>div]:bg-theme-primary'
            />
          </div>
        </div>

        {/* Next Piece Preview */}
        <div className='flex flex-col items-center justify-center'>
          <div className={`${TYPOGRAPHY.SMALL_LABEL} text-gray-400 mb-1`}>
            {t('game.nextPiece')}
          </div>
          <div className='grid gap-0 w-fit p-1 bg-black/30 rounded border border-theme-secondary/30'>
            {nextPiece ? (
              nextPiece.shape.map((row, y) => (
                <div key={`next-piece-row-${y}`} className='flex'>
                  {row.map((cell, x) => (
                    <div
                      key={`${y}-${x}`}
                      className={`${cellSize} border border-gray-600/50 relative ${
                        cell ? '' : 'bg-transparent'
                      }`}
                      style={{
                        backgroundColor: cell ? nextPiece.color : 'transparent',
                        boxShadow: cell ? 'var(--piece-shadow-sm)' : 'none',
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
