/**
 * Board Renderer Implementation
 *
 * Separated rendering logic for TetrisBoard component following MVC pattern.
 * Handles board display calculations, piece rendering, and style computations.
 */

import {
  type BoardRenderState,
  type BoardRendererConfig,
  type BoardStyleTheme,
  type CellRenderContext,
  type CellStyle,
  DEFAULT_BOARD_CONFIG,
  DEFAULT_CYBERPUNK_THEME,
  DEFAULT_RENDERING_OPTIONS,
  type DisplayBoard,
  type DisplayCellType,
  type IBoardRenderer,
  type IStyleCalculator,
  type RenderEffects,
  RenderError,
  type RenderingOptions,
} from '../../types/rendering';
import type { Tetromino } from '../../types/tetris';
import { getDropPosition } from './tetrisUtils';

/**
 * Style Calculator - Handles CSS class and style computation
 */
export class StyleCalculator implements IStyleCalculator {
  constructor(private theme: BoardStyleTheme = DEFAULT_CYBERPUNK_THEME) {}

  calculateCellClassName(cell: DisplayCellType, context: CellRenderContext): string {
    let baseClassName = 'md:w-8 md:h-8 lg:w-9 lg:h-9 w-6 h-6 relative';

    // Apply base style based on cell type
    if (!cell) {
      baseClassName += ` ${this.theme.empty}`;
    } else if (cell === 'ghost') {
      baseClassName += ` ${this.theme.ghost}`;
    } else {
      baseClassName += ` ${this.theme.filled}`;
    }

    // Apply flashing effect for line clearing
    if (context.isFlashing) {
      baseClassName += ` ${this.theme.flashing}`;
    }

    return baseClassName;
  }

  calculateCellStyle(cell: DisplayCellType, context: CellRenderContext): React.CSSProperties {
    const style: React.CSSProperties = {};

    // Apply background color for filled cells
    if (cell && cell !== 'ghost') {
      // Override background color during flashing effect
      if (context.isFlashing) {
        style.backgroundColor = '#ffffff';
      } else {
        style.backgroundColor = cell;
      }
    }

    return style;
  }

  calculateBoardContainerStyle(effects: RenderEffects): React.CSSProperties {
    const style: React.CSSProperties = {
      background: this.theme.backgroundColor,
      backdropFilter: 'blur(10px)',
    };

    // Apply shaking effect during line clearing
    if (effects.shaking) {
      style.transform = 'translateY(2px)';
    }

    return style;
  }

  updateTheme(theme: BoardStyleTheme): void {
    this.theme = theme;
  }

  getTheme(): BoardStyleTheme {
    return this.theme;
  }
}

/**
 * Board Renderer - Main rendering logic implementation
 */
export class BoardRenderer implements IBoardRenderer {
  private config: BoardRendererConfig;
  private styleCalculator: IStyleCalculator;

  constructor(config: Partial<BoardRendererConfig> = {}, styleCalculator?: IStyleCalculator) {
    this.config = { ...DEFAULT_BOARD_CONFIG, ...config };
    this.styleCalculator = styleCalculator || new StyleCalculator(this.config.styleTheme);
  }

  /**
   * Create empty display board filled with null values
   */
  createEmptyDisplayBoard(): DisplayBoard {
    return Array(this.config.height)
      .fill(null)
      .map(() => Array(this.config.width).fill(null));
  }

  /**
   * Create deep copy of game board for display manipulation
   */
  copyBoard(board: (string | null)[][]): DisplayBoard {
    if (board.length !== this.config.height || board[0]?.length !== this.config.width) {
      throw new RenderError(
        `Board dimensions mismatch. Expected ${this.config.width}x${this.config.height}, got ${board[0]?.length}x${board.length}`,
        'DIMENSION_MISMATCH'
      );
    }

    return board.map((row) => [...row]);
  }

  /**
   * Check if position is within board boundaries
   */
  private isValidBoardPosition(x: number, y: number): boolean {
    return y >= 0 && y < this.config.height && x >= 0 && x < this.config.width;
  }

  /**
   * Add ghost piece to display board (preview of where piece will land)
   */
  addGhostPiece(board: DisplayBoard, piece: Tetromino, ghostY: number): void {
    if (!this.config.enableGhostPiece || ghostY < 0) {
      return;
    }

    for (let y = 0; y < piece.shape.length; y++) {
      const row = piece.shape[y];
      if (!row) continue;

      for (let x = 0; x < row.length; x++) {
        if (row[x]) {
          const boardX = piece.position.x + x;
          const boardY = ghostY + y;

          const boardRow = board[boardY];
          if (this.isValidBoardPosition(boardX, boardY) && boardRow && !boardRow[boardX]) {
            boardRow[boardX] = 'ghost';
          }
        }
      }
    }
  }

