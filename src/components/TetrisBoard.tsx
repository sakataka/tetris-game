'use client';

import { memo, useMemo } from 'react';
import { Tetromino, LineEffectState } from '../types/tetris';
import { getDropPosition } from '../utils/tetrisUtils';
import ParticleEffect from './ParticleEffect';

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
  onParticleUpdate
}: TetrisBoardProps) {
  // Create display board with current piece and ghost piece (useMemoで最適化)
  const displayBoard = useMemo(() => {
    const newDisplayBoard = board.map(row => [...row]);
    
    // Add ghost piece (preview of where piece will land)
    if (currentPiece && !gameOver && !isPaused) {
      const ghostY = getDropPosition(board, currentPiece);
      
      // Add ghost piece
      for (let y = 0; y < currentPiece.shape.length; y++) {
        for (let x = 0; x < currentPiece.shape[y].length; x++) {
          if (currentPiece.shape[y][x]) {
            const boardX = currentPiece.position.x + x;
            const boardY = ghostY + y;
            
            if (boardY >= 0 && boardY < board.length && boardX >= 0 && boardX < board[0].length) {
              if (!newDisplayBoard[boardY][boardX]) {
                newDisplayBoard[boardY][boardX] = 'ghost';
              }
            }
          }
        }
      }
      
      // Add current piece
      for (let y = 0; y < currentPiece.shape.length; y++) {
        for (let x = 0; x < currentPiece.shape[y].length; x++) {
          if (currentPiece.shape[y][x]) {
            const boardX = currentPiece.position.x + x;
            const boardY = currentPiece.position.y + y;
            
            if (boardY >= 0 && boardY < board.length && boardX >= 0 && boardX < board[0].length) {
              newDisplayBoard[boardY][boardX] = currentPiece.color;
            }
          }
        }
      }
    }
    
    return newDisplayBoard;
  }, [board, currentPiece, gameOver, isPaused]);

  const getCellStyle = (cell: string | null, rowIndex: number) => {
    let baseStyle = '';
    
    if (!cell) {
      baseStyle = 'bg-gray-900/50 border border-cyan-500/20 backdrop-blur-sm';
    } else if (cell === 'ghost') {
      baseStyle = 'border-2 border-cyan-400/60 bg-transparent border-dashed shadow-[0_0_10px_rgba(0,255,255,0.3)]';
    } else {
      baseStyle = 'border border-gray-800 shadow-[0_0_5px_rgba(0,0,0,0.5)] transition-all duration-200';
    }
    
    // フラッシュエフェクト
    if (lineEffect.flashingLines.includes(rowIndex)) {
      baseStyle += ' animate-pulse bg-white border-white shadow-[0_0_20px_rgba(255,255,255,0.8)]';
    }
    
    return baseStyle;
  };

  const getCellColor = (cell: string | null, rowIndex: number) => {
    if (!cell || cell === 'ghost') return {};
    // フラッシュエフェクト中は白色に変更
    if (lineEffect.flashingLines.includes(rowIndex)) {
      return { backgroundColor: '#ffffff' };
    }
    return { backgroundColor: cell };
  };

  return (
    <div className="relative">
      <div className={`grid grid-cols-10 gap-0 neon-border hologram transition-transform relative overflow-hidden ${
        lineEffect.shaking ? 'animate-bounce' : ''
      } md:p-3 p-1`} style={{
        background: 'linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(10,10,15,0.9) 50%, rgba(5,5,10,0.8) 100%)',
        backdropFilter: 'blur(10px)'
      }}>
        {/* 内側のグロー効果 */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/10 via-transparent to-purple-400/10 pointer-events-none"></div>
        
        {displayBoard.map((row, y) =>
          row.map((cell, x) => (
            <div
              key={`${y}-${x}`}
              className={`md:w-7 md:h-7 w-4 h-4 relative ${getCellStyle(cell, y)}`}
              style={getCellColor(cell, y)}
            >
              {/* ピースが存在する場合のネオン効果 */}
              {cell && cell !== 'ghost' && (
                <div className="absolute inset-0 bg-current opacity-20 blur-sm"></div>
              )}
            </div>
          ))
        )}
      </div>
      
      <ParticleEffect 
        lineEffect={lineEffect}
        onParticleUpdate={onParticleUpdate} 
      />
      
      {gameOver && (
        <div className="absolute inset-0 hologram flex items-center justify-center" style={{
          background: 'rgba(0,0,0,0.9)',
          backdropFilter: 'blur(10px)'
        }}>
          <div className="text-center text-white md:p-8 p-4 neon-border rounded-lg">
            <h2 className="md:text-4xl text-2xl font-bold mb-2 md:mb-4 bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">
              GAME OVER
            </h2>
            <p className="mb-2 md:mb-4 text-cyan-400 font-mono md:text-base text-sm">Enterキーまたはスペースキーで再開</p>
            <div className="animate-pulse text-red-400">◆ ◆ ◆</div>
          </div>
        </div>
      )}
      
      {isPaused && !gameOver && (
        <div className="absolute inset-0 hologram flex items-center justify-center" style={{
          background: 'rgba(0,0,0,0.9)',
          backdropFilter: 'blur(10px)'
        }}>
          <div className="text-center text-white md:p-8 p-4 neon-border rounded-lg">
            <h2 className="md:text-4xl text-2xl font-bold mb-2 md:mb-4 bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
              PAUSED
            </h2>
            <p className="mb-2 md:mb-4 text-cyan-400 font-mono md:text-base text-sm">Pキーで再開</p>
            <div className="animate-pulse text-yellow-400">◆ ◆ ◆</div>
          </div>
        </div>
      )}
    </div>
  );
});

export default TetrisBoard;