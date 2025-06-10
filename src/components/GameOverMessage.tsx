'use client';

import { memo } from 'react';
import { GAME_STATES } from '../constants/strings';

interface GameOverMessageProps {
  gameOverText?: string;
  restartInstructionText?: string;
  className?: string;
}

const GameOverMessage = memo(function GameOverMessage({
  gameOverText = GAME_STATES.GAME_OVER,
  restartInstructionText = GAME_STATES.RESTART_INSTRUCTION,
  className = '',
}: GameOverMessageProps) {
  return (
    <div
      className={`absolute inset-0 hologram flex items-center justify-center ${className}`}
      style={{
        background: 'rgba(0,0,0,0.9)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <div className='text-center text-white md:p-8 p-4 neon-border rounded-lg'>
        <h2 className='md:text-4xl text-2xl font-bold mb-2 md:mb-4 bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent'>
          {gameOverText}
        </h2>
        <p className='mb-2 md:mb-4 text-cyan-400 font-mono md:text-base text-sm'>
          {restartInstructionText}
        </p>
        <div className='animate-pulse text-red-400'>◆ ◆ ◆</div>
      </div>
    </div>
  );
});

export default GameOverMessage;
