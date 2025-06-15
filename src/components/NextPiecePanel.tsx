import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { GAME_UI_SIZES } from '../constants/layout';
import type { Tetromino } from '../types/tetris';
import CyberCard from './ui/CyberCard';

interface NextPiecePanelProps {
  nextPiece: Tetromino | null;
  size?: 'sm' | 'md' | 'lg';
}

const NextPiecePanel = memo(function NextPiecePanel({
  nextPiece,
  size = 'md',
}: NextPiecePanelProps) {
  const { t } = useTranslation();

  const cellSize = size === 'sm' ? 'w-3 h-3' : GAME_UI_SIZES.NEXT_PIECE.CELL;
  const containerSize = size === 'sm' ? 'w-12 h-12' : GAME_UI_SIZES.NEXT_PIECE.CONTAINER;

  return (
    <CyberCard title={t('game.nextPieceUpper')} theme='cyan' size={size} data-testid='next-piece'>
      <div className='grid gap-0 w-fit mx-auto p-2 bg-black/30 rounded-lg border border-cyan-400/30'>
        {nextPiece ? (
          nextPiece.shape.map((row, y) => (
            <div key={`next-piece-row-${y}`} className='flex'>
              {row.map((cell, x) => (
                <div
                  key={`${y}-${x}`}
                  className={`${cellSize} border border-gray-600/50 relative ${
                    cell ? 'shadow-[0_0_10px_rgba(255,255,255,0.3)]' : 'bg-transparent'
                  }`}
                  style={{
                    backgroundColor: cell ? nextPiece.color : 'transparent',
                  }}
                >
                  {cell === 1 && <div className='absolute inset-0 bg-current opacity-20 blur-sm' />}
                </div>
              ))}
            </div>
          ))
        ) : (
          <div className={`${containerSize} bg-gray-700/50 rounded border border-gray-500`} />
        )}
      </div>
    </CyberCard>
  );
});

export default NextPiecePanel;
