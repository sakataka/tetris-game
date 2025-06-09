'use client';

import { memo, useMemo, useCallback } from 'react';
import { Tetromino, LineEffectState } from '../types/tetris';
import { getDropPosition } from '../utils/game';
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
  // 座標境界チェックのヘルパー関数（認知複雑度削減）
  const isValidBoardPosition = useCallback(
    (x: number, y: number) => {
      return y >= 0 && y < board.length && x >= 0 && x < board[0].length;
    },
    [board]
  );

  // ゴーストピース追加のヘルパー関数（認知複雑度削減）
  const addGhostPiece = useCallback(
    (displayBoard: (number | string | null)[][], piece: Tetromino, ghostY: number) => {
      for (let y = 0; y < piece.shape.length; y++) {
        for (let x = 0; x < piece.shape[y].length; x++) {
          if (piece.shape[y][x]) {
            const boardX = piece.position.x + x;
            const boardY = ghostY + y;

            if (isValidBoardPosition(boardX, boardY) && !displayBoard[boardY][boardX]) {
              displayBoard[boardY][boardX] = 'ghost';
            }
          }
        }
      }
       
    },
    [board, isValidBoardPosition]
  ); // board依存は境界チェック用途で必要

  // 現在のピース追加のヘルパー関数（認知複雑度削減）
  const addCurrentPiece = useCallback(
    (displayBoard: (number | string | null)[][], piece: Tetromino) => {
      for (let y = 0; y < piece.shape.length; y++) {
        for (let x = 0; x < piece.shape[y].length; x++) {
          if (piece.shape[y][x]) {
            const boardX = piece.position.x + x;
            const boardY = piece.position.y + y;

            if (isValidBoardPosition(boardX, boardY)) {
              displayBoard[boardY][boardX] = piece.color;
            }
          }
        }
      }
       
    },
    [board, isValidBoardPosition]
  ); // board依存は境界チェック用途で必要

  // Create display board with current piece and ghost piece (useMemoで最適化)
  const displayBoard = useMemo(() => {
    const newDisplayBoard = board.map((row) => [...row]);

    // Add ghost piece (preview of where piece will land)
    if (currentPiece && !gameOver && !isPaused) {
      const ghostY = getDropPosition(board, currentPiece);
      addGhostPiece(newDisplayBoard, currentPiece, ghostY);

      // Add current piece
      addCurrentPiece(newDisplayBoard, currentPiece);
    }

    return newDisplayBoard;
  }, [board, currentPiece, gameOver, isPaused, addGhostPiece, addCurrentPiece]);

  // フラッシュ行をSetに変換してO(1)検索を可能にする
  const flashingLinesSet = useMemo(
    () => new Set(lineEffect.flashingLines),
    [lineEffect.flashingLines]
  );

  // スタイル計算をメモ化
  const getCellStyle = useMemo(() => {
    const baseStyles = {
      empty: 'bg-gray-900/50 border border-cyan-500/20 backdrop-blur-sm',
      ghost:
        'border-2 border-cyan-400/60 bg-transparent border-dashed shadow-[0_0_10px_rgba(0,255,255,0.3)]',
      filled: 'border border-gray-800 shadow-[0_0_5px_rgba(0,0,0,0.5)] transition-all duration-200',
      flashing: ' animate-pulse bg-white border-white shadow-[0_0_20px_rgba(255,255,255,0.8)]',
    };

    return (cell: string | null, rowIndex: number) => {
      let style = '';

      if (!cell) {
        style = baseStyles.empty;
      } else if (cell === 'ghost') {
        style = baseStyles.ghost;
      } else {
        style = baseStyles.filled;
      }

      // O(1)でフラッシュ効果をチェック
      if (flashingLinesSet.has(rowIndex)) {
        style += baseStyles.flashing;
      }

      return style;
    };
  }, [flashingLinesSet]);

  const getCellColor = useMemo(() => {
    return (cell: string | null, rowIndex: number) => {
      if (!cell || cell === 'ghost') return {};
      // フラッシュエフェクト中は白色に変更
      if (flashingLinesSet.has(rowIndex)) {
        return { backgroundColor: '#ffffff' };
      }
      return { backgroundColor: cell };
    };
  }, [flashingLinesSet]);

  return (
    <div className='relative'>
      <div
        className={`grid grid-cols-10 gap-0 neon-border hologram transition-transform relative overflow-hidden ${
          lineEffect.shaking ? 'animate-bounce' : ''
        } md:p-3 p-1`}
        style={{
          background:
            'linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(10,10,15,0.9) 50%, rgba(5,5,10,0.8) 100%)',
          backdropFilter: 'blur(10px)',
        }}
      >
        {/* 内側のグロー効果 */}
        <div className='absolute inset-0 bg-gradient-to-br from-cyan-400/10 via-transparent to-purple-400/10 pointer-events-none'></div>

        {displayBoard.map((row, y) =>
          row.map((cell, x) => (
            <div
              key={`${y}-${x}`}
              className={`md:w-7 md:h-7 w-4 h-4 relative ${getCellStyle(cell, y)}`}
              style={getCellColor(cell, y)}
            >
              {/* ピースが存在する場合のネオン効果 */}
              {cell && cell !== 'ghost' && (
                <div className='absolute inset-0 bg-current opacity-20 blur-sm'></div>
              )}
            </div>
          ))
        )}
      </div>

      <ParticleEffect lineEffect={lineEffect} onParticleUpdate={onParticleUpdate} />

      {gameOver && <GameOverMessage />}

      {isPaused && !gameOver && <PausedMessage />}
    </div>
  );
});

export default TetrisBoard;
