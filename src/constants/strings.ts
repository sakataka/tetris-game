/**
 * アプリケーション内で使用する文字列定数
 * 多言語化対応の準備として、ハードコードされた文字列をここに集約
 */

// ゲーム状態表示
export const GAME_STATES = {
  GAME_OVER: 'GAME OVER',
  PAUSED: 'PAUSED',
  LOADING: 'Loading Game...',
  RESTART_INSTRUCTION: 'Enterキーまたはスペースキーで再開',
  PAUSE_INSTRUCTION: 'Pキーで再開',
} as const;

// ボタンテキスト
export const BUTTONS = {
  RESUME: 'RESUME',
  PAUSE: 'PAUSE',
  RESET: 'RESET',
  DROP: 'DROP',
  MUTE: 'ミュート',
  RESET_TO_DEFAULT: 'デフォルトに戻す',
  RESET_ALL: 'すべてリセット',
  ADVANCED_SETTINGS: '詳細設定',
} as const;

// タブ・ナビゲーション
export const NAVIGATION = {
  GAME_INFO: 'Game Info',
  STATISTICS: 'Statistics',
  THEME: 'Theme',
  THEME_SELECTION: 'テーマ選択',
  COLOR_SETTINGS: 'カラー設定',
  ACCESSIBILITY: 'アクセシビリティ',
  VISUAL_EFFECTS: 'エフェクト',
} as const;

// パネルタイトル
export const PANELS = {
  AUDIO: 'AUDIO',
  CONTROLS: 'CONTROLS',
  SCORE_DATA: 'SCORE DATA',
  NEXT_PIECE: 'NEXT PIECE',
  SCORING: 'SCORING',
  HIGH_SCORES: '🏆 High Scores',
  STATISTICS_DASHBOARD: '📊 Statistics Dashboard',
  PERFORMANCE_METRICS: '🎯 Performance Metrics',
  PLAY_HISTORY: '📅 Play History',
  RECENT_ACHIEVEMENTS: '🏆 Recent Achievements',
} as const;

// ラベル
export const LABELS = {
  SCORE: 'SCORE',
  LEVEL: 'LEVEL',
  LINES: 'LINES',
  NEXT: 'NEXT',
  VOLUME: '音量',
  VIRTUAL_CONTROLS: 'Virtual Controls',
  THEME_SELECTION_LABEL: 'テーマ選択',
  COLOR_PALETTE_SETTINGS: 'カラーパレット設定',
  ACCESSIBILITY_SETTINGS: 'アクセシビリティ設定',
  PRIMARY_COLOR: 'プライマリカラー',
  SECONDARY_COLOR: 'セカンダリカラー',
  EFFECT_INTENSITY: 'エフェクト強度',
  ANIMATION_ENABLED: 'アニメーション有効',
} as const;

// コントロール説明
export const CONTROLS = {
  MOVE: '移動',
  DOWN_MOVE: '下移動',
  ROTATE: '回転',
  HARD_DROP: 'ハードドロップ',
  PAUSE_ACTION: '一時停止',
  RESET_ACTION: 'リセット',
} as const;

// スコアリング表示
export const SCORING = {
  ONE_LINE: '1 LINE',
  TWO_LINES: '2 LINES',
  THREE_LINES: '3 LINES',
  FOUR_LINES: '4 LINES',
  TETRIS_BONUS: '★ TETRIS BONUS! ★',
  HARD_DROP_LABEL: 'HARD DROP',
} as const;

// 統計ラベル（英語）
export const STATISTICS = {
  TOTAL_GAMES: 'Total Games',
  BEST_SCORE: 'Best Score',
  TOTAL_LINES: 'Total Lines',
  PLAY_TIME: 'Play Time',
} as const;

// アクセシビリティ設定
export const ACCESSIBILITY = {
  COLOR_VISION_SUPPORT: '色覚対応',
  CONTRAST: 'コントラスト',
  ANIMATION_INTENSITY: 'アニメーション強度',
  REDUCED_MOTION: 'モーション感度軽減',
} as const;

// アクセシビリティ用aria-label
export const ARIA_LABELS = {
  ROTATE: '回転',
  MOVE_LEFT: '左移動',
  SOFT_DROP: 'ソフトドロップ',
  MOVE_RIGHT: '右移動',
  HARD_DROP: 'ハードドロップ',
} as const;

// エラー・通知メッセージ
export const MESSAGES = {
  NO_HIGH_SCORES: 'まだハイスコアがありません',
  FAILED_TO_LOAD_SOUND: 'Failed to load sound',
  AUDIO_REQUIRES_INTERACTION: 'Audio play requires user interaction',
  COULD_NOT_PLAY_SOUND: 'Could not play sound',
} as const;

// エフェクト名
export const UI_EFFECTS = {
  NEON_EFFECT: 'ネオンエフェクト',
  HOLOGRAM_BLUR: 'ホログラム + ブラー',
} as const;

// 状態表示
export const STATUS = {
  ON: 'ON',
  OFF: 'OFF',
} as const;

// 多言語化キー用の型定義
export type GameStatesKey = keyof typeof GAME_STATES;
export type ButtonsKey = keyof typeof BUTTONS;
export type NavigationKey = keyof typeof NAVIGATION;
export type PanelsKey = keyof typeof PANELS;
export type LabelsKey = keyof typeof LABELS;
export type ControlsKey = keyof typeof CONTROLS;
export type ScoringKey = keyof typeof SCORING;
export type StatisticsKey = keyof typeof STATISTICS;
export type AccessibilityKey = keyof typeof ACCESSIBILITY;
export type AriaLabelsKey = keyof typeof ARIA_LABELS;
export type MessagesKey = keyof typeof MESSAGES;
export type UIEffectsKey = keyof typeof UI_EFFECTS;
export type StatusKey = keyof typeof STATUS;

// 全文字列リソースの統合型
export type StringResourceKey = 
  | GameStatesKey 
  | ButtonsKey 
  | NavigationKey 
  | PanelsKey 
  | LabelsKey 
  | ControlsKey 
  | ScoringKey 
  | StatisticsKey 
  | AccessibilityKey 
  | AriaLabelsKey 
  | MessagesKey 
  | EffectsKey 
  | StatusKey;