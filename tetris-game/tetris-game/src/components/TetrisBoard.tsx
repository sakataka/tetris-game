'use client';

import { Tetromino } from '../types/tetris';
import { getDropPosition } from '../utils/tetrisUtils';

interface TetrisBoardProps {
  board: (string | null)[][];
  currentPiece: Tetromino | null;
  gameOver: boolean;
  isPaused: boolean;
}

export default function TetrisBoard({ 
  board, 
  currentPiece, 
  gameOver, 
  isPaused 
}: TetrisBoardProps) {
  // Create display board with current piece and ghost piece
  const displayBoard = board.map(row => [...row]);
  
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
            if (!displayBoard[boardY][boardX]) {
              displayBoard[boardY][boardX] = 'ghost';
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
            displayBoard[boardY][boardX] = currentPiece.color;
          }
        }
      }
    }
  }

  const getCellStyle = (cell: string | null) => {
    if (!cell) {
      return 'bg-gray-800 border border-gray-700';
    }
    
    if (cell === 'ghost') {
      return 'border-2 border-gray-400 bg-transparent border-dashed';
    }
    
    return `border border-gray-900`;
  };

  const getCellColor = (cell: string | null) => {
    if (!cell || cell === 'ghost') return {};
    return { backgroundColor: cell };
  };

  return (
    <div className="relative">
      <div className="grid grid-cols-10 gap-0 border-2 border-gray-600 bg-black p-2">
        {displayBoard.map((row, y) =>
          row.map((cell, x) => (
            <div
              key={`${y}-${x}`}
              className={`w-6 h-6 ${getCellStyle(cell)}`}
              style={getCellColor(cell)}
            />
          ))
        )}
      </div>
      
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
}