'use client';

import { memo } from 'react';
import { useTranslation } from 'react-i18next';

interface GameOverMessageProps {
  className?: string;
}

const GameOverMessage = memo(function GameOverMessage({ className = '' }: GameOverMessageProps) {
  const { t } = useTranslation();

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
          {t('game.gameOver')}
        </h2>
        <p className='mb-2 md:mb-4 text-cyan-400 font-mono md:text-base text-sm'>
          {t('game.restart')} (Enter/Space)
        </p>
        <div className='animate-pulse text-red-400'>◆ ◆ ◆</div>
      </div>
    </div>
  );
});

export default GameOverMessage;
