'use client';

import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Tetromino } from '../types/tetris';
import NextPiecePanel from './NextPiecePanel';
import GameButtonsPanel from './GameButtonsPanel';

interface MobileGameInfoProps {
  score: number;
  level: number;
  lines: number;
  nextPiece: Tetromino | null;
  gameOver: boolean;
  isPaused: boolean;
  onReset: () => void;
  onTogglePause: () => void;
  className?: string;
}

const MobileGameInfo = memo(function MobileGameInfo({
  score,
  level,
  lines,
  nextPiece,
  gameOver,
  isPaused,
  onReset,
  onTogglePause,
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
        <GameButtonsPanel
          gameOver={gameOver}
          isPaused={isPaused}
          onTogglePause={onTogglePause}
          onReset={onReset}
        />
      </div>
    </div>
  );
});

export default MobileGameInfo;
