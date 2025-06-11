/**
 * Type definitions and custom error classes for error handling within the application
 */

// Error level definitions
export type ErrorLevel = 'info' | 'warning' | 'error' | 'critical';

// Error category definitions
export type ErrorCategory =
  | 'game'
  | 'audio'
  | 'storage'
  | 'network'
  | 'ui'
  | 'validation'
  | 'system'
  | 'unknown';

// Error context information
export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  sessionId?: string;
  timestamp: number;
  userAgent?: string;
  url?: string;
  additionalData?: Record<string, unknown>;
}

// Basic structure of error information
export interface ErrorInfo {
  id: string;
  level: ErrorLevel;
  category: ErrorCategory;
  message: string;
  context: ErrorContext;
  stack?: string;
  recoverable: boolean;
  retryable: boolean;
  userMessage?: string; // User-facing display message
}

// Base custom error class
export abstract class BaseAppError extends Error {
  public readonly id: string;
  public readonly level: ErrorLevel;
  public readonly category: ErrorCategory;
  public readonly context: ErrorContext;
  public readonly recoverable: boolean;
  public readonly retryable: boolean;
  public readonly userMessage?: string;

  constructor(
    message: string,
    level: ErrorLevel = 'error',
    category: ErrorCategory = 'unknown',
    context: Partial<ErrorContext> = {},
    options: {
      recoverable?: boolean;
      retryable?: boolean;
      userMessage?: string;
      cause?: Error;
    } = {}
  ) {
    super(message, { cause: options.cause });

    this.name = this.constructor.name;
    this.id = this.generateErrorId();
    this.level = level;
    this.category = category;
    this.context = {
      timestamp: Date.now(),
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      ...context,
    };
    this.recoverable = options.recoverable ?? true;
    this.retryable = options.retryable ?? false;
    this.userMessage = options.userMessage;

    // Set up stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  private generateErrorId(): string {
    return `${this.constructor.name}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  public toErrorInfo(): ErrorInfo {
    return {
      id: this.id,
      level: this.level,
      category: this.category,
      message: this.message,
      context: this.context,
      stack: this.stack,
      recoverable: this.recoverable,
      retryable: this.retryable,
      userMessage: this.userMessage,
    };
  }

  public toString(): string {
    return `[${this.level.toUpperCase()}] ${this.category}/${this.name}: ${this.message}`;
  }
}

// Game-related errors
export class GameError extends BaseAppError {
  constructor(
    message: string,
    context: Partial<ErrorContext> = {},
    options: {
      recoverable?: boolean;
      retryable?: boolean;
      userMessage?: string;
      cause?: Error;
    } = {}
  ) {
    super(message, 'error', 'game', context, {
      recoverable: true,
      userMessage: 'An error occurred during game processing',
      ...options,
    });
  }
}

// Audio-related errors
export class AudioError extends BaseAppError {
  constructor(
    message: string,
    context: Partial<ErrorContext> = {},
    options: {
      recoverable?: boolean;
      retryable?: boolean;
      userMessage?: string;
      cause?: Error;
    } = {}
  ) {
    super(message, 'warning', 'audio', context, {
      recoverable: true,
      retryable: true,
      userMessage: 'Failed to play audio',
      ...options,
    });
  }
}

// Storage-related errors
export class StorageError extends BaseAppError {
  constructor(
    message: string,
    context: Partial<ErrorContext> = {},
    options: {
      recoverable?: boolean;
      retryable?: boolean;
      userMessage?: string;
      cause?: Error;
    } = {}
  ) {
    super(message, 'warning', 'storage', context, {
      recoverable: true,
      retryable: false,
      userMessage: 'Failed to save data',
      ...options,
    });
  }
}

// Network-related errors
export class NetworkError extends BaseAppError {
  constructor(
    message: string,
    context: Partial<ErrorContext> = {},
    options: {
      recoverable?: boolean;
      retryable?: boolean;
      userMessage?: string;
      cause?: Error;
    } = {}
  ) {
    super(message, 'error', 'network', context, {
      recoverable: true,
      retryable: true,
      userMessage: 'A network error occurred',
      ...options,
    });
  }
}

// UI-related errors
export class UIError extends BaseAppError {
  constructor(
    message: string,
    context: Partial<ErrorContext> = {},
    options: {
      recoverable?: boolean;
      retryable?: boolean;
      userMessage?: string;
      cause?: Error;
    } = {}
  ) {
    super(message, 'warning', 'ui', context, {
      recoverable: true,
      retryable: false,
      userMessage: 'An error occurred in screen display',
      ...options,
    });
  }
}

// Validation-related errors
export class ValidationError extends BaseAppError {
  constructor(
    message: string,
    context: Partial<ErrorContext> = {},
    options: {
      recoverable?: boolean;
      retryable?: boolean;
      userMessage?: string;
      cause?: Error;
    } = {}
  ) {
    super(message, 'warning', 'validation', context, {
      recoverable: true,
      retryable: false,
      userMessage: 'Input data is incorrect',
      ...options,
    });
  }
}

// System-related errors (critical)
export class SystemError extends BaseAppError {
  constructor(
    message: string,
    context: Partial<ErrorContext> = {},
    options: {
      recoverable?: boolean;
      retryable?: boolean;
      userMessage?: string;
      cause?: Error;
    } = {}
  ) {
    super(message, 'critical', 'system', context, {
      recoverable: false,
      retryable: false,
      userMessage: 'A system error occurred. Please reload the page',
      ...options,
    });
  }
}

// Type for error handling results
export interface ErrorHandlingResult {
  handled: boolean;
  retry?: boolean;
  fallback?: () => void;
  userNotification?: {
    message: string;
    level: ErrorLevel;
    duration?: number;
  };
}

// Error handler type
export type ErrorHandler = (error: BaseAppError) => ErrorHandlingResult;

// Action type for when errors occur
export interface ErrorAction {
  type: 'ERROR_OCCURRED' | 'ERROR_RESOLVED' | 'ERROR_DISMISSED' | 'ERRORS_CLEARED';
  payload?: {
    error?: ErrorInfo;
    errorId?: string;
  };
}

// Error statistics information
export interface ErrorStats {
  totalErrors: number;
  errorsByCategory: Record<ErrorCategory, number>;
  errorsByLevel: Record<ErrorLevel, number>;
  recentErrors: ErrorInfo[];
  lastErrorTime?: number;
}

// Error report configuration
export interface ErrorReportConfig {
  enableConsoleLogging: boolean;
  enableUserNotifications: boolean;
  enableErrorStats: boolean;
  enableStackTrace: boolean;
  maxStoredErrors: number;
  autoReportCritical: boolean;
}

// Default error report configuration
export const DEFAULT_ERROR_CONFIG: ErrorReportConfig = {
  enableConsoleLogging: process.env.NODE_ENV === 'development',
  enableUserNotifications: true,
  enableErrorStats: true,
  enableStackTrace: process.env.NODE_ENV === 'development',
  maxStoredErrors: 50,
  autoReportCritical: true,
} as const;

// Error level priority (higher numbers indicate higher priority)
export const ERROR_LEVEL_PRIORITY: Record<ErrorLevel, number> = {
  info: 1,
  warning: 2,
  error: 3,
  critical: 4,
} as const;

// Localization support for error messages
export interface LocalizedErrorMessages {
  [key: string]: {
    ja: string;
    en: string;
    zh: string;
    ko: string;
  };
}

// Commonly used error messages
export const COMMON_ERROR_MESSAGES: LocalizedErrorMessages = {
  NETWORK_TIMEOUT: {
    ja: 'ネットワークがタイムアウトしました',
    en: 'Network timeout occurred',
    zh: '网络超时',
    ko: '네트워크 타임아웃이 발생했습니다',
  },
  INVALID_INPUT: {
    ja: '入力が正しくありません',
    en: 'Invalid input provided',
    zh: '输入无效',
    ko: '잘못된 입력입니다',
  },
  PERMISSION_DENIED: {
    ja: '権限がありません',
    en: 'Permission denied',
    zh: '权限被拒绝',
    ko: '권한이 거부되었습니다',
  },
  RESOURCE_NOT_FOUND: {
    ja: 'リソースが見つかりません',
    en: 'Resource not found',
    zh: '资源未找到',
    ko: '리소스를 찾을 수 없습니다',
  },
  UNEXPECTED_ERROR: {
    ja: '予期しないエラーが発生しました',
    en: 'An unexpected error occurred',
    zh: '发生了意外错误',
    ko: '예상치 못한 오류가 발생했습니다',
  },
} as const;
