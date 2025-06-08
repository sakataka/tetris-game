'use client';

import { memo, useState } from 'react';
import { Tetromino } from '../types/tetris';
import HighScoreDisplay from './HighScoreDisplay';
import StatisticsDashboard from './StatisticsDashboard';
import { ThemeSettingsMemo } from './ThemeSettings';
import GameStatsPanel from './GameStatsPanel';
import NextPiecePanel from './NextPiecePanel';
import ControlsPanel from './ControlsPanel';
import AudioPanel from './AudioPanel';
import GameButtonsPanel from './GameButtonsPanel';
import ScoringPanel from './ScoringPanel';
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
          <GameStatsPanel 
            score={score}
            level={level}
            lines={lines}
          />

          {/* 次のピース */}
          <NextPiecePanel 
            nextPiece={nextPiece}
          />

          {/* コントロール */}
          <ControlsPanel />

          {/* 音設定 */}
          <AudioPanel 
            isMuted={isMuted}
            volume={volume}
            settings={settings}
            onToggleMute={onToggleMute}
            onVolumeChange={onVolumeChange}
            onUpdateSettings={updateSettings}
          />

          {/* ボタン */}
          <GameButtonsPanel 
            gameOver={gameOver}
            isPaused={isPaused}
            onTogglePause={onTogglePause}
            onReset={onReset}
          />

          {/* スコア目安 */}
          <ScoringPanel />

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