import { memo } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/ui/button';
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
  const { t } = useTranslation();
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

        {/* Menu Button - Top Right */}
        <div className='absolute top-4 right-4 z-20'>
          <Link to='/settings'>
            <Button
              variant='outline'
              size='sm'
              className='bg-gray-800/80 border-cyan-400/50 text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-400 transition-all duration-200 text-xs'
            >
              {t('tabs.settings')}
            </Button>
          </Link>
        </div>

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

      {/* Menu Button - Top Right (Mobile) */}
      <div className='absolute top-2 right-2 z-20'>
        <Link to='/settings'>
          <Button
            variant='outline'
            size='sm'
            className='bg-gray-800/80 border-cyan-400/50 text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-400 transition-all duration-200 text-xs px-2 py-1'
          >
            {t('tabs.settings')}
          </Button>
        </Link>
      </div>

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
