/**
 * Type-safe mock definitions for testing
 */

import type { Mock } from 'vitest';
import type { SoundKey } from '@/types/tetris';

// Type-safe mock for audio playback function
export type MockPlaySound = Mock<(soundKey: SoundKey) => void>;

// Type-safe mock for store state updates
export interface MockStoreActions {
  setState: <T extends Record<string, unknown>>(newState: Partial<T>) => void;
  addHighScore: Mock<
    (score: { id: string; score: number; level: number; lines: number; date: number }) => void
  >;
  updateStatistics: Mock<(stats: Record<string, unknown>) => void>;
}

// Partial game state type (for testing)
export interface PartialGameState {
  score?: number;
  level?: number;
  lines?: number;
  gameOver?: boolean;
  isPaused?: boolean;
}

// Strict high score type definition
export interface StrictHighScore {
  readonly id: string;
  readonly score: number;
  readonly level: number;
  readonly lines: number;
  readonly date: number;
}

// Type-safe statistics data definition
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

// Mock store state type definition
export interface MockStoreState {
  highScores: readonly StrictHighScore[];
  statistics: StrictStatistics;
}

// Test utility types
export type RequiredKeys<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type PartialExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>;

// Type-safe event handler definitions
export type MockEventHandler<T = unknown> = Mock<(event: T) => void>;
export type MockAsyncHandler<T = unknown, R = unknown> = Mock<(event: T) => Promise<R>>;
