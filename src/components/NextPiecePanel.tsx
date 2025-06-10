'use client';

import { memo } from 'react';
import { Tetromino } from '../types/tetris';
import PanelBase from './ui/PanelBase';

interface NextPiecePanelProps {
  nextPiece: Tetromino | null;
}

const NextPiecePanel = memo(function NextPiecePanel({ nextPiece }: NextPiecePanelProps) {
  return (
    <PanelBase title='NEXT PIECE' theme='purple'>
      <div className='grid gap-0 w-fit mx-auto p-4 bg-black/30 rounded-lg border border-purple-400/30'>
        {nextPiece ? (
          nextPiece.shape.map((row, y) => (
            <div key={y} className='flex'>
              {row.map((cell, x) => (
                <div
                  key={`${y}-${x}`}
                  className={`w-5 h-5 border border-gray-600/50 relative ${
                    cell ? 'shadow-[0_0_10px_rgba(255,255,255,0.3)]' : 'bg-transparent'
                  }`}
                  style={{
                    backgroundColor: cell ? nextPiece.color : 'transparent',
                  }}
                >
                  {cell === 1 && (
                    <div className='absolute inset-0 bg-current opacity-20 blur-sm'></div>
                  )}
                </div>
              ))}
            </div>
          ))
        ) : (
          <div className='w-20 h-20 bg-gray-700/50 rounded border border-gray-500'></div>
        )}
      </div>
    </PanelBase>
  );
});

export default NextPiecePanel;
