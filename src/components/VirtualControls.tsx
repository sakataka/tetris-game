'use client';

import React from 'react';

interface VirtualControlsProps {
  onMove: (direction: { x: number; y: number }) => void;
  onRotate: () => void;
  onHardDrop: () => void;
  isVisible: boolean;
}

export default function VirtualControls({ 
  onMove, 
  onRotate, 
  onHardDrop, 
  isVisible 
}: VirtualControlsProps) {
  if (!isVisible) return null;

  const handleTouchStart = (action: () => void) => (e: React.TouchEvent) => {
    e.preventDefault();
    action();
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-4 bg-gradient-to-t from-black/80 to-transparent pointer-events-none">
      <div className="flex justify-between items-end max-w-screen-xl mx-auto pointer-events-auto">
        
        {/* 左側: 十字方向パッド */}
        <div className="relative">
          {/* 回転ボタン (上) */}
          <button
            onTouchStart={handleTouchStart(onRotate)}
            className="absolute left-1/2 -translate-x-1/2 -translate-y-full mb-2
                      w-12 h-12 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500
                      hover:from-purple-400 hover:to-pink-400 active:scale-95
                      border border-purple-400/50 shadow-[0_0_20px_rgba(147,51,234,0.5)]
                      flex items-center justify-center text-white font-bold
                      touch-manipulation select-none"
            aria-label="回転"
          >
            ↻
          </button>

          {/* 水平移動とソフトドロップ */}
          <div className="flex items-center gap-2">
            {/* 左移動 */}
            <button
              onTouchStart={handleTouchStart(() => onMove({ x: -1, y: 0 }))}
              className="w-12 h-12 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500
                        hover:from-cyan-400 hover:to-blue-400 active:scale-95
                        border border-cyan-400/50 shadow-[0_0_20px_rgba(6,182,212,0.5)]
                        flex items-center justify-center text-white font-bold
                        touch-manipulation select-none"
              aria-label="左移動"
            >
              ←
            </button>

            {/* ソフトドロップ (下) */}
            <button
              onTouchStart={handleTouchStart(() => onMove({ x: 0, y: 1 }))}
              className="w-12 h-12 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500
                        hover:from-yellow-400 hover:to-orange-400 active:scale-95
                        border border-yellow-400/50 shadow-[0_0_20px_rgba(245,158,11,0.5)]
                        flex items-center justify-center text-white font-bold
                        touch-manipulation select-none"
              aria-label="ソフトドロップ"
            >
              ↓
            </button>

            {/* 右移動 */}
            <button
              onTouchStart={handleTouchStart(() => onMove({ x: 1, y: 0 }))}
              className="w-12 h-12 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500
                        hover:from-cyan-400 hover:to-blue-400 active:scale-95
                        border border-cyan-400/50 shadow-[0_0_20px_rgba(6,182,212,0.5)]
                        flex items-center justify-center text-white font-bold
                        touch-manipulation select-none"
              aria-label="右移動"
            >
              →
            </button>
          </div>
        </div>

        {/* 右側: ハードドロップボタン */}
        <button
          onTouchStart={handleTouchStart(onHardDrop)}
          className="w-16 h-16 rounded-lg bg-gradient-to-r from-red-500 to-pink-500
                    hover:from-red-400 hover:to-pink-400 active:scale-95
                    border border-red-400/50 shadow-[0_0_30px_rgba(239,68,68,0.6)]
                    flex flex-col items-center justify-center text-white font-bold
                    touch-manipulation select-none"
          aria-label="ハードドロップ"
        >
          <div className="text-lg">⚡</div>
          <div className="text-xs">DROP</div>
        </button>
      </div>
    </div>
  );
}