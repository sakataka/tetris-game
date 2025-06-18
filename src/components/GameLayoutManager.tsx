import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { GAP_SCALE, PADDING_SCALE } from '../constants/layout';
import { ConfirmationDialog } from '../components/ui/ConfirmationDialog';
import { Button } from '../components/ui/button';
import { useTogglePause } from '../store/gameStateStore';
import { useCurrentTheme } from '../store/themeStore';
import ErrorBoundary from './ErrorBoundary';
import GameInfo from './GameInfo';
import type { GameControllerAPI } from './GameLogicController';
import PausedOverlay from './PausedOverlay';
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
  const currentTheme = useCurrentTheme();
  const {
    gameState,
    isMobile,
    onParticleUpdate,
    settings,
    onMove,
    onRotate,
    onHardDrop,
    unlockAudio,
    showKeyboardResetConfirmation,
    setShowKeyboardResetConfirmation,
    onKeyboardResetConfirm,
  } = api;

  // Toggle pause function for overlay
  const togglePause = useTogglePause();

  // Define which themes should have gradients
  const gradientThemes = ['cyberpunk', 'neon', 'retro'];
  const hasGradients = gradientThemes.includes(currentTheme);

  // Desktop Layout
  if (!isMobile) {
    return (
      <div
        className={`min-h-dvh relative overflow-hidden ${
          hasGradients
            ? 'bg-gradient-to-br from-theme-surface to-theme-surface/60'
            : 'bg-theme-surface'
        }`}
      >
        {/* Background effects - simplified */}
        <div className='absolute inset-0 bg-grid-pattern opacity-3' />

        {/* Menu Button - Top Right */}
        <div className='absolute top-4 right-4 z-20'> {/* top-4 right-4 = 16px (8-point grid) */}
          <Link to='/settings'>
            <Button
              variant='secondary'
              size='sm'
            >
              {t('tabs.settings')}
            </Button>
          </Link>
        </div>

        <div className={`relative z-10 h-dvh flex items-center justify-center ${PADDING_SCALE.sm}`}>
          <div className={`grid grid-cols-[minmax(400px,auto)_350px] ${GAP_SCALE.md} items-stretch max-h-[calc(100vh-2rem)] max-w-7xl`}>
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
                />
              </ErrorBoundary>
            </div>
          </div>
        </div>

        {/* Paused Overlay */}
        <PausedOverlay isVisible={gameState.isPaused} onResume={togglePause} />

        {/* Reset Confirmation Dialog */}
        <ConfirmationDialog
          isOpen={showKeyboardResetConfirmation}
          onClose={() => setShowKeyboardResetConfirmation(false)}
          onConfirm={onKeyboardResetConfirm}
          title={t('game.resetConfirmation.title')}
          description={t('game.resetConfirmation.description')}
          confirmText={t('buttons.reset')}
          cancelText={t('common.cancel')}
          variant='destructive'
        />
      </div>
    );
  }

  // Mobile Layout
  return (
    <div
      className={`min-h-dvh relative overflow-hidden ${
        hasGradients
          ? 'bg-gradient-to-br from-theme-surface to-theme-surface/60'
          : 'bg-theme-surface'
      }`}
    >
      {/* Background effects - simplified */}
      <div className='absolute inset-0 bg-grid-pattern opacity-3' />

      {/* Menu Button - Top Right (Mobile) */}
      <div className='absolute top-2 right-2 z-20'>
        <Link to='/settings'>
          <Button
            variant='secondary'
            size='sm'
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

        {/* Paused Overlay */}
        <PausedOverlay isVisible={gameState.isPaused} onResume={togglePause} />
      </div>

      {/* Reset Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showKeyboardResetConfirmation}
        onClose={() => setShowKeyboardResetConfirmation(false)}
        onConfirm={onKeyboardResetConfirm}
        title={t('game.resetConfirmation.title')}
        description={t('game.resetConfirmation.description')}
        confirmText={t('buttons.reset')}
        cancelText={t('common.cancel')}
        variant='destructive'
      />
    </div>
  );
});

export default GameLayoutManager;
