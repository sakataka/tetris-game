'use client';

import { Suspense, lazy, memo } from 'react';
import {
  type BoardRenderState,
  DEFAULT_RENDERING_OPTIONS,
  type RenderEffects,
} from '../types/rendering';
import type { LineEffectState, Tetromino } from '../types/tetris';
import { BoardRendererFactory } from '../utils/game/boardRenderer';
import GameOverMessage from './GameOverMessage';
import PausedMessage from './PausedMessage';

// Lazy load particle effects for better initial load performance
const ParticleEffect = lazy(() => import('./ParticleEffect'));

interface TetrisBoardProps {
  board: (string | null)[][];
  currentPiece: Tetromino | null;
  gameOver: boolean;
  isPaused: boolean;
  lineEffect: LineEffectState;
  onParticleUpdate: (particles: LineEffectState['particles']) => void;
}

const TetrisBoard = memo(function TetrisBoard({
  board,
  currentPiece,
  gameOver,
  isPaused,
  lineEffect,
  onParticleUpdate,
}: TetrisBoardProps) {
  // Create board renderer instance (React Compiler will optimize this)
  const boardRenderer = BoardRendererFactory.createRenderer();

  // Prepare render state and effects (React Compiler will optimize these)
  const renderState: BoardRenderState = {
    board,
    currentPiece,
    gameOver,
    isPaused,
    lineEffect,
  };

  const renderEffects: RenderEffects = {
    flashingLines: new Set(lineEffect.flashingLines),
    shaking: lineEffect.shaking,
    particles: lineEffect.particles,
  };

  // Generate display board using BoardRenderer
  const displayBoard = boardRenderer.renderBoard(renderState, DEFAULT_RENDERING_OPTIONS);

  // Calculate styles for all cells using BoardRenderer
  const cellStyles = boardRenderer.renderDisplayBoard(displayBoard, renderEffects);

  // Get board container styles from renderer
  const boardContainerStyle = boardRenderer.getBoardContainerStyle(renderEffects);
  const boardContainerClassName = boardRenderer.getBoardContainerClassName(renderEffects);

  return (
    <div className='relative min-w-[280px] min-h-[560px] md:min-w-[360px] md:min-h-[720px] lg:min-w-[400px] lg:min-h-[800px]'>
      <div className={boardContainerClassName} style={boardContainerStyle}>
        {/* Inner glow effect */}
        <div className='absolute inset-0 bg-gradient-to-br from-cyan-400/10 via-transparent to-purple-400/10 pointer-events-none' />

        {displayBoard.flatMap((row, y) =>
          row.map((cell, x) => {
            const cellStyle = cellStyles[y]?.[x];
            if (!cellStyle) return null;

            return (
              <div key={`${y}-${x}`} className={cellStyle.className} style={cellStyle.style}>
                {/* Neon effect for filled pieces */}
                {cell && cell !== 'ghost' && (
                  <div className='absolute inset-0 bg-current opacity-20 blur-sm' />
                )}
              </div>
            );
          })
        )}
      </div>

      <Suspense fallback={null}>
        <ParticleEffect lineEffect={lineEffect} onParticleUpdate={onParticleUpdate} />
      </Suspense>

      {gameOver && <GameOverMessage />}

      {isPaused && !gameOver && <PausedMessage />}
    </div>
  );
});

export default TetrisBoard;
