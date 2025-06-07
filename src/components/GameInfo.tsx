'use client';

import { memo } from 'react';
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
  isMuted: boolean;
  volume: number;
  onToggleMute: () => void;
  onVolumeChange: (volume: number) => void;
}

const GameInfo = memo(function GameInfo({
  score,
  level,
  lines,
  nextPiece,
  gameOver,
  isPaused,
  onReset,
  onTogglePause,
  isMuted,
  volume,
  onToggleMute,
  onVolumeChange
}: GameInfoProps) {
  return (
    <div className="text-white space-y-6 min-w-[280px]">
      {/* スコア情報 */}
      <div className="hologram-cyan neon-border p-6 rounded-lg relative overflow-hidden">
        <h3 className="text-xl font-bold mb-4 text-cyan-400 relative">SCORE DATA</h3>
        <div className="space-y-3 relative">
          <div className="flex justify-between items-center">
            <span className="text-gray-300">SCORE</span>
            <span className="font-mono text-2xl text-yellow-400 font-bold tracking-wider">{score.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300">LEVEL</span>
            <span className="font-mono text-xl text-green-400 font-bold">{level}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300">LINES</span>
            <span className="font-mono text-xl text-blue-400 font-bold">{lines}</span>
          </div>
        </div>
      </div>

      {/* 次のピース */}
      <div className="hologram-purple neon-border-purple p-6 rounded-lg relative overflow-hidden">
        <h3 className="text-xl font-bold mb-4 text-purple-400 relative">NEXT PIECE</h3>
        <div className="grid gap-0 w-fit mx-auto p-4 bg-black/30 rounded-lg border border-purple-400/30">
          {nextPiece ? (
            nextPiece.shape.map((row, y) => (
              <div key={y} className="flex">
                {row.map((cell, x) => (
                  <div
                    key={`${y}-${x}`}
                    className={`w-5 h-5 border border-gray-600/50 relative ${
                      cell ? 'shadow-[0_0_10px_rgba(255,255,255,0.3)]' : 'bg-transparent'
                    }`}
                    style={{
                      backgroundColor: cell ? nextPiece.color : 'transparent'
                    }}
                  >
                    {cell === 1 && (
                      <div className="absolute inset-0 bg-current opacity-20 blur-sm"></div>
                    )}
                  </div>
                ))}
              </div>
            ))
          ) : (
            <div className="w-20 h-20 bg-gray-700/50 rounded border border-gray-500"></div>
          )}
        </div>
      </div>

      {/* コントロール */}
      <div className="hologram neon-border p-6 rounded-lg relative overflow-hidden">
        <h3 className="text-xl font-bold mb-4 text-green-400 relative">CONTROLS</h3>
        <div className="space-y-3 text-sm relative">
          <div className="flex justify-between items-center">
            <span className="text-gray-300">移動</span>
            <span className="font-mono bg-cyan-400/20 px-2 py-1 rounded text-cyan-400">←→</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300">下移動</span>
            <span className="font-mono bg-cyan-400/20 px-2 py-1 rounded text-cyan-400">↓</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300">回転</span>
            <span className="font-mono bg-cyan-400/20 px-2 py-1 rounded text-cyan-400">↑</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300">ハードドロップ</span>
            <span className="font-mono bg-yellow-400/20 px-2 py-1 rounded text-yellow-400">SPACE</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300">一時停止</span>
            <span className="font-mono bg-purple-400/20 px-2 py-1 rounded text-purple-400">P</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300">リセット</span>
            <span className="font-mono bg-red-400/20 px-2 py-1 rounded text-red-400">R</span>
          </div>
        </div>
      </div>

      {/* 音設定 */}
      <div className="hologram-cyan neon-border p-6 rounded-lg relative overflow-hidden">
        <h3 className="text-xl font-bold mb-4 text-cyan-400 relative">AUDIO</h3>
        <div className="space-y-4 relative">
          <div className="flex justify-between items-center">
            <span className="text-gray-300">音量</span>
            <div className="flex items-center space-x-2">
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                className="w-20 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer
                          [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 
                          [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-400 
                          [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(0,255,255,0.5)]"
              />
              <span className="font-mono text-cyan-400 text-sm w-8">{Math.round(volume * 100)}</span>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300">ミュート</span>
            <button
              onClick={onToggleMute}
              className={`px-3 py-1 rounded font-mono text-sm transition-all duration-300 ${
                isMuted 
                  ? 'bg-red-500/20 text-red-400 border border-red-400/50' 
                  : 'bg-green-500/20 text-green-400 border border-green-400/50'
              }`}
            >
              {isMuted ? 'OFF' : 'ON'}
            </button>
          </div>
        </div>
      </div>

      {/* ボタン */}
      <div className="space-y-4">
        <button
          onClick={onTogglePause}
          disabled={gameOver}
          className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 
                     disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-3 px-6 rounded-lg 
                     transition-all duration-300 transform hover:scale-105 disabled:scale-100 
                     shadow-[0_0_20px_rgba(0,255,255,0.3)] hover:shadow-[0_0_30px_rgba(0,255,255,0.5)]
                     border border-cyan-400/50 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-blue-400/20 blur-sm"></div>
          <span className="relative font-mono text-lg">
            {isPaused ? 'RESUME' : 'PAUSE'}
          </span>
        </button>
        
        <button
          onClick={onReset}
          className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-400 hover:to-pink-400 
                     text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform 
                     hover:scale-105 shadow-[0_0_20px_rgba(255,0,0,0.3)] hover:shadow-[0_0_30px_rgba(255,0,0,0.5)]
                     border border-red-400/50 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-red-400/20 to-pink-400/20 blur-sm"></div>
          <span className="relative font-mono text-lg">RESET</span>
        </button>
      </div>

      {/* スコア目安 */}
      <div className="hologram-yellow neon-border-yellow p-6 rounded-lg relative overflow-hidden">
        <h3 className="text-xl font-bold mb-4 text-yellow-400 relative">SCORING</h3>
        <div className="space-y-2 text-sm relative">
          <div className="flex justify-between items-center text-gray-300">
            <span>1 LINE</span>
            <span className="font-mono text-blue-400">100 × LV</span>
          </div>
          <div className="flex justify-between items-center text-gray-300">
            <span>2 LINES</span>
            <span className="font-mono text-green-400">200 × LV</span>
          </div>
          <div className="flex justify-between items-center text-gray-300">
            <span>3 LINES</span>
            <span className="font-mono text-yellow-400">300 × LV</span>
          </div>
          <div className="flex justify-between items-center text-gray-300">
            <span>4 LINES</span>
            <span className="font-mono text-red-400 font-bold">700 × LV</span>
          </div>
          <div className="text-center text-red-400 text-xs animate-pulse mt-2">
            ★ TETRIS BONUS! ★
          </div>
          <div className="flex justify-between items-center text-gray-300 border-t border-gray-600 pt-2">
            <span>HARD DROP</span>
            <span className="font-mono text-purple-400">DIST × 2</span>
          </div>
        </div>
      </div>
    </div>
  );
});

export default GameInfo;