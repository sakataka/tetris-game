'use client';

import { Tetromino } from '../types/tetris';

interface GameInfoProps {
  score: number;
  level: number;
  lines: number;
  nextPiece: Tetromino | null;
  gameOver: boolean;
  isPaused: boolean;
  onReset: () => void;
  onTogglePause: () => void;
}

export default function GameInfo({
  score,
  level,
  lines,
  nextPiece,
  gameOver,
  isPaused,
  onReset,
  onTogglePause
}: GameInfoProps) {
  return (
    <div className="text-white space-y-6">
      {/* スコア情報 */}
      <div className="bg-gray-800 p-4 rounded-lg">
        <h3 className="text-lg font-bold mb-3">スコア</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>スコア:</span>
            <span className="font-mono">{score.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>レベル:</span>
            <span className="font-mono">{level}</span>
          </div>
          <div className="flex justify-between">
            <span>ライン:</span>
            <span className="font-mono">{lines}</span>
          </div>
        </div>
      </div>

      {/* 次のピース */}
      <div className="bg-gray-800 p-4 rounded-lg">
        <h3 className="text-lg font-bold mb-3">次のピース</h3>
        <div className="grid gap-0 w-fit mx-auto">
          {nextPiece ? (
            nextPiece.shape.map((row, y) => (
              <div key={y} className="flex">
                {row.map((cell, x) => (
                  <div
                    key={`${y}-${x}`}
                    className={`w-4 h-4 border border-gray-700 ${
                      cell ? '' : 'bg-transparent'
                    }`}
                    style={{
                      backgroundColor: cell ? nextPiece.color : 'transparent'
                    }}
                  />
                ))}
              </div>
            ))
          ) : (
            <div className="w-16 h-16 bg-gray-700 rounded"></div>
          )}
        </div>
      </div>

      {/* コントロール */}
      <div className="bg-gray-800 p-4 rounded-lg">
        <h3 className="text-lg font-bold mb-3">コントロール</h3>
        <div className="space-y-2 text-sm">
          <div><span className="font-mono">←→</span> 移動</div>
          <div><span className="font-mono">↓</span> 下移動</div>
          <div><span className="font-mono">↑</span> 回転</div>
          <div><span className="font-mono">スペース</span> ハードドロップ</div>
          <div><span className="font-mono">P</span> 一時停止</div>
          <div><span className="font-mono">R</span> リセット</div>
        </div>
      </div>

      {/* ボタン */}
      <div className="space-y-3">
        <button
          onClick={onTogglePause}
          disabled={gameOver}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 
                     text-white font-bold py-2 px-4 rounded transition-colors"
        >
          {isPaused ? '再開' : '一時停止'}
        </button>
        
        <button
          onClick={onReset}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold 
                     py-2 px-4 rounded transition-colors"
        >
          リセット
        </button>
      </div>

      {/* ハイスコア目安 */}
      <div className="bg-gray-800 p-4 rounded-lg">
        <h3 className="text-lg font-bold mb-3">スコア目安</h3>
        <div className="space-y-1 text-sm">
          <div>1ライン: 100 × レベル</div>
          <div>2ライン: 200 × レベル</div>
          <div>3ライン: 300 × レベル</div>
          <div>4ライン: 700 × レベル (テトリス!)</div>
          <div>ハードドロップ: 距離 × 2</div>
        </div>
      </div>
    </div>
  );
}