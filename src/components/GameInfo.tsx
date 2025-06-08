'use client';

import { memo, useState } from 'react';
import { Tetromino } from '../types/tetris';
import HighScoreDisplay from './HighScoreDisplay';
import StatisticsDashboard from './StatisticsDashboard';
import { ThemeSettingsMemo } from './ThemeSettings';
import { 
  useHighScores, 
  useStatistics, 
  useGameStore,
  useSettings
} from '../store/gameStore';
import { useThemeManager } from '../hooks/useThemeManager';
import { calculateEnhancedStatistics } from '../utils/statisticsUtils';

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
  const { highScores } = useHighScores();
  const { statistics } = useStatistics();
  const { settings, updateSettings } = useSettings();
  
  // テーマ関連の状態とアクション
  const themeState = useGameStore(state => state.theme);
  const { 
    setTheme, 
    updateThemeState, 
    setCustomColors, 
    setAccessibilityOptions,
    resetThemeToDefault 
  } = useGameStore();

  const themeManager = useThemeManager({
    themeState,
    setTheme,
    updateThemeState,
    setAccessibilityOptions
  });
  
  const [activeTab, setActiveTab] = useState<'game' | 'stats' | 'theme'>('game');

  // Calculate enhanced statistics
  const enhancedStats = calculateEnhancedStatistics(
    statistics,
    [], // We'll use playSessions later for more detailed tracking
    highScores
  );

  return (
    <div className="text-white space-y-6 min-w-[280px]">
      {/* Tab Navigation */}
      <div className="flex space-x-2">
        <button
          onClick={() => setActiveTab('game')}
          className={`px-4 py-2 rounded-t-lg font-semibold transition-colors ${
            activeTab === 'game'
              ? 'bg-cyan-500/20 text-cyan-400 border-b-2 border-cyan-400'
              : 'bg-gray-800/50 text-gray-400 hover:text-cyan-400'
          }`}
        >
          Game Info
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={`px-4 py-2 rounded-t-lg font-semibold transition-colors ${
            activeTab === 'stats'
              ? 'bg-purple-500/20 text-purple-400 border-b-2 border-purple-400'
              : 'bg-gray-800/50 text-gray-400 hover:text-purple-400'
          }`}
        >
          Statistics
        </button>
        <button
          onClick={() => setActiveTab('theme')}
          className={`px-4 py-2 rounded-t-lg font-semibold transition-colors ${
            activeTab === 'theme'
              ? 'bg-yellow-500/20 text-yellow-400 border-b-2 border-yellow-400'
              : 'bg-gray-800/50 text-gray-400 hover:text-yellow-400'
          }`}
        >
          Theme
        </button>
      </div>

      {activeTab === 'stats' ? (
        <StatisticsDashboard 
          statistics={enhancedStats}
          highScores={highScores}
          showDetailedView={true}
        />
      ) : activeTab === 'theme' ? (
        <ThemeSettingsMemo
          currentTheme={themeState.current}
          colors={themeState.config.colors}
          colorBlindnessType={themeState.accessibility.colorBlindnessType}
          contrast={themeState.accessibility.contrast}
          animationIntensity={themeState.accessibility.animationIntensity}
          reducedMotion={themeState.accessibility.reducedMotion}
          effectIntensity={themeState.effectIntensity}
          animations={themeState.animations}
          onThemeChange={themeManager.changeTheme}
          onColorsChange={setCustomColors}
          onAccessibilityChange={themeManager.updateAccessibility}
          onEffectIntensityChange={themeManager.updateEffectIntensity}
          onAnimationsToggle={themeManager.toggleAnimations}
          onResetToDefault={resetThemeToDefault}
        />
      ) : (
        <>
          {/* スコア情報 */}
      <div className="hologram-cyan neon-border p-4 md:p-6 rounded-lg relative overflow-hidden">
        <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4 text-cyan-400 relative">SCORE DATA</h3>
        <div className="space-y-2 md:space-y-3 relative">
          <div className="flex justify-between items-center">
            <span className="text-gray-300 text-sm md:text-base">SCORE</span>
            <span className="font-mono text-lg md:text-2xl text-yellow-400 font-bold tracking-wider">{score.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300 text-sm md:text-base">LEVEL</span>
            <span className="font-mono text-base md:text-xl text-green-400 font-bold">{level}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300 text-sm md:text-base">LINES</span>
            <span className="font-mono text-base md:text-xl text-blue-400 font-bold">{lines}</span>
          </div>
        </div>
      </div>

      {/* 次のピース */}
      <div className="hologram-purple neon-border-purple p-4 md:p-6 rounded-lg relative overflow-hidden">
        <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4 text-purple-400 relative">NEXT PIECE</h3>
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

      {/* 音設定 */}
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
              onClick={() => updateSettings({ virtualControlsEnabled: !settings.virtualControlsEnabled })}
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

      {/* ボタン */}
      <div className="space-y-4">
        <button
          onClick={onTogglePause}
          disabled={gameOver}
          className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 
                     disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-2 md:py-3 px-4 md:px-6 rounded-lg 
                     transition-all duration-300 transform hover:scale-105 disabled:scale-100 
                     shadow-[0_0_20px_rgba(0,255,255,0.3)] hover:shadow-[0_0_30px_rgba(0,255,255,0.5)]
                     border border-cyan-400/50 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-blue-400/20 blur-sm"></div>
          <span className="relative font-mono text-base md:text-lg">
            {isPaused ? 'RESUME' : 'PAUSE'}
          </span>
        </button>
        
        <button
          onClick={onReset}
          className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-400 hover:to-pink-400 
                     text-white font-bold py-2 md:py-3 px-4 md:px-6 rounded-lg transition-all duration-300 transform 
                     hover:scale-105 shadow-[0_0_20px_rgba(255,0,0,0.3)] hover:shadow-[0_0_30px_rgba(255,0,0,0.5)]
                     border border-red-400/50 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-red-400/20 to-pink-400/20 blur-sm"></div>
          <span className="relative font-mono text-base md:text-lg">RESET</span>
        </button>
      </div>

      {/* スコア目安 */}
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

      {/* ハイスコア */}
      <HighScoreDisplay 
        highScores={highScores} 
        maxDisplay={5}
        className="text-sm"
      />
        </>
      )}
    </div>
  );
});

export default GameInfo;