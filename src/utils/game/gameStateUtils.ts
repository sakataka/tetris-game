import { GameState, Tetromino, SoundKey, LineEffectState } from '../../types/tetris';
import { SCORES } from '../../constants';
import { placePiece, clearLines, createParticles, isValidPosition, getRandomTetromino } from './tetrisUtils';

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
 * スコア増加計算の純粋関数
 */
export function calculateScoreIncrease(
  currentScore: number,
  currentLines: number,
  linesCleared: number,
  bonusPoints: number = 0
): ScoreCalculationResult {
  const newLines = currentLines + linesCleared;
  const newLevel = Math.floor(newLines / 10) + 1;
  const newScore = currentScore + 
    (linesCleared === 1 ? SCORES.SINGLE : 
     linesCleared === 2 ? SCORES.DOUBLE :
     linesCleared === 3 ? SCORES.TRIPLE :
     linesCleared === 4 ? SCORES.TETRIS : 0) * newLevel +
    bonusPoints;

  return {
    newScore,
    newLevel,
    newLines
  };
}

/**
 * ライン消去処理の純粋関数
 */
export function processLineClear(board: (string | null)[][], piece: Tetromino): LineClearResult {
  const newBoard = placePiece(board, piece);
  const { newBoard: clearedBoard, linesCleared, linesToClear } = clearLines(newBoard);
  
  return {
    newBoard: clearedBoard,
    linesCleared,
    linesToClear
  };
}

/**
 * ライン消去エフェクト作成の純粋関数
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

  // 音効果再生
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
    particles: createParticles(linesToClear, board)
  };
}

/**
 * ゲームオーバー判定の純粋関数
 */
export function checkGameOver(
  board: (string | null)[][],
  nextPiece: Tetromino,
  gameState: GameState,
  playSound?: (soundType: SoundKey) => void
): GameOverCheckResult {
  if (!isValidPosition(board, nextPiece, nextPiece.position)) {
    if (playSound) {
      playSound('gameOver');
    }
    
    return {
      isGameOver: true,
      gameOverState: {
        gameOver: true
      }
    };
  }

  return {
    isGameOver: false
  };
}

/**
 * ピース配置後のゲーム状態更新の純粋関数
 */
export function updateGameStateWithPiece(
  prevState: GameState,
  lineClearResult: LineClearResult,
  scoreResult: ScoreCalculationResult,
  lineEffect: LineEffectResult,
  gameOverResult: GameOverCheckResult
): GameState {
  const nextPiece = getRandomTetromino();
  
  // ゲームオーバーの場合
  if (gameOverResult.isGameOver) {
    return {
      ...prevState,
      board: lineClearResult.newBoard,
      gameOver: true,
      score: scoreResult.newScore,
      level: scoreResult.newLevel,
      lines: scoreResult.newLines,
      lineEffect: lineEffect
    };
  }

  // 通常のゲーム継続
  return {
    ...prevState,
    board: lineClearResult.newBoard,
    currentPiece: prevState.nextPiece,
    nextPiece: nextPiece,
    score: scoreResult.newScore,
    level: scoreResult.newLevel,
    lines: scoreResult.newLines,
    lineEffect: lineEffect
  };
}