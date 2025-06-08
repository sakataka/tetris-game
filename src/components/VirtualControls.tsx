'use client';

import React from 'react';
import { BUTTONS, ARIA_LABELS } from '../constants/strings';

interface VirtualControlsProps {
  onMove: (direction: { x: number; y: number }) => void;
  onRotate: () => void;
  onHardDrop: () => void;
  isVisible: boolean;
  unlockAudio?: () => Promise<void>;
}

export default function VirtualControls({ 
  onMove, 
  onRotate, 
  onHardDrop, 
  isVisible,
  unlockAudio
}: VirtualControlsProps) {
  if (!isVisible) return null;

  const handleTouchStart = (action: () => void) => (e: React.TouchEvent) => {
    e.preventDefault();
    // 初回タッチ時に音声をアンロック
    if (unlockAudio) {
      unlockAudio();
    }
    action();
  };

  return (
    <div className="h-full w-full flex items-center justify-center bg-gradient-to-t from-black/80 to-transparent">
      <div className="flex justify-between items-center w-full max-w-sm px-4">
        
        {/* 左側: 十字方向パッド */}
        <div className="relative">
          {/* 回転ボタン (上) */}
          <button
            onTouchStart={handleTouchStart(onRotate)}
            className="absolute left-1/2 -translate-x-1/2 -translate-y-full mb-1
                      w-10 h-10 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500
                      hover:from-purple-400 hover:to-pink-400 active:scale-95
                      border border-purple-400/50 shadow-[0_0_15px_rgba(147,51,234,0.5)]
                      flex items-center justify-center text-white font-bold text-sm
                      touch-manipulation select-none"
            aria-label={ARIA_LABELS.ROTATE}
          >
            ↻
          </button>

          {/* 水平移動とソフトドロップ */}
          <div className="flex items-center gap-1">
            {/* 左移動 */}
            <button
              onTouchStart={handleTouchStart(() => onMove({ x: -1, y: 0 }))}
              className="w-10 h-10 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500
                        hover:from-cyan-400 hover:to-blue-400 active:scale-95
                        border border-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,0.5)]
                        flex items-center justify-center text-white font-bold text-sm
                        touch-manipulation select-none"
              aria-label={ARIA_LABELS.MOVE_LEFT}
            >
              ←
            </button>

            {/* ソフトドロップ (下) */}
            <button
              onTouchStart={handleTouchStart(() => onMove({ x: 0, y: 1 }))}
              className="w-10 h-10 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500
                        hover:from-yellow-400 hover:to-orange-400 active:scale-95
                        border border-yellow-400/50 shadow-[0_0_15px_rgba(245,158,11,0.5)]
                        flex items-center justify-center text-white font-bold text-sm
                        touch-manipulation select-none"
              aria-label={ARIA_LABELS.SOFT_DROP}
            >
              ↓
            </button>

            {/* 右移動 */}
            <button
              onTouchStart={handleTouchStart(() => onMove({ x: 1, y: 0 }))}
              className="w-10 h-10 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500
                        hover:from-cyan-400 hover:to-blue-400 active:scale-95
                        border border-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,0.5)]
                        flex items-center justify-center text-white font-bold text-sm
                        touch-manipulation select-none"
              aria-label={ARIA_LABELS.MOVE_RIGHT}
            >
              →
            </button>
          </div>
        </div>

        {/* 右側: ハードドロップボタン */}
        <button
          onTouchStart={handleTouchStart(onHardDrop)}
          className="w-14 h-14 rounded-lg bg-gradient-to-r from-red-500 to-pink-500
                    hover:from-red-400 hover:to-pink-400 active:scale-95
                    border border-red-400/50 shadow-[0_0_20px_rgba(239,68,68,0.6)]
                    flex flex-col items-center justify-center text-white font-bold
                    touch-manipulation select-none"
          aria-label={ARIA_LABELS.HARD_DROP}
        >
          <div className="text-sm">⚡</div>
          <div className="text-xs">{BUTTONS.DROP}</div>
        </button>
      </div>
    </div>
  );
}