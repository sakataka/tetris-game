import { Tetromino, TetrominoType, Particle } from '../../types/tetris';
import {
  TETROMINO_SHAPES,
  TETROMINO_COLORS,
  BOARD_WIDTH,
  BOARD_HEIGHT,
  PARTICLES_PER_CELL,
  PARTICLE_LIFE_DURATION,
  GAME_PHYSICS,
  PARTICLE_SYSTEM,
} from '../../constants';
import { particlePool } from '../performance/particlePool';

export function createEmptyBoard(): (string | null)[][] {
  return Array(BOARD_HEIGHT)
    .fill(null)
    .map(() => Array(BOARD_WIDTH).fill(null));
}

export function getRandomTetromino(debugMode = false): Tetromino {
  // In debug mode, always return I-piece for easy line clearing
  if (debugMode) {
    return {
      type: 'I',
      shape: TETROMINO_SHAPES['I'],
      position: { x: Math.floor(BOARD_WIDTH / 2) - 1, y: 0 },
      color: TETROMINO_COLORS['I'],
    };
  }

  const types: TetrominoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
  const type = types[Math.floor(Math.random() * types.length)];

  if (!type) {
    throw new Error('Failed to generate random tetromino type');
  }

  return {
    type,
    shape: TETROMINO_SHAPES[type],
    position: { x: Math.floor(BOARD_WIDTH / 2) - 1, y: 0 },
    color: TETROMINO_COLORS[type],
  };
}

export function rotatePiece(piece: Tetromino): Tetromino {
  const firstRow = piece.shape[0];
  if (!firstRow) {
    throw new Error('Invalid piece shape for rotation');
  }

  const rotated = firstRow.map((_, index) => piece.shape.map((row) => row?.[index] ?? 0).reverse());

  return {
    ...piece,
    shape: rotated,
  };
}

function isWithinBounds(x: number, y: number): boolean {
  return x >= 0 && x < BOARD_WIDTH && y >= 0 && y < BOARD_HEIGHT;
}

function checkPieceBounds(piece: Tetromino, newPosition: { x: number; y: number }): boolean {
  for (let y = 0; y < piece.shape.length; y++) {
    const row = piece.shape[y];
    if (!row) continue;

    for (let x = 0; x < row.length; x++) {
      if (row[x]) {
        const boardX = newPosition.x + x;
        const boardY = newPosition.y + y;
        if (!isWithinBounds(boardX, boardY)) {
          return false;
        }
      }
    }
  }
  return true;
}

function checkBoardCollisions(
  board: (string | null)[][],
  piece: Tetromino,
  newPosition: { x: number; y: number }
): boolean {
  for (let y = 0; y < piece.shape.length; y++) {
    const boardY = newPosition.y + y;
    if (boardY < 0) continue;

    const row = piece.shape[y];
    if (!row) continue;

    for (let x = 0; x < row.length; x++) {
      if (row[x]) {
        const boardX = newPosition.x + x;
        if (board[boardY]?.[boardX]) {
          return false;
        }
      }
    }
  }
  return true;
}

export function isValidPosition(
  board: (string | null)[][],
  piece: Tetromino,
  newPosition: { x: number; y: number }
): boolean {
  return checkPieceBounds(piece, newPosition) && checkBoardCollisions(board, piece, newPosition);
}

function createOptimizedBoard(
  board: (string | null)[][],
  startY: number,
  endY: number
): (string | null)[][] {
  const newBoard: (string | null)[][] = Array.from({ length: BOARD_HEIGHT });

  // Copy unmodified rows directly (shallow copy)
  for (let y = 0; y < startY; y++) {
    const row = board[y];
    if (row) {
      newBoard[y] = row;
    }
  }
  for (let y = endY + 1; y < BOARD_HEIGHT; y++) {
    const row = board[y];
    if (row) {
      newBoard[y] = row;
    }
  }

  // Only deep copy affected rows
  for (let y = startY; y <= endY; y++) {
    const row = board[y];
    if (row) {
      newBoard[y] = [...row];
    }
  }

  return newBoard;
}

