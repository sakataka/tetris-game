/**
 * Strict Event Handler Types
 *
 * Type-safe event handlers for game controls and UI interactions
 */

import { KeyBinding, VirtualControl } from './tetris';

// Game-specific keyboard events
export type GameKey = keyof KeyBinding;

export interface GameKeyboardEvent extends KeyboardEvent {
  readonly key: string;
  readonly code: string;
  readonly gameKey?: GameKey;
}

// Touch control events
export interface GameTouchEvent extends TouchEvent {
  readonly control: VirtualControl;
  readonly touchId: number;
}

// Mouse events for game interaction
export interface GameMouseEvent extends MouseEvent {
  readonly gameX?: number;
  readonly gameY?: number;
  readonly boardX?: number;
  readonly boardY?: number;
}

// Custom game events
export interface GameStateChangeEvent extends CustomEvent {
  detail: {
    previousState: string;
    currentState: string;
    timestamp: number;
  };
}

export interface ScoreUpdateEvent extends CustomEvent {
  detail: {
    previousScore: number;
    currentScore: number;
    delta: number;
    reason: 'line_clear' | 'piece_land' | 'hard_drop' | 'tetris';
  };
}

export interface LevelChangeEvent extends CustomEvent {
  detail: {
    previousLevel: number;
    currentLevel: number;
    linesCleared: number;
  };
}

// Event handler types
export type GameKeyHandler = (event: GameKeyboardEvent) => void;
export type GameTouchHandler = (event: GameTouchEvent) => void;
export type GameMouseHandler = (event: GameMouseEvent) => void;
export type GameStateHandler = (event: GameStateChangeEvent) => void;
export type ScoreUpdateHandler = (event: ScoreUpdateEvent) => void;
export type LevelChangeHandler = (event: LevelChangeEvent) => void;

// Generic event handler with proper typing
export type StrictEventHandler<E extends Event> = (event: E) => void;

// Event listener options with proper typing
export interface StrictEventListenerOptions extends AddEventListenerOptions {
  readonly passive?: boolean;
  readonly capture?: boolean;
  readonly once?: boolean;
  readonly signal?: AbortSignal;
}

// Type-safe event listener registration
export interface TypedEventTarget<EventMap extends Record<string, Event>> {
  addEventListener<K extends keyof EventMap>(
    type: K,
    listener: (event: EventMap[K]) => void,
    options?: StrictEventListenerOptions
  ): void;

  removeEventListener<K extends keyof EventMap>(
    type: K,
    listener: (event: EventMap[K]) => void,
    options?: StrictEventListenerOptions
  ): void;

  dispatchEvent<K extends keyof EventMap>(event: EventMap[K]): boolean;
}

// Game event map
export interface GameEventMap {
  gameKeyDown: GameKeyboardEvent;
  gameKeyUp: GameKeyboardEvent;
  gameTouchStart: GameTouchEvent;
  gameTouchEnd: GameTouchEvent;
  gameMouseDown: GameMouseEvent;
  gameMouseUp: GameMouseEvent;
  gameStateChange: GameStateChangeEvent;
  scoreUpdate: ScoreUpdateEvent;
  levelChange: LevelChangeEvent;
}

// Helper function to create type-safe event handlers
export function createEventHandler<E extends Event>(
  handler: StrictEventHandler<E>
): StrictEventHandler<E> {
  return (event: E) => {
    try {
      handler(event);
    } catch (error) {
      console.error('Event handler error:', error);
    }
  };
}

// Type guard for game keyboard events
export function isGameKeyboardEvent(event: Event): event is GameKeyboardEvent {
  return event instanceof KeyboardEvent && 'key' in event && 'code' in event;
}

// Type guard for game touch events
export function isGameTouchEvent(event: Event): event is GameTouchEvent {
  return event instanceof TouchEvent && 'touches' in event;
}

// Factory function for creating custom game events
export function createGameStateChangeEvent(
  previousState: string,
  currentState: string
): GameStateChangeEvent {
  return new CustomEvent('gameStateChange', {
    detail: {
      previousState,
      currentState,
      timestamp: Date.now(),
    },
  }) as GameStateChangeEvent;
}

export function createScoreUpdateEvent(
  previousScore: number,
  currentScore: number,
  reason: ScoreUpdateEvent['detail']['reason']
): ScoreUpdateEvent {
  return new CustomEvent('scoreUpdate', {
    detail: {
      previousScore,
      currentScore,
      delta: currentScore - previousScore,
      reason,
    },
  }) as ScoreUpdateEvent;
}

export function createLevelChangeEvent(
  previousLevel: number,
  currentLevel: number,
  linesCleared: number
): LevelChangeEvent {
  return new CustomEvent('levelChange', {
    detail: {
      previousLevel,
      currentLevel,
      linesCleared,
    },
  }) as LevelChangeEvent;
}
