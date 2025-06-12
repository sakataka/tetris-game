/**
 * String constants used within the application
 * Consolidate hardcoded strings here in preparation for internationalization support
 */

// Game state display
export const GAME_STATES = {
  GAME_OVER: 'GAME OVER',
  PAUSED: 'PAUSED',
  LOADING: 'Loading Game...',
  RESTART_INSTRUCTION: 'Press Enter or Space to restart',
  PAUSE_INSTRUCTION: 'Press P to resume',
} as const;

// Button text
export const BUTTONS = {
  RESUME: 'RESUME',
  PAUSE: 'PAUSE',
  RESET: 'RESET',
  DROP: 'DROP',
  MUTE: 'MUTE',
  RESET_TO_DEFAULT: 'Reset to Default',
  RESET_ALL: 'Reset All',
  ADVANCED_SETTINGS: 'Advanced Settings',
} as const;

// Tab navigation
export const NAVIGATION = {
  GAME_INFO: 'Game Info',
  STATISTICS: 'Statistics',
  THEME: 'Theme',
  THEME_SELECTION: 'Theme Selection',
  COLOR_SETTINGS: 'Color Settings',
  ACCESSIBILITY: 'Accessibility',
  VISUAL_EFFECTS: 'Visual Effects',
} as const;

// Panel titles
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

// Labels
export const LABELS = {
  SCORE: 'SCORE',
  LEVEL: 'LEVEL',
  LINES: 'LINES',
  NEXT: 'NEXT',
  VOLUME: 'Volume',
  VIRTUAL_CONTROLS: 'Virtual Controls',
  THEME_SELECTION_LABEL: 'Theme Selection',
  COLOR_PALETTE_SETTINGS: 'Color Palette Settings',
  ACCESSIBILITY_SETTINGS: 'Accessibility Settings',
  PRIMARY_COLOR: 'Primary Color',
  SECONDARY_COLOR: 'Secondary Color',
  EFFECT_INTENSITY: 'Effect Intensity',
  ANIMATION_ENABLED: 'Animation Enabled',
} as const;

// Control descriptions
export const CONTROLS = {
  MOVE: 'Move',
  DOWN_MOVE: 'Move Down',
  ROTATE: 'Rotate',
  HARD_DROP: 'Hard Drop',
  PAUSE_ACTION: 'Pause',
  RESET_ACTION: 'Reset',
} as const;

// Scoring display
export const SCORING = {
  ONE_LINE: '1 LINE',
  TWO_LINES: '2 LINES',
  THREE_LINES: '3 LINES',
  FOUR_LINES: '4 LINES',
  HARD_DROP_LABEL: 'HARD DROP',
} as const;

// Statistics labels (English)
export const STATISTICS = {
  TOTAL_GAMES: 'Total Games',
  BEST_SCORE: 'Best Score',
  TOTAL_LINES: 'Total Lines',
  PLAY_TIME: 'Play Time',
} as const;

// Accessibility settings
export const ACCESSIBILITY = {
  COLOR_VISION_SUPPORT: 'Color Vision Support',
  CONTRAST: 'Contrast',
  ANIMATION_INTENSITY: 'Animation Intensity',
  REDUCED_MOTION: 'Reduced Motion',
} as const;

// Accessibility aria-labels
export const ARIA_LABELS = {
  ROTATE: 'Rotate',
  MOVE_LEFT: 'Move Left',
  SOFT_DROP: 'Soft Drop',
  MOVE_RIGHT: 'Move Right',
  HARD_DROP: 'Hard Drop',
} as const;

// Error and notification messages
export const MESSAGES = {
  NO_HIGH_SCORES: 'No high scores yet',
  FAILED_TO_LOAD_SOUND: 'Failed to load sound',
  AUDIO_REQUIRES_INTERACTION: 'Audio play requires user interaction',
  COULD_NOT_PLAY_SOUND: 'Could not play sound',
} as const;

// Effect names
export const UI_EFFECTS = {
  NEON_EFFECT: 'Neon Effect',
  HOLOGRAM_BLUR: 'Hologram + Blur',
} as const;

// Status display
export const STATUS = {
  ON: 'ON',
  OFF: 'OFF',
} as const;

// Type definitions for internationalization keys
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

// Unified type for all string resources
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
  | UIEffectsKey
  | StatusKey;
