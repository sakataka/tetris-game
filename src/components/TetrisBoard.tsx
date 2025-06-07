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
      baseStyle = 'bg-gray-800 border border-gray-700';
    } else if (cell === 'ghost') {
      baseStyle = 'border-2 border-gray-400 bg-transparent border-dashed';
    } else {
      baseStyle = 'border border-gray-900';
    }
    
    // フラッシュエフェクト
    if (lineEffect.flashingLines.includes(rowIndex)) {
      baseStyle += ' animate-pulse bg-white border-white';
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
      <div className={`grid grid-cols-10 gap-0 border-2 border-gray-600 bg-black p-2 transition-transform ${
        lineEffect.shaking ? 'animate-bounce' : ''
      }`}>
        {displayBoard.map((row, y) =>
          row.map((cell, x) => (
            <div
              key={`${y}-${x}`}
              className={`w-6 h-6 ${getCellStyle(cell, y)}`}
              style={getCellColor(cell, y)}
            />
          ))
        )}
      </div>
      
      <ParticleEffect 
        lineEffect={lineEffect}
        onParticleUpdate={onParticleUpdate} 
      />
      
      {gameOver && (
        <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center">
          <div className="text-center text-white">
            <h2 className="text-3xl font-bold mb-4">ゲームオーバー</h2>
            <p className="mb-4">Enterキーまたはスペースキーで再開</p>
          </div>
        </div>
      )}
      
      {isPaused && !gameOver && (
        <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center">
          <div className="text-center text-white">
            <h2 className="text-3xl font-bold mb-4">一時停止</h2>
            <p className="mb-4">Pキーで再開</p>
          </div>
        </div>
      )}
    </div>
  );
});

export default TetrisBoard;