import { 
  Tetromino, 
  TetrominoType, 
  Particle,
  TETROMINO_SHAPES, 
  TETROMINO_COLORS, 
  BOARD_WIDTH, 
  BOARD_HEIGHT,
  PARTICLES_PER_CELL,
  PARTICLE_LIFE_DURATION
} from '../types/tetris';
import { particlePool } from './particlePool';

export function createEmptyBoard(): (string | null)[][] {
  return Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(null));
}

export function getRandomTetromino(): Tetromino {
  const types: TetrominoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
  const type = types[Math.floor(Math.random() * types.length)];
  
  return {
    type,
    shape: TETROMINO_SHAPES[type],
    position: { x: Math.floor(BOARD_WIDTH / 2) - 1, y: 0 },
    color: TETROMINO_COLORS[type]
  };
}

export function rotatePiece(piece: Tetromino): Tetromino {
  const rotated = piece.shape[0].map((_, index) =>
    piece.shape.map(row => row[index]).reverse()
  );
  
  return {
    ...piece,
    shape: rotated
  };
}

export function isValidPosition(
  board: (string | null)[][],
  piece: Tetromino,
  newPosition: { x: number; y: number }
): boolean {
  for (let y = 0; y < piece.shape.length; y++) {
    for (let x = 0; x < piece.shape[y].length; x++) {
      if (piece.shape[y][x]) {
        const newX = newPosition.x + x;
        const newY = newPosition.y + y;
        
        if (
          newX < 0 ||
          newX >= BOARD_WIDTH ||
          newY >= BOARD_HEIGHT ||
          (newY >= 0 && board[newY][newX])
        ) {
          return false;
        }
      }
    }
  }
  return true;
}

export function placePiece(
  board: (string | null)[][],
  piece: Tetromino
): (string | null)[][] {
  const newBoard = board.map(row => [...row]);
  
  for (let y = 0; y < piece.shape.length; y++) {
    for (let x = 0; x < piece.shape[y].length; x++) {
      if (piece.shape[y][x]) {
        const boardX = piece.position.x + x;
        const boardY = piece.position.y + y;
        
        if (boardY >= 0) {
          newBoard[boardY][boardX] = piece.color;
        }
      }
    }
  }
  
  return newBoard;
}

export function clearLines(board: (string | null)[][]): { 
  newBoard: (string | null)[][]; 
  linesCleared: number;
  linesToClear: number[];
} {
  const linesToClear: number[] = [];
  
  for (let y = 0; y < BOARD_HEIGHT; y++) {
    if (board[y].every(cell => cell !== null)) {
      linesToClear.push(y);
    }
  }
  
  if (linesToClear.length === 0) {
    return { newBoard: board, linesCleared: 0, linesToClear: [] };
  }
  
  const newBoard = board.filter((_, index) => !linesToClear.includes(index));
  
  while (newBoard.length < BOARD_HEIGHT) {
    newBoard.unshift(Array(BOARD_WIDTH).fill(null));
  }
  
  return { newBoard, linesCleared: linesToClear.length, linesToClear };
}

export function createParticles(linesToClear: number[], board: (string | null)[][]): Particle[] {
  const particles: Particle[] = [];
  
  linesToClear.forEach(lineIndex => {
    for (let x = 0; x < BOARD_WIDTH; x++) {
      const cellColor = board[lineIndex][x];
      if (cellColor) {
        // 各セルから複数のパーティクルを生成（プールから取得）
        for (let i = 0; i < PARTICLES_PER_CELL; i++) {
          const particle = particlePool.getParticle(
            `${lineIndex}-${x}-${i}`,
            x * 24 + 12 + 8, // セル中央 + ボード位置調整
            lineIndex * 24 + 12 + 8,
            cellColor,
            (Math.random() - 0.5) * 8, // 水平方向のランダムな速度
            Math.random() * -4 - 2, // 上向きの速度
            PARTICLE_LIFE_DURATION
          );
          particles.push(particle);
        }
      }
    }
  });
  
  return particles;
}

export function getDropPosition(
  board: (string | null)[][],
  piece: Tetromino
): number {
  let dropY = piece.position.y;
  
  while (isValidPosition(board, piece, { x: piece.position.x, y: dropY + 1 })) {
    dropY++;
  }
  
  return dropY;
}