function placePieceRow(newBoard: (string | null)[][], piece: Tetromino, pieceY: number): void {
  const boardY = piece.position.y + pieceY;
  if (boardY < 0 || boardY >= BOARD_HEIGHT) return;

  const pieceRow = piece.shape[pieceY];
  if (!pieceRow) return;

  for (let x = 0; x < pieceRow.length; x++) {
    if (pieceRow[x]) {
      const boardX = piece.position.x + x;
      if (boardX >= 0 && boardX < BOARD_WIDTH) {
        const targetRow = newBoard[boardY];
        if (targetRow) {
          targetRow[boardX] = piece.color;
        }
      }
    }
  }
}

function placePieceCells(newBoard: (string | null)[][], piece: Tetromino): void {
  for (let y = 0; y < piece.shape.length; y++) {
    placePieceRow(newBoard, piece, y);
  }
}

export function placePiece(board: (string | null)[][], piece: Tetromino): (string | null)[][] {
  const pieceHeight = piece.shape.length;
  const startY = Math.max(0, piece.position.y);
  const endY = Math.min(BOARD_HEIGHT - 1, piece.position.y + pieceHeight - 1);

  const newBoard = createOptimizedBoard(board, startY, endY);
  placePieceCells(newBoard, piece);

  return newBoard;
}

export function clearLines(board: (string | null)[][]): {
  newBoard: (string | null)[][];
  linesCleared: number;
  linesToClear: number[];
} {
  const linesToClear: number[] = [];

  // Identify complete lines
  for (let y = 0; y < BOARD_HEIGHT; y++) {
    const row = board[y];
    if (row && row.every((cell) => cell !== null)) {
      linesToClear.push(y);
    }
  }

  if (linesToClear.length === 0) {
    return { newBoard: board, linesCleared: 0, linesToClear: [] };
  }

  // Use Set for O(1) lookup instead of O(n) includes
  const linesToClearSet = new Set(linesToClear);
  const newBoard: (string | null)[][] = [];

  // Build new board by copying non-cleared lines
  for (let y = 0; y < BOARD_HEIGHT; y++) {
    if (!linesToClearSet.has(y)) {
      const row = board[y];
      if (row) {
        newBoard.push(row);
      }
    }
  }

  // Add empty lines at the top
  const emptyLinesNeeded = linesToClear.length;
  for (let i = 0; i < emptyLinesNeeded; i++) {
    newBoard.unshift(Array(BOARD_WIDTH).fill(null));
  }

  return { newBoard, linesCleared: linesToClear.length, linesToClear };
}

export function createParticles(linesToClear: number[], board: (string | null)[][]): Particle[] {
  const particles: Particle[] = [];

  linesToClear.forEach((lineIndex) => {
    const lineRow = board[lineIndex];
    if (!lineRow) return;

    for (let x = 0; x < BOARD_WIDTH; x++) {
      const cellColor = lineRow[x];
      if (cellColor) {
        // Generate multiple particles from each cell (retrieved from pool)
        for (let i = 0; i < PARTICLES_PER_CELL; i++) {
          const particle = particlePool.getParticle(
            `${Date.now()}-${lineIndex}-${x}-${i}-${Math.random()}`,
            x * GAME_PHYSICS.CELL_SIZE +
              GAME_PHYSICS.CELL_CENTER_OFFSET +
              GAME_PHYSICS.BOARD_POSITION_OFFSET, // Cell center + board position adjustment
            lineIndex * GAME_PHYSICS.CELL_SIZE +
              GAME_PHYSICS.CELL_CENTER_OFFSET +
              GAME_PHYSICS.BOARD_POSITION_OFFSET,
            cellColor,
            ((Math.random() - 0.5) * PARTICLE_SYSTEM.POSITION_VARIANCE_X) / 2.5, // Random horizontal velocity
            Math.random() * -4 - 2, // Upward velocity
            PARTICLE_LIFE_DURATION
          );
          particles.push(particle);
        }
      }
    }
  });

  return particles;
}

export function getDropPosition(board: (string | null)[][], piece: Tetromino): number {
  let dropY = piece.position.y;

  while (isValidPosition(board, piece, { x: piece.position.x, y: dropY + 1 })) {
    dropY++;
  }

  return dropY;
}
