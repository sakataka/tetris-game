/**
 * Strict Component Prop Types
 *
 * Type-safe prop definitions for all components with proper constraints
 */

import type { CSSProperties, ReactNode } from 'react';
import type { GameKeyHandler, GameTouchHandler } from './events';
import type {
  AnimationIntensity,
  GameSettings,
  GameState,
  GameStatistics,
  HighScore,
  PlayerId,
  SessionId,
  SoundKey,
  ThemeConfig,
  VirtualControl,
} from './tetris';

// Base component props
export interface BaseComponentProps {
  className?: string;
  style?: CSSProperties;
  testId?: string;
}

// Layout component props
export interface LayoutProps extends BaseComponentProps {
  children: ReactNode;
  variant?: 'desktop' | 'mobile';
}

// Game components
export interface TetrisBoardProps extends BaseComponentProps {
  board: GameState['board'];
  currentPiece: GameState['currentPiece'];
  ghostPiece?: GameState['currentPiece']; // Ghost piece is optional and same type as current piece
  lineEffect: GameState['lineEffect'];
  showGrid?: boolean;
  animationIntensity?: AnimationIntensity;
}

export interface GameInfoProps extends BaseComponentProps {
  gameState: GameState;
  highScores: readonly HighScore[];
  statistics: GameStatistics;
  settings: GameSettings;
  theme: ThemeConfig;
  isMobile?: boolean;
}

export interface GameControllerAPIProps {
  // Game state
  gameState: GameState;
  isPaused: boolean;
  isGameOver: boolean;

  // Actions
  onStartGame: () => void;
  onPauseGame: () => void;
  onResumeGame: () => void;
  onResetGame: () => void;

  // Controls
  onMovePiece: (direction: 'left' | 'right' | 'down') => void;
  onRotatePiece: () => void;
  onHardDrop: () => void;

  // Settings
  settings: GameSettings;
  onUpdateSettings: (updates: Partial<GameSettings>) => void;

  // Audio
  playSound: (soundKey: SoundKey) => void;
  isMuted: boolean;

  // Device info
  isMobile: boolean;
  deviceType: 'desktop' | 'mobile' | 'tablet';
}

// Panel component props

export interface NextPiecePanelProps extends BaseComponentProps {
  nextPiece: GameState['nextPiece'];
  showPieceQueue?: boolean;
  queueLength?: number;
}

export interface ControlsPanelProps extends BaseComponentProps {
  keyBindings: GameSettings['keyBindings'];
  onEditBindings?: () => void;
  showTouchControls?: boolean;
}

export interface AudioPanelProps extends BaseComponentProps {
  volume: number;
  isMuted: boolean;
  onVolumeChange: (volume: number) => void;
  onMuteToggle: () => void;
  showAdvancedControls?: boolean;
}

export interface GameButtonsPanelProps extends BaseComponentProps {
  isPaused: boolean;
  isGameOver: boolean;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  disableControls?: boolean;
}

export interface ScoringPanelProps extends BaseComponentProps {
  lastScoreEvent?: {
    points: number;
    reason: string;
    timestamp: number;
  };
  multiplier?: number;
  showBreakdown?: boolean;
}

// Statistics components
export interface StatisticsDashboardProps extends BaseComponentProps {
  statistics: GameStatistics;
  timeRange?: 'today' | 'week' | 'month' | 'all';
  onTimeRangeChange?: (range: 'today' | 'week' | 'month' | 'all') => void;
  showCharts?: boolean;
}

export interface HighScoreDisplayProps extends BaseComponentProps {
  highScores: readonly HighScore[];
  currentScore?: number;
  playerId?: PlayerId;
  onNameSubmit?: (name: string) => void;
  maxEntries?: number;
}

// Theme components
export interface ThemeSelectorProps extends BaseComponentProps {
  currentTheme: ThemeConfig;
  onThemeChange: (theme: ThemeConfig) => void;
  showPreview?: boolean;
  allowCustomThemes?: boolean;
}

export interface ColorPaletteEditorProps extends BaseComponentProps {
  colors: ThemeConfig['colors'];
  onChange: (colors: ThemeConfig['colors']) => void;
  showAccessibilityInfo?: boolean;
  validateContrast?: boolean;
}

// Virtual controls
export interface VirtualControlsProps extends BaseComponentProps {
  onControlPress: (control: VirtualControl) => void;
  onControlRelease: (control: VirtualControl) => void;
  layout?: 'default' | 'compact' | 'split';
  hapticFeedback?: boolean;
}

// Effects components
export interface ParticleEffectProps extends BaseComponentProps {
  particles: Array<{
    id: string;
    x: number;
    y: number;
    color: string;
    velocity: { x: number; y: number };
    lifetime: number;
  }>;
  width: number;
  height: number;
  enabled?: boolean;
}

// Message components
export interface GameOverMessageProps extends BaseComponentProps {
  score: number;
  level: number;
  isHighScore: boolean;
  onRestart: () => void;
  onMainMenu?: () => void;
}

export interface PausedMessageProps extends BaseComponentProps {
  onResume: () => void;
  onRestart: () => void;
  showControls?: boolean;
}

// Error components
export interface ErrorBoundaryProps extends BaseComponentProps {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error) => ReactNode);
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  level?: 'page' | 'component';
}

// Session components
export interface SessionTrackerProps {
  sessionId: SessionId;
  playerId: PlayerId;
  onSessionEnd?: (stats: { duration: number; score: number }) => void;
}

// Type for component with forwarded ref
export type ForwardedComponentProps<T, P = Record<string, unknown>> = P & {
  ref?: React.Ref<T>;
};

// Strict event handler props
export interface StrictEventHandlers {
  onKeyDown?: GameKeyHandler;
  onKeyUp?: GameKeyHandler;
  onTouchStart?: GameTouchHandler;
  onTouchEnd?: GameTouchHandler;
  onTouchMove?: GameTouchHandler;
}

// Render prop pattern types
export type RenderProp<T> = (props: T) => ReactNode;

export interface RenderPropComponent<T> {
  children: RenderProp<T>;
}

// HOC prop injection types
export type WithoutInjectedProps<P, I> = Omit<P, keyof I>;

export interface InjectedGameProps {
  gameState: GameState;
  settings: GameSettings;
}

// Component composition types
export interface ComposableComponent<P = Record<string, unknown>> {
  Header?: React.ComponentType<P>;
  Body?: React.ComponentType<P>;
  Footer?: React.ComponentType<P>;
}