  /**
   * Add current piece to display board
   */
  addCurrentPiece(board: DisplayBoard, piece: Tetromino): void {
    for (let y = 0; y < piece.shape.length; y++) {
      const row = piece.shape[y];
      if (!row) continue;

      for (let x = 0; x < row.length; x++) {
        if (row[x]) {
          const boardX = piece.position.x + x;
          const boardY = piece.position.y + y;

          const boardRow = board[boardY];
          if (this.isValidBoardPosition(boardX, boardY) && boardRow) {
            boardRow[boardX] = piece.color;
          }
        }
      }
    }
  }

  /**
   * Main rendering method - creates display board with all pieces
   */
  renderBoard(
    state: BoardRenderState,
    options: RenderingOptions = DEFAULT_RENDERING_OPTIONS
  ): DisplayBoard {
    try {
      // Start with copy of game board
      const displayBoard = this.copyBoard(state.board);

      // Only render pieces if game is active
      if (state.currentPiece && !state.gameOver && !state.isPaused) {
        // Add ghost piece first (so current piece renders on top)
        if (options.showGhostPiece && this.config.enableGhostPiece) {
          const ghostY = getDropPosition(state.board, state.currentPiece);
          this.addGhostPiece(displayBoard, state.currentPiece, ghostY);
        }

        // Add current piece
        this.addCurrentPiece(displayBoard, state.currentPiece);
      }

      return displayBoard;
    } catch (error) {
      if (error instanceof RenderError) {
        throw error;
      }
      throw new RenderError(
        `Failed to render board: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'RENDER_FAILED'
      );
    }
  }

  /**
   * Calculate style for a single cell
   */
  calculateCellStyle(context: CellRenderContext): CellStyle {
    const className = this.styleCalculator.calculateCellClassName(context.cell, context);
    const style = this.styleCalculator.calculateCellStyle(context.cell, context);

    return { className, style };
  }

  /**
   * Render complete display board with styles
   */
  renderDisplayBoard(displayBoard: DisplayBoard, effects: RenderEffects): CellStyle[][] {
    const flashingLines = effects.flashingLines;

    return displayBoard.map((row, rowIndex) =>
      row.map((cell, columnIndex) => {
        const context: CellRenderContext = {
          cell,
          position: { x: columnIndex, y: rowIndex },
          rowIndex,
          columnIndex,
          isFlashing: flashingLines.has(rowIndex),
          effects,
        };

        return this.calculateCellStyle(context);
      })
    );
  }

  /**
   * Update renderer configuration
   */
  updateConfig(config: Partial<BoardRendererConfig>): void {
    this.config = { ...this.config, ...config };

    // Update style calculator theme if provided
    if (config.styleTheme && this.styleCalculator instanceof StyleCalculator) {
      this.styleCalculator.updateTheme(config.styleTheme);
    }
  }

  /**
   * Get current configuration
   */
  getConfig(): BoardRendererConfig {
    return { ...this.config };
  }

  /**
   * Get board container style with effects
   */
  getBoardContainerStyle(effects: RenderEffects): React.CSSProperties {
    return this.styleCalculator.calculateBoardContainerStyle(effects);
  }

  /**
   * Get board container class names
   */
  getBoardContainerClassName(effects: RenderEffects): string {
    let className =
      'grid grid-cols-10 gap-0 border border-theme-primary/40 bg-theme-surface/20 transition-transform relative overflow-hidden';

    // Add responsive padding
    className += ' md:p-3 p-1';

    // Add animation effects
    if (effects.shaking) {
      className += ' animate-bounce';
    }

    return className;
  }
}

/**
 * Board Renderer Factory - Creates configured renderer instances
 */
export class BoardRendererFactory {
  static createRenderer(config?: Partial<BoardRendererConfig>): IBoardRenderer {
    return new BoardRenderer(config);
  }

  static createStyleCalculator(theme?: BoardStyleTheme): IStyleCalculator {
    return new StyleCalculator(theme);
  }

  /**
   * Create optimized renderer for mobile devices
   */
  static createMobileRenderer(): IBoardRenderer {
    const mobileConfig: Partial<BoardRendererConfig> = {
      enableEffects: false, // Reduce effects for performance
      styleTheme: {
        ...DEFAULT_CYBERPUNK_THEME,
        glowEffects: false, // Disable glow effects on mobile
      },
    };

    return new BoardRenderer(mobileConfig);
  }

  /**
   * Create accessibility-optimized renderer
   */
  static createAccessibilityRenderer(highContrast = false, reducedMotion = false): IBoardRenderer {
    const accessibilityTheme: BoardStyleTheme = {
      ...DEFAULT_CYBERPUNK_THEME,
      empty: highContrast ? 'bg-black border-2 border-white' : DEFAULT_CYBERPUNK_THEME.empty,
      filled: highContrast
        ? 'border-2 border-white bg-theme-surface'
        : DEFAULT_CYBERPUNK_THEME.filled,
      glowEffects: !reducedMotion,
    };

    const accessibilityConfig: Partial<BoardRendererConfig> = {
      styleTheme: accessibilityTheme,
      enableEffects: !reducedMotion,
    };

    return new BoardRenderer(accessibilityConfig);
  }
}

// Default export for convenience
export default BoardRenderer;
