/**
 * Board Rendering Types
 *
 * Type definitions for board rendering system including display states,
 * style calculations, and rendering configuration.
 */

import type { LineEffectState, Tetromino } from './tetris';

// Display cell types for rendering
export type DisplayCellType = string | null | 'ghost';

// Display board is a 2D array of display cells
export type DisplayBoard = DisplayCellType[][];

// Board rendering state for calculations
export interface BoardRenderState {
  board: (string | null)[][];
  currentPiece: Tetromino | null;
  gameOver: boolean;
  isPaused: boolean;
  lineEffect: LineEffectState;
}

// Style calculation result
export interface CellStyle {
  className: string;
  style: React.CSSProperties;
}

// Cell rendering context for style calculations
export interface CellRenderContext {
  cell: DisplayCellType;
  position: { x: number; y: number };
  rowIndex: number;
  columnIndex: number;
  isFlashing: boolean;
  effects: RenderEffects;
}

// Visual effects for rendering
export interface RenderEffects {
  flashingLines: Set<number>;
  shaking: boolean;
  particles: LineEffectState['particles'];
}

// Board renderer configuration
export interface BoardRendererConfig {
  width: number;
  height: number;
  enableGhostPiece: boolean;
  enableEffects: boolean;
  styleTheme: BoardStyleTheme;
}

// Style theme for board rendering
export interface BoardStyleTheme {
  empty: string;
  ghost: string;
  filled: string;
  flashing: string;
  borderColor: string;
  backgroundColor: string;
  glowEffects: boolean;
}

// Default style themes
export const DEFAULT_CYBERPUNK_THEME: BoardStyleTheme = {
  empty: 'bg-gray-900/50 border border-cyan-500/20 backdrop-blur-sm',
  ghost:
    'border-2 border-cyan-400/60 bg-transparent border-dashed shadow-[0_0_10px_rgba(0,255,255,0.3)]',
  filled: 'border border-gray-800 shadow-[0_0_5px_rgba(0,0,0,0.5)] transition-all duration-200',
  flashing: ' animate-pulse bg-white border-white shadow-[0_0_20px_rgba(255,255,255,0.8)]',
  borderColor: 'border-cyan-500',
  backgroundColor:
    'linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(10,10,15,0.9) 50%, rgba(5,5,10,0.8) 100%)',
  glowEffects: true,
};

// Board dimensions and layout
export interface BoardDimensions {
  cellWidth: number;
  cellHeight: number;
  gapSize: number;
  padding: number;
  totalWidth: number;
  totalHeight: number;
}

// Rendering options for different display modes
export interface RenderingOptions {
  showGhostPiece: boolean;
  showEffects: boolean;
  enableAnimations: boolean;
  responsiveSize: boolean;
  highlightMode: 'none' | 'subtle' | 'enhanced';
}

// Position validation interface
export interface PositionValidator {
  isValidPosition: (x: number, y: number) => boolean;
  isWithinBounds: (x: number, y: number, width: number, height: number) => boolean;
  getValidPositions: (
    shape: number[][],
    position: { x: number; y: number }
  ) => { x: number; y: number }[];
}

// Board renderer interface for dependency injection
export interface IBoardRenderer {
  // Core rendering methods
  renderBoard(state: BoardRenderState, options?: RenderingOptions): DisplayBoard;
  renderDisplayBoard(displayBoard: DisplayBoard, effects: RenderEffects): CellStyle[][];

  // Piece rendering
  addGhostPiece(board: DisplayBoard, piece: Tetromino, ghostY: number): void;
  addCurrentPiece(board: DisplayBoard, piece: Tetromino): void;

  // Style calculations
  calculateCellStyle(context: CellRenderContext): CellStyle;

  // Board container styling
  getBoardContainerStyle(effects: RenderEffects): React.CSSProperties;
  getBoardContainerClassName(effects: RenderEffects): string;

  // Utility methods
  createEmptyDisplayBoard(): DisplayBoard;
  copyBoard(board: (string | null)[][]): DisplayBoard;

  // Configuration
  updateConfig(config: Partial<BoardRendererConfig>): void;
  getConfig(): BoardRendererConfig;
}

// Style calculator interface for customization
export interface IStyleCalculator {
  calculateCellClassName(cell: DisplayCellType, context: CellRenderContext): string;
  calculateCellStyle(cell: DisplayCellType, context: CellRenderContext): React.CSSProperties;
  calculateBoardContainerStyle(effects: RenderEffects): React.CSSProperties;
}

// Coordinate system for rendering
export interface RenderCoordinate {
  x: number;
  y: number;
  boardX: number;
  boardY: number;
}

// Performance optimization hints
export interface RenderOptimization {
  memoizeStyles: boolean;
  batchUpdates: boolean;
  skipInvisibleCells: boolean;
  cacheCalculations: boolean;
}

// Render statistics for debugging/monitoring
export interface RenderStats {
  lastRenderTime: number;
  cellsRendered: number;
  effectsApplied: number;
  cacheMisses: number;
  memoizedCalculations: number;
}

// Error types for rendering system
export class RenderError extends Error {
  constructor(
    message: string,
    public code: string
  ) {
    super(message);
    this.name = 'RenderError';
  }
}

// Board renderer factory interface
export interface IBoardRendererFactory {
  createRenderer(config?: Partial<BoardRendererConfig>): IBoardRenderer;
  createStyleCalculator(theme?: BoardStyleTheme): IStyleCalculator;
}

// Export default configuration
export const DEFAULT_BOARD_CONFIG: BoardRendererConfig = {
  width: 10,
  height: 20,
  enableGhostPiece: true,
  enableEffects: true,
  styleTheme: DEFAULT_CYBERPUNK_THEME,
};

export const DEFAULT_RENDERING_OPTIONS: RenderingOptions = {
  showGhostPiece: true,
  showEffects: true,
  enableAnimations: true,
  responsiveSize: true,
  highlightMode: 'enhanced',
};

export const DEFAULT_BOARD_DIMENSIONS: BoardDimensions = {
  cellWidth: 28, // md:w-7
  cellHeight: 28, // md:h-7
  gapSize: 0,
  padding: 12, // md:p-3
  totalWidth: 280,
  totalHeight: 560,
};
