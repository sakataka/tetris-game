'use client';

import { memo } from 'react';
import { GAME_STATES } from '../constants/strings';

interface LoadingMessageProps {
  loadingText?: string;
  className?: string;
}

const LoadingMessage = memo(function LoadingMessage({
  loadingText = GAME_STATES.LOADING,
  className = '',
}: LoadingMessageProps) {
  return (
    <div className={`flex items-center justify-center min-h-screen ${className}`}>
      <div className='text-cyber-cyan text-2xl font-bold animate-pulse'>{loadingText}</div>
    </div>
  );
});

export default LoadingMessage;
