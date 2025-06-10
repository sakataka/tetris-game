/**
 * Branded Types for Type Safety
 *
 * These branded types provide compile-time type safety for primitive values
 * that have specific semantic meaning in the application.
 */

// Player ID - already defined in tetris.ts

// Session ID - already defined in tetris.ts

// High Score ID - unique identifier for high score entries
export type HighScoreId = string & { readonly brand: unique symbol };

// Theme Variant ID - restricted set of theme names
export type ThemeId = string & { readonly brand: unique symbol };

// Sound Key - restricted set of sound effect names
export type SoundKeyBrand = string & { readonly brand: unique symbol };

// Type guard functions - PlayerId and SessionId are defined in tetris.ts
// Reimport from tetris.ts for type guards
import type { PlayerId, SessionId } from './tetris';

export function isPlayerId(value: string): value is PlayerId {
  return typeof value === 'string' && value.length > 0;
}

export function isSessionId(value: string): value is SessionId {
  return typeof value === 'string' && value.length > 0;
}

export function isHighScoreId(value: string): value is HighScoreId {
  return typeof value === 'string' && value.length > 0;
}

// Factory functions for creating branded types
export function createPlayerId(value: string): PlayerId {
  if (!isPlayerId(value)) {
    throw new Error('Invalid PlayerId');
  }
  return value as PlayerId;
}

export function createSessionId(value: string): SessionId {
  if (!isSessionId(value)) {
    throw new Error('Invalid SessionId');
  }
  return value as SessionId;
}

export function createHighScoreId(value: string): HighScoreId {
  if (!isHighScoreId(value)) {
    throw new Error('Invalid HighScoreId');
  }
  return value as HighScoreId;
}

// Utility type for making properties of a type required
export type RequiredKeys<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Utility type for making properties of a type optional
export type OptionalKeys<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Strict event types
export type StrictKeyboardEvent = KeyboardEvent & {
  readonly key: string;
  readonly code: string;
};

export type StrictMouseEvent = MouseEvent & {
  readonly clientX: number;
  readonly clientY: number;
};

export type StrictTouchEvent = TouchEvent & {
  readonly touches: TouchList;
  readonly targetTouches: TouchList;
};

// Type guards for events
export function isStrictKeyboardEvent(event: Event): event is StrictKeyboardEvent {
  return event.type.includes('key') && 'key' in event && 'code' in event;
}

export function isStrictMouseEvent(event: Event): event is StrictMouseEvent {
  return event.type.includes('mouse') && 'clientX' in event && 'clientY' in event;
}

export function isStrictTouchEvent(event: Event): event is StrictTouchEvent {
  return event.type.includes('touch') && 'touches' in event;
}
