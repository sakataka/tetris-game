'use client';

import { memo } from 'react';
import { GameSettings } from '../types/tetris';

interface AudioPanelProps {
  isMuted: boolean;
  volume: number;
  settings: GameSettings;
  onToggleMute: () => void;
  onVolumeChange: (volume: number) => void;
  onUpdateSettings: (settings: Partial<GameSettings>) => void;
}

const AudioPanel = memo(function AudioPanel({
  isMuted,
  volume,
  settings,
  onToggleMute,
  onVolumeChange,
  onUpdateSettings
}: AudioPanelProps) {
  return (
    <div className="hologram-cyan neon-border p-4 md:p-6 rounded-lg relative overflow-hidden">
      <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4 text-cyan-400 relative">AUDIO</h3>
      <div className="space-y-3 md:space-y-4 relative">
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
        <div className="flex justify-between items-center">
          <span className="text-gray-300">Virtual Controls</span>
          <button
            onClick={() => onUpdateSettings({ virtualControlsEnabled: !settings.virtualControlsEnabled })}
            className={`px-3 py-1 rounded font-mono text-sm transition-all duration-300 ${
              settings.virtualControlsEnabled 
                ? 'bg-green-500/20 text-green-400 border border-green-400/50' 
                : 'bg-gray-500/20 text-gray-400 border border-gray-400/50'
            }`}
          >
            {settings.virtualControlsEnabled ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>
    </div>
  );
});

export default AudioPanel;