import { memo } from 'react';
import type { Tetromino } from '../types/tetris';
import GameTabContent from './GameTabContent';
import MobileGameInfo from './MobileGameInfo';
import CyberCard from './ui/CyberCard';

interface GameInfoProps {
  score: number;
  level: number;
  lines: number;
  nextPiece: Tetromino | null;
  gameOver: boolean;
  isPaused: boolean;
}

const GameInfo = memo(function GameInfo({
  score,
  level,
  lines,
  nextPiece,
  gameOver,
  isPaused,
}: GameInfoProps) {

  return (
    <div className='text-white h-full flex flex-col'>
      {/* Desktop: Game Title + Game Info */}
      <div className='hidden md:flex flex-col h-full space-y-4'>
        {/* TETRIS Title with consistent styling */}
        <CyberCard title='TETRIS' theme='cyan' size='sm'>
          <div className='text-center text-cyber-cyan-400 font-mono text-sm'>
            Game Mode
          </div>
        </CyberCard>

        {/* Game Information */}
        <div className='flex-1'>
          <GameTabContent
            score={score}
            level={level}
            lines={lines}
            nextPiece={nextPiece}
            gameOver={gameOver}
            isPaused={isPaused}
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
