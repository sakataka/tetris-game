'use client';

import { memo, useState } from 'react';
import { Tetromino } from '../types/tetris';
import HighScoreDisplay from './HighScoreDisplay';
import StatisticsDashboard from './StatisticsDashboard';
import { ThemeSettingsMemo } from './ThemeSettings';
import { NAVIGATION, LABELS } from '../constants/strings';
import GameStatsPanel from './GameStatsPanel';
import NextPiecePanel from './NextPiecePanel';
import ControlsPanel from './ControlsPanel';
import AudioPanel from './AudioPanel';
import GameButtonsPanel from './GameButtonsPanel';
import ScoringPanel from './ScoringPanel';
import { 
  useSettings,
  useSettingsActions
} from '../store/settingsStore';
import {
  useHighScores,
  useStatistics
} from '../store/statisticsStore';
import {
  useTheme,
  useThemeActions
} from '../store/themeStore';
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
  // Audio system status for enhanced display
  audioSystemStatus?: {
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
  };
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
  onVolumeChange,
  audioSystemStatus
}: GameInfoProps) {
  const highScores = useHighScores();
  const statistics = useStatistics();
  const settings = useSettings();
  const { updateSettings } = useSettingsActions();
  
  // テーマ関連の状態とアクション
  const themeState = useTheme();
  const { 
    setTheme, 
    updateThemeState, 
    setCustomColors, 
    setAccessibilityOptions,
    resetThemeToDefault 
  } = useThemeActions();

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
    <div className="text-white h-full flex flex-col min-w-[280px]">
      {/* Tab Navigation - デスクトップのみ表示 */}
      <div className="hidden md:flex space-x-2 mb-4 flex-shrink-0">
        <button
          onClick={() => setActiveTab('game')}
          className={`px-4 py-2 rounded-t-lg font-semibold transition-colors ${
            activeTab === 'game'
              ? 'bg-cyan-500/20 text-cyan-400 border-b-2 border-cyan-400'
              : 'bg-gray-800/50 text-gray-400 hover:text-cyan-400'
          }`}
        >
          {NAVIGATION.GAME_INFO}
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={`px-4 py-2 rounded-t-lg font-semibold transition-colors ${
            activeTab === 'stats'
              ? 'bg-purple-500/20 text-purple-400 border-b-2 border-purple-400'
              : 'bg-gray-800/50 text-gray-400 hover:text-purple-400'
          }`}
        >
          {NAVIGATION.STATISTICS}
        </button>
        <button
          onClick={() => setActiveTab('theme')}
          className={`px-4 py-2 rounded-t-lg font-semibold transition-colors ${
            activeTab === 'theme'
              ? 'bg-yellow-500/20 text-yellow-400 border-b-2 border-yellow-400'
              : 'bg-gray-800/50 text-gray-400 hover:text-yellow-400'
          }`}
        >
          {NAVIGATION.THEME}
        </button>
      </div>

      {/* コンテンツエリア */}
      <div className="flex-1 overflow-auto">
        {/* デスクトップ: タブ切替表示 */}
        <div className="hidden md:block">
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
            <div className="space-y-4">
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
                audioStatus={audioSystemStatus}
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
            </div>
          )}
        </div>

        {/* モバイル: コンパクト表示（ゲーム情報のみ） */}
        <div className="md:hidden flex space-x-4 h-full overflow-hidden">
          {/* スコア情報 */}
          <div className="flex-1 min-w-0">
            <div className="hologram-cyan neon-border p-2 rounded-lg text-xs">
              <div className="font-bold text-cyan-400 mb-1">{LABELS.SCORE}</div>
              <div className="text-lg font-mono">{score.toLocaleString()}</div>
              <div className="text-gray-400 text-xs">L{level} • {lines} lines</div>
            </div>
          </div>

          {/* 次のピース */}
          <div className="w-16 flex-shrink-0">
            <div className="hologram-purple neon-border p-2 rounded-lg h-full">
              <div className="font-bold text-purple-400 text-xs mb-1">{LABELS.NEXT}</div>
              <NextPiecePanel nextPiece={nextPiece} />
            </div>
          </div>

          {/* ゲームボタン */}
          <div className="w-20 flex-shrink-0">
            <GameButtonsPanel 
              gameOver={gameOver}
              isPaused={isPaused}
              onTogglePause={onTogglePause}
              onReset={onReset}
            />
          </div>
        </div>
      </div>
    </div>
  );
});

export default GameInfo;