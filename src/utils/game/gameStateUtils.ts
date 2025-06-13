import { GameState, Tetromino, SoundKey, LineEffectState } from '../../types/tetris';
import { SCORES } from '../../constants';
import {
  placePiece,
  clearLines,
  createParticles,
  isValidPosition,
  getRandomTetromino,
} from './tetrisUtils';

interface ScoreCalculationResult {
  newScore: number;
  newLevel: number;
  newLines: number;
}

interface LineClearResult {
  newBoard: (string | null)[][];
  linesCleared: number;
  linesToClear: number[];
}

interface LineEffectResult {
  flashingLines: ReadonlyArray<number>;
  shaking: boolean;
  particles: LineEffectState['particles'];
}

interface GameOverCheckResult {
  isGameOver: boolean;
  gameOverState?: Partial<GameState>;
}

/**
 * Pure function for calculating score increase based on Tetris scoring rules
 * Scoring: 40×level for single, 100×level for double, 300×level for triple, 1200×level for tetris
 */
export function calculateScoreIncrease(
  currentScore: number,
  currentLines: number,
  linesCleared: number,
  bonusPoints: number = 0,
  debugMode: boolean = false
): ScoreCalculationResult {
  const newLines = currentLines + linesCleared;
  const newLevel = Math.floor(newLines / 10) + 1;

  // In debug mode, don't increase score
  const newScore = debugMode
    ? currentScore
    : currentScore +
      (linesCleared === 1
        ? SCORES.SINGLE
        : linesCleared === 2
          ? SCORES.DOUBLE
          : linesCleared === 3
            ? SCORES.TRIPLE
            : linesCleared === 4
              ? SCORES.TETRIS
              : 0) *
        newLevel +
      bonusPoints;

  return {
    newScore,
    newLevel,
    newLines,
  };
}

/**
 * Pure function for processing line clearing logic
 */
export function processLineClear(board: (string | null)[][], piece: Tetromino): LineClearResult {
  const newBoard = placePiece(board, piece);
  const { newBoard: clearedBoard, linesCleared, linesToClear } = clearLines(newBoard);

  return {
    newBoard: clearedBoard,
    linesCleared,
    linesToClear,
  };
}

/**
 * Pure function for creating line clear visual effects
 */
export function createLineEffects(
  linesCleared: number,
  linesToClear: number[],
  board: (string | null)[][],
  prevLineEffect: LineEffectState,
  playSound?: (soundType: SoundKey) => void
): LineEffectResult {
  if (linesCleared === 0) {
    return prevLineEffect;
  }

  // Play appropriate sound effect
  if (playSound) {
    if (linesCleared === 4) {
      playSound('tetris');
    } else {
      playSound('lineClear');
    }
  }

  return {
    flashingLines: linesToClear,
    shaking: true,
    particles: createParticles(linesToClear, board),
  };
}

/**
 * Pure function for game over condition checking
 */
export function checkGameOver(
  board: (string | null)[][],
  nextPiece: Tetromino,
  _gameState: GameState,
  playSound?: (soundType: SoundKey) => void
): GameOverCheckResult {
  if (!isValidPosition(board, nextPiece, nextPiece.position)) {
    if (playSound) {
      playSound('gameOver');
    }

    return {
      isGameOver: true,
      gameOverState: {
        gameOver: true,
      },
    };
  }

  return {
    isGameOver: false,
  };
}

/**
 * Pure function for updating game state after piece placement
 */
export function updateGameStateWithPiece(
  prevState: GameState,
  lineClearResult: LineClearResult,
  scoreResult: ScoreCalculationResult,
  lineEffect: LineEffectResult,
  gameOverResult: GameOverCheckResult,
  debugMode: boolean = false
): GameState {
  const nextPiece = getRandomTetromino(debugMode);

  // Case when game is over
  if (gameOverResult.isGameOver) {
    return {
      ...prevState,
      board: lineClearResult.newBoard,
      gameOver: true,
      score: scoreResult.newScore,
      level: scoreResult.newLevel,
      lines: scoreResult.newLines,
      lineEffect: lineEffect,
    };
  }

  // Normal game continuation
  return {
    ...prevState,
    board: lineClearResult.newBoard,
    currentPiece: prevState.nextPiece,
    nextPiece: nextPiece,
    score: scoreResult.newScore,
    level: scoreResult.newLevel,
    lines: scoreResult.newLines,
    lineEffect: lineEffect,
  };
}
