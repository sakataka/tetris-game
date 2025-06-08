'use client';

import { memo } from 'react';

const ScoringPanel = memo(function ScoringPanel() {
  return (
    <div className="hologram-yellow neon-border-yellow p-4 md:p-6 rounded-lg relative overflow-hidden">
      <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4 text-yellow-400 relative">SCORING</h3>
      <div className="space-y-2 text-xs md:text-sm relative">
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
  );
});

export default ScoringPanel;