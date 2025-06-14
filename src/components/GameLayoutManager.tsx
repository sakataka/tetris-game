'use client';

import { memo } from 'react';
import ErrorBoundary from './ErrorBoundary';
import GameInfo from './GameInfo';
import type { GameControllerAPI } from './GameLogicController';
import TetrisBoard from './TetrisBoard';
import VirtualControls from './VirtualControls';

interface GameLayoutManagerProps {
  api: GameControllerAPI;
}

/**
 * GameLayoutManager handles responsive layout and UI composition.
 * Responsibilities:
 * - Desktop and mobile layout management
 * - Component composition and arrangement
 * - Responsive design coordination
 * - UI state management
 */
const GameLayoutManager = memo(function GameLayoutManager({ api }: GameLayoutManagerProps) {
  const {
    gameState,
    isMobile,
    onParticleUpdate,
    settings,
    onMove,
    onRotate,
    onHardDrop,
    unlockAudio,
  } = api;

  // Desktop Layout
  if (!isMobile) {
    return (
      <div className='min-h-dvh bg-gradient-to-br from-gray-900 via-black to-gray-800 relative overflow-hidden'>
        {/* Background effects */}
        <div className='absolute inset-0 bg-grid-pattern opacity-5' />
        <div className='absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/50' />

        <div className='relative z-10 h-dvh flex items-center justify-center px-4 py-4'>
          <div className='grid grid-cols-[minmax(400px,auto)_350px] gap-6 items-stretch max-h-[calc(100vh-2rem)] max-w-7xl'>
            {/* Game Board */}
            <div className='flex items-center'>
              <ErrorBoundary level='component'>
                <TetrisBoard
                  board={gameState.board}
                  currentPiece={gameState.currentPiece}
                  gameOver={gameState.gameOver}
                  isPaused={gameState.isPaused}
                  lineEffect={gameState.lineEffect}
                  onParticleUpdate={onParticleUpdate}
                />
              </ErrorBoundary>
            </div>

            {/* Game Information Panel */}
            <div className='h-full'>
              <ErrorBoundary level='component'>
                <GameInfo
                  score={gameState.score}
                  level={gameState.level}
                  lines={gameState.lines}
                  nextPiece={gameState.nextPiece}
                  gameOver={gameState.gameOver}
                  isPaused={gameState.isPaused}
                />
              </ErrorBoundary>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Mobile Layout
  return (
    <div className='min-h-dvh bg-gradient-to-br from-gray-900 via-black to-gray-800 relative overflow-hidden'>
      {/* Background effects */}
      <div className='absolute inset-0 bg-grid-pattern opacity-5' />
      <div className='absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/50' />

      <div className='relative z-10 flex flex-col h-dvh'>
        {/* Game Info Panel - Top */}
        <div className='flex-shrink-0 px-2 pt-2'>
          <ErrorBoundary level='component'>
            <GameInfo
              score={gameState.score}
              level={gameState.level}
              lines={gameState.lines}
              nextPiece={gameState.nextPiece}
              gameOver={gameState.gameOver}
              isPaused={gameState.isPaused}
            />
          </ErrorBoundary>
        </div>

        {/* Game Board - Center */}
        <div className='flex-1 flex items-center justify-center px-2'>
          <ErrorBoundary level='component'>
            <TetrisBoard
              board={gameState.board}
              currentPiece={gameState.currentPiece}
              gameOver={gameState.gameOver}
              isPaused={gameState.isPaused}
              lineEffect={gameState.lineEffect}
              onParticleUpdate={onParticleUpdate}
            />
          </ErrorBoundary>
        </div>

        {/* Virtual Controls - Bottom */}
        <div className='flex-shrink-0 p-4'>
          <ErrorBoundary level='component'>
            <VirtualControls
              onMove={onMove}
              onRotate={onRotate}
              onHardDrop={onHardDrop}
              isVisible={settings.virtualControlsEnabled}
              unlockAudio={unlockAudio}
            />
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
});

export default GameLayoutManager;
