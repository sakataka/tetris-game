'use client';

import { memo, useMemo } from 'react';
import { Tetromino, LineEffectState } from '../types/tetris';
import { BoardRendererFactory } from '../utils/game/boardRenderer';
import { BoardRenderState, RenderEffects, DEFAULT_RENDERING_OPTIONS } from '../types/rendering';
import ParticleEffect from './ParticleEffect';
import GameOverMessage from './GameOverMessage';
import PausedMessage from './PausedMessage';

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
  // Create board renderer instance (memoized for performance)
  const boardRenderer = useMemo(() => {
    return BoardRendererFactory.createRenderer();
  }, []);

  // Prepare render state and effects
  const renderState = useMemo(
    (): BoardRenderState => ({
      board,
      currentPiece,
      gameOver,
      isPaused,
      lineEffect,
    }),
    [board, currentPiece, gameOver, isPaused, lineEffect]
  );

  const renderEffects = useMemo(
    (): RenderEffects => ({
      flashingLines: new Set(lineEffect.flashingLines),
      shaking: lineEffect.shaking,
      particles: lineEffect.particles,
    }),
    [lineEffect.flashingLines, lineEffect.shaking, lineEffect.particles]
  );

  // Generate display board using BoardRenderer
  const displayBoard = useMemo(() => {
    return boardRenderer.renderBoard(renderState, DEFAULT_RENDERING_OPTIONS);
  }, [boardRenderer, renderState]);

  // Calculate styles for all cells using BoardRenderer
  const cellStyles = useMemo(() => {
    return boardRenderer.renderDisplayBoard(displayBoard, renderEffects);
  }, [boardRenderer, displayBoard, renderEffects]);

  // Get board container styles from renderer
  const boardContainerStyle = useMemo(() => {
    return boardRenderer.getBoardContainerStyle(renderEffects);
  }, [boardRenderer, renderEffects]);

  const boardContainerClassName = useMemo(() => {
    return boardRenderer.getBoardContainerClassName(renderEffects);
  }, [boardRenderer, renderEffects]);

  return (
    <div className='relative'>
      <div className={boardContainerClassName} style={boardContainerStyle}>
        {/* Inner glow effect */}
        <div className='absolute inset-0 bg-gradient-to-br from-cyan-400/10 via-transparent to-purple-400/10 pointer-events-none'></div>

        {displayBoard.map((row, y) =>
          row.map((cell, x) => {
            const cellStyle = cellStyles[y][x];

            return (
              <div key={`${y}-${x}`} className={cellStyle.className} style={cellStyle.style}>
                {/* Neon effect for filled pieces */}
                {cell && cell !== 'ghost' && (
                  <div className='absolute inset-0 bg-current opacity-20 blur-sm'></div>
                )}
              </div>
            );
          })
        )}
      </div>

      <ParticleEffect lineEffect={lineEffect} onParticleUpdate={onParticleUpdate} />

      {gameOver && <GameOverMessage />}

      {isPaused && !gameOver && <PausedMessage />}
    </div>
  );
});

export default TetrisBoard;
