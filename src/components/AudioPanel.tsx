'use client';

import { memo } from 'react';
import { GameSettings } from '../types/tetris';

interface AudioSystemStatus {
  isWebAudioEnabled: boolean;
  preloadProgress?: {
    total: number;
    loaded: number;
    failed: number;
    progress: number;
  };
  fallbackStatus?: {
    currentLevel: number;
    availableLevels: string[];
    silentMode: boolean;
  };
  detailedState?: {
    initialized: boolean;
    suspended: boolean;
    loadedSounds: string[];
    activeSounds: number;
  };
}

interface AudioPanelProps {
  isMuted: boolean;
  volume: number;
  settings: GameSettings;
  audioStatus?: AudioSystemStatus;
  onToggleMute: () => void;
  onVolumeChange: (volume: number) => void;
  onUpdateSettings: (settings: Partial<GameSettings>) => void;
}

const AudioPanel = memo(function AudioPanel({
  isMuted,
  volume,
  settings,
  audioStatus,
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

        {/* Audio System Status Section */}
        {audioStatus && (
          <div className="border-t border-cyan-400/30 pt-3 md:pt-4 space-y-2 md:space-y-3">
            <h4 className="text-sm font-semibold text-cyan-300 mb-2">SYSTEM STATUS</h4>
            
            {/* Audio Engine Type */}
            <div className="flex justify-between items-center">
              <span className="text-gray-300 text-xs md:text-sm">Engine</span>
              <span className={`font-mono text-xs px-2 py-1 rounded ${
                audioStatus.isWebAudioEnabled 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-yellow-500/20 text-yellow-400'
              }`}>
                {audioStatus.isWebAudioEnabled ? 'Web Audio API' : 'HTML Audio'}
              </span>
            </div>

            {/* Preload Progress */}
            {audioStatus.preloadProgress && (
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-xs md:text-sm">Preload</span>
                  <span className="font-mono text-xs text-cyan-400">
                    {audioStatus.preloadProgress.loaded}/{audioStatus.preloadProgress.total}
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-1.5">
                  <div 
                    className="bg-cyan-400 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${audioStatus.preloadProgress.progress * 100}%` }}
                  />
                </div>
                {audioStatus.preloadProgress.failed > 0 && (
                  <span className="text-red-400 text-xs">
                    {audioStatus.preloadProgress.failed} failed
                  </span>
                )}
              </div>
            )}

            {/* Detailed State */}
            {audioStatus.detailedState && (
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-xs md:text-sm">Status</span>
                  <span className={`font-mono text-xs px-2 py-1 rounded ${
                    audioStatus.detailedState.initialized 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {audioStatus.detailedState.initialized ? 'Ready' : 'Loading'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-xs md:text-sm">Loaded</span>
                  <span className="font-mono text-xs text-cyan-400">
                    {audioStatus.detailedState.loadedSounds.length}/6
                  </span>
                </div>
                {audioStatus.detailedState.activeSounds > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300 text-xs md:text-sm">Playing</span>
                    <span className="font-mono text-xs text-yellow-400">
                      {audioStatus.detailedState.activeSounds}
                    </span>
                  </div>
                )}
                {audioStatus.detailedState.suspended && (
                  <div className="text-xs text-yellow-400 text-center pt-1">
                    Tap to unlock audio
                  </div>
                )}
              </div>
            )}

            {/* Fallback Status */}
            {audioStatus.fallbackStatus && (
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-xs md:text-sm">Fallback</span>
                  <span className="font-mono text-xs text-cyan-400">
                    Level {audioStatus.fallbackStatus.currentLevel + 1}
                  </span>
                </div>
                <div className="text-xs text-gray-400">
                  {audioStatus.fallbackStatus.availableLevels[audioStatus.fallbackStatus.currentLevel] || 'Unknown'}
                </div>
                {audioStatus.fallbackStatus.silentMode && (
                  <div className="text-xs text-red-400 text-center">
                    Silent Mode Active
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

export default AudioPanel;