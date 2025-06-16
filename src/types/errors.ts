/**
 * Simplified Error Type Definitions
 * 
 * Streamlined error handling focused on practical game needs
 */

// Core error levels (simplified from 4 to 3)
export type ErrorLevel = 'low' | 'medium' | 'high';

// Essential error categories for Tetris game
export type ErrorCategory = 'game' | 'audio' | 'ui' | 'storage';

// Simplified error context
export interface ErrorContext {
  component?: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

// Essential error information
export interface ErrorInfo {
  id: string;
  level: ErrorLevel;
  category: ErrorCategory;
  message: string;
  context: ErrorContext;
  userMessage: string | undefined;
}

// Simplified base error class
export class GameAppError extends Error {
  public readonly id: string;
  public readonly level: ErrorLevel;
  public readonly category: ErrorCategory;
  public readonly context: ErrorContext;
  public readonly userMessage: string | undefined;

  constructor(
    message: string,
    userMessage: string | undefined,
    level: ErrorLevel = 'medium',
    category: ErrorCategory = 'game',
    context: Partial<ErrorContext> = {}
  ) {
    super(message);
    
    this.name = 'GameAppError';
    this.id = `${category}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    this.level = level;
    this.category = category;
    this.context = {
      timestamp: Date.now(),
      ...context,
    };
    this.userMessage = userMessage;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  public toErrorInfo(): ErrorInfo {
    return {
      id: this.id,
      level: this.level,
      category: this.category,
      message: this.message,
      context: this.context,
      userMessage: this.userMessage,
    };
  }

  public override toString(): string {
    return `[${this.level.toUpperCase()}] ${this.category}: ${this.message}`;
  }
}

// Simplified error factory functions
export const createGameError = (message: string, context?: Partial<ErrorContext>, userMessage?: string) =>
  new GameAppError(message, userMessage, 'medium', 'game', context);

export const createAudioError = (message: string, context?: Partial<ErrorContext>, userMessage?: string) =>
  new GameAppError(message, userMessage, 'low', 'audio', context);

export const createUIError = (message: string, context?: Partial<ErrorContext>, userMessage?: string) =>
  new GameAppError(message, userMessage, 'medium', 'ui', context);

export const createStorageError = (message: string, context?: Partial<ErrorContext>, userMessage?: string) =>
  new GameAppError(message, userMessage, 'high', 'storage', context);

// Simplified error handling
export type ErrorHandler = (error: GameAppError) => void;

// Essential error actions for store
export type ErrorAction = 
  | { type: 'ADD_ERROR'; error: ErrorInfo }
  | { type: 'DISMISS_ERROR'; errorId: string }
  | { type: 'CLEAR_ERRORS' };

// Essential error configuration
export interface ErrorConfig {
  showNotifications: boolean;
  maxStoredErrors: number;
}

export const DEFAULT_ERROR_CONFIG: ErrorConfig = {
  showNotifications: true,
  maxStoredErrors: 20,
} as const;

// Error level priority
export const ERROR_LEVEL_PRIORITY: Record<ErrorLevel, number> = {
  low: 1,
  medium: 2,
  high: 3,
} as const;
