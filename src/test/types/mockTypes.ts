/**
 * テスト用の型安全なモック定義
 */

import { SoundKey } from '../../types/tetris';
import { Mock } from 'vitest';

// 音声再生関数の型安全なモック
export type MockPlaySound = Mock<(soundKey: SoundKey) => void>;

// ストア状態更新用の型安全なモック
export interface MockStoreActions {
  setState: <T extends Record<string, unknown>>(newState: Partial<T>) => void;
  addHighScore: Mock<
    (score: { id: string; score: number; level: number; lines: number; date: number }) => void
  >;
  updateStatistics: Mock<(stats: Record<string, unknown>) => void>;
}

// ゲーム状態の部分型（テスト用）
export interface PartialGameState {
  score?: number;
  level?: number;
  lines?: number;
  gameOver?: boolean;
  isPaused?: boolean;
}

// ハイスコア型の厳密定義
export interface StrictHighScore {
  readonly id: string;
  readonly score: number;
  readonly level: number;
  readonly lines: number;
  readonly date: number;
}

// 統計データの型安全な定義
export interface StrictStatistics {
  readonly totalGames: number;
  readonly totalLines: number;
  readonly totalScore: number;
  readonly bestScore: number;
  readonly averageScore: number;
  readonly playTime: number;
  readonly bestStreak: number;
  readonly tetrisCount: number;
}

// モックストア状態の型定義
export interface MockStoreState {
  highScores: readonly StrictHighScore[];
  statistics: StrictStatistics;
}

// テスト用ユーティリティ型
export type RequiredKeys<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type PartialExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>;

// イベントハンドラーの型安全な定義
export type MockEventHandler<T = unknown> = Mock<(event: T) => void>;
export type MockAsyncHandler<T = unknown, R = unknown> = Mock<(event: T) => Promise<R>>;
