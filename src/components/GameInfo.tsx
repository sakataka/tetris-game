import { memo } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();

  return (
    <div className='text-white h-full flex flex-col'>
      {/* Desktop: Game Title + Game Info */}
      <div className='hidden md:flex flex-col h-full space-y-4'>
        {/* TETRIS Title with consistent styling */}
        <CyberCard title={t('app.title')} theme='cyan' size='md'>
          <div className='text-center text-cyber-cyan-400 text-xs'>{t('game.playing')}</div>
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
