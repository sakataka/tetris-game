'use client';

import { memo } from 'react';
import { GAME_STATES } from '../constants/strings';

interface PausedMessageProps {
  pausedText?: string;
  resumeInstructionText?: string;
  className?: string;
}

const PausedMessage = memo(function PausedMessage({
  pausedText = GAME_STATES.PAUSED,
  resumeInstructionText = GAME_STATES.PAUSE_INSTRUCTION,
  className = '',
}: PausedMessageProps) {
  return (
    <div
      className={`absolute inset-0 hologram flex items-center justify-center ${className}`}
      style={{
        background: 'rgba(0,0,0,0.9)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <div className='text-center text-white md:p-8 p-4 neon-border rounded-lg'>
        <h2 className='md:text-4xl text-2xl font-bold mb-2 md:mb-4 bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent'>
          {pausedText}
        </h2>
        <p className='mb-2 md:mb-4 text-cyan-400 font-mono md:text-base text-sm'>
          {resumeInstructionText}
        </p>
        <div className='animate-pulse text-yellow-400'>◆ ◆ ◆</div>
      </div>
    </div>
  );
});

export default PausedMessage;
