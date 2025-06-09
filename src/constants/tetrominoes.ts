/**
 * テトリミノ定義関連の定数
 * 
 * テトリミノの形状、色、タイプ定義
 */

// テトリミノの色定義
export const TETROMINO_COLORS = {
  I: '#00ffff', // シアン
  O: '#ffff00', // イエロー
  T: '#ff00ff', // マゼンタ
  S: '#00ff00', // グリーン
  Z: '#ff0000', // レッド
  J: '#0000ff', // ブルー
  L: '#ff8000', // オレンジ
} as const;

// テトリミノの形状定義
export const TETROMINO_SHAPES = {
  I: [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  O: [
    [1, 1],
    [1, 1],
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0],
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0],
  ],
  J: [
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  L: [
    [0, 0, 1],
    [1, 1, 1],
    [0, 0, 0],
  ],
} as const;

// テトリミノタイプ一覧
export const TETROMINO_TYPES = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'] as const;

// 型エクスポート
export type TetrominoColor = keyof typeof TETROMINO_COLORS;
export type TetrominoShape = keyof typeof TETROMINO_SHAPES;
export type TetrominoTypeList = typeof TETROMINO_TYPES;