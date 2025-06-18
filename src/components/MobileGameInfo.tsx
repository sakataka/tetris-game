import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { GAP_SCALE, PADDING_SCALE } from '../constants/layout';
import type { Tetromino } from '../types/tetris';
import GameButtonsPanel from './GameButtonsPanel';
import NextPiecePanel from './NextPiecePanel';

interface MobileGameInfoProps {
  score: number;
  level: number;
  lines: number;
  nextPiece: Tetromino | null;
  className?: string;
}

const MobileGameInfo = memo(function MobileGameInfo({
  score,
  level,
  lines,
  nextPiece,
  className = '',
}: MobileGameInfoProps) {
  const { t } = useTranslation();
  return (
    <div className={`flex ${GAP_SCALE.sm} h-full overflow-hidden ${className}`}>
      {/* Score information */}
      <div className='flex-1 min-w-0'>
        <div
          className={`bg-theme-primary/15 border border-theme-primary/40 ${PADDING_SCALE.xs} rounded-lg text-xs`}
        >
          <div className='font-bold text-theme-primary mb-2'>{t('game.score')}</div>
          <div className='text-lg font-mono'>{score.toLocaleString()}</div>
          <div className='text-theme-muted text-xs'>
            L{level} • {lines} lines
          </div>
        </div>
      </div>

      {/* Next piece */}
      <div className='w-16 flex-shrink-0'>
        <div
          className={`bg-theme-secondary/15 border border-theme-secondary/40 ${PADDING_SCALE.xs} rounded-lg h-full`}
        >
          <div className='font-bold text-theme-secondary text-xs mb-2'>{t('game.nextPiece')}</div>
          <NextPiecePanel nextPiece={nextPiece} />
        </div>
      </div>

      {/* Game buttons */}
      <div className='w-20 flex-shrink-0'>
        <GameButtonsPanel />
      </div>
    </div>
  );
});

export default MobileGameInfo;
