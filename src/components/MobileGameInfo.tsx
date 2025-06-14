import { memo } from 'react';
import { useTranslation } from 'react-i18next';
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
    <div className={`flex space-x-4 h-full overflow-hidden ${className}`}>
      {/* Score information */}
      <div className='flex-1 min-w-0'>
        <div className='hologram-cyan neon-border p-2 rounded-lg text-xs'>
          <div className='font-bold text-cyan-400 mb-1'>{t('game.score')}</div>
          <div className='text-lg font-mono'>{score.toLocaleString()}</div>
          <div className='text-gray-400 text-xs'>
            L{level} • {lines} lines
          </div>
        </div>
      </div>

      {/* Next piece */}
      <div className='w-16 flex-shrink-0'>
        <div className='hologram-purple neon-border p-2 rounded-lg h-full'>
          <div className='font-bold text-purple-400 text-xs mb-1'>{t('game.nextPiece')}</div>
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
