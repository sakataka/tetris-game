import { memo } from 'react';
import type { Tetromino } from '../types/tetris';
import GameTabContent from './GameTabContent';
import MobileGameInfo from './MobileGameInfo';
import GameHeader from './layout/GameHeader';

interface GameInfoProps {
  score: number;
  level: number;
  lines: number;
  nextPiece: Tetromino | null;
  gameOver: boolean;
}

const GameInfo = memo(function GameInfo({
  score,
  level,
  lines,
  nextPiece,
  gameOver,
}: GameInfoProps) {
  return (
    <div className='text-white h-full flex flex-col'>
      {/* Desktop: Game Title + Game Info */}
      <div className='hidden md:flex flex-col h-full space-y-4'>
        {/* TETRIS Title with large decorative styling matching Settings */}
        <div className='mb-4'>
          <GameHeader variant='default' />
        </div>

        {/* Game Information */}
        <div className='flex-1'>
          <GameTabContent
            score={score}
            level={level}
            lines={lines}
            nextPiece={nextPiece}
            gameOver={gameOver}
          />
        </div>
      </div>

      {/* Mobile: Compact display (game info only) */}
      <div className='md:hidden h-full'>
        <MobileGameInfo score={score} level={level} lines={lines} nextPiece={nextPiece} />
      </div>
    </div>
  );
});

export default GameInfo;
