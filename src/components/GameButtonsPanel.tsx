'use client';

import { memo } from 'react';
import { BUTTONS } from '../constants/strings';

interface GameButtonsPanelProps {
  gameOver: boolean;
  isPaused: boolean;
  onTogglePause: () => void;
  onReset: () => void;
}

const GameButtonsPanel = memo(function GameButtonsPanel({
  gameOver,
  isPaused,
  onTogglePause,
  onReset
}: GameButtonsPanelProps) {
  return (
    <div className="space-y-4">
      <button
        onClick={onTogglePause}
        disabled={gameOver}
        className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 
                   disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-2 md:py-3 px-4 md:px-6 rounded-lg 
                   transition-all duration-300 transform hover:scale-105 disabled:scale-100 
                   shadow-[0_0_20px_rgba(0,255,255,0.3)] hover:shadow-[0_0_30px_rgba(0,255,255,0.5)]
                   border border-cyan-400/50 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-blue-400/20 blur-sm"></div>
        <span className="relative font-mono text-base md:text-lg">
          {isPaused ? BUTTONS.RESUME : BUTTONS.PAUSE}
        </span>
      </button>
      
      <button
        onClick={onReset}
        className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-400 hover:to-pink-400 
                   text-white font-bold py-2 md:py-3 px-4 md:px-6 rounded-lg transition-all duration-300 transform 
                   hover:scale-105 shadow-[0_0_20px_rgba(255,0,0,0.3)] hover:shadow-[0_0_30px_rgba(255,0,0,0.5)]
                   border border-red-400/50 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-red-400/20 to-pink-400/20 blur-sm"></div>
        <span className="relative font-mono text-base md:text-lg">{BUTTONS.RESET}</span>
      </button>
    </div>
  );
});

export default GameButtonsPanel;