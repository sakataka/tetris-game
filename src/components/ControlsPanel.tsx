'use client';

import { memo } from 'react';

const ControlsPanel = memo(function ControlsPanel() {
  return (
    <div className="hologram neon-border p-4 md:p-6 rounded-lg relative overflow-hidden">
      <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4 text-green-400 relative">CONTROLS</h3>
      <div className="space-y-2 md:space-y-3 text-xs md:text-sm relative">
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
  );
});

export default ControlsPanel